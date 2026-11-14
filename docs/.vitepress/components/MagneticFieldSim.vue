<template>
  <div class="sim-container" :style="{ '--ac': '#38bdf8' }">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧲</span>
        <h3 class="sim-title">3D 電流がつくる磁場 & 右ねじの法則シミュレーター</h3>
        <span class="badge badge-cyan">Three.js 3D Engine</span>
      </div>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'straight' }"
          @click="setMode('straight')"
        >
          直線電流
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'circular' }"
          @click="setMode('circular')"
        >
          円形電流
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'solenoid' }"
          @click="setMode('solenoid')"
        >
          ソレノイド
        </button>
      </div>
    </div>

    <p class="desc">
      導線に電流 <i>I</i> を流したときに空間に形成される 3D 磁力線（磁束線）の立体構造と、
      各点に置いた 3D 方位磁針（コンパス）が「右ねじの法則」に従って向きを揃える様子をリアルタイム検証できます。
    </p>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 3Dカメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D俯瞰
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🐢 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="resetCamera">🔄 視点リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            電流 <i>I</i> (導線/電子流)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            磁力線 <i>B</i> / 磁場 <i>H</i>
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#ef4444;box-shadow:0 0 6px #ef4444"></i>
            方位磁針 N極
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#3b82f6;box-shadow:0 0 6px #3b82f6"></i>
            方位磁針 S極
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D視点回転 ・ ホイールでズーム</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span class="three-status-badge">
        {{ currentModeDescription }}
      </span>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">電流 <i>I</i></div>
        <div class="stat-value text-blue">{{ currentI }} <span class="stat-unit">A</span></div>
        <div class="stat-formula">導線を流れる電流量</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">電流の向き</div>
        <div class="stat-value text-yellow">
          {{ mode === 'straight'
              ? (currentDir === 1 ? '⊙ 手前・上向き (+Y)' : '⊗ 奥・下向き (-Y)')
              : (currentDir === 1 ? '↺ 反時計回り (CCW)' : '↻ 時計回り (CW)') }}
        </div>
        <div class="stat-formula">右手の親指 / 4本指</div>
      </div>

      <div v-if="mode === 'straight'" class="stat-card highlight">
        <div class="stat-label">距離 <i>r</i> = 5 cm での磁場 <i>H</i></div>
        <div class="stat-value text-cyan">{{ straightH.toFixed(1) }} <span class="stat-unit">A/m</span></div>
        <div class="stat-formula">
          <i>H</i> = <span class="frac"><span class="num"><i>I</i></span><span class="den">2π<i>r</i></span></span>
          (<i>B</i> = {{ (straightH * 4 * Math.PI * 1e-1).toFixed(1) }} µT)
        </div>
      </div>

      <div v-if="mode === 'circular'" class="stat-card highlight">
        <div class="stat-label">中心での磁場 <i>H</i> (半径 <i>r</i> = 5 cm)</div>
        <div class="stat-value text-cyan">{{ circularH.toFixed(1) }} <span class="stat-unit">A/m</span></div>
        <div class="stat-formula">
          <i>H</i> = <span class="frac"><span class="num"><i>I</i></span><span class="den">2<i>r</i></span></span>
          (<i>B</i> = {{ (circularH * 4 * Math.PI * 1e-1).toFixed(1) }} µT)
        </div>
      </div>

      <div v-if="mode === 'solenoid'" class="stat-card highlight">
        <div class="stat-label">内部一様磁場 <i>H</i> (<i>n</i> = 500 回/m)</div>
        <div class="stat-value text-cyan">{{ solenoidH.toFixed(0) }} <span class="stat-unit">A/m</span></div>
        <div class="stat-formula">
          <i>H</i> = <i>nI</i>
          (<i>B</i> = {{ (solenoidH * 4 * Math.PI * 1e-1).toFixed(1) }} µT)
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>電流の大きさ <i>I</i>:</span>
            <span class="control-val">{{ currentI }} A</span>
          </label>
          <input type="range" v-model.number="currentI" min="1" max="20" step="1" class="sim-slider" />
        </div>

        <div class="btn-group">
          <button @click="toggleDir" class="sim-btn secondary">
            🔄 電流の向き反転 ({{ currentDir === 1 ? '+ → −' : '− → +' }})
          </button>
          <button @click="showCompass = !showCompass" class="sim-btn" :class="{ active: showCompass }">
            🧭 {{ showCompass ? '方位磁針: 表示中' : '方位磁針: 非表示' }}
          </button>
          <button @click="showHandGuide = !showHandGuide" class="sim-btn" :class="{ active: showHandGuide }">
            ✋ {{ showHandGuide ? '右ねじベクトル: 表示中' : '右ねじベクトル: 非表示' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>右手の親指と4本指のルール（右ねじの法則）</strong>:
      <ul>
        <li><strong>直線電流</strong>: 親指を電流 <i>I</i> の向きに向けると、残り4本の指が巻きつく向きが<strong>同心円状の磁場 <i>H</i> = <span class="frac"><span class="num"><i>I</i></span><span class="den">2π<i>r</i></span></span></strong> の向きを指します。</li>
        <li><strong>円形電流・ソレノイド</strong>: 残り4本の指をコイル電流の周回向きに沿わせると、<strong>親指の指す向きが中心を貫く磁場（N極側）</strong> を指します。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const mode = ref('straight') // 'straight' | 'circular' | 'solenoid'
const currentI = ref(8) // A
const currentDir = ref(1) // 1 or -1
const showCompass = ref(true)
const showHandGuide = ref(true)
const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')

const threeContainer = ref(null)
let threeCtx = null
let scene = null
let modeGroup = null
let compassGroup = null
let handGuideGroup = null
let currentParticles = null
let fluxParticles = null

// 物理計算
const straightH = computed(() => currentI.value / (2 * Math.PI * 0.05))
const circularH = computed(() => currentI.value / (2 * 0.05))
const solenoidH = computed(() => 500 * currentI.value)

const currentModeDescription = computed(() => {
  if (mode.value === 'straight') {
    return currentDir.value === 1
      ? '⚡ 直線電流 (+Y 上向き): 右ねじにより上面から見て反時計回りの同心円磁場 B が発生'
      : '⚡ 直線電流 (-Y 下向き): 右ねじにより上面から見て時計回りの同心円磁場 B が発生'
  } else if (mode.value === 'circular') {
    return currentDir.value === 1
      ? '🔄 円形電流 (反時計回り): 右手4本指の周回に対し、中心軸は上向き (+Y) の N極磁場を形成'
      : '🔄 円形電流 (時計回り): 右手4本指の周回に対し、中心軸は下向き (-Y) の N極磁場を形成'
  } else {
    return currentDir.value === 1
      ? '🌀 ソレノイド (右巻き): 内部にほぼ均一な高密度磁場 H=nI が生じ、右端が N極、左端が S極'
      : '🌀 ソレノイド (逆電流): 内部磁場が反転し、左端が N極、右端が S極'
  }
})

function toggleDir() {
  currentDir.value *= -1
  updateCompassOrientations()
  updateHandGuide()
}

function setMode(newMode) {
  mode.value = newMode
  rebuildScene()
  updateCompassOrientations()
  updateHandGuide()
}

// ==========================================================
// カメラ制御 & プリセット
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return w < 540 || aspect < 1.35 ? Math.min(1.85, Math.max(1.15, 1.52 / Math.max(0.65, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0, 38 * ms], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 38 * ms, 0.01], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [9 * ms, 7 * ms, 11 * ms], target: [0, 0, 0], fov: 38 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const params = getCamParams(preset)
  threeCtx.moveCameraTo(params.pos, params.target, duration, params.fov)
}

function resetCamera() {
  setCameraPreset('3d')
}

// ==========================================================
// 3D 方位磁針 (コンパス) メッシュ生成
// ==========================================================
const compassList = [] // { mesh, needle, getLocalB: () => THREE.Vector3 }

function createCompassMesh() {
  const compassGroup = new THREE.Group()

  // コンパス外枠ケース
  const baseGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 24)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.3
  })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  compassGroup.add(baseMesh)

  // 目盛盤リング
  const rimGeo = new THREE.TorusGeometry(0.52, 0.035, 8, 24)
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.4
  })
  const rimMesh = new THREE.Mesh(rimGeo, rimMat)
  rimMesh.rotation.x = Math.PI / 2
  rimMesh.position.y = 0.045
  compassGroup.add(rimMesh)

  // 磁針グループ（Y軸中心に回転）
  const needleGroup = new THREE.Group()
  needleGroup.position.y = 0.06

  // N極 (赤)
  const nGeo = new THREE.ConeGeometry(0.12, 0.48, 12)
  nGeo.rotateX(Math.PI / 2)
  nGeo.translate(0, 0, 0.24)
  const nMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.45,
    roughness: 0.3
  })
  const nMesh = new THREE.Mesh(nGeo, nMat)
  needleGroup.add(nMesh)

  // S極 (青)
  const sGeo = new THREE.ConeGeometry(0.12, 0.48, 12)
  sGeo.rotateX(-Math.PI / 2)
  sGeo.translate(0, 0, -0.24)
  const sMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.45,
    roughness: 0.3
  })
  const sMesh = new THREE.Mesh(sGeo, sMat)
  needleGroup.add(sMesh)

  // センターピン
  const pinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10)
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 })
  const pinMesh = new THREE.Mesh(pinGeo, pinMat)
  needleGroup.add(pinMesh)

  compassGroup.add(needleGroup)

  return { root: compassGroup, needle: needleGroup }
}

