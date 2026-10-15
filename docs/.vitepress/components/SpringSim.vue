<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🔩 ばねの単振動 インタラクティブ実験室</span>
      <span class="sim-badge">復元力・単振動・エネルギー</span>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="btn btn-secondary" @click="stepForward(0.05)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="340"></canvas>
    </div>
    <div class="controls-grid">
      <div class="control-item">
        <label>ばね定数 k: <strong>{{ k }} N/m</strong></label>
        <input type="range" v-model.number="k" min="5" max="100" step="5" />
      </div>
      <div class="control-item">
        <label>質量 m: <strong>{{ m }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.1" max="5" step="0.1" />
      </div>
      <div class="control-item">
        <label>振幅 A: <strong>{{ A }} m</strong></label>
        <input type="range" v-model.number="A" min="0.5" max="3" step="0.1" />
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">角振動数 ω</div>
        <div class="stat-value">{{ omega.toFixed(2) }} <span class="unit">rad/s</span></div>
        <div class="stat-formula">ω = √(k/m)</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">周期 T</div>
        <div class="stat-value">{{ period.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula">T = 2π/ω = 2π√(m/k)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在の変位 x</div>
        <div class="stat-value">{{ disp.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula">x = A cos(ωt)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">復元力 F</div>
        <div class="stat-value">{{ force.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">F = -kx</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">運動エネルギー K</div>
        <div class="stat-value">{{ ke.toFixed(2) }} <span class="unit">J</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">弾性エネルギー U</div>
        <div class="stat-value">{{ pe.toFixed(2) }} <span class="unit">J</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"

const canvasRef = ref(null)
const isPlaying = ref(true)
const timeScale = ref(0.4) // デフォルトで落ち着いた低速再生（0.4x）
const k = ref(20)
const m = ref(1)
const A = ref(1.5)

const omega = computed(() => Math.sqrt(k.value / m.value))
const period = computed(() => (2 * Math.PI) / omega.value)
const disp = ref(0)
const force = computed(() => -k.value * disp.value)
const vel = ref(0)
const totalE = computed(() => 0.5 * k.value * A.value * A.value)
const ke = computed(() => Math.max(0, totalE.value - 0.5 * k.value * disp.value * disp.value))
const pe = computed(() => 0.5 * k.value * disp.value * disp.value)

let animId = null
let simTime = 0
let lastTime = 0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  const w = canvas.width, h = canvas.height
  const t = simTime

  const x = A.value * Math.cos(omega.value * t)
  disp.value = x
  vel.value = -A.value * omega.value * Math.sin(omega.value * t)

  // Background
  ctx.fillStyle = "#09090b"
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = "rgba(63,63,70,0.5)"
  ctx.lineWidth = 1
  for (let gx = 0; gx <= w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke() }
  for (let gy = 0; gy <= h; gy += 40) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke() }

  const wallX = 60
  const eqX = w / 2
  const massW = 48, massH = 36
  const massX = eqX + x * 70
  const massY = h / 2

  // 壁
  ctx.fillStyle = "#3f3f46"
  ctx.fillRect(wallX - 10, massY - 60, 10, 120)
  for (let yi = -3; yi <= 3; yi++) {
    ctx.strokeStyle = "#52525b"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(wallX - 10, massY + yi * 18)
    ctx.lineTo(wallX - 24, massY + yi * 18 + 12)
    ctx.stroke()
  }

  // ばね（コイル描画）
  const springLeft = wallX
  const springRight = massX - massW / 2
  const springMid = massY
  const coils = 10
  const coilStep = (springRight - springLeft) / coils
  ctx.strokeStyle = "#6366f1"
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(springLeft, springMid)
  for (let i = 0; i <= coils; i++) {
    const cx = springLeft + i * coilStep
    const sign = i % 2 === 0 ? -1 : 1
    const coilH = 14
    ctx.lineTo(cx, springMid + sign * coilH)
  }
  ctx.lineTo(springRight, springMid)
  ctx.stroke()

  // 質量ブロック
  const grad = ctx.createLinearGradient(massX - massW/2, 0, massX + massW/2, 0)
  grad.addColorStop(0, "#4f46e5")
  grad.addColorStop(1, "#7c3aed")
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(massX - massW/2, massY - massH/2, massW, massH, 6)
  ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.2)"
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = "#fff"
  ctx.font = "bold 13px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("m", massX, massY)
  ctx.textBaseline = "alphabetic"

  // 平衡点マーカー
  ctx.strokeStyle = "#52525b"
  ctx.lineWidth = 1
  ctx.setLineDash([4,4])
  ctx.beginPath(); ctx.moveTo(eqX, massY - 60); ctx.lineTo(eqX, massY + 60); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = "#52525b"
  ctx.font = "11px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("x = 0", eqX, massY + 68)

  // 変位矢印
  if (Math.abs(x) > 0.05) {
    const arrowColor = x > 0 ? "#f59e0b" : "#10b981"
    ctx.strokeStyle = arrowColor; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(eqX, massY + 40); ctx.lineTo(massX, massY + 40); ctx.stroke()
    ctx.fillStyle = arrowColor
    const dir = x > 0 ? 1 : -1
    ctx.beginPath(); ctx.moveTo(massX, massY + 40); ctx.lineTo(massX - dir*8, massY + 34); ctx.lineTo(massX - dir*8, massY + 46); ctx.fill()
    ctx.fillStyle = arrowColor; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"
    ctx.fillText(`x = ${x.toFixed(2)} m`, (eqX + massX) / 2, massY + 56)
  }

  // 復元力矢印
  const forceVal = -k.value * x
  if (Math.abs(forceVal) > 1) {
    const arrowColor = "#ef4444"
    const fLen = Math.min(70, Math.abs(forceVal) * 2)
    const fDir = forceVal > 0 ? 1 : -1
    ctx.strokeStyle = arrowColor; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(massX, massY - 10); ctx.lineTo(massX + fDir * fLen, massY - 10); ctx.stroke()
    ctx.fillStyle = arrowColor
    ctx.beginPath(); ctx.moveTo(massX + fDir * fLen, massY - 10); ctx.lineTo(massX + fDir*fLen - fDir*8, massY - 16); ctx.lineTo(massX + fDir*fLen - fDir*8, massY - 4); ctx.fill()
    ctx.fillStyle = arrowColor; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"
    ctx.fillText(`F = ${forceVal.toFixed(1)} N`, massX + fDir * fLen * 0.5, massY - 22)
  }

  // エネルギーバー
  const barTop = h - 55
  const barH = 16
  const totalEv = totalE.value
  const barMaxW = w * 0.55
  const barLeft = w * 0.22
  ctx.fillStyle = "#1f2937"
  ctx.fillRect(barLeft, barTop, barMaxW, barH)
  ctx.fillRect(barLeft, barTop + 22, barMaxW, barH)
  const keRatio = ke.value / totalEv
  const peRatio = pe.value / totalEv
  const keGrad = ctx.createLinearGradient(barLeft, 0, barLeft + barMaxW, 0)
  keGrad.addColorStop(0, "#38bdf8"); keGrad.addColorStop(1, "#6366f1")
  ctx.fillStyle = keGrad
  ctx.fillRect(barLeft, barTop, barMaxW * keRatio, barH)
  const peGrad = ctx.createLinearGradient(barLeft, 0, barLeft + barMaxW, 0)
  peGrad.addColorStop(0, "#f59e0b"); peGrad.addColorStop(1, "#ef4444")
  ctx.fillStyle = peGrad
  ctx.fillRect(barLeft, barTop + 22, barMaxW * peRatio, barH)
  ctx.fillStyle = "#38bdf8"; ctx.font = "11px sans-serif"; ctx.textAlign = "right"
  ctx.fillText(`K = ${ke.value.toFixed(2)} J`, barLeft - 4, barTop + 12)
  ctx.fillStyle = "#f59e0b"
  ctx.fillText(`U = ${pe.value.toFixed(2)} J`, barLeft - 4, barTop + 34)
}

function animate(timestamp) {
  if (!isPlaying.value) {
    lastTime = 0
    return
  }
  if (lastTime === 0) lastTime = timestamp
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
  lastTime = timestamp

  simTime += dt * timeScale.value
  draw()
  animId = requestAnimationFrame(animate)
}

function stepForward(delta = 0.05) {
  simTime += delta
  draw()
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    lastTime = 0
    animId = requestAnimationFrame(animate)
  }
}

function reset() {
  simTime = 0
  lastTime = 0
  draw()
}

watch([k, m, A], () => {
  if (!isPlaying.value) draw()
})

onMounted(() => {
  draw()
  lastTime = 0
  animId = requestAnimationFrame(animate)
})
onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })
</script>

<style scoped>
.sim-container { background:linear-gradient(145deg,#18181b,#09090b); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:1.5rem; margin:1.5rem 0; color:#f4f4f5 }
.sim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem }
.sim-title { font-size:1.1rem; font-weight:700; background:linear-gradient(90deg,#6366f1,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
.sim-badge { background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:9999px; font-weight:600 }
.canvas-wrapper { background:#09090b; border-radius:12px; overflow:hidden; border:1px solid #27272a; display:flex; justify-content:center; margin-bottom:1rem }
canvas { width:100%; max-width:700px; height:auto }
.controls-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1.25rem }
.control-item { background:rgba(255,255,255,0.03); padding:0.75rem 1rem; border-radius:10px; border:1px solid rgba(255,255,255,0.06) }
.control-item label { display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#d4d4d8 }
.control-item input[type=range] { width:100%; accent-color:#6366f1; cursor:pointer }
.action-buttons { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem }
.btn { padding:0.5rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; font-size:0.9rem }
.btn-primary { background:linear-gradient(135deg,#6366f1,#a855f7); color:white }
.btn-primary:hover { opacity:0.9; transform:translateY(-1px) }
.btn-secondary { background:rgba(255,255,255,0.08); color:#f4f4f5; border:1px solid rgba(255,255,255,0.15) }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:0.75rem; margin-bottom:1rem }
.stat-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem; text-align:center }
.stat-card.highlight { border-color:rgba(99,102,241,0.4); background:rgba(99,102,241,0.07) }
.stat-label { font-size:0.8rem; color:#a1a1aa; margin-bottom:0.3rem }
.stat-value { font-size:1.3rem; font-weight:700; color:#f4f4f5 }
.stat-value .unit { font-size:0.85rem; color:#a1a1aa; font-weight:400 }
.stat-formula { font-size:0.75rem; color:#71717a; margin-top:0.3rem }
</style>
