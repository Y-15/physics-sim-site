<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚛️</span>
        <h3>3D 核反応・質量欠損 &amp; <i>E</i> = <i>mc</i>² シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'fission' }"
          @click="setMode('fission')"
        >
          ⚛️ ウラン核分裂 (<sup>235</sup>U)
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'fusion' }"
          @click="setMode('fusion')"
        >
          ☀️ D-T 熱核融合 (<sup>2</sup>H + <sup>3</sup>H)
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'defect' }"
          @click="setMode('defect')"
        >
          ⚖️ 質量欠損 Δ<i>m</i> (自由核子 vs 結合核)
        </button>
      </div>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="chip-btn"
          :class="{ active: activeCam === '3d' }"
          @click="setCamera('3d')"
        >
          🎥 3D 俯瞰
        </button>
        <button
          class="chip-btn"
          :class="{ active: activeCam === 'front' }"
          @click="setCamera('front')"
        >
          📐 正面断面 (fov=14)
        </button>
        <button
          class="chip-btn"
          :class="{ active: activeCam === 'top' }"
          @click="setCamera('top')"
        >
          🔼 上面 (fov=14)
        </button>
      </div>
      <div class="preset-group">
        <button
          class="chip-btn"
          :class="{ active: showGluonBonds }"
          @click="showGluonBonds = !showGluonBonds"
        >
          {{ showGluonBonds ? '✨ 核力グルーオン結合: ON' : '✨ 核力グルーオン結合: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="sim-btn primary" @click="triggerReaction">
        💥 {{ mode === 'fission' ? '反応を再スタート（中性子照射）' : mode === 'fusion' ? '反応を再スタート（超高温衝突）' : '質量欠損アニメーション再生' }}
      </button>
      <button class="sim-btn secondary" @click="isReacting = !isReacting">
        {{ isReacting ? '⏸ 一時停止' : '▶ 再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: Math.abs(simSpeed - 0.5) < 0.05 }" @click="simSpeed = 0.5">0.5x</button>
          <button :class="{ active: Math.abs(simSpeed - 1.0) < 0.05 }" @click="simSpeed = 1.0">1.0x</button>
          <button :class="{ active: Math.abs(simSpeed - 1.5) < 0.05 }" @click="simSpeed = 1.5">1.5x</button>
          <button :class="{ active: Math.abs(simSpeed - 2.0) < 0.05 }" @click="simSpeed = 2.0">2.0x</button>
        </div>
      </div>
      <button class="sim-btn secondary" @click="resetReaction">🔄 リセット</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap three-stage">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-proton"></i><span class="legend-text">陽子 p (+)</span></span>
          <span class="legend-item"><i class="dot-neutron"></i><span class="legend-text">中性子 n (0)</span></span>
          <span class="legend-item"><i class="dot-gluon"></i><span class="legend-text">核力グルーオン / Δ<i>m</i>→<i>E</i></span></span>
          <span class="legend-item"><i class="dot-fe"></i><span class="legend-text"><sup>56</sup>Fe 最安定ピーク (8.8 MeV)</span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- ビューポート外ステータスストリップ -->
    <div class="mode-status-strip">
      <span class="state-badge" :class="mode">
        {{ currentReaction.title }} — <strong>{{ phaseLabel }}</strong>
      </span>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">{{ mode === 'defect' ? '自由核子の総質量 M₁' : '反応前総質量 M₁' }}</div>
        <div class="stat-value text-blue">{{ currentReaction.m1.toFixed(5) }} <span class="stat-unit">u</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ mode === 'defect' ? '結合原子核の質量 M₂' : '反応後総質量 M₂' }}</div>
        <div class="stat-value">{{ currentReaction.m2.toFixed(5) }} <span class="stat-unit">u</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">質量欠損 Δ<i>m</i> (消えた質量)</div>
        <div class="stat-value text-rose">{{ currentReaction.dm.toFixed(5) }} <span class="stat-unit">u</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">放出エネルギー Δ<i>E</i> (Δ<i>mc</i>²)</div>
        <div class="stat-value text-cyan">{{ currentReaction.energy.toFixed(1) }} <span class="stat-unit">MeV</span></div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>アニメーション進行速度:</span>
            <span class="control-val">{{ simSpeed.toFixed(1) }}x</span>
          </label>
          <input type="range" v-model.number="simSpeed" min="0.4" max="2.0" step="0.2" class="sim-slider" />
        </div>

        <div v-if="mode === 'defect'" class="control-group">
          <label class="control-label">
            <span>比較する結合原子核 (質量欠損 Δ<i>m</i>):</span>
            <span class="control-val">{{ defectNuclideLabel }}</span>
          </label>
          <div class="btn-group">
            <button
              class="chip-btn"
              :class="{ active: defectTarget === 'He4' }"
              @click="defectTarget = 'He4'"
            >
              <sup>4</sup><sub>2</sub>He (7.07 MeV/核子)
            </button>
            <button
              class="chip-btn"
              :class="{ active: defectTarget === 'C12' }"
              @click="defectTarget = 'C12'"
            >
              <sup>12</sup><sub>6</sub>C (7.68 MeV/核子)
            </button>
            <button
              class="chip-btn"
              :class="{ active: defectTarget === 'Fe56' }"
              @click="defectTarget = 'Fe56'"
            >
              <sup>56</sup><sub>26</sub>Fe (8.79 MeV/核子・最安定)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>宇宙最強のエネルギー源</strong>:
      化学反応（石炭や石油の燃焼）では分子の結合が変わるだけで質量はほぼ不変ですが、<strong>原子核反応では測定できるレベルで質量が消失（質量欠損 Δ<i>m</i>）</strong>します。<br>
      1 <i>u</i>（約 1.66 × 10<sup>-27</sup> kg）の質量が消えるだけで、アインシュタインの公式 <i>E</i> = <i>mc</i>² により<strong>約 931.5 MeV（石炭数千トン分）</strong>の猛烈なエネルギーが放出され、核子あたりの結合エネルギー曲線で <sup>56</sup>Fe（鉄）の頂上へ向かうほど安定化します！
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let resizeObs = null
let lastIsMob = false

const mode = ref('fission') // 'fission' | 'fusion' | 'defect'
const defectTarget = ref('He4') // 'He4' | 'C12' | 'Fe56'
const activeCam = ref('3d')
const showGluonBonds = ref(true)
const animProgress = ref(0.12)
const isReacting = ref(true)
const simSpeed = ref(1.0)

// 反応データ (質量単位 u: 1u ≈ 931.5 MeV)
const reactions = {
  fission: {
    title: '²³⁵U ＋ n → ¹⁴¹Ba ＋ ⁹²Kr ＋ 3n ＋ 約 200 MeV',
    m1: 235.04393 + 1.00866,
    m2: 140.91441 + 91.92616 + 3 * 1.00866,
    dm: 0.18604,
    energy: 173.3
  },
  fusion: {
    title: '²H (D) ＋ ³H (T) → ⁴He (α) ＋ n ＋ 17.6 MeV',
    m1: 2.01410 + 3.01605,
    m2: 4.00150 + 1.00866,
    dm: 0.01899,
    energy: 17.6
  }
}

const defectNuclides = {
  He4: {
    label: '⁴₂He (α粒子)',
    title: '2p ＋ 2n (自由核子) → ⁴He (結合核) ＋ 28.3 MeV',
    Z: 2,
    N: 2,
    m1: 2 * 1.00728 + 2 * 1.00866,
    m2: 4.00150,
    dm: 0.03038,
    energy: 28.3,
    bea: 7.07,
    A: 4
  },
  C12: {
    label: '¹²₆C (炭素12)',
    title: '6p ＋ 6n (自由核子) → ¹²C (結合核) ＋ 92.2 MeV',
    Z: 6,
    N: 6,
    m1: 6 * 1.00728 + 6 * 1.00866,
    m2: 11.99671,
    dm: 0.09893,
    energy: 92.2,
    bea: 7.68,
    A: 12
  },
  Fe56: {
    label: '⁵⁶₂₆Fe (鉄56・最安定)',
    title: '26p ＋ 30n (自由核子) → ⁵⁶Fe (結合核) ＋ 492.3 MeV',
    Z: 26,
    N: 30,
    m1: 26 * 1.00728 + 30 * 1.00866,
    m2: 55.92067,
    dm: 0.52847,
    energy: 492.3,
    bea: 8.79,
    A: 56
  }
}

const defectNuclideLabel = computed(() => defectNuclides[defectTarget.value].label)

const currentReaction = computed(() => {
  if (mode.value === 'defect') {
    return defectNuclides[defectTarget.value]
  }
  return reactions[mode.value]
})

const phaseLabel = computed(() => {
  const p = Math.min(1, animProgress.value)
  if (mode.value === 'fission') {
    if (p < 0.24) return '熱中性子 n が ²³⁵U へ接近'
    if (p < 0.50) return '複合核 [²³⁶U]* のくびれ励起振動'
    return '核分裂 & 質量欠損 Δm → E = Δmc² 解放！'
  }
  if (mode.value === 'fusion') {
    if (p < 0.40) return '²H と ³H がクーロン障壁を越えて接近'
    return 'D-T 核融合 & Δm → 17.6 MeV 解放！'
  }
  if (p < 0.38) return 'バラバラの自由核子 (質量 M₁ が重い)'
  if (p < 0.72) return '核力による結合 & 質量欠損 Δm 発生！'
  return '結合原子核 (質量 M₂ が軽く最安定)'
})

function setMode(newMode) {
  mode.value = newMode
  triggerReaction()
  syncModeVisuals()
}

function triggerReaction() {
  isReacting.value = true
  animProgress.value = 0
}

function resetReaction() {
  isReacting.value = false
  animProgress.value = 0
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
    ? Math.min(2.15, Math.max(1.48, 1.82 / Math.max(0.7, aspect)))
    : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0.1, 0.1, 41.0 * ms], target: [0.1, 0.1, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.1, 42.0 * ms, 0.15], target: [0.1, 0, 0], fov: 14 }
  }
  return { pos: [0.2 * ms, 4.4 * ms, 13.4 * ms], target: [0.1, 0.05, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  syncModeVisuals()
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.44) {
  const mult = isMobileViewport() ? 1.56 : 1.0
  const sig = `${textStr}|${color}|${borderColor}|${mult}`
  if (labelCache.get(sprite) !== sig) {
    labelCache.set(sprite, sig)
    sprite.updateText(textStr, color, borderColor)
  }
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  if (Math.abs(sprite.scale.y - h) > 0.004) {
    sprite.scale.set(h * asp, h, 1)
  }
}

// ==========================================================
// 3D 最密充填核子クラスター座標生成
// ==========================================================
function generateNucleonCluster(count, protonRatio, radiusScale = 0.21, seed = 1) {
  const pts = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    // 球体内部へ同心殻状に最密充填
    const u = (i + 0.5) / count
    const r = radiusScale * Math.cbrt(count) * Math.cbrt(u) * 0.92
    const y = 1 - 2 * ((i * 0.6180339 + seed * 0.13) % 1)
    const radXZ = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = goldenAngle * i + seed * 1.7
    pts.push({
      x: Math.cos(theta) * radXZ * r,
      y: y * r,
      z: Math.sin(theta) * radXZ * r,
      isProton: ((i * 7 + seed) % 100) < protonRatio * 100
    })
  }
  // 初期重なり軽減のリラクゼーション
  const minDist = radiusScale * 1.48
  for (let iter = 0; iter < 5; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x
        const dy = pts[j].y - pts[i].y
        const dz = pts[j].z - pts[i].z
        const d = Math.hypot(dx, dy, dz) || 1e-4
        if (d < minDist) {
          const push = (minDist - d) * 0.38 / d
          pts[i].x -= dx * push
          pts[i].y -= dy * push
          pts[i].z -= dz * push
          pts[j].x += dx * push
          pts[j].y += dy * push
          pts[j].z += dz * push
        }
      }
    }
  }
  return pts
}

