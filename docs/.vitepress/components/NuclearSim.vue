<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">⚛️ 核反応・質量欠損 & E=mc² シミュレーター</h3>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'fission' }"
          @click="setMode('fission')"
        >
          ウラン核分裂
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'fusion' }"
          @click="setMode('fusion')"
        >
          D-T 熱核融合
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
        <div class="stat-label">反応前総質量 M₁</div>
        <div class="stat-value text-blue">{{ currentReaction.m1.toFixed(5) }} <span class="stat-unit">u</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">反応後総質量 M₂</div>
        <div class="stat-value">{{ currentReaction.m2.toFixed(5) }} <span class="stat-unit">u</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">質量欠損 Δm (消えた質量)</div>
        <div class="stat-value text-rose">{{ currentReaction.dm.toFixed(5) }} <span class="stat-unit">u</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">放出エネルギー ΔE (Δmc²)</div>
        <div class="stat-value text-cyan">{{ currentReaction.energy.toFixed(1) }} <span class="stat-unit">MeV</span></div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="btn-group">
        <button @click="triggerReaction" class="sim-btn primary">
          💥 反応を開始（{{ mode === 'fission' ? '中性子照射' : '超高温衝突' }}）
        </button>
        <button @click="resetReaction" class="sim-btn secondary">🔄 リセット</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>宇宙最強のエネルギー源</strong>:
      化学反応（石炭や石油の燃焼）では分子の結合が変わるだけで質量はほぼ不変ですが、<strong>原子核反応では測定できるレベルで質量が消失（質量欠損 Δ <i>m</i>）</strong>します。<br>
      1 <i>u</i>（約 1.66 × 10<sup>-27</sup> kg）の質量が消えるだけで、アインシュタインの公式 <i>E</i> = mc² により<strong>約 931.5 MeV（石炭数千トン分）</strong>の猛烈なエネルギーが放出されます！
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const mode = ref('fission') // 'fission' | 'fusion'
const animProgress = ref(0) // 0..1
const isReacting = ref(false)

let animId = null
let lastTime = 0

// 反応データ (質量単位 u: 1u ≈ 931.5 MeV)
const reactions = {
  fission: {
    title: '²³⁵U ＋ n → ¹⁴¹Ba ＋ ⁹²Kr ＋ 3n ＋ 200 MeV',
    m1: 235.04393 + 1.00866, // 236.05259 u
    m2: 140.91441 + 91.92616 + 3 * 1.00866, // 235.86655 u
    dm: 0.18604, // u
    energy: 173.3 // MeV (核分裂片運動エネルギー主成分)
  },
  fusion: {
    title: '²H (D) ＋ ³H (T) → ⁴He (α) ＋ n ＋ 17.6 MeV',
    m1: 2.01410 + 3.01605, // 5.03015 u
    m2: 4.00150 + 1.00866, // 5.01016 u
    dm: 0.01899, // u
    energy: 17.6 // MeV
  }
}

const currentReaction = computed(() => reactions[mode.value])

function setMode(newMode) {
  mode.value = newMode
  resetReaction()
}

function triggerReaction() {
  isReacting.value = true
  animProgress.value = 0
}

function resetReaction() {
  isReacting.value = false
  animProgress.value = 0
}

