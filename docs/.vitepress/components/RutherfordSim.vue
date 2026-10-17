<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚛️</span>
        <h3>ラザフォード散乱実験（原子核の発見）シミュレーター</h3>
      </div>
      <p class="subtitle">
        1911年にラザフォードが「原子核（Nucleus）」を発見した歴史的実験。
        薄い金箔（原子番号 Z=79）に向けて照射された高速 α 粒子が、クーロン反発力 F = 1 / 4<i>πε</i><sub>02Ze</sub>^2 / r<sup>2</sup>により描く双曲線軌道と、散乱角の角度分布N(θ) ∝ 1 / sin<sup>4</sup>(θ/2) をリアルタイム追跡します。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="340"></canvas>
      <div class="scatter-badge">
        <span>最大後方散乱粒子数: <strong>{{ backscatterCount }} 個 (θ > 90°)</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>標的原子核の原子番号 <i>Z</i>: <strong>{{ targetName }} (Z = {{ targetZ }})</strong></span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: targetZ === 79 }" @click="targetZ = 79">金 Au (Z=79)</button>
              <button class="select-btn" :class="{ active: targetZ === 47 }" @click="targetZ = 47">銀 Ag (Z=47)</button>
              <button class="select-btn" :class="{ active: targetZ === 13 }" @click="targetZ = 13">アルミニウム Al (Z=13)</button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>α 粒子の運動エネルギー <i>E</i><sub>k</sub>: <strong>{{ energyMeV.toFixed(1) }} MeV</strong></span>
            <input type="range" v-model.number="energyMeV" min="3.0" max="9.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>ビーム照射モード:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: isContinuousBeam }" @click="isContinuousBeam = true">
                連続ビーム照射
              </button>
              <button class="select-btn" :class="{ active: !isContinuousBeam }" @click="fireSingleParticle">
                単一粒子発射
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>散乱軌跡のクリア:</span>
            <div class="button-row">
              <button class="select-btn highlight-btn" @click="clearTrails">
                🧹 散乱軌跡と検出器データをリセット
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (金箔 / 5.0 MeV)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">正面衝突時の最接近距離 <i>r</i><sub>min</sub></span>
        <span class="value highlight">{{ closestDistanceFm.toFixed(1) }} <span class="unit">fm</span></span>
        <span class="subtext"><i>r</i><sub>min</sub> = 1 / 4<i>πε</i><sub>02Ze</sub>^2 / <i>E</i><sub>k</sub> (1 fm = 10⁻¹⁵ m)</span>
      </div>

      <div class="stat-card">
        <span class="label">原子核の推定サイズ</span>
        <span class="value">&lt; {{ closestDistanceFm.toFixed(0) }} <span class="unit">fm</span></span>
        <span class="subtext">原子全体 (10<sup>5</sup>,fm) の約10万分の1</span>
      </div>

      <div class="stat-card">
        <span class="label">総発射 α 粒子数</span>
        <span class="value">{{ totalFiredCount }} <span class="unit">個</span></span>
        <span class="subtext">直進通過率: {{ straightThroughPct.toFixed(1) }}%</span>
      </div>

      <div class="stat-card">
        <span class="label">ラザフォード散乱公式</span>
        <span class="value">N(θ) ∝ 1 / sin<sup>4</sup>(θ/2)</span>
        <span class="subtext">点電荷クーロン反発の証拠</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const targetZ = ref(79)       // 金 (Z = 79)
const energyMeV = ref(5.0)    // 5.0 MeV
const isContinuousBeam = ref(true)

const targetName = computed(() => {
  if (targetZ.value === 79) return '金 Au'
  if (targetZ.value === 47) return '銀 Ag'
  return 'アルミニウム Al'
})

// 正面衝突時の最接近距離 r_min = (1 / 4pi eps0) * (2 * Z * e^2) / E_k
// (1 / 4pi eps0) * e^2 = 1.44 MeV·fm
// r_min = 2 * Z * 1.44 / E_k (fm)
const closestDistanceFm = computed(() => {
  return (2 * targetZ.value * 1.44) / energyMeV.value
})

const backscatterCount = ref(0)
const totalFiredCount = ref(0)
const straightThroughCount = ref(0)

const straightThroughPct = computed(() => {
  if (totalFiredCount.value === 0) return 99.8
  return (straightThroughCount.value / totalFiredCount.value) * 100
})

function clearTrails() {
  particles.length = 0
  detectorHits.fill(0)
  backscatterCount.value = 0
  totalFiredCount.value = 0
  straightThroughCount.value = 0
}

function resetDefaults() {
  targetZ.value = 79
  energyMeV.value = 5.0
  isContinuousBeam.value = true
  clearTrails()
}

// 粒子配列
const particles = []
const detectorHits = new Array(36).fill(0) // 10度刻みの検出器ヒストグラム

