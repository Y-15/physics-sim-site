<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">📢</span>
        <h3>3D 気柱の共鳴・定常波シミュレーター</h3>
        <span class="three-badge">Three.js 3D Acoustic Lab</span>
      </div>
      <p class="subtitle">
        音叉と3Dガラス気柱（閉管の水柱ピストン・開管）の共鳴実験。縦波の空気分子の粗密（高圧・低圧）と変位/圧力の定常波、開口端補正 Δ<i>l</i> を立体的に観察できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="type-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="type-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="type-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-play" @click="togglePlay">
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
      <button class="btn btn-secondary" @click="stepSim(0.05)">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="resetSim">🔄 リセット</button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="canvas-wrapper">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-wave" :class="{ pressure: !showDisplacement }"></i>{{ showDisplacement ? '変位波 (開口=腹)' : '圧力波 (閉端=腹)' }}</span>
          <span class="legend-item"><i class="dot-anti"></i>腹 (最大振幅)</span>
          <span class="legend-item"><i class="dot-node"></i>節 (振幅 0)</span>
          <span class="legend-item"><i class="dot-dense"></i>密 ↔ <i class="dot-rare"></i>疎</span>
          <span class="legend-item"><i class="dot-dl"></i>開口端補正 Δ<i>l</i></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 共鳴状態バッジ（モバイル非重複のためビューポート直下へ独立配置） -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :class="{ resonant: isResonant }">
        {{ isResonant ? `🔥 共鳴発生中！ ${resonanceInfo.modeName}（振幅最大）` : `通常振動（最寄り共鳴とのズレ ${resonanceOffsetCm.toFixed(1)} cm）` }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>管の種類:</span>
            <div class="pipe-type-buttons">
              <button class="type-btn" :class="{ active: pipeType === 'closed' }" @click="pipeType = 'closed'">
                閉管 (水面ピストン)
              </button>
              <button class="type-btn" :class="{ active: pipeType === 'open' }" @click="pipeType = 'open'">
                開管 (両側開口)
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>音叉の振動数 <i>f</i>: <strong>{{ freq }} Hz</strong></span>
            <input type="range" v-model.number="freq" min="300" max="900" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>管の長さ <i>L</i>: <strong>{{ pipeLengthCm.toFixed(1) }} cm</strong></span>
            <input type="range" v-model.number="pipeLengthCm" min="15" max="85" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>開口端補正 Δ<i>l</i>: <strong>{{ deltaLCm.toFixed(1) }} cm</strong></span>
            <input type="range" v-model.number="deltaLCm" min="0" max="4" step="0.5" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="snapToResonance">
          🎯 最寄りの共鳴長さに自動調整
        </button>
        <button class="btn btn-secondary" @click="toggleWaveType">
          {{ showDisplacement ? '波の表示: 変位波 (開口端=腹)' : '波の表示: 圧力変化 (開口端=節)' }}
        </button>
        <button class="btn btn-outline" @click="setHarmonicPreset(1)">
          {{ pipeType === 'closed' ? '第1共鳴 (基本・1倍)' : '基本振動 (n=1)' }}
        </button>
        <button class="btn btn-outline" @click="setHarmonicPreset(2)">
          {{ pipeType === 'closed' ? '第2共鳴 (3倍振動)' : '2倍振動 (n=2)' }}
        </button>
        <button class="btn btn-outline" @click="setHarmonicPreset(3)">
          {{ pipeType === 'closed' ? '第3共鳴 (5倍振動)' : '3倍振動 (n=3)' }}
        </button>
      </div>
    </div>

    <!-- 物理量リアルタイム表示モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">音速 <i>V</i> (常温15℃)</span>
        <span class="value">340 <span class="unit">m/s</span></span>
        <span class="subtext">331.5 + 0.6 × 15</span>
      </div>

      <div class="stat-card">
        <span class="label">音波の波長 λ</span>
        <span class="value">{{ wavelengthCm.toFixed(1) }} <span class="unit">cm</span></span>
        <span class="subtext">λ = <i>V</i> / <i>f</i></span>
      </div>

      <div class="stat-card">
        <span class="label">実効長さ <i>L</i><sub>eff</sub></span>
        <span class="value">{{ effectiveLengthCm.toFixed(1) }} <span class="unit">cm</span></span>
        <span class="subtext">{{ pipeType === 'closed' ? 'L + Δl' : 'L + 2Δl' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">共鳴モード判定</span>
        <span class="value" :class="{ highlight: isResonant }">{{ modeText }}</span>
        <span class="subtext">共鳴ズレ: {{ resonanceOffsetCm.toFixed(1) }} cm</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(0.5)

const pipeType = ref('closed') // 'closed' or 'open'
const freq = ref(500) // Hz
const pipeLengthCm = ref(49.0) // cm (500Hz + 2cm = 51cm -> exact 3倍振動!)
const deltaLCm = ref(2.0) // cm
const showDisplacement = ref(true)

const soundSpeed = 340 // m/s
const wavelengthCm = computed(() => (soundSpeed / freq.value) * 100)

const effectiveLengthCm = computed(() => {
  if (pipeType.value === 'closed') {
    return pipeLengthCm.value + deltaLCm.value
  } else {
    return pipeLengthCm.value + 2 * deltaLCm.value
  }
})

const resonanceInfo = computed(() => {
  const lambda = wavelengthCm.value
  const effL = effectiveLengthCm.value

  if (pipeType.value === 'closed') {
    const mApprox = Math.max(1, Math.round(effL / (lambda / 4)))
    const mOdd = mApprox % 2 === 0 ? (effL > mApprox * (lambda / 4) ? mApprox + 1 : Math.max(1, mApprox - 1)) : mApprox
    const exactEffL = mOdd * (lambda / 4)
    const exactPipeL = exactEffL - deltaLCm.value
    const diff = Math.abs(effL - exactEffL)
    return {
      m: mOdd,
      modeName: `${mOdd}倍振動 (閉管)`,
      exactPipeL,
      diff,
      isResonant: diff < 1.5
    }
  } else {
    const nApprox = Math.max(1, Math.round(effL / (lambda / 2)))
    const exactEffL = nApprox * (lambda / 2)
    const exactPipeL = exactEffL - 2 * deltaLCm.value
    const diff = Math.abs(effL - exactEffL)
    return {
      m: nApprox,
      modeName: `${nApprox}倍振動 (開管)`,
      exactPipeL,
      diff,
      isResonant: diff < 1.5
    }
  }
})

const isResonant = computed(() => resonanceInfo.value.isResonant)
const modeText = computed(() => (isResonant.value ? resonanceInfo.value.modeName : '非共鳴'))
const resonanceOffsetCm = computed(() => resonanceInfo.value.diff)

const snapToResonance = () => {
  const target = Math.max(15, Math.min(85, resonanceInfo.value.exactPipeL))
  pipeLengthCm.value = Math.round(target * 2) / 2
}

const toggleWaveType = () => {
  showDisplacement.value = !showDisplacement.value
}

function setHarmonicPreset(order) {
  if (pipeType.value === 'closed') {
    const mOdd = order * 2 - 1 // 1, 3, 5
    const lambda = wavelengthCm.value
    let targetL = mOdd * (lambda / 4) - deltaLCm.value
    if (targetL < 15 || targetL > 85) {
      // Adjust freq cleanly into range
      const desiredEff = order === 1 ? 20 : order === 2 ? 51 : 82
      const desiredLambda = (desiredEff * 4) / mOdd
      const newFreq = Math.min(900, Math.max(300, Math.round((soundSpeed * 100) / desiredLambda / 10) * 10))
      freq.value = newFreq
      targetL = mOdd * ((soundSpeed / newFreq) * 100 / 4) - deltaLCm.value
    }
    pipeLengthCm.value = Math.max(15, Math.min(85, Math.round(targetL * 2) / 2))
  } else {
    const n = order // 1, 2, 3
    const lambda = wavelengthCm.value
    let targetL = n * (lambda / 2) - 2 * deltaLCm.value
    if (targetL < 15 || targetL > 85) {
      const desiredEff = order === 1 ? 34 : order === 2 ? 68 : 75
      const desiredLambda = (desiredEff * 2) / n
      const newFreq = Math.min(900, Math.max(300, Math.round((soundSpeed * 100) / desiredLambda / 10) * 10))
      freq.value = newFreq
      targetL = n * ((soundSpeed / newFreq) * 100 / 2) - 2 * deltaLCm.value
    }
    pipeLengthCm.value = Math.max(15, Math.min(85, Math.round(targetL * 2) / 2))
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stepSim(dt = 0.05) {
  isPlaying.value = false
  simTime += dt
  updateResonanceFrame()
}

function resetSim() {
  pipeType.value = 'closed'
  freq.value = 500
  pipeLengthCm.value = 49.0
  deltaLCm.value = 2.0
  showDisplacement.value = true
  simTime = 0
  isPlaying.value = true
}

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 400
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(2.1, Math.max(1.28, 1.85 / Math.max(0.72, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  const cx = 0.1
  if (preset === 'front') {
    return { pos: [cx, 0.25, 44.0 * ms], target: [cx, 0.15, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 44.0 * ms, 0.35], target: [cx, 0, 0], fov: 14 }
  }
  return { pos: [cx - 0.6, 4.4 * ms, 12.6 * ms], target: [cx, 0.1, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let simTime = 0
let rootGroup = null
let dynState = null
let resizeObs = null
let lastIsMob = false

// 260 air molecules inside the air column (u in [0, 1], r, theta)
const MOLECULE_COUNT = 260
const airMoleculesData = Array.from({ length: MOLECULE_COUNT }, (_, idx) => {
  const r = Math.sqrt(((idx * 37) % MOLECULE_COUNT) / MOLECULE_COUNT) * 0.96
  const theta = idx * 2.3999632 // golden angle for uniform non-clumping distribution
  return {
    u: (idx + 0.5) / MOLECULE_COUNT,
    y: r * Math.sin(theta),
    z: r * Math.cos(theta)
  }
})

// 3D world scale: 10 cm = 1.04 units
const CM_TO_3D = 0.104
const PIPE_START_X = -4.05
const FULL_TUBE_CM = 92.0
const PIPE_RADIUS = 1.12
const WAVE_SAMPLES = 120

// Label cache map to avoid rebuilding CanvasTexture when unchanged
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

/**
 * Create a 4-sided 3D diamond-cross-section spine ribbon BufferGeometry for thick luminous waves
 */
function createWaveRibbonGeo(samples) {
  // 4 verts per sample (top/bottom in Y, front/back in Z)
  const verts = new Float32Array((samples + 1) * 4 * 3)
  const indices = []
  for (let i = 0; i < samples; i++) {
    const b0 = i * 4
    const b1 = (i + 1) * 4
    for (let k = 0; k < 4; k++) {
      const kn = (k + 1) % 4
      indices.push(b0 + k, b1 + k, b1 + kn)
      indices.push(b0 + k, b1 + kn, b0 + kn)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  geo.setIndex(indices)
  return geo
}

function updateWaveRibbonGeo(geo, xArr, yArr, radius = 0.042) {
  const pos = geo.getAttribute('position')
  const arr = pos.array
  for (let i = 0; i < xArr.length; i++) {
    const x = xArr[i]
    const y = yArr[i]
    const base = i * 12
    // v0: +Y
    arr[base + 0] = x; arr[base + 1] = y + radius; arr[base + 2] = 0
    // v1: +Z
    arr[base + 3] = x; arr[base + 4] = y; arr[base + 5] = radius
    // v2: -Y
    arr[base + 6] = x; arr[base + 7] = y - radius; arr[base + 8] = 0
    // v3: -Z
    arr[base + 9] = x; arr[base + 10] = y; arr[base + 11] = -radius
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastIsMob = getMobScale() > 1.05

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 130,
    onFrame: (dt) => {
      if (isPlaying.value) {
        simTime += dt * timeScale.value
      }
      updateResonanceFrame()
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

  const { scene } = threeCtx

  // Dual-tone acoustic lab floor grid
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  grid.position.y = -2.25
  scene.add(grid)

  // Optical/acoustic bench base rail + cm scale ticks
  const benchGroup = new THREE.Group()
  const railMesh = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.16, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.55 })
  )
  railMesh.position.set(0.35, -2.15, 0)
  benchGroup.add(railMesh)

  const railAccent = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.03, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
  )
  railAccent.position.set(0.35, -2.06, 0.88)
  benchGroup.add(railAccent)

  // Ruler scale ticks every 10 cm from 0 to 90 cm
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x64748b })
  for (let cm = 0; cm <= 90; cm += 10) {
    const tx = PIPE_START_X + cm * CM_TO_3D
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.06, 0.25), tickMat)
    tick.position.set(tx, -2.04, 0.72)
    benchGroup.add(tick)
  }
  scene.add(benchGroup)

  rootGroup = new THREE.Group()
  scene.add(rootGroup)

  rebuildTubeScene()
  updateResonanceFrame()
}

function rebuildTubeScene() {
  if (!rootGroup) return
  clearGroup(rootGroup)
  labelCache.clear()

  const pipeLen = pipeLengthCm.value * CM_TO_3D
  const deltaL = deltaLCm.value * CM_TO_3D
  const pipeEndX = PIPE_START_X + pipeLen
  const fullTubeLen = FULL_TUBE_CM * CM_TO_3D
  const visualTubeLen = pipeType.value === 'closed' ? fullTubeLen : pipeLen
  const visualTubeEndX = PIPE_START_X + visualTubeLen

  // 1. 3D Translucent Glass Acoustic Pipe
  const cylGeo = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, visualTubeLen, 40, 1, true)
  cylGeo.rotateZ(Math.PI / 2)
  const cylMat = new THREE.MeshPhysicalMaterial({
    color: isResonant.value ? 0xfda4af : 0xbae6fd,
    emissive: isResonant.value ? 0xe11d48 : 0x0284c7,
    emissiveIntensity: isResonant.value ? 0.16 : 0.06,
    transparent: true,
    opacity: 0.19,
    roughness: 0.1,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const pipeMesh = new THREE.Mesh(cylGeo, cylMat)
  pipeMesh.position.set(PIPE_START_X + visualTubeLen / 2, 0, 0)
  rootGroup.add(pipeMesh)

  // Specular highlight stripe along top of glass cylinder
  const glossGeo = new THREE.CylinderGeometry(PIPE_RADIUS + 0.01, PIPE_RADIUS + 0.01, visualTubeLen, 20, 1, true, -0.18, 0.36)
  glossGeo.rotateZ(Math.PI / 2)
  const glossMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glossStrip = new THREE.Mesh(glossGeo, glossMat)
  glossStrip.position.set(PIPE_START_X + visualTubeLen / 2, 0, 0)
  rootGroup.add(glossStrip)

  // Tube support rings & stands
  const rimGeo = new THREE.TorusGeometry(PIPE_RADIUS, 0.052, 14, 44)
  rimGeo.rotateY(Math.PI / 2)
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.72, roughness: 0.25 })
  const leftRim = new THREE.Mesh(rimGeo, rimMat)
  leftRim.position.set(PIPE_START_X, 0, 0)
  rootGroup.add(leftRim)

  const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 })
  const supportXs = [PIPE_START_X + 0.55, Math.max(PIPE_START_X + 1.2, visualTubeEndX - 0.55)]
  for (const sx of supportXs) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(PIPE_RADIUS + 0.03, 0.04, 10, 36), standMat)
    collar.rotation.y = Math.PI / 2
    collar.position.set(sx, 0, 0)
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.98, 12), standMat)
    post.position.set(sx, -PIPE_RADIUS - 0.48, 0)
    rootGroup.add(collar, post)
  }

  // 2. Closed End (Translucent Blue Water Column + Meniscus Piston) vs Open End
  let waterSurfaceMesh = null
  if (pipeType.value === 'closed') {
    const rightRim = new THREE.Mesh(rimGeo, rimMat)
    rightRim.position.set(visualTubeEndX, 0, 0)
    rootGroup.add(rightRim)

    // Closed back cap of glass tube
    const capMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(PIPE_RADIUS + 0.04, PIPE_RADIUS + 0.04, 0.14, 36).rotateZ(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.55, roughness: 0.35 })
    )
    capMesh.position.set(visualTubeEndX + 0.07, 0, 0)
    rootGroup.add(capMesh)

    const waterLen = Math.max(0.15, visualTubeEndX - pipeEndX)
    const waterGeo = new THREE.CylinderGeometry(PIPE_RADIUS - 0.03, PIPE_RADIUS - 0.03, waterLen, 36)
    waterGeo.rotateZ(Math.PI / 2)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.32,
      transparent: true,
      opacity: 0.46,
      roughness: 0.12,
      metalness: 0.1,
      depthWrite: false
    })
    const waterCol = new THREE.Mesh(waterGeo, waterMat)
    waterCol.position.set(pipeEndX + waterLen / 2, 0, 0)
    rootGroup.add(waterCol)

    // Crisp glowing water meniscus disk + outer ring marking exact closed boundary
    const meniscusGeo = new THREE.CircleGeometry(PIPE_RADIUS - 0.02, 36)
    meniscusGeo.rotateY(-Math.PI / 2)
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    })
    waterSurfaceMesh = new THREE.Mesh(meniscusGeo, meniscusMat)
    waterSurfaceMesh.position.set(pipeEndX, 0, 0)
    rootGroup.add(waterSurfaceMesh)

    const meniscusRing = new THREE.Mesh(
      new THREE.TorusGeometry(PIPE_RADIUS - 0.02, 0.042, 12, 40).rotateY(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.6 })
    )
    meniscusRing.position.set(pipeEndX, 0, 0)
    rootGroup.add(meniscusRing)
  } else {
    const rightRim = new THREE.Mesh(rimGeo, rimMat)
    rightRim.position.set(pipeEndX, 0, 0)
    rootGroup.add(rightRim)
  }

  // 3. Open-End Correction Δl glowing collars & bracket bars
  if (deltaL > 0.02) {
    const dlGeo = new THREE.CylinderGeometry(PIPE_RADIUS * 1.01, PIPE_RADIUS * 1.01, deltaL, 28, 1, true)
    dlGeo.rotateZ(Math.PI / 2)
    const dlMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.34
    })
    const leftDl = new THREE.Mesh(dlGeo, dlMat)
    leftDl.position.set(PIPE_START_X - deltaL / 2, 0, 0)
    rootGroup.add(leftDl)

    // Gold cap ring at effective open boundary x = effStartX
    const effRing = new THREE.Mesh(
      new THREE.TorusGeometry(PIPE_RADIUS * 1.01, 0.028, 10, 36).rotateY(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.75 })
    )
    effRing.position.set(PIPE_START_X - deltaL, 0, 0)
    rootGroup.add(effRing)

    if (pipeType.value === 'open') {
      const rightDl = new THREE.Mesh(dlGeo, dlMat)
      rightDl.position.set(pipeEndX + deltaL / 2, 0, 0)
      rootGroup.add(rightDl)

      const rightEffRing = effRing.clone()
      rightEffRing.position.set(pipeEndX + deltaL, 0, 0)
      rootGroup.add(rightEffRing)
    }
  }

  // Glowing length bracket bar for air column L along bottom front
  const lBarMesh = new THREE.Mesh(
    new THREE.BoxGeometry(pipeLen, 0.055, 0.055),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  lBarMesh.position.set(PIPE_START_X + pipeLen / 2, -1.52, 0.92)
  rootGroup.add(lBarMesh)

  // 4. 3D Sculpted U-Shaped Tuning Fork on the left + Acoustic Pulses
  const forkX = PIPE_START_X - Math.max(1.25, deltaL + 0.95)
  const forkGroup = new THREE.Group()
  forkGroup.position.set(forkX, 0, 0)
  const forkMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.18
  })
  // Stem pointing left (-X) into a dark wooden/slate base block
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.65, 16).rotateZ(Math.PI / 2), forkMat)
  handle.position.set(-0.68, 0, 0)
  const baseBlock = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.45, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65, metalness: 0.1 })
  )
  baseBlock.position.set(-1.1, 0, 0)
  // U-curve connecting prongs
  const uCurve = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.065, 12, 24, Math.PI), forkMat)
  uCurve.rotation.z = Math.PI / 2
  uCurve.position.set(-0.02, 0, 0)

  const upperProng = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.72, 16).rotateZ(Math.PI / 2), forkMat)
  upperProng.position.set(0.34, 0.36, 0)
  const lowerProng = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.72, 16).rotateZ(Math.PI / 2), forkMat)
  lowerProng.position.set(0.34, -0.36, 0)
  forkGroup.add(handle, baseBlock, uCurve, upperProng, lowerProng)
  rootGroup.add(forkGroup)

  // Emitted pulse rings traveling from fork to tube mouth
  const pulseRings = []
  for (let i = 0; i < 3; i++) {
    const pRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.022, 8, 28).rotateY(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
    )
    pRing.userData.phase = i / 3
    rootGroup.add(pRing)
    pulseRings.push(pRing)
  }

  // 5. 3D Longitudinal Air Molecules via single InstancedMesh (compression/rarefaction color)
  const molGeo = new THREE.SphereGeometry(0.058, 12, 10)
  const molMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.1,
    emissive: 0x1e293b,
    emissiveIntensity: 0.45
  })
  const molInstanced = new THREE.InstancedMesh(molGeo, molMat, MOLECULE_COUNT)
  molInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  const dummyColor = new THREE.Color(0x7dd3fc)
  for (let i = 0; i < MOLECULE_COUNT; i++) {
    molInstanced.setColorAt(i, dummyColor)
  }
  molInstanced.instanceColor.needsUpdate = true
  rootGroup.add(molInstanced)

  // 6. Standing Wave Envelopes (TubeGeometry) + Translucent Fill Curtain + Dynamic 3D Wave Ribbon
  const effStartX = PIPE_START_X - deltaL
  const effEndX = pipeType.value === 'closed' ? pipeEndX : pipeEndX + deltaL
  const waveLen3D = wavelengthCm.value * CM_TO_3D
  const kVal = (2 * Math.PI) / waveLen3D
  const resonanceFactor = Math.max(0.24, 1.0 - resonanceOffsetCm.value / 6.0)
  const amp = 0.94 * resonanceFactor

  const waveColor = showDisplacement.value
    ? (isResonant.value ? 0x38bdf8 : 0x60a5fa)
    : (isResonant.value ? 0xf59e0b : 0xfbbf24)
  const envColor = showDisplacement.value ? 0x7dd3fc : 0xfde68a

  const upperPts = []
  const lowerPts = []
  const curtainVerts = new Float32Array((WAVE_SAMPLES + 1) * 2 * 3)
  const curtainIndices = []
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const u = i / WAVE_SAMPLES
    const x = effStartX + (effEndX - effStartX) * u
    let spatial = 0
    if (pipeType.value === 'closed') {
      const d = effEndX - x
      spatial = showDisplacement.value ? Math.sin(kVal * d) : Math.cos(kVal * d)
    } else {
      const d = x - effStartX
      spatial = showDisplacement.value ? Math.cos(kVal * d) : Math.sin(kVal * d)
    }
    const yEnv = amp * Math.abs(spatial)
    upperPts.push(new THREE.Vector3(x, yEnv, 0))
    lowerPts.push(new THREE.Vector3(x, -yEnv, 0))
    curtainVerts[i * 6 + 0] = x; curtainVerts[i * 6 + 1] = yEnv; curtainVerts[i * 6 + 2] = 0
    curtainVerts[i * 6 + 3] = x; curtainVerts[i * 6 + 4] = -yEnv; curtainVerts[i * 6 + 5] = 0
    if (i < WAVE_SAMPLES) {
      const a = i * 2
      curtainIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }

  const curtainGeo = new THREE.BufferGeometry()
  curtainGeo.setAttribute('position', new THREE.BufferAttribute(curtainVerts, 3))
  curtainGeo.setIndex(curtainIndices)
  const curtainMat = new THREE.MeshBasicMaterial({
    color: waveColor,
    transparent: true,
    opacity: isResonant.value ? 0.16 : 0.08,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  rootGroup.add(new THREE.Mesh(curtainGeo, curtainMat))

  const envMat = new THREE.MeshBasicMaterial({ color: envColor, transparent: true, opacity: 0.55 })
  const upperEnvTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(upperPts), WAVE_SAMPLES, 0.018, 8, false),
    envMat
  )
  const lowerEnvTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lowerPts), WAVE_SAMPLES, 0.018, 8, false),
    envMat
  )
  rootGroup.add(upperEnvTube, lowerEnvTube)

  // Active oscillating thick 3D ribbon wave
  const activeWaveGeo = createWaveRibbonGeo(WAVE_SAMPLES)
  const activeWaveMat = new THREE.MeshStandardMaterial({
    color: waveColor,
    emissive: waveColor,
    emissiveIntensity: isResonant.value ? 0.75 : 0.4,
    roughness: 0.2
  })
  const activeWaveMesh = new THREE.Mesh(activeWaveGeo, activeWaveMat)
  rootGroup.add(activeWaveMesh)

  // 7. Analytical Node (節: crimson) & Antinode (腹: emerald/gold) 3D Markers
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.65 })
  const antiMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.65 })
  const markerRingGeo = new THREE.TorusGeometry(0.24, 0.03, 10, 24)
  markerRingGeo.rotateY(Math.PI / 2)
  const markerDotGeo = new THREE.SphereGeometry(0.085, 14, 14)

  const addMarker = (x, isNode) => {
    if (x < effStartX - 0.05 || x > effEndX + 0.05) return
    const mat = isNode ? nodeMat : antiMat
    const dot = new THREE.Mesh(markerDotGeo, mat)
    dot.position.set(x, 0, 0)
    rootGroup.add(dot)
    const ring = new THREE.Mesh(markerRingGeo, mat)
    ring.position.set(x, 0, 0)
    if (!isNode) ring.scale.set(1, amp * 1.4, amp * 1.4)
    rootGroup.add(ring)
  }

  const quarterWave = waveLen3D / 4
  if (pipeType.value === 'closed') {
    for (let k = 0; k <= 12; k++) {
      const xPos = effEndX - k * quarterWave
      if (xPos < effStartX - 0.04) break
      const isDispNode = k % 2 === 0
      const isNode = showDisplacement.value ? isDispNode : !isDispNode
      addMarker(xPos, isNode)
    }
  } else {
    for (let k = 0; k <= 12; k++) {
      const xPos = effStartX + k * quarterWave
      if (xPos > effEndX + 0.04) break
      const isDispAnti = k % 2 === 0
      const isNode = showDisplacement.value ? !isDispAnti : isDispAnti
      addMarker(xPos, isNode)
    }
  }

  // 8. 3D Text Sprites (spaced in X, Y, AND Z so zero overlap in 3D, Front, and Top views!)
  const forkLbl = createTextSprite(`音叉 f=${freq.value}Hz`, {
    color: '#e2e8f0',
    borderColor: '#94a3b8',
    fontSize: 32,
    scale: 0.48
  })
  forkLbl.position.set(forkX + 0.15, -1.75, 1.45)
  rootGroup.add(forkLbl)

  if (deltaL > 0.02) {
    const dlLbl = createTextSprite(`開口端補正 Δl=${deltaLCm.value.toFixed(1)}cm`, {
      color: '#fef08a',
      borderColor: '#facc15',
      fontSize: 30,
      scale: 0.45
    })
    dlLbl.position.set(PIPE_START_X - deltaL * 0.5, 1.92, -1.65)
    rootGroup.add(dlLbl)
  }

  const endLbl = createTextSprite(
    pipeType.value === 'closed'
      ? (showDisplacement.value ? '水面 (閉端・変位の節)' : '水面 (閉端・圧力の腹)')
      : (showDisplacement.value ? '開口端 (変位の腹)' : '開口端 (圧力の節)'),
    {
      color: pipeType.value === 'closed' ? '#7dd3fc' : '#6ee7b7',
      borderColor: pipeType.value === 'closed' ? '#38bdf8' : '#10b981',
      fontSize: 30,
      scale: 0.46
    }
  )
  endLbl.position.set(Math.max(-2.1, pipeEndX), -1.75, 1.55)
  rootGroup.add(endLbl)

  const statusLbl = createTextSprite(
    `気柱 L=${pipeLengthCm.value.toFixed(1)}cm (${isResonant.value ? resonanceInfo.value.modeName : '非共鳴'})`,
    {
      color: isResonant.value ? '#fda4af' : '#cbd5e1',
      borderColor: isResonant.value ? '#f43f5e' : '#64748b',
      fontSize: 34,
      scale: 0.52
    }
  )
  statusLbl.position.set(Math.max(-0.5, PIPE_START_X + pipeLen * 0.5 + 0.5), 2.38, -1.85)
  rootGroup.add(statusLbl)

  dynState = {
    pipeLen,
    deltaL,
    pipeEndX,
    effStartX,
    effEndX,
    kVal,
    amp,
    forkX,
    upperProng,
    lowerProng,
    pulseRings,
    waterSurfaceMesh,
    molInstanced,
    activeWaveGeo,
    xArr: new Float32Array(WAVE_SAMPLES + 1),
    yArr: new Float32Array(WAVE_SAMPLES + 1),
    dummyObj: new THREE.Object3D(),
    tmpColor: new THREE.Color()
  }
}

