<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🪐</span>
        <h3>3D 惑星の楕円軌道とケプラーの3法則シミュレーター</h3>
        <span class="three-badge">Three.js 3D Space</span>
      </div>
      <p class="subtitle">
        太陽を中心力とする万有引力下での天体運動。
        第1法則（楕円軌道と焦点 F₁・F₂）、第2法則（面積速度一定則：近日点 P で加速し遠日点 A で減速）、第3法則（T<sup>2</sup> ∝ a<sup>3</sup>）、および軌道エネルギー保存則 E = −GMm / 2a を3D空間で直感的に理解できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセット & 再生コントロール -->
    <div class="camera-preset-bar">
      <div class="preset-group">
        <span class="preset-label">🎥 カメラ視点:</span>
        <button class="cam-chip" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          ⭕ 真上（楕円軌道と等面積扇形）
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 低角度パノラマ視点
        </button>
      </div>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: isPlaying }" @click="isPlaying = !isPlaying">
          {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
        </button>
        <button class="cam-chip" :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🐢 0.4x</button>
        <button class="cam-chip" :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
          <span class="legend-item"><i class="dot-f"></i>太陽引力 <b>F<sub>g</sub></b></span>
          <span v-if="showSectors" class="legend-item"><i class="dot-s1"></i>近日点扇形 <b>ΔS₁</b></span>
          <span v-if="showSectors" class="legend-item"><i class="dot-s2"></i>遠日点扇形 <b>ΔS₂ (=ΔS₁)</b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <div class="orbit-status-strip">
      <div class="orbit-badge">
        <span>面積速度: <strong>{{ arealVelocityAU2PerYr.toFixed(2) }} AU²/yr</strong> (第2法則・一定)</span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>軌道離心率 <i>e</i>: <strong>{{ eccentricity.toFixed(2) }}</strong> ({{ eccentricity === 0 ? '真円' : (eccentricity > 0.5 ? '扁平な楕円' : '穏やかな楕円') }})</span>
            <input type="range" v-model.number="eccentricity" min="0.0" max="0.75" step="0.02" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>軌道長半径 <i>a</i>: <strong>{{ semiMajorAxisAU.toFixed(2) }} AU</strong></span>
            <input type="range" v-model.number="semiMajorAxisAU" min="1.0" max="4.0" step="0.2" />
          </label>
        </div>

        <div class="control-group">
          <span class="control-label">等時間扇形（面積速度）の表示:</span>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: showSectors }" @click="showSectors = !showSectors">
              {{ showSectors ? '等面積3D扇形を表示中' : '扇形を非表示' }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <span class="control-label">プリセット天体:</span>
          <div class="btn-group">
            <button class="select-btn" @click="setPreset('earth')">地球 (e=0.02)</button>
            <button class="select-btn" @click="setPreset('mars')">火星 (e=0.09)</button>
            <button class="select-btn" @click="setPreset('comet')">ハレー彗星型 (e=0.65)</button>
          </div>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (e = 0.40, a = 2.0 AU)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">公転周期 <i>T</i></span>
        <span class="value highlight">{{ orbitalPeriodYr.toFixed(2) }} <span class="unit">年</span></span>
        <span class="subtext">T = a<sup>3/2</sup> (第3法則)</span>
      </div>

      <div class="stat-card">
        <span class="label">近日点距離 <i>r</i><sub>p</sub> / 速度 <i>v</i><sub>p</sub></span>
        <span class="value" style="color:#38bdf8">{{ perihelionDistAU.toFixed(2) }} <span class="unit">AU</span> / {{ perihelionSpeedKms.toFixed(1) }} <span class="unit">km/s</span></span>
        <span class="subtext"><i>r</i><sub>p</sub> = a(1 - e)（最速）</span>
      </div>

      <div class="stat-card">
        <span class="label">遠日点距離 <i>r</i><sub>a</sub> / 速度 <i>v</i><sub>a</sub></span>
        <span class="value" style="color:#fbbf24">{{ aphelionDistAU.toFixed(2) }} <span class="unit">AU</span> / {{ aphelionSpeedKms.toFixed(1) }} <span class="unit">km/s</span></span>
        <span class="subtext"><i>r</i><sub>a</sub> = a(1 + e)（最遅）</span>
      </div>

      <div class="stat-card">
        <span class="label">全軌道力学的エネルギー <i>E</i></span>
        <span class="value" style="color:#10b981">{{ totalEnergyRel.toFixed(2) }} <span class="unit">E₀</span></span>
        <span class="subtext">E = -GMm / 2a（長半径のみで決定）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjs = null

const eccentricity = ref(0.40)
const semiMajorAxisAU = ref(2.0)
const showSectors = ref(true)
const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')

const orbitalPeriodYr = computed(() => Math.pow(semiMajorAxisAU.value, 1.5))
const perihelionDistAU = computed(() => semiMajorAxisAU.value * (1 - eccentricity.value))
const aphelionDistAU = computed(() => semiMajorAxisAU.value * (1 + eccentricity.value))

const perihelionSpeedKms = computed(() => {
  const e = eccentricity.value
  const a = semiMajorAxisAU.value
  return (29.78 / Math.sqrt(a)) * Math.sqrt((1 + e) / (1 - e))
})

const aphelionSpeedKms = computed(() => {
  const e = eccentricity.value
  const a = semiMajorAxisAU.value
  return (29.78 / Math.sqrt(a)) * Math.sqrt((1 - e) / (1 + e))
})

const arealVelocityAU2PerYr = computed(() => {
  const a = semiMajorAxisAU.value
  const e = eccentricity.value
  const b = a * Math.sqrt(1 - e * e)
  return (Math.PI * a * b) / orbitalPeriodYr.value
})

const totalEnergyRel = computed(() => -1.0 / semiMajorAxisAU.value)

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 410
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.64, Math.max(1.34, 1.42 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'top') {
    return { pos: [0, 48.0 * ms, 0.45], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'side') {
    return { pos: [0, 2.6 * ms, 13.0 * ms], target: [0, 0.2, 0], fov: 38 }
  }
  return { pos: [0, 8.8 * ms, 12.6 * ms], target: [0, 0, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

function setPreset(type) {
  if (type === 'earth') {
    eccentricity.value = 0.02
    semiMajorAxisAU.value = 1.0
  } else if (type === 'mars') {
    eccentricity.value = 0.09
    semiMajorAxisAU.value = 1.52
  } else if (type === 'comet') {
    eccentricity.value = 0.65
    semiMajorAxisAU.value = 2.5
  }
}

function resetDefaults() {
  eccentricity.value = 0.40
  semiMajorAxisAU.value = 2.0
}

let meanAnomaly = 0.8

function solveKepler(M, e) {
  let E = M
  for (let iter = 0; iter < 10; iter++) {
    const f = E - e * Math.sin(E) - M
    const fPrime = 1 - e * Math.cos(E)
    const delta = f / fPrime
    E -= delta
    if (Math.abs(delta) < 1e-6) break
  }
  return E
}

function getVisScale() {
  // デフォルト (a=2.0 AU) でも 375px モバイル幅に収まり、最大 a=4.0 AU でも全体が見やすいスケーリング
  return 0.92 + (2.2 / Math.max(1.0, semiMajorAxisAU.value)) * 0.45
}

function initThree() {
  if (!threeContainer.value) return
  const init = getCamParams('3d')
  lastIsMob = getMobScale() > 1.01
  threeCtx = createThreeScene(threeContainer.value, {
    fov: init.fov,
    initialCamPos: init.pos,
    initialTarget: init.target,
    onFrame: (dt) => {
      if (isPlaying.value) {
        const dM = (dt * timeScale.value * 1.15) / Math.sqrt(semiMajorAxisAU.value)
        meanAnomaly += dM
        if (meanAnomaly > Math.PI * 2) meanAnomaly -= Math.PI * 2
      }
      updateDynamicPlanet()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.01
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  // 軌道面の奥行きを示す半透明グリッド
  const grid = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b)
  grid.position.y = -0.05
  if (Array.isArray(grid.material)) {
    grid.material.forEach(m => { m.transparent = true; m.opacity = 0.28 })
  } else {
    grid.material.transparent = true
    grid.material.opacity = 0.28
  }
  scene.add(grid)

  // 背景星パーティクル
  const starGeo = new THREE.BufferGeometry()
  const starCount = 240
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.sin(i * 91.7) * 0.5) * 65
    starPos[i * 3 + 1] = (Math.cos(i * 213.3) * 0.5) * 40
    starPos[i * 3 + 2] = (Math.sin(i * 53.9) * 0.5) * 65 - 10
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.15, transparent: true, opacity: 0.6 })
    )
  )

  // 静的軌道・扇形グループ
  const staticOrbitGroup = new THREE.Group()
  scene.add(staticOrbitGroup)

  // 太陽 (第1焦点 F1)
  const sunGroup = new THREE.Group()
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.1,
      roughness: 0.1
    })
  )
  sunGroup.add(sunMesh)

  const coronaMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25
    })
  )
  sunGroup.add(coronaMesh)
  scene.add(sunGroup)

  // 惑星メッシュ
  const planetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 28, 28),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.25
    })
  )
  scene.add(planetMesh)

  // 太陽と惑星を結ぶ動径ライン
  const radiusGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)])
  const radiusLine = new THREE.Line(
    radiusGeo,
    new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.55 })
  )
  scene.add(radiusLine)

  // 3D ベクトル矢印
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowFg = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  scene.add(arrowV, arrowFg)

  const labelV = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.52 })
  const labelFg = createTextSprite('F_g', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.52 })
  scene.add(labelV, labelFg)

  sceneObjs = {
    staticOrbitGroup,
    sunGroup,
    planetMesh,
    radiusLine,
    arrowV,
    arrowFg,
    labelV,
    labelFg
  }

  rebuildStaticOrbit()
  updateDynamicPlanet()
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const c = group.children[0]
    group.remove(c)
    if (c.geometry) c.geometry.dispose()
    if (c.material) {
      if (Array.isArray(c.material)) {
        c.material.forEach(m => {
          m.map?.dispose()
          m.dispose()
        })
      } else {
        c.material.map?.dispose()
        c.material.dispose()
      }
    }
  }
}

