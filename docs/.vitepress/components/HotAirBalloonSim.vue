<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const insideTempC = ref(70) // 内部空気温度 [℃] (20 ~ 120)
const outsideTempC = ref(15) // 外気温度 [℃] (-10 ~ 35)
const balloonVolume = ref(2000) // 気球体積 V [m³] (1000 ~ 4000)
const balloonMass = ref(400) // 気球本体+カゴ+乗員質量 M [kg] (200 ~ 800)

let animationFrameId = null

const width = 500
const height = 400
const groundY = 340

// 気体定数・モル質量
// 空気の平均モル質量 M_air = 28.8 g/mol = 0.0288 kg/mol
// 標準大気圧 P0 = 101.3 kPa
// 密度 rho = P * M / (R * T) = 101300 * 0.0288 / (8.31 * T_kelvin) = 351.1 / T_kelvin
const simData = computed(() => {
  const TinK = insideTempC.value + 273.15
  const ToutK = outsideTempC.value + 273.15
  const V = balloonVolume.value
  const M = balloonMass.value
  const g = 9.8

  const rhoOut = 351.1 / ToutK // [kg/m³]
  const rhoIn = 351.1 / TinK   // [kg/m³]

  const buoyancy = rhoOut * V * g // 浮力 [N]
  const airWeight = rhoIn * V * g // 内部空気の重力 [N]
  const bodyWeight = M * g        // 気球本体の重力 [N]
  const totalWeight = airWeight + bodyWeight

  const netForce = buoyancy - totalWeight // 正味の上向きの力 [N]
  const canLift = netForce > 0

  // 浮上に必要な最低温度 T_min
  // (rhoOut - rhoIn) * V = M => rhoIn = rhoOut - M/V
  const rhoInRequired = rhoOut - M / V
  let minTempC = null
  if (rhoInRequired > 0) {
    const minTK = 351.1 / rhoInRequired
    minTempC = (minTK - 273.15).toFixed(1)
  }

  return {
    rhoOut: rhoOut.toFixed(3),
    rhoIn: rhoIn.toFixed(3),
    buoyancy: Math.round(buoyancy),
    airWeight: Math.round(airWeight),
    bodyWeight: Math.round(bodyWeight),
    totalWeight: Math.round(totalWeight),
    netForce: Math.round(netForce),
    canLift,
    minTempC
  }
})

// 気球のアニメーション位置 (高度)
const balloonAltitude = ref(0) // [m] (0 ~ 150)
const balloonVelocity = ref(0)

function updatePhysics() {
  const dt = 0.03
  const net = simData.value.netForce
  const totalM = balloonMass.value + parseFloat(simData.value.rhoIn) * balloonVolume.value

  // 加速度 a = net / totalM
  let a = net / totalM

  // 空気抵抗による減衰 -k * v
  a -= balloonVelocity.value * 0.4

  balloonVelocity.value += a * dt
  balloonAltitude.value += balloonVelocity.value * dt

  if (balloonAltitude.value < 0) {
    balloonAltitude.value = 0
    balloonVelocity.value = 0
  } else if (balloonAltitude.value > 120) {
    balloonAltitude.value = 120
    balloonVelocity.value = 0
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景 (上空グラデーション)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY)
  skyGrad.addColorStop(0, '#0f172a')
  skyGrad.addColorStop(0.7, '#1e293b')
  skyGrad.addColorStop(1, '#334155')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, width, height)

  // 地面
  ctx.fillStyle = '#1e3a1e'
  ctx.fillRect(0, groundY, width, height - groundY)
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(width, groundY)
  ctx.stroke()

  // 気球の位置
  // 高度 0m -> 気球底面が groundY に接する
  const altPx = balloonAltitude.value * 1.8
  const bCenterY = groundY - 70 - altPx
  const bCenterX = width / 2 - 40
  const bRadius = 45

  // 1. 気球の風船（涙滴型・エンベロープ）
  ctx.save()
  const balloonGrad = ctx.createRadialGradient(bCenterX - 10, bCenterY - 15, 5, bCenterX, bCenterY, bRadius)
  balloonGrad.addColorStop(0, '#f43f5e')
  balloonGrad.addColorStop(0.5, '#fb923c')
  balloonGrad.addColorStop(1, '#ea580c')
  ctx.fillStyle = balloonGrad
  ctx.strokeStyle = '#fed7aa'
  ctx.lineWidth = 2

  ctx.beginPath()
  // 涙滴型を描画
  ctx.arc(bCenterX, bCenterY, bRadius, Math.PI * 0.8, Math.PI * 0.2)
  ctx.lineTo(bCenterX + 12, bCenterY + bRadius + 15)
  ctx.lineTo(bCenterX - 12, bCenterY + bRadius + 15)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 風船の縦ストライプ模様
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(bCenterX, bCenterY, bRadius * 0.5, bRadius, 0, 0, Math.PI * 2)
  ctx.stroke()

  // 2. バーナーの炎（内部温度が高いほど激しい）
  if (insideTempC.value > outsideTempC.value + 10) {
    const flameH = Math.min(22, (insideTempC.value - outsideTempC.value) * 0.3)
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.moveTo(bCenterX - 6, bCenterY + bRadius + 14)
    ctx.quadraticCurveTo(bCenterX, bCenterY + bRadius + 14 - flameH, bCenterX + 6, bCenterY + bRadius + 14)
    ctx.closePath()
    ctx.fill()
  }

  // 3. カゴ（ゴンドラ）と吊りロープ
  const basketY = bCenterY + bRadius + 32
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(bCenterX - 10, bCenterY + bRadius + 15)
  ctx.lineTo(bCenterX - 8, basketY)
  ctx.moveTo(bCenterX + 10, bCenterY + bRadius + 15)
  ctx.lineTo(bCenterX + 8, basketY)
  ctx.stroke()

  ctx.fillStyle = '#78350f'
  ctx.fillRect(bCenterX - 10, basketY, 20, 14)
  ctx.strokeStyle = '#b45309'
  ctx.strokeRect(bCenterX - 10, basketY, 20, 14)
  ctx.restore()

  // 4. 力の矢印ベクトル表示
  const data = simData.value
  const arrowScale = 0.003

  // 浮力 F_B (上向き・緑)
  drawArrow(ctx, bCenterX + 70, bCenterY, bCenterX + 70, bCenterY - data.buoyancy * arrowScale, '#22c55e', `浮力 ${data.buoyancy}N`)

  // 全重力 W_total (下向き・赤)
  drawArrow(ctx, bCenterX + 130, bCenterY, bCenterX + 130, bCenterY + data.totalWeight * arrowScale, '#f43f5e', `重力 ${data.totalWeight}N`)

  updatePhysics()
  animationFrameId = requestAnimationFrame(draw)
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  const angle = Math.atan2(toY - fromY, toX - fromX)
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - 7 * Math.cos(angle - Math.PI / 6), toY - 7 * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - 7 * Math.cos(angle + Math.PI / 6), toY - 7 * Math.sin(angle + Math.PI / 6))
  ctx.fill()

  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(label, fromX + 8, (fromY + toY) / 2)
  ctx.restore()
}

