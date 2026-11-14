<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧊</span>
        <h3>3D 熱量保存則・比熱・潜熱（相転移加熱曲線）シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        物質の3態（固体・液体・気体）と熱量保存則 <i>Q</i><sub>得</sub> = <i>Q</i><sub>失</sub>。
        比熱による温度上昇 <i>Q</i> = <i>mc</i>Δ<i>T</i> と、状態変化に伴う潜熱（融解熱 334 J/g・蒸発熱 2260 J/g）による温度一定プラトー、および氷と温水を混合した熱平衡の行方を3D空間で完全シミュレーションします。
      </p>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="chip-btn"
          :class="{ active: activeCam === '3d' }"
          @click="setCamera('3d')"
        >
          🎥 3D 俯瞰
        </button>
        <button
          class="chip-btn"
          :class="{ active: activeCam === 'front' }"
          @click="setCamera('front')"
        >
          📐 正面断面 (fov=14)
        </button>
        <button
          class="chip-btn"
          :class="{ active: activeCam === 'top' }"
          @click="setCamera('top')"
        >
          🔼 上面 (fov=14)
        </button>
      </div>
      <div class="preset-group">
        <button
          class="chip-btn"
          :class="{ active: showHeatParticles }"
          @click="showHeatParticles = !showHeatParticles"
        >
          {{ showHeatParticles ? '✨ 熱流 Q 粒子: ON' : '✨ 熱流 Q 粒子: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : (mixProgress >= 0.99 ? '▶ 混合過程を再生' : '▶ 再生') }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="replayMix">🔄 混合を最初から</button>
      <button class="btn btn-secondary" @click="resetDefault">↺ 標準条件</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-ice"></i><span class="legend-text">氷・低温相 (0℃以下)</span></span>
          <span class="legend-item"><i class="dot-water"></i><span class="legend-text">高温側 <i>T</i><sub>w</sub>(<i>t</i>) / 熱流 <b>Q</b></span></span>
          <span class="legend-item"><i class="dot-eq"></i><span class="legend-text">平衡温度 <b><i>T</i><sub>f</sub></b></span></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータスストリップ（ビューポート外直下に配置して装置を覆わない） -->
    <div class="mode-status-strip">
      <span class="state-badge" :class="stateClass">
        熱平衡状態: <strong>{{ equilibriumResult.desc }}</strong>
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>投入する氷の質量 <i>m</i><sub>ice</sub>: <strong>{{ iceMassG }} g</strong></span>
            <input type="range" v-model.number="iceMassG" min="10" max="150" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>氷の初期温度 <i>T</i><sub>ice</sub>: <strong>{{ iceTempC }} ℃</strong></span>
            <input type="range" v-model.number="iceTempC" min="-40" max="0" step="2" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>容器内の温水の質量 <i>m</i><sub>w</sub>: <strong>{{ waterMassG }} g</strong></span>
            <input type="range" v-model.number="waterMassG" min="50" max="300" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>温水の初期温度 <i>T</i><sub>w</sub>: <strong>{{ waterTempC }} ℃</strong></span>
            <input type="range" v-model.number="waterTempC" min="20" max="95" step="5" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="setPreset('allMelt')">
          ☀️ すべて融解する条件 (氷30g / 温水150g, 60℃)
        </button>
        <button class="btn btn-secondary" @click="setPreset('coexist')">
          ❄️ 氷水共存 (0℃留まり) 条件 (氷100g / 温水80g, 40℃)
        </button>
        <button class="btn btn-secondary" @click="setPreset('fullFreeze')">
          🧊 全凍結条件 (氷140g, -40℃ / 温水50g, 20℃)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">最終平衡温度 <i>T</i><sub>f</sub></span>
        <span class="value highlight">{{ equilibriumResult.tempC.toFixed(1) }} <span class="unit">℃</span></span>
        <span class="subtext">熱量保存則 <i>Q</i><sub>得</sub> = <i>Q</i><sub>失</sub></span>
      </div>

      <div class="stat-card">
        <span class="label">残存する氷の質量</span>
        <span class="value">{{ equilibriumResult.remainingIceG.toFixed(1) }} <span class="unit">g</span></span>
        <span class="subtext">融解した氷: {{ (iceMassG - equilibriumResult.remainingIceG).toFixed(1) }} g</span>
      </div>

      <div class="stat-card">
        <span class="label">氷の全融解に必要な熱量 <i>Q</i><sub>1</sub></span>
        <span class="value">{{ (qRequiredToMelt / 1e3).toFixed(1) }} <span class="unit">kJ</span></span>
        <span class="subtext"><i>m</i><sub>ice</sub> <i>c</i><sub>ice</sub> |<i>T</i><sub>ice</sub>| + <i>m</i><sub>ice</sub> <i>L</i><sub>f</sub></span>
      </div>

      <div class="stat-card">
        <span class="label">温水が0℃までに放出可能な熱量 <i>Q</i><sub>2</sub></span>
        <span class="value">{{ (qAvailableFromWater / 1e3).toFixed(1) }} <span class="unit">kJ</span></span>
        <span class="subtext"><i>m</i><sub>w</sub> <i>c</i><sub>w</sub> <i>T</i><sub>w</sub></span>
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

const iceMassG = ref(50)
const iceTempC = ref(-15)
const waterMassG = ref(150)
const waterTempC = ref(50)

const activeCam = ref('3d')
const showHeatParticles = ref(true)
const isPlaying = ref(true)
const timeScale = ref(1.0)
// Start at equilibrium (1.0) on initial load so curves, equilibrium dot & live convection look crisp immediately;
// clicking Play/Replay animates mixProgress from 0 -> 1.0 in real time.
const mixProgress = ref(1.0)

// 物理定数
const c_ice = 2.10   // J/(g·K)
const L_f = 334      // J/g (氷の融解熱)
const c_water = 4.18 // J/(g·K)

// 氷を 0℃ に加熱し、すべて融解するのに必要な熱量
const qHeatIceTo0 = computed(() => iceMassG.value * c_ice * Math.abs(iceTempC.value))
const qMeltAllIce = computed(() => iceMassG.value * L_f)
const qRequiredToMelt = computed(() => qHeatIceTo0.value + qMeltAllIce.value)

// 温水が 0℃ まで冷えるときに放出できる熱量
const qAvailableFromWater = computed(() => waterMassG.value * c_water * waterTempC.value)

// 熱平衡計算
const equilibriumResult = computed(() => {
  const qNeedToWarmIce = qHeatIceTo0.value
  const qAvail = qAvailableFromWater.value

  if (qAvail < qNeedToWarmIce) {
    const qWaterFreeze = waterMassG.value * L_f
    const qTotalAvail = qAvail + qWaterFreeze
    const totalIce = iceMassG.value + waterMassG.value
    const finalT = -Math.max(0.1, (qNeedToWarmIce - qTotalAvail) / (totalIce * c_ice))
    return {
      caseType: 'freeze',
      tempC: finalT,
      remainingIceG: totalIce,
      desc: `全凍結・氷相 (${finalT.toFixed(1)}℃)`
    }
  } else if (qAvail < qRequiredToMelt.value) {
    const qLeftForMelting = qAvail - qNeedToWarmIce
    const meltedG = qLeftForMelting / L_f
    const remainingIce = iceMassG.value - meltedG
    return {
      caseType: 'coexist',
      tempC: 0.0,
      remainingIceG: remainingIce,
      desc: `氷水共存 (0.0℃ 平衡, 氷${remainingIce.toFixed(1)}g 残留)`
    }
  } else {
    const qSurplus = qAvail - qRequiredToMelt.value
    const totalWaterG = iceMassG.value + waterMassG.value
    const finalT = qSurplus / (totalWaterG * c_water)
    return {
      caseType: 'melt',
      tempC: finalT,
      remainingIceG: 0,
      desc: `全融解・水相 (${finalT.toFixed(1)}℃)`
    }
  }
})

const stateClass = computed(() => {
  const res = equilibriumResult.value
  if (res.tempC > 0) return 'water'
  if (res.remainingIceG > 0 && res.remainingIceG < iceMassG.value) return 'coexist'
  return 'ice'
})

function setPreset(type) {
  if (type === 'allMelt') {
    iceMassG.value = 30
    iceTempC.value = -10
    waterMassG.value = 150
    waterTempC.value = 60
  } else if (type === 'coexist') {
    iceMassG.value = 100
    iceTempC.value = -20
    waterMassG.value = 80
    waterTempC.value = 40
  } else if (type === 'fullFreeze') {
    iceMassG.value = 140
    iceTempC.value = -40
    waterMassG.value = 50
    waterTempC.value = 20
  }
  replayMix()
}

function togglePlay() {
  if (!isPlaying.value && mixProgress.value >= 0.99) {
    mixProgress.value = 0
  }
  isPlaying.value = !isPlaying.value
}

function replayMix() {
  mixProgress.value = 0
  isPlaying.value = true
}

function resetDefault() {
  iceMassG.value = 50
  iceTempC.value = -15
  waterMassG.value = 150
  waterTempC.value = 50
  mixProgress.value = 1.0
  isPlaying.value = true
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
    ? Math.min(1.95, Math.max(1.48, 1.72 / Math.max(0.72, aspect)))
    : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0.12, 0.08, 36.8 * ms], target: [0.12, 0.08, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.12, 37.8 * ms, 0.15], target: [0.12, 0, 0], fov: 14 }
  }
  return { pos: [0.45 * ms, 4.35 * ms, 12.2 * ms], target: [0.12, 0.05, 0], fov: 40 }
}

