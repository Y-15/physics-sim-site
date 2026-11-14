<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧪</span>
        <h3>3D 気体の混合・可動ピストンのつり合いシミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
        <div class="mode-badge">
          {{ mode === 'valve' ? (isValveOpen ? 'コック開通 (混合・拡散中)' : 'コック閉 (断熱分離)') : '可動ピストン (圧力平衡)' }}
        </div>
      </div>
      <p class="subtitle">
        断熱容器内での気体混合（内部エネルギー保存則とドルトンの分圧則）および可動ピストンで仕切られた2気体の力学的つり合い（<i>P</i><sub><i>A</i></sub> = <i>P</i><sub><i>B</i></sub>）を3D空間でリアルタイムに体験できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面 (fov=14)
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面 (fov=14)
        </button>
      </div>
      <div v-if="mode === 'piston'" class="preset-group">
        <button class="chip-btn" :class="{ active: showVectors }" @click="showVectors = !showVectors">
          {{ showVectors ? '🏹 圧力ベクトル: ON' : '🏹 圧力ベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isRunning = !isRunning" style="padding: 6px 14px; border-radius: 8px;">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="btn btn-secondary" @click="stepSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.84rem;">
        ⏭ コマ送り
      </button>
      <button class="btn btn-secondary" @click="resetDefaults" style="padding: 6px 12px; border-radius: 8px; font-size: 0.84rem;">
        🔄 リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-a"></i>A種 ({{ nA.toFixed(1) }}mol)</span>
          <span class="legend-item"><i class="dot-b"></i>B種 ({{ nB.toFixed(1) }}mol)</span>
          <span class="legend-item"><i class="dot-cold"></i>低温 → <i class="dot-mid"></i> → <i class="dot-hot"></i>高温</span>
          <span v-if="mode === 'piston'" class="legend-item"><i class="dot-eq"></i>圧力ベクトル</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          {{ mode === 'valve' ? '🖱️ 3D回転 ・ 仕切り弁クリックで開閉' : '🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小' }}
        </div>
      </div>
    </div>

    <!-- 非重複ステータスストリップ -->
    <div class="mode-status-strip">
      <span v-if="mode === 'valve'" class="three-ortho-badge" :class="{ active: isValveOpen }">
        {{ isValveOpen
          ? `🔓 混合拡散中 (${Math.round(mixAlpha * 100)}%) → T_mix = ${mixedT.toFixed(1)} K, P_mix = ${mixedP.toFixed(1)} kPa`
          : `🔒 断熱分離: A室 (${TA}K, ${PA.toFixed(0)}kPa) | B室 (${TB}K, ${PB.toFixed(0)}kPa)` }}
      </span>
      <span v-else class="three-ortho-badge" :class="{ active: Math.abs(PA - PB) < 1 }">
        {{ Math.abs(PA - PB) < 1
          ? `⚖️ 力学的つり合い成立: P_A = P_B = ${PA.toFixed(1)} kPa (VA:VB = ${VA_ratio.toFixed(1)}:${(10 - VA_ratio).toFixed(1)})`
          : `↔️ 圧力差あり: P_A = ${PA.toFixed(1)} kPa vs P_B = ${PB.toFixed(1)} kPa` }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>シミュレーション方式:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: mode === 'valve' }" @click="switchMode('valve')">
                コック開通・混合
              </button>
              <button class="select-btn" :class="{ active: mode === 'piston' }" @click="switchMode('piston')">
                可動ピストン仕切り
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>気体A 温度 <i>T</i><sub><i>A</i></sub>: <strong>{{ TA }} K</strong></span>
            <input type="range" v-model.number="TA" min="200" max="600" step="20" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>気体B 温度 <i>T</i><sub><i>B</i></sub>: <strong>{{ TB }} K</strong></span>
            <input type="range" v-model.number="TB" min="200" max="600" step="20" @input="updatePhysics" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>物質量比 <i>n</i><sub><i>A</i></sub> : <i>n</i><sub><i>B</i></sub>: <strong>{{ nA.toFixed(1) }} : {{ nB.toFixed(1) }} mol</strong></span>
            <input type="range" v-model.number="nA" min="0.5" max="3.0" step="0.5" @input="updatePhysics" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button v-if="mode === 'valve'" class="btn btn-primary" @click="toggleValve">
          {{ isValveOpen ? '🔒 コックを閉じる (リセット)' : '🔓 コックを開く (気体混合!)' }}
        </button>
        <button v-else class="btn btn-primary" @click="balancePiston">
          ⚖️ ピストンを滑らかにつり合わせる
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 初期状態に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label" v-if="mode === 'valve' && isValveOpen">混合後温度 <i>T</i></span>
        <span class="label" v-else>気体A 圧力 <i>P</i><sub><i>A</i></sub></span>
        <span class="value">{{ mode === 'valve' && isValveOpen ? mixedT.toFixed(1) + ' K' : PA.toFixed(1) + ' kPa' }}</span>
        <span class="subtext">{{ mode === 'valve' && isValveOpen ? '(nA TA + nB TB) / (nA+nB)' : 'nA R TA / VA' }}</span>
      </div>

      <div class="stat-card">
        <span class="label" v-if="mode === 'valve' && isValveOpen">全圧 <i>P</i><sub>total</sub></span>
        <span class="label" v-else>気体B 圧力 <i>P</i><sub><i>B</i></sub></span>
        <span class="value" :class="{ highlight: mode === 'piston' && Math.abs(PA - PB) < 1 }">
          {{ mode === 'valve' && isValveOpen ? mixedP.toFixed(1) + ' kPa' : PB.toFixed(1) + ' kPa' }}
        </span>
        <span class="subtext">{{ mode === 'piston' ? (Math.abs(PA - PB) < 1 ? '力学的つり合い成立' : '圧力不均衡') : '分圧の和 PA + PB' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">内部エネルギー総和 <i>U</i></span>
        <span class="value">{{ (totalU / 1000).toFixed(2) }} <span class="unit">kJ</span></span>
        <span class="subtext">断熱系により完全保存！</span>
      </div>

      <div class="stat-card">
        <span class="label">体積比 <i>V</i><sub><i>A</i></sub> : <i>V</i><sub><i>B</i></sub></span>
        <span class="value">{{ VA_ratio.toFixed(1) }} : {{ (10 - VA_ratio).toFixed(1) }}</span>
        <span class="subtext">全容積 V = 10.0 L</span>
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
let lastIsMob = false

const mode = ref('valve') // 'valve' or 'piston'
const isValveOpen = ref(false)
const activeCam = ref('3d')
const showVectors = ref(true)
const isRunning = ref(true)
const timeScale = ref(1.0)
const mixAlpha = ref(0) // 0 = 分離直後, 1 = 完全熱平衡 (T_mix, P_mix)

const TA = ref(450) // K
const TB = ref(250) // K
const nA = ref(1.0) // mol
const nB = ref(1.0) // mol
const R = 8.31 // J/(mol*K)

// 体積比 (全体10LのうちA室の体積)
const VA_ratio = ref(5.0) // 0 to 10
let visualVA = 5.0
const totalV_L = 10.0

// 各室の体積 [m^3]
const VA_m3 = computed(() => (VA_ratio.value / 1000))
const VB_m3 = computed(() => ((totalV_L - VA_ratio.value) / 1000))

// 圧力 [kPa]
const PA = computed(() => (nA.value * R * TA.value / VA_m3.value) / 1000)
const PB = computed(() => (nB.value * R * TB.value / VB_m3.value) / 1000)

// 内部エネルギー総和 U = (3/2) nA R TA + (3/2) nB R TB
const totalU = computed(() => 1.5 * nA.value * R * TA.value + 1.5 * nB.value * R * TB.value)

// コック開通時の混合温度 T_mix
const mixedT = computed(() => (nA.value * TA.value + nB.value * TB.value) / (nA.value + nB.value))

// コック開通時の全圧 P_mix
const mixedP = computed(() => {
  const totalMol = nA.value + nB.value
  const totalM3 = totalV_L / 1000
  return (totalMol * R * mixedT.value / totalM3) / 1000
})

// ==========================================================
// カメラ & モバイルスケール
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(2.25, Math.max(1.42, 1.82 / Math.max(0.68, aspect))) : 1.0
}

function isMobileViewport() {
  if (!threeContainer.value) return false
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  return w / Math.max(1, h) < 1.35
}

function getCamParams(preset) {
  const s = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.25, 38.0 * s], target: [0, 0.2, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 38.0 * s, 0.05], target: [0, 0.1, 0], fov: 14 }
  }
  return { pos: [0.3 * s, 4.7 * s, 12.6 * s], target: [0, 0.2, 0], fov: 40 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.46) {
  const mob = isMobileViewport()
  const targetH = mob ? baseScale * 1.58 : baseScale
  const sig = `${textStr}|${color}|${borderColor}`
  if (labelCache.get(sprite) !== sig) {
    labelCache.set(sprite, sig)
    sprite.updateText(textStr, color, borderColor)
  }
  const curAspect = sprite.scale.x / Math.max(0.01, sprite.scale.y)
  if (Math.abs(sprite.scale.y - targetH) > 0.004) {
    sprite.scale.set(targetH * curAspect, targetH, 1)
  }
}

const COL_COLD = new THREE.Color(0x38bdf8)
const COL_MID = new THREE.Color(0x10b981)
const COL_WARM = new THREE.Color(0xf97316)
const COL_HOT = new THREE.Color(0xef4444)

function speedTempColor(norm, outColor = new THREE.Color()) {
  const u = Math.min(1, Math.max(0, norm))
  if (u < 0.42) outColor.copy(COL_COLD).lerp(COL_MID, u / 0.42)
  else if (u < 0.78) outColor.copy(COL_MID).lerp(COL_WARM, (u - 0.42) / 0.36)
  else outColor.copy(COL_WARM).lerp(COL_HOT, (u - 0.78) / 0.22)
  return outColor
}

// ==========================================================
// 操作アクション (既存UI全保持)
// ==========================================================
const switchMode = (m) => {
  mode.value = m
  isValveOpen.value = false
  mixAlpha.value = 0
  VA_ratio.value = 5.0
  visualVA = 5.0
  resetParticlePositions()
  syncLabels()
}

const toggleValve = () => {
  isValveOpen.value = !isValveOpen.value
  mixAlpha.value = 0
  if (!isValveOpen.value) {
    resetParticlePositions()
  }
  syncLabels()
}

const balancePiston = () => {
  const ratio = (nA.value * TA.value) / (nB.value * TB.value)
  const newVA = (ratio / (1 + ratio)) * totalV_L
  VA_ratio.value = Math.min(8.5, Math.max(1.5, Math.round(newVA * 10) / 10))
  syncLabels()
}

const resetDefaults = () => {
  TA.value = 450
  TB.value = 250
  nA.value = 1.0
  isValveOpen.value = false
  mixAlpha.value = 0
  VA_ratio.value = 5.0
  visualVA = 5.0
  isRunning.value = true
  resetParticlePositions()
  syncLabels()
}

const updatePhysics = () => {
  if (mode.value === 'valve' && isValveOpen.value) {
    mixAlpha.value = Math.min(mixAlpha.value, 0.2)
  }
  syncLabels()
}

function stepSim() {
  isRunning.value = false
  updateFrame(0.06 * timeScale.value, true)
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
let sceneObjs = null
const MAX_SPECIES = 48

function createGaugeUnit(xPos, yPos, zPos, accentHex) {
  const g = new THREE.Group()
  g.position.set(xPos, yPos, zPos)

  // 接続パイプ
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.42, 12),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.25 })
  )
  pipe.position.y = -0.38
  g.add(pipe)

  // 圧力ダイアルケース
  const dialCase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.14, 28).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.25 })
  )
  dialCase.position.set(-0.18, 0, 0)
  g.add(dialCase)

  const dialFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 28),
    new THREE.MeshBasicMaterial({ color: 0x090d16 })
  )
  dialFace.position.set(-0.18, 0, 0.075)
  g.add(dialFace)

  const dialArc = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.32, 24, 1, Math.PI * 0.15, Math.PI * 1.4),
    new THREE.MeshBasicMaterial({ color: accentHex, side: THREE.DoubleSide })
  )
  dialArc.position.set(-0.18, 0, 0.08)
  g.add(dialArc)

  const needlePivot = new THREE.Group()
  needlePivot.position.set(-0.18, 0, 0.09)
  needlePivot.add(
    new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.27, 0.02).translate(0, 0.11, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a })),
    new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }))
  )
  g.add(needlePivot)

  // 縦型温度計バー
  const thermBg = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.76, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 })
  )
  thermBg.position.set(0.38, 0, 0)
  g.add(thermBg)

  const thermGeo = new THREE.BoxGeometry(0.11, 1.0, 0.09)
  thermGeo.translate(0, 0.5, 0)
  const thermMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.65
  })
  const thermFill = new THREE.Mesh(thermGeo, thermMat)
  thermFill.position.set(0.38, -0.34, 0.01)
  g.add(thermFill)

  return { group: g, needlePivot, thermFill, thermMat }
}

