<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#a855f7">
    <div class="lab-head">
      <span class="lab-title">🌊 {{ modeInfo.title }}</span>
      <span class="lab-badge">{{ modeInfo.badge }}</span>
    </div>

    <div class="lab-tabs">
      <button v-for="m in modes" :key="m.id" :class="['lab-chip', { on: mode === m.id }]" @click="switchMode(m.id)">
        {{ m.label }}
      </button>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="playing = !playing" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ playing ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="lab-btn" @click="stepSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="lab-btn" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <!-- 定常波 -->
    <template v-if="mode === 'standing'">
      <div class="lab-controls">
        <div class="lab-ctrl">
          <label>モード番号 n: <strong>{{ n }}</strong>（第{{ harmonic }}倍振動）</label>
          <input type="range" v-model.number="n" min="1" max="5" step="1" />
          <div class="lab-note" v-if="bc === 'closed'">閉管では奇数倍（1, 3, 5, …倍）の振動だけが生じます</div>
        </div>
        <div class="lab-ctrl">
          <label>境界条件（端が節か腹か）</label>
          <div class="lab-row">
            <button :class="['lab-chip', { on: bc === 'fixed' }]" @click="bc = 'fixed'">両端固定の弦</button>
            <button :class="['lab-chip', { on: bc === 'open' }]" @click="bc = 'open'">開管（両端開）</button>
            <button :class="['lab-chip', { on: bc === 'closed' }]" @click="bc = 'closed'">閉管（左開・右閉）</button>
          </div>
        </div>
      </div>
      <div class="lab-stats">
        <div class="lab-stat hl">
          <div class="k">固有振動数 f</div>
          <div class="v">{{ fn.toFixed(0) }} <small>Hz</small></div>
          <div class="f">{{ formulaText }}</div>
        </div>
        <div class="lab-stat">
          <div class="k">波長 λ</div>
          <div class="v">{{ lambdaN.toFixed(3) }} <small>m</small></div>
          <div class="f">λ = v / f</div>
        </div>
        <div class="lab-stat">
          <div class="k">節の数 / 腹の数</div>
          <div class="v">{{ nodes.length }} / {{ antinodes.length }}</div>
          <div class="f">両端を含めて数えた個数</div>
        </div>
        <div class="lab-stat">
          <div class="k">設定値</div>
          <div class="v" style="font-size:0.95rem">L = {{ media.L }} m</div>
          <div class="f">{{ media.vLabel }}</div>
        </div>
      </div>
    </template>

    <!-- 重ね合わせ -->
    <template v-if="mode === 'superposition'">
      <div class="lab-controls">
        <div class="lab-ctrl">
          <label>波1の振動数 f₁: <strong>{{ f1.toFixed(1) }} Hz</strong></label>
          <input type="range" v-model.number="f1" min="0.5" max="3" step="0.1" />
        </div>
        <div class="lab-ctrl">
          <label>波2の振動数 f₂: <strong>{{ f2.toFixed(1) }} Hz</strong></label>
          <input type="range" v-model.number="f2" min="0.5" max="3" step="0.1" />
        </div>
        <div class="lab-ctrl">
          <label>波2の進む向き</label>
          <div class="lab-row">
            <button :class="['lab-chip', { on: dir2 === 1 }]" @click="dir2 = 1">波1と同じ向き →</button>
            <button :class="['lab-chip', { on: dir2 === -1 }]" @click="dir2 = -1">逆向き ←</button>
          </div>
        </div>
        <div class="lab-ctrl">
          <label>波2の初期位相のずれ φ: <strong>{{ phaseDeg }}°</strong></label>
          <input type="range" v-model.number="phaseDeg" min="0" max="360" step="10" />
        </div>
      </div>
      <div class="lab-stats">
        <div class="lab-stat hl">
          <div class="k">合成波の様子</div>
          <div class="v" style="font-size:0.95rem">{{ superType }}</div>
        </div>
        <div class="lab-stat">
          <div class="k">うなりの回数（1秒あたり）</div>
          <div class="v">{{ Math.abs(f1 - f2).toFixed(1) }} <small>回/s</small></div>
          <div class="f">|f₁ − f₂|（同じ向き・同じ場所で観測）</div>
        </div>
        <div class="lab-stat">
          <div class="k">波長 λ₁ / λ₂</div>
          <div class="v" style="font-size:1rem">{{ (vS / f1).toFixed(2) }} / {{ (vS / f2).toFixed(2) }}</div>
          <div class="f">同じ媒質なので速さ共通、λ = v/f</div>
        </div>
      </div>
    </template>

    <!-- ドップラー効果 -->
    <template v-if="mode === 'doppler'">
      <div class="lab-controls">
        <div class="lab-ctrl">
          <label>音源の速度 v<sub>s</sub>: <strong>{{ vs }} m/s</strong></label>
          <input type="range" v-model.number="vs" min="0" max="250" step="5" />
          <div class="lab-note">右向き（音源→観測者の向き）を正</div>
        </div>
        <div class="lab-ctrl">
          <label>観測者の速度 v<sub>o</sub>: <strong>{{ vo }} m/s</strong></label>
          <input type="range" v-model.number="vo" min="-100" max="100" step="5" />
          <div class="lab-note">正 = 音源から遠ざかる向き、負 = 音源へ近づく向き</div>
        </div>
        <div class="lab-ctrl">
          <label>音源の振動数 f₀: <strong>{{ f0 }} Hz</strong></label>
          <input type="range" v-model.number="f0" min="200" max="1000" step="50" />
        </div>
      </div>
      <div class="lab-stats">
        <div class="lab-stat hl">
          <div class="k">観測者が聞く振動数 f′</div>
          <div class="v">{{ fPrime.toFixed(1) }} <small>Hz</small></div>
          <div class="f">f′ = (V − v<sub>o</sub>)/(V − v<sub>s</sub>) · f₀</div>
        </div>
        <div class="lab-stat">
          <div class="k">音源の前方の波長</div>
          <div class="v">{{ ((V - vs) / f0).toFixed(3) }} <small>m</small></div>
          <div class="f">λ′ = (V − v<sub>s</sub>)/f₀</div>
        </div>
        <div class="lab-stat">
          <div class="k">音源の後方の波長</div>
          <div class="v">{{ ((V + vs) / f0).toFixed(3) }} <small>m</small></div>
          <div class="f">λ″ = (V + v<sub>s</sub>)/f₀</div>
        </div>
        <div class="lab-stat">
          <div class="k">聞こえ方</div>
          <div class="v" :style="{ fontSize: '1rem', color: fPrime > f0 + 0.05 ? '#10b981' : fPrime < f0 - 0.05 ? '#f59e0b' : '#e4e4e7' }">
            {{ fPrime > f0 + 0.05 ? '高く聞こえる' : fPrime < f0 - 0.05 ? '低く聞こえる' : '変化なし' }}
          </div>
          <div class="f">音速 V = 340 m/s（無風）</div>
        </div>
      </div>
    </template>

    <div class="lab-btns">
      <button class="lab-btn primary" @click="playing = !playing">{{ playing ? '⏸ 一時停止' : '▶ 再生' }}</button>
      <button class="lab-btn" @click="reset">⏮ リセット</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const W = 720, H = 320
