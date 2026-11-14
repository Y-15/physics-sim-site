<template>
  <div class="sim-container" :style="{ '--ac': currentParticle.color }">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚡</span>
        <h3 class="sim-title">3D サイクロトロン粒子加速器シミュレーター</h3>
        <span class="badge badge-cyan">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-emerald">等時性: <i>T</i> = 2π<i>m</i> / (<i>qB</i>)</span>
        <span class="badge badge-amber" v-if="isRelativistic">相対論補正: <i>m</i> = <i>γm</i><sub>0</sub></span>
      </div>
    </div>

    <p class="desc">
      2つの中空D型電極（ディー: D<sub>1</sub>, D<sub>2</sub>）と均一磁場 <i>B</i>、およびスリット間の高周波交流電場 <i>E</i> により、
      荷電粒子が等時性をもってギャップ毎に電位差 <i>V</i> で加速され、スパイラル状に軌道を広げて周回脱出・ビーム取り出しされる様子を 3D で観察できます。
    </p>

    <!-- 3D カメラ視点プリセット -->
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
          🔼 上面 (軌道透視)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 加速再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (高速)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepSim">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="resetSim">⏮ 最初から加速</button>
      <button class="btn btn-secondary" @click="resetCamera">🔄 視点リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" :style="{ background: currentParticle.color, boxShadow: '0 0 6px ' + currentParticle.color }"></i>
            {{ currentParticle.name }} (スパイラル軌跡)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#f59e0b;box-shadow:0 0 6px #f59e0b"></i>
            高周波交流電場 <i>E</i><sub>gap</sub> ({{ gapFieldDirection > 0 ? 'D₁ → D₂' : 'D₂ → D₁' }})
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            磁場 <i>B</i> (鉛直方向 +Y)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#22c55e;box-shadow:0 0 6px #22c55e"></i>
            偏向板・取り出しビーム
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D視点回転 ・ ホイールでズーム</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="simState.isEmitted ? 'emitted' : 'accelerating'">
        {{ simState.isEmitted
            ? `⚡ 高エネルギービーム取り出し完了！ 最大到達エネルギー: ${finalEnergyDisplay} MeV | 周回数: ${simState.turns} 周`
            : `🌀 加速周回中 (第 ${simState.turns} 周 / ギャップ通過 ${simState.gapCrossingCount} 回) | 現在エネルギー: ${currentEnergyDisplay} keV | 速度比: ${(simState.speedRatio * 100).toFixed(2)}% c` }}
      </span>
    </div>

    <!-- リアルタイム情報モニター -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">加速核種</div>
        <div class="stat-value" :style="{ color: currentParticle.color }">
          {{ currentParticle.name }}
        </div>
        <div class="stat-formula">電荷 <i>q</i> = +{{ currentParticle.q }}<i>e</i> ｜ 質量 <i>m</i> = {{ currentParticle.m }} <i>u</i></div>
      </div>

      <div class="stat-card">
        <div class="stat-label">周回数 / ギャップ通過</div>
        <div class="stat-value text-blue">{{ simState.turns }} <span class="stat-unit">周</span> ({{ simState.gapCrossingCount }} 回)</div>
        <div class="stat-formula">1周ごとに 2<i>qV</i> = {{ (2 * currentParticle.q * voltage).toFixed(0) }} keV 獲得</div>
      </div>

      <div class="stat-card highlight">
        <div class="stat-label">現在運動エネルギー <i>E</i><sub>k</sub></div>
        <div class="stat-value text-yellow">{{ currentEnergyDisplay }} <span class="stat-unit">keV</span></div>
        <div class="stat-formula"><i>E</i><sub>k</sub> = Σ <i>qV</i><sub>gap</sub> ｜ 最大: {{ maxEnergyDisplay }} MeV</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">サイクロトロン周波数 <i>f</i></div>
        <div class="stat-value text-cyan">{{ cyclotronFreqMhz.toFixed(2) }} <span class="stat-unit">MHz</span></div>
        <div class="stat-formula"><i>f</i> = <span class="frac"><span class="num"><i>qB</i></span><span class="den">2π<i>m</i></span></span> (周期 <i>T</i> = {{ (1 / cyclotronFreqMhz * 1000).toFixed(1) }} ns)</div>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <div class="controls-grid">
        <!-- 核種選択 -->
        <div class="control-group">
          <label class="control-label"><span>加速核種:</span></label>
          <div class="btn-group">
            <button
              v-for="(p, key) in particles"
              :key="key"
              class="select-btn"
              :class="{ active: particleType === key }"
              @click="setParticle(key)"
            >
              {{ p.name }}
            </button>
          </div>
        </div>

        <!-- 磁束密度 B -->
        <div class="control-group">
          <label class="control-label">
            <span>磁束密度 <i>B</i>:</span>
            <span class="control-val text-cyan">{{ magneticField.toFixed(2) }} T</span>
          </label>
          <input type="range" v-model.number="magneticField" min="0.4" max="2.0" step="0.1" class="sim-slider" @input="resetSim" />
          <span class="sub-info">強磁場ほど回転半径が小さくなり高エネルギーまで加速可能</span>
        </div>

        <!-- 加速電圧 V -->
        <div class="control-group">
          <label class="control-label">
            <span>加速電圧 <i>V</i>:</span>
            <span class="control-val text-yellow">{{ voltage }} kV</span>
          </label>
          <input type="range" v-model.number="voltage" min="20" max="100" step="5" class="sim-slider" @input="resetSim" />
          <span class="sub-info">高電圧ほど1周あたりのエネルギー利得が大</span>
        </div>

        <!-- ディー半径 R -->
        <div class="control-group">
          <label class="control-label">
            <span>ディー最大半径 <i>R</i>:</span>
            <span class="control-val">{{ deeRadiusCm }} cm</span>
          </label>
          <input type="range" v-model.number="deeRadiusCm" min="40" max="120" step="5" class="sim-slider" @input="resetSim" />
          <span class="sub-info"><i>E</i><sub>max</sub> ∝ <i>q</i>² <i>B</i>² <i>R</i>² / (2<i>m</i>)</span>
        </div>
      </div>

      <div class="control-row-bottom mt-3">
        <div class="btn-group">
          <button class="select-btn" :class="{ active: isRelativistic }" @click="toggleRelativistic">
            {{ isRelativistic ? '⚛️ 相対論的質量増加: ON (シンクロトロン領域)' : '⚛️ 古典近似 (等時性完全保持): ON' }}
          </button>
          <button class="select-btn" :class="{ active: showFieldLines }" @click="showFieldLines = !showFieldLines">
            {{ showFieldLines ? '3D磁束線: 表示' : '3D磁束線: 非表示' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>サイクロトロンの物理的核心（等時性の秘密）</strong>:
      <ul>
        <li><strong>半周期の普遍性</strong>: ローレンツ力による円運動半径 <i>r</i> = <span class="frac"><span class="num"><i>mv</i></span><span class="den"><i>qB</i></span></span> は速度 <i>v</i> に比例して広がります。しかし、半周の道のり π<i>r</i> も比例して伸びるため、半周する時間 <i>t</i> = π<i>r</i> / <i>v</i> = <span class="frac"><span class="num">π<i>m</i></span><span class="den"><i>qB</i></span></span> は <strong>速度 <i>v</i> によらず完全に一定</strong> です。</li>
        <li><strong>一定周波数での共鳴加速</strong>: 粒子がギャップに到達するタイミングは常に一定であるため、電源の周波数 <i>f</i> = <span class="frac"><span class="num"><i>qB</i></span><span class="den">2π<i>m</i></span></span> を固定したままで、完璧な同調加速を継続できます。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

// 物理パラメータ
const magneticField = ref(1.2) // T
const voltage = ref(50) // kV
const deeRadiusCm = ref(75) // cm
const particleType = ref('proton')
const isRelativistic = ref(false)
const showFieldLines = ref(true)
const isPlaying = ref(true)
const timeScale = ref(0.4)
const activeCam = ref('3d')

const particles = {
  proton: { name: '陽子 (p⁺)', q: 1, m: 1, color: '#38bdf8', restMassMev: 938.3 },
  alpha: { name: 'α粒子 (⁴He²⁺)', q: 2, m: 4, color: '#f43f5e', restMassMev: 3727.4 },
  deuteron: { name: '重陽子 (d⁺)', q: 1, m: 2, color: '#10b981', restMassMev: 1875.6 }
}

const currentParticle = computed(() => particles[particleType.value])

// サイクロトロン周波数計算 (MHz)
const cyclotronFreqMhz = computed(() => {
  const p = currentParticle.value
  // f = q B / (2 pi m)
  // For proton: q=1.6e-19, m=1.67e-27 kg, B=1.0 T -> ~15.2 MHz
  return (15.25 * (p.q / p.m) * magneticField.value)
})

// 最大到達エネルギー (MeV)
const maxEnergyDisplay = computed(() => {
  const p = currentParticle.value
  const B = magneticField.value
  const R = deeRadiusCm.value * 0.01 // m
  // E = (q^2 B^2 R^2) / (2 m)
  // proton with B=1.2, R=0.75m -> ~36 MeV
  const eJoules = (Math.pow(p.q * 1.602e-19, 2) * B * B * R * R) / (2 * p.m * 1.673e-27)
  const eMev = eJoules / (1.602e-13)
  return eMev.toFixed(1)
})

// シミュレーション内部状態
const simState = ref({
  x: 0,
  z: 0,
  vx: 0,
  vz: 0.6,
  turns: 0,
  gapCrossingCount: 0,
  energyKev: 0,
  speedRatio: 0.02,
  isEmitted: false
})

const gapFieldDirection = ref(1) // 1 or -1

const currentEnergyDisplay = computed(() => {
  return (simState.value.energyKev).toFixed(1)
})

const finalEnergyDisplay = computed(() => {
  return (simState.value.energyKev / 1000).toFixed(2)
})

function setParticle(key) {
  particleType.value = key
  resetSim()
}

function toggleRelativistic() {
  isRelativistic.value = !isRelativistic.value
  resetSim()
}

function resetSim() {
  simState.value = {
    x: 0.05,
    z: 0,
    vx: 0,
    vz: 0.65,
    turns: 0,
    gapCrossingCount: 0,
    energyKev: 0,
    speedRatio: 0.02,
    isEmitted: false
  }
  gapFieldDirection.value = 1
  trailPoints.length = 0
  if (trailLine) {
    trailLine.geometry.setFromPoints([new THREE.Vector3(0, 0, 0)])
  }
}

function stepSim() {
  updatePhysicsStep(0.03)
}

const threeContainer = ref(null)
let threeCtx = null
let scene = null
let deeGroup = null
let ionMesh = null
let ionGlow = null
let trailLine = null
const trailPoints = []
let gapArrowsGroup = null
let deflectorMesh = null
let bFieldGroup = null

// ==========================================================
// カメラ制御 & プリセット
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return w < 540 || aspect < 1.35 ? Math.min(1.85, Math.max(1.15, 1.52 / Math.max(0.65, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0, 36 * ms], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 36 * ms, 0.01], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [8.5 * ms, 9.5 * ms, 11 * ms], target: [0, 0, 0], fov: 40 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const params = getCamParams(preset)
  threeCtx.moveCameraTo(params.pos, params.target, duration, params.fov)
}

function resetCamera() {
  setCameraPreset('3d')
}

// ==========================================================
// 3D サイクロトロン構造物構築
// ==========================================================
const SCENE_DEE_R = 4.2 // 3D空間内のディー半径
const GAP_WIDTH = 0.35 // ギャップ間隔 (X軸沿い)

function rebuildCyclotronScene() {
  if (!scene) return

  if (deeGroup) scene.remove(deeGroup)
  deeGroup = new THREE.Group()
  scene.add(deeGroup)

  trailPoints.length = 0

  // 1. 基板 & グリッド
  const grid = new THREE.GridHelper(12, 24, 0x38bdf8, 0x1e293b)
  grid.position.y = -2.4
  deeGroup.add(grid)

  // 2. 電磁石ヨーク & ポールピース (上下の巨大磁極)
  const poleGeo = new THREE.CylinderGeometry(SCENE_DEE_R + 0.6, SCENE_DEE_R + 0.6, 0.6, 36)
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })

  // 下極 (N極)
  const bottomPole = new THREE.Mesh(poleGeo, poleMat)
  bottomPole.position.y = -1.6
  deeGroup.add(bottomPole)

  // 上極 (S極 - ワイヤーフレーム/透明で内部視認性を確保)
  const topPole = new THREE.Mesh(
    poleGeo,
    new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.18, roughness: 0.5, depthWrite: false })
  )
  topPole.position.y = 1.6
  deeGroup.add(topPole)

  // 3. 中空 D型電極 (Dee 1: 左 / Dee 2: 右 - 内部の荷電粒子・スパイラル軌跡が透視できる半透明銅電極)
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.7,
    roughness: 0.35,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  })

  // D字形状のシェイプ作成
  function createDeeGeometry(isLeft) {
    const shape = new THREE.Shape()
    const r = SCENE_DEE_R
    const g = GAP_WIDTH / 2
    if (isLeft) {
      // 左ディー: 半円 (x <= -g)
      shape.absarc(-g, 0, r, Math.PI * 0.5, Math.PI * 1.5, false)
      shape.lineTo(-g, r)
    } else {
      // 右ディー: 半円 (x >= g)
      shape.absarc(g, 0, r, -Math.PI * 0.5, Math.PI * 0.5, false)
      shape.lineTo(g, -r)
    }
    const extrudeSettings = { depth: 0.45, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.rotateX(Math.PI / 2)
    geo.translate(0, 0.22, 0)
    return geo
  }

  // 左ディー D1
  const dee1Geo = createDeeGeometry(true)
  const dee1Mesh = new THREE.Mesh(dee1Geo, copperMat)
  deeGroup.add(dee1Mesh)
  const dee1Edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(dee1Geo),
    new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85 })
  )
  deeGroup.add(dee1Edges)

  // 右ディー D2
  const dee2Geo = createDeeGeometry(false)
  const dee2Mesh = new THREE.Mesh(dee2Geo, copperMat)
  deeGroup.add(dee2Mesh)
  const dee2Edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(dee2Geo),
    new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85 })
  )
  deeGroup.add(dee2Edges)

  // ディー電極ラベル
  const d1Label = createTextSprite('ディー D₁', { color: '#fbbf24', fontSize: 28, scale: 0.38 })
  d1Label.position.set(-SCENE_DEE_R * 0.55, 0.6, -SCENE_DEE_R * 0.55)
  deeGroup.add(d1Label)

  const d2Label = createTextSprite('ディー D₂', { color: '#fbbf24', fontSize: 28, scale: 0.38 })
  d2Label.position.set(SCENE_DEE_R * 0.55, 0.6, -SCENE_DEE_R * 0.55)
  deeGroup.add(d2Label)

  // 4. ギャップ間の高周波電場矢印群
  gapArrowsGroup = new THREE.Group()
  const numGapArrows = 7
  for (let i = 0; i < numGapArrows; i++) {
    const z = (i / (numGapArrows - 1)) * (SCENE_DEE_R * 1.6) - SCENE_DEE_R * 0.8
    const arr = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.035, headRadius: 0.12, headLength: 0.3 })
    arr.setVector(new THREE.Vector3(-GAP_WIDTH * 0.9, 0, z), new THREE.Vector3(1, 0, 0), GAP_WIDTH * 1.8)
    gapArrowsGroup.add(arr)
  }
  deeGroup.add(gapArrowsGroup)

  // 5. 偏向電極板 & ビーム取り出しチャンネル
  const deflectorGeo = new THREE.TorusGeometry(SCENE_DEE_R + 0.18, 0.08, 8, 24, Math.PI * 0.35)
  const deflectorMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.4 })
  deflectorMesh = new THREE.Mesh(deflectorGeo, deflectorMat)
  deflectorMesh.rotation.x = Math.PI / 2
  deflectorMesh.rotation.z = Math.PI * 0.65
  deeGroup.add(deflectorMesh)

  const defLabel = createTextSprite('偏向板 (Deflector)', { color: '#22c55e', borderColor: '#22c55e', fontSize: 24, scale: 0.32 })
  defLabel.position.set(-SCENE_DEE_R - 0.7, 0.4, SCENE_DEE_R * 0.4)
  deeGroup.add(defLabel)

  // 6. 3D 磁束線ベクトル群 (鉛直方向 +Y)
  bFieldGroup = new THREE.Group()
  const bSpacing = 1.6
  for (let x = -SCENE_DEE_R * 0.7; x <= SCENE_DEE_R * 0.7; x += bSpacing) {
    for (let z = -SCENE_DEE_R * 0.7; z <= SCENE_DEE_R * 0.7; z += bSpacing) {
      if (Math.hypot(x, z) < SCENE_DEE_R * 0.85) {
        const arr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.03, headRadius: 0.1, headLength: 0.28, opacity: 0.45 })
        arr.setVector(new THREE.Vector3(x, -1.2, z), new THREE.Vector3(0, 1, 0), 2.4)
        bFieldGroup.add(arr)
      }
    }
  }
  deeGroup.add(bFieldGroup)

  // 7. 荷電粒子本体 & 発光ハロー
  const pColor = new THREE.Color(currentParticle.value.color)
  ionMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    new THREE.MeshStandardMaterial({
      color: pColor,
      emissive: pColor,
      emissiveIntensity: 1.0,
      depthTest: false
    })
  )
  ionMesh.renderOrder = 999
  deeGroup.add(ionMesh)

  ionGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshBasicMaterial({
      color: pColor,
      transparent: true,
      opacity: 0.55,
      depthTest: false,
      depthWrite: false
    })
  )
  ionGlow.renderOrder = 998
  deeGroup.add(ionGlow)

  // 8. スパイラル軌跡ライン (電極内部でも鮮明に透視)
  const trailGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)])
  trailLine = new THREE.Line(
    trailGeo,
    new THREE.LineBasicMaterial({
      color: pColor,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
      depthWrite: false
    })
  )
  trailLine.renderOrder = 995
  deeGroup.add(trailLine)
}

