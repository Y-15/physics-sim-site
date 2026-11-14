<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔋</span>
        <h3 class="sim-title">3D 平行平板コンデンサー &amp; 誘電体・静電エネルギー</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan"><i>Q</i> = <i>C</i><i>V</i></span>
        <span class="badge badge-purple"><i>C</i> = ε<sub>r</sub>ε<sub>0</sub> <i>S</i> / <i>d</i></span>
        <span class="badge badge-amber"><i>U</i> = ½<i>Q</i><i>V</i> = ½<i>C</i><i>V</i><sup>2</sup></span>
      </div>
    </div>

    <p class="desc">
      金属極板の面積 <i>S</i>、極板間隔 <i>d</i>、誘電体（比誘電率 ε<sub>r</sub> = 3.0）の挿入をリアルタイムに操作。
      電源接続中（<i>V</i> 一定）とスイッチOFF（<i>Q</i> 保存・孤立）での電荷再配置、極板間電場 <b>E</b>、端効果フリンジ電場、誘電分極電荷、3D静電エネルギーゲージを直感的に検証できます。
    </p>

    <!-- 電源接続 / スイッチOFF タブ -->
    <div class="mode-tabs">
      <button :class="{ active: isConnected }" @click="setConnected(true)">
        ⚡ 電源接続中 (電圧 <i>V</i> = {{ batteryV }} V 一定)
      </button>
      <button :class="{ active: !isConnected }" @click="setConnected(false)">
        🔓 スイッチOFF (電荷 <i>Q</i> 保存・孤立系)
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

    <!-- アニメーション再生 & 典型実験プリセットバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="action-btn-group">
        <button class="btn btn-chip" @click="presetDisconnectAndPull">
          ① 充電後に極板を引き離す (d拡大)
        </button>
        <button class="btn btn-chip" @click="presetInsertDielectric">
          ② 電源ONのまま誘電体挿入
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 初期状態
        </button>
      </div>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" style="background:#fb7185;box-shadow:0 0 6px #fb7185"></i>
            上極板 (+Q 自由電荷)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            下極板 (−Q 自由電荷)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#06b6d4;box-shadow:0 0 6px #06b6d4"></i>
            誘電体 (分極電荷 ±qp)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#a855f7;box-shadow:0 0 6px #a855f7"></i>
            電場 E &amp; 端効果
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
            静電エネルギー U ゲージ
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ 左ドラッグで3D回転 ・ 右ドラッグで移動 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータスバー -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="isConnected ? 'conn' : 'isol'">
        {{ isConnected ? `⚡ 電源接続中: 極板間電圧は常に V₀ = ${batteryV} V に固定。d や誘電体を変えると電荷 Q が流入/流出` : `🔓 スイッチOFF孤立系: 電荷 Q = ${curCharge_nC.toFixed(2)} nC が完全保存。d を広げると電圧 V と静電エネルギー U が急増！` }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <div class="controls-grid">
        <!-- 極板間隔 d -->
        <div class="control-group">
          <label>
            <span>極板間隔 <i>d</i>:</span>
            <strong style="color:#38bdf8">{{ distD_mm.toFixed(1) }} mm</strong>
          </label>
          <input type="range" v-model.number="distD_mm" min="1.0" max="6.0" step="0.2" />
          <div class="quick-chips">
            <button class="mini-chip" @click="distD_mm = 1.5">狭小 1.5mm</button>
            <button class="mini-chip" @click="distD_mm = 3.0">標準 3.0mm</button>
            <button class="mini-chip" @click="distD_mm = 5.5">広角 5.5mm</button>
          </div>
          <span class="sub-info">間隔 <i>d</i> を広げると容量 <i>C</i> 減少</span>
        </div>

        <!-- 極板面積 S -->
        <div class="control-group">
          <label>
            <span>極板面積 <i>S</i>:</span>
            <strong style="color:#fbbf24">{{ areaS_cm2.toFixed(0) }} cm²</strong>
          </label>
          <input type="range" v-model.number="areaS_cm2" min="50" max="250" step="10" />
          <div class="quick-chips">
            <button class="mini-chip" @click="areaS_cm2 = 80">小 80cm²</button>
            <button class="mini-chip" @click="areaS_cm2 = 140">中 140cm²</button>
            <button class="mini-chip" @click="areaS_cm2 = 220">大 220cm²</button>
          </div>
          <span class="sub-info">面積 <i>S</i> が広いほど容量 <i>C</i> 増加</span>
        </div>

        <!-- 誘電体の挿入率 -->
        <div class="control-group">
          <label>
            <span>誘電体挿入率 (ε<sub>r</sub> = {{ epsR }}):</span>
            <strong style="color:#06b6d4">{{ (dielectricRatio * 100).toFixed(0) }} %</strong>
          </label>
          <input type="range" v-model.number="dielectricRatio" min="0.0" max="1.0" step="0.05" />
          <div class="quick-chips">
            <button class="mini-chip" @click="dielectricRatio = 0.0">空気 (0%)</button>
            <button class="mini-chip" @click="dielectricRatio = 0.5">半分 (50%)</button>
            <button class="mini-chip" @click="dielectricRatio = 1.0">全挿入 (100%)</button>
          </div>
          <span class="sub-info">誘電分極により内部の電界が緩和され容量増大</span>
        </div>

        <!-- 電源電圧 V0 -->
        <div class="control-group" :style="{ opacity: isConnected ? 1 : 0.45 }">
          <label>
            <span>電源電圧 <i>V</i><sub>0</sub>:</span>
            <strong style="color:#f43f5e">{{ batteryV }} V</strong>
          </label>
          <input type="range" v-model.number="batteryV" min="10" max="100" step="5" :disabled="!isConnected" />
          <span class="sub-info">{{ isConnected ? '電源による印加電位差' : '（スイッチOFF中は無効）' }}</span>
        </div>
      </div>

      <!-- 表示オプション -->
      <div class="options-row">
        <span class="opt-label">👁️ 3D表示切替:</span>
        <label class="check-label">
          <input type="checkbox" v-model="showFieldVectors" />
          極板間電場ベクトル <b>E</b>
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showFringeLines" />
          端効果フリンジ電気力線
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showPolarizationCharges" />
          誘電分極電荷 ±<i>q</i><sub>p</sub>
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showEnergyGauge" />
          3D 静電エネルギーゲージ
        </label>
      </div>
    </div>

    <!-- 物理量統計パネル -->
    <div class="stats-panel">
      <div class="stat-card hl">
        <div class="label">電気容量 <i>C</i></div>
        <div class="val" style="color:#38bdf8">{{ capC_pF.toFixed(1) }} <small>pF</small></div>
        <div class="sub"><i>C</i> = ε · <i>S</i> / <i>d</i></div>
      </div>

      <div class="stat-card">
        <div class="label">極板間電圧 <i>V</i></div>
        <div class="val" style="color:#f59e0b">{{ curVoltage.toFixed(1) }} <small>V</small></div>
        <div class="sub">{{ isConnected ? '電源により固定' : 'V = Q / C (変動)' }}</div>
      </div>

      <div class="stat-card">
        <div class="label">蓄積電荷 <i>Q</i></div>
        <div class="val" style="color:#fb7185">{{ curCharge_nC.toFixed(2) }} <small>nC</small></div>
        <div class="sub">{{ isConnected ? 'Q = C V (出入り)' : '孤立のため完全保存' }}</div>
      </div>

      <div class="stat-card">
        <div class="label">静電エネルギー <i>U</i></div>
        <div class="val" style="color:#10b981">{{ curEnergy_nJ.toFixed(2) }} <small>nJ</small></div>
        <div class="sub"><i>U</i> = ½<i>Q</i><i>V</i> = ½<i>C</i><i>V</i><sup>2</sup></div>
      </div>

      <div class="stat-card">
        <div class="label">極板間電場 <i>E</i></div>
        <div class="val" style="color:#c084fc">{{ curField_kVm.toFixed(1) }} <small>kV/m</small></div>
        <div class="sub"><i>E</i> = <i>V</i> / <i>d</i></div>
      </div>

      <div class="stat-card">
        <div class="label">極板間の引力 <i>F</i></div>
        <div class="val" style="color:#f472b6">{{ curForce_uN.toFixed(2) }} <small>μN</small></div>
        <div class="sub"><i>F</i> = ½<i>Q</i><i>E</i> (係数 ½ に注意)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

// 物理定数
const eps0 = 8.8541878e-12 // F/m
const epsR = 3.0 // 誘電体の比誘電率

// UI状態
const threeContainer = ref(null)
let threeCtx = null
let appGroup = null

const isPlaying = ref(true)
const activeCam = ref('3d')

// 操作パラメータ
const isConnected = ref(true)
const distD_mm = ref(3.0) // 1.0 〜 6.0 mm
const areaS_cm2 = ref(140) // 50 〜 250 cm^2
const dielectricRatio = ref(0.0) // 0.0 〜 1.0
const batteryV = ref(50) // 10 〜 100 V

// 孤立時の固定電荷 Q [C]
const isolatedQ = ref(0)

// 表示切替
const showFieldVectors = ref(true)
const showFringeLines = ref(true)
const showPolarizationCharges = ref(true)
const showEnergyGauge = ref(true)

// スイッチ切替
function setConnected(conn) {
  if (!conn && isConnected.value) {
    isolatedQ.value = capC_Farad.value * batteryV.value
  }
  isConnected.value = conn
}

function resetDefaults() {
  isConnected.value = true
  distD_mm.value = 3.0
  areaS_cm2.value = 140
  dielectricRatio.value = 0.0
  batteryV.value = 50
  isolatedQ.value = 0
}

function presetDisconnectAndPull() {
  resetDefaults()
  setConnected(false)
  distD_mm.value = 5.6
}

function presetInsertDielectric() {
  resetDefaults()
  isConnected.value = true
  dielectricRatio.value = 1.0
}

// 物理計算
const effectiveEps = computed(() => {
  return eps0 * (1.0 + (epsR - 1.0) * dielectricRatio.value)
})

const capC_Farad = computed(() => {
  const d_m = distD_mm.value * 1e-3
  const s_m2 = areaS_cm2.value * 1e-4
  return (effectiveEps.value * s_m2) / d_m
})

const capC_pF = computed(() => capC_Farad.value * 1e12)

const curCharge = computed(() => {
  if (isConnected.value) {
    return capC_Farad.value * batteryV.value
  }
  return isolatedQ.value
})

const curVoltage = computed(() => {
  if (isConnected.value) {
    return batteryV.value
  }
  return curCharge.value / Math.max(1e-15, capC_Farad.value)
})

const curCharge_nC = computed(() => curCharge.value * 1e9)
const curEnergy_J = computed(() => 0.5 * curCharge.value * curVoltage.value)
const curEnergy_nJ = computed(() => curEnergy_J.value * 1e9)

const curField_Vm = computed(() => {
  const d_m = distD_mm.value * 1e-3
  return curVoltage.value / d_m
})

const curField_kVm = computed(() => curField_Vm.value / 1000)

const curForce_uN = computed(() => {
  const f = 0.5 * curCharge.value * curField_Vm.value
  return f * 1e6
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
    return { pos: [0, 0.1, 32.0 * ms], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 34.0 * ms, 0.001], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [7.2 * ms, 5.8 * ms, 11.2 * ms], target: [0, 0, 0], fov: 42 }
}

function setCameraPreset(preset) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, 0.55, fov)
}

