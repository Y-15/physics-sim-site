<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#fbbf24">
    <div class="lab-head">
      <span class="lab-title">⚡ 3D LC共振回路と電磁振動（電気振動のエネルギー保存則）</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge" style="--ac:#38bdf8">位相 φ: {{ currentPhaseDeg.toFixed(0) }}° ({{ phaseDescription }})</span>
      </div>
    </div>

    <p class="lab-desc">
      コンデンサー（<i>C</i>）の静電エネルギー <i>U</i><sub>E</sub> = <i>Q</i>²/(2<i>C</i>)（電場と電荷）と、コイル（<i>L</i>）の磁気エネルギー <i>U</i><sub>B</sub> = 1/2 <i>L</i><i>I</i>²（ソレノイド磁束）が周期的に交互変換されるLC電磁振動。力学の単振動（ばね振り子）と完全同等のエネルギー保存則 <i>E</i> = <i>U</i><sub>E</sub> + <i>U</i><sub>B</sub> = const を3D空間で体感できます。
    </p>

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
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.8 }" @click="timeScale = 1.8">1.8x</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim" style="padding: 5px 12px; font-size: 0.82rem;">
        ⏭ コマ送り (+15°)
      </button>
      <button class="lab-btn" @click="resetSim" style="padding: 5px 12px; font-size: 0.82rem;">
        🔄 初期充電にリセット
      </button>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          コンデンサー電場 U_E (±Q)
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          コイル磁束 Φ &amp; 磁場 U_B
        </span>
        <span class="legend-item">
          <i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
          全エネルギー保存ゲージ
        </span>
        <span class="legend-item">
          <i style="background:#c084fc;box-shadow:0 0 6px #c084fc"></i>
          往復電流 I(t) 粒子流
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" style="border-color:#38bdf8; color:#f8fafc">
        単振動方程式: d²<i>Q</i>/d<i>t</i>² + (1/<i>LC</i>)<i>Q</i> = 0 ｜ 周期 <i>T</i> = 2π√(<i>LC</i>) = {{ (period * 1000).toFixed(1) }} ms ｜
        全エネルギー <i>E</i> = {{ (totalE * 1000).toFixed(2) }} mJ (一定)
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>自己インダクタンス <i>L</i>: <strong>{{ L_mH }} mH</strong></label>
        <input type="range" v-model.number="L_mH" min="10" max="200" step="10" />
        <div class="lab-note">インダクタンスが大きいほど磁気エネルギー蓄積が強くなり振動周期が長くなります</div>
      </div>

      <div class="lab-ctrl">
        <label>電気容量 <i>C</i>: <strong>{{ C_uF }} μF</strong></label>
        <input type="range" v-model.number="C_uF" min="10" max="100" step="5" />
      </div>

      <div class="lab-ctrl">
        <label>初期充電電圧 <i>V</i><sub>0</sub>: <strong>{{ V0.toFixed(0) }} V</strong></label>
        <input type="range" v-model.number="V0" min="5" max="30" step="1" @input="resetSim" />
        <div class="lab-note">最大電荷 <i>Q</i><sub>max</sub> = <i>C</i> <i>V</i><sub>0</sub> = {{ (Q_max * 1e6).toFixed(1) }} μC</div>
      </div>
    </div>

    <!-- リアルタイム物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">固有角振動数 ω</div>
        <div class="v" style="color:#38bdf8">{{ omega.toFixed(0) }} <small>rad/s</small></div>
        <div class="f">ω = 1 / √(LC)</div>
      </div>

      <div class="lab-stat">
        <div class="k">固有周波数 <i>f</i></div>
        <div class="v" style="color:#10b981">{{ freq.toFixed(1) }} <small>Hz</small></div>
        <div class="f"><i>f</i> = ω / (2π)</div>
      </div>

      <div class="lab-stat">
        <div class="k">固有周期 <i>T</i></div>
        <div class="v" style="color:#fbbf24">{{ (period * 1000).toFixed(1) }} <small>ms</small></div>
        <div class="f"><i>T</i> = 2π√(LC)</div>
      </div>

      <div class="lab-stat">
        <div class="k">最大電流 <i>I</i><sub>max</sub></div>
        <div class="v" style="color:#f43f5e">{{ (I_max * 1000).toFixed(1) }} <small>mA</small></div>
        <div class="f"><i>V</i><sub>0</sub> √(<i>C</i>/<i>L</i>)</div>
      </div>

      <div class="lab-stat">
        <div class="k">静電エネルギー <i>U</i><sub>E</sub></div>
        <div class="v" style="color:#38bdf8">{{ (UE * 1000).toFixed(2) }} <small>mJ</small></div>
        <div class="f"><i>Q</i>² / (2C) (電場)</div>
      </div>

      <div class="lab-stat">
        <div class="k">磁気エネルギー <i>U</i><sub>B</sub></div>
        <div class="v" style="color:#fbbf24">{{ (UB * 1000).toFixed(2) }} <small>mJ</small></div>
        <div class="f">1/2 <i>L</i> <i>I</i>² (磁場)</div>
      </div>
    </div>

    <!-- エネルギー保存内訳バー -->
    <div class="energy-card">
      <div class="energy-header">
        <span>全エネルギー保存則 <i>E</i> = <i>U</i><sub>E</sub> + <i>U</i><sub>B</sub> = {{ (totalE * 1000).toFixed(2) }} mJ (完全保存)</span>
      </div>
      <div class="energy-bar">
        <div class="bar-segment cap" :style="{ width: capEPercent + '%' }" title="静電エネルギー"></div>
        <div class="bar-segment coil" :style="{ width: coilEPercent + '%' }" title="磁気エネルギー"></div>
      </div>
      <div class="legend-row">
        <div class="legend-item"><span class="dot cap"></span>静電エネルギー <i>U</i><sub>E</sub> (電場): {{ (UE * 1000).toFixed(2) }} mJ ({{ capEPercent.toFixed(1) }}%)</div>
        <div class="legend-item"><span class="dot coil"></span>磁気エネルギー <i>U</i><sub>B</sub> (磁場): {{ (UB * 1000).toFixed(2) }} mJ ({{ coilEPercent.toFixed(1) }}%)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const activeCam = ref('3d')
