<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
const activeCam = ref('3d')

// 物理パラメータ
const waveSourceDist = ref(160) // 波源間隔 d [px]
const wavelength = ref(32) // 波長 lambda [px]
const waveSpeed = ref(1.5) // 波の速さ v
const phaseDiff = ref(0) // 0: 同位相, 1: 逆位相 (π)
const showNodalLines = ref(true) // 節線・腹線の理論双曲線の重ね合わせ
const isPlaying = ref(true)
const timeScale = ref(1.0)

// 観測プローブ点 P (2D 座標換算: 500 x 360)
const width = 500
const height = 360
const mousePos = ref({ x: 310, y: 110 })

let time = 0

const s1Pos = computed(() => ({
  x: width / 2 - waveSourceDist.value / 2,
  y: height / 2
}))

const s2Pos = computed(() => ({
  x: width / 2 + waveSourceDist.value / 2,
  y: height / 2
}))

const probeData = computed(() => {
  const p = mousePos.value
  const d1 = Math.hypot(p.x - s1Pos.value.x, p.y - s1Pos.value.y)
  const d2 = Math.hypot(p.x - s2Pos.value.x, p.y - s2Pos.value.y)
  const diff = Math.abs(d1 - d2)
  const lambda = wavelength.value
  const ratio = diff / lambda

  let status = ''
  let kind = 'mid'
  const mVal = Math.round(ratio)
  const frac = Math.abs(ratio - mVal)

  if (phaseDiff.value === 0) {
    if (frac < 0.12) {
      status = `完全強め合い (腹 m=${mVal})`
      kind = 'anti'
    } else if (Math.abs(frac - 0.5) < 0.12) {
      status = `完全弱め合い (節 m=${Math.floor(ratio)})`
      kind = 'node'
    } else {
      status = '中間干渉'
    }
  } else {
    if (Math.abs(frac - 0.5) < 0.12) {
      status = `完全強め合い (腹 m=${Math.floor(ratio)})`
      kind = 'anti'
    } else if (frac < 0.12) {
      status = `完全弱め合い (節 m=${mVal})`
      kind = 'node'
    } else {
      status = '中間干渉'
    }
  }

  return {
    d1: d1.toFixed(1),
    d2: d2.toFixed(1),
    diff: diff.toFixed(1),
    ratio: ratio.toFixed(2),
    status,
    kind
  }
})

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 400
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(2.1, Math.max(1.25, 1.82 / Math.max(0.72, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 3.2, 42.0 * ms], target: [0, 0.25, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 44.0 * ms, 0.45], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0, 8.2 * ms, 11.4 * ms], target: [0, 0.1, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function setProbePreset(mode) {
  const c = waveSourceDist.value / 2
  const lambda = wavelength.value
  if (mode === 'center') {
    mousePos.value = { x: width / 2, y: height / 2 - 95 }
  } else if (mode === 'antinode1') {
    const deltaL = phaseDiff.value === 0 ? lambda : 0.5 * lambda
    const a = Math.min(c - 1, deltaL / 2)
    const b = Math.sqrt(Math.max(1, c * c - a * a))
    const yRel = -90
    const xRel = a * Math.sqrt(1 + (yRel * yRel) / (b * b))
    mousePos.value = {
      x: Math.min(460, Math.max(40, width / 2 + xRel)),
      y: height / 2 + yRel
    }
  } else if (mode === 'node0') {
    const deltaL = phaseDiff.value === 0 ? 0.5 * lambda : lambda
    const a = Math.min(c - 1, deltaL / 2)
    const b = Math.sqrt(Math.max(1, c * c - a * a))
    const yRel = -90
    const xRel = a * Math.sqrt(1 + (yRel * yRel) / (b * b))
    mousePos.value = {
      x: Math.min(460, Math.max(40, width / 2 + xRel)),
      y: height / 2 + yRel
    }
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stepSim(dt = 0.06) {
  isPlaying.value = false
  time += dt * 3.0
  updateWaveMesh()
}

// Coordinate conversion between 2D px (500x360) and 3D tank (11.0 x 7.92)
const SCALE_3D = 11.0 / 500
function pxTo3DX(px) {
  return (px - width / 2) * SCALE_3D
}
function pxTo3DZ(py) {
  return (py - height / 2) * SCALE_3D
}

let sceneState = null
let resizeObs = null
let lastIsMob = false
let pointerCleanup = null

// Label text cache
const labelCache = new Map()
function updateLabelCached(sprite, text, color, borderColor) {
  const prev = labelCache.get(sprite)
  const next = `${text}|${color}|${borderColor}`
  if (prev === next) return
  labelCache.set(sprite, next)
  sprite.updateText(text, color, borderColor)
}

function disposeObj(obj) {
  if (!obj) return
  if (obj.geometry) obj.geometry.dispose()
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => {
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
    const child = group.children[0]
    group.remove(child)
    child.traverse(disposeObj)
  }
}

// Precomputed grid distances r1, r2, a1, a2 for blazing-fast wave surface evaluation
const SEG_X = 96
const SEG_Z = 68
const V_COUNT = (SEG_X + 1) * (SEG_Z + 1)
const gridR1 = new Float32Array(V_COUNT)
const gridR2 = new Float32Array(V_COUNT)
const gridA1 = new Float32Array(V_COUNT)
const gridA2 = new Float32Array(V_COUNT)

function precomputeGridDistances() {
  const s1 = s1Pos.value
  const s2 = s2Pos.value
  for (let iz = 0; iz <= SEG_Z; iz++) {
    const py = (iz / SEG_Z) * height
    for (let ix = 0; ix <= SEG_X; ix++) {
      const px = (ix / SEG_X) * width
      const idx = iz * (SEG_X + 1) + ix
      const r1 = Math.hypot(px - s1.x, py - s1.y)
      const r2 = Math.hypot(px - s2.x, py - s2.y)
      gridR1[idx] = r1
      gridR2[idx] = r2
      gridA1[idx] = 1 / Math.sqrt(r1 + 24)
      gridA2[idx] = 1 / Math.sqrt(r2 + 24)
    }
  }
}

// Color ramp constants (Crest: #38bdf8 -> #fef08a | Neutral: #0f172a | Trough: #312e81 -> #1e1b4b)
const C_CREST_PEAK = new THREE.Color(0xfef08a)
const C_CREST_MID = new THREE.Color(0x38bdf8)
const C_NEUTRAL = new THREE.Color(0x0f172a)
const C_TROUGH_MID = new THREE.Color(0x312e81)
const C_TROUGH_DEEP = new THREE.Color(0x1e1b4b)
const TMP_COL = new THREE.Color()

const UP_VEC = new THREE.Vector3(0, 1, 0)
function alignBeamBetween(mesh, pA, pB) {
  const diff = new THREE.Vector3().subVectors(pB, pA)
  const len = diff.length()
  if (len < 0.01) {
    mesh.visible = false
    return
  }
  mesh.visible = true
  mesh.position.copy(pA).addScaledVector(diff, 0.5)
  mesh.scale.set(1, len, 1)
  mesh.quaternion.setFromUnitVectors(UP_VEC, diff.normalize())
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastIsMob = getMobScale() > 1.05

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 140,
    onFrame: (dt) => {
      if (isPlaying.value) {
        time += dt * 3.0 * timeScale.value
      }
      updateWaveMesh()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.05
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene, camera, renderer } = threeCtx
  const planeW = width * SCALE_3D
  const planeH = height * SCALE_3D

  // Subtle floor grid beneath ripple tank
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  grid.position.y = -0.68
  scene.add(grid)

  // Translucent 3D Ripple Tank Box (glass walls + base tray)
  const tankWallMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    roughness: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const wallH = 0.72
  const wallThick = 0.08
  const wallF = new THREE.Mesh(new THREE.BoxGeometry(planeW + wallThick * 2, wallH, wallThick), tankWallMat)
  wallF.position.set(0, -0.22, planeH / 2 + wallThick / 2)
  const wallB = wallF.clone()
  wallB.position.set(0, -0.22, -planeH / 2 - wallThick / 2)
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, planeH), tankWallMat)
  wallL.position.set(-planeW / 2 - wallThick / 2, -0.22, 0)
  const wallR = wallL.clone()
  wallR.position.set(planeW / 2 + wallThick / 2, -0.22, 0)
  const tankBase = new THREE.Mesh(
    new THREE.BoxGeometry(planeW + 0.24, 0.1, planeH + 0.24),
    new THREE.MeshStandardMaterial({ color: 0x0b1222, roughness: 0.65, metalness: 0.35 })
  )
  tankBase.position.set(0, -0.62, 0)
  const tankRimEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(planeW + 0.16, 0.72, planeH + 0.16)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })
  )
  tankRimEdges.position.set(0, -0.22, 0)
  scene.add(wallF, wallB, wallL, wallR, tankBase, tankRimEdges)

  // 1. 3D Dynamic Water Wave Surface Mesh
  const surfGeo = new THREE.PlaneGeometry(planeW, planeH, SEG_X, SEG_Z)
  surfGeo.rotateX(-Math.PI / 2)
  surfGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(V_COUNT * 3), 3))

  const surfMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.18,
    metalness: 0.18,
    side: THREE.DoubleSide
  })
  const surfMesh = new THREE.Mesh(surfGeo, surfMat)
  scene.add(surfMesh)

  // 2. Oscillating 3D Dippers S1, S2 (vertical actuator arm + glowing sphere tip)
  const buildDipper = (tipColor, emissiveCol) => {
    const grp = new THREE.Group()
    const tipMat = new THREE.MeshStandardMaterial({
      color: tipColor,
      emissive: emissiveCol,
      emissiveIntensity: 0.78,
      roughness: 0.2
    })
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), tipMat)
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 })
    )
    rod.position.y = 0.52
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.27, 0.03, 10, 24).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: tipColor, transparent: true, opacity: 0.75 })
    )
    collar.position.y = -0.02
    grp.add(tip, rod, collar)
    return { grp, tipMat, collar }
  }

  const s1Dipper = buildDipper(0x38bdf8, 0x0284c7)
  const s2Dipper = buildDipper(0x38bdf8, 0x0284c7)
  scene.add(s1Dipper.grp, s2Dipper.grp)

  // Baseline rail connecting S1 & S2
  const baselineBar = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.04, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.65 })
  )
  baselineBar.position.set(0, 0.06, 0)
  scene.add(baselineBar)

  const s1Lbl = createTextSprite('波源 S₁', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 34, scale: 0.46 })
  const s2Lbl = createTextSprite('波源 S₂', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 34, scale: 0.46 })
  scene.add(s1Lbl, s2Lbl)

  // 3. Hyperbolic Nodal & Antinodal 3D Curves group
  const hyperbolaGroup = new THREE.Group()
  scene.add(hyperbolaGroup)

  // 4. Probe point P beacon + 3D cylindrical path beams r1, r2 + label
  const probeGroup = new THREE.Group()
  const probeCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.8 })
  )
  const probeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.035, 10, 28).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  )
  const probeStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7 })
  )
  probeStem.position.y = -0.27
  probeGroup.add(probeCore, probeRing, probeStem)
  scene.add(probeGroup)

  const pathBeamGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 10)
  const path1Mesh = new THREE.Mesh(
    pathBeamGeo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
  )
  const path2Mesh = new THREE.Mesh(
    pathBeamGeo,
    new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.85 })
  )
  scene.add(path1Mesh, path2Mesh)

  const probeLbl = createTextSprite('観測点 P', { color: '#fef08a', borderColor: '#facc15', fontSize: 32, scale: 0.5 })
  scene.add(probeLbl)

  // Interactive click-to-move Probe P on water surface (without interfering with orbit drag)
  const raycaster = new THREE.Raycaster()
  const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const hitPt = new THREE.Vector3()
  let downPos = null
  const domEl = renderer.domElement
  const onPointerDown = (e) => {
    downPos = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    if (!downPos) return
    const moveDist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y)
    downPos = null
    if (moveDist > 5) return
    const rect = domEl.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectPlane(waterPlane, hitPt)) {
      const px = hitPt.x / SCALE_3D + width / 2
      const py = hitPt.z / SCALE_3D + height / 2
      if (px >= 20 && px <= width - 20 && py >= 20 && py <= height - 20) {
        mousePos.value = { x: Math.round(px), y: Math.round(py) }
      }
    }
  }
  domEl.addEventListener('pointerdown', onPointerDown)
  domEl.addEventListener('pointerup', onPointerUp)
  pointerCleanup = () => {
    domEl.removeEventListener('pointerdown', onPointerDown)
    domEl.removeEventListener('pointerup', onPointerUp)
  }

  sceneState = {
    surfGeo,
    s1Dipper,
    s2Dipper,
    baselineBar,
    s1Lbl,
    s2Lbl,
    hyperbolaGroup,
    probeGroup,
    path1Mesh,
    path2Mesh,
    probeLbl
  }

  precomputeGridDistances()
  rebuildHyperbolas()
  updateWaveMesh()
}

