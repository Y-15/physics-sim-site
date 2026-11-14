<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🌡️</span>
        <h3>3D 水銀柱と大気圧・トリチェリの真空シミュレーター</h3>
        <span class="three-badge">Three.js 3D Hydrostatics</span>
      </div>
      <div class="sim-badges">
        <span class="badge" :class="simData.isTorricelliVacuum ? 'badge-cyan' : (simData.isFullMercury ? 'badge-amber' : 'badge-emerald')">
          {{ simData.isTorricelliVacuum ? '✨ トリチェリの真空 (P=0)' : (simData.isFullMercury ? '⚠️ 管上端まで満杯' : '🟢 封入気体あり (ボイル・シャルル)') }}
        </span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 3Dカメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isRunning ? '⏸ 一時停止' : '▶ アニメ再生' }}
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
      <button class="btn btn-secondary" @click="stepSim(0.1)">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="resetSim">🔄 標準状態へリセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-hg"></i>水銀柱 <b><i>h</i></b></span>
          <span class="legend-item"><i class="dot-atm"></i>大気圧 <b><i>P</i><sub>0</sub></b></span>
          <span class="legend-item"><i class="dot-vac"></i>真空 <b><i>P</i>=0</b></span>
          <span class="legend-item"><i class="dot-gas"></i>封入気体</span>
          <span class="legend-item"><i class="dot-slant"></i>管沿い長さ <b><i>l</i> = <i>h</i>/cos<i>θ</i></b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータス帯（ビューポート外でモバイル重複ゼロ） -->
    <div class="mode-status-strip">
      <span class="three-status-badge">
        等圧面のつり合い: <i>P</i><sub>0</sub> ({{ atmosphericPressure }} mmHg) ＝ <i>P</i><sub>gas</sub> ({{ simData.Pgas }}) ＋ 液柱圧 ({{ simData.Pcol }}) ・ 鉛直高さ <i>h</i> = {{ simData.h }} mm (管沿い <i>l</i> = {{ simData.slantL }} mm)
      </span>
    </div>

    <!-- テレメトリカード（従来4項目 + 管沿い長さ） -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">大気圧 <i>P</i><sub>0</sub></div>
        <div class="stat-value text-cyan">{{ atmosphericPressure }} <span class="stat-unit">mmHg</span></div>
        <div class="stat-sub">{{ (atmosphericPressure * 1.33322).toFixed(0) }} hPa</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">鉛直高さ <i>h</i></div>
        <div class="stat-value text-gold">{{ simData.h }} <span class="stat-unit">mm</span></div>
        <div class="stat-sub">傾けても <i>h</i> = <i>l</i> cos<i>θ</i> 一定</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">管沿い水銀長 <i>l</i></div>
        <div class="stat-value text-amber">{{ simData.slantL }} <span class="stat-unit">mm</span></div>
        <div class="stat-sub"><i>θ</i> = {{ tiltAngleDeg }}° (cos<i>θ</i> = {{ Math.cos(tiltAngleDeg * Math.PI / 180).toFixed(2) }})</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">気柱の長さ <i>L</i></div>
        <div class="stat-value">{{ simData.L }} <span class="stat-unit">mm</span></div>
        <div class="stat-sub">管沿い隙間 {{ simData.slantGap }} mm</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">上部圧力 <i>P</i><sub>gas</sub></div>
        <div class="stat-value text-emerald">{{ simData.Pgas }} <span class="stat-unit">mmHg</span></div>
        <div class="stat-sub">{{ simData.isTorricelliVacuum ? '完全真空' : '封入気体' }}</div>
      </div>
    </div>

    <!-- コントロール群（既存4スライダー + 角度・管半径・気圧/流体プリセット完全保持） -->
    <div class="controls-panel">
      <div class="preset-bars">
        <div class="preset-row">
          <span class="preset-cat">📐 ガラス管の傾き <i>θ</i>:</span>
          <button class="select-btn" :class="{ active: tiltAngleDeg === 0 }" @click="tiltAngleDeg = 0">0° (垂直)</button>
          <button class="select-btn" :class="{ active: tiltAngleDeg === 30 }" @click="tiltAngleDeg = 30">30°</button>
          <button class="select-btn" :class="{ active: tiltAngleDeg === 45 }" @click="tiltAngleDeg = 45">45°</button>
          <button class="select-btn" :class="{ active: tiltAngleDeg === 60 }" @click="tiltAngleDeg = 60">60° (<i>l</i>=2<i>h</i>)</button>
        </div>
        <div class="preset-row">
          <span class="preset-cat">🧪 気圧・流体モード:</span>
          <button class="select-btn" :class="{ active: atmosphericPressure === 760 && fluidDensity === 13.6 }" @click="atmosphericPressure = 760; fluidDensity = 13.6">標準 (760 mmHg / 水銀)</button>
          <button class="select-btn" :class="{ active: atmosphericPressure === 720 && fluidDensity === 13.6 }" @click="atmosphericPressure = 720; fluidDensity = 13.6">低気圧 (720 mmHg)</button>
          <button class="select-btn" :class="{ active: atmosphericPressure === 800 && fluidDensity === 13.6 }" @click="atmosphericPressure = 800; fluidDensity = 13.6">高気圧 (800 mmHg)</button>
          <button class="select-btn" :class="{ active: fluidDensity === 15.5 }" @click="fluidDensity = 15.5">高密度流体 (15.5 g/cm³)</button>
          <button class="select-btn" :class="{ active: fluidDensity === 12.4 }" @click="fluidDensity = 12.4">軽合金流体 (12.4 g/cm³)</button>
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>ガラス管の引き上げ高さ <i>H</i>: <span>{{ tubePullUp }} mm</span></label>
          <input type="range" v-model.number="tubePullUp" min="700" max="880" step="5" />
        </div>
        <div class="control-group">
          <label>大気圧 <i>P</i><sub>0</sub>: <span>{{ atmosphericPressure }} mmHg</span></label>
          <input type="range" v-model.number="atmosphericPressure" min="720" max="800" step="5" />
        </div>
        <div class="control-group">
          <label>ガラス管の傾き <i>θ</i>: <span>{{ tiltAngleDeg }}°</span></label>
          <input type="range" v-model.number="tiltAngleDeg" min="0" max="60" step="5" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>封入気体の量 <i>n</i>: <span>{{ gasAmount === 0 ? '真空 (0)' : gasAmount }}</span></label>
          <input type="range" v-model.number="gasAmount" min="0" max="10" step="1" />
        </div>
        <div class="control-group">
          <label>気体温度 <i>T</i>: <span>{{ gasTemperature }} K</span></label>
          <input type="range" v-model.number="gasTemperature" min="250" max="400" step="5" :disabled="gasAmount === 0" />
        </div>
        <div class="control-group">
          <label>ガラス管の内半径 <i>r</i> (断面積比較): <span>{{ tubeRadiusMm }} mm</span></label>
          <input type="range" v-model.number="tubeRadiusMm" min="10" max="24" step="2" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-secondary" @click="gasAmount = 0">トリチェリ真空に戻す</button>
        <button class="btn btn-reset" @click="resetSim">標準状態へリセット</button>
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
const activeCam = ref('3d')
const isRunning = ref(true)
const timeScale = ref(0.5)

