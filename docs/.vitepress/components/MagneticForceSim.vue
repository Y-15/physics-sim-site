<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧲</span>
        <h3>電磁力と平行電流間に働く力シミュレーター</h3>
      </div>
      <p class="subtitle">
        電流が周囲につくる磁場（右ねじの法則）と、磁場中の電流が受ける力（フレミングの左手の法則）。
        同方向の電流は互いに引き合い（引力）、逆方向の電流は反発し合う（斥力）物理的メカニズムと、単位長さあたりに働く力 f = <i>μ</i><sub>0</sub> <i>I</i><sub>1</sub> <i>I</i><sub>2</sub> / 2π r をリアルタイム観察できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="320"></canvas>
      <div class="force-badge" :class="isAttractive ? 'attract' : 'repel'">
        <span>{{ isAttractive ? '🤝 引力（引き合う）' : '💥 斥力（反発する）' }}</span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>導線1の電流 <i>I</i><sub>1</sub>: <strong>{{ current1 }} A</strong> ({{ dir1 > 0 ? '上向き ↑' : '下向き ↓' }})</span>
            <input type="range" v-model.number="current1" min="1" max="20" step="1" />
            <div class="btn-group mt-2">
              <button class="select-btn" :class="{ active: dir1 > 0 }" @click="dir1 = 1">上向き ↑</button>
              <button class="select-btn" :class="{ active: dir1 < 0 }" @click="dir1 = -1">下向き ↓</button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>導線2の電流 <i>I</i><sub>2</sub>: <strong>{{ current2 }} A</strong> ({{ dir2 > 0 ? '上向き ↑' : '下向き ↓' }})</span>
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
        </div>

        <div class="control-group">
          <label>
            <span>磁力線の表示:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: showFieldLines }" @click="showFieldLines = !showFieldLines">
                {{ showFieldLines ? '合成磁力線を表示中' : '磁力線を非表示' }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (10A / 10A / 10cm)
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
        <span class="subtext"><i>B</i><sub>1</sub> = <i>μ</i><sub>0</sub> <i>I</i><sub>1</sub> / 2π r</span>
      </div>

      <div class="stat-card">
        <span class="label">導線1の位置での磁場 <i>B</i><sub>2</sub></span>
        <span class="value">{{ field2MicroT.toFixed(2) }} <span class="unit">µT</span></span>
        <span class="subtext"><i>B</i><sub>2</sub> = <i>μ</i><sub>0</sub> <i>I</i><sub>2</sub> / 2π r</span>
      </div>

      <div class="stat-card">
        <span class="label">作用・反作用の法則</span>
        <span class="value"><i>F</i><sub>1</sub> = -<i>F</i><sub>2</sub></span>
        <span class="subtext">常に大きさが等しく逆向き</span>
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

const isAttractive = computed(() => dir1.value * dir2.value > 0)

// 透磁率 μ0 = 4π * 10^-7 N/A^2
// f = (μ0 * I1 * I2) / (2π * r) = (2e-7 * I1 * I2) / r  [N/m]
const forceMicroN = computed(() => {
  const rM = distanceCm.value * 0.01
  const f = (2e-7 * current1.value * current2.value) / rM
  return f * 1e6 // µN/m
})

// B = (μ0 * I) / (2π * r) = (2e-7 * I) / r [T]
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
}

