<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">⚖️ 剛体の転倒 vs 滑り出し限界シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge" :class="stateBadgeClass">{{ stateLabel }}</span>
      </div>
    </div>

    <!-- 再生・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : (isFinished ? '🔄 最初から再生' : '▶ 実験スタート') }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x スロー</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x 標準</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x 高速</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り
      </button>
      <button class="btn btn-secondary" @click="resetParams" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
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
          {{ Math.min(xN, width_w / 2).toFixed(1) }} / {{ (width_w / 2).toFixed(1) }} <span class="stat-unit">cm</span>
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
          <input type="range" v-model.number="F" min="0" max="60" step="1" class="sim-slider" @input="onParamChange" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>力の加える高さ h_F:</span>
            <span class="control-val">{{ forceHeight }} cm</span>
          </label>
          <input type="range" v-model.number="forceHeight" min="10" :max="height_h" step="2" class="sim-slider" @input="onParamChange" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>静止摩擦係数 μ_s:</span>
            <span class="control-val">{{ mu_s.toFixed(2) }}</span>
          </label>
          <input type="range" v-model.number="mu_s" min="0.1" max="1.0" step="0.05" class="sim-slider" @input="onParamChange" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>直方体の横幅 w:</span>
            <span class="control-val">{{ width_w }} cm (高さ {{ height_h }} cm)</span>
          </label>
          <input type="range" v-model.number="width_w" min="20" max="60" step="5" class="sim-slider" @input="onParamChange" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="setPreset('slide_first')" class="sim-btn outline">滑りやすい条件（低摩擦）</button>
        <button @click="setPreset('topple_first')" class="sim-btn outline">倒れやすい条件（高い位置を押す）</button>
        <button @click="resetParams" class="sim-btn secondary">🔄 初期状態に戻す</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>力学の急所</strong>:
      外力 <i>F</i> を加えると、直方体が倒れないように<strong>垂直抗力 <i>N</i> の作用点が中心から右側（押す向きの前方）へとシフト</strong>していきます。
      <ul style="margin: 6px 0 0 16px; padding: 0;">
        <li>作用点が右端（<i>x</i><sub><i>N</i></sub> = <i>w</i> / 2）に達する前に <i>F</i> &gt; <i>μ</i><sub>s</sub><i>Mg</i> になれば → <strong>「滑り出す」</strong></li>
        <li>滑り出す前に作用点が右端（<i>x</i><sub><i>N</i></sub> = <i>w</i> / 2）に達して支えきれなくなれば → <strong>「転倒する」</strong></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)

// アニメーション状態
const isPlaying = ref(false)
const isFinished = ref(false)
const timeScale = ref(1.0)
let animationId = null
let lastTime = 0

// 動的シミュレーション変数
const simX = ref(0) // 水平滑走距離 (px)
const simVx = ref(0) // 水平滑走速度 (px/s)
const simAngle = ref(0) // 転倒角 (rad)
const simOmega = ref(0) // 角速度 (rad/s)
const bounceCount = ref(0)
const dustParticles = ref([])