function resetParticlePositions() {
  if (!sceneObjs) return
  const { molDataA, molDataB, halfW, halfH, halfD } = sceneObjs
  const pX = ((visualVA / totalV_L) - 0.5) * (halfW * 2)

  molDataA.forEach((m) => {
    m.x = -halfW + 0.26 + Math.random() * Math.max(0.5, pX - (-halfW) - 0.52)
    m.y = (Math.random() - 0.5) * (halfH * 1.66)
    m.z = (Math.random() - 0.5) * (halfD * 1.66)
    m.tempCur = TA.value
  })
  molDataB.forEach((m) => {
    m.x = pX + 0.26 + Math.random() * Math.max(0.5, halfW - pX - 0.52)
    m.y = (Math.random() - 0.5) * (halfH * 1.66)
    m.z = (Math.random() - 0.5) * (halfD * 1.66)
    m.tempCur = TB.value
  })
}

let pointerDownPos = null
function onPointerDown(e) {
  pointerDownPos = { x: e.clientX, y: e.clientY }
}
function onPointerUp(e) {
  if (!pointerDownPos || mode.value !== 'valve' || !threeCtx || !sceneObjs) return
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y)
  pointerDownPos = null
  if (dist > 6) return

  const rect = threeCtx.renderer.domElement.getBoundingClientRect()
  const ndc = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndc, threeCtx.camera)
  const hits = raycaster.intersectObjects([sceneObjs.gateDoor, sceneObjs.valveHandle], true)
  if (hits.length > 0) {
    toggleValve()
  }
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 160,
    onFrame: (dt) => {
      if (isRunning.value) {
        updateFrame(dt * timeScale.value, false)
      } else {
        updateFrame(0, true)
      }
    }
  })

  threeCtx.renderer.domElement.addEventListener('pointerdown', onPointerDown)
  threeCtx.renderer.domElement.addEventListener('pointerup', onPointerUp)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        syncLabels()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.35, 0)
  scene.add(floorGrid)

  const chamberGroup = new THREE.Group()
  chamberGroup.position.set(0, 0.0, 0)
  scene.add(chamberGroup)

  const boxW = 9.0
  const boxH = 3.1
  const boxD = 3.1
  const halfW = boxW / 2
  const halfH = boxH / 2
  const halfD = boxD / 2

  // 1. 断熱ガラスツイン容器外壁 (depthWrite: false, renderOrder: 0)
  const outerGeo = new THREE.BoxGeometry(boxW, boxH, boxD)
  const outerMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.05,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const outerGlass = new THREE.Mesh(outerGeo, outerMat)
  outerGlass.renderOrder = 0
  chamberGroup.add(outerGlass)

  const outerEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(outerGeo),
    new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.78 })
  )
  chamberGroup.add(outerEdges)

  // 断熱材レールフレーム (上下前後エッジに断熱フレーム表現)
  const insMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.55, roughness: 0.35 })
  const railGeo = new THREE.BoxGeometry(boxW + 0.18, 0.14, 0.14)
  ;[
    [halfH, halfD],
    [halfH, -halfD],
    [-halfH, halfD],
    [-halfH, -halfD]
  ].forEach(([ry, rz]) => {
    const rail = new THREE.Mesh(railGeo, insMat)
    rail.position.set(0, ry, rz)
    chamberGroup.add(rail)
  })

  // 左右室の内部温度ボリュームグロー (depthWrite: false, renderOrder: 0)
  const glowGeoA = new THREE.BoxGeometry(1.0, boxH - 0.1, boxD - 0.1)
  glowGeoA.translate(0.5, 0, 0)
  const glowMatA = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.08, depthWrite: false })
  const glowMeshA = new THREE.Mesh(glowGeoA, glowMatA)
  glowMeshA.position.set(-halfW + 0.05, 0, 0)
  glowMeshA.renderOrder = 0

  const glowGeoB = new THREE.BoxGeometry(1.0, boxH - 0.1, boxD - 0.1)
  glowGeoB.translate(-0.5, 0, 0)
  const glowMatB = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08, depthWrite: false })
  const glowMeshB = new THREE.Mesh(glowGeoB, glowMatB)
  glowMeshB.position.set(halfW - 0.05, 0, 0)
  glowMeshB.renderOrder = 0
  chamberGroup.add(glowMeshA, glowMeshB)

  // 2. モード1: 断熱仕切り壁＋インタラクティブ・スライドコック弁 (x = 0)
  const valveWallGroup = new THREE.Group()
  chamberGroup.add(valveWallGroup)

  const wallFrameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.65, roughness: 0.3 })
  const topWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.78, boxD - 0.06), wallFrameMat)
  topWall.position.set(0, halfH - 0.39, 0)
  const botWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.78, boxD - 0.06), wallFrameMat)
  botWall.position.set(0, -halfH + 0.39, 0)
  const frontPillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.54, 0.45), wallFrameMat)
  frontPillar.position.set(0, 0, halfD - 0.25)
  const backPillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.54, 0.45), wallFrameMat)
  backPillar.position.set(0, 0, -halfD + 0.25)
  valveWallGroup.add(topWall, botWall, frontPillar, backPillar)

  const gateDoorMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.25,
    transparent: true,
    opacity: 0.88,
    depthWrite: false
  })
  const gateDoor = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.54, boxD - 0.96), gateDoorMat)
  gateDoor.renderOrder = 0
  valveWallGroup.add(gateDoor)

  // コック開閉ハンドル（上部）
  const valveHandle = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.05, 10, 24),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.35, metalness: 0.5 })
  )
  valveHandle.position.set(0, halfH + 0.35, 0)
  valveWallGroup.add(valveHandle)

  // 3. モード2: 可動ピストン仕切り板 + ガイドロッド + 圧力ベクトル矢印
  const pistonWallGroup = new THREE.Group()
  chamberGroup.add(pistonWallGroup)

  const pistonSlab = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, boxH - 0.08, boxD - 0.08),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 })
  )
  pistonWallGroup.add(pistonSlab)

  const pistonSeal = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, boxH - 0.04, boxD - 0.04),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.3 })
  )
  pistonWallGroup.add(pistonSeal)

  const arrowPA = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.06, headRadius: 0.18, headLength: 0.38 })
  const arrowPB = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.06, headRadius: 0.18, headLength: 0.38 })
  chamberGroup.add(arrowPA, arrowPB)

  // 4. 気体A & B 粒子 (InstancedMesh: 温度色コア + 化学種識別リング)
  const molSphereGeo = new THREE.SphereGeometry(0.098, 14, 14)
  const molSphereMatA = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
  const molSphereMatB = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
  const instA = new THREE.InstancedMesh(molSphereGeo, molSphereMatA, MAX_SPECIES)
  const instB = new THREE.InstancedMesh(molSphereGeo, molSphereMatB, MAX_SPECIES)
  instA.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  instB.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  chamberGroup.add(instA, instB)

  const ringGeo = new THREE.TorusGeometry(0.135, 0.022, 8, 20)
  const ringA = new THREE.InstancedMesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }), MAX_SPECIES)
  const ringB = new THREE.InstancedMesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }), MAX_SPECIES)
  ringA.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  ringB.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  chamberGroup.add(ringA, ringB)

  const molDataA = []
  const molDataB = []
  const dummy = new THREE.Object3D()

  for (let i = 0; i < MAX_SPECIES; i++) {
    const sampleVel = () => {
      const u1 = Math.random(), u2 = Math.random(), u3 = Math.random(), u4 = Math.random()
      const vx = Math.sqrt(-2 * Math.log(u1 + 1e-6)) * Math.cos(2 * Math.PI * u2)
      const vy = Math.sqrt(-2 * Math.log(u1 + 1e-6)) * Math.sin(2 * Math.PI * u2)
      const vz = Math.sqrt(-2 * Math.log(u3 + 1e-6)) * Math.cos(2 * Math.PI * u4)
      return { vx, vy, vz, baseSpeed: Math.hypot(vx, vy, vz) }
    }
    const va = sampleVel()
    molDataA.push({ x: -2, y: 0, z: 0, ...va, tempCur: TA.value })
    const vb = sampleVel()
    molDataB.push({ x: 2, y: 0, z: 0, ...vb, tempCur: TB.value })
  }

  // 5. ライブ 3D 圧力・温度計ゲージ (A室・B室上部)
  const gaugeA = createGaugeUnit(-2.55, halfH + 0.56, 0.35, 0x38bdf8)
  const gaugeB = createGaugeUnit(2.55, halfH + 0.56, 0.35, 0xf59e0b)
  chamberGroup.add(gaugeA.group, gaugeB.group)

  // 6. 3D ラベルスプライト (3D / 正面 / 上面 全視点で非重複配置)
  const labelLeft = createTextSprite('A室', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.45 })
  labelLeft.position.set(-2.55, halfH + 1.38, -0.55)
  chamberGroup.add(labelLeft)

  const labelRight = createTextSprite('B室', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.45 })
  labelRight.position.set(2.55, halfH + 1.38, 0.55)
  chamberGroup.add(labelRight)

  const labelCenter = createTextSprite('🔒 隔壁コック閉鎖', { color: '#fca5a5', borderColor: '#ef4444', fontSize: 32, scale: 0.46 })
  labelCenter.position.set(0, -halfH - 0.62, 0.85)
  chamberGroup.add(labelCenter)

  sceneObjs = {
    halfW,
    halfH,
    halfD,
    glowMeshA,
    glowMatA,
    glowMeshB,
    glowMatB,
    valveWallGroup,
    gateDoor,
    valveHandle,
    pistonWallGroup,
    arrowPA,
    arrowPB,
    instA,
    instB,
    ringA,
    ringB,
    molDataA,
    molDataB,
    dummy,
    gaugeA,
    gaugeB,
    labelLeft,
    labelRight,
    labelCenter
  }

  resetParticlePositions()
  syncLabels()
  updateFrame(0, true)
}