const COL_RARE = new THREE.Color(0x0ea5e9) // 疎 (Rarefaction - cool sky blue)
const COL_NEUT = new THREE.Color(0x94a3b8) // 平衡 (Equilibrium - neutral)
const COL_DENSE = new THREE.Color(0xf43f5e) // 密 (Compression - vibrant rose/coral)

function updateResonanceFrame() {
  if (!dynState) return
  const {
    pipeLen,
    deltaL,
    pipeEndX,
    effStartX,
    effEndX,
    kVal,
    amp,
    forkX,
    upperProng,
    lowerProng,
    pulseRings,
    waterSurfaceMesh,
    molInstanced,
    activeWaveGeo,
    xArr,
    yArr,
    dummyObj,
    tmpColor
  } = dynState

  const oscPhase = Math.cos(simTime * 7.5)

  // Vibrate tuning fork prongs
  const forkVib = Math.sin(simTime * 22.0) * 0.045
  upperProng.position.y = 0.36 + forkVib
  lowerProng.position.y = -0.36 - forkVib

  // Pulse acoustic rings drifting from tuning fork to open mouth
  const travelSpan = Math.max(0.6, PIPE_START_X - forkX + 0.3)
  for (const pRing of pulseRings) {
    const p = (simTime * 1.4 + pRing.userData.phase) % 1
    pRing.position.set(forkX + 0.45 + p * travelSpan, 0, 0)
    const sc = 0.75 + p * 0.65
    pRing.scale.set(1, sc, sc)
    pRing.material.opacity = (1 - p) * 0.55
  }

  // Subtle shimmer on water meniscus
  if (waterSurfaceMesh) {
    waterSurfaceMesh.material.emissiveIntensity = 0.45 + 0.12 * Math.sin(simTime * 4.0)
  }

  // Update active 3D standing wave ribbon
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const u = i / WAVE_SAMPLES
    const x = effStartX + (effEndX - effStartX) * u
    let spatial = 0
    if (pipeType.value === 'closed') {
      const d = effEndX - x
      spatial = showDisplacement.value ? Math.sin(kVal * d) : Math.cos(kVal * d)
    } else {
      const d = x - effStartX
      spatial = showDisplacement.value ? Math.cos(kVal * d) : Math.sin(kVal * d)
    }
    xArr[i] = x
    yArr[i] = amp * spatial * oscPhase
  }
  updateWaveRibbonGeo(activeWaveGeo, xArr, yArr, 0.04)

  // Update 3D longitudinal air molecules + compression/rarefaction color
  const molStartX = PIPE_START_X - deltaL * 0.65
  const molEndX = pipeType.value === 'closed' ? pipeEndX - 0.06 : pipeEndX + deltaL * 0.65
  const molSpan = Math.max(0.4, molEndX - molStartX)
  for (let i = 0; i < MOLECULE_COUNT; i++) {
    const p = airMoleculesData[i]
    const xBase = molStartX + p.u * molSpan
    let dispSpatial = 0
    let pressureSpatial = 0
    if (pipeType.value === 'closed') {
      const d = effEndX - xBase
      dispSpatial = Math.sin(kVal * d)
      pressureSpatial = Math.cos(kVal * d)
    } else {
      const d = xBase - effStartX
      dispSpatial = Math.cos(kVal * d)
      pressureSpatial = Math.sin(kVal * d)
    }
    const dispX = amp * 0.38 * dispSpatial * oscPhase
    const curX = Math.max(molStartX - 0.15, Math.min(molEndX, xBase + dispX))

    dummyObj.position.set(curX, p.y, p.z)
    const pVal = Math.max(-1, Math.min(1, pressureSpatial * oscPhase * (amp / 0.94)))
    const scaleBoost = 1 + pVal * 0.18
    dummyObj.scale.setScalar(scaleBoost)
    dummyObj.updateMatrix()
    molInstanced.setMatrixAt(i, dummyObj.matrix)

    if (pVal >= 0) {
      tmpColor.copy(COL_NEUT).lerp(COL_DENSE, pVal)
    } else {
      tmpColor.copy(COL_NEUT).lerp(COL_RARE, -pVal)
    }
    molInstanced.setColorAt(i, tmpColor)
  }
  molInstanced.instanceMatrix.needsUpdate = true
  molInstanced.instanceColor.needsUpdate = true
}