// ==========================================================
// 3D シーン構築
// ==========================================================
let animClock = 0

function rebuildScene() {
  if (!scene) return

  // 既存グループのクリーンアップ
  if (modeGroup) scene.remove(modeGroup)
  if (compassGroup) scene.remove(compassGroup)
  if (handGuideGroup) scene.remove(handGuideGroup)

  modeGroup = new THREE.Group()
  compassGroup = new THREE.Group()
  handGuideGroup = new THREE.Group()
  compassList.length = 0

  scene.add(modeGroup)
  scene.add(compassGroup)
  scene.add(handGuideGroup)

  if (mode.value === 'straight') {
    buildStraightScene()
  } else if (mode.value === 'circular') {
    buildCircularScene()
  } else {
    buildSolenoidScene()
  }

  updateCompassOrientations()
  updateHandGuide()
}

// ----------------------------------------------------------
// 1. 直線電流 (Straight Wire)
// ----------------------------------------------------------
function buildStraightScene() {
  // アクリル台座
  const baseGeo = new THREE.BoxGeometry(11, 0.12, 11)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.65,
    metalness: 0.1,
    roughness: 0.8
  })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  baseMesh.position.y = -0.06
  modeGroup.add(baseMesh)

  // グリッド線
  const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b)
  grid.position.y = 0.01
  modeGroup.add(grid)

  // 直線銅線 (Y軸方向)
  const wireGeo = new THREE.CylinderGeometry(0.18, 0.18, 9.5, 24)
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.2
  })
  const wireMesh = new THREE.Mesh(wireGeo, wireMat)
  modeGroup.add(wireMesh)

  // 電流ラベル
  const curLabel = createTextSprite('電流 I', { color: '#fbbf24', fontSize: 34, scale: 0.48 })
  curLabel.position.set(0.85, 4.4, 0)
  modeGroup.add(curLabel)

  // 同心円状磁力線
  const radii = [1.8, 3.2, 4.7]
  radii.forEach((r, idx) => {
    const ringGeo = new THREE.TorusGeometry(r, 0.03, 8, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45 - idx * 0.08
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2
    modeGroup.add(ringMesh)
  })

  // 電流キャリア粒子（導線内を流れる電子/電流点）
  const curPartGeo = new THREE.SphereGeometry(0.08, 8, 8)
  const curPartMat = new THREE.MeshBasicMaterial({ color: 0xfef08a })
  currentParticles = []
  for (let k = 0; k < 18; k++) {
    const pMesh = new THREE.Mesh(curPartGeo, curPartMat)
    pMesh.position.set(0, (k / 18) * 9.0 - 4.5, 0)
    modeGroup.add(pMesh)
    currentParticles.push(pMesh)
  }

  // 磁力線沿いの周回流動粒子
  const fluxGeo = new THREE.SphereGeometry(0.065, 8, 8)
  const fluxMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  fluxParticles = []
  radii.forEach((r, rIdx) => {
    const count = 4 + rIdx * 2
    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(fluxGeo, fluxMat)
      pMesh.userData = { radius: r, phase: (i / count) * Math.PI * 2, speed: 1.2 / Math.sqrt(r) }
      modeGroup.add(pMesh)
      fluxParticles.push(pMesh)
    }
  })

  // 3D コンパス配置 (同心円上の代表点)
  const compassPositions = [
    { r: 2.2, theta: 0 },
    { r: 2.2, theta: Math.PI / 2 },
    { r: 2.2, theta: Math.PI },
    { r: 2.2, theta: (3 * Math.PI) / 2 },
    { r: 3.8, theta: Math.PI / 4 },
    { r: 3.8, theta: (3 * Math.PI) / 4 },
    { r: 3.8, theta: (5 * Math.PI) / 4 },
    { r: 3.8, theta: (7 * Math.PI) / 4 }
  ]

  compassPositions.forEach(pos => {
    const { root, needle } = createCompassMesh()
    const x = pos.r * Math.cos(pos.theta)
    const z = pos.r * Math.sin(pos.theta)
    root.position.set(x, 0.04, z)
    compassGroup.add(root)

    compassList.push({
      mesh: root,
      needle,
      getLocalB: () => {
        // 直線電流の磁場: B = (-dir * sin(theta), 0, dir * cos(theta))
        const dir = currentDir.value
        return new THREE.Vector3(-dir * Math.sin(pos.theta), 0, dir * Math.cos(pos.theta))
      }
    })
  })
}

