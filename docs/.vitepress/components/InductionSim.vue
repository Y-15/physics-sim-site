<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#f59e0b">
    <div class="lab-head">
      <span class="lab-title">🧲 電磁誘導の法則と導線棒の運動 実験室</span>
      <span class="lab-badge">{{ mode === 'rail' ? '磁場中の導線棒（レール回路）' : 'コイルと棒磁石（レンツの法則）' }}</span>
    </div>

    <!-- モード切替タブ -->
    <div style="display:flex;gap:6px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'rail' }" @click="mode = 'rail'; reset()">
        🚂 磁場中の導線棒（レール回路・終端速度）
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'magnet' }" @click="mode = 'magnet'; reset()">
        🧲 コイルと棒磁石（レンツの法則・検流計）
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <!-- レール回路モードの操作 -->
    <div v-if="mode === 'rail'" class="lab-controls">
      <div class="lab-ctrl">
        <label>磁束密度 B: <strong>{{ bField.toFixed(2) }} T</strong> (⊗ 画面奥向き)</label>
        <input type="range" v-model.number="bField" min="0.2" max="2.0" step="0.1" />
      </div>

      <div class="lab-ctrl">
        <label>外力 F_ext: <strong>{{ extForce.toFixed(2) }} N</strong> (右向きに引っ張る力)</label>
        <input type="range" v-model.number="extForce" min="0.0" max="3.0" step="0.2" />
        <div class="lab-note">外力を加えると加速し、電磁気力のブレーキとつり合って終端速度に達する</div>
      </div>

      <div class="lab-ctrl">
        <label>回路の抵抗 R: <strong>{{ resistance.toFixed(1) }} Ω</strong></label>
        <input type="range" v-model.number="resistance" min="0.5" max="5.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>導線棒の質量 m: <strong>{{ rodMass.toFixed(2) }} kg</strong></label>
        <input type="range" v-model.number="rodMass" min="0.1" max="1.0" step="0.1" />
      </div>

      <div class="lab-ctrl">
        <label>シミュレーション操作</label>
        <div class="lab-row">
          <button class="lab-btn lab-btn-pri" @click="running = !running">{{ running ? '⏸️ 一時停止' : '▶️ 走行開始' }}</button>
          <button class="lab-btn" @click="reset">🔄 位置リセット</button>
        </div>
      </div>
    </div>

    <!-- 磁石モードの操作 -->
    <div v-else class="lab-controls">
      <div class="lab-ctrl">
        <label>棒磁石の位置 (ドラッグ可能): <strong>{{ (magnetX).toFixed(0) }} px</strong></label>
        <input type="range" v-model.number="magnetX" min="50" max="450" step="5" />
        <div class="lab-note">磁石を動かすと、コイルを貫く磁束が変化して誘導電流が発生！</div>
      </div>

      <div class="lab-ctrl">
        <label>磁石の向き（極性）</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: magnetPolarity === 'N' }" @click="magnetPolarity = 'N'">N極が先頭 [N | S]</button>
          <button class="lab-chip" :class="{ on: magnetPolarity === 'S' }" @click="magnetPolarity = 'S'">S極が先頭 [S | N]</button>
          <button class="lab-btn" @click="autoMoveMagnet">{{ autoOscillating ? '⏹️ 自動往復停止' : '🔁 自動往復運動' }}</button>
        </div>
      </div>
    </div>

    <!-- レール回路のステータス -->
    <div v-if="mode === 'rail'" class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">誘導起電力 V</div>
        <div class="v" style="color:#38bdf8">{{ curEmf.toFixed(2) }} <small>V</small></div>
        <div class="f">V = v B l（上向きに発生）</div>
      </div>

      <div class="lab-stat">
        <div class="k">誘導電流 I</div>
        <div class="v" style="color:#f59e0b">{{ curCurrent.toFixed(2) }} <small>A</small></div>
        <div class="f">I = V / R（反時計回り）</div>
      </div>

      <div class="lab-stat">
        <div class="k">導線棒の速さ v</div>
        <div class="v" style="color:#10b981">{{ curSpeed.toFixed(2) }} <small>m/s</small></div>
        <div class="f">理論終端速度 v_term = {{ terminalSpeed.toFixed(2) }} m/s</div>
      </div>

      <div class="lab-stat">
        <div class="k">電磁気力 F_mag</div>
        <div class="v" style="color:#ec4899">{{ curMagForce.toFixed(2) }} <small>N</small></div>
        <div class="f">F = I B l（進行と逆向きのブレーキ力）</div>
      </div>

      <div class="lab-stat">
        <div class="k">外力の仕事率 P_ext</div>
        <div class="v" style="color:#a855f7">{{ (extForce * curSpeed).toFixed(2) }} <small>W</small></div>
        <div class="f">P = F_ext · v</div>
      </div>

      <div class="lab-stat">
        <div class="k">消費ジュール熱 P_J</div>
        <div class="v" style="color:#ef4444">{{ (curCurrent * curCurrent * resistance).toFixed(2) }} <small>W</small></div>
        <div class="f">P = I²R（終端速度では外力の仕事率と完全に一致！）</div>
      </div>
    </div>

    <!-- 磁石モードのステータス -->
    <div v-else class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">検流計の針（誘導電流）</div>
        <div class="v" :style="{ color: Math.abs(galvanoCurrent) > 0.05 ? '#f59e0b' : '#94a3b8' }">
          {{ galvanoCurrent > 0.05 ? '+ 右に振れる' : (galvanoCurrent < -0.05 ? '- 左に振れる' : '0 (振れない)') }}
        </div>
        <div class="f">磁束の変化率 -dΦ/dt に比例</div>
      </div>

      <div class="lab-stat">
        <div class="k">コイルを貫く磁束 Φ</div>
        <div class="v" style="color:#38bdf8">{{ (curFlux * 1e3).toFixed(1) }} <small>mWb</small></div>
        <div class="f">磁石が近づくほど増大</div>
      </div>

      <div class="lab-stat">
        <div class="k">磁石の移動速度 v_mag</div>
        <div class="v" style="color:#10b981">{{ (magnetSpeed).toFixed(1) }} <small>cm/s</small></div>
        <div class="f">速く動かすほど大きな起電力が発生！</div>
      </div>

      <div class="lab-stat">
        <div class="k">レンツの法則の力</div>
        <div class="v" style="color:#ec4899">{{ lenzForceText }}</div>
        <div class="f">変化を妨げる向きに力が働く</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const mode = ref('rail') // 'rail' or 'magnet'

