<template>
  <div class="ac-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>⚡ 交流回路・RLC直列回路・インピーダンス・電気共振シミュレーター</h3>
        <span class="badge">AC Circuit &amp; Resonance</span>
      </div>
      <p class="desc">
        交流電源 <i>v</i>(<i>t</i>) = <i>V</i><sub>0</sub> sin(ω <i>t</i>) に対する抵抗 <i>R</i>・コイル <i>L</i>・コンデンサー <i>C</i> の位相関係（フェーザー回転ベクトル）、オシロスコープ波形、インピーダンス <i>Z</i>、共振周波数 <i>f</i><sub>0</sub> をリアルタイムに可視化します。
      </p>
    </div>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: circuitType === 'RLC' }" @click="circuitType = 'RLC'">
        ① RLC 直列回路（総合）
      </button>
      <button :class="{ active: circuitType === 'R' }" @click="circuitType = 'R'">
        ② 抵抗単独（同位相）
      </button>
      <button :class="{ active: circuitType === 'L' }" @click="circuitType = 'L'">
        ③ コイル単独（電流が π/2 遅れ）
      </button>
      <button :class="{ active: circuitType === 'C' }" @click="circuitType = 'C'">
        ④ コンデンサー単独（電流が π/2 進み）
      </button>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 表示速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.15 }" @click="timeScale = 0.15">0.15x (超スロー)</button>
          <button :class="{ active: timeScale === 0.35 }" @click="timeScale = 0.35">0.35x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.7 }" @click="timeScale = 0.7">0.7x (標準)</button>
          <button :class="{ active: timeScale === 1.2 }" @click="timeScale = 1.2">1.2x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepPhase" :disabled="isPlaying" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
        ⏭ コマ送り
      </button>
      <button class="btn btn-secondary" @click="resetTime" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
        ⏮ 初期位相へ
      </button>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="controls-grid">
        <div class="control-group">
          <label>電源周波数 <i>f</i>: <strong>{{ fmt(frequency, 1) }} Hz</strong></label>
          <input type="range" v-model.number="frequency" min="10" max="200" step="2" />
          <span class="sub-info">角周波数 ω = {{ fmt(omega, 1) }} rad/<i>s</i></span>
        </div>
        <div class="control-group">
          <label>電源電圧振幅 <i>V</i><sub>0</sub>: <strong>{{ V0 }} V</strong></label>
          <input type="range" v-model.number="V0" min="5" max="30" step="1" />
          <span class="sub-info">実効値 <i>V</i><sub><i>e</i></sub> = {{ fmt(V0 / Math.SQRT2, 1) }} <i>V</i></span>
        </div>
        <div class="control-group">
          <label>抵抗 <i>R</i>: <strong>{{ R }} Ω</strong></label>
          <input type="range" v-model.number="R" min="5" max="60" step="5" />
        </div>
        <div class="control-group">
          <label>インダクタンス <i>L</i>: <strong>{{ fmt(L * 1000, 0) }} mH</strong></label>
          <input type="range" v-model.number="L" min="0.01" max="0.20" step="0.01" />
          <span class="sub-info">誘導リアクタンス <i>X</i><sub><i>L</i></sub> = {{ fmt(XL, 1) }} Ω</span>
        </div>
        <div class="control-group">
          <label>静電容量 <i>C</i>: <strong>{{ fmt(C * 1e6, 0) }} μ<i>F</i></strong></label>
          <input type="range" v-model.number="C" min="10e-6" max="200e-6" step="5e-6" />
          <span class="sub-info">容量リアクタンス <i>X</i><sub><i>C</i></sub> = {{ fmt(XC, 1) }} Ω</span>
        </div>
        <div class="control-group button-group">
          <button class="resonance-btn" @click="setResonance">
            🎯 共振周波数に合わせる ({{ fmt(f0, 1) }} Hz)
          </button>
        </div>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <div class="stat-card">
        <span class="label">インピーダンス <i>Z</i></span>
        <span class="val highlight">{{ fmt(Z, 1) }} Ω</span>
      </div>
      <div class="stat-card">
        <span class="label">電流振幅 <i>I</i><sub>0</sub> = <i>V</i><sub>0</sub> / <i>Z</i></span>
        <span class="val highlight-alt">{{ fmt(I0, 3) }} A</span>
      </div>
      <div class="stat-card">
        <span class="label">位相差 φ (電圧に対する電流の遅れ)</span>
        <span class="val">{{ fmt(phaseDeg, 1) }}°</span>
      </div>
      <div class="stat-card">
        <span class="label">共振周波数 <i>f</i><sub>0</sub> = 1/(2π√(LC))</span>
        <span class="val highlight">{{ fmt(f0, 1) }} Hz</span>
      </div>
      <div class="stat-card">
        <span class="label">力率 cosφ = <i>R</i> / <i>Z</i></span>
        <span class="val">{{ fmt(powerFactor, 3) }}</span>
      </div>
      <div class="stat-card">
        <span class="label">消費電力 <i>P</i> = <i>V</i><sub><i>e</i></sub> <i>I</i><sub><i>e</i></sub> cosφ</span>
        <span class="val">{{ fmt(power, 2) }} W</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, dot, text, line, arrow, useLoop, fmt } from './simUtils'

