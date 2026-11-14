<template>
  <div class="lab" :style="{ '--ac': '#fb7185', '--ac2': '#f97316' }">
    <div class="lab-head">
      <span class="lab-title">⚛️ 3D ラザフォード散乱実験（原子核の発見）シミュレーター</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ targetName }} (Z={{ targetZ }}) ｜ E<sub>k</sub>={{ energyMeV.toFixed(1) }} MeV</span>
      </div>
    </div>

    <p class="lab-desc">
      薄い金箔（<i>Z</i> = 79）に高速 α 粒子（+2<i>e</i>）を照射し、中心の超高密度な原子核（+<i>Ze</i>）からのクーロン反発力による 3D 双曲線軌道と、大角度後方散乱（<i>θ</i> &gt; 90°）および角度分布 <i>N</i>(<i>θ</i>) ∝ 1/sin<sup>4</sup>(<i>θ</i>/2) をリアルタイム観察できます。
    </p>

    <!-- カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button
        class="lab-btn primary"
        @click="isPlaying = !isPlaying"
        style="padding: 5px 14px; font-weight: 700; border-radius: 8px; font-size: 0.84rem;"
      >
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🐢 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="lab-btn" @click="clearTrails" style="padding: 5px 12px; font-size: 0.8rem;">
        🧹 軌跡・検出器リセット
      </button>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#fda4af;box-shadow:0 0 6px #fb7185"></i>
          原子核 (+{{ targetZ }}e)
        </span>
        <span class="legend-item">
          <i style="background:#f97316;box-shadow:0 0 6px #f97316"></i>
          α粒子・前方散乱
        </span>
        <span class="legend-item">
          <i style="background:#fb7185;box-shadow:0 0 6px #fb7185"></i>
          後方散乱 (θ &gt; 90°)
        </span>
        <span class="legend-item">
          <i style="background:#34d399;box-shadow:0 0 6px #34d399"></i>
          ZnS 検出弧 N(θ)
        </span>
        <span class="legend-item">
          <i style="background:#818cf8;box-shadow:0 0 6px #818cf8"></i>
          クーロン電場ポテンシャル
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 散乱ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: modelMode === 'rutherford' ? '#fb7185' : '#38bdf8', color: '#f8fafc' }">
        {{ modelMode === 'rutherford' ? '⚛️ ラザフォード模型 (点電荷核)' : '🍞 トムソン模型 (一様正電荷球)' }}
        ｜ 後方散乱 (θ &gt; 90°): <strong style="color:#fb7185">{{ backscatterCount }} 個</strong>
        ｜ 最接近距離 r<sub>min</sub> = {{ closestDistanceFm.toFixed(1) }} fm
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>標的原子核の原子番号 <i>Z</i>: <strong>{{ targetName }} (Z = {{ targetZ }})</strong></label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: targetZ === 79 }" @click="setTargetZ(79)">金 Au (Z=79)</button>
          <button class="lab-chip" :class="{ on: targetZ === 47 }" @click="setTargetZ(47)">銀 Ag (Z=47)</button>
          <button class="lab-chip" :class="{ on: targetZ === 13 }" @click="setTargetZ(13)">Al (Z=13)</button>
        </div>
        <div class="lab-note">原子番号 Z が大きいほどクーロン反発力が強く大角度散乱が増えます</div>
      </div>

      <div class="lab-ctrl">
        <label>α 粒子の運動エネルギー <i>E</i><sub>k</sub>: <strong>{{ energyMeV.toFixed(1) }} MeV</strong></label>
        <input type="range" v-model.number="energyMeV" min="3.0" max="9.0" step="0.5" />
        <div class="lab-note">高エネルギーほど原子核の近く (r<sub>min</sub> ∝ 1/E<sub>k</sub>) まで突入します</div>
      </div>

      <div class="lab-ctrl">
        <label>ビーム照射モード・狙い撃ち</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: isContinuousBeam }" @click="isContinuousBeam = true">
            連続ビーム照射
          </button>
          <button class="lab-chip" :class="{ on: !isContinuousBeam }" @click="fireSingleParticle">
            単一粒子発射 (b≈0付近)
          </button>
        </div>
        <div class="lab-note">単一粒子は芯の近く (小衝突パラメータ b) を狙い劇的な跳ね返りを観察できます</div>
      </div>

      <div class="lab-ctrl">
        <label>原子モデル比較</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: modelMode === 'rutherford' }" @click="setModelMode('rutherford')">
            ⚛️ ラザフォード模型
          </button>
          <button class="lab-chip" :class="{ on: modelMode === 'thomson' }" @click="setModelMode('thomson')">
            🍞 トムソン模型 (比較)
          </button>
        </div>
        <div class="lab-note">トムソン模型では正電荷が広がり散乱角が 1° 未満に留まります</div>
      </div>
    </div>

    <div class="lab-btns" style="margin-bottom: 0.9rem;">
      <button class="lab-btn" @click="resetDefaults">
        🔄 デフォルト設定に戻す (金箔 / 5.0 MeV)
      </button>
    </div>

    <!-- 物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">正面衝突の最接近距離 <i>r</i><sub>min</sub></div>
        <div class="v" style="color:#fbbf24">{{ closestDistanceFm.toFixed(1) }} <small>fm</small></div>
        <div class="f"><i>r</i><sub>min</sub> = (1/4<i>πε</i><sub>0</sub>)·(2<i>Ze</i><sup>2</sup>/<i>E</i><sub>k</sub>)</div>
      </div>

      <div class="lab-stat">
        <div class="k">原子核の推定サイズ</div>
        <div class="v">&lt; {{ closestDistanceFm.toFixed(0) }} <small>fm</small></div>
        <div class="f">原子全体 (10<sup>5</sup> fm) の約10万分の1</div>
      </div>

      <div class="lab-stat">
        <div class="k">総発射 α 粒子数</div>
        <div class="v" style="color:#38bdf8">{{ totalFiredCount }} <small>個</small></div>
        <div class="f">直進通過率: {{ straightThroughPct.toFixed(1) }}%</div>
      </div>

      <div class="lab-stat">
        <div class="k">ラザフォード散乱公式</div>
        <div class="v" style="font-size:1.0rem;color:#fb7185"><i>N</i>(<i>θ</i>) ∝ 1/sin<sup>4</sup>(<i>θ</i>/2)</div>
        <div class="f">点電荷クーロン反発の証拠</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const targetZ = ref(79)