function rebuildStaticOrbit() {
  if (!sceneObjs) return
  const { staticOrbitGroup, sunGroup } = sceneObjs
  clearGroup(staticOrbitGroup)

  const s = getVisScale()
  const a = semiMajorAxisAU.value * s
  const e = eccentricity.value
  const b = a * Math.sqrt(Math.max(0.01, 1 - e * e))
  const c = a * e

  // 楕円中心を原点 (0, 0, 0) に固定し、太陽を第1焦点 sunX = -c に配置
  const centerX = 0
  const sunX = -c
  sunGroup.position.set(sunX, 0, 0)

  const labelSun = createTextSprite('太陽 (焦点 F₁)', {
    color: '#fef08a',
    borderColor: '#f59e0b',
    scale: 0.42
  })
  labelSun.position.set(sunX, -0.68, 0.56)
  staticOrbitGroup.add(labelSun)

  // 空の焦点 F2
  if (e > 0.04) {
    const f2X = c
    const f2Dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    )
    f2Dot.position.set(f2X, 0, 0)
    staticOrbitGroup.add(f2Dot)

    if (c > 0.42) {
      const labelF2 = createTextSprite('空の焦点 F₂', {
        color: '#cbd5e1',
        borderColor: '#64748b',
        scale: 0.4
      })
      labelF2.position.set(f2X, -0.68, 0.56)
      staticOrbitGroup.add(labelF2)
    }
  }

  // 近日点 P (x = -a) と 遠日点 A (x = +a) — +Z側手前に配置して扇形ラベル(-Z)と完全分離
  const periX = -a
  const apheX = a

  const labelPeri = createTextSprite(`近日点 P (${perihelionDistAU.value.toFixed(2)} AU)`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.41
  })
  labelPeri.position.set(periX - 0.45, 0.25, 1.32)
  staticOrbitGroup.add(labelPeri)

  const labelAphe = createTextSprite(`遠日点 A (${aphelionDistAU.value.toFixed(2)} AU)`, {
    color: '#fde68a',
    borderColor: '#f59e0b',
    scale: 0.41
  })
  labelAphe.position.set(apheX + 0.45, 0.25, 1.32)
  staticOrbitGroup.add(labelAphe)

  // 楕円軌道チューブ
  const orbitPts = []
  const samples = 128
  for (let i = 0; i <= samples; i++) {
    const E = (i / samples) * Math.PI * 2
    const px = centerX - a * Math.cos(E)
    const pz = -b * Math.sin(E)
    orbitPts.push(new THREE.Vector3(px, 0, pz))
  }
  const curve = new THREE.CatmullRomCurve3(orbitPts, true)
  const tubeGeo = new THREE.TubeGeometry(curve, 128, 0.032, 10, true)
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35
  })
  staticOrbitGroup.add(new THREE.Mesh(tubeGeo, tubeMat))

  // 長軸・短軸ガイドライン
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(periX, 0, 0),
    new THREE.Vector3(apheX, 0, 0),
    new THREE.Vector3(centerX, 0, -b),
    new THREE.Vector3(centerX, 0, b)
  ])
  const axisLine = new THREE.LineSegments(
    axisGeo,
    new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.45 })
  )
  staticOrbitGroup.add(axisLine)

  // 等時間3D扇形 (Kepler 第2法則) — -Z側奥に配置
  if (showSectors.value) {
    const dtSector = 0.42
    buildSectorMesh(staticOrbitGroup, sunX, centerX, a, b, e, -dtSector / 2, dtSector / 2, 0x38bdf8)
    buildSectorMesh(staticOrbitGroup, sunX, centerX, a, b, e, Math.PI - dtSector / 2, Math.PI + dtSector / 2, 0xf59e0b)

    const lblS1 = createTextSprite('扇形 ΔS₁', {
      color: '#bae6fd',
      borderColor: '#38bdf8',
      scale: 0.42
    })
    lblS1.position.set((sunX + periX) * 0.5, 0.16, -1.25)
    staticOrbitGroup.add(lblS1)

    const lblS2 = createTextSprite('扇形 ΔS₂ (=ΔS₁)', {
      color: '#fef08a',
      borderColor: '#f59e0b',
      scale: 0.42
    })
    lblS2.position.set(sunX + (apheX - sunX) * 0.58, 0.16, -1.25)
    staticOrbitGroup.add(lblS2)
  }
}