// ==========================================
// 3D オブジェクト構築
// ==========================================
let topPlateMesh = null
let botPlateMesh = null
let dielectricMesh = null
let fieldVectorsGroup = null
let fringeLinesGroup = null
let chargeSymbolsGroup = null
let polarizationSymbolsGroup = null
let circuitWiresGroup = null
let energyGaugeGroup = null
let energyBarMesh = null
let attractionForceArrows = []

function initScene(scene) {
  appGroup = new THREE.Group()
  scene.add(appGroup)

  // 床グリッド
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x1e293b)
  grid.position.y = -3.2
  appGroup.add(grid)

  fieldVectorsGroup = new THREE.Group()
  fringeLinesGroup = new THREE.Group()
  chargeSymbolsGroup = new THREE.Group()
  polarizationSymbolsGroup = new THREE.Group()
  circuitWiresGroup = new THREE.Group()
  energyGaugeGroup = new THREE.Group()

  appGroup.add(fieldVectorsGroup)
  appGroup.add(fringeLinesGroup)
  appGroup.add(chargeSymbolsGroup)
  appGroup.add(polarizationSymbolsGroup)
  appGroup.add(circuitWiresGroup)
  appGroup.add(energyGaugeGroup)

  buildBaseScene()
  updateDynamicMeshes()
}

