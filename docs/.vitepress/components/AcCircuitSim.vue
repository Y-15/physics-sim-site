<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#fbbf24">
    <div class="lab-head">
      <span class="lab-title">⚡ 3D 交流回路・RLC直列回路・回転フェーザー・共振</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge" style="--ac:#fbbf24">共振 f₀ = {{ f0.toFixed(1) }} Hz ｜ Z = {{ Z.toFixed(1) }} Ω</span>
      </div>
    </div>

    <p class="lab-desc">
      交流電源 <i>v</i>(<i>t</i>) = <i>V</i><sub>0</sub> sin(ω<i>t</i>) に対する抵抗 <i>R</i>・コイル <i>L</i>・コンデンサー <i>C</i> の位相関係（±90°のズレ）、3D空間で回転するフェーザーベクトル、インピーダンス三角形 <i>Z</i> = √(<i>R</i><sup>2</sup> + (<i>X</i><sub>L</sub> - <i>X</i><sub>C</sub>)<sup>2</sup>)、および電気共振曲線 <i>I</i>(ω) を同時体感できます。
    </p>

    <!-- モード選択タブ -->
    <div class="mode-tabs-bar">
      <button class="mode-tab-btn" :class="{ active: circuitType === 'RLC' }" @click="setCircuitType('RLC')">
        ① RLC 直列回路（総合）
      </button>
      <button class="mode-tab-btn" :class="{ active: circuitType === 'R' }" @click="setCircuitType('R')">
        ② 抵抗単独（同位相）
      </button>
      <button class="mode-tab-btn" :class="{ active: circuitType === 'L' }" @click="setCircuitType('L')">
        ③ コイル単独（電流が π/2 遅れ）
      </button>
      <button class="mode-tab-btn" :class="{ active: circuitType === 'C' }" @click="setCircuitType('C')">
        ④ コンデンサー単独（電流が π/2 進み）
      </button>
    </div>

    <!-- カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面フェーザー
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上回路
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button
        class="lab-btn primary"
        @click="togglePlay"
        style="padding: 5px 14px; font-weight: 700; border-radius: 8px; font-size: 0.84rem;"
      >
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 表示速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepPhase" :disabled="isPlaying" style="padding: 5px 12px; font-size: 0.82rem;">
        ⏭ コマ送り
      </button>
      <button class="lab-btn" @click="resetPhase" style="padding: 5px 12px; font-size: 0.82rem;">
        ⏮ 位相ゼロ
      </button>
      <button class="lab-btn lab-btn-pri" @click="setResonance" style="margin-left:auto; background:#0284c7; border-color:#38bdf8;">
        🎯 共振周波数に合わせる ({{ f0.toFixed(1) }} Hz)
      </button>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
          全電圧 V₀
        </span>
        <span class="legend-item">
          <i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
          電流 I₀
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          V_R (抵抗電圧)
        </span>
        <span class="legend-item">
          <i style="background:#c084fc;box-shadow:0 0 6px #c084fc"></i>
          V_L (コイル進み)
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          V_C (容量遅れ)
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: Math.abs(XL - XC) < 1.0 ? '#10b981' : '#38bdf8', color: '#f8fafc' }">
        インピーダンス: <i>Z</i> = √(<i>R</i>² + (<i>X</i><sub>L</sub> - <i>X</i><sub>C</sub>)²) = {{ Z.toFixed(1) }} Ω ｜
        位相差 φ = {{ phaseDeg.toFixed(1) }}° ({{ phaseStatus }}) ｜ 力率 cosφ = {{ powerFactor.toFixed(3) }}
      </span>
    </div>

    <!-- コントロール群 -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>交流電源周波数 <i>f</i>: <strong>{{ frequency.toFixed(1) }} Hz</strong> (ω = {{ omega.toFixed(1) }} rad/s)</label>
        <input type="range" v-model.number="frequency" min="10" max="200" step="1" />
        <div class="lab-note">周波数を変えると <i>X</i><sub>L</sub> = ω<i>L</i> と <i>X</i><sub>C</sub> = 1/(ω<i>C</i>) のバランスが変化します</div>
      </div>

      <div class="lab-ctrl">
        <label>電源電圧振幅 <i>V</i><sub>0</sub>: <strong>{{ V0 }} V</strong> (実効値 <i>V</i><sub>e</sub> = {{ (V0 / Math.SQRT2).toFixed(1) }} V)</label>
        <input type="range" v-model.number="V0" min="5" max="30" step="1" />
      </div>

      <div class="lab-ctrl">
        <label>抵抗 <i>R</i>: <strong>{{ R }} Ω</strong></label>
        <input type="range" v-model.number="R" min="5" max="60" step="5" />
      </div>

      <div class="lab-ctrl" v-if="circuitType === 'RLC' || circuitType === 'L'">
        <label>インダクタンス <i>L</i>: <strong>{{ (L * 1000).toFixed(0) }} mH</strong> (<i>X</i><sub>L</sub> = {{ XL.toFixed(1) }} Ω)</label>
        <input type="range" v-model.number="L" min="0.01" max="0.20" step="0.01" />
      </div>

      <div class="lab-ctrl" v-if="circuitType === 'RLC' || circuitType === 'C'">
        <label>静電容量 <i>C</i>: <strong>{{ (C * 1e6).toFixed(0) }} μF</strong> (<i>X</i><sub>C</sub> = {{ XC.toFixed(1) }} Ω)</label>
        <input type="range" v-model.number="C" min="10e-6" max="200e-6" step="5e-6" />
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">合成インピーダンス <i>Z</i></div>
        <div class="v" style="color:#fbbf24">{{ Z.toFixed(1) }} <small>Ω</small></div>
        <div class="f">共振時は <i>Z</i> = <i>R</i> (最小値)</div>
      </div>

      <div class="lab-stat">
        <div class="k">電流振幅 <i>I</i><sub>0</sub> = <i>V</i><sub>0</sub> / <i>Z</i></div>
        <div class="v" style="color:#10b981">{{ I0.toFixed(3) }} <small>A</small></div>
        <div class="f">実効電流 <i>I</i><sub>e</sub> = {{ (I0 / Math.SQRT2).toFixed(3) }} A</div>
      </div>

      <div class="lab-stat">
        <div class="k">共振周波数 <i>f</i><sub>0</sub></div>
        <div class="v" style="color:#38bdf8">{{ f0.toFixed(1) }} <small>Hz</small></div>
        <div class="f"><i>f</i><sub>0</sub> = 1 / (2π√(LC))</div>
      </div>

      <div class="lab-stat">
        <div class="k">誘導リアクタンス <i>X</i><sub>L</sub></div>
        <div class="v" style="color:#c084fc">{{ XL.toFixed(1) }} <small>Ω</small></div>
        <div class="f">ω<i>L</i> (周波数に比例)</div>
      </div>

      <div class="lab-stat">
        <div class="k">容量リアクタンス <i>X</i><sub>C</sub></div>
        <div class="v" style="color:#38bdf8">{{ XC.toFixed(1) }} <small>Ω</small></div>
        <div class="f">1 / (ω<i>C</i>) (周波数に反比例)</div>
      </div>

      <div class="lab-stat">
        <div class="k">平均消費電力 <i>P</i></div>
        <div class="v" style="color:#ef4444">{{ power.toFixed(2) }} <small>W</small></div>
        <div class="f"><i>P</i> = <i>V</i><sub>e</sub> <i>I</i><sub>e</sub> cosφ = <i>R</i> <i>I</i><sub>e</sub>²</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const circuitType = ref('RLC') // 'RLC', 'R', 'L', 'C'
