<template>
  <div class="decay-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>☢️ 3D 放射性崩壊・半減期・放射線シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="desc">
        原子核の確率的な崩壊による半減期 <i>N</i>(<i>t</i>) = <i>N</i><sub>0</sub> (<span class="frac"><span class="num">1</span><span class="den">2</span></span>)<sup><span class="frac" style="font-size:0.75em"><span class="num"><i>t</i></span><span class="den"><i>T</i></span></span></sup> の指数関数的減衰と娘核の蓄積 <i>D</i>(<i>t</i>)、および α 線・β 線・γ 線の透過力・遮蔽実験を3D空間でリアルタイムに体験できます。
      </p>
    </div>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'decay' }" @click="setMode('decay')">
        ① 半減期と原子核崩壊（確率シミュレーション）
      </button>
      <button :class="{ active: mode === 'penetration' }" @click="setMode('penetration')">
        ② 放射線の種類と物質の透過力（遮蔽実験）
      </button>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCamera('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCamera('front')">
          📐 正面断面 (fov=14)
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCamera('top')">
          🔼 上面 (fov=14)
        </button>
      </div>
      <div class="preset-group" v-if="mode === 'decay'">
        <button class="chip-btn" :class="{ active: showBursts }" @click="showBursts = !showBursts">
          {{ showBursts ? '✨ α/β/γ 放出バースト: ON' : '✨ α/β/γ 放出バースト: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn-play" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button v-if="mode === 'decay'" class="reset-btn" @click="resetDecay">
        🔄 実験をリセットして再スタート
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap three-stage">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend" v-if="mode === 'decay'">
          <span class="legend-item"><i class="dot-parent"></i><span class="legend-text">親核 <i>N</i>(<i>t</i>) (未崩壊)</span></span>
          <span class="legend-item"><i class="dot-daughter"></i><span class="legend-text">娘核 <i>D</i>(<i>t</i>) (崩壊済)</span></span>
          <span class="legend-item"><i class="dot-burst"></i><span class="legend-text">α / β / γ 放出</span></span>
          <span class="legend-item"><i class="dot-halflife"></i><span class="legend-text">半減期 <i>T</i><sub>1/2</sub> マーカー</span></span>
        </div>
        <div class="three-hud-legend" v-else>
          <span class="legend-item"><i class="dot-alpha"></i><span class="legend-text">α線 (紙で遮蔽)</span></span>
          <span class="legend-item"><i class="dot-beta"></i><span class="legend-text">β線 (アルミで遮蔽)</span></span>
          <span class="legend-item"><i class="dot-gamma"></i><span class="legend-text">γ線 (鉛で減衰)</span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- ビューポート外ステータスストリップ -->
    <div class="mode-status-strip">
      <span class="state-badge" v-if="mode === 'decay'">
        半減期 <i>T</i><sub>1/2</sub> = {{ halfLife }}s ・ 経過 {{ (simTime / halfLife).toFixed(2) }} 周期 ・ 残存 {{ activeNucleiCount }} / {{ initialCount }} 個 ({{ ((activeNucleiCount / initialCount) * 100).toFixed(1) }}%)
      </span>
      <span class="state-badge" v-else>
        {{ radiationInfo.name }} — {{ radiationInfo.shield }}
      </span>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <!-- モード1: 崩壊 -->
      <div v-if="mode === 'decay'" class="controls-grid">
        <div class="control-group">
          <label><span>半減期 <i>T</i>:</span> <strong>{{ halfLife }} 秒</strong></label>
          <input type="range" v-model.number="halfLife" min="2" max="15" step="1" />
        </div>
        <div class="control-group">
          <label><span>初期原子核数 <i>N</i><sub>0</sub>:</span> <strong>{{ initialCount }} 個</strong></label>
          <input type="range" v-model.number="initialCount" min="100" max="600" step="50" @change="resetDecay" />
        </div>
        <div class="control-group">
          <label><span>放出放射線の種類:</span> <strong>{{ decayEmitLabel }}</strong></label>
          <div class="radio-buttons">
            <button :class="{ active: decayEmitType === 'mixed' }" @click="decayEmitType = 'mixed'">α/β/γ 混合</button>
            <button :class="{ active: decayEmitType === 'alpha' }" @click="decayEmitType = 'alpha'">α 崩壊</button>
            <button :class="{ active: decayEmitType === 'beta' }" @click="decayEmitType = 'beta'">β⁻ 崩壊</button>
            <button :class="{ active: decayEmitType === 'gamma' }" @click="decayEmitType = 'gamma'">γ 崩壊</button>
          </div>
        </div>
      </div>

      <!-- モード2: 透過力 -->
      <div v-if="mode === 'penetration'" class="controls-grid">
        <div class="control-group">
          <label>放射線の線源：</label>
          <div class="radio-buttons">
            <button :class="{ active: radiationType === 'alpha' }" @click="setRadiation('alpha')">
              α 線 (He原子核)
            </button>
            <button :class="{ active: radiationType === 'beta' }" @click="setRadiation('beta')">
              β 線 (高速電子)
            </button>
            <button :class="{ active: radiationType === 'gamma' }" @click="setRadiation('gamma')">
              γ 線 (電磁波)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <template v-if="mode === 'decay'">
        <div class="stat-card">
          <span class="label">経過時間 <i>t</i></span>
          <span class="val highlight">{{ simTime.toFixed(1) }} 秒</span>
        </div>
        <div class="stat-card">
          <span class="label">現在の残存原子核数 <i>N</i>(<i>t</i>)</span>
          <span class="val highlight-alt">{{ activeNucleiCount }} / {{ initialCount }} 個</span>
        </div>
        <div class="stat-card">
          <span class="label">生成された娘核数 <i>D</i>(<i>t</i>)</span>
          <span class="val" style="color: #c084fc">{{ initialCount - activeNucleiCount }} 個</span>
        </div>
        <div class="stat-card">
          <span class="label">残存割合 <span class="frac"><span class="num"><i>N</i></span><span class="den"><i>N</i><sub>0</sub></span></span></span>
          <span class="val">{{ ((activeNucleiCount / initialCount) * 100).toFixed(1) }} %</span>
        </div>
        <div class="stat-card">
          <span class="label">理論値 <i>N</i><sub>0</sub>(<span class="frac"><span class="num">1</span><span class="den">2</span></span>)<sup><span class="frac" style="font-size:0.75em"><span class="num"><i>t</i></span><span class="den"><i>T</i></span></span></sup></span>
          <span class="val">{{ theoryCount.toFixed(0) }} 個</span>
        </div>
        <div class="stat-card">
          <span class="label">経過半減期数 <span class="frac"><span class="num"><i>t</i></span><span class="den"><i>T</i></span></span></span>
          <span class="val">{{ (simTime / halfLife).toFixed(2) }} 周期</span>
        </div>
      </template>

      <template v-if="mode === 'penetration'">
        <div class="stat-card">
          <span class="label">放射線の種類</span>
          <span class="val highlight">{{ radiationInfo.name }}</span>
        </div>
        <div class="stat-card">
          <span class="label">正体</span>
          <span class="val">{{ radiationInfo.identity }}</span>
        </div>
        <div class="stat-card">
          <span class="label">電荷 / 質量数</span>
          <span class="val">{{ radiationInfo.charge }}</span>
        </div>
        <div class="stat-card">
          <span class="label">遮蔽に必要な物質</span>
          <span class="val highlight-alt">{{ radiationInfo.shield }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let resizeObs = null
let lastIsMob = false

const mode = ref('decay')
const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)
const showBursts = ref(true)

// モード1: 崩壊パラメーター
const halfLife = ref(6) // 秒
const initialCount = ref(400)
const decayEmitType = ref('mixed') // 'mixed' | 'alpha' | 'beta' | 'gamma'
const simTime = ref(0)
const activeNucleiCount = ref(400)
const nucleiData = []
const historyData = []

// モード2: 透過力パラメーター
const radiationType = ref('alpha') // 'alpha' | 'beta' | 'gamma'

const decayEmitLabel = computed(() => {
  if (decayEmitType.value === 'alpha') return 'α線 (⁴He)'
  if (decayEmitType.value === 'beta') return 'β⁻線 (高速電子)'
  if (decayEmitType.value === 'gamma') return 'γ線 (光子)'
  return 'α / β / γ 混合'
})

const radiationInfo = computed(() => {
  if (radiationType.value === 'alpha') {
    return {
      name: 'α線 (アルファ線)',
      identity: 'ヘリウム原子核 (⁴₂He)',
      charge: '電荷 +2e / 質量数 4',
      shield: '紙1枚で完全遮蔽'
    }
  }
  if (radiationType.value === 'beta') {
    return {
      name: 'β線 (ベータ線)',
      identity: '高速の電子 (⁰₋₁e)',
      charge: '電荷 -e / 質量数 0',
      shield: '数mmのアルミニウム板で遮蔽'
    }
  }
  return {
    name: 'γ線 (ガンマ線)',
    identity: '高エネルギー電磁波 (光子)',
    charge: '電荷 0 / 質量数 0',
    shield: '分厚い鉛・コンクリートで減衰'
  }
})

const theoryCount = computed(() => {
  return initialCount.value * Math.pow(0.5, simTime.value / halfLife.value)
})

function setMode(m) {
  mode.value = m
  syncModeVisibility()
}

function setRadiation(t) {
  radiationType.value = t
  clearPenetrationRays()
  syncPenetrationLabels()
}

// ==========================================================
// モバイル判定・カメラプリセット・キャッシュラベル
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35)
    ? Math.min(2.15, Math.max(1.48, 1.82 / Math.max(0.7, aspect)))
    : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0.05, 0.05, 41.0 * ms], target: [0.05, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.05, 42.0 * ms, 0.15], target: [0.05, 0, 0], fov: 14 }
  }
  return { pos: [0.2 * ms, 4.3 * ms, 13.4 * ms], target: [0.05, 0.05, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  syncModeVisibility()
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.44) {
  const mult = isMobileViewport() ? 1.56 : 1.0
  const sig = `${textStr}|${color}|${borderColor}|${mult}`
  if (labelCache.get(sprite) !== sig) {
    labelCache.set(sprite, sig)
    sprite.updateText(textStr, color, borderColor)
  }
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  if (Math.abs(sprite.scale.y - h) > 0.004) {
    sprite.scale.set(h * asp, h, 1)
  }
}

// ==========================================================
// 動的 3D 曲線チューブビルダー (GCゼロ)
// ==========================================================
function buildDynamicTube(maxSegments, radius, material) {
  const radialSegs = 8
  const vertCount = (maxSegments + 1) * (radialSegs + 1)
  const positions = new Float32Array(vertCount * 3)
  const normals = new Float32Array(vertCount * 3)
  const indices = []
  for (let i = 0; i < maxSegments; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j
      const b = (i + 1) * (radialSegs + 1) + j
      const c = (i + 1) * (radialSegs + 1) + j + 1
      const d = i * (radialSegs + 1) + j + 1
      indices.push(a, b, d, b, c, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setIndex(indices)
  geo.setDrawRange(0, 0)
  const mesh = new THREE.Mesh(geo, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 3

  function updatePoints(pts, activeCount) {
    const n = Math.min(maxSegments + 1, activeCount)
    if (n < 2) {
      geo.setDrawRange(0, 0)
      return
    }
    for (let i = 0; i < n; i++) {
      const pPrev = pts[Math.max(0, i - 1)]
      const pNext = pts[Math.min(n - 1, i + 1)]
      let tx = pNext.x - pPrev.x
      let ty = pNext.y - pPrev.y
      const len = Math.hypot(tx, ty) || 1
      tx /= len
      ty /= len
      const nx = -ty
      const ny = tx
      for (let j = 0; j <= radialSegs; j++) {
        const th = (j / radialSegs) * Math.PI * 2
        const c = Math.cos(th)
        const s = Math.sin(th)
        const vx = c * nx
        const vy = c * ny
        const vz = s
        const idx = (i * (radialSegs + 1) + j) * 3
        positions[idx] = pts[i].x + radius * vx
        positions[idx + 1] = pts[i].y + radius * vy
        positions[idx + 2] = pts[i].z + radius * vz
        normals[idx] = vx
        normals[idx + 1] = vy
        normals[idx + 2] = vz
      }
    }
    geo.getAttribute('position').needsUpdate = true
    geo.getAttribute('normal').needsUpdate = true
    geo.setDrawRange(0, (n - 1) * radialSegs * 6)
  }

  return { mesh, updatePoints }
}

// ==========================================================
// 3D シーン構築
// ==========================================================
let sceneObjs = null
const MAX_NUCLEI = 600
const MAX_BURSTS = 42
const MAX_RAYS = 30
const CURVE_SAMPLES = 96

const COL_PARENT = new THREE.Color(0x10b981)
const COL_PARENT_CYAN = new THREE.Color(0x22d3ee)
const COL_DAUGHTER_AMBER = new THREE.Color(0xf59e0b)
const COL_DAUGHTER_VIOLET = new THREE.Color(0xa855f7)

function resetDecay() {
  simTime.value = 0
  nucleiData.length = 0
  historyData.length = 0

  const n = initialCount.value
  const cols = Math.ceil(Math.cbrt(n * 1.15))
  const rows = Math.ceil(Math.cbrt(n * 1.0))
  const layers = Math.ceil(n / (cols * rows))
  const span = 2.55

  for (let i = 0; i < n; i++) {
    const layer = Math.floor(i / (cols * rows))
    const rem = i % (cols * rows)
    const r = Math.floor(rem / cols)
    const c = rem % cols

    const nx = cols > 1 ? (c / (cols - 1) - 0.5) * span : 0
    const ny = rows > 1 ? (r / (rows - 1) - 0.5) * span : 0
    const nz = layers > 1 ? (layer / (layers - 1) - 0.5) * span : 0

    nucleiData.push({
      x: nx + (Math.random() - 0.5) * 0.08,
      y: ny + (Math.random() - 0.5) * 0.08 + 0.12,
      z: nz + (Math.random() - 0.5) * 0.08,
      decayed: false,
      decayAge: 0,
      daughterTint: Math.random()
    })
  }

  activeNucleiCount.value = n
  historyData.push({ t: 0, nCount: n, dCount: 0 })

  if (sceneObjs) {
    sceneObjs.bursts.forEach((b) => {
      b.life = 0
      b.particle.visible = false
      b.ring.visible = false
    })
    sceneObjs.floorPulse = [0, 0, 0]
    rebuildTheoryCurve()
    updateDecayVisuals(0)
  }
}

function rebuildTheoryCurve() {
  if (!sceneObjs) return
  const { theoryTube, theoryPts, axX0, axY0, axW, axH, hlMarkers } = sceneObjs
  const T = halfLife.value
  const maxT = T * 3.2
  const N0 = initialCount.value

  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const t = (i / CURVE_SAMPLES) * maxT
    const frac = Math.pow(0.5, t / T)
    theoryPts[i].set(axX0 + (t / maxT) * axW, axY0 + frac * axH, 0.04)
  }
  theoryTube.updatePoints(theoryPts, CURVE_SAMPLES + 1)

  // 1T, 2T, 3T 垂直マーカー更新
  for (let k = 1; k <= 3; k++) {
    const m = hlMarkers[k - 1]
    const tx = axX0 + ((k * T) / maxT) * axW
    const frac = Math.pow(0.5, k)
    const ny = axY0 + frac * axH
    const vArr = m.vLine.geometry.getAttribute('position').array
    vArr[0] = tx; vArr[1] = axY0; vArr[2] = 0.02
    vArr[3] = tx; vArr[4] = axY0 + axH; vArr[5] = 0.02
    m.vLine.geometry.getAttribute('position').needsUpdate = true
    m.vLine.computeLineDistances()

    const hArr = m.hLine.geometry.getAttribute('position').array
    hArr[0] = axX0; hArr[1] = ny; hArr[2] = 0.02
    hArr[3] = tx; hArr[4] = ny; hArr[5] = 0.02
    m.hLine.geometry.getAttribute('position').needsUpdate = true
    m.hLine.computeLineDistances()

    m.dot.position.set(tx, ny, 0.07)
    m.label.position.set(tx, axY0 - 0.32, 0.14)
    updateLabelCached(m.label, `${k}T (${k * T}s)`, '#fde68a', 'rgba(251,191,36,0.55)', 0.34)
  }

  void N0
}

function clearPenetrationRays() {
  if (!sceneObjs) return
  sceneObjs.rays.forEach((r) => {
    r.active = false
    r.mesh.visible = false
  })
  sceneObjs.rayTimer = 0
}

function syncPenetrationLabels() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const { labelPenBanner } = sceneObjs
  let txt = ''
  let col = '#fca5a5'
  let bdr = '#ef4444'
  if (radiationType.value === 'alpha') {
    txt = mob ? 'α線: 紙1枚で遮蔽' : 'α線 (⁴He): 電離作用最強・紙1枚で完全遮蔽'
    col = '#fda4af'; bdr = '#fb7185'
  } else if (radiationType.value === 'beta') {
    txt = mob ? 'β線: アルミ板で遮蔽' : 'β線 (高速電子): 紙を通過・アルミ板(5mm)で遮蔽'
    col = '#7dd3fc'; bdr = '#38bdf8'
  } else {
    txt = mob ? 'γ線: 鉛ブロックで減衰' : 'γ線 (高エネルギー光子): 紙・アルミを通過・鉛(10cm)で減衰'
    col = '#d8b4fe'; bdr = '#a855f7'
  }
  updateLabelCached(labelPenBanner, txt, col, bdr, 0.44)
}

function syncModeVisibility() {
  if (!sceneObjs) return
  const isDecay = mode.value === 'decay'
  const isTop = activeCam.value === 'top'
  const mob = isMobileViewport()

  sceneObjs.decayRootGroup.visible = isDecay
  sceneObjs.penetrationRootGroup.visible = !isDecay

  sceneObjs.labelGraphTitle.visible = isDecay && !isTop
  sceneObjs.labelCurveLegend.visible = isDecay && !isTop
  sceneObjs.hlMarkers.forEach((m) => {
    m.label.visible = isDecay && !isTop
  })
  sceneObjs.labelLattice.visible = isDecay

  updateLabelCached(
    sceneObjs.labelLattice,
    mob ? '☢️ 3D 核種格子' : '☢️ 3D 放射性原子核格子',
    '#6ee7b7',
    '#10b981',
    0.44
  )
  updateLabelCached(
    sceneObjs.labelGraphTitle,
    mob ? '📊 N(t) & D(t) 曲線' : '📊 残存親核 N(t) と 蓄積娘核 D(t)',
    '#f8fafc',
    'rgba(56,189,248,0.45)',
    0.44
  )
  updateLabelCached(
    sceneObjs.labelCurveLegend,
    mob ? 'N(t)緑 / D(t)橙紫' : '実線: 親核N(t) ・ 蓄積: 娘核D(t)',
    '#cbd5e1',
    'rgba(148,163,184,0.4)',
    0.36
  )
  syncPenetrationLabels()
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 160,
    onFrame: (dt, elapsed) => {
      updateFrame(dt, elapsed)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCamera(activeCam.value, 0)
        syncModeVisibility()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.45, 0)
  scene.add(floorGrid)

  // ======================================================
  // モード1: 3D 原子核格子 + 半減期リング + 3D N(t)/D(t) 曲線
  // ======================================================
  const decayRootGroup = new THREE.Group()
  scene.add(decayRootGroup)

  const latticeGroup = new THREE.Group()
  latticeGroup.position.set(-3.15, 0.12, 0)
  decayRootGroup.add(latticeGroup)

  // 半透明格納ガラスボックス
  const boxSize = 3.15
  const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
  const boxMesh = new THREE.Mesh(
    boxGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.09,
      roughness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  boxMesh.position.set(0, 0.12, 0)
  boxMesh.renderOrder = 1
  latticeGroup.add(boxMesh)

  const boxEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(boxGeo),
    new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.85 })
  )
  boxEdges.position.set(0, 0.12, 0)
  latticeGroup.add(boxEdges)

  // 光る半減期フロアリング (1T, 2T, 3T)
  const floorRings = []
  ;[1.15, 1.55, 1.95].forEach((rad, idx) => {
    const mat = new THREE.MeshBasicMaterial({
      color: idx === 0 ? 0x22d3ee : idx === 1 ? 0xfbbf24 : 0xa855f7,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(rad - 0.06, rad, 48).rotateX(-Math.PI / 2),
      mat
    )
    ring.position.set(0, -1.82, 0)
    latticeGroup.add(ring)
    floorRings.push({ ring, mat })
  })

  // InstancedMesh 原子核 (最大600個)
  const nucGeo = new THREE.SphereGeometry(0.11, 14, 14)
  const nucMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.15
  })
  const instNuclei = new THREE.InstancedMesh(nucGeo, nucMat, MAX_NUCLEI)
  instNuclei.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  latticeGroup.add(instNuclei)

  // リアルタイム α / β / γ 粒子放出バーストプール
  const bursts = []
  const bPartGeo = new THREE.SphereGeometry(0.085, 12, 12)
  const bRingGeo = new THREE.RingGeometry(0.12, 0.17, 24)
  for (let i = 0; i < MAX_BURSTS; i++) {
    const pMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0 })
    const particle = new THREE.Mesh(bPartGeo, pMat)
    particle.visible = false
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const ring = new THREE.Mesh(bRingGeo, rMat)
    ring.visible = false
    latticeGroup.add(particle, ring)
    bursts.push({
      particle,
      pMat,
      ring,
      rMat,
      life: 0,
      ox: 0,
      oy: 0,
      oz: 0,
      vx: 0,
      vy: 0,
      vz: 0
    })
  }

  const labelLattice = createTextSprite('☢️ 3D 放射性原子核格子', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.44
  })
  labelLattice.position.set(0, 2.22, 0.15)
  latticeGroup.add(labelLattice)

  // 右側: 3D N(t) & D(t) 減衰・蓄積曲線ボード
  const graphGroup = new THREE.Group()
  graphGroup.position.set(3.05, 0.05, 0)
  decayRootGroup.add(graphGroup)

  const boardW = 5.65
  const boardH = 4.25
  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(boardW, boardH),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  boardBack.position.set(0, 0, -0.08)
  boardBack.renderOrder = 0
  graphGroup.add(boardBack)

  const boardBorder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(boardW, boardH)),
    new THREE.LineBasicMaterial({ color: 0x475569 })
  )
  boardBorder.position.set(0, 0, -0.06)
  graphGroup.add(boardBorder)

  const axX0 = -2.35
  const axY0 = -1.62
  const axW = 4.75
  const axH = 3.22

  const tAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.07, headLength: 0.2 })
  tAx.setVector(new THREE.Vector3(axX0, axY0, 0.02), new THREE.Vector3(1, 0, 0), axW + 0.2)
  const nAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.07, headLength: 0.2 })
  nAx.setVector(new THREE.Vector3(axX0, axY0, 0.02), new THREE.Vector3(0, 1, 0), axH + 0.2)
  graphGroup.add(tAx, nAx)

  // 理論曲線・親核曲線・娘核曲線
  const theoryPts = Array.from({ length: CURVE_SAMPLES + 1 }, () => new THREE.Vector3())
  const parentPts = Array.from({ length: CURVE_SAMPLES + 1 }, () => new THREE.Vector3())
  const daughterPts = Array.from({ length: CURVE_SAMPLES + 1 }, () => new THREE.Vector3())

  const theoryTube = buildDynamicTube(
    CURVE_SAMPLES,
    0.024,
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 })
  )
  const parentTube = buildDynamicTube(
    CURVE_SAMPLES,
    0.045,
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x22d3ee, emissiveIntensity: 0.65 })
  )
  const daughterTube = buildDynamicTube(
    CURVE_SAMPLES,
    0.042,
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xa855f7, emissiveIntensity: 0.5 })
  )
  graphGroup.add(theoryTube.mesh, parentTube.mesh, daughterTube.mesh)

  // 半減期 1T, 2T, 3T マーカー
  const hlMarkers = [1, 2, 3].map(() => {
    const vGeo = new THREE.BufferGeometry()
    vGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const vLine = new THREE.Line(
      vGeo,
      new THREE.LineDashedMaterial({ color: 0xfbbf24, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.55 })
    )
    const hGeo = new THREE.BufferGeometry()
    hGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const hLine = new THREE.Line(
      hGeo,
      new THREE.LineDashedMaterial({ color: 0xfbbf24, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.38 })
    )
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    )
    const label = createTextSprite('1T', { color: '#fde68a', borderColor: '#fbbf24', scale: 0.34 })
    graphGroup.add(vLine, hLine, dot, label)
    return { vLine, hLine, dot, label }
  })

  // 現在時刻カーソルとライブ点
  const curGeo = new THREE.BufferGeometry()
  curGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const curLine = new THREE.Line(
    curGeo,
    new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.85 })
  )
  const parentDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x10b981, emissiveIntensity: 0.8 })
  )
  const daughterDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xa855f7, emissiveIntensity: 0.7 })
  )
  graphGroup.add(curLine, parentDot, daughterDot)

  const labelGraphTitle = createTextSprite('📊 残存親核 N(t) と 蓄積娘核 D(t)', {
    color: '#f8fafc',
    borderColor: 'rgba(56,189,248,0.45)',
    scale: 0.44
  })
  labelGraphTitle.position.set(0, 2.52, 0.1)
  graphGroup.add(labelGraphTitle)

  const labelCurveLegend = createTextSprite('実線: 親核N(t) ・ 蓄積: 娘核D(t)', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.4)',
    scale: 0.36
  })
  labelCurveLegend.position.set(0.45, 1.38, 0.14)
  graphGroup.add(labelCurveLegend)

  // ======================================================
  // モード2: 3D 放射線透過・遮蔽実験ベンチ
  // ======================================================
  const penetrationRootGroup = new THREE.Group()
  penetrationRootGroup.visible = false
  scene.add(penetrationRootGroup)

  // 実験ベンチレール
  const benchBase = new THREE.Mesh(
    new THREE.BoxGeometry(10.6, 0.18, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.45 })
  )
  benchBase.position.set(0, -1.75, 0)
  penetrationRootGroup.add(benchBase)

  // 線源ハウジング (x = -4.2)
  const sourceBox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.65, 1.35, 24).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
  )
  sourceBox.position.set(-4.3, 0.0, 0)
  const sourceAperture = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.06, 12, 24).rotateY(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.7 })
  )
  sourceAperture.position.set(-3.62, 0.0, 0)
  penetrationRootGroup.add(sourceBox, sourceAperture)

  // 遮蔽板 1: 紙 1枚 (x = -1.6)
  const paperShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 2.8, 2.6),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85, transparent: true, opacity: 0.92 })
  )
  paperShield.position.set(-1.6, -0.25, 0)
  penetrationRootGroup.add(paperShield)

  // 遮蔽板 2: アルミニウム板 (x = +0.6)
  const alumiShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 2.8, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.82, roughness: 0.22 })
  )
  alumiShield.position.set(0.6, -0.25, 0)
  penetrationRootGroup.add(alumiShield)

  // 遮蔽板 3: 鉛ブロック (x = +2.85)
  const leadShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 2.8, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.55, roughness: 0.55 })
  )
  leadShield.position.set(2.85, -0.25, 0)
  penetrationRootGroup.add(leadShield)

  // 検出器 (x = +4.65)
  const detectorDish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.5, 0.35, 24).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x38bdf8, emissiveIntensity: 0.35, metalness: 0.6 })
  )
  detectorDish.position.set(4.65, 0.0, 0)
  penetrationRootGroup.add(detectorDish)

  // 遮蔽実験ラベル
  const labelSrc = createTextSprite('放射線源', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.38 })
  labelSrc.position.set(-4.2, 1.3, 0.1)
  const labelPaper = createTextSprite('紙 (0.1mm)', { color: '#f8fafc', borderColor: '#cbd5e1', scale: 0.38 })
  labelPaper.position.set(-1.6, 1.55, 0.1)
  const labelAlumi = createTextSprite('アルミ板 (5mm)', { color: '#cbd5e1', borderColor: '#94a3b8', scale: 0.38 })
  labelAlumi.position.set(0.6, 1.55, 0.1)
  const labelLead = createTextSprite('鉛ブロック (10cm)', { color: '#94a3b8', borderColor: '#64748b', scale: 0.38 })
  labelLead.position.set(2.85, 1.55, 0.1)
  const labelDet = createTextSprite('検出器', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.36 })
  labelDet.position.set(4.65, 1.3, 0.1)
  const labelPenBanner = createTextSprite('α線: 紙1枚で遮蔽', { color: '#fda4af', borderColor: '#fb7185', scale: 0.44 })
  labelPenBanner.position.set(0, -2.28, 0.8)
  penetrationRootGroup.add(labelSrc, labelPaper, labelAlumi, labelLead, labelDet, labelPenBanner)

  // 放射線粒子プール
  const rays = []
  const rayGeo = new THREE.SphereGeometry(0.12, 14, 14)
  for (let i = 0; i < MAX_RAYS; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xfb7185, emissiveIntensity: 0.85 })
    const mesh = new THREE.Mesh(rayGeo, mat)
    mesh.visible = false
    penetrationRootGroup.add(mesh)
    rays.push({ active: false, mesh, mat, x: 0, y: 0, z: 0, vx: 0, type: 'alpha', phase: 0 })
  }

  sceneObjs = {
    decayRootGroup,
    penetrationRootGroup,
    instNuclei,
    dummy: new THREE.Object3D(),
    floorRings,
    floorPulse: [0, 0, 0],
    bursts,
    burstIdx: 0,
    theoryPts,
    parentPts,
    daughterPts,
    theoryTube,
    parentTube,
    daughterTube,
    hlMarkers,
    curGeo,
    curLine,
    parentDot,
    daughterDot,
    labelLattice,
    labelGraphTitle,
    labelCurveLegend,
    axX0,
    axY0,
    axW,
    axH,
    rays,
    rayTimer: 0,
    labelPenBanner
  }

  resetDecay()
  syncModeVisibility()
}

