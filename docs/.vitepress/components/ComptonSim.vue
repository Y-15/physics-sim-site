<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🔬 コンプトン効果・X線散乱シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge badge-cyan">光子の運動量保存</span>
        <span class="badge badge-yellow">エネルギー保存</span>
      </div>
    </div>

    <!-- メインCanvas -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">散乱角 θ</div>
        <div class="stat-value text-blue">{{ thetaDeg }}°</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">入射X線波長 λ₀</div>
        <div class="stat-value">{{ lambda0.toFixed(3) }} <span class="stat-unit">pm</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">波長の伸び Δλ</div>
        <div class="stat-value text-yellow">{{ deltaLambda.toFixed(3) }} <span class="stat-unit">pm</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">散乱光子波長 λ'</div>
        <div class="stat-value text-cyan">{{ (lambda0 + deltaLambda).toFixed(3) }} <span class="stat-unit">pm</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">反跳電子角 φ</div>
        <div class="stat-value text-rose">{{ phiDeg.toFixed(1) }}°</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>散乱光子の散乱角 θ:</span>
            <span class="control-val">{{ thetaDeg }}°</span>
          </label>
          <input type="range" v-model.number="thetaDeg" min="0" max="180" step="5" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>入射X線の波長 λ₀:</span>
            <span class="control-val">{{ lambda0.toFixed(2) }} pm (ピコメートル)</span>
          </label>
          <input type="range" v-model.number="lambda0" min="5" max="50" step="1" class="sim-slider" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="thetaDeg = 0" class="sim-btn outline">θ = 0° (直進・波長不変)</button>
        <button @click="thetaDeg = 90" class="sim-btn outline">θ = 90° (Δλ = h/mc)</button>
        <button @click="thetaDeg = 180" class="sim-btn outline">θ = 180° (真後ろ散乱・最大伸び)</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>物理の急所</strong>:
      光子は質量ゼロですが、アインシュタインの相対論より<strong>運動量 <i>p</i> = (<i>h</i> / λ)</strong> を持ちます。
      電子と弾性衝突してエネルギーの一部を電子に渡すため、散乱光子のエネルギーは低下し（<i>E</i>′ &lt; <i>E</i>）、<strong>波長が長くなります（<i>λ</i>′ &gt; <i>λ</i><sub>0</sub>）</strong>。
      波長の伸び Δ λ = (<i>h</i> / <i>m</i><sub><i>e</i></sub> <i>c</i>)(1 - cosθ) は、<strong>入射光の波長に関係なく「散乱角 θ だけ」で決まります！</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

// 散乱角 θ [deg]
const thetaDeg = ref(60)
// 入射波長 λ0 [pm = 10^-12 m]
const lambda0 = ref(20.0)

let animId = null
let wavePhase = 0

// コンプトン波長 h / (m_e * c) ≈ 2.426 pm
const comptonWavelength = 2.4263

// 波長の伸び Δλ [pm]
const deltaLambda = computed(() => {
  const rad = (thetaDeg.value * Math.PI) / 180
  return comptonWavelength * (1 - Math.cos(rad))
})