function buildBaseScene() {
  // 極板マテリアル（銅・アルミニウム金属調メタリック）
  const plateMatTop = new THREE.MeshStandardMaterial({
    color: 0xca8a04, // 磨かれた真鍮・銅
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x9a3412,
    emissiveIntensity: 0.15
  })
  const plateMatBot = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // アルマイト処理メタリック
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x0369a1,
    emissiveIntensity: 0.15
  })

  // ボックスジオメトリ（スケールで動的変形）
  const baseBoxGeo = new THREE.BoxGeometry(1, 0.12, 1)
  topPlateMesh = new THREE.Mesh(baseBoxGeo, plateMatTop)
  botPlateMesh = new THREE.Mesh(baseBoxGeo, plateMatBot)
  appGroup.add(topPlateMesh)
  appGroup.add(botPlateMesh)

  // 誘電体スラブ（半透明の青緑ガラス調ブロック）
  const dielectricMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.25,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.75,
    transparent: true,
    opacity: 0.78,
    ior: 1.5
  })
  dielectricMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), dielectricMat)
  appGroup.add(dielectricMesh)

  // 静電エネルギー 3D ゲージ（右側にシリンダーと発光バー）
  buildEnergyGauge()
}

function buildEnergyGauge() {
  cleanupGroup(energyGaugeGroup)

  const gaugeX = 5.2
  const gaugeZ = 0

  // ゲージ外枠ベース
  const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.3, 24)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  baseMesh.position.set(gaugeX, -2.4, gaugeZ)
  energyGaugeGroup.add(baseMesh)

  // ガラスシリンダー
  const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.6, 24)
  const cylMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.1,
    transmission: 0.85
  })
  const cylMesh = new THREE.Mesh(cylGeo, cylMat)
  cylMesh.position.set(gaugeX, -0.6, gaugeZ)
  energyGaugeGroup.add(cylMesh)

  // 内部エネルギー液面バー（高さが U に応じて変化）
  const barGeo = new THREE.CylinderGeometry(0.42, 0.42, 1, 24)
  barGeo.translate(0, 0.5, 0)
  const barMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.75,
    roughness: 0.2
  })
  energyBarMesh = new THREE.Mesh(barGeo, barMat)
  energyBarMesh.position.set(gaugeX, -2.25, gaugeZ)
  energyGaugeGroup.add(energyBarMesh)

  // ゲージトップラベル
  const gaugeLabel = createTextSprite('エネルギー U (nJ)', {
    color: '#6ee7b7',
    bgColor: 'rgba(6, 78, 59, 0.8)',
    borderColor: '#10b981',
    fontSize: 32,
    scale: 0.42
  })
  gaugeLabel.position.set(gaugeX, 1.6, gaugeZ)
  energyGaugeGroup.add(gaugeLabel)
}

