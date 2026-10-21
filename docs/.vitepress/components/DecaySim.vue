<template>
  <div class="decay-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>☢️ 放射性崩壊・半減期・放射線シミュレーター</h3>
        <span class="badge">Radioactive Decay &amp; Radiation</span>
      </div>
      <p class="desc">
        原子核の確率的な崩壊による半減期 <i>N</i>(<i>t</i>) = <i>N</i><sub>0</sub> (<span class="frac"><span class="num">1</span><span class="den">2</span></span>)<sup><span class="frac" style="font-size:0.75em"><span class="num"><i>t</i></span><span class="den"><i>T</i></span></span></sup> の指数関数的減衰、および α 線・β 線・γ 線の透過力・遮蔽実験をリアルタイムに体験できます。
      </p>
    </div>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'decay' }" @click="mode = 'decay'">
        ① 半減期と原子核崩壊（確率シミュレーション）
      </button>
      <button :class="{ active: mode === 'penetration' }" @click="mode = 'penetration'">
        ② 放射線の種類と物質の透過力（遮蔽実験）
      </button>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <!-- モード1: 崩壊 -->
      <div v-if="mode === 'decay'" class="controls-grid">
        <div class="control-group">
          <label><span>半減期 <i>T</i>:</span> <strong>{{ halfLife }} 秒</strong></label>
          <input type="range" v-model.number="halfLife" min="2" max="15" step="1" />
        </div>
        <div class="control-group">
          <label><span>初期原子核数 <i>N</i><sub>0</sub>:</span> <strong>{{ initialCount }} 個</strong></label>
          <input type="range" v-model.number="initialCount" min="100" max="600" step="50" @change="resetDecay" />
        </div>
        <div class="control-group button-group">
          <button class="reset-btn" @click="resetDecay">
            🔄 実験をリセットして再スタート
          </button>
        </div>
      </div>

      <!-- モード2: 透過力 -->
      <div v-if="mode === 'penetration'" class="controls-grid">
        <div class="control-group">
          <label>放射線の線源：</label>
          <div class="radio-buttons">
            <button :class="{ active: radiationType === 'alpha' }" @click="radiationType = 'alpha'">
              α 線 (He原子核)
            </button>
            <button :class="{ active: radiationType === 'beta' }" @click="radiationType = 'beta'">
              β 線 (高速電子)
            </button>
            <button :class="{ active: radiationType === 'gamma' }" @click="radiationType = 'gamma'">
              γ 線 (電磁波)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <template v-if="mode === 'decay'">
        <div class="stat-card">
          <span class="label">経過時間 <i>t</i></span>
          <span class="val highlight">{{ fmt(simTime, 1) }} 秒</span>
        </div>
        <div class="stat-card">
          <span class="label">現在の残存原子核数 <i>N</i>(<i>t</i>)</span>
          <span class="val highlight-alt">{{ activeNucleiCount }} / {{ initialCount }} 個</span>
        </div>
        <div class="stat-card">
          <span class="label">残存割合 <span class="frac"><span class="num"><i>N</i></span><span class="den"><i>N</i><sub>0</sub></span></span></span>
          <span class="val">{{ fmt((activeNucleiCount / initialCount) * 100, 1) }} %</span>
        </div>
        <div class="stat-card">
          <span class="label">理論値 <i>N</i><sub>0</sub>(<span class="frac"><span class="num">1</span><span class="den">2</span></span>)<sup><span class="frac" style="font-size:0.75em"><span class="num"><i>t</i></span><span class="den"><i>T</i></span></span></sup></span>
          <span class="val">{{ fmt(theoryCount, 0) }} 個</span>
        </div>
        <div class="stat-card">
          <span class="label">経過半減期数 <span class="frac"><span class="num"><i>t</i></span><span class="den"><i>T</i></span></span></span>
          <span class="val">{{ fmt(simTime / halfLife, 2) }} 周期</span>
        </div>
      </template>

      <template v-if="mode === 'penetration'">
        <div class="stat-card">
          <span class="label">放射線の種類</span>
          <span class="val highlight">{{ radiationInfo.name }}</span>
        </div>
        <div class="stat-card">
          <span class="label">正体</span>
          <span class="val">{{ radiationInfo.identity }}</span>
        </div>
        <div class="stat-card">
          <span class="label">電荷 / 質量数</span>
          <span class="val">{{ radiationInfo.charge }}</span>
        </div>
        <div class="stat-card">
          <span class="label">遮蔽に必要な物質</span>
          <span class="val highlight-alt">{{ radiationInfo.shield }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, dot, text, line, arrow, useLoop, fmt } from './simUtils'

