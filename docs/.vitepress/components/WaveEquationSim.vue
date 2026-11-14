<template>
  <div class="lab" style="--ac:#06b6d4;--ac2:#f59e0b">
    <div class="lab-head">
      <span class="lab-title">🌊 3D 波の式とグラフ（y-x 空間波形 × y-t 時間変化）実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Surface</span>
        <span class="lab-badge">波の進行速度 v = {{ waveSpeed.toFixed(2) }} m/s ({{ direction > 0 ? '+x方向' : '-x方向' }})</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点 (y-x-t曲面)
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'yx' }" @click="setCameraPreset('yx')">
          📐 正面視点 (y-x グラフ)
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'yt' }" @click="setCameraPreset('yt')">
          📹 側面視点 (y-t グラフ)
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面視点 (波面伝播)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="animRunning = !animRunning" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ animRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨・観察)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim(0.05)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="lab-btn" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>
      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-yx"></i>y-x 空間波形 (現在 t)</span>
          <span class="legend-item"><i class="dot-yt"></i>y-t 時間波形 (点 x₀)</span>
          <span class="legend-item"><i class="dot-p"></i>着目粒子 x₀ / 参照円</span>
          <span class="legend-item"><i class="dot-vy"></i>媒質速度 v_y</span>
        </div>
      </div>
      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <div class="mode-status-strip">
      <span class="three-ortho-badge">
        ✓ タイムラグ Δt = x₀/v = {{ (observeX / waveSpeed).toFixed(2) }} s（{{ direction > 0 ? '+x進行: t/T − x/λ' : '−x進行: t/T + x/λ' }}）
      </span>
    </div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>着目点（観測位置） x₀: <strong>{{ observeX.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="observeX" min="0.0" max="6.0" step="0.2" />
        <div class="lab-note">シアン色 y-x 波面上の赤球の位置。この点の上下振動の軌跡が奥へ伸びる金色 y-t グラフになる！</div>
      </div>

      <div class="lab-ctrl">
        <label>波長 λ: <strong>{{ wavelength.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="wavelength" min="1.5" max="4.5" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>周期 T: <strong>{{ periodT.toFixed(1) }} s</strong> (振動数 f = {{ (1/periodT).toFixed(2) }} Hz)</label>
        <input type="range" v-model.number="periodT" min="1.0" max="4.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>振幅 A: <strong>{{ amplitude.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="amplitude" min="0.5" max="2.0" step="0.1" />
      </div>

      <div class="lab-ctrl">
        <label>波の進行方向</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: direction === 1 }" @click="direction = 1">➡️ +x 方向へ進行 (t/T - x/λ)</button>
          <button class="lab-chip" :class="{ on: direction === -1 }" @click="direction = -1">⬅️ -x 方向へ進行 (t/T + x/λ)</button>
          <button class="lab-btn" @click="animRunning = !animRunning">{{ animRunning ? '⏸️ 一時停止' : '▶️ 再生' }}</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">波の基本関係式</div>
        <div class="v" style="font-size:17px;color:#06b6d4">v = fλ = <span class="frac"><span class="num">λ</span><span class="den">T</span></span></div>
        <div class="f">速さ v = <span class="frac"><span class="num">{{ wavelength.toFixed(1) }}</span><span class="den">{{ periodT.toFixed(1) }}</span></span> = {{ waveSpeed.toFixed(2) }} m/s</div>
      </div>

      <div class="lab-stat">
        <div class="k">観測点 x₀ での変位 y</div>
        <div class="v" style="color:#ef4444">{{ curObsY.toFixed(2) }} <small>m</small></div>
        <div class="f">y = A sin 2π<span class="math-parens">(</span><span class="frac"><span class="num">t</span><span class="den">T</span></span> ∓ <span class="frac"><span class="num">x₀</span><span class="den">λ</span></span><span class="math-parens">)</span></div>
      </div>

      <div class="lab-stat">
        <div class="k">観測点 x₀ の媒質の速度 v_y</div>
        <div class="v" :style="{ color: curObsVy >= 0 ? '#10b981' : '#f59e0b' }">
          {{ curObsVy.toFixed(2) }} <small>m/s</small>
        </div>
        <div class="f">{{ curObsVy > 0.05 ? '上向きに運動中 ↑' : (curObsVy < -0.05 ? '下向きに運動中 ↓' : '折り返し点 (速度0)') }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">波の式（一般形）</div>
        <div class="v" style="font-size:14px;color:#e2e8f0;display:inline-flex;align-items:center;gap:3px">
          y = {{ amplitude.toFixed(1) }} sin 2π<span class="math-parens">(</span><span class="frac"><span class="num">t</span><span class="den">{{ periodT.toFixed(1) }}</span></span> {{ direction > 0 ? '−' : '+' }} <span class="frac"><span class="num">x</span><span class="den">{{ wavelength.toFixed(1) }}</span></span><span class="math-parens">)</span>
        </div>
        <div class="f">{{ direction > 0 ? '+x方向進行は「引く」' : '-x方向進行は「足す」' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const observeX = ref(2.0) // m (0..6)
const wavelength = ref(3.0) // m
const periodT = ref(2.0) // s
const amplitude = ref(1.2) // m
const direction = ref(1) // 1: +x, -1: -x
const animRunning = ref(true)
const timeScale = ref(0.5)
const activeCam = ref('3d')

const waveSpeed = computed(() => wavelength.value / periodT.value)
const curTime = ref(0)

const curObsY = computed(() => {
  const phase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (observeX.value / wavelength.value))
  return amplitude.value * Math.sin(phase)
})

const curObsVy = computed(() => {
  const omega = (2 * Math.PI) / periodT.value
  const phase = 2 * Math.PI * (curTime.value / periodT.value - direction.value * (observeX.value / wavelength.value))
  return amplitude.value * omega * Math.cos(phase)
})

const threeContainer = ref(null)
let threeCtx = null
let sceneState = null

// 座標マッピング:
// x_m in [0, 6.5] -> sceneX = -3.55 + x_m * 1.30 ([-3.55 .. +4.90])
// 単振動参照円 (Phasor Wheel) -> wheelX = -6.05 (radius <= 2.04 -> [-8.09 .. -4.01])
// t_hist in [0, 5.0] -> sceneZ = +2.8 - t_hist * 1.15 ([+2.8 .. -2.95])
const X0_SCENE = -3.55
const SCALE_X = 1.30
const WHEEL_X = -6.05
const Z0_SCENE = 2.8
const SCALE_Z = 1.15
const SCALE_Y = 1.02

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(1.95, Math.max(1.42, 1.58 / Math.max(0.68, aspect))) : 1.0
}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function getCamParams(preset) {
  const ms = getMobScale()
  const targetX = X0_SCENE + observeX.value * SCALE_X
  if (preset === 'yx') {
    return { pos: [-0.95, 0.1, 56.0 * ms], target: [-0.95, 0.1, Z0_SCENE], fov: 14 }
  }
  if (preset === 'yt') {
    return { pos: [52.0 * ms, 0.15, -0.1], target: [targetX, 0.1, -0.1], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [-0.85, 58.0 * ms, 0.15], target: [-0.85, 0, -0.1], fov: 14 }
  }
  return { pos: [5.4 * ms, 6.2 * ms, 14.2 * ms], target: [-0.85, 0.05, -0.1], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function stepSim(delta = 0.05) {
  animRunning.value = false
  curTime.value += delta
  updateScene()
}

function resetSim() {
  curTime.value = 0
  updateScene()
}

let resizeObs = null
let lastIsMob = false
const labelCache = {}

function updateLabelCached(sprite, key, text, color, borderColor, baseScale = 0.43) {
  const mult = isMobileViewport() ? 1.52 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(text, color, borderColor)
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  sprite.scale.set(h * asp, h, 1)
}

// ねじれゼロの動的3Dチューブ（Z基準またはX基準）
function createDynamicTube(segments, radialSegs, radius, material, refAxis = 'z') {
  const vertCount = (segments + 1) * (radialSegs + 1)
  const positions = new Float32Array(vertCount * 3)
  const normals = new Float32Array(vertCount * 3)
  const indices = []

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j
      const b = (i + 1) * (radialSegs + 1) + j
      const c = (i + 1) * (radialSegs + 1) + j + 1
      const d = i * (radialSegs + 1) + j + 1
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setIndex(indices)

  const mesh = new THREE.Mesh(geo, material)
  mesh.frustumCulled = false

  function updateFromPoints(pts) {
    const nPts = pts.length
    const rx = refAxis === 'x' ? 1 : 0
    const ry = 0
    const rz = refAxis === 'z' ? 1 : 0

    for (let i = 0; i < nPts; i++) {
      const pPrev = pts[Math.max(0, i - 1)]
      const pNext = pts[Math.min(nPts - 1, i + 1)]
      let tx = pNext.x - pPrev.x
      let ty = pNext.y - pPrev.y
      let tz = pNext.z - pPrev.z
      const tLen = Math.hypot(tx, ty, tz) || 1
      tx /= tLen; ty /= tLen; tz /= tLen

      let nx = ty * rz - tz * ry
      let ny = tz * rx - tx * rz
      let nz = tx * ry - ty * rx
      const nLen = Math.hypot(nx, ny, nz) || 1
      nx /= nLen; ny /= nLen; nz /= nLen

      const bx = ny * tz - nz * ty
      const by = nz * tx - nx * tz
      const bz = nx * ty - ny * tx

      const px = pts[i].x
      const py = pts[i].y
      const pz = pts[i].z

      for (let j = 0; j <= radialSegs; j++) {
        const theta = (j / radialSegs) * Math.PI * 2
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        const vx = c * nx + s * bx
        const vy = c * ny + s * by
        const vz = c * nz + s * bz
        const vIdx = (i * (radialSegs + 1) + j) * 3
        positions[vIdx] = px + radius * vx
        positions[vIdx + 1] = py + radius * vy
        positions[vIdx + 2] = pz + radius * vz
        normals[vIdx] = vx
        normals[vIdx + 1] = vy
        normals[vIdx + 2] = vz
      }
    }
    geo.getAttribute('position').needsUpdate = true
    geo.getAttribute('normal').needsUpdate = true
  }

  return { mesh, updateFromPoints }
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = getMobScale() > 1.01

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    background: 0x080c16,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    onFrame: (dt) => {
      if (animRunning.value) {
        curTime.value += dt * timeScale.value * 1.15
      }
      updateScene()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.01
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        updateScene()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x1e293b)
  grid.position.set(-1.0, -2.55, -0.1)
  scene.add(grid)

  const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: 0x0b1222, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  )
  floorPlane.rotation.x = -Math.PI / 2
  floorPlane.position.set(-1.0, -2.56, -0.1)
  scene.add(floorPlane)

  // Axes at front plane (z = Z0_SCENE)
  const xAxisArrow = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.024, headRadius: 0.075, headLength: 0.22 })
  xAxisArrow.setVector(new THREE.Vector3(X0_SCENE, 0, Z0_SCENE), new THREE.Vector3(1, 0, 0), 6.65 * SCALE_X)
  const yAxisArrow = createVectorArrow3D({ color: 0x94a3b8, shaftRadius: 0.024, headRadius: 0.075, headLength: 0.22 })
  yAxisArrow.setVector(new THREE.Vector3(X0_SCENE, -2.15 * SCALE_Y, Z0_SCENE), new THREE.Vector3(0, 1, 0), 4.45 * SCALE_Y)
  scene.add(xAxisArrow, yAxisArrow)

  const lblX = createTextSprite('位置 x [m]', { color: '#67e8f9', borderColor: '#06b6d4', scale: 0.43 })
  lblX.position.set(X0_SCENE + 6.2 * SCALE_X, -0.58, Z0_SCENE)
  const lblY = createTextSprite('変位 y [m]', { color: '#e2e8f0', borderColor: '#64748b', scale: 0.43 })
  lblY.position.set(X0_SCENE, 2.55, Z0_SCENE)
  scene.add(lblX, lblY)

  // 1. 3D Space-Time Wave Surface with crest/trough vertex colors
  const segX = 68
  const segZ = 52
  const surfGeo = new THREE.PlaneGeometry(6.5 * SCALE_X, 5.0 * SCALE_Z, segX, segZ)
  surfGeo.rotateX(-Math.PI / 2)
  const surfVertexCount = (segX + 1) * (segZ + 1)
  surfGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(surfVertexCount * 3), 3))
  const surfMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 0.52,
    side: THREE.DoubleSide
  })
  const surfMesh = new THREE.Mesh(surfGeo, surfMat)
  scene.add(surfMesh)

  // Translucent vertical slice plane at x = observeX (connecting y-x and y-t)
  const slicePlaneGeo = new THREE.PlaneGeometry(5.0 * SCALE_Z, 4.3 * SCALE_Y)
  slicePlaneGeo.rotateY(Math.PI / 2)
  const slicePlaneMesh = new THREE.Mesh(
    slicePlaneGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  scene.add(slicePlaneMesh)

  // 2. Front y-x Wave 3D Tube + Ghost future curve (t + Δt) + Medium oscillation particles & stems
  const yxSamples = 130
  const yxTube = createDynamicTube(
    yxSamples,
    8,
    0.055,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65, roughness: 0.2 }),
    'z'
  )
  scene.add(yxTube.mesh)
  const yxPts = Array.from({ length: yxSamples + 1 }, () => new THREE.Vector3())

  const yxAheadGeo = new THREE.BufferGeometry()
  yxAheadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((yxSamples + 1) * 3), 3))
  const yxAheadLine = new THREE.Line(
    yxAheadGeo,
    new THREE.LineDashedMaterial({ color: 0x34d399, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.65 })
  )
  scene.add(yxAheadLine)

  // Medium spheres + vertical stems showing transverse-only oscillation
  const numSpheres = 25
  const mediumSpheres = []
  const mGeo = new THREE.SphereGeometry(0.085, 12, 12)
  const mMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.5 })
  const stemsGeo = new THREE.BufferGeometry()
  stemsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(numSpheres * 6), 3))
  const stemsLines = new THREE.LineSegments(
    stemsGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
  )
  scene.add(stemsLines)

  for (let i = 0; i < numSpheres; i++) {
    const xm = (i / (numSpheres - 1)) * 6.5
    const s = new THREE.Mesh(mGeo, mMat)
    s.userData = { xm }
    scene.add(s)
    mediumSpheres.push(s)
  }

  // 3. y-t Time History Curve at x = observeX (along -z)
  const ytSamples = 120
  const ytTube = createDynamicTube(
    ytSamples,
    8,
    0.055,
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.6, roughness: 0.2 }),
    'x'
  )
  scene.add(ytTube.mesh)
  const ytPts = Array.from({ length: ytSamples + 1 }, () => new THREE.Vector3())

  const ytAxisGeo = new THREE.BufferGeometry()
  ytAxisGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const ytAxisLine = new THREE.Line(
    ytAxisGeo,
    new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.65 })
  )
  scene.add(ytAxisLine)

  const lblYT = createTextSprite('y-t 時間波形 (位置 x₀)', { color: '#fef08a', borderColor: '#facc15', scale: 0.44 })
  const lblTAxis = createTextSprite('経過時間 (過去 →)', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.4 })
  scene.add(lblYT, lblTAxis)

  // 4. SHM Reference Phasor Wheel (単振動の参照円) at x = WHEEL_X, z = Z0_SCENE
  const phasorGroup = new THREE.Group()
  phasorGroup.position.set(WHEEL_X, 0, Z0_SCENE)
  scene.add(phasorGroup)

  const unitCirclePts = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2
    unitCirclePts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0))
  }
  const phasorRing = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(unitCirclePts.slice(0, 64)),
    new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.78 })
  )
  const phasorCrossGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.1, 0, 0), new THREE.Vector3(1.1, 0, 0),
    new THREE.Vector3(0, -1.1, 0), new THREE.Vector3(0, 1.1, 0)
  ])
  const phasorCross = new THREE.LineSegments(
    phasorCrossGeo,
    new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.65 })
  )
  phasorGroup.add(phasorRing, phasorCross)

  const phasorArmGeo = new THREE.BufferGeometry()
  phasorArmGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const phasorArm = new THREE.Line(phasorArmGeo, new THREE.LineBasicMaterial({ color: 0xfacc15 }))
  scene.add(phasorArm)

  const phasorBead = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.75 })
  )
  scene.add(phasorBead)

  // Horizontal dashed projection link from phasor bead to probe particle x0
  const projLinkGeo = new THREE.BufferGeometry()
  projLinkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const projLink = new THREE.Line(
    projLinkGeo,
    new THREE.LineDashedMaterial({ color: 0xf43f5e, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.75 })
  )
  scene.add(projLink)

  const phasorLbl = createTextSprite('単振動の参照円 (位相 φ)', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.41 })
  phasorLbl.position.set(WHEEL_X, -2.42, Z0_SCENE)
  scene.add(phasorLbl)

  // 5. Wavelength λ bracket along bottom of y-x & Period T bracket along bottom of y-t
  const lamBarGeo = new THREE.BufferGeometry()
  lamBarGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3))
  const lamBar = new THREE.LineSegments(lamBarGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8 }))
  scene.add(lamBar)
  const lamLbl = createTextSprite(`λ = ${wavelength.value.toFixed(1)} m`, { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.42 })
  scene.add(lamLbl)

  const periodBarGeo = new THREE.BufferGeometry()
  periodBarGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3))
  const periodBar = new THREE.LineSegments(periodBarGeo, new THREE.LineBasicMaterial({ color: 0xfacc15 }))
  scene.add(periodBar)
  const periodLbl = createTextSprite(`周期 T = ${periodT.value.toFixed(1)} s`, { color: '#fef08a', borderColor: '#facc15', scale: 0.42 })
  scene.add(periodLbl)

  // 6. Probe sphere at (observeX, curObsY, Z0_SCENE) + velocity vector v_y + wave speed vector v
  const probeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.75 })
  )
  scene.add(probeMesh)

  const probeLabel = createTextSprite(`着目点 x₀ = ${observeX.value.toFixed(1)} m`, {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.44
  })
  scene.add(probeLabel)

  const vyArrow = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.052, headRadius: 0.15, headLength: 0.34 })
  const vyLabel = createTextSprite('v_y (媒質速度)', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.42 })
  scene.add(vyArrow, vyLabel)

  const waveDirArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.048, headRadius: 0.14, headLength: 0.32 })
  const waveDirLabel = createTextSprite('波の進行 v', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.44 })
  scene.add(waveDirArrow, waveDirLabel)

  sceneState = {
    surfGeo,
    segX,
    segZ,
    slicePlaneMesh,
    yxTube,
    yxPts,
    yxAheadGeo,
    yxAheadLine,
    yxSamples,
    mediumSpheres,
    stemsGeo,
    ytTube,
    ytPts,
    ytAxisGeo,
    ytSamples,
    lblX,
    lblY,
    lblYT,
    lblTAxis,
    phasorGroup,
    phasorArmGeo,
    phasorBead,
    projLinkGeo,
    projLink,
    phasorLbl,
    lamBarGeo,
    lamBar,
    lamLbl,
    periodBarGeo,
    periodBar,
    periodLbl,
    probeMesh,
    probeLabel,
    vyArrow,
    vyLabel,
    waveDirArrow,
    waveDirLabel
  }

  updateScene()
}

