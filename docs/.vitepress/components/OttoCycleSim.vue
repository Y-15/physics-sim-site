<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🚗</span>
        <h3>3D オットーサイクル &amp; 4行程内燃機関シミュレーター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <p class="subtitle">
        自動車のガソリンエンジンの基礎となる理想熱サイクル「オットーサイクル」。
        吸入 → 断熱圧縮 → 定積加熱（スパーク点火） → 断熱膨張（仕事） → 定積冷却・排気の4行程と、3Dクランクピストン・吸排気弁、P-V線図、圧縮比 ε による熱効率 η = 1 − 1 / ε<sup>γ−1</sup> をリアルタイム連動で観察できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 3Dカメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面視点
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isRunning ? '⏸ 一時停止' : '▶ サイクル再生' }}
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
      <button class="btn btn-secondary" @click="stepForward">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="nextStroke">⏩ 次の行程へ</button>
      <button class="btn btn-secondary" @click="resetCycle">⏮ 最初から</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-adi"></i>断熱変化 (①→②, ③→④)</span>
          <span class="legend-item"><i class="dot-heat"></i>定積加熱 (②→③ 点火)</span>
          <span class="legend-item"><i class="dot-cool"></i>定積冷却 (④→① 排気)</span>
          <span class="legend-item"><i class="dot-work"></i>正味の仕事 <b><i>W</i><sub>net</sub></b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 工程ステータス帯（ビューポート外で非重複） -->
    <div class="mode-status-strip">
      <span class="stroke-badge" :class="currentStrokeClass">
        工程: <strong>{{ strokeNames[currentStrokeIndex] }}</strong>
      </span>
    </div>

    <!-- コントロールパネル（既存スライダー・ボタン100%保持） -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>圧縮比 ε = <i>V</i><sub>1</sub> / <i>V</i><sub>2</sub>:</span>
            <strong>{{ compressionRatio.toFixed(1) }}</strong>
          </label>
          <input type="range" v-model.number="compressionRatio" min="4.0" max="14.0" step="0.5" />
        </div>

        <div class="control-group">
          <label>
            <span>比熱比 γ = <i>C</i><sub>p</sub> / <i>C</i><sub>v</sub>:</span>
            <strong>{{ gammaRatio.toFixed(2) }}</strong>
          </label>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: Math.abs(gammaRatio - 1.40) < 0.01 }" @click="gammaRatio = 1.40">
              2原子分子 (空気/排気 γ=1.40)
            </button>
            <button class="select-btn" :class="{ active: Math.abs(gammaRatio - 1.67) < 0.01 }" @click="gammaRatio = 1.67">
              単原子分子 (γ=1.67)
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>燃焼最高温度 <i>T</i><sub>3</sub>:</span>
            <strong>{{ maxTempK }} K ({{ maxTempK - 273 }} ℃)</strong>
          </label>
          <input type="range" v-model.number="maxTempK" min="1200" max="2500" step="50" />
        </div>

        <div class="control-group">
          <label>
            <span>エンジン回転速度:</span>
            <strong>{{ engineSpeed.toFixed(1) }}x</strong>
          </label>
          <input type="range" v-model.number="engineSpeed" min="0.4" max="2.0" step="0.1" />
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (ε=8.0, γ=1.40)
        </button>
      </div>
    </div>

    <!-- 物理量モニター（既存4項目100%保持） -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">理論熱効率 η</span>
        <span class="value highlight">{{ (thermalEfficiency * 100).toFixed(1) }} <span class="unit">%</span></span>
        <span class="subtext">η = 1 − 1 / ε<sup>γ − 1</sup></span>
      </div>

      <div class="stat-card">
        <span class="label">1サイクルあたりの正味の仕事 <i>W</i><sub>net</sub></span>
        <span class="value text-purple">{{ netWorkJ.toFixed(0) }} <span class="unit">J</span></span>
        <span class="subtext">P-V線図の囲む面積</span>
      </div>

      <div class="stat-card">
        <span class="label">投入熱量 <i>Q</i><sub>in</sub> (燃焼)</span>
        <span class="value text-rose">{{ heatInJ.toFixed(0) }} <span class="unit">J</span></span>
        <span class="subtext"><i>Q</i><sub>in</sub> = <i>C</i><sub>v</sub> (<i>T</i><sub>3</sub> − <i>T</i><sub>2</sub>)</span>
      </div>

      <div class="stat-card">
        <span class="label">排気熱量 <i>Q</i><sub>out</sub></span>
        <span class="value text-cyan">{{ heatOutJ.toFixed(0) }} <span class="unit">J</span></span>
        <span class="subtext"><i>Q</i><sub>out</sub> = <i>C</i><sub>v</sub> (<i>T</i><sub>4</sub> − <i>T</i><sub>1</sub>)</span>
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

const isRunning = ref(true)
const timeScale = ref(0.5)
const activeCam = ref('3d')

const compressionRatio = ref(8.0) // ε = 8.0
const gammaRatio = ref(1.40)       // γ = 1.40 (空気)
const maxTempK = ref(1800)         // T3 = 1800 K
const engineSpeed = ref(1.0)

const T1 = 300 // 吸気初期温度 300K (27℃)

// 熱効率: η = 1 - 1 / (ε^(γ - 1))
const thermalEfficiency = computed(() => {
  const eps = compressionRatio.value
  const g = gammaRatio.value
  return 1 - 1 / Math.pow(eps, g - 1)
})

const T2 = computed(() => T1 * Math.pow(compressionRatio.value, gammaRatio.value - 1))
const T4 = computed(() => maxTempK.value / Math.pow(compressionRatio.value, gammaRatio.value - 1))

