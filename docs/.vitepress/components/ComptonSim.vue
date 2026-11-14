<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔬</span>
        <h3 class="sim-title">3D コンプトン効果・X線散乱シミュレーター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan">光子の運動量 <i>p</i> = <i>h</i>/λ</span>
        <span class="badge badge-yellow">Δλ = λ<sub>C</sub>(1 − cosθ)</span>
      </div>
    </div>

    <p class="desc">
      X線光子（紫波束）が炭素原子の電子（シアン）に衝突して散乱する3D過程と、散乱による波長の伸び・赤方偏移（λ' &gt; λ<sub>0</sub>）、
      反跳電子の軌道、さらに運動量保存のベクトル三角形 <b><i>p</i></b><sub>γ</sub> = <b><i>p</i></b><sub>γ</sub>′ + <b><i>p</i></b><sub>e</sub> と Δλ(θ) 曲線を同時観察できます。
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
            <i class="dot" style="background:#a855f7;box-shadow:0 0 6px #a855f7"></i>
            入射X線光子 λ<sub>0</sub>
          </span>
          <span class="legend-item">
            <i class="dot" :style="{ background: scatteredCss, boxShadow: '0 0 6px ' + scatteredCss }"></i>
            散乱光子 λ′ (波長伸び)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            反跳電子 e<sup>−</sup> (角 φ)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            散乱角 θ コーン
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="thetaDeg === 0 ? 'zero' : 'scattered'">
        θ = {{ thetaDeg }}° ｜ Δλ = +{{ deltaLambda.toFixed(3) }} pm (λ′ = {{ lambdaPrime.toFixed(2) }} pm) ｜ 反跳角 φ = {{ phiDeg.toFixed(1) }}°
      </span>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">散乱角 θ</div>
        <div class="stat-value text-blue">{{ thetaDeg }}°</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">入射X線波長 λ<sub>0</sub></div>
        <div class="stat-value">{{ lambda0.toFixed(2) }} <span class="stat-unit">pm</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">波長の伸び Δλ</div>
        <div class="stat-value text-yellow">+{{ deltaLambda.toFixed(3) }} <span class="stat-unit">pm</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">散乱光子波長 λ′</div>
        <div class="stat-value text-cyan">{{ lambdaPrime.toFixed(3) }} <span class="stat-unit">pm</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">反跳電子角 φ / <i>K</i><sub>e</sub></div>
        <div class="stat-value text-rose">{{ phiDeg.toFixed(1) }}° <span class="stat-unit">({{ recoilKeKeV.toFixed(2) }} keV)</span></div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>散乱光子の散乱角 θ:</span>
            <span class="control-val">{{ thetaDeg }}°</span>
          </label>
          <input type="range" v-model.number="thetaDeg" min="0" max="180" step="5" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>入射X線の波長 λ<sub>0</sub>:</span>
            <span class="control-val">{{ lambda0.toFixed(1) }} pm (ピコメートル)</span>
          </label>
          <input type="range" v-model.number="lambda0" min="5" max="50" step="1" class="sim-slider" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="thetaDeg = 0" class="sim-btn outline" :class="{ active: thetaDeg === 0 }">θ = 0° (直進・波長不変)</button>
        <button @click="thetaDeg = 90" class="sim-btn outline" :class="{ active: thetaDeg === 90 }">θ = 90° (Δλ = h/mc)</button>
        <button @click="thetaDeg = 180" class="sim-btn outline" :class="{ active: thetaDeg === 180 }">θ = 180° (真後ろ散乱・最大伸び)</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>物理の急所</strong>:
      光子は質量ゼロですが、運動量 <i>p</i> = <i>h</i> / λ を持ちます。
      電子と弾性衝突してエネルギーの一部を渡すため、散乱光子はエネルギーを失い（<i>E</i>′ &lt; <i>E</i>）、<strong>波長が長くなります（λ′ &gt; λ<sub>0</sub>）</strong>。
      波長の伸び Δλ = (<i>h</i> / <i>m</i><sub>e</sub><i>c</i>)(1 − cosθ) は、<strong>入射波長 λ<sub>0</sub> に関係なく「散乱角 θ だけ」で決まります！</strong>
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

const thetaDeg = ref(60)
const lambda0 = ref(20.0) // pm

