<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚡</span>
        <h3 class="sim-title">3D 直流回路・キルヒホッフ則・非オーム抵抗・ブリッジ</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan">KCL: Σ<i>I</i><sub>in</sub> = Σ<i>I</i><sub>out</sub></span>
        <span class="badge badge-purple">KVL: Σ<i>E</i> − Σ<i>RI</i> = 0</span>
        <span class="badge badge-amber" v-if="mode === 'bridge'">平衡: <i>R</i><sub>1</sub><i>R</i><sub>4</sub> = <i>R</i><sub>2</sub><i>R</i><sub>3</sub></span>
      </div>
    </div>

    <p class="desc">
      3Dブレッドボード基板上でDC電源、抵抗器、電球、検流計をインタラクティブ操作。
      電流 <i>I</i> に応じて移動する光る電子ドリフト流、接合点での分流（KCL）、そして閉回路の一巡で標高差がゼロに戻る「3D電位標高リリーフ（KVL）」を直感的に体感できます。
    </p>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'kirchhoff' }" @click="mode = 'kirchhoff'">
        ① キルヒホッフの法則 (2電源回路)
      </button>
      <button :class="{ active: mode === 'nonOhmic' }" @click="mode = 'nonOhmic'">
        ② 非オーム抵抗 (電球) &amp; 負荷線
      </button>
      <button :class="{ active: mode === 'bridge' }" @click="mode = 'bridge'">
        ③ ホイートストンブリッジ回路
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

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 電流流速:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.8 }" @click="timeScale = 1.8">1.8x</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="resetDefaults">
        🔄 パラメータ初期化
      </button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            導線 / 自由電子ドリフト
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fb7185;box-shadow:0 0 6px #fb7185"></i>
            DC 電源 (起電力 E)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            抵抗器 / 電球
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#a855f7;box-shadow:0 0 6px #a855f7"></i>
            3D電位標高リリーフ (KVL)
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
        {{ modeStatusText }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <!-- モード1: キルヒホッフ (2電源) -->
      <div v-if="mode === 'kirchhoff'" class="controls-grid">
        <div class="control-group">
          <label>
            <span>起電力 <i>E</i><sub>1</sub>:</span>
            <strong style="color:#fb7185">{{ E1 }} V</strong>
          </label>
          <input type="range" v-model.number="E1" min="0" max="24" step="1" />
          <div class="quick-chips">
            <button class="mini-chip" @click="E1 = 12">12V (標準)</button>
            <button class="mini-chip" @click="E1 = 18">18V</button>
            <button class="mini-chip" @click="E1 = 6">6V</button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>起電力 <i>E</i><sub>2</sub>:</span>
            <strong style="color:#fb7185">{{ E2 }} V</strong>
          </label>
          <input type="range" v-model.number="E2" min="0" max="24" step="1" />
          <div class="quick-chips">
            <button class="mini-chip" @click="E2 = 6">6V</button>
            <button class="mini-chip" @click="E2 = 12">12V</button>
            <button class="mini-chip" @click="E2 = 0">0V (短絡)</button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>抵抗 <i>R</i><sub>1</sub>:</span>
            <strong style="color:#fbbf24">{{ R1 }} Ω</strong>
          </label>
          <input type="range" v-model.number="R1" min="1" max="20" step="1" />
        </div>

        <div class="control-group">
          <label>
            <span>抵抗 <i>R</i><sub>2</sub>:</span>
            <strong style="color:#fbbf24">{{ R2 }} Ω</strong>
          </label>
          <input type="range" v-model.number="R2" min="1" max="20" step="1" />
        </div>

        <div class="control-group">
          <label>
            <span>中央抵抗 <i>R</i><sub>3</sub>:</span>
            <strong style="color:#a78bfa">{{ R3 }} Ω</strong>
          </label>
          <input type="range" v-model.number="R3" min="1" max="20" step="1" />
        </div>
      </div>

      <!-- モード2: 非オーム抵抗 (電球) -->
      <div v-if="mode === 'nonOhmic'" class="controls-grid">
        <div class="control-group">
          <label>
            <span>電源起電力 <i>E</i>:</span>
            <strong style="color:#fb7185">{{ nonOhmicE }} V</strong>
          </label>
          <input type="range" v-model.number="nonOhmicE" min="2" max="24" step="0.5" />
        </div>
        <div class="control-group">
          <label>
            <span>直列保護抵抗 <i>R</i>:</span>
            <strong style="color:#fbbf24">{{ nonOhmicR }} Ω</strong>
          </label>
          <input type="range" v-model.number="nonOhmicR" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>
            <span>電球特性係数 <i>k</i> (<i>I</i> = <i>k</i>√<i>V</i>):</span>
            <strong style="color:#38bdf8">{{ nonOhmicK }}</strong>
          </label>
          <input type="range" v-model.number="nonOhmicK" min="0.2" max="1.5" step="0.1" />
          <span class="sub-info">フィラメント温度上昇による非オーム特性</span>
        </div>
      </div>

      <!-- モード3: ホイートストンブリッジ -->
      <div v-if="mode === 'bridge'" class="controls-grid">
        <div class="control-group">
          <label>
            <span>電源電圧 <i>E</i>:</span>
            <strong style="color:#fb7185">{{ bridgeE }} V</strong>
          </label>
          <input type="range" v-model.number="bridgeE" min="2" max="20" step="1" />
        </div>
        <div class="control-group">
          <label>
            <span>抵抗 <i>R</i><sub>1</sub>:</span>
            <strong style="color:#fbbf24">{{ bridgeR1 }} Ω</strong>
          </label>
          <input type="range" v-model.number="bridgeR1" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>
            <span>可変抵抗 <i>R</i><sub>2</sub>:</span>
            <strong style="color:#38bdf8">{{ bridgeR2 }} Ω</strong>
          </label>
          <input type="range" v-model.number="bridgeR2" min="2" max="30" step="1" />
          <div class="quick-chips">
            <button class="mini-chip" @click="autoBalanceBridge">🎯 平衡値に調整</button>
          </div>
        </div>
        <div class="control-group">
          <label>
            <span>抵抗 <i>R</i><sub>3</sub>:</span>
            <strong style="color:#fbbf24">{{ bridgeR3 }} Ω</strong>
          </label>
          <input type="range" v-model.number="bridgeR3" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>
            <span>未知/調整抵抗 <i>R</i><sub>4</sub>:</span>
            <strong style="color:#a78bfa">{{ bridgeR4 }} Ω</strong>
          </label>
          <input type="range" v-model.number="bridgeR4" min="2" max="30" step="1" />
        </div>
      </div>

      <!-- 表示オプション -->
      <div class="options-row">
        <span class="opt-label">👁️ 3D表示切替:</span>
        <label class="check-label">
          <input type="checkbox" v-model="showPotentialRelief" />
          3D電位標高リリーフ (KVL)
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showElectrons" />
          光る電子ドリフト流
        </label>
        <label class="check-label">
          <input type="checkbox" v-model="showValuesLabels" />
          素子値スプライト
        </label>
      </div>
    </div>

    <!-- 統計パネル -->
    <div class="stats-panel">
      <template v-if="mode === 'kirchhoff'">
        <div class="stat-card hl">
          <div class="label">枝1電流 <i>I</i><sub>1</sub></div>
          <div class="val" :style="{ color: kRes.I1 >= 0 ? '#38bdf8' : '#f43f5e' }">
            {{ fmt(kRes.I1, 3) }} <small>A</small>
          </div>
          <div class="sub"><i>I</i><sub>1</sub> = (<i>E</i><sub>1</sub> − <i>V</i><sub>P</sub>) / <i>R</i><sub>1</sub></div>
        </div>

        <div class="stat-card">
          <div class="label">枝2電流 <i>I</i><sub>2</sub></div>
          <div class="val" :style="{ color: kRes.I2 >= 0 ? '#38bdf8' : '#f43f5e' }">
            {{ fmt(kRes.I2, 3) }} <small>A</small>
          </div>
          <div class="sub"><i>I</i><sub>2</sub> = (<i>E</i><sub>2</sub> − <i>V</i><sub>P</sub>) / <i>R</i><sub>2</sub></div>
        </div>

        <div class="stat-card">
          <div class="label">中央電流 <i>I</i><sub>3</sub> (KCL)</div>
          <div class="val highlight-alt">
            {{ fmt(kRes.I3, 3) }} <small>A</small>
          </div>
          <div class="sub"><i>I</i><sub>3</sub> = <i>I</i><sub>1</sub> + <i>I</i><sub>2</sub> (接合点則)</div>
        </div>

        <div class="stat-card">
          <div class="label">節点P電位 <i>V</i><sub>P</sub></div>
          <div class="val highlight">
            {{ fmt(kRes.VP, 2) }} <small>V</small>
          </div>
          <div class="sub">下部接地 (0V) を基準とする標高</div>
        </div>
      </template>

      <template v-if="mode === 'nonOhmic'">
        <div class="stat-card hl">
          <div class="label">電球両端電圧 <i>V</i><sub>L</sub></div>
          <div class="val highlight">{{ fmt(noRes.V, 2) }} <small>V</small></div>
          <div class="sub">負荷線と曲線の交点（動作点）</div>
        </div>
        <div class="stat-card">
          <div class="label">回路電流 <i>I</i></div>
          <div class="val" style="color:#38bdf8">{{ fmt(noRes.I, 3) }} <small>A</small></div>
          <div class="sub"><i>I</i> = <i>k</i>√<i>V</i><sub>L</sub> = (<i>E</i> − <i>V</i><sub>L</sub>) / <i>R</i></div>
        </div>
        <div class="stat-card">
          <div class="label">電球消費電力 <i>P</i><sub>L</sub></div>
          <div class="val highlight-alt">{{ fmt(noRes.P, 2) }} <small>W</small></div>
          <div class="sub">3Dフィラメント発光輝度に連動</div>
        </div>
        <div class="stat-card">
          <div class="label">保護抵抗電圧 <i>V</i><sub>R</sub></div>
          <div class="val">{{ fmt(nonOhmicE - noRes.V, 2) }} <small>V</small></div>
          <div class="sub"><i>V</i><sub>R</sub> + <i>V</i><sub>L</sub> = <i>E</i> (KVL成立)</div>
        </div>
      </template>

      <template v-if="mode === 'bridge'">
        <div class="stat-card hl">
          <div class="label">ブリッジ平衡判定</div>
          <div class="val" :class="brRes.balanced ? 'current-flow' : 'zero-k'">
            {{ brRes.balanced ? '✓ 完全平衡' : '× 不平衡' }}
          </div>
          <div class="sub"><i>R</i><sub>1</sub><i>R</i><sub>4</sub> {{ brRes.balanced ? '=' : '≠' }} <i>R</i><sub>2</sub><i>R</i><sub>3</sub></div>
        </div>
        <div class="stat-card">
          <div class="label">検流計電流 <i>I</i><sub>G</sub></div>
          <div class="val" :style="{ color: brRes.balanced ? '#4ade80' : '#f59e0b' }">
            {{ fmt(brRes.IG, 3) }} <small>A</small>
          </div>
          <div class="sub">平衡時 <i>I</i><sub>G</sub> = 0 A (針の中立)</div>
        </div>
        <div class="stat-card">
          <div class="label">検流計端子間電位差 Δ<i>V</i></div>
          <div class="val highlight">{{ fmt(brRes.dVD, 3) }} <small>V</small></div>
          <div class="sub"><i>V</i><sub>C</sub> − <i>V</i><sub>D</sub></div>
        </div>
        <div class="stat-card">
          <div class="label">全回路電流 <i>I</i><sub>total</sub></div>
          <div class="val">{{ fmt(brRes.Itotal, 3) }} <small>A</small></div>
          <div class="sub"><i>I</i><sub>1</sub> + <i>I</i><sub>3</sub> (電源供給)</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'
import { fmt } from './simUtils.js'

// UI状態
const threeContainer = ref(null)
let threeCtx = null
let appGroup = null

const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')
const mode = ref('kirchhoff') // 'kirchhoff' | 'nonOhmic' | 'bridge'

// モード1: キルヒホッフ
const E1 = ref(12)
const E2 = ref(6)
const R1 = ref(4)
const R2 = ref(6)
const R3 = ref(3)

// モード2: 非オーム抵抗
const nonOhmicE = ref(10)
const nonOhmicR = ref(10)
const nonOhmicK = ref(0.6)

// モード3: ホイートストンブリッジ
const bridgeE = ref(10)
const bridgeR1 = ref(10)
const bridgeR2 = ref(15)
const bridgeR3 = ref(8)
const bridgeR4 = ref(12)

// 表示切替
const showPotentialRelief = ref(true)
const showElectrons = ref(true)
const showValuesLabels = ref(true)

function resetDefaults() {
  if (mode.value === 'kirchhoff') {
    E1.value = 12
    E2.value = 6
    R1.value = 4
    R2.value = 6
    R3.value = 3
  } else if (mode.value === 'nonOhmic') {
    nonOhmicE.value = 10
    nonOhmicR.value = 10
    nonOhmicK.value = 0.6
  } else if (mode.value === 'bridge') {
    bridgeE.value = 10
    bridgeR1.value = 10
    bridgeR2.value = 15
    bridgeR3.value = 8
    bridgeR4.value = 12
  }
}

function autoBalanceBridge() {
  // R1/R2 = R3/R4 => R2 = R1 * R4 / R3
  const targetR2 = Math.round((bridgeR1.value * bridgeR4.value) / bridgeR3.value)
  bridgeR2.value = Math.min(30, Math.max(2, targetR2))
}

// 物理計算: キルヒホッフ
const kRes = computed(() => {
  const G1 = 1 / R1.value
  const G2 = 1 / R2.value
  const G3 = 1 / R3.value
  const VP = (E1.value * G1 + E2.value * G2) / (G1 + G2 + G3)
  const I1 = (E1.value - VP) * G1
  const I2 = (E2.value - VP) * G2
  const I3 = VP * G3
  return { VP, I1, I2, I3 }
})

// 物理計算: 非オーム抵抗 (電球)
const noRes = computed(() => {
  const E = nonOhmicE.value
  const R = nonOhmicR.value
  const k = nonOhmicK.value
  const b = R * k
  const disc = b * b + 4 * E
  const u = (-b + Math.sqrt(disc)) / 2
  const V = u * u
  const I = k * u
  const P = V * I
  return { V, I, P }
})

// 物理計算: ホイートストンブリッジ
const brRes = computed(() => {
  const E = bridgeE.value
  const r1 = bridgeR1.value
  const r2 = bridgeR2.value
  const r3 = bridgeR3.value
  const r4 = bridgeR4.value
  const rG = 10 // 検流計内部抵抗 [Ω]

  const g1 = 1 / r1
  const g2 = 1 / r2
  const g3 = 1 / r3
  const g4 = 1 / r4
  const gG = 1 / rG

  const a11 = g1 + g2 + gG
  const a22 = g3 + g4 + gG
  const det = a11 * a22 - gG * gG

  const VC = (E * g1 * a22 + E * g3 * gG) / det
  const VD = (a11 * E * g3 + gG * E * g1) / det
  const dVD = VC - VD

  const I1 = (E - VC) * g1
  const I2 = VC * g2
  const I3 = (E - VD) * g3
  const I4 = VD * g4
  const IG = (VC - VD) * gG
  const Itotal = I1 + I3

  const ratio1 = r1 * r4
  const ratio2 = r2 * r3
  const balanced = Math.abs(ratio1 - ratio2) < 0.05
  return { VC, VD, dVD, I1, I2, I3, I4, IG, Itotal, balanced }
})

const modeStatusText = computed(() => {
  if (mode.value === 'kirchhoff') {
    return `キルヒホッフ2電源回路: 節点P電位 VP = ${fmt(kRes.value.VP, 2)} V。I₁ + I₂ = I₃ (${fmt(kRes.value.I1, 2)} + ${fmt(kRes.value.I2, 2)} = ${fmt(kRes.value.I3, 2)} A)`
  }
  if (mode.value === 'nonOhmic') {
    return `非オーム電球回路: 動作点 VL = ${fmt(noRes.value.V, 2)} V, I = ${fmt(noRes.value.I, 3)} A, 消費電力 P = ${fmt(noRes.value.P, 2)} W (フィラメント発熱)`
  }
  return brRes.value.balanced
    ? 'ホイートストンブリッジ完全平衡！検流計電流 IG = 0 A、中立保持'
    : `不平衡状態: 検流計電流 IG = ${fmt(brRes.value.IG, 3)} A (電位差 ΔV = ${fmt(brRes.value.dVD, 3)} V)`
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
    return { pos: [0, 1.2, 34.0 * ms], target: [0, 0, 0], fov: 14 }
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
// 3D 回路シーン構築
// ==========================================
let breadboardMesh = null
let circuitWiresMeshGroup = null
let componentsGroup = null
let reliefGroup = null
let electronsGroup = null
let electronPool = []
let bulbFilamentMesh = null
let bulbPointLight = null
let galvanometerNeedle = null

function initScene(scene) {
  appGroup = new THREE.Group()
  scene.add(appGroup)

  circuitWiresMeshGroup = new THREE.Group()
  componentsGroup = new THREE.Group()
  reliefGroup = new THREE.Group()
  electronsGroup = new THREE.Group()

  appGroup.add(circuitWiresMeshGroup)
  appGroup.add(componentsGroup)
  appGroup.add(reliefGroup)
  appGroup.add(electronsGroup)

  // ブレッドボード / 基板
  const pcbGeo = new THREE.BoxGeometry(13.5, 0.35, 9.5)
  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x0f291e, // 高級感のあるダークグリーンPCB
    roughness: 0.35,
    metalness: 0.15
  })
  breadboardMesh = new THREE.Mesh(pcbGeo, pcbMat)
  breadboardMesh.position.y = -0.18
  appGroup.add(breadboardMesh)

  // 基板取り付けネジ
  const screwMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
  const screwPos = [
    [-6.3, 0.05, -4.3],
    [6.3, 0.05, -4.3],
    [-6.3, 0.05, 4.3],
    [6.3, 0.05, 4.3]
  ]
  screwPos.forEach(p => {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), screwMat)
    screw.position.set(...p)
    appGroup.add(screw)
  })

  rebuildCircuit3D()
}