function rebuildHyperbolas() {
  if (!sceneState) return
  const { hyperbolaGroup, s1Dipper, s2Dipper, baselineBar, s1Lbl, s2Lbl } = sceneState
  clearGroup(hyperbolaGroup)

  const s1x = pxTo3DX(s1Pos.value.x)
  const s2x = pxTo3DX(s2Pos.value.x)
  baselineBar.scale.set(Math.max(0.1, s2x - s1x), 1, 1)
  s1Lbl.position.set(s1x - 0.15, 0.88, 0.42)
  s2Lbl.position.set(s2x + 0.15, 0.88, 0.42)

  // Update dipper S2 tint to highlight anti-phase π vs in-phase
  if (phaseDiff.value === 1) {
    s2Dipper.tipMat.color.setHex(0xc084fc)
    s2Dipper.tipMat.emissive.setHex(0x9333ea)
    updateLabelCached(s2Lbl, '波源 S₂ (逆位相 π)', '#e9d5ff', '#c084fc')
  } else {
    s2Dipper.tipMat.color.setHex(0x38bdf8)
    s2Dipper.tipMat.emissive.setHex(0x0284c7)
    updateLabelCached(s2Lbl, '波源 S₂', '#7dd3fc', '#38bdf8')
  }

  if (!showNodalLines.value) return

  const d = waveSourceDist.value
  const lambda = wavelength.value
  const maxM = Math.floor(d / lambda)
  const c = d / 2

  for (let m = 0; m <= maxM; m++) {
    const deltaAntinode = (phaseDiff.value === 0 ? m : m + 0.5) * lambda
    if (deltaAntinode < d && deltaAntinode >= 0) {
      addHyperbolaTube3D(hyperbolaGroup, c, deltaAntinode, 0x10b981, 0.44, 0.032)
    }

    const deltaNode = (phaseDiff.value === 0 ? m + 0.5 : m) * lambda
    if (deltaNode < d && deltaNode >= 0) {
      addHyperbolaTube3D(hyperbolaGroup, c, deltaNode, 0xf43f5e, 0.36, 0.028)
    }
  }
}

