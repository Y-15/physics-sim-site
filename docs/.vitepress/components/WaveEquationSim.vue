<template>
  <div class="lab" style="--ac:#06b6d4;--ac2:#f59e0b">
    <div class="lab-head">
      <span class="lab-title">🌊 波の式とグラフ（y-xグラフとy-tグラフ）実験室</span>
      <span class="lab-badge">波の進行速度 v = {{ waveSpeed.toFixed(1) }} m/s ({{ direction > 0 ? '+x方向' : '-x方向' }})</span>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>着目点（観測位置） x₀: <strong>{{ observeX.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="observeX" min="0.0" max="6.0" step="0.2" />
        <div class="lab-note">上段の y-x グラフ上の赤丸の位置。この点の上下振動が下段の y-t グラフになる！</div>
      </div>

      <div class="lab-ctrl">
        <label>波長 λ: <strong>{{ wavelength.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="wavelength" min="1.5" max="4.5" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>周期 T: <strong>{{ periodT.toFixed(1) }} s</strong> (振動数 f = {{ (1/periodT).toFixed(2) }} Hz)</label>
        <input type="range" v-model.number="periodT" min="1.0" max="4.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>振幅 A: <strong>{{ amplitude.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="amplitude" min="0.5" max="2.0" step="0.1" />
      </div>

      <div class="lab-ctrl">
        <label>波の進行方向</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: direction === 1 }" @click="direction = 1">➡️ +x 方向へ進行 (t/T - x/λ)</button>
          <button class="lab-chip" :class="{ on: direction === -1 }" @click="direction = -1">⬅️ -x 方向へ進行 (t/T + x/λ)</button>
          <button class="lab-btn" @click="animRunning = !animRunning">{{ animRunning ? '⏸️ 一時停止' : '▶️ 再生' }}</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">波の基本関係式</div>
        <div class="v" style="font-size:17px;color:#06b6d4">v = fλ = <span class="frac"><span class="num">λ</span><span class="den">T</span></span></div>
        <div class="f">速さ v = <span class="frac"><span class="num">{{ wavelength.toFixed(1) }}</span><span class="den">{{ periodT.toFixed(1) }}</span></span> = {{ waveSpeed.toFixed(2) }} m/s</div>
      </div>

      <div class="lab-stat">
        <div class="k">観測点 x₀ での変位 y</div>
        <div class="v" style="color:#ef4444">{{ curObsY.toFixed(2) }} <small>m</small></div>
        <div class="f">y = A sin 2π<span class="math-parens">(</span><span class="frac"><span class="num">t</span><span class="den">T</span></span> ∓ <span class="frac"><span class="num">x₀</span><span class="den">λ</span></span><span class="math-parens">)</span></div>
      </div>

      <div class="lab-stat">
        <div class="k">観測点 x₀ の媒質の速度 v_y</div>
        <div class="v" :style="{ color: curObsVy >= 0 ? '#10b981' : '#f59e0b' }">
          {{ curObsVy.toFixed(2) }} <small>m/s</small>
        </div>
        <div class="f">{{ curObsVy > 0.05 ? '上向きに運動中 ↑' : (curObsVy < -0.05 ? '下向きに運動中 ↓' : '折り返し点 (速度0)') }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">波の式（一般形）</div>
        <div class="v" style="font-size:14px;color:#e2e8f0;display:inline-flex;align-items:center;gap:3px">
          y = {{ amplitude.toFixed(1) }} sin 2π<span class="math-parens">(</span><span class="frac"><span class="num">t</span><span class="den">{{ periodT.toFixed(1) }}</span></span> {{ direction > 0 ? '−' : '+' }} <span class="frac"><span class="num">x</span><span class="den">{{ wavelength.toFixed(1) }}</span></span><span class="math-parens">)</span>
        </div>
        <div class="f">{{ direction > 0 ? '+x方向進行は「引く」' : '-x方向進行は「足す」' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const observeX = ref(2.0) // m
const wavelength = ref(3.0) // m
const periodT = ref(2.0) // s
const amplitude = ref(1.2) // m
const direction = ref(1) // 1: +x, -1: -x
const animRunning = ref(true)

const waveSpeed = computed(() => wavelength.value / periodT.value)

const curTime = ref(0)

// 観測点 x0 における現在の y と速度 vy
const curObsY = computed(() => {
  const phase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (observeX.value / wavelength.value))
  return amplitude.value * Math.sin(phase)
})

const curObsVy = computed(() => {
  const omega = (2 * Math.PI) / periodT.value
  const phase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (observeX.value / wavelength.value))
  return amplitude.value * omega * Math.cos(phase)
})

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)
  if (animRunning.value) {
    curTime.value += dt
  }

  const splitY = height * 0.48

  // 1. 上段：y-x グラフ（空間波形・写真）
  drawYXGraph(ctx, 0, 0, width, splitY)

  // 2. 下段：y-t グラフ（時間変化・特定地点 x0 のビデオ）
  drawYTGraph(ctx, 0, splitY, width, height - splitY)
})

function drawYXGraph(ctx, ox, oy, w, h) {
  const padL = 60
  const padR = 40
  const padT = 30
  const padB = 25
  const gx = ox + padL
  const gy = oy + h / 2
  const gw = w - padL - padR
  const gh = (h - padT - padB) / 2

  // タイトル
  text(ctx, '📷 y-x グラフ（ある瞬間の空間全体の写真）', gx + 8, oy + 18, { align: 'left', color: '#06b6d4', font: 'bold 12px sans-serif' })
  text(ctx, `時刻 t = ${curTime.value.toFixed(2)} s`, ox + w - 20, oy + 18, { align: 'right', color: '#94a3b8', font: '11px sans-serif' })

  // 軸
  line(ctx, gx, gy, gx + gw, gy, { color: '#64748b', width: 1.5 }) // x軸
  line(ctx, gx, oy + padT, gx, oy + h - padB, { color: '#64748b', width: 1.5 }) // y軸
  text(ctx, '位置 x [m] →', gx + gw - 10, gy + 16, { align: 'right', color: '#94a3b8', font: '10px sans-serif' })
  text(ctx, '↑ 変位 y [m]', gx - 6, oy + padT + 6, { align: 'right', color: '#94a3b8', font: '10px sans-serif' })

  // スケール: x 0〜7m, y -2〜+2m
  const xMax = 7.0
  const pxPerM = gw / xMax
  const pyPerM = gh / 2.2

  // 波形曲線描画
  ctx.strokeStyle = '#06b6d4'
  ctx.lineWidth = 2.5
  ctx.beginPath()

  for (let px = 0; px <= gw; px += 2) {
    const xm = px / pxPerM
    const phase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (xm / wavelength.value))
    const ym = amplitude.value * Math.sin(phase)
    const sy = gy - ym * pyPerM

    if (px === 0) ctx.moveTo(gx + px, sy)
    else ctx.lineTo(gx + px, sy)
  }
  ctx.stroke()

  // 少し先の時刻 (t + dt) の波形を薄い点線で描画（媒質速度の直感理解）
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 1.2
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  const aheadDt = 0.15
  for (let px = 0; px <= gw; px += 2) {
    const xm = px / pxPerM
    const phase = 2 * Math.PI * ((curTime.value + aheadDt) / periodT.value - direction.value * (xm / wavelength.value))
    const ym = amplitude.value * Math.sin(phase)
    const sy = gy - ym * pyPerM
    if (px === 0) ctx.moveTo(gx + px, sy)
    else ctx.lineTo(gx + px, sy)
  }
  ctx.stroke()
  ctx.restore()

  // 波の進行方向矢印
  const arrY = gy - amplitude.value * pyPerM - 12
  if (direction.value > 0) {
    arrow(ctx, gx + 60, arrY, gx + 140, arrY, { color: '#06b6d4', width: 2, head: 6 })
    text(ctx, `進行速度 v = ${waveSpeed.value.toFixed(1)}m/s →`, gx + 150, arrY + 4, { align: 'left', color: '#06b6d4', font: '10px sans-serif' })
  } else {
    arrow(ctx, gx + 140, arrY, gx + 60, arrY, { color: '#06b6d4', width: 2, head: 6 })
    text(ctx, `← 進行速度 v = ${waveSpeed.value.toFixed(1)}m/s`, gx + 50, arrY + 4, { align: 'right', color: '#06b6d4', font: '10px sans-serif' })
  }

  // 観測点 x0 のプロット
  const obsPx = gx + observeX.value * pxPerM
  const obsPhase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (observeX.value / wavelength.value))
  const obsYm = amplitude.value * Math.sin(obsPhase)
  const obsPy = gy - obsYm * pyPerM

  // x0 の縦点線
  line(ctx, obsPx, oy + padT, obsPx, oy + h - padB, { color: 'rgba(239, 68, 68, 0.45)', width: 1.5, dash: [3, 3] })

  // 媒質の速度ベクトル矢印 (vy)
  if (Math.abs(curObsVy.value) > 0.05) {
    const vLen = (curObsVy.value / 3.0) * 35
    arrow(ctx, obsPx, obsPy, obsPx, obsPy - vLen, { color: '#10b981', width: 2.5, head: 6 })
    text(ctx, `v_y`, obsPx + 8, obsPy - vLen / 2, { align: 'left', color: '#10b981', font: 'bold 11px sans-serif' })
  }

  // 赤い観測点ボール
  dot(ctx, obsPx, obsPy, 7, '#ef4444', '#fff', 2)
  text(ctx, `着目点 x₀ = ${observeX.value.toFixed(1)}m`, obsPx, oy + h - padB + 16, { align: 'center', color: '#ef4444', font: 'bold 11px sans-serif' })
}

