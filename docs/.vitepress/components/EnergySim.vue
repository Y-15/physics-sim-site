<template>
  <div class="lab" style="--ac:#10b981;--ac2:#38bdf8">
    <div class="lab-head">
      <span class="lab-title">⚡ 仕事・仕事率と力学的エネルギー保存則 実験室</span>
      <span class="lab-badge">保存力・非保存力・摩擦熱</span>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ playing && !stopped ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="lab-btn" @click="stepSim(0.04)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.04s)
      </button>
      <button class="lab-btn" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 最初から滑らせる
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>スタートの高さ h: <strong>{{ h0.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="h0" min="1.0" max="4.0" step="0.2" />
      </div>
      <div class="lab-ctrl">
        <label>物体の質量 m: <strong>{{ m.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.5" max="4.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>あらい床の動摩擦係数 μₖ: <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.0" max="0.5" step="0.05" />
        <div class="lab-note">0.00 = なめらか（エネルギー完全保存）、0.05以上 = 摩擦熱で減速</div>
      </div>
      <div class="lab-ctrl">
        <label>プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: muK === 0 }" @click="muK = 0; reset()">摩擦なし (保存則)</button>
          <button class="lab-chip" :class="{ on: muK === 0.2 }" @click="muK = 0.2; reset()">適度な摩擦 (μ=0.2)</button>
          <button class="lab-chip" :class="{ on: muK === 0.45 }" @click="muK = 0.45; reset()">強い摩擦 (μ=0.45)</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">全エネルギー E</div>
        <div class="v">{{ totalE0.toFixed(1) }} <small>J</small></div>
        <div class="f">E = K + U + 摩擦熱 Q（常に一定！）</div>
      </div>
      <div class="lab-stat">
        <div class="k">運動エネルギー K</div>
        <div class="v" style="color:#38bdf8">{{ curK.toFixed(1) }} <small>J</small></div>
        <div class="f">K = ½mv² (速さ {{ curV.toFixed(2) }} m/s)</div>
      </div>
      <div class="lab-stat">
        <div class="k">重力位置エネルギー U</div>
        <div class="v" style="color:#10b981">{{ curU.toFixed(1) }} <small>J</small></div>
        <div class="f">U = mgh (高さ {{ curH.toFixed(2) }} m)</div>
      </div>
      <div class="lab-stat">
        <div class="k">摩擦によって発生した熱 Q</div>
        <div class="v" style="color:#f59e0b">{{ curQ.toFixed(1) }} <small>J</small></div>
        <div class="f">W_非保存力 = -μₖmg·s</div>
      </div>
      <div class="lab-stat">
        <div class="k">最下点での理論速さ</div>
        <div class="v">{{ Math.sqrt(2 * g * h0).toFixed(2) }} <small>m/s</small></div>
        <div class="f">v = √(2gh) (質量によらない！)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const W = 720, H = 340
const canvasRef = ref(null)
let ctx = null

const h0 = ref(3.0) // m
const m = ref(1.5)  // kg
const muK = ref(0.15)
const g = 9.8

const playing = ref(true)
const timeScale = ref(0.5) // デフォルトで力学的エネルギー変化をじっくり追える0.5xスロー再生

// 初期全エネルギー
const totalE0 = computed(() => m.value * g * h0.value)

// 状態変数 (物体位置: s は軌道に沿った道のり [m])
let s = 0
let v = 0
let curX = 0, curY = 0
let heatQ = 0
let stopped = false

const curH = ref(3.0)
const curV = ref(0)
const curK = ref(0)
const curU = ref(0)
const curQ = ref(0)

// 軌道幾何（斜面〜なめらかな接続〜水平面）
// 画面スケール: 1m = 52px（最大高さ h0 = 4.0m でも上端に余裕を持たせる）
const scale = 52
const groundY = 278 // 地面のy座標
const slopeAngle = 35 * Math.PI / 180
const slopeStartX = 95
let stopTimer = 0

function togglePlay() {
  if (stopped) {
    reset()
    playing.value = true
  } else {
    playing.value = !playing.value
  }
}

function getPos(dist) {
  // 斜面区間の長さ
  const slopeLen = h0.value / Math.sin(slopeAngle)
  const slopeStartY = groundY - h0.value * scale
  const slopeEndX = slopeStartX + h0.value / Math.tan(slopeAngle) * scale

  if (dist <= slopeLen) {
    const frac = dist / slopeLen
    const x = slopeStartX + (slopeEndX - slopeStartX) * frac
    const y = slopeStartY + h0.value * scale * frac
    const h = h0.value * (1 - frac)
    return { x, y, h, onSlope: true, theta: slopeAngle }
  } else {
    const flatDist = dist - slopeLen
    const x = slopeEndX + flatDist * scale
    const y = groundY
    return { x, y, h: 0, onSlope: false, theta: 0 }
  }
}

function reset() {
  s = 0
  v = 0
  heatQ = 0
  stopped = false
  stopTimer = 0
  updateStats()
}

function updateStats() {
  const pos = getPos(s)
  curX = pos.x
  curY = pos.y
  curH.value = pos.h
  curV.value = v
  curU.value = m.value * g * pos.h
  curK.value = 0.5 * m.value * v * v
  curQ.value = heatQ
}

function step(dt) {
  if (stopped) {
    stopTimer += dt
    if (stopTimer > 1.2) {
      reset()
    }
    return
  }

  const slopeLen = h0.value / Math.sin(slopeAngle)

  if (s < slopeLen) {
    // 斜面区間（なめらかとする）
    const a = g * Math.sin(slopeAngle)
    v += a * dt
    s += v * dt
  } else {
    // 水平面区間（摩擦あり）
    s += v * dt
    if (muK.value > 0) {
      const a = -muK.value * g
      const prevV = v
      v += a * dt
      if (v <= 0) {
        v = 0
        stopped = true
        // 残りの運動エネルギーをすべて熱に加算
        heatQ = totalE0.value
      } else {
        heatQ += 0.5 * m.value * (prevV * prevV - v * v)
      }
    }
  }

  // 画面端到達
  if (curX > W - 30) {
    stopped = true
  }

  updateStats()
}

function draw() {
  clearGrid(ctx, W, H)

  const slopeStartY = groundY - h0.value * scale
  const slopeEndX = slopeStartX + h0.value / Math.tan(slopeAngle) * scale

  // 地面・斜面の描画
  ctx.fillStyle = '#18181b'
  ctx.beginPath()
  ctx.moveTo(slopeStartX, slopeStartY)
  ctx.lineTo(slopeEndX, groundY)
  ctx.lineTo(W, groundY)
  ctx.lineTo(W, H)
  ctx.lineTo(slopeStartX, H)
  ctx.closePath()
  ctx.fill()

  // 斜面レール（なめらか：シアン）
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(slopeStartX - 20, slopeStartY)
  ctx.lineTo(slopeEndX, groundY)
  ctx.stroke()

  // 水平面（摩擦あり：オレンジ）
  ctx.strokeStyle = muK.value > 0 ? '#f59e0b' : '#38bdf8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(slopeEndX, groundY)
  ctx.lineTo(W - 10, groundY)
  ctx.stroke()

  // 摩擦エリアのハッチング表示
  if (muK.value > 0) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)'
    ctx.lineWidth = 1.5
    for (let x = slopeEndX; x < W - 20; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x - 8, groundY + 12); ctx.stroke()
    }
    text(ctx, `あらい水平面（動摩擦係数 μₖ = ${muK.value.toFixed(2)}）`, slopeEndX + 20, groundY + 28, '#fbbf24', '11px sans-serif')
  } else {
    text(ctx, 'なめらかな水平面（摩擦なし）', slopeEndX + 20, groundY + 28, '#38bdf8', '11px sans-serif')
  }

  // 高さマーカー
  line(ctx, slopeStartX - 20, slopeStartY, slopeStartX - 20, groundY, '#71717a', 1, [3, 3])
  arrow(ctx, slopeStartX - 20, groundY, slopeStartX - 20, slopeStartY, '#10b981', 1.5)
  arrow(ctx, slopeStartX - 20, slopeStartY, slopeStartX - 20, groundY, '#10b981', 1.5)
  text(ctx, `h = ${h0.value.toFixed(1)} m`, slopeStartX - 28, (slopeStartY + groundY) / 2, '#10b981', 'bold 11px sans-serif', 'right')

  // 移動する物体（ブロック）
  const pos = getPos(s)
  const bW = 28, bH = 20
  ctx.save()
  ctx.translate(pos.x, pos.y)
  if (pos.onSlope) ctx.rotate(pos.theta)
  ctx.fillStyle = '#10b981'
  ctx.beginPath()
  ctx.roundRect(-bW / 2, -bH, bW, bH, 4)
  ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  text(ctx, `${m.value}kg`, 0, -6, '#fff', 'bold 10px sans-serif', 'center', 'middle')
  ctx.restore()

  // 速度ベクトル
  if (v > 0.1) {
    const vLen = Math.min(60, v * 7)
    const dirX = pos.onSlope ? Math.cos(pos.theta) : 1
    const dirY = pos.onSlope ? Math.sin(pos.theta) : 0
    arrow(ctx, pos.x, pos.y - 10, pos.x + dirX * vLen, pos.y - 10 + dirY * vLen, '#38bdf8', 2.5, `v=${v.toFixed(1)}m/s`, { font: 'bold 11px sans-serif' })
  }

  // エネルギーバー（画面右上に棒グラフを描画）
  const barW = 180, barH = 14
  const barX = W - barW - 20, barY = 24
  text(ctx, '【力学的エネルギー保存と熱】', barX, barY - 8, '#e4e4e7', 'bold 11px sans-serif')

  const total = totalE0.value
  const uFrac = Math.max(0, curU.value / total)
  const kFrac = Math.max(0, curK.value / total)
  const qFrac = Math.max(0, curQ.value / total)

  // 背景枠
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(barX, barY, barW, barH)

  // 3色のエネルギー分割
  let curBarX = barX
  // 1. 位置エネルギー U (緑)
  ctx.fillStyle = '#10b981'
  ctx.fillRect(curBarX, barY, barW * uFrac, barH)
  curBarX += barW * uFrac
  // 2. 運動エネルギー K (青)
  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(curBarX, barY, barW * kFrac, barH)
  curBarX += barW * kFrac
  // 3. 摩擦熱 Q (オレンジ)
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(curBarX, barY, barW * qFrac, barH)

  ctx.strokeStyle = '#52525b'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH)

  // 凡例
  const legY = barY + 22
  dot(ctx, barX + 6, legY, 4, '#10b981')
  text(ctx, '位置 U', barX + 14, legY + 3, '#a1a1aa', '10px sans-serif')
  dot(ctx, barX + 65, legY, 4, '#38bdf8')
  text(ctx, '運動 K', barX + 73, legY + 3, '#a1a1aa', '10px sans-serif')
  dot(ctx, barX + 124, legY, 4, '#f59e0b')
  text(ctx, '摩擦熱 Q', barX + 132, legY + 3, '#a1a1aa', '10px sans-serif')
}

watch([h0, m, muK], reset)

onMounted(() => {
  ctx = setupCanvas(canvasRef.value, W, H)
  reset()
})

function stepSim(delta = 0.04) {
  step(delta)
  draw()
}

useLoop((dt) => {
  if (!ctx) return
  if (playing.value) step(dt * timeScale.value)
  draw()
})
</script>
