<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🌊 浮力とアルキメデスの原理・水圧シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge" :class="stateBadgeClass">{{ stateLabel }}</span>
      </div>
    </div>

    <!-- 再生コントロールバー -->
    <div class="playback-bar">
      <button class="sim-btn primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 手を離して浮沈アニメーション' }}
      </button>
      <button class="sim-btn secondary" @click="dropFromSurface">
        🔄 水面付近から再ドロップ
      </button>
      <button class="sim-btn secondary" @click="autoBalance">
        ⚖️ つり合い深さへ即移動
      </button>
    </div>

    <!-- メインCanvas -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">上面水深 h₁</div>
        <div class="stat-value text-blue">{{ depthTop.toFixed(1) }} <span class="stat-unit">cm</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">浸水体積 V_sub</div>
        <div class="stat-value text-cyan">{{ submergedVolume.toFixed(0) }} <span class="stat-unit">cm³</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">浮力 F_B (ρ₀ V g)</div>
        <div class="stat-value text-cyan">{{ buoyancyForce.toFixed(2) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">重力 W (Mg)</div>
        <div class="stat-value text-yellow">{{ gravityForce.toFixed(2) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">合力 (上向き正)</div>
        <div class="stat-value" :class="netForce >= 0 ? 'text-cyan' : 'text-rose'">
          {{ netForce >= 0 ? '+' : '' }}{{ netForce.toFixed(2) }} <span class="stat-unit">N</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>物体の深さ (上面位置):</span>
            <span class="control-val">{{ depthTop.toFixed(1) }} cm</span>
          </label>
          <input type="range" v-model.number="depthTop" min="-5" max="30" step="0.5" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>物体の密度 ρ:</span>
            <span class="control-val">{{ objectDensity.toFixed(2) }} g/cm³</span>
          </label>
          <input type="range" v-model.number="objectDensity" min="0.2" max="2.5" step="0.05" class="sim-slider" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>流体の密度 ρ₀:</span>
            <span class="control-val">{{ fluidDensity.toFixed(2) }} g/cm³</span>
          </label>
          <input type="range" v-model.number="fluidDensity" min="0.7" max="1.5" step="0.05" class="sim-slider" />
        </div>

        <div class="btn-group">
          <button @click="setPreset('wood')" class="sim-btn outline">木片 (0.6 g/cm³: 浮く)</button>
          <button @click="setPreset('water')" class="sim-btn outline">中立浮力 (1.0 g/cm³)</button>
          <button @click="setPreset('iron')" class="sim-btn outline">金属 (1.8 g/cm³: 沈む)</button>
          <button @click="autoBalance" class="sim-btn secondary">つり合い位置へ自動移動</button>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>力学の急所</strong>:
      浮力 <i>F</i><sub><i>B</i></sub> のミクロな正体は、<strong>「上面にかかる水圧 <i>P</i><sub>1</sub> よりも、深い下面にかかる水圧 <i>P</i><sub>2</sub> の方が大きい」</strong>という圧力差です。<br>
      底面積を <i>S</i> とすると、<i>F</i><sub><i>B</i></sub> = (<i>P</i><sub>2</sub> - <i>P</i><sub>1</sub>)<i>S</i> = ρ<sub>0</sub> <i>g</i> (<i>h</i><sub>2</sub> - <i>h</i><sub>1</sub>)<i>S</i> = ρ<sub>0</sub> <i>V</i><sub>浸</sub> <i>g</i> となり、完全に<strong>「物体が押しのけた流体の重さ（アルキメデスの原理）」</strong>と一致します！
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const blockWidth = 10 // cm
const blockHeight = 10 // cm
const blockArea = 100 // cm^2
const blockTotalVol = 1000 // cm^3 (10x10x10)

const depthTop = ref(5.0) // 上面の水深 [cm] (0が水面、負なら水面より上)
const objectDensity = ref(0.7) // g/cm^3
const fluidDensity = ref(1.0) // g/cm^3 (水)
const g = 9.8 // m/s^2

const isPlaying = ref(true)
let velY = 0 // 鉛直速度 (下向き正 [cm/s])
let waveTime = 0
let animId = null
let lastTime = 0

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value && Math.abs(netForce.value) < 0.05 && Math.abs(velY) < 0.5) {
    // つり合い状態で再生ボタンを押した場合は少し押し込んで単振動減衰を実演
    depthTop.value = Math.min(20, depthTop.value + 5.0)
    velY = 0
  }
}

function dropFromSurface() {
  depthTop.value = 4.0
  velY = 0
  isPlaying.value = true
}

// 浸水深さ [cm]
const submergedDepth = computed(() => {
  const top = depthTop.value
  const bottom = top + blockHeight
  if (bottom <= 0) return 0 // 完全に空中
  if (top >= 0) return blockHeight // 完全に水没
  return bottom // 一部浸水 (top < 0 && bottom > 0)
})

// 浸水体積 [cm^3]
const submergedVolume = computed(() => {
  return submergedDepth.value * blockArea
})

// 浮力 F_B [N]
// F_B = rho0 [kg/m^3] * V [m^3] * g
const buoyancyForce = computed(() => {
  const rho0_si = fluidDensity.value * 1000 // kg/m^3
  const V_si = submergedVolume.value * 1e-6 // m^3
  return rho0_si * V_si * g
})

// 重力 W [N]
const gravityForce = computed(() => {
  const rho_si = objectDensity.value * 1000 // kg/m^3
  const V_si = blockTotalVol * 1e-6 // m^3
  return rho_si * V_si * g
})

// 合力 (上向き正)
const netForce = computed(() => {
  return buoyancyForce.value - gravityForce.value
})

// 状態判定
const stateLabel = computed(() => {
  if (Math.abs(netForce.value) < 0.05) return '⚖️ つり合い静止中（浮力＝重力）'
  if (netForce.value > 0) return '⬆️ 浮上（浮力 ＞ 重力）'
  return '⬇️ 沈降（浮力 ＜ 重力）'
})

const stateBadgeClass = computed(() => {
  if (Math.abs(netForce.value) < 0.05) return 'badge-cyan'
  if (netForce.value > 0) return 'badge-yellow'
  return 'badge-rose'
})

function setPreset(type) {
  velY = 0
  if (type === 'wood') {
    objectDensity.value = 0.6
    fluidDensity.value = 1.0
    depthTop.value = 4.0
    isPlaying.value = true
  } else if (type === 'water') {
    objectDensity.value = 1.0
    fluidDensity.value = 1.0
    depthTop.value = 6.0
    isPlaying.value = true
  } else if (type === 'iron') {
    objectDensity.value = 1.8
    fluidDensity.value = 1.0
    depthTop.value = 0.0
    isPlaying.value = true
  }
}

function autoBalance() {
  velY = 0
  // つり合い浸水深さ: h_sub = (rho / rho0) * blockHeight
  if (objectDensity.value >= fluidDensity.value) {
    depthTop.value = 18.0 // 底に沈む
  } else {
    const h_sub = (objectDensity.value / fluidDensity.value) * blockHeight
    depthTop.value = Number((-(blockHeight - h_sub)).toFixed(1))
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // 水槽と液面設定
  const tankX = 60
  const tankY = 80
  const tankW = 580
  const tankH = 260
  const waterSurfaceY = tankY + 40 // 水面 y 座標

  // 1. 水（流体）の描画
  ctx.fillStyle = 'rgba(14, 116, 144, 0.3)'
  ctx.fillRect(tankX, waterSurfaceY, tankW, tankH - (waterSurfaceY - tankY))

  // 水面波線（リップルアニメーション付き）
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let wx = tankX; wx <= tankX + tankW; wx += 8) {
    const wy = waterSurfaceY + Math.sin(wx * 0.04 + waveTime * 3.5) * 1.8
    if (wx === tankX) ctx.moveTo(wx, wy)
    else ctx.lineTo(wx, wy)
  }
  ctx.stroke()

  ctx.fillStyle = '#38bdf8'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`水面 (大気圧 P₀, 密度 ρ₀ = ${fluidDensity.value.toFixed(2)} g/cm³)`, tankX + tankW - 15, waterSurfaceY - 8)
  ctx.textAlign = 'left'

  // 水槽の壁
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.strokeRect(tankX, tankY, tankW, tankH)

  // 2. 物体（直方体）の描画
  // スケール: 1cm = 6px
  const scale = 6
  const bw = blockWidth * scale // 60px
  const bh = blockHeight * scale // 60px
  const bx = 340 - bw / 2
  const by = waterSurfaceY + depthTop.value * scale

  // 直方体の塗り
  const isFloating = objectDensity.value < fluidDensity.value
  ctx.fillStyle = isFloating ? '#d97706' : '#64748b'
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2
  ctx.strokeRect(bx, by, bw, bh)

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('質量 M', bx + bw / 2, by + bh / 2 - 4)
  ctx.fillText(`(ρ=${objectDensity.value.toFixed(2)})`, bx + bw / 2, by + bh / 2 + 12)
  ctx.textAlign = 'left'

  // 3. 水圧の矢印（上面・下面・側面）
  // 上面圧力矢印 (下向き)
  if (depthTop.value > 0) {
    const pTopLen = Math.min(45, depthTop.value * 2.2)
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    for (let x = bx + 10; x <= bx + bw - 10; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, by - pTopLen)
      ctx.lineTo(x, by)
      ctx.stroke()
      // 矢じり
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(x, by)
      ctx.lineTo(x - 3, by - 5)
      ctx.lineTo(x + 3, by - 5)
      ctx.closePath()
      ctx.fill()
    }
    ctx.fillStyle = '#38bdf8'
    ctx.font = '11px sans-serif'
    ctx.fillText('上面水圧 P₁ S (下向き)', bx + bw + 15, by - 6)
  }

  // 下面圧力矢印 (上向き)
  const depthBottom = depthTop.value + blockHeight
  if (depthBottom > 0) {
    const pBotLen = Math.min(80, depthBottom * 2.2)
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 2.5
    for (let x = bx + 10; x <= bx + bw - 10; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, by + bh + pBotLen)
      ctx.lineTo(x, by + bh)
      ctx.stroke()
      // 矢じり
      ctx.fillStyle = '#22d3ee'
      ctx.beginPath()
      ctx.moveTo(x, by + bh)
      ctx.lineTo(x - 4, by + bh + 6)
      ctx.lineTo(x + 4, by + bh + 6)
      ctx.closePath()
      ctx.fill()
    }
    ctx.fillStyle = '#22d3ee'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('下面水圧 P₂ S (上向き・大！)', bx + bw + 15, by + bh + 16)
  }

  // 4. 合成ベクトル表示 (左側)
  const vecX = 140
  const vecY = 220

  // 重力ベクトル (下向き)
  const gLen = gravityForce.value * 12
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(vecX, vecY)
  ctx.lineTo(vecX, vecY + gLen)
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.moveTo(vecX, vecY + gLen)
  ctx.lineTo(vecX - 5, vecY + gLen - 8)
  ctx.lineTo(vecX + 5, vecY + gLen - 8)
  ctx.closePath()
  ctx.fill()
  ctx.font = '11px sans-serif'
  ctx.fillText(`重力 W = ${gravityForce.value.toFixed(2)} N`, vecX + 12, vecY + gLen - 4)

  // 浮力ベクトル (上向き)
  const bLen = buoyancyForce.value * 12
  if (bLen > 0) {
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(vecX, vecY)
    ctx.lineTo(vecX, vecY - bLen)
    ctx.stroke()
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(vecX, vecY - bLen)
    ctx.lineTo(vecX - 5, vecY - bLen + 8)
    ctx.lineTo(vecX + 5, vecY - bLen + 8)
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(`浮力 F_B = ${buoyancyForce.value.toFixed(2)} N`, vecX + 12, vecY - bLen + 14)
  }
}