const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(0.5)

// パラメーター
const frequency = ref(50) // Hz
const V0 = ref(15) // V
const R = ref(20) // Ω
const L = ref(0.08) // H (80mH)
const C = ref(50e-6) // F (50μF)

let phaseTime = 0

// 角周波数
const omega = computed(() => 2 * Math.PI * frequency.value)

// リアクタンス
const XL = computed(() => {
  if (circuitType.value === 'R' || circuitType.value === 'C') return 0
  return omega.value * L.value
})

const XC = computed(() => {
  if (circuitType.value === 'R' || circuitType.value === 'L') return 0
  return 1 / (omega.value * C.value)
})

// インピーダンス Z
const Z = computed(() => {
  if (circuitType.value === 'R') return R.value
  if (circuitType.value === 'L') return XL.value || 0.001
  if (circuitType.value === 'C') return XC.value || 0.001
  const netX = XL.value - XC.value
  return Math.sqrt(R.value ** 2 + netX ** 2)
})

// 電流振幅 I0
const I0 = computed(() => (Z.value > 0 ? V0.value / Z.value : 0))

// 位相差 phi (電圧に対する電流の遅れ角)
const phaseRad = computed(() => {
  if (circuitType.value === 'R') return 0
  if (circuitType.value === 'L') return Math.PI / 2 // 電流が90°遅れる
  if (circuitType.value === 'C') return -Math.PI / 2 // 電流が90°進む
  return Math.atan2(XL.value - XC.value, R.value)
})

