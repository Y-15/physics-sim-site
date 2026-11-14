<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎸</span>
        <h3>3D 弦の振動と定常波（メルデの実験）シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        両端を固定した弦を伝わる横波の重ね合わせ。弦の張力 <i>S</i>、線密度 ρ、弦の長さ <i>L</i> による波の速さ <i>v</i> = √(<i>S</i> / ρ) と、
        入射波（+<i>x</i>）＋反射波（−<i>x</i>）の合成による定常波の腹・節、固有振動数 <i>f</i><sub>n</sub> = (<i>n</i> / 2<i>L</i>)√(<i>S</i> / ρ) を3D実験台上でリアルタイム体感できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="select-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="select-btn" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 正面視点 (定常波断面)
        </button>
        <button class="select-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary compact-btn" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: animSpeed === 0.25 }" @click="animSpeed = 0.25">🐢 0.25x (観察)</button>
          <button :class="{ active: animSpeed === 0.5 }" @click="animSpeed = 0.5">🎯 0.5x (推奨)</button>
          <button :class="{ active: animSpeed === 1.0 }" @click="animSpeed = 1.0">1.0x (標準)</button>
          <button :class="{ active: animSpeed === 1.5 }" @click="animSpeed = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary compact-btn" @click="stepFrame(0.05)">
        ⏭ コマ送り (+0.05s)
      </button>
    </div>

    <div class="canvas-wrapper">
      <div ref="threeContainer" class="three-viewport"></div>
      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-c"></i>定常波（弦）</span>
          <span class="legend-item"><i class="dot-v"></i>振幅包絡線</span>
          <span class="legend-item"><i class="dot-r"></i>節 <b>N</b></span>
          <span class="legend-item"><i class="dot-g"></i>腹 <b>A</b></span>
          <template v-if="showDecomposition">
            <span class="legend-item"><i class="dot-inc"></i>入射波 (+x)</span>
            <span class="legend-item"><i class="dot-ref"></i>反射波 (-x)</span>
          </template>
        </div>
      </div>
      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <div class="mode-status-strip">
      <span class="three-ortho-badge">
        ✓ 固有モード: <strong>{{ harmonicMode }}倍振動 (n = {{ harmonicMode }})</strong> ／ <i>f</i><sub>{{ harmonicMode }}</sub> = {{ frequencyHz.toFixed(1) }} Hz
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span class="lbl-row"><span>振動モード <i>n</i>（倍振動数）:</span> <strong>n = {{ harmonicMode }}</strong></span>
            <div class="btn-group">
              <button
                v-for="m in [1, 2, 3, 4, 5]"
                :key="m"
                class="select-btn"
                :class="{ active: harmonicMode === m }"
                @click="harmonicMode = m"
              >
                n={{ m }} {{ m === 1 ? '(基本)' : `(${m}倍)` }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span class="lbl-row"><span>弦の張力 <i>S</i>:</span> <strong>{{ tensionN.toFixed(1) }} N</strong></span>
            <input type="range" v-model.number="tensionN" min="20" max="200" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span class="lbl-row"><span>弦の長さ <i>L</i>:</span> <strong>{{ lengthM.toFixed(2) }} m</strong></span>
            <input type="range" v-model.number="lengthM" min="0.4" max="1.5" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span class="lbl-row"><span>弦の線密度 ρ:</span> <strong>{{ linearDensityGpm.toFixed(1) }} g/m</strong></span>
            <input type="range" v-model.number="linearDensityGpm" min="0.5" max="8.0" step="0.5" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="toggleSound">
          {{ isPlayingSound ? '🔇 音を止める' : '♪ 固有音を聴く (Web Audio)' }}
        </button>
        <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
          {{ isPlaying ? '⏸ 振動を一時停止' : '▶ 振動を再生' }}
        </button>
        <button class="btn btn-accent" :class="{ off: !showDecomposition }" @click="showDecomposition = !showDecomposition">
          {{ showDecomposition ? '🔀 入射波・反射波 分解: ON' : '🔀 入射波・反射波 分解: OFF' }}
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">固有振動数 <i>f</i><sub>n</sub></span>
        <span class="value highlight">{{ frequencyHz.toFixed(1) }} <span class="unit">Hz</span></span>
        <span class="subtext"><i>f</i><sub>n</sub> = (n / 2L) v</span>
      </div>

      <div class="stat-card">
        <span class="label">弦を伝わる波の速さ <i>v</i></span>
        <span class="value">{{ waveSpeedMs.toFixed(1) }} <span class="unit">m/s</span></span>
        <span class="subtext"><i>v</i> = √(<i>S</i> / ρ)</span>
      </div>

      <div class="stat-card">
        <span class="label">定常波の波長 <i>λ</i><sub>n</sub></span>
        <span class="value">{{ wavelengthM.toFixed(3) }} <span class="unit">m</span></span>
        <span class="subtext"><i>λ</i><sub>n</sub> = 2L / n</span>
      </div>

      <div class="stat-card">
        <span class="label">腹の数 / 節の数</span>
        <span class="value">{{ harmonicMode }} <span class="unit">個 (腹)</span> / {{ harmonicMode + 1 }} <span class="unit">個 (節)</span></span>
        <span class="subtext">両端は常に固定端（節）</span>
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
const activeCam = ref('3d')
const isPlaying = ref(true)
const animSpeed = ref(0.5)
const showDecomposition = ref(true)

const harmonicMode = ref(2)       // n = 2
const tensionN = ref(80)          // S = 80 N
const lengthM = ref(0.8)          // L = 0.8 m
const linearDensityGpm = ref(2.0) // ρ = 2.0 g/m = 0.002 kg/m

const waveSpeedMs = computed(() => {
  const rho = linearDensityGpm.value * 1e-3
  return Math.sqrt(tensionN.value / rho)
})

const wavelengthM = computed(() => {
  return (2 * lengthM.value) / harmonicMode.value
})

const frequencyHz = computed(() => {
  return waveSpeedMs.value / wavelengthM.value
})

const resetDefaults = () => {
  harmonicMode.value = 2
  tensionN.value = 80
  lengthM.value = 0.8
  linearDensityGpm.value = 2.0
  animSpeed.value = 0.5
  showDecomposition.value = true
}

function getSpan() {
  return 5.4 + (lengthM.value - 0.4) * 4.2
}

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 395
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(1.95, Math.max(1.42, 1.56 / Math.max(0.68, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  const spanScale = Math.max(1.0, (getSpan() + 3.4) / 10.6)
  const s = ms * spanScale
  if (preset === 'side') {
    return { pos: [0.6, 0.15, 50.0 * s], target: [0.6, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0.6, 50.0 * s, -0.35], target: [0.6, 0, -0.55], fov: 14 }
  }
  return { pos: [0.85 * s, 5.3 * s, 14.4 * s], target: [0.6, 0.05, -0.45], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function stepFrame(delta = 0.05) {
  isPlaying.value = false
  simTime += delta
  updateStringFrame()
}

let resizeObs = null
let lastIsMob = false

// GCゼロ動的3Dチューブ生成
function createDynamicTube(segments, radialSegs, radius, material) {
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
    for (let i = 0; i < nPts; i++) {
      const pPrev = pts[Math.max(0, i - 1)]
      const pNext = pts[Math.min(nPts - 1, i + 1)]
      let tx = pNext.x - pPrev.x
      let ty = pNext.y - pPrev.y
      let tz = pNext.z - pPrev.z
      const tLen = Math.hypot(tx, ty, tz) || 1
      tx /= tLen; ty /= tLen; tz /= tLen

      let nx = ty
      let ny = -tx
      let nz = 0
      const nLen = Math.hypot(nx, ny, nz) || 1
      nx /= nLen; ny /= nLen

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

// Web Audio API サウンド合成
let audioCtx = null
let osc = null
let gainNode = null
const isPlayingSound = ref(false)

function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    gainNode = audioCtx.createGain()
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gainNode.connect(audioCtx.destination)
  } catch (e) {}
}

function updateSoundFreq() {
  if (osc && audioCtx) {
    const targetFreq = Math.min(2000, Math.max(50, frequencyHz.value))
    osc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.05)
  }
}

function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()

  if (isPlayingSound.value) {
    if (osc) {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {}
      osc = null
    }
    isPlayingSound.value = false
  } else {
    if (!audioCtx) return
    try {
      osc = audioCtx.createOscillator()
      osc.type = 'triangle'
      const targetFreq = Math.min(2000, Math.max(50, frequencyHz.value))
      osc.frequency.setValueAtTime(targetFreq, audioCtx.currentTime)
      osc.connect(gainNode)
      osc.start()
      isPlayingSound.value = true
    } catch (e) {}
  }
}

let simTime = 0
let rootGroup = null
let dynamicObjs = null

function clearGroup(group) {
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    if (child.children && child.children.length > 0) {
      clearGroup(child)
    }
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
      } else {
        if (child.material.map) child.material.map.dispose()
        child.material.dispose()
      }
    }
  }
}

