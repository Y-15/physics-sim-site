<template>
  <div class="lab" style="--ac:#f59e0b;--ac2:#ef4444">
    <div class="lab-head">
      <span class="lab-title">🔬 気体分子運動論と二乗平均速度 実験室</span>
      <span class="lab-badge">{{ gasName }}（分子量 M = {{ molWeight }} g/mol）</span>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>絶対温度 <i>T</i>: <strong>{{ tempK }} K</strong> ({{ (tempK - 273.15).toFixed(0) }} °C)</label>
        <input type="range" v-model.number="tempK" min="100" max="800" step="25" />
        <div class="lab-note">温度が4倍になると、分子の二乗平均速度 <i>v</i><sub>rms</sub> は2倍に増加</div>
      </div>

      <div class="lab-ctrl">
        <label>気体の種類（分子量）</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: gasType === 'H2' }" @click="setGas('H2')">水素 H₂ (M=2)</button>
          <button class="lab-chip" :class="{ on: gasType === 'He' }" @click="setGas('He')">ヘリウム He (M=4)</button>
          <button class="lab-chip" :class="{ on: gasType === 'N2' }" @click="setGas('N2')">窒素 N₂ (M=28)</button>
          <button class="lab-chip" :class="{ on: gasType === 'O2' }" @click="setGas('O2')">酸素 O₂ (M=32)</button>
          <button class="lab-chip" :class="{ on: gasType === 'CO2' }" @click="setGas('CO2')">二酸化炭素 CO₂ (M=44)</button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>容器内の分子数: <strong>{{ particleCount }} 個</strong></label>
        <input type="range" v-model.number="particleCount" min="30" max="150" step="10" />
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">二乗平均速度 <i>v</i><sub>rms</sub></div>
        <div class="v" style="color:#f59e0b">{{ vRms.toFixed(0) }} <small>m/s</small></div>
        <div class="f"><i>v</i><sub>rms</sub> = √(3<i>RT</i> / <i>M</i>)（新幹線やジェット機より猛スピード！）</div>
      </div>

      <div class="lab-stat">
        <div class="k">分子1個の平均運動エネルギー</div>
        <div class="v" style="color:#ef4444">{{ (avgKineticEnergy_zJ).toFixed(2) }} <small>zJ (10⁻²¹ J)</small></div>
        <div class="f">½<i>m</i>⟨<i>v</i>²⟩ = <sup>3</sup>⁄<sub>2</sub> <i>k</i><sub>B</sub><i>T</i>（分子の種類によらず温度だけで決まる！）</div>
      </div>

      <div class="lab-stat">
        <div class="k">容器壁への衝突頻度</div>
        <div class="v" style="color:#38bdf8">{{ (collisionRate).toFixed(0) }} <small>回/秒</small></div>
        <div class="f">衝突力積の総和が「気体の圧力 <i>P</i>」を生み出す</div>
      </div>

      <div class="lab-stat">
        <div class="k">音速（近似）</div>
        <div class="v" style="color:#10b981">{{ soundSpeed.toFixed(0) }} <small>m/s</small></div>
        <div class="f"><i>c</i> = √(<i>γRT</i> / <i>M</i>) ≈ 0.74 <i>v</i><sub>rms</sub></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const R = 8.314 // J/(mol·K)
const kB = 1.380649e-23 // J/K
const tempK = ref(300) // K
const gasType = ref('N2')
const particleCount = ref(70)

const gasProps = computed(() => {
  switch (gasType.value) {
    case 'H2': return { name: '水素分子 H₂', m_g: 2.0, color: '#38bdf8' }
    case 'He': return { name: 'ヘリウム原子 He', m_g: 4.0, color: '#a855f7' }
    case 'N2': return { name: '窒素分子 N₂ (空気の主成分)', m_g: 28.0, color: '#10b981' }
    case 'O2': return { name: '酸素分子 O₂', m_g: 32.0, color: '#ef4444' }
    case 'CO2': return { name: '二酸化炭素 CO₂', m_g: 44.0, color: '#f59e0b' }
  }
})

const gasName = computed(() => gasProps.value.name)
const molWeight = computed(() => gasProps.value.m_g)

function setGas(t) {
  gasType.value = t
  initParticles()
}

// v_rms = sqrt(3 * R * T / M_kg)
// M_kg = molWeight * 1e-3
const vRms = computed(() => {
  const m_kg = molWeight.value * 1e-3
  return Math.sqrt((3 * R * tempK.value) / m_kg)
})

// 音速 c = sqrt(gamma * R * T / M)
const soundSpeed = computed(() => {
  const gamma = molWeight.value <= 4 ? (5 / 3) : (7 / 5)
  const m_kg = molWeight.value * 1e-3
  return Math.sqrt((gamma * R * tempK.value) / m_kg)
})

// 平均運動エネルギー E = 3/2 * kB * T [J] -> zJ (10^-21 J)
const avgKineticEnergy_zJ = computed(() => {
  const e = 1.5 * kB * tempK.value
  return e * 1e21
})

// 衝突頻度（アニメーション用概算）
const collisionRate = computed(() => {
  return particleCount.value * (vRms.value / 400) * 12
})

// 粒子配列
let particles = []

function initParticles() {
  particles = []
  for (let i = 0; i < particleCount.value; i++) {
    // マクスウェル分布を模した正規分布風サンプリング
    const u1 = Math.random()
    const u2 = Math.random()
    const r = Math.sqrt(-2 * Math.log(u1 + 1e-7))
    const theta = 2 * Math.PI * u2
    particles.push({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      vx: r * Math.cos(theta),
      vy: r * Math.sin(theta)
    })
  }
}

