<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎱</span>
        <h3>3D ガルペリンのビリヤード（2物体の完全弾性衝突と円周率 π）シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        壁と小物体 A（質量 <i>m</i>）、大物体 B（質量 <i>M</i> = 100<sup><i>k</i></sup><i>m</i>）の完全弾性衝突において、
        総衝突回数が 3, 31, 314, 3141... と円周率 π の桁数を刻む神秘の数理物理現象。
        実空間での3D衝突（左）と、エネルギー保存則が描く3D相空間の真円 <i>X</i>² + <i>Y</i>² = <i>R</i>² における幾何学的等角反射（右）を完全同期描画します。
      </p>
    </div>

    <div class="pi-badge-bar">
      <span>総衝突回数: <strong class="counter">{{ collisionCount }}</strong> 回</span>
      <span class="separator">/</span>
      <span>理論値: <strong>{{ theoreticalN }}</strong> 回</span>
      <span class="status-tag" :class="{ finished: isTerminated }">
        {{ isTerminated ? '✅ 衝突終了 (0 ≤ v ≤ V)' : '⚡ 衝突進行中...' }}
      </span>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="cam-chip"
          :class="{ active: activeCam === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🎥 3D 俯瞰視点
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面視点 (実空間＋相空間円)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点 (衝突トラック)
        </button>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-a"></i>小物体 A (<b>m</b>)</span>
        <span class="legend-item"><i class="dot-b"></i>大物体 B (<b>M</b>)</span>
        <span class="legend-item"><i class="dot-v"></i>速度ベクトル <b>v</b></span>
        <span class="legend-item"><i class="dot-p"></i>相空間弦 <b>X²+Y²=R²</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group ctrl-block">
          <span class="ctrl-title">質量比 <i>M</i>/<i>m</i> プリセット選択:</span>
          <div class="btn-group flex-wrap">
            <button
              v-for="preset in presets"
              :key="preset.k"
              class="select-btn"
              :class="{ active: currentPreset.k === preset.k }"
              @click="selectPreset(preset)"
            >
              {{ preset.label }} (N = {{ preset.expectedN }})
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>再生シミュレーション速度: <strong>{{ playbackSpeed }}x</strong></span>
            <input type="range" v-model.number="playbackSpeed" min="1" max="50" step="1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="stepCollision" :disabled="isTerminated">
          ⏭ 1衝突進める
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 リセット
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">質量比 <i>M</i>/<i>m</i></span>
        <span class="value">{{ currentPreset.massRatio }}</span>
        <span class="subtext">θ = arctan(√(m/M))</span>
      </div>

      <div class="stat-card">
        <span class="label">反射角ステップ <i>θ</i></span>
        <span class="value highlight">{{ (thetaRad * 180 / Math.PI).toFixed(2) }}°</span>
        <span class="subtext">{{ thetaRad.toFixed(5) }} rad</span>
      </div>

      <div class="stat-card">
        <span class="label">半周あたりの分割数 π/<i>θ</i></span>
        <span class="value highlight">{{ (Math.PI / thetaRad).toFixed(3) }}</span>
        <span class="subtext">N = ⌊π/θ⌋ (または π/θ - 1)</span>
      </div>

      <div class="stat-card">
        <span class="label">円周率 π の近似桁</span>
        <span class="value pi-val">{{ collisionCount.toString() }}</span>
        <span class="subtext">理論値 π = 3.14159265...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjects = null

const activeCam = ref('3d')

const presets = [
  { k: 0, label: 'M = m (k=0)', massRatio: 1, expectedN: 3 },
  { k: '3m', label: 'M = 3m (特別)', massRatio: 3, expectedN: 5 },
  { k: 1, label: 'M = 100m (k=1)', massRatio: 100, expectedN: 31 },
  { k: 2, label: 'M = 10000m (k=2)', massRatio: 10000, expectedN: 314 }
]

const currentPreset = ref(presets[2]) // 初期値 M = 100m (N = 31)
const playbackSpeed = ref(4)
const isRunning = ref(true)

// 物理パラメータ
const massA = 1.0
const massB = computed(() => massA * currentPreset.value.massRatio)
const thetaRad = computed(() => Math.atan(Math.sqrt(massA / massB.value)))
const theoreticalN = computed(() => {
  const ratio = Math.PI / thetaRad.value
  return Math.abs(ratio - Math.round(ratio)) < 1e-7 ? Math.round(ratio) - 1 : Math.floor(ratio)
})

