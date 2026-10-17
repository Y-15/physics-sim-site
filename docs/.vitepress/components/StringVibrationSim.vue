<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎸</span>
        <h3>弦の振動と定常波（メルデの実験）シミュレーター</h3>
      </div>
      <p class="subtitle">
        両端を固定した弦を伝わる横波の重ね合わせ。弦の張力 <i>S</i>、線密度 ρ、弦の長さ <i>L</i> による波の速さ v = sqrt{S/ρ} と、
        基本振動・倍振動（n=1, 2, 3, \dots）の定常波の腹・節、固有振動数 <i>f</i><sub>n</sub> = n / 2Lsqrt{S / ρ} をリアルタイム体感できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="300"></canvas>
      <div class="mode-badge">
        <span>固有モード: <strong>{{ harmonicMode }}倍振動 (n = {{ harmonicMode }})</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>振動モード <i>n</i>（倍振動数）:</span>
            <div class="btn-group">
              <button
                v-for="m in [1, 2, 3, 4, 5]"
                :key="m"
                class="select-btn"
                :class="{ active: harmonicMode === m }"
                @click="harmonicMode = m"
              >
                n={{ m }} {{ m === 1 ? '(基本)' : `(${m}倍)` }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>弦の張力 <i>S</i>: <strong>{{ tensionN.toFixed(1) }} N</strong></span>
            <input type="range" v-model.number="tensionN" min="20" max="200" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>弦の長さ <i>L</i>: <strong>{{ lengthM.toFixed(2) }} m</strong></span>
            <input type="range" v-model.number="lengthM" min="0.4" max="1.5" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>弦の線密度 ρ: <strong>{{ (linearDensityGpm).toFixed(1) }} g/m</strong></span>
            <input type="range" v-model.number="linearDensityGpm" min="0.5" max="8.0" step="0.5" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="toggleSound">
          {{ isPlayingSound ? '🔇 音を止める' : '♪ 固有音を聴く (Web Audio)' }}
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">固有振動数 <i>f</i><sub>n</sub></span>
        <span class="value highlight">{{ frequencyHz.toFixed(1) }} <span class="unit">Hz</span></span>
        <span class="subtext"><i>f</i><sub>n</sub> = n / 2L v</span>
      </div>

      <div class="stat-card">
        <span class="label">弦を伝わる波の速さ <i>v</i></span>
        <span class="value">{{ waveSpeedMs.toFixed(1) }} <span class="unit">m/s</span></span>
        <span class="subtext">v = sqrt{S / ρ}</span>
      </div>

      <div class="stat-card">
        <span class="label">定常波の波長 <i>λ</i><sub>n</sub></span>
        <span class="value">{{ wavelengthM.toFixed(3) }} <span class="unit">m</span></span>
        <span class="subtext"><i>λ</i><sub>n</sub> = 2L / n</span>
      </div>

      <div class="stat-card">
        <span class="label">腹の数 / 節の数</span>
        <span class="value">{{ harmonicMode }} <span class="unit">個 (腹)</span> / {{ harmonicMode + 1 }} <span class="unit">個 (節)</span></span>
        <span class="subtext">両端は常に固定端（節）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const harmonicMode = ref(2)      // n = 2
const tensionN = ref(80)         // S = 80 N
const lengthM = ref(0.8)         // L = 0.8 m
const linearDensityGpm = ref(2.0)// ρ = 2.0 g/m = 0.002 kg/m

// 物理計算
// rho (kg/m) = linearDensityGpm * 1e-3
// v = sqrt(S / rho)
const waveSpeedMs = computed(() => {
  const rho = linearDensityGpm.value * 1e-3
  return Math.sqrt(tensionN.value / rho)
})

// lambda_n = 2L / n
const wavelengthM = computed(() => {
  return (2 * lengthM.value) / harmonicMode.value
})

// f_n = v / lambda_n = (n / 2L) * v
const frequencyHz = computed(() => {
  return waveSpeedMs.value / wavelengthM.value
})

const resetDefaults = () => {
  harmonicMode.value = 2
  tensionN.value = 80
  lengthM.value = 0.8
  linearDensityGpm.value = 2.0
}

// Web Audio API サウンド合成
let audioCtx = null
let osc = null
let gainNode = null
const isPlayingSound = ref(false)

function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    gainNode = audioCtx.createGain()
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gainNode.connect(audioCtx.destination)
  } catch (e) {}
}

function updateSoundFreq() {
  if (osc && audioCtx) {
    const targetFreq = Math.min(2000, Math.max(50, frequencyHz.value))
    osc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.05)
  }
}