const canvasRef = ref(null)
const mode = ref('decay')

// モード1: 崩壊パラメーター
const halfLife = ref(6) // 秒
const initialCount = ref(400)
const nuclei = []
const simTime = ref(0)
const activeNucleiCount = ref(400)
const historyData = [] // { t, count }

// モード2: 透過力パラメーター
const radiationType = ref('alpha') // 'alpha', 'beta', 'gamma'
const rays = []

const radiationInfo = computed(() => {
  if (radiationType.value === 'alpha') {
    return {
      name: 'α線 (アルファ線)',
      identity: 'ヘリウム原子核 (⁴₂He)',
      charge: '電荷 +2e / 質量数 4',
      shield: '紙1枚で完全遮蔽'
    }
  } else if (radiationType.value === 'beta') {
    return {
      name: 'β線 (ベータ線)',
      identity: '高速の電子 (⁰₋₁e)',
      charge: '電荷 -e / 質量数 0',
      shield: '数mmのアルミニウム板で遮蔽'
    }
  } else {
    return {
      name: 'γ線 (ガンマ線)',
      identity: '高エネルギー電磁波 (光子)',
      charge: '電荷 0 / 質量数 0',
      shield: '分厚い鉛・コンクリートで減衰'
    }
  }
})

// 原子核の初期化
function resetDecay() {
  simTime.value = 0
  nuclei.length = 0
  historyData.length = 0

  const n = initialCount.value
  const boxW = 280, boxH = 280
  const offsetX = 50, offsetY = 90

  for (let i = 0; i < n; i++) {
    nuclei.push({
      x: offsetX + Math.random() * boxW,
      y: offsetY + Math.random() * boxH,
      decayed: false,
      decayTime: null
    })
  }
  activeNucleiCount.value = n
  historyData.push({ t: 0, count: n })
}

// 理論残存数
const theoryCount = computed(() => {
  return initialCount.value * Math.pow(0.5, simTime.value / halfLife.value)
})

// 初回初期化
resetDecay()

// アニメーションループ
useLoop((dt) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = 780
  const h = 420
  const ctx = setupCanvas(canvas, w, h)
  clearGrid(ctx, w, h, 30, '#09090b')

  if (mode.value === 'decay') {
    updateDecay(dt)
    drawDecaySim(ctx, w, h)
  } else {
    updatePenetration(dt)
    drawPenetrationSim(ctx, w, h)
  }
})

// 崩壊更新
function updateDecay(dt) {
  simTime.value += dt
  if (simTime.value > halfLife.value * 3.5) {
    resetDecay()
    return
  }

  // 単位時間あたりの崩壊確率: P(dt) = 1 - 2^(-dt / T) ≈ ln(2)/T * dt
  const lambda = Math.LN2 / halfLife.value
  const prob = 1 - Math.exp(-lambda * dt)

  let alive = 0
  for (const n of nuclei) {
    if (!n.decayed && Math.random() < prob) {
      n.decayed = true
      n.decayTime = simTime.value
    }
    if (!n.decayed) alive++
  }
  activeNucleiCount.value = alive

  // グラフデータ記録 (0.15秒ごと)
  const lastT = historyData.length > 0 ? historyData[historyData.length - 1].t : 0
  if (simTime.value - lastT >= 0.15 && simTime.value <= halfLife.value * 3.5) {
    historyData.push({ t: simTime.value, count: activeNucleiCount.value })
  }
}

