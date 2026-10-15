<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 半減期設定 [任意時間単位: 0.1 ~ 50]
const halfLifeA = ref(20.0) // 親核種 A の半減期 T_A
const halfLifeB = ref(3.0)  // 娘核種 B の半減期 T_B
const isPlaying = ref(true)
const simSpeed = ref(1.0)

const currentTime = ref(0)
const maxTime = ref(60)

let animationFrameId = null

const width = 500
const height = 340

// 崩壊定数
const lambdaA = computed(() => Math.LN2 / halfLifeA.value)
const lambdaB = computed(() => Math.LN2 / halfLifeB.value)

// 娘核種の極大到達時刻 t_max = ln(lambdaB / lambdaA) / (lambdaB - lambdaA)
const tMax = computed(() => {
  const lA = lambdaA.value
  const lB = lambdaB.value
  if (Math.abs(lA - lB) < 1e-5) return halfLifeA.value / Math.LN2
  if (lB <= lA) return null
  return Math.log(lB / lA) / (lB - lA)
})

// 平衡タイプの判定
const equilibriumType = computed(() => {
  const ratio = halfLifeA.value / halfLifeB.value
  if (ratio >= 8) return { name: '永続平衡 (Secular)', color: '#38bdf8' }
  if (ratio > 1.2) return { name: '過渡平衡 (Transient)', color: '#10b981' }
  return { name: '平衡なし (No Equilibrium)', color: '#f43f5e' }
})

// 現在の原子数 & 放射能
const currentStatus = computed(() => {
  const t = currentTime.value
  const lA = lambdaA.value
  const lB = lambdaB.value
  const N0 = 1000

  // NA(t) = N0 * exp(-lA * t)
  const NA = N0 * Math.exp(-lA * t)

  // NB(t)
  let NB = 0
  if (Math.abs(lA - lB) < 1e-4) {
    NB = N0 * lA * t * Math.exp(-lA * t)
  } else {
    NB = (N0 * lA / (lB - lA)) * (Math.exp(-lA * t) - Math.exp(-lB * t))
  }
  const NC = Math.max(0, N0 - NA - NB)

  // 放射能 Activity A = lambda * N
  const actA = lA * NA
  const actB = lB * NB

  return {
    NA: Math.round(NA),
    NB: Math.round(NB),
    NC: Math.round(NC),
    actA: actA.toFixed(1),
    actB: actB.toFixed(1),
    actRatio: actA > 0 ? (actB / actA).toFixed(2) : '1.00'
  }
})

function setPreset(mode) {
  if (mode === 'secular') {
    halfLifeA.value = 35.0
    halfLifeB.value = 2.5
  } else if (mode === 'transient') {
    halfLifeA.value = 16.0
    halfLifeB.value = 3.5
  } else if (mode === 'none') {
    halfLifeA.value = 4.0
    halfLifeB.value = 12.0
  }
  resetSim()
}