function spawnDecayBurst(x, y, z) {
  if (!sceneObjs || !showBursts.value) return
  const b = sceneObjs.bursts[sceneObjs.burstIdx % MAX_BURSTS]
  sceneObjs.burstIdx++

  let pick = decayEmitType.value
  if (pick === 'mixed') {
    const r = Math.random()
    pick = r < 0.34 ? 'alpha' : r < 0.68 ? 'beta' : 'gamma'
  }
  const colorHex = pick === 'alpha' ? 0xfb7185 : pick === 'beta' ? 0x38bdf8 : 0xc084fc
  const speed = pick === 'alpha' ? 1.8 : pick === 'beta' ? 3.2 : 4.5

  const th = Math.random() * Math.PI * 2
  const ph = Math.acos(2 * Math.random() - 1)
  b.ox = x; b.oy = y; b.oz = z
  b.vx = Math.sin(ph) * Math.cos(th) * speed
  b.vy = Math.sin(ph) * Math.sin(th) * speed
  b.vz = Math.cos(ph) * speed
  b.life = 1.0

  b.pMat.color.setHex(colorHex)
  b.pMat.opacity = 1.0
  b.particle.position.set(x, y, z)
  b.particle.scale.setScalar(pick === 'alpha' ? 1.25 : 0.85)
  b.particle.visible = true

  b.rMat.color.setHex(colorHex)
  b.rMat.opacity = 0.85
  b.ring.position.set(x, y, z)
  b.ring.scale.setScalar(0.5)
  b.ring.lookAt(0, 0, 10)
  b.ring.visible = true
}

