<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚛️</span>
        <h3>物質波（ド・ブロイ波）と電子線回折シミュレーター</h3>
      </div>
      <p class="subtitle">電子などの粒子がもつ波動性。加速電圧 <i>V</i> で電子を加速したときの物質波の波長 λ = <i>h</i>/<i>p</i> と、結晶格子によるブラッグ反射・回折リングの半径変化をリアルタイム観察できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="bragg-badge" :class="{ matched: isBraggMatched }">
        {{ isBraggMatched ? `✨ ブラッグ条件成立! (${braggOrder}次反射)` : '非干渉 (散乱波の打ち消し)' }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>電子加速電圧 <i>V</i>: <strong>{{ voltage }} V</strong></span>
            <input type="range" v-model.number="voltage" min="30" max="400" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>結晶格子面間隔 <i>d</i>: <strong>{{ d_nm.toFixed(2) }} nm</strong></span>
            <input type="range" v-model.number="d_nm" min="0.10" max="0.35" step="0.01" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>入射角 θ: <strong>{{ thetaDeg.toFixed(1) }}°</strong></span>
            <input type="range" v-model.number="thetaDeg" min="10" max="75" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>波面の表示スタイル:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: showRings }" @click="showRings = !showRings">
                {{ showRings ? '回折リング表示中' : '回折リング非表示' }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="snapToBragg">
          🎯 最寄りのブラッグ角に自動調整
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量リアルタイム表示モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">電子の運動エネルギー <i>E</i><sub><i>k</i></sub></span>
        <span class="value">{{ voltage }} <span class="unit">eV</span></span>
        <span class="subtext"><i>E</i><sub><i>k</i></sub> = <i>e</i> <i>V</i></span>
      </div>

      <div class="stat-card">
        <span class="label">ド・ブロイ波長 λ</span>
        <span class="value highlight">{{ lambda_nm.toFixed(3) }} <span class="unit">nm</span></span>
        <span class="subtext"><span class="frac"><span class="num"><i>h</i></span><span class="den"><span class="math-radical">√</span><span class="math-radicand">2<i>m</i><sub><i>e</i></sub><i>e</i><i>V</i></span></span></span></span>
      </div>

      <div class="stat-card">
        <span class="label">光路差 2 <i>d</i> sinθ</span>
        <span class="value">{{ pathDiff_nm.toFixed(3) }} <span class="unit">nm</span></span>
        <span class="subtext">比 <span class="frac"><span class="num">2<i>d</i> sinθ</span><span class="den">λ</span></span>: {{ (pathDiff_nm / lambda_nm).toFixed(2) }}</span>
      </div>

      <div class="stat-card">
        <span class="label">回折リング半径 <i>R</i></span>
        <span class="value">{{ ringRadiusPx.toFixed(0) }} <span class="unit">px</span></span>
        <span class="subtext"><i>R</i> ∝ λ ∝ <span class="frac"><span class="num">1</span><span class="den"><span class="math-radical">√</span><span class="math-radicand"><i>V</i></span></span></span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const voltage = ref(100) // V
const d_nm = ref(0.215) // nm (例: ニッケル結晶格子)
const thetaDeg = ref(16.6) // 度 (1次ブラッグ角)
const showRings = ref(true)

// ド・ブロイ波長計算:
// λ = h / sqrt(2 m e V) = 1.226 / sqrt(V) [nm]
const lambda_nm = computed(() => 1.22639 / Math.sqrt(voltage.value))

const thetaRad = computed(() => (thetaDeg.value * Math.PI) / 180)
const pathDiff_nm = computed(() => 2 * d_nm.value * Math.sin(thetaRad.value))

// ブラッグ条件判定 2d sinθ = n λ
const braggRatio = computed(() => pathDiff_nm.value / lambda_nm.value)
const nearestN = computed(() => Math.round(braggRatio.value))
const braggDiff = computed(() => Math.abs(braggRatio.value - nearestN.value))
const isBraggMatched = computed(() => nearestN.value >= 1 && braggDiff.value < 0.05)
const braggOrder = computed(() => nearestN.value)

// 回折リング半径 (R ∝ λ ∝ 1/sqrt(V))
const ringRadiusPx = computed(() => {
  // スクリーン距離 L, 格子面間隔 d に対し R ≈ 2 L θ ≈ L λ / d
  return Math.min(80, Math.max(15, (lambda_nm.value / d_nm.value) * 60))
})

const snapToBragg = () => {
  // 2d sinθ = 1 * λ  ⇒ sinθ = λ / (2d)
  const sinTarget = lambda_nm.value / (2 * d_nm.value)
  if (sinTarget <= 0.95) {
    const targetDeg = (Math.asin(sinTarget) * 180) / Math.PI
    thetaDeg.value = Math.round(targetDeg * 10) / 10
  }
}

const resetDefaults = () => {
  voltage.value = 100
  d_nm.value = 0.215
  thetaDeg.value = 16.6
}

let animId = null
let waveTime = 0

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  // 背景
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, '#090d16')
  bgGrad.addColorStop(1, '#111827')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 左側: 結晶格子とブラッグ反射作図 (x: 20〜460)
  // 右側: 電子線回折リング（蛍光スクリーン） (x: 480〜680)

  // 1. 結晶格子の原子面
  const atomRows = 3
  const atomCols = 7
  const startX = 60
  const spacingX = 50
  const spacingY = 55 // d に相当するピクセル間隔
  const firstRowY = 160

  // 格子面（破線）
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  for (let r = 0; r < atomRows; r++) {
    const y = firstRowY + r * spacingY
    ctx.beginPath()
    ctx.moveTo(startX - 20, y)
    ctx.lineTo(startX + (atomCols - 1) * spacingX + 20, y)
    ctx.stroke()
  }
  ctx.setLineDash([])

  // 格子面間隔 d の寸法線 (第2層〜第3層間に表示して入射波との重なりを回避)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  const dimX = 26
  const dimY1 = firstRowY + spacingY
  const dimY2 = firstRowY + spacingY * 2
  ctx.beginPath()
  ctx.moveTo(dimX, dimY1)
  ctx.lineTo(dimX, dimY2)
  ctx.moveTo(dimX - 4, dimY1)
  ctx.lineTo(dimX + 4, dimY1)
  ctx.moveTo(dimX - 4, dimY2)
  ctx.lineTo(dimX + 4, dimY2)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`d = ${d_nm.value.toFixed(2)} nm`, dimX + 6, (dimY1 + dimY2) / 2 + 4)

  // 原子球の描画
  for (let r = 0; r < atomRows; r++) {
    const y = firstRowY + r * spacingY
    for (let c = 0; c < atomCols; c++) {
      const x = startX + c * spacingX
      ctx.fillStyle = '#64748b'
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 2. 電子線（物質波）の入射波・反射波
  // 第1層のターゲット原子 A: c=2, r=0
  const targetAx = startX + 2 * spacingX
  const targetAy = firstRowY

  // 第2層のターゲット原子 B: c=2, r=1
  const targetBx = startX + 2 * spacingX
  const targetBy = firstRowY + spacingY

  const th = thetaRad.value
  const rayLen = 140

  // 入射ベクトル (左上から targetA / targetB へ)
  // 入射角 θ は格子面（水平面）となす角
  const inVx = Math.cos(th)
  const inVy = Math.sin(th)

  // 反射ベクトル (右向き)
  const refVx = Math.cos(th)
  const refVy = -Math.sin(th)

  // 線1: Aに入射・反射
  const aInX = targetAx - inVx * rayLen
  const aInY = targetAy - inVy * rayLen
  const aRefX = targetAx + refVx * rayLen
  const aRefY = targetAy + refVy * rayLen

  // 線2: Bに入射・反射
  const bInX = targetBx - inVx * rayLen
  const bInY = targetBy - inVy * rayLen
  const bRefX = targetBx + refVx * rayLen
  const bRefY = targetBy + refVy * rayLen

  // 入射波 (ベースライン + ド・ブロイ物質波アニメーション)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(aInX, aInY)
  ctx.lineTo(targetAx, targetAy)
  ctx.moveTo(bInX, bInY)
  ctx.lineTo(targetBx, targetBy)
  ctx.stroke()

  // 反射波ベースライン
  ctx.strokeStyle = isBraggMatched.value ? 'rgba(52, 211, 153, 0.35)' : 'rgba(100, 116, 139, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(targetAx, targetAy)
  ctx.lineTo(aRefX, aRefY)
  ctx.moveTo(targetBx, targetBy)
  ctx.lineTo(bRefX, bRefY)
  ctx.stroke()

  // ド・ブロイ波の正弦波形描画
  const waveLambdaPx = Math.max(14, (lambda_nm.value / 0.1226) * 26)
  const kWave = (2 * Math.PI) / waveLambdaPx
  const ampIn = 5.5
  const ampOut = isBraggMatched.value ? 6.5 : 2.2
  const phaseDiffRad = braggRatio.value * 2 * Math.PI
  const refColor = isBraggMatched.value ? '#34d399' : '#64748b'

  const drawWaveSegment = (x1, y1, x2, y2, phase, amp, color, lw) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy)
    if (len < 1) return
    const ux = dx / len
    const uy = dy / len
    const nx = -uy
    const ny = ux
    ctx.strokeStyle = color
    ctx.lineWidth = lw
    ctx.beginPath()
    for (let s = 0; s <= len; s += 2) {
      const w = Math.sin(kWave * s + phase) * amp
      const px = x1 + ux * s + nx * w
      const py = y1 + uy * s + ny * w
      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  drawWaveSegment(aInX, aInY, targetAx, targetAy, -waveTime * 2.5, ampIn, '#38bdf8', 2)
  drawWaveSegment(bInX, bInY, targetBx, targetBy, -waveTime * 2.5, ampIn, '#38bdf8', 2)
  drawWaveSegment(targetAx, targetAy, aRefX, aRefY, -waveTime * 2.5, ampOut, refColor, isBraggMatched.value ? 2.5 : 1.5)
  drawWaveSegment(targetBx, targetBy, bRefX, bRefY, -waveTime * 2.5 + phaseDiffRad, ampOut, refColor, isBraggMatched.value ? 2.5 : 1.5)

  // 経路差（幾何学的補助線）
  // targetA から 線2 への垂線の足 P, Q
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 3])
  const perpDist = spacingY * Math.cos(th)
  const px = targetBx - inVx * (spacingY * Math.sin(th))
  const py = targetBy - inVy * (spacingY * Math.sin(th))
  const qx = targetBx + refVx * (spacingY * Math.sin(th))
  const qy = targetBy + refVy * (spacingY * Math.sin(th))

  ctx.beginPath()
  ctx.moveTo(targetAx, targetAy)
  ctx.lineTo(px, py)
  ctx.moveTo(targetAx, targetAy)
  ctx.lineTo(qx, qy)
  ctx.stroke()
  ctx.setLineDash([])

  // 経路差の強調
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(targetBx, targetBy)
  ctx.lineTo(qx, qy)
  ctx.stroke()

  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('経路差 2d sinθ', targetBx, targetBy + 25)

  // 角度 θ の弧
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(targetAx - 40, targetAy, 25, 0, -th, true)
  ctx.stroke()
  ctx.fillStyle = '#f59e0b'
  ctx.font = '11px sans-serif'
  ctx.fillText('θ', targetAx - 65, targetAy - 8)

  // --- 右側: 蛍光スクリーン上の電子線回折リング ---
  if (showRings.value) {
    const screenCenterX = 570
    const screenCenterY = 150
    const screenR = 90

    // スクリーン枠（円形）
    const screenGrad = ctx.createRadialGradient(screenCenterX, screenCenterY, 5, screenCenterX, screenCenterY, screenR)
    screenGrad.addColorStop(0, '#022c22')
    screenGrad.addColorStop(1, '#064e3b')
    ctx.fillStyle = screenGrad
    ctx.beginPath()
    ctx.arc(screenCenterX, screenCenterY, screenR, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.stroke()

    // 中央の明るいスポット（直進ビーム）
    ctx.fillStyle = '#ecfdf5'
    ctx.beginPath()
    ctx.arc(screenCenterX, screenCenterY, 4, 0, Math.PI * 2)
    ctx.fill()

    // 第1回折リング (波長 λ に比例)
    const r1 = ringRadiusPx.value
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(screenCenterX, screenCenterY, r1, 0, Math.PI * 2)
    ctx.stroke()

    // 第2回折リング (高次)
    const r2 = r1 * 1.65
    if (r2 < screenR - 5) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(screenCenterX, screenCenterY, r2, 0, Math.PI * 2)
      ctx.stroke()
    }

    // スクリーン注記
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('【蛍光スクリーン (回折リング)】', screenCenterX, screenCenterY - screenR - 10)
    ctx.fillStyle = '#6ee7b7'
    ctx.font = '10px sans-serif'
    ctx.fillText(`電圧上昇でリング縮小 (R ∝ 1/√V)`, screenCenterX, screenCenterY + screenR + 18)
  }
}

const animate = () => {
  waveTime += 0.05
  draw()
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border-radius: 12px;
  padding: 1.2rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.sim-header .icon {
  font-size: 1.5rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #38bdf8;
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.canvas-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #000;
}

canvas {
  width: 100%;
  height: auto;
  display: block;
}

.bragg-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
  border: 1px solid #334155;
  backdrop-filter: blur(4px);
  transition: all 0.3s;
}

.bragg-badge.matched {
  background: rgba(16, 185, 129, 0.3);
  color: #34d399;
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.control-panel {
  margin-top: 1rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.control-group strong {
  color: #38bdf8;
}

.btn-group {
  display: flex;
  margin-top: 0.2rem;
}

.select-btn {
  width: 100%;
  padding: 0.4rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: #059669;
  color: white;
  border-color: #34d399;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #059669;
  color: white;
}
.btn-primary:hover {
  background: #047857;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.btn-secondary:hover {
  background: #475569;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
}

.stat-card {
  background: #1e293b;
  padding: 0.7rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 3px solid #38bdf8;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.stat-card .value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #34d399;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.65rem;
  color: #64748b;
  margin-top: 0.2rem;
}
</style>