function cleanupSub(grp) {
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

function rebuildCircuit3D() {
  if (!appGroup) return
  cleanupSub(circuitWiresMeshGroup)
  cleanupSub(componentsGroup)
  cleanupSub(reliefGroup)
  cleanupSub(electronsGroup)
  electronPool = []
  bulbFilamentMesh = null
  bulbPointLight = null
  galvanometerNeedle = null

  if (mode.value === 'kirchhoff') {
    buildKirchhoffCircuit()
  } else if (mode.value === 'nonOhmic') {
    buildNonOhmicCircuit()
  } else if (mode.value === 'bridge') {
    buildBridgeCircuit()
  }
}

// -------------------------------------------------------------
// モード1: キルヒホッフ 3D 回路構築
// -------------------------------------------------------------
function buildKirchhoffCircuit() {
  const xL = -4.2
  const xM = 0.0
  const xR = 4.2
  const zTop = -2.6
  const zBot = 2.6
  const yWire = 0.05

  // 1. 配線パイプ (3Dチューブ)
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.3 })
  const wireRadius = 0.055

  // 閉回路配線パス
  const wires = [
    // 上部配線: 左から中央、中央から右
    [new THREE.Vector3(xL, yWire, zTop), new THREE.Vector3(xM, yWire, zTop)],
    [new THREE.Vector3(xM, yWire, zTop), new THREE.Vector3(xR, yWire, zTop)],
    // 下部接地配線 (基準 0V)
    [new THREE.Vector3(xL, yWire, zBot), new THREE.Vector3(xM, yWire, zBot)],
    [new THREE.Vector3(xM, yWire, zBot), new THREE.Vector3(xR, yWire, zBot)],
    // 左縦配線 (電源E1 & 抵抗R1)
    [new THREE.Vector3(xL, yWire, zTop), new THREE.Vector3(xL, yWire, zBot)],
    // 右縦配線 (電源E2 & 抵抗R2)
    [new THREE.Vector3(xR, yWire, zTop), new THREE.Vector3(xR, yWire, zBot)],
    // 中央縦配線 (抵抗R3)
    [new THREE.Vector3(xM, yWire, zTop), new THREE.Vector3(xM, yWire, zBot)]
  ]

  wires.forEach(([pA, pB]) => {
    const dir = new THREE.Vector3().subVectors(pB, pA)
    const len = dir.length()
    const geo = new THREE.CylinderGeometry(wireRadius, wireRadius, len, 12)
    geo.translate(0, len / 2, 0)
    const mesh = new THREE.Mesh(geo, wireMat)
    mesh.position.copy(pA)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    circuitWiresMeshGroup.add(mesh)
  })

  // 接合点ノード端子 (Node P: 中央上部)
  const nodeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16)
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 })
  const nodeP = new THREE.Mesh(nodeGeo, nodeMat)
  nodeP.position.set(xM, 0.12, zTop)
  componentsGroup.add(nodeP)

  const lblP = createTextSprite(`節点 P (${fmt(kRes.value.VP, 1)}V)`, {
    color: '#fef08a',
    bgColor: 'rgba(120, 53, 15, 0.85)',
    borderColor: '#f59e0b',
    fontSize: 28,
    scale: 0.38
  })
  lblP.position.set(xM, 0.65, zTop)
  componentsGroup.add(lblP)

  // 2. コンポーネント (DC電源・抵抗)
  // 電源 E1 (左縦枝, zBot側から zTopへ)
  addBattery3D(xL, yWire, 1.2, E1.value, 'E₁')
  // 抵抗 R1 (左縦枝, zTop側)
  addResistor3D(xL, yWire, -1.2, R1.value, 'R₁')

  // 電源 E2 (右縦枝)
  addBattery3D(xR, yWire, 1.2, E2.value, 'E₂')
  // 抵抗 R2 (右縦枝)
  addResistor3D(xR, yWire, -1.2, R2.value, 'R₂')

  // 中央抵抗 R3
  addResistor3D(xM, yWire, 0.0, R3.value, 'R₃')

  // 3. 電子ドリフト流 (Branch 1, Branch 2, Branch 3)
  spawnElectronsBranch(xL, zBot, xL, zTop, kRes.value.I1)
  spawnElectronsBranch(xL, zTop, xM, zTop, kRes.value.I1)

  spawnElectronsBranch(xR, zBot, xR, zTop, kRes.value.I2)
  spawnElectronsBranch(xR, zTop, xM, zTop, kRes.value.I2)

  spawnElectronsBranch(xM, zTop, xM, zBot, kRes.value.I3)
  spawnElectronsBranch(xM, zBot, xL, zBot, -kRes.value.I1)
  spawnElectronsBranch(xM, zBot, xR, zBot, -kRes.value.I2)

  // 4. 3D電位標高リリーフ (KVL: ΣV = 0 の登山道)
  if (showPotentialRelief.value) {
    buildKirchhoffRelief(xL, xM, xR, zTop, zBot)
  }
}

