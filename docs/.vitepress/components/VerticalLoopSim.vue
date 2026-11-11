<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🎢</span>
        <h3>3D 鉛直面内の円運動・宙返り（ループコースター）実験室</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">ジェットコースターの宙返りループ。力学的エネルギー保存則と向心力（垂直抗力・糸の張力 <i>N</i>）のつり合い。一周成功するか、途中で軌道離脱（放物落下）するかを3D空間でリアルタイム検証できます。</p>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          ⭕ 正面（鉛直ループ平面）
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 斜め側面（立体レール確認）
        </button>
      </div>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: showVectors }" @click="showVectors = !showVectors">
          {{ showVectors ? '🏹 3Dベクトル: ON' : '🏹 3Dベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isRunning ? '⏸ 一時停止' : '▶ スタート' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepSim(0.02)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.02s)
      </button>
      <button class="btn btn-secondary" @click="resetSim" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        🔄 リセット
      </button>
      <button class="btn btn-accent" @click="setCriticalSpeed" style="padding: 6px 12px; border-radius: 8px; font-size: 0.82rem; cursor: pointer;">
        🎯 一周限界速度 √(5gR)
      </button>
    </div>

    <div class="status-strip">
      <div class="status-badge" :class="loopStatus">
        {{ statusMessage }}
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b> (接線)</span>
          <span class="legend-item"><i class="dot-n"></i>{{ trackType === 'string' ? '張力 T' : '垂直抗力 N' }} (中心)</span>
          <span class="legend-item"><i class="dot-g"></i>重力 <b>mg</b> (鉛直)</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>最下点 初速度 <i>v</i><sub>0</sub>: <strong>{{ v0.toFixed(2) }} m/s</strong></span>
            <input type="range" v-model.number="v0" min="4.0" max="12.0" step="0.1" @input="resetSim" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>円軌道半径 <i>R</i>: <strong>{{ radius.toFixed(1) }} m</strong></span>
            <input type="range" v-model.number="radius" min="1.0" max="3.0" step="0.2" @input="resetSim" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>小球の質量 <i>m</i>: <strong>{{ mass.toFixed(1) }} kg</strong></span>
            <input type="range" v-model.number="mass" min="0.5" max="3.0" step="0.5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>軌道の種類:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: trackType === 'string' }" @click="trackType = 'string'; resetSim()">
                糸（たるみあり）
              </button>
              <button class="select-btn" :class="{ active: trackType === 'rail' }" @click="trackType = 'rail'; resetSim()">
                外枠レール（離脱あり）
              </button>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">現在の速さ <i>v</i></span>
        <span class="value" style="color:#10b981">{{ currentV.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">力学的エネルギー保存</span>
      </div>

      <div class="stat-card">
        <span class="label">垂直抗力 / 張力 <i>N</i></span>
        <span class="value" :class="{ highlight: currentN > 0.1, negative: currentN <= 0.05 }">
          {{ currentN.toFixed(1) }} <span class="unit">N</span>
        </span>
        <span class="subtext">{{ currentN > 0 ? '軌道と接触中' : '軌道離脱！' }}</span>
      </div>

      <div class="stat-card">
        <span class="label">最高点到達限界 <i>v</i><sub>0</sub></span>
        <span class="value">{{ vCritical.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">√(5gR) (一周の必要十分条件)</span>
      </div>

      <div class="stat-card">
        <span class="label">最高点速度 <i>v</i><sub>top</sub> (予想)</span>
        <span class="value" :class="{ positive: predictedVtop > 0, negative: predictedVtop <= 0 }">
          {{ predictedVtop > 0 ? predictedVtop.toFixed(2) + ' m/s' : '到達不可 (途中離脱)' }}
        </span>
        <span class="subtext"><i>v</i><sub>0</sub> ≥ √(5gR) で √(<i>v</i><sub>0</sub>² - 4gR)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjs = null

const isRunning = ref(true)
const timeScale = ref(0.4)
const activeCam = ref('3d')
const showVectors = ref(true)

const v0 = ref(8.0) // m/s
const radius = ref(1.5) // m
const mass = ref(1.0) // kg
const trackType = ref('rail') // 'string' or 'rail'
const g = 9.8

const vCritical = computed(() => Math.sqrt(5 * g * radius.value))

const predictedVtop = computed(() => {
  if (v0.value < vCritical.value - 1e-6) return 0
  const inside = (v0.value ** 2) - 4 * g * radius.value
  return inside > 0 ? Math.sqrt(inside) : 0
})

// 状態変数
// theta: 最下点 (0, -R, 0) を θ=0 とし、反時計回りに角度 (x = R sinθ, y = -R cosθ)
const theta = ref(0.0)
const isDetached = ref(false)
const ballX = ref(0)
const ballY = ref(0)
const ballVx = ref(0)
const ballVy = ref(0)
let detachedTrail = []
let oscDir = 1

const currentV = ref(0)
const currentN = ref(0)

const loopStatus = computed(() => {
  if (isDetached.value) return 'detached'
  if (v0.value >= vCritical.value) return 'complete'
  return 'insufficient'
})

const statusMessage = computed(() => {
  if (isDetached.value) return '💥 軌道離脱！(張力/抗力ゼロで放物落下)'
  if (v0.value >= vCritical.value) return '✨ 宙返り完全一周成功！(N > 0 維持)'
  return '⚠️ 速度不足 (最高点手前で落下または振り子振動)'
})

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 410
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.60, Math.max(1.32, 1.40 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0.55, 46.0 * ms], target: [0, 0.5, 0], fov: 14 }
  }
  if (preset === 'side') {
    return { pos: [11.8 * ms, 2.8 * ms, 6.8 * ms], target: [0, 0.45, 0], fov: 40 }
  }
  return { pos: [7.2 * ms, 4.4 * ms, 12.2 * ms], target: [0, 0.45, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

const setCriticalSpeed = () => {
  v0.value = Math.round(vCritical.value * 10) / 10
  resetSim()
}

const togglePlay = () => {
  isRunning.value = !isRunning.value
}

const resetSim = () => {
  theta.value = 0.0
  oscDir = 1
  isDetached.value = false
  detachedTrail = []
  currentV.value = v0.value
  currentN.value = (mass.value * (v0.value ** 2) / radius.value) + mass.value * g
  rebuildTrack()
  updateFrame()
}

const step = (dt) => {
  const R = radius.value
  const m = mass.value

  if (!isDetached.value) {
    const vSquared = (v0.value ** 2) - 2 * g * R * (1 - Math.cos(theta.value))

    if (vSquared <= 0.02) {
      oscDir = -oscDir
      theta.value += oscDir * 0.02
      currentV.value = 0
      currentN.value = Math.max(0, m * g * Math.cos(theta.value))
      return
    }

    const v = Math.sqrt(vSquared)
    currentV.value = v

    const N = (m * vSquared / R) + m * g * Math.cos(theta.value)
    currentN.value = Math.max(0, N)

    const absTh = ((theta.value % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const isInUpperHalf = (absTh > Math.PI / 2 && absTh < 1.5 * Math.PI)
    if (isInUpperHalf && N <= 0) {
      isDetached.value = true
      ballX.value = R * Math.sin(theta.value)
      ballY.value = -R * Math.cos(theta.value)
      detachedTrail = [new THREE.Vector3(ballX.value, ballY.value, 0)]

      ballVx.value = oscDir * v * Math.cos(theta.value)
      ballVy.value = oscDir * v * Math.sin(theta.value)
      return
    }

    const omega = (oscDir * v) / R
    theta.value += omega * dt

    if (theta.value >= Math.PI * 2) {
      theta.value -= Math.PI * 2
    }
  } else {
    ballX.value += ballVx.value * dt
    ballY.value += ballVy.value * dt
    ballVy.value -= g * dt
    detachedTrail.push(new THREE.Vector3(ballX.value, ballY.value, 0))

    currentV.value = Math.hypot(ballVx.value, ballVy.value)
    currentN.value = 0

    if (ballY.value < -R - 1.2 || Math.abs(ballX.value) > R * 2.2) {
      resetSim()
    }
  }
}

const stepSim = (dtSec = 0.02) => {
  step(dtSec)
  updateFrame()
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
      if (isRunning.value) {
        step(dt * timeScale.value)
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

  // 床グリッド (rebuildTrack 内でループ最下点の下に自動配置)
  const grid = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b)
  grid.position.y = -3.8
  scene.add(grid)

  const trackGroup = new THREE.Group()
  scene.add(trackGroup)

  // 小球 (コースター球体)
  const ballGeo = new THREE.SphereGeometry(0.28, 32, 32)
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.18,
    metalness: 0.35
  })
  const ballMesh = new THREE.Mesh(ballGeo, ballMat)
  scene.add(ballMesh)

  // 糸 (3Dシリンダー)
  const stringGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 10)
  stringGeo.translate(0, 0.5, 0)
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4 })
  const stringMesh = new THREE.Mesh(stringGeo, stringMat)
  scene.add(stringMesh)

  // 離脱時の放物軌跡ライン
  const maxDetachPts = 200
  const detachGeo = new THREE.BufferGeometry()
  detachGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxDetachPts * 3), 3))
  const detachMat = new THREE.LineBasicMaterial({ color: 0xf43f5e })
  const detachLine = new THREE.Line(detachGeo, detachMat)
  scene.add(detachLine)

  // 3D ベクトル矢印
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowN = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.4 })
  const arrowMg = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  scene.add(arrowV, arrowN, arrowMg)

  // ラベル
  const labelV = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.5 })
  const labelN = createTextSprite('N (垂直抗力)', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.52 })
  const labelMg = createTextSprite('mg (重力)', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.5 })
  const labelTop = createTextSprite('最高点 (N ≥ 0 で通過)', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.5 })
  scene.add(labelV, labelN, labelMg, labelTop)

  sceneObjs = {
    grid,
    trackGroup,
    ballMesh,
    ballMat,
    stringMesh,
    detachGeo,
    detachLine,
    maxDetachPts,
    arrowV,
    arrowN,
    arrowMg,
    labelV,
    labelN,
    labelMg,
    labelTop
  }

  rebuildTrack()
  updateFrame()
}

