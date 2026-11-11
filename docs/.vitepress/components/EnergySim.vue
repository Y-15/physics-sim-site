<template>
  <div class="lab" style="--ac:#10b981;--ac2:#38bdf8">
    <div class="lab-head">
      <span class="lab-title">⚡ 3D 仕事・仕事率と力学的エネルギー保存則 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">保存力・非保存力・摩擦熱</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="lab-chip"
          :class="{ on: activeCam === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🎥 3D 俯瞰視点
        </button>
        <button
          class="lab-chip"
          :class="{ on: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面視点 (コース＋エネルギー柱)
        </button>
        <button
          class="lab-chip"
          :class="{ on: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ playing && !stopped ? '⏸ 一時停止' : '▶ 再生' }}
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
        ⏮ 最初から滑らせる
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
        <span class="legend-item"><i class="dot-n"></i>垂直抗力 <b>N</b></span>
        <span class="legend-item"><i class="dot-mg"></i>重力 <b>mg</b></span>
        <span class="legend-item"><i class="dot-u"></i>U</span>
        <span class="legend-item"><i class="dot-k"></i>K</span>
        <span class="legend-item"><i class="dot-q"></i>Q</span>
      </div>

      <!-- リアルタイムエネルギーバー HUD -->
      <div class="energy-hud-panel">
        <div class="energy-hud-title">エネルギー収支 (総計 {{ totalE0.toFixed(1) }} J)</div>
        <div class="energy-bar-track">
          <div class="bar-seg bar-u" :style="{ width: uPct + '%' }" title="位置エネルギー U"></div>
          <div class="bar-seg bar-k" :style="{ width: kPct + '%' }" title="運動エネルギー K"></div>
          <div class="bar-seg bar-q" :style="{ width: qPct + '%' }" title="摩擦熱 Q"></div>
        </div>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>スタートの高さ h: <strong>{{ h0.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="h0" min="1.0" max="4.0" step="0.2" />
      </div>
      <div class="lab-ctrl">
        <label>物体の質量 m: <strong>{{ m.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.5" max="4.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>あらい床の動摩擦係数 μₖ: <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.0" max="0.5" step="0.05" />
        <div class="lab-note">0.00 = なめらか（エネルギー完全保存）、0.05以上 = 摩擦熱で減速</div>
      </div>
      <div class="lab-ctrl">
        <label>プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: muK === 0 }" @click="muK = 0; reset()">摩擦なし (保存則)</button>
          <button class="lab-chip" :class="{ on: muK === 0.2 }" @click="muK = 0.2; reset()">適度な摩擦 (μ=0.2)</button>
          <button class="lab-chip" :class="{ on: muK === 0.45 }" @click="muK = 0.45; reset()">強い摩擦 (μ=0.45)</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">全エネルギー E</div>
        <div class="v">{{ totalE0.toFixed(1) }} <small>J</small></div>
        <div class="f">E = K + U + 摩擦熱 Q（常に一定！）</div>
      </div>
      <div class="lab-stat">
        <div class="k">運動エネルギー K</div>
        <div class="v" style="color:#38bdf8">{{ curK.toFixed(1) }} <small>J</small></div>
        <div class="f">K = ½mv² (速さ {{ curV.toFixed(2) }} m/s)</div>
      </div>
      <div class="lab-stat">
        <div class="k">重力位置エネルギー U</div>
        <div class="v" style="color:#10b981">{{ curU.toFixed(1) }} <small>J</small></div>
        <div class="f">U = mgh (高さ {{ curH.toFixed(2) }} m)</div>
      </div>
      <div class="lab-stat">
        <div class="k">摩擦によって発生した熱 Q</div>
        <div class="v" style="color:#f59e0b">{{ curQ.toFixed(1) }} <small>J</small></div>
        <div class="f">W_非保存力 = -μₖmg·s</div>
      </div>
      <div class="lab-stat">
        <div class="k">最下点での理論速さ</div>
        <div class="v">{{ Math.sqrt(2 * g * h0).toFixed(2) }} <small>m/s</small></div>
        <div class="f">v = √(2gh) (質量によらない！)</div>
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
let sceneObjects = null
let lastTxtV = ''
let lastTxtMg = ''

const activeCam = ref('3d')
const h0 = ref(3.0) // m
const m = ref(1.5) // kg
const muK = ref(0.15)
const g = 9.8

const playing = ref(true)
const stopped = ref(false)
const timeScale = ref(0.5)

const totalE0 = computed(() => m.value * g * h0.value)

let s = 0 // 軌道に沿った道のり [m]
let v = 0 // 現在の速さ [m/s]
let heatQ = 0
let stopTimer = 0

const curH = ref(3.0)
const curV = ref(0)
const curK = ref(0)
const curU = ref(0)
const curQ = ref(0)

const uPct = computed(() => Math.max(0, Math.min(100, (curU.value / Math.max(0.01, totalE0.value)) * 100)))
const kPct = computed(() => Math.max(0, Math.min(100, (curK.value / Math.max(0.01, totalE0.value)) * 100)))
const qPct = computed(() => Math.max(0, Math.min(100, (curQ.value / Math.max(0.01, totalE0.value)) * 100)))

// なめらかなローラーコースター軌道定義:
// 水平スパン slopeHoriz = 4.6 m にわたって cos 曲線で高さ h0 -> 0 へ降下し、その先 flatLen = 8.0 m の水平面へ接続
const slopeHoriz = 4.6
const flatLen = 8.5
const startX_m = -5.6 // ワールドメートル原点オフセット

function buildTrackSamples(heightM) {
  const pts = []
  const nCurve = 100
  let accumS = 0
  let prevX = 0
  let prevY = heightM
  for (let i = 0; i <= nCurve; i++) {
    const u = i / nCurve
    const x = u * slopeHoriz
    // y = h0 * 0.5 * (1 + cos(pi * u)) : u=0 で傾き0、u=1 で高さ0かつ傾き0で水平面に滑らか接続！
    const y = heightM * 0.5 * (1 + Math.cos(Math.PI * u))
    if (i > 0) {
      accumS += Math.hypot(x - prevX, y - prevY)
    }
    pts.push({ s: accumS, x, y })
    prevX = x
    prevY = y
  }
  return { pts, curveArcLen: accumS }
}

function evalTrackAtS(dist) {
  const { pts, curveArcLen } = buildTrackSamples(h0.value)
  if (dist <= 0) {
    return { x: 0, y: h0.value, tx: 1, ty: 0, onCurve: true, curveArcLen }
  }
  if (dist < curveArcLen) {
    // 二分探索または線形走査で補間
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].s >= dist) {
        const p0 = pts[i - 1]
        const p1 = pts[i]
        const seg = Math.max(1e-6, p1.s - p0.s)
        const f = (dist - p0.s) / seg
        const x = p0.x + (p1.x - p0.x) * f
        const y = p0.y + (p1.y - p0.y) * f
        const dx = p1.x - p0.x
        const dy = p1.y - p0.y
        const len = Math.hypot(dx, dy) || 1
        return { x, y, tx: dx / len, ty: dy / len, onCurve: true, curveArcLen }
      }
    }
  }
  const flatDist = dist - curveArcLen
  return { x: slopeHoriz + flatDist, y: 0, tx: 1, ty: 0, onCurve: false, curveArcLen }
}

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.25, 1.82 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  const targetY = s > 1.05 ? 2.15 : 1.5
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.6 * s, 5.2 * s, 13.4 * s], [0.3, targetY, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.3, targetY, 42.0 * s], [0.3, targetY, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.4, 56.0 * s, 0.01], [0.4, 0, 0], duration, 14)
  }
}

