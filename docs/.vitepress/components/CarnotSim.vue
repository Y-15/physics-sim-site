<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔥</span>
        <h3 class="sim-title">3D カルノーサイクル &amp; 熱機関の熱効率シミュレーター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-yellow">理論限界効率 e = 1 − T_L / T_H</span>
      </div>
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

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay">
        {{ isRunning ? '⏸ 一時停止' : '▶ サイクル再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="nextStage">⏩ 次の工程へ</button>
      <button class="btn btn-secondary" @click="resetCycle">⏮ 最初から</button>
    </div>

    <!-- 3D ビューポート (左: 3D P-V図, 右: 3D カルノー熱機関 & 回転式熱源台) -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-iso"></i>等温過程 (<i>T</i>=一定)</span>
          <span class="legend-item"><i class="dot-adi"></i>断熱過程 (<i>Q</i>=0)</span>
          <span class="legend-item"><i class="dot-hot"></i>高温熱源 <b><i>T</i><sub>H</sub></b> (吸熱)</span>
          <span class="legend-item"><i class="dot-cold"></i>低温熱源 <b><i>T</i><sub>L</sub></b> (放熱)</span>
          <span class="legend-item"><i class="dot-work"></i>正味の仕事 <b><i>W</i></b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 工程ステータス帯（ビューポート外で非重複） -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="currentStage % 2 === 0 ? 'iso' : 'adi'">
        {{ stageNames[currentStage] }}
      </span>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">高温熱源 <i>T</i><sub>H</sub></div>
        <div class="stat-value text-rose">{{ TH }} <span class="stat-unit">K</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">低温熱源 <i>T</i><sub>L</sub></div>
        <div class="stat-value text-blue">{{ TL }} <span class="stat-unit">K</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">吸熱量 <i>Q</i><sub>in</sub></div>
        <div class="stat-value text-rose">{{ Qin.toFixed(0) }} <span class="stat-unit">J</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">正味の仕事 <i>W</i></div>
        <div class="stat-value text-purple">{{ Wnet.toFixed(0) }} <span class="stat-unit">J</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">カルノー熱効率 <i>e</i></div>
        <div class="stat-value text-cyan">{{ (carnotEfficiency * 100).toFixed(1) }} <span class="stat-unit">%</span></div>
        <div class="stat-formula">
          <i>e</i> = 1 − <span class="frac"><span class="num"><i>T</i><sub>L</sub></span><span class="den"><i>T</i><sub>H</sub></span></span> = <span class="frac"><span class="num"><i>W</i></span><span class="den"><i>Q</i><sub>in</sub></span></span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>高温熱源温度 <i>T</i><sub>H</sub>:</span>
            <span class="control-val">{{ TH }} K ({{ TH - 273 }} ℃)</span>
          </label>
          <input type="range" v-model.number="TH" min="400" max="900" step="20" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>低温熱源温度 <i>T</i><sub>L</sub>:</span>
            <span class="control-val">{{ TL }} K ({{ TL - 273 }} ℃)</span>
          </label>
          <input type="range" v-model.number="TL" min="200" max="400" step="10" class="sim-slider" />
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>熱力学の金字塔</strong>:
      どんなに優秀な技術者が未来の技術で作っても、<strong>熱機関の効率はカルノー効率 <i>e</i> = 1 − <span class="frac"><span class="num"><i>T</i><sub><i>L</i></sub></span><span class="den"><i>T</i><sub><i>H</i></sub></span></span> を超えることはできません</strong>（熱力学第2法則）。<br>
      熱効率を 100% にするには、低温熱源を絶対零度（<i>T</i><sub><i>L</i></sub> = 0 K）にする必要がありますが、これは有限回の操作では不可能です。
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

// 温度 [K]
const TH = ref(600)
const TL = ref(300)

// カルノーサイクル 4工程
const currentStage = ref(0)
const stageProgress = ref(0) // 0..1
const stageNames = [
  '① A→B 等温膨張（T_H 高温熱源と接触・吸熱 Q_H）',
  '② B→C 断熱膨張（断熱台へ切替・温度降下 T_H → T_L）',
  '③ C→D 等温圧縮（T_L 低温熱源と接触・放熱 Q_C）',
  '④ D→A 断熱圧縮（断熱台へ切替・温度上昇 T_L → T_H）'
]

const carnotEfficiency = computed(() => Math.max(0, 1 - TL.value / TH.value))
const Qin = computed(() => TH.value * 2.5)
const Wnet = computed(() => Qin.value * carnotEfficiency.value)

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(2.1, Math.max(1.42, 1.82 / Math.max(0.68, aspect))) : 1.0
}

function isMobileView() {
  return getMobScale() > 1.02
}

function getCamParams(preset) {
  const ms = getMobScale()
  const cx = 0.05
  if (preset === 'front') {
    return { pos: [cx, 0.15, 46.5 * ms], target: [cx, 0.15, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx + 0.15, 53.5 * ms, 0.55], target: [cx + 0.15, 0.0, -0.2], fov: 14 }
  }
  return { pos: [cx + 0.4 * ms, 4.4 * ms, 13.8 * ms], target: [cx, 0.15, -0.2], fov: 40 }
}

function setCameraPreset(preset, duration = 0.55) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepForward() {
  isRunning.value = false
  const prev = currentStage.value
  stageProgress.value += 0.1
  if (stageProgress.value >= 1.0) {
    stageProgress.value = 0
    currentStage.value = (currentStage.value + 1) % 4
  }
  if (currentStage.value !== prev) rebuildCarnotLoop()
  updateFrame(0)
}

function nextStage() {
  currentStage.value = (currentStage.value + 1) % 4
  stageProgress.value = 0
  rebuildCarnotLoop()
  updateFrame(0)
}

function resetCycle() {
  currentStage.value = 0
  stageProgress.value = 0
  rebuildCarnotLoop()
  updateFrame(0)
}

// ==========================================================
// カルノーサイクル物理曲線 (P = T/V, PV^gamma_eff = const)
// ==========================================================
const V_A = 1.0
const V_B = 2.5
const GAMMA_EXP = 0.72 // 1 / (gamma_eff - 1) -> gamma_eff ≈ 2.39 for crisp full-range P-V display

function getCarnotStates() {
  const th = TH.value
  const tl = Math.min(th - 1, TL.value)
  const adFactor = Math.pow(Math.max(1.0, th / Math.max(1, tl)), GAMMA_EXP)
  const vA = V_A
  const vB = V_B
  const vD = vA * adFactor
  const vC = vB * adFactor

  const pA = th / vA
  const pB = th / vB
  const pC = tl / vC
  const pD = tl / vD

  return { vA, vB, vC, vD, pA, pB, pC, pD, th, tl, adFactor }
}

function pvToBoard(v, p) {
  const vMin = 0.6
  const vMax = 7.8
  const pMin = 0
  const pMax = 960
  const x = -2.0 + ((v - vMin) / (vMax - vMin)) * 4.25
  const y = -1.45 + ((p - pMin) / (pMax - pMin)) * 3.35
  return new THREE.Vector3(x, y, 0.06)
}

function evalCarnotState(stage, t) {
  const s = getCarnotStates()
  let v = s.vA
  let p = s.pA
  let temp = s.th
  if (stage === 0) {
    // A -> B: 等温膨張 (T = TH)
    v = s.vA + (s.vB - s.vA) * t
    p = s.th / v
    temp = s.th
  } else if (stage === 1) {
    // B -> C: 断熱膨張 (TH -> TL)
    v = s.vB + (s.vC - s.vB) * t
    const ratio = s.vB / v
    temp = s.th * Math.pow(ratio, 1 / GAMMA_EXP)
    p = temp / v
  } else if (stage === 2) {
    // C -> D: 等温圧縮 (T = TL)
    v = s.vC + (s.vD - s.vC) * t
    p = s.tl / v
    temp = s.tl
  } else {
    // D -> A: 断熱圧縮 (TL -> TH)
    v = s.vD + (s.vA - s.vD) * t
    const ratio = s.vD / v
    temp = s.tl * Math.pow(ratio, 1 / GAMMA_EXP)
    p = temp / v
  }
  return { v, p, temp, pt: pvToBoard(v, p), vNorm: Math.min(1, Math.max(0, (v - V_A) / (s.vC - V_A))) }
}

// ==========================================================
// Three.js シーン構築・破棄ユーティリティ
// ==========================================================
let sceneObjs = null
let resizeObs = null
let lastIsMob = false
let simTime = 0
let carouselAngle = 0
const labelCache = {}

function setLabelText(sprite, key, text, color, borderColor, baseScale = 0.45) {
  const mult = isMobileView() ? 1.56 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}`
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
        rebuildCarnotLoop()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.18, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D P-V カルノー閉ループ線図 (中心 x = -3.0)
  // ======================================================
  const pvGroup = new THREE.Group()
  pvGroup.position.set(-3.0, 0.25, 0)
  scene.add(pvGroup)

  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(5.3, 4.3),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
  )
  boardBack.position.set(0, 0.1, -0.08)
  pvGroup.add(boardBack)

  const boardFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.65, -2.05, -0.05),
      new THREE.Vector3(2.65, -2.05, -0.05),
      new THREE.Vector3(2.65, 2.25, -0.05),
      new THREE.Vector3(-2.65, 2.25, -0.05)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  pvGroup.add(boardFrame)

  const axOrigin = new THREE.Vector3(-2.18, -1.48, 0)
  const vAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.028, headRadius: 0.09, headLength: 0.22 })
  vAx.setVector(axOrigin, new THREE.Vector3(1, 0, 0), 4.6)
  pvGroup.add(vAx)

  const pAx = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.028, headRadius: 0.09, headLength: 0.22 })
  pAx.setVector(axOrigin, new THREE.Vector3(0, 1, 0), 3.45)
  pvGroup.add(pAx)

  const labelV = createTextSprite('体積 V →', { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.4)', fontSize: 32, scale: 0.44 })
  labelV.position.set(2.08, -1.82, -1.35)
  pvGroup.add(labelV)

  const labelP = createTextSprite('↑ 圧力 P', { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.4)', fontSize: 32, scale: 0.44 })
  labelP.position.set(-1.62, 1.98, -1.25)
  pvGroup.add(labelP)

  const loopContainer = new THREE.Group()
  pvGroup.add(loopContainer)

  const cursorSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf43f5e, emissiveIntensity: 0.85 })
  )
  cursorSphere.renderOrder = 5
  pvGroup.add(cursorSphere)

  const labelA = createTextSprite('A', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.42 })
  const labelB = createTextSprite('B', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 30, scale: 0.42 })
  const labelC = createTextSprite('C', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.42 })
  const labelD = createTextSprite('D', { color: '#cbd5e1', borderColor: '#f59e0b', fontSize: 30, scale: 0.42 })
  pvGroup.add(labelA, labelB, labelC, labelD)

  const labelWorkArea = createTextSprite('面積 ＝ 正味の仕事 W', {
    color: '#e9d5ff',
    borderColor: '#a855f7',
    fontSize: 32,
    scale: 0.46
  })
  labelWorkArea.position.set(-0.15, -2.48, 1.55)
  pvGroup.add(labelWorkArea)

  // ======================================================
  // 2. 右側: 3D 縦型ピストンシリンダー + 3熱源回転台 (中心 x = +3.1)
  // ======================================================
  const engineGroup = new THREE.Group()
  engineGroup.position.set(3.1, 0.0, 0)
  scene.add(engineGroup)

  const cylBottomY = -0.72
  const cylHeight = 2.65
  const cylR = 1.05

  // 外側透明ガラスシリンダー (depthWrite: false, renderOrder: 6)
  const glassGeo = new THREE.CylinderGeometry(cylR, cylR, cylHeight, 36, 1, true)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.21,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glassMesh = new THREE.Mesh(glassGeo, glassMat)
  glassMesh.position.set(0, cylBottomY + cylHeight / 2, 0)
  glassMesh.renderOrder = 6
  engineGroup.add(glassMesh)

  // 光沢縦筋ハイライト (depthWrite: false, renderOrder: 6)
  const glossGeo = new THREE.CylinderGeometry(cylR + 0.008, cylR + 0.008, cylHeight, 16, 1, true, 0.25, 0.35)
  const glossMesh = new THREE.Mesh(
    glossGeo,
    new THREE.MeshBasicMaterial({ color: 0xf0f9ff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
  )
  glossMesh.position.set(0, cylBottomY + cylHeight / 2, 0)
  glossMesh.renderOrder = 6
  engineGroup.add(glossMesh)

  // シリンダー上下メタルリム・熱伝導底板
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.72, roughness: 0.26 })
  const topRim = new THREE.Mesh(new THREE.TorusGeometry(cylR, 0.045, 12, 36).rotateX(Math.PI / 2), rimMat)
  topRim.position.set(0, cylBottomY + cylHeight, 0)
  const botRim = new THREE.Mesh(new THREE.TorusGeometry(cylR, 0.045, 12, 36).rotateX(Math.PI / 2), rimMat)
  botRim.position.set(0, cylBottomY, 0)
  const conductBase = new THREE.Mesh(
    new THREE.CylinderGeometry(cylR, cylR, 0.1, 36),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.25 })
  )
  conductBase.position.set(0, cylBottomY - 0.05, 0)
  engineGroup.add(topRim, botRim, conductBase)

  // 工程カラー識別発光リング (等温 #10b981 / 断熱 #f59e0b)
  const procRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 })
  const procRing = new THREE.Mesh(new THREE.TorusGeometry(cylR + 0.06, 0.032, 10, 36).rotateX(Math.PI / 2), procRingMat)
  procRing.position.set(0, cylBottomY + 0.14, 0)
  engineGroup.add(procRing)

  // 気体内部発光ボリューム (depthWrite: false, renderOrder: 2)
  const gasVolGeo = new THREE.CylinderGeometry(cylR - 0.04, cylR - 0.04, 1.0, 32)
  gasVolGeo.translate(0, 0.5, 0)
  const gasVolMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.22, depthWrite: false })
  const gasVolMesh = new THREE.Mesh(gasVolGeo, gasVolMat)
  gasVolMesh.position.set(0, cylBottomY, 0)
  gasVolMesh.renderOrder = 2
  engineGroup.add(gasVolMesh)

  // 可動ピストン (縦方向 Y)
  const pistonGroup = new THREE.Group()
  engineGroup.add(pistonGroup)

  const pHead = new THREE.Mesh(
    new THREE.CylinderGeometry(cylR - 0.03, cylR - 0.03, 0.22, 36),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.78, roughness: 0.22 })
  )
  pHead.position.set(0, 0.11, 0)
  pHead.renderOrder = 1
  const pSealRing = new THREE.Mesh(
    new THREE.TorusGeometry(cylR - 0.02, 0.025, 10, 36).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.3 })
  )
  pSealRing.position.set(0, 0.11, 0)
  const pRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 1.15, 20),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.82, roughness: 0.2 })
  )
  pRod.position.set(0, 0.78, 0)
  const pKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.3 })
  )
  pKnob.position.set(0, 1.38, 0)
  pistonGroup.add(pHead, pSealRing, pRod, pKnob)

  // 3D 気体分子 (34個, renderOrder: 1)
  const gasMols = []
  const molGeo = new THREE.SphereGeometry(0.072, 12, 12)
  const molMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.55 })
  for (let i = 0; i < 34; i++) {
    const m = new THREE.Mesh(molGeo, molMat)
    m.renderOrder = 1
    const r = Math.sqrt(Math.random()) * (cylR - 0.22)
    const ang = Math.random() * Math.PI * 2
    m.userData = {
      yNorm: 0.08 + Math.random() * 0.84,
      x: r * Math.cos(ang),
      z: r * Math.sin(ang),
      vx: (Math.random() - 0.5) * 2.4,
      vy: (Math.random() - 0.5) * 2.4,
      vz: (Math.random() - 0.5) * 2.4
    }
    engineGroup.add(m)
    gasMols.push(m)
  }

  // ======================================================
  // 3-Station 回転式熱源カルーセル (中心: (0, -1.16, -1.45) relative to engineGroup)
  // ======================================================
  const carouselPivot = new THREE.Group()
  const carouselR = 1.45
  carouselPivot.position.set(0, -1.14, -carouselR)
  engineGroup.add(carouselPivot)

  const platter = new THREE.Mesh(
    new THREE.CylinderGeometry(carouselR + 0.65, carouselR + 0.72, 0.14, 42),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.45 })
  )
  platter.position.set(0, -0.25, 0)
  carouselPivot.add(platter)

  // Station 0 (angle 0 -> +Z): 高温熱源 T_H (Red/Orange Heater)
  const stHot = new THREE.Group()
  stHot.position.set(0, 0, carouselR)
  const hotBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.02, 0.36, 32),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6, roughness: 0.3 })
  )
  const hotCoil = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.055, 10, 28).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.85 })
  )
  hotCoil.position.set(0, 0.2, 0)
  stHot.add(hotBlock, hotCoil)
  carouselPivot.add(stHot)

  // Station 1 (angle +120°): 断熱台 (Insulator Base - Slate + Amber Shield)
  const stAdi = new THREE.Group()
  const a1 = (2 * Math.PI) / 3
  stAdi.position.set(carouselR * Math.sin(a1), 0, carouselR * Math.cos(a1))
  const adiBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.02, 0.36, 32),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75, metalness: 0.25 })
  )
  const adiShield = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.05, 10, 28).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5 })
  )
  adiShield.position.set(0, 0.2, 0)
  stAdi.add(adiBlock, adiShield)
  carouselPivot.add(stAdi)

  // Station 2 (angle +240°): 低温熱源 T_L (Cyan/Blue Cooler)
  const stCold = new THREE.Group()
  const a2 = (4 * Math.PI) / 3
  stCold.position.set(carouselR * Math.sin(a2), 0, carouselR * Math.cos(a2))
  const coldBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.02, 0.36, 32),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0ea5e9, emissiveIntensity: 0.45, roughness: 0.25 })
  )
  const coldRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.05, 10, 28).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.75 })
  )
  coldRing.position.set(0, 0.2, 0)
  stCold.add(coldBlock, coldRing)
  carouselPivot.add(stCold)

  // アニメーション付き 3D 熱流矢印 (Q_H / Q_C) & 仕事ベクトル矢印 (W)
  const heatArrows = []
  for (let i = 0; i < 3; i++) {
    const arr = createVectorArrow3D({ color: 0xef4444, shaftRadius: 0.045, headRadius: 0.13, headLength: 0.28 })
    engineGroup.add(arr)
    heatArrows.push(arr)
  }

  const workArrow = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.32 })
  engineGroup.add(workArrow)

  // シリンダー側ラベル群
  const labelGasTemp = createTextSprite('気体 T = 600 K', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 32,
    scale: 0.46
  })
  labelGasTemp.position.set(-0.15, 2.72, -0.75)
  engineGroup.add(labelGasTemp)

  const labelWorkVec = createTextSprite('仕事 W_out ↑', {
    color: '#e9d5ff',
    borderColor: '#a855f7',
    fontSize: 30,
    scale: 0.44
  })
  labelWorkVec.position.set(1.22, 1.55, 0.55)
  engineGroup.add(labelWorkVec)

  const labelReservoir = createTextSprite('🔥 高温熱源 T_H 吸熱 Q_H ↑', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    fontSize: 32,
    scale: 0.48
  })
  labelReservoir.position.set(0.0, -2.02, 1.25)
  engineGroup.add(labelReservoir)

  sceneObjs = {
    loopContainer,
    cursorSphere,
    labelA,
    labelB,
    labelC,
    labelD,
    labelP,
    labelV,
    labelWorkArea,
    cylBottomY,
    cylR,
    procRingMat,
    gasVolMesh,
    gasVolMat,
    pistonGroup,
    gasMols,
    molMat,
    carouselPivot,
    heatArrows,
    workArrow,
    labelGasTemp,
    labelWorkVec,
    labelReservoir
  }

  rebuildCarnotLoop()
  updateFrame(0)
}

function rebuildCarnotLoop() {
  if (!sceneObjs) return
  const { loopContainer, labelA, labelB, labelC, labelD, labelP, labelV, labelWorkArea } = sceneObjs
  clearGroup(loopContainer)

  const s = getCarnotStates()
  const mob = isMobileView()
  const ptA = pvToBoard(s.vA, s.pA)
  const ptB = pvToBoard(s.vB, s.pB)
  const ptC = pvToBoard(s.vC, s.pC)
  const ptD = pvToBoard(s.vD, s.pD)

  // 4工程の真の曲線サンプル生成
  const branches = [
    { stage: 0, color: 0x10b981, active: currentStage.value === 0 }, // A->B 等温 (#10b981)
    { stage: 1, color: 0xf59e0b, active: currentStage.value === 1 }, // B->C 断熱 (#f59e0b)
    { stage: 2, color: 0x10b981, active: currentStage.value === 2 }, // C->D 等温 (#10b981)
    { stage: 3, color: 0xf59e0b, active: currentStage.value === 3 }  // D->A 断熱 (#f59e0b)
  ]

  const allPts2D = []
  branches.forEach(({ stage, color, active }) => {
    const curvePts = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const { pt } = evalCarnotState(stage, i / steps)
      curvePts.push(pt)
      if (i < steps) allPts2D.push(new THREE.Vector2(pt.x, pt.y))
    }
    const curve = new THREE.CatmullRomCurve3(curvePts)
    const radius = active ? 0.068 : 0.042
    const tubeGeo = new THREE.TubeGeometry(curve, 24, radius, 10, false)
    const tubeMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: active ? 0.95 : 0.35
    })
    loopContainer.add(new THREE.Mesh(tubeGeo, tubeMat))
  })

  // 囲まれた面積 (正味の仕事 W: 紫発光 #a855f7, depthWrite: false)
  if (TH.value - TL.value >= 10) {
    const shape = new THREE.Shape(allPts2D)
    const fillMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
    fillMesh.position.z = 0.02
    loopContainer.add(fillMesh)
  }

  // 4頂点スフィア
  const cornerGeo = new THREE.SphereGeometry(0.085, 14, 14)
  ;[
    { pt: ptA, col: 0xef4444 },
    { pt: ptB, col: 0x10b981 },
    { pt: ptC, col: 0x38bdf8 },
    { pt: ptD, col: 0xf59e0b }
  ].forEach(({ pt, col }) => {
    const m = new THREE.Mesh(cornerGeo, new THREE.MeshBasicMaterial({ color: col }))
    m.position.copy(pt)
    loopContainer.add(m)
  })

  // 頂点・軸ラベル配置 (X・Z分離で正面・上面・モバイル非衝突)
  setLabelText(labelP, 'pvP', mob ? 'P' : '↑ 圧力 P', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.42)
  setLabelText(labelV, 'pvV', mob ? 'V →' : '体積 V →', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.42)
  setLabelText(labelWorkArea, 'pvW', mob ? '面積 = 仕事 W' : '囲まれた面積 ＝ 正味の仕事 W', '#e9d5ff', '#a855f7', 0.44)

  setLabelText(labelA, 'pvA', mob ? 'A' : `A (${TH.value}K)`, '#6ee7b7', '#10b981', 0.4)
  labelA.position.set(ptA.x - 0.12, ptA.y + 0.34, -0.25)

  setLabelText(labelB, 'pvB', mob ? 'B' : `B (${TH.value}K)`, '#fde68a', '#f59e0b', 0.4)
  labelB.position.set(ptB.x + 0.55, ptB.y + 0.26, -0.95)

  setLabelText(labelC, 'pvC', mob ? 'C' : `C (${TL.value}K)`, '#7dd3fc', '#38bdf8', 0.4)
  labelC.position.set(ptC.x + 0.32, ptC.y - 0.32, 0.25)

  setLabelText(labelD, 'pvD', mob ? 'D' : `D (${TL.value}K)`, '#fde68a', '#f59e0b', 0.4)
  labelD.position.set(ptD.x - 0.55, ptD.y - 0.32, 1.05)
}

function updateFrame(dt) {
  if (!sceneObjs) return

  const prevStage = currentStage.value
  if (isRunning.value && dt > 0) {
    simTime += dt * timeScale.value
    stageProgress.value += dt * 0.42 * timeScale.value
    if (stageProgress.value >= 1.0) {
      stageProgress.value = 0
      currentStage.value = (currentStage.value + 1) % 4
    }
  }
  if (currentStage.value !== prevStage) {
    rebuildCarnotLoop()
  }

  const {
    cursorSphere,
    cylBottomY,
    cylR,
    procRingMat,
    gasVolMesh,
    gasVolMat,
    pistonGroup,
    gasMols,
    molMat,
    carouselPivot,
    heatArrows,
    workArrow,
    labelGasTemp,
    labelWorkVec,
    labelReservoir
  } = sceneObjs

  const mob = isMobileView()
  const st = evalCarnotState(currentStage.value, stageProgress.value)
  cursorSphere.position.set(st.pt.x, st.pt.y, 0.12)

  // ピストン高さ (0.52 .. 2.15)
  const gasSpan = 0.52 + st.vNorm * 1.63
  pistonGroup.position.set(0, cylBottomY + gasSpan, 0)
  gasVolMesh.scale.set(1, gasSpan, 1)

  // 温度に応じた気体色補間 (TL: #38bdf8 青 -> TH: #ef4444 赤)
  const tempFrac = Math.min(1, Math.max(0, (st.temp - TL.value) / Math.max(1, TH.value - TL.value)))
  const gasCol = new THREE.Color(0x38bdf8).lerp(new THREE.Color(0xef4444), tempFrac)
  gasVolMat.color.copy(gasCol)
  molMat.color.copy(gasCol)
  molMat.emissive.copy(gasCol)

  // 工程カラーリング (等温 #10b981 / 断熱 #f59e0b)
  const isIsothermal = currentStage.value === 0 || currentStage.value === 2
  procRingMat.color.setHex(isIsothermal ? 0x10b981 : 0xf59e0b)

  // 気体分子の3D運動
  const molSpeed = Math.sqrt(st.temp / 300) * 1.35
  const maxR = cylR - 0.2
  gasMols.forEach((m) => {
    if (dt > 0) {
      m.userData.x += m.userData.vx * molSpeed * dt
      m.userData.yNorm += (m.userData.vy * molSpeed * dt) / Math.max(0.35, gasSpan)
      m.userData.z += m.userData.vz * molSpeed * dt

      if (m.userData.yNorm < 0.06) { m.userData.yNorm = 0.06; m.userData.vy = Math.abs(m.userData.vy) }
      if (m.userData.yNorm > 0.94) { m.userData.yNorm = 0.94; m.userData.vy = -Math.abs(m.userData.vy) }

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
    m.position.set(m.userData.x, cylBottomY + m.userData.yNorm * gasSpan, m.userData.z)
  })

  // 回転熱源カルーセルのスムーズ角度補間 (0: T_H -> 0°, 1/3: 断熱 -> -120°, 2: T_L -> -240°)
  let targetAng = 0
  if (currentStage.value === 0) targetAng = 0
  else if (currentStage.value === 1 || currentStage.value === 3) targetAng = -(2 * Math.PI) / 3
  else targetAng = -(4 * Math.PI) / 3

  // 最短角回転
  let diff = targetAng - carouselAngle
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  carouselAngle += dt > 0 ? diff * Math.min(1, dt * 7.5) : diff
  carouselPivot.rotation.y = carouselAngle

  // 仕事ベクトル矢印 W (膨張中は上向き、圧縮中は下向き)
  const isExpanding = currentStage.value === 0 || currentStage.value === 1
  const wPosY = cylBottomY + gasSpan + (isExpanding ? 0.5 : 1.45)
  workArrow.setVector(
    new THREE.Vector3(1.38, wPosY, 0),
    new THREE.Vector3(0, isExpanding ? 1 : -1, 0),
    0.92
  )
  setLabelText(
    labelWorkVec,
    'engW',
    isExpanding ? (mob ? '仕事 W_out↑' : '膨張仕事 W_out ↑') : (mob ? '仕事 W_in↓' : '圧縮仕事 W_in ↓'),
    '#e9d5ff',
    '#a855f7',
    0.42
  )

  // 熱流矢印 (Q_H 吸熱 ↑ / Q_C 放熱 ↓)
  const pulse = ((simTime * 1.4) % 1) * 0.25
  if (currentStage.value === 0) {
    heatArrows.forEach((arr, idx) => {
      arr.visible = true
      arr.traverse((c) => {
        if (c.material && c.material.color) {
          c.material.color.setHex(0xef4444)
          c.material.emissive.setHex(0xef4444)
        }
      })
      const ox = (idx - 1) * 0.45
      arr.setVector(new THREE.Vector3(ox, cylBottomY - 0.35 + pulse, 0.55), new THREE.Vector3(0, 1, 0), 0.72)
    })
    setLabelText(
      labelReservoir,
      'res',
      mob ? `🔥 高温 T_H=${TH.value}K 吸熱↑` : `🔥 高温熱源 T_H (${TH.value}K) 吸熱 Q_H ↑`,
      '#fca5a5',
      '#ef4444',
      0.46
    )
  } else if (currentStage.value === 2) {
    heatArrows.forEach((arr, idx) => {
      arr.visible = true
      arr.traverse((c) => {
        if (c.material && c.material.color) {
          c.material.color.setHex(0x38bdf8)
          c.material.emissive.setHex(0x38bdf8)
        }
      })
      const ox = (idx - 1) * 0.45
      arr.setVector(new THREE.Vector3(ox, cylBottomY + 0.36 - pulse, 0.55), new THREE.Vector3(0, -1, 0), 0.72)
    })
    setLabelText(
      labelReservoir,
      'res',
      mob ? `❄️ 低温 T_L=${TL.value}K 放熱↓` : `❄️ 低温熱源 T_L (${TL.value}K) 放熱 Q_C ↓`,
      '#7dd3fc',
      '#38bdf8',
      0.46
    )
  } else {
    heatArrows.forEach((arr) => { arr.visible = false })
    setLabelText(
      labelReservoir,
      'res',
      mob ? '🛡️ 断熱台 (Q=0)' : '🛡️ 断熱台に切替 (熱の出入り Q = 0)',
      '#fde68a',
      '#f59e0b',
      0.46
    )
  }

  // 気体温度ラベル更新
  setLabelText(
    labelGasTemp,
    'gasT',
    mob ? `気体 T=${st.temp.toFixed(0)}K` : `気体温度 T = ${st.temp.toFixed(0)} K`,
    tempFrac > 0.5 ? '#fda4af' : '#7dd3fc',
    tempFrac > 0.5 ? '#ef4444' : '#38bdf8',
    0.45
  )
}

watch([TH, TL], () => {
  rebuildCarnotLoop()
  updateFrame(0)
})

watch(currentStage, () => {
  rebuildCarnotLoop()
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
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
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
}

.btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
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

.sim-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.76rem;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
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

.legend-item i:not(.dot-iso):not(.dot-adi):not(.dot-hot):not(.dot-cold):not(.dot-work) {
  font-style: italic;
}

.dot-iso, .dot-adi, .dot-hot, .dot-cold, .dot-work {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-iso { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-adi { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-hot { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
.dot-cold { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
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

.three-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  max-width: 100%;
  box-sizing: border-box;
}
.three-status-badge.iso {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}
.three-status-badge.adi {
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
}

.stat-label {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-formula {
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: 4px;
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-purple { color: #c084fc; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 14px;
  background: #1e293b;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #334155;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
}

.control-val {
  color: #38bdf8;
  font-family: monospace;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: #1e293b;
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  font-size: 0.85em;
  padding: 0 3px;
  line-height: 1.1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.frac .den {
  padding-top: 1px;
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
  .three-status-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
