<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">📢</span>
        <h3>気柱の共鳴・定常波シミュレーター</h3>
      </div>
      <p class="subtitle">音叉と気柱（閉管・開管）の共鳴現象。音波（縦波）の空気分子の粗密と、定常波の腹・節、開口端補正の仕組みを直感的に観察できます。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="280"></canvas>
      <div class="resonance-badge" :class="{ active: isResonant }">
        {{ isResonant ? '🔥 共鳴状態 (大音量発生!)' : '通常状態 (共鳴なし)' }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>管の種類:</span>
            <div class="pipe-type-buttons">
              <button class="type-btn" :class="{ active: pipeType === 'closed' }" @click="pipeType = 'closed'">
                閉管 (片側閉口)
              </button>
              <button class="type-btn" :class="{ active: pipeType === 'open' }" @click="pipeType = 'open'">
                開管 (両側開口)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>音叉の振動数 $f$: <strong>{{ freq }} Hz</strong></span>
            <input type="range" v-model.number="freq" min="300" max="900" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>管の長さ $L$: <strong>{{ pipeLengthCm.toFixed(1) }} cm</strong></span>
            <input type="range" v-model.number="pipeLengthCm" min="15" max="85" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>開口端補正 $\Delta l$: <strong>{{ deltaLCm.toFixed(1) }} cm</strong></span>
            <input type="range" v-model.number="deltaLCm" min="0" max="4" step="0.5" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="snapToResonance">
          🎯 最寄りの共鳴長さに自動調整
        </button>
        <button class="btn btn-secondary" @click="toggleWaveType">
          {{ showDisplacement ? '波の表示: 変位波 (腹/節)' : '波の表示: 圧力波 (粗密)' }}
        </button>
      </div>
    </div>

    <!-- 物理量リアルタイム表示モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">音速 $V$ (常温15℃)</span>
        <span class="value">340 <span class="unit">m/s</span></span>
        <span class="subtext">$331.5 + 0.6 \times 15$</span>
      </div>

      <div class="stat-card">
        <span class="label">音波の波長 $\lambda$</span>
        <span class="value">{{ wavelengthCm.toFixed(1) }} <span class="unit">cm</span></span>
        <span class="subtext">$\lambda = V / f$</span>
      </div>

      <div class="stat-card">
        <span class="label">実効長さ $L + \Delta l$</span>
        <span class="value">{{ effectiveLengthCm.toFixed(1) }} <span class="unit">cm</span></span>
        <span class="subtext">{{ pipeType === 'closed' ? 'L + Δl' : 'L + 2Δl' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">共鳴モード判定</span>
        <span class="value highlight">{{ modeText }}</span>
        <span class="subtext">共鳴ズレ: {{ resonanceOffsetCm.toFixed(1) }} cm</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const pipeType = ref('closed') // 'closed' or 'open'
const freq = ref(500) // Hz
const pipeLengthCm = ref(51.0) // cm
const deltaLCm = ref(2.0) // cm
const showDisplacement = ref(true)

const soundSpeed = 340 // m/s
const wavelengthCm = computed(() => (soundSpeed / freq.value) * 100)

const effectiveLengthCm = computed(() => {
  if (pipeType.value === 'closed') {
    return pipeLengthCm.value + deltaLCm.value
  } else {
    return pipeLengthCm.value + 2 * deltaLCm.value
  }
})

// 最寄りの共鳴モードと誤差
const resonanceInfo = computed(() => {
  const lambda = wavelengthCm.value
  const effL = effectiveLengthCm.value

  if (pipeType.value === 'closed') {
    // 閉管: effL = m * (lambda / 4), m = 1, 3, 5, ...
    const mApprox = Math.round(effL / (lambda / 4))
    const mOdd = mApprox % 2 === 0 ? (mApprox + 1) : mApprox
    const exactEffL = mOdd * (lambda / 4)
    const exactPipeL = exactEffL - deltaLCm.value
    const diff = Math.abs(effL - exactEffL)
    return {
      m: mOdd,
      modeName: `${mOdd}倍振動 (閉管)`,
      exactPipeL,
      diff,
      isResonant: diff < 1.5
    }
  } else {
    // 開管: effL = n * (lambda / 2), n = 1, 2, 3, ...
    const nApprox = Math.max(1, Math.round(effL / (lambda / 2)))
    const exactEffL = nApprox * (lambda / 2)
    const exactPipeL = exactEffL - 2 * deltaLCm.value
    const diff = Math.abs(effL - exactEffL)
    return {
      m: nApprox,
      modeName: `${nApprox}倍振動 (開管)`,
      exactPipeL,
      diff,
      isResonant: diff < 1.5
    }
  }
})

const isResonant = computed(() => resonanceInfo.value.isResonant)
const modeText = computed(() => {
  if (isResonant.value) {
    return resonanceInfo.value.modeName
  }
  return '非共鳴'
})
const resonanceOffsetCm = computed(() => resonanceInfo.value.diff)

const snapToResonance = () => {
  const target = Math.max(15, Math.min(85, resonanceInfo.value.exactPipeL))
  pipeLengthCm.value = Math.round(target * 2) / 2
}

const toggleWaveType = () => {
  showDisplacement.value = !showDisplacement.value
}

// 描画・アニメーションループ
let animId = null
let time = 0

// 空気分子パーティクルの初期化
const particles = []
const initParticles = () => {
  particles.length = 0
  const count = 300
  for (let i = 0; i < count; i++) {
    particles.push({
      u: Math.random(), // 0 to 1 (管内の位置割合)
      yOff: (Math.random() - 0.5) * 60,
      phase: Math.random() * Math.PI * 2
    })
  }
}

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
  bgGrad.addColorStop(1, '#131d31')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  const centerY = height / 2
  const pipeH = 80
  const pipeTop = centerY - pipeH / 2
  const pipeBottom = centerY + pipeH / 2

  // スケール: 100cm = 500px -> 1cm = 5px
  const scale = 5.5
  const pipeStartX = 120
  const pipeLenPx = pipeLengthCm.value * scale
  const pipeEndX = pipeStartX + pipeLenPx
  const deltaLPx = deltaLCm.value * scale

  // 1. 共鳴時の発光背景
  if (isResonant.value) {
    const glowGrad = ctx.createRadialGradient(
      (pipeStartX + pipeEndX) / 2, centerY, 20,
      (pipeStartX + pipeEndX) / 2, centerY, pipeLenPx / 1.5
    )
    glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.25)')
    glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)')
    ctx.fillStyle = glowGrad
    ctx.fillRect(pipeStartX - 20, pipeTop - 30, pipeLenPx + 40, pipeH + 60)
  }

  // 2. 管の壁面を描画
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'
  ctx.fillRect(pipeStartX, pipeTop, pipeLenPx, pipeH)

  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 4
  ctx.beginPath()
  // 上壁
  ctx.moveTo(pipeStartX, pipeTop)
  ctx.lineTo(pipeEndX, pipeTop)
  // 下壁
  ctx.moveTo(pipeStartX, pipeBottom)
  ctx.lineTo(pipeEndX, pipeBottom)

  if (pipeType.value === 'closed') {
    // 閉端（左端を壁とするか右端を壁とするか。ここでは右端を閉端とする）
    ctx.lineTo(pipeEndX, pipeTop)
  }
  ctx.stroke()

  // 3. 左端に音叉を描画
  const forkX = pipeStartX - 45
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 4
  // 音叉の柄
  ctx.beginPath()
  ctx.moveTo(forkX - 25, centerY)
  ctx.lineTo(forkX, centerY)
  // 音叉の二股
  const forkVib = Math.sin(time * 25) * 4
  ctx.moveTo(forkX, centerY - 25 + forkVib)
  ctx.lineTo(forkX, centerY + 25 - forkVib)
  ctx.stroke()

  // 音叉の放射音波弧
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'
  ctx.lineWidth = 2
  for (let r = 1; r <= 3; r++) {
    const arcX = forkX + 10 + ((time * 30 + r * 15) % 40)
    ctx.beginPath()
    ctx.arc(arcX, centerY, 20, -Math.PI / 4, Math.PI / 4)
    ctx.stroke()
  }

  // 4. 開口端補正の領域表示 (点線)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  // 左開口端の補正
  ctx.strokeRect(pipeStartX - deltaLPx, pipeTop, deltaLPx, pipeH)
  if (pipeType.value === 'open') {
    // 右開口端の補正
    ctx.strokeRect(pipeEndX, pipeTop, deltaLPx, pipeH)
  }
  ctx.setLineDash([])

  // 補正テキスト
  ctx.fillStyle = '#38bdf8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Δl', pipeStartX - deltaLPx / 2, pipeTop - 8)
  if (pipeType.value === 'open') {
    ctx.fillText('Δl', pipeEndX + deltaLPx / 2, pipeTop - 8)
  }

  // 5. 定常波のエンベロープ（波形）描画
  // 実効管長範囲:
  // 閉管: x in [pipeStartX - deltaLPx, pipeEndX] (右端 x=pipeEndX で節=0)
  // 開管: x in [pipeStartX - deltaLPx, pipeEndX + deltaLPx] (両端で腹=MAX)
  const effStartX = pipeStartX - deltaLPx
  const effEndX = pipeType.value === 'closed' ? pipeEndX : pipeEndX + deltaLPx
  const effLenPx = effEndX - effStartX

  // 波長（ピクセル）
  const waveLenPx = wavelengthCm.value * scale
  const kVal = (2 * Math.PI) / waveLenPx

  // 振幅変調 (共鳴度合に応じて振幅が激変)
  const resonanceFactor = Math.max(0.2, 1.0 - (resonanceOffsetCm.value / 6.0))
  const amp = 30 * resonanceFactor

  // 赤い定常波のエンベロープ（包絡線）
  ctx.strokeStyle = isResonant.value ? '#ef4444' : '#64748b'
  ctx.lineWidth = isResonant.value ? 2.5 : 1.5

  ctx.beginPath()
  for (let px = effStartX; px <= effEndX; px += 2) {
    // 右端からの距離（閉管では右端が節=0）
    let yDisp = 0
    if (pipeType.value === 'closed') {
      const distFromClosed = effEndX - px
      yDisp = amp * Math.sin(kVal * distFromClosed) * Math.cos(time * 15)
    } else {
      // 開管: 端点で腹
      const distFromStart = px - effStartX
      yDisp = amp * Math.cos(kVal * distFromStart) * Math.cos(time * 15)
    }

    if (px === effStartX) ctx.moveTo(px, centerY + yDisp)
    else ctx.lineTo(px, centerY + yDisp)
  }
  ctx.stroke()

  // 反転位相（エンベロープの点線）
  ctx.strokeStyle = isResonant.value ? 'rgba(239, 68, 68, 0.4)' : 'rgba(100, 116, 139, 0.4)'
  ctx.setLineDash([2, 3])
  ctx.beginPath()
  for (let px = effStartX; px <= effEndX; px += 2) {
    let yDisp = 0
    if (pipeType.value === 'closed') {
      const distFromClosed = effEndX - px
      yDisp = amp * Math.sin(kVal * distFromClosed)
    } else {
      const distFromStart = px - effStartX
      yDisp = amp * Math.cos(kVal * distFromStart)
    }

    if (px === effStartX) ctx.moveTo(px, centerY - yDisp)
    else ctx.lineTo(px, centerY - yDisp)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // 6. 空気分子の粗密波・変位パーティクル
  ctx.fillStyle = '#38bdf8'
  particles.forEach(p => {
    const xBase = pipeStartX + p.u * pipeLenPx
    let dispX = 0
    if (pipeType.value === 'closed') {
      const distFromClosed = effEndX - xBase
      dispX = (amp * 0.4) * Math.sin(kVal * distFromClosed) * Math.cos(time * 15)
    } else {
      const distFromStart = xBase - effStartX
      dispX = (amp * 0.4) * Math.cos(kVal * distFromStart) * Math.cos(time * 15)
    }

    const curX = xBase + dispX
    const curY = centerY + p.yOff

    if (curX >= pipeStartX && curX <= pipeEndX) {
      ctx.beginPath()
      ctx.arc(curX, curY, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // 7. 長さスケール寸法線
  const dimY = pipeBottom + 25
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(pipeStartX, dimY)
  ctx.lineTo(pipeEndX, dimY)
  // 端のヒゲ
  ctx.moveTo(pipeStartX, dimY - 6)
  ctx.lineTo(pipeStartX, dimY + 6)
  ctx.moveTo(pipeEndX, dimY - 6)
  ctx.lineTo(pipeEndX, dimY + 6)
  ctx.stroke()

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`管長 L = ${pipeLengthCm.value.toFixed(1)} cm`, (pipeStartX + pipeEndX) / 2, dimY + 18)
}

const animate = () => {
  time += 0.04
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

.resonance-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.4);
  transition: all 0.3s;
}

.resonance-badge.active {
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
  border: 1px solid #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
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

.pipe-type-buttons {
  display: flex;
  gap: 0.4rem;
}

.type-btn {
  flex: 1;
  padding: 0.4rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
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
  color: #ef4444;
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
