<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#f59e0b">
    <div class="lab-head">
      <span class="lab-title">🧲 3D ベータトロン誘導加速器（ファラデー電磁誘導 × 2:1の法則）</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge" :style="{ '--ac': isStable ? '#10b981' : '#f43f5e' }">
          {{ isStable ? '安定加速中 (2:1条件適合)' : '軌道崩壊 (管壁衝突)' }}
        </span>
      </div>
    </div>

    <p class="lab-desc">
      電磁石の中心コア磁束の増大によって生じる円周方向の誘導電場 <i>E</i> による電子の相対論的加速と、軌道半径 <i>R</i> を一定に保つための「2対1の法則（ΔΦ = 2π<i>R</i><sup>2</sup> Δ<i>B</i><sub>0</sub> ⇔ <i>B̄</i> = 2<i>B</i><sub>0</sub>）」を、3Dテーパー磁極とドーナツ型真空加速管で体感します。
    </p>

    <!-- カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 磁極断面
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上軌道
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
        {{ isPlaying ? '⏸ 一時停止' : '▶ 加速再開' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim" style="padding: 5px 12px; font-size: 0.82rem;">
        ⏭ コマ送り
      </button>
      <button class="lab-btn" @click="resetSim" style="padding: 5px 12px; font-size: 0.82rem;">
        ⏮ 最初から加速
      </button>
      <button class="lab-btn lab-btn-pri" @click="setIdealRatio" style="margin-left:auto; background:#0284c7; border-color:#38bdf8;">
        🎯 理想の 2:1 条件 (B̄ = 2B₀) に合わせる
      </button>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          ドーナツ真空管 (ガラス)
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          円周方向 誘導電場 E
        </span>
        <span class="legend-item">
          <i style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
          相対論的電子 e⁻
        </span>
        <span class="legend-item">
          <i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
          設計安定軌道 R₀
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: isStable ? '#10b981' : '#f43f5e', color: '#f8fafc' }">
        ベータトロン条件: ΔΦ = 2π<i>R</i>² Δ<i>B</i><sub>0</sub> ｜ 磁場比 <i>B̄</i> / <i>B</i><sub>0</sub> = {{ fieldProfileRatio.toFixed(2) }} (理想: 2.00) ｜
        電子速さ <i>v</i> = {{ (electronVelocity / 1e6).toFixed(1) }} ×10⁶ m/s (β = {{ beta.toFixed(3) }}) ｜ 状態: {{ statusMsg }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>磁場上昇率 (d<i>B</i>/d<i>t</i>): <strong>{{ dBdt.toFixed(1) }} T/s</strong></label>
        <input type="range" v-model.number="dBdt" min="0.5" max="4.0" step="0.5" />
        <div class="lab-note">中心磁束の変化率が大きいほど強い円周方向誘導電場 <i>E</i> = (<i>R</i>/2)(d<i>B̄</i>/d<i>t</i>) が生じます</div>
      </div>

      <div class="lab-ctrl">
        <label>磁場プロファイル比 <i>B̄</i> / <i>B</i><sub>0</sub>: <strong>{{ fieldProfileRatio.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="fieldProfileRatio" min="1.4" max="2.6" step="0.05" />
        <div class="lab-note">
          2.00 より大きいと中心加速が勝って外壁衝突、2.00 より小さいと軌道磁場が勝って内壁衝突します
        </div>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">電子の速度 <i>v</i></div>
        <div class="v" style="color:#f43f5e">{{ (electronVelocity / 1e6).toFixed(1) }} <small>×10⁶ m/s</small></div>
        <div class="f">光速比 β = v/c = {{ beta.toFixed(3) }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">相対論的運動エネルギー <i>K</i></div>
        <div class="v" style="color:#fbbf24">{{ kineticEnergyMeV.toFixed(3) }} <small>MeV</small></div>
        <div class="f">ローレンツ因子 γ = {{ gammaFactor.toFixed(3) }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">誘導電場 <i>E</i></div>
        <div class="v" style="color:#38bdf8">{{ inducedEField.toFixed(1) }} <small>V/m</small></div>
        <div class="f"><i>E</i> = (<i>R</i> / 2) (d<i>B̄</i>/d<i>t</i>)</div>
      </div>

      <div class="lab-stat">
        <div class="k">軌道上磁場 <i>B</i><sub>0</sub></div>
        <div class="v" style="color:#10b981">{{ bZero.toFixed(2) }} <small>T</small></div>
        <div class="f">向心ローレンツ力を供給</div>
      </div>

      <div class="lab-stat">
        <div class="k">中心平均磁場 <i>B̄</i></div>
        <div class="v" style="color:#a855f7">{{ bAvg.toFixed(2) }} <small>T</small></div>
        <div class="f">Φ = π <i>R</i>² <i>B̄</i> (中心高密度磁束)</div>
      </div>

      <div class="lab-stat">
        <div class="k">軌道半径 <i>r</i> / <i>R</i><sub>0</sub></div>
        <div class="v" :style="{ color: isStable ? '#10b981' : '#f43f5e' }">
          {{ (currentRadius / R0_base * 100).toFixed(1) }} <small>%</small>
        </div>
        <div class="f">設計半径 <i>R</i><sub>0</sub> = 3.2 m 相当</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(0.5)

// 物理パラメータ
const dBdt = ref(2.0) // T/s
const fieldProfileRatio = ref(2.0) // B_bar / B0 (理想は 2.00)
const R0_base = 3.2 // 3D設計軌道半径

// 電子の状態
const currentRadius = ref(3.2)
const electronAngle = ref(0)
const bZero = ref(0.25)
const isStable = ref(true)
const statusMsg = ref('安定加速中 (2:1条件適合)')

// 相対論的定数
const c = 2.99792e8 // m/s
const m0 = 9.10938e-31 // kg
const eCharge = 1.60218e-19 // C
let electronP = 1.602e-22 // 相対論的運動量 [kg m/s]

// 計算プロパティ
const bAvg = computed(() => bZero.value * fieldProfileRatio.value)

// 誘導電場 E = (R / 2) * (dB_bar / dt)
const inducedEField = computed(() => (R0_base * 0.5 * dBdt.value * fieldProfileRatio.value * 25))

// 相対論的速度 v = p / sqrt(m0^2 + (p/c)^2)
const electronVelocity = computed(() => {
  const p = electronP
  return p / Math.sqrt(m0 * m0 + (p / c) ** 2)
})

const beta = computed(() => electronVelocity.value / c)
const gammaFactor = computed(() => (beta.value < 0.9999 ? 1 / Math.sqrt(1 - beta.value ** 2) : 99))
const kineticEnergyMeV = computed(() => ((gammaFactor.value - 1) * m0 * (c ** 2)) / (1.602e-13))

function setIdealRatio() {
  fieldProfileRatio.value = 2.0
  isStable.value = true
  statusMsg.value = '理想軌道で安定加速中 (B̄ = 2B₀)'
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function resetSim() {
  currentRadius.value = R0_base
  electronAngle.value = 0
  bZero.value = 0.25
  electronP = 1.602e-22
  isStable.value = true
  statusMsg.value = '初期状態から加速開始'
  momentumHistory.length = 0
}

function stepSim() {
  updatePhysics(0.04)
}

function setCameraPreset(preset, dur = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return

  const isNarrow = (threeCtx.camera?.aspect || 1.7) < 1.35
  const mult = isNarrow ? 1.35 : 1.0

  if (nBadge && sBadge) {
    if (preset === 'top') {
      nBadge.visible = false
      sBadge.visible = false
    } else {
      nBadge.visible = true
      sBadge.visible = true
    }
  }

  if (preset === '3d') {
    threeCtx.moveCameraTo([0, 9.5 * mult, 14.5 * mult], [0, 0, 0], dur, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 0.8, 30 * mult], [0, 0, 0], dur, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 32 * mult, 0.01], [0, 0, 0], dur, 14)
  }
}

// ----------------------------------------------------
// 3D シーン構成
// ----------------------------------------------------
const threeContainer = ref(null)
let threeCtx = null
let sceneGroup = null

// 電磁石磁極と真空管
let upperPoleMesh = null
let lowerPoleMesh = null
let centerCoreMesh = null
let torusTubeMesh = null
let coreFluxLinesGroup = null
let eFieldArrowsGroup = null
let nBadge = null
let sBadge = null

// 電子球と発光トレイル
let electronMesh = null
let electronLight = null
let electronTrail = null
const trailPoints = []

// 運動量・速度グラフボード
let plotCanvas = null
let plotTexture = null
let plotCtx = null
const momentumHistory = []

function build3DScene() {
  if (!threeCtx) return
  if (sceneGroup) threeCtx.scene.remove(sceneGroup)

  sceneGroup = new THREE.Group()
  threeCtx.scene.add(sceneGroup)

  // 1. 基板グリッド
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.y = -2.4
  sceneGroup.add(grid)

  // 2. 電磁石の上下テーパー磁極 (Tapered Electromagnet Poles)
  // 磁場分布 B(r) ∝ r^-n を作るため外周に向かってギャップが広がるテーパー形状
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.35
  })

  // 上部磁極 (Upper Pole N)
  const upperPoleGeo = new THREE.CylinderGeometry(2.0, 4.4, 1.4, 36)
  upperPoleMesh = new THREE.Mesh(upperPoleGeo, poleMat)
  upperPoleMesh.position.set(0, 1.8, 0)
  sceneGroup.add(upperPoleMesh)

  nBadge = createTextSprite('電磁石 N極 (上部磁極)', { color: '#f43f5e', fontSize: 28, scale: 0.42 })
  nBadge.position.set(0, 2.1, 0)
  sceneGroup.add(nBadge)

  // 下部磁極 (Lower Pole S)
  const lowerPoleGeo = new THREE.CylinderGeometry(4.4, 2.0, 1.4, 36)
  lowerPoleMesh = new THREE.Mesh(lowerPoleGeo, poleMat)
  lowerPoleMesh.position.set(0, -1.8, 0)
  sceneGroup.add(lowerPoleMesh)

  sBadge = createTextSprite('電磁石 S極 (下部磁極)', { color: '#38bdf8', fontSize: 28, scale: 0.42 })
  sBadge.position.set(0, -2.1, 0)
  sceneGroup.add(sBadge)

  // 中心高密度磁極コア (Central High-Flux Core)
  const coreGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.2, 32)
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.4
  })
  centerCoreMesh = new THREE.Mesh(coreGeo, coreMat)
  sceneGroup.add(centerCoreMesh)

  const coreLabel = createTextSprite('中心磁極コア (平均磁束密度 B̄)', { color: '#38bdf8', fontSize: 26, scale: 0.38 })
  coreLabel.position.set(0, 0.4, 0)
  sceneGroup.add(coreLabel)

  // 中心コア磁束ライン群 (Vertical Core Flux Lines)
  coreFluxLinesGroup = new THREE.Group()
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2
    const cr = 0.4 + (i % 3) * 0.45
    const cx = Math.cos(ang) * cr
    const cz = Math.sin(ang) * cr
    const arr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.04, headRadius: 0.12, headLength: 0.3 })
    arr.setVector(new THREE.Vector3(cx, -1.0, cz), new THREE.Vector3(0, 1, 0), 2.0)
    coreFluxLinesGroup.add(arr)
  }
  sceneGroup.add(coreFluxLinesGroup)

  // 3. ドーナツ型真空加速管 (Toroidal Vacuum Chamber)
  const torusGeo = new THREE.TorusGeometry(R0_base, 0.65, 32, 64)
  torusGeo.rotateX(Math.PI / 2)
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    transmission: 0.85,
    side: THREE.DoubleSide
  })
  torusTubeMesh = new THREE.Mesh(torusGeo, torusMat)
  sceneGroup.add(torusTubeMesh)

  // 設計軌道ライン (Radius R0 Ring)
  const orbitCurvePts = []
  for (let i = 0; i <= 64; i++) {
    const ang = (i / 64) * Math.PI * 2
    orbitCurvePts.push(new THREE.Vector3(Math.cos(ang) * R0_base, 0, Math.sin(ang) * R0_base))
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitCurvePts)
  const orbitLine = new THREE.Line(orbitGeo, new THREE.LineDashedMaterial({ color: 0x10b981, dashSize: 0.3, gapSize: 0.15 }))
  orbitLine.computeLineDistances()
  sceneGroup.add(orbitLine)

  const orbitLabel = createTextSprite('設計安定軌道 R₀', { color: '#10b981', fontSize: 26, scale: 0.38 })
  orbitLabel.position.set(R0_base + 0.9, 0, 0)
  sceneGroup.add(orbitLabel)

  // 4. 円周方向 誘導電場 E ベクトル矢印群 (Azimuthal Electric Field)
  eFieldArrowsGroup = new THREE.Group()
  const numE = 8
  for (let i = 0; i < numE; i++) {
    const ang = (i / numE) * Math.PI * 2
    const ax = Math.cos(ang) * R0_base
    const az = Math.sin(ang) * R0_base
    const tangX = -Math.sin(ang)
    const tangZ = Math.cos(ang)
    const arr = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.35 })
    arr.setVector(new THREE.Vector3(ax, 0, az), new THREE.Vector3(tangX, 0, tangZ), 1.2)
    eFieldArrowsGroup.add(arr)
  }
  sceneGroup.add(eFieldArrowsGroup)

  // 5. 電子粒子 e⁻
  const eleGeo = new THREE.SphereGeometry(0.16, 16, 16)
  const eleMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.8
  })
  electronMesh = new THREE.Mesh(eleGeo, eleMat)
  sceneGroup.add(electronMesh)

  electronLight = new THREE.PointLight(0xf43f5e, 2, 3)
  sceneGroup.add(electronLight)

  // 電子の発光軌跡 (Trail)
  const trailGeo = new THREE.BufferGeometry()
  const trailMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.7 })
  electronTrail = new THREE.Line(trailGeo, trailMat)
  sceneGroup.add(electronTrail)

  // 6. 奥側: 3D 相対論的速度・運動量プロットボード
  plotCanvas = document.createElement('canvas')
  plotCanvas.width = 512
  plotCanvas.height = 256
  plotCtx = plotCanvas.getContext('2d')

  plotTexture = new THREE.CanvasTexture(plotCanvas)
  plotTexture.minFilter = THREE.LinearFilter
  plotTexture.magFilter = THREE.LinearFilter

  const plotPlaneGeo = new THREE.PlaneGeometry(6.4, 3.2)
  const plotPlaneMat = new THREE.MeshBasicMaterial({
    map: plotTexture,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide
  })
  const plotBoard = new THREE.Mesh(plotPlaneGeo, plotPlaneMat)
  plotBoard.position.set(0, 2.4, -4.5)
  plotBoard.rotation.x = 0.16
  sceneGroup.add(plotBoard)
}

