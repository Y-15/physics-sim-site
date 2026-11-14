<template>
  <div class="sim-container" :style="{ '--ac': lightColor }">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">💡</span>
        <h3 class="sim-title">3D 光電効果・光量子仮説シミュレーター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan"><i>h</i>ν = <i>W</i> + <i>K</i><sub>max</sub></span>
      </div>
    </div>

    <p class="desc">
      光の波長 λ（振動数 ν）、光の強さ（光子数）、印加電圧 <i>V</i>、金属の種類（仕事関数 <i>W</i>）を変え、
      3D真空光電管内の波束光子・光電子の放物運動と <i>I</i>-<i>V</i> / <i>V</i><sub>0</sub>-ν グラフを同時に検証できます。
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
      <button class="btn btn-secondary" @click="resetSim">⏮ リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" :style="{ background: lightColor, boxShadow: '0 0 6px ' + lightColor }"></i>
            入射光子 <i>h</i>ν ({{ wavelength }}nm)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            光電子 e<sup>−</sup>
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            動作点 / 陽極 A
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
            阻止電圧 −<i>V</i><sub>0</sub>
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

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="controls-grid">
        <!-- 金属の種類 -->
        <div class="control-group">
          <label><span>金属の種類 (仕事関数 <i>W</i>):</span></label>
          <select v-model="selectedMetal" class="metal-select">
            <option v-for="(m, idx) in metals" :key="idx" :value="idx">
              {{ m.name }} (W = {{ m.W.toFixed(2) }} eV)
            </option>
          </select>
          <span class="sub-info">限界波長 λ<sub>0</sub> = {{ fmt(lambda0, 0) }} nm</span>
        </div>

        <!-- 波長 λ -->
        <div class="control-group">
          <label>
            <span>光の波長 λ:</span>
            <span class="val-inline">
              <strong>{{ wavelength }} nm</strong>
              <span class="color-chip" :style="{ backgroundColor: lightColor }"></span>
            </span>
          </label>
          <input type="range" v-model.number="wavelength" min="200" max="750" step="5" />
          <div class="quick-chips">
            <button class="mini-chip" @click="wavelength = 250">UV 250nm</button>
            <button class="mini-chip" @click="wavelength = 380">紫 380nm</button>
            <button class="mini-chip" @click="wavelength = 520">緑 520nm</button>
            <button class="mini-chip" @click="wavelength = 660">赤 660nm</button>
          </div>
          <span class="sub-info">振動数 ν = {{ fmt(freq * 1e-14, 2) }} × 10<sup>14</sup> Hz</span>
        </div>

        <!-- 光の強さ -->
        <div class="control-group">
          <label><span>光の強さ (光子数/秒):</span> <strong>{{ intensity }} %</strong></label>
          <input type="range" v-model.number="intensity" min="10" max="100" step="5" />
          <span class="sub-info">飽和電流 <i>I</i><sub>s</sub> = {{ fmt(intensity * 1.5, 0) }} μA</span>
        </div>

        <!-- 電圧 V -->
        <div class="control-group">
          <label><span>印加電圧 <i>V</i>:</span> <strong>{{ voltage >= 0 ? '+' : '' }}{{ fmt(voltage, 2) }} V</strong></label>
          <input type="range" v-model.number="voltage" min="-4.0" max="4.0" step="0.05" />
          <div class="quick-chips">
            <button class="mini-chip" :disabled="KmaxEV <= 0" @click="voltage = -Math.min(4, Number(V0.toFixed(2)))">−<i>V</i><sub>0</sub> (阻止)</button>
            <button class="mini-chip" @click="voltage = 0">0 V</button>
            <button class="mini-chip" @click="voltage = 2.0">+2.0 V (加速)</button>
          </div>
          <span class="sub-info">負電圧: 減速・Uターン / 正電圧: 加速</span>
        </div>
      </div>
    </div>

    <!-- グラフ表示切替タブ -->
    <div class="graph-toggle-row">
      <span class="graph-label">右側3Dグラフ表示：</span>
      <div class="toggle-buttons">
        <button :class="{ active: graphMode === 'IV' }" @click="graphMode = 'IV'">
          ① <i>I</i>-<i>V</i> 特性曲線（光電流 vs 電圧）
        </button>
        <button :class="{ active: graphMode === 'V0Nu' }" @click="graphMode = 'V0Nu'">
          ② <i>V</i><sub>0</sub> / <i>K</i><sub>max</sub> vs 振動数 ν（傾き <span class="frac"><span class="num"><i>h</i></span><span class="den"><i>e</i></span></span>）
        </button>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <div class="stat-card">
        <span class="label">光子のエネルギー <i>h</i>ν</span>
        <span class="val highlight">{{ fmt(photonEnergyEV, 2) }} eV</span>
      </div>
      <div class="stat-card">
        <span class="label">仕事関数 <i>W</i></span>
        <span class="val">{{ fmt(currentMetal.W, 2) }} eV</span>
      </div>
      <div class="stat-card">
        <span class="label">最大運動エネルギー <i>K</i><sub>max</sub></span>
        <span class="val" :class="{ 'zero-k': KmaxEV <= 0 }">
          {{ KmaxEV > 0 ? fmt(KmaxEV, 2) + ' eV' : '0 eV (放出なし)' }}
        </span>
      </div>
      <div class="stat-card">
        <span class="label">阻止電圧 <i>V</i><sub>0</sub></span>
        <span class="val highlight-alt">
          {{ KmaxEV > 0 ? fmt(V0, 2) + ' V' : '—' }}
        </span>
      </div>
      <div class="stat-card">
        <span class="label">限界波長 λ<sub>0</sub> = <span class="frac"><span class="num"><i>hc</i></span><span class="den"><i>W</i></span></span></span>
        <span class="val">{{ fmt(lambda0, 0) }} nm</span>
      </div>
      <div class="stat-card">
        <span class="label">光電流 <i>I</i> (検出値)</span>
        <span class="val" :class="photocurrent > 0 ? 'current-flow' : 'current-zero'">
          {{ fmt(photocurrent, 1) }} μA
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'
import { fmt } from './simUtils'