const Cv = computed(() => 8.31 / (gammaRatio.value - 1))
const heatInJ = computed(() => Math.max(10, Cv.value * (maxTempK.value - T2.value)))
const heatOutJ = computed(() => Math.max(5, Cv.value * (T4.value - T1)))
const netWorkJ = computed(() => heatInJ.value * thermalEfficiency.value)

// 5フェーズで構成 (0: 吸入, 1: ①→②断熱圧縮, 2: ②→③定積加熱/点火, 3: ③→④断熱膨張/仕事, 4: ④→①定積冷却/排気)
const strokeNames = [
  '吸入行程 (吸気弁開放・新気混合気流入)',
  '①→② 断熱圧縮 (ピストン上昇・圧縮発熱)',
  '②→③ 定積加熱 (スパーク点火・瞬間燃焼)',
  '③→④ 断熱膨張 (パワーストローク・仕事 W)',
  '④→① 定積冷却 & 排気 (排気弁開放・熱放出)'
]

const currentStrokeIndex = ref(1)
const strokeProgress = ref(0.0) // 0..1

const currentStrokeClass = computed(() => {
  if (currentStrokeIndex.value === 2) return 'combustion'
  if (currentStrokeIndex.value === 3) return 'power'
  if (currentStrokeIndex.value === 4) return 'exhaust'
  return 'normal'
})

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepForward() {
  isRunning.value = false
  const prev = currentStrokeIndex.value
  strokeProgress.value += 0.15
  if (strokeProgress.value >= 1.0) {
    strokeProgress.value = 0
    currentStrokeIndex.value = (currentStrokeIndex.value + 1) % 5
  }
  if (currentStrokeIndex.value !== prev) rebuildStaticGeometry()
  updateFrame(0)
}

function nextStroke() {
  currentStrokeIndex.value = (currentStrokeIndex.value + 1) % 5
  strokeProgress.value = 0
  rebuildStaticGeometry()
  updateFrame(0)
}

function resetCycle() {
  currentStrokeIndex.value = 1
  strokeProgress.value = 0
  rebuildStaticGeometry()
  updateFrame(0)
}

function resetDefaults() {
  compressionRatio.value = 8.0
  gammaRatio.value = 1.40
  maxTempK.value = 1800
  engineSpeed.value = 1.0
}

// ==========================================================
// カメラ・レスポンシブ設定
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(1.95, Math.max(1.38, 1.72 / Math.max(0.68, aspect))) : 1.0
}

function isMobileView() {
  return getMobScale() > 1.02
}

function getCamParams(preset) {
  const ms = getMobScale()
  const cx = 0.05
  if (preset === 'front') {
    return { pos: [cx, 0.02, 49.5 * ms], target: [cx, -0.02, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 53.5 * ms, 0.55], target: [cx, 0.0, 0.05], fov: 14 }
  }
  return { pos: [cx + 0.5 * ms, 4.1 * ms, 14.2 * ms], target: [cx, -0.02, 0], fov: 40 }
}

function setCameraPreset(preset, duration = 0.55) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

// ==========================================================
// オットーサイクル P-V 座標変換
// ==========================================================
function getOttoStates() {
  const eps = compressionRatio.value
  const gam = gammaRatio.value
  const v2 = 1.0
  const v1 = eps
  const p1 = 1.0
  const p2 = p1 * Math.pow(eps, gam)
  const t2 = T1 * Math.pow(eps, gam - 1)
  const p3 = Math.max(p2 * 1.15, p2 * (maxTempK.value / Math.max(200, t2)))
  const p4 = p3 / Math.pow(eps, gam)
  return { v1, v2, p1, p2, p3, p4, eps, gam, t2 }
}

function ottoPVToBoard(v, p, s) {
  const vMin = 0.3
  const vMax = 14.8
  const pMax = Math.max(82, s.p3 * 1.12)
  const x = -2.0 + ((v - vMin) / (vMax - vMin)) * 4.25
  const y = -1.45 + (p / pMax) * 3.45
  return new THREE.Vector3(x, y, 0.06)
}

function evalOttoPV(strokeIdx, u, s) {
  let v = s.v1
  let p = s.p1
  if (strokeIdx === 0) {
    // 吸入 (V2 -> V1 at P1)
    v = s.v2 + (s.v1 - s.v2) * u
    p = s.p1
  } else if (strokeIdx === 1) {
    // ①->② 断熱圧縮 (V1 -> V2, P = P1*(V1/V)^γ)
    v = s.v1 + (s.v2 - s.v1) * u
    p = s.p1 * Math.pow(s.v1 / v, s.gam)
  } else if (strokeIdx === 2) {
    // ②->③ 定積加熱 (V = V2, P2 -> P3)
    v = s.v2
    p = s.p2 + (s.p3 - s.p2) * u
  } else if (strokeIdx === 3) {
    // ③->④ 断熱膨張 (V2 -> V1, P = P3*(V2/V)^γ)
    v = s.v2 + (s.v1 - s.v2) * u
    p = s.p3 * Math.pow(s.v2 / v, s.gam)
  } else {
    // ④->① 定積冷却 (u in [0, 0.28]) + 排気掃気 (u in [0.28, 1.0])
    if (u <= 0.28) {
      const k = u / 0.28
      v = s.v1
      p = s.p4 + (s.p1 - s.p4) * k
    } else {
      const k = (u - 0.28) / 0.72
      v = s.v1 + (s.v2 - s.v1) * k
      p = s.p1
    }
  }
  return { v, p, pt: ottoPVToBoard(v, p, s) }
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
let sceneObjs = null
let resizeObs = null
let lastIsMob = false
let simTime = 0
const labelCache = {}

function setLabelText(sprite, key, text, color, borderColor, baseScale = 0.44) {
  const mult = isMobileView() ? 1.92 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}|${baseScale}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(text, color, borderColor)
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  sprite.scale.set(h * asp, h, 1)
}

