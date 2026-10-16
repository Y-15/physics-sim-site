<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const dBdt = ref(2.0) // 磁場上昇率 [T/s] (0.5 ~ 5.0)
const orbitRadiusTarget = ref(130) // 設計軌道半径 R0 [px]
const fieldProfileRatio = ref(2.0) // 平均磁場と軌道磁場の比 (B_bar / B0) -> 2.0 で安定
const isPlaying = ref(true)
const timeScale = ref(0.4) // 誘導加速と軌道安定性が追える0.4x推奨

let animationFrameId = null

const width = 500
const height = 380
const centerX = width / 2
const centerY = height / 2

// 電子状態
const state = ref({
  theta: 0,
  r: 130, // 現在の半径
  v: 1.0, // 周速度
  bZero: 0.2, // 軌道上の磁場 [T]
  bAvg: 0.4,  // 軌道内の平均磁場 [T]
  time: 0,
  isStable: true,
  statusMsg: '安定加速中 (2:1条件適合)'
})

// 誘導電場の大きさ E = (R / 2) * (dB_avg / dt)
const inducedEField = computed(() => {
  const R = orbitRadiusTarget.value / 100 // スケール m
  const bRate = dBdt.value
  return (R * 0.5 * bRate * 50).toFixed(1)
})

function resetSim() {
  state.value = {
    theta: 0,
    r: orbitRadiusTarget.value,
    v: 1.2,
    bZero: 0.2,
    bAvg: 0.2 * fieldProfileRatio.value,
    time: 0,
    isStable: true,
    statusMsg: '安定加速中 (2:1条件適合)'
  }
}

function stepForward() {
  updatePhysics(0.04)
}