// ----------------------------------------------------------
// 2. 円形電流 (Circular Loop)
// ----------------------------------------------------------
function buildCircularScene() {
  const loopR = 2.8

  // 台座 & グリッド
  const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b)
  grid.position.y = -1.8
  modeGroup.add(grid)

  // 円形コイル導線 (X-Z平面)
  const coilGeo = new THREE.TorusGeometry(loopR, 0.14, 16, 64)
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.25
  })
  const coilMesh = new THREE.Mesh(coilGeo, coilMat)
  coilMesh.rotation.x = Math.PI / 2
  modeGroup.add(coilMesh)

  // 導線給電端子
  const leadGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12)
  const lead1 = new THREE.Mesh(leadGeo, coilMat)
  lead1.position.set(loopR, -0.9, 0)
  modeGroup.add(lead1)

  // 電流ラベル
  const curLabel = createTextSprite('円形電流 I', { color: '#fbbf24', fontSize: 32, scale: 0.48 })
  curLabel.position.set(0, -0.4, loopR + 0.6)
  modeGroup.add(curLabel)

  // 中心軸磁場ラベル
  const nPoleLabel = createTextSprite('N 極 (磁束湧出)', { color: '#ef4444', borderColor: '#ef4444', fontSize: 30, scale: 0.44 })
  nPoleLabel.name = 'nPoleLabel'
  nPoleLabel.position.set(0, 3.2, 0)
  modeGroup.add(nPoleLabel)

  // コイル上を流れる電流粒子
  const curPartGeo = new THREE.SphereGeometry(0.08, 8, 8)
  const curPartMat = new THREE.MeshBasicMaterial({ color: 0xfef08a })
  currentParticles = []
  for (let k = 0; k < 20; k++) {
    const pMesh = new THREE.Mesh(curPartGeo, curPartMat)
    pMesh.userData = { phi: (k / 20) * Math.PI * 2 }
    modeGroup.add(pMesh)
    currentParticles.push(pMesh)
  }

  // 3D 磁力線（双極子トロイダル曲線群）
  // 1. 中心軸の直線
  const centerLinePts = [new THREE.Vector3(0, -3.8, 0), new THREE.Vector3(0, 3.8, 0)]
  const centerLineGeo = new THREE.BufferGeometry().setFromPoints(centerLinePts)
  const fieldMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
  const centerLine = new THREE.Line(centerLineGeo, fieldMat)
  modeGroup.add(centerLine)

  // 2. 空間に広がる還流磁力線ループ (各方位角 theta)
  fluxParticles = []
  const numPlanes = 6
  for (let p = 0; p < numPlanes; p++) {
    const azimuth = (p / numPlanes) * Math.PI * 2
    const cosA = Math.cos(azimuth)
    const sinA = Math.sin(azimuth)

    // ループ内側を通る曲線 (楕円近似)
    const pts = []
    const a = 1.3 // XZ半径
    const b = 2.4 // Y半径
    const segs = 36
    for (let s = 0; s <= segs; s++) {
      const t = (s / segs) * Math.PI * 2
      const r = loopR * 0.45 + a * Math.sin(t)
      const y = b * Math.cos(t)
      pts.push(new THREE.Vector3(r * cosA, y, r * sinA))
    }
    const loopGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const loopLine = new THREE.Line(loopGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.38 }))
    modeGroup.add(loopLine)

    // 磁力線沿いの周回流動粒子
    for (let f = 0; f < 3; f++) {
      const fGeo = new THREE.SphereGeometry(0.065, 8, 8)
      const fMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      const fMesh = new THREE.Mesh(fGeo, fMat)
      fMesh.userData = {
        azimuth,
        phase: (f / 3) * Math.PI * 2,
        rBase: loopR * 0.45,
        a,
        b
      }
      modeGroup.add(fMesh)
      fluxParticles.push(fMesh)
    }
  }

  // 中心流動粒子
  for (let f = 0; f < 4; f++) {
    const fMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }))
    fMesh.userData = { isCenter: true, phase: (f / 4) }
    modeGroup.add(fMesh)
    fluxParticles.push(fMesh)
  }

  // 3D コンパス配置
  // 1) コイル中心
  const centerCompass = createCompassMesh()
  centerCompass.root.position.set(0, 0.05, 0)
  compassGroup.add(centerCompass.root)
  compassList.push({
    mesh: centerCompass.root,
    needle: centerCompass.needle,
    getLocalB: () => new THREE.Vector3(0, 0, -currentDir.value) // XZ平面での投影考慮
  })

  // 2) コイル上下
  const topCompass = createCompassMesh()
  topCompass.root.position.set(0, 1.8, 0)
  compassGroup.add(topCompass.root)
  compassList.push({
    mesh: topCompass.root,
    needle: topCompass.needle,
    getLocalB: () => new THREE.Vector3(0, 0, -currentDir.value)
  })

  // 3) コイル外周
  const outerAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
  outerAngles.forEach(ang => {
    const c = createCompassMesh()
    c.root.position.set(4.2 * Math.cos(ang), 0.05, 4.2 * Math.sin(ang))
    compassGroup.add(c.root)
    compassList.push({
      mesh: c.root,
      needle: c.needle,
      getLocalB: () => {
        // 外側は還流磁場のため中心と逆向き
        return new THREE.Vector3(0, 0, currentDir.value)
      }
    })
  })
}

