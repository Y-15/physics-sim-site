<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚡</span>
        <h3>LC振動回路・電磁振動シミュレーター</h3>
      </div>
      <p class="subtitle">コイル（L）とコンデンサー（C）をつないだ回路に生じる電気振動。静電エネルギーと磁気エネルギーが交互に入れ替わり、力学のばね振り子と完全同等の運動をします。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="phase-badge">
        位相 φ: {{ currentPhaseDeg.toFixed(0) }}° ({{ phaseDescription }})
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>自己インダクタンス <i>L</i>: <strong>{{ L_mH }} mH</strong></span>
            <input type="range" v-model.number="L_mH" min="10" max="200" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>電気容量 <i>C</i>: <strong>{{ C_uF }} μF</strong></span>
            <input type="range" v-model.number="C_uF" min="10" max="100" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>初期充電電圧 <i>V</i><sub>0</sub>: <strong>{{ V0.toFixed(0) }} V</strong></span>
            <input type="range" v-model.number="V0" min="5" max="30" step="1" @input="resetSim" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>再生速度: <strong>{{ timeScale.toFixed(1) }}x</strong></span>
            <input type="range" v-model.number="timeScale" min="0.2" max="2.0" step="0.2" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 初期充電状態にリセット
        </button>
      </div>
    </div>

    <!-- リアルタイム物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">固有角振動数 ω</span>
        <span class="value">{{ omega.toFixed(0) }} <span class="unit">rad/s</span></span>
        <span class="subtext">1/√(LC)</span>
      </div>

      <div class="stat-card">
        <span class="label">固有振動数 <i>f</i></span>
        <span class="value">{{ freq.toFixed(1) }} <span class="unit">Hz</span></span>
        <span class="subtext">ω / 2π</span>
      </div>

      <div class="stat-card">
        <span class="label">固有周期 <i>T</i></span>
        <span class="value">{{ (period * 1000).toFixed(1) }} <span class="unit">ms</span></span>
        <span class="subtext">2π√(LC)</span>
      </div>

      <div class="stat-card">
        <span class="label">最大電流 <i>I</i><sub>\max</sub></span>
        <span class="value">{{ (I_max * 1000).toFixed(1) }} <span class="unit">mA</span></span>
        <span class="subtext"><i>V</i><sub>0</sub> √(<i>C</i>/<i>L</i>)</span>
      </div>
    </div>

    <!-- エネルギー保存内訳バー -->
    <div class="energy-card">
      <div class="energy-header">
        <span>全エネルギー保存則 <i>E</i> = <i>U</i><sub><i>E</i></sub> + <i>U</i><sub><i>B</i></sub> = {{ (totalE * 1000).toFixed(2) }} mJ (一定)</span>
      </div>
      <div class="energy-bar">
        <div class="bar-segment cap" :style="{ width: capEPercent + '%' }" title="静電エネルギー"></div>
        <div class="bar-segment coil" :style="{ width: coilEPercent + '%' }" title="磁気エネルギー"></div>
      </div>
      <div class="legend-row">
        <div class="legend-item"><span class="dot cap"></span>静電エネルギー <i>U</i><sub><i>E</i></sub> = <i>Q</i>²/2C: {{ (UE * 1000).toFixed(2) }} mJ</div>
        <div class="legend-item"><span class="dot coil"></span>磁気エネルギー <i>U</i><sub><i>B</i></sub> = (1 / 2)LI²: {{ (UB * 1000).toFixed(2) }} mJ</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const isRunning = ref(true)

const L_mH = ref(50) // mH
const C_uF = ref(40) // uF
const V0 = ref(12) // V
const timeScale = ref(1.0)

// 実単位計算
const L_val = computed(() => L_mH.value * 1e-3) // H
const C_val = computed(() => C_uF.value * 1e-6) // F
const omega = computed(() => 1 / Math.sqrt(L_val.value * C_val.value))
const freq = computed(() => omega.value / (2 * Math.PI))
const period = computed(() => 1 / freq.value)

// 初期最大電荷
const Q_max = computed(() => C_val.value * V0.value) // C
const I_max = computed(() => omega.value * Q_max.value) // A
const totalE = computed(() => 0.5 * C_val.value * (V0.value ** 2)) // J

let time = 0
let animId = null
let lastFrameTime = 0

// 瞬時値
const currentPhase = ref(0)
const currentQ = ref(0)
const currentI = ref(0)
const UE = ref(0)
const UB = ref(0)

