<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚖️</span>
        <h3>3D 2体問題・重心運動と相対運動（ばね連結 ＆ 連星軌道）シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">外力がない2体系では、重心 G は等速直線運動（または静止）し、2物体は重心から見て逆位相で運動（単振動または共通重心公転）します。換算質量 μ = m₁m₂/(m₁+m₂) の本質を3Dで体感できます。</p>
    </div>

    <!-- システムモード切替タブ -->
    <div class="sys-mode-tabs">
      <button :class="{ active: systemType === 'spring' }" @click="switchSystem('spring')">
        🔩 ばね連結2体問題（重心等速運動 ＋ 相対単振動）
      </button>
      <button :class="{ active: systemType === 'binary' }" @click="switchSystem('binary')">
        🌟 万有引力・連星2体問題（共通重心 G のまわりの公転）
      </button>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <div class="preset-group">
        <span class="preset-label">🎥 カメラ視点:</span>
        <button class="cam-chip" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          ⭕ 真上視点（重心Gと軌道確認）
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
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
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
      <button class="btn btn-secondary" @click="toggleView" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; border-color: #38bdf8; color: #38bdf8;">
        👀 座標系切替 ({{ viewMode === 'lab' ? '重心系へ' : '実験室系へ' }})
      </button>
    </div>

    <div class="mode-status-strip">
      <div class="mode-badge" :class="systemType === 'binary' ? 'com' : viewMode">
        {{ systemType === 'binary' ? '連星モード: 共通重心 G固定' : (viewMode === 'lab' ? '視点: 実験室系 (床静止)' : '視点: 重心静止系 (重心G固定)') }}
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-m1"></i>物体1 <b>m₁</b></span>
          <span class="legend-item"><i class="dot-m2"></i>物体2 <b>m₂</b></span>
          <span class="legend-item"><i class="dot-g"></i>重心 <b>G</b> (r₁:r₂ = m₂:m₁)</span>
          <span class="legend-item"><i class="dot-f"></i>内力 <b>F</b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>物体1 質量 <i>m</i><sub>1</sub>: <strong>{{ m1.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="m1" min="0.5" max="5.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>物体2 質量 <i>m</i><sub>2</sub>: <strong>{{ m2.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="m2" min="0.5" max="5.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>ばね定数 <i>k</i>: <strong>{{ k.toFixed(0) }} N/m</strong></span>
            <input type="range" v-model.number="k" min="10" max="100" step="5" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>物体1 初速度 <i>v</i><sub>10</sub>: <strong>{{ v1_init.toFixed(1) }} m/s</strong></span>
            <input type="range" v-model.number="v1_init" min="-4" max="4" step="0.5" @input="resetSim" />
          </label>
        </div>
      </div>
    </div>

    <!-- 物理量リアルタイム表示モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">重心速度 <i>v</i><sub><i>G</i></sub> (一定)</span>
        <span class="value" style="color:#c084fc">{{ vG.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext"><span class="frac"><span class="num"><i>m</i><sub>1</sub><i>v</i><sub>1</sub> + <i>m</i><sub>2</sub><i>v</i><sub>2</sub></span><span class="den"><i>m</i><sub>1</sub> + <i>m</i><sub>2</sub></span></span></span>
      </div>

      <div class="stat-card">
        <span class="label">換算質量 μ</span>
        <span class="value" style="color:#38bdf8">{{ mu.toFixed(2) }} <span class="unit">kg</span></span>
        <span class="subtext"><span class="frac"><span class="num"><i>m</i><sub>1</sub><i>m</i><sub>2</sub></span><span class="den"><i>m</i><sub>1</sub> + <i>m</i><sub>2</sub></span></span></span>
      </div>

      <div class="stat-card">
        <span class="label">相対単振動の周期 <i>T</i></span>
        <span class="value" style="color:#10b981">{{ period.toFixed(2) }} <span class="unit">s</span></span>
        <span class="subtext">2π<span class="math-radical">√</span><span class="math-radicand"><span class="frac"><span class="num">μ</span><span class="den"><i>k</i></span></span></span></span>
      </div>

      <div class="stat-card">
        <span class="label">ばねの伸び縮み Δ <i>x</i></span>
        <span class="value" :class="{ positive: deltaX > 0.02, negative: deltaX < -0.02 }">
          {{ deltaX > 0 ? '+' : '' }}{{ (deltaX * 100).toFixed(1) }} <span class="unit">cm</span>
        </span>
        <span class="subtext">{{ deltaX > 0.01 ? '伸び (引力)' : (deltaX < -0.01 ? '縮み (斥力)' : '自然長') }}</span>
      </div>
    </div>

    <!-- エネルギー内訳バー -->
    <div class="energy-card">
      <div class="energy-header">
        <span>力学的エネルギー保存の内訳 (全エネルギー <i>E</i> = {{ totalE.toFixed(1) }} <i>J</i>)</span>
      </div>
      <div class="energy-bar">
        <div class="bar-segment trans" :style="{ width: transEPercent + '%' }" title="重心並進エネルギー"></div>
        <div class="bar-segment rel" :style="{ width: relEPercent + '%' }" title="相対運動エネルギー"></div>
        <div class="bar-segment spring" :style="{ width: springEPercent + '%' }" title="ばね弾性エネルギー"></div>
      </div>
      <div class="legend-row">
        <div class="legend-item"><span class="dot trans"></span>重心並進: {{ transE.toFixed(1) }} J (一定)</div>
        <div class="legend-item"><span class="dot rel"></span>相対運動: {{ relE.toFixed(1) }} J</div>
        <div class="legend-item"><span class="dot spring"></span>ばね弾性: {{ springE.toFixed(1) }} J</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjs = null

const isRunning = ref(true)
const timeScale = ref(0.5)
const viewMode = ref('lab') // 'lab' or 'com'
const systemType = ref('spring') // 'spring' or 'binary'
const activeCam = ref('3d')

// 物理パラメータ
const m1 = ref(1.0) // kg
const m2 = ref(2.0) // kg
const k = ref(40.0) // N/m
const v1_init = ref(3.0) // m/s
const naturalLength = 1.6 // m

// 状態変数
const x1 = ref(1.0)
const v1 = ref(3.0)
const x2 = ref(2.6)
const v2 = ref(0.0)
let binaryAngle = 0

// 重心位置
const xG = computed(() => (m1.value * x1.value + m2.value * x2.value) / (m1.value + m2.value))
const vG = computed(() => (m1.value * v1.value + m2.value * v2.value) / (m1.value + m2.value))
const mu = computed(() => (m1.value * m2.value) / (m1.value + m2.value))
const period = computed(() => 2 * Math.PI * Math.sqrt(mu.value / k.value))
const deltaX = computed(() => (x2.value - x1.value) - naturalLength)

// エネルギー
const totalMass = computed(() => m1.value + m2.value)
const transE = computed(() => 0.5 * totalMass.value * (vG.value ** 2))
const relV = computed(() => v2.value - v1.value)
const relE = computed(() => 0.5 * mu.value * (relV.value ** 2))
const springE = computed(() => 0.5 * k.value * (deltaX.value ** 2))
const totalE = computed(() => transE.value + relE.value + springE.value)

const transEPercent = computed(() => totalE.value > 0 ? (transE.value / totalE.value) * 100 : 0)
const relEPercent = computed(() => totalE.value > 0 ? (relE.value / totalE.value) * 100 : 0)
const springEPercent = computed(() => totalE.value > 0 ? (springE.value / totalE.value) * 100 : 0)

function switchSystem(type) {
  systemType.value = type
  if (type === 'binary') {
    setCameraPreset('3d')
  }
  updateFrame()
}

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 390
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.60, Math.max(1.32, 1.40 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.65, 44.0 * ms], target: [0, 0.45, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 46.0 * ms, 0.45], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0, 6.8 * ms, 12.6 * ms], target: [0, 0.35, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

const togglePlay = () => {
  isRunning.value = !isRunning.value
}

const stepForward = () => {
  step(0.04)
  updateFrame()
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'lab' ? 'com' : 'lab'
  updateFrame()
}

const resetSim = () => {
  x1.value = 1.0
  v1.value = v1_init.value
  x2.value = 1.0 + naturalLength
  v2.value = 0.0
  binaryAngle = 0
  updateFrame()
}

const updatePhysics = () => {
  updateFrame()
}

const step = (dt) => {
  const steps = 10
  const subDt = dt / steps

  for (let s = 0; s < steps; s++) {
    const curDelta = (x2.value - x1.value) - naturalLength
    const springForce = -k.value * curDelta

    const a1 = -springForce / m1.value
    const a2 = springForce / m2.value

    v1.value += a1 * subDt
    v2.value += a2 * subDt

    x1.value += v1.value * subDt
    x2.value += v2.value * subDt
  }

  if (xG.value > 3.8) {
    const shift = 2.8
    x1.value -= shift
    x2.value -= shift
  } else if (xG.value < 0.4) {
    const shift = 2.8
    x1.value += shift
    x2.value += shift
  }

  const omegaBin = Math.sqrt(k.value / (mu.value * 12))
  binaryAngle += omegaBin * dt
}

function createUnitHelixGeometry(coils = 10, radius = 0.28, tubeRadius = 0.045) {
  const pts = []
  const samples = coils * 24
  pts.push(new THREE.Vector3(0, 0, 0))
  pts.push(new THREE.Vector3(0.05, 0, 0))
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    const x = 0.05 + u * 0.9
    const angle = u * coils * Math.PI * 2
    pts.push(new THREE.Vector3(x, radius * Math.sin(angle), radius * Math.cos(angle)))
  }
  pts.push(new THREE.Vector3(0.95, 0, 0))
  pts.push(new THREE.Vector3(1.0, 0, 0))
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, samples * 2, tubeRadius, 10, false)
}

function initThree() {
  if (!threeContainer.value) return
  const init = getCamParams('3d')
  lastIsMob = getMobScale() > 1.01
  threeCtx = createThreeScene(threeContainer.value, {
    fov: init.fov,
    initialCamPos: init.pos,
    initialTarget: init.target,
    onFrame: (dt) => {
      if (isRunning.value) {
        step(dt * timeScale.value)
      }
      updateFrame()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.01
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // 床面グリッド (ラベルと重ならないよう下げる)
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.y = -1.12
  scene.add(grid)

  // ばねモード用の滑らかな水平スライドレール (明るめスレート + シアン縁取り)
  const railGroup = new THREE.Group()
  const railGeo = new THREE.BoxGeometry(11.6, 0.1, 0.3)
  const railBar = new THREE.Mesh(
    railGeo,
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.65, roughness: 0.25 })
  )
  railBar.position.y = -0.62
  railGroup.add(railBar)
  const railEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(railGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
  )
  railEdges.position.y = -0.62
  railGroup.add(railEdges)
  for (const sx of [-4.6, 0, 4.6]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 })
    )
    leg.position.set(sx, -0.89, 0)
    railGroup.add(leg)
  }
  scene.add(railGroup)

  // 物体 1 (シアン球体) & 物体 2 (アンバー球体)
  const body1Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.3
    })
  )
  const body2Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.3
    })
  )
  scene.add(body1Mesh, body2Mesh)

  // 重心 G マーカー (パープル発光球 + 垂直ポール)
  const comGroup = new THREE.Group()
  const comSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.7 })
  )
  comSphere.position.y = 1.45
  comGroup.add(comSphere)

  const comPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 2.0, 12),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.65 })
  )
  comPole.position.y = 0.45
  comGroup.add(comPole)
  scene.add(comGroup)

  // 3D コイルばね (spring モード用)
  const springGeo = createUnitHelixGeometry(10, 0.26, 0.045)
  const springMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    emissive: 0x475569,
    emissiveIntensity: 0.3,
    metalness: 0.75,
    roughness: 0.2
  })
  const springMesh = new THREE.Mesh(springGeo, springMat)
  scene.add(springMesh)

  // 連星軌道リング 1 & 2 (binary モード用)
  const orbit1Geo = new THREE.TorusGeometry(1, 0.03, 16, 96)
  orbit1Geo.rotateX(Math.PI / 2)
  const orbit1Mesh = new THREE.Mesh(
    orbit1Geo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
  )
  const orbit2Geo = new THREE.TorusGeometry(1, 0.03, 16, 96)
  orbit2Geo.rotateX(Math.PI / 2)
  const orbit2Mesh = new THREE.Mesh(
    orbit2Geo,
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55 })
  )
  scene.add(orbit1Mesh, orbit2Mesh)

  // 連星を結ぶ重心棒ライン
  const tetherGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
  const tetherLine = new THREE.Line(
    tetherGeo,
    new THREE.LineDashedMaterial({ color: 0xc084fc, dashSize: 0.18, gapSize: 0.12 })
  )
  scene.add(tetherLine)

  // ベクトル矢印 (v1, v2, vG, F1, F2)
  const arrowV1 = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.36 })
  const arrowV2 = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.36 })
  const arrowVG = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.36 })
  const arrowF1 = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  const arrowF2 = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  scene.add(arrowV1, arrowV2, arrowVG, arrowF1, arrowF2)

  // 3D ラベル
  const labelM1 = createTextSprite('m₁', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.52 })
  const labelM2 = createTextSprite('m₂', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.52 })
  const labelG = createTextSprite('重心 G', { color: '#e9d5ff', borderColor: '#a855f7', scale: 0.52 })
  scene.add(labelM1, labelM2, labelG)

  sceneObjs = {
    grid,
    railGroup,
    body1Mesh,
    body2Mesh,
    comGroup,
    springMesh,
    springMat,
    orbit1Mesh,
    orbit2Mesh,
    tetherLine,
    arrowV1,
    arrowV2,
    arrowVG,
    arrowF1,
    arrowF2,
    labelM1,
    labelM2,
    labelG
  }

  updateFrame()
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    grid,
    railGroup,
    body1Mesh,
    body2Mesh,
    comGroup,
    springMesh,
    springMat,
    orbit1Mesh,
    orbit2Mesh,
    tetherLine,
    arrowV1,
    arrowV2,
    arrowVG,
    arrowF1,
    arrowF2,
    labelM1,
    labelM2,
    labelG
  } = sceneObjs

  const s1 = 0.8 + m1.value * 0.11
  const s2 = 0.8 + m2.value * 0.11
  body1Mesh.scale.setScalar(s1)
  body2Mesh.scale.setScalar(s2)

  labelM1.updateText(`m₁ = ${m1.value.toFixed(1)} kg`, '#7dd3fc', '#38bdf8')
  labelM2.updateText(`m₂ = ${m2.value.toFixed(1)} kg`, '#fde68a', '#f59e0b')

  if (systemType.value === 'spring') {
    grid.position.y = -1.12
    railGroup.visible = true
    springMesh.visible = true
    orbit1Mesh.visible = false
    orbit2Mesh.visible = false
    tetherLine.visible = false

    const visScale = 2.0
    const offset = viewMode.value === 'com' ? -xG.value : -2.1
    const px1 = (x1.value + offset) * visScale
    const px2 = (x2.value + offset) * visScale
    const pxG = (xG.value + offset) * visScale

    const p1 = new THREE.Vector3(px1, 0, 0)
    const p2 = new THREE.Vector3(px2, 0, 0)
    body1Mesh.position.copy(p1)
    body2Mesh.position.copy(p2)
    comGroup.position.set(pxG, 0, 0)

    labelM1.position.set(px1, -0.92, 0.55)
    labelM2.position.set(px2, -0.92, 0.55)
    labelG.updateText(`重心 G (v_G = ${vG.value.toFixed(2)} m/s)`, '#e9d5ff', '#a855f7')
    labelG.position.set(pxG, 2.15, 0)

    const r1 = 0.42 * s1
    const r2 = 0.42 * s2
    const spStart = px1 + r1
    const spLen = Math.max(0.4, px2 - r2 - spStart)
    springMesh.position.set(spStart, 0, 0)
    springMesh.scale.set(spLen, 1, 1)

    if (deltaX.value > 0.03) {
      springMat.color.setHex(0x38bdf8)
      springMat.emissive.setHex(0x0284c7)
    } else if (deltaX.value < -0.03) {
      springMat.color.setHex(0xf43f5e)
      springMat.emissive.setHex(0xe11d48)
    } else {
      springMat.color.setHex(0x94a3b8)
      springMat.emissive.setHex(0x475569)
    }

    const dispV1 = viewMode.value === 'com' ? v1.value - vG.value : v1.value
    const dispV2 = viewMode.value === 'com' ? v2.value - vG.value : v2.value

    if (Math.abs(dispV1) > 0.08) {
      arrowV1.setVector(
        new THREE.Vector3(px1, 0.68, 0),
        new THREE.Vector3(Math.sign(dispV1), 0, 0),
        Math.min(2.4, Math.abs(dispV1) * 0.45)
      )
    } else {
      arrowV1.visible = false
    }

    if (Math.abs(dispV2) > 0.08) {
      arrowV2.setVector(
        new THREE.Vector3(px2, 0.68, 0),
        new THREE.Vector3(Math.sign(dispV2), 0, 0),
        Math.min(2.4, Math.abs(dispV2) * 0.45)
      )
    } else {
      arrowV2.visible = false
    }

    if (viewMode.value === 'lab' && Math.abs(vG.value) > 0.08) {
      arrowVG.setVector(
        new THREE.Vector3(pxG, 1.45, 0),
        new THREE.Vector3(Math.sign(vG.value), 0, 0),
        Math.min(2.2, Math.abs(vG.value) * 0.45)
      )
    } else {
      arrowVG.visible = false
    }

    arrowF1.visible = false
    arrowF2.visible = false
  } else {
    // 連星・万有引力2体問題モード (r1 : r2 = m2 : m1)
    grid.position.y = -0.65
    railGroup.visible = false
    springMesh.visible = false
    orbit1Mesh.visible = true
    orbit2Mesh.visible = true
    tetherLine.visible = true
    arrowVG.visible = false

    const totalD = 4.2
    const r1 = totalD * (m2.value / (m1.value + m2.value))
    const r2 = totalD * (m1.value / (m1.value + m2.value))

    orbit1Mesh.scale.set(r1, 1, r1)
    orbit2Mesh.scale.set(r2, 1, r2)
    comGroup.position.set(0, 0, 0)
    labelG.updateText(`共通重心 G (r₁:r₂ = ${m2.value.toFixed(1)}:${m1.value.toFixed(1)})`, '#e9d5ff', '#a855f7')
    labelG.position.set(0, 2.05, -0.65)

    const p1 = new THREE.Vector3(r1 * Math.cos(binaryAngle), 0, -r1 * Math.sin(binaryAngle))
    const p2 = new THREE.Vector3(-r2 * Math.cos(binaryAngle), 0, r2 * Math.sin(binaryAngle))
    body1Mesh.position.copy(p1)
    body2Mesh.position.copy(p2)

    labelM1.position.set(p1.x * 1.15, 0.92, p1.z * 1.15)
    labelM2.position.set(p2.x * 1.15, 0.92, p2.z * 1.15)

    const tAttr = tetherLine.geometry.getAttribute('position')
    tAttr.setXYZ(0, p1.x, 0, p1.z)
    tAttr.setXYZ(1, p2.x, 0, p2.z)
    tAttr.needsUpdate = true
    tetherLine.computeLineDistances()

    // 速度ベクトル (逆向き接線)
    const tan1 = new THREE.Vector3(-Math.sin(binaryAngle), 0, -Math.cos(binaryAngle)).normalize()
    const tan2 = tan1.clone().negate()
    arrowV1.setVector(p1, tan1, Math.max(0.7, r1 * 0.55))
    arrowV2.setVector(p2, tan2, Math.max(0.7, r2 * 0.55))

    // 万有引力ベクトル (作用・反作用で同じ大きさ・重心向き)
    const dirToG1 = p1.clone().negate().normalize()
    const dirToG2 = p2.clone().negate().normalize()
    arrowF1.setVector(p1, dirToG1, 1.15)
    arrowF2.setVector(p2, dirToG2, 1.15)
  }
}

