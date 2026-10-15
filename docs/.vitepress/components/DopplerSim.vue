<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🔊 ドップラー効果・音波波面シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge badge-cyan">波面追跡</span>
        <span class="badge badge-yellow">超音速・衝撃波対応</span>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="sim-btn primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.2 }" @click="timeScale = 1.2">1.2x (速め)</button>
        </div>
      </div>
      <button class="sim-btn secondary" @click="stepSim(0.05)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="sim-btn secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        🔄 リセット
      </button>
    </div>

    <!-- メインCanvas -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">固有振動数 f₀</div>
        <div class="stat-value text-blue">{{ f0 }} <span class="stat-unit">Hz</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">音速 V</div>
        <div class="stat-value">{{ V }} <span class="stat-unit">m/s</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">音源速度 vs</div>
        <div class="stat-value" :class="vs >= V ? 'text-rose' : 'text-yellow'">
          {{ vs }} <span class="stat-unit">m/s (マッハ {{ (vs / V).toFixed(2) }})</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">前方受聴振動数 f'</div>
        <div class="stat-value text-cyan">
          {{ vs < V ? frontFreq.toFixed(1) : '衝撃波 (∞)' }} <span class="stat-unit">Hz</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>音源速度 vs:</span>
            <span class="control-val">{{ vs }} m/s</span>
          </label>
          <input type="range" v-model.number="vs" min="0" max="450" step="10" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>観測者速度 vo (右向き):</span>
            <span class="control-val">{{ vo }} m/s</span>
          </label>
          <input type="range" v-model.number="vo" min="-100" max="100" step="5" class="sim-slider" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="togglePlay" class="sim-btn primary">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ 再生' }}
        </button>
        <button @click="resetSim" class="sim-btn secondary">🔄 リセット</button>
        <button @click="setPreset('subsonic')" class="sim-btn outline">亜音速 (マッハ 0.5)</button>
        <button @click="setPreset('sonic')" class="sim-btn outline">音速 (マッハ 1.0)</button>
        <button @click="setPreset('supersonic')" class="sim-btn outline">超音速 (マッハ 1.3)</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>観察のポイント</strong>:
      音源が右へ動くと、前方の波面間隔（見かけの波長 λ'）がギュッと縮まり高音（周波数 <i>f</i>' 増加）に聞こえ、後方は波長が伸びて低音に聞こえます。
      <i>v</i><sub>s</sub> &gt; <i>V</i>（超音速）になると、波面同士が重なり合って円錐状の<strong>衝撃波（マッハ円錐）</strong>を形成します。
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const isRunning = ref(true)
const timeScale = ref(0.4) // デフォルトで波面がじっくり追える0.4xスロー再生

// 物理パラメータ
const V = ref(340) // 音速 [m/s]
const vs = ref(170) // 音源速度 [m/s]
const vo = ref(0) // 観測者速度 [m/s]
const f0 = ref(5) // シミュレーション表示用基本振動数 [Hz]

// 音源と波面管理
let sourceX = 150
let sourceY = 190
let observerX = 580
let waves = [] // { x, y, r, alpha }
let lastEmitTime = 0
let animId = null
let lastTime = 0

// 前方受聴周波数
const frontFreq = computed(() => {
  if (vs.value >= V.value) return 9999
  const ratio = (V.value - vo.value) / (V.value - vs.value)
  return Math.max(0, 440 * ratio)
})

function togglePlay() {
  isRunning.value = !isRunning.value
}

function resetSim() {
  sourceX = 80
  observerX = 580
  waves = []
}

function setPreset(type) {
  if (type === 'subsonic') {
    vs.value = 170
    vo.value = 0
  } else if (type === 'sonic') {
    vs.value = 340
    vo.value = 0
  } else if (type === 'supersonic') {
    vs.value = 440
    vo.value = 0
  }
  resetSim()
}

