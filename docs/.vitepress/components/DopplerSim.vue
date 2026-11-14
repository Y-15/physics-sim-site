<template>
  <div class="sim-container">
    <div class="sim-header">
      <h3 class="sim-title">🔊 3D ドップラー効果・音波波面 &amp; マッハ円錐シミュレーター</h3>
      <div class="sim-badges">
        <span class="badge badge-cyan">Three.js 3D 波面追跡</span>
        <span class="badge badge-yellow">青方偏移 / 赤方偏移・マッハ円錐</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="sim-btn outline" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="sim-btn outline" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="sim-btn outline" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点 (波長圧縮・伸長)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="sim-btn primary" @click="togglePlay">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x</button>
          <button :class="{ active: timeScale === 1.2 }" @click="timeScale = 1.2">1.2x</button>
        </div>
      </div>
      <button class="sim-btn secondary" @click="stepSim(0.08)">⏭ コマ送り (+0.08s)</button>
      <button class="sim-btn secondary" @click="resetSim">🔄 リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="canvas-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-blue"></i>前方 λ' 短縮 (青)</span>
          <span class="legend-item"><i class="dot-red"></i>後方 λ'' 伸長 (赤)</span>
          <span class="legend-item"><i class="dot-vs"></i>音源速度 <b>v<sub>s</sub></b></span>
          <span class="legend-item"><i class="dot-vo"></i>観測者 <b>v<sub>o</sub></b></span>
          <span class="legend-item"><i class="dot-v"></i>音速 <b>V</b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータスストリップ（モバイル非重複のためビューポート外直下に配置） -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :class="regimeBadgeClass">
        {{ regimeBadgeText }}
      </span>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">固有振動数 f₀</div>
        <div class="stat-value text-blue">{{ f0 }} <span class="stat-unit">Hz</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">音速 V</div>
        <div class="stat-value">{{ V }} <span class="stat-unit">m/s</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">音源速度 vs</div>
        <div class="stat-value" :class="vs >= V ? 'text-rose' : 'text-yellow'">
          {{ vs }} <span class="stat-unit">m/s (マッハ {{ (vs / V).toFixed(2) }})</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">受聴振動数 f' (前方 / 後方)</div>
        <div class="stat-value text-cyan" style="font-size: 1.05rem;">
          {{ vs < V ? frontFreq.toFixed(1) : '衝撃波(∞)' }} / {{ rearFreq.toFixed(1) }} <span class="stat-unit">Hz</span>
        </div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>音源速度 v<sub>s</sub>:</span>
            <span class="control-val">{{ vs }} m/s</span>
          </label>
          <input type="range" v-model.number="vs" min="0" max="450" step="10" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>観測者速度 v<sub>o</sub> (右向き):</span>
            <span class="control-val">{{ vo }} m/s</span>
          </label>
          <input type="range" v-model.number="vo" min="-100" max="100" step="5" class="sim-slider" />
        </div>
      </div>

      <div class="btn-group">
        <button @click="togglePlay" class="sim-btn primary">
          {{ isRunning ? '⏸️ 一時停止' : '▶️ 再生' }}
        </button>
        <button @click="resetSim" class="sim-btn secondary">🔄 リセット</button>
        <button @click="setPreset('subsonic')" class="sim-btn outline">亜音速 (マッハ 0.5)</button>
        <button @click="setPreset('sonic')" class="sim-btn outline">音速 (マッハ 1.0)</button>
        <button @click="setPreset('supersonic')" class="sim-btn outline">超音速 (マッハ 1.3)</button>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>観察のポイント</strong>:
      音源が右へ動くと、前方の波面間隔（見かけの波長 λ' = (<i>V</i> − <i>v</i><sub>s</sub>)/<i>f</i><sub>0</sub>）がギュッと縮まり高音（青い波面）に、後方は波長が伸びて低音（赤い波面）になります。
      <i>v</i><sub>s</sub> ≥ <i>V</i>（音速〜超音速）になると、前方の波面が重なり合って<strong>衝撃波（3Dマッハ円錐）</strong>を形成します。
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
const activeCam = ref('3d')
const isRunning = ref(true)
const timeScale = ref(0.4)

