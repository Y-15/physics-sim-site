<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <div class="sim-title">
          <span class="icon">☢️</span>
          <span>3D 放射平衡と壊変系列シミュレーター（<i>A</i> → <i>B</i> → <i>C</i>）</span>
        </div>
        <div class="header-badges">
          <span class="three-badge">Three.js 3D Interactive</span>
          <span class="badge" :style="{ borderColor: equilibriumType.color, color: equilibriumType.color }">
            {{ equilibriumType.name }}
          </span>
        </div>
      </div>
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
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: graphMode === 'count' }" @click="graphMode = 'count'">
          📈 原子数 <i>N</i>(<i>t</i>)
        </button>
        <button class="chip-btn" :class="{ active: graphMode === 'activity' }" @click="graphMode = 'activity'">
          ☢️ 放射能 λ<i>N</i>(<i>t</i>)
        </button>
      </div>
    </div>

    <!-- 再生・速度バー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: Math.abs(simSpeed - 0.5) < 0.05 }" @click="simSpeed = 0.5">0.5x</button>
          <button :class="{ active: Math.abs(simSpeed - 1.0) < 0.05 }" @click="simSpeed = 1.0">1.0x</button>
          <button :class="{ active: Math.abs(simSpeed - 2.0) < 0.05 }" @click="simSpeed = 2.0">2.0x</button>
        </div>
      </div>
      <button class="btn btn-reset" @click="resetSim">↺ <i>t</i> = 0 に戻す</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap three-stage">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-a"></i><span class="legend-text">親核種 <i>N</i><sub><i>A</i></sub> (減衰)</span></span>
          <span class="legend-item"><i class="dot-b"></i><span class="legend-text">娘核種 <i>N</i><sub><i>B</i></sub> (生成・減衰)</span></span>
          <span class="legend-item"><i class="dot-c"></i><span class="legend-text">安定核種 <i>N</i><sub><i>C</i></sub> (蓄積)</span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- ビューポート外ステータスストリップ -->
    <div class="mode-status-strip">
      <span class="state-badge" :style="{ borderColor: equilibriumType.color, color: equilibriumType.color }">
        {{ equilibriumType.name }} — <i>T</i><sub><i>A</i></sub> = {{ halfLifeA.toFixed(1) }}, <i>T</i><sub><i>B</i></sub> = {{ halfLifeB.toFixed(1) }} ・ 放射能比 (λ<sub><i>B</i></sub><i>N</i><sub><i>B</i></sub>)/(λ<sub><i>A</i></sub><i>N</i><sub><i>A</i></sub>) = {{ currentStatus.actRatio }}
      </span>
    </div>

    <!-- リアルタイム放射能ステータス -->
    <div class="status-grid">
      <div class="status-card">
        <span class="lbl">経過時間 <i>t</i>:</span>
        <span class="val highlight">{{ currentTime.toFixed(1) }}</span>
      </div>
      <div class="status-card">
        <span class="lbl">娘核種極大時刻 <i>t</i><sub>max</sub>:</span>
        <span class="val">{{ tMax ? tMax.toFixed(1) : 'なし' }}</span>
      </div>
      <div class="status-card">
        <span class="lbl">原子数 <i>N</i><sub><i>A</i></sub> / <i>N</i><sub><i>B</i></sub> / <i>N</i><sub><i>C</i></sub>:</span>
        <span class="val" style="font-size: 0.8rem">{{ currentStatus.NA }} / {{ currentStatus.NB }} / {{ currentStatus.NC }}</span>
      </div>
      <div class="status-card">
        <span class="lbl">親の放射能 λ<sub><i>A</i></sub> <i>N</i><sub><i>A</i></sub>:</span>
        <span class="val" style="color: #22d3ee">{{ currentStatus.actA }} Bq相当</span>
      </div>
      <div class="status-card">
        <span class="lbl">娘の放射能 λ<sub><i>B</i></sub> <i>N</i><sub><i>B</i></sub>:</span>
        <span class="val" style="color: #fbbf24">{{ currentStatus.actB }} Bq相当</span>
      </div>
      <div class="status-card highlight-box">
        <span class="lbl">放射能比 (λ<sub><i>B</i></sub> <i>N</i><sub><i>B</i></sub>) / (λ<sub><i>A</i></sub> <i>N</i><sub><i>A</i></sub>):</span>
        <span class="val">{{ currentStatus.actRatio }}</span>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="preset-buttons">
        <span class="preset-label">典型例プリセット:</span>
        <button class="preset-btn" @click="setPreset('secular')">
          永続平衡（ウラン-ラジウム型 <i>T</i><sub><i>A</i></sub> ≫ <i>T</i><sub><i>B</i></sub>）
        </button>
        <button class="preset-btn" @click="setPreset('transient')">
          過渡平衡（Mo-99/Tc-99m型 <i>T</i><sub>A</sub> &gt; <i>T</i><sub>B</sub>）
        </button>
        <button class="preset-btn" @click="setPreset('none')">
          平衡なし（<i>T</i><sub>A</sub> &lt; <i>T</i><sub>B</sub>）
        </button>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label><span>親核種の半減期 <i>T</i><sub><i>A</i></sub>:</span> <span>{{ halfLifeA.toFixed(1) }}</span></label>
          <input type="range" v-model.number="halfLifeA" min="2.0" max="45.0" step="0.5" />
        </div>
        <div class="control-group">
          <label><span>娘核種の半減期 <i>T</i><sub><i>B</i></sub>:</span> <span>{{ halfLifeB.toFixed(1) }}</span></label>
          <input type="range" v-model.number="halfLifeB" min="1.0" max="25.0" step="0.5" />
        </div>
        <div class="control-group">
          <label><span>進行速度:</span> <span>{{ simSpeed.toFixed(1) }}x</span></label>
          <input type="range" v-model.number="simSpeed" min="0.5" max="3.0" step="0.1" />
        </div>
      </div>
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