// 状態変数
let posA = 3.0
let posB = 7.0
let velA = 0.0
let velB = -1.0
const collisionCount = ref(0)
const isTerminated = ref(false)
let phasePoints = []
let simAccumTime = 0
let endPauseTimer = 0
let impactPulse = 0
let impactPosX = -5.8

let lastAspect = 0

function getMobileScale() {
  if (!threeContainer.value) return 1.0
  const aspect = threeContainer.value.clientWidth / Math.max(1, threeContainer.value.clientHeight)
  return aspect < 1.25 ? Math.max(1.25, 1.48 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (sceneObjects) {
    sceneObjects.phaseGroup.visible = preset !== 'top'
    sceneObjects.leftTitle.position.set(-3.1, 4.48, preset === 'top' ? -1.55 : 0)
  }
  if (!threeCtx) return
  lastAspect = threeCtx.camera.aspect || 1.7
  const ms = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.1, 5.2 * ms, 15.8 * ms], [0, 1.55, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 1.85, 50.0 * ms], [0, 1.85, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([-3.1, 28.0 * ms, 0.01], [-3.1, 0, 0], duration, 14)
  }
}

function computeNextEventTime() {
  if (velA >= -1e-9 && velB >= velA - 1e-9) return Infinity
  let dtWall = Infinity
  if (velA < -1e-9) dtWall = -posA / velA
  let dtAB = Infinity
  const relV = velA - velB
  if (relV > 1e-9) dtAB = (posB - posA) / relV
  return Math.min(dtWall, dtAB)
}

function resetSim() {
  posA = 3.0
  posB = 7.0
  velA = 0.0
  velB = -1.0
  collisionCount.value = 0
  isTerminated.value = false
  simAccumTime = 0
  endPauseTimer = 0
  impactPulse = 0

  const X0 = Math.sqrt(massB.value) * velB
  const Y0 = Math.sqrt(massA) * velA
  phasePoints = [{ X: X0, Y: Y0 }]

  rebuildPhaseWedge()
  syncScene()
}

function selectPreset(preset) {
  currentPreset.value = preset
  resetSim()
}

function togglePlay() {
  if (isTerminated.value) {
    resetSim()
    isRunning.value = true
  } else {
    isRunning.value = !isRunning.value
  }
}

// 3D座標定数
const wallFaceX = -5.85
const realScale = 0.36
const sizeA = 0.62
const sizeB = 1.08
const phaseCx = 3.35
const phaseCy = 1.85
const phaseR = 1.78

function advanceNextCollision() {
  if (isTerminated.value) return

  if (velA >= -1e-9 && velB >= velA - 1e-9) {
    isTerminated.value = true
    return
  }

  let dtWall = Infinity
  if (velA < -1e-9) {
    dtWall = -posA / velA
  }

  let dtAB = Infinity
  const relV = velA - velB
  if (relV > 1e-9) {
    dtAB = (posB - posA) / relV
  }

  if (dtWall === Infinity && dtAB === Infinity) {
    isTerminated.value = true
    return
  }

  if (dtWall <= dtAB && dtWall < Infinity) {
    posA = 0
    posB += velB * dtWall
    velA = -velA
    collisionCount.value++
    impactPulse = 1.0
    impactPosX = wallFaceX
  } else if (dtAB < Infinity) {
    posA += velA * dtAB
    posB = posA
    const mA = massA
    const mB = massB.value
    const vA_next = ((mA - mB) * velA + 2 * mB * velB) / (mA + mB)
    const vB_next = (2 * mA * velA + (mB - mA) * velB) / (mA + mB)
    velA = vA_next
    velB = vB_next
    collisionCount.value++
    impactPulse = 1.0
    impactPosX = wallFaceX + Math.min(10.0, Math.max(0, posA)) * realScale + sizeA
  }

  const X = Math.sqrt(massB.value) * velB
  const Y = Math.sqrt(massA) * velA
  phasePoints.push({ X, Y })

  if (velA >= -1e-9 && velB >= velA - 1e-9) {
    isTerminated.value = true
  }
}

function stepCollision() {
  advanceNextCollision()
  syncScene()
}

resetSim()

