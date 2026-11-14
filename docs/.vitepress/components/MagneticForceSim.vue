<template>
  <div class="sim-container" :style="{ '--ac': '#ec4899' }">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧲</span>
        <h3 class="sim-title">3D 電磁力・平行電流間の力 & レール実験シミュレーター</h3>
        <span class="badge badge-rose">Three.js 3D Engine</span>
      </div>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'parallel' }"
          @click="setMode('parallel')"
        >
          平行電流間の力 (引力/斥力)
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'rails' }"
          @click="setMode('rails')"
        >
          磁場中の導線レール実験 (F = I L × B)
        </button>
      </div>
    </div>

    <p class="desc">
      {{ mode === 'parallel'
          ? '2本の平行導線に流れる電流が周囲に作る磁場リングと、相手導線に働くアンペール力 F を3D可視化。同方向電流で引力（内側たわみ）、逆方向電流で斥力（外側たわみ）が生じるメカニズムを検証します。'
          : '一様な磁場 B の中に置いた2本のレール上をスライドする可動導線（長さ L）。電流 I を流したときにフレミング左手の法則（F = I L × B）に従って生じる電磁力と導線の加速運動を検証します。' }}
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
          🔼 上面
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
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
      <button class="btn btn-secondary" @click="resetSimulation">🔄 リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <template v-if="mode === 'parallel'">
            <span class="legend-item">
              <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
              導線1 電流 <i>I</i><sub>1</sub>
            </span>
            <span class="legend-item">
              <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
              導線2 電流 <i>I</i><sub>2</sub>
            </span>
            <span class="legend-item">
              <i class="dot" style="background:#ec4899;box-shadow:0 0 6px #ec4899"></i>
              電磁力 <i>F</i><sub>1</sub>, <i>F</i><sub>2</sub>
            </span>
            <span class="legend-item">
              <i class="dot" style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
              磁束密度 <i>B</i><sub>1</sub>, <i>B</i><sub>2</sub>
            </span>
          </template>
          <template v-else>
            <span class="legend-item">
              <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
              中指: 電流 <i>I</i>
            </span>
            <span class="legend-item">
              <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
              人差し指: 磁場 <i>B</i>
            </span>
            <span class="legend-item">
              <i class="dot" style="background:#ec4899;box-shadow:0 0 6px #ec4899"></i>
              親指: 電磁力 <i>F</i>
            </span>
          </template>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D視点回転 ・ ホイールでズーム</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span v-if="mode === 'parallel'" class="three-status-badge" :class="isAttractive ? 'attract' : 'repel'">
        {{ isAttractive ? '🤝 同方向電流 → 引力（引き合う）: 導線間の磁場が打ち消し合い、外側の高圧部から引き寄せられます' : '💥 逆方向電流 → 斥力（反発する）: 導線間の磁場が強め合い、内側の高圧部から押し広げられます' }}
      </span>
      <span v-else class="three-status-badge info">
        ⚡ フレミング左手の法則: 中指(I = {{ railCurrent }}A) × 人差し指(B = {{ railB.toFixed(1) }}T) → 親指の力 F = {{ railForce.toFixed(2) }} N ({{ railForceDir > 0 ? '+Z 前進' : '-Z 後退' }})
      </span>
    </div>

    <!-- リアルタイム情報モニター -->
    <div class="stats-grid">
      <template v-if="mode === 'parallel'">
        <div class="stat-card">
          <div class="stat-label">単位長さあたりの力 <i>f</i></div>
          <div class="stat-value text-rose">{{ forceMicroN.toFixed(2) }} <span class="stat-unit">µN/m</span></div>
          <div class="stat-formula"><i>f</i> = <span class="frac"><span class="num"><i>μ</i><sub>0</sub> <i>I</i><sub>1</sub> <i>I</i><sub>2</sub></span><span class="den">2π<i>r</i></span></span></div>
        </div>

        <div class="stat-card">
          <div class="stat-label">導線2での磁場 <i>B</i><sub>1</sub></div>
          <div class="stat-value text-green">{{ field1MicroT.toFixed(2) }} <span class="stat-unit">µT</span></div>
          <div class="stat-formula">向き: {{ dir1 > 0 ? '⊗ 奥向き' : '⊙ 手前向き' }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">導線1での磁場 <i>B</i><sub>2</sub></div>
          <div class="stat-value text-green">{{ field2MicroT.toFixed(2) }} <span class="stat-unit">µT</span></div>
          <div class="stat-formula">向き: {{ dir2 > 0 ? '⊙ 手前向き' : '⊗ 奥向き' }}</div>
        </div>

        <div class="stat-card highlight">
          <div class="stat-label">作用・反作用の法則</div>
          <div class="stat-value text-rose"><i>F</i><sub>1</sub> = −<i>F</i><sub>2</sub></div>
          <div class="stat-formula">{{ isAttractive ? '内向き引力' : '外向き斥力' }}（大きさ等しい）</div>
        </div>
      </template>

      <template v-else>
        <div class="stat-card">
          <div class="stat-label">電磁力 <i>F</i> = <i>I L B</i></div>
          <div class="stat-value text-rose">{{ Math.abs(railForce).toFixed(2) }} <span class="stat-unit">N</span></div>
          <div class="stat-formula"><i>L</i> = 0.20 m (レール幅)</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">導線ロッドの加速度 <i>a</i></div>
          <div class="stat-value text-blue">{{ (Math.abs(railForce) / 0.1).toFixed(1) }} <span class="stat-unit">m/s²</span></div>
          <div class="stat-formula">ロッド質量 <i>m</i> = 0.10 kg</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">現在の速度 <i>v</i></div>
          <div class="stat-value text-yellow">{{ rodVelocity.toFixed(2) }} <span class="stat-unit">m/s</span></div>
          <div class="stat-formula">位置 <i>z</i> = {{ (rodZ * 0.05).toFixed(2) }} m</div>
        </div>

        <div class="stat-card highlight">
          <div class="stat-label">運動の向き</div>
          <div class="stat-value text-cyan">{{ railForceDir > 0 ? '⏩ 前進加速 (+Z)' : '⏪ 後退加速 (-Z)' }}</div>
          <div class="stat-formula">フレミング左手の親指向き</div>
        </div>
      </template>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <!-- 平行導線モード用コントロール -->
      <div v-if="mode === 'parallel'" class="controls-grid">
        <div class="control-group">
          <label class="control-label">
            <span>導線1の電流 <i>I</i><sub>1</sub>:</span>
            <span class="control-val text-blue">{{ current1 }} A ({{ dir1 > 0 ? '上向き ↑' : '下向き ↓' }})</span>
          </label>
          <input type="range" v-model.number="current1" min="1" max="20" step="1" class="sim-slider" />
          <div class="btn-group mt-2">
            <button class="select-btn" :class="{ active: dir1 > 0 }" @click="dir1 = 1">上向き ↑</button>
            <button class="select-btn" :class="{ active: dir1 < 0 }" @click="dir1 = -1">下向き ↓</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>導線2の電流 <i>I</i><sub>2</sub>:</span>
            <span class="control-val text-yellow">{{ current2 }} A ({{ dir2 > 0 ? '上向き ↑' : '下向き ↓' }})</span>
          </label>
          <input type="range" v-model.number="current2" min="1" max="20" step="1" class="sim-slider" />
          <div class="btn-group mt-2">
            <button class="select-btn" :class="{ active: dir2 > 0 }" @click="dir2 = 1">上向き ↑</button>
            <button class="select-btn" :class="{ active: dir2 < 0 }" @click="dir2 = -1">下向き ↓</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>導線間の距離 <i>r</i>:</span>
            <span class="control-val">{{ distanceCm }} cm</span>
          </label>
          <input type="range" v-model.number="distanceCm" min="4" max="25" step="1" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label"><span>表示オプション:</span></label>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: showFieldLines }" @click="showFieldLines = !showFieldLines">
              {{ showFieldLines ? '3D磁場リング: 表示' : '3D磁場リング: 非表示' }}
            </button>
            <button class="select-btn" :class="{ active: showFlemingGuide }" @click="showFlemingGuide = !showFlemingGuide">
              {{ showFlemingGuide ? 'フレミング座標軸: 表示' : 'フレミング座標軸: 非表示' }}
            </button>
          </div>
        </div>
      </div>

      <!-- レール実験モード用コントロール -->
      <div v-else class="controls-grid">
        <div class="control-group">
          <label class="control-label">
            <span>レール電流 <i>I</i>:</span>
            <span class="control-val text-yellow">{{ railCurrent }} A ({{ railCurrentDir > 0 ? '右向き +X' : '左向き -X' }})</span>
          </label>
          <input type="range" v-model.number="railCurrent" min="1" max="20" step="1" class="sim-slider" />
          <div class="btn-group mt-2">
            <button class="select-btn" :class="{ active: railCurrentDir > 0 }" @click="railCurrentDir = 1">右向き +X</button>
            <button class="select-btn" :class="{ active: railCurrentDir < 0 }" @click="railCurrentDir = -1">左向き -X</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>磁束密度 <i>B</i>:</span>
            <span class="control-val text-cyan">{{ railB.toFixed(1) }} T ({{ railBDir > 0 ? '上向き +Y' : '下向き -Y' }})</span>
          </label>
          <input type="range" v-model.number="railB" min="0.2" max="2.0" step="0.2" class="sim-slider" />
          <div class="btn-group mt-2">
            <button class="select-btn" :class="{ active: railBDir > 0 }" @click="railBDir = 1">上向き +Y (下N/上S)</button>
            <button class="select-btn" :class="{ active: railBDir < 0 }" @click="railBDir = -1">下向き -Y (上N/下S)</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label"><span>導線ロッド位置制御:</span></label>
          <div class="btn-group">
            <button class="select-btn" @click="resetRod">⏮ ロッドを中央に戻す</button>
            <button class="select-btn" :class="{ active: showFlemingGuide }" @click="showFlemingGuide = !showFlemingGuide">
              {{ showFlemingGuide ? 'フレミング左手ガイド: ON' : 'フレミング左手ガイド: OFF' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>アンペール力とフレミングの左手の法則</strong>:
      <ul>
        <li><strong>平行電流間の力</strong>: 電流1が距離 <i>r</i> に作る磁場は <i>B</i><sub>1</sub> = <span class="frac"><span class="num"><i>μ</i><sub>0</sub> <i>I</i><sub>1</sub></span><span class="den">2π<i>r</i></span></span>。これによって導線2の単位長さに働く力は <i>f</i> = <i>I</i><sub>2</sub> <i>B</i><sub>1</sub> = <span class="frac"><span class="num"><i>μ</i><sub>0</sub> <i>I</i><sub>1</sub> <i>I</i><sub>2</sub></span><span class="den">2π<i>r</i></span></span> となります。</li>
        <li><strong>フレミングの左手</strong>: 中指（電流 <i>I</i>）、人差し指（磁場 <i>B</i>）を直交させたとき、親指の向きが電磁力 <i>F</i> = <i>I L B</i> を指します。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const mode = ref('parallel') // 'parallel' | 'rails'
const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')

// 平行導線パラメータ
const current1 = ref(10) // A
const dir1 = ref(1) // 1: 上, -1: 下
const current2 = ref(10) // A
const dir2 = ref(1) // 1: 上, -1: 下
const distanceCm = ref(10) // cm (4..25)
const showFieldLines = ref(true)
const showFlemingGuide = ref(true)

// レール実験パラメータ
const railCurrent = ref(10) // A
const railCurrentDir = ref(1) // 1: +X, -1: -X
const railB = ref(1.0) // T
const railBDir = ref(1) // 1: +Y, -1: -Y
const rodZ = ref(0)
const rodVelocity = ref(0)

const threeContainer = ref(null)
let threeCtx = null
let scene = null
let modeGroup = null
let flemingGroup = null
let wireMesh1 = null
let wireMesh2 = null
let curParticles1 = []
let curParticles2 = []
let fieldRingsGroup = null

// 物理量計算
const isAttractive = computed(() => dir1.value * dir2.value > 0)

const forceMicroN = computed(() => {
  const rM = distanceCm.value * 0.01
  const f = (2e-7 * current1.value * current2.value) / rM
  return f * 1e6
})

const field1MicroT = computed(() => {
  const rM = distanceCm.value * 0.01
  return ((2e-7 * current1.value) / rM) * 1e6
})

const field2MicroT = computed(() => {
  const rM = distanceCm.value * 0.01
  return ((2e-7 * current2.value) / rM) * 1e6
})

const railForceDir = computed(() => {
  // F = I x B: (railCurrentDir, 0, 0) x (0, railBDir, 0) = (0, 0, railCurrentDir * railBDir)
  return railCurrentDir.value * railBDir.value
})

const railForce = computed(() => {
  // F = I L B (L = 0.20 m)
  return railCurrent.value * 0.20 * railB.value * railForceDir.value
})

function setMode(newMode) {
  mode.value = newMode
  rebuildScene()
}

function resetSimulation() {
  if (mode.value === 'parallel') {
    current1.value = 10
    dir1.value = 1
    current2.value = 10
    dir2.value = 1
    distanceCm.value = 10
  } else {
    resetRod()
  }
  setCameraPreset('3d')
}

function resetRod() {
  rodZ.value = 0
  rodVelocity.value = 0
}

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
  return { pos: [8.5 * ms, 7.5 * ms, 11.5 * ms], target: [0, 0, 0], fov: 38 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const params = getCamParams(preset)
  threeCtx.moveCameraTo(params.pos, params.target, duration, params.fov)
}

// ==========================================================
// 3D シーン構築
// ==========================================================
// 矢印参照
let forceArrow1 = null
let forceArrow2 = null
let bArrow1 = null
let bArrow2 = null
let railRodMesh = null

function rebuildScene() {
  if (!scene) return

  if (modeGroup) scene.remove(modeGroup)
  if (flemingGroup) scene.remove(flemingGroup)

  modeGroup = new THREE.Group()
  flemingGroup = new THREE.Group()
  scene.add(modeGroup)
  scene.add(flemingGroup)

  if (mode.value === 'parallel') {
    buildParallelScene()
  } else {
    buildRailsScene()
  }

  updateFlemingGuide()
}

// ----------------------------------------------------------
// 1. 平行導線モード (Parallel Wires)
// ----------------------------------------------------------
function buildParallelScene() {
  // 台座 & グリッド
  const baseGeo = new THREE.BoxGeometry(11, 0.12, 11)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.65,
    metalness: 0.1,
    roughness: 0.8
  })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  baseMesh.position.y = -3.8
  modeGroup.add(baseMesh)

  const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b)
  grid.position.y = -3.73
  modeGroup.add(grid)

  // 導線1 (左: シアン #38bdf8) & 導線2 (右: アンバー #fbbf24)
  const wireMat1 = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25, emissive: 0x38bdf8, emissiveIntensity: 0.25 })
  const wireMat2 = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.25, emissive: 0xfbbf24, emissiveIntensity: 0.25 })

  // 導線メッシュ生成（たわみシミュレーション用の初期ジオメトリ）
  wireMesh1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.2, 16), wireMat1)
  wireMesh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.2, 16), wireMat2)
  modeGroup.add(wireMesh1)
  modeGroup.add(wireMesh2)

  // 電流キャリア粒子
  const curGeo = new THREE.SphereGeometry(0.075, 8, 8)
  const curMat1 = new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
  const curMat2 = new THREE.MeshBasicMaterial({ color: 0xfef08a })

  curParticles1 = []
  curParticles2 = []
  for (let k = 0; k < 14; k++) {
    const p1 = new THREE.Mesh(curGeo, curMat1)
    const p2 = new THREE.Mesh(curGeo, curMat2)
    p1.userData = { yOffset: (k / 14) * 7.2 - 3.6 }
    p2.userData = { yOffset: (k / 14) * 7.2 - 3.6 }
    modeGroup.add(p1)
    modeGroup.add(p2)
    curParticles1.push(p1)
    curParticles2.push(p2)
  }

  // 磁場リンググループ
  fieldRingsGroup = new THREE.Group()
  modeGroup.add(fieldRingsGroup)

  // 力ベクトル矢印 (F1, F2: ローズピンク #ec4899)
  forceArrow1 = createVectorArrow3D({ color: 0xec4899, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
  forceArrow2 = createVectorArrow3D({ color: 0xec4899, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
  modeGroup.add(forceArrow1)
  modeGroup.add(forceArrow2)

  // 磁場ベクトル矢印 (B1 at wire2, B2 at wire1: エメラルドグリーン #10b981)
  bArrow1 = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.07, headRadius: 0.2, headLength: 0.5 })
  bArrow2 = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.07, headRadius: 0.2, headLength: 0.5 })
  modeGroup.add(bArrow1)
  modeGroup.add(bArrow2)

  updateParallelWiresGeometry()
}