function resetSim() {
  currentTime.value = 0
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  const padLeft = 45
  const padRight = 20
  const padTop = 30
  const padBottom = 40
  const graphW = width - padLeft - padRight
  const graphH = height - padTop - padBottom

  // グリッド線
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padTop + (graphH / 5) * i
    ctx.beginPath()
    ctx.moveTo(padLeft, y)
    ctx.lineTo(width - padRight, y)
    ctx.stroke()

    // 縦軸目盛り
    ctx.fillStyle = '#64748b'
    ctx.font = '10px monospace'
    const val = 1000 - i * 200
    ctx.fillText(`${val}`, 12, y + 3)
  }

  for (let i = 0; i <= 6; i++) {
    const x = padLeft + (graphW / 6) * i
    ctx.beginPath()
    ctx.moveTo(x, padTop)
    ctx.lineTo(x, height - padBottom)
    ctx.stroke()

    // 横軸目盛り (時間)
    ctx.fillStyle = '#64748b'
    ctx.font = '10px monospace'
    const tVal = (maxTime.value / 6) * i
    ctx.fillText(`${tVal.toFixed(0)}`, x - 6, height - padBottom + 15)
  }

  // 軸ラベル
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('原子数 N', padLeft, padTop - 12)
  ctx.fillText('経過時間 t', width - padRight - 50, height - padBottom + 30)

  const lA = lambdaA.value
  const lB = lambdaB.value
  const N0 = 1000
  const tEnd = maxTime.value

  // 曲線描画ヘルパー
  function plotCurve(calcFn, strokeColor, lineWidth, isDash = false) {
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    if (isDash) ctx.setLineDash([4, 3])
    else ctx.setLineDash([])

    let first = true
    for (let px = 0; px <= graphW; px += 2) {
      const t = (px / graphW) * tEnd
      const N = calcFn(t)
      const py = padTop + graphH * (1 - Math.min(1.1, Math.max(0, N / N0)))

      if (first) {
        ctx.moveTo(padLeft + px, py)
        first = false
      } else {
        ctx.lineTo(padLeft + px, py)
      }
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  // 1. 親核種 NA(t) = N0 * exp(-lA * t) (青線)
  plotCurve((t) => N0 * Math.exp(-lA * t), '#38bdf8', 2.2)

  // 2. 娘核種 NB(t) (黄色線)
  plotCurve((t) => {
    if (Math.abs(lA - lB) < 1e-4) return N0 * lA * t * Math.exp(-lA * t)
    return (N0 * lA / (lB - lA)) * (Math.exp(-lA * t) - Math.exp(-lB * t))
  }, '#fbbf24', 2.5)

  // 3. 安定核種 NC(t) (緑点線)
  plotCurve((t) => {
    const na = N0 * Math.exp(-lA * t)
    let nb = 0
    if (Math.abs(lA - lB) < 1e-4) nb = N0 * lA * t * Math.exp(-lA * t)
    else nb = (N0 * lA / (lB - lA)) * (Math.exp(-lA * t) - Math.exp(-lB * t))
    return Math.max(0, N0 - na - nb)
  }, '#10b981', 1.8, true)

  // 現在時刻のインジケーター線
  const curT = currentTime.value
  if (curT <= tEnd) {
    const curX = padLeft + (curT / tEnd) * graphW
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(curX, padTop)
    ctx.lineTo(curX, height - padBottom)
    ctx.stroke()

    // 現在点マーク
    const s = currentStatus.value
    const yA = padTop + graphH * (1 - s.NA / N0)
    const yB = padTop + graphH * (1 - s.NB / N0)
    const yC = padTop + graphH * (1 - s.NC / N0)

    ctx.fillStyle = '#38bdf8'
    ctx.beginPath(); ctx.arc(curX, yA, 4, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath(); ctx.arc(curX, yB, 5, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#10b981'
    ctx.beginPath(); ctx.arc(curX, yC, 4, 0, Math.PI * 2); ctx.fill()
  }

  // アニメーション更新
  if (isPlaying.value) {
    currentTime.value += 0.08 * simSpeed.value
    if (currentTime.value > maxTime.value) {
      currentTime.value = 0
    }
  }

  animationFrameId = requestAnimationFrame(draw)
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">☢️</span>
        <span>放射平衡と壊変系列シミュレーター（<i>A</i> → <i>B</i> → <i>C</i>）</span>
      </div>
      <div class="badge" :style="{ borderColor: equilibriumType.color, color: equilibriumType.color }">
        {{ equilibriumType.name }}
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="legend-panel">
        <div class="legend-item"><span class="line a-line"></span> 親核種 <i>N</i><sub><i>A</i></sub> (減衰)</div>
        <div class="legend-item"><span class="line b-line"></span> 娘核種 <i>N</i><sub><i>B</i></sub> (生成・減衰)</div>
        <div class="legend-item"><span class="line c-line"></span> 安定核種 <i>N</i><sub><i>C</i></sub> (蓄積)</div>
      </div>
    </div>

    <!-- リアルタイム放射能ステータス -->
    <div class="status-grid">
      <div class="status-card">
        <span class="lbl">経過時間 <i>t</i>:</span>
        <span class="val highlight">{{ currentTime.toFixed(1) }}</span>
      </div>
      <div class="status-card">
        <span class="lbl">娘核種極大時刻 <i>t</i><sub>\max</sub>:</span>
        <span class="val">{{ tMax ? tMax.toFixed(1) : 'なし' }}</span>
      </div>
      <div class="status-card">
        <span class="lbl">親の放射能 λ<sub><i>A</i></sub> <i>N</i><sub><i>A</i></sub>:</span>
        <span class="val" style="color: #38bdf8">{{ currentStatus.actA }} Bq相当</span>
      </div>
      <div class="status-card">
        <span class="lbl">娘の放射能 λ<sub><i>B</i></sub> <i>N</i><sub><i>B</i></sub>:</span>
        <span class="val" style="color: #fbbf24">{{ currentStatus.actB }} Bq相当</span>
      </div>
      <div class="status-card highlight-box">
        <span class="lbl">放射能比 (λ<sub><i>B</i></sub> <i>N</i><sub><i>B</i></sub>) / (λ<sub><i>A</i></sub> <i>N</i><sub><i>A</i></sub>):</span>
        <span class="val">{{ currentStatus.actRatio }}</span>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="preset-buttons">
        <span class="preset-label">典型例プリセット:</span>
        <button class="preset-btn" @click="setPreset('secular')">
          永続平衡（ウラン-ラジウム型 <i>T</i><sub><i>A</i></sub> ≫ <i>T</i><sub><i>B</i></sub>）
        </button>
        <button class="preset-btn" @click="setPreset('transient')">
          過渡平衡（Mo-99/Tc-99m型 $T_A > T_B$）
        </button>
        <button class="preset-btn" @click="setPreset('none')">
          平衡なし（$T_A < T_B$）
        </button>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>親核種の半減期 <i>T</i><sub><i>A</i></sub>: <span>{{ halfLifeA.toFixed(1) }}</span></label>
          <input type="range" v-model.number="halfLifeA" min="2.0" max="45.0" step="0.5" />
        </div>
        <div class="control-group">
          <label>娘核種の半減期 <i>T</i><sub><i>B</i></sub>: <span>{{ halfLifeB.toFixed(1) }}</span></label>
          <input type="range" v-model.number="halfLifeB" min="1.0" max="25.0" step="0.5" />
        </div>
        <div class="control-group">
          <label>進行速度: <span>{{ simSpeed.toFixed(1) }}x</span></label>
          <input type="range" v-model.number="simSpeed" min="0.5" max="3.0" step="0.1" />
        </div>
      </div>

      <div class="action-row">
        <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
          {{ isPlaying ? '一時停止' : '再生' }}
        </button>
        <button class="btn btn-reset" @click="resetSim">t = 0 に戻す</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sim-canvas {
  width: 100%;
  max-width: 500px;
  height: auto;
  aspect-ratio: 500 / 340;
  display: block;
}

.legend-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.line {
  width: 16px;
  height: 3px;
  border-radius: 2px;
}
.line.a-line { background: #38bdf8; }
.line.b-line { background: #fbbf24; }
.line.c-line { background: #10b981; border: 1px dashed #ffffff; }

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.status-card {
  background: rgba(15, 23, 42, 0.7);
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.status-card.highlight-box {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.status-card .lbl {
  font-size: 0.7rem;
  color: #94a3b8;
}

.status-card .val {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.88rem;
  color: #f1f5f9;
}

.status-card .val.highlight {
  color: #fbbf24;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.preset-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.preset-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #334155;
  color: #ffffff;
  border-color: #38bdf8;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
