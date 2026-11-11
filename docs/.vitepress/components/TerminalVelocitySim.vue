<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🪂</span>
        <h3>3D 空気抵抗と終端速度シミュレーター</h3>
        <div class="header-badges">
          <span class="badge-3d">Three.js 3D Interactive</span>
          <span class="chute-badge" :class="{ open: isChuteOpen && envMode === 'air', fluid: envMode === 'fluid' }">
            {{ envMode === 'fluid' ? '🧪 粘性流体中落下 (浮力+抵抗)' : (isChuteOpen ? '🪂 パラシュート展開中 (大抵抗)' : '🚶 自由落下 (通常抵抗)') }}
          </span>
        </div>
      </div>
      <p class="subtitle">重力と空気抵抗（粘性抵抗 <i>f</i> = -<i>kv</i> または慣性抵抗 <i>f</i> = -κ<i>v</i>²）のつり合い。落下速度が次第に一定値（終端速度 <i>v</i><sub>term</sub>）へ漸近する様子を3D風洞コラムとリアルタイム <i>v</i>-<i>t</i> グラフで観察できます。</p>
    </div>

    <!-- 3D カメラ視点プリセット & 環境切替バー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="cam-chip"
          :class="{ active: activeCam === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🎥 3D 俯瞰視点
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面視点
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点
        </button>
      </div>
      <div class="preset-group">
        <button
          class="cam-chip"
          :class="{ active: envMode === 'air' }"
          @click="setEnvMode('air')"
        >
          🌬️ 空気風洞
        </button>
        <button
          class="cam-chip"
          :class="{ active: envMode === 'fluid' }"
          @click="setEnvMode('fluid')"
        >
          🧪 粘性液体 (浮力あり)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button
        class="btn btn-primary"
        @click="togglePlay"
        style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;"
      >
        {{ isRunning ? '⏸ 一時停止' : '▶ 落下開始' }}
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
      <button
        class="btn btn-secondary"
        @click="stepForward"
        style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;"
      >
        ⏭ コマ送り (+0.05s)
      </button>
      <button
        class="btn btn-secondary"
        @click="resetSim"
        style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;"
      >
        ⏮ 最上部から再ドロップ
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-mg"></i>重力 <b>mg</b></span>
        <span class="legend-item"><i class="dot-drag"></i>抵抗力 <b>{{ dragModel === 'linear' ? 'kv' : 'κv²' }}</b></span>
        <span v-if="envMode === 'fluid'" class="legend-item"><i class="dot-buoy"></i>浮力 <b>ρ₀Vg</b></span>
        <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label><span>物体の質量 <i>m</i>:</span> <strong>{{ mass.toFixed(1) }} kg</strong></label>
          <input type="range" v-model.number="mass" min="0.5" max="10.0" step="0.5" @input="updatePhysics" />
        </div>

        <div class="control-group">
          <label>抵抗モデル:</label>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: dragModel === 'linear' }" @click="dragModel = 'linear'">
              粘性抵抗 (f ∝ v)
            </button>
            <button class="select-btn" :class="{ active: dragModel === 'quadratic' }" @click="dragModel = 'quadratic'">
              慣性抵抗 (f ∝ v²)
            </button>
          </div>
        </div>

        <div class="control-group">
          <label><span>抵抗係数:</span> <strong>{{ dragCoeff.toFixed(2) }}</strong></label>
          <input type="range" v-model.number="dragCoeff" min="0.1" max="2.0" step="0.1" @input="updatePhysics" />
        </div>

        <div class="control-group" v-if="envMode === 'air'">
          <label>パラシュート操作:</label>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: isChuteOpen }" @click="toggleChute">
              {{ isChuteOpen ? 'パラシュート閉じる' : 'パラシュート開く!' }}
            </button>
          </div>
        </div>

        <div class="control-group" v-else>
          <label><span>流体密度比 ρ₀/ρ:</span> <strong>{{ fluidRatio.toFixed(2) }}</strong></label>
          <input type="range" v-model.number="fluidRatio" min="0.05" max="0.60" step="0.05" @input="updatePhysics" />
        </div>
      </div>
    </div>

    <!-- リアルタイム物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">現在の落下速度 <i>v</i></span>
        <span class="value" style="color:#10b981">{{ velocity.toFixed(1) }} <span class="unit">m/s</span></span>
        <span class="subtext">時速 {{ (velocity * 3.6).toFixed(0) }} km/h</span>
      </div>

      <div class="stat-card">
        <span class="label">理論終端速度 <i>v</i><sub>term</sub></span>
        <span class="value highlight">{{ theoreticalVterm.toFixed(1) }} <span class="unit">m/s</span></span>
        <span class="subtext" v-if="dragModel === 'linear'">
          <span class="frac"><span class="num">{{ envMode === 'fluid' ? 'mg−F_B' : 'mg' }}</span><span class="den">k</span></span>
        </span>
        <span class="subtext" v-else>
          <span class="math-radical">√</span><span class="math-radicand"><span class="frac"><span class="num">{{ envMode === 'fluid' ? 'mg−F_B' : 'mg' }}</span><span class="den">κ</span></span></span>
        </span>
      </div>

      <div class="stat-card">
        <span class="label">現在加速度 <i>a</i></span>
        <span class="value" style="color:#38bdf8">{{ acceleration.toFixed(2) }} <span class="unit">m/s²</span></span>
        <span class="subtext">重力加速度 g = 9.80</span>
      </div>

      <div class="stat-card">
        <span class="label">{{ envMode === 'fluid' ? '抵抗力 / 有効重力 比率' : '抵抗力 / 重力 比率' }}</span>
        <span class="value" style="color:#c084fc">{{ (dragForceRatio * 100).toFixed(0) }} <span class="unit">%</span></span>
        <span class="subtext">{{ dragForceRatio >= 0.98 && Math.abs(acceleration) < 0.25 ? '完全つり合い状態' : (acceleration < -0.1 ? '減速中 (抵抗過大)' : '加速中') }}</span>
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
let sceneObjs = null
let lastAspect = 1.6