// -------------------------------------------------------------
// モード2: 非オーム抵抗 (電球) 3D 回路構築
// -------------------------------------------------------------
function buildNonOhmicCircuit() {
  const xL = -3.8
  const xR = 3.8
  const zTop = -2.2
  const zBot = 2.2
  const yWire = 0.05
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.3 })
  const wireRadius = 0.055

  const loop = [
    [new THREE.Vector3(xL, yWire, zBot), new THREE.Vector3(xL, yWire, zTop)],
    [new THREE.Vector3(xL, yWire, zTop), new THREE.Vector3(xR, yWire, zTop)],
    [new THREE.Vector3(xR, yWire, zTop), new THREE.Vector3(xR, yWire, zBot)],
    [new THREE.Vector3(xR, yWire, zBot), new THREE.Vector3(xL, yWire, zBot)]
  ]

  loop.forEach(([pA, pB]) => {
    const dir = new THREE.Vector3().subVectors(pB, pA)
    const len = dir.length()
    const geo = new THREE.CylinderGeometry(wireRadius, wireRadius, len, 12)
    geo.translate(0, len / 2, 0)
    const mesh = new THREE.Mesh(geo, wireMat)
    mesh.position.copy(pA)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    circuitWiresMeshGroup.add(mesh)
  })

  // 電源 E
  addBattery3D(xL, yWire, 0.0, nonOhmicE.value, `E (${nonOhmicE.value}V)`)

  // 保護抵抗 R (上辺中央)
  addResistor3D(0.0, yWire, zTop, nonOhmicR.value, `R (${nonOhmicR.value}Ω)`)

  // 3D 白熱電球 (右辺中央)
  build3DBulb(xR, yWire, 0.0)

  // 電子流
  spawnElectronsBranch(xL, zBot, xL, zTop, noRes.value.I)
  spawnElectronsBranch(xL, zTop, xR, zTop, noRes.value.I)
  spawnElectronsBranch(xR, zTop, xR, zBot, noRes.value.I)
  spawnElectronsBranch(xR, zBot, xL, zBot, noRes.value.I)

  // 3D電位標高リリーフ
  if (showPotentialRelief.value) {
    buildNonOhmicRelief(xL, xR, zTop, zBot)
  }
}