const threeContainer = ref(null)
let threeCtx = null

const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')
const graphMode = ref('IV')

// 物理定数
const c = 2.9979e8 // m/s
const hc_eV_nm = 1239.84 // eV * nm

const metals = [
  { name: 'セシウム (Cs)', W: 2.14, color: 0xd4c4a8 },
  { name: 'カリウム (K)', W: 2.30, color: 0xcbd5e1 },
  { name: 'ナトリウム (Na)', W: 2.75, color: 0xd8dee9 },
  { name: '亜鉛 (Zn)', W: 4.31, color: 0x94a3b8 },
  { name: '白金 (Pt)', W: 5.65, color: 0xe2e8f0 }
]
const selectedMetal = ref(0)
const currentMetal = computed(() => metals[selectedMetal.value])

// コントロール
const wavelength = ref(380) // nm (200..750)
const intensity = ref(60) // %
const voltage = ref(0.0) // V (-4..4)

// 物理量計算
const freq = computed(() => c / (wavelength.value * 1e-9))
const photonEnergyEV = computed(() => hc_eV_nm / wavelength.value)
const KmaxEV = computed(() => Math.max(0, photonEnergyEV.value - currentMetal.value.W))
const V0 = computed(() => KmaxEV.value)
const lambda0 = computed(() => hc_eV_nm / currentMetal.value.W)

const photocurrent = computed(() => {
  if (KmaxEV.value <= 0) return 0
  const V = voltage.value
  const vStop = -V0.value
  if (V <= vStop) return 0
  const Isat = intensity.value * 1.5
  if (V >= 1.0) return Isat
  const t = (V - vStop) / (1.0 - vStop)
  return Isat * Math.min(1, Math.max(0, Math.pow(t, 1.5)))
})

const statusClass = computed(() => {
  if (KmaxEV.value <= 0) return 'blocked'
  if (photocurrent.value <= 0) return 'stopped'
  return 'active'
})

const statusText = computed(() => {
  if (KmaxEV.value <= 0) {
    return `⛔ 電子放出なし: λ=${wavelength.value}nm > 限界波長 λ₀=${lambda0.value.toFixed(0)}nm (hν < W)`
  }
  if (photocurrent.value <= 0) {
    return `🛑 阻止電圧到達 (V ≤ −V₀ = −${V0.value.toFixed(2)}V): すべての光電子が陰極へ押し戻されます`
  }
  return `⚡ 光電子放出中: K_max=${KmaxEV.value.toFixed(2)}eV | 光電流 I=${photocurrent.value.toFixed(1)}μA`
})

// 波長 -> 厳密なスペクトル色 (UV #a855f7 -> 可視光レインボー -> 赤)
function wavelengthToRGB(nm) {
  let r = 0
  let g = 0
  let b = 0
  if (nm < 380) {
    // 紫外線 (200-380nm): vivid violet #a855f7 ベース
    const t = Math.max(0, Math.min(1, (nm - 200) / 180))
    const R = Math.round(168 - t * 18)
    const G = Math.round(85 - t * 35)
    const B = Math.round(247)
    return {
      r: R,
      g: G,
      b: B,
      css: `rgb(${R}, ${G}, ${B})`,
      hex: (R << 16) | (G << 8) | B
    }
  } else if (nm < 440) {
    r = -(nm - 440) / (440 - 380)
    g = 0
    b = 1
  } else if (nm < 490) {
    r = 0
    g = (nm - 440) / (490 - 440)
    b = 1
  } else if (nm < 510) {
    r = 0
    g = 1
    b = -(nm - 510) / (510 - 490)
  } else if (nm < 580) {
    r = (nm - 510) / (580 - 510)
    g = 1
    b = 0
  } else if (nm < 645) {
    r = 1
    g = -(nm - 645) / (645 - 580)
    b = 0
  } else {
    r = 1
    g = 0
    b = 0
  }

  let factor = 1.0
  if (nm > 700) {
    factor = 0.62 + 0.38 * ((750 - nm) / 50)
  }
  const R = Math.round(255 * Math.pow(r * factor, 0.85))
  const G = Math.round(255 * Math.pow(g * factor, 0.85))
  const B = Math.round(255 * Math.pow(b * factor, 0.85))
  return {
    r: R,
    g: G,
    b: B,
    css: `rgb(${R}, ${G}, ${B})`,
    hex: (R << 16) | (G << 8) | B
  }
}

const spectral = computed(() => wavelengthToRGB(wavelength.value))
const lightColor = computed(() => spectral.value.css)

// ==========================================================
// カメラ & レスポンシブ制御
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
  const cx = -0.05
  if (preset === 'front') {
    return { pos: [cx, 0.05, 44.5 * ms], target: [cx, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 48.0 * ms, 0.25], target: [cx, 0.0, -0.35], fov: 14 }
  }
  return { pos: [cx + 0.25 * ms, 3.9 * ms, 13.4 * ms], target: [cx, 0.05, -0.15], fov: 40 }
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

function resetSim() {
  simTime = 0
  spawnTimer = 0
  if (sceneObjs) {
    sceneObjs.photonPool.forEach((p) => {
      p.active = false
      p.group.visible = false
    })
    sceneObjs.electronPool.forEach((el) => {
      el.active = false
      el.mesh.visible = false
      el.trail.visible = false
    })
  }
  updateSim(0.02)
}

// ==========================================================
// Three.js シーン構築・破棄
// ==========================================================
let sceneObjs = null
let resizeObs = null
let lastIsMob = false
let simTime = 0
let spawnTimer = 0
let cathodeFlash = 0
const labelCache = {}

