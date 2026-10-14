<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#f43f5e">
    <div class="lab-head">
      <span class="lab-title">⚡ クーロンの法則・電場と等電位線 実験室</span>
      <span class="lab-badge">2Dインタラクティブ電場マップ</span>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>左の電荷 Q₁: <strong>{{ q1 > 0 ? '+' + q1.toFixed(1) : q1.toFixed(1) }} μC</strong></label>
        <input type="range" v-model.number="q1" min="-5.0" max="5.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>右の電荷 Q₂: <strong>{{ q2 > 0 ? '+' + q2.toFixed(1) : q2.toFixed(1) }} μC</strong></label>
        <input type="range" v-model.number="q2" min="-5.0" max="5.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>表示設定</label>
        <div class="lab-row">
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="showLines" /> 電気力線
          </label>
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="showPotential" /> 等電位線
          </label>
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="showVectors" /> 電場ベクトル格子
          </label>
        </div>
      </div>
      <div class="lab-ctrl">
        <label>典型配置プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" @click="setPreset(3, -3)">電気双極子 (+3μC / -3μC)</button>
          <button class="lab-chip" @click="setPreset(3, 3)">同種電荷 (+3μC / +3μC)</button>
          <button class="lab-chip" @click="setPreset(4, -1)">非対称 (+4μC / -1μC)</button>
          <button class="lab-chip" @click="setPreset(4, 0)">単独点電荷 (+4μC)</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">クーロン力（2電荷間）</div>
        <div class="v" :style="{ color: q1 * q2 < 0 ? '#38bdf8' : '#f43f5e' }">
          {{ Math.abs(coulombForce).toFixed(3) }} <small>N</small>
        </div>
        <div class="f">{{ q1 * q2 < 0 ? '引力（引き合う）' : (q1 * q2 > 0 ? '斥力（反発する）' : '力なし') }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">2電荷の中心での電場 E</div>
        <div class="v" style="color:#e2e8f0">{{ midFieldMag.toExponential(2) }} <small>N/C</small></div>
        <div class="f">E = k·|Q|/r² のベクトル合成</div>
      </div>
      <div class="lab-stat">
        <div class="k">2電荷の中心での電位 V</div>
        <div class="v" style="color:#f59e0b">{{ midPotential.toExponential(2) }} <small>V</small></div>
        <div class="f">V = k·(Q₁/r₁ + Q₂/r₂)（スカラー和）</div>
      </div>
      <div class="lab-stat">
        <div class="k">電荷間距離 r</div>
        <div class="v">{{ distBetween.toFixed(2) }} <small>m</small></div>
        <div class="f">画面上の電荷を直接ドラッグ移動可能</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

// クーロン定数 k = 8.99 * 10^9 N·m²/C²
const kE = 8.98755e9

const q1 = ref(3.0) // μC
const q2 = ref(-3.0) // μC
const showLines = ref(true)
const showPotential = ref(true)
const showVectors = ref(false)

// 2つの電荷の座標（キャンバス中心からの相対座標、m単位）
const p1 = ref({ x: -0.6, y: 0 })
const p2 = ref({ x: 0.6, y: 0 })

function setPreset(c1, c2) {
  q1.value = c1
  q2.value = c2
  p1.value = { x: -0.6, y: 0 }
  p2.value = { x: 0.6, y: 0 }
}

const distBetween = computed(() => {
  const dx = p2.value.x - p1.value.x
  const dy = p2.value.y - p1.value.y
  return Math.max(0.1, Math.hypot(dx, dy))
})

const coulombForce = computed(() => {
  const r = distBetween.value
  const c1 = q1.value * 1e-6
  const c2 = q2.value * 1e-6
  return (kE * Math.abs(c1 * c2)) / (r * r)
})

// 中心点での電場と電位
const midStats = computed(() => {
  const mx = (p1.value.x + p2.value.x) / 2
  const my = (p1.value.y + p2.value.y) / 2
  const c1 = q1.value * 1e-6
  const c2 = q2.value * 1e-6

  // 電場ベクトル E1, E2
  const r1x = mx - p1.value.x
  const r1y = my - p1.value.y
  const d1 = Math.max(0.02, Math.hypot(r1x, r1y))
  const e1Mag = (kE * c1) / (d1 * d1 * d1)
  const e1x = e1Mag * r1x
  const e1y = e1Mag * r1y

  const r2x = mx - p2.value.x
  const r2y = my - p2.value.y
  const d2 = Math.max(0.02, Math.hypot(r2x, r2y))
  const e2Mag = (kE * c2) / (d2 * d2 * d2)
  const e2x = e2Mag * r2x
  const e2y = e2Mag * r2y

  const totalEx = e1x + e2x
  const totalEy = e1y + e2y
  const eMag = Math.hypot(totalEx, totalEy)

  // 電位 V (スカラー)
  const vTotal = (kE * c1) / d1 + (kE * c2) / d2

  return { eMag, vTotal }
})

const midFieldMag = computed(() => midStats.value.eMag)
const midPotential = computed(() => midStats.value.vTotal)

const canvasRef = ref(null)

// マウスドラッグ処理
let dragging = null // 'q1' or 'q2'
let scale = 160 // 1mあたりのピクセル数

function getCoords(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 2
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const x = (clientX - rect.left - cx) / scale
  const y = (clientY - rect.top - cy) / scale
  return { x, y }
}

function onDown(e) {
  if (!canvasRef.value) return
  const { x, y } = getCoords(e)
  const d1 = Math.hypot(x - p1.value.x, y - p1.value.y)
  const d2 = Math.hypot(x - p2.value.x, y - p2.value.y)
  if (d1 < 0.2) dragging = 'q1'
  else if (d2 < 0.2) dragging = 'q2'
}

function onMove(e) {
  if (!dragging || !canvasRef.value) return
  const { x, y } = getCoords(e)
  // 画面枠内に制限
  const limX = canvasRef.value.width / (2 * scale) - 0.2
  const limY = canvasRef.value.height / (2 * scale) - 0.2
  const clampedX = Math.max(-limX, Math.min(limX, x))
  const clampedY = Math.max(-limY, Math.min(limY, y))

  if (dragging === 'q1') {
    p1.value = { x: clampedX, y: clampedY }
  } else if (dragging === 'q2') {
    p2.value = { x: clampedX, y: clampedY }
  }
}

function onUp() {
  dragging = null
}

onMounted(() => {
  const cv = canvasRef.value
  if (!cv) return
  cv.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  cv.addEventListener('touchstart', onDown, { passive: true })
  window.addEventListener('touchmove', onMove, { passive: true })
  window.addEventListener('touchend', onUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onUp)
})

// 電場ベクトル計算 (x, y) における E_x, E_y
function calcField(x, y) {
  const c1 = q1.value * 1e-6
  const c2 = q2.value * 1e-6
  let ex = 0
  let ey = 0

  if (c1 !== 0) {
    const rx = x - p1.value.x
    const ry = y - p1.value.y
    const r = Math.hypot(rx, ry)
    if (r > 0.04) {
      const f = (kE * c1) / (r * r * r)
      ex += f * rx
      ey += f * ry
    }
  }

  if (c2 !== 0) {
    const rx = x - p2.value.x
    const ry = y - p2.value.y
    const r = Math.hypot(rx, ry)
    if (r > 0.04) {
      const f = (kE * c2) / (r * r * r)
      ex += f * rx
      ey += f * ry
    }
  }

  return { ex, ey }
}

// 電位計算 (x, y) における V
function calcPotential(x, y) {
  const c1 = q1.value * 1e-6
  const c2 = q2.value * 1e-6
  let v = 0

  if (c1 !== 0) {
    const r = Math.hypot(x - p1.value.x, y - p1.value.y)
    v += (kE * c1) / Math.max(0.04, r)
  }
  if (c2 !== 0) {
    const r = Math.hypot(x - p2.value.x, y - p2.value.y)
    v += (kE * c2) / Math.max(0.04, r)
  }
  return v
}

useLoop(canvasRef, ({ ctx, width, height }) => {
  clearGrid(ctx, width, height, 40)
  const cx = width / 2
  const cy = height / 2

  scale = Math.min(width, height) / 3.0 // 動的スケール調整

  // 1. 等電位線（等電位リング / コンターマップ）
  if (showPotential.value) {
    drawEquipotential(ctx, cx, cy, width, height)
  }

  // 2. 電場ベクトル格子
  if (showVectors.value) {
    drawVectorGrid(ctx, cx, cy, width, height)
  }

  // 3. 電気力線
  if (showLines.value) {
    drawFieldLines(ctx, cx, cy, width, height)
  }

  // 4. 電荷本体の描画
  drawCharge(ctx, cx, cy, p1.value, q1.value, 'Q₁')
  drawCharge(ctx, cx, cy, p2.value, q2.value, 'Q₂')

  // ドラッグ案内テキスト
  text(ctx, '💡 電荷を直接ドラッグして位置を移動できます', cx, height - 15, { color: '#94a3b8', font: '11px sans-serif' })
})

// 等電位線の描画（簡易サンプリング輪郭線）
function drawEquipotential(ctx, cx, cy, w, h) {
  // 代表的な電位値（kV単位）の等高線
  const testLevels = [-60, -40, -25, -15, -8, -4, 0, 4, 8, 15, 25, 40, 60]
  const step = 20
  ctx.save()
  ctx.lineWidth = 1
  ctx.setLineDash([2, 4])

  // 各ピクセルグリッドで簡易マーチングスクエア風に点打ちまたは近傍描画
  for (let py = 10; py < h; py += step) {
    for (let px = 10; px < w; px += step) {
      const x = (px - cx) / scale
      const y = (py - cy) / scale
      const potKV = calcPotential(x, y) / 1000

      // 最も近いレベルとの差をみる
      for (const lvl of testLevels) {
        if (Math.abs(potKV - lvl) < (Math.abs(lvl) * 0.15 + 1.2)) {
          ctx.fillStyle = lvl > 0 ? 'rgba(244, 63, 94, 0.25)' : (lvl < 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.25)')
          ctx.beginPath()
          ctx.arc(px, py, 1.8, 0, Math.PI * 2)
          ctx.fill()
          break
        }
      }
    }
  }
  ctx.restore()
}

// ベクトル格子描画
function drawVectorGrid(ctx, cx, cy, w, h) {
  const step = 45
  for (let py = 25; py < h; py += step) {
    for (let px = 25; px < w; px += step) {
      const x = (px - cx) / scale
      const y = (py - cy) / scale
      const { ex, ey } = calcField(x, y)
      const mag = Math.hypot(ex, ey)
      if (mag < 1e3 || mag > 1e9) continue

      const len = Math.min(22, Math.max(8, Math.log10(mag) * 3))
      const angle = Math.atan2(ey, ex)
      const tx = px + Math.cos(angle) * len
      const ty = py + Math.sin(angle) * len

      arrow(ctx, px, py, tx, ty, { color: 'rgba(148, 163, 184, 0.45)', width: 1.5, head: 5 })
    }
  }
}

// 電気力線の描画（オイラー線素追跡）
function drawFieldLines(ctx, cx, cy, w, h) {
  // 正電荷から出る線、あるいは負電荷へ入る線を生成
  const charges = [
    { p: p1.value, q: q1.value },
    { p: p2.value, q: q2.value }
  ]

  charges.forEach(({ p, q }) => {
    if (Math.abs(q) < 0.1) return
    const numLines = Math.min(24, Math.max(8, Math.round(Math.abs(q) * 4)))
    const isPositive = q > 0
    const sign = isPositive ? 1 : -1
    const rStart = 0.08

    for (let i = 0; i < numLines; i++) {
      const th = (i / numLines) * Math.PI * 2
      let curX = p.x + Math.cos(th) * rStart
      let curY = p.y + Math.sin(th) * rStart

      ctx.beginPath()
      ctx.moveTo(cx + curX * scale, cy + curY * scale)

      const dt = 0.015 * sign
      let alive = true
      let steps = 0

      while (alive && steps < 120) {
        steps++
        const { ex, ey } = calcField(curX, curY)
        const mag = Math.hypot(ex, ey)
        if (mag < 1e2 || !isFinite(mag)) break

        const dx = (ex / mag) * dt
        const dy = (ey / mag) * dt
        curX += dx
        curY += dy

        const scrX = cx + curX * scale
        const scrY = cy + curY * scale
        ctx.lineTo(scrX, scrY)

        // 画面外または他の電荷に近づきすぎたら終了
        if (scrX < -20 || scrX > w + 20 || scrY < -20 || scrY > h + 20) break
        const dOther1 = Math.hypot(curX - p1.value.x, curY - p1.value.y)
        const dOther2 = Math.hypot(curX - p2.value.x, curY - p2.value.y)
        if (dOther1 < 0.06 || dOther2 < 0.06) break
      }

      ctx.strokeStyle = isPositive ? 'rgba(244, 63, 94, 0.65)' : 'rgba(56, 189, 248, 0.65)'
      ctx.lineWidth = 1.6
      ctx.stroke()
    }
  })
}

// 電荷の描画
function drawCharge(ctx, cx, cy, p, q, label) {
  const scrX = cx + p.x * scale
  const scrY = cy + p.y * scale
  const isPos = q > 0
  const isZero = Math.abs(q) < 0.1
  const color = isZero ? '#64748b' : (isPos ? '#f43f5e' : '#38bdf8')
  const radius = Math.min(26, Math.max(14, 12 + Math.abs(q) * 2))

  // 発光ハロー
  ctx.save()
  ctx.beginPath()
  ctx.arc(scrX, scrY, radius + 8, 0, Math.PI * 2)
  ctx.fillStyle = isZero ? 'transparent' : (isPos ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)')
  ctx.fill()

  // 球体本体
  dot(ctx, scrX, scrY, radius, color, '#fff', 2)

  // 符号テキスト
  const signText = isZero ? '0' : (isPos ? `+${q.toFixed(1)}` : `${q.toFixed(1)}`)
  text(ctx, signText, scrX, scrY - 2, { color: '#fff', font: 'bold 12px sans-serif' })
  text(ctx, `${label} (μC)`, scrX, scrY + radius + 14, { color, font: 'bold 11px sans-serif' })

  ctx.restore()
}
</script>
