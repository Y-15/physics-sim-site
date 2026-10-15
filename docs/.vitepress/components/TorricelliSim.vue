<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const atmosphericPressure = ref(760) // 大気圧 P0 [mmHg]
const tubeTotalLength = ref(900) // ガラス管の全長 [mm]
const tubePullUp = ref(850) // 水銀槽液面からのガラス管上端の高さ H [mm] (700 ~ 950)
const gasAmount = ref(0) // 封入気体の量 [任意単位: 0ならトリチェリの真空]
const gasTemperature = ref(300) // 気体温度 T [K] (250 ~ 400)

let animationFrameId = null

const width = 480
const height = 440

// 物理計算
// 水銀槽液面を基準 y = 0 とする。
// 管の最上部は液面から H [mm] の位置。
// 水銀柱の高さ h [mm]、気柱の長さ L = H - h [mm]。
// 気体の状態方程式 (ボイル・シャルル): P_gas * L = k * n * T
// 水銀槽表面の圧力つり合い: P_gas + h = P_0  =>  P_gas = P_0 - h
// 代入すると: (P_0 - h) * (H - h) = C (ただし C = k * n * T)
// h^2 - (P_0 + H) * h + (P_0 * H - C) = 0
// 2次方程式の解: h = [ (P_0 + H) - sqrt( (P_0 + H)^2 - 4 * (P_0 * H - C) ) ] / 2
const simData = computed(() => {
  const P0 = atmosphericPressure.value
  const H = tubePullUp.value
  const n = gasAmount.value
  const T = gasTemperature.value

  // C = n * T * 15 (定数スケール)
  const C = n * (T / 300) * 8000

  if (n === 0) {
    // トリチェリの真空: P_gas = 0
    // もし H >= P0 なら h = P0 で上部は真空
    // もし H < P0 なら管の上端まで水銀で満たされる (h = H)
    const h = Math.min(H, P0)
    const L = Math.max(0, H - h)
    const Pgas = 0
    return {
      h: h.toFixed(1),
      L: L.toFixed(1),
      Pgas: Pgas.toFixed(1),
      isTorricelliVacuum: H >= P0,
      isFullMercury: H < P0
    }
  }

  // 気体封入時
  const b = P0 + H
  const c = P0 * H - C
  const discriminant = Math.max(0, b * b - 4 * c)
  const h = (b - Math.sqrt(discriminant)) / 2
  const clampedH = Math.max(0, Math.min(H, h))
  const L = H - clampedH
  const Pgas = P0 - clampedH

  return {
    h: clampedH.toFixed(1),
    L: L.toFixed(1),
    Pgas: Pgas.toFixed(1),
    isTorricelliVacuum: false,
    isFullMercury: false
  }
})

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // スケール変換: 1000 mm を 300 px 程度に対応させる
  const mmToPx = 0.32
  const basinY = 320 // 水銀槽液面のキャンバス y 座標
  const basinLeft = 80
  const basinRight = 400
  const basinBottom = 390

  // 1. 水銀槽の容器
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 3
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.moveTo(basinLeft - 10, basinY - 20)
  ctx.lineTo(basinLeft, basinBottom)
  ctx.lineTo(basinRight, basinBottom)
  ctx.lineTo(basinRight + 10, basinY - 20)
  ctx.stroke()

  // 水銀槽内の水銀液
  const hgGradient = ctx.createLinearGradient(0, basinY, 0, basinBottom)
  hgGradient.addColorStop(0, '#94a3b8')
  hgGradient.addColorStop(0.5, '#cbd5e1')
  hgGradient.addColorStop(1, '#64748b')

  ctx.fillStyle = hgGradient
  ctx.beginPath()
  ctx.moveTo(basinLeft, basinY)
  ctx.lineTo(basinRight, basinY)
  ctx.lineTo(basinRight - 5, basinBottom - 2)
  ctx.lineTo(basinLeft + 5, basinBottom - 2)
  ctx.closePath()
  ctx.fill()

  // 大気圧の矢印（水銀槽液面にかかる圧力 P0）
  ctx.strokeStyle = '#38bdf8'
  ctx.fillStyle = '#38bdf8'
  ctx.lineWidth = 2
  for (const ax of [120, 160, 320, 360]) {
    ctx.beginPath()
    ctx.moveTo(ax, basinY - 40)
    ctx.lineTo(ax, basinY - 5)
    ctx.stroke()
    // 矢印ヘッド
    ctx.beginPath()
    ctx.moveTo(ax, basinY - 5)
    ctx.lineTo(ax - 4, basinY - 14)
    ctx.lineTo(ax + 4, basinY - 14)
    ctx.fill()
  }
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`大気圧 P₀ (${atmosphericPressure.value} mmHg)`, 105, basinY - 48)

  // 2. ガラス管の配置
  const tubeWidth = 28
  const tubeX = width / 2 - tubeWidth / 2
  const H = tubePullUp.value
  const tubeTopY = basinY - H * mmToPx
  const totalTubePx = tubeTotalLength.value * mmToPx
  const tubeBottomY = tubeTopY + totalTubePx

  // ガラス管の外枠
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.strokeRect(tubeX, tubeTopY, tubeWidth, totalTubePx)

  // ガラス管上端の丸み・閉塞部
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.arc(tubeX + tubeWidth / 2, tubeTopY, tubeWidth / 2, Math.PI, 0)
  ctx.fill()
  ctx.stroke()

  // 3. ガラス管内の水銀柱
  const hVal = parseFloat(simData.value.h)
  const hPx = hVal * mmToPx
  const hgTopY = basinY - hPx

  // ガラス管内の水銀
  ctx.fillStyle = hgGradient
  ctx.fillRect(tubeX + 1, hgTopY, tubeWidth - 2, tubeBottomY - hgTopY - 2)

  // 水銀柱の上の液面メニスカス（凸形）
  ctx.beginPath()
  ctx.ellipse(tubeX + tubeWidth / 2, hgTopY, tubeWidth / 2 - 1, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#cbd5e1'
  ctx.fill()

  // 4. 気柱領域（またはトリチェリの真空）
  const LVal = parseFloat(simData.value.L)
  if (LVal > 0) {
    if (gasAmount.value === 0) {
      // トリチェリの真空
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
      ctx.fillRect(tubeX + 1, tubeTopY + 1, tubeWidth - 2, hgTopY - tubeTopY)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('真空', tubeX - 35, tubeTopY + (hgTopY - tubeTopY) / 2 + 4)
    } else {
      // 封入気体（薄いエメラルドグリーン）
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'
      ctx.fillRect(tubeX + 1, tubeTopY + 1, tubeWidth - 2, hgTopY - tubeTopY)
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('気体', tubeX - 35, tubeTopY + (hgTopY - tubeTopY) / 2 + 4)
    }
  }

  // 5. 測定寸法ラインとテキスト
  // 水銀柱の高さ h
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 2])
  // 液面基準線
  ctx.beginPath()
  ctx.moveTo(tubeX + tubeWidth, basinY)
  ctx.lineTo(tubeX + tubeWidth + 50, basinY)
  ctx.moveTo(tubeX + tubeWidth, hgTopY)
  ctx.lineTo(tubeX + tubeWidth + 50, hgTopY)
  ctx.stroke()
  ctx.setLineDash([])

  // 矢印 h
  ctx.beginPath()
  ctx.moveTo(tubeX + tubeWidth + 40, basinY)
  ctx.lineTo(tubeX + tubeWidth + 40, hgTopY)
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 12px monospace'
  ctx.fillText(`h = ${simData.value.h} mm`, tubeX + tubeWidth + 48, (basinY + hgTopY) / 2 + 4)

  // ガラス管上端までの高さ H
  ctx.strokeStyle = '#94a3b8'
  ctx.beginPath()
  ctx.moveTo(tubeX + tubeWidth + 120, basinY)
  ctx.lineTo(tubeX + tubeWidth + 120, tubeTopY)
  ctx.stroke()
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px monospace'
  ctx.fillText(`H = ${tubePullUp.value} mm`, tubeX + tubeWidth + 125, (basinY + tubeTopY) / 2 + 4)

  animationFrameId = requestAnimationFrame(draw)
}

