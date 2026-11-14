<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚡</span>
        <h3 class="sim-title">3D クーロンの法則・電場と等電位線 実験室</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan"><i>F</i> = <i>k</i>|<i>Q</i><sub>1</sub><i>Q</i><sub>2</sub>| / <i>r</i><sup>2</sup></span>
        <span class="badge badge-purple"><b>E</b> = −∇<i>V</i></span>
      </div>
    </div>

    <p class="desc">
      3D空間における点電荷（正電荷 #fb7185 / 負電荷 #38bdf8）、電気双極子、四重極、一様電場の電気力線・方向コーン・等電位面（3D電位標高）をリアルタイム可視化。
      静電力 <i>F</i> = <i>q</i><i>E</i> によるテスト電荷の3D運動シミュレーションも体験できます。
    </p>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: simMode === 'twoCharges' }" @click="simMode = 'twoCharges'">
        ① 2点電荷（自由調整）
      </button>
      <button :class="{ active: simMode === 'dipole' }" @click="setPresetDipole">
        ② 電気双極子 (+q / −q)
      </button>
      <button :class="{ active: simMode === 'quadrupole' }" @click="simMode = 'quadrupole'">
        ③ 四重極 (Quadrupole)
      </button>
      <button :class="{ active: simMode === 'uniform' }" @click="simMode = 'uniform'">
        ④ 一様電場 (平行極板)
      </button>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 3Dカメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D俯瞰
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面
        </button>
      </div>
    </div>

    <!-- 再生・テスト電荷操作バー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="action-btn-group">
        <button class="btn btn-launch" @click="launchTestCharge(1.0)">
          🚀 +1μC テスト電荷を放つ
        </button>
        <button class="btn btn-launch-neg" @click="launchTestCharge(-1.0)">
          💫 −1μC テスト電荷を放つ
        </button>
        <button class="btn btn-secondary" v-if="testCharges.length > 0" @click="clearTestCharges">
          ✕ 軌道を消去
        </button>
      </div>
      <button class="btn btn-secondary" @click="resetDefaults">
        ⏮ 初期状態
      </button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" style="background:#fb7185;box-shadow:0 0 6px #fb7185"></i>
            正電荷 (+Q)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            負電荷 (−Q)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#a78bfa;box-shadow:0 0 6px #a78bfa"></i>
            電気力線 (Streamlines)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            等電位面 / テスト粒子
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ 左ドラッグで3D回転 ・ 右ドラッグで移動 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータスバー -->
    <div class="mode-status-strip">
      <span class="three-status-badge active">
        {{ statusSummary }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <!-- 2点電荷パラメータ -->
      <div v-if="simMode === 'twoCharges' || simMode === 'dipole'" class="controls-grid">
        <div class="control-group">
          <label>
            <span>左の電荷 <i>Q</i><sub>1</sub>:</span>
            <strong :style="{ color: q1 > 0 ? '#fb7185' : (q1 < 0 ? '#38bdf8' : '#94a3b8') }">
              {{ q1 > 0 ? '+' : '' }}{{ q1.toFixed(1) }} μC
            </strong>
          </label>
          <input type="range" v-model.number="q1" min="-5.0" max="5.0" step="0.5" />
          <div class="quick-chips">
            <button class="mini-chip" @click="q1 = 3.0">+3.0 μC</button>
            <button class="mini-chip" @click="q1 = -3.0">−3.0 μC</button>
            <button class="mini-chip" @click="q1 = 1.0">+1.0 μC</button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>右の電荷 <i>Q</i><sub>2</sub>:</span>
            <strong :style="{ color: q2 > 0 ? '#fb7185' : (q2 < 0 ? '#38bdf8' : '#94a3b8') }">
              {{ q2 > 0 ? '+' : '' }}{{ q2.toFixed(1) }} μC
            </strong>
          </label>
          <input type="range" v-model.number="q2" min="-5.0" max="5.0" step="0.5" />
          <div class="quick-chips">
            <button class="mini-chip" @click="q2 = -3.0">−3.0 μC</button>
            <button class="mini-chip" @click="q2 = 3.0">+3.0 μC</button>
            <button class="mini-chip" @click="q2 = 0.0">0 μC (単独)</button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>電荷間距離 <i>r</i>:</span>
            <strong>{{ chargeDist.toFixed(2) }} m</strong>
          </label>
          <input type="range" v-model.number="chargeDist" min="1.0" max="5.0" step="0.2" />
        </div>
      </div>

      <!-- 四重極パラメータ -->
      <div v-if="simMode === 'quadrupole'" class="controls-grid">
        <div class="control-group">
          <label>
            <span>四重極の電荷の大きさ |<i>Q</i>|:</span>
            <strong style="color:#fb7185">{{ quadQ.toFixed(1) }} μC</strong>
          </label>
          <input type="range" v-model.number="quadQ" min="1.0" max="5.0" step="0.5" />
          <span class="sub-info">対角線上に +Q と −Q を正方形配置</span>
        </div>
        <div class="control-group">
          <label>
            <span>配置の広がり <i>a</i>:</span>
            <strong>{{ quadSize.toFixed(2) }} m</strong>
          </label>
          <input type="range" v-model.number="quadSize" min="1.0" max="4.0" step="0.2" />
        </div>
      </div>

      <!-- 一様電場パラメータ -->
      <div v-if="simMode === 'uniform'" class="controls-grid">
        <div class="control-group">
          <label>
            <span>電場強度 <i>E</i><sub>0</sub>:</span>
            <strong style="color:#a78bfa">{{ uniformE.toFixed(1) }} kV/m</strong>
          </label>
          <input type="range" v-model.number="uniformE" min="0.5" max="5.0" step="0.5" />
        </div>
        <div class="control-group">
          <label>
            <span>極板間隔 <i>d</i>:</span>
            <strong>{{ uniformD.toFixed(1) }} m</strong>
          </label>
          <input type="range" v-model.number="uniformD" min="2.0" max="6.0" step="0.5" />
          <span class="sub-info">極板間電位差 <i>V</i> = <i>E</i><i>d</i> = {{ (uniformE * uniformD).toFixed(1) }} kV</span>
        </div>
      </div>

      <!-- 表示オプション -->
      <div class="options-row">
        <span class="opt-label">👁️ 3D表示切替:</span>
        <label class="check-label">
          <input type="checkbox" v-model="showLines" />
          電気力線 &amp; 矢印コーン
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showEquipotential" />
          等電位等高線
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showRelief" />
          3D電位標高面（山と谷）
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showVectors" />
          電場ベクトル格子
        </label>
      </div>

      <!-- 典型配置クイックプリセット -->
      <div v-if="simMode === 'twoCharges'" class="preset-chips-bar">
        <span class="chip-title">典型配置プリセット:</span>
        <button class="chip-btn-sm" @click="setPreset(3, -3)">電気双極子 (+3 / −3)</button>
        <button class="chip-btn-sm" @click="setPreset(3, 3)">同種反発 (+3 / +3)</button>
        <button class="chip-btn-sm" @click="setPreset(4, -1)">非対称 (+4 / −1)</button>
        <button class="chip-btn-sm" @click="setPreset(4, 0)">単独点電荷 (+4)</button>
      </div>
    </div>

    <!-- 物理量統計パネル -->
    <div class="stats-panel">
      <div class="stat-card hl">
        <div class="label">クーロン力 <i>F</i> (2電荷間)</div>
        <div class="val" :style="{ color: forceColor }">
          {{ isFinite(coulombForceN) ? fmt(coulombForceN, 3) : '—' }} <small>N</small>
        </div>
        <div class="sub">
          {{ forceNatureText }}
        </div>
      </div>

      <div class="stat-card">
        <div class="label">中心点の電場 <i>E</i><sub>mid</sub></div>
        <div class="val highlight">
          {{ midFieldMagText }} <small>N/C</small>
        </div>
        <div class="sub"><b>E</b> = Σ <i>k</i><i>Q</i><sub>i</sub>/<i>r</i><sup>2</sup> <b>r̂</b> (ベクトル和)</div>
      </div>

      <div class="stat-card">
        <div class="label">中心点の電位 <i>V</i><sub>mid</sub></div>
        <div class="val highlight-alt">
          {{ midPotentialText }} <small>V</small>
        </div>
        <div class="sub"><i>V</i> = Σ <i>k</i><i>Q</i><sub>i</sub>/<i>r</i> (スカラー和)</div>
      </div>

      <div class="stat-card">
        <div class="label">放たれたテスト電荷</div>
        <div class="val" :class="testCharges.length > 0 ? 'current-flow' : 'current-zero'">
          {{ testCharges.length }} <small>個 追跡中</small>
        </div>
        <div class="sub"><i>m</i> <b>a</b> = <i>q</i> <b>E</b> (電場から力を受けて運動)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'
import { fmt } from './simUtils.js'

// クーロン定数
const kE = 8.98755e9

// UI状態
const threeContainer = ref(null)
let threeCtx = null
let appGroup = null

const isPlaying = ref(true)
const activeCam = ref('3d')
const simMode = ref('twoCharges') // 'twoCharges' | 'dipole' | 'quadrupole' | 'uniform'

// パラメータ
const q1 = ref(3.0) // μC
const q2 = ref(-3.0) // μC
const chargeDist = ref(3.0) // m

const quadQ = ref(3.0) // μC
const quadSize = ref(2.4) // m

const uniformE = ref(2.0) // kV/m
const uniformD = ref(3.6) // m

// 表示切替
const showLines = ref(true)
const showEquipotential = ref(true)
const showRelief = ref(false)
const showVectors = ref(false)

// テスト電荷リスト
const testCharges = ref([])

function setPreset(c1, c2) {
  simMode.value = 'twoCharges'
  q1.value = c1
  q2.value = c2
}

function setPresetDipole() {
  simMode.value = 'dipole'
  q1.value = 3.0
  q2.value = -3.0
}

function resetDefaults() {
  simMode.value = 'twoCharges'
  q1.value = 3.0
  q2.value = -3.0
  chargeDist.value = 3.0
  showLines.value = true
  showEquipotential.value = true
  showRelief.value = false
  showVectors.value = false
  clearTestCharges()
}

// 物理計算
const currentCharges = computed(() => {
  if (simMode.value === 'twoCharges' || simMode.value === 'dipole') {
    const half = chargeDist.value / 2
    return [
      { x: -half, y: 0, z: 0, q: q1.value * 1e-6, qMicro: q1.value, label: 'Q₁' },
      { x: half, y: 0, z: 0, q: q2.value * 1e-6, qMicro: q2.value, label: 'Q₂' }
    ]
  }
  if (simMode.value === 'quadrupole') {
    const s = quadSize.value / 2
    const qVal = quadQ.value * 1e-6
    return [
      { x: -s, y: 0, z: -s, q: qVal, qMicro: quadQ.value, label: '+Q' },
      { x: s, y: 0, z: -s, q: -qVal, qMicro: -quadQ.value, label: '−Q' },
      { x: s, y: 0, z: s, q: qVal, qMicro: quadQ.value, label: '+Q' },
      { x: -s, y: 0, z: s, q: -qVal, qMicro: -quadQ.value, label: '−Q' }
    ]
  }
  // uniform
  return []
})

// クーロン力（2電荷間）
const coulombForceN = computed(() => {
  if (simMode.value !== 'twoCharges' && simMode.value !== 'dipole') return 0
  const r = chargeDist.value
  const c1 = q1.value * 1e-6
  const c2 = q2.value * 1e-6
  return (kE * Math.abs(c1 * c2)) / (r * r)
})

const forceNatureText = computed(() => {
  if (simMode.value === 'uniform') return '極板間は一様な電場 E₀'
  if (simMode.value === 'quadrupole') return '多重極相互作用（4電荷配置）'
  if (q1.value * q2.value < 0) return '引力（互いに引き合う）'
  if (q1.value * q2.value > 0) return '斥力（反発して遠ざかる）'
  return '静電力なし (片方または両方が0)'
})

const forceColor = computed(() => {
  if (simMode.value === 'twoCharges' || simMode.value === 'dipole') {
    return q1.value * q2.value < 0 ? '#38bdf8' : (q1.value * q2.value > 0 ? '#fb7185' : '#94a3b8')
  }
  return '#a78bfa'
})

// 中心点での電場・電位計算
function getFieldAndPotentialAt(x, y, z) {
  if (simMode.value === 'uniform') {
    // 平行極板: x方向に向かう一様電場 E = uniformE kV/m = uniformE*1000 N/C
    const E0 = uniformE.value * 1000
    const half = uniformD.value / 2
    if (x >= -half && x <= half) {
      // 電位: x = -half で V = E0 * D, x = half で 0
      const V = E0 * (half - x)
      return { Ex: E0, Ey: 0, Ez: 0, V }
    }
    return { Ex: 0, Ey: 0, Ez: 0, V: 0 }
  }

  let Ex = 0, Ey = 0, Ez = 0, V = 0
  const charges = currentCharges.value
  for (const c of charges) {
    if (Math.abs(c.q) < 1e-12) continue
    const dx = x - c.x
    const dy = y - c.y
    const dz = z - c.z
    const rSq = dx * dx + dy * dy + dz * dz
    const r = Math.sqrt(rSq)
    if (r > 0.05) {
      const eFac = (kE * c.q) / (rSq * r)
      Ex += eFac * dx
      Ey += eFac * dy
      Ez += eFac * dz
      V += (kE * c.q) / r
    }
  }
  return { Ex, Ey, Ez, V }
}

const midFieldMagText = computed(() => {
  if (simMode.value === 'uniform') {
    return `${(uniformE.value * 1000).toLocaleString()}`
  }
  const { Ex, Ey, Ez } = getFieldAndPotentialAt(0, 0, 0)
  const mag = Math.hypot(Ex, Ey, Ez)
  return mag < 1e4 ? mag.toFixed(1) : mag.toExponential(2)
})

const midPotentialText = computed(() => {
  const { V } = getFieldAndPotentialAt(0, 0, 0)
  return Math.abs(V) < 1e4 ? V.toFixed(1) : V.toExponential(2)
})

const statusSummary = computed(() => {
  if (simMode.value === 'twoCharges') {
    return `2点電荷モード: Q₁ = ${q1.value > 0 ? '+' : ''}${q1.value} μC, Q₂ = ${q2.value > 0 ? '+' : ''}${q2.value} μC, 距離 r = ${chargeDist.value.toFixed(2)} m`
  }
  if (simMode.value === 'dipole') {
    return `電気双極子モード: +${q1.value} μC と ${q2.value} μC が対をなし、中心で V=0 ですが電場 E は最大`
  }
  if (simMode.value === 'quadrupole') {
    return `四重極モード: 対角線上に交互に ±${quadQ.value} μC を配置。4重対称の電場マップ`
  }
  return `一様電場モード: 平行平板極板間の一様な電界 E₀ = ${uniformE.value.toFixed(1)} kV/m (V = Ed)`
})

// ==========================================
// カメラ制御
// ==========================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return w < 540 || aspect < 1.35 ? Math.min(1.8, Math.max(1.15, 1.55 / Math.max(0.66, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.05, 34.0 * ms], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 36.0 * ms, 0.001], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0, 8.5 * ms, 13.5 * ms], target: [0, 0, 0], fov: 42 }
}