function buildBracket3D(x1, x2, y, z, color, tickDir = 1) {
  const grp = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color })
  const len = Math.max(0.05, Math.abs(x2 - x1))
  const bar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.036, 0.036), mat)
  bar.position.set((x1 + x2) / 2, y, z)
  grp.add(bar)

  const tickGeo = new THREE.BoxGeometry(0.036, 0.22, 0.036)
  const t1 = new THREE.Mesh(tickGeo, mat)
  t1.position.set(x1, y + tickDir * 0.09, z)
  const t2 = new THREE.Mesh(tickGeo, mat)
  t2.position.set(x2, y + tickDir * 0.09, z)
  grp.add(t1, t2)
  return grp
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
      if (isPlaying.value) {
        simTime += dt * animSpeed.value * 1.15
      }
      updateStringFrame()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.01
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        rebuildBenchAndString()
        updateStringFrame()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx
  const grid = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b)
  grid.position.set(0.4, -3.95, -0.5)
  scene.add(grid)

  const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ color: 0x0b1222, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  )
  floorPlane.rotation.x = -Math.PI / 2
  floorPlane.position.set(0.4, -3.96, -0.5)
  scene.add(floorPlane)

  rootGroup = new THREE.Group()
  scene.add(rootGroup)

  rebuildBenchAndString()
  updateStringFrame()
}