function cleanupGroup(grp) {
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

// 物理パラメータに合わせた 3D ジオメトリ・位置更新
function updateDynamicMeshes() {
  if (!appGroup) return

  // 1. スケーリングパラメータ
  // 極板幅・奥行き: areaS_cm2 (50〜250) -> 幅 2.6〜5.5, 奥行き 2.0〜4.2
  const sRatio = (areaS_cm2.value - 50) / 200 // 0〜1
  const plateWidth = 2.6 + sRatio * 2.8
  const plateDepth = 2.0 + sRatio * 2.2
  const plateThick = 0.16

  // 極板間隔: distD_mm (1.0〜6.0) -> 3D間隔 0.8〜3.6
  const dRatio = (distD_mm.value - 1.0) / 5.0 // 0〜1
  const gapY = 0.8 + dRatio * 2.8
  const halfGap = gapY / 2

  // 極板のスケールと位置
  topPlateMesh.scale.set(plateWidth, 1, plateDepth)
  topPlateMesh.position.set(0, halfGap + plateThick / 2, 0)

  botPlateMesh.scale.set(plateWidth, 1, plateDepth)
  botPlateMesh.position.set(0, -halfGap - plateThick / 2, 0)

  // 2. 誘電体スラブの位置とスケール
  // 挿入率 dielectricRatio (0〜1) に応じて左からスライド挿入
  const slabWidth = plateWidth
  const slabDepth = plateDepth
  const slabHeight = gapY - 0.02
  dielectricMesh.scale.set(slabWidth, slabHeight, slabDepth)

  // 挿入時: ratio=0 のときは左外側 ( -plateWidth ), ratio=1 のときは中心 0
  const slabX = -plateWidth * (1.0 - dielectricRatio.value)
  dielectricMesh.position.set(slabX, 0, 0)
  dielectricMesh.visible = dielectricRatio.value > 0.01

  // 3. 極板間の電場ベクトル
  rebuildFieldVectors(plateWidth, plateDepth, halfGap, gapY)

  // 4. 端効果（フリンジ電場）ライン
  rebuildFringeLines(plateWidth, plateDepth, halfGap)

  // 5. 自由電荷シンボル（極板内面）
  rebuildPlateCharges(plateWidth, plateDepth, halfGap)

  // 6. 誘電分極電荷シンボル
  rebuildPolarizationCharges(slabWidth, slabDepth, halfGap, slabX)

  // 7. 回路配線・バッテリー
  rebuildCircuitWires(plateWidth, halfGap)

  // 8. 3D 静電エネルギーゲージの液面
  updateEnergyGaugeLevel()
}

// 極板間電場ベクトル矢印群
function rebuildFieldVectors(pw, pd, halfGap, gapY) {
  cleanupGroup(fieldVectorsGroup)
  if (!showFieldVectors.value || curField_kVm.value < 0.1) return

  const nx = 5
  const nz = 4
  const stepX = (pw * 0.8) / (nx - 1)
  const stepZ = (pd * 0.8) / (nz - 1)
  const startX = -(pw * 0.8) / 2
  const startZ = -(pd * 0.8) / 2

  // 誘電体境界の X 座標
  const slabRightX = -pw * (1.0 - dielectricRatio.value) + pw / 2

  for (let ix = 0; ix < nx; ix++) {
    for (let iz = 0; iz < nz; iz++) {
      const vx = startX + ix * stepX
      const vz = startZ + iz * stepZ
      const insideDielectric = dielectricRatio.value > 0.05 && vx <= slabRightX

      // 誘電体内部は電場が 1/εr に減衰
      const localE = insideDielectric ? curField_kVm.value / epsR : curField_kVm.value
      const col = insideDielectric ? 0x06b6d4 : 0xa855f7

      const arrow = createVectorArrow3D({
        color: col,
        shaftRadius: 0.025,
        headRadius: 0.08,
        headLength: 0.22,
        opacity: insideDielectric ? 0.65 : 0.88
      })

      // 上極板(+)から下極板(-)への下向きベクトル
      const origin = new THREE.Vector3(vx, halfGap - 0.05, vz)
      const dir = new THREE.Vector3(0, -1, 0)
      const len = Math.max(0.3, Math.min(gapY - 0.1, gapY * 0.9))
      arrow.setVector(origin, dir, len)
      fieldVectorsGroup.add(arrow)
    }
  }
}

// 端効果 (Fringe Field Lines)
function rebuildFringeLines(pw, pd, halfGap) {
  cleanupGroup(fringeLinesGroup)
  if (!showFringeLines.value || curField_kVm.value < 0.1) return

  const numArcs = 4
  const edges = [
    { x: pw / 2, signX: 1, signZ: 0 },
    { x: -pw / 2, signX: -1, signZ: 0 }
  ]

  edges.forEach(edge => {
    for (let i = 0; i < numArcs; i++) {
      const z = (-(pd * 0.7) / 2) + (i / (numArcs - 1)) * (pd * 0.7)
      const bulge = 0.5 + i * 0.15

      // 上極板端から外側に膨らんで下極板端へ戻る二次ベジェ曲線
      const p0 = new THREE.Vector3(edge.x, halfGap, z)
      const p1 = new THREE.Vector3(edge.x + edge.signX * bulge, 0, z)
      const p2 = new THREE.Vector3(edge.x, -halfGap, z)

      const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2)
      const pts = curve.getPoints(24)
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.55
      })
      const fringeLine = new THREE.Line(geo, mat)
      fringeLinesGroup.add(fringeLine)
    }
  })
}