function updateDecayVisuals(elapsed) {
  if (!sceneObjs) return
  const {
    instNuclei,
    dummy,
    floorRings,
    floorPulse,
    parentPts,
    daughterPts,
    parentTube,
    daughterTube,
    curGeo,
    curLine,
    parentDot,
    daughterDot,
    axX0,
    axY0,
    axW,
    axH
  } = sceneObjs

  const n = initialCount.value
  const col = new THREE.Color()

  for (let i = 0; i < MAX_NUCLEI; i++) {
    if (i >= n) {
      dummy.position.set(0, -999, 0)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      instNuclei.setMatrixAt(i, dummy.matrix)
      continue
    }
    const nuc = nucleiData[i]
    const pulse = nuc.decayed ? 0.86 : 1.0 + 0.1 * Math.sin(elapsed * 4.2 + i * 0.4)
    dummy.position.set(nuc.x, nuc.y, nuc.z)
    dummy.scale.setScalar(pulse)
    dummy.updateMatrix()
    instNuclei.setMatrixAt(i, dummy.matrix)

    if (nuc.decayed) {
      col.copy(COL_DAUGHTER_AMBER).lerp(COL_DAUGHTER_VIOLET, nuc.daughterTint)
    } else {
      const shimmer = 0.5 + 0.5 * Math.sin(elapsed * 3.0 + i * 0.7)
      col.copy(COL_PARENT).lerp(COL_PARENT_CYAN, shimmer * 0.7)
    }
    instNuclei.setColorAt(i, col)
  }
  instNuclei.instanceMatrix.needsUpdate = true
  if (instNuclei.instanceColor) instNuclei.instanceColor.needsUpdate = true

  // 半減期フロアリング発光
  floorRings.forEach((fr, idx) => {
    const passed = simTime.value >= (idx + 1) * halfLife.value
    const p = floorPulse[idx]
    fr.mat.opacity = passed ? 0.62 + p * 0.35 : 0.16
    fr.ring.scale.setScalar(1.0 + p * 0.14)
  })

  // 履歴データから 3D N(t) & D(t) チューブ更新
  const maxT = halfLife.value * 3.2
  const countPts = Math.min(CURVE_SAMPLES + 1, historyData.length)
  for (let i = 0; i < countPts; i++) {
    const d = historyData[i]
    const gx = axX0 + Math.min(1, d.t / maxT) * axW
    parentPts[i].set(gx, axY0 + (d.nCount / n) * axH, 0.06)
    daughterPts[i].set(gx, axY0 + (d.dCount / n) * axH, 0.06)
  }
  parentTube.updatePoints(parentPts, countPts)
  daughterTube.updatePoints(daughterPts, countPts)

  const curFracX = Math.min(1, simTime.value / maxT)
  const curX = axX0 + curFracX * axW
  const curPY = axY0 + (activeNucleiCount.value / n) * axH
  const curDY = axY0 + ((n - activeNucleiCount.value) / n) * axH

  parentDot.position.set(curX, curPY, 0.09)
  daughterDot.position.set(curX, curDY, 0.09)

  const cArr = curGeo.getAttribute('position').array
  cArr[0] = curX; cArr[1] = axY0; cArr[2] = 0.04
  cArr[3] = curX; cArr[4] = axY0 + axH; cArr[5] = 0.04
  curGeo.getAttribute('position').needsUpdate = true
  curLine.computeLineDistances()
}

