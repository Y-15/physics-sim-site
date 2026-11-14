<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔬</span>
        <h3 class="sim-title">3D トムソンの比電荷測定 &amp; 速度セレクター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan">速度セレクター: <i>v</i> = <i>E</i> / <i>B</i></span>
        <span class="badge badge-purple">比電荷: <i>e</i>/<i>m</i> ≈ 1.76 × 10<sup>11</sup> C/kg</span>
      </div>
    </div>

    <p class="desc">
      1897年にJ.J.トムソンが電子を発見した陰極線管（CRT）実験をリアルな3D真空ガラス管で再現。
      電子銃による加速、偏向電極の静電力 <i>qE</i> とヘルムホルツコイルのローレンツ力 <i>qvB</i> の直交電磁場つり合い（速度セレクター）、蛍光スクリーンの輝点追跡と比電荷決定を体験できます。
    </p>

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

    <!-- 再生・速度セレクター操作バー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="action-btn-group">
        <button class="btn btn-balance" @click="autoBalanceVelocity">
          🎯 速度セレクター（直進条件 v = E/B）に自動調整
        </button>
        <button class="btn btn-chip" @click="turnOffBField">
          🧲 磁場OFF (電場偏向のみ)
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 リセット
        </button>
      </div>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" style="background:#4ade80;box-shadow:0 0 6px #4ade80"></i>
            電子ビーム &amp; 蛍光輝点
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fb7185;box-shadow:0 0 6px #fb7185"></i>
            静電気力 <i>F</i><sub>E</sub> (赤矢印)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            ローレンツ力 <i>F</i><sub>B</sub> (青矢印)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#d97706;box-shadow:0 0 6px #d97706"></i>
            ヘルムホルツコイル (<i>B</i>)
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ 左ドラッグで3D回転 ・ 右ドラッグで移動 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- ビーム状態ステータス帯 -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="beamStatusClass">
        {{ beamStatusText }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <div class="controls-grid">
        <!-- 電子加速電圧 V0 -->
        <div class="control-group">
          <label>
            <span>電子加速電圧 <i>V</i><sub>0</sub>:</span>
            <strong style="color:#fbbf24">{{ accelVoltageV }} V</strong>
          </label>
          <input type="range" v-model.number="accelVoltageV" min="100" max="1000" step="50" />
          <div class="quick-chips">
            <button class="mini-chip" @click="accelVoltageV = 250">250 V</button>
            <button class="mini-chip" @click="accelVoltageV = 400">400 V (標準)</button>
            <button class="mini-chip" @click="accelVoltageV = 800">800 V (高速)</button>
          </div>
          <span class="sub-info">入射初速 <i>v</i><sub>0</sub> = √(2|<i>q</i>|<i>V</i><sub>0</sub> / <i>m</i>)</span>
        </div>

        <!-- 偏向電場 E -->
        <div class="control-group">
          <label>
            <span>偏向電場 <i>E</i>:</span>
            <strong :style="{ color: electricFieldKVpm >= 0 ? '#fb7185' : '#38bdf8' }">
              {{ electricFieldKVpm >= 0 ? '+' : '' }}{{ electricFieldKVpm.toFixed(1) }} kV/m
            </strong>
          </label>
          <input type="range" v-model.number="electricFieldKVpm" min="-15" max="15" step="0.5" />
          <div class="quick-chips">
            <button class="mini-chip" @click="electricFieldKVpm = 0">0 kV/m</button>
            <button class="mini-chip" @click="electricFieldKVpm = 5.0">+5.0 kV/m</button>
            <button class="mini-chip" @click="electricFieldKVpm = -5.0">−5.0 kV/m</button>
          </div>
          <span class="sub-info">上極板(+)・下極板(−)で下向き電場</span>
        </div>

        <!-- 直交磁場 B -->
        <div class="control-group">
          <label>
            <span>ヘルムホルツ直交磁場 <i>B</i>:</span>
            <strong style="color:#38bdf8">
              {{ magneticFieldMT >= 0 ? '+' : '' }}{{ magneticFieldMT.toFixed(2) }} mT
            </strong>
          </label>
          <input type="range" v-model.number="magneticFieldMT" min="-2.0" max="2.0" step="0.05" />
          <div class="quick-chips">
            <button class="mini-chip" @click="magneticFieldMT = 0">0 mT</button>
            <button class="mini-chip" @click="magneticFieldMT = 0.42">0.42 mT (標準)</button>
            <button class="mini-chip" @click="magneticFieldMT = 1.0">1.0 mT</button>
          </div>
          <span class="sub-info">コイル電流による一様磁場 (奥向き ⊗ / 手前向き ⊙)</span>
        </div>

        <!-- 粒子の種類 -->
        <div class="control-group">
          <label><span>粒子の種類:</span></label>
          <select v-model="particleType" class="custom-select">
            <option value="electron">電子 e⁻ (e/m ≈ 1.76 × 10¹¹ C/kg)</option>
            <option value="proton">陽子 p⁺ (e/m ≈ 9.58 × 10⁷ C/kg)</option>
            <option value="alpha">α粒子 ⁴He²⁺ (e/m ≈ 4.82 × 10⁷ C/kg)</option>
          </select>
          <span class="sub-info">荷電粒子ごとの質量比・符号の違いを比較</span>
        </div>
      </div>

      <!-- 表示オプション -->
      <div class="options-row">
        <span class="opt-label">👁️ 3D表示切替:</span>
        <label class="check-label">
          <input type="checkbox" v-model="showForceVectors" />
          電磁力ベクトル (<i>F</i><sub>E</sub>, <i>F</i><sub>B</sub>)
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showCoils" />
          ヘルムホルツコイル
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showGlassTube" />
          透明ガラス陰極線管 (CRT)
        </label>
      </div>
    </div>

    <!-- 物理量統計パネル -->
    <div class="stats-panel">
      <div class="stat-card hl">
        <div class="label">粒子入射初速 <i>v</i><sub>0</sub></div>
        <div class="val highlight">
          {{ (speedMs / 1e6).toFixed(2) }} <small>× 10⁶ m/s</small>
        </div>
        <div class="sub">光速の {{ (speedMs / 3e8 * 100).toFixed(1) }} %</div>
      </div>

      <div class="stat-card">
        <div class="label">静電気力 <i>F</i><sub>E</sub></div>
        <div class="val" style="color:#fb7185">
          {{ electricForceFN.toFixed(2) }} <small>fN</small>
        </div>
        <div class="sub"><i>F</i><sub>E</sub> = |<i>q</i>| <i>E</i> (1 fN = 10⁻¹⁵ N)</div>
      </div>

      <div class="stat-card">
        <div class="label">ローレンツ力 <i>F</i><sub>B</sub></div>
        <div class="val" style="color:#38bdf8">
          {{ lorentzForceFN.toFixed(2) }} <small>fN</small>
        </div>
        <div class="sub"><i>F</i><sub>B</sub> = |<i>q</i>| <i>v</i><sub>0</sub> <i>B</i></div>
      </div>

      <div class="stat-card">
        <div class="label">蛍光スクリーン変位 <i>y</i></div>
        <div class="val" :class="isVelocitySelected ? 'current-flow' : 'val-amber'">
          {{ (screenYMm >= 0 ? '+' : '') + screenYMm.toFixed(1) }} <small>mm</small>
        </div>
        <div class="sub">比電荷 <i>e</i>/<i>m</i> = {{ (ratioEM / 1e11).toFixed(2) }} × 10¹¹ C/kg</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

// UI状態
const threeContainer = ref(null)
let threeCtx = null
let appGroup = null

const isPlaying = ref(true)
const activeCam = ref('3d')

// 操作パラメータ
const accelVoltageV = ref(400) // V
const electricFieldKVpm = ref(5.0) // kV/m
const magneticFieldMT = ref(0.42) // mT
const particleType = ref('electron')

// 表示切替
const showForceVectors = ref(true)
const showCoils = ref(true)
const showGlassTube = ref(true)

// 物理定数
const constants = {
  electron: { q: -1.602e-19, m: 9.109e-31, ratio: 1.7588e11, name: '電子 e⁻' },
  proton: { q: 1.602e-19, m: 1.673e-27, ratio: 9.578e7, name: '陽子 p⁺' },
  alpha: { q: 3.204e-19, m: 6.644e-27, ratio: 4.822e7, name: 'α粒子 ⁴He²⁺' }
}

const currentConst = computed(() => constants[particleType.value])
const ratioEM = computed(() => currentConst.value.ratio)

// 初速 v0 = sqrt(2 * |q| * V0 / m)
const speedMs = computed(() => {
  const q_abs = Math.abs(currentConst.value.q)
  const m = currentConst.value.m
  return Math.sqrt((2 * q_abs * accelVoltageV.value) / m)
})

// 電場 E [V/m], 磁場 B [T]
const EVpm = computed(() => electricFieldKVpm.value * 1e3)
const BT = computed(() => magneticFieldMT.value * 1e-3)

// 力 F_E = |q| * E, F_B = |q| * v * B
const electricForceFN = computed(() => {
  const q = currentConst.value.q
  return Math.abs(q * EVpm.value) * 1e15 // fN
})

const lorentzForceFN = computed(() => {
  const q = currentConst.value.q
  return Math.abs(q * speedMs.value * BT.value) * 1e15 // fN
})

// 速度セレクター条件
const isVelocitySelected = computed(() => {
  if (Math.abs(BT.value) < 1e-6) return Math.abs(EVpm.value) < 100
  const idealE = speedMs.value * Math.abs(BT.value)
  return Math.abs(Math.abs(EVpm.value) - idealE) < idealE * 0.05
})

// 正味の加速度 ay
const netDeflection = computed(() => {
  const q = currentConst.value.q
  const m = currentConst.value.m
  const fy = -q * (EVpm.value - speedMs.value * BT.value)
  return fy / m
})

// スクリーン上変位 [mm]
const screenYMm = computed(() => {
  const L1 = 0.08 // 偏向領域長 [m]
  const L2 = 0.12 // 偏向出口からスクリーンまで [m]
  const t1 = L1 / speedMs.value
  const t2 = L2 / speedMs.value
  const ay = netDeflection.value
  const y1 = 0.5 * ay * t1 ** 2
  const vy1 = ay * t1
  const y2 = vy1 * t2
  return (y1 + y2) * 1e3
})

const beamStatusClass = computed(() => {
  if (isVelocitySelected.value) return 'balanced'
  return netDeflection.value > 0 ? 'up' : 'down'
})

const beamStatusText = computed(() => {
  if (isVelocitySelected.value) {
    return '🎯 速度セレクター成立 (v = E/B): 静電力とローレンツ力が完全につり合い、ビーム直進！'
  }
  const dir = netDeflection.value > 0 ? '▲ 上向き偏向' : '▼ 下向き偏向'
  return `${dir}: 静電力 FE (${electricForceFN.value.toFixed(1)}fN) と ローレンツ力 FB (${lorentzForceFN.value.toFixed(1)}fN) の不均衡`
})

function autoBalanceVelocity() {
  const targetE = speedMs.value * BT.value
  electricFieldKVpm.value = Math.round((targetE / 1e3) * 10) / 10
}

function turnOffBField() {
  magneticFieldMT.value = 0.0
}

function resetDefaults() {
  accelVoltageV.value = 400
  electricFieldKVpm.value = 5.0
  magneticFieldMT.value = 0.42
  particleType.value = 'electron'
}

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
    return { pos: [0, 0.1, 32.0 * ms], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 34.0 * ms, 0.001], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0, 5.5 * ms, 14.0 * ms], target: [0, 0, 0], fov: 42 }
}

