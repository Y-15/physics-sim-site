<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🚗</span>
        <h3>オットーサイクルと4行程内燃機関シミュレーター</h3>
      </div>
      <p class="subtitle">
        自動車のガソリンエンジンの基礎となる理想熱サイクル「オットーサイクル」。
        断熱圧縮 → 定積加熱（点火） → 断熱膨張（仕事） → 定積冷却（排気）の4行程と、P-V線図・クランクピストン運動、圧縮比 ε による熱効率 η = 1 - 1 / ε<sup>γ-1</sup> をリアルタイム連動で体感できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="340"></canvas>
      <div class="stroke-badge" :class="currentStrokeClass">
        <span>工程: <strong>{{ strokeNames[currentStrokeIndex] }}</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>圧縮比 ε = <i>V</i><sub>1</sub> / <i>V</i><sub>2</sub>: <strong>{{ compressionRatio.toFixed(1) }}</strong></span>
            <input type="range" v-model.number="compressionRatio" min="4.0" max="14.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>比熱比 γ = <i>C</i><sub>p</sub> / <i>C</i><sub>v</sub>: <strong>{{ gammaRatio.toFixed(2) }}</strong></span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: Math.abs(gammaRatio - 1.40) < 0.01 }" @click="gammaRatio = 1.40">
                2原子分子 (空気/排気 γ=1.40)
              </button>
              <button class="select-btn" :class="{ active: Math.abs(gammaRatio - 1.67) < 0.01 }" @click="gammaRatio = 1.67">
                単原子分子 (γ=1.67)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>燃焼最高温度 <i>T</i><sub>3</sub>: <strong>{{ maxTempK }} K ({{ maxTempK - 273 }} ℃)</strong></span>
            <input type="range" v-model.number="maxTempK" min="1200" max="2500" step="50" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>エンジン回転速度:</span>
            <input type="range" v-model.number="engineSpeed" min="0.4" max="2.0" step="0.1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (ε=8.0, γ=1.40)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">理論熱効率 η</span>
        <span class="value highlight">{{ (thermalEfficiency * 100).toFixed(1) }} <span class="unit">%</span></span>
        <span class="subtext">η = 1 - 1 / ε<sup>γ - 1</sup></span>
      </div>

      <div class="stat-card">
        <span class="label">1サイクルあたりの正味の仕事 <i>W</i><sub>net</sub></span>
        <span class="value">{{ netWorkJ.toFixed(0) }} <span class="unit">J</span></span>
        <span class="subtext">P-V線図の囲む面積</span>
      </div>

      <div class="stat-card">
        <span class="label">投入熱量 <i>Q</i><sub>in</sub> (燃焼)</span>
        <span class="value">{{ heatInJ.toFixed(0) }} <span class="unit">J</span></span>
        <span class="subtext"><i>Q</i><sub>in</sub> = <i>C</i><sub>v</sub> (<i>T</i><sub>3</sub> - <i>T</i><sub>2</sub>)</span>
      </div>

      <div class="stat-card">
        <span class="label">排気熱量 <i>Q</i><sub>out</sub></span>
        <span class="value">{{ heatOutJ.toFixed(0) }} <span class="unit">J</span></span>
        <span class="subtext"><i>Q</i><sub>out</sub> = <i>C</i><sub>v</sub> (<i>T</i><sub>4</sub> - <i>T</i><sub>1</sub>)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const compressionRatio = ref(8.0) // ε = 8.0
const gammaRatio = ref(1.40)       // γ = 1.40 (空気)
const maxTempK = ref(1800)         // T3 = 1800 K
const engineSpeed = ref(1.0)

const T1 = 300 // 吸気初期温度 300K (27℃)

// 熱効率: η = 1 - 1 / (ε^(γ - 1))
const thermalEfficiency = computed(() => {
  const eps = compressionRatio.value
  const g = gammaRatio.value
  return 1 - 1 / Math.pow(eps, g - 1)
})

