<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🌊 3D 浮力とアルキメデスの原理・水圧シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge badge-cyan" style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="badge" :class="stateBadgeClass">{{ stateLabel }}</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
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
          📐 正面断面視点 (上下の水圧差 P₂ - P₁)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点 (水面リップル)
        </button>
      </div>
    </div>

    <!-- 再生コントロールバー -->
    <div class="playback-bar" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
      <button class="sim-btn primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 手を離して浮沈アニメーション' }}
      </button>
      <button class="sim-btn secondary" @click="dropFromSurface">
        🔄 水面付近から再ドロップ
      </button>
      <button class="sim-btn secondary" @click="autoBalance">
        ⚖️ つり合い深さへ即移動
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-fb"></i>浮力 <b>F<sub>B</sub> = ρ₀Vg</b></span>
        <span class="legend-item"><i class="dot-w"></i>重力 <b>W = Mg</b></span>
        <span class="legend-item"><i class="dot-p"></i>上下水圧 <b>P₁S / P₂S</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">上面水深 h₁</div>
        <div class="stat-value text-blue">{{ depthTop.toFixed(1) }} <span class="stat-unit">cm</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">浸水体積 V_sub</div>
        <div class="stat-value text-cyan">{{ submergedVolume.toFixed(0) }} <span class="stat-unit">cm³</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">浮力 F_B (ρ₀ V g)</div>
        <div class="stat-value text-cyan">{{ buoyancyForce.toFixed(2) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">重力 W (Mg)</div>
        <div class="stat-value text-yellow">{{ gravityForce.toFixed(2) }} <span class="stat-unit">N</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">合力 (上向き正)</div>
        <div class="stat-value" :class="netForce >= 0 ? 'text-cyan' : 'text-rose'">
          {{ netForce >= 0 ? '+' : '' }}{{ netForce.toFixed(2) }} <span class="stat-unit">N</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>物体の深さ (上面位置):</span>
            <span class="control-val">{{ depthTop.toFixed(1) }} cm</span>
          </label>
          <input type="range" v-model.number="depthTop" min="-5" max="22" step="0.5" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>物体の密度 ρ:</span>
            <span class="control-val">{{ objectDensity.toFixed(2) }} g/cm³</span>
          </label>
          <input type="range" v-model.number="objectDensity" min="0.2" max="2.5" step="0.05" class="sim-slider" />
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>流体の密度 ρ₀:</span>
            <span class="control-val">{{ fluidDensity.toFixed(2) }} g/cm³</span>
          </label>
          <input type="range" v-model.number="fluidDensity" min="0.7" max="1.5" step="0.05" class="sim-slider" />
        </div>

        <div class="btn-group">
          <button @click="setPreset('wood')" class="sim-btn outline">木片 (0.6 g/cm³: 浮く)</button>
          <button @click="setPreset('water')" class="sim-btn outline">中立浮力 (1.0 g/cm³)</button>
          <button @click="setPreset('iron')" class="sim-btn outline">金属 (1.8 g/cm³: 沈む)</button>
          <button @click="autoBalance" class="sim-btn secondary">つり合い位置へ自動移動</button>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>力学の急所</strong>:
      浮力 <i>F</i><sub><i>B</i></sub> のミクロな正体は、<strong>「上面にかかる水圧 <i>P</i><sub>1</sub> よりも、深い下面にかかる水圧 <i>P</i><sub>2</sub> の方が大きい」</strong>という圧力差です。<br>
      底面積を <i>S</i> とすると、<i>F</i><sub><i>B</i></sub> = (<i>P</i><sub>2</sub> - <i>P</i><sub>1</sub>)<i>S</i> = ρ<sub>0</sub> <i>g</i> (<i>h</i><sub>2</sub> - <i>h</i><sub>1</sub>)<i>S</i> = ρ<sub>0</sub> <i>V</i><sub>浸</sub> <i>g</i> となり、完全に<strong>「物体が押しのけた流体の重さ（アルキメデスの原理）」</strong>と一致します！
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjects = null

const activeCam = ref('3d')

// 物理パラメータ
const blockHeight = 10 // cm
const blockArea = 100 // cm^2
const blockTotalVol = 1000 // cm^3 (10x10x10)

const depthTop = ref(5.0) // 上面の水深 [cm] (0が水面、負なら水面より上)
const objectDensity = ref(0.7) // g/cm^3
const fluidDensity = ref(1.0) // g/cm^3 (水)
const g = 9.8 // m/s^2

const isPlaying = ref(true)
let velY = 0 // 鉛直速度 (下向き正 [cm/s])
let waveTime = 0

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.1, 1.62 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  const targetY = s > 1.05 ? 0.55 : -0.5
  if (preset === '3d') {
    threeCtx.moveCameraTo([5.2 * s, (s > 1.05 ? 4.4 : 3.8) * s, 9.6 * s], [0, targetY, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, targetY, 36.0 * s], [0, targetY, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 36.0 * s, 0.01], [0, 0, 0], duration, 14)
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value && Math.abs(netForce.value) < 0.05 && Math.abs(velY) < 0.5) {
    depthTop.value = Math.min(20, depthTop.value + 5.0)
    velY = 0
  }
}

function dropFromSurface() {
  depthTop.value = 4.0
  velY = 0
  isPlaying.value = true
}

// 浸水深さ [cm]
const submergedDepth = computed(() => {
  const top = depthTop.value
  const bottom = top + blockHeight
  if (bottom <= 0) return 0
  if (top >= 0) return blockHeight
  return bottom
})

// 浸水体積 [cm^3]
const submergedVolume = computed(() => {
  return submergedDepth.value * blockArea
})

// 浮力 F_B [N]
const buoyancyForce = computed(() => {
  const rho0_si = fluidDensity.value * 1000
  const V_si = submergedVolume.value * 1e-6
  return rho0_si * V_si * g
})

// 重力 W [N]
const gravityForce = computed(() => {
  const rho_si = objectDensity.value * 1000
  const V_si = blockTotalVol * 1e-6
  return rho_si * V_si * g
})

// 合力 (上向き正)
const netForce = computed(() => {
  return buoyancyForce.value - gravityForce.value
})

const stateLabel = computed(() => {
  if (Math.abs(netForce.value) < 0.05) return '⚖️ つり合い静止中（浮力＝重力）'
  if (netForce.value > 0) return '⬆️ 浮上（浮力 ＞ 重力）'
  return '⬇️ 沈降（浮力 ＜ 重力）'
})

const stateBadgeClass = computed(() => {
  if (Math.abs(netForce.value) < 0.05) return 'badge-cyan'
  if (netForce.value > 0) return 'badge-yellow'
  return 'badge-rose'
})

function setPreset(type) {
  velY = 0
  if (type === 'wood') {
    objectDensity.value = 0.6
    fluidDensity.value = 1.0
    depthTop.value = 4.0
    isPlaying.value = true
  } else if (type === 'water') {
    objectDensity.value = 1.0
    fluidDensity.value = 1.0
    depthTop.value = 6.0
    isPlaying.value = true
  } else if (type === 'iron') {
    objectDensity.value = 1.8
    fluidDensity.value = 1.0
    depthTop.value = 0.0
    isPlaying.value = true
  }
}

function autoBalance() {
  velY = 0
  if (objectDensity.value >= fluidDensity.value) {
    depthTop.value = 18.0
  } else {
    const h_sub = (objectDensity.value / fluidDensity.value) * blockHeight
    depthTop.value = Number((-(blockHeight - h_sub)).toFixed(1))
  }
}

// 3D 空間スケール:
// 水面を y = +1.35 とし、1cm = 0.13 ワールド単位 (10cm 立方体 = 1.3 x 1.3 x 1.3)
const surfaceY = 1.35
const cmScale = 0.13
const cubeSize = blockHeight * cmScale // 1.3
const tankBottomY = surfaceY - 32 * cmScale // -2.81

function initThree() {
  if (!threeContainer.value) return
  let lastCamAspect = 0

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [5.2, 3.8, 9.6],
    initialTarget: [0, -0.5, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.18) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
      }
      stepPhysics(dt)
      updateThreeScene()
    }
  })

  const { scene } = threeCtx

  // 1. 床グリッド
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, tankBottomY - 0.12, 0)
  scene.add(grid)

  // 2. 3D 透明ガラス水槽 (幅 6.4, 高さ 4.8, 奥行 4.2)
  const tankW = 6.4
  const tankH = 4.8
  const tankD = 4.2
  const tankCenterY = tankBottomY + tankH / 2

  const tankBoxGeo = new THREE.BoxGeometry(tankW, tankH, tankD)
  const tankEdges = new THREE.EdgesGeometry(tankBoxGeo)
  const tankOutline = new THREE.LineSegments(
    tankEdges,
    new THREE.LineBasicMaterial({ color: 0x475569 })
  )
  tankOutline.position.set(0, tankCenterY, 0)
  scene.add(tankOutline)

  // 水槽底板
  const bottomPlate = new THREE.Mesh(
    new THREE.BoxGeometry(tankW + 0.1, 0.12, tankD + 0.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.3 })
  )
  bottomPlate.position.set(0, tankBottomY - 0.06, 0)
  scene.add(bottomPlate)

  // 3. 水ボリューム（半透明シアン）
  const waterH = surfaceY - tankBottomY
  const waterVolGeo = new THREE.BoxGeometry(tankW - 0.06, waterH, tankD - 0.06)
  const waterVolMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.24,
    roughness: 0.15,
    depthWrite: false
  })
  const waterVolMesh = new THREE.Mesh(waterVolGeo, waterVolMat)
  waterVolMesh.position.set(0, tankBottomY + waterH / 2, 0)
  scene.add(waterVolMesh)

  // 4. 波打つ水面メッシュ
  const surfGeo = new THREE.PlaneGeometry(tankW - 0.08, tankD - 0.08, 28, 18)
  surfGeo.rotateX(-Math.PI / 2)
  const surfMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.48,
    roughness: 0.1,
    metalness: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const surfMesh = new THREE.Mesh(surfGeo, surfMat)
  surfMesh.position.set(0, surfaceY, 0)
  scene.add(surfMesh)

  const surfLabel = createTextSprite('水面 h=0cm (ρ₀=1.00)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 32,
    scale: 0.46
  })
  surfLabel.position.set(2.25, surfaceY + 0.40, -1.95)
  scene.add(surfLabel)

  // 5. 3D 立方体ブロック (10cm x 10cm x 10cm)
  const blockGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
  const blockMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.35,
    metalness: 0.25
  })
  const blockMesh = new THREE.Mesh(blockGeo, blockMat)
  scene.add(blockMesh)

  const blockEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockGeo),
    new THREE.LineBasicMaterial({ color: 0xfef08a })
  )
  blockMesh.add(blockEdges)

  // 浸水部分ハイライトボックス
  const subBoxGeo = new THREE.BoxGeometry(cubeSize + 0.04, 1, cubeSize + 0.04)
  const subBoxMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  })
  const subBoxMesh = new THREE.Mesh(subBoxGeo, subBoxMat)
  scene.add(subBoxMesh)

  // 6. 水圧矢印（上面4本・下面4本）
  const topPressureArrows = []
  const botPressureArrows = []
  const cornerOffsets = [
    [-0.36, -0.36],
    [0.36, -0.36],
    [-0.36, 0.36],
    [0.36, 0.36]
  ]
  cornerOffsets.forEach(() => {
    const tArr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.032, headRadius: 0.1, headLength: 0.22 })
    const bArr = createVectorArrow3D({ color: 0x22d3ee, shaftRadius: 0.038, headRadius: 0.12, headLength: 0.26 })
    scene.add(tArr, bArr)
    topPressureArrows.push(tArr)
    botPressureArrows.push(bArr)
  })

  const labelP1 = createTextSprite('上面水圧 P₁S (下向き)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 30,
    scale: 0.46
  })
  const labelP2 = createTextSprite('下面水圧 P₂S (上向き・大！)', {
    color: '#67e8f9',
    borderColor: '#22d3ee',
    fontSize: 32,
    scale: 0.48
  })
  scene.add(labelP1, labelP2)

  // 7. 左側の合成力ベクトル (浮力 F_B と 重力 W)
  const arrowFB = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.38 })
  const arrowW = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.38 })
  scene.add(arrowFB, arrowW)

  const labelFB = createTextSprite('浮力 F_B', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 34,
    scale: 0.52
  })
  const labelW = createTextSprite('重力 W', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 34,
    scale: 0.52
  })
  scene.add(labelFB, labelW)

  sceneObjects = {
    surfGeo,
    surfLabel,
    blockMesh,
    blockMat,
    subBoxMesh,
    topPressureArrows,
    botPressureArrows,
    cornerOffsets,
    labelP1,
    labelP2,
    arrowFB,
    arrowW,
    labelFB,
    labelW
  }

  updateThreeScene()
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
}