function evalWaveY(xm, tSec) {
  const phase = 2 * Math.PI * (tSec / periodT.value - direction.value * (xm / wavelength.value))
  return amplitude.value * Math.sin(phase)
}

const cCrest = new THREE.Color(0x38bdf8)
const cPeak = new THREE.Color(0xfef08a)
const cZero = new THREE.Color(0x1e293b)
const cTrough = new THREE.Color(0x4338ca)
const cTmp = new THREE.Color()

function updateScene() {
  if (!sceneState) return
  const {
    surfGeo,
    segX,
    segZ,
    slicePlaneMesh,
    yxTube,
    yxPts,
    yxAheadGeo,
    yxAheadLine,
    yxSamples,
    mediumSpheres,
    stemsGeo,
    ytTube,
    ytPts,
    ytAxisGeo,
    ytSamples,
    lblX,
    lblY,
    lblYT,
    lblTAxis,
    phasorGroup,
    phasorArmGeo,
    phasorBead,
    projLinkGeo,
    projLink,
    phasorLbl,
    lamBarGeo,
    lamBar,
    lamLbl,
    periodBarGeo,
    periodBar,
    periodLbl,
    probeMesh,
    probeLabel,
    vyArrow,
    vyLabel,
    waveDirArrow,
    waveDirLabel
  } = sceneState

  const tNow = curTime.value
  const amp = amplitude.value

  // ビュー適応型のラベル表示制御（正面/側面望遠時に奥行き方向の重複を完全に排除）
  const mob = isMobileViewport()
  const isYx = activeCam.value === 'yx'
  const isYt = activeCam.value === 'yt'
  const isTop = activeCam.value === 'top'
  lblX.visible = !isYt
  lblY.visible = !isTop
  waveDirArrow.visible = !isYt
  waveDirLabel.visible = !isYt
  lamBar.visible = !isYt
  lamLbl.visible = !isYt
  phasorGroup.visible = !isYt
  phasorBead.visible = !isYt
  phasorLbl.visible = !isYt
  projLink.visible = !isYt

  lblYT.visible = !isYx
  lblTAxis.visible = !isYx && (!mob || isYt)
  periodBar.visible = !isYx
  periodLbl.visible = !isYx

  // 1. Update 3D space-time surface vertices & vertex colors
  const surfPos = surfGeo.getAttribute('position')
  const surfCol = surfGeo.getAttribute('color')
  const sArr = surfPos.array
  const cArr = surfCol.array
  for (let iz = 0; iz <= segZ; iz++) {
    const tHist = (iz / segZ) * 5.0
    const zScene = Z0_SCENE - tHist * SCALE_Z
    for (let ix = 0; ix <= segX; ix++) {
      const xm = (ix / segX) * 6.5
      const xScene = X0_SCENE + xm * SCALE_X
      const ym = evalWaveY(xm, tNow - tHist)
      const idx = (iz * (segX + 1) + ix) * 3
      sArr[idx] = xScene
      sArr[idx + 1] = ym * SCALE_Y
      sArr[idx + 2] = zScene

      const h = ym / Math.max(0.2, amp)
      if (h >= 0) {
        cTmp.copy(cZero).lerp(cCrest, Math.min(1, h * 1.15))
        if (h > 0.6) cTmp.lerp(cPeak, (h - 0.6) * 1.4)
      } else {
        cTmp.copy(cZero).lerp(cTrough, Math.min(1, -h * 1.15))
      }
      cArr[idx] = cTmp.r
      cArr[idx + 1] = cTmp.g
      cArr[idx + 2] = cTmp.b
    }
  }
  surfPos.needsUpdate = true
  surfCol.needsUpdate = true
  surfGeo.computeVertexNormals()

  // 2. Update front y-x wave tube & future ghost curve
  const yxAhArr = yxAheadGeo.getAttribute('position').array
  for (let i = 0; i <= yxSamples; i++) {
    const xm = (i / yxSamples) * 6.5
    const xScene = X0_SCENE + xm * SCALE_X
    const yNow = evalWaveY(xm, tNow) * SCALE_Y
    const yAhead = evalWaveY(xm, tNow + 0.16) * SCALE_Y
    yxPts[i].set(xScene, yNow, Z0_SCENE)

    yxAhArr[i * 3] = xScene
    yxAhArr[i * 3 + 1] = yAhead
    yxAhArr[i * 3 + 2] = Z0_SCENE + 0.06
  }
  yxTube.updateFromPoints(yxPts)
  yxAheadGeo.getAttribute('position').needsUpdate = true
  yxAheadLine.computeLineDistances()

  const stArr = stemsGeo.getAttribute('position').array
  mediumSpheres.forEach((s, i) => {
    const xm = s.userData.xm
    const xs = X0_SCENE + xm * SCALE_X
    const ys = evalWaveY(xm, tNow) * SCALE_Y
    s.position.set(xs, ys, Z0_SCENE)
    stArr[i * 6] = xs; stArr[i * 6 + 1] = 0; stArr[i * 6 + 2] = Z0_SCENE
    stArr[i * 6 + 3] = xs; stArr[i * 6 + 4] = ys; stArr[i * 6 + 5] = Z0_SCENE
  })
  stemsGeo.getAttribute('position').needsUpdate = true

  // 3. Update y-t slice curve & slice plane at x = observeX
  const obsXScene = X0_SCENE + observeX.value * SCALE_X
  slicePlaneMesh.position.set(obsXScene, 0, Z0_SCENE - 2.5 * SCALE_Z)

  for (let i = 0; i <= ytSamples; i++) {
    const tHist = (i / ytSamples) * 5.0
    const zScene = Z0_SCENE - tHist * SCALE_Z
    const ym = evalWaveY(observeX.value, tNow - tHist) * SCALE_Y
    ytPts[i].set(obsXScene, ym, zScene)
  }
  ytTube.updateFromPoints(ytPts)

  const ytAxArr = ytAxisGeo.getAttribute('position').array
  ytAxArr[0] = obsXScene; ytAxArr[1] = 0; ytAxArr[2] = Z0_SCENE
  ytAxArr[3] = obsXScene; ytAxArr[4] = 0; ytAxArr[5] = Z0_SCENE - 5.2 * SCALE_Z
  ytAxisGeo.getAttribute('position').needsUpdate = true

  lblX.position.set(X0_SCENE + 6.2 * SCALE_X, -0.58, Z0_SCENE + (isTop ? 0.65 : 0))
  updateLabelCached(lblX, 'lblX', mob ? 'x [m]' : '位置 x [m]', '#67e8f9', '#06b6d4', 0.43)
  updateLabelCached(lblY, 'lblY', mob ? 'y [m]' : '変位 y [m]', '#e2e8f0', '#64748b', 0.43)
  updateLabelCached(phasorLbl, 'phasor', mob ? '参照円 (φ)' : '単振動の参照円 (位相 φ)', '#fda4af', '#f43f5e', 0.40)

  lblYT.position.set(obsXScene, Math.max(1.70, amp * SCALE_Y + 0.50), Z0_SCENE - 2.65 * SCALE_Z)
  updateLabelCached(lblYT, 'lblYT', mob ? 'y-t (x₀)' : 'y-t 時間波形 (位置 x₀)', '#fef08a', '#facc15', 0.43)
  lblTAxis.position.set(obsXScene, -2.05, Z0_SCENE - 5.35 * SCALE_Z)
  updateLabelCached(lblTAxis, 'lblTAxis', mob ? '時間 t →' : '経過時間 (過去 →)', '#fde68a', '#f59e0b', 0.40)

  // 4. Update SHM Reference Phasor Wheel (tracks phase at x0)
  const rWheel = amp * SCALE_Y
  phasorGroup.scale.set(rWheel, rWheel, 1)
  const phaseObs = 2 * Math.PI * (tNow / periodT.value - direction.value * (observeX.value / wavelength.value))
  const bx = WHEEL_X + rWheel * Math.cos(phaseObs)
  const by = rWheel * Math.sin(phaseObs)
  phasorBead.position.set(bx, by, Z0_SCENE)

  const armArr = phasorArmGeo.getAttribute('position').array
  armArr[0] = WHEEL_X; armArr[1] = 0; armArr[2] = Z0_SCENE
  armArr[3] = bx; armArr[4] = by; armArr[5] = Z0_SCENE
  phasorArmGeo.getAttribute('position').needsUpdate = true

  const pLinkArr = projLinkGeo.getAttribute('position').array
  pLinkArr[0] = bx; pLinkArr[1] = by; pLinkArr[2] = Z0_SCENE
  pLinkArr[3] = obsXScene; pLinkArr[4] = by; pLinkArr[5] = Z0_SCENE
  projLinkGeo.getAttribute('position').needsUpdate = true
  projLink.computeLineDistances()

  // 5. Update wavelength λ bracket & period T bracket (rear y-t period eliminates overlap!)
  const lx1 = X0_SCENE
  const lx2 = X0_SCENE + wavelength.value * SCALE_X
  const ly = mob ? -2.52 : -2.42
  const lamZ = Z0_SCENE + (isTop ? 0.55 : 0)
  const lArr = lamBarGeo.getAttribute('position').array
  lArr[0] = lx1; lArr[1] = ly; lArr[2] = lamZ
  lArr[3] = lx2; lArr[4] = ly; lArr[5] = lamZ
  lArr[6] = lx1; lArr[7] = ly; lArr[8] = lamZ
  lArr[9] = lx1; lArr[10] = ly + 0.18; lArr[11] = lamZ
  lArr[12] = lx2; lArr[13] = ly; lArr[14] = lamZ
  lArr[15] = lx2; lArr[16] = ly + 0.18; lArr[17] = lamZ
  lamBarGeo.getAttribute('position').needsUpdate = true
  lamLbl.position.set((lx1 + lx2) / 2, mob ? -3.12 : -2.92, lamZ)
  updateLabelCached(lamLbl, 'lam', mob ? `λ=${wavelength.value.toFixed(1)}m` : `λ = ${wavelength.value.toFixed(1)} m`, '#7dd3fc', '#38bdf8', 0.42)

  const tz1 = Z0_SCENE - 5.0 * SCALE_Z
  const tz2 = tz1 + periodT.value * SCALE_Z
  const ty = -2.35
  const tArr = periodBarGeo.getAttribute('position').array
  tArr[0] = obsXScene; tArr[1] = ty; tArr[2] = tz1
  tArr[3] = obsXScene; tArr[4] = ty; tArr[5] = tz2
  tArr[6] = obsXScene; tArr[7] = ty; tArr[8] = tz1
  tArr[9] = obsXScene; tArr[10] = ty + 0.18; tArr[11] = tz1
  tArr[12] = obsXScene; tArr[13] = ty; tArr[14] = tz2
  tArr[15] = obsXScene; tArr[16] = ty + 0.18; tArr[17] = tz2
  periodBarGeo.getAttribute('position').needsUpdate = true
  periodLbl.position.set(obsXScene, -2.75, (tz1 + tz2) / 2)
  updateLabelCached(periodLbl, 'period', mob ? `T=${periodT.value.toFixed(1)}s` : `周期 T = ${periodT.value.toFixed(1)} s`, '#fef08a', '#facc15', 0.42)

  // 6. Probe sphere, label & velocity arrows
  const obsYScene = curObsY.value * SCALE_Y
  probeMesh.position.set(obsXScene, obsYScene, Z0_SCENE)
  updateLabelCached(probeLabel, 'probe', mob ? `x₀=${observeX.value.toFixed(1)}m` : `x₀ = ${observeX.value.toFixed(1)} m`, '#fda4af', '#f43f5e', 0.43)
  probeLabel.position.set(obsXScene, isYt ? -2.25 : (mob ? -1.68 : -1.82), Z0_SCENE + (isTop ? 1.45 : 0.35))

  const vy = curObsVy.value
  if (!isTop && Math.abs(vy) > 0.08) {
    const vDir = new THREE.Vector3(0, Math.sign(vy), 0)
    const vLen = Math.min(1.45, Math.max(0.45, Math.abs(vy) * 0.32))
    vyArrow.setVector(probeMesh.position, vDir, vLen)
    vyLabel.visible = true
    updateLabelCached(vyLabel, 'vy', mob ? `v_y=${vy.toFixed(1)}` : `v_y = ${vy.toFixed(1)} m/s`, '#6ee7b7', '#10b981', 0.41)
    const vyLblY = Math.max(-1.25, Math.min(2.15, obsYScene + Math.sign(vy) * (vLen + 0.25)))
    vyLabel.position.set(obsXScene + 1.0, vyLblY, Z0_SCENE - (isYt ? 0.85 : 0))
  } else {
    vyArrow.visible = false
    vyLabel.visible = false
  }

  if (!isYt) {
    const wOrigin = new THREE.Vector3(X0_SCENE + (direction.value > 0 ? 4.1 : 5.7) * SCALE_X, 2.22, Z0_SCENE)
    const wDir = new THREE.Vector3(direction.value, 0, 0)
    waveDirArrow.setVector(wOrigin, wDir, 1.8)
    updateLabelCached(
      waveDirLabel,
      'wdir',
      mob ? `進行 v=${waveSpeed.value.toFixed(1)}` : `波の進行 v = ${waveSpeed.value.toFixed(2)} m/s`,
      '#7dd3fc',
      '#38bdf8',
      0.43
    )
    waveDirLabel.position.set(X0_SCENE + 4.9 * SCALE_X, 2.65, Z0_SCENE - (isTop ? 0.65 : 0))
  }
}

watch([observeX, wavelength, periodT, amplitude, direction], () => {
  if (activeCam.value === 'yt') {
    setCameraPreset('yt', 0.25)
  }
  updateScene()
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
.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.65);
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
  padding: 5px 10px !important;
}
.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
}
.speed-label,
.speed-btn-group button {
  white-space: nowrap;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
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
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.three-hud-legend {
  max-width: calc(100% - 24px);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.85);
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
.dot-yx { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-yt { background: #facc15; box-shadow: 0 0 6px #facc15; }
.dot-p { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-vy { background: #10b981; box-shadow: 0 0 6px #10b981; }
.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
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
.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.25rem 0 0.85rem 0;
}
.three-ortho-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(6, 182, 212, 0.14);
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: #67e8f9;
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
  .three-ortho-badge,
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
  .speed-control-group {
    border-radius: 10px !important;
    flex-wrap: wrap !important;
    width: 100%;
  }
  .speed-btn-group {
    flex-wrap: wrap !important;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
}
</style>
