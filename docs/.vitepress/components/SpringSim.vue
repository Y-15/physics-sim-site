<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">🔩 3D ばね振り子（単振動・フックの法則）インタラクティブ実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#34d399;border-color:rgba(16,185,129,0.3)">Three.js 3D Helix</span>
        <span class="sim-badge">復元力 F = −kx・単振動・力学的エネルギー保存</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="cam-chip" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🧊 3D 俯瞰視点
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面視点（単振動の変位と力）
        </button>
        <button class="cam-chip" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          ⭕ 真上視点
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
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.2 }" @click="timeScale = 0.2">🐢 0.2x (超スロー)</button>
          <button :class="{ active: timeScale === 0.4 }" @click="timeScale = 0.4">🎯 0.4x (推奨・観察)</button>
          <button :class="{ active: timeScale === 0.8 }" @click="timeScale = 0.8">0.8x (標準)</button>
          <button :class="{ active: timeScale === 1.2 }" @click="timeScale = 1.2">1.2x (速め)</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="stepForward(0.05)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
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
          <span class="legend-item"><i class="dot-f"></i>復元力 <b>F = −kx</b></span>
          <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
          <span class="legend-item"><i class="dot-x"></i>変位 <b>x</b> (自然長 x=0 基準)</span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">
          🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
        </div>
      </div>
    </div>

    <!-- 力学的エネルギーリアルタイムバー -->
    <div class="energy-bar-card">
      <div class="energy-head">
        <span>⚡ 力学的エネルギー保存 (<i>E</i> = <i>K</i> + <i>U</i> = {{ totalE.toFixed(1) }} J 一定)</span>
        <div class="energy-vals">
          <span style="color:#38bdf8">運動 <i>K</i>: {{ ke.toFixed(1) }} J</span>
          <span style="color:#f59e0b">弾性 <i>U</i>: {{ pe.toFixed(1) }} J</span>
        </div>
      </div>
      <div class="energy-track">
        <div class="seg-k" :style="{ width: (totalE > 0 ? (ke / totalE) * 100 : 0) + '%' }"></div>
        <div class="seg-u" :style="{ width: (totalE > 0 ? (pe / totalE) * 100 : 0) + '%' }"></div>
      </div>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>ばね定数 k: <strong>{{ k }} N/m</strong></label>
        <input type="range" v-model.number="k" min="5" max="100" step="5" />
      </div>
      <div class="control-item">
        <label>質量 m: <strong>{{ m }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.2" max="5" step="0.1" />
      </div>
      <div class="control-item">
        <label>振幅 A: <strong>{{ A }} m</strong></label>
        <input type="range" v-model.number="A" min="0.5" max="2.5" step="0.1" />
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">角振動数 ω</div>
        <div class="stat-value" style="color:#818cf8">{{ omega.toFixed(2) }} <span class="unit">rad/s</span></div>
        <div class="stat-formula">ω = <span class="math-radical">√</span><span class="math-radicand"><span class="frac"><span class="num">k</span><span class="den">m</span></span></span></div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">周期 T</div>
        <div class="stat-value" style="color:#38bdf8">{{ period.toFixed(2) }} <span class="unit">s</span></div>
        <div class="stat-formula">T = <span class="frac"><span class="num">2π</span><span class="den">ω</span></span> = 2π<span class="math-radical">√</span><span class="math-radicand"><span class="frac"><span class="num">m</span><span class="den">k</span></span></span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">現在の変位 x</div>
        <div class="stat-value" style="color:#f59e0b">{{ disp.toFixed(2) }} <span class="unit">m</span></div>
        <div class="stat-formula">x = A cos(ωt)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">復元力 F</div>
        <div class="stat-value" style="color:#f43f5e">{{ force.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">F = -kx</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">運動エネルギー K</div>
        <div class="stat-value" style="color:#10b981">{{ ke.toFixed(2) }} <span class="unit">J</span></div>
        <div class="stat-formula">K = <span class="frac"><span class="num">1</span><span class="den">2</span></span>mv²</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">弾性エネルギー U</div>
        <div class="stat-value" style="color:#fbbf24">{{ pe.toFixed(2) }} <span class="unit">J</span></div>
        <div class="stat-formula">U = <span class="frac"><span class="num">1</span><span class="den">2</span></span>kx²</div>
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
const timeScale = ref(0.4)
const activeCam = ref('3d')
const showVectors = ref(true)

const k = ref(20)
const m = ref(1.0)
const A = ref(1.5)

const omega = computed(() => Math.sqrt(k.value / m.value))
const period = computed(() => (2 * Math.PI) / omega.value)
const disp = ref(1.5)
const force = computed(() => -k.value * disp.value)
const vel = ref(0)
const totalE = computed(() => 0.5 * k.value * A.value * A.value)
const ke = computed(() => Math.max(0, totalE.value - 0.5 * k.value * disp.value * disp.value))
const pe = computed(() => 0.5 * k.value * disp.value * disp.value)

let simTime = 0

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 390
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.22) ? Math.min(1.64, Math.max(1.34, 1.42 / Math.max(0.74, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [-0.2, 0.55, 48.0 * ms], target: [-0.2, 0.4, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [-0.2, 50.0 * ms, 0.45], target: [-0.2, 0, 0], fov: 14 }
  }
  return { pos: [6.2 * ms, 5.0 * ms, 12.8 * ms], target: [-0.2, 0.4, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false

// 単位長さ [0, 1] の 3D らせんコイル TubeGeometry を作成
function createUnitHelixGeometry(coils = 11, radius = 0.36, tubeRadius = 0.055) {
  const pts = []
  const samples = coils * 28
  pts.push(new THREE.Vector3(0, 0, 0))
  pts.push(new THREE.Vector3(0.05, 0, 0))
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    const x = 0.05 + u * 0.9
    const angle = u * coils * Math.PI * 2
    const y = radius * Math.sin(angle)
    const z = radius * Math.cos(angle)
    pts.push(new THREE.Vector3(x, y, z))
  }
  pts.push(new THREE.Vector3(0.95, 0, 0))
  pts.push(new THREE.Vector3(1.0, 0, 0))
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, samples * 2, tubeRadius, 12, false)
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
      if (isPlaying.value) {
        simTime += dt * timeScale.value
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

  // 床面グリッドと滑走レール (明るめスレート + シアン縁取りライン)
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.y = -0.68
  scene.add(grid)

  const trackGeo = new THREE.BoxGeometry(10.2, 0.14, 2.2)
  const trackMesh = new THREE.Mesh(
    trackGeo,
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.45, roughness: 0.32 })
  )
  trackMesh.position.set(-0.2, -0.6, 0)
  scene.add(trackMesh)

  const trackEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(trackGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  )
  trackEdges.position.copy(trackMesh.position)
  scene.add(trackEdges)

  // レール上の位置目盛り (-3m .. +3m)
  for (let xm = -2; xm <= 2; xm++) {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.02, 0.3),
      new THREE.MeshBasicMaterial({ color: xm === 0 ? 0xf59e0b : 0x94a3b8 })
    )
    tick.position.set(xm * 1.32, -0.52, 0.92)
    scene.add(tick)
  }

  // 左端の固定壁 (x = -4.3) + 固定フランジ
  const wallX = -4.3
  const wallGeo = new THREE.BoxGeometry(0.45, 2.6, 2.4)
  const wallMesh = new THREE.Mesh(
    wallGeo,
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.55, roughness: 0.3 })
  )
  wallMesh.position.set(wallX - 0.22, 0.55, 0)
  scene.add(wallMesh)

  const wallEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(wallGeo),
    new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.65 })
  )
  wallEdges.position.copy(wallMesh.position)
  scene.add(wallEdges)

  const flangeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.14, 20),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.75, roughness: 0.22 })
  )
  flangeMesh.rotation.z = Math.PI / 2
  flangeMesh.position.set(wallX + 0.04, 0.15, 0)
  scene.add(flangeMesh)

  // 自然長 (x = 0) 基準マーカーライン & ラベル (-Z側奥にオフセットして復元力 F と分離)
  const eqLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -0.52, -1.45),
    new THREE.Vector3(0, -0.52, 1.1),
    new THREE.Vector3(0, -0.52, -1.45),
    new THREE.Vector3(0, 2.15, -1.45)
  ])
  const eqLine = new THREE.LineSegments(
    eqLineGeo,
    new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.16, gapSize: 0.12 })
  )
  eqLine.computeLineDistances()
  scene.add(eqLine)

  const labelEq = createTextSprite('自然長 (x = 0)', {
    color: '#cbd5e1',
    borderColor: '#64748b',
    scale: 0.48
  })
  labelEq.position.set(0, 2.45, -1.45)
  scene.add(labelEq)

  // 振幅上限・下限 (+A / -A) ガイド柱
  const ampMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  const ampMarkerPos = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 1.6), ampMat)
  const ampMarkerNeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 1.6), ampMat)
  ampMarkerPos.position.y = -0.3
  ampMarkerNeg.position.y = -0.3
  scene.add(ampMarkerPos, ampMarkerNeg)

  // 3D コイルばねメッシュ
  const helixGeo = createUnitHelixGeometry(11, 0.36, 0.055)
  const helixMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x4f46e5,
    emissiveIntensity: 0.35,
    metalness: 0.75,
    roughness: 0.2
  })
  const springMesh = new THREE.Mesh(helixGeo, helixMat)
  springMesh.position.set(wallX, 0.15, 0)
  scene.add(springMesh)

  // 3D 質量ブロック m
  const blockGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15)
  const blockMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    emissive: 0x4338ca,
    emissiveIntensity: 0.4,
    metalness: 0.35,
    roughness: 0.22
  })
  const blockMesh = new THREE.Mesh(blockGeo, blockMat)
  scene.add(blockMesh)

  // 3D ベクトル矢印 (復元力 F, 速度 v, 変位 x)
  const arrowF = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.4 })
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowX = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.35 })
  scene.add(arrowF, arrowV, arrowX)

  const labelF = createTextSprite('F = -kx', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.54 })
  const labelV = createTextSprite('v', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.52 })
  const labelX = createTextSprite('x', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.52 })
  scene.add(labelF, labelV, labelX)

  sceneObjs = {
    wallX,
    ampMarkerPos,
    ampMarkerNeg,
    springMesh,
    helixMat,
    blockMesh,
    arrowF,
    arrowV,
    arrowX,
    labelF,
    labelV,
    labelX
  }

  updateFrame()
}

