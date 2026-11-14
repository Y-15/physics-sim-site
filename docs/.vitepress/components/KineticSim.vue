<template>
  <div class="lab" style="--ac:#f59e0b;--ac2:#ef4444">
    <div class="lab-head">
      <span class="lab-title">🔬 3D 気体分子運動論と二乗平均速度 実験室</span>
      <div class="head-badges">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ gasName }}（分子量 M = {{ molWeight }} g/mol）</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面 (fov=14)
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面 (fov=14)
        </button>
      </div>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: showImpulseArrows }" @click="showImpulseArrows = !showImpulseArrows">
          {{ showImpulseArrows ? '🏹 壁面力積・圧力ベクトル: ON' : '🏹 壁面力積・圧力ベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="isRunning = !isRunning" style="padding: 6px 15px; border-radius: 8px;">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.84rem;">
        ⏭ コマ送り
      </button>
      <button class="lab-btn" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.84rem;">
        🔄 リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-slow"></i>低速 → <i class="dot-mid"></i>中速 → <i class="dot-fast"></i>高速</span>
          <span class="legend-item"><i class="dot-wall"></i>壁 S 衝突閃光</span>
          <span class="legend-item"><i class="dot-p"></i>圧力 F = Nmv<sub>x</sub>²/L</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 非重複ステータスストリップ -->
    <div class="mode-status-strip">
      <span class="three-ortho-badge">
        P = N m v<sub>rms</sub>² / 3V ・ v<sub>rms</sub> = {{ vRms.toFixed(0) }} m/s ・ 最確速度 v<sub>p</sub> = {{ vProb.toFixed(0) }} m/s ・ 相対運動エネルギー比 (T/300) = {{ (tempK / 300).toFixed(2) }}×
      </span>
    </div>

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
        <div class="f">衝突力積 2<i>mv<sub>x</sub></i> の総和が「気体の圧力 <i>P</i>」を生み出す</div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const R = 8.314 // J/(mol·K)
const kB = 1.380649e-23 // J/K
const tempK = ref(300) // K
const gasType = ref('N2')
const particleCount = ref(70)
const activeCam = ref('3d')
const showImpulseArrows = ref(true)
const isRunning = ref(true)
const timeScale = ref(1.0)

const threeContainer = ref(null)
let threeCtx = null
let resizeObs = null
let lastIsMob = false

const gasProps = computed(() => {
  switch (gasType.value) {
    case 'H2': return { name: '水素分子 H₂', m_g: 2.0, color: 0x38bdf8 }
    case 'He': return { name: 'ヘリウム原子 He', m_g: 4.0, color: 0xa855f7 }
    case 'N2': return { name: '窒素分子 N₂ (空気の主成分)', m_g: 28.0, color: 0x10b981 }
    case 'O2': return { name: '酸素分子 O₂', m_g: 32.0, color: 0xef4444 }
    case 'CO2': return { name: '二酸化炭素 CO₂', m_g: 44.0, color: 0xf59e0b }
  }
})

const gasName = computed(() => gasProps.value.name)
const molWeight = computed(() => gasProps.value.m_g)

function setGas(t) {
  gasType.value = t
}

// v_rms = sqrt(3 * R * T / M_kg)
const vRms = computed(() => {
  const m_kg = molWeight.value * 1e-3
  return Math.sqrt((3 * R * tempK.value) / m_kg)
})

// 最確速度 v_p = sqrt(2 * R * T / M_kg) = sqrt(2/3) * v_rms
const vProb = computed(() => vRms.value * Math.sqrt(2 / 3))

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

// 衝突頻度
const collisionRate = computed(() => {
  return particleCount.value * (vRms.value / 400) * 12
})

// 速度分布X軸上限 (H2 800K でも収まる動的スケーリング)
const vAxisMax = computed(() => {
  return Math.max(2000, Math.ceil((vRms.value * 1.65) / 500) * 500)
})

// ==========================================================
// カメラ & モバイルレスポンシブ補助
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(2.25, Math.max(1.42, 1.82 / Math.max(0.68, aspect))) : 1.0
}

function isMobileViewport() {
  if (!threeContainer.value) return false
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  return w / Math.max(1, h) < 1.35
}

function getCamParams(preset) {
  const s = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.25, 45.0 * s], target: [0, 0.1, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 45.0 * s, 0.05], target: [0, 0.12, 0], fov: 14 }
  }
  return { pos: [0.45 * s, 5.0 * s, 14.2 * s], target: [0, 0.1, 0], fov: 40 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.46) {
  const mob = isMobileViewport()
  const targetH = mob ? baseScale * 1.58 : baseScale
  const sig = `${textStr}|${color}|${borderColor}`
  if (labelCache.get(sprite) !== sig) {
    labelCache.set(sprite, sig)
    sprite.updateText(textStr, color, borderColor)
  }
  const curAspect = sprite.scale.x / Math.max(0.01, sprite.scale.y)
  if (Math.abs(sprite.scale.y - targetH) > 0.004) {
    sprite.scale.set(targetH * curAspect, targetH, 1)
  }
}