const phaseDeg = computed(() => (phaseRad.value * 180) / Math.PI)

const phaseStatus = computed(() => {
  if (Math.abs(phaseDeg.value) < 1.0) return '同位相（完全共振）'
  if (phaseDeg.value > 0) return '電流が遅れる（誘導性）'
  return '電流が進む（容量性）'
})

// 共振周波数
const f0 = computed(() => 1 / (2 * Math.PI * Math.sqrt(L.value * C.value)))

// 力率 & 電力
const powerFactor = computed(() => (Z.value > 0 ? R.value / Z.value : 1))
const power = computed(() => {
  const Ve = V0.value / Math.SQRT2
  const Ie = I0.value / Math.SQRT2
  return Ve * Ie * powerFactor.value
})

function setResonance() {
  frequency.value = parseFloat(f0.value.toFixed(1))
}

function setCircuitType(type) {
  circuitType.value = type
  rebuild3DScene()
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stepPhase() {
  phaseTime += 0.06
  updatePhasor(0)
}

function resetPhase() {
  phaseTime = 0
  updatePhasor(0)
}

function setCameraPreset(preset, dur = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return

  const isNarrow = (threeCtx.camera?.aspect || 1.7) < 1.35
  const mult = isNarrow ? 1.35 : 1.0

  if (preset === '3d') {
    threeCtx.moveCameraTo([0, 9.5 * mult, 14.5 * mult], [0, 0.5, 0], dur, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 1.4, 32 * mult], [0, 1.0, 0], dur, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 34 * mult, 0.01], [0, 0, 0], dur, 14)
  }
}

// ----------------------------------------------------
// 3D シーン構成
// ----------------------------------------------------
const threeContainer = ref(null)
let threeCtx = null
let sceneGroup = null

// フェーザーベクトル矢印
let phasorV0Arrow = null
let phasorIArrow = null
let phasorVRArrow = null
let phasorVLArrow = null
let phasorVCArrow = null

// インピーダンス三角形グループ
let triangleGroup = null
let triHypMesh = null
let triBaseMesh = null
let triPerpMesh = null
let zLabelSprite = null

// 共振曲線ボード
let resBoardCanvas = null
let resBoardTexture = null
let resBoardCtx = null

// 空間電子粒子流
let electronMesh = null