const isRunning = ref(true)
const timeScale = ref(0.5)

const L_mH = ref(50) // mH
const C_uF = ref(40) // uF
const V0 = ref(12) // V

// 物理実単位計算
const L_val = computed(() => L_mH.value * 1e-3)
const C_val = computed(() => C_uF.value * 1e-6)
const omega = computed(() => 1 / Math.sqrt(L_val.value * C_val.value))
const freq = computed(() => omega.value / (2 * Math.PI))
const period = computed(() => 1 / freq.value)

// 視覚用アニメーション角速度 (基準で約1.5 rad/s)
const visualOmega = computed(() => 1.5 * (omega.value / 707.1))

const Q_max = computed(() => C_val.value * V0.value)
const I_max = computed(() => omega.value * Q_max.value)
const totalE = computed(() => 0.5 * C_val.value * (V0.value ** 2))

let simTime = 0

// 瞬時状態値
const currentPhase = ref(0)
const currentQ = ref(0)
const currentI = ref(0)
const UE = ref(0)
const UB = ref(0)

const currentPhaseDeg = computed(() => (((currentPhase.value * 180) / Math.PI) % 360 + 360) % 360)

const phaseDescription = computed(() => {
  const deg = currentPhaseDeg.value
  if (deg < 25 || deg >= 335) return '電荷最大 (電圧最大・電流ゼロ)'
  if (deg >= 65 && deg < 115) return '電流最大 (磁界最強・電荷ゼロ)'
  if (deg >= 155 && deg < 205) return '逆極性電荷最大'
  if (deg >= 245 && deg < 295) return '逆向き電流最大'
  return '電磁エネルギー交換中'
})

const capEPercent = computed(() => (totalE.value > 0 ? (UE.value / totalE.value) * 100 : 0))
const coilEPercent = computed(() => (totalE.value > 0 ? (UB.value / totalE.value) * 100 : 0))

