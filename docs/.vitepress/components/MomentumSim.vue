<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">💥 3D 運動量保存と衝突 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="sim-badge">運動量・反発係数・力積と重心</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="cam-chip"
          :class="{ active: activeCam === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🎥 3D 俯瞰視点
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面視点 (エアトラック)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点 (重心等速の確認)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <span class="speed-label" style="font-size:0.8rem;color:#94a3b8;">⏱️ 再生速度:</span>
        <div class="speed-btn-group" style="display:flex;gap:4px;">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="btn btn-secondary" @click="resetAnim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ 最初から再衝突
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>速度 <b>v₁, v₂</b></span>
        <span class="legend-item"><i class="dot-p"></i>運動量 <b>p₁, p₂</b></span>
        <span class="legend-item"><i class="dot-imp"></i>力積 <b>F·Δt</b></span>
        <span class="legend-item"><i class="dot-com"></i>重心 <b>G (等速)</b></span>
      </div>

      <div class="three-hud-phase">
        {{ phaseBadgeText }}
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>物体1 質量 m₁: <strong>{{ m1 }} kg</strong></label>
        <input type="range" v-model.number="m1" min="0.5" max="5" step="0.5" />
      </div>
      <div class="control-item">
        <label>物体2 質量 m₂: <strong>{{ m2 }} kg</strong></label>
        <input type="range" v-model.number="m2" min="0.5" max="5" step="0.5" />
      </div>
      <div class="control-item">
        <label>物体1 初速度 u₁: <strong>{{ u1 }} m/s</strong></label>
        <input type="range" v-model.number="u1" min="1" max="10" step="0.5" />
      </div>
      <div class="control-item">
        <label>反発係数 e: <strong>{{ e.toFixed(1) }}</strong></label>
        <input type="range" v-model.number="e" min="0" max="1" step="0.1" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:4px">
          {{ e === 0 ? '完全非弾性衝突（くっつく）' : e === 1 ? '完全弾性衝突（エネルギー保存）' : `非弾性衝突 (e=${e})` }}
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">衝突前の全運動量</div>
        <div class="stat-value">{{ pBefore.toFixed(2) }} <span class="unit">kg·m/s</span></div>
        <div class="stat-formula">p = m₁u₁ + m₂u₂</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">衝突後の全運動量</div>
        <div class="stat-value">{{ pAfter.toFixed(2) }} <span class="unit">kg·m/s</span></div>
        <div class="stat-formula">= m₁v₁ + m₂v₂（保存！）</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">衝突後 v₁</div>
        <div class="stat-value" style="color:#38bdf8">{{ v1.toFixed(2) }} <span class="unit">m/s</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">衝突後 v₂</div>
        <div class="stat-value" style="color:#f43f5e">{{ v2.toFixed(2) }} <span class="unit">m/s</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">衝突前の運動エネルギー</div>
        <div class="stat-value">{{ keBefore.toFixed(2) }} <span class="unit">J</span></div>
      </div>
      <div class="stat-card" :class="{ highlight: e === 1 }">
        <div class="stat-label">衝突後の運動エネルギー</div>
        <div class="stat-value">{{ keAfter.toFixed(2) }} <span class="unit">J</span></div>
        <div class="stat-formula" style="color:#f59e0b">{{ keLoss.toFixed(2) }} J 失われた</div>
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

const activeCam = ref('3d')
const m1 = ref(2)
const m2 = ref(1)
const u1 = ref(5)
const u2 = 0
const e = ref(0.7)
const isRunning = ref(true)
const timeScale = ref(0.4)

const v1 = computed(() => ((m1.value - e.value * m2.value) * u1.value + (1 + e.value) * m2.value * u2) / (m1.value + m2.value))
const v2 = computed(() => ((m2.value - e.value * m1.value) * u2 + (1 + e.value) * m1.value * u1.value) / (m1.value + m2.value))
const pBefore = computed(() => m1.value * u1.value + m2.value * u2)
const pAfter = computed(() => m1.value * v1.value + m2.value * v2.value)
const keBefore = computed(() => 0.5 * m1.value * u1.value * u1.value + 0.5 * m2.value * u2 * u2)
const keAfter = computed(() => 0.5 * m1.value * v1.value * v1.value + 0.5 * m2.value * v2.value * v2.value)
const keLoss = computed(() => keBefore.value - keAfter.value)