// 物理パラメータ（HEAD完全互換 + 傾斜・管半径・流体密度モード）
const atmosphericPressure = ref(760) // 大気圧 P0 [mmHg]
const tubePullUp = ref(850)          // 水銀槽液面からの管上端の鉛直高さ H [mm] (700 ~ 880)
const gasAmount = ref(0)             // 封入気体の量 [0ならトリチェリの真空]
const gasTemperature = ref(300)      // 気体温度 T [K] (250 ~ 400)
const tiltAngleDeg = ref(0)          // 鉛直からの傾き θ [deg] (0 ~ 60)
const tubeRadiusMm = ref(16)         // 管半径 r [mm] (10 ~ 24)
const fluidDensity = ref(13.6)       // 液体密度 ρ [g/cm^3] (水銀 13.6)

const simData = computed(() => {
  const P0 = atmosphericPressure.value
  const H = tubePullUp.value
  const n = gasAmount.value
  const T = gasTemperature.value
  const cosTheta = Math.max(0.25, Math.cos((tiltAngleDeg.value * Math.PI) / 180))
  const rhoFactor = fluidDensity.value / 13.6
  const areaFactor = Math.pow(tubeRadiusMm.value / 16, 2)

  // C = n * (T / 300) * 8000 (基準半径・垂直・水銀時HEAD一致)
  const C = n * (T / 300) * 8000
  const Ceff = (C * cosTheta) / areaFactor

  if (n === 0) {
    const hMax = P0 / rhoFactor
    const h = Math.min(H, hMax)
    const L = Math.max(0, H - h)
    const Pgas = 0
    const Pcol = h * rhoFactor
    return {
      hNum: h,
      LNum: L,
      h: h.toFixed(1),
      L: L.toFixed(1),
      slantL: (h / cosTheta).toFixed(1),
      slantGap: (L / cosTheta).toFixed(1),
      Pgas: Pgas.toFixed(1),
      Pcol: Pcol.toFixed(1),
      isTorricelliVacuum: H >= hMax - 0.05,
      isFullMercury: H < hMax - 0.05
    }
  }

  // (P0 - rhoFactor * h) * (H - h) = Ceff
  // rhoFactor * h^2 - (P0 + rhoFactor * H) * h + (P0 * H - Ceff) = 0
  const a = rhoFactor
  const b = P0 + rhoFactor * H
  const c = P0 * H - Ceff
  const discriminant = Math.max(0, b * b - 4 * a * c)
  const h = (b - Math.sqrt(discriminant)) / (2 * a)
  const clampedH = Math.max(0, Math.min(H, h))
  const L = Math.max(0, H - clampedH)
  const Pcol = clampedH * rhoFactor
  const Pgas = Math.max(0, P0 - Pcol)

  return {
    hNum: clampedH,
    LNum: L,
    h: clampedH.toFixed(1),
    L: L.toFixed(1),
    slantL: (clampedH / cosTheta).toFixed(1),
    slantGap: (L / cosTheta).toFixed(1),
    Pgas: Pgas.toFixed(1),
    Pcol: Pcol.toFixed(1),
    isTorricelliVacuum: false,
    isFullMercury: L < 0.5
  }
})

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepSim(dt = 0.1) {
  isRunning.value = false
  simTime += dt
  updateFrame(0)
}