const isRunning = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')
const envMode = ref('air') // 'air' | 'fluid'

const mass = ref(1.5) // kg
const dragModel = ref('linear') // 'linear' | 'quadratic'
const dragCoeff = ref(1.0)
const isChuteOpen = ref(false)
const fluidRatio = ref(0.25) // 流体密度/物体密度 ρ₀/ρ (浮力 F_B = fluidRatio * mg)

const g = 9.8

const effectiveK = computed(() => {
  const base = dragCoeff.value
  if (envMode.value === 'air' && isChuteOpen.value) {
    return base * 4.0
  }
  return base
})

const effectiveGravity = computed(() => {
  const mg = mass.value * g
  if (envMode.value === 'fluid') {
    return mg * (1 - fluidRatio.value)
  }
  return mg
})

const theoreticalVterm = computed(() => {
  const effG = Math.max(0.1, effectiveGravity.value)
  const k = effectiveK.value
  if (dragModel.value === 'linear') {
    return effG / k
  }
  return Math.sqrt(effG / k)
})

// シミュレーション状態量
const dropProgress = ref(0.0) // 0(最上部) -> 1(定常風洞中央)
const velocity = ref(0.0)
const acceleration = ref(9.8)
let windOffset = 0.0
let chuteAnim = 0.0
let maxObservedV = 15.0

const dragForceRatio = computed(() => {
  const k = effectiveK.value
  const v = velocity.value
  const dragF = dragModel.value === 'linear' ? k * v : k * v * v
  const effG = Math.max(0.1, effectiveGravity.value)
  return Math.min(2.5, dragF / effG)
})

const history = []
const maxHistory = 160