function addHyperbolaTube3D(group, c, deltaL, colorHex, yElev, radius) {
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.72,
    transparent: true,
    opacity: 0.9,
    roughness: 0.25
  })
  if (deltaL === 0) {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(0, yElev, pxTo3DZ(6)),
      new THREE.Vector3(0, yElev, pxTo3DZ(height - 6))
    )
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 8, false), mat))
    return
  }

  const a = deltaL / 2
  if (a >= c) return
  const b = Math.sqrt(c * c - a * a)

  for (const sign of [-1, 1]) {
    const pts = []
    for (let py = 6; py <= height - 6; py += 8) {
      const yRel = py - height / 2
      const xRel = sign * a * Math.sqrt(1 + (yRel * yRel) / (b * b))
      const px = width / 2 + xRel
      if (px >= 4 && px <= width - 4) {
        pts.push(new THREE.Vector3(pxTo3DX(px), yElev, pxTo3DZ(py)))
      }
    }
    if (pts.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(pts)
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, pts.length), radius, 8, false), mat))
    }
  }
}

function evalWaveAtPx(px, py) {
  const s1 = s1Pos.value
  const s2 = s2Pos.value
  const lambda = wavelength.value
  const k = (2 * Math.PI) / lambda
  const omega = k * waveSpeed.value
  const phi2 = phaseDiff.value === 0 ? 0 : Math.PI

  const r1 = Math.hypot(px - s1.x, py - s1.y)
  const r2 = Math.hypot(px - s2.x, py - s2.y)
  const a1 = 1 / Math.sqrt(r1 + 24)
  const a2 = 1 / Math.sqrt(r2 + 24)

  const y1 = a1 * Math.cos(k * r1 - omega * time)
  const y2 = a2 * Math.cos(k * r2 - omega * time + phi2)
  return (y1 + y2) * 3.3
}

