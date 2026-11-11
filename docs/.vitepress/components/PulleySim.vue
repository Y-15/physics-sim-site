<template>
  <div class="lab" style="--ac:#6366f1;--ac2:#ec4899">
    <div class="lab-head">
      <span class="lab-title">⚙️ 3D 運動の法則・連結物体と滑車（アトウッドの器械）実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ configMode === 'atwood' ? '鉛直アトウッド器械' : '斜面＋吊り下げ連結' }}</span>
      </div>
    </div>

    <!-- モード切替タブ -->
    <div class="mode-tabs-bar">
      <button
        class="lab-btn"
        :class="{ primary: configMode === 'atwood' }"
        @click="switchMode('atwood')"
      >
        ⚖️ 鉛直アトウッドの器械 (2物体吊り下げ)
      </button>
      <button
        class="lab-btn"
        :class="{ primary: configMode === 'incline' }"
        @click="switchMode('incline')"
      >
        📐 斜面上の物体 ＋ 吊り下げ物体
      </button>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="lab-chip"
          :class="{ on: activeCam === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🎥 3D 俯瞰視点
        </button>
        <button
          class="lab-chip"
          :class="{ on: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面視点
        </button>
        <button
          class="lab-chip"
          :class="{ on: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点
        </button>
      </div>
      <div class="preset-group">
        <button
          class="lab-chip"
          :class="{ on: showVectors }"
          @click="showVectors = !showVectors"
        >
          {{ showVectors ? '🏹 3Dベクトル: ON' : '🏹 3Dベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生コントロールバー -->
    <div class="playback-bar">
      <button
        class="lab-btn primary"
        @click="toggleRun"
        style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;"
      >
        {{ running ? '⏸️ 一時停止' : (Math.abs(posOffset) >= maxLimit - 0.01 ? '🔄 最初から再生' : '▶️ 運動開始') }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.3 }" @click="timeScale = 0.3">🐢 0.3x (スロー)</button>
          <button :class="{ active: timeScale === 0.6 }" @click="timeScale = 0.6">🎯 0.6x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
        </div>
      </div>
      <button
        class="lab-btn"
        @click="stepSim(0.04)"
        style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;"
      >
        ⏭ コマ送り (+0.04s)
      </button>
      <button
        class="lab-btn"
        @click="reset"
        style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;"
      >
        🔄 初期位置にリセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-g"></i>重力 <b>Mg / mg</b></span>
        <span class="legend-item"><i class="dot-t"></i>張力 <b>T</b></span>
        <span class="legend-item"><i class="dot-a"></i>加速度 <b>a</b></span>
        <span v-if="configMode === 'incline' && muK > 0" class="legend-item"><i class="dot-fr"></i>動摩擦力 <b>f'</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- パラメータ操作パネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label><span>物体 A の質量 M:</span> <strong>{{ massA.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="massA" min="1.0" max="8.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label><span>物体 B の質量 m:</span> <strong>{{ massB.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="massB" min="1.0" max="8.0" step="0.5" />
      </div>

      <div v-if="configMode === 'incline'" class="lab-ctrl">
        <label><span>斜面の傾斜角 θ:</span> <strong>{{ inclineDeg }}°</strong></label>
        <input type="range" v-model.number="inclineDeg" min="15" max="60" step="5" />
      </div>

      <div v-if="configMode === 'incline'" class="lab-ctrl">
        <label><span>斜面の動摩擦係数 μₖ:</span> <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.0" max="0.4" step="0.05" />
      </div>

      <div class="lab-ctrl">
        <label><span>クイックプリセット:</span></label>
        <div class="lab-row">
          <button
            class="lab-chip"
            v-if="configMode === 'atwood'"
            :class="{ on: massA === massB }"
            @click="massA = 3.0; massB = 3.0; reset()"
          >
            つり合い (M = m)
          </button>
          <button
            class="lab-chip"
            v-if="configMode === 'atwood'"
            :class="{ on: massA > massB }"
            @click="massA = 5.0; massB = 2.0; reset()"
          >
            Aが加速下降 (M > m)
          </button>
          <button
            class="lab-chip"
            v-if="configMode === 'atwood'"
            :class="{ on: massA < massB }"
            @click="massA = 2.0; massB = 5.0; reset()"
          >
            Bが加速下降 (M < m)
          </button>
          <button
            class="lab-chip"
            v-if="configMode === 'incline'"
            @click="massA = 4.0; massB = 3.0; inclineDeg = 30; muK = 0.1; reset()"
          >
            Bが引き下げ下降
          </button>
          <button
            class="lab-chip"
            v-if="configMode === 'incline'"
            @click="massA = 6.0; massB = 1.5; inclineDeg = 45; muK = 0.05; reset()"
          >
            Aが斜面を滑降
          </button>
        </div>
      </div>
    </div>

    <!-- 統計モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">生じる加速度 a</div>
        <div class="v" style="color:#f43f5e">{{ Math.abs(curAcc).toFixed(2) }} <small>m/s²</small></div>
        <div class="f" v-if="configMode === 'atwood'">
          a = (M − m) / (M + m) · g
        </div>
        <div class="f" v-else>
          a = (mg − Mg sinθ − f') / (M + m)
        </div>
      </div>

      <div class="lab-stat">
        <div class="k">糸の張力 T</div>
        <div class="v" style="color:#38bdf8">{{ curTension.toFixed(1) }} <small>N</small></div>
        <div class="f" v-if="configMode === 'atwood'">
          T = 2Mm / (M + m) · g
        </div>
        <div class="f" v-else>
          T = m(g − a)
        </div>
      </div>

      <div class="lab-stat">
        <div class="k">現在の速さ v</div>
        <div class="v" style="color:#10b981">{{ Math.abs(curSpeed).toFixed(2) }} <small>m/s</small></div>
        <div class="f">v = at</div>
      </div>

      <div class="lab-stat">
        <div class="k">運動の向き</div>
        <div class="v" style="color:#f59e0b;font-size:0.95rem">{{ motionDirectionText }}</div>
        <div class="f">糸の全長は常に一定保存！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const g = 9.8
const configMode = ref('atwood') // 'atwood' | 'incline'
const activeCam = ref('3d')
const showVectors = ref(true)

const massA = ref(4.0) // kg
const massB = ref(2.0) // kg
const inclineDeg = ref(30) // deg
const muK = ref(0.1) // 動摩擦係数

const running = ref(false)
const timeScale = ref(0.6)
const posOffset = ref(0) // m (atwood: A下降正 / incline: B下降正)
const curSpeed = ref(0) // m/s

const threeContainer = ref(null)
let threeCtx = null
let sceneObjs = null
let lastAspect = 1.6

const maxLimit = computed(() => (configMode.value === 'atwood' ? 0.9 : 0.95))

// 物理計算
const curAcc = computed(() => {
  const M = massA.value
  const m = massB.value

  if (configMode.value === 'atwood') {
    return ((M - m) / (M + m)) * g
  }

  const rad = (inclineDeg.value * Math.PI) / 180
  const gravAlong = M * g * Math.sin(rad)
  const normN = M * g * Math.cos(rad)
  const fFric = muK.value * normN

  const netDownB = m * g - gravAlong - fFric
  if (netDownB > 0) {
    return netDownB / (M + m)
  }

  const netDownA = gravAlong - m * g - fFric
  if (netDownA > 0) {
    return -netDownA / (M + m)
  }

  return 0
})

const curTension = computed(() => {
  const M = massA.value
  const m = massB.value
  const a = curAcc.value

  if (configMode.value === 'atwood') {
    return (2 * M * m * g) / (M + m)
  }

  return Math.max(0, m * (g - a))
})

const motionDirectionText = computed(() => {
  if (configMode.value === 'atwood') {
    if (massA.value > massB.value) return 'Aが下降、Bが上昇'
    if (massA.value < massB.value) return 'Bが下降、Aが上昇'
    return '完全につり合い静止'
  }
  if (curAcc.value > 0.05) return 'Bが下降（Aが斜面を登る）'
  if (curAcc.value < -0.05) return 'Aが滑降（Bが吊り上がる）'
  return '摩擦力により静止（つり合い）'
})

function switchMode(mode) {
  configMode.value = mode
  reset()
  setCameraPreset(activeCam.value)
}

function reset() {
  running.value = false
  posOffset.value = 0
  curSpeed.value = 0
  if (sceneObjs) {
    rebuildRig()
    updateFrame()
  }
}

function toggleRun() {
  if (!running.value && Math.abs(posOffset.value) >= maxLimit.value - 0.01) {
    posOffset.value = 0
    curSpeed.value = 0
  }
  running.value = !running.value
}

function stepSim(delta = 0.04) {
  updateMotion(delta)
  updateFrame()
}

function updateMotion(dt) {
  if (Math.abs(curAcc.value) < 0.01) return
  curSpeed.value += curAcc.value * dt
  posOffset.value += curSpeed.value * dt

  const limit = maxLimit.value
  if (Math.abs(posOffset.value) >= limit) {
    posOffset.value = Math.sign(posOffset.value) * limit
    curSpeed.value = 0
    running.value = false
  }
}

function getCamDistScale() {
  const w = threeContainer.value?.clientWidth || 720
  const h = threeContainer.value?.clientHeight || 430
  const aspect = w / Math.max(1, h)
  return aspect < 1.08 ? Math.min(1.56, 1.24 / Math.max(0.72, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const k = getCamDistScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([6.4 * k, 3.8 * k, 12.6 * k], [0, 0.05, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 0.05, 48.0 * k], [0, 0.05, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 48.0 * k, 0.01], [0, 0, 0], duration, 14)
  }
}

// ==========================================================
// Three.js 3D シーン構築・管理
// ==========================================================
const floorY = -2.95

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

function createMetallicBlock(colorHex, emissiveHex) {
  const group = new THREE.Group()
  const geo = new THREE.BoxGeometry(1, 1, 1)
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: emissiveHex,
    emissiveIntensity: 0.3,
    roughness: 0.28,
    metalness: 0.45
  })
  const mesh = new THREE.Mesh(geo, mat)
  group.add(mesh)

  const edges = new THREE.EdgesGeometry(geo)
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.55
  })
  const wire = new THREE.LineSegments(edges, edgeMat)
  group.add(wire)

  const hookGeo = new THREE.TorusGeometry(0.11, 0.03, 10, 20)
  const hookMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.2
  })
  const hook = new THREE.Mesh(hookGeo, hookMat)
  hook.position.set(0, 0.52, 0)
  group.add(hook)

  group.userData.mesh = mesh
  group.userData.hook = hook
  return group
}

