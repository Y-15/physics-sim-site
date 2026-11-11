<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎱</span>
        <h3>3D 2次元平面衝突・斜め衝突ハイエンド物理シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        ビリヤードの球同士の3D衝突から、壁面との斜め反射まで。
        接触面の法線方向（運動量保存＋反発係数 <i>e</i>）と接線方向（外力ゼロで速度成分不変）のベクトル直交分解を、
        リアルタイムの3Dベクトル描画と衝撃波リングで直感的に完全攻略できます。
      </p>

      <!-- シミュレーションモード切り替え -->
      <div class="mode-selector">
        <button
          class="mode-btn"
          :class="{ active: currentMode === 'balls' }"
          @click="setMode('balls')"
        >
          🎱 モードA: 2球の斜め衝突（ビリヤード・散乱角90°定理）
        </button>
        <button
          class="mode-btn"
          :class="{ active: currentMode === 'wall' }"
          @click="setMode('wall')"
        >
          🧱 モードB: なめらかな壁面との斜め衝突（tan <i>β</i> = (1/<i>e</i>) tan <i>α</i>）
        </button>
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
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 真上視点 (2次元平面投影)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'side' }"
          @click="setCameraPreset('side')"
        >
          📐 側面視点
        </button>
      </div>
    </div>

    <!-- 再生コントロールバー -->
    <div class="playback-bar">
      <div class="main-controls">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="stepForward">
          ⏭ 1コマ送り
        </button>
        <button class="btn btn-secondary" @click="launchSimulation">
          🔄 再発射
        </button>
      </div>

      <div class="speed-control-group">
        <span class="control-label">⏱️ 速度:</span>
        <div class="btn-group">
          <button class="select-btn" :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x</button>
          <button class="select-btn" :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x</button>
          <button class="select-btn" :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
        </div>
      </div>

      <div class="display-toggles">
        <button class="toggle-btn" :class="{ active: showDecomposedVectors }" @click="showDecomposedVectors = !showDecomposedVectors">
          📐 <i>v<sub>n</sub></i>, <i>v<sub>t</sub></i> 分解
        </button>
        <button class="toggle-btn" :class="{ active: showNormals }" @click="showNormals = !showNormals">
          🎯 法線・接線軸
        </button>
        <button class="toggle-btn" :class="{ active: showTrails }" @click="showTrails = !showTrails">
          ✨ 軌跡・重心G
        </button>
      </div>
    </div>

    <!-- モード別ステータスバー（ビューポート上部に配置し凡例との重複を回避） -->
    <div class="badge-strip">
      <div v-if="currentMode === 'balls'" class="angle-badge" :class="{ rightAngle: isNearlyRightAngle }">
        <span>散乱角 <i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>: <strong>{{ totalScatteringAngleDeg.toFixed(1) }}°</strong> {{ isNearlyRightAngle ? '✨ 直角 90° 分離証明成立!' : '' }}</span>
      </div>
      <div v-else class="angle-badge wall-badge">
        <span>入射角 <i>α</i>: <strong>{{ wallAlphaDeg }}°</strong> → 反射角 <i>β</i>: <strong>{{ wallBetaDeg.toFixed(1) }}°</strong> (tan <i>β</i> / tan <i>α</i> = <strong>{{ (1 / wallE).toFixed(2) }}</strong>)</span>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v1"></i>球1速度 <b>v₁</b></span>
        <span v-if="currentMode === 'balls'" class="legend-item"><i class="dot-v2"></i>球2速度 <b>v₂</b></span>
        <span class="legend-item"><i class="dot-vn"></i>法線成分 <b>v<sub>n</sub></b></span>
        <span class="legend-item"><i class="dot-vt"></i>接線成分 <b>v<sub>t</sub></b></span>
        <span v-if="currentMode === 'balls'" class="legend-item"><i class="dot-cm"></i>重心 <b>G</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <!-- 2球衝突モードのコントロール -->
      <div v-if="currentMode === 'balls'" class="control-grid">
        <div class="control-group">
          <label>
            <span>衝突パラメータ <i>b</i>（芯ズレ距離）: <strong>{{ impactParamMm }} mm</strong></span>
            <input type="range" v-model.number="impactParamMm" min="-28" max="28" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>反発係数 <i>e</i>: <strong>{{ restitutionE.toFixed(2) }}</strong></span>
            <input type="range" v-model.number="restitutionE" min="0" max="1" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>質量比 <i>m</i><sub>1</sub> / <i>m</i><sub>2</sub>: <strong>{{ massRatio.toFixed(1) }}</strong></span>
            <input type="range" v-model.number="massRatio" min="0.2" max="3.0" step="0.1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>初速 <i>v</i><sub>0</sub>: <strong>{{ initialSpeedMs }} m/s</strong></span>
            <input type="range" v-model.number="initialSpeedMs" min="2" max="8" step="0.5" />
          </label>
        </div>
      </div>

      <!-- 壁面衝突モードのコントロール -->
      <div v-else class="control-grid">
        <div class="control-group">
          <label>
            <span>入射角 <i>α</i>（法線とのなす角）: <strong>{{ wallAlphaDeg }}°</strong></span>
            <input type="range" v-model.number="wallAlphaDeg" min="10" max="75" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>壁との反発係数 <i>e</i>: <strong>{{ wallE.toFixed(2) }}</strong></span>
            <input type="range" v-model.number="wallE" min="0.1" max="1.0" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>入射速さ <i>v</i><sub>0</sub>: <strong>{{ wallSpeedMs.toFixed(1) }} m/s</strong></span>
            <input type="range" v-model.number="wallSpeedMs" min="3" max="8" step="0.5" />
          </label>
        </div>

        <div class="control-group preset-group">
          <span class="preset-label">プリセット:</span>
          <div class="preset-buttons">
            <button class="preset-btn" @click="wallAlphaDeg = 45; wallE = 1.0; launchSimulation()">弾性衝突 (α = β = 45°)</button>
            <button class="preset-btn" @click="wallAlphaDeg = 30; wallE = 0.5; launchSimulation()">非弾性衝突 (e = 0.5, β &gt; α)</button>
          </div>
        </div>
      </div>
    </div>

    <!-- リアルタイム物理量モニター -->
    <div v-if="currentMode === 'balls'" class="stats-monitor">
      <div class="stat-card">
        <span class="label">球1の散乱角 <i>θ</i><sub>1</sub></span>
        <span class="value highlight">{{ theta1Deg.toFixed(1) }} <span class="unit">°</span></span>
        <span class="subtext">衝突後の速さ: {{ v1Final.toFixed(2) }} m/s</span>
      </div>

      <div class="stat-card">
        <span class="label">球2の反跳角 <i>θ</i><sub>2</sub></span>
        <span class="value highlight">{{ theta2Deg.toFixed(1) }} <span class="unit">°</span></span>
        <span class="subtext">衝突後の速さ: {{ v2Final.toFixed(2) }} m/s</span>
      </div>

      <div class="stat-card">
        <span class="label">力学的エネルギー変化 Δ<i>E</i></span>
        <span class="value">{{ energyLossJ.toFixed(2) }} <span class="unit">J</span></span>
        <span class="subtext">損失率: {{ energyLossPercent.toFixed(1) }}% ({{ restitutionE >= 0.99 ? '完全弾性・エネルギー保存' : '非弾性・熱損失' }})</span>
      </div>

      <div class="stat-card">
        <span class="label">全運動量ベクトル <i>P⃗</i></span>
        <span class="value success">完全保存</span>
        <span class="subtext"><i>m</i><sub>1</sub><i>v⃗</i><sub>1</sub> + <i>m</i><sub>2</sub><i>v⃗</i><sub>2</sub> = 一定</span>
      </div>
    </div>

    <div v-else class="stats-monitor">
      <div class="stat-card">
        <span class="label">接線方向速度 <i>v<sub>t</sub></i></span>
        <span class="value highlight">{{ wallVt.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">外力ゼロにより完全保存 (<i>v'<sub>t</sub></i> = <i>v<sub>t</sub></i>)</span>
      </div>

      <div class="stat-card">
        <span class="label">法線方向速度 <i>v<sub>n</sub></i></span>
        <span class="value highlight">{{ wallVnAfter.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">反発係数により縮小: <i>v'<sub>n</sub></i> = <i>e</i> × {{ wallVnBefore.toFixed(2) }}</span>
      </div>

      <div class="stat-card">
        <span class="label">反射角の理論比 tan <i>β</i> / tan <i>α</i></span>
        <span class="value">{{ (1 / wallE).toFixed(2) }} <span class="unit">倍</span></span>
        <span class="subtext">理論式: tan <i>β</i> = (1/<i>e</i>) tan <i>α</i> (<i>e</i> &lt; 1 で <i>β</i> &gt; <i>α</i>)</span>
      </div>

      <div class="stat-card">
        <span class="label">反射後の速さ <i>v'</i></span>
        <span class="value">{{ wallVFinal.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">エネルギー保持率: {{ ((wallVFinal ** 2 / wallSpeedMs ** 2) * 100).toFixed(1) }}%</span>
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

const currentMode = ref('balls') // 'balls' | 'wall'
const activeCam = ref('3d')

// 再生状態
const isRunning = ref(true)
const timeScale = ref(1.0)
const showDecomposedVectors = ref(true)
const showNormals = ref(true)
const showTrails = ref(true)

// --- 2球衝突モードの状態 ---
const impactParamMm = ref(16) // mm (-28 ~ 28)
const restitutionE = ref(1.0)  // 0.0 ~ 1.0
const massRatio = ref(1.0)     // m1 / m2
const initialSpeedMs = ref(5.0)

// --- 壁面衝突モードの状態 ---
const wallAlphaDeg = ref(35)   // 入射角 (deg)
const wallE = ref(0.6)         // 壁との反発係数
const wallSpeedMs = ref(5.0)   // 入射速度

function getMobileScale() {
  if (!threeContainer.value) return 1.0
  const aspect = threeContainer.value.clientWidth / Math.max(1, threeContainer.value.clientHeight)
  return aspect < 1.25 ? Math.max(1.22, 1.55 / Math.max(0.65, aspect)) : 1.0
}

let lastAspect = 0

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  lastAspect = threeCtx.camera.aspect || 1.7
  const ms = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0, 9.2 * ms, 12.6 * ms], [0, 0, 0], duration, 42)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 44.0 * ms, 0.01], [0, 0, 0], duration, 14)
  } else if (preset === 'side') {
    threeCtx.moveCameraTo([0, 1.9, 44.0 * ms], [0, 0.3, 0], duration, 14)
  }
}

