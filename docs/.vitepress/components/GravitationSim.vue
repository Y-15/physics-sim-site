<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🪐 万有引力と人工衛星の軌道・ケプラーの法則</span>
      <span class="sim-badge">第1宇宙速度・脱出速度・面積速度一定</span>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="420"></canvas>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>初速比 (v₀ / v₁): <strong>{{ speedRatio.toFixed(2) }}倍</strong></label>
        <input type="range" v-model.number="speedRatio" min="0.5" max="1.55" step="0.02" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">
          1.0 = 円軌道、1.41 (√2) = 脱出速度（第2宇宙速度）
        </div>
      </div>
      <div class="control-item">
        <label>初期距離 r₀: <strong>{{ initialR.toFixed(1) }} × 10³ km</strong></label>
        <input type="range" v-model.number="initialR" min="10" max="25" step="1" />
      </div>
      <div class="control-item">
        <label>軌道プリセット:</label>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
          <button :class="['preset-btn', { active: Math.abs(speedRatio - 1.0) < 0.02 }]" @click="setPreset(1.0)">
            🛰️ 円軌道 (v₁)
          </button>
          <button :class="['preset-btn', { active: Math.abs(speedRatio - 1.2) < 0.02 }]" @click="setPreset(1.2)">
            ☄️ 楕円軌道 (1.2v₁)
          </button>
          <button :class="['preset-btn', { active: Math.abs(speedRatio - 1.414) < 0.02 }]" @click="setPreset(1.414)">
            🚀 脱出軌道 (√2v₁)
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" :class="{ highlight: orbitType === '円軌道' || orbitType === '楕円軌道' }">
        <div class="stat-label">現在の軌道の種類</div>
        <div class="stat-value" :style="{ fontSize: '1.15rem', color: orbitColor }">
          {{ orbitType }}
        </div>
        <div class="stat-formula">{{ orbitDescription }}</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">現在の速さ v</div>
        <div class="stat-value">{{ curV.toFixed(2) }} <span class="unit">km/s</span></div>
        <div class="stat-formula">第1宇宙速度 v₁ = {{ v1.toFixed(2) }} km/s</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">天体中心からの距離 r</div>
        <div class="stat-value">{{ curR.toFixed(1) }} <span class="unit">×10³ km</span></div>
        <div class="stat-formula">{{ curR < initialR ? '近地点に接近中' : '遠地点に接近中' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">全力学的エネルギー E</div>
        <div class="stat-value" :style="{ color: totalE < 0 ? '#38bdf8' : '#f59e0b' }">
          {{ totalE < 0 ? 'E < 0 (束縛)' : 'E ≥ 0 (脱出)' }}
        </div>
        <div class="stat-formula">E = ½mv² - GMm/r = 一定</div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <button class="btn btn-secondary" @click="reset">⏮ 軌道をリセット</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const isPlaying = ref(true)

const speedRatio = ref(1.0)
const initialR = ref(16.0) // 16 * 10^3 km
const GM = 1000 // シミュレーション用無次元重力パラメータ

// 第1宇宙速度 (円軌道速度): v1 = sqrt(GM / r0)
const v1 = computed(() => Math.sqrt(GM / initialR.value))
const curV = ref(0)
const curR = ref(16.0)
const totalE = ref(-1)

const orbitType = computed(() => {
  const r = speedRatio.value
  if (Math.abs(r - 1.0) < 0.03) return '円軌道'
  if (r < 1.0) return '内側楕円軌道'
  if (r < 1.41) return '外側楕円軌道'
  if (Math.abs(r - 1.414) < 0.04) return '放物線軌道 (脱出限界)'
  return '双曲線軌道 (宇宙へ脱出)'
})

const orbitColor = computed(() => {
  if (orbitType.value === '円軌道') return '#10b981'
  if (orbitType.value.includes('楕円')) return '#38bdf8'
  if (orbitType.value.includes('放物線')) return '#fbbf24'
  return '#f43f5e'
})

const orbitDescription = computed(() => {
  if (orbitType.value === '円軌道') return '速さ一定・完全対称'
  if (orbitType.value.includes('楕円')) return 'ケプラー第2法則：近地点で最速'
  return '引力を振り切り無限遠へ飛び去る'
})

// 状態変数 (2D運動シミュレーション)
let px = 0, py = 0
let vx = 0, vy = 0
let trail = []
let animId = null
let lastTime = null

function setPreset(val) {
  speedRatio.value = val
  reset()
}

function reset() {
  px = 0
  py = initialR.value
  vx = v1.value * speedRatio.value
  vy = 0
  trail = []
}

function updatePhysics(dt) {
  // ルンゲクッタ4次法 (RK4) による天体軌道の数値積分
  const substeps = 8
  const subDt = dt / substeps

  for (let s = 0; s < substeps; s++) {
    const k1v = accelAt(px, py)
    const k1x = { x: vx, y: vy }

    const k2x = { x: vx + 0.5 * subDt * k1v.x, y: vy + 0.5 * subDt * k1v.y }
    const k2v = accelAt(px + 0.5 * subDt * k1x.x, py + 0.5 * subDt * k1x.y)

    const k3x = { x: vx + 0.5 * subDt * k2v.x, y: vy + 0.5 * subDt * k2v.y }
    const k3v = accelAt(px + 0.5 * subDt * k2x.x, py + 0.5 * subDt * k2x.y)

    const k4x = { x: vx + subDt * k3v.x, y: vy + subDt * k3v.y }
    const k4v = accelAt(px + subDt * k3x.x, py + subDt * k3x.y)

    px += (subDt / 6) * (k1x.x + 2 * k2x.x + 2 * k3x.x + k4x.x)
    py += (subDt / 6) * (k1x.y + 2 * k2x.y + 2 * k3x.y + k4x.y)
    vx += (subDt / 6) * (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x)
    vy += (subDt / 6) * (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y)
  }

  const r = Math.hypot(px, py)
  const v = Math.hypot(vx, vy)
  curR.value = r
  curV.value = v
  totalE.value = 0.5 * v * v - GM / r

  trail.push({ x: px, y: py })
  if (trail.length > 500) trail.shift()
}

function accelAt(x, y) {
  const r2 = x * x + y * y
  const r = Math.sqrt(r2)
  if (r < 1.0) return { x: 0, y: 0 }
  const a = -GM / r2
  return { x: a * (x / r), y: a * (y / r) }
}

function draw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min(0.04, (timestamp - lastTime) / 1000)
  lastTime = timestamp

  if (isPlaying.value) {
    updatePhysics(dt * 3.5)
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height

  ctx.fillStyle = '#05070e'
  ctx.fillRect(0, 0, w, h)

  // 背景の星々
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  for (let i = 0; i < 40; i++) {
    const sx = (i * 12347) % w
    const sy = (i * 23497) % h
    ctx.fillRect(sx, sy, 1.5, 1.5)
  }

  const originX = w * 0.48
  const originY = h * 0.52
  const scale = 7.5 // px per unit

  // 軌跡 (Trail)
  if (trail.length > 1) {
    ctx.strokeStyle = orbitColor.value
    ctx.lineWidth = 1.8
    ctx.beginPath()
    for (let i = 0; i < trail.length; i++) {
      const tx = originX + trail[i].x * scale
      const ty = originY - trail[i].y * scale
      if (i === 0) ctx.moveTo(tx, ty)
      else ctx.lineTo(tx, ty)
    }
    ctx.stroke()
  }

  // 面積速度一定の掃引扇形（現在と1つ前の位置との三角形）
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.beginPath()
  ctx.moveTo(originX, originY)
  const satScreenX = originX + px * scale
  const satScreenY = originY - py * scale
  ctx.lineTo(satScreenX, satScreenY)
  if (trail.length > 15) {
    const oldP = trail[Math.max(0, trail.length - 15)]
    ctx.lineTo(originX + oldP.x * scale, originY - oldP.y * scale)
  }
  ctx.closePath()
  ctx.fill()

  // 中心天体（地球・太陽）
  const planetR = 24
  const grad = ctx.createRadialGradient(originX - 4, originY - 4, 3, originX, originY, planetR)
  grad.addColorStop(0, '#67e8f9')
  grad.addColorStop(0.6, '#0284c7')
  grad.addColorStop(1, '#082f49')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(originX, originY, planetR, 0, Math.PI*2); ctx.fill()

  ctx.strokeStyle = 'rgba(103, 232, 249, 0.3)'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(originX, originY, planetR + 3, 0, Math.PI*2); ctx.stroke()

  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('地球 M', originX, originY)
  ctx.textBaseline = 'alphabetic'

  // 人工衛星 / 惑星
  const satR = 7
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath(); ctx.arc(satScreenX, satScreenY, satR, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()

  // 速度ベクトル矢印 (緑)
  const vScale = 3.5
  const endVx = satScreenX + vx * vScale
  const endVy = satScreenY - vy * vScale
  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(satScreenX, satScreenY); ctx.lineTo(endVx, endVy); ctx.stroke()

  // 矢印頭
  const vAngle = Math.atan2(-vy, vx)
  ctx.fillStyle = '#10b981'
  ctx.beginPath()
  ctx.moveTo(endVx, endVy)
  ctx.lineTo(endVx - 7 * Math.cos(vAngle - Math.PI/6), endVy - 7 * Math.sin(vAngle - Math.PI/6))
  ctx.lineTo(endVx - 7 * Math.cos(vAngle + Math.PI/6), endVy - 7 * Math.sin(vAngle + Math.PI/6))
  ctx.fill()

  // 万有引力線（中心へ向かう点線）
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
  ctx.lineWidth = 1.5; ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.moveTo(satScreenX, satScreenY); ctx.lineTo(originX, originY); ctx.stroke()
  ctx.setLineDash([])

  // 近地点・遠地点テキスト
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText('万有引力 F = GMm/r² (中心向き)', 16, 26)

  animId = requestAnimationFrame(draw)
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

watch([speedRatio, initialR], () => {
  reset()
})

onMounted(() => {
  reset()
  animId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: linear-gradient(145deg, #0f172a, #05070e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  color: #f4f4f5;
  font-family: 'Outfit', sans-serif;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.sim-title {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(90deg, #38bdf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(192, 132, 252, 0.15);
  color: #c084fc;
  border: 1px solid rgba(192, 132, 252, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.canvas-wrapper {
  background: #05070e;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #1e293b;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
canvas {
  width: 100%;
  max-width: 700px;
  height: auto;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
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
.control-item input[type=range] {
  width: 100%;
  accent-color: #c084fc;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.2s;
}
.preset-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.preset-btn.active {
  background: rgba(192, 132, 252, 0.25);
  border-color: #c084fc;
  color: #e9d5ff;
}
.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
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
  background: linear-gradient(135deg, #c084fc, #6366f1);
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
}
.stat-card.highlight {
  border-color: rgba(192, 132, 252, 0.4);
  background: rgba(192, 132, 252, 0.07);
}
.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}
.stat-value {
  font-size: 1.25rem;
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