const energyMeV = ref(5.0)
const isContinuousBeam = ref(true)
const modelMode = ref('rutherford')

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

const backscatterCount = ref(0)
const totalFiredCount = ref(0)
const straightThroughCount = ref(0)

const targetName = computed(() => {
  if (targetZ.value === 79) return '金 Au'
  if (targetZ.value === 47) return '銀 Ag'
  return 'アルミニウム Al'
})

const closestDistanceFm = computed(() => {
  return (2 * targetZ.value * 1.44) / energyMeV.value
})

const straightThroughPct = computed(() => {
  if (totalFiredCount.value === 0) return 99.8
  return (straightThroughCount.value / totalFiredCount.value) * 100
})

const threeContainer = ref(null)
let threeCtx = null
let staticGroup = null
let dynamicGroup = null
let lastCamAspect = 0
let spawnTimer = 0
let simTime = 0

const CHAMBER_R = 4.6
const GUN_X = -5.4
const MAX_ACTIVE = 28
const MAX_TRAIL_PTS = 48

const NUM_BINS = 18
const detectorHits = new Array(NUM_BINS).fill(0)
const binBars = []

const activeParticles = []
const trailRibbons = []

let potentialMesh = null
let rMinRing = null
let thomsonSphere = null
let nucleusMesh = null
let nucleusGlow = null

function getMobileScale() {
  if (!threeCtx?.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.15, 1.56 / Math.max(0.62, aspect)) : 1.0
}

function isNarrowViewport() {
  return Boolean(threeCtx?.camera && threeCtx.camera.aspect < 1.35)
}

