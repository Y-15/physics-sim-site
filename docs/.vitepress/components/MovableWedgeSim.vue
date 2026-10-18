<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const wedgeMass = ref(3.0) // 台の質量 M [kg] (1.0 ~ 10.0)
const ballMass = ref(1.0)  // 小球の質量 m [kg] (0.5 ~ 5.0)
const slopeAngleDeg = ref(30) // 斜面角度 theta [deg] (15 ~ 60)
const isPlaying = ref(true)
const timeScale = ref(0.4) // 小球の滑走と台の後退が追える0.4x推奨

let animationFrameId = null

// 幾何・描画サイズ
const width = 500
const height = 360
const floorY = 300 // 床面の y 座標
const wedgeW = 260 // 三角台の底辺幅 [px]
const wedgeH = 150 // 三角台の高さ [px]

// シミュレーション状態
// 台の位置 X (台の左下角の x 座標)
// 球の斜面上の位置 s (斜面頂点からの滑走距離 [px])
const state = ref({
  wedgeX: 180,
  wedgeVx: 0,
  ballS: 20, // 頂点付近からスタート
  ballVs: 0,
  time: 0,
  trail: []
})

const thetaRad = computed(() => (slopeAngleDeg.value * Math.PI) / 180)

// 加速度の理論解 (高校物理・大学入試定石導出)
// 水平方向運動量保存 + 斜面に沿う運動方程式
// 台の水平加速度 A (右向き正), 球の斜面に対する相対加速度 alpha (斜面下向き正)
// 台の水平加速度 A = (m * g * sin(theta) * cos(theta)) / (M + m * sin^2(theta)) (左向きなら負)
// 相対加速度 alpha = ( (M + m) * g * sin(theta) ) / (M + m * sin^2(theta))
const accelerations = computed(() => {
  const M = wedgeMass.value
  const m = ballMass.value
  const th = thetaRad.value
  const g = 98 // 画面スケール重力加速度 px/s^2

  const denom = M + m * Math.pow(Math.sin(th), 2)
  // 台は左に動く (負方向)
  const wedgeAx = -(m * g * Math.sin(th) * Math.cos(th)) / denom
  const relAlpha = ((M + m) * g * Math.sin(th)) / denom

  // 垂直抗力 N = (M * m * g * cos(theta)) / denom
  const normalForce = (M * m * (g / 10) * Math.cos(th)) / denom

  return {
    wedgeAx,
    relAlpha,
    normalForce: normalForce.toFixed(1)
  }
})

// 球の絶対位置 (x, y)
const ballPos = computed(() => {
  const s = state.value.ballS
  const th = thetaRad.value
  // 台の右側が頂点、左下に向かって傾斜している三角形
  // 頂点: (wedgeX + wedgeW, floorY - wedgeH)
  const topX = state.value.wedgeX + wedgeW
  const topY = floorY - wedgeH
  // 斜面ベクトル: 左下方向 (-cos(th), sin(th))
  const bx = topX - s * Math.cos(th)
  const by = topY + s * Math.sin(th)
  return { x: bx, y: by }
})

// 水平重心位置 X_G = (M * X_wedge_center + m * x_ball) / (M + m)
const centerOfMassX = computed(() => {
  const M = wedgeMass.value
  const m = ballMass.value
  // 三角台の重心 (底辺の左下角から 2/3 幅)
  const wedgeG = state.value.wedgeX + (wedgeW * 2) / 3
  return (M * wedgeG + m * ballPos.value.x) / (M + m)
})

function resetSim() {
  state.value = {
    wedgeX: 180,
    wedgeVx: 0,
    ballS: 20,
    ballVs: 0,
    time: 0,
    trail: []
  }
}

function stepForward() {
  updatePhysics(0.04)
}

