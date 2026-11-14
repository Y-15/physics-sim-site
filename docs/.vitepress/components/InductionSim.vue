<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#f59e0b">
    <div class="lab-head">
      <span class="lab-title">🧲 3D 電磁誘導の法則とレンツの法則・導線棒の運動</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ mode === 'magnet' ? '棒磁石とソレノイドコイル（レンツ則）' : '磁場中の導線棒（レール回路）' }}</span>
      </div>
    </div>

    <p class="lab-desc">
      ファラデーの電磁誘導の法則 <i>V</i> = -<i>N</i> (dΦ/dt) と、磁束の変化を妨げる向きに誘導起電力が生じるレンツの法則を、3D棒磁石・ソレノイドコイル・検流計の物理連動、および磁場中を滑る導線棒の終端速度シミュレーションで直感的に体感できます。
    </p>

    <!-- モード切替タブ -->
    <div class="mode-tabs-bar">
      <button class="mode-tab-btn" :class="{ active: mode === 'magnet' }" @click="switchMode('magnet')">
        🧲 コイルと棒磁石（レンツの法則・検流計・Φ-V波形）
      </button>
      <button class="mode-tab-btn" :class="{ active: mode === 'rail' }" @click="switchMode('rail')">
        🚂 磁場中の導線棒（レール回路・終端速度・エネルギー保存）
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
          📐 正面断面
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上
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
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🐢 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="lab-btn" @click="resetCurrentMode" style="padding: 5px 12px; font-size: 0.82rem;">
        🔄 リセット
      </button>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend" v-if="mode === 'magnet'">
        <span class="legend-item">
          <i style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
          N極 (赤)
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          S極 (青)
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          誘導起電力・電流
        </span>
        <span class="legend-item">
          <i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
          レンツ対抗磁束 ΔΦ
        </span>
      </div>

      <div class="three-hud-legend" v-else>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          外力 F_ext
        </span>
        <span class="legend-item">
          <i style="background:#ec4899;box-shadow:0 0 6px #ec4899"></i>
          電磁気力 F_mag (制動)
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          誘導起電力 V = vBl
        </span>
        <span class="legend-item">
          <i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
          誘導電流 I
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" v-if="mode === 'magnet'" :style="{ borderColor: Math.abs(curEmf) > 0.05 ? '#fbbf24' : '#38bdf8', color: '#f8fafc' }">
        ファラデーの法則: <i>V</i> = -<i>N</i> (dΦ/dt) ｜ 磁束 Φ = {{ (curFlux * 1e3).toFixed(2) }} mWb ｜ 起電力 <i>V</i> = {{ curEmf.toFixed(2) }} V
      </span>
      <span class="three-ortho-badge" v-else style="border-color:#38bdf8; color:#f8fafc">
        運動方程式: <i>m</i> (dv/dt) = <i>F</i><sub>ext</sub> - <i>IBl</i> ｜ 終端速度 <i>v</i><sub>term</sub> = {{ terminalSpeed.toFixed(2) }} m/s ｜ 現速度 <i>v</i> = {{ curSpeed.toFixed(2) }} m/s
      </span>
    </div>

    <!-- コントロールパネル: 磁石モード -->
    <div v-if="mode === 'magnet'" class="lab-controls">
      <div class="lab-ctrl">
        <label>棒磁石の位置 <i>x</i>: <strong>{{ (magnetPos).toFixed(1) }} cm</strong> (コイル中心 = 0 cm)</label>
        <input type="range" v-model.number="magnetPos" min="-8" max="8" step="0.1" @input="onManualMagnetMove" />
        <div class="lab-note">磁石を動かすと、コイルを貫く磁束が変化して誘導電流が発生します</div>
      </div>

      <div class="lab-ctrl">
        <label>磁石の向き（手前側の極性）</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: magnetPolarity === 'N' }" @click="magnetPolarity = 'N'">N極手前 [N ➔ | S]</button>
          <button class="lab-chip" :class="{ on: magnetPolarity === 'S' }" @click="magnetPolarity = 'S'">S極手前 [S ➔ | N]</button>
          <button class="lab-btn" :class="{ 'lab-btn-pri': autoOscillating }" @click="toggleAutoOscillate">
            {{ autoOscillating ? '⏹️ 自動往復停止' : '🔁 自動往復運動' }}
          </button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>コイル巻数 <i>N</i>: <strong>{{ coilTurns }} ターン</strong></label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: coilTurns === 100 }" @click="coilTurns = 100">100 ターン</button>
          <button class="lab-chip" :class="{ on: coilTurns === 200 }" @click="coilTurns = 200">200 ターン</button>
          <button class="lab-chip" :class="{ on: coilTurns === 400 }" @click="coilTurns = 400">400 ターン (強)</button>
        </div>
      </div>
    </div>

    <!-- コントロールパネル: レール回路モード -->
    <div v-else class="lab-controls">
      <div class="lab-ctrl">
        <label>磁束密度 <i>B</i>: <strong>{{ bField.toFixed(2) }} T</strong> (⊗ 画面奥向き)</label>
        <input type="range" v-model.number="bField" min="0.2" max="2.0" step="0.1" />
      </div>

      <div class="lab-ctrl">
        <label>外力 <i>F</i><sub>ext</sub>: <strong>{{ extForce.toFixed(2) }} N</strong> (右向きに引っ張る力)</label>
        <input type="range" v-model.number="extForce" min="0.0" max="3.0" step="0.2" />
        <div class="lab-note">外力を加えると加速し、電磁気力のブレーキとつり合って終端速度に達します</div>
      </div>

      <div class="lab-ctrl">
        <label>回路の抵抗 <i>R</i>: <strong>{{ resistance.toFixed(1) }} Ω</strong></label>
        <input type="range" v-model.number="resistance" min="0.5" max="5.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>導線棒の質量 <i>m</i>: <strong>{{ rodMass.toFixed(2) }} kg</strong></label>
        <input type="range" v-model.number="rodMass" min="0.1" max="1.0" step="0.1" />
      </div>
    </div>

    <!-- ステータスモニター: 磁石モード -->
    <div v-if="mode === 'magnet'" class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">検流計 G の針振れ</div>
        <div class="v" :style="{ color: Math.abs(galvanoCurrent) > 0.05 ? '#fbbf24' : '#94a3b8' }">
          {{ galvanoCurrent > 0.08 ? '+ 右振れ (+)' : (galvanoCurrent < -0.08 ? '- 左振れ (-)' : '0 (中央)') }}
        </div>
        <div class="f">誘導電流 <i>I</i> = {{ (galvanoCurrent * 10).toFixed(2) }} mA</div>
      </div>

      <div class="lab-stat">
        <div class="k">コイルを貫く磁束 Φ</div>
        <div class="v" style="color:#38bdf8">{{ (curFlux * 1e3).toFixed(2) }} <small>mWb</small></div>
        <div class="f">磁石がコイル中心で極大</div>
      </div>

      <div class="lab-stat">
        <div class="k">磁束変化率 dΦ/dt</div>
        <div class="v" style="color:#10b981">{{ (dFluxDt * 1e3).toFixed(2) }} <small>mWb/s</small></div>
        <div class="f">起電力 <i>V</i> = -<i>N</i> (dΦ/dt)</div>
      </div>

      <div class="lab-stat">
        <div class="k">レンツの法則による作用</div>
        <div class="v" style="color:#ec4899">{{ lenzActionText }}</div>
        <div class="f">変化を妨げる磁界・力を生成</div>
      </div>
    </div>

    <!-- ステータスモニター: レール回路モード -->
    <div v-else class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">誘導起電力 <i>V</i></div>
        <div class="v" style="color:#fbbf24">{{ railEmf.toFixed(2) }} <small>V</small></div>
        <div class="f"><i>V</i> = <i>v B l</i></div>
      </div>

      <div class="lab-stat">
        <div class="k">誘導電流 <i>I</i></div>
        <div class="v" style="color:#10b981">{{ railCurrent.toFixed(2) }} <small>A</small></div>
        <div class="f"><i>I</i> = <i>V</i> / <i>R</i> (反時計回り)</div>
      </div>

      <div class="lab-stat">
        <div class="k">導線棒の速さ <i>v</i></div>
        <div class="v" style="color:#38bdf8">{{ curSpeed.toFixed(2) }} <small>m/s</small></div>
        <div class="f">理論終端 <i>v</i><sub>term</sub> = {{ terminalSpeed.toFixed(2) }} m/s</div>
      </div>

      <div class="lab-stat">
        <div class="k">電磁気力 <i>F</i><sub>mag</sub></div>
        <div class="v" style="color:#ec4899">{{ railMagForce.toFixed(2) }} <small>N</small></div>
        <div class="f"><i>F</i> = <i>I B l</i> (進行逆向きブレーキ)</div>
      </div>

      <div class="lab-stat">
        <div class="k">外力の仕事率 <i>P</i><sub>ext</sub></div>
        <div class="v" style="color:#a855f7">{{ (extForce * curSpeed).toFixed(2) }} <small>W</small></div>
        <div class="f"><i>P</i> = <i>F</i><sub>ext</sub> · <i>v</i></div>
      </div>

      <div class="lab-stat">
        <div class="k">消費ジュール熱 <i>P</i><sub>J</sub></div>
        <div class="v" style="color:#ef4444">{{ (railCurrent * railCurrent * resistance).toFixed(2) }} <small>W</small></div>
        <div class="f">終端速度で <i>P</i><sub>ext</sub> と一致！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