function buildSectorMesh(group, sunX, centerX, a, b, e, mStart, mEnd, hexColor) {
  const steps = 28
  const verts = []
  const borderPts = [new THREE.Vector3(sunX, 0.015, 0)]

  let prevX = 0
  let prevZ = 0
  for (let i = 0; i <= steps; i++) {
    const m = mStart + (i / steps) * (mEnd - mStart)
    const E = solveKepler(m, e)
    const px = centerX - a * Math.cos(E)
    const pz = -b * Math.sin(E)
    borderPts.push(new THREE.Vector3(px, 0.015, pz))
    if (i > 0) {
      verts.push(sunX, 0.01, 0, prevX, 0.01, prevZ, px, 0.01, pz)
    }
    prevX = px
    prevZ = pz
  }
  borderPts.push(new THREE.Vector3(sunX, 0.015, 0))

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  const mat = new THREE.MeshBasicMaterial({
    color: hexColor,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide
  })
  group.add(new THREE.Mesh(geo, mat))

  const bGeo = new THREE.BufferGeometry().setFromPoints(borderPts)
  const bMat = new THREE.LineBasicMaterial({ color: hexColor, transparent: true, opacity: 0.8 })
  group.add(new THREE.Line(bGeo, bMat))
}

function updateDynamicPlanet() {
  if (!sceneObjs) return
  const { planetMesh, radiusLine, arrowV, arrowFg, labelV, labelFg } = sceneObjs

  const s = getVisScale()
  const a = semiMajorAxisAU.value * s
  const e = eccentricity.value
  const b = a * Math.sqrt(Math.max(0.01, 1 - e * e))
  const c = a * e
  const centerX = 0
  const sunX = -c

  const E = solveKepler(meanAnomaly, e)
  const px = centerX - a * Math.cos(E)
  const pz = -b * Math.sin(E)
  const planetPos = new THREE.Vector3(px, 0, pz)
  planetMesh.position.copy(planetPos)

  // 太陽との動径ライン
  const rAttr = radiusLine.geometry.getAttribute('position')
  rAttr.setXYZ(0, sunX, 0, 0)
  rAttr.setXYZ(1, px, 0, pz)
  rAttr.needsUpdate = true

  // 速度ベクトル v
  const rCur = a * (1 - e * Math.cos(E))
  const vx = a * Math.sin(E)
  const vz = -b * Math.cos(E)
  const vDir = new THREE.Vector3(vx, 0, vz).normalize()
  const vLen = Math.min(2.5, Math.max(0.65, (a / Math.max(0.4, rCur)) * 1.15))
  arrowV.setVector(planetPos, vDir, vLen)
  labelV.position.copy(planetPos).addScaledVector(vDir, vLen + 0.42).add(new THREE.Vector3(0, 0.32, 0))

  // 万有引力ベクトル F_g (太陽向き)
  const toSun = new THREE.Vector3(sunX - px, 0, -pz)
  const distSun = Math.max(0.5, toSun.length())
  const fgDir = toSun.normalize()
  const fgLen = Math.min(2.3, Math.max(0.55, (a * a) / (distSun * distSun) * 0.95))
  arrowFg.setVector(planetPos, fgDir, fgLen)
  labelFg.position.copy(planetPos).addScaledVector(fgDir, fgLen * 0.65).add(new THREE.Vector3(0, 0.48, 0))
}

