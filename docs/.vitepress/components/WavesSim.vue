<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🌊 {{ modeLabel }}</span>
      <span class="sim-badge">{{ modeBadge }}</span>
    </div>

    <div class="mode-tabs">
      <button
        v-for="m in modes"
        :key="m.id"
        :class="['mode-tab', { active: mode === m.id }]"
        @click="switchMode(m.id)"
      >{{ m.label }}</button>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="320"></canvas>
    </div>

    <template v-if="mode === 'standing'">
      <div class="controls-grid">
        <div class="control-item">
          <label>振幅 A: <strong>{{ A }}</strong></label>
          <input type="range" v-model.number="A" min="20" max="80" step="2" />
        </div>
        <div class="control-item">
          <label>倍振動 n: <strong>第{{ n }}倍音</strong></label>
          <input type="range" v-model.number="n" min="1" max="5" step="1" />
        </div>
        <div class="control-item">
          <label>境界条件:</label>
          <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
            <button :class="['preset-btn', { active: boundary === 'both-fixed' }]" @click="boundary = 'both-fixed'">両端固定（弦）</button>
            <button :class="['preset-btn', { active: boundary === 'open-closed' }]" @click="boundary = 'open-closed'">一端閉（閉管）</button>
          </div>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-label">固有振動数 fn</div>
          <div class="stat-value">{{ fn.toFixed(2) }} <span class="unit">Hz</span></div>
          <div class="stat-formula">fn = nv/2L （両端固定）</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">波長 λn</div>
          <div class="stat-value">{{ lambdaN.toFixed(2) }} <span class="unit">m</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">腹の数</div>
          <div class="stat-value">{{ n }} <span class="unit">個</span></div>
          <div class="stat-formula">節の数: {{ n - 1 }} 個</div>
        </div>
      </div>
    </template>

    <template v-if="mode === 'superposition'">
      <div class="controls-grid">
        <div class="control-item">
          <label>波1の振動数 f1: <strong>{{ f1.toFixed(1) }} Hz</strong></label>
          <input type="range" v-model.number="f1" min="0.5" max="4" step="0.1" />
        </div>
        <div class="control-item">
          <label>波2の振動数 f2: <strong>{{ f2.toFixed(1) }} Hz</strong></label>
          <input type="range" v-model.number="f2" min="0.5" max="4" step="0.1" />
        </div>
        <div class="control-item">
          <label>波2の向き:</label>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button :class="['preset-btn', { active: wave2Dir === 1 }]" @click="wave2Dir = 1">同方向 →</button>
            <button :class="['preset-btn', { active: wave2Dir === -1 }]" @click="wave2Dir = -1">逆方向 ←</button>
          </div>
        </div>
        <div class="control-item">
          <label>位相差 φ: <strong>{{ phase2Deg }}°</strong></label>
          <input type="range" v-model.number="phase2Deg" min="0" max="360" step="10" />
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">うなりの振動数</div>
          <div class="stat-value">{{ Math.abs(f1 - f2).toFixed(1) }} <span class="unit">Hz</span></div>
          <div class="stat-formula">fbeat = |f1 - f2|</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-label">合成のタイプ</div>
          <div class="stat-value" style="font-size:0.95rem">{{ superpositionType }}</div>
        </div>
      </div>
    </template>

    <template v-if="mode === 'doppler'">
      <div class="controls-grid">
        <div class="control-item">
          <label>音源の速度 vs: <strong>{{ vs }} m/s</strong></label>
          <input type="range" v-model.number="vs" min="0" max="250" step="5" />
        </div>
        <div class="control-item">
          <label>観測者の速度 vo: <strong>{{ vo }} m/s</strong></label>
          <input type="range" v-model.number="vo" min="-100" max="100" step="5" />
          <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">+ = 音源方向、- = 音源と反対</div>
        </div>
        <div class="control-item">
          <label>音源の振動数 f0: <strong>{{ f0 }} Hz</strong></label>
          <input type="range" v-model.number="f0" min="100" max="1000" step="50" />
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-label">観測する振動数 f'</div>
          <div class="stat-value">{{ fPrime.toFixed(1) }} <span class="unit">Hz</span></div>
          <div class="stat-formula">f' = (V + vo)/(V - vs) × f0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">音速 V</div>
          <div class="stat-value">340 <span class="unit">m/s</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">変化率</div>
          <div class="stat-value">{{ fPrimeRatio }}倍</div>
          <div class="stat-formula" :style="{ color: fPrime > f0 ? '#10b981' : '#f59e0b' }">
            {{ fPrime > f0 ? '高く聞こえる' : fPrime < f0 ? '低く聞こえる' : '変化なし' }}
          </div>
        </div>
      </div>
    </template>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <button class="btn btn-secondary" @click="reset">⏮ リセット</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const isPlaying = ref(true)