function rebuild3DScene() {
  if (!threeCtx) return
  if (sceneGroup) threeCtx.scene.remove(sceneGroup)

  sceneGroup = new THREE.Group()
  threeCtx.scene.add(sceneGroup)

  // 1. 基板グリッド
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.y = -1.8
  sceneGroup.add(grid)

  // 2. 左側: 3D 回転フェーザー図エリア (x = -2.9, y = 1.2, z = 0)
  const phasorCenter = new THREE.Vector3(-2.9, 1.2, 0)

  // フェーザー座標円環と軸
  const ringGeo = new THREE.RingGeometry(2.4, 2.45, 64)
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide })
  const ringMesh = new THREE.Mesh(ringGeo, ringMat)
  ringMesh.position.copy(phasorCenter)
  sceneGroup.add(ringMesh)

  const pAxisMat = new THREE.LineBasicMaterial({ color: 0x334155 })
  const pAxisPts = [
    new THREE.Vector3(phasorCenter.x - 2.8, phasorCenter.y, 0),
    new THREE.Vector3(phasorCenter.x + 2.8, phasorCenter.y, 0),
    new THREE.Vector3(phasorCenter.x, phasorCenter.y - 2.8, 0),
    new THREE.Vector3(phasorCenter.x, phasorCenter.y + 2.8, 0)
  ]
  const pAxisGeo = new THREE.BufferGeometry().setFromPoints(pAxisPts)
  sceneGroup.add(new THREE.LineSegments(pAxisGeo, pAxisMat))

  const phasorTitle = createTextSprite('3D 回転フェーザー (空間複素平面)', { color: '#fbbf24', fontSize: 28, scale: 0.42 })
  phasorTitle.position.set(phasorCenter.x, phasorCenter.y + 2.7, 0)
  sceneGroup.add(phasorTitle)

  // フェーザーベクトル矢印
  phasorV0Arrow = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 }) // V0 (赤)
  phasorIArrow = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.07, headRadius: 0.2, headLength: 0.5 })   // I0 (緑)
  phasorVRArrow = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.45 }) // VR (黄)
  phasorVLArrow = createVectorArrow3D({ color: 0xc084fc, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.45 }) // VL (紫)
  phasorVCArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.45 }) // VC (水色)

  sceneGroup.add(phasorV0Arrow)
  sceneGroup.add(phasorIArrow)
  sceneGroup.add(phasorVRArrow)
  sceneGroup.add(phasorVLArrow)
  sceneGroup.add(phasorVCArrow)

  // 3. 右側: 3D インピーダンス三角形エリア (x = 2.9, y = 0.3, z = 0)
  triangleGroup = new THREE.Group()
  triangleGroup.position.set(2.9, 0.3, 0)
  sceneGroup.add(triangleGroup)

  const triTitle = createTextSprite('インピーダンス三角形 Z² = R² + (X_L - X_C)²', { color: '#38bdf8', fontSize: 26, scale: 0.42 })
  triTitle.position.set(0, 3.2, 0)
  triangleGroup.add(triTitle)

  // 底辺 R (Amber)
  const baseGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 12)
  baseGeo.rotateZ(Math.PI / 2)
  triBaseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309, emissiveIntensity: 0.3 }))
  triangleGroup.add(triBaseMesh)

  // 高さ XL - XC (Purple/Cyan)
  const perpGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 12)
  triPerpMesh = new THREE.Mesh(perpGeo, new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x7e22ce, emissiveIntensity: 0.3 }))
  triangleGroup.add(triPerpMesh)

  // 斜辺 Z (Rose)
  const hypGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 12)
  triHypMesh = new THREE.Mesh(hypGeo, new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239, emissiveIntensity: 0.4 }))
  triangleGroup.add(triHypMesh)

  zLabelSprite = createTextSprite('Z', { color: '#f43f5e', fontSize: 32, scale: 0.45 })
  triangleGroup.add(zLabelSprite)

  // 4. 手前下部: 3D RLC 回路素子モデル
  buildCircuitComponents()

  // 5. 奥側: 3D 共振曲線ディスプレイボード (I(ω) Resonance Curve)
  resBoardCanvas = document.createElement('canvas')
  resBoardCanvas.width = 512
  resBoardCanvas.height = 256
  resBoardCtx = resBoardCanvas.getContext('2d')

  resBoardTexture = new THREE.CanvasTexture(resBoardCanvas)
  resBoardTexture.minFilter = THREE.LinearFilter
  resBoardTexture.magFilter = THREE.LinearFilter

  const boardGeo = new THREE.PlaneGeometry(6.4, 3.2)
  const boardMat = new THREE.MeshBasicMaterial({
    map: resBoardTexture,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide
  })
  const resBoardMesh = new THREE.Mesh(boardGeo, boardMat)
  resBoardMesh.position.set(0, 2.2, -4.5)
  resBoardMesh.rotation.x = 0.16
  sceneGroup.add(resBoardMesh)
}

