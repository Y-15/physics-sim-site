<template>
  <div class="lab" style="--ac:#f97316;--ac2:#3b82f6">
    <div class="lab-head">
      <span class="lab-title">🔥 3D 気体の状態変化・P-V図と熱力学第1法則 実験室</span>
      <div class="head-badges">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ stateName }}</span>
      </div>
    </div>

    <!-- 変化モード切替タブ -->
    <div class="mode-tab-bar">
      <button class="lab-btn" :class="{ primary: procMode === 'isochoric', 'lab-btn-pri': procMode === 'isochoric' }" @click="setMode('isochoric')">
        🔒 定積変化 (ΔV=0)
      </button>
      <button class="lab-btn" :class="{ primary: procMode === 'isobaric', 'lab-btn-pri': procMode === 'isobaric' }" @click="setMode('isobaric')">
        ⚖️ 定圧変化 (P一定)
      </button>
      <button class="lab-btn" :class="{ primary: procMode === 'isothermal', 'lab-btn-pri': procMode === 'isothermal' }" @click="setMode('isothermal')">
        🌡️ 等温変化 (T一定)
      </button>
      <button class="lab-btn" :class="{ primary: procMode === 'adiabatic', 'lab-btn-pri': procMode === 'adiabatic' }" @click="setMode('adiabatic')">
        🛡️ 断熱変化 (Q=0)
      </button>
      <button class="lab-btn" :class="{ primary: procMode === 'cycle', 'lab-btn-pri': procMode === 'cycle' }" @click="setMode('cycle')">
        🔄 熱機関サイクル (A→B→C→D→A)
      </button>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面 (fov=14)
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面 (fov=14)
        </button>
      </div>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: showVectors }" @click="showVectors = !showVectors">
          {{ showVectors ? '🏹 熱・仕事ベクトル: ON' : '🏹 熱・仕事ベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="togglePlay" style="padding: 6px 15px; border-radius: 8px;">
        {{ isPlayingNow ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.84rem;">
        ⏭ コマ送り
      </button>
      <button class="lab-btn" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.84rem;">
        🔄 リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-cold"></i>低速/低温 → <i class="dot-mid"></i> → <i class="dot-hot"></i>高速/高温</span>
          <span class="legend-item"><i class="dot-q"></i>熱流 <b>Q</b></span>
          <span class="legend-item"><i class="dot-w"></i>膨張仕事 <b>W'&gt;0</b></span>
          <span class="legend-item"><i class="dot-comp"></i>圧縮負荷 <b>W'&lt;0</b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 非重複ステータスストリップ -->
    <div class="mode-status-strip">
      <span class="three-ortho-badge">
        第1法則: Q ({{ currentQ >= 0 ? '+' : '' }}{{ currentQ.toFixed(0) }} J) = ΔU ({{ currentDeltaU >= 0 ? '+' : '' }}{{ currentDeltaU.toFixed(0) }} J) + W' ({{ currentW >= 0 ? '+' : '' }}{{ currentW.toFixed(0) }} J)
      </span>
    </div>

    <div class="lab-controls">
      <div v-if="procMode !== 'cycle'" class="lab-ctrl">
        <label>操作パラメーター (進行度): <strong>{{ progress.toFixed(0) }}%</strong></label>
        <input type="range" v-model.number="progress" min="0" max="100" step="1" @input="autoSweep = false" />
        <div class="lab-note">{{ procHelpText }}</div>
      </div>
      <div v-else class="lab-ctrl">
        <label>サイクルのアニメーション操作</label>
        <div class="lab-row">
          <button class="lab-btn" @click="cycleRunning = !cycleRunning">{{ cycleRunning ? '⏸️ 一時停止' : '▶️ サイクル再生' }}</button>
          <button class="lab-chip" @click="cycleProgress = 0">初期状態 A にリセット</button>
        </div>
      </div>
      <div class="lab-ctrl">
        <label>気体の種類（単原子分子理想気体）</label>
        <div class="lab-row">
          <span style="font-size:12px;color:#94a3b8">モル数 <i>n</i> = 1.0 mol, 定積モル比熱 <i>C</i><sub><i>V</i></sub> = (3/2)<i>R</i>, 比熱比 <i>γ</i> = 5/3 (≈ 1.67)</span>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">熱力学第1法則</div>
        <div class="v" style="font-size:17px;color:#f97316"><i>Q</i> = Δ<i>U</i> + <i>W'</i></div>
        <div class="f">吸収熱 = 内部エネルギー増加 + 気体が外部にした仕事</div>
      </div>
      <div class="lab-stat">
        <div class="k">圧力 P</div>
        <div class="v" style="color:#ef4444">{{ currentP.toFixed(1) }} <small>kPa</small></div>
        <div class="f"><i>PV</i> = <i>nRT</i> より計算</div>
      </div>
      <div class="lab-stat">
        <div class="k">体積 V</div>
        <div class="v" style="color:#38bdf8">{{ currentV.toFixed(2) }} <small>×10⁻² m³</small></div>
        <div class="f">シリンダーのピストン位置</div>
      </div>
      <div class="lab-stat">
        <div class="k">絶対温度 T</div>
        <div class="v" style="color:#f59e0b">{{ currentT.toFixed(0) }} <small>K</small></div>
        <div class="f">内部エネルギー <i>U</i> = (3/2)<i>nRT</i></div>
      </div>
      <div class="lab-stat">
        <div class="k">気体がした仕事 W'</div>
        <div class="v" :style="{ color: currentW >= 0 ? '#10b981' : '#f43f5e' }">
          {{ currentW.toFixed(0) }} <small>J</small>
        </div>
        <div class="f">P-V グラフ下の面積（膨張なら正、圧縮なら負）</div>
      </div>
      <div class="lab-stat">
        <div class="k">吸収した熱量 Q</div>
        <div class="v" :style="{ color: currentQ >= 0 ? '#f97316' : '#38bdf8' }">
          {{ currentQ.toFixed(0) }} <small>J</small>
        </div>
        <div class="f">Q = ΔU + W'</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const R = 8.314 // 気体定数 J/(mol·K)
const n = 1.0 // 1 mol
const gamma = 5 / 3 // 単原子分子

const procMode = ref('isobaric')
const progress = ref(75) // 0〜100
const cycleProgress = ref(0)
const cycleRunning = ref(true)
const autoSweep = ref(false)
let sweepDir = 1
const molsRunning = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')
const showVectors = ref(true)

const threeContainer = ref(null)
let threeCtx = null
let resizeObs = null
let lastIsMob = false

function setMode(m) {
  procMode.value = m
  progress.value = 75
  cycleProgress.value = 0
  autoSweep.value = false
  sweepDir = 1
  if (m === 'cycle') {
    cycleRunning.value = true
  }
  molsRunning.value = true
}

const isPlayingNow = computed(() => {
  if (procMode.value === 'cycle') return cycleRunning.value
  return autoSweep.value && molsRunning.value
})

function togglePlay() {
  if (procMode.value === 'cycle') {
    cycleRunning.value = !cycleRunning.value
    molsRunning.value = cycleRunning.value
  } else {
    autoSweep.value = !autoSweep.value
    molsRunning.value = true
  }
}

function stepSim() {
  if (procMode.value === 'cycle') {
    cycleRunning.value = false
    cycleProgress.value += 0.16 * timeScale.value
  } else {
    autoSweep.value = false
    let next = progress.value + 5 * sweepDir
    if (next >= 100) { next = 100; sweepDir = -1 }
    if (next <= 0) { next = 0; sweepDir = 1 }
    progress.value = next
  }
  advanceMolecules(0.05)
  updateVisuals(0.05)
}

function resetSim() {
  if (procMode.value === 'cycle') {
    cycleProgress.value = 0
    cycleRunning.value = true
    molsRunning.value = true
  } else {
    progress.value = 75
    autoSweep.value = false
    sweepDir = 1
    molsRunning.value = true
  }
  rebuildPVCurve()
}

const stateName = computed(() => {
  switch (procMode.value) {
    case 'isochoric': return '定積変化（加熱・冷却）'
    case 'isobaric': return '定圧変化（等圧膨張・圧縮）'
    case 'isothermal': return '等温変化（ボイルの法則）'
    case 'adiabatic': return '断熱変化（ポアソンの法則）'
    case 'cycle': return '熱機関サイクル（1周で正味の仕事）'
  }
})

const procHelpText = computed(() => {
  switch (procMode.value) {
    case 'isochoric': return '体積固定。熱を加えると温度と圧力が比例して上昇（W=0, Q=ΔU）'
    case 'isobaric': return 'ピストンが動いて圧力一定。加熱すると体積と温度が上昇（W=PΔV, Q=⁵⁄₂nRΔT）'
    case 'isothermal': return '温度一定。ゆっくりピストンを動かす（PV=一定, ΔU=0, Q=W）'
    case 'adiabatic': return '急激な移動で熱の出入りなし（Q=0, W=-ΔU。膨張すると温度低下！）'
    default: return ''
  }
})

// 基準状態 (P0, V0, T0)
const P0 = 100.0 // kPa
const V0 = 2.49 // x 10^-2 m^3
const T0 = 300.0 // K

// 現在の P, V, T, ΔU, W', Q の計算
const thermoState = computed(() => {
  const t = progress.value / 100 // 0〜1

  if (procMode.value === 'isochoric') {
    const curT = 200 + t * 400
    const curV = V0
    const curP = P0 * (curT / T0)
    const deltaU = 1.5 * n * R * (curT - 300)
    const w = 0
    const q = deltaU + w
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  if (procMode.value === 'isobaric') {
    const curV = 1.4 + t * 2.2
    const curP = P0
    const curT = T0 * (curV / V0)
    const deltaU = 1.5 * n * R * (curT - 300)
    const w = P0 * 10 * (curV - V0)
    const q = deltaU + w
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  if (procMode.value === 'isothermal') {
    const curV = 1.4 + t * 2.6
    const curT = T0
    const curP = P0 * (V0 / curV)
    const deltaU = 0
    const w = n * R * curT * Math.log(curV / V0)
    const q = w
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  if (procMode.value === 'adiabatic') {
    const curV = 1.4 + t * 2.6
    const curP = P0 * Math.pow(V0 / curV, gamma)
    const curT = (curP * 1000 * (curV * 0.01)) / (n * R)
    const deltaU = 1.5 * n * R * (curT - T0)
    const q = 0
    const w = -deltaU
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  // サイクルモード: A(1.8, 180) -> B(3.6, 180) -> C(3.6, 80) -> D(1.8, 80) -> A
  const V1 = 1.8, V2 = 3.6
  const P_low = 80, P_high = 180
  const cT = cycleProgress.value % 4
  let cp = 0, cv = 0

  if (cT < 1) {
    const u = cT
    cv = V1 + (V2 - V1) * u
    cp = P_high
  } else if (cT < 2) {
    const u = cT - 1
    cv = V2
    cp = P_high + (P_low - P_high) * u
  } else if (cT < 3) {
    const u = cT - 2
    cv = V2 + (V1 - V2) * u
    cp = P_low
  } else {
    const u = cT - 3
    cv = V1
    cp = P_low + (P_high - P_low) * u
  }

  const curTemp = (cp * 1000 * (cv * 0.01)) / (n * R)
  const wNet = (P_high - P_low) * 10 * (V2 - V1)
  const qIn = 1.5 * n * R * ((P_high * 1000 * (V2 * 0.01)) / (n * R) - (P_low * 1000 * (V1 * 0.01)) / (n * R)) + P_high * 10 * (V2 - V1)

  return { p: cp, v: cv, t: curTemp, deltaU: 0, w: wNet, q: qIn }
})

const currentP = computed(() => thermoState.value.p)
const currentV = computed(() => thermoState.value.v)
const currentT = computed(() => thermoState.value.t)
const currentDeltaU = computed(() => thermoState.value.deltaU)
const currentW = computed(() => thermoState.value.w)
const currentQ = computed(() => thermoState.value.q)

// 現在の瞬間熱流方向（サイクル用にも判定）
const instantHeatSign = computed(() => {
  if (procMode.value === 'adiabatic') return 0
  if (procMode.value === 'cycle') {
    const cT = cycleProgress.value % 4
    if (cT < 1 || cT >= 3) return 1 // D->A (定積加熱), A->B (定圧膨張吸熱)
    return -1 // B->C (定積冷却), C->D (定圧圧縮放熱)
  }
  if (currentQ.value > 15) return 1
  if (currentQ.value < -15) return -1
  return 0
})

const instantWorkSign = computed(() => {
  if (procMode.value === 'isochoric') return 0
  if (procMode.value === 'cycle') {
    const cT = cycleProgress.value % 4
    if (cT < 1) return 1 // A->B 膨張
    if (cT >= 2 && cT < 3) return -1 // C->D 圧縮
    return 0
  }
  if (currentW.value > 15) return 1
  if (currentW.value < -15) return -1
  return 0
})

// ==========================================================
// カメラ & モバイルレスポンシブ補助
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(2.25, Math.max(1.42, 1.82 / Math.max(0.68, aspect))) : 1.0
}

function isMobileViewport() {
  if (!threeContainer.value) return false
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  return w / Math.max(1, h) < 1.35
}

function getCamParams(preset) {
  const s = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.25, 42.0 * s], target: [0, 0.2, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 42.0 * s, 0.05], target: [0, 0.1, 0], fov: 14 }
  }
  return { pos: [0.6 * s, 4.7 * s, 13.4 * s], target: [0, 0.15, 0], fov: 40 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

const labelCache = new Map()
function updateLabelCached(sprite, textStr, color, borderColor, baseScale = 0.46) {
  const mob = isMobileViewport()
  const targetH = mob ? baseScale * 1.58 : baseScale
  const sig = `${textStr}|${color}|${borderColor}`
  if (labelCache.get(sprite) !== sig) {
    labelCache.set(sprite, sig)
    sprite.updateText(textStr, color, borderColor)
  }
  const curAspect = sprite.scale.x / Math.max(0.01, sprite.scale.y)
  if (Math.abs(sprite.scale.y - targetH) > 0.004) {
    sprite.scale.set(targetH * curAspect, targetH, 1)
  }
}

// 速度/温度カラーグラデーション (#38bdf8 slow/cold -> #10b981 medium -> #f97316 -> #ef4444 fast/hot)
const COL_COLD = new THREE.Color(0x38bdf8)
const COL_MID = new THREE.Color(0x10b981)
const COL_WARM = new THREE.Color(0xf97316)
const COL_HOT = new THREE.Color(0xef4444)

function speedTempColor(norm, outColor = new THREE.Color()) {
  const u = Math.min(1, Math.max(0, norm))
  if (u < 0.42) {
    outColor.copy(COL_COLD).lerp(COL_MID, u / 0.42)
  } else if (u < 0.78) {
    outColor.copy(COL_MID).lerp(COL_WARM, (u - 0.42) / 0.36)
  } else {
    outColor.copy(COL_WARM).lerp(COL_HOT, (u - 0.78) / 0.22)
  }
  return outColor
}

// ==========================================================
// Three.js 3D シーン構築
// ==========================================================
let sceneObjs = null
const MOL_COUNT = 48

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 160,
    onFrame: (dt) => {
      if (procMode.value === 'cycle' && cycleRunning.value) {
        cycleProgress.value += dt * 0.55 * timeScale.value
      } else if (procMode.value !== 'cycle' && autoSweep.value) {
        let next = progress.value + dt * 24 * timeScale.value * sweepDir
        if (next >= 100) { next = 100; sweepDir = -1 }
        if (next <= 0) { next = 0; sweepDir = 1 }
        progress.value = next
      }

      if (molsRunning.value) {
        advanceMolecules(dt * timeScale.value)
      }
      updateVisuals(dt)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        syncAllLabels()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.35, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 垂直透明ガラスシリンダー＋ピストン＋錘＋圧力計＋熱浴パッド (x = -3.25)
  // ======================================================
  const cylCenterX = -3.25
  const cylBaseY = -1.25
  const cylMaxH = 3.15
  const cylR = 1.25

  const cylGroup = new THREE.Group()
  cylGroup.position.set(cylCenterX, 0, 0)
  scene.add(cylGroup)

  // 下部熱浴パッド (冷却: 青 / 加熱: 赤橙 / 断熱: スレート)
  const padGeo = new THREE.CylinderGeometry(cylR + 0.18, cylR + 0.28, 0.28, 40)
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0x1e293b,
    emissiveIntensity: 0.4,
    metalness: 0.45,
    roughness: 0.35
  })
  const thermalPad = new THREE.Mesh(padGeo, padMat)
  thermalPad.position.set(0, cylBaseY - 0.16, 0)
  cylGroup.add(thermalPad)

  // 熱浴発光リング
  const coilGeo = new THREE.TorusGeometry(cylR + 0.04, 0.045, 12, 40)
  coilGeo.rotateX(Math.PI / 2)
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xf97316,
    emissiveIntensity: 0.3,
    roughness: 0.25
  })
  const thermalCoil = new THREE.Mesh(coilGeo, coilMat)
  thermalCoil.position.set(0, cylBaseY - 0.02, 0)
  cylGroup.add(thermalCoil)

  // 透明ガラスシリンダー本体 (depthWrite: false, renderOrder: 0)
  const glassGeo = new THREE.CylinderGeometry(cylR, cylR, cylMaxH, 44, 1, true)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.05,
    transparent: true,
    opacity: 0.17,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glassMesh = new THREE.Mesh(glassGeo, glassMat)
  glassMesh.position.set(0, cylBaseY + cylMaxH / 2, 0)
  glassMesh.renderOrder = 0
  cylGroup.add(glassMesh)

  // ガラス上下リムリング
  const rimGeo = new THREE.TorusGeometry(cylR, 0.032, 12, 44)
  rimGeo.rotateX(Math.PI / 2)
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.25 })
  const topRim = new THREE.Mesh(rimGeo, rimMat)
  topRim.position.set(0, cylBaseY + cylMaxH, 0)
  const botRim = new THREE.Mesh(rimGeo, rimMat)
  botRim.position.set(0, cylBaseY, 0)
  cylGroup.add(topRim, botRim)

  // 断熱ジャケット (断熱変化モードで表示)
  const jacketGroup = new THREE.Group()
  const jacketGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(cylR + 0.15, cylR + 0.15, cylMaxH + 0.08, 36, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.6,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  jacketGlass.position.set(0, cylBaseY + cylMaxH / 2, 0)
  jacketGlass.renderOrder = 0
  jacketGroup.add(jacketGlass)
  for (let i = 0; i < 4; i++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(cylR + 0.16, 0.03, 10, 36).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 })
    )
    band.position.set(0, cylBaseY + 0.4 + i * 0.78, 0)
    jacketGroup.add(band)
  }
  cylGroup.add(jacketGroup)

  // 内部気体発光ボリューム (depthWrite: false, renderOrder: 0)
  const gasVolGeo = new THREE.CylinderGeometry(cylR - 0.05, cylR - 0.05, 1.0, 32)
  gasVolGeo.translate(0, 0.5, 0)
  const gasVolMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.10,
    depthWrite: false
  })
  const gasVolMesh = new THREE.Mesh(gasVolGeo, gasVolMat)
  gasVolMesh.position.set(0, cylBaseY, 0)
  gasVolMesh.renderOrder = 0
  cylGroup.add(gasVolMesh)

  // 定積ロックピン (定積変化モードで表示)
  const lockGroup = new THREE.Group()
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.4, metalness: 0.55 })
  const lockPinL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.22), pinMat)
  lockPinL.position.set(-cylR - 0.12, 0, 0)
  const lockPinR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.22), pinMat)
  lockPinR.position.set(cylR + 0.12, 0, 0)
  lockGroup.add(lockPinL, lockPinR)
  cylGroup.add(lockGroup)

  // 可動金属ピストン＋シャフト＋負荷台＋校正おもり群
  const pistonGroup = new THREE.Group()
  cylGroup.add(pistonGroup)

  const pHead = new THREE.Mesh(
    new THREE.CylinderGeometry(cylR - 0.03, cylR - 0.03, 0.24, 36),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 })
  )
  pHead.position.y = 0.12
  pistonGroup.add(pHead)

  const pSeal = new THREE.Mesh(
    new THREE.TorusGeometry(cylR - 0.025, 0.035, 10, 36).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
  )
  pSeal.position.y = 0.12
  pistonGroup.add(pSeal)

  const pRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 1.05, 18),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.22 })
  )
  pRod.position.y = 0.72
  pistonGroup.add(pRod)

  const pTray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.08, 28),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.3 })
  )
  pTray.position.y = 1.24
  pistonGroup.add(pTray)

  // 校正おもりディスク (最大5枚: 圧力Pに応じて載荷数が変化)
  const weightDiscs = []
  const wGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.14, 24)
  const wMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.28 })
  for (let i = 0; i < 5; i++) {
    const wMesh = new THREE.Mesh(wGeo, wMat)
    wMesh.position.set(0, 1.35 + i * 0.155, 0)
    pistonGroup.add(wMesh)
    weightDiscs.push(wMesh)
  }

  // 3D アナログ圧力ゲージ (シリンダー右側面パイプ接続)
  const gaugeGroup = new THREE.Group()
  gaugeGroup.position.set(cylR + 0.56, cylBaseY + 0.52, 0.18)
  cylGroup.add(gaugeGroup)

  const gaugePipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.55, 12).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 })
  )
  gaugePipe.position.set(-0.32, 0, 0)
  gaugeGroup.add(gaugePipe)

  const gaugeCase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 0.14, 28).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.25 })
  )
  gaugeGroup.add(gaugeCase)

  const gaugeFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.39, 28),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  )
  gaugeFace.position.z = 0.075
  gaugeGroup.add(gaugeFace)

  const gaugeArc = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.36, 28, 1, Math.PI * 0.15, Math.PI * 1.4),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
  )
  gaugeArc.position.z = 0.08
  gaugeGroup.add(gaugeArc)

  const needlePivot = new THREE.Group()
  needlePivot.position.set(0, 0, 0.09)
  const needleBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.036, 0.30, 0.02).translate(0, 0.13, 0),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  )
  const needleCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  )
  needlePivot.add(needleBar, needleCap)
  gaugeGroup.add(needlePivot)

  // 3D 速度色分け気体分子 (InstancedMesh: 48個)
  const molGeo = new THREE.SphereGeometry(0.095, 14, 14)
  const molMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1
  })
  const instancedMols = new THREE.InstancedMesh(molGeo, molMat, MOL_COUNT)
  instancedMols.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  cylGroup.add(instancedMols)

  const molData = []
  const dummy = new THREE.Object3D()
  for (let i = 0; i < MOL_COUNT; i++) {
    const u1 = Math.random(), u2 = Math.random(), u3 = Math.random(), u4 = Math.random()
    const g1 = Math.sqrt(-2 * Math.log(u1 + 1e-6)) * Math.cos(2 * Math.PI * u2)
    const g2 = Math.sqrt(-2 * Math.log(u1 + 1e-6)) * Math.sin(2 * Math.PI * u2)
    const g3 = Math.sqrt(-2 * Math.log(u3 + 1e-6)) * Math.cos(2 * Math.PI * u4)
    const r = Math.sqrt(Math.random()) * (cylR - 0.2)
    const th = Math.random() * Math.PI * 2
    molData.push({
      x: r * Math.cos(th),
      yNorm: 0.08 + Math.random() * 0.84,
      z: r * Math.sin(th),
      vx: g1,
      vy: g2,
      vz: g3,
      baseSpeed: Math.hypot(g1, g2, g3)
    })
  }

  // 熱流Q矢印 (3本 下部熱浴からシリンダーへ/シリンダーから下へ)
  const qArrows = [-0.55, 0, 0.55].map((ox) => {
    const arr = createVectorArrow3D({ color: 0xf97316, shaftRadius: 0.042, headRadius: 0.13, headLength: 0.28 })
    cylGroup.add(arr)
    return { arr, ox }
  })

  // 仕事/圧力ベクトル矢印 (ピストン上部: #10b981 膨張 / #f43f5e 圧縮負荷)
  const arrowW = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.36 })
  const arrowLoad = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.34 })
  cylGroup.add(arrowW, arrowLoad)

  // シリンダー側 3D ラベル (3D, 正面断面, 上面の3視点で重ならないX,Y,Z配置)
  const labelCylState = createTextSprite('P = 100.0 kPa, T = 300 K', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    fontSize: 34,
    scale: 0.48
  })
  labelCylState.position.set(0, cylBaseY + cylMaxH + 0.85, -0.75)
  cylGroup.add(labelCylState)

  const labelCylQ = createTextSprite('⚖️ 熱平衡 (Q ≈ 0 J)', {
    color: '#fdba74',
    borderColor: '#f97316',
    fontSize: 32,
    scale: 0.46
  })
  labelCylQ.position.set(0, cylBaseY - 0.88, 1.05)
  cylGroup.add(labelCylQ)

  const labelCylW = createTextSprite("W' = 0 J", {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 32,
    scale: 0.44
  })
  labelCylW.position.set(-1.72, 0.6, 0.55)
  cylGroup.add(labelCylW)

  // ======================================================
  // 2. 右側: 同期 3D P-V-T / P-V ホログラフィック曲線ステージ (x = +3.05)
  // ======================================================
  const pvGroup = new THREE.Group()
  pvGroup.position.set(3.05, 0.1, 0)
  scene.add(pvGroup)

  const axOrigin = new THREE.Vector3(-2.25, -1.65, 0)
  const axW = 4.65
  const axH = 3.35
  const axD = 2.0 // T軸方向 (-1.0 .. +1.0)

  const vMin = 1.0, vMax = 4.5
  const pMin = 0, pMax = 250
  const tMin = 150, tMax = 750

  function toPVTLocal(v, p, tempK, useDepth = true) {
    const x = axOrigin.x + ((v - vMin) / (vMax - vMin)) * axW
    const y = axOrigin.y + ((p - pMin) / (pMax - pMin)) * axH
    const tNorm = Math.min(1, Math.max(0, (tempK - tMin) / (tMax - tMin)))
    const z = useDepth ? (tNorm - 0.5) * axD : -axD * 0.5
    return new THREE.Vector3(x, y, z)
  }

  // ホログラフィック背面板 (P-V投影壁 z = -axD*0.5, depthWrite: false, renderOrder: 0)
  const backPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(axW + 0.65, axH + 0.65),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  backPlane.position.set(axOrigin.x + axW / 2, axOrigin.y + axH / 2, -axD * 0.52)
  backPlane.renderOrder = 0
  pvGroup.add(backPlane)

  // P-V-T 底面グリッドプレート
  const basePlate = new THREE.Mesh(
    new THREE.PlaneGeometry(axW + 0.6, axD + 0.2).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  basePlate.position.set(axOrigin.x + axW / 2, axOrigin.y - 0.02, 0)
  basePlate.renderOrder = 0
  pvGroup.add(basePlate)

  // V軸・P軸・T軸 3D矢印
  const vAxisArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.03, headRadius: 0.1, headLength: 0.24 })
  vAxisArrow.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, -axD * 0.5), new THREE.Vector3(1, 0, 0), axW + 0.25)
  const pAxisArrow = createVectorArrow3D({ color: 0xef4444, shaftRadius: 0.03, headRadius: 0.1, headLength: 0.24 })
  pAxisArrow.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, -axD * 0.5), new THREE.Vector3(0, 1, 0), axH + 0.25)
  const tAxisArrow = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.026, headRadius: 0.09, headLength: 0.22 })
  tAxisArrow.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, -axD * 0.5), new THREE.Vector3(0, 0, 1), axD + 0.2)
  pvGroup.add(vAxisArrow, pAxisArrow, tAxisArrow)

  const labelPVTitle = createTextSprite('📊 3D P-V-T / P-V 状態図', {
    color: '#e2e8f0',
    borderColor: 'rgba(148,163,184,0.45)',
    fontSize: 32,
    scale: 0.45
  })
  labelPVTitle.position.set(0.85, axOrigin.y + axH + 0.68, -0.82)
  pvGroup.add(labelPVTitle)

  const labelAxisV = createTextSprite('体積 V →', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.48 })
  labelAxisV.position.set(axOrigin.x + axW * 0.72, axOrigin.y - 0.50, 1.15)
  pvGroup.add(labelAxisV)

  const labelAxisP = createTextSprite('↑ 圧力 P', { color: '#fca5a5', borderColor: '#ef4444', fontSize: 32, scale: 0.48 })
  labelAxisP.position.set(axOrigin.x - 0.55, axOrigin.y + axH + 0.42, -axD * 0.5)
  pvGroup.add(labelAxisP)

  const labelAxisT = createTextSprite('温度 T ↗', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.46 })
  labelAxisT.position.set(axOrigin.x - 0.85, axOrigin.y - 0.38, 0.82)
  pvGroup.add(labelAxisT)

  // ホログラフィック 3D 等温ガイド曲面 (250K, 350K, 450K, 600K)
  ;[250, 350, 450, 600].forEach((temp) => {
    const pts3d = []
    const ptsProj = []
    for (let v = 1.25; v <= 4.25; v += 0.15) {
      const p = ((n * R * temp) / (v * 0.01)) / 1000
      if (p <= 245) {
        pts3d.push(toPVTLocal(v, p, temp, true))
        ptsProj.push(toPVTLocal(v, p, temp, false))
      }
    }
    if (pts3d.length >= 2) {
      pvGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts3d),
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.28 })
      ))
      pvGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ptsProj),
        new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.35 })
      ))
    }
  })

  // 動的パス & 仕事面積グループ
  const dynamicPVGroup = new THREE.Group()
  pvGroup.add(dynamicPVGroup)

  // 現在状態の 3D 光球 & P-V面投影点
  const stateSphere3D = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 22, 22),
    new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.8 })
  )
  const stateSphereProj = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfdba74 })
  )
  pvGroup.add(stateSphere3D, stateSphereProj)

  // 投影ガイド線 (3D点 -> P-V投影点 -> V軸, P軸)
  const projLinesGeo = new THREE.BufferGeometry()
  projLinesGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3))
  const projLines = new THREE.LineSegments(
    projLinesGeo,
    new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.65 })
  )
  pvGroup.add(projLines)

  const labelStatePt = createTextSprite('(2.49, 100 kPa)', {
    color: '#fdba74',
    borderColor: '#f97316',
    fontSize: 30,
    scale: 0.44
  })
  pvGroup.add(labelStatePt)

  sceneObjs = {
    cylBaseY,
    cylMaxH,
    cylR,
    padMat,
    coilMat,
    jacketGroup,
    gasVolMesh,
    gasVolMat,
    lockGroup,
    pistonGroup,
    weightDiscs,
    needlePivot,
    instancedMols,
    molData,
    dummy,
    qArrows,
    arrowW,
    arrowLoad,
    labelCylState,
    labelCylQ,
    labelCylW,
    labelPVTitle,
    labelAxisV,
    labelAxisP,
    labelAxisT,
    dynamicPVGroup,
    stateSphere3D,
    stateSphereProj,
    projLines,
    labelStatePt,
    toPVTLocal,
    axOrigin,
    axD
  }

  rebuildPVCurve()
  syncAllLabels()
  advanceMolecules(0)
  updateVisuals(0)
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const ch = group.children[0]
    group.remove(ch)
    if (ch.geometry) ch.geometry.dispose()
    if (ch.material) {
      if (Array.isArray(ch.material)) ch.material.forEach(m => m.dispose())
      else ch.material.dispose()
    }
  }
}