function togglePlay() {
  if (stopped.value) {
    reset()
    playing.value = true
  } else {
    playing.value = !playing.value
  }
}

function reset() {
  s = 0.05 // わずかに傾きがある位置から即座に滑り出す
  const st = evalTrackAtS(s)
  v = Math.sqrt(Math.max(0, 2 * g * (h0.value - st.y)))
  heatQ = 0
  stopped.value = false
  stopTimer = 0
  updateStats()
  rebuildTrackGeometry()
  updateDynamicFrame()
}

function updateStats() {
  const pos = evalTrackAtS(s)
  curH.value = pos.y
  curV.value = v
  curU.value = m.value * g * pos.y
  curK.value = 0.5 * m.value * v * v
  curQ.value = heatQ
}

function step(dt) {
  if (stopped.value) {
    stopTimer += dt
    if (stopTimer > 1.3) {
      reset()
    }
    return
  }

  const subSteps = 4
  const sdt = dt / subSteps
  const { curveArcLen } = buildTrackSamples(h0.value)

  for (let i = 0; i < subSteps; i++) {
    if (s < curveArcLen) {
      // 曲線スロープ（摩擦なし：力学的エネルギー完全保存）
      const st = evalTrackAtS(s)
      const sinTheta = Math.max(0.05, -st.ty) // 接線下向き成分
      const a = g * sinTheta
      v += a * sdt
      s += v * sdt
      // 位置に応じた正確な力学的エネルギー保存速度に補正
      const stNext = evalTrackAtS(s)
      v = Math.sqrt(Math.max(0, 2 * g * (h0.value - stNext.y)))
    } else {
      // 水平トラック区間（動摩擦あり）
      s += v * sdt
      if (muK.value > 0) {
        const a = -muK.value * g
        const prevV = v
        v += a * sdt
        if (v <= 0) {
          v = 0
          stopped.value = true
          heatQ = totalE0.value
          break
        } else {
          heatQ += 0.5 * m.value * (prevV * prevV - v * v)
        }
      }
      if (s - curveArcLen >= flatLen) {
        stopped.value = true
        break
      }
    }
  }

  updateStats()
}

