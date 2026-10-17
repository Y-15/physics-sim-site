<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">✨</span>
        <h3>くさび形空気層の干渉シミュレーター</h3>
      </div>
      <p class="subtitle">
        2枚の平らなガラス板を重ね、一端に薄い箔を挟んでできた「くさび形空気層」。
        上面反射と下面反射の光路差 2d と、反射による位相の π（半波長）反転によって生じる等間隔の干渉縞をリアルタイム観察できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="320"></canvas>
      <div class="fringe-badge">
        <span>明線間隔 Δ x: <strong>{{ fringeSpacingMm.toFixed(2) }} mm</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>挟んだ箔の厚さ <i>D</i>: <strong>{{ thicknessUm }} µm</strong></span>
            <input type="range" v-model.number="thicknessUm" min="5" max="60" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>ガラス板の長さ <i>L</i>: <strong>{{ lengthMm }} mm</strong></span>
            <input type="range" v-model.number="lengthMm" min="40" max="150" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>入射光の波長 λ: <strong>{{ wavelengthNm }} nm</strong></span>
            <input type="range" v-model.number="wavelengthNm" min="400" max="700" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>空気層の媒質（屈折率 <i>n</i>）:</span>
            <select v-model.number="refractiveIndex" class="custom-select">
              <option :value="1.0">空気 (n = 1.000)</option>
              <option :value="1.333">水 (n = 1.333)</option>
              <option :value="1.47">グリセリン (n = 1.470)</option>
            </select>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">接触点（x=0）の干渉</span>
        <span class="value dark-val">暗線（黒）</span>
        <span class="subtext">下ガラス反射で位相が π 反転するため</span>
      </div>

      <div class="stat-card">
        <span class="label">明線間隔 Δ x</span>
        <span class="value highlight">{{ fringeSpacingMm.toFixed(3) }} <span class="unit">mm</span></span>
        <span class="subtext">Δ x = L λ / 2 n D</span>
      </div>

      <div class="stat-card">
        <span class="label">全縞数（x=0 \sim L）</span>
        <span class="value">{{ totalFringes }} <span class="unit">本</span></span>
        <span class="subtext">N = 2 n D / λ</span>
      </div>

      <div class="stat-card">
        <span class="label">くさびの傾斜角 θ</span>
        <span class="value">{{ (wedgeAngleMrad).toFixed(2) }} <span class="unit">mrad</span></span>
        <span class="subtext">tanθ = D / L</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const thicknessUm = ref(20) // µm
const lengthMm = ref(80)    // mm
const wavelengthNm = ref(589) // ナトリウムD線 589nm
const refractiveIndex = ref(1.0) // 屈折率

// 物理計算
// D (m) = thicknessUm * 1e-6
// L (m) = lengthMm * 1e-3
// λ (m) = wavelengthNm * 1e-9
// Δx = L * λ / (2 * n * D)
const fringeSpacingMm = computed(() => {
  const D = thicknessUm.value * 1e-6
  const L = lengthMm.value * 1e-3
  const lam = wavelengthNm.value * 1e-9
  const n = refractiveIndex.value
  const dx = (L * lam) / (2 * n * D)
  return dx * 1e3 // mm
})

const totalFringes = computed(() => {
  const D = thicknessUm.value * 1e-6
  const lam = wavelengthNm.value * 1e-9
  const n = refractiveIndex.value
  return Math.floor((2 * n * D) / lam)
})

const wedgeAngleMrad = computed(() => {
  const D = thicknessUm.value * 1e-6
  const L = lengthMm.value * 1e-3
  return (D / L) * 1e3 // mrad
})

const resetDefaults = () => {
  thicknessUm.value = 20
  lengthMm.value = 80
  wavelengthNm.value = 589
  refractiveIndex.value = 1.0
}