const canvasRef = ref(null)
const circuitType = ref('RLC') // 'RLC', 'R', 'L', 'C'

// パラメーター
const frequency = ref(50) // Hz
const V0 = ref(15) // V
const R = ref(20) // Ω
const L = ref(0.08) // H (80mH)
const C = ref(50e-6) // F (50μF)

// 角周波数
const omega = computed(() => 2 * Math.PI * frequency.value)

// リアクタンス
const XL = computed(() => {
  if (circuitType.value === 'R' || circuitType.value === 'C') return 0
  return omega.value * L.value
})

const XC = computed(() => {
  if (circuitType.value === 'R' || circuitType.value === 'L') return 0
  return 1 / (omega.value * C.value)
})

// インピーダンス Z
const Z = computed(() => {
  if (circuitType.value === 'R') return R.value
  if (circuitType.value === 'L') return XL.value
  if (circuitType.value === 'C') return XC.value
  const dX = XL.value - XC.value
  return Math.hypot(R.value, dX)
})

// 共振周波数 f0
const f0 = computed(() => 1 / (2 * Math.PI * Math.sqrt(L.value * C.value)))

// 電流振幅
const I0 = computed(() => V0.value / Z.value)

// 位相差 φ (電圧 v = V0 sin(ωt) に対して i = I0 sin(ωt - φ))
// tan(phi) = (XL - XC) / R
const phaseRad = computed(() => {
  if (circuitType.value === 'R') return 0
  if (circuitType.value === 'L') return Math.PI / 2
  if (circuitType.value === 'C') return -Math.PI / 2
  return Math.atan2(XL.value - XC.value, R.value)
})
const phaseDeg = computed(() => (phaseRad.value * 180) / Math.PI)

// 力率 cos(phi)
const powerFactor = computed(() => Math.cos(phaseRad.value))

// 平均消費電力 P = Ve * Ie * cos(phi) = 1/2 * V0 * I0 * cos(phi)
const power = computed(() => 0.5 * V0.value * I0.value * powerFactor.value)

// 共振周波数に設定
function setResonance() {
  frequency.value = Math.round(f0.value)
}

// 再生状態と速度制御
const isPlaying = ref(true)
const timeScale = ref(0.35) // デフォルトで落ち着いて観察できる 0.35x

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const resetTime = () => {
  simTime = 0
}

// 観察用角速度: 1回転約2.5秒を基準とし、周波数に応じた微調整
const visualOmega = computed(() => 2 * Math.PI * 0.4)

const stepPhase = () => {
  simTime += (Math.PI / 12) / visualOmega.value
}

// アニメーション用経過時間
let simTime = 0

// アニメーションループ
useLoop((dt) => {
  if (isPlaying.value) {
    simTime += dt * timeScale.value
  }
  const canvas = canvasRef.value
  if (!canvas) return
  const w = 780
  const h = 420
  const ctx = setupCanvas(canvas, w, h)
  clearGrid(ctx, w, h, 30, '#09090b')

  drawPhasor(ctx, w, h)
  drawWaveform(ctx, w, h)
})