function getSpriteScale(base = 0.42) {
  if (!isNarrowViewport()) return base
  return base * Math.min(1.85, getMobileScale() * 1.04)
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.2 * s, 8.2 * s, 11.4 * s], [-0.2, 0.1, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([-0.2, 0.35, 47.0 * s], [-0.2, 0.25, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([-0.2, 48.0 * s, -0.35], [-0.2, 0, -0.45], duration, 14)
  }
}

function clearGroup(group) {
  if (!group) return
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    child.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => {
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

function getVisRMin() {
  const raw = (targetZ.value / 79) * (5.0 / energyMeV.value) * 0.62
  return Math.min(1.38, Math.max(0.28, raw))
}

function buildStaticChamber() {
  if (!staticGroup) return
  clearGroup(staticGroup)
  binBars.length = 0

  const narrow = isNarrowViewport()
  const floorY = -1.65

  // 1. 実験室床グリッド & 真空チェンバー基台
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, floorY, 0)
  staticGroup.add(grid)

  const chamberBase = new THREE.Mesh(
    new THREE.CylinderGeometry(CHAMBER_R + 0.35, CHAMBER_R + 0.55, 0.22, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.72, roughness: 0.32 })
  )
  chamberBase.position.set(0, floorY + 0.11, 0)
  staticGroup.add(chamberBase)

  // 2. 薄い金箔（ターゲット原子面 x = 0）
  const foilFrameMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.32 })
  const foilPts = [
    new THREE.Vector3(0, -1.25, -2.5),
    new THREE.Vector3(0, 1.45, -2.5),
    new THREE.Vector3(0, 1.45, 2.5),
    new THREE.Vector3(0, -1.25, 2.5),
    new THREE.Vector3(0, -1.25, -2.5)
  ]
  staticGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(foilPts), foilFrameMat))

  const foilPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 2.7),
    new THREE.MeshBasicMaterial({
      color: targetZ.value === 79 ? 0xfbbf24 : targetZ.value === 47 ? 0xcbd5e1 : 0x94a3b8,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  foilPlane.rotation.y = Math.PI / 2
  foilPlane.position.set(0, 0.1, 0)
  staticGroup.add(foilPlane)

  // 3. 3D クーロン反発ポテンシャル曲面 (軽やかなメッシュで粒子軌道を隠さない)
  const potGeo = new THREE.PlaneGeometry(7.2, 7.2, 22, 22)
  potGeo.rotateX(-Math.PI / 2)
  const posAttr = potGeo.getAttribute('position')
  const visRMin = getVisRMin()
  const isRutherford = modelMode.value === 'rutherford'
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i)
    const pz = posAttr.getZ(i)
    const r = Math.sqrt(px * px + pz * pz)
    let u = 0
    if (isRutherford) {
      u = Math.min(1.95, (visRMin * 1.05) / Math.max(0.26, r)) - 0.15
    } else {
      const R_th = 2.1
      u = r < R_th ? 0.36 * (1.5 - 0.5 * (r * r) / (R_th * R_th)) : (0.36 * R_th) / r
    }
    posAttr.setY(i, Math.max(-0.05, u) - 0.88)
  }
  potGeo.computeVertexNormals()
  potentialMesh = new THREE.Mesh(
    potGeo,
    new THREE.MeshBasicMaterial({
      color: isRutherford ? 0x818cf8 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.11,
      depthWrite: false
    })
  )
  staticGroup.add(potentialMesh)

  for (const rad of [1.1, 2.2, 3.3]) {
    const eqRing = new THREE.Mesh(
      new THREE.RingGeometry(rad - 0.015, rad + 0.015, 64),
      new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
    eqRing.rotation.x = -Math.PI / 2
    eqRing.position.y = -0.04
    staticGroup.add(eqRing)
  }

  // 4. 標的原子核 (+Ze ローズゴールド) または トムソン模型
  const nucColor = targetZ.value === 79 ? 0xfb7185 : targetZ.value === 47 ? 0xe2e8f0 : 0x38bdf8
  const nucEmissive = targetZ.value === 79 ? 0xf59e0b : targetZ.value === 47 ? 0x94a3b8 : 0x0284c7
  const nucScale = 0.20 + (targetZ.value / 79) * 0.10

  if (isRutherford) {
    nucleusMesh = new THREE.Mesh(
      new THREE.SphereGeometry(nucScale, 28, 28),
      new THREE.MeshStandardMaterial({
        color: nucColor,
        emissive: nucEmissive,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.45
      })
    )
    staticGroup.add(nucleusMesh)

    nucleusGlow = new THREE.Mesh(
      new THREE.SphereGeometry(nucScale * 1.9, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xfda4af,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      })
    )
    staticGroup.add(nucleusGlow)

    rMinRing = new THREE.Mesh(
      new THREE.TorusGeometry(visRMin, 0.026, 10, 48),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.84 })
    )
    rMinRing.rotation.x = Math.PI / 2
    staticGroup.add(rMinRing)

    const rMinLabel = createTextSprite(
      narrow ? `r_min=${closestDistanceFm.value.toFixed(0)}fm` : `最接近距離 r_min = ${closestDistanceFm.value.toFixed(1)} fm`,
      {
        color: '#fde68a',
        borderColor: '#fbbf24',
        fontSize: 27,
        scale: getSpriteScale(0.36)
      }
    )
    rMinLabel.position.set(0.45, -1.35, visRMin + 0.55)
    staticGroup.add(rMinLabel)
  } else {
    thomsonSphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 32, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
      })
    )
    staticGroup.add(thomsonSphere)

    const eDotGeo = new THREE.SphereGeometry(0.06, 10, 10)
    const eDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    for (let k = 0; k < 14; k++) {
      const phi = k * 2.39996
      const rr = 0.55 + (k % 3) * 0.45
      const yy = ((k % 5) - 2) * 0.35
      const ed = new THREE.Mesh(eDotGeo, eDotMat)
      ed.position.set(rr * Math.cos(phi), yy, rr * Math.sin(phi))
      staticGroup.add(ed)
    }
  }

  const nucleusLabel = createTextSprite(
    isRutherford
      ? (narrow ? `+${targetZ.value}e 核` : `${targetName.value} 原子核 (+${targetZ.value}e)`)
      : 'トムソン模型 (+Ze 拡散)',
    {
      color: isRutherford ? '#fda4af' : '#fde68a',
      borderColor: isRutherford ? '#fb7185' : '#f59e0b',
      fontSize: 28,
      scale: getSpriteScale(0.40)
    }
  )
  nucleusLabel.position.set(0, isRutherford ? 1.95 : 2.35, -0.35)
  staticGroup.add(nucleusLabel)

  // 5. α線コリメータ銃 (左側 x = GUN_X)
  const gunBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.52, 1.35, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.28 })
  )
  gunBody.rotation.z = Math.PI / 2
  gunBody.position.set(GUN_X - 0.35, 0, 0)
  staticGroup.add(gunBody)

  const gunSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.44, 2.35),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
  )
  gunSlot.position.set(GUN_X + 0.32, 0, 0)
  staticGroup.add(gunSlot)

  const gunGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.22, 2.1),
    new THREE.MeshBasicMaterial({ color: 0xf97316 })
  )
  gunGlow.position.set(GUN_X + 0.45, 0, 0)
  staticGroup.add(gunGlow)

  const gunLbl = createTextSprite(narrow ? 'α線源 (²¹⁰Po)' : `α線源 ²¹⁰Po (${energyMeV.value.toFixed(1)} MeV)`, {
    color: '#fdba74',
    borderColor: '#f97316',
    fontSize: 27,
    scale: getSpriteScale(0.40)
  })
  gunLbl.position.set(GUN_X + 0.35, 1.25, -1.75)
  staticGroup.add(gunLbl)

  // 6. ZnS 蛍光検出スクリーン円弧 & 角度ラベル (X/Y/Z を各視点で非重複配置)
  const arcPts = []
  const arcSegs = 80
  for (let i = 0; i <= arcSegs; i++) {
    const ang = -Math.PI * 0.90 + (i / arcSegs) * (Math.PI * 1.80)
    arcPts.push(new THREE.Vector3(CHAMBER_R * Math.cos(ang), 0.02, CHAMBER_R * Math.sin(ang)))
  }
  staticGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.75 })
    )
  )

  const wallGeo = new THREE.CylinderGeometry(CHAMBER_R, CHAMBER_R, 0.56, 64, 1, true, Math.PI * 0.62, Math.PI * 1.76)
  const wallMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.10,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const wallMesh = new THREE.Mesh(wallGeo, wallMat)
  wallMesh.position.set(0, 0.24, 0)
  staticGroup.add(wallMesh)

  const lbl0 = createTextSprite('θ=0° (直進)', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 27, scale: getSpriteScale(0.36) })
  lbl0.position.set(CHAMBER_R + 0.55, 0.45, 0.55)

  const lbl90 = createTextSprite('90°', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 27, scale: getSpriteScale(0.35) })
  lbl90.position.set(-1.35, -0.82, CHAMBER_R + 0.45)

  const lbl180 = createTextSprite(narrow ? '180° 後方' : '180° (後方散乱)', { color: '#fda4af', borderColor: '#fb7185', fontSize: 27, scale: getSpriteScale(0.37) })
  lbl180.position.set(-CHAMBER_R - 0.15, -0.82, 1.55)
  staticGroup.add(lbl0, lbl90, lbl180)

  const znsLbl = createTextSprite(narrow ? 'ZnS 検出器 N(θ)' : 'ZnS 蛍光検出器 N(θ) ∝ 1/sin⁴(θ/2)', {
    color: '#6ee7b7',
    borderColor: '#34d399',
    fontSize: 27,
    scale: getSpriteScale(0.39)
  })
  znsLbl.position.set(3.35, 1.35, 2.85)
  staticGroup.add(znsLbl)

  // 7. 角度分布 N(θ) 3Dヒストグラムバー
  const barGeo = new THREE.BoxGeometry(0.18, 1.0, 0.18)
  barGeo.translate(0, 0.5, 0)
  for (let b = 0; b < NUM_BINS; b++) {
    const thetaDeg = (b + 0.5) * 10
    const rad = (thetaDeg * Math.PI) / 180
    const isBack = thetaDeg > 90
    const mat = new THREE.MeshStandardMaterial({
      color: isBack ? 0xfb7185 : 0x34d399,
      emissive: isBack ? 0xf43f5e : 0x10b981,
      emissiveIntensity: 0.72
    })
    const bar = new THREE.Mesh(barGeo, mat)
    bar.position.set((CHAMBER_R + 0.28) * Math.cos(rad), 0.0, -(CHAMBER_R + 0.28) * Math.sin(rad))
    bar.scale.set(1, 0.04, 1)
    staticGroup.add(bar)
    binBars.push(bar)
  }

  updateHistogramBars()
}

