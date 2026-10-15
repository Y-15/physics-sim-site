<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🔥 カルノーサイクル & 熱機関の熱効率シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge badge-cyan">{{ stageNames[currentStage] }}</span>
        <span class="badge badge-yellow">理論限界効率</span>
      </div>
    </div>

    <!-- メインCanvas (左: P-V図, 右: ピストンシリンダー) -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">高温熱源 T_H</div>
        <div class="stat-value text-rose">{{ TH }} <span class="stat-unit">K</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">低温熱源 T_L</div>
        <div class="stat-value text-blue">{{ TL }} <span class="stat-unit">K</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">吸熱量 Q_in</div>
        <div class="stat-value text-rose">{{ Qin.toFixed(0) }} <span class="stat-unit">J</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">正味の仕事 W</div>
        <div class="stat-value text-yellow">{{ Wnet.toFixed(0) }} <span class="stat-unit">J</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">カルノー熱効率 e</div>
        <div class="stat-value text-cyan">{{ (carnotEfficiency * 100).toFixed(1) }} <span class="stat-unit">%</span></div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>高温熱源温度 T_H:</span>
            <span class="control-val">{{ TH }} K ({{ TH - 273 }} ℃)</span>
          </label>
          <input type="range" v-model.number="TH" min="400" max="900" step="20" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>低温熱源温度 T_L:</span>
            <span class="control-val">{{ TL }} K ({{ TL - 273 }} ℃)</span>
          </label>
          <input type="range" v-model.number="TL" min="200" max="400" step="10" class="sim-slider" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="togglePlay" class="sim-btn primary">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ サイクル再生' }}
        </button>
        <button @click="nextStage" class="sim-btn secondary">⏭️ 次の工程へ</button>
        <button @click="resetCycle" class="sim-btn outline">🔄 リセット</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>熱力学の金字塔</strong>:
      どんなに優秀な技術者が未来の技術で作っても、<strong>熱機関の効率はカルノー効率 <i>e</i> = 1 - (<i>T</i><sub><i>L</i></sub> / <i>T</i><sub><i>H</i></sub>) を超えることはできません</strong>（熱力学第2法則）。<br>
      熱効率を 100% にするには、低温熱源を絶対零度（<i>T</i><sub><i>L</i></sub> = 0 <i>K</i>）にする必要がありますが、これは有限回の操作では不可能です。
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const isRunning = ref(true)

// 温度 [K]
const TH = ref(600) // 高温
const TL = ref(300) // 低温

// カルノーサイクル 4工程
// 0: A->B 等温膨張 (THで吸熱 Qin)
// 1: B->C 断熱膨張 (温度降下 TH -> TL)
// 2: C->D 等温圧縮 (TLで放熱 Qout)
// 3: D->A 断熱圧縮 (温度上昇 TL -> TH)
const currentStage = ref(0)
const stageProgress = ref(0) // 0..1
const stageNames = [
  '① A→B 等温膨張（高温熱源から吸熱 Q_in）',
  '② B→C 断熱膨張（温度降下 T_H → T_L）',
  '③ C→D 等温圧縮（低温熱源へ放熱 Q_out）',
  '④ D→A 断熱圧縮（温度上昇 T_L → T_H）'
]

// カルノー効率
const carnotEfficiency = computed(() => {
  return 1 - TL.value / TH.value
})

// 吸熱量・仕事概算
const Qin = computed(() => TH.value * 2.5)
const Wnet = computed(() => Qin.value * carnotEfficiency.value)

let animId = null
let lastTime = 0

function togglePlay() {
  isRunning.value = !isRunning.value
}

function nextStage() {
  currentStage.value = (currentStage.value + 1) % 4
  stageProgress.value = 0
}

function resetCycle() {
  currentStage.value = 0
  stageProgress.value = 0
}