// モード管理: 'magnet' (コイルと棒磁石) / 'rail' (レール回路)
const mode = ref('magnet')
const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

// 磁石モードパラメータ
const magnetPos = ref(5.0) // cm (-8 ~ +8)
const magnetPolarity = ref('N') // 'N' or 'S'
const coilTurns = ref(200)
const autoOscillating = ref(true)
let lastMagnetPos = 5.0
let magnetVelocity = 0
const curFlux = ref(0)
const dFluxDt = ref(0)
const curEmf = ref(0)
const galvanoCurrent = ref(0)

// レール回路モードパラメータ
const bField = ref(1.0) // T
const extForce = ref(1.2) // N
const resistance = ref(2.0) // Ω
const rodMass = ref(0.2) // kg
const rodLength = 0.5 // m
const rodPos = ref(-4.0) // スケール位置 -4.0 ~ +4.0
const curSpeed = ref(0)

// 終端速度計算
const terminalSpeed = computed(() => {
  const bl2 = (bField.value * rodLength) ** 2
  if (bl2 < 1e-4) return 999
  return (extForce.value * resistance.value) / bl2
})

const railEmf = computed(() => curSpeed.value * bField.value * rodLength)
const railCurrent = computed(() => railEmf.value / resistance.value)
const railMagForce = computed(() => railCurrent.value * bField.value * rodLength)

