<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧲</span>
        <h3>3D 電磁力と平行電流間に働く力シミュレーター</h3>
      </div>
      <p class="subtitle">
        電流の周囲を右ねじの法則で回転する立体磁場リングと、相手導線に働く磁場ベクトル（<strong style="color:#10b981">B₁, B₂</strong>）・電磁力（<strong style="color:#ec4899">F₁, F₂</strong>）を3D透視図でリアルタイム観察できます。視点角度もドラッグ・スライダーで調整可能です。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas
        ref="canvasRef"
        width="740"
        height="400"
        @mousedown="onPointerDown"
        @mousemove="onPointerMove"
        @mouseup="onPointerUp"
        @mouseleave="onPointerUp"
        style="cursor: grab;"
      ></canvas>
      <div class="force-badge" :class="isAttractive ? 'attract' : 'repel'">
        <span>{{ isAttractive ? '🤝 引力（引き合う）' : '💥 斥力（反発する）' }}</span>
      </div>
      <div class="view-hint-badge">🖱️ ドラッグで3D視点回転</div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>導線1の電流 <i>I</i><sub>1</sub>: <strong style="color:#38bdf8">{{ current1 }} A</strong> ({{ dir1 > 0 ? '上向き ↑' : '下向き ↓' }})</span>
            <input type="range" v-model.number="current1" min="1" max="20" step="1" />
            <div class="btn-group mt-2">
              <button class="select-btn" :class="{ active: dir1 > 0 }" @click="dir1 = 1">上向き ↑</button>
              <button class="select-btn" :class="{ active: dir1 < 0 }" @click="dir1 = -1">下向き ↓</button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>導線2の電流 <i>I</i><sub>2</sub>: <strong style="color:#fbbf24">{{ current2 }} A</strong> ({{ dir2 > 0 ? '上向き ↑' : '下向き ↓' }})</span>
            <input type="range" v-model.number="current2" min="1" max="20" step="1" />
            <div class="btn-group mt-2">
              <button class="select-btn" :class="{ active: dir2 > 0 }" @click="dir2 = 1">上向き ↑</button>
              <button class="select-btn" :class="{ active: dir2 < 0 }" @click="dir2 = -1">下向き ↓</button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>導線間の距離 <i>r</i>: <strong>{{ distanceCm }} cm</strong></span>
            <input type="range" v-model.number="distanceCm" min="4" max="25" step="1" />
          </label>
          <label class="mt-2">
            <span>3D視点（見下ろし角）: <strong>{{ viewPitchDeg }}°</strong></span>
            <input type="range" v-model.number="viewPitchDeg" min="10" max="55" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>右ねじ磁場リングの表示:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: showFieldLines }" @click="showFieldLines = !showFieldLines">
                {{ showFieldLines ? '3D磁場リング 表示中' : '3D磁場リング 非表示' }}
              </button>
            </div>
          </label>
          <label class="mt-2">
            <span>3D視点（左右回転）: <strong>{{ viewYawDeg }}°</strong></span>
            <input type="range" v-model.number="viewYawDeg" min="-40" max="40" step="1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定・視点に戻す (10A / 10A / 10cm)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">単位長さあたりの力 <i>f</i></span>
        <span class="value highlight">{{ forceMicroN.toFixed(2) }} <span class="unit">µN/m</span></span>
        <span class="subtext">f = <i>μ</i><sub>0</sub> <i>I</i><sub>1</sub> <i>I</i><sub>2</sub> / 2π r</span>
      </div>

      <div class="stat-card">
        <span class="label">導線2の位置での磁場 <i>B</i><sub>1</sub></span>
        <span class="value">{{ field1MicroT.toFixed(2) }} <span class="unit">µT</span></span>
        <span class="subtext">向き: {{ dir1 > 0 ? '奥向き (⊗)' : '手前向き (⊙)' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">導線1の位置での磁場 <i>B</i><sub>2</sub></span>
        <span class="value">{{ field2MicroT.toFixed(2) }} <span class="unit">µT</span></span>
        <span class="subtext">向き: {{ dir2 > 0 ? '手前向き (⊙)' : '奥向き (⊗)' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">作用・反作用の法則</span>
        <span class="value"><i>F</i><sub>1</sub> = −<i>F</i><sub>2</sub></span>
        <span class="subtext">{{ isAttractive ? '同方向電流 → 引力' : '逆方向電流 → 斥力' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const current1 = ref(10) // A
const dir1 = ref(1)      // 1: 上向き, -1: 下向き
const current2 = ref(10) // A
const dir2 = ref(1)      // 1: 上向き, -1: 下向き
const distanceCm = ref(10) // cm
const showFieldLines = ref(true)
const viewPitchDeg = ref(26) // 見下ろし角（°）
const viewYawDeg = ref(-14)  // 左右角度（°）

const isAttractive = computed(() => dir1.value * dir2.value > 0)

const forceMicroN = computed(() => {
  const rM = distanceCm.value * 0.01
  const f = (2e-7 * current1.value * current2.value) / rM
  return f * 1e6 // µN/m
})

const field1MicroT = computed(() => {
  const rM = distanceCm.value * 0.01
  return ((2e-7 * current1.value) / rM) * 1e6 // µT
})

const field2MicroT = computed(() => {
  const rM = distanceCm.value * 0.01
  return ((2e-7 * current2.value) / rM) * 1e6 // µT
})

const resetDefaults = () => {
  current1.value = 10
  dir1.value = 1
  current2.value = 10
  dir2.value = 1
  distanceCm.value = 10
  viewPitchDeg.value = 26
  viewYawDeg.value = -14
}

// マウスドラッグでの3D視点回転
let isDragging = false
let lastMouseX = 0
let lastMouseY = 0

function onPointerDown(e) {
  isDragging = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}
function onPointerMove(e) {
  if (!isDragging) return
  const dx = e.clientX - lastMouseX
  const dy = e.clientY - lastMouseY
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  viewYawDeg.value = Math.max(-45, Math.min(45, Math.round(viewYawDeg.value + dx * 0.35)))
  viewPitchDeg.value = Math.max(8, Math.min(60, Math.round(viewPitchDeg.value + dy * 0.35)))
}
function onPointerUp() {
  isDragging = false
}

// 3D透視投影ヘルパー（右手座標系：X右, Y上, Z手前）
function makeProjector(cx, cy, yawDeg, pitchDeg) {
  const yaw = (yawDeg * Math.PI) / 180
  const pitch = (pitchDeg * Math.PI) / 180
  const cyaw = Math.cos(yaw), syaw = Math.sin(yaw)
  const cpitch = Math.cos(pitch), spitch = Math.sin(pitch)
  const camDist = 720

  return function project(wx, wy, wz) {
    const x1 = wx * cyaw - wz * syaw
    const z1 = wx * syaw + wz * cyaw
    const y2 = wy * cpitch - z1 * spitch
    const z2 = wy * spitch + z1 * cpitch
    const persp = camDist / Math.max(120, camDist - z2)
    return {
      sx: cx + x1 * persp,
      sy: cy - y2 * persp,
      depth: z2,
      scale: persp
    }
  }
}

let animId = null
let animTime = 0

function drawArrowHead2D(ctx, x1, y1, x2, y2, size, color) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 1) return
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux

  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - ux * size + px * size * 0.45, y2 - uy * size + py * size * 0.45)
  ctx.lineTo(x2 - ux * size - px * size * 0.45, y2 - uy * size - py * size * 0.45)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function draw3DArrow(ctx, proj, pStart, pEnd, color, width = 3, headSize = 11, label = '', labelOffset = { x: 0, y: -12 }, dashed = false) {
  const a = proj(pStart.x, pStart.y, pStart.z)
  const b = proj(pEnd.x, pEnd.y, pEnd.z)

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  if (dashed) ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(a.sx, a.sy)
  ctx.lineTo(b.sx, b.sy)
  ctx.stroke()
  ctx.setLineDash([])

  drawArrowHead2D(ctx, a.sx, a.sy, b.sx, b.sy, headSize * b.scale, color)

  if (label) {
    ctx.fillStyle = color
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, b.sx + labelOffset.x, b.sy + labelOffset.y)
  }
  ctx.restore()
}

// 導線1本の3D水平磁場リングを描画（カメラから見て導線中心より奥側なら backHalf=true、手前側なら backHalf=false）
function drawWireRingsLayer(ctx, proj, wireX, dir, currentAmp, yLevels, radii, colorRgb, backHalf) {
  const steps = 64
  const dPhiSign = dir > 0 ? -1 : 1 // 上向き電流(+Y): φ減少方向が右ねじ（手前で右、右側で奥）
  const phase = (animTime * 0.9 * dPhiSign) % (Math.PI * 2)

  for (const wy of yLevels) {
    const wireDepth = proj(wireX, wy, 0).depth

    radii.forEach((R, rIdx) => {
      const alpha = backHalf ? (0.34 - rIdx * 0.08) : (0.85 - rIdx * 0.16)
      const strokeCol = `rgba(${colorRgb}, ${Math.max(0.15, alpha)})`
      const arrowCol = `rgba(${colorRgb}, ${backHalf ? 0.5 : 0.98})`

      // 点群を計算
      const pts = []
      for (let i = 0; i <= steps; i++) {
        const phi = (i / steps) * Math.PI * 2
        const wx = wireX + R * Math.cos(phi)
        const wz = R * Math.sin(phi)
        const p = proj(wx, wy, wz)
        pts.push({ ...p, phi })
      }

      // 奥側 / 手前側 をカメラ基準深度で判定してセグメント描画
      ctx.save()
      ctx.strokeStyle = strokeCol
      ctx.lineWidth = backHalf ? 1.5 : 2.3
      if (backHalf) ctx.setLineDash([4, 4])

      for (let i = 0; i < steps; i++) {
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const isBackSeg = ((p1.depth + p2.depth) * 0.5) < wireDepth
        if (isBackSeg !== backHalf) continue

        ctx.beginPath()
        ctx.moveTo(p1.sx, p1.sy)
        ctx.lineTo(p2.sx, p2.sy)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // 接線方向の矢印ヘッド（奥側と手前側の代表的な角度に配置して右ねじの向きを明示）
      const arrowAngles = [Math.PI * 0.5, 0.12, Math.PI - 0.12, Math.PI * 1.5]
      arrowAngles.forEach((phiA, aIdx) => {
        if (rIdx === 0 && (aIdx === 1 || aIdx === 2)) return
        const wx = wireX + R * Math.cos(phiA)
        const wz = R * Math.sin(phiA)
        const pTail = proj(wx, wy, wz)
        const isBack = pTail.depth < wireDepth
        if (isBack !== backHalf) return

        const dPhi = 0.14 * dPhiSign
        const pTip = proj(
          wireX + R * Math.cos(phiA + dPhi),
          wy,
          R * Math.sin(phiA + dPhi)
        )
        drawArrowHead2D(ctx, pTail.sx, pTail.sy, pTip.sx, pTip.sy, (backHalf ? 8 : 10) * pTip.scale, arrowCol)
      })

      // 磁場リング上を流れるアニメーション光点
      const pulseCount = 2
      for (let k = 0; k < pulseCount; k++) {
        const phiP = ((phase + (k * Math.PI * 2) / pulseCount) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        const pt = proj(wireX + R * Math.cos(phiP), wy, R * Math.sin(phiP))
        const isBack = pt.depth < wireDepth
        if (isBack !== backHalf) continue
        ctx.fillStyle = backHalf ? `rgba(${colorRgb}, 0.45)` : '#ffffff'
        ctx.beginPath()
        ctx.arc(pt.sx, pt.sy, (backHalf ? 2.2 : 3.2) * pt.scale, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    })
  }
}

function drawWire3D(ctx, proj, wireX, dir, currentAmp, baseColor, lightColor, darkColor, labelText) {
  const halfH = 125
  const top = proj(wireX, halfH, 0)
  const bot = proj(wireX, -halfH, 0)
  const mid = proj(wireX, 0, 0)
  const wireW = 11 * mid.scale

  ctx.save()
  // 立体円柱のグラデーション
  const grad = ctx.createLinearGradient(mid.sx - wireW / 2, 0, mid.sx + wireW / 2, 0)
  grad.addColorStop(0, darkColor)
  grad.addColorStop(0.45, lightColor)
  grad.addColorStop(1, darkColor)

  ctx.strokeStyle = grad
  ctx.lineWidth = wireW
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(bot.sx, bot.sy)
  ctx.lineTo(top.sx, top.sy)
  ctx.stroke()

  // 電流キャリア（動く光点）
  const numDots = 6
  const speedFactor = 0.28 + (currentAmp / 20) * 0.45
  for (let k = 0; k < numDots; k++) {
    const tRaw = (k / numDots + animTime * speedFactor) % 1
    const wy = dir > 0 ? -halfH + tRaw * (halfH * 2) : halfH - tRaw * (halfH * 2)
    const pt = proj(wireX, wy, 3)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(pt.sx, pt.sy, 2.8 * pt.scale, 0, Math.PI * 2)
    ctx.fill()
  }

  // 電流の向き矢印（導線のすぐ横に並走表示して上向き/下向きを明瞭に）
  const yStart = dir > 0 ? -75 : 75
  const yEnd = dir > 0 ? 75 : -75
  draw3DArrow(
    ctx,
    proj,
    { x: wireX - 18, y: yStart, z: 0 },
    { x: wireX - 18, y: yEnd, z: 0 },
    lightColor,
    2.5,
    10
  )

  // 導線ラベル (上部)
  ctx.fillStyle = lightColor
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(labelText, top.sx, top.sy - 14)
  ctx.restore()
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#070b14')
  bg.addColorStop(1, '#111827')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  animTime += 0.025

  const cx = w / 2
  const cy = h / 2 - 4
  const proj = makeProjector(cx, cy, viewYawDeg.value, viewPitchDeg.value)

  // 3D空間上の導線位置
  const dWorld = 100 + (distanceCm.value / 25) * 180
  const x1 = -dWorld / 2
  const x2 = dWorld / 2

  // 0. 3D基準水平グリッド（床面 wy = -125 に奥行き基準格子を描いて3D空間感を強調）
  ctx.save()
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)'
  ctx.lineWidth = 1
  const gY = -125
  for (let gx = -240; gx <= 240; gx += 60) {
    const p1 = proj(gx, gY, -160)
    const p2 = proj(gx, gY, 160)
    ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke()
  }
  for (let gz = -160; gz <= 160; gz += 40) {
    const p1 = proj(-240, gY, gz)
    const p2 = proj(240, gY, gz)
    ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke()
  }
  // 座標軸ミニ凡例（左下）
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('右ねじの法則：親指＝電流 I の向き、4本指＝磁場 B の回転矢印', 16, 26)
  ctx.restore()

  const ringLevels = [-55, 55]
  const ringRadii1 = [44, 82]
  const ringRadii2 = [44, 82]

  // 1. 磁場リングの奥側 (導線の後ろを通る半分を先に描画)
  if (showFieldLines.value) {
    drawWireRingsLayer(ctx, proj, x1, dir1.value, current1.value, ringLevels, ringRadii1, '56, 189, 248', true)
    drawWireRingsLayer(ctx, proj, x2, dir2.value, current2.value, ringLevels, ringRadii2, '245, 158, 11', true)
  }

  // 2. 導線本体を奥行き順にソートして描画
  const wire1Depth = proj(x1, 0, 0).depth
  const wire2Depth = proj(x2, 0, 0).depth
  const wires = [
    {
      depth: wire1Depth,
      drawFn: () => drawWire3D(ctx, proj, x1, dir1.value, current1.value, '#0284c7', '#38bdf8', '#0369a1', `導線1: I₁=${current1.value}A (${dir1.value > 0 ? '↑' : '↓'})`)
    },
    {
      depth: wire2Depth,
      drawFn: () => drawWire3D(ctx, proj, x2, dir2.value, current2.value, '#d97706', '#fbbf24', '#b45309', `導線2: I₂=${current2.value}A (${dir2.value > 0 ? '↑' : '↓'})`)
    }
  ]
  wires.sort((a, b) => a.depth - b.depth)
  wires.forEach((wr) => wr.drawFn())

  // 3. 磁場リングの手前側 (導線の前面を横切る半分を上描き → 明確な3D立体交差!)
  if (showFieldLines.value) {
    drawWireRingsLayer(ctx, proj, x1, dir1.value, current1.value, ringLevels, ringRadii1, '56, 189, 248', false)
    drawWireRingsLayer(ctx, proj, x2, dir2.value, current2.value, ringLevels, ringRadii2, '245, 158, 11', false)
  }

  // 4. 相手導線に働く「磁場ベクトル B₁, B₂」（奥行き Z方向の3D矢印として大きく明瞭に表示！）
  const bLen = 68
  // 導線1が導線2の位置(x2)につくる磁場 B1: dir1 > 0 なら奥向き(-Z), dir1 < 0 なら手前向き(+Z)
  const b1DirZ = dir1.value > 0 ? -1 : 1
  draw3DArrow(
    ctx,
    proj,
    { x: x2, y: 0, z: 0 },
    { x: x2, y: 0, z: b1DirZ * bLen },
    '#22c55e',
    3.5,
    12,
    `B₁ (${b1DirZ < 0 ? '奥向き ⊗' : '手前 ⊙'})`,
    { x: 0, y: b1DirZ < 0 ? -10 : 18 }
  )

  // 導線2が導線1の位置(x1)につくる磁場 B2: 導線1は導線2の左側なので、dir2 > 0 なら手前向き(+Z), dir2 < 0 なら奥向き(-Z)
  const b2DirZ = dir2.value > 0 ? 1 : -1
  draw3DArrow(
    ctx,
    proj,
    { x: x1, y: 0, z: 0 },
    { x: x1, y: 0, z: b2DirZ * bLen },
    '#22c55e',
    3.5,
    12,
    `B₂ (${b2DirZ < 0 ? '奥向き ⊗' : '手前 ⊙'})`,
    { x: 0, y: b2DirZ < 0 ? -10 : 18 }
  )

  // 5. 相互に働く電磁力ベクトル F₁, F₂（3D X軸方向）
  const fLen = Math.min(95, Math.max(38, forceMicroN.value * 2.5))
  const fCol = isAttractive.value ? '#ec4899' : '#ef4444'
  const f1DirX = isAttractive.value ? 1 : -1
  const f2DirX = isAttractive.value ? -1 : 1

  draw3DArrow(
    ctx,
    proj,
    { x: x1, y: 0, z: 0 },
    { x: x1 + f1DirX * fLen, y: 0, z: 0 },
    fCol,
    3.8,
    13,
    isAttractive.value ? 'F₁ (引力)' : 'F₁ (斥力)',
    { x: 0, y: -12 }
  )
  draw3DArrow(
    ctx,
    proj,
    { x: x2, y: 0, z: 0 },
    { x: x2 + f2DirX * fLen, y: 0, z: 0 },
    fCol,
    3.8,
    13,
    isAttractive.value ? 'F₂ (引力)' : 'F₂ (斥力)',
    { x: 0, y: -12 }
  )

  // 6. 距離 r の寸法線（床面 wy = -125 手前に配置）
  const rLineY = -125
  const rLineZ = 35
  const rA = proj(x1, rLineY, rLineZ)
  const rB = proj(x2, rLineY, rLineZ)
  const rMid = proj(0, rLineY, rLineZ)
  ctx.save()
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(rA.sx, rA.sy)
  ctx.lineTo(rB.sx, rB.sy)
  ctx.stroke()
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`距離 r = ${distanceCm.value} cm`, rMid.sx, rMid.sy + 18)
  ctx.restore()

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 24px 0;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.sim-header h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  color: #f8fafc;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 14px;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #070b14;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 740 / 400;
}

.view-hint-badge {
  position: absolute;
  bottom: 10px;
  left: 12px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  font-size: 0.74rem;
  padding: 3px 10px;
  border-radius: 9999px;
  pointer-events: none;
}

.control-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 14px;
  margin-top: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.control-group label {
  display: flex;
  flex-direction: column;
  align-items: stretch !important;
  gap: 6px;
  font-size: 0.84rem;
  color: #e2e8f0;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  padding: 6px 14px;
  font-size: 0.84rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}

.btn-secondary:hover {
  background: #475569;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

@media (max-width: 720px) {
  .stats-monitor {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 10px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.02rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #38bdf8;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 2px;
}

.force-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.force-badge.attract {
  background: rgba(236, 72, 153, 0.2);
  border: 1px solid #ec4899;
  color: #f472b6;
}

.force-badge.repel {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #f87171;
}

.mt-2 {
  margin-top: 6px;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.select-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.select-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
  font-weight: bold;
}
</style>