function stepSim(delta = 0.04) {
  playing.value = false
  step(delta)
  updateDynamicFrame()
}

function initThree() {
  if (!threeContainer.value) return
  let lastCamAspect = 0
  lastTxtV = ''
  lastTxtMg = ''

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0.6, 5.2, 13.4],
    initialTarget: [0.3, 1.5, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.18) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
      }
      if (playing.value) {
        step(dt * timeScale.value)
      }
      updateDynamicFrame()
    }
  })

  const { scene } = threeCtx

  // 1. 床グリッド
  const grid = new THREE.GridHelper(22, 22, 0x1e293b, 0x0f172a)
  grid.position.set(0.5, -0.02, 0)
  scene.add(grid)

  const trackGroup = new THREE.Group()
  scene.add(trackGroup)

  // 2. 移動する発光スフィア（質量に応じサイズ調整）
  const sphereGeo = new THREE.SphereGeometry(0.28, 28, 28)
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.3
  })
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
  scene.add(sphereMesh)

  const haloMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 })
  )
  sphereMesh.add(haloMesh)

  // 3. 3D ベクトル矢印 (v: エメラルド, N: シアン, mg: アンバー) & 床影投影
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowN = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.045, headRadius: 0.13, headLength: 0.3 })
  const arrowMg = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.045, headRadius: 0.13, headLength: 0.3 })
  scene.add(arrowV, arrowN, arrowMg)

  const labelV = createTextSprite('v = 0.0 m/s', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 32,
    scale: 0.46
  })
  const labelN = createTextSprite('N', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 30,
    scale: 0.42
  })
  const labelMg = createTextSprite('mg', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 30,
    scale: 0.42
  })
  scene.add(labelV, labelN, labelMg)

  // 床影ドットと鉛直ガイドライン
  const shadowGeo = new THREE.CircleGeometry(0.28, 24)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowMesh = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.38 })
  )
  scene.add(shadowMesh)

  const dropShadowGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3()
  ])
  const dropShadowLine = new THREE.Line(
    dropShadowGeo,
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 })
  )
  scene.add(dropShadowLine)

  // 現在の高さライン（左端ポールへの投影点）
  const hDropLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3()
  ])
  const hDropLine = new THREE.Line(
    hDropLineGeo,
    new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.55 })
  )
  scene.add(hDropLine)

  // 4. 3D リアルタイム・エネルギー柱 (右後方に配置: U, K, Q, Total)
  const barBaseX = 4.2
  const barZ = -2.2
  const maxBarH = 3.2

  const barStand = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.12, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
  )
  barStand.position.set(barBaseX + 0.9, -0.06, barZ)
  scene.add(barStand)

  const pillarGeo = new THREE.BoxGeometry(0.55, 1, 0.55)
  pillarGeo.translate(0, 0.5, 0)

  const barU = new THREE.Mesh(
    pillarGeo,
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.35 })
  )
  barU.position.set(barBaseX - 0.1, 0, barZ)

  const barK = new THREE.Mesh(
    pillarGeo,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.35 })
  )
  barK.position.set(barBaseX + 0.9, 0, barZ)

  const barQ = new THREE.Mesh(
    pillarGeo,
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.35 })
  )
  barQ.position.set(barBaseX + 1.9, 0, barZ)

  scene.add(barU, barK, barQ)

  // 全エネルギー基準ワイヤーフレーム枠
  const totalFrameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.2, maxBarH, 0.72))
  const totalFrame = new THREE.LineSegments(
    totalFrameGeo,
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 })
  )
  totalFrame.position.set(barBaseX + 0.9, maxBarH / 2, barZ)
  scene.add(totalFrame)

  const lblBarTitle = createTextSprite('エネルギー 3D 棒グラフ', {
    color: '#e2e8f0',
    borderColor: 'rgba(148,163,184,0.45)',
    fontSize: 30,
    scale: 0.44
  })
  lblBarTitle.position.set(barBaseX + 0.9, maxBarH + 0.45, barZ)
  scene.add(lblBarTitle)

  const lblU = createTextSprite('U', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.42 })
  lblU.position.set(barBaseX - 0.1, -0.38, barZ + 0.45)
  const lblK = createTextSprite('K', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 30, scale: 0.42 })
  lblK.position.set(barBaseX + 0.9, -0.38, barZ + 0.45)
  const lblQ = createTextSprite('Q', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 30, scale: 0.42 })
  lblQ.position.set(barBaseX + 1.9, -0.38, barZ + 0.45)
  scene.add(lblU, lblK, lblQ)

  sceneObjects = {
    trackGroup,
    sphereMesh,
    haloMesh,
    shadowMesh,
    dropShadowLine,
    arrowV,
    arrowN,
    arrowMg,
    labelV,
    labelN,
    labelMg,
    hDropLine,
    barU,
    barK,
    barQ,
    maxBarH
  }

  reset()
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const c = group.children[0]
    group.remove(c)
    if (c.geometry) c.geometry.dispose()
    if (c.material) {
      if (Array.isArray(c.material)) c.material.forEach(m => m.dispose())
      else c.material.dispose()
    }
  }
}