// -------------------------------------------------------------
// モード3: ホイートストンブリッジ 3D 回路構築
// -------------------------------------------------------------
function buildBridgeCircuit() {
  const xA = -4.5 // 電源正極・分岐点A
  const xB = 4.5  // 電源負極・合流点B
  const xMid = 0.0
  const zC = -2.8 // 上側中間ノードC
  const zD = 2.8  // 下側中間ノードD
  const yWire = 0.05
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.3 })
  const wireRadius = 0.05

  // ブリッジ菱形配線 & 電源配線
  const wires = [
    // A -> C (R1)
    [new THREE.Vector3(xA, yWire, 0), new THREE.Vector3(xMid, yWire, zC)],
    // C -> B (R2)
    [new THREE.Vector3(xMid, yWire, zC), new THREE.Vector3(xB, yWire, 0)],
    // A -> D (R3)
    [new THREE.Vector3(xA, yWire, 0), new THREE.Vector3(xMid, yWire, zD)],
    // D -> B (R4)
    [new THREE.Vector3(xMid, yWire, zD), new THREE.Vector3(xB, yWire, 0)],
    // C -> D (検流計G ブリッジアーム)
    [new THREE.Vector3(xMid, yWire, zC), new THREE.Vector3(xMid, yWire, zD)],
    // 電源外側バイパス配線
    [new THREE.Vector3(xA, yWire, 0), new THREE.Vector3(xA, yWire, -3.8)],
    [new THREE.Vector3(xA, yWire, -3.8), new THREE.Vector3(xB, yWire, -3.8)],
    [new THREE.Vector3(xB, yWire, -3.8), new THREE.Vector3(xB, yWire, 0)]
  ]

  wires.forEach(([pA, pB]) => {
    const dir = new THREE.Vector3().subVectors(pB, pA)
    const len = dir.length()
    const geo = new THREE.CylinderGeometry(wireRadius, wireRadius, len, 12)
    geo.translate(0, len / 2, 0)
    const mesh = new THREE.Mesh(geo, wireMat)
    mesh.position.copy(pA)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    circuitWiresMeshGroup.add(mesh)
  })

  // 電源 E (外側配線中央)
  addBattery3D(0.0, yWire, -3.8, bridgeE.value, `E = ${bridgeE.value}V`)

  // 4抵抗
  addResistor3D(-2.2, yWire, -1.4, bridgeR1.value, `R₁ = ${bridgeR1.value}Ω`)
  addResistor3D(2.2, yWire, -1.4, bridgeR2.value, `R₂ = ${bridgeR2.value}Ω`)
  addResistor3D(-2.2, yWire, 1.4, bridgeR3.value, `R₃ = ${bridgeR3.value}Ω`)
  addResistor3D(2.2, yWire, 1.4, bridgeR4.value, `R₄ = ${bridgeR4.value}Ω`)

  // 3D 検流計 G
  build3DGalvanometer(xMid, yWire, 0.0)

  // 電子流
  spawnElectronsBranch(xA, 0, xMid, zC, brRes.value.I1)
  spawnElectronsBranch(xMid, zC, xB, 0, brRes.value.I2)
  spawnElectronsBranch(xA, 0, xMid, zD, brRes.value.I3)
  spawnElectronsBranch(xMid, zD, xB, 0, brRes.value.I4)
  if (Math.abs(brRes.value.IG) > 0.005) {
    spawnElectronsBranch(xMid, zC, xMid, zD, brRes.value.IG)
  }

  // 3D電位標高リリーフ
  if (showPotentialRelief.value) {
    buildBridgeRelief(xA, xB, xMid, zC, zD)
  }
}

