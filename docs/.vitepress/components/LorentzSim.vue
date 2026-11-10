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

    <div class="lab-canvas"><canvas ref="canvasRef" style="aspect-ratio: 720 / 400;"></canvas></div>

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
        <div class="f">r = <span class="frac"><span class="num">mv</span><span class="den">|q|B</span></span></div>
      </div>

      <div class="lab-stat">
        <div class="k">回転周期 T</div>
        <div class="v" style="color:#38bdf8">{{ (orbitPeriod_ns).toFixed(2) }} <small>ns</small></div>
        <div class="f">T = <span class="frac"><span class="num">2πm</span><span class="den">|q|B</span></span>（速さ v によらず一定！）</div>
      </div>

      <div class="lab-stat">
        <div class="k">ローレンツ力 <i>F</i><sub>L</sub></div>
        <div class="v" style="color:#f59e0b">{{ lorentzForce_fN.toFixed(2) }} <small>fN</small></div>
        <div class="f"><i>F</i> = |<i>q</i>|<i>vB</i>（速度に垂直＝仕事をしない）</div>
      </div>

      <div class="lab-stat" v-if="simMode === 'selector'">
        <div class="k">速度セレクター判定</div>
        <div class="v" :style="{ color: isStraight ? '#10b981' : '#f43f5e' }">
          {{ isStraight ? '直進通過！ (qE = qvB)' : (speedV_kms > straightSpeed ? '磁気力が勝り上へ偏向' : '静電気力が勝り下へ偏向') }}
        </div>
        <div class="f">通過速度 v = <span class="frac"><span class="num">E</span><span class="den">B</span></span> = {{ straightSpeed.toFixed(0) }} km/s</div>
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

// 論理キャンバスサイズ（固定論理解像度＋高DPI自動スケール）
const W = 720
const H = 400
const CENTER_X = W / 2
const CENTER_Y = H / 2

// 粒子運動シミュレーション用
const particles = ref([])
const trails = ref([])

function getGunPos() {
  // 円運動モード: 磁場領域の中心 (360, 200)
  // 速度セレクターモード: 極板入り口の左側、上下極板間の中心軸 (68, 200)
  return simMode.value === 'circle'
    ? { x: CENTER_X, y: CENTER_Y }
    : { x: 68, y: CENTER_Y }
}

function reset() {
  clearTrails()
  emitParticle()
}

function clearTrails() {
  trails.value = []
}

function emitParticle() {
  const gun = getGunPos()
  particles.value = [{
    x: gun.x,
    y: gun.y,
    vx: speedV_kms.value * 2.2, // スケール調整
    vy: 0,
    trail: []
  }]
}

// 初期状態で粒子を発射し運動を開始する
emitParticle()

const canvasRef = ref(null)

useLoop((dt) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = setupCanvas(canvas, W, H)
  clearGrid(ctx, W, H, 40)

  // 1. 磁場領域・電場領域の背景描画
  drawFields(ctx, W, H)

  // 2. 粒子の物理更新 & 軌跡
  let stepDt = isPlaying.value ? dt * timeScale.value : 0
  if (manualStepDt > 0) {
    stepDt = manualStepDt
    manualStepDt = 0
  }
  updateAndDrawParticles(ctx, W, H, stepDt)
})