const phase = ref('before') // 'before' | 'collide' | 'after'
const animT = ref(0)
let afterPause = 0

const phaseBadgeText = computed(() => {
  if (phase.value === 'before') return `▶ 衝突前：全運動量 = ${pBefore.value.toFixed(2)} kg·m/s`
  if (phase.value === 'collide') return '💥 衝突中！作用・反作用の力積 F·Δt'
  return `✅ 衝突後：全運動量 = ${pAfter.value.toFixed(2)} kg·m/s（保存）`
})

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.25, 1.85 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0, 3.9 * s, 11.2 * s], [0, 0.7, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 1.0, 40.0 * s], [0, 1.0, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 40.0 * s, 0.01], [0, 0, 0], duration, 14)
  }
}

function togglePlay() {
  isRunning.value = !isRunning.value
}

function stepForward() {
  isRunning.value = false
  stepSimulation(0.05)
  updateThreeScene()
}

function resetAnim() {
  phase.value = 'before'
  animT.value = 0
  afterPause = 0
  updateThreeScene()
}

function getRadius(mass) {
  return 0.3 + mass * 0.055
}

const trackHalfLen = 5.6
const collisionCenterX = 0.2
const worldPerM = 0.65

function stepSimulation(dt) {
  const scaledDt = dt * timeScale.value
  const r1 = getRadius(m1.value)
  const r2 = getRadius(m2.value)
  const contactX1 = collisionCenterX - r1 - r2
  const startX1 = -4.6

  if (phase.value === 'before') {
    animT.value += scaledDt
    const x1 = startX1 + animT.value * u1.value * worldPerM
    if (x1 >= contactX1) {
      phase.value = 'collide'
      animT.value = 0
    }
  } else if (phase.value === 'collide') {
    animT.value += scaledDt
    if (animT.value >= 0.35) {
      phase.value = 'after'
      animT.value = 0
      afterPause = 0
    }
  } else {
    animT.value += scaledDt
    const x1 = contactX1 + v1.value * animT.value * worldPerM
    const x2 = collisionCenterX + v2.value * animT.value * worldPerM
    if (x1 <= -trackHalfLen + r1 || x2 >= trackHalfLen - r2) {
      afterPause += dt
      if (afterPause > 1.0) {
        resetAnim()
      }
    }
  }
}