function rebuildPVCurve() {
  if (!sceneObjs) return
  const { dynamicPVGroup, toPVTLocal, axOrigin, axD } = sceneObjs
  clearGroup(dynamicPVGroup)
  const zBack = -axD * 0.5 + 0.02

  if (procMode.value === 'cycle') {
    const states = [
      { v: 1.8, p: 180 },
      { v: 3.6, p: 180 },
      { v: 3.6, p: 80 },
      { v: 1.8, p: 80 }
    ]
    const pts3d = states.map(s => {
      const tK = (s.p * 1000 * (s.v * 0.01)) / (n * R)
      return toPVTLocal(s.v, s.p, tK, true)
    })
    const ptsProj = states.map(s => toPVTLocal(s.v, s.p, 300, false))

    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4
      // 3D P-V-T 曲線チューブ
      const seg3d = new THREE.LineCurve3(pts3d[i], pts3d[j])
      dynamicPVGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(seg3d, 8, 0.044, 10, false),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 })
      ))
      // P-V 壁面投影ライン
      const segP = new THREE.LineCurve3(ptsProj[i], ptsProj[j])
      dynamicPVGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(segP, 6, 0.026, 8, false),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.55 })
      ))
      // 頂点コーナー球
      const corner = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      )
      corner.position.copy(pts3d[i])
      dynamicPVGroup.add(corner)
    }

    // 囲まれた正味仕事の半透明面積 (P-V面)
    const shape = new THREE.Shape()
    shape.moveTo(ptsProj[3].x, ptsProj[3].y)
    shape.lineTo(ptsProj[2].x, ptsProj[2].y)
    shape.lineTo(ptsProj[1].x, ptsProj[1].y)
    shape.lineTo(ptsProj[0].x, ptsProj[0].y)
    shape.closePath()
    const fillMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
    fillMesh.position.z = zBack
    dynamicPVGroup.add(fillMesh)
  } else {
    // 1) 全区間ガイド曲線 (0% -> 100%) を常に描画し、現在位置によらず状態変化の形を可視化
    const fullSteps = 44
    const fullPts3d = []
    const fullPtsProj = []
    for (let i = 0; i <= fullSteps; i++) {
      const u = i / fullSteps
      let vF = V0, pF = P0
      if (procMode.value === 'isochoric') {
        vF = V0
        pF = P0 * ((200 + u * 400) / T0)
      } else if (procMode.value === 'isobaric') {
        vF = 1.4 + u * 2.2
        pF = P0
      } else if (procMode.value === 'isothermal') {
        vF = 1.4 + u * 2.6
        pF = P0 * (V0 / vF)
      } else if (procMode.value === 'adiabatic') {
        vF = 1.4 + u * 2.6
        pF = P0 * Math.pow(V0 / vF, gamma)
      }
      const tF = (pF * 1000 * (vF * 0.01)) / (n * R)
      fullPts3d.push(toPVTLocal(vF, pF, tF, true))
      fullPtsProj.push(toPVTLocal(vF, pF, tF, false))
    }
    dynamicPVGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fullPts3d), 40, 0.025, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xfdba74, transparent: true, opacity: 0.52 })
    ))
    dynamicPVGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fullPtsProj), 40, 0.018, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.55 })
    ))

    // 2) 基準点 (A) から現在状態までのアクティブ変化区間と仕事面積 W'
    const vStart = V0
    const vEnd = currentV.value
    const steps = 36
    const pts3d = []
    const ptsProj = []

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps
      const vCur = vStart + (vEnd - vStart) * frac
      let pCur = P0
      if (procMode.value === 'isochoric') {
        pCur = P0 * ((200 + (progress.value / 100) * 400 * frac) / T0)
      } else if (procMode.value === 'isobaric') {
        pCur = P0
      } else if (procMode.value === 'isothermal') {
        pCur = P0 * (V0 / vCur)
      } else if (procMode.value === 'adiabatic') {
        pCur = P0 * Math.pow(V0 / vCur, gamma)
      }
      const tCur = (pCur * 1000 * (vCur * 0.01)) / (n * R)
      pts3d.push(toPVTLocal(vCur, pCur, tCur, true))
      ptsProj.push(toPVTLocal(vCur, pCur, tCur, false))
    }

    if (pts3d.length >= 2) {
      const first = pts3d[0]
      const last = pts3d[pts3d.length - 1]
      if (first.distanceToSquared(last) > 1e-4) {
        const curve3d = new THREE.CatmullRomCurve3(pts3d)
        dynamicPVGroup.add(new THREE.Mesh(
          new THREE.TubeGeometry(curve3d, 32, 0.048, 10, false),
          new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.55 })
        ))
        const curveProj = new THREE.CatmullRomCurve3(ptsProj)
        dynamicPVGroup.add(new THREE.Mesh(
          new THREE.TubeGeometry(curveProj, 32, 0.028, 8, false),
          new THREE.MeshBasicMaterial({ color: 0xfdba74, transparent: true, opacity: 0.72 })
        ))
      }

      // 始点マーカー
      const startDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      )
      startDot.position.copy(first)
      dynamicPVGroup.add(startDot)

      // 仕事 W' の面積塗りつぶし (P-V面)
      if (procMode.value !== 'isochoric' && Math.abs(vEnd - vStart) > 0.05) {
        const shape = new THREE.Shape()
        shape.moveTo(ptsProj[0].x, axOrigin.y)
        ptsProj.forEach(p => shape.lineTo(p.x, p.y))
        shape.lineTo(ptsProj[ptsProj.length - 1].x, axOrigin.y)
        shape.closePath()
        const areaMesh = new THREE.Mesh(
          new THREE.ShapeGeometry(shape),
          new THREE.MeshBasicMaterial({
            color: currentW.value >= 0 ? 0x10b981 : 0xf43f5e,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        )
        areaMesh.position.z = zBack
        areaMesh.renderOrder = 0
        dynamicPVGroup.add(areaMesh)
      }
    }
  }
}