function buildCircuitComponents() {
  const compGroup = new THREE.Group()
  compGroup.position.set(0, -1.8, 2.3)
  sceneGroup.add(compGroup)

  const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 })

  // 配線ループ
  const wR = 0.05
  const wGeo = new THREE.CylinderGeometry(wR, wR, 8.4, 12)
  wGeo.rotateZ(Math.PI / 2)
  const topWire = new THREE.Mesh(wGeo, wireMat)
  topWire.position.y = 0.6
  compGroup.add(topWire)

  // AC 電源シンボル (左端)
  const genGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 24)
  genGeo.rotateX(Math.PI / 2)
  const genMesh = new THREE.Mesh(genGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 }))
  genMesh.position.set(-3.6, 0.6, 0)
  compGroup.add(genMesh)
  const genLabel = createTextSprite('AC電源 V(t)', { color: '#f43f5e', fontSize: 26, scale: 0.38 })
  genLabel.position.set(-3.6, 1.3, 0)
  compGroup.add(genLabel)

  // 抵抗 R (中央左)
  const resGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 16)
  resGeo.rotateZ(Math.PI / 2)
  const resMesh = new THREE.Mesh(resGeo, new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 }))
  resMesh.position.set(-1.2, 0.6, 0)
  compGroup.add(resMesh)
  const rLabel = createTextSprite('抵抗 R', { color: '#fbbf24', fontSize: 26, scale: 0.38 })
  rLabel.position.set(-1.2, 1.2, 0)
  compGroup.add(rLabel)

  // コイル L (中央右)
  const coilCurve = []
  for (let i = 0; i <= 8 * 24; i++) {
    const t = i / (8 * 24)
    const x = (t - 0.5) * 1.0
    const y = Math.sin(t * Math.PI * 2 * 8) * 0.25
    const z = Math.cos(t * Math.PI * 2 * 8) * 0.25
    coilCurve.push(new THREE.Vector3(x, y, z))
  }
  const cTube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilCurve), 80, 0.04, 8, false)
  const coilMesh = new THREE.Mesh(cTube, new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.8, roughness: 0.3 }))
  coilMesh.position.set(1.0, 0.6, 0)
  compGroup.add(coilMesh)
  const lLabel = createTextSprite('コイル L', { color: '#c084fc', fontSize: 26, scale: 0.38 })
  lLabel.position.set(1.0, 1.2, 0)
  compGroup.add(lLabel)

  // コンデンサー C (右端)
  const pMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 })
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.5), pMat)
  p1.position.set(2.8, 0.6, 0)
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.5), pMat)
  p2.position.set(3.0, 0.6, 0)
  compGroup.add(p1, p2)
  const cLabel = createTextSprite('コンデンサー C', { color: '#38bdf8', fontSize: 26, scale: 0.38 })
  cLabel.position.set(2.9, 1.2, 0)
  compGroup.add(cLabel)

  // 往復電子キャリア
  const numE = 14
  const eGeo = new THREE.SphereGeometry(0.06, 8, 8)
  const eMat = new THREE.MeshBasicMaterial({ color: 0x10b981 })
  electronMesh = new THREE.InstancedMesh(eGeo, eMat, numE)
  electronMesh.position.set(0, 0.6, 0)
  compGroup.add(electronMesh)
}