const currentPhaseDeg = computed(() => ((currentPhase.value * 180 / Math.PI) % 360 + 360) % 360)

const phaseDescription = computed(() => {
  const deg = currentPhaseDeg.value
  if (deg < 30 || deg >= 330) return '電荷最大 (電圧最大・電流ゼロ)'
  if (deg >= 60 && deg < 120) return '電流最大 (磁界最強・電荷ゼロ)'
  if (deg >= 150 && deg < 210) return '逆極性電荷最大'
  if (deg >= 240 && deg < 300) return '逆向き電流最大'
  return 'エネルギー変換中'
})

const capEPercent = computed(() => totalE.value > 0 ? (UE.value / totalE.value) * 100 : 0)
const coilEPercent = computed(() => totalE.value > 0 ? (UB.value / totalE.value) * 100 : 0)

const togglePlay = () => {
  isRunning.value = !isRunning.value
}

const resetSim = () => {
  time = 0
  currentPhase.value = 0
}

// 履歴プロット用データ
const history = []
const maxHistory = 180

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

  // 左半分: 回路図 (x: 20〜360)
  // 右半分: リアルタイム波形グラフ (x: 390〜680)

  // --- 回路図描画 ---
  const leftX = 60
  const rightX = 320
  const topY = 70
  const bottomY = 220

  // 導線
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 3
  ctx.beginPath()
  // 上部導線
  ctx.moveTo(leftX, topY)
  ctx.lineTo(rightX, topY)
  // 下部導線
  ctx.moveTo(leftX, bottomY)
  ctx.lineTo(rightX, bottomY)
  // 左右
  ctx.moveTo(leftX, topY)
  ctx.lineTo(leftX, 110)
  ctx.moveTo(leftX, 180)
  ctx.lineTo(leftX, bottomY)

  ctx.moveTo(rightX, topY)
  ctx.lineTo(rightX, 100)
  ctx.moveTo(rightX, 190)
  ctx.lineTo(rightX, bottomY)
  ctx.stroke()

  // 1. 左側: コンデンサー (Capacitor)
  const capY = 145
  const capW = 50
  const capGap = 16
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 4
  // 上極板
  ctx.beginPath()
  ctx.moveTo(leftX - capW / 2, capY - capGap / 2)
  ctx.lineTo(leftX + capW / 2, capY - capGap / 2)
  ctx.stroke()
  // 下極板
  ctx.beginPath()
  ctx.moveTo(leftX - capW / 2, capY + capGap / 2)
  ctx.lineTo(leftX + capW / 2, capY + capGap / 2)
  ctx.stroke()

  // コンデンサーの電荷表示（＋＋＋ / ーーー）
  const qNorm = currentQ.value / Q_max.value // -1 to +1
  const numCharges = Math.min(6, Math.floor(Math.abs(qNorm) * 6))
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  if (qNorm > 0.1) {
    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < numCharges; i++) {
      ctx.fillText('+', leftX - 18 + i * 7, capY - capGap / 2 - 6)
    }
    ctx.fillStyle = '#38bdf8'
    for (let i = 0; i < numCharges; i++) {
      ctx.fillText('-', leftX - 18 + i * 7, capY + capGap / 2 + 14)
    }
  } else if (qNorm < -0.1) {
    ctx.fillStyle = '#38bdf8'
    for (let i = 0; i < numCharges; i++) {
      ctx.fillText('-', leftX - 18 + i * 7, capY - capGap / 2 - 6)
    }
    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < numCharges; i++) {
      ctx.fillText('+', leftX - 18 + i * 7, capY + capGap / 2 + 14)
    }
  }
  ctx.fillStyle = '#38bdf8'
  ctx.font = '11px sans-serif'
  ctx.fillText('C', leftX - 35, capY + 4)

  // 2. 右側: コイル (Inductor L)
  const coilY = 145
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 3
  const coilLoops = 5
  const loopH = 16
  for (let i = 0; i < coilLoops; i++) {
    const cy = coilY - 35 + i * loopH
    ctx.beginPath()
    ctx.arc(rightX, cy + loopH / 2, 12, -Math.PI / 2, Math.PI / 2, false)
    ctx.stroke()
  }
  ctx.fillStyle = '#f59e0b'
  ctx.font = '11px sans-serif'
  ctx.fillText('L', rightX + 25, coilY + 4)

  // コイル内の磁場矢印（電流の大きさに比例）
  const iNorm = currentI.value / I_max.value // -1 to +1
  if (Math.abs(iNorm) > 0.1) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)'
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'
    ctx.lineWidth = 2
    const bDir = iNorm > 0 ? 1 : -1 // 向き
    const bLen = Math.abs(iNorm) * 40
    ctx.beginPath()
    ctx.moveTo(rightX, coilY - bDir * (bLen / 2))
    ctx.lineTo(rightX, coilY + bDir * (bLen / 2))
    ctx.stroke()
    // 矢じり
    ctx.beginPath()
    ctx.moveTo(rightX, coilY + bDir * (bLen / 2))
    ctx.lineTo(rightX - 4, coilY + bDir * (bLen / 2) - bDir * 8)
    ctx.lineTo(rightX + 4, coilY + bDir * (bLen / 2) - bDir * 8)
    ctx.closePath()
    ctx.fill()
  }

  // 3. 電流の流れるアニメーション（ドット）
  const dotCount = 16
  ctx.fillStyle = '#38bdf8'
  const circuitPerimeter = 2 * (rightX - leftX) + 2 * (bottomY - topY)
  for (let d = 0; d < dotCount; d++) {
    const baseOffset = (d / dotCount) * circuitPerimeter
    // 電流の向きと速度に応じて移動
    const moveOffset = (time * iNorm * 80) % circuitPerimeter
    let s = (baseOffset + moveOffset + circuitPerimeter) % circuitPerimeter

    let px = 0, py = 0
    const w = rightX - leftX
    const h = bottomY - topY

    if (s < w) {
      px = leftX + s; py = topY
    } else if (s < w + h) {
      px = rightX; py = topY + (s - w)
    } else if (s < 2 * w + h) {
      px = rightX - (s - (w + h)); py = bottomY
    } else {
      px = leftX; py = bottomY - (s - (2 * w + h))
    }

    if (Math.abs(iNorm) > 0.05) {
      ctx.beginPath()
      ctx.arc(px, py, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // --- 右半分: 波形プロット ---
  const plotLeft = 400
  const plotRight = 670
  const plotTop = 50
  const plotBottom = 250
  const plotMidY = (plotTop + plotBottom) / 2

  // グラフ枠線
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.strokeRect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop)
  // 中心軸 (0)
  ctx.strokeStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(plotLeft, plotMidY)
  ctx.lineTo(plotRight, plotMidY)
  ctx.stroke()

  // 凡例
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('— 電荷 Q(t)', plotLeft + 10, plotTop + 18)
  ctx.fillStyle = '#ef4444'
  ctx.fillText('— 電流 I(t) [位相+90°]', plotLeft + 120, plotTop + 18)

  // 履歴プロット
  if (history.length > 1) {
    const stepX = (plotRight - plotLeft) / maxHistory

    // 電荷 Q
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < history.length; i++) {
      const gx = plotLeft + i * stepX
      const gy = plotMidY - history[i].q * 70
      if (i === 0) ctx.moveTo(gx, gy)
      else ctx.lineTo(gx, gy)
    }
    ctx.stroke()

    // 電流 I
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < history.length; i++) {
      const gx = plotLeft + i * stepX
      const gy = plotMidY - history[i].i * 70
      if (i === 0) ctx.moveTo(gx, gy)
      else ctx.lineTo(gx, gy)
    }
    ctx.stroke()
  }
}