function getVisScale() {
  // 半径 3.0m の最大設定時でも視野に綺麗に収まるよう適応スケール
  return radius.value <= 1.8 ? 1.55 : 2.85 / radius.value
}

function rebuildTrack() {
  if (!sceneObjs) return
  const { grid, trackGroup, labelTop } = sceneObjs
  while (trackGroup.children.length > 0) {
    const c = trackGroup.children[0]
    trackGroup.remove(c)
    if (c.geometry) c.geometry.dispose()
    if (c.material) c.material.dispose()
  }

  const visScale = getVisScale()
  const R = radius.value * visScale
  const outerR = R + 0.28
  const floorY = -(outerR + 1.35)
  grid.position.y = floorY

  labelTop.position.set(0, R + 0.72, 0)

  // 最高点マーカー球
  const topDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  )
  topDot.position.set(0, R, 0)
  trackGroup.add(topDot)

  if (trackType.value === 'rail') {
    // 3D ダブルレール・コースターループ + 発光シアンガイド
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.68,
      roughness: 0.25
    })
    for (const zOff of [-0.34, 0.34]) {
      const torusGeo = new THREE.TorusGeometry(outerR, 0.055, 16, 96)
      const torus = new THREE.Mesh(torusGeo, railMat)
      torus.position.z = zOff
      trackGroup.add(torus)
    }

    const glowRingGeo = new THREE.TorusGeometry(R, 0.02, 10, 96)
    const glowRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.34 })
    trackGroup.add(new THREE.Mesh(glowRingGeo, glowRingMat))

    // 枕木クロスバー
    const crossGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.68, 10)
    crossGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const bar = new THREE.Mesh(crossGeo, railMat)
      bar.position.set(outerR * Math.sin(a), -outerR * Math.cos(a), 0)
      trackGroup.add(bar)
    }

    // 支柱スタンド (ループ外側 ±0.55 から floorY までしっかり接地)
    const attachY = -outerR * 0.4
    const legHeight = Math.max(0.5, attachY - floorY)
    const pillarGeo = new THREE.CylinderGeometry(0.075, 0.1, legHeight, 12)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.55, roughness: 0.32 })
    for (const xOff of [-outerR * 0.92, outerR * 0.92]) {
      for (const zLeg of [-0.48, 0.48]) {
        const p = new THREE.Mesh(pillarGeo, pillarMat)
        p.position.set(xOff, floorY + legHeight * 0.5, zLeg)
        trackGroup.add(p)
      }
    }

    // ベース土台ビーム
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(outerR * 2.2, 0.12, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.38 })
    )
    basePlate.position.set(0, floorY + 0.06, 0)
    trackGroup.add(basePlate)
  } else {
    // 糸モード: 中心支点ハブ + ガイドリング + 支柱
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5 })
    )
    trackGroup.add(hub)

    const backRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, Math.abs(floorY), 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.55 })
    )
    backRod.position.set(0, floorY * 0.5, -0.5)
    trackGroup.add(backRod)

    const guideGeo = new THREE.TorusGeometry(R, 0.025, 12, 80)
    const guideMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.62 })
    trackGroup.add(new THREE.Mesh(guideGeo, guideMat))
  }
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    ballMesh,
    ballMat,
    stringMesh,
    detachGeo,
    detachLine,
    maxDetachPts,
    arrowV,
    arrowN,
    arrowMg,
    labelV,
    labelN,
    labelMg
  } = sceneObjs

  const visScale = getVisScale()
  const R = radius.value * visScale

  let px = 0
  let py = 0
  if (!isDetached.value) {
    px = R * Math.sin(theta.value)
    py = -R * Math.cos(theta.value)
    ballMat.color.setHex(0x38bdf8)
    ballMat.emissive.setHex(0x0284c7)
  } else {
    px = ballX.value * visScale
    py = ballY.value * visScale
    ballMat.color.setHex(0xf43f5e)
    ballMat.emissive.setHex(0xe11d48)
  }

  const pos = new THREE.Vector3(px, py, 0)
  ballMesh.position.copy(pos)
  const sFactor = 0.85 + mass.value * 0.1
  ballMesh.scale.set(sFactor, sFactor, sFactor)

  // 糸(3Dシリンダー)の更新
  if (trackType.value === 'string' && !isDetached.value) {
    stringMesh.visible = true
    const sLen = Math.max(0.01, pos.length())
    stringMesh.scale.set(1, sLen, 1)
    stringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())
  } else {
    stringMesh.visible = false
  }

  // 離脱軌跡の更新
  if (isDetached.value && detachedTrail.length > 1) {
    detachLine.visible = true
    const arr = detachGeo.getAttribute('position').array
    const count = Math.min(maxDetachPts, detachedTrail.length)
    for (let i = 0; i < count; i++) {
      const pt = detachedTrail[i]
      arr[i * 3] = pt.x * visScale
      arr[i * 3 + 1] = pt.y * visScale
      arr[i * 3 + 2] = 0
    }
    detachGeo.setDrawRange(0, count)
    detachGeo.getAttribute('position').needsUpdate = true
  } else {
    detachLine.visible = false
  }

  // 3D ベクトル矢印の更新 (最高点付近では mg と N が同じ下向きなので左右に分離表示)
  if (showVectors.value) {
    const nearTop = !isDetached.value && Math.cos(theta.value) < -0.5

    // 1. 重力 mg (常に鉛直下向き)
    const mgLen = Math.min(1.65, 0.8 + mass.value * 0.25)
    const mgOrigin = nearTop ? pos.clone().add(new THREE.Vector3(-0.18, 0, 0)) : pos
    arrowMg.setVector(mgOrigin, new THREE.Vector3(0, -1, 0), mgLen)
    labelMg.visible = true
    labelMg.position.set(
      nearTop ? px - 0.95 : px + 0.72,
      py - mgLen - 0.2,
      0.2
    )

    // 2. 速度ベクトル v
    let vDir = new THREE.Vector3()
    if (!isDetached.value) {
      vDir.set(oscDir * Math.cos(theta.value), oscDir * Math.sin(theta.value), 0).normalize()
    } else {
      vDir.set(ballVx.value, ballVy.value, 0).normalize()
    }
    const vLen = Math.min(2.3, Math.max(0.5, currentV.value * 0.21))
    if (currentV.value > 0.2) {
      arrowV.setVector(pos, vDir, vLen)
      labelV.visible = true
      labelV.updateText(`v = ${currentV.value.toFixed(1)} m/s`, '#6ee7b7', '#10b981')
      labelV.position.copy(pos).addScaledVector(vDir, vLen + 0.48)
    } else {
      arrowV.visible = false
      labelV.visible = false
    }

    // 3. 垂直抗力 / 張力 N (中心向き)
    if (!isDetached.value && currentN.value > 0.3) {
      const nDir = new THREE.Vector3(-px, -py, 0).normalize()
      const nLen = Math.min(R * 0.8, Math.max(0.55, currentN.value * 0.036))
      const nOrigin = nearTop ? pos.clone().add(new THREE.Vector3(0.18, 0, 0)) : pos
      arrowN.setVector(nOrigin, nDir, nLen)
      labelN.visible = true
      const sym = trackType.value === 'string' ? 'T' : 'N'
      labelN.updateText(`${sym} = ${currentN.value.toFixed(1)} N`, '#7dd3fc', '#38bdf8')
      labelN.position.copy(nOrigin).addScaledVector(nDir, nLen + 0.45)
      if (nearTop) {
        labelN.position.x += 0.85
      } else {
        labelN.position.z += 0.35
      }
    } else {
      arrowN.visible = false
      labelN.visible = false
    }
  } else {
    arrowV.visible = false
    arrowN.visible = false
    arrowMg.visible = false
    labelV.visible = false
    labelN.visible = false
    labelMg.visible = false
  }
}