// -------------------------------------------------------------------
// 描画: 左側フェーザー（回転ベクトル図）
// -------------------------------------------------------------------
function drawPhasor(ctx, w, h) {
  const cx = 180
  const cy = 210
  const rScale = 6.0 // 電圧スケール

  text(ctx, '【フェーザー（複素数・回転ベクトル）】', 30, 40, '#e4e4e7', 'bold 13px sans-serif')

  // 円盤ガイド
  ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  dot(ctx, cx, cy, V0.value * rScale, null, 'rgba(63, 63, 70, 0.4)')
  ctx.setLineDash([])

  // 軸
  line(ctx, cx - 140, cy, cx + 140, cy, '#3f3f46', 1)
  line(ctx, cx, cy - 140, cx, cy + 140, '#3f3f46', 1)

  // 落ち着いて観察できる回転角度（ラジアン）
  const currentAngle = (visualOmega.value * simTime) % (Math.PI * 2)

  // 電流ベクトル I (基準または位相差 -phi)
  const iAngle = currentAngle - phaseRad.value
  const iLen = Math.min(115, I0.value * 110) // 電流表示スケール
  const ix = cx + iLen * Math.cos(iAngle)
  const iy = cy - iLen * Math.sin(iAngle)
  arrow(ctx, cx, cy, ix, iy, '#34d399', 3)
  text(
    ctx,
    `I (${fmt(I0.value, 2)}A)`,
    cx + (iLen + 22) * Math.cos(iAngle),
    cy - (iLen + 22) * Math.sin(iAngle),
    '#34d399',
    'bold 11px sans-serif',
    'center'
  )

  // 全体電圧ベクトル V (角度 currentAngle)
  const vLen = V0.value * rScale
  const vx = cx + vLen * Math.cos(currentAngle)
  const vy = cy - vLen * Math.sin(currentAngle)
  arrow(ctx, cx, cy, vx, vy, '#f43f5e', 3)
  text(
    ctx,
    `V (${V0.value}V)`,
    cx + (vLen + 22) * Math.cos(currentAngle),
    cy - (vLen + 22) * Math.sin(currentAngle),
    '#f43f5e',
    'bold 11px sans-serif',
    'center'
  )

  // 位相差の弧
  ctx.beginPath()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  const arcR = 32
  ctx.arc(cx, cy, arcR, -currentAngle, -iAngle, phaseRad.value > 0)
  ctx.stroke()
  const midAng = (currentAngle + iAngle) / 2
  text(
    ctx,
    `φ = ${fmt(phaseDeg.value, 1)}°`,
    cx + (arcR + 22) * Math.cos(midAng),
    cy - (arcR + 22) * Math.sin(midAng),
    '#fbbf24',
    'bold 11px sans-serif',
    'center'
  )

  // 注記
  const stateNote = phaseDeg.value > 1 ? '誘導性（電流が遅れる）' : phaseDeg.value < -1 ? '容量性（電流が進む）' : '共振状態（同位相・力率1）'
  text(ctx, `状態: ${stateNote}`, 30, 395, '#38bdf8', 'bold 12px sans-serif')
}

// -------------------------------------------------------------------
// 描画: 右側リアルタイム波形（オシロスコープ）
// -------------------------------------------------------------------
function drawWaveform(ctx, w, h) {
  const gx0 = 380
  const gy0 = 210
  const gw = 360
  const gh = 140

  text(ctx, '【時間波形 v(t) & i(t)】', gx0, 40, '#e4e4e7', 'bold 13px sans-serif')

  // オシロスコープ外枠
  ctx.fillStyle = '#101014'
  ctx.strokeStyle = '#27272a'
  ctx.lineWidth = 1.5
  ctx.fillRect(gx0, gy0 - gh, gw, gh * 2)
  ctx.strokeRect(gx0, gy0 - gh, gw, gh * 2)

  // グリッド
  ctx.strokeStyle = 'rgba(63, 63, 70, 0.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 3])
  line(ctx, gx0, gy0, gx0 + gw, gy0, '#52525b', 1) // 中央基準線 0V/0A
  line(ctx, gx0, gy0 - gh / 2, gx0 + gw, gy0 - gh / 2, 'rgba(63, 63, 70, 0.25)', 1)
  line(ctx, gx0, gy0 + gh / 2, gx0 + gw, gy0 + gh / 2, 'rgba(63, 63, 70, 0.25)', 1)
  ctx.setLineDash([])

  // 波形描画: フェーザー回転角 currentAngle と左端の位相を完全同期
  const period = 1 / frequency.value
  const timeWindow = period * 2.5
  const currentAngle = (visualOmega.value * simTime) % (Math.PI * 2)
  const phaseOffset = currentAngle / omega.value

  // 1. 電圧波形 v(t) = V0 sin(omega*t) (赤)
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let px = 0; px <= gw; px += 2) {
    const t = phaseOffset + (px / gw) * timeWindow
    const valV = V0.value * Math.sin(omega.value * t)
    const y = gy0 - (valV / 35) * (gh * 0.8)
    if (px === 0) ctx.moveTo(gx0 + px, y)
    else ctx.lineTo(gx0 + px, y)
  }
  ctx.stroke()

  // 2. 電流波形 i(t) = I0 sin(omega*t - phi) (緑)
  ctx.strokeStyle = '#34d399'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let px = 0; px <= gw; px += 2) {
    const t = phaseOffset + (px / gw) * timeWindow
    const valI = I0.value * Math.sin(omega.value * t - phaseRad.value)
    // 電流を見やすくスケーリング
    const maxIDisplay = 1.5
    const y = gy0 - (valI / maxIDisplay) * (gh * 0.8)
    if (px === 0) ctx.moveTo(gx0 + px, y)
    else ctx.lineTo(gx0 + px, y)
  }
  ctx.stroke()

  // 凡例
  dot(ctx, gx0 + 20, gy0 - gh + 20, 5, '#f43f5e')
  text(ctx, '電圧 v(t) [V]', gx0 + 32, gy0 - gh + 24, '#f43f5e', 'bold 11px sans-serif')

  dot(ctx, gx0 + 130, gy0 - gh + 20, 5, '#34d399')
  text(ctx, '電流 i(t) [A]', gx0 + 142, gy0 - gh + 24, '#34d399', 'bold 11px sans-serif')

  text(ctx, `周期 T = ${fmt(period * 1000, 1)} ms`, gx0 + gw - 15, gy0 - gh + 24, '#a1a1aa', '11px sans-serif', 'right')

  // 回路図簡易アイコン (下部)
  drawMiniCircuit(ctx, gx0, 375, circuitType.value)
}

