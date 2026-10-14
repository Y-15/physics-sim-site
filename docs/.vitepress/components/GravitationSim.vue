<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#c084fc">
    <div class="lab-head">
      <span class="lab-title">🪐 人工衛星の軌道シミュレーター（地球のまわり）</span>
      <span class="lab-badge">第1・第2宇宙速度／面積速度一定</span>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-msg" v-if="status">{{ status }}</div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>打ち出す速さ（円軌道の速さ v₁ の何倍か）: <strong>{{ ratio.toFixed(2) }} 倍</strong></label>
        <input type="range" v-model.number="ratio" min="0.6" max="1.55" step="0.01" />
        <div class="lab-note">1.00 = 円軌道、1.41（√2）以上 = 地球の引力圏から脱出</div>
      </div>
      <div class="lab-ctrl">
        <label>打ち出す位置（地球中心からの距離）r₀: <strong>{{ r0.toFixed(1) }} ×10³ km</strong></label>
        <input type="range" v-model.number="r0" min="7" max="20" step="0.5" />
        <div class="lab-note">地表からの高さ h = {{ ((r0 - RE) * 1000).toFixed(0) }} km（地球半径 6370 km）</div>
      </div>
      <div class="lab-ctrl">
        <label>プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 1) < 0.005 }" @click="preset(1)">円軌道</button>
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 1.2) < 0.005 }" @click="preset(1.2)">楕円軌道</button>
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 0.8) < 0.005 }" @click="preset(0.8)">遅すぎる</button>
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 1.45) < 0.005 }" @click="preset(1.45)">脱出</button>
        </div>
        <label style="margin-top:0.5rem"><input type="checkbox" v-model="showSectors" /> 一定時間ごとに掃く面積を表示</label>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">現在の速さ v</div>
        <div class="v">{{ (curV * 1000).toFixed(2) }} <small>km/s</small></div>
        <div class="f">この位置での円軌道の速さ {{ (vc0 * 1000).toFixed(2) }} km/s</div>
      </div>
      <div class="lab-stat">
        <div class="k">地球中心からの距離 r</div>
        <div class="v">{{ curR.toFixed(1) }} <small>×10³ km</small></div>
      </div>
      <div class="lab-stat">
        <div class="k">面積速度 ½ r v sinθ</div>
        <div class="v">{{ (areal / 1e3).toFixed(2) }} <small>×10⁹ m²/s</small></div>
        <div class="f">軌道上のどこでも一定（第2法則）</div>
      </div>
      <div class="lab-stat">
        <div class="k">力学的エネルギー（1 kg あたり）</div>
        <div class="v" :style="{ color: energy < 0 ? '#38bdf8' : '#f59e0b', fontSize: '1rem' }">
          {{ (energy * 1e6).toFixed(1) }} <small>×10⁶ J/kg</small>
        </div>
        <div class="f">{{ energy < 0 ? '負 → 地球に束縛される' : '0 以上 → 無限遠へ脱出' }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">公転周期 T</div>
        <div class="v">{{ periodText }}</div>
        <div class="f">T² ∝ a³（第3法則）</div>
      </div>
    </div>

    <div class="lab-btns">
      <button class="lab-btn primary" @click="playing = !playing">{{ playing ? '⏸ 一時停止' : '▶ 再生' }}</button>
      <button class="lab-btn" @click="reset">⏮ 打ち上げ直す</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const W = 720, H = 420
const canvasRef = ref(null)
let ctx = null

// 単位：距離 Mm（=10³ km）、時間 s、速さ Mm/s
const GM = 3.986e-4 // 地球の GM [Mm³/s²]
const RE = 6.37 // 地球半径 [Mm]

const ratio = ref(1.0)
const r0 = ref(10)
const playing = ref(true)
const showSectors = ref(true)
const status = ref('')

const vc0 = computed(() => Math.sqrt(GM / r0.value)) // 打ち出し位置での円軌道の速さ
const T0 = computed(() => 2 * Math.PI * Math.sqrt(r0.value ** 3 / GM))

let x = 0, y = 0, vx = 0, vy = 0, simT = 0, stopped = false
let trail = []
let orbitT = Infinity
const curV = ref(0), curR = ref(0), areal = ref(0), energy = ref(0)

const periodText = computed(() => {
  if (energy.value >= 0) return '— (周回しない)'
  const a = -GM / (2 * energy.value)
  const T = 2 * Math.PI * Math.sqrt(a ** 3 / GM)
  return `${(T / 3600).toFixed(2)} 時間`
})

function preset(v) { ratio.value = v }

function reset() {
  x = -r0.value; y = 0
  vx = 0; vy = -vc0.value * ratio.value // 反時計回り
  simT = 0; stopped = false; trail = [{ x, y, t: 0 }]
  status.value = ''
  measure()
  orbitT = energy.value < 0 ? 2 * Math.PI * Math.sqrt((-GM / (2 * energy.value)) ** 3 / GM) : Infinity
}

function acc(px, py) {
  const r2 = px * px + py * py
  const r = Math.sqrt(r2)
  const a = -GM / r2
  return [a * px / r, a * py / r]
}

function rk4(h) {
  const [a1x, a1y] = acc(x, y)
  const [a2x, a2y] = acc(x + 0.5 * h * vx, y + 0.5 * h * vy)
  const v2x = vx + 0.5 * h * a1x, v2y = vy + 0.5 * h * a1y
  const [a3x, a3y] = acc(x + 0.5 * h * v2x, y + 0.5 * h * v2y)
  const v3x = vx + 0.5 * h * a2x, v3y = vy + 0.5 * h * a2y
  const [a4x, a4y] = acc(x + h * v3x, y + h * v3y)
  const v4x = vx + h * a3x, v4y = vy + h * a3y
  x += (h / 6) * (vx + 2 * v2x + 2 * v3x + v4x)
  y += (h / 6) * (vy + 2 * v2y + 2 * v3y + v4y)
  vx += (h / 6) * (a1x + 2 * a2x + 2 * a3x + a4x)
  vy += (h / 6) * (a1y + 2 * a2y + 2 * a3y + a4y)
}

function measure() {
  const r = Math.hypot(x, y), v = Math.hypot(vx, vy)
  curR.value = r
  curV.value = v
  // 1 Mm²/s = 10¹² m²/s。表示（×10⁹ m²/s）では areal/1e3 を使うので、ここで 1e6 倍しておく
  areal.value = 0.5 * Math.abs(x * vy - y * vx) * 1e6
  // 1 kg あたりの力学的エネルギー [Mm²/s² = 10¹² J/kg]。表示では ×10⁶ J/kg に換算
  energy.value = 0.5 * v * v - GM / r
}

function step(dtReal) {
  if (stopped) return
  const simDt = dtReal * (T0.value / 7) // 円軌道1周 ≒ 7 秒で表示
  const N = 40
  for (let i = 0; i < N; i++) {
    rk4(simDt / N)
    simT += simDt / N
    const r = Math.hypot(x, y)
    if (r < RE) {
      stopped = true
      status.value = '💥 地表に落下しました。速さが足りないと、軌道の一部が地球の内側に入ってしまいます。'
      break
    }
    if (r > 30 * r0.value) {
      stopped = true
      status.value = '🚀 地球の引力圏から脱出しました（力学的エネルギーが 0 以上）。'
      break
    }
  }
  if (simT <= orbitT * 1.001) trail.push({ x, y, t: simT })
  if (trail.length > 4000) trail.shift()
  measure()
}

function draw() {
  clearGrid(ctx, W, H, 0, '#05070e')
  // 背景の星
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  for (let i = 0; i < 60; i++) ctx.fillRect((i * 9973) % W, (i * 7919) % H, 1.4, 1.4)

  const cx = W * 0.32, cy = H * 0.5
  const s = 100 / r0.value // px / Mm
  const X = (px) => cx + px * s
  const Y = (py) => cy - py * s

  // 掃いた面積（一定時間ごと）
  if (showSectors.value && energy.value < 0 && trail.length > 2) {
    const dtSec = T0.value / 12
    let start = 0
    let idx = 0
    for (let i = 1; i < trail.length; i++) {
      const k = Math.floor(trail[i].t / dtSec)
      if (k !== idx || i === trail.length - 1) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        for (let j = start; j <= i; j++) ctx.lineTo(X(trail[j].x), Y(trail[j].y))
        ctx.closePath()
        ctx.fillStyle = idx % 2 ? 'rgba(192,132,252,0.16)' : 'rgba(56,189,248,0.16)'
        ctx.fill()
        start = i
        idx = k
      }
    }
  }

  // 軌跡
  ctx.strokeStyle = energy.value < 0 ? '#38bdf8' : '#f59e0b'
  ctx.lineWidth = 1.8
  ctx.beginPath()
  trail.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))))
  ctx.stroke()

  // 地球（縮尺どおり）
  const g = ctx.createRadialGradient(cx - 10, cy - 10, 4, cx, cy, RE * s)
  g.addColorStop(0, '#7dd3fc'); g.addColorStop(0.55, '#0369a1'); g.addColorStop(1, '#0c4a6e')
  dot(ctx, cx, cy, RE * s, g)
  text(ctx, '地球', cx, cy + 4, '#e0f2fe', 'bold 12px sans-serif', 'center')

  // 衛星・ベクトル
  const sx = X(x), sy = Y(y)
  line(ctx, sx, sy, cx, cy, 'rgba(239,68,68,0.45)', 1.2, [3, 3])
  const r = Math.hypot(x, y)
  const aMag = GM / (r * r)
  const aLen = Math.min(70, aMag * 6.5e6)
  arrow(ctx, sx, sy, sx - (x / r) * aLen, sy + (y / r) * aLen, '#f87171', 2.2, '万有引力', { font: '11px sans-serif' })
  arrow(ctx, sx, sy, sx + vx * 9000, sy - vy * 9000, '#34d399', 2.5, 'v', { font: 'bold 12px sans-serif' })
  dot(ctx, sx, sy, 6, '#fbbf24', '#fff')

  text(ctx, `打ち出し点での v₁ = ${(vc0.value * 1000).toFixed(2)} km/s,  脱出に必要な速さ v₂ = ${(Math.SQRT2 * vc0.value * 1000).toFixed(2)} km/s`, 14, 22, '#cbd5e1', '12px sans-serif')
  text(ctx, '※ 地球の大きさ・距離は縮尺どおり。時間は大幅に早送りしています', 14, H - 12, '#64748b', '11px sans-serif')
}

watch([ratio, r0], reset)
onMounted(() => {
  ctx = setupCanvas(canvasRef.value, W, H)
  reset()
})
useLoop((dt) => {
  if (!ctx) return
  if (playing.value) step(dt)
  draw()
})
</script>