watch([radius, trackType], () => {
  rebuildTrack()
  updateFrame()
})

onMounted(() => {
  resetSim()
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
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 0.85rem 0;
  line-height: 1.4;
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
  gap: 8px;
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
  background: #0284c7;
  color: #fff;
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 410px;
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
.dot-n { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-g { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
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
.status-strip {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.65rem;
}
.status-badge {
  display: inline-block;
  font-size: 0.76rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
  .three-hud-legend,
  .status-badge,
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
}
.status-badge.complete {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
  border: 1px solid #10b981;
}
.status-badge.detached {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
  border: 1px solid #ef4444;
}
.status-badge.insufficient {
  background: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
  border: 1px solid #f59e0b;
}
.control-panel {
  margin-top: 1rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
}
.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}
.btn-group {
  display: flex;
  gap: 0.3rem;
}
.select-btn {
  flex: 1;
  padding: 0.35rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.select-btn.active {
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
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #0284c7;
  color: white;
}
.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}
.btn-accent {
  background: #9333ea;
  color: white;
}
.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
  font-size: 1.1rem;
  font-weight: bold;
  color: #f8fafc;
}
.stat-card .value.highlight {
  color: #38bdf8;
}
.stat-card .value.positive {
  color: #34d399;
}
.stat-card .value.negative {
  color: #f43f5e;
}
.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}
.stat-card .subtext {
  font-size: 0.65rem;
  color: #64748b;
  margin-top: 0.2rem;
}
</style>