function buildBondPairs(pts, maxDist) {
  const pairs = []
  for (let i = 0; i < pts.length; i++) {
    let links = 0
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y, pts[j].z - pts[i].z)
      if (d < maxDist) {
        pairs.push([i, j])
        links++
        if (links >= 3) break
      }
    }
  }
  return pairs
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
let sceneObjs = null
const MAX_NUCLEONS = 120
const MAX_BONDS = 300

const axX0 = -2.35
const axY0 = -1.72
const axW = 4.75
const axH = 2.98
const toGraphX = (A) => axX0 + (A / 250) * axW
const toGraphY = (bea) => axY0 + (bea / 9.8) * axH

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 160,
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
        syncModeVisuals()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // 床グリッド
  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.5, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D 原子核反応 & 核子クラスターステージ (中心 x = -3.05)
  // ======================================================
  const reactGroup = new THREE.Group()
  reactGroup.position.set(-3.05, 0.05, 0)
  scene.add(reactGroup)

  // 反応チャンバー台座リング
  const chamberRing = new THREE.Mesh(
    new THREE.RingGeometry(2.25, 2.48, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  chamberRing.position.set(0, -2.35, 0)
  reactGroup.add(chamberRing)

  const chamberGridCircle = new THREE.Mesh(
    new THREE.CircleGeometry(2.24, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  chamberGridCircle.position.set(0, -2.36, 0)
  reactGroup.add(chamberGridCircle)

  // InstancedMesh 陽子 (#fb7185) と 中性子 (#94a3b8)
  const nucleonGeo = new THREE.SphereGeometry(0.175, 18, 18)
  const protonMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    emissive: 0xe11d48,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.12
  })
  const neutronMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.12,
    roughness: 0.3,
    metalness: 0.25
  })

  const instProtons = new THREE.InstancedMesh(nucleonGeo, protonMat, MAX_NUCLEONS)
  const instNeutrons = new THREE.InstancedMesh(nucleonGeo, neutronMat, MAX_NUCLEONS)
  instProtons.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  instNeutrons.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  reactGroup.add(instProtons, instNeutrons)

  // 強い相互作用（核力グルーオン）発光ボンド LineSegments
  const bondPositions = new Float32Array(MAX_BONDS * 2 * 3)
  const bondGeo = new THREE.BufferGeometry()
  bondGeo.setAttribute('position', new THREE.BufferAttribute(bondPositions, 3))
  const bondMat = new THREE.LineBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  })
  const bondLines = new THREE.LineSegments(bondGeo, bondMat)
  bondLines.frustumCulled = false
  bondLines.renderOrder = 2
  reactGroup.add(bondLines)

  // 飛来・放出中性子 3D球 (最大4個 + 軌跡尾)
  const freeNeutrons = []
  const fnGeo = new THREE.SphereGeometry(0.145, 16, 16)
  for (let i = 0; i < 4; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      roughness: 0.15
    })
    const mesh = new THREE.Mesh(fnGeo, mat)
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.28, depthWrite: false })
    )
    mesh.add(halo)
    mesh.visible = false
    reactGroup.add(mesh)
    freeNeutrons.push({ mesh, mat, halo })
  }

  // E = Δmc² エネルギー爆発・質量欠損オーラ球 + 拡張衝撃波リング + 光子リング
  const energyFlashSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  )
  energyFlashSphere.renderOrder = 5
  reactGroup.add(energyFlashSphere)

  const shockRings = []
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.045, 12, 42),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xfbbf24 : i === 1 ? 0xf43f5e : 0x22d3ee,
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    )
    ring.rotation.set(i * 0.7, i * 1.1, 0)
    ring.renderOrder = 5
    reactGroup.add(ring)
    shockRings.push(ring)
  }

  // 質量欠損 Δm 比較プラットフォーム (自由核子 vs 結合核モード用)
  const freePlatform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.45, 1.55, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.35 })
  )
  freePlatform.position.set(-1.35, -1.7, 0)
  const boundPlatform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.25, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x0284c7, emissiveIntensity: 0.25, metalness: 0.5, roughness: 0.3 })
  )
  boundPlatform.position.set(1.45, -1.7, 0)
  reactGroup.add(freePlatform, boundPlatform)

  const dmArrow = createVectorArrow3D({
    color: 0xfbbf24,
    shaftRadius: 0.055,
    headRadius: 0.16,
    headLength: 0.38
  })
  reactGroup.add(dmArrow)

  // 左側 3D ラベル群
  const labelLeftMain = createTextSprite('²³⁵U 原子核', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    scale: 0.46
  })
  labelLeftMain.position.set(0, 2.38, 0.2)
  reactGroup.add(labelLeftMain)

  const labelLeftSubA = createTextSprite('¹⁴¹Ba', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.42
  })
  reactGroup.add(labelLeftSubA)

  const labelLeftSubB = createTextSprite('⁹²Kr', {
    color: '#93c5fd',
    borderColor: '#3b82f6',
    scale: 0.42
  })
  reactGroup.add(labelLeftSubB)

  const labelEnergy = createTextSprite('⚡ Δm → E = Δmc²', {
    color: '#fde047',
    borderColor: '#fbbf24',
    scale: 0.48
  })
  labelEnergy.position.set(0, -1.95, 1.05)
  reactGroup.add(labelEnergy)

  // 核反応クラスターの事前計算データ
  const u235Pts = generateNucleonCluster(72, 92 / 235, 0.19, 1)
  const u235Bonds = buildBondPairs(u235Pts, 0.44)
  const ba141Pts = generateNucleonCluster(42, 56 / 141, 0.185, 2)
  const ba141Bonds = buildBondPairs(ba141Pts, 0.43)
  const kr92Pts = generateNucleonCluster(30, 36 / 92, 0.185, 3)
  const kr92Bonds = buildBondPairs(kr92Pts, 0.43)

  const d2Pts = [
    { x: -0.13, y: 0, z: 0, isProton: true },
    { x: 0.13, y: 0, z: 0, isProton: false }
  ]
  const t3Pts = [
    { x: 0, y: 0.14, z: 0, isProton: true },
    { x: -0.14, y: -0.11, z: 0.08, isProton: false },
    { x: 0.14, y: -0.11, z: -0.08, isProton: false }
  ]
  const he4Pts = [
    { x: 0.13, y: 0.13, z: 0.13, isProton: true },
    { x: -0.13, y: -0.13, z: 0.13, isProton: true },
    { x: -0.13, y: 0.13, z: -0.13, isProton: false },
    { x: 0.13, y: -0.13, z: -0.13, isProton: false }
  ]
  const c12Pts = generateNucleonCluster(12, 0.5, 0.185, 5)
  const c12Bonds = buildBondPairs(c12Pts, 0.42)
  const fe56Pts = generateNucleonCluster(56, 26 / 56, 0.185, 7)
  const fe56Bonds = buildBondPairs(fe56Pts, 0.42)

  // ======================================================
  // 2. 右側: 3D 核子あたり結合エネルギー曲線 (B/A vs A) (x = +3.15)
  // ======================================================
  const graphGroup = new THREE.Group()
  graphGroup.position.set(3.15, 0.05, 0)
  scene.add(graphGroup)

  const boardW = 5.7
  const boardH = 4.35
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
  boardBack.renderOrder = 0
  graphGroup.add(boardBack)

  const boardBorder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(boardW, boardH)),
    new THREE.LineBasicMaterial({ color: 0x475569 })
  )
  boardBorder.position.set(0, 0, -0.06)
  graphGroup.add(boardBorder)

  // グリッド線
  const gridMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 })
  ;[2, 4, 6, 8].forEach((b) => {
    const gy = toGraphY(b)
    graphGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(axX0, gy, -0.02),
          new THREE.Vector3(axX0 + axW, gy, -0.02)
        ]),
        gridMat
      )
    )
  })
  ;[56, 100, 150, 200].forEach((a) => {
    const gx = toGraphX(a)
    graphGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(gx, axY0, -0.02),
          new THREE.Vector3(gx, axY0 + axH, -0.02)
        ]),
        gridMat
      )
    )
  })

  // 座標軸矢印
  const aAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.075, headLength: 0.2 })
  aAxis.setVector(new THREE.Vector3(axX0, axY0, 0.02), new THREE.Vector3(1, 0, 0), axW + 0.22)
  const bAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.075, headLength: 0.2 })
  bAxis.setVector(new THREE.Vector3(axX0, axY0, 0.02), new THREE.Vector3(0, 1, 0), axH + 0.22)
  graphGroup.add(aAxis, bAxis)

  // 実物理データに基づく B/A vs A 曲線 (MeV/核子)
  const beaData = [
    [1, 0.0],
    [2, 1.11],
    [3, 2.83],
    [4, 7.07],
    [6, 5.33],
    [12, 7.68],
    [16, 7.98],
    [28, 8.45],
    [40, 8.55],
    [56, 8.79],
    [62, 8.795],
    [92, 8.51],
    [118, 8.52],
    [141, 8.34],
    [180, 8.02],
    [208, 7.87],
    [235, 7.59],
    [244, 7.52]
  ]
  const curvePts = beaData.map(([A, bea]) => new THREE.Vector3(toGraphX(A), toGraphY(bea), 0.06))
  const beaCurve = new THREE.CatmullRomCurve3(curvePts, false, 'catmullrom', 0.25)
  const beaTube = new THREE.Mesh(
    new THREE.TubeGeometry(beaCurve, 90, 0.044, 10, false),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.2
    })
  )
  graphGroup.add(beaTube)

  // 曲線下の半透明塗りつぶし
  const sampled = beaCurve.getPoints(80)
  const fillShape = new THREE.Shape()
  fillShape.moveTo(sampled[0].x, axY0)
  sampled.forEach((p) => fillShape.lineTo(p.x, p.y))
  fillShape.lineTo(sampled[sampled.length - 1].x, axY0)
  fillShape.closePath()
  const fillMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(fillShape),
    new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  fillMesh.renderOrder = 0
  graphGroup.add(fillMesh)

  // 主要核種マーカー (Fe-56 ピーク, He-4, D/T, Ba-141/Kr-92, U-235)
  function makeMarker(A, bea, color, radius = 0.11) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 18, 18),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.75
      })
    )
    m.position.set(toGraphX(A), toGraphY(bea), 0.1)
    graphGroup.add(m)
    return m
  }

  const feMarker = makeMarker(56, 8.79, 0xf43f5e, 0.145)
  const feHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.25, 28),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })
  )
  feHalo.position.copy(feMarker.position)
  graphGroup.add(feHalo)

  // Fe-56 垂直ピーク基準線
  const feLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(toGraphX(56), axY0, 0.03),
      new THREE.Vector3(toGraphX(56), toGraphY(8.79), 0.03)
    ]),
    new THREE.LineDashedMaterial({ color: 0xf43f5e, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.65 })
  )
  feLine.computeLineDistances()
  graphGroup.add(feLine)

  const heMarker = makeMarker(4, 7.07, 0xfbbf24, 0.11)
  const dtMarker = makeMarker(2.5, 2.0, 0x22d3ee, 0.095)
  const uMarker = makeMarker(235, 7.59, 0x10b981, 0.12)
  const fragMarker = makeMarker(118, 8.52, 0xa855f7, 0.105)

  // 核融合・核分裂方向を示す 3D 矢印
  const fusionDirArrow = createVectorArrow3D({
    color: 0xfbbf24,
    shaftRadius: 0.032,
    headRadius: 0.10,
    headLength: 0.26
  })
  fusionDirArrow.setVector(
    new THREE.Vector3(toGraphX(8), toGraphY(3.6), 0.12),
    new THREE.Vector3(0.55, 0.84, 0).normalize(),
    1.18
  )
  graphGroup.add(fusionDirArrow)

  const fissionDirArrow = createVectorArrow3D({
    color: 0x10b981,
    shaftRadius: 0.032,
    headRadius: 0.10,
    headLength: 0.26
  })
  fissionDirArrow.setVector(
    new THREE.Vector3(toGraphX(226), toGraphY(6.8), 0.12),
    new THREE.Vector3(-0.92, 0.39, 0).normalize(),
    1.65
  )
  graphGroup.add(fissionDirArrow)

  // グラフ上 3D ラベル
  const labelGraphTitle = createTextSprite('📊 核子あたり結合エネルギー B/A', {
    color: '#e2e8f0',
    borderColor: 'rgba(56,189,248,0.45)',
    scale: 0.45
  })
  labelGraphTitle.position.set(0, 2.58, 0.1)
  graphGroup.add(labelGraphTitle)

  const labelFePeak = createTextSprite('⁵⁶Fe 最安定 (8.8 MeV)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.40
  })
  labelFePeak.position.set(toGraphX(95), toGraphY(8.79) + 0.42, 0.15)
  graphGroup.add(labelFePeak)

  const labelFusionDir = createTextSprite('核融合 →', {
    color: '#fde68a',
    borderColor: '#fbbf24',
    scale: 0.36
  })
  labelFusionDir.position.set(toGraphX(22), toGraphY(1.85), 0.15)
  graphGroup.add(labelFusionDir)

  const labelFissionDir = createTextSprite('← 核分裂 (²³⁵U→Ba/Kr)', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.36
  })
  labelFissionDir.position.set(toGraphX(182), toGraphY(5.6), 0.15)
  graphGroup.add(labelFissionDir)

  const labelAxisA = createTextSprite('質量数 A →', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.4)',
    scale: 0.38
  })
  labelAxisA.position.set(1.5, -2.28, 0.15)
  graphGroup.add(labelAxisA)

  sceneObjs = {
    reactGroup,
    instProtons,
    instNeutrons,
    bondPositions,
    bondGeo,
    bondLines,
    bondMat,
    freeNeutrons,
    energyFlashSphere,
    shockRings,
    freePlatform,
    boundPlatform,
    dmArrow,
    labelLeftMain,
    labelLeftSubA,
    labelLeftSubB,
    labelEnergy,
    u235Pts,
    u235Bonds,
    ba141Pts,
    ba141Bonds,
    kr92Pts,
    kr92Bonds,
    d2Pts,
    t3Pts,
    he4Pts,
    c12Pts,
    c12Bonds,
    fe56Pts,
    fe56Bonds,
    feMarker,
    feHalo,
    heMarker,
    dtMarker,
    uMarker,
    fragMarker,
    fusionDirArrow,
    fissionDirArrow,
    labelGraphTitle,
    labelFePeak,
    labelFusionDir,
    labelFissionDir,
    labelAxisA,
    dummy: new THREE.Object3D()
  }

  syncModeVisuals()
  updateFrame(0, 0)
}

