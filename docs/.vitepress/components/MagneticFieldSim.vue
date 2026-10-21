<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🧲 電流がつくる磁場 & 右ねじの法則シミュレーター</h3>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'straight' }"
          @click="mode = 'straight'"
        >
          直線電流
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'circular' }"
          @click="mode = 'circular'"
        >
          円形電流
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'solenoid' }"
          @click="mode = 'solenoid'"
        >
          ソレノイド
        </button>
      </div>
    </div>

    <!-- メインCanvas -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">電流 I</div>
        <div class="stat-value text-blue">{{ currentI }} <span class="stat-unit">A</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">電流の向き</div>
        <div class="stat-value text-yellow">{{ currentDir === 1 ? '⊙ 手前向き (湧き出し)' : '⊗ 奥向き (吸い込み)' }}</div>
      </div>
      <div v-if="mode === 'straight'" class="stat-card highlight">
        <div class="stat-label">距離 r = 5 cm での磁場 H</div>
        <div class="stat-value text-cyan">{{ (currentI / (2 * Math.PI * 0.05)).toFixed(1) }} <span class="stat-unit">A/m</span></div>
        <div class="stat-formula" style="font-size:0.85rem;color:#94a3b8;margin-top:4px">H = <span class="frac"><span class="num">I</span><span class="den">2πr</span></span></div>
      </div>
      <div v-if="mode === 'circular'" class="stat-card highlight">
        <div class="stat-label">中心での磁場 H (半径 5 cm)</div>
        <div class="stat-value text-cyan">{{ (currentI / (2 * 0.05)).toFixed(1) }} <span class="stat-unit">A/m</span></div>
        <div class="stat-formula" style="font-size:0.85rem;color:#94a3b8;margin-top:4px">H = <span class="frac"><span class="num">I</span><span class="den">2r</span></span></div>
      </div>
      <div v-if="mode === 'solenoid'" class="stat-card highlight">
        <div class="stat-label">内部一様磁場 H (n=500回/m)</div>
        <div class="stat-value text-cyan">{{ (500 * currentI).toFixed(0) }} <span class="stat-unit">A/m</span></div>
        <div class="stat-formula" style="font-size:0.85rem;color:#94a3b8;margin-top:4px">H = nI</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>電流の大きさ I:</span>
            <span class="control-val">{{ currentI }} A</span>
          </label>
          <input type="range" v-model.number="currentI" min="1" max="20" step="1" class="sim-slider" />
        </div>

        <div class="btn-group">
          <button @click="toggleDir" class="sim-btn secondary">
            🔄 電流の向き反転 ({{ currentDir === 1 ? '⊙ → ⊗' : '⊗ → ⊙' }})
          </button>
          <button @click="showCompass = !showCompass" class="sim-btn outline">
            {{ showCompass ? '🧭 コンパス非表示' : '🧭 方位磁針を表示' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>右手の親指と4本指のルール</strong>:
      * <strong>直線電流</strong>: 親指を電流 <i>I</i> の向きに向けると、残り4本の指が巻きつく向きが<strong>同心円状の磁場 <i>H</i> = (<i>I</i> / 2π <i>r</i>)</strong> を指します。
      * <strong>円形電流・ソレノイド</strong>: 残り4本の指を電流のループに沿わせると、<strong>親指の指す向きが中心の磁場（<i>N</i>極側）</strong>を指します。
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const mode = ref('straight') // 'straight' | 'circular' | 'solenoid'
const currentI = ref(8) // A
const currentDir = ref(1) // 1: 手前 (dot), -1: 奥 (cross)
const showCompass = ref(true)
let animPhase = 0
let rafId = null

function toggleDir() {
  currentDir.value *= -1
}

function drawStraight(ctx, width, height) {
  const cx = width / 2
  const cy = height / 2

  // 同心円状の磁力線 (電流Iに応じて太さ・輝度・半径間隔が変化)
  const dir = currentDir.value
  const iRatio = currentI.value / 20
  const radii = [36 + iRatio * 8, 72 + iRatio * 10, 112 + iRatio * 12, 155 + iRatio * 14]

  radii.forEach((r, idx) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 + iRatio * 0.45 - idx * 0.05})`
    ctx.lineWidth = 1.4 + iRatio * 2.2
    ctx.stroke()

    // 回転アニメーションする磁場光点と矢印マーク (反時計回り dir=1, 時計回り dir=-1)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      const rotA = a - dir * animPhase * (1.2 - idx * 0.15)
      const arrowAngle = rotA - dir * (Math.PI / 2)
      const ax = cx + r * Math.cos(rotA)
      const ay = cy + r * Math.sin(rotA)

      ctx.save()
      ctx.translate(ax, ay)
      ctx.rotate(arrowAngle)
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(7, 0)
      ctx.lineTo(-4, -4.5)
      ctx.lineTo(-4, 4.5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  })

  // 方位磁針（コンパス）
  if (showCompass.value) {
    const compassRadii = [60, 100, 140]
    compassRadii.forEach(r => {
      for (let a = Math.PI / 4; a < Math.PI * 2; a += Math.PI / 2) {
        const px = cx + r * Math.cos(a)
        const py = cy + r * Math.sin(a)
        const needleAngle = a + (dir === 1 ? Math.PI / 2 : -Math.PI / 2)

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(needleAngle)

        // N極 (赤)
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.moveTo(12, 0)
        ctx.lineTo(0, -4)
        ctx.lineTo(0, 4)
        ctx.closePath()
        ctx.fill()

        // S極 (青)
        ctx.fillStyle = '#3b82f6'
        ctx.beginPath()
        ctx.moveTo(-12, 0)
        ctx.lineTo(0, -4)
        ctx.lineTo(0, 4)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
      }
    })
  }

  // 中央の導線 (断面)
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(cx, cy, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  if (dir === 1) {
    // ⊙ (手前)
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(`⊙ 電流 I = ${currentI.value}A (手前向き)`, cx - 75, cy - 28)
  } else {
    // ⊗ (奥)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#fbbf24'
    ctx.beginPath()
    ctx.moveTo(cx - 8, cy - 8)
    ctx.lineTo(cx + 8, cy + 8)
    ctx.moveTo(cx + 8, cy - 8)
    ctx.lineTo(cx - 8, cy + 8)
    ctx.stroke()
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(`⊗ 電流 I = ${currentI.value}A (奥向き)`, cx - 70, cy - 28)
  }
}

function drawCircular(ctx, width, height) {
  const cx = width / 2
  const cy = height / 2
  const dir = currentDir.value
  const iRatio = currentI.value / 20

  // 円形コイル (楕円透視図)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3.5 + iRatio * 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, 180, 50, 0, 0, Math.PI * 2)
  ctx.stroke()

  // コイル上を周回する電流粒子アニメーション
  for (let k = 0; k < 6; k++) {
    const th = (k / 6) * Math.PI * 2 - dir * animPhase
    const px = cx + 180 * Math.cos(th)
    const py = cy + 50 * Math.sin(th)
    ctx.fillStyle = '#fef3c7'
    ctx.beginPath()
    ctx.arc(px, py, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // コイル上の電流矢印
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(dir === 1 ? `電流 I = ${currentI.value}A (反時計回り)` : `電流 I = ${currentI.value}A (時計回り)`, cx - 78, cy + 72)

  // 中心を貫く直線的磁力線
  const bDir = dir === 1 ? -1 : 1 // -1: 上向き, 1: 下向き
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2 + iRatio * 2

  for (let offset = -80; offset <= 80; offset += 40) {
    ctx.beginPath()
    ctx.moveTo(cx + offset, cy - 120 * bDir)
    ctx.lineTo(cx + offset, cy + 120 * bDir)
    ctx.stroke()

    // 磁力線上の移動光点
    const flowFrac = (animPhase * 0.5) % 1
    const dotY = (cy - 120 * bDir) + flowFrac * (240 * bDir)
    ctx.fillStyle = '#7dd3fc'
    ctx.beginPath()
    ctx.arc(cx + offset, dotY, 3, 0, Math.PI * 2)
    ctx.fill()

    // 矢印
    const endY = cy + 120 * bDir
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(cx + offset, endY)
    ctx.lineTo(cx + offset - 5, endY - 8 * bDir)
    ctx.lineTo(cx + offset + 5, endY - 8 * bDir)
    ctx.closePath()
    ctx.fill()
  }

  // ループ外側の還流線
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.arc(cx - 180, cy, 60, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + 180, cy, 60, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#22d3ee'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText(dir === 1 ? '↑ 中心磁場 H = I / 2r (上向きN極)' : '↓ 中心磁場 H = I / 2r (下向きN極)', cx - 110, cy - 140 * bDir)
}

function drawSolenoid(ctx, width, height) {
  const cx = width / 2
  const cy = height / 2
  const dir = currentDir.value
  const solW = 320
  const solH = 90
  const left = cx - solW / 2
  const top = cy - solH / 2

  // ソレノイド内部の一様平行磁力線
  const bDir = dir === 1 ? 1 : -1 // 1: 右向き, -1: 左向き
  const iRatio = currentI.value / 20
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.8 + iRatio * 2

  for (let y = top + 15; y <= top + solH - 15; y += 20) {
    ctx.beginPath()
    ctx.moveTo(left - 40, y)
    ctx.lineTo(left + solW + 40, y)
    ctx.stroke()

    // 磁力線上の移動光点
    const f = ((animPhase * 0.4) % 1)
    const dotX = bDir === 1 ? (left - 40) + f * (solW + 80) : (left + solW + 40) - f * (solW + 80)
    ctx.fillStyle = '#7dd3fc'
    ctx.beginPath()
    ctx.arc(dotX, y, 3, 0, Math.PI * 2)
    ctx.fill()

    // 矢印
    const arrowX = bDir === 1 ? left + solW + 40 : left - 40
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(arrowX, y)
    ctx.lineTo(arrowX - 8 * bDir, y - 5)
    ctx.lineTo(arrowX - 8 * bDir, y + 5)
    ctx.closePath()
    ctx.fill()
  }

  // コイルの巻き線 (長方形ループを並べる)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3
  for (let x = left; x <= left + solW; x += 30) {
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x + 15, top + solH)
    ctx.stroke()
  }

  // ソレノイド外枠
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2
  ctx.strokeRect(left, top, solW, solH)

  // 磁極ラベル (N極・S極)
  ctx.font = 'bold 16px sans-serif'
  if (bDir === 1) {
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('S極', left - 40, cy + 6)
    ctx.fillStyle = '#ef4444'
    ctx.fillText('N極', left + solW + 15, cy + 6)
  } else {
    ctx.fillStyle = '#ef4444'
    ctx.fillText('N極', left - 40, cy + 6)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('S極', left + solW + 15, cy + 6)
  }

  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('ソレノイド内部: 均一で強力な平行磁場 H ＝ n I', cx - 140, top - 18)
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (mode.value === 'straight') {
    drawStraight(ctx, canvas.width, canvas.height)
  } else if (mode.value === 'circular') {
    drawCircular(ctx, canvas.width, canvas.height)
  } else {
    drawSolenoid(ctx, canvas.width, canvas.height)
  }
}

function loop() {
  animPhase = (animPhase + 0.025 * (0.4 + currentI.value / 10)) % (Math.PI * 20)
  render()
  rafId = requestAnimationFrame(loop)
}

watch([mode, currentI, currentDir, showCompass], () => {
  render()
})

onMounted(() => {
  loop()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  color: #f8fafc;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.sim-tabs {
  display: flex;
  gap: 6px;
  background: #1e293b;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #334155;
}

.tab-btn {
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #0284c7;
  color: #fff;
}

.canvas-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  background: #0f172a;
  border: 1px solid #1e293b;
}

.sim-canvas {
  display: block;
  width: 100%;
  max-width: 700px;
  height: auto;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }

.controls-panel {
  margin-top: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}

.control-val {
  color: #38bdf8;
  font-family: monospace;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}
.sim-btn.secondary:hover {
  background: #475569;
}

.sim-btn.outline {
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.sim-btn.outline:hover {
  background: #1e293b;
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
</style>
