<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🕰️ 単振り子（Simple Pendulum）インタラクティブ実験室</span>
      <span class="sim-badge">ルンゲ＝クッタ高精度解法</span>
    </div>

    <!-- Canvas表示部 -->
    <div class="canvas-wrapper">
      <canvas 
        ref="canvasRef" 
        width="700" 
        height="380"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      ></canvas>
      <div v-if="isDragging" class="drag-hint">角度: {{ (theta * 180 / Math.PI).toFixed(1) }}°</div>
      <div class="canvas-tip">💡 おもりをドラッグして好きな角度から離せます</div>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-grid">
      <div class="control-item">
        <label>
          糸の長さ $L$: <strong>{{ length.toFixed(2) }} m</strong>
        </label>
        <input type="range" v-model.number="length" min="0.5" max="2.5" step="0.05" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          初期角度 $\theta_0$: <strong>{{ initialAngleDeg }}°</strong>
        </label>
        <input type="range" v-model.number="initialAngleDeg" min="5" max="85" step="1" @input="onAngleSliderChange" />
      </div>

      <div class="control-item">
        <label>
          おもりの質量 $m$: <strong>{{ mass.toFixed(1) }} kg</strong>
        </label>
        <input type="range" v-model.number="mass" min="0.2" max="5.0" step="0.1" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          重力加速度 $g$: <strong>{{ g.toFixed(2) }} m/s²</strong>
        </label>
        <input type="range" v-model.number="g" min="1.6" max="25" step="0.1" @input="onParamChange" />
      </div>
    </div>

    <!-- プリセット・環境設定 -->
    <div class="preset-buttons">
      <span class="preset-label">重力プリセット:</span>
      <button :class="{ active: Math.abs(g - 9.8) < 0.05 }" @click="setGravity(9.8)">🌍 地球 (9.8)</button>
      <button :class="{ active: Math.abs(g - 1.62) < 0.05 }" @click="setGravity(1.62)">🌕 月 (1.62)</button>
      <button :class="{ active: Math.abs(g - 24.79) < 0.05 }" @click="setGravity(24.79)">🪐 木星 (24.8)</button>
      <button :class="{ active: Math.abs(g - 3.72) < 0.05 }" @click="setGravity(3.72)">🔴 火星 (3.72)</button>
    </div>

    <!-- アクションボタンとオプション -->
    <div class="action-buttons">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ スタート' }}
      </button>
      <button class="btn btn-secondary" @click="resetSim">
        ⏮ リセット
      </button>

      <label class="toggle-label">
        <input type="checkbox" v-model="airResistance" />
        空気抵抗（微小減衰）
      </label>

      <label class="toggle-label">
        <input type="checkbox" v-model="showVectors" />
        速度ベクトル表示
      </label>

      <label class="toggle-label">
        <input type="checkbox" v-model="showTrail" />
        軌跡表示
      </label>
    </div>

    <!-- エネルギー保存メーター -->
    <div class="energy-panel">
      <div class="energy-header">
        <span>⚡ 力学的エネルギー保存 ($E = K + U$)</span>
        <span class="total-energy-val">{{ totalEnergy.toFixed(2) }} J</span>
      </div>
      <div class="energy-bar-wrap">
        <div 
          class="bar-kinetic" 
          :style="{ width: kineticRatio + '%' }"
          :title="`運動エネルギー K: ${kineticEnergy.toFixed(2)} J`"
        >
          <span v-if="kineticRatio > 15">K (運動)</span>
        </div>
        <div 
          class="bar-potential" 
          :style="{ width: potentialRatio + '%' }"
          :title="`位置エネルギー U: ${potentialEnergy.toFixed(2)} J`"
        >
          <span v-if="potentialRatio > 15">U (位置)</span>
        </div>
      </div>
      <div class="energy-legend">
        <span class="legend-item"><span class="dot kinetic"></span> 運動エネルギー $K = \frac{1}{2}mv^2$: <strong>{{ kineticEnergy.toFixed(2) }} J</strong></span>
        <span class="legend-item"><span class="dot potential"></span> 位置エネルギー $U = mgh$: <strong>{{ potentialEnergy.toFixed(2) }} J</strong></span>
      </div>
    </div>

    <!-- 理論値データ表示カード -->
    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">理論周期 $T_0$（微小振幅）</div>
        <div class="stat-value">{{ theoreticalPeriod.toFixed(3) }} <span class="unit">s</span></div>
        <div class="stat-formula">$T_0 = 2\pi\sqrt{\frac{L}{g}}$</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在角度 $\theta$</div>
        <div class="stat-value">{{ currentAngleDeg.toFixed(1) }} <span class="unit">°</span></div>
        <div class="stat-formula">角速度 $\omega = {{ omega.toFixed(2) }} \text{ rad/s}$</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在速度 $v$</div>
        <div class="stat-value">{{ currentSpeed.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">$v = L \frac{d\theta}{dt}$</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const length = ref(1.5) // m
const initialAngleDeg = ref(30) // deg
const mass = ref(1.0) // kg
const g = ref(9.8) // m/s^2
const airResistance = ref(false)
const showVectors = ref(true)
const showTrail = ref(true)

// シミュレーション状態
const isPlaying = ref(true)
const isDragging = ref(false)

let theta = (initialAngleDeg.value * Math.PI) / 180
let omega = 0 // d(theta)/dt
const currentAngleDeg = ref(initialAngleDeg.value)
const currentSpeed = ref(0)
const omegaDisplay = ref(0)

let animId = null
let trail = []
const MAX_TRAIL_LENGTH = 70

// 画面スケール設定 (ピクセル / メートル)
const PIVOT_X = 350
const PIVOT_Y = 60
const PIXELS_PER_METER = 110

// 計算値
const theoreticalPeriod = computed(() => {
  return 2 * Math.PI * Math.sqrt(length.value / g.value)
})

// 位置エネルギー (最下点を基準 h = 0)
const potentialEnergy = computed(() => {
  const h = length.value * (1 - Math.cos(theta))
  return mass.value * g.value * h
})

// 運動エネルギー
const kineticEnergy = computed(() => {
  const v = length.value * omega
  return 0.5 * mass.value * v * v
})

const totalEnergy = computed(() => {
  return kineticEnergy.value + potentialEnergy.value
})

const kineticRatio = computed(() => {
  const tot = totalEnergy.value
  if (tot <= 0.0001) return 0
  return Math.min(100, Math.max(0, (kineticEnergy.value / tot) * 100))
})

const potentialRatio = computed(() => {
  const tot = totalEnergy.value
  if (tot <= 0.0001) return 100
  return Math.min(100, Math.max(0, (potentialEnergy.value / tot) * 100))
})

// ルンゲ＝クッタ 4次法 (RK4) による運動方程式の数値積分
// dθ/dt = ω
// dω/dt = - (g / L) * sin(θ) - (damping) * ω
function rk4Step(dt) {
  const L = length.value
  const grav = g.value
  const damping = airResistance.value ? 0.08 : 0.0

  const f1_theta = (w) => w
  const f1_omega = (th, w) => -(grav / L) * Math.sin(th) - damping * w

  // k1
  const k1_th = f1_theta(omega)
  const k1_w = f1_omega(theta, omega)

  // k2
  const th_half1 = theta + 0.5 * dt * k1_th
  const w_half1 = omega + 0.5 * dt * k1_w
  const k2_th = f1_theta(w_half1)
  const k2_w = f1_omega(th_half1, w_half1)

  // k3
  const th_half2 = theta + 0.5 * dt * k2_th
  const w_half2 = omega + 0.5 * dt * k2_w
  const k3_th = f1_theta(w_half2)
  const k3_w = f1_omega(th_half2, w_half2)

  // k4
  const th_full = theta + dt * k3_th
  const w_full = omega + dt * k3_w
  const k4_th = f1_theta(w_full)
  const k4_w = f1_omega(th_full, w_full)

  // 更新
  theta += (dt / 6) * (k1_th + 2 * k2_th + 2 * k3_th + k4_th)
  omega += (dt / 6) * (k1_w + 2 * k2_w + 2 * k3_w + k4_w)
}

function setGravity(newG) {
  g.value = newG
}

function onParamChange() {
  drawScene()
}

function onAngleSliderChange() {
  theta = (initialAngleDeg.value * Math.PI) / 180
  omega = 0
  trail = []
  drawScene()
}

function resetSim() {
  theta = (initialAngleDeg.value * Math.PI) / 180
  omega = 0
  trail = []
  drawScene()
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    lastTime = performance.now()
    animate()
  }
}

// マウス・タッチドラッグ操作
function getMouseAngle(event) {
  const canvas = canvasRef.value
  if (!canvas) return 0
  const rect = canvas.getBoundingClientRect()
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)

  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  const mouseX = (clientX - rect.left) * scaleX
  const mouseY = (clientY - rect.top) * scaleY

  const dx = mouseX - PIVOT_X
  const dy = mouseY - PIVOT_Y
  return Math.atan2(dx, dy)
}