function syncModeVisuals() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'
  const {
    freePlatform,
    boundPlatform,
    dmArrow,
    labelGraphTitle,
    labelFePeak,
    labelFusionDir,
    labelFissionDir,
    labelAxisA,
    labelLeftMain,
    labelEnergy
  } = sceneObjs

  const isDefect = mode.value === 'defect'
  freePlatform.visible = isDefect
  boundPlatform.visible = isDefect
  dmArrow.visible = isDefect

  labelGraphTitle.visible = !isTop
  labelFePeak.visible = !isTop
  labelFusionDir.visible = !isTop
  labelFissionDir.visible = !isTop
  labelAxisA.visible = !isTop

  updateLabelCached(
    labelGraphTitle,
    mob ? '📊 B/A vs A 曲線' : '📊 核子あたり結合エネルギー B/A',
    '#e2e8f0',
    'rgba(56,189,248,0.45)',
    0.44
  )
  updateLabelCached(
    labelFePeak,
    mob ? '⁵⁶Fe (8.8 MeV)' : '⁵⁶Fe 最安定 (8.8 MeV)',
    '#fda4af',
    '#f43f5e',
    mob ? 0.36 : 0.38
  )
  labelFePeak.position.set(
    toGraphX(mob ? 112 : 95),
    toGraphY(8.79) + (mob ? 0.68 : 0.48),
    0.15
  )
  updateLabelCached(
    labelFusionDir,
    mob ? '核融合→' : '核融合 →',
    '#fde68a',
    '#fbbf24',
    mob ? 0.28 : 0.35
  )
  labelFusionDir.position.set(
    toGraphX(mob ? 35 : 24),
    toGraphY(mob ? 1.6 : 1.85),
    0.15
  )
  updateLabelCached(
    labelFissionDir,
    mob ? '← 核分裂' : '← 核分裂 (²³⁵U→Ba/Kr)',
    '#6ee7b7',
    '#10b981',
    0.35
  )
  updateLabelCached(labelAxisA, '質量数 A →', '#cbd5e1', 'rgba(148,163,184,0.4)', 0.37)
  void labelLeftMain
  void labelEnergy
}