function setCameraPreset(preset) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, 0.55, fov)
}

// ==========================================
// 3D CRT オブジェクト構築
// ==========================================
let crtGlassGroup = null
let electronGunGroup = null
let deflectionPlatesGroup = null
let helmholtzCoilsGroup = null
let phosphorScreenGroup = null
let beamLineMesh = null
let beamLineGeo = null
let impactSpotMesh = null
let impactSpotLight = null
let forceArrowE = null
let forceArrowB = null
let beamParticles = []

function initScene(scene) {
  appGroup = new THREE.Group()
  scene.add(appGroup)

  crtGlassGroup = new THREE.Group()
  electronGunGroup = new THREE.Group()
  deflectionPlatesGroup = new THREE.Group()
  helmholtzCoilsGroup = new THREE.Group()
  phosphorScreenGroup = new THREE.Group()

  appGroup.add(crtGlassGroup)
  appGroup.add(electronGunGroup)
  appGroup.add(deflectionPlatesGroup)
  appGroup.add(helmholtzCoilsGroup)
  appGroup.add(phosphorScreenGroup)

  // 1. 真空ガラス管 (CRT)
  buildCRTGlass()

  // 2. 電子銃 (フィラメント・加速陽極)
  buildElectronGun()

  // 3. 偏向電極 (平行平板)
  buildDeflectionPlates()

  // 4. ヘルムホルツコイル対
  buildHelmholtzCoils()

  // 5. 蛍光スクリーン
  buildPhosphorScreen()

  // 6. 電子ビーム & 輝点
  buildBeamObjects()

  // 7. 力ベクトル矢印 (F_E, F_B)
  forceArrowE = createVectorArrow3D({ color: 0xfb7185, headRadius: 0.1, headLength: 0.25 })
  forceArrowB = createVectorArrow3D({ color: 0x38bdf8, headRadius: 0.1, headLength: 0.25 })
  appGroup.add(forceArrowE)
  appGroup.add(forceArrowB)

  updateBeamTrajectory()
}