function updateHistogramBars() {
  if (binBars.length === 0) return
  let maxVal = 1
  for (let i = 0; i < NUM_BINS; i++) {
    if (detectorHits[i] > maxVal) maxVal = detectorHits[i]
  }
  for (let i = 0; i < NUM_BINS; i++) {
    const h = 0.05 + (detectorHits[i] / maxVal) * 1.65
    binBars[i].scale.set(1, h, 1)
  }
}

function initParticlePool() {
  if (!dynamicGroup) return
  clearGroup(dynamicGroup)
  activeParticles.length = 0
  trailRibbons.length = 0

  const sphereGeo = new THREE.SphereGeometry(0.135, 14, 14)
  const indices = []
  for (let k = 0; k < MAX_TRAIL_PTS - 1; k++) {
    const a = k * 2
    const b = k * 2 + 1
    const c = (k + 1) * 2
    const d = (k + 1) * 2 + 1
    indices.push(a, b, c, b, d, c)
  }

  for (let i = 0; i < MAX_ACTIVE; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 1.05
    })
    const mesh = new THREE.Mesh(sphereGeo, mat)
    mesh.frustumCulled = false
    mesh.visible = false
    dynamicGroup.add(mesh)

    // 3Dリボン軌跡メッシュ (WebGL linewidth=1px制限を回避し常に高視認性の太い発光軌道を描画)
    const tGeo = new THREE.BufferGeometry()
    const pos = new Float32Array(MAX_TRAIL_PTS * 2 * 3)
    tGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    tGeo.setIndex(indices)
    tGeo.setDrawRange(0, 0)
    const tMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const ribbon = new THREE.Mesh(tGeo, tMat)
    ribbon.frustumCulled = false
    ribbon.visible = false
    dynamicGroup.add(ribbon)

    trailRibbons.push({ mesh, mat, ribbon, tGeo, tMat, pos })
  }
}

