<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <div class="sim-title">
          <span class="icon">⚛️</span>
          <span>3D ウラン235核分裂連鎖反応シミュレーター</span>
        </div>
        <div class="header-badges">
          <span class="three-badge">Three.js 3D Interactive</span>
          <span class="badge" :style="{ borderColor: criticalityStatus.color, color: criticalityStatus.color }">
            {{ criticalityStatus.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCamera('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCamera('front')">
          📐 正面断面 (fov=14)
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCamera('top')">
          🔼 上面 (fov=14)
        </button>
      </div>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: showModeratorTank }" @click="showModeratorTank = !showModeratorTank">
          {{ showModeratorTank ? '💧 減速材タンク: ON' : '💧 減速材タンク: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-neutron" @click="fireManualNeutron">中性子を発射 🎯</button>
      <button class="btn btn-scram" @click="handleScram">緊急停止 (SCRAM) 🚨</button>
      <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="btn btn-reset" @click="initSimulation">🔄 リセット</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap three-stage">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-u235"></i><span class="legend-text"><sup>235</sup>U 燃料</span></span>
          <span class="legend-item"><i class="dot-thermal"></i><span class="legend-text">熱中性子 (遅)</span></span>
          <span class="legend-item"><i class="dot-fast"></i><span class="legend-text">高速中性子 (速)</span></span>
          <span class="legend-item"><i class="dot-frag"></i><span class="legend-text">Ba / Kr 分裂片</span></span>
          <span class="legend-item"><i class="bar-rod"></i><span class="legend-text">制御棒 (B/Cd)</span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- ビューポート外ステータスストリップ -->
    <div class="mode-status-strip">
      <span class="state-badge" :style="{ borderColor: criticalityStatus.color, color: criticalityStatus.color }">
        {{ criticalityStatus.name }} ・ 実効増倍率 <i>k</i><sub>eff</sub> = {{ effectiveK.toFixed(2) }} ・ 熱中性子 {{ thermalCount }} / 高速中性子 {{ fastCount }}
      </span>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stat-grid">
      <div class="stat-card">
        <span class="lbl">中性子増倍率 <i>k</i><sub>eff</sub></span>
        <span class="val highlight" :style="{ color: criticalityStatus.color }">
          {{ effectiveK.toFixed(2) }}
        </span>
      </div>
      <div class="stat-card">
        <span class="lbl">飛行中性子数 (熱 / 高速)</span>
        <span class="val">{{ neutronCount }} 個 <small>({{ thermalCount }} / {{ fastCount }})</small></span>
      </div>
      <div class="stat-card">
        <span class="lbl">累計核分裂数</span>
        <span class="val">{{ fissionCount }} 回</span>
      </div>
      <div class="stat-card">
        <span class="lbl">放出熱エネルギー</span>
        <span class="val" style="color: #fbbf24">
          {{ (totalEnergyMev / 1000).toFixed(1) }} GeV相当
        </span>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>制御棒の挿入率 (ホウ素・カドミウム): <span>{{ controlRodDepth }}%</span></label>
          <input type="range" v-model.number="controlRodDepth" min="0" max="100" step="5" />
        </div>
        <div class="control-group">
          <label><sup>235</sup>U 濃縮度: <span>{{ u235Enrichment }}%</span></label>
          <input type="range" v-model.number="u235Enrichment" min="20" max="100" step="5" @change="initSimulation" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let resizeObs = null
let lastIsMob = false

const activeCam = ref('3d')
const showModeratorTank = ref(true)
const controlRodDepth = ref(50) // 0..100%
const u235Enrichment = ref(60) // 20..100%
const isPlaying = ref(true)
const timeScale = ref(1.0)

const neutronCount = ref(2)
const thermalCount = ref(2)
const fastCount = ref(0)
const fissionCount = ref(0)
const totalEnergyMev = ref(0)

// 実効増倍率 k の推定 (controlRodDepth=50, enrichment=60 で k ≈ 1.00)
const effectiveK = computed(() => {
  const baseK = (u235Enrichment.value / 60) * (1.6 - (controlRodDepth.value / 100) * 1.2)
  return Math.max(0.2, Math.min(2.5, baseK))
})

const criticalityStatus = computed(() => {
  const k = effectiveK.value
  if (k > 1.05) return { name: '臨界超過 (Supercritical)', color: '#f43f5e' }
  if (k < 0.95) return { name: '未臨界 (Subcritical)', color: '#38bdf8' }
  return { name: '臨界達成 (Critical k≈1.0)', color: '#10b981' }
})

// ==========================================================
// モバイル判定・カメラプリセット・キャッシュラベル
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35)
    ? Math.min(2.15, Math.max(1.48, 1.82 / Math.max(0.7, aspect)))
    : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0.08, 0.05, 41.0 * ms], target: [0.08, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.08, 42.0 * ms, 0.15], target: [0.08, 0, 0], fov: 14 }
  }
  return { pos: [0.2 * ms, 4.4 * ms, 13.4 * ms], target: [0.08, 0.05, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  syncGraphVisibility()
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.42) {
  const mult = isMobileViewport() ? 1.56 : 1.0
  const sig = `${textStr}|${color}|${borderColor}|${mult}`
  if (labelCache.get(sprite) !== sig) {
    labelCache.set(sprite, sig)
    sprite.updateText(textStr, color, borderColor)
  }
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  if (Math.abs(sprite.scale.y - h) > 0.004) {
    sprite.scale.set(h * asp, h, 1)
  }
}

// ==========================================================
// 動的 3D 曲線チューブビルダー
// ==========================================================
function buildDynamicTube(samples, radius, material) {
  const radialSegs = 8
  const vertCount = (samples + 1) * (radialSegs + 1)
  const positions = new Float32Array(vertCount * 3)
  const normals = new Float32Array(vertCount * 3)
  const indices = []
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j
      const b = (i + 1) * (radialSegs + 1) + j
      const c = (i + 1) * (radialSegs + 1) + j + 1
      const d = i * (radialSegs + 1) + j + 1
      indices.push(a, b, d, b, c, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setIndex(indices)
  const mesh = new THREE.Mesh(geo, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 3

  function updatePoints(pts, count) {
    const n = Math.min(pts.length, count)
    if (n < 2) {
      geo.setDrawRange(0, 0)
      return
    }
    for (let i = 0; i < n; i++) {
      const pPrev = pts[Math.max(0, i - 1)]
      const pNext = pts[Math.min(n - 1, i + 1)]
      let tx = pNext.x - pPrev.x
      let ty = pNext.y - pPrev.y
      const len = Math.hypot(tx, ty) || 1
      tx /= len
      ty /= len
      const nx = -ty
      const ny = tx
      for (let j = 0; j <= radialSegs; j++) {
        const th = (j / radialSegs) * Math.PI * 2
        const c = Math.cos(th)
        const s = Math.sin(th)
        const vx = c * nx
        const vy = c * ny
        const vz = s
        const idx = (i * (radialSegs + 1) + j) * 3
        positions[idx] = pts[i].x + radius * vx
        positions[idx + 1] = pts[i].y + radius * vy
        positions[idx + 2] = pts[i].z + radius * vz
        normals[idx] = vx
        normals[idx + 1] = vy
        normals[idx + 2] = vz
      }
    }
    geo.getAttribute('position').needsUpdate = true
    geo.getAttribute('normal').needsUpdate = true
    geo.setDrawRange(0, (n - 1) * radialSegs * 6)
  }

  return { mesh, updatePoints }
}

// ==========================================================
// シミュレーション物理状態
// ==========================================================
const CORE_HALF = 1.55
const MAX_NUCLEI = 64 // 4x4x4 炉心格子
const MAX_NEUTRONS = 220
const MAX_FRAGMENTS = 64
const MAX_FLASHES = 20
const HISTORY_LEN = 72

const nucleiList = []
const neutronList = []
const fragmentList = []
const flashList = []
const historyBuf = []
let sampleTimer = 0
let fissionsInWindow = 0

let sceneObjs = null

const COL_U235 = new THREE.Color(0x10b981)
const COL_U238 = new THREE.Color(0x334155)
const COL_DEPLETED = new THREE.Color(0x1e293b)
const COL_THERMAL = new THREE.Color(0xfbbf24)
const COL_FAST = new THREE.Color(0x38bdf8)
const COL_BA = new THREE.Color(0xfb7185)
const COL_KR = new THREE.Color(0xa855f7)

function spawnNeutron(x, y, z, isThermal = false) {
  if (neutronList.length >= MAX_NEUTRONS) return
  const th = Math.random() * Math.PI * 2
  const ph = Math.acos(2 * Math.random() - 1)
  const spd = isThermal ? 1.85 + Math.random() * 0.5 : 3.9 + Math.random() * 1.1
  neutronList.push({
    x,
    y,
    z,
    vx: Math.sin(ph) * Math.cos(th) * spd,
    vy: Math.sin(ph) * Math.sin(th) * spd,
    vz: Math.cos(ph) * spd,
    isThermal,
    age: 0,
    life: 5.5 + Math.random() * 2.5
  })
}

function initSimulation() {
  nucleiList.length = 0
  neutronList.length = 0
  fragmentList.length = 0
  flashList.length = 0
  historyBuf.length = 0
  fissionCount.value = 0
  totalEnergyMev.value = 0
  fissionsInWindow = 0
  sampleTimer = 0

  const grid = 4
  const span = 2.32
  for (let ix = 0; ix < grid; ix++) {
    for (let iy = 0; iy < grid; iy++) {
      for (let iz = 0; iz < grid; iz++) {
        const x = (ix / (grid - 1) - 0.5) * span + (Math.random() - 0.5) * 0.1
        const y = (iy / (grid - 1) - 0.5) * span + (Math.random() - 0.5) * 0.1
        const z = (iz / (grid - 1) - 0.5) * span + (Math.random() - 0.5) * 0.1
        const isU235 = Math.random() * 100 < u235Enrichment.value
        nucleiList.push({ x, y, z, isU235, isFissioned: false, flash: 0 })
      }
    }
  }

  // 初期の熱中性子を3個投入 (格子行の²³⁵Uを狙って確実に連鎖反応を開始)
  const u235Targets = nucleiList.filter((nuc) => nuc.isU235)
  for (let i = 0; i < 3; i++) {
    const tgt = u235Targets[i % Math.max(1, u235Targets.length)]
    const sx = -CORE_HALF + 0.08
    const sy = tgt ? tgt.y : (i - 1) * 0.39
    const sz = tgt ? tgt.z : (i % 2 === 0 ? -0.387 : 0.387)
    const dx = (tgt ? tgt.x : 0) - sx
    const dy = (tgt ? tgt.y : sy) - sy
    const dz = (tgt ? tgt.z : sz) - sz
    const len = Math.hypot(dx, dy, dz) || 1
    const spd = 2.4
    neutronList.push({
      x: sx,
      y: sy,
      z: sz,
      vx: (dx / len) * spd,
      vy: (dy / len) * spd,
      vz: (dz / len) * spd,
      isThermal: true,
      age: 0.8,
      life: 7.0
    })
  }

  for (let i = 0; i < 6; i++) {
    historyBuf.push({ n: 3, rate: 0 })
  }
  syncCounts()
}

function fireManualNeutron() {
  const u235Targets = nucleiList.filter((nuc) => !nuc.isFissioned && nuc.isU235)
  const tgt = u235Targets.length > 0 ? u235Targets[Math.floor(Math.random() * u235Targets.length)] : null
  const sx = -CORE_HALF + 0.05
  const sy = tgt ? tgt.y : (Math.random() < 0.5 ? -0.387 : 0.387)
  const sz = tgt ? tgt.z : (Math.random() < 0.5 ? -0.387 : 0.387)
  const dx = (tgt ? tgt.x : 0) - sx
  const dy = (tgt ? tgt.y : sy) - sy
  const dz = (tgt ? tgt.z : sz) - sz
  const len = Math.hypot(dx, dy, dz) || 1
  const spd = 2.6
  neutronList.push({
    x: sx,
    y: sy,
    z: sz,
    vx: (dx / len) * spd,
    vy: (dy / len) * spd,
    vz: (dz / len) * spd,
    isThermal: true,
    age: 0.8,
    life: 7.0
  })
  syncCounts()
}

function handleScram() {
  controlRodDepth.value = 100
}

function syncCounts() {
  let th = 0
  let fa = 0
  for (let i = 0; i < neutronList.length; i++) {
    if (neutronList[i].isThermal) th++
    else fa++
  }
  thermalCount.value = th
  fastCount.value = fa
  neutronCount.value = neutronList.length
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 160,
    onFrame: (dt, elapsed) => {
      updateFrame(dt, elapsed)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCamera(activeCam.value, 0)
        syncGraphVisibility()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.45, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D U-235 炉心 + 減速材タンク + 可動制御棒 (x = -2.95)
  // ======================================================
  const coreGroup = new THREE.Group()
  coreGroup.position.set(-2.95, 0.0, 0)
  scene.add(coreGroup)

  // 炉心底部圧力容器台座
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(3.65, 0.2, 3.65),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
  )
  basePlate.position.set(0, -1.8, 0)
  coreGroup.add(basePlate)

  // 減速材 (H₂O) タンク & チェレンコフ発光内部ボリューム (depthWrite: false)
  const tankW = 3.45
  const tankH = 3.35
  const tankGeo = new THREE.BoxGeometry(tankW, tankH, tankW)
  const tankMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    emissive: 0x0284c7,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.16,
    roughness: 0.1,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const tankMesh = new THREE.Mesh(tankGeo, tankMat)
  tankMesh.renderOrder = 6
  coreGroup.add(tankMesh)

  const tankEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tankGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
  )
  coreGroup.add(tankEdges)

  // 可動ホウ素制御棒 (3x3 = 9本、黒鉛/スチール質感)
  const rodGroup = new THREE.Group()
  coreGroup.add(rodGroup)
  const rodGeo = new THREE.CylinderGeometry(0.085, 0.085, 3.15, 16)
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.65,
    roughness: 0.35
  })
  const rodCapMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.2
  })
  const rodCoords = [-0.78, 0.0, 0.78]
  const rodPositions = []
  rodCoords.forEach((rx) => {
    rodCoords.forEach((rz) => {
      const rod = new THREE.Mesh(rodGeo, rodMat)
      rod.position.set(rx, 0, rz)
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.14, 16), rodCapMat)
      cap.position.set(0, 1.55, 0)
      rod.add(cap)
      rodGroup.add(rod)
      rodPositions.push([rx, rz])
    })
  })

  // InstancedMesh 燃料核 (64個)
  const nucGeo = new THREE.SphereGeometry(0.18, 16, 16)
  const nucMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.15 })
  const instNuclei = new THREE.InstancedMesh(nucGeo, nucMat, MAX_NUCLEI)
  instNuclei.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  coreGroup.add(instNuclei)

  // InstancedMesh 中性子 (熱中性子 #fbbf24 / 高速中性子 #38bdf8)
  const neutGeo = new THREE.SphereGeometry(0.085, 12, 12)
  const neutMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const instNeutrons = new THREE.InstancedMesh(neutGeo, neutMat, MAX_NEUTRONS)
  instNeutrons.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  coreGroup.add(instNeutrons)

  // InstancedMesh Kr/Ba 核分裂片 (#fb7185 / #a855f7)
  const fragGeo = new THREE.SphereGeometry(0.115, 12, 12)
  const fragMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0x331122, emissiveIntensity: 0.3 })
  const instFragments = new THREE.InstancedMesh(fragGeo, fragMat, MAX_FRAGMENTS)
  instFragments.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  coreGroup.add(instFragments)

  // 核分裂フラッシュ球プール
  const flashMeshes = []
  const flashGeo = new THREE.SphereGeometry(0.45, 16, 16)
  for (let i = 0; i < MAX_FLASHES; i++) {
    const fMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
    const fm = new THREE.Mesh(flashGeo, fMat)
    fm.visible = false
    fm.renderOrder = 5
    coreGroup.add(fm)
    flashMeshes.push({ mesh: fm, mat: fMat })
  }

  const labelCore = createTextSprite('⚛️ ²³⁵U 炉心 ＋ 減速材(H₂O)', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.42
  })
  labelCore.position.set(0, -2.28, 2.25)
  coreGroup.add(labelCore)

  const labelRods = createTextSprite('制御棒 挿入率 50%', {
    color: '#cbd5e1',
    borderColor: '#64748b',
    scale: 0.38
  })
  labelRods.position.set(0, 2.58, 2.05)
  coreGroup.add(labelRods)

  // ======================================================
  // 2. 右側: 3D 中性子数 & 反応率 / k_eff グラフ (x = +3.1)
  // ======================================================
  const graphGroup = new THREE.Group()
  graphGroup.position.set(3.1, 0.05, 0)
  scene.add(graphGroup)

  const boardW = 5.65
  const boardH = 4.25
  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(boardW, boardH),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  boardBack.position.set(0, 0, -0.08)
  boardBack.renderOrder = 0
  graphGroup.add(boardBack)

  const boardBorder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(boardW, boardH)),
    new THREE.LineBasicMaterial({ color: 0x475569 })
  )
  boardBorder.position.set(0, 0, -0.06)
  graphGroup.add(boardBorder)

  const axX0 = -2.35
  const axY0 = -1.62
  const axW = 3.85
  const axH = 3.22

  const tAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.07, headLength: 0.2 })
  tAx.setVector(new THREE.Vector3(axX0, axY0, 0.02), new THREE.Vector3(1, 0, 0), axW + 0.18)
  const nAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.07, headLength: 0.2 })
  nAx.setVector(new THREE.Vector3(axX0, axY0, 0.02), new THREE.Vector3(0, 1, 0), axH + 0.2)
  graphGroup.add(tAx, nAx)

  const nPts = Array.from({ length: HISTORY_LEN }, () => new THREE.Vector3())
  const rPts = Array.from({ length: HISTORY_LEN }, () => new THREE.Vector3())
  const nTube = buildDynamicTube(
    HISTORY_LEN - 1,
    0.044,
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.65 })
  )
  const rTube = buildDynamicTube(
    HISTORY_LEN - 1,
    0.036,
    new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xe11d48, emissiveIntensity: 0.55 })
  )
  graphGroup.add(nTube.mesh, rTube.mesh)

  // k_eff 垂直ゲージバー (ボード右端 x = +2.05)
  const gaugeX = 2.08
  const gaugeH = 2.8
  const gaugeBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, gaugeH, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.75 })
  )
  gaugeBack.position.set(gaugeX, -0.15, 0.04)
  graphGroup.add(gaugeBack)

  const kBarGeo = new THREE.BoxGeometry(0.24, 1.0, 0.18)
  kBarGeo.translate(0, 0.5, 0)
  const kBarMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 })
  const kBarMesh = new THREE.Mesh(kBarGeo, kBarMat)
  kBarMesh.position.set(gaugeX, -0.15 - gaugeH / 2, 0.06)
  graphGroup.add(kBarMesh)

  // k = 1.0 臨界基準リング
  const kCritY = -0.15 - gaugeH / 2 + (1.0 / 2.5) * gaugeH
  const kCritLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.04, 0.24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  kCritLine.position.set(gaugeX, kCritY, 0.08)
  graphGroup.add(kCritLine)

  const labelGraphTitle = createTextSprite('📊 中性子数 & 核分裂率 / k_eff', {
    color: '#f8fafc',
    borderColor: 'rgba(56,189,248,0.45)',
    scale: 0.43
  })
  labelGraphTitle.position.set(-0.2, 2.52, 0.1)
  graphGroup.add(labelGraphTitle)

  const labelK = createTextSprite('k=1.00', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.36
  })
  labelK.position.set(gaugeX, 1.55, 0.15)
  graphGroup.add(labelK)

  const labelCritRef = createTextSprite('臨界 k=1', {
    color: '#f8fafc',
    borderColor: '#94a3b8',
    scale: 0.30
  })
  labelCritRef.position.set(gaugeX - 0.65, kCritY, 0.15)
  graphGroup.add(labelCritRef)

  sceneObjs = {
    tankMesh,
    tankMat,
    tankEdges,
    rodGroup,
    rodPositions,
    instNuclei,
    instNeutrons,
    instFragments,
    flashMeshes,
    dummy: new THREE.Object3D(),
    labelCore,
    labelRods,
    nPts,
    rPts,
    nTube,
    rTube,
    kBarMesh,
    kBarMat,
    gaugeH,
    labelGraphTitle,
    labelK,
    labelCritRef,
    axX0,
    axY0,
    axW,
    axH
  }

  initSimulation()
  syncGraphVisibility()
  updateFrame(0, 0)
}

