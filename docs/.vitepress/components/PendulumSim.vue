<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🕰️ 3D 単振り子（Simple Pendulum）インタラクティブ実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#34d399;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="sim-badge">ルンゲ＝クッタ高精度解法・力の3D分解</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面視点（振れ角と力の分解）
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          ⭕ 斜め側面視点
        </button>
      </div>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: showForceComponents }" @click="showForceComponents = !showForceComponents">
          {{ showForceComponents ? '⚖️ 張力T・重力分解: ON' : '⚖️ 張力T・重力分解: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="btn btn-secondary" @click="stepSim(0.04)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.04s)
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 初期角度にリセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
          <span class="legend-item"><i class="dot-t"></i>張力 <b>T</b></span>
          <span class="legend-item"><i class="dot-f"></i>復元力 <b>−mg sinθ</b></span>
          <span class="legend-item"><i class="dot-g"></i>動径成分 <b>mg cosθ</b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-grid">
      <div class="control-item">
        <label>
          糸の長さ <i>L</i>: <strong>{{ length.toFixed(2) }} m</strong>
        </label>
        <input type="range" v-model.number="length" min="0.5" max="2.5" step="0.05" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          初期角度 <i>θ</i><sub>0</sub>: <strong>{{ initialAngleDeg }}°</strong>
        </label>
        <input type="range" v-model.number="initialAngleDeg" min="5" max="85" step="1" @input="onAngleSliderChange" />
      </div>

      <div class="control-item">
        <label>
          おもりの質量 <i>m</i>: <strong>{{ mass.toFixed(1) }} kg</strong>
        </label>
        <input type="range" v-model.number="mass" min="0.2" max="5.0" step="0.1" @input="onParamChange" />
      </div>

      <div class="control-item">
        <label>
          重力加速度 <i>g</i>: <strong>{{ g.toFixed(2) }} m/s²</strong>
        </label>
        <input type="range" v-model.number="g" min="1.6" max="25" step="0.1" @input="onParamChange" />
      </div>
    </div>

    <!-- プリセット・環境設定 -->
    <div class="preset-buttons">
      <span class="preset-label">重力プリセット:</span>
      <button :class="{ active: Math.abs(g - 9.8) < 0.05 }" @click="setGravity(9.8)">🌍 地球 (9.8)</button>
      <button :class="{ active: Math.abs(g - 1.62) < 0.05 }" @click="setGravity(1.62)">🌕 月 (1.62)</button>
      <button :class="{ active: Math.abs(g - 24.79) < 0.05 }" @click="setGravity(24.79)">🪐 木星 (24.8)</button>
      <button :class="{ active: Math.abs(g - 3.72) < 0.05 }" @click="setGravity(3.72)">🔴 火星 (3.72)</button>
    </div>

    <!-- 表示・減衰オプション -->
    <div class="action-buttons" style="justify-content: flex-start; gap: 16px;">
      <label class="toggle-label">
        <input type="checkbox" v-model="airResistance" />
        空気抵抗（微小減衰）
      </label>

      <label class="toggle-label">
        <input type="checkbox" v-model="showVectors" />
        速度ベクトル表示
      </label>

      <label class="toggle-label">
        <input type="checkbox" v-model="showTrail" />
        3D 円弧軌跡表示
      </label>
    </div>

    <!-- エネルギー保存メーター -->
    <div class="energy-panel">
      <div class="energy-header">
        <span>⚡ 力学的エネルギー保存 (<i>E</i> = <i>K</i> + <i>U</i>)</span>
        <span class="total-energy-val">{{ totalEnergy.toFixed(2) }} J</span>
      </div>
      <div class="energy-bar-wrap">
        <div
          class="bar-kinetic"
          :style="{ width: kineticRatio + '%' }"
          :title="`運動エネルギー K: ${kineticEnergy.toFixed(2)} J`"
        >
          <span v-if="kineticRatio > 15">K (運動)</span>
        </div>
        <div
          class="bar-potential"
          :style="{ width: potentialRatio + '%' }"
          :title="`位置エネルギー U: ${potentialEnergy.toFixed(2)} J`"
        >
          <span v-if="potentialRatio > 15">U (位置)</span>
        </div>
      </div>
      <div class="energy-legend">
        <span class="legend-item"><span class="dot kinetic"></span> 運動エネルギー <i>K</i> = <span class="frac"><span class="num">1</span><span class="den">2</span></span><i>m</i><i>v</i>²: <strong>{{ kineticEnergy.toFixed(2) }} J</strong></span>
        <span class="legend-item"><span class="dot potential"></span> 位置エネルギー <i>U</i> = <i>mgh</i>: <strong>{{ potentialEnergy.toFixed(2) }} J</strong></span>
      </div>
    </div>

    <!-- 理論値データ表示カード -->
    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">理論周期 <i>T</i><sub>0</sub>（微小振幅）</div>
        <div class="stat-value" style="color:#c084fc">{{ theoreticalPeriod.toFixed(3) }} <span class="unit">s</span></div>
        <div class="stat-formula"><i>T</i><sub>0</sub> = 2π√(<span class="frac"><span class="num"><i>L</i></span><span class="den"><i>g</i></span></span>)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在角度 <i>θ</i></div>
        <div class="stat-value" style="color:#f59e0b">{{ currentAngleDeg.toFixed(1) }} <span class="unit">°</span></div>
        <div class="stat-formula">角速度 <i>ω</i> = {{ omegaDisplay.toFixed(2) }} rad/s</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在速度 <i>v</i></div>
        <div class="stat-value" style="color:#10b981">{{ currentSpeed.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula"><i>v</i> = <i>L</i><span class="frac"><span class="num">d<i>θ</i></span><span class="den">d<i>t</i></span></span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjs = null

// 物理パラメータ
const length = ref(1.5) // m
const initialAngleDeg = ref(35) // deg
const mass = ref(1.0) // kg
const g = ref(9.8) // m/s^2
const airResistance = ref(false)
const showVectors = ref(true)
const showForceComponents = ref(true)
const showTrail = ref(true)

const isPlaying = ref(true)
const timeScale = ref(0.5)
const activeCam = ref('3d')

let theta = (initialAngleDeg.value * Math.PI) / 180
let omega = 0
const currentAngleDeg = ref(initialAngleDeg.value)
const currentSpeed = ref(0)
const omegaDisplay = ref(0)

// 計算値
const theoreticalPeriod = computed(() => {
  return 2 * Math.PI * Math.sqrt(length.value / g.value)
})

const potentialEnergy = computed(() => {
  const thRad = (currentAngleDeg.value * Math.PI) / 180
  const h = length.value * (1 - Math.cos(thRad))
  return mass.value * g.value * h
})

const kineticEnergy = computed(() => {
  const v = length.value * omegaDisplay.value
  return 0.5 * mass.value * v * v
})

const totalEnergy = computed(() => {
  return kineticEnergy.value + potentialEnergy.value
})

const kineticRatio = computed(() => {
  const tot = totalEnergy.value
  if (tot <= 0.0001) return 0
  return Math.min(100, Math.max(0, (kineticEnergy.value / tot) * 100))
})

const potentialRatio = computed(() => {
  const tot = totalEnergy.value
  if (tot <= 0.0001) return 100
  return Math.min(100, Math.max(0, (potentialEnergy.value / tot) * 100))
})

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 410
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.60, Math.max(1.32, 1.40 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.4, 44.0 * ms], target: [0, 0.3, 0], fov: 14 }
  }
  if (preset === 'side') {
    return { pos: [10.5 * ms, 2.4 * ms, 6.2 * ms], target: [0, 0.3, 0], fov: 40 }
  }
  return { pos: [6.8 * ms, 3.8 * ms, 11.4 * ms], target: [0, 0.3, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

function rk4Step(dt) {
  const L = length.value
  const grav = g.value
  const damping = airResistance.value ? 0.08 : 0.0

  const f1_theta = (w) => w
  const f1_omega = (th, w) => -(grav / L) * Math.sin(th) - damping * w

  const k1_th = f1_theta(omega)
  const k1_w = f1_omega(theta, omega)

  const th_half1 = theta + 0.5 * dt * k1_th
  const w_half1 = omega + 0.5 * dt * k1_w
  const k2_th = f1_theta(w_half1)
  const k2_w = f1_omega(th_half1, w_half1)

  const th_half2 = theta + 0.5 * dt * k2_th
  const w_half2 = omega + 0.5 * dt * k2_w
  const k3_th = f1_theta(w_half2)
  const k3_w = f1_omega(th_half2, w_half2)

  const th_full = theta + dt * k3_th
  const w_full = omega + dt * k3_w
  const k4_th = f1_theta(w_full)
  const k4_w = f1_omega(th_full, w_full)

  theta += (dt / 6) * (k1_th + 2 * k2_th + 2 * k3_th + k4_th)
  omega += (dt / 6) * (k1_w + 2 * k2_w + 2 * k3_w + k4_w)
}

function setGravity(newG) {
  g.value = newG
  updateFrame()
}

function onParamChange() {
  updateFrame()
}

function onAngleSliderChange() {
  theta = (initialAngleDeg.value * Math.PI) / 180
  omega = 0
  updateFrame()
}

function resetSim() {
  theta = (initialAngleDeg.value * Math.PI) / 180
  omega = 0
  updateFrame()
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stepSim(dtSec = 0.04) {
  const subSteps = 8
  const subDt = dtSec / subSteps
  for (let i = 0; i < subSteps; i++) {
    rk4Step(subDt)
  }
  updateFrame()
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
      if (isPlaying.value) {
        const subSteps = 8
        const subDt = (dt * timeScale.value) / subSteps
        for (let i = 0; i < subSteps; i++) {
          rk4Step(subDt)
        }
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

  // 床面グリッド (L = 2.5m でも十分ゆとりがある高さ -3.35)
  const grid = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b)
  grid.position.y = -3.35
  scene.add(grid)

  // 3D 振り子スタンド架構 (pivot at (0, 2.7, 0) ・ 視認性の高いスレート色)
  const pivotPos = new THREE.Vector3(0, 2.7, 0)
  const standMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.62, roughness: 0.28 })

  const topBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16), standMat)
  topBeam.rotation.x = Math.PI / 2
  topBeam.position.set(0, 2.7, 0)
  scene.add(topBeam)

  for (const zSide of [-1.5, 1.5]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6.05, 16), standMat)
    leg.position.set(0, -0.32, zSide)
    scene.add(leg)
  }

  const baseGeo = new THREE.BoxGeometry(1.4, 0.14, 3.4)
  const basePlate = new THREE.Mesh(
    baseGeo,
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.35 })
  )
  basePlate.position.set(0, -3.28, 0)
  scene.add(basePlate)
  const baseEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(baseGeo),
    new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.45 })
  )
  baseEdges.position.copy(basePlate.position)
  scene.add(baseEdges)

  const pivotHub = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
  )
  pivotHub.position.copy(pivotPos)
  scene.add(pivotHub)

  // 鉛直基準破線
  const vertLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 2.7, 0),
    new THREE.Vector3(0, -2.9, 0)
  ])
  const vertLine = new THREE.Line(
    vertLineGeo,
    new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.18, gapSize: 0.12 })
  )
  vertLine.computeLineDistances()
  scene.add(vertLine)

  // 振れ角 θ の半透明扇形ガイド (バッファ事前確保)
  const thetaSegs = 14
  const thetaSectorGeo = new THREE.BufferGeometry()
  thetaSectorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(thetaSegs * 9), 3))
  const thetaSectorMesh = new THREE.Mesh(
    thetaSectorGeo,
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  )
  scene.add(thetaSectorMesh)

  // 3D ロッド（糸）
  const rodGeo = new THREE.CylinderGeometry(0.032, 0.032, 1, 12)
  rodGeo.translate(0, -0.5, 0)
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.55, roughness: 0.28 })
  const rodMesh = new THREE.Mesh(rodGeo, rodMat)
  rodMesh.position.copy(pivotPos)
  scene.add(rodMesh)

  // 3D おもり球 (発光パープル)
  const bobGeo = new THREE.SphereGeometry(0.35, 32, 32)
  const bobMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.28
  })
  const bobMesh = new THREE.Mesh(bobGeo, bobMat)
  scene.add(bobMesh)

  // 円弧ガイド軌跡ライン (-θ0 .. +θ0)
  const arcPtsCount = 65
  const arcGeo = new THREE.BufferGeometry()
  arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arcPtsCount * 3), 3))
  const arcMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.6 })
  const arcLine = new THREE.Line(arcGeo, arcMat)
  scene.add(arcLine)

  // 3D ベクトル矢印
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowT = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowFtan = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowFrad = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.36 })
  scene.add(arrowV, arrowT, arrowFtan, arrowFrad)

  // 3D ラベル (相互に重ならない大きさ・レーン設定)
  const labelV = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.46 })
  const labelT = createTextSprite('T (張力)', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.44 })
  const labelFtan = createTextSprite('-mg sinθ (復元力)', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.44 })
  const labelFrad = createTextSprite('mg cosθ', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.44 })
  const labelTheta = createTextSprite('θ = 30.0°', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.42 })
  scene.add(labelV, labelT, labelFtan, labelFrad, labelTheta)

  sceneObjs = {
    pivotPos,
    thetaSectorGeo,
    thetaSectorMesh,
    thetaSegs,
    rodMesh,
    bobMesh,
    arcGeo,
    arcLine,
    arcPtsCount,
    arrowV,
    arrowT,
    arrowFtan,
    arrowFrad,
    labelV,
    labelT,
    labelFtan,
    labelFrad,
    labelTheta
  }

  updateFrame()
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    pivotPos,
    thetaSectorGeo,
    thetaSectorMesh,
    thetaSegs,
    rodMesh,
    bobMesh,
    arcGeo,
    arcLine,
    arcPtsCount,
    arrowV,
    arrowT,
    arrowFtan,
    arrowFrad,
    labelV,
    labelT,
    labelFtan,
    labelFrad,
    labelTheta
  } = sceneObjs

  currentAngleDeg.value = (theta * 180) / Math.PI
  currentSpeed.value = Math.abs(length.value * omega)
  omegaDisplay.value = omega

  // 3D スケール上の糸の長さ (L=2.5m でも床 -3.35 に十分収まるよう適応調整)
  const visL = Math.min(3.85, length.value * 1.58)

  const bx = pivotPos.x + visL * Math.sin(theta)
  const by = pivotPos.y - visL * Math.cos(theta)
  const bobPos = new THREE.Vector3(bx, by, 0)

  bobMesh.position.copy(bobPos)
  const s = 0.85 + mass.value * 0.08
  bobMesh.scale.set(s, s, s)

  rodMesh.scale.set(1, visL, 1)
  rodMesh.rotation.z = theta

  // 振れ角 θ 扇形更新
  if (Math.abs(theta) > 0.02) {
    thetaSectorMesh.visible = true
    const secR = Math.min(1.15, visL * 0.45)
    const secArr = thetaSectorGeo.getAttribute('position').array
    for (let i = 0; i < thetaSegs; i++) {
      const a0 = (i / thetaSegs) * theta
      const a1 = ((i + 1) / thetaSegs) * theta
      const base = i * 9
      secArr[base] = pivotPos.x
      secArr[base + 1] = pivotPos.y
      secArr[base + 2] = 0
      secArr[base + 3] = pivotPos.x + secR * Math.sin(a0)
      secArr[base + 4] = pivotPos.y - secR * Math.cos(a0)
      secArr[base + 5] = 0
      secArr[base + 6] = pivotPos.x + secR * Math.sin(a1)
      secArr[base + 7] = pivotPos.y - secR * Math.cos(a1)
      secArr[base + 8] = 0
    }
    thetaSectorGeo.getAttribute('position').needsUpdate = true
  } else {
    thetaSectorMesh.visible = false
  }

  // 角度ラベル更新 (支点すぐ横・上部に配置して T と明確に分離)
  const thSign = theta >= 0 ? 1 : -1
  labelTheta.updateText(`θ = ${currentAngleDeg.value.toFixed(1)}°`, '#fde68a', '#f59e0b')
  labelTheta.position.set(thSign * 0.95 + Math.sin(theta * 0.5) * 0.45, pivotPos.y - 0.32, 0.45)

  // 円弧軌跡の更新
  if (showTrail.value) {
    arcLine.visible = true
    const maxTh = (initialAngleDeg.value * Math.PI) / 180
    const arr = arcGeo.getAttribute('position').array
    for (let i = 0; i < arcPtsCount; i++) {
      const u = (i / (arcPtsCount - 1)) * 2 - 1
      const a = u * maxTh
      arr[i * 3] = pivotPos.x + visL * Math.sin(a)
      arr[i * 3 + 1] = pivotPos.y - visL * Math.cos(a)
      arr[i * 3 + 2] = 0
    }
    arcGeo.getAttribute('position').needsUpdate = true
  } else {
    arcLine.visible = false
  }

  // 速度ベクトル v (接線方向、ラベルは矢印直上の低い位置 +0.20Y に置き上側の張力 T と完全分離)
  const v = length.value * omega
  if (showVectors.value && Math.abs(v) > 0.08) {
    const vDir = new THREE.Vector3(Math.cos(theta) * Math.sign(v), Math.sin(theta) * Math.sign(v), 0).normalize()
    const vLen = Math.min(2.1, Math.max(0.55, Math.abs(v) * 0.42))
    const vOrigin = bobPos.clone().add(new THREE.Vector3(0, 0, 0.34))
    arrowV.setVector(vOrigin, vDir, vLen)
    labelV.visible = true
    labelV.updateText(`v = ${Math.abs(v).toFixed(2)} m/s`, '#6ee7b7', '#10b981')
    labelV.position.copy(vOrigin).addScaledVector(vDir, vLen + 0.40).add(new THREE.Vector3(0, 0.20, 0.35))
  } else {
    arrowV.visible = false
    labelV.visible = false
  }

  // 張力 T と 重力分解 (-mg sinθ, mg cosθ)
  if (showForceComponents.value) {
    const radialOut = new THREE.Vector3(Math.sin(theta), -Math.cos(theta), 0).normalize()
    const radialIn = radialOut.clone().negate()
    const signSide = Math.sign(theta || 1)
    const tanRestore = new THREE.Vector3(-Math.cos(theta) * signSide, -Math.sin(theta) * signSide, 0).normalize()

    const fScale = 0.075
    // 張力 T = mg cosθ + m v^2 / L (糸の中〜上部寄りかつ左外側に配置し、おもり近くの v と支点の θ の両方と分離)
    const Tval = Math.max(0.2, mass.value * g.value * Math.cos(theta) + mass.value * length.value * omega * omega)
    const tLen = Math.min(2.05, Math.max(0.65, Tval * fScale))
    arrowT.setVector(bobPos, radialIn, tLen)
    labelT.visible = true
    labelT.position
      .copy(bobPos)
      .addScaledVector(radialIn, Math.min(visL * 0.56, Math.max(1.12, tLen * 0.88)))
      .add(new THREE.Vector3(-signSide * 1.05, 0.12, -0.35))

    // 動径重力成分 mg cosθ (矢印先端のさらに下外側に配置)
    const mgCos = Math.max(0.1, mass.value * g.value * Math.cos(theta))
    const rLen = Math.min(1.65, Math.max(0.55, mgCos * fScale))
    arrowFrad.setVector(bobPos, radialOut, rLen)
    labelFrad.visible = true
    labelFrad.position.copy(bobPos).addScaledVector(radialOut, rLen + 0.55).add(new THREE.Vector3(signSide * 0.85, -0.25, -0.25))

    // 接線復元力 -mg sinθ (常に矢印先端の下側 -0.70Y へ配置し v の +0.20Y と重ならない)
    const mgSin = Math.abs(mass.value * g.value * Math.sin(theta))
    if (mgSin > 0.3 && Math.abs(theta) > 0.03) {
      const fLen = Math.min(1.9, Math.max(0.55, mgSin * fScale * 1.4))
      arrowFtan.setVector(bobPos, tanRestore, fLen)
      labelFtan.visible = true
      labelFtan.position.copy(bobPos).addScaledVector(tanRestore, fLen + 0.65).add(new THREE.Vector3(-signSide * 0.25, -0.70, 0.45))
    } else {
      arrowFtan.visible = false
      labelFtan.visible = false
    }
  } else {
    arrowT.visible = false
    arrowFtan.visible = false
    arrowFrad.visible = false
    labelT.visible = false
    labelFtan.visible = false
    labelFrad.visible = false
  }
}

