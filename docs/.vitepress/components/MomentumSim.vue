<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">💥 運動量保存と衝突 実験室</span>
      <span class="sim-badge">運動量・反発係数・衝突</span>
    </div>
    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="resetAnim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 最初から再衝突
      </button>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="280"></canvas>
    </div>
    <div class="controls-grid">
      <div class="control-item">
        <label>物体1 質量 m₁: <strong>{{ m1 }} kg</strong></label>
        <input type="range" v-model.number="m1" min="0.5" max="5" step="0.5" />
      </div>
      <div class="control-item">
        <label>物体2 質量 m₂: <strong>{{ m2 }} kg</strong></label>
        <input type="range" v-model.number="m2" min="0.5" max="5" step="0.5" />
      </div>
      <div class="control-item">
        <label>物体1 初速度 u₁: <strong>{{ u1 }} m/s</strong></label>
        <input type="range" v-model.number="u1" min="1" max="10" step="0.5" />
      </div>
      <div class="control-item">
        <label>反発係数 e: <strong>{{ e.toFixed(1) }}</strong></label>
        <input type="range" v-model.number="e" min="0" max="1" step="0.1" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:4px">
          {{ e === 0 ? '完全非弾性衝突（くっつく）' : e === 1 ? '完全弾性衝突（エネルギー保存）' : `非弾性衝突 (e=${e})` }}
        </div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">衝突前の全運動量</div>
        <div class="stat-value">{{ pBefore.toFixed(2) }} <span class="unit">kg·m/s</span></div>
        <div class="stat-formula">p = m₁u₁ + m₂u₂</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">衝突後の全運動量</div>
        <div class="stat-value">{{ pAfter.toFixed(2) }} <span class="unit">kg·m/s</span></div>
        <div class="stat-formula">= m₁v₁ + m₂v₂（保存！）</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">衝突後 v₁</div>
        <div class="stat-value">{{ v1.toFixed(2) }} <span class="unit">m/s</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">衝突後 v₂</div>
        <div class="stat-value">{{ v2.toFixed(2) }} <span class="unit">m/s</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">衝突前の運動エネルギー</div>
        <div class="stat-value">{{ keBefore.toFixed(2) }} <span class="unit">J</span></div>
      </div>
      <div class="stat-card" :class="{ highlight: e === 1 }">
        <div class="stat-label">衝突後の運動エネルギー</div>
        <div class="stat-value">{{ keAfter.toFixed(2) }} <span class="unit">J</span></div>
        <div class="stat-formula" style="color:#f59e0b">{{ keLoss.toFixed(2) }} J 失われた</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"

const canvasRef = ref(null)
const m1 = ref(2), m2 = ref(1), u1 = ref(5), u2 = 0
const e = ref(0.7)
const isRunning = ref(true)
const timeScale = ref(0.4) // 衝突の前後が目で追える落ち着いた0.4x推奨

const v1 = computed(() => ((m1.value - e.value * m2.value) * u1.value + (1 + e.value) * m2.value * u2) / (m1.value + m2.value))
const v2 = computed(() => ((m2.value - e.value * m1.value) * u2 + (1 + e.value) * m1.value * u1.value) / (m1.value + m2.value))
const pBefore = computed(() => m1.value * u1.value + m2.value * u2)
const pAfter = computed(() => m1.value * v1.value + m2.value * v2.value)
const keBefore = computed(() => 0.5 * m1.value * u1.value * u1.value + 0.5 * m2.value * u2 * u2)
const keAfter = computed(() => 0.5 * m1.value * v1.value * v1.value + 0.5 * m2.value * v2.value * v2.value)
const keLoss = computed(() => keBefore.value - keAfter.value)

let animId = null
let phase = ref("before") // before | collide | after
let animT = ref(0)
let lastTime = null

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepForward() {
  animT.value += 3
  if (!isRunning.value) {
    draw(performance.now())
  }
}

function getBlockR(mass) { return 16 + mass * 5 }