// ----------------------------------------------------
// 物理シミュレーションと 3D 更新ループ
// ----------------------------------------------------
function updatePhysics(dt) {
  if (!isPlaying.value) return

  const effectiveDt = dt * timeScale.value
  const R0 = R0_base
  const ratio = fieldProfileRatio.value

  // 磁場の上昇
  bZero.value += dBdt.value * effectiveDt * 0.04

  // 接線加速: dp/dt = e * E = e * (R/2) * (dB_bar/dt)
  const dp = eCharge * (R0 * 0.5) * (dBdt.value * ratio) * effectiveDt * 3e11
  electronP += dp

  // 軌道安定性の検証:
  // p = e * r * B0  =>  r = p / (e * B0)
  // もし ratio == 2.00 なら dp/dt と e*R0*dB0/dt が釣り合い r = R0 が厳密に維持される
  const idealRatio = 2.0
  const driftRate = (ratio - idealRatio) * 0.35 * beta.value * effectiveDt
  currentRadius.value += driftRate

  // ドーナツ真空管壁との衝突判定 (チューブ半径 0.65)
  const innerWall = R0 - 0.6
  const outerWall = R0 + 0.6

  if (currentRadius.value < innerWall) {
    isStable.value = false
    statusMsg.value = '内壁に衝突！ (加速不足 / 軌道縮小)'
  } else if (currentRadius.value > outerWall) {
    isStable.value = false
    statusMsg.value = '外壁に衝突！ (加速過剰 / 軌道拡大)'
  } else {
    isStable.value = true
    if (Math.abs(ratio - 2.0) < 0.05) {
      statusMsg.value = '理想軌道で安定加速中 (B̄ = 2B₀)'
    } else {
      statusMsg.value = '軌道ドリフト中 (壁面接近)'
    }
  }

  // 電子の回転角速度更新
  const omegaSim = (electronVelocity.value / (currentRadius.value * 1e8)) * 3.5
  electronAngle.value += omegaSim * effectiveDt

  // 電子メッシュ位置同期
  const curR = Math.max(1.0, currentRadius.value)
  const ex = Math.cos(electronAngle.value) * curR
  const ez = Math.sin(electronAngle.value) * curR

  if (electronMesh) {
    electronMesh.position.set(ex, 0, ez)
    electronLight.position.set(ex, 0, ez)
  }

  // 軌跡更新
  trailPoints.push(new THREE.Vector3(ex, 0, ez))
  if (trailPoints.length > 50) trailPoints.shift()
  if (electronTrail) {
    electronTrail.geometry.setFromPoints(trailPoints)
  }

  // 中心コア磁束ラインの伸縮
  if (coreFluxLinesGroup) {
    const scale = Math.min(2.5, bAvg.value * 2.0)
    coreFluxLinesGroup.scale.set(1, scale, 1)
  }

  // プロットボード更新
  updatePlotTexture()
}