watch([showVectors, showForceComponents, showTrail], () => {
  updateFrame()
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
  background: linear-gradient(145deg, #0f172a, #090d16);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  color: #f4f4f5;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.sim-title {
  font-size: 1.15rem;
  font-weight: 700;
  background: linear-gradient(90deg, #c084fc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.7);
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
  gap: 10px;
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
  background: #a855f7;
  color: #fff;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  background: #080c16;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
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
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-t { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-f { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-g { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
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
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0 1rem;
}
.control-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.control-item label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: #d4d4d8;
}
.control-item input[type='range'] {
  width: 100%;
  accent-color: #a855f7;
  cursor: pointer;
}
.preset-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}
.preset-buttons button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}
.preset-buttons button.active {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  color: #c084fc;
}
.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.btn-primary {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f4f4f5;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #a1a1aa;
  cursor: pointer;
  margin-left: 0.5rem;
}
.toggle-label input {
  accent-color: #a855f7;
}
.energy-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
}
.energy-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #e4e4e7;
}
.total-energy-val {
  color: #38bdf8;
}
.energy-bar-wrap {
  display: flex;
  height: 22px;
  background: #18181b;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #27272a;
  margin-bottom: 0.6rem;
}
.bar-kinetic {
  background: linear-gradient(90deg, #10b981, #34d399);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #064e3b;
}
.bar-potential {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #451a03;
}
.energy-legend {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #a1a1aa;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot.kinetic {
  background: #10b981;
}
.dot.potential {
  background: #f59e0b;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
}
.stat-card.highlight {
  border-color: rgba(168, 85, 247, 0.4);
  background: rgba(168, 85, 247, 0.07);
}
.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}
.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #f4f4f5;
}
.stat-value .unit {
  font-size: 0.85rem;
  color: #a1a1aa;
  font-weight: 400;
}
.stat-formula {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.3rem;
}
</style>