function setCameraPreset(preset) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, 0.55, fov)
}

// ==========================================
// テスト電荷アニメーション
// ==========================================
function launchTestCharge(sign = 1.0) {
  const startX = (Math.random() - 0.5) * 1.5
  const startZ = (Math.random() - 0.5) * 1.5 + (sign > 0 ? -1.0 : 1.0)
  const startY = (Math.random() - 0.5) * 0.4

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    new THREE.MeshStandardMaterial({
      color: sign > 0 ? 0xfbbf24 : 0x34d399,
      emissive: sign > 0 ? 0xf59e0b : 0x10b981,
      emissiveIntensity: 0.8,
      roughness: 0.2
    })
  )
  mesh.position.set(startX, startY, startZ)
  appGroup.add(mesh)

  // 軌道ライン用
  const maxPts = 120
  const pts = [new THREE.Vector3(startX, startY, startZ)]
  const trailGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const trailMat = new THREE.LineBasicMaterial({
    color: sign > 0 ? 0xfbbf24 : 0x34d399,
    transparent: true,
    opacity: 0.8
  })
  const trailLine = new THREE.Line(trailGeo, trailMat)
  appGroup.add(trailLine)

  testCharges.value.push({
    mesh,
    trailLine,
    trailGeo,
    pts,
    maxPts,
    x: startX,
    y: startY,
    z: startZ,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 0,
    vz: (Math.random() - 0.5) * 0.5,
    q: sign * 1e-6, // 1μC
    mass: 1e-4, // スケーリングした擬似質量
    alive: true,
    age: 0
  })
}

