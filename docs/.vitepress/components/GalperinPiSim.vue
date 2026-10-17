<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎱</span>
        <h3>ガルペリンのビリヤード（2物体の完全弾性衝突と円周率 π）シミュレーター</h3>
      </div>
      <p class="subtitle">
        壁と小物体 A（質量 <i>m</i>）、大物体 B（質量 <i>M</i> = 100<sup><i>k</i></sup><i>m</i>）の完全弾性衝突において、
        総衝突回数が 3, 31, 314, 3141... と円周率 π の桁数を刻む神秘の数理物理現象。
        実空間での衝突（左）と、エネルギー保存則が描く相空間の真円 $X^2 + Y^2 = R^2$ における幾何学的等角反射（右）を完全同期描画します。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="760" height="380"></canvas>
      <div class="pi-badge">
        <span>総衝突回数: <strong class="counter">{{ collisionCount }}</strong> 回</span>
        <span class="separator">/</span>
        <span>理論値: <strong>{{ theoreticalN }}</strong> 回</span>
        <span class="status-tag" :class="{ finished: isTerminated }">
          {{ isTerminated ? '✅ 衝突終了 (0 ≤ v ≤ V)' : '⚡ 衝突中...' }}
        </span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>質量比 <i>M</i>/<i>m</i> プリセット選択:</span>
            <div class="btn-group flex-wrap">
              <button 
                v-for="preset in presets" 
                :key="preset.k" 
                class="select-btn" 
                :class="{ active: currentPreset.k === preset.k }"
                @click="selectPreset(preset)"
              >
                {{ preset.label }} (N = {{ preset.expectedN }})
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>再生シミュレーション速度: <strong>{{ playbackSpeed }}x</strong></span>
            <input type="range" v-model.number="playbackSpeed" min="1" max="50" step="1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="stepCollision" :disabled="isTerminated">
          ⏭ 1衝突進める
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 リセット
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">質量比 <i>M</i>/<i>m</i></span>
        <span class="value">{{ currentPreset.massRatio }}</span>
        <span class="subtext">θ = arctan(√(m/M))</span>
      </div>

      <div class="stat-card">
        <span class="label">反射角ステップ <i>θ</i></span>
        <span class="value highlight">{{ (thetaRad * 180 / Math.PI).toFixed(2) }}°</span>
        <span class="subtext">{{ thetaRad.toFixed(5) }} rad</span>
      </div>

      <div class="stat-card">
        <span class="label">半周あたりの分割数 π/<i>θ</i></span>
        <span class="value highlight">{{ (Math.PI / thetaRad).toFixed(3) }}</span>
        <span class="subtext">N = ⌊π/θ⌋ (または π/θ - 1)</span>
      </div>

      <div class="stat-card">
        <span class="label">円周率 π の近似桁</span>
        <span class="value pi-val">{{ collisionCount.toString() }}</span>
        <span class="subtext">理論値 π = 3.14159265...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { clearGrid, arrow, text, dot, line, useLoop } from './simUtils'

const canvasRef = ref(null)

const presets = [
  { k: 0, label: 'M = m (k=0)', massRatio: 1, expectedN: 3 },
  { k: '3m', label: 'M = 3m (特別)', massRatio: 3, expectedN: 5 },
  { k: 1, label: 'M = 100m (k=1)', massRatio: 100, expectedN: 31 },
  { k: 2, label: 'M = 10000m (k=2)', massRatio: 10000, expectedN: 314 }
]

const currentPreset = ref(presets[2]) // 初期値 M = 100m (N = 31)
const playbackSpeed = ref(5)
const isRunning = ref(true)

// 物理パラメータ
const massA = 1.0
const massB = computed(() => massA * currentPreset.value.massRatio)
const thetaRad = computed(() => Math.atan(Math.sqrt(massA / massB.value)))
const theoreticalN = computed(() => {
  const ratio = Math.PI / thetaRad.value
  return Math.abs(ratio - Math.round(ratio)) < 1e-7 ? Math.round(ratio) - 1 : Math.floor(ratio)
})

// 状態変数
let posA = 3.0
let posB = 7.0
let velA = 0.0
let velB = -1.0
const collisionCount = ref(0)
const isTerminated = ref(false)
let phasePoints = []
let simAccumTime = 0

function resetSim() {
  posA = 3.0
  posB = 7.0
  velA = 0.0
  velB = -1.0
  collisionCount.value = 0
  isTerminated.value = false
  simAccumTime = 0

  const X0 = Math.sqrt(massB.value) * velB
  const Y0 = Math.sqrt(massA) * velA
  phasePoints = [{ X: X0, Y: Y0 }]
}

