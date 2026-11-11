<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">⚖️ 3D 剛体の転倒 vs 滑り出し限界シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge badge-cyan" style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="badge" :class="stateBadgeClass">{{ stateLabel }}</span>
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
          :class="{ active: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面視点 (抗力シフト x_N・重心鉛直線)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点
        </button>
      </div>
    </div>

    <!-- 再生・アニメーションコントロールバー -->
    <div class="playback-bar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : (isFinished ? '🔄 最初から再生' : '▶ 実験スタート') }}
      </button>
      <div class="speed-control-group" style="display:flex;align-items:center;gap:6px;">
        <span class="speed-label" style="font-size:0.8rem;color:#94a3b8;">⏱️ 速度:</span>
        <div class="speed-btn-group" style="display:flex;gap:4px;">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x スロー</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x 標準</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x 高速</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り
      </button>
      <button class="btn btn-secondary" @click="resetParams" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-f"></i>外力 <b>F</b></span>
        <span class="legend-item"><i class="dot-n"></i>垂直抗力 <b>N</b> (作用点シフト)</span>
        <span class="legend-item"><i class="dot-mg"></i>重力 <b>Mg</b> (重心G)</span>
        <span class="legend-item"><i class="dot-fr"></i>摩擦力 <b>f</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">外力 F</div>
        <div class="stat-value text-blue">{{ F }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最大静止摩擦力 F_max</div>
        <div class="stat-value text-yellow">{{ maxFriction.toFixed(1) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">転倒限界外力 F_topple</div>
        <div class="stat-value text-rose">{{ toppleForce.toFixed(1) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">抗力作用点シフト x_N</div>
        <div class="stat-value" :class="Math.abs(xN) >= width_w / 2 ? 'text-rose' : 'text-cyan'">
          {{ Math.min(xN, width_w / 2).toFixed(1) }} / {{ (width_w / 2).toFixed(1) }} <span class="stat-unit">cm</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">重力の水平腕 d</div>
        <div class="stat-value" :class="arm_d_cm > 0.1 ? 'text-cyan' : (arm_d_cm < -0.1 ? 'text-rose' : 'text-yellow')">
          {{ arm_d_cm.toFixed(1) }} <span class="stat-unit">cm</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">重力のモーメント τ_G</div>
        <div class="stat-value" :class="tauG > 0.05 ? 'text-cyan' : (tauG < -0.05 ? 'text-rose' : 'text-yellow')">
          {{ Math.abs(tauG).toFixed(1) }} <span class="stat-unit">N·m</span>
          <span style="font-size: 0.7rem; display: block;">{{ tauGLabel }}</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>外力の大きさ F:</span>
            <span class="control-val">{{ F }} N</span>
          </label>
          <input type="range" v-model.number="F" min="0" max="60" step="1" class="sim-slider" @input="onParamChange" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>力の加える高さ h_F:</span>
            <span class="control-val">{{ forceHeight }} cm</span>
          </label>
          <input type="range" v-model.number="forceHeight" min="10" :max="height_h" step="2" class="sim-slider" @input="onParamChange" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>静止摩擦係数 μ_s:</span>
            <span class="control-val">{{ mu_s.toFixed(2) }}</span>
          </label>
          <input type="range" v-model.number="mu_s" min="0.1" max="1.0" step="0.05" class="sim-slider" @input="onParamChange" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>直方体の横幅 w:</span>
            <span class="control-val">{{ width_w }} cm (高さ {{ height_h }} cm)</span>
          </label>
          <input type="range" v-model.number="width_w" min="20" max="60" step="5" class="sim-slider" @input="onParamChange" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="setPreset('slide_first')" class="sim-btn outline">滑りやすい条件（低摩擦）</button>
        <button @click="setPreset('topple_first')" class="sim-btn outline">倒れやすい条件（高い位置を押す）</button>
        <button @click="resetParams" class="sim-btn secondary">🔄 初期状態に戻す</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>力学の急所</strong>:
      外力 <i>F</i> を加えると、直方体が倒れないように<strong>垂直抗力 <i>N</i> の作用点が中心から右側（押す向きの前方）へとシフト</strong>していきます。
      <ul style="margin: 6px 0 0 16px; padding: 0;">
        <li>作用点が右端（<i>x</i><sub><i>N</i></sub> = <i>w</i> / 2）に達する前に <i>F</i> &gt; <i>μ</i><sub>s</sub><i>Mg</i> になれば → <strong>「滑り出す」</strong></li>
        <li>滑り出す前に作用点が右端（<i>x</i><sub><i>N</i></sub> = <i>w</i> / 2）に達して支えきれなくなれば → <strong>「転倒する」</strong></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjects = null

const activeCam = ref('3d')
const isPlaying = ref(false)
const isFinished = ref(false)
const timeScale = ref(1.0)

// 動的シミュレーション変数
const simX = ref(0) // 水平滑走距離 (cm換算ではなく3Dスケール用px相当)
const simVx = ref(0)
const simAngle = ref(0) // 転倒角 (rad, 正で時計回り)
const simOmega = ref(0)
const bounceCount = ref(0)

// 物理パラメータ
const mass = ref(5.0) // kg
const g = 9.8 // m/s^2
const width_w = ref(30) // cm
const height_h = ref(60) // cm
const forceHeight = ref(45) // cm
const F = ref(15) // N
const mu_s = ref(0.5)
const mu_k = computed(() => mu_s.value * 0.8)

const weight = computed(() => mass.value * g)
const maxFriction = computed(() => mu_s.value * weight.value)

const toppleForce = computed(() => {
  if (forceHeight.value <= 0) return 999
  return (weight.value * (width_w.value / 2)) / forceHeight.value
})

const xN = computed(() => {
  return (F.value * forceHeight.value) / weight.value
})

const arm_d_cm = computed(() => {
  const theta = simAngle.value
  const w = width_w.value
  const h = height_h.value
  return (w / 2) * Math.cos(theta) - (h / 2) * Math.sin(theta)
})

const tauG = computed(() => {
  return weight.value * (arm_d_cm.value / 100)
})

const tauGLabel = computed(() => {
  if (simAngle.value >= Math.PI / 2) return '床面支持 (静止安定)'
  if (tauG.value > 0.05) return '復元力（元に戻す ↩️）'
  if (tauG.value < -0.05) return '転倒力（倒す力 ⤵️）'
  return '死点（つり合い境界 0）'
})

const currentState = computed(() => {
  const isTopple = F.value > toppleForce.value
  const isSlide = F.value > maxFriction.value

  if (!isTopple && !isSlide) return 'stable'
  if (toppleForce.value < maxFriction.value) {
    return isTopple ? 'toppled' : 'stable'
  } else {
    return isSlide ? 'sliding' : 'stable'
  }
})

const stateLabel = computed(() => {
  if (currentState.value === 'stable') return '静止安定（つり合い保持）'
  if (currentState.value === 'toppled') return '⚠️ 転倒！（右下端を軸に倒れる）'
  return '💨 滑走！（倒れずに右へすべる）'
})

const stateBadgeClass = computed(() => {
  if (currentState.value === 'stable') return 'badge-cyan'
  if (currentState.value === 'toppled') return 'badge-rose'
  return 'badge-yellow'
})

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.25 ? Math.min(1.85, 1.32 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([1.4 * s, 3.8 * s, 10.6 * s], [0.1, 1.4, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.1, 1.4, 36.0 * s], [0.1, 1.4, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.1, 36.0 * s, 0.01], [0.1, 0, 0], duration, 14)
  }
}

function onParamChange() {
  if (!isPlaying.value) {
    resetMotion()
  }
}

function resetMotion() {
  simX.value = 0
  simVx.value = 0
  simAngle.value = 0
  simOmega.value = 0
  bounceCount.value = 0
  isFinished.value = false
  updateThreeScene()
}

function resetParams() {
  isPlaying.value = false
  F.value = 15
  forceHeight.value = 45
  mu_s.value = 0.5
  width_w.value = 30
  resetMotion()
}

function setPreset(type) {
  isPlaying.value = false
  if (type === 'slide_first') {
    mu_s.value = 0.25
    forceHeight.value = 25
    F.value = 22
  } else if (type === 'topple_first') {
    mu_s.value = 0.8
    forceHeight.value = 55
    F.value = 22
  }
  resetMotion()
}

function togglePlay() {
  if (isFinished.value) {
    resetMotion()
    isPlaying.value = true
    return
  }
  isPlaying.value = !isPlaying.value
}

function stepForward() {
  isPlaying.value = false
  updatePhysics(0.05)
  updateThreeScene()
}

function updatePhysics(dt) {
  const scaledDt = dt * timeScale.value
  const state = currentState.value

  if (state === 'stable') {
    if (isPlaying.value) {
      F.value = Math.min(60, Number((F.value + 6.0 * scaledDt).toFixed(1)))
    }
    simX.value = 0
    simAngle.value = 0
    return
  }

  if (state === 'sliding') {
    const frictionForce = mu_k.value * weight.value
    const netForce = Math.max(0, F.value - frictionForce)
    const accel = netForce / mass.value
    const aPx = accel * 150

    simVx.value += aPx * scaledDt
    simX.value += simVx.value * scaledDt

    if (simX.value > 240) {
      isPlaying.value = false
      isFinished.value = true
    }
  } else if (state === 'toppled') {
    const wM = width_w.value / 100
    const hM = height_h.value / 100
    const I = (mass.value * (wM * wM + hM * hM)) / 3

    const theta = simAngle.value
    const torqueF = F.value * (forceHeight.value / 100) * Math.cos(theta)
    const torqueG = weight.value * ((wM / 2) * Math.cos(theta) - (hM / 2) * Math.sin(theta))
    const netTorque = torqueF - torqueG

    const alpha = Math.max(0.5, netTorque / I)

    simOmega.value += alpha * scaledDt
    simAngle.value += simOmega.value * scaledDt

    if (simAngle.value >= Math.PI / 2) {
      simAngle.value = Math.PI / 2
      if (bounceCount.value < 2) {
        simOmega.value = -simOmega.value * 0.25
        bounceCount.value++
      } else {
        simOmega.value = 0
        isPlaying.value = false
        isFinished.value = true
      }
    }
  }
}

// 3D スケール: 1cm = 0.05 ワールド単位 (高さ60cm = 3.0, 幅30cm = 1.5)
const cmScale = 0.05
const baseOriginX = -0.8

function initThree() {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [1.8, 3.8, 9.6],
    initialTarget: [0.4, 1.4, 0],
    onFrame: (dt) => {
      if (isPlaying.value) {
        updatePhysics(dt)
      }
      updateThreeScene()
    }
  })

  const { scene } = threeCtx

  // 1. 床グリッドとステージ
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0.4, -0.01, 0)
  scene.add(grid)

  const floorSlab = new THREE.Mesh(
    new THREE.BoxGeometry(11.0, 0.16, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.25 })
  )
  floorSlab.position.set(0.6, -0.08, 0)
  scene.add(floorSlab)

  // 2. 直方体ピボットグループ（右下端 P を原点として回転できるように配置）
  const pivotGroup = new THREE.Group()
  scene.add(pivotGroup)

  // 1x1x1 の基準ボックスを生成し、scaleとpositionで (-bw/2, bh/2, 0) に配置
  const boxGeo = new THREE.BoxGeometry(1, 1, 1.4)
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.52,
    roughness: 0.25,
    metalness: 0.35,
    depthWrite: false
  })
  const blockMesh = new THREE.Mesh(boxGeo, boxMat)
  pivotGroup.add(blockMesh)

  const edgeLine = new THREE.LineSegments(
    new THREE.EdgesGeometry(boxGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8 })
  )
  blockMesh.add(edgeLine)

  // 支点 P の発光ピン
  const pivotMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  )
  scene.add(pivotMarker)

  // 重心 G の発光球体 & 鉛直作用線（Plumb Line）
  const cgSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.8 })
  )
  scene.add(cgSphere)

  const plumbGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3()
  ])
  const plumbLine = new THREE.Line(
    plumbGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
  )
  scene.add(plumbLine)

  // 支点 P と重心作用線の間の水平腕 d ライン
  const armGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3()
  ])
  const armLine = new THREE.Line(
    armGeo,
    new THREE.LineBasicMaterial({ color: 0x10b981 })
  )
  scene.add(armLine)

  // 3. 3D ベクトル矢印 (外力 F, 重力 Mg, 垂直抗力 N, 摩擦力 f)
  const arrowF = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowMg = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowN = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowFric = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  scene.add(arrowF, arrowMg, arrowN, arrowFric)

  const labelF = createTextSprite('外力 F', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 32, scale: 0.5 })
  const labelMg = createTextSprite('重力 Mg (重心G)', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.52 })
  const labelN = createTextSprite('垂直抗力 N', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 32, scale: 0.52 })
  const labelFric = createTextSprite('摩擦力 f', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 30, scale: 0.48 })
  const labelArm = createTextSprite('腕 d', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.48 })
  scene.add(labelF, labelMg, labelN, labelFric, labelArm)

  sceneObjects = {
    pivotGroup,
    blockMesh,
    boxMat,
    edgeLine,
    pivotMarker,
    cgSphere,
    plumbLine,
    armLine,
    arrowF,
    arrowMg,
    arrowN,
    arrowFric,
    labelF,
    labelMg,
    labelN,
    labelFric,
    labelArm
  }

  updateThreeScene()
  setCameraPreset(activeCam.value, 0)
}

