<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔥</span>
        <h3>3D 気体のモル比熱・マイヤーの関係式シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        定積変化と定圧変化における熱量 <i>Q</i> の使われ方の違い。分子構造（単原子・2原子・多原子）による3D並進・回転自由度と、マイヤーの関係式 <i>C</i><sub><i>P</i></sub> = <i>C</i><sub><i>V</i></sub> + <i>R</i> を3D空間で直感比較できます。
      </p>
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
        <button class="chip-btn" :class="{ active: showFluxArrows }" @click="showFluxArrows = !showFluxArrows">
          {{ showFluxArrows ? '🏹 熱流 Q・仕事 W ベクトル: ON' : '🏹 熱流 Q・仕事 W ベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・加熱コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="applyHeat">🔥 最初から加熱</button>
      <button class="btn btn-secondary" @click="resetSim">🔄 300 K にリセット</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-q"></i><span class="legend-text">流入熱量 <b>Q</b> (赤/橙)</span></span>
          <span class="legend-item"><i class="dot-u"></i><span class="legend-text">定積 <b><i>C</i><sub><i>V</i></sub> / Δ<i>U</i></b></span></span>
          <span class="legend-item"><i class="dot-w"></i><span class="legend-text">定圧 <b><i>C</i><sub><i>P</i></sub> / 仕事 <i>W</i></b></span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータスストリップ（ビューポート外直下に配置） -->
    <div class="mode-status-strip">
      <span class="process-badge" :class="processType">
        {{ processType === 'isochoric' ? '🔒 定積変化 (体積一定: W = 0, Q = ΔU)' : '🔓 定圧変化 (ピストン自由膨張: Q = ΔU + PΔV)' }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <span class="control-label">気体の種類（3D分子構造・自由度）:</span>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: gasType === 'mono' }" @click="gasType = 'mono'">
              単原子 (He, Ar)
            </button>
            <button class="select-btn" :class="{ active: gasType === 'di' }" @click="gasType = 'di'">
              2原子 (N₂, O₂)
            </button>
            <button class="select-btn" :class="{ active: gasType === 'poly' }" @click="gasType = 'poly'">
              多原子 (CO₂)
            </button>
          </div>
        </div>

        <div class="control-group">
          <span class="control-label">状態変化の種類:</span>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: processType === 'isochoric' }" @click="processType = 'isochoric'">
              定積変化 (ΔV = 0)
            </button>
            <button class="select-btn" :class="{ active: processType === 'isobaric' }" @click="processType = 'isobaric'">
              定圧変化 (ΔP = 0)
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>気体の物質量 <i>n</i>: <strong>{{ mol.toFixed(1) }} mol</strong></span>
            <input type="range" v-model.number="mol" min="0.5" max="3.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>投入熱量 <i>Q</i>: <strong>{{ heatInputJ }} J</strong></span>
            <input type="range" v-model.number="heatInputJ" min="100" max="2000" step="100" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="applyHeat">
          🔥 熱を加える (加熱シミュレーション)
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 初期温度 (300 K) にリセット
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">定積モル比熱 <i>C</i><sub><i>V</i></sub></span>
        <span class="value">{{ (Cv_factor * 8.31).toFixed(1) }} <span class="unit">J/(mol·K)</span></span>
        <span class="subtext">{{ Cv_text }}</span>
      </div>

      <div class="stat-card">
        <span class="label">定圧モル比熱 <i>C</i><sub><i>P</i></sub></span>
        <span class="value">{{ (Cp_factor * 8.31).toFixed(1) }} <span class="unit">J/(mol·K)</span></span>
        <span class="subtext"><i>C</i><sub><i>V</i></sub> + <i>R</i> (マイヤー)</span>
      </div>

      <div class="stat-card">
        <span class="label">比熱比 γ = <i>C</i><sub><i>P</i></sub>/<i>C</i><sub><i>V</i></sub></span>
        <span class="value highlight">{{ gamma.toFixed(2) }}</span>
        <span class="subtext">{{ gammaFraction }}</span>
      </div>

      <div class="stat-card">
        <span class="label">温度上昇 Δ <i>T</i></span>
        <span class="value">{{ deltaT.toFixed(1) }} <span class="unit">K</span></span>
        <span class="subtext">現在温度: {{ tempK.toFixed(1) }} K</span>
      </div>
    </div>

    <!-- 熱力学第1法則 分配バー (Q = ΔU + W) -->
    <div class="energy-card">
      <div class="energy-header">
        <span>熱力学第1法則の分配: <i>Q</i> = Δ <i>U</i> + <i>W</i> (全熱量 <i>Q</i> = {{ heatInputJ }} <i>J</i>)</span>
      </div>
      <div class="energy-bar">
        <div class="bar-segment u" :style="{ width: deltaUPercent + '%' }" title="内部エネルギー増加"></div>
        <div class="bar-segment w" :style="{ width: workPercent + '%' }" title="外部にした仕事"></div>
      </div>
      <div class="legend-row">
        <div class="legend-item-bar"><span class="dot u"></span>内部エネルギー増加 Δ <i>U</i> = <i>n</i> <i>C</i><sub><i>V</i></sub> Δ <i>T</i>: {{ deltaU.toFixed(1) }} J ({{ deltaUPercent.toFixed(0) }}%)</div>
        <div class="legend-item-bar"><span class="dot w"></span>外部にした仕事 <i>W</i> = <i>P</i>Δ <i>V</i>: {{ workOut.toFixed(1) }} J ({{ workPercent.toFixed(0) }}%)</div>
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
let resizeObs = null

const gasType = ref('mono') // 'mono', 'di', 'poly'
const processType = ref('isobaric') // 'isochoric', 'isobaric'
const mol = ref(1.0)
const heatInputJ = ref(800)
const R = 8.31 // 気体定数 J/(mol*K)

const activeCam = ref('3d')
const showFluxArrows = ref(true)
const isRunning = ref(true)
const timeScale = ref(1.0)

const initialTemp = 300.0 // K
const heatProgress = ref(1.0)
const isHeatingAnim = ref(false)

// モル比熱係数
const Cv_factor = computed(() => {
  if (gasType.value === 'mono') return 1.5 // 3/2 R
  if (gasType.value === 'di') return 2.5 // 5/2 R
  return 3.0 // 3R
})

const Cp_factor = computed(() => Cv_factor.value + 1.0)

const gamma = computed(() => Cp_factor.value / Cv_factor.value)
const gammaFraction = computed(() => {
  if (gasType.value === 'mono') return '5/3 ≈ 1.67'
  if (gasType.value === 'di') return '7/5 = 1.40'
  return '4/3 ≈ 1.33'
})

const Cv_text = computed(() => {
  if (gasType.value === 'mono') return '(3/2)R'
  if (gasType.value === 'di') return '(5/2)R'
  return '3R'
})

// 計算値
const deltaT = computed(() => {
  const C_effective = processType.value === 'isochoric' ? (Cv_factor.value * R) : (Cp_factor.value * R)
  return heatInputJ.value / (mol.value * C_effective)
})

const deltaT_isochoric = computed(() => heatInputJ.value / (mol.value * Cv_factor.value * R))
const deltaT_isobaric = computed(() => heatInputJ.value / (mol.value * Cp_factor.value * R))

const tempK = computed(() => initialTemp + deltaT.value * heatProgress.value)

const deltaU = computed(() => {
  return mol.value * (Cv_factor.value * R) * deltaT.value
})

const workOut = computed(() => {
  if (processType.value === 'isochoric') return 0
  return heatInputJ.value - deltaU.value
})

const deltaUPercent = computed(() => (deltaU.value / heatInputJ.value) * 100)
const workPercent = computed(() => (workOut.value / heatInputJ.value) * 100)

function togglePlay() {
  isRunning.value = !isRunning.value
  if (isRunning.value && heatProgress.value < 1.0) {
    isHeatingAnim.value = true
  }
}

const applyHeat = () => {
  heatProgress.value = 0
  isHeatingAnim.value = true
  isRunning.value = true
}

const resetSim = () => {
  heatProgress.value = 0
  isHeatingAnim.value = false
}

// ==========================================================
// モバイル判定・カメラプリセット・キャッシュラベル
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35)
    ? Math.min(1.95, Math.max(1.48, 1.72 / Math.max(0.72, aspect)))
    : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0.18, 0.15, 37.5 * ms], target: [0.18, 0.15, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.15, 43.0 * ms, 0.15], target: [0.15, 0, 0], fov: 14 }
  }
  return { pos: [0.48 * ms, 4.4 * ms, 12.6 * ms], target: [0.18, 0.12, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  syncStaticState()
}

const labelCache = {}
function updateLabelCached(sprite, key, text, color, borderColor, baseScale = 0.45) {
  const mult = isMobileViewport() ? 1.68 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}`
  if (labelCache[key] !== sig) {
    labelCache[key] = sig
    sprite.updateText(text, color, borderColor)
  }
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  if (Math.abs(sprite.scale.y - h) > 0.004) {
    sprite.scale.set(h * asp, h, 1)
  }
}

// 温度 (300K..500K) に連動した熱的カラー (#38bdf8 cyan -> #f97316 orange -> #ef4444 red)
function kelvinToColor(tk) {
  const t = Math.min(1, Math.max(0, (tk - 300) / 180))
  const c = new THREE.Color(0x38bdf8)
  const warm = new THREE.Color(0xf97316)
  const hot = new THREE.Color(0xef4444)
  if (t < 0.55) {
    return c.lerp(warm, t / 0.55)
  }
  return c.copy(warm).lerp(hot, (t - 0.55) / 0.45)
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
let sceneObjs = null
let lastIsMob = false

function createMoleculeGroup(scale = 1.0) {
  const g = new THREE.Group()
  g.scale.setScalar(scale)

  // 1. 単原子分子 (mono)
  const monoMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.2
  })
  const monoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), monoMat)
  monoMesh.renderOrder = 3
  g.add(monoMesh)

  // 2. 2原子分子 (di: ダンベル型)
  const diGroup = new THREE.Group()
  const diMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x059669,
    emissiveIntensity: 0.45,
    roughness: 0.2
  })
  const atom1 = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 14), diMat)
  atom1.position.set(-0.135, 0, 0)
  const atom2 = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 14), diMat)
  atom2.position.set(0.135, 0, 0)
  const bondGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.27, 10)
  bondGeo.rotateZ(Math.PI / 2)
  const bond = new THREE.Mesh(bondGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }))
  diGroup.add(atom1, atom2, bond)
  g.add(diGroup)

  // 3. 多原子分子 (poly: 3原子折れ線型)
  const polyGroup = new THREE.Group()
  const polyMatCenter = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.45,
    roughness: 0.2
  })
  const polyMatSide = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    emissive: 0xdb2777,
    emissiveIntensity: 0.4,
    roughness: 0.2
  })
  const cAtom = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 14), polyMatCenter)
  const lAtom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), polyMatSide)
  lAtom.position.set(-0.14, -0.095, 0)
  const rAtom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), polyMatSide)
  rAtom.position.set(0.14, -0.095, 0)
  polyGroup.add(cAtom, lAtom, rAtom)
  g.add(polyGroup)

  g.userData.setSpecies = (type) => {
    monoMesh.visible = type === 'mono'
    diGroup.visible = type === 'di'
    polyGroup.visible = type === 'poly'
  }
  g.userData.setTempTint = (col) => {
    if (gasType.value === 'mono') {
      monoMat.color.copy(col)
      monoMat.emissive.copy(col).multiplyScalar(0.55)
    } else if (gasType.value === 'di') {
      diMat.color.setHex(0x34d399).lerp(col, 0.45)
      diMat.emissive.copy(diMat.color).multiplyScalar(0.5)
    } else {
      polyMatCenter.color.setHex(0xc084fc).lerp(col, 0.4)
      polyMatCenter.emissive.copy(polyMatCenter.color).multiplyScalar(0.5)
    }
  }
  g.userData.setSpecies(gasType.value)
  return g
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 130,
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
        syncStaticState()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0.28, -2.55, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D ガラスシリンダー & 可動ピストン & 電気ヒーター
  //    cylinder x in [-5.25 .. -0.35], center y = 0.05
  // ======================================================
  const cylLeftX = -5.25
  const cylLen = 4.95
  const cylRadius = 1.26
  const cylY = 0.05

  // 内部気体コアの発光ボリューム (depthWrite: false, renderOrder: 2)
  const gasCoreGeo = new THREE.CylinderGeometry(cylRadius - 0.06, cylRadius - 0.06, 1.0, 28)
  gasCoreGeo.rotateZ(Math.PI / 2)
  gasCoreGeo.translate(0.5, 0, 0)
  const gasCoreMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    depthWrite: false
  })
  const gasCoreMesh = new THREE.Mesh(gasCoreGeo, gasCoreMat)
  gasCoreMesh.position.set(cylLeftX, cylY, 0)
  gasCoreMesh.renderOrder = 2
  scene.add(gasCoreMesh)

  // シリンダー左端金属フランジ
  const leftCapGeo = new THREE.CylinderGeometry(cylRadius + 0.08, cylRadius + 0.08, 0.22, 36)
  leftCapGeo.rotateZ(Math.PI / 2)
  leftCapGeo.translate(cylLeftX - 0.11, cylY, 0)
  const leftCapMesh = new THREE.Mesh(
    leftCapGeo,
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
  )
  leftCapMesh.renderOrder = 3
  scene.add(leftCapMesh)

  // シリンダー内の3D分子群 (36個, renderOrder: 3)
  const molMeshes = []
  for (let i = 0; i < 36; i++) {
    const mGroup = createMoleculeGroup(0.95)
    const r = Math.sqrt(Math.random()) * (cylRadius - 0.30)
    const th = Math.random() * Math.PI * 2
    mGroup.userData.xNorm = 0.08 + Math.random() * 0.84
    mGroup.userData.y = r * Math.cos(th)
    mGroup.userData.z = r * Math.sin(th)
    mGroup.userData.vx = (Math.random() - 0.5) * 2.5
    mGroup.userData.vy = (Math.random() - 0.5) * 2.5
    mGroup.userData.vz = (Math.random() - 0.5) * 2.5
    mGroup.userData.rx = (Math.random() - 0.5) * 3.8
    mGroup.userData.ry = (Math.random() - 0.5) * 3.8
    mGroup.userData.rz = (Math.random() - 0.5) * 3.8
    scene.add(mGroup)
    molMeshes.push(mGroup)
  }

  // 可動ピストン本体 + ロッド
  const pistonGroup = new THREE.Group()
  scene.add(pistonGroup)

  const headGeo = new THREE.CylinderGeometry(cylRadius - 0.04, cylRadius - 0.04, 0.32, 36)
  headGeo.rotateZ(Math.PI / 2)
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    metalness: 0.65,
    roughness: 0.25
  })
  const headMesh = new THREE.Mesh(headGeo, headMat)
  headMesh.renderOrder = 4
  pistonGroup.add(headMesh)

  const rodGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.35, 20)
  rodGeo.rotateZ(Math.PI / 2)
  rodGeo.translate(0.82, 0, 0)
  const rodMesh = new THREE.Mesh(
    rodGeo,
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 })
  )
  rodMesh.renderOrder = 4
  pistonGroup.add(rodMesh)

  // 定積変化用の赤色固定ストッパーピン
  const stopperGroup = new THREE.Group()
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.5
  })
  const topPin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.40), pinMat)
  topPin.position.set(0.24, cylRadius + 0.08, 0)
  const botPin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.40), pinMat)
  botPin.position.set(0.24, -cylRadius - 0.08, 0)
  stopperGroup.add(topPin, botPin)
  pistonGroup.add(stopperGroup)

  // シリンダーガラス壁 (depthWrite: false, renderOrder: 5 で内部分子を遮蔽しない)
  const glassGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylLen, 36, 1, true)
  glassGeo.rotateZ(Math.PI / 2)
  glassGeo.translate(cylLeftX + cylLen / 2, cylY, 0)
  const glassMesh = new THREE.Mesh(
    glassGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  glassMesh.renderOrder = 5
  scene.add(glassMesh)

  // シリンダー補強リング (renderOrder: 6)
  ;[-5.25, -2.78, -0.30].forEach((rx) => {
    const ringGeo = new THREE.TorusGeometry(cylRadius + 0.02, 0.032, 12, 42)
    ringGeo.rotateY(Math.PI / 2)
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 }))
    ring.position.set(rx, cylY, 0)
    ring.renderOrder = 6
    scene.add(ring)
  })

  // 下部 3D 発光電気ヒーターステージ + 赤熱コイル + 熱流 Q 矢印 (#f97316 / #ef4444)
  const burnerGroup = new THREE.Group()
  burnerGroup.position.set(-3.95, -1.78, 0)
  scene.add(burnerGroup)

  const heaterBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 0.24, 1.35),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.35 })
  )
  burnerGroup.add(heaterBase)

  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xef4444,
    emissiveIntensity: 0.85,
    roughness: 0.2
  })
  const heaterCoils = []
  const heatArrows = []
  for (let i = 0; i < 4; i++) {
    const fx = -0.84 + i * 0.56
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.048, 10, 20).rotateX(Math.PI / 2), coilMat)
    coil.position.set(fx, 0.16, 0)
    burnerGroup.add(coil)
    heaterCoils.push(coil)

    const qArr = createVectorArrow3D({
      color: 0xef4444,
      shaftRadius: 0.038,
      headRadius: 0.11,
      headLength: 0.26
    })
    burnerGroup.add(qArr)
    heatArrows.push({ arrow: qArr, fx })
  }

  // 外部への仕事ベクトル矢印 W = PΔV
  const workArrow = createVectorArrow3D({
    color: 0xf59e0b,
    shaftRadius: 0.052,
    headRadius: 0.15,
    headLength: 0.35
  })
  scene.add(workArrow)

  // 左上: 拡大分子自由度 DOF モデル (renderOrder: 4)
  const showcaseGroup = new THREE.Group()
  showcaseGroup.position.set(-4.55, 2.15, 0)
  scene.add(showcaseGroup)

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.016, 10, 36),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  )
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.016, 10, 36),
    new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45 })
  )
  ring2.rotation.x = Math.PI / 2
  showcaseGroup.add(ring1, ring2)

  const bigMolecule = createMoleculeGroup(1.85)
  showcaseGroup.add(bigMolecule)

  // ======================================================
  // 2. 右側: 3D Q-T グラフボード (定積 Cv vs 定圧 Cp 比較)
  //    board center x = +3.55, y = -0.10, width = 4.6, height = 3.5
  // ======================================================
  const graphGroup = new THREE.Group()
  graphGroup.position.set(3.55, -0.10, 0)
  scene.add(graphGroup)

  const boardW = 4.6
  const boardH = 3.5
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
  boardBack.renderOrder = 1
  graphGroup.add(boardBack)

  const boardBorder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(boardW, boardH)),
    new THREE.LineBasicMaterial({ color: 0x475569 })
  )
  boardBorder.position.set(0, 0, -0.06)
  graphGroup.add(boardBorder)

  // 座標系: Q in [0, 2000 J] -> bx in [-1.85, +1.95]; ΔT in [0, 200 K] -> by in [-1.35, +1.45]
  const gx0 = -1.85
  const gx1 = 1.95
  const gy0 = -1.35
  const gy1 = 1.45

  const qAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.018, headRadius: 0.06, headLength: 0.16 })
  qAxis.setVector(new THREE.Vector3(gx0, gy0, 0.02), new THREE.Vector3(1, 0, 0), gx1 - gx0 + 0.25)
  const tAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.018, headRadius: 0.06, headLength: 0.16 })
  tAxis.setVector(new THREE.Vector3(gx0, gy0, 0.02), new THREE.Vector3(0, 1, 0), gy1 - gy0 + 0.25)
  graphGroup.add(qAxis, tAxis)

  // 水平グリッド線 (ΔT = 50, 100, 150 K)
  ;[50, 100, 150].forEach((dtTick) => {
    const ty = gy0 + (dtTick / 180) * (gy1 - gy0)
    if (ty <= gy1) {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(gx0, ty, 0), new THREE.Vector3(gx1, ty, 0)]),
        new THREE.LineDashedMaterial({ color: 0x334155, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.7 })
      )
      line.computeLineDistances()
      graphGroup.add(line)
    }
  })

  // 2本の比較直線 (Cv 定積ライン: シアン, Cp 定圧ライン: アンバー)
  const cvMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.95
  })
  const cpMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.95
  })

  const cvLineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 1, 10), cvMat)
  const cpLineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 1, 10), cpMat)
  graphGroup.add(cvLineMesh, cpLineMesh)

  // 現在値プロット球
  const activeDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xef4444, emissiveIntensity: 0.8 })
  )
  const dotHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.32, depthWrite: false })
  )
  activeDot.add(dotHalo)
  graphGroup.add(activeDot)

  // 3D ラベルスプライト (位置を重複ゼロに設計)
  const labelShowcase = createTextSprite('単原子 (3自由度)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.43
  })
  labelShowcase.position.set(-2.95, 2.25, 0)
  scene.add(labelShowcase)

  const labelTemp = createTextSprite('T = 300.0 K', {
    color: '#fdba74',
    borderColor: '#f97316',
    scale: 0.44
  })
  labelTemp.position.set(-2.35, -2.25, 0.75)
  scene.add(labelTemp)

  const labelHeatQ = createTextSprite('加熱 Q = 800 J', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    scale: 0.44
  })
  labelHeatQ.position.set(-4.35, -2.35, 0.65)
  scene.add(labelHeatQ)

  const labelPiston = createTextSprite('仕事 W = 0 J', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    scale: 0.44
  })
  scene.add(labelPiston)

  const labelGraphTitle = createTextSprite('Q-T グラフ (Cv vs Cp)', {
    color: '#f8fafc',
    borderColor: 'rgba(148,163,184,0.45)',
    scale: 0.46
  })
  labelGraphTitle.position.set(0, 2.12, 0.1)
  graphGroup.add(labelGraphTitle)

  const labelCvCurve = createTextSprite('定積 Cv', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.40
  })
  graphGroup.add(labelCvCurve)

  const labelCpCurve = createTextSprite('定圧 Cp', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    scale: 0.40
  })
  graphGroup.add(labelCpCurve)

  const labelPlotPoint = createTextSprite('ΔT = 0 K', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.42
  })
  graphGroup.add(labelPlotPoint)

  sceneObjs = {
    cylLeftX,
    cylRadius,
    cylY,
    gasCoreMesh,
    gasCoreMat,
    pistonGroup,
    stopperGroup,
    coilMat,
    heaterCoils,
    heatArrows,
    workArrow,
    molMeshes,
    showcaseGroup,
    bigMolecule,
    ring1,
    ring2,
    cvLineMesh,
    cpLineMesh,
    cvMat,
    cpMat,
    activeDot,
    labelShowcase,
    labelTemp,
    labelHeatQ,
    labelPiston,
    labelGraphTitle,
    labelCvCurve,
    labelCpCurve,
    labelPlotPoint,
    gx0,
    gx1,
    gy0,
    gy1
  }

  syncStaticState()
}

function positionSegmentMesh(mesh, p0, p1) {
  const diff = new THREE.Vector3().subVectors(p1, p0)
  const len = Math.max(0.01, diff.length())
  mesh.position.copy(p0).addScaledVector(diff, 0.5)
  mesh.scale.set(1, len, 1)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize())
}

function syncStaticState() {
  if (!sceneObjs) return
  const {
    molMeshes,
    bigMolecule,
    showcaseGroup,
    cvLineMesh,
    cpLineMesh,
    cvMat,
    cpMat,
    labelShowcase,
    labelHeatQ,
    labelGraphTitle,
    labelCvCurve,
    labelCpCurve,
    gx0,
    gx1,
    gy0,
    gy1
  } = sceneObjs

  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'

  molMeshes.forEach((m) => m.userData.setSpecies(gasType.value))
  bigMolecule.userData.setSpecies(gasType.value)

  // 上面視点では縦置きグラフ上の重複ラベルや上部DOFモデルを整理
  showcaseGroup.visible = !isTop
  labelShowcase.visible = !isTop
  labelGraphTitle.visible = !isTop
  labelCvCurve.visible = !isTop
  labelCpCurve.visible = !isTop

  updateLabelCached(
    labelHeatQ,
    'heatQ',
    mob ? `Q=${heatInputJ.value}J` : `加熱 Q = ${heatInputJ.value} J`,
    '#fca5a5',
    '#ef4444',
    0.43
  )

  if (gasType.value === 'mono') {
    updateLabelCached(labelShowcase, 'dof', mob ? '単原子(3)' : '単原子 (3自由度)', '#7dd3fc', '#38bdf8', 0.43)
  } else if (gasType.value === 'di') {
    updateLabelCached(labelShowcase, 'dof', mob ? '2原子(5)' : '2原子 (5自由度)', '#6ee7b7', '#10b981', 0.43)
  } else {
    updateLabelCached(labelShowcase, 'dof', mob ? '多原子(6)' : '多原子 (6自由度)', '#d8b4fe', '#a855f7', 0.43)
  }

  updateLabelCached(
    labelGraphTitle,
    'gTitle',
    mob ? 'Q-T比較 (Cv vs Cp)' : 'Q-T グラフ (定積 Cv vs 定圧 Cp)',
    '#f8fafc',
    'rgba(148,163,184,0.45)',
    0.45
  )

  // Q-T グラフ上の2本線の端点計算 (横軸 Q_max = 2000J, 縦軸 ΔT_max = 180K)
  const qNorm = heatInputJ.value / 2000
  const maxDtScale = Math.max(175, deltaT_isochoric.value * 1.12)
  const mapX = (qFrac) => gx0 + qFrac * (gx1 - gx0)
  const mapY = (dtK) => gy0 + Math.min(1.0, dtK / maxDtScale) * (gy1 - gy0)

  const cvFullDt = 2000 / (mol.value * Cv_factor.value * R)
  const cpFullDt = 2000 / (mol.value * Cp_factor.value * R)

  const pOrigin = new THREE.Vector3(gx0, gy0, 0.05)
  const pCvEnd = new THREE.Vector3(mapX(1.0), mapY(cvFullDt), 0.05)
  const pCpEnd = new THREE.Vector3(mapX(1.0), mapY(cpFullDt), 0.05)

  positionSegmentMesh(cvLineMesh, pOrigin, pCvEnd)
  positionSegmentMesh(cpLineMesh, pOrigin, pCpEnd)

  const isIsochoric = processType.value === 'isochoric'
  cvMat.opacity = isIsochoric ? 1.0 : 0.42
  cpMat.opacity = isIsochoric ? 0.42 : 1.0

  // 曲線ラベル (左上段と右下段に配置して ΔT ラベルとも重複ゼロ)
  const cvMidX = mapX(0.28)
  const cvMidY = mapY(cvFullDt * 0.45)
  labelCvCurve.position.set(cvMidX, Math.min(gy1 + 0.08, cvMidY + 0.45), 0.14)
  updateLabelCached(labelCvCurve, 'cvL', mob ? 'Cv' : `定積 Cv=${Cv_text.value}`, '#7dd3fc', '#38bdf8', 0.41)

  const cpEndY = mapY(cpFullDt * 0.85)
  labelCpCurve.position.set(mapX(0.82), Math.max(gy0 + 0.12, cpEndY - 0.42), 0.14)
  updateLabelCached(labelCpCurve, 'cpL', mob ? 'Cp' : '定圧 Cp=Cv+R', '#fde68a', '#f59e0b', 0.41)
  void qNorm
}

function updateFrame(dt, elapsed) {
  if (!sceneObjs) return

  if (isRunning.value && isHeatingAnim.value && heatProgress.value < 1.0) {
    heatProgress.value = Math.min(1.0, heatProgress.value + dt * 0.65 * timeScale.value)
    if (heatProgress.value >= 1.0) isHeatingAnim.value = false
  }

  const {
    cylLeftX,
    cylRadius,
    cylY,
    gasCoreMesh,
    gasCoreMat,
    pistonGroup,
    stopperGroup,
    coilMat,
    heaterCoils,
    heatArrows,
    workArrow,
    molMeshes,
    bigMolecule,
    ring1,
    ring2,
    activeDot,
    labelTemp,
    labelHeatQ,
    labelPiston,
    labelPlotPoint,
    gx0,
    gx1,
    gy0,
    gy1
  } = sceneObjs

  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'

  // ピストン座標 (初期幅 2.55, 定圧膨張時は最大 1.65倍で x = -1.04 まで移動)
  const baseWidth = 2.55
  let expansion = 1.0
  if (processType.value === 'isobaric') {
    expansion = Math.min(1.65, tempK.value / initialTemp)
  }
  const pistonX = cylLeftX + baseWidth * expansion
  pistonGroup.position.set(pistonX, cylY, 0)
  stopperGroup.visible = processType.value === 'isochoric'

  const activeSpan = Math.max(1.0, pistonX - cylLeftX - 0.45)
  gasCoreMesh.scale.set(pistonX - cylLeftX, 1, 1)

  // 熱的カラー更新 (#38bdf8 <-> #f97316 / #ef4444)
  const thermalCol = kelvinToColor(tempK.value)
  gasCoreMat.color.copy(thermalCol)
  gasCoreMat.opacity = 0.11 + Math.min(0.14, (tempK.value - 300) / 1400)

  // 温度・加熱量・ピストン仕事ラベルのビュー適応配置
  if (isTop) {
    labelHeatQ.position.set(-3.85, 0.3, 2.05)
    labelTemp.position.set(-3.55, 0.3, -2.05)
    labelPiston.position.set(Math.max(-0.85, pistonX + 0.85), 0.3, 2.05)
  } else {
    labelTemp.position.set(-1.70, 1.48, 0)
    labelHeatQ.position.set(-4.05, -2.35, 0.65)
    labelPiston.position.set(Math.max(-1.6, pistonX + 0.25), -2.05, 0.65)
  }

  updateLabelCached(
    labelTemp,
    'tempL',
    mob ? `${tempK.value.toFixed(0)}K` : `現在温度 T = ${tempK.value.toFixed(1)} K`,
    tempK.value > 360 ? '#fdba74' : '#7dd3fc',
    tempK.value > 360 ? '#f97316' : '#38bdf8',
    0.43
  )

  if (processType.value === 'isochoric') {
    updateLabelCached(labelPiston, 'piston', mob ? '固定 W=0' : '🔒 ピストン固定 (W = 0 J)', '#fda4af', '#f43f5e', 0.43)
    workArrow.visible = false
  } else {
    const curW = workOut.value * heatProgress.value
    updateLabelCached(labelPiston, 'piston', mob ? `W=${curW.toFixed(0)}J` : `🔓 仕事 W = ${curW.toFixed(0)} J`, '#fde68a', '#f59e0b', 0.43)
    if (showFluxArrows.value && curW > 5) {
      const wLen = Math.min(1.65, 0.55 + (curW / 800) * 0.9)
      workArrow.setVector(new THREE.Vector3(pistonX + 0.22, cylY, 0), new THREE.Vector3(1, 0, 0), wLen)
    } else {
      workArrow.visible = false
    }
  }

  // 電気ヒーター赤熱 & 熱流 Q 矢印
  const qNorm = heatInputJ.value / 2000
  const glowPulse = 0.65 + qNorm * 0.55 + Math.sin(elapsed * 6.5) * 0.15
  coilMat.emissiveIntensity = glowPulse
  heaterCoils.forEach((c, idx) => {
    const s = 0.94 + Math.sin(elapsed * 7 + idx * 1.1) * 0.06
    c.scale.set(s, s, 1)
  })

  heatArrows.forEach(({ arrow, fx }) => {
    if (showFluxArrows.value) {
      const len = 0.62 + qNorm * 0.45
      arrow.setVector(new THREE.Vector3(fx, 0.25, 0.48), new THREE.Vector3(0, 1, 0), len)
    } else {
      arrow.visible = false
    }
  })

  // 分子数表示を mol (0.5..3.0) に応じて動的表示
  const visibleMolCount = Math.min(molMeshes.length, Math.max(10, Math.round(mol.value * 12)))
  const speedScale = Math.sqrt(tempK.value / initialTemp) * 1.35 * (isRunning.value ? timeScale.value : 0)
  const maxR = cylRadius - 0.24

  molMeshes.forEach((m, idx) => {
    m.visible = idx < visibleMolCount
    if (!m.visible) return
    m.userData.setTempTint(thermalCol)

    if (speedScale > 0) {
      m.userData.xNorm += (m.userData.vx * speedScale * dt) / activeSpan
      m.userData.y += m.userData.vy * speedScale * dt
      m.userData.z += m.userData.vz * speedScale * dt

      if (m.userData.xNorm < 0.05) { m.userData.xNorm = 0.05; m.userData.vx = Math.abs(m.userData.vx) }
      if (m.userData.xNorm > 0.95) { m.userData.xNorm = 0.95; m.userData.vx = -Math.abs(m.userData.vx) }

      const rSq = m.userData.y * m.userData.y + m.userData.z * m.userData.z
      if (rSq > maxR * maxR) {
        const r = Math.sqrt(rSq)
        const ny = m.userData.y / r
        const nz = m.userData.z / r
        m.userData.y = ny * maxR
        m.userData.z = nz * maxR
        const dot = m.userData.vy * ny + m.userData.vz * nz
        if (dot > 0) {
          m.userData.vy -= 2 * dot * ny
          m.userData.vz -= 2 * dot * nz
        }
      }

      if (gasType.value !== 'mono') {
        m.rotation.x += m.userData.rx * speedScale * dt
        m.rotation.y += m.userData.ry * speedScale * dt
        m.rotation.z += m.userData.rz * speedScale * dt
      } else {
        m.rotation.set(0, 0, 0)
      }
    }

    m.position.set(cylLeftX + 0.22 + m.userData.xNorm * activeSpan, cylY + m.userData.y, m.userData.z)
  })

  // 左上拡大分子モデル回転
  bigMolecule.userData.setTempTint(thermalCol)
  if (gasType.value === 'mono') {
    bigMolecule.rotation.set(0, 0, 0)
    bigMolecule.position.set(Math.sin(elapsed * 3.0) * 0.09, Math.cos(elapsed * 2.5) * 0.09, 0)
    ring1.visible = false
    ring2.visible = false
  } else if (gasType.value === 'di') {
    bigMolecule.position.set(0, 0, 0)
    bigMolecule.rotation.y = elapsed * 1.8
    bigMolecule.rotation.z = Math.sin(elapsed * 1.4) * 0.65
    ring1.visible = true
    ring2.visible = true
  } else {
    bigMolecule.position.set(0, 0, 0)
    bigMolecule.rotation.x = elapsed * 1.4
    bigMolecule.rotation.y = elapsed * 1.9
    bigMolecule.rotation.z = elapsed * 1.1
    ring1.visible = true
    ring2.visible = true
  }

  // Q-T グラフ上の現在点プロット更新
  const maxDtScale = Math.max(175, deltaT_isochoric.value * 1.12)
  const curQ = heatInputJ.value * heatProgress.value
  const curDt = deltaT.value * heatProgress.value
  const dotX = gx0 + (curQ / 2000) * (gx1 - gx0)
  const dotY = gy0 + Math.min(1.0, curDt / maxDtScale) * (gy1 - gy0)
  activeDot.position.set(dotX, dotY, 0.12)

  labelPlotPoint.visible = !isTop
  const isIso = processType.value === 'isochoric'
  let ptLabelX
  let ptLabelY
  if (dotX > 0.75) {
    ptLabelX = dotX - 0.82
    ptLabelY = Math.min(gy1 - 0.05, dotY + 0.28)
  } else if (isIso) {
    ptLabelX = dotX + 0.78
    ptLabelY = Math.min(gy1 - 0.06, dotY + 0.06)
  } else {
    ptLabelX = Math.max(gx0 + 0.62, dotX - 0.20)
    ptLabelY = dotY + 0.42
  }
  labelPlotPoint.position.set(ptLabelX, ptLabelY, 0.18)
  updateLabelCached(
    labelPlotPoint,
    'plotPt',
    mob ? `ΔT=${curDt.toFixed(0)}K` : `ΔT = ${curDt.toFixed(1)} K`,
    '#fda4af',
    '#f43f5e',
    0.42
  )
}

watch([gasType, processType, mol, heatInputJ], () => {
  syncStaticState()
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
  background: #0f172a;
  border-radius: 12px;
  padding: 1.2rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
}

.three-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.sim-header .icon {
  font-size: 1.5rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #38bdf8;
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 0.8rem 0;
  line-height: 1.4;
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
  transition: all 0.2s;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
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
  font-size: 0.78rem;
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
  font-size: 0.76rem;
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
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.73rem;
  color: #e2e8f0;
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

.dot-q { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
.dot-u { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-w { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

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

.process-badge {
  display: inline-block;
  font-size: 0.76rem;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.4);
  max-width: 100%;
  box-sizing: border-box;
}

.process-badge.isobaric {
  background: rgba(245, 158, 11, 0.14);
  color: #fde68a;
  border-color: rgba(245, 158, 11, 0.45);
}

.control-panel {
  margin-top: 0.85rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}

.control-group label,
.control-label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.btn-group {
  display: flex;
  gap: 0.3rem;
}

.select-btn {
  flex: 1;
  padding: 0.35rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: bold;
}

.control-group strong {
  color: #38bdf8;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
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
  background: #ef4444;
  color: white;
}
.btn-primary:hover {
  background: #dc2626;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.btn-secondary:hover {
  background: #475569;
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

.stat-card .value.highlight {
  color: #f59e0b;
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
  transition: width 0.2s ease-out;
}

.bar-segment.u {
  background: #0ea5e9;
}

.bar-segment.w {
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

.legend-item-bar {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.u { background: #0ea5e9; }
.dot.w { background: #f59e0b; }

@media (max-width: 640px) {
  .sim-container {
    padding: 12px;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    border-radius: 10px;
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
  .process-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
