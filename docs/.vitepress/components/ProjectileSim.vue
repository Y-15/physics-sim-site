<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🎯 斜方投射（放物運動）インタラクティブ実験室</span>
      <span class="sim-badge">リアルタイム計算</span>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : (isFinished ? '🔄 もう一度発射' : '🚀 発射！') }}
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
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <!-- Canvas表示部 -->
    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="360"></canvas>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-grid">
      <div class="control-item">
        <label>
          <span>初速度 <i>v</i><sub>0</sub>:</span> <strong>{{ v0 }} m/s</strong>
        </label>
        <input type="range" v-model.number="v0" min="5" max="35" step="1" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          <span>発射角 θ:</span> <strong>{{ angle }}°</strong>
        </label>
        <input type="range" v-model.number="angle" min="5" max="85" step="1" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          <span>重力加速度 <i>g</i>:</span> <strong>{{ g }} m/s²</strong>
        </label>
        <input type="range" v-model.number="g" min="1.6" max="25" step="0.1" @input="onParamChange" />
      </div>
    </div>

    <!-- 惑星プリセットボタン -->
    <div class="preset-buttons">
      <span class="preset-label">重力プリセット:</span>
      <button :class="{ active: g === 9.8 }" @click="setGravity(9.8)">🌍 地球 (9.8)</button>
      <button :class="{ active: g === 1.62 }" @click="setGravity(1.62)">🌕 月 (1.62)</button>
      <button :class="{ active: g === 3.72 }" @click="setGravity(3.72)">🔴 火星 (3.72)</button>
    </div>

    <!-- 表示オプション -->
    <div class="action-buttons" style="justify-content: flex-start; padding: 6px 0;">
      <label class="toggle-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1; font-size: 0.9rem;">
        <input type="checkbox" v-model="showVectors" @change="drawScene" />
        📐 速度ベクトル（水平・鉛直成分）を表示
      </label>
    </div>

    <!-- 理論値データ表示カード -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">滞空時間 <i>T</i></div>
        <div class="stat-value">{{ theoreticalTime.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula"><span class="frac"><span class="num">2<i>v</i>₀ sinθ</span><span class="den"><i>g</i></span></span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最高到達点 <i>H</i></div>
        <div class="stat-value">{{ maxHeight.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula"><span class="frac"><span class="num"><i>v</i>₀² sin²θ</span><span class="den">2<i>g</i></span></span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">水平到達距離 <i>R</i></div>
        <div class="stat-value">{{ maxDistance.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula"><span class="frac"><span class="num"><i>v</i>₀² sin 2θ</span><span class="den"><i>g</i></span></span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const timeScale = ref(0.4) // デフォルトで放物軌道をじっくり追える0.4xスロー再生
const v0 = ref(20)
const angle = ref(45)
const g = ref(9.8)
const showVectors = ref(true)

const isPlaying = ref(false)
const isFinished = ref(false)

let animId = null
let t = 0 // シミュレーション時刻 (秒)
let trail = [] // 描画された軌跡座標

// 理論値の計算
const rad = computed(() => (angle.value * Math.PI) / 180)
const vx0 = computed(() => v0.value * Math.cos(rad.value))
const vy0 = computed(() => v0.value * Math.sin(rad.value))

const theoreticalTime = computed(() => (2 * vy0.value) / g.value)
const maxHeight = computed(() => (vy0.value * vy0.value) / (2 * g.value))
const maxDistance = computed(() => (v0.value * v0.value * Math.sin(2 * rad.value)) / g.value)

// 座標変換用のスケール
const originX = 60
const originY = 310
const meterScale = 5.5 // 1メートルあたりのピクセル数

const setGravity = (val) => {
  g.value = val
  onParamChange()
}

const onParamChange = () => {
  resetSim()
}

const resetSim = () => {
  if (animId) cancelAnimationFrame(animId)
  isPlaying.value = false
  isFinished.value = false
  t = 0
  trail = []
  drawScene()
}

const togglePlay = () => {
  if (isFinished.value) {
    resetSim()
    isPlaying.value = true
    animate()
    return
  }
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    animate()
  } else {
    cancelAnimationFrame(animId)
  }
}

const advanceStep = (dt) => {
  t += dt
  const curX = vx0.value * t
  const curY = vy0.value * t - 0.5 * g.value * t * t

  if (curY <= 0 && t > 0.05) {
    // 地面に着地
    isPlaying.value = false
    isFinished.value = true
    trail.push({ x: maxDistance.value, y: 0 })
    drawScene(maxDistance.value, 0, vx0.value, -vy0.value)
    return false
  }

  const curVy = vy0.value - g.value * t
  trail.push({ x: curX, y: curY })
  drawScene(curX, curY, vx0.value, curVy)
  return true
}

const stepForward = () => {
  if (isFinished.value) resetSim()
  advanceStep(0.04)
}

const animate = () => {
  const dt = 0.025 * timeScale.value // 時間刻み (可変速)
  const cont = advanceStep(dt)

  if (isPlaying.value && cont) {
    animId = requestAnimationFrame(animate)
  }
}

const drawScene = (ballX = 0, ballY = 0, currentVx = vx0.value, currentVy = vy0.value) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  // 背景クリア
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, w, h)

  // 背景グリッド（10m間隔）
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  for (let m = 10; m <= 100; m += 10) {
    const px = originX + m * meterScale
    if (px < w) {
      ctx.beginPath()
      ctx.moveTo(px, 30)
      ctx.lineTo(px, originY)
      ctx.stroke()
      ctx.fillStyle = '#475569'
      ctx.font = '10px sans-serif'
      ctx.fillText(`${m}m`, px - 8, originY + 16)
    }
    const py = originY - m * meterScale
    if (py > 30) {
      ctx.beginPath()
      ctx.moveTo(originX, py)
      ctx.lineTo(w - 20, py)
      ctx.stroke()
      ctx.fillStyle = '#475569'
      ctx.font = '10px sans-serif'
      ctx.fillText(`${m}m`, originX - 30, py + 4)
    }
  }

  // 地面
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(30, originY)
  ctx.lineTo(w - 20, originY)
  ctx.stroke()

  // 地面の土台
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(30, originY + 1, w - 50, 45)

  // 予測軌跡（破線）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
  ctx.setLineDash([4, 4])
  ctx.lineWidth = 2
  ctx.beginPath()
  const totalT = theoreticalTime.value
  for (let step = 0; step <= 60; step++) {
    const simT = (totalT * step) / 60
    const tx = vx0.value * simT
    const ty = vy0.value * simT - 0.5 * g.value * simT * simT
    const px = originX + tx * meterScale
    const py = originY - ty * meterScale
    if (step === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // 実際の描画軌跡（実線）
  if (trail.length > 1) {
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let i = 0; i < trail.length; i++) {
      const px = originX + trail[i].x * meterScale
      const py = originY - trail[i].y * meterScale
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // 最高点のマーカー線
  const maxHx = originX + (maxDistance.value / 2) * meterScale
  const maxHy = originY - maxHeight.value * meterScale
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'
  ctx.setLineDash([2, 2])
  ctx.beginPath()
  ctx.moveTo(maxHx, originY)
  ctx.lineTo(maxHx, maxHy)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(maxHx, maxHy, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '11px sans-serif'
  ctx.fillText(`最高点 H = ${maxHeight.value.toFixed(1)}m`, maxHx - 35, maxHy - 8)

  // 発射台
  ctx.fillStyle = '#64748b'
  ctx.beginPath()
  ctx.arc(originX, originY, 12, Math.PI, 0, false)
  ctx.fill()

  // 大砲の砲身
  const barrelLen = 22
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(originX, originY)
  ctx.lineTo(originX + barrelLen * Math.cos(rad.value), originY - barrelLen * Math.sin(rad.value))
  ctx.stroke()

  // ボールの描画
  const ballPx = originX + ballX * meterScale
  const ballPy = originY - ballY * meterScale
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(ballPx, ballPy, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  // 速度ベクトル描画
  if (showVectors.value) {
    const vecScale = 2.2
    // 合成速度 v
    drawArrow(ctx, ballPx, ballPy, ballPx + currentVx * vecScale, ballPy - currentVy * vecScale, '#10b981', 'v')
    // 水平分力 vx
    drawArrow(ctx, ballPx, ballPy, ballPx + currentVx * vecScale, ballPy, 'rgba(56, 189, 248, 0.6)', 'vx')
    // 鉛直分力 vy
    drawArrow(ctx, ballPx, ballPy, ballPx, ballPy - currentVy * vecScale, 'rgba(239, 68, 68, 0.6)', 'vy')
  }
}

const drawArrow = (ctx, fromX, fromY, toX, toY, color, label) => {
  const headlen = 7
  const dx = toX - fromX
  const dy = toY - fromY
  const angle = Math.atan2(dy, dx)
  if (Math.hypot(dx, dy) < 3) return

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()

  if (label) {
    ctx.font = '10px sans-serif'
    ctx.fillText(label, toX + 4, toY + 4)
  }
}

onMounted(() => {
  drawScene()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 20px;
  margin: 24px 0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f8fafc;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.sim-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #38bdf8;
}

.sim-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.canvas-wrapper {
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  display: flex;
  justify-content: center;
}

canvas {
  max-width: 100%;
  height: auto;
  display: block;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.control-item {
  background: #1e293b;
  padding: 12px 16px;
  border-radius: 8px;
}

.control-item label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.control-item strong {
  color: #38bdf8;
}

.control-item input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
}

.preset-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.preset-buttons button {
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-buttons button:hover {
  background: #334155;
}

.preset-buttons button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
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
  color: #f1f5f9;
}

.btn-secondary:hover {
  background: #475569;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  margin-left: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.stat-card {
  background: #1e293b;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #334155;
}

.stat-card.highlight {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 4px 0;
}

.stat-value .unit {
  font-size: 0.8rem;
  font-weight: 400;
  color: #94a3b8;
}

.stat-formula {
  font-size: 0.75rem;
  color: #64748b;
}
</style>