function resetSim() {
  atmosphericPressure.value = 760
  tubePullUp.value = 850
  gasAmount.value = 0
  gasTemperature.value = 300
  tiltAngleDeg.value = 0
  tubeRadiusMm.value = 16
  fluidDensity.value = 13.6
  simTime = 0
}

// ==========================================================
// Three.js 3D 座標・カメラ設計
// ==========================================================
const MM_TO_3D = 0.0040 // 1000mm -> 4.00 units (850mm -> 3.40, 760mm -> 3.04)

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(2.1, Math.max(1.42, 1.82 / Math.max(0.68, aspect))) : 1.0
}

function isMobileView() {
  return getMobScale() > 1.02
}

function getPivotX() {
  const rad = (tiltAngleDeg.value * Math.PI) / 180
  return -1.45 * Math.sin(rad)
}

function getCamCenterX() {
  const rad = (tiltAngleDeg.value * Math.PI) / 180
  return 1.15 * Math.sin(rad)
}

function getCamParams(preset) {
  const ms = getMobScale()
  const cx = getCamCenterX()
  const tiltBoost = 1 + 0.28 * Math.sin((tiltAngleDeg.value * Math.PI) / 180)
  if (preset === 'front') {
    return { pos: [cx, 1.55, 37.5 * ms * tiltBoost], target: [cx, 1.55, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 39.0 * ms * tiltBoost, 0.45], target: [cx, 0.4, 0], fov: 14 }
  }
  return { pos: [cx + 0.9 * ms, 3.15 * ms, 12.6 * ms * tiltBoost], target: [cx, 1.52, 0], fov: 40 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let simTime = 0
let resizeObs = null
let lastIsMob = false
let sceneState = null
const labelCache = {}

function setLabelText(sprite, key, text, color, borderColor, baseScale = 0.48) {
  const mult = isMobileView() ? 1.55 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(text, color, borderColor)
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  sprite.scale.set(h * asp, h, 1)
}

function disposeObj(obj) {
  if (!obj) return
  if (obj.geometry) obj.geometry.dispose()
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((m) => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    } else {
      if (obj.material.map) obj.material.map.dispose()
      obj.material.dispose()
    }
  }
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const ch = group.children[0]
    group.remove(ch)
    ch.traverse(disposeObj)
  }
}