// 極板内面の自由電荷 ±Q シンボル
function rebuildPlateCharges(pw, pd, halfGap) {
  cleanupGroup(chargeSymbolsGroup)

  const numCharges = Math.min(18, Math.max(4, Math.round(curCharge_nC.value * 5.0)))
  const cols = 5
  const rows = Math.ceil(numCharges / cols)

  const stepX = (pw * 0.75) / (cols - 1 || 1)
  const stepZ = (pd * 0.75) / (rows - 1 || 1)

  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (count >= numCharges) break
      const x = -(pw * 0.75) / 2 + c * stepX
      const z = -(pd * 0.75) / 2 + r * stepZ

      // 上極板内面 (+)
      const posDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 10, 10),
        new THREE.MeshStandardMaterial({
          color: 0xfb7185,
          emissive: 0xf43f5e,
          emissiveIntensity: 0.8
        })
      )
      posDot.position.set(x, halfGap - 0.05, z)
      chargeSymbolsGroup.add(posDot)

      // 下極板内面 (-)
      const negDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 10, 10),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8
        })
      )
      negDot.position.set(x, -halfGap + 0.05, z)
      chargeSymbolsGroup.add(negDot)

      count++
    }
  }
}

// 誘電分極電荷 ±qp
function rebuildPolarizationCharges(sw, sd, halfGap, slabX) {
  cleanupGroup(polarizationSymbolsGroup)
  if (!showPolarizationCharges.value || dielectricRatio.value < 0.05 || curCharge_nC.value < 0.05) return

  const numP = Math.min(12, Math.max(3, Math.round(curCharge_nC.value * dielectricRatio.value * 3.5)))
  const cols = 4
  const rows = Math.ceil(numP / cols)

  // 誘電体内の領域
  const activeW = sw * dielectricRatio.value
  const startX = slabX - sw / 2 + (sw * (1 - dielectricRatio.value)) + 0.1
  const stepX = (activeW * 0.8) / (cols - 1 || 1)
  const stepZ = (sd * 0.7) / (rows - 1 || 1)

  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (count >= numP) break
      const x = startX + c * stepX
      const z = -(sd * 0.7) / 2 + r * stepZ

      // 誘電体上面: 上極板(+)に向かい合って束縛負電荷 (−qp)
      const boundNeg = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.75
        })
      )
      boundNeg.position.set(x, halfGap - 0.14, z)
      polarizationSymbolsGroup.add(boundNeg)

      // 誘電体下面: 下極板(−)に向かい合って束縛正電荷 (+qp)
      const boundPos = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xdb2777,
          emissiveIntensity: 0.75
        })
      )
      boundPos.position.set(x, -halfGap + 0.14, z)
      polarizationSymbolsGroup.add(boundPos)

      count++
    }
  }
}