// 各状態の温度計算:
// 1 -> 2 断熱圧縮: T2 = T1 * ε^(γ - 1)
const T2 = computed(() => T1 * Math.pow(compressionRatio.value, gammaRatio.value - 1))
// 3: T3 = maxTempK
// 3 -> 4 断熱膨張: T4 = T3 / ε^(γ - 1)
const T4 = computed(() => maxTempK.value / Math.pow(compressionRatio.value, gammaRatio.value - 1))

// 熱量計算 (1mol あたり Cv = R / (γ - 1), R = 8.31 J/(mol K))
const Cv = computed(() => 8.31 / (gammaRatio.value - 1))
const heatInJ = computed(() => Math.max(10, Cv.value * (maxTempK.value - T2.value)))
const heatOutJ = computed(() => Math.max(5, Cv.value * (T4.value - T1)))
const netWorkJ = computed(() => heatInJ.value * thermalEfficiency.value)

const strokeNames = [
  '① 断熱圧縮 (ピストン上昇・混合気圧縮)',
  '② 定積加熱 (スパーク点火・瞬間燃焼)',
  '③ 断熱膨張 (パワーストローク・正味仕事)',
  '④ 定積冷却 (排気弁開放・熱放出)'
]

const currentStrokeIndex = ref(0)
const currentStrokeClass = computed(() => {
  if (currentStrokeIndex.value === 1) return 'combustion'
  if (currentStrokeIndex.value === 2) return 'power'
  return 'normal'
})

function resetDefaults() {
  compressionRatio.value = 8.0
  gammaRatio.value = 1.40
  maxTempK.value = 1800
  engineSpeed.value = 1.0
}