function spawnParticle(forcedB = null) {
  totalFiredCount.value++
  let b
  if (forcedB !== null) {
    b = forcedB
  } else if (Math.random() < 0.30) {
    b = (Math.random() - 0.5) * 0.72
  } else {
    b = (Math.random() - 0.5) * 3.8
  }
  const speed = 3.2 * Math.sqrt(energyMeV.value / 5.0)
  const yOffset = forcedB !== null ? 0 : (Math.random() - 0.5) * 0.14

  let slot = -1
  for (let i = 0; i < MAX_ACTIVE; i++) {
    if (!activeParticles[i] || !activeParticles[i].alive) {
      slot = i
      break
    }
  }
  if (slot === -1) slot = 0

  activeParticles[slot] = {
    x: GUN_X + 0.5,
    y: yOffset,
    z: b,
    vx: speed,
    vy: 0,
    vz: 0,
    b,
    alive: true,
    isBackscatter: false,
    pts: [{ x: GUN_X + 0.5, y: yOffset, z: b }]
  }
}

function fireSingleParticle() {
  isContinuousBeam.value = false
  const sign = Math.random() < 0.5 ? 1 : -1
  spawnParticle(sign * (0.04 + Math.random() * 0.15))
}

function clearTrails() {
  activeParticles.forEach((p, idx) => {
    if (p) p.alive = false
    if (trailRibbons[idx]) {
      trailRibbons[idx].mesh.visible = false
      trailRibbons[idx].ribbon.visible = false
    }
  })
  detectorHits.fill(0)
  backscatterCount.value = 0
  totalFiredCount.value = 0
  straightThroughCount.value = 0
  updateHistogramBars()
}

