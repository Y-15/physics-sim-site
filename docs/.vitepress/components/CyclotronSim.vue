<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const magneticField = ref(1.0) // 磁束密度 B [T]
const voltage = ref(50) // 加速電圧 V [kV]
const deeRadius = ref(140) // ディー半径 R [px]
const particleType = ref('proton') // 'proton' or 'alpha'
const isPlaying = ref(true)

// 粒子定数
const particles = {
  proton: { name: '陽子 (p⁺)', q: 1, m: 1, color: '#38bdf8' },
  alpha: { name: 'α粒子 (⁴He²⁺)', q: 2, m: 4, color: '#f43f5e' }
}

// シミュレーション状態
let animationFrameId = null
const state = ref({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0.8,
  speed: 0.8,
  turns: 0,
  energyKev: 0,
  gapCrossingCount: 0,
  trail: [],
  gapEFieldDirection: 1, // 1: 上向き/右向き, -1: 反対
  isEmitted: false
})

const width = 500
const height = 400
const centerX = width / 2
const centerY = height / 2
const gapWidth = 14 // 電極間隙間 [px]

// サイクロトロン周波数・周期の計算
const cyclotronPeriod = computed(() => {
  const p = particles[particleType.value]
  // T = 2 * pi * m / (q * B)
  return (2 * Math.PI * p.m) / (p.q * magneticField.value)
})

const maxEnergy = computed(() => {
  const p = particles[particleType.value]
  // E_max = q^2 B^2 R^2 / (2m)
  const B = magneticField.value
  const R = deeRadius.value / 100 // スケール m 相当
  const E = (p.q * p.q * B * B * R * R) / (2 * p.m)
  return (E * 250).toFixed(1) // MeV 相当の表示換算
})

function resetSim() {
  state.value = {
    x: centerX,
    y: centerY - 2,
    vx: 0.5,
    vy: 0,
    speed: 0.5,
    turns: 0,
    energyKev: 0,
    gapCrossingCount: 0,
    trail: [{ x: centerX, y: centerY - 2 }],
    gapEFieldDirection: 1,
    isEmitted: false
  }
}

function updatePhysics() {
  if (state.value.isEmitted || !isPlaying.value) return

  const p = particles[particleType.value]
  const B = magneticField.value
  const V = voltage.value
  const R = deeRadius.value

  const s = state.value
  const dt = 0.5

  // 現在の位置（原点からの距離）
  const distFromCenter = Math.hypot(s.x - centerX, s.y - centerY)

  if (distFromCenter >= R) {
    s.isEmitted = true
    return
  }

  // ギャップ内判定 (xが [-gapWidth/2, gapWidth/2] の範囲)
  const inGap = Math.abs(s.x - centerX) <= gapWidth / 2

  if (inGap) {
    // 交流電場による加速
    // 進行方向に向かって電場を同調させる (理想的な高周波同期)
    const accelDirection = s.vx >= 0 ? 1 : -1
    s.gapEFieldDirection = accelDirection
    
    // 電場による力 F = qE
    const accel = (accelDirection * (p.q * V * 0.003)) / p.m
    s.vx += accel * dt
    s.x += s.vx * dt
    s.y += s.vy * dt

    // 運動エネルギー更新
    s.energyKev += Math.abs(p.q * V * 0.08)
    s.gapCrossingCount++
  } else {
    // 電極内部：ローレンツ力 F = q(v x B) のみ
    // v x B = (vx, vy, 0) x (0, 0, B) = (vy*B, -vx*B, 0)
    // a = (q/m) * (vy*B, -vx*B)
    const qOverM = (p.q / p.m) * B * 0.04
    const ax = s.vy * qOverM
    const ay = -s.vx * qOverM

    s.vx += ax * dt
    s.vy += ay * dt
    s.x += s.vx * dt
    s.y += s.vy * dt
  }

  s.speed = Math.hypot(s.vx, s.vy)

  // 軌跡の追加
  s.trail.push({ x: s.x, y: s.y })
  if (s.trail.length > 1200) {
    s.trail.shift()
  }

  s.turns = Math.floor(s.gapCrossingCount / 2)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  const R = deeRadius.value
  const g = gapWidth / 2

  // 1. 磁場マーク（画面手前向き ⊙ をグリッド描画）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'
  for (let x = 40; x < width; x += 45) {
    for (let y = 40; y < height; y += 45) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 2. D字電極（左ディー D1、右ディー D2）
  // 左ディー (D1)
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX - g, centerY, R, Math.PI * 0.5, Math.PI * 1.5)
  ctx.lineTo(centerX - g, centerY + R)
  ctx.closePath()
  ctx.fillStyle = 'rgba(30, 41, 59, 0.75)'
  ctx.fill()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.restore()

  // 右ディー (D2)
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX + g, centerY, R, -Math.PI * 0.5, Math.PI * 0.5)
  ctx.lineTo(centerX + g, centerY - R)
  ctx.closePath()
  ctx.fillStyle = 'rgba(30, 41, 59, 0.75)'
  ctx.fill()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.restore()

  // 電極ラベル
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('D₁ (ディー1)', centerX - R * 0.7, centerY - R * 0.6)
  ctx.fillText('D₂ (ディー2)', centerX + R * 0.35, centerY - R * 0.6)

  // 3. ギャップ間の電場矢印
  const eDir = state.value.gapEFieldDirection
  ctx.strokeStyle = eDir > 0 ? '#fbbf24' : '#f59e0b'
  ctx.fillStyle = eDir > 0 ? '#fbbf24' : '#f59e0b'
  ctx.lineWidth = 1.5
  for (let y = centerY - R + 20; y < centerY + R - 15; y += 28) {
    ctx.beginPath()
    const fromX = eDir > 0 ? centerX - g + 2 : centerX + g - 2
    const toX = eDir > 0 ? centerX + g - 2 : centerX - g + 2
    ctx.moveTo(fromX, y)
    ctx.lineTo(toX, y)
    ctx.stroke()

    // 矢印ヘッド
    ctx.beginPath()
    const headX = toX
    ctx.moveTo(headX, y)
    ctx.lineTo(headX - (eDir > 0 ? 4 : -4), y - 3)
    ctx.lineTo(headX - (eDir > 0 ? 4 : -4), y + 3)
    ctx.fill()
  }

  // 4. 荷電粒子の軌跡（スパイラル）
  const s = state.value
  const p = particles[particleType.value]
  if (s.trail.length > 1) {
    ctx.beginPath()
    ctx.moveTo(s.trail[0].x, s.trail[0].y)
    for (let i = 1; i < s.trail.length; i++) {
      ctx.lineTo(s.trail[i].x, s.trail[i].y)
    }
    ctx.strokeStyle = p.color
    ctx.lineWidth = 1.8
    ctx.stroke()
  }

  // 5. 荷電粒子本体
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(s.x, s.y, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  // ビーム取り出し口表示
  if (s.isEmitted) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText('⚡ 高エネルギー粒子ビーム取り出し (Beam Extracted)', centerX - 120, height - 15)
  }

  if (isPlaying.value) {
    updatePhysics()
  }
  animationFrameId = requestAnimationFrame(draw)
}

