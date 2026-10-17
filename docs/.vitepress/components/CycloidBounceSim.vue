<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🌀</span>
        <h3>重力場と一様磁場中の荷電粒子サイクロイド運動・床面反発シミュレーター</h3>
      </div>
      <p class="subtitle">
        鉛直下向きの重力場 $g$ と紙面奥向きの一様磁場 $B$ が直交する空間で放たれた正電荷 $q$ のサイクロイド運動と、
        高さ $y = -R$ の水平床面での反発（弾性・非弾性衝突）。
        ドリフト速度 $V_0 = \frac{mg}{qB}$ による座標変換、床面到達時の水平速度 $v_x = V_0$（不変）、および反発係数 $e$ による跳ね返り高さの減衰をリアルタイム検証できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="760" height="380"></canvas>
      <div class="sim-overlay-badge">
        <span>衝突回数: <strong>{{ bounceCount }}</strong> 回</span>
        <span class="separator">|</span>
        <span>床到達時 v<sub>x</sub>: <strong>{{ impactVx.toFixed(2) }}</strong> m/s (理論値 V<sub>0</sub> = {{ v0.toFixed(2) }})</span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>反発係数 <i>e</i>: <strong>{{ eRestitution.toFixed(2) }}</strong> ({{ eRestitution === 1 ? '完全弾性衝突' : '非弾性衝突' }})</span>
            <input type="range" v-model.number="eRestitution" min="0.2" max="1.0" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>磁束密度 <i>B</i>: <strong>{{ magneticB.toFixed(1) }} T</strong></span>
            <input type="range" v-model.number="magneticB" min="1.0" max="5.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>床（<i>y</i> = -<i>R</i>）の配置:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: floorEnabled }" @click="floorEnabled = !floorEnabled">
                {{ floorEnabled ? '床あり (y = -R で跳ね返る)' : '床なし (完全サイクロイド)' }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>ドリフト慣性系 S' の円ガイド表示:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: showDriftCircle }" @click="showDriftCircle = !showDriftCircle">
                {{ showDriftCircle ? '表示中 (等速円運動ガイド)' : '非表示' }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="stepForward" :disabled="isRunning">
          ⏭ 1コマ進める
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 リセット
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">ドリフト速度 <i>V</i><sub>0</sub> = <i>mg</i>/(<i>qB</i>)</span>
        <span class="value highlight">{{ v0.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">慣性系 S' の移動速度</span>
      </div>

      <div class="stat-card">
        <span class="label">特性半径 <i>R</i> = <i>m</i><sup>2</sup><i>g</i>/(<i>q</i><sup>2</sup><i>B</i><sup>2</sup>)</span>
        <span class="value">{{ rRadius.toFixed(2) }} <span class="unit">m</span></span>
        <span class="subtext">床面高さ y = -{{ rRadius.toFixed(2) }} m</span>
      </div>

      <div class="stat-card">
        <span class="label">サイクロトロン角振動数 <i>ω</i> = <i>qB</i>/<i>m</i></span>
        <span class="value">{{ omega.toFixed(2) }} <span class="unit">rad/s</span></span>
        <span class="subtext">周期 T = {{ (2 * Math.PI / omega).toFixed(2) }} s</span>
      </div>

      <div class="stat-card">
        <span class="label">理論滞空時間 Δ<i>T</i> = π/<i>ω</i></span>
        <span class="value highlight">{{ (Math.PI / omega).toFixed(2) }} <span class="unit">s</span></span>
        <span class="subtext">反発係数 e に依らず常に一定！</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, useLoop } from './simUtils'

const canvasRef = ref(null)

// 物理パラメータ
const mass = 1.0 // kg
const charge = 1.0 // C
const gravity = 9.8 // m/s^2
const magneticB = ref(2.5) // T
const eRestitution = ref(0.8)
const floorEnabled = ref(true)
const showDriftCircle = ref(true)
const isRunning = ref(true)

// 理論値
const v0 = computed(() => (mass * gravity) / (charge * magneticB.value))
const omega = computed(() => (charge * magneticB.value) / mass)
const rRadius = computed(() => (mass * mass * gravity) / (charge * charge * magneticB.value * magneticB.value))

// シミュレーション状態
let simTime = 0
let posX = 0
let posY = 0
let velX = 0
let velY = 0
const bounceCount = ref(0)
const impactVx = ref(v0.value)
let trajectory = []

function resetSim() {
  simTime = 0
  posX = 0
  posY = 0
  velX = 0
  velY = 0
  bounceCount.value = 0
  impactVx.value = v0.value
  trajectory = [{ x: 0, y: 0 }]
}

watch([magneticB, floorEnabled, eRestitution], () => {
  resetSim()
})

function togglePlay() {
  isRunning.value = !isRunning.value
}

function updatePhysics(dt) {
  // 数値積分の安定性のため微小ステップ分割（RK4またはシンプレクティックEuler）
  const subSteps = 8
  const sdt = dt / subSteps
  const B = magneticB.value
  const q_m = (charge * B) / mass
  const g = gravity
  const floorY = -rRadius.value

  for (let s = 0; s < subSteps; s++) {
    // 運動方程式:
    // a_x = -(qB/m)*v_y
    // a_y = (qB/m)*v_x - g
    const ax = -q_m * velY
    const ay = q_m * velX - g

    velX += ax * sdt
    velY += ay * sdt
    posX += velX * sdt
    posY += velY * sdt
    simTime += sdt

    // 床面衝突判定
    if (floorEnabled.value && posY <= floorY && velY < 0) {
      posY = floorY
      impactVx.value = velX // 衝突時の水平速度を記録（常に V0 に一致する）
      velY = -eRestitution.value * velY // 鉛直速度のみ反転＆減衰
      bounceCount.value++
    }
  }

  // 軌跡のサンプリング
  if (trajectory.length === 0 || Math.hypot(posX - trajectory[trajectory.length - 1].x, posY - trajectory[trajectory.length - 1].y) > 0.05) {
    trajectory.push({ x: posX, y: posY })
    if (trajectory.length > 1200) {
      trajectory.shift()
    }
  }

  // 画面右端に行き過ぎた場合はカメラを自動スクロールするか位置を折り返す
}

function stepForward() {
  updatePhysics(0.02)
}

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  if (isRunning.value) {
    updatePhysics(dt)
  }

  clearGrid(ctx, width, height, 40, '#0c0e14')

  // 座標変換スケール
  // 基準スケール: 1m = scale px
  const scale = Math.min(width / 7.5, height / 3.8)
  const originX = 60
  const originY = 80

  // 画面スクロール: 粒子が中央を越えたらカメラ追従
  let cameraOffsetX = 0
  const screenPxX = originX + posX * scale
  if (screenPxX > width * 0.6) {
    cameraOffsetX = screenPxX - width * 0.6
  }

  const toPx = (x, y) => ({
    px: originX + x * scale - cameraOffsetX,
    py: originY - y * scale // yは上向き正
  })

  // 1. 背景情報（磁場記号・重力矢印・座標軸）
  ctx.save()
  // 磁場奥向き記号 (⊗)
  ctx.font = '14px monospace'
  ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'
  for (let gx = 40; gx < width; gx += 80) {
    for (let gy = 40; gy < height; gy += 70) {
      ctx.fillText('⊗ B', gx, gy)
    }
  }

  // 重力加速度ベクトル表示
  arrow(ctx, width - 90, 40, width - 90, 85, '#f43f5e', 2.5, 'g (重力)', { head: 8, align: 'center', lx: 0, ly: 12 })
  // 磁場表示
  text(ctx, '一様磁場 B (紙面奥向き ⊗)', width - 180, 25, '#38bdf8', 'bold 12px sans-serif')

  // x軸・y軸
  const pOrig = toPx(0, 0)
  arrow(ctx, Math.max(20, pOrig.px - 30), pOrig.py, width - 20, pOrig.py, 'rgba(255,255,255,0.4)', 1.5, 'x', { head: 6, lx: 8 })
  arrow(ctx, pOrig.px, height - 20, pOrig.px, 20, 'rgba(255,255,255,0.4)', 1.5, 'y', { head: 6, ly: -8 })
  dot(ctx, pOrig.px, pOrig.py, 3, '#fff')
  text(ctx, 'O(0,0)', pOrig.px - 28, pOrig.py - 10, '#a1a1aa', '11px sans-serif')

  // 2. 床面 y = -R の描画
  if (floorEnabled.value) {
    const floorP = toPx(0, -rRadius.value)
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(0, floorP.py)
    ctx.lineTo(width, floorP.py)
    ctx.stroke()

    // ハッチング（床の厚み）
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)'
    ctx.lineWidth = 1
    for (let hx = 0; hx < width; hx += 16) {
      ctx.beginPath()
      ctx.moveTo(hx, floorP.py)
      ctx.lineTo(hx - 8, floorP.py + 10)
      ctx.stroke()
    }
    text(ctx, `床面 y = -R = -${rRadius.value.toFixed(2)}m`, 20, floorP.py - 8, '#f59e0b', 'bold 12px sans-serif')
  }

  // 3. ドリフト慣性系 S' の円ガイド（破線円）
  if (showDriftCircle.value) {
    const driftCenterX = v0.value * simTime
    const driftCenterY = -rRadius.value
    const pCenter = toPx(driftCenterX, driftCenterY)
    const pRadiusPx = rRadius.value * scale

    ctx.save()
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.arc(pCenter.px, pCenter.py, pRadiusPx, 0, Math.PI * 2)
    ctx.stroke()

    // 円の中心点
    dot(ctx, pCenter.px, pCenter.py, 2.5, '#a855f7')
    text(ctx, "慣性系 S' 中心", pCenter.px + 6, pCenter.py - 4, '#c084fc', '10px sans-serif')
    ctx.restore()
  }

  // 4. 運動軌跡（ネオングロー）
  if (trajectory.length > 1) {
    ctx.save()
    ctx.shadowColor = '#06b6d4'
    ctx.shadowBlur = 8
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let i = 0; i < trajectory.length; i++) {
      const p = toPx(trajectory[i].x, trajectory[i].y)
      if (i === 0) ctx.moveTo(p.px, p.py)
      else ctx.lineTo(p.px, p.py)
    }
    ctx.stroke()
    ctx.restore()
  }

  // 5. 荷電粒子本体と速度ベクトル
  const pCurr = toPx(posX, posY)
  // グローオーブ
  ctx.save()
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  dot(ctx, pCurr.px, pCurr.py, 7, '#38bdf8', '#ffffff')
  ctx.restore()

  // 速度ベクトル矢印
  const vScale = 12
  arrow(ctx, pCurr.px, pCurr.py, pCurr.px + velX * vScale, pCurr.py - velY * vScale, '#10b981', 2.5, `v = ${Math.hypot(velX, velY).toFixed(1)} m/s`, { head: 7, font: 'bold 11px sans-serif' })

  // 粒子ラベル
  text(ctx, `q=+${charge}C`, pCurr.px + 10, pCurr.py - 10, '#e0f2fe', '11px sans-serif')

  ctx.restore()
})
</script>

<style scoped>
.sim-container {
  background: var(--vp-c-bg-soft, #18181b);
  border: 1px solid var(--vp-c-divider, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 18px;
  margin: 24px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.sim-header h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  color: var(--vp-c-text-1, #f4f4f5);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtitle {
  font-size: 0.88rem;
  color: var(--vp-c-text-2, #a1a1aa);
  line-height: 1.5;
  margin-bottom: 14px;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  background: #0c0e14;
}

.sim-overlay-badge {
  position: absolute;
  top: 10px;
  left: 12px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
}

.control-panel {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 14px;
  margin-top: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.84rem;
  color: var(--vp-c-text-1, #e4e4e7);
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.select-btn {
  padding: 4px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: var(--vp-c-text-2, #a1a1aa);
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0284c7;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.76rem;
  color: var(--vp-c-text-2, #a1a1aa);
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--vp-c-text-1, #f4f4f5);
}

.stat-card .value.highlight {
  color: #38bdf8;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: 2px;
}
</style>