// ----------------------------------------------------------
// 平行導線ジオメトリ・位置更新 (距離・たわみ・ベクトル)
// ----------------------------------------------------------
function updateParallelWiresGeometry() {
  if (mode.value !== 'parallel' || !wireMesh1) return

  // 距離スケール (4cm..25cm -> 1.4..5.8 scene units)
  const dSpan = 1.2 + (distanceCm.value / 25) * 4.6
  const x1 = -dSpan / 2
  const x2 = dSpan / 2

  // たわみ量計算 (引力なら内向き、斥力なら外向き)
  const fRatio = Math.min(0.45, (forceMicroN.value / 150) * 0.3)
  const bendDir = isAttractive.value ? 1 : -1

  // 導線1をベジェカーブでたわませる
  const pts1 = [
    new THREE.Vector3(x1, 3.6, 0),
    new THREE.Vector3(x1 + bendDir * fRatio, 0, 0),
    new THREE.Vector3(x1, -3.6, 0)
  ]
  const curve1 = new THREE.CatmullRomCurve3(pts1)
  wireMesh1.geometry.dispose()
  wireMesh1.geometry = new THREE.TubeGeometry(curve1, 32, 0.12, 12, false)

  // 導線2
  const pts2 = [
    new THREE.Vector3(x2, 3.6, 0),
    new THREE.Vector3(x2 - bendDir * fRatio, 0, 0),
    new THREE.Vector3(x2, -3.6, 0)
  ]
  const curve2 = new THREE.CatmullRomCurve3(pts2)
  wireMesh2.geometry.dispose()
  wireMesh2.geometry = new THREE.TubeGeometry(curve2, 32, 0.12, 12, false)

  // 力ベクトル矢印の更新
  const fLen = 1.0 + Math.min(2.2, (forceMicroN.value / 100) * 1.8)
  // F1 (wire 1): 引力なら+X (x1 -> x2), 斥力なら-X
  forceArrow1.setVector(
    new THREE.Vector3(x1 + bendDir * fRatio, 0, 0),
    new THREE.Vector3(isAttractive.value ? 1 : -1, 0, 0),
    fLen
  )
  // F2 (wire 2): 引力なら-X (x2 -> x1), 斥力なら+X
  forceArrow2.setVector(
    new THREE.Vector3(x2 - bendDir * fRatio, 0, 0),
    new THREE.Vector3(isAttractive.value ? -1 : 1, 0, 0),
    fLen
  )

  // 磁場ベクトル矢印の更新
  // B1 at wire2: dir1 > 0 -> -Z (奥), dir1 < 0 -> +Z (手前)
  const b1Len = 1.2 + Math.min(1.8, (field1MicroT.value / 100) * 1.5)
  bArrow1.setVector(
    new THREE.Vector3(x2, 0, 0),
    new THREE.Vector3(0, 0, -dir1.value),
    b1Len
  )

  // B2 at wire1: dir2 > 0 -> +Z (手前), dir2 < 0 -> -Z (奥)
  const b2Len = 1.2 + Math.min(1.8, (field2MicroT.value / 100) * 1.5)
  bArrow2.setVector(
    new THREE.Vector3(x1, 0, 0),
    new THREE.Vector3(0, 0, dir2.value),
    b2Len
  )

  // 3D 磁場リング更新
  if (fieldRingsGroup) {
    while (fieldRingsGroup.children.length > 0) {
      const c = fieldRingsGroup.children[0]
      if (c.geometry) c.geometry.dispose()
      fieldRingsGroup.remove(c)
    }

    if (showFieldLines.value) {
      // 導線1から広がるリング (Wire2に到達する半径 dSpan)
      const r1Geo = new THREE.TorusGeometry(dSpan, 0.025, 8, 48)
      const r1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
      const r1 = new THREE.Mesh(r1Geo, r1Mat)
      r1.rotation.x = Math.PI / 2
      r1.position.set(x1, 0, 0)
      fieldRingsGroup.add(r1)

      // 導線2から広がるリング
      const r2Geo = new THREE.TorusGeometry(dSpan, 0.025, 8, 48)
      const r2Mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.45 })
      const r2 = new THREE.Mesh(r2Geo, r2Mat)
      r2.rotation.x = Math.PI / 2
      r2.position.set(x2, 0, 0)
      fieldRingsGroup.add(r2)
    }
  }
}