const tempColWork = new THREE.Color()
function advanceMolecules(dt) {
  if (!sceneObjs) return
  const { cylBaseY, cylMaxH, cylR, instancedMols, molData, dummy } = sceneObjs

  const vNorm = Math.min(1.0, Math.max(0.08, (currentV.value - 1.1) / 3.2))
  const gasH = 0.72 + vNorm * (cylMaxH - 1.15)
  const speedScale = Math.sqrt(currentT.value / 300) * 1.45
  const maxR = cylR - 0.16

  for (let i = 0; i < MOL_COUNT; i++) {
    const m = molData[i]
    if (dt > 0) {
      m.x += m.vx * speedScale * dt
      m.yNorm += (m.vy * speedScale * dt) / Math.max(0.6, gasH)
      m.z += m.vz * speedScale * dt

      if (m.yNorm < 0.05) { m.yNorm = 0.05; m.vy = Math.abs(m.vy) }
      if (m.yNorm > 0.95) { m.yNorm = 0.95; m.vy = -Math.abs(m.vy) }

      const rSq = m.x * m.x + m.z * m.z
      if (rSq > maxR * maxR) {
        const r = Math.sqrt(rSq)
        const nx = m.x / r
        const nz = m.z / r
        m.x = nx * maxR
        m.z = nz * maxR
        const dot = m.vx * nx + m.vz * nz
        if (dot > 0) {
          m.vx -= 2 * dot * nx
          m.vz -= 2 * dot * nz
        }
      }
    }

    dummy.position.set(m.x, cylBaseY + m.yNorm * gasH, m.z)
    dummy.scale.setScalar(1.0)
    dummy.updateMatrix()
    instancedMols.setMatrixAt(i, dummy.matrix)

    // 速度・温度グラデーション (#38bdf8 -> #10b981 -> #f97316 -> #ef4444)
    const thermalSpd = m.baseSpeed * Math.sqrt(currentT.value / 300)
    const colorNorm = (thermalSpd - 0.75) / 2.25
    speedTempColor(colorNorm, tempColWork)
    instancedMols.setColorAt(i, tempColWork)
  }
  instancedMols.instanceMatrix.needsUpdate = true
  if (instancedMols.instanceColor) instancedMols.instanceColor.needsUpdate = true
}