const animate = (timestamp) => {
  if (lastFrameTime === 0) lastFrameTime = timestamp
  const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05)
  lastFrameTime = timestamp

  if (isRunning.value) {
    // 物理時間の更新: ω*t
    const simDt = dt * timeScale.value
    time += simDt

    // 位相 φ = ω t
    const phi = omega.value * (time * 0.05) // スケール調整して人間の目で追える速度に
    currentPhase.value = phi

    // Q(t) = Q_max * cos(phi)
    // I(t) = - dQ/dt = I_max * sin(phi)
    const q = Q_max.value * Math.cos(phi)
    const i = I_max.value * Math.sin(phi)

    currentQ.value = q
    currentI.value = i

    // エネルギー計算
    UE.value = (q ** 2) / (2 * C_val.value)
    UB.value = 0.5 * L_val.value * (i ** 2)

    // 履歴更新
    history.push({
      q: q / Q_max.value,
      i: i / I_max.value
    })
    if (history.length > maxHistory) {
      history.shift()
    }
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

.phase-badge {
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
  transition: width 0.05s linear;
}

.bar-segment.cap {
  background: #0ea5e9;
}

.bar-segment.coil {
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

.dot.cap { background: #0ea5e9; }
.dot.coil { background: #f59e0b; }
</style>