// ----------------------------------------------------------
// 2. 磁場中の導線レール実験 (Wire on Magnetic Rails)
// ----------------------------------------------------------
function buildRailsScene() {
  const railLength = 9.0
  const railSpan = 3.6

  // 基板
  const baseGeo = new THREE.BoxGeometry(6.5, 0.15, railLength + 1.2)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  baseMesh.position.y = -0.55
  modeGroup.add(baseMesh)

  const grid = new THREE.GridHelper(railLength, 18, 0x38bdf8, 0x1e293b)
  grid.position.y = -0.47
  modeGroup.add(grid)

  // 2本の金属レール (銅製・Z軸方向)
  const railGeo = new THREE.CylinderGeometry(0.09, 0.09, railLength, 16)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.2
  })

  const railLeft = new THREE.Mesh(railGeo, railMat)
  railLeft.rotation.x = Math.PI / 2
  railLeft.position.set(-railSpan / 2, 0, 0)
  modeGroup.add(railLeft)

  const railRight = new THREE.Mesh(railGeo, railMat)
  railRight.rotation.x = Math.PI / 2
  railRight.position.set(railSpan / 2, 0, 0)
  modeGroup.add(railRight)

  // スライドする導線ロッド (アルミニウム/銅ロッド・X軸方向)
  const rodGeo = new THREE.CylinderGeometry(0.14, 0.14, railSpan + 0.8, 16)
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xec4899,
    emissiveIntensity: 0.35
  })
  railRodMesh = new THREE.Mesh(rodGeo, rodMat)
  railRodMesh.rotation.z = Math.PI / 2
  railRodMesh.position.set(0, 0.14, 0)
  modeGroup.add(railRodMesh)

  // 一様磁場 B の矢印群 (上下方向)
  const bArrowGroup = new THREE.Group()
  const bSpacing = 1.6
  for (let x = -railSpan * 0.35; x <= railSpan * 0.35; x += bSpacing) {
    for (let z = -railLength * 0.38; z <= railLength * 0.38; z += bSpacing) {
      const arr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.05, headRadius: 0.14, headLength: 0.38, opacity: 0.7 })
      arr.setVector(
        new THREE.Vector3(x, railBDir.value > 0 ? -1.8 : 1.8, z),
        new THREE.Vector3(0, railBDir.value, 0),
        3.4
      )
      bArrowGroup.add(arr)
    }
  }
  modeGroup.add(bArrowGroup)

  // 電源・極性マーク
  const batLabel = createTextSprite('DC 直流電源', { color: '#fbbf24', fontSize: 28, scale: 0.42 })
  batLabel.position.set(0, 0.2, -railLength / 2 - 0.5)
  modeGroup.add(batLabel)
}

