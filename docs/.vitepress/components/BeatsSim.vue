<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔊</span>
        <h3>うなり（脈動）と音波の合成シミュレーター</h3>
      </div>
      <p class="subtitle">
        振動数のわずかに異なる2つの音波が重なり合うときに生じる音の周期的な強弱（うなり）。
        三角関数の和積公式による包絡線（エンベロープ）の形成と、1秒あたりのうなりの回数 <i>f</i><sub>beat</sub> = |<i>f</i><sub>1</sub> - <i>f</i><sub>2</sub>| をリアルタイム波形描画と実際の音響合成で体感できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="320"></canvas>
      <div class="beat-badge">
        <span>うなりの周期: <strong>{{ (1 / beatFreq).toFixed(2) }} 秒 ({{ beatFreq.toFixed(1) }} 回/秒)</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>音源1の振動数 <i>f</i><sub>1</sub>: <strong>{{ f1 }} Hz</strong></span>
            <input type="range" v-model.number="f1" min="400" max="480" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>音源2の振動数 <i>f</i><sub>2</sub>: <strong>{{ f2 }} Hz</strong></span>
            <input type="range" v-model.number="f2" min="400" max="480" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>波形の表示切り替え:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: showComponents }" @click="showComponents = !showComponents">
                {{ showComponents ? '2音の個別波形を表示中' : '合成波のみ表示' }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>時間軸ズーム:</span>
            <input type="range" v-model.number="timeScale" min="0.5" max="3.0" step="0.1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="toggleSound">
          {{ isAudioActive ? '🔇 うなりの音を停止' : '♪ うなりを聴く (Web Audio 2和音)' }}
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (440Hz / 444Hz)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">うなりの回数 <i>f</i><sub>beat</sub></span>
        <span class="value highlight">{{ beatFreq.toFixed(1) }} <span class="unit">回/秒 (Hz)</span></span>
        <span class="subtext"><i>f</i><sub>beat</sub> = |<i>f</i><sub>1</sub> - <i>f</i><sub>2</sub>|</span>
      </div>

      <div class="stat-card">
        <span class="label">うなりの周期 <i>T</i><sub>beat</sub></span>
        <span class="value">{{ (1 / Math.max(0.1, beatFreq)).toFixed(3) }} <span class="unit">秒</span></span>
        <span class="subtext"><i>T</i><sub>beat</sub> = 1 / |<i>f</i><sub>1</sub> - <i>f</i><sub>2</sub>|</span>
      </div>

      <div class="stat-card">
        <span class="label">搬送波の平均振動数 f̄</span>
        <span class="value">{{ carrierFreq.toFixed(1) }} <span class="unit">Hz</span></span>
        <span class="subtext">f̄ = <i>f</i><sub>1</sub> + <i>f</i><sub>2</sub> / 2</span>
      </div>

      <div class="stat-card">
        <span class="label">干渉の状態</span>
        <span class="value">{{ beatFreq === 0 ? '完全同調（共鳴）' : (beatFreq <= 7 ? '明瞭なうなり' : '急速な脈動・濁り音') }}</span>
        <span class="subtext">調律（チューニング）の原理</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
const f1 = ref(440) // A4 (ラ) = 440 Hz
const f2 = ref(444) // 444 Hz (うなり 4 Hz)
const showComponents = ref(true)
const timeScale = ref(1.0)

const beatFreq = computed(() => Math.abs(f1.value - f2.value))
const carrierFreq = computed(() => (f1.value + f2.value) / 2)

const resetDefaults = () => {
  f1.value = 440
  f2.value = 444
  timeScale.value = 1.0
}

// Web Audio API による2音合成
let audioCtx = null
let osc1 = null
let osc2 = null
let gain1 = null
let gain2 = null
const isAudioActive = ref(false)

function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    gain1 = audioCtx.createGain()
    gain2 = audioCtx.createGain()
    gain1.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain2.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain1.connect(audioCtx.destination)
    gain2.connect(audioCtx.destination)
  } catch (e) {}
}

function updateAudioFreqs() {
  if (audioCtx) {
    if (osc1) osc1.frequency.setTargetAtTime(f1.value, audioCtx.currentTime, 0.04)
    if (osc2) osc2.frequency.setTargetAtTime(f2.value, audioCtx.currentTime, 0.04)
  }
}

function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()

  if (isAudioActive.value) {
    if (osc1) { try { osc1.stop(); osc1.disconnect() } catch (e) {} osc1 = null }
    if (osc2) { try { osc2.stop(); osc2.disconnect() } catch (e) {} osc2 = null }
    isAudioActive.value = false
  } else {
    if (!audioCtx) return
    try {
      osc1 = audioCtx.createOscillator()
      osc2 = audioCtx.createOscillator()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(f1.value, audioCtx.currentTime)
      osc2.frequency.setValueAtTime(f2.value, audioCtx.currentTime)
      osc1.connect(gain1)
      osc2.connect(gain2)
      osc1.start()
      osc2.start()
      isAudioActive.value = true
    } catch (e) {}
  }
}