// ----------------------------------------------------
// 物理シミュレーションと更新
// ----------------------------------------------------
function updatePhasor(dt) {
  if (isPlaying.value) {
    phaseTime += dt * omega.value * 0.15 * timeScale.value
  }

  const wt = phaseTime
  const phi = phaseRad.value
  const phasorCenter = new THREE.Vector3(-3.4, 1.4, 0)

  // ベクトル長スケール
  const vScale = 2.2 / (V0.value || 1)
  const iScale = 2.2 / (V0.value / R.value || 1)

  // 1. 全電圧 V0: 角度 wt
  const v0Len = V0.value * vScale
  const v0Dir = new THREE.Vector3(Math.cos(wt), Math.sin(wt), 0)
  if (phasorV0Arrow) {
    phasorV0Arrow.setVector(phasorCenter, v0Dir, v0Len)
  }

  // 2. 電流 I0: 角度 wt - phi
  const iAngle = wt - phi
  const iLen = Math.min(2.4, I0.value * iScale)
  const iDir = new THREE.Vector3(Math.cos(iAngle), Math.sin(iAngle), 0)
  if (phasorIArrow) {
    phasorIArrow.setVector(phasorCenter, iDir, iLen)
  }

  // 3. 各素子電圧
  // VR: 電流と同位相 (角度 iAngle)
  const vrLen = (I0.value * R.value) * vScale
  if (phasorVRArrow) {
    if (circuitType.value === 'L' || circuitType.value === 'C') {
      phasorVRArrow.visible = false
    } else {
      phasorVRArrow.setVector(phasorCenter, iDir, vrLen)
    }
  }

  // VL: 電流より +90° 進み (角度 iAngle + PI/2)
  const vlLen = (I0.value * XL.value) * vScale
  const vlDir = new THREE.Vector3(-Math.sin(iAngle), Math.cos(iAngle), 0)
  if (phasorVLArrow) {
    if (circuitType.value === 'R' || circuitType.value === 'C' || XL.value < 0.1) {
      phasorVLArrow.visible = false
    } else {
      phasorVLArrow.setVector(phasorCenter, vlDir, vlLen)
    }
  }

  // VC: 電流より -90° 遅れ (角度 iAngle - PI/2)
  const vcLen = (I0.value * XC.value) * vScale
  const vcDir = new THREE.Vector3(Math.sin(iAngle), -Math.cos(iAngle), 0)
  if (phasorVCArrow) {
    if (circuitType.value === 'R' || circuitType.value === 'L' || XC.value < 0.1) {
      phasorVCArrow.visible = false
    } else {
      phasorVCArrow.setVector(phasorCenter, vcDir, vcLen)
    }
  }

  // 4. 3D インピーダンス三角形の動的変形
  if (triBaseMesh && triPerpMesh && triHypMesh) {
    const scale = 2.4 / Math.max(Z.value, 40)
    const baseLen = Math.max(0.1, R.value * scale)
    const netX = (XL.value - XC.value) * scale
    const hypLen = Math.max(0.15, Z.value * scale)

    // 底辺 R (x軸に沿う)
    triBaseMesh.scale.set(1, baseLen, 1)
    triBaseMesh.position.set(baseLen / 2, 0, 0)

    // 垂直辺 netX (y軸に沿う)
    const perpLen = Math.abs(netX)
    const perpSign = netX >= 0 ? 1 : -1
    triPerpMesh.scale.set(1, Math.max(0.05, perpLen), 1)
    triPerpMesh.position.set(baseLen, (perpLen / 2) * perpSign, 0)

    // 斜辺 Z (原点から (baseLen, netX) へ)
    triHypMesh.scale.set(1, hypLen, 1)
    triHypMesh.position.set(baseLen / 2, netX / 2, 0)
    const hypAngle = Math.atan2(netX, baseLen)
    triHypMesh.rotation.z = hypAngle - Math.PI / 2

    if (zLabelSprite && zLabelSprite.updateText) {
      zLabelSprite.position.set(baseLen / 2 - 0.3 * Math.sin(hypAngle), netX / 2 + 0.3 * Math.cos(hypAngle), 0)
      zLabelSprite.updateText(`Z = ${Z.value.toFixed(1)} Ω`, '#f43f5e')
    }
  }

  // 5. 電子キャリア往復アニメーション
  if (electronMesh) {
    const oscDisp = Math.sin(iAngle) * (I0.value / (V0.value / R.value || 1)) * 0.5
    const dummy = new THREE.Object3D()
    for (let i = 0; i < 14; i++) {
      const baseX = -3.2 + i * (6.4 / 13)
      dummy.position.set(baseX + oscDisp, 0, 0)
      dummy.updateMatrix()
      electronMesh.setMatrixAt(i, dummy.matrix)
    }
    electronMesh.instanceMatrix.needsUpdate = true
  }

  // 6. 共振曲線描画更新
  drawResonanceBoard()
}