function rebuildBenchAndString() {
  if (!rootGroup) return
  clearGroup(rootGroup)

  const span = getSpan()
  const leftX = -span / 2
  const rightX = span / 2
  const n = harmonicMode.value
  const amp = 1.08
  const mob = getMobScale() > 1.01
  const sMult = mob ? 1.56 : 1.0

  // 1. Acoustic Lab Bench Base
  const benchGeo = new THREE.BoxGeometry(span + 1.5, 0.24, 1.8)
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.45 })
  const benchMesh = new THREE.Mesh(benchGeo, benchMat)
  benchMesh.position.set(0, -2.07, 0)
  rootGroup.add(benchMesh)

  const benchEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(benchGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
  )
  benchEdge.position.copy(benchMesh.position)
  rootGroup.add(benchEdge)

  // Center equilibrium line
  const eqLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(leftX, 0, 0), new THREE.Vector3(rightX, 0, 0)]),
    new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.7 })
  )
  eqLine.computeLineDistances()
  rootGroup.add(eqLine)

  // 2. Left Melde Oscillator Driver & Post / Right Bridge & Grooved Pulley
  const bridgeGeo = new THREE.BoxGeometry(0.32, 2.02, 0.96)
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.55, roughness: 0.3 })
  const leftBridge = new THREE.Mesh(bridgeGeo, bridgeMat)
  leftBridge.position.set(leftX - 0.16, -1.01, 0)
  const rightBridge = new THREE.Mesh(bridgeGeo, bridgeMat)
  rightBridge.position.set(rightX + 0.16, -1.01, 0)
  rootGroup.add(leftBridge, rightBridge)

  const driverBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.42, 18),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.35, metalness: 0.6 })
  )
  driverBody.rotation.z = Math.PI / 2
  driverBody.position.set(leftX - 0.42, 0, 0)
  rootGroup.add(driverBody)

  // Grooved pulley wheel + hanging tension weight
  const pulleyHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.16, 24).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 })
  )
  pulleyHub.position.set(rightX + 0.50, -0.18, 0)
  const pulleyRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.045, 10, 28),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 })
  )
  pulleyRim.position.copy(pulleyHub.position)
  rootGroup.add(pulleyHub, pulleyRim)

  const hangWireGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(rightX, 0, 0),
    new THREE.Vector3(rightX + 0.50, 0.14, 0),
    new THREE.Vector3(rightX + 0.83, -0.18, 0),
    new THREE.Vector3(rightX + 0.83, -1.30, 0)
  ])
  rootGroup.add(new THREE.Line(hangWireGeo, new THREE.LineBasicMaterial({ color: 0xcbd5e1 })))

  const weightRadius = 0.24 + (tensionN.value / 200) * 0.18
  const weightMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(weightRadius, weightRadius, 0.54, 24),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.3, metalness: 0.55, roughness: 0.25 })
  )
  weightMesh.position.set(rightX + 0.83, -1.56, 0)
  rootGroup.add(weightMesh)

  const tensionArrow = createVectorArrow3D({ color: 0xfacc15, shaftRadius: 0.045, headRadius: 0.13, headLength: 0.3 })
  tensionArrow.setVector(new THREE.Vector3(rightX + 0.83, -1.85, 0), new THREE.Vector3(0, -1, 0), 0.75)
  rootGroup.add(tensionArrow)

  const tensionLbl = createTextSprite(
    mob ? `S=${tensionN.value.toFixed(0)}N` : `張力 S = ${tensionN.value.toFixed(0)} N`,
    {
      color: '#fef08a',
      borderColor: '#f59e0b',
      scale: 0.43 * sMult
    }
  )
  tensionLbl.position.set(rightX + (mob ? 1.62 : 1.82), -1.65, 0.25)
  rootGroup.add(tensionLbl)

  // 3. Standing Wave Translucent Envelope Sheet + Violet Envelope Tubes
  const samples = 150
  const envUpPts = []
  const envDownPts = []
  const sheetArr = new Float32Array(samples * 18)
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    const x = leftX + span * u
    const y = amp * Math.abs(Math.sin(n * Math.PI * u))
    envUpPts.push(new THREE.Vector3(x, y, 0))
    envDownPts.push(new THREE.Vector3(x, -y, 0))
    if (i < samples) {
      const uN = (i + 1) / samples
      const xN = leftX + span * uN
      const yN = amp * Math.abs(Math.sin(n * Math.PI * uN))
      const b = i * 18
      sheetArr[b] = x; sheetArr[b + 1] = y; sheetArr[b + 2] = 0
      sheetArr[b + 3] = xN; sheetArr[b + 4] = yN; sheetArr[b + 5] = 0
      sheetArr[b + 6] = x; sheetArr[b + 7] = -y; sheetArr[b + 8] = 0
      sheetArr[b + 9] = xN; sheetArr[b + 10] = yN; sheetArr[b + 11] = 0
      sheetArr[b + 12] = xN; sheetArr[b + 13] = -yN; sheetArr[b + 14] = 0
      sheetArr[b + 15] = x; sheetArr[b + 16] = -y; sheetArr[b + 17] = 0
    }
  }
  const sheetGeo = new THREE.BufferGeometry()
  sheetGeo.setAttribute('position', new THREE.BufferAttribute(sheetArr, 3))
  rootGroup.add(new THREE.Mesh(
    sheetGeo,
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
  ))

  const envMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.65
  })
  const envUpTube = createDynamicTube(samples, 6, 0.022, envMat)
  envUpTube.updateFromPoints(envUpPts)
  const envDnTube = createDynamicTube(samples, 6, 0.022, envMat)
  envDnTube.updateFromPoints(envDownPts)
  rootGroup.add(envUpTube.mesh, envDnTube.mesh)

  // 4. Thick 3D String Tube (thickness scales with linear density ρ!) + glowing beads
  const strRadius = 0.036 + (linearDensityGpm.value / 8.0) * 0.036
  const strTube = createDynamicTube(
    samples,
    10,
    strRadius,
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.18,
      metalness: 0.15
    })
  )
  rootGroup.add(strTube.mesh)
  const strPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())

  const beadCount = 41
  const beads = []
  const beadGeo = new THREE.SphereGeometry(strRadius * 1.45, 14, 14)
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.6,
    roughness: 0.2
  })
  for (let i = 0; i < beadCount; i++) {
    const u = i / (beadCount - 1)
    const b = new THREE.Mesh(beadGeo, beadMat)
    b.userData = { u, x: leftX + span * u }
    rootGroup.add(b)
    beads.push(b)
  }

  // 5. Nodes (N: crimson ring + sphere) and Antinodes (A: gold sphere + dashed guide)
  // 貪欲距離チェックでL=0.4m・n=5でもラベル重複ゼロ
  const placedNodeXs = []
  for (let k = 0; k <= n; k++) {
    const nx = leftX + (k / n) * span
    const nSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.72 })
    )
    nSphere.position.set(nx, 0, 0)
    rootGroup.add(nSphere)

    const nRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.185, 0.032, 10, 24).rotateY(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.55 })
    )
    nRing.position.set(nx, 0, 0)
    rootGroup.add(nRing)

    const minSep = mob ? 2.6 : 1.65
    const isEnd = k === 0 || k === n
    const okDist = placedNodeXs.every(px => Math.abs(nx - px) >= minSep)
    const nearEnd = !isEnd && Math.abs(rightX - nx) < minSep
    if ((isEnd && (k === 0 || Math.abs(nx - leftX) >= minSep)) || (okDist && !nearEnd)) {
      placedNodeXs.push(nx)
      const nLbl = createTextSprite(mob ? '節' : '節 (N)', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.4 * sMult })
      nLbl.position.set(nx, -1.48, 0.72)
      rootGroup.add(nLbl)
    }
  }

  const antinodeSpheres = []
  const placedAntiXs = []
  for (let k = 0; k < n; k++) {
    const u = (k + 0.5) / n
    const ax = leftX + u * span
    const aSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.78 })
    )
    aSphere.userData = { u, ax }
    rootGroup.add(aSphere)
    antinodeSpheres.push(aSphere)

    const vGuide = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ax, -amp, 0), new THREE.Vector3(ax, amp, 0)]),
      new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.11, gapSize: 0.09, transparent: true, opacity: 0.45 })
    )
    vGuide.computeLineDistances()
    rootGroup.add(vGuide)

    const minAntiSep = mob ? 2.6 : 1.65
    const okAntiDist = placedAntiXs.every(px => Math.abs(ax - px) >= minAntiSep)
    if (okAntiDist) {
      placedAntiXs.push(ax)
      const aLbl = createTextSprite(mob ? '腹' : '腹 (A)', { color: '#fef08a', borderColor: '#facc15', scale: 0.4 * sMult })
      aLbl.position.set(ax, 1.38, -0.62)
      rootGroup.add(aLbl)
    }
  }

  // 6. Incident (+x) & Reflected (-x) Traveling Wave Decomposition in Rear Z-Lanes
  const decGroup = new THREE.Group()
  decGroup.visible = showDecomposition.value
  rootGroup.add(decGroup)

  const incY = 2.15
  const incZ = -1.75
  const refY = 3.25
  const refZ = -2.95
  const ampComp = 0.35

  const incRail = new THREE.Mesh(
    new THREE.BoxGeometry(span, 0.03, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.8 })
  )
  incRail.position.set(0, incY, incZ)
  const refRail = new THREE.Mesh(
    new THREE.BoxGeometry(span, 0.03, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.8 })
  )
  refRail.position.set(0, refY, refZ)
  decGroup.add(incRail, refRail)

  const incTube = createDynamicTube(
    samples,
    8,
    0.038,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.55, roughness: 0.25 })
  )
  const refTube = createDynamicTube(
    samples,
    8,
    0.038,
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.55, roughness: 0.25 })
  )
  decGroup.add(incTube.mesh, refTube.mesh)

  const incArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.038, headRadius: 0.11, headLength: 0.28 })
  incArrow.setVector(new THREE.Vector3(rightX - 1.35, incY + 0.50, incZ), new THREE.Vector3(1, 0, 0), 1.15)
  const refArrow = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.038, headRadius: 0.11, headLength: 0.28 })
  refArrow.setVector(new THREE.Vector3(leftX + 1.35, refY + 0.50, refZ), new THREE.Vector3(-1, 0, 0), 1.15)
  decGroup.add(incArrow, refArrow)

  const incLbl = createTextSprite(mob ? '入射波 (+x)' : '入射波 y₁ (+x →)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.4 * sMult
  })
  incLbl.position.set(Math.max(0.8, rightX - 2.3), incY + 0.54, incZ)
  const refLbl = createTextSprite(mob ? '反射波 (-x)' : '反射波 y₂ (← -x)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    scale: 0.4 * sMult
  })
  refLbl.position.set(Math.min(-0.8, leftX + 2.3), refY + 0.56, refZ)
  decGroup.add(incLbl, refLbl)

  const uProbe = 0.5 / n
  const xProbe = leftX + span * uProbe
  const sumLinkGeo = new THREE.BufferGeometry()
  sumLinkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3))
  const sumLink = new THREE.Line(
    sumLinkGeo,
    new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.13, gapSize: 0.09, transparent: true, opacity: 0.65 })
  )
  decGroup.add(sumLink)

  const incPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())
  const refPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())

  // 7. Length L bracket & Wavelength λ_n bracket cleanly separated in front
  rootGroup.add(buildBracket3D(leftX, rightX, -2.42, 1.45, 0x94a3b8, 1))
  const lenLbl = createTextSprite(
    mob ? `L = ${lengthM.value.toFixed(2)} m (n=${n})` : `弦長 L = ${lengthM.value.toFixed(2)} m (${n}倍振動)`,
    { color: '#e2e8f0', borderColor: '#64748b', scale: 0.43 * sMult }
  )
  lenLbl.position.set(0, -2.75, 1.45)
  rootGroup.add(lenLbl)

  const lamEnd = n >= 2 ? leftX + (2 / n) * span : rightX
  const lamText = mob
    ? (n >= 2 ? `λ${n} = ${wavelengthM.value.toFixed(2)} m` : `L=λ₁/2 (${wavelengthM.value.toFixed(2)}m)`)
    : (n >= 2 ? `λ${n} = ${wavelengthM.value.toFixed(3)} m` : `L = λ₁/2 (λ₁ = ${wavelengthM.value.toFixed(3)} m)`)
  rootGroup.add(buildBracket3D(leftX, lamEnd, -3.28, 2.35, 0x38bdf8, 1))
  const lamLbl = createTextSprite(lamText, { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.42 * sMult })
  lamLbl.position.set((leftX + lamEnd) / 2, -3.65, 2.35)
  rootGroup.add(lamLbl)

  dynamicObjs = {
    span,
    leftX,
    amp,
    samples,
    strTube,
    strPts,
    beads,
    antinodeSpheres,
    decGroup,
    incTube,
    refTube,
    incPts,
    refPts,
    incY,
    incZ,
    refY,
    refZ,
    ampComp,
    uProbe,
    xProbe,
    sumLinkGeo,
    sumLink
  }
}