function stepPhysics(dt) {
  waveTime += dt
  if (!isPlaying.value) return

  const massKg = (objectDensity.value * blockTotalVol) / 1000
  // 下向き正の加速度: (W - F_B - c*v) / m
  const damping = 3.2
  const fDown = -netForce.value - damping * (velY * 0.1)
  const accCm = (fDown / Math.max(0.1, massKg)) * 18 // 表示スケール加速度 [cm/s^2]

  velY += accCm * dt
  let nextDepth = depthTop.value + velY * dt

  // 水槽底（depthTop = 22cm）および上端（-8cm）での制限
  if (nextDepth > 22.0) {
    nextDepth = 22.0
    velY = -velY * 0.2
    if (Math.abs(velY) < 0.5) velY = 0
  } else if (nextDepth < -8.0) {
    nextDepth = -8.0
    velY = 0
  }

  depthTop.value = Number(nextDepth.toFixed(2))
}

function animate(ts) {
  if (!lastTime) lastTime = ts
  const dt = Math.min(0.05, (ts - lastTime) / 1000)
  lastTime = ts
  stepPhysics(dt)
  render()
  animId = requestAnimationFrame(animate)
}

watch([depthTop, objectDensity, fluidDensity], () => {
  render()
})

onMounted(() => {
  render()
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.sim-badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.canvas-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  background: #0f172a;
}

.sim-canvas {
  display: block;
  width: 100%;
  max-width: 700px;
  height: auto;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
}

.stat-label {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}

.control-val {
  color: #38bdf8;
  font-family: monospace;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.sim-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn.primary {
  background: #0284c7;
  color: #ffffff;
  border: none;
}
.sim-btn.primary:hover {
  background: #0369a1;
}

.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: none;
}
.sim-btn.secondary:hover {
  background: #475569;
}

.sim-btn.outline {
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  border: 1px solid #475569;
}
.sim-btn.outline:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
</style>