function createDashedLine(pts, color, opacity = 0.85) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  const mat = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.14,
    gapSize: 0.09,
    transparent: true,
    opacity
  })
  const line = new THREE.Line(geo, mat)
  line.computeLineDistances()
  return line
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastIsMob = isMobileView()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 120,
    onFrame: (dt) => {
      if (isRunning.value) {
        simTime += dt * timeScale.value
      }
      updateFrame(dt)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileView()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        rebuildDynamicLabels()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // ラボ床グリッド
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  grid.position.set(0.4, -1.02, 0)
  scene.add(grid)

  // ラボ台座プレート
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.14, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.55 })
  )
  basePlate.position.set(0, -0.94, 0)
  scene.add(basePlate)

  // 水銀槽 (幅 5.4, 奥行 2.2, 液面 y=0, 槽底 y=-0.85, 槽縁 y=+0.24)
  const troughW = 5.4
  const troughD = 2.2
  const troughBottomY = -0.85

  // 槽内の水銀プール (renderOrder: 1, metallic sheen)
  const hgPoolGeo = new THREE.BoxGeometry(troughW - 0.12, 0.85, troughD - 0.12)
  const hgPoolMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.84,
    roughness: 0.18,
    emissive: 0x334155,
    emissiveIntensity: 0.2
  })
  const hgPoolMesh = new THREE.Mesh(hgPoolGeo, hgPoolMat)
  hgPoolMesh.position.set(0, -0.425, 0)
  hgPoolMesh.renderOrder = 1
  scene.add(hgPoolMesh)

  // 槽表面シマーリング用薄い平面 (y = +0.004)
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.1,
    transparent: true,
    opacity: 0.55
  })
  const surfaceMesh = new THREE.Mesh(new THREE.PlaneGeometry(troughW - 0.14, troughD - 0.14), surfaceMat)
  surfaceMesh.rotation.x = -Math.PI / 2
  surfaceMesh.position.set(0, 0.005, 0)
  surfaceMesh.renderOrder = 1
  scene.add(surfaceMesh)

  // ガラス水槽壁 (depthWrite: false, renderOrder: 6)
  const glassTroughMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const wallH = 1.12
  const wallY = troughBottomY + wallH / 2
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(troughW, wallH), glassTroughMat)
  frontWall.position.set(0, wallY, troughD / 2)
  frontWall.renderOrder = 6
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(troughW, wallH), glassTroughMat)
  backWall.position.set(0, wallY, -troughD / 2)
  backWall.renderOrder = 6
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(troughD, wallH), glassTroughMat)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-troughW / 2, wallY, 0)
  leftWall.renderOrder = 6
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(troughD, wallH), glassTroughMat)
  rightWall.rotation.y = Math.PI / 2
  rightWall.position.set(troughW / 2, wallY, 0)
  rightWall.renderOrder = 6
  scene.add(frontWall, backWall, leftWall, rightWall)

  // 水槽上縁メタルフレーム
  const rimFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
  const rimThick = 0.055
  const rimY = troughBottomY + wallH
  const rimF = new THREE.Mesh(new THREE.BoxGeometry(troughW + rimThick, rimThick, rimThick), rimFrameMat)
  rimF.position.set(0, rimY, troughD / 2)
  const rimB = rimF.clone()
  rimB.position.set(0, rimY, -troughD / 2)
  const rimL = new THREE.Mesh(new THREE.BoxGeometry(rimThick, rimThick, troughD + rimThick), rimFrameMat)
  rimL.position.set(-troughW / 2, rimY, 0)
  const rimR = rimL.clone()
  rimR.position.set(troughW / 2, rimY, 0)
  scene.add(rimF, rimB, rimL, rimR)

  // 等圧面ガイドライン（y = 0, 点A・点Bマーカー）
  const levelLine = createDashedLine(
    [new THREE.Vector3(-2.65, 0.01, troughD / 2 + 0.04), new THREE.Vector3(2.65, 0.01, troughD / 2 + 0.04)],
    0x38bdf8,
    0.9
  )
  scene.add(levelLine)

  const pointADot = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
  )
  pointADot.position.set(-2.0, 0.01, 0.55)
  const pointBDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.8 })
  )
  pointBDot.position.set(0, 0.01, 0)
  scene.add(pointADot, pointBDot)

  // 大気圧 P0 矢印4本 (水銀面を押す)
  const atmArrows = []
  const atmPulses = []
  for (let i = 0; i < 4; i++) {
    const arr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.04, headRadius: 0.13, headLength: 0.28 })
    scene.add(arr)
    atmArrows.push(arr)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.022, 8, 24).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.65 })
    )
    scene.add(ring)
    atmPulses.push(ring)
  }

  // 動的ガラス管＋寸法ガイド＋ガス分子コンテナ
  const dynamicGroup = new THREE.Group()
  scene.add(dynamicGroup)

  // ガス分子プール (28個, 気体封入時のみ表示)
  const gasMolsGroup = new THREE.Group()
  scene.add(gasMolsGroup)
  const gasMols = []
  const molGeo = new THREE.SphereGeometry(0.048, 12, 12)
  const molMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.65 })
  for (let i = 0; i < 28; i++) {
    const m = new THREE.Mesh(molGeo, molMat)
    m.renderOrder = 1
    m.userData = {
      yNorm: Math.random(),
      rNorm: Math.sqrt(Math.random()) * 0.78,
      ang: Math.random() * Math.PI * 2,
      vy: (Math.random() - 0.5) * 2.4,
      vAng: (Math.random() - 0.5) * 3.5
    }
    gasMolsGroup.add(m)
    gasMols.push(m)
  }

  // 3D スプライトラベル群（全視点 X/Y/Z 分離配置）
  const p0Label = createTextSprite('大気圧 P₀ = 760 mmHg', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 34, scale: 0.48 })
  const levelLabel = createTextSprite('等圧面 (点A P₀ = 点B)', { color: '#bae6fd', borderColor: '#0284c7', fontSize: 30, scale: 0.44 })
  const hLabel = createTextSprite('鉛直高さ h = 760.0 mm', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 34, scale: 0.5 })
  const HLabel = createTextSprite('引き上げ H = 850 mm', { color: '#cbd5e1', borderColor: '#64748b', fontSize: 30, scale: 0.44 })
  const vacLabel = createTextSprite('トリチェリ真空 (P = 0)', { color: '#f8fafc', borderColor: '#94a3b8', fontSize: 32, scale: 0.46 })
  const slantLabel = createTextSprite('管沿い l = 760.0 mm', { color: '#fed7aa', borderColor: '#f59e0b', fontSize: 32, scale: 0.46 })
  const tiltLabel = createTextSprite('θ = 0°', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.44 })

  scene.add(p0Label, levelLabel, hLabel, HLabel, vacLabel, slantLabel, tiltLabel)

  sceneState = {
    hgPoolMat,
    surfaceMat,
    pointADot,
    pointBDot,
    atmArrows,
    atmPulses,
    dynamicGroup,
    gasMolsGroup,
    gasMols,
    molMat,
    p0Label,
    levelLabel,
    hLabel,
    HLabel,
    vacLabel,
    slantLabel,
    tiltLabel,
    tubeMeshRef: null
  }

  rebuildApparatus()
  updateFrame(0)
}