function createPulleyWheel(radius) {
  const wheelGroup = new THREE.Group()

  // 外周溝リム (2枚のフランジ + 中央溝)
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.25,
    metalness: 0.72,
    roughness: 0.22
  })
  const flangeGeo = new THREE.TorusGeometry(radius, 0.055, 14, 48)
  const frontFlange = new THREE.Mesh(flangeGeo, rimMat)
  frontFlange.position.z = 0.06
  const backFlange = new THREE.Mesh(flangeGeo, rimMat)
  backFlange.position.z = -0.06
  wheelGroup.add(frontFlange, backFlange)

  // 内側ディスク
  const discGeo = new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, 0.1, 36)
  discGeo.rotateX(Math.PI / 2)
  const discMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.65,
    roughness: 0.35
  })
  wheelGroup.add(new THREE.Mesh(discGeo, discMat))

  // 回転視認用スポーク (6本)
  const spokeGeo = new THREE.BoxGeometry(radius * 1.72, 0.055, 0.13)
  const spokeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.25
  })
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(spokeGeo, spokeMat)
    spoke.rotation.z = (i * Math.PI) / 3
    wheelGroup.add(spoke)
  }

  // 中心軸受けハブ
  const hubGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.26, 20)
  hubGeo.rotateX(Math.PI / 2)
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
    metalness: 0.5,
    roughness: 0.25
  })
  wheelGroup.add(new THREE.Mesh(hubGeo, hubMat))

  return wheelGroup
}