function updatePlotTexture() {
  if (!plotCtx || !plotTexture) return

  momentumHistory.push({
    beta: beta.value,
    k: kineticEnergyMeV.value
  })
  if (momentumHistory.length > 200) momentumHistory.shift()

  const ctx = plotCtx
  const w = plotCanvas.width
  const h = plotCanvas.height

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

  // 光速限界線 β = 1.0 (赤点線)
  const cLineY = 50
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(40, cLineY)
  ctx.lineTo(w - 20, cLineY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.font = 'bold 15px sans-serif'
  ctx.fillStyle = '#f43f5e'
  ctx.fillText('光速限界 β = v/c → 1.0', 50, 42)
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('運動エネルギー K [MeV]', 270, 42)

  if (momentumHistory.length < 2) {
    plotTexture.needsUpdate = true
    return
  }

  // 1. 速度比 β(t) 曲線 (赤)
  ctx.beginPath()
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 2.5
  const step = (w - 60) / 200
  const yBase = h - 30
  for (let idx = 0; idx < momentumHistory.length; idx++) {
    const x = 40 + idx * step
    const y = yBase - momentumHistory[idx].beta * (yBase - cLineY)
    if (idx === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 2. 運動エネルギー K(t) 曲線 (黄色)
  ctx.beginPath()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.2
  const maxK = 15 // MeV
  for (let idx = 0; idx < momentumHistory.length; idx++) {
    const x = 40 + idx * step
    const y = yBase - (momentumHistory[idx].k / maxK) * (yBase - 50)
    if (idx === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  plotTexture.needsUpdate = true
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
      updatePhysics(dt)
    }
  })

  build3DScene()
  resetSim()
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
