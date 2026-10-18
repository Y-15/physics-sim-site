<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎱</span>
        <h3>2次元平面衝突・斜め衝突ハイエンド物理シミュレーター</h3>
      </div>
      <p class="subtitle">
        ビリヤードの球同士の衝突から、壁面との斜め反射まで。
        接触面の法線方向（運動量保存＋反発係数 <i>e</i>）と接線方向（外力ゼロで速度成分不変）のベクトル直交分解を、
        リアルタイムのベクトル描画と衝撃波エフェクトで直感的に完全攻略できます。
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
          ✨ 軌跡
        </button>
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas
        ref="canvasRef"
        @mousedown="handleCanvasPointerDown"
        @mousemove="handleCanvasPointerMove"
        @mouseup="handleCanvasPointerUp"
        @mouseleave="handleCanvasPointerUp"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
      ></canvas>
      
      <!-- モード別バッジ -->
      <div v-if="currentMode === 'balls'" class="angle-badge" :class="{ rightAngle: isNearlyRightAngle }">
        <span>散乱角 <i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>: <strong>{{ totalScatteringAngleDeg.toFixed(1) }}°</strong> {{ isNearlyRightAngle ? '✨ 直角 90° 分離証明成立!' : '' }}</span>
      </div>
      <div v-else class="angle-badge wall-badge">
        <span>入射角 <i>α</i>: <strong>{{ wallAlphaDeg }}°</strong> → 反射角 <i>β</i>: <strong>{{ wallBetaDeg.toFixed(1) }}°</strong> (tan <i>β</i> / tan <i>α</i> = <strong>{{ (1/wallE).toFixed(2) }}</strong>)</span>
      </div>

      <div class="interactive-hint">
        💡 マウスドラッグで球の位置（衝突パラメータ・角度）を直接調整できます
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
            <button class="preset-btn" @click="wallAlphaDeg = 30; wallE = 0.5; launchSimulation()">非弾性衝突 (e = 0.5, β > α)</button>
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
        <span class="subtext">エネルギー保持率: {{ ((wallVFinal**2 / wallSpeedMs**2)*100).toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { setupCanvas } from './simUtils.js'

const canvasRef = ref(null)
const currentMode = ref('balls') // 'balls' | 'wall'

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

function setMode(mode) {
  currentMode.value = mode
  launchSimulation()
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepForward() {
  isRunning.value = false
  updatePhysics(1.0)
}

// 2球衝突の物理計算
const collisionMetrics = computed(() => {
  const b = impactParamMm.value
  const R = 20
  const dist = 2 * R
  if (Math.abs(b) >= dist) {
    return {
      v1: initialSpeedMs.value, theta1: 0,
      v2: 0, theta2: 0,
      lossJ: 0, lossPct: 0,
      phi: 0, v1x: initialSpeedMs.value, v1y: 0, v2x: 0, v2y: 0,
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
  const v1y = v1n_prime * sinPhi + v1t_prime * cosPhi
  const v2x = v2n_prime * cosPhi - v2t_prime * sinPhi
  const v2y = v2n_prime * sinPhi + v2t_prime * cosPhi

  const v1Final = Math.hypot(v1x, v1y)
  const v2Final = Math.hypot(v2x, v2y)

  const th1 = Math.abs(Math.atan2(v1y, v1x)) * (180 / Math.PI)
  const th2 = Math.abs(Math.atan2(v2y, v2x)) * (180 / Math.PI)

  const E_init = 0.5 * mass1 * v0 ** 2
  const E_final = 0.5 * mass1 * v1Final ** 2 + 0.5 * mass2 * v2Final ** 2
  const lossJ = Math.max(0, E_init - E_final)
  const lossPct = E_init > 0 ? (lossJ / E_init) * 100 : 0

  return {
    v1: v1Final, theta1: th1,
    v2: v2Final, theta2: th2,
    v1x, v1y, v2x, v2y,
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

// アニメーション状態
let animId = null
const R = 20
const CANVAS_W = 720
const CANVAS_H = 340

// 2球衝突用
let p1 = { x: 80, y: 170, vx: 5, vy: 0 }
let p2 = { x: 340, y: 170, vx: 0, vy: 0 }
let trail1 = []
let trail2 = []
let hasCollided = false
let shockwave = { active: false, x: 0, y: 0, r: 0, maxR: 35, alpha: 1 }

// 壁面衝突用
let wallBall = { x: 120, y: 70, vx: 3, vy: 3 }
let wallTrail = []
let wallHasBounced = false
let wallShockwave = { active: false, x: 0, y: 0, r: 0, maxR: 40, alpha: 1 }
const wallY = 220 // 壁の位置

function launchSimulation() {
  if (currentMode.value === 'balls') {
    const centerY = 170
    p1.x = 80
    p1.y = centerY - impactParamMm.value
    p1.vx = initialSpeedMs.value * 1.5
    p1.vy = 0

    p2.x = 340
    p2.y = centerY
    p2.vx = 0
    p2.vy = 0

    trail1 = []
    trail2 = []
    hasCollided = false
    shockwave.active = false
  } else {
    // 壁面衝突
    const alpha = wallRadAlpha.value
    const speed = wallSpeedMs.value * 1.4
    const contactX = 360
    const contactY = wallY - R
    const vx0 = speed * Math.sin(alpha)
    const vy0 = speed * Math.cos(alpha)

    const dt = 60
    wallBall.x = contactX - vx0 * dt
    wallBall.y = contactY - vy0 * dt
    wallBall.vx = vx0
    wallBall.vy = vy0

    wallTrail = []
    wallHasBounced = false
    wallShockwave.active = false
  }
}

function updatePhysics(scaleFactor = 1.0) {
  const scale = (timeScale.value * scaleFactor)

  if (currentMode.value === 'balls') {
    p1.x += p1.vx * scale
    p1.y += p1.vy * scale
    p2.x += p2.vx * scale
    p2.y += p2.vy * scale

    if (showTrails.value) {
      trail1.push({ x: p1.x, y: p1.y })
      trail2.push({ x: p2.x, y: p2.y })
      if (trail1.length > 80) trail1.shift()
      if (trail2.length > 80) trail2.shift()
    }

    if (!hasCollided) {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const dist = Math.hypot(dx, dy)
      if (dist <= 2 * R) {
        hasCollided = true
        shockwave.active = true
        shockwave.x = (p1.x + p2.x) / 2
        shockwave.y = (p1.y + p2.y) / 2
        shockwave.r = 2
        shockwave.alpha = 1.0

        const m = collisionMetrics.value
        p1.vx = m.v1x * 1.5
        p1.vy = m.v1y * 1.5
        p2.vx = m.v2x * 1.5
        p2.vy = m.v2y * 1.5
      }
    }

    if (shockwave.active) {
      shockwave.r += 2 * scale
      shockwave.alpha -= 0.04 * scale
      if (shockwave.alpha <= 0) shockwave.active = false
    }

    if (p1.x > 760 || p2.x > 760 || p1.y < -60 || p1.y > 400) {
      launchSimulation()
    }
  } else {
    // 壁面衝突物理更新
    wallBall.x += wallBall.vx * scale
    wallBall.y += wallBall.vy * scale

    if (showTrails.value) {
      wallTrail.push({ x: wallBall.x, y: wallBall.y })
      if (wallTrail.length > 90) wallTrail.shift()
    }

    if (!wallHasBounced && wallBall.y >= wallY - R) {
      wallHasBounced = true
      wallBall.y = wallY - R
      wallShockwave.active = true
      wallShockwave.x = wallBall.x
      wallShockwave.y = wallY
      wallShockwave.r = 2
      wallShockwave.alpha = 1.0

      // 反射後の速度
      const speed = wallSpeedMs.value * 1.4
      const alpha = wallRadAlpha.value
      const vt = speed * Math.sin(alpha)
      const vnBefore = speed * Math.cos(alpha)
      const vnAfter = wallE.value * vnBefore

      wallBall.vx = vt
      wallBall.vy = -vnAfter
    }

    if (wallShockwave.active) {
      wallShockwave.r += 2 * scale
      wallShockwave.alpha -= 0.04 * scale
      if (wallShockwave.alpha <= 0) wallShockwave.active = false
    }

    if (wallBall.x > 760 || wallBall.y < -50) {
      launchSimulation()
    }
  }
}

// ドラッグ操作処理
let isDragging = false

function handleCanvasPointerDown(e) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = CANVAS_W / rect.width
  const scaleY = CANVAS_H / rect.height
  const mx = (e.clientX - rect.left) * scaleX
  const my = (e.clientY - rect.top) * scaleY

  if (currentMode.value === 'balls') {
    if (Math.hypot(mx - p1.x, my - p1.y) < 35) {
      isDragging = true
    }
  } else {
    if (Math.hypot(mx - wallBall.x, my - wallBall.y) < 35) {
      isDragging = true
    }
  }
}

function handleCanvasPointerMove(e) {
  if (!isDragging) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = CANVAS_W / rect.width
  const scaleY = CANVAS_H / rect.height
  const mx = (e.clientX - rect.left) * scaleX
  const my = (e.clientY - rect.top) * scaleY

  if (currentMode.value === 'balls') {
    const centerY = 170
    const b = centerY - my
    impactParamMm.value = Math.max(-28, Math.min(28, Math.round(b)))
    p1.y = centerY - impactParamMm.value
  } else {
    // 壁面衝突の角度変更
    const contactX = 360
    const contactY = wallY - R
    const dx = contactX - mx
    const dy = contactY - my
    if (dy > 20 && dx > 0) {
      const rad = Math.atan2(dx, dy)
      wallAlphaDeg.value = Math.max(10, Math.min(75, Math.round((rad * 180) / Math.PI)))
    }
  }
}

function handleCanvasPointerUp() {
  if (isDragging) {
    isDragging = false
    launchSimulation()
  }
}

function handleTouchStart(e) {
  if (e.touches.length > 0) handleCanvasPointerDown(e.touches[0])
}
function handleTouchMove(e) {
  if (e.touches.length > 0) handleCanvasPointerMove(e.touches[0])
}
function handleTouchEnd() {
  handleCanvasPointerUp()
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = CANVAS_W
  const h = CANVAS_H

  ctx.clearRect(0, 0, w, h)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#0a0e17')
  bg.addColorStop(1, '#131b2e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // グリッド線
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
  ctx.lineWidth = 1
  for (let x = 40; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 40; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // 物理更新
  if (isRunning.value) {
    updatePhysics(1.0)
  }

  if (currentMode.value === 'balls') {
    drawBallsMode(ctx, w, h)
  } else {
    drawWallMode(ctx, w, h)
  }

  animId = requestAnimationFrame(draw)
}

function drawBallsMode(ctx, w, h) {
  // 基準中心線
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(30, 170); ctx.lineTo(w - 30, 170)
  ctx.stroke()
  ctx.setLineDash([])

  // 衝突時の法線と接線を描画
  if (showNormals.value && hasCollided) {
    const phi = collisionMetrics.value.phi
    ctx.save()
    ctx.translate(340, 170)
    ctx.rotate(phi)

    // 法線 n
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'
    ctx.lineWidth = 1.8
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(-120, 0); ctx.lineTo(120, 0)
    ctx.stroke()
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('法線 n (運動量保存＋反発係数 e)', 40, -8)

    // 接線 t
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'
    ctx.beginPath()
    ctx.moveTo(0, -110); ctx.lineTo(0, 110)
    ctx.stroke()
    ctx.fillStyle = '#10b981'
    ctx.fillText('接線 t (速度保存)', 8, -80)
    ctx.setLineDash([])
    ctx.restore()
  }

  // ショックウェーブ（衝突エフェクト）
  if (shockwave.active) {
    ctx.save()
    ctx.strokeStyle = `rgba(56, 189, 248, ${shockwave.alpha})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(shockwave.x, shockwave.y, shockwave.r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // 軌跡描画
  if (showTrails.value) {
    drawPath(ctx, trail1, 'rgba(56, 189, 248, 0.45)')
    drawPath(ctx, trail2, 'rgba(251, 191, 36, 0.45)')
  }

  // 球1
  drawSphere(ctx, p1.x, p1.y, R, '#38bdf8', '1', 'm₁')
  // 球2
  drawSphere(ctx, p2.x, p2.y, R, '#fbbf24', '2', 'm₂')

  // 速度ベクトル
  drawArrow(ctx, p1.x, p1.y, p1.x + p1.vx * 7, p1.y + p1.vy * 7, '#38bdf8', 'v₁')
  drawArrow(ctx, p2.x, p2.y, p2.x + p2.vx * 7, p2.y + p2.vy * 7, '#fbbf24', 'v₂')

  // ベクトル直交分解成分表示
  if (showDecomposedVectors.value && hasCollided) {
    const phi = collisionMetrics.value.phi
    const cosP = Math.cos(phi), sinP = Math.sin(phi)
    // 球1の法線・接線成分
    const v1n = collisionMetrics.value.v1n_prime * 1.5
    const v1t = collisionMetrics.value.v1t * 1.5
    drawArrow(ctx, p1.x, p1.y, p1.x + v1n * cosP * 7, p1.y + v1n * sinP * 7, '#ef4444', 'v₁n', [2, 2])
    drawArrow(ctx, p1.x, p1.y, p1.x - v1t * sinP * 7, p1.y + v1t * cosP * 7, '#10b981', 'v₁t', [2, 2])
  }
}

function drawWallMode(ctx, w, h) {
  const contactX = 360

  // 壁面（水平面）
  ctx.save()
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, wallY, w, h - wallY)

  // 壁面表面ライン
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, wallY); ctx.lineTo(w, wallY)
  ctx.stroke()

  // ハッチング
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)'
  ctx.lineWidth = 1.5
  for (let x = 10; x < w; x += 24) {
    ctx.beginPath()
    ctx.moveTo(x, wallY)
    ctx.lineTo(x - 12, wallY + 16)
    ctx.stroke()
  }
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('なめらかな壁面（接線 t 軸・力積ゼロ）', 20, wallY + 30)
  ctx.restore()

  // 法線 n 軸（垂線）
  if (showNormals.value) {
    ctx.save()
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(contactX, 20); ctx.lineTo(contactX, wallY)
    ctx.stroke()
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('法線 n (反発係数 e)', contactX + 8, 40)
    ctx.setLineDash([])
    ctx.restore()
  }

  // 角度弧の描画
  ctx.save()
  const arcR = 45
  // 入射角 α
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.beginPath()
  const radA = wallRadAlpha.value
  ctx.arc(contactX, wallY - R, arcR, -Math.PI / 2 - radA, -Math.PI / 2)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`α=${wallAlphaDeg.value}°`, contactX - arcR - 25, wallY - R - 20)

  // 反射角 β
  if (wallHasBounced) {
    ctx.strokeStyle = '#fbbf24'
    ctx.beginPath()
    const radB = (wallBetaDeg.value * Math.PI) / 180
    ctx.arc(contactX, wallY - R, arcR, -Math.PI / 2, -Math.PI / 2 + radB)
    ctx.stroke()
    ctx.fillStyle = '#fbbf24'
    ctx.fillText(`β=${wallBetaDeg.value.toFixed(1)}°`, contactX + arcR + 10, wallY - R - 20)
  }
  ctx.restore()

  // ショックウェーブ（壁衝突エフェクト）
  if (wallShockwave.active) {
    ctx.save()
    ctx.strokeStyle = `rgba(251, 191, 36, ${wallShockwave.alpha})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(wallShockwave.x, wallShockwave.y, wallShockwave.r, Math.PI, 0)
    ctx.stroke()
    ctx.restore()
  }

  // 軌跡
  if (showTrails.value) {
    drawPath(ctx, wallTrail, '#38bdf8')
  }

  // 小球
  drawSphere(ctx, wallBall.x, wallBall.y, R, '#38bdf8', '', 'm')

  // 速度ベクトル
  drawArrow(ctx, wallBall.x, wallBall.y, wallBall.x + wallBall.vx * 8, wallBall.y + wallBall.vy * 8, '#38bdf8', 'v')

  // 分解ベクトル
  if (showDecomposedVectors.value) {
    // vt (水平成分)
    drawArrow(ctx, wallBall.x, wallBall.y, wallBall.x + wallBall.vx * 8, wallBall.y, '#10b981', 'vt', [2, 2])
    // vn (鉛直成分)
    drawArrow(ctx, wallBall.x, wallBall.y, wallBall.x, wallBall.y + wallBall.vy * 8, '#ef4444', 'vn', [2, 2])
  }
}

function drawSphere(ctx, x, y, r, color, label, massText = '') {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 4

  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.3, color)
  grad.addColorStop(1, '#0f172a')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  if (label) {
    ctx.save()
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x, y)
    ctx.restore()
  }

  if (massText) {
    ctx.save()
    ctx.fillStyle = color
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(massText, x, y + r + 14)
    ctx.restore()
  }
}

function drawPath(ctx, points, color) {
  if (points.length < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.stroke()
  ctx.restore()
}

function drawArrow(ctx, x1, y1, x2, y2, color, label, dash = null) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 3) return

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.2
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.setLineDash([])

  const angle = Math.atan2(dy, dx)
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 9 * Math.cos(angle - 0.4), y2 - 9 * Math.sin(angle - 0.4))
  ctx.lineTo(x2 - 9 * Math.cos(angle + 0.4), y2 - 9 * Math.sin(angle + 0.4))
  ctx.closePath()
  ctx.fill()

  if (label) {
    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(label, x2 + 8 * Math.cos(angle), y2 + 8 * Math.sin(angle))
  }
  ctx.restore()
}

watch([impactParamMm, restitutionE, massRatio, initialSpeedMs, wallAlphaDeg, wallE, wallSpeedMs], () => {
  launchSimulation()
})

onMounted(() => {
  if (canvasRef.value) {
    setupCanvas(canvasRef.value, CANVAS_W, CANVAS_H)
  }
  launchSimulation()
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 10px 16px;
  margin-top: 14px;
}

.main-controls {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
}
.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.btn-secondary:hover {
  background: #334155;
  border-color: #38bdf8;
  color: #ffffff;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
}

.btn-group {
  display: flex;
  background: #0f172a;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #334155;
}

.select-btn {
  padding: 5px 12px;
  font-size: 0.8rem;
  background: transparent;
  color: #cbd5e1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;
}
.select-btn:hover {
  color: #ffffff;
}
.select-btn.active {
  background: #0284c7;
  color: #ffffff;
}

.control-panel {
  margin-top: 14px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
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
  gap: 6px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.control-group label span {
  display: flex;
  justify-content: space-between;
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
}

.toggle-btn {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.mode-selector {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.mode-btn {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #38bdf8;
  color: var(--vp-c-text-1);
}

.mode-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.canvas-wrapper {
  position: relative;
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  cursor: grab;
}
.canvas-wrapper:active {
  cursor: grabbing;
}
.canvas-wrapper canvas {
  display: block;
  width: 100%;
  height: auto;
}

.angle-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
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

.interactive-hint {
  position: absolute;
  bottom: 12px;
  left: 14px;
  font-size: 0.78rem;
  color: rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.6);
  padding: 3px 8px;
  border-radius: 4px;
  pointer-events: none;
}

.preset-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preset-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.preset-buttons {
  display: flex;
  gap: 8px;
}
.preset-btn {
  padding: 5px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: rgba(148, 163, 184, 0.1);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.15s;
}
.preset-btn:hover {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}
</style>