function spawnParticle(forcedB = null) {
  totalFiredCount.value++
  // 衝突パラメータ b: 金箔原子核の近く(-100 ~ 100 px)にランダム分散
  // 中心付近ほど散乱角が大きくなる
  const b = forcedB !== null ? forcedB : (Math.random() - 0.5) * 180
  const v0 = Math.sqrt(energyMeV.value) * 3.5

  particles.push({
    x: 40,
    y: 170 + b,
    vx: v0,
    vy: 0,
    trail: [],
    b: b,
    alive: true
  })
}

function fireSingleParticle() {
  // 芯に近い粒子を発射して劇的な散乱を見せる
  spawnParticle((Math.random() - 0.5) * 25)
}

let animId = null
let frameCount = 0

function updatePhysics() {
  frameCount++
  if (isContinuousBeam.value && frameCount % 3 === 0) {
    spawnParticle()
  }

  const nucleusX = 360
  const nucleusY = 170
  // クーロン反発力定数 k = (2 * Z * e^2) / (4pi eps0 m)
  const kCoulomb = targetZ.value * 180

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    if (!p.alive) continue

    const dx = p.x - nucleusX
    const dy = p.y - nucleusY
    const distSq = dx * dx + dy * dy
    const dist = Math.sqrt(distSq)

    // クーロン反発力 F = k / r^2
    const minD = Math.max(12, dist)
    const force = kCoulomb / (minD * minD)
    const ax = force * (dx / dist)
    const ay = force * (dy / dist)

    p.vx += ax * 0.05
    p.vy += ay * 0.05
    p.x += p.vx
    p.y += p.vy

    p.trail.push({ x: p.x, y: p.y })
    if (p.trail.length > 50) p.trail.shift()

    // 画面外または検出器到達
    if (p.x < 10 || p.x > 710 || p.y < 10 || p.y > 330) {
      p.alive = false
      // 散乱角 θ の計算 (初期方向 x軸正に対する角度)
      const angleRad = Math.atan2(p.vy, p.vx)
      let angleDeg = Math.abs(angleRad * (180 / Math.PI))
      if (angleDeg > 180) angleDeg = 360 - angleDeg

      // 検出器に記録
      const bin = Math.min(35, Math.floor(angleDeg / 5))
      detectorHits[bin]++

      if (angleDeg > 90) {
        backscatterCount.value++
      }
      if (angleDeg < 5) {
        straightThroughCount.value++
      }
    }
  }

  // 生存粒子のみ保持 (最大60個)
  if (particles.length > 60) {
    particles.splice(0, particles.length - 60)
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#060913')
  bg.addColorStop(1, '#0e1628')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  updatePhysics()

  const nucleusX = 360
  const nucleusY = 170

  // 1. 周囲の円形蛍光検出スクリーン（硫化亜鉛 ZnS スクリーン）
  ctx.save()
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(nucleusX, nucleusY, 150, -Math.PI * 0.85, Math.PI * 0.85, false)
  ctx.stroke()

  ctx.fillStyle = 'rgba(52, 211, 153, 0.8)'
  ctx.font = '10px sans-serif'
  ctx.fillText('ZnS 蛍光スクリーン', nucleusX + 90, nucleusY - 120)
  ctx.fillText('90°', nucleusX + 10, nucleusY - 158)
  ctx.fillText('180° (後方散乱)', nucleusX - 185, nucleusY + 4)
  ctx.restore()

  // 2. 標的原子核（金箔核）の描画
  ctx.save()
  // クーロン電場ポテンシャルハロー
  const coreGrad = ctx.createRadialGradient(nucleusX, nucleusY, 2, nucleusX, nucleusY, 40)
  coreGrad.addColorStop(0, '#ffffff')
  coreGrad.addColorStop(0.25, '#fbbf24')
  coreGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.25)')
  coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(nucleusX, nucleusY, 40, 0, Math.PI * 2)
  ctx.fill()

  // 原子核本体（正電荷 +Ze）
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(nucleusX, nucleusY, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`+${targetZ.value}e`, nucleusX, nucleusY + 22)
  ctx.fillText(`${targetName.value} 原子核`, nucleusX, nucleusY + 36)
  ctx.restore()

  // 3. α粒子の軌道と現在位置の描画
  particles.forEach(p => {
    // 軌跡 (トレイル)
    if (p.trail.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      p.trail.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
      ctx.stroke()
    }

    // 粒子本体 (α線 = 4He^2+)
    if (p.alive) {
      ctx.save()
      ctx.fillStyle = '#38bdf8'
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  })

  // 4. α線照射ガン（左側）
  ctx.fillStyle = '#334155'
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.fillRect(10, nucleusY - 45, 25, 90)
  ctx.strokeRect(10, nucleusY - 45, 25, 90)
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('α線源 (²¹⁰Po)', 12, nucleusY - 55)

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
.scatter-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fbbf24;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.highlight-btn {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
}
</style>
