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
      </div>
      <div v-if="mode === 'circular'" class="stat-card highlight">
        <div class="stat-label">中心での磁場 H (半径 5 cm)</div>
        <div class="stat-value text-cyan">{{ (currentI / (2 * 0.05)).toFixed(1) }} <span class="stat-unit">A/m</span></div>
      </div>
      <div v-if="mode === 'solenoid'" class="stat-card highlight">
        <div class="stat-label">内部一様磁場 H (n=500回/m)</div>
        <div class="stat-value text-cyan">{{ (500 * currentI).toFixed(0) }} <span class="stat-unit">A/m</span></div>
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
      * **直線電流**: 親指を電流 $I$ の向きに向けると、残り4本の指が巻きつく向きが**同心円状の磁場 $H = \frac{I}{2\pi r}$** を指します。
      * **円形電流・ソレノイド**: 残り4本の指を電流のループに沿わせると、**親指の指す向きが中心の磁場（$N$極側）**を指します。
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const canvasRef = ref(null)
const mode = ref('straight') // 'straight' | 'circular' | 'solenoid'
const currentI = ref(8) // A
const currentDir = ref(1) // 1: 手前 (dot), -1: 奥 (cross)
const showCompass = ref(true)

function toggleDir() {
  currentDir.value *= -1
}

function drawStraight(ctx, width, height) {
  const cx = width / 2
  const cy = height / 2

  // 同心円状の磁力線
  const dir = currentDir.value
  const radii = [40, 75, 115, 160]

  radii.forEach(r => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
    ctx.lineWidth = 1.8
    ctx.stroke()

    // 矢印マーク (反時計回り dir=1, 時計回り dir=-1)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      const arrowAngle = a + (dir === 1 ? Math.PI / 2 : -Math.PI / 2)
      const ax = cx + r * Math.cos(a)
      const ay = cy + r * Math.sin(a)

      ctx.save()
      ctx.translate(ax, ay)
      ctx.rotate(arrowAngle)
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(6, 0)
      ctx.lineTo(-4, -4)
      ctx.lineTo(-4, 4)
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
    ctx.fillText('⊙ 電流 I (手前向き)', cx - 55, cy - 28)
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
    ctx.fillText('⊗ 電流 I (奥向き)', cx - 50, cy - 28)
  }
}

function drawCircular(ctx, width, height) {
  const cx = width / 2
  const cy = height / 2
  const dir = currentDir.value

  // 円形コイル (楕円透視図)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(cx, cy, 180, 50, 0, 0, Math.PI * 2)
  ctx.stroke()

  // コイル上の電流矢印
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(dir === 1 ? '電流 I (反時計回り)' : '電流 I (時計回り)', cx - 65, cy + 70)

  // 中心を貫く直線的磁力線
  const bDir = dir === 1 ? -1 : 1 // 1: 上向き, -1: 下向き
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3

  for (let offset = -80; offset <= 80; offset += 40) {
    ctx.beginPath()
    ctx.moveTo(cx + offset, cy - 120 * bDir)
    ctx.lineTo(cx + offset, cy + 120 * bDir)
    ctx.stroke()

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
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5

  for (let y = top + 15; y <= top + solH - 15; y += 20) {
    ctx.beginPath()
    ctx.moveTo(left - 40, y)
    ctx.lineTo(left + solW + 40, y)
    ctx.stroke()

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

watch([mode, currentI, currentDir, showCompass], () => {
  render()
})

onMounted(() => {
  render()
})
</script>

<style scoped>
.sim-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
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
  color: var(--vp-c-text-1);
}

.sim-tabs {
  display: flex;
  gap: 6px;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
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
  background: var(--vp-c-bg-mute);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--vp-c-text-2);
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }

.controls-panel {
  margin-top: 16px;
  background: var(--vp-c-bg-mute);
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
  color: var(--vp-c-text-1);
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
  border: none;
}
.sim-btn.secondary:hover {
  background: #475569;
}

.sim-btn.outline {
  background: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.sim-btn.outline:hover {
  background: var(--vp-c-bg-soft);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  background: rgba(30, 41, 59, 0.4);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
</style>