// 外部回路・バッテリー配線
function rebuildCircuitWires(pw, halfGap) {
  cleanupGroup(circuitWiresGroup)

  const wireX = -pw / 2 - 1.2
  const wireCol = isConnected.value ? 0x38bdf8 : 0x64748b

  // 上極板から左外枠へのリード線
  const ptsTop = [
    new THREE.Vector3(-pw / 2 + 0.2, halfGap, 0),
    new THREE.Vector3(wireX, halfGap, 0),
    new THREE.Vector3(wireX, 0.45, 0)
  ]
  const geoTop = new THREE.BufferGeometry().setFromPoints(ptsTop)
  const lineTop = new THREE.Line(geoTop, new THREE.LineBasicMaterial({ color: wireCol, linewidth: 2 }))
  circuitWiresGroup.add(lineTop)

  // 下極板から左外枠へのリード線
  const ptsBot = [
    new THREE.Vector3(-pw / 2 + 0.2, -halfGap, 0),
    new THREE.Vector3(wireX, -halfGap, 0),
    new THREE.Vector3(wireX, -0.45, 0)
  ]
  const geoBot = new THREE.BufferGeometry().setFromPoints(ptsBot)
  const lineBot = new THREE.Line(geoBot, new THREE.LineBasicMaterial({ color: wireCol, linewidth: 2 }))
  circuitWiresGroup.add(lineBot)

  // 直流バッテリー / スイッチ表示
  if (isConnected.value) {
    // 直流電源プレート
    const pPlus = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0xfb7185, metalness: 0.5 })
    )
    pPlus.rotation.z = Math.PI / 2
    pPlus.position.set(wireX, 0.18, 0)

    const pMinus = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5 })
    )
    pMinus.rotation.z = Math.PI / 2
    pMinus.position.set(wireX, -0.18, 0)

    circuitWiresGroup.add(pPlus, pMinus)

    const bLabel = createTextSprite(`電源 ${batteryV.value}V`, {
      color: '#f8fafc',
      bgColor: 'rgba(15, 23, 42, 0.8)',
      borderColor: '#38bdf8',
      fontSize: 28,
      scale: 0.36
    })
    bLabel.position.set(wireX - 0.7, 0, 0)
    circuitWiresGroup.add(bLabel)
  } else {
    // 開いたスイッチ（斜めの接点バー）
    const swPts = [
      new THREE.Vector3(wireX, -0.4, 0),
      new THREE.Vector3(wireX + 0.35, 0.2, 0)
    ]
    const swLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(swPts),
      new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 })
    )
    circuitWiresGroup.add(swLine)

    const swLabel = createTextSprite('スイッチOFF (孤立)', {
      color: '#fde68a',
      bgColor: 'rgba(120, 53, 15, 0.8)',
      borderColor: '#f59e0b',
      fontSize: 28,
      scale: 0.36
    })
    swLabel.position.set(wireX - 0.8, 0, 0)
    circuitWiresGroup.add(swLabel)
  }
}

