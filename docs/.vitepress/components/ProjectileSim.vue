<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🎯 3D 斜方投射（放物運動）インタラクティブ実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#10b981">Three.js 3D Interactive</span>
        <span class="sim-badge">水平等速 × 鉛直投げ上げ</span>
      </div>
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
          :class="{ active: activeCam === 'side' }"
          @click="setCameraPreset('side')"
        >
          📐 真横視点 (放物線軌道)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 真上視点 (水平等速運動の確認)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : (isFinished ? '🔄 もう一度発射' : '🚀 発射！') }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨・観察)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>合成速度 <b>v</b></span>
        <span class="legend-item"><i class="dot-vx"></i>水平成分 <b>v<sub>x</sub></b> (一定)</span>
        <span class="legend-item"><i class="dot-vy"></i>鉛直成分 <b>v<sub>y</sub></b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-grid">
      <div class="control-item">
        <label>
          <span>初速度 <i>v</i><sub>0</sub>:</span> <strong>{{ v0 }} m/s</strong>
        </label>
        <input type="range" v-model.number="v0" min="5" max="35" step="1" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          <span>発射角 θ:</span> <strong>{{ angle }}°</strong>
        </label>
        <input type="range" v-model.number="angle" min="5" max="85" step="1" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          <span>重力加速度 <i>g</i>:</span> <strong>{{ g }} m/s²</strong>
        </label>
        <input type="range" v-model.number="g" min="1.6" max="25" step="0.1" @input="onParamChange" />
      </div>
    </div>

    <!-- 惑星プリセットボタン -->
    <div class="preset-buttons">
      <span class="preset-label-sub">重力プリセット:</span>
      <button :class="{ active: g === 9.8 }" @click="setGravity(9.8)">🌍 地球 (9.8)</button>
      <button :class="{ active: g === 1.62 }" @click="setGravity(1.62)">🌕 月 (1.62)</button>
      <button :class="{ active: g === 3.72 }" @click="setGravity(3.72)">🔴 火星 (3.72)</button>
    </div>

    <!-- 表示オプション -->
    <div class="action-buttons" style="justify-content: flex-start; padding: 6px 0;">
      <label class="toggle-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1; font-size: 0.9rem; margin-left: 0;">
        <input type="checkbox" v-model="showVectors" />
        📐 3D 速度ベクトル（合成 <i>v</i>・水平成分 <i>v<sub>x</sub></i>・鉛直成分 <i>v<sub>y</sub></i>）を表示
      </label>
    </div>

    <!-- 理論値データ表示カード -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">滞空時間 <i>T</i></div>
        <div class="stat-value">{{ theoreticalTime.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula"><span class="frac"><span class="num">2<i>v</i>₀ sinθ</span><span class="den"><i>g</i></span></span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最高到達点 <i>H</i></div>
        <div class="stat-value" style="color:#f43f5e">{{ maxHeight.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula"><span class="frac"><span class="num"><i>v</i>₀² sin²θ</span><span class="den">2<i>g</i></span></span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">水平到達距離 <i>R</i></div>
        <div class="stat-value" style="color:#f59e0b">{{ maxDistance.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula"><span class="frac"><span class="num"><i>v</i>₀² sin 2θ</span><span class="den"><i>g</i></span></span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjects = null

const timeScale = ref(0.5)
const v0 = ref(20)
const angle = ref(45)
const g = ref(9.8)
const showVectors = ref(true)
const activeCam = ref('3d')

const isPlaying = ref(true)
const isFinished = ref(false)
let simT = 0.85 // 初期状態で放物線の途中から美しく見えるようにスタート
let pauseTimer = 0

// 理論値の計算
const rad = computed(() => (angle.value * Math.PI) / 180)
const vx0 = computed(() => v0.value * Math.cos(rad.value))
const vy0 = computed(() => v0.value * Math.sin(rad.value))

const theoreticalTime = computed(() => (2 * vy0.value) / g.value)
const maxHeight = computed(() => (vy0.value * vy0.value) / (2 * g.value))
const maxDistance = computed(() => (v0.value * v0.value * Math.sin(2 * rad.value)) / g.value)

// 3D空間スケーリング:
// 放物線が常に 3D ステージ [-5.2 .. +5.2] に心地よく収まるよう動的・適応スケールを計算
const worldScale = computed(() => {
  const maxSpan = Math.max(25, Math.min(120, Math.max(maxDistance.value, maxHeight.value * 2.1)))
  return 10.2 / maxSpan
})
const startWorldX = -5.1

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.15, 1.68 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.4, 5.6 * s, 14.5 * s], [0, 1.7, 0], duration, 42)
  } else if (preset === 'side') {
    threeCtx.moveCameraTo([0, 1.9, 46.0 * s], [0, 1.9, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 46.0 * s, 0.01], [0, 0, 0], duration, 14)
  }
}

const setGravity = (val) => {
  g.value = val
  onParamChange()
}

const onParamChange = () => {
  simT = 0
  pauseTimer = 0
  isFinished.value = false
  isPlaying.value = true
  rebuildStaticTrajectory()
  updateFrame()
}

const resetSim = () => {
  simT = 0
  pauseTimer = 0
  isFinished.value = false
  isPlaying.value = false
  rebuildStaticTrajectory()
  updateFrame()
}

const togglePlay = () => {
  if (isFinished.value) {
    simT = 0
    pauseTimer = 0
    isFinished.value = false
    isPlaying.value = true
    return
  }
  isPlaying.value = !isPlaying.value
}

const stepForward = () => {
  isPlaying.value = false
  if (isFinished.value) {
    simT = 0
    isFinished.value = false
  }
  const totalT = Math.max(0.1, theoreticalTime.value)
  simT = Math.min(totalT, simT + 0.05)
  if (simT >= totalT) isFinished.value = true
  updateFrame()
}

function initThree() {
  if (!threeContainer.value) return
  let lastCamAspect = 0

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0.4, 5.6, 14.5],
    initialTarget: [0, 1.7, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.18) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
      }
      if (isPlaying.value) {
        const totalT = Math.max(0.08, theoreticalTime.value)
        if (!isFinished.value) {
          simT += dt * timeScale.value
          if (simT >= totalT) {
            simT = totalT
            isFinished.value = true
            pauseTimer = 0
          }
        } else {
          pauseTimer += dt
          if (pauseTimer >= 1.1) {
            simT = 0
            pauseTimer = 0
            isFinished.value = false
          }
        }
      }
      updateFrame()
    }
  })

  const { scene } = threeCtx

  // 1. 地面グリッドとステージプレート
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, -0.01, 0)
  scene.add(grid)

  const groundGeo = new THREE.PlaneGeometry(16, 8)
  groundGeo.rotateX(-Math.PI / 2)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0b1120,
    roughness: 0.85,
    metalness: 0.1,
    transparent: true,
    opacity: 0.7
  })
  const groundMesh = new THREE.Mesh(groundGeo, groundMat)
  groundMesh.position.set(0, -0.02, 0)
  scene.add(groundMesh)

  // 2. 3D ランチャー（発射砲台）
  const cannonGroup = new THREE.Group()
  cannonGroup.position.set(startWorldX, 0, 0)
  scene.add(cannonGroup)

  const baseGeo = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x1e293b,
    emissiveIntensity: 0.35,
    metalness: 0.65,
    roughness: 0.3
  })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  cannonGroup.add(baseMesh)

  const barrelPivot = new THREE.Group()
  barrelPivot.position.set(0, 0.14, 0)
  cannonGroup.add(barrelPivot)

  const barrelGeo = new THREE.CylinderGeometry(0.115, 0.145, 0.76, 20)
  barrelGeo.translate(0, 0.38, 0)
  barrelGeo.rotateZ(-Math.PI / 2) // +x 方向を向くように配置
  const barrelMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.25,
    metalness: 0.7,
    roughness: 0.2
  })
  const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat)
  barrelPivot.add(barrelMesh)

  const muzzleRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.024, 12, 24),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  )
  muzzleRing.rotation.y = Math.PI / 2
  muzzleRing.position.set(0.75, 0, 0)
  barrelPivot.add(muzzleRing)

  // 3. 静的ガイドグループ（予測放物線チューブ、最高点マーカー、着地ターゲットリング、距離目盛り）
  const staticGroup = new THREE.Group()
  scene.add(staticGroup)

  // 4. 動的オブジェクト（発光ボール、地面の影ドット、鉛直投影ライン、アクティブ軌跡、速度ベクトル3本）
  const ballGeo = new THREE.SphereGeometry(0.22, 28, 28)
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.6,
    roughness: 0.15
  })
  const ballMesh = new THREE.Mesh(ballGeo, ballMat)
  scene.add(ballMesh)

  // 地面上の影ドット（水平等速運動を可視化）
  const shadowGeo = new THREE.CircleGeometry(0.22, 24)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45
  })
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
  scene.add(shadowMesh)

  // ボールから地面の影への鉛直破線
  const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3()
  ])
  const dropLine = new THREE.Line(
    dropLineGeo,
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 })
  )
  scene.add(dropLine)

  // アクティブ軌跡ライン
  const maxTrailPts = 160
  const activeTrailGeo = new THREE.BufferGeometry()
  activeTrailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxTrailPts * 3), 3))
  const activeTrailLine = new THREE.Line(
    activeTrailGeo,
    new THREE.LineBasicMaterial({ color: 0xf59e0b })
  )
  scene.add(activeTrailLine)

  // 3D 速度ベクトル矢印 (v: 緑, vx: シアン, vy: ローズ)
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowVx = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.045, headRadius: 0.13, headLength: 0.3, opacity: 0.85 })
  const arrowVy = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.045, headRadius: 0.13, headLength: 0.3, opacity: 0.85 })
  scene.add(arrowV, arrowVx, arrowVy)

  const labelV = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 34, scale: 0.48 })
  const labelVx = createTextSprite('vx (一定)', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.46 })
  const labelVy = createTextSprite('vy', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 32, scale: 0.46 })
  scene.add(labelV, labelVx, labelVy)

  sceneObjects = {
    barrelPivot,
    staticGroup,
    ballMesh,
    shadowMesh,
    dropLine,
    activeTrailGeo,
    maxTrailPts,
    arrowV,
    arrowVx,
    arrowVy,
    labelV,
    labelVx,
    labelVy
  }

  rebuildStaticTrajectory()
  updateFrame()
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const c = group.children[0]
    group.remove(c)
    if (c.geometry) c.geometry.dispose()
    if (c.material) {
      if (Array.isArray(c.material)) c.material.forEach(m => m.dispose())
      else c.material.dispose()
    }
  }
}

