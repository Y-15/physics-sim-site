<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🔊</span>
        <h3>3D うなり（脈動）と音波の合成シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        振動数のわずかに異なる2つの音波が重なり合うときに生じる音の周期的な強弱（うなり）。
        三角関数の和積公式による3D包絡線（エンベロープ）の形成と、1秒あたりのうなりの回数 <i>f</i><sub>beat</sub> = |<i>f</i><sub>1</sub> - <i>f</i><sub>2</sub>| を3D空間の波形と実際の音響合成で体感できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="select-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="select-btn" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 正面視点 (波形比較)
        </button>
        <button class="select-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面視点
        </button>
      </div>
    </div>

    <div class="canvas-wrapper">
      <div ref="threeContainer" class="three-viewport"></div>
      <div class="three-hud-top">
        <div class="three-hud-legend">
          <template v-if="showComponents">
            <span class="legend-item"><i class="dot-c"></i>音波1 <b>f₁</b></span>
            <span class="legend-item"><i class="dot-r"></i>音波2 <b>f₂</b></span>
          </template>
          <span class="legend-item"><i class="dot-e"></i>合成波 <b>y₁ + y₂</b></span>
          <span class="legend-item"><i class="dot-g"></i>振幅包絡線 (音の強弱)</span>
        </div>
      </div>
      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <div class="beat-status-strip">
      <span class="three-ortho-badge">
        ✓ うなりの周期: <strong>{{ beatFreq > 0.05 ? (1 / beatFreq).toFixed(2) : '∞' }} 秒 ({{ beatFreq.toFixed(1) }} 回/秒)</strong>
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span class="lbl-row"><span>音源1の振動数 <i>f</i><sub>1</sub>:</span> <strong>{{ f1 }} Hz</strong></span>
            <input type="range" v-model.number="f1" min="400" max="480" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span class="lbl-row"><span>音源2の振動数 <i>f</i><sub>2</sub>:</span> <strong>{{ f2 }} Hz</strong></span>
            <input type="range" v-model.number="f2" min="400" max="480" step="1" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>波形の表示切り替え:</span>
            <div class="btn-group">
              <button type="button" class="select-btn" :class="{ active: showComponents }" @click="showComponents = !showComponents">
                {{ showComponents ? '2音の個別波形を表示中' : '合成波のみ表示' }}
              </button>
            </div>
          </label>
        </div>

        <div class="control-group">
          <label>
            <span class="lbl-row"><span>時間軸ズーム:</span> <strong>{{ timeScale.toFixed(1) }}x</strong></span>
            <input type="range" v-model.number="timeScale" min="0.5" max="3.0" step="0.1" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="toggleSound">
          {{ isAudioActive ? '🔇 うなりの音を停止' : '♪ うなりを聴く (Web Audio 2和音)' }}
        </button>
        <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
          {{ isPlaying ? '⏸ 波形を一時停止' : '▶ 波形を再生' }}
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す (440Hz / 444Hz)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">うなりの回数 <i>f</i><sub>beat</sub></span>
        <span class="value highlight">{{ beatFreq.toFixed(1) }} <span class="unit">回/秒 (Hz)</span></span>
        <span class="subtext"><i>f</i><sub>beat</sub> = |<i>f</i><sub>1</sub> - <i>f</i><sub>2</sub>|</span>
      </div>

      <div class="stat-card">
        <span class="label">うなりの周期 <i>T</i><sub>beat</sub></span>
        <span class="value">{{ beatFreq > 0.05 ? (1 / beatFreq).toFixed(3) : '∞' }} <span class="unit">秒</span></span>
        <span class="subtext"><i>T</i><sub>beat</sub> = 1 / |<i>f</i><sub>1</sub> - <i>f</i><sub>2</sub>|</span>
      </div>

      <div class="stat-card">
        <span class="label">搬送波の平均振動数 f̄</span>
        <span class="value">{{ carrierFreq.toFixed(1) }} <span class="unit">Hz</span></span>
        <span class="subtext">f̄ = (<i>f</i><sub>1</sub> + <i>f</i><sub>2</sub>) / 2</span>
      </div>

      <div class="stat-card">
        <span class="label">干渉の状態</span>
        <span class="value">{{ beatFreq === 0 ? '完全同調（共鳴）' : (beatFreq <= 7 ? '明瞭なうなり' : '急速な脈動・濁り音') }}</span>
        <span class="subtext">調律（チューニング）の原理</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
const activeCam = ref('3d')
const isPlaying = ref(true)

const f1 = ref(440) // A4 (ラ) = 440 Hz
const f2 = ref(444) // 444 Hz (うなり 4 Hz)
const showComponents = ref(true)
const timeScale = ref(1.0)