function initThree() {
  if (!threeContainer.value) return
  let lastCamAspect = 0

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0, 3.9, 10.6],
    initialTarget: [0, 0.7, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.18) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
      }
      if (isRunning.value) {
        stepSimulation(dt)
      }
      updateThreeScene()
    }
  })

  const { scene } = threeCtx

  // 1. 床グリッドとエアトラックレール
  const grid = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a)
  grid.position.set(0, -0.18, 0)
  scene.add(grid)

  const railMesh = new THREE.Mesh(
    new THREE.BoxGeometry(trackHalfLen * 2 + 0.6, 0.22, 1.65),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.4 })
  )
  railMesh.position.set(0, -0.11, 0)
  scene.add(railMesh)

  // 光るトラックガイドライン & 目盛り
  const edgeRailGeo = new THREE.BoxGeometry(trackHalfLen * 2 + 0.6, 0.05, 0.06)
  const edgeRailMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35
  })
  const fRail = new THREE.Mesh(edgeRailGeo, edgeRailMat)
  fRail.position.set(0, 0.02, 0.78)
  const bRail = new THREE.Mesh(edgeRailGeo, edgeRailMat)
  bRail.position.set(0, 0.02, -0.78)
  scene.add(fRail, bRail)

  for (let x = -5; x <= 5; x += 1) {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.02, 1.4),
      new THREE.MeshBasicMaterial({ color: x === 0 ? 0xf59e0b : 0x475569 })
    )
    tick.position.set(x, 0.01, 0)
    scene.add(tick)
  }

  // 両端バンパー
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 })
  const leftBumper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 1.65), bumperMat)
  leftBumper.position.set(-trackHalfLen - 0.18, 0.3, 0)
  const rightBumper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 1.65), bumperMat)
  rightBumper.position.set(trackHalfLen + 0.18, 0.3, 0)
  scene.add(leftBumper, rightBumper)

  // 2. 3D 球体 1 (m1: シアン) と 球体 2 (m2: ローズ)
  const baseSphereGeo = new THREE.SphereGeometry(1, 32, 32)
  const mat1 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.2
  })
  const sphere1 = new THREE.Mesh(baseSphereGeo, mat1)

  const mat2 = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xbe123c,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.2
  })
  const sphere2 = new THREE.Mesh(baseSphereGeo, mat2)
  scene.add(sphere1, sphere2)

  // 床影ディスク
  const shadowGeo = new THREE.CircleGeometry(1, 24)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadow1 = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 }))
  const shadow2 = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.25 }))
  scene.add(shadow1, shadow2)

  // 質量ラベル
  const lblM1 = createTextSprite('m₁', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.46 })
  const lblM2 = createTextSprite('m₂', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 32, scale: 0.46 })
  scene.add(lblM1, lblM2)

  // 3. 重心 G (COM) マーカー（金色の菱形）
  const comMarker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.7 })
  )
  scene.add(comMarker)
  const lblCom = createTextSprite('重心 G', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 28, scale: 0.42 })
  scene.add(lblCom)

  // 4. 速度ベクトル (v1, v2: エメラルド) と 運動量ベクトル (p1, p2: 紫)
  const arrowV1 = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.048, headRadius: 0.14, headLength: 0.32 })
  const arrowV2 = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.048, headRadius: 0.14, headLength: 0.32 })
  const arrowP1 = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.052, headRadius: 0.15, headLength: 0.34 })
  const arrowP2 = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.052, headRadius: 0.15, headLength: 0.34 })
  scene.add(arrowV1, arrowV2, arrowP1, arrowP2)

  const lblV1 = createTextSprite('v₁', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.44 })
  const lblV2 = createTextSprite('v₂', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.44 })
  const lblP1 = createTextSprite('p₁', { color: '#d8b4fe', borderColor: '#a855f7', fontSize: 30, scale: 0.44 })
  const lblP2 = createTextSprite('p₂', { color: '#d8b4fe', borderColor: '#a855f7', fontSize: 30, scale: 0.44 })
  scene.add(lblV1, lblV2, lblP1, lblP2)

  // 5. 衝突フラッシュ・衝撃波リング & 力積矢印 (F·Δt)
  const shockRingGeo = new THREE.TorusGeometry(0.45, 0.045, 14, 36)
  shockRingGeo.rotateY(Math.PI / 2)
  const shockRingMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.9
  })
  const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat)
  shockRing.visible = false
  scene.add(shockRing)

  const arrowImp1 = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowImp2 = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  scene.add(arrowImp1, arrowImp2)

  const lblImp = createTextSprite('衝突力積 F·Δt', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 34,
    scale: 0.52
  })
  scene.add(lblImp)

  sceneObjects = {
    sphere1,
    sphere2,
    shadow1,
    shadow2,
    lblM1,
    lblM2,
    comMarker,
    lblCom,
    arrowV1,
    arrowV2,
    arrowP1,
    arrowP2,
    lblV1,
    lblV2,
    lblP1,
    lblP2,
    shockRing,
    shockRingMat,
    arrowImp1,
    arrowImp2,
    lblImp
  }

  updateThreeScene()
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
}