// レール回路パラメータ
const bField = ref(1.0) // T
const extForce = ref(1.2) // N
const resistance = ref(2.0) // Ω
const rodMass = ref(0.2) // kg
const rodLength = 0.5 // m (固定レール幅)

const running = ref(false)
const rodPos = ref(0.1) // m (レール上の位置 0〜1.2m)
const curSpeed = ref(0) // m/s

function reset() {
  running.value = false
  rodPos.value = 0.05
  curSpeed.value = 0
  autoOscillating.value = false
}

// 終端速度 v_term = (F_ext * R) / (B^2 * l^2)
const terminalSpeed = computed(() => {
  const bl2 = (bField.value * rodLength) ** 2
  if (bl2 < 1e-4) return 999
  return (extForce.value * resistance.value) / bl2
})

// 現在の誘導起電力 V = v B l
const curEmf = computed(() => curSpeed.value * bField.value * rodLength)

// 現在の誘導電流 I = V / R
const curCurrent = computed(() => curEmf.value / resistance.value)

// 現在の電磁気力 F_mag = I B l
const curMagForce = computed(() => curCurrent.value * bField.value * rodLength)

// 磁石モードパラメータ
const magnetX = ref(120) // px (コイル位置は x = 320)
const magnetPolarity = ref('N') // 'N' or 'S'
const autoOscillating = ref(false)
let lastMagnetX = 120
let magnetSpeed = ref(0)
let galvanoCurrent = ref(0)

