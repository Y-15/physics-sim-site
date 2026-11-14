<template>
  <div class="lab" :style="{ '--ac': '#38bdf8', '--ac2': '#a855f7' }">
    <div class="lab-head">
      <span class="lab-title">🔬 3D ボーアの水素原子模型・量子条件・スペクトル系列</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">n = {{ currentN }} ｜ E<sub>{{ currentN }}</sub> = {{ En.toFixed(2) }} eV</span>
      </div>
    </div>

    <p class="lab-desc">
      電子のド・ブロイ波が軌道円周上で「定常波」をつくるボーアの量子条件 2π<i>r</i> = <i>n</i>λ と、準位間遷移による光子の放出・吸収（ライマン・バルマー・パッシェン系列）を 3D 原子模型とエネルギー準位図の同時連動で体験できます。
    </p>

    <!-- カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button
        class="lab-btn primary"
        @click="isPlaying = !isPlaying"
        style="padding: 5px 14px; font-weight: 700; border-radius: 8px; font-size: 0.84rem;"
      >
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
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#ef4444;box-shadow:0 0 6px #ef4444"></i>
          原子核 (+e)
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          電子 (-e) ＆ 定常波
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          定常波の節 (2n個)
        </span>
        <span class="legend-item">
          <i :style="{ background: lastPhotonColor, boxShadow: '0 0 6px ' + lastPhotonColor }"></i>
          遷移光子 hν
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 遷移ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: lastPhotonColor, color: '#f8fafc' }">
        量子条件: 2πr<sub>{{ currentN }}</sub> = {{ currentN }}λ<sub>dB</sub> ｜
        直近遷移: n={{ prevN }} → n={{ currentN }}
        <template v-if="lastPhotonWl"> (λ = {{ lastPhotonWl.toFixed(1) }} nm : {{ lastPhotonType }})</template>
      </span>
    </div>

    <!-- コントロール群 -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>現在の電子の軌道 (主量子数 <i>n</i>): <strong>n = {{ currentN }}</strong></label>
        <div class="lab-row">
          <button
            v-for="n in 5"
            :key="n"
            class="lab-chip"
            :class="{ on: currentN === n }"
            @click="setOrbit(n)"
          >
            n = {{ n }}
          </button>
        </div>
        <div class="lab-note">軌道半径は n² 倍に広がり、定常波の波長数が n 個になります</div>
      </div>

      <div class="lab-ctrl">
        <label>遷移先を選択して光子を放出 / 吸収：</label>
        <div class="lab-row">
          <button
            v-for="target in availableTransitions"
            :key="target"
            class="lab-chip trans-chip"
            @click="triggerTransition(target)"
          >
            {{ currentN > target ? '⬇ 放出' : '⬆ 吸収' }} → n={{ target }}
          </button>
        </div>
        <div class="lab-note">準位が下がると光子放出、上がると光子吸収が 3D アニメーションします</div>
      </div>

      <div class="lab-ctrl">
        <label>ド・ブロイ物質波 &amp; 定常波表示</label>
        <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;color:#38bdf8;margin-top:4px">
          <input type="checkbox" v-model="showWave" />
          物質波の定常波と節 (ノード) を表示
        </label>
        <div class="lab-note">円周上にぴったり n 個の波長が収まる状態のみ安定存在できます</div>
      </div>
    </div>

    <!-- スペクトル系列バッジ -->
    <div class="series-panel">
      <span class="series-title">代表的なスペクトル系列：</span>
      <div class="series-badges">
        <span class="badge-series lyman">ライマン系列 (<i>n</i> → 1: 紫外線 UV)</span>
        <span class="badge-series balmer">バルマー系列 (<i>n</i> → 2: 可視光線 Hα赤 / Hβ水色 / Hγ青紫)</span>
        <span class="badge-series paschen">パッシェン系列 (<i>n</i> → 3: 赤外線 IR)</span>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">軌道半径 <i>r</i><sub><i>n</i></sub> = <i>n</i>² <i>r</i><sub>1</sub></div>
        <div class="v" style="color:#38bdf8">{{ rn.toFixed(3) }} <small>nm</small></div>
        <div class="f">r₁ = 0.0529 nm (ボーア半径)</div>
      </div>
      <div class="lab-stat">
        <div class="k">エネルギー準位 <i>E</i><sub><i>n</i></sub> = −13.6/<i>n</i>²</div>
        <div class="v" style="color:#fbbf24">{{ En.toFixed(2) }} <small>eV</small></div>
        <div class="f">束縛状態の負のエネルギー</div>
      </div>
      <div class="lab-stat">
        <div class="k">電子の速さ <i>v</i><sub><i>n</i></sub> = <i>v</i><sub>1</sub>/<i>n</i></div>
        <div class="v">{{ (vn * 1e-6).toFixed(2) }} <small>×10⁶ m/s</small></div>
        <div class="f">外側の軌道ほどゆっくり運動</div>
      </div>
      <div class="lab-stat">
        <div class="k">物質波波長 λ<sub>dB</sub> = <i>h</i>/<i>mv</i></div>
        <div class="v">{{ lambdaDB.toFixed(3) }} <small>nm</small></div>
        <div class="f">円周 2πr<sub>n</sub> / λ<sub>dB</sub> = {{ currentN }} 波長分</div>
      </div>
      <div class="lab-stat">
        <div class="k">直近の遷移光子波長 λ</div>
        <div class="v" :style="{ color: lastPhotonColor, fontSize: '0.98rem' }">
          {{ lastPhotonWl ? lastPhotonWl.toFixed(1) + ' nm' : '—' }}
        </div>
        <div class="f">{{ lastPhotonType }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const r1 = 0.0529
const E1 = -13.606
const v1 = 2.188e6
const hc_eV_nm = 1239.84

const currentN = ref(2)
const prevN = ref(3)
const showWave = ref(true)

const lastPhotonWl = ref(656.3)
const lastPhotonColor = ref('#ef4444')
const lastPhotonColorInt = ref(0xef4444)
const lastPhotonType = ref('バルマー Hα (赤色光)')

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

const rn = computed(() => currentN.value * currentN.value * r1)
const En = computed(() => E1 / (currentN.value * currentN.value))
const vn = computed(() => v1 / currentN.value)
const lambdaDB = computed(() => (2 * Math.PI * rn.value) / currentN.value)

const availableTransitions = computed(() => [1, 2, 3, 4, 5].filter(n => n !== currentN.value))

// 3D レイアウト定数
const ATOM_CX = -2.35
const LADDER_CX = 3.25
const ORBIT_STEP = 0.54 // n=1..5 -> 0.54 .. 2.70

const threeContainer = ref(null)
let threeCtx = null
let staticGroup = null
let ladderGroup = null
let dynamicGroup = null
let lastCamAspect = 0

let electronAngle = 0.45
let wavePhase = 0

let electronGroup = null
let velArrow = null
let waveTubeMesh = null
let waveLineGeo = null
let wavePositions = null
let nodeSpheres = []
const flyingPhotons = []

function getMobileScale() {
  if (!threeCtx?.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.15, 1.56 / Math.max(0.62, aspect)) : 1.0
}

function isNarrowViewport() {
  return Boolean(threeCtx?.camera && threeCtx.camera.aspect < 1.35)
}

function getSpriteScale(base = 0.40) {
  if (!isNarrowViewport()) return base
  return base * Math.min(1.82, getMobileScale() * 1.02)
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.45 * s, 5.4 * s, 12.6 * s], [0.45, 0.05, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.45, 0.1, 47.0 * s], [0.45, 0.05, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.45, 49.0 * s, -0.35], [0.45, 0, -0.4], duration, 14)
  }
}