function disposeObj(obj) {
  if (!obj) return
  if (obj.geometry) obj.geometry.dispose()
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((m) => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    } else {
      if (obj.material.map) obj.material.map.dispose()
      obj.material.dispose()
    }
  }
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const ch = group.children[0]
    group.remove(ch)
    ch.traverse(disposeObj)
  }
}

// エンジン幾何定数 (エンジン中心 x = -2.85)
const CRANK_Y = -2.28
const CRANK_R = 0.82
const ROD_LEN = 2.22
const CYL_R = 0.92
const PISTON_H = 0.4
const CROWN_TDC = CRANK_Y + CRANK_R + ROD_LEN + PISTON_H * 0.5 // +0.96
const CROWN_BDC = CRANK_Y - CRANK_R + ROD_LEN + PISTON_H * 0.5 // -0.68
const STROKE_H = CROWN_TDC - CROWN_BDC // 1.64

function getHeadY() {
  const clearance = Math.max(0.18, STROKE_H / Math.max(1, compressionRatio.value - 1))
  return CROWN_TDC + clearance
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastIsMob = isMobileView()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 130,
    onFrame: (dt) => {
      updateFrame(dt)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileView()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        rebuildStaticGeometry()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -3.28, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D 4行程内燃機関エンジン (中心 x = -2.85)
  // ======================================================
  const engineGroup = new THREE.Group()
  engineGroup.position.set(-2.85, 0, 0)
  scene.add(engineGroup)

  const engineStaticGroup = new THREE.Group()
  engineGroup.add(engineStaticGroup)

  // ピストン + コネクティングロッド + クランクシャフト
  const pistonGroup = new THREE.Group()
  const pCrown = new THREE.Mesh(
    new THREE.CylinderGeometry(CYL_R - 0.03, CYL_R - 0.03, PISTON_H, 32),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.78, roughness: 0.24 })
  )
  pCrown.renderOrder = 1
  const pTopDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(CYL_R - 0.03, CYL_R - 0.03, 0.04, 32),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 })
  )
  pTopDisk.position.y = PISTON_H * 0.5
  const pRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(CYL_R - 0.02, 0.02, 8, 32).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.25 })
  )
  pRing1.position.y = PISTON_H * 0.25
  const pRing2 = pRing1.clone()
  pRing2.position.y = 0
  pistonGroup.add(pCrown, pTopDisk, pRing1, pRing2)
  engineGroup.add(pistonGroup)

  // コネクティングロッド (底端 y=0 -> 上端 y=ROD_LEN)
  const rodGeo = new THREE.BoxGeometry(0.14, ROD_LEN, 0.14)
  rodGeo.translate(0, ROD_LEN / 2, 0)
  const rodMesh = new THREE.Mesh(
    rodGeo,
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.82, roughness: 0.2 })
  )
  engineGroup.add(rodMesh)

  // クランク回転盤 + クランクピン
  const crankGroup = new THREE.Group()
  crankGroup.position.set(0, CRANK_Y, 0)
  const crankDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(CRANK_R + 0.12, CRANK_R + 0.12, 0.16, 32).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 })
  )
  crankDisk.position.z = -0.16
  const crankArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, CRANK_R + 0.15, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.72, roughness: 0.3 })
  )
  crankArm.position.set(0, CRANK_R * 0.5, 0)
  const crankPin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.32, 18).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.55 })
  )
  crankPin.position.set(0, CRANK_R, 0)
  crankGroup.add(crankDisk, crankArm, crankPin)
  engineGroup.add(crankGroup)

  // 燃焼室内ガスボリューム (depthWrite: false, renderOrder: 2)
  const gasVolGeo = new THREE.CylinderGeometry(CYL_R - 0.04, CYL_R - 0.04, 1.0, 32)
  gasVolGeo.translate(0, -0.5, 0) // 天井から下向きにスケール
  const gasVolMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, depthWrite: false })
  const gasVolMesh = new THREE.Mesh(gasVolGeo, gasVolMat)
  gasVolMesh.renderOrder = 2
  engineGroup.add(gasVolMesh)

  // 3D 気体分子 (30個, renderOrder: 1)
  const gasMols = []
  const molGeo = new THREE.SphereGeometry(0.062, 10, 10)
  const molMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.65 })
  for (let i = 0; i < 30; i++) {
    const m = new THREE.Mesh(molGeo, molMat)
    m.renderOrder = 1
    const r = Math.sqrt(Math.random()) * (CYL_R - 0.18)
    const ang = Math.random() * Math.PI * 2
    m.userData = {
      yNorm: 0.1 + Math.random() * 0.8,
      x: r * Math.cos(ang),
      z: r * Math.sin(ang),
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      vz: (Math.random() - 0.5) * 2.5
    }
    engineGroup.add(m)
    gasMols.push(m)
  }

  // 吸気弁 (左 -0.44, #38bdf8) & 排気弁 (右 +0.44, #f97316)
  const intakeValve = new THREE.Group()
  const inStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.65, 14),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.7, roughness: 0.25 })
  )
  inStem.position.y = 0.32
  const inHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.26, 0.06, 20),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45, metalness: 0.6 })
  )
  intakeValve.add(inStem, inHead)
  engineGroup.add(intakeValve)

  const exhaustValve = new THREE.Group()
  const exStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.65, 14),
    new THREE.MeshStandardMaterial({ color: 0xfdba74, metalness: 0.7, roughness: 0.25 })
  )
  exStem.position.y = 0.32
  const exHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.26, 0.06, 20),
    new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.45, metalness: 0.6 })
  )
  exhaustValve.add(exStem, exHead)
  engineGroup.add(exhaustValve)

  // 点火スパーク (電気アーク線 + プラズマフラッシュ球)
  const sparkGroup = new THREE.Group()
  const arcPts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.1, -0.09, 0.04),
    new THREE.Vector3(0.11, -0.17, -0.04),
    new THREE.Vector3(-0.08, -0.25, 0.03),
    new THREE.Vector3(0.06, -0.33, 0)
  ]
  const sparkArc = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: 0xfef08a })
  )
  const sparkFlashMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  })
  const sparkFlash = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), sparkFlashMat)
  sparkFlash.position.y = -0.18
  sparkFlash.renderOrder = 4
  const sparkHaloMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  })
  const sparkHalo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 18), sparkHaloMat)
  sparkHalo.position.y = -0.2
  sparkHalo.renderOrder = 3
  sparkGroup.add(sparkArc, sparkFlash, sparkHalo)
  engineGroup.add(sparkGroup)

  // 吸入/排気 流れ粒子 (8個ずつ)
  const flowGeo = new THREE.SphereGeometry(0.065, 10, 10)
  const intakeFlow = []
  const inFlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
  const exhaustFlow = []
  const exFlowMat = new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.85 })
  for (let i = 0; i < 8; i++) {
    const mi = new THREE.Mesh(flowGeo, inFlowMat)
    mi.userData.phase = i / 8
    engineGroup.add(mi)
    intakeFlow.push(mi)

    const me = new THREE.Mesh(flowGeo, exFlowMat)
    me.userData.phase = i / 8
    engineGroup.add(me)
    exhaustFlow.push(me)
  }

  // 仕事ベクトル矢印 (パワーストローク中)
  const workArrow = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.05, headRadius: 0.14, headLength: 0.3 })
  engineGroup.add(workArrow)

  // エンジン側ラベル群 (X/Z分離で正面・上面・モバイル非重複)
  const lblIntake = createTextSprite('吸気弁', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.42 })
  const lblSpark = createTextSprite('点火プラグ', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 30, scale: 0.42 })
  const lblExhaust = createTextSprite('排気弁', { color: '#fdba74', borderColor: '#f97316', fontSize: 30, scale: 0.42 })
  const lblGasState = createTextSprite('混合気 T=300K', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.44 })
  const lblCrank = createTextSprite('クランク回転軸', { color: '#cbd5e1', borderColor: '#64748b', fontSize: 30, scale: 0.42 })
  engineGroup.add(lblIntake, lblSpark, lblExhaust, lblGasState, lblCrank)

  // ======================================================
  // 2. 右側: 3D オットーサイクル P-V 線図 (中心 x = +2.85)
  // ======================================================
  const pvGroup = new THREE.Group()
  pvGroup.position.set(2.85, 0.25, 0)
  scene.add(pvGroup)

  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(5.3, 4.35),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.84, side: THREE.DoubleSide })
  )
  boardBack.position.set(0, 0.12, -0.08)
  pvGroup.add(boardBack)

  const boardFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.65, -2.05, -0.05),
      new THREE.Vector3(2.65, -2.05, -0.05),
      new THREE.Vector3(2.65, 2.3, -0.05),
      new THREE.Vector3(-2.65, 2.3, -0.05)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  pvGroup.add(boardFrame)

  const axOrigin = new THREE.Vector3(-2.15, -1.48, 0)
  const vAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.028, headRadius: 0.09, headLength: 0.22 })
  vAx.setVector(axOrigin, new THREE.Vector3(1, 0, 0), 4.55)
  pvGroup.add(vAx)
  const pAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.028, headRadius: 0.09, headLength: 0.22 })
  pAx.setVector(axOrigin, new THREE.Vector3(0, 1, 0), 3.5)
  pvGroup.add(pAx)

  const pvDynamicGroup = new THREE.Group()
  pvGroup.add(pvDynamicGroup)

  const cursorSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 })
  )
  cursorSphere.renderOrder = 5
  pvGroup.add(cursorSphere)

  const lblPVTitle = createTextSprite('オットーサイクル P-V線図', { color: '#e2e8f0', borderColor: '#475569', fontSize: 30, scale: 0.43 })
  lblPVTitle.position.set(0.45, 2.58, -1.75)
  const lblP = createTextSprite('↑ 圧力 P', { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.4)', fontSize: 30, scale: 0.42 })
  lblP.position.set(-1.62, 1.98, -1.15)
  const lblV = createTextSprite('体積 V →', { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.4)', fontSize: 30, scale: 0.42 })
  lblV.position.set(2.05, -1.86, -0.05)
  const lblV2 = createTextSprite('V₂ (上死点)', { color: '#94a3b8', borderColor: '#475569', fontSize: 28, scale: 0.4 })
  const lblV1 = createTextSprite('V₁ (下死点)', { color: '#94a3b8', borderColor: '#475569', fontSize: 28, scale: 0.4 })
  const lblS1 = createTextSprite('①', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.42 })
  const lblS2 = createTextSprite('②', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 30, scale: 0.42 })
  const lblS3 = createTextSprite('③', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 30, scale: 0.42 })
  const lblS4 = createTextSprite('④', { color: '#fed7aa', borderColor: '#f59e0b', fontSize: 30, scale: 0.42 })
  const lblWnet = createTextSprite('面積 ＝ 正味の仕事 W_net', { color: '#e9d5ff', borderColor: '#a855f7', fontSize: 30, scale: 0.44 })
  lblWnet.position.set(0.05, -2.62, 1.85)

  pvGroup.add(lblPVTitle, lblP, lblV, lblV2, lblV1, lblS1, lblS2, lblS3, lblS4, lblWnet)

  sceneObjs = {
    engineStaticGroup,
    pistonGroup,
    rodMesh,
    crankGroup,
    gasVolMesh,
    gasVolMat,
    gasMols,
    molMat,
    intakeValve,
    exhaustValve,
    sparkGroup,
    sparkFlashMat,
    sparkHaloMat,
    intakeFlow,
    exhaustFlow,
    workArrow,
    lblIntake,
    lblSpark,
    lblExhaust,
    lblGasState,
    lblCrank,
    pvDynamicGroup,
    cursorSphere,
    lblPVTitle,
    lblP,
    lblV,
    lblV2,
    lblV1,
    lblS1,
    lblS2,
    lblS3,
    lblS4,
    lblWnet
  }

  rebuildStaticGeometry()
  updateFrame(0)
}