const comptonWavelength = 2.4263 // h / (m_e * c) [pm]
const hc_keV_pm = 1239.84 // keV * pm

const deltaLambda = computed(() => {
  const rad = (thetaDeg.value * Math.PI) / 180
  return comptonWavelength * (1 - Math.cos(rad))
})

const lambdaPrime = computed(() => lambda0.value + deltaLambda.value)

const recoilKeKeV = computed(() => {
  return hc_keV_pm * (1 / lambda0.value - 1 / lambdaPrime.value)
})

const phiDeg = computed(() => {
  if (thetaDeg.value === 0 || thetaDeg.value === 180) return 0
  const radTheta = (thetaDeg.value * Math.PI) / 180
  const p0 = 1 / lambda0.value
  const pp = 1 / lambdaPrime.value
  const peX = p0 - pp * Math.cos(radTheta)
  const peY = pp * Math.sin(radTheta)
  return (Math.atan2(peY, peX) * 180) / Math.PI
})

// 散乱光子の物理的赤方偏移カラー (#a855f7 -> #ec4899 -> #f97316 -> #ef4444)
const scatteredColorInfo = computed(() => {
  const fracByAngle = deltaLambda.value / (2 * comptonWavelength) // 0..1
  const fracByRel = Math.min(1, deltaLambda.value / lambda0.value) // 0..1
  const shift = Math.min(1, fracByAngle * 0.68 + fracByRel * 0.45)

  const cStart = new THREE.Color(0xa855f7)
  const cMid = new THREE.Color(0xf43f5e)
  const cEnd = new THREE.Color(0xf97316)
  const cRed = new THREE.Color(0xef4444)

  const out = new THREE.Color()
  if (shift < 0.4) {
    out.copy(cStart).lerp(cMid, shift / 0.4)
  } else if (shift < 0.78) {
    out.copy(cMid).lerp(cEnd, (shift - 0.4) / 0.38)
  } else {
    out.copy(cEnd).lerp(cRed, (shift - 0.78) / 0.22)
  }
  return {
    hex: out.getHex(),
    css: '#' + out.getHexString(),
    shift
  }
})

const scatteredCss = computed(() => scatteredColorInfo.value.css)

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
  const cx = 0.1
  if (preset === 'front') {
    return { pos: [cx, 0.05, 45.0 * ms], target: [cx, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 48.5 * ms, 0.25], target: [cx, 0.0, -0.35], fov: 14 }
  }
  return { pos: [cx + 0.25 * ms, 3.8 * ms, 13.4 * ms], target: [cx, 0.05, -0.15], fov: 40 }
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
  simCycle = 0.15
  updateSim(0)
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
let sceneObjs = null
let resizeObs = null
let lastIsMob = false
let simCycle = 0.15
const labelCache = {}

const ARENA_CENTER = new THREE.Vector3(-2.35, 0.05, 0)
const PANEL_CENTER = new THREE.Vector3(2.85, 0.05, 0)

