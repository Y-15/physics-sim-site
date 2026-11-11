<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🏎️ 3D 等加速度直線運動 &amp; v-t グラフ 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="sim-badge">3公式・v-tグラフの傾きと面積</span>
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
          🎥 3D 俯瞰視点
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'front' }"
          @click="setCameraPreset('front')"
        >
          📐 正面/側面視点 (走行＋v-t面)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点 (直線トラック)
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="togglePlay" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ isPlaying ? '⏸ 一時停止' : (simT >= maxT ? '🔄 最初から再生' : '▶ 再生') }}
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
      <button class="btn btn-secondary" @click="stepForward(0.1)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.1s)
      </button>
      <button class="btn btn-secondary" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>速度ベクトル <b>v</b></span>
        <span class="legend-item"><i class="dot-a"></i>加速度ベクトル <b>a</b></span>
        <span class="legend-item"><i class="dot-x"></i>v-t面積＝変位 <b>x</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>初速度 v₀: <strong>{{ v0 }} m/s</strong></label>
        <input type="range" v-model.number="v0" min="-10" max="15" step="1" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">マイナス = 左向き、プラス = 右向き</div>
      </div>
      <div class="control-item">
        <label>加速度 a: <strong>{{ a }} m/s²</strong></label>
        <input type="range" v-model.number="a" min="-5" max="5" step="0.5" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">1秒あたりの速度変化量</div>
      </div>
      <div class="control-item">
        <label>プリセット条件:</label>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
          <button class="preset-btn" @click="setPreset(0, 2)">静止から加速 (v₀=0, a=2)</button>
          <button class="preset-btn" @click="setPreset(12, -3)">急ブレーキ (v₀=12, a=-3)</button>
          <button class="preset-btn" @click="setPreset(-6, 2)">Uターン (v₀=-6, a=2)</button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">経過時間 t</div>
        <div class="stat-value">{{ simT.toFixed(2) }} <span class="unit">s</span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">現在の速度 v</div>
        <div class="stat-value" style="color:#10b981">{{ currentV.toFixed(2) }} <span class="unit">m/s</span></div>
        <div class="stat-formula">① v = v₀ + at</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在の変位 x</div>
        <div class="stat-value" style="color:#38bdf8">{{ currentX.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula">② x = v₀t + <span class="frac"><span class="num">1</span><span class="den">2</span></span>at² (面積)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">公式③ 検証 v² - v₀²</div>
        <div class="stat-value">{{ (currentV * currentV - v0 * v0).toFixed(1) }}</div>
        <div class="stat-formula">2ax = {{ (2 * a * currentX).toFixed(1) }} (一致！)</div>
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

const isPlaying = ref(true)
const timeScale = ref(0.5)
const activeCam = ref('3d')

const v0 = ref(2)
const a = ref(2)
const simT = ref(0)
const maxT = 6.0

const currentV = computed(() => v0.value + a.value * simT.value)
const currentX = computed(() => v0.value * simT.value + 0.5 * a.value * simT.value * simT.value)

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.25 ? Math.min(1.85, 1.32 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.6, 5.8 * s, 16.5 * s], [0.6, 2.25, -0.5], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.6, 2.45, 48.0 * s], [0.6, 2.45, -0.5], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.6, 46.0 * s, 0.8], [0.6, 0, 0.8], duration, 14)
  }
}

function setPreset(newV0, newA) {
  v0.value = newV0
  a.value = newA
  reset()
}

function stepForward(delta = 0.1) {
  isPlaying.value = false
  simT.value = Math.min(maxT, simT.value + delta)
  updateDynamicScene()
}

function togglePlay() {
  if (simT.value >= maxT) reset()
  isPlaying.value = !isPlaying.value
}

function reset() {
  simT.value = 0
  isPlaying.value = true
  rebuildGraphGuide()
  updateDynamicScene()
}

// 3D 空間スケーリング:
// 道路は z = +1.6 に配置。x = 0m を worldX = -4.2 とし、1m = 0.165 ワールド単位
const originWorldX = -4.2
const worldPerM = 0.165
const roadZ = 1.65