// ==========================================================
// 物理シミュレーション更新ルーチン
// ==========================================================
let emitDelay = 0

function updatePhysicsStep(dt) {
  const s = simState.value
  const p = currentParticle.value

  if (s.isEmitted) {
    emitDelay++
    // ビーム取り出し後の直線運動
    s.x += s.vx * dt * 2.5
    s.z += s.vz * dt * 2.5
    if (ionMesh) {
      ionMesh.position.set(s.x, 0, s.z)
      ionGlow.position.set(s.x, 0, s.z)
    }
    if (emitDelay > 70) {
      emitDelay = 0
      resetSim()
    }
    return
  }

  const B = magneticField.value
  const V = voltage.value
  const g = GAP_WIDTH / 2

  // ギャップ内判定 (x が [-g, g] 内にあるか)
  const inGap = Math.abs(s.x) <= g

  if (inGap) {
    // 交流電場による加速
    // 粒子の進行方向に向かって電場を同調させる (共鳴同調)
    const accelDir = s.vx >= 0 ? 1 : -1
    gapFieldDirection.value = accelDir

    // 加速電場 E_gap = V / gapWidth による力
    const accel = (accelDir * p.q * V * 0.045) / p.m
    s.vx += accel * dt
    s.x += s.vx * dt
    s.z += s.vz * dt

    // 運動エネルギー更新
    s.energyKev += (p.q * V * 0.22)
    s.gapCrossingCount++
    s.turns = Math.floor(s.gapCrossingCount / 2)
  } else {
    // 電極内部: 鉛直磁場 B によるローレンツ力 F = q(v x B)
    // v = (vx, 0, vz), B = (0, B, 0)
    // v x B = (vz * B, 0, -vx * B)
    let effM = p.m
    if (isRelativistic.value) {
      // 相対論的質量増加: gamma = 1 / sqrt(1 - v^2/c^2)
      const beta = Math.min(0.85, s.speedRatio)
      const gamma = 1 / Math.sqrt(1 - beta * beta)
      effM = p.m * gamma
    }

    const qOverM = (p.q / effM) * B * 2.8
    const ax = s.vz * qOverM
    const az = -s.vx * qOverM

    s.vx += ax * dt
    s.vz += az * dt
    s.x += s.vx * dt
    s.z += s.vz * dt
  }

  const currentSpeed = Math.hypot(s.vx, s.vz)
  s.speedRatio = Math.min(0.65, currentSpeed * 0.08)

  // 3D 空間での現在半径
  const rNow = Math.hypot(s.x, s.z)

  // ディー最大半径到達でビーム取り出し (Beam Extracted)
  if (rNow >= SCENE_DEE_R * 0.96) {
    s.isEmitted = true
    // 取り出し口方向への接線速度ベクトル設定
    s.vx = -currentSpeed * 0.8
    s.vz = currentSpeed * 0.6
  }

  // 軌跡点追加
  trailPoints.push(new THREE.Vector3(s.x, 0, s.z))
  if (trailPoints.length > 1400) {
    trailPoints.shift()
  }

  if (trailLine) {
    trailLine.geometry.dispose()
    trailLine.geometry = new THREE.BufferGeometry().setFromPoints(trailPoints)
  }

  if (ionMesh && ionGlow) {
    ionMesh.position.set(s.x, 0, s.z)
    ionGlow.position.set(s.x, 0, s.z)
    const glowScale = 1.0 + Math.min(1.5, (s.energyKev / 2000) * 1.2)
    ionGlow.scale.set(glowScale, glowScale, glowScale)
  }

  // ギャップ電場矢印の向き同期
  if (gapArrowsGroup) {
    const dir = gapFieldDirection.value
    gapArrowsGroup.children.forEach(c => {
      if (c.setVector) {
        c.setVector(
          new THREE.Vector3(dir > 0 ? -GAP_WIDTH * 0.9 : GAP_WIDTH * 0.9, 0, c.position.z),
          new THREE.Vector3(dir, 0, 0),
          GAP_WIDTH * 1.8
        )
      }
    })
  }
}