// -------------------------------------------------------------
// 3D コンポーネント生成ヘルパー
// -------------------------------------------------------------
function addBattery3D(x, y, z, val, name) {
  const grp = new THREE.Group()
  grp.position.set(x, y, z)

  // バッテリー円柱本体
  const bMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.35,
    metalness: 0.6,
    roughness: 0.25
  })
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.75, 16), bMat)
  cyl.rotation.z = Math.PI / 2
  grp.add(cyl)

  // 正極端子 (+)
  const capMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 })
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16), capMat)
  cap.rotation.z = Math.PI / 2
  cap.position.x = 0.42
  grp.add(cap)

  if (showValuesLabels.value) {
    const lbl = createTextSprite(`${name} (${val}V)`, {
      color: '#fecdd3',
      bgColor: 'rgba(159, 18, 57, 0.8)',
      borderColor: '#fb7185',
      fontSize: 26,
      scale: 0.34
    })
    lbl.position.set(0, 0.55, 0)
    grp.add(lbl)
  }

  componentsGroup.add(grp)
}

function addResistor3D(x, y, z, val, name) {
  const grp = new THREE.Group()
  grp.position.set(x, y, z)

  // 抵抗器セラミックボディ
  const rMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.4,
    metalness: 0.1
  })
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16), rMat)
  cyl.rotation.x = Math.PI / 2
  grp.add(cyl)

  // カラーバンド
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 })
  const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.08, 16), bandMat)
  band1.rotation.x = Math.PI / 2
  band1.position.z = -0.2
  const band2 = band1.clone()
  band2.position.z = 0.2
  grp.add(band1, band2)

  if (showValuesLabels.value) {
    const lbl = createTextSprite(name.includes('Ω') ? name : `${name} (${val}Ω)`, {
      color: '#fef08a',
      bgColor: 'rgba(120, 53, 15, 0.8)',
      borderColor: '#fbbf24',
      fontSize: 26,
      scale: 0.34
    })
    lbl.position.set(0, 0.52, 0)
    grp.add(lbl)
  }

  componentsGroup.add(grp)
}