function updateStringFrame() {
  if (!dynamicObjs) return
  const {
    span,
    leftX,
    amp,
    samples,
    strTube,
    strPts,
    beads,
    antinodeSpheres,
    decGroup,
    incTube,
    refTube,
    incPts,
    refPts,
    incY,
    incZ,
    refY,
    refZ,
    ampComp,
    uProbe,
    xProbe,
    sumLinkGeo,
    sumLink
  } = dynamicObjs

  const n = harmonicMode.value
  const baseOmega = 2.6
  const omega = baseOmega * (1 + 0.45 * (n - 1)) * Math.sqrt(Math.max(0.5, waveSpeedMs.value / 200))
  const wt = omega * simTime
  const timeFactor = Math.cos(wt)

  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    const x = leftX + span * u
    const y = amp * Math.sin(n * Math.PI * u) * timeFactor
    strPts[i].set(x, y, 0)

    if (showDecomposition.value) {
      incPts[i].set(x, incY + ampComp * Math.sin(n * Math.PI * u - wt), incZ)
      refPts[i].set(x, refY + ampComp * Math.sin(n * Math.PI * u + wt), refZ)
    }
  }
  strTube.updateFromPoints(strPts)

  decGroup.visible = showDecomposition.value
  if (showDecomposition.value) {
    incTube.updateFromPoints(incPts)
    refTube.updateFromPoints(refPts)

    const sArr = sumLinkGeo.getAttribute('position').array
    sArr[0] = xProbe; sArr[1] = refY + ampComp * Math.sin(n * Math.PI * uProbe + wt); sArr[2] = refZ
    sArr[3] = xProbe; sArr[4] = incY + ampComp * Math.sin(n * Math.PI * uProbe - wt); sArr[5] = incZ
    sArr[6] = xProbe; sArr[7] = amp * Math.sin(n * Math.PI * uProbe) * timeFactor; sArr[8] = 0
    sumLinkGeo.getAttribute('position').needsUpdate = true
    sumLink.computeLineDistances()
  }

  for (const b of beads) {
    const u = b.userData.u
    b.position.set(b.userData.x, amp * Math.sin(n * Math.PI * u) * timeFactor, 0)
  }

  for (const a of antinodeSpheres) {
    const u = a.userData.u
    a.position.set(a.userData.ax, amp * Math.sin(n * Math.PI * u) * timeFactor, 0)
  }
}