function initThreeScene() {
  if (!threeContainer.value) return
  const w0 = threeContainer.value.clientWidth || 720
  const h0 = threeContainer.value.clientHeight || 430
  lastAspect = w0 / Math.max(1, h0)
  const k = getCamDistScale()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [6.4 * k, 3.8 * k, 12.6 * k],
    initialTarget: [0, 0.05, 0],
    minDistance: 5,
    maxDistance: 85,
    onFrame: (dt) => {
      if (threeContainer.value) {
        const cw = threeContainer.value.clientWidth || 720
        const ch = threeContainer.value.clientHeight || 430
        const asp = cw / Math.max(1, ch)
        if (Math.abs(asp - lastAspect) > 0.12) {
          lastAspect = asp
          setCameraPreset(activeCam.value, 0)
        }
      }
      if (running.value) {
        updateMotion(dt * timeScale.value)
      }
      updateFrame()
    }
  })

  const { scene } = threeCtx

  // デュアルトーン床グリッド + 実験ベンチベース
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.y = floorY - 0.01
  scene.add(grid)

  const benchGeo = new THREE.BoxGeometry(10.8, 0.16, 4.4)
  const benchMat = new THREE.MeshStandardMaterial({
    color: 0x26354d,
    metalness: 0.55,
    roughness: 0.36
  })
  const bench = new THREE.Mesh(benchGeo, benchMat)
  bench.position.set(0, floorY - 0.09, 0)
  scene.add(bench)

  const benchRim = new THREE.LineSegments(
    new THREE.EdgesGeometry(benchGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
  )
  benchRim.position.copy(bench.position)
  scene.add(benchRim)

  const rigGroup = new THREE.Group()
  scene.add(rigGroup)

  const dynamicGroup = new THREE.Group()
  scene.add(dynamicGroup)

  // 質量ブロック A (インディゴ/コバルト), B (ローズ/マゼンタ)
  const blockA = createMetallicBlock(0x6366f1, 0x3730a3)
  const blockB = createMetallicBlock(0xec4899, 0x9d174d)
  dynamicGroup.add(blockA, blockB)

  // 床面ドロップシャドウリング (空間奥行き表現)
  const shadowGeo = new THREE.CircleGeometry(0.55, 28)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowMatA = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.28
  })
  const shadowMatB = new THREE.MeshBasicMaterial({
    color: 0xec4899,
    transparent: true,
    opacity: 0.28
  })
  const shadowA = new THREE.Mesh(shadowGeo, shadowMatA)
  const shadowB = new THREE.Mesh(shadowGeo, shadowMatB)
  shadowA.position.y = floorY + 0.015
  shadowB.position.y = floorY + 0.015
  dynamicGroup.add(shadowA, shadowB)

  // 3D ロープメッシュ (直線部 + 滑車巻き付き円弧を動的更新)
  const ropeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.15,
    roughness: 0.35,
    metalness: 0.25
  })
  const ropeSeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1, 10), ropeMat)
  const ropeSeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1, 10), ropeMat)
  const ropeArcMesh = new THREE.Mesh(new THREE.BufferGeometry(), ropeMat)
  dynamicGroup.add(ropeSeg1, ropeSeg2, ropeArcMesh)

  // 3D 力・加速度ベクトル矢印
  const arrowMgA = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowTA = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowAccA = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowNA = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.038, headRadius: 0.12, headLength: 0.28, opacity: 0.78 })
  const arrowFricA = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.04, headRadius: 0.13, headLength: 0.3 })

  const arrowMgB = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowTB = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowAccB = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })

  dynamicGroup.add(
    arrowMgA, arrowTA, arrowAccA, arrowNA, arrowFricA,
    arrowMgB, arrowTB, arrowAccB
  )

  // 3D テキストラベル
  const labelA = createTextSprite('A: 4.0kg', { color: '#c7d2fe', borderColor: '#6366f1', scale: 0.36 })
  const labelB = createTextSprite('B: 2.0kg', { color: '#fbcfe8', borderColor: '#ec4899', scale: 0.36 })
  const labelMgA = createTextSprite('Mg', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.38 })
  const labelTA = createTextSprite('T', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.38 })
  const labelAccA = createTextSprite('a', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.38 })
  const labelFricA = createTextSprite("f'", { color: '#e9d5ff', borderColor: '#a855f7', scale: 0.36 })
  const labelMgB = createTextSprite('mg', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.38 })
  const labelTB = createTextSprite('T', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.38 })
  const labelAccB = createTextSprite('a', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.38 })

  dynamicGroup.add(
    labelA, labelB,
    labelMgA, labelTA, labelAccA, labelFricA,
    labelMgB, labelTB, labelAccB
  )

  sceneObjs = {
    rigGroup,
    dynamicGroup,
    blockA,
    blockB,
    shadowA,
    shadowB,
    ropeSeg1,
    ropeSeg2,
    ropeArcMesh,
    arrowMgA,
    arrowTA,
    arrowAccA,
    arrowNA,
    arrowFricA,
    arrowMgB,
    arrowTB,
    arrowAccB,
    labelA,
    labelB,
    labelMgA,
    labelTA,
    labelAccA,
    labelFricA,
    labelMgB,
    labelTB,
    labelAccB,
    pulleyWheel: null,
    pulleyCenter: new THREE.Vector3(),
    pulleyR: 0.7,
    inclineGeom: null
  }

  rebuildRig()
  updateFrame()
}