function autoMoveMagnet() {
  autoOscillating.value = !autoOscillating.value
}

// コイル中心 x = 320
const coilX = 320
const curFlux = computed(() => {
  const dist = Math.abs(magnetX.value - coilX)
  const sign = magnetPolarity.value === 'N' ? 1 : -1
  // 簡易双極子磁束モデル Φ ∝ 1 / (d^2 + a^2)^(3/2)
  return (sign * 1.5e-3) / Math.pow(1 + (dist / 80) ** 2, 1.5)
})

const lenzForceText = computed(() => {
  const dx = magnetSpeed.value
  if (Math.abs(dx) < 0.2) return '静止中（力なし）'
  if (magnetX.value < coilX) {
    return dx > 0 ? '反発力（近づくのを妨げる）' : '引力（遠ざかるのを妨げる）'
  } else {
    return dx < 0 ? '反発力（近づくのを妨げる）' : '引力（遠ざかるのを妨げる）'
  }
})

const canvasRef = ref(null)
let autoTime = 0

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  if (mode.value === 'rail') {
    // 物理シミュレーション (m dv/dt = F_ext - F_mag)
    if (running.value) {
      const safeDt = Math.min(dt, 0.03)
      const netForce = extForce.value - curMagForce.value
      const acc = netForce / rodMass.value
      curSpeed.value += acc * safeDt
      if (curSpeed.value < 0) curSpeed.value = 0
      rodPos.value += curSpeed.value * safeDt * 0.4 // スケール調整

      if (rodPos.value > 1.1) {
        rodPos.value = 1.1
        running.value = false
      }
    }
    drawRailSystem(ctx, width, height)
  } else {
    // 磁石自動往復
    if (autoOscillating.value) {
      autoTime += dt * 2.5
      magnetX.value = 230 + Math.sin(autoTime) * 150
    }
    // 速度計算
    const dx = magnetX.value - lastMagnetX
    magnetSpeed.value = dx / Math.max(0.001, dt)
    lastMagnetX = magnetX.value

    // 検流計の針 (起電力 V = -dΦ/dt)
    // 速度と磁場勾配から誘導電流を計算
    const dist = magnetX.value - coilX
    const sign = magnetPolarity.value === 'N' ? 1 : -1
    // dΦ/dx の符号
    const dFlux_dx = -sign * (dist / 80) / Math.pow(1 + (dist / 80) ** 2, 2.5)
    galvanoCurrent.value = -dFlux_dx * (magnetSpeed.value * 0.08)

    drawMagnetCoilSystem(ctx, width, height)
  }
})