// -------------------------------------------------------------------
// 描画: 半減期崩壊シミュレーション
// -------------------------------------------------------------------
function drawDecaySim(ctx, w, h) {
  // 左側: サンプル容器 (x: 40 ~ 330, y: 70 ~ 360)
  const boxX = 40, boxY = 70, boxW = 290, boxH = 290
  ctx.fillStyle = '#101014'
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 2
  ctx.fillRect(boxX, boxY, boxW, boxH)
  ctx.strokeRect(boxX, boxY, boxW, boxH)

  text(ctx, '【放射性原子核サンプル】', boxX, boxY - 14, '#e4e4e7', 'bold 12px sans-serif')

  // 原子核描画
  for (const n of nuclei) {
    if (n.decayed) {
      // 安定核 (青/灰色)
      dot(ctx, n.x, n.y, 3, '#3b82f6')
    } else {
      // 放射性核 (赤/黄色)
      dot(ctx, n.x, n.y, 3.5, '#ef4444', '#fde047')
    }
  }

  // 凡例
  dot(ctx, boxX + 15, boxY + boxH + 20, 4, '#ef4444', '#fde047')
  text(ctx, `親核 (未崩壊): ${activeNucleiCount.value}`, boxX + 26, boxY + boxH + 24, '#f87171', '11px sans-serif')

  dot(ctx, boxX + 160, boxY + boxH + 20, 4, '#3b82f6')
  text(ctx, `娘核 (崩壊済): ${initialCount.value - activeNucleiCount.value}`, boxX + 172, boxY + boxH + 24, '#60a5fa', '11px sans-serif')

  // 右側: 減衰曲線グラフ (x: 390 ~ 700, y: 70 ~ 360)
  const gx0 = 395, gy0 = 340
  const gw = 295, gh = 250
  const maxT = halfLife.value * 3.2

  const toX = (t) => gx0 + (t / maxT) * gw
  const toY = (cnt) => gy0 - (cnt / initialCount.value) * gh

  text(ctx, '【残存核数の時間変化 N(t)】', gx0, 56, '#e4e4e7', 'bold 12px sans-serif')

  // 軸
  arrow(ctx, gx0, gy0, gx0 + gw + 15, gy0, '#71717a', 2, '時間 t [秒]', { align: 'left', lx: 5 })
  arrow(ctx, gx0, gy0, gx0, gy0 - gh - 15, '#71717a', 2, '原子核数 N', { align: 'center', ly: -10 })

  // 半減期の縦点線 (T, 2T, 3T)
  const T = halfLife.value
  for (let k = 1; k <= 3; k++) {
    const tx = toX(k * T)
    const ratio = Math.pow(0.5, k)
    const ny = toY(initialCount.value * ratio)
    line(ctx, tx, gy0, tx, ny, 'rgba(251, 191, 36, 0.4)', 1, [3, 3])
    line(ctx, gx0, ny, tx, ny, 'rgba(251, 191, 36, 0.4)', 1, [3, 3])
    text(ctx, `${k}T (${k * T}s)`, tx, gy0 + 16, '#fbbf24', '10px sans-serif', 'center')
    text(ctx, `${(ratio * 100).toFixed(1)}%`, gx0 - 10, ny + 4, '#fbbf24', '10px sans-serif', 'right')
  }

  // 1. 理論曲線 N = N0 (1/2)^(t/T)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let px = 0; px <= gw; px += 2) {
    const t = (px / gw) * maxT
    const cnt = initialCount.value * Math.pow(0.5, t / T)
    const x = toX(t)
    const y = toY(cnt)
    if (px === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  text(ctx, '理論曲線 N₀(1/2)^(t/T)', toX(T * 1.5), toY(initialCount.value * 0.4) - 10, '#38bdf8', '11px sans-serif')

  // 2. 実際のデータプロット
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let i = 0; i < historyData.length; i++) {
    const d = historyData[i]
    const x = toX(d.t)
    const y = toY(d.count)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 現在のプロット点
  const curX = toX(simTime.value)
  const curY = toY(activeNucleiCount.value)
  if (curX <= gx0 + gw) {
    dot(ctx, curX, curY, 6, '#f43f5e', '#ffffff')
  }
}

// -------------------------------------------------------------------
// 描画: 放射線遮蔽実験
// -------------------------------------------------------------------
let raySpawnTimer = 0

function updatePenetration(dt) {
  raySpawnTimer += dt
  if (raySpawnTimer > 0.08) {
    raySpawnTimer = 0
    // 線源 (x: 80, y: 210) から発射
    const speed = radiationType.value === 'gamma' ? 450 : radiationType.value === 'beta' ? 320 : 200
    rays.push({
      x: 80,
      y: 190 + (Math.random() - 0.5) * 60,
      vx: speed,
      type: radiationType.value,
      alive: true
    })
  }

  // 遮蔽板の x 座標
  const xPaper = 260
  const xAlumi = 450
  const xLead = 640

  for (let i = rays.length - 1; i >= 0; i--) {
    const r = rays[i]
    r.x += r.vx * dt

    // 衝突判定
    if (r.type === 'alpha' && r.x >= xPaper) {
      r.alive = false
    } else if (r.type === 'beta' && r.x >= xAlumi) {
      r.alive = false
    } else if (r.type === 'gamma' && r.x >= xLead + 40 && Math.random() < 0.9) {
      r.alive = false
    }

    if (!r.alive || r.x > 760) {
      rays.splice(i, 1)
    }
  }
}

function drawPenetrationSim(ctx, w, h) {
  // 線源 (左側)
  const srcX = 80, srcY = 210
  ctx.fillStyle = '#27272a'
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 3
  ctx.fillRect(srcX - 40, srcY - 50, 40, 100)
  ctx.strokeRect(srcX - 40, srcY - 50, 40, 100)
  text(ctx, '放射線源', srcX - 20, srcY - 60, '#f59e0b', 'bold 11px sans-serif', 'center')

  // 3つの遮蔽板
  // 1. 紙 (薄い白)
  const xPaper = 260
  ctx.fillStyle = '#f4f4f5'
  ctx.fillRect(xPaper, 100, 6, 220)
  text(ctx, '紙 1枚', xPaper + 3, 85, '#e4e4e7', 'bold 11px sans-serif', 'center')
  text(ctx, '(厚さ0.1mm)', xPaper + 3, 340, '#a1a1aa', '10px sans-serif', 'center')

  // 2. アルミニウム板 (灰色・中厚)
  const xAlumi = 450
  ctx.fillStyle = '#94a3b8'
  ctx.fillRect(xAlumi, 100, 18, 220)
  text(ctx, 'アルミニウム板', xAlumi + 9, 85, '#94a3b8', 'bold 11px sans-serif', 'center')
  text(ctx, '(厚さ5mm)', xAlumi + 9, 340, '#a1a1aa', '10px sans-serif', 'center')

  // 3. 鉛ブロック (濃いグレー・極厚)
  const xLead = 640
  ctx.fillStyle = '#475569'
  ctx.fillRect(xLead, 100, 50, 220)
  text(ctx, '鉛ブロック', xLead + 25, 85, '#cbd5e1', 'bold 11px sans-serif', 'center')
  text(ctx, '(厚さ10cm)', xLead + 25, 340, '#a1a1aa', '10px sans-serif', 'center')

  // 放射線粒子描画
  for (const r of rays) {
    if (r.type === 'alpha') {
      dot(ctx, r.x, r.y, 6, '#ef4444', '#ffffff')
    } else if (r.type === 'beta') {
      dot(ctx, r.x, r.y, 3.5, '#38bdf8', '#ffffff')
    } else {
      // ガンマ線 (波)
      ctx.strokeStyle = '#a855f7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(r.x, r.y, 8, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // 遮蔽解説バナー
  ctx.fillStyle = 'rgba(24, 24, 27, 0.9)'
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 1
  ctx.fillRect(50, 370, 680, 40)
  ctx.strokeRect(50, 370, 680, 40)

  let explanation = ''
  if (radiationType.value === 'alpha') {
    explanation = 'α線は質量が大きく電離作用が極めて強いため、空気中で数cm、紙1枚で完全に止められます。'
  } else if (radiationType.value === 'beta') {
    explanation = 'β線は高速の電子であり、紙は突き抜けますが、数mmのアルミニウム板で遮蔽されます。'
  } else {
    explanation = 'γ線は電磁波（光子）で透過力が極めて高く、アルミニウムも通過し、分厚い鉛やコンクリートでのみ遮蔽されます。'
  }
  text(ctx, explanation, 390, 394, '#e4e4e7', '12px sans-serif', 'center')
}
</script>

<style scoped>
.decay-sim {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 18px;
  margin: 1.5rem 0;
  color: #f4f4f5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.sim-header {
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fafafa;
}

.badge {
  background: #27272a;
  border: 1px solid #3f3f46;
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: monospace;
}

.desc {
  font-size: 0.85rem;
  color: #a1a1aa;
  margin: 6px 0 0 0;
  line-height: 1.5;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  padding: 0 0.15em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.1em;
  font-size: 0.85em;
}

.frac .den {
  padding-top: 0.1em;
  font-size: 0.85em;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.mode-tabs button {
  background: #27272a;
  color: #d4d4d8;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-tabs button:hover {
  background: #3f3f46;
  color: #fff;
}

.mode-tabs button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.canvas-wrap {
  width: 100%;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 780 / 420;
}

.controls-panel {
  background: #27272a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 0.8rem;
  color: #d4d4d8;
  display: flex;
  justify-content: space-between;
}

.control-group strong {
  color: #38bdf8;
}

.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-group {
  justify-content: flex-end;
}

.reset-btn {
  background: #3f3f46;
  color: #f4f4f5;
  border: 1px solid #52525b;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #f59e0b;
  border-color: #fbbf24;
  color: #000;
}

.radio-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.radio-buttons button {
  background: #18181b;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-buttons button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-card {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card .label {
  font-size: 0.72rem;
  color: #a1a1aa;
}

.stat-card .val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fafafa;
  font-family: monospace;
}

.stat-card .val.highlight {
  color: #38bdf8;
}

.stat-card .val.highlight-alt {
  color: #fbbf24;
}
</style>