const canvasRef = ref(null)
let ctx = null
const playing = ref(true)
const timeScale = ref(0.5) // デフォルトで波の伝播や振動がじっくり追える0.5xスロー再生
let t = 0

const modes = [
  { id: 'standing', label: '🎸 定常波（弦・気柱）', title: '定常波：弦と気柱の固有振動', badge: '節・腹・倍振動' },
  { id: 'superposition', label: '〰 波の重ね合わせ', title: '波の重ね合わせの原理', badge: '定常波・うなり・干渉' },
  { id: 'doppler', label: '🔊 ドップラー効果', title: '音のドップラー効果', badge: '波面の間隔と振動数' },
]
const mode = ref('standing')
const modeInfo = computed(() => modes.find((m) => m.id === mode.value))

/* ---------- 定常波 ---------- */
const n = ref(2)
const bc = ref('fixed') // fixed | open | closed
const media = computed(() =>
  bc.value === 'fixed'
    ? { L: 0.65, v: 260, vLabel: '弦を伝わる波の速さ v = 260 m/s', name: '両端固定の弦' }
    : { L: 0.5, v: 340, vLabel: '音速 V = 340 m/s（開口端補正は無視）', name: bc.value === 'open' ? '開管' : '閉管' }
)
const harmonic = computed(() => (bc.value === 'closed' ? 2 * n.value - 1 : n.value))
const fn = computed(() =>
  bc.value === 'closed' ? (harmonic.value * media.value.v) / (4 * media.value.L) : (n.value * media.value.v) / (2 * media.value.L)
)
const lambdaN = computed(() => media.value.v / fn.value)
const formulaText = computed(() =>
  bc.value === 'closed' ? 'f = (2n−1)V / 4L' : bc.value === 'open' ? 'f = nV / 2L' : 'f = nv / 2L'
)
// 節・腹の位置（左端0〜右端1の割合）
const nodes = computed(() => {
  const k = n.value
  if (bc.value === 'fixed') return Array.from({ length: k + 1 }, (_, i) => i / k)
  if (bc.value === 'open') return Array.from({ length: k }, (_, i) => (i + 0.5) / k)
  const m = 2 * k - 1
  return Array.from({ length: k }, (_, i) => (2 * i + 1) / m)
})
const antinodes = computed(() => {
  const k = n.value
  if (bc.value === 'fixed') return Array.from({ length: k }, (_, i) => (i + 0.5) / k)
  if (bc.value === 'open') return Array.from({ length: k + 1 }, (_, i) => i / k)
  const m = 2 * k - 1
  return Array.from({ length: k }, (_, i) => (2 * i) / m)
})
function shape(fr) {
  if (bc.value === 'fixed') return Math.sin(n.value * Math.PI * fr)
  if (bc.value === 'open') return Math.cos(n.value * Math.PI * fr)
  return Math.cos(((2 * n.value - 1) * Math.PI * fr) / 2)
}

