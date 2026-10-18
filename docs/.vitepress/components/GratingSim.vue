<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🌈</span>
        <h3>回折格子・スペクトル分析シミュレーター</h3>
      </div>
      <p class="subtitle">数千本のスリットによる極めて鋭い干渉主極大（dsinθ = <i>m</i>λ）。単色光の波長測定から水素原子線スペクトル、白色光の連続分光虹までリアルタイム再現。</p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="700" height="300"></canvas>
      <div class="source-badge">
        光源: {{ sourceTypeText }}
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>光源の種類:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: sourceType === 'laser' }" @click="sourceType = 'laser'">
                単色レーザー
              </button>
              <button class="select-btn" :class="{ active: sourceType === 'hydrogen' }" @click="sourceType = 'hydrogen'">
                水素原子線
              </button>
              <button class="select-btn" :class="{ active: sourceType === 'white' }" @click="sourceType = 'white'">
                白色光 (連続)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group" v-if="sourceType === 'laser'">
          <label>
            <span>レーザー波長 λ: <strong>{{ wavelengthNm }} nm</strong></span>
            <input type="range" v-model.number="wavelengthNm" min="400" max="700" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>スリット密度 <i>N</i>: <strong>{{ linesPerMm }} 本/mm</strong></span>
            <input type="range" v-model.number="linesPerMm" min="200" max="800" step="50" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>スクリーン距離 <i>L</i>: <strong>{{ screenDistCm.toFixed(0) }} cm</strong></span>
            <input type="range" v-model.number="screenDistCm" min="50" max="150" step="5" />
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
        <span class="label">格子定数 <i>d</i></span>
        <span class="value">{{ (gratingD_um).toFixed(2) }} <span class="unit">μm</span></span>
        <span class="subtext">1 / {{ linesPerMm }} mm</span>
      </div>

      <div class="stat-card">
        <span class="label">1次回折角 θ<sub>1</sub> (中央波長)</span>
        <span class="value">{{ theta1Deg.toFixed(1) }} <span class="unit">°</span></span>
        <span class="subtext">sinθ = λ / <i>d</i></span>
      </div>

      <div class="stat-card">
        <span class="label">1次明線位置 <i>x</i><sub>1</sub></span>
        <span class="value highlight">{{ x1Cm.toFixed(1) }} <span class="unit">cm</span></span>
        <span class="subtext"><i>L</i> tanθ</span>
      </div>

      <div class="stat-card">
        <span class="label">可視光の最大次数 <i>m</i><sub>max</sub></span>
        <span class="value">{{ maxOrder }}</span>
        <span class="subtext">sinθ ≤ 1 より</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
const sourceType = ref('white') // 'laser', 'hydrogen', 'white'
const wavelengthNm = ref(532) // nm (緑色レーザー)
const linesPerMm = ref(500) // 本/mm
const screenDistCm = ref(100) // cm

const sourceTypeText = computed(() => {
  if (sourceType.value === 'laser') return `単色光 (${wavelengthNm.value} nm)`
  if (sourceType.value === 'hydrogen') return '水素放電管スペクトル (Balmer系列)'
  return '白色光 (連続太陽光スペクトル)'
})

// 格子定数 d [μm]
const gratingD_um = computed(() => 1000 / linesPerMm.value)
const gratingD_nm = computed(() => gratingD_um.value * 1000)

// 1次回折角 θ (レーザー波長または 550nm基準)
const refWaveNm = computed(() => sourceType.value === 'laser' ? wavelengthNm.value : 550)
const sinTheta1 = computed(() => refWaveNm.value / gratingD_nm.value)
const theta1Deg = computed(() => {
  if (sinTheta1.value >= 1) return 90
  return (Math.asin(sinTheta1.value) * 180) / Math.PI
})

const x1Cm = computed(() => {
  if (sinTheta1.value >= 1) return 0
  const rad = (theta1Deg.value * Math.PI) / 180
  return screenDistCm.value * Math.tan(rad)
})

const maxOrder = computed(() => Math.floor(gratingD_nm.value / 700))

const resetDefaults = () => {
  sourceType.value = 'white'
  wavelengthNm.value = 532
  linesPerMm.value = 500
  screenDistCm.value = 100
}