// 速度カラーグラデーション (#38bdf8 slow -> #10b981 medium -> #f97316 -> #ef4444 fast)
const COL_SLOW = new THREE.Color(0x38bdf8)
const COL_MID = new THREE.Color(0x10b981)
const COL_WARM = new THREE.Color(0xf97316)
const COL_FAST = new THREE.Color(0xef4444)

function speedColor(physicalSpeed, outColor = new THREE.Color()) {
  const u = Math.min(1, Math.max(0, Math.pow(physicalSpeed / 1700, 0.72)))
  if (u < 0.42) outColor.copy(COL_SLOW).lerp(COL_MID, u / 0.42)
  else if (u < 0.78) outColor.copy(COL_MID).lerp(COL_WARM, (u - 0.42) / 0.36)
  else outColor.copy(COL_WARM).lerp(COL_FAST, (u - 0.78) / 0.22)
  return outColor
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
let sceneObjs = null
const MAX_PARTICLES = 150
const NUM_BINS = 16
const MAX_FLASH_RINGS = 8

function sampleParticles() {
  if (!sceneObjs) return
  const { particleData, half } = sceneObjs
  const spread = half - 0.16
  particleData.length = 0
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const u1 = Math.random(), u2 = Math.random(), u3 = Math.random(), u4 = Math.random()
    const g1 = Math.sqrt(-2 * Math.log(u1 + 1e-6)) * Math.cos(2 * Math.PI * u2)
    const g2 = Math.sqrt(-2 * Math.log(u1 + 1e-6)) * Math.sin(2 * Math.PI * u2)
    const g3 = Math.sqrt(-2 * Math.log(u3 + 1e-6)) * Math.cos(2 * Math.PI * u4)
    const relSpeed = Math.hypot(g1, g2, g3) / Math.sqrt(3)
    particleData.push({
      x: (Math.random() - 0.5) * 2 * spread,
      y: (Math.random() - 0.5) * 2 * spread,
      z: (Math.random() - 0.5) * 2 * spread,
      vx: g1,
      vy: g2,
      vz: g3,
      relSpeed
    })
  }
}