const activeCam = ref('3d')
const graphMode = ref('count') // 'count' | 'activity'

// 半減期設定
const halfLifeA = ref(20.0)
const halfLifeB = ref(3.0)
const isPlaying = ref(true)
const simSpeed = ref(1.0)
const currentTime = ref(0)
const maxTime = ref(60)
const N0 = 1000

// 崩壊定数
const lambdaA = computed(() => Math.LN2 / halfLifeA.value)
const lambdaB = computed(() => Math.LN2 / halfLifeB.value)

// 娘核種の極大到達時刻 t_max
const tMax = computed(() => {
  const lA = lambdaA.value
  const lB = lambdaB.value
  if (Math.abs(lA - lB) < 1e-5) return halfLifeA.value / Math.LN2
  if (lB <= lA) return null
  return Math.log(lB / lA) / (lB - lA)
})

// 平衡タイプの判定
const equilibriumType = computed(() => {
  const ratio = halfLifeA.value / halfLifeB.value
  if (ratio >= 8) return { name: '永続平衡 (Secular)', color: '#38bdf8' }
  if (ratio > 1.2) return { name: '過渡平衡 (Transient)', color: '#10b981' }
  return { name: '平衡なし (No Equilibrium)', color: '#f43f5e' }
})

function evalPopulations(t) {
  const lA = lambdaA.value
  const lB = lambdaB.value
  const NA = N0 * Math.exp(-lA * t)
  let NB = 0
  if (Math.abs(lA - lB) < 1e-4) {
    NB = N0 * lA * t * Math.exp(-lA * t)
  } else {
    NB = (N0 * lA / (lB - lA)) * (Math.exp(-lA * t) - Math.exp(-lB * t))
  }
  NB = Math.max(0, NB)
  const NC = Math.max(0, N0 - NA - NB)
  return { NA, NB, NC, actA: lA * NA, actB: lB * NB }
}

const currentStatus = computed(() => {
  const { NA, NB, NC, actA, actB } = evalPopulations(currentTime.value)
  return {
    NA: Math.round(NA),
    NB: Math.round(NB),
    NC: Math.round(NC),
    actA: actA.toFixed(1),
    actB: actB.toFixed(1),
    actRatio: actA > 0.05 ? (actB / actA).toFixed(2) : '—'
  }
})

