<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚡</span>
        <h3>X線の発生とスペクトル解析シミュレーター</h3>
      </div>
      <p class="subtitle">クーリッジ管での高速電子衝突によるX線発生。最短波長 $\lambda_0 = hc/eV$（デュアン＝ハント則）をもつ連続X線と、ターゲット金属固有の特性X線（$K_\alpha, K_\beta$）の波形変化を観察できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="target-badge">
        ターゲット: {{ targetData.name }} (原子番号 Z = {{ targetData.Z }})
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>ターゲット金属:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: targetKey === 'Mo' }" @click="targetKey = 'Mo'">
                モリブデン (Mo)
              </button>
              <button class="select-btn" :class="{ active: targetKey === 'Cu' }" @click="targetKey = 'Cu'">
                銅 (Cu)
              </button>
              <button class="select-btn" :class="{ active: targetKey === 'W' }" @click="targetKey = 'W'">
                タングステン (W)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>管電圧（加速電圧）$V$: <strong>{{ voltageKv.toFixed(0) }} kV</strong></span>
            <input type="range" v-model.number="voltageKv" min="20" max="80" step="2" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>フィラメント電流（電子流量）: <strong>{{ tubeCurrentMa.toFixed(0) }} mA</strong></span>
            <input type="range" v-model.number="tubeCurrentMa" min="5" max="30" step="1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">最短波長 $\lambda_0$</span>
        <span class="value highlight">{{ lambda0_pm.toFixed(1) }} <span class="unit">pm</span></span>
        <span class="subtext">hc / eV (デュアン=ハント)</span>
      </div>

      <div class="stat-card">
        <span class="label">電子の最大運動エネルギー</span>
        <span class="value">{{ voltageKv.toFixed(0) }} <span class="unit">keV</span></span>
        <span class="subtext">E = e V</span>
      </div>

      <div class="stat-card">
        <span class="label">特性X線 $K_\alpha$ 波長</span>
        <span class="value">{{ targetData.kAlphaPm }} <span class="unit">pm</span></span>
        <span class="subtext">固有エネルギー差で一定</span>
      </div>

      <div class="stat-card">
        <span class="label">特性X線 $K_\beta$ 波長</span>
        <span class="value">{{ targetData.kBetaPm }} <span class="unit">pm</span></span>
        <span class="subtext">M殻 → K殻 遷移</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const voltageKv = ref(45) // kV
const tubeCurrentMa = ref(15) // mA
const targetKey = ref('Mo') // 'Mo', 'Cu', 'W'

const targets = {
  Mo: { name: 'モリブデン (Mo)', Z: 42, kAlphaPm: 71.1, kBetaPm: 63.2, minExcitationKv: 20 },
  Cu: { name: '銅 (Cu)', Z: 29, kAlphaPm: 154.1, kBetaPm: 139.2, minExcitationKv: 9 },
  W: { name: 'タングステン (W)', Z: 74, kAlphaPm: 21.0, kBetaPm: 18.4, minExcitationKv: 69.5 }
}

const targetData = computed(() => targets[targetKey.value])

// 最短波長 λ0 [pm]
// λ0 = hc / (e V) = (1240 eV*nm) / (V_in_eV) = 1.240 / V_in_kV [nm] = 1240 / V_in_kV [pm]
const lambda0_pm = computed(() => 1240 / voltageKv.value)

const resetDefaults = () => {
  voltageKv.value = 45
  tubeCurrentMa.value = 15
  targetKey.value = 'Mo'
}