function rebuildTrackGeometry() {
  if (!sceneObjects) return
  const { trackGroup } = sceneObjects
  clearGroup(trackGroup)

  const { pts } = buildTrackSamples(h0.value)
  const railSpread = 0.34

  // 左右の3Dコースターレール（カーブ部：シアン、水平部：摩擦ありならアンバー、なしならシアン）
  const curveLeft = []
  const curveRight = []
  pts.forEach(p => {
    curveLeft.push(new THREE.Vector3(startX_m + p.x, p.y, -railSpread))
    curveRight.push(new THREE.Vector3(startX_m + p.x, p.y, railSpread))
  })

  const rampMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    metalness: 0.5,
    roughness: 0.25
  })

  trackGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curveLeft), 64, 0.055, 10, false), rampMat))
  trackGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curveRight), 64, 0.055, 10, false), rampMat))

  // カーブ区間枕木と支柱
  for (let i = 0; i < pts.length; i += 10) {
    const p = pts[i]
    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.05, railSpread * 2 + 0.14),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4 })
    )
    tie.position.set(startX_m + p.x, p.y - 0.04, 0)
    trackGroup.add(tie)

    if (p.y > 0.25 && i % 20 === 0) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, p.y, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4 })
      )
      pillar.position.set(startX_m + p.x, p.y / 2, 0)
      trackGroup.add(pillar)
    }
  }

  // 水平摩擦トラック板
  const flatColor = muK.value > 0 ? 0xf59e0b : 0x38bdf8
  const flatBoard = new THREE.Mesh(
    new THREE.BoxGeometry(flatLen, 0.14, 1.2),
    new THREE.MeshStandardMaterial({
      color: muK.value > 0 ? 0x451a03 : 0x0c4a6e,
      roughness: muK.value > 0 ? 0.9 : 0.25,
      metalness: 0.2
    })
  )
  flatBoard.position.set(startX_m + slopeHoriz + flatLen / 2, -0.07, 0)
  trackGroup.add(flatBoard)

  const flatRailMat = new THREE.MeshStandardMaterial({
    color: flatColor,
    emissive: flatColor,
    emissiveIntensity: 0.35
  })
  const flatRailLeft = new THREE.Mesh(new THREE.BoxGeometry(flatLen, 0.06, 0.07), flatRailMat)
  flatRailLeft.position.set(startX_m + slopeHoriz + flatLen / 2, 0.02, -railSpread)
  const flatRailRight = new THREE.Mesh(new THREE.BoxGeometry(flatLen, 0.06, 0.07), flatRailMat)
  flatRailRight.position.set(startX_m + slopeHoriz + flatLen / 2, 0.02, railSpread)
  trackGroup.add(flatRailLeft, flatRailRight)

  const flatLabel = createTextSprite(
    muK.value > 0 ? `あらい水平面 (μₖ = ${muK.value.toFixed(2)})` : 'なめらかな水平面 (摩擦なし)',
    {
      color: muK.value > 0 ? '#fde68a' : '#7dd3fc',
      borderColor: muK.value > 0 ? '#f59e0b' : '#38bdf8',
      fontSize: 30,
      scale: 0.46
    }
  )
  flatLabel.position.set(startX_m + slopeHoriz + 1.35, -0.48, 0.95)
  trackGroup.add(flatLabel)

  // スタート高さ h0 マーカーポール
  const poleX = startX_m - 0.65
  const hPole = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.028, headRadius: 0.09, headLength: 0.24 })
  hPole.setVector(new THREE.Vector3(poleX, 0, 0), new THREE.Vector3(0, 1, 0), h0.value)
  trackGroup.add(hPole)

  const hLabel = createTextSprite(`高さ h₀ = ${h0.value.toFixed(1)} m`, {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 32,
    scale: 0.48
  })
  hLabel.position.set(startX_m + 1.35, Math.max(0.75, h0.value * 0.42), -1.35)
  trackGroup.add(hLabel)
}