// ----------------------------------------------------------
// 3. ソレノイド (Solenoid)
// ----------------------------------------------------------
function buildSolenoidScene() {
  const solR = 1.3
  const solLen = 5.2
  const turns = 10

  // グリッド
  const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b)
  grid.position.y = -1.8
  modeGroup.add(grid)

  // らせん導線 (ヘリックス X軸方向)
  const helixPoints = []
  const totalSteps = 240
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps
    const x = (t - 0.5) * solLen
    const theta = t * turns * Math.PI * 2
    const y = solR * Math.cos(theta)
    const z = solR * Math.sin(theta)
    helixPoints.push(new THREE.Vector3(x, y, z))
  }
  const helixCurve = new THREE.CatmullRomCurve3(helixPoints)
  const helixGeo = new THREE.TubeGeometry(helixCurve, 180, 0.08, 10, false)
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.2
  })
  const coilMesh = new THREE.Mesh(helixGeo, coilMat)
  modeGroup.add(coilMesh)

  // 電流粒子 (らせんに沿って流れる)
  const curPartGeo = new THREE.SphereGeometry(0.075, 8, 8)
  const curPartMat = new THREE.MeshBasicMaterial({ color: 0xfef08a })
  currentParticles = []
  for (let k = 0; k < 22; k++) {
    const pMesh = new THREE.Mesh(curPartGeo, curPartMat)
    pMesh.userData = { t: k / 22 }
    modeGroup.add(pMesh)
    currentParticles.push(pMesh)
  }

  // 内部の一様平行磁力線群 (X軸方向)
  const linesOffsets = [
    [0, 0],
    [0.5, 0], [-0.5, 0],
    [0, 0.5], [0, -0.5],
    [0.35, 0.35], [-0.35, -0.35]
  ]

  linesOffsets.forEach(off => {
    const pts = [
      new THREE.Vector3(-solLen * 0.55, off[0], off[1]),
      new THREE.Vector3(solLen * 0.55, off[0], off[1])
    ]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
    modeGroup.add(new THREE.Line(lineGeo, lineMat))
  })

  // 外部の還流ループ線 (上下左右)
  const outerLoops = [
    { y: 2.2, z: 0 },
    { y: -2.2, z: 0 },
    { y: 0, z: 2.2 },
    { y: 0, z: -2.2 }
  ]
  outerLoops.forEach(loop => {
    const pts = []
    const segs = 32
    for (let i = 0; i <= segs; i++) {
      const u = (i / segs) * Math.PI
      const x = (solLen * 0.6) * Math.cos(u)
      const mult = Math.sin(u)
      pts.push(new THREE.Vector3(x, loop.y * mult + (loop.y !== 0 ? (loop.y > 0 ? 0.3 : -0.3) : 0), loop.z * mult))
    }
    const loopGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const loopLine = new THREE.Line(loopGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 }))
    modeGroup.add(loopLine)
  })

  // 磁力線流動粒子
  fluxParticles = []
  // 内部流動
  linesOffsets.forEach(off => {
    for (let f = 0; f < 3; f++) {
      const fMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))
      fMesh.userData = {
        isInternal: true,
        off,
        t: (f / 3)
      }
      modeGroup.add(fMesh)
      fluxParticles.push(fMesh)
    }
  })

  // 外部流動
  outerLoops.forEach(loop => {
    for (let f = 0; f < 2; f++) {
      const fMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }))
      fMesh.userData = {
        isExternal: true,
        loop,
        t: (f / 2)
      }
      modeGroup.add(fMesh)
      fluxParticles.push(fMesh)
    }
  })

  // 極性ラベル (N極 / S極)
  const leftLabel = createTextSprite('S 極', { color: '#3b82f6', borderColor: '#3b82f6', fontSize: 32, scale: 0.44 })
  leftLabel.name = 'solLeftLabel'
  leftLabel.position.set(-solLen * 0.5 - 0.7, 0, 0)
  modeGroup.add(leftLabel)

  const rightLabel = createTextSprite('N 極', { color: '#ef4444', borderColor: '#ef4444', fontSize: 32, scale: 0.44 })
  rightLabel.name = 'solRightLabel'
  rightLabel.position.set(solLen * 0.5 + 0.7, 0, 0)
  modeGroup.add(rightLabel)

  // 3D コンパス配置
  // 1) 内部中心
  const internalCompass = createCompassMesh()
  internalCompass.root.position.set(0, -solR + 0.35, 0)
  compassGroup.add(internalCompass.root)
  compassList.push({
    mesh: internalCompass.root,
    needle: internalCompass.needle,
    getLocalB: () => new THREE.Vector3(currentDir.value, 0, 0)
  })

  // 2) 外部上部 & 下部
  const topC = createCompassMesh()
  topC.root.position.set(0, 2.5, 0)
  compassGroup.add(topC.root)
  compassList.push({
    mesh: topC.root,
    needle: topC.needle,
    getLocalB: () => new THREE.Vector3(-currentDir.value, 0, 0) // 外部は還流するため逆向き
  })

  // 3) 外部右端・左端
  const rightC = createCompassMesh()
  rightC.root.position.set(3.8, 0, 0)
  compassGroup.add(rightC.root)
  compassList.push({
    mesh: rightC.root,
    needle: rightC.needle,
    getLocalB: () => new THREE.Vector3(currentDir.value, 0, 0)
  })

  const leftC = createCompassMesh()
  leftC.root.position.set(-3.8, 0, 0)
  compassGroup.add(leftC.root)
  compassList.push({
    mesh: leftC.root,
    needle: leftC.needle,
    getLocalB: () => new THREE.Vector3(currentDir.value, 0, 0)
  })
}