let animId = null
let electronOffset = 0

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

  // 左側: クーリッジ管（X線管）の構造 (x: 20〜320)
  // 右側: X線スペクトルグラフ (x: 350〜670)

  // --- クーリッジ管 ---
  const tubeLeft = 40
  const tubeTop = 60
  const tubeW = 270
  const tubeH = 170

  // ガラス真空管の輪郭
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
  ctx.fillRect(tubeLeft, tubeTop, tubeW, tubeH)
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.strokeRect(tubeLeft, tubeTop, tubeW, tubeH)

  // 1. 陰極フィラメント (左側)
  const cathX = tubeLeft + 35
  const cathY = tubeTop + tubeH / 2
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cathX - 15, cathY - 20)
  ctx.lineTo(cathX, cathY)
  ctx.lineTo(cathX - 15, cathY + 20)
  ctx.stroke()
  ctx.fillStyle = '#f59e0b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('陰極 (-)', cathX - 5, cathY - 28)

  // 2. 対陰極ターゲット (右側・斜め金属ブロック)
  const targX = tubeLeft + tubeW - 55
  const targY = tubeTop + tubeH / 2
  ctx.fillStyle = '#94a3b8'
  ctx.beginPath()
  ctx.moveTo(targX - 15, targY - 35)
  ctx.lineTo(targX + 25, targY - 35)
  ctx.lineTo(targX + 25, targY + 35)
  ctx.lineTo(targX + 5, targY + 35)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '10px sans-serif'
  ctx.fillText('対陰極 (+)', targX + 15, targY - 42)

  // 3. 高速電子ビーム（陰極から対陰極へ飛来）
  const eCount = 8
  ctx.fillStyle = '#38bdf8'
  for (let i = 0; i < eCount; i++) {
    const frac = ((electronOffset + i / eCount) % 1.0)
    const ex = cathX + frac * (targX - cathX - 10)
    const ey = cathY + (Math.sin(i * 1.5) * 6)
    ctx.beginPath()
    ctx.arc(ex, ey, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 4. 放出されるX線ビーム（下向きへ放射）
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 2
  for (let r = 0; r < 3; r++) {
    const rx = targX - 5 + (r - 1) * 15
    const ry = targY + 20
    ctx.beginPath()
    ctx.moveTo(rx, ry)
    ctx.lineTo(rx - 10, ry + 50)
    ctx.stroke()
    // 波線風
  }
  ctx.fillStyle = '#f43f5e'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('X線放射', targX - 10, targY + 80)

  // --- 右側: X線スペクトルグラフ ---
  const plotLeft = 360
  const plotRight = 670
  const plotTop = 50
  const plotBottom = 250
  const plotW = plotRight - plotLeft
  const plotH = plotBottom - plotTop

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.strokeRect(plotLeft, plotTop, plotW, plotH)

  // 軸ラベル
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('強度 I', plotLeft + 10, plotTop + 16)
  ctx.textAlign = 'right'
  ctx.fillText('波長 λ [pm] →', plotRight, plotBottom + 18)

  // 波長スケール: 0〜200 pm
  const maxLambdaScale = 200 // pm
  const pxPerPm = plotW / maxLambdaScale

  const l0 = lambda0_pm.value
  const l0X = plotLeft + l0 * pxPerPm

  // 最短波長 λ0 の垂直マーカー
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(l0X, plotTop)
  ctx.lineTo(l0X, plotBottom)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`λ₀=${l0.toFixed(0)}pm`, l0X, plotBottom + 16)

  // 連続X線 + 特性X線のスペクトル曲線描画
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(plotLeft, plotBottom)

  const peakLam = l0 * 1.5 // 連続X線の極大波長はおよそ 1.5 λ0
  const intensityScale = (tubeCurrentMa.value / 15) * ((voltageKv.value / 50) ** 1.5)

  for (let px = plotLeft; px <= plotRight; px += 2) {
    const lam = (px - plotLeft) / pxPerPm
    let yVal = 0

    if (lam >= l0) {
      // 制動放射（山形連続スペクトル）: Kramersの法則風近似
      const deltaL = lam - l0
      yVal = 0.55 * intensityScale * (deltaL / 35) * Math.exp(-(deltaL / 45))
    }

    // 特性X線の鋭いピーク (Ka, Kb)
    const ka = targetData.value.kAlphaPm
    const kb = targetData.value.kBetaPm
    const canExcite = voltageKv.value >= targetData.value.minExcitationKv

    if (canExcite) {
      // Ka ピーク
      if (Math.abs(lam - ka) < 6) {
        yVal += 0.8 * intensityScale * Math.exp(-Math.pow((lam - ka) / 1.2, 2))
      }
      // Kb ピーク
      if (Math.abs(lam - kb) < 5) {
        yVal += 0.45 * intensityScale * Math.exp(-Math.pow((lam - kb) / 1.0, 2))
      }
    }

    const py = plotBottom - Math.min(plotH - 5, yVal * plotH)
    if (px === plotLeft) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()

  // 特性X線ピークラベル
  const canExcite = voltageKv.value >= targetData.value.minExcitationKv
  if (canExcite) {
    const kaX = plotLeft + targetData.value.kAlphaPm * pxPerPm
    const kbX = plotLeft + targetData.value.kBetaPm * pxPerPm
    if (kaX < plotRight - 10) {
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText('Kα', kaX, plotTop + 35)
    }
    if (kbX < plotRight - 10) {
      ctx.fillStyle = '#34d399'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText('Kβ', kbX, plotTop + 65)
    }
  }
}

const animate = () => {
  electronOffset += 0.05
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

.target-badge {
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
  background: #334155;
  color: #e2e8f0;
}
.btn-primary:hover {
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
  color: #38bdf8;
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