// 真空ガラス管 (CRT)
function buildCRTGlass() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.22,
    roughness: 0.08,
    transmission: 0.88,
    ior: 1.48,
    side: THREE.DoubleSide
  })

  // ネック管 (シリンダー: X = -5.8 〜 1.0)
  const neckLen = 6.8
  const neckGeo = new THREE.CylinderGeometry(0.9, 0.9, neckLen, 24, 1, true)
  neckGeo.rotateZ(Math.PI / 2)
  const neckMesh = new THREE.Mesh(neckGeo, glassMat)
  neckMesh.position.x = -2.4
  crtGlassGroup.add(neckMesh)

  // コーン部 (メガホン型広がり: X = 1.0 〜 5.2)
  const coneLen = 4.2
  const coneGeo = new THREE.CylinderGeometry(2.35, 0.9, coneLen, 28, 1, true)
  coneGeo.rotateZ(Math.PI / 2)
  const coneMesh = new THREE.Mesh(coneGeo, glassMat)
  coneMesh.position.x = 3.1
  crtGlassGroup.add(coneMesh)

  // 球面フロントスクリーンガラス (X = 5.2)
  const frontCapGeo = new THREE.SphereGeometry(2.36, 32, 16, 0, Math.PI * 2, 0, Math.PI / 6)
  frontCapGeo.rotateY(Math.PI / 2)
  const frontCapMesh = new THREE.Mesh(frontCapGeo, glassMat)
  frontCapMesh.position.x = 5.2
  crtGlassGroup.add(frontCapMesh)

  // 後端メタルソケット (X = -5.8)
  const socketGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.6, 24)
  socketGeo.rotateZ(Math.PI / 2)
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
  const socketMesh = new THREE.Mesh(socketGeo, socketMat)
  socketMesh.position.x = -5.8
  crtGlassGroup.add(socketMesh)
}