function clearTestCharges() {
  for (const tc of testCharges.value) {
    if (tc.mesh && tc.mesh.parent) tc.mesh.parent.remove(tc.mesh)
    if (tc.trailLine && tc.trailLine.parent) tc.trailLine.parent.remove(tc.trailLine)
    if (tc.mesh.geometry) tc.mesh.geometry.dispose()
    if (tc.mesh.material) tc.mesh.material.dispose()
    if (tc.trailGeo) tc.trailGeo.dispose()
    if (tc.trailMat) tc.trailMat.dispose()
  }
  testCharges.value = []
}

// ==========================================
// Three.js シーン構築
// ==========================================
let chargeMeshes = []
let streamlineGroup = null
let equipotentialGroup = null
let reliefMesh = null
let vectorGridGroup = null
let uniformPlatesGroup = null
let pulseParticles = []

function initScene(scene) {
  appGroup = new THREE.Group()
  scene.add(appGroup)

  // 基準床グリッド
  const gridHelper = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  gridHelper.position.y = -2.2
  appGroup.add(gridHelper)

  // グループ初期化
  streamlineGroup = new THREE.Group()
  equipotentialGroup = new THREE.Group()
  vectorGridGroup = new THREE.Group()
  uniformPlatesGroup = new THREE.Group()
  appGroup.add(streamlineGroup)
  appGroup.add(equipotentialGroup)
  appGroup.add(vectorGridGroup)
  appGroup.add(uniformPlatesGroup)

  rebuildScene()
}