watch([eccentricity, semiMajorAxisAU, showSectors], () => {
  rebuildStaticOrbit()
  updateDynamicPlanet()
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
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
  margin: 1.5rem 0;
  color: #e2e8f0;
}
.sim-header {
  margin-bottom: 12px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #38bdf8;
}
.title-row .icon {
  font-size: 1.4rem;
}
.three-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.subtitle {
  margin: 6px 0 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
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
  border: 1px solid rgba(56, 189, 248, 0.22);
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
  align-items: center;
}
.cam-chip {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}
.cam-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #7dd3fc;
  font-weight: 600;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #060913;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.three-hud-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.14);
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
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-f { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-s1 { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-s2 { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.orbit-status-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.orbit-badge {
  display: inline-block;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #38bdf8;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
}
.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.three-hud-hint {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
  pointer-events: none;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend,
  .orbit-badge,
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
}
.control-panel {
  margin-top: 14px;
  background: #1e293b;
  padding: 14px;
  border-radius: 8px;
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
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #cbd5e1;
}
.control-group label span {
  display: flex;
  justify-content: space-between;
}
.control-group strong {
  color: #38bdf8;
}
.control-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.select-btn {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #cbd5e1;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}
.select-btn.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}
input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
  width: 100%;
}
.button-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.btn {
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
}
.btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.stat-card {
  background: #1e293b;
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 3px solid #38bdf8;
  text-align: center;
}
.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 4px;
}
.stat-card .value {
  font-size: 0.95rem;
  font-weight: bold;
  color: #f8fafc;
}
.stat-card .value.highlight {
  color: #38bdf8;
}
.stat-card .unit {
  font-size: 0.75rem;
  font-weight: normal;
  color: #94a3b8;
}
.stat-card .subtext {
  font-size: 0.68rem;
  color: #64748b;
  margin-top: 4px;
}
</style>
