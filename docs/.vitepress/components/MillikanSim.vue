<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔬</span>
        <h3>ミリカンの油滴実験（電気素量の測定）シミュレーター</h3>
      </div>
      <p class="subtitle">
        1909年にロバート・ミリカンが電荷の最小単位「電気素量 <i>e</i> ≈ 1.602 × 10<sup>-19</sup> C」の存在を実証した実験。
        微小油滴に働く重力 <i>mg</i>、電場による静電力 <i>qE</i>、空気の粘性抵抗（ストークスの法則 6<i>πηrv</i>）のつり合いと、電荷の離散性（量子化 <i>q</i> = <i>ne</i>）をリアルタイム顕微鏡視野で観察できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="340"></canvas>
      <div class="droplet-badge" :class="{ balanced: isAnyBalanced }">
        <span>{{ isAnyBalanced ? '✨ 静止浮遊油滴あり (qE = mg つり合い達成!)' : '油滴が電場・重力下で移動中' }}</span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>極板間電圧 <i>V</i>: <strong>{{ plateVoltageV }} V</strong> (電場 <i>E</i> = {{ (plateVoltageV / 0.01).toFixed(0) }} V/m)</span>
            <input type="range" v-model.number="plateVoltageV" min="0" max="400" step="2" />
          </label>
        </div>

        <div class="control-group">
          <span class="control-label">選択中の油滴の電荷 <i>q</i>:</span>
          <div class="btn-group">
            <button
              v-for="n in [1, 2, 3, 4, 5]"
              :key="n"
              class="select-btn"
              :class="{ active: selectedChargeN === n }"
              @click="selectedChargeN = n"
            >
              <i>q</i> = -{{ n }}<i>e</i>
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>油滴の半径 <i>r</i>: <strong>{{ dropletRadiusUm.toFixed(2) }} µm</strong></span>
            <input type="range" v-model.number="dropletRadiusUm" min="0.8" max="2.5" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <span class="control-label">X線照射（イオン付着による電荷変化）:</span>
          <div class="button-row" style="margin-top: 0">
            <button class="btn select-btn highlight-btn" @click="ionizeDroplets">
              ⚡ X線を照射して電荷をランダム変化
            </button>
          </div>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="autoBalanceSelected">
          🎯 選択油滴をつり合い電圧に自動調整
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">選択油滴の電気量 <i>q</i></span>
        <span class="value highlight">-{{ (selectedChargeN * 1.602).toFixed(3) }} <span class="unit">× 10⁻¹⁹ C</span></span>
        <span class="subtext"><i>q</i> = -{{ selectedChargeN }}<i>e</i>（電気素量 {{ selectedChargeN }} 個分）</span>
      </div>

      <div class="stat-card">
        <span class="label">油滴の質量 <i>m</i></span>
        <span class="value">{{ (dropletMassKg * 1e15).toFixed(2) }} <span class="unit">fg</span></span>
        <span class="subtext"><i>m</i> = (4/3)<i>πr</i><sup>3</sup><i>ρ</i> (密度 890 kg/m³)</span>
      </div>

      <div class="stat-card">
        <span class="label">静止つり合い電圧 <i>V</i><sub>bal</sub></span>
        <span class="value">{{ balanceVoltageV.toFixed(1) }} <span class="unit">V</span></span>
        <span class="subtext"><i>V</i><sub>bal</sub> = <i>mgd</i> / <i>q</i> (<i>d</i> = 1.0 cm)</span>
      </div>

      <div class="stat-card">
        <span class="label">測定される電気素量 <i>e</i></span>
        <span class="value">1.602 <span class="unit">× 10⁻¹⁹ C</span></span>
        <span class="subtext">電荷の量子化（最小単位）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const plateVoltageV = ref(185)       // V
const selectedChargeN = ref(2)       // 2e
const dropletRadiusUm = ref(1.35)    // 1.35 µm

const eConst = 1.602e-19
const rhoOil = 890     // kg/m^3 (油の密度)
const plateDistanceM = 0.01 // 1 cm = 0.01 m
const gConst = 9.80    // m/s^2

// 質量 m = 4/3 * pi * r^3 * rho
const dropletMassKg = computed(() => {
  const rM = dropletRadiusUm.value * 1e-6
  return (4 / 3) * Math.PI * (rM ** 3) * rhoOil
})

