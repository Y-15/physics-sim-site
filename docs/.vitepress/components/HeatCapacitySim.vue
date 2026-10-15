<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔥</span>
        <h3>気体のモル比熱・マイヤーの関係式シミュレーター</h3>
      </div>
      <p class="subtitle">定積変化と定圧変化における熱量 <i>Q</i> の使われ方の違い。分子構造（単原子・2原子・3原子）による自由度と、マイヤーの関係式 <i>C</i><sub><i>P</i></sub> = <i>C</i><sub><i>V</i></sub> + <i>R</i> を直感比較できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="280"></canvas>
      <div class="process-badge">
        {{ processType === 'isochoric' ? '🔒 定積変化 (体積一定: W = 0)' : '🔓 定圧変化 (ピストン自由: W = PΔV)' }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>気体の種類（分子構造）:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: gasType === 'mono' }" @click="gasType = 'mono'">
                単原子 (He, Ar)
              </button>
              <button class="select-btn" :class="{ active: gasType === 'di' }" @click="gasType = 'di'">
                2原子 (N₂, O₂)
              </button>
              <button class="select-btn" :class="{ active: gasType === 'poly' }" @click="gasType = 'poly'">
                多原子 (CO₂)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>状態変化の種類:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: processType === 'isochoric' }" @click="processType = 'isochoric'">
                定積変化 (ΔV = 0)
              </button>
              <button class="select-btn" :class="{ active: processType === 'isobaric' }" @click="processType = 'isobaric'">
                定圧変化 (ΔP = 0)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>気体の物質量 <i>n</i>: <strong>{{ mol.toFixed(1) }} mol</strong></span>
            <input type="range" v-model.number="mol" min="0.5" max="3.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>投入熱量 <i>Q</i>: <strong>{{ heatInputJ }} J</strong></span>
            <input type="range" v-model.number="heatInputJ" min="100" max="2000" step="100" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="applyHeat">
          🔥 熱を加える (加熱シミュレーション)
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 初期温度 (300 K) にリセット
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">定積モル比熱 <i>C</i><sub><i>V</i></sub></span>
        <span class="value">{{ (Cv_factor * 8.31).toFixed(1) }} <span class="unit">J/(mol·K)</span></span>
        <span class="subtext">{{ Cv_text }}</span>
      </div>

      <div class="stat-card">
        <span class="label">定圧モル比熱 <i>C</i><sub><i>P</i></sub></span>
        <span class="value">{{ (Cp_factor * 8.31).toFixed(1) }} <span class="unit">J/(mol·K)</span></span>
        <span class="subtext"><i>C</i><sub><i>V</i></sub> + <i>R</i> (マイヤー)</span>
      </div>

      <div class="stat-card">
        <span class="label">比熱比 γ = <i>C</i><sub><i>P</i></sub>/<i>C</i><sub><i>V</i></sub></span>
        <span class="value highlight">{{ gamma.toFixed(2) }}</span>
        <span class="subtext">{{ gammaFraction }}</span>
      </div>

      <div class="stat-card">
        <span class="label">温度上昇 Δ <i>T</i></span>
        <span class="value">{{ deltaT.toFixed(1) }} <span class="unit">K</span></span>
        <span class="subtext">現在温度: {{ tempK.toFixed(1) }} K</span>
      </div>
    </div>

    <!-- 熱力学第1法則 分配バー (Q = ΔU + W) -->
    <div class="energy-card">
      <div class="energy-header">
        <span>熱力学第1法則の分配: <i>Q</i> = Δ <i>U</i> + <i>W</i> (全熱量 <i>Q</i> = {{ heatInputJ }} <i>J</i>)</span>
      </div>
      <div class="energy-bar">
        <div class="bar-segment u" :style="{ width: deltaUPercent + '%' }" title="内部エネルギー増加"></div>
        <div class="bar-segment w" :style="{ width: workPercent + '%' }" title="外部にした仕事"></div>
      </div>
      <div class="legend-row">
        <div class="legend-item"><span class="dot u"></span>内部エネルギー増加 Δ <i>U</i> = <i>n</i> <i>C</i><sub><i>V</i></sub> Δ <i>T</i>: {{ deltaU.toFixed(1) }} J ({{ deltaUPercent.toFixed(0) }}%)</div>
        <div class="legend-item"><span class="dot w"></span>外部にした仕事 <i>W</i> = <i>P</i>Δ <i>V</i>: {{ workOut.toFixed(1) }} J ({{ workPercent.toFixed(0) }}%)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const gasType = ref('mono') // 'mono', 'di', 'poly'
const processType = ref('isobaric') // 'isochoric', 'isobaric'
const mol = ref(1.0)
const heatInputJ = ref(800)
const R = 8.31 // 気体定数 J/(mol*K)

