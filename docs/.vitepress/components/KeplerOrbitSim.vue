<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🪐</span>
        <h3>惑星の楕円軌道とケプラーの法則シミュレーター</h3>
      </div>
      <p class="subtitle">
        太陽を中心力とする万有引力下での天体運動。
        第1法則（楕円軌道と焦点）、第2法則（面積速度一定則：近日点で加速し遠日点で減速）、第3法則（T<sup>2</sup> ∝ a<sup>3</sup>）、および軌道エネルギー保存則 E = -GMm / 2a をリアルタイム軌道描画で直感的に完全理解できます。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="340"></canvas>
      <div class="orbit-badge">
        <span>面積速度: <strong>{{ (arealVelocityAU2PerYr).toFixed(2) }} AU²/yr (一定)</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>軌道離心率 <i>e</i>: <strong>{{ eccentricity.toFixed(2) }}</strong> ({{ eccentricity === 0 ? '真円' : (eccentricity > 0.5 ? '扁平な楕円' : '穏やかな楕円') }})</span>
            <input type="range" v-model.number="eccentricity" min="0.0" max="0.75" step="0.02" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>軌道長半径 <i>a</i>: <strong>{{ semiMajorAxisAU.toFixed(2) }} AU</strong></span>
            <input type="range" v-model.number="semiMajorAxisAU" min="1.0" max="4.0" step="0.2" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>等時間扇形（面積速度）の表示:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: showSectors }" @click="showSectors = !showSectors">
                {{ showSectors ? '等面積扇形を表示中' : '扇形を非表示' }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>プリセット天体:</span>
            <div class="btn-group">
              <button class="select-btn" @click="setPreset('earth')">地球 (e=0.02)</button>
              <button class="select-btn" @click="setPreset('mars')">火星 (e=0.09)</button>
              <button class="select-btn" @click="setPreset('comet')">ハレー彗星型 (e=0.65)</button>
            </div>
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (e = 0.40)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">公転周期 <i>T</i></span>
        <span class="value highlight">{{ orbitalPeriodYr.toFixed(2) }} <span class="unit">年</span></span>
        <span class="subtext">T = a<sup>3/2</sup> (第3法則)</span>
      </div>

      <div class="stat-card">
        <span class="label">近日点距離 <i>r</i><sub>p</sub> / 速度 <i>v</i><sub>p</sub></span>
        <span class="value">{{ perihelionDistAU.toFixed(2) }} <span class="unit">AU</span> / {{ perihelionSpeedKms.toFixed(1) }} <span class="unit">km/s</span></span>
        <span class="subtext"><i>r</i><sub>p</sub> = a(1 - e)（最速）</span>
      </div>

      <div class="stat-card">
        <span class="label">遠日点距離 <i>r</i><sub>a</sub> / 速度 <i>v</i><sub>a</sub></span>
        <span class="value">{{ aphelionDistAU.toFixed(2) }} <span class="unit">AU</span> / {{ aphelionSpeedKms.toFixed(1) }} <span class="unit">km/s</span></span>
        <span class="subtext"><i>r</i><sub>a</sub> = a(1 + e)（最遅）</span>
      </div>

      <div class="stat-card">
        <span class="label">全軌道力学的エネルギー <i>E</i></span>
        <span class="value">{{ totalEnergyRel.toFixed(2) }} <span class="unit">E₀</span></span>
        <span class="subtext">E = -GMm / 2a（長半径のみで決定）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const eccentricity = ref(0.40)   // e = 0.40
const semiMajorAxisAU = ref(2.0) // a = 2.0 AU
const showSectors = ref(true)

// ケプラー第3法則 T^2 = a^3  => T = a^(3/2) (年)
const orbitalPeriodYr = computed(() => Math.pow(semiMajorAxisAU.value, 1.5))

// 近日点・遠日点距離
const perihelionDistAU = computed(() => semiMajorAxisAU.value * (1 - eccentricity.value))
const aphelionDistAU = computed(() => semiMajorAxisAU.value * (1 + eccentricity.value))

// 速度 (地球の軌道速度 ~30 km/s を基準)
const perihelionSpeedKms = computed(() => {
  const e = eccentricity.value
  const a = semiMajorAxisAU.value
  return (29.78 / Math.sqrt(a)) * Math.sqrt((1 + e) / (1 - e))
})

const aphelionSpeedKms = computed(() => {
  const e = eccentricity.value
  const a = semiMajorAxisAU.value
  return (29.78 / Math.sqrt(a)) * Math.sqrt((1 - e) / (1 + e))
})

// 面積速度 h = 0.5 * r * v_perp = 0.5 * 2π a b / T = π a^2 sqrt(1 - e^2) / a^(1.5)
const arealVelocityAU2PerYr = computed(() => {
  const a = semiMajorAxisAU.value
  const e = eccentricity.value
  const b = a * Math.sqrt(1 - e * e)
  return (Math.PI * a * b) / orbitalPeriodYr.value
})

const totalEnergyRel = computed(() => -1.0 / semiMajorAxisAU.value)

function setPreset(type) {
  if (type === 'earth') {
    eccentricity.value = 0.02
    semiMajorAxisAU.value = 1.0
  } else if (type === 'mars') {
    eccentricity.value = 0.09
    semiMajorAxisAU.value = 1.52
  } else if (type === 'comet') {
    eccentricity.value = 0.65
    semiMajorAxisAU.value = 2.5
  }
}

function resetDefaults() {
  eccentricity.value = 0.40
  semiMajorAxisAU.value = 2.0
}

let animId = null
// ケプラー運動の真近点離角 f (ラジアン) または 離心近点角 E
let meanAnomaly = 0 // 平均近点角 M

// ケプラー方程式 M = E - e sin E をニュートン法で解く
function solveKepler(M, e) {
  let E = M
  for (let iter = 0; iter < 10; iter++) {
    const f = E - e * Math.sin(E) - M
    const fPrime = 1 - e * Math.cos(E)
    const delta = f / fPrime
    E -= delta
    if (Math.abs(delta) < 1e-6) break
  }
  return E
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

  // 軌道パラメータ
  const aScale = 65 // px / AU
  const a = semiMajorAxisAU.value * aScale
  const e = eccentricity.value
  const b = a * Math.sqrt(Math.max(0.01, 1 - e * e))
  const c = a * e // 焦点間半距離

  // 楕円の中心 (centerX, centerY)
  // 太陽の焦点 (sunX, sunY) を画面中心よりやや左に固定
  const sunX = w / 2 - 40
  const sunY = h / 2
  const ellipseCenterX = sunX + c
  const ellipseCenterY = sunY

  // 1. 楕円軌道パスの描画
  ctx.save()
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
  ctx.lineWidth = 1.8
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.ellipse(ellipseCenterX, ellipseCenterY, a, b, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // 長軸ライン
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(ellipseCenterX - a, ellipseCenterY)
  ctx.lineTo(ellipseCenterX + a, ellipseCenterY)
  ctx.stroke()
  ctx.restore()

  // 2. 平均近点角の進行 (アニメーション時間)
  // 近点・遠点での面積速度一定に厳密に従うケプラー解
  const dM = 0.018 / Math.sqrt(semiMajorAxisAU.value)
  meanAnomaly += dM
  if (meanAnomaly > Math.PI * 2) meanAnomaly -= Math.PI * 2

  // 3. 面積速度一定を示す等時間扇形（セクター）の描画
  if (showSectors.value) {
    const dtSector = 0.35 // ラジアン相当の等時間間隔
    // 近日点付近の扇形 (M = -dtSector/2 ~ dtSector/2)
    drawSector(ctx, sunX, sunY, a, b, c, -dtSector / 2, dtSector / 2, e, 'rgba(56, 189, 248, 0.22)', 'rgba(56, 189, 248, 0.6)')
    // 遠日点付近の扇形 (M = π - dtSector/2 ~ π + dtSector/2)
    drawSector(ctx, sunX, sunY, a, b, c, Math.PI - dtSector / 2, Math.PI + dtSector / 2, e, 'rgba(251, 191, 36, 0.22)', 'rgba(251, 191, 36, 0.6)')

    ctx.fillStyle = '#bae6fd'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('近日点扇形（太く短い面積）', sunX - (a - c) * 0.5, sunY - 35)
    ctx.fillStyle = '#fef08a'
    ctx.fillText('遠日点扇形（細く長い等面積）', sunX + (a + c) * 0.7, sunY - 35)
  }

  // 4. 太陽（第1焦点）の描画
  ctx.save()
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 22)
  sunGrad.addColorStop(0, '#ffffff')
  sunGrad.addColorStop(0.3, '#fef08a')
  sunGrad.addColorStop(0.6, '#f59e0b')
  sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)')
  ctx.fillStyle = sunGrad
  ctx.beginPath()
  ctx.arc(sunX, sunY, 22, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(sunX, sunY, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fef08a'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('太陽 (焦点 F₁)', sunX, sunY + 24)
  ctx.restore()

  // もうひとつの焦点 F2 (空の焦点)
  const emptyFocusX = ellipseCenterX + c
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
  ctx.beginPath()
  ctx.arc(emptyFocusX, sunY, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '10px sans-serif'
  ctx.fillText('焦点 F₂', emptyFocusX, sunY + 16)

  // 5. 惑星の位置計算（ケプラー方程式の数値解）
  const E_cur = solveKepler(meanAnomaly, e)
  // 楕円座標 (x = a cos E, y = b sin E)
  // 太陽中心座標系: 太陽は (c, 0)
  const planetX = ellipseCenterX - a * Math.cos(E_cur)
  const planetY = ellipseCenterY - b * Math.sin(E_cur)

  // 速度ベクトル: v_x = (a/r) v_0 ...
  // 微分: dx/dt ∝ a sin(E) dE/dt, dy/dt ∝ -b cos(E) dE/dt
  const r_cur = a * (1 - e * Math.cos(E_cur))
  const velFactor = 32 / r_cur
  const vx = -a * Math.sin(E_cur) * velFactor
  const vy = b * Math.cos(E_cur) * velFactor

  // 太陽と惑星を結ぶ動径ベクトル
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(sunX, sunY)
  ctx.lineTo(planetX, planetY)
  ctx.stroke()

  // 惑星本体の描画
  ctx.save()
  ctx.fillStyle = '#38bdf8'
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(planetX, planetY, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.restore()

  // 速度ベクトル矢印 (シアン)
  drawArrow(ctx, planetX, planetY, planetX + vx * 1.6, planetY + vy * 1.6, '#38bdf8', 'v')
  // 万有引力ベクトル矢印 (アンバー、太陽方向)
  const fgLen = Math.min(45, (1200 / (r_cur ** 2)) * 60)
  const dxSun = sunX - planetX
  const dySun = sunY - planetY
  const distSun = Math.hypot(dxSun, dySun)
  drawArrow(ctx, planetX, planetY, planetX + (dxSun / distSun) * fgLen, planetY + (dySun / distSun) * fgLen, '#f59e0b', 'F_g')

  animId = requestAnimationFrame(draw)
}

function drawSector(ctx, sunX, sunY, a, b, c, M_start, M_end, e, fillCol, strokeCol) {
  ctx.save()
  ctx.fillStyle = fillCol
  ctx.strokeStyle = strokeCol
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(sunX, sunY)

  const steps = 25
  for (let s = 0; s <= steps; s++) {
    const m = M_start + (s / steps) * (M_end - M_start)
    const E = solveKepler(m, e)
    const px = (sunX + c) - a * Math.cos(E)
    const py = sunY - b * Math.sin(E)
    ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 4) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
  ctx.stroke()

  const angle = Math.atan2(dy, dx)
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4))
  ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4))
  ctx.closePath()
  ctx.fill()

  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(label, x2 + 8 * Math.cos(angle), y2 + 8 * Math.sin(angle))
  ctx.restore()
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.orbit-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #38bdf8;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}
</style>