function syncLabels() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const { labelLeft, labelRight, labelCenter } = sceneObjs

  if (mode.value === 'valve') {
    if (isValveOpen.value) {
      const curTA = TA.value + (mixedT.value - TA.value) * mixAlpha.value
      const curTB = TB.value + (mixedT.value - TB.value) * mixAlpha.value
      const curP = PA.value + (mixedP.value - PA.value) * mixAlpha.value
      const curPB = PB.value + (mixedP.value - PB.value) * mixAlpha.value
      updateLabelCached(
        labelLeft,
        mob ? `A室 T=${curTA.toFixed(0)}K` : `A室: T=${curTA.toFixed(0)}K, P=${curP.toFixed(0)}kPa`,
        '#7dd3fc', '#38bdf8', 0.44
      )
      updateLabelCached(
        labelRight,
        mob ? `B室 T=${curTB.toFixed(0)}K` : `B室: T=${curTB.toFixed(0)}K, P=${curPB.toFixed(0)}kPa`,
        '#fde68a', '#f59e0b', 0.44
      )
      updateLabelCached(
        labelCenter,
        mob ? `🔓 混合中 T_mix=${mixedT.value.toFixed(0)}K` : `🔓 コック開通: T_mix = ${mixedT.value.toFixed(1)} K, P_mix = ${mixedP.value.toFixed(1)} kPa`,
        '#6ee7b7', '#10b981', 0.44
      )
    } else {
      updateLabelCached(
        labelLeft,
        mob ? `A室 ${TA.value}K ${PA.value.toFixed(0)}kPa` : `A室: TA=${TA.value}K, PA=${PA.value.toFixed(0)}kPa`,
        '#7dd3fc', '#38bdf8', 0.44
      )
      updateLabelCached(
        labelRight,
        mob ? `B室 ${TB.value}K ${PB.value.toFixed(0)}kPa` : `B室: TB=${TB.value}K, PB=${PB.value.toFixed(0)}kPa`,
        '#fde68a', '#f59e0b', 0.44
      )
      updateLabelCached(
        labelCenter,
        mob ? '🔒 隔壁閉鎖 (クリックで開く)' : '🔒 隔壁コック閉鎖 (断熱分離・クリックで開閉)',
        '#fca5a5', '#ef4444', 0.44
      )
    }
  } else {
    updateLabelCached(
      labelLeft,
      mob ? `A室 VA=${VA_ratio.value.toFixed(1)}L PA=${PA.value.toFixed(0)}` : `A室 (VA=${VA_ratio.value.toFixed(1)}L, PA=${PA.value.toFixed(0)}kPa)`,
      '#7dd3fc', '#38bdf8', 0.44
    )
    updateLabelCached(
      labelRight,
      mob ? `B室 VB=${(10 - VA_ratio.value).toFixed(1)}L PB=${PB.value.toFixed(0)}` : `B室 (VB=${(10 - VA_ratio.value).toFixed(1)}L, PB=${PB.value.toFixed(0)}kPa)`,
      '#fde68a', '#f59e0b', 0.44
    )
    const eq = Math.abs(PA.value - PB.value) < 1.5
    updateLabelCached(
      labelCenter,
      eq ? '⚖️ 力学的つり合い成立 (PA = PB)' : '↔️ 圧力不均衡 (つり合いボタンで移動)',
      eq ? '#6ee7b7' : '#fde68a',
      eq ? '#10b981' : '#f59e0b',
      0.44
    )
  }
}