function setTargetZ(z) {
  targetZ.value = z
  buildStaticChamber()
}

function setModelMode(mode) {
  modelMode.value = mode
  clearTrails()
  buildStaticChamber()
  seedInitialDemoParticles()
}

function resetDefaults() {
  targetZ.value = 79
  energyMeV.value = 5.0
  isContinuousBeam.value = true
  modelMode.value = 'rutherford'
  clearTrails()
  buildStaticChamber()
  seedInitialDemoParticles()
}

function seedInitialDemoParticles() {
  const bs = [-1.45, -0.55, -0.14, 0.11, 0.48, 1.35]
  bs.forEach((b, idx) => {
    spawnParticle(b)
    const steps = 24 + idx * 12
    for (let s = 0; s < steps; s++) {
      stepPhysics(0.025, false)
    }
  })
}

function stepPhysics(dt, allowSpawn = true) {
  if (allowSpawn && isContinuousBeam.value) {
    spawnTimer += dt
    if (spawnTimer >= 0.19) {
      spawnTimer = 0
      spawnParticle()
    }
  }

  const kCoulomb = 3.2 * (targetZ.value / 79)
  const isRutherford = modelMode.value === 'rutherford'
  const R_thomson = 2.1

  const subSteps = 4
  const h = dt / subSteps

  for (let i = 0; i < MAX_ACTIVE; i++) {
    const p = activeParticles[i]
    const tl = trailRibbons[i]
    if (!p || !tl || !p.alive) continue

    for (let s = 0; s < subSteps; s++) {
      const rSq = p.x * p.x + p.y * p.y + p.z * p.z
      const r = Math.sqrt(rSq)
      let fMag = 0
      if (isRutherford) {
        const effR = Math.max(0.14, r)
        fMag = kCoulomb / (effR * effR)
      } else {
        if (r < R_thomson) {
          fMag = (kCoulomb * 0.025 * r) / (R_thomson * R_thomson * R_thomson)
        } else {
          fMag = (kCoulomb * 0.025) / (r * r)
        }
      }

      if (r > 1e-4) {
        p.vx += (fMag * (p.x / r)) * h
        p.vy += (fMag * (p.y / r)) * h
        p.vz += (fMag * (p.z / r)) * h
      }

      p.x += p.vx * h
      p.y += p.vy * h
      p.z += p.vz * h
    }

    p.pts.push({ x: p.x, y: p.y, z: p.z })
    if (p.pts.length > MAX_TRAIL_PTS) p.pts.shift()

    const angRad = Math.atan2(Math.abs(p.vz), p.vx)
    const angDeg = (angRad * 180) / Math.PI
    p.isBackscatter = angDeg > 90

    const rNow = Math.hypot(p.x, p.z)
    const rDotV = p.x * p.vx + p.z * p.vz
    if (rNow >= CHAMBER_R && p.pts.length > 6 && rDotV > 0) {
      p.alive = false
      const bin = Math.min(NUM_BINS - 1, Math.floor(angDeg / 10))
      detectorHits[bin]++
      if (angDeg > 90) backscatterCount.value++
      if (angDeg < 8) straightThroughCount.value++
      updateHistogramBars()
    } else if (p.x < GUN_X - 0.5 || Math.abs(p.z) > 6.2) {
      p.alive = false
    }
  }
}

