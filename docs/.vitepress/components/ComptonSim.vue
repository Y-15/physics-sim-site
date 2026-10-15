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
      光子は質量ゼロですが、アインシュタインの相対論より**運動量 $p = \frac{h}{\lambda}$** を持ちます。
      電子と弾性衝突してエネルギーの一部を電子に渡すため、散乱光子のエネルギーは低下し（$E' < E$）、**波長が長くなります（$\lambda' > \lambda_0$）**。
      波長の伸び $\Delta \lambda = \frac{h}{m_e c}(1 - \cos\theta)$ は、<strong>入射光の波長に関係なく「散乱角 $\theta$ だけ」で決まります！</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const canvasRef = ref(null)

// 散乱角 θ [deg]
const thetaDeg = ref(60)
// 入射波長 λ0 [pm = 10^-12 m]
const lambda0 = ref(20.0)

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
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  // 正弦波で描画
  for (let x = 60; x <= cx - 15; x += 2) {
    const waveY = cy + Math.sin((x - 60) * 0.25) * 12
    if (x === 60) ctx.moveTo(x, waveY)
    else ctx.lineTo(x, waveY)
  }
  ctx.stroke()

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`入射X線光子 (λ₀ = ${lambda0.value} pm)`, 60, cy - 25)
  ctx.fillText('運動量 p₀ ＝ h / λ₀', 60, cy - 10)

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

  // 3. 散乱光子 (角度 θ 上方)
  const radTheta = (thetaDeg.value * Math.PI) / 180
  const rayLen = 170
  const photonEndX = cx + rayLen * Math.cos(radTheta)
  const photonEndY = cy - rayLen * Math.sin(radTheta)

  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(photonEndX, photonEndY)
  ctx.stroke()

  // 矢印先端
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath()
  ctx.arc(photonEndX, photonEndY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`散乱光子 (λ' = ${(lambda0.value + deltaLambda.value).toFixed(2)} pm)`, photonEndX + 10, photonEndY - 10)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`運動量 p' ＝ h / λ'`, photonEndX + 10, photonEndY + 6)

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

  // 4. 反跳電子 (角度 φ 下方)
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

watch([thetaDeg, lambda0], () => {
  render()
})

onMounted(() => {
  render()
})
</script>

<style scoped>
.sim-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
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
  color: var(--vp-c-text-1);
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
  background: var(--vp-c-bg-mute);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--vp-c-text-2);
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 16px;
  background: var(--vp-c-bg-mute);
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
  color: var(--vp-c-text-1);
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
  background: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.sim-btn.outline:hover {
  background: var(--vp-c-bg-soft);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  background: rgba(30, 41, 59, 0.4);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
</style>