const CATHODE_X = -3.72
const ANODE_X = -1.04
const TUBE_SPAN = ANODE_X - CATHODE_X // 2.68
const TUBE_CENTER_X = -2.38
const TUBE_Y = 0.25
const LAMP_POS = new THREE.Vector3(-5.25, 1.85, 0)
const GRAPH_CENTER = new THREE.Vector3(2.65, 0.15, 0)

function setLabelText(sprite, key, textStr, color, borderColor, baseScale = 0.42) {
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
        rebuildGraph()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // 床グリッド & 実験台
  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.32, 0)
  scene.add(floorGrid)

  const benchMesh = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.16, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.35 })
  )
  benchMesh.position.set(-2.65, -2.24, 0)
  scene.add(benchMesh)

  // ======================================================
  // 1. 左側: 3D 光源 + 真空光電管 + 外部回路
  // ======================================================
  const appGroup = new THREE.Group()
  scene.add(appGroup)

  // 光源ハウジング (LAMP_POS -> CATHODE_X)
  const targetCathode = new THREE.Vector3(CATHODE_X + 0.05, TUBE_Y, 0)
  const beamDir = targetCathode.clone().sub(LAMP_POS)
  const beamDist = beamDir.length()
  const beamUnit = beamDir.clone().normalize()

  const lampHousing = new THREE.Group()
  lampHousing.position.copy(LAMP_POS)
  lampHousing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamUnit)
  const lampBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.72, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.25 })
  )
  const lampLensMat = new THREE.MeshBasicMaterial({ color: spectral.value.hex })
  const lampLens = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24), lampLensMat)
  lampLens.position.set(0, 0.36, 0)
  const lampRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.035, 10, 24).rotateX(Math.PI / 2),
    lampLensMat
  )
  lampRing.position.set(0, 0.37, 0)
  lampHousing.add(lampBody, lampLens, lampRing)
  appGroup.add(lampHousing)

  // 光源スタンド
  const standHeight = LAMP_POS.y - (-2.16)
  const lampStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, standHeight, 12),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
  )
  lampStand.position.set(LAMP_POS.x, -2.16 + standHeight / 2, 0)
  appGroup.add(lampStand)

  // 光線コーン (半透明, depthWrite: false)
  const beamConeGeo = new THREE.CylinderGeometry(0.24, 0.52, beamDist - 0.35, 24, 1, true)
  const beamConeMat = new THREE.MeshBasicMaterial({
    color: spectral.value.hex,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const beamCone = new THREE.Mesh(beamConeGeo, beamConeMat)
  beamCone.position.copy(LAMP_POS).addScaledVector(beamUnit, 0.35 + (beamDist - 0.35) / 2)
  beamCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamUnit)
  beamCone.renderOrder = 4
  appGroup.add(beamCone)

  // 真空光電管ガラス管 (depthWrite: false, renderOrder: 6)
  const tubeRadius = 0.98
  const tubeLen = 3.55
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.17,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const tubeGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeLen, 36, 1, true).rotateZ(Math.PI / 2),
    glassMat
  )
  tubeGlass.position.set(TUBE_CENTER_X, TUBE_Y, 0)
  tubeGlass.renderOrder = 6
  appGroup.add(tubeGlass)

  // ガラス管両端半球キャップ (depthWrite: false)
  const capGeoL = new THREE.SphereGeometry(tubeRadius, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(Math.PI / 2)
  const capL = new THREE.Mesh(capGeoL, glassMat)
  capL.position.set(TUBE_CENTER_X - tubeLen / 2, TUBE_Y, 0)
  capL.renderOrder = 6
  const capGeoR = new THREE.SphereGeometry(tubeRadius, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(-Math.PI / 2)
  const capR = new THREE.Mesh(capGeoR, glassMat)
  capR.position.set(TUBE_CENTER_X + tubeLen / 2, TUBE_Y, 0)
  capR.renderOrder = 6
  appGroup.add(capL, capR)

  // ガラス管光沢ハイライト & メタルフランジ
  const glossStrip = new THREE.Mesh(
    new THREE.CylinderGeometry(tubeRadius + 0.008, tubeRadius + 0.008, tubeLen, 16, 1, true, 0.35, 0.32).rotateZ(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf0f9ff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
  )
  glossStrip.position.set(TUBE_CENTER_X, TUBE_Y, 0)
  glossStrip.renderOrder = 6
  appGroup.add(glossStrip)

  const flangeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.24 })
  const flangeL = new THREE.Mesh(new THREE.TorusGeometry(tubeRadius, 0.042, 12, 36).rotateY(Math.PI / 2), flangeMat)
  flangeL.position.set(TUBE_CENTER_X - tubeLen / 2, TUBE_Y, 0)
  const flangeR = new THREE.Mesh(new THREE.TorusGeometry(tubeRadius, 0.042, 12, 36).rotateY(Math.PI / 2), flangeMat)
  flangeR.position.set(TUBE_CENTER_X + tubeLen / 2, TUBE_Y, 0)
  appGroup.add(flangeL, flangeR)

  // 陰極板 K (金属板)
  const cathodeMat = new THREE.MeshStandardMaterial({
    color: currentMetal.value.color,
    metalness: 0.82,
    roughness: 0.22,
    emissive: 0x000000,
    emissiveIntensity: 0
  })
  const cathodePlate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.25, 1.05), cathodeMat)
  cathodePlate.position.set(CATHODE_X - 0.06, TUBE_Y, 0)
  cathodePlate.renderOrder = 2
  appGroup.add(cathodePlate)

  const cathodeGlowMat = new THREE.MeshBasicMaterial({
    color: spectral.value.hex,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  })
  const cathodeGlow = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.44, 24).rotateY(Math.PI / 2), cathodeGlowMat)
  cathodeGlow.position.set(CATHODE_X + 0.02, TUBE_Y, 0)
  appGroup.add(cathodeGlow)

  // 陽極板 A (コレクター)
  const anodeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.72,
    roughness: 0.25,
    emissive: 0xd97706,
    emissiveIntensity: 0.25
  })
  const anodePlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 1.05), anodeMat)
  anodePlate.position.set(ANODE_X + 0.06, TUBE_Y, 0)
  anodePlate.renderOrder = 2
  appGroup.add(anodePlate)

  const anodeRimMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.7 })
  const anodeRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 1.30, 1.10),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  const anodeHalo = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.026, 10, 28).rotateY(Math.PI / 2), anodeRimMat)
  anodeHalo.position.set(ANODE_X + 0.06, TUBE_Y, 0)
  appGroup.add(anodeRim, anodeHalo)

  // 管内電場力ベクトル矢印 (電子が受ける静電気力の向き)
  const tubeForceArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.032, headRadius: 0.10, headLength: 0.24 })
  appGroup.add(tubeForceArrow)

  // 外部回路ワイヤー & 電流計 & 可変電源 (y = -1.50)
  const wireY = -1.52
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.65, roughness: 0.35 })
  const wirePts = [
    new THREE.Vector3(CATHODE_X - 0.06, TUBE_Y - 0.62, 0),
    new THREE.Vector3(CATHODE_X - 0.06, wireY, 0),
    new THREE.Vector3(ANODE_X + 0.06, wireY, 0),
    new THREE.Vector3(ANODE_X + 0.06, TUBE_Y - 0.62, 0)
  ]
  const wireCurve = new THREE.CatmullRomCurve3(wirePts, false, 'catmullrom', 0.04)
  appGroup.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 36, 0.032, 8, false), wireMat))

  // 電流計 μA (左縦ワイヤー中腹)
  const ammeterGroup = new THREE.Group()
  ammeterGroup.position.set(CATHODE_X - 0.06, -0.82, 0.06)
  const amBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.14, 24).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
  )
  const amRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.025, 10, 28),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  amRim.position.z = 0.06
  const amNeedle = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.18, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x34d399 })
  )
  amNeedle.geometry.translate(0, 0.08, 0)
  amNeedle.position.set(0, -0.06, 0.085)
  ammeterGroup.add(amBody, amRim, amNeedle)
  appGroup.add(ammeterGroup)

  // 可変直流電源 (下辺中央)
  const psuGroup = new THREE.Group()
  psuGroup.position.set(TUBE_CENTER_X, wireY, 0.05)
  const psuBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.42, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.35 })
  )
  const psuLeftPlateMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  const psuRightPlateMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const psuLeftPlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.30, 0.29), psuLeftPlateMat)
  psuLeftPlate.position.set(-0.22, 0, 0)
  const psuRightPlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.30, 0.29), psuRightPlateMat)
  psuRightPlate.position.set(0.22, 0, 0)
  psuGroup.add(psuBox, psuLeftPlate, psuRightPlate)
  appGroup.add(psuGroup)

  // 回路電流パルス球 (6個)
  const wireBeads = []
  const beadGeo = new THREE.SphereGeometry(0.055, 10, 10)
  const beadMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 })
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(beadGeo, beadMat)
    b.visible = false
    appGroup.add(b)
    wireBeads.push(b)
  }

  // 波束光子プール (14個)
  const photonPool = []
  const pktSteps = 26
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group()
    g.visible = false
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 12),
      new THREE.MeshBasicMaterial({ color: spectral.value.hex })
    )
    const waveGeo = new THREE.BufferGeometry()
    waveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((pktSteps + 1) * 3), 3))
    const waveMat = new THREE.LineBasicMaterial({ color: spectral.value.hex, transparent: true, opacity: 0.95 })
    const waveLine = new THREE.Line(waveGeo, waveMat)
    g.add(core, waveLine)
    appGroup.add(g)
    photonPool.push({
      active: false,
      s: 0,
      speed: 3.4,
      offsetY: 0,
      offsetZ: 0,
      group: g,
      core,
      waveLine,
      waveMat,
      pktSteps
    })
  }

  // 光電子プール (28個 + 放物軌跡ライン)
  const electronPool = []
  const elecGeo = new THREE.SphereGeometry(0.072, 14, 14)
  const elecMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.95
  })
  const trailLen = 12
  for (let i = 0; i < 28; i++) {
    const mesh = new THREE.Mesh(elecGeo, elecMat)
    mesh.visible = false
    mesh.renderOrder = 3
    appGroup.add(mesh)

    const trailGeo = new THREE.BufferGeometry()
    trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailLen * 3), 3))
    const trailMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 })
    const trail = new THREE.Line(trailGeo, trailMat)
    trail.visible = false
    appGroup.add(trail)

    electronPool.push({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      pts: [],
      mesh,
      trail,
      trailLen
    })
  }

  // 左側テキストラベル (X/Z分離で正面・上面とも非衝突)
  const lblLamp = createTextSprite('単色光 380nm', { color: '#e9d5ff', borderColor: '#a855f7', fontSize: 30, scale: 0.42 })
  lblLamp.position.set(-4.85, 2.52, -0.75)

  const lblCathode = createTextSprite('陰極 K', { color: '#e2e8f0', borderColor: '#94a3b8', fontSize: 30, scale: 0.40 })
  lblCathode.position.set(CATHODE_X - 0.15, 1.25, 0.85)

  const lblAnode = createTextSprite('陽極 A', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 30, scale: 0.40 })
  lblAnode.position.set(ANODE_X + 0.15, 1.25, -0.85)

  const lblPSU = createTextSprite('V = 0.00 V', { color: '#f8fafc', borderColor: '#38bdf8', fontSize: 30, scale: 0.40 })
  lblPSU.position.set(TUBE_CENTER_X + 0.25, -2.02, 0.85)

  const lblAmmeter = createTextSprite('I = 0.0 μA', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.38 })
  lblAmmeter.position.set(CATHODE_X - 0.85, -0.82, -0.85)

  appGroup.add(lblLamp, lblCathode, lblAnode, lblPSU, lblAmmeter)

  // ======================================================
  // 2. 右側: 同期 3D グラフパネル (I-V / V0-ν) — 上面視点でも重ならないよう後傾イーゼル化
  // ======================================================
  const graphGroup = new THREE.Group()
  graphGroup.position.copy(GRAPH_CENTER)
  graphGroup.rotation.x = -0.56
  scene.add(graphGroup)

  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(4.95, 4.30),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.86, side: THREE.DoubleSide })
  )
  boardBack.position.set(0, 0.1, -0.06)
  graphGroup.add(boardBack)

  const boardFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.475, -2.05, -0.04),
      new THREE.Vector3(2.475, -2.05, -0.04),
      new THREE.Vector3(2.475, 2.25, -0.04),
      new THREE.Vector3(-2.475, 2.25, -0.04)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  graphGroup.add(boardFrame)

  const dynamicGraphGroup = new THREE.Group()
  graphGroup.add(dynamicGraphGroup)

  const opSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
  )
  opSphere.renderOrder = 5
  graphGroup.add(opSphere)

  const lblGraphTitle = createTextSprite('I-V 特性曲線', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.40 })
  lblGraphTitle.position.set(0.15, 1.96, 0.10)

  const lblGraphX = createTextSprite('電圧 V [V]', { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.45)', fontSize: 28, scale: 0.36 })
  lblGraphX.position.set(1.55, -1.78, 0.10)

  const lblGraphY = createTextSprite('↑ I [μA]', { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.45)', fontSize: 28, scale: 0.36 })
  lblGraphY.position.set(-0.65, 1.24, 0.10)

  const lblGraphStop = createTextSprite('-V₀', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 28, scale: 0.36 })
  lblGraphStop.position.set(-0.7, -1.72, 0.12)

  const lblGraphOp = createTextSprite('動作点', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 28, scale: 0.36 })
  lblGraphOp.position.set(0.4, 0.5, 0.14)

  graphGroup.add(lblGraphTitle, lblGraphX, lblGraphY, lblGraphStop, lblGraphOp)

  sceneObjs = {
    lampLensMat,
    beamConeMat,
    cathodeMat,
    cathodeGlowMat,
    anodeMat,
    anodeRimMat,
    tubeForceArrow,
    amNeedle,
    psuLeftPlateMat,
    psuRightPlateMat,
    wireCurve,
    wireBeads,
    photonPool,
    electronPool,
    lblLamp,
    lblCathode,
    lblAnode,
    lblPSU,
    lblAmmeter,
    dynamicGraphGroup,
    opSphere,
    lblGraphTitle,
    lblGraphX,
    lblGraphY,
    lblGraphStop,
    lblGraphOp
  }

  rebuildGraph()
  updateSim(0)
}

