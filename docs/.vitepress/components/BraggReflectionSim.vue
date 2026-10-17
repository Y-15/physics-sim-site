<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">💎</span>
        <h3>ブラッグ反射とX線結晶回折シミュレーター</h3>
      </div>
      <p class="subtitle">
        1913年にブラッグ父子が解明した結晶構造解析の金字塔。
        規則正しく並んだ結晶格子面（面間隔 <i>d</i>）に波長 λ のX線をすれすれ角 θ で入射したときの光路差 2dsinθ と、強め合いのブラッグ条件 2dsinθ = nλ、およびX線回折強度ピークをリアルタイム可視化します。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="340"></canvas>
      <div class="bragg-status-badge" :class="{ matched: isBraggPeak }">
        <span>{{ isBraggPeak ? `✨ ブラッグ反射成立! (${braggOrder}次極大ピーク)` : '非干渉 (位相が打ち消し合い散乱)' }}</span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>入射角（すれすれ角）θ: <strong>{{ glancingAngleDeg.toFixed(1) }}°</strong></span>
            <input type="range" v-model.number="glancingAngleDeg" min="10" max="75" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>結晶格子面間隔 <i>d</i>: <strong>{{ latticeSpacingNm.toFixed(3) }} nm</strong></span>
            <input type="range" v-model.number="latticeSpacingNm" min="0.15" max="0.40" step="0.005" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>X線の波長 λ: <strong>{{ xRayWavelengthNm.toFixed(3) }} nm</strong></span>
            <input type="range" v-model.number="xRayWavelengthNm" min="0.05" max="0.25" step="0.005" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>プリセット結晶:</span>
            <div class="btn-group">
              <button class="select-btn" @click="setPreset('nacl')">NaCl (食塩 d=0.282nm)</button>
              <button class="select-btn" @click="setPreset('si')">Si (シリコン d=0.314nm)</button>
              <button class="select-btn" @click="setPreset('cu')">Cu (銅 d=0.208nm)</button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="snapToBraggAngle">
          🎯 最寄りのブラッグ角に自動調整
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">光路差 2dsinθ</span>
        <span class="value highlight">{{ pathDifferenceNm.toFixed(3) }} <span class="unit">nm</span></span>
        <span class="subtext">波長比 2dsinθ / λ = {{ (pathDifferenceNm / xRayWavelengthNm).toFixed(2) }}</span>
      </div>

      <div class="stat-card">
        <span class="label">反射X線強度 I(θ)</span>
        <span class="value" :class="{ 'text-emerald-400': isBraggPeak }">{{ (reflectionIntensity * 100).toFixed(0) }} <span class="unit">%</span></span>
        <span class="subtext">{{ isBraggPeak ? '完全同位相で強め合い' : '位相差による干渉減衰' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">1次ブラッグ角 <i>θ</i><sub>1</sub></span>
        <span class="value">{{ theta1Deg > 0 ? `${theta1Deg.toFixed(1)}°` : '存在せず' }}</span>
        <span class="subtext"><i>sinθ</i><sub>1</sub> = λ / 2d</span>
      </div>

      <div class="stat-card">
        <span class="label">2次ブラッグ角 <i>θ</i><sub>2</sub></span>
        <span class="value">{{ theta2Deg > 0 ? `${theta2Deg.toFixed(1)}°` : '存在せず' }}</span>
        <span class="subtext"><i>sinθ</i><sub>2</sub> = 2λ / 2d</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const glancingAngleDeg = ref(25.0)   // θ = 25.0°
const latticeSpacingNm = ref(0.282)   // d = 0.282 nm (NaCl)
const xRayWavelengthNm = ref(0.154)   // λ = 0.154 nm (Cu-Kα線)

const thetaRad = computed(() => (glancingAngleDeg.value * Math.PI) / 180)
// 光路差 Δ = 2d sinθ
const pathDifferenceNm = computed(() => 2 * latticeSpacingNm.value * Math.sin(thetaRad.value))

const ratio = computed(() => pathDifferenceNm.value / xRayWavelengthNm.value)
const nearestN = computed(() => Math.round(ratio.value))
const phaseDiff = computed(() => Math.abs(ratio.value - nearestN.value))

const isBraggPeak = computed(() => nearestN.value >= 1 && phaseDiff.value < 0.04)
const braggOrder = computed(() => nearestN.value)

// 干渉強度 I = (sin(N delta/2) / sin(delta/2))^2 相当
const reflectionIntensity = computed(() => {
  const dPhase = phaseDiff.value * 2 * Math.PI
  return Math.exp(-Math.pow(dPhase * 3.5, 2))
})

// 1次、2次ブラッグ角
const theta1Deg = computed(() => {
  const s = xRayWavelengthNm.value / (2 * latticeSpacingNm.value)
  return s <= 1.0 ? (Math.asin(s) * 180) / Math.PI : -1
})

const theta2Deg = computed(() => {
  const s = (2 * xRayWavelengthNm.value) / (2 * latticeSpacingNm.value)
  return s <= 1.0 ? (Math.asin(s) * 180) / Math.PI : -1
})

function snapToBraggAngle() {
  const n = Math.max(1, nearestN.value)
  const sinTarget = (n * xRayWavelengthNm.value) / (2 * latticeSpacingNm.value)
  if (sinTarget <= 0.98) {
    glancingAngleDeg.value = Math.round((Math.asin(sinTarget) * 180 / Math.PI) * 10) / 10
  } else if (theta1Deg.value > 0) {
    glancingAngleDeg.value = Math.round(theta1Deg.value * 10) / 10
  }
}

function setPreset(type) {
  if (type === 'nacl') {
    latticeSpacingNm.value = 0.282
  } else if (type === 'si') {
    latticeSpacingNm.value = 0.314
  } else if (type === 'cu') {
    latticeSpacingNm.value = 0.208
  }
  snapToBraggAngle()
}

function resetDefaults() {
  latticeSpacingNm.value = 0.282
  xRayWavelengthNm.value = 0.154
  glancingAngleDeg.value = 15.9 // NaCl 1次
}

let animId = null
let waveTime = 0

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

  waveTime += 0.05

  const centerX = w / 2 - 40
  const layer1Y = 180
  const layerGap = (latticeSpacingNm.value / 0.3) * 65 // 画面ピクセル換算
  const layer2Y = layer1Y + layerGap

  const th = thetaRad.value

  // 1. 結晶格子の原子列の描画 (第1層・第2層)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(40, layer1Y); ctx.lineTo(w - 120, layer1Y)
  ctx.moveTo(40, layer2Y); ctx.lineTo(w - 120, layer2Y)
  ctx.stroke()
  ctx.setLineDash([])

  // 格子面間隔 d の注記
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(70, layer1Y); ctx.lineTo(70, layer2Y)
  ctx.moveTo(66, layer1Y); ctx.lineTo(74, layer1Y)
  ctx.moveTo(66, layer2Y); ctx.lineTo(74, layer2Y)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`d = ${latticeSpacingNm.value.toFixed(3)} nm`, 62, (layer1Y + layer2Y) / 2 + 4)

  // 原子の描画（結晶格子点）
  const atomSpacing = 65
  for (let ax = 120; ax <= w - 140; ax += atomSpacing) {
    // 第1層原子
    drawAtom(ctx, ax, layer1Y, '#38bdf8')
    // 第2層原子
    drawAtom(ctx, ax, layer2Y, '#fbbf24')
  }

  // 2. X線ビームの光路描画
  // 光線1: 第1層の中央原子 A (centerX, layer1Y) で反射
  // 光線2: 第2層の直下原子 B (centerX, layer2Y) で反射
  const rayLen = 220
  const cosT = Math.cos(th)
  const sinT = Math.sin(th)

  // 入射点 A (centerX, layer1Y)
  const in1X = centerX - rayLen * cosT
  const in1Y = layer1Y - rayLen * sinT
  const out1X = centerX + rayLen * cosT
  const out1Y = layer1Y - rayLen * sinT

  // 入射点 B (centerX, layer2Y)
  const in2X = centerX - rayLen * cosT
  const in2Y = layer2Y - rayLen * sinT
  const out2X = centerX + rayLen * cosT
  const out2Y = layer2Y - rayLen * sinT

  // 光線1 (第1層反射)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(in1X, in1Y); ctx.lineTo(centerX, layer1Y); ctx.lineTo(out1X, out1Y)
  ctx.stroke()

  // 光線2 (第2層反射)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(in2X, in2Y); ctx.lineTo(centerX, layer2Y); ctx.lineTo(out2X, out2Y)
  ctx.stroke()

  // 3. 幾何学的光路差の垂線と赤色ハイライト
  // 点Aから光線2への垂線足 P, Q
  // AP: 入射側垂線, AQ: 反射側垂線
  const deltaLen = layerGap * sinT
  const pX = centerX - layerGap * sinT * sinT
  const pY = layer2Y - layerGap * sinT * cosT

  const qX = centerX + layerGap * sinT * sinT
  const qY = layer2Y - layerGap * sinT * cosT

  // 垂線 (点線)
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(centerX, layer1Y); ctx.lineTo(pX, pY)
  ctx.moveTo(centerX, layer1Y); ctx.lineTo(qX, qY)
  ctx.stroke()
  ctx.setLineDash([])

  // 光路差部分 (PB + BQ) を赤線で強力ハイライト
  ctx.save()
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 4
  ctx.shadowColor = '#ef4444'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(pX, pY); ctx.lineTo(centerX, layer2Y); ctx.lineTo(qX, qY)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = '#f87171'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('光路差 = 2 d sinθ', centerX, layer2Y + 32)

  // 入射角 θ の円弧
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(centerX, layer1Y, 35, Math.PI, Math.PI + th, false)
  ctx.stroke()
  ctx.fillStyle = '#bae6fd'
  ctx.font = '11px sans-serif'
  ctx.fillText(`θ = ${glancingAngleDeg.value.toFixed(1)}°`, centerX - 48, layer1Y - 12)

  // 4. 右側: X線強度検出メーター
  const meterX = w - 85
  const meterY = 50
  const meterW = 55
  const meterH = 220

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(meterX, meterY, meterW, meterH)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(meterX, meterY, meterW, meterH)

  // 強度バー (緑〜金色)
  const barH = meterH * reflectionIntensity.value
  const barGrad = ctx.createLinearGradient(0, meterY + meterH, 0, meterY)
  barGrad.addColorStop(0, '#10b981')
  barGrad.addColorStop(1, '#fbbf24')
  ctx.fillStyle = barGrad
  ctx.fillRect(meterX + 8, meterY + meterH - barH, meterW - 16, barH)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('検出強度', meterX + meterW / 2, meterY - 12)
  ctx.fillText(`${(reflectionIntensity.value * 100).toFixed(0)}%`, meterX + meterW / 2, meterY + meterH + 18)

  animId = requestAnimationFrame(draw)
}

function drawAtom(ctx, x, y, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(x, y, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.bragg-status-badge {
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

.bragg-status-badge.matched {
  background: rgba(52, 211, 153, 0.2);
  border-color: #34d399;
  color: #34d399;
}
</style>
