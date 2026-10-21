<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
let animId = null
let simTime = 0

function drawRayPulses(ctx, x1, y1, x2, y2, color, offset = 0) {
  for (let i = 0; i < 2; i++) {
    const t = ((simTime * 0.7 + offset + i * 0.5) % 1 + 1) % 1
    const px = x1 + (x2 - x1) * t
    const py = y1 + (y2 - y1) * t
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 鏡の種類: 'concave' (凹面鏡) or 'convex' (凸面鏡)
const mirrorType = ref('concave')
const focalLengthAbs = ref(120) // 焦点距離 |f| [px] (60 ~ 180)
const objectDist = ref(180) // 物体距離 a [px] (40 ~ 320)
const objectHeight = ref(60) // 物体の高さ h [px] (20 ~ 100)

const width = 520
const height = 360
const axisY = height / 2
const mirrorX = 380 // 鏡の頂点 V の x 座標

// 符号付き焦点距離 f
// 凹面鏡: 鏡の左側(手前)に焦点があるため f > 0
// 凸面鏡: 鏡の右側(奥)に虚焦点があるため f < 0
const f = computed(() => {
  return mirrorType.value === 'concave' ? focalLengthAbs.value : -focalLengthAbs.value
})

// 写像公式: 1/a + 1/b = 1/f => 1/b = 1/f - 1/a = (a - f) / (a * f)
// b = (a * f) / (a - f)
const imageDist = computed(() => {
  const a = objectDist.value
  const fVal = f.value
  if (Math.abs(a - fVal) < 1e-3) return null // 無限遠 (焦点上)
  return (a * fVal) / (a - fVal)
})

// 倍率 m = |b / a|
// 像の高さ h' = - (b / a) * h
const imageStats = computed(() => {
  const a = objectDist.value
  const b = imageDist.value
  const h = objectHeight.value
  if (b === null) {
    return {
      bStr: '∞ (平行光線)',
      magStr: '∞',
      type: '結像なし (無限遠)',
      isReal: false,
      isUpright: false,
      imgHeight: 0
    }
  }

  const mag = Math.abs(b / a)
  const hPrime = -(b / a) * h // 負なら倒立、正なら正立
  const isReal = b > 0
  const isUpright = hPrime > 0

  return {
    bStr: `${Math.abs(b).toFixed(1)} px (${b > 0 ? '手前' : '奥'})`,
    magStr: `${mag.toFixed(2)} 倍`,
    type: isReal ? (isUpright ? '実像・正立' : '実像・倒立') : '虚像・正立',
    isReal,
    isUpright,
    imgHeight: hPrime
  }
})

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景クリア
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // 1. 光軸 (中央水平線)
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(10, axisY)
  ctx.lineTo(width - 10, axisY)
  ctx.stroke()

  // 2. 球面鏡の描画
  const fVal = f.value
  const R = 2 * Math.abs(fVal) // 曲率半径 R = 2|f|
  const isConcave = mirrorType.value === 'concave'

  // 鏡の円弧
  ctx.save()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 4
  ctx.beginPath()
  // 凹面鏡: 左に開く円弧 (中心は鏡の左側 (mirrorX - R, axisY))
  // 凸面鏡: 右に開く円弧 (中心は鏡の右側 (mirrorX + R, axisY))
  const arcHeight = 120
  if (isConcave) {
    ctx.arc(mirrorX - R, axisY, R, -Math.asin(arcHeight / R), Math.asin(arcHeight / R))
  } else {
    ctx.arc(mirrorX + R, axisY, R, Math.PI - Math.asin(arcHeight / R), Math.PI + Math.asin(arcHeight / R))
  }
  ctx.stroke()

  // 鏡の裏側ハッチング
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
  ctx.lineWidth = 1.5
  for (let y = axisY - arcHeight; y <= axisY + arcHeight; y += 12) {
    const dy = y - axisY
    const dx = isConcave
      ? mirrorX - (R - Math.sqrt(Math.max(0, R * R - dy * dy)))
      : mirrorX + (R - Math.sqrt(Math.max(0, R * R - dy * dy)))
    ctx.beginPath()
    ctx.moveTo(dx, y)
    ctx.lineTo(dx + 10, y + (isConcave ? 6 : -6))
    ctx.stroke()
  }
  ctx.restore()

  // 鏡の頂点 V
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(mirrorX, axisY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('V (頂点)', mirrorX - 10, axisY + 18)

  // 3. 焦点 F と 曲率中心 C
  // 凹面鏡: 焦点 F は mirrorX - |f|, C は mirrorX - 2|f|
  // 凸面鏡: 焦点 F は mirrorX + |f|, C は mirrorX + 2|f|
  const focusX = isConcave ? mirrorX - Math.abs(fVal) : mirrorX + Math.abs(fVal)
  const centerX = isConcave ? mirrorX - 2 * Math.abs(fVal) : mirrorX + 2 * Math.abs(fVal)

  // 焦点 F
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(focusX, axisY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillText('F', focusX - 4, axisY + 18)

  // 曲率中心 C
  ctx.fillStyle = '#94a3b8'
  ctx.beginPath()
  ctx.arc(centerX, axisY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillText('C', centerX - 4, axisY + 18)

  // 4. 物体（ろうそく矢印）の描画
  const objX = mirrorX - objectDist.value
  const objH = objectHeight.value
  const objTopY = axisY - objH

  drawArrow(ctx, objX, axisY, objX, objTopY, '#f43f5e', 3)
  ctx.fillStyle = '#f43f5e'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('物体', objX - 12, objTopY - 8)

  // 5. 像の描画
  const b = imageDist.value
  if (b !== null) {
    const imgX = mirrorX - b // b>0 なら鏡の左(手前)、b<0 なら鏡の右(奥)
    const imgH = imageStats.value.imgHeight
    const imgTopY = axisY - imgH
    const isReal = b > 0

    drawArrow(ctx, imgX, axisY, imgX, imgTopY, isReal ? '#10b981' : '#a855f7', 2.5, !isReal)
    ctx.fillStyle = isReal ? '#10b981' : '#a855f7'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(imageStats.value.type, imgX - 20, imgTopY + (imgH > 0 ? -8 : 18))

    // 6. 3大代表光線の作図
    drawRayTraces(ctx, objX, objTopY, imgX, imgTopY, focusX, centerX, isConcave)
  }
}

function drawRayTraces(ctx, ox, oy, ix, iy, fx, cx, isConcave) {
  // 光線1: 光軸に平行に入射 -> 鏡で反射して焦点 F を通る (水色)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.3
  ctx.beginPath()
  ctx.moveTo(ox, oy)
  ctx.lineTo(mirrorX, oy) // 鏡の主平面
  ctx.stroke()
  drawRayPulses(ctx, ox, oy, mirrorX, oy, '#7dd3fc', 0)

  if (isConcave) {
    // 凹面鏡: 反射光は焦点 F を通って像へ
    ctx.beginPath()
    ctx.moveTo(mirrorX, oy)
    // 像の先端へ
    const slope = (iy - oy) / (ix - mirrorX)
    ctx.lineTo(mirrorX - 400, oy - 400 * slope)
    ctx.stroke()
    drawRayPulses(ctx, mirrorX, oy, mirrorX - 300, oy - 300 * slope, '#38bdf8', 0.35)

    // 虚像の場合は奥へ点線
    if (imageDist.value < 0) {
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(mirrorX, oy)
      ctx.lineTo(ix, iy)
      ctx.stroke()
      ctx.setLineDash([])
    }
  } else {
    // 凸面鏡: 反射光は奥の焦点 F から発散するように前へ
    const slope = (oy - axisY) / (mirrorX - fx)
    ctx.beginPath()
    ctx.moveTo(mirrorX, oy)
    ctx.lineTo(mirrorX - 300, oy - 300 * slope)
    ctx.stroke()
    drawRayPulses(ctx, mirrorX, oy, mirrorX - 300, oy - 300 * slope, '#38bdf8', 0.35)

    // 焦点 F からの虚延長線
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(mirrorX, oy)
    ctx.lineTo(fx, axisY)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // 光線2: 頂点 V に入射 -> 反射の法則 (入射角=反射角) (黄色)
  ctx.strokeStyle = '#fbbf24'
  ctx.beginPath()
  ctx.moveTo(ox, oy)
  ctx.lineTo(mirrorX, axisY)
  ctx.stroke()
  drawRayPulses(ctx, ox, oy, mirrorX, axisY, '#fde047', 0.15)

  const vSlope = (axisY - oy) / (mirrorX - ox)
  ctx.beginPath()
  ctx.moveTo(mirrorX, axisY)
  ctx.lineTo(mirrorX - 300, axisY + 300 * vSlope)
  ctx.stroke()
  drawRayPulses(ctx, mirrorX, axisY, mirrorX - 300, axisY + 300 * vSlope, '#fbbf24', 0.5)

  if (imageDist.value < 0) {
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(mirrorX, axisY)
    ctx.lineTo(ix, iy)
    ctx.stroke()
    ctx.setLineDash([])
  }
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, width, isDashed = false) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  if (isDashed) ctx.setLineDash([4, 3])

  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
  ctx.setLineDash([])

  // 矢印ヘッド
  const angle = Math.atan2(toY - fromY, toX - fromX)
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - 8 * Math.cos(angle - Math.PI / 6), toY - 8 * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - 8 * Math.cos(angle + Math.PI / 6), toY - 8 * Math.sin(angle + Math.PI / 6))
  ctx.fill()
  ctx.restore()
}

function setMirror(type) {
  mirrorType.value = type
  if (type === 'concave') {
    objectDist.value = 180
  } else {
    objectDist.value = 140
  }
}

function resetSim() {
  mirrorType.value = 'concave'
  focalLengthAbs.value = 120
  objectDist.value = 180
  objectHeight.value = 60
}

function loop() {
  simTime += 0.016
  draw()
  animId = requestAnimationFrame(loop)
}

onMounted(() => {
  animId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🪞</span>
        <span>凹面鏡・凸面鏡の光線追跡と写像シミュレーター</span>
      </div>
      <div class="badge">幾何光学 × 球面反射の写像公式</div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="stat-panel">
        <div class="stat-row">
          <span class="lbl">鏡の種類:</span>
          <span class="val highlight">{{ mirrorType === 'concave' ? '凹面鏡 (f > 0)' : '凸面鏡 (f < 0)' }}</span>
        </div>
        <div class="stat-row">
          <span class="lbl">物体距離 <i>a</i>:</span>
          <span class="val">{{ objectDist }} px</span>
        </div>
        <div class="stat-row">
          <span class="lbl">像距離 <i>b</i>:</span>
          <span class="val">{{ imageStats.bStr }}</span>
        </div>
        <div class="stat-row">
          <span class="lbl">倍率 <i>m</i>:</span>
          <span class="val">{{ imageStats.magStr }}</span>
        </div>
        <div class="stat-row">
          <span class="lbl">像の性質:</span>
          <span class="val" :style="{ color: imageStats.isReal ? '#10b981' : '#a855f7' }">
            {{ imageStats.type }}
          </span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="mirror-toggle">
        <span class="toggle-lbl">鏡の切り替え:</span>
        <button
          class="mode-btn"
          :class="{ active: mirrorType === 'concave' }"
          @click="setMirror('concave')"
        >
          凹面鏡（収束・コスメ鏡/反射望遠鏡）
        </button>
        <button
          class="mode-btn"
          :class="{ active: mirrorType === 'convex' }"
          @click="setMirror('convex')"
        >
          凸面鏡（発散・カーブミラー/広角）
        </button>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>物体距離 <i>a</i>: <span>{{ objectDist }} px</span></label>
          <input type="range" v-model.number="objectDist" min="40" max="300" step="5" @input="draw" />
        </div>
        <div class="control-group">
          <label>焦点距離 |<i>f</i>|: <span>{{ focalLengthAbs }} px</span></label>
          <input type="range" v-model.number="focalLengthAbs" min="60" max="180" step="5" @input="draw" />
        </div>
        <div class="control-group">
          <label>物体の高さ <i>h</i>: <span>{{ objectHeight }} px</span></label>
          <input type="range" v-model.number="objectHeight" min="25" max="90" step="5" @input="draw" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-reset" @click="resetSim">リセット</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sim-canvas {
  width: 100%;
  max-width: 520px;
  height: auto;
  aspect-ratio: 520 / 360;
  display: block;
}

.stat-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.stat-row .lbl {
  color: #94a3b8;
}

.stat-row .val {
  font-family: monospace;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-row .val.highlight {
  color: #38bdf8;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.mirror-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toggle-lbl {
  font-size: 0.75rem;
  color: #94a3b8;
}

.mode-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