watch([f1, f2], () => {
  updateAudioFreqs()
})

let animId = null
let tOffset = 0

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

  tOffset += 0.003 * timeScale.value

  const marginX = 40
  const plotW = w - marginX * 2

  // 画面分割:
  // showComponents が true の場合:
  // 上部: f1 と f2 の個別波形 (h: 110)
  // 下部: 合成波 + エンベロープ包絡線 (h: 170)
  const topY = showComponents.value ? 70 : 0
  const mainCenterY = showComponents.value ? 220 : 160
  const mainAmp = showComponents.value ? 55 : 80

  if (showComponents.value) {
    // 上部個別波形の基準線
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(marginX, 45); ctx.lineTo(marginX + plotW, 45)
    ctx.moveTo(marginX, 95); ctx.lineTo(marginX + plotW, 95)
    ctx.stroke()
    ctx.setLineDash([])

    // 音波1 (シアン)
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let px = 0; px <= plotW; px += 2) {
      const t = tOffset + (px / plotW) * (0.04 / timeScale.value)
      const y = 45 - 20 * Math.sin(2 * Math.PI * f1.value * t)
      if (px === 0) ctx.moveTo(marginX + px, y)
      else ctx.lineTo(marginX + px, y)
    }
    ctx.stroke()

    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`音波1 (f₁ = ${f1.value} Hz)`, marginX + 5, 26)

    // 音波2 (アンバー)
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let px = 0; px <= plotW; px += 2) {
      const t = tOffset + (px / plotW) * (0.04 / timeScale.value)
      const y = 95 - 20 * Math.sin(2 * Math.PI * f2.value * t)
      if (px === 0) ctx.moveTo(marginX + px, y)
      else ctx.lineTo(marginX + px, y)
    }
    ctx.stroke()

    ctx.fillStyle = '#fbbf24'
    ctx.fillText(`音波2 (f₂ = ${f2.value} Hz)`, marginX + 5, 78)

    // 区切り線
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(20, 128); ctx.lineTo(w - 20, 128)
    ctx.stroke()
  }

  // 下部: 合成波 y = y1 + y2
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(marginX, mainCenterY)
  ctx.lineTo(marginX + plotW, mainCenterY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`▼ 合成波 y(t) = y₁ + y₂（うなり周期 T = ${(1 / Math.max(0.1, beatFreq.value)).toFixed(2)} 秒）`, marginX, mainCenterY - mainAmp - 12)

  // エンベロープ（包絡線）: 2A cos( 2π (f1 - f2)/2 * t )
  const halfBeat = (f1.value - f2.value) / 2
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'
  ctx.lineWidth = 1.8
  ctx.setLineDash([4, 3])

  // 上包絡線
  ctx.beginPath()
  for (let px = 0; px <= plotW; px += 2) {
    const t = tOffset + (px / plotW) * (0.04 / timeScale.value)
    const env = mainAmp * Math.abs(Math.cos(2 * Math.PI * halfBeat * t))
    const y = mainCenterY - env
    if (px === 0) ctx.moveTo(marginX + px, y)
    else ctx.lineTo(marginX + px, y)
  }
  ctx.stroke()

  // 下包絡線
  ctx.beginPath()
  for (let px = 0; px <= plotW; px += 2) {
    const t = tOffset + (px / plotW) * (0.04 / timeScale.value)
    const env = mainAmp * Math.abs(Math.cos(2 * Math.PI * halfBeat * t))
    const y = mainCenterY + env
    if (px === 0) ctx.moveTo(marginX + px, y)
    else ctx.lineTo(marginX + px, y)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // 合成波描画
  ctx.save()
  ctx.strokeStyle = '#c084fc'
  ctx.lineWidth = 2.2
  ctx.shadowColor = '#c084fc'
  ctx.shadowBlur = 8
  ctx.beginPath()

  for (let px = 0; px <= plotW; px += 2) {
    const t = tOffset + (px / plotW) * (0.04 / timeScale.value)
    const y1 = Math.sin(2 * Math.PI * f1.value * t)
    const y2 = Math.sin(2 * Math.PI * f2.value * t)
    const yTot = (y1 + y2) * 0.5 * mainAmp
    const y = mainCenterY - yTot
    if (px === 0) ctx.moveTo(marginX + px, y)
    else ctx.lineTo(marginX + px, y)
  }
  ctx.stroke()
  ctx.restore()

  // 包絡線の注記
  ctx.fillStyle = '#fca5a5'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('点線: 振幅包絡線 (音の大小周期)', marginX + plotW, mainCenterY + mainAmp + 20)

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (osc1) { try { osc1.stop(); osc1.disconnect() } catch (e) {} }
  if (osc2) { try { osc2.stop(); osc2.disconnect() } catch (e) {} }
  if (audioCtx) { try { audioCtx.close() } catch (e) {} }
})
</script>

<style scoped>
.beat-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(192, 132, 252, 0.5);
  color: #c084fc;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}
</style>