// 物理パラメータ
const mass = ref(5.0) // kg
const g = 9.8 // m/s^2
const width_w = ref(30) // cm
const height_h = ref(60) // cm
const forceHeight = ref(45) // cm
const F = ref(15) // N
const mu_s = ref(0.5) // 静止摩擦係数
const mu_k = computed(() => mu_s.value * 0.8) // 動摩擦係数

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
const xN = computed(() => {
  return (F.value * forceHeight.value) / weight.value
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

function onParamChange() {
  if (!isPlaying.value) {
    // 静止状態でリセット
    resetMotion()
  }
}

function resetMotion() {
  simX.value = 0
  simVx.value = 0
  simAngle.value = 0
  simOmega.value = 0
  bounceCount.value = 0
  dustParticles.value = []
  isFinished.value = false
}

function resetParams() {
  isPlaying.value = false
  F.value = 15
  forceHeight.value = 45
  mu_s.value = 0.5
  width_w.value = 30
  resetMotion()
}

function setPreset(type) {
  isPlaying.value = false
  if (type === 'slide_first') {
    mu_s.value = 0.25
    forceHeight.value = 25
    F.value = 22
  } else if (type === 'topple_first') {
    mu_s.value = 0.8
    forceHeight.value = 55
    F.value = 22
  }
  resetMotion()
}

function togglePlay() {
  if (isFinished.value) {
    resetMotion()
    isPlaying.value = true
    lastTime = performance.now()
    return
  }
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    lastTime = performance.now()
  }
}

function stepForward() {
  isPlaying.value = false
  updatePhysics(0.05)
  render()
}

function updatePhysics(dt) {
  const scaledDt = dt * timeScale.value
  const state = currentState.value

  if (state === 'stable') {
    // 安定静止
    simX.value = 0
    simAngle.value = 0
    return
  }

  if (state === 'sliding') {
    // 滑走モード
    // 加速度 a = (F - mu_k * Mg) / M [m/s^2]
    const frictionForce = mu_k.value * weight.value
    const netForce = Math.max(0, F.value - frictionForce)
    const accel = netForce / mass.value // m/s^2
    const pixelScale = 150 // 1m = 150px
    const aPx = accel * pixelScale

    simVx.value += aPx * scaledDt
    simX.value += simVx.value * scaledDt

    // 砂埃パーティクル生成
    if (Math.random() < 0.4 && simVx.value > 10) {
      dustParticles.value.push({
        x: 300 - (width_w.value * 3) / 2 + simX.value,
        y: 280,
        vx: -Math.random() * 40 - 10,
        vy: -Math.random() * 25 - 5,
        alpha: 0.8,
        radius: Math.random() * 4 + 2
      })
    }

    // 画面端到達判定
    if (simX.value > 300) {
      isPlaying.value = false
      isFinished.value = true
    }
  } else if (state === 'toppled') {
    // 転倒モード（右下端を軸に回転）
    // 慣性モーメント I = M(w^2 + h^2)/12 + M( (w/2)^2 + (h/2)^2 ) = M(w^2 + h^2)/3
    const wM = width_w.value / 100
    const hM = height_h.value / 100
    const I = mass.value * (wM * wM + hM * hM) / 3 // kg m^2

    // トルク τ = F * h_F * cosθ - Mg * (w/2 * cosθ - h/2 * sinθ)
    const theta = simAngle.value
    const torqueF = F.value * (forceHeight.value / 100) * Math.cos(theta)
    const torqueG = weight.value * ((wM / 2) * Math.cos(theta) - (hM / 2) * Math.sin(theta))
    const netTorque = torqueF - torqueG

    const alpha = Math.max(0.5, netTorque / I) // rad/s^2

    simOmega.value += alpha * scaledDt
    simAngle.value += simOmega.value * scaledDt

    // 床への衝突 (90度 = Math.PI / 2)
    if (simAngle.value >= Math.PI / 2) {
      simAngle.value = Math.PI / 2
      if (bounceCount.value < 2) {
        simOmega.value = -simOmega.value * 0.25 // バウンド
        bounceCount.value++
      } else {
        simOmega.value = 0
        isPlaying.value = false
        isFinished.value = true
      }
    }
  }

  // パーティクル更新
  for (let i = dustParticles.value.length - 1; i >= 0; i--) {
    const p = dustParticles.value[i]
    p.x += p.vx * scaledDt
    p.y += p.vy * scaledDt
    p.alpha -= scaledDt * 1.5
    if (p.alpha <= 0) {
      dustParticles.value.splice(i, 1)
    }
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  // 床 (y = 280)
  const floorY = 280
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(30, floorY)
  ctx.lineTo(width - 30, floorY)
  ctx.stroke()

  // 床のハッチング
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  for (let x = 40; x < width - 30; x += 15) {
    ctx.beginPath()
    ctx.moveTo(x, floorY)
    ctx.lineTo(x - 10, floorY + 12)
    ctx.stroke()
  }

  // 直方体の寸法スケーリング (1cm = 3px)
  const scale = 3
  const bw = width_w.value * scale
  const bh = height_h.value * scale
  const baseOriginX = 260
  const bx = baseOriginX - bw / 2 + simX.value
  const by = floorY - bh

  // 砂埃パーティクルの描画
  dustParticles.value.forEach(p => {
    ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
  })

  // 転倒・回転トランスフォーム
  const angle = simAngle.value
  const isToppled = currentState.value === 'toppled'
  const isSliding = currentState.value === 'sliding'

  ctx.save()
  if (angle > 0) {
    // 右下端 (bx + bw, floorY) を中心に回転
    const pivotX = bx + bw
    const pivotY = floorY
    ctx.translate(pivotX, pivotY)
    ctx.rotate(angle)
    ctx.translate(-pivotX, -pivotY)
  }

  // 直方体本体
  ctx.fillStyle = isToppled && angle > 0.1
    ? 'rgba(244, 63, 94, 0.28)'
    : (isSliding && simX.value > 0 ? 'rgba(251, 191, 36, 0.28)' : 'rgba(30, 41, 59, 0.85)')
  ctx.strokeStyle = isToppled && angle > 0.1
    ? '#f43f5e'
    : (isSliding && simX.value > 0 ? '#fbbf24' : '#38bdf8')
  ctx.lineWidth = 2.5
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeRect(bx, by, bw, bh)

  // 直方体の中心軸点線
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(bx + bw / 2, by)
  ctx.lineTo(bx + bw / 2, floorY)
  ctx.stroke()
  ctx.setLineDash([])

  // 重心 G
  const gx = bx + bw / 2
  const gy = by + bh / 2
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(gx, gy, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('重心 G', gx - 18, gy - 12)

  // 重力 Mg ベクトル (真下)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(gx, gy)
  ctx.lineTo(gx, gy + 65)
  ctx.stroke()
  // 矢じり
  drawArrowHead(ctx, gx, gy + 65, Math.PI / 2, '#38bdf8')
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('Mg', gx + 8, gy + 50)

  // 外力 F ベクトル
  if (angle < Math.PI / 3) {
    const fyPos = floorY - forceHeight.value * scale
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(bx - 60, fyPos)
    ctx.lineTo(bx, fyPos)
    ctx.stroke()
    drawArrowHead(ctx, bx, fyPos, 0, '#f43f5e')
    ctx.fillStyle = '#f43f5e'
    ctx.fillText(`外力 F = ${F.value}N`, bx - 75, fyPos - 10)
  }

  // 垂直抗力 N ベクトル（床面から上向き）
  if (angle === 0) {
    const shiftClamped = Math.min(xN.value, width_w.value / 2)
    const nx = gx + shiftClamped * scale
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(nx, floorY)
    ctx.lineTo(nx, floorY - 70)
    ctx.stroke()
    drawArrowHead(ctx, nx, floorY - 70, -Math.PI / 2, '#10b981')
    ctx.fillStyle = '#10b981'
    ctx.fillText('垂直抗力 N', nx + 8, floorY - 50)

    // 作用点マーカー
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.arc(nx, floorY, 4, 0, Math.PI * 2)
    ctx.fill()

    // 摩擦力 f ベクトル (底面、左向き)
    const frictionLen = Math.min(60, Math.max(15, (F.value / 60) * 80))
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(bx + bw / 2, floorY)
    ctx.lineTo(bx + bw / 2 - frictionLen, floorY)
    ctx.stroke()
    drawArrowHead(ctx, bx + bw / 2 - frictionLen, floorY, Math.PI, '#fbbf24')
    ctx.fillStyle = '#fbbf24'
    ctx.fillText(isSliding ? '動摩擦力 μ_k N' : '静止摩擦力 f', bx + bw / 2 - frictionLen - 10, floorY + 18)
  }

  ctx.restore()

  // 速度表示（滑走時）
  if (simVx.value > 0) {
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`速度 v = ${(simVx.value / 150).toFixed(2)} m/s`, bx + bw / 2 - 30, by - 15)
  }

  // 倒れ込み衝撃リング
  if (angle >= Math.PI / 2 && bounceCount.value > 0) {
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(bx + bw, floorY, 25, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawArrowHead(ctx, x, y, angle, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-8, -4)
  ctx.lineTo(-8, 4)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function simLoop(time) {
  if (lastTime === 0) lastTime = time
  const dt = Math.min((time - lastTime) / 1000, 0.1)
  lastTime = time

  if (isPlaying.value) {
    updatePhysics(dt)
  }
  render()

  animationId = requestAnimationFrame(simLoop)
}

onMounted(() => {
  render()
  animationId = requestAnimationFrame(simLoop)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

watch([F, forceHeight, mu_s, width_w], () => {
  render()
})
</script>

<style scoped>
.sim-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  margin: 18px 0;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.sim-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-text-1);
}

.sim-badges {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
}

.badge-cyan {
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.canvas-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  background: #090d16;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sim-canvas {
  width: 100%;
  max-width: 700px;
  height: auto;
  aspect-ratio: 700 / 380;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 8px 12px;
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