const mode = ref('standing')

const modes = [
  { id: 'standing', label: '🎸 定常波' },
  { id: 'superposition', label: '〰 波の重ね合わせ' },
  { id: 'doppler', label: '🔊 ドップラー効果' },
]

const modeLabel = computed(() => modes.find(m => m.id === mode.value)?.label ?? '')
const modeBadge = computed(() => ({
  standing: '弦・管楽器の共鳴',
  superposition: 'うなり・干渉',
  doppler: '救急車の音の変化',
}[mode.value]))

// 定常波
const A = ref(50)
const n = ref(2)
const boundary = ref('both-fixed')
const v_wave = 2.0
const L = 1.0
const fn = computed(() => boundary.value === 'both-fixed' ? (n.value * v_wave) / (2 * L) : ((2 * n.value - 1) * v_wave) / (4 * L))
const lambdaN = computed(() => v_wave / fn.value)

// 重ね合わせ
const f1 = ref(1.5)
const f2 = ref(2.0)
const wave2Dir = ref(-1)
const phase2Deg = ref(0)
const superpositionType = computed(() => {
  const diff = Math.abs(f1.value - f2.value)
  if (wave2Dir.value === -1 && diff < 0.15) return '定常波（ほぼ同じ振動数）'
  if (wave2Dir.value === 1 && diff < 0.15 && phase2Deg.value === 0) return '同位相：強め合い'
  if (wave2Dir.value === 1 && diff < 0.15 && phase2Deg.value === 180) return '逆位相：弱め合い'
  if (diff > 0.05 && wave2Dir.value === 1) return `うなり周期: ${(1/diff).toFixed(2)}s`
  return '合成波（異なる振動数）'
})

// ドップラー
const vs = ref(50)
const vo = ref(0)
const f0 = ref(440)
const fPrime = computed(() => {
  const d = 340 - vs.value
  return d <= 0 ? Infinity : ((340 + vo.value) / d) * f0.value
})
const fPrimeRatio = computed(() => (fPrime.value / f0.value).toFixed(2))

// アニメーション
let animId = null
let startTime = null

function getT() {
  if (!startTime) startTime = performance.now()
  return (performance.now() - startTime) / 1000
}

function drawGrid(ctx, w, h) {
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(63,63,70,0.5)'
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke() }
  for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }
}