function pushCluster(pts, bonds, ox, oy, oz, scale, rotY, stretchX, pList, nList, bondList, elapsed, jitterAmp = 0) {
  const cosR = Math.cos(rotY)
  const sinR = Math.sin(rotY)
  const worldPts = []
  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i]
    const jx = jitterAmp > 0 ? Math.sin(elapsed * 22 + i * 1.9) * jitterAmp : 0
    const jy = jitterAmp > 0 ? Math.cos(elapsed * 20 + i * 2.3) * jitterAmp : 0
    const lx = (pt.x * stretchX + jx) * scale
    const ly = (pt.y / Math.sqrt(Math.max(0.5, stretchX)) + jy) * scale
    const lz = (pt.z / Math.sqrt(Math.max(0.5, stretchX))) * scale
    const wx = ox + lx * cosR - lz * sinR
    const wy = oy + ly
    const wz = oz + lx * sinR + lz * cosR
    worldPts.push([wx, wy, wz])
    if (pt.isProton) pList.push([wx, wy, wz, scale])
    else nList.push([wx, wy, wz, scale])
  }
  if (bonds) {
    for (let k = 0; k < bonds.length; k++) {
      const [a, b] = bonds[k]
      if (worldPts[a] && worldPts[b]) {
        bondList.push(worldPts[a], worldPts[b])
      }
    }
  }
}