function updateParticleColorsAndHistogram() {
  if (!sceneObjs) return
  const { instancedParticles, particleData, histBars, axOrigin, axW, axH } = sceneObjs
  const curVRms = vRms.value
  const activeCount = particleCount.value
  const vMax = vAxisMax.value
  const col = new THREE.Color()

  const counts = new Array(NUM_BINS).fill(0)
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particleData[i]
    const vPhys = p.relSpeed * curVRms
    speedColor(vPhys, col)
    instancedParticles.setColorAt(i, col)
    if (i < activeCount) {
      const bin = Math.min(NUM_BINS - 1, Math.max(0, Math.floor((vPhys / vMax) * NUM_BINS)))
      counts[bin]++
    }
  }
  if (instancedParticles.instanceColor) instancedParticles.instanceColor.needsUpdate = true

  // 理論ピーク位置とヒストグラムの最大値を比較して見やすくスケーリング
  const maxBin = Math.max(1, ...counts)
  const barW = (axW / NUM_BINS) * 0.78
  for (let b = 0; b < NUM_BINS; b++) {
    const bar = histBars[b]
    const h = (counts[b] / maxBin) * (axH * 0.78)
    bar.mesh.scale.set(barW, Math.max(0.015, h), 1)
    bar.mesh.position.set(
      axOrigin.x + ((b + 0.5) / NUM_BINS) * axW,
      axOrigin.y,
      0.015
    )
    const vMid = ((b + 0.5) / NUM_BINS) * vMax
    speedColor(vMid, bar.mat.color)
  }
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const ch = group.children[0]
    group.remove(ch)
    if (ch.geometry) ch.geometry.dispose()
    if (ch.material) {
      if (Array.isArray(ch.material)) ch.material.forEach(m => m.dispose())
      else ch.material.dispose()
    }
  }
}

function rebuildDistributionCurve() {
  if (!sceneObjs) return
  const { curveContainer, labelVrms, labelVAxis, axOrigin, axW, axH } = sceneObjs
  clearGroup(curveContainer)

  const vMax = vAxisMax.value
  const m_kg = molWeight.value * 1e-3
  const curT = tempK.value
  const samples = 72
  const rawPts = []
  let peakProb = 0

  // 3D マクスウェル＝ボルツマン速度分布 f(v) ∝ v^2 * exp(-m v^2 / (2 k_B T))
  for (let i = 0; i <= samples; i++) {
    const v = (i / samples) * vMax
    const expTerm = Math.exp(-(m_kg * v * v) / (2 * R * curT))
    const prob = v * v * expTerm
    rawPts.push({ i, v, prob })
    if (prob > peakProb) peakProb = prob
  }

  const pts3D = rawPts.map(({ i, prob }) => {
    const x = axOrigin.x + (i / samples) * axW
    const y = axOrigin.y + (peakProb > 0 ? (prob / peakProb) * (axH * 0.84) : 0)
    return new THREE.Vector3(x, y, 0.05)
  })

  const curve = new THREE.CatmullRomCurve3(pts3D)
  const tubeGeo = new THREE.TubeGeometry(curve, 68, 0.044, 10, false)
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45
  })
  curveContainer.add(new THREE.Mesh(tubeGeo, tubeMat))

  // 曲線下の半透明塗りつぶし (depthWrite: false, renderOrder: 0)
  const shape = new THREE.Shape()
  shape.moveTo(axOrigin.x, axOrigin.y)
  pts3D.forEach((p) => shape.lineTo(p.x, p.y))
  shape.lineTo(axOrigin.x + axW, axOrigin.y)
  shape.closePath()
  const fillMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  fillMesh.renderOrder = 0
  curveContainer.add(fillMesh)

  // v_rms 垂直インジケータービーム & 光る球
  const vRmsNorm = Math.min(0.96, vRms.value / vMax)
  const vx = axOrigin.x + vRmsNorm * axW
  const beamCurve = new THREE.LineCurve3(
    new THREE.Vector3(vx, axOrigin.y, 0.08),
    new THREE.Vector3(vx, axOrigin.y + axH * 0.89, 0.08)
  )
  curveContainer.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(beamCurve, 6, 0.032, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    )
  )

  const vDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  )
  vDot.position.set(vx, axOrigin.y, 0.09)
  curveContainer.add(vDot)

  // 最確速度 v_p のサブマーカー
  const vPNorm = Math.min(0.94, vProb.value / vMax)
  const vpx = axOrigin.x + vPNorm * axW
  const vpDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  vpDot.position.set(vpx, axOrigin.y + axH * 0.84, 0.08)
  curveContainer.add(vpDot)

  updateParticleColorsAndHistogram()
  syncLabels()

  labelVrms.position.set(
    Math.min(1.55, vx + 1.12),
    axOrigin.y + axH * 0.58,
    0.52
  )
  void labelVAxis
}