function updateFrame(dt, elapsed) {
  if (!sceneObjs) return
  const scaledDt = isPlaying.value ? dt * timeScale.value : 0

  if (mode.value === 'decay') {
    if (scaledDt > 0) {
      const prevT = simTime.value
      simTime.value += scaledDt
      const T = halfLife.value

      // 半減期到達チェックで床リングパルス
      for (let k = 1; k <= 3; k++) {
        if (prevT < k * T && simTime.value >= k * T) {
          sceneObjs.floorPulse[k - 1] = 1.0
        }
        sceneObjs.floorPulse[k - 1] = Math.max(0, sceneObjs.floorPulse[k - 1] - scaledDt * 1.4)
      }

      if (simTime.value > T * 3.25) {
        resetDecay()
        return
      }

      const lambda = Math.LN2 / T
      const prob = 1 - Math.exp(-lambda * scaledDt)
      let alive = 0
      let spawnedThisFrame = 0

      for (let i = 0; i < nucleiData.length; i++) {
        const nuc = nucleiData[i]
        if (!nuc.decayed && Math.random() < prob) {
          nuc.decayed = true
          if (spawnedThisFrame < 4) {
            spawnDecayBurst(nuc.x, nuc.y, nuc.z)
            spawnedThisFrame++
          }
        }
        if (!nuc.decayed) alive++
      }
      activeNucleiCount.value = alive

      const lastT = historyData.length > 0 ? historyData[historyData.length - 1].t : 0
      if (simTime.value - lastT >= Math.max(0.08, T * 0.04)) {
        historyData.push({
          t: simTime.value,
          nCount: alive,
          dCount: initialCount.value - alive
        })
      }
    }

    // バースト粒子アニメーション
    sceneObjs.bursts.forEach((b) => {
      if (b.life > 0) {
        const step = Math.max(dt, scaledDt)
        b.life = Math.max(0, b.life - step * 1.65)
        const age = 1 - b.life
        b.particle.position.set(b.ox + b.vx * age, b.oy + b.vy * age, b.oz + b.vz * age)
        b.pMat.opacity = b.life
        b.ring.scale.setScalar(0.5 + age * 2.8)
        b.rMat.opacity = b.life * 0.8
        if (b.life <= 0) {
          b.particle.visible = false
          b.ring.visible = false
        }
      }
    })

    updateDecayVisuals(elapsed)
  } else {
    // モード2: 透過力ベンチ更新
    if (scaledDt > 0) {
      sceneObjs.rayTimer += scaledDt
      if (sceneObjs.rayTimer > 0.14) {
        sceneObjs.rayTimer = 0
        const slot = sceneObjs.rays.find((r) => !r.active)
        if (slot) {
          slot.active = true
          slot.type = radiationType.value
          slot.x = -3.6
          slot.y = (Math.random() - 0.5) * 0.9
          slot.z = (Math.random() - 0.5) * 0.9
          slot.vx = slot.type === 'gamma' ? 5.8 : slot.type === 'beta' ? 4.2 : 2.6
          slot.phase = Math.random() * 6.28
          slot.mat.color.setHex(slot.type === 'alpha' ? 0xfb7185 : slot.type === 'beta' ? 0x38bdf8 : 0xc084fc)
          slot.mat.emissive.setHex(slot.type === 'alpha' ? 0xfb7185 : slot.type === 'beta' ? 0x38bdf8 : 0xa855f7)
          slot.mesh.scale.setScalar(slot.type === 'alpha' ? 1.35 : slot.type === 'beta' ? 0.85 : 1.0)
          slot.mesh.visible = true
        }
      }

      for (const r of sceneObjs.rays) {
        if (!r.active) continue
        r.x += r.vx * scaledDt
        const wobbleY = r.type === 'gamma' ? Math.sin(elapsed * 22 + r.phase) * 0.12 : 0
        r.mesh.position.set(r.x, r.y + wobbleY, r.z)

        if (r.type === 'alpha' && r.x >= -1.62) {
          r.active = false
          r.mesh.visible = false
        } else if (r.type === 'beta' && r.x >= 0.52) {
          r.active = false
          r.mesh.visible = false
        } else if (r.type === 'gamma' && r.x >= 2.75 && r.x <= 3.15 && Math.random() < 0.18) {
          r.active = false
          r.mesh.visible = false
        } else if (r.x > 4.65) {
          r.active = false
          r.mesh.visible = false
        }
      }
    }
  }
}