function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()

  if (isPlayingSound.value) {
    if (osc) {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {}
      osc = null
    }
    isPlayingSound.value = false
  } else {
    if (!audioCtx) return
    try {
      osc = audioCtx.createOscillator()
      osc.type = 'triangle' // 弦楽器に近い三角形波
      const targetFreq = Math.min(2000, Math.max(50, frequencyHz.value))
      osc.frequency.setValueAtTime(targetFreq, audioCtx.currentTime)
      osc.connect(gainNode)
      osc.start()
      isPlayingSound.value = true
    } catch (e) {}
  }
}

watch(frequencyHz, () => {
  updateSoundFreq()
})

let animId = null
let simTime = 0

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

  simTime += 0.035

  const leftX = 70
  const rightX = w - 70
  const stringW = rightX - leftX
  const centerY = h / 2

  // 固定端の支持台（左右）
  ctx.fillStyle = '#334155'
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  // 左固定台
  ctx.fillRect(leftX - 25, centerY - 45, 25, 90)
  ctx.strokeRect(leftX - 25, centerY - 45, 25, 90)
  // 右固定台
  ctx.fillRect(rightX, centerY - 45, 25, 90)
  ctx.strokeRect(rightX, centerY - 45, 25, 90)

  // 基準中心線（点線）
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(leftX, centerY)
  ctx.lineTo(rightX, centerY)
  ctx.stroke()
  ctx.setLineDash([])

  const n = harmonicMode.value
  const amp = 55 // 最大振幅 px
  // 角振動数（画面上の描画速度にスケーリング）
  const omega = 4.2
  const timeFactor = Math.cos(omega * simTime)

  // 定常波のエンベロープ（包絡線）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let px = 0; px <= stringW; px += 2) {
    const xRatio = px / stringW
    const envY = centerY - amp * Math.sin(n * Math.PI * xRatio)
    if (px === 0) ctx.moveTo(leftX + px, envY)
    else ctx.lineTo(leftX + px, envY)
  }
  ctx.stroke()

  ctx.beginPath()
  for (let px = 0; px <= stringW; px += 2) {
    const xRatio = px / stringW
    const envY = centerY + amp * Math.sin(n * Math.PI * xRatio)
    if (px === 0) ctx.moveTo(leftX + px, envY)
    else ctx.lineTo(leftX + px, envY)
  }
  ctx.stroke()

  // リアルタイム弦の変位描画
  ctx.save()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3.5
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  ctx.beginPath()

  for (let px = 0; px <= stringW; px += 2) {
    const xRatio = px / stringW
    // 定常波の式: y(x, t) = 2A sin(n π x / L) cos(ω t)
    const y = centerY - amp * Math.sin(n * Math.PI * xRatio) * timeFactor
    if (px === 0) ctx.moveTo(leftX + px, y)
    else ctx.lineTo(leftX + px, y)
  }
  ctx.stroke()
  ctx.restore()

  // 節（Node）と腹（Antinode）のマーカー表示
  // 節の位置: x = k * (L / n), k = 0, 1, ..., n
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'

  for (let k = 0; k <= n; k++) {
    const nodeX = leftX + (k / n) * stringW
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(nodeX, centerY, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fca5a5'
    ctx.fillText('節 (N)', nodeX, centerY + 24)
  }

  // 腹の位置: x = (k + 0.5) * (L / n), k = 0, ..., n-1
  for (let k = 0; k < n; k++) {
    const antinodeX = leftX + ((k + 0.5) / n) * stringW
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(antinodeX, centerY, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fef08a'
    ctx.fillText('腹 (A)', antinodeX, centerY - 24)
  }

  // 弦の長さインジケーター
  const rulerY = centerY + 70
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(leftX, rulerY); ctx.lineTo(rightX, rulerY)
  ctx.moveTo(leftX, rulerY - 6); ctx.lineTo(leftX, rulerY + 6)
  ctx.moveTo(rightX, rulerY - 6); ctx.lineTo(rightX, rulerY + 6)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px sans-serif'
  ctx.fillText(`弦の全長 L = ${lengthM.value.toFixed(2)} m (半波長 λ/2 が ${n} 個)`, (leftX + rightX) / 2, rulerY + 18)

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (osc) {
    try { osc.stop(); osc.disconnect() } catch (e) {}
  }
  if (audioCtx) {
    try { audioCtx.close() } catch (e) {}
  }
})
</script>

<style scoped>
.mode-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #38bdf8;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}
</style>
