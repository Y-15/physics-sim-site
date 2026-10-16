<template>
  <div class="lab" style="--ac:#ec4899;--ac2:#38bdf8">
    <div class="lab-head">
      <span class="lab-title">🌀 磁場中の荷電粒子の運動（ローレンツ力）実験室</span>
      <span class="lab-badge">{{ particleName }} (q = {{ chargeQ > 0 ? '+' : '' }}{{ chargeQ }}e)</span>
    </div>

    <!-- モード切替タブ -->
    <div style="display:flex;gap:6px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': simMode === 'circle' }" @click="simMode = 'circle'; reset()">
        🔄 一様磁場中の円運動
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': simMode === 'selector' }" @click="simMode = 'selector'; reset()">
        ⚡ 速度セレクター (直交電磁場 E ⊥ B)
      </button>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar" style="margin-top: 0.8rem;">
      <button class="lab-btn primary" @click="isPlaying = !isPlaying" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="lab-btn" @click="stepSim(0.03)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.03s)
      </button>
      <button class="lab-btn" @click="emitParticle" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        🚀 新粒子を発射
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>磁束密度 B: <strong>{{ bFieldT.toFixed(2) }} T</strong> ({{ bFieldT >= 0 ? '⊗ 画面奥向き' : '⊙ 画面手前向き' }})</label>
        <input type="range" v-model.number="bFieldT" min="-1.5" max="1.5" step="0.1" />
        <div class="lab-note">B が強いほどローレンツ力が増加し、回転半径 r が縮小</div>
      </div>

      <div class="lab-ctrl">
        <label>粒子の初速度 v: <strong>{{ speedV_kms.toFixed(0) }} km/s</strong></label>
        <input type="range" v-model.number="speedV_kms" min="20" max="250" step="10" />
      </div>

      <div v-if="simMode === 'selector'" class="lab-ctrl">
        <label>電場 E: <strong>{{ eField_kVm.toFixed(1) }} kV/m</strong> (下向き)</label>
        <input type="range" v-model.number="eField_kVm" min="0" max="200" step="10" />
        <div class="lab-note">直進条件: v = E / B = {{ (eField_kVm / Math.max(0.01, Math.abs(bFieldT))).toFixed(0) }} km/s</div>
      </div>

      <div class="lab-ctrl">
        <label>粒子プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: particleType === 'electron' }" @click="setParticle('electron')">電子 (e⁻: 負・軽)</button>
          <button class="lab-chip" :class="{ on: particleType === 'proton' }" @click="setParticle('proton')">陽子 (p⁺: 正・重)</button>
          <button class="lab-chip" :class="{ on: particleType === 'alpha' }" @click="setParticle('alpha')">α粒子 (He²⁺)</button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>軌道操作</label>
        <div class="lab-row">
          <button class="lab-btn lab-btn-pri" @click="emitParticle">🚀 新しい粒子を発射</button>
          <button class="lab-chip" @click="clearTrails">軌跡クリア</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">円運動の軌道半径 r</div>
        <div class="v" style="color:#ec4899">{{ orbitRadius_mm.toFixed(2) }} <small>mm</small></div>
        <div class="f">r = mv / (|q|B)</div>
      </div>

      <div class="lab-stat">
        <div class="k">回転周期 T</div>
        <div class="v" style="color:#38bdf8">{{ (orbitPeriod_ns).toFixed(2) }} <small>ns</small></div>
        <div class="f">T = 2πm / (|q|B)（速さ v によらず一定！）</div>
      </div>

      <div class="lab-stat">
        <div class="k">ローレンツ力 F_L</div>
        <div class="v" style="color:#f59e0b">{{ lorentzForce_fN.toFixed(2) }} <small>fN</small></div>
        <div class="f">F = |q|vB（速度に垂直＝仕事をしない）</div>
      </div>

      <div class="lab-stat" v-if="simMode === 'selector'">
        <div class="k">速度セレクター判定</div>
        <div class="v" :style="{ color: isStraight ? '#10b981' : '#f43f5e' }">
          {{ isStraight ? '直進通過！ (qE = qvB)' : (speedV_kms > straightSpeed ? '磁気力が勝り上へ偏向' : '静電気力が勝り下へ偏向') }}
        </div>
        <div class="f">通過速度 v = E / B = {{ straightSpeed.toFixed(0) }} km/s</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

// 物理定数
const eCharge = 1.60217663e-19 // C
const mElectron = 9.1093837e-31 // kg
const mProton = 1.6726219e-27 // kg

