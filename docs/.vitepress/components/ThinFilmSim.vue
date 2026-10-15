<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🌈 薄膜干渉 & ニュートンリング・シミュレーター</h3>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'film' }"
          @click="mode = 'film'"
        >
          薄膜の干渉色
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'newton' }"
          @click="mode = 'newton'"
        >
          ニュートンリング
        </button>
      </div>
    </div>

    <!-- メインCanvas -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">波長 λ</div>
        <div class="stat-value" :style="{ color: waveColor }">
          {{ wavelength }} <span class="stat-unit">nm</span>
        </div>
      </div>
      <div v-if="mode === 'film'" class="stat-card">
        <div class="stat-label">膜厚 d</div>
        <div class="stat-value text-blue">{{ filmThickness }} <span class="stat-unit">nm</span></div>
      </div>
      <div v-if="mode === 'film'" class="stat-card">
        <div class="stat-label">膜の屈折率 n</div>
        <div class="stat-value text-yellow">{{ filmIndex.toFixed(2) }}</div>
      </div>
      <div v-if="mode === 'film'" class="stat-card highlight">
        <div class="stat-label">垂直往復光路長 2nd</div>
        <div class="stat-value text-cyan">{{ (2 * filmIndex * filmThickness).toFixed(0) }} <span class="stat-unit">nm</span></div>
      </div>
      <div v-if="mode === 'newton'" class="stat-card">
        <div class="stat-label">レンズ曲率半径 R</div>
        <div class="stat-value text-blue">{{ lensRadius }} <span class="stat-unit">m</span></div>
      </div>
      <div v-if="mode === 'newton'" class="stat-card highlight">
        <div class="stat-label">中心部 (r=0) の干渉</div>
        <div class="stat-value text-rose">暗環 (位相反転 π)</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <!-- 共通波長スライダー -->
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>単色光の波長 λ:</span>
            <span class="control-val" :style="{ color: waveColor }">{{ wavelength }} nm</span>
          </label>
          <input type="range" v-model.number="wavelength" min="400" max="700" step="5" class="sim-slider" />
        </div>

        <div v-if="mode === 'film'" class="control-group">
          <label class="control-label">
            <span>膜の厚さ d:</span>
            <span class="control-val">{{ filmThickness }} nm</span>
          </label>
          <input type="range" v-model.number="filmThickness" min="50" max="800" step="10" class="sim-slider" />
        </div>

        <div v-if="mode === 'newton'" class="control-group">
          <label class="control-label">
            <span>レンズ曲率半径 R:</span>
            <span class="control-val">{{ lensRadius }} m</span>
          </label>
          <input type="range" v-model.number="lensRadius" min="5" max="30" step="1" class="sim-slider" />
        </div>
      </div>

      <div v-if="mode === 'film'" class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>膜の屈折率 n:</span>
            <span class="control-val">{{ filmIndex }}</span>
          </label>
          <input type="range" v-model.number="filmIndex" min="1.1" max="2.0" step="0.05" class="sim-slider" />
        </div>
      </div>
    </div>

    <div class="sim-footer-note">
      💡 <strong>物理の急所</strong>:
      <strong>ニュートンリングの中心は常に「暗環（黒）」になります！</strong>
      なぜなら、レンズ下面（ガラス $\to$ 空気）の反射では位相変化なし（$0$）ですが、下の平板ガラス上面（空気 $\to$ ガラス）の反射では固定端反射により<strong>位相が $\pi$ 反転</strong>するため、光路差ゼロの接触点で逆位相（弱め合い）となるからです。
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const mode = ref('film') // 'film' | 'newton'

const wavelength = ref(550) // nm (緑)
const filmThickness = ref(350) // nm
const filmIndex = ref(1.33) // 水/油
const lensRadius = ref(15) // m

let animId = null