function updateWaveMesh() {
  if (!sceneState) return
  const {
    surfGeo,
    s1Dipper,
    s2Dipper,
    probeGroup,
    path1Mesh,
    path2Mesh,
    probeLbl
  } = sceneState

  const lambda = wavelength.value
  const k = (2 * Math.PI) / lambda
  const phase = k * waveSpeed.value * time
  const phi2 = phaseDiff.value === 0 ? 0 : Math.PI

  // Animate 3D mechanical dippers S1, S2 in sync or anti-phase
  const s1x = pxTo3DX(s1Pos.value.x)
  const s2x = pxTo3DX(s2Pos.value.x)
  const osc1 = Math.cos(-phase)
  const osc2 = Math.cos(-phase + phi2)
  s1Dipper.grp.position.set(s1x, 0.16 + osc1 * 0.22, 0)
  s2Dipper.grp.position.set(s2x, 0.16 + osc2 * 0.22, 0)

  const posAttr = surfGeo.getAttribute('position')
  const colAttr = surfGeo.getAttribute('color')
  const pArr = posAttr.array
  const cArr = colAttr.array

  for (let i = 0; i < V_COUNT; i++) {
    const val = (gridA1[i] * Math.cos(k * gridR1[i] - phase) + gridA2[i] * Math.cos(k * gridR2[i] - phase + phi2)) * 3.35
    pArr[i * 3 + 1] = val * 0.34

    if (val >= 0) {
      const t = Math.min(1, val)
      if (t < 0.65) {
        TMP_COL.copy(C_NEUTRAL).lerp(C_CREST_MID, t / 0.65)
      } else {
        TMP_COL.copy(C_CREST_MID).lerp(C_CREST_PEAK, (t - 0.65) / 0.35)
      }
    } else {
      const t = Math.min(1, -val)
      if (t < 0.55) {
        TMP_COL.copy(C_NEUTRAL).lerp(C_TROUGH_MID, t / 0.55)
      } else {
        TMP_COL.copy(C_TROUGH_MID).lerp(C_TROUGH_DEEP, (t - 0.55) / 0.45)
      }
    }
    cArr[i * 3] = TMP_COL.r
    cArr[i * 3 + 1] = TMP_COL.g
    cArr[i * 3 + 2] = TMP_COL.b
  }
  posAttr.needsUpdate = true
  colAttr.needsUpdate = true
  surfGeo.computeVertexNormals()

  // Update Probe Point P + r1, r2 3D beams
  const p = mousePos.value
  const px3 = pxTo3DX(p.x)
  const pz3 = pxTo3DZ(p.y)
  const py3 = evalWaveAtPx(p.x, p.y) * 0.34 + 0.56
  probeGroup.position.set(px3, py3, pz3)

  alignBeamBetween(path1Mesh, new THREE.Vector3(s1x, 0.36, 0), new THREE.Vector3(px3, py3, pz3))
  alignBeamBetween(path2Mesh, new THREE.Vector3(s2x, 0.36, 0), new THREE.Vector3(px3, py3, pz3))

  const probeLblY = pz3 > 0.75 ? -0.45 : Math.max(1.82, py3 + 0.85)
  const probeLblZ = Math.abs(pz3 - 0.42) < 0.9 ? (pz3 <= 0.42 ? pz3 - 0.7 : pz3 + 0.7) : pz3
  probeLbl.position.set(px3, probeLblY, probeLblZ)
  updateLabelCached(probeLbl, `P (|r₁−r₂|=${probeData.value.ratio}λ)`, '#fef08a', '#facc15')
}