watch([pipeType, freq, pipeLengthCm, deltaLCm, showDisplacement], () => {
  rebuildTubeScene()
  updateResonanceFrame()
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
  border-radius: 12px;
  padding: 1.2rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
  box-sizing: border-box;
  max-width: 100%;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}

.sim-header .icon {
  font-size: 1.5rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.2rem;
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
  margin-bottom: 0.7rem;
}

.btn-play {
  background: #0284c7;
  color: #fff;
  padding: 0.42rem 0.9rem;
  border-radius: 8px;
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
  height: 390px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #080c16;
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

.legend-item i:not(.dot-wave):not(.dot-anti):not(.dot-node):not(.dot-dense):not(.dot-rare):not(.dot-dl) {
  font-style: italic;
}

.legend-item .dot-wave,
.legend-item .dot-anti,
.legend-item .dot-node,
.legend-item .dot-dense,
.legend-item .dot-rare,
.legend-item .dot-dl {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-wave { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-wave.pressure { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-anti { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-node { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-dense { background: #f43f5e; }
.dot-rare { background: #0ea5e9; }
.dot-dl { background: #facc15; box-shadow: 0 0 6px #facc15; }

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
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 700;
}

.three-ortho-badge.resonant {
  background: rgba(244, 63, 94, 0.18);
  border-color: rgba(244, 63, 94, 0.55);
  color: #fda4af;
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.28);
}

.control-panel {
  margin-top: 0.75rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #334155;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
  gap: 0.8rem;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.pipe-type-buttons {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.type-btn {
  padding: 0.38rem 0.65rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: bold;
}

.control-group strong {
  color: #38bdf8;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
  width: 100%;
}

.button-row {
  display: flex;
  gap: 0.55rem;
  margin-top: 0.9rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.45rem 0.9rem;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #e11d48;
  color: white;
}
.btn-primary:hover {
  background: #be123c;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border: 1px solid #475569;
}
.btn-secondary:hover {
  background: #475569;
}

.btn-outline {
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5e1;
  border: 1px solid #475569;
}
.btn-outline:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-top: 0.9rem;
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
  font-size: 1.08rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #fb7185;
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
    padding: 0.85rem;
  }
  .canvas-wrapper {
    height: 325px;
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