function rebuildStaticGeometry() {
  if (!sceneObjs) return
  const {
    engineStaticGroup,
    pvDynamicGroup,
    lblIntake,
    lblSpark,
    lblExhaust,
    lblGasState,
    lblCrank,
    lblPVTitle,
    lblP,
    lblV,
    lblV2,
    lblV1,
    lblS1,
    lblS2,
    lblS3,
    lblS4,
    lblWnet
  } = sceneObjs

  clearGroup(engineStaticGroup)
  clearGroup(pvDynamicGroup)

  const mob = isMobileView()
  const yHead = getHeadY()
  const cylBot = CROWN_BDC - 0.16
  const cylLen = yHead - cylBot

  // 1. 透明ガラスシリンダー (depthWrite: false, renderOrder: 6)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glassCyl = new THREE.Mesh(new THREE.CylinderGeometry(CYL_R, CYL_R, cylLen, 36, 1, true), glassMat)
  glassCyl.position.set(0, cylBot + cylLen / 2, 0)
  glassCyl.renderOrder = 6
  engineStaticGroup.add(glassCyl)

  const glossCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(CYL_R + 0.008, CYL_R + 0.008, cylLen, 16, 1, true, 0.25, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xf0f9ff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
  )
  glossCyl.position.set(0, cylBot + cylLen / 2, 0)
  glossCyl.renderOrder = 6
  engineStaticGroup.add(glossCyl)

  // シリンダーヘッド・上下リング・吸排気ダクト
  const headMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(CYL_R + 0.12, CYL_R + 0.12, 0.22, 36),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.3 })
  )
  headMesh.position.set(0, yHead + 0.11, 0)
  engineStaticGroup.add(headMesh)

  const botRim = new THREE.Mesh(
    new THREE.TorusGeometry(CYL_R + 0.02, 0.04, 10, 36).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 })
  )
  botRim.position.set(0, cylBot, 0)
  engineStaticGroup.add(botRim)

  // 左吸気ダクト & 右排気ダクト (半透明ガラス風)
  const inDuct = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.95, 18).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35, depthWrite: false })
  )
  inDuct.position.set(-0.92, yHead + 0.42, 0)
  inDuct.renderOrder = 5
  const exDuct = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.95, 18).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xea580c, transparent: true, opacity: 0.35, depthWrite: false })
  )
  exDuct.position.set(0.92, yHead + 0.42, 0)
  exDuct.renderOrder = 5
  engineStaticGroup.add(inDuct, exDuct)

  // 点火プラグ (中央)
  const plugCeramic = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.46, 16),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
  )
  plugCeramic.position.set(0, yHead + 0.42, 0)
  const plugHex = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.16, 6),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.25 })
  )
  plugHex.position.set(0, yHead + 0.22, 0)
  engineStaticGroup.add(plugCeramic, plugHex)

  // TDC / BDC ガイドリング
  const tdcRing = new THREE.Mesh(
    new THREE.TorusGeometry(CYL_R + 0.03, 0.015, 8, 32).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.45 })
  )
  tdcRing.position.set(0, CROWN_TDC, 0)
  engineStaticGroup.add(tdcRing)

  // エンジン側ラベル配置 (上面・正面・モバイル非重複)
  setLabelText(lblIntake, 'engIn', mob ? '吸気弁' : '吸気弁 (新気)', '#7dd3fc', '#38bdf8', 0.42)
  lblIntake.position.set(mob ? -1.68 : -1.55, yHead + (mob ? 0.74 : 0.92), -0.95)

  setLabelText(lblExhaust, 'engEx', mob ? '排気弁' : '排気弁 (排出)', '#fdba74', '#f97316', 0.42)
  lblExhaust.position.set(mob ? 1.68 : 1.55, yHead + (mob ? 0.74 : 0.92), 1.48)

  setLabelText(lblCrank, 'engCrank', mob ? 'クランク軸' : 'クランク回転軸', '#cbd5e1', '#64748b', 0.42)
  lblCrank.position.set(0, CRANK_Y - 1.15, 2.05)

  lblGasState.position.set(-1.62, 0.25, 1.45)
  lblSpark.position.set(0, yHead + (mob ? 1.85 : 1.48), -1.65)

  // ======================================================
  // 2. P-V オットーサイクル閉曲線構築
  // ======================================================
  const s = getOttoStates()
  const pt1 = ottoPVToBoard(s.v1, s.p1, s)
  const pt2 = ottoPVToBoard(s.v2, s.p2, s)
  const pt3 = ottoPVToBoard(s.v2, s.p3, s)
  const pt4 = ottoPVToBoard(s.v1, s.p4, s)

  const adiab12Pts = []
  const adiab34Pts = []
  const loop2DPts = []
  const steps = 22

  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const { pt } = evalOttoPV(1, u, s)
    adiab12Pts.push(pt)
    if (i < steps) loop2DPts.push(new THREE.Vector2(pt.x, pt.y))
  }
  loop2DPts.push(new THREE.Vector2(pt2.x, pt2.y))
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const { pt } = evalOttoPV(3, u, s)
    adiab34Pts.push(pt)
    if (i < steps) loop2DPts.push(new THREE.Vector2(pt.x, pt.y))
  }
  loop2DPts.push(new THREE.Vector2(pt4.x, pt4.y))

  const idx = currentStrokeIndex.value
  const addBranchTube = (pts, color, active) => {
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, active ? 0.068 : 0.044, 10, false)
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: active ? 0.95 : 0.35
    })
    pvDynamicGroup.add(new THREE.Mesh(geo, mat))
  }

  // 吸排気ベースライン (V2 <-> V1 at P1)
  const baseLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      ottoPVToBoard(s.v2, s.p1, s),
      pt1
    ]),
    new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.1, gapSize: 0.06, transparent: true, opacity: 0.65 })
  )
  baseLine.computeLineDistances()
  pvDynamicGroup.add(baseLine)

  // 4行程の色分けチューブ
  addBranchTube(adiab12Pts, 0xf59e0b, idx === 1)           // ①->② 断熱圧縮 (#f59e0b)
  addBranchTube([pt2, pt3], 0xf43f5e, idx === 2)           // ②->③ 定積加熱 (#f43f5e)
  addBranchTube(adiab34Pts, 0xf59e0b, idx === 3)           // ③->④ 断熱膨張 (#f59e0b)
  addBranchTube([pt4, pt1], 0x38bdf8, idx === 4)           // ④->① 定積冷却 (#38bdf8)

  // 閉領域塗りつぶし (正味の仕事 W_net: #a855f7 紫発光, depthWrite: false)
  const shape = new THREE.Shape(loop2DPts)
  const fillMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.26,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  fillMesh.position.z = 0.02
  pvDynamicGroup.add(fillMesh)

  // V1, V2 縦補助破線
  const dashMat = new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.6 })
  const v2Guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(pt2.x, -1.48, 0.02), pt3]), dashMat)
  v2Guide.computeLineDistances()
  const v1Guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(pt1.x, -1.48, 0.02), pt4]), dashMat)
  v1Guide.computeLineDistances()
  pvDynamicGroup.add(v2Guide, v1Guide)

  // 頂点スフィア
  const dotGeo = new THREE.SphereGeometry(0.085, 14, 14)
  ;[
    { pt: pt1, col: 0x38bdf8 },
    { pt: pt2, col: 0xf59e0b },
    { pt: pt3, col: 0xf43f5e },
    { pt: pt4, col: 0xf59e0b }
  ].forEach(({ pt, col }) => {
    const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: col }))
    m.position.copy(pt)
    pvDynamicGroup.add(m)
  })

  // P-V ラベル配置 (X/Y/Z分離で全視点・モバイル非重複)
  setLabelText(lblPVTitle, 'pvTitle', mob ? 'オットー P-V図' : 'オットーサイクル P-V線図', '#e2e8f0', '#475569', 0.43)
  setLabelText(lblP, 'pvP', mob ? '↑ P' : '↑ 圧力 P', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.42)
  setLabelText(lblV, 'pvV', mob ? 'V →' : '体積 V →', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.42)
  setLabelText(lblWnet, 'pvW', mob ? '仕事 W_net' : '面積 ＝ 正味の仕事 W_net', '#e9d5ff', '#a855f7', 0.44)

  setLabelText(lblV2, 'pvV2', mob ? 'V₂' : 'V₂ (上死点)', '#94a3b8', '#475569', 0.4)
  lblV2.position.set(pt2.x + 0.05, mob ? -1.98 : -1.9, 0.92)

  setLabelText(lblV1, 'pvV1', mob ? 'V₁' : 'V₁ (下死点)', '#94a3b8', '#475569', 0.4)
  lblV1.position.set(Math.min(0.95, pt1.x), mob ? -2.0 : -1.92, 0.98)

  setLabelText(lblS1, 's1', '①', '#7dd3fc', '#38bdf8', 0.42)
  lblS1.position.set(pt1.x + 0.46, pt1.y + 0.1, 0.28)

  setLabelText(lblS2, 's2', '②', '#fde68a', '#f59e0b', 0.42)
  lblS2.position.set(pt2.x - 0.38, Math.max(-0.82, pt2.y - 0.02), 0.15)

  setLabelText(lblS3, 's3', '③', '#fda4af', '#f43f5e', 0.42)
  lblS3.position.set(pt3.x - 0.36, pt3.y + 0.18, -0.55)

  setLabelText(lblS4, 's4', '④', '#fed7aa', '#f59e0b', 0.42)
  lblS4.position.set(pt4.x + (mob ? 0.22 : 0.44), Math.max(mob ? -0.32 : -0.68, pt4.y + (mob ? 0.72 : 0.42)), -0.52)
}