function setMode(mode) {
  currentMode.value = mode
  launchSimulation()
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepForward() {
  isRunning.value = false
  updatePhysics(0.05)
  syncThreeScene()
}

// 2球衝突の物理計算
const collisionMetrics = computed(() => {
  const b = impactParamMm.value
  const R_mm = 20
  const dist = 2 * R_mm
  if (Math.abs(b) >= dist) {
    return {
      v1: initialSpeedMs.value, theta1: 0,
      v2: 0, theta2: 0,
      lossJ: 0, lossPct: 0,
      phi: 0, v1x: initialSpeedMs.value, v1z: 0, v2x: 0, v2z: 0,
      v1n: 0, v1t: initialSpeedMs.value, v1n_prime: 0, v2n_prime: 0
    }
  }

  const sinPhi = b / dist
  const cosPhi = Math.sqrt(Math.max(0, 1 - sinPhi * sinPhi))
  const phi = Math.asin(sinPhi)

  const v0 = initialSpeedMs.value
  const v1n = v0 * cosPhi
  const v1t = -v0 * sinPhi

  const mass1 = massRatio.value
  const mass2 = 1.0
  const e = restitutionE.value

  const v1n_prime = ((mass1 - e * mass2) * v1n) / (mass1 + mass2)
  const v2n_prime = ((1 + e) * mass1 * v1n) / (mass1 + mass2)

  const v1t_prime = v1t
  const v2t_prime = 0

  const v1x = v1n_prime * cosPhi - v1t_prime * sinPhi
  const v1z = v1n_prime * sinPhi + v1t_prime * cosPhi
  const v2x = v2n_prime * cosPhi - v2t_prime * sinPhi
  const v2z = v2n_prime * sinPhi + v2t_prime * cosPhi

  const v1Final = Math.hypot(v1x, v1z)
  const v2Final = Math.hypot(v2x, v2z)

  const th1 = Math.abs(Math.atan2(v1z, v1x)) * (180 / Math.PI)
  const th2 = Math.abs(Math.atan2(v2z, v2x)) * (180 / Math.PI)

  const E_init = 0.5 * mass1 * v0 ** 2
  const E_final = 0.5 * mass1 * v1Final ** 2 + 0.5 * mass2 * v2Final ** 2
  const lossJ = Math.max(0, E_init - E_final)
  const lossPct = E_init > 0 ? (lossJ / E_init) * 100 : 0

  return {
    v1: v1Final, theta1: th1,
    v2: v2Final, theta2: th2,
    v1x, v1z, v2x, v2z,
    v1n, v1t, v1n_prime, v2n_prime,
    lossJ, lossPct, phi
  }
})

const theta1Deg = computed(() => collisionMetrics.value.theta1)
const theta2Deg = computed(() => collisionMetrics.value.theta2)
const v1Final = computed(() => collisionMetrics.value.v1)
const v2Final = computed(() => collisionMetrics.value.v2)
const energyLossJ = computed(() => collisionMetrics.value.lossJ)
const energyLossPercent = computed(() => collisionMetrics.value.lossPct)
const totalScatteringAngleDeg = computed(() => theta1Deg.value + theta2Deg.value)
const isNearlyRightAngle = computed(() => Math.abs(totalScatteringAngleDeg.value - 90) < 1.0 && restitutionE.value >= 0.98 && Math.abs(massRatio.value - 1.0) < 0.05)

// 壁面衝突の物理計算
const wallRadAlpha = computed(() => (wallAlphaDeg.value * Math.PI) / 180)
const wallVnBefore = computed(() => wallSpeedMs.value * Math.cos(wallRadAlpha.value))
const wallVt = computed(() => wallSpeedMs.value * Math.sin(wallRadAlpha.value))
const wallVnAfter = computed(() => wallE.value * wallVnBefore.value)
const wallVFinal = computed(() => Math.hypot(wallVt.value, wallVnAfter.value))
const wallBetaDeg = computed(() => Math.atan2(wallVt.value, wallVnAfter.value) * (180 / Math.PI))

// 3D ワールド空間スケール (xz平面: 1mm = 0.0225 ワールド単位 -> R=20mm が rBall = 0.45)
const mmScale = 0.0225
const rBall = 20 * mmScale // 0.45
const wallWorldZ = 1.65

// 動的状態
let p1 = { x: -4.6, z: 0, vx: 3, vz: 0 }
let p2 = { x: -0.4, z: 0, vx: 0, vz: 0 }
let trail1 = []
let trail2 = []
let trailCM = []
let hasCollided = false
let shockwave = { active: false, x: 0, z: 0, r: 0.1, alpha: 1 }

let wallBall = { x: -3.5, z: -1.8, vx: 2, vz: 2 }
let wallTrail = []
let wallHasBounced = false

function launchSimulation() {
  if (currentMode.value === 'balls') {
    const bWorld = impactParamMm.value * mmScale
    p1.x = -4.6
    p1.z = -bWorld
    p1.vx = initialSpeedMs.value * 0.78
    p1.vz = 0

    p2.x = -0.35
    p2.z = 0
    p2.vx = 0
    p2.vz = 0

    trail1 = [{ x: p1.x, z: p1.z }]
    trail2 = [{ x: p2.x, z: p2.z }]
    const m1 = massRatio.value
    const m2 = 1.0
    trailCM = [{ x: (m1 * p1.x + m2 * p2.x) / (m1 + m2), z: (m1 * p1.z + m2 * p2.z) / (m1 + m2) }]
    hasCollided = false
    shockwave.active = false
  } else {
    const alpha = wallRadAlpha.value
    const speed = wallSpeedMs.value * 0.78
    const contactX = 0
    const contactZ = wallWorldZ - rBall
    const vx0 = speed * Math.sin(alpha)
    const vz0 = speed * Math.cos(alpha)

    const leadTime = 1.05
    wallBall.x = contactX - vx0 * leadTime
    wallBall.z = contactZ - vz0 * leadTime
    wallBall.vx = vx0
    wallBall.vz = vz0

    wallTrail = [{ x: wallBall.x, z: wallBall.z }]
    wallHasBounced = false
    shockwave.active = false
  }
  syncThreeScene()
}

function updatePhysics(dt) {
  const step = dt * timeScale.value

  if (currentMode.value === 'balls') {
    p1.x += p1.vx * step
    p1.z += p1.vz * step
    p2.x += p2.vx * step
    p2.z += p2.vz * step

    if (!hasCollided) {
      const dx = p2.x - p1.x
      const dz = p2.z - p1.z
      const dist = Math.hypot(dx, dz)
      if (dist <= 2 * rBall) {
        hasCollided = true
        shockwave.active = true
        shockwave.x = (p1.x + p2.x) / 2
        shockwave.z = (p1.z + p2.z) / 2
        shockwave.r = 0.25
        shockwave.alpha = 1.0

        const m = collisionMetrics.value
        p1.vx = m.v1x * 0.78
        p1.vz = m.v1z * 0.78
        p2.vx = m.v2x * 0.78
        p2.vz = m.v2z * 0.78
      }
    }

    if (trail1.length === 0 || Math.hypot(p1.x - trail1[trail1.length - 1].x, p1.z - trail1[trail1.length - 1].z) > 0.08) {
      trail1.push({ x: p1.x, z: p1.z })
      trail2.push({ x: p2.x, z: p2.z })
      const m1 = massRatio.value
      const m2 = 1.0
      trailCM.push({ x: (m1 * p1.x + m2 * p2.x) / (m1 + m2), z: (m1 * p1.z + m2 * p2.z) / (m1 + m2) })
      if (trail1.length > 120) {
        trail1.shift()
        trail2.shift()
        trailCM.shift()
      }
    }

    if (shockwave.active) {
      shockwave.r += 2.6 * step
      shockwave.alpha -= 1.5 * step
      if (shockwave.alpha <= 0) shockwave.active = false
    }

    if (p1.x > 6.2 || p2.x > 6.2 || Math.abs(p1.z) > 4.2 || Math.abs(p2.z) > 4.2) {
      launchSimulation()
    }
  } else {
    wallBall.x += wallBall.vx * step
    wallBall.z += wallBall.vz * step

    if (!wallHasBounced && wallBall.z >= wallWorldZ - rBall) {
      wallHasBounced = true
      wallBall.z = wallWorldZ - rBall
      shockwave.active = true
      shockwave.x = wallBall.x
      shockwave.z = wallWorldZ
      shockwave.r = 0.25
      shockwave.alpha = 1.0

      const speed = wallSpeedMs.value * 0.78
      const alpha = wallRadAlpha.value
      const vt = speed * Math.sin(alpha)
      const vnBefore = speed * Math.cos(alpha)
      const vnAfter = wallE.value * vnBefore

      wallBall.vx = vt
      wallBall.vz = -vnAfter
    }

    if (wallTrail.length === 0 || Math.hypot(wallBall.x - wallTrail[wallTrail.length - 1].x, wallBall.z - wallTrail[wallTrail.length - 1].z) > 0.08) {
      wallTrail.push({ x: wallBall.x, z: wallBall.z })
      if (wallTrail.length > 120) wallTrail.shift()
    }

    if (shockwave.active) {
      shockwave.r += 2.6 * step
      shockwave.alpha -= 1.5 * step
      if (shockwave.alpha <= 0) shockwave.active = false
    }

    if (wallBall.x > 6.0 || wallBall.z < -4.2) {
      launchSimulation()
    }
  }
}

function initThree() {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0, 9.2, 12.6],
    initialTarget: [0, 0, 0],
    onFrame: (dt) => {
      if (threeCtx && threeCtx.camera && Math.abs(threeCtx.camera.aspect - lastAspect) > 0.08) {
        setCameraPreset(activeCam.value, 0)
      }
      if (isRunning.value) {
        updatePhysics(dt)
      }
      syncThreeScene()
    }
  })

  const { scene } = threeCtx

  // 1. アリーナビリヤードテーブル床とグリッド
  const tableGeo = new THREE.BoxGeometry(12.6, 0.2, 7.8)
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.75,
    metalness: 0.15
  })
  const tableMesh = new THREE.Mesh(tableGeo, tableMat)
  tableMesh.position.set(0, -0.1, 0)
  scene.add(tableMesh)

  const grid = new THREE.GridHelper(12, 12, 0x334155, 0x1e293b)
  grid.position.set(0, 0.01, 0)
  scene.add(grid)

  // 2. モードB用の3D壁面
  const wallGroup = new THREE.Group()
  scene.add(wallGroup)

  const wallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.9, 0.35),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.45,
      roughness: 0.35
    })
  )
  wallMesh.position.set(0, 0.45, wallWorldZ + 0.175)
  wallGroup.add(wallMesh)

  const wallEdge = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.08, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.4 })
  )
  wallEdge.position.set(0, 0.9, wallWorldZ)
  wallGroup.add(wallEdge)

  const wallLabel = createTextSprite('なめらかな壁面 (接線 t 軸・力積ゼロ)', {
    color: '#cbd5e1',
    borderColor: '#64748b',
    fontSize: 34,
    scale: 0.58
  })
  wallLabel.position.set(-2.6, 1.25, wallWorldZ + 0.65)
  wallGroup.add(wallLabel)

  // 3. 3D ビリヤード球1 (m1), 球2 (m2), 重心マーカー G
  const sphereGeo = new THREE.SphereGeometry(rBall, 32, 32)
  const mat1 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.25,
    metalness: 0.35,
    roughness: 0.18
  })
  const sphere1 = new THREE.Mesh(sphereGeo, mat1)
  scene.add(sphere1)

  const mat2 = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    metalness: 0.35,
    roughness: 0.18
  })
  const sphere2 = new THREE.Mesh(sphereGeo, mat2)
  scene.add(sphere2)

  // 重心 G マーカー
  const cmMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.75
    })
  )
  scene.add(cmMesh)

  const labelCM = createTextSprite('重心 G', {
    color: '#d8b4fe',
    borderColor: '#a855f7',
    fontSize: 34,
    scale: 0.56
  })
  scene.add(labelCM)

  // 4. 法線軸 n (赤破線) と 接線軸 t (緑破線)
  const normalLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-3, 0.04, 0),
    new THREE.Vector3(3, 0.04, 0)
  ])
  const normalLine = new THREE.Line(
    normalLineGeo,
    new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.75 })
  )
  scene.add(normalLine)

  const tangentLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.04, -2.5),
    new THREE.Vector3(0, 0.04, 2.5)
  ])
  const tangentLine = new THREE.Line(
    tangentLineGeo,
    new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.75 })
  )
  scene.add(tangentLine)

  const labelNormal = createTextSprite('法線 n', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 34,
    scale: 0.58
  })
  const labelTangent = createTextSprite('接線 t', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 34,
    scale: 0.58
  })
  scene.add(labelNormal, labelTangent)

  // 5. 軌跡ライン (球1, 球2, 重心 G)
  const maxPts = 130
  const makeTrailLine = (hex) => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxPts * 3), 3))
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.8 }))
    scene.add(line)
    return { geo, line }
  }
  const tLine1 = makeTrailLine(0x38bdf8)
  const tLine2 = makeTrailLine(0xfbbf24)
  const tLineCM = makeTrailLine(0xa855f7)

  // 6. ショックウェーブリング
  const ringGeo = new THREE.RingGeometry(0.85, 1.0, 32)
  ringGeo.rotateX(-Math.PI / 2)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })
  const shockRing = new THREE.Mesh(ringGeo, ringMat)
  scene.add(shockRing)

  // 7. 3D ベクトル矢印 (v1, v2, vn, vt)
  const arrowV1 = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  const arrowV2 = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  const arrowVn = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.28 })
  const arrowVt = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.28 })
  scene.add(arrowV1, arrowV2, arrowVn, arrowVt)

  const labelV1 = createTextSprite('v₁', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 36, scale: 0.60 })
  const labelV2 = createTextSprite('v₂', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 36, scale: 0.60 })
  const labelVn = createTextSprite('v_n', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 34, scale: 0.54 })
  const labelVt = createTextSprite('v_t', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 34, scale: 0.54 })
  scene.add(labelV1, labelV2, labelVn, labelVt)

  sceneObjects = {
    wallGroup,
    sphere1,
    sphere2,
    cmMesh,
    labelCM,
    normalLine,
    tangentLine,
    labelNormal,
    labelTangent,
    tLine1,
    tLine2,
    tLineCM,
    shockRing,
    ringMat,
    arrowV1,
    arrowV2,
    arrowVn,
    arrowVt,
    labelV1,
    labelV2,
    labelVn,
    labelVt
  }

  launchSimulation()
  setCameraPreset(activeCam.value, 0)
}