function updateThreeScene() {
  if (!sceneObjects) return
  const {
    sphere1,
    sphere2,
    shadow1,
    shadow2,
    lblM1,
    lblM2,
    comMarker,
    lblCom,
    arrowV1,
    arrowV2,
    arrowP1,
    arrowP2,
    lblV1,
    lblV2,
    lblP1,
    lblP2,
    shockRing,
    shockRingMat,
    arrowImp1,
    arrowImp2,
    lblImp
  } = sceneObjects

  const r1 = getRadius(m1.value)
  const r2 = getRadius(m2.value)
  const contactX1 = collisionCenterX - r1 - r2
  const startX1 = -4.6

  let x1, x2, vel1, vel2
  if (phase.value === 'before') {
    x1 = Math.min(contactX1, startX1 + animT.value * u1.value * worldPerM)
    x2 = collisionCenterX
    vel1 = u1.value
    vel2 = 0
  } else if (phase.value === 'collide') {
    x1 = contactX1
    x2 = collisionCenterX
    vel1 = (u1.value + v1.value) * 0.5
    vel2 = v2.value * 0.5
  } else {
    x1 = Math.max(-trackHalfLen + r1, Math.min(trackHalfLen - r1, contactX1 + v1.value * animT.value * worldPerM))
    x2 = Math.max(-trackHalfLen + r2, Math.min(trackHalfLen - r2, collisionCenterX + v2.value * animT.value * worldPerM))
    vel1 = v1.value
    vel2 = v2.value
  }

  // 球体位置とスケール
  sphere1.scale.set(r1, r1, r1)
  sphere1.position.set(x1, r1, 0)
  shadow1.scale.set(r1 * 1.1, r1 * 1.1, r1 * 1.1)
  shadow1.position.set(x1, 0.015, 0)

  sphere2.scale.set(r2, r2, r2)
  sphere2.position.set(x2, r2, 0)
  shadow2.scale.set(r2 * 1.1, r2 * 1.1, r2 * 1.1)
  shadow2.position.set(x2, 0.015, 0)

  const sepMargin = Math.max(0, (1.55 - Math.abs(x2 - x1)) * 0.55)
  lblM1.updateText(`m₁=${m1.value}kg`, '#7dd3fc', '#38bdf8')
  lblM1.position.set(x1 - sepMargin, -0.34, 0.98)
  lblM2.updateText(`m₂=${m2.value}kg`, '#fda4af', '#f43f5e')
  lblM2.position.set(x2 + sepMargin, -0.34, 0.98)

  // 重心 G 位置 (上面視点・正面視点とも m1/m2 と分離)
  const xCom = (m1.value * x1 + m2.value * x2) / (m1.value + m2.value)
  comMarker.position.set(xCom, 0.18, 0.95)
  comMarker.rotation.y += 0.04
  lblCom.position.set(xCom, -0.88, 1.68)

  // 速度ベクトル (上段 y = 2*r + 0.35) & 運動量ベクトル (さらに上段 y = 2*r + 1.1)
  // 上面視点でも球・m・v・p・重心Gが重ならないよう z レーンを明確分離: p(-1.42) / v(-0.72) / m(+0.98) / G(+1.68)
  const vScale = 0.22
  const pScale = 0.11
  const vecSep = Math.max(0, (1.65 - Math.abs(x2 - x1)) * 0.55)

  if (Math.abs(vel1) > 0.08) {
    const dir1 = new THREE.Vector3(Math.sign(vel1), 0, 0)
    const vLen1 = Math.min(2.2, Math.max(0.42, Math.abs(vel1) * vScale))
    const vOrg1 = new THREE.Vector3(x1, r1 * 2 + 0.35, 0)
    arrowV1.setVector(vOrg1, dir1, vLen1)
    lblV1.visible = true
    lblV1.updateText(`v₁=${vel1.toFixed(1)}m/s`, '#6ee7b7', '#10b981')
    lblV1.position.set(x1 + Math.sign(vel1) * (vLen1 * 0.55) - vecSep, r1 * 2 + 0.68, -0.72)

    const pVal1 = m1.value * vel1
    const pLen1 = Math.min(2.4, Math.max(0.42, Math.abs(pVal1) * pScale))
    const pOrg1 = new THREE.Vector3(x1, r1 * 2 + 1.1, 0)
    arrowP1.setVector(pOrg1, dir1, pLen1)
    lblP1.visible = true
    lblP1.updateText(`p₁=${pVal1.toFixed(1)}`, '#d8b4fe', '#a855f7')
    lblP1.position.set(x1 + Math.sign(vel1) * (pLen1 * 0.55) - vecSep, r1 * 2 + 1.44, -1.42)
  } else {
    arrowV1.visible = false
    lblV1.visible = false
    arrowP1.visible = false
    lblP1.visible = false
  }

  if (Math.abs(vel2) > 0.08) {
    const dir2 = new THREE.Vector3(Math.sign(vel2), 0, 0)
    const vLen2 = Math.min(2.2, Math.max(0.42, Math.abs(vel2) * vScale))
    const vOrg2 = new THREE.Vector3(x2, r2 * 2 + 0.35, 0)
    arrowV2.setVector(vOrg2, dir2, vLen2)
    lblV2.visible = true
    lblV2.updateText(`v₂=${vel2.toFixed(1)}m/s`, '#6ee7b7', '#10b981')
    lblV2.position.set(x2 + Math.sign(vel2) * (vLen2 * 0.55) + vecSep, r2 * 2 + 0.68, -0.72)

    const pVal2 = m2.value * vel2
    const pLen2 = Math.min(2.4, Math.max(0.42, Math.abs(pVal2) * pScale))
    const pOrg2 = new THREE.Vector3(x2, r2 * 2 + 1.1, 0)
    arrowP2.setVector(pOrg2, dir2, pLen2)
    lblP2.visible = true
    lblP2.updateText(`p₂=${pVal2.toFixed(1)}`, '#d8b4fe', '#a855f7')
    lblP2.position.set(x2 + Math.sign(vel2) * (pLen2 * 0.55) + vecSep, r2 * 2 + 1.44, -1.42)
  } else {
    arrowV2.visible = false
    lblV2.visible = false
    arrowP2.visible = false
    lblP2.visible = false
  }

  // 衝突時の衝撃波リングと作用・反作用の力積矢印
  if (phase.value === 'collide') {
    const frac = Math.min(1, animT.value / 0.35)
    const contactPosX = contactX1 + r1
    shockRing.visible = true
    shockRing.position.set(contactPosX, Math.max(r1, r2) * 0.85, 0)
    const ringScale = 0.8 + frac * 1.9
    shockRing.scale.set(ringScale, ringScale, ringScale)
    shockRingMat.opacity = Math.max(0.1, 1 - frac)

    arrowImp1.setVector(new THREE.Vector3(contactPosX - 0.12, r1, 0.45), new THREE.Vector3(-1, 0, 0), 0.95)
    arrowImp2.setVector(new THREE.Vector3(contactPosX + 0.12, r2, 0.45), new THREE.Vector3(1, 0, 0), 0.95)
    lblImp.visible = true
    lblImp.position.set(contactPosX, Math.max(r1, r2) * 2 + 2.15, 0.85)
  } else {
    shockRing.visible = false
    arrowImp1.visible = false
    arrowImp2.visible = false
    lblImp.visible = false
  }
}