function ivToBoard(v, iVal) {
  const x = ((v - (-4)) / 8) * 3.8 - 1.9
  const y = (iVal / 160) * 2.65 - 1.38
  return new THREE.Vector3(x, y, 0.05)
}

function nuV0ToBoard(nu14, v0Val) {
  const x = ((nu14 - 3) / 13) * 3.8 - 1.9
  const y = (v0Val / 5.0) * 2.65 - 1.38
  return new THREE.Vector3(x, y, 0.05)
}

function rebuildGraph() {
  if (!sceneObjs) return
  const {
    dynamicGraphGroup,
    opSphere,
    lblGraphTitle,
    lblGraphX,
    lblGraphY,
    lblGraphStop,
    lblGraphOp
  } = sceneObjs
  clearGroup(dynamicGraphGroup)

  const mob = isMobileView()

  if (graphMode.value === 'IV') {
    // 軸: V (-4..4), I (0..160)
    const xOrigin = ivToBoard(0, 0).x
    const yBase = ivToBoard(0, 0).y

    const axX = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.075, headLength: 0.18 })
    axX.setVector(new THREE.Vector3(-2.05, yBase, 0.02), new THREE.Vector3(1, 0, 0), 4.15)
    const axY = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.075, headLength: 0.18 })
    axY.setVector(new THREE.Vector3(xOrigin, yBase, 0.02), new THREE.Vector3(0, 1, 0), 2.85)
    dynamicGraphGroup.add(axX, axY)

    // 曲線
    const vStop = -V0.value
    const Isat = intensity.value * 1.5
    const curvePts = []
    const steps = 80
    const ribbonPositions = new Float32Array((steps + 1) * 2 * 3)
    const ribbonIndices = []

    for (let i = 0; i <= steps; i++) {
      const vVal = -4 + (i / steps) * 8
      let iVal = 0
      if (KmaxEV.value > 0 && vVal > vStop) {
        if (vVal >= 1.0) iVal = Isat
        else {
          const t = (vVal - vStop) / (1.0 - vStop)
          iVal = Isat * Math.min(1, Math.max(0, Math.pow(t, 1.5)))
        }
      }
      const pt = ivToBoard(vVal, iVal)
      curvePts.push(pt)

      const vi = i * 2
      ribbonPositions[vi * 3] = pt.x
      ribbonPositions[vi * 3 + 1] = yBase
      ribbonPositions[vi * 3 + 2] = 0.015
      ribbonPositions[(vi + 1) * 3] = pt.x
      ribbonPositions[(vi + 1) * 3 + 1] = pt.y
      ribbonPositions[(vi + 1) * 3 + 2] = 0.015
      if (i < steps) {
        ribbonIndices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2)
      }
    }

    const ribbonGeo = new THREE.BufferGeometry()
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3))
    ribbonGeo.setIndex(ribbonIndices)
    dynamicGraphGroup.add(
      new THREE.Mesh(
        ribbonGeo,
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })
      )
    )

    const curve = new THREE.CatmullRomCurve3(curvePts)
    dynamicGraphGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 80, 0.036, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.65 })
      )
    )

    // 阻止電圧マーカー
    if (KmaxEV.value > 0 && vStop >= -4.0) {
      const stopPt = ivToBoard(vStop, 0)
      const stopDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xf43f5e })
      )
      stopDot.position.copy(stopPt)
      dynamicGraphGroup.add(stopDot)
      lblGraphStop.visible = true
      setLabelText(lblGraphStop, 'gStop', mob ? `-V₀=${vStop.toFixed(1)}V` : `阻止 −V₀ (${vStop.toFixed(2)}V)`, '#fda4af', '#f43f5e', 0.34)
      lblGraphStop.position.set(Math.max(-1.60, stopPt.x - 0.15), yBase - 0.36, 0.12)
    } else {
      lblGraphStop.visible = false
    }

    // 飽和電流破線
    if (KmaxEV.value > 0) {
      const satPt1 = ivToBoard(1.0, Isat)
      const satPt2 = ivToBoard(4.0, Isat)
      const satLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([satPt1, satPt2]),
        new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6 })
      )
      dynamicGraphGroup.add(satLine)
    }

    // 動作点 & 投影線
    const opPt = ivToBoard(voltage.value, photocurrent.value)
    opSphere.position.copy(opPt)
    opSphere.visible = true
    const projGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(opPt.x, yBase, 0.03),
      opPt,
      new THREE.Vector3(xOrigin, opPt.y, 0.03)
    ])
    dynamicGraphGroup.add(new THREE.Line(projGeo, new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.65 })))

    setLabelText(lblGraphTitle, 'gTitle', mob ? 'I-V 曲線' : 'I-V 特性曲線 (光電流 vs 電圧)', '#7dd3fc', '#38bdf8', 0.38)
    lblGraphTitle.position.set(0.1, 1.94, 0.10)
    setLabelText(lblGraphX, 'gX', 'V [V] →', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.34)
    lblGraphX.position.set(1.65, yBase - 0.36, 0.10)
    setLabelText(lblGraphY, 'gY', '↑ I [μA]', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.34)
    lblGraphY.position.set(xOrigin - 0.55, 1.18, 0.10)
    setLabelText(
      lblGraphOp,
      'gOp',
      mob ? `${photocurrent.value.toFixed(0)}μA` : `(${voltage.value.toFixed(1)}V, ${photocurrent.value.toFixed(0)}μA)`,
      '#fde68a',
      '#fbbf24',
      0.33
    )
    lblGraphOp.position.set(Math.min(1.50, Math.max(-1.40, opPt.x + 0.38)), Math.min(1.22, opPt.y + 0.34), 0.14)
  } else {
    // ② V0 / K_max vs ν
    const axOrigin = nuV0ToBoard(3, 0)
    const axX = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.075, headLength: 0.18 })
    axX.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, 0.02), new THREE.Vector3(1, 0, 0), 4.05)
    const axY = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.022, headRadius: 0.075, headLength: 0.18 })
    axY.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, 0.02), new THREE.Vector3(0, 1, 0), 2.85)
    dynamicGraphGroup.add(axX, axY)

    const slope = 0.4136 // V per 10^14 Hz
    const nu0 = currentMetal.value.W / slope
    const nuStart = Math.max(3.0, nu0)
    const vEnd = Math.min(5.0, (16.0 - nu0) * slope)
    const nuEnd = nu0 + vEnd / slope

    if (nuStart < 16.0) {
      const p1 = nuV0ToBoard(nuStart, 0)
      const p2 = nuV0ToBoard(Math.min(16.0, nuEnd), Math.max(0, (Math.min(16.0, nuEnd) - nu0) * slope))
      const lineCurve = new THREE.LineCurve3(p1, p2)
      dynamicGraphGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(lineCurve, 24, 0.036, 8, false),
          new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.65 })
        )
      )
    }

    if (nu0 >= 3.0 && nu0 <= 16.0) {
      const thPt = nuV0ToBoard(nu0, 0)
      const thDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xf43f5e })
      )
      thDot.position.copy(thPt)
      dynamicGraphGroup.add(thDot)
      lblGraphStop.visible = true
      setLabelText(lblGraphStop, 'gNu0', `ν₀=${nu0.toFixed(1)}`, '#fda4af', '#f43f5e', 0.34)
      lblGraphStop.position.set(thPt.x, axOrigin.y - 0.36, 0.12)
    } else {
      lblGraphStop.visible = false
    }

    const curNu = freq.value * 1e-14
    const clampNu = Math.min(16.0, Math.max(3.0, curNu))
    const clampV0 = Math.min(5.0, V0.value)
    const opPt = nuV0ToBoard(clampNu, clampV0)
    opSphere.position.copy(opPt)
    opSphere.visible = true

    const projGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(opPt.x, axOrigin.y, 0.03),
      opPt,
      new THREE.Vector3(axOrigin.x, opPt.y, 0.03)
    ])
    dynamicGraphGroup.add(new THREE.Line(projGeo, new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.65 })))

    setLabelText(lblGraphTitle, 'gTitle', mob ? 'V₀-ν (傾き h/e)' : 'V₀ / K_max vs ν (傾き = h/e)', '#6ee7b7', '#10b981', 0.37)
    lblGraphTitle.position.set(0.25, 1.96, 0.10)
    setLabelText(lblGraphX, 'gX', 'ν [10¹⁴Hz] →', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.33)
    lblGraphX.position.set(1.55, axOrigin.y - 0.36, 0.10)
    setLabelText(lblGraphY, 'gY', '↑ V₀ [V]', '#cbd5e1', 'rgba(148,163,184,0.45)', 0.33)
    lblGraphY.position.set(axOrigin.x + 0.42, 1.18, 0.10)
    setLabelText(
      lblGraphOp,
      'gOp',
      `(${curNu.toFixed(1)}, ${V0.value.toFixed(2)}V)`,
      '#fde68a',
      '#fbbf24',
      0.33
    )
    lblGraphOp.position.set(Math.min(1.50, Math.max(-1.40, opPt.x + 0.38)), Math.min(1.22, opPt.y + 0.34), 0.14)
  }
}

