<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#c084fc">
    <div class="lab-head">
      <span class="lab-title">🪐 3D 人工衛星の軌道シミュレーター（第1・第2宇宙速度と万有引力）</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Space</span>
        <span class="lab-badge">第1・第2宇宙速度／面積速度一定</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          ⭕ 真上（軌道平面・面積速度確認）
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 側面視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="playing = !playing" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ playing ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="lab-btn" @click="stepSim(0.04)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.04s)
      </button>
      <button class="lab-btn" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 打ち上げ直す
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
          <span class="legend-item"><i class="dot-f"></i>万有引力 <b>F = GMm/r²</b></span>
          <span class="legend-item"><i class="dot-o"></i>{{ energy < 0 ? '束縛軌道 (E < 0)' : '脱出軌道 (E ≥ 0)' }}</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <div class="speed-telemetry-strip">
      <div class="three-speed-info">
        第1宇宙速度 <b>v₁ = {{ (vc0 * 1000).toFixed(2) }} km/s</b> ｜ 第2宇宙速度 <b>v₂ = {{ (Math.SQRT2 * vc0 * 1000).toFixed(2) }} km/s</b>
      </div>
    </div>

    <div class="lab-msg" v-if="status">{{ status }}</div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>打ち出す速さ（円軌道の速さ v₁ の何倍か）: <strong>{{ ratio.toFixed(2) }} 倍</strong></label>
        <input type="range" v-model.number="ratio" min="0.6" max="1.55" step="0.01" />
        <div class="lab-note">1.00 = 円軌道、1.41（√2）以上 = 地球の引力圏から脱出</div>
      </div>
      <div class="lab-ctrl">
        <label>打ち出す位置（地球中心からの距離）r₀: <strong>{{ r0.toFixed(1) }} ×10³ km</strong></label>
        <input type="range" v-model.number="r0" min="7" max="20" step="0.5" />
        <div class="lab-note">地表からの高さ h = {{ ((r0 - RE) * 1000).toFixed(0) }} km（地球半径 6370 km）</div>
      </div>
      <div class="lab-ctrl">
        <label>プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 1) < 0.005 }" @click="preset(1)">円軌道</button>
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 1.2) < 0.005 }" @click="preset(1.2)">楕円軌道</button>
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 0.8) < 0.005 }" @click="preset(0.8)">遅すぎる</button>
          <button class="lab-chip" :class="{ on: Math.abs(ratio - 1.45) < 0.005 }" @click="preset(1.45)">脱出</button>
        </div>
        <label style="margin-top:0.5rem"><input type="checkbox" v-model="showSectors" /> 一定時間ごとに掃く面積（3D扇形）を表示</label>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">現在の速さ v</div>
        <div class="v" style="color:#10b981">{{ (curV * 1000).toFixed(2) }} <small>km/s</small></div>
        <div class="f">この位置での円軌道の速さ {{ (vc0 * 1000).toFixed(2) }} km/s</div>
      </div>
      <div class="lab-stat">
        <div class="k">地球中心からの距離 r</div>
        <div class="v" style="color:#38bdf8">{{ curR.toFixed(1) }} <small>×10³ km</small></div>
      </div>
      <div class="lab-stat">
        <div class="k">面積速度 ½ r v sinθ</div>
        <div class="v" style="color:#c084fc">{{ (areal / 1e3).toFixed(2) }} <small>×10⁹ m²/s</small></div>
        <div class="f">軌道上のどこでも一定（第2法則）</div>
      </div>
      <div class="lab-stat">
        <div class="k">力学的エネルギー（1 kg あたり）</div>
        <div class="v" :style="{ color: energy < 0 ? '#38bdf8' : '#f59e0b', fontSize: '1rem' }">
          {{ (energy * 1e6).toFixed(1) }} <small>×10⁶ J/kg</small>
        </div>
        <div class="f">{{ energy < 0 ? '負 → 地球に束縛される' : '0 以上 → 無限遠へ脱出' }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">公転周期 T</div>
        <div class="v">{{ periodText }}</div>
        <div class="f">T² ∝ a³（第3法則）</div>
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

// 単位：距離 Mm（=10³ km）、時間 s、速さ Mm/s
const GM = 3.986e-4 // 地球の GM [Mm³/s²]
const RE = 6.37 // 地球半径 [Mm]

const ratio = ref(1.0)
const r0 = ref(10)
const playing = ref(true)
const timeScale = ref(0.5)
const showSectors = ref(true)
const status = ref('')
const activeCam = ref('3d')

const vc0 = computed(() => Math.sqrt(GM / r0.value))
const T0 = computed(() => 2 * Math.PI * Math.sqrt(r0.value ** 3 / GM))

let x = 0, y = 0, vx = 0, vy = 0, simT = 0, stopped = false
let trail = []
let orbitT = Infinity
const curV = ref(0), curR = ref(0), areal = ref(0), energy = ref(0)

const periodText = computed(() => {
  if (energy.value >= 0) return '— (周回しない)'
  const a = -GM / (2 * energy.value)
  const T = 2 * Math.PI * Math.sqrt(a ** 3 / GM)
  return `${(T / 3600).toFixed(2)} 時間`
})

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.60, Math.max(1.32, 1.40 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'top') {
    return { pos: [0.2, 46.0 * ms, 0.45], target: [0.2, 0, 0], fov: 14 }
  }
  if (preset === 'side') {
    return { pos: [0.2, 0.8, 46.0 * ms], target: [0.2, 0, 0], fov: 14 }
  }
  return { pos: [0.8 * ms, 9.2 * ms, 13.0 * ms], target: [0.3, 0, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false
let lastSectorCount = -1
let lastShowSectors = true

function preset(v) {
  ratio.value = v
}

function reset() {
  x = -r0.value
  y = 0
  vx = 0
  vy = -vc0.value * ratio.value // 反時計回り
  simT = 0
  stopped = false
  trail = [{ x, y, t: 0 }]
  lastSectorCount = -1
  status.value = ''
  measure()
  orbitT = energy.value < 0 ? 2 * Math.PI * Math.sqrt((-GM / (2 * energy.value)) ** 3 / GM) : Infinity
  rebuildStaticPlanet()
  updateFrame()
}

function acc(px, py) {
  const r2 = px * px + py * py
  const r = Math.sqrt(r2)
  const a = -GM / r2
  return [(a * px) / r, (a * py) / r]
}

function rk4(h) {
  const [a1x, a1y] = acc(x, y)
  const [a2x, a2y] = acc(x + 0.5 * h * vx, y + 0.5 * h * vy)
  const v2x = vx + 0.5 * h * a1x, v2y = vy + 0.5 * h * a1y
  const [a3x, a3y] = acc(x + 0.5 * h * v2x, y + 0.5 * h * v2y)
  const v3x = vx + 0.5 * h * a2x, v3y = vy + 0.5 * h * a2y
  const [a4x, a4y] = acc(x + h * v3x, y + h * v3y)
  const v4x = vx + h * a3x, v4y = vy + h * a3y
  x += (h / 6) * (vx + 2 * v2x + 2 * v3x + v4x)
  y += (h / 6) * (vy + 2 * v2y + 2 * v3y + v4y)
  vx += (h / 6) * (a1x + 2 * a2x + 2 * a3x + a4x)
  vy += (h / 6) * (a1y + 2 * a2y + 2 * a3y + a4y)
}

function measure() {
  const r = Math.hypot(x, y), v = Math.hypot(vx, vy)
  curR.value = r
  curV.value = v
  areal.value = 0.5 * Math.abs(x * vy - y * vx) * 1e6
  energy.value = 0.5 * v * v - GM / r
}

function stepSim(delta = 0.04) {
  step(delta)
  updateFrame()
}

function step(dtReal) {
  if (stopped) return
  const simDt = dtReal * timeScale.value * (T0.value / 7)
  const N = 32
  for (let i = 0; i < N; i++) {
    rk4(simDt / N)
    simT += simDt / N
    const r = Math.hypot(x, y)
    if (r < RE) {
      stopped = true
      status.value = '💥 地表に落下しました。速さが足りないと、軌道の一部が地球の内側に入ってしまいます。'
      break
    }
    if (r > 30 * r0.value) {
      stopped = true
      status.value = '🚀 地球の引力圏から脱出しました（力学的エネルギーが 0 以上）。'
      break
    }
  }
  if (simT <= orbitT * 1.001 && trail.length < 600) {
    trail.push({ x, y, t: simT })
  }
  measure()
}

// 地球テクスチャをCanvasで生成
function createEarthTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#0284c7')
  grad.addColorStop(0.5, '#0369a1')
  grad.addColorStop(1, '#075985')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 256)

  // 大陸風パッチ
  ctx.fillStyle = 'rgba(16, 185, 129, 0.55)'
  const patches = [
    [110, 80, 48, 32],
    [140, 140, 32, 48],
    [250, 75, 55, 35],
    [270, 130, 38, 45],
    [370, 70, 65, 42],
    [410, 165, 36, 26]
  ]
  patches.forEach(([px, py, rx, ry]) => {
    ctx.beginPath()
    ctx.ellipse(px, py, rx, ry, 0.3, 0, Math.PI * 2)
    ctx.fill()
  })

  // 雲バンド
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
  for (let i = 0; i < 12; i++) {
    ctx.fillRect((i * 47) % 480, (i * 23) % 230, 55, 6)
  }
  return new THREE.CanvasTexture(canvas)
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
      if (playing.value) {
        step(dt)
      }
      if (sceneObjs && sceneObjs.earthMesh) {
        sceneObjs.earthMesh.rotation.y += dt * 0.25
      }
      updateFrame()
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

  // 星空パーティクル
  const starGeo = new THREE.BufferGeometry()
  const starCount = 260
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.sin(i * 127.1) * 0.5) * 70
    starPos[i * 3 + 1] = (Math.cos(i * 311.7) * 0.5) * 45
    starPos[i * 3 + 2] = (Math.sin(i * 74.7) * 0.5) * 70 - 15
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starPoints = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.16, transparent: true, opacity: 0.65 })
  )
  scene.add(starPoints)

  // 重力場グリッドリング (軌道平面 y = -0.02)
  const fieldGroup = new THREE.Group()
  for (const rad of [1.5, 3.0, 4.5, 6.0]) {
    const rGeo = new THREE.RingGeometry(rad - 0.022, rad + 0.022, 64)
    rGeo.rotateX(-Math.PI / 2)
    const rMat = new THREE.MeshBasicMaterial({
      color: rad === 3.0 ? 0x475569 : 0x334155,
      transparent: true,
      opacity: rad === 3.0 ? 0.5 : 0.3,
      side: THREE.DoubleSide
    })
    fieldGroup.add(new THREE.Mesh(rGeo, rMat))
  }
  scene.add(fieldGroup)

  // 3D 地球メッシュ
  const earthTex = createEarthTexture()
  const earthGeo = new THREE.SphereGeometry(1, 36, 36)
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTex,
    roughness: 0.45,
    metalness: 0.1
  })
  const earthMesh = new THREE.Mesh(earthGeo, earthMat)
  scene.add(earthMesh)

  // 大気ハロー
  const atmoGeo = new THREE.SphereGeometry(1.08, 32, 32)
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18
  })
  const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat)
  earthMesh.add(atmoMesh)

  const labelEarth = createTextSprite('地球 (Earth)', {
    color: '#e0f2fe',
    borderColor: '#38bdf8',
    scale: 0.5
  })
  scene.add(labelEarth)

  // 3D 人工衛星グループ (本体 + 太陽電池パドル)
  const satGroup = new THREE.Group()
  const satBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.45, metalness: 0.6 })
  )
  satGroup.add(satBody)

  const panelGeo = new THREE.BoxGeometry(0.95, 0.03, 0.26)
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.4 })
  const panels = new THREE.Mesh(panelGeo, panelMat)
  satGroup.add(panels)
  scene.add(satGroup)

  // 3D 軌道軌跡ライン
  const maxTrail = 650
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxTrail * 3), 3))
  const trailMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 })
  const trailLine = new THREE.Line(trailGeo, trailMat)
  scene.add(trailLine)

  // 面積速度セクターメッシュグループ
  const sectorsGroup = new THREE.Group()
  scene.add(sectorsGroup)

  // 3D ベクトル矢印
  const arrowF = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  scene.add(arrowF, arrowV)

  const labelF = createTextSprite('万有引力 F', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.52 })
  const labelV = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.52 })
  scene.add(labelF, labelV)

  sceneObjs = {
    earthMesh,
    labelEarth,
    satGroup,
    trailGeo,
    trailMat,
    trailLine,
    maxTrail,
    sectorsGroup,
    arrowF,
    arrowV,
    labelF,
    labelV
  }

  rebuildStaticPlanet()
  updateFrame()
}