function syncLabels() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const { labelTitle, labelVrms, labelVAxis, labelBox, labelPressure, labelWallS } = sceneObjs

  updateLabelCached(
    labelTitle,
    mob ? '📊 速度分布 f(v)' : '📊 マクスウェル速度分布 f(v)',
    '#fde68a', '#f59e0b', 0.46
  )
  updateLabelCached(
    labelVrms,
    `v_rms = ${vRms.value.toFixed(0)} m/s`,
    '#fca5a5', '#ef4444', 0.46
  )
  updateLabelCached(
    labelVAxis,
    mob ? `速さ v [0〜${vAxisMax.value}m/s] →` : `分子の速さ v [0 〜 ${vAxisMax.value} m/s] →`,
    '#cbd5e1', 'rgba(148,163,184,0.42)', 0.46
  )
  updateLabelCached(
    labelBox,
    mob ? '📦 容器 (一辺L, V=L³)' : '📦 3D 立方体容器 (一辺 L, 体積 V = L³)',
    '#fde68a', 'rgba(251,191,36,0.5)', 0.46
  )
  updateLabelCached(
    labelPressure,
    mob ? '圧力 P=Nmv²/3V' : '壁面圧力 P = N m v_rms² / 3V',
    '#fca5a5', '#ef4444', 0.46
  )
  updateLabelCached(
    labelWallS,
    mob ? '壁S: F=Nmvₓ²/L' : '壁 S (x=L): F = N m vₓ² / L',
    '#7dd3fc', '#38bdf8', 0.45
  )
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 160,
    onFrame: (dt) => {
      if (isRunning.value) {
        updateFrame(dt * timeScale.value, false)
      } else {
        updateFrame(0, true)
      }
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        syncLabels()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.4, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D 透明ガラス立方体容器 (x = -3.35)
  // ======================================================
  const boxGroup = new THREE.Group()
  boxGroup.position.set(-3.35, 0.05, 0)
  scene.add(boxGroup)

  const boxSize = 3.45
  const half = boxSize / 2

  const cubeGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
  const cubeMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.05,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat)
  cubeMesh.renderOrder = 0
  boxGroup.add(cubeMesh)

  const cubeEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(cubeGeo),
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.72 })
  )
  boxGroup.add(cubeEdges)

  // 6面それぞれの衝突フラッシュ発光パネル (depthWrite: false, renderOrder: 0)
  const faceDefs = [
    { dir: new THREE.Vector3(1, 0, 0), pos: [half, 0, 0], rot: [0, Math.PI / 2, 0], isWallS: true },
    { dir: new THREE.Vector3(-1, 0, 0), pos: [-half, 0, 0], rot: [0, -Math.PI / 2, 0], isWallS: false },
    { dir: new THREE.Vector3(0, 1, 0), pos: [0, half, 0], rot: [-Math.PI / 2, 0, 0], isWallS: false },
    { dir: new THREE.Vector3(0, -1, 0), pos: [0, -half, 0], rot: [Math.PI / 2, 0, 0], isWallS: false },
    { dir: new THREE.Vector3(0, 0, 1), pos: [0, 0, half], rot: [0, 0, 0], isWallS: false },
    { dir: new THREE.Vector3(0, 0, -1), pos: [0, 0, -half], rot: [0, Math.PI, 0], isWallS: false }
  ]

  const panelGeo = new THREE.PlaneGeometry(boxSize - 0.04, boxSize - 0.04)
  const wallWalls = faceDefs.map((f) => {
    const pMat = new THREE.MeshBasicMaterial({
      color: f.isWallS ? 0x38bdf8 : 0xf43f5e,
      transparent: true,
      opacity: f.isWallS ? 0.15 : 0.02,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const pMesh = new THREE.Mesh(panelGeo, pMat)
    pMesh.position.set(...f.pos)
    pMesh.rotation.set(...f.rot)
    pMesh.renderOrder = 0
    boxGroup.add(pMesh)

    // 壁 S (+X面) を青枠ハイライト (教科書図解と対応)
    if (f.isWallS) {
      const sEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(panelGeo),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 })
      )
      sEdges.position.set(half + 0.005, 0, 0)
      sEdges.rotation.set(0, Math.PI / 2, 0)
      boxGroup.add(sEdges)
    }

    const arr = createVectorArrow3D({
      color: f.isWallS ? 0xef4444 : 0xf43f5e,
      shaftRadius: f.isWallS ? 0.058 : 0.042,
      headRadius: f.isWallS ? 0.165 : 0.13,
      headLength: f.isWallS ? 0.36 : 0.28
    })
    boxGroup.add(arr)

    return { dir: f.dir, isWallS: f.isWallS, panelMat: pMat, arrow: arr, pulse: 0 }
  })

  // 壁 S 衝突点の波紋フラッシュリングプール (depthWrite: false, renderOrder: 0)
  const flashRingGeo = new THREE.RingGeometry(0.11, 0.18, 24)
  const flashRings = []
  for (let i = 0; i < MAX_FLASH_RINGS; i++) {
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const rMesh = new THREE.Mesh(flashRingGeo, rMat)
    rMesh.rotation.y = Math.PI / 2
    rMesh.visible = false
    rMesh.renderOrder = 0
    boxGroup.add(rMesh)
    flashRings.push({ mesh: rMesh, mat: rMat, life: 0 })
  }

  // 一辺 L の寸法バー
  const dimMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  const dimBar = new THREE.Mesh(new THREE.BoxGeometry(boxSize, 0.032, 0.032), dimMat)
  dimBar.position.set(0, -half - 0.24, half + 0.12)
  const tickL = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.16, 0.032), dimMat)
  tickL.position.set(-half, -half - 0.24, half + 0.12)
  const tickR = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.16, 0.032), dimMat)
  tickR.position.set(half, -half - 0.24, half + 0.12)
  boxGroup.add(dimBar, tickL, tickR)

  // InstancedMesh による 3D 速度色分け気体分子群 (最大 150 個)
  const sphereGeo = new THREE.SphereGeometry(0.098, 14, 14)
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1
  })
  const instancedParticles = new THREE.InstancedMesh(sphereGeo, sphereMat, MAX_PARTICLES)
  instancedParticles.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  boxGroup.add(instancedParticles)

  // 3D ラベル (3視点非重複配置)
  const labelBox = createTextSprite('📦 立方体容器', {
    color: '#fde68a',
    borderColor: 'rgba(251,191,36,0.5)',
    fontSize: 32,
    scale: 0.46
  })
  labelBox.position.set(0, -2.52, 1.18)
  boxGroup.add(labelBox)

  const labelPressure = createTextSprite('壁面圧力 P', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    fontSize: 32,
    scale: 0.46
  })
  labelPressure.position.set(-0.35, 2.95, -0.85)
  boxGroup.add(labelPressure)

  const labelWallS = createTextSprite('壁 S', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 30,
    scale: 0.45
  })
  labelWallS.position.set(half + 0.72, 1.38, 1.08)
  boxGroup.add(labelWallS)

  // ======================================================
  // 2. 右側: 3D マクスウェル＝ボルツマン速度分布 f(v) + 実時間ヒストグラム (x = +3.1)
  // ======================================================
  const distGroup = new THREE.Group()
  distGroup.position.set(3.1, 0.05, 0)
  scene.add(distGroup)

  const boardW = 5.6
  const boardH = 4.3
  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(boardW, boardH),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  boardBack.position.set(0, 0, -0.08)
  boardBack.renderOrder = 0
  distGroup.add(boardBack)

  const axOrigin = new THREE.Vector3(-2.32, -1.68, 0)
  const axW = 4.68
  const axH = 3.35

  const vAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.03, headRadius: 0.1, headLength: 0.24 })
  vAx.setVector(axOrigin, new THREE.Vector3(1, 0, 0), axW + 0.22)
  distGroup.add(vAx)

  const fAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.03, headRadius: 0.1, headLength: 0.24 })
  fAx.setVector(axOrigin, new THREE.Vector3(0, 1, 0), axH + 0.22)
  distGroup.add(fAx)

  // 粒子ヒストグラム 3D バー群
  const unitBarGeo = new THREE.BoxGeometry(1, 1, 0.09)
  unitBarGeo.translate(0, 0.5, 0)
  const histBars = []
  for (let b = 0; b < NUM_BINS; b++) {
    const bMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    })
    const bMesh = new THREE.Mesh(unitBarGeo, bMat)
    bMesh.renderOrder = 0
    distGroup.add(bMesh)
    histBars.push({ mesh: bMesh, mat: bMat })
  }

  const labelTitle = createTextSprite('📊 マクスウェル速度分布 f(v)', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 32,
    scale: 0.46
  })
  labelTitle.position.set(-0.32, 2.66, -0.78)
  distGroup.add(labelTitle)

  const labelVAxis = createTextSprite('分子の速さ v →', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.42)',
    fontSize: 30,
    scale: 0.46
  })
  labelVAxis.position.set(0.25, -2.52, 1.25)
  distGroup.add(labelVAxis)

  const curveContainer = new THREE.Group()
  distGroup.add(curveContainer)

  const labelVrms = createTextSprite('v_rms = 517 m/s', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    fontSize: 32,
    scale: 0.45
  })
  distGroup.add(labelVrms)

  sceneObjs = {
    half,
    instancedParticles,
    particleData: [],
    dummy: new THREE.Object3D(),
    wallWalls,
    flashRings,
    ringIdx: 0,
    histBars,
    curveContainer,
    labelTitle,
    labelVrms,
    labelVAxis,
    labelBox,
    labelPressure,
    labelWallS,
    axOrigin,
    axW,
    axH
  }

  sampleParticles()
  rebuildDistributionCurve()
  updateFrame(0, true)
}