function drawRailSystem(ctx, w, h) {
  const padL = 70
  const railW = w - 140
  const topY = h * 0.35
  const botY = h * 0.65
  const pxPerM = railW / 1.2

  // 1. 磁場領域 (⊗ 画面奥向き)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.05)'
  ctx.fillRect(padL + 20, topY - 30, railW - 40, botY - topY + 60)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'
  ctx.strokeRect(padL + 20, topY - 30, railW - 40, botY - topY + 60)

  // ⊗ 記号
  for (let y = topY - 15; y <= botY + 15; y += 40) {
    for (let x = padL + 45; x <= padL + railW - 30; x += 45) {
      dot(ctx, x, y, 6, 'transparent', 'rgba(56, 189, 248, 0.35)', 1)
      line(ctx, x - 3.5, y - 3.5, x + 3.5, y + 3.5, { color: 'rgba(56, 189, 248, 0.35)', width: 1 })
      line(ctx, x - 3.5, y + 3.5, x + 3.5, y - 3.5, { color: 'rgba(56, 189, 248, 0.35)', width: 1 })
    }
  }
  text(ctx, `一様磁場 B = ${bField.value.toFixed(2)} T (⊗ 画面奥向き)`, padL + railW / 2, topY - 38, { color: '#38bdf8', font: 'bold 11px sans-serif' })

  // 2. 導電レール (上下2本)
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 4
  line(ctx, padL, topY, padL + railW, topY, { color: '#cbd5e1', width: 4 })
  line(ctx, padL, botY, padL + railW, botY, { color: '#cbd5e1', width: 4 })

  // 3. 左端の接続抵抗 R
  line(ctx, padL, topY, padL, topY + 30, { color: '#cbd5e1', width: 3 })
  line(ctx, padL, botY, padL, botY - 30, { color: '#cbd5e1', width: 3 })
  // 抵抗のギザギザ
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(padL - 10, topY + 30, 20, botY - topY - 60)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(padL - 10, topY + 30, 20, botY - topY - 60)
  text(ctx, `抵抗 R`, padL - 18, (topY + botY) / 2 - 8, { align: 'right', color: '#f59e0b', font: 'bold 11px sans-serif' })
  text(ctx, `${resistance.value.toFixed(1)} Ω`, padL - 18, (topY + botY) / 2 + 8, { align: 'right', color: '#f59e0b', font: '10px sans-serif' })

  // 4. 移動する導線棒
  const rodX = padL + 30 + rodPos.value * pxPerM
  ctx.fillStyle = '#38bdf8'
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.fillRect(rodX - 6, topY - 10, 12, botY - topY + 20)
  ctx.strokeRect(rodX - 6, topY - 10, 12, botY - topY + 20)

  // 導線棒の起電力矢印（下から上向き）
  if (curEmf.value > 0.05) {
    arrow(ctx, rodX, botY - 15, rodX, topY + 15, { color: '#f59e0b', width: 3, head: 7 })
    text(ctx, `起電力 V = ${curEmf.value.toFixed(2)}V ↑`, rodX + 10, (topY + botY) / 2 - 12, { align: 'left', color: '#f59e0b', font: 'bold 11px sans-serif' })
  }

  // 電流の周回矢印（反時計回り）
  if (curCurrent.value > 0.05) {
    // 上レール（左向き）
    arrow(ctx, (padL + rodX) / 2 + 20, topY, (padL + rodX) / 2 - 20, topY, { color: '#10b981', width: 2, head: 5 })
    // 下レール（右向き）
    arrow(ctx, (padL + rodX) / 2 - 20, botY, (padL + rodX) / 2 + 20, botY, { color: '#10b981', width: 2, head: 5 })
    text(ctx, `誘導電流 I = ${curCurrent.value.toFixed(2)}A`, (padL + rodX) / 2, botY + 22, { color: '#10b981', font: 'bold 11px sans-serif' })
  }

  // 力の矢印
  // 外力 F_ext (右向き)
  if (extForce.value > 0) {
    arrow(ctx, rodX + 6, (topY + botY) / 2 + 15, rodX + 6 + extForce.value * 30, (topY + botY) / 2 + 15, { color: '#38bdf8', width: 3, head: 7 })
    text(ctx, `F_ext = ${extForce.value.toFixed(2)}N →`, rodX + 16 + extForce.value * 30, (topY + botY) / 2 + 19, { align: 'left', color: '#38bdf8', font: 'bold 11px sans-serif' })
  }

  // 電磁気力 F_mag (左向きブレーキ)
  if (curMagForce.value > 0.02) {
    const fLen = Math.min(80, curMagForce.value * 30)
    arrow(ctx, rodX - 6, (topY + botY) / 2 + 15, rodX - 6 - fLen, (topY + botY) / 2 + 15, { color: '#ec4899', width: 2.5, head: 7 })
    text(ctx, `← F_mag = ${curMagForce.value.toFixed(2)}N`, rodX - 16 - fLen, (topY + botY) / 2 + 19, { align: 'right', color: '#ec4899', font: 'bold 11px sans-serif' })
  }

  // 速度表示
  text(ctx, `速さ v = ${curSpeed.value.toFixed(2)} m/s`, rodX, topY - 20, { color: '#10b981', font: 'bold 12px sans-serif' })
}

