<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🔄 3D 等速円運動と向心加速度・単振動正射影 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#34d399;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="sim-badge">向心力・角速度ベクトル ω・単振動への正射影</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button
          class="cam-chip"
          :class="{ active: activeCam === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🧊 3D 俯瞰視点
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          ⭕ 真上（円軌道平面）
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'side' }"
          @click="setCameraPreset('side')"
        >
          📐 側面（単振動への正射影）
        </button>
      </div>
      <div class="preset-group">
        <button
          class="cam-chip"
          :class="{ active: mountMode === 'turntable' }"
          @click="mountMode = 'turntable'"
        >
          💿 水平ターンテーブル
        </button>
        <button
          class="cam-chip"
          :class="{ active: mountMode === 'conical' }"
          @click="mountMode = 'conical'"
        >
          🎪 円錐振り子モード
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
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
      <button class="btn btn-secondary" @click="stepForward" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+15°)
      </button>
      <button class="btn btn-secondary" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b> (接線)</span>
          <span class="legend-item"><i class="dot-f"></i>向心力 <b>F</b> / <b>a</b></span>
          <span class="legend-item"><i class="dot-w"></i>角速度 <b>ω</b></span>
          <span v-if="mountMode === 'conical'" class="legend-item"><i class="dot-p"></i>糸の張力 <b>T</b></span>
          <span v-if="showProjection" class="legend-item"><i class="dot-p"></i>単振動正射影 <b>x = r cos ωt</b></span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <div v-if="showVelocity && showAccel" class="ortho-status-strip">
      <span class="three-ortho-badge">✓ <i>v</i> ⊥ <i>F</i>（常に90°直交・等速円運動）</span>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>半径 r: <strong>{{ r.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="r" min="0.8" max="2.5" step="0.1" />
      </div>
      <div class="control-item">
        <label>角速度 ω: <strong>{{ omega.toFixed(2) }} rad/s</strong></label>
        <input type="range" v-model.number="omega" min="0.5" max="3.5" step="0.1" />
      </div>
      <div class="control-item">
        <label>質量 m: <strong>{{ m.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.5" max="5.0" step="0.5" />
      </div>
      <div class="control-item">
        <label>表示オプション:</label>
        <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
          <button :class="['preset-btn', { active: showVelocity }]" @click="showVelocity = !showVelocity">
            {{ showVelocity ? '✓ 速度ベクトル v' : '速度ベクトル v' }}
          </button>
          <button :class="['preset-btn', { active: showAccel }]" @click="showAccel = !showAccel">
            {{ showAccel ? '✓ 向心力・加速度 F/a' : '向心力・加速度 F/a' }}
          </button>
          <button :class="['preset-btn', { active: showProjection }]" @click="showProjection = !showProjection">
            {{ showProjection ? '✓ 単振動正射影 (x軸)' : '単振動正射影 (x軸)' }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">円周上の速さ v</div>
        <div class="stat-value" style="color:#10b981">{{ speed.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">v = rω</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">向心加速度 a</div>
        <div class="stat-value" style="color:#f43f5e">{{ accel.toFixed(2) }} <span class="unit">m/s²</span></div>
        <div class="stat-formula">a = rω² = <span class="frac"><span class="num">v²</span><span class="den">r</span></span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">必要な向心力 F</div>
        <div class="stat-value" style="color:#f59e0b">{{ force.toFixed(2) }} <span class="unit">N</span></div>
        <div class="stat-formula">F = ma = mrω²</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">周期 T</div>
        <div class="stat-value" style="color:#38bdf8">{{ period.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula">T = <span class="frac"><span class="num">2π</span><span class="den">ω</span></span> (1周の時間)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">回転数 f</div>
        <div class="stat-value">{{ freq.toFixed(2) }} <span class="unit">Hz</span></div>
        <div class="stat-formula">f = <span class="frac"><span class="num">1</span><span class="den">T</span></span> (1秒あたりの回転数)</div>
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

const isPlaying = ref(true)
const timeScale = ref(0.5)
const activeCam = ref('3d')
const mountMode = ref('turntable') // 'turntable' | 'conical'

const r = ref(1.6)
const omega = ref(1.5)
const m = ref(1.0)
const showVelocity = ref(true)
const showAccel = ref(true)
const showProjection = ref(true)

const speed = computed(() => r.value * omega.value)
const accel = computed(() => r.value * omega.value * omega.value)
const force = computed(() => m.value * accel.value)
const period = computed(() => (2 * Math.PI) / omega.value)
const freq = computed(() => 1 / period.value)

let angle = 0.6

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.62, Math.max(1.32, 1.42 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'top') {
    // target.z = 0, pos.z > 0 で画面上が -Z、画面下側(手前)が +Z (正射影レール) になり上部HUDと被らない
    return { pos: [0, 50.0 * ms, 0.45], target: [0, 0, 0.35], fov: 14 }
  }
  if (preset === 'side') {
    return { pos: [0, 1.0, 48.0 * ms], target: [0, 0.8, 0], fov: 14 }
  }
  return {
    pos: [8.8 * ms, 7.0 * ms, 11.4 * ms],
    target: [0, 0.45, 0.4],
    fov: 42
  }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

function initThree() {
  if (!threeContainer.value) return
  const init = getCamParams('3d')
  lastIsMob = getMobScale() > 1.01
  threeCtx = createThreeScene(threeContainer.value, {
    fov: init.fov,
    initialCamPos: init.pos,
    initialTarget: init.target,
    onFrame: (dt) => {
      if (isPlaying.value) {
        angle += omega.value * dt * timeScale.value
        if (angle > Math.PI * 200) angle -= Math.PI * 200
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

  // 床グリッド
  const grid = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b)
  grid.position.y = -0.35
  scene.add(grid)

  // 水平ターンテーブル円盤 (半透明ガラス調 + 発光外周リング + 角度目盛り)
  const diskGeo = new THREE.CylinderGeometry(4.2, 4.3, 0.16, 48)
  const diskMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.45,
    transparent: true,
    opacity: 0.78
  })
  const diskMesh = new THREE.Mesh(diskGeo, diskMat)
  diskMesh.position.y = -0.15
  scene.add(diskMesh)

  const diskRimGeo = new THREE.TorusGeometry(4.22, 0.04, 14, 96)
  diskRimGeo.rotateX(Math.PI / 2)
  const diskRim = new THREE.Mesh(
    diskRimGeo,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45 })
  )
  diskRim.position.y = -0.07
  scene.add(diskRim)

  for (let i = 0; i < 12; i++) {
    const tickAngle = (i / 12) * Math.PI * 2
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.02, 0.04),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x64748b : 0x334155 })
    )
    tick.position.set(3.9 * Math.cos(tickAngle), -0.06, 3.9 * Math.sin(tickAngle))
    tick.rotation.y = -tickAngle
    scene.add(tick)
  }

  // 中心ピボット柱 & 円錐振り子上部支柱
  const centerHubGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.4, 24)
  const centerHubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.25 })
  const centerHub = new THREE.Mesh(centerHubGeo, centerHubMat)
  centerHub.position.y = 0.05
  scene.add(centerHub)

  const topApexPos = new THREE.Vector3(0, 3.1, 0)
  const standGroup = new THREE.Group()
  const apexSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.5 })
  )
  apexSphere.position.copy(topApexPos)
  standGroup.add(apexSphere)

  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.1, 12)
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, transparent: true, opacity: 0.65 })
  const poleMesh = new THREE.Mesh(poleGeo, poleMat)
  poleMesh.position.set(0, 1.55, 0)
  standGroup.add(poleMesh)
  scene.add(standGroup)

  // 軌道リング (動的にスケール更新)
  const orbitRingGeo = new THREE.TorusGeometry(1, 0.036, 16, 96)
  orbitRingGeo.rotateX(Math.PI / 2)
  const orbitRingMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x6366f1,
    emissiveIntensity: 0.55
  })
  const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat)
  orbitRing.position.y = 0.02
  scene.add(orbitRing)

  // 回転アーク軌跡 (直近 90° の発光弧)
  const trailPtsCount = 36
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailPtsCount * 3), 3))
  const trailLine = new THREE.Line(
    trailGeo,
    new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.8 })
  )
  scene.add(trailLine)

  // 床面ドロップシャドウリング
  const shadowRingGeo = new THREE.RingGeometry(0.18, 0.34, 24)
  shadowRingGeo.rotateX(-Math.PI / 2)
  const shadowRing = new THREE.Mesh(
    shadowRingGeo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  )
  shadowRing.position.y = -0.05
  scene.add(shadowRing)

  // 回転する小球
  const ballGeo = new THREE.SphereGeometry(0.32, 32, 32)
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    emissive: 0x4f46e5,
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.3
  })
  const ballMesh = new THREE.Mesh(ballGeo, ballMat)
  scene.add(ballMesh)

  // 3D ロッド / 円錐振り子の糸 (立体円柱)
  const rodGeo = new THREE.CylinderGeometry(0.032, 0.032, 1, 12)
  rodGeo.translate(0, 0.5, 0)
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.25 })
  const rodMesh = new THREE.Mesh(rodGeo, rodMat)
  scene.add(rodMesh)

  // 3D ベクトル矢印
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.4 })
  const arrowF = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.4 })
  const arrowW = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowT = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.05, headRadius: 0.14, headLength: 0.34 })
  scene.add(arrowV, arrowF, arrowW, arrowT)

  // 3D テキストラベル
  const labelV = createTextSprite('v (速度)', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.54 })
  const labelF = createTextSprite('F (向心力)', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.54 })
  const labelW = createTextSprite('ω (角速度)', { color: '#d8b4fe', borderColor: '#a855f7', scale: 0.48 })
  const labelT = createTextSprite('T (張力)', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.5 })
  const labelCenter = createTextSprite('O (中心)', { color: '#cbd5e1', borderColor: '#64748b', scale: 0.44 })
  labelCenter.position.set(-0.45, -0.34, 0.72)
  scene.add(labelV, labelF, labelW, labelT, labelCenter)

  // 単振動正射影ガイド (手前 z = 4.2 のレール)
  const projGroup = new THREE.Group()
  const projZ = 4.2
  const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 8.2, 16)
  railGeo.rotateZ(Math.PI / 2)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.3 })
  const railMesh = new THREE.Mesh(railGeo, railMat)
  railMesh.position.set(0, 0, projZ)
  projGroup.add(railMesh)

  const projBallGeo = new THREE.SphereGeometry(0.24, 24, 24)
  const projBallMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6
  })
  const projBall = new THREE.Mesh(projBallGeo, projBallMat)
  projGroup.add(projBall)

  const projLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
  const projLineMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.2, gapSize: 0.14 })
  const projConnector = new THREE.Line(projLineGeo, projLineMat)
  projGroup.add(projConnector)

  const labelProj = createTextSprite('単振動正射影 x = r cos ωt', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.5
  })
  labelProj.position.set(0, -0.72, projZ + 0.72)
  projGroup.add(labelProj)

  scene.add(projGroup)

  sceneObjs = {
    standGroup,
    topApexPos,
    orbitRing,
    trailGeo,
    trailPtsCount,
    shadowRing,
    ballMesh,
    rodMesh,
    arrowV,
    arrowF,
    arrowW,
    arrowT,
    labelV,
    labelF,
    labelW,
    labelT,
    projGroup,
    projBall,
    projConnector,
    projZ
  }

  updateFrame()
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    standGroup,
    topApexPos,
    orbitRing,
    trailGeo,
    trailPtsCount,
    shadowRing,
    ballMesh,
    rodMesh,
    arrowV,
    arrowF,
    arrowW,
    arrowT,
    labelV,
    labelF,
    labelW,
    labelT,
    projGroup,
    projBall,
    projConnector,
    projZ
  } = sceneObjs

  // 3D表示上の半径スケール (1m = 1.45 units)
  const scaleR = 1.45
  const R = r.value * scaleR
  orbitRing.scale.set(R, 1, R)

  // 反時計回り (上から見て反時計回り: x = R cos(angle), z = -R sin(angle))
  const bx = R * Math.cos(angle)
  const bz = -R * Math.sin(angle)
  const by = 0.28
  const ballPos = new THREE.Vector3(bx, by, bz)
  ballMesh.position.copy(ballPos)
  shadowRing.position.set(bx, -0.05, bz)

  const sFactor = 0.8 + m.value * 0.08
  ballMesh.scale.set(sFactor, sFactor, sFactor)

  // 90度アーク軌跡更新
  const tArr = trailGeo.getAttribute('position').array
  for (let i = 0; i < trailPtsCount; i++) {
    const a = angle - (i / (trailPtsCount - 1)) * 1.45
    tArr[i * 3] = R * Math.cos(a)
    tArr[i * 3 + 1] = by
    tArr[i * 3 + 2] = -R * Math.sin(a)
  }
  trailGeo.getAttribute('position').needsUpdate = true

  // モード別 3D ロッド / 糸
  standGroup.visible = mountMode.value === 'conical'
  const rodStart = mountMode.value === 'conical' ? topApexPos : new THREE.Vector3(0, by, 0)
  const rodDiff = ballPos.clone().sub(rodStart)
  const rodLen = Math.max(0.01, rodDiff.length())
  rodMesh.position.copy(rodStart)
  rodMesh.scale.set(1, rodLen, 1)
  rodMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rodDiff.normalize())

  if (mountMode.value === 'conical') {
    const tDir = topApexPos.clone().sub(ballPos).normalize()
    arrowT.setVector(ballPos, tDir, 1.45)
    labelT.visible = true
    labelT.position.copy(ballPos).addScaledVector(tDir, 0.95).add(new THREE.Vector3(0.45, 0.25, 0.35))
  } else {
    arrowT.visible = false
    labelT.visible = false
  }

  // 角速度ベクトル ω (中心軸直上にコンパクトに配置し、外周の v や内側の F・O と全視点で分離)
  const wLen = Math.min(1.75, 0.65 + omega.value * 0.32)
  arrowW.setVector(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 1, 0), wLen)
  labelW.position.set(0, wLen + 0.34, 0)
  labelW.updateText(`ω = ${omega.value.toFixed(1)} rad/s`, '#d8b4fe', '#a855f7')

  // 速度ベクトル v (接線方向: (-sin(angle), 0, -cos(angle))、外側に少し逃がして向心力ラベルと分離)
  if (showVelocity.value) {
    const vDir = new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle)).normalize()
    const outDir = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).normalize()
    const vLen = Math.min(2.6, Math.max(0.9, speed.value * 0.42))
    arrowV.setVector(ballPos, vDir, vLen)
    labelV.visible = true
    labelV.updateText(`v = ${speed.value.toFixed(2)} m/s`, '#6ee7b7', '#10b981')
    labelV.position
      .copy(ballPos)
      .addScaledVector(vDir, vLen + 0.58)
      .addScaledVector(outDir, 0.45)
    labelV.position.y += 0.36
  } else {
    arrowV.visible = false
    labelV.visible = false
  }

  // 向心力 F / 向心加速度 a (中心向き: (-cos(angle), 0, sin(angle))、球寄りの矢印外寄り上空 y=0.38 へ配置し中心軸 ω・O(中心) と全視点分離)
  if (showAccel.value) {
    const fDir = new THREE.Vector3(-Math.cos(angle), 0, Math.sin(angle)).normalize()
    const fLen = Math.min(R * 0.85, Math.max(0.85, accel.value * 0.18))
    arrowF.setVector(ballPos, fDir, fLen)
    labelF.visible = true
    labelF.updateText(`F = ${force.value.toFixed(1)} N`, '#fda4af', '#f43f5e')
    labelF.position.copy(ballPos).addScaledVector(fDir, Math.min(R * 0.32, fLen * 0.40))
    labelF.position.y = 0.38
  } else {
    arrowF.visible = false
    labelF.visible = false
  }

  // 単振動への正射影
  if (showProjection.value) {
    projGroup.visible = true
    projBall.position.set(bx, 0, projZ)
    const pAttr = projConnector.geometry.getAttribute('position')
    pAttr.setXYZ(0, bx, by, bz)
    pAttr.setXYZ(1, bx, 0, projZ)
    pAttr.needsUpdate = true
    projConnector.computeLineDistances()
  } else {
    projGroup.visible = false
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stepForward() {
  angle += (15 * Math.PI) / 180
  updateFrame()
}

function reset() {
  angle = 0
  updateFrame()
}

watch([r, omega, m, showVelocity, showAccel, showProjection, mountMode], () => {
  updateFrame()
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
  background: linear-gradient(145deg, #0f172a, #090d16);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  color: #f4f4f5;
  font-family: 'Outfit', sans-serif;
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
  font-size: 1.15rem;
  font-weight: 700;
  background: linear-gradient(90deg, #818cf8, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(129, 140, 248, 0.3);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.7);
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
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.cam-chip:hover {
  border-color: #38bdf8;
  color: #fff;
}
.cam-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #7dd3fc;
  font-weight: 600;
}
.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.85rem;
}
.speed-control-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.speed-label {
  font-size: 0.8rem;
  color: #cbd5e1;
  white-space: nowrap;
}
.speed-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.speed-btn-group button {
  padding: 3px 8px;
  font-size: 0.75rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  cursor: pointer;
  white-space: nowrap;
}
.speed-btn-group button.active {
  background: #6366f1;
  color: #fff;
  border-color: #818cf8;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
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
.dot-w { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
.dot-p { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.ortho-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.55rem 0 0.85rem 0;
}
.three-ortho-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
  font-size: 0.75rem;
  font-weight: 700;
}
.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 6px;
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
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend,
  .three-ortho-badge,
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
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
  accent-color: #818cf8;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.2s;
}
.preset-btn.active {
  background: rgba(129, 140, 248, 0.25);
  border-color: #818cf8;
  color: #c7d2fe;
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
  background: linear-gradient(135deg, #818cf8, #ec4899);
  color: white;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f4f4f5;
  border: 1px solid rgba(255, 255, 255, 0.15);
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
  border-color: rgba(129, 140, 248, 0.4);
  background: rgba(129, 140, 248, 0.07);
}
.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}
.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f4f4f5;
}
.stat-value .unit {
  font-size: 0.85rem;
  color: #a1a1aa;
  font-weight: 400;
}
.stat-formula {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.3rem;
}
</style>