function setCamera(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
  syncStaticState()
}

const labelCache = {}
function updateLabelCached(sprite, key, text, color, borderColor, baseScale = 0.46) {
  const mult = isMobileViewport() ? 1.72 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}`
  if (labelCache[key] !== sig) {
    labelCache[key] = sig
    sprite.updateText(text, color, borderColor)
  }
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  if (Math.abs(sprite.scale.y - h) > 0.004) {
    sprite.scale.set(h * asp, h, 1)
  }
}

// ==========================================================
// 時間変化曲線 T_w(p), T_ice(p) の評価 (p in [0, 1])
// ==========================================================
function evaluateTimeCurves(p) {
  const res = equilibriumResult.value
  const Tw0 = waterTempC.value
  const Ti0 = iceTempC.value
  const Tf = res.tempC

  let Tw = Tf
  let Ti = Tf
  let curIceG = res.remainingIceG

  if (res.caseType === 'melt') {
    // 0 -> p1: 氷が Ti0 -> 0℃, 温水が下降
    // p1 -> p2: 氷が 0℃ で融解プラトー (Lf), 温水がさらに下降
    // p2 -> 1.0: 全融解後の水が Tf に収束
    const p1 = 0.18
    const p2 = 0.62
    const T_at_p1 = Tw0 - (Tw0 - Tf) * 0.25
    const T_at_p2 = Tw0 - (Tw0 - Tf) * 0.72
    const T_melt_at_p2 = Math.max(0, Tf * 0.15)

    if (p <= p1) {
      const u = p / p1
      Ti = Ti0 + (0 - Ti0) * u
      Tw = Tw0 + (T_at_p1 - Tw0) * u
      curIceG = iceMassG.value
    } else if (p <= p2) {
      const u = (p - p1) / (p2 - p1)
      Ti = 0
      Tw = T_at_p1 + (T_at_p2 - T_at_p1) * u
      curIceG = iceMassG.value * (1 - u)
    } else {
      const u = (p - p2) / (1 - p2)
      const ease = 1 - Math.pow(1 - u, 2)
      Ti = T_melt_at_p2 + (Tf - T_melt_at_p2) * ease
      Tw = T_at_p2 + (Tf - T_at_p2) * ease
      curIceG = 0
    }
  } else if (res.caseType === 'coexist') {
    const p1 = 0.22
    const T_at_p1 = Tw0 * 0.72
    if (p <= p1) {
      const u = p / p1
      Ti = Ti0 + (0 - Ti0) * u
      Tw = Tw0 + (T_at_p1 - Tw0) * u
      curIceG = iceMassG.value
    } else {
      const u = (p - p1) / (1 - p1)
      const ease = 1 - Math.pow(1 - u, 1.8)
      Ti = 0
      Tw = T_at_p1 * (1 - ease)
      curIceG = iceMassG.value - (iceMassG.value - res.remainingIceG) * ease
    }
  } else {
    // 全凍結: 温水が 0℃ に冷え、0℃ 凝固プラトーを経て全体が Tf < 0℃ へ
    const p1 = 0.25
    const p2 = 0.72
    if (p <= p1) {
      const u = p / p1
      Tw = Tw0 * (1 - u)
      Ti = Ti0 + (Tf - Ti0) * 0.35 * u
      curIceG = iceMassG.value
    } else if (p <= p2) {
      const u = (p - p1) / (p2 - p1)
      Tw = 0
      Ti = Ti0 + (Tf - Ti0) * (0.35 + 0.45 * u)
      curIceG = iceMassG.value + waterMassG.value * u
    } else {
      const u = (p - p2) / (1 - p2)
      Tw = Tf * u
      Ti = Ti0 + (Tf - Ti0) * (0.8 + 0.2 * u)
      curIceG = iceMassG.value + waterMassG.value
    }
  }

  return { Tw, Ti, curIceG }
}

// Thermal color coding: Cold (#38bdf8 ice cyan) <-> Warm (#f97316) <-> Hot (#ef4444 ember red)
function tempToColor(tempC) {
  const c = new THREE.Color()
  const cold = new THREE.Color(0x38bdf8)
  const warm = new THREE.Color(0xf97316)
  const hot = new THREE.Color(0xef4444)
  if (tempC <= 0) {
    return c.copy(cold)
  } else if (tempC < 45) {
    return c.copy(cold).lerp(warm, tempC / 45)
  } else {
    return c.copy(warm).lerp(hot, Math.min(1, (tempC - 45) / 50))
  }
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
let sceneObjs = null
let lastIsMob = false

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
      // Normal in XY plane, binormal along Z
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

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 130,
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
        syncStaticState()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // 床グリッド
  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0.15, -2.55, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D 断熱熱量計容器 (中心 x = -3.3)
  // ======================================================
  const vesselGroup = new THREE.Group()
  vesselGroup.position.set(-3.3, -2.2, 0)
  scene.add(vesselGroup)

  // 外槽底面台座
  const baseDiskGeo = new THREE.CylinderGeometry(2.12, 2.18, 0.22, 36)
  baseDiskGeo.translate(0, 0.11, 0)
  const baseDiskMesh = new THREE.Mesh(
    baseDiskGeo,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.35 })
  )
  baseDiskMesh.renderOrder = 1
  vesselGroup.add(baseDiskMesh)

  // 容器底部の熱交換金属ブロック / 加熱ステージ (温度連動発光)
  const metalBlockGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.50, 28)
  metalBlockGeo.translate(0, 0.47, 0)
  const metalBlockMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.45,
    metalness: 0.65,
    roughness: 0.25
  })
  const metalBlockMesh = new THREE.Mesh(metalBlockGeo, metalBlockMat)
  metalBlockMesh.renderOrder = 3
  vesselGroup.add(metalBlockMesh)

  // 熱交換コイルリング
  const heaterRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.055, 12, 36).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xef4444,
      emissiveIntensity: 0.55,
      roughness: 0.25
    })
  )
  heaterRing.position.set(0, 0.28, 0)
  heaterRing.renderOrder = 3
  vesselGroup.add(heaterRing)

  // 3D 水柱（温水/水相: depthWrite: false で内部ブロック・氷・温度計を遮蔽しない）
  const waterGeo = new THREE.CylinderGeometry(1.64, 1.64, 1.0, 36)
  waterGeo.translate(0, 0.5, 0)
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.22,
    transparent: true,
    opacity: 0.42,
    roughness: 0.15,
    depthWrite: false
  })
  const waterMesh = new THREE.Mesh(waterGeo, waterMat)
  waterMesh.position.set(0, 0.22, 0)
  waterMesh.renderOrder = 2
  vesselGroup.add(waterMesh)

  // 水面円盤 + リップルリング
  const surfaceDisk = new THREE.Mesh(
    new THREE.CircleGeometry(1.63, 36).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.26,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  surfaceDisk.renderOrder = 3
  vesselGroup.add(surfaceDisk)

  const surfaceRing = new THREE.Mesh(
    new THREE.RingGeometry(0.2, 1.56, 36).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  surfaceRing.renderOrder = 3
  vesselGroup.add(surfaceRing)

  // 3D 浮遊する氷キューブ群 (最大3個, 冷気シアン #38bdf8)
  const iceCubes = []
  const iceGeo = new THREE.BoxGeometry(0.66, 0.52, 0.66)
  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.85,
    roughness: 0.12,
    depthWrite: false
  })
  const iceOffsets = [
    [-0.56, 0.25],
    [0.42, 0.34],
    [-0.12, -0.52]
  ]
  for (let i = 0; i < 3; i++) {
    const cube = new THREE.Mesh(iceGeo, iceMat)
    cube.renderOrder = 3
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(iceGeo),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 })
    )
    edges.renderOrder = 3
    cube.add(edges)
    cube.userData = { ox: iceOffsets[i][0], oz: iceOffsets[i][1], phase: i * 2.1 }
    vesselGroup.add(cube)
    iceCubes.push(cube)
  }

  // 3D 精密温度計プローブ (感温球 + 赤色液柱 + 目盛りリング + 外側ガラス管)
  const thermoGroup = new THREE.Group()
  thermoGroup.position.set(1.12, 0.52, -0.35)
  vesselGroup.add(thermoGroup)

  const bulbMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.20, 20, 20),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.6,
      roughness: 0.2
    })
  )
  bulbMesh.renderOrder = 3
  thermoGroup.add(bulbMesh)

  const mercuryGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.0, 16)
  mercuryGeo.translate(0, 0.5, 0)
  const mercuryMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.72
  })
  const mercuryColumn = new THREE.Mesh(mercuryGeo, mercuryMat)
  mercuryColumn.position.set(0, 0.1, 0)
  mercuryColumn.renderOrder = 3
  thermoGroup.add(mercuryColumn)

  // 温度計目盛りリング (0℃, 50℃, 100℃)
  ;[
    { frac: (0 + 40) / 140, color: 0x38bdf8 },
    { frac: (50 + 40) / 140, color: 0xfbbf24 },
    { frac: (100 + 40) / 140, color: 0xef4444 }
  ].forEach(({ frac, color }) => {
    const tick = new THREE.Mesh(
      new THREE.TorusGeometry(0.115, 0.016, 8, 24).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color })
    )
    tick.position.set(0, 0.35 + frac * 3.15, 0)
    tick.renderOrder = 4
    thermoGroup.add(tick)
  })

  // 温度計ガラス管 (depthWrite: false, renderOrder: 6)
  const stemGlassGeo = new THREE.CylinderGeometry(0.10, 0.10, 3.85, 18)
  stemGlassGeo.translate(0, 1.92, 0)
  const stemGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.28,
    roughness: 0.08,
    depthWrite: false
  })
  const stemGlassMesh = new THREE.Mesh(stemGlassGeo, stemGlassMat)
  stemGlassMesh.renderOrder = 6
  thermoGroup.add(stemGlassMesh)

  // 熱移動 3D エネルギー粒子 (温水 -> 氷への熱流 Q)
  const heatParticles = []
  const hpGeo = new THREE.SphereGeometry(0.068, 12, 12)
  const hpMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.88 })
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(hpGeo, hpMat)
    m.renderOrder = 3
    m.userData = {
      angle: (i / 24) * Math.PI * 2,
      rad: 0.28 + (i % 4) * 0.28,
      yNorm: Math.random(),
      speed: 0.42 + (i % 5) * 0.12
    }
    vesselGroup.add(m)
    heatParticles.push(m)
  }

  // 熱流ベクトル矢印 Q (暖色オレンジ〜赤)
  const heatArrow = createVectorArrow3D({
    color: 0xf97316,
    shaftRadius: 0.048,
    headRadius: 0.14,
    headLength: 0.34
  })
  heatArrow.renderOrder = 4
  vesselGroup.add(heatArrow)

  // 内槽ガラスビーカー (depthWrite: false, renderOrder: 5)
  const innerWallGeo = new THREE.CylinderGeometry(1.72, 1.72, 3.85, 36, 1, true)
  innerWallGeo.translate(0, 2.05, 0)
  const innerWallMesh = new THREE.Mesh(
    innerWallGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  innerWallMesh.renderOrder = 5
  vesselGroup.add(innerWallMesh)

  const topRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.72, 0.045, 14, 48).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.25,
      roughness: 0.2
    })
  )
  topRim.position.set(0, 3.95, 0)
  topRim.renderOrder = 6
  vesselGroup.add(topRim)

  // 外槽（断熱ジャケット: depthWrite: false, renderOrder: 6）
  const outerWallGeo = new THREE.CylinderGeometry(2.04, 2.04, 4.05, 36, 1, true)
  outerWallGeo.translate(0, 2.05, 0)
  const outerWallMesh = new THREE.Mesh(
    outerWallGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.25,
      roughness: 0.2,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  outerWallMesh.renderOrder = 6
  vesselGroup.add(outerWallMesh)

  const outerRim = new THREE.Mesh(
    new THREE.TorusGeometry(2.04, 0.05, 14, 48).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 })
  )
  outerRim.position.set(0, 4.08, 0)
  outerRim.renderOrder = 6
  vesselGroup.add(outerRim)

  // 容器周りの3Dラベル (装置と非重複の座標に配置)
  const labelVessel = createTextSprite('断熱熱量計 (Q得 = Q失)', {
    color: '#e2e8f0',
    borderColor: 'rgba(148,163,184,0.45)',
    scale: 0.46
  })
  labelVessel.position.set(0, -0.45, 0.9)
  vesselGroup.add(labelVessel)

  const labelThermo = createTextSprite('液温 T = 0.0℃', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.46
  })
  labelThermo.position.set(1.15, 5.05, -0.85)
  vesselGroup.add(labelThermo)

  const labelIceState = createTextSprite('氷残留: 0.0g', {
    color: '#bae6fd',
    borderColor: '#38bdf8',
    scale: 0.45
  })
  labelIceState.position.set(-1.10, 4.18, 1.15)
  vesselGroup.add(labelIceState)

  // ======================================================
  // 2. 右側: 3D 実時間 T-t 冷却・加熱曲線ボード (中心 x = +3.15)
  // ======================================================
  const graphGroup = new THREE.Group()
  graphGroup.position.set(3.15, 0.05, 0)
  scene.add(graphGroup)

  const boardW = 5.7
  const boardH = 4.2
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
  boardBack.renderOrder = 1
  graphGroup.add(boardBack)

  const boardBorder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(boardW, boardH)),
    new THREE.LineBasicMaterial({ color: 0x475569 })
  )
  boardBorder.position.set(0, 0, -0.06)
  graphGroup.add(boardBorder)

  // T-t グラフ座標系: x in [-2.4, +2.4], y in [-1.65 (-40℃), +1.65 (100℃)]
  const xStart = -2.4
  const xEnd = 2.4
  const tempToBoardY = (tC) => -1.65 + ((Math.max(-40, Math.min(100, tC)) + 40) / 140) * 3.3

  // 0℃ と 100℃ の基準ライン
  const zeroY = tempToBoardY(0)
  const hundredY = tempToBoardY(100)

  const refZeroLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xStart - 0.15, zeroY, 0),
      new THREE.Vector3(xEnd + 0.15, zeroY, 0)
    ]),
    new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.65 })
  )
  refZeroLine.computeLineDistances()
  graphGroup.add(refZeroLine)

  const refHundredLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xStart - 0.15, hundredY, 0),
      new THREE.Vector3(xEnd + 0.15, hundredY, 0)
    ]),
    new THREE.LineDashedMaterial({ color: 0xef4444, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.55 })
  )
  refHundredLine.computeLineDistances()
  graphGroup.add(refHundredLine)

  // 軸矢印 (時間 t →, 温度 T ↑)
  const tAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.02, headRadius: 0.065, headLength: 0.18 })
  tAxis.setVector(new THREE.Vector3(xStart, -1.78, 0.02), new THREE.Vector3(1, 0, 0), 4.95)
  const tempAxis = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.02, headRadius: 0.065, headLength: 0.18 })
  tempAxis.setVector(new THREE.Vector3(xStart, -1.78, 0.02), new THREE.Vector3(0, 1, 0), 3.65)
  graphGroup.add(tAxis, tempAxis)

  // 動的 3D チューブ: 温水冷却曲線 Tw(t) & 氷加熱融解曲線 Tice(t)
  const curveSamples = 64
  const waterCurvePts = Array.from({ length: curveSamples + 1 }, () => new THREE.Vector3())
  const iceCurvePts = Array.from({ length: curveSamples + 1 }, () => new THREE.Vector3())

  const waterCurveTube = buildDynamicTube(
    curveSamples,
    0.048,
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xef4444,
      emissiveIntensity: 0.55,
      roughness: 0.2
    })
  )
  const iceCurveTube = buildDynamicTube(
    curveSamples,
    0.048,
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.2
    })
  )
  graphGroup.add(waterCurveTube.mesh, iceCurveTube.mesh)

  // 現在時刻カーソル線 + 2本のプロット球 + 平衡点ハロー
  const cursorGeo = new THREE.BufferGeometry()
  cursorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const cursorLine = new THREE.Line(
    cursorGeo,
    new THREE.LineDashedMaterial({ color: 0xf472b6, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.8 })
  )
  graphGroup.add(cursorLine)

  const waterDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xef4444, emissiveIntensity: 0.75 })
  )
  waterDot.renderOrder = 4
  const iceDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.75 })
  )
  iceDot.renderOrder = 4
  const eqMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 22, 22),
    new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.75 })
  )
  eqMarker.renderOrder = 4
  const eqHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.3, depthWrite: false })
  )
  eqHalo.renderOrder = 4
  eqMarker.add(eqHalo)
  graphGroup.add(waterDot, iceDot, eqMarker)

  // グラフ上ラベル
  const labelGraphTitle = createTextSprite('実時間 T-t 冷却・加熱曲線', {
    color: '#f8fafc',
    borderColor: 'rgba(148,163,184,0.45)',
    scale: 0.48
  })
  labelGraphTitle.position.set(0, 2.52, 0.1)
  graphGroup.add(labelGraphTitle)

  const labelZero = createTextSprite('0℃ 融解プラトー (Lf)', {
    color: '#7dd3fc',
    borderColor: 'rgba(56,189,248,0.5)',
    scale: 0.40
  })
  labelZero.position.set(0.45, zeroY - 0.36, 0.14)
  graphGroup.add(labelZero)

  const labelWaterCurve = createTextSprite('温水 Tw(t)', {
    color: '#fdba74',
    borderColor: '#f97316',
    scale: 0.41
  })
  graphGroup.add(labelWaterCurve)

  const labelIceCurve = createTextSprite('氷 Tice(t)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.41
  })
  graphGroup.add(labelIceCurve)

  const labelEqPoint = createTextSprite('平衡 Tf = 0.0℃', {
    color: '#f9a8d4',
    borderColor: '#ec4899',
    scale: 0.46
  })
  graphGroup.add(labelEqPoint)

  sceneObjs = {
    waterMesh,
    waterMat,
    surfaceDisk,
    surfaceRing,
    metalBlockMat,
    heaterRing,
    iceCubes,
    mercuryColumn,
    mercuryMat,
    bulbMesh,
    heatParticles,
    hpMat,
    heatArrow,
    labelVessel,
    labelThermo,
    labelIceState,
    labelGraphTitle,
    labelZero,
    labelWaterCurve,
    labelIceCurve,
    labelEqPoint,
    waterCurvePts,
    iceCurvePts,
    waterCurveTube,
    iceCurveTube,
    cursorGeo,
    cursorLine,
    waterDot,
    iceDot,
    eqMarker,
    xStart,
    xEnd,
    tempToBoardY,
    zeroY
  }

  syncStaticState()
}

function syncStaticState() {
  if (!sceneObjs) return
  const {
    labelVessel,
    labelThermo,
    labelIceState,
    labelGraphTitle,
    labelZero,
    labelWaterCurve,
    labelIceCurve,
    labelEqPoint,
    waterCurvePts,
    iceCurvePts,
    waterCurveTube,
    iceCurveTube,
    eqMarker,
    xStart,
    xEnd,
    tempToBoardY,
    zeroY
  } = sceneObjs

  const mob = isMobileViewport()
  const isTop = activeCam.value === 'top'
  const res = equilibriumResult.value

  // ビュー適応型のラベル表示制御（上面視点では垂直グラフ上の重なりを抑制）
  labelGraphTitle.visible = !isTop
  labelZero.visible = !isTop
  labelWaterCurve.visible = !isTop
  labelIceCurve.visible = !isTop
  labelEqPoint.visible = !isTop
  labelVessel.visible = !isTop

  // 容器ラベルのビュー別最適配置 (左端見切れゼロ)
  if (isTop) {
    labelIceState.position.set(0.45, 4.25, 2.35)
    labelThermo.position.set(0.95, 4.25, -2.25)
  } else {
    labelIceState.position.set(0.45, 4.30, 0.95)
    labelThermo.position.set(1.25, 5.18, -0.55)
  }

  // T-t 曲線の再構築
  const nSeg = waterCurvePts.length - 1
  for (let i = 0; i <= nSeg; i++) {
    const p = i / nSeg
    const bx = xStart + (xEnd - xStart) * p
    const { Tw, Ti } = evaluateTimeCurves(p)
    waterCurvePts[i].set(bx, tempToBoardY(Tw), 0.06)
    iceCurvePts[i].set(bx, tempToBoardY(Ti), 0.06)
  }
  waterCurveTube.updatePoints(waterCurvePts)
  iceCurveTube.updatePoints(iceCurvePts)

  // 平衡点マーカー (右端 x = xEnd)
  const eqY = tempToBoardY(res.tempC)
  eqMarker.position.set(xEnd, eqY, 0.1)

  // カーブ上の起点ラベル (左端付近で上下分離、0℃ラインは中央寄りに配置して重複ゼロ)
  const startTwY = tempToBoardY(waterTempC.value)
  const startTiY = tempToBoardY(iceTempC.value)
  labelWaterCurve.position.set(xStart + 0.88, Math.min(1.88, startTwY + 0.36), 0.16)
  labelIceCurve.position.set(xStart + 0.88, Math.max(-1.88, startTiY - 0.38), 0.16)
  labelZero.position.set(0.35, zeroY - 0.38, 0.14)

  updateLabelCached(
    labelWaterCurve,
    'wCurve',
    mob ? `Tw=${waterTempC.value}℃` : `温水 Tw=${waterTempC.value}℃`,
    '#fdba74',
    '#f97316',
    0.44
  )
  updateLabelCached(
    labelIceCurve,
    'iCurve',
    mob ? `Ti=${iceTempC.value}℃` : `氷 Ti=${iceTempC.value}℃`,
    '#7dd3fc',
    '#38bdf8',
    0.44
  )
  updateLabelCached(
    labelVessel,
    'vessel',
    mob ? '断熱熱量計' : '断熱熱量計 (Q得=Q失)',
    '#e2e8f0',
    'rgba(148,163,184,0.45)',
    0.48
  )
  updateLabelCached(
    labelGraphTitle,
    'gTitle',
    mob ? 'T-t 曲線' : '実時間 T-t 冷却・加熱曲線',
    '#f8fafc',
    'rgba(148,163,184,0.45)',
    0.48
  )
  updateLabelCached(
    labelZero,
    'zero',
    mob ? '0℃ (Lf)' : '0℃ 融解プラトー (Lf)',
    '#7dd3fc',
    'rgba(56,189,248,0.5)',
    0.44
  )

  const eqOffsetY = eqY > 0.95 ? -0.46 : 0.48
  labelEqPoint.position.set(xEnd - 0.35, eqY + eqOffsetY, 0.18)
  updateLabelCached(
    labelEqPoint,
    'eqPt',
    mob ? `Tf=${res.tempC.toFixed(1)}℃` : `平衡 Tf = ${res.tempC.toFixed(1)}℃`,
    '#f9a8d4',
    '#ec4899',
    0.46
  )
}

function updateFrame(dt, elapsed) {
  if (!sceneObjs) return

  if (isPlaying.value && mixProgress.value < 1.0) {
    mixProgress.value = Math.min(1.0, mixProgress.value + dt * 0.24 * timeScale.value)
  }

  const {
    waterMesh,
    waterMat,
    surfaceDisk,
    surfaceRing,
    metalBlockMat,
    heaterRing,
    iceCubes,
    mercuryColumn,
    mercuryMat,
    heatParticles,
    hpMat,
    heatArrow,
    labelThermo,
    labelIceState,
    cursorGeo,
    cursorLine,
    waterDot,
    iceDot,
    xStart,
    xEnd,
    tempToBoardY
  } = sceneObjs

  const mob = isMobileViewport()
  const p = mixProgress.value
  const { Tw, Ti, curIceG } = evaluateTimeCurves(p)

  // 水量・水面位置更新
  const curLiquidG = Math.max(10, (iceMassG.value - curIceG) + waterMassG.value)
  const waterH = Math.min(3.2, Math.max(0.7, (curLiquidG / 360) * 3.05))
  waterMesh.scale.set(1, waterH, 1)
  const waterTopY = 0.22 + waterH
  surfaceDisk.position.set(0, waterTopY + 0.01, 0)
  surfaceRing.position.set(0, waterTopY + 0.02, 0)

  const sScale = 0.95 + Math.sin(elapsed * 2.5) * 0.03
  surfaceRing.scale.set(sScale, 1, sScale)

  // 温度に応じた熱的カラーコーディング (#38bdf8 <-> #f97316 / #ef4444)
  const bathColor = tempToColor(Tw)
  waterMat.color.copy(bathColor)
  waterMat.emissive.copy(bathColor).multiplyScalar(0.32)
  metalBlockMat.color.copy(bathColor)
  metalBlockMat.emissive.copy(bathColor).multiplyScalar(0.45)
  heaterRing.material.color.copy(bathColor)
  heaterRing.material.emissive.copy(bathColor).multiplyScalar(0.6)

  // 温度計プローブ (現在液温 Tw)
  const tempNorm = Math.min(1, Math.max(0.05, (Tw + 40) / 140))
  const mercH = 0.32 + tempNorm * 3.15
  mercuryColumn.scale.set(1, mercH, 1)
  const mercColor = Tw > 0 ? new THREE.Color(0xf43f5e) : new THREE.Color(0x38bdf8)
  mercuryMat.color.copy(mercColor)
  mercuryMat.emissive.copy(mercColor)

  updateLabelCached(
    labelThermo,
    'thermo',
    mob ? `T=${Tw.toFixed(1)}℃` : `液温 T = ${Tw.toFixed(1)}℃`,
    Tw > 0 ? '#fda4af' : '#7dd3fc',
    Tw > 0 ? '#f43f5e' : '#38bdf8',
    0.47
  )

  if (curIceG > 0.5) {
    updateLabelCached(
      labelIceState,
      'ice',
      mob ? `氷:${curIceG.toFixed(0)}g` : `氷残留: ${curIceG.toFixed(1)} g`,
      '#e0f2fe',
      '#38bdf8',
      0.46
    )
  } else {
    updateLabelCached(
      labelIceState,
      'ice',
      mob ? '氷全融解' : '氷は完全融解 (0.0 g)',
      '#6ee7b7',
      '#10b981',
      0.46
    )
  }

  // 浮遊する氷キューブ
  const numActiveCubes = curIceG > 45 ? 3 : curIceG > 15 ? 2 : curIceG > 0.5 ? 1 : 0
  const cubeScale = Math.min(1.15, Math.max(0.38, curIceG / 75))
  iceCubes.forEach((cube, idx) => {
    if (idx < numActiveCubes) {
      cube.visible = true
      cube.scale.setScalar(cubeScale)
      const bob = Math.sin(elapsed * 2.4 + cube.userData.phase) * 0.055
      cube.position.set(cube.userData.ox, waterTopY - 0.08 * cubeScale + bob, cube.userData.oz)
      cube.rotation.y = elapsed * 0.35 + idx
      cube.rotation.z = Math.sin(elapsed * 1.8 + idx) * 0.08
    } else {
      cube.visible = false
    }
  })

  // 熱流 Q 粒子と矢印 (温水 -> 氷)
  const fluxIntensity = Math.min(1, Math.max(0.22, Math.abs(Tw - Ti) / 50 + 0.2))
  hpMat.color.copy(Tw > 15 ? new THREE.Color(0xf97316) : new THREE.Color(0x38bdf8))
  heatParticles.forEach((hp) => {
    hp.visible = showHeatParticles.value
    if (!showHeatParticles.value) return
    hp.userData.yNorm = (hp.userData.yNorm + dt * hp.userData.speed * timeScale.value * (0.6 + fluxIntensity)) % 1.0
    const y = 0.35 + hp.userData.yNorm * Math.max(0.5, waterH - 0.15)
    const ang = hp.userData.angle + elapsed * 0.85
    hp.position.set(Math.cos(ang) * hp.userData.rad, y, Math.sin(ang) * hp.userData.rad)
  })

  if (showHeatParticles.value && Math.abs(Tw - Ti) > 0.5) {
    heatArrow.setVector(
      new THREE.Vector3(-1.05, 0.65, 0.85),
      new THREE.Vector3(0, 1, 0),
      Math.max(0.75, waterH * 0.68)
    )
  } else {
    heatArrow.visible = false
  }

  // T-t グラフのライブカーソル位置更新
  const curX = xStart + (xEnd - xStart) * p
  const curTwY = tempToBoardY(Tw)
  const curTiY = tempToBoardY(Ti)
  waterDot.position.set(curX, curTwY, 0.12)
  iceDot.position.set(curX, curTiY, 0.12)

  const cArr = cursorGeo.getAttribute('position').array
  cArr[0] = curX; cArr[1] = -1.72; cArr[2] = 0.05
  cArr[3] = curX; cArr[4] = 1.72; cArr[5] = 0.05
  cursorGeo.getAttribute('position').needsUpdate = true
  cursorLine.computeLineDistances()
}

watch([iceMassG, iceTempC, waterMassG, waterTempC], () => {
  syncStaticState()
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
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 24px 0;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #38bdf8;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.three-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.icon {
  font-size: 1.4rem;
}

.subtitle {
  font-size: 0.86rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 12px 0;
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
  transition: all 0.2s;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
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
  font-size: 0.78rem;
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
  font-size: 0.76rem;
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
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.73rem;
  color: #e2e8f0;
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

.dot-ice { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-water { background: #f97316; box-shadow: 0 0 6px #ef4444; }
.dot-eq { background: #ec4899; box-shadow: 0 0 6px #ec4899; }

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
  font-size: 0.78rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
}

.state-badge.water {
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.state-badge.coexist {
  background: rgba(251, 191, 36, 0.14);
  border: 1px solid rgba(251, 191, 36, 0.45);
  color: #fde68a;
}

.state-badge.ice {
  background: rgba(148, 163, 184, 0.16);
  border: 1px solid rgba(148, 163, 184, 0.45);
  color: #e2e8f0;
}

.control-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 14px;
  margin-top: 12px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.84rem;
  color: #f8fafc;
}

.control-group strong {
  color: #38bdf8;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0284c7;
  color: #ffffff;
  border: none;
}

.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}

.btn-secondary:hover {
  background: #475569;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-left: 3px solid #38bdf8;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.15rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #f43f5e;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
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
    border-radius: 10px;
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