function updateAndDraw(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (isRunning.value) {
    stageProgress.value += dt * 0.4
    if (stageProgress.value >= 1.0) {
      stageProgress.value = 0
      currentStage.value = (currentStage.value + 1) % 4
    }
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // --- 左側: P-V インジケーター図 (x = 30..350, y = 30..330) ---
  const pvX = 60
  const pvY = 40
  const pvW = 280
  const pvH = 260

  // 軸
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pvX, pvY + pvH)
  ctx.lineTo(pvX + pvW, pvY + pvH) // V軸
  ctx.moveTo(pvX, pvY + pvH)
  ctx.lineTo(pvX, pvY) // P軸
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px sans-serif'
  ctx.fillText('体積 V', pvX + pvW - 35, pvY + pvH + 20)
  ctx.fillText('圧力 P', pvX - 45, pvY + 15)

  // 4頂点の座標定義 (A, B, C, D)
  // 温度比率により座標を動的計算
  const tRatio = TL.value / TH.value // 0.3..0.8
  const pA = { x: pvX + 45, y: pvY + 35 }
  const pB = { x: pvX + 130, y: pvY + 80 }
  const pC = { x: pvX + 230, y: pvY + 80 + (pvH - 120) * (1 - tRatio) }
  const pD = { x: pvX + 110, y: pvY + 35 + (pvH - 120) * (1 - tRatio) }

  // サイクル内部の塗り（仕事 W）
  ctx.beginPath()
  ctx.moveTo(pA.x, pA.y)
  ctx.quadraticCurveTo((pA.x + pB.x) / 2, (pA.y + pB.y) / 2 - 8, pB.x, pB.y) // A->B
  ctx.quadraticCurveTo((pB.x + pC.x) / 2 + 10, (pB.y + pC.y) / 2, pC.x, pC.y) // B->C
  ctx.quadraticCurveTo((pC.x + pD.x) / 2, (pC.y + pD.y) / 2 + 8, pD.x, pD.y) // C->D
  ctx.quadraticCurveTo((pD.x + pA.x) / 2 - 10, (pD.y + pA.y) / 2, pA.x, pA.y) // D->A
  ctx.closePath()
  ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'
  ctx.fill()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // 頂点ラベル
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('A (T_H)', pA.x - 15, pA.y - 8)
  ctx.fillText('B (T_H)', pB.x + 8, pB.y - 6)
  ctx.fillText('C (T_L)', pC.x + 8, pC.y + 12)
  ctx.fillText('D (T_L)', pD.x - 25, pD.y + 14)

  ctx.fillStyle = '#fbbf24'
  ctx.font = '12px sans-serif'
  ctx.fillText('面積 ＝ 正味の仕事 W', pvX + 70, pvY + pvH / 2 + 15)

  // 現在の状態点 (赤い球)
  let curX = pA.x, curY = pA.y
  const pr = stageProgress.value
  if (currentStage.value === 0) {
    curX = pA.x + (pB.x - pA.x) * pr
    curY = pA.y + (pB.y - pA.y) * pr
  } else if (currentStage.value === 1) {
    curX = pB.x + (pC.x - pB.x) * pr
    curY = pB.y + (pC.y - pB.y) * pr
  } else if (currentStage.value === 2) {
    curX = pC.x + (pD.x - pC.x) * pr
    curY = pC.y + (pD.y - pC.y) * pr
  } else {
    curX = pD.x + (pA.x - pD.x) * pr
    curY = pD.y + (pA.y - pD.y) * pr
  }

  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(curX, curY, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()

  // --- 右側: ピストンシリンダー機構 (x = 390..660, y = 50..310) ---
  const cylX = 420
  const cylY = 80
  const cylW = 220
  const cylH = 130

  // シリンダー外枠
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 4
  ctx.strokeRect(cylX, cylY, cylW, cylH)

  // ピストン位置（体積に連動）
  // curX (pvX+45 .. pvX+230) をピストン位置にマッピング
  const vNorm = (curX - (pvX + 45)) / (230 - 45) // 0..1
  const pistonX = cylX + 50 + vNorm * 130

  // 気体内部 (色: 高温なら赤み、低温なら青み)
  const isHighT = currentStage.value === 0 || (currentStage.value === 1 && pr < 0.5) || (currentStage.value === 3 && pr > 0.5)
  ctx.fillStyle = isHighT ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.3)'
  ctx.fillRect(cylX + 2, cylY + 2, pistonX - cylX - 2, cylH - 4)

  // ピストンヘッド
  ctx.fillStyle = '#94a3b8'
  ctx.fillRect(pistonX, cylY + 4, 16, cylH - 8)
  // ピストンロッド
  ctx.fillStyle = '#64748b'
  ctx.fillRect(pistonX + 16, cylY + cylH / 2 - 8, cylW + cylX - pistonX - 16, 16)

  // 熱源の配置（底面）
  const heatY = cylY + cylH + 12
  if (currentStage.value === 0) {
    // 高温熱源から吸熱
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(cylX + 20, heatY, 140, 30)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`高温熱源 T_H (${TH.value}K) 吸熱 ↑`, cylX + 30, heatY + 20)
  } else if (currentStage.value === 2) {
    // 低温熱源へ放熱
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(cylX + 20, heatY, 140, 30)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`低温熱源 T_L (${TL.value}K) 放熱 ↓`, cylX + 30, heatY + 20)
  } else {
    // 断熱壁
    ctx.fillStyle = '#334155'
    ctx.fillRect(cylX + 20, heatY, 140, 30)
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('断熱壁 (Q ＝ 0)', cylX + 50, heatY + 20)
  }

  // 気体温度表示
  ctx.fillStyle = isHighT ? '#f43f5e' : '#38bdf8'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText(`気体温度: ${isHighT ? TH.value : TL.value} K`, cylX + 20, cylY - 14)

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

.sim-badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
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