function initThree() {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0.1, 5.2, 15.8],
    initialTarget: [0, 1.55, 0],
    onFrame: (dt) => {
      if (threeCtx && threeCtx.camera && Math.abs(threeCtx.camera.aspect - lastAspect) > 0.08) {
        setCameraPreset(activeCam.value, 0)
      }
      if (isRunning.value) {
        if (!isTerminated.value) {
          simAccumTime += dt * playbackSpeed.value * 1.2
          if (simAccumTime >= 1.0) {
            const stepsToRun = Math.min(20, Math.floor(simAccumTime))
            for (let s = 0; s < stepsToRun; s++) {
              if (!isTerminated.value) {
                advanceNextCollision()
              }
            }
            simAccumTime -= stepsToRun
          }
        } else {
          posA = Math.min(12, posA + velA * dt * 2)
          posB = Math.min(13.5, posB + velB * dt * 2)
          endPauseTimer += dt
          if (endPauseTimer > 2.8) {
            resetSim()
          }
        }
      }
      if (impactPulse > 0) {
        impactPulse = Math.max(0, impactPulse - dt * 3.5)
      }
      syncScene()
    }
  })

  const { scene } = threeCtx

  // 1. 全体床グリッド
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, -0.02, 0)
  scene.add(grid)

  // ---------------------------------------------------
  // 左側ステージ: 3D 実空間トラック・壁・ブロック A & B
  // ---------------------------------------------------
  const trackBed = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.14, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.25 })
  )
  trackBed.position.set(-3.15, -0.07, 0)
  scene.add(trackBed)

  const railGeo = new THREE.BoxGeometry(6.2, 0.04, 0.06)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
  const railF = new THREE.Mesh(railGeo, railMat)
  railF.position.set(-3.15, 0.02, 1.1)
  const railB = new THREE.Mesh(railGeo, railMat)
  railB.position.set(-3.15, 0.02, -1.1)
  scene.add(railF, railB)

  // 剛体壁 x = 0 (wallFaceX = -5.85)
  const wallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 1.9, 2.35),
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25,
      metalness: 0.45,
      roughness: 0.35
    })
  )
  wallMesh.position.set(wallFaceX - 0.16, 0.95, 0)
  scene.add(wallMesh)

  const leftTitle = createTextSprite('実空間 (x軸上の完全弾性衝突)', {
    color: '#e2e8f0',
    borderColor: '#475569',
    fontSize: 32,
    scale: 0.48
  })
  leftTitle.position.set(-3.1, 4.48, 0)
  scene.add(leftTitle)

  const wallLabel = createTextSprite('壁 x = 0', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 30,
    scale: 0.42
  })
  wallLabel.position.set(wallFaceX + 0.15, 2.35, 1.38)
  scene.add(wallLabel)

  // 小物体 A (質量 m)
  const blockAGeo = new THREE.BoxGeometry(sizeA, sizeA, sizeA)
  const blockAMesh = new THREE.Mesh(
    blockAGeo,
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.35,
      metalness: 0.35,
      roughness: 0.25
    })
  )
  scene.add(blockAMesh)
  blockAMesh.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(blockAGeo),
    new THREE.LineBasicMaterial({ color: 0xa5f3fc })
  ))

  const labelA = createTextSprite('A (m=1)', {
    color: '#67e8f9',
    borderColor: '#22d3ee',
    fontSize: 30,
    scale: 0.42
  })
  scene.add(labelA)

  // 大物体 B (質量 M)
  const blockBGeo = new THREE.BoxGeometry(sizeB, sizeB, sizeB)
  const blockBMesh = new THREE.Mesh(
    blockBGeo,
    new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.35,
      metalness: 0.35,
      roughness: 0.25
    })
  )
  scene.add(blockBMesh)
  blockBMesh.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(blockBGeo),
    new THREE.LineBasicMaterial({ color: 0xf9a8d4 })
  ))

  const labelB = createTextSprite('B (M=100m)', {
    color: '#f9a8d4',
    borderColor: '#ec4899',
    fontSize: 32,
    scale: 0.46
  })
  scene.add(labelB)

  // 速度ベクトル矢印 (A, B)
  const arrowVA = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.28 })
  const arrowVB = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.32 })
  scene.add(arrowVA, arrowVB)

  // 衝突衝撃リング（垂直リング）
  const sparkRingGeo = new THREE.RingGeometry(0.28, 0.42, 24)
  sparkRingGeo.rotateY(Math.PI / 2)
  const sparkRingMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  })
  const sparkRing = new THREE.Mesh(sparkRingGeo, sparkRingMat)
  scene.add(sparkRing)

  // ---------------------------------------------------
  // 右側ステージ: 3D ホログラフィック相空間円 X² + Y² = R²
  // ---------------------------------------------------
  const phaseGroup = new THREE.Group()
  scene.add(phaseGroup)

  const rightTitle = createTextSprite('相空間 (エネルギー保存円 X² + Y² = R²)', {
    color: '#e2e8f0',
    borderColor: '#38bdf8',
    fontSize: 32,
    scale: 0.48
  })
  rightTitle.position.set(phaseCx, 4.48, 0)
  phaseGroup.add(rightTitle)

  // 相空間パネル背景ディスク
  const discMesh = new THREE.Mesh(
    new THREE.CircleGeometry(phaseR + 0.18, 64),
    new THREE.MeshBasicMaterial({
      color: 0x0b1324,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    })
  )
  discMesh.position.set(phaseCx, phaseCy, -0.05)
  phaseGroup.add(discMesh)

  // 相空間の台座リング（上面視点でも見えるホログラム投影台）
  const pedGeo = new THREE.RingGeometry(0.95, 1.35, 36)
  pedGeo.rotateX(-Math.PI / 2)
  const pedMesh = new THREE.Mesh(
    pedGeo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  )
  pedMesh.position.set(phaseCx, 0.01, 0)
  phaseGroup.add(pedMesh)

  // エネルギー保存円リング
  const circlePts = []
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2
    circlePts.push(new THREE.Vector3(phaseCx + phaseR * Math.cos(a), phaseCy + phaseR * Math.sin(a), 0))
  }
  const circleLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circlePts),
    new THREE.LineBasicMaterial({ color: 0x64748b })
  )
  phaseGroup.add(circleLine)

  // X軸・Y軸矢印
  const xAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.02, headRadius: 0.07, headLength: 0.18 })
  xAxis.setVector(
    new THREE.Vector3(phaseCx - phaseR - 0.3, phaseCy, 0.01),
    new THREE.Vector3(1, 0, 0),
    phaseR * 2 + 0.65
  )
  const yAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.02, headRadius: 0.07, headLength: 0.18 })
  yAxis.setVector(
    new THREE.Vector3(phaseCx, phaseCy - phaseR - 0.3, 0.01),
    new THREE.Vector3(0, 1, 0),
    phaseR * 2 + 0.65
  )
  phaseGroup.add(xAxis, yAxis)

  const xAxisLbl = createTextSprite('X = √MV', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.35)',
    fontSize: 30,
    scale: 0.42
  })
  xAxisLbl.position.set(phaseCx + phaseR + 0.12, phaseCy - 0.42, 0.05)
  const yAxisLbl = createTextSprite('Y = √mv', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.35)',
    fontSize: 30,
    scale: 0.42
  })
  yAxisLbl.position.set(phaseCx - 0.78, phaseCy + phaseR + 0.18, 0.05)
  phaseGroup.add(xAxisLbl, yAxisLbl)

  // 終了扇形領域グループ
  const wedgeGroup = new THREE.Group()
  phaseGroup.add(wedgeGroup)

  const wedgeLabel = createTextSprite('終了扇形領域 (幅 θ)', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 30,
    scale: 0.44
  })
  wedgeLabel.position.set(phaseCx + 1.48, phaseCy + 1.32, 0.08)
  phaseGroup.add(wedgeLabel)

  // 初期点 P0 (-R, 0)
  const p0Dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  )
  p0Dot.position.set(phaseCx - phaseR, phaseCy, 0.04)
  phaseGroup.add(p0Dot)

  const p0Label = createTextSprite('P₀(-R, 0)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 30,
    scale: 0.42
  })
  p0Label.position.set(phaseCx - phaseR - 0.52, phaseCy - 0.36, 0.08)
  phaseGroup.add(p0Label)

  // 相空間の多重反射弦ライン (最大 400 点)
  const maxPhasePts = 420
  const chordGeo = new THREE.BufferGeometry()
  chordGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxPhasePts * 3), 3))
  const chordLine = new THREE.Line(
    chordGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8 })
  )
  phaseGroup.add(chordLine)

  // 現在の相空間点 P_n
  const curPhaseDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 20, 20),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75
    })
  )
  phaseGroup.add(curPhaseDot)

  const curPhaseLabel = createTextSprite('P₀', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 30,
    scale: 0.38
  })
  phaseGroup.add(curPhaseLabel)

  sceneObjects = {
    leftTitle,
    phaseGroup,
    blockAMesh,
    blockBMesh,
    labelA,
    labelB,
    arrowVA,
    arrowVB,
    sparkRing,
    sparkRingMat,
    wedgeGroup,
    chordGeo,
    maxPhasePts,
    curPhaseDot,
    curPhaseLabel
  }

  rebuildPhaseWedge()
  syncScene()
  setCameraPreset(activeCam.value, 0)
}