// 物理パラメータ
const V = ref(340) // 音速 [m/s]
const vs = ref(170) // 音源速度 [m/s]
const vo = ref(0) // 観測者速度 [m/s]
const f0 = ref(5) // シミュレーション表示用基本振動数 [Hz]

// 3D 空間座標
let sourceX = -4.2
let observerX = 3.5
let waves = [] // { x, r, alpha }
let lastEmitTime = 0
let pulseTimer = 0

const frontFreq = computed(() => {
  if (vs.value >= V.value) return 9999
  const ratio = (V.value - vo.value) / (V.value - vs.value)
  return Math.max(0, f0.value * ratio)
})

const rearFreq = computed(() => {
  const ratio = (V.value + vo.value) / (V.value + vs.value)
  return Math.max(0, f0.value * ratio)
})

const regimeBadgeText = computed(() => {
  if (vs.value === 0) return '静止音源: 波長 λ₀ 一定 (等方性球面波)'
  if (vs.value < V.value - 2) return `亜音速 (M=${(vs.value / V.value).toFixed(2)}): 前方 λ' 圧縮(青) / 後方 λ'' 伸長(赤)`
  if (vs.value <= V.value + 5) return '音速の壁 (M=1.00): 前方波面が重なり衝撃波面を形成'
  const thetaDeg = ((Math.asin(V.value / vs.value) * 180) / Math.PI).toFixed(1)
  return `超音速 (M=${(vs.value / V.value).toFixed(2)}): 3Dマッハ円錐形成 (半頂角 θ=${thetaDeg}°)`
})

const regimeBadgeClass = computed(() => {
  if (vs.value > V.value + 5) return 'supersonic'
  if (vs.value >= V.value - 2) return 'sonic'
  return 'subsonic'
})

function isMobileViewport() {
  if (!threeContainer.value) return false
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 400
  return w / Math.max(1, h) < 1.35
}

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 400
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(2.42, Math.max(1.42, 2.08 / Math.max(0.72, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 1.35, 48.0 * ms], target: [0, 0.75, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 48.0 * ms, 0.35], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0, 8.0 * ms, 14.0 * ms], target: [0, 0.35, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function seedCycle() {
  sourceX = -5.0
  waves = []
  lastEmitTime = 0.22
  const steps = vs.value > V.value ? 5 : 6
  const dtStep = vs.value > V.value ? 0.18 : 0.22
  for (let i = 0; i < steps; i++) {
    advancePhysics(dtStep)
  }
}

function resetSim() {
  observerX = 3.5
  seedCycle()
  sync3DScene()
}

function setPreset(type) {
  if (type === 'subsonic') {
    vs.value = 170
    vo.value = 0
  } else if (type === 'sonic') {
    vs.value = 340
    vo.value = 0
  } else if (type === 'supersonic') {
    vs.value = 440
    vo.value = 0
  }
  resetSim()
}

// 100 m/s -> 0.95 units/s in 3D
const UNIT_PER_MPS = 0.0095

function advancePhysics(simDt) {
  pulseTimer += simDt
  sourceX += vs.value * UNIT_PER_MPS * simDt
  observerX += vo.value * UNIT_PER_MPS * simDt

  if (sourceX > 5.8) {
    sourceX = -5.0
    waves = []
    lastEmitTime = 0.2
  }
  if (observerX > 6.2) observerX = -5.5
  if (observerX < -6.2) observerX = 5.5

  lastEmitTime += simDt
  const emitInterval = 1 / f0.value
  if (lastEmitTime >= emitInterval) {
    waves.push({
      x: sourceX,
      r: 0.08,
      alpha: 1.0
    })
    lastEmitTime = 0
  }

  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].r += V.value * UNIT_PER_MPS * simDt
    waves[i].alpha -= 0.125 * simDt
    if (waves[i].alpha <= 0 || waves[i].r > 8.6) {
      waves.splice(i, 1)
    }
  }
}

function stepSim(dtSec = 0.08) {
  isRunning.value = false
  advancePhysics(dtSec)
  sync3DScene()
}

