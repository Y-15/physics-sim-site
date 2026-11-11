<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🪢</span>
        <span>3D 動く斜面台と小球の束縛運動シミュレーター</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="badge" style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="badge">水平方向運動量保存則 × 相対運動</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
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
          :class="{ active: showVectors }"
          @click="showVectors = !showVectors"
        >
          {{ showVectors ? '🏹 3Dベクトル: ON' : '🏹 3Dベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button
        class="btn btn-primary"
        @click="isPlaying = !isPlaying"
        style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;"
      >
        {{ isPlaying ? '⏸ 一時停止' : '▶ 滑走再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
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
        ⏮ 最初から滑走
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>速度 <b>v, V</b> / 重心 <b>X<sub>G</sub></b></span>
        <span class="legend-item"><i class="dot-n"></i>垂直抗力 <b>N</b></span>
        <span class="legend-item"><i class="dot-g"></i>重力 <b>mg, Mg</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- リアルタイム統計カード -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">台の速度 <i>V</i><sub><i>x</i></sub></div>
        <div class="stat-value" style="color: #10b981">{{ wedgeVx.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">反動で左向きに加速</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">球の速さ |<i>v</i>| (静止系)</div>
        <div class="stat-value" style="color: #34d399">{{ ballAbsSpeed.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">相対速度 <i>v</i><sub>rel</sub> = {{ ballVs.toFixed(2) }} m/s</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">垂直抗力 <i>N</i></div>
        <div class="stat-value" style="color: #38bdf8">{{ accelerations.normalForce.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula"><i>N</i> = <i>Mmg</i> cosθ / (<i>M</i> + <i>m</i> sin²θ)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">滑走時間 <i>t</i></div>
        <div class="stat-value" style="color: #fbbf24">{{ simTime.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula">水平重心 <i>X</i><sub><i>G</i></sub> = 0.00 m (不変)</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label><span>斜面台の質量 <i>M</i>:</span> <span>{{ wedgeMass.toFixed(1) }} kg</span></label>
          <input type="range" v-model.number="wedgeMass" min="1.0" max="8.0" step="0.5" @input="resetSim" />
        </div>
        <div class="control-group">
          <label><span>小球の質量 <i>m</i>:</span> <span>{{ ballMass.toFixed(1) }} kg</span></label>
          <input type="range" v-model.number="ballMass" min="0.5" max="4.0" step="0.5" @input="resetSim" />
        </div>
        <div class="control-group">
          <label><span>斜面角度 θ:</span> <span>{{ slopeAngleDeg }}°</span></label>
          <input type="range" v-model.number="slopeAngleDeg" min="20" max="50" step="5" @input="resetSim" />
        </div>
      </div>
    </div>

    <div class="physics-principle">
      💡 <strong>入試の核心</strong>：床との間に摩擦がないため、全体に対して水平方向の外力は一切働きません。したがって、<strong>「全体の水平方向の重心 <i>X</i><sub><i>G</i></sub> は滑走中も完全に静止（不変）」</strong>し、水平方向の運動量保存則 <i>M</i> <i>V</i><sub><i>x</i></sub> + <i>m</i> <i>v</i><sub><i>x</i></sub> = 0 が厳密に成立します。
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

// 物理パラメータ
const wedgeMass = ref(3.0) // M [kg] (1.0 ~ 8.0)
const ballMass = ref(1.0) // m [kg] (0.5 ~ 4.0)
const slopeAngleDeg = ref(30) // theta [deg] (20 ~ 50)
const isPlaying = ref(true)
const timeScale = ref(0.4)
const activeCam = ref('3d')
const showVectors = ref(true)

const g = 9.8 // m/s^2
const slopeLen = 4.6 // 3D空間斜面全長 [m]
const floorY = -1.65
const startS0 = 0.35

const thetaRad = computed(() => (slopeAngleDeg.value * Math.PI) / 180)
const wedgeW = computed(() => slopeLen * Math.cos(thetaRad.value))
const wedgeH = computed(() => slopeLen * Math.sin(thetaRad.value))
const ballR = computed(() => 0.22 + ballMass.value * 0.032)

// 理論加速度 (厳密解: 右下がり斜面に対し台が左へ後退)
// 台の水平加速度 A_x = -(m g sinθ cosθ) / (M + m sin²θ)
// 球の斜面相対加速度 α = ((M + m) g sinθ) / (M + m sin²θ)
// 垂直抗力 N = (M m g cosθ) / (M + m sin²θ)
const accelerations = computed(() => {
  const M = wedgeMass.value
  const m = ballMass.value
  const th = thetaRad.value
  const sinT = Math.sin(th)
  const cosT = Math.cos(th)
  const denom = M + m * sinT * sinT

  const wedgeAx = -(m * g * sinT * cosT) / denom
  const relAlpha = ((M + m) * g * sinT) / denom
  const normalForce = (M * m * g * cosT) / denom

  return {
    wedgeAx,
    relAlpha,
    normalForce
  }
})

// 初期位置で水平重心 X_G がちょうど x = 0 になるように配置
function getInitialWedgeX() {
  const M = wedgeMass.value
  const m = ballMass.value
  const th = thetaRad.value
  const W = wedgeW.value
  const r = ballR.value
  return -(M * (W / 3) + m * (startS0 * Math.cos(th) + r * Math.sin(th))) / (M + m)
}

// 動的状態 (リアクティブ数値)
const wedgeX = ref(0)
const wedgeVx = ref(0)
const ballS = ref(startS0)
const ballVs = ref(0)
const simTime = ref(0)
let endWait = 0
const trailPoints = []

const ballAbsVx = computed(() => wedgeVx.value + ballVs.value * Math.cos(thetaRad.value))
const ballAbsVy = computed(() => -ballVs.value * Math.sin(thetaRad.value))
const ballAbsSpeed = computed(() => Math.hypot(ballAbsVx.value, ballAbsVy.value))

const centerOfMassX = computed(() => {
  const M = wedgeMass.value
  const m = ballMass.value
  const th = thetaRad.value
  const r = ballR.value
  const wedgeG = wedgeX.value + wedgeW.value / 3
  const ballCx = wedgeX.value + ballS.value * Math.cos(th) + r * Math.sin(th)
  return (M * wedgeG + m * ballCx) / (M + m)
})

function getCamDistScale() {
  const w = threeContainer.value?.clientWidth || 720
  const h = threeContainer.value?.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.08 ? Math.min(1.62, 1.32 / Math.max(0.72, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const k = getCamDistScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([5.4 * k, 3.6 * k, 12.2 * k], [0, 0.35, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 0.35, 48.0 * k], [0, 0.35, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 48.0 * k, 0.01], [0, 0, 0], duration, 14)
  }
}

function resetSim() {
  wedgeX.value = getInitialWedgeX()
  wedgeVx.value = 0
  ballS.value = startS0
  ballVs.value = 0
  simTime.value = 0
  endWait = 0
  trailPoints.length = 0

  if (sceneObjs) {
    rebuildWedgeGeometry()
    updateFrame()
  }
}

function stepForward() {
  updatePhysics(0.05)
  updateFrame()
}

function updatePhysics(dtOverride = null) {
  if (!isPlaying.value && dtOverride === null) return

  const dt = (dtOverride !== null ? dtOverride : 0.03) * timeScale.value
  const maxS = slopeLen - ballR.value * 1.15

  if (ballS.value < maxS) {
    endWait = 0
    const acc = accelerations.value
    wedgeVx.value += acc.wedgeAx * dt
    wedgeX.value += wedgeVx.value * dt

    ballVs.value += acc.relAlpha * dt
    ballS.value += ballVs.value * dt
    if (ballS.value > maxS) ballS.value = maxS

    simTime.value += dt

    const th = thetaRad.value
    const r = ballR.value
    const bx = wedgeX.value + ballS.value * Math.cos(th) + r * Math.sin(th)
    const by = floorY + wedgeH.value - ballS.value * Math.sin(th) + r * Math.cos(th)
    trailPoints.push(new THREE.Vector3(bx, by, 0))
    if (trailPoints.length > 260) trailPoints.shift()
  } else if (dtOverride === null) {
    endWait += dt
    if (endWait > 1.0) {
      resetSim()
    }
  }
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
function disposeChildren(group) {
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    child.traverse((obj) => {
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
    })
  }
}

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
    initialCamPos: [5.4 * k, 3.6 * k, 12.2 * k],
    initialTarget: [0, 0.35, 0],
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
      if (isPlaying.value) {
        updatePhysics(Math.min(dt, 0.04))
      }
      updateFrame()
    }
  })

  const { scene } = threeCtx

  // 1. 低摩擦エアトラック床面 + デュアルトーングリッド + 目盛り
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.y = floorY - 0.01
  scene.add(grid)

  const trackGeo = new THREE.BoxGeometry(9.8, 0.14, 3.4)
  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.25,
    transparent: true,
    opacity: 0.9
  })
  const track = new THREE.Mesh(trackGeo, trackMat)
  track.position.set(0, floorY - 0.08, 0)
  scene.add(track)

  // 光るレールガイド (前後に2本)
  const railGeo = new THREE.BoxGeometry(9.6, 0.04, 0.06)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    metalness: 0.7,
    roughness: 0.2
  })
  ;[-1.08, 1.08].forEach((rz) => {
    const rail = new THREE.Mesh(railGeo, railMat)
    rail.position.set(0, floorY + 0.01, rz)
    scene.add(rail)
  })

  // 目盛り刻み
  const tickGeo = new THREE.BoxGeometry(0.03, 0.02, 0.16)
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
  for (let tx = -4.0; tx <= 4.01; tx += 1.0) {
    const tick = new THREE.Mesh(tickGeo, tickMat)
    tick.position.set(tx, floorY + 0.015, 1.2)
    scene.add(tick)
  }

  // 2. 動的・静的サブグループ
  const ghostGroup = new THREE.Group()
  scene.add(ghostGroup)

  const wedgeGroup = new THREE.Group()
  scene.add(wedgeGroup)

  // 3. 小球本体 + ハロー + 軌跡ライン
  const ballGroup = new THREE.Group()
  const ballGeo = new THREE.SphereGeometry(1, 32, 32)
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xbe123c,
    emissiveIntensity: 0.45,
    metalness: 0.35,
    roughness: 0.2
  })
  const ballMesh = new THREE.Mesh(ballGeo, ballMat)
  ballGroup.add(ballMesh)

  const haloGeo = new THREE.SphereGeometry(1.22, 20, 20)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.18
  })
  ballGroup.add(new THREE.Mesh(haloGeo, haloMat))
  scene.add(ballGroup)

  const maxTrail = 260
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxTrail * 3), 3))
  const trailMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.85
  })
  const trailLine = new THREE.Line(trailGeo, trailMat)
  scene.add(trailLine)

  // 4. 水平重心 X_G 鉛直レーザー基準線 + 床ピン + ラベル
  const comBeamGeo = new THREE.CylinderGeometry(0.022, 0.022, 3.85, 12)
  const comBeamMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.78
  })
  const comBeam = new THREE.Mesh(comBeamGeo, comBeamMat)
  comBeam.position.set(0, floorY + 1.92, 0)
  scene.add(comBeam)

  const comPinGeo = new THREE.RingGeometry(0.14, 0.24, 24)
  comPinGeo.rotateX(-Math.PI / 2)
  const comPin = new THREE.Mesh(comPinGeo, new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }))
  comPin.position.set(0, floorY + 0.025, 0)
  scene.add(comPin)

  const comLabel = createTextSprite('重心 X_G (水平不変)', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.40
  })
  comLabel.position.set(0, floorY + 4.00, -1.85)
  scene.add(comLabel)

  // 5. 3D ベクトル矢印
  const arrowN = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.3 })
  const arrowMgBall = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.3 })
  const arrowVelBall = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowVelWedge = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowMgWedge = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.3 })
  scene.add(arrowN, arrowMgBall, arrowVelBall, arrowVelWedge, arrowMgWedge)

  // 6. ベクトル・物体ラベル
  const labelN = createTextSprite('N', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.38 })
  const labelMgBall = createTextSprite('mg', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.38 })
  const labelVelBall = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.38 })
  const labelVelWedge = createTextSprite('V', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.38 })
  const labelMgWedge = createTextSprite('Mg', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.38 })
  const labelWedgeMass = createTextSprite('台 M = 3.0kg', { color: '#bae6fd', borderColor: '#38bdf8', scale: 0.38 })
  const labelBallMass = createTextSprite('m', { color: '#fecdd3', borderColor: '#f43f5e', scale: 0.36 })
  scene.add(labelN, labelMgBall, labelVelBall, labelVelWedge, labelMgWedge, labelWedgeMass, labelBallMass)

  sceneObjs = {
    ghostGroup,
    wedgeGroup,
    ballGroup,
    trailGeo,
    maxTrail,
    comBeam,
    comPin,
    comLabel,
    arrowN,
    arrowMgBall,
    arrowVelBall,
    arrowVelWedge,
    arrowMgWedge,
    labelN,
    labelMgBall,
    labelVelBall,
    labelVelWedge,
    labelMgWedge,
    labelWedgeMass,
    labelBallMass
  }

  resetSim()
}