// 波長からRGBへの変換
const waveColor = computed(() => {
  const wl = wavelength.value
  let r = 0, g = 0, b = 0
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380)
    b = 1.0
  } else if (wl >= 440 && wl < 490) {
    g = (wl - 440) / (490 - 440)
    b = 1.0
  } else if (wl >= 490 && wl < 510) {
    g = 1.0
    b = -(wl - 510) / (510 - 490)
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510)
    g = 1.0
  } else if (wl >= 580 && wl < 645) {
    r = 1.0
    g = -(wl - 645) / (645 - 580)
  } else if (wl >= 645 && wl <= 780) {
    r = 1.0
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
})

function drawFilmMode(ctx, width, height) {
  // 背景クリア
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // 1. 空気層 (上部)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.5)'
  ctx.fillRect(40, 30, width - 80, 80)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px sans-serif'
  ctx.fillText('空気 (屈折率 n₁ = 1.00)', 50, 50)

  // 2. 薄膜 (中央: 厚さ表示用)
  const filmY = 110
  const displayThickness = Math.min(130, Math.max(30, filmThickness.value * 0.2))
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
  ctx.fillRect(40, filmY, width - 80, displayThickness)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.strokeRect(40, filmY, width - 80, displayThickness)
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`薄膜 (屈折率 n = ${filmIndex.value.toFixed(2)}, d = ${filmThickness.value} nm)`, 50, filmY + 25)

  // 3. 基板 (下部)
  const subY = filmY + displayThickness
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
  ctx.fillRect(40, subY, width - 80, height - subY - 30)
  ctx.fillStyle = '#64748b'
  ctx.fillText('基板・水 (屈折率 n₂ = 1.00 またはガラス 1.50)', 50, subY + 30)

  // 光線の入射・反射作図
  const inX = 180
  const hitX1 = 260
  const hitY1 = filmY
  const hitX2 = 300
  const hitY2 = subY
  const outX1 = 340
  const outY1 = hitY1
  const refX = 400
  const refY = 40

  ctx.strokeStyle = waveColor.value
  ctx.lineWidth = 2.5

  // 入射光
  ctx.beginPath()
  ctx.moveTo(inX, 40)
  ctx.lineTo(hitX1, hitY1)
  ctx.stroke()

  // 表面反射光 1 (空気->膜: n > 1 なので位相 π 反転)
  ctx.strokeStyle = '#f43f5e'
  ctx.beginPath()
  ctx.moveTo(hitX1, hitY1)
  ctx.lineTo(hitX1 + 80, 40)
  ctx.stroke()
  ctx.fillStyle = '#f43f5e'
  ctx.fillText('反射光① (位相π反転)', hitX1 + 20, 35)

  // 屈折光 (膜内へ)
  ctx.strokeStyle = waveColor.value
  ctx.beginPath()
  ctx.moveTo(hitX1, hitY1)
  ctx.lineTo(hitX2, hitY2)
  ctx.stroke()

  // 裏面反射光 2 (膜内から戻る)
  ctx.beginPath()
  ctx.moveTo(hitX2, hitY2)
  ctx.lineTo(outX1, outY1)
  ctx.stroke()

  // 膜から出て干渉する反射光 2
  ctx.strokeStyle = '#10b981'
  ctx.beginPath()
  ctx.moveTo(outX1, outY1)
  ctx.lineTo(outX1 + 80, 40)
  ctx.stroke()
  ctx.fillStyle = '#10b981'
  ctx.fillText('反射光② (膜内往復)', outX1 + 30, 55)

  // 干渉強度の計算 (垂直入射近似: 光路差 Δ = 2nd)
  const delta = 2 * filmIndex.value * filmThickness.value
  // 位相差 (表面でπ反転、裏面は基板n2=1.00と仮定して反転なし -> Δ = (m + 1/2)λ で強め合い)
  const m = delta / wavelength.value - 0.5
  const phaseDiff = (2 * Math.PI * delta) / wavelength.value + Math.PI
  const intensity = Math.pow(Math.cos(phaseDiff / 2), 2) // 0..1

  // 右側に干渉光強度メーター
  const meterX = 520
  const meterY = 80
  const meterW = 120
  const meterH = 180

  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'
  ctx.fillRect(meterX, meterY, meterW, meterH)
  ctx.strokeStyle = '#475569'
  ctx.strokeRect(meterX, meterY, meterW, meterH)

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('合成干渉光', meterX + meterW / 2, meterY + 25)

  // 干渉色ボックス
  ctx.fillStyle = waveColor.value
  ctx.globalAlpha = Math.max(0.1, intensity)
  ctx.fillRect(meterX + 25, meterY + 40, 70, 70)
  ctx.globalAlpha = 1.0
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(meterX + 25, meterY + 40, 70, 70)

  ctx.fillStyle = intensity > 0.6 ? '#22c55e' : (intensity < 0.3 ? '#f43f5e' : '#fbbf24')
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText(intensity > 0.6 ? '強め合い (明)' : (intensity < 0.3 ? '弱め合い (暗)' : '中間'), meterX + meterW / 2, meterY + 135)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`相対強度: ${(intensity * 100).toFixed(0)}%`, meterX + meterW / 2, meterY + 155)
  ctx.textAlign = 'left'
}