function cleanupSubgroup(grp) {
  while (grp.children.length > 0) {
    const obj = grp.children[0]
    grp.remove(obj)
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
      else obj.material.dispose()
    }
  }
}

function rebuildScene() {
  if (!appGroup) return

  // 電荷球の再構築
  chargeMeshes.forEach(cm => {
    if (cm.mesh.parent) cm.mesh.parent.remove(cm.mesh)
    if (cm.halo.parent) cm.halo.parent.remove(cm.halo)
    if (cm.label.parent) cm.label.parent.remove(cm.label)
  })
  chargeMeshes = []

  const charges = currentCharges.value
  charges.forEach((c) => {
    const isPos = c.q > 0
    const col = isPos ? 0xfb7185 : 0x38bdf8
    const hexStr = isPos ? '#fb7185' : '#38bdf8'

    const sphereGeo = new THREE.SphereGeometry(0.36, 24, 24)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.2
    })
    const mesh = new THREE.Mesh(sphereGeo, sphereMat)
    mesh.position.set(c.x, c.y, c.z)
    appGroup.add(mesh)

    // 発光リング / 光彩ハロー
    const haloGeo = new THREE.RingGeometry(0.42, 0.62, 32)
    const haloMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.position.set(c.x, c.y, c.z)
    halo.rotation.x = Math.PI / 2
    appGroup.add(halo)

    // テキストスプライト
    const signStr = c.qMicro > 0 ? `+${c.qMicro.toFixed(1)}μC` : `${c.qMicro.toFixed(1)}μC`
    const label = createTextSprite(signStr, {
      color: '#ffffff',
      bgColor: isPos ? 'rgba(244, 63, 94, 0.75)' : 'rgba(14, 165, 233, 0.75)',
      borderColor: hexStr,
      fontSize: 32,
      scale: 0.48
    })
    label.position.set(c.x, c.y + 0.65, c.z)
    appGroup.add(label)

    chargeMeshes.push({ mesh, halo, label, charge: c })
  })

  // 平行極板（一様電場モード）
  cleanupSubgroup(uniformPlatesGroup)
  if (simMode.value === 'uniform') {
    const half = uniformD.value / 2
    const plateGeo = new THREE.BoxGeometry(0.12, 3.2, 4.2)
    // 左極板 (+)
    const posMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0xfb7185,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85
    })
    const pLeft = new THREE.Mesh(plateGeo, posMat)
    pLeft.position.set(-half, 0, 0)
    uniformPlatesGroup.add(pLeft)

    const lblLeft = createTextSprite(`陽極 (+) +${(uniformE.value * uniformD.value).toFixed(1)} kV`, {
      bgColor: 'rgba(244, 63, 94, 0.8)',
      borderColor: '#fb7185',
      scale: 0.44
    })
    lblLeft.position.set(-half, 2.0, 0)
    uniformPlatesGroup.add(lblLeft)

    // 右極板 (-)
    const negMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85
    })
    const pRight = new THREE.Mesh(plateGeo, negMat)
    pRight.position.set(half, 0, 0)
    uniformPlatesGroup.add(pRight)

    const lblRight = createTextSprite('陰極 (−) 0 V (接地)', {
      bgColor: 'rgba(14, 165, 233, 0.8)',
      borderColor: '#38bdf8',
      scale: 0.44
    })
    lblRight.position.set(half, 2.0, 0)
    uniformPlatesGroup.add(lblRight)
  }

  // 電気力線の再構築
  rebuildStreamlines()

  // 等電位線の再構築
  rebuildEquipotentials()

  // ベクトル格子の再構築
  rebuildVectorGrid()
}