function getCamDistScale() {
  const w = threeContainer.value?.clientWidth || 720
  const h = threeContainer.value?.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.08 ? Math.min(1.66, 1.32 / Math.max(0.72, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const k = getCamDistScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([2.4 * k, 2.2 * k, 13.6 * k], [0.2, 0.05, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.2, 0.05, 48.0 * k], [0.2, 0.05, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.2, 48.0 * k, 0.01], [0.2, 0, 0], duration, 14)
  }
}

function setEnvMode(mode) {
  envMode.value = mode
  if (mode === 'fluid') {
    isChuteOpen.value = false
  }
  resetSim()
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function toggleChute() {
  isChuteOpen.value = !isChuteOpen.value
}

function stepForward() {
  step(0.05)
  updateFrame(0.05)
}

function resetSim() {
  dropProgress.value = 0.0
  velocity.value = 0.0
  acceleration.value = envMode.value === 'fluid' ? g * (1 - fluidRatio.value) : g
  windOffset = 0.0
  maxObservedV = Math.max(theoreticalVterm.value * 1.3, 18)
  history.length = 0
  if (sceneObjs) {
    updateChamberTheme()
    updateFrame(0)
  }
}

function updatePhysics() {
  maxObservedV = Math.max(maxObservedV, theoreticalVterm.value * 1.3)
}

function step(dt) {
  const m = mass.value
  const k = effectiveK.value
  const v = velocity.value

  const dragF = dragModel.value === 'linear' ? k * v : k * v * v
  const netF = effectiveGravity.value - dragF
  const a = netF / m
  acceleration.value = Math.max(-45, a)
  velocity.value = Math.max(0.05, velocity.value + a * dt)
  maxObservedV = Math.max(maxObservedV, velocity.value * 1.15, theoreticalVterm.value * 1.3)

  if (dropProgress.value < 1.0) {
    dropProgress.value = Math.min(1.0, dropProgress.value + velocity.value * dt * 0.055)
  }
  windOffset = (windOffset + velocity.value * dt * 0.28) % 1.0

  history.push({
    v: velocity.value,
    vTerm: theoreticalVterm.value
  })
  if (history.length > maxHistory) {
    history.shift()
  }
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
const colX = -2.0
const colBotY = -2.65
const colTopY = 2.45
const colHeight = colTopY - colBotY
const colRadius = 1.32

const graphLeft = 0.72
const graphRight = 4.25
const graphBot = -1.45
const graphTop = 1.65

function updateSpriteSafe(sprite, text, color, borderColor) {
  const key = `${text}|${color}|${borderColor}`
  if (sprite.userData.lastKey === key) return
  sprite.userData.lastKey = key
  sprite.updateText(text, color, borderColor)
}

function initThreeScene() {
  if (!threeContainer.value) return
  const w0 = threeContainer.value.clientWidth || 720
  const h0 = threeContainer.value.clientHeight || 420
  lastAspect = w0 / Math.max(1, h0)
  const k = getCamDistScale()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [2.4 * k, 2.2 * k, 13.6 * k],
    initialTarget: [0.2, 0.05, 0],
    minDistance: 5,
    maxDistance: 85,
    onFrame: (dt) => {
      if (threeContainer.value) {
        const cw = threeContainer.value.clientWidth || 720
        const ch = threeContainer.value.clientHeight || 420
        const asp = cw / Math.max(1, ch)
        if (Math.abs(asp - lastAspect) > 0.12) {
          lastAspect = asp
          setCameraPreset(activeCam.value, 0)
        }
      }
      if (isRunning.value) {
        step(Math.min(dt, 0.04) * timeScale.value)
      }
      updateFrame(dt)
    }
  })

  const { scene } = threeCtx

  // 1. 床グリッド
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.y = colBotY - 0.14
  scene.add(grid)

  // 2. 左側: 3D 垂直風洞 / 粘性流体コラム
  const columnGroup = new THREE.Group()
  columnGroup.position.set(colX, 0, 0)
  scene.add(columnGroup)

  const glassGeo = new THREE.CylinderGeometry(colRadius, colRadius, colHeight, 32, 1, true)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.12,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glassCylinder = new THREE.Mesh(glassGeo, glassMat)
  glassCylinder.position.y = (colTopY + colBotY) / 2
  columnGroup.add(glassCylinder)

  // 上下金属フランジリング
  const ringGeo = new THREE.TorusGeometry(colRadius + 0.03, 0.055, 14, 48)
  ringGeo.rotateX(Math.PI / 2)
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x0284c7,
    emissiveIntensity: 0.3,
    metalness: 0.72,
    roughness: 0.25
  })
  const topRing = new THREE.Mesh(ringGeo, ringMat)
  topRing.position.y = colTopY
  const botRing = new THREE.Mesh(ringGeo, ringMat)
  botRing.position.y = colBotY
  columnGroup.add(topRing, botRing)

  // コラム台座ディスク + 落下投影影リング
  const basePlateGeo = new THREE.CylinderGeometry(colRadius + 0.12, colRadius + 0.18, 0.14, 36)
  const basePlateMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
  const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat)
  basePlate.position.y = colBotY - 0.07
  columnGroup.add(basePlate)

  const shadowGeo = new THREE.CircleGeometry(0.45, 28)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.26 })
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat)
  shadowDisc.position.y = colBotY + 0.015
  columnGroup.add(shadowDisc)

  // 4本の構造支柱 + 左側目盛りティック
  const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, colHeight, 10)
  const strutMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 })
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + Math.PI / 4
    const strut = new THREE.Mesh(strutGeo, strutMat)
    strut.position.set(Math.cos(ang) * (colRadius + 0.03), (colTopY + colBotY) / 2, Math.sin(ang) * (colRadius + 0.03))
    columnGroup.add(strut)
  }

  // 高さスケールリング (気流に沿って上へ流れる)
  const scaleRings = []
  const tickRingGeo = new THREE.TorusGeometry(colRadius * 0.99, 0.014, 8, 36)
  tickRingGeo.rotateX(Math.PI / 2)
  const tickRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 })
  for (let i = 0; i < 6; i++) {
    const tr = new THREE.Mesh(tickRingGeo, tickRingMat)
    columnGroup.add(tr)
    scaleRings.push(tr)
  }

  // 上昇流線パーティクル / ストリーク & ウェイクリング
  const wakeRings = []
  const wakeRingGeo = new THREE.TorusGeometry(0.45, 0.02, 10, 32)
  wakeRingGeo.rotateX(Math.PI / 2)
  for (let i = 0; i < 3; i++) {
    const wMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.45 })
    const wMesh = new THREE.Mesh(wakeRingGeo, wMat)
    columnGroup.add(wMesh)
    wakeRings.push({ mesh: wMesh, mat: wMat, phase: i / 3 })
  }

  const airStreaks = []
  const streakGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.45, 6)
  const streakMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48 })
  for (let i = 0; i < 20; i++) {
    const sMesh = new THREE.Mesh(streakGeo, streakMat)
    const ang = (i * 2.39996) % (Math.PI * 2)
    const rad = 0.55 + ((i * 37) % 100) / 145 * 0.65
    sMesh.userData.x = Math.cos(ang) * rad
    sMesh.userData.z = Math.sin(ang) * rad
    sMesh.userData.phase = (i / 20)
    columnGroup.add(sMesh)
    airStreaks.push(sMesh)
  }

  const colTitleLabel = createTextSprite('落下風洞コラム', {
    color: '#7dd3fc',
    borderColor: 'rgba(56,189,248,0.5)',
    scale: 0.45
  })
  colTitleLabel.position.set(0, colTopY + 0.45, -1.05)
  columnGroup.add(colTitleLabel)

  // 3. 落下球体 + 3Dパラシュート
  const sphereGroup = new THREE.Group()
  columnGroup.add(sphereGroup)

  const sphereGeo = new THREE.SphereGeometry(1, 32, 32)
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    metalness: 0.35,
    roughness: 0.2
  })
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
  sphereGroup.add(sphereMesh)

  // パラシュートグループ
  const chuteGroup = new THREE.Group()
  const canopyGeo = new THREE.SphereGeometry(0.95, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.48)
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xbe123c,
    emissiveIntensity: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide
  })
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat)
  canopyMesh.position.y = 0.88
  chuteGroup.add(canopyMesh)

  const canopyRimGeo = new THREE.TorusGeometry(0.95, 0.025, 10, 32)
  canopyRimGeo.rotateX(Math.PI / 2)
  const canopyRim = new THREE.Mesh(canopyRimGeo, new THREE.MeshBasicMaterial({ color: 0xfecdd3 }))
  canopyRim.position.y = 0.92
  chuteGroup.add(canopyRim)

  // 8本のパラシュート吊り紐
  const cordMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.8 })
  const cordPts = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    cordPts.push(new THREE.Vector3(0, 0.25, 0))
    cordPts.push(new THREE.Vector3(0.94 * Math.cos(a), 0.92, 0.94 * Math.sin(a)))
  }
  const cordGeo = new THREE.BufferGeometry().setFromPoints(cordPts)
  const cords = new THREE.LineSegments(cordGeo, cordMat)
  chuteGroup.add(cords)
  sphereGroup.add(chuteGroup)

  // 4. 3D 力・速度ベクトル矢印 (columnGroup ローカル座標)
  const arrowMg = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowDrag = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowBuoy = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.3 })
  const arrowVel = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  columnGroup.add(arrowMg, arrowDrag, arrowBuoy, arrowVel)

  const labelMass = createTextSprite('1.5kg', { color: '#e0f2fe', borderColor: '#38bdf8', scale: 0.4 })
  const labelMg = createTextSprite('mg', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.42 })
  const labelDrag = createTextSprite('f = kv', { color: '#e9d5ff', borderColor: '#a855f7', scale: 0.42 })
  const labelBuoy = createTextSprite('F_B (浮力)', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.4 })
  const labelVel = createTextSprite('v = 0.0m/s', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.42 })
  columnGroup.add(labelMass, labelMg, labelDrag, labelBuoy, labelVel)

  // 5. 右側: 3D v-t グラフテレメトリーボード
  const graphGroup = new THREE.Group()
  scene.add(graphGroup)

  const gw = graphRight - graphLeft
  const gh = graphTop - graphBot
  const gcx = (graphLeft + graphRight) / 2
  const gcy = (graphBot + graphTop) / 2

  const boardGeo = new THREE.BoxGeometry(gw + 0.55, gh + 0.65, 0.08)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x111c33,
    metalness: 0.35,
    roughness: 0.38,
    transparent: true,
    opacity: 0.92
  })
  const board = new THREE.Mesh(boardGeo, boardMat)
  board.position.set(gcx, gcy, -0.18)
  graphGroup.add(board)

  const boardEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(boardGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.62 })
  )
  boardEdges.position.copy(board.position)
  graphGroup.add(boardEdges)

  // 軸線
  const axesPts = [
    new THREE.Vector3(graphLeft, graphTop, -0.11),
    new THREE.Vector3(graphLeft, graphBot, -0.11),
    new THREE.Vector3(graphLeft, graphBot, -0.11),
    new THREE.Vector3(graphRight, graphBot, -0.11)
  ]
  const axesGeo = new THREE.BufferGeometry().setFromPoints(axesPts)
  graphGroup.add(new THREE.LineSegments(axesGeo, new THREE.LineBasicMaterial({ color: 0xcbd5e1 })))

  // グラフグリッド横線
  for (let i = 1; i <= 4; i++) {
    const gy = graphBot + (i / 4) * gh
    const gPts = [new THREE.Vector3(graphLeft, gy, -0.12), new THREE.Vector3(graphRight, gy, -0.12)]
    graphGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(gPts), new THREE.LineBasicMaterial({ color: 0x334155 })))
  }

  // v_term 漸近線 (ローズ色)
  const termLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(graphLeft, 0, -0.09),
    new THREE.Vector3(graphRight, 0, -0.09)
  ])
  const termLine = new THREE.Line(termLineGeo, new THREE.LineBasicMaterial({ color: 0xf43f5e }))
  graphGroup.add(termLine)

  // リアルタイム v(t) 曲線
  const curveGeo = new THREE.BufferGeometry()
  curveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxHistory * 3), 3))
  const curveLine = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: 0x10b981 }))
  graphGroup.add(curveLine)

  const curveTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  )
  graphGroup.add(curveTip)

  const graphTitleLabel = createTextSprite('速度 v - 時間 t グラフ', {
    color: '#bae6fd',
    borderColor: 'rgba(56,189,248,0.45)',
    scale: 0.44
  })
  graphTitleLabel.position.set(gcx, graphTop + 0.55, -0.65)
  graphGroup.add(graphTitleLabel)

  const termLabel = createTextSprite('v_term = 14.7 m/s', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.4
  })
  graphGroup.add(termLabel)

  const axisVLabel = createTextSprite('v [m/s]', { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.35)', scale: 0.34 })
  axisVLabel.position.set(graphLeft - 0.1, graphTop + 0.18, -0.05)
  const axisTLabel = createTextSprite('時間 t →', { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.35)', scale: 0.34 })
  axisTLabel.position.set(graphRight - 0.55, graphBot - 0.24, 0.55)
  graphGroup.add(axisVLabel, axisTLabel)

  sceneObjs = {
    glassMat,
    sphereMesh,
    sphereMat,
    shadowDisc,
    scaleRings,
    wakeRings,
    airStreaks,
    colTitleLabel,
    chuteGroup,
    arrowMg,
    arrowDrag,
    arrowBuoy,
    arrowVel,
    labelMass,
    labelMg,
    labelDrag,
    labelBuoy,
    labelVel,
    termLineGeo,
    curveGeo,
    curveTip,
    termLabel
  }

  resetSim()
}

function updateChamberTheme() {
  if (!sceneObjs) return
  const { glassMat, sphereMat, colTitleLabel } = sceneObjs
  if (envMode.value === 'fluid') {
    glassMat.color.setHex(0x0ea5e9)
    glassMat.emissive.setHex(0x0369a1)
    glassMat.opacity = 0.2
    sphereMat.color.setHex(0xf59e0b)
    sphereMat.emissive.setHex(0xb45309)
    updateSpriteSafe(colTitleLabel, '粘性流体コラム (浮力あり)', '#7dd3fc', 'rgba(56,189,248,0.55)')
  } else {
    glassMat.color.setHex(0x38bdf8)
    glassMat.emissive.setHex(0x0284c7)
    glassMat.opacity = 0.12
    sphereMat.color.setHex(0x38bdf8)
    sphereMat.emissive.setHex(0x0284c7)
    updateSpriteSafe(colTitleLabel, '落下風洞コラム', '#7dd3fc', 'rgba(56,189,248,0.5)')
  }
}

function updateFrame(dt) {
  if (!sceneObjs) return
  const {
    sphereMesh,
    shadowDisc,
    scaleRings,
    wakeRings,
    airStreaks,
    chuteGroup,
    arrowMg,
    arrowDrag,
    arrowBuoy,
    arrowVel,
    labelMass,
    labelMg,
    labelDrag,
    labelBuoy,
    labelVel,
    termLineGeo,
    curveGeo,
    curveTip,
    termLabel
  } = sceneObjs

  // 球の位置 & 半径
  const r = Math.min(0.52, 0.25 + mass.value * 0.026)
  const sphereY = 1.45 - dropProgress.value * 1.65 // +1.45 -> -0.20
  sphereMesh.position.set(0, sphereY, 0)
  sphereMesh.scale.set(r, r, r)

  const shadowScale = Math.max(0.45, (1.15 - (sphereY - colBotY) * 0.1) * r * 2.2)
  shadowDisc.scale.set(shadowScale, 1, shadowScale)

  // パラシュート展開アニメ
  const targetChute = envMode.value === 'air' && isChuteOpen.value ? 1.0 : 0.0
  chuteAnim += (targetChute - chuteAnim) * Math.min(1, (dt || 0.016) * 8)
  if (chuteAnim > 0.02) {
    chuteGroup.visible = true
    chuteGroup.position.set(0, sphereY + r * 0.6, 0)
    chuteGroup.scale.set(chuteAnim, chuteAnim, chuteAnim)
  } else {
    chuteGroup.visible = false
  }

  // スケールリングと上昇ストリーク
  for (let i = 0; i < scaleRings.length; i++) {
    const frac = (i / scaleRings.length + windOffset) % 1.0
    scaleRings[i].position.y = colBotY + 0.25 + frac * (colHeight - 0.5)
  }

  const speedNorm = Math.min(1.5, velocity.value / Math.max(2, theoreticalVterm.value))
  for (let i = 0; i < airStreaks.length; i++) {
    const st = airStreaks[i]
    const frac = (st.userData.phase + windOffset * 1.4) % 1.0
    st.position.set(st.userData.x, colBotY + 0.3 + frac * (colHeight - 0.6), st.userData.z)
    st.scale.y = 0.6 + speedNorm * 0.9
  }

  for (let i = 0; i < wakeRings.length; i++) {
    const wr = wakeRings[i]
    const frac = (wr.phase + windOffset * 1.8) % 1.0
    wr.mesh.position.set(0, sphereY + r + frac * (colTopY - sphereY - r - 0.15), 0)
    const expand = 1.0 + frac * 1.25
    wr.mesh.scale.set(expand, expand, 1)
    wr.mat.opacity = Math.max(0, (1 - frac) * 0.45 * Math.min(1, dragForceRatio.value + 0.15))
  }

  // 質量ラベル (球正面)
  updateSpriteSafe(labelMass, `${mass.value.toFixed(1)}kg`, '#f8fafc', envMode.value === 'fluid' ? '#f59e0b' : '#38bdf8')
  labelMass.position.set(0, sphereY, r + 0.35)

  // 3D ベクトル矢印
  const lenMg = 1.05
  arrowMg.setVector(new THREE.Vector3(0, sphereY - r, 0.18), new THREE.Vector3(0, -1, 0), lenMg)
  labelMg.visible = true
  updateSpriteSafe(labelMg, `mg = ${(mass.value * g).toFixed(0)}N`, '#fde68a', '#f59e0b')
  labelMg.position.set(0.78, sphereY - r - lenMg * 0.55, 0.62)

  // 抵抗力 f (上向き)
  const effG = Math.max(0.1, effectiveGravity.value)
  const k = effectiveK.value
  const dragF = dragModel.value === 'linear' ? k * velocity.value : k * velocity.value * velocity.value
  const lenDrag = Math.min(1.8, (dragF / (mass.value * g)) * lenMg)
  const dragOffsetX = envMode.value === 'fluid' ? 0.32 : (chuteAnim > 0.2 ? 0.42 : 0)
  const dragOffsetZ = chuteAnim > 0.2 ? 0.45 : 0.2

  if (lenDrag > 0.08) {
    arrowDrag.setVector(new THREE.Vector3(dragOffsetX, sphereY + r, dragOffsetZ), new THREE.Vector3(0, 1, 0), lenDrag)
    labelDrag.visible = true
    updateSpriteSafe(labelDrag, `${dragModel.value === 'linear' ? 'kv' : 'κv²'} = ${dragF.toFixed(0)}N`, '#e9d5ff', '#a855f7')
    labelDrag.position.set(dragOffsetX + 0.92, sphereY + r + Math.max(0.35, lenDrag * 0.65), -0.62)
  } else {
    arrowDrag.visible = false
    labelDrag.visible = false
  }

  // 浮力 F_B (流体モードのみ)
  if (envMode.value === 'fluid') {
    const buoyF = mass.value * g * fluidRatio.value
    const lenBuoy = Math.max(0.22, fluidRatio.value * lenMg)
    arrowBuoy.setVector(new THREE.Vector3(-0.34, sphereY + r, 0.2), new THREE.Vector3(0, 1, 0), lenBuoy)
    labelBuoy.visible = true
    updateSpriteSafe(labelBuoy, `F_B = ${buoyF.toFixed(1)}N`, '#7dd3fc', '#38bdf8')
    labelBuoy.position.set(-0.92, sphereY + r + lenBuoy + 0.25, -0.58)
  } else {
    arrowBuoy.visible = false
    labelBuoy.visible = false
  }

  // 速度ベクトル v (左側・下向き)
  if (velocity.value > 0.2) {
    const lenVel = Math.min(1.45, 0.28 + 0.95 * (velocity.value / Math.max(2, theoreticalVterm.value)))
    arrowVel.setVector(new THREE.Vector3(-0.88, sphereY + 0.4, 0.2), new THREE.Vector3(0, -1, 0), lenVel)
    labelVel.visible = true
    updateSpriteSafe(labelVel, `v = ${velocity.value.toFixed(1)}m/s`, '#6ee7b7', '#10b981')
    labelVel.position.set(-1.45, sphereY - lenVel * 0.35, 0.58)
  } else {
    arrowVel.visible = false
    labelVel.visible = false
  }

  // 3D v-t グラフ更新
  const vTerm = theoreticalVterm.value
  const maxVScale = Math.max(vTerm * 1.32, maxObservedV, 18)
  const gh = graphTop - graphBot
  const gw = graphRight - graphLeft

  const termY = Math.min(graphTop - 0.05, graphBot + (vTerm / maxVScale) * gh)
  const tArr = termLineGeo.getAttribute('position').array
  tArr[1] = termY
  tArr[4] = termY
  termLineGeo.getAttribute('position').needsUpdate = true

  updateSpriteSafe(termLabel, `v_term = ${vTerm.toFixed(1)} m/s`, '#fda4af', '#f43f5e')
  termLabel.position.set(graphRight - 1.15, Math.min(graphTop - 0.15, termY + 0.24), 0.35)

  if (history.length > 1) {
    const cAttr = curveGeo.getAttribute('position')
    const cArr = cAttr.array
    const stepX = gw / maxHistory
    let lastX = graphLeft
    let lastY = graphBot
    for (let i = 0; i < history.length; i++) {
      const gx = graphLeft + i * stepX
      const gy = Math.min(graphTop, graphBot + (history[i].v / maxVScale) * gh)
      cArr[i * 3] = gx
      cArr[i * 3 + 1] = gy
      cArr[i * 3 + 2] = -0.07
      lastX = gx
      lastY = gy
    }
    curveGeo.setDrawRange(0, history.length)
    cAttr.needsUpdate = true
    curveTip.visible = true
    curveTip.position.set(lastX, lastY, -0.06)
  } else {
    curveGeo.setDrawRange(0, 0)
    curveTip.visible = false
  }
}

watch([mass, dragModel, dragCoeff, fluidRatio], () => {
  updatePhysics()
})

onMounted(() => {
  initThreeScene()
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
  sceneObjs = null
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border-radius: 12px;
  padding: 1.2rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.35rem;
}

.sim-header .icon {
  font-size: 1.45rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #38bdf8;
}

.header-badges {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  margin-left: auto;
}

.badge-3d {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.chute-badge {
  font-size: 0.74rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(30, 41, 59, 0.9);
  color: #38bdf8;
  border: 1px solid #334155;
}

.chute-badge.open {
  background: rgba(244, 63, 94, 0.18);
  color: #fda4af;
  border-color: #f43f5e;
}

.chute-badge.fluid {
  background: rgba(14, 165, 233, 0.18);
  color: #7dd3fc;
  border-color: #0ea5e9;
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 0.85rem 0;
  line-height: 1.45;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cam-chip:hover {
  border-color: #38bdf8;
  color: #fff;
}

.cam-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #7dd3fc;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  margin-bottom: 1rem;
}

.three-viewport {
  width: 100%;
  height: 100%;
}

.three-hud-legend {
  position: absolute;
  top: 10px;
  left: 12px;
  max-width: calc(100% - 24px);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.75rem;
  color: #e2e8f0;
  pointer-events: none;
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

.dot-mg { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-drag { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
.dot-buoy { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }

.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
  pointer-events: none;
}

.control-panel {
  margin-top: 0.5rem;
  background: #1e293b;
  padding: 0.95rem;
  border-radius: 10px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.control-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.control-group label > span:first-child {
  margin-left: 0;
}

.control-group input[type="range"] {
  width: 100%;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.select-btn {
  flex: 1;
  padding: 0.4rem;
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

.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}

.speed-control-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.speed-label {
  white-space: nowrap;
}

.speed-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.speed-btn-group button {
  white-space: nowrap;
}

.cam-chip {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend {
    font-size: 0.68rem;
    gap: 7px;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.66rem;
    padding: 3px 8px;
    bottom: 8px;
    right: 8px;
  }
}
</style>
