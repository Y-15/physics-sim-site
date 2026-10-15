<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚖️</span>
        <h3>2体問題・重心運動と相対運動シミュレーター</h3>
      </div>
      <p class="subtitle">ばねでつながれた2物体の運動。外力がないとき、重心Gは等速直線運動（または静止）し、2物体は重心から見て逆位相で単振動します。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="mode-badge" :class="viewMode">
        視点: {{ viewMode === 'lab' ? '実験室系 (床静止)' : '重心静止系 (重心G固定)' }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>物体1 質量 <i>m</i><sub>1</sub>: <strong>{{ m1.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="m1" min="0.5" max="5.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>物体2 質量 <i>m</i><sub>2</sub>: <strong>{{ m2.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="m2" min="0.5" max="5.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>ばね定数 <i>k</i>: <strong>{{ k.toFixed(0) }} N/m</strong></span>
            <input type="range" v-model.number="k" min="10" max="100" step="5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>物体1 初速度 <i>v</i><sub>10</sub>: <strong>{{ v1_init.toFixed(1) }} m/s</strong></span>
            <input type="range" v-model.number="v1_init" min="-4" max="4" step="0.5" @input="resetSim" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 リセット
        </button>
        <button class="btn btn-accent" @click="toggleView">
          👀 視点切替 ({{ viewMode === 'lab' ? '重心系へ' : '実験室系へ' }})
        </button>
      </div>
    </div>

    <!-- 物理量リアルタイム表示モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">重心速度 <i>v</i><sub><i>G</i></sub> (一定)</span>
        <span class="value">{{ vG.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">(<i>m</i><sub>1</sub> <i>v</i><sub>1</sub> + <i>m</i><sub>2</sub> <i>v</i><sub>2</sub>)/(<i>m</i><sub>1</sub>+<i>m</i><sub>2</sub>)</span>
      </div>

      <div class="stat-card">
        <span class="label">換算質量 μ</span>
        <span class="value">{{ mu.toFixed(2) }} <span class="unit">kg</span></span>
        <span class="subtext"><i>m</i><sub>1</sub> <i>m</i><sub>2</sub> / (<i>m</i><sub>1</sub>+<i>m</i><sub>2</sub>)</span>
      </div>

      <div class="stat-card">
        <span class="label">相対単振動の周期 <i>T</i></span>
        <span class="value">{{ period.toFixed(2) }} <span class="unit">s</span></span>
        <span class="subtext">2π√(μ/<i>k</i>)</span>
      </div>

      <div class="stat-card">
        <span class="label">ばねの伸び縮み Δ <i>x</i></span>
        <span class="value" :class="{ positive: deltaX > 0.02, negative: deltaX < -0.02 }">
          {{ deltaX > 0 ? '+' : '' }}{{ (deltaX * 100).toFixed(1) }} <span class="unit">cm</span>
        </span>
        <span class="subtext">{{ deltaX > 0.01 ? '伸び (引力)' : (deltaX < -0.01 ? '縮み (斥力)' : '自然長') }}</span>
      </div>
    </div>

    <!-- エネルギー内訳バー -->
    <div class="energy-card">
      <div class="energy-header">
        <span>力学的エネルギー保存の内訳 (全エネルギー <i>E</i> = {{ totalE.toFixed(1) }} <i>J</i>)</span>
      </div>
      <div class="energy-bar">
        <div class="bar-segment trans" :style="{ width: transEPercent + '%' }" title="重心並進エネルギー"></div>
        <div class="bar-segment rel" :style="{ width: relEPercent + '%' }" title="相対運動エネルギー"></div>
        <div class="bar-segment spring" :style="{ width: springEPercent + '%' }" title="ばね弾性エネルギー"></div>
      </div>
      <div class="legend-row">
        <div class="legend-item"><span class="dot trans"></span>重心並進: {{ transE.toFixed(1) }} J (一定)</div>
        <div class="legend-item"><span class="dot rel"></span>相対運動: {{ relE.toFixed(1) }} J</div>
        <div class="legend-item"><span class="dot spring"></span>ばね弾性: {{ springE.toFixed(1) }} J</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const isRunning = ref(true)
const viewMode = ref('lab') // 'lab' or 'com' (center of mass)

// 物理パラメータ
const m1 = ref(1.0) // kg
const m2 = ref(2.0) // kg
const k = ref(40.0) // N/m
const v1_init = ref(3.0) // m/s
const naturalLength = 1.6 // m (自然長)

// 状態変数 (実験室系座標)
const x1 = ref(1.0)
const v1 = ref(3.0)
const x2 = ref(2.6) // 自然長 1.6m 離れた位置
const v2 = ref(0.0)

// 重心位置
const xG = computed(() => (m1.value * x1.value + m2.value * x2.value) / (m1.value + m2.value))
const vG = computed(() => (m1.value * v1.value + m2.value * v2.value) / (m1.value + m2.value))
const mu = computed(() => (m1.value * m2.value) / (m1.value + m2.value))
const period = computed(() => 2 * Math.PI * Math.sqrt(mu.value / k.value))
const deltaX = computed(() => (x2.value - x1.value) - naturalLength)

// エネルギー
const totalMass = computed(() => m1.value + m2.value)
const transE = computed(() => 0.5 * totalMass.value * (vG.value ** 2))
const relV = computed(() => v2.value - v1.value)
const relE = computed(() => 0.5 * mu.value * (relV.value ** 2))
const springE = computed(() => 0.5 * k.value * (deltaX.value ** 2))
const totalE = computed(() => transE.value + relE.value + springE.value)

const transEPercent = computed(() => totalE.value > 0 ? (transE.value / totalE.value) * 100 : 0)
const relEPercent = computed(() => totalE.value > 0 ? (relE.value / totalE.value) * 100 : 0)
const springEPercent = computed(() => totalE.value > 0 ? (springE.value / totalE.value) * 100 : 0)

let animId = null
let lastTime = 0

const togglePlay = () => {
  isRunning.value = !isRunning.value
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'lab' ? 'com' : 'lab'
}

const resetSim = () => {
  x1.value = 1.0
  v1.value = v1_init.value
  x2.value = 1.0 + naturalLength
  v2.value = 0.0
}

const updatePhysics = () => {
  // パラメータ変更時の安全ガード
}

const step = (dt) => {
  // サブステップ数値積分 (Verlet/Runge-Kutta風)
  const steps = 10
  const subDt = dt / steps

  for (let s = 0; s < steps; s++) {
    const curDelta = (x2.value - x1.value) - naturalLength
    const springForce = -k.value * curDelta // 物体2にかかる力 (引張時負=左向き)

    const a1 = -springForce / m1.value // 物体1には逆向き
    const a2 = springForce / m2.value

    v1.value += a1 * subDt
    v2.value += a2 * subDt

    x1.value += v1.value * subDt
    x2.value += v2.value * subDt
  }

  // 画面外への極端な移動に対する周期的ラップ (実験室系)
  if (xG.value > 8.0) {
    const shift = 6.0
    x1.value -= shift
    x2.value -= shift
  } else if (xG.value < -2.0) {
    const shift = 6.0
    x1.value -= shift
    x2.value -= shift
  }
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  // 背景
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, '#0f172a')
  bgGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // スケール変換: メートル -> ピクセル
  // viewMode が 'com' のときは重心を常に画面中央 (width/2) に配置
  const scale = 110 // 1m = 110px
  let originX = 150
  if (viewMode.value === 'com') {
    originX = width / 2 - xG.value * scale
  } else {
    // 実験室系でも画面中央付近を追従（緩やかなカメラ）
    originX = width / 2 - xG.value * scale * 0.5 - 50
  }

  const floorY = 220

  // なめらかな床面を描画
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, floorY)
  ctx.lineTo(width, floorY)
  ctx.stroke()

  // 床のハッチング
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 25) {
    ctx.beginPath()
    ctx.moveTo(x, floorY)
    ctx.lineTo(x - 15, floorY + 15)
    ctx.stroke()
  }

  // 座標変換
  const px1 = originX + x1.value * scale
  const px2 = originX + x2.value * scale
  const pxG = originX + xG.value * scale

  // 1. ばねの描画 (px1 から px2 までジグザグ)
  const springY = floorY - 25
  const box1W = 40 + m1.value * 8
  const box2W = 40 + m2.value * 8
  const boxH = 40

  const startX = px1 + box1W / 2
  const endX = px2 - box2W / 2

  ctx.strokeStyle = deltaX.value > 0 ? '#38bdf8' : (deltaX.value < 0 ? '#f43f5e' : '#94a3b8')
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(startX, springY)

  const springLen = endX - startX
  const coils = 12
  for (let i = 1; i <= coils; i++) {
    const cx = startX + (springLen / coils) * (i - 0.5)
    const cy = springY + (i % 2 === 0 ? 12 : -12)
    ctx.lineTo(cx, cy)
  }
  ctx.lineTo(endX, springY)
  ctx.stroke()

  // 2. 物体1 (左側)
  const b1X = px1 - box1W / 2
  const b1Y = floorY - boxH
  ctx.fillStyle = '#38bdf8'
  ctx.shadowColor = 'rgba(56, 189, 248, 0.5)'
  ctx.shadowBlur = 10
  ctx.fillRect(b1X, b1Y, box1W, boxH)
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#0284c7'
  ctx.lineWidth = 2
  ctx.strokeRect(b1X, b1Y, box1W, boxH)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`m₁: ${m1.value.toFixed(1)}kg`, px1, b1Y + 24)

  // 3. 物体2 (右側)
  const b2X = px2 - box2W / 2
  const b2Y = floorY - boxH
  ctx.fillStyle = '#f59e0b'
  ctx.shadowColor = 'rgba(245, 158, 11, 0.5)'
  ctx.shadowBlur = 10
  ctx.fillRect(b2X, b2Y, box2W, boxH)
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 2
  ctx.strokeRect(b2X, b2Y, box2W, boxH)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`m₂: ${m2.value.toFixed(1)}kg`, px2, b2Y + 24)

  // 4. 重心マーカー G
  ctx.strokeStyle = '#a855f7'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(pxG, floorY - 70)
  ctx.lineTo(pxG, floorY + 20)
  ctx.stroke()
  ctx.setLineDash([])

  // 重心アイコン
  ctx.fillStyle = '#a855f7'
  ctx.beginPath()
  ctx.arc(pxG, floorY - 70, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px sans-serif'
  ctx.fillText('G', pxG, floorY - 67)

  // 5. 速度ベクトル矢印
  const drawArrow = (fromX, fromY, vel, color, label) => {
    if (Math.abs(vel) < 0.05) return
    const arrowLen = vel * 25
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(fromX + arrowLen, fromY)
    ctx.stroke()

    // 矢じり
    const dir = arrowLen > 0 ? 1 : -1
    ctx.beginPath()
    ctx.moveTo(fromX + arrowLen, fromY)
    ctx.lineTo(fromX + arrowLen - dir * 8, fromY - 5)
    ctx.lineTo(fromX + arrowLen - dir * 8, fromY + 5)
    ctx.closePath()
    ctx.fill()

    ctx.font = '11px sans-serif'
    ctx.fillText(`${label}: ${vel.toFixed(1)}`, fromX + arrowLen / 2, fromY - 8)
  }

  drawArrow(px1, b1Y - 12, v1.value, '#38bdf8', 'v₁')
  drawArrow(px2, b2Y - 12, v2.value, '#f59e0b', 'v₂')
  drawArrow(pxG, floorY - 85, vG.value, '#a855f7', 'v_G')
}

const animate = (time) => {
  if (lastTime === 0) lastTime = time
  const dt = Math.min((time - lastTime) / 1000, 0.05)
  lastTime = time

  if (isRunning.value) {
    step(dt)
  }

  draw()
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  resetSim()
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border-radius: 12px;
  padding: 1.2rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.sim-header .icon {
  font-size: 1.5rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #38bdf8;
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.canvas-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #000;
}

canvas {
  width: 100%;
  height: auto;
  display: block;
}

.mode-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

.mode-badge.lab {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.mode-badge.com {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.4);
}

.control-panel {
  margin-top: 1rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.control-group strong {
  color: #38bdf8;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #0284c7;
  color: white;
}
.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.btn-secondary:hover {
  background: #475569;
}

.btn-accent {
  background: #9333ea;
  color: white;
}
.btn-accent:hover {
  background: #7e22ce;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
}

.stat-card {
  background: #1e293b;
  padding: 0.7rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 3px solid #38bdf8;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.stat-card .value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.positive {
  color: #38bdf8;
}

.stat-card .value.negative {
  color: #f43f5e;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.65rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.energy-card {
  margin-top: 1rem;
  background: #1e293b;
  padding: 0.8rem 1rem;
  border-radius: 8px;
}

.energy-header {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.energy-bar {
  height: 14px;
  background: #0f172a;
  border-radius: 7px;
  overflow: hidden;
  display: flex;
}

.bar-segment {
  height: 100%;
  transition: width 0.1s linear;
}

.bar-segment.trans {
  background: #a855f7;
}

.bar-segment.rel {
  background: #0ea5e9;
}

.bar-segment.spring {
  background: #f59e0b;
}

.legend-row {
  display: flex;
  justify-content: space-around;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.trans { background: #a855f7; }
.dot.rel { background: #0ea5e9; }
.dot.spring { background: #f59e0b; }
</style>
