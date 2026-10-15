<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const waveSourceDist = ref(160) // 波源間隔 d [px]
const wavelength = ref(32) // 波長 lambda [px]
const waveSpeed = ref(1.5) // 波の速さ v
const phaseDiff = ref(0) // 0: 同位相, 1: 逆位相 (π)
const showNodalLines = ref(true) // 節線・腹線の理論双曲線の重ね合わせ
const isPlaying = ref(true)

// マウスプローブ（点P）
const mousePos = ref({ x: 250, y: 150 })
const isHovering = ref(false)

let animationFrameId = null
let time = 0

// キャンバスサイズ
const width = 500
const height = 360

const s1Pos = computed(() => ({
  x: width / 2 - waveSourceDist.value / 2,
  y: height / 2
}))

const s2Pos = computed(() => ({
  x: width / 2 + waveSourceDist.value / 2,
  y: height / 2
}))

// プローブ情報
const probeData = computed(() => {
  const p = mousePos.value
  const d1 = Math.hypot(p.x - s1Pos.value.x, p.y - s1Pos.value.y)
  const d2 = Math.hypot(p.x - s2Pos.value.x, p.y - s2Pos.value.y)
  const diff = Math.abs(d1 - d2)
  const lambda = wavelength.value
  const ratio = diff / lambda
  
  // 同位相の場合：差が整数倍で腹、半奇数倍で節
  // 逆位相の場合：差が半奇数倍で腹、整数倍で節
  let status = ''
  let mVal = Math.round(ratio)
  const frac = Math.abs(ratio - mVal)
  
  if (phaseDiff.value === 0) {
    if (frac < 0.12) {
      status = `完全強め合い (腹 m=${mVal})`
    } else if (Math.abs(frac - 0.5) < 0.12) {
      status = `完全弱め合い (節 m=${Math.floor(ratio)})`
    } else {
      status = '中間干渉'
    }
  } else {
    if (Math.abs(frac - 0.5) < 0.12) {
      status = `完全強め合い (腹 m=${Math.floor(ratio)})`
    } else if (frac < 0.12) {
      status = `完全弱め合い (節 m=${mVal})`
    } else {
      status = '中間干渉'
    }
  }

  return {
    d1: d1.toFixed(1),
    d2: d2.toFixed(1),
    diff: diff.toFixed(1),
    ratio: ratio.toFixed(2),
    status
  }
})

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景クリア
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  const s1 = s1Pos.value
  const s2 = s2Pos.value
  const lambda = wavelength.value
  const k = (2 * Math.PI) / lambda
  const omega = k * waveSpeed.value
  const phi2 = phaseDiff.value === 0 ? 0 : Math.PI

  // 干渉パターンの描画（低解像度グリッドサンプリングによる高速波面描画）
  const step = 4
  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const r1 = Math.hypot(x - s1.x, y - s1.y)
      const r2 = Math.hypot(x - s2.x, y - s2.y)

      // 減衰項 1 / sqrt(r + 20)
      const a1 = 1 / Math.sqrt(r1 + 25)
      const a2 = 1 / Math.sqrt(r2 + 25)

      const y1 = a1 * Math.cos(k * r1 - omega * time)
      const y2 = a2 * Math.cos(k * r2 - omega * time + phi2)
      const totalY = y1 + y2

      // 色マッピング：山（正）はシアン・白、谷（負）はマゼンタ・紫、節（0）は暗い青
      const norm = totalY * 6.5 // スケール調整
      let r = 0, g = 0, b = 0
      if (norm > 0) {
        // 山: Cyan -> White
        const val = Math.min(255, norm * 255)
        r = Math.min(255, val * 0.7)
        g = Math.min(255, val * 0.95 + 20)
        b = Math.min(255, val + 50)
      } else {
        // 谷: Magenta / Deep Indigo
        const val = Math.min(255, -norm * 255)
        r = Math.min(255, val * 0.9 + 20)
        g = Math.min(255, val * 0.3)
        b = Math.min(255, val * 0.8 + 40)
      }

      // ブロック描画
      for (let dy = 0; dy < step; dy++) {
        const py = y + dy
        if (py >= height) break
        for (let dx = 0; dx < step; dx++) {
          const px = x + dx
          if (px >= width) break
          const idx = (py * width + px) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = 255
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 理論的な腹線・節線（双曲線）のオーバーレイ
  if (showNodalLines.value) {
    ctx.lineWidth = 1.5
    const d = waveSourceDist.value
    const maxM = Math.floor(d / lambda)

    // 腹線・節線を描画
    // 双曲線の定義: |r1 - r2| = ΔL
    // x^2 / a^2 - y^2 / b^2 = 1 (波源が x 軸上、原点が中点の場合)
    // 2c = d => c = d / 2.
    // 2a = ΔL => a = ΔL / 2.
    // b^2 = c^2 - a^2
    const c = d / 2

    // 同位相の場合の腹線: ΔL = m * lambda (m=0, 1, 2...)
    // 節線: ΔL = (m + 0.5) * lambda
    // 逆位相の場合は入れ替わる
    for (let m = 0; m <= maxM; m++) {
      // 腹線候補
      const deltaAntinode = (phaseDiff.value === 0 ? m : m + 0.5) * lambda
      if (deltaAntinode < d && deltaAntinode >= 0) {
        drawHyperbola(ctx, c, deltaAntinode, '#38bdf8', m === 0 ? 2 : 1.2, [4, 4])
      }

      // 節線候補
      const deltaNode = (phaseDiff.value === 0 ? m + 0.5 : m) * lambda
      if (deltaNode < d && deltaNode >= 0) {
        drawHyperbola(ctx, c, deltaNode, '#f43f5e', 1.5, [2, 2])
      }
    }
  }

  // 波源 S1, S2 の描画
  ctx.setLineDash([])
  drawSource(ctx, s1.x, s1.y, 'S₁')
  drawSource(ctx, s2.x, s2.y, 'S₂')

  // マウスプローブ（点P）と経路線の描画
  if (isHovering.value) {
    const p = mousePos.value
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(s1.x, s1.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()

    ctx.strokeStyle = '#f43f5e'
    ctx.beginPath()
    ctx.moveTo(s2.x, s2.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.setLineDash([])

    // 点 P
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`P (経路差 Δr=${probeData.value.diff}px)`, p.x + 10, p.y - 8)
  }

  if (isPlaying.value) {
    time += 0.05
  }
  animationFrameId = requestAnimationFrame(draw)
}

function drawSource(ctx, x, y, label) {
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.arc(x, y, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#0284c7'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText(label, x - 9, y - 12)
}

function drawHyperbola(ctx, c, deltaL, color, lineWidth, dash) {
  if (deltaL === 0) {
    // 垂直二等分線
    ctx.save()
    ctx.setLineDash(dash)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
    ctx.restore()
    return
  }

  const a = deltaL / 2
  if (a >= c) return
  const b = Math.sqrt(c * c - a * a)

  ctx.save()
  ctx.setLineDash(dash)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  // 左右2本の双曲線ブランチ
  for (const sign of [-1, 1]) {
    ctx.beginPath()
    let first = true
    for (let py = 0; py <= height; py += 4) {
      const yRel = py - height / 2
      const xRel = sign * a * Math.sqrt(1 + (yRel * yRel) / (b * b))
      const px = width / 2 + xRel
      if (first) {
        ctx.moveTo(px, py)
        first = false
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.stroke()
  }
  ctx.restore()
}

function handleMouseMove(e) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  mousePos.value = {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
  isHovering.value = true
}

function handleMouseLeave() {
  isHovering.value = false
}

function resetSim() {
  waveSourceDist.value = 160
  wavelength.value = 32
  waveSpeed.value = 1.5
  phaseDiff.value = 0
  mousePos.value = { x: 250, y: 150 }
  time = 0
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🌊</span>
        <span>2波源による波の干渉と双曲線縞（腹線・節線シミュレーター）</span>
      </div>
      <div class="badge">水面波・音波・電磁波対応</div>
    </div>

    <div class="canvas-wrapper">
      <canvas
        ref="canvasRef"
        :width="width"
        :height="height"
        class="sim-canvas"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      ></canvas>

      <div class="legend-panel">
        <div class="legend-item"><span class="color-box antinode"></span> 腹線（強め合い: 点線水色）</div>
        <div class="legend-item"><span class="color-box node"></span> 節線（弱め合い: 点線赤色）</div>
        <div class="legend-item"><span class="color-box wave-crest"></span> 山: 明るいシアン</div>
        <div class="legend-item"><span class="color-box wave-trough"></span> 谷: 濃い紫</div>
      </div>
    </div>

    <!-- 観測プローブ情報 -->
    <div class="probe-card" v-if="isHovering">
      <div class="probe-title">🎯 観測プローブ P 点のリアルタイム干渉状態</div>
      <div class="probe-grid">
        <div class="stat-box">
          <span class="label">S₁ からの距離 r₁</span>
          <span class="value">{{ probeData.d1 }} px</span>
        </div>
        <div class="stat-box">
          <span class="label">S₂ からの距離 r₂</span>
          <span class="value">{{ probeData.d2 }} px</span>
        </div>
        <div class="stat-box highlight">
          <span class="label">経路差 |r₁ - r₂|</span>
          <span class="value">{{ probeData.diff }} px ({{ probeData.ratio }} λ)</span>
        </div>
        <div class="stat-box status">
          <span class="label">干渉判定</span>
          <span class="value badge-status">{{ probeData.status }}</span>
        </div>
      </div>
    </div>
    <div class="probe-hint" v-else>
      💡 画面上にマウスを合わせると、任意の位置 <i>P</i> での距離・経路差・干渉条件（腹/節）を即座に計算・検証できます。
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>波源間隔 <i>d</i>: <span>{{ waveSourceDist }} px</span></label>
          <input type="range" v-model.number="waveSourceDist" min="80" max="260" step="10" />
        </div>
        <div class="control-group">
          <label>波長 λ: <span>{{ wavelength }} px</span></label>
          <input type="range" v-model.number="wavelength" min="20" max="60" step="2" />
        </div>
        <div class="control-group">
          <label>波の速さ <i>v</i>: <span>{{ waveSpeed.toFixed(1) }}</span></label>
          <input type="range" v-model.number="waveSpeed" min="0.5" max="3.0" step="0.1" />
        </div>
      </div>

      <div class="control-buttons">
        <div class="phase-toggle">
          <span class="toggle-label">波源の位相:</span>
          <button
            class="mode-btn"
            :class="{ active: phaseDiff === 0 }"
            @click="phaseDiff = 0"
          >
            同位相 (差 0)
          </button>
          <button
            class="mode-btn"
            :class="{ active: phaseDiff === 1 }"
            @click="phaseDiff = 1"
          >
            逆位相 (差 π)
          </button>
        </div>

        <div class="action-buttons">
          <button class="btn btn-secondary" @click="showNodalLines = !showNodalLines">
            {{ showNodalLines ? '双曲線を隠す' : '腹線・節線を表示' }}
          </button>
          <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
            {{ isPlaying ? '一時停止' : '再生' }}
          </button>
          <button class="btn btn-reset" @click="resetSim">リセット</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #0b1120 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sim-canvas {
  width: 100%;
  max-width: 500px;
  height: auto;
  aspect-ratio: 500 / 360;
  cursor: crosshair;
  display: block;
}

.legend-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.color-box {
  width: 14px;
  height: 4px;
  border-radius: 2px;
}
.color-box.antinode {
  background: #38bdf8;
  border: 1px dashed #ffffff;
}
.color-box.node {
  background: #f43f5e;
  border: 1px dashed #ffffff;
}
.color-box.wave-crest {
  background: #06b6d4;
  height: 8px;
}
.color-box.wave-trough {
  background: #9333ea;
  height: 8px;
}

.probe-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.75rem;
}

.probe-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #38bdf8;
  margin-bottom: 0.5rem;
}

.probe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(105px, 1fr));
  gap: 0.5rem;
}

.stat-box {
  background: rgba(30, 41, 59, 0.5);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.stat-box.highlight {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.stat-box .label {
  font-size: 0.7rem;
  color: #94a3b8;
}

.stat-box .value {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.88rem;
  color: #f1f5f9;
}

.badge-status {
  color: #38bdf8 !important;
  font-size: 0.78rem !important;
}

.probe-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: center;
  padding: 0.6rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  margin-top: 0.75rem;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.phase-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.toggle-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.mode-btn {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
}

.btn {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