// ----------------------------------------------------------
// フレミング左手の法則 3D 座標ガイド更新
// ----------------------------------------------------------
function updateFlemingGuide() {
  if (!flemingGroup) return
  flemingGroup.visible = showFlemingGuide.value

  while (flemingGroup.children.length > 0) {
    const c = flemingGroup.children[0]
    flemingGroup.remove(c)
  }

  if (mode.value === 'parallel') {
    // 平行導線モードでのフレミング座標軸 (導線2に配置)
    const dSpan = 1.2 + (distanceCm.value / 25) * 4.6
    const x2 = dSpan / 2
    const origin = new THREE.Vector3(x2, 0.8, 0)

    // 中指: 電流 I2
    const iArr = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.07, headRadius: 0.2, headLength: 0.5 })
    iArr.setVector(origin, new THREE.Vector3(0, dir2.value, 0), 1.8)
    flemingGroup.add(iArr)

    // 人差し指: 磁場 B1
    const bArr = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.07, headRadius: 0.2, headLength: 0.5 })
    bArr.setVector(origin, new THREE.Vector3(0, 0, -dir1.value), 1.8)
    flemingGroup.add(bArr)

    // 親指: 力 F2
    const fArr = createVectorArrow3D({ color: 0xec4899, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
    fArr.setVector(origin, new THREE.Vector3(isAttractive.value ? -1 : 1, 0, 0), 1.8)
    flemingGroup.add(fArr)

    const label = createTextSprite('フレミング左手 (I₂, B₁, F₂)', { color: '#f8fafc', fontSize: 26, scale: 0.38 })
    label.position.set(x2 + 0.6, 2.2, 0)
    flemingGroup.add(label)
  } else {
    // レール実験モードでのフレミング座標軸 (ロッド上に配置)
    const origin = new THREE.Vector3(0, 0.3, rodZ.value)

    // 中指: 電流 I (X軸)
    const iArr = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
    iArr.setVector(origin, new THREE.Vector3(railCurrentDir.value, 0, 0), 2.0)
    flemingGroup.add(iArr)

    // 人差し指: 磁場 B (Y軸)
    const bArr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.08, headRadius: 0.22, headLength: 0.55 })
    bArr.setVector(origin, new THREE.Vector3(0, railBDir.value, 0), 2.0)
    flemingGroup.add(bArr)

    // 親指: 電磁力 F (Z軸)
    const fArr = createVectorArrow3D({ color: 0xec4899, shaftRadius: 0.09, headRadius: 0.24, headLength: 0.6 })
    fArr.setVector(origin, new THREE.Vector3(0, 0, railForceDir.value), 2.2)
    flemingGroup.add(fArr)

    const fLabel = createTextSprite('親指: 電磁力 F = I L × B', { color: '#ec4899', borderColor: '#ec4899', fontSize: 28, scale: 0.42 })
    fLabel.position.set(0, 1.4, rodZ.value + railForceDir.value * 1.5)
    flemingGroup.add(fLabel)
  }
}