const initialTemp = 300.0 // K
const tempK = ref(300.0)

// モル比熱係数
const Cv_factor = computed(() => {
  if (gasType.value === 'mono') return 1.5 // 3/2 R
  if (gasType.value === 'di') return 2.5 // 5/2 R
  return 3.0 // 3R
})

const Cp_factor = computed(() => Cv_factor.value + 1.0) // Mayer's relation: Cp = Cv + R

const gamma = computed(() => Cp_factor.value / Cv_factor.value)
const gammaFraction = computed(() => {
  if (gasType.value === 'mono') return '5/3 ≈ 1.67'
  if (gasType.value === 'di') return '7/5 = 1.40'
  return '8/6 ≈ 1.33'
})

const Cv_text = computed(() => {
  if (gasType.value === 'mono') return '(3/2)R'
  if (gasType.value === 'di') return '(5/2)R'
  return '3R'
})

// 計算値
const deltaT = computed(() => {
  const C_effective = processType.value === 'isochoric' ? (Cv_factor.value * R) : (Cp_factor.value * R)
  return heatInputJ.value / (mol.value * C_effective)
})

const deltaU = computed(() => {
  return mol.value * (Cv_factor.value * R) * deltaT.value
})

const workOut = computed(() => {
  if (processType.value === 'isochoric') return 0
  return heatInputJ.value - deltaU.value // W = n R deltaT
})

const deltaUPercent = computed(() => (deltaU.value / heatInputJ.value) * 100)
const workPercent = computed(() => (workOut.value / heatInputJ.value) * 100)

const applyHeat = () => {
  tempK.value = initialTemp + deltaT.value
}

const resetSim = () => {
  tempK.value = initialTemp
}

// 分子描画パーティクル
const molecules = []
const initMolecules = () => {
  molecules.length = 0
  const count = 40
  for (let i = 0; i < count; i++) {
    molecules.push({
      x: 100 + Math.random() * 200,
      y: 70 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      angle: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.1
    })
  }
}