const simMode = ref('circle')
const bFieldT = ref(0.6) // T
const speedV_kms = ref(100) // km/s
const eField_kVm = ref(60) // kV/m
const particleType = ref('electron')
const isPlaying = ref(true)
const timeScale = ref(0.5) // デフォルトで粒子の曲がり方や回転をじっくり追える0.5xスロー再生
let manualStepDt = 0

function stepSim(delta = 0.03) {
  manualStepDt = delta
}

// 粒子の電荷 (単位 e) と質量 (kg)
const particleProps = computed(() => {
  switch (particleType.value) {
    case 'electron':
      return { q: -1, m: mElectron, name: '電子 (e⁻)', color: '#38bdf8' }
    case 'proton':
      return { q: 1, m: mProton * 0.05, name: '陽子 (p⁺)', color: '#ef4444' } // 描画視認性のため陽子スケール調整
    case 'alpha':
      return { q: 2, m: mProton * 0.2, name: 'α粒子 (He²⁺)', color: '#f59e0b' }
  }
})

const chargeQ = computed(() => particleProps.value.q)
const particleName = computed(() => particleProps.value.name)

function setParticle(t) {
  particleType.value = t
  reset()
}

// 理論計算
// r = mv / (|q|B)
// v [m/s] = speedV_kms * 1000
// B [T] = |bFieldT|
const orbitRadius_mm = computed(() => {
  const b = Math.max(0.01, Math.abs(bFieldT.value))
  const v = speedV_kms.value * 1000
  const q = Math.abs(chargeQ.value) * eCharge
  const m = particleProps.value.m
  const r_m = (m * v) / (q * b)
  return r_m * 1000
})

// T = 2πm / (|q|B) [s] -> ns
const orbitPeriod_ns = computed(() => {
  const b = Math.max(0.01, Math.abs(bFieldT.value))
  const q = Math.abs(chargeQ.value) * eCharge
  const m = particleProps.value.m
  const t_s = (2 * Math.PI * m) / (q * b)
  return t_s * 1e9
})

// F = q v B [N] -> fN (10^-15 N)
const lorentzForce_fN = computed(() => {
  const b = Math.abs(bFieldT.value)
  const v = speedV_kms.value * 1000
  const q = Math.abs(chargeQ.value) * eCharge
  return (q * v * b) * 1e15
})

// 速度セレクター直進速度 v = E / B [km/s]
const straightSpeed = computed(() => {
  const b = Math.max(0.01, Math.abs(bFieldT.value))
  const e = eField_kVm.value * 1000
  return (e / b) / 1000
})

const isStraight = computed(() => Math.abs(speedV_kms.value - straightSpeed.value) < 8)

// 粒子運動シミュレーション用
const particles = ref([])
const trails = ref([])

function reset() {
  clearTrails()
  emitParticle()
}

function clearTrails() {
  trails.value = []
}

function emitParticle() {
  const startX = simMode.value === 'circle' ? 120 : 40
  const startY = 200
  particles.value = [{
    x: startX,
    y: startY,
    vx: speedV_kms.value * 2.2, // スケール調整
    vy: 0,
    trail: []
  }]
}

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  // 1. 磁場領域・電場領域の背景描画
  drawFields(ctx, width, height)

  // 2. 粒子の物理更新 & 軌跡
  let stepDt = isPlaying.value ? dt * timeScale.value : 0
  if (manualStepDt > 0) {
    stepDt = manualStepDt
    manualStepDt = 0
  }
  updateAndDrawParticles(ctx, width, height, stepDt)
})