function updateVisuals() {
  if (!sceneObjs) return
  const {
    cylBaseY,
    cylMaxH,
    padMat,
    coilMat,
    jacketGroup,
    gasVolMesh,
    gasVolMat,
    lockGroup,
    pistonGroup,
    weightDiscs,
    needlePivot,
    qArrows,
    arrowW,
    arrowLoad,
    labelCylW,
    stateSphere3D,
    stateSphereProj,
    projLines,
    labelStatePt,
    toPVTLocal,
    axOrigin,
    axD
  } = sceneObjs

  jacketGroup.visible = procMode.value === 'adiabatic'
  lockGroup.visible = procMode.value === 'isochoric'

  const vNorm = Math.min(1.0, Math.max(0.08, (currentV.value - 1.1) / 3.2))
  const gasH = 0.72 + vNorm * (cylMaxH - 1.15)
  const pistonY = cylBaseY + gasH

  pistonGroup.position.set(0, pistonY, 0)
  lockGroup.position.set(0, pistonY + 0.14, 0)
  gasVolMesh.scale.set(1, gasH, 1)

  // 内部気体色 (T に連動)
  const tNorm = Math.min(1, Math.max(0, (currentT.value - 180) / 480))
  speedTempColor(tNorm, gasVolMat.color)

  // 校正おもり数 (圧力 P: 0..250 kPa -> 1..5 枚)
  const activeWeights = Math.min(5, Math.max(1, Math.round((currentP.value / 210) * 5)))
  weightDiscs.forEach((w, idx) => {
    w.visible = idx < activeWeights
  })

  // 圧力ゲージ針回転 (0..250 kPa)
  const pFrac = Math.min(1, Math.max(0, currentP.value / 250))
  needlePivot.rotation.z = Math.PI * 0.7 - pFrac * Math.PI * 1.4

  // 熱浴パッド色 (加熱: 赤橙 / 冷却: 青 / 断熱・平衡: スレート)
  const hSign = instantHeatSign.value
  if (procMode.value === 'adiabatic') {
    padMat.color.setHex(0x334155)
    padMat.emissive.setHex(0x0f172a)
    coilMat.color.setHex(0x64748b)
    coilMat.emissive.setHex(0x1e293b)
    coilMat.emissiveIntensity = 0.15
  } else if (hSign > 0) {
    padMat.color.setHex(0x9a3412)
    padMat.emissive.setHex(0xef4444)
    coilMat.color.setHex(0xf97316)
    coilMat.emissive.setHex(0xf97316)
    coilMat.emissiveIntensity = 0.85
  } else if (hSign < 0) {
    padMat.color.setHex(0x0c4a6e)
    padMat.emissive.setHex(0x0284c7)
    coilMat.color.setHex(0x38bdf8)
    coilMat.emissive.setHex(0x38bdf8)
    coilMat.emissiveIntensity = 0.8
  } else {
    padMat.color.setHex(0x334155)
    padMat.emissive.setHex(0x1e293b)
    coilMat.color.setHex(0x64748b)
    coilMat.emissive.setHex(0x334155)
    coilMat.emissiveIntensity = 0.25
  }

  // 熱流 Q ベクトル矢印
  if (showVectors.value && hSign !== 0) {
    const qColor = hSign > 0 ? 0xf97316 : 0x38bdf8
    qArrows.forEach(({ arr, ox }) => {
      arr.children.forEach(ch => {
        if (ch.material) {
          ch.material.color.setHex(qColor)
          ch.material.emissive.setHex(qColor)
        }
      })
      const startY = hSign > 0 ? cylBaseY - 0.88 : cylBaseY - 0.14
      arr.setVector(
        new THREE.Vector3(ox, startY, 0.32),
        new THREE.Vector3(0, hSign, 0),
        0.72
      )
    })
  } else {
    qArrows.forEach(({ arr }) => { arr.visible = false })
  }

  // 仕事 / 圧力ベクトル矢印 (ピストン上部・下部)
  const wSign = instantWorkSign.value
  if (showVectors.value && procMode.value !== 'isochoric') {
    if (wSign > 0) {
      arrowW.setVector(new THREE.Vector3(-0.95, pistonY + 0.12, 0.45), new THREE.Vector3(0, 1, 0), 0.95)
      arrowLoad.setVector(new THREE.Vector3(0.95, pistonY + 1.35, 0.45), new THREE.Vector3(0, -1, 0), 0.48)
    } else if (wSign < 0) {
      arrowW.visible = false
      arrowLoad.setVector(new THREE.Vector3(-0.95, pistonY + 1.25, 0.45), new THREE.Vector3(0, -1, 0), 0.95)
    } else {
      arrowW.setVector(new THREE.Vector3(-0.95, pistonY + 0.12, 0.45), new THREE.Vector3(0, 1, 0), 0.55)
      arrowLoad.setVector(new THREE.Vector3(0.95, pistonY + 1.1, 0.45), new THREE.Vector3(0, -1, 0), 0.55)
    }
    labelCylW.visible = true
    labelCylW.position.set(-1.72, pistonY + 0.65, 0.55)
  } else {
    arrowW.visible = false
    arrowLoad.visible = false
    labelCylW.visible = false
  }

  // P-V-T 状態点 & 投影線
  const cur3D = toPVTLocal(currentV.value, currentP.value, currentT.value, true)
  const curProj = toPVTLocal(currentV.value, currentP.value, currentT.value, false)
  stateSphere3D.position.copy(cur3D)
  stateSphereProj.position.copy(curProj)

  const zBack = -axD * 0.5
  const lp = projLines.geometry.getAttribute('position').array
  // 3D点 -> P-V投影点
  lp[0] = cur3D.x; lp[1] = cur3D.y; lp[2] = cur3D.z
  lp[3] = curProj.x; lp[4] = curProj.y; lp[5] = zBack
  // P-V投影点 -> V軸
  lp[6] = curProj.x; lp[7] = curProj.y; lp[8] = zBack
  lp[9] = curProj.x; lp[10] = axOrigin.y; lp[11] = zBack
  // P-V投影点 -> P軸
  lp[12] = curProj.x; lp[13] = curProj.y; lp[14] = zBack
  lp[15] = axOrigin.x; lp[16] = curProj.y; lp[17] = zBack
  projLines.geometry.getAttribute('position').needsUpdate = true

  labelStatePt.position.set(
    Math.min(1.68, Math.max(-0.45, cur3D.x + 0.62)),
    cur3D.y > -0.2 ? Math.max(-1.05, cur3D.y - 0.62) : Math.min(1.45, cur3D.y + 0.58),
    Math.max(-0.18, Math.min(0.68, cur3D.z + 0.48))
  )

  syncDynamicLabels()
}