function rebuildStaticTrajectory() {
  if (!sceneObjects) return
  const { barrelPivot, staticGroup } = sceneObjects
  clearGroup(staticGroup)

  barrelPivot.rotation.z = rad.value

  const sc = worldScale.value
  const totalT = Math.max(0.05, theoreticalTime.value)
  const samples = 90
  const pts = []
  const groundPts = []

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * totalT
    const x = vx0.value * t
    const y = Math.max(0, vy0.value * t - 0.5 * g.value * t * t)
    const wx = startWorldX + x * sc
    const wy = y * sc
    pts.push(new THREE.Vector3(wx, wy, 0))
    groundPts.push(new THREE.Vector3(wx, 0.01, 0))
  }

  if (pts.length > 2) {
    const curve = new THREE.CatmullRomCurve3(pts)
    const tubeGeo = new THREE.TubeGeometry(curve, 90, 0.048, 10, false)
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.62
    })
    staticGroup.add(new THREE.Mesh(tubeGeo, tubeMat))
  }

  // 地面上の水平軌道ガイドライン
  const groundLineGeo = new THREE.BufferGeometry().setFromPoints(groundPts)
  const groundLine = new THREE.Line(
    groundLineGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
  )
  staticGroup.add(groundLine)

  // 最高点 H の 3D マーカー柱 & ラベル
  const peakWx = startWorldX + (maxDistance.value / 2) * sc
  const peakWy = maxHeight.value * sc
  if (peakWy > 0.15) {
    const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, peakWy, 10)
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.55
    })
    const pillar = new THREE.Mesh(pillarGeo, pillarMat)
    pillar.position.set(peakWx, peakWy / 2, 0)
    staticGroup.add(pillar)

    const peakDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    )
    peakDot.position.set(peakWx, peakWy, 0)
    staticGroup.add(peakDot)

    const hLabel = createTextSprite(`最高点 H = ${maxHeight.value.toFixed(1)} m`, {
      color: '#fda4af',
      borderColor: '#f43f5e',
      fontSize: 32,
      scale: 0.48
    })
    hLabel.position.set(peakWx, peakWy + 1.38, -1.05)
    staticGroup.add(hLabel)
  }

  // 着地点 R の 3D ターゲットリング & ラベル
  const landWx = startWorldX + maxDistance.value * sc
  const ringGeo = new THREE.RingGeometry(0.18, 0.32, 28)
  ringGeo.rotateX(-Math.PI / 2)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    side: THREE.DoubleSide
  })
  const ringMesh = new THREE.Mesh(ringGeo, ringMat)
  ringMesh.position.set(landWx, 0.02, 0)
  staticGroup.add(ringMesh)

  const rLabel = createTextSprite(`到達距離 R = ${maxDistance.value.toFixed(1)} m`, {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 32,
    scale: 0.5
  })
  rLabel.position.set(landWx, -0.58, 1.55)
  staticGroup.add(rLabel)
}