function syncGraphVisibility() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'
  const { labelGraphTitle, labelK, labelCritRef, labelCore, labelRods } = sceneObjs

  labelGraphTitle.visible = !isTop
  labelK.visible = !isTop
  labelCritRef.visible = !isTop
  labelCore.visible = !isTop
  labelRods.position.set(0, isTop ? 3.55 : 2.58, isTop ? -2.18 : 2.05)

  updateLabelCached(
    labelGraphTitle,
    mob ? '📊 中性子数 & k_eff' : '📊 中性子数 & 核分裂率 / k_eff',
    '#f8fafc',
    'rgba(56,189,248,0.45)',
    0.43
  )
  updateLabelCached(
    labelCore,
    mob ? '⚛️ ²³⁵U 炉心' : '⚛️ ²³⁵U 炉心 ＋ 減速材(H₂O)',
    '#6ee7b7',
    '#10b981',
    0.42
  )
  void labelRods
}

function updateFrame(dt, elapsed) {
  if (!sceneObjs) return

  const {
    tankMesh,
    tankMat,
    tankEdges,
    rodGroup,
    rodPositions,
    instNuclei,
    instNeutrons,
    instFragments,
    flashMeshes,
    dummy,
    labelRods,
    nPts,
    rPts,
    nTube,
    rTube,
    kBarMesh,
    kBarMat,
    gaugeH,
    labelK,
    axX0,
    axY0,
    axW,
    axH
  } = sceneObjs

  tankMesh.visible = showModeratorTank.value
  tankEdges.visible = showModeratorTank.value

  // 制御棒の挿入位置更新 (0%: y=+3.2, 100%: y=+0.05)
  const depthFrac = controlRodDepth.value / 100
  const rodCenterY = 3.25 - depthFrac * 3.22
  rodGroup.position.set(0, rodCenterY, 0)
  const rodBottomY = rodCenterY - 1.55

  updateLabelCached(labelRods, `制御棒 ${controlRodDepth.value}%`, '#cbd5e1', '#64748b', 0.37)

  const scaledDt = isPlaying.value ? dt * timeScale.value : 0

  if (scaledDt > 0) {
    // 1. 中性子更新
    for (let i = neutronList.length - 1; i >= 0; i--) {
      const n = neutronList[i]
      n.age += scaledDt
      n.life -= scaledDt

      // 減速材による熱中性子化 (高速 #38bdf8 -> 弾性散乱減速 -> 熱中性子 #fbbf24)
      if (!n.isThermal && n.age > 0.26) {
        n.isThermal = true
        const curSpd = Math.hypot(n.vx, n.vy, n.vz) || 1
        const targetSpd = 1.9 + Math.random() * 0.45
        n.vx = (n.vx / curSpd) * targetSpd
        n.vy = (n.vy / curSpd) * targetSpd
        n.vz = (n.vz / curSpd) * targetSpd
      }

      n.x += n.vx * scaledDt
      n.y += n.vy * scaledDt
      n.z += n.vz * scaledDt

      // 反射材/減速材境界で一部散乱反射し、残りは炉心外へ漏れ出す
      const bounceLimit = CORE_HALF + 0.14
      if (Math.abs(n.x) > bounceLimit || Math.abs(n.y) > bounceLimit || Math.abs(n.z) > bounceLimit) {
        if (Math.random() < 0.38 * (effectiveK.value / 1.0)) {
          if (Math.abs(n.x) > bounceLimit) { n.x = Math.sign(n.x) * bounceLimit; n.vx *= -1 }
          if (Math.abs(n.y) > bounceLimit) { n.y = Math.sign(n.y) * bounceLimit; n.vy *= -1 }
          if (Math.abs(n.z) > bounceLimit) { n.z = Math.sign(n.z) * bounceLimit; n.vz *= -1 }
        } else {
          neutronList.splice(i, 1)
          continue
        }
      }
      if (n.life <= 0) {
        neutronList.splice(i, 1)
        continue
      }

      // 制御棒による吸収判定 (B/Cd)
      let absorbed = false
      if (n.y > rodBottomY) {
        for (let r = 0; r < rodPositions.length; r++) {
          const [rx, rz] = rodPositions[r]
          if (Math.hypot(n.x - rx, n.z - rz) < 0.25) {
            absorbed = true
            break
          }
        }
      }
      if (!absorbed && Math.random() < depthFrac * 0.85 * scaledDt) {
        absorbed = true
      }
      if (absorbed) {
        neutronList.splice(i, 1)
        continue
      }

      // 235U 原子核との衝突・核分裂判定 (熱中性子は断面積が大、高速中性子は小)
      const captureR = n.isThermal ? 0.50 : 0.22
      for (let j = 0; j < nucleiList.length; j++) {
        const nuc = nucleiList[j]
        if (!nuc.isFissioned && nuc.isU235) {
          const d = Math.hypot(n.x - nuc.x, n.y - nuc.y, n.z - nuc.z)
          if (d < captureR) {
            nuc.isFissioned = true
            nuc.flash = 1.0
            fissionCount.value++
            totalEnergyMev.value += 200
            fissionsInWindow++

            neutronList.splice(i, 1)

            // 2〜3個の新しい高速中性子を放出 (うち1個は隣接燃料へ向かいやすい散乱)
            const numNew = Math.random() < 0.45 ? 2 : 3
            for (let k = 0; k < numNew; k++) {
              spawnNeutron(nuc.x, nuc.y, nuc.z, false)
            }

            // 2個の分裂片 (Ba-141 coral + Kr-92 violet) を逆方向へ放出
            if (fragmentList.length < MAX_FRAGMENTS - 2) {
              const th = Math.random() * Math.PI * 2
              const ph = Math.acos(2 * Math.random() - 1)
              const dx = Math.sin(ph) * Math.cos(th)
              const dy = Math.sin(ph) * Math.sin(th)
              const dz = Math.cos(ph)
              fragmentList.push(
                { x: nuc.x, y: nuc.y, z: nuc.z, vx: dx * 1.9, vy: dy * 1.9, vz: dz * 1.9, life: 1.0, isBa: true },
                { x: nuc.x, y: nuc.y, z: nuc.z, vx: -dx * 2.1, vy: -dy * 2.1, vz: -dz * 2.1, life: 1.0, isBa: false }
              )
            }

            // フラッシュ発生
            if (flashList.length < MAX_FLASHES) {
              flashList.push({ x: nuc.x, y: nuc.y, z: nuc.z, life: 1.0 })
            }
            break
          }
        }
      }
    }

    // 2. 分裂片更新
    for (let i = fragmentList.length - 1; i >= 0; i--) {
      const f = fragmentList[i]
      f.x += f.vx * scaledDt
      f.y += f.vy * scaledDt
      f.z += f.vz * scaledDt
      f.life -= scaledDt * 1.1
      if (f.life <= 0) fragmentList.splice(i, 1)
    }

    // 3. フラッシュ減衰 & 燃料の緩やかな再生 (定常観察用)
    for (let i = flashList.length - 1; i >= 0; i--) {
      flashList[i].life -= scaledDt * 2.8
      if (flashList[i].life <= 0) flashList.splice(i, 1)
    }
    for (let i = 0; i < nucleiList.length; i++) {
      const nuc = nucleiList[i]
      if (nuc.flash > 0) nuc.flash = Math.max(0, nuc.flash - scaledDt * 2.5)
      else if (nuc.isFissioned && Math.random() < 0.45 * scaledDt) nuc.isFissioned = false
    }

    // 中性子全滅時の自動補給 (定常観察用: 稼働中の²³⁵Uを狙って補給)
    if (neutronList.length === 0) {
      fireManualNeutron()
      fireManualNeutron()
    }

    // グラフ履歴サンプリング
    sampleTimer += scaledDt
    if (sampleTimer >= 0.16) {
      sampleTimer = 0
      historyBuf.push({ n: neutronList.length, rate: fissionsInWindow })
      fissionsInWindow = 0
      if (historyBuf.length > HISTORY_LEN) historyBuf.shift()
    }

    syncCounts()
  }

  // チェレンコフ光強度を反応数に連動
  tankMat.emissiveIntensity = 0.14 + Math.min(0.45, neutronList.length / 120)

  // InstancedMesh 燃料核更新
  for (let i = 0; i < MAX_NUCLEI; i++) {
    const nuc = nucleiList[i]
    if (!nuc) {
      dummy.position.set(0, -999, 0)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      instNuclei.setMatrixAt(i, dummy.matrix)
      continue
    }
    dummy.position.set(nuc.x, nuc.y, nuc.z)
    const sc = nuc.isFissioned ? 0.55 : nuc.isU235 ? 1.0 + 0.08 * Math.sin(elapsed * 3.5 + i) : 0.82
    dummy.scale.setScalar(sc)
    dummy.updateMatrix()
    instNuclei.setMatrixAt(i, dummy.matrix)
    instNuclei.setColorAt(i, nuc.isFissioned ? COL_DEPLETED : nuc.isU235 ? COL_U235 : COL_U238)
  }
  instNuclei.instanceMatrix.needsUpdate = true
  if (instNuclei.instanceColor) instNuclei.instanceColor.needsUpdate = true

  // InstancedMesh 中性子更新 (#fbbf24 熱中性子 / #38bdf8 高速中性子)
  for (let i = 0; i < MAX_NEUTRONS; i++) {
    if (i < neutronList.length) {
      const n = neutronList[i]
      dummy.position.set(n.x, n.y, n.z)
      dummy.scale.setScalar(n.isThermal ? 1.05 : 0.92)
      dummy.updateMatrix()
      instNeutrons.setMatrixAt(i, dummy.matrix)
      instNeutrons.setColorAt(i, n.isThermal ? COL_THERMAL : COL_FAST)
    } else {
      dummy.position.set(0, -999, 0)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      instNeutrons.setMatrixAt(i, dummy.matrix)
    }
  }
  instNeutrons.instanceMatrix.needsUpdate = true
  if (instNeutrons.instanceColor) instNeutrons.instanceColor.needsUpdate = true

  // InstancedMesh 分裂片更新
  for (let i = 0; i < MAX_FRAGMENTS; i++) {
    if (i < fragmentList.length) {
      const f = fragmentList[i]
      dummy.position.set(f.x, f.y, f.z)
      dummy.scale.setScalar(Math.max(0.2, f.life))
      dummy.updateMatrix()
      instFragments.setMatrixAt(i, dummy.matrix)
      instFragments.setColorAt(i, f.isBa ? COL_BA : COL_KR)
    } else {
      dummy.position.set(0, -999, 0)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      instFragments.setMatrixAt(i, dummy.matrix)
    }
  }
  instFragments.instanceMatrix.needsUpdate = true
  if (instFragments.instanceColor) instFragments.instanceColor.needsUpdate = true

  // フラッシュ更新
  for (let i = 0; i < MAX_FLASHES; i++) {
    const fm = flashMeshes[i]
    if (i < flashList.length) {
      const fl = flashList[i]
      fm.mesh.visible = true
      fm.mesh.position.set(fl.x, fl.y, fl.z)
      fm.mesh.scale.setScalar(0.5 + (1 - fl.life) * 2.1)
      fm.mat.opacity = fl.life * 0.85
    } else {
      fm.mesh.visible = false
    }
  }

  // 右側 3D 中性子数 & 反応率グラフ更新
  const countH = historyBuf.length
  if (countH >= 2) {
    const maxN = Math.max(30, ...historyBuf.map((h) => h.n))
    const maxR = Math.max(6, ...historyBuf.map((h) => h.rate))
    for (let i = 0; i < countH; i++) {
      const gx = axX0 + (i / (HISTORY_LEN - 1)) * axW
      nPts[i].set(gx, axY0 + (historyBuf[i].n / maxN) * axH, 0.06)
      rPts[i].set(gx, axY0 + (historyBuf[i].rate / maxR) * axH * 0.85, 0.04)
    }
    nTube.updatePoints(nPts, countH)
    rTube.updatePoints(rPts, countH)
  }

  // k_eff ゲージバー更新
  const k = effectiveK.value
  const kFrac = Math.min(1, Math.max(0.05, k / 2.5))
  kBarMesh.scale.set(1, kFrac * gaugeH, 1)
  const kColorHex = k > 1.05 ? 0xf43f5e : k < 0.95 ? 0x38bdf8 : 0x10b981
  kBarMat.color.setHex(kColorHex)
  kBarMat.emissive.setHex(kColorHex)
  const kCss = k > 1.05 ? '#fda4af' : k < 0.95 ? '#7dd3fc' : '#6ee7b7'
  const kBdr = k > 1.05 ? '#f43f5e' : k < 0.95 ? '#38bdf8' : '#10b981'
  updateLabelCached(labelK, `k=${k.toFixed(2)}`, kCss, kBdr, 0.36)
}