function resetSim() {
  atmosphericPressure.value = 760
  tubePullUp.value = 850
  gasAmount.value = 0
  gasTemperature.value = 300
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🌡️</span>
        <span>水銀柱と大気圧・トリチェリの真空シミュレーター</span>
      </div>
      <div class="badge">ボイルの法則 × 水銀柱の圧力平衡</div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="status-panel">
        <div class="stat-row">
          <span class="lbl">大気圧 <i>P</i><sub>0</sub>:</span>
          <span class="val highlight">{{ atmosphericPressure }} mmHg</span>
        </div>
        <div class="stat-row">
          <span class="lbl">水銀柱高さ <i>h</i>:</span>
          <span class="val">{{ simData.h }} mmHg</span>
        </div>
        <div class="stat-row">
          <span class="lbl">気柱の長さ <i>L</i>:</span>
          <span class="val">{{ simData.L }} mm</span>
        </div>
        <div class="stat-row">
          <span class="lbl">上部圧力 <i>P</i><sub>gas</sub>:</span>
          <span class="val status-gas">{{ simData.Pgas }} mmHg</span>
        </div>
        <div class="condition-note" v-if="simData.isTorricelliVacuum">
          ✨ 完全なトリチェリの真空が形成されています
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>ガラス管の引き上げ高さ <i>H</i>: <span>{{ tubePullUp }} mm</span></label>
          <input type="range" v-model.number="tubePullUp" min="700" max="950" step="5" />
        </div>
        <div class="control-group">
          <label>大気圧 <i>P</i><sub>0</sub>: <span>{{ atmosphericPressure }} mmHg</span></label>
          <input type="range" v-model.number="atmosphericPressure" min="720" max="800" step="5" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>封入気体の量 <i>n</i>: <span>{{ gasAmount === 0 ? '真空 (0)' : gasAmount }}</span></label>
          <input type="range" v-model.number="gasAmount" min="0" max="10" step="1" />
        </div>
        <div class="control-group">
          <label>気体温度 <i>T</i>: <span>{{ gasTemperature }} K</span></label>
          <input type="range" v-model.number="gasTemperature" min="250" max="400" step="5" :disabled="gasAmount === 0" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-secondary" @click="gasAmount = 0">トリチェリ真空に戻す</button>
        <button class="btn btn-reset" @click="resetSim">標準状態へリセット</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sim-canvas {
  width: 100%;
  max-width: 480px;
  height: auto;
  aspect-ratio: 480 / 440;
  display: block;
}

.status-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
}

.stat-row .lbl {
  color: #94a3b8;
}

.stat-row .val {
  font-family: monospace;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-row .val.highlight {
  color: #38bdf8;
}

.stat-row .val.status-gas {
  color: #10b981;
}

.condition-note {
  margin-top: 0.3rem;
  padding-top: 0.3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #38bdf8;
  font-size: 0.7rem;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