function updateFrame() {
  if (!sceneObjects) return
  const {
    ballMesh,
    shadowMesh,
    dropLine,
    activeTrailGeo,
    maxTrailPts,
    arrowV,
    arrowVx,
    arrowVy,
    labelV,
    labelVx,
    labelVy
  } = sceneObjects

  const sc = worldScale.value
  const totalT = Math.max(0.05, theoreticalTime.value)
  const clampedT = Math.min(totalT, Math.max(0, simT))

  const curX = vx0.value * clampedT
  const curY = Math.max(0, vy0.value * clampedT - 0.5 * g.value * clampedT * clampedT)
  const curVx = vx0.value
  const curVy = vy0.value - g.value * clampedT

  const wx = startWorldX + curX * sc
  const wy = curY * sc

  ballMesh.position.set(wx, wy, 0)
  shadowMesh.position.set(wx, 0.015, 0)

  const dropAttr = dropLine.geometry.getAttribute('position')
  dropAttr.setXYZ(0, wx, wy, 0)
  dropAttr.setXYZ(1, wx, 0.015, 0)
  dropAttr.needsUpdate = true

  // アクティブ軌跡の更新
  const count = Math.max(2, Math.floor((clampedT / totalT) * (maxTrailPts - 1)))
  const posArr = activeTrailGeo.getAttribute('position').array
  for (let i = 0; i < count; i++) {
    const st = (i / (count - 1)) * clampedT
    const sx = startWorldX + vx0.value * st * sc
    const sy = Math.max(0, (vy0.value * st - 0.5 * g.value * st * st) * sc)
    posArr[i * 3] = sx
    posArr[i * 3 + 1] = sy
    posArr[i * 3 + 2] = 0
  }
  activeTrailGeo.setDrawRange(0, count)
  activeTrailGeo.getAttribute('position').needsUpdate = true

  // 3D 速度ベクトル表示
  if (showVectors.value) {
    const vScale = 0.085
    const origin = new THREE.Vector3(wx, wy, 0)

    // 合成速度 v (矢印の右上方向に配置して頂点付近で vx や最高点 H と重ならないように分離)
    const vVec = new THREE.Vector3(curVx, curVy, 0)
    const vLen = vVec.length() * vScale
    arrowV.setVector(origin, vVec, vLen)
    labelV.visible = vLen > 0.1
    const vDir = vVec.clone().normalize()
    labelV.position.copy(origin).addScaledVector(vDir, vLen + 0.32)
    labelV.position.y += vDir.y >= -0.15 ? 0.36 : 0.08
    labelV.position.x += 0.25
    labelV.position.z += 0.15
    labelV.position.y = Math.max(0.45, labelV.position.y)

    // 水平成分 vx (ボール真下〜右下に配置して v と分離)
    const vxLen = Math.abs(curVx) * vScale
    arrowVx.setVector(origin, new THREE.Vector3(Math.sign(curVx), 0, 0), vxLen)
    labelVx.visible = vxLen > 0.12
    labelVx.position.set(wx + vxLen * 0.65, Math.max(0.28, wy - 0.48), 0.85)

    // 鉛直成分 vy (ボール左側に配置して v, vx, 最高点H と分離)
    const vyLen = Math.abs(curVy) * vScale
    if (vyLen > 0.08) {
      const vySign = Math.sign(curVy)
      arrowVy.setVector(origin, new THREE.Vector3(0, vySign, 0), vyLen)
      labelVy.visible = true
      labelVy.position.set(wx - 0.62, Math.max(0.28, wy + vySign * (vyLen + 0.32)), -0.65)
    } else {
      arrowVy.visible = false
      labelVy.visible = false
    }
  } else {
    arrowV.visible = false
    arrowVx.visible = false
    arrowVy.visible = false
    labelV.visible = false
    labelVx.visible = false
    labelVy.visible = false
  }
}