function updateFrame(dt, elapsed) {
  if (!sceneObjs) return

  if (isReacting.value && dt > 0) {
    animProgress.value += dt * 0.34 * simSpeed.value
    if (animProgress.value >= 1.28) {
      animProgress.value = 0
    }
  }

  const p = Math.min(1.0, animProgress.value)
  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'
  const {
    instProtons,
    instNeutrons,
    bondPositions,
    bondGeo,
    bondLines,
    bondMat,
    freeNeutrons,
    energyFlashSphere,
    shockRings,
    dmArrow,
    labelLeftMain,
    labelLeftSubA,
    labelLeftSubB,
    labelEnergy,
    u235Pts,
    u235Bonds,
    ba141Pts,
    ba141Bonds,
    kr92Pts,
    kr92Bonds,
    d2Pts,
    t3Pts,
    he4Pts,
    c12Pts,
    c12Bonds,
    fe56Pts,
    fe56Bonds,
    feMarker,
    feHalo,
    heMarker,
    dtMarker,
    uMarker,
    fragMarker,
    dummy
  } = sceneObjs

  const pList = []
  const nList = []
  const bondList = []

  freeNeutrons.forEach((fn) => { fn.mesh.visible = false })
  labelLeftSubA.visible = false
  labelLeftSubB.visible = false
  dmArrow.visible = false

  let flashAlpha = 0
  let flashScale = 0.1

  if (mode.value === 'fission') {
    if (p < 0.24) {
      // 状態1: 熱中性子接近 + 235U 回転クラスター
      const u = p / 0.24
      pushCluster(u235Pts, u235Bonds, 0.25, 0.1, 0, 1.0, elapsed * 0.45, 1.0, pList, nList, bondList, elapsed, 0.008)

      const nx = -2.35 + u * 2.1
      freeNeutrons[0].mesh.visible = true
      freeNeutrons[0].mesh.position.set(nx, 0.1, 0)
      freeNeutrons[0].mat.color.setHex(0xfbbf24)
      freeNeutrons[0].mat.emissive.setHex(0xf59e0b)

      updateLabelCached(labelLeftMain, mob ? '²³⁵U + 熱中性子 n' : '²³⁵U 原子核 + 熱中性子 n', '#fde68a', '#f59e0b', 0.44)
      labelLeftMain.position.set(0.1, isTop ? 2.38 : 2.52, isTop ? -1.85 : 0.1)
      labelEnergy.position.set(0, isTop ? -1.95 : -2.06, isTop ? 1.85 : 1.05)
      updateLabelCached(labelEnergy, '反応前質量 M₁ = 236.0526 u', '#7dd3fc', '#0284c7', 0.42)
    } else if (p < 0.50) {
      // 状態2: 複合核 [236U]* のひょうたん型振動
      const deform = (p - 0.24) / 0.26
      const stretch = 1.0 + deform * 0.9 + Math.sin(elapsed * 26) * 0.12
      pushCluster(u235Pts, u235Bonds, 0, 0.1, 0, 1.0, elapsed * 0.6, stretch, pList, nList, bondList, elapsed, 0.03)
      updateLabelCached(labelLeftMain, '励起複合核 [²³⁶U]* 振動中', '#fda4af', '#f43f5e', 0.44)
      labelLeftMain.position.set(0, isTop ? 2.38 : 2.52, isTop ? -1.85 : 0.1)
      labelEnergy.position.set(0, isTop ? -1.95 : -2.06, isTop ? 1.85 : 1.05)
      updateLabelCached(labelEnergy, 'クーロン斥力が核力を突破！', '#fca5a5', '#ef4444', 0.42)
    } else {
      // 状態3: 核分裂飛散 + 3個の高速中性子 + E = Δmc² フラッシュ
      const fly = (p - 0.50) / 0.50
      const easeFly = 1 - Math.pow(1 - fly, 1.8)

      const baPos = [-0.55 - easeFly * 1.45, 0.35 + easeFly * 0.85, -0.35 * easeFly]
      const krPos = [0.55 + easeFly * 1.55, -0.25 - easeFly * 0.78, 0.45 * easeFly]

      pushCluster(ba141Pts, ba141Bonds, baPos[0], baPos[1], baPos[2], 0.92, elapsed * 0.9, 1.0, pList, nList, bondList, elapsed, 0.01)
      pushCluster(kr92Pts, kr92Bonds, krPos[0], krPos[1], krPos[2], 0.88, -elapsed * 1.1, 1.0, pList, nList, bondList, elapsed, 0.01)

      const dirs = [
        [0.85, 0.65, 0.45],
        [-0.35, -0.95, 0.55],
        [0.45, -0.55, -0.85]
      ]
      dirs.forEach((d, idx) => {
        const len = Math.hypot(d[0], d[1], d[2])
        const dist = 0.3 + fly * 2.55
        freeNeutrons[idx].mesh.visible = true
        freeNeutrons[idx].mesh.position.set((d[0] / len) * dist, (d[1] / len) * dist + 0.1, (d[2] / len) * dist)
        freeNeutrons[idx].mat.color.setHex(0x38bdf8)
        freeNeutrons[idx].mat.emissive.setHex(0x0284c7)
      })

      flashAlpha = Math.max(0, 1 - fly * 1.35)
      flashScale = 0.6 + fly * 2.6

      labelLeftSubA.visible = true
      labelLeftSubB.visible = true
      if (isTop) {
        labelLeftSubA.position.set(baPos[0] - 0.35, baPos[1] + 1.05, baPos[2] - 0.78)
        labelLeftSubB.position.set(krPos[0] + 0.35, krPos[1] - 0.98, krPos[2] + 0.82)
      } else {
        labelLeftSubA.position.set(baPos[0] - 0.12, baPos[1] - 0.96, baPos[2] + 0.25)
        labelLeftSubB.position.set(krPos[0] + 0.12, krPos[1] + 0.92, krPos[2] + 0.25)
      }
      updateLabelCached(labelLeftSubA, '¹⁴¹Ba', '#6ee7b7', '#10b981', 0.40)
      updateLabelCached(labelLeftSubB, '⁹²Kr', '#93c5fd', '#3b82f6', 0.40)
      updateLabelCached(labelLeftMain, (mob || isTop) ? '核分裂 ＋ 3n' : '¹⁴¹Ba ＋ ⁹²Kr ＋ 高速中性子 3n', '#fde68a', '#fbbf24', 0.44)
      labelLeftMain.position.set(0, isTop ? 2.38 : 2.52, isTop ? -1.95 : 0.1)
      labelEnergy.position.set(0, isTop ? -1.95 : -2.06, isTop ? 2.05 : 1.05)
      updateLabelCached(labelEnergy, '⚡ Δm = 0.186 u → E = 173.3 MeV', '#fde047', '#f59e0b', 0.44)
    }
  } else if (mode.value === 'fusion') {
    labelLeftMain.position.set(0, 2.38, isTop ? -1.95 : 0.1)
    labelEnergy.position.set(0, -1.95, isTop ? 1.95 : 1.05)
    if (p < 0.40) {
      const u = p / 0.40
      const dPos = -1.9 + u * 1.55
      const tPos = 1.9 - u * 1.55
      pushCluster(d2Pts, [[0, 1]], dPos, 0.15, 0, 1.45, elapsed * 1.5, 1.0, pList, nList, bondList, elapsed, 0.015)
      pushCluster(t3Pts, [[0, 1], [1, 2], [2, 0]], tPos, 0.15, 0, 1.45, -elapsed * 1.4, 1.0, pList, nList, bondList, elapsed, 0.015)

      labelLeftSubA.visible = true
      labelLeftSubB.visible = true
      labelLeftSubA.position.set(dPos, 0.95, isTop ? -0.65 : 0.2)
      labelLeftSubB.position.set(tPos, 0.95, isTop ? 0.65 : 0.2)
      updateLabelCached(labelLeftSubA, '²H (D)', '#7dd3fc', '#38bdf8', 0.40)
      updateLabelCached(labelLeftSubB, '³H (T)', '#fda4af', '#fb7185', 0.40)
      updateLabelCached(labelLeftMain, mob ? '超高温 D-T 接近' : '超高温プラズマ D ＋ T 接近', '#fde68a', '#f59e0b', 0.44)
      updateLabelCached(labelEnergy, 'クーロン障壁を突破して核力圏内へ', '#cbd5e1', '#64748b', 0.42)
    } else {
      const fly = (p - 0.40) / 0.60
      const easeFly = 1 - Math.pow(1 - fly, 1.8)
      const heX = -0.35 - easeFly * 1.55
      const heY = 0.1 - easeFly * 0.45
      pushCluster(
        he4Pts,
        [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]],
        heX,
        heY,
        0,
        1.55,
        elapsed * 1.3,
        1.0,
        pList,
        nList,
        bondList,
        elapsed,
        0.008
      )

      freeNeutrons[0].mesh.visible = true
      freeNeutrons[0].mesh.position.set(0.35 + fly * 2.15, 0.2 + fly * 0.68, 0.35 * fly)
      freeNeutrons[0].mat.color.setHex(0x38bdf8)
      freeNeutrons[0].mat.emissive.setHex(0x38bdf8)

      flashAlpha = Math.max(0, 1 - fly * 1.3)
      flashScale = 0.55 + fly * 2.4

      labelLeftSubA.visible = true
      labelLeftSubB.visible = true
      labelLeftSubA.position.set(heX, heY + 1.0, isTop ? -0.75 : 0.2)
      labelLeftSubB.position.set(0.35 + fly * 1.8, 0.85 + fly * 0.55, isTop ? 0.85 : 0.2)
      updateLabelCached(labelLeftSubA, '⁴He (3.5 MeV)', '#fde68a', '#fbbf24', 0.40)
      updateLabelCached(labelLeftSubB, 'n (14.1 MeV)', '#7dd3fc', '#38bdf8', 0.40)
      updateLabelCached(labelLeftMain, '🌟 D-T 核融合完了 (⁴He ＋ n)', '#fde047', '#fbbf24', 0.44)
      updateLabelCached(labelEnergy, '⚡ Δm = 0.019 u → E = 17.6 MeV', '#fde047', '#f59e0b', 0.44)
    }
  } else {
    // 質量欠損 Δm 比較モード (左側: 自由核子群 vs 右側: 結合原子核)
    labelLeftMain.position.set(0, 2.38, isTop ? -1.95 : 0.1)
    labelEnergy.position.set(0, -1.95, isTop ? 1.95 : 1.05)
    const targetData = defectNuclides[defectTarget.value]
    const pts = defectTarget.value === 'He4' ? he4Pts : defectTarget.value === 'C12' ? c12Pts : fe56Pts
    const bonds = defectTarget.value === 'He4'
      ? [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
      : defectTarget.value === 'C12' ? c12Bonds : fe56Bonds

    // 左台座上のバラバラな自由核子（結合線なし、互いに距離を取って浮遊）
    const spreadScale = defectTarget.value === 'He4' ? 2.6 : defectTarget.value === 'C12' ? 2.0 : 1.48
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i]
      const ang = elapsed * 0.45 + i * 0.6
      const wx = -1.35 + pt.x * spreadScale + Math.sin(ang) * 0.06
      const wy = -0.35 + pt.y * spreadScale + Math.cos(ang * 1.2) * 0.06
      const wz = pt.z * spreadScale
      if (pt.isProton) pList.push([wx, wy, wz, 1.0])
      else nList.push([wx, wy, wz, 1.0])
    }

    // 右台座上の強固に結合した原子核（グルーオン結合あり・コンパクト）
    const boundScale = defectTarget.value === 'He4' ? 1.45 : defectTarget.value === 'C12' ? 1.15 : 0.95
    pushCluster(pts, bonds, 1.45, -0.35, 0, boundScale, elapsed * 0.8, 1.0, pList, nList, bondList, elapsed, 0.008)

    dmArrow.visible = true
    dmArrow.setVector(new THREE.Vector3(-0.35, -0.35, 0.25), new THREE.Vector3(1, 0, 0), 0.95)

    // Δm -> E=mc² の脈動オーラ
    const pulse = (Math.sin(elapsed * 3.2 - p * Math.PI * 2) + 1) * 0.5
    flashAlpha = 0.22 + pulse * 0.35
    flashScale = 0.5 + pulse * 0.55
    energyFlashSphere.position.set(1.45, -0.35, 0)

    labelLeftSubA.visible = true
    labelLeftSubB.visible = true
    labelLeftSubA.position.set(-1.35, 1.25, 0.2)
    labelLeftSubB.position.set(1.45, 1.25, 0.2)
    updateLabelCached(labelLeftSubA, `自由核子 M₁=${targetData.m1.toFixed(3)}u`, '#93c5fd', '#38bdf8', 0.38)
    updateLabelCached(labelLeftSubB, `結合核 M₂=${targetData.m2.toFixed(3)}u`, '#6ee7b7', '#10b981', 0.38)
    updateLabelCached(labelLeftMain, `核力結合による質量欠損: ${targetData.label}`, '#fde68a', '#fbbf24', 0.43)
    updateLabelCached(labelEnergy, `⚡ B = Δmc² = ${targetData.energy.toFixed(1)} MeV 放出`, '#fde047', '#f59e0b', 0.44)
  }

  if (mode.value !== 'defect') {
    energyFlashSphere.position.set(0, 0.1, 0)
  }

  // InstancedMesh 陽子・中性子マトリックス更新
  for (let i = 0; i < MAX_NUCLEONS; i++) {
    if (i < pList.length) {
      const [x, y, z, s] = pList[i]
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(s)
    } else {
      dummy.position.set(0, -999, 0)
      dummy.scale.setScalar(0.001)
    }
    dummy.updateMatrix()
    instProtons.setMatrixAt(i, dummy.matrix)

    if (i < nList.length) {
      const [x, y, z, s] = nList[i]
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(s)
    } else {
      dummy.position.set(0, -999, 0)
      dummy.scale.setScalar(0.001)
    }
    dummy.updateMatrix()
    instNeutrons.setMatrixAt(i, dummy.matrix)
  }
  instProtons.instanceMatrix.needsUpdate = true
  instNeutrons.instanceMatrix.needsUpdate = true

  // 強い相互作用グルーオン結合ライン更新
  bondLines.visible = showGluonBonds.value
  if (showGluonBonds.value) {
    const count = Math.min(MAX_BONDS, bondList.length / 2)
    for (let i = 0; i < MAX_BONDS; i++) {
      const base = i * 6
      if (i < count) {
        const a = bondList[i * 2]
        const b = bondList[i * 2 + 1]
        bondPositions[base] = a[0]
        bondPositions[base + 1] = a[1]
        bondPositions[base + 2] = a[2]
        bondPositions[base + 3] = b[0]
        bondPositions[base + 4] = b[1]
        bondPositions[base + 5] = b[2]
      } else {
        bondPositions[base] = 0; bondPositions[base + 1] = -999; bondPositions[base + 2] = 0
        bondPositions[base + 3] = 0; bondPositions[base + 4] = -999; bondPositions[base + 5] = 0
      }
    }
    bondGeo.getAttribute('position').needsUpdate = true
    bondMat.opacity = 0.5 + 0.35 * Math.sin(elapsed * 5.2)
  }

  // エネルギーフラッシュ & 衝撃波リング更新
  energyFlashSphere.visible = flashAlpha > 0.02
  energyFlashSphere.material.opacity = flashAlpha * 0.52
  energyFlashSphere.scale.setScalar(flashScale)

  shockRings.forEach((ring, idx) => {
    ring.visible = flashAlpha > 0.03
    if (!ring.visible) return
    ring.position.copy(energyFlashSphere.position)
    ring.scale.setScalar(0.55 + (flashScale - 0.5) * (0.85 + idx * 0.25))
    ring.material.opacity = flashAlpha * 0.72
    ring.rotation.z = elapsed * (1.2 + idx * 0.5)
  })

  // B/A 曲線上のアクティブマーカー脈動
  const pulseS = 1 + Math.sin(elapsed * 4.5) * 0.16
  feHalo.scale.setScalar(1 + Math.sin(elapsed * 3.5) * 0.14)
  feMarker.scale.setScalar(mode.value === 'defect' && defectTarget.value === 'Fe56' ? pulseS * 1.25 : 1.0)
  uMarker.scale.setScalar(mode.value === 'fission' ? pulseS * 1.25 : 1.0)
  fragMarker.scale.setScalar(mode.value === 'fission' ? pulseS * 1.15 : 1.0)
  dtMarker.scale.setScalar(mode.value === 'fusion' ? pulseS * 1.25 : 1.0)
  heMarker.scale.setScalar(mode.value === 'fusion' || (mode.value === 'defect' && defectTarget.value === 'He4') ? pulseS * 1.22 : 1.0)
}