// つり合い電圧 V_bal = mg * d / (n * e)
const balanceVoltageV = computed(() => {
  const mg = dropletMassKg.value * gConst
  const q = selectedChargeN.value * eConst
  return (mg * plateDistanceM) / q
})

const isAnyBalanced = computed(() => {
  return droplets.some(d => Math.abs(d.vy) < 0.05)
})

function autoBalanceSelected() {
  plateVoltageV.value = Math.round(balanceVoltageV.value)
}

function resetDefaults() {
  plateVoltageV.value = 185
  selectedChargeN.value = 2
  dropletRadiusUm.value = 1.35
  initDroplets()
}

// 顕微鏡内の油滴オブジェクト群
const droplets = []

function initDroplets() {
  droplets.length = 0
  const count = 12
  for (let i = 0; i < count; i++) {
    // 電荷は 1e ~ 5e
    const n = i === 0 ? selectedChargeN.value : (Math.floor(Math.random() * 5) + 1)
    // 半径にわずかな個体差
    const rScale = 0.9 + Math.random() * 0.2
    droplets.push({
      x: 180 + Math.random() * 160,
      y: 60 + Math.random() * 200,
      n: n,
      rScale: rScale,
      vy: 0,
      isMain: i === 0
    })
  }
}

function ionizeDroplets() {
  droplets.forEach(d => {
    // 電荷が ±1 変化
    const change = Math.random() < 0.5 ? 1 : -1
    d.n = Math.max(1, Math.min(5, d.n + change))
  })
}

let animId = null