function drawFission(ctx, width, height, p) {
  const cx = width / 2
  const cy = height / 2

  if (!isReacting.value || p < 0.2) {
    // 状態1: ウラン235と飛来する中性子
    const nX = 100 + p * 5 * (cx - 40 - 100)
    // 中性子 n (青い小球)
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(nX, cy, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillText('中性子 n', nX - 20, cy - 14)

    // ウラン235 (巨大な原子核)
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(cx, cy, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#000'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('²³⁵U', cx, cy + 5)
    ctx.textAlign = 'left'
  } else if (p < 0.5) {
    // 状態2: 励起された複合核 236U の変形（ひょうたん型振動）
    const deform = (p - 0.2) / 0.3 // 0..1
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.ellipse(cx - deform * 25, cy, 32, 28, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + deform * 25, cy, 30, 26, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('複合核 [²³⁶U]*', cx, cy - 40)
    ctx.textAlign = 'left'
  } else {
    // 状態3: 分裂飛散（バリウム141、クリプトン92、3個の中性子、ガンマ線フラッシュ）
    const fly = (p - 0.5) / 0.5 // 0..1

    // エネルギーフラッシュ（背景放電）
    ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, 0.4 - fly * 0.4)})`
    ctx.fillRect(0, 0, width, height)

    // バリウム141 (左上へ飛散)
    const baX = cx - 40 - fly * 150
    const baY = cy - 20 - fly * 70
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.arc(baX, baY, 28, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('¹⁴¹Ba', baX, baY + 4)

    // クリプトン92 (右下へ飛散)
    const krX = cx + 40 + fly * 150
    const krY = cy + 20 + fly * 70
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(krX, krY, 24, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText('⁹²Kr', krX, krY + 4)

    // 3個の高速中性子 (様々な方向へ)
    const nAngles = [-0.8, 1.2, 2.5]
    nAngles.forEach((ang, idx) => {
      const nx = cx + Math.cos(ang) * (60 + fly * 200)
      const ny = cy + Math.sin(ang) * (60 + fly * 200)
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(nx, ny, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#38bdf8'
      ctx.font = '11px sans-serif'
      ctx.fillText('n (高速)', nx + 8, ny)
    })
    ctx.textAlign = 'left'

    // エネルギー放出ラベル
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('⚡ 放出エネルギー: 約 200 MeV (運動エネルギー ＋ γ線)', cx - 180, cy - 130)
  }
}

function drawFusion(ctx, width, height, p) {
  const cx = width / 2
  const cy = height / 2

  if (!isReacting.value || p < 0.4) {
    // 接近する重水素(D)と三重水素(T)
    const dX = 140 + p * 2.5 * (cx - 30 - 140)
    const tX = width - 140 - p * 2.5 * (width - 140 - (cx + 30))

    // 重水素 ²H (陽子1 + 中性子1)
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(dX, cy, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('²H (D)', dX - 16, cy + 4)

    // 三重水素 ³H (陽子1 + 中性子2)
    ctx.fillStyle = '#f43f5e'
    ctx.beginPath()
    ctx.arc(tX, cy, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText('³H (T)', tX - 16, cy + 4)
  } else {
    // 融合と放出: ヘリウム4 (α粒子) + 高速中性子 + 17.6 MeV
    const fly = (p - 0.4) / 0.6

    ctx.fillStyle = `rgba(244, 63, 94, ${Math.max(0, 0.4 - fly * 0.4)})`
    ctx.fillRect(0, 0, width, height)

    // ヘリウム4 (α) (左へ飛散)
    const heX = cx - fly * 160
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(heX, cy, 24, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText('⁴He (3.5 MeV)', heX - 35, cy + 4)

    // 中性子 n (右へ高速放出: 14.1 MeV)
    const nX = cx + fly * 200
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(nX, cy, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('n (14.1 MeV)', nX + 12, cy + 4)

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('🌟 核融合エネルギー: 17.6 MeV 放出！', cx - 130, cy - 110)
  }
}

function updateAndDraw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (isReacting.value) {
    animProgress.value += dt * 0.6
    if (animProgress.value >= 1.0) {
      animProgress.value = 1.0
    }
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (mode.value === 'fission') {
    drawFission(ctx, canvas.width, canvas.height, animProgress.value)
  } else {
    drawFusion(ctx, canvas.width, canvas.height, animProgress.value)
  }

  animId = requestAnimationFrame(updateAndDraw)
}

onMounted(() => {
  animId = requestAnimationFrame(updateAndDraw)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
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

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-btn {
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn.primary {
  background: #0284c7;
  color: #fff;
  border: none;
}
.sim-btn.primary:hover {
  background: #0369a1;
}

.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: none;
}
.sim-btn.secondary:hover {
  background: #475569;
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
