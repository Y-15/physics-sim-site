<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🪂</span>
        <h3>空気抵抗と終端速度シミュレーター</h3>
      </div>
      <p class="subtitle">重力と空気抵抗（粘性抵抗 <i>f</i>=-kv または慣性抵抗 <i>f</i>=-κ <i>v</i>²）のつり合い。落下速度が次第に一定値（終端速度 <i>v</i><sub>term</sub>）に達する様子をリアルタイム観察できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="chute-badge" :class="{ open: isChuteOpen }">
        {{ isChuteOpen ? '🪂 パラシュート展開中 (大抵抗)' : '🚶 自由落下 (通常抵抗)' }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>物体の質量 <i>m</i>: <strong>{{ mass.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="mass" min="0.5" max="10.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>空気抵抗モデル:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: dragModel === 'linear' }" @click="dragModel = 'linear'">
                粘性抵抗 (f ∝ v)
              </button>
              <button class="select-btn" :class="{ active: dragModel === 'quadratic' }" @click="dragModel = 'quadratic'">
                慣性抵抗 (f ∝ v²)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>抵抗係数: <strong>{{ dragCoeff.toFixed(2) }}</strong></span>
            <input type="range" v-model.number="dragCoeff" min="0.1" max="2.0" step="0.1" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>落下高さ / スケール:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: isChuteOpen }" @click="toggleChute">
                {{ isChuteOpen ? 'パラシュート閉じる' : 'パラシュート開く!' }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ 落下開始 / 再生' }}
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 最上部から再ドロップ
        </button>
      </div>
    </div>

    <!-- リアルタイム物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">現在の落下速度 <i>v</i></span>
        <span class="value">{{ velocity.toFixed(1) }} <span class="unit">m/s</span></span>
        <span class="subtext">時速 {{ (velocity * 3.6).toFixed(0) }} km/h</span>
      </div>

      <div class="stat-card">
        <span class="label">理論終端速度 <i>v</i><sub>term</sub></span>
        <span class="value highlight">{{ theoreticalVterm.toFixed(1) }} <span class="unit">m/s</span></span>
        <span class="subtext">{{ dragModel === 'linear' ? 'mg / k' : '√(mg / κ)' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">現在加速度 <i>a</i></span>
        <span class="value">{{ acceleration.toFixed(2) }} <span class="unit">m/s²</span></span>
        <span class="subtext">重力加速度 g = 9.80</span>
      </div>

      <div class="stat-card">
        <span class="label">抵抗力 / 重力 比率</span>
        <span class="value">{{ (dragForceRatio * 100).toFixed(0) }} <span class="unit">%</span></span>
        <span class="subtext">{{ dragForceRatio >= 0.98 ? '完全つり合い状態' : '加速中' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const isRunning = ref(true)

const mass = ref(3.0) // kg
const dragModel = ref('linear') // 'linear' or 'quadratic'
const dragCoeff = ref(0.6) // k or kappa
const isChuteOpen = ref(false)

const g = 9.8 // m/s^2

// 実効抵抗係数（パラシュート開傘で大幅UP）
const effectiveK = computed(() => {
  return isChuteOpen.value ? dragCoeff.value * 4.0 : dragCoeff.value
})

// 理論終端速度
const theoreticalVterm = computed(() => {
  const m = mass.value
  const k = effectiveK.value
  if (dragModel.value === 'linear') {
    return (m * g) / k
  } else {
    return Math.sqrt((m * g) / k)
  }
})

// シミュレーション状態量
const posY = ref(20.0) // 画面上ピクセル対応
const velocity = ref(0.0) // m/s
const acceleration = ref(9.8) // m/s^2

const dragForceRatio = computed(() => {
  const m = mass.value
  const k = effectiveK.value
  const v = velocity.value
  const dragF = dragModel.value === 'linear' ? k * v : k * (v ** 2)
  return Math.min(1.0, dragF / (m * g))
})

let animId = null
let lastTime = 0

// グラフプロット用履歴
const history = []
const maxHistory = 150

const togglePlay = () => {
  isRunning.value = !isRunning.value
}

const toggleChute = () => {
  isChuteOpen.value = !isChuteOpen.value
}

const resetSim = () => {
  posY.value = 20.0
  velocity.value = 0.0
  acceleration.value = g
  history.length = 0
}

const updatePhysics = () => {}

const step = (dt) => {
  const m = mass.value
  const k = effectiveK.value
  const v = velocity.value

  // 運動方程式: m dv/dt = mg - f_drag
  let dragF = 0
  if (dragModel.value === 'linear') {
    dragF = k * v
  } else {
    dragF = k * (v ** 2)
  }

  const a = Math.max(0, g - dragF / m)
  acceleration.value = a
  velocity.value += a * dt

  // 落下位置更新（周期的リセット）
  posY.value += velocity.value * dt * 8 // スケール調整
  if (posY.value > 260) {
    posY.value = 30
  }

  // 履歴更新
  history.push({
    v: velocity.value,
    vTerm: theoreticalVterm.value
  })
  if (history.length > maxHistory) {
    history.shift()
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
  bgGrad.addColorStop(0, '#090d16')
  bgGrad.addColorStop(1, '#111827')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 左半分: 落下アニメーション (x: 20〜320)
  // 右半分: v-t グラフ (x: 350〜670)

  // 空気の流れ（落下を示す上昇パーティクル風背景）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 6; i++) {
    const lx = 40 + i * 45
    ctx.beginPath()
    ctx.moveTo(lx, 20)
    ctx.lineTo(lx, height - 20)
    ctx.stroke()
  }

  // 落下物体の中心
  const objX = 160
  const objY = posY.value
  const objR = 14 + mass.value * 1.5

  // パラシュート描画
  if (isChuteOpen.value) {
    const chuteW = 80
    const chuteH = 35
    const chuteY = objY - objR - 40

    // 傘
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(objX, chuteY + 10, chuteW / 2, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#fca5a5'
    ctx.lineWidth = 2
    ctx.stroke()

    // 紐
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(objX - chuteW / 2, chuteY + 10)
    ctx.lineTo(objX, objY - objR)
    ctx.moveTo(objX + chuteW / 2, chuteY + 10)
    ctx.lineTo(objX, objY - objR)
    ctx.moveTo(objX, chuteY + 10)
    ctx.lineTo(objX, objY - objR)
    ctx.stroke()
  }

  // 落下球体
  ctx.fillStyle = '#38bdf8'
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(objX, objY, objR, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.strokeStyle = '#0284c7'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${mass.value.toFixed(1)}kg`, objX, objY + 4)

  // 力のベクトル矢印
  // 1. 重力 mg (下向き・一定)
  const mgLen = 45
  ctx.strokeStyle = '#34d399'
  ctx.fillStyle = '#34d399'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(objX, objY + objR)
  ctx.lineTo(objX, objY + objR + mgLen)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(objX, objY + objR + mgLen)
  ctx.lineTo(objX - 4, objY + objR + mgLen - 8)
  ctx.lineTo(objX + 4, objY + objR + mgLen - 8)
  ctx.closePath()
  ctx.fill()
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('mg', objX + 16, objY + objR + mgLen / 2 + 4)

  // 2. 抵抗力 f (上向き・速度に応じて伸長)
  const dragLen = mgLen * dragForceRatio.value
  if (dragLen > 2) {
    ctx.strokeStyle = '#f43f5e'
    ctx.fillStyle = '#f43f5e'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(objX, objY - objR)
    ctx.lineTo(objX, objY - objR - dragLen)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(objX, objY - objR - dragLen)
    ctx.lineTo(objX - 4, objY - objR - dragLen + 8)
    ctx.lineTo(objX + 4, objY - objR - dragLen + 8)
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('f_drag', objX + 22, objY - objR - dragLen / 2 + 4)
  }

  // --- 右側: v-t グラフ ---
  const plotLeft = 360
  const plotRight = 670
  const plotTop = 50
  const plotBottom = 260
  const plotH = plotBottom - plotTop

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.strokeRect(plotLeft, plotTop, plotRight - plotLeft, plotH)

  // 軸ラベル
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('速度 v [m/s]', plotLeft, plotTop - 8)
  ctx.textAlign = 'right'
  ctx.fillText('時間 t →', plotRight, plotBottom + 18)

  // 終端速度の漸近線 (赤破線)
  const maxVScale = Math.max(theoreticalVterm.value * 1.3, 30)
  const termY = plotBottom - (theoreticalVterm.value / maxVScale) * plotH

  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(plotLeft, termY)
  ctx.lineTo(plotRight, termY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`v_term = ${theoreticalVterm.value.toFixed(1)} m/s`, plotLeft + 10, termY - 6)

  // 速度履歴プロット
  if (history.length > 1) {
    const stepX = (plotRight - plotLeft) / maxHistory

    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let i = 0; i < history.length; i++) {
      const gx = plotLeft + i * stepX
      const gy = plotBottom - (history[i].v / maxVScale) * plotH
      if (i === 0) ctx.moveTo(gx, gy)
      else ctx.lineTo(gx, gy)
    }
    ctx.stroke()
  }
}

const animate = (timestamp) => {
  if (lastTime === 0) lastTime = timestamp
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
  lastTime = timestamp

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

.chute-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(30, 41, 59, 0.8);
  color: #38bdf8;
  border: 1px solid #334155;
  backdrop-filter: blur(4px);
}

.chute-badge.open {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-color: #ef4444;
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

.btn-group {
  display: flex;
  gap: 0.3rem;
}

.select-btn {
  flex: 1;
  padding: 0.4rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: bold;
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

.stat-card .value.highlight {
  color: #ef4444;
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
</style>
