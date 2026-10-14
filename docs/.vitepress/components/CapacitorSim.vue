<template>
  <div class="lab" style="--ac:#3b82f6;--ac2:#10b981">
    <div class="lab-head">
      <span class="lab-title">🔋 平行平板コンデンサーと静電エネルギー 実験室</span>
      <span class="lab-badge">{{ isConnected ? '電源接続中 (電圧 V 一定)' : 'スイッチOFF (電荷 Q 一定・孤立)' }}</span>
    </div>

    <!-- スイッチ切替タブ -->
    <div style="display:flex;gap:6px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': isConnected }" @click="setConnected(true)">
        ⚡ 電源接続中 (V = {{ batteryV }}V 一定)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': !isConnected }" @click="setConnected(false)">
        🔓 スイッチOFF (電荷 Q 保存・孤立)
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>極板間隔 d: <strong>{{ distD_mm.toFixed(1) }} mm</strong></label>
        <input type="range" v-model.number="distD_mm" min="1.0" max="6.0" step="0.2" />
        <div class="lab-note">d を広げると容量 C は減少。{{ isConnected ? 'V一定のため Q が逃げる' : 'Q一定のため V と電場が増加' }}</div>
      </div>

      <div class="lab-ctrl">
        <label>極板の面積 S (幅): <strong>{{ areaS_cm2.toFixed(0) }} cm²</strong></label>
        <input type="range" v-model.number="areaS_cm2" min="50" max="250" step="10" />
      </div>

      <div class="lab-ctrl">
        <label>誘電体の挿入率: <strong>{{ (dielectricRatio * 100).toFixed(0) }}%</strong> (比誘電率 εᵣ = {{ epsR }})</label>
        <input type="range" v-model.number="dielectricRatio" min="0.0" max="1.0" step="0.05" />
        <div class="lab-note">誘電体を差し込むと容量 C が増加</div>
      </div>

      <div class="lab-ctrl" v-if="isConnected">
        <label>電源電圧 V₀: <strong>{{ batteryV }} V</strong></label>
        <input type="range" v-model.number="batteryV" min="10" max="100" step="5" />
      </div>

      <div class="lab-ctrl">
        <label>典型実験プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" @click="presetDisconnectAndPull">① 充電後に極板を引き離す</button>
          <button class="lab-chip" @click="presetInsertDielectric">② 電源つないだまま誘電体挿入</button>
          <button class="lab-chip" @click="resetDefaults">🔄 初期状態</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">電気容量 C</div>
        <div class="v" style="color:#38bdf8">{{ (capC_pF).toFixed(1) }} <small>pF</small></div>
        <div class="f">C = ε · S / d</div>
      </div>

      <div class="lab-stat">
        <div class="k">極板間電圧 V</div>
        <div class="v" style="color:#f59e0b">{{ curVoltage.toFixed(1) }} <small>V</small></div>
        <div class="f">{{ isConnected ? '電源により固定' : 'V = Q / C（変化する！）' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">蓄積電荷 Q</div>
        <div class="v" style="color:#ef4444">{{ curCharge_nC.toFixed(2) }} <small>nC</small></div>
        <div class="f">{{ isConnected ? 'Q = CV（出入りする）' : '孤立のため完全に一定' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">静電エネルギー U</div>
        <div class="v" style="color:#10b981">{{ curEnergy_nJ.toFixed(2) }} <small>nJ</small></div>
        <div class="f">U = ½QV = ½CV² = Q² / (2C)</div>
      </div>

      <div class="lab-stat">
        <div class="k">極板間電場 E</div>
        <div class="v" style="color:#a855f7">{{ (curField_kVm).toFixed(1) }} <small>kV/m</small></div>
        <div class="f">E = V / d = Q / (εS)</div>
      </div>

      <div class="lab-stat">
        <div class="k">極板間の引力 F</div>
        <div class="v" style="color:#ec4899">{{ curForce_uN.toFixed(2) }} <small>μN</small></div>
        <div class="f">F = ½QE（係数 ½ に注意！）</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

// 真空の誘電率 ε0 ≈ 8.854 x 10^-12 F/m
const eps0 = 8.8541878e-12
const epsR = 3.0 // 誘電体の比誘電率

const isConnected = ref(true)
const distD_mm = ref(2.5) // mm
const areaS_cm2 = ref(120) // cm^2
const dielectricRatio = ref(0.0) // 0〜1 (挿入割合)
const batteryV = ref(50) // V

// 孤立時の固定電荷 Q [C]
const isolatedQ = ref(0)

function setConnected(conn) {
  if (!conn && isConnected.value) {
    // スイッチOFFにした瞬間の電荷を固定
    isolatedQ.value = capC_Farad.value * batteryV.value
  }
  isConnected.value = conn
}

function resetDefaults() {
  isConnected.value = true
  distD_mm.value = 2.5
  areaS_cm2.value = 120
  dielectricRatio.value = 0.0
  batteryV.value = 50
}

function presetDisconnectAndPull() {
  resetDefaults()
  setConnected(false) // スイッチOFF
  distD_mm.value = 5.0 // 極板を引き離す（VとUが倍増する！）
}

function presetInsertDielectric() {
  resetDefaults()
  isConnected.value = true
  dielectricRatio.value = 1.0 // 誘電体全挿入（QとUがεr倍に増加！）
}

// 実効誘電率 ε_eff = ε0 * (1 + (epsR - 1) * dielectricRatio)
const effectiveEps = computed(() => {
  return eps0 * (1.0 + (epsR - 1.0) * dielectricRatio.value)
})

// 電気容量 C = ε * S / d [F]
const capC_Farad = computed(() => {
  const d_m = distD_mm.value * 1e-3
  const s_m2 = areaS_cm2.value * 1e-4
  return (effectiveEps.value * s_m2) / d_m
})

const capC_pF = computed(() => capC_Farad.value * 1e12)

// 現在の電荷 Q [C] と電圧 V [V]
const curCharge = computed(() => {
  if (isConnected.value) {
    return capC_Farad.value * batteryV.value
  }
  return isolatedQ.value
})

const curVoltage = computed(() => {
  if (isConnected.value) {
    return batteryV.value
  }
  return curCharge.value / capC_Farad.value
})

const curCharge_nC = computed(() => curCharge.value * 1e9)

// 静電エネルギー U = 1/2 * C * V^2 = 1/2 * Q * V [J]
const curEnergy_J = computed(() => 0.5 * curCharge.value * curVoltage.value)
const curEnergy_nJ = computed(() => curEnergy_J.value * 1e9)

// 電場 E = V / d [V/m] -> kV/m
const curField_Vm = computed(() => {
  const d_m = distD_mm.value * 1e-3
  return curVoltage.value / d_m
})
const curField_kVm = computed(() => curField_Vm.value / 1000)

// 極板間引力 F = 1/2 * Q * E [N] -> μN
const curForce_uN = computed(() => {
  const f = 0.5 * curCharge.value * curField_Vm.value
  return f * 1e6
})

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height }) => {
  clearGrid(ctx, width, height, 40)

  const cx = width * 0.48
  const cy = height * 0.48

  // スケール
  // 極板幅 (areaS_cm2 に連動 50〜250 -> 120px〜280px)
  const plateW = 100 + (areaS_cm2.value / 250) * 180
  const plateH = 12

  // 極板間隔ピクセル (distD_mm に連動 1〜6mm -> 40px〜160px)
  const gapPx = 35 + (distD_mm.value / 6.0) * 125

  const topPlateY = cy - gapPx / 2
  const botPlateY = cy + gapPx / 2

  // 1. 回路配線 & 電源
  drawCircuit(ctx, cx, cy, topPlateY, botPlateY, plateW)

  // 2. 誘電体ブロック（左から挿入）
  if (dielectricRatio.value > 0) {
    drawDielectric(ctx, cx, cy, topPlateY, botPlateY, plateW)
  }

  // 3. 極板間の電気力線
  drawElectricField(ctx, cx, topPlateY, botPlateY, plateW)

  // 4. 上下極板
  drawPlates(ctx, cx, topPlateY, botPlateY, plateW, plateH)

  // 5. 極板間隔 d の寸法線
  line(ctx, cx + plateW / 2 + 25, topPlateY, cx + plateW / 2 + 25, botPlateY, { color: '#38bdf8', width: 1.5 })
  line(ctx, cx + plateW / 2 + 18, topPlateY, cx + plateW / 2 + 32, topPlateY, { color: '#38bdf8', width: 1.5 })
  line(ctx, cx + plateW / 2 + 18, botPlateY, cx + plateW / 2 + 32, botPlateY, { color: '#38bdf8', width: 1.5 })
  text(ctx, `d = ${distD_mm.value.toFixed(1)}mm`, cx + plateW / 2 + 38, cy + 4, { align: 'left', color: '#38bdf8', font: '11px sans-serif' })
})

function drawCircuit(ctx, cx, cy, topY, botY, pw) {
  const wireX = cx - pw / 2 - 40
  ctx.strokeStyle = isConnected.value ? '#38bdf8' : '#64748b'
  ctx.lineWidth = 2.5

  // 上極板からの配線
  ctx.beginPath()
  ctx.moveTo(cx, topY)
  ctx.lineTo(wireX, topY)
  ctx.lineTo(wireX, cy - 25)
  ctx.stroke()

  // 下極板からの配線
  ctx.beginPath()
  ctx.moveTo(cx, botY)
  ctx.lineTo(wireX, botY)
  ctx.lineTo(wireX, cy + 25)
  ctx.stroke()

  // 電源 / スイッチ
  if (isConnected.value) {
    // 直流電源記号（長い棒がプラス、短い太い棒がマイナス）
    line(ctx, wireX - 16, cy - 10, wireX + 16, cy - 10, { color: '#ef4444', width: 3 }) // ＋極
    line(ctx, wireX - 10, cy + 10, wireX + 10, cy + 10, { color: '#38bdf8', width: 4.5 }) // －極
    text(ctx, '+', wireX - 25, cy - 8, { color: '#ef4444', font: 'bold 13px sans-serif' })
    text(ctx, '-', wireX - 25, cy + 12, { color: '#38bdf8', font: 'bold 15px sans-serif' })
    text(ctx, `V₀ = ${batteryV.value}V`, wireX - 32, cy + 32, { align: 'right', color: '#f59e0b', font: 'bold 11px sans-serif' })
  } else {
    // 開いたスイッチ記号
    dot(ctx, wireX, cy - 25, 4, '#64748b')
    dot(ctx, wireX, cy + 25, 4, '#64748b')
    // 跳ね上がったスイッチバー
    line(ctx, wireX, cy + 25, wireX + 18, cy - 10, { color: '#f43f5e', width: 2.5 })
    text(ctx, 'スイッチOFF (孤立)', wireX - 10, cy + 4, { align: 'right', color: '#f43f5e', font: 'bold 11px sans-serif' })
  }
}

function drawDielectric(ctx, cx, cy, topY, botY, pw) {
  const insW = pw * dielectricRatio.value
  const leftX = cx - pw / 2
  const dH = botY - topY - 4

  // 誘電体ブロック（薄緑の透明プラスチック風）
  ctx.fillStyle = 'rgba(16, 185, 129, 0.35)'
  ctx.fillRect(leftX, topY + 2, insW, dH)
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 2
  ctx.strokeRect(leftX, topY + 2, insW, dH)

  if (insW > 40) {
    text(ctx, `誘電体 (εᵣ=${epsR})`, leftX + insW / 2, cy + 4, { color: '#a7f3d0', font: 'bold 11px sans-serif' })
  }
}

function drawElectricField(ctx, cx, topY, botY, pw) {
  // 電場の強さに応じて線の本数と色を変える
  const eVal = curField_kVm.value
  if (eVal < 0.1) return

  const numLines = Math.min(15, Math.max(4, Math.round(eVal * 0.4)))
  const spacing = pw / (numLines + 1)

  for (let i = 1; i <= numLines; i++) {
    const x = cx - pw / 2 + i * spacing
    // 誘電体内部は電場が弱まる（色を薄く）
    const isInsideDielectric = (x < cx - pw / 2 + pw * dielectricRatio.value)
    const color = isInsideDielectric ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.55)'

    arrow(ctx, x, topY + 6, x, botY - 6, { color, width: 1.5, head: 5 })
  }
}