// 電気力線 (Streamlines) 構築
function rebuildStreamlines() {
  cleanupSubgroup(streamlineGroup)
  pulseParticles = []
  if (!showLines.value) return

  if (simMode.value === 'uniform') {
    // 一様電場の平行線
    const half = uniformD.value / 2
    const rows = 5
    const cols = 5
    const stepY = 2.4 / (rows - 1)
    const stepZ = 3.2 / (cols - 1)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const y = -1.2 + r * stepY
        const z = -1.6 + c * stepZ
        const pts = [
          new THREE.Vector3(-half + 0.1, y, z),
          new THREE.Vector3(half - 0.1, y, z)
        ]
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.65
        })
        const line = new THREE.Line(lineGeo, lineMat)
        streamlineGroup.add(line)

        // 方向コーン
        const coneGeo = new THREE.ConeGeometry(0.08, 0.22, 12)
        coneGeo.rotateZ(-Math.PI / 2)
        const coneMat = new THREE.MeshStandardMaterial({
          color: 0xc4b5fd,
          emissive: 0x8b5cf6,
          emissiveIntensity: 0.5
        })
        const cone = new THREE.Mesh(coneGeo, coneMat)
        cone.position.set(0, y, z)
        streamlineGroup.add(cone)

        // パルス粒子
        pulseParticles.push({
          pts,
          length: uniformD.value,
          t: Math.random(),
          speed: 0.4,
          mesh: createPulseDot()
        })
      }
    }
    return
  }

  // 点電荷群からの力線積分
  const charges = currentCharges.value
  const seeds = []

  charges.forEach((c) => {
    // 正電荷から湧き出す力線（負電荷のみの場合は負電荷に向けて外から入る）
    const numLines = Math.min(24, Math.max(10, Math.round(Math.abs(c.qMicro) * 4.5)))
    const isSource = c.q > 0
    const sign = isSource ? 1 : -1

    for (let i = 0; i < numLines; i++) {
      const phi = (i / numLines) * Math.PI * 2
      const thetaVals = [0.25 * Math.PI, 0.5 * Math.PI, 0.75 * Math.PI]
      for (const th of thetaVals) {
        const dir = new THREE.Vector3(
          Math.sin(th) * Math.cos(phi),
          Math.cos(th) * 0.35, // Y方向は抑えめに広げる
          Math.sin(th) * Math.sin(phi)
        ).normalize()

        seeds.push({
          start: new THREE.Vector3(c.x, c.y, c.z).addScaledVector(dir, 0.42),
          sign
        })
      }
    }
  })

  // 各種シードから Runge-Kutta 積分
  const stepSize = 0.08
  const maxSteps = 90
  const boundingRadius = 8.5

  seeds.forEach((seed) => {
    const pts = [seed.start.clone()]
    let curr = seed.start.clone()
    let stepCount = 0

    while (stepCount < maxSteps) {
      const { Ex, Ey, Ez } = getFieldAndPotentialAt(curr.x, curr.y, curr.z)
      const mag = Math.hypot(Ex, Ey, Ez)
      if (mag < 1e-4) break

      const dirX = (Ex / mag) * seed.sign
      const dirY = (Ey / mag) * seed.sign
      const dirZ = (Ez / mag) * seed.sign

      curr.x += dirX * stepSize
      curr.y += dirY * stepSize
      curr.z += dirZ * stepSize
      pts.push(curr.clone())

      // 負電荷または吸い込み先に近づいたら終了
      let terminated = false
      for (const ch of charges) {
        const dist = Math.hypot(curr.x - ch.x, curr.y - ch.y, curr.z - ch.z)
        if (dist < 0.42) {
          terminated = true
          break
        }
      }
      if (terminated || curr.length() > boundingRadius) break
      stepCount++
    }

    if (pts.length > 3) {
      const curveGeo = new THREE.BufferGeometry().setFromPoints(pts)
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.55
      })
      const curveLine = new THREE.Line(curveGeo, curveMat)
      streamlineGroup.add(curveLine)

      // 力線の中間地点に矢印コーンを配置
      const midIdx = Math.floor(pts.length * 0.45)
      const pA = pts[midIdx]
      const pB = pts[Math.min(pts.length - 1, midIdx + 2)]
      const tangent = new THREE.Vector3().subVectors(pB, pA).normalize()
      if (tangent.lengthSq() > 0.01) {
        const coneGeo = new THREE.ConeGeometry(0.065, 0.2, 10)
        const coneMat = new THREE.MeshStandardMaterial({
          color: 0x60a5fa,
          emissive: 0x3b82f6,
          emissiveIntensity: 0.4
        })
        const cone = new THREE.Mesh(coneGeo, coneMat)
        cone.position.copy(pA)
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
        streamlineGroup.add(cone)
      }

      // パルス光点
      if (Math.random() < 0.45) {
        pulseParticles.push({
          pts,
          length: pts.length,
          t: Math.random(),
          speed: 0.35 + Math.random() * 0.25,
          mesh: createPulseDot()
        })
      }
    }
  })
}