function updateFrame(dt) {
  if (!sceneObjs) return

  const prevStroke = currentStrokeIndex.value
  if (isRunning.value && dt > 0) {
    simTime += dt * timeScale.value * engineSpeed.value
    const durScale = currentStrokeIndex.value === 2 ? 1.55 : 0.72 // 点火火花が見やすいよう定積加熱は少しじっくり
    strokeProgress.value += dt * durScale * timeScale.value * engineSpeed.value
    if (strokeProgress.value >= 1.0) {
      strokeProgress.value = 0
      currentStrokeIndex.value = (currentStrokeIndex.value + 1) % 5
    }
  }
  if (currentStrokeIndex.value !== prevStroke) {
    rebuildStaticGeometry()
  }

  const {
    pistonGroup,
    rodMesh,
    crankGroup,
    gasVolMesh,
    gasVolMat,
    gasMols,
    molMat,
    intakeValve,
    exhaustValve,
    sparkGroup,
    sparkFlashMat,
    sparkHaloMat,
    intakeFlow,
    exhaustFlow,
    workArrow,
    lblSpark,
    lblGasState,
    cursorSphere
  } = sceneObjs

  const mob = isMobileView()
  const idx = currentStrokeIndex.value
  const u = strokeProgress.value
  const yHead = getHeadY()

  // クランク角 φ (0 = TDC, π = BDC)
  let crankPhi = 0
  if (idx === 0) crankPhi = u * Math.PI
  else if (idx === 1) crankPhi = Math.PI + u * Math.PI
  else if (idx === 2) crankPhi = 2 * Math.PI
  else if (idx === 3) crankPhi = 2 * Math.PI + u * Math.PI
  else {
    crankPhi = u <= 0.28 ? 3 * Math.PI : 3 * Math.PI + ((u - 0.28) / 0.72) * Math.PI
  }

  // スライダ・クランク厳密運動学
  const pinX = CRANK_R * Math.sin(crankPhi)
  const pinY = CRANK_Y + CRANK_R * Math.cos(crankPhi)
  const wristY = pinY + Math.sqrt(Math.max(0.01, ROD_LEN * ROD_LEN - pinX * pinX))
  const crownTopY = wristY + PISTON_H * 0.5

  crankGroup.rotation.z = -crankPhi
  pistonGroup.position.set(0, wristY, 0)

  // コネクティングロッド向き更新
  rodMesh.position.set(pinX, pinY, 0)
  const dx = 0 - pinX
  const dy = wristY - pinY
  rodMesh.rotation.z = Math.atan2(-dx, dy)
  const rodScaleY = Math.hypot(dx, dy) / ROD_LEN
  rodMesh.scale.set(1, rodScaleY, 1)

  // 燃焼室高さとガスボリューム
  const chamberH = Math.max(0.1, yHead - crownTopY)
  gasVolMesh.position.set(0, yHead, 0)
  gasVolMesh.scale.set(1, chamberH, 1)

  // 吸排気弁アニメーション
  const inLift = idx === 0 ? Math.sin(u * Math.PI) * 0.22 : 0
  const exLift = idx === 4 ? Math.sin(u * Math.PI) * 0.22 : 0
  intakeValve.position.set(-0.42, yHead - 0.02 - inLift, 0)
  exhaustValve.position.set(0.42, yHead - 0.02 - exLift, 0)

  // 点火スパークフラッシュ
  if (idx === 2) {
    sparkGroup.visible = true
    sparkGroup.position.set(0, yHead, 0)
    const pulse = 0.75 + 0.25 * Math.sin(u * Math.PI * 6)
    sparkFlashMat.opacity = pulse
    sparkHaloMat.opacity = 0.65 * Math.sin(u * Math.PI)
    setLabelText(lblSpark, 'spark', mob ? '⚡点火!' : '⚡ スパーク点火!', '#fef08a', '#ef4444', 0.44)
  } else {
    sparkGroup.visible = false
    setLabelText(lblSpark, 'spark', mob ? '点火プラグ' : '点火プラグ', '#fde68a', '#f59e0b', 0.4)
  }

  // 吸気・排気の粒子流アニメーション
  if (idx === 0) {
    intakeFlow.forEach((m) => {
      m.visible = true
      const p = (m.userData.phase + u * 2.2) % 1
      m.position.set(-1.35 + p * 0.95, yHead + 0.42 - Math.pow(p, 2) * 0.55, Math.sin(p * 10 + m.userData.phase * 6) * 0.08)
    })
  } else {
    intakeFlow.forEach((m) => { m.visible = false })
  }

  if (idx === 4) {
    exhaustFlow.forEach((m) => {
      m.visible = true
      const p = (m.userData.phase + u * 2.4) % 1
      m.position.set(0.42 + p * 1.15, yHead - 0.05 + Math.sqrt(p) * 0.52, Math.cos(p * 10 + m.userData.phase * 6) * 0.08)
    })
  } else {
    exhaustFlow.forEach((m) => { m.visible = false })
  }

  // ガス温度とカラー遷移
  const t2 = T2.value
  const t3 = maxTempK.value
  const t4 = T4.value
  let curTemp = T1
  const gasCol = new THREE.Color(0x38bdf8)

  if (idx === 0) {
    curTemp = T1
    gasCol.setHex(0x38bdf8) // 涼しい新気シアン
    gasVolMat.opacity = 0.24
  } else if (idx === 1) {
    curTemp = T1 + (t2 - T1) * u
    gasCol.setHex(0x38bdf8).lerp(new THREE.Color(0xf59e0b), u) // 圧縮加熱
    gasVolMat.opacity = 0.24 + u * 0.16
  } else if (idx === 2) {
    curTemp = t2 + (t3 - t2) * u
    gasCol.setHex(0xf59e0b).lerp(new THREE.Color(0xef4444), u) // 爆発燃焼赤
    gasVolMat.opacity = 0.45 + u * 0.25
  } else if (idx === 3) {
    curTemp = t3 + (t4 - t3) * u
    gasCol.setHex(0xef4444).lerp(new THREE.Color(0xf97316), u) // 燃焼プラズマ→オレンジ
    gasVolMat.opacity = 0.65 - u * 0.28
  } else {
    const coolFrac = Math.min(1, u / 0.35)
    curTemp = t4 + (T1 - t4) * coolFrac
    gasCol.setHex(0xf97316).lerp(new THREE.Color(0x38bdf8), coolFrac) // 排気冷却
    gasVolMat.opacity = 0.35 - coolFrac * 0.15
  }

  gasVolMat.color.copy(gasCol)
  molMat.color.copy(gasCol)
  molMat.emissive.copy(gasCol)

  // 気体分子の3D熱運動
  const molSpeed = Math.sqrt(curTemp / 300) * 1.15
  const maxR = CYL_R - 0.16
  gasMols.forEach((m) => {
    if (dt > 0) {
      m.userData.x += m.userData.vx * molSpeed * dt
      m.userData.yNorm += (m.userData.vy * molSpeed * dt) / Math.max(0.25, chamberH)
      m.userData.z += m.userData.vz * molSpeed * dt

      if (m.userData.yNorm < 0.08) { m.userData.yNorm = 0.08; m.userData.vy = Math.abs(m.userData.vy) }
      if (m.userData.yNorm > 0.92) { m.userData.yNorm = 0.92; m.userData.vy = -Math.abs(m.userData.vy) }

      const rSq = m.userData.x * m.userData.x + m.userData.z * m.userData.z
      if (rSq > maxR * maxR) {
        const r = Math.sqrt(rSq)
        const nx = m.userData.x / r
        const nz = m.userData.z / r
        m.userData.x = nx * maxR
        m.userData.z = nz * maxR
        const dot = m.userData.vx * nx + m.userData.vz * nz
        if (dot > 0) {
          m.userData.vx -= 2 * dot * nx
          m.userData.vz -= 2 * dot * nz
        }
      }
    }
    m.position.set(m.userData.x, crownTopY + m.userData.yNorm * chamberH, m.userData.z)
  })

  // 仕事ベクトル矢印 (パワーストローク中強調)
  if (idx === 3) {
    workArrow.visible = true
    workArrow.setVector(new THREE.Vector3(1.28, crownTopY + 0.55, 0), new THREE.Vector3(0, -1, 0), 0.95)
  } else {
    workArrow.visible = false
  }

  // 気体状態ラベル更新
  const stateTxt = idx === 2 || idx === 3
    ? (mob ? `燃焼 ${curTemp.toFixed(0)}K` : `燃焼ガス ${curTemp.toFixed(0)} K`)
    : idx === 4
      ? (mob ? `排気 ${curTemp.toFixed(0)}K` : `排気冷却 ${curTemp.toFixed(0)} K`)
      : (mob ? `混合気 ${curTemp.toFixed(0)}K` : `混合気 ${curTemp.toFixed(0)} K`)
  setLabelText(
    lblGasState,
    'gasState',
    stateTxt,
    idx === 2 || idx === 3 ? '#fda4af' : '#7dd3fc',
    idx === 2 || idx === 3 ? '#ef4444' : '#38bdf8',
    0.42
  )

  // P-V カーソル球体更新
  const s = getOttoStates()
  const { pt } = evalOttoPV(idx, u, s)
  cursorSphere.position.set(pt.x, pt.y, 0.12)
}