// ==========================================================
// 毎フレーム アニメーション処理 (onFrame)
// ==========================================================
function onFrame(dt) {
  if (!isPlaying.value) return

  const effectiveDt = dt * timeScale.value

  if (mode.value === 'parallel') {
    // 電流キャリア粒子の移動
    const dSpan = 1.2 + (distanceCm.value / 25) * 4.6
    const x1 = -dSpan / 2
    const x2 = dSpan / 2

    curParticles1.forEach(p => {
      p.userData.yOffset += dir1.value * effectiveDt * 3.5
      if (p.userData.yOffset > 3.6) p.userData.yOffset = -3.6
      if (p.userData.yOffset < -3.6) p.userData.yOffset = 3.6
      p.position.set(x1, p.userData.yOffset, 0)
    })

    curParticles2.forEach(p => {
      p.userData.yOffset += dir2.value * effectiveDt * 3.5
      if (p.userData.yOffset > 3.6) p.userData.yOffset = -3.6
      if (p.userData.yOffset < -3.6) p.userData.yOffset = 3.6
      p.position.set(x2, p.userData.yOffset, 0)
    })
  } else {
    // レール実験モード: 導線ロッドの物理加速運動
    const m = 0.10 // kg
    const accel = railForce.value / m // m/s^2 (scene units)
    rodVelocity.value += accel * effectiveDt * 0.4
    // 摩擦・減速
    rodVelocity.value *= 0.985
    rodZ.value += rodVelocity.value * effectiveDt * 1.8

    // レール終端でのバウンス / ループリセット
    const maxZ = 4.0
    if (rodZ.value > maxZ) {
      rodZ.value = maxZ
      rodVelocity.value = -rodVelocity.value * 0.3
    } else if (rodZ.value < -maxZ) {
      rodZ.value = -maxZ
      rodVelocity.value = -rodVelocity.value * 0.3
    }

    if (railRodMesh) {
      railRodMesh.position.z = rodZ.value
    }
    updateFlemingGuide()
  }
}

