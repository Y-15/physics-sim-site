<template>
  <div class="inertia-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>🚀 3D 慣性力・見かけの重力・遠心力シミュレーター</h3>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="badge" style="color:#34d399;border-color:rgba(16,185,129,0.35)">Three.js 3D Interactive</span>
          <span class="badge">Inertial Forces &amp; Frames</span>
        </div>
      </div>
      <p class="desc">
        「静止系（外からの観察）」と「非慣性系（乗っている人からの観察）」の視点を切り替え、見かけの力 <i>f</i> = −<i>ma</i> の本質やエレベーター内の無重量状態、回転円盤上の遠心力を3D空間で視覚的に体感できます。
      </p>
    </div>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'cart' }" @click="switchMode('cart')">
        ① 加速する台車とつり革 (振り子)
      </button>
      <button :class="{ active: mode === 'elevator' }" @click="switchMode('elevator')">
        ② エレベーターと体重計 (見かけの重力・無重量)
      </button>
      <button :class="{ active: mode === 'centrifugal' }" @click="switchMode('centrifugal')">
        ③ 回転円盤と遠心力 (滑り出し)
      </button>
    </div>

    <!-- 視点切り替えトグル (台車・エレベーター・円盤共通) -->
    <div class="frame-toggle-row">
      <span class="frame-label">観察者の座標系：</span>
      <div class="toggle-buttons">
        <button
          :class="{ active: observerFrame === 'inside' }"
          @click="observerFrame = 'inside'"
        >
          👤 内部の観測者（非慣性系：慣性力 −ma を受けてつり合う）
        </button>
        <button
          :class="{ active: observerFrame === 'outside' }"
          @click="observerFrame = 'outside'"
        >
          🌍 地上の観測者（慣性系：合力によって加速度 <i>a</i> で加速中）
        </button>
      </div>
    </div>

    <!-- 3D カメラプリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面視点（力のつり合い）
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          ⭕ 真上視点
        </button>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-t"></i>{{ mode === 'cart' ? '張力 T' : (mode === 'elevator' ? '垂直抗力 N' : '摩擦力 f') }}</span>
          <span class="legend-item"><i class="dot-g"></i>重力 <b>mg</b></span>
          <span v-if="observerFrame === 'inside'" class="legend-item"><i class="dot-f"></i>{{ mode === 'centrifugal' ? '遠心力 mrω²' : '慣性力 −ma' }}</span>
          <span v-else class="legend-item"><i class="dot-a"></i>合力 <b>ma</b> (加速度方向)</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <!-- モード1: 台車 -->
      <div v-if="mode === 'cart'" class="controls-grid">
        <div class="control-group">
          <label><span>台車の加速度 <i>a</i>:</span> <strong>{{ fmt(cartA, 1) }} <i>m</i>/<i>s</i>²</strong></label>
          <input type="range" v-model.number="cartA" min="-9.8" max="9.8" step="0.2" />
        </div>
        <div class="control-group">
          <label><span>おもりの質量 <i>m</i>:</span> <strong>{{ cartM }} kg</strong></label>
          <input type="range" v-model.number="cartM" min="0.5" max="5.0" step="0.5" />
        </div>
        <div class="control-group">
          <label><span>重力加速度 <i>g</i>:</span> <strong>9.8 <i>m</i>/<i>s</i>²</strong></label>
          <span class="sub-info">傾き角 tanθ = <i>a</i>/<i>g</i></span>
        </div>
      </div>

      <!-- モード2: エレベーター -->
      <div v-if="mode === 'elevator'" class="controls-grid">
        <div class="control-group">
          <label><span>鉛直加速度 <i>a</i> (上向き正):</span> <strong>{{ fmt(elevA, 1) }} <i>m</i>/<i>s</i>²</strong></label>
          <input type="range" v-model.number="elevA" min="-9.8" max="9.8" step="0.2" />
        </div>
        <div class="control-group">
          <label><span>人の質量 <i>m</i>:</span> <strong>{{ elevM }} kg</strong></label>
          <input type="range" v-model.number="elevM" min="30" max="100" step="5" />
        </div>
        <div class="preset-buttons">
          <button @click="elevA = 4.9">上昇加速 (+4.9)</button>
          <button @click="elevA = 0">等速運動 (0)</button>
          <button @click="elevA = -4.9">減速/下降 (-4.9)</button>
          <button class="danger-btn" @click="elevA = -9.8">⚠️ 自由落下 (-9.8: 無重量)</button>
        </div>
      </div>

      <!-- モード3: 遠心力 -->
      <div v-if="mode === 'centrifugal'" class="controls-grid">
        <div class="control-group">
          <label><span>回転角速度 ω:</span> <strong>{{ fmt(rotOmega, 2) }} rad/s</strong></label>
          <input type="range" v-model.number="rotOmega" min="0" max="5.0" step="0.1" />
        </div>
        <div class="control-group">
          <label><span>回転半径 <i>r</i>:</span> <strong>{{ fmt(rotR, 2) }} m</strong></label>
          <input type="range" v-model.number="rotR" min="0.5" max="3.0" step="0.1" />
        </div>
        <div class="control-group">
          <label><span>静止摩擦係数 μ:</span> <strong>{{ rotMu }}</strong></label>
          <input type="range" v-model.number="rotMu" min="0.1" max="0.8" step="0.05" />
        </div>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <template v-if="mode === 'cart'">
        <div class="stat-card">
          <span class="label">つり革の傾き角 θ</span>
          <span class="val highlight">{{ fmt(cartThetaDeg, 1) }}°</span>
        </div>
        <div class="stat-card">
          <span class="label">慣性力 <i>f</i> = <i>m</i>|<i>a</i>|</span>
          <span class="val highlight-alt">{{ fmt(cartInertiaForce, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">糸の張力 <i>T</i> = <i>m</i>√(<i>g</i>²+<i>a</i>²)</span>
          <span class="val">{{ fmt(cartTension, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">見かけの重力加速度 <i>g</i>'</span>
          <span class="val">{{ fmt(cartGprime, 2) }} <i>m</i>/<i>s</i>²</span>
        </div>
      </template>

      <template v-if="mode === 'elevator'">
        <div class="stat-card">
          <span class="label">体重計の指示値 (垂直抗力 <i>N</i>)</span>
          <span class="val" :class="{ 'zero-g': elevN <= 0.1 }">
            {{ fmt(elevN, 1) }} N ({{ fmt(elevApparentKg, 1) }} kg重)
          </span>
        </div>
        <div class="stat-card">
          <span class="label">見かけの重力加速度 <i>g</i>' = <i>g</i> + <i>a</i></span>
          <span class="val highlight">{{ fmt(elevGprime, 2) }} m/s²</span>
        </div>
        <div class="stat-card">
          <span class="label">慣性力 <i>f</i> = −<i>ma</i></span>
          <span class="val highlight-alt">{{ fmt(-elevM * elevA, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">状態</span>
          <span class="val" :class="{ 'zero-g': elevN <= 0.1 }">
            {{ elevStateText }}
          </span>
        </div>
      </template>

      <template v-if="mode === 'centrifugal'">
        <div class="stat-card">
          <span class="label">遠心力 <i>F</i><sub>cf</sub> = <i>mrω</i>²</span>
          <span class="val highlight">{{ fmt(rotFcf, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">最大静止摩擦力 <i>f</i><sub>max</sub> = <i>μmg</i></span>
          <span class="val">{{ fmt(rotFmax, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">滑り出し判定</span>
          <span class="val" :class="rotSlipping ? 'slip-danger' : 'slip-ok'">
            {{ rotSlipping ? '⚠️ 外側へ滑り出し！' : '✓ 静止（つり合い）' }}
          </span>
        </div>
        <div class="stat-card">
          <span class="label">限界角速度 <i>ω</i><sub>0</sub> = √(<i>μg</i>/<i>r</i>)</span>
          <span class="val">{{ fmt(rotOmegaLimit, 2) }} rad/s</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'
import { fmt } from './simUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjs = null

const mode = ref('cart')
const observerFrame = ref('inside')
const activeCam = ref('3d')

const g = 9.8

// モード1: 台車
const cartA = ref(3.5)
const cartM = ref(2.0)
let trackScroll = 0

// モード2: エレベーター
const elevA = ref(2.5)
const elevM = ref(60)
let elevScroll = 0

// モード3: 遠心力
const rotOmega = ref(2.0)
const rotR = ref(1.5)
const rotMu = ref(0.4)
const rotM = ref(1.0)
let rotAngle = 0
let rotSlipDist = 0

// 計算: 台車
const cartTheta = computed(() => Math.atan(cartA.value / g))
const cartThetaDeg = computed(() => (cartTheta.value * 180) / Math.PI)
const cartInertiaForce = computed(() => cartM.value * Math.abs(cartA.value))
const cartTension = computed(() => cartM.value * Math.hypot(g, cartA.value))
const cartGprime = computed(() => Math.hypot(g, cartA.value))

// 計算: エレベーター
const elevGprime = computed(() => g + elevA.value)
const elevN = computed(() => Math.max(0, elevM.value * (g + elevA.value)))
const elevApparentKg = computed(() => elevN.value / g)
const elevStateText = computed(() => {
  if (elevN.value <= 0.01) return '無重量状態 (Free Fall)'
  if (elevA.value > 0.1) return '過重力 (体が重い)'
  if (elevA.value < -0.1) return '過小重力 (体が軽い)'
  return '通常重力 (等速/静止)'
})

// 計算: 遠心力
const rotFcf = computed(() => rotM.value * rotR.value * rotOmega.value * rotOmega.value)
const rotFmax = computed(() => rotMu.value * rotM.value * g)
const rotSlipping = computed(() => rotFcf.value > rotFmax.value)
const rotOmegaLimit = computed(() => Math.sqrt((rotMu.value * g) / rotR.value))

function switchMode(newMode) {
  mode.value = newMode
  setCameraPreset('3d')
  rebuildModeGeometry()
  updateFrame(0)
}

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
    return { pos: [0, 0.65, 44.0 * ms], target: [0, 0.55, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 48.0 * ms, 0.45], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [8.4 * ms, 5.2 * ms, 12.2 * ms], target: [0, 0.5, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

function clearGroup(group) {
  while (group.children.length > 0) {
    const c = group.children[0]
    group.remove(c)
    if (c.geometry) c.geometry.dispose()
    if (c.material) {
      if (Array.isArray(c.material)) c.material.forEach(m => m.dispose())
      else c.material.dispose()
    }
  }
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
      updateFrame(dt)
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
  const modeGroup = new THREE.Group()
  scene.add(modeGroup)

  // 共通 3D ベクトル矢印
  const arrowT = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowMg = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowFin = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.4 })
  const arrowAcc = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.36 })
  scene.add(arrowT, arrowMg, arrowFin, arrowAcc)

  const labelT = createTextSprite('T', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.54 })
  const labelMg = createTextSprite('mg', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.54 })
  const labelFin = createTextSprite('-ma', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.56 })
  const labelAcc = createTextSprite('a', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.54 })
  scene.add(labelT, labelMg, labelFin, labelAcc)

  sceneObjs = {
    modeGroup,
    arrowT,
    arrowMg,
    arrowFin,
    arrowAcc,
    labelT,
    labelMg,
    labelFin,
    labelAcc,
    dynamicRefs: {}
  }

  rebuildModeGeometry()
  updateFrame(0)
}

function rebuildModeGeometry() {
  if (!sceneObjs) return
  const { modeGroup } = sceneObjs
  clearGroup(modeGroup)
  sceneObjs.dynamicRefs = {}

  if (mode.value === 'cart') {
    buildCartScene(modeGroup)
  } else if (mode.value === 'elevator') {
    buildElevatorScene(modeGroup)
  } else {
    buildCentrifugalScene(modeGroup)
  }
}

function buildCartScene(group) {
  // 地面・レール
  const floorGrid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  floorGrid.position.y = -2.2
  group.add(floorGrid)

  // 左右の3D鋼鉄レール
  const railGeo = new THREE.BoxGeometry(16.0, 0.08, 0.14)
  const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.22 })
  for (const rz of [-1.35, 1.35]) {
    const rail = new THREE.Mesh(railGeo, railMat)
    rail.position.set(0, -2.06, rz)
    group.add(rail)
  }

  // 枕木グループ（スクロール用）
  const sleepersGroup = new THREE.Group()
  const sleeperGeo = new THREE.BoxGeometry(0.32, 0.08, 3.0)
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55 })
  for (let i = -8; i <= 8; i++) {
    const sl = new THREE.Mesh(sleeperGeo, sleeperMat)
    sl.position.set(i * 1.0, -2.14, 0)
    sleepersGroup.add(sl)
  }
  group.add(sleepersGroup)

  // 3D 車両フレーム（真上視点でも透けて見える半透明ガラス屋根＋輪郭ワイヤー＋明るい金属ピラー）
  const cartGroup = new THREE.Group()
  const floorBox = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.22, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.45, roughness: 0.35 })
  )
  floorBox.position.y = -1.5
  cartGroup.add(floorBox)

  const roofGeo = new THREE.BoxGeometry(6.2, 0.14, 2.8)
  const roofBox = new THREE.Mesh(
    roofGeo,
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.35,
      roughness: 0.2,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    })
  )
  roofBox.position.y = 2.55
  cartGroup.add(roofBox)

  const roofEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(roofGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 })
  )
  roofEdges.position.y = 2.55
  cartGroup.add(roofEdges)

  const wallGlass = new THREE.Mesh(
    new THREE.BoxGeometry(6.0, 3.9, 2.65),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.06, roughness: 0.1, depthWrite: false })
  )
  wallGlass.position.y = 0.5
  cartGroup.add(wallGlass)

  // 四隅のピラー
  const pillarGeo = new THREE.CylinderGeometry(0.065, 0.065, 4.05, 12)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.25 })
  for (const px of [-2.9, 2.9]) {
    for (const pz of [-1.25, 1.25]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat)
      p.position.set(px, 0.52, pz)
      cartGroup.add(p)
    }
  }

  // 車輪 4個
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24)
  wheelGeo.rotateX(Math.PI / 2)
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.25 })
  for (const wx of [-2.0, 2.0]) {
    for (const wz of [-1.35, 1.35]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat)
      w.position.set(wx, -1.78, wz)
      cartGroup.add(w)
    }
  }

  // 天井支点と鉛直基準破線
  const anchorPos = new THREE.Vector3(0, 2.45, 0)
  const pivotDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  )
  pivotDot.position.copy(anchorPos)
  cartGroup.add(pivotDot)

  const vertLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 2.45, 0),
    new THREE.Vector3(0, -1.2, 0)
  ])
  const vertLine = new THREE.Line(
    vertLineGeo,
    new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.18, gapSize: 0.12 })
  )
  vertLine.computeLineDistances()
  cartGroup.add(vertLine)

  // つり革のひも(3Dシリンダー)と3Dおもり球
  const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 10)
  ropeGeo.translate(0, 0.5, 0)
  const ropeMesh = new THREE.Mesh(
    ropeGeo,
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.25 })
  )
  cartGroup.add(ropeMesh)

  const bobMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.5,
      roughness: 0.2
    })
  )
  cartGroup.add(bobMesh)

  group.add(cartGroup)

  sceneObjs.dynamicRefs = {
    sleepersGroup,
    anchorPos,
    ropeMesh,
    bobMesh
  }
}

