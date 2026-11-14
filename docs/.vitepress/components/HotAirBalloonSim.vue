<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🎈</span>
        <span>3D 熱気球の浮力と大気・温度平衡シミュレーター</span>
        <span class="three-badge">Three.js 3D Interactive</span>
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
        <button class="chip-btn" :class="{ active: showConvection }" @click="showConvection = !showConvection">
          {{ showConvection ? '✨ 内部熱対流・外気粒子: ON' : '✨ 内部熱対流・外気粒子: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isRunning = !isRunning">
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
      <button class="btn btn-secondary" @click="restartFromGround">🛫 地上パッドから再開</button>
      <button class="btn btn-secondary" @click="insideTempC = 95">🔥 バーナー全開加熱</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-fb"></i><span class="legend-text">浮力 <b><i>F</i><sub>B</sub> = ρ<sub>out</sub><i>Vg</i></b></span></span>
          <span class="legend-item"><i class="dot-gas"></i><span class="legend-text">内部空気重 <b><i>m</i><sub>gas</sub><i>g</i></b></span></span>
          <span class="legend-item"><i class="dot-load"></i><span class="legend-text">本体・積載 <b><i>M</i><sub>load</sub><i>g</i></b></span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータスストリップ（ビューポート外直下に配置） -->
    <div class="mode-status-strip">
      <span class="badge" :class="{ 'badge-lift': simData.canLift }">
        {{ simData.canLift ? '🚀 浮上可能 (F_B > W)' : '⚓ 地上待機 (F_B ≤ W: 重量過多)' }}
      </span>
      <span class="min-temp-chip" v-if="simData.minTempC">
        最低浮上温度: <strong>{{ simData.minTempC }} ℃</strong> ／ 現在高度: <strong>{{ balloonAltitude.toFixed(1) }} m</strong>
      </span>
    </div>

    <!-- 物理量モニターカード -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">外気密度 ρ<sub>out</sub></div>
        <div class="stat-value text-cyan">{{ simData.rhoOut }} <span class="stat-unit">kg/m³</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">気球内密度 ρ<sub>in</sub></div>
        <div class="stat-value text-orange">{{ simData.rhoIn }} <span class="stat-unit">kg/m³</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">浮力 <i>F</i><sub>B</sub></div>
        <div class="stat-value text-cyan">{{ simData.buoyancy }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">総重量 <i>W</i> (気体+本体)</div>
        <div class="stat-value text-rose">{{ simData.totalWeight }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">合力 <i>F</i><sub>net</sub> = <i>F</i><sub>B</sub> − <i>W</i></div>
        <div class="stat-value" :class="simData.netForce >= 0 ? 'text-cyan' : 'text-rose'">
          {{ simData.netForce >= 0 ? '+' : '' }}{{ simData.netForce }} <span class="stat-unit">N</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>内部加熱温度 <i>T</i><sub>in</sub>: <span>{{ insideTempC }} ℃</span></label>
          <input type="range" v-model.number="insideTempC" min="20" max="110" step="2" />
        </div>
        <div class="control-group">
          <label>外気温 <i>T</i><sub>out</sub>: <span>{{ outsideTempC }} ℃</span></label>
          <input type="range" v-model.number="outsideTempC" min="-10" max="35" step="1" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>気球体積 <i>V</i>: <span>{{ balloonVolume }} m³</span></label>
          <input type="range" v-model.number="balloonVolume" min="1000" max="3500" step="100" />
        </div>
        <div class="control-group">
          <label>本体質量 <i>M</i>: <span>{{ balloonMass }} kg</span></label>
          <input type="range" v-model.number="balloonMass" min="200" max="700" step="25" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-secondary" @click="insideTempC = 95">🔥 バーナー全開加熱</button>
        <button class="btn btn-secondary" @click="setGroundedPreset">⚓ 浮上不可 (低温テスト)</button>
        <button class="btn btn-reset" @click="resetSim">標準状態へリセット</button>
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

// 物理パラメータ
const insideTempC = ref(88) // 内部空気温度 [℃] (20 ~ 110)
const outsideTempC = ref(15) // 外気温度 [℃] (-10 ~ 35)
const balloonVolume = ref(2000) // 気球体積 V [m³] (1000 ~ 3500)
const balloonMass = ref(400) // 気球本体+カゴ+乗員質量 M [kg] (200 ~ 700)

const activeCam = ref('3d')
const showConvection = ref(true)
const isRunning = ref(true)
const timeScale = ref(1.0)

// 気球のアニメーション位置 (高度)
const balloonAltitude = ref(0) // [m] (0 ~ 100)
const balloonVelocity = ref(0)
let animTime = 0

// 物理計算: rho = P0 * M_mol / (R * T) = 351.1 / T_K
const simData = computed(() => {
  const TinK = insideTempC.value + 273.15
  const ToutK = outsideTempC.value + 273.15
  const V = balloonVolume.value
  const M = balloonMass.value
  const g = 9.8

  const rhoOut = 351.1 / ToutK
  const rhoIn = 351.1 / TinK

  const buoyancy = rhoOut * V * g
  const airWeight = rhoIn * V * g
  const bodyWeight = M * g
  const totalWeight = airWeight + bodyWeight

  const netForce = buoyancy - totalWeight
  const canLift = netForce > 0

  const rhoInRequired = rhoOut - M / V
  let minTempC = null
  if (rhoInRequired > 0) {
    const minTK = 351.1 / rhoInRequired
    minTempC = (minTK - 273.15).toFixed(1)
  }

  return {
    rhoOut: rhoOut.toFixed(3),
    rhoIn: rhoIn.toFixed(3),
    buoyancy: Math.round(buoyancy),
    airWeight: Math.round(airWeight),
    bodyWeight: Math.round(bodyWeight),
    totalWeight: Math.round(totalWeight),
    netForce: Math.round(netForce),
    canLift,
    minTempC
  }
})

function updatePhysics(dt) {
  animTime += dt
  if (!isRunning.value) return
  const stepDt = dt * 3.8 * timeScale.value
  const net = simData.value.netForce
  const totalM = balloonMass.value + parseFloat(simData.value.rhoIn) * balloonVolume.value

  let a = (net / totalM) * 18
  a -= balloonVelocity.value * 0.65

  balloonVelocity.value += a * stepDt
  balloonAltitude.value += balloonVelocity.value * stepDt

  if (balloonAltitude.value <= 0) {
    balloonAltitude.value = 0
    if (balloonVelocity.value < 0) balloonVelocity.value = 0
  } else if (balloonAltitude.value > 95) {
    balloonAltitude.value = 95 + Math.sin(animTime * 1.4) * 2.5
    balloonVelocity.value = 0
  }
}

function restartFromGround() {
  balloonAltitude.value = 0
  balloonVelocity.value = 0
  isRunning.value = true
}

function setGroundedPreset() {
  insideTempC.value = 36
  outsideTempC.value = 20
  balloonVolume.value = 1800
  balloonMass.value = 500
  balloonAltitude.value = 0
  balloonVelocity.value = 0
}

function resetSim() {
  insideTempC.value = 88
  outsideTempC.value = 15
  balloonVolume.value = 2000
  balloonMass.value = 400
  balloonAltitude.value = 0
  balloonVelocity.value = 0
  isRunning.value = true
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
    ? Math.min(2.15, Math.max(1.50, 1.88 / Math.max(0.68, aspect)))
    : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0.1, 0.1, 38.0 * ms], target: [0.1, 0.1, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.1, 41.5 * ms, 0.15], target: [0.1, 0, 0], fov: 14 }
  }
  return { pos: [4.8 * ms, 3.6 * ms, 12.6 * ms], target: [0.1, 0.05, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  sync3DScene()
}

const labelCache = {}
function updateLabelCached(sprite, key, text, color, borderColor, baseScale = 0.45) {
  const mult = isMobileViewport() ? 1.56 : 1.0
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

// Thermal color coding: Cold (#38bdf8) <-> Warm (#f97316) <-> Hot (#ef4444)
function tempToThermalColor(tC) {
  const cold = new THREE.Color(0x38bdf8)
  const warm = new THREE.Color(0xf97316)
  const hot = new THREE.Color(0xef4444)
  if (tC <= 20) return cold
  if (tC < 65) return cold.clone().lerp(warm, (tC - 20) / 45)
  return warm.clone().lerp(hot, Math.min(1, (tC - 65) / 45))
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
let sceneObjs = null
let lastIsMob = false

const GROUND_Y = -2.75

function buildEnvelopeProfilePoints() {
  // Lathe profile around Y axis: throat at y=0, widest bulge around y=1.65, dome top at y=2.55
  const raw = [
    [0.34, 0.0],
    [0.52, 0.35],
    [0.84, 0.80],
    [1.14, 1.30],
    [1.24, 1.72],
    [1.14, 2.12],
    [0.82, 2.42],
    [0.38, 2.58],
    [0.0, 2.62]
  ]
  return raw.map(([r, y]) => new THREE.Vector2(r, y))
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
      updatePhysics(dt)
      updateThreeAnimation(dt, elapsed)
      sync3DScene()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCamera(activeCam.value, 0)
        sync3DScene()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // 1. 地面グリッド & 発射パッド (上面が正確に y = GROUND_Y)
  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0.1, GROUND_Y - 0.12, 0)
  scene.add(floorGrid)

  const groundDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.4, 0.12, 36),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75, metalness: 0.25 })
  )
  groundDisk.position.set(-0.35, GROUND_Y - 0.06, 0)
  groundDisk.renderOrder = 1
  scene.add(groundDisk)

  // パッド中央の着陸ターゲットリング
  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.92, 36).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
  )
  padRing.position.set(-0.35, GROUND_Y + 0.005, 0)
  scene.add(padRing)

  // 2. 左側の3D高度スケールタワー (x = -3.65, 0m..100m)
  const altScaleGroup = new THREE.Group()
  altScaleGroup.position.set(-3.65, GROUND_Y, 0)
  scene.add(altScaleGroup)

  const maxVisualRise = 1.45 // alt=100m 時の気球上昇量
  const mastH = maxVisualRise + 2.8
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, mastH, 10),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 })
  )
  mast.position.set(0, mastH / 2, 0)
  altScaleGroup.add(mast)

  ;[0, 25, 50, 75, 100].forEach((altM) => {
    const ty = (altM / 100) * maxVisualRise + 0.05
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.025, 0.04),
      new THREE.MeshBasicMaterial({ color: altM === 0 ? 0x22c55e : 0x64748b })
    )
    tick.position.set(0.18, ty, 0)
    altScaleGroup.add(tick)
  })

  // 気球高度の水平トラッカーライン
  const altTrackGeo = new THREE.BufferGeometry()
  altTrackGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const altTrackLine = new THREE.Line(
    altTrackGeo,
    new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.7 })
  )
  scene.add(altTrackLine)

  // ======================================================
  // 3. 3D 熱気球アセンブリ (balloonGroup.position.y == ゴンドラ底面 Y)
  // ======================================================
  const balloonGroup = new THREE.Group()
  balloonGroup.position.set(-0.35, GROUND_Y, 0)
  scene.add(balloonGroup)

  // 3a. ゴンドラカゴ (local y = 0.0 .. 0.36)
  const basketH = 0.36
  const basketMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, basketH, 0.56),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75, metalness: 0.15 })
  )
  basketMesh.position.set(0, basketH / 2, 0)
  basketMesh.renderOrder = 3
  balloonGroup.add(basketMesh)

  const basketRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.06, 0.62),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
  )
  basketRim.position.set(0, basketH, 0)
  basketRim.renderOrder = 3
  balloonGroup.add(basketRim)

  // 4本の吊りケーブル + バーナーフレーム
  const cableCoords = [
    [-0.28, -0.22],
    [0.28, -0.22],
    [-0.28, 0.22],
    [0.28, 0.22]
  ]
  cableCoords.forEach(([cx, cz]) => {
    const p0 = new THREE.Vector3(cx, basketH, cz)
    const p1 = new THREE.Vector3(cx * 1.12, 0.92, cz * 1.12)
    const diff = new THREE.Vector3().subVectors(p1, p0)
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, diff.length(), 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 })
    )
    cable.position.copy(p0).addScaledVector(diff, 0.5)
    cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize())
    balloonGroup.add(cable)
  })

  // バーナーノズル & 炎コーン (local y = 0.62)
  const burnerNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 })
  )
  burnerNozzle.position.set(0, 0.60, 0)
  balloonGroup.add(burnerNozzle)

  const outerFlameGeo = new THREE.ConeGeometry(0.14, 0.44, 16)
  outerFlameGeo.translate(0, 0.22, 0)
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.88
  })
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat)
  outerFlame.position.set(0, 0.66, 0)
  outerFlame.renderOrder = 3
  balloonGroup.add(outerFlame)

  const innerFlameGeo = new THREE.ConeGeometry(0.08, 0.26, 14)
  innerFlameGeo.translate(0, 0.13, 0)
  const innerFlame = new THREE.Mesh(
    innerFlameGeo,
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.95 })
  )
  innerFlame.position.set(0, 0.66, 0)
  innerFlame.renderOrder = 3
  balloonGroup.add(innerFlame)

  // 3b. エンベロープグループ (喉元 anchor y = 0.90 から上に展開)
  const envelopeGroup = new THREE.Group()
  envelopeGroup.position.set(0, 0.90, 0)
  balloonGroup.add(envelopeGroup)

  const profilePts = buildEnvelopeProfilePoints()

  // 内部熱気コア発光体 (depthWrite: false, renderOrder: 2)
  const hotCoreMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.24,
    depthWrite: false
  })
  const hotCore = new THREE.Mesh(new THREE.SphereGeometry(0.85, 22, 22), hotCoreMat)
  hotCore.position.set(0, 1.55, 0)
  hotCore.renderOrder = 2
  envelopeGroup.add(hotCore)

  // 内部熱対流粒子 (28個, renderOrder: 3)
  const convParticles = []
  const cpGeo = new THREE.SphereGeometry(0.048, 10, 10)
  for (let i = 0; i < 28; i++) {
    const pMat = new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.88 })
    const pm = new THREE.Mesh(cpGeo, pMat)
    pm.renderOrder = 3
    pm.userData = {
      phase: (i / 28) * Math.PI * 2,
      az: (i * 2.39996) % (Math.PI * 2),
      speed: 0.55 + (i % 5) * 0.12
    }
    envelopeGroup.add(pm)
    convParticles.push(pm)
  }

  // 半透明涙滴型エンベロープ (depthWrite: false, renderOrder: 5 で内部炎・粒子を遮蔽しない)
  const envGeo = new THREE.LatheGeometry(profilePts, 36)
  const envMat = new THREE.MeshPhysicalMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.22,
    roughness: 0.28,
    metalness: 0.05,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const envMesh = new THREE.Mesh(envGeo, envMat)
  envMesh.renderOrder = 5
  envelopeGroup.add(envMesh)

  // 気球の縦方向ワイヤーリブ (8本の経線リブ + 3本の緯線リング, renderOrder: 6)
  const ribMat = new THREE.LineBasicMaterial({ color: 0xfed7aa, transparent: true, opacity: 0.65 })
  const ribCurves = profilePts.map((p) => new THREE.Vector3(p.x, p.y, 0))
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const pts = ribCurves.map(
      (v) => new THREE.Vector3(v.x * Math.cos(angle), v.y, v.x * Math.sin(angle))
    )
    const ribLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ribMat)
    ribLine.renderOrder = 6
    envelopeGroup.add(ribLine)
  }
  ;[
    { r: 0.36, y: 0.02 },
    { r: 1.14, y: 1.30 },
    { r: 1.24, y: 1.72 },
    { r: 0.82, y: 2.42 }
  ].forEach(({ r, y }) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.015, 8, 36).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xfdba74, transparent: true, opacity: 0.58 })
    )
    ring.position.set(0, y, 0)
    ring.renderOrder = 6
    envelopeGroup.add(ring)
  })

  // 外気冷却空気粒子 (周囲を漂うシアン粒子)
  const ambientParticles = []
  const ambGeo = new THREE.SphereGeometry(0.042, 8, 8)
  const ambMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
  for (let i = 0; i < 24; i++) {
    const am = new THREE.Mesh(ambGeo, ambMat)
    am.userData = {
      bx: (i % 2 === 0 ? -1 : 1) * (1.7 + ((i * 0.63) % 2.4)),
      by: -2.2 + ((i * 0.91) % 4.4),
      bz: -1.6 + ((i * 1.17) % 3.2),
      ph: i * 1.1
    }
    scene.add(am)
    ambientParticles.push(am)
  }

  // 4. 3D 力ベクトル (右側: 浮力 F_B 上向き vs 内部気体重力 m_gas g + 本体重力 M_load g 下向き)
  const arrowFB = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowGasG = createVectorArrow3D({ color: 0xfb923c, shaftRadius: 0.048, headRadius: 0.14, headLength: 0.32 })
  const arrowLoadG = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.052, headRadius: 0.15, headLength: 0.34 })
  scene.add(arrowFB, arrowGasG, arrowLoadG)

  // 5. 3D ラベルスプライト
  const labelAlt = createTextSprite('高度 z = 0.0 m', {
    color: '#e2e8f0',
    borderColor: '#38bdf8',
    scale: 0.44
  })
  const labelTin = createTextSprite('Tin = 88℃', {
    color: '#fdba74',
    borderColor: '#f97316',
    scale: 0.44
  })
  const labelPad = createTextSprite('地上発射パッド (0 m)', {
    color: '#86efac',
    borderColor: '#22c55e',
    scale: 0.42
  })
  labelPad.position.set(-0.35, GROUND_Y - 0.35, 1.35)

  const labelFB = createTextSprite('浮力 F_B', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.45
  })
  const labelGasG = createTextSprite('空気重 m_gas g', {
    color: '#fed7aa',
    borderColor: '#fb923c',
    scale: 0.42
  })
  const labelLoadG = createTextSprite('本体重 M_load g', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.42
  })

  scene.add(labelAlt, labelTin, labelPad, labelFB, labelGasG, labelLoadG)

  sceneObjs = {
    balloonGroup,
    envelopeGroup,
    envMat,
    ribMat,
    hotCore,
    hotCoreMat,
    outerFlame,
    outerFlameMat,
    innerFlame,
    convParticles,
    ambientParticles,
    altTrackGeo,
    altTrackLine,
    arrowFB,
    arrowGasG,
    arrowLoadG,
    labelAlt,
    labelTin,
    labelPad,
    labelFB,
    labelGasG,
    labelLoadG,
    maxVisualRise
  }

  sync3DScene()
}