function clearGroup(group) {
  if (!group) return
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    child.traverse(obj => {
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
    })
  }
}

function orbitRadius(n) {
  return n * ORBIT_STEP
}

// 視認性最適化されたエネルギー段位配置 (間隔が上に行くほど狭まる定性的特徴を保ちつつ、n=1..5全段が重ならず読める間隔を確保)
function energyToLocalY(n) {
  if (n === Infinity) return 2.15
  const yMap = {
    1: -1.95,
    2: -0.35,
    3: 0.48,
    4: 1.08,
    5: 1.58
  }
  return yMap[n] ?? 0
}

function buildAtomShells() {
  if (!staticGroup) return
  clearGroup(staticGroup)

  const narrow = isNarrowViewport()
  const floorY = -2.45

  const grid = new THREE.GridHelper(17, 17, 0x1e293b, 0x0f172a)
  grid.position.set(0.45, floorY, 0)
  staticGroup.add(grid)

  // 原子核 (+e)
  const nucMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.85,
      roughness: 0.2
    })
  )
  nucMesh.position.set(ATOM_CX, 0, 0)
  staticGroup.add(nucMesh)

  const nucGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.40, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xf87171,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    })
  )
  nucGlow.position.set(ATOM_CX, 0, 0)
  staticGroup.add(nucGlow)

  const nucLbl = createTextSprite(narrow ? '陽子 +e' : '原子核 (+e)', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    fontSize: 26,
    scale: getSpriteScale(0.35)
  })
  nucLbl.position.set(ATOM_CX, -0.78, 0.88)
  staticGroup.add(nucLbl)

  // 各軌道のラベル配置角 (Z/X/Yすべてで非重複になるよう放射状に分散)
  const labelAngles = {
    1: -0.35,      // 右上奥
    2: Math.PI - 0.3, // 左奥
    3: 0.42,       // 右手前
    4: Math.PI + 0.45, // 左手前
    5: -Math.PI * 0.65 // 左上奥
  }

  for (let n = 1; n <= 5; n++) {
    const r = orbitRadius(n)
    const isCur = n === currentN.value
    const ringGeo = new THREE.TorusGeometry(r, isCur ? 0.028 : 0.014, 10, 72)
    ringGeo.rotateX(Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: isCur ? 0x38bdf8 : 0x64748b,
      transparent: true,
      opacity: isCur ? 0.90 : 0.34
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.set(ATOM_CX, 0, 0)
    staticGroup.add(ring)

    if (!narrow || n === 1 || n === currentN.value || n === 5) {
      const lbl = createTextSprite(`n=${n}`, {
        color: isCur ? '#7dd3fc' : '#94a3b8',
        borderColor: isCur ? '#38bdf8' : 'rgba(148,163,184,0.35)',
        fontSize: 24,
        scale: getSpriteScale(0.30)
      })
      const ang = labelAngles[n]
      const rOff = n === 1 ? r + 0.28 : r + 0.12
      const yOff = n === 1 ? 0.32 : n === 2 ? 0.42 : n === 3 ? -0.32 : 0.15
      lbl.position.set(ATOM_CX + rOff * Math.cos(ang), yOff, rOff * Math.sin(ang))
      staticGroup.add(lbl)
    }
  }

  const atomTitle = createTextSprite(narrow ? 'ボーア原子模型' : `ボーア原子模型 (2πr = ${currentN.value}λ_dB)`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 28,
    scale: getSpriteScale(0.38)
  })
  atomTitle.position.set(ATOM_CX, 2.35, -2.55)
  staticGroup.add(atomTitle)
}