function createPulseDot() {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.85
    })
  )
  streamlineGroup.add(dot)
  return dot
}

// 等電位線 & 3D電位標高面の構築
function rebuildEquipotentials() {
  cleanupSubgroup(equipotentialGroup)
  if (!showEquipotential.value && !showRelief.value) return

  const planeSize = 9.0
  const segments = 48
  const half = planeSize / 2
  const step = planeSize / segments

  if (showRelief.value) {
    // 3D電位標高面メッシュ
    const geo = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const colors = []

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i)
      const vz = pos.getZ(i)
      const { V } = getFieldAndPotentialAt(vx, 0, vz)

      // 電位の高さをクリップ
      const scaledY = Math.max(-2.0, Math.min(2.0, V * 1e-4 * 0.28))
      pos.setY(i, scaledY)

      // 電位の色分け (赤=高電位, 青=低電位, 暗紫=ゼロ)
      const normV = Math.max(-1, Math.min(1, V * 1e-4 * 0.35))
      if (normV >= 0) {
        colors.push(0.95, 0.4 + 0.5 * (1 - normV), 0.5 + 0.4 * (1 - normV))
      } else {
        colors.push(0.2, 0.6 + 0.4 * (1 + normV), 0.95)
      }
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()

    const reliefMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide
    })
    reliefMesh = new THREE.Mesh(geo, reliefMat)
    reliefMesh.position.y = -0.5
    equipotentialGroup.add(reliefMesh)
  }

  if (showEquipotential.value) {
    // 等電位等高線（輪郭線スライス）
    const targetPotentials = [-30000, -15000, -8000, -4000, 0, 4000, 8000, 15000, 30000]
    const gridV = []

    for (let j = 0; j <= segments; j++) {
      const row = []
      const z = -half + j * step
      for (let i = 0; i <= segments; i++) {
        const x = -half + i * step
        const { V } = getFieldAndPotentialAt(x, 0, z)
        row.push(V)
      }
      gridV.push(row)
    }

    // 各格子セルについて等電位交点を抽出（簡易マーチングスクエア線分）
    for (const targetV of targetPotentials) {
      const segmentsPts = []
      const colHex = targetV > 0 ? 0xf43f5e : (targetV < 0 ? 0x0ea5e9 : 0xfbbf24)

      for (let j = 0; j < segments; j++) {
        const z0 = -half + j * step
        const z1 = z0 + step
        for (let i = 0; i < segments; i++) {
          const x0 = -half + i * step
          const x1 = x0 + step

          const v00 = gridV[j][i]
          const v10 = gridV[j][i + 1]
          const v11 = gridV[j + 1][i + 1]
          const v01 = gridV[j + 1][i]

          const cellPts = []
          // 4辺の交差判定
          checkEdge(x0, z0, x1, z0, v00, v10, targetV, cellPts)
          checkEdge(x1, z0, x1, z1, v10, v11, targetV, cellPts)
          checkEdge(x1, z1, x0, z1, v11, v01, targetV, cellPts)
          checkEdge(x0, z1, x0, z0, v01, v00, targetV, cellPts)

          if (cellPts.length >= 2) {
            segmentsPts.push(cellPts[0], cellPts[1])
          }
        }
      }

      if (segmentsPts.length > 0) {
        const contourGeo = new THREE.BufferGeometry().setFromPoints(segmentsPts)
        const contourMat = new THREE.LineBasicMaterial({
          color: colHex,
          transparent: true,
          opacity: targetV === 0 ? 0.9 : 0.65,
          linewidth: targetV === 0 ? 2 : 1
        })
        const contourLines = new THREE.LineSegments(contourGeo, contourMat)
        contourLines.position.y = -0.02
        equipotentialGroup.add(contourLines)
      }
    }
  }
}