function resetSim() {
  insideTempC.value = 70
  outsideTempC.value = 15
  balloonVolume.value = 2000
  balloonMass.value = 400
  balloonAltitude.value = 0
  balloonVelocity.value = 0
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🎈</span>
        <span>熱気球の浮力と大気・温度平衡シミュレーター</span>
      </div>
      <div class="badge" :class="{ 'badge-lift': simData.canLift }">
        {{ simData.canLift ? '🚀 浮上可能 (揚力あり)' : '⚓ 浮上不可 (重量過多)' }}
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="stat-overlay">
        <div class="stat-row">
          <span class="lbl">外気密度 ρ<sub>out</sub>:</span>
          <span class="val">{{ simData.rhoOut }} kg/m³</span>
        </div>
        <div class="stat-row">
          <span class="lbl">気球内密度 ρ<sub>in</sub>:</span>
          <span class="val" style="color: #fb923c">{{ simData.rhoIn }} kg/m³</span>
        </div>
        <div class="stat-row">
          <span class="lbl">浮力 <i>F</i><sub><i>B</i></sub>:</span>
          <span class="val" style="color: #22c55e">{{ simData.buoyancy }} N</span>
        </div>
        <div class="stat-row">
          <span class="lbl">総重量 <i>W</i>:</span>
          <span class="val" style="color: #f43f5e">{{ simData.totalWeight }} N</span>
        </div>
        <div class="stat-row highlight">
          <span class="lbl">合力 <i>F</i><sub>net</sub>:</span>
          <span class="val">{{ simData.netForce }} N</span>
        </div>
        <div class="min-temp" v-if="simData.minTempC">
          最低浮上温度: <strong>{{ simData.minTempC }} ℃</strong>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>内部加熱温度 <i>T</i><sub>in</sub>: <span>{{ insideTempC }} ℃</span></label>
          <input type="range" v-model.number="insideTempC" min="20" max="110" step="2" />
        </div>
        <div class="control-group">
          <label>外気温 <i>T</i><sub>out</sub>: <span>{{ outsideTempC }} ℃</span></label>
          <input type="range" v-model.number="outsideTempC" min="-10" max="35" step="1" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>気球体積 <i>V</i>: <span>{{ balloonVolume }} m³</span></label>
          <input type="range" v-model.number="balloonVolume" min="1000" max="3500" step="100" />
        </div>
        <div class="control-group">
          <label>本体質量 <i>M</i>: <span>{{ balloonMass }} kg</span></label>
          <input type="range" v-model.number="balloonMass" min="200" max="700" step="25" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-secondary" @click="insideTempC = 95">バーナー全開加熱</button>
        <button class="btn btn-reset" @click="resetSim">標準状態へリセット</button>
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
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.badge.badge-lift {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
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
  max-width: 500px;
  height: auto;
  aspect-ratio: 500 / 400;
  display: block;
}

.stat-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.88);
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

.stat-row.highlight {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.2rem;
  color: #38bdf8;
}

.min-temp {
  font-size: 0.7rem;
  color: #fbbf24;
  margin-top: 0.2rem;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  gap: 0.5rem;
}

.btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