function drawStanding(ctx, w, h, t) {
  drawGrid(ctx, w, h)
  const ropeY = h * 0.45
  const left = w * 0.08
  const right = w * 0.92

  const omega = 2 * Math.PI * fn.value
  const envelope = Math.sin(omega * t)

  // 包絡線
  ctx.strokeStyle = 'rgba(168,85,247,0.18)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  for (const sign of [1, -1]) {
    ctx.beginPath()
    for (let xi = 0; xi <= 300; xi++) {
      const x = left + (right - left) * xi / 300
      const frac = (x - left) / (right - left)
      const sp = boundary.value === 'both-fixed'
        ? Math.sin(n.value * Math.PI * frac)
        : Math.cos((2 * n.value - 1) * Math.PI / 2 * frac)
      const y = ropeY - sign * A.value * Math.abs(sp)
      xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.setLineDash([])

  // 定常波
  const grad = ctx.createLinearGradient(left, 0, right, 0)
  grad.addColorStop(0, '#38bdf8')
  grad.addColorStop(0.5, '#a855f7')
  grad.addColorStop(1, '#38bdf8')
  ctx.strokeStyle = grad
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let xi = 0; xi <= 300; xi++) {
    const x = left + (right - left) * xi / 300
    const frac = (x - left) / (right - left)
    const sp = boundary.value === 'both-fixed'
      ? Math.sin(n.value * Math.PI * frac)
      : Math.cos((2 * n.value - 1) * Math.PI / 2 * frac)
    const y = ropeY - A.value * sp * envelope
    xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 壁
  ctx.fillStyle = '#3f3f46'
  ctx.fillRect(left - 8, ropeY - 50, 8, 100)
  ctx.fillStyle = boundary.value === 'open-closed' ? '#fbbf24' : '#3f3f46'
  ctx.fillRect(right, ropeY - 50, 8, 100)

  // 節・腹ラベル
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  for (let i = 0; i <= n.value; i++) {
    const frac = boundary.value === 'both-fixed' ? i / n.value : i / n.value
    const x = left + (right - left) * frac
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(x - 1, ropeY - 14, 2, 28)
    ctx.fillText('節', x, ropeY + 28)
  }
  for (let i = 0; i < n.value; i++) {
    const frac = boundary.value === 'both-fixed' ? (i + 0.5) / n.value : (2 * i + 1) / (2 * n.value)
    const x = left + (right - left) * frac
    ctx.fillStyle = '#38bdf8'
    ctx.fillText('腹', x, ropeY - 28)
  }

  ctx.fillStyle = '#c084fc'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`第${n.value}倍振動 (n=${n.value})`, w / 2, ropeY - 64)
}

function drawSuperposition(ctx, w, h, t) {
  drawGrid(ctx, w, h)
  const rows = [h * 0.2, h * 0.52, h * 0.84]
  const left = w * 0.04
  const right = w * 0.96
  const colors = ['#38bdf8', '#f59e0b', '#10b981']
  const labels = ['y₁（波1）', 'y₂（波2）', 'y = y₁ + y₂（合成波）']
  const phi2 = (phase2Deg.value * Math.PI) / 180

  for (let row = 0; row < 3; row++) {
    const centerY = rows[row]
    const amp = 24
    ctx.strokeStyle = colors[row] + '40'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(left, centerY); ctx.lineTo(right, centerY); ctx.stroke()
    ctx.setLineDash([])

    ctx.strokeStyle = colors[row]
    ctx.lineWidth = row === 2 ? 3 : 2
    ctx.beginPath()
    for (let xi = 0; xi <= 300; xi++) {
      const x = left + (right - left) * xi / 300
      const frac = xi / 300
      const k1 = 2 * Math.PI * 3 * frac
      const k2 = wave2Dir.value * 2 * Math.PI * 3 * frac
      const y1 = Math.sin(2 * Math.PI * f1.value * t - k1)
      const y2 = Math.sin(2 * Math.PI * f2.value * t - k2 + phi2)
      const val = row === 0 ? y1 : row === 1 ? y2 : (y1 + y2) * 0.65
      const py = centerY - val * amp
      xi === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py)
    }
    ctx.stroke()

    ctx.fillStyle = colors[row]
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(labels[row], left, centerY - 30)
  }
}