const workCol = new THREE.Color()
function updateGaugeVisual(gauge, pressureKpa, tempK) {
  const pFrac = Math.min(1, Math.max(0, pressureKpa / 600))
  gauge.needlePivot.rotation.z = Math.PI * 0.7 - pFrac * Math.PI * 1.4

  const tNorm = Math.min(1, Math.max(0, (tempK - 180) / 460))
  gauge.thermFill.scale.y = Math.max(0.08, 0.1 + tNorm * 0.60)
  speedTempColor(tNorm, workCol)
  gauge.thermMat.color.copy(workCol)
  gauge.thermMat.emissive.copy(workCol)
}

function updateFrame(dt, forceMatrix = false) {
  if (!sceneObjs) return
  const {
    halfW,
    halfH,
    halfD,
    glowMeshA,
    glowMatA,
    glowMeshB,
    glowMatB,
    valveWallGroup,
    gateDoor,
    valveHandle,
    pistonWallGroup,
    arrowPA,
    arrowPB,
    instA,
    instB,
    ringA,
    ringB,
    molDataA,
    molDataB,
    dummy,
    gaugeA,
    gaugeB,
    labelLeft,
    labelRight
  } = sceneObjs

  const limitY = halfH - 0.16
  const limitZ = halfD - 0.16
  const stepDt = forceMatrix ? dt : dt

  if (mode.value === 'valve') {
    valveWallGroup.visible = true
    pistonWallGroup.visible = false
    arrowPA.visible = false
    arrowPB.visible = false

    // コック開通時の熱平衡進行 (mixAlpha: 0 -> 1)
    if (isValveOpen.value && stepDt > 0) {
      const prevPct = Math.round(mixAlpha.value * 20)
      mixAlpha.value = Math.min(1, mixAlpha.value + stepDt * 0.28)
      if (Math.round(mixAlpha.value * 20) !== prevPct) {
        syncLabels()
      }
    }

    // ゲートドア昇降 & ハンドル色更新
    const targetGateY = isValveOpen.value ? 1.54 : 0.0
    gateDoor.position.y += (targetGateY - gateDoor.position.y) * Math.min(1, Math.max(0.08, stepDt * 8))
    gateDoor.material.opacity = isValveOpen.value ? 0.25 : 0.88
    gateDoor.material.color.setHex(isValveOpen.value ? 0x10b981 : 0xef4444)
    gateDoor.material.emissive.setHex(isValveOpen.value ? 0x059669 : 0xdc2626)
    valveHandle.material.color.setHex(isValveOpen.value ? 0x10b981 : 0xef4444)
    valveHandle.material.emissive.setHex(isValveOpen.value ? 0x059669 : 0xdc2626)
    valveHandle.rotation.z += ((isValveOpen.value ? Math.PI * 0.5 : 0) - valveHandle.rotation.z) * 0.18

    // グロー領域: 左右半分ずつ
    glowMeshA.position.x = -halfW + 0.05
    glowMeshA.scale.x = halfW - 0.08
    glowMeshB.position.x = halfW - 0.05
    glowMeshB.scale.x = halfW - 0.08

    const effTA = isValveOpen.value ? TA.value + (mixedT.value - TA.value) * mixAlpha.value : TA.value
    const effTB = isValveOpen.value ? TB.value + (mixedT.value - TB.value) * mixAlpha.value : TB.value
    const effPA = isValveOpen.value ? PA.value + (mixedP.value - PA.value) * mixAlpha.value : PA.value
    const effPB = isValveOpen.value ? PB.value + (mixedP.value - PB.value) * mixAlpha.value : PB.value

    speedTempColor((effTA - 180) / 460, glowMatA.color)
    speedTempColor((effTB - 180) / 460, glowMatB.color)
    updateGaugeVisual(gaugeA, effPA, effTA)
    updateGaugeVisual(gaugeB, effPB, effTB)

    gaugeA.group.position.x = -2.55
    gaugeB.group.position.x = 2.55
    labelLeft.position.x = -2.55
    labelRight.position.x = 2.55

    const activeA = Math.min(MAX_SPECIES, Math.round(nA.value * 14))
    const activeB = Math.min(MAX_SPECIES, Math.round(nB.value * 14))

    for (let i = 0; i < MAX_SPECIES; i++) {
      const m = molDataA[i]
      if (i >= activeA) {
        dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.001); dummy.updateMatrix()
        instA.setMatrixAt(i, dummy.matrix); ringA.setMatrixAt(i, dummy.matrix)
        continue
      }
      const targetT = isValveOpen.value ? effTA : TA.value
      m.tempCur += (targetT - m.tempCur) * Math.min(1, stepDt * 3 + 0.04)
      const spd = Math.sqrt(m.tempCur / 300) * 1.45

      if (stepDt > 0) {
        m.x += m.vx * spd * stepDt
        m.y += m.vy * spd * stepDt
        m.z += m.vz * spd * stepDt

        const minX = -halfW + 0.16
        const maxX = isValveOpen.value ? halfW - 0.16 : -0.18
        if (m.x < minX) { m.x = minX; m.vx = Math.abs(m.vx) }
        if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx) }
        // 仕切り壁(x≈0)の上下枠衝突 (開通時でも開口部外は反射)
        if (isValveOpen.value && Math.abs(m.x) < 0.18 && (Math.abs(m.y) > 0.72 || Math.abs(m.z) > 1.0)) {
          m.x = m.x < 0 ? -0.19 : 0.19
          m.vx *= -1
        }
        if (m.y > limitY) { m.y = limitY; m.vy *= -1 }
        if (m.y < -limitY) { m.y = -limitY; m.vy *= -1 }
        if (m.z > limitZ) { m.z = limitZ; m.vz *= -1 }
        if (m.z < -limitZ) { m.z = -limitZ; m.vz *= -1 }
      }

      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(1.0)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      instA.setMatrixAt(i, dummy.matrix)
      ringA.setMatrixAt(i, dummy.matrix)

      const tNorm = ((m.baseSpeed * Math.sqrt(m.tempCur / 300)) - 0.75) / 2.25
      speedTempColor(tNorm, workCol)
      instA.setColorAt(i, workCol)
    }

    for (let i = 0; i < MAX_SPECIES; i++) {
      const m = molDataB[i]
      if (i >= activeB) {
        dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.001); dummy.updateMatrix()
        instB.setMatrixAt(i, dummy.matrix); ringB.setMatrixAt(i, dummy.matrix)
        continue
      }
      const targetT = isValveOpen.value ? effTB : TB.value
      m.tempCur += (targetT - m.tempCur) * Math.min(1, stepDt * 3 + 0.04)
      const spd = Math.sqrt(m.tempCur / 300) * 1.45

      if (stepDt > 0) {
        m.x += m.vx * spd * stepDt
        m.y += m.vy * spd * stepDt
        m.z += m.vz * spd * stepDt

        const minX = isValveOpen.value ? -halfW + 0.16 : 0.18
        const maxX = halfW - 0.16
        if (m.x < minX) { m.x = minX; m.vx = Math.abs(m.vx) }
        if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx) }
        if (isValveOpen.value && Math.abs(m.x) < 0.18 && (Math.abs(m.y) > 0.72 || Math.abs(m.z) > 1.0)) {
          m.x = m.x < 0 ? -0.19 : 0.19
          m.vx *= -1
        }
        if (m.y > limitY) { m.y = limitY; m.vy *= -1 }
        if (m.y < -limitY) { m.y = -limitY; m.vy *= -1 }
        if (m.z > limitZ) { m.z = limitZ; m.vz *= -1 }
        if (m.z < -limitZ) { m.z = -limitZ; m.vz *= -1 }
      }

      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(1.0)
      dummy.rotation.set(0, Math.PI / 4, 0)
      dummy.updateMatrix()
      instB.setMatrixAt(i, dummy.matrix)
      ringB.setMatrixAt(i, dummy.matrix)

      const tNorm = ((m.baseSpeed * Math.sqrt(m.tempCur / 300)) - 0.75) / 2.25
      speedTempColor(tNorm, workCol)
      instB.setColorAt(i, workCol)
    }
  } else {
    // --- 可動ピストンモード ---
    valveWallGroup.visible = false
    pistonWallGroup.visible = true

    visualVA += (VA_ratio.value - visualVA) * Math.min(1, Math.max(0.12, stepDt * 7))
    const pistonX = ((visualVA / totalV_L) - 0.5) * (halfW * 2)
    pistonWallGroup.position.x = pistonX

    glowMeshA.position.x = -halfW + 0.05
    glowMeshA.scale.x = Math.max(0.2, pistonX - (-halfW) - 0.18)
    glowMeshB.position.x = halfW - 0.05
    glowMeshB.scale.x = Math.max(0.2, halfW - pistonX - 0.18)
    speedTempColor((TA.value - 180) / 460, glowMatA.color)
    speedTempColor((TB.value - 180) / 460, glowMatB.color)

    const leftMidX = (-halfW + pistonX) / 2
    const rightMidX = (pistonX + halfW) / 2
    gaugeA.group.position.x = Math.min(-0.9, leftMidX)
    gaugeB.group.position.x = Math.max(0.9, rightMidX)
    labelLeft.position.x = Math.min(-0.9, leftMidX)
    labelRight.position.x = Math.max(0.9, rightMidX)

    updateGaugeVisual(gaugeA, PA.value, TA.value)
    updateGaugeVisual(gaugeB, PB.value, TB.value)

    if (showVectors.value) {
      const lenA = Math.min(1.85, Math.max(0.5, (PA.value / 550) * 1.45))
      const lenB = Math.min(1.85, Math.max(0.5, (PB.value / 550) * 1.45))
      const aWins = PA.value >= PB.value - 1.5
      const bWins = PB.value >= PA.value - 1.5
      arrowPA.children.forEach(ch => {
        if (ch.material) {
          ch.material.color.setHex(aWins ? 0x10b981 : 0xf43f5e)
          ch.material.emissive.setHex(aWins ? 0x10b981 : 0xf43f5e)
        }
      })
      arrowPB.children.forEach(ch => {
        if (ch.material) {
          ch.material.color.setHex(bWins ? 0x10b981 : 0xf43f5e)
          ch.material.emissive.setHex(bWins ? 0x10b981 : 0xf43f5e)
        }
      })
      arrowPA.setVector(new THREE.Vector3(pistonX - 0.18 - lenA, 0.25, 0.35), new THREE.Vector3(1, 0, 0), lenA)
      arrowPB.setVector(new THREE.Vector3(pistonX + 0.18 + lenB, -0.25, 0.35), new THREE.Vector3(-1, 0, 0), lenB)
    } else {
      arrowPA.visible = false
      arrowPB.visible = false
    }

    const activeA = Math.min(MAX_SPECIES, Math.round(nA.value * 14))
    const activeB = Math.min(MAX_SPECIES, Math.round(nB.value * 14))
    const spdA = Math.sqrt(TA.value / 300) * 1.45
    const spdB = Math.sqrt(TB.value / 300) * 1.45

    for (let i = 0; i < MAX_SPECIES; i++) {
      const m = molDataA[i]
      if (i >= activeA) {
        dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.001); dummy.updateMatrix()
        instA.setMatrixAt(i, dummy.matrix); ringA.setMatrixAt(i, dummy.matrix)
        continue
      }
      if (stepDt > 0) {
        m.x += m.vx * spdA * stepDt
        m.y += m.vy * spdA * stepDt
        m.z += m.vz * spdA * stepDt
      }
      const minX = -halfW + 0.16
      const maxX = pistonX - 0.24
      if (m.x < minX) { m.x = minX; m.vx = Math.abs(m.vx) }
      if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx) }
      if (m.y > limitY) { m.y = limitY; m.vy *= -1 }
      if (m.y < -limitY) { m.y = -limitY; m.vy *= -1 }
      if (m.z > limitZ) { m.z = limitZ; m.vz *= -1 }
      if (m.z < -limitZ) { m.z = -limitZ; m.vz *= -1 }

      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(1.0)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      instA.setMatrixAt(i, dummy.matrix)
      ringA.setMatrixAt(i, dummy.matrix)

      const tNorm = ((m.baseSpeed * Math.sqrt(TA.value / 300)) - 0.75) / 2.25
      speedTempColor(tNorm, workCol)
      instA.setColorAt(i, workCol)
    }

    for (let i = 0; i < MAX_SPECIES; i++) {
      const m = molDataB[i]
      if (i >= activeB) {
        dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.001); dummy.updateMatrix()
        instB.setMatrixAt(i, dummy.matrix); ringB.setMatrixAt(i, dummy.matrix)
        continue
      }
      if (stepDt > 0) {
        m.x += m.vx * spdB * stepDt
        m.y += m.vy * spdB * stepDt
        m.z += m.vz * spdB * stepDt
      }
      const minX = pistonX + 0.24
      const maxX = halfW - 0.16
      if (m.x < minX) { m.x = minX; m.vx = Math.abs(m.vx) }
      if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx) }
      if (m.y > limitY) { m.y = limitY; m.vy *= -1 }
      if (m.y < -limitY) { m.y = -limitY; m.vy *= -1 }
      if (m.z > limitZ) { m.z = limitZ; m.vz *= -1 }
      if (m.z < -limitZ) { m.z = -limitZ; m.vz *= -1 }

      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(1.0)
      dummy.rotation.set(0, Math.PI / 4, 0)
      dummy.updateMatrix()
      instB.setMatrixAt(i, dummy.matrix)
      ringB.setMatrixAt(i, dummy.matrix)

      const tNorm = ((m.baseSpeed * Math.sqrt(TB.value / 300)) - 0.75) / 2.25
      speedTempColor(tNorm, workCol)
      instB.setColorAt(i, workCol)
    }
  }

  instA.instanceMatrix.needsUpdate = true
  instB.instanceMatrix.needsUpdate = true
  ringA.instanceMatrix.needsUpdate = true
  ringB.instanceMatrix.needsUpdate = true
  if (instA.instanceColor) instA.instanceColor.needsUpdate = true
  if (instB.instanceColor) instB.instanceColor.needsUpdate = true
}