watch([m1, m2, k, systemType, viewMode], () => {
  updateFrame()
})

onMounted(() => {
  resetSim()
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
.sim-container {
  background: #0f172a;
  border-radius: 12px;
  padding: 1.2rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
}
.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}
.sim-header .icon {
  font-size: 1.5rem;
}
.sim-header h3 {
  margin: 0;
  font-size: 1.18rem;
  color: #38bdf8;
}
.three-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 0.85rem 0;
  line-height: 1.4;
}
.sys-mode-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.sys-mode-tabs button {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.83rem;
  cursor: pointer;
}
.sys-mode-tabs button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}
.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  margin-bottom: 0.75rem;
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
  align-items: center;
}
.cam-chip {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}
.cam-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #7dd3fc;
  font-weight: 600;
}
.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.85rem;
}
.speed-control-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.speed-label {
  font-size: 0.8rem;
  color: #cbd5e1;
  white-space: nowrap;
}
.speed-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.speed-btn-group button {
  padding: 3px 8px;
  font-size: 0.75rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  cursor: pointer;
  white-space: nowrap;
}
.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 390px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #080c16;
}
.three-viewport {
  width: 100%;
  height: 100%;
}
.three-hud-top {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.mode-status-strip {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.65rem;
}
.mode-badge {
  display: inline-block;
  font-size: 0.76rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
}
.mode-badge.lab {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}
.mode-badge.com {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.4);
}
.three-hud-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.74rem;
  color: #e2e8f0;
  pointer-events: none;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-m1 { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-m2 { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-g { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
.dot-f { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.three-hud-hint {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
  pointer-events: none;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend,
  .mode-badge,
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
}
.control-panel {
  margin-top: 1rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}
.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}
.control-group strong {
  color: #38bdf8;
}
input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #0284c7;
  color: white;
}
.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
}
.stat-card {
  background: #1e293b;
  padding: 0.7rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 3px solid #38bdf8;
}
.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}
.stat-card .value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #f8fafc;
}
.stat-card .value.positive {
  color: #38bdf8;
}
.stat-card .value.negative {
  color: #f43f5e;
}
.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}
.stat-card .subtext {
  font-size: 0.65rem;
  color: #64748b;
  margin-top: 0.2rem;
}
.energy-card {
  margin-top: 1rem;
  background: #1e293b;
  padding: 0.8rem 1rem;
  border-radius: 8px;
}
.energy-header {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.energy-bar {
  height: 14px;
  background: #0f172a;
  border-radius: 7px;
  overflow: hidden;
  display: flex;
}
.bar-segment {
  height: 100%;
  transition: width 0.1s linear;
}
.bar-segment.trans {
  background: #a855f7;
}
.bar-segment.rel {
  background: #0ea5e9;
}
.bar-segment.spring {
  background: #f59e0b;
}
.legend-row {
  display: flex;
  justify-content: space-around;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.trans { background: #a855f7; }
.dot.rel { background: #0ea5e9; }
.dot.spring { background: #f59e0b; }
</style>