watch(u235Enrichment, () => {
  initSimulation()
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
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.sim-header {
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.08rem;
  color: #38bdf8;
}

.header-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.three-badge {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.badge {
  font-size: 0.74rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 10px;
  margin-bottom: 10px;
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

.chip-btn {
  padding: 5px 11px;
  font-size: 0.76rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
  color: #f8fafc;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px;
  border-radius: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #38bdf8;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.speed-btn-group button {
  background: transparent;
  border: 1px solid transparent;
  color: #cbd5e1;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
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
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
  z-index: 5;
}

.three-hud-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.73rem;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.legend-text {
  line-height: 1.25;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-u235 { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-thermal { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.dot-fast { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-frag { background: #fb7185; box-shadow: 0 0 6px #a855f7; }
.legend-item i.bar-rod { width: 7px; height: 12px; border-radius: 2px; background: #64748b; }

.three-hud-bottom {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  z-index: 5;
}

.three-hud-hint {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
}

.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.state-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.stat-card {
  background: rgba(15, 23, 42, 0.7);
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card .lbl {
  font-size: 0.72rem;
  color: #94a3b8;
}

.stat-card .val {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.92rem;
  color: #f1f5f9;
}

.stat-card .val small {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: normal;
}

.controls-panel {
  margin-top: 1rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control-group label {
  font-size: 0.78rem;
  color: #cbd5e1;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn {
  padding: 6px 12px;
  font-size: 0.78rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-neutron {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #38bdf8;
}

.btn-scram {
  background: rgba(244, 63, 94, 0.2);
  color: #fda4af;
  border: 1px solid #f43f5e;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-reset {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 12px;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    justify-content: space-between;
    padding: 6px 8px;
  }
  .three-hud-legend {
    gap: 6px;
    font-size: 0.65rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.65rem;
    padding: 3px 8px;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .state-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