function rebuildApparatus() {
  if (!sceneState) return
  const {
    dynamicGroup,
    pointBDot,
    hgPoolMat,
    surfaceMat,
    p0Label,
    levelLabel,
    hLabel,
    HLabel,
    vacLabel,
    slantLabel,
    tiltLabel
  } = sceneState

  clearGroup(dynamicGroup)

  // 液体密度に応じた微調整カラー（標準水銀は銀メタリック、高密度はやや深銀、軽合金は青銀）
  if (fluidDensity.value > 14.5) {
    hgPoolMat.color.setHex(0x94a3b8)
    surfaceMat.color.setHex(0xcbd5e1)
  } else if (fluidDensity.value < 13.0) {
    hgPoolMat.color.setHex(0xd1fae5)
    surfaceMat.color.setHex(0xa7f3d0)
  } else {
    hgPoolMat.color.setHex(0xcbd5e1)
    surfaceMat.color.setHex(0xe2e8f0)
  }

  const thetaRad = (tiltAngleDeg.value * Math.PI) / 180
  const cosT = Math.cos(thetaRad)
  const sinT = Math.sin(thetaRad)
  const xPivot = getPivotX()
  pointBDot.position.set(xPivot, 0.01, 0)

  const H3D = tubePullUp.value * MM_TO_3D
  const h3D = simData.value.hNum * MM_TO_3D
  const HSlant3D = H3D / cosT
  const hSlant3D = h3D / cosT
  const gapSlant3D = Math.max(0, HSlant3D - hSlant3D)

  // 管内半径スケール (16mm -> 0.24)
  const tubeR = 0.16 + ((tubeRadiusMm.value - 10) / 14) * 0.16
  const subDepth = 0.45

  // 傾斜ガラス管グループ (ピボット: (xPivot, 0, 0), Z回転: -thetaRad)
  const tubeGroup = new THREE.Group()
  tubeGroup.position.set(xPivot, 0, 0)
  tubeGroup.rotation.z = -thetaRad
  dynamicGroup.add(tubeGroup)
  sceneState.tubeMeshRef = { tubeGroup, HSlant3D, hSlant3D, gapSlant3D, tubeR, xPivot, thetaRad }

  // 1. 管内水銀柱 (renderOrder: 1, メタリック)
  const colLen = subDepth + hSlant3D
  const colGeo = new THREE.CylinderGeometry(tubeR - 0.025, tubeR - 0.025, colLen, 32)
  const colMat = new THREE.MeshStandardMaterial({
    color: fluidDensity.value < 13.0 ? 0xa7f3d0 : 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.14,
    emissive: 0x1e293b,
    emissiveIntensity: 0.22
  })
  const colMesh = new THREE.Mesh(colGeo, colMat)
  colMesh.position.set(0, -subDepth + colLen / 2, 0)
  colMesh.renderOrder = 1
  tubeGroup.add(colMesh)

  // 凸メニスカス (水銀の上面ドーム + ゴールド指標リング)
  const meniscusGeo = new THREE.SphereGeometry(tubeR - 0.025, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  meniscusGeo.scale(1, 0.45, 1)
  const meniscusMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.92,
    roughness: 0.08,
    emissive: 0x334155,
    emissiveIntensity: 0.25
  })
  const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat)
  meniscusMesh.position.set(0, hSlant3D, 0)
  meniscusMesh.renderOrder = 1
  tubeGroup.add(meniscusMesh)

  const meniscusRing = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR + 0.015, 0.02, 10, 32).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  )
  meniscusRing.position.set(0, hSlant3D, 0)
  meniscusRing.renderOrder = 3
  tubeGroup.add(meniscusRing)

  // 2. 上部空間 (トリチェリ真空 vs 封入気体)
  if (gapSlant3D > 0.02) {
    if (gasAmount.value === 0) {
      // 真空: 暗い半透明ティント (depthWrite: false, renderOrder: 2)
      const vacGeo = new THREE.CylinderGeometry(tubeR - 0.03, tubeR - 0.03, gapSlant3D, 28)
      const vacMat = new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.58,
        depthWrite: false
      })
      const vacMesh = new THREE.Mesh(vacGeo, vacMat)
      vacMesh.position.set(0, hSlant3D + gapSlant3D / 2, 0)
      vacMesh.renderOrder = 2
      tubeGroup.add(vacMesh)
    } else {
      // 封入気体: エメラルド半透明発光 (depthWrite: false, renderOrder: 2)
      const gasGeo = new THREE.CylinderGeometry(tubeR - 0.03, tubeR - 0.03, gapSlant3D, 28)
      const gasMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.26,
        depthWrite: false
      })
      const gasMesh = new THREE.Mesh(gasGeo, gasMat)
      gasMesh.position.set(0, hSlant3D + gapSlant3D / 2, 0)
      gasMesh.renderOrder = 2
      tubeGroup.add(gasMesh)
    }
  }

  // 3. 外側透明ガラス管 + 上端ドーム + スペキュラハイライト (depthWrite: false, renderOrder: 6)
  const totalTubeLen = subDepth + HSlant3D
  const glassGeo = new THREE.CylinderGeometry(tubeR, tubeR, totalTubeLen, 36, 1, true)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glassMesh = new THREE.Mesh(glassGeo, glassMat)
  glassMesh.position.set(0, -subDepth + totalTubeLen / 2, 0)
  glassMesh.renderOrder = 6
  tubeGroup.add(glassMesh)

  const domeGeo = new THREE.SphereGeometry(tubeR, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  const domeMesh = new THREE.Mesh(domeGeo, glassMat)
  domeMesh.position.set(0, HSlant3D, 0)
  domeMesh.renderOrder = 6
  tubeGroup.add(domeMesh)

  const topRim = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR, 0.016, 10, 32).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.55 })
  )
  topRim.position.set(0, HSlant3D, 0)
  topRim.renderOrder = 6
  tubeGroup.add(topRim)

  // 光沢ハイライト縦筋
  const glossGeo = new THREE.CylinderGeometry(tubeR + 0.008, tubeR + 0.008, totalTubeLen, 16, 1, true, 0.25, 0.35)
  const glossMat = new THREE.MeshBasicMaterial({
    color: 0xf0f9ff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glossMesh = new THREE.Mesh(glossGeo, glossMat)
  glossMesh.position.set(0, -subDepth + totalTubeLen / 2, 0)
  glossMesh.renderOrder = 6
  tubeGroup.add(glossMesh)

  // 100mm ごとの目盛リング
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.48 })
  for (let mm = 100; mm <= 850; mm += 100) {
    const ty = mm * MM_TO_3D
    if (ty > HSlant3D - 0.06) break
    const tickRing = new THREE.Mesh(
      new THREE.TorusGeometry(tubeR + 0.006, 0.009, 6, 28).rotateX(Math.PI / 2),
      tickMat
    )
    tickRing.position.set(0, ty, 0)
    tickRing.renderOrder = 5
    tubeGroup.add(tickRing)
  }

  // 4. 鉛直高さ h の寸法線・基準水平ガイド (ゴールド #fbbf24)
  const xMeniscus = xPivot + hSlant3D * sinT
  const xTop = xPivot + HSlant3D * sinT
  const xHRod = Math.max(2.15, xMeniscus + 0.85)

  // 液面 (y=0) -> h ロッド下端
  dynamicGroup.add(createDashedLine([new THREE.Vector3(xPivot, 0.02, 0), new THREE.Vector3(xHRod, 0.02, 0)], 0xfbbf24, 0.75))
  // メニスカス (y=h) -> h ロッド上端
  dynamicGroup.add(createDashedLine([new THREE.Vector3(xMeniscus, h3D, 0), new THREE.Vector3(xHRod, h3D, 0)], 0xfbbf24, 0.9))

  // h 垂直ロッド + 上下エンドキャップ
  if (h3D > 0.15) {
    const hRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, h3D, 12),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    )
    hRod.position.set(xHRod, h3D / 2, 0)
    dynamicGroup.add(hRod)

    const capGeo = new THREE.BoxGeometry(0.24, 0.035, 0.035)
    const capMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    const botCap = new THREE.Mesh(capGeo, capMat)
    botCap.position.set(xHRod, 0.02, 0)
    const topCap = new THREE.Mesh(capGeo, capMat)
    topCap.position.set(xHRod, h3D, 0)
    dynamicGroup.add(botCap, topCap)
  }

  // 5. 管引き上げ高さ H の寸法線 (左側 x = -3.05, スレート)
  const xPullRod = -3.0
  dynamicGroup.add(createDashedLine([new THREE.Vector3(xPullRod, 0.02, -0.35), new THREE.Vector3(xPivot, 0.02, -0.35)], 0x94a3b8, 0.55))
  dynamicGroup.add(createDashedLine([new THREE.Vector3(xPullRod, H3D, -0.35), new THREE.Vector3(xTop, H3D, 0)], 0x94a3b8, 0.65))
  const pullRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, H3D, 10),
    new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
  )
  pullRod.position.set(xPullRod, H3D / 2, -0.35)
  dynamicGroup.add(pullRod)

  // 6. 傾斜時のみ: 管沿い水銀長 l = h/cosθ 平行ガイド & 角度θアーク
  if (tiltAngleDeg.value > 0) {
    const offN = -(tubeR + 0.32) // 管の左上側法線方向
    const nx = -cosT
    const ny = sinT
    const pStart = new THREE.Vector3(xPivot + nx * offN, ny * offN, 0)
    const pEnd = new THREE.Vector3(xMeniscus + nx * offN, h3D + ny * offN, 0)
    const slantLineGeo = new THREE.BufferGeometry().setFromPoints([pStart, pEnd])
    const slantLine = new THREE.Line(slantLineGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b }))
    dynamicGroup.add(slantLine)

    // 垂直基準線 (角度θ表示用)
    dynamicGroup.add(createDashedLine([new THREE.Vector3(xPivot, 0, 0), new THREE.Vector3(xPivot, 1.55, 0)], 0xf59e0b, 0.85))
    // 角度アーク
    const arcPts = []
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * thetaRad
      arcPts.push(new THREE.Vector3(xPivot + 0.95 * Math.sin(a), 0.95 * Math.cos(a), 0.05))
    }
    dynamicGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), new THREE.LineBasicMaterial({ color: 0xf59e0b })))
  }

  // 7. スプライトラベル更新＆非衝突位置配置
  rebuildDynamicLabels()
}

