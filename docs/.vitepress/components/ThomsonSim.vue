<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔬</span>
        <h3>トムソンの比電荷測定と速度セレクターシミュレーター</h3>
      </div>
      <p class="subtitle">
        1897年にJ.J.トムソンが電子を発見し、その比電荷 e/m approx 1.76 times 10<sup>11</sup>,C/kg を測定した陰極線実験。
        直交する電場 <i>E</i> と磁場 <i>B</i> による静電力 eE とローレンツ力 evB のつり合い（速度セレクター v = E/B）と、蛍光板上の輝点変位をリアルタイム追跡できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="320"></canvas>
      <div class="beam-badge" :class="{ balanced: isVelocitySelected }">
        <span>{{ isVelocitySelected ? '🎯 直進（速度セレクター成立 v = E/B）' : (netDeflection > 0 ? '▲ 上向きに偏向' : '▼ 下向きに偏向') }}</span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>電子加速電圧 <i>V</i><sub>0</sub>: <strong>{{ accelVoltageV }} V</strong></span>
            <input type="range" v-model.number="accelVoltageV" min="100" max="1000" step="50" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>偏向電場 <i>E</i>: <strong>{{ electricFieldKVpm.toFixed(1) }} kV/m</strong></span>
            <input type="range" v-model.number="electricFieldKVpm" min="-15" max="15" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>直交磁場 <i>B</i>: <strong>{{ magneticFieldMT.toFixed(2) }} mT</strong></span>
            <input type="range" v-model.number="magneticFieldMT" min="-2.0" max="2.0" step="0.1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>粒子の種類:</span>
            <select v-model="particleType" class="custom-select">
              <option value="electron">電子 e⁻ (e/m = 1.76 × 10¹¹ C/kg)</option>
              <option value="proton">陽子 p⁺ (e/m = 9.58 × 10⁷ C/kg)</option>
              <option value="alpha">α粒子 ⁴He²⁺ (e/m = 4.82 × 10⁷ C/kg)</option>
            </select>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="autoBalanceVelocity">
          🎯 速度セレクター（直進条件）に自動調整
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">粒子の入射初速 <i>v</i><sub>0</sub></span>
        <span class="value highlight">{{ (speedMs / 1e6).toFixed(2) }} <span class="unit">× 10⁶ m/s</span></span>
        <span class="subtext"><i>v</i><sub>0</sub> = sqrt{2 q / m <i>V</i><sub>0</sub>} (光速の {{ (speedMs / 3e8 * 100).toFixed(1) }}%)</span>
      </div>

      <div class="stat-card">
        <span class="label">静電気力 <i>F</i><sub>E</sub></span>
        <span class="value">{{ electricForceFN.toFixed(2) }} <span class="unit">fN</span></span>
        <span class="subtext"><i>F</i><sub>E</sub> = q E (1 fN = 10⁻¹⁵ N)</span>
      </div>

      <div class="stat-card">
        <span class="label">ローレンツ力 <i>F</i><sub>B</sub></span>
        <span class="value">{{ lorentzForceFN.toFixed(2) }} <span class="unit">fN</span></span>
        <span class="subtext"><i>F</i><sub>B</sub> = q v B</span>
      </div>

      <div class="stat-card">
        <span class="label">スクリーン上の変位 <i>y</i></span>
        <span class="value">{{ screenYMm.toFixed(1) }} <span class="unit">mm</span></span>
        <span class="subtext">比電荷 e/m = {{ (ratioEM / 1e11).toFixed(2) }} times 10<sup>11</sup></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const accelVoltageV = ref(400)      // V
const electricFieldKVpm = ref(5.0)  // kV/m (上向き/下向き)
const magneticFieldMT = ref(0.42)   // mT (紙面奥向き/手前向き)
const particleType = ref('electron')

// 物理定数
const constants = {
  electron: { q: -1.602e-19, m: 9.109e-31, ratio: 1.7588e11 },
  proton: { q: 1.602e-19, m: 1.673e-27, ratio: 9.578e7 },
  alpha: { q: 3.204e-19, m: 6.644e-27, ratio: 4.822e7 }
}