function updatePhysics() {
  const E_field = plateVoltageV.value / plateDistanceM // V/m (上極板が+なら上向きの引力)
  const etaAir = 1.8e-5 // 空気の粘性係数

  droplets.forEach(d => {
    if (d.isMain) {
      d.n = selectedChargeN.value
      d.rScale = 1.0
    }
    const rM = dropletRadiusUm.value * d.rScale * 1e-6
    const m = (4 / 3) * Math.PI * (rM ** 3) * rhoOil
    const q = d.n * eConst

    const F_g = m * gConst // 下向き重力
    const F_e = q * E_field // 上向き静電力
    const netF = F_e - F_g // 上向き正

    // 終端速度 v = netF / (6 * pi * eta * r)
    const termV = netF / (6 * Math.PI * etaAir * rM)
    // 描画速度にスケーリング
    d.vy = -termV * 2500 // 上向き変位 (canvas では上がマイナス)

    // 微小なブラウン運動の揺らぎ
    const brownian = (Math.random() - 0.5) * 0.2
    d.y += d.vy + brownian
    d.x += (Math.random() - 0.5) * 0.3

    // 極板限界（リバウンドまたは再噴霧）
    if (d.y < 45) d.y = 280
    if (d.y > 285) d.y = 50
  })
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#090d16')
  bg.addColorStop(1, '#111827')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  updatePhysics()

  // 画面分割:
  // 左側: 顕微鏡レチクル視野 (w: 360)
  // 右側: 電荷量子化ヒストグラム q = ne (w: 340)

  // ---------- 左側: 顕微鏡円形視野 ----------
  const mX = 180
  const mY = h / 2
  const mR = 135

  // 顕微鏡の視野マスク（円形）
  ctx.save()
  ctx.beginPath()
  ctx.arc(mX, mY, mR, 0, Math.PI * 2)
  ctx.clip()

  // 視野内背景（暗緑色・夜光微光）
  const lensGrad = ctx.createRadialGradient(mX, mY, 10, mX, mY, mR)
  lensGrad.addColorStop(0, '#064e3b')
  lensGrad.addColorStop(0.85, '#022c22')
  lensGrad.addColorStop(1, '#011c15')
  ctx.fillStyle = lensGrad
  ctx.fillRect(mX - mR, mY - mR, mR * 2, mR * 2)

  // 平行平板電極のシンボル（上下）
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'
  ctx.fillRect(mX - mR, mY - mR, mR * 2, 8) // 上極板 (+)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'
  ctx.fillRect(mX - mR, mY + mR - 8, mR * 2, 8) // 下極板 (-)

  // 顕微鏡の微細目盛り線（スケール）
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)'
  ctx.lineWidth = 1
  for (let gy = mY - 110; gy <= mY + 110; gy += 22) {
    ctx.beginPath()
    ctx.moveTo(mX - 25, gy); ctx.lineTo(mX + 25, gy)
    ctx.stroke()
  }
  // 中央十字線
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)'
  ctx.beginPath()
  ctx.moveTo(mX, mY - mR); ctx.lineTo(mX, mY + mR)
  ctx.moveTo(mX - mR, mY); ctx.lineTo(mX + mR, mY)
  ctx.stroke()

  // 油滴の描画
  droplets.forEach(d => {
    ctx.save()
    if (d.isMain) {
      // 選択油滴（金色ハイライト）
      ctx.fillStyle = '#fbbf24'
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(d.x, d.y, 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#fef08a'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`- ${d.n}e`, d.x + 18, d.y + 3)
    } else {
      // 一般油滴（白光）
      ctx.fillStyle = 'rgba(240, 253, 250, 0.85)'
      ctx.shadowColor = '#34d399'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(d.x, d.y, 3 * d.rScale, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
    ctx.restore()
  })

  ctx.restore()

  // 顕微鏡の真鍮ベゼル外枠
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(mX, mY, mR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('対物顕微鏡レチクル視野 (油滴)', mX, mY + mR + 22)

  // ---------- 右側: 電荷量子化ヒストグラム ----------
  const hX = 390
  const hY = 50
  const hW = 290
  const hH = 230

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(hX, hY, hW, hH)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(hX, hY, hW, hH)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('ミリカンの発見: 電荷の離散的分布', hX + 12, hY + 20)

  // ヒストグラムの棒グラフ (n = 1, 2, 3, 4, 5)
  const barW = 32
  const maxBarH = 130
  const counts = [0, 0, 0, 0, 0]
  droplets.forEach(d => counts[d.n - 1]++)

  // 軸
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(hX + 30, hY + hH - 30); ctx.lineTo(hX + hW - 15, hY + hH - 30)
  ctx.stroke()

  for (let n = 1; n <= 5; n++) {
    const bx = hX + 25 + n * 44
    const count = counts[n - 1]
    const bh = Math.min(maxBarH, count * 22 + 10)
    const by = hY + hH - 30 - bh

    const isSelected = selectedChargeN.value === n
    ctx.fillStyle = isSelected ? '#fbbf24' : 'rgba(56, 189, 248, 0.65)'
    ctx.fillRect(bx, by, barW, bh)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${n}e`, bx + barW / 2, hY + hH - 14)

    ctx.fillStyle = '#cbd5e1'
    ctx.fillText(`${count}`, bx + barW / 2, by - 4)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('測定電荷 q はすべて e の整数倍！ (q = ne)', hX + hW / 2, hY + hH - 42)

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  initDroplets()
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
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
  border-radius: 8px;
  overflow: hidden;
  background: #090d16;
  border: 1px solid #334155;
}

canvas {
  width: 100%;
  height: auto;
  display: block;
}

.droplet-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.droplet-badge.balanced {
  border-color: #fbbf24;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.2);
  font-weight: bold;
}

.control-panel {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--vp-c-divider, rgba(255, 255, 255, 0.08));
  border-radius: 8px;
  padding: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.control-group label,
.control-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.control-group input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
}

.btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.select-btn {
  padding: 5px 10px;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #38bdf8;
}

.select-btn.active {
  background: rgba(56, 189, 248, 0.25);
  border-color: #38bdf8;
  color: #38bdf8;
  font-weight: bold;
}

.highlight-btn {
  background: rgba(168, 85, 247, 0.3) !important;
  border-color: #c084fc !important;
  color: #f3e8ff !important;
  font-weight: bold;
}

.highlight-btn:hover {
  background: rgba(168, 85, 247, 0.45) !important;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 14px;
  font-size: 0.82rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
}
.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--vp-c-divider, rgba(255, 255, 255, 0.08));
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.15rem;
  font-weight: bold;
  font-family: monospace;
  color: var(--vp-c-text-1, #f4f4f5);
}

.stat-card .value.highlight {
  color: #f43f5e;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: 2px;
}
</style>