function drawNewtonMode(ctx, width, height) {
  // 背景クリア
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2

  // ニュートンリング干渉縞描画 (同心円)
  // 半径 r_m = sqrt(m * R * lambda)
  // スケール変換: R [m], lambda [nm] -> ピクセル半径
  const R_val = lensRadius.value
  const wl_val = wavelength.value * 1e-9 // m
  const maxRadiusPx = 170

  // 各ピクセルの強度を同心円状に描画
  const numRings = 12
  for (let r = 0; r < maxRadiusPx; r += 2) {
    // r [px] に対応する実長 r_real [m] (maxRadiusPx 170px = 4mm 相当)
    const r_real = (r / maxRadiusPx) * 0.003
    // 空気層の厚さ d = r^2 / (2R)
    const d = (r_real * r_real) / (2 * R_val)
    // 光路差 (往復) 2d、平板ガラスでのみ位相反転 π
    const phase = (2 * Math.PI * (2 * d)) / wl_val + Math.PI
    const intensity = Math.pow(Math.cos(phase / 2), 2) // 0..1

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = waveColor.value
    ctx.globalAlpha = intensity
    ctx.lineWidth = 2.2
    ctx.stroke()
  }
  ctx.globalAlpha = 1.0

  // 中心マーク (中心暗環 r=0)
  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f43f5e'
  ctx.font = '12px sans-serif'
  ctx.fillText('中心: 完全な暗環 (d=0, Δφ=π)', cx - 85, cy + 25)

  // 断面図プレビュー (右下)
  const diagX = width - 210
  const diagY = 30
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
  ctx.fillRect(diagX, diagY, 190, 110)
  ctx.strokeStyle = '#334155'
  ctx.strokeRect(diagX, diagY, 190, 110)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.fillText('断面構造（平凸レンズ＋平面板）', diagX + 10, diagY + 20)

  // 平凸レンズ（円弧）
  ctx.beginPath()
  ctx.arc(diagX + 95, diagY - 80, 150, 0.45 * Math.PI, 0.55 * Math.PI)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('平凸レンズ (曲率半径 R)', diagX + 15, diagY + 45)

  // 平面ガラス板
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(diagX + 10, diagY + 80)
  ctx.lineTo(diagX + 180, diagY + 80)
  ctx.stroke()
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('平板ガラス (上面反射で反転)', diagX + 15, diagY + 98)
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (mode.value === 'film') {
    drawFilmMode(ctx, canvas.width, canvas.height)
  } else {
    drawNewtonMode(ctx, canvas.width, canvas.height)
  }
}

watch([mode, wavelength, filmThickness, filmIndex, lensRadius], () => {
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

.sim-tabs {
  display: flex;
  gap: 6px;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #0284c7;
  color: #fff;
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
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
  margin-bottom: 10px;
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
  font-family: monospace;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
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
