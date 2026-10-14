<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🏎️ 等加速度直線運動 & v-t グラフ 実験室</span>
      <span class="sim-badge">3公式・v-tグラフの傾きと面積</span>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="380"></canvas>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>初速度 v₀: <strong>{{ v0 }} m/s</strong></label>
        <input type="range" v-model.number="v0" min="-10" max="15" step="1" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">マイナス = 左向き、プラス = 右向き</div>
      </div>
      <div class="control-item">
        <label>加速度 a: <strong>{{ a }} m/s²</strong></label>
        <input type="range" v-model.number="a" min="-5" max="5" step="0.5" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">1秒あたりの速度変化量</div>
      </div>
      <div class="control-item">
        <label>プリセット条件:</label>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
          <button class="preset-btn" @click="setPreset(0, 2)">静止から加速 (v₀=0, a=2)</button>
          <button class="preset-btn" @click="setPreset(12, -3)">急ブレーキ (v₀=12, a=-3)</button>
          <button class="preset-btn" @click="setPreset(-6, 2)">Uターン (v₀=-6, a=2)</button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">経過時間 t</div>
        <div class="stat-value">{{ simT.toFixed(2) }} <span class="unit">s</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">現在の速度 v</div>
        <div class="stat-value">{{ currentV.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">① v = v₀ + at</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在の変位 x</div>
        <div class="stat-value">{{ currentX.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula">② x = v₀t + ½at² (面積)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">公式③ 検証 v² - v₀²</div>
        <div class="stat-value">{{ (currentV*currentV - v0*v0).toFixed(1) }}</div>
        <div class="stat-formula">2ax = {{ (2 * a * currentX).toFixed(1) }} (一致！)</div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <button class="btn btn-secondary" @click="reset">⏮ 最初から再生</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const isPlaying = ref(true)

const v0 = ref(2)
const a = ref(2)
const simT = ref(0)
const maxT = 6.0 // 6秒シミュレーション

const currentV = computed(() => v0.value + a.value * simT.value)
const currentX = computed(() => v0.value * simT.value + 0.5 * a.value * simT.value * simT.value)

let animId = null
let lastTime = null

function setPreset(newV0, newA) {
  v0.value = newV0
  a.value = newA
  reset()
}

function draw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (isPlaying.value) {
    simT.value += dt * 0.9
    if (simT.value > maxT) {
      simT.value = maxT
      isPlaying.value = false
    }
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height

  // 背景
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, w, h)

  // -------------------------
  // 上部：物理走行ビュー (h = 0〜150)
  // -------------------------
  const roadY = 110
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, w, 150)
  ctx.strokeStyle = '#27272a'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, w, 150)

  // 道路と目盛り (x = 0〜50m)
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(w, roadY); ctx.stroke()

  const originPx = 100
  const pxPerM = 8

  for (let m = -10; m <= 70; m += 10) {
    const mx = originPx + m * pxPerM
    if (mx >= 10 && mx <= w - 10) {
      ctx.strokeStyle = m === 0 ? '#ef4444' : '#52525b'
      ctx.lineWidth = m === 0 ? 2 : 1
      ctx.beginPath(); ctx.moveTo(mx, roadY - 5); ctx.lineTo(mx, roadY + 5); ctx.stroke()
      ctx.fillStyle = m === 0 ? '#ef4444' : '#71717a'
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`${m}m`, mx, roadY + 18)
    }
  }

  // 車（物体）
  const carX = originPx + currentX.value * pxPerM
  const carY = roadY - 14
  const carW = 34, carH = 20

  // 車体
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.roundRect(carX - carW/2, carY - carH, carW, carH, [5, 5, 2, 2])
  ctx.fill()

  // 車輪
  ctx.fillStyle = '#18181b'
  ctx.beginPath(); ctx.arc(carX - 10, carY, 4, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(carX + 10, carY, 4, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#71717a'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(carX - 10, carY, 4, 0, Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.arc(carX + 10, carY, 4, 0, Math.PI*2); ctx.stroke()

  // 速度ベクトル矢印 (緑)
  if (Math.abs(currentV.value) > 0.1) {
    const vArrowLen = currentV.value * 3.5
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(carX, carY - 26); ctx.lineTo(carX + vArrowLen, carY - 26); ctx.stroke()
    ctx.fillStyle = '#10b981'
    const dir = currentV.value > 0 ? 1 : -1
    ctx.beginPath()
    ctx.moveTo(carX + vArrowLen, carY - 26)
    ctx.lineTo(carX + vArrowLen - dir*7, carY - 30)
    ctx.lineTo(carX + vArrowLen - dir*7, carY - 22)
    ctx.fill()
    ctx.font = 'bold 11px sans-serif'; ctx.textAlign = currentV.value >= 0 ? 'left' : 'right'
    ctx.fillText(`v=${currentV.value.toFixed(1)}m/s`, carX + vArrowLen + dir*5, carY - 23)
  }

  // 加速度ベクトル矢印 (オレンジ)
  if (Math.abs(a.value) > 0.1) {
    const aArrowLen = a.value * 7
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(carX, carY - 40); ctx.lineTo(carX + aArrowLen, carY - 40); ctx.stroke()
    ctx.fillStyle = '#f59e0b'
    const dir = a.value > 0 ? 1 : -1
    ctx.beginPath()
    ctx.moveTo(carX + aArrowLen, carY - 40)
    ctx.lineTo(carX + aArrowLen - dir*6, carY - 44)
    ctx.lineTo(carX + aArrowLen - dir*6, carY - 36)
    ctx.fill()
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = a.value >= 0 ? 'left' : 'right'
    ctx.fillText(`a=${a.value.toFixed(1)}m/s²`, carX + aArrowLen + dir*5, carY - 37)
  }

  // 上部ラベル
  ctx.fillStyle = '#a1a1aa'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText('【直線上を走る物体の運動】', 12, 22)

  // -------------------------
  // 下部：リアルタイム v-t グラフ (h = 160〜370)
  // -------------------------
  const graphLeft = 65
  const graphRight = w - 40
  const graphTop = 175
  const graphBottom = 350
  const graphH = graphBottom - graphTop
  const graphW = graphRight - graphLeft
  const vAxisY = graphTop + graphH * 0.55 // v = 0 の軸

  // グラフ外枠・背景
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(graphLeft - 10, graphTop - 12, graphW + 20, graphH + 28)

  // 座標軸
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5
  // 横軸 (t)
  ctx.beginPath(); ctx.moveTo(graphLeft, vAxisY); ctx.lineTo(graphRight, vAxisY); ctx.stroke()
  // 縦軸 (v)
  ctx.beginPath(); ctx.moveTo(graphLeft, graphTop); ctx.lineTo(graphLeft, graphBottom); ctx.stroke()

  ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'
  ctx.textAlign = 'right'; ctx.fillText('v [m/s]', graphLeft - 6, graphTop + 8)
  ctx.textAlign = 'left'; ctx.fillText('t [s]', graphRight + 6, vAxisY + 4)
  ctx.fillText('0', graphLeft - 14, vAxisY + 4)

  // 目盛り (t = 1〜6s)
  for (let s = 1; s <= 6; s++) {
    const tx = graphLeft + (s / maxT) * graphW
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(tx, graphTop); ctx.lineTo(tx, graphBottom); ctx.stroke()
    ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`${s}`, tx, vAxisY + 14)
  }

  // 縦軸のスケール (v: -20〜+30 m/s)
  const vScale = 3.6 // px per 1 m/s

  // v-tグラフの面積（変位 x）の塗りつぶし
  if (simT.value > 0.05) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'
    ctx.beginPath()
    const t0x = graphLeft
    ctx.moveTo(t0x, vAxisY)

    const steps = 80
    for (let i = 0; i <= steps; i++) {
      const stepT = (simT.value * i) / steps
      const stepV = v0.value + a.value * stepT
      const gx = graphLeft + (stepT / maxT) * graphW
      const gy = vAxisY - stepV * vScale
      ctx.lineTo(gx, gy)
    }
    const endT = simT.value
    const endX = graphLeft + (endT / maxT) * graphW
    ctx.lineTo(endX, vAxisY)
    ctx.closePath()
    ctx.fill()

    // 面積ラベル
    const midX = graphLeft + (simT.value * 0.5 / maxT) * graphW
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`面積＝変位 x (${currentX.value.toFixed(1)}m)`, midX, vAxisY > 260 ? vAxisY - 30 : vAxisY + 25)
  }

  // v-tグラフの直線（全区間 t=0〜maxT の理論線）
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
  ctx.lineWidth = 1.5; ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(graphLeft, vAxisY - v0.value * vScale)
  ctx.lineTo(graphRight, vAxisY - (v0.value + a.value * maxT) * vScale)
  ctx.stroke()
  ctx.setLineDash([])

  // 現在までの軌跡（太線）
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(graphLeft, vAxisY - v0.value * vScale)
  const curPtX = graphLeft + (simT.value / maxT) * graphW
  const curPtY = vAxisY - currentV.value * vScale
  ctx.lineTo(curPtX, curPtY)
  ctx.stroke()

  // 現在の点マーカー
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath(); ctx.arc(curPtX, curPtY, 5, 0, Math.PI*2); ctx.fill()

  // 傾き＝加速度の説明
  ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`傾き＝加速度 a (${a.value} m/s²)`, graphLeft + 12, graphTop + 14)

  animId = requestAnimationFrame(draw)
}

function togglePlay() {
  if (simT.value >= maxT) reset()
  isPlaying.value = !isPlaying.value
}

function reset() {
  simT.value = 0
  lastTime = null
  isPlaying.value = true
}

watch([v0, a], () => {
  reset()
})

onMounted(() => {
  animId = requestAnimationFrame(draw)
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
  background: linear-gradient(90deg, #38bdf8, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.canvas-wrapper {
  background: #09090b;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #27272a;
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
  accent-color: #38bdf8;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}
.preset-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
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
  background: linear-gradient(135deg, #38bdf8, #0284c7);
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
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.07);
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