watch([current1, dir1, current2, dir2, distanceCm, showFieldLines], () => {
  updateParallelWiresGeometry()
  updateFlemingGuide()
})

watch([railCurrent, railCurrentDir, railB, railBDir, showFlemingGuide], () => {
  if (mode.value === 'rails') {
    rebuildScene()
  } else {
    updateFlemingGuide()
  }
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 38,
    initialCamPos: [8.5, 7.5, 11.5],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame
  })
  scene = threeCtx.scene

  rebuildScene()
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
  border: 1px solid rgba(236, 72, 153, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(236, 72, 153, 0.1);
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
  font-size: 1.12rem;
  font-weight: 700;
  color: #f8fafc;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}

.badge-rose {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
  border: 1px solid rgba(236, 72, 153, 0.35);
}

.sim-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: #ec4899;
  color: #f8fafc;
}

.tab-btn.active {
  background: rgba(236, 72, 153, 0.2);
  border-color: #ec4899;
  color: #ec4899;
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
  border-color: #ec4899;
  color: #e2e8f0;
}

.chip-btn.active {
  background: rgba(236, 72, 153, 0.2);
  border-color: #ec4899;
  color: #ec4899;
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
  background: #ec4899;
  color: #ffffff;
  font-weight: 700;
  border-color: #ec4899;
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
  background: #ec4899;
  color: #ffffff;
}