function updateThreeAnimation(dt, elapsed) {
  if (!sceneObjs) return
  const { outerFlame, innerFlame, convParticles, ambientParticles } = sceneObjs

  // バーナー炎の強度を (T_in - T_out) に同期
  const tempDiff = Math.max(0, insideTempC.value - outsideTempC.value)
  const flameRatio = Math.min(1.5, Math.max(0.15, tempDiff / 70))
  const flicker = 1 + Math.sin(elapsed * 16) * 0.12 + Math.cos(elapsed * 23) * 0.08
  outerFlame.visible = tempDiff > 4
  innerFlame.visible = tempDiff > 4
  outerFlame.scale.set(0.85 + flameRatio * 0.3, flameRatio * flicker, 0.85 + flameRatio * 0.3)
  innerFlame.scale.set(0.85 + flameRatio * 0.2, flameRatio * flicker * 0.95, 0.85 + flameRatio * 0.2)

  // 熱対流粒子 (中央上昇 -> 上部拡散 -> 壁沿い下降)
  const convRate = (0.35 + flameRatio * 0.85) * (isRunning.value ? timeScale.value : 0)
  convParticles.forEach((p, idx) => {
    p.visible = showConvection.value
    if (!showConvection.value) return
    p.userData.phase = (p.userData.phase + dt * p.userData.speed * convRate) % (Math.PI * 2)
    const u = p.userData.phase / (Math.PI * 2) // 0..1 loop
    const az = p.userData.az + elapsed * 0.25
    let r = 0.2
    let y = 1.2
    if (u < 0.55) {
      // 中央部を力強く上昇
      const t = u / 0.55
      y = 0.25 + t * 2.05
      r = 0.14 + Math.sin(t * Math.PI) * 0.30
      p.material.color.setHex(insideTempC.value > 55 ? 0xf97316 : 0xfbbf24)
    } else {
      // 外壁沿いにゆっくり循環下降
      const t = (u - 0.55) / 0.45
      y = 2.30 - t * 1.95
      r = 0.55 + Math.sin((1 - t) * Math.PI * 0.85) * 0.48
      p.material.color.setHex(0x7dd3fc)
    }
    p.position.set(Math.cos(az) * r, y, Math.sin(az) * r)
    void idx
  })

  // 外気粒子のゆらぎ
  const ambSpeed = isRunning.value ? timeScale.value : 0
  ambientParticles.forEach((am) => {
    am.visible = showConvection.value
    if (!showConvection.value) return
    const t = elapsed * ambSpeed + am.userData.ph
    am.position.set(
      am.userData.bx + Math.sin(t * 0.9) * 0.18,
      am.userData.by + Math.cos(t * 1.1) * 0.15,
      am.userData.bz + Math.sin(t * 0.7) * 0.18
    )
  })
}