// 背面の 3D ホログラム v-t グラフパネル: z = -2.2
const graphZ = -2.2
const graphLeftX = -4.6
const graphWidth = 11.2
const graphOriginY = 3.55 // v = 0 の高さ（下側の v, a 矢印や時間ラベルと十分に分離）
const graphVScale = 0.068 // 1 m/s あたりの高さ

function initThree() {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0.6, 5.8, 16.5],
    initialTarget: [0.6, 2.25, -0.5],
    onFrame: (dt) => {
      if (isPlaying.value) {
        simT.value += dt * timeScale.value
        if (simT.value >= maxT) {
          simT.value = maxT
          isPlaying.value = false
        }
      }
      updateDynamicScene()
    }
  })

  const { scene } = threeCtx

  // 1. 床グリッド
  const grid = new THREE.GridHelper(24, 24, 0x1e293b, 0x0f172a)
  grid.position.set(1.2, -0.55, 0)
  scene.add(grid)

  // 2. 3D 走行トラック（手前 z = roadZ）
  const trackGroup = new THREE.Group()
  scene.add(trackGroup)

  const roadGeo = new THREE.BoxGeometry(17.5, 0.16, 1.7)
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.25
  })
  const roadMesh = new THREE.Mesh(roadGeo, roadMat)
  roadMesh.position.set(1.2, -0.08, roadZ)
  trackGroup.add(roadMesh)

  // ガードレール縁ライン
  const railGeo = new THREE.BoxGeometry(17.5, 0.05, 0.06)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.35
  })
  const frontRail = new THREE.Mesh(railGeo, railMat)
  frontRail.position.set(1.2, 0.02, roadZ + 0.82)
  const backRail = new THREE.Mesh(railGeo, railMat)
  backRail.position.set(1.2, 0.02, roadZ - 0.82)
  trackGroup.add(frontRail, backRail)

  // 距離目盛り (-10m 〜 70m)
  for (let m = -10; m <= 70; m += 10) {
    const wx = originWorldX + m * worldPerM
    const isZero = m === 0
    const tickGeo = new THREE.BoxGeometry(isZero ? 0.08 : 0.04, 0.03, 1.5)
    const tickMat = new THREE.MeshBasicMaterial({
      color: isZero ? 0xf43f5e : 0x64748b
    })
    const tick = new THREE.Mesh(tickGeo, tickMat)
    tick.position.set(wx, 0.015, roadZ)
    trackGroup.add(tick)

    const lbl = createTextSprite(`${m}m`, {
      color: isZero ? '#fda4af' : '#cbd5e1',
      borderColor: isZero ? '#f43f5e' : 'rgba(148,163,184,0.35)',
      fontSize: 34,
      scale: 0.44
    })
    lbl.position.set(wx, -0.28, roadZ + 1.05)
    trackGroup.add(lbl)

    if (isZero) {
      // 原点ポール
      const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 12)
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.4
      })
      const pole = new THREE.Mesh(poleGeo, poleMat)
      pole.position.set(wx, 0.55, roadZ - 0.78)
      trackGroup.add(pole)
    }
  }

  // 変位リボンバー（x = 0 から currentX まで路面上に光る帯）
  const dispRibbonGeo = new THREE.BoxGeometry(1, 0.03, 0.45)
  const dispRibbonMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.65
  })
  const dispRibbon = new THREE.Mesh(dispRibbonGeo, dispRibbonMat)
  dispRibbon.position.set(originWorldX, 0.02, roadZ)
  trackGroup.add(dispRibbon)

  // 3. 3D ビークル（実験ビークル＋車輪）
  const carGroup = new THREE.Group()
  scene.add(carGroup)

  const bodyGeo = new THREE.BoxGeometry(0.95, 0.32, 0.64)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.3,
    metalness: 0.45,
    roughness: 0.25
  })
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
  bodyMesh.position.set(0, 0.28, 0)
  carGroup.add(bodyMesh)

  const cabinGeo = new THREE.BoxGeometry(0.52, 0.22, 0.52)
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.25,
    metalness: 0.7,
    roughness: 0.15
  })
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat)
  cabinMesh.position.set(-0.04, 0.52, 0)
  carGroup.add(cabinMesh)

  const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 18)
  wheelGeo.rotateX(Math.PI / 2)
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.4,
    roughness: 0.5
  })
  const wheels = []
  const wheelOffsets = [
    [-0.28, 0.14, 0.34],
    [0.28, 0.14, 0.34],
    [-0.28, 0.14, -0.34],
    [0.28, 0.14, -0.34]
  ]
  wheelOffsets.forEach(([wx, wy, wz]) => {
    const wMesh = new THREE.Mesh(wheelGeo, wheelMat)
    wMesh.position.set(wx, wy, wz)
    carGroup.add(wMesh)
    wheels.push(wMesh)
  })

  // 4. 速度・加速度 3D ベクトル矢印 & ラベル
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowA = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  scene.add(arrowV, arrowA)

  const labelV = createTextSprite('v = 0.0 m/s', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 36,
    scale: 0.54
  })
  const labelA = createTextSprite('a = 0.0 m/s²', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 34,
    scale: 0.52
  })
  scene.add(labelV, labelA)

  // 5. 背面の 3D v-t グラフホログラムボード (z = graphZ)
  const graphGroup = new THREE.Group()
  scene.add(graphGroup)

  const boardGeo = new THREE.PlaneGeometry(graphWidth + 1.4, 3.8)
  const boardMat = new THREE.MeshBasicMaterial({
    color: 0x0b1324,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide
  })
  const boardMesh = new THREE.Mesh(boardGeo, boardMat)
  boardMesh.position.set(graphLeftX + graphWidth / 2, graphOriginY + 0.15, graphZ - 0.05)
  graphGroup.add(boardMesh)

  // ボード外枠
  const borderEdges = new THREE.EdgesGeometry(boardGeo)
  const borderLine = new THREE.LineSegments(
    borderEdges,
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  borderLine.position.copy(boardMesh.position)
  graphGroup.add(borderLine)

  // t軸 (横軸) と v軸 (縦軸)
  const tAxisArrow = createVectorArrow3D({
    color: 0x94a3b8,
    shaftRadius: 0.025,
    headRadius: 0.08,
    headLength: 0.22
  })
  tAxisArrow.setVector(
    new THREE.Vector3(graphLeftX, graphOriginY, graphZ),
    new THREE.Vector3(1, 0, 0),
    graphWidth + 0.35
  )
  graphGroup.add(tAxisArrow)

  const vAxisArrow = createVectorArrow3D({
    color: 0x94a3b8,
    shaftRadius: 0.025,
    headRadius: 0.08,
    headLength: 0.22
  })
  vAxisArrow.setVector(
    new THREE.Vector3(graphLeftX, graphOriginY - 1.5, graphZ),
    new THREE.Vector3(0, 1, 0),
    3.3
  )
  graphGroup.add(vAxisArrow)

  const vAxisTitle = createTextSprite('v-t グラフ: v [m/s] (傾き=a, 面積=変位x)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 34,
    scale: 0.54
  })
  vAxisTitle.position.set(graphLeftX + 3.2, graphOriginY + 1.72, graphZ + 0.05)
  graphGroup.add(vAxisTitle)

  // t = 1s .. 6s 目盛り
  for (let s = 1; s <= 6; s++) {
    const tx = graphLeftX + (s / maxT) * graphWidth
    const vLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(tx, graphOriginY - 1.4, graphZ),
      new THREE.Vector3(tx, graphOriginY + 1.65, graphZ)
    ])
    const vLine = new THREE.Line(
      vLineGeo,
      new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.55 })
    )
    graphGroup.add(vLine)

    const sLbl = createTextSprite(`${s}s`, {
      color: '#94a3b8',
      borderColor: 'rgba(148,163,184,0.25)',
      fontSize: 30,
      scale: 0.38
    })
    sLbl.position.set(tx, graphOriginY - 1.55, graphZ + 0.04)
    graphGroup.add(sLbl)
  }

  // 理論直線ガイド & アクティブ軌跡ライン & 面積メッシュ用グループ
  const dynamicGraphGroup = new THREE.Group()
  scene.add(dynamicGraphGroup)

  const guideLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(graphLeftX, graphOriginY, graphZ + 0.01),
    new THREE.Vector3(graphLeftX + graphWidth, graphOriginY, graphZ + 0.01)
  ])
  const guideLine = new THREE.Line(
    guideLineGeo,
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 })
  )
  dynamicGraphGroup.add(guideLine)

  const activeLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(graphLeftX, graphOriginY, graphZ + 0.04),
    new THREE.Vector3(graphLeftX, graphOriginY, graphZ + 0.04)
  ])
  const activeLine = new THREE.Line(
    activeLineGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8 })
  )
  dynamicGraphGroup.add(activeLine)

  const curDotMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.7 })
  )
  dynamicGraphGroup.add(curDotMesh)

  // v-t 面積ポリゴン（最大2三角形＝台形または正負分割に対応するため Shape / BufferGeometry を更新）
  const areaGeo = new THREE.BufferGeometry()
  areaGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3))
  const areaMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  })
  const areaMesh = new THREE.Mesh(areaGeo, areaMat)
  dynamicGraphGroup.add(areaMesh)

  const areaLabel = createTextSprite('面積＝変位 x = 0.0 m', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 34,
    scale: 0.5
  })
  dynamicGraphGroup.add(areaLabel)

  sceneObjects = {
    carGroup,
    wheels,
    dispRibbon,
    arrowV,
    arrowA,
    labelV,
    labelA,
    guideLine,
    activeLine,
    curDotMesh,
    areaMesh,
    areaLabel
  }

  rebuildGraphGuide()
  updateDynamicScene()
  setCameraPreset(activeCam.value, 0)
}