.btn-primary:hover {
  background: #f472b6;
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-secondary:hover {
  border-color: #ec4899;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(236, 72, 153, 0.2);
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

.three-status-badge.attract {
  background: rgba(16, 185, 129, 0.15);
  border-left: 3px solid #10b981;
  color: #6ee7b7;
}

.three-status-badge.repel {
  background: rgba(236, 72, 153, 0.15);
  border-left: 3px solid #ec4899;
  color: #f472b6;
}

.three-status-badge.info {
  background: rgba(56, 189, 248, 0.15);
  border-left: 3px solid #38bdf8;
  color: #7dd3fc;
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
  border-color: rgba(236, 72, 153, 0.4);
  background: rgba(236, 72, 153, 0.05);
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
  color: #38bdf8;
}

.text-yellow {
  color: #fbbf24;
}

.text-rose {
  color: #ec4899;
}

.text-green {
  color: #10b981;
}

.text-cyan {
  color: #22d3ee;
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

.sim-slider {
  width: 100%;
  accent-color: #ec4899;
  cursor: pointer;
}

.btn-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.mt-2 {
  margin-top: 0.4rem;
}

.select-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  padding: 0.3rem 0.65rem;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  border-color: #ec4899;
  color: #ec4899;
}

.select-btn.active {
  background: rgba(236, 72, 153, 0.2);
  border-color: #ec4899;
  color: #ec4899;
}

.sim-footer-note {
  background: rgba(15, 23, 42, 0.5);
  border-left: 3px solid #ec4899;
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