function sync3DScene() {
  if (!sceneObjs) return
  const {
    balloonGroup,
    envelopeGroup,
    envMat,
    ribMat,
    hotCore,
    hotCoreMat,
    altTrackGeo,
    altTrackLine,
    arrowFB,
    arrowGasG,
    arrowLoadG,
    labelAlt,
    labelTin,
    labelPad,
    labelFB,
    labelGasG,
    labelLoadG,
    maxVisualRise
  } = sceneObjs

  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'
  const data = simData.value

  // 1. 気球位置 (alt=0 のとき GROUND_Y にぴったり接地)
  const yLift = (balloonAltitude.value / 100) * maxVisualRise
  balloonGroup.position.set(-0.35, GROUND_Y + yLift, 0)

  // 体積連動のエンベロープスケール
  const volScale = Math.cbrt(balloonVolume.value / 2000)
  envelopeGroup.scale.setScalar(volScale)

  // 熱的カラー更新 (#38bdf8 <-> #f97316 / #ef4444)
  const envCol = tempToThermalColor(insideTempC.value)
  envMat.color.copy(envCol)
  envMat.emissive.copy(envCol).multiplyScalar(0.32)
  hotCoreMat.color.copy(envCol)
  hotCoreMat.opacity = 0.12 + Math.min(0.24, Math.max(0, (insideTempC.value - 20) / 360))
  hotCore.scale.setScalar(0.8 + (insideTempC.value - 20) / 180)
  ribMat.color.copy(insideTempC.value > 50 ? new THREE.Color(0xfed7aa) : new THREE.Color(0xbae6fd))

  // 高度トラッカーライン
  const trackerY = GROUND_Y + yLift + 0.05
  const tArr = altTrackGeo.getAttribute('position').array
  tArr[0] = -3.45; tArr[1] = trackerY; tArr[2] = 0
  tArr[3] = -0.80; tArr[4] = trackerY; tArr[5] = 0
  altTrackGeo.getAttribute('position').needsUpdate = true
  altTrackLine.computeLineDistances()

  // 2. 3D 力ベクトル (気球中心の右側に明確配置)
  const balloonCenterY = GROUND_Y + yLift + 0.90 + 1.55 * volScale
  const forceScale = 0.000052
  const fbLen = Math.min(2.15, Math.max(0.55, data.buoyancy * forceScale))
  const gasLen = Math.min(1.50, Math.max(0.40, data.airWeight * forceScale))
  const loadLen = Math.min(1.10, Math.max(0.28, data.bodyWeight * forceScale))

  const fbOriginX = 2.05
  const wOriginX = 3.10
  const fbZ = isTop ? 0.55 : 0.0
  const wZ = isTop ? -0.55 : 0.0

  arrowFB.setVector(new THREE.Vector3(fbOriginX, balloonCenterY - fbLen * 0.25, fbZ), new THREE.Vector3(0, 1, 0), fbLen)
  arrowGasG.setVector(new THREE.Vector3(wOriginX, balloonCenterY, wZ), new THREE.Vector3(0, -1, 0), gasLen)
  arrowLoadG.setVector(new THREE.Vector3(wOriginX, balloonCenterY - gasLen - 0.04, wZ), new THREE.Vector3(0, -1, 0), loadLen)

  // 3. 3D ラベル配置（全視点・モバイル375pxで非重複）
  labelPad.visible = !isTop
  updateLabelCached(labelPad, 'pad', mob ? '発射パッド (0m)' : '地上発射パッド (z = 0 m)', '#86efac', '#22c55e', 0.42)

  if (isTop) {
    labelAlt.position.set(-3.45, 0.4, -1.85)
    labelTin.position.set(-0.75, 0.4, 2.20)
    labelFB.position.set(1.85, 0.4, 0.95)
    labelGasG.position.set(2.95, 0.4, -2.05)
    labelLoadG.position.set(2.95, 0.4, -0.65)
  } else {
    labelAlt.position.set(-3.45, Math.max(GROUND_Y + 0.65, trackerY + 0.38), 0.3)
    labelTin.position.set(-0.35, Math.min(3.15, GROUND_Y + yLift + 0.90 + 2.65 * volScale + 0.42), 0.2)

    const fbTipY = balloonCenterY - fbLen * 0.25 + fbLen
    labelFB.position.set(fbOriginX, Math.min(3.05, fbTipY + 0.38), 0.2)

    const gasMidY = balloonCenterY - gasLen * 0.45
    const loadTipY = balloonCenterY - gasLen - loadLen - 0.42
    // 縦の重なりを防止 (最小間隔 0.85)
    const safeLoadY = Math.min(loadTipY, gasMidY - 0.88)
    labelGasG.position.set(wOriginX + 0.35, gasMidY, 0.1)
    labelLoadG.position.set(wOriginX + 0.35, Math.max(-2.45, safeLoadY), 0.1)
  }

  updateLabelCached(labelAlt, 'alt', mob ? `z=${balloonAltitude.value.toFixed(0)}m` : `高度 z = ${balloonAltitude.value.toFixed(1)} m`, '#e2e8f0', '#38bdf8', 0.42)
  updateLabelCached(labelTin, 'tin', mob ? `Tin=${insideTempC.value}℃` : `内部温度 Tin = ${insideTempC.value} ℃`, '#fdba74', '#f97316', 0.43)
  updateLabelCached(labelFB, 'fb', mob ? `FB=${data.buoyancy}N` : `浮力 F_B = ${data.buoyancy} N`, '#7dd3fc', '#38bdf8', 0.43)
  updateLabelCached(labelGasG, 'gasG', mob ? `mg=${data.airWeight}N` : `空気重 m_gas g = ${data.airWeight} N`, '#fed7aa', '#fb923c', 0.41)
  updateLabelCached(labelLoadG, 'loadG', mob ? `Mg=${data.bodyWeight}N` : `本体重 M_load g = ${data.bodyWeight} N`, '#fda4af', '#f43f5e', 0.41)
}

watch([insideTempC, outsideTempC, balloonVolume, balloonMass], () => {
  sync3DScene()
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.65rem;
}

.sim-title {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.08rem;
  color: #38bdf8;
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

.dot-fb { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-gas { background: #fb923c; box-shadow: 0 0 6px #fb923c; }
.dot-load { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }

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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.badge {
  background: rgba(244, 63, 94, 0.15);
  color: #fda4af;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 8px;
  border: 1px solid rgba(244, 63, 94, 0.4);
}

.badge.badge-lift {
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.45);
}

.min-temp-chip {
  font-size: 0.76rem;
  color: #fde68a;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.35);
  padding: 4px 10px;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.stat-card {
  background: #1e293b;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  font-family: monospace;
  color: #f8fafc;
}

.stat-unit {
  font-size: 0.72rem;
  font-weight: 400;
  color: #94a3b8;
}

.text-cyan { color: #38bdf8; }
.text-orange { color: #fb923c; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 12px;
  background: #1e293b;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.8rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control-group label {
  font-size: 0.82rem;
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
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  padding: 0.42rem 0.9rem;
  font-size: 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #0284c7;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
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
  color: #ffffff;
  border-color: #94a3b8;
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
  .badge,
  .min-temp-chip {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