// 電子銃 (カソードフィラメント & 加速陽極)
function buildElectronGun() {
  // カソード加熱フィラメント (X = -5.2)
  const filMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.1
  })
  const filGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16)
  const filament = new THREE.Mesh(filGeo, filMat)
  filament.position.x = -5.2
  filament.rotation.y = Math.PI / 2
  electronGunGroup.add(filament)

  // カソードカップ
  const cupGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16)
  cupGeo.rotateZ(Math.PI / 2)
  const cupMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 })
  const cup = new THREE.Mesh(cupGeo, cupMat)
  cup.position.x = -5.0
  electronGunGroup.add(cup)

  // 加速陽極板スリット (X = -3.8)
  const anodeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
  const anodeDisc = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.78, 24), anodeMat)
  anodeDisc.rotation.y = Math.PI / 2
  anodeDisc.position.x = -3.8
  electronGunGroup.add(anodeDisc)

  // ラベル
  const gunLabel = createTextSprite('電子銃 (V₀加速)', {
    color: '#f8fafc',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: '#94a3b8',
    fontSize: 26,
    scale: 0.32
  })
  gunLabel.position.set(-4.5, 1.25, 0)
  electronGunGroup.add(gunLabel)
}

// 偏向電極 (X = -1.6 〜 0.8)
function buildDeflectionPlates() {
  const plateLen = 2.4
  const plateW = 0.95
  const gap = 0.95
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.8,
    roughness: 0.25
  })

  // 上極板
  const pTop = new THREE.Mesh(new THREE.BoxGeometry(plateLen, 0.06, plateW), plateMat)
  pTop.position.set(-0.4, gap / 2, 0)
  deflectionPlatesGroup.add(pTop)

  // 下極板
  const pBot = new THREE.Mesh(new THREE.BoxGeometry(plateLen, 0.06, plateW), plateMat)
  pBot.position.set(-0.4, -gap / 2, 0)
  deflectionPlatesGroup.add(pBot)

  // 極板リード線
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
  const lTop = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), leadMat)
  lTop.position.set(-0.4, gap / 2 + 0.25, 0)
  const lBot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), leadMat)
  lBot.position.set(-0.4, -gap / 2 - 0.25, 0)
  deflectionPlatesGroup.add(lTop, lBot)
}