function checkEdge(xA, zA, xB, zB, vA, vB, vTarget, out) {
  if ((vA - vTarget) * (vB - vTarget) <= 0 && Math.abs(vA - vB) > 1e-6) {
    const t = (vTarget - vA) / (vB - vA)
    if (t >= 0 && t <= 1) {
      out.push(new THREE.Vector3(xA + (xB - xA) * t, 0, zA + (zB - zA) * t))
    }
  }
}

// 電場ベクトル格子 (矢印)
function rebuildVectorGrid() {
  cleanupSubgroup(vectorGridGroup)
  if (!showVectors.value) return

  const range = 3.6
  const step = 0.9
  for (let x = -range; x <= range; x += step) {
    for (let z = -range; z <= range; z += step) {
      // 電荷の直近は除外
      let nearCharge = false
      for (const c of currentCharges.value) {
        if (Math.hypot(x - c.x, z - c.z) < 0.5) {
          nearCharge = true
          break
        }
      }
      if (nearCharge) continue

      const { Ex, Ey, Ez } = getFieldAndPotentialAt(x, 0, z)
      const mag = Math.hypot(Ex, Ey, Ez)
      if (mag > 100) {
        const arrow = createVectorArrow3D({
          color: 0x38bdf8,
          shaftRadius: 0.025,
          headRadius: 0.08,
          headLength: 0.18,
          opacity: 0.8
        })
        const dir = new THREE.Vector3(Ex, Ey, Ez).normalize()
        const len = Math.min(0.65, Math.max(0.18, Math.log10(mag) * 0.14))
        arrow.setVector(new THREE.Vector3(x, 0, z), dir, len)
        vectorGridGroup.add(arrow)
      }
    }
  }
}