const currentConst = computed(() => constants[particleType.value])
const ratioEM = computed(() => currentConst.value.ratio)

// 初速 v0 = sqrt(2 * (q/m) * V0)
const speedMs = computed(() => {
  const q_abs = Math.abs(currentConst.value.q)
  const m = currentConst.value.m
  return Math.sqrt((2 * q_abs * accelVoltageV.value) / m)
})

// 電場 E (V/m)
const EVpm = computed(() => electricFieldKVpm.value * 1e3)
// 磁場 B (T)
const BT = computed(() => magneticFieldMT.value * 1e-3)

// 力 F_E = q * E (N)
const electricForceFN = computed(() => {
  const q = currentConst.value.q
  return Math.abs(q * EVpm.value) * 1e15 // fN
})

// 力 F_B = q * v * B (N)
const lorentzForceFN = computed(() => {
  const q = currentConst.value.q
  return Math.abs(q * speedMs.value * BT.value) * 1e15 // fN
})

// 速度セレクター条件: E = v * B
const isVelocitySelected = computed(() => {
  if (Math.abs(BT.value) < 1e-6) return Math.abs(EVpm.value) < 100
  const idealE = speedMs.value * Math.abs(BT.value)
  return Math.abs(Math.abs(EVpm.value) - idealE) < idealE * 0.05
})

const netDeflection = computed(() => {
  // y加速度 ay = (q * E - q * v * B) / m
  const q = currentConst.value.q
  const m = currentConst.value.m
  const fy = q * EVpm.value - q * speedMs.value * BT.value
  return fy / m
})

// スクリーン上変位 (mm)
const screenYMm = computed(() => {
  // L1 = 偏向部 0.1m, L2 = スクリーンまで 0.15m
  const t1 = 0.1 / speedMs.value
  const t2 = 0.15 / speedMs.value
  const ay = netDeflection.value
  const y1 = 0.5 * ay * t1 ** 2
  const vy1 = ay * t1
  const y2 = vy1 * t2
  return (y1 + y2) * 1e3 // mm
})

function autoBalanceVelocity() {
  // E = v * B を満たすように E を自動設定
  const targetE = speedMs.value * BT.value
  electricFieldKVpm.value = Math.round((targetE / 1e3) * 10) / 10
}

function resetDefaults() {
  accelVoltageV.value = 400
  electricFieldKVpm.value = 5.0
  magneticFieldMT.value = 0.42
  particleType.value = 'electron'
}