function updateStateFromPhase(phi) {
  currentPhase.value = phi
  const q = Q_max.value * Math.cos(phi)
  const i = I_max.value * Math.sin(phi)
  currentQ.value = q
  currentI.value = i
  UE.value = (q ** 2) / (2 * C_val.value)
  UB.value = 0.5 * L_val.value * (i ** 2)
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function resetSim() {
  simTime = 0
  updateStateFromPhase(0)
  waveHistory.length = 0
}

function stepSim() {
  const dPhase = Math.PI / 12
  simTime += dPhase / (visualOmega.value || 1.5)
  updateStateFromPhase(visualOmega.value * simTime)
}

function setCameraPreset(preset, dur = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return

  const isNarrow = (threeCtx.camera?.aspect || 1.7) < 1.35
  const mult = isNarrow ? 1.35 : 1.0

  if (preset === '3d') {
    threeCtx.moveCameraTo([0, 9.5 * mult, 14.5 * mult], [0, 0, 0], dur, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 1.0, 32 * mult], [0, 0.4, 0], dur, 14)
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

// コンデンサー電場 & 電荷
let capPlateTop = null
let capPlateBot = null
let eFieldLinesGroup = null
let chargeParticlesGroup = null

// コイル & 磁束
let coilTubeMesh = null
let bFieldLinesGroup = null

// 3D エネルギー保存タワーゲージ
let gaugeBarE = null
let gaugeBarB = null
let gaugeLabel = null

// 往復電子キャリア
let electronInstMesh = null

// 3D 波形ボード (Q(t), I(t) グラフ)
let waveCanvas = null
let waveTexture = null
let waveCtx = null
const waveHistory = []

function build3DScene() {
  if (!threeCtx) return
  if (sceneGroup) threeCtx.scene.remove(sceneGroup)

  sceneGroup = new THREE.Group()
  threeCtx.scene.add(sceneGroup)

  // 1. 基板テーブル
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.35, 9.5),
    new THREE.MeshStandardMaterial({ color: 0x0a101f, metalness: 0.2, roughness: 0.8 })
  )
  table.position.y = -0.18
  sceneGroup.add(table)

  const grid = new THREE.GridHelper(13, 13, 0x1e293b, 0x0f172a)
  grid.position.y = 0.01
  sceneGroup.add(grid)

  // 回路寸法設定
  const leftX = -3.2
  const rightX = 3.2
  const topZ = -2.2
  const botZ = 2.2
  const wireR = 0.06

  const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })

  function addWire(p1, p2) {
    const v1 = new THREE.Vector3(...p1)
    const v2 = new THREE.Vector3(...p2)
    const len = v1.distanceTo(v2)
    const geo = new THREE.CylinderGeometry(wireR, wireR, len, 12)
    geo.translate(0, len / 2, 0)
    geo.rotateX(Math.PI / 2)
    const mesh = new THREE.Mesh(geo, wireMat)
    mesh.position.copy(v1)
    mesh.lookAt(v2)
    sceneGroup.add(mesh)
  }

  // 配線構築
  addWire([leftX, 0.1, topZ], [rightX, 0.1, topZ])
  addWire([leftX, 0.1, botZ], [rightX, 0.1, botZ])
  // 左辺: コンデンサー接続
  addWire([leftX, 0.1, topZ], [leftX, 0.1, -0.6])
  addWire([leftX, 0.1, 0.6], [leftX, 0.1, botZ])
  // 右辺: コイル接続
  addWire([rightX, 0.1, topZ], [rightX, 0.1, -1.0])
  addWire([rightX, 0.1, 1.0], [rightX, 0.1, botZ])

  // 2. 左側: 3D コンデンサー (Capacitor C)
  const capGroup = new THREE.Group()
  capGroup.position.set(leftX, 0.6, 0)

  // 2枚の電極極板 (z方向に対向)
  const plateGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32)
  plateGeo.rotateX(Math.PI / 2)
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 })

  capPlateTop = new THREE.Mesh(plateGeo, plateMat)
  capPlateTop.position.set(0, 0, -0.6)
  capPlateBot = new THREE.Mesh(plateGeo, plateMat)
  capPlateBot.position.set(0, 0, 0.6)
  capGroup.add(capPlateTop)
  capGroup.add(capPlateBot)

  // 極板電荷粒子群 (±Q)
  chargeParticlesGroup = new THREE.Group()
  const qSphereGeo = new THREE.SphereGeometry(0.06, 8, 8)
  const qPosMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
  const qNegMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2
    const r = 0.35 + (i % 2) * 0.35
    // Top (+Q)
    const p1 = new THREE.Mesh(qSphereGeo, qPosMat)
    p1.position.set(Math.cos(angle) * r, Math.sin(angle) * r, -0.52)
    // Bot (-Q)
    const p2 = new THREE.Mesh(qSphereGeo, qNegMat)
    p2.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.52)
    chargeParticlesGroup.add(p1, p2)
  }
  capGroup.add(chargeParticlesGroup)

  // 極板間電場ベクトル矢印群
  eFieldLinesGroup = new THREE.Group()
  for (let fx = -0.5; fx <= 0.5; fx += 0.5) {
    for (let fy = -0.5; fy <= 0.5; fy += 0.5) {
      const arr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.04, headRadius: 0.12, headLength: 0.3 })
      arr.position.set(fx, fy, -0.5)
      arr.setVector(new THREE.Vector3(fx, fy, -0.5), new THREE.Vector3(0, 0, 1), 1.0)
      eFieldLinesGroup.add(arr)
    }
  }
  capGroup.add(eFieldLinesGroup)

  const capLabel = createTextSprite(`コンデンサー C (${C_uF.value}μF)`, { color: '#38bdf8', fontSize: 30, scale: 0.46 })
  capLabel.position.set(0, 1.6, 0)
  capGroup.add(capLabel)

  sceneGroup.add(capGroup)

  // 3. 右側: 3D インダクター (Coil L)
  const coilGroup = new THREE.Group()
  coilGroup.position.set(rightX, 0.6, 0)

  // コイルらせん管 (TubeGeometry)
  const cTurns = 10
  const cPts = []
  for (let i = 0; i <= cTurns * 28; i++) {
    const t = i / (cTurns * 28)
    const z = (t - 0.5) * 2.0
    const ang = t * Math.PI * 2 * cTurns
    const x = Math.sin(ang) * 0.75
    const y = Math.cos(ang) * 0.75
    cPts.push(new THREE.Vector3(x, y, z))
  }
  const cCurve = new THREE.CatmullRomCurve3(cPts)
  const cTubeGeo = new THREE.TubeGeometry(cCurve, 160, 0.08, 8, false)
  const cTubeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0x78350f,
    emissiveIntensity: 0.25
  })
  coilTubeMesh = new THREE.Mesh(cTubeGeo, cTubeMat)
  coilGroup.add(coilTubeMesh)

  // コイル内部の磁力線矢印群
  bFieldLinesGroup = new THREE.Group()
  for (let bx = -0.25; bx <= 0.25; bx += 0.25) {
    for (let by = -0.25; by <= 0.25; by += 0.25) {
      const arr = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.35 })
      arr.setVector(new THREE.Vector3(bx, by, -0.9), new THREE.Vector3(0, 0, 1), 1.8)
      bFieldLinesGroup.add(arr)
    }
  }
  coilGroup.add(bFieldLinesGroup)

  const coilLabel = createTextSprite(`インダクター L (${L_mH.value}mH)`, { color: '#fbbf24', fontSize: 30, scale: 0.46 })
  coilLabel.position.set(0, 1.6, 0)
  coilGroup.add(coilLabel)

  sceneGroup.add(coilGroup)

  // 4. 中央手前: 3D エネルギー保存タワーゲージ (UE + UB = Const)
  const gaugeGroup = new THREE.Group()
  gaugeGroup.position.set(0, 0.0, 1.8)

  const gBase = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.15, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b }))
  gaugeGroup.add(gBase)

  // 静電エネルギー棒 (青/水色)
  const barEGeo = new THREE.CylinderGeometry(0.38, 0.38, 1, 24)
  barEGeo.translate(0, 0.5, 0)
  const barEMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
  gaugeBarE = new THREE.Mesh(barEGeo, barEMat)
  gaugeGroup.add(gaugeBarE)

  // 磁気エネルギー棒 (黄色/橙色)
  const barBGeo = new THREE.CylinderGeometry(0.38, 0.38, 1, 24)
  barBGeo.translate(0, 0.5, 0)
  const barBMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.5 })
  gaugeBarB = new THREE.Mesh(barBGeo, barBMat)
  gaugeGroup.add(gaugeBarB)

  gaugeLabel = createTextSprite('全エネルギー保存 E = UE + UB', { color: '#10b981', fontSize: 26, scale: 0.42 })
  gaugeLabel.position.set(0, 1.7, 0)
  gaugeGroup.add(gaugeLabel)

  sceneGroup.add(gaugeGroup)

  // 5. 往復電子キャリア粒子
  const numE = 20
  const eGeo = new THREE.SphereGeometry(0.08, 10, 10)
  const eMat = new THREE.MeshBasicMaterial({ color: 0xc084fc })
  electronInstMesh = new THREE.InstancedMesh(eGeo, eMat, numE)
  sceneGroup.add(electronInstMesh)

  // 6. 奥側: 3D オシロスコープ波形ボード (Q(t), I(t) グラフ)
  waveCanvas = document.createElement('canvas')
  waveCanvas.width = 512
  waveCanvas.height = 256
  waveCtx = waveCanvas.getContext('2d')

  waveTexture = new THREE.CanvasTexture(waveCanvas)
  waveTexture.minFilter = THREE.LinearFilter
  waveTexture.magFilter = THREE.LinearFilter

  const boardGeo = new THREE.PlaneGeometry(6.4, 3.2)
  const boardMat = new THREE.MeshBasicMaterial({
    map: waveTexture,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide
  })
  const waveMesh = new THREE.Mesh(boardGeo, boardMat)
  waveMesh.position.set(0, 2.2, -4.5)
  waveMesh.rotation.x = 0.16
  sceneGroup.add(waveMesh)
}