function setLabelText(sprite, key, textStr, color, borderColor, baseScale = 0.38) {
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
        rebuildGeometry()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.30, 0)
  scene.add(floorGrid)

  // ======================================================
  // 1. 左側: 3D コンプトン散乱アリーナ
  // ======================================================
  const arenaGroup = new THREE.Group()
  arenaGroup.position.copy(ARENA_CENTER)
  scene.add(arenaGroup)

  // 水平基準軸 (-3.2 .. +2.8)
  arenaGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.3, 0, 0), new THREE.Vector3(2.8, 0, 0)]),
      new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.65 })
    )
  )

  // ターゲット炭素原子軌道 & 静止ターゲット電子 (#38bdf8)
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.35 })
  const orb1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.014, 8, 32), orbitMat)
  const orb2 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.014, 8, 32).rotateX(Math.PI / 3).rotateY(Math.PI / 4), orbitMat)
  const carbonCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.45 })
  )
  carbonCore.position.set(0, 0.24, -0.22)
  arenaGroup.add(orb1, orb2, carbonCore)

  const targetElec = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.85 })
  )
  targetElec.renderOrder = 3
  arenaGroup.add(targetElec)

  // 衝突フラッシュリング
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0, depthWrite: false })
  const flashRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 10, 28), flashMat)
  arenaGroup.add(flashRing)

  // 動的散乱ジオメトリコンテナ (コーン, 円弧, ガイド波線)
  const scatterStaticGroup = new THREE.Group()
  arenaGroup.add(scatterStaticGroup)

  // アニメーション用: 入射波束, 散乱波束, 反跳電子
  const pktPtsCount = 44
  const inWaveGeo = new THREE.BufferGeometry()
  inWaveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pktPtsCount * 3), 3))
  const inWaveLine = new THREE.Line(inWaveGeo, new THREE.LineBasicMaterial({ color: 0xa855f7 }))
  const inCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xe9d5ff, emissive: 0xa855f7, emissiveIntensity: 1.0 })
  )
  arenaGroup.add(inWaveLine, inCore)

  const scatWaveGeo = new THREE.BufferGeometry()
  scatWaveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pktPtsCount * 3), 3))
  const scatWaveMat = new THREE.LineBasicMaterial({ color: 0xef4444 })
  const scatWaveLine = new THREE.Line(scatWaveGeo, scatWaveMat)
  const scatCoreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xef4444, emissiveIntensity: 1.0 })
  const scatCore = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), scatCoreMat)
  arenaGroup.add(scatWaveLine, scatCore)

  const recoilElec = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.95 })
  )
  recoilElec.renderOrder = 4
  arenaGroup.add(recoilElec)

  // 左側ラベル (X/Y/Z分離で非重複)
  const lblInPhoton = createTextSprite('入射光子 λ₀', { color: '#e9d5ff', borderColor: '#a855f7', fontSize: 28, scale: 0.38 })
  lblInPhoton.position.set(-1.95, 0.72, -0.65)

  const lblTarget = createTextSprite('炭素電子 e⁻', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 26, scale: 0.34 })
  lblTarget.position.set(-0.58, -0.78, 0.85)

  const lblScatPhoton = createTextSprite("散乱光子 λ'", { color: '#fecaca', borderColor: '#ef4444', fontSize: 28, scale: 0.38 })
  const lblRecoil = createTextSprite('反跳電子 e⁻', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 26, scale: 0.35 })
  const lblTheta = createTextSprite('θ', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 28, scale: 0.32 })
  const lblPhi = createTextSprite('φ', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 28, scale: 0.32 })

  arenaGroup.add(lblInPhoton, lblTarget, lblScatPhoton, lblRecoil, lblTheta, lblPhi)

  // ======================================================
  // 2. 右側: 3D 運動量保存三角形 (p_γ = p_γ' + p_e) & Δλ(θ) 曲線 (上面対策のため後傾イーゼル化)
  // ======================================================
  const panelGroup = new THREE.Group()
  panelGroup.position.copy(PANEL_CENTER)
  panelGroup.rotation.x = -0.56
  scene.add(panelGroup)

  const boardBack = new THREE.Mesh(
    new THREE.PlaneGeometry(4.85, 4.45),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.86, side: THREE.DoubleSide })
  )
  boardBack.position.set(0, 0.12, -0.06)
  panelGroup.add(boardBack)

  const boardFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.425, -2.10, -0.04),
      new THREE.Vector3(2.425, -2.10, -0.04),
      new THREE.Vector3(2.425, 2.34, -0.04),
      new THREE.Vector3(-2.425, 2.34, -0.04)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  panelGroup.add(boardFrame)

  // 運動量ベクトル3本
  const vecP0 = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.032, headRadius: 0.095, headLength: 0.22 })
  const vecPp = createVectorArrow3D({ color: 0xef4444, shaftRadius: 0.032, headRadius: 0.095, headLength: 0.22 })
  const vecPe = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.032, headRadius: 0.095, headLength: 0.22 })
  panelGroup.add(vecP0, vecPp, vecPe)

  const panelDynamic = new THREE.Group()
  panelGroup.add(panelDynamic)

  const deltaDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
  )
  deltaDot.renderOrder = 5
  panelGroup.add(deltaDot)

  const lblTriTitle = createTextSprite('運動量保存 p_γ = p_γ′ + p_e', { color: '#e9d5ff', borderColor: '#a855f7', fontSize: 28, scale: 0.36 })
  lblTriTitle.position.set(0, 2.08, 0.10)

  const lblP0 = createTextSprite('p_γ', { color: '#e9d5ff', borderColor: '#a855f7', fontSize: 26, scale: 0.30 })
  const lblPp = createTextSprite('p_γ′', { color: '#fecaca', borderColor: '#ef4444', fontSize: 26, scale: 0.30 })
  const lblPe = createTextSprite('p_e', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 26, scale: 0.30 })

  const lblCurveTitle = createTextSprite('波長の伸び Δλ(θ) = λ_C(1−cosθ)', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 26, scale: 0.33 })
  lblCurveTitle.position.set(0, -0.48, 0.10)

  const lblDeltaVal = createTextSprite('Δλ=1.21pm', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 26, scale: 0.31 })

  panelGroup.add(lblTriTitle, lblP0, lblPp, lblPe, lblCurveTitle, lblDeltaVal)

  sceneObjs = {
    targetElec,
    flashMat,
    flashRing,
    scatterStaticGroup,
    pktPtsCount,
    inWaveLine,
    inCore,
    scatWaveLine,
    scatWaveMat,
    scatCore,
    scatCoreMat,
    recoilElec,
    lblInPhoton,
    lblTarget,
    lblScatPhoton,
    lblRecoil,
    lblTheta,
    lblPhi,
    vecP0,
    vecPp,
    vecPe,
    panelDynamic,
    deltaDot,
    lblTriTitle,
    lblP0,
    lblPp,
    lblPe,
    lblCurveTitle,
    lblDeltaVal
  }

  rebuildGeometry()
  updateSim(0)
}