function updateSim(dt) {
  if (!sceneObjs) return
  const {
    lampLensMat,
    beamConeMat,
    cathodeMat,
    cathodeGlowMat,
    anodeMat,
    anodeRimMat,
    tubeForceArrow,
    amNeedle,
    psuLeftPlateMat,
    psuRightPlateMat,
    wireCurve,
    wireBeads,
    photonPool,
    electronPool,
    lblLamp,
    lblCathode,
    lblAnode,
    lblPSU,
    lblAmmeter
  } = sceneObjs

  const mob = isMobileView()
  const effDt = isPlaying.value ? dt * timeScale.value : 0
  if (effDt > 0) {
    simTime += effDt
  }

  // 光の色・金属色・極板色を同期
  const lHex = spectral.value.hex
  lampLensMat.color.setHex(lHex)
  beamConeMat.color.setHex(lHex)
  beamConeMat.opacity = 0.08 + (intensity.value / 100) * 0.16
  cathodeMat.color.setHex(currentMetal.value.color)
  cathodeGlowMat.color.setHex(lHex)

  // 陽極 A & 電源プレートの色 (正電圧: 珊瑚/琥珀+, 負電圧: 青-)
  const vVal = voltage.value
  if (vVal > 0.05) {
    anodeMat.color.setHex(0xf59e0b)
    anodeMat.emissive.setHex(0xf43f5e)
    anodeMat.emissiveIntensity = 0.35
    anodeRimMat.color.setHex(0xfb7185)
    psuLeftPlateMat.color.setHex(0x38bdf8) // 陰極側 -
    psuRightPlateMat.color.setHex(0xf43f5e) // 陽極側 +
  } else if (vVal < -0.05) {
    anodeMat.color.setHex(0x38bdf8)
    anodeMat.emissive.setHex(0x0284c7)
    anodeMat.emissiveIntensity = 0.4
    anodeRimMat.color.setHex(0x38bdf8)
    psuLeftPlateMat.color.setHex(0xf43f5e) // 陰極側 +
    psuRightPlateMat.color.setHex(0x38bdf8) // 陽極側 -
  } else {
    anodeMat.color.setHex(0xf59e0b)
    anodeMat.emissive.setHex(0xd97706)
    anodeMat.emissiveIntensity = 0.15
    anodeRimMat.color.setHex(0xfbbf24)
    psuLeftPlateMat.color.setHex(0x94a3b8)
    psuRightPlateMat.color.setHex(0x94a3b8)
  }

  // 管内電場力ベクトル (電子が受ける向き)
  if (Math.abs(vVal) > 0.12) {
    const fLen = 0.45 + (Math.abs(vVal) / 4.0) * 0.75
    const dir = new THREE.Vector3(vVal > 0 ? 1 : -1, 0, 0)
    setArrowColor(tubeForceArrow, vVal > 0 ? 0xfbbf24 : 0xf43f5e)
    tubeForceArrow.setVector(new THREE.Vector3(TUBE_CENTER_X - dir.x * (fLen * 0.5), TUBE_Y + 0.62, 0), dir, fLen)
  } else {
    tubeForceArrow.visible = false
  }

  // 電流計針 & 回路パルス
  const iFrac = Math.min(1, photocurrent.value / 150)
  amNeedle.rotation.z = 0.85 - iFrac * 1.7
  if (photocurrent.value > 0.2) {
    wireBeads.forEach((b, idx) => {
      b.visible = true
      const u = (idx / wireBeads.length + simTime * (0.25 + iFrac * 0.75)) % 1
      b.position.copy(wireCurve.getPointAt(u))
    })
  } else {
    wireBeads.forEach((b) => {
      b.visible = false
    })
  }

  // 波束光子の生成と更新
  const targetCathode = new THREE.Vector3(CATHODE_X + 0.04, TUBE_Y, 0)
  const beamVec = targetCathode.clone().sub(LAMP_POS)
  const beamLen = beamVec.length()
  const beamUnit = beamVec.clone().normalize()
  const beamNormal = new THREE.Vector3(-beamUnit.y, beamUnit.x, 0)

  if (effDt > 0) {
    spawnTimer += effDt
    const spawnInterval = 0.28 / Math.max(0.2, intensity.value / 50)
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0
      const slot = photonPool.find((p) => !p.active)
      if (slot) {
        slot.active = true
        slot.s = 0.35
        slot.speed = 3.2
        slot.offsetY = (Math.random() - 0.5) * 0.38
        slot.offsetZ = (Math.random() - 0.5) * 0.28
        slot.group.visible = true
      }
    }

    if (cathodeFlash > 0) {
      cathodeFlash = Math.max(0, cathodeFlash - effDt * 4.5)
    }

    // 光子位置・3D波束更新
    const kWave = 14.0 * (400 / wavelength.value) // 波長が短いほど波数大
    photonPool.forEach((p) => {
      if (!p.active) return
      p.s += p.speed * effDt
      if (p.s >= beamLen - 0.05) {
        p.active = false
        p.group.visible = false
        if (KmaxEV.value > 0) {
          cathodeFlash = 1.0
          // 光電子を1個放出
          const eSlot = electronPool.find((el) => !el.active)
          if (eSlot) {
            const aScale = 1.55
            // 0.35..1.0 * KmaxEV のエネルギー分布で最大値近傍を含む
            const frac = 0.35 + 0.65 * Math.pow(Math.random(), 0.72)
            const energyEV = KmaxEV.value * frac
            const vMag = Math.sqrt(2 * aScale * TUBE_SPAN * energyEV)
            eSlot.active = true
            eSlot.x = CATHODE_X + 0.06
            eSlot.y = TUBE_Y + p.offsetY * 0.6
            eSlot.z = p.offsetZ * 0.6
            eSlot.vx = vMag
            eSlot.vy = (Math.random() - 0.5) * 0.32
            eSlot.vz = (Math.random() - 0.5) * 0.28
            eSlot.pts = [new THREE.Vector3(eSlot.x, eSlot.y, eSlot.z)]
            eSlot.mesh.visible = true
            eSlot.trail.visible = true
          }
        }
        return
      }

      const center = LAMP_POS.clone().addScaledVector(beamUnit, p.s)
      center.y += p.offsetY
      center.z += p.offsetZ
      p.core.position.copy(center)
      p.core.material.color.setHex(lHex)
      p.waveMat.color.setHex(lHex)

      const posAttr = p.waveLine.geometry.getAttribute('position')
      const arr = posAttr.array
      const halfSpan = 0.42
      for (let i = 0; i <= p.pktSteps; i++) {
        const u = (i / p.pktSteps) * 2 - 1 // -1..1
        const localS = u * halfSpan
        const env = Math.exp(-u * u * 3.8)
        const amp = 0.11 * env * Math.sin(kWave * localS - simTime * 10)
        arr[i * 3] = center.x + beamUnit.x * localS + beamNormal.x * amp
        arr[i * 3 + 1] = center.y + beamUnit.y * localS + beamNormal.y * amp
        arr[i * 3 + 2] = center.z
      }
      posAttr.needsUpdate = true
    })

    // 光電子の放物運動更新 (vx += ax * dt)
    const aScale = 1.55
    const ax = vVal * aScale
    electronPool.forEach((el) => {
      if (!el.active) return
      el.vx += ax * effDt
      el.x += el.vx * effDt
      el.y += el.vy * effDt
      el.z += el.vz * effDt

      // 陽極到達 or 陰極へUターン or 管壁衝突
      const dy = el.y - TUBE_Y
      if (el.x >= ANODE_X || (el.x <= CATHODE_X + 0.02 && el.vx < 0) || Math.hypot(dy, el.z) > 0.85) {
        el.active = false
        el.mesh.visible = false
        el.trail.visible = false
        return
      }

      el.mesh.position.set(el.x, el.y, el.z)
      el.pts.push(new THREE.Vector3(el.x, el.y, el.z))
      if (el.pts.length > el.trailLen) el.pts.shift()

      const posAttr = el.trail.geometry.getAttribute('position')
      const arr = posAttr.array
      for (let i = 0; i < el.trailLen; i++) {
        const pt = el.pts[Math.min(i, el.pts.length - 1)]
        arr[i * 3] = pt.x
        arr[i * 3 + 1] = pt.y
        arr[i * 3 + 2] = pt.z
      }
      el.trail.geometry.setDrawRange(0, el.pts.length)
      posAttr.needsUpdate = true
    })
  }

  cathodeGlowMat.opacity = cathodeFlash * 0.72
  cathodeMat.emissive.setHex(lHex)
  cathodeMat.emissiveIntensity = cathodeFlash * 0.35

  // ラベル更新
  setLabelText(
    lblLamp,
    'lamp',
    mob ? `${wavelength.value}nm` : `単色光 ${wavelength.value}nm (${photonEnergyEV.value.toFixed(2)}eV)`,
    '#f8fafc',
    lightColor.value,
    0.42
  )
  setLabelText(lblCathode, 'cat', mob ? '陰極K' : `陰極 K (${currentMetal.value.name.split(' ')[0]})`, '#e2e8f0', '#94a3b8', 0.38)
  setLabelText(lblAnode, 'ano', mob ? '陽極A' : '陽極 A (コレクター)', '#fde68a', '#f59e0b', 0.38)
  setLabelText(
    lblPSU,
    'psu',
    `V = ${vVal >= 0 ? '+' : ''}${vVal.toFixed(2)} V`,
    vVal < 0 ? '#7dd3fc' : '#fda4af',
    vVal < 0 ? '#38bdf8' : '#f43f5e',
    0.38
  )
  setLabelText(
    lblAmmeter,
    'amm',
    `I = ${photocurrent.value.toFixed(1)} μA`,
    photocurrent.value > 0 ? '#6ee7b7' : '#94a3b8',
    photocurrent.value > 0 ? '#10b981' : '#475569',
    0.37
  )
}