function updateTrailLine(tObj, pts, yOffset = 0.03) {
  if (!showTrails.value || pts.length < 2) {
    tObj.line.visible = false
    return
  }
  tObj.line.visible = true
  const arr = tObj.geo.getAttribute('position').array
  const count = pts.length
  for (let i = 0; i < count; i++) {
    arr[i * 3] = pts[i].x
    arr[i * 3 + 1] = yOffset
    arr[i * 3 + 2] = pts[i].z
  }
  tObj.geo.setDrawRange(0, count)
  tObj.geo.getAttribute('position').needsUpdate = true
}

let lastLabelV1Text = 'v₁'

function syncThreeScene() {
  if (!sceneObjects) return
  const {
    wallGroup,
    sphere1,
    sphere2,
    cmMesh,
    labelCM,
    normalLine,
    tangentLine,
    labelNormal,
    labelTangent,
    tLine1,
    tLine2,
    tLineCM,
    shockRing,
    ringMat,
    arrowV1,
    arrowV2,
    arrowVn,
    arrowVt,
    labelV1,
    labelV2,
    labelVn,
    labelVt
  } = sceneObjects

  const vScale = 0.42

  if (shockwave.active) {
    shockRing.visible = true
    shockRing.position.set(shockwave.x, 0.04, shockwave.z)
    shockRing.scale.set(shockwave.r, 1, shockwave.r)
    ringMat.opacity = Math.max(0, shockwave.alpha)
  } else {
    shockRing.visible = false
  }

  if (currentMode.value === 'balls') {
    wallGroup.visible = false
    sphere2.visible = true

    const s1Scale = Math.pow(massRatio.value, 1 / 5)
    sphere1.scale.set(s1Scale, s1Scale, s1Scale)
    sphere1.position.set(p1.x, rBall * s1Scale, p1.z)
    sphere2.position.set(p2.x, rBall, p2.z)

    // 重心 G
    const m1 = massRatio.value
    const m2 = 1.0
    const cmX = (m1 * p1.x + m2 * p2.x) / (m1 + m2)
    const cmZ = (m1 * p1.z + m2 * p2.z) / (m1 + m2)
    cmMesh.visible = showTrails.value
    labelCM.visible = showTrails.value
    cmMesh.position.set(cmX, 0.16, cmZ)
    labelCM.position.set(cmX, 0.58, cmZ + 0.95)

    updateTrailLine(tLine1, trail1, 0.04)
    updateTrailLine(tLine2, trail2, 0.04)
    updateTrailLine(tLineCM, trailCM, 0.06)

    // 法線・接線軸 (衝突点 (-0.35, 0) 中心に phi 回転)
    if (showNormals.value) {
      const phi = collisionMetrics.value.phi
      const cosP = Math.cos(phi)
      const sinP = Math.sin(phi)
      const cx = -0.35
      const cz = 0

      normalLine.visible = true
      const nAttr = normalLine.geometry.getAttribute('position')
      nAttr.setXYZ(0, cx - 2.8 * cosP, 0.03, cz - 2.8 * sinP)
      nAttr.setXYZ(1, cx + 2.8 * cosP, 0.03, cz + 2.8 * sinP)
      nAttr.needsUpdate = true

      tangentLine.visible = true
      const tAttr = tangentLine.geometry.getAttribute('position')
      tAttr.setXYZ(0, cx + 2.4 * sinP, 0.03, cz - 2.4 * cosP)
      tAttr.setXYZ(1, cx - 2.4 * sinP, 0.03, cz + 2.4 * cosP)
      tAttr.needsUpdate = true

      // 法線ラベルは +n 側（黄球の先）に配置し v1 / 重心 G / 接線 t との干渉を完全回避
      labelNormal.visible = true
      labelNormal.position.set(cx + 2.75 * cosP, 0.38, cz + 2.75 * sinP + (sinP >= 0 ? 0.50 : -0.50))
      // 接線ラベルは球の軌道が入らない側の (-x) 半平面端に配置
      const tSign = sinP >= 0 ? 1 : -1
      labelTangent.visible = true
      labelTangent.position.set(cx - tSign * 2.35 * sinP, 0.38, cz + tSign * 2.35 * cosP)
    } else {
      normalLine.visible = false
      tangentLine.visible = false
      labelNormal.visible = false
      labelTangent.visible = false
    }

    // 球1 速度ベクトル v1
    const v1Vec = new THREE.Vector3(p1.vx, 0, p1.vz)
    const v1Len = v1Vec.length() * vScale
    const p1Center = new THREE.Vector3(p1.x, rBall * s1Scale, p1.z)
    arrowV1.setVector(p1Center, v1Vec, v1Len)
    labelV1.visible = v1Len > 0.08
    if (lastLabelV1Text !== 'v₁') {
      lastLabelV1Text = 'v₁'
      labelV1.updateText('v₁', '#7dd3fc', '#38bdf8')
    }
    if (v1Len > 0.08) {
      labelV1.position.copy(p1Center).addScaledVector(v1Vec.clone().normalize(), v1Len + 0.35)
      labelV1.position.y += 0.32
    }

    // 球2 速度ベクトル v2
    const v2Vec = new THREE.Vector3(p2.vx, 0, p2.vz)
    const v2Len = v2Vec.length() * vScale
    const p2Center = new THREE.Vector3(p2.x, rBall, p2.z)
    arrowV2.setVector(p2Center, v2Vec, v2Len)
    labelV2.visible = v2Len > 0.08
    if (v2Len > 0.08) {
      labelV2.position.copy(p2Center).addScaledVector(v2Vec.clone().normalize(), v2Len + 0.35)
      labelV2.position.y += 0.35
    }

    // 分解ベクトル vn, vt
    if (showDecomposedVectors.value && hasCollided) {
      const phi = collisionMetrics.value.phi
      const nDir = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi))
      const tDir = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi))
      const vnVal = collisionMetrics.value.v1n_prime * 0.78 * vScale
      const vtVal = collisionMetrics.value.v1t * 0.78 * vScale

      if (Math.abs(vnVal) > 0.08) {
        const dir = nDir.clone().multiplyScalar(Math.sign(vnVal))
        arrowVn.setVector(p1Center, dir, Math.abs(vnVal))
        labelVn.visible = true
        labelVn.position.copy(p1Center).addScaledVector(dir, Math.abs(vnVal) + 0.32)
        labelVn.position.y += 0.15
      } else {
        arrowVn.visible = false
        labelVn.visible = false
      }

      if (Math.abs(vtVal) > 0.08) {
        const dir = tDir.clone().multiplyScalar(Math.sign(vtVal))
        arrowVt.setVector(p1Center, dir, Math.abs(vtVal))
        labelVt.visible = true
        labelVt.position.copy(p1Center).addScaledVector(dir, Math.abs(vtVal) + 0.32)
        labelVt.position.y += 0.15
      } else {
        arrowVt.visible = false
        labelVt.visible = false
      }
    } else {
      arrowVn.visible = false
      arrowVt.visible = false
      labelVn.visible = false
      labelVt.visible = false
    }
  } else {
    // 壁面衝突モード
    wallGroup.visible = true
    sphere2.visible = false
    cmMesh.visible = false
    labelCM.visible = false
    tLine2.line.visible = false
    tLineCM.line.visible = false

    sphere1.scale.set(1, 1, 1)
    sphere1.position.set(wallBall.x, rBall, wallBall.z)
    updateTrailLine(tLine1, wallTrail, 0.04)

    if (showNormals.value) {
      normalLine.visible = true
      const nAttr = normalLine.geometry.getAttribute('position')
      nAttr.setXYZ(0, 0, 0.03, wallWorldZ)
      nAttr.setXYZ(1, 0, 0.03, -2.8)
      nAttr.needsUpdate = true
      tangentLine.visible = false
      labelNormal.visible = true
      labelNormal.position.set(0, 0.38, -2.9)
      labelTangent.visible = false
    } else {
      normalLine.visible = false
      tangentLine.visible = false
      labelNormal.visible = false
      labelTangent.visible = false
    }

    const bCenter = new THREE.Vector3(wallBall.x, rBall, wallBall.z)
    const vVec = new THREE.Vector3(wallBall.vx, 0, wallBall.vz)
    const vLen = vVec.length() * vScale
    arrowV1.setVector(bCenter, vVec, vLen)
    labelV1.visible = true
    if (lastLabelV1Text !== 'v') {
      lastLabelV1Text = 'v'
      labelV1.updateText('v', '#7dd3fc', '#38bdf8')
    }
    labelV1.position.copy(bCenter).addScaledVector(vVec.clone().normalize(), vLen + 0.35)
    labelV1.position.y += 0.35

    arrowV2.visible = false
    labelV2.visible = false

    if (showDecomposedVectors.value) {
      const vtLen = Math.abs(wallBall.vx) * vScale
      const vnLen = Math.abs(wallBall.vz) * vScale
      arrowVt.setVector(bCenter, new THREE.Vector3(Math.sign(wallBall.vx), 0, 0), vtLen)
      labelVt.visible = vtLen > 0.08
      labelVt.position.set(wallBall.x + Math.sign(wallBall.vx) * (vtLen + 0.32), rBall + 0.2, wallBall.z)

      arrowVn.setVector(bCenter, new THREE.Vector3(0, 0, Math.sign(wallBall.vz)), vnLen)
      labelVn.visible = vnLen > 0.08
      labelVn.position.set(wallBall.x - 0.35, rBall + 0.2, wallBall.z + Math.sign(wallBall.vz) * (vnLen + 0.32))
    } else {
      arrowVn.visible = false
      arrowVt.visible = false
      labelVn.visible = false
      labelVt.visible = false
    }
  }
}