/* ---------- 重ね合わせ ---------- */
const f1 = ref(1.5)
const f2 = ref(1.5)
const dir2 = ref(-1)
const phaseDeg = ref(0)
const vS = 0.5 // 画面幅/秒（同じ媒質なので共通の速さ）
const superType = computed(() => {
  const d = Math.abs(f1.value - f2.value)
  if (d < 0.05) {
    if (dir2.value === -1) return '定常波（その場で振動する）'
    const p = ((phaseDeg.value % 360) + 360) % 360
    if (p === 0) return '同位相：強め合い（振幅2倍）'
    if (p === 180) return '逆位相：弱め合い（打ち消し）'
    return '同じ振動数の進行波（振幅は位相差で決まる）'
  }
  if (dir2.value === 1) return `うなり（1回の周期 ${(1 / d).toFixed(2)} s）`
  return '振動数の異なる波の合成'
})

/* ---------- ドップラー ---------- */
const V = 340
const vs = ref(80)
const vo = ref(0)
const f0 = ref(500)
const fPrime = computed(() => ((V - vo.value) / (V - vs.value)) * f0.value)
const Vpx = 110 // 表示上の音速 [px/s]
const pxPerMps = Vpx / V
let srcX = 70
let obsX = W - 70
let fronts = []
let lastEmit = -1

function reset() {
  t = 0
  srcX = 70
  obsX = W - 70
  fronts = []
  lastEmit = -1
}
function switchMode(m) {
  mode.value = m
  reset()
}