function getInclineGeomParams() {
  const rad = (inclineDeg.value * Math.PI) / 180
  const inclineLen = 4.4
  const rampBaseY = -1.05
  const horizSpan = inclineLen * Math.cos(rad)
  const height = inclineLen * Math.sin(rad)
  const startX = -0.35 - 0.52 * horizSpan
  const apexX = startX + horizSpan
  const apexY = rampBaseY + height
  const pulleyR = 0.48
  const pulleyX = apexX + pulleyR * Math.sin(rad) * 0.22
  const pulleyY = apexY + pulleyR * Math.cos(rad) * 0.65
  return {
    rad,
    inclineLen,
    rampBaseY,
    horizSpan,
    height,
    startX,
    apexX,
    apexY,
    pulleyR,
    pulleyX,
    pulleyY
  }
}

function rebuildRig() {
  if (!sceneObjs) return
  const { rigGroup } = sceneObjs
  disposeChildren(rigGroup)

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    emissive: 0x334155,
    emissiveIntensity: 0.32,
    metalness: 0.62,
    roughness: 0.22
  })
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    emissive: 0x1e293b,
    emissiveIntensity: 0.22,
    metalness: 0.58,
    roughness: 0.28
  })

  if (configMode.value === 'atwood') {
    const pulleyY = 2.38
    const pulleyR = 0.90
    const beamY = 3.22
    const pillarX = 3.65
    const pillarH = beamY - floorY

    // 左右ガントリー支柱 + 台座フランジ
    const pillarGeo = new THREE.CylinderGeometry(0.11, 0.13, pillarH, 16)
    const flangeGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.14, 20)
    ;[-pillarX, pillarX].forEach((px) => {
      const pillar = new THREE.Mesh(pillarGeo, metalMat)
      pillar.position.set(px, floorY + pillarH / 2, 0)
      rigGroup.add(pillar)

      const flange = new THREE.Mesh(flangeGeo, darkMetalMat)
      flange.position.set(px, floorY + 0.07, 0)
      rigGroup.add(flange)

      // 支柱斜めブレース
      const braceGeo = new THREE.BoxGeometry(0.7, 0.1, 0.12)
      const brace = new THREE.Mesh(braceGeo, metalMat)
      brace.position.set(px - Math.sign(px) * 0.28, beamY - 0.28, 0)
      brace.rotation.z = Math.sign(px) * (Math.PI / 4)
      rigGroup.add(brace)
    })

    // 上部ガントリー横桁ビーム
    const beamGeo = new THREE.BoxGeometry(pillarX * 2 + 0.7, 0.22, 0.36)
    const beam = new THREE.Mesh(beamGeo, metalMat)
    beam.position.set(0, beamY + 0.11, 0)
    rigGroup.add(beam)

    // 滑車吊り下げクレビスヨーク
    const yokeGeo = new THREE.BoxGeometry(0.16, beamY - pulleyY + 0.15, 0.28)
    const yoke = new THREE.Mesh(yokeGeo, darkMetalMat)
    yoke.position.set(0, (beamY + pulleyY) / 2, 0)
    rigGroup.add(yoke)

    // 定滑車ホイール
    const wheel = createPulleyWheel(pulleyR)
    wheel.position.set(0, pulleyY, 0)
    rigGroup.add(wheel)

    const pulleyLbl = createTextSprite('定滑車', {
      color: '#7dd3fc',
      borderColor: 'rgba(56,189,248,0.55)',
      scale: 0.40
    })
    pulleyLbl.position.set(0, beamY + 0.44, -0.68)
    rigGroup.add(pulleyLbl)

    sceneObjs.pulleyWheel = wheel
    sceneObjs.pulleyCenter.set(0, pulleyY, 0)
    sceneObjs.pulleyR = pulleyR
    sceneObjs.inclineGeom = null
  } else {
    const geom = getInclineGeomParams()
    const { rad, rampBaseY, horizSpan, height, startX, apexX, apexY, pulleyR, pulleyX, pulleyY } = geom

    // 三角形斜面プリズム (ExtrudeGeometry)
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(horizSpan, 0)
    shape.lineTo(horizSpan, height)
    shape.closePath()

    const depth = 2.0
    const extrudeGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    extrudeGeo.translate(0, 0, -depth / 2)

    const wedgeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x0284c7,
      emissiveIntensity: 0.08,
      metalness: 0.45,
      roughness: 0.28,
      transparent: true,
      opacity: 0.9
    })
    const wedgeMesh = new THREE.Mesh(extrudeGeo, wedgeMat)
    wedgeMesh.position.set(startX, rampBaseY, 0)
    rigGroup.add(wedgeMesh)

    const wedgeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(extrudeGeo),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 })
    )
    wedgeEdges.position.copy(wedgeMesh.position)
    rigGroup.add(wedgeEdges)

    // 斜面上の光るガイドレール
    const railLen = geom.inclineLen
    const railGeo = new THREE.BoxGeometry(railLen, 0.04, 0.08)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.35
    })
    ;[-0.62, 0.62].forEach((rz) => {
      const rail = new THREE.Mesh(railGeo, railMat)
      rail.position.set(startX + horizSpan / 2, rampBaseY + height / 2, rz)
      rail.rotation.z = rad
      rigGroup.add(rail)
    })

    // 斜面台を支える実験脚部 (rampBaseY -> floorY)
    const legH = rampBaseY - floorY
    const legGeo = new THREE.CylinderGeometry(0.09, 0.11, legH, 14)
    const legXs = [startX + 0.35, apexX - 0.35]
    legXs.forEach((lx) => {
      ;[-0.75, 0.75].forEach((lz) => {
        const leg = new THREE.Mesh(legGeo, metalMat)
        leg.position.set(lx, floorY + legH / 2, lz)
        rigGroup.add(leg)
      })
    })
    // 台座ビーム
    const deckGeo = new THREE.BoxGeometry(horizSpan + 0.5, 0.14, 2.2)
    const deck = new THREE.Mesh(deckGeo, darkMetalMat)
    deck.position.set(startX + horizSpan / 2, rampBaseY - 0.07, 0)
    rigGroup.add(deck)

    // 角度 θ アークとラベル
    const arcR = 0.75
    const arcCurve = new THREE.EllipseCurve(0, 0, arcR, arcR, 0, rad, false, 0)
    const arcPts = arcCurve.getPoints(24).map((p) => new THREE.Vector3(startX + p.x, rampBaseY + p.y, 1.04))
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts)
    const arcLine = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0xfbbf24 }))
    rigGroup.add(arcLine)

    const thetaLbl = createTextSprite(`θ = ${inclineDeg.value}°`, {
      color: '#fde68a',
      borderColor: 'rgba(251,191,36,0.55)',
      scale: 0.42
    })
    thetaLbl.position.set(startX + 0.92, rampBaseY - 0.28, 1.12)
    rigGroup.add(thetaLbl)

    // 頂点滑車ブラケット + 定滑車
    const armLen = Math.hypot(pulleyX - apexX, pulleyY - apexY)
    const armGeo = new THREE.BoxGeometry(armLen + 0.18, 0.12, 0.24)
    const arm = new THREE.Mesh(armGeo, metalMat)
    arm.position.set((apexX + pulleyX) / 2, (apexY + pulleyY) / 2, 0)
    arm.rotation.z = Math.atan2(pulleyY - apexY, pulleyX - apexX)
    rigGroup.add(arm)

    const wheel = createPulleyWheel(pulleyR)
    wheel.position.set(pulleyX, pulleyY, 0)
    rigGroup.add(wheel)

    sceneObjs.pulleyWheel = wheel
    sceneObjs.pulleyCenter.set(pulleyX, pulleyY, 0)
    sceneObjs.pulleyR = pulleyR
    sceneObjs.inclineGeom = geom
  }
}