function drawMiniCircuit(ctx, x, y, type) {
  ctx.save()
  line(ctx, x, y, x + 340, y, '#52525b', 2)
  // 電源
  dot(ctx, x + 40, y, 12, '#18181b', '#f43f5e')
  text(ctx, '~', x + 40, y + 4, '#f43f5e', 'bold 16px sans-serif', 'center')
  text(ctx, '交流電源', x + 40, y + 24, '#a1a1aa', '10px sans-serif', 'center')

  // 抵抗 R
  ctx.fillStyle = '#27272a'
  ctx.fillRect(x + 110, y - 8, 35, 16)
  ctx.strokeRect(x + 110, y - 8, 35, 16)
  text(ctx, 'R', x + 127, y + 4, '#e4e4e7', 'bold 10px sans-serif', 'center')

  // コイル L
  dot(ctx, x + 195, y, 9, '#27272a', '#fbbf24')
  dot(ctx, x + 210, y, 9, '#27272a', '#fbbf24')
  text(ctx, 'L', x + 202, y + 24, '#fbbf24', 'bold 10px sans-serif', 'center')

  // コンデンサー C
  line(ctx, x + 270, y - 12, x + 270, y + 12, '#38bdf8', 3)
  line(ctx, x + 278, y - 12, x + 278, y + 12, '#38bdf8', 3)
  text(ctx, 'C', x + 274, y + 24, '#38bdf8', 'bold 10px sans-serif', 'center')
  ctx.restore()
}
</script>

<style scoped>
.ac-sim {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 18px;
  margin: 1.5rem 0;
  color: #f4f4f5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.sim-header {
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fafafa;
}

.badge {
  background: #27272a;
  border: 1px solid #3f3f46;
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: monospace;
}

.desc {
  font-size: 0.85rem;
  color: #a1a1aa;
  margin: 6px 0 0 0;
  line-height: 1.5;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.mode-tabs button {
  background: #27272a;
  color: #d4d4d8;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-tabs button:hover {
  background: #3f3f46;
  color: #fff;
}

.mode-tabs button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.canvas-wrap {
  width: 100%;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 780 / 420;
}

.controls-panel {
  background: #27272a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 0.8rem;
  color: #d4d4d8;
  display: flex;
  justify-content: space-between;
}

.control-group strong {
  color: #38bdf8;
}

.sub-info {
  font-size: 0.75rem;
  color: #71717a;
}

.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-group {
  justify-content: flex-end;
}

.resonance-btn {
  background: #f59e0b;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.2s;
}

.resonance-btn:hover {
  background: #fbbf24;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-card {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card .label {
  font-size: 0.72rem;
  color: #a1a1aa;
}

.stat-card .val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fafafa;
  font-family: monospace;
}

.stat-card .val.highlight {
  color: #38bdf8;
}

.stat-card .val.highlight-alt {
  color: #fbbf24;
}
</style>