function triggerWallSFlash(y, z) {
  if (!sceneObjs) return
  const ring = sceneObjs.flashRings[sceneObjs.ringIdx % MAX_FLASH_RINGS]
  sceneObjs.ringIdx++
  ring.mesh.position.set(sceneObjs.half - 0.01, y, z)
  ring.mesh.scale.setScalar(0.5)
  ring.mesh.visible = true
  ring.mat.opacity = 0.95
  ring.life = 1.0
}

function updateFrame(dt, forceMatrix = false) {
  if (!sceneObjs) return
  const { half, instancedParticles, particleData, dummy, wallWalls, flashRings } = sceneObjs

  const limit = half - 0.13
  const speedScale = (vRms.value / 500) * 1.1
  const activeCount = particleCount.value

  if (dt > 0) {
    wallWalls.forEach((w) => {
      w.pulse = Math.max(0, w.pulse - dt * 3.4)
    })
    flashRings.forEach((r) => {
      if (r.life > 0) {
        r.life = Math.max(0, r.life - dt * 3.8)
        const s = 0.5 + (1 - r.life) * 2.4
        r.mesh.scale.setScalar(s)
        r.mat.opacity = r.life * 0.9
        if (r.life <= 0) r.mesh.visible = false
      }
    })
  }

  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (i >= activeCount) {
      if (forceMatrix || dt > 0) {
        dummy.position.set(0, -999, 0)
        dummy.scale.setScalar(0.001)
        dummy.updateMatrix()
        instancedParticles.setMatrixAt(i, dummy.matrix)
      }
      continue
    }

    const p = particleData[i]
    if (dt > 0) {
      p.x += p.vx * speedScale * dt
      p.y += p.vy * speedScale * dt
      p.z += p.vz * speedScale * dt

      if (p.x > limit) {
        p.x = limit; p.vx *= -1
        wallWalls[0].pulse = 0.45
        triggerWallSFlash(p.y, p.z)
      }
      if (p.x < -limit) { p.x = -limit; p.vx *= -1; wallWalls[1].pulse = 0.35 }
      if (p.y > limit) { p.y = limit; p.vy *= -1; wallWalls[2].pulse = 0.35 }
      if (p.y < -limit) { p.y = -limit; p.vy *= -1; wallWalls[3].pulse = 0.35 }
      if (p.z > limit) { p.z = limit; p.vz *= -1; wallWalls[4].pulse = 0.35 }
      if (p.z < -limit) { p.z = -limit; p.vz *= -1; wallWalls[5].pulse = 0.35 }
    }

    dummy.position.set(p.x, p.y, p.z)
    dummy.scale.setScalar(1.0)
    dummy.updateMatrix()
    instancedParticles.setMatrixAt(i, dummy.matrix)
  }
  instancedParticles.instanceMatrix.needsUpdate = true

  // 壁面フラッシュ & 圧力ベクトル矢印
  const baseLen = Math.min(1.18, 0.38 + (tempK.value / 400) * (particleCount.value / 75) * 0.42)
  wallWalls.forEach((w) => {
    w.panelMat.opacity = (w.isWallS ? 0.14 : 0.02) + w.pulse * (w.isWallS ? 0.65 : 0.35)
    if (!showImpulseArrows.value) {
      w.arrow.visible = false
      return
    }
    const origin = w.dir.clone().multiplyScalar(half)
    const boost = w.isWallS ? 1.15 : 1.0
    w.arrow.setVector(origin, w.dir, (baseLen + w.pulse * 0.65) * boost)
  })
}