let animId = null
let currentPulse = 0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#090d16')
  bg.addColorStop(1, '#111827')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  currentPulse += 0.04

  const centerX = w / 2
  const centerY = h / 2
  // 画面上の導線間隔 (px)
  const dPx = (distanceCm.value / 25) * 320
  const wire1X = centerX - dPx / 2
  const wire2X = centerX + dPx / 2

  // 1. 合成磁場（上から見た断面または立体磁力線）の表示
  if (showFieldLines.value) {
    // 磁力線の等高線描画
    // 電流1 (wire1X, centerY), 電流2 (wire2X, centerY)
    // 2次元ベクトルポテンシャル A_z ∝ I1 ln(r1) + I2 ln(r2)
    const sign1 = dir1.value
    const sign2 = dir2.value

    ctx.save()
    ctx.lineWidth = 1
    const numRings = 9
    for (let i = 1; i <= numRings; i++) {
      const r1 = 15 + i * (dPx * 0.12)
      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.08, 0.35 - i * 0.03)})`
      ctx.beginPath()
      ctx.arc(wire1X, centerY, r1, 0, Math.PI * 2)
      ctx.stroke()

      const r2 = 15 + i * (dPx * 0.12)
      ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0.08, 0.35 - i * 0.03)})`
      ctx.beginPath()
      ctx.arc(wire2X, centerY, r2, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  // 2. 平行導線（立体シリンダー描画）
  const wireH = 200
  const wireR = 6

  // 導線1
  ctx.save()
  const grad1 = ctx.createLinearGradient(wire1X - wireR, 0, wire1X + wireR, 0)
  grad1.addColorStop(0, '#0284c7')
  grad1.addColorStop(0.5, '#38bdf8')
  grad1.addColorStop(1, '#0369a1')
  ctx.fillStyle = grad1
  ctx.fillRect(wire1X - wireR, centerY - wireH / 2, wireR * 2, wireH)

  // 導線2
  const grad2 = ctx.createLinearGradient(wire2X - wireR, 0, wire2X + wireR, 0)
  grad2.addColorStop(0, '#d97706')
  grad2.addColorStop(0.5, '#fbbf24')
  grad2.addColorStop(1, '#b45309')
  ctx.fillStyle = grad2
  ctx.fillRect(wire2X - wireR, centerY - wireH / 2, wireR * 2, wireH)
  ctx.restore()

  // 3. 電流の向き矢印（動的アニメーション）
  const arrowLen = 45
  // 導線1の電流
  const y1Start = dir1.value > 0 ? centerY + wireH * 0.35 : centerY - wireH * 0.35
  const y1End = dir1.value > 0 ? centerY - wireH * 0.35 : centerY + wireH * 0.35
  drawCurrentArrow(ctx, wire1X, y1Start, y1End, '#38bdf8', `I₁ = ${current1.value}A`)

  // 導線2の電流
  const y2Start = dir2.value > 0 ? centerY + wireH * 0.35 : centerY - wireH * 0.35
  const y2End = dir2.value > 0 ? centerY - wireH * 0.35 : centerY + wireH * 0.35
  drawCurrentArrow(ctx, wire2X, y2Start, y2End, '#fbbf24', `I₂ = ${current2.value}A`)

  // 4. 相互に働く電磁力ベクトル F1, F2
  const forceScale = Math.min(85, Math.max(25, forceMicroN.value * 2.8))
  ctx.save()
  ctx.lineWidth = 3

  if (isAttractive.value) {
    // 引力: 互いに相手に向かう
    // F1: wire1 から右向き (ラベル上側)
    drawForceArrow(ctx, wire1X + wireR + 2, centerY, wire1X + wireR + 2 + forceScale, centerY, '#ec4899', 'F₁ (引力)', -10)
    // F2: wire2 から左向き (ラベル下側にして重なり防止)
    drawForceArrow(ctx, wire2X - wireR - 2, centerY, wire2X - wireR - 2 - forceScale, centerY, '#ec4899', 'F₂ (引力)', 18)
  } else {
    // 斥力: 互いに外側に向かう
    // F1: wire1 から左向き
    drawForceArrow(ctx, wire1X - wireR - 2, centerY, wire1X - wireR - 2 - forceScale, centerY, '#ef4444', 'F₁ (斥力)', -10)
    // F2: wire2 から右向き
    drawForceArrow(ctx, wire2X + wireR + 2, centerY, wire2X + wireR + 2 + forceScale, centerY, '#ef4444', 'F₂ (斥力)', -10)
  }
  ctx.restore()

  // 5. 導線間距離 r の寸法線
  const rulerY = centerY + wireH / 2 + 25
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(wire1X, rulerY); ctx.lineTo(wire2X, rulerY)
  ctx.moveTo(wire1X, rulerY - 5); ctx.lineTo(wire1X, rulerY + 5)
  ctx.moveTo(wire2X, rulerY - 5); ctx.lineTo(wire2X, rulerY + 5)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`距離 r = ${distanceCm.value} cm`, centerX, rulerY + 18)

  animId = requestAnimationFrame(draw)
}

function drawCurrentArrow(ctx, x, yFrom, yTo, color, label) {
  const dir = yTo < yFrom ? -1 : 1
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x, yFrom)
  ctx.lineTo(x, yTo)
  ctx.stroke()

  // 矢尻
  ctx.beginPath()
  ctx.moveTo(x, yTo)
  ctx.lineTo(x - 5, yTo - dir * 10)
  ctx.lineTo(x + 5, yTo - dir * 10)
  ctx.closePath()
  ctx.fill()

  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, x, dir > 0 ? yTo + 16 : yTo - 8)
  ctx.restore()
}

function drawForceArrow(ctx, x1, y1, x2, y2, color, label, labelOffsetY = -10) {
  const dx = x2 - x1
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  const sign = dx > 0 ? 1 : -1
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - sign * 10, y2 - 5)
  ctx.lineTo(x2 - sign * 10, y2 + 5)
  ctx.closePath()
  ctx.fill()

  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, (x1 + x2) / 2, y1 + labelOffsetY)
  ctx.restore()
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.force-badge {
  position: absolute;
  top: 14px;
  right: 14px;
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