const lenzActionText = computed(() => {
  if (Math.abs(magnetVelocity) < 0.05) return '静止中（起電力なし）'
  const isApproaching = (magnetPos.value > 0 && magnetVelocity < 0) || (magnetPos.value < 0 && magnetVelocity > 0)
  if (isApproaching) {
    return magnetPolarity.value === 'N' ? '反発力（N極対向で阻止）' : '反発力（S極対向で阻止）'
  } else {
    return magnetPolarity.value === 'N' ? '引力（S極対向で引き止め）' : '引力（N極対向で引き止め）'
  }
})

// Three.js 関連参照
const threeContainer = ref(null)
let threeCtx = null
let sceneGroup = null

// 磁石モード用 3D オブジェクト参照
let magnetMeshGroup = null
let coilMeshGroup = null
let galvanoGroup = null
let needleMesh = null
let lenzArrow = null
let waveCanvas = null
let waveTexture = null
let wavePlane = null
let waveCtx = null
const waveHistory = []

// レールモード用 3D オブジェクト参照
let railGroup = null
let rodMesh = null
let extForceArrow = null
let magForceArrow = null
let railEmfArrow = null
let electronParticles = null

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function toggleAutoOscillate() {
  autoOscillating.value = !autoOscillating.value
}

function onManualMagnetMove() {
  autoOscillating.value = false
}