watch([m1, m2, u1, e], () => {
  resetAnim()
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
.sim-container {
  background: linear-gradient(145deg, #0f172a, #080c16);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  color: #f4f4f5;
  font-family: 'Outfit', system-ui, sans-serif;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.sim-title {
  font-size: 1.12rem;
  font-weight: 700;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 8px;
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
.cam-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.cam-chip:hover {
  border-color: #38bdf8;
  color: #fff;
}
.cam-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}
.speed-btn-group button {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}
.speed-btn-group button.active {
  background: #d97706;
  border-color: #fbbf24;
  color: #fff;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 390px;
  background: #080c16;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  margin-bottom: 1rem;
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
.dot-p { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
.dot-imp { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-com { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.three-hud-phase {
  position: absolute;
  bottom: 38px;
  left: 12px;
  max-width: calc(100% - 24px);
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(245, 158, 11, 0.35);
  font-size: 0.76rem;
  font-weight: 600;
  color: #fde68a;
  pointer-events: none;
}
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
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.control-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.control-item label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: #d4d4d8;
}
.control-item input[type=range] {
  width: 100%;
  accent-color: #f59e0b;
  cursor: pointer;
}
.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.btn-primary {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white;
}
.btn-secondary {
  background: #334155;
  color: #f4f4f5;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
}
.stat-card.highlight {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.07);
}
.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}
.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f4f4f5;
}
.stat-value .unit {
  font-size: 0.8rem;
  color: #a1a1aa;
  font-weight: 400;
}
.stat-formula {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.3rem;
}
.speed-label,
.speed-btn-group button {
  white-space: nowrap;
}
@media (max-width: 768px) {
  .sim-container {
    padding: 1rem;
  }
  .three-viewport-wrap {
    height: 360px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.7rem;
  }
  .three-hud-phase {
    top: auto;
    bottom: 38px;
    left: 10px;
    right: auto;
    font-size: 0.72rem;
  }
  .speed-control-group {
    border-radius: 12px !important;
    padding: 6px 10px !important;
    flex-wrap: wrap !important;
    width: 100%;
  }
  .speed-btn-group {
    flex-wrap: wrap !important;
  }
}
</style>