function rebuildGraphGuide() {
  if (!sceneObjects) return
  const { guideLine } = sceneObjects
  const yStart = graphOriginY + v0.value * graphVScale
  const yEnd = graphOriginY + (v0.value + a.value * maxT) * graphVScale
  const posAttr = guideLine.geometry.getAttribute('position')
  posAttr.setXYZ(0, graphLeftX, yStart, graphZ + 0.01)
  posAttr.setXYZ(1, graphLeftX + graphWidth, yEnd, graphZ + 0.01)
  posAttr.needsUpdate = true
}

function updateDynamicScene() {
  if (!sceneObjects) return
  const {
    carGroup,
    wheels,
    dispRibbon,
    arrowV,
    arrowA,
    labelV,
    labelA,
    activeLine,
    curDotMesh,
    areaMesh,
    areaLabel
  } = sceneObjects

  const xVal = currentX.value
  const vVal = currentV.value
  const aVal = a.value
  const tVal = simT.value

  // 1. 車両の 3D 位置と車輪回転
  const carWorldX = originWorldX + xVal * worldPerM
  carGroup.position.set(carWorldX, 0, roadZ)
  wheels.forEach(w => {
    w.rotation.z = -xVal * 1.8
  })

  // 2. 変位リボンバー
  const dispLen = Math.abs(xVal * worldPerM)
  if (dispLen > 0.03) {
    dispRibbon.visible = true
    dispRibbon.scale.set(dispLen, 1, 1)
    dispRibbon.position.set(originWorldX + (xVal * worldPerM) / 2, 0.02, roadZ)
  } else {
    dispRibbon.visible = false
  }

  // 3. 速度ベクトル矢印 v (緑)
  if (Math.abs(vVal) > 0.08) {
    const vDir = new THREE.Vector3(Math.sign(vVal), 0, 0)
    const vLen = Math.min(3.4, Math.max(0.45, Math.abs(vVal) * 0.16))
    const vOrigin = new THREE.Vector3(carWorldX, 0.68, roadZ)
    arrowV.setVector(vOrigin, vDir, vLen)
    labelV.visible = true
    labelV.updateText(`v = ${vVal.toFixed(1)} m/s`, '#6ee7b7', '#10b981')
    labelV.position.set(carWorldX + Math.sign(vVal) * (vLen * 0.65), 1.0, roadZ + 0.28)
  } else {
    arrowV.visible = false
    labelV.visible = false
  }

  // 4. 加速度ベクトル矢印 a (アンバー)
  if (Math.abs(aVal) > 0.08) {
    const aDir = new THREE.Vector3(Math.sign(aVal), 0, 0)
    const aLen = Math.min(2.6, Math.max(0.45, Math.abs(aVal) * 0.34))
    const aOrigin = new THREE.Vector3(carWorldX, 1.28, roadZ)
    arrowA.setVector(aOrigin, aDir, aLen)
    labelA.visible = true
    labelA.updateText(`a = ${aVal.toFixed(1)} m/s²`, '#fde68a', '#f59e0b')
    labelA.position.set(carWorldX + Math.sign(aVal) * (aLen * 0.65), 1.56, roadZ - 0.25)
  } else {
    arrowA.visible = false
    labelA.visible = false
  }

  // 5. 3D v-t グラフ更新
  const curGraphX = graphLeftX + (tVal / maxT) * graphWidth
  const startGraphY = graphOriginY + v0.value * graphVScale
  const curGraphY = graphOriginY + vVal * graphVScale

  const actAttr = activeLine.geometry.getAttribute('position')
  actAttr.setXYZ(0, graphLeftX, startGraphY, graphZ + 0.04)
  actAttr.setXYZ(1, curGraphX, curGraphY, graphZ + 0.04)
  actAttr.needsUpdate = true

  curDotMesh.position.set(curGraphX, curGraphY, graphZ + 0.05)

  // 台形面積メッシュ (2三角形で [graphLeftX, graphOriginY] -> [graphLeftX, startGraphY] -> [curGraphX, curGraphY] -> [curGraphX, graphOriginY])
  if (tVal > 0.03) {
    areaMesh.visible = true
    const pos = areaMesh.geometry.getAttribute('position').array
    const zP = graphZ + 0.02
    // Triangle 1: (x0, y0), (x0, yStart), (x1, yCur)
    pos[0] = graphLeftX; pos[1] = graphOriginY; pos[2] = zP
    pos[3] = graphLeftX; pos[4] = startGraphY;  pos[5] = zP
    pos[6] = curGraphX;  pos[7] = curGraphY;    pos[8] = zP
    // Triangle 2: (x0, y0), (x1, yCur), (x1, y0)
    pos[9]  = graphLeftX; pos[10] = graphOriginY; pos[11] = zP
    pos[12] = curGraphX;  pos[13] = curGraphY;    pos[14] = zP
    pos[15] = curGraphX;  pos[16] = graphOriginY; pos[17] = zP
    areaMesh.geometry.getAttribute('position').needsUpdate = true

    areaLabel.visible = true
    areaLabel.updateText(`面積＝変位 x = ${xVal.toFixed(1)} m`, '#7dd3fc', '#38bdf8')
    const upperY = Math.max(graphOriginY + 0.45, Math.max(startGraphY, curGraphY) + 0.45)
    areaLabel.position.set(
      Math.max(graphLeftX + 1.8, (graphLeftX + curGraphX) / 2 + 0.4),
      upperY,
      graphZ + 0.16
    )
  } else {
    areaMesh.visible = false
    areaLabel.visible = false
  }
}

watch([v0, a], () => {
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
.sim-container {
  background: linear-gradient(145deg, #0f172a, #080c16);
  border: 1px solid rgba(148, 163, 184, 0.18);
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
  background: linear-gradient(90deg, #38bdf8, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
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
.playback-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}
.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.speed-label {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
}
.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.speed-btn-group button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}
.speed-btn-group button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
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
.three-hud-legend {
  position: absolute;
  top: 10px;
  left: 12px;
  max-width: calc(100% - 24px);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.76rem;
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
.dot-a { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-x { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
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
  accent-color: #38bdf8;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}
.preset-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
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
  background: linear-gradient(135deg, #38bdf8, #0284c7);
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
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.07);
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
@media (max-width: 768px) {
  .sim-container {
    padding: 1rem;
  }
  .three-viewport-wrap {
    height: 315px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.7rem;
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