function resetCurrentMode() {
  if (mode.value === 'magnet') {
    magnetPos.value = 5.0
    lastMagnetPos = 5.0
    magnetVelocity = 0
    waveHistory.length = 0
  } else {
    rodPos.value = -4.0
    curSpeed.value = 0
  }
}

function switchMode(newMode) {
  mode.value = newMode
  resetCurrentMode()
  rebuild3DScene()
  setCameraPreset(activeCam.value, 0.4)
}

function setCameraPreset(preset, dur = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return

  const isNarrow = (threeCtx.camera?.aspect || 1.7) < 1.35
  const mult = isNarrow ? 1.35 : 1.0

  if (mode.value === 'magnet') {
    if (preset === '3d') {
      threeCtx.moveCameraTo([0, 8.5 * mult, 13.5 * mult], [0, 0, 0.5], dur, 42)
    } else if (preset === 'front') {
      threeCtx.moveCameraTo([0, 0.6, 28 * mult], [0, 0.3, 0.5], dur, 14)
    } else if (preset === 'top') {
      threeCtx.moveCameraTo([0, 30 * mult, 0.8], [0, 0, 0.8], dur, 14)
    }
  } else {
    if (preset === '3d') {
      threeCtx.moveCameraTo([0, 9.5 * mult, 14.5 * mult], [0, 0, 0], dur, 42)
    } else if (preset === 'front') {
      threeCtx.moveCameraTo([0, 0.8, 30 * mult], [0, 0, 0], dur, 14)
    } else if (preset === 'top') {
      threeCtx.moveCameraTo([0, 32 * mult, 0.01], [0, 0, 0], dur, 14)
    }
  }
}

// ----------------------------------------------------
// 3D シーン構築
// ----------------------------------------------------
function rebuild3DScene() {
  if (!threeCtx) return
  if (sceneGroup) {
    threeCtx.scene.remove(sceneGroup)
  }
  sceneGroup = new THREE.Group()
  threeCtx.scene.add(sceneGroup)

  // 共通のグリッドベース台座
  const gridHelper = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a)
  gridHelper.position.y = -2.2
  sceneGroup.add(gridHelper)

  if (mode.value === 'magnet') {
    buildMagnetScene()
  } else {
    buildRailScene()
  }
}