function updateFrame() {
  if (!sceneObjs) return
  const {
    wallX,
    ampMarkerPos,
    ampMarkerNeg,
    springMesh,
    helixMat,
    blockMesh,
    arrowF,
    arrowV,
    arrowX,
    labelF,
    labelV,
    labelX
  } = sceneObjs

  const t = simTime
  const w = omega.value
  const x = A.value * Math.cos(w * t)
  const v = -A.value * w * Math.sin(w * t)
  const f = -k.value * x

  disp.value = x
  vel.value = v

  // 3D 空間上の位置 (1m = 1.32 units)
  const visScale = 1.32
  const visX = x * visScale
  ampMarkerPos.position.x = A.value * visScale
  ampMarkerNeg.position.x = -A.value * visScale

  const blockHalf = 0.58 * (0.85 + m.value * 0.06)

  blockMesh.scale.setScalar(0.85 + m.value * 0.06)
  blockMesh.position.set(visX, 0.15, 0)

  // コイルばねの伸縮更新 (wallX から block左端まで)
  const springEnd = visX - blockHalf
  const springLen = Math.max(0.5, springEnd - wallX)
  springMesh.scale.set(springLen, 1, 1)

  // 伸びているときはアンバー寄り、縮んでいるときはシアン寄りに発光色を変化
  if (x > 0.15) {
    helixMat.color.setHex(0xf59e0b)
    helixMat.emissive.setHex(0xd97706)
  } else if (x < -0.15) {
    helixMat.color.setHex(0x38bdf8)
    helixMat.emissive.setHex(0x0284c7)
  } else {
    helixMat.color.setHex(0x818cf8)
    helixMat.emissive.setHex(0x4f46e5)
  }

  if (showVectors.value) {
    // 1. 復元力 F = -kx (ブロック上部)
    if (Math.abs(f) > 0.5) {
      const fDir = new THREE.Vector3(Math.sign(f), 0, 0)
      const fLen = Math.min(2.8, Math.max(0.55, Math.abs(f) * 0.042))
      const fOrigin = new THREE.Vector3(visX, 0.95, 0)
      arrowF.setVector(fOrigin, fDir, fLen)
      labelF.visible = true
      labelF.updateText(`復元力 F = ${f.toFixed(1)} N`, '#fda4af', '#f43f5e')
      labelF.position.set(visX + Math.sign(f) * (fLen * 0.55), 1.48, 0.28)
    } else {
      arrowF.visible = false
      labelF.visible = false
    }

    // 2. 速度 v (ブロック手前側)
    if (Math.abs(v) > 0.15) {
      const vDir = new THREE.Vector3(Math.sign(v), 0, 0)
      const vLen = Math.min(2.6, Math.max(0.55, Math.abs(v) * 0.3))
      const vOrigin = new THREE.Vector3(visX, 0.15, 0.78)
      arrowV.setVector(vOrigin, vDir, vLen)
      labelV.visible = true
      labelV.updateText(`v = ${v.toFixed(2)} m/s`, '#6ee7b7', '#10b981')
      labelV.position.set(visX + Math.sign(v) * (vLen + 0.45), 0.15, 0.95)
    } else {
      arrowV.visible = false
      labelV.visible = false
    }

    // 3. 変位 x (x = 0 からブロック位置まで、手前床沿い)
    if (Math.abs(visX) > 0.12) {
      const xDir = new THREE.Vector3(Math.sign(visX), 0, 0)
      const xOrigin = new THREE.Vector3(0, -0.45, 1.15)
      arrowX.setVector(xOrigin, xDir, Math.abs(visX))
      labelX.visible = true
      labelX.updateText(`変位 x = ${x.toFixed(2)} m`, '#fde68a', '#f59e0b')
      labelX.position.set(visX * 0.5, -0.95, 1.25)
    } else {
      arrowX.visible = false
      labelX.visible = false
    }
  } else {
    arrowF.visible = false
    arrowV.visible = false
    arrowX.visible = false
    labelF.visible = false
    labelV.visible = false
    labelX.visible = false
  }
}

function stepForward(delta = 0.05) {
  simTime += delta
  updateFrame()
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function reset() {
  simTime = 0
  updateFrame()
}

watch([k, m, A, showVectors], () => {
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
  background: linear-gradient(90deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
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
}
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 390px;
  background: #080c16;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
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
.dot-f { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-v { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-x { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
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
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
}
.energy-bar-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.energy-head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.82rem;
  margin-bottom: 6px;
}
.energy-vals {
  display: flex;
  gap: 14px;
  font-weight: 700;
}
.energy-track {
  display: flex;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
  background: #090d16;
}
.seg-k {
  background: linear-gradient(90deg, #10b981, #38bdf8);
}
.seg-u {
  background: linear-gradient(90deg, #f59e0b, #f43f5e);
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
  accent-color: #6366f1;
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
  background: linear-gradient(135deg, #6366f1, #a855f7);
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
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.07);
}
.stat-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 0.3rem;
}
.stat-value {
  font-size: 1.3rem;
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