const MAX_WAVES = 28
let sceneObjs = null
let resizeObs = null
let lastIsMob = false

// Cache for text sprites + idempotent height scaling for mobile readability
const labelCache = new Map()
function updateLabelCached(sprite, text, color, borderColor, baseScale = 0.48) {
  const targetH = isMobileViewport() ? baseScale * 1.58 : baseScale
  const prev = labelCache.get(sprite)
  const next = `${text}|${color}|${borderColor}`
  if (prev !== next) {
    labelCache.set(sprite, next)
    sprite.updateText(text, color, borderColor)
  }
  const curAspect = sprite.scale.x / Math.max(0.01, sprite.scale.y)
  if (Math.abs(sprite.scale.y - targetH) > 0.005) {
    sprite.scale.set(targetH * curAspect, targetH, 1)
  }
}

// Custom shader for 3D spherical dome shell showing crisp blueshift ahead (+X) & redshift behind (-X)
function createDomeShaderMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMach: { value: 0.5 },
      uAlpha: { value: 1.0 }
    },
    vertexShader: `
      varying vec3 vLocalDir;
      varying vec3 vViewNorm;
      varying vec3 vViewPos;
      void main() {
        vLocalDir = normalize(position);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vViewNorm = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uMach;
      uniform float uAlpha;
      varying vec3 vLocalDir;
      varying vec3 vViewNorm;
      varying vec3 vViewPos;
      void main() {
        float dirX = clamp(vLocalDir.x, -1.0, 1.0);
        float bias = clamp(uMach * 2.2, 0.0, 1.0);
        vec3 colNeutral = vec3(0.22, 0.74, 0.97);
        vec3 colBlue    = vec3(0.38, 0.76, 1.00);
        vec3 colRed     = vec3(0.96, 0.25, 0.37);
        vec3 colOrange  = vec3(0.99, 0.56, 0.22);
        vec3 redMix     = mix(colRed, colOrange, 0.35);
        vec3 baseCol = dirX >= 0.0
          ? mix(colNeutral, colBlue, smoothstep(0.04, 0.52, dirX) * bias)
          : mix(colNeutral, redMix, smoothstep(0.04, 0.45, -dirX) * bias);

        vec3 n = normalize(vViewNorm);
        vec3 v = normalize(vViewPos);
        float fresnel = pow(1.0 - abs(dot(n, v)), 1.6);
        float alpha = uAlpha * (0.055 + fresnel * 0.44);
        gl_FragColor = vec4(baseCol, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })
}

function createRingShaderMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMach: { value: 0.5 },
      uAlpha: { value: 1.0 }
    },
    vertexShader: `
      varying vec3 vLocalDir;
      void main() {
        vLocalDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uMach;
      uniform float uAlpha;
      varying vec3 vLocalDir;
      void main() {
        float dirX = clamp(vLocalDir.x, -1.0, 1.0);
        float bias = clamp(uMach * 2.2, 0.0, 1.0);
        vec3 colNeutral = vec3(0.22, 0.78, 0.98);
        vec3 colBlue    = vec3(0.45, 0.84, 1.00);
        vec3 colRed     = vec3(0.98, 0.32, 0.36);
        vec3 col = dirX >= 0.0
          ? mix(colNeutral, colBlue, smoothstep(0.04, 0.50, dirX) * bias)
          : mix(colNeutral, colRed, smoothstep(0.04, 0.44, -dirX) * bias);
        gl_FragColor = vec4(col, uAlpha * 0.95);
      }
    `,
    transparent: true,
    depthWrite: false
  })
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastIsMob = isMobileViewport()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 140,
    onFrame: (dt) => {
      if (isRunning.value) {
        advancePhysics(dt * timeScale.value)
      }
      sync3DScene()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileViewport()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  grid.position.y = -0.22
  scene.add(grid)

  // Sleek 3D acoustic track rail
  const trackMesh = new THREE.Mesh(
    new THREE.BoxGeometry(14.0, 0.12, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.55 })
  )
  trackMesh.position.set(0, -0.14, 0)
  scene.add(trackMesh)

  const trackLine = new THREE.Mesh(
    new THREE.BoxGeometry(13.8, 0.03, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x475569 })
  )
  trackLine.position.set(0, -0.07, 0)
  scene.add(trackLine)

  // Sound Source S (3D glowing amber core + acoustic horn cone pointing +X)
  const srcGroup = new THREE.Group()
  const srcSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.27, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.7 })
  )
  const srcHorn = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.35, 20).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xd97706, emissiveIntensity: 0.4, metalness: 0.5 })
  )
  srcHorn.position.set(0.26, 0, 0)
  srcGroup.add(srcSphere, srcHorn)
  scene.add(srcGroup)

  const srcLbl = createTextSprite('音源 S', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 34, scale: 0.48 })
  scene.add(srcLbl)

  const srcVelArrow = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  scene.add(srcVelArrow)

  // Observer O (3D glowing emerald sensor + acoustic receiver ring)
  const obsGroup = new THREE.Group()
  const obsMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x10b981, emissiveIntensity: 0.65 })
  )
  const obsRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.03, 10, 28).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.7 })
  )
  obsGroup.add(obsMesh, obsRing)
  scene.add(obsGroup)

  const obsLbl = createTextSprite('観測者 O', { color: '#86efac', borderColor: '#22c55e', fontSize: 34, scale: 0.48 })
  scene.add(obsLbl)

  const obsVelArrow = createVectorArrow3D({ color: 0x22c55e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  scene.add(obsVelArrow)

  // Wavefront expansion speed vector V (elevated cleanly above track & observer)
  const velVArrow = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.052, headRadius: 0.15, headLength: 0.34 })
  scene.add(velVArrow)
  const velVLbl = createTextSprite('音速 V=340m/s', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 32,
    scale: 0.45
  })
  scene.add(velVLbl)

  // Wavelength compression λ' (front) and stretching λ'' (rear) bracket indicators
  const frontBracket = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.06, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x60a5fa })
  )
  frontBracket.visible = false
  const rearBracket = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.06, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xfb7185 })
  )
  rearBracket.visible = false
  scene.add(frontBracket, rearBracket)

  const lamFrontLbl = createTextSprite("前方 λ' 短縮", {
    color: '#93c5fd',
    borderColor: '#60a5fa',
    fontSize: 30,
    scale: 0.44
  })
  lamFrontLbl.visible = false
  const lamRearLbl = createTextSprite("後方 λ'' 伸長", {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 30,
    scale: 0.44
  })
  lamRearLbl.visible = false
  scene.add(lamFrontLbl, lamRearLbl)

  // Supersonic 3D Mach Cone + Sonic Mach-1.0 Wall (reusable, never rebuilt per frame)
  const machConeGeo = new THREE.ConeGeometry(1, 1, 40, 1, true)
  machConeGeo.rotateZ(-Math.PI / 2)
  machConeGeo.translate(-0.5, 0, 0)
  const machConeMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const machConeMesh = new THREE.Mesh(machConeGeo, machConeMat)
  machConeMesh.visible = false
  scene.add(machConeMesh)

  const machEdgeGeo = new THREE.BufferGeometry()
  machEdgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(15), 3))
  const machEdgeLine = new THREE.Line(
    machEdgeGeo,
    new THREE.LineBasicMaterial({ color: 0xfb7185 })
  )
  machEdgeLine.visible = false
  scene.add(machEdgeLine)

  const sonicWallMesh = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.045, 12, 48).rotateY(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.8 })
  )
  sonicWallMesh.visible = false
  scene.add(sonicWallMesh)

  const machLbl = createTextSprite('衝撃波 (マッハ円錐)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 32,
    scale: 0.48
  })
  machLbl.visible = false
  scene.add(machLbl)

  // Pre-allocated Pool of 3D Translucent Spherical Wavefront Shells + Equatorial Rings
  const sharedDomeGeo = new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.5)
  const eqPts = []
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2
    eqPts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)))
  }
  const sharedEqGeo = new THREE.BufferGeometry().setFromPoints(eqPts)
  const sharedRingMeshGeo = new THREE.RingGeometry(0.978, 1.0, 64)
  sharedRingMeshGeo.rotateX(-Math.PI / 2)

  const wavePool = []
  for (let i = 0; i < MAX_WAVES; i++) {
    const domeMat = createDomeShaderMat()
    const ringMat = createRingShaderMat()
    const dome = new THREE.Mesh(sharedDomeGeo, domeMat)
    const eqLine = new THREE.LineLoop(sharedEqGeo, ringMat)
    const eqBand = new THREE.Mesh(sharedRingMeshGeo, ringMat)
    const grp = new THREE.Group()
    grp.add(dome, eqLine, eqBand)
    grp.visible = false
    scene.add(grp)
    wavePool.push({ grp, domeMat, ringMat })
  }

  sceneObjs = {
    srcGroup,
    srcLbl,
    srcVelArrow,
    obsGroup,
    obsRing,
    obsLbl,
    obsVelArrow,
    velVArrow,
    velVLbl,
    frontBracket,
    rearBracket,
    lamFrontLbl,
    lamRearLbl,
    machConeMesh,
    machEdgeGeo,
    machEdgeLine,
    sonicWallMesh,
    machLbl,
    wavePool
  }

  seedCycle()
  sync3DScene()
}

function sync3DScene() {
  if (!sceneObjs) return
  const {
    srcGroup,
    srcLbl,
    srcVelArrow,
    obsGroup,
    obsRing,
    obsLbl,
    obsVelArrow,
    velVArrow,
    velVLbl,
    frontBracket,
    rearBracket,
    lamFrontLbl,
    lamRearLbl,
    machConeMesh,
    machEdgeGeo,
    machEdgeLine,
    sonicWallMesh,
    machLbl,
    wavePool
  } = sceneObjs

  const mob = isMobileViewport()
  const machVal = vs.value / V.value

  // 1. Source S & velocity vs
  srcGroup.position.set(sourceX, 0.25, 0)
  srcLbl.position.set(sourceX, mob ? 1.66 : 1.50, mob ? -1.02 : -0.78)
  updateLabelCached(srcLbl, mob ? `S (vs=${vs.value})` : `音源 S (vs=${vs.value})`, '#fde68a', '#f59e0b', 0.46)

  if (vs.value > 0) {
    const vLen = Math.min(2.2, Math.max(0.55, vs.value * 0.0046))
    srcVelArrow.setVector(
      new THREE.Vector3(sourceX + 0.35, 0.25, 0),
      new THREE.Vector3(1, 0, 0),
      vLen
    )
  } else {
    srcVelArrow.visible = false
  }

  // 2. Observer O & velocity vo
  obsGroup.position.set(observerX, 0.25, 0)
  const pulse = 1 + 0.12 * Math.sin(pulseTimer * 10.0)
  obsRing.scale.setScalar(pulse)
  obsLbl.position.set(observerX, 0.82, mob ? 1.08 : 0.88)
  const isAhead = observerX >= sourceX
  const obsFreq = isAhead ? (vs.value < V.value ? frontFreq.value : Infinity) : rearFreq.value
  const obsText = Number.isFinite(obsFreq)
    ? (mob ? `O (${obsFreq.toFixed(1)}Hz)` : `観測者 O (f'=${obsFreq.toFixed(1)}Hz)`)
    : (mob ? 'O (衝撃波)' : '観測者 O (衝撃波領域)')
  updateLabelCached(obsLbl, obsText, '#86efac', '#22c55e', 0.46)

  if (Math.abs(vo.value) > 0) {
    obsVelArrow.setVector(
      new THREE.Vector3(observerX, 0.55, 0),
      new THREE.Vector3(Math.sign(vo.value), 0, 0),
      Math.max(0.5, Math.abs(vo.value) * 0.0085)
    )
  } else {
    obsVelArrow.visible = false
  }

  // 3. Wavefront Pool Update
  let maxRightEdge = sourceX + 1.0
  for (let i = 0; i < MAX_WAVES; i++) {
    const slot = wavePool[i]
    if (i < waves.length) {
      const w = waves[i]
      const r = Math.max(0.08, w.r)
      slot.grp.visible = true
      slot.grp.position.set(w.x, 0.01, 0)
      slot.grp.scale.set(r, r, r)
      slot.domeMat.uniforms.uMach.value = machVal
      slot.domeMat.uniforms.uAlpha.value = Math.max(0.12, w.alpha)
      slot.ringMat.uniforms.uMach.value = machVal
      slot.ringMat.uniforms.uAlpha.value = Math.max(0.18, w.alpha)
      maxRightEdge = Math.max(maxRightEdge, w.x + r)
    } else {
      slot.grp.visible = false
    }
  }

  // 4. Sound Speed Reference Vector V (kept horizontally & vertically clear of srcLbl & obsLbl across entire cycle)
  const vAnchorX = vs.value >= V.value - 2
    ? (sourceX < 0.8 ? 2.2 : -4.2)
    : (sourceX > 2.3 ? -4.2 : Math.min(4.2, Math.max(sourceX + 1.8, maxRightEdge - 0.5)))
  const vArrowY = mob ? 1.88 : 1.78
  const vArrowZ = mob ? -2.25 : -2.10
  velVArrow.setVector(
    new THREE.Vector3(vAnchorX, vArrowY, vArrowZ),
    new THREE.Vector3(1, 0, 0),
    1.45
  )
  velVLbl.position.set(vAnchorX + 0.60, mob ? 2.35 : 2.22, mob ? -2.35 : -2.20)
  updateLabelCached(velVLbl, mob ? `音速 V=${V.value}` : `音速 V=${V.value}m/s`, '#7dd3fc', '#38bdf8', 0.44)

  // 5. Dynamic search for valid outermost visible front λ' & rear λ'' intervals
  if (waves.length >= 2 && vs.value > 5 && vs.value < V.value - 5) {
    let frontMatch = null
    for (let k = 1; k < waves.length; k++) {
      const wOld = waves[k - 1]
      const wNew = waves[k]
      const xF1 = wNew.x + wNew.r
      const xF2 = wOld.x + wOld.r
      if (xF2 - xF1 > 0.16 && xF2 <= 6.2 && xF1 >= -6.2) {
        frontMatch = { xF1, xF2, mid: (xF1 + xF2) * 0.5, span: xF2 - xF1 }
        break
      }
    }

    let rearMatch = null
    for (let k = 1; k < waves.length; k++) {
      const wOld = waves[k - 1]
      const wNew = waves[k]
      const xR1 = wNew.x - wNew.r
      const xR2 = wOld.x - wOld.r
      if (xR1 - xR2 > 0.2 && xR2 >= -6.8 && xR1 <= 6.2) {
        rearMatch = { xR1, xR2, mid: (xR1 + xR2) * 0.5, span: xR1 - xR2 }
        break
      }
    }

    const separated =
      !frontMatch || !rearMatch || Math.abs(frontMatch.mid - rearMatch.mid) > (mob ? 3.2 : 2.3)

    if (frontMatch && separated) {
      frontBracket.visible = true
      frontBracket.scale.set(frontMatch.span, 1, 1)
      frontBracket.position.set(frontMatch.mid, 0.04, 1.75)
      lamFrontLbl.visible = true
      lamFrontLbl.position.set(frontMatch.mid, -0.62, mob ? 2.8 : 2.45)
      updateLabelCached(lamFrontLbl, mob ? "λ' 短縮" : "前方 λ' 短縮", '#93c5fd', '#60a5fa', 0.42)
    } else {
      frontBracket.visible = false
      lamFrontLbl.visible = false
    }

    if (rearMatch && separated) {
      rearBracket.visible = true
      rearBracket.scale.set(rearMatch.span, 1, 1)
      rearBracket.position.set(rearMatch.mid, 0.04, 1.75)
      lamRearLbl.visible = true
      lamRearLbl.position.set(rearMatch.mid, -0.62, mob ? 2.8 : 2.45)
      updateLabelCached(lamRearLbl, mob ? "λ'' 伸長" : "後方 λ'' 伸長", '#fda4af', '#f43f5e', 0.42)
    } else {
      rearBracket.visible = false
      lamRearLbl.visible = false
    }
  } else {
    frontBracket.visible = false
    rearBracket.visible = false
    lamFrontLbl.visible = false
    lamRearLbl.visible = false
  }

  // 6. Mach Cone (vs > V) or Sonic Wall (vs ≈ V)
  if (vs.value > V.value + 5) {
    const sinTheta = V.value / vs.value
    const theta = Math.asin(sinTheta)
    const tanTheta = Math.tan(theta)
    const coneLen = Math.min(5.0, 4.8 / Math.max(0.45, tanTheta))
    const coneRadius = coneLen * tanTheta

    machConeMesh.visible = true
    machConeMesh.position.set(sourceX, 0.02, 0)
    machConeMesh.scale.set(coneLen, coneRadius, coneRadius)

    const eArr = machEdgeGeo.getAttribute('position').array
    eArr[0] = sourceX - coneLen; eArr[1] = 0.03; eArr[2] = -coneRadius
    eArr[3] = sourceX; eArr[4] = 0.03; eArr[5] = 0
    eArr[6] = sourceX - coneLen; eArr[7] = 0.03; eArr[8] = coneRadius
    eArr[9] = sourceX; eArr[10] = 0.03; eArr[11] = 0
    eArr[12] = sourceX - coneLen; eArr[13] = coneRadius; eArr[14] = 0
    machEdgeGeo.getAttribute('position').needsUpdate = true
    machEdgeLine.visible = true

    sonicWallMesh.visible = false
    machLbl.visible = true
    const degStr = ((theta * 180) / Math.PI).toFixed(1)
    updateLabelCached(machLbl, mob ? `衝撃波 θ=${degStr}°` : `衝撃波 (マッハ角 θ=${degStr}°)`, '#fda4af', '#f43f5e', 0.45)
    // Lower-foreground along Mach cone edge, totally clear of srcLbl, obsLbl & velVLbl in 3D, Front, and Top views
    machLbl.position.set(Math.max(-4.6, sourceX - 2.2), mob ? -0.78 : -0.68, mob ? 2.85 : 2.55)
  } else if (vs.value >= V.value - 2) {
    machConeMesh.visible = false
    machEdgeLine.visible = false
    sonicWallMesh.visible = true
    sonicWallMesh.position.set(sourceX, 0.02, 0)
    machLbl.visible = true
    updateLabelCached(machLbl, mob ? '音速の壁 M=1.0' : '音速の壁 (衝撃波 M=1.0)', '#fda4af', '#f43f5e', 0.45)
    machLbl.position.set(Math.max(-4.6, sourceX - 2.2), mob ? -0.78 : -0.68, mob ? 2.85 : 2.55)
  } else {
    machConeMesh.visible = false
    machEdgeLine.visible = false
    sonicWallMesh.visible = false
    machLbl.visible = false
  }
}

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
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  box-sizing: border-box;
  max-width: 100%;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
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
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
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

.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0 0 10px 0;
  padding: 8px 10px;
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
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.speed-btn-group button.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

.canvas-wrap {
  position: relative;
  width: 100%;
  height: 400px;
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

.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-blue { background: #60a5fa; box-shadow: 0 0 6px #60a5fa; }
.dot-red { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-vs { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.dot-vo { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
.dot-v { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }

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

.three-ortho-badge.sonic {
  background: rgba(251, 191, 36, 0.16);
  border-color: rgba(251, 191, 36, 0.45);
  color: #fde68a;
}

.three-ortho-badge.supersonic {
  background: rgba(244, 63, 94, 0.18);
  border-color: rgba(244, 63, 94, 0.55);
  color: #fda4af;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.08rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 14px;
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
  font-size: 0.85rem;
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
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn.primary {
  background: #0284c7;
  color: #fff;
  border: none;
}
.sim-btn.primary:hover {
  background: #0369a1;
}

.sim-btn.secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}
.sim-btn.secondary:hover {
  background: #475569;
}

.sim-btn.outline {
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  border: 1px solid #475569;
}
.sim-btn.outline:hover,
.sim-btn.outline.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 12px;
  }
  .canvas-wrap {
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