function buildMagnetScene() {
  // 1. ソレノイドコイル
  coilMeshGroup = new THREE.Group()
  sceneGroup.add(coilMeshGroup)

  // コイルボビン（半透明アクリル円筒）
  const bobbinGeo = new THREE.CylinderGeometry(1.6, 1.6, 3.4, 32, 1, true)
  bobbinGeo.rotateZ(Math.PI / 2)
  const bobbinMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    transmission: 0.8,
    side: THREE.DoubleSide
  })
  const bobbinMesh = new THREE.Mesh(bobbinGeo, bobbinMat)
  coilMeshGroup.add(bobbinMesh)

  // コイル銅線スパイラル（TubeGeometry）
  const spiralPts = []
  const turns = 14
  for (let i = 0; i <= turns * 32; i++) {
    const t = i / (turns * 32)
    const angle = t * Math.PI * 2 * turns
    const x = (t - 0.5) * 3.2
    const y = Math.sin(angle) * 1.65
    const z = Math.cos(angle) * 1.65
    spiralPts.push(new THREE.Vector3(x, y, z))
  }
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPts)
  const copperGeo = new THREE.TubeGeometry(spiralCurve, 200, 0.065, 8, false)
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.88,
    roughness: 0.25,
    emissive: 0x78350f,
    emissiveIntensity: 0.2
  })
  const copperMesh = new THREE.Mesh(copperGeo, copperMat)
  coilMeshGroup.add(copperMesh)

  // コイルのラベル
  const coilLabel = createTextSprite('ソレノイドコイル N', { color: '#fbbf24', fontSize: 32, scale: 0.55 })
  coilLabel.position.set(0, 2.3, 0)
  coilMeshGroup.add(coilLabel)

  // 2. 棒磁石
  magnetMeshGroup = new THREE.Group()
  sceneGroup.add(magnetMeshGroup)

  const magLen = 3.6
  const magR = 0.72
  const magGeo = new THREE.CylinderGeometry(magR, magR, magLen / 2, 28)
  magGeo.rotateZ(Math.PI / 2)

  // N極マテリアル (赤)
  const nMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    metalness: 0.35,
    roughness: 0.3,
    emissive: 0x9f1239,
    emissiveIntensity: 0.25
  })
  // S極マテリアル (青)
  const sMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.35,
    roughness: 0.3,
    emissive: 0x075985,
    emissiveIntensity: 0.25
  })

  const nMesh = new THREE.Mesh(magGeo, nMat)
  const sMesh = new THREE.Mesh(magGeo, sMat)
  nMesh.position.x = magLen / 4
  sMesh.position.x = -magLen / 4
  magnetMeshGroup.add(nMesh)
  magnetMeshGroup.add(sMesh)

  // 磁石文字スプライト
  const nLabel = createTextSprite('N', { color: '#ffffff', bgColor: 'rgba(244,63,94,0.9)', borderColor: '#fff', fontSize: 36, scale: 0.38 })
  nLabel.position.set(magLen / 4, 0, magR + 0.05)
  magnetMeshGroup.add(nLabel)

  const sLabel = createTextSprite('S', { color: '#ffffff', bgColor: 'rgba(56,189,248,0.9)', borderColor: '#fff', fontSize: 36, scale: 0.38 })
  sLabel.position.set(-magLen / 4, 0, magR + 0.05)
  magnetMeshGroup.add(sLabel)

  // 磁力線ループ群（磁石から広がるループ）
  const fieldLineGroup = new THREE.Group()
  const numLoops = 6
  const fMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
  for (let i = 0; i < numLoops; i++) {
    const angle = (i / numLoops) * Math.PI * 2
    const loopPts = []
    const radY = Math.sin(angle)
    const radZ = Math.cos(angle)
    for (let u = 0; u <= 36; u++) {
      const p = u / 36
      const lx = (p - 0.5) * magLen * 1.8
      const distFromEnd = Math.sin(p * Math.PI)
      const ly = radY * (magR + distFromEnd * 1.4)
      const lz = radZ * (magR + distFromEnd * 1.4)
      loopPts.push(new THREE.Vector3(lx, ly, lz))
    }
    const loopGeo = new THREE.BufferGeometry().setFromPoints(loopPts)
    fieldLineGroup.add(new THREE.Line(loopGeo, fMat))
  }
  magnetMeshGroup.add(fieldLineGroup)

  // 3. レンツの対抗磁束矢印
  lenzArrow = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.09, headRadius: 0.22, headLength: 0.6 })
  sceneGroup.add(lenzArrow)

  // 4. 検流計 (Galvanometer G)
  galvanoGroup = new THREE.Group()
  galvanoGroup.position.set(0, -1.8, 3.2)
  sceneGroup.add(galvanoGroup)

  // ケース
  const meterCaseGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.45, 32)
  meterCaseGeo.rotateX(Math.PI / 4)
  const meterCaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 })
  const meterCase = new THREE.Mesh(meterCaseGeo, meterCaseMat)
  galvanoGroup.add(meterCase)

  // 文字盤（白い円盤）
  const dialGeo = new THREE.CircleGeometry(1.4, 32)
  dialGeo.rotateX(-Math.PI / 4)
  dialGeo.translate(0, 0.02, 0.23)
  const dialMat = new THREE.MeshBasicMaterial({ color: 0x090d16 })
  const dialMesh = new THREE.Mesh(dialGeo, dialMat)
  galvanoGroup.add(dialMesh)

  // 検流計の針
  const needleGroup = new THREE.Group()
  needleGroup.position.set(0, -0.2, 0.24)
  needleGroup.rotation.x = -Math.PI / 4

  const needleShaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8)
  needleShaftGeo.translate(0, 0.55, 0)
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
  const needleShaft = new THREE.Mesh(needleShaftGeo, needleMat)
  needleGroup.add(needleShaft)

  const needleCenterGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16)
  needleCenterGeo.rotateX(Math.PI / 2)
  needleGroup.add(new THREE.Mesh(needleCenterGeo, new THREE.MeshBasicMaterial({ color: 0xffffff })))

  galvanoGroup.add(needleGroup)
  needleMesh = needleGroup

  const galvanoLabel = createTextSprite('検流計 G', { color: '#e2e8f0', fontSize: 32, scale: 0.42 })
  galvanoLabel.position.set(0, 1.4, 0)
  galvanoGroup.add(galvanoLabel)

  // 5. 空間リアルタイム波形パネル (CanvasTexture)
  waveCanvas = document.createElement('canvas')
  waveCanvas.width = 512
  waveCanvas.height = 256
  waveCtx = waveCanvas.getContext('2d')

  waveTexture = new THREE.CanvasTexture(waveCanvas)
  waveTexture.minFilter = THREE.LinearFilter
  waveTexture.magFilter = THREE.LinearFilter

  const wavePlaneGeo = new THREE.PlaneGeometry(5.2, 2.6)
  const wavePlaneMat = new THREE.MeshBasicMaterial({
    map: waveTexture,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide
  })
  wavePlane = new THREE.Mesh(wavePlaneGeo, wavePlaneMat)
  wavePlane.position.set(0, 1.8, -4.0)
  wavePlane.rotation.x = 0.15
  sceneGroup.add(wavePlane)
}