function build3DBulb(x, y, z) {
  const grp = new THREE.Group()
  grp.position.set(x, y, z)

  // ソケット金具
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.35, 16), baseMat)
  grp.add(baseMesh)

  // ガラス球体
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    transmission: 0.85
  })
  const glassMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), glassMat)
  glassMesh.position.y = 0.5
  grp.add(glassMesh)

  // フィラメント (電力 P に応じて発光)
  const pNorm = Math.min(1.0, Math.max(0.05, noRes.value.P / 8.0))
  const filMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.4 + pNorm * 1.6,
    roughness: 0.1
  })
  bulbFilamentMesh = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), filMat)
  bulbFilamentMesh.position.y = 0.5
  bulbFilamentMesh.rotation.x = Math.PI / 2
  grp.add(bulbFilamentMesh)

  // 電球ポイントライト
  bulbPointLight = new THREE.PointLight(0xfef08a, pNorm * 1.5, 6.0)
  bulbPointLight.position.y = 0.5
  grp.add(bulbPointLight)

  const lbl = createTextSprite(`電球 (${fmt(noRes.value.P, 1)}W)`, {
    color: '#fef08a',
    bgColor: 'rgba(120, 53, 15, 0.85)',
    borderColor: '#fbbf24',
    fontSize: 26,
    scale: 0.34
  })
  lbl.position.set(0, 1.25, 0)
  grp.add(lbl)

  componentsGroup.add(grp)
}