function drawResonanceBoard() {
  if (!resBoardCtx || !resBoardTexture) return

  const ctx = resBoardCtx
  const w = resBoardCanvas.width
  const h = resBoardCanvas.height

  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, w, h)

  // グリッド線
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= w; x += 40) {
    ctx.moveTo(x, 0); ctx.lineTo(x, h)
  }
  for (let y = 0; y <= h; y += 40) {
    ctx.moveTo(0, y); ctx.lineTo(w, y)
  }
  ctx.stroke()

  // 軸
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(40, 20)
  ctx.lineTo(40, h - 30)
  ctx.lineTo(w - 20, h - 30)
  ctx.stroke()

  ctx.font = 'bold 15px sans-serif'
  ctx.fillStyle = '#10b981'
  ctx.fillText('共振曲線 I(f) = V₀ / Z [A]', 50, 30)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px sans-serif'
  ctx.fillText('周波数 f [Hz] →', w - 100, h - 12)

  // 共振周波数 f0 の縦点線
  const fMax = 200
  const f0X = 40 + (f0.value / fMax) * (w - 70)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(f0X, 35)
  ctx.lineTo(f0X, h - 30)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#fbbf24'
  ctx.fillText(`f₀ = ${f0.value.toFixed(1)} Hz`, f0X - 35, 48)

  // 共振曲線の描画
  const maxI = V0.value / R.value
  const yBottom = h - 30
  const yHeight = h - 70

  ctx.beginPath()
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 2.5

  const pointsCount = 100
  for (let i = 0; i <= pointsCount; i++) {
    const fVal = (i / pointsCount) * fMax
    const wVal = 2 * Math.PI * fVal
    const curXL = wVal * L.value
    const curXC = wVal > 0 ? 1 / (wVal * C.value) : 9999
    const curZ = Math.sqrt(R.value ** 2 + (curXL - curXC) ** 2)
    const curI = V0.value / curZ

    const px = 40 + (i / pointsCount) * (w - 70)
    const py = yBottom - (curI / maxI) * yHeight

    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()

  // 現在の動作点マーカー
  const curX = 40 + (frequency.value / fMax) * (w - 70)
  const curY = yBottom - (I0.value / maxI) * yHeight

  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(curX, curY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`I = ${I0.value.toFixed(2)} A`, curX + 10, curY - 6)

  resBoardTexture.needsUpdate = true
}

// ----------------------------------------------------
// ライフサイクル管理
// ----------------------------------------------------
onMounted(() => {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0, 8.5, 13],
    initialTarget: [0, 0.5, 0],
    background: 0x080c16,
    onFrame: (dt) => {
      updatePhasor(dt)
    }
  })

  rebuild3DScene()
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
.lab {
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.lab-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

.mode-tabs-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 10px;
  margin-bottom: 0.65rem;
}

.mode-tab-btn {
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.mode-tab-btn:hover {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.mode-tab-btn.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(2, 132, 199, 0.4);
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.25);
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
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(0, 0, 0, 0.25);
}

.speed-label {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.speed-btn-group button {
  padding: 2px 8px;
  font-size: 0.74rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  cursor: pointer;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 440px;
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
  border: 1px solid rgba(56, 189, 248, 0.45);
  font-size: 0.75rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 350px;
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
  .mode-tab-btn {
    white-space: normal;
    text-align: center;
  }
  .speed-control-group {
    border-radius: 10px;
    padding: 5px 9px;
    width: 100%;
  }
  .ortho-status-strip {
    justify-content: flex-start;
  }
  .mode-tabs-bar {
    flex-direction: column;
  }
}
</style>