function buildElevatorScene(group) {
  // 昇降路シャフトガイド
  const railGeo = new THREE.CylinderGeometry(0.06, 0.06, 8.5, 12)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
  for (const rx of [-2.4, 2.4]) {
    const r = new THREE.Mesh(railGeo, railMat)
    r.position.set(rx, 0.2, 0)
    group.add(r)
  }

  // エレベーター昇降速度が視覚的に分かる壁目盛りバー
  const shaftTicksGroup = new THREE.Group()
  const tickGeo = new THREE.BoxGeometry(0.35, 0.07, 0.1)
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  for (let i = -4; i <= 4; i++) {
    for (const sx of [-2.65, 2.65]) {
      const t = new THREE.Mesh(tickGeo, tickMat)
      t.position.set(sx, i * 1.1, 0)
      shaftTicksGroup.add(t)
    }
  }
  group.add(shaftTicksGroup)

  // エレベーターかご
  const cabinGroup = new THREE.Group()
  const floorPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.22, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.45, roughness: 0.35 })
  )
  floorPlatform.position.y = -2.1
  cabinGroup.add(floorPlatform)

  const ceilGeo = new THREE.BoxGeometry(3.8, 0.16, 3.0)
  const ceilingPlatform = new THREE.Mesh(
    ceilGeo,
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.4,
      roughness: 0.25,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    })
  )
  ceilingPlatform.position.y = 2.4
  cabinGroup.add(ceilingPlatform)
  const ceilEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(ceilGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
  )
  ceilEdges.position.y = 2.4
  cabinGroup.add(ceilEdges)

  const glassWall = new THREE.Mesh(
    new THREE.BoxGeometry(3.75, 4.4, 2.95),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.09,
      roughness: 0.1
    })
  )
  glassWall.position.y = 0.15
  cabinGroup.add(glassWall)

  // 体重計プレート
  const scaleMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.16, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.4 })
  )
  scaleMesh.position.set(0, -1.92, 0)
  cabinGroup.add(scaleMesh)

  // 人物 3D モデル (カプセル胴体 + 頭部球体)
  const personGroup = new THREE.Group()
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 1.25, 20),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  )
  torso.position.y = 0.65
  personGroup.add(torso)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.25 })
  )
  head.position.y = 1.55
  personGroup.add(head)

  cabinGroup.add(personGroup)
  group.add(cabinGroup)

  const scaleLabel = createTextSprite('体重計: 60.0 kg重', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.54
  })
  scaleLabel.position.set(0, -2.68, 1.25)
  group.add(scaleLabel)

  sceneObjs.dynamicRefs = {
    shaftTicksGroup,
    personGroup,
    scaleLabel
  }
}