function deltaGraphToBoard(deg, dLam) {
  const x = -1.78 + (deg / 180) * 3.56
  const y = -1.86 + (dLam / (2 * comptonWavelength)) * 1.02
  return new THREE.Vector3(x, y, 0.04)
}

function rebuildGeometry() {
  if (!sceneObjs) return
  const {
    scatterStaticGroup,
    lblInPhoton,
    lblTarget,
    lblScatPhoton,
    lblRecoil,
    lblTheta,
    lblPhi,
    vecP0,
    vecPp,
    vecPe,
    panelDynamic,
    deltaDot,
    lblTriTitle,
    lblP0,
    lblPp,
    lblPe,
    lblCurveTitle,
    lblDeltaVal
  } = sceneObjs

  clearGroup(scatterStaticGroup)
  clearGroup(panelDynamic)

  const mob = isMobileView()
  const radTheta = (thetaDeg.value * Math.PI) / 180
  const radPhi = (phiDeg.value * Math.PI) / 180
  const scatHex = scatteredColorInfo.value.hex
  const scatCss = scatteredColorInfo.value.css

  const lam3dIn = 0.24 + (lambda0.value / 50) * 0.32
  const lam3dOut = lam3dIn * (1 + Math.min(2.0, (deltaLambda.value / lambda0.value) * 2.5 + (deltaLambda.value / 4.85) * 0.55))

  // 1. 静的ガイド正弦波 (入射 & 散乱)
  const inGuidePts = []
  for (let i = 0; i <= 70; i++) {
    const x = -3.25 + (i / 70) * 3.1
    const y = Math.sin(((x + 3.25) / lam3dIn) * Math.PI * 2) * 0.08
    inGuidePts.push(new THREE.Vector3(x, y, 0))
  }
  scatterStaticGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(inGuidePts),
      new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.32 })
    )
  )

  const scatDir = new THREE.Vector3(Math.cos(radTheta), Math.sin(radTheta), 0)
  const scatNorm = new THREE.Vector3(-scatDir.y, scatDir.x, 0)
  const rayLen = 2.45
  const scatGuidePts = []
  for (let i = 0; i <= 70; i++) {
    const s = 0.16 + (i / 70) * (rayLen - 0.16)
    const w = Math.sin((s / lam3dOut) * Math.PI * 2) * 0.08
    scatGuidePts.push(
      new THREE.Vector3(scatDir.x * s + scatNorm.x * w, scatDir.y * s + scatNorm.y * w, 0)
    )
  }
  scatterStaticGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(scatGuidePts),
      new THREE.LineBasicMaterial({ color: scatHex, transparent: true, opacity: 0.38 })
    )
  )

  // 3D 散乱角 θ コーン (x軸対称コーン, depthWrite: false)
  if (thetaDeg.value > 4 && thetaDeg.value < 176) {
    const coneLen = 2.15
    if (Math.abs(thetaDeg.value - 90) < 2) {
      const disk = new THREE.Mesh(
        new THREE.RingGeometry(0.18, coneLen, 36).rotateY(Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
      )
      disk.renderOrder = 1
      scatterStaticGroup.add(disk)
    } else {
      const isBack = thetaDeg.value > 90
      const halfAng = isBack ? Math.PI - radTheta : radTheta
      const h = coneLen * Math.cos(halfAng)
      const r = coneLen * Math.sin(halfAng)
      const coneGeo = new THREE.ConeGeometry(r, h, 36, 1, true)
      // ConeGeometry: 頂点 +h/2, 底面 -h/2 -> 頂点が原点 (0,0,0) で +X へ開くように回転・平行移動
      coneGeo.rotateZ(isBack ? -Math.PI / 2 : Math.PI / 2)
      coneGeo.translate(isBack ? -h / 2 : h / 2, 0, 0)
      const coneMesh = new THREE.Mesh(
        coneGeo,
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.13,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      )
      coneMesh.renderOrder = 1
      scatterStaticGroup.add(coneMesh)
    }
  }

  // θ の円弧
  if (thetaDeg.value >= 5) {
    const arcPts = []
    const rArc = 0.72
    const steps = 24
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * radTheta
      arcPts.push(new THREE.Vector3(Math.cos(a) * rArc, Math.sin(a) * rArc, 0.02))
    }
    scatterStaticGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), new THREE.LineBasicMaterial({ color: 0xfbbf24 })))
    lblTheta.visible = true
    setLabelText(lblTheta, 'th', `θ=${thetaDeg.value}°`, '#fde68a', '#fbbf24', 0.30)
    const midA = radTheta * 0.5
    lblTheta.position.set(Math.cos(midA) * 0.90, Math.sin(midA) * 0.90 + 0.06, 0.28)
  } else {
    lblTheta.visible = false
  }

  // 反跳電子軌道ガイド & φ 円弧
  const recoilDir = new THREE.Vector3(Math.cos(radPhi), -Math.sin(radPhi), 0)
  if (thetaDeg.value > 0) {
    const recLen = 2.05
    const recArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.026, headRadius: 0.08, headLength: 0.20, opacity: 0.55 })
    recArrow.setVector(new THREE.Vector3(0, 0, 0), recoilDir, recLen)
    scatterStaticGroup.add(recArrow)

    lblRecoil.visible = true
    setLabelText(lblRecoil, 'rec', mob ? '反跳e⁻' : `反跳電子 (${recoilKeKeV.value.toFixed(1)}keV)`, '#7dd3fc', '#38bdf8', 0.33)
    lblRecoil.position.set(recoilDir.x * 2.15, recoilDir.y * 2.15 - 0.22, -1.05)
  } else {
    lblRecoil.visible = false
  }

  if (phiDeg.value >= 5) {
    const phiPts = []
    const rArc = 0.62
    for (let i = 0; i <= 18; i++) {
      const a = -(i / 18) * radPhi
      phiPts.push(new THREE.Vector3(Math.cos(a) * rArc, Math.sin(a) * rArc, 0.02))
    }
    scatterStaticGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(phiPts), new THREE.LineBasicMaterial({ color: 0x38bdf8 })))
    lblPhi.visible = true
    setLabelText(lblPhi, 'ph', `φ=${phiDeg.value.toFixed(0)}°`, '#7dd3fc', '#38bdf8', 0.29)
    const midP = -radPhi * 0.55
    lblPhi.position.set(Math.cos(midP) * 0.92, Math.sin(midP) * 0.92 - 0.12, -0.32)
  } else {
    lblPhi.visible = false
  }

  // 左側ラベル配置 (θ=0° / θ=180° / 上面視点でも入射光子・散乱光子・θ・φが完全分離)
  setLabelText(lblInPhoton, 'inP', mob ? `λ₀=${lambda0.value}pm` : `入射X線 λ₀=${lambda0.value.toFixed(0)}pm`, '#e9d5ff', '#a855f7', 0.35)
  lblInPhoton.position.set(-1.95, 0.72, -0.75)
  setLabelText(lblTarget, 'tgt', mob ? '静止e⁻' : '炭素電子 e⁻', '#7dd3fc', '#38bdf8', 0.32)
  lblTarget.position.set(-0.65, -0.82, 0.55)
  setLabelText(lblScatPhoton, 'scP', mob ? `λ'=${lambdaPrime.value.toFixed(1)}` : `散乱光子 λ'=${lambdaPrime.value.toFixed(2)}pm`, '#fecaca', scatCss, 0.35)
  if (thetaDeg.value >= 145) {
    // 後方散乱時は軸の下側へ配置して入射光子(上)と完全分離
    lblScatPhoton.position.set(
      Math.max(-2.30, scatDir.x * 2.20),
      Math.min(-0.66, scatDir.y * 2.20 - 0.58),
      1.08
    )
  } else if (thetaDeg.value <= 15) {
    // 前方直進時は右上方へ
    lblScatPhoton.position.set(1.90, 0.70, 1.08)
  } else {
    lblScatPhoton.position.set(
      Math.max(-2.20, Math.min(2.05, scatDir.x * 2.35 + (scatDir.x >= 0 ? 0.28 : -0.20))),
      Math.max(-1.65, Math.min(2.12, scatDir.y * 2.15 + 0.32)),
      1.08
    )
  }

  // 2. 右側: 運動量保存三角形 (p_γ = p_γ' + p_e)
  // 頂点がタイトル (y=2.08) に絶対被らないようスケール抑制 (lenP0 = 1.68, triOrigin.y = 0.08)
  const p0 = 1 / lambda0.value
  const pp = 1 / lambdaPrime.value
  const scaleP = 1.68 / p0
  const lenP0 = p0 * scaleP // 1.68
  const lenPp = pp * scaleP

  const triOrigin = new THREE.Vector3(-0.92, 0.12, 0.05)
  const tipP0 = triOrigin.clone().add(new THREE.Vector3(lenP0, 0, 0))
  const tipPp = triOrigin.clone().add(new THREE.Vector3(lenPp * Math.cos(radTheta), lenPp * Math.sin(radTheta), 0))
  const peVec = tipP0.clone().sub(tipPp)
  const lenPe = peVec.length()

  // 共線時 (θ=0 or 180) は上下分離して矢印もラベルも非衝突
  const yOffP0 = thetaDeg.value === 180 ? -0.10 : thetaDeg.value === 0 ? -0.08 : 0
  const yOffPp = thetaDeg.value === 180 ? 0.10 : thetaDeg.value === 0 ? 0.08 : 0

  vecP0.setVector(triOrigin.clone().add(new THREE.Vector3(0, yOffP0, 0)), new THREE.Vector3(1, 0, 0), lenP0)
  setArrowColor(vecPp, scatHex)
  vecPp.setVector(triOrigin.clone().add(new THREE.Vector3(0, yOffPp, 0)), new THREE.Vector3(Math.cos(radTheta), Math.sin(radTheta), 0), lenPp)

  lblP0.position.set(triOrigin.x + lenP0 * 0.5, triOrigin.y - 0.24 + yOffP0, 0.12)

  if (thetaDeg.value <= 12) {
    // θ≈0°: p_γ' を上、p_γ を下に分離
    lblPp.position.set(triOrigin.x + lenPp * 0.5, triOrigin.y + 0.32, 0.12)
    vecPe.visible = false
    lblPe.visible = false
  } else if (thetaDeg.value >= 168) {
    // θ≈180°: p_γ' は左へ(-X)、p_e は右へ(+X)なので水平にも重ならない
    lblPp.position.set(triOrigin.x - lenPp * 0.52, triOrigin.y + 0.34, 0.12)
    vecPe.setVector(tipPp.clone().add(new THREE.Vector3(0, 0.24, 0)), peVec.clone().normalize(), lenPe)
    lblPe.visible = true
    lblPe.position.set(triOrigin.x + lenP0 * 0.48, triOrigin.y + 0.44, 0.12)
  } else {
    // 一般角: それぞれの辺の外側法線方向へ配置
    const ppOutNorm = new THREE.Vector3(-Math.sin(radTheta), Math.cos(radTheta), 0)
    const midPp = new THREE.Vector3().lerpVectors(triOrigin, tipPp, 0.52)
    lblPp.position.set(midPp.x + ppOutNorm.x * 0.32, midPp.y + ppOutNorm.y * 0.32, 0.12)

    vecPe.setVector(tipPp, peVec.clone().normalize(), lenPe)
    lblPe.visible = true
    const peDir = peVec.clone().normalize()
    const peOutNorm = new THREE.Vector3(-peDir.y, peDir.x, 0)
    const midPe = new THREE.Vector3().lerpVectors(tipPp, tipP0, 0.5)
    lblPe.position.set(midPe.x + peOutNorm.x * 0.32, midPe.y + peOutNorm.y * 0.32, 0.12)
  }

  setLabelText(lblTriTitle, 'tTitle', mob ? 'p_γ = p_γ′ + p_e' : '運動量保存の三角形 p_γ = p_γ′ + p_e', '#e9d5ff', '#a855f7', 0.35)
  lblTriTitle.position.set(0, 2.08, 0.10)
  setLabelText(lblP0, 'lp0', 'p_γ', '#e9d5ff', '#a855f7', 0.29)
  setLabelText(lblPp, 'lpp', "p_γ'", '#fecaca', scatCss, 0.29)
  setLabelText(lblPe, 'lpe', 'p_e', '#7dd3fc', '#38bdf8', 0.29)

  // 3. 右側下部: Δλ(θ) 曲線
  const axOrigin = deltaGraphToBoard(0, 0)
  const axX = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.018, headRadius: 0.06, headLength: 0.14 })
  axX.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, 0.02), new THREE.Vector3(1, 0, 0), 3.75)
  const axY = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.018, headRadius: 0.06, headLength: 0.14 })
  axY.setVector(new THREE.Vector3(axOrigin.x, axOrigin.y, 0.02), new THREE.Vector3(0, 1, 0), 1.15)
  panelDynamic.add(axX, axY)

  const curvePts = []
  const steps = 48
  const ribPos = new Float32Array((steps + 1) * 2 * 3)
  const ribIdx = []
  for (let i = 0; i <= steps; i++) {
    const d = (i / steps) * 180
    const dl = comptonWavelength * (1 - Math.cos((d * Math.PI) / 180))
    const pt = deltaGraphToBoard(d, dl)
    curvePts.push(pt)
    const vi = i * 2
    ribPos[vi * 3] = pt.x
    ribPos[vi * 3 + 1] = axOrigin.y
    ribPos[vi * 3 + 2] = 0.015
    ribPos[(vi + 1) * 3] = pt.x
    ribPos[(vi + 1) * 3 + 1] = pt.y
    ribPos[(vi + 1) * 3 + 2] = 0.015
    if (i < steps) ribIdx.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2)
  }
  const ribGeo = new THREE.BufferGeometry()
  ribGeo.setAttribute('position', new THREE.BufferAttribute(ribPos, 3))
  ribGeo.setIndex(ribIdx)
  panelDynamic.add(
    new THREE.Mesh(ribGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }))
  )
  panelDynamic.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 48, 0.028, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.55 })
    )
  )

  const curPt = deltaGraphToBoard(thetaDeg.value, deltaLambda.value)
  deltaDot.position.copy(curPt)
  panelDynamic.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(curPt.x, axOrigin.y, 0.02), curPt]),
      new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.65 })
    )
  )

  setLabelText(lblCurveTitle, 'cTitle', mob ? 'Δλ(θ)' : 'Δλ(θ) = λ_C(1 − cosθ)', '#fde68a', '#fbbf24', 0.31)
  lblCurveTitle.position.set(0, -0.44, 0.10)
  setLabelText(lblDeltaVal, 'dVal', `Δλ=${deltaLambda.value.toFixed(2)}pm`, '#fde68a', '#fbbf24', 0.29)
  lblDeltaVal.position.set(Math.min(1.42, Math.max(-1.20, curPt.x)), Math.min(-0.74, curPt.y + 0.24), 0.12)
}