function drawPlates(ctx, cx, topY, botY, pw, ph) {
  const leftX = cx - pw / 2

  // 上極板 (+Q, 赤)
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(leftX, topY - ph, pw, ph)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(leftX, topY - ph, pw, ph)

  // 下極板 (-Q, 青)
  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(leftX, botY, pw, ph)
  ctx.strokeRect(leftX, botY, pw, ph)

  // 電荷サインの描画
  const signCount = Math.min(9, Math.max(3, Math.round(curCharge_nC.value * 2)))
  const signStep = pw / (signCount + 1)

  for (let i = 1; i <= signCount; i++) {
    const sx = leftX + i * signStep
    text(ctx, '+', sx, topY - 3, { color: '#fff', font: 'bold 11px sans-serif' })
    text(ctx, '-', sx, botY + 11, { color: '#000', font: 'bold 13px sans-serif' })
  }

  // 極板ラベル
  text(ctx, `上極板 (+Q = +${curCharge_nC.value.toFixed(2)} nC)`, cx, topY - ph - 8, { color: '#ef4444', font: 'bold 11px sans-serif' })
  text(ctx, `下極板 (-Q = -${curCharge_nC.value.toFixed(2)} nC)`, cx, botY + ph + 18, { color: '#38bdf8', font: 'bold 11px sans-serif' })
}
</script>