function drawFields(ctx, w, h) {
  // 磁場記号 (奥向き ⊗ または 手前向き ⊙)
  const b = bFieldT.value
  const isZero = Math.abs(b) < 0.05
  ctx.save()

  if (!isZero) {
    const bx0 = simMode.value === 'circle' ? 40 : 80
    const bw = simMode.value === 'circle' ? w - 80 : w - 140
    ctx.fillStyle = b > 0 ? 'rgba(56, 189, 248, 0.05)' : 'rgba(236, 72, 153, 0.05)'
    ctx.fillRect(bx0, 40, bw, h - 80)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.strokeRect(bx0, 40, bw, h - 80)

    // 磁場記号格子
    const step = 50
    for (let y = 65; y < h - 50; y += step) {
      for (let x = bx0 + 30; x < bx0 + bw - 15; x += step) {
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
    text(ctx, `一様磁場 B = ${b.toFixed(2)} T (${b > 0 ? '⊗ 画面奥向き' : '⊙ 画面手前向き'})`, w - 24, 24, { align: 'right', color: b > 0 ? '#38bdf8' : '#ec4899', font: '11px sans-serif' })
  }

  // 速度セレクターモードの電場極板 (上下対称に配置し中心が y = h/2)
  if (simMode.value === 'selector') {
    const pLeft = 80
    const pW = w - 140
    // 上極板 (プラス): y = 40..48
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(pLeft, 40, pW, 8)
    text(ctx, '+ + + + + 上極板 (+極) + + + + +', pLeft + pW / 2, 28, { align: 'center', color: '#ef4444', font: '10px sans-serif' })

    // 下極板 (マイナス): y = h - 48 .. h - 40
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(pLeft, h - 48, pW, 8)
    text(ctx, '- - - - - 下極板 (-極) - - - - -', pLeft + pW / 2, h - 18, { align: 'center', color: '#38bdf8', font: '10px sans-serif' })

    // 電極間の中心軸 (直進ライン目安)
    line(ctx, pLeft, CENTER_Y, pLeft + pW, CENTER_Y, { color: 'rgba(16, 185, 129, 0.25)', width: 1, dash: [5, 5] })

    // 電場下向き矢印
    const eStep = 70
    for (let ex = pLeft + 35; ex < pLeft + pW - 10; ex += eStep) {
      arrow(ctx, ex, 54, ex, h - 54, { color: 'rgba(239, 68, 68, 0.28)', width: 1.5, head: 6 })
    }
    text(ctx, `下向き一様電場 E = ${eField_kVm.value} kV/m`, pLeft + 15, 70, { align: 'left', color: '#fca5a5', font: '11px sans-serif' })

    // 右端スリット（電極中心の高さに開口部）
    ctx.fillStyle = '#475569'
    ctx.fillRect(pLeft + pW, 40, 8, CENTER_Y - 14 - 40)
    ctx.fillRect(pLeft + pW, CENTER_Y + 14, 8, h - 40 - (CENTER_Y + 14))
    text(ctx, 'スリット', pLeft + pW + 14, CENTER_Y + 4, { align: 'left', color: '#94a3b8', font: '10px sans-serif' })
  }
  ctx.restore()
}

function updateAndDrawParticles(ctx, w, h, dt) {
  const safeDt = Math.min(dt, 0.03)
  const qSign = chargeQ.value // -1 or +1 or +2
  const b = bFieldT.value
  const bxMin = simMode.value === 'circle' ? 40 : 80
  const bxMax = simMode.value === 'circle' ? w - 40 : w - 60

  particles.value.forEach(p => {
    // 磁場・電場領域内の判定
    if (p.x >= bxMin && p.x <= bxMax && p.y > 48 && p.y < h - 48) {
      // ローレンツ力: F = q(v x B)
      const forceScale = 4.5
      let ax = qSign * p.vy * b * forceScale
      let ay = -qSign * p.vx * b * forceScale

      // 速度セレクターの電場力 (下向き電場: 正電荷には下向き、負電荷には上向き)
      if (simMode.value === 'selector') {
        const eForce = qSign * (eField_kVm.value * 0.025) * 50
        ay += eForce
      }

      const targetSpeed = speedV_kms.value * 2.2
      p.vx += ax * safeDt
      p.vy += ay * safeDt
      if (simMode.value === 'circle') {
        const curSpd = Math.hypot(p.vx, p.vy)
        if (curSpd > 0.001) {
          p.vx = (p.vx / curSpd) * targetSpeed
          p.vy = (p.vy / curSpd) * targetSpeed
        }
      }
    }

    p.x += p.vx * safeDt
    p.y += p.vy * safeDt

    // 軌跡記録
    p.trail.push({ x: p.x, y: p.y })
    if (p.trail.length > 260) p.trail.shift()

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

    // 磁場領域外または極板接触・画面外に出たら自動再発射
    if (
      (simMode.value === 'circle' && (p.x < bxMin - 2 || p.x > bxMax + 2 || p.y < 38 || p.y > h - 38)) ||
      (simMode.value === 'selector' && (p.y <= 50 || p.y >= h - 50 || p.x > w + 10)) ||
      p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20
    ) {
      emitParticle()
    }
  })

  // 粒子発射銃 (常に中心または電極間中心に配置)
  const gun = getGunPos()
  ctx.fillStyle = '#475569'
  ctx.fillRect(gun.x - 24, gun.y - 8, 24, 16)
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.strokeRect(gun.x - 24, gun.y - 8, 24, 16)
  dot(ctx, gun.x, gun.y, 3, '#38bdf8')
  text(ctx, '粒子源', gun.x - 12, gun.y - 14, { align: 'center', color: '#e2e8f0', font: 'bold 10px sans-serif' })
}
</script>