// 静電エネルギーゲージの液面高さ更新
function updateEnergyGaugeLevel() {
  if (!energyBarMesh) return
  energyGaugeGroup.visible = showEnergyGauge.value
  if (!showEnergyGauge.value) return

  // 最大想定エネルギー 10 nJ を 3.2m の高さにマッピング
  const maxEnergy = 8.0
  const heightRatio = Math.max(0.04, Math.min(1.0, curEnergy_nJ.value / maxEnergy))
  const actualH = 3.2 * heightRatio

  energyBarMesh.scale.set(1, actualH, 1)
  // 発光強度の同期
  energyBarMesh.material.emissiveIntensity = 0.4 + heightRatio * 0.6
}

// 反応性ウォッチャー
watch(
  [isConnected, distD_mm, areaS_cm2, dielectricRatio, batteryV, showFieldVectors, showFringeLines, showPolarizationCharges, showEnergyGauge],
  () => {
    updateDynamicMeshes()
  }
)

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [7.2, 5.8, 11.2],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame: (dt, elapsed) => {
      // 誘電体やエネルギーバーの微かな光の揺らぎ
      if (dielectricMesh && dielectricMesh.material) {
        dielectricMesh.material.emissiveIntensity = 0.2 + Math.sin(elapsed * 2.5) * 0.08
      }
    }
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

.badge-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

/* スイッチ/モードタブ */
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

.btn-chip {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #7dd3fc;
  font-weight: 600;
}

.btn-chip:hover {
  background: rgba(56, 189, 248, 0.3);
  color: #fff;
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

.three-status-badge.conn {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #bae6fd;
}

.three-status-badge.isol {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fef08a;
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
