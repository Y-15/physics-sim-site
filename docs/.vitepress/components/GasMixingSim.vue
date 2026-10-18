<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧪</span>
        <h3>気体の混合・可動ピストンのつり合いシミュレーター</h3>
        <div class="mode-badge">
          {{ mode === 'valve' ? (isValveOpen ? 'コック開通 (混合中)' : 'コック閉 (分離状態)') : '可動ピストン (圧力平衡)' }}
        </div>
      </div>
      <p class="subtitle">断熱容器内での気体混合（内部エネルギー保存則とドルトンの分圧則）および可動ピストンで仕切られた2気体の力学的つり合い（<i>P</i><sub><i>A</i></sub> = <i>P</i><sub><i>B</i></sub>）をリアルタイムに体験できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="280"></canvas>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>シミュレーション方式:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: mode === 'valve' }" @click="switchMode('valve')">
                コック開通・混合
              </button>
              <button class="select-btn" :class="{ active: mode === 'piston' }" @click="switchMode('piston')">
                可動ピストン仕切り
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>気体A 温度 <i>T</i><sub><i>A</i></sub>: <strong>{{ TA }} K</strong></span>
            <input type="range" v-model.number="TA" min="200" max="600" step="20" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>気体B 温度 <i>T</i><sub><i>B</i></sub>: <strong>{{ TB }} K</strong></span>
            <input type="range" v-model.number="TB" min="200" max="600" step="20" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>物質量比 <i>n</i><sub><i>A</i></sub> : <i>n</i><sub><i>B</i></sub>: <strong>{{ nA.toFixed(1) }} : {{ nB.toFixed(1) }} mol</strong></span>
            <input type="range" v-model.number="nA" min="0.5" max="3.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button v-if="mode === 'valve'" class="btn btn-primary" @click="toggleValve">
          {{ isValveOpen ? '🔒 コックを閉じる (リセット)' : '🔓 コックを開く (気体混合!)' }}
        </button>
        <button v-else class="btn btn-primary" @click="balancePiston">
          ⚖️ ピストンを滑らかにつり合わせる
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 初期状態に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label" v-if="mode === 'valve' && isValveOpen">混合後温度 <i>T</i></span>
        <span class="label" v-else>気体A 圧力 <i>P</i><sub><i>A</i></sub></span>
        <span class="value">{{ mode === 'valve' && isValveOpen ? mixedT.toFixed(1) + ' K' : PA.toFixed(1) + ' kPa' }}</span>
        <span class="subtext">{{ mode === 'valve' && isValveOpen ? '(nA TA + nB TB) / (nA+nB)' : 'nA R TA / VA' }}</span>
      </div>

      <div class="stat-card">
        <span class="label" v-if="mode === 'valve' && isValveOpen">全圧 <i>P</i><sub>total</sub></span>
        <span class="label" v-else>気体B 圧力 <i>P</i><sub><i>B</i></sub></span>
        <span class="value" :class="{ highlight: mode === 'piston' && Math.abs(PA - PB) < 1 }">
          {{ mode === 'valve' && isValveOpen ? mixedP.toFixed(1) + ' kPa' : PB.toFixed(1) + ' kPa' }}
        </span>
        <span class="subtext">{{ mode === 'piston' ? (Math.abs(PA - PB) < 1 ? '力学的つり合い成立' : '圧力不均衡') : '分圧の和 PA + PB' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">内部エネルギー総和 <i>U</i></span>
        <span class="value">{{ (totalU / 1000).toFixed(2) }} <span class="unit">kJ</span></span>
        <span class="subtext">断熱系により完全保存！</span>
      </div>

      <div class="stat-card">
        <span class="label">体積比 <i>V</i><sub><i>A</i></sub> : <i>V</i><sub><i>B</i></sub></span>
        <span class="value">{{ VA_ratio.toFixed(1) }} : {{ (10 - VA_ratio).toFixed(1) }}</span>
        <span class="subtext">全容積 V = 10.0 L</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const mode = ref('valve') // 'valve' or 'piston'
const isValveOpen = ref(false)

const TA = ref(450) // K
const TB = ref(250) // K
const nA = ref(1.0) // mol
const nB = ref(1.0) // mol
const R = 8.31 // J/(mol*K)

// 体積比 (全体10LのうちA室の体積)
const VA_ratio = ref(5.0) // 0 to 10
const totalV_L = 10.0

// 各室の体積 [m^3]
const VA_m3 = computed(() => (VA_ratio.value / 1000))
const VB_m3 = computed(() => ((totalV_L - VA_ratio.value) / 1000))

// 圧力 [kPa]
const PA = computed(() => {
  return (nA.value * R * TA.value / VA_m3.value) / 1000
})
const PB = computed(() => {
  return (nB.value * R * TB.value / VB_m3.value) / 1000
})

// 内部エネルギー総和 U = (3/2) nA R TA + (3/2) nB R TB
const totalU = computed(() => {
  return 1.5 * nA.value * R * TA.value + 1.5 * nB.value * R * TB.value
})

// コック開通時の混合温度 T
const mixedT = computed(() => {
  return (nA.value * TA.value + nB.value * TB.value) / (nA.value + nB.value)
})

// コック開通時の全圧 P
const mixedP = computed(() => {
  const totalMol = nA.value + nB.value
  const totalM3 = totalV_L / 1000
  return (totalMol * R * mixedT.value / totalM3) / 1000
})

const switchMode = (m) => {
  mode.value = m
  isValveOpen.value = false
  VA_ratio.value = 5.0
}

const toggleValve = () => {
  isValveOpen.value = !isValveOpen.value
}

const balancePiston = () => {
  // ピストンが滑らかにつり合う条件: PA = PB
  // nA R TA / VA = nB R TB / VB
  // VA / VB = (nA TA) / (nB TB)
  const ratio = (nA.value * TA.value) / (nB.value * TB.value)
  const newVA = (ratio / (1 + ratio)) * totalV_L
  VA_ratio.value = Math.round(newVA * 10) / 10
}

const resetDefaults = () => {
  TA.value = 450
  TB.value = 250
  nA.value = 1.0
  isValveOpen.value = false
  VA_ratio.value = 5.0
}

const updatePhysics = () => {}

// 分子パーティクル
const particlesA = []
const particlesB = []

const initParticles = () => {
  particlesA.length = 0
  particlesB.length = 0
  for (let i = 0; i < 30; i++) {
    particlesA.push({
      x: 100 + Math.random() * 180,
      y: 70 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    })
    particlesB.push({
      x: 380 + Math.random() * 180,
      y: 70 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    })
  }
}

let animId = null

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

  const cylLeft = 80
  const cylRight = 600
  const cylTop = 60
  const cylBottom = 220
  const cylW = cylRight - cylLeft
  const cylH = cylBottom - cylTop

  // 1. 断熱容器枠
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'
  ctx.fillRect(cylLeft, cylTop, cylW, cylH)

  // 断熱壁の太い枠線（黄色・黒のハッチング風または厚いスレート枠）
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 6
  ctx.strokeRect(cylLeft, cylTop, cylW, cylH)

  // モード別描画
  if (mode.value === 'valve') {
    // --- コック開通モード ---
    const midX = (cylLeft + cylRight) / 2
    const valveGap = 50

    // 中央の仕切り壁
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 6
    // 上仕切り
    ctx.beginPath()
    ctx.moveTo(midX, cylTop)
    ctx.lineTo(midX, cylTop + (cylH - valveGap) / 2)
    ctx.stroke()
    // 下仕切り
    ctx.beginPath()
    ctx.moveTo(midX, cylBottom - (cylH - valveGap) / 2)
    ctx.lineTo(midX, cylBottom)
    ctx.stroke()

    // コック弁
    const valveY = (cylTop + cylBottom) / 2
    if (!isValveOpen.value) {
      // 閉: 弁が塞いでいる
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.moveTo(midX, valveY - valveGap / 2)
      ctx.lineTo(midX, valveY + valveGap / 2)
      ctx.stroke()
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('コック閉', midX, valveY - valveGap / 2 - 8)
    } else {
      // 開: 弁が開いている
      ctx.fillStyle = '#34d399'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('コック開通!', midX, valveY - valveGap / 2 - 8)
    }

    // 分子移動アニメーション
    const speedA = Math.sqrt(TA.value / 300) * 1.5
    const speedB = Math.sqrt(TB.value / 300) * 1.5

    particlesA.forEach(p => {
      p.x += p.vx * speedA
      p.y += p.vy * speedA
      const maxX = isValveOpen.value ? cylRight - 10 : midX - 8
      if (p.x < cylLeft + 10) { p.x = cylLeft + 10; p.vx *= -1 }
      if (p.x > maxX) { p.x = maxX; p.vx *= -1 }
      if (p.y < cylTop + 10) { p.y = cylTop + 10; p.vy *= -1 }
      if (p.y > cylBottom - 10) { p.y = cylBottom - 10; p.vy *= -1 }

      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    particlesB.forEach(p => {
      p.x += p.vx * speedB
      p.y += p.vy * speedB
      const minX = isValveOpen.value ? cylLeft + 10 : midX + 8
      if (p.x < minX) { p.x = minX; p.vx *= -1 }
      if (p.x > cylRight - 10) { p.x = cylRight - 10; p.vx *= -1 }
      if (p.y < cylTop + 10) { p.y = cylTop + 10; p.vy *= -1 }
      if (p.y > cylBottom - 10) { p.y = cylBottom - 10; p.vy *= -1 }

      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // 容器ラベル
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#38bdf8'
    ctx.fillText(`容器A (${nA.value}mol, ${TA.value}K)`, (cylLeft + midX) / 2, cylTop - 12)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`容器B (${nB.value}mol, ${TB.value}K)`, (midX + cylRight) / 2, cylTop - 12)

  } else {
    // --- 可動ピストンモード ---
    const pistonX = cylLeft + (VA_ratio.value / totalV_L) * cylW
    const pistonW = 16

    // ピストン本体
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(pistonX - pistonW / 2, cylTop + 3, pistonW, cylH - 6)
    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 2
    ctx.strokeRect(pistonX - pistonW / 2, cylTop + 3, pistonW, cylH - 6)

    // ピストンラベル
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.save()
    ctx.translate(pistonX, (cylTop + cylBottom) / 2)
    ctx.rotate(Math.PI / 2)
    ctx.fillText('可動ピストン', 0, 3)
    ctx.restore()

    // 左右圧力の押し合い矢印
    const paScale = Math.min(40, PA.value * 0.15)
    const pbScale = Math.min(40, PB.value * 0.15)

    // PA 矢印 (右向き)
    ctx.strokeStyle = '#38bdf8'
    ctx.fillStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(pistonX - pistonW / 2 - paScale, (cylTop + cylBottom) / 2)
    ctx.lineTo(pistonX - pistonW / 2, (cylTop + cylBottom) / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pistonX - pistonW / 2, (cylTop + cylBottom) / 2)
    ctx.lineTo(pistonX - pistonW / 2 - 8, (cylTop + cylBottom) / 2 - 4)
    ctx.lineTo(pistonX - pistonW / 2 - 8, (cylTop + cylBottom) / 2 + 4)
    ctx.closePath()
    ctx.fill()

    // PB 矢印 (左向き)
    ctx.strokeStyle = '#f59e0b'
    ctx.fillStyle = '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(pistonX + pistonW / 2 + pbScale, (cylTop + cylBottom) / 2)
    ctx.lineTo(pistonX + pistonW / 2, (cylTop + cylBottom) / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pistonX + pistonW / 2, (cylTop + cylBottom) / 2)
    ctx.lineTo(pistonX + pistonW / 2 + 8, (cylTop + cylBottom) / 2 - 4)
    ctx.lineTo(pistonX + pistonW / 2 + 8, (cylTop + cylBottom) / 2 + 4)
    ctx.closePath()
    ctx.fill()

    // 分子移動アニメーション
    const speedA = Math.sqrt(TA.value / 300) * 1.5
    const speedB = Math.sqrt(TB.value / 300) * 1.5

    particlesA.forEach(p => {
      p.x += p.vx * speedA
      p.y += p.vy * speedA
      if (p.x < cylLeft + 10) { p.x = cylLeft + 10; p.vx *= -1 }
      if (p.x > pistonX - pistonW / 2 - 6) { p.x = pistonX - pistonW / 2 - 6; p.vx *= -1 }
      if (p.y < cylTop + 10) { p.y = cylTop + 10; p.vy *= -1 }
      if (p.y > cylBottom - 10) { p.y = cylBottom - 10; p.vy *= -1 }

      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    particlesB.forEach(p => {
      p.x += p.vx * speedB
      p.y += p.vy * speedB
      if (p.x < pistonX + pistonW / 2 + 6) { p.x = pistonX + pistonW / 2 + 6; p.vx *= -1 }
      if (p.x > cylRight - 10) { p.x = cylRight - 10; p.vx *= -1 }
      if (p.y < cylTop + 10) { p.y = cylTop + 10; p.vy *= -1 }
      if (p.y > cylBottom - 10) { p.y = cylBottom - 10; p.vy *= -1 }

      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // 室ラベル
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#38bdf8'
    ctx.fillText(`A室 (PA = ${PA.value.toFixed(0)}kPa)`, (cylLeft + pistonX) / 2, cylTop - 12)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`B室 (PB = ${PB.value.toFixed(0)}kPa)`, (pistonX + cylRight) / 2, cylTop - 12)
  }
}

const animate = () => {
  draw()
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  initParticles()
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
  margin-left: auto;
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(15, 23, 42, 0.85);
  color: #38bdf8;
  border: 1px solid #334155;
  white-space: nowrap;
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
  padding: 0.35rem;
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
  color: #34d399;
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