function stepPhysics(dt) {
  waveTime += dt
  if (!isPlaying.value) return

  const massKg = (objectDensity.value * blockTotalVol) / 1000
  const damping = 3.2
  const fDown = -netForce.value - damping * (velY * 0.1)
  const accCm = (fDown / Math.max(0.1, massKg)) * 18

  velY += accCm * dt
  let nextDepth = depthTop.value + velY * dt

  if (nextDepth > 22.0) {
    nextDepth = 22.0
    velY = -velY * 0.2
    if (Math.abs(velY) < 0.5) velY = 0
  } else if (nextDepth < -8.0) {
    nextDepth = -8.0
    velY = 0
  }

  depthTop.value = Number(nextDepth.toFixed(2))
}

function updateThreeScene() {
  if (!sceneObjects) return
  const {
    surfGeo,
    surfLabel,
    blockMesh,
    blockMat,
    subBoxMesh,
    topPressureArrows,
    botPressureArrows,
    cornerOffsets,
    labelP1,
    labelP2,
    arrowFB,
    arrowW,
    labelFB,
    labelW
  } = sceneObjects

  // 1. 水面の波アニメーション
  const posAttr = surfGeo.getAttribute('position')
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i)
    const vz = posAttr.getZ(i)
    const waveY = Math.sin(vx * 1.4 + waveTime * 3.2) * 0.035 + Math.cos(vz * 1.6 + waveTime * 2.4) * 0.025
    posAttr.setY(i, waveY)
  }
  posAttr.needsUpdate = true
  surfGeo.computeVertexNormals()

  surfLabel.updateText(
    `水面 h=0cm (ρ₀=${fluidDensity.value.toFixed(2)})`,
    '#7dd3fc',
    '#38bdf8'
  )

  // 2. ブロックの3D位置と材質
  const topY = surfaceY - depthTop.value * cmScale
  const botY = topY - cubeSize
  const centerY = (topY + botY) / 2
  blockMesh.position.set(0.3, centerY, 0)

  if (objectDensity.value < fluidDensity.value - 0.02) {
    blockMat.color.setHex(0xd97706) // 木片カラー
    blockMat.metalness = 0.2
  } else if (Math.abs(objectDensity.value - fluidDensity.value) <= 0.02) {
    blockMat.color.setHex(0x0d9488) // 中立浮力カラー
    blockMat.metalness = 0.35
  } else {
    blockMat.color.setHex(0x64748b) // 金属カラー
    blockMat.metalness = 0.75
  }

  // 浸水ハイライト
  const subH = submergedDepth.value * cmScale
  if (subH > 0.02) {
    subBoxMesh.visible = true
    subBoxMesh.scale.set(1, subH, 1)
    subBoxMesh.position.set(0.3, botY + subH / 2, 0)
  } else {
    subBoxMesh.visible = false
  }

  // 3. 上面・下面の水圧矢印
  if (depthTop.value > 0.2) {
    const p1Len = Math.min(1.15, Math.max(0.28, depthTop.value * 0.055 * fluidDensity.value))
    topPressureArrows.forEach((arr, idx) => {
      const [ox, oz] = cornerOffsets[idx]
      arr.setVector(
        new THREE.Vector3(0.3 + ox, topY + p1Len, oz),
        new THREE.Vector3(0, -1, 0),
        p1Len
      )
    })
    labelP1.visible = true
    labelP1.position.set(1.95, topY + 0.16, -0.75)
  } else {
    topPressureArrows.forEach(arr => { arr.visible = false })
    labelP1.visible = false
  }

  const depthBottom = depthTop.value + blockHeight
  if (depthBottom > 0.2) {
    const p2Len = Math.min(1.35, Math.max(0.34, depthBottom * 0.048 * fluidDensity.value))
    botPressureArrows.forEach((arr, idx) => {
      const [ox, oz] = cornerOffsets[idx]
      arr.setVector(
        new THREE.Vector3(0.3 + ox, botY - p2Len, oz),
        new THREE.Vector3(0, 1, 0),
        p2Len
      )
    })
    labelP2.visible = true
    labelP2.position.set(2.05, botY - 0.32, 1.05)
  } else {
    botPressureArrows.forEach(arr => { arr.visible = false })
    labelP2.visible = false
  }

  // 4. 左側に浮力 F_B と 重力 W の 3D ベクトルを並べて表示 (上面視点でも z 分離)
  const fScale = 0.135
  const refOrigin = new THREE.Vector3(-1.85, centerY, 0.15)

  const fbVal = buoyancyForce.value
  const fbLen = fbVal * fScale
  if (fbLen > 0.05) {
    arrowFB.setVector(refOrigin, new THREE.Vector3(0, 1, 0), fbLen)
    labelFB.visible = true
    labelFB.updateText(`浮力 F_B = ${fbVal.toFixed(2)} N`, '#7dd3fc', '#38bdf8')
    labelFB.position.set(-1.85, centerY + fbLen + 0.35, -0.85)
  } else {
    arrowFB.visible = false
    labelFB.visible = false
  }

  const wVal = gravityForce.value
  const wLen = wVal * fScale
  arrowW.setVector(refOrigin, new THREE.Vector3(0, -1, 0), wLen)
  labelW.updateText(`重力 W = ${wVal.toFixed(2)} N`, '#fde68a', '#f59e0b')
  labelW.position.set(-1.85, centerY - wLen - 0.35, 1.05)
}