initParticles()
watch(particleCount, initParticles)

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  const splitX = width * 0.52

  // 1. 左側：分子が飛び交うシリンダー容器
  drawBox(ctx, 0, 0, splitX, height, dt)

  // 2. 右側：マクスウェル速度分布ヒストグラム
  drawMaxwellDistribution(ctx, splitX, 0, width - splitX, height)
})

function drawBox(ctx, ox, oy, w, h, dt) {
  const pad = 38
  const bx = ox + pad
  const by = oy + pad
  const bw = w - pad * 1.5
  const bh = h - pad * 2.1

  // 容器外枠
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 4
  ctx.strokeRect(bx, by, bw, bh)

  text(ctx, '📦 気体容器（容積 V 一定）', bx + bw / 2, by + bh + 34, { align: 'center', color: '#94a3b8', font: 'bold 11px sans-serif' })

  // 分子運動速度スケール (vRms に連動)
  const speedScale = (vRms.value / 500) * 0.35

  particles.forEach(p => {
    p.x += p.vx * speedScale * dt
    p.y += p.vy * speedScale * dt

    // 壁との弾性衝突（力積の発生）
    if (p.x < 0) { p.x = 0; p.vx *= -1 }
    if (p.x > 1) { p.x = 1; p.vx *= -1 }
    if (p.y < 0) { p.y = 0; p.vy *= -1 }
    if (p.y > 1) { p.y = 1; p.vy *= -1 }

    const sx = bx + p.x * bw
    const sy = by + p.y * bh

    dot(ctx, sx, sy, 3.5, gasProps.value.color, '#fff', 1)
  })

  // 壁が受ける圧力 P の矢印（四方）
  const arrLen = 18
  arrow(ctx, bx + bw / 2, by, bx + bw / 2, by - arrLen, { color: '#ef4444', width: 2, head: 5 })
  arrow(ctx, bx + bw / 2, by + bh, bx + bw / 2, by + bh + arrLen, { color: '#ef4444', width: 2, head: 5 })
  arrow(ctx, bx, by + bh / 2, bx - arrLen, by + bh / 2, { color: '#ef4444', width: 2, head: 5 })
  arrow(ctx, bx + bw, by + bh / 2, bx + bw + arrLen, by + bh / 2, { color: '#ef4444', width: 2, head: 5 })
  text(ctx, '壁への圧力 P', bx + bw / 2, by - arrLen - 5, { align: 'center', color: '#ef4444', font: 'bold 11px sans-serif' })
}

function drawMaxwellDistribution(ctx, ox, oy, w, h) {
  const padL = 45
  const padR = 25
  const padT = 50
  const padB = 40
  const gx = ox + padL
  const gy = oy + padT
  const gw = w - padL - padR
  const gh = h - padT - padB

  // タイトル
  text(ctx, '📊 マクスウェル＝ボルツマン速度分布 f(v)', ox + 15, oy + 18, { align: 'left', color: '#f59e0b', font: 'bold 12px sans-serif' })

  // 軸
  line(ctx, gx, gy + gh, gx + gw, gy + gh, { color: '#64748b', width: 1.5 })
  line(ctx, gx, gy + gh, gx, gy, { color: '#64748b', width: 1.5 })
  text(ctx, '分子の速さ v [m/s] →', gx + gw - 10, gy + gh + 26, { align: 'right', color: '#94a3b8', font: '10px sans-serif' })
  text(ctx, '↑ 存在確率 f(v)', gx - 6, gy - 8, { align: 'left', color: '#94a3b8', font: '10px sans-serif' })

  // スケール: v 0〜2500 m/s
  const vMax = 2200
  const m_kg = molWeight.value * 1e-3
  const curT = tempK.value

  // 2D マクスウェル分布 f(v) = (m / (k_B T)) * v * exp(- m v^2 / (2 k_B T))
  ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2
  ctx.beginPath()

  const points = []
  let peakY = 0

  for (let px = 0; px <= gw; px += 3) {
    const v = (px / gw) * vMax
    // 規格化前指数
    const expTerm = Math.exp(- (m_kg * v * v) / (2 * R * curT))
    const prob = (m_kg / (R * curT)) * v * expTerm
    points.push({ px, prob })
    if (prob > peakY) peakY = prob
  }

  // 描画
  if (peakY > 0) {
    ctx.moveTo(gx, gy + gh)
    points.forEach(({ px, prob }) => {
      const sy = gy + gh - (prob / peakY) * (gh * 0.85)
      ctx.lineTo(gx + px, sy)
    })
    ctx.lineTo(gx + gw, gy + gh)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    points.forEach(({ px, prob }, idx) => {
      const sy = gy + gh - (prob / peakY) * (gh * 0.85)
      if (idx === 0) ctx.moveTo(gx + px, sy)
      else ctx.lineTo(gx + px, sy)
    })
    ctx.stroke()
  }

  // 二乗平均速度 v_rms の垂直マーカー線
  const vRmsPx = (vRms.value / vMax) * gw
  if (vRmsPx < gw) {
    line(ctx, gx + vRmsPx, gy + 10, gx + vRmsPx, gy + gh, { color: '#ef4444', width: 2, dash: [4, 4] })
    dot(ctx, gx + vRmsPx, gy + gh, 4, '#ef4444')
    text(ctx, `v_rms = ${vRms.value.toFixed(0)} m/s`, gx + vRmsPx, gy + 4, { align: 'center', color: '#ef4444', font: 'bold 11px sans-serif' })
  }
}
</script>