function drawFields(ctx, w, h) {
  // 磁場記号 (奥向き ⊗ または 手前向き ⊙)
  const b = bFieldT.value
  const isZero = Math.abs(b) < 0.05
  ctx.save()

  if (!isZero) {
    ctx.fillStyle = b > 0 ? 'rgba(56, 189, 248, 0.05)' : 'rgba(236, 72, 153, 0.05)'
    ctx.fillRect(80, 40, w - 100, h - 80)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.strokeRect(80, 40, w - 100, h - 80)

    // 磁場記号格子
    const step = 50
    for (let y = 65; y < h - 60; y += step) {
      for (let x = 110; x < w - 40; x += step) {
        if (b > 0) {
          // ⊗ (奥向き)
          dot(ctx, x, y, 7, 'transparent', 'rgba(56, 189, 248, 0.4)', 1.2)
          line(ctx, x - 4, y - 4, x + 4, y + 4, { color: 'rgba(56, 189, 248, 0.4)', width: 1.2 })
          line(ctx, x - 4, y + 4, x + 4, y - 4, { color: 'rgba(56, 189, 248, 0.4)', width: 1.2 })
        } else {
          // ⊙ (手前向き)
          dot(ctx, x, y, 7, 'transparent', 'rgba(236, 72, 153, 0.4)', 1.2)
          dot(ctx, x, y, 2.5, 'rgba(236, 72, 153, 0.6)')
        }
      }
    }
    text(ctx, `一様磁場 B = ${b.toFixed(2)} T (${b > 0 ? '⊗ 画面奥向き' : '⊙ 画面手前向き'})`, w - 120, 25, { align: 'right', color: b > 0 ? '#38bdf8' : '#ec4899', font: '11px sans-serif' })
  }

  // 速度セレクターモードの電場極板 (上下)
  if (simMode.value === 'selector') {
    const pLeft = 80
    const pW = w - 180
    // 上極板 (プラス)
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(pLeft, 40, pW, 8)
    text(ctx, '+ + + + + 上極板 (+極) + + + + +', pLeft + pW / 2, 32, { color: '#ef4444', font: '10px sans-serif' })

    // 下極板 (マイナス)
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(pLeft, h - 48, pW, 8)
    text(ctx, '- - - - - 下極板 (-極) - - - - -', pLeft + pW / 2, h - 26, { color: '#38bdf8', font: '10px sans-serif' })

    // 電場下向き矢印
    const eStep = 70
    for (let ex = pLeft + 35; ex < pLeft + pW; ex += eStep) {
      arrow(ctx, ex, 55, ex, h - 55, { color: 'rgba(239, 68, 68, 0.3)', width: 1.5, head: 6 })
    }
    text(ctx, `下向き一様電場 E = ${eField_kVm.value} kV/m`, pLeft + 15, h / 2, { align: 'left', color: '#fca5a5', font: '11px sans-serif' })
  }
  ctx.restore()
}

function updateAndDrawParticles(ctx, w, h, dt) {
  const safeDt = Math.min(dt, 0.03)
  const qSign = chargeQ.value // -1 or +1 or +2
  const b = bFieldT.value

  particles.value.forEach(p => {
    // 磁場領域内 (x > 80)
    if (p.x > 80 && p.x < w - 20 && p.y > 40 && p.y < h - 40) {
      // ローレンツ力: F = q(v x B)
      // v = (vx, vy, 0), B = (0, 0, b)
      // v x B = (vy * b, -vx * b, 0)
      // a_x = q * vy * b * scale
      // a_y = -q * vx * b * scale
      const forceScale = 4.5
      let ax = qSign * p.vy * b * forceScale
      let ay = -qSign * p.vx * b * forceScale

      // 速度セレクターの電場力 (下向き電場: 正電荷には下向き、負電荷には上向き)
      if (simMode.value === 'selector') {
        const eForce = qSign * (eField_kVm.value * 0.025) * 50
        ay += eForce
      }

      p.vx += ax * safeDt
      p.vy += ay * safeDt
    }

    p.x += p.vx * safeDt
    p.y += p.vy * safeDt

    // 軌跡記録
    p.trail.push({ x: p.x, y: p.y })
    if (p.trail.length > 200) p.trail.shift()

    // 軌跡描画
    if (p.trail.length > 1) {
      ctx.strokeStyle = particleProps.value.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(p.trail[0].x, p.trail[0].y)
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y)
      }
      ctx.stroke()
    }

    // 粒子本体
    dot(ctx, p.x, p.y, 6, particleProps.value.color, '#fff', 2)

    // 現在の速度ベクトル矢印
    const vMag = Math.hypot(p.vx, p.vy)
    if (vMag > 1) {
      const vArrLen = 30
      const vxNorm = (p.vx / vMag) * vArrLen
      const vyNorm = (p.vy / vMag) * vArrLen
      arrow(ctx, p.x, p.y, p.x + vxNorm, p.y + vyNorm, { color: '#10b981', width: 2, head: 5 })
    }

    // 画面外に出たら自動再発射
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
      emitParticle()
    }
  })

  // 粒子発射銃
  const startX = simMode.value === 'circle' ? 120 : 40
  ctx.fillStyle = '#475569'
  ctx.fillRect(startX - 25, 192, 25, 16)
  ctx.strokeStyle = '#94a3b8'
  ctx.strokeRect(startX - 25, 192, 25, 16)
  text(ctx, '粒子源', startX - 12, 184, { color: '#94a3b8', font: '10px sans-serif' })
}
</script>