function syncMeshes(dt) {
  simTime += dt
  if (nucleusMesh && nucleusGlow) {
    const pulse = 1 + 0.09 * Math.sin(simTime * 3.8)
    nucleusGlow.scale.set(pulse, pulse, pulse)
  }

  const halfW = 0.038
  for (let i = 0; i < MAX_ACTIVE; i++) {
    const p = activeParticles[i]
    const tl = trailRibbons[i]
    if (!tl) continue
    if (!p) {
      tl.mesh.visible = false
      tl.ribbon.visible = false
      continue
    }

    const col = p.isBackscatter ? 0xfb7185 : 0xf97316
    tl.mat.color.setHex(col)
    tl.mat.emissive.setHex(col)
    tl.tMat.color.setHex(col)

    tl.mesh.visible = p.alive
    if (p.alive) {
      tl.mesh.position.set(p.x, p.y, p.z)
    }

    const len = p.pts.length
    if (len >= 2) {
      tl.ribbon.visible = true
      tl.tMat.opacity = p.alive ? 0.85 : 0.36
      for (let k = 0; k < len; k++) {
        const cur = p.pts[k]
        const next = k < len - 1 ? p.pts[k + 1] : cur
        const prev = k > 0 ? p.pts[k - 1] : cur
        let tx = next.x - prev.x
        let tz = next.z - prev.z
        const tLen = Math.hypot(tx, tz) || 1
        const nx = -tz / tLen
        const nz = tx / tLen
        const taper = (k / Math.max(1, len - 1)) * halfW

        const vIdx = k * 2
        tl.pos[vIdx * 3] = cur.x + nx * taper
        tl.pos[vIdx * 3 + 1] = cur.y + 0.02
        tl.pos[vIdx * 3 + 2] = cur.z + nz * taper

        tl.pos[(vIdx + 1) * 3] = cur.x - nx * taper
        tl.pos[(vIdx + 1) * 3 + 1] = cur.y - 0.02
        tl.pos[(vIdx + 1) * 3 + 2] = cur.z - nz * taper
      }
      tl.tGeo.setDrawRange(0, (len - 1) * 6)
      tl.tGeo.getAttribute('position').needsUpdate = true
    } else {
      tl.ribbon.visible = false
    }
  }
}

watch([targetZ, energyMeV], () => {
  buildStaticChamber()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0.2, 8.2, 11.4],
    initialTarget: [-0.2, 0.1, 0],
    maxDistance: 130,
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        buildStaticChamber()
      }
      if (isPlaying.value) {
        const effDt = Math.min(0.05, dt) * timeScale.value
        stepPhysics(effDt, true)
        syncMeshes(effDt)
      }
    }
  })

  staticGroup = new THREE.Group()
  dynamicGroup = new THREE.Group()
  threeCtx.scene.add(staticGroup)
  threeCtx.scene.add(dynamicGroup)

  lastCamAspect = threeCtx.camera.aspect || 1.7
  buildStaticChamber()
  initParticlePool()
  seedInitialDemoParticles()
  syncMeshes(0)
  setCameraPreset(activeCam.value, 0)
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.lab-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(251, 113, 133, 0.25);
  border-radius: 10px;
}

.preset-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fda4af;
}

.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 0 0.65rem 0;
  padding: 8px 12px;
  border-radius: 10px;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 4px 10px;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
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
  height: 430px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  margin-bottom: 0.65rem;
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

.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
  pointer-events: none;
}

.ortho-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.2rem 0 0.8rem 0;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(251, 113, 133, 0.45);
  font-size: 0.75rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 345px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 7px;
    font-size: 0.67rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.67rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    font-size: 0.7rem;
    padding: 4px 9px;
  }
}

@media (max-width: 640px) {
  .lab {
    padding: 0.85rem;
  }
  .speed-control-group {
    border-radius: 10px;
    padding: 5px 9px;
    width: 100%;
  }
  .ortho-status-strip {
    justify-content: flex-start;
  }
}
</style>