function buildRailScene() {
  railGroup = new THREE.Group()
  sceneGroup.add(railGroup)

  const railLength = 10.0
  const railGap = 3.2
  const railRadius = 0.08

  // 1. 2本の導電レール (円柱)
  const railGeo = new THREE.CylinderGeometry(railRadius, railRadius, railLength, 16)
  railGeo.rotateZ(Math.PI / 2)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })

  const topRail = new THREE.Mesh(railGeo, railMat)
  topRail.position.set(0, 0, -railGap / 2)
  railGroup.add(topRail)

  const botRail = new THREE.Mesh(railGeo, railMat)
  botRail.position.set(0, 0, railGap / 2)
  railGroup.add(botRail)

  // 2. 左端の接続抵抗 R
  const endWireGeo = new THREE.CylinderGeometry(railRadius, railRadius, railGap, 16)
  const endWireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
  const endWire = new THREE.Mesh(endWireGeo, endWireMat)
  endWire.position.set(-railLength / 2, 0, 0)
  railGroup.add(endWire)

  // 抵抗本体（セラミック円柱）
  const resGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.2, 24)
  const resMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, emissive: 0xb45309, emissiveIntensity: 0.3 })
  const resMesh = new THREE.Mesh(resGeo, resMat)
  resMesh.position.set(-railLength / 2, 0, 0)
  railGroup.add(resMesh)

  const resLabel = createTextSprite(`抵抗 R (${resistance.value}Ω)`, { color: '#fbbf24', fontSize: 30, scale: 0.45 })
  resLabel.position.set(-railLength / 2 - 0.2, 0.9, 0)
  railGroup.add(resLabel)

  // 3. 移動する導線棒
  const rodGeo = new THREE.CylinderGeometry(0.12, 0.12, railGap + 0.6, 20)
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35
  })
  rodMesh = new THREE.Mesh(rodGeo, rodMat)
  rodMesh.position.set(rodPos.value, 0, 0)
  railGroup.add(rodMesh)

  // 4. ベクトル矢印
  extForceArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.08, headRadius: 0.2, headLength: 0.5 })
  magForceArrow = createVectorArrow3D({ color: 0xec4899, shaftRadius: 0.08, headRadius: 0.2, headLength: 0.5 })
  railEmfArrow = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.07, headRadius: 0.18, headLength: 0.45 })
  sceneGroup.add(extForceArrow)
  sceneGroup.add(magForceArrow)
  sceneGroup.add(railEmfArrow)

  // 5. 磁場領域 (⊗ 空間内の磁力線矢印)
  const bFieldGroup = new THREE.Group()
  const bArrowGeo = new THREE.ConeGeometry(0.12, 0.32, 12)
  bArrowGeo.rotateX(Math.PI) // 下向き
  const bMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.55 })
  for (let x = -railLength / 2 + 1.2; x <= railLength / 2 - 1.2; x += 1.8) {
    for (let z = -railGap / 2 + 0.6; z <= railGap / 2 - 0.6; z += 1.0) {
      const cone = new THREE.Mesh(bArrowGeo, bMat)
      cone.position.set(x, -0.1, z)
      bFieldGroup.add(cone)
    }
  }
  railGroup.add(bFieldGroup)

  const bLabel = createTextSprite('一様磁場 B (下向き)', { color: '#38bdf8', fontSize: 30, scale: 0.45 })
  bLabel.position.set(0, 1.8, 0)
  railGroup.add(bLabel)

  // 6. 電荷粒子の流れ
  const numP = 16
  const pGeo = new THREE.SphereGeometry(0.07, 12, 12)
  const pMat = new THREE.MeshBasicMaterial({ color: 0x10b981 })
  electronParticles = new THREE.InstancedMesh(pGeo, pMat, numP)
  railGroup.add(electronParticles)
}