function updateSim(dt) {
  if (!sceneObjs) return
  const {
    targetElec,
    flashMat,
    flashRing,
    pktPtsCount,
    inWaveLine,
    inCore,
    scatWaveLine,
    scatWaveMat,
    scatCore,
    scatCoreMat,
    recoilElec
  } = sceneObjs

  const effDt = isPlaying.value ? dt * timeScale.value : 0
  if (effDt > 0) {
    simCycle = (simCycle + effDt * 0.42) % 1.0
  }

  const radTheta = (thetaDeg.value * Math.PI) / 180
  const radPhi = (phiDeg.value * Math.PI) / 180
  const scatHex = scatteredColorInfo.value.hex

  const lam3dIn = 0.24 + (lambda0.value / 50) * 0.32
  const lam3dOut = lam3dIn * (1 + Math.min(2.0, (deltaLambda.value / lambda0.value) * 2.5 + (deltaLambda.value / 4.85) * 0.55))

  const hitPhase = 0.44
  if (simCycle < hitPhase) {
    // 衝突前: 入射波束が左(-3.3)から衝突点(0)へ進む
    const u = simCycle / hitPhase
    const cx = -3.3 + u * 3.3
    inWaveLine.visible = true
    inCore.visible = true
    inCore.position.set(cx, 0, 0)

    const posAttr = inWaveLine.geometry.getAttribute('position')
    const arr = posAttr.array
    const halfSpan = 0.62
    for (let i = 0; i < pktPtsCount; i++) {
      const t = (i / (pktPtsCount - 1)) * 2 - 1
      const lx = t * halfSpan
      const env = Math.exp(-t * t * 3.4)
      const wy = Math.sin((lx / lam3dIn) * Math.PI * 2 - simCycle * 28) * 0.16 * env
      arr[i * 3] = cx + lx
      arr[i * 3 + 1] = wy
      arr[i * 3 + 2] = 0
    }
    posAttr.needsUpdate = true

    scatWaveLine.visible = false
    scatCore.visible = false
    recoilElec.visible = false
    targetElec.visible = true
    const pulse = 1 + Math.sin(simCycle * 18) * 0.08
    targetElec.scale.set(pulse, pulse, pulse)
    flashMat.opacity = 0
  } else {
    // 衝突後: 散乱光子(赤方偏移・波長伸び) + 反跳電子が同時に飛び出す
    const u = (simCycle - hitPhase) / (1 - hitPhase)
    inWaveLine.visible = false
    inCore.visible = false

    const flashFade = Math.max(0, 1 - u * 4.2)
    flashMat.opacity = flashFade * 0.85
    const fScale = 0.5 + (1 - flashFade) * 1.4
    flashRing.scale.set(fScale, fScale, fScale)

    // 散乱光子波束
    const rayLen = 2.45
    const distS = u * rayLen
    const dirX = Math.cos(radTheta)
    const dirY = Math.sin(radTheta)
    const normX = -dirY
    const normY = dirX
    const sx = dirX * distS
    const sy = dirY * distS

    scatWaveLine.visible = true
    scatCore.visible = true
    scatWaveMat.color.setHex(scatHex)
    scatCoreMat.emissive.setHex(scatHex)
    scatCore.position.set(sx, sy, 0)

    const posAttr = scatWaveLine.geometry.getAttribute('position')
    const arr = posAttr.array
    const halfSpan = 0.78
    for (let i = 0; i < pktPtsCount; i++) {
      const t = (i / (pktPtsCount - 1)) * 2 - 1
      const ls = t * halfSpan
      const env = Math.exp(-t * t * 3.2)
      const w = Math.sin((ls / lam3dOut) * Math.PI * 2 - simCycle * 24) * 0.16 * env
      arr[i * 3] = sx + dirX * ls + normX * w
      arr[i * 3 + 1] = sy + dirY * ls + normY * w
      arr[i * 3 + 2] = 0
    }
    posAttr.needsUpdate = true

    // 反跳電子
    if (thetaDeg.value > 0) {
      targetElec.visible = false
      recoilElec.visible = true
      const recDist = u * 2.05
      recoilElec.position.set(Math.cos(radPhi) * recDist, -Math.sin(radPhi) * recDist, 0)
    } else {
      targetElec.visible = true
      recoilElec.visible = false
    }
  }
}

watch([thetaDeg, lambda0], () => {
  rebuildGeometry()
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

.badge-yellow {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.desc {
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

.three-status-badge.scattered {
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.45);
  color: #fde68a;
}

.three-status-badge.zero {
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.45);
  color: #e9d5ff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
}

.stat-label {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  font-family: monospace;
}

.stat-unit {
  font-size: 0.76rem;
  font-weight: normal;
  color: #94a3b8;
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  font-weight: 600;
  color: #e2e8f0;
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

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.sim-btn.outline {
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #475569;
}

.sim-btn.outline.active,
.sim-btn.outline:hover {
  background: rgba(56, 189, 248, 0.16);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: #1e293b;
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
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