function syncAllLabels() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const { labelPVTitle, labelAxisV, labelAxisP, labelAxisT } = sceneObjs
  updateLabelCached(labelPVTitle, mob ? '3D P-V-T 図' : '📊 3D P-V-T / P-V 状態図', '#e2e8f0', 'rgba(148,163,184,0.45)', 0.45)
  updateLabelCached(labelAxisV, '体積 V →', '#7dd3fc', '#38bdf8', 0.48)
  updateLabelCached(labelAxisP, '↑ 圧力 P', '#fca5a5', '#ef4444', 0.48)
  updateLabelCached(labelAxisT, '温度 T ↗', '#fde68a', '#f59e0b', 0.46)
  syncDynamicLabels()
}

function syncDynamicLabels() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  const { labelCylState, labelCylQ, labelCylW, labelStatePt } = sceneObjs

  updateLabelCached(
    labelCylState,
    mob ? `P=${currentP.value.toFixed(0)}kPa T=${currentT.value.toFixed(0)}K` : `内圧 P=${currentP.value.toFixed(1)} kPa, T=${currentT.value.toFixed(0)} K`,
    '#fca5a5',
    '#ef4444',
    0.46
  )

  if (procMode.value === 'adiabatic') {
    updateLabelCached(labelCylQ, mob ? '🛡️ 断熱 (Q=0)' : '🛡️ 断熱容器 (Q = 0)', '#cbd5e1', '#94a3b8', 0.44)
  } else if (instantHeatSign.value > 0) {
    updateLabelCached(labelCylQ, mob ? `🔥 吸熱 +${currentQ.value.toFixed(0)}J` : `🔥 吸熱 Q = +${currentQ.value.toFixed(0)} J`, '#fdba74', '#f97316', 0.44)
  } else if (instantHeatSign.value < 0) {
    updateLabelCached(labelCylQ, mob ? `❄️ 放熱 ${currentQ.value.toFixed(0)}J` : `❄️ 放熱 Q = ${currentQ.value.toFixed(0)} J`, '#7dd3fc', '#38bdf8', 0.44)
  } else {
    updateLabelCached(labelCylQ, '⚖️ 熱平衡 (Q ≈ 0)', '#cbd5e1', '#64748b', 0.44)
  }

  const wVal = currentW.value
  updateLabelCached(
    labelCylW,
    wVal >= 0 ? `W'=+${wVal.toFixed(0)}J` : `W'=${wVal.toFixed(0)}J`,
    wVal >= 0 ? '#6ee7b7' : '#fda4af',
    wVal >= 0 ? '#10b981' : '#f43f5e',
    0.42
  )

  updateLabelCached(
    labelStatePt,
    mob ? `${currentV.value.toFixed(1)}L,${currentP.value.toFixed(0)}kPa` : `(${currentV.value.toFixed(2)}, ${currentP.value.toFixed(0)}kPa)`,
    '#fdba74',
    '#f97316',
    0.45
  )
}