function buildEnergyLadder() {
  if (!ladderGroup) return
  clearGroup(ladderGroup)

  const narrow = isNarrowViewport()

  // 3D 展示イーゼル状に -38° 傾斜させて配置 -> 3D俯瞰/正面断面/真上の全視点で全段が明瞭に分離！
  ladderGroup.position.set(LADDER_CX, 0.0, 0.0)
  ladderGroup.rotation.x = -0.66

  const boardW = 3.75
  const boardH = 5.0
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(boardW, boardH, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.72, metalness: 0.22 })
  )
  board.position.set(0, 0.1, -0.14)
  ladderGroup.add(board)

  const frame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-boardW / 2, -boardH / 2 + 0.1, -0.07),
      new THREE.Vector3(boardW / 2, -boardH / 2 + 0.1, -0.07),
      new THREE.Vector3(boardW / 2, boardH / 2 + 0.1, -0.07),
      new THREE.Vector3(-boardW / 2, boardH / 2 + 0.1, -0.07)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  ladderGroup.add(frame)

  const titleLbl = createTextSprite(narrow ? 'エネルギー準位 Eₙ' : 'エネルギー準位 Eₙ = −13.6/n²', {
    color: '#e2e8f0',
    borderColor: '#94a3b8',
    fontSize: 27,
    scale: getSpriteScale(0.37)
  })
  titleLbl.position.set(0, 2.82, 0.14)
  ladderGroup.add(titleLbl)

  // n = ∞ 電離限界
  const yInf = energyToLocalY(Infinity)
  const infBar = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.045, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  )
  infBar.position.set(-0.35, yInf, 0)
  ladderGroup.add(infBar)

  const infLbl = createTextSprite('n=∞ (0eV)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 22,
    scale: getSpriteScale(0.28)
  })
  infLbl.position.set(1.22, yInf, 0.10)
  ladderGroup.add(infLbl)

  // n = 1..5 準位バー (左寄り x = -0.35 にバー、右 x = +1.22 にラベルで完全分離)
  for (let n = 1; n <= 5; n++) {
    const ev = E1 / (n * n)
    const y = energyToLocalY(n)
    const isCur = n === currentN.value

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, isCur ? 0.08 : 0.045, isCur ? 0.14 : 0.08),
      new THREE.MeshStandardMaterial({
        color: isCur ? 0x38bdf8 : 0x64748b,
        emissive: isCur ? 0x0284c7 : 0x000000,
        emissiveIntensity: isCur ? 0.9 : 0
      })
    )
    bar.position.set(-0.35, y, 0)
    ladderGroup.add(bar)

    if (isCur) {
      const eDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.95 })
      )
      eDot.position.set(-1.12, y, 0.10)
      ladderGroup.add(eDot)
    }

    const lblText = narrow ? `n=${n} (${ev.toFixed(1)}eV)` : `n=${n} (${ev.toFixed(2)} eV)`
    const nLbl = createTextSprite(lblText, {
      color: isCur ? '#7dd3fc' : '#cbd5e1',
      borderColor: isCur ? '#38bdf8' : 'rgba(148,163,184,0.35)',
      fontSize: 22,
      scale: getSpriteScale(0.28)
    })
    nLbl.position.set(1.22, y, 0.10)
    ladderGroup.add(nLbl)
  }

  // 直近遷移矢印 (バー中央 x = -0.15, hνラベルをさらに左 x = -1.18 に分離)
  if (prevN.value !== currentN.value) {
    const yFrom = energyToLocalY(prevN.value)
    const yTo = energyToLocalY(currentN.value)
    const dirY = yTo > yFrom ? 1 : -1
    const len = Math.abs(yTo - yFrom)
    if (len > 0.12) {
      const tArrow = createVectorArrow3D({
        color: lastPhotonColorInt.value,
        shaftRadius: 0.038,
        headRadius: 0.11,
        headLength: 0.24
      })
      tArrow.setVector(
        new THREE.Vector3(-0.22, yFrom, 0.14),
        new THREE.Vector3(0, dirY, 0),
        len
      )
      ladderGroup.add(tArrow)

      const tLbl = createTextSprite(`hν ${lastPhotonWl.value.toFixed(0)}nm`, {
        color: '#ffffff',
        borderColor: lastPhotonColor.value,
        fontSize: 23,
        scale: getSpriteScale(0.29)
      })
      tLbl.position.set(-1.18, (yFrom + yTo) / 2, 0.22)
      ladderGroup.add(tLbl)
    }
  }
}