/* ---------- 描画 ---------- */
function drawStanding() {
  clearGrid(ctx, W, H)
  const left = 70, right = W - 70, y0 = H * 0.52, A = 62
  const X = (fr) => left + (right - left) * fr
  const isPipe = bc.value !== 'fixed'

  if (isPipe) {
    ctx.fillStyle = 'rgba(56,189,248,0.05)'
    ctx.fillRect(left, y0 - 92, right - left, 184)
    line(ctx, left, y0 - 92, right, y0 - 92, '#71717a', 3)
    line(ctx, left, y0 + 92, right, y0 + 92, '#71717a', 3)
    if (bc.value === 'closed') line(ctx, right, y0 - 92, right, y0 + 92, '#fbbf24', 5)
    text(ctx, '開口端', left, y0 - 102, '#a1a1aa', '11px sans-serif', 'center')
    text(ctx, bc.value === 'closed' ? '閉口端' : '開口端', right, y0 - 102, bc.value === 'closed' ? '#fbbf24' : '#a1a1aa', '11px sans-serif', 'center')
  } else {
    ctx.fillStyle = '#52525b'
    ctx.fillRect(left - 10, y0 - 40, 10, 80)
    ctx.fillRect(right, y0 - 40, 10, 80)
  }

  // 包絡線
  for (const s of [1, -1]) {
    ctx.save()
    ctx.strokeStyle = 'rgba(168,85,247,0.35)'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1.4
    ctx.beginPath()
    for (let i = 0; i <= 300; i++) {
      const fr = i / 300
      const y = y0 - s * A * Math.abs(shape(fr))
      i ? ctx.lineTo(X(fr), y) : ctx.moveTo(X(fr), y)
    }
    ctx.stroke()
    ctx.restore()
  }
  // 波形（表示は実際よりゆっくり再生）
  const ph = Math.cos(2 * Math.PI * 0.45 * harmonic.value * t)
  const g = ctx.createLinearGradient(left, 0, right, 0)
  g.addColorStop(0, '#38bdf8'); g.addColorStop(0.5, '#a855f7'); g.addColorStop(1, '#38bdf8')
  ctx.strokeStyle = g
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let i = 0; i <= 300; i++) {
    const fr = i / 300
    const y = y0 - A * shape(fr) * ph
    i ? ctx.lineTo(X(fr), y) : ctx.moveTo(X(fr), y)
  }
  ctx.stroke()

  for (const fr of nodes.value) {
    dot(ctx, X(fr), y0, 4.5, '#ef4444')
    text(ctx, '節', X(fr), y0 + 22, '#f87171', 'bold 12px sans-serif', 'center')
  }
  for (const fr of antinodes.value) {
    text(ctx, '腹', X(fr), y0 - A - 10, '#7dd3fc', 'bold 12px sans-serif', 'center')
  }
  text(ctx, `${media.value.name}：第${harmonic.value}倍振動`, W / 2, 26, '#c4b5fd', 'bold 14px sans-serif', 'center')
  if (isPipe) {
    text(ctx, '※ 空気の変位（左右の揺れ）を縦方向に描いた図。変位の節は圧力変化の腹になる', W / 2, H - 10, '#a1a1aa', '11px sans-serif', 'center')
  } else {
    text(ctx, '※ 動きは実際の振動よりゆっくり表示しています', W / 2, H - 10, '#a1a1aa', '11px sans-serif', 'center')
  }
}