function rebuildDynamicLabels() {
  if (!sceneState || !sceneState.tubeMeshRef) return
  const {
    p0Label,
    levelLabel,
    hLabel,
    HLabel,
    vacLabel,
    slantLabel,
    tiltLabel
  } = sceneState
  const { HSlant3D, hSlant3D, gapSlant3D, xPivot, thetaRad } = sceneState.tubeMeshRef

  const mob = isMobileView()
  const cosT = Math.cos(thetaRad)
  const sinT = Math.sin(thetaRad)
  const H3D = HSlant3D * cosT
  const h3D = hSlant3D * cosT
  const xMeniscus = xPivot + hSlant3D * sinT
  const xTop = xPivot + HSlant3D * sinT
  const xHRod = Math.max(2.15, xMeniscus + 0.85)

  // ラベルテキスト（モバイルは簡潔）
  setLabelText(
    p0Label,
    'p0',
    mob ? `P₀=${atmosphericPressure.value}mmHg` : `大気圧 P₀ = ${atmosphericPressure.value} mmHg`,
    '#7dd3fc',
    '#38bdf8',
    0.45
  )
  p0Label.position.set(Math.min(-1.65, xPivot - 1.35), 1.35, 0.95)

  setLabelText(
    levelLabel,
    'lvl',
    mob ? '等圧面 A(P₀)=B' : '等圧面 (点A P₀ = 点B)',
    '#bae6fd',
    '#0284c7',
    0.42
  )
  levelLabel.position.set(xPivot + 0.6, -0.45, 1.48)

  setLabelText(
    hLabel,
    'h',
    mob ? `h=${simData.value.h}mm` : `鉛直高さ h = ${simData.value.h} mm`,
    '#fde68a',
    '#fbbf24',
    0.48
  )
  if (tiltAngleDeg.value >= 25) {
    hLabel.position.set(xHRod - (mob ? 0.55 : 0.96), Math.max(0.95, h3D * 0.36), 0.72)
  } else {
    hLabel.position.set(xHRod + (mob ? 0.55 : 0.88), Math.max(1.05, h3D * 0.5), 0.45)
  }

  setLabelText(
    HLabel,
    'H',
    mob ? `H=${tubePullUp.value}mm` : `引き上げ H = ${tubePullUp.value} mm`,
    '#cbd5e1',
    '#64748b',
    0.42
  )
  HLabel.position.set(-2.95, H3D * 0.68 + 0.25, -0.95)

  // 真空 / 封入気体ラベル
  if (gapSlant3D > 0.04) {
    vacLabel.visible = true
    const midSlant = hSlant3D + gapSlant3D * 0.5
    const gx = xPivot + midSlant * sinT
    const gy = midSlant * cosT
    if (gasAmount.value === 0) {
      setLabelText(
        vacLabel,
        'vac',
        mob ? 'トリチェリ真空 P=0' : 'トリチェリ真空 (P = 0)',
        '#f8fafc',
        '#94a3b8',
        0.44
      )
    } else {
      setLabelText(
        vacLabel,
        'vac',
        mob ? `気体 P=${simData.value.Pgas}` : `封入気体 (P = ${simData.value.Pgas} mmHg)`,
        '#6ee7b7',
        '#10b981',
        0.44
      )
    }
    // 垂直時は上部左側、傾斜時は上端左上方（他のラベルと非接触）
    if (tiltAngleDeg.value < 15) {
      vacLabel.position.set(gx - 0.15, gy + 0.55, -0.95)
    } else {
      vacLabel.position.set(xTop - 0.55, H3D + 0.48, -0.85)
    }
  } else {
    vacLabel.visible = false
  }

  // 傾斜時のみ表示する管沿い長さ l と角度 θ
  if (tiltAngleDeg.value > 0) {
    slantLabel.visible = true
    tiltLabel.visible = true
    const midHSlant = hSlant3D * 0.52
    const sx = xPivot + midHSlant * sinT
    const sy = midHSlant * cosT
    setLabelText(
      slantLabel,
      'slant',
      mob ? `l=${simData.value.slantL}mm` : `管沿い l = ${simData.value.slantL} mm`,
      '#fed7aa',
      '#f59e0b',
      0.45
    )
    slantLabel.position.set(sx - 0.72, sy + 0.62, -0.45)

    setLabelText(tiltLabel, 'tilt', `θ = ${tiltAngleDeg.value}°`, '#fde68a', '#f59e0b', 0.42)
    tiltLabel.position.set(xPivot + 0.85, 0.78, 0.95)
  } else {
    slantLabel.visible = false
    tiltLabel.visible = false
  }
}