function stepSim() {
  isRunning.value = false
  updateFrame(0.045 * timeScale.value, true)
}

function resetSim() {
  tempK.value = 300
  gasType.value = 'N2'
  particleCount.value = 70
  isRunning.value = true
  sampleParticles()
  rebuildDistributionCurve()
  updateFrame(0, true)
}

watch([tempK, gasType, particleCount], () => {
  rebuildDistributionCurve()
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (resizeObs) {
    resizeObs.disconnect()
    resizeObs = null
  }
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.lab {
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.head-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.68);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}

.preset-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
}

.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.playback-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 9px 16px;
  background: rgba(15, 23, 42, 0.56);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.speed-label {
  font-size: 0.78rem;
  color: #cbd5e1;
  font-weight: 600;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.speed-btn-group button {
  padding: 4px 9px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-btn-group button:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}

.speed-btn-group button.active {
  background: #f59e0b;
  color: #090d16;
  font-weight: 700;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.three-viewport {
  width: 100%;
  height: 100%;
}

.three-hud-top {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
}

.three-hud-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.74rem;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot-slow { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-mid { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-fast { background: #f97316; box-shadow: 0 0 6px #ef4444; }
.dot-wall { background: #fef08a; box-shadow: 0 0 6px #38bdf8; }
.dot-p { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  right: 12px;
  pointer-events: none;
}

.three-hud-hint {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
}

.mode-status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 16px;
  background: rgba(9, 13, 22, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.three-ortho-badge {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #fde68a;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

@media (max-width: 640px) {
  .three-viewport-wrap {
    height: 330px;
  }

  .speed-control-group {
    border-radius: 10px !important;
    flex-wrap: wrap !important;
    width: 100%;
    justify-content: space-between;
  }

  .three-hud-legend {
    font-size: 0.68rem;
    gap: 7px;
    padding: 4px 8px;
  }
}
</style>