function advancePhysics(simDt) {
  const canvas = canvasRef.value
  const width = canvas ? canvas.width : 700
  const pxPerMeter = 0.5
  sourceX += vs.value * pxPerMeter * simDt
  observerX += vo.value * pxPerMeter * simDt

  if (sourceX > width + 100) {
    sourceX = -50
  }
  if (observerX > width + 50) observerX = 50
  if (observerX < 50) observerX = width - 50

  lastEmitTime += simDt
  const emitInterval = 1 / f0.value
  if (lastEmitTime >= emitInterval) {
    waves.push({
      x: sourceX,
      y: sourceY,
      r: 0,
      alpha: 1.0
    })
    lastEmitTime = 0
  }

  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].r += V.value * pxPerMeter * simDt
    waves[i].alpha -= 0.08 * simDt
    if (waves[i].alpha <= 0 || waves[i].r > width * 1.5) {
      waves.splice(i, 1)
    }
  }
}

function stepSim(dtSec = 0.05) {
  advancePhysics(dtSec)
}

function updateAndDraw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (isRunning.value) {
    advancePhysics(dt * timeScale.value)
  }

  // --- 描画処理 ---
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // 背景グリッド
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 中心運動軸
  ctx.strokeStyle = '#334155'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(0, sourceY)
  ctx.lineTo(width, sourceY)
  ctx.stroke()
  ctx.setLineDash([])

  // 波面の描画
  waves.forEach(w => {
    ctx.beginPath()
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, w.alpha * 0.7)})`
    ctx.lineWidth = 1.8
    ctx.stroke()
  })

  // 超音速時のマッハ円錐
  if (vs.value > V.value) {
    const sinTheta = V.value / vs.value
    const theta = Math.asin(sinTheta)
    const coneLen = 400

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)'
    ctx.lineWidth = 2.5

    ctx.beginPath()
    ctx.moveTo(sourceX, sourceY)
    ctx.lineTo(sourceX - coneLen * Math.cos(theta), sourceY - coneLen * Math.sin(theta))
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(sourceX, sourceY)
    ctx.lineTo(sourceX - coneLen * Math.cos(theta), sourceY + coneLen * Math.sin(theta))
    ctx.stroke()

    ctx.fillStyle = '#f43f5e'
    ctx.font = '12px sans-serif'
    ctx.fillText(`衝撃波 (マッハ角 θ = ${(theta * 180 / Math.PI).toFixed(1)}°)`, sourceX - 160, sourceY - 45)
  }

  // 観測者
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(observerX, sourceY, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#22c55e'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('観測者 O', observerX - 25, sourceY - 16)
  if (vo.value !== 0) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'
    ctx.fillText(`${vo.value > 0 ? '→' : '←'} ${Math.abs(vo.value)} m/s`, observerX - 25, sourceY + 24)
  }

  // 音源
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(sourceX, sourceY, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  if (vs.value > 0) {
    const arrowLen = Math.min(60, vs.value * 0.15)
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(sourceX + 10, sourceY)
    ctx.lineTo(sourceX + 10 + arrowLen, sourceY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(sourceX + 10 + arrowLen, sourceY)
    ctx.lineTo(sourceX + 10 + arrowLen - 6, sourceY - 4)
    ctx.lineTo(sourceX + 10 + arrowLen - 6, sourceY + 4)
    ctx.closePath()
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
  }

  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('音源 S (vs)', sourceX - 25, sourceY - 18)

  animId = requestAnimationFrame(updateAndDraw)
}

onMounted(() => {
  animId = requestAnimationFrame(updateAndDraw)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.sim-badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.canvas-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  background: #0f172a;
}

.sim-canvas {
  display: block;
  width: 100%;
  max-width: 700px;
  height: auto;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: var(--vp-c-bg-mute);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--vp-c-text-2);
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 16px;
  background: var(--vp-c-bg-mute);
  padding: 14px;
  border-radius: 8px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 14px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.control-val {
  color: #38bdf8;
  font-family: monospace;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn.primary {
  background: #0284c7;
  color: #fff;
  border: none;
}
.sim-btn.primary:hover {
  background: #0369a1;
}

.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: none;
}
.sim-btn.secondary:hover {
  background: #475569;
}

.sim-btn.outline {
  background: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.sim-btn.outline:hover {
  background: var(--vp-c-bg-soft);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  background: rgba(30, 41, 59, 0.4);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
</style>