// ----------------------------------------------------
// 物理演算と 3D 更新ループ
// ----------------------------------------------------
let autoAngle = 0
let electronFlowPhase = 0

function updateSimulation(dt) {
  if (!isPlaying.value) return

  const effectiveDt = dt * timeScale.value

  if (mode.value === 'magnet') {
    // 磁石自動往復
    if (autoOscillating.value) {
      autoAngle += effectiveDt * 2.2
      magnetPos.value = Math.sin(autoAngle) * 5.5
    }

    // 速度計算
    const dx = (magnetPos.value - lastMagnetPos)
    magnetVelocity = dx / Math.max(0.001, effectiveDt)
    lastMagnetPos = magnetPos.value

    // 磁束 Φ 計算: 双極子モデル Φ = sign * (C / (1 + (x/a)^2)^1.5)
    const sign = magnetPolarity.value === 'N' ? 1 : -1
    const xDist = magnetPos.value
    const fluxScale = 2.0e-3
    curFlux.value = (sign * fluxScale) / Math.pow(1 + (xDist / 2.2) ** 2, 1.5)

    // dΦ/dt = (dΦ/dx) * (dx/dt)
    const dPhiDx = -sign * fluxScale * (3 * xDist / (2.2 * 2.2)) / Math.pow(1 + (xDist / 2.2) ** 2, 2.5)
    dFluxDt.value = dPhiDx * magnetVelocity

    // 起電力 V = -N (dΦ/dt)
    curEmf.value = -coilTurns.value * dFluxDt.value * 0.05
    galvanoCurrent.value = curEmf.value / 15.0 // 検流計振れ幅

    // 3D 磁石位置同期
    if (magnetMeshGroup) {
      magnetMeshGroup.position.x = magnetPos.value
      // 極性反転
      magnetMeshGroup.rotation.y = magnetPolarity.value === 'N' ? 0 : Math.PI
    }

    // 検流計の針回転
    if (needleMesh) {
      const maxAngle = 0.75
      const targetAngle = Math.max(-maxAngle, Math.min(maxAngle, -galvanoCurrent.value * 1.8))
      needleMesh.rotation.z = targetAngle
    }

    // レンツの対抗磁束矢印
    if (lenzArrow) {
      const opposingB = -dFluxDt.value * 1500
      if (Math.abs(opposingB) > 0.1) {
        const dir = new THREE.Vector3(Math.sign(opposingB), 0, 0)
        lenzArrow.setVector(new THREE.Vector3(0, 0, 0), dir, Math.min(2.5, Math.abs(opposingB)))
      } else {
        lenzArrow.visible = false
      }
    }

    // 波形テクスチャ更新
    updateWaveTexture()

  } else {
    // レール回路モード
    const netForce = extForce.value - railMagForce.value
    const acc = netForce / rodMass.value
    curSpeed.value += acc * effectiveDt
    if (curSpeed.value < 0) curSpeed.value = 0

    rodPos.value += curSpeed.value * effectiveDt * 1.2
    if (rodPos.value > 4.5) {
      rodPos.value = -4.0
      curSpeed.value = 0
    }

    if (rodMesh) {
      rodMesh.position.x = rodPos.value
    }

    // 矢印同期
    const rX = rodPos.value
    if (extForceArrow) {
      extForceArrow.setVector(new THREE.Vector3(rX, 0.4, 0), new THREE.Vector3(1, 0, 0), extForce.value * 0.9)
    }
    if (magForceArrow) {
      magForceArrow.setVector(new THREE.Vector3(rX, 0.4, 0), new THREE.Vector3(-1, 0, 0), railMagForce.value * 0.9)
    }
    if (railEmfArrow) {
      railEmfArrow.setVector(new THREE.Vector3(rX, 0, 1.4), new THREE.Vector3(0, 0, -1), Math.min(2.8, railEmf.value * 0.8))
    }

    // 電流粒子アニメーション
    if (electronParticles && railCurrent.value > 0.05) {
      electronFlowPhase += effectiveDt * railCurrent.value * 2.0
      const railLength = 10.0
      const railGap = 3.2
      const leftX = -railLength / 2
      const curRodX = rodPos.value
      const loopWidth = curRodX - leftX
      const perimeter = loopWidth * 2 + railGap * 2

      const dummy = new THREE.Object3D()
      for (let i = 0; i < 16; i++) {
        const prog = ((i / 16 + electronFlowPhase * 0.25) % 1 + 1) % 1
        const s = prog * perimeter
        let px = leftX
        let pz = -railGap / 2

        // 反時計回り (上レールを左へ -> 左端を下へ -> 下レールを右へ -> 導線棒を上へ)
        if (s < loopWidth) {
          px = curRodX - s
          pz = -railGap / 2
        } else if (s < loopWidth + railGap) {
          px = leftX
          pz = -railGap / 2 + (s - loopWidth)
        } else if (s < loopWidth * 2 + railGap) {
          px = leftX + (s - (loopWidth + railGap))
          pz = railGap / 2
        } else {
          px = curRodX
          pz = railGap / 2 - (s - (loopWidth * 2 + railGap))
        }

        dummy.position.set(px, 0.05, pz)
        dummy.updateMatrix()
        electronParticles.setMatrixAt(i, dummy.matrix)
      }
      electronParticles.instanceMatrix.needsUpdate = true
      electronParticles.visible = true
    } else if (electronParticles) {
      electronParticles.visible = false
    }
  }
}