function buildCentrifugalScene(group) {
  const floorGrid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  floorGrid.position.y = -0.5
  group.add(floorGrid)

  // 回転系と静止系の違いを際立たせる外部基準柱グループ
  const outerRefGroup = new THREE.Group()
  const refMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 })
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.5, 12), refMat)
    post.position.set(4.85 * Math.cos(a), 0.25, 4.85 * Math.sin(a))
    outerRefGroup.add(post)
  }
  group.add(outerRefGroup)

  // 回転円盤グループ
  const diskGroup = new THREE.Group()
  const diskMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(4.1, 4.2, 0.24, 48),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.4,
      roughness: 0.35
    })
  )
  diskMesh.position.y = -0.12
  diskGroup.add(diskMesh)

  const diskRimGeo = new THREE.TorusGeometry(4.12, 0.04, 14, 72)
  diskRimGeo.rotateX(Math.PI / 2)
  const diskRim = new THREE.Mesh(
    diskRimGeo,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
  )
  diskRim.position.y = 0.0
  diskGroup.add(diskRim)

  // 回転が分かる放射状ライン
  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 0.04, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x475569 })
    )
    bar.rotation.y = (i * Math.PI) / 4
    bar.position.y = 0.01
    diskGroup.add(bar)
  }

  const centerPin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.6, 20),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
  )
  centerPin.position.y = 0.2
  diskGroup.add(centerPin)
  group.add(diskGroup)

  // 円盤上のブロック m
  const blockMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.45, 0.55),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.22
    })
  )
  group.add(blockMesh)

  sceneObjs.dynamicRefs = {
    outerRefGroup,
    diskGroup,
    blockMesh
  }
}