let animId = null
const beamParticles = []

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

  const gunX = 60
  const gunY = h / 2
  const plateStartX = 180
  const plateEndX = 420
  const plateGap = 110
  const screenX = w - 60

  // 1. 電子銃（陰極と陽極加速スリット）
  ctx.fillStyle = '#334155'
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2
  ctx.fillRect(gunX - 35, gunY - 25, 30, 50)
  ctx.strokeRect(gunX - 35, gunY - 25, 30, 50)

  // 加速スリット板
  ctx.fillRect(gunX + 30, gunY - 40, 10, 32)
  ctx.fillRect(gunX + 30, gunY + 8, 10, 32)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('電子銃', gunX - 20, gunY - 32)
  ctx.fillText(`V₀=${accelVoltageV.value}V`, gunX + 35, gunY + 54)

  // 2. 平行平板電極（上極板・下極板）
  const topPlateY = gunY - plateGap / 2
  const botPlateY = gunY + plateGap / 2

  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  // 上極板 (+)
  ctx.fillRect(plateStartX, topPlateY - 12, plateEndX - plateStartX, 12)
  ctx.strokeRect(plateStartX, topPlateY - 12, plateEndX - plateStartX, 12)
  // 下極板 (-)
  ctx.fillRect(plateStartX, botPlateY, plateEndX - plateStartX, 12)
  ctx.strokeRect(plateStartX, botPlateY, plateEndX - plateStartX, 12)

  // 電場ベクトル矢印の描画
  if (Math.abs(electricFieldKVpm.value) > 0.2) {
    const isUp = electricFieldKVpm.value > 0
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
    ctx.lineWidth = 1
    for (let px = plateStartX + 30; px < plateEndX; px += 45) {
      const yFrom = isUp ? botPlateY - 4 : topPlateY + 4
      const yTo = isUp ? topPlateY + 4 : botPlateY - 4
      ctx.beginPath()
      ctx.moveTo(px, yFrom); ctx.lineTo(px, yTo)
      ctx.stroke()
      // 矢尻
      ctx.beginPath()
      ctx.moveTo(px, yTo)
      ctx.lineTo(px - 4, yTo + (isUp ? 8 : -8))
      ctx.lineTo(px + 4, yTo + (isUp ? 8 : -8))
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'
      ctx.fill()
    }
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(`電場 E (${electricFieldKVpm.value} kV/m)`, (plateStartX + plateEndX) / 2, topPlateY - 20)
  }

  // 3. 磁場領域マーク (×: 画面奥向き, •: 画面手前向き)
  if (Math.abs(magneticFieldMT.value) > 0.05) {
    const isIntoScreen = magneticFieldMT.value > 0
    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)'
    ctx.font = '12px monospace'
    for (let px = plateStartX + 20; px < plateEndX; px += 40) {
      for (let py = topPlateY + 20; py < botPlateY; py += 35) {
        ctx.fillText(isIntoScreen ? '×' : '•', px, py)
      }
    }
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(`磁場 B (${magneticFieldMT.value} mT ${magneticFieldMT.value > 0 ? '⊗奥' : '⊙手前'})`, (plateStartX + plateEndX) / 2, botPlateY + 28)
  }

  // 4. 蛍光スクリーン（右端）
  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.fillRect(screenX, gunY - 110, 16, 220)
  ctx.strokeRect(screenX, gunY - 110, 16, 220)

  // 目盛り線
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 1
  for (let sy = gunY - 90; sy <= gunY + 90; sy += 30) {
    ctx.beginPath()
    ctx.moveTo(screenX, sy); ctx.lineTo(screenX + 8, sy)
    ctx.stroke()
  }

  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px sans-serif'
  ctx.fillText('蛍光板', screenX + 8, gunY - 120)

  // 5. 陰極線ビーム軌道の描画
  // 軌道計算
  const scaleDeflect = 0.000000000000015 // 描画スケーリング
  // 偏向部加速度
  const ay = netDeflection.value * scaleDeflect

  ctx.save()
  ctx.strokeStyle = '#34d399'
  ctx.lineWidth = 2.5
  ctx.shadowColor = '#34d399'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(gunX, gunY)

  // 区間1: 電子銃から偏向板入口まで (直進)
  ctx.lineTo(plateStartX, gunY)

  // 区間2: 偏向板内部 (放物線軌道)
  let curY = gunY
  let curVy = 0
  const plateLen = plateEndX - plateStartX
  for (let px = 0; px <= plateLen; px += 4) {
    const t = px / plateLen
    // y = 0.5 * ay * t^2
    const yDisp = 0.5 * ay * (t * 80) ** 2
    curY = gunY - yDisp
    ctx.lineTo(plateStartX + px, curY)
  }
  curVy = ay * (80)

  // 区間3: 偏向板出口からスクリーンまで (等速直線運動)
  const freeLen = screenX - plateEndX
  const finalY = Math.max(gunY - 105, Math.min(gunY + 105, curY - curVy * (freeLen / 80)))
  ctx.lineTo(screenX, finalY)
  ctx.stroke()
  ctx.restore()

  // スクリーン上の輝点（発光スポット）
  ctx.fillStyle = '#34d399'
  ctx.shadowColor = '#34d399'
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.arc(screenX + 4, finalY, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // 輝点の中心からのズレ注記
  ctx.fillStyle = '#a7f3d0'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'left'
  const dispText = `${(gunY - finalY > 0 ? '+' : '')}${((gunY - finalY) * 0.4).toFixed(1)} mm`
  ctx.fillText(`輝点変位: ${dispText}`, screenX + 22, finalY + 4)

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
.beam-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.beam-badge.balanced {
  border-color: #34d399;
  color: #34d399;
  background: rgba(52, 211, 153, 0.2);
}

.custom-select {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8fafc;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100%;
  margin-top: 4px;
}
</style>