function resetSim() {
  waveSourceDist.value = 160
  wavelength.value = 32
  waveSpeed.value = 1.5
  phaseDiff.value = 0
  showNodalLines.value = true
  mousePos.value = { x: 310, y: 110 }
  time = 0
  isPlaying.value = true
  precomputeGridDistances()
  rebuildHyperbolas()
  updateWaveMesh()
}

watch(waveSourceDist, () => {
  precomputeGridDistances()
  rebuildHyperbolas()
  updateWaveMesh()
})

watch([wavelength, phaseDiff, showNodalLines], () => {
  rebuildHyperbolas()
  updateWaveMesh()
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (pointerCleanup) {
    pointerCleanup()
    pointerCleanup = null
  }
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

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">🌊</span>
        <span>3D 2波源による波の干渉と双曲線縞（腹線・節線シミュレーター）</span>
      </div>
      <div class="badge">Three.js 3D Ripple Tank</div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="mode-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="mode-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="mode-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点 (双曲線腹線・節線)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary-play" @click="togglePlay">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="btn btn-secondary" @click="stepSim(0.06)">⏭ コマ送り</button>
      <button class="btn btn-reset" @click="resetSim">🔄 リセット</button>
    </div>

    <div class="canvas-wrapper">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-anti"></i>腹線 (強め合い)</span>
          <span class="legend-item"><i class="dot-node"></i>節線 (弱め合い)</span>
          <span class="legend-item"><i class="dot-crest"></i>山</span>
          <span class="legend-item"><i class="dot-trough"></i>谷</span>
          <span class="legend-item"><i class="dot-probe"></i>観測点 P</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ クリックで P 点移動 ・ ドラッグで3D回転</div>
      </div>
    </div>

    <!-- 干渉状態バッジ（モバイル非重複のためビューポート直下へ分離） -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :class="probeData.kind">
        観測点 P：|r₁ − r₂| = {{ probeData.ratio }}λ → {{ probeData.status }}
      </span>
    </div>

    <!-- 観測プローブ情報 -->
    <div class="probe-card">
      <div class="probe-head">
        <div class="probe-title">🎯 3D観測プローブ P 点のリアルタイム干渉状態</div>
        <div class="probe-presets">
          <button class="mode-btn" @click="setProbePreset('center')">中央腹線 (Δr=0)</button>
          <button class="mode-btn" @click="setProbePreset('node0')">第1節線 (Δr=0.5λ)</button>
          <button class="mode-btn" @click="setProbePreset('antinode1')">第1腹線 (Δr=1.0λ)</button>
        </div>
      </div>
      <div class="probe-grid">
        <div class="stat-box">
          <span class="label">S₁ からの距離 r₁</span>
          <span class="value">{{ probeData.d1 }} px</span>
        </div>
        <div class="stat-box">
          <span class="label">S₂ からの距離 r₂</span>
          <span class="value">{{ probeData.d2 }} px</span>
        </div>
        <div class="stat-box highlight">
          <span class="label">経路差 |r₁ - r₂|</span>
          <span class="value">{{ probeData.diff }} px ({{ probeData.ratio }} λ)</span>
        </div>
        <div class="stat-box status">
          <span class="label">干渉判定</span>
          <span class="value badge-status">{{ probeData.status }}</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>波源間隔 <i>d</i>: <span>{{ waveSourceDist }} px</span></label>
          <input type="range" v-model.number="waveSourceDist" min="80" max="260" step="10" />
        </div>
        <div class="control-group">
          <label>波長 λ: <span>{{ wavelength }} px</span></label>
          <input type="range" v-model.number="wavelength" min="20" max="60" step="2" />
        </div>
        <div class="control-group">
          <label>観測点 P の横位置 x: <span>{{ mousePos.x.toFixed(0) }}</span></label>
          <input type="range" v-model.number="mousePos.x" min="40" max="460" step="5" />
        </div>
        <div class="control-group">
          <label>観測点 P の奥行き y: <span>{{ mousePos.y.toFixed(0) }}</span></label>
          <input type="range" v-model.number="mousePos.y" min="30" max="330" step="5" />
        </div>
      </div>

      <div class="control-buttons">
        <div class="phase-toggle">
          <span class="toggle-label">波源の位相:</span>
          <button
            class="mode-btn"
            :class="{ active: phaseDiff === 0 }"
            @click="phaseDiff = 0"
          >
            同位相 (差 0)
          </button>
          <button
            class="mode-btn"
            :class="{ active: phaseDiff === 1 }"
            @click="phaseDiff = 1"
          >
            逆位相 (差 π)
          </button>
        </div>

        <div class="action-buttons">
          <button class="btn btn-secondary" @click="showNodalLines = !showNodalLines">
            {{ showNodalLines ? '双曲線を隠す' : '腹線・節線を表示' }}
          </button>
          <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
            {{ isPlaying ? '一時停止' : '再生' }}
          </button>
          <button class="btn btn-reset" @click="resetSim">リセット</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #0b1120 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
  box-sizing: border-box;
  max-width: 100%;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  margin-bottom: 0.65rem;
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
  margin: 0 0 0.7rem 0;
  padding: 8px 10px;
}

.btn-primary-play {
  background: #0284c7;
  color: #fff;
  border: none;
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
  color: #a1a1aa;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  flex-wrap: wrap;
  gap: 10px;
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
  gap: 4px;
  white-space: nowrap;
}

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-anti { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-node { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-crest { background: linear-gradient(135deg, #fef08a, #38bdf8); box-shadow: 0 0 6px #38bdf8; }
.dot-trough { background: #312e81; border: 1px solid #6366f1; }
.dot-probe { background: #facc15; box-shadow: 0 0 6px #facc15; }

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

.ortho-status-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
}

.three-ortho-badge.anti {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.48);
  color: #6ee7b7;
}

.three-ortho-badge.node {
  background: rgba(244, 63, 94, 0.16);
  border-color: rgba(244, 63, 94, 0.48);
  color: #fda4af;
}

.probe-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.7rem;
}

.probe-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0.5rem;
}

.probe-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #38bdf8;
}

.probe-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.probe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(105px, 1fr));
  gap: 0.5rem;
}

.stat-box {
  background: rgba(30, 41, 59, 0.5);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.stat-box.highlight {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.stat-box .label {
  font-size: 0.7rem;
  color: #94a3b8;
}

.stat-box .value {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.88rem;
  color: #f1f5f9;
}

.badge-status {
  color: #38bdf8 !important;
  font-size: 0.78rem !important;
}

.controls-panel {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
  width: 100%;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.phase-toggle {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.toggle-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.mode-btn {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.32rem 0.65rem;
  font-size: 0.76rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.btn {
  padding: 0.38rem 0.8rem;
  font-size: 0.78rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: rgba(30, 41, 59, 0.5);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.28);
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .canvas-wrapper {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    border-radius: 10px;
    padding: 6px 8px;
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
  .ortho-status-strip {
    justify-content: flex-start;
  }
  .three-ortho-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