// 波長からRGB色を算出（可視光スペクトル近似）
function wavelengthToRGB(wl) {
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
  } else if (wl >= 645 && wl <= 750) {
    r = 1.0
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

let animId = null
let phaseShift = 0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 背景グラデーション
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, '#0a0e17')
  bgGrad.addColorStop(1, '#111827')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // 上部半分: くさび形ガラスの断面幾何図
  // 下部半分: 上から見た干渉縞パターン
  const marginX = 50
  const viewW = w - marginX * 2
  const splitY = 160

  // ---------- 断面図 ----------
  const glassTopY = 40
  const glassBottomY = 135
  const maxWedgeGap = Math.min(45, thicknessUm.value * 1.0 + 8)

  // 上ガラス板（傾斜）
  ctx.save()
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(marginX, glassTopY + 25)
  ctx.lineTo(marginX + viewW, glassTopY + 25 - maxWedgeGap)
  ctx.lineTo(marginX + viewW, glassTopY - maxWedgeGap)
  ctx.lineTo(marginX, glassTopY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#bae6fd'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('上側ガラス板 (屈折率 n_g ≈ 1.5)', marginX + 10, glassTopY + 15)
  ctx.restore()

  // 下ガラス板（水平）
  ctx.save()
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.fillRect(marginX, glassBottomY, viewW, 25)
  ctx.strokeRect(marginX, glassBottomY, viewW, 25)

  ctx.fillStyle = '#bae6fd'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('下側ガラス板 (屈折率 n_g ≈ 1.5)', marginX + 10, glassBottomY + 17)
  ctx.restore()

  // 挟んだ薄膜スペーサー (箔 D)
  const spacerX = marginX + viewW - 18
  const spacerH = maxWedgeGap
  const spacerY = glassBottomY - spacerH
  ctx.save()
  ctx.fillStyle = '#f59e0b'
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  ctx.fillRect(spacerX, spacerY, 14, spacerH)
  ctx.strokeRect(spacerX, spacerY, 14, spacerH)
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`箔 D = ${thicknessUm.value}µm`, spacerX - 6, spacerY + spacerH / 2 + 4)
  ctx.restore()

  // 接点 O (x = 0)
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(marginX, glassBottomY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = 'bold 11px sans-serif'
  ctx.fillStyle = '#fca5a5'
  ctx.fillText('接触点 O (x=0)', marginX - 10, glassBottomY - 8)

  // 媒質の注記
  ctx.fillStyle = refractiveIndex.value > 1.0 ? '#34d399' : '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  const mediumName = refractiveIndex.value === 1.0 ? '空気層 (n = 1.00)' : (refractiveIndex.value === 1.333 ? '水層 (n = 1.333)' : 'グリセリン (n = 1.470)')
  ctx.fillText(`薄膜層: ${mediumName}`, marginX + viewW * 0.45, glassBottomY - maxWedgeGap * 0.4)

  // ---------- 区切り線 ----------
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(20, splitY)
  ctx.lineTo(w - 20, splitY)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('▼ 上方から観察される干渉縞（等間隔の直線縞）', marginX, splitY + 18)

  // ---------- 下部: 干渉縞パターンの描画 ----------
  const fringeY = splitY + 28
  const fringeH = 95
  const rgb = wavelengthToRGB(wavelengthNm.value)

  // 縞の描画
  // 光路差 Δ = 2 n d(x) = 2 n (x / L) D
  // 下面反射（空気→ガラス）で位相が π 変化（自由端/固定端反射）
  // 合成光強度 I(x) ∝ cos^2( (2π / λ) * (2 n d(x)) / 2 + π/2 ) = sin^2( 2π n d / λ )
  // 接触点 x = 0 では I(0) = sin^2(0) = 0（暗線）
  const totalPhase = (2 * Math.PI * refractiveIndex.value * (thicknessUm.value * 1e-6)) / (wavelengthNm.value * 1e-9)

  const imgData = ctx.createImageData(viewW, fringeH)
  for (let px = 0; px < viewW; px++) {
    const normX = px / viewW
    const phase = normX * totalPhase
    // 接触点 x=0 は暗線 (sin^2)
    const intensity = Math.sin(phase) ** 2

    const r = Math.round(rgb.r * intensity)
    const g = Math.round(rgb.g * intensity)
    const b = Math.round(rgb.b * intensity)

    for (let py = 0; py < fringeH; py++) {
      const idx = (py * viewW + px) * 4
      imgData.data[idx] = r
      imgData.data[idx + 1] = g
      imgData.data[idx + 2] = b
      imgData.data[idx + 3] = 255
    }
  }
  ctx.putImageData(imgData, marginX, fringeY)

  // 干渉縞の枠
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(marginX, fringeY, viewW, fringeH)

  // 目盛りとルーラー
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('x = 0', marginX, fringeY + fringeH + 16)
  ctx.fillText(`x = L (${lengthMm.value} mm)`, marginX + viewW, fringeY + fringeH + 16)

  // 明線間隔 Δx のインジケーター（最初の明線と次の明線の間）
  const dxPixels = (fringeSpacingMm.value / lengthMm.value) * viewW
  if (dxPixels > 12 && dxPixels < viewW * 0.5) {
    const x1 = marginX + dxPixels * 0.5
    const x2 = x1 + dxPixels
    const indY = fringeY + fringeH - 12
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x1, indY)
    ctx.lineTo(x2, indY)
    ctx.moveTo(x1, indY - 5); ctx.lineTo(x1, indY + 5)
    ctx.moveTo(x2, indY - 5); ctx.lineTo(x2, indY + 5)
    ctx.stroke()

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(`Δx = ${fringeSpacingMm.value.toFixed(2)} mm`, (x1 + x2) / 2, indY - 8)
  }

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})

watch([thicknessUm, lengthMm, wavelengthNm, refractiveIndex], () => {
  // 自動再描画
})
</script>

<style scoped>
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

.fringe-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fbbf24;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.dark-val {
  color: #94a3b8 !important;
}
</style>