watch([depthTop, objectDensity, fluidDensity], () => {
  updateThreeScene()
})

onMounted(() => {
  initThree()
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
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  font-family: 'Outfit', system-ui, sans-serif;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}
.sim-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
}
.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}
.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.badge-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
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
  color: #38bdf8;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
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
  gap: 12px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.76rem;
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
.dot-fb { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-w { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-p { background: #22d3ee; box-shadow: 0 0 6px #22d3ee; }
.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.74rem;
  color: #cbd5e1;
  pointer-events: none;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}
.stat-card.highlight {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
}
.stat-label {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}
.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}
.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }
.controls-panel {
  margin-top: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}
.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}
.control-val {
  color: #38bdf8;
  font-family: monospace;
}
.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.sim-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sim-btn.primary {
  background: #0284c7;
  color: #ffffff;
  border: none;
}
.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: none;
}
.sim-btn.outline {
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  border: 1px solid #475569;
}
.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}
@media (max-width: 768px) {
  .sim-container {
    padding: 12px;
  }
  .three-viewport-wrap {
    height: 345px;
  }
  .three-hud-legend {
    top: 8px;
    left: 8px;
    right: 8px;
    max-width: calc(100% - 16px);
    padding: 3px 7px;
    gap: 6px;
    font-size: 0.65rem;
  }
  .three-hud-hint {
    font-size: 0.66rem;
    padding: 3px 8px;
  }
}
</style>