function build3DGalvanometer(x, y, z) {
  const grp = new THREE.Group()
  grp.position.set(x, y, z)

  // メーター台座
  const meterBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 1.0), meterBaseMat)
  grp.add(base)

  // 目盛文字盤
  const dialMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc })
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.65), dialMat)
  dial.rotation.x = -Math.PI / 2
  dial.position.y = 0.18
  grp.add(dial)

  // 振れる指針
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  const needleGeo = new THREE.BoxGeometry(0.04, 0.02, 0.45)
  needleGeo.translate(0, 0, 0.22)
  galvanometerNeedle = new THREE.Mesh(needleGeo, needleMat)
  galvanometerNeedle.position.set(0, 0.2, -0.2)
  // 指針の角度 (IG に応じて ±40度)
  const angle = Math.max(-0.7, Math.min(0.7, brRes.value.IG * 1.2))
  galvanometerNeedle.rotation.y = angle
  grp.add(galvanometerNeedle)

  const lbl = createTextSprite(brRes.value.balanced ? '検流計 G (平衡 0A)' : `検流計 G (${fmt(brRes.value.IG, 3)}A)`, {
    color: brRes.value.balanced ? '#4ade80' : '#f59e0b',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: brRes.value.balanced ? '#4ade80' : '#f59e0b',
    fontSize: 26,
    scale: 0.34
  })
  lbl.position.set(0, 0.8, 0)
  grp.add(lbl)

  componentsGroup.add(grp)
}

// -------------------------------------------------------------
// 電子ドリフト流の生成
// -------------------------------------------------------------
function spawnElectronsBranch(x1, z1, x2, z2, current) {
  if (!showElectrons.value || Math.abs(current) < 0.01) return

  const pA = new THREE.Vector3(x1, 0.06, z1)
  const pB = new THREE.Vector3(x2, 0.06, z2)
  const len = pA.distanceTo(pB)
  const numParticles = Math.max(3, Math.min(10, Math.round(len * 1.2)))

  const sign = current >= 0 ? 1 : -1
  const speed = Math.min(1.2, Math.max(0.15, Math.abs(current) * 0.35)) * sign

  for (let i = 0; i < numParticles; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.9
      })
    )
    electronsGroup.add(dot)

    electronPool.push({
      mesh: dot,
      start: pA,
      end: pB,
      t: i / numParticles,
      speed
    })
  }
}

// -------------------------------------------------------------
// 3D電位標高リリーフ (KVL ΣV = 0 登山道)
// -------------------------------------------------------------
function buildKirchhoffRelief(xL, xM, xR, zTop, zBot) {
  const vScale = 0.12 // 1V あたりの高さ [m]
  const vpY = kRes.value.VP * vScale
  const e1Y = E1.value * vScale
  const e2Y = E2.value * vScale

  // 左ループの標高リボン
  const ptsLeft = [
    new THREE.Vector3(xL, 0.1, zBot),          // 0V (基準)
    new THREE.Vector3(xL, e1Y, zBot * 0.3),     // 電源E1で一気に持ち上げ
    new THREE.Vector3(xL, e1Y, zTop),          // 電源出口
    new THREE.Vector3(xM, vpY, zTop),          // 抵抗R1で降下してVPへ
    new THREE.Vector3(xM, 0.1, zBot),          // 抵抗R3で降下して0Vへ
    new THREE.Vector3(xL, 0.1, zBot)           // 元の標高(0V)に帰還！
  ]
  addReliefCurtain(ptsLeft, 0x38bdf8)

  // 右ループの標高リボン
  const ptsRight = [
    new THREE.Vector3(xR, 0.1, zBot),
    new THREE.Vector3(xR, e2Y, zBot * 0.3),
    new THREE.Vector3(xR, e2Y, zTop),
    new THREE.Vector3(xM, vpY, zTop),
    new THREE.Vector3(xM, 0.1, zBot),
    new THREE.Vector3(xR, 0.1, zBot)
  ]
  addReliefCurtain(ptsRight, 0xc084fc)
}