let lastTxtMg = ''
let lastTxtF = ''
let lastTxtN = ''
let lastTxtFric = ''
let lastTxtArm = ''

function updateThreeScene() {
  if (!sceneObjects) return
  const {
    pivotGroup,
    blockMesh,
    boxMat,
    edgeLine,
    pivotMarker,
    cgSphere,
    plumbLine,
    armLine,
    arrowF,
    arrowMg,
    arrowN,
    arrowFric,
    labelF,
    labelMg,
    labelN,
    labelFric,
    labelArm
  } = sceneObjects

  const bw = width_w.value * cmScale
  const bh = height_h.value * cmScale
  const slideOffset = (simX.value / 3) * cmScale // 2D版の 1cm=3px に合わせた移動量
  const angle = simAngle.value // 時計回り回転角

  // 右下端の支点 P のワールド座標
  const pivotX = baseOriginX + bw / 2 + slideOffset
  const pivotY = 0

  pivotGroup.position.set(pivotX, pivotY, 0)
  pivotGroup.rotation.z = -angle // 時計回り回転は Z軸負回転

  blockMesh.scale.set(bw, bh, 1)
  blockMesh.position.set(-bw / 2, bh / 2, 0)

  const state = currentState.value
  if (state === 'toppled') {
    boxMat.color.setHex(0xf43f5e)
    boxMat.emissive.setHex(0xbe123c)
    edgeLine.material.color.setHex(0xfda4af)
  } else if (state === 'sliding') {
    boxMat.color.setHex(0xf59e0b)
    boxMat.emissive.setHex(0xb45309)
    edgeLine.material.color.setHex(0xfde68a)
  } else {
    boxMat.color.setHex(0x0ea5e9)
    boxMat.emissive.setHex(0x0284c7)
    edgeLine.material.color.setHex(0x38bdf8)
  }

  pivotMarker.position.set(pivotX, pivotY, 0.72)

  // 重心 G のワールド座標
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const gx = pivotX - (bw / 2) * cosA + (bh / 2) * sinA
  const gy = pivotY + (bw / 2) * sinA + (bh / 2) * cosA
  const gPos = new THREE.Vector3(gx, gy, 0)
  cgSphere.position.copy(gPos)

  // 重心の鉛直作用線 Plumb Line
  const pAttr = plumbLine.geometry.getAttribute('position')
  pAttr.setXYZ(0, gx, gy, 0.72)
  pAttr.setXYZ(1, gx, 0, 0.72)
  pAttr.needsUpdate = true

  // 1. 重力 Mg ベクトル (常に鉛直真下・上面視点と3D俯瞰の両方で重ならないよう右下手前 z=+1.35)
  const mgLen = 1.45
  arrowMg.setVector(gPos, new THREE.Vector3(0, -1, 0), mgLen)
  const txtMg = `重力 Mg = ${weight.value.toFixed(1)} N`
  if (txtMg !== lastTxtMg) {
    lastTxtMg = txtMg
    labelMg.updateText(txtMg, '#7dd3fc', '#38bdf8')
  }
  labelMg.position.set(gx + 0.50, Math.max(0.38, gy - mgLen - 0.2), 1.35)

  // 2. 外力 F ベクトル (左面の中央高さ h_F を右向きに押す)
  if (F.value > 0 && angle < Math.PI / 3) {
    const fH = forceHeight.value * cmScale
    // 左面上の点 (-bw, fH) を pivotGroup 回転させたワールド座標
    const fx = pivotX - bw * cosA + fH * sinA
    const fy = pivotY + bw * sinA + fH * cosA
    const fLen = Math.min(2.1, Math.max(0.55, F.value * 0.032))
    const fStart = new THREE.Vector3(fx - fLen, fy, 0)
    arrowF.setVector(fStart, new THREE.Vector3(1, 0, 0), fLen)
    labelF.visible = true
    const txtF = `外力 F = ${F.value} N`
    if (txtF !== lastTxtF) {
      lastTxtF = txtF
      labelF.updateText(txtF, '#fda4af', '#f43f5e')
    }
    labelF.position.set(fx - fLen - 0.55, fy + 0.34, 0.0)
  } else {
    arrowF.visible = false
    labelF.visible = false
  }

  // 3. 垂直抗力 N（作用点シフト x_N）と摩擦力 f
  if (angle < 0.02) {
    const shiftCm = Math.min(xN.value, width_w.value / 2)
    const nx = (pivotX - bw / 2) + shiftCm * cmScale
    const nOrigin = new THREE.Vector3(nx, 0, 0.35)
    const nLen = 1.45
    arrowN.setVector(nOrigin, new THREE.Vector3(0, 1, 0), nLen)
    labelN.visible = true
    const txtN = `N (シフト +${shiftCm.toFixed(1)}cm)`
    if (txtN !== lastTxtN) {
      lastTxtN = txtN
      labelN.updateText(txtN, '#6ee7b7', '#10b981')
    }
    labelN.position.set(nx + 0.85, nLen + 0.25, 0.0)

    // 摩擦力 f (底面左向き・3D俯瞰の Mg とも上面の F/Mg とも分離するため左下手前)
    if (F.value > 0) {
      const fricLen = Math.min(1.6, Math.max(0.45, F.value * 0.026))
      const fricOrigin = new THREE.Vector3(pivotX - bw / 2, 0.04, 0.55)
      arrowFric.setVector(fricOrigin, new THREE.Vector3(-1, 0, 0), fricLen)
      labelFric.visible = true
      const txtFric = state === 'sliding' ? '動摩擦力 μₖN' : '静止摩擦力 f'
      if (txtFric !== lastTxtFric) {
        lastTxtFric = txtFric
        labelFric.updateText(txtFric, '#fde68a', '#fbbf24')
      }
      labelFric.position.set(pivotX - bw - fricLen - 1.35, -0.52, 0.95)
    } else {
      arrowFric.visible = false
      labelFric.visible = false
    }
    armLine.visible = false
    labelArm.visible = false
  } else if (angle < Math.PI / 2 - 0.02) {
    // 転倒中: 支点 P に垂直抗力 N が集中し、水平腕 d を可視化
    arrowN.setVector(new THREE.Vector3(pivotX, 0, 0.35), new THREE.Vector3(0, 1, 0), 1.35)
    labelN.visible = true
    if (lastTxtN !== '支点 P (抗力集中)') {
      lastTxtN = '支点 P (抗力集中)'
      labelN.updateText('支点 P (抗力集中)', '#6ee7b7', '#10b981')
    }
    labelN.position.set(pivotX + 0.85, 1.55, 0.0)

    arrowFric.visible = false
    labelFric.visible = false

    armLine.visible = true
    const aAttr = armLine.geometry.getAttribute('position')
    aAttr.setXYZ(0, gx, 0.12, 0.75)
    aAttr.setXYZ(1, pivotX, 0.12, 0.75)
    aAttr.needsUpdate = true

    const dVal = arm_d_cm.value
    armLine.material.color.setHex(dVal >= 0 ? 0x10b981 : 0xf43f5e)
    labelArm.visible = true
    const txtArm = dVal >= 0 ? `復元腕 d = ${dVal.toFixed(1)}cm ↩️` : `転倒腕 d = ${Math.abs(dVal).toFixed(1)}cm ⤵️`
    if (txtArm !== lastTxtArm) {
      lastTxtArm = txtArm
      labelArm.updateText(
        txtArm,
        dVal >= 0 ? '#6ee7b7' : '#fda4af',
        dVal >= 0 ? '#10b981' : '#f43f5e'
      )
    }
    labelArm.position.set((gx + pivotX) / 2, -0.38, 1.65)
  } else {
    // 完全に倒れた後
    const contactCenter = pivotX + bh / 2
    arrowN.setVector(new THREE.Vector3(contactCenter, 0, 0), new THREE.Vector3(0, 1, 0), 1.35)
    labelN.visible = true
    if (lastTxtN !== '床の垂直抗力 N') {
      lastTxtN = '床の垂直抗力 N'
      labelN.updateText('床の垂直抗力 N', '#6ee7b7', '#10b981')
    }
    labelN.position.set(contactCenter, 1.65, 0.4)
    arrowFric.visible = false
    labelFric.visible = false
    armLine.visible = false
    labelArm.visible = false
  }
}

watch([F, forceHeight, mu_s, width_w], () => {
  updateThreeScene()
})

onMounted(() => {
  initThree()
})

onBeforeUnmount(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
  margin: 18px 0;
  font-family: 'Outfit', system-ui, sans-serif;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.sim-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
}
.sim-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
}
.badge-cyan {
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.3);
}
.badge-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
}
.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
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
.speed-btn-group button {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}
.speed-btn-group button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
}
.btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.btn-primary {
  background: #0284c7;
  color: #fff;
}
.btn-secondary {
  background: #334155;
  color: #f8fafc;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 400px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
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
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.75rem;
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
.dot-f { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-n { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-mg { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-fr { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
}
.stat-card.highlight {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
}
.stat-label {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}
.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}
.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }
.controls-panel {
  margin-top: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}
.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}
.control-val {
  color: #38bdf8;
  font-family: monospace;
}
.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.sim-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: none;
}
.sim-btn.outline {
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  border: 1px solid #475569;
}
.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
.speed-label,
.speed-btn-group button {
  white-space: nowrap;
}
@media (max-width: 768px) {
  .sim-container {
    padding: 12px;
  }
  .three-viewport-wrap {
    height: 325px;
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