function setCylinderBetween(mesh, p1, p2) {
  const diff = new THREE.Vector3().subVectors(p2, p1)
  const len = diff.length()
  if (len < 1e-4) {
    mesh.visible = false
    return
  }
  mesh.visible = true
  mesh.position.copy(p1).add(p2).multiplyScalar(0.5)
  mesh.scale.set(1, len, 1)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize())
}

function setRopeArc(arcMesh, cx, cy, R, startAng, endAng) {
  const pts = []
  const segs = 28
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const ang = startAng + (endAng - startAng) * t
    pts.push(new THREE.Vector3(cx + R * Math.cos(ang), cy + R * Math.sin(ang), 0))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  if (arcMesh.geometry) arcMesh.geometry.dispose()
  arcMesh.geometry = new THREE.TubeGeometry(curve, 24, 0.032, 8, false)
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    blockA,
    blockB,
    shadowA,
    shadowB,
    ropeSeg1,
    ropeSeg2,
    ropeArcMesh,
    arrowMgA,
    arrowTA,
    arrowAccA,
    arrowNA,
    arrowFricA,
    arrowMgB,
    arrowTB,
    arrowAccB,
    labelA,
    labelB,
    labelMgA,
    labelTA,
    labelAccA,
    labelFricA,
    labelMgB,
    labelTB,
    labelAccB,
    pulleyWheel,
    pulleyCenter,
    pulleyR,
    inclineGeom
  } = sceneObjs

  const sizeA = Math.min(1.06, 0.62 + massA.value * 0.055)
  const sizeB = Math.min(1.06, 0.62 + massB.value * 0.055)
  const halfA = sizeA / 2
  const halfB = sizeB / 2

  blockA.scale.set(sizeA, sizeA, sizeA)
  blockB.scale.set(sizeB, sizeB, sizeB)

  updateSpriteSafe(labelA, `A: ${massA.value.toFixed(1)}kg`, '#e0e7ff', '#6366f1')
  updateSpriteSafe(labelB, `B: ${massB.value.toFixed(1)}kg`, '#fce7f3', '#ec4899')

  const M = massA.value
  const m = massB.value
  const T = curTension.value
  const a = curAcc.value
  const mgA = M * g
  const mgB = m * g
  const fScale = 0.0145

  if (configMode.value === 'atwood') {
    const worldPerM = 1.02
    const s = posOffset.value * worldPerM
    const baseLen = 2.45
    const lenA = baseLen + s
    const lenB = baseLen - s

    const xA = -pulleyR
    const xB = pulleyR
    const yA = pulleyCenter.y - lenA
    const yB = pulleyCenter.y - lenB

    blockA.position.set(xA, yA, 0)
    blockA.rotation.set(0, 0, 0)
    blockB.position.set(xB, yB, 0)
    blockB.rotation.set(0, 0, 0)

    if (pulleyWheel) {
      pulleyWheel.rotation.z = s / pulleyR
    }

    // 影リング
    shadowA.visible = true
    shadowB.visible = true
    const sScaleA = Math.max(0.4, 1.15 - (yA - floorY) * 0.12) * sizeA
    const sScaleB = Math.max(0.4, 1.15 - (yB - floorY) * 0.12) * sizeB
    shadowA.position.set(xA, floorY + 0.015, 0)
    shadowA.scale.set(sScaleA, 1, sScaleA)
    shadowB.position.set(xB, floorY + 0.015, 0)
    shadowB.scale.set(sScaleB, 1, sScaleB)

    // ロープ
    setCylinderBetween(ropeSeg1, new THREE.Vector3(xA, pulleyCenter.y, 0), new THREE.Vector3(xA, yA + halfA, 0))
    setCylinderBetween(ropeSeg2, new THREE.Vector3(xB, pulleyCenter.y, 0), new THREE.Vector3(xB, yB + halfB, 0))
    setRopeArc(ropeArcMesh, pulleyCenter.x, pulleyCenter.y, pulleyR, Math.PI, 0)

    // ブロックラベル (正面少し手前 + 上面視点分離)
    labelA.position.set(xA, yA, 0.25)
    labelB.position.set(xB, yB, 0.25)

    if (showVectors.value) {
      const lenMgA = Math.min(1.12, Math.max(0.42, mgA * fScale))
      const lenTA = Math.min(1.02, Math.max(0.38, T * fScale))
      const lenMgB = Math.min(1.12, Math.max(0.42, mgB * fScale))
      const lenTB = Math.min(1.02, Math.max(0.38, T * fScale))

      arrowMgA.setVector(new THREE.Vector3(xA, yA - halfA, 0.14), new THREE.Vector3(0, -1, 0), lenMgA)
      arrowTA.setVector(new THREE.Vector3(xA, yA + halfA, 0.14), new THREE.Vector3(0, 1, 0), lenTA)
      arrowMgB.setVector(new THREE.Vector3(xB, yB - halfB, 0.14), new THREE.Vector3(0, -1, 0), lenMgB)
      arrowTB.setVector(new THREE.Vector3(xB, yB + halfB, 0.14), new THREE.Vector3(0, 1, 0), lenTB)

      labelMgA.visible = true
      labelTA.visible = true
      labelMgB.visible = true
      labelTB.visible = true

      updateSpriteSafe(labelMgA, `Mg = ${mgA.toFixed(0)}N`, '#fde68a', '#f59e0b')
      updateSpriteSafe(labelTA, `T = ${T.toFixed(0)}N`, '#7dd3fc', '#38bdf8')
      updateSpriteSafe(labelMgB, `mg = ${mgB.toFixed(0)}N`, '#fde68a', '#f59e0b')
      updateSpriteSafe(labelTB, `T = ${T.toFixed(0)}N`, '#7dd3fc', '#38bdf8')

      labelMgA.position.set(xA - 0.98, yA - halfA - lenMgA * 0.58, 1.35)
      labelTA.position.set(xA - 0.98, yA + halfA + lenTA * 0.58, -1.25)
      labelMgB.position.set(xB + 0.98, yB - halfB - lenMgB * 0.58, 1.35)
      labelTB.position.set(xB + 0.98, yB + halfB + lenTB * 0.58, -1.25)

      if (Math.abs(a) > 0.05) {
        const aLen = Math.min(1.0, Math.max(0.42, Math.abs(a) * 0.14))
        const dirA = a > 0 ? -1 : 1 // a>0 => A下降
        const dirB = -dirA
        arrowAccA.setVector(new THREE.Vector3(xA - halfA - 0.55, yA - dirA * aLen * 0.5, 0.1), new THREE.Vector3(0, dirA, 0), aLen)
        arrowAccB.setVector(new THREE.Vector3(xB + halfB + 0.55, yB - dirB * aLen * 0.5, 0.1), new THREE.Vector3(0, dirB, 0), aLen)

        labelAccA.visible = true
        labelAccB.visible = true
        updateSpriteSafe(labelAccA, `a = ${Math.abs(a).toFixed(1)}m/s²`, '#fda4af', '#f43f5e')
        updateSpriteSafe(labelAccB, `a = ${Math.abs(a).toFixed(1)}m/s²`, '#fda4af', '#f43f5e')
        labelAccA.position.set(xA - halfA - 1.52, yA, 0.0)
        labelAccB.position.set(xB + halfB + 1.52, yB, 0.0)
      } else {
        arrowAccA.visible = false
        arrowAccB.visible = false
        labelAccA.visible = false
        labelAccB.visible = false
      }
    } else {
      arrowMgA.visible = false
      arrowTA.visible = false
      arrowAccA.visible = false
      arrowMgB.visible = false
      arrowTB.visible = false
      arrowAccB.visible = false
      labelMgA.visible = false
      labelTA.visible = false
      labelAccA.visible = false
      labelMgB.visible = false
      labelTB.visible = false
      labelAccB.visible = false
    }

    arrowNA.visible = false
    arrowFricA.visible = false
    labelFricA.visible = false
  } else if (inclineGeom) {
    const { rad, inclineLen, rampBaseY, startX, pulleyX, pulleyY } = inclineGeom
    const worldPerM = 1.05
    const s = posOffset.value * worldPerM

    const baseDistA = inclineLen * 0.48
    const distA = baseDistA + s
    const baseHang = 1.55
    const hangDist = baseHang + s

    const cosR = Math.cos(rad)
    const sinR = Math.sin(rad)

    // ブロック A の中心 (斜面上・法線方向 halfA オフセット)
    const surfAX = startX + distA * cosR
    const surfAY = rampBaseY + distA * sinR
    const centerAX = surfAX - halfA * sinR
    const centerAY = surfAY + halfA * cosR

    blockA.position.set(centerAX, centerAY, 0)
    blockA.rotation.set(0, 0, rad)

    // ブロック B (滑車右端 x = pulleyX + pulleyR から鉛直吊り下げ)
    const hangX = pulleyX + pulleyR
    const centerBY = pulleyY - hangDist
    blockB.position.set(hangX, centerBY, 0)
    blockB.rotation.set(0, 0, 0)

    if (pulleyWheel) {
      pulleyWheel.rotation.z = -s / pulleyR
    }

    // 影リング (Aは非表示、Bは床面表示)
    shadowA.visible = false
    shadowB.visible = true
    const sScaleB = Math.max(0.4, 1.15 - (centerBY - floorY) * 0.12) * sizeB
    shadowB.position.set(hangX, floorY + 0.015, 0)
    shadowB.scale.set(sScaleB, 1, sScaleB)

    // 斜面上フック位置 (Aの上端面中央)
    const hookAX = centerAX + halfA * cosR
    const hookAY = centerAY + halfA * sinR

    // 円への接線点を厳密計算
    const dx = hookAX - pulleyX
    const dy = hookAY - pulleyY
    const d = Math.hypot(dx, dy)
    let tanAng = Math.PI / 2 + rad
    if (d > pulleyR + 0.01) {
      const phi = Math.atan2(dy, dx)
      const alpha = Math.acos(pulleyR / d)
      tanAng = phi - alpha
    }
    const tanX = pulleyX + pulleyR * Math.cos(tanAng)
    const tanY = pulleyY + pulleyR * Math.sin(tanAng)

    setCylinderBetween(ropeSeg1, new THREE.Vector3(hookAX, hookAY, 0), new THREE.Vector3(tanX, tanY, 0))
    setCylinderBetween(ropeSeg2, new THREE.Vector3(hangX, pulleyY, 0), new THREE.Vector3(hangX, centerBY + halfB, 0))
    // tanAng から 0 まで時計回りに巻き付く (tanAng > 0 を保証)
    let arcStart = tanAng
    while (arcStart < 0) arcStart += Math.PI * 2
    setRopeArc(ropeArcMesh, pulleyX, pulleyY, pulleyR, arcStart, 0)

    labelA.position.set(centerAX, centerAY, 0.25)
    labelB.position.set(hangX, centerBY, 0.25)

    if (showVectors.value) {
      const lenMgA = Math.min(1.08, Math.max(0.45, mgA * fScale))
      const lenTA = Math.min(0.95, Math.max(0.36, T * fScale))
      const lenNA = Math.min(0.95, Math.max(0.38, mgA * cosR * fScale))
      const lenMgB = Math.min(1.08, Math.max(0.45, mgB * fScale))
      const lenTB = Math.min(0.95, Math.max(0.36, T * fScale))

      // A の力
      arrowMgA.setVector(new THREE.Vector3(centerAX, centerAY, 0.16), new THREE.Vector3(0, -1, 0), lenMgA)
      arrowTA.setVector(new THREE.Vector3(hookAX, hookAY, 0.12), new THREE.Vector3(cosR, sinR, 0), lenTA)
      arrowNA.setVector(new THREE.Vector3(centerAX, centerAY, 0.12), new THREE.Vector3(-sinR, cosR, 0), lenNA)

      labelMgA.visible = true
      labelTA.visible = true
      updateSpriteSafe(labelMgA, `Mg = ${mgA.toFixed(0)}N`, '#fde68a', '#f59e0b')
      updateSpriteSafe(labelTA, `T = ${T.toFixed(0)}N`, '#7dd3fc', '#38bdf8')
      labelMgA.position.set(centerAX - 0.15, centerAY - lenMgA - 0.36, 1.35)
      labelTA.position.set(hookAX + cosR * (lenTA + 0.35) - 0.15, hookAY + sinR * (lenTA + 0.35) + 0.36, -1.25)

      // 動摩擦力 f' (動く向きと逆)
      const fFricVal = muK.value * mgA * cosR
      if (muK.value > 0.01 && Math.abs(a) > 0.05) {
        const fDir = a > 0 ? -1 : 1 // a>0 => A登る => 摩擦は斜面下向き
        const lenF = Math.min(0.82, Math.max(0.34, fFricVal * fScale * 1.4))
        arrowFricA.setVector(
          new THREE.Vector3(surfAX - 0.06 * sinR, surfAY + 0.06 * cosR, 0.22),
          new THREE.Vector3(fDir * cosR, fDir * sinR, 0),
          lenF
        )
        labelFricA.visible = true
        updateSpriteSafe(labelFricA, `f' = ${fFricVal.toFixed(0)}N`, '#e9d5ff', '#a855f7')
        if (fDir < 0) {
          // 下向き摩擦は斜面上側へ逃がして Mg と重ならないようにする
          labelFricA.position.set(
            surfAX + fDir * cosR * (lenF + 0.48) - 0.45 * sinR,
            surfAY + fDir * sinR * (lenF + 0.48) + 0.45 * cosR,
            -0.55
          )
        } else {
          // 上向き摩擦は斜面下側へ逃がして T と重ならないようにする
          labelFricA.position.set(
            surfAX + fDir * cosR * (lenF + 0.36) + 0.42 * sinR,
            surfAY + fDir * sinR * (lenF + 0.36) - 0.42 * cosR,
            -0.55
          )
        }
      } else {
        arrowFricA.visible = false
        labelFricA.visible = false
      }

      // B の力
      arrowMgB.setVector(new THREE.Vector3(hangX, centerBY - halfB, 0.14), new THREE.Vector3(0, -1, 0), lenMgB)
      arrowTB.setVector(new THREE.Vector3(hangX, centerBY + halfB, 0.14), new THREE.Vector3(0, 1, 0), lenTB)
      labelMgB.visible = true
      labelTB.visible = true
      updateSpriteSafe(labelMgB, `mg = ${mgB.toFixed(0)}N`, '#fde68a', '#f59e0b')
      updateSpriteSafe(labelTB, `T = ${T.toFixed(0)}N`, '#7dd3fc', '#38bdf8')
      labelMgB.position.set(hangX + 1.02, centerBY - halfB - lenMgB * 0.58, 1.35)
      labelTB.position.set(hangX + 1.02, centerBY + halfB + lenTB * 0.58, -1.25)

      if (Math.abs(a) > 0.05) {
        const aLen = Math.min(0.95, Math.max(0.4, Math.abs(a) * 0.14))
        const dirB = a > 0 ? -1 : 1 // a>0 => B下降
        const dirA = a > 0 ? 1 : -1 // a>0 => A斜面上向き
        arrowAccA.setVector(
          new THREE.Vector3(centerAX - (halfA + 0.35) * sinR, centerAY + (halfA + 0.35) * cosR, 0.16),
          new THREE.Vector3(dirA * cosR, dirA * sinR, 0),
          aLen
        )
        arrowAccB.setVector(
          new THREE.Vector3(hangX + halfB + 0.55, centerBY - dirB * aLen * 0.5, 0.1),
          new THREE.Vector3(0, dirB, 0),
          aLen
        )
        labelAccA.visible = true
        labelAccB.visible = true
        updateSpriteSafe(labelAccA, `a = ${Math.abs(a).toFixed(1)}m/s²`, '#fda4af', '#f43f5e')
        updateSpriteSafe(labelAccB, `a = ${Math.abs(a).toFixed(1)}m/s²`, '#fda4af', '#f43f5e')
        labelAccA.position.set(
          centerAX - (halfA + 0.72) * sinR + dirA * cosR * 0.45,
          centerAY + (halfA + 0.72) * cosR + dirA * sinR * 0.45,
          -0.45
        )
        labelAccB.position.set(hangX + halfB + 1.50, centerBY, 0.0)
      } else {
        arrowAccA.visible = false
        arrowAccB.visible = false
        labelAccA.visible = false
        labelAccB.visible = false
      }
    } else {
      arrowMgA.visible = false
      arrowTA.visible = false
      arrowAccA.visible = false
      arrowNA.visible = false
      arrowFricA.visible = false
      arrowMgB.visible = false
      arrowTB.visible = false
      arrowAccB.visible = false
      labelMgA.visible = false
      labelTA.visible = false
      labelAccA.visible = false
      labelFricA.visible = false
      labelMgB.visible = false
      labelTB.visible = false
      labelAccB.visible = false
    }
  }
}

watch([massA, massB, inclineDeg, muK], () => {
  reset()
})

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
.mode-tabs-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.65rem;
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

.camera-preset-bar .lab-chip {
  white-space: nowrap;
}

.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin: 0.65rem 0;
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
  font-size: 0.8rem;
  font-weight: 600;
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
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s;
}

.speed-btn-group button:hover {
  color: #ffffff;
}

.speed-btn-group button.active {
  background: #6366f1;
  color: #ffffff;
  border-color: #818cf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 430px;
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

.dot-g { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-t { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-a { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-fr { background: #a855f7; box-shadow: 0 0 6px #a855f7; }

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

.lab-ctrl label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.lab-ctrl label strong {
  color: #818cf8;
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
