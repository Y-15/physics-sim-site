<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧲</span>
        <h3>ホール効果・キャリア判定シミュレーター</h3>
      </div>
      <p class="subtitle">磁場中の導体・半導体に電流を流したときに発生するホール電圧 <i>V</i><sub><i>H</i></sub>。電子キャリア（-<i>e</i>）と正孔キャリア（+<i>e</i>）で生じる起電力の極性が逆転する仕組みを可視化します。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="carrier-badge" :class="carrierType">
        キャリア: {{ carrierType === 'electron' ? '自由電子 (金属 / n型)' : '正孔・ホール (p型)' }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>キャリアの種類:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: carrierType === 'electron' }" @click="carrierType = 'electron'">
                電子 (-e, n型/金属)
              </button>
              <button class="select-btn" :class="{ active: carrierType === 'hole' }" @click="carrierType = 'hole'">
                正孔 (+e, p型半導体)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>電流 <i>I</i>: <strong>{{ currentA.toFixed(1) }} A</strong> (右向き)</span>
            <input type="range" v-model.number="currentA" min="0.5" max="5.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>磁束密度 <i>B</i>: <strong>{{ magneticTesla.toFixed(1) }} T</strong> (手前→奥)</span>
            <input type="range" v-model.number="magneticTesla" min="0.2" max="2.0" step="0.2" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>キャリア密度 <i>n</i>: <strong>{{ carrierDensity }}</strong></span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: isHighDensity }" @click="isHighDensity = !isHighDensity">
                {{ isHighDensity ? '金属並 (高密度: 小VH)' : '半導体並 (低密度: 大VH)' }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="toggleCarrier">
          🔄 キャリア切り替え ({{ carrierType === 'electron' ? '正孔へ' : '電子へ' }})
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">ホール電圧 <i>V</i><sub><i>H</i></sub></span>
        <span class="value" :class="{ positive: signedVh > 0, negative: signedVh < 0 }">
          {{ signedVh > 0 ? '+' : '' }}{{ signedVh.toFixed(2) }} <span class="unit">mV</span>
        </span>
        <span class="subtext">上面電位 - 下面電位</span>
      </div>

      <div class="stat-card">
        <span class="label">上面の帯電極性</span>
        <span class="value highlight">{{ topChargeText }}</span>
        <span class="subtext">ローレンツ力による集積</span>
      </div>

      <div class="stat-card">
        <span class="label">ホール電場 <i>E</i><sub><i>H</i></sub></span>
        <span class="value">{{ (Math.abs(signedVh) / 20).toFixed(2) }} <span class="unit">V/m</span></span>
        <span class="subtext"><i>E</i><sub><i>H</i></sub> = <i>v</i> × <i>B</i></span>
      </div>

      <div class="stat-card">
        <span class="label">ドリフト速度 <i>v</i><sub><i>d</i></sub></span>
        <span class="value">{{ driftSpeedDisplay.toFixed(1) }} <span class="unit">mm/s</span></span>
        <span class="subtext">{{ carrierType === 'electron' ? '左向きにドリフト' : '右向きにドリフト' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const carrierType = ref('electron') // 'electron' (-e) or 'hole' (+e)
const currentA = ref(2.5) // A
const magneticTesla = ref(1.0) // T
const isHighDensity = ref(false)

const carrierDensity = computed(() => isHighDensity.value ? '高 (10²⁸ m⁻³)' : '中 (10²³ m⁻³)')

// ホール電圧の計算: V_H = (I * B) / (n * q * t)
// スケール調整した模擬ミリボルト値
const signedVh = computed(() => {
  const densityMult = isHighDensity.value ? 0.3 : 1.5
  const magnitude = currentA.value * magneticTesla.value * densityMult * 1.2
  // 電子（q = -e）の場合: 上面に電子が偏る -> 上面はマイナス電位 -> V_H = V_top - V_bottom < 0
  // 正孔（q = +e）の場合: 上面に正孔が偏る -> 上面はプラス電位 -> V_H > 0
  return carrierType.value === 'electron' ? -magnitude : magnitude
})

const topChargeText = computed(() => {
  return carrierType.value === 'electron' ? '負 (ー極)' : '正 (＋極)'
})

const driftSpeedDisplay = computed(() => {
  return (currentA.value / (isHighDensity.value ? 2.5 : 0.8)) * 1.5
})

const toggleCarrier = () => {
  carrierType.value = carrierType.value === 'electron' ? 'hole' : 'electron'
}

// キャリアパーティクル群
const particles = []
const initParticles = () => {
  particles.length = 0
  const count = 35
  for (let i = 0; i < count; i++) {
    particles.push({
      x: 100 + Math.random() * 260,
      y: 90 + Math.random() * 110,
      vx: 0,
      vy: 0
    })
  }
}

let animId = null

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

  // 左〜中央: 導体ブロック (x: 80〜420, y: 70〜220)
  // 右側: ホール電圧計 (x: 480〜670)

  const blockLeft = 100
  const blockRight = 420
  const blockTop = 80
  const blockBottom = 210
  const blockW = blockRight - blockLeft
  const blockH = blockBottom - blockTop

  // 1. 垂直磁場の記号（画面手前から奥へ向かう × 印）
  ctx.fillStyle = 'rgba(71, 85, 105, 0.4)'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  for (let gx = blockLeft - 20; gx <= blockRight + 20; gx += 40) {
    for (let gy = blockTop - 20; gy <= blockBottom + 30; gy += 40) {
      ctx.fillText('⊗', gx, gy)
    }
  }
  ctx.fillStyle = '#64748b'
  ctx.font = '11px sans-serif'
  ctx.fillText('一様磁場 B (奥向き ⊗)', blockLeft + 40, blockTop - 35)

  // 2. 導体ブロック本体
  ctx.fillStyle = 'rgba(30, 41, 59, 0.85)'
  ctx.fillRect(blockLeft, blockTop, blockW, blockH)
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 3
  ctx.strokeRect(blockLeft, blockTop, blockW, blockH)

  // 電流 I の矢印（右向き）
  ctx.strokeStyle = '#f59e0b'
  ctx.fillStyle = '#f59e0b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(blockLeft - 40, (blockTop + blockBottom) / 2)
  ctx.lineTo(blockLeft - 10, (blockTop + blockBottom) / 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(blockLeft - 10, (blockTop + blockBottom) / 2)
  ctx.lineTo(blockLeft - 18, (blockTop + blockBottom) / 2 - 5)
  ctx.lineTo(blockLeft - 18, (blockTop + blockBottom) / 2 + 5)
  ctx.closePath()
  ctx.fill()
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`電流 I (${currentA.value}A)`, blockLeft - 30, (blockTop + blockBottom) / 2 - 12)

  // 3. 上面・下面の蓄積電荷（＋／ー）
  const qCount = 8
  ctx.font = 'bold 13px monospace'
  if (carrierType.value === 'electron') {
    // 上面に電子（ー）、下面に正電荷（＋）
    ctx.fillStyle = '#38bdf8'
    for (let i = 0; i < qCount; i++) {
      ctx.fillText('-', blockLeft + 25 + i * 36, blockTop - 6)
    }
    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < qCount; i++) {
      ctx.fillText('+', blockLeft + 25 + i * 36, blockBottom + 16)
    }
  } else {
    // 正孔: 上面に正孔（＋）、下面に負電荷（ー）
    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < qCount; i++) {
      ctx.fillText('+', blockLeft + 25 + i * 36, blockTop - 6)
    }
    ctx.fillStyle = '#38bdf8'
    for (let i = 0; i < qCount; i++) {
      ctx.fillText('-', blockLeft + 25 + i * 36, blockBottom + 16)
    }
  }

  // 4. キャリア粒子の運動アニメーション
  const speed = driftSpeedDisplay.value * 0.4
  const isElec = carrierType.value === 'electron'

  particles.forEach(p => {
    // ドリフト移動: 電子は左へ（-speed）、正孔は右へ（+speed）
    p.x += isElec ? -speed : speed

    // ローレンツ力による上向き偏向 (f_L = q(v × B))
    // 電子: vは左向き(-x)、Bは奥向き(-z) ⇒ v × B は上向き、q=-e なので力は上向き！
    // 正孔: vは右向き(+x)、Bは奥向き(-z) ⇒ v × B は上向き、q=+e なので力は上向き！
    // どちらのキャリアも「上面（上向き）」にローレンツ力を受ける！
    p.y += -0.15 * magneticTesla.value

    // 境界判定
    if (p.x < blockLeft + 10) p.x = blockRight - 10
    if (p.x > blockRight - 10) p.x = blockLeft + 10
    if (p.y < blockTop + 8) p.y = blockBottom - 8
    if (p.y > blockBottom - 8) p.y = blockTop + 8

    // 粒子描画
    ctx.beginPath()
    ctx.arc(p.x, p.y, isElec ? 4.5 : 5.5, 0, Math.PI * 2)
    if (isElec) {
      ctx.fillStyle = '#38bdf8'
      ctx.fill()
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 9px monospace'
      ctx.fillText('-', p.x, p.y + 3)
    } else {
      ctx.fillStyle = '#ef4444'
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px monospace'
      ctx.fillText('+', p.x, p.y + 3)
    }
  })

  // 5. ホール電圧計へのリード線
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2
  // 上面端子
  ctx.beginPath()
  ctx.moveTo((blockLeft + blockRight) / 2, blockTop)
  ctx.lineTo((blockLeft + blockRight) / 2, blockTop - 25)
  ctx.lineTo(520, blockTop - 25)
  ctx.lineTo(520, 100)
  ctx.stroke()

  // 下面端子
  ctx.beginPath()
  ctx.moveTo((blockLeft + blockRight) / 2, blockBottom)
  ctx.lineTo((blockLeft + blockRight) / 2, blockBottom + 25)
  ctx.lineTo(580, blockBottom + 25)
  ctx.lineTo(580, 200)
  ctx.stroke()

  // --- 右側: アナログ電圧計 ---
  const meterCenterX = 560
  const meterCenterY = 150
  const meterR = 65

  // メーター背景円形パネル
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(meterCenterX, meterCenterY, meterR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.stroke()

  // 目盛り円弧
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(meterCenterX, meterCenterY + 15, 45, -Math.PI * 0.75, -Math.PI * 0.25)
  ctx.stroke()

  // ゼロ位置、マイナス、プラス
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px sans-serif'
  ctx.fillText('0', meterCenterX, meterCenterY - 33)
  ctx.fillText('-', meterCenterX - 35, meterCenterY - 15)
  ctx.fillText('+', meterCenterX + 35, meterCenterY - 15)

  // 指針
  // signedVh に応じて左右に傾く
  const maxVhDisplay = 10.0
  const needleAngle = -Math.PI / 2 + (signedVh.value / maxVhDisplay) * (Math.PI * 0.25)

  ctx.strokeStyle = signedVh.value >= 0 ? '#34d399' : '#f43f5e'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(meterCenterX, meterCenterY + 15)
  ctx.lineTo(meterCenterX + Math.cos(needleAngle) * 45, (meterCenterY + 15) + Math.sin(needleAngle) * 45)
  ctx.stroke()

  // 指針中心軸
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(meterCenterX, meterCenterY + 15, 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('ホール電圧計 V_H', meterCenterX, meterCenterY + 45)
}

const animate = () => {
  draw()
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  initParticles()
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

.carrier-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

.carrier-badge.electron {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.carrier-badge.hole {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
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

.btn-group {
  display: flex;
  gap: 0.3rem;
}

.select-btn {
  flex: 1;
  padding: 0.35rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: bold;
}

.control-group strong {
  color: #38bdf8;
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
  background: #0284c7;
  color: white;
}
.btn-primary:hover {
  background: #0369a1;
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

.stat-card .value.positive {
  color: #34d399;
}

.stat-card .value.negative {
  color: #f43f5e;
}

.stat-card .value.highlight {
  color: #f59e0b;
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