watch(
  [impactParamMm, restitutionE, massRatio, initialSpeedMs, wallAlphaDeg, wallE, wallSpeedMs],
  () => {
    launchSimulation()
  }
)

watch([showDecomposedVectors, showNormals, showTrails], () => {
  syncThreeScene()
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
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 18px;
  margin: 24px 0;
  color: #f8fafc;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #f8fafc;
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
  font-size: 0.86rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 8px 0 12px;
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
  margin-top: 10px;
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
.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 10px 16px;
  margin-top: 10px;
}
.main-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-primary {
  background: #0284c7;
  color: #fff;
}
.btn-secondary {
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.speed-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid #334155;
  border-radius: 10px !important;
  padding: 4px 10px;
}
.control-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  white-space: nowrap;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  background: #0f172a;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #334155;
}
.select-btn {
  padding: 5px 10px;
  font-size: 0.8rem;
  background: transparent;
  color: #cbd5e1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}
.select-btn.active {
  background: #0284c7;
  color: #ffffff;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  margin-top: 12px;
  border-radius: 12px;
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
.dot-v1 { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-v2 { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.dot-vn { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-vt { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-cm { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
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
.control-panel {
  margin-top: 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.control-group label {
  display: flex;
  flex-direction: column;
  align-items: stretch !important;
  gap: 6px;
  font-size: 0.85rem;
  color: #cbd5e1;
}
.control-group label span {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-left: 0 !important;
}
.control-group label strong {
  color: #38bdf8;
  font-family: monospace;
}
.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
  width: 100%;
}
.display-toggles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.toggle-btn {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid #334155;
  color: #cbd5e1;
  cursor: pointer;
}
.toggle-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}
.mode-selector {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.mode-btn {
  flex: 1;
  min-width: 240px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.mode-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}
.badge-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.angle-badge {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  line-height: 1.4;
}
.angle-badge.rightAngle {
  background: rgba(52, 211, 153, 0.2);
  border-color: #34d399;
  color: #34d399;
}
.angle-badge.wall-badge {
  border-color: #fbbf24;
  color: #fbbf24;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 300px;
  }
  .speed-control-group {
    border-radius: 12px !important;
    width: 100%;
  }
  .badge-strip {
    justify-content: flex-start;
  }
  .angle-badge {
    border-radius: 10px;
    font-size: 0.76rem;
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
.preset-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.preset-btn {
  padding: 5px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #e2e8f0;
  cursor: pointer;
}
.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  color: #38bdf8;
}
.stat-card .value.success {
  color: #10b981;
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