// ヘルムホルツコイル対 (上・下に配置したリングコイル)
function buildHelmholtzCoils() {
  const coilRadius = 1.35
  const tubeRadius = 0.1
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // 銅コイル
    metalness: 0.75,
    roughness: 0.3
  })

  // 上コイル (Y = +1.35)
  const cTop = new THREE.Mesh(new THREE.TorusGeometry(coilRadius, tubeRadius, 12, 32), coilMat)
  cTop.rotation.x = Math.PI / 2
  cTop.position.set(-0.4, 1.35, 0)
  helmholtzCoilsGroup.add(cTop)

  // 下コイル (Y = -1.35)
  const cBot = new THREE.Mesh(new THREE.TorusGeometry(coilRadius, tubeRadius, 12, 32), coilMat)
  cBot.rotation.x = Math.PI / 2
  cBot.position.set(-0.4, -1.35, 0)
  helmholtzCoilsGroup.add(cBot)

  const coilLabel = createTextSprite('ヘルムホルツコイル (直交磁場 B)', {
    color: '#7dd3fc',
    bgColor: 'rgba(12, 74, 110, 0.85)',
    borderColor: '#38bdf8',
    fontSize: 26,
    scale: 0.32
  })
  coilLabel.position.set(-0.4, 2.15, 0)
  helmholtzCoilsGroup.add(coilLabel)
}