function rebuildPhaseWedge() {
  if (!sceneObjects) return
  const { wedgeGroup } = sceneObjects
  while (wedgeGroup.children.length > 0) {
    const c = wedgeGroup.children[0]
    wedgeGroup.remove(c)
    if (c.geometry) c.geometry.dispose()
    if (c.material) c.material.dispose()
  }

  const visualAngle = Math.max(0.032, thetaRad.value)
  const wedgeGeo = new THREE.CircleGeometry(phaseR, 32, 0, visualAngle)
  const wedgeMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  })
  const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat)
  wedgeMesh.position.set(phaseCx, phaseCy, 0.02)
  wedgeGroup.add(wedgeMesh)

  const boundaryLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(phaseCx, phaseCy, 0.03),
    new THREE.Vector3(
      phaseCx + phaseR * Math.cos(thetaRad.value),
      phaseCy + phaseR * Math.sin(thetaRad.value),
      0.03
    )
  ])
  const boundaryLine = new THREE.Line(
    boundaryLineGeo,
    new THREE.LineBasicMaterial({ color: 0x10b981 })
  )
  wedgeGroup.add(boundaryLine)
}

let lastLabelBText = ''
let lastCurPhaseText = ''

function syncScene() {
  if (!sceneObjects) return
  const {
    blockAMesh,
    blockBMesh,
    labelA,
    labelB,
    arrowVA,
    arrowVB,
    sparkRing,
    sparkRingMat,
    chordGeo,
    maxPhasePts,
    curPhaseDot,
    curPhaseLabel
  } = sceneObjects

  // 1. 実空間ブロックの補間位置
  let drawPosA = posA
  let drawPosB = posB
  if (!isTerminated.value) {
    const dtNext = computeNextEventTime()
    if (dtNext < Infinity && dtNext > 0) {
      const frac = Math.min(0.95, Math.max(0, simAccumTime))
      drawPosA = posA + velA * dtNext * frac
      drawPosB = posB + velB * dtNext * frac
    }
  }

  const clampedA = Math.min(10.0, Math.max(0, drawPosA))
  const clampedB = Math.min(11.0, Math.max(clampedA, drawPosB))

  const xA = wallFaceX + clampedA * realScale + sizeA / 2
  const xB = wallFaceX + clampedB * realScale + sizeA + sizeB / 2

  blockAMesh.position.set(xA, sizeA / 2, 0)
  blockBMesh.position.set(xB, sizeB / 2, 0)

  labelA.position.set(xA, sizeA + 0.4, 0.45)
  const labelBText = `B (M=${massB.value}m)`
  if (labelBText !== lastLabelBText) {
    lastLabelBText = labelBText
    labelB.updateText(labelBText, '#f9a8d4', '#ec4899')
  }
  labelB.position.set(xB, sizeB + 0.55, -0.35)

  // 2. 速度ベクトル矢印
  if (Math.abs(velA) > 0.05) {
    const vLenA = Math.min(1.5, Math.max(0.35, Math.abs(velA) * 0.25))
    arrowVA.setVector(
      new THREE.Vector3(xA, sizeA / 2, 0.36),
      new THREE.Vector3(Math.sign(velA), 0, 0),
      vLenA
    )
  } else {
    arrowVA.visible = false
  }

  if (Math.abs(velB) > 0.05) {
    const vLenB = Math.min(1.5, Math.max(0.4, Math.abs(velB) * 0.85))
    arrowVB.setVector(
      new THREE.Vector3(xB, sizeB / 2, 0.58),
      new THREE.Vector3(Math.sign(velB), 0, 0),
      vLenB
    )
  } else {
    arrowVB.visible = false
  }

  // 衝突衝撃リング
  if (impactPulse > 0.02) {
    sparkRing.visible = true
    sparkRing.position.set(impactPosX, 0.45, 0)
    const s = 1.0 + (1.0 - impactPulse) * 1.4
    sparkRing.scale.set(1, s, s)
    sparkRingMat.opacity = impactPulse * 0.85
  } else {
    sparkRing.visible = false
  }

  // 3. 相空間円の軌跡・現在点
  const initialR = Math.sqrt(massB.value) * 1.0
  const count = Math.min(maxPhasePts, phasePoints.length)
  const arr = chordGeo.getAttribute('position').array
  for (let i = 0; i < count; i++) {
    arr[i * 3] = phaseCx + (phasePoints[i].X / initialR) * phaseR
    arr[i * 3 + 1] = phaseCy + (phasePoints[i].Y / initialR) * phaseR
    arr[i * 3 + 2] = 0.04
  }
  chordGeo.setDrawRange(0, count)
  chordGeo.getAttribute('position').needsUpdate = true

  if (phasePoints.length > 0) {
    const lastP = phasePoints[phasePoints.length - 1]
    const px = phaseCx + (lastP.X / initialR) * phaseR
    const py = phaseCy + (lastP.Y / initialR) * phaseR
    curPhaseDot.position.set(px, py, 0.06)
    const phaseText = `P${collisionCount.value}`
    if (phaseText !== lastCurPhaseText) {
      lastCurPhaseText = phaseText
      curPhaseLabel.updateText(phaseText, '#fde68a', '#f59e0b')
    }
    curPhaseLabel.position.set(px + 0.25, py + 0.28, 0.12)
  }
}

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
  margin: 24px 0;
  color: #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.sim-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #38bdf8;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.three-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}
.subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 12px;
}
.pi-badge-bar {
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.86rem;
  color: #fef3c7;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  margin-bottom: 10px;
}
.preset-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
}
.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cam-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.cam-chip:hover {
  border-color: #38bdf8;
  color: #fff;
}
.cam-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  border-radius: 10px;
  overflow: hidden;
  background: #080c16;
  border: 1px solid #334155;
}
.three-viewport {
  width: 100%;
  height: 100%;
}
.three-hud-legend {
  position: absolute;
  top: 10px;
  left: 12px;
  max-width: calc(100% - 24px);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.76rem;
  color: #e2e8f0;
  pointer-events: none;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 290px;
  }
  .three-hud-legend {
    font-size: 0.7rem;
    gap: 8px;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.66rem;
    padding: 3px 8px;
  }
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-a { background: #22d3ee; box-shadow: 0 0 6px #22d3ee; }
.dot-b { background: #ec4899; box-shadow: 0 0 6px #ec4899; }
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-p { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.74rem;
  color: #cbd5e1;
  pointer-events: none;
}
.counter {
  font-size: 1.1rem;
  color: #fbbf24;
}
.status-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}
.status-tag.finished {
  background: rgba(16, 185, 129, 0.25);
  color: #10b981;
}
.separator {
  color: rgba(255, 255, 255, 0.3);
}
.control-panel {
  background: #1e293b;
  border-radius: 8px;
  padding: 14px;
  margin-top: 14px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}
.control-group label {
  display: flex;
  flex-direction: column;
  align-items: stretch !important;
  gap: 6px;
  font-size: 0.84rem;
  color: #cbd5e1;
}
.control-group label span {
  width: 100%;
  margin-left: 0 !important;
}
.ctrl-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ctrl-title {
  font-size: 0.84rem;
  color: #cbd5e1;
}
.control-group input[type='range'] {
  width: 100%;
  accent-color: #fbbf24;
}
.btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.select-btn {
  padding: 5px 10px;
  font-size: 0.78rem;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #334155;
  color: #cbd5e1;
  cursor: pointer;
  white-space: nowrap;
}
.select-btn.active {
  background: #d97706;
  color: #ffffff;
  border-color: #fbbf24;
}
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.btn {
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}
.btn-primary {
  background: #d97706;
  color: #ffffff;
}
.btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
}
.stat-card .label {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-bottom: 4px;
}
.stat-card .value {
  font-size: 1.15rem;
  font-weight: bold;
  color: #f8fafc;
}
.stat-card .value.highlight {
  color: #fbbf24;
}
.stat-card .value.pi-val {
  color: #ec4899;
  letter-spacing: 1px;
}
.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}
.stat-card .subtext {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: 2px;
}
</style>