function updateFrame(dt) {
  if (!sceneState || !sceneState.tubeMeshRef) return
  const {
    atmArrows,
    atmPulses,
    surfaceMat,
    gasMolsGroup,
    gasMols,
    tubeMeshRef
  } = sceneState

  const { hSlant3D, gapSlant3D, tubeR, xPivot, thetaRad } = tubeMeshRef

  // 1. 大気圧矢印4本をチューブ周囲の液面上に配置 & パルスアニメ
  const arrowXs = [
    Math.max(-2.4, xPivot - 1.25),
    Math.max(-2.1, xPivot - 0.72),
    Math.min(2.15, xPivot + 1.05),
    Math.min(2.45, xPivot + 1.65)
  ]
  const arrowLen = 0.72 + ((atmosphericPressure.value - 720) / 80) * 0.28
  const pulsePhase = (simTime * 1.1) % 1
  for (let i = 0; i < 4; i++) {
    const ax = arrowXs[i]
    const az = i % 2 === 0 ? 0.35 : -0.35
    const bob = Math.sin(simTime * 3.2 + i) * 0.05
    atmArrows[i].setVector(new THREE.Vector3(ax, arrowLen + 0.14 + bob, az), new THREE.Vector3(0, -1, 0), arrowLen)

    const p = (pulsePhase + i * 0.25) % 1
    atmPulses[i].position.set(ax, 0.02, az)
    const sc = 0.45 + p * 1.15
    atmPulses[i].scale.setScalar(sc)
    atmPulses[i].material.opacity = (1 - p) * 0.65
  }

  // 水銀表面シマー
  surfaceMat.opacity = 0.48 + 0.12 * Math.sin(simTime * 2.5)

  // 2. 封入気体分子の熱運動 (管の傾斜座標に合わせて配置)
  if (gasAmount.value > 0 && gapSlant3D > 0.05) {
    gasMolsGroup.visible = true
    gasMolsGroup.position.set(xPivot, 0, 0)
    gasMolsGroup.rotation.z = -thetaRad
    const activeCount = Math.min(gasMols.length, 4 + gasAmount.value * 2)
    const speedScale = Math.sqrt(gasTemperature.value / 300) * 1.1
    const maxR = Math.max(0.05, tubeR - 0.07)

    for (let i = 0; i < gasMols.length; i++) {
      const m = gasMols[i]
      if (i >= activeCount) {
        m.visible = false
        continue
      }
      m.visible = true
      if (dt > 0) {
        m.userData.yNorm += (m.userData.vy * speedScale * dt) / Math.max(0.25, gapSlant3D)
        m.userData.ang += m.userData.vAng * speedScale * dt
        if (m.userData.yNorm < 0.06) { m.userData.yNorm = 0.06; m.userData.vy = Math.abs(m.userData.vy) }
        if (m.userData.yNorm > 0.94) { m.userData.yNorm = 0.94; m.userData.vy = -Math.abs(m.userData.vy) }
      }
      const r = m.userData.rNorm * maxR
      m.position.set(
        r * Math.cos(m.userData.ang),
        hSlant3D + 0.04 + m.userData.yNorm * (gapSlant3D - 0.08),
        r * Math.sin(m.userData.ang)
      )
    }
  } else {
    gasMolsGroup.visible = false
  }
}