function draw(rawT) {
  if (!lastTime) lastTime = rawT
  const dt = (rawT - lastTime) / 1000
  lastTime = rawT

  if (isRunning.value) {
    if (phase.value === "before") animT.value += dt * 60 * timeScale.value
    else if (phase.value === "after") animT.value += dt * 60 * timeScale.value
    else if (phase.value === "collide") animT.value += dt * 60 * timeScale.value
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  const w = canvas.width, h = canvas.height

  ctx.fillStyle = "#09090b"
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = "rgba(63,63,70,0.4)"
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke() }
  for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }

  const groundY = h * 0.74
  ctx.strokeStyle = "#3f3f46"
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke()

  const r1 = getBlockR(m1.value), r2 = getBlockR(m2.value)
  const collisionX = w * 0.5
  const speed1 = 90 * (u1.value / 10)
  const speed2after = 90 * (Math.abs(v2.value) / 10)

  let x1, x2

  if (phase.value === "before") {
    x1 = Math.min(collisionX - r1 - r2, w * 0.08 + animT.value * speed1 / 60)
    x2 = collisionX + r2 * 1.5
    if (x1 >= collisionX - r1 - r2) { phase.value = "collide"; animT.value = 0 }
  } else if (phase.value === "collide") {
    x1 = collisionX - r1 - r2
    x2 = collisionX + r2 * 1.5
    if (animT.value > 18) { phase.value = "after"; animT.value = 0 }
  } else {
    const afterT = animT.value / 60
    x1 = (collisionX - r1 - r2) + v1.value * afterT * speed1
    x2 = (collisionX + r2 * 1.5) + v2.value * afterT * speed2after
    x1 = Math.max(r1, Math.min(w - r1, x1))
    x2 = Math.max(r2, Math.min(w - r2, x2))
  }

  const blockY = groundY - r1

  // 物体1
  const g1 = ctx.createRadialGradient(x1, blockY, 2, x1, blockY, r1)
  g1.addColorStop(0, "#60a5fa"); g1.addColorStop(1, "#3b82f6")
  ctx.fillStyle = g1
  ctx.beginPath(); ctx.arc(x1, blockY, r1, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.max(10, r1*0.5)}px sans-serif`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.fillText("m₁", x1, blockY); ctx.textBaseline = "alphabetic"

  // 速度矢印1
  const vel1 = phase.value === "after" ? v1.value : u1.value
  if (Math.abs(vel1) > 0.1) {
    const arrowLen = vel1 * 18
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(x1, blockY - r1 - 6); ctx.lineTo(x1 + arrowLen, blockY - r1 - 6); ctx.stroke()
    ctx.fillStyle = "#3b82f6"
    const dir = vel1 > 0 ? 1 : -1
    ctx.beginPath(); ctx.moveTo(x1 + arrowLen, blockY - r1 - 6); ctx.lineTo(x1 + arrowLen - dir*7, blockY - r1 - 11); ctx.lineTo(x1 + arrowLen - dir*7, blockY - r1 - 1); ctx.fill()
    ctx.font = "10px sans-serif"; ctx.textAlign = "center"
    ctx.fillStyle = "#93c5fd"
    ctx.fillText(`${vel1.toFixed(1)} m/s`, x1 + arrowLen / 2, blockY - r1 - 18)
  }

  // 物体2
  const r2draw = getBlockR(m2.value)
  const g2 = ctx.createRadialGradient(x2, groundY - r2draw, 2, x2, groundY - r2draw, r2draw)
  g2.addColorStop(0, "#f87171"); g2.addColorStop(1, "#ef4444")
  ctx.fillStyle = g2
  ctx.beginPath(); ctx.arc(x2, groundY - r2draw, r2draw, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.max(10, r2draw*0.5)}px sans-serif`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.fillText("m₂", x2, groundY - r2draw); ctx.textBaseline = "alphabetic"

  // 速度矢印2
  const vel2 = phase.value === "after" ? v2.value : 0
  if (Math.abs(vel2) > 0.1) {
    const arrowLen = vel2 * 18
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(x2, groundY - r2draw - 6); ctx.lineTo(x2 + arrowLen, groundY - r2draw - 6); ctx.stroke()
    ctx.fillStyle = "#ef4444"
    const dir = vel2 > 0 ? 1 : -1
    ctx.beginPath(); ctx.moveTo(x2 + arrowLen, groundY - r2draw - 6); ctx.lineTo(x2 + arrowLen - dir*7, groundY - r2draw - 11); ctx.lineTo(x2 + arrowLen - dir*7, groundY - r2draw - 1); ctx.fill()
    ctx.fillStyle = "#fca5a5"; ctx.font = "10px sans-serif"; ctx.textAlign = "center"
    ctx.fillText(`${vel2.toFixed(1)} m/s`, x2 + arrowLen / 2, groundY - r2draw - 18)
  }

  // 衝突フラッシュ
  if (phase.value === "collide") {
    const alpha = Math.max(0, 1 - animT.value / 18)
    ctx.fillStyle = `rgba(251,191,36,${alpha * 0.5})`
    ctx.beginPath(); ctx.arc(collisionX, blockY, 40, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(251,191,36,${alpha})`
    ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"
    ctx.fillText("衝突！", collisionX, blockY - 50)
  }

  // フェーズ表示
  ctx.fillStyle = "#a1a1aa"; ctx.font = "12px sans-serif"; ctx.textAlign = "left"
  ctx.fillText(phase.value === "before" ? "▶ 衝突前：運動量 = " + pBefore.value.toFixed(2) + " kg·m/s" : 
               phase.value === "after" ? "✅ 衝突後：運動量 = " + pAfter.value.toFixed(2) + " kg·m/s（保存）" :
               "💥 衝突中…", 12, 20)

  animId = requestAnimationFrame(draw)
}

function resetAnim() {
  phase.value = "before"
  animT.value = 0
  lastTime = null
  if (animId) cancelAnimationFrame(animId)
  animId = requestAnimationFrame(draw)
}

onMounted(() => { animId = requestAnimationFrame(draw) })
onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })
</script>

<style scoped>
.sim-container { background:linear-gradient(145deg,#18181b,#09090b); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:1.5rem; margin:1.5rem 0; color:#f4f4f5 }
.sim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem }
.sim-title { font-size:1.1rem; font-weight:700; background:linear-gradient(90deg,#f59e0b,#ef4444); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
.sim-badge { background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:9999px; font-weight:600 }
.canvas-wrapper { background:#09090b; border-radius:12px; overflow:hidden; border:1px solid #27272a; display:flex; justify-content:center; margin-bottom:1rem }
canvas { width:100%; max-width:700px; height:auto }
.controls-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1.25rem }
.control-item { background:rgba(255,255,255,0.03); padding:0.75rem 1rem; border-radius:10px; border:1px solid rgba(255,255,255,0.06) }
.control-item label { display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#d4d4d8 }
.control-item input[type=range] { width:100%; accent-color:#f59e0b; cursor:pointer }
.action-buttons { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem }
.btn { padding:0.5rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; font-size:0.9rem }
.btn-primary { background:linear-gradient(135deg,#f59e0b,#ef4444); color:white }
.btn-primary:hover { opacity:0.9; transform:translateY(-1px) }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:0.75rem; margin-bottom:1rem }
.stat-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem; text-align:center }
.stat-card.highlight { border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.07) }
.stat-label { font-size:0.8rem; color:#a1a1aa; margin-bottom:0.3rem }
.stat-value { font-size:1.2rem; font-weight:700; color:#f4f4f5 }
.stat-value .unit { font-size:0.8rem; color:#a1a1aa; font-weight:400 }
.stat-formula { font-size:0.75rem; color:#71717a; margin-top:0.3rem }
</style>
