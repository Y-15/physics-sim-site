<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">📐 摩擦力と斜面上の運動 実験室</span>
      <span class="sim-badge">静止摩擦力・動摩擦力・摩擦角</span>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="380"></canvas>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>斜面の傾斜角 θ: <strong>{{ thetaDeg }}°</strong></label>
        <input type="range" v-model.number="thetaDeg" min="0" max="65" step="1" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">
          滑り出す限界角（摩擦角）: <strong>{{ critAngleDeg.toFixed(1) }}°</strong>
        </div>
      </div>
      <div class="control-item">
        <label>静止摩擦係数 μₛ: <strong>{{ muS.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muS" min="0.1" max="0.9" step="0.05" />
      </div>
      <div class="control-item">
        <label>動摩擦係数 μₖ: <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.05" :max="muS" step="0.05" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">※動摩擦係数は常に μₖ ≤ μₛ</div>
      </div>
      <div class="control-item">
        <label>物体の質量 m: <strong>{{ m }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.5" max="5.0" step="0.5" />
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" :class="{ highlight: isSliding }">
        <div class="stat-label">現在の状態</div>
        <div class="stat-value" :style="{ color: isSliding ? '#ef4444' : '#10b981', fontSize: '1.15rem' }">
          {{ isSliding ? '🚀 滑走中 (動摩擦)' : '🛑 静止 (静止摩擦)' }}
        </div>
        <div class="stat-formula">{{ isSliding ? `加速度 a = ${accel.toFixed(2)} m/s²` : '合力 = 0 N (つり合い)' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">斜面平行の重力分力</div>
        <div class="stat-value">{{ forceDown.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">mg sin θ</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最大静止摩擦力</div>
        <div class="stat-value">{{ maxStaticFriction.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">fₛ,max = μₛN</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">現在の摩擦力 f</div>
        <div class="stat-value">{{ currentFriction.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">{{ isSliding ? 'fₖ = μₖN (動摩擦力)' : 'fₛ = mg sin θ (静止摩擦力)' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">垂直抗力 N</div>
        <div class="stat-value">{{ normalForce.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">N = mg cos θ</div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="startSlideDemo">▶ 滑走スタート (θ = {{ Math.min(60, Math.ceil(critAngleDeg + 8)) }}°)</button>
      <button class="preset-btn" @click="startTiltExperiment">📐 傾斜角を0°から徐々に上げる実験</button>
      <button :class="['preset-btn', { active: Math.abs(thetaDeg - critAngleDeg) < 0.6 }]" @click="setExactCritical">
        🎯 限界角に合わせる ({{ critAngleDeg.toFixed(1) }}°)
      </button>
      <button class="preset-btn" @click="resetBlock">⏮ 最上部に戻す</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)

const thetaDeg = ref(25)
const muS = ref(0.5)
const muK = ref(0.35)
const m = ref(2.0)
const g = 9.8

const thetaRad = computed(() => (thetaDeg.value * Math.PI) / 180)
const critAngleDeg = computed(() => (Math.atan(muS.value) * 180) / Math.PI)

const normalForce = computed(() => m.value * g * Math.cos(thetaRad.value))
const forceDown = computed(() => m.value * g * Math.sin(thetaRad.value))
const maxStaticFriction = computed(() => muS.value * normalForce.value)

const isSliding = computed(() => forceDown.value > maxStaticFriction.value + 0.001)

const currentFriction = computed(() => {
  if (isSliding.value) {
    return muK.value * normalForce.value
  } else {
    return forceDown.value
  }
})

const accel = computed(() => {
  if (!isSliding.value) return 0
  return Math.max(0, g * (Math.sin(thetaRad.value) - muK.value * Math.cos(thetaRad.value)))
})

// アニメーション用ブロック位置
let animId = null
let blockS = 0 // 斜面に沿った移動距離 (px)
let blockVel = 0 // 斜面に沿った速度
let lastTime = null
let pauseAtBottom = 0
let isTilting = false

function setExactCritical() {
  isTilting = false
  thetaDeg.value = Math.round(critAngleDeg.value * 10) / 10
  resetBlock()
}

function startSlideDemo() {
  isTilting = false
  thetaDeg.value = Math.min(60, Math.ceil(critAngleDeg.value + 8))
  resetBlock()
}

function startTiltExperiment() {
  thetaDeg.value = 5
  resetBlock()
  isTilting = true
}

function resetBlock() {
  blockS = 0
  blockVel = 0
  pauseAtBottom = 0
}

function draw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000)
  lastTime = timestamp

  if (isTilting) {
    if (!isSliding.value && thetaDeg.value < 65) {
      thetaDeg.value = Math.min(65, Math.round((thetaDeg.value + dt * 8) * 10) / 10)
    } else {
      isTilting = false
    }
  }

  const rad = thetaRad.value
  const slopeBaseX = 90
  const slopeBaseY = 335
  // 斜面の高さがキャンバス上部をはみ出さないように斜辺長を自動調整
  const maxSlopeH = 225
  const maxSlopeW = 470
  const slopeL = Math.min(
    maxSlopeW / Math.max(0.2, Math.cos(rad)),
    maxSlopeH / Math.max(0.1, Math.sin(rad)),
    440
  )
  const initialOffset = 65
  const maxSlideDist = Math.max(80, slopeL - initialOffset - 45)

  if (isSliding.value) {
    if (blockS >= maxSlideDist) {
      pauseAtBottom += dt
      if (pauseAtBottom > 0.9) {
        blockS = 0
        blockVel = 0
        pauseAtBottom = 0
      }
    } else {
      blockVel += accel.value * dt * 45 // スケール係数
      blockS += blockVel * dt
      if (blockS >= maxSlideDist) {
        blockS = maxSlideDist
        blockVel = 0
      }
    }
  } else {
    blockVel = 0
    pauseAtBottom = 0
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height

  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, w, h)

  // グリッド
  ctx.strokeStyle = 'rgba(63,63,70,0.3)'
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke() }
  for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }

  const slopeEndX = slopeBaseX + slopeL * Math.cos(rad)
  const slopeEndY = slopeBaseY - slopeL * Math.sin(rad)

  // 斜面三角形の塗りつぶし
  ctx.fillStyle = 'rgba(39, 39, 42, 0.7)'
  ctx.beginPath()
  ctx.moveTo(slopeBaseX, slopeBaseY)
  ctx.lineTo(slopeEndX, slopeEndY)
  ctx.lineTo(slopeEndX, slopeBaseY)
  ctx.closePath()
  ctx.fill()

  // 斜面ライン
  ctx.strokeStyle = '#a1a1aa'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(slopeBaseX, slopeBaseY); ctx.lineTo(slopeEndX, slopeEndY); ctx.stroke()
  // 底辺
  ctx.strokeStyle = '#52525b'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(slopeBaseX, slopeBaseY); ctx.lineTo(slopeEndX, slopeBaseY); ctx.stroke()

  // 角度 θ 円弧
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(slopeBaseX, slopeBaseY, 45, -rad, 0)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`θ = ${thetaDeg.value}°`, slopeBaseX + 54, slopeBaseY - 8)

  // ブロック位置（斜面上端から blockS だけ下った位置）
  const currentOffset = initialOffset + blockS
  const centerSlopeDist = slopeL - currentOffset

  const bCenterX = slopeBaseX + centerSlopeDist * Math.cos(rad)
  const bCenterY = slopeBaseY - centerSlopeDist * Math.sin(rad)

  // 斜面に垂直な法線方向単位ベクトル (左上向き)
  const normX = -Math.sin(rad)
  const normY = -Math.cos(rad)
  // 斜面平行上向き単位ベクトル (右上向き)
  const paraUpX = Math.cos(rad)
  const paraUpY = -Math.sin(rad)

  const blockW = 44, blockH = 30
  // ブロックの実際の中心（面から高さ blockH/2 浮かせた位置）
  const bx = bCenterX - normX * (blockH / 2)
  const by = bCenterY - normY * (blockH / 2)

  // ブロック描画 (斜め回転)
  ctx.save()
  ctx.translate(bx, by)
  ctx.rotate(-rad)
  ctx.fillStyle = isSliding.value ? '#f43f5e' : '#3b82f6'
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(-blockW/2, -blockH/2, blockW, blockH, 4)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(`${m.value}kg`, 0, 0)
  ctx.restore()

  // -------------------------
  // 力のベクトル矢印
  // -------------------------
  const vecScale = Math.min(2.2, 68 / (m.value * g))

  // 1. 重力 mg (鉛直下向き、グレー点線 & 実線)
  const mgLen = m.value * g * vecScale
  ctx.strokeStyle = '#e4e4e7'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + mgLen); ctx.stroke()
  drawArrowHead(ctx, bx, by + mgLen, 0, 1, '#e4e4e7')
  ctx.fillStyle = '#e4e4e7'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`mg = ${(m.value * g).toFixed(1)} N`, bx + 6, by + mgLen)

  // 2. 垂直抗力 N (面に垂直上向き、シアン)
  const nLen = normalForce.value * vecScale
  const nEndX = bx + normX * nLen
  const nEndY = by + normY * nLen
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(nEndX, nEndY); ctx.stroke()
  drawArrowHead(ctx, nEndX, nEndY, normX, normY, '#38bdf8')
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(`N = ${normalForce.value.toFixed(1)} N`, nEndX - 10, nEndY - 8)

  // 3. 摩擦力 f (斜面上向き、黄色/赤色)
  const fLen = currentFriction.value * vecScale
  const fEndX = bx + paraUpX * fLen
  const fEndY = by + paraUpY * fLen
  const fColor = isSliding.value ? '#f43f5e' : '#fbbf24'
  ctx.strokeStyle = fColor; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(fEndX, fEndY); ctx.stroke()
  drawArrowHead(ctx, fEndX, fEndY, paraUpX, paraUpY, fColor)
  ctx.fillStyle = fColor; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`${isSliding.value ? '動摩擦力 fₖ' : '静止摩擦力 fₛ'} = ${currentFriction.value.toFixed(1)} N`, fEndX + 6, fEndY - 6)

  // 4. 重力の斜面下向き分力 mg sin θ (オレンジ点線矢印)
  const downLen = forceDown.value * vecScale
  const downEndX = bx - paraUpX * downLen
  const downEndY = by - paraUpY * downLen
  ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2.5
  ctx.setLineDash([4, 3])
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(downEndX, downEndY); ctx.stroke()
  ctx.setLineDash([])
  drawArrowHead(ctx, downEndX, downEndY, -paraUpX, -paraUpY, '#fb923c')
  ctx.fillStyle = '#fb923c'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'
  ctx.fillText(`mg sin θ = ${forceDown.value.toFixed(1)} N`, downEndX - 6, downEndY + 12)

  animId = requestAnimationFrame(draw)
}

function drawArrowHead(ctx, tipX, tipY, dirX, dirY, color) {
  const headLen = 8
  const angle = Math.atan2(dirY, dirX)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - headLen * Math.cos(angle - Math.PI / 6), tipY - headLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(tipX - headLen * Math.cos(angle + Math.PI / 6), tipY - headLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

watch([thetaDeg, muS, muK, m], () => {
  resetBlock()
})

onMounted(() => {
  animId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
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
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.sim-title {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(90deg, #fbbf24, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.canvas-wrapper {
  background: #09090b;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #27272a;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
canvas {
  width: 100%;
  max-width: 700px;
  height: auto;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.control-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.control-item label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: #d4d4d8;
}
.control-item input[type=range] {
  width: 100%;
  accent-color: #fbbf24;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.preset-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.preset-btn.active {
  background: rgba(251, 191, 36, 0.25);
  border-color: #fbbf24;
  color: #fbbf24;
}
.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #ea580c);
  color: #09090b;
  font-weight: 700;
}
.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
}
.stat-card.highlight {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.07);
}
.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}
.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f4f4f5;
}
.stat-value .unit {
  font-size: 0.85rem;
  color: #a1a1aa;
  font-weight: 400;
}
.stat-formula {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.3rem;
}
</style>