watch(
  [atmosphericPressure, tubePullUp, gasAmount, gasTemperature, tiltAngleDeg, tubeRadiusMm, fluidDensity],
  () => {
    rebuildApparatus()
    updateFrame(0)
  }
)

watch(tiltAngleDeg, () => {
  setCameraPreset(activeCam.value, 0.3)
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
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.7rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.title-row h3 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #38bdf8;
}

.three-badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.4);
  font-weight: 700;
}

.sim-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.75rem;
  padding: 0.22rem 0.65rem;
  border-radius: 9999px;
  font-weight: 700;
}
.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}
.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.badge-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  margin-bottom: 0.65rem;
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
  transition: all 0.2s;
}
.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #f8fafc;
}

.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.75rem;
  padding: 8px 12px;
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid #334155;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap !important;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px !important;
  border-radius: 10px !important;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-label {
  font-size: 0.78rem;
  color: #38bdf8;
  font-weight: 600;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  flex-wrap: wrap !important;
  gap: 4px;
  max-width: 100%;
}

.speed-btn-group button {
  padding: 3px 8px;
  font-size: 0.74rem;
  font-weight: 600;
  border-radius: 8px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
  white-space: nowrap;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 10px;
  background: #080c16;
  border: 1px solid #334155;
  overflow: hidden;
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
  flex-wrap: wrap;
  gap: 10px;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.73rem;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.legend-item i:not(.dot-hg):not(.dot-atm):not(.dot-vac):not(.dot-gas):not(.dot-slant) {
  font-style: italic;
}

.dot-hg, .dot-atm, .dot-vac, .dot-gas, .dot-slant {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-hg { background: #cbd5e1; box-shadow: 0 0 6px #cbd5e1; }
.dot-atm { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-vac { background: #0f172a; border: 1.5px solid #94a3b8; }
.dot-gas { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-slant { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

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

.three-status-badge {
  display: inline-block;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #bae6fd;
  font-size: 0.76rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.stat-card {
  background: #1e293b;
  padding: 9px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.4);
}

.stat-label {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  font-family: monospace;
}

.stat-unit {
  font-size: 0.75rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-sub {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 2px;
}

.text-cyan { color: #38bdf8; }
.text-gold { color: #fbbf24; }
.text-amber { color: #f59e0b; }
.text-emerald { color: #10b981; }

.controls-panel {
  margin-top: 12px;
  background: #1e293b;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.preset-cat {
  font-size: 0.76rem;
  font-weight: 700;
  color: #94a3b8;
  margin-right: 4px;
}

.select-btn {
  padding: 4px 10px;
  font-size: 0.74rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}
.select-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
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
  accent-color: #38bdf8;
  cursor: pointer;
  width: 100%;
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.4rem 0.85rem;
  font-size: 0.78rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid #475569;
}

.btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.btn-secondary:hover {
  background: #475569;
}

.btn-reset {
  background: transparent;
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.35);
}
.btn-reset:hover {
  color: #f8fafc;
  border-color: #94a3b8;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    border-radius: 10px !important;
    padding: 5px 8px !important;
  }
  .three-hud-legend {
    gap: 6px;
    font-size: 0.66rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.65rem;
    padding: 3px 8px;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .three-status-badge {
    width: 100%;
    font-size: 0.7rem;
  }
}
</style>