function initDynamicObjects() {
  if (!dynamicGroup) return
  clearGroup(dynamicGroup)
  nodeSpheres = []

  electronGroup = new THREE.Group()
  const eCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.95
    })
  )
  const eHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, depthWrite: false })
  )
  electronGroup.add(eCore, eHalo)
  dynamicGroup.add(electronGroup)

  velArrow = createVectorArrow3D({
    color: 0x34d399,
    shaftRadius: 0.032,
    headRadius: 0.095,
    headLength: 0.22
  })
  dynamicGroup.add(velArrow)

  const STEPS = 180
  waveLineGeo = new THREE.BufferGeometry()
  wavePositions = new Float32Array((STEPS + 1) * 3)
  waveLineGeo.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3))
  waveTubeMesh = new THREE.Line(
    waveLineGeo,
    new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.95 })
  )
  waveTubeMesh.frustumCulled = false
  dynamicGroup.add(waveTubeMesh)

  const nodeGeo = new THREE.SphereGeometry(0.072, 10, 10)
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  for (let i = 0; i < 10; i++) {
    const nm = new THREE.Mesh(nodeGeo, nodeMat)
    nm.visible = false
    dynamicGroup.add(nm)
    nodeSpheres.push(nm)
  }
}

function createPhotonWaveMesh(colorHex) {
  const grp = new THREE.Group()
  const pts = []
  const segs = 28
  for (let i = 0; i <= segs; i++) {
    const u = i / segs
    const x = (u - 0.5) * 1.15
    const env = Math.sin(u * Math.PI)
    const y = Math.sin(u * Math.PI * 5) * 0.16 * env
    const z = Math.cos(u * Math.PI * 5) * 0.08 * env
    pts.push(new THREE.Vector3(x, y, z))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 28, 0.036, 8, false),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.95
    })
  )
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 14, 14),
    new THREE.MeshBasicMaterial({ color: colorHex })
  )
  grp.add(tube, core)
  return grp
}