// ----------------------------------------------------------
// 方位磁針の向きの更新
// ----------------------------------------------------------
function updateCompassOrientations() {
  if (!compassGroup) return
  compassGroup.visible = showCompass.value

  compassList.forEach(item => {
    const vecB = item.getLocalB()
    // コンパス針はXZ平面上での方位角度で回転
    const angle = Math.atan2(vecB.x, vecB.z)
    item.needle.rotation.y = angle
  })

  // モード別極性ラベルの更新
  if (mode.value === 'circular') {
    const nLabel = modeGroup.getObjectByName('nPoleLabel')
    if (nLabel) {
      if (currentDir.value === 1) {
        nLabel.position.set(0, 3.2, 0)
        nLabel.updateText('N 極 (上向き湧出)', '#ef4444', '#ef4444')
      } else {
        nLabel.position.set(0, -3.2, 0)
        nLabel.updateText('N 極 (下向き湧出)', '#ef4444', '#ef4444')
      }
    }
  } else if (mode.value === 'solenoid') {
    const leftLabel = modeGroup.getObjectByName('solLeftLabel')
    const rightLabel = modeGroup.getObjectByName('solRightLabel')
    if (leftLabel && rightLabel) {
      if (currentDir.value === 1) {
        leftLabel.updateText('S 極', '#3b82f6', '#3b82f6')
        rightLabel.updateText('N 極', '#ef4444', '#ef4444')
      } else {
        leftLabel.updateText('N 極', '#ef4444', '#ef4444')
        rightLabel.updateText('S 極', '#3b82f6', '#3b82f6')
      }
    }
  }
}