let animId = null
let flameTime = 0

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  // 背景
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, '#0f172a')
  bgGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // シリンダー位置
  const cylLeft = 80
  const cylTop = 50
  const cylBottom = 220
  const cylH = cylBottom - cylTop
  const baseWidth = 240

  // ピストン位置（定圧変化で温度上昇時に右へ膨張）
  let pistonX = cylLeft + baseWidth
  if (processType.value === 'isobaric') {
    const expansionRatio = tempK.value / initialTemp
    pistonX = cylLeft + baseWidth * expansionRatio
  }

  // 1. シリンダー容器
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'
  ctx.fillRect(cylLeft, cylTop, pistonX - cylLeft, cylH)

  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 4
  ctx.beginPath()
  // 上壁
  ctx.moveTo(cylLeft + 350, cylTop)
  ctx.lineTo(cylLeft, cylTop)
  // 左壁（底）
  ctx.lineTo(cylLeft, cylBottom)
  // 下壁
  ctx.lineTo(cylLeft + 350, cylBottom)
  ctx.stroke()

  // 2. 加熱ヒーター（シリンダー底の下）
  const heaterX = cylLeft + 50
  const heaterY = cylBottom + 20
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(heaterX, heaterY, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Q', heaterX, heaterY + 4)

  // 炎のアニメーション
  ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'
  for (let f = 0; f < 5; f++) {
    const fx = cylLeft + 20 + f * 25
    const fy = cylBottom + 6
    const fH = 10 + Math.sin(flameTime * 5 + f) * 5
    ctx.beginPath()
    ctx.moveTo(fx - 6, fy)
    ctx.lineTo(fx, fy - fH)
    ctx.lineTo(fx + 6, fy)
    ctx.closePath()
    ctx.fill()
  }

  // 3. ピストン描画
  const pistonW = 20
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(pistonX, cylTop + 2, pistonW, cylH - 4)
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 2
  ctx.strokeRect(pistonX, cylTop + 2, pistonW, cylH - 4)

  // ピストンの柄
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(pistonX + pistonW, cylTop + cylH / 2)
  ctx.lineTo(pistonX + pistonW + 80, cylTop + cylH / 2)
  ctx.stroke()

  if (processType.value === 'isochoric') {
    // ピストン固定ストッパー描画
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(pistonX + pistonW, cylTop - 10, 15, 20)
    ctx.fillRect(pistonX + pistonW, cylBottom - 10, 15, 20)
    ctx.fillStyle = '#fff'
    ctx.font = '9px sans-serif'
    ctx.fillText('固定', pistonX + pistonW + 7, cylTop)
  }

  // 4. 気体分子の運動
  const speedMult = Math.sqrt(tempK.value / initialTemp) * 1.5

  molecules.forEach(m => {
    m.x += m.vx * speedMult
    m.y += m.vy * speedMult
    m.angle += m.vRot * speedMult

    // 壁との反射
    if (m.x < cylLeft + 10) { m.x = cylLeft + 10; m.vx *= -1 }
    if (m.x > pistonX - 10) { m.x = pistonX - 10; m.vx *= -1 }
    if (m.y < cylTop + 10) { m.y = cylTop + 10; m.vy *= -1 }
    if (m.y > cylBottom - 10) { m.y = cylBottom - 10; m.vy *= -1 }

    // 分子の形状描画
    ctx.save()
    ctx.translate(m.x, m.y)
    ctx.rotate(m.angle)

    if (gasType.value === 'mono') {
      // 単原子: 単一の球
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2)
      ctx.fill()
    } else if (gasType.value === 'di') {
      // 2原子: ダンベル型
      ctx.fillStyle = '#34d399'
      ctx.beginPath()
      ctx.arc(-4, 0, 3.5, 0, Math.PI * 2)
      ctx.arc(4, 0, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 1.5
      ctx.stroke()
    } else {
      // 多原子: 3原子折れ線型
      ctx.fillStyle = '#c084fc'
      ctx.beginPath()
      ctx.arc(0, 0, 4, 0, Math.PI * 2)
      ctx.arc(-5, -4, 3, 0, Math.PI * 2)
      ctx.arc(5, -4, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  })

  // 右側: 概念まとめテキスト
  const infoX = 490
  const infoY = 70
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('【自由度と比熱の理論値】', infoX, infoY)

  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#cbd5e1'
  if (gasType.value === 'mono') {
    ctx.fillText('・並進3自由度のみ', infoX, infoY + 25)
    ctx.fillText('・Cv = (3/2)R ≈ 12.5 J/(mol·K)', infoX, infoY + 45)
    ctx.fillText('・Cp = (5/2)R ≈ 20.8 J/(mol·K)', infoX, infoY + 65)
    ctx.fillText('・γ = 5/3 ≈ 1.67', infoX, infoY + 85)
  } else if (gasType.value === 'di') {
    ctx.fillText('・並進3 + 回転2 = 5自由度', infoX, infoY + 25)
    ctx.fillText('・Cv = (5/2)R ≈ 20.8 J/(mol·K)', infoX, infoY + 45)
    ctx.fillText('・Cp = (7/2)R ≈ 29.1 J/(mol·K)', infoX, infoY + 65)
    ctx.fillText('・γ = 7/5 = 1.40', infoX, infoY + 85)
  } else {
    ctx.fillText('・並進3 + 回転3 = 6自由度', infoX, infoY + 25)
    ctx.fillText('・Cv = 3R ≈ 24.9 J/(mol·K)', infoX, infoY + 45)
    ctx.fillText('・Cp = 4R ≈ 33.2 J/(mol·K)', infoX, infoY + 65)
    ctx.fillText('・γ = 4/3 ≈ 1.33', infoX, infoY + 85)
  }

  // 仕事の矢印（定圧時のみ）
  if (processType.value === 'isobaric' && tempK.value > initialTemp) {
    ctx.strokeStyle = '#f59e0b'
    ctx.fillStyle = '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(pistonX + 10, cylTop - 15)
    ctx.lineTo(pistonX + 60, cylTop - 15)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pistonX + 60, cylTop - 19)
    ctx.lineTo(pistonX + 70, cylTop - 15)
    ctx.lineTo(pistonX + 60, cylTop - 11)
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(`仕事 W = ${workOut.value.toFixed(0)} J`, pistonX + 15, cylTop - 25)
  }
}

const animate = () => {
  flameTime += 0.05
  draw()
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  initMolecules()
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

.process-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(30, 41, 59, 0.8);
  color: #38bdf8;
  border: 1px solid #334155;
  backdrop-filter: blur(4px);
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
  background: #ef4444;
  color: white;
}
.btn-primary:hover {
  background: #dc2626;
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

.energy-card {
  margin-top: 1rem;
  background: #1e293b;
  padding: 0.8rem 1rem;
  border-radius: 8px;
}

.energy-header {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.energy-bar {
  height: 14px;
  background: #0f172a;
  border-radius: 7px;
  overflow: hidden;
  display: flex;
}

.bar-segment {
  height: 100%;
  transition: width 0.2s ease-out;
}

.bar-segment.u {
  background: #0ea5e9;
}

.bar-segment.w {
  background: #f59e0b;
}

.legend-row {
  display: flex;
  justify-content: space-around;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.u { background: #0ea5e9; }
.dot.w { background: #f59e0b; }
</style>