// 波長からRGBカラー文字列を生成する物理関数
const nmToRgb = (nm) => {
  let r = 0, g = 0, b = 0
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380)
    b = 1
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / (490 - 440)
    b = 1
  } else if (nm >= 490 && nm < 510) {
    g = 1
    b = -(nm - 510) / (510 - 490)
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510)
    g = 1
  } else if (nm >= 580 && nm < 645) {
    r = 1
    g = -(nm - 645) / (645 - 580)
  } else if (nm >= 645 && nm <= 750) {
    r = 1
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
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

  // 画面上部: スクリーン上の干渉帯 (y: 20〜120)
  // 画面下部: 光強度分布グラフ (y: 140〜280)

  const screenLeft = 40
  const screenRight = width - 40
  const screenCenterX = (screenLeft + screenRight) / 2
  const screenW = screenRight - screenLeft

  // スクリーン黒枠
  const bandY = 35
  const bandH = 65
  ctx.fillStyle = '#020617'
  ctx.fillRect(screenLeft, bandY, screenW, bandH)
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.strokeRect(screenLeft, bandY, screenW, bandH)

  // スケール変換: スクリーン上の位置 x [cm] -> ピクセル
  // 画面中心が x = 0 (0次光 m = 0)
  // 最大表示幅 ±50 cm
  const maxDisplayCm = 60
  const pxPerCm = (screenW / 2) / maxDisplayCm

  // 0次光 (m = 0: 中央の白色またはレーザー光)
  ctx.fillStyle = sourceType.value === 'laser' ? nmToRgb(wavelengthNm.value) : '#ffffff'
  ctx.shadowColor = ctx.fillStyle
  ctx.shadowBlur = 12
  ctx.fillRect(screenCenterX - 3, bandY + 4, 6, bandH - 8)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('m = 0 (中心)', screenCenterX, bandY + bandH + 14)

  // 回折光の描画
  try {
    const d_nm = gratingD_nm.value
    const L_cm = screenDistCm.value

  const drawSpectralLine = (nm, intensity, label) => {
    const color = nmToRgb(nm)
    for (let m = 1; m <= 3; m++) {
      const sinTh = (m * nm) / d_nm
      if (sinTh >= 0.98) continue
      const th = Math.asin(sinTh)
      const x_cm = L_cm * Math.tan(th);
      const pxOffset = x_cm * pxPerCm;

      // 左右に対称に描画
      for (const sign of [-1, 1]) {
        const lineX = screenCenterX + sign * pxOffset;
        if (lineX >= screenLeft + 4 && lineX <= screenRight - 4) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fillRect(lineX - 1.5, bandY + 6, 3, bandH - 12);
          ctx.shadowBlur = 0;

          if (label && m === 1) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '9px sans-serif';
            ctx.fillText(label, lineX, bandY - 6);
          }
        }
      }
    }
  }

  if (sourceType.value === 'laser') {
    drawSpectralLine(wavelengthNm.value, 1.0, `${wavelengthNm.value}nm`)
  } else if (sourceType.value === 'hydrogen') {
    // 水素原子の発光線 (Balmer系列)
    // Hα (赤: 656.3nm), Hβ (青緑: 486.1nm), Hγ (青紫: 434.0nm), Hδ (紫: 410.2nm)
    drawSpectralLine(656.3, 1.0, 'Hα 656nm')
    drawSpectralLine(486.1, 0.8, 'Hβ 486nm')
    drawSpectralLine(434.0, 0.6, 'Hγ 434nm')
    drawSpectralLine(410.2, 0.4, 'Hδ 410nm')
  } else {
    // 白色光 (連続虹スペクトル 390nm〜700nm をサンプリング描画)
    for (let nm = 390; nm <= 700; nm += 1) {
      const color = nmToRgb(nm)
      for (let m = 1; m <= 2; m++) {
        const sinTh = (m * nm) / d_nm
        if (sinTh >= 0.98) continue
        const th = Math.asin(sinTh)
        const x_cm = L_cm * Math.tan(th);
        const pxOffset = x_cm * pxPerCm;

        for (const sign of [-1, 1]) {
          const lineX = screenCenterX + sign * pxOffset;
          if (lineX >= screenLeft + 4 && lineX <= screenRight - 4) {
            ctx.fillStyle = color;
            ctx.fillRect(lineX - 0.7, bandY + 8, 1.4, bandH - 16);
          }
        }
      }
    }
    // 次数ラベル
    const sin1_mid = (1 * 550) / d_nm
    if (sin1_mid < 0.95) {
      const x1_mid = screenCenterX + L_cm * Math.tan(Math.asin(sin1_mid)) * pxPerCm
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('1次スペクトル (m = 1)', x1_mid, bandY + bandH + 16)
    }
  }

  // 下部: 光強度プロット I(x)
  const plotTop = 165
  const plotBottom = 275
  const plotH = plotBottom - plotTop

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.strokeRect(screenLeft, plotTop, screenW, plotH)

  // 中心線
  ctx.strokeStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(screenCenterX, plotTop)
  ctx.lineTo(screenCenterX, plotBottom)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('光強度 I', screenLeft + 10, plotTop + 16)

  // 強度カーブの描画（回折格子の鋭いピーク）
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(screenLeft, plotBottom)

  for (let px = screenLeft; px <= screenRight; px += 2) {
    const x_cm = (px - screenCenterX) / pxPerCm
    // 強度合成: 中心 (m=0) と各ピーク
    let intensity = 0.9 * Math.exp(-Math.pow(x_cm / 0.8, 2)) // m=0

    if (sourceType.value === 'laser') {
      const sin1 = wavelengthNm.value / d_nm
      if (sin1 < 0.98) {
        const peakX = L_cm * Math.tan(Math.asin(sin1))
        intensity += 0.8 * Math.exp(-Math.pow((Math.abs(x_cm) - peakX) / 0.8, 2))
      }
    } else if (sourceType.value === 'hydrogen') {
      [656.3, 486.1, 434.0].forEach(w => {
        const sin1 = w / d_nm
        if (sin1 < 0.98) {
          const peakX = L_cm * Math.tan(Math.asin(sin1))
          intensity += 0.6 * Math.exp(-Math.pow((Math.abs(x_cm) - peakX) / 0.6, 2))
        }
      })
    } else {
      // 白色光はブロードな丘
      const sinBlue = 400 / d_nm
      const sinRed = 700 / d_nm
      if (sinRed < 0.98) {
        const xBlue = L_cm * Math.tan(Math.asin(sinBlue))
        const xRed = L_cm * Math.tan(Math.asin(sinRed))
        const absX = Math.abs(x_cm)
        if (absX >= xBlue && absX <= xRed) {
          intensity += 0.5
        }
      }
    }

    const py = plotBottom - Math.min(plotH - 5, intensity * plotH)
    ctx.lineTo(px, py)
  }
  ctx.stroke()
  } catch (err) {
    console.error('GRATING DRAW ERROR:', err)
  }
}

onMounted(() => {
  draw()
})

// リアクティブ再描画
const updateLoop = () => {
  draw()
  animId = requestAnimationFrame(updateLoop)
}

onMounted(() => {
  animId = requestAnimationFrame(updateLoop)
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

.source-badge {
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