watch(halfLife, () => {
  rebuildTheoryCurve()
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (resizeObs) {
    resizeObs.disconnect()
    resizeObs = null
  }
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.decay-sim {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
  margin: 1.5rem 0;
  color: #f4f4f5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.sim-header {
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.title-row h3 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #fafafa;
}

.three-badge {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.desc {
  font-size: 0.84rem;
  color: #cbd5e1;
  margin: 6px 0 0 0;
  line-height: 1.5;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  padding: 0 0.15em;
  line-height: 1;
}
.frac .num { border-bottom: 1px solid currentColor; padding-bottom: 0.1em; font-size: 0.85em; }
.frac .den { padding-top: 0.1em; font-size: 0.85em; }

.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.mode-tabs button {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-tabs button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

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
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
  color: #f8fafc;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-play {
  background: #0284c7;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px;
  border-radius: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #38bdf8;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.speed-btn-group button {
  background: transparent;
  border: 1px solid transparent;
  color: #cbd5e1;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

.reset-btn {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #080c16;
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
  gap: 10px;
  flex-wrap: wrap;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.73rem;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.legend-text {
  line-height: 1.25;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-parent { background: #10b981; box-shadow: 0 0 6px #22d3ee; }
.dot-daughter { background: #f59e0b; box-shadow: 0 0 6px #a855f7; }
.dot-burst { background: #fb7185; box-shadow: 0 0 6px #c084fc; }
.dot-halflife { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.dot-alpha { background: #fb7185; box-shadow: 0 0 6px #fb7185; }
.dot-beta { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-gamma { background: #c084fc; box-shadow: 0 0 6px #a855f7; }

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
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
}

.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.state-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.77rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
}

.controls-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 14px;
  margin: 12px 0;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 0.82rem;
  color: #e2e8f0;
  display: flex;
  justify-content: space-between;
}

.control-group strong {
  color: #38bdf8;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.radio-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.radio-buttons button {
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.78rem;
  cursor: pointer;
}

.radio-buttons button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}

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
  gap: 3px;
}

.stat-card .label {
  font-size: 0.73rem;
  color: #94a3b8;
}

.stat-card .val {
  font-size: 1.02rem;
  font-weight: 700;
  color: #fafafa;
  font-family: monospace;
}

.stat-card .val.highlight {
  color: #38bdf8;
}

.stat-card .val.highlight-alt {
  color: #fbbf24;
}

@media (max-width: 640px) {
  .decay-sim {
    padding: 12px;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    justify-content: space-between;
    padding: 6px 8px;
  }
  .three-hud-legend {
    gap: 6px;
    font-size: 0.65rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.65rem;
    padding: 3px 8px;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .state-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
  .mode-tabs button {
    flex: 1 1 auto;
    font-size: 0.76rem;
    padding: 6px 10px;
  }
}
</style>