function updateWaveTexture() {
  if (!waveCtx || !waveTexture) return

  waveHistory.push({
    flux: curFlux.value * 1e3,
    emf: curEmf.value
  })
  if (waveHistory.length > 200) waveHistory.shift()

  const ctx = waveCtx
  const w = waveCanvas.width
  const h = waveCanvas.height

  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, w, h)

  // グリッド線
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= w; x += 40) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
  }
  for (let y = 0; y <= h; y += 40) {
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  ctx.stroke()

  // 中心ゼロ軸
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, h / 2)
  ctx.lineTo(w, h / 2)
  ctx.stroke()

  // タイトルと凡例
  ctx.font = 'bold 16px sans-serif'
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('Φ(t) [mWb] (水色)', 16, 26)
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('起電力 V(t) = -dΦ/dt (黄色)', 240, 26)

  if (waveHistory.length < 2) {
    waveTexture.needsUpdate = true
    return
  }

  // 1. 磁束 Φ(t) 曲線 (水色)
  ctx.beginPath()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  const step = w / 200
  for (let i = 0; i < waveHistory.length; i++) {
    const x = i * step
    const y = h / 2 - waveHistory[i].flux * 28
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 2. 起電力 V(t) 曲線 (黄色)
  ctx.beginPath()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.5
  for (let i = 0; i < waveHistory.length; i++) {
    const x = i * step
    const y = h / 2 - waveHistory[i].emf * 45
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  waveTexture.needsUpdate = true
}

// ----------------------------------------------------
// ライフサイクル管理
// ----------------------------------------------------
onMounted(() => {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0, 7.5, 12.5],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame: (dt) => {
      updateSimulation(dt)
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