watch([mode, isValveOpen, TA, TB, nA, VA_ratio], () => {
  syncLabels()
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (resizeObs) {
    resizeObs.disconnect()
    resizeObs = null
  }
  if (threeCtx && threeCtx.renderer && threeCtx.renderer.domElement) {
    threeCtx.renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    threeCtx.renderer.domElement.removeEventListener('pointerup', onPointerUp)
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
  max-width: 100%;
  box-sizing: border-box;
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

.mode-badge {
  margin-left: auto;
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  background: rgba(15, 23, 42, 0.85);
  color: #38bdf8;
  border: 1px solid #334155;
  white-space: nowrap;
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
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: 10px;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 10px !important;
  padding: 5px 10px !important;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
}

.speed-label,
.speed-btn-group button {
  white-space: nowrap;
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
  font-size: 0.74rem;
  color: #e2e8f0;
  pointer-events: none;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot-a { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-b { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.dot-cold { background: #38bdf8; box-shadow: 0 0 5px #38bdf8; }
.dot-mid { background: #10b981; box-shadow: 0 0 5px #10b981; }
.dot-hot { background: #ef4444; box-shadow: 0 0 5px #ef4444; }
.dot-eq { background: #10b981; box-shadow: 0 0 6px #10b981; }

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
  pointer-events: none;
}

.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
  font-size: 0.76rem;
  font-weight: 700;
  max-width: 100%;
  box-sizing: border-box;
}

.three-ortho-badge.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.control-panel {
  margin-top: 1rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}

.control-group label {
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
  color: #34d399;
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

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .three-hud-legend,
  .three-hud-hint,
  .three-ortho-badge {
    font-size: 0.66rem;
    padding: 3px 8px;
  }
  .speed-control-group {
    border-radius: 10px !important;
    width: 100%;
    flex-wrap: wrap !important;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .three-ortho-badge {
    width: 100%;
    text-align: center;
  }
}
</style>