function updateFrame(dt) {
  if (!sceneObjs) return
  const {
    arrowT,
    arrowMg,
    arrowFin,
    arrowAcc,
    labelT,
    labelMg,
    labelFin,
    labelAcc,
    dynamicRefs
  } = sceneObjs

  const isInside = observerFrame.value === 'inside'

  if (mode.value === 'cart') {
    const { sleepersGroup, anchorPos, ropeMesh, bobMesh } = dynamicRefs
    if (!bobMesh) return

    const a = cartA.value
    const m = cartM.value
    const theta = cartTheta.value

    // 枕木スクロールで台車の進行を表現
    trackScroll = (trackScroll + a * dt * 0.45) % 1.0
    sleepersGroup.position.x = -trackScroll

    const ropeLen = 2.08
    const bx = anchorPos.x - ropeLen * Math.sin(theta)
    const by = anchorPos.y - ropeLen * Math.cos(theta)
    const bobPos = new THREE.Vector3(bx, by, 0)
    bobMesh.position.copy(bobPos)
    const s = 0.85 + m * 0.08
    bobMesh.scale.set(s, s, s)

    const ropeDiff = bobPos.clone().sub(anchorPos)
    const rDist = Math.max(0.01, ropeDiff.length())
    ropeMesh.position.copy(anchorPos)
    ropeMesh.scale.set(1, rDist, 1)
    ropeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ropeDiff.normalize())

    const fScale = 0.055
    // 重力 mg (床を突き抜けない長さに調整)
    const fg = m * g
    const mgLen = Math.min(1.55, Math.max(0.65, fg * fScale))
    arrowMg.setVector(bobPos, new THREE.Vector3(0, -1, 0), mgLen)
    labelMg.visible = true
    labelMg.updateText(`mg = ${fmt(fg, 1)} N`, '#fde68a', '#f59e0b')
    labelMg.position.set(bx + Math.sign(a || 1) * 0.68, by - mgLen - 0.12, 0.35)

    // 張力 T (おもり・慣性力ラベルと重ならないよう右上・奥側へ配置)
    const T = cartTension.value
    const tDir = anchorPos.clone().sub(bobPos).normalize()
    const tLen = Math.min(1.85, Math.max(0.75, T * fScale))
    arrowT.setVector(bobPos, tDir, tLen)
    labelT.visible = true
    labelT.updateText(`T = ${fmt(T, 1)} N`, '#7dd3fc', '#38bdf8')
    labelT.position.copy(bobPos).addScaledVector(tDir, tLen * 0.78).add(new THREE.Vector3(Math.sign(a || 1) * 1.15, 0.32, -0.45))

    // 台車の加速度 a (屋根の上)
    if (Math.abs(a) > 0.08) {
      const aDir = new THREE.Vector3(Math.sign(a), 0, 0)
      const aLen = Math.min(2.3, 0.6 + Math.abs(a) * 0.16)
      arrowAcc.setVector(new THREE.Vector3(0, 2.88, 0), aDir, aLen)
      labelAcc.visible = true
      labelAcc.updateText(`台車加速度 a = ${fmt(a, 1)} m/s²`, '#6ee7b7', '#10b981')
      labelAcc.position.set(Math.sign(a) * (aLen * 0.5), 3.38, 0)
    } else {
      arrowAcc.visible = false
      labelAcc.visible = false
    }

    // 慣性力 -ma または 合力 ma (矢印先端の外側へオフセットしておもりと重ならないようにする)
    const fInMag = m * Math.abs(a)
    if (fInMag > 0.15) {
      const fLen = Math.min(1.9, Math.max(0.6, fInMag * fScale))
      const dirSign = isInside ? -Math.sign(a) : Math.sign(a)
      const fDir = new THREE.Vector3(dirSign, 0, 0)
      arrowFin.setVector(bobPos, fDir, fLen)
      labelFin.visible = true
      labelFin.updateText(
        isInside ? `慣性力 -ma (${fmt(fInMag, 1)} N)` : `合力 ma (${fmt(fInMag, 1)} N)`,
        '#fda4af',
        '#f43f5e'
      )
      labelFin.position.copy(bobPos).addScaledVector(fDir, fLen + 1.05)
      labelFin.position.y += 0.25
      labelFin.position.z += 0.45
    } else {
      arrowFin.visible = false
      labelFin.visible = false
    }
  } else if (mode.value === 'elevator') {
    const { shaftTicksGroup, personGroup, scaleLabel } = dynamicRefs
    if (!personGroup) return

    const a = elevA.value
    const m = elevM.value
    const N = elevN.value

    if (shaftTicksGroup) {
      elevScroll = (elevScroll + a * dt * 0.25) % 1.1
      shaftTicksGroup.position.y = -elevScroll
    }

    // 自由落下時は人が少し浮く
    const floatY = N <= 0.1 ? 0.38 : 0
    personGroup.position.set(0, -1.8 + floatY, 0)
    const centerPerson = new THREE.Vector3(0, -0.75 + floatY, 0)

    scaleLabel.updateText(`体重計指示値: ${fmt(elevApparentKg.value, 1)} kg重 (${fmt(N, 0)} N)`, '#7dd3fc', '#38bdf8')

    // 重力 mg
    const fg = m * g
    const mgLen = 1.25
    arrowMg.setVector(new THREE.Vector3(0.24, centerPerson.y, 0.2), new THREE.Vector3(0, -1, 0), mgLen)
    labelMg.visible = true
    labelMg.updateText(`重力 mg = ${fmt(fg, 0)} N`, '#fde68a', '#f59e0b')
    labelMg.position.set(1.38, centerPerson.y - mgLen * 0.65, 0.3)

    // 垂直抗力 N
    if (N > 0.5) {
      const nLen = Math.min(2.4, Math.max(0.45, (N / fg) * 1.35))
      arrowT.setVector(new THREE.Vector3(-0.26, -1.78 + floatY, 0.2), new THREE.Vector3(0, 1, 0), nLen)
      labelT.visible = true
      labelT.updateText(`垂直抗力 N = ${fmt(N, 0)} N`, '#7dd3fc', '#38bdf8')
      labelT.position.set(-1.45, -1.65 + nLen, 0.3)
    } else {
      arrowT.visible = false
      labelT.visible = false
    }

    // 慣性力 -ma
    const fIn = -m * a
    if (isInside && Math.abs(fIn) > 1.0) {
      const fDir = new THREE.Vector3(0, Math.sign(fIn), 0)
      const fLen = Math.min(1.9, Math.max(0.5, (Math.abs(fIn) / fg) * 1.35))
      arrowFin.setVector(new THREE.Vector3(0.5, centerPerson.y + 0.15, 0.25), fDir, fLen)
      labelFin.visible = true
      labelFin.updateText(`慣性力 -ma = ${fmt(fIn, 0)} N`, '#fda4af', '#f43f5e')
      labelFin.position.set(1.42, centerPerson.y + 0.2 + Math.sign(fIn) * (fLen + 0.25), 0.35)
    } else {
      arrowFin.visible = false
      labelFin.visible = false
    }

    // かご加速度 a
    if (Math.abs(a) > 0.1) {
      const aDir = new THREE.Vector3(0, Math.sign(a), 0)
      const aLen = Math.min(1.85, 0.6 + Math.abs(a) * 0.13)
      arrowAcc.setVector(new THREE.Vector3(2.9, 0, 0), aDir, aLen)
      labelAcc.visible = true
      labelAcc.updateText(`a = ${fmt(a, 1)} m/s²`, '#6ee7b7', '#10b981')
      labelAcc.position.set(2.9, Math.sign(a) * (aLen + 0.48), 0)
    } else {
      arrowAcc.visible = false
      labelAcc.visible = false
    }
  } else {
    // モード3: 遠心力
    const { outerRefGroup, diskGroup, blockMesh } = dynamicRefs
    if (!blockMesh) return

    const omega = rotOmega.value
    const r = rotR.value
    const isSlip = rotSlipping.value

    rotAngle += omega * dt
    if (isSlip) {
      rotSlipDist = Math.min(1.6, rotSlipDist + dt * 1.1)
    } else {
      rotSlipDist = 0
    }

    const visR = Math.min(3.55, r * 1.08 + rotSlipDist)
    const curAng = isInside ? 0 : rotAngle
    diskGroup.rotation.y = isInside ? 0 : rotAngle
    if (outerRefGroup) {
      outerRefGroup.rotation.y = isInside ? -rotAngle : 0
    }

    const bx = visR * Math.cos(curAng)
    const bz = -visR * Math.sin(curAng)
    const bPos = new THREE.Vector3(bx, 0.23, bz)
    blockMesh.position.copy(bPos)
    blockMesh.rotation.y = curAng
    blockMesh.material.color.setHex(isSlip ? 0xef4444 : 0xfbbf24)

    arrowMg.visible = false
    labelMg.visible = false
    arrowAcc.visible = false
    labelAcc.visible = false

    const outDir = new THREE.Vector3(Math.cos(curAng), 0, -Math.sin(curAng)).normalize()
    const inDir = outDir.clone().negate()

    const fStatic = Math.min(rotFcf.value, rotFmax.value)
    const fInLen = Math.min(2.2, Math.max(0.55, fStatic * 0.22))
    arrowT.setVector(bPos, inDir, fInLen)
    labelT.visible = true
    labelT.updateText(
      isInside ? `摩擦力 f = ${fmt(fStatic, 1)} N` : `向心力 (摩擦力) ${fmt(fStatic, 1)} N`,
      '#7dd3fc',
      '#38bdf8'
    )
    labelT.position.copy(bPos).addScaledVector(inDir, fInLen * 0.65).add(new THREE.Vector3(0, 0.72, 0))

    if (isInside && rotFcf.value > 0.05) {
      const fOutLen = Math.min(2.3, Math.max(0.55, rotFcf.value * 0.22))
      arrowFin.setVector(bPos, outDir, fOutLen)
      labelFin.visible = true
      labelFin.updateText(`遠心力 mrω² = ${fmt(rotFcf.value, 1)} N`, '#fda4af', '#f43f5e')
      labelFin.position.copy(bPos).addScaledVector(outDir, fOutLen + 0.45).add(new THREE.Vector3(0, 0.35, 0))
    } else {
      arrowFin.visible = false
      labelFin.visible = false
    }
  }
}