function selectPreset(preset) {
  currentPreset.value = preset
  resetSim()
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

// 厳密なイベント駆動衝突判定
function advanceNextCollision() {
  if (isTerminated.value) return

  // 終了条件チェック: 0 <= velA <= velB かつ velA >= 0
  if (velA >= -1e-9 && velB >= velA - 1e-9) {
    isTerminated.value = true
    return
  }

  // 次の衝突までの時間を計算:
  // 1. 壁との衝突 (posA + velA * dt = 0, velA < 0 の場合)
  let dtWall = Infinity
  if (velA < -1e-9) {
    dtWall = -posA / velA
  }

  // 2. A と B の衝突 (posA + velA * dt = posB + velB * dt)
  let dtAB = Infinity
  const relV = velA - velB
  if (relV > 1e-9) {
    dtAB = (posB - posA) / relV
  }

  if (dtWall === Infinity && dtAB === Infinity) {
    isTerminated.value = true
    return
  }

  if (dtWall <= dtAB && dtWall < Infinity) {
    // 壁との衝突イベント
    posA = 0
    posB += velB * dtWall
    velA = -velA // 壁での完全弾性衝突
    collisionCount.value++
  } else if (dtAB < Infinity) {
    // A と B の完全弾性衝突イベント
    posA += velA * dtAB
    posB = posA
    const mA = massA
    const mB = massB.value
    const vA_next = ((mA - mB) * velA + 2 * mB * velB) / (mA + mB)
    const vB_next = (2 * mA * velA + (mB - mA) * velB) / (mA + mB)
    velA = vA_next
    velB = vB_next
    collisionCount.value++
  }

  const X = Math.sqrt(massB.value) * velB
  const Y = Math.sqrt(massA) * velA
  phasePoints.push({ X, Y })

  // 終了条件再チェック
  if (velA >= -1e-9 && velB >= velA - 1e-9) {
    isTerminated.value = true
  }
}

function stepCollision() {
  advanceNextCollision()
}

resetSim()

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  if (isRunning.value && !isTerminated.value) {
    simAccumTime += dt * playbackSpeed.value
    const stepsToRun = Math.min(25, Math.floor(simAccumTime * 12))
    if (stepsToRun > 0) {
      for (let s = 0; s < stepsToRun; s++) {
        if (!isTerminated.value) {
          advanceNextCollision()
        }
      }
      simAccumTime = 0
    }
  }

  clearGrid(ctx, width, height, 40, '#0c0e14')

  const midX = width * 0.48

  // 左右の分割線
  line(ctx, midX, 10, midX, height - 10, 'rgba(255,255,255,0.12)', 1.5, [4, 4])

  // ==========================================
  // 左画面：実空間の1次元衝突アニメーション
  // ==========================================
  const realW = midX - 30
  const wallX = 35
  const floorY = height * 0.68

  text(ctx, '実空間 (x軸上の完全弾性衝突)', wallX, 30, '#e4e4e7', 'bold 13px sans-serif')
  text(ctx, `壁 x = 0`, wallX - 10, floorY + 22, '#f59e0b', 'bold 11px sans-serif')

  // 壁
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(wallX, 50)
  ctx.lineTo(wallX, floorY + 10)
  ctx.stroke()

  // 床
  line(ctx, wallX, floorY, midX - 15, floorY, 'rgba(255,255,255,0.4)', 2)

  // 描画座標へのスケーリング
  const maxDisplayX = 14
  const realScale = (realW - 20) / maxDisplayX
  const pxA = wallX + Math.min(maxDisplayX - 1, Math.max(0, posA)) * realScale
  const pxB = wallX + Math.min(maxDisplayX, Math.max(posA + 0.5, posB)) * realScale

  // 小物体 A (質量 m)
  const sizeA = 24
  ctx.fillStyle = '#22d3ee'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.fillRect(pxA, floorY - sizeA, sizeA, sizeA)
  ctx.strokeRect(pxA, floorY - sizeA, sizeA, sizeA)
  text(ctx, 'A', pxA + 8, floorY - sizeA / 2 + 4, '#0c0e14', 'bold 12px sans-serif')
  text(ctx, `m = ${massA}`, pxA - 2, floorY - sizeA - 6, '#22d3ee', '11px sans-serif')

  // 速度ベクトル A
  if (Math.abs(velA) > 0.05) {
    arrow(ctx, pxA + sizeA / 2, floorY - sizeA / 2, pxA + sizeA / 2 + velA * 15, floorY - sizeA / 2, '#22d3ee', 2, '', { head: 5 })
  }

  // 大物体 B (質量 M)
  const sizeB = 44
  ctx.fillStyle = '#ec4899'
  ctx.strokeStyle = '#f472b6'
  ctx.lineWidth = 2
  ctx.fillRect(pxB, floorY - sizeB, sizeB, sizeB)
  ctx.strokeRect(pxB, floorY - sizeB, sizeB, sizeB)
  text(ctx, 'B', pxB + 16, floorY - sizeB / 2 + 5, '#ffffff', 'bold 14px sans-serif')
  text(ctx, `M = ${massB.value}m`, pxB, floorY - sizeB - 6, '#ec4899', 'bold 11px sans-serif')

  // 速度ベクトル B
  if (Math.abs(velB) > 0.05) {
    arrow(ctx, pxB + sizeB / 2, floorY - sizeB / 2, pxB + sizeB / 2 + velB * 15, floorY - sizeB / 2, '#ec4899', 2.5, '', { head: 6 })
  }

  // ==========================================
  // 右画面：相空間 (X = √M V, Y = √m v)
  // ==========================================
  const phaseCenterX = midX + (width - midX) / 2
  const phaseCenterY = height / 2 + 10
  const phaseRadiusPx = Math.min((width - midX) * 0.38, height * 0.36)

  text(ctx, '相空間 (エネルギー保存円 X² + Y² = R²)', midX + 25, 30, '#e4e4e7', 'bold 13px sans-serif')

  // 相空間の座標軸
  arrow(ctx, phaseCenterX - phaseRadiusPx - 25, phaseCenterY, phaseCenterX + phaseRadiusPx + 28, phaseCenterY, 'rgba(255,255,255,0.35)', 1.5, 'X = √MV', { head: 6, lx: 6 })
  arrow(ctx, phaseCenterX, phaseCenterY + phaseRadiusPx + 20, phaseCenterX, phaseCenterY - phaseRadiusPx - 24, 'rgba(255,255,255,0.35)', 1.5, 'Y = √mv', { head: 6, ly: -8 })

  // 終了領域（0 <= Y <= X tanθ）の扇形ハイライト
  ctx.save()
  ctx.fillStyle = 'rgba(16, 185, 129, 0.18)'
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(phaseCenterX, phaseCenterY)
  ctx.arc(phaseCenterX, phaseCenterY, phaseRadiusPx, -thetaRad.value, 0, false)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  text(ctx, '終了扇形領域 (幅 θ)', phaseCenterX + phaseRadiusPx * 0.45, phaseCenterY - phaseRadiusPx * 0.2, '#10b981', 'bold 10px sans-serif')
  ctx.restore()

  // エネルギー保存円
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(phaseCenterX, phaseCenterY, phaseRadiusPx, 0, Math.PI * 2)
  ctx.stroke()

  // 衝突軌跡の描画（弦の多重反射）
  const initialR = Math.sqrt(massB.value) * 1.0 // 初期速度 -1.0
  if (phasePoints.length > 1) {
    ctx.save()
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 1.8
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 6
    ctx.beginPath()
    for (let i = 0; i < phasePoints.length; i++) {
      const px = phaseCenterX + (phasePoints[i].X / initialR) * phaseRadiusPx
      const py = phaseCenterY - (phasePoints[i].Y / initialR) * phaseRadiusPx
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.restore()
  }

  // 現在の相空間点 P
  if (phasePoints.length > 0) {
    const lastP = phasePoints[phasePoints.length - 1]
    const curPx = phaseCenterX + (lastP.X / initialR) * phaseRadiusPx
    const curPy = phaseCenterY - (lastP.Y / initialR) * phaseRadiusPx
    dot(ctx, curPx, curPy, 5, '#fbbf24', '#ffffff')
    text(ctx, `P${collisionCount.value}`, curPx + 8, curPy - 6, '#fbbf24', 'bold 11px sans-serif')
  }

  // 初期点 P0
  dot(ctx, phaseCenterX - phaseRadiusPx, phaseCenterY, 3.5, '#f43f5e')
  text(ctx, 'P₀(-R,0)', phaseCenterX - phaseRadiusPx - 45, phaseCenterY + 14, '#f43f5e', '10px sans-serif')
})
</script>