// ----------------------------------------------------
// 物理演算と 3D 更新ループ
// ----------------------------------------------------
let electronFlowOffset = 0

function updateSimulation(dt) {
  if (isRunning.value) {
    simTime += dt * visualOmega.value * timeScale.value
  }

  const phi = simTime
  updateStateFromPhase(phi)

  const cosP = Math.cos(phi)
  const sinP = Math.sin(phi)

  // 1. コンデンサー極板電場と電荷の更新
  if (eFieldLinesGroup) {
    const efInt = Math.abs(cosP)
    const efDir = cosP >= 0 ? 1 : -1
    eFieldLinesGroup.children.forEach((arr) => {
      const orig = arr.position.clone()
      arr.setVector(orig, new THREE.Vector3(0, 0, efDir), Math.max(0.05, efInt * 1.0))
      arr.visible = efInt > 0.08
    })
  }

  if (chargeParticlesGroup) {
    chargeParticlesGroup.children.forEach((p, idx) => {
      // cosP に応じて色反転 & 透明度変化
      const isTop = idx % 2 === 0
      const isPos = isTop ? cosP >= 0 : cosP < 0
      p.material.color.setHex(isPos ? 0xef4444 : 0x38bdf8)
      p.scale.setScalar(Math.max(0.2, Math.abs(cosP)))
    })
  }

  // 2. コイル磁束の更新
  if (bFieldLinesGroup) {
    const bfInt = Math.abs(sinP)
    const bfDir = sinP >= 0 ? 1 : -1
    bFieldLinesGroup.children.forEach((arr) => {
      const bx = arr.position.x
      const by = arr.position.y
      arr.setVector(new THREE.Vector3(bx, by, -0.9 * bfDir), new THREE.Vector3(0, 0, bfDir), Math.max(0.05, bfInt * 1.8))
      arr.visible = bfInt > 0.08
    })
  }

  // 3. 3D エネルギー保存タワーの更新
  if (gaugeBarE && gaugeBarB) {
    const totalHeight = 2.2
    const hE = Math.max(0.02, (UE.value / (totalE.value || 1)) * totalHeight)
    const hB = Math.max(0.02, (UB.value / (totalE.value || 1)) * totalHeight)

    gaugeBarE.scale.set(1, hE, 1)
    gaugeBarE.position.y = 0.1

    gaugeBarB.scale.set(1, hB, 1)
    gaugeBarB.position.y = 0.1 + hE
  }

  // 4. 電子キャリア往復アニメーション
  if (electronInstMesh) {
    electronFlowOffset += dt * sinP * 3.5 * timeScale.value
    const leftX = -3.8, rightX = 3.8, topZ = -2.2, botZ = 2.2
    const w = rightX - leftX
    const h = botZ - topZ
    const perim = w * 2 + h * 2

    const dummy = new THREE.Object3D()
    for (let i = 0; i < 20; i++) {
      const prog = ((i / 20 + electronFlowOffset * 0.1) % 1 + 1) % 1
      const s = prog * perim
      let px = leftX, pz = botZ

      if (s < w) {
        px = leftX + s
        pz = botZ
      } else if (s < w + h) {
        px = rightX
        pz = botZ - (s - w)
      } else if (s < w * 2 + h) {
        px = rightX - (s - (w + h))
        pz = topZ
      } else {
        px = leftX
        pz = topZ + (s - (w * 2 + h))
      }

      dummy.position.set(px, 0.18, pz)
      dummy.updateMatrix()
      electronInstMesh.setMatrixAt(i, dummy.matrix)
    }
    electronInstMesh.instanceMatrix.needsUpdate = true
  }

  // 5. 波形更新
  updateWaveTexture()
}