function buildNonOhmicRelief(xL, xR, zTop, zBot) {
  const vScale = 0.14
  const eY = nonOhmicE.value * vScale
  const vlY = noRes.value.V * vScale

  const pts = [
    new THREE.Vector3(xL, 0.1, zBot),
    new THREE.Vector3(xL, eY, 0),
    new THREE.Vector3(xL, eY, zTop),
    new THREE.Vector3(xR, vlY, zTop), // 抵抗Rで降下
    new THREE.Vector3(xR, 0.1, zBot), // 電球で降下して0Vへ
    new THREE.Vector3(xL, 0.1, zBot)
  ]
  addReliefCurtain(pts, 0xf59e0b)
}

function buildBridgeRelief(xA, xB, xMid, zC, zD) {
  const vScale = 0.14
  const eY = bridgeE.value * vScale
  const vcY = brRes.value.VC * vScale
  const vdY = brRes.value.VD * vScale

  const ptsUpper = [
    new THREE.Vector3(xA, eY, 0),
    new THREE.Vector3(xMid, vcY, zC),
    new THREE.Vector3(xB, 0.1, 0)
  ]
  const ptsLower = [
    new THREE.Vector3(xA, eY, 0),
    new THREE.Vector3(xMid, vdY, zD),
    new THREE.Vector3(xB, 0.1, 0)
  ]
  addReliefCurtain(ptsUpper, 0x38bdf8)
  addReliefCurtain(ptsLower, 0xa78bfa)
}

function addReliefCurtain(pts, colHex) {
  // 3D 閉曲線ライン
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const lineMat = new THREE.LineBasicMaterial({ color: colHex, linewidth: 3 })
  const line = new THREE.Line(lineGeo, lineMat)
  reliefGroup.add(line)

  // 垂直カーテン（標高差の半透明壁）
  const vertices = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]
    const p2 = pts[i + 1]
    // 2つの三角形で四角形を形成
    vertices.push(
      p1.x, 0.05, p1.z,
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,

      p1.x, 0.05, p1.z,
      p2.x, p2.y, p2.z,
      p2.x, 0.05, p2.z
    )
  }
  const curtainGeo = new THREE.BufferGeometry()
  curtainGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  curtainGeo.computeVertexNormals()

  const curtainMat = new THREE.MeshBasicMaterial({
    color: colHex,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const curtainMesh = new THREE.Mesh(curtainGeo, curtainMat)
  reliefGroup.add(curtainMesh)
}

// ==========================================
// フレームアニメーション
// ==========================================
function updateSim(dt, elapsed) {
  if (!isPlaying.value) return

  const effDt = dt * timeScale.value

  // 電子ドリフト進行
  electronPool.forEach(el => {
    el.t = (el.t + effDt * el.speed)
    if (el.t < 0) el.t += 1.0
    el.t = el.t % 1.0
    el.mesh.position.lerpVectors(el.start, el.end, el.t)
  })

  // 電球の光のゆらぎ
  if (bulbPointLight && mode.value === 'nonOhmic') {
    const pNorm = Math.min(1.0, Math.max(0.05, noRes.value.P / 8.0))
    bulbPointLight.intensity = (pNorm * 1.5) + Math.sin(elapsed * 12) * 0.05
  }

  // 検流計指針の微動
  if (galvanometerNeedle && mode.value === 'bridge') {
    const targetAngle = Math.max(-0.7, Math.min(0.7, brRes.value.IG * 1.2))
    galvanometerNeedle.rotation.y = targetAngle + (brRes.value.balanced ? 0 : Math.sin(elapsed * 8) * 0.02)
  }
}

// 反応性ウォッチャー
watch(
  [
    mode,
    E1,
    E2,
    R1,
    R2,
    R3,
    nonOhmicE,
    nonOhmicR,
    nonOhmicK,
    bridgeE,
    bridgeR1,
    bridgeR2,
    bridgeR3,
    bridgeR4,
    showPotentialRelief,
    showElectrons,
    showValuesLabels
  ],
  () => {
    rebuildCircuit3D()
  }
)

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

/* モードタブ */
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

.btn-secondary {
  background: #1e293b;
  color: #cbd5e1;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px;
  border-radius: 10px;
}

.speed-label {
  font-size: 0.78rem;
  color: #38bdf8;
  font-weight: 600;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  gap: 4px;
}

.speed-btn-group button {
  padding: 3px 8px;
  font-size: 0.74rem;
  border-radius: 6px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: 700;
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

.stat-card .val.zero-k {
  color: #f43f5e;
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