// ----------------------------------------------------------
// 右ねじ・右手の法則 3D ベクトルガイド
// ----------------------------------------------------------
let curArrow = null
let bArrow = null

function updateHandGuide() {
  if (!handGuideGroup) return
  handGuideGroup.visible = showHandGuide.value

  while (handGuideGroup.children.length > 0) {
    const child = handGuideGroup.children[0]
    handGuideGroup.remove(child)
  }

  const dir = currentDir.value
  const iMag = currentI.value / 10

  if (mode.value === 'straight') {
    // 1. 直線電流の矢印 (親指)
    curArrow = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
    curArrow.setVector(
      new THREE.Vector3(0, dir === 1 ? -1.5 : 1.5, 0),
      new THREE.Vector3(0, dir, 0),
      3.0
    )
    handGuideGroup.add(curArrow)

    const curLabel = createTextSprite(dir === 1 ? '親指: 電流 I (+Y)' : '親指: 電流 I (-Y)', {
      color: '#fbbf24',
      borderColor: '#f59e0b',
      fontSize: 28,
      scale: 0.42
    })
    curLabel.position.set(0.7, dir * 1.8, 0)
    handGuideGroup.add(curLabel)

    // 2. 巻きつく磁場ベクトル (4本指)
    bArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.07, headRadius: 0.2, headLength: 0.5 })
    bArrow.setVector(
      new THREE.Vector3(2.2, 0.5, 0),
      new THREE.Vector3(0, 0, dir),
      1.6 * iMag
    )
    handGuideGroup.add(bArrow)

    const bLabel = createTextSprite('4本指: 磁場 H', { color: '#38bdf8', borderColor: '#0284c7', fontSize: 26, scale: 0.38 })
    bLabel.position.set(2.4, 0.8, 0.8 * dir)
    handGuideGroup.add(bLabel)
  } else if (mode.value === 'circular') {
    // 4本指: コイル周回電流
    curArrow = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
    curArrow.setVector(
      new THREE.Vector3(2.8, 0, 0),
      new THREE.Vector3(0, 0, -dir),
      2.0
    )
    handGuideGroup.add(curArrow)

    const curLabel = createTextSprite('4本指: 電流 I 周回', { color: '#fbbf24', borderColor: '#f59e0b', fontSize: 28, scale: 0.42 })
    curLabel.position.set(3.0, 0.4, -dir * 1.0)
    handGuideGroup.add(curLabel)

    // 親指: 中心磁場
    bArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.09, headRadius: 0.24, headLength: 0.6 })
    bArrow.setVector(
      new THREE.Vector3(0, dir === 1 ? -1.0 : 1.0, 0),
      new THREE.Vector3(0, dir, 0),
      2.8 * iMag
    )
    handGuideGroup.add(bArrow)

    const bLabel = createTextSprite(dir === 1 ? '親指: 中心磁場 (+Y, N極)' : '親指: 中心磁場 (-Y, N極)', {
      color: '#38bdf8',
      borderColor: '#0284c7',
      fontSize: 28,
      scale: 0.42
    })
    bLabel.position.set(0.65, dir * 2.2, 0)
    handGuideGroup.add(bLabel)
  } else {
    // ソレノイド
    bArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.1, headRadius: 0.26, headLength: 0.65 })
    bArrow.setVector(
      new THREE.Vector3(dir === 1 ? -1.8 : 1.8, 0, 0),
      new THREE.Vector3(dir, 0, 0),
      3.6 * iMag
    )
    handGuideGroup.add(bArrow)

    const bLabel = createTextSprite(dir === 1 ? '親指: 内部磁場 H=nI (+X N極)' : '親指: 内部磁場 H=nI (-X N極)', {
      color: '#38bdf8',
      borderColor: '#0284c7',
      fontSize: 28,
      scale: 0.42
    })
    bLabel.position.set(dir * 2.2, 1.2, 0)
    handGuideGroup.add(bLabel)
  }
}