function drawSuperposition() {
  clearGrid(ctx, W, H)
  const left = 30, right = W - 30, amp = 24
  const rows = [62, 152, 252]
  const cols = ['#38bdf8', '#f59e0b', '#10b981']
  const labels = ['y₁（波1）', 'y₂（波2）', 'y = y₁ + y₂（合成波）']
  const phi = (phaseDeg.value * Math.PI) / 180
  rows.forEach((cy, r) => {
    line(ctx, left, cy, right, cy, 'rgba(161,161,170,0.35)', 1, [3, 3])
    ctx.strokeStyle = cols[r]
    ctx.lineWidth = r === 2 ? 3 : 2
    ctx.beginPath()
    for (let i = 0; i <= 360; i++) {
      const xf = i / 360
      const y1 = Math.sin(2 * Math.PI * f1.value * (t - xf / vS))
      const y2 = Math.sin(2 * Math.PI * f2.value * (t - (dir2.value * xf) / vS) + phi)
      const val = r === 0 ? y1 : r === 1 ? y2 : y1 + y2
      const px = left + (right - left) * xf
      const py = cy - val * amp
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
    }
    ctx.stroke()
    text(ctx, labels[r], left, cy - (r === 2 ? 54 : 30), cols[r], 'bold 12px sans-serif')
  })
  // 進行方向の表示
  arrow(ctx, right - 70, 28, right - 20, 28, '#38bdf8', 2)
  if (dir2.value === 1) arrow(ctx, right - 70, 118, right - 20, 118, '#f59e0b', 2)
  else arrow(ctx, right - 20, 118, right - 70, 118, '#f59e0b', 2)
}

function stepDoppler(dt) {
  srcX += vs.value * pxPerMps * dt
  obsX += vo.value * pxPerMps * dt
  if (t - lastEmit >= 0.28 || lastEmit < 0) {
    fronts.push({ x: srcX, t })
    lastEmit = t
  }
  fronts = fronts.filter((f) => Vpx * (t - f.t) < 900)
  if (srcX > W - 150 || obsX > W - 20 || obsX < srcX + 40) reset()
}

function drawDoppler() {
  clearGrid(ctx, W, H)
  const cy = H * 0.52
  for (const f of fronts) {
    const r = Vpx * (t - f.t)
    ctx.beginPath()
    ctx.arc(f.x, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(56,189,248,${Math.max(0.12, 0.75 - r / 700)})`
    ctx.lineWidth = 1.6
    ctx.stroke()
  }
  // 音源
  dot(ctx, srcX, cy, 13, '#ef4444', '#fecaca')
  text(ctx, '音源', srcX, cy + 30, '#fca5a5', 'bold 11px sans-serif', 'center')
  if (vs.value > 0) arrow(ctx, srcX + 16, cy - 22, srcX + 16 + vs.value * 0.25, cy - 22, '#ef4444', 2.5, `v_s=${vs.value}`, { font: '11px sans-serif' })
  // 観測者
  dot(ctx, obsX, cy, 11, '#e4e4e7', '#a855f7')
  text(ctx, '観測者', obsX, cy + 28, '#d8b4fe', 'bold 11px sans-serif', 'center')
  if (vo.value !== 0) arrow(ctx, obsX, cy - 22, obsX + vo.value * 0.35, cy - 22, '#c084fc', 2.5, `v_o=${vo.value}`, { font: '11px sans-serif', align: vo.value > 0 ? 'left' : 'right', lx: vo.value > 0 ? 6 : -6 })
  text(ctx, `f′ = ${fPrime.value.toFixed(1)} Hz`, W - 20, 28, '#c4b5fd', 'bold 15px sans-serif', 'right')
  if (vs.value > 0) {
    text(ctx, '前方：波面の間隔がつまる（波長が短い）', W - 20, H - 14, '#34d399', '12px sans-serif', 'right')
    text(ctx, '後方：間隔が広がる', 20, H - 14, '#fbbf24', '12px sans-serif', 'left')
  }
}

function stepSim(delta = 0.05) {
  t += delta
  if (mode.value === 'doppler') stepDoppler(delta)
}

onMounted(() => {
  ctx = setupCanvas(canvasRef.value, W, H)
})
useLoop((dt) => {
  if (!ctx) return
  if (playing.value) {
    const simDt = dt * timeScale.value
    t += simDt
    if (mode.value === 'doppler') stepDoppler(simDt)
  }
  if (mode.value === 'standing') drawStanding()
  else if (mode.value === 'superposition') drawSuperposition()
  else drawDoppler()
})
</script>