function drawYTGraph(ctx, ox, oy, w, h) {
  const padL = 60
  const padR = 40
  const padT = 30
  const padB = 25
  const gx = ox + padL
  const gy = oy + h / 2
  const gw = w - padL - padR
  const gh = (h - padT - padB) / 2

  // タイトル
  text(ctx, `📹 y-t グラフ（位置 x₀ = ${observeX.value.toFixed(1)}m の媒質粒子の時間変化・ビデオ）`, gx + 8, oy + 18, { align: 'left', color: '#f59e0b', font: 'bold 12px sans-serif' })

  // 軸
  line(ctx, gx, gy, gx + gw, gy, { color: '#64748b', width: 1.5 }) // t軸
  line(ctx, gx, oy + padT, gx, oy + h - padB, { color: '#64748b', width: 1.5 }) // y軸
  text(ctx, '時刻 t [s] →', gx + gw - 12, gy + 16, { align: 'right', color: '#94a3b8', font: '10px sans-serif' })
  text(ctx, '↑ 変位 y [m]', gx - 6, oy + padT + 6, { align: 'right', color: '#94a3b8', font: '10px sans-serif' })

  // スケール: t 過去 6秒間〜現在
  const tSpan = 6.0
  const pxPerS = gw / tSpan
  const pyPerM = gh / 2.2

  // y-t 曲線描画 (t = curTime - tSpan 〜 curTime)
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2.5
  ctx.beginPath()

  for (let pt = 0; pt <= gw; pt += 2) {
    const tVal = (curTime.value - tSpan) + (pt / pxPerS)
    const phase = 2 * Math.PI * (tVal / periodT.value - direction.value * (observeX.value / wavelength.value))
    const ym = amplitude.value * Math.sin(phase)
    const sy = gy - ym * pyPerM

    if (pt === 0) ctx.moveTo(gx + pt, sy)
    else ctx.lineTo(gx + pt, sy)
  }
  ctx.stroke()

  // 現在時刻 t の先端点（一番右側）
  const curPtX = gx + gw
  const curPhase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (observeX.value / wavelength.value))
  const curYm = amplitude.value * Math.sin(curPhase)
  const curPtY = gy - curYm * pyPerM

  dot(ctx, curPtX, curPtY, 6, '#ef4444', '#fff', 2)
  text(ctx, `現在 (y = ${curYm.toFixed(2)}m)`, ox + w - 20, oy + 18, { align: 'right', color: '#ef4444', font: 'bold 11px sans-serif' })

  // 周期 T の寸法線
  const tPx = periodT.value * pxPerS
  if (tPx < gw * 0.7) {
    const refX1 = gx + gw - tPx
    const refX2 = gx + gw
    const refY = gy + amplitude.value * pyPerM + 12
    line(ctx, refX1, refY, refX2, refY, { color: '#38bdf8', width: 1.5 })
    line(ctx, refX1, refY - 4, refX1, refY + 4, { color: '#38bdf8', width: 1.5 })
    line(ctx, refX2, refY - 4, refX2, refY + 4, { color: '#38bdf8', width: 1.5 })
    text(ctx, `周期 T = ${periodT.value.toFixed(1)}s`, (refX1 + refX2) / 2, refY + 14, { align: 'center', color: '#38bdf8', font: '10px sans-serif' })
  }
}
</script>
