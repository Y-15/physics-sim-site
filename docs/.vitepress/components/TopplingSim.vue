<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">⚖️ 剛体の転倒 vs 滑り出し限界シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge" :class="stateBadgeClass">{{ stateLabel }}</span>
      </div>
    </div>

    <!-- メインCanvas -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" width="700" height="380" class="sim-canvas"></canvas>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">外力 F</div>
        <div class="stat-value text-blue">{{ F }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最大静止摩擦力 F_max</div>
        <div class="stat-value text-yellow">{{ maxFriction.toFixed(1) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">転倒限界外力 F_topple</div>
        <div class="stat-value text-rose">{{ toppleForce.toFixed(1) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">抗力作用点シフト x_N</div>
        <div class="stat-value" :class="Math.abs(xN) >= width_w / 2 ? 'text-rose' : 'text-cyan'">
          {{ xN.toFixed(1) }} / {{ (width_w / 2).toFixed(1) }} <span class="stat-unit">cm</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>外力の大きさ F:</span>
            <span class="control-val">{{ F }} N</span>
          </label>
          <input type="range" v-model.number="F" min="0" max="60" step="1" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>力の加える高さ h_F:</span>
            <span class="control-val">{{ forceHeight }} cm</span>
          </label>
          <input type="range" v-model.number="forceHeight" min="10" :max="height_h" step="2" class="sim-slider" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>静止摩擦係数 μ_s:</span>
            <span class="control-val">{{ mu_s.toFixed(2) }}</span>
          </label>
          <input type="range" v-model.number="mu_s" min="0.1" max="1.0" step="0.05" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>直方体の横幅 w:</span>
            <span class="control-val">{{ width_w }} cm (高さ {{ height_h }} cm)</span>
          </label>
          <input type="range" v-model.number="width_w" min="20" max="60" step="5" class="sim-slider" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="setPreset('slide_first')" class="sim-btn outline">滑りやすい条件（低摩擦）</button>
        <button @click="setPreset('topple_first')" class="sim-btn outline">倒れやすい条件（高い位置を押す）</button>
        <button @click="resetParams" class="sim-btn secondary">🔄 リセット</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>力学の急所</strong>:
      外力 $F$ を加えると、直方体が倒れないように**垂直抗力 $N$ の作用点が中心から右側（押す向きの前方）へとシフト**していきます。
      * 作用点が右端（$x_N = w/2$）に達する前に $F > \mu_s Mg$ になれば $\to$ **「滑り出す」**
      * 滑り出す前に作用点が右端（$x_N = w/2$）に達して支えきれなくなれば $\to$ **「転倒する」**
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const mass = ref(5.0) // kg
const g = 9.8 // m/s^2
const width_w = ref(30) // cm
const height_h = ref(60) // cm
const forceHeight = ref(45) // cm
const F = ref(15) // N
const mu_s = ref(0.5) // 静止摩擦係数

// 重力
const weight = computed(() => mass.value * g) // 49 N

// 滑り出し外力
const maxFriction = computed(() => mu_s.value * weight.value)

// 転倒限界外力 (右下端まわりのモーメント: F * h_F = Mg * (w/2))
const toppleForce = computed(() => {
  if (forceHeight.value <= 0) return 999
  return (weight.value * (width_w.value / 2)) / forceHeight.value
})

// 垂直抗力の作用点シフト x_N (中心から右向き [cm])
// 重心まわりのモーメントつり合い: F * (h_F - h/2) - N * x_N + f * (h/2) = 0
// または底面中央まわり: F * h_F - N * x_N = 0  => x_N = (F * h_F) / N
const xN = computed(() => {
  const shift = (F.value * forceHeight.value) / weight.value
  return shift
})

// 状態判定
const currentState = computed(() => {
  const isTopple = F.value > toppleForce.value
  const isSlide = F.value > maxFriction.value

  if (!isTopple && !isSlide) return 'stable'
  if (toppleForce.value < maxFriction.value) {
    return isTopple ? 'toppled' : 'stable'
  } else {
    return isSlide ? 'sliding' : 'stable'
  }
})

const stateLabel = computed(() => {
  if (currentState.value === 'stable') return '静止安定（つり合い保持）'
  if (currentState.value === 'toppled') return '⚠️ 転倒！（右下端を軸に倒れる）'
  return '💨 滑走！（倒れずに右へすべる）'
})

const stateBadgeClass = computed(() => {
  if (currentState.value === 'stable') return 'badge-cyan'
  if (currentState.value === 'toppled') return 'badge-rose'
  return 'badge-yellow'
})

function resetParams() {
  F.value = 15
  forceHeight.value = 45
  mu_s.value = 0.5
  width_w.value = 30
}

function setPreset(type) {
  if (type === 'slide_first') {
    mu_s.value = 0.25
    forceHeight.value = 25
    F.value = 18
  } else if (type === 'topple_first') {
    mu_s.value = 0.8
    forceHeight.value = 55
    F.value = 20
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // 床 (y = 280)
  const floorY = 280
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(40, floorY)
  ctx.lineTo(width - 40, floorY)
  ctx.stroke()

  // 床のハッチング
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  for (let x = 50; x < width - 40; x += 15) {
    ctx.beginPath()
    ctx.moveTo(x, floorY)
    ctx.lineTo(x - 10, floorY + 12)
    ctx.stroke()
  }

  // 直方体の寸法スケーリング (1cm = 3px)
  const scale = 3
  const bw = width_w.value * scale
  const bh = height_h.value * scale
  const bx = 300 - bw / 2
  const by = floorY - bh

  // 転倒アニメーション表現 (傾き)
  const isToppled = currentState.value === 'toppled'
  const isSliding = currentState.value === 'sliding'

  ctx.save()
  if (isToppled) {
    // 右下端 (bx + bw, floorY) を中心に15度傾ける
    ctx.translate(bx + bw, floorY)
    ctx.rotate(0.2)
    ctx.translate(-(bx + bw), -floorY)
  } else if (isSliding) {
    ctx.translate(30, 0)
  }

  // 直方体本体
  ctx.fillStyle = isToppled ? 'rgba(244, 63, 94, 0.25)' : (isSliding ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.8)')
  ctx.strokeStyle = isToppled ? '#f43f5e' : (isSliding ? '#fbbf24' : '#38bdf8')
  ctx.lineWidth = 2.5
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeRect(bx, by, bw, bh)

  // 重心 G
  const gx = bx + bw / 2
  const gy = by + bh / 2
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(gx, gy, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillText('重心 G (質量 M)', gx - 35, gy - 10)

  // 重力 Mg ベクトル (真下)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(gx, gy)
  ctx.lineTo(gx, gy + 70)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('Mg', gx + 8, gy + 50)

  // 外力 F ベクトル
  const fyPos = floorY - forceHeight.value * scale
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(bx - 60, fyPos)
  ctx.lineTo(bx, fyPos)
  ctx.stroke()
  // 矢じり
  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.moveTo(bx, fyPos)
  ctx.lineTo(bx - 8, fyPos - 5)
  ctx.lineTo(bx - 8, fyPos + 5)
  ctx.closePath()
  ctx.fill()
  ctx.fillText(`外力 F = ${F.value}N`, bx - 90, fyPos - 8)

  // 摩擦力 f (底面で左向き)
  const frictionLen = Math.min(60, (F.value / weight.value) * 60)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(gx, floorY)
  ctx.lineTo(gx - frictionLen, floorY)
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('摩擦力 f', gx - frictionLen - 45, floorY - 6)

  // 垂直抗力 N (作用点シフト x_N)
  const clampedXN = Math.min(width_w.value / 2, xN.value)
  const nx = gx + clampedXN * scale
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(nx, floorY)
  ctx.lineTo(nx, floorY - 70)
  ctx.stroke()
  ctx.fillStyle = '#10b981'
  ctx.fillText('垂直抗力 N', nx + 8, floorY - 50)

  // 作用点マーク
  ctx.fillStyle = xN.value >= width_w.value / 2 ? '#f43f5e' : '#10b981'
  ctx.beginPath()
  ctx.arc(nx, floorY, 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  // 作用点シフトの注釈
  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px sans-serif'
  ctx.fillText(`抗力の作用点シフト: x_N = ${xN.value.toFixed(1)} cm (限界: ±${(width_w.value / 2).toFixed(1)} cm)`, 50, 40)
  if (xN.value >= width_w.value / 2) {
    ctx.fillStyle = '#f43f5e'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('★ 作用点が右端に到達！これ以上の力で転倒！', 50, 60)
  }
}

watch([F, forceHeight, mu_s, width_w], () => {
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

.sim-badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
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
.text-rose { color: #f43f5e; }

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
  margin-bottom: 12px;
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
  margin-top: 6px;
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