let animId = null
let crankAngle = 0 // クランク回転角 (0 ~ 4π)

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

  // クランク角進行
  crankAngle += 0.03 * engineSpeed.value
  if (crankAngle > Math.PI * 4) crankAngle -= Math.PI * 4

  // 4行程のインデックス判定 (0 ~ 4π を4分割)
  const normAngle = crankAngle % (Math.PI * 4)
  if (normAngle < Math.PI) {
    currentStrokeIndex.value = 0 // 1 -> 2 断熱圧縮
  } else if (normAngle < Math.PI * 1.3) {
    currentStrokeIndex.value = 1 // 2 -> 3 点火
  } else if (normAngle < Math.PI * 3) {
    currentStrokeIndex.value = 2 // 3 -> 4 断熱膨張
  } else {
    currentStrokeIndex.value = 3 // 4 -> 1 排気
  }

  // 画面分割:
  // 左側: エンジンシリンダー・ピストン機構 (w: 300)
  // 右側: P-V 線図インジケーター (w: 380)

  // ---------- 左側: シリンダーピストン機構 ----------
  const cX = 140
  const cTopY = 40
  const cW = 100
  const cH = 180

  // ピストンのストローク位置計算
  // 圧縮比 ε = 8 のとき、上死点 (TDC) と下死点 (BDC)
  const strokeLen = 85
  const tdcY = cTopY + 30
  // ピストンY座標 (crankAngle に応じたサイン波運動)
  const pistonNorm = (Math.cos(crankAngle * 0.5) + 1) * 0.5 // 0 (上死点) ~ 1 (下死点)
  const pistonY = tdcY + pistonNorm * strokeLen

  // シリンダー壁
  ctx.save()
  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cX - cW / 2, cTopY)
  ctx.lineTo(cX - cW / 2, cTopY + cH)
  ctx.moveTo(cX + cW / 2, cTopY)
  ctx.lineTo(cX + cW / 2, cTopY + cH)
  ctx.stroke()

  // シリンダーヘッド (上蓋)
  ctx.fillRect(cX - cW / 2 - 8, cTopY - 14, cW + 16, 14)
  ctx.strokeRect(cX - cW / 2 - 8, cTopY - 14, cW + 16, 14)

  // 点火プラグ
  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(cX - 4, cTopY - 22, 8, 12)
  if (currentStrokeIndex.value === 1) {
    // 火花スパーク
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cX, cTopY); ctx.lineTo(cX - 6, cTopY + 10)
    ctx.lineTo(cX + 6, cTopY + 14); ctx.lineTo(cX, cTopY + 22)
    ctx.stroke()
  }

  // 燃焼室内部の気体（燃焼中は真っ赤、膨張・圧縮で色変化）
  const chamberH = pistonY - cTopY
  let chamberGrad = ctx.createLinearGradient(0, cTopY, 0, pistonY)
  if (currentStrokeIndex.value === 1 || currentStrokeIndex.value === 2) {
    chamberGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)')
    chamberGrad.addColorStop(1, 'rgba(245, 158, 11, 0.65)')
  } else {
    chamberGrad.addColorStop(0, 'rgba(56, 189, 248, 0.3)')
    chamberGrad.addColorStop(1, 'rgba(56, 189, 248, 0.6)')
  }
  ctx.fillStyle = chamberGrad
  ctx.fillRect(cX - cW / 2 + 2, cTopY, cW - 4, chamberH)

  // ピストン本体
  ctx.fillStyle = '#475569'
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  ctx.fillRect(cX - cW / 2 + 3, pistonY, cW - 6, 32)
  ctx.strokeRect(cX - cW / 2 + 3, pistonY, cW - 6, 32)

  // コネクティングロッド & クランク
  const crankCenterX = cX
  const crankCenterY = cTopY + cH + 55
  const crankR = strokeLen * 0.45
  const pinX = crankCenterX + crankR * Math.sin(crankAngle * 0.5)
  const pinY = crankCenterY + crankR * Math.cos(crankAngle * 0.5)

  // ロッド
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(cX, pistonY + 16)
  ctx.lineTo(pinX, pinY)
  ctx.stroke()

  // クランク円板
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(71, 85, 105, 0.3)'
  ctx.beginPath()
  ctx.arc(crankCenterX, crankCenterY, crankR, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(pinX, pinY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('クランク回転軸', crankCenterX, crankCenterY + 45)
  ctx.restore()

  // ---------- 右側: P-V 線図 ----------
  const pvX = 350
  const pvY = 50
  const pvW = 330
  const pvH = 220

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(pvX, pvY, pvW, pvH)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(pvX, pvY, pvW, pvH)

  // 軸線
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(pvX + 30, pvY + 15); ctx.lineTo(pvX + 30, pvY + pvH - 25)
  ctx.lineTo(pvX + pvW - 15, pvY + pvH - 25)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('圧力 P', pvX + 30, pvY + 10)
  ctx.fillText('体積 V →', pvX + pvW - 35, pvY + pvH - 10)

  // P-V 座標点
  // 状態1 (V1, P1): 右下
  const v1X = pvX + pvW - 55
  const v2X = pvX + 75 // 圧縮後 V2
  const p1Y = pvY + pvH - 45

  // 状態2 (V2, P2): 断熱圧縮後
  const p2Y = p1Y - 60

  // 状態3 (V2, P3): 定積燃焼後（最上部）
  const p3Y = pvY + 30

  // 状態4 (V1, P4): 断熱膨張後
  const p4Y = p1Y - 45

  // サイクルパス描画 (1 -> 2 -> 3 -> 4 -> 1)
  ctx.save()
  // 内部塗りつぶし（正味仕事 W_net）
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'
  ctx.beginPath()
  ctx.moveTo(v1X, p1Y)
  // 1 -> 2 断熱曲線
  drawAdiabaticCurve(ctx, v1X, p1Y, v2X, p2Y)
  // 2 -> 3 定積加熱
  ctx.lineTo(v2X, p3Y)
  // 3 -> 4 断熱曲線
  drawAdiabaticCurve(ctx, v2X, p3Y, v1X, p4Y)
  // 4 -> 1 定積冷却
  ctx.lineTo(v1X, p1Y)
  ctx.closePath()
  ctx.fill()

  // 各区間の線描画
  // 1 -> 2 断熱圧縮 (青)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  drawAdiabaticCurve(ctx, v1X, p1Y, v2X, p2Y)
  ctx.stroke()

  // 2 -> 3 定積加熱 (赤・吸熱)
  ctx.strokeStyle = '#ef4444'
  ctx.beginPath()
  ctx.moveTo(v2X, p2Y); ctx.lineTo(v2X, p3Y)
  ctx.stroke()

  // 3 -> 4 断熱膨張 (オレンジ・仕事)
  ctx.strokeStyle = '#f59e0b'
  ctx.beginPath()
  drawAdiabaticCurve(ctx, v2X, p3Y, v1X, p4Y)
  ctx.stroke()

  // 4 -> 1 定積冷却 (シアン・放熱)
  ctx.strokeStyle = '#06b6d4'
  ctx.beginPath()
  ctx.moveTo(v1X, p4Y); ctx.lineTo(v1X, p1Y)
  ctx.stroke()

  // 状態番号ラベル
  ctx.font = 'bold 12px sans-serif'
  ctx.fillStyle = '#38bdf8'; ctx.fillText('①', v1X + 8, p1Y + 4)
  ctx.fillStyle = '#fbbf24'; ctx.fillText('②', v2X - 16, p2Y + 4)
  ctx.fillStyle = '#ef4444'; ctx.fillText('③', v2X - 16, p3Y - 2)
  ctx.fillStyle = '#f59e0b'; ctx.fillText('④', v1X + 8, p4Y - 2)

  // サイクル現在カーソルの描画
  let cursorX = v1X
  let cursorY = p1Y
  const idx = currentStrokeIndex.value

  if (idx === 0) {
    // 1 -> 2
    const prog = normAngle / Math.PI
    cursorX = v1X + (v2X - v1X) * prog
    cursorY = p1Y + (p2Y - p1Y) * (prog ** 1.3)
  } else if (idx === 1) {
    // 2 -> 3
    const prog = (normAngle - Math.PI) / (Math.PI * 0.3)
    cursorX = v2X
    cursorY = p2Y + (p3Y - p2Y) * prog
  } else if (idx === 2) {
    // 3 -> 4
    const prog = (normAngle - Math.PI * 1.3) / (Math.PI * 1.7)
    cursorX = v2X + (v1X - v2X) * prog
    cursorY = p3Y + (p4Y - p3Y) * (prog ** 0.8)
  } else {
    // 4 -> 1
    const prog = (normAngle - Math.PI * 3) / Math.PI
    cursorX = v1X
    cursorY = p4Y + (p1Y - p4Y) * prog
  }

  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(cursorX, cursorY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.restore()

  // V1, V2 ラベル
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('V₂', v2X, pvY + pvH - 12)
  ctx.fillText('V₁', v1X, pvY + pvH - 12)

  animId = requestAnimationFrame(draw)
}

function drawAdiabaticCurve(ctx, x1, y1, x2, y2) {
  const steps = 20
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const px = x1 + (x2 - x1) * t
    // 断熱 P ∝ V^(-γ)
    const py = y1 + (y2 - y1) * (t ** 1.25)
    if (s === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.stroke-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.stroke-badge.normal {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid #38bdf8;
  color: #38bdf8;
}

.stroke-badge.combustion {
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid #ef4444;
  color: #fca5a5;
  animation: pulseCombustion 0.6s infinite alternate;
}

.stroke-badge.power {
  background: rgba(245, 158, 11, 0.25);
  border: 1px solid #fbbf24;
  color: #fef08a;
}

@keyframes pulseCombustion {
  0% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
  100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
}
</style>