function drawMagnetCoilSystem(ctx, w, h) {
  const cy = h * 0.48

  // 1. コイル（円筒ソレノイド）
  const coilW = 100
  const coilH = 80
  const coilLeft = coilX - coilW / 2
  const coilTop = cy - coilH / 2

  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.fillRect(coilLeft, coilTop, coilW, coilH)
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 1.5
  ctx.strokeRect(coilLeft, coilTop, coilW, coilH)

  // コイルの巻き線（らせんループ）
  const turns = 6
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2.5
  for (let i = 0; i < turns; i++) {
    const lx = coilLeft + 10 + i * 15
    ctx.beginPath()
    ctx.ellipse(lx, cy, 7, coilH / 2 - 4, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  text(ctx, 'ソレノイドコイル', coilX, coilTop - 12, { color: '#f59e0b', font: 'bold 12px sans-serif' })

  // 2. コイルから検流計への配線
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(coilLeft, coilTop + 10)
  ctx.lineTo(coilLeft - 30, coilTop + 10)
  ctx.lineTo(coilLeft - 30, cy + 90)
  ctx.lineTo(coilX - 40, cy + 90)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(coilLeft + coilW, coilTop + 10)
  ctx.lineTo(coilLeft + coilW + 30, coilTop + 10)
  ctx.lineTo(coilLeft + coilW + 30, cy + 90)
  ctx.lineTo(coilX + 40, cy + 90)
  ctx.stroke()

  // 3. 検流計 (G)
  const galvX = coilX
  const galvY = cy + 90
  const galvR = 32

  dot(ctx, galvX, galvY, galvR, '#1e293b', '#64748b', 2)
  dot(ctx, galvX, galvY, 4, '#fff')
  text(ctx, 'G', galvX, galvY - 14, { color: '#94a3b8', font: 'bold 11px sans-serif' })

  // 目盛り線 (- / 0 / +)
  line(ctx, galvX - 16, galvY - 18, galvX - 12, galvY - 14, { color: '#64748b', width: 1.5 })
  line(ctx, galvX, galvY - 20, galvX, galvY - 15, { color: '#64748b', width: 1.5 })
  line(ctx, galvX + 16, galvY - 18, galvX + 12, galvY - 14, { color: '#64748b', width: 1.5 })

  // 検流計の指針（誘導電流に連動して左右に振れる）
  const needleAngle = Math.max(-0.6, Math.min(0.6, galvanoCurrent.value * 2.2))
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(galvX, galvY)
  ctx.lineTo(galvX + Math.sin(needleAngle) * 26, galvY - Math.cos(needleAngle) * 26)
  ctx.stroke()

  // 4. 棒磁石
  const magW = 100
  const magH = 34
  const magY = cy - magH / 2

  // N極とS極
  const isNLeading = magnetPolarity.value === 'N'
  // 左半分
  ctx.fillStyle = isNLeading ? '#38bdf8' : '#ef4444'
  ctx.fillRect(magnetX.value - magW / 2, magY, magW / 2, magH)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(magnetX.value - magW / 2, magY, magW / 2, magH)
  text(ctx, isNLeading ? 'S' : 'N', magnetX.value - magW / 4, cy + 5, { color: '#fff', font: 'bold 14px sans-serif' })

  // 右半分
  ctx.fillStyle = isNLeading ? '#ef4444' : '#38bdf8'
  ctx.fillRect(magnetX.value, magY, magW / 2, magH)
  ctx.strokeRect(magnetX.value, magY, magW / 2, magH)
  text(ctx, isNLeading ? 'N' : 'S', magnetX.value + magW / 4, cy + 5, { color: '#fff', font: 'bold 14px sans-serif' })

  // 磁力線（磁石から出る矢印）
  const arrowDir = isNLeading ? 1 : -1
  arrow(ctx, magnetX.value + (magW / 2) * arrowDir, cy, magnetX.value + (magW / 2 + 25) * arrowDir, cy, { color: isNLeading ? '#ef4444' : '#38bdf8', width: 2, head: 6 })
}
</script>
