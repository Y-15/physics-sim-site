<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚡</span>
        <h3>自己誘導とコイルの過渡現象（RL回路）シミュレーター</h3>
      </div>
      <p class="subtitle">
        コイルを流れる電流が変化するとき、その変化を妨げる向きに生じる自己誘導起電力 V = -L dI / dt。
        スイッチ投入時の指数関数的電流立ち上がり I(t) = E / R(1 - e<sup>-t/τ</sup>)、時定数τ = L/R、およびコイルに蓄えられる磁気エネルギーU = 1 / 2LI<sup>2</sup> をリアルタイム波形と回路図で観察できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="320"></canvas>
      <div class="switch-badge" :class="isSwitchClosed ? 'closed' : 'open'">
        <span>回路状態: <strong>{{ isSwitchClosed ? 'スイッチ ON (通電中)' : 'スイッチ OFF (遮断)' }}</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>スイッチの切り替え:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: isSwitchClosed }" @click="toggleSwitch">
                {{ isSwitchClosed ? '🔌 スイッチを切る (OFF)' : '⚡ スイッチを入れる (ON)' }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>自己インダクタンス <i>L</i>: <strong>{{ inductanceH.toFixed(1) }} H</strong></span>
            <input type="range" v-model.number="inductanceH" min="0.5" max="5.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>抵抗 <i>R</i>: <strong>{{ resistanceOhm }} Ω</strong></span>
            <input type="range" v-model.number="resistanceOhm" min="2" max="20" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>起電力 <i>E</i>: <strong>{{ voltageE }} V</strong></span>
            <input type="range" v-model.number="voltageE" min="5" max="24" step="1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetCircuit">
          🔄 回路を初期化 (t=0)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">現在の電流 <i>I(t)</i></span>
        <span class="value highlight">{{ currentI.toFixed(2) }} <span class="unit">A</span></span>
        <span class="subtext">定常電流: {{ (voltageE / resistanceOhm).toFixed(2) }} A</span>
      </div>

      <div class="stat-card">
        <span class="label">回路の時定数 τ</span>
        <span class="value">{{ timeConstantSec.toFixed(2) }} <span class="unit">秒</span></span>
        <span class="subtext">τ = L / R (63.2%に達する時間)</span>
      </div>

      <div class="stat-card">
        <span class="label">コイルの逆起電力 <i>V</i><sub>L</sub></span>
        <span class="value">{{ backEmfV.toFixed(2) }} <span class="unit">V</span></span>
        <span class="subtext"><i>V</i><sub>L</sub> = -L dI / dt</span>
      </div>

      <div class="stat-card">
        <span class="label">コイルの磁気エネルギー <i>U</i></span>
        <span class="value">{{ magneticEnergyJ.toFixed(2) }} <span class="unit">J</span></span>
        <span class="subtext">U = 1 / 2 L I<sup>2</sup></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const inductanceH = ref(2.0)  // L = 2.0 H
const resistanceOhm = ref(5)   // R = 5 Ω
const voltageE = ref(10)       // E = 10 V
const isSwitchClosed = ref(true)

const currentI = ref(0)
const backEmfV = ref(0)

const timeConstantSec = computed(() => inductanceH.value / resistanceOhm.value)
const maxCurrent = computed(() => voltageE.value / resistanceOhm.value)
const magneticEnergyJ = computed(() => 0.5 * inductanceH.value * currentI.value ** 2)

function toggleSwitch() {
  isSwitchClosed.value = !isSwitchClosed.value
}

function resetCircuit() {
  currentI.value = 0
  backEmfV.value = isSwitchClosed.value ? voltageE.value : 0
  history.length = 0
}

const history = [] // オシロスコープ履歴 { t, i }

let animId = null
let lastTimestamp = 0

function updatePhysics(dt) {
  const L = inductanceH.value
  const R = resistanceOhm.value
  const E = isSwitchClosed.value ? voltageE.value : 0

  // 微分方程式: L dI/dt + R I = E  => dI/dt = (E - R*I) / L
  const dIdt = (E - R * currentI.value) / L
  currentI.value += dIdt * dt
  if (currentI.value < 0) currentI.value = 0

  backEmfV.value = -L * dIdt

  // 履歴更新
  history.push({ i: currentI.value })
  if (history.length > 250) {
    history.shift()
  }
}

let electronPhase = 0

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

  // 物理更新 (dt ≈ 0.016s)
  updatePhysics(0.02)
  electronPhase += currentI.value * 0.15

  // 画面分割:
  // 左側: RL回路の配線図 (w: 360)
  // 右側: I-t オシロスコープグラフ (w: 340)

  // ---------- 左側: 回路図 ----------
  const cX = 50
  const cY = 50
  const cW = 280
  const cH = 220

  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()

  // 上辺: スイッチ + 抵抗 R
  ctx.moveTo(cX, cY + cH)
  ctx.lineTo(cX, cY)
  // スイッチ部分
  ctx.lineTo(cX + 60, cY)
  if (isSwitchClosed.value) {
    ctx.lineTo(cX + 100, cY) // 閉じたスイッチ
  } else {
    ctx.lineTo(cX + 95, cY - 25) // 開いたスイッチ
  }
  ctx.moveTo(cX + 100, cY)
  ctx.lineTo(cX + 140, cY)

  // 抵抗 R (ジグザグ)
  const rX = cX + 140
  const rW = 40
  ctx.lineTo(rX, cY)
  ctx.lineTo(rX + 8, cY - 8)
  ctx.lineTo(rX + 16, cY + 8)
  ctx.lineTo(rX + 24, cY - 8)
  ctx.lineTo(rX + 32, cY + 8)
  ctx.lineTo(rX + 40, cY)
  ctx.lineTo(cX + cW, cY)

  // 右辺: コイル L (ループ巻き線)
  ctx.lineTo(cX + cW, cY + 40)
  const coilY = cY + 40
  const coilLoops = 4
  const loopH = 30
  for (let k = 0; k < coilLoops; k++) {
    const ly = coilY + k * loopH
    ctx.arc(cX + cW, ly + loopH / 2, loopH / 2, -Math.PI / 2, Math.PI / 2, false)
  }
  ctx.lineTo(cX + cW, cY + cH)

  // 下辺: 電池 E
  ctx.lineTo(cX + cW / 2 + 20, cY + cH)
  // 電池シンボル (長い線+ / 短い太い線-)
  ctx.moveTo(cX + cW / 2 + 15, cY + cH - 18)
  ctx.lineTo(cX + cW / 2 + 15, cY + cH + 18)
  ctx.moveTo(cX + cW / 2 - 5, cY + cH - 10)
  ctx.lineTo(cX + cW / 2 - 5, cY + cH + 10)
  ctx.moveTo(cX + cW / 2 - 5, cY + cH)
  ctx.lineTo(cX, cY + cH)
  ctx.stroke()

  // 回路ラベル
  ctx.font = 'bold 12px sans-serif'
  ctx.fillStyle = '#fbbf24'
  ctx.fillText(`R = ${resistanceOhm.value} Ω`, rX + 6, cY - 14)
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(`L = ${inductanceH.value} H`, cX + cW + 18, cY + cH / 2)
  ctx.fillStyle = '#34d399'
  ctx.fillText(`E = ${voltageE.value} V`, cX + cW / 2 - 15, cY + cH + 28)
  ctx.fillStyle = isSwitchClosed.value ? '#38bdf8' : '#f87171'
  ctx.fillText('Switch S', cX + 65, cY - 12)

  // 電子の流れ（粒子アニメーション）
  if (currentI.value > 0.05) {
    const numElectrons = 12
    ctx.fillStyle = '#38bdf8'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 6
    for (let i = 0; i < numElectrons; i++) {
      const prog = (i / numElectrons + electronPhase * 0.05) % 1
      // 回路外周を巡回
      let epX = cX, epY = cY
      const perimeter = cW * 2 + cH * 2
      const dist = prog * perimeter
      if (dist < cW) { epX = cX + dist; epY = cY }
      else if (dist < cW + cH) { epX = cX + cW; epY = cY + (dist - cW) }
      else if (dist < cW * 2 + cH) { epX = cX + cW - (dist - (cW + cH)); epY = cY + cH }
      else { epX = cX; epY = cY + cH - (dist - (cW * 2 + cH)) }

      ctx.beginPath()
      ctx.arc(epX, epY, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }

  // ---------- 右側: I-t オシロスコープ ----------
  const gX = 400
  const gY = 45
  const gW = 280
  const gH = 220

  // グラフ背景
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(gX, gY, gW, gH)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(gX, gY, gW, gH)

  // 方眼
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)'
  ctx.beginPath()
  for (let gy = gY + 44; gy < gY + gH; gy += 44) {
    ctx.moveTo(gX, gy); ctx.lineTo(gX + gW, gy)
  }
  ctx.stroke()

  // 定常電流漸近線 (I_max)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)'
  ctx.setLineDash([4, 4])
  const iMaxY = gY + gH - (maxCurrent.value / (maxCurrent.value * 1.25)) * (gH - 30)
  ctx.beginPath()
  ctx.moveTo(gX, iMaxY); ctx.lineTo(gX + gW, iMaxY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#fbbf24'
  ctx.font = '10px sans-serif'
  ctx.fillText(`I_max = ${maxCurrent.value.toFixed(1)} A`, gX + 10, iMaxY - 4)

  // I-t 曲線
  if (history.length > 1) {
    ctx.save()
    ctx.strokeStyle = '#c084fc'
    ctx.lineWidth = 2.5
    ctx.shadowColor = '#c084fc'
    ctx.shadowBlur = 8
    ctx.beginPath()

    const stepX = gW / 250
    const scaleY = (gH - 30) / (maxCurrent.value * 1.25)

    for (let idx = 0; idx < history.length; idx++) {
      const hX = gX + idx * stepX
      const hY = gY + gH - history[idx].i * scaleY
      if (idx === 0) ctx.moveTo(hX, hY)
      else ctx.lineTo(hX, hY)
    }
    ctx.stroke()
    ctx.restore()
  }

  // グラフタイトル・軸ラベル
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('電流の時間変化 I(t) [A]', gX + 10, gY + 18)
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('0', gX + 4, gY + gH - 6)
  ctx.fillText('時間経過 t →', gX + gW - 65, gY + gH - 6)

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.switch-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.switch-badge.closed {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid #38bdf8;
  color: #38bdf8;
}

.switch-badge.open {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #f87171;
}
</style>