function updateDynamicFrame() {
  if (!sceneObjects) return
  const {
    sphereMesh,
    haloMesh,
    shadowMesh,
    dropShadowLine,
    arrowV,
    arrowN,
    arrowMg,
    labelV,
    labelN,
    labelMg,
    hDropLine,
    barU,
    barK,
    barQ,
    maxBarH
  } = sceneObjects

  const pos = evalTrackAtS(s)
  const radius = 0.22 + m.value * 0.035
  const scaleRatio = radius / 0.28
  sphereMesh.scale.set(scaleRatio, scaleRatio, scaleRatio)

  // 法線方向オフセットしてレール上に載せる
  const nx = -pos.ty
  const ny = pos.tx
  const wx = startX_m + pos.x + nx * (radius * 0.72)
  const wy = pos.y + ny * (radius * 0.72)
  const spherePos = new THREE.Vector3(wx, wy, 0)
  sphereMesh.position.copy(spherePos)

  // 床影投影
  shadowMesh.position.set(wx, 0.015, 0)
  shadowMesh.scale.setScalar(scaleRatio)
  const dsAttr = dropShadowLine.geometry.getAttribute('position')
  dsAttr.setXYZ(0, wx, wy, 0)
  dsAttr.setXYZ(1, wx, 0.015, 0)
  dsAttr.needsUpdate = true

  // 摩擦発熱時のハロー色変化
  if (!pos.onCurve && muK.value > 0 && v > 0.1) {
    haloMesh.material.color.setHex(0xf59e0b)
    haloMesh.material.opacity = 0.4
  } else {
    haloMesh.material.color.setHex(0x38bdf8)
    haloMesh.material.opacity = 0.22
  }

  // 高さガイド線
  const dAttr = hDropLine.geometry.getAttribute('position')
  dAttr.setXYZ(0, wx, pos.y, 0)
  dAttr.setXYZ(1, startX_m - 0.65, pos.y, 0)
  dAttr.needsUpdate = true

  // 速度ベクトル矢印
  if (v > 0.12) {
    const vDir = new THREE.Vector3(pos.tx, pos.ty, 0)
    const vLen = Math.min(2.4, Math.max(0.45, v * 0.22))
    arrowV.setVector(spherePos, vDir, vLen)
    labelV.visible = true
    const txtV = `v = ${v.toFixed(1)} m/s`
    if (txtV !== lastTxtV) {
      lastTxtV = txtV
      labelV.updateText(txtV, '#6ee7b7', '#10b981')
    }
    labelV.position.copy(spherePos).addScaledVector(vDir, vLen + 0.45)
    labelV.position.z += 0.25
  } else {
    arrowV.visible = false
    labelV.visible = false
  }

  // 重力 mg (下向き) & 垂直抗力 N (法線向き・上面視点でも h₀/v/mg と重複しないよう z レーン分離)
  const fLen = 0.75 + m.value * 0.14
  arrowMg.setVector(spherePos, new THREE.Vector3(0, -1, 0), fLen)
  const txtMg = `mg = ${(m.value * g).toFixed(0)}N`
  if (txtMg !== lastTxtMg) {
    lastTxtMg = txtMg
    labelMg.updateText(txtMg, '#fde68a', '#f59e0b')
  }
  labelMg.position.set(wx + 0.45, Math.max(0.28, wy - fLen - 0.25), 1.25)

  const nDir = new THREE.Vector3(nx, ny, 0)
  const nLen = fLen * ny
  arrowN.setVector(spherePos, nDir, Math.max(0.42, nLen))
  labelN.position.copy(spherePos).addScaledVector(nDir, Math.max(0.42, nLen) + 0.35)
  labelN.position.z = -0.62

  // 3D エネルギー棒グラフ更新
  const E = Math.max(0.01, totalE0.value)
  const hU = Math.max(0.02, (curU.value / E) * maxBarH)
  const hK = Math.max(0.02, (curK.value / E) * maxBarH)
  const hQ = Math.max(0.02, (curQ.value / E) * maxBarH)

  barU.scale.set(1, hU, 1)
  barK.scale.set(1, hK, 1)
  barQ.scale.set(1, hQ, 1)
}

watch([h0, m, muK], () => {
  reset()
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
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
  padding: 8px 14px;
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
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
  height: 400px;
  background: #080c16;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.75rem;
  color: #e2e8f0;
  pointer-events: none;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.legend-item i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-n { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-mg { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-u { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-k { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-q { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.energy-hud-panel {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 210px;
  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.24);
  pointer-events: none;
}
.energy-hud-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #cbd5e1;
  margin-bottom: 5px;
}
.energy-bar-track {
  display: flex;
  width: 100%;
  height: 11px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.bar-seg {
  height: 100%;
  transition: width 0.05s linear;
}
.bar-u { background: #10b981; }
.bar-k { background: #38bdf8; }
.bar-q { background: #f59e0b; }
.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.74rem;
  color: #cbd5e1;
  pointer-events: none;
}
.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
}
.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 12px !important;
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
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 350px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.7rem;
  }
  .speed-control-group {
    padding: 6px 10px !important;
    width: 100%;
  }
  .energy-hud-panel {
    top: auto;
    bottom: 38px;
    left: 12px;
    right: auto;
    width: 185px;
  }
}
</style>