function setPreset(mode) {
  if (mode === 'secular') {
    halfLifeA.value = 35.0
    halfLifeB.value = 2.5
  } else if (mode === 'transient') {
    halfLifeA.value = 16.0
    halfLifeB.value = 3.5
  } else if (mode === 'none') {
    halfLifeA.value = 4.0
    halfLifeB.value = 12.0
  }
  resetSim()
}

function resetSim() {
  currentTime.value = 0
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
    return { pos: [0.05, 0.05, 42.5 * ms], target: [0.05, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.05, 47.0 * ms, 0.15], target: [0.05, 0, 0], fov: 14 }
  }
  return { pos: [0.15 * ms, 4.45 * ms, 13.8 * ms], target: [0.05, 0.05, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  rebuildCurves()
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.42) {
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
// 動的 3D 曲線チューブビルダー
// ==========================================================
function buildDynamicTube(samples, radius, material) {
  const radialSegs = 8
  const vertCount = (samples + 1) * (radialSegs + 1)
  const positions = new Float32Array(vertCount * 3)
  const normals = new Float32Array(vertCount * 3)
  const indices = []
  for (let i = 0; i < samples; i++) {
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
  const mesh = new THREE.Mesh(geo, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 3

  function updatePoints(pts) {
    const n = pts.length
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
  }

  return { mesh, updatePoints }
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
let sceneObjs = null
const CURVE_SAMPLES = 72

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
        rebuildCurves()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.45, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D 3チャンバー連続壊変カスケード (A -> B -> C)
  // ======================================================
  const cascadeGroup = new THREE.Group()
  cascadeGroup.position.set(-3.1, 0.0, 0)
  scene.add(cascadeGroup)

  const chamberConfigs = [
    { key: 'A', x: -1.68, baseY: -1.10, color: 0x22d3ee, emissive: 0x10b981, label: '親核 A', textColor: '#67e8f9', border: '#22d3ee' },
    { key: 'B', x: 0.0, baseY: -1.38, color: 0xfbbf24, emissive: 0xf97316, label: '娘核 B', textColor: '#fde68a', border: '#f59e0b' },
    { key: 'C', x: 1.68, baseY: -1.66, color: 0xa855f7, emissive: 0x64748b, label: '安定核 C', textColor: '#d8b4fe', border: '#a855f7' }
  ]

  const chambers = {}
  const maxColH = 2.65
  const cylR = 0.62

  chamberConfigs.forEach((cfg) => {
    const g = new THREE.Group()
    g.position.set(cfg.x, cfg.baseY, 0)
    cascadeGroup.add(g)

    // 台座
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(cylR + 0.1, cylR + 0.16, 0.16, 28),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.35 })
    )
    base.position.set(0, 0.08, 0)
    g.add(base)

    // 内部発光カラム (レベルゲージ)
    const fillGeo = new THREE.CylinderGeometry(cylR - 0.06, cylR - 0.06, 1.0, 28)
    fillGeo.translate(0, 0.5, 0)
    const fillMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.emissive,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      transparent: true,
      opacity: 0.88
    })
    const fillMesh = new THREE.Mesh(fillGeo, fillMat)
    fillMesh.position.set(0, 0.16, 0)
    fillMesh.renderOrder = 2
    g.add(fillMesh)

    // 液面トップリング
    const topRing = new THREE.Mesh(
      new THREE.TorusGeometry(cylR - 0.06, 0.03, 10, 32).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: cfg.color })
    )
    topRing.renderOrder = 3
    g.add(topRing)

    // レベルゲージ目盛りリング (50%, 100%)
    ;[0.5, 1.0].forEach((f) => {
      const tick = new THREE.Mesh(
        new THREE.TorusGeometry(cylR + 0.02, 0.015, 8, 28).rotateX(Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.65 })
      )
      tick.position.set(0, 0.16 + f * maxColH, 0)
      g.add(tick)
    })

    // 外側ガラスシリンダー (depthWrite: false, renderOrder: 5)
    const glassGeo = new THREE.CylinderGeometry(cylR, cylR, maxColH + 0.15, 32, 1, true)
    glassGeo.translate(0, 0.16 + (maxColH + 0.15) / 2, 0)
    const glassMesh = new THREE.Mesh(
      glassGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.16,
        roughness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
    glassMesh.renderOrder = 5
    g.add(glassMesh)

    const topCapRing = new THREE.Mesh(
      new THREE.TorusGeometry(cylR, 0.028, 10, 32).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: cfg.color, emissive: cfg.emissive, emissiveIntensity: 0.35 })
    )
    topCapRing.position.set(0, 0.16 + maxColH + 0.15, 0)
    g.add(topCapRing)

    const label = createTextSprite(cfg.label, {
      color: cfg.textColor,
      borderColor: cfg.border,
      scale: 0.40
    })
    label.position.set(0, maxColH + 0.72, 0.1)
    g.add(label)

    chambers[cfg.key] = { group: g, fillMesh, topRing, label, cfg }
  })

  // A -> B および B -> C 接続フローパイプ + ライブ粒子群
  function buildFlowPipe(pStart, pEnd, color) {
    const mid = pStart.clone().lerp(pEnd, 0.5).add(new THREE.Vector3(0, 0.35, 0))
    const curve = new THREE.QuadraticBezierCurve3(pStart, mid, pEnd)
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.065, 10, false),
      new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      })
    )
    tube.renderOrder = 4
    cascadeGroup.add(tube)

    const particles = []
    const pGeo = new THREE.SphereGeometry(0.085, 12, 12)
    const pMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.85
    })
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(pGeo, pMat)
      m.renderOrder = 3
      cascadeGroup.add(m)
      particles.push({ mesh: m, u: i / 10 })
    }
    return { curve, particles }
  }

  const pipeAB = buildFlowPipe(
    new THREE.Vector3(-1.12, 0.55, 0),
    new THREE.Vector3(-0.56, 0.25, 0),
    0x22d3ee
  )
  const pipeBC = buildFlowPipe(
    new THREE.Vector3(0.56, 0.25, 0),
    new THREE.Vector3(1.12, -0.05, 0),
    0xfbbf24
  )

  const labelFlowAB = createTextSprite('λ_A N_A', { color: '#67e8f9', borderColor: '#22d3ee', scale: 0.38 })
  labelFlowAB.position.set(-0.85, -1.96, 0.95)
  const labelFlowBC = createTextSprite('λ_B N_B', { color: '#fde68a', borderColor: '#fbbf24', scale: 0.38 })
  labelFlowBC.position.set(0.88, -2.28, 0.95)
  cascadeGroup.add(labelFlowAB, labelFlowBC)

  // ======================================================
  // 2. 右側: 3D N_A(t), N_B(t), N_C(t) 曲線ボード (x = +3.1)
  // ======================================================
  const graphGroup = new THREE.Group()
  graphGroup.position.set(3.1, 0.05, 0)
  scene.add(graphGroup)

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

  const ptsA = Array.from({ length: CURVE_SAMPLES + 1 }, () => new THREE.Vector3())
  const ptsB = Array.from({ length: CURVE_SAMPLES + 1 }, () => new THREE.Vector3())
  const ptsC = Array.from({ length: CURVE_SAMPLES + 1 }, () => new THREE.Vector3())

  const tubeA = buildDynamicTube(
    CURVE_SAMPLES,
    0.044,
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x10b981, emissiveIntensity: 0.6 })
  )
  const tubeB = buildDynamicTube(
    CURVE_SAMPLES,
    0.046,
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf97316, emissiveIntensity: 0.65 })
  )
  const tubeC = buildDynamicTube(
    CURVE_SAMPLES,
    0.040,
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.45 })
  )
  graphGroup.add(tubeA.mesh, tubeB.mesh, tubeC.mesh)

  // t_max 垂直線とピーク球
  const tMaxGeo = new THREE.BufferGeometry()
  tMaxGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const tMaxLine = new THREE.Line(
    tMaxGeo,
    new THREE.LineDashedMaterial({ color: 0xfbbf24, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.72 })
  )
  const tMaxDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  )
  const labelTMax = createTextSprite('t_max', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.36 })
  graphGroup.add(tMaxLine, tMaxDot, labelTMax)

  // 現在時刻カーソルと3つのライブ球
  const curGeo = new THREE.BufferGeometry()
  curGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const curLine = new THREE.Line(
    curGeo,
    new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.85 })
  )
  const dotA = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22d3ee }))
  const dotB = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }))
  const dotC = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0xa855f7 }))
  graphGroup.add(curLine, dotA, dotB, dotC)

  const labelGraphTitle = createTextSprite('📊 連続壊変推移 N(t)', {
    color: '#f8fafc',
    borderColor: 'rgba(56,189,248,0.45)',
    scale: 0.44
  })
  labelGraphTitle.position.set(0, 2.52, 0.1)
  graphGroup.add(labelGraphTitle)

  const labelAxisT = createTextSprite('経過時間 t →', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.4)',
    scale: 0.38
  })
  labelAxisT.position.set(1.5, -2.25, 0.15)
  graphGroup.add(labelAxisT)

  sceneObjs = {
    chambers,
    maxColH,
    pipeAB,
    pipeBC,
    labelFlowAB,
    labelFlowBC,
    ptsA,
    ptsB,
    ptsC,
    tubeA,
    tubeB,
    tubeC,
    tMaxGeo,
    tMaxLine,
    tMaxDot,
    labelTMax,
    curGeo,
    curLine,
    dotA,
    dotB,
    dotC,
    labelGraphTitle,
    labelAxisT,
    axX0,
    axY0,
    axW,
    axH,
    maxYVal: N0
  }

  rebuildCurves()
  updateFrame(0, 0)
}