function getScale() {
  // r0 Mm を 3.0 3D units にマッピング
  return 3.0 / r0.value
}

function rebuildStaticPlanet() {
  if (!sceneObjs) return
  const s = getScale()
  const earthR = RE * s
  sceneObjs.earthMesh.scale.setScalar(earthR)
  sceneObjs.labelEarth.position.set(0, earthR + 0.55, 0)
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    satGroup,
    trailGeo,
    trailMat,
    maxTrail,
    sectorsGroup,
    arrowF,
    arrowV,
    labelF,
    labelV
  } = sceneObjs

  const s = getScale()
  // 2D (x, y) を 3D 水平面 (X = x*s, Y = 0, Z = -y*s) に配置
  const sx = x * s
  const sz = -y * s
  const satPos = new THREE.Vector3(sx, 0, sz)
  satGroup.position.copy(satPos)

  // 軌跡の更新
  trailMat.color.setHex(energy.value < 0 ? 0x38bdf8 : 0xf59e0b)
  const arr = trailGeo.getAttribute('position').array
  const count = Math.min(maxTrail, trail.length)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = trail[i].x * s
    arr[i * 3 + 1] = 0.02
    arr[i * 3 + 2] = -trail[i].y * s
  }
  trailGeo.setDrawRange(0, count)
  trailGeo.getAttribute('position').needsUpdate = true

  // 面積速度セクター (3D Fan) — trail長またはトグル変化時のみ再生成して負荷軽減
  const shouldRebuildSectors =
    showSectors.value !== lastShowSectors ||
    (showSectors.value && (trail.length < lastSectorCount || trail.length - lastSectorCount >= 3)) ||
    (!showSectors.value && sectorsGroup.children.length > 0)

  if (shouldRebuildSectors) {
    lastShowSectors = showSectors.value
    lastSectorCount = trail.length
    while (sectorsGroup.children.length > 0) {
      const c = sectorsGroup.children[0]
      sectorsGroup.remove(c)
      if (c.geometry) c.geometry.dispose()
      if (c.material) c.material.dispose()
    }

    if (showSectors.value && energy.value < 0 && trail.length > 3) {
      const dtSec = T0.value / 12
      let start = 0
      let idx = 0
      for (let i = 1; i < trail.length; i++) {
        const k = Math.floor(trail[i].t / dtSec)
        if (k !== idx || i === trail.length - 1) {
          if (i > start) {
            const fanVerts = []
            for (let j = start; j < i; j++) {
              fanVerts.push(
                0, 0.01, 0,
                trail[j].x * s, 0.01, -trail[j].y * s,
                trail[j + 1].x * s, 0.01, -trail[j + 1].y * s
              )
            }
            const fanGeo = new THREE.BufferGeometry()
            fanGeo.setAttribute('position', new THREE.Float32BufferAttribute(fanVerts, 3))
            const fanMat = new THREE.MeshBasicMaterial({
              color: idx % 2 === 0 ? 0x38bdf8 : 0xc084fc,
              transparent: true,
              opacity: 0.22,
              side: THREE.DoubleSide
            })
            sectorsGroup.add(new THREE.Mesh(fanGeo, fanMat))
          }
          start = i
          idx = k
        }
      }
    }
  }

  // 万有引力ベクトル F (地球中心向き ・ 側面視点でも重ならないよう上方 +0.92Y に配置)
  const r = Math.hypot(x, y)
  const fDir = new THREE.Vector3(-sx, 0, -sz).normalize()
  const aMag = GM / (r * r)
  const fLen = Math.min(2.2, Math.max(0.55, aMag * 1.9e5))
  arrowF.setVector(satPos, fDir, fLen)
  labelF.position.copy(satPos).addScaledVector(fDir, fLen * 0.68).add(new THREE.Vector3(0, 0.92, 0))

  // 速度ベクトル v (下方 -0.58Y に配置して側面視点で万有引力Fと完全分離)
  const vDir = new THREE.Vector3(vx, 0, -vy).normalize()
  const vLen = Math.min(2.4, Math.max(0.6, (curV.value / vc0.value) * 1.35))
  arrowV.setVector(satPos, vDir, vLen)
  labelV.updateText(`v = ${(curV.value * 1000).toFixed(1)} km/s`, '#6ee7b7', '#10b981')
  labelV.position.copy(satPos).addScaledVector(vDir, vLen + 0.5).add(new THREE.Vector3(0, -0.58, 0))
}

watch([ratio, r0], reset)
watch(showSectors, updateFrame)

onMounted(() => {
  reset()
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
.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 8px;
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
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #050811;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.85rem;
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
.dot-o { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.speed-telemetry-strip {
  display: flex;
  justify-content: flex-start;
  margin: -0.45rem 0 0.75rem 0;
}
.three-speed-info {
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.25);
  font-size: 0.76rem;
  color: #cbd5e1;
}
.three-speed-info b {
  color: #7dd3fc;
}
.three-hud-hint {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
  pointer-events: none;
}
.speed-control-group {
  border-radius: 10px;
  flex-wrap: wrap;
}
.speed-label {
  white-space: nowrap;
}
.speed-btn-group {
  flex-wrap: wrap;
}
.speed-btn-group button,
.lab-chip {
  white-space: nowrap;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend,
  .three-speed-info,
  .three-hud-hint {
    font-size: 0.67rem;
    padding: 3px 8px;
  }
}
</style>