watch(frequencyHz, () => {
  updateSoundFreq()
})

watch([harmonicMode, tensionN, lengthM, linearDensityGpm], () => {
  rebuildBenchAndString()
  setCameraPreset(activeCam.value, 0.25)
  updateStringFrame()
})

watch(showDecomposition, () => {
  updateStringFrame()
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
  if (osc) {
    try { osc.stop(); osc.disconnect() } catch (e) {}
  }
  if (audioCtx) {
    try { audioCtx.close() } catch (e) {}
  }
})
</script>

<style scoped>
.sim-container {
  background: linear-gradient(145deg, #0f172a, #080c16);
  border-radius: 14px;
  padding: 1.25rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  margin: 1.5rem 0;
  border: 1px solid rgba(148, 163, 184, 0.18);
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}

.sim-header .icon {
  font-size: 1.45rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.18rem;
  color: #38bdf8;
}

.three-badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.4);
  font-weight: 700;
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 0.8rem 0;
  line-height: 1.45;
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
.preset-group .select-btn {
  flex: 0 1 auto;
  white-space: nowrap;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: 0.75rem;
}
.compact-btn {
  padding: 6px 12px !important;
  font-size: 0.82rem !important;
}
.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px !important;
  padding: 5px 10px !important;
}
.speed-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #cbd5e1;
  white-space: nowrap;
}
.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
}
.speed-btn-group button {
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #334155;
  color: #cbd5e1;
  font-size: 0.74rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.speed-btn-group button.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  font-weight: 700;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 395px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #080c16;
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
.dot-c { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-v { background: #c084fc; box-shadow: 0 0 6px #a855f7; }
.dot-r { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-g { background: #facc15; box-shadow: 0 0 6px #facc15; }
.dot-inc { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; border: 1.5px solid #e0f2fe; }
.dot-ref { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; border: 1.5px solid #ffe4e6; }

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
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.42);
  color: #7dd3fc;
  font-size: 0.76rem;
  font-weight: 700;
  max-width: 100%;
  box-sizing: border-box;
}

.control-panel {
  margin-top: 0.75rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 10px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 0.85rem;
}

.control-group label {
  display: flex;
  flex-direction: column;
  align-items: stretch !important;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #cbd5e1;
  width: 100%;
}

.lbl-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
}

.control-group strong {
  color: #38bdf8;
}

.control-group input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.select-btn {
  flex: 1 1 auto;
  min-width: 60px;
  padding: 0.35rem 0.55rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: bold;
}

.button-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #0284c7;
  color: #ffffff;
}
.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.btn-secondary:hover {
  background: #475569;
}

.btn-accent {
  background: rgba(168, 85, 247, 0.22);
  color: #e9d5ff;
  border: 1px solid rgba(168, 85, 247, 0.5);
}
.btn-accent.off {
  background: #334155;
  color: #94a3b8;
  border-color: #475569;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(130px, 100%), 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
}

.stat-card {
  background: #1e293b;
  padding: 0.7rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 3px solid #38bdf8;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.stat-card .value {
  font-size: 1.05rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #38bdf8;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.95rem;
  }
  .canvas-wrapper {
    height: 325px;
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