function updatePhysics(dtOverride = null) {
  if (!isPlaying.value && !dtOverride) return

  const dt = (dtOverride || 0.03) * timeScale.value
  const s = state.value
  const R0 = orbitRadiusTarget.value
  const ratio = fieldProfileRatio.value

  // 磁場の上昇
  s.bZero += dBdt.value * dt * 0.05
  s.bAvg = s.bZero * ratio

  // 接線方向の加速: dv/dt ∝ E ∝ R0 * (dB_avg/dt)
  const accel = 0.8 * dBdt.value * dt
  s.v += accel

  // 半径の安定性判定:
  // p = m*v, ローレンツ力向心力から r = p / (e * B0)
  // もし ratio == 2.0 なら p の増加率と B0 の増加率が釣り合い r = R0 一定
  // ratio > 2.0 (中心磁場強すぎ) => 加速が強すぎて半径拡大
  // ratio < 2.0 (中心磁場弱すぎ) => 磁場の押さえ込みが勝ち半径縮小
  const idealRatio = 2.0
  const drift = (ratio - idealRatio) * 0.4 * s.v * dt
  s.r += drift

  // ドーナツ真空管の壁（幅 50px）との衝突判定
  const innerWall = R0 - 30
  const outerWall = R0 + 30
  if (s.r < innerWall) {
    s.isStable = false
    s.statusMsg = '内壁に衝突！ (加速不足 / 軌道縮小)'
  } else if (s.r > outerWall) {
    s.isStable = false
    s.statusMsg = '外壁に衝突！ (加速過剰 / 軌道拡大)'
  } else {
    s.isStable = true
    if (Math.abs(ratio - 2.0) < 0.05) {
      s.statusMsg = '理想軌道で加速中 (B_avg = 2 B₀)'
    } else {
      s.statusMsg = '軌道ドリフト中'
    }
  }

  // 角度更新
  const omega = s.v / (s.r * 0.08)
  s.theta += omega * dt
  s.time += dt
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  const R0 = orbitRadiusTarget.value

  // 1. ドーナツ型真空チェンバー（真空ドーナツ管）
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, centerY, R0 + 32, 0, Math.PI * 2)
  ctx.arc(centerX, centerY, R0 - 32, 0, Math.PI * 2, true)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.6)'
  ctx.fill()
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 理想軌道（中心線：水色点線）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(centerX, centerY, R0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // 2. 中心電磁石のコア（高密度磁束領域）
  const coreR = R0 - 45
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreR)
  coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)')
  coreGrad.addColorStop(1, 'rgba(14, 165, 233, 0.05)')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, coreR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('中心磁極コア', centerX - 36, centerY - 6)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px monospace'
  ctx.fillText(`平均磁束 B_avg`, centerX - 38, centerY + 12)

  // 3. 円周方向の誘導電場 E の矢印（反時計回り）
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)'
  ctx.lineWidth = 1.5
  for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 3) {
    const ax = centerX + R0 * Math.cos(ang)
    const ay = centerY + R0 * Math.sin(ang)
    const tangX = -Math.sin(ang)
    const tangY = Math.cos(ang)
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + tangX * 22, ay + tangY * 22)
    ctx.stroke()
  }

  // 4. 電子（e⁻）本体と回転軌道
  const s = state.value
  const ex = centerX + s.r * Math.cos(s.theta)
  const ey = centerY + s.r * Math.sin(s.theta)

  // 電子の発光グロー
  const eGlow = ctx.createRadialGradient(ex, ey, 2, ex, ey, 14)
  eGlow.addColorStop(0, '#f43f5e')
  eGlow.addColorStop(1, 'rgba(244, 63, 94, 0)')
  ctx.fillStyle = eGlow
  ctx.beginPath()
  ctx.arc(ex, ey, 14, 0, Math.PI * 2)
  ctx.fill()

  // 電子球
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(ex, ey, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  // 電子ラベル
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px monospace'
  ctx.fillText('e⁻', ex + 8, ey - 6)

  // 5. 状態テキスト
  ctx.fillStyle = s.isStable ? '#10b981' : '#f43f5e'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`状態: ${s.statusMsg}`, 20, height - 20)

  updatePhysics()
  animationFrameId = requestAnimationFrame(draw)
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
        <span class="icon">🧲</span>
        <span>ベータトロン誘導加速器シミュレーター</span>
      </div>
      <div class="badge">ファラデーの電磁誘導則 × 2:1の法則</div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 加速再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨・観察)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 最初から加速
      </button>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="overlay-stats">
        <div class="stat-row">
          <span class="lbl">電子速度 <i>v</i>:</span>
          <span class="val highlight">{{ (state.v * 15).toFixed(1) }} ×10⁶ m/s</span>
        </div>
        <div class="stat-row">
          <span class="lbl">誘導電場 <i>E</i>:</span>
          <span class="val">{{ inducedEField }} V/m相当</span>
        </div>
        <div class="stat-row">
          <span class="lbl">軌道磁場 <i>B</i><sub>0</sub>:</span>
          <span class="val">{{ state.bZero.toFixed(2) }} T</span>
        </div>
        <div class="stat-row">
          <span class="lbl">平均磁場 <i>B</i>̄:</span>
          <span class="val">{{ state.bAvg.toFixed(2) }} T</span>
        </div>
        <div class="stat-row highlight-box">
          <span class="lbl">磁場比 <i>B</i>̄ / <i>B</i><sub>0</sub>:</span>
          <span class="val" :style="{ color: Math.abs(fieldProfileRatio - 2.0) < 0.1 ? '#10b981' : '#f43f5e' }">
            {{ fieldProfileRatio.toFixed(2) }} (理想: 2.00)
          </span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>磁場上昇率 (dB / dt): <span>{{ dBdt.toFixed(1) }} T/s</span></label>
          <input type="range" v-model.number="dBdt" min="0.5" max="4.0" step="0.5" />
        </div>
        <div class="control-group">
          <label>磁場プロファイル比 <i>B</i>̄ / <i>B</i><sub>0</sub>: <span>{{ fieldProfileRatio.toFixed(2) }}</span></label>
          <input type="range" v-model.number="fieldProfileRatio" min="1.4" max="2.6" step="0.05" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-secondary" @click="fieldProfileRatio = 2.0" style="color:#38bdf8; border-color:#38bdf8;">
          🎯 理想の 2:1 条件（B̄ = 2B₀）にワンタップで合わせる
        </button>
      </div>
    </div>

    <div class="betatron-note">
      💡 <strong>2対1の法則（The 2:1 Rule）</strong>：電磁誘導で電子を加速すると運動量 <i>p</i> が増え、軌道半径 <i>r</i> = (<i>p</i> / eB<sub>0</sub>) を一定に保つには軌道上の磁場 <i>B</i><sub>0</sub> も増やす必要があります。計算すると、中心内部の平均磁束密度 <i>B</i>̄ は軌道上の磁束密度 <i>B</i><sub>0</sub> の<strong>ちょうど2倍（<i>B</i>̄ = 2B<sub>0</sub>）</strong>でなければ軌道半径が維持できません！スライダーを動かして条件が崩れたときのドリフトを観察してください。
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
  aspect-ratio: 500 / 380;
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

.stat-row.highlight-box {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.25rem;
  margin-top: 0.15rem;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  flex-wrap: wrap;
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

.betatron-note {
  margin-top: 0.85rem;
  padding: 0.6rem 0.8rem;
  background: rgba(30, 41, 59, 0.4);
  border-left: 3px solid #38bdf8;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
}
.betatron-note strong {
  color: #38bdf8;
}
</style>