watch([selectedMetal, wavelength, intensity, voltage, graphMode], () => {
  rebuildGraph()
  updateSim(0)
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

.desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
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

.three-status-badge.active {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.three-status-badge.stopped {
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
}

.three-status-badge.blocked {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.45);
  color: #fda4af;
}

.controls-panel {
  margin-top: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 14px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-group label {
  font-size: 0.82rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.control-group strong {
  color: #38bdf8;
  font-family: monospace;
}

.val-inline {
  display: inline-flex;
  align-items: center;
}

.sub-info {
  font-size: 0.74rem;
  color: #94a3b8;
}

.color-chip {
  display: inline-block;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1px solid #fff;
  margin-left: 6px;
}

.metal-select {
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.84rem;
}

.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mini-chip {
  padding: 3px 8px;
  font-size: 0.72rem;
  border-radius: 6px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
}

.mini-chip:hover:not(:disabled) {
  border-color: #38bdf8;
  color: #38bdf8;
}

.mini-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.graph-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.graph-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #e2e8f0;
}

.toggle-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-buttons button {
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-buttons button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
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

.stat-card .label {
  font-size: 0.72rem;
  color: #94a3b8;
}

.stat-card .val {
  font-size: 1.02rem;
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

.stat-card .val.zero-k {
  color: #f43f5e;
}

.stat-card .val.current-flow {
  color: #4ade80;
}

.stat-card .val.current-zero {
  color: #64748b;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  padding: 0 0.15em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.1em;
  font-size: 0.85em;
}

.frac .den {
  padding-top: 0.1em;
  font-size: 0.85em;
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