<style scoped>
.sim-container {
  background: var(--vp-c-bg-soft, #18181b);
  border: 1px solid var(--vp-c-divider, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 18px;
  margin: 24px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.sim-header h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  color: var(--vp-c-text-1, #f4f4f5);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtitle {
  font-size: 0.88rem;
  color: var(--vp-c-text-2, #a1a1aa);
  line-height: 1.5;
  margin-bottom: 14px;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  background: #0c0e14;
}

.pi-badge {
  position: absolute;
  top: 10px;
  left: 12px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.84rem;
  color: #fef3c7;
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter {
  font-size: 1.1rem;
  color: #fbbf24;
}

.status-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-tag.finished {
  background: rgba(16, 185, 129, 0.25);
  color: #10b981;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
}

.control-panel {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 14px;
  margin-top: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.84rem;
  color: var(--vp-c-text-1, #e4e4e7);
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #fbbf24;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.select-btn {
  padding: 5px 10px;
  font-size: 0.78rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: var(--vp-c-text-2, #a1a1aa);
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn.active {
  background: #d97706;
  color: #ffffff;
  border-color: #fbbf24;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #d97706;
  color: #ffffff;
}

.btn-primary:hover {
  background: #b45309;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.76rem;
  color: var(--vp-c-text-2, #a1a1aa);
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--vp-c-text-1, #f4f4f5);
}

.stat-card .value.highlight {
  color: #fbbf24;
}

.stat-card .value.pi-val {
  color: #ec4899;
  letter-spacing: 1px;
}

.stat-card .subtext {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: 2px;
}
</style>