// ==========================================
// フレームループ & テスト電荷の運動
// ==========================================
function updateSim(dt, elapsed) {
  if (!isPlaying.value) return

  // パルス粒子の進行
  pulseParticles.forEach(p => {
    p.t = (p.t + dt * p.speed) % 1.0
    const idx = Math.min(p.pts.length - 1, Math.floor(p.t * (p.pts.length - 1)))
    if (p.pts[idx]) {
      p.mesh.position.copy(p.pts[idx])
    }
  })

  // テスト電荷の物理計算 (F = qE)
  for (let i = testCharges.value.length - 1; i >= 0; i--) {
    const tc = testCharges.value[i]
    if (!tc.alive) continue
    tc.age += dt

    const { Ex, Ey, Ez } = getFieldAndPotentialAt(tc.x, tc.y, tc.z)
    // a = (q * E) / m
    const ax = (tc.q * Ex) / tc.mass
    const ay = (tc.q * Ey) / tc.mass
    const az = (tc.q * Ez) / tc.mass

    tc.vx += ax * dt
    tc.vy += ay * dt
    tc.vz += az * dt

    // 緩やかな抵抗減衰
    tc.vx *= Math.pow(0.985, dt * 60)
    tc.vy *= Math.pow(0.985, dt * 60)
    tc.vz *= Math.pow(0.985, dt * 60)

    tc.x += tc.vx * dt
    tc.y += tc.vy * dt
    tc.z += tc.vz * dt

    tc.mesh.position.set(tc.x, tc.y, tc.z)

    // 軌道ポイント追加
    tc.pts.push(new THREE.Vector3(tc.x, tc.y, tc.z))
    if (tc.pts.length > tc.maxPts) tc.pts.shift()
    tc.trailGeo.setFromPoints(tc.pts)

    // 電荷との衝突または画面外判定
    for (const c of currentCharges.value) {
      const dist = Math.hypot(tc.x - c.x, tc.y - c.y, tc.z - c.z)
      if (dist < 0.42) {
        tc.alive = false
        break
      }
    }
    if (Math.hypot(tc.x, tc.y, tc.z) > 10.0 || tc.age > 20.0) {
      tc.alive = false
    }

    if (!tc.alive) {
      if (tc.mesh.parent) tc.mesh.parent.remove(tc.mesh)
      if (tc.trailLine.parent) tc.trailLine.parent.remove(tc.trailLine)
      testCharges.value.splice(i, 1)
    }
  }
}

// 反応性ウォッチャー
watch([simMode, q1, q2, chargeDist, quadQ, quadSize, uniformE, uniformD, showLines, showEquipotential, showRelief, showVectors], () => {
  rebuildScene()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0, 8.5, 13.5],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame: (dt, elapsed) => updateSim(dt, elapsed)
  })
  initScene(threeCtx.scene)
})

onUnmounted(() => {
  clearTestCharges()
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.sim-container {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  color: #f8fafc;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sim-title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #f8fafc;
}

.sim-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.badge-purple {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

/* モード切替タブ */
.mode-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.mode-tabs button {
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tabs button.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

/* カメラ視点バー */
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

/* 再生・操作バー */
.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid #334155;
  max-width: 100%;
  box-sizing: border-box;
}

.btn {
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #475569;
  background: #334155;
  color: #f8fafc;
  transition: all 0.2s;
}

.btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}

.btn-launch {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
  color: #fde68a;
  font-weight: 600;
}

.btn-launch-neg {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #a7f3d0;
  font-weight: 600;
}

.btn-secondary {
  background: #1e293b;
  color: #cbd5e1;
}

.action-btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 3D ビューポート */
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 430px;
  border-radius: 10px;
  background: #080c16;
  border: 1px solid #334155;
  overflow: hidden;
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
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

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
  background: rgba(9, 13, 22, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
}

/* ステータスバー */
.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: 8px 0;
}

.three-status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
}

.three-status-badge.active {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #bae6fd;
}

/* コントロールパネル */
.controls-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.quick-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.mini-chip {
  padding: 2px 7px;
  font-size: 0.7rem;
  border-radius: 6px;
  background: #0f172a;
  color: #94a3b8;
  border: 1px solid #334155;
  cursor: pointer;
}

.mini-chip:hover {
  background: #1e293b;
  color: #f8fafc;
}

.sub-info {
  font-size: 0.72rem;
  color: #94a3b8;
}

.options-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.opt-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #e2e8f0;
  cursor: pointer;
}

.preset-chips-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chip-title {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.chip-btn-sm {
  padding: 3px 9px;
  font-size: 0.74rem;
  border-radius: 999px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
}

.chip-btn-sm:hover {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
}

/* 統計パネル */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card.hl {
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-card .label {
  font-size: 0.72rem;
  color: #94a3b8;
}

.stat-card .val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  font-family: monospace;
}

.stat-card .val.highlight {
  color: #38bdf8;
}

.stat-card .val.highlight-alt {
  color: #fbbf24;
}

.stat-card .val.current-flow {
  color: #4ade80;
}

.stat-card .val.current-zero {
  color: #64748b;
}

.stat-card .sub {
  font-size: 0.68rem;
  color: #94a3b8;
  line-height: 1.25;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .three-hud-legend {
    gap: 6px;
    font-size: 0.65rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.64rem;
    padding: 3px 8px;
  }
  .three-status-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