// ==========================================================
// 毎フレーム アニメーション処理 (onFrame)
// ==========================================================
function onFrame(dt) {
  if (!isPlaying.value) return

  const effectiveDt = dt * timeScale.value
  animClock += effectiveDt
  const dir = currentDir.value

  // 1. 直線電流モードの粒子
  if (mode.value === 'straight') {
    if (currentParticles) {
      currentParticles.forEach(p => {
        p.position.y += dir * effectiveDt * 3.5
        if (p.position.y > 4.5) p.position.y = -4.5
        if (p.position.y < -4.5) p.position.y = 4.5
      })
    }
    if (fluxParticles) {
      fluxParticles.forEach(p => {
        p.userData.phase += dir * effectiveDt * p.userData.speed
        p.position.x = p.userData.radius * Math.cos(p.userData.phase)
        p.position.z = p.userData.radius * Math.sin(p.userData.phase)
        p.position.y = 0.02
      })
    }
  } else if (mode.value === 'circular') {
    // 2. 円形電流モードの粒子
    const loopR = 2.8
    if (currentParticles) {
      currentParticles.forEach(p => {
        p.userData.phi -= dir * effectiveDt * 2.2
        p.position.x = loopR * Math.cos(p.userData.phi)
        p.position.z = loopR * Math.sin(p.userData.phi)
        p.position.y = 0
      })
    }
    if (fluxParticles) {
      fluxParticles.forEach(p => {
        if (p.userData.isCenter) {
          p.userData.phase += dir * effectiveDt * 0.8
          if (p.userData.phase > 1) p.userData.phase -= 1
          if (p.userData.phase < 0) p.userData.phase += 1
          p.position.set(0, (p.userData.phase - 0.5) * 7.0, 0)
        } else {
          p.userData.phase += dir * effectiveDt * 1.4
          const t = p.userData.phase
          const r = p.userData.rBase + p.userData.a * Math.sin(t)
          const y = p.userData.b * Math.cos(t)
          p.position.set(
            r * Math.cos(p.userData.azimuth),
            y,
            r * Math.sin(p.userData.azimuth)
          )
        }
      })
    }
  } else if (mode.value === 'solenoid') {
    // 3. ソレノイドモードの粒子
    const solLen = 5.2
    const solR = 1.3
    const turns = 10
    if (currentParticles) {
      currentParticles.forEach(p => {
        p.userData.t += dir * effectiveDt * 0.4
        if (p.userData.t > 1) p.userData.t -= 1
        if (p.userData.t < 0) p.userData.t += 1
        const t = p.userData.t
        const x = (t - 0.5) * solLen
        const theta = t * turns * Math.PI * 2
        p.position.set(x, solR * Math.cos(theta), solR * Math.sin(theta))
      })
    }
    if (fluxParticles) {
      fluxParticles.forEach(p => {
        if (p.userData.isInternal) {
          p.userData.t += dir * effectiveDt * 0.85
          if (p.userData.t > 1) p.userData.t -= 1
          if (p.userData.t < 0) p.userData.t += 1
          p.position.set((p.userData.t - 0.5) * solLen * 1.1, p.userData.off[0], p.userData.off[1])
        } else if (p.userData.isExternal) {
          p.userData.t -= dir * effectiveDt * 0.6
          if (p.userData.t > 1) p.userData.t -= 1
          if (p.userData.t < 0) p.userData.t += 1
          const u = p.userData.t * Math.PI
          const x = (solLen * 0.6) * Math.cos(u)
          const mult = Math.sin(u)
          const loop = p.userData.loop
          p.position.set(
            x,
            loop.y * mult + (loop.y !== 0 ? (loop.y > 0 ? 0.3 : -0.3) : 0),
            loop.z * mult
          )
        }
      })
    }
  }
}