// 反跳電子の角度 φ [deg]
// tan φ = (λ' sin θ) / (λ' cos θ - λ0) の逆算 (運動量保存 y成分: p' sin θ = p_e sin φ, x成分: p0 - p' cos θ = p_e cos φ)
const phiDeg = computed(() => {
  if (thetaDeg.value === 0) return 0
  if (thetaDeg.value === 180) return 0
  const radTheta = (thetaDeg.value * Math.PI) / 180
  const l0 = lambda0.value
  const lp = l0 + deltaLambda.value

  // p0 = 1/l0, pp = 1/lp
  const p0 = 1 / l0
  const pp = 1 / lp
  const peX = p0 - pp * Math.cos(radTheta)
  const peY = pp * Math.sin(radTheta) // 下向き

  const radPhi = Math.atan2(peY, peX)
  return (radPhi * 180) / Math.PI
})

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  const cx = 250
  const cy = 190

  // 背景座標軸
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 中心衝突軸 (水平点線)
  ctx.strokeStyle = '#475569'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(40, cy)
  ctx.lineTo(width - 40, cy)
  ctx.stroke()
  ctx.setLineDash([])

  // 1. 入射光子 (左から中心へ進む波形と矢印)
  const k0 = 0.35 * (20 / lambda0.value)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  // 正弦波で描画 (時間とともに進行)
  for (let x = 60; x <= cx - 15; x += 2) {
    const waveY = cy + Math.sin((x - 60) * k0 - wavePhase) * 11
    if (x === 60) ctx.moveTo(x, waveY)
    else ctx.lineTo(x, waveY)
  }
  ctx.stroke()

  // 進行する入射光子パケット
  const inProg = ((wavePhase * 0.18) % 1)
  const inPktX = 60 + inProg * (cx - 75)
  const inPktY = cy + Math.sin((inPktX - 60) * k0 - wavePhase) * 11
  ctx.fillStyle = '#bae6fd'
  ctx.beginPath()
  ctx.arc(inPktX, inPktY, 4.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`入射X線光子 (λ₀ = ${lambda0.value} pm)`, 60, cy - 28)
  ctx.fillText('運動量 p₀ ＝ h / λ₀', 60, cy - 12)

  // 2. ターゲット電子 (衝突点: cx, cy)
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(cx, cy, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  ctx.font = '11px sans-serif'
  ctx.fillText('静止電子 e⁻', cx - 28, cy + 24)

  // 3. 散乱光子 (角度 θ 上方、波長 λ' > λ₀ の正弦波 + 進行波束)
  const radTheta = (thetaDeg.value * Math.PI) / 180
  const rayLen = 165
  const cosT = Math.cos(radTheta)
  const sinT = -Math.sin(radTheta)
  const photonEndX = cx + rayLen * cosT
  const photonEndY = cy + rayLen * sinT

  // 散乱方向ガイド破線
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(photonEndX, photonEndY)
  ctx.stroke()

  // 散乱X線の正弦波 (波長が伸びて空間周期が長くなる)
  const lp = lambda0.value + deltaLambda.value
  const kp = k0 * (lambda0.value / lp)
  const nx = -sinT
  const ny = cosT
  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let s = 14; s <= rayLen; s += 2) {
    const w = Math.sin(s * kp - wavePhase) * 10
    const px = cx + cosT * s + nx * w
    const py = cy + sinT * s + ny * w
    if (s === 14) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()

  // 矢印先端
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath()
  ctx.arc(photonEndX, photonEndY, 5, 0, Math.PI * 2)
  ctx.fill()

  const labelAlignRight = photonEndX < cx - 30
  ctx.textAlign = labelAlignRight ? 'right' : 'left'
  const labelOffsetX = labelAlignRight ? -12 : 12
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`散乱光子 (λ' = ${lp.toFixed(2)} pm)`, photonEndX + labelOffsetX, Math.max(24, photonEndY - 8))
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`運動量 p' ＝ h / λ'`, photonEndX + labelOffsetX, Math.max(40, photonEndY + 8))
  ctx.textAlign = 'left'

  // 散乱角 θ の円弧
  if (thetaDeg.value > 5) {
    ctx.beginPath()
    ctx.arc(cx, cy, 45, -radTheta, 0)
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#22d3ee'
    ctx.font = '12px sans-serif'
    ctx.fillText(`θ = ${thetaDeg.value}°`, cx + 52, cy - 15)
  }

  // 4. 反跳電子 (角度 φ 下方 + 飛び出す電子アニメーション)
  const radPhi = (phiDeg.value * Math.PI) / 180
  const elecLen = 140
  const elecEndX = cx + elecLen * Math.cos(radPhi)
  const elecEndY = cy + elecLen * Math.sin(radPhi)

  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(elecEndX, elecEndY)
  ctx.stroke()

  // 運動する反跳電子球
  if (thetaDeg.value > 0) {
    const eProg = ((wavePhase * 0.14) % 1)
    const eCurX = cx + eProg * elecLen * Math.cos(radPhi)
    const eCurY = cy + eProg * elecLen * Math.sin(radPhi)
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(eCurX, eCurY, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  // 矢じり
  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(elecEndX, elecEndY, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('反跳電子 (はね飛ばされた電子)', elecEndX + 10, elecEndY + 5)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`運動エネルギー K_e ＝ h c (1/λ₀ - 1/λ')`, elecEndX + 10, elecEndY + 22)

  // 反跳角 φ の円弧
  if (phiDeg.value > 5) {
    ctx.beginPath()
    ctx.arc(cx, cy, 45, 0, radPhi)
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#f43f5e'
    ctx.font = '12px sans-serif'
    ctx.fillText(`φ = ${phiDeg.value.toFixed(1)}°`, cx + 50, cy + 25)
  }
}

function animate() {
  wavePhase += 0.12
  render()
  animId = requestAnimationFrame(animate)
}

watch([thetaDeg, lambda0], () => {
  render()
})

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
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
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
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
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

.canvas-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  background: #0f172a;
  border: 1px solid #334155;
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
  color: #94a3b8;
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

.sim-btn.outline {
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.sim-btn.outline:hover {
  background: #334155;
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: #1e293b;
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
</style>