function onMouseDown(e) {
  isDragging.value = true
  omega = 0
  trail = []
  theta = getMouseAngle(e)
  initialAngleDeg.value = Math.round(Math.abs((theta * 180) / Math.PI))
  drawScene()
}

function onMouseMove(e) {
  if (!isDragging.value) return
  theta = getMouseAngle(e)
  initialAngleDeg.value = Math.round(Math.abs((theta * 180) / Math.PI))
  drawScene()
}

function onMouseUp() {
  if (isDragging.value) {
    isDragging.value = false
    omega = 0
  }
}

function onTouchStart(e) {
  if (e.touches.length > 0) {
    isDragging.value = true
    omega = 0
    trail = []
    theta = getMouseAngle(e)
    initialAngleDeg.value = Math.round(Math.abs((theta * 180) / Math.PI))
    drawScene()
  }
}

function onTouchMove(e) {
  if (!isDragging.value) return
  theta = getMouseAngle(e)
  initialAngleDeg.value = Math.round(Math.abs((theta * 180) / Math.PI))
  drawScene()
}

function onTouchEnd() {
  onMouseUp()
}

// 描画処理
function drawScene() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  // 背景グリッド描画
  ctx.strokeStyle = '#27272a'
  ctx.lineWidth = 1
  const gridSize = 30
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 中心線（鉛直点線）
  ctx.strokeStyle = '#52525b'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(PIVOT_X, PIVOT_Y)
  ctx.lineTo(PIVOT_X, PIVOT_Y + length.value * PIXELS_PER_METER + 50)
  ctx.stroke()
  ctx.setLineDash([])

  // おもりの位置計算
  const bobRadius = 14 + mass.value * 2.5
  const bobDistance = length.value * PIXELS_PER_METER
  const bobX = PIVOT_X + bobDistance * Math.sin(theta)
  const bobY = PIVOT_Y + bobDistance * Math.cos(theta)

  // 軌跡の追加と描画
  if (showTrail.value) {
    if (isPlaying.value && !isDragging.value) {
      trail.push({ x: bobX, y: bobY })
      if (trail.length > MAX_TRAIL_LENGTH) trail.shift()
    }
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.6
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
        ctx.lineTo(trail[i].x, trail[i].y)
        ctx.stroke()
      }
    }
  }

  // 角度弧の描画
  if (Math.abs(theta) > 0.05) {
    const arcRadius = 45
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    const startA = Math.PI / 2
    const endA = Math.PI / 2 + theta
    ctx.arc(PIVOT_X, PIVOT_Y, arcRadius, Math.min(startA, endA), Math.max(startA, endA))
    ctx.stroke()

    // 角度テキスト
    ctx.fillStyle = '#f59e0b'
    ctx.font = '12px Outfit, sans-serif'
    const midA = (startA + endA) / 2
    ctx.fillText(`${Math.abs((theta * 180) / Math.PI).toFixed(1)}°`, PIVOT_X + (arcRadius + 15) * Math.cos(midA) - 10, PIVOT_Y + (arcRadius + 15) * Math.sin(midA) + 4)
  }

  // 糸の描画
  ctx.strokeStyle = '#e4e4e7'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(PIVOT_X, PIVOT_Y)
  ctx.lineTo(bobX, bobY)
  ctx.stroke()

  // 支点の描画（壁とピン）
  ctx.fillStyle = '#71717a'
  ctx.fillRect(PIVOT_X - 30, PIVOT_Y - 10, 60, 10)
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(PIVOT_X, PIVOT_Y, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  // 速度ベクトルの描画（接線方向）
  if (showVectors.value) {
    const v = length.value * omega
    const vectorScale = 18
    const vx = v * Math.cos(theta) * vectorScale
    const vy = -v * Math.sin(theta) * vectorScale

    if (Math.abs(v) > 0.05) {
      ctx.strokeStyle = '#10b981'
      ctx.fillStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(bobX, bobY)
      ctx.lineTo(bobX + vx, bobY + vy)
      ctx.stroke()

      // 矢じり
      const angleV = Math.atan2(vy, vx)
      ctx.beginPath()
      ctx.moveTo(bobX + vx, bobY + vy)
      ctx.lineTo(bobX + vx - 10 * Math.cos(angleV - Math.PI / 6), bobY + vy - 10 * Math.sin(angleV - Math.PI / 6))
      ctx.lineTo(bobX + vx - 10 * Math.cos(angleV + Math.PI / 6), bobY + vy - 10 * Math.sin(angleV + Math.PI / 6))
      ctx.closePath()
      ctx.fill()
    }
  }

  // おもりの描画（リッチなグラデーション球）
  const grad = ctx.createRadialGradient(
    bobX - bobRadius * 0.3,
    bobY - bobRadius * 0.3,
    bobRadius * 0.1,
    bobX,
    bobY,
    bobRadius
  )
  grad.addColorStop(0, '#a855f7')
  grad.addColorStop(0.7, '#7c3aed')
  grad.addColorStop(1, '#4c1d95')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#c084fc'
  ctx.lineWidth = 2
  ctx.stroke()

  // おもりのハイライト点
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.arc(bobX - bobRadius * 0.3, bobY - bobRadius * 0.3, bobRadius * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // 表示用ステートの同期
  currentAngleDeg.value = (theta * 180) / Math.PI
  currentSpeed.value = Math.abs(length.value * omega)
  omegaDisplay.value = omega
}

let lastTime = 0
function animate(currentTime) {
  if (!isPlaying.value) return

  if (!lastTime) lastTime = currentTime
  let dt = (currentTime - lastTime) / 1000
  lastTime = currentTime

  // 大きすぎるdtのスキップ（タブ切り替え対策）
  if (dt > 0.1) dt = 0.1

  // 物理の小刻みサブステップ計算でさらに安定化
  if (!isDragging.value) {
    const subSteps = 8
    const subDt = dt / subSteps
    for (let i = 0; i < subSteps; i++) {
      rk4Step(subDt)
    }
  }

  drawScene()
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  drawScene()
  lastTime = performance.now()
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: linear-gradient(145deg, #18181b, #09090b);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: inherit;
  color: #f4f4f5;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sim-title {
  font-size: 1.15rem;
  font-weight: 700;
  background: linear-gradient(90deg, #c084fc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sim-badge {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}

.canvas-wrapper {
  position: relative;
  background: #09090b;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #27272a;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  width: 100%;
  max-width: 700px;
  height: auto;
  cursor: grab;
  touch-action: none;
}

canvas:active {
  cursor: grabbing;
}

.drag-hint {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.canvas-tip {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 0.75rem;
  color: #a1a1aa;
  pointer-events: none;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0 1rem;
}

.control-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.control-item label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: #d4d4d8;
}

.control-item input[type='range'] {
  width: 100%;
  accent-color: #a855f7;
  cursor: pointer;
}

.preset-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.preset-label {
  color: #a1a1aa;
}

.preset-buttons button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.preset-buttons button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.preset-buttons button.active {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  color: #c084fc;
}

.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f4f4f5;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #a1a1aa;
  cursor: pointer;
  margin-left: 0.5rem;
}

.toggle-label input {
  accent-color: #a855f7;
}

/* エネルギーメーター */
.energy-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
}

.energy-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #e4e4e7;
}

.total-energy-val {
  color: #38bdf8;
}

.energy-bar-wrap {
  display: flex;
  height: 22px;
  background: #18181b;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #27272a;
  margin-bottom: 0.6rem;
}

.bar-kinetic {
  background: linear-gradient(90deg, #10b981, #34d399);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #064e3b;
  transition: width 0.05s linear;
}

.bar-potential {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #78350f;
  transition: width 0.05s linear;
}

.energy-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.8rem;
  color: #a1a1aa;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.kinetic {
  background: #10b981;
}

.dot.potential {
  background: #f59e0b;
}

/* 統計カード */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
}

.stat-card.highlight {
  border-color: rgba(168, 85, 247, 0.4);
  background: rgba(168, 85, 247, 0.05);
}

.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #f4f4f5;
}

.stat-value .unit {
  font-size: 0.85rem;
  color: #a1a1aa;
  font-weight: 400;
}

.stat-formula {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.3rem;
}
</style>