function drawDoppler(ctx, w, h, t) {
  drawGrid(ctx, w, h)
  const sX = w * 0.28 + (vs.value / 340) * w * 0.15 * Math.sin(t * 0.8)
  const sY = h * 0.5
  const oX = w * 0.85
  const oY = h * 0.5
  const speed_r = vs.value / 340

  for (let i = 1; i <= 7; i++) {
    const r = 16 + i * 28 + (t * 50 % 28)
    const sx = speed_r * r * 0.85
    ctx.beginPath()
    ctx.arc(sX - sx, sY, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(56,189,248,${0.65 - i * 0.08})`
    ctx.lineWidth = 1.8
    ctx.stroke()
  }

  // 音源
  ctx.fillStyle = '#ef4444'
  ctx.beginPath(); ctx.arc(sX, sY, 15, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('音源', sX, sY)
  ctx.textBaseline = 'alphabetic'
  if (vs.value > 0) {
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(sX + 18, sY); ctx.lineTo(sX + 42, sY); ctx.stroke()
    ctx.fillStyle = '#ef4444'
    ctx.beginPath(); ctx.moveTo(sX + 42, sY); ctx.lineTo(sX + 35, sY - 5); ctx.lineTo(sX + 35, sY + 5); ctx.fill()
    ctx.font = '10px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`vs=${vs.value}m/s`, sX + 44, sY - 4)
  }

  // 観測者
  ctx.fillStyle = '#e4e4e7'
  ctx.beginPath(); ctx.arc(oX, oY, 13, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.stroke()
  ctx.fillStyle = '#09090b'; ctx.font = 'bold 9px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('観測', oX, oY)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#c084fc'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(`f' = ${fPrime.value.toFixed(1)} Hz`, oX, oY - 48)
  ctx.fillStyle = '#a1a1aa'; ctx.font = '12px sans-serif'
  ctx.fillText(`元の音 f₀ = ${f0.value} Hz`, oX, oY - 30)

  if (vs.value > 0) {
    ctx.fillStyle = '#10b981'; ctx.font = '12px sans-serif'
    ctx.fillText('← 波長が縮む（高く聞こえる）', (sX + oX) / 2, sY - 72)
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  const t = getT()
  if (mode.value === 'standing') drawStanding(ctx, w, h, t)
  else if (mode.value === 'superposition') drawSuperposition(ctx, w, h, t)
  else drawDoppler(ctx, w, h, t)
}

function animate() {
  if (!isPlaying.value) return
  draw()
  animId = requestAnimationFrame(animate)
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) animate()
}

function reset() { startTime = null; draw() }
function switchMode(m) { mode.value = m; startTime = null; draw() }

watch([mode, boundary, n, A, f1, f2, wave2Dir, phase2Deg, vs, vo, f0], () => {
  if (!isPlaying.value) draw()
})

onMounted(() => { draw(); animId = requestAnimationFrame(animate) })
onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })
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
.sim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem }
.sim-title { font-size:1.1rem; font-weight:700; background:linear-gradient(90deg,#38bdf8,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
.sim-badge { background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:9999px; font-weight:600 }
.mode-tabs { display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap }
.mode-tab { padding:0.4rem 1rem; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#a1a1aa; transition:all 0.2s }
.mode-tab:hover { background:rgba(255,255,255,0.1); color:#fff }
.mode-tab.active { background:rgba(56,189,248,0.2); border-color:#38bdf8; color:#38bdf8 }
.canvas-wrapper { background:#09090b; border-radius:12px; overflow:hidden; border:1px solid #27272a; display:flex; justify-content:center; margin-bottom:1rem }
canvas { width:100%; max-width:700px; height:auto }
.controls-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1.25rem }
.control-item { background:rgba(255,255,255,0.03); padding:0.75rem 1rem; border-radius:10px; border:1px solid rgba(255,255,255,0.06) }
.control-item label { display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#d4d4d8 }
.control-item input[type=range] { width:100%; accent-color:#38bdf8; cursor:pointer }
.preset-btn { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#d4d4d8; padding:0.3rem 0.7rem; border-radius:6px; cursor:pointer; font-size:0.8rem; transition:all 0.2s }
.preset-btn:hover { background:rgba(255,255,255,0.1) }
.preset-btn.active { background:rgba(56,189,248,0.2); border-color:#38bdf8; color:#38bdf8 }
.action-buttons { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem }
.btn { padding:0.5rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; font-size:0.9rem }
.btn-primary { background:linear-gradient(135deg,#38bdf8,#6366f1); color:white }
.btn-primary:hover { opacity:0.9; transform:translateY(-1px) }
.btn-secondary { background:rgba(255,255,255,0.08); color:#f4f4f5; border:1px solid rgba(255,255,255,0.15) }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:0.75rem; margin-bottom:1rem }
.stat-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem; text-align:center }
.stat-card.highlight { border-color:rgba(56,189,248,0.4); background:rgba(56,189,248,0.05) }
.stat-label { font-size:0.8rem; color:#a1a1aa; margin-bottom:0.3rem }
.stat-value { font-size:1.3rem; font-weight:700; color:#f4f4f5 }
.stat-value .unit { font-size:0.85rem; color:#a1a1aa; font-weight:400 }
.stat-formula { font-size:0.75rem; color:#71717a; margin-top:0.3rem }
</style>