const beatFreq = computed(() => Math.abs(f1.value - f2.value))
const carrierFreq = computed(() => (f1.value + f2.value) / 2)

const resetDefaults = () => {
  f1.value = 440
  f2.value = 444
  timeScale.value = 1.0
}

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 390
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(1.85, Math.max(1.34, 1.48 / Math.max(0.68, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'side') {
    return { pos: [0, 0.12, 52.0 * ms], target: [0, 0.12, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 52.0 * ms, 0.35], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0.4 * ms, 5.2 * ms, 14.8 * ms], target: [0, -0.25, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false
const labelCache = {}

function isMobileViewport() {
  return getMobScale() > 1.01
}

function updateLabelCached(sprite, key, text, color, borderColor, baseScale = 0.44) {
  const mult = isMobileViewport() ? 1.52 : 1.0
  const sig = `${text}|${color}|${borderColor}|${mult}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(text, color, borderColor)
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  sprite.scale.set(h * asp, h, 1)
}

function syncBeatLabels() {
  if (!sceneObjs) return
  const mob = isMobileViewport()
  updateLabelCached(
    sceneObjs.lbl1,
    'lbl1',
    mob ? `音波1 f₁=${f1.value}Hz` : `音波1 (f₁ = ${f1.value} Hz)`,
    '#7dd3fc',
    '#38bdf8',
    0.44
  )
  updateLabelCached(
    sceneObjs.lbl2,
    'lbl2',
    mob ? `音波2 f₂=${f2.value}Hz` : `音波2 (f₂ = ${f2.value} Hz)`,
    '#fda4af',
    '#f43f5e',
    0.44
  )
  updateLabelCached(
    sceneObjs.lblBeat,
    'lblBeat',
    mob ? `合成波 (${beatFreq.value.toFixed(1)}Hz)` : `合成波 y = y₁ + y₂ (うなり ${beatFreq.value.toFixed(1)} Hz)`,
    '#6ee7b7',
    '#10b981',
    0.44
  )
  updateLabelCached(
    sceneObjs.lblEnv,
    'lblEnv',
    mob ? '金色包絡線 (強弱)' : '金色包絡線: 音の強弱エンベロープ',
    '#fef08a',
    '#facc15',
    0.42
  )
}

// 動的更新可能な3Dチューブメッシュ（GCなし）
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

// Web Audio API による2音合成
let audioCtx = null
let osc1 = null
let osc2 = null
let gain1 = null
let gain2 = null
const isAudioActive = ref(false)

function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    gain1 = audioCtx.createGain()
    gain2 = audioCtx.createGain()
    gain1.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain2.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain1.connect(audioCtx.destination)
    gain2.connect(audioCtx.destination)
  } catch (e) {}
}

function updateAudioFreqs() {
  if (audioCtx) {
    if (osc1) osc1.frequency.setTargetAtTime(f1.value, audioCtx.currentTime, 0.04)
    if (osc2) osc2.frequency.setTargetAtTime(f2.value, audioCtx.currentTime, 0.04)
  }
}

function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()

  if (isAudioActive.value) {
    if (osc1) { try { osc1.stop(); osc1.disconnect() } catch (e) {} osc1 = null }
    if (osc2) { try { osc2.stop(); osc2.disconnect() } catch (e) {} osc2 = null }
    isAudioActive.value = false
  } else {
    if (!audioCtx) return
    try {
      osc1 = audioCtx.createOscillator()
      osc2 = audioCtx.createOscillator()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(f1.value, audioCtx.currentTime)
      osc2.frequency.setValueAtTime(f2.value, audioCtx.currentTime)
      osc1.connect(gain1)
      osc2.connect(gain2)
      osc1.start()
      osc2.start()
      isAudioActive.value = true
    } catch (e) {}
  }
}

let tOffset = 0
let sceneObjs = null

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
        tOffset += dt * 0.22
      }
      updateWaveforms()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.01
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
        syncBeatLabels()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x1e293b)
  grid.position.y = -3.35
  scene.add(grid)

  const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: 0x0b1222, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  )
  floorPlane.rotation.x = -Math.PI / 2
  floorPlane.position.y = -3.36
  scene.add(floorPlane)

  const span = 11.2
  const samples = 560

  // 1. Wave 1 (f1: Sky Cyan at z = -2.2, y = +2.25)
  const w1Group = new THREE.Group()
  const w1Base = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-span / 2, 2.25, -2.2), new THREE.Vector3(span / 2, 2.25, -2.2)]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  const w1Tube = createDynamicTube(
    samples,
    6,
    0.036,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.55, roughness: 0.25 })
  )
  const lbl1 = createTextSprite(`音波1 (f₁ = ${f1.value} Hz)`, { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.44 })
  lbl1.position.set(-3.4, 3.05, -2.2)
  w1Group.add(w1Base, w1Tube.mesh, lbl1)
  scene.add(w1Group)

  // 2. Wave 2 (f2: Coral Rose at z = 0, y = +0.62)
  const w2Group = new THREE.Group()
  const w2Base = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-span / 2, 0.62, 0), new THREE.Vector3(span / 2, 0.62, 0)]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  const w2Tube = createDynamicTube(
    samples,
    6,
    0.036,
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.55, roughness: 0.25 })
  )
  const lbl2 = createTextSprite(`音波2 (f₂ = ${f2.value} Hz)`, { color: '#fda4af', borderColor: '#f43f5e', scale: 0.44 })
  lbl2.position.set(-3.4, 1.42, 0.0)
  w2Group.add(w2Base, w2Tube.mesh, lbl2)
  scene.add(w2Group)

  // 3. Superposed Beat Wave (Emerald #10b981) + Glowing Gold Envelope (#facc15)
  const beatBaseGeo = new THREE.BufferGeometry()
  beatBaseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const beatBaseLine = new THREE.Line(beatBaseGeo, new THREE.LineBasicMaterial({ color: 0x475569 }))
  scene.add(beatBaseLine)

  const beatTube = createDynamicTube(
    samples,
    8,
    0.042,
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.65, roughness: 0.2 })
  )
  scene.add(beatTube.mesh)

  const envMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.6,
    roughness: 0.2
  })
  const envUpTube = createDynamicTube(samples, 6, 0.026, envMat)
  const envDownTube = createDynamicTube(samples, 6, 0.026, envMat)
  scene.add(envUpTube.mesh, envDownTube.mesh)

  // Translucent volumetric fill between upper & lower envelope
  const envSheetGeo = new THREE.BufferGeometry()
  envSheetGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(samples * 18), 3))
  const envSheetMesh = new THREE.Mesh(
    envSheetGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  scene.add(envSheetMesh)

  // 3D Envelope Rings around the superposed wave
  const ringCount = 22
  const envRings = []
  const ringGeo = new THREE.TorusGeometry(1.0, 0.02, 10, 28)
  ringGeo.rotateY(Math.PI / 2)
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.32 })
  for (let i = 0; i < ringCount; i++) {
    const rMesh = new THREE.Mesh(ringGeo, ringMat)
    rMesh.userData = { u: i / (ringCount - 1) }
    scene.add(rMesh)
    envRings.push(rMesh)
  }

  const lblBeat = createTextSprite(
    `合成波 y = y₁ + y₂ (うなり ${beatFreq.value.toFixed(1)} Hz)`,
    { color: '#6ee7b7', borderColor: '#10b981', scale: 0.44 }
  )
  const lblEnv = createTextSprite('金色包絡線: 音の強弱エンベロープ', {
    color: '#fef08a',
    borderColor: '#facc15',
    scale: 0.42
  })
  scene.add(lblBeat, lblEnv)

  const w1Pts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())
  const w2Pts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())
  const beatPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())
  const envUpPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())
  const envDnPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())

  sceneObjs = {
    span,
    samples,
    w1Group,
    w2Group,
    w1Tube,
    w2Tube,
    lbl1,
    lbl2,
    beatBaseGeo,
    beatTube,
    envUpTube,
    envDownTube,
    envSheetGeo,
    envRings,
    lblBeat,
    lblEnv,
    w1Pts,
    w2Pts,
    beatPts,
    envUpPts,
    envDnPts
  }

  syncBeatLabels()
  updateWaveforms()
}

function updateWaveforms() {
  if (!sceneObjs) return
  const {
    span,
    samples,
    w1Group,
    w2Group,
    w1Tube,
    w2Tube,
    lbl1,
    lbl2,
    beatBaseGeo,
    beatTube,
    envUpTube,
    envDownTube,
    envSheetGeo,
    envRings,
    lblBeat,
    lblEnv,
    w1Pts,
    w2Pts,
    beatPts,
    envUpPts,
    envDnPts
  } = sceneObjs

  w1Group.visible = showComponents.value
  w2Group.visible = showComponents.value

  const mainCenterY = showComponents.value ? -1.52 : 0.0
  const mainAmp = showComponents.value ? 1.08 : 1.75
  const zBeat = showComponents.value ? 2.2 : 0.0

  // 440Hz/444Hzでも画面内に複数個の「うなり紡錘(ビート節)」が明瞭に見えるよう、
  // 差周波数 |f1-f2| を厳密保存しつつ搬送波を可視域へストロボ圧縮して表示
  const timeWindow = 0.75 / timeScale.value
  const diffFreq = f1.value - f2.value
  const halfBeat = diffFreq / 2
  const fCarrierVis = Math.max(30 * (carrierFreq.value / 440), Math.abs(diffFreq) * 0.62 + 20)
  const f1Vis = fCarrierVis + halfBeat
  const f2Vis = fCarrierVis - halfBeat

  const bArr = beatBaseGeo.getAttribute('position').array
  bArr[0] = -span / 2; bArr[1] = mainCenterY; bArr[2] = zBeat
  bArr[3] = span / 2; bArr[4] = mainCenterY; bArr[5] = zBeat
  beatBaseGeo.getAttribute('position').needsUpdate = true

  const mob = isMobileViewport()
  lbl1.position.set(mob ? -2.9 : -3.4, mob ? 3.16 : 3.05, -2.2)
  lbl2.position.set(mob ? -2.9 : -3.4, 1.44, 0.0)
  lblBeat.position.set(mob ? -2.75 : -2.9, showComponents.value ? (mob ? -3.08 : -2.98) : 2.15, zBeat)
  lblEnv.position.set(mob ? 2.75 : 2.9, showComponents.value ? (mob ? -3.08 : -2.98) : 2.15, zBeat)

  const sheetArr = envSheetGeo.getAttribute('position').array
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    const x = -span / 2 + span * u
    const t = tOffset + u * timeWindow

    const s1 = Math.sin(2 * Math.PI * f1Vis * t)
    const s2 = Math.sin(2 * Math.PI * f2Vis * t)

    if (showComponents.value) {
      w1Pts[i].set(x, 2.25 + 0.48 * s1, -2.2)
      w2Pts[i].set(x, 0.62 + 0.48 * s2, 0.0)
    }

    const yTot = (s1 + s2) * 0.5 * mainAmp
    const env = mainAmp * Math.abs(Math.cos(2 * Math.PI * halfBeat * t))

    beatPts[i].set(x, mainCenterY + yTot, zBeat)
    envUpPts[i].set(x, mainCenterY + env, zBeat)
    envDnPts[i].set(x, mainCenterY - env, zBeat)

    if (i > 0) {
      const idx = (i - 1) * 18
      const px = envUpPts[i - 1].x
      const pu = envUpPts[i - 1].y
      const pd = envDnPts[i - 1].y
      const cu = envUpPts[i].y
      const cd = envDnPts[i].y
      sheetArr[idx] = px; sheetArr[idx + 1] = pu; sheetArr[idx + 2] = zBeat
      sheetArr[idx + 3] = x; sheetArr[idx + 4] = cu; sheetArr[idx + 5] = zBeat
      sheetArr[idx + 6] = px; sheetArr[idx + 7] = pd; sheetArr[idx + 8] = zBeat

      sheetArr[idx + 9] = x; sheetArr[idx + 10] = cu; sheetArr[idx + 11] = zBeat
      sheetArr[idx + 12] = x; sheetArr[idx + 13] = cd; sheetArr[idx + 14] = zBeat
      sheetArr[idx + 15] = px; sheetArr[idx + 16] = pd; sheetArr[idx + 17] = zBeat
    }
  }

  if (showComponents.value) {
    w1Tube.updateFromPoints(w1Pts)
    w2Tube.updateFromPoints(w2Pts)
  }
  beatTube.updateFromPoints(beatPts)
  envUpTube.updateFromPoints(envUpPts)
  envDownTube.updateFromPoints(envDnPts)
  envSheetGeo.getAttribute('position').needsUpdate = true

  for (const rMesh of envRings) {
    const u = rMesh.userData.u
    const x = -span / 2 + span * u
    const t = tOffset + u * timeWindow
    const env = Math.max(0.05, mainAmp * Math.abs(Math.cos(2 * Math.PI * halfBeat * t)))
    rMesh.position.set(x, mainCenterY, zBeat)
    rMesh.scale.set(1, env, env * 0.52)
  }
}

watch([f1, f2], () => {
  updateAudioFreqs()
  syncBeatLabels()
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
  if (osc1) { try { osc1.stop(); osc1.disconnect() } catch (e) {} }
  if (osc2) { try { osc2.stop(); osc2.disconnect() } catch (e) {} }
  if (audioCtx) { try { audioCtx.close() } catch (e) {} }
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
  margin-bottom: 0.75rem;
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

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 390px;
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
.dot-r { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-e { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-g { background: #facc15; box-shadow: 0 0 6px #facc15; }

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

.beat-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.25rem 0 0.85rem 0;
}
.three-ortho-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.42);
  color: #6ee7b7;
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
  gap: 0.8rem;
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
  padding: 0.35rem 0.65rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.78rem;
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
  color: #10b981;
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
  .beat-status-strip {
    justify-content: flex-start;
  }
}
</style>