function rebuildCurves() {
  if (!sceneObjs) return
  const {
    ptsA,
    ptsB,
    ptsC,
    tubeA,
    tubeB,
    tubeC,
    tMaxGeo,
    tMaxLine,
    tMaxDot,
    labelTMax,
    labelGraphTitle,
    labelAxisT,
    axX0,
    axY0,
    axW,
    axH
  } = sceneObjs

  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'
  const isActivity = graphMode.value === 'activity'
  const tEnd = maxTime.value

  // 放射能モード時のY軸上限を計算
  let maxVal = N0
  if (isActivity) {
    const act0 = lambdaA.value * N0
    const actBPeak = tMax.value ? evalPopulations(tMax.value).actB : lambdaB.value * N0 * 0.5
    maxVal = Math.max(act0, actBPeak, 1) * 1.12
  }
  sceneObjs.maxYVal = maxVal

  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const t = (i / CURVE_SAMPLES) * tEnd
    const pop = evalPopulations(t)
    const gx = axX0 + (t / tEnd) * axW

    if (!isActivity) {
      ptsA[i].set(gx, axY0 + Math.min(1, pop.NA / maxVal) * axH, 0.05)
      ptsB[i].set(gx, axY0 + Math.min(1, pop.NB / maxVal) * axH, 0.06)
      ptsC[i].set(gx, axY0 + Math.min(1, pop.NC / maxVal) * axH, 0.04)
    } else {
      ptsA[i].set(gx, axY0 + Math.min(1, pop.actA / maxVal) * axH, 0.05)
      ptsB[i].set(gx, axY0 + Math.min(1, pop.actB / maxVal) * axH, 0.06)
      ptsC[i].set(gx, axY0, 0.03)
    }
  }
  tubeA.updatePoints(ptsA)
  tubeB.updatePoints(ptsB)
  tubeC.updatePoints(ptsC)
  tubeC.mesh.visible = !isActivity

  // t_max マーカー更新
  const tm = tMax.value
  const showTmax = tm !== null && tm > 0.2 && tm <= tEnd
  tMaxLine.visible = showTmax
  tMaxDot.visible = showTmax
  labelTMax.visible = showTmax && !isTop
  if (showTmax) {
    const tx = axX0 + (tm / tEnd) * axW
    const popM = evalPopulations(tm)
    const valM = isActivity ? popM.actB : popM.NB
    const ty = axY0 + Math.min(1, valM / maxVal) * axH
    const arr = tMaxGeo.getAttribute('position').array
    arr[0] = tx; arr[1] = axY0; arr[2] = 0.03
    arr[3] = tx; arr[4] = ty; arr[5] = 0.03
    tMaxGeo.getAttribute('position').needsUpdate = true
    tMaxLine.computeLineDistances()
    tMaxDot.position.set(tx, ty, 0.09)
    labelTMax.position.set(Math.min(1.45, tx + 0.28), Math.min(1.78, ty + 0.52), 0.18)
    updateLabelCached(labelTMax, `t_max=${tm.toFixed(1)}`, '#fde68a', '#f59e0b', 0.37)
  }

  labelGraphTitle.visible = !isTop
  labelAxisT.visible = !isTop
  updateLabelCached(
    labelGraphTitle,
    isActivity ? (mob ? '☢️ 放射能 λN(t)' : '☢️ 放射能の推移 λ_A N_A vs λ_B N_B') : (mob ? '📊 原子数 N(t)' : '📊 原子数の推移 N_A, N_B, N_C'),
    '#f8fafc',
    'rgba(56,189,248,0.45)',
    0.44
  )
  updateLabelCached(labelAxisT, '経過時間 t →', '#cbd5e1', 'rgba(148,163,184,0.4)', 0.38)
}