watch([showCompass], () => updateCompassOrientations())
watch([showHandGuide, currentI], () => updateHandGuide())

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 38,
    initialCamPos: [9, 7, 11],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame
  })
  scene = threeCtx.scene

  rebuildScene()
  setCameraPreset('3d', 0)
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

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
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon {
  font-size: 1.3rem;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.preset-group {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.chip-btn {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #94a3b8;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  border-color: #38bdf8;
  color: #e2e8f0;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.speed-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.speed-btn-group {
  display: flex;
  gap: 0.25rem;
}

.speed-btn-group button {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.speed-btn-group button.active {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  border-color: #38bdf8;
}

.btn {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #38bdf8;
  color: #090d16;
}

.btn-primary:hover {
  background: #7dd3fc;
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-secondary:hover {
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.2);
  margin-bottom: 0.75rem;
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
  pointer-events: none;
}

.three-hud-legend {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(6px);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  width: fit-content;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #cbd5e1;
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  right: 10px;
  pointer-events: none;
}

.three-hud-hint {
  background: rgba(9, 13, 22, 0.8);
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  color: #94a3b8;
}

.mode-status-strip {
  margin-bottom: 0.85rem;
}

.three-status-badge {
  display: block;
  background: rgba(15, 23, 42, 0.75);
  border-left: 3px solid #38bdf8;
  padding: 0.5rem 0.85rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #e2e8f0;
  line-height: 1.5;
}

.sim-tabs {
  display: flex;
  gap: 0.4rem;
}

.tab-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: #38bdf8;
  color: #f8fafc;
}

.tab-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.stat-card.highlight {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.05);
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-blue {
  color: #60a5fa;
}

.text-yellow {
  color: #fbbf24;
}

.text-cyan {
  color: #38bdf8;
}

.stat-unit {
  font-size: 0.85rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-formula {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  font-size: 0.9em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.frac .den {
  padding-top: 1px;
}

.controls-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.control-group {
  flex: 1;
  min-width: 220px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #cbd5e1;
  margin-bottom: 0.4rem;
}

.control-val {
  color: #38bdf8;
  font-weight: 700;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sim-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-btn.secondary {
  border-color: #fbbf24;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.sim-btn.secondary:hover {
  background: rgba(251, 191, 36, 0.2);
}

.sim-footer-note {
  background: rgba(15, 23, 42, 0.5);
  border-left: 3px solid #fbbf24;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.sim-footer-note ul {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}

.sim-footer-note li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .control-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
