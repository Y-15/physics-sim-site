<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎢</span>
        <h3>鉛直面内の円運動・宙返りシミュレーター</h3>
      </div>
      <p class="subtitle">ジェットコースターの宙返りループ。力学的エネルギー保存則と向心力（垂直抗力・糸の張力 $N$）のつり合い。一周成功するか、途中で軌道離脱（落下）するかをリアルタイム検証できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="320"></canvas>
      <div class="status-badge" :class="loopStatus">
        {{ statusMessage }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>最下点 初速度 $v_0$: <strong>{{ v0.toFixed(2) }} m/s</strong></span>
            <input type="range" v-model.number="v0" min="4.0" max="12.0" step="0.1" @input="resetSim" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>円軌道半径 $R$: <strong>{{ radius.toFixed(1) }} m</strong></span>
            <input type="range" v-model.number="radius" min="1.0" max="3.0" step="0.2" @input="resetSim" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>小球の質量 $m$: <strong>{{ mass.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="mass" min="0.5" max="3.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>軌道の種類:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: trackType === 'string' }" @click="trackType = 'string'; resetSim()">
                糸（たるみあり）
              </button>
              <button class="select-btn" :class="{ active: trackType === 'rail' }" @click="trackType = 'rail'; resetSim()">
                外枠レール（離脱あり）
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ 運動スタート' }}
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 最下点にリセット
        </button>
        <button class="btn btn-accent" @click="setCriticalSpeed">
          🎯 一周限界速度（v₀ = √(5gR)）に設定
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">現在の速さ $v$</span>
        <span class="value">{{ currentV.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">力学的エネルギー保存</span>
      </div>

      <div class="stat-card">
        <span class="label">垂直抗力 / 張力 $N$</span>
        <span class="value" :class="{ highlight: currentN > 0.1, negative: currentN <= 0.05 }">
          {{ currentN.toFixed(1) }} <span class="unit">N</span>
        </span>
        <span class="subtext">{{ currentN > 0 ? '軌道と接触中' : '軌道離脱！' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">最高点到達限界 $v_0$</span>
        <span class="value">{{ vCritical.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">$\sqrt{5gR}$ (一周の必要十分条件)</span>
      </div>

      <div class="stat-card">
        <span class="label">最高点速度 $v_{\text{top}}$ (予想)</span>
        <span class="value" :class="{ positive: predictedVtop > 0, negative: predictedVtop <= 0 }">
          {{ predictedVtop > 0 ? predictedVtop.toFixed(2) + ' m/s' : '到達不可' }}
        </span>
        <span class="subtext">$\sqrt{v_0^2 - 4gR}$</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const isRunning = ref(true)

const v0 = ref(8.0) // m/s (初速度)
const radius = ref(1.5) // m
const mass = ref(1.0) // kg
const trackType = ref('string') // 'string' or 'rail'
const g = 9.8

// 一周限界速度 v_crit = sqrt(5 * g * R)
const vCritical = computed(() => Math.sqrt(5 * g * radius.value))

// 最高点速度の予測 sqrt(v0^2 - 4gR)
const predictedVtop = computed(() => {
  const inside = (v0.value ** 2) - 4 * g * radius.value
  return inside > 0 ? Math.sqrt(inside) : 0
})

// 状態変数
// theta: 最下点を 0 とし、反時計回りに角度 [rad]
// x, y: 画面上の小球座標
const theta = ref(0.0)
const isDetached = ref(false) // 軌道離脱（放物運動へ遷移）
const ballX = ref(0)
const ballY = ref(0)
const ballVx = ref(0)
const ballVy = ref(0)

const currentV = ref(0)
const currentN = ref(0)

const loopStatus = computed(() => {
  if (isDetached.value) return 'detached'
  if (v0.value >= vCritical.value) return 'complete'
  return 'insufficient'
})

const statusMessage = computed(() => {
  if (isDetached.value) return '💥 軌道離脱！(張力/抗力ゼロで放物落下)'
  if (v0.value >= vCritical.value) return '✨ 宙返り完全一周成功！(N > 0 維持)'
  return '⚠️ 速度不足 (最高点手前で落下または振り子振動)'
})

const setCriticalSpeed = () => {
  v0.value = Math.round(vCritical.value * 10) / 10
  resetSim()
}

const togglePlay = () => {
  isRunning.value = !isRunning.value
}

const resetSim = () => {
  theta.value = 0.0
  isDetached.value = false
  currentV.value = v0.value
  currentN.value = (mass.value * (v0.value ** 2) / radius.value) + mass.value * g
}

let animId = null
let lastTime = 0

const step = (dt) => {
  const R = radius.value
  const m = mass.value

  if (!isDetached.value) {
    // 円運動中
    // 力学的エネルギー保存: (1/2)m v0^2 = (1/2)m v^2 + mg R (1 - cos theta)
    const vSquared = (v0.value ** 2) - 2 * g * R * (1 - Math.cos(theta.value))

    if (vSquared <= 0) {
      // 速度ゼロに達した（最下点付近の振り子振動で反転）
      theta.value -= 0.01
      return
    }

    const v = Math.sqrt(vSquared)
    currentV.value = v

    // 法線方向の運動方程式: m v^2 / R = N - mg cos theta
    // N = m v^2 / R + mg cos theta (θ=0 で最下点 cos=1, θ=π で最高点 cos=-1)
    // 鉛直上向きとなす角 φ = π - θ と置いた場合、N = m v^2 / R - mg cos φ
    // ここでは最下点基準 θ なので、重力の法線内向き成分は mg cos(theta) (最下点 θ=0 で cos=1)
    // 正確には向心力 = N - mg cos(θ) ⇒ N = m v^2 / R + mg cos(θ)
    // θ = π (最高点) のとき: N = m v^2 / R - mg
    const N = (m * vSquared / R) + m * g * Math.cos(theta.value)
    currentN.value = Math.max(0, N)

    // 離脱条件判定 (上面側 π/2 < θ < 3π/2 で N <= 0)
    const isInUpperHalf = (theta.value > Math.PI / 2 && theta.value < 1.5 * Math.PI)
    if (isInUpperHalf && N <= 0) {
      isDetached.value = true
      // 放物運動の初期位置・初速度をセット
      const centerX = 350
      const centerY = 160
      const scale = 55
      const radPx = R * scale

      ballX.value = centerX - radPx * Math.sin(theta.value)
      ballY.value = centerY + radPx * Math.cos(theta.value)

      // 接線方向の速度ベクトル (反時計回り)
      // 位置ベクトル: (-R sin θ, R cos θ)
      // 接線ベクトル: (-cos θ, -sin θ)
      ballVx.value = -v * Math.cos(theta.value) * scale
      ballVy.value = -v * Math.sin(theta.value) * scale
      return
    }

    // 角速度 dθ/dt = v / R
    const omega = v / R
    theta.value += omega * dt

    // 1周したらリセットして周回
    if (theta.value >= Math.PI * 2) {
      theta.value -= Math.PI * 2
    }
  } else {
    // 放物運動中 (重力のみ)
    ballX.value += ballVx.value * dt
    ballVy.value += ballVy.value * dt
    ballVy.value += g * 55 * dt // 重力加速度 (ピクセルスケール)

    currentV.value = Math.sqrt((ballVx.value / 55) ** 2 + (ballVy.value / 55) ** 2)
    currentN.value = 0

    // 画面外落下でリセット
    if (ballY.value > 300) {
      resetSim()
    }
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

  const centerX = 350
  const centerY = 160
  const scale = 55
  const radPx = radius.value * scale

  // 1. 円軌道レール / ガイド
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(centerX, centerY, radPx, 0, Math.PI * 2)
  ctx.stroke()

  // 中心点
  ctx.fillStyle = '#64748b'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
  ctx.fill()

  // 2. 小球の位置
  let px = 0, py = 0
  if (!isDetached.value) {
    // 円軌道上: 最下点 θ=0 (px = centerX, py = centerY + radPx)
    px = centerX - radPx * Math.sin(theta.value)
    py = centerY + radPx * Math.cos(theta.value)

    // 糸の描画
    if (trackType.value === 'string') {
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(px, py)
      ctx.stroke()
    }
  } else {
    px = ballX.value
    py = ballY.value
  }

  // 3. 小球の描画
  const ballR = 12 + mass.value * 2
  ctx.fillStyle = isDetached.value ? '#ef4444' : '#38bdf8'
  ctx.shadowColor = ctx.fillStyle
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(px, py, ballR, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#0284c7'
  ctx.lineWidth = 2
  ctx.stroke()

  // 4. ベクトル矢印（非離脱時）
  if (!isDetached.value) {
    // ① 速度ベクトル（接線方向）
    const vLen = currentV.value * 4
    const tanX = -Math.cos(theta.value)
    const tanY = -Math.sin(theta.value)

    ctx.strokeStyle = '#34d399'
    ctx.fillStyle = '#34d399'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px + tanX * vLen, py + tanY * vLen)
    ctx.stroke()
    // 矢じり
    ctx.beginPath()
    ctx.arc(px + tanX * vLen, py + tanY * vLen, 3, 0, Math.PI * 2)
    ctx.fill()

    // ② 垂直抗力/張力 N（中心向き）
    if (currentN.value > 0.5) {
      const nLen = Math.min(60, currentN.value * 1.5)
      const normX = (centerX - px) / radPx
      const normY = (centerY - py) / radPx

      ctx.strokeStyle = '#f59e0b'
      ctx.fillStyle = '#f59e0b'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px + normX * nLen, py + normY * nLen)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(px + normX * nLen, py + normY * nLen, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = '10px sans-serif'
      ctx.fillText('N', px + normX * (nLen + 10), py + normY * (nLen + 10))
    }
  }

  // 最高点マーク
  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(centerX, centerY - radPx, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '10px sans-serif'
  ctx.fillText('最高点 (N ≥ 0 必要)', centerX + 10, centerY - radPx - 8)
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

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

.status-badge.complete {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
  border: 1px solid #10b981;
}

.status-badge.detached {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
  border: 1px solid #ef4444;
}

.status-badge.insufficient {
  background: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
  border: 1px solid #f59e0b;
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

.stat-card .value.highlight {
  color: #f59e0b;
}

.stat-card .value.positive {
  color: #34d399;
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
</style>