function updateFrame(dt, elapsed) {
  if (!sceneObjs) return

  if (isPlaying.value && dt > 0) {
    currentTime.value += dt * 4.5 * simSpeed.value
    if (currentTime.value > maxTime.value) {
      currentTime.value = 0
    }
  }

  const {
    chambers,
    maxColH,
    pipeAB,
    pipeBC,
    labelFlowAB,
    labelFlowBC,
    curGeo,
    curLine,
    dotA,
    dotB,
    dotC,
    axX0,
    axY0,
    axW,
    axH,
    maxYVal
  } = sceneObjs

  const mob = isMobileViewport()
  const isActivity = graphMode.value === 'activity'
  const t = currentTime.value
  const pop = evalPopulations(t)

  // 3チャンバーの液面レベル更新
  const fracA = Math.max(0.02, pop.NA / N0)
  const fracB = Math.max(0.02, pop.NB / N0)
  const fracC = Math.max(0.02, pop.NC / N0)

  chambers.A.fillMesh.scale.set(1, fracA * maxColH, 1)
  chambers.A.topRing.position.set(0, 0.16 + fracA * maxColH, 0)

  chambers.B.fillMesh.scale.set(1, fracB * maxColH, 1)
  chambers.B.topRing.position.set(0, 0.16 + fracB * maxColH, 0)

  chambers.C.fillMesh.scale.set(1, fracC * maxColH, 1)
  chambers.C.topRing.position.set(0, 0.16 + fracC * maxColH, 0)

  updateLabelCached(chambers.A.label, mob ? `A:${Math.round(pop.NA)}` : `親核 A: ${Math.round(pop.NA)}`, '#67e8f9', '#22d3ee', 0.39)
  updateLabelCached(chambers.B.label, mob ? `B:${Math.round(pop.NB)}` : `娘核 B: ${Math.round(pop.NB)}`, '#fde68a', '#f59e0b', 0.39)
  updateLabelCached(chambers.C.label, mob ? `C:${Math.round(pop.NC)}` : `安定核 C: ${Math.round(pop.NC)}`, '#d8b4fe', '#a855f7', 0.39)

  // パイプ流れ粒子アニメーション (流速は放射能 λN に連動)
  const rateAB = Math.min(2.5, Math.max(0.15, pop.actA / 40))
  const rateBC = Math.min(2.5, Math.max(0.05, pop.actB / 40))

  pipeAB.particles.forEach((p, idx) => {
    if (isPlaying.value) p.u = (p.u + dt * rateAB * simSpeed.value * 0.65) % 1.0
    const pos = pipeAB.curve.getPointAt(p.u)
    p.mesh.position.copy(pos)
    p.mesh.visible = pop.actA > 0.2
    p.mesh.scale.setScalar(0.75 + 0.25 * Math.sin(elapsed * 5 + idx))
  })
  pipeBC.particles.forEach((p, idx) => {
    if (isPlaying.value) p.u = (p.u + dt * rateBC * simSpeed.value * 0.65) % 1.0
    const pos = pipeBC.curve.getPointAt(p.u)
    p.mesh.position.copy(pos)
    p.mesh.visible = pop.actB > 0.2
    p.mesh.scale.setScalar(0.75 + 0.25 * Math.sin(elapsed * 5 + idx))
  })

  const isTop = activeCam.value === 'top'
  if (isTop) {
    labelFlowAB.position.set(-0.85, 0.55, 1.55)
    labelFlowBC.position.set(0.85, 0.25, 1.55)
    chambers.A.label.position.set(0, maxColH + 0.72, -1.35)
    chambers.B.label.position.set(0, maxColH + 0.72, -1.35)
    chambers.C.label.position.set(0, maxColH + 0.72, -1.35)
  } else {
    labelFlowAB.position.set(-0.85, -1.96, 0.95)
    labelFlowBC.position.set(0.88, -2.28, 0.95)
    chambers.A.label.position.set(0, maxColH + 0.72, 0.1)
    chambers.B.label.position.set(0, maxColH + 0.72, 0.1)
    chambers.C.label.position.set(0, maxColH + 0.72, 0.1)
  }

  updateLabelCached(labelFlowAB, mob ? `A→B:${pop.actA.toFixed(0)}` : `λ_A N_A=${pop.actA.toFixed(0)}`, '#67e8f9', '#22d3ee', 0.38)
  updateLabelCached(labelFlowBC, mob ? `B→C:${pop.actB.toFixed(0)}` : `λ_B N_B=${pop.actB.toFixed(0)}`, '#fde68a', '#fbbf24', 0.38)

  // グラフ上のライブカーソル
  const curX = axX0 + (t / maxTime.value) * axW
  const arr = curGeo.getAttribute('position').array
  arr[0] = curX; arr[1] = axY0; arr[2] = 0.04
  arr[3] = curX; arr[4] = axY0 + axH; arr[5] = 0.04
  curGeo.getAttribute('position').needsUpdate = true

  if (!isActivity) {
    dotA.position.set(curX, axY0 + Math.min(1, pop.NA / maxYVal) * axH, 0.09)
    dotB.position.set(curX, axY0 + Math.min(1, pop.NB / maxYVal) * axH, 0.10)
    dotC.position.set(curX, axY0 + Math.min(1, pop.NC / maxYVal) * axH, 0.08)
    dotC.visible = true
  } else {
    dotA.position.set(curX, axY0 + Math.min(1, pop.actA / maxYVal) * axH, 0.09)
    dotB.position.set(curX, axY0 + Math.min(1, pop.actB / maxYVal) * axH, 0.10)
    dotC.visible = false
  }
}

watch([halfLifeA, halfLifeB, graphMode], () => {
  rebuildCurves()
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
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.sim-header {
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.08rem;
  color: #38bdf8;
}

.header-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
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

.badge {
  font-size: 0.74rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid;
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

.dot-a { background: #22d3ee; box-shadow: 0 0 6px #10b981; }
.dot-b { background: #fbbf24; box-shadow: 0 0 6px #f97316; }
.dot-c { background: #a855f7; box-shadow: 0 0 6px #a855f7; }

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
  font-size: 0.76rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.status-card {
  background: rgba(15, 23, 42, 0.7);
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-card.highlight-box {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.status-card .lbl {
  font-size: 0.72rem;
  color: #94a3b8;
}

.status-card .val {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: #f1f5f9;
}

.status-card .val.highlight {
  color: #fbbf24;
}

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
}

.preset-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.32rem 0.68rem;
  font-size: 0.74rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #334155;
  color: #ffffff;
  border-color: #38bdf8;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control-group label {
  font-size: 0.78rem;
  color: #cbd5e1;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn {
  padding: 6px 14px;
  font-size: 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
  border: none;
}

.btn-reset {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}

@media (max-width: 640px) {
  .sim-container {
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
}
</style>