// 蛍光スクリーン (X = 5.2)
function buildPhosphorScreen() {
  const screenRadius = 2.25
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b, // 深緑の蛍光塗料
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85
  })
  const screenDisc = new THREE.Mesh(new THREE.CircleGeometry(screenRadius, 32), screenMat)
  screenDisc.rotation.y = -Math.PI / 2
  screenDisc.position.x = 5.25
  phosphorScreenGroup.add(screenDisc)

  // 方眼目盛り線
  const gridHelper = new THREE.GridHelper(screenRadius * 1.8, 18, 0x10b981, 0x047857)
  gridHelper.rotation.z = Math.PI / 2
  gridHelper.position.x = 5.26
  phosphorScreenGroup.add(gridHelper)

  const scrLabel = createTextSprite('蛍光スクリーン', {
    color: '#a7f3d0',
    bgColor: 'rgba(6, 78, 59, 0.85)',
    borderColor: '#10b981',
    fontSize: 26,
    scale: 0.32
  })
  scrLabel.position.set(5.25, 2.7, 0)
  phosphorScreenGroup.add(scrLabel)
}

// 電子ビーム & 輝点メッシュ
function buildBeamObjects() {
  const maxPts = 80
  const pts = []
  for (let i = 0; i < maxPts; i++) pts.push(new THREE.Vector3(-5.2, 0, 0))

  beamLineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const beamMat = new THREE.LineBasicMaterial({
    color: 0x4ade80,
    linewidth: 3,
    transparent: true,
    opacity: 0.95
  })
  beamLineMesh = new THREE.Line(beamLineGeo, beamMat)
  appGroup.add(beamLineMesh)

  // 衝突蛍光グロースポット
  const spotGeo = new THREE.SphereGeometry(0.12, 16, 16)
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0x86efac,
    emissive: 0x22c55e,
    emissiveIntensity: 1.5,
    roughness: 0.1
  })
  impactSpotMesh = new THREE.Mesh(spotGeo, spotMat)
  impactSpotMesh.position.set(5.26, 0, 0)
  appGroup.add(impactSpotMesh)

  impactSpotLight = new THREE.PointLight(0x4ade80, 1.2, 3.5)
  impactSpotLight.position.set(5.2, 0, 0)
  appGroup.add(impactSpotLight)

  // 進行ビーム光点粒子群
  const numDots = 14
  for (let i = 0; i < numDots; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xbbf7d0, transparent: true, opacity: 0.9 })
    )
    appGroup.add(dot)
    beamParticles.push({ mesh: dot, progress: i / numDots })
  }
}