watch(defectTarget, () => {
  syncModeVisuals()
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
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.sim-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.title-row h3 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #f8fafc;
}

.three-badge {
  margin-left: auto;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.sim-tabs {
  display: flex;
  gap: 6px;
  background: #1e293b;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #334155;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #0284c7;
  color: #fff;
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
  background: rgba(56, 189, 248, 0.22);
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
  font-size: 0.76rem;
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
  font-size: 0.75rem;
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
  background: rgba(9, 13, 22, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.73rem;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.legend-text {
  line-height: 1.25;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-proton { background: #fb7185; box-shadow: 0 0 6px #fb7185; }
.dot-neutron { background: #94a3b8; box-shadow: 0 0 6px #94a3b8; }
.dot-gluon { background: #22d3ee; box-shadow: 0 0 6px #fbbf24; }
.dot-fe { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }

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

.state-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.77rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #bae6fd;
}

.state-badge.fusion {
  background: rgba(251, 191, 36, 0.14);
  border-color: rgba(251, 191, 36, 0.45);
  color: #fde68a;
}

.state-badge.defect {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 10px;
  margin-top: 12px;
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
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.08rem;
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
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 12px 14px;
  border-radius: 8px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
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
  gap: 6px;
}

.sim-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn.primary {
  background: #0284c7;
  color: #fff;
  border: none;
}

.sim-btn.primary:hover {
  background: #0369a1;
}

.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}

.sim-btn.secondary:hover {
  background: #475569;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: #1e293b;
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
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
    justify-content: space-between;
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
  .state-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
  .tab-btn {
    flex: 1 1 auto;
    text-align: center;
    font-size: 0.76rem;
    padding: 6px 8px;
  }
}
</style>