function updateWaveTexture() {
  if (!waveCtx || !waveTexture) return

  waveHistory.push({
    q: currentQ.value / (Q_max.value || 1),
    i: currentI.value / (I_max.value || 1)
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
    ctx.moveTo(x, 0); ctx.lineTo(x, h)
  }
  for (let y = 0; y <= h; y += 40) {
    ctx.moveTo(0, y); ctx.lineTo(w, y)
  }
  ctx.stroke()

  // ゼロ基準線
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, h / 2)
  ctx.lineTo(w, h / 2)
  ctx.stroke()

  // タイトルと凡例
  ctx.font = 'bold 15px sans-serif'
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('電荷 Q(t) = Q₀ cos(ωt) (水色)', 16, 26)
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('電流 I(t) = I₀ sin(ωt) (黄色)', 270, 26)

  if (waveHistory.length < 2) {
    waveTexture.needsUpdate = true
    return
  }

  // 1. Q(t) 曲線 (水色)
  ctx.beginPath()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  const step = w / 200
  for (let idx = 0; idx < waveHistory.length; idx++) {
    const x = idx * step
    const y = h / 2 - waveHistory[idx].q * 80
    if (idx === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 2. I(t) 曲線 (黄色)
  ctx.beginPath()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.5
  for (let idx = 0; idx < waveHistory.length; idx++) {
    const x = idx * step
    const y = h / 2 - waveHistory[idx].i * 80
    if (idx === 0) ctx.moveTo(x, y)
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
    initialCamPos: [0, 8.5, 12.8],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame: (dt) => {
      updateSimulation(dt)
    }
  })

  build3DScene()
  updateStateFromPhase(0)
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

.energy-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 14px;
}

.energy-header {
  font-size: 0.86rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 8px;
}

.energy-bar {
  display: flex;
  height: 14px;
  background: #0f172a;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

.bar-segment.cap {
  background: #38bdf8;
  transition: width 0.05s linear;
}

.bar-segment.coil {
  background: #fbbf24;
  transition: width 0.05s linear;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.76rem;
  color: #cbd5e1;
  flex-wrap: wrap;
}

.legend-row .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot.cap {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
}

.dot.coil {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fbbf24;
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