watch([compressionRatio, gammaRatio, maxTempK], () => {
  rebuildStaticGeometry()
  updateFrame(0)
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
  margin: 20px 0;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sim-header {
  margin-bottom: 10px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.title-row h3 {
  margin: 0;
  font-size: 1.12rem;
  color: #38bdf8;
}

.badge {
  font-size: 0.74rem;
  padding: 2px 9px;
  border-radius: 999px;
  font-weight: 700;
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.subtitle {
  font-size: 0.86rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
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
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid #334155;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap !important;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px !important;
  border-radius: 10px !important;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-label {
  font-size: 0.78rem;
  color: #38bdf8;
  font-weight: 600;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  flex-wrap: wrap !important;
  gap: 4px;
  max-width: 100%;
}

.speed-btn-group button {
  padding: 4px 8px;
  font-size: 0.74rem;
  border-radius: 8px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
  white-space: nowrap;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: 700;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
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
  gap: 10px;
  flex-wrap: wrap;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.85);
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

.legend-item i:not(.dot-adi):not(.dot-heat):not(.dot-cool):not(.dot-work) {
  font-style: italic;
}

.dot-adi, .dot-heat, .dot-cool, .dot-work {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-adi { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-heat { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-cool { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-work { background: #a855f7; box-shadow: 0 0 6px #a855f7; }

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

.stroke-badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 0.8rem;
  max-width: 100%;
  box-sizing: border-box;
}

.stroke-badge.normal {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #38bdf8;
  color: #38bdf8;
}

.stroke-badge.combustion {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid #ef4444;
  color: #fca5a5;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
}

.stroke-badge.power {
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid #fbbf24;
  color: #fef08a;
}

.stroke-badge.exhaust {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid #38bdf8;
  color: #bae6fd;
}

.control-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 14px;
  margin-top: 10px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: #f8fafc;
}

.control-group strong {
  color: #38bdf8;
  font-family: monospace;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.select-btn {
  padding: 5px 10px;
  font-size: 0.78rem;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #334155;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  font-weight: 600;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #475569;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
}

.btn-secondary:hover {
  background: #475569;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.12rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #38bdf8;
}

.text-purple { color: #c084fc !important; }
.text-rose { color: #f43f5e !important; }
.text-cyan { color: #38bdf8 !important; }

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    border-radius: 10px !important;
    padding: 5px 8px !important;
  }
  .three-hud-legend {
    gap: 6px;
    font-size: 0.66rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.65rem;
    padding: 3px 8px;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .stroke-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
    border-radius: 8px;
  }
}
</style>