// ==========================================================
// 毎フレーム アニメーション処理 (onFrame)
// ==========================================================
function onFrame(dt) {
  if (!isPlaying.value) return

  const effectiveDt = Math.min(0.04, dt * timeScale.value)
  updatePhysicsStep(effectiveDt)

  if (bFieldGroup) {
    bFieldGroup.visible = showFieldLines.value
  }
}

watch([particleType, deeRadiusCm, showFieldLines], () => {
  rebuildCyclotronScene()
  resetSim()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 40,
    initialCamPos: [8.5, 9.5, 11],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame
  })
  scene = threeCtx.scene

  rebuildCyclotronScene()
  resetSim()
  setCameraPreset('3d', 0)
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
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon {
  font-size: 1.3rem;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.sim-badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.preset-group {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.chip-btn {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #94a3b8;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  border-color: #38bdf8;
  color: #e2e8f0;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.speed-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.speed-btn-group {
  display: flex;
  gap: 0.25rem;
}

.speed-btn-group button {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.speed-btn-group button.active {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  border-color: #38bdf8;
}

.btn {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #38bdf8;
  color: #090d16;
}

.btn-primary:hover {
  background: #7dd3fc;
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-secondary:hover {
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.2);
  margin-bottom: 0.75rem;
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
  pointer-events: none;
}

.three-hud-legend {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(6px);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  width: fit-content;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #cbd5e1;
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  right: 10px;
  pointer-events: none;
}

.three-hud-hint {
  background: rgba(9, 13, 22, 0.8);
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  color: #94a3b8;
}

.mode-status-strip {
  margin-bottom: 0.85rem;
}

.three-status-badge {
  display: block;
  padding: 0.5rem 0.85rem;
  border-radius: 4px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.three-status-badge.accelerating {
  background: rgba(56, 189, 248, 0.15);
  border-left: 3px solid #38bdf8;
  color: #7dd3fc;
}

.three-status-badge.emitted {
  background: rgba(34, 197, 94, 0.15);
  border-left: 3px solid #22c55e;
  color: #86efac;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.stat-card.highlight {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.05);
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-blue {
  color: #60a5fa;
}

.text-yellow {
  color: #fbbf24;
}

.text-cyan {
  color: #38bdf8;
}

.stat-unit {
  font-size: 0.85rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-formula {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  font-size: 0.9em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.frac .den {
  padding-top: 1px;
}

.controls-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #cbd5e1;
  margin-bottom: 0.35rem;
}

.control-val {
  font-weight: 700;
}

.sub-info {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.3rem;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.control-row-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.75rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.select-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  padding: 0.35rem 0.7rem;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

.select-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  background: rgba(15, 23, 42, 0.5);
  border-left: 3px solid #38bdf8;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.sim-footer-note ul {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}

.sim-footer-note li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
}
</style>