function rebuildWedgeGeometry() {
  if (!sceneObjs) return
  const { ghostGroup, wedgeGroup } = sceneObjs
  disposeChildren(ghostGroup)
  disposeChildren(wedgeGroup)

  const W = wedgeW.value
  const H = wedgeH.value
  const th = thetaRad.value
  const depth = 1.9

  // 右下がり直角三角形: (0,0) -> (W,0) -> (0,H)
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(W, 0)
  shape.lineTo(0, H)
  shape.closePath()

  const extrudeGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
  extrudeGeo.translate(0, 0, -depth / 2)

  // 初期位置ゴースト枠
  const ghostEdges = new THREE.EdgesGeometry(extrudeGeo)
  const ghostMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.45
  })
  const ghostMesh = new THREE.LineSegments(ghostEdges, ghostMat)
  ghostMesh.position.set(getInitialWedgeX(), floorY, 0)
  ghostGroup.add(ghostMesh)

  // ガラス質＋金属フレーム斜面台本体
  const wedgeMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    emissive: 0x0284c7,
    emissiveIntensity: 0.14,
    metalness: 0.35,
    roughness: 0.2,
    transparent: true,
    opacity: 0.74
  })
  const wedgeMesh = new THREE.Mesh(extrudeGeo, wedgeMat)
  wedgeGroup.add(wedgeMesh)

  const wedgeEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(extrudeGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
  )
  wedgeGroup.add(wedgeEdges)

  // 光る滑り面ガイドレール
  const railGeo = new THREE.BoxGeometry(slopeLen, 0.035, 0.06)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.3
  })
  ;[-0.55, 0.55].forEach((rz) => {
    const rail = new THREE.Mesh(railGeo, railMat)
    rail.position.set(W / 2, H / 2, rz)
    rail.rotation.z = -th
    wedgeGroup.add(rail)
  })

  // 低摩擦スライダースキッド
  const skidGeo = new THREE.BoxGeometry(0.45, 0.06, depth + 0.08)
  const skidMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
  ;[0.25, W - 0.35].forEach((sx) => {
    const skid = new THREE.Mesh(skidGeo, skidMat)
    skid.position.set(sx, 0.03, 0)
    wedgeGroup.add(skid)
  })

  // 台の重心マーカー G_M
  const comWedgeDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  )
  comWedgeDot.position.set(W / 3, H / 3, 0)
  wedgeGroup.add(comWedgeDot)

  // 角度 θ アーク (右下角 (W, 0))
  const arcR = 0.65
  const arcCurve = new THREE.EllipseCurve(0, 0, arcR, arcR, Math.PI - th, Math.PI, false, 0)
  const arcPts = arcCurve.getPoints(20).map((p) => new THREE.Vector3(W + p.x, p.y, depth / 2 + 0.03))
  const arcLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: 0xfbbf24 })
  )
  wedgeGroup.add(arcLine)

  const thetaLbl = createTextSprite(`θ = ${slopeAngleDeg.value}°`, {
    color: '#fde68a',
    borderColor: 'rgba(251,191,36,0.5)',
    scale: 0.36
  })
  thetaLbl.position.set(W + 0.42, 0.25, depth / 2 + 0.08)
  wedgeGroup.add(thetaLbl)
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    wedgeGroup,
    ballGroup,
    trailGeo,
    maxTrail,
    comBeam,
    comPin,
    comLabel,
    arrowN,
    arrowMgBall,
    arrowVelBall,
    arrowVelWedge,
    arrowMgWedge,
    labelN,
    labelMgBall,
    labelVelBall,
    labelVelWedge,
    labelMgWedge,
    labelWedgeMass,
    labelBallMass
  } = sceneObjs

  const wx = wedgeX.value
  const W = wedgeW.value
  const H = wedgeH.value
  const th = thetaRad.value
  const r = ballR.value

  wedgeGroup.position.set(wx, floorY, 0)

  // 球の中心座標 (斜面の法線方向 (+sinθ, +cosθ) へ r オフセット)
  const bx = wx + ballS.value * Math.cos(th) + r * Math.sin(th)
  const by = floorY + H - ballS.value * Math.sin(th) + r * Math.cos(th)
  ballGroup.position.set(bx, by, 0)
  ballGroup.scale.set(r, r, r)

  // 軌跡更新
  const posAttr = trailGeo.getAttribute('position')
  const arr = posAttr.array
  const count = Math.min(trailPoints.length, maxTrail)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = trailPoints[i].x
    arr[i * 3 + 1] = trailPoints[i].y
    arr[i * 3 + 2] = trailPoints[i].z
  }
  trailGeo.setDrawRange(0, count)
  posAttr.needsUpdate = true

  // 重心位置 (常に 0 付近に固定されることをリアルタイム反映)
  const cmX = centerOfMassX.value
  comBeam.position.x = cmX
  comPin.position.x = cmX
  comLabel.position.x = cmX

  // 質量ラベル
  updateSpriteSafe(labelWedgeMass, `台 M = ${wedgeMass.value.toFixed(1)}kg`, '#bae6fd', '#38bdf8')
  labelWedgeMass.position.set(wx - 0.95, floorY - 0.32, -1.15)

  updateSpriteSafe(labelBallMass, `m = ${ballMass.value.toFixed(1)}kg`, '#fecdd3', '#f43f5e')
  labelBallMass.position.set(bx - r - 0.82, by + r + 0.45, 0.55)

  if (showVectors.value) {
    const Nval = accelerations.value.normalForce
    const lenN = Math.min(1.15, Math.max(0.45, Nval * 0.045))
    const lenMgBall = Math.min(1.25, Math.max(0.75, ballMass.value * g * 0.055))
    const lenMgWedge = Math.min(1.05, Math.max(0.48, wedgeMass.value * g * 0.018))

    const nDir = new THREE.Vector3(Math.sin(th), Math.cos(th), 0)
    arrowN.setVector(new THREE.Vector3(bx, by, 0.14), nDir, lenN)
    arrowMgBall.setVector(new THREE.Vector3(bx, by, 0.14), new THREE.Vector3(0, -1, 0), lenMgBall)

    labelN.visible = true
    labelMgBall.visible = true
    updateSpriteSafe(labelN, `N = ${Nval.toFixed(1)}N`, '#7dd3fc', '#38bdf8')
    updateSpriteSafe(labelMgBall, `mg = ${(ballMass.value * g).toFixed(1)}N`, '#fde68a', '#f59e0b')
    labelN.position.set(bx + nDir.x * (lenN + 0.48) + 0.35, by + nDir.y * (lenN + 0.48), 0.15)
    labelMgBall.position.set(bx - 0.65, by - lenMgBall - 0.38, 1.50)

    // 台の重力 Mg (台重心から下向き)
    const wedgeComX = wx + W / 3
    const wedgeComY = floorY + H / 3
    arrowMgWedge.setVector(new THREE.Vector3(wedgeComX, wedgeComY, 0.98), new THREE.Vector3(0, -1, 0), lenMgWedge)
    labelMgWedge.visible = true
    updateSpriteSafe(labelMgWedge, `Mg = ${(wedgeMass.value * g).toFixed(0)}N`, '#fde68a', '#f59e0b')
    labelMgWedge.position.set(wedgeComX + 0.65, wedgeComY - lenMgWedge - 0.35, 2.05)

    // 速度ベクトル v (球・静止系)
    const vAbs = ballAbsSpeed.value
    if (vAbs > 0.12) {
      const vDir = new THREE.Vector3(ballAbsVx.value, ballAbsVy.value, 0).normalize()
      const vLen = Math.min(1.45, Math.max(0.4, vAbs * 0.26))
      arrowVelBall.setVector(new THREE.Vector3(bx, by, 0.22), vDir, vLen)
      labelVelBall.visible = true
      updateSpriteSafe(labelVelBall, `v = ${vAbs.toFixed(1)}m/s`, '#6ee7b7', '#10b981')
      labelVelBall.position.set(bx + vDir.x * (vLen + 0.48) + 0.45, by + vDir.y * (vLen + 0.48) - 0.08, -0.55)
    } else {
      arrowVelBall.visible = false
      labelVelBall.visible = false
    }

    // 速度ベクトル V (台・左向き)
    if (Math.abs(wedgeVx.value) > 0.06) {
      const wLen = Math.min(1.4, Math.max(0.38, Math.abs(wedgeVx.value) * 0.42))
      const startY = floorY + H * 0.45
      arrowVelWedge.setVector(new THREE.Vector3(wx, startY, 0.2), new THREE.Vector3(-1, 0, 0), wLen)
      labelVelWedge.visible = true
      updateSpriteSafe(labelVelWedge, `V = ${Math.abs(wedgeVx.value).toFixed(2)}m/s`, '#6ee7b7', '#10b981')
      labelVelWedge.position.set(wx - wLen - 0.85, startY + 0.28, -0.45)
    } else {
      arrowVelWedge.visible = false
      labelVelWedge.visible = false
    }
  } else {
    arrowN.visible = false
    arrowMgBall.visible = false
    arrowVelBall.visible = false
    arrowVelWedge.visible = false
    arrowMgWedge.visible = false
    labelN.visible = false
    labelMgBall.visible = false
    labelVelBall.visible = false
    labelVelWedge.visible = false
    labelMgWedge.visible = false
  }
}

watch(showVectors, () => {
  updateFrame()
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
  gap: 8px;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.65);
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
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow: hidden;
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

.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-n { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-g { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.75rem;
  text-align: center;
}

.stat-card.highlight {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.07);
}

.stat-label {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.stat-value {
  font-size: 1.18rem;
  font-weight: 700;
  color: #f4f4f5;
  font-variant-numeric: tabular-nums;
}

.stat-value .unit {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 400;
}

.stat-formula {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 0.22rem;
}

.controls-panel {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.control-group label {
  font-size: 0.8rem;
  color: #cbd5e1;
  display: flex;
  justify-content: space-between;
}

.control-group label span:last-child {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #0284c7, #10b981);
  color: #ffffff;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-secondary:hover {
  background: #334155;
}

.physics-principle {
  margin-top: 0.85rem;
  padding: 0.65rem 0.85rem;
  background: rgba(30, 41, 59, 0.45);
  border-left: 3px solid #10b981;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.55;
}

.physics-principle strong {
  color: #10b981;
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
