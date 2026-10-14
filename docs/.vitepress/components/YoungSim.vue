<template>
  <div class="lab" :style="{ '--ac': laserColorHex, '--ac2': '#38bdf8' }">
    <div class="lab-head">
      <span class="lab-title">🌈 光の干渉・ヤングの二重スリット実験室</span>
      <span class="lab-badge">波長 λ = {{ wavelengthNm }} nm（{{ laserColorName }}）</span>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>光の波長 λ: <strong>{{ wavelengthNm }} nm</strong></label>
        <input type="range" v-model.number="wavelengthNm" min="380" max="750" step="5" />
        <div class="lab-row" style="margin-top:4px">
          <button class="lab-chip" :class="{ on: wavelengthNm === 650 }" @click="wavelengthNm = 650">赤 (650nm)</button>
          <button class="lab-chip" :class="{ on: wavelengthNm === 532 }" @click="wavelengthNm = 532">緑 (532nm)</button>
          <button class="lab-chip" :class="{ on: wavelengthNm === 450 }" @click="wavelengthNm = 450">青 (450nm)</button>
          <button class="lab-chip" :class="{ on: wavelengthNm === 405 }" @click="wavelengthNm = 405">紫 (405nm)</button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>スリット間隔 d: <strong>{{ slitD_um }} μm</strong> ({{ (slitD_um * 1e-3).toFixed(3) }} mm)</label>
        <input type="range" v-model.number="slitD_um" min="100" max="600" step="20" />
        <div class="lab-note">スリットが狭いほど、明線の間隔 Δx は広がる（逆比例）</div>
      </div>

      <div class="lab-ctrl">
        <label>スリット〜スクリーン間距離 L: <strong>{{ distL_m.toFixed(2) }} m</strong></label>
        <input type="range" v-model.number="distL_m" min="0.8" max="2.5" step="0.1" />
        <div class="lab-note">距離が遠いほど、干渉縞は拡大する（比例）</div>
      </div>

      <div class="lab-ctrl">
        <label>発展実験：媒質 & 薄膜の挿入</label>
        <div class="lab-row">
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="inWater" /> 水中実験 (屈折率 n = 1.33)
          </label>
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="hasFilm" /> 上スリットに薄膜挿入 (厚さ 3μm, n=1.5)
          </label>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">明線間隔 Δx</div>
        <div class="v" :style="{ color: laserColorHex }">
          {{ deltaX_mm.toFixed(3) }} <small>mm</small>
        </div>
        <div class="f">Δx = Lλ / d（波長が長いほど広がる！）</div>
      </div>

      <div class="lab-stat">
        <div class="k">中央明線 (m = 0) の位置 x₀</div>
        <div class="v" style="color:#e2e8f0">{{ centerOffsetMm.toFixed(3) }} <small>mm</small></div>
        <div class="f">{{ hasFilm ? '薄膜による光路差で上方にシフト！' : '中心 x = 0 に位置' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">第1明線 (m = ±1) の位置 x₁</div>
        <div class="v" style="color:#38bdf8">±{{ deltaX_mm.toFixed(3) }} <small>mm</small></div>
        <div class="f">経路差 Δl = λ = {{ (effectiveLambdaNm).toFixed(0) }} nm</div>
      </div>

      <div class="lab-stat">
        <div class="k">媒質中の実効波長 λ'</div>
        <div class="v" style="color:#10b981">{{ effectiveLambdaNm.toFixed(0) }} <small>nm</small></div>
        <div class="f">{{ inWater ? '水中では波長が 1/n に縮小し縞が詰まる' : '真空中 / 空気中 (n ≈ 1.0)' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const wavelengthNm = ref(650) // nm
const slitD_um = ref(250) // μm
const distL_m = ref(1.5) // m
const inWater = ref(false)
const hasFilm = ref(false)

// 屈折率
const mediumIndex = computed(() => inWater.value ? 1.33 : 1.0)
const effectiveLambdaNm = computed(() => wavelengthNm.value / mediumIndex.value)

// 波長から光の色コードを計算
const laserColorHex = computed(() => {
  const w = wavelengthNm.value
  if (w >= 620) return '#ef4444' // 赤
  if (w >= 590) return '#f97316' // 橙
  if (w >= 570) return '#eab308' // 黄
  if (w >= 495) return '#22c55e' // 緑
  if (w >= 450) return '#3b82f6' // 青
  return '#a855f7' // 紫
})

const laserColorName = computed(() => {
  const w = wavelengthNm.value
  if (w >= 620) return '赤色光'
  if (w >= 590) return '橙色光'
  if (w >= 570) return '黄色光'
  if (w >= 495) return '緑色光'
  if (w >= 450) return '青色光'
  return '紫色光'
})

// 明線間隔 Δx = L * λ / d
// L [m], λ [m] = effLambda * 1e-9, d [m] = slitD * 1e-6
// Δx [m] = L * (effLambda * 1e-9) / (slitD * 1e-6) = (L * effLambda / slitD) * 1e-3 [m]
// Δx [mm] = (L * effLambda / slitD)
const deltaX_mm = computed(() => {
  return (distL_m.value * effectiveLambdaNm.value) / slitD_um.value
})

// 薄膜（厚さ t = 3 μm, 屈折率 n = 1.5）による光路差のシフト
// 光路差 = (n - 1) * t = (1.5 - 1.0) * 3 μm = 1.5 μm = 1500 nm
// シフト量 Δx_shift = L * (n - 1)t / d
const centerOffsetMm = computed(() => {
  if (!hasFilm.value) return 0
  const optDiffNm = (1.5 - 1.0) * 3000 // 1500 nm
  return (distL_m.value * optDiffNm) / slitD_um.value
})

const canvasRef = ref(null)
let animTime = 0

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)
  animTime += dt * 4.0

  const slitX = width * 0.28
  const screenX = width * 0.72
  const cy = height * 0.5

  // 1. レーザー入射光（左からスリットへ）
  drawLaserSource(ctx, slitX, cy)

  // 2. 二重スリット板
  drawSlitPlate(ctx, slitX, cy, height)

  // 3. スリットからスクリーンへの波の広がり（干渉波面）
  drawWaveFronts(ctx, slitX, screenX, cy)

  // 4. スクリーンと干渉縞（右側）
  drawScreenAndFringes(ctx, screenX, cy, width - screenX, height)
})

function drawLaserSource(ctx, slitX, cy) {
  // レーザー射出口
  ctx.fillStyle = '#334155'
  ctx.fillRect(20, cy - 16, 40, 32)
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2
  ctx.strokeRect(20, cy - 16, 40, 32)

  // レーザー光線束（平行光）
  const numBeams = 5
  for (let i = -numBeams; i <= numBeams; i++) {
    const y = cy + i * 8
    ctx.strokeStyle = laserColorHex.value
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(60, y)
    ctx.lineTo(slitX, y)
    ctx.stroke()
  }

  text(ctx, `単色レーザー (${wavelengthNm.value} nm)`, 40, cy - 25, { color: laserColorHex.value, font: 'bold 11px sans-serif' })
}

function drawSlitPlate(ctx, x, cy, h) {
  const slitSpacingPx = Math.min(60, Math.max(20, (slitD_um.value / 250) * 35))
  const s1Y = cy - slitSpacingPx / 2
  const s2Y = cy + slitSpacingPx / 2
  const slitWidth = 4

  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2

  // 上部遮光板
  ctx.fillRect(x - 4, 30, 8, s1Y - 30 - slitWidth / 2)
  ctx.strokeRect(x - 4, 30, 8, s1Y - 30 - slitWidth / 2)

  // 中央遮光板
  ctx.fillRect(x - 4, s1Y + slitWidth / 2, 8, s2Y - s1Y - slitWidth)
  ctx.strokeRect(x - 4, s1Y + slitWidth / 2, 8, s2Y - s1Y - slitWidth)

  // 下部遮光板
  ctx.fillRect(x - 4, s2Y + slitWidth / 2, 8, h - 30 - (s2Y + slitWidth / 2))
  ctx.strokeRect(x - 4, s2Y + slitWidth / 2, 8, h - 30 - (s2Y + slitWidth / 2))

  // スリットラベル S1, S2
  dot(ctx, x, s1Y, 3, '#fff')
  dot(ctx, x, s2Y, 3, '#fff')
  text(ctx, 'S₁', x - 14, s1Y - 4, { align: 'right', color: '#fff', font: 'bold 11px sans-serif' })
  text(ctx, 'S₂', x - 14, s2Y + 12, { align: 'right', color: '#fff', font: 'bold 11px sans-serif' })

  // スリット間隔 d の寸法線
  line(ctx, x + 12, s1Y, x + 12, s2Y, { color: '#38bdf8', width: 1.5 })
  line(ctx, x + 8, s1Y, x + 16, s1Y, { color: '#38bdf8', width: 1.5 })
  line(ctx, x + 8, s2Y, x + 16, s2Y, { color: '#38bdf8', width: 1.5 })
  text(ctx, `d`, x + 24, cy + 4, { color: '#38bdf8', font: 'bold 11px sans-serif' })

  // 薄膜の描画（上スリット S1 の前）
  if (hasFilm.value) {
    ctx.fillStyle = 'rgba(234, 179, 8, 0.45)'
    ctx.strokeStyle = '#eab308'
    ctx.lineWidth = 1.5
    ctx.fillRect(x + 2, s1Y - 10, 8, 20)
    ctx.strokeRect(x + 2, s1Y - 10, 8, 20)
    text(ctx, '薄膜', x + 6, s1Y - 16, { color: '#eab308', font: '10px sans-serif' })
  }
}

function drawWaveFronts(ctx, sx, scrX, cy) {
  const slitSpacingPx = Math.min(60, Math.max(20, (slitD_um.value / 250) * 35))
  const s1Y = cy - slitSpacingPx / 2
  const s2Y = cy + slitSpacingPx / 2

  ctx.save()
  // スリットから広がる球面波の波面（円弧）
  const numArcs = 7
  ctx.strokeStyle = laserColorHex.value
  ctx.lineWidth = 1.2

  for (let i = 1; i <= numArcs; i++) {
    const r = ((i * 35 + (animTime * 20) % 35))
    if (r > (scrX - sx)) continue

    const alpha = Math.max(0, 0.4 - (r / (scrX - sx)) * 0.3)
    ctx.globalAlpha = alpha

    // S1からの波
    ctx.beginPath()
    ctx.arc(sx, s1Y, r, -Math.PI * 0.35, Math.PI * 0.35)
    ctx.stroke()

    // S2からの波
    ctx.beginPath()
    ctx.arc(sx, s2Y, r, -Math.PI * 0.35, Math.PI * 0.35)
    ctx.stroke()
  }
  ctx.restore()

  // 距離 L の寸法線（下部）
  line(ctx, sx, cy + 120, scrX, cy + 120, { color: '#94a3b8', width: 1.5, dash: [4, 4] })
  line(ctx, sx, cy + 115, sx, cy + 125, { color: '#94a3b8', width: 1.5 })
  line(ctx, scrX, cy + 115, scrX, cy + 125, { color: '#94a3b8', width: 1.5 })
  text(ctx, `スクリーン間距離 L = ${distL_m.value.toFixed(2)} m`, (sx + scrX) / 2, cy + 138, { color: '#e2e8f0', font: '11px sans-serif' })
}

function drawScreenAndFringes(ctx, scrX, cy, availW, h) {
  // スクリーンの縦板
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2
  ctx.fillRect(scrX, 25, 12, h - 50)
  ctx.strokeRect(scrX, 25, 12, h - 50)

  text(ctx, 'スクリーン', scrX + 6, 16, { color: '#94a3b8', font: '11px sans-serif' })

  // 干渉縞パターン（スクリーン右側のビューイングエリア）
  const fringeW = Math.min(80, availW * 0.35)
  const fringeX = scrX + 24
  const fringeH = h - 60
  const topY = cy - fringeH / 2

  // 背景枠
  ctx.fillStyle = '#020617'
  ctx.fillRect(fringeX, topY, fringeW, fringeH)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.strokeRect(fringeX, topY, fringeW, fringeH)

  // 干渉縞の描画（光強度 I ∝ cos²(π Δx / fringeSpacing)）
  // 画面上の縞間隔ピクセル
  const pxPerMm = 12
  const fringeSpacingPx = Math.max(8, deltaX_mm.value * pxPerMm)
  const shiftPx = centerOffsetMm.value * pxPerMm

  // 1pxごとのスキャン描画
  for (let y = 0; y < fringeH; y++) {
    const py = topY + y
    const dyFromCenter = (py - (cy - shiftPx))
    const phase = (Math.PI * dyFromCenter) / fringeSpacingPx
    const intensity = Math.pow(Math.cos(phase), 2) // 0〜1

    ctx.fillStyle = laserColorHex.value
    ctx.globalAlpha = intensity * 0.95
    ctx.fillRect(fringeX, py, fringeW, 1)
  }
  ctx.globalAlpha = 1.0

  // 強度波形グラフ（右端）
  const graphX = fringeX + fringeW + 10
  const graphMaxW = Math.min(65, availW - fringeW - 45)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.beginPath()

  for (let y = 0; y < fringeH; y += 2) {
    const py = topY + y
    const dyFromCenter = (py - (cy - shiftPx))
    const phase = (Math.PI * dyFromCenter) / fringeSpacingPx
    const intensity = Math.pow(Math.cos(phase), 2)
    const gx = graphX + intensity * graphMaxW

    if (y === 0) ctx.moveTo(gx, py)
    else ctx.lineTo(gx, py)
  }
  ctx.stroke()

  text(ctx, '光強度分布 I(x)', graphX + 5, topY - 8, { align: 'left', color: '#38bdf8', font: '10px sans-serif' })

  // 明線位置の目盛りと次数ラベル m = 0, ±1, ±2
  for (let m = -3; m <= 3; m++) {
    const my = cy - shiftPx - m * fringeSpacingPx
    if (my < topY + 10 || my > topY + fringeH - 10) continue

    line(ctx, fringeX - 6, my, fringeX, my, { color: '#fff', width: 1.5 })
    text(ctx, m === 0 ? 'm=0 (明)' : `m=${m}`, fringeX - 8, my + 3, { align: 'right', color: m === 0 ? '#f59e0b' : '#94a3b8', font: '10px sans-serif' })
  }
}
</script>