function classifyTransition(nFrom, nTo) {
  const low = Math.min(nFrom, nTo)
  const high = Math.max(nFrom, nTo)
  if (low === 1) {
    return { hexStr: '#a855f7', hexInt: 0xa855f7, desc: 'ライマン系列 (紫外線 UV)' }
  }
  if (low === 2) {
    if (high === 3) return { hexStr: '#ef4444', hexInt: 0xef4444, desc: 'バルマー Hα (赤色光)' }
    if (high === 4) return { hexStr: '#06b6d4', hexInt: 0x06b6d4, desc: 'バルマー Hβ (青緑色光)' }
    if (high === 5) return { hexStr: '#6366f1', hexInt: 0x6366f1, desc: 'バルマー Hγ (青紫色光)' }
    return { hexStr: '#8b5cf6', hexInt: 0x8b5cf6, desc: 'バルマー系列 (紫色光)' }
  }
  if (low === 3) {
    return { hexStr: '#f97316', hexInt: 0xf97316, desc: 'パッシェン系列 (赤外線 IR)' }
  }
  return { hexStr: '#fb7185', hexInt: 0xfb7185, desc: 'ブラケット系列 (遠赤外線 IR)' }
}

function setOrbit(n) {
  triggerTransition(n)
}

function spawnPhotonPacket(nFrom, nTo, info, wl) {
  if (!dynamicGroup) return
  const isEmission = nFrom > nTo
  const rTo = orbitRadius(nTo)
  const dirAngle = electronAngle
  const dirVec = new THREE.Vector3(Math.cos(dirAngle), 0.14, Math.sin(dirAngle)).normalize()

  const origin = isEmission
    ? new THREE.Vector3(ATOM_CX + rTo * Math.cos(dirAngle), 0.1, rTo * Math.sin(dirAngle))
    : new THREE.Vector3(ATOM_CX + (rTo + 2.8) * Math.cos(dirAngle), 0.35, (rTo + 2.8) * Math.sin(dirAngle))

  const mesh = createPhotonWaveMesh(info.hexInt)
  mesh.position.copy(origin)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), isEmission ? dirVec : dirVec.clone().negate())

  const lbl = createTextSprite(`hν (${wl.toFixed(0)}nm)`, {
    color: '#ffffff',
    borderColor: info.hexStr,
    fontSize: 23,
    scale: getSpriteScale(0.30)
  })
  lbl.position.set(0, 0.34, 0)
  mesh.add(lbl)
  dynamicGroup.add(mesh)

  flyingPhotons.push({
    mesh,
    vel: isEmission ? dirVec.multiplyScalar(2.4) : dirVec.multiplyScalar(-2.2),
    life: isEmission ? 2.4 : 1.15
  })
}

function triggerTransition(targetN) {
  const nFrom = currentN.value
  const nTo = targetN
  if (nFrom === nTo) return

  const eFrom = E1 / (nFrom * nFrom)
  const eTo = E1 / (nTo * nTo)
  const deltaE = Math.abs(eTo - eFrom)
  const wl = hc_eV_nm / deltaE

  const info = classifyTransition(nFrom, nTo)
  prevN.value = nFrom
  currentN.value = nTo
  lastPhotonWl.value = wl
  lastPhotonColor.value = info.hexStr
  lastPhotonColorInt.value = info.hexInt
  lastPhotonType.value = info.desc

  spawnPhotonPacket(nFrom, nTo, info, wl)
  buildAtomShells()
  buildEnergyLadder()
}

