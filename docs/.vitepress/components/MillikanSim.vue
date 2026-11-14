<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔬</span>
        <h3 class="sim-title">3D ミリカンの油滴実験（電気素量の測定）シミュレーター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-amber"><i>q</i> = <i>n e</i>（電荷の量子化）</span>
      </div>
    </div>

    <p class="subtitle">
      平行平板コンデンサー内の微小油滴に働く重力 <i>mg</i>、静電力 <i>qE</i>、空気の粘性抵抗（ストークスの法則 6<i>πηrv</i>）のつり合いと、
      X線照射による電荷の離散的ジャンプ（<i>q</i> = −<i>ne</i>）を3D観測チャンバーと量子化ヒストグラムで体験できます。
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
      <button class="btn btn-secondary" @click="stepFrame">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="resetDefaults">⏮ リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            選択油滴 (−{{ selectedChargeN }}<i>e</i>)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
            静電力 <i>qE</i> / 正極(+)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            重力 <i>mg</i> / 負極(−)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#a855f7;box-shadow:0 0 6px #a855f7"></i>
            粘性抵抗 6<i>πηrv</i>
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="statusClass">
        {{ statusText }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>極板間電圧 <i>V</i> (上極板 − 下極板):</span>
            <strong>{{ plateVoltageV >= 0 ? '+' : '' }}{{ plateVoltageV }} V</strong>
          </label>
          <input type="range" v-model.number="plateVoltageV" min="-3500" max="3500" step="10" />
          <div class="sub-row">
            <span class="sub-info">電場 <i>E</i> = {{ (Math.abs(plateVoltageV) / 0.01 / 1000).toFixed(1) }} kV/m ({{ plateVoltageV > 0 ? '下向き' : plateVoltageV < 0 ? '上向き' : 'なし' }})</span>
            <button class="mini-chip" @click="flipPolarity">⇄ 極性反転</button>
          </div>
        </div>

        <div class="control-group">
          <span class="control-label">選択中の油滴の電荷 <i>q</i>:</span>
          <div class="btn-group">
            <button
              v-for="n in [1, 2, 3, 4, 5]"
              :key="n"
              class="select-btn"
              :class="{ active: selectedChargeN === n }"
              @click="selectedChargeN = n"
            >
              <i>q</i> = −{{ n }}<i>e</i>
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>油滴の半径 <i>r</i>:</span>
            <strong>{{ dropletRadiusUm.toFixed(2) }} μm</strong>
          </label>
          <input type="range" v-model.number="dropletRadiusUm" min="0.60" max="1.15" step="0.01" />
          <span class="sub-info">質量 <i>m</i> = {{ (dropletMassKg * 1e15).toFixed(2) }} fg (密度 890 kg/m³)</span>
        </div>

        <div class="control-group">
          <span class="control-label">X線照射（イオン付着による電荷ジャンプ）:</span>
          <button class="btn select-btn highlight-btn" @click="ionizeDroplets">
            ⚡ X線を照射して電荷をランダム変化
          </button>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="autoBalanceSelected">
          🎯 選択油滴をつり合い電圧 ({{ balanceVoltageV.toFixed(0) }} V) に自動調整
        </button>
        <button class="btn btn-secondary" @click="plateVoltageV = 0">
          🍂 電場オフ (V = 0 V で自由落下)
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">選択油滴の電気量 <i>q</i></span>
        <span class="value highlight">−{{ (selectedChargeN * 1.602).toFixed(3) }} <span class="unit">× 10<sup>−19</sup> C</span></span>
        <span class="subtext"><i>q</i> = −{{ selectedChargeN }}<i>e</i>（電気素量 {{ selectedChargeN }} 個分）</span>
      </div>

      <div class="stat-card">
        <span class="label">終端速度 <i>v</i><sub>y</sub> (+上向き)</span>
        <span class="value" :class="isSelectedBalanced ? 'text-emerald' : 'text-cyan'">
          {{ terminalVelocityUmS >= 0 ? '+' : '' }}{{ terminalVelocityUmS.toFixed(1) }} <span class="unit">μm/s</span>
        </span>
        <span class="subtext">{{ isSelectedBalanced ? 'qE = mg つり合い静止!' : '6πηrv = |qE − mg|' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">静止つり合い電圧 <i>V</i><sub>bal</sub></span>
        <span class="value">+{{ balanceVoltageV.toFixed(0) }} <span class="unit">V</span></span>
        <span class="subtext"><i>V</i><sub>bal</sub> = <i>mgd</i> / <i>q</i> (<i>d</i> = 1.0 cm)</span>
      </div>

      <div class="stat-card">
        <span class="label">測定される電気素量 <i>e</i></span>
        <span class="value">1.602 <span class="unit">× 10<sup>−19</sup> C</span></span>
        <span class="subtext">電荷の量子化（最小単位）</span>
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

const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')

const plateVoltageV = ref(700) // V (-3500..+3500)
const selectedChargeN = ref(2) // 2e
const dropletRadiusUm = ref(0.85) // 0.85 μm

const eConst = 1.602e-19
const rhoOil = 890 // kg/m^3
const plateDistanceM = 0.01 // 1.0 cm
const gConst = 9.80 // m/s^2
const etaAir = 1.82e-5 // Pa*s

// 質量 m = 4/3 * pi * r^3 * rho
const dropletMassKg = computed(() => {
  const rM = dropletRadiusUm.value * 1e-6
  return (4 / 3) * Math.PI * (rM ** 3) * rhoOil
})

// つり合い電圧 V_bal = mg * d / (n * e)
const balanceVoltageV = computed(() => {
  const mg = dropletMassKg.value * gConst
  const q = selectedChargeN.value * eConst
  return (mg * plateDistanceM) / q
})

// 選択油滴の力の計算
const selectedForces = computed(() => {
  const rM = dropletRadiusUm.value * 1e-6
  const mg = dropletMassKg.value * gConst // 下向き大きさ
  const q = selectedChargeN.value * eConst
  const E = plateVoltageV.value / plateDistanceM // 上極板+で正 -> 負電荷に上向き力
  const qE = q * E // +なら上向き, -なら下向き
  const netY = qE - mg
  const vTerm = netY / (6 * Math.PI * etaAir * rM) // m/s (+上向き)
  const drag = -netY // 終端速度では F_d + qE - mg = 0
  return { mg, qE, drag, netY, vTerm }
})

const terminalVelocityUmS = computed(() => selectedForces.value.vTerm * 1e6)

const isSelectedBalanced = computed(() => {
  const { mg, netY } = selectedForces.value
  return Math.abs(netY) / Math.max(1e-20, mg) < 0.03
})

const statusClass = computed(() => {
  if (isSelectedBalanced.value) return 'balanced'
  if (plateVoltageV.value < 0) return 'reversed'
  return 'moving'
})

const statusText = computed(() => {
  if (isSelectedBalanced.value) {
    return `✨ 静止つり合い達成! (qE ≈ mg, 選択油滴 q = −${selectedChargeN.value}e が空中で静止)`
  }
  if (plateVoltageV.value === 0) {
    return `🍂 無電場 (V = 0V): 重力 mg と空気抵抗 6πηrv がつり合い自由落下中`
  }
  if (plateVoltageV.value < 0) {
    return `⬇️ 極性反転 (上−/下+): qE と mg がともに下向きに働き急速下降中`
  }
  return selectedForces.value.netY > 0
    ? `⬆️ 上昇中 (qE > mg): 静電力が重力に勝り、終端速度 +${terminalVelocityUmS.value.toFixed(1)} μm/s で上昇`
    : `⬇️ 下降中 (qE < mg): 重力が静電力に勝り、終端速度 ${terminalVelocityUmS.value.toFixed(1)} μm/s で下降`
})

function flipPolarity() {
  plateVoltageV.value = plateVoltageV.value === 0 ? -700 : -plateVoltageV.value
}

function autoBalanceSelected() {
  plateVoltageV.value = Math.round(balanceVoltageV.value / 10) * 10
}

function resetDefaults() {
  plateVoltageV.value = 700
  selectedChargeN.value = 2
  dropletRadiusUm.value = 0.85
  initDroplets()
  rebuildHistogram()
  updateSim(0)
}

// 油滴データ (0番目が選択油滴)
const droplets = ref([])
let xrayFlash = 0

function initDroplets() {
  const arr = []
  const count = 14
  for (let i = 0; i < count; i++) {
    const isMain = i === 0
    const n = isMain ? selectedChargeN.value : Math.floor(Math.random() * 5) + 1
    const rScale = isMain ? 1.0 : 0.8 + Math.random() * 0.36
    const ang = Math.random() * Math.PI * 2
    const rad = isMain ? 0 : 0.35 + Math.random() * 0.95
    arr.push({
      x: rad * Math.cos(ang),
      y: isMain ? 0.0 : (Math.random() - 0.5) * 2.2,
      z: rad * Math.sin(ang),
      n,
      rScale,
      vy: 0,
      isMain
    })
  }
  droplets.value = arr
}

function ionizeDroplets() {
  xrayFlash = 1.0
  droplets.value.forEach((d) => {
    const delta = Math.random() < 0.5 ? 1 : -1
    const nextN = Math.max(1, Math.min(5, d.n + delta))
    d.n = nextN
    if (d.isMain) {
      selectedChargeN.value = nextN
    }
  })
  rebuildHistogram()
}

// ==========================================================
// カメラ & レスポンシブ
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return w < 540 || aspect < 1.35 ? Math.min(1.76, Math.max(1.18, 1.50 / Math.max(0.66, aspect))) : 1.0
}

function isMobileView() {
  return getMobScale() > 1.02
}

function getCamParams(preset) {
  const ms = getMobScale()
  const cx = 0.05
  if (preset === 'front') {
    return { pos: [cx, 0.05, 44.5 * ms], target: [cx, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 48.0 * ms, 0.25], target: [cx, 0.0, -0.35], fov: 14 }
  }
  return { pos: [cx + 0.35 * ms, 3.6 * ms, 13.2 * ms], target: [cx, 0.05, -0.15], fov: 40 }
}

function setCameraPreset(preset, duration = 0.55) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function stepFrame() {
  isPlaying.value = false
  updateSim(0.05)
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
let sceneObjs = null
let resizeObs = null
let lastIsMob = false
let simTime = 0
const labelCache = {}

const CHAMBER_X = -2.55
const PLATE_HALF_Y = 1.65
const HIST_CENTER = new THREE.Vector3(2.75, 0.05, 0)

function setLabelText(sprite, key, textStr, color, borderColor, baseScale = 0.40) {
  const mult = isMobileView() ? 1.66 : 1.0
  const sig = `${textStr}|${color}|${borderColor}|${mult}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(textStr, color, borderColor)
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

function setArrowColor(arrow, hex) {
  arrow.traverse((ch) => {
    if (ch.material && ch.material.color) {
      ch.material.color.setHex(hex)
      if (ch.material.emissive) ch.material.emissive.setHex(hex)
    }
  })
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
      updateSim(dt)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileView()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        rebuildHistogram()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.25, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D ミリカン観測チャンバー & 真鍮コンデンサー極板
  // ======================================================
  const chamberGroup = new THREE.Group()
  chamberGroup.position.set(CHAMBER_X, 0.0, 0)
  scene.add(chamberGroup)

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd9a441,
    metalness: 0.78,
    roughness: 0.24
  })
  const plateR = 1.72

  // 上極板 (真鍮 + 中央ピンホール + 極性発光リング)
  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(plateR, plateR, 0.14, 36), brassMat)
  topPlate.position.set(0, PLATE_HALF_Y, 0)
  const pinholeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.025, 10, 24).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  )
  pinholeRing.position.set(0, PLATE_HALF_Y + 0.07, 0)
  const topPolMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 })
  const topPolRing = new THREE.Mesh(new THREE.TorusGeometry(plateR + 0.03, 0.045, 10, 36).rotateX(Math.PI / 2), topPolMat)
  topPolRing.position.set(0, PLATE_HALF_Y, 0)
  chamberGroup.add(topPlate, pinholeRing, topPolRing)

  // 下極板 (真鍮 + 極性発光リング)
  const botPlate = new THREE.Mesh(new THREE.CylinderGeometry(plateR, plateR, 0.14, 36), brassMat)
  botPlate.position.set(0, -PLATE_HALF_Y, 0)
  const botPolMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const botPolRing = new THREE.Mesh(new THREE.TorusGeometry(plateR + 0.03, 0.045, 10, 36).rotateX(Math.PI / 2), botPolMat)
  botPolRing.position.set(0, -PLATE_HALF_Y, 0)
  chamberGroup.add(botPlate, botPolRing)

  // 絶縁スペーサー柱 (4本)
  const spacerMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.2 })
  ;[
    [1.35, 0.95],
    [-1.35, 0.95],
    [1.35, -0.95],
    [-1.35, -0.95]
  ].forEach(([sx, sz]) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, PLATE_HALF_Y * 2 - 0.1, 12), spacerMat)
    rod.position.set(sx, 0, sz)
    chamberGroup.add(rod)
  })

  // 透明ガラス観測チャンバー (depthWrite: false, renderOrder: 6)
  const chamberGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(plateR - 0.06, plateR - 0.06, PLATE_HALF_Y * 2 - 0.14, 36, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xa7f3d0,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  chamberGlass.renderOrder = 6
  chamberGroup.add(chamberGlass)

  // 顕微鏡レチクル目盛り線 (奥側 z = -0.5)
  const reticleMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.32 })
  for (let i = -3; i <= 3; i++) {
    const ry = i * 0.38
    const hw = i === 0 ? 0.55 : 0.22
    chamberGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-hw, ry, -0.45), new THREE.Vector3(hw, ry, -0.45)]),
        reticleMat
      )
    )
  }

  // アトマイザー (噴霧器: 上極板の上)
  const atomNozzle = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.42, 18).rotateX(Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.65, roughness: 0.3 })
  )
  atomNozzle.position.set(0, PLATE_HALF_Y + 0.42, 0)
  const atomBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
  )
  atomBulb.position.set(-0.48, PLATE_HALF_Y + 0.58, 0)
  chamberGroup.add(atomNozzle, atomBulb)

  // 対物顕微鏡鏡筒 (左横)
  const scopeBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 0.85, 20).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.28 })
  )
  scopeBarrel.position.set(-plateR - 0.52, 0, 0.15)
  const scopeLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.06, 20).rotateZ(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.7 })
  )
  scopeLens.position.set(-plateR - 0.10, 0, 0.15)
  chamberGroup.add(scopeBarrel, scopeLens)

  // 一様電場ガイド矢印 (左右に2本)
  const eFieldArrows = []
  ;[-1.08, 1.08].forEach((ex) => {
    const arr = createVectorArrow3D({ color: 0x64748b, shaftRadius: 0.022, headRadius: 0.07, headLength: 0.18, opacity: 0.48 })
    chamberGroup.add(arr)
    eFieldArrows.push({ arr, x: ex })
  })

  // X線照射フラッシュビーム (右側から照射)
  const xrayBeamMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0,
    depthWrite: false
  })
  const xrayBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.55, 3.2, 20, 1, true).rotateZ(Math.PI / 2),
    xrayBeamMat
  )
  xrayBeam.position.set(0.3, 0, 0)
  xrayBeam.renderOrder = 5
  chamberGroup.add(xrayBeam)

  // 油滴メッシュ群 (選択油滴 + 霧状油滴)
  const dropMeshes = []
  const mainMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.85,
    roughness: 0.15
  })
  const mistMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0x34d399,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.8
  })
  const mainHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.02, 10, 28),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.7 })
  )
  mainHalo.renderOrder = 4
  chamberGroup.add(mainHalo)

  for (let i = 0; i < 14; i++) {
    const isMain = i === 0
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(isMain ? 0.14 : 0.065, isMain ? 22 : 12, isMain ? 22 : 12),
      isMain ? mainMat : mistMat
    )
    m.renderOrder = 3
    chamberGroup.add(m)
    dropMeshes.push(m)
  }

  // 選択油滴の 3D カベクトル矢印 (qE, mg, Stokes drag)
  const arrowQE = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.036, headRadius: 0.11, headLength: 0.25 })
  const arrowMG = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.036, headRadius: 0.11, headLength: 0.25 })
  const arrowDrag = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.032, headRadius: 0.10, headLength: 0.22 })
  chamberGroup.add(arrowQE, arrowMG, arrowDrag)

  // 左側テキストラベル (X/Z分離で正面・上面・モバイル非重複)
  const lblTopPlate = createTextSprite('上極板 (+)', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 30, scale: 0.38 })
  lblTopPlate.position.set(1.25, PLATE_HALF_Y + 0.36, -0.85)

  const lblBotPlate = createTextSprite('下極板 (−)', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.38 })
  lblBotPlate.position.set(1.25, -PLATE_HALF_Y - 0.36, 0.85)

  const lblQE = createTextSprite('qE', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 28, scale: 0.34 })
  const lblMG = createTextSprite('mg', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 28, scale: 0.34 })
  const lblDrag = createTextSprite('6πηrv', { color: '#e9d5ff', borderColor: '#a855f7', fontSize: 26, scale: 0.32 })
  const lblDropCharge = createTextSprite('-2e', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 28, scale: 0.35 })

  chamberGroup.add(lblTopPlate, lblBotPlate, lblQE, lblMG, lblDrag, lblDropCharge)

  // ======================================================
  // 2. 右側: 3D 電荷量子化ヒストグラム (q/e) & 階段インジケータ (上面対策のため後傾イーゼル化)
  // ======================================================
  const histGroup = new THREE.Group()
  histGroup.position.copy(HIST_CENTER)
  histGroup.rotation.x = -0.56
  scene.add(histGroup)

  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(4.75, 4.25),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.86, side: THREE.DoubleSide })
  )
  boardBack.position.set(0, 0.08, -0.06)
  histGroup.add(boardBack)

  const boardFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.375, -2.04, -0.04),
      new THREE.Vector3(2.375, -2.04, -0.04),
      new THREE.Vector3(2.375, 2.20, -0.04),
      new THREE.Vector3(-2.375, 2.20, -0.04)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  histGroup.add(boardFrame)

  const histDynamic = new THREE.Group()
  histGroup.add(histDynamic)

  const lblHistTitle = createTextSprite('電荷量子化 q = n·e', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 30, scale: 0.39 })
  lblHistTitle.position.set(0, 1.90, 0.10)

  const lblHistSub = createTextSprite('離散ステップ q/e = 1, 2, 3, 4, 5', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 26, scale: 0.34 })
  lblHistSub.position.set(0, -1.78, 0.10)

  histGroup.add(lblHistTitle, lblHistSub)

  sceneObjs = {
    topPolMat,
    botPolMat,
    eFieldArrows,
    xrayBeamMat,
    dropMeshes,
    mainHalo,
    arrowQE,
    arrowMG,
    arrowDrag,
    lblTopPlate,
    lblBotPlate,
    lblQE,
    lblMG,
    lblDrag,
    lblDropCharge,
    histDynamic,
    lblHistTitle,
    lblHistSub
  }

  rebuildHistogram()
  updateSim(0)
}

function rebuildHistogram() {
  if (!sceneObjs) return
  const { histDynamic, lblHistTitle, lblHistSub } = sceneObjs
  clearGroup(histDynamic)

  const mob = isMobileView()
  const counts = [0, 0, 0, 0, 0]
  droplets.value.forEach((d) => {
    counts[Math.max(0, Math.min(4, d.n - 1))]++
  })

  // ヒストグラム軸 (上部 y = -0.35 .. +1.35)
  const baseLineY = -0.35
  const axX = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.02, headRadius: 0.065, headLength: 0.16 })
  axX.setVector(new THREE.Vector3(-1.95, baseLineY, 0.02), new THREE.Vector3(1, 0, 0), 4.0)
  const axY = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.02, headRadius: 0.065, headLength: 0.16 })
  axY.setVector(new THREE.Vector3(-1.85, baseLineY, 0.02), new THREE.Vector3(0, 1, 0), 1.82)
  histDynamic.add(axX, axY)

  // 棒グラフ + 量子化ステップ階段 (下部 y = -1.35 .. -0.68)
  const stepBaseY = -1.38
  for (let n = 1; n <= 5; n++) {
    const bx = -1.35 + (n - 1) * 0.72
    const cnt = counts[n - 1]
    const barH = Math.max(0.08, Math.min(1.45, cnt * 0.24 + 0.06))
    const isSel = selectedChargeN.value === n
    const barColor = isSel ? 0xfbbf24 : 0x38bdf8

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, barH, 0.24),
      new THREE.MeshStandardMaterial({
        color: barColor,
        emissive: barColor,
        emissiveIntensity: isSel ? 0.65 : 0.28,
        roughness: 0.25
      })
    )
    bar.position.set(bx, baseLineY + barH / 2, 0.12)
    histDynamic.add(bar)

    // n e ラベル (ボード傾斜に沿って z=0.14 に配置し上面・正面とも非重複)
    const nLbl = createTextSprite(`${n}e`, {
      color: isSel ? '#fde68a' : '#cbd5e1',
      borderColor: isSel ? '#fbbf24' : 'rgba(148,163,184,0.45)',
      fontSize: 26,
      scale: mob ? 0.44 : 0.30
    })
    nLbl.position.set(bx, baseLineY - 0.22, 0.14)
    histDynamic.add(nLbl)

    // 量子化階段バー (q = n * e)
    const stepH = n * 0.14
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, stepH, 0.18),
      new THREE.MeshStandardMaterial({
        color: isSel ? 0xfbbf24 : 0x475569,
        emissive: isSel ? 0xf59e0b : 0x1e293b,
        emissiveIntensity: isSel ? 0.7 : 0.15
      })
    )
    stepMesh.position.set(bx, stepBaseY + stepH / 2, 0.1)
    histDynamic.add(stepMesh)
  }

  setLabelText(lblHistTitle, 'hTitle', mob ? '電荷分布 q=ne' : '電荷の量子化ヒストグラム (q = n·e)', '#fde68a', '#fbbf24', 0.38)
  setLabelText(lblHistSub, 'hSub', mob ? `選択 q=${selectedChargeN.value}e` : `離散ステップ q/e = ${selectedChargeN.value} (e の整数倍)`, '#7dd3fc', '#38bdf8', 0.33)
}

function updateSim(dt) {
  if (!sceneObjs) return
  const {
    topPolMat,
    botPolMat,
    eFieldArrows,
    xrayBeamMat,
    dropMeshes,
    mainHalo,
    arrowQE,
    arrowMG,
    arrowDrag,
    lblTopPlate,
    lblBotPlate,
    lblQE,
    lblMG,
    lblDrag,
    lblDropCharge
  } = sceneObjs

  const mob = isMobileView()
  const effDt = isPlaying.value ? dt * timeScale.value : 0
  if (effDt > 0) simTime += effDt

  const V = plateVoltageV.value
  const E_field = V / plateDistanceM

  // 極板の +/- 極性カラー (正: 珊瑚 #fb7185 / 負: 青 #38bdf8 / 0V: 灰)
  if (V > 5) {
    topPolMat.color.setHex(0xfb7185)
    botPolMat.color.setHex(0x38bdf8)
  } else if (V < -5) {
    topPolMat.color.setHex(0x38bdf8)
    botPolMat.color.setHex(0xfb7185)
  } else {
    topPolMat.color.setHex(0x64748b)
    botPolMat.color.setHex(0x64748b)
  }

  // 一様電場ガイド矢印 (V > 0 で下向き、V < 0 で上向き)
  eFieldArrows.forEach(({ arr, x }) => {
    if (Math.abs(V) < 20) {
      arr.visible = false
    } else {
      arr.visible = true
      const down = V > 0
      setArrowColor(arr, down ? 0xfb7185 : 0x38bdf8)
      arr.setVector(new THREE.Vector3(x, down ? 0.55 : -0.55, -0.35), new THREE.Vector3(0, down ? -1 : 1, 0), 1.1)
    }
  })

  // X線フラッシュ減衰
  if (dt > 0 && xrayFlash > 0) {
    xrayFlash = Math.max(0, xrayFlash - dt * 2.4)
  }
  xrayBeamMat.opacity = xrayFlash * 0.55

  // 油滴の物理更新
  const yLimit = PLATE_HALF_Y - 0.25
  const velScale = 3600 // m/s -> 3D units/s の視認スケーリング

  droplets.value.forEach((d, idx) => {
    if (d.isMain) {
      d.n = selectedChargeN.value
      d.rScale = 1.0
    }
    const rM = dropletRadiusUm.value * d.rScale * 1e-6
    const m = (4 / 3) * Math.PI * (rM ** 3) * rhoOil
    const q = d.n * eConst
    const Fg = m * gConst
    const Fe = q * E_field
    const netF = Fe - Fg
    const vTerm = netF / (6 * Math.PI * etaAir * rM) // m/s (+上向き)

    const targetVy = Math.max(-1.8, Math.min(1.8, vTerm * velScale))
    d.vy = targetVy

    if (effDt > 0) {
      const brownianY = d.isMain ? 0 : (Math.random() - 0.5) * 0.08 * effDt
      d.y += d.vy * effDt + brownianY
      if (!d.isMain) {
        d.x += (Math.random() - 0.5) * 0.12 * effDt
        d.z += (Math.random() - 0.5) * 0.12 * effDt
        const rr = Math.hypot(d.x, d.z)
        if (rr > 1.25) {
          d.x *= 1.25 / rr
          d.z *= 1.25 / rr
        }
      }
      if (d.y > yLimit) d.y = -yLimit + 0.08
      if (d.y < -yLimit) d.y = yLimit - 0.08
    }

    const mesh = dropMeshes[idx]
    if (mesh) {
      mesh.position.set(d.x, d.y, d.z)
      if (d.isMain) {
        const s = 0.72 + (dropletRadiusUm.value / 0.85) * 0.32
        mesh.scale.set(s, s, s)
        mainHalo.position.set(d.x, d.y, d.z)
        mainHalo.scale.set(s, s, s)
      }
    }
  })

  // 選択油滴のリアルタイム 3D カベクトル (qE, mg, Stokes drag)
  const mainDrop = droplets.value[0]
  if (mainDrop) {
    const { mg, qE, drag } = selectedForces.value
    const refF = Math.max(1e-14, mg)
    const unitLen = 0.62 // mg 基準矢印長さ

    const dropY = mainDrop.y
    const dropZ = mainDrop.z
    const maxUp = Math.max(0.24, (PLATE_HALF_Y - 0.24) - (dropY + 0.10))
    const maxDown = Math.max(0.24, (dropY - 0.10) - (-PLATE_HALF_Y + 0.24))

    const lenMG = Math.min(maxDown, Math.min(0.92, Math.max(0.30, (mg / refF) * unitLen)))
    const rawLenQE = (Math.abs(qE) / refF) * unitLen
    const rawLenDrag = (Math.abs(drag) / refF) * unitLen

    // mg (常に下向き, 右オフセット x = +0.22)
    const mgOrigin = new THREE.Vector3(0.22, dropY - 0.10, dropZ)
    arrowMG.setVector(mgOrigin, new THREE.Vector3(0, -1, 0), lenMG)
    lblMG.position.set(0.68, Math.max(-1.26, dropY - 0.15 - lenMG * 0.58), dropZ + 0.22)

    // qE (V>0 上向き / V<0 下向き, 左オフセット x = -0.22)
    if (rawLenQE > 0.06) {
      const qUp = qE > 0
      const lenQE = Math.min(qUp ? maxUp : maxDown, Math.min(1.05, rawLenQE))
      const qeColor = isSelectedBalanced.value ? 0x10b981 : 0xf43f5e
      setArrowColor(arrowQE, qeColor)
      const qeOrigin = new THREE.Vector3(-0.22, dropY + (qUp ? 0.10 : -0.10), dropZ)
      arrowQE.setVector(qeOrigin, new THREE.Vector3(0, qUp ? 1 : -1, 0), lenQE)
      lblQE.visible = true
      setLabelText(lblQE, 'lqe', isSelectedBalanced.value ? 'qE=mg' : 'qE', isSelectedBalanced.value ? '#6ee7b7' : '#fda4af', isSelectedBalanced.value ? '#10b981' : '#f43f5e', 0.32)
      const qeLabelY = qUp
        ? Math.min(1.26, dropY + 0.14 + lenQE * 0.56)
        : Math.max(-1.26, dropY - 0.14 - lenQE * 0.56)
      lblQE.position.set(-0.68, qeLabelY, dropZ - 0.22)
    } else {
      arrowQE.visible = false
      lblQE.visible = false
    }

    // Stokes drag 6πηrv (つり合い時は 0 で非表示、他ベクトルと水平分離)
    if (!isSelectedBalanced.value && rawLenDrag > 0.08) {
      const dragUp = drag > 0
      const lenDrag = Math.min(dragUp ? maxUp : maxDown, Math.min(0.90, rawLenDrag))
      const dragOrigin = new THREE.Vector3(0.0, dropY + (dragUp ? 0.10 : -0.10), dropZ + 0.26)
      arrowDrag.setVector(dragOrigin, new THREE.Vector3(0, dragUp ? 1 : -1, 0), lenDrag)
      lblDrag.visible = true
      if (dragUp) {
        // 下降中: 上向き抵抗は右上象限へ
        lblDrag.position.set(0.68, Math.min(1.26, dropY + 0.14 + lenDrag * 0.58), dropZ + 0.45)
      } else {
        // 上昇中: 下向き抵抗は左下象限へ (右下の mg と完全水平分離)
        lblDrag.position.set(-0.74, Math.max(-1.26, dropY - 0.14 - lenDrag * 0.58), dropZ + 0.45)
      }
    } else {
      arrowDrag.visible = false
      lblDrag.visible = false
    }

    setLabelText(lblDropCharge, 'ldc', `−${selectedChargeN.value}e`, '#fde68a', '#fbbf24', 0.32)
    if (qE > 0) {
      // 上昇またはつり合い時は右上へ
      lblDropCharge.position.set(0.66, Math.min(1.22, dropY + 0.28), dropZ + 0.52)
    } else {
      // 下降時は左上へ
      lblDropCharge.position.set(-0.66, Math.min(1.22, dropY + 0.28), dropZ + 0.52)
    }
  }

  // 極板ラベル
  if (V > 5) {
    setLabelText(lblTopPlate, 'tp', mob ? '上 (+)' : `上極板 (+${V}V)`, '#fda4af', '#f43f5e', 0.36)
    setLabelText(lblBotPlate, 'bp', mob ? '下 (−)' : '下極板 (0V −)', '#7dd3fc', '#38bdf8', 0.36)
  } else if (V < -5) {
    setLabelText(lblTopPlate, 'tp', mob ? '上 (−)' : `上極板 (${V}V −)`, '#7dd3fc', '#38bdf8', 0.36)
    setLabelText(lblBotPlate, 'bp', mob ? '下 (+)' : '下極板 (+)', '#fda4af', '#f43f5e', 0.36)
  } else {
    setLabelText(lblTopPlate, 'tp', '上極板 (0V)', '#cbd5e1', '#64748b', 0.36)
    setLabelText(lblBotPlate, 'bp', '下極板 (0V)', '#cbd5e1', '#64748b', 0.36)
  }
}

watch(selectedChargeN, (val) => {
  if (droplets.value[0]) {
    droplets.value[0].n = val
  }
  rebuildHistogram()
  updateSim(0)
})

watch([plateVoltageV, dropletRadiusUm], () => {
  updateSim(0)
})

onMounted(() => {
  initDroplets()
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

.badge-amber {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.35);
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
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

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px;
  border-radius: 10px;
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
  flex-wrap: wrap;
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
  line-height: 1.35;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.legend-item .dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
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

.three-status-badge.balanced {
  background: rgba(251, 191, 36, 0.18);
  border: 1px solid rgba(251, 191, 36, 0.55);
  color: #fde68a;
}

.three-status-badge.reversed {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.45);
  color: #fda4af;
}

.three-status-badge.moving {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
}

.control-panel {
  margin-top: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.control-group strong {
  color: #38bdf8;
  font-family: monospace;
}

.control-label {
  font-size: 0.82rem;
  color: #cbd5e1;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}

.sub-info {
  font-size: 0.74rem;
  color: #94a3b8;
}

.mini-chip {
  padding: 3px 9px;
  font-size: 0.73rem;
  font-weight: 600;
  border-radius: 6px;
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #475569;
  cursor: pointer;
}

.mini-chip:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

.btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.select-btn {
  padding: 5px 10px;
  font-size: 0.76rem;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 6px;
  color: #cbd5e1;
  cursor: pointer;
}

.select-btn.active {
  background: rgba(251, 191, 36, 0.22);
  border-color: #fbbf24;
  color: #fde68a;
  font-weight: bold;
}

.highlight-btn {
  background: rgba(168, 85, 247, 0.3) !important;
  border-color: #c084fc !important;
  color: #f3e8ff !important;
  font-weight: bold;
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
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #475569;
  background: #334155;
  color: #f8fafc;
  font-weight: 600;
}

.btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.06rem;
  font-weight: bold;
  font-family: monospace;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #fbbf24;
}

.stat-card .value.text-emerald {
  color: #34d399;
}

.stat-card .value.text-cyan {
  color: #38bdf8;
}

.stat-card .unit {
  font-size: 0.78rem;
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
    border-radius: 10px;
    padding: 5px 8px;
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