watch(showVectors, () => {
  updateFrame()
})

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
  border-radius: 14px;
  padding: 20px;
  margin: 24px 0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  color: #f8fafc;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.sim-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #38bdf8;
}
.sim-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
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
.playback-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.speed-label {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
}
.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.speed-btn-group button {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}
.speed-btn-group button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 400px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
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
  gap: 12px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.76rem;
  color: #e2e8f0;
  pointer-events: none;
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
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-vx { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-vy { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
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
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.control-item {
  background: #1e293b;
  padding: 12px 16px;
  border-radius: 8px;
}
.control-item label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 8px;
}
.control-item strong {
  color: #38bdf8;
}
.control-item input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
}
.preset-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.preset-label-sub {
  font-size: 0.85rem;
  color: #94a3b8;
}
.preset-buttons button {
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.preset-buttons button:hover {
  background: #334155;
}
.preset-buttons button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}
.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary {
  background: #0284c7;
  color: white;
}
.btn-secondary {
  background: #334155;
  color: #f1f5f9;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.stat-card {
  background: #1e293b;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #334155;
}
.stat-card.highlight {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}
.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 4px 0;
}
.stat-value .unit {
  font-size: 0.8rem;
  font-weight: 400;
  color: #94a3b8;
}
.stat-formula {
  font-size: 0.75rem;
  color: #64748b;
}
@media (max-width: 768px) {
  .sim-container {
    padding: 12px;
  }
  .three-viewport-wrap {
    height: 320px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.7rem;
  }
  .speed-control-group {
    border-radius: 12px !important;
    padding: 6px 10px !important;
    flex-wrap: wrap !important;
    width: 100%;
  }
  .speed-btn-group {
    flex-wrap: wrap !important;
  }
}
</style>