function updateDynamic(dt) {
  if (isPlaying.value && dt > 0) {
    const effDt = Math.min(0.05, dt) * timeScale.value
    electronAngle += (vn.value / 1e6) * effDt * 1.65
    wavePhase += effDt * 6.5

    for (let i = flyingPhotons.length - 1; i >= 0; i--) {
      const p = flyingPhotons[i]
      p.mesh.position.addScaledVector(p.vel, effDt)
      p.life -= effDt
      if (p.life <= 0) {
        dynamicGroup.remove(p.mesh)
        p.mesh.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (obj.material.map) obj.material.map.dispose()
            obj.material.dispose()
          }
        })
        flyingPhotons.splice(i, 1)
      }
    }
  }

  const n = currentN.value
  const r = orbitRadius(n)
  const ex = ATOM_CX + r * Math.cos(electronAngle)
  const ez = r * Math.sin(electronAngle)

  if (electronGroup) {
    electronGroup.position.set(ex, 0, ez)
  }

  if (velArrow) {
    const vx = -Math.sin(electronAngle)
    const vz = Math.cos(electronAngle)
    const vLen = 0.52 + (1 / n) * 0.48
    velArrow.setVector(new THREE.Vector3(ex, 0, ez), new THREE.Vector3(vx, 0, vz), vLen)
  }

  if (waveTubeMesh && waveLineGeo && wavePositions) {
    waveTubeMesh.visible = showWave.value
    const STEPS = 180
    if (showWave.value) {
      const ampR = 0.16
      const ampY = 0.12
      const osc = Math.cos(wavePhase)
      for (let i = 0; i <= STEPS; i++) {
        const theta = (i / STEPS) * Math.PI * 2
        const s = Math.sin(n * theta) * osc
        const rr = r + ampR * s
        wavePositions[i * 3] = ATOM_CX + rr * Math.cos(theta)
        wavePositions[i * 3 + 1] = ampY * s
        wavePositions[i * 3 + 2] = rr * Math.sin(theta)
      }
      waveLineGeo.getAttribute('position').needsUpdate = true
    }
  }

  for (let i = 0; i < nodeSpheres.length; i++) {
    const nm = nodeSpheres[i]
    if (showWave.value && i < 2 * n) {
      nm.visible = true
      const theta = (i * Math.PI) / n
      nm.position.set(ATOM_CX + r * Math.cos(theta), 0, r * Math.sin(theta))
    } else {
      nm.visible = false
    }
  }
}

watch(showWave, () => {
  updateDynamic(0)
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0.45, 5.4, 12.6],
    initialTarget: [0.45, 0.05, 0],
    maxDistance: 130,
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        buildAtomShells()
        buildEnergyLadder()
      }
      updateDynamic(dt)
    }
  })

  staticGroup = new THREE.Group()
  ladderGroup = new THREE.Group()
  dynamicGroup = new THREE.Group()
  threeCtx.scene.add(staticGroup)
  threeCtx.scene.add(ladderGroup)
  threeCtx.scene.add(dynamicGroup)

  lastCamAspect = threeCtx.camera.aspect || 1.7
  buildAtomShells()
  buildEnergyLadder()
  initDynamicObjects()
  spawnPhotonPacket(3, 2, classifyTransition(3, 2), 656.3)
  updateDynamic(0)
  setCameraPreset(activeCam.value, 0)
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.lab-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 10px;
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

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 0 0.65rem 0;
  padding: 8px 12px;
  border-radius: 10px;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 4px 10px;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
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
  height: 430px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  margin-bottom: 0.65rem;
}

.three-viewport {
  width: 100%;
  height: 100%;
}

.three-hud-legend {
  position: absolute;
  top: 10px;
  left: 12px;
  max-width: calc(100% - 24px);
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

.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
  pointer-events: none;
}

.ortho-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.2rem 0 0.8rem 0;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.45);
  font-size: 0.75rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
}

.trans-chip:hover {
  border-color: #fbbf24;
  color: #fde68a;
}

.series-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 0.9rem;
  flex-wrap: wrap;
}

.series-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #e4e4e7;
}

.series-badges {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.badge-series {
  font-size: 0.72rem;
  padding: 2px 9px;
  border-radius: 9999px;
}

.badge-series.lyman {
  background: rgba(168, 85, 247, 0.18);
  border: 1px solid #a855f7;
  color: #d8b4fe;
}

.badge-series.balmer {
  background: rgba(56, 189, 248, 0.18);
  border: 1px solid #38bdf8;
  color: #7dd3fc;
}

.badge-series.paschen {
  background: rgba(249, 115, 22, 0.18);
  border: 1px solid #f97316;
  color: #fdba74;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 345px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 7px;
    font-size: 0.67rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.67rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    font-size: 0.7rem;
    padding: 4px 9px;
  }
}

@media (max-width: 640px) {
  .lab {
    padding: 0.85rem;
  }
  .speed-control-group {
    border-radius: 10px;
    padding: 5px 9px;
    width: 100%;
  }
  .ortho-status-strip {
    justify-content: flex-start;
  }
}
</style>