function updatePhysics(dtOverride = null) {
  if (!isPlaying.value && !dtOverride) return

  const dt = (dtOverride || 0.03) * timeScale.value
  const th = thetaRad.value
  const maxS = wedgeH / Math.sin(th)

  if (state.value.ballS < maxS - 10) {
    const acc = accelerations.value
    state.value.wedgeVx += acc.wedgeAx * dt
    state.value.wedgeX += state.value.wedgeVx * dt

    state.value.ballVs += acc.relAlpha * dt
    state.value.ballS += state.value.ballVs * dt

    state.value.time += dt

    // 軌跡の記録
    state.value.trail.push({ x: ballPos.value.x, y: ballPos.value.y })
    if (state.value.trail.length > 300) {
      state.value.trail.shift()
    }
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  // 1. なめらかな床
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, floorY)
  ctx.lineTo(width, floorY)
  ctx.stroke()

  // 床のハッチング
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'
  ctx.lineWidth = 1
  for (let x = 10; x < width; x += 15) {
    ctx.beginPath()
    ctx.moveTo(x, floorY)
    ctx.lineTo(x - 8, floorY + 12)
    ctx.stroke()
  }

  // 2. 三角台 (傾斜台)
  const wx = state.value.wedgeX
  const th = thetaRad.value
  const curH = wedgeW * Math.tan(th)
  const topY = floorY - curH

  ctx.fillStyle = 'rgba(30, 41, 59, 0.85)'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(wx, floorY) // 左下
  ctx.lineTo(wx + wedgeW, floorY) // 右下 (直角)
  ctx.lineTo(wx + wedgeW, topY) // 右上 (頂点)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 台の質量ラベル
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText(`質量 M = ${wedgeMass.value} kg`, wx + wedgeW * 0.4, floorY - curH * 0.3)

  // 3. 小球の軌跡
  const tr = state.value.trail
  if (tr.length > 1) {
    ctx.beginPath()
    ctx.moveTo(tr[0].x, tr[0].y)
    for (let i = 1; i < tr.length; i++) {
      ctx.lineTo(tr[i].x, tr[i].y)
    }
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])
    ctx.stroke()
    ctx.setLineDash([])
  }

  // 4. 小球本体
  const bp = ballPos.value
  const ballR = 12
  // 斜面に垂直な法線方向へ半径分オフセット
  const offX = ballR * Math.sin(th)
  const offY = -ballR * Math.cos(th)
  const drawBx = bp.x + offX
  const drawBy = bp.y + offY

  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(drawBx, drawBy, ballR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`m`, drawBx - 5, drawBy + 4)

  // 5. 水平重心位置 G の標示（垂直点線）
  const cmX = centerOfMassX.value
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cmX, 20)
  ctx.lineTo(cmX, floorY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#10b981'
  ctx.font = 'bold 11px monospace'
  ctx.fillText(`重心 X_G (水平不変)`, cmX + 6, 40)

  // 6. 速度矢印
  // 台の速度
  if (Math.abs(state.value.wedgeVx) > 0.1) {
    drawArrow(ctx, wx + 40, floorY + 25, wx + 40 + state.value.wedgeVx * 1.5, floorY + 25, '#38bdf8', 'V_x')
  }

  updatePhysics()
  animationFrameId = requestAnimationFrame(draw)
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  const angle = Math.atan2(toY - fromY, toX - fromX)
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - 7 * Math.cos(angle - Math.PI / 6), toY - 7 * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - 7 * Math.cos(angle + Math.PI / 6), toY - 7 * Math.sin(angle + Math.PI / 6))
  ctx.fill()

  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(label, (fromX + toX) / 2, fromY - 6)
  ctx.restore()
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
        <span class="icon">🪢</span>
        <span>動く斜面台と小球の束縛運動シミュレーター</span>
      </div>
      <div class="badge">水平方向運動量保存則 × 相対運動</div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 滑走再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 最初から滑走
      </button>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="overlay-stats">
        <div class="stat-row">
          <span class="lbl">台の速度 <i>V</i><sub><i>x</i></sub>:</span>
          <span class="val" style="color: #38bdf8">{{ (state.wedgeVx / 10).toFixed(2) }} m/s</span>
        </div>
        <div class="stat-row">
          <span class="lbl">垂直抗力 <i>N</i>:</span>
          <span class="val">{{ accelerations.normalForce }} N</span>
        </div>
        <div class="stat-row">
          <span class="lbl">滑走時間 <i>t</i>:</span>
          <span class="val highlight">{{ state.time.toFixed(2) }} s</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label><span>斜面台の質量 <i>M</i>:</span> <span>{{ wedgeMass.toFixed(1) }} kg</span></label>
          <input type="range" v-model.number="wedgeMass" min="1.0" max="8.0" step="0.5" @input="resetSim" />
        </div>
        <div class="control-group">
          <label><span>小球の質量 <i>m</i>:</span> <span>{{ ballMass.toFixed(1) }} kg</span></label>
          <input type="range" v-model.number="ballMass" min="0.5" max="4.0" step="0.5" @input="resetSim" />
        </div>
        <div class="control-group">
          <label><span>斜面角度 θ:</span> <span>{{ slopeAngleDeg }}°</span></label>
          <input type="range" v-model.number="slopeAngleDeg" min="20" max="50" step="5" @input="resetSim" />
        </div>
      </div>
    </div>

    <div class="physics-principle">
      💡 <strong>入試の核心</strong>：床との間に摩擦がないため、全体に対して水平方向の外力は一切働きません。したがって、<strong>「全体の水平方向の重心 <i>X</i><sub><i>G</i></sub> は滑走中も完全に静止（不変）」</strong>し、水平方向の運動量保存則 <i>M</i> <i>V</i><sub><i>x</i></sub> + <i>m</i> <i>v</i><sub><i>x</i></sub> = 0 が厳密に成立します。
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
  aspect-ratio: 500 / 360;
  display: block;
}

.overlay-stats {
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
  gap: 0.25rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.stat-row .lbl {
  color: #94a3b8;
}

.stat-row .val {
  font-family: monospace;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-row .val.highlight {
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
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.35rem 0.85rem;
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

.physics-principle {
  margin-top: 0.85rem;
  padding: 0.6rem 0.8rem;
  background: rgba(30, 41, 59, 0.4);
  border-left: 3px solid #10b981;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
}
.physics-principle strong {
  color: #10b981;
}
</style>