function handleParticleChange(type) {
  particleType.value = type
  resetSim()
}

onMounted(() => {
  resetSim()
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
        <span class="icon">⚡</span>
        <span>サイクロトロン粒子加速器シミュレーター</span>
      </div>
      <div class="badge">ローレンツ力 × 高周波交流電場</div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="overlay-stats">
        <div class="stat-item">
          <span class="label">粒子:</span>
          <span class="val" :style="{ color: particles[particleType].color }">
            {{ particles[particleType].name }}
          </span>
        </div>
        <div class="stat-item">
          <span class="label">現在周回数:</span>
          <span class="val">{{ state.turns }} 周</span>
        </div>
        <div class="stat-item">
          <span class="label">到達エネルギー:</span>
          <span class="val highlight">{{ (state.energyKev / 10).toFixed(1) }} keV</span>
        </div>
        <div class="stat-item">
          <span class="label">最大脱出エネルギー:</span>
          <span class="val">{{ maxEnergy }} MeV</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>磁束密度 <i>B</i>: <span>{{ magneticField.toFixed(2) }} T</span></label>
          <input type="range" v-model.number="magneticField" min="0.4" max="2.0" step="0.1" @input="resetSim" />
        </div>
        <div class="control-group">
          <label>加速電圧 <i>V</i>: <span>{{ voltage }} kV</span></label>
          <input type="range" v-model.number="voltage" min="20" max="100" step="5" @input="resetSim" />
        </div>
        <div class="control-group">
          <label>ディー半径 <i>R</i>: <span>{{ deeRadius }} px</span></label>
          <input type="range" v-model.number="deeRadius" min="100" max="180" step="5" @input="resetSim" />
        </div>
      </div>

      <div class="control-buttons">
        <div class="particle-toggle">
          <span class="toggle-label">加速核種:</span>
          <button
            class="mode-btn"
            :class="{ active: particleType === 'proton' }"
            @click="handleParticleChange('proton')"
          >
            陽子 p⁺
          </button>
          <button
            class="mode-btn"
            :class="{ active: particleType === 'alpha' }"
            @click="handleParticleChange('alpha')"
          >
            α粒子 ⁴He²⁺
          </button>
        </div>

        <div class="action-buttons">
          <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
            {{ isPlaying ? '一時停止' : '再開' }}
          </button>
          <button class="btn btn-reset" @click="resetSim">最初から加速</button>
        </div>
      </div>
    </div>

    <div class="cyclotron-note">
      💡 <strong>等時性の驚異</strong>：電極内での円運動周期 <i>T</i> = (2π <i>m</i> / qB) は速度 <i>v</i> に依存しません。速くなるほど半径 <i>r</i> = (mv / qB) が比例して広がるため、半周する時間は常に一定です。これにより、一定周波数の交流電源で完璧に同期加速できます。
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
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
  aspect-ratio: 500 / 400;
  display: block;
}

.overlay-stats {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.stat-item .label {
  color: #94a3b8;
}

.stat-item .val {
  font-family: monospace;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-item .val.highlight {
  color: #fbbf24;
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

.particle-toggle {
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

.cyclotron-note {
  margin-top: 0.85rem;
  padding: 0.6rem 0.8rem;
  background: rgba(30, 41, 59, 0.4);
  border-left: 3px solid #38bdf8;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
}
.cyclotron-note strong {
  color: #38bdf8;
}
</style>