watch([procMode, progress, currentP, currentQ], () => {
  if (!sceneObjs) return
  rebuildPVCurve()
  updateVisuals()
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
.lab {
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.head-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.mode-tab-bar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin-bottom: 0.65rem;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  margin-bottom: 0.6rem;
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

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 10px !important;
  padding: 4px 10px !important;
}

.speed-btn-group {
  display: flex;
  gap: 3px;
  flex-wrap: nowrap;
  max-width: 100%;
  min-width: 0;
}

.speed-label,
.speed-btn-group button {
  white-space: nowrap;
}

.speed-btn-group button {
  padding: 4px 7px !important;
  font-size: 0.74rem !important;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow: hidden;
  margin: 0.7rem 0;
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

.dot-cold { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-mid { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-hot { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
.dot-q { background: #f97316; box-shadow: 0 0 6px #f97316; }
.dot-w { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-comp { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }

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
  pointer-events: none;
}

.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.2rem 0 0.85rem 0;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.42);
  color: #fdba74;
  font-size: 0.76rem;
  font-weight: 700;
  max-width: 100%;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .three-viewport-wrap {
    height: 330px;
  }
  .three-hud-legend,
  .three-hud-hint,
  .three-ortho-badge {
    font-size: 0.66rem;
    padding: 3px 8px;
  }
  .speed-control-group {
    border-radius: 10px !important;
    width: 100%;
    flex-wrap: wrap !important;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .three-ortho-badge {
    width: 100%;
    text-align: center;
  }
}
</style>