// ビーム軌道の再計算・更新
function updateBeamTrajectory() {
  if (!beamLineGeo) return

  // 3D 空間での寸法マッピング:
  // X = -5.2 (カソード) 〜 -3.8 (陽極スリット) : 直線加速
  // X = -3.8 〜 -1.6 : 直進ドリフト
  // X = -1.6 〜 0.8 (L1 = 2.4) : 直交電磁場偏向 (放物線/円弧偏向)
  // X = 0.8 〜 5.25 (L2 = 4.45) : スクリーンへ直線ドリフト
  const xCathode = -5.2
  const xAnode = -3.8
  const xDeflectStart = -1.6
  const xDeflectEnd = 0.8
  const xScreen = 5.25

  // 偏向スケーリング (見やすい3Dスケールに正規化)
  // screenYMm (mm) を 3D Y座標 (-2.0 〜 2.0) にマッピング
  const scaleY = 0.055 // 1mm あたり 0.055 単位
  const clampedScreenY = Math.max(-2.0, Math.min(2.0, screenYMm.value * scaleY))

  // 偏向出口での Y 座標と傾き
  const L1 = xDeflectEnd - xDeflectStart
  const L2 = xScreen - xDeflectEnd
  // y_exit = 0.5 * ay * t1^2, y_screen = y_exit + vy * t2 = y_exit * (1 + 2 * L2/L1)
  const ratioScreenToExit = 1 + (2 * L2) / L1
  const yExit = clampedScreenY / ratioScreenToExit
  const slopeExit = (clampedScreenY - yExit) / L2

  const pts = []
  const steps = 60

  for (let i = 0; i <= steps; i++) {
    const x = xCathode + (i / steps) * (xScreen - xCathode)
    let y = 0

    if (x <= xDeflectStart) {
      y = 0
    } else if (x <= xDeflectEnd) {
      // 放物線偏向
      const t = (x - xDeflectStart) / L1
      y = yExit * t * t
    } else {
      // 直線ドリフト
      y = yExit + slopeExit * (x - xDeflectEnd)
    }

    pts.push(new THREE.Vector3(x, y, 0))
  }

  beamLineGeo.setFromPoints(pts)
  beamLineMesh.geometry.attributes.position.needsUpdate = true

  // 輝点位置
  impactSpotMesh.position.set(xScreen, clampedScreenY, 0)
  impactSpotLight.position.set(xScreen - 0.1, clampedScreenY, 0)

  // 力ベクトル矢印の更新 (偏向領域中央 X = -0.4, Y = yExit * 0.25)
  if (showForceVectors.value) {
    const midX = -0.4
    const midY = yExit * 0.25
    const origin = new THREE.Vector3(midX, midY, 0)

    // 静電力 F_E: 電子(q<0)かつE>0(下向き)のとき、力は上向き (+Y)
    const signE = currentConst.value.q < 0 ? (electricFieldKVpm.value >= 0 ? 1 : -1) : (electricFieldKVpm.value >= 0 ? -1 : 1)
    const lenE = Math.min(1.2, Math.max(0.08, (electricForceFN.value / 2.0) * 0.45))
    forceArrowE.setVector(origin, new THREE.Vector3(0, signE, 0), lenE)

    // ローレンツ力 F_B: 電子(q<0)かつB>0(奥向き)のとき、力は下向き (-Y)
    const signB = currentConst.value.q < 0 ? (magneticFieldMT.value >= 0 ? -1 : 1) : (magneticFieldMT.value >= 0 ? 1 : -1)
    const lenB = Math.min(1.2, Math.max(0.08, (lorentzForceFN.value / 2.0) * 0.45))
    forceArrowB.setVector(origin, new THREE.Vector3(0, signB, 0), lenB)
  } else {
    forceArrowE.visible = false
    forceArrowB.visible = false
  }

  // 表示切替
  crtGlassGroup.visible = showGlassTube.value
  helmholtzCoilsGroup.visible = showCoils.value
}

// ==========================================
// フレームアニメーション
// ==========================================
function updateSim(dt, elapsed) {
  if (!isPlaying.value) return

  // ビーム光点粒子の移動
  const pts = beamLineGeo.attributes.position
  const count = pts.count

  beamParticles.forEach(bp => {
    bp.progress = (bp.progress + dt * 1.4) % 1.0
    const idx = Math.min(count - 1, Math.floor(bp.progress * count))
    bp.mesh.position.set(pts.getX(idx), pts.getY(idx), pts.getZ(idx))
  })

  // スクリーン輝点の明滅
  impactSpotLight.intensity = 1.1 + Math.sin(elapsed * 10) * 0.25
}

// 反応性ウォッチャー
watch(
  [accelVoltageV, electricFieldKVpm, magneticFieldMT, particleType, showForceVectors, showCoils, showGlassTube],
  () => {
    updateBeamTrajectory()
  }
)

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0, 5.5, 14.0],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame: (dt, elapsed) => updateSim(dt, elapsed)
  })
  initScene(threeCtx.scene)
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

/* 再生バー */
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

.btn-balance {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #6ee7b7;
  font-weight: 700;
}

.btn-chip {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #7dd3fc;
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

.three-status-badge.balanced {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.three-status-badge.up {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.three-status-badge.down {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
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

.custom-select {
  width: 100%;
  padding: 6px 10px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 0.82rem;
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

.stat-card .val.current-flow {
  color: #4ade80;
}

.stat-card .val.val-amber {
  color: #fbbf24;
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