watch([cartA, cartM, elevA, elevM, rotOmega, rotR, rotMu, observerFrame], () => {
  updateFrame(0)
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
.inertia-sim {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
  margin: 1.5rem 0;
  color: #f4f4f5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}
.sim-header {
  margin-bottom: 12px;
}
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fafafa;
}
.badge {
  background: #1e293b;
  border: 1px solid #334155;
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: monospace;
}
.desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 6px 0 0 0;
  line-height: 1.5;
}
.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.mode-tabs button {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mode-tabs button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}
.frame-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.frame-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e4e4e7;
}
.toggle-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.toggle-buttons button {
  background: #0f172a;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.8rem;
  cursor: pointer;
}
.toggle-buttons button.active {
  background: #f59e0b;
  border-color: #fbbf24;
  color: #000000;
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
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  background: #080c16;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
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
.dot-t { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-g { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-f { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-a { background: #10b981; box-shadow: 0 0 6px #10b981; }
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
.controls-panel {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.control-group label {
  font-size: 0.8rem;
  color: #d4d4d8;
  display: flex;
  justify-content: space-between;
}
.control-group strong {
  color: #38bdf8;
}
.sub-info {
  font-size: 0.75rem;
  color: #94a3b8;
}
.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
}
.preset-buttons {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.preset-buttons button {
  background: #334155;
  color: #f4f4f5;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
}
.preset-buttons button.danger-btn {
  background: #991b1b;
  border-color: #ef4444;
  color: #fee2e2;
}
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}
.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
}
.stat-card .val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fafafa;
  font-family: monospace;
}
.stat-card .val.highlight {
  color: #38bdf8;
}
.stat-card .val.highlight-alt {
  color: #f59e0b;
}
.stat-card .val.zero-g,
.stat-card .val.slip-danger {
  color: #ef4444;
}
.stat-card .val.slip-ok {
  color: #34d399;
}
</style>
