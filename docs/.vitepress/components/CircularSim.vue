<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🔄 等速円運動と向心加速度 実験室</span>
      <span class="sim-badge">向心力・ベクトル直交・単振動への正射影</span>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨・観察)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+15°)
      </button>
      <button class="btn btn-secondary" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="380"></canvas>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>半径 r: <strong>{{ r.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="r" min="0.8" max="2.5" step="0.1" />
      </div>
      <div class="control-item">
        <label>角速度 ω: <strong>{{ omega.toFixed(2) }} rad/s</strong></label>
        <input type="range" v-model.number="omega" min="0.5" max="3.5" step="0.1" />
      </div>
      <div class="control-item">
        <label>質量 m: <strong>{{ m.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.5" max="5.0" step="0.5" />
      </div>
      <div class="control-item">
        <label>表示オプション:</label>
        <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
          <button :class="['preset-btn', { active: showVelocity }]" @click="showVelocity = !showVelocity">
            {{ showVelocity ? '✓ 速度ベクトル v' : '速度ベクトル v' }}
          </button>
          <button :class="['preset-btn', { active: showAccel }]" @click="showAccel = !showAccel">
            {{ showAccel ? '✓ 加速度ベクトル a' : '加速度ベクトル a' }}
          </button>
          <button :class="['preset-btn', { active: showProjection }]" @click="showProjection = !showProjection">
            {{ showProjection ? '✓ 単振動正射影 (x軸)' : '単振動正射影 (x軸)' }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">円周上の速さ v</div>
        <div class="stat-value">{{ speed.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">v = rω</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">向心加速度 a</div>
        <div class="stat-value">{{ accel.toFixed(2) }} <span class="unit">m/s²</span></div>
        <div class="stat-formula">a = rω² = v²/r</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">必要な向心力 F</div>
        <div class="stat-value">{{ force.toFixed(2) }} <span class="unit">N</span></div>
        <div class="stat-formula">F = ma = mrω²</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">周期 T</div>
        <div class="stat-value">{{ period.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula">T = 2π/ω (1周の時間)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">回転数 f</div>
        <div class="stat-value">{{ freq.toFixed(2) }} <span class="unit">Hz</span></div>
        <div class="stat-formula">f = 1/T (1秒あたりの回転数)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const isPlaying = ref(true)
const timeScale = ref(0.5) // デフォルトで観察しやすい0.5x速度

const r = ref(1.6)
const omega = ref(1.5)
const m = ref(1.0)
const showVelocity = ref(true)
const showAccel = ref(true)
const showProjection = ref(true)

const speed = computed(() => r.value * omega.value)
const accel = computed(() => r.value * omega.value * omega.value)
const force = computed(() => m.value * accel.value)
const period = computed(() => (2 * Math.PI) / omega.value)
const freq = computed(() => 1 / period.value)

let animId = null
let angle = 0
let lastTime = null

function draw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (isPlaying.value) {
    angle += omega.value * dt * timeScale.value
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height

  // 背景描画
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, w, h)

  // グリッド線
  ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)'
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

  const centerX = w * 0.45
  const centerY = h * 0.5
  const pxPerMeter = 90
  const radiusPx = r.value * pxPerMeter

  // 座標軸 (x, y)
  ctx.strokeStyle = 'rgba(161, 161, 170, 0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath(); ctx.moveTo(centerX - radiusPx - 30, centerY); ctx.lineTo(centerX + radiusPx + 30, centerY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(centerX, centerY - radiusPx - 30); ctx.lineTo(centerX, centerY + radiusPx + 30); ctx.stroke()
  ctx.setLineDash([])

  // 円軌道
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(centerX, centerY, radiusPx, 0, Math.PI * 2)
  ctx.stroke()

  // 物体位置 (反時計回り)
  const objX = centerX + radiusPx * Math.cos(angle)
  const objY = centerY - radiusPx * Math.sin(angle)

  // 半径線
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(objX, objY); ctx.stroke()

  // 中心点
  ctx.fillStyle = '#a1a1aa'
  ctx.beginPath(); ctx.arc(centerX, centerY, 4, 0, Math.PI * 2); ctx.fill()
  ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
  ctx.fillText('O', centerX - 8, centerY + 12)

  // 単振動への正射影 (x軸への投影)
  if (showProjection.value) {
    const projY = h - 35
    // 補助線（点線）
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(objX, projY); ctx.stroke()
    ctx.setLineDash([])

    // x軸レール
    ctx.strokeStyle = '#3f3f46'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(centerX - radiusPx - 20, projY); ctx.lineTo(centerX + radiusPx + 20, projY); ctx.stroke()

    // 中心と端点マーク
    ctx.fillStyle = '#71717a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('x = 0', centerX, projY + 16)
    ctx.fillText('-r', centerX - radiusPx, projY + 16)
    ctx.fillText('+r', centerX + radiusPx, projY + 16)

    // 正射影のおもり
    ctx.fillStyle = '#f43f5e'
    ctx.beginPath(); ctx.arc(objX, projY, 8, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fda4af'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('正射影 (単振動 x = r cos ωt)', centerX, projY - 14)
  }

  // 速度ベクトル v (接線方向: 角度 + 90度)
  if (showVelocity.value) {
    const vScale = 22
    const vx = -speed.value * Math.sin(angle) * vScale
    const vy = -speed.value * Math.cos(angle) * vScale
    const endVx = objX + vx
    const endVy = objY + vy

    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(endVx, endVy); ctx.stroke()

    // 矢印の頭
    const vLen = Math.hypot(vx, vy)
    if (vLen > 5) {
      const uVx = vx / vLen, uVy = vy / vLen
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(endVx, endVy)
      ctx.lineTo(endVx - uVx * 9 - uVy * 5, endVy - uVy * 9 + uVx * 5)
      ctx.lineTo(endVx - uVx * 9 + uVy * 5, endVy - uVy * 9 - uVx * 5)
      ctx.fill()
    }
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`v = ${speed.value.toFixed(2)} m/s`, endVx + 6, endVy + 4)
  }

  // 向心加速度ベクトル a (中心方向)
  if (showAccel.value) {
    const aScale = 6
    const ax = -accel.value * Math.cos(angle) * aScale
    const ay = accel.value * Math.sin(angle) * aScale
    const endAx = objX + ax
    const endAy = objY + ay

    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(endAx, endAy); ctx.stroke()

    // 矢印の頭
    const aLen = Math.hypot(ax, ay)
    if (aLen > 5) {
      const uAx = ax / aLen, uAy = ay / aLen
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.moveTo(endAx, endAy)
      ctx.lineTo(endAx - uAx * 9 - uAy * 5, endAy - uAy * 9 + uAx * 5)
      ctx.lineTo(endAx - uAx * 9 + uAy * 5, endAy - uAy * 9 - uAx * 5)
      ctx.fill()
    }
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`a = ${accel.value.toFixed(2)} m/s² (中心向き)`, endAx + 6, endAy - 6)
  }

  // 回転する物体
  const objR = 12 + m.value * 2
  const grad = ctx.createRadialGradient(objX - 3, objY - 3, 2, objX, objY, objR)
  grad.addColorStop(0, '#818cf8')
  grad.addColorStop(1, '#4f46e5')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(objX, objY, objR, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#c7d2fe'; ctx.lineWidth = 1.5; ctx.stroke()

  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('m', objX, objY)
  ctx.textBaseline = 'alphabetic'

  // 直交マーク (v と a は常に 90 度！)
  if (showVelocity.value && showAccel.value) {
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'right'
    ctx.fillText('v ⊥ a （速度と加速度は常に直交！）', w - 16, 26)
  }

  animId = requestAnimationFrame(draw)
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stepForward() {
  angle += (15 * Math.PI) / 180
}

function reset() {
  angle = 0
}

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
  background: linear-gradient(90deg, #818cf8, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(129, 140, 248, 0.3);
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
  accent-color: #818cf8;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.2s;
}
.preset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.preset-btn.active {
  background: rgba(129, 140, 248, 0.25);
  border-color: #818cf8;
  color: #c7d2fe;
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
  background: linear-gradient(135deg, #818cf8, #ec4899);
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
  border-color: rgba(129, 140, 248, 0.4);
  background: rgba(129, 140, 248, 0.07);
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
