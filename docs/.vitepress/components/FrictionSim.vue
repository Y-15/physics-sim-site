<template>
  <div class="sim-container">
    <div class="sim-header">
      <span class="sim-title">📐 3D 摩擦力と斜面上の運動 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="sim-badge" style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.3)">Three.js 3D Interactive</span>
        <span class="sim-badge">静止摩擦力・動摩擦力・摩擦角</span>
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
          :class="{ active: activeCam === 'side' }"
          @click="setCameraPreset('side')"
        >
          📐 側面視点 (力の分解図)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点
        </button>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-mg"></i>重力 <b>mg</b></span>
        <span class="legend-item"><i class="dot-n"></i>垂直抗力 <b>N</b></span>
        <span class="legend-item"><i class="dot-f"></i>摩擦力 <b>f</b></span>
        <span class="legend-item"><i class="dot-down"></i>斜面分力 <b>mg sinθ</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <div class="controls-grid">
      <div class="control-item">
        <label>斜面の傾斜角 θ: <strong>{{ thetaDeg }}°</strong></label>
        <input type="range" v-model.number="thetaDeg" min="0" max="65" step="1" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">
          滑り出す限界角（摩擦角）: <strong>{{ critAngleDeg.toFixed(1) }}°</strong>
        </div>
      </div>
      <div class="control-item">
        <label>静止摩擦係数 μₛ: <strong>{{ muS.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muS" min="0.1" max="0.9" step="0.05" />
      </div>
      <div class="control-item">
        <label>動摩擦係数 μₖ: <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.05" :max="muS" step="0.05" />
        <div style="font-size:0.75rem;color:#a1a1aa;margin-top:2px">※動摩擦係数は常に μₖ ≤ μₛ</div>
      </div>
      <div class="control-item">
        <label>物体の質量 m: <strong>{{ m }} kg</strong></label>
        <input type="range" v-model.number="m" min="0.5" max="5.0" step="0.5" />
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" :class="{ highlight: isSliding }">
        <div class="stat-label">現在の状態</div>
        <div class="stat-value" :style="{ color: isSliding ? '#ef4444' : '#10b981', fontSize: '1.15rem' }">
          {{ isSliding ? '🚀 滑走中 (動摩擦)' : '🛑 静止 (静止摩擦)' }}
        </div>
        <div class="stat-formula">{{ isSliding ? `加速度 a = ${accel.toFixed(2)} m/s²` : '合力 = 0 N (つり合い)' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">斜面平行の重力分力</div>
        <div class="stat-value" style="color:#fb923c">{{ forceDown.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">mg sin θ</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最大静止摩擦力</div>
        <div class="stat-value">{{ maxStaticFriction.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">fₛ,max = μₛN</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">現在の摩擦力 f</div>
        <div class="stat-value" :style="{ color: isSliding ? '#f43f5e' : '#fbbf24' }">{{ currentFriction.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">{{ isSliding ? 'fₖ = μₖN (動摩擦力)' : 'fₛ = mg sin θ (静止摩擦力)' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">垂直抗力 N</div>
        <div class="stat-value" style="color:#38bdf8">{{ normalForce.toFixed(1) }} <span class="unit">N</span></div>
        <div class="stat-formula">N = mg cos θ</div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="startSlideDemo">▶ 滑走スタート (θ = {{ Math.min(60, Math.ceil(critAngleDeg + 8)) }}°)</button>
      <button class="preset-btn" @click="startTiltExperiment">📐 傾斜角を0°から徐々に上げる実験</button>
      <button :class="['preset-btn', { active: Math.abs(thetaDeg - critAngleDeg) < 0.6 }]" @click="setExactCritical">
        🎯 限界角に合わせる ({{ critAngleDeg.toFixed(1) }}°)
      </button>
      <button class="preset-btn" @click="resetBlock">⏮ 最上部に戻す</button>
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
const thetaDeg = ref(25)
const muS = ref(0.5)
const muK = ref(0.35)
const m = ref(2.0)
const g = 9.8

const thetaRad = computed(() => (thetaDeg.value * Math.PI) / 180)
const critAngleDeg = computed(() => (Math.atan(muS.value) * 180) / Math.PI)

const normalForce = computed(() => m.value * g * Math.cos(thetaRad.value))
const forceDown = computed(() => m.value * g * Math.sin(thetaRad.value))
const maxStaticFriction = computed(() => muS.value * normalForce.value)

const isSliding = computed(() => forceDown.value > maxStaticFriction.value + 0.001)

const currentFriction = computed(() => {
  if (isSliding.value) {
    return muK.value * normalForce.value
  } else {
    return forceDown.value
  }
})

const accel = computed(() => {
  if (!isSliding.value) return 0
  return Math.max(0, g * (Math.sin(thetaRad.value) - muK.value * Math.cos(thetaRad.value)))
})

let blockS = 0 // 斜面に沿った移動距離 (3Dワールド単位: 0 〜 maxSlideDist)
let blockVel = 0
let pauseAtBottom = 0
let isTilting = false

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.05, 1.48 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.4, 4.6 * s, 12.2 * s], [0, 1.9, 0], duration, 42)
  } else if (preset === 'side') {
    threeCtx.moveCameraTo([-0.1, 2.0, 40.0 * s], [-0.1, 2.0, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 40.0 * s, 0.01], [0, 0, 0], duration, 14)
  }
}

function setExactCritical() {
  isTilting = false
  thetaDeg.value = Math.round(critAngleDeg.value * 10) / 10
  resetBlock()
}

function startSlideDemo() {
  isTilting = false
  thetaDeg.value = Math.min(60, Math.ceil(critAngleDeg.value + 8))
  resetBlock()
}

function startTiltExperiment() {
  thetaDeg.value = 5
  resetBlock()
  isTilting = true
}

function resetBlock() {
  blockS = 0
  blockVel = 0
  pauseAtBottom = 0
  updateScene(0)
}

// 斜面のヒンジ（左下端）ワールド座標
const hingeX = -3.6
const hingeY = -0.35
const slopeLength = 6.8
const blockW = 0.95
const blockH = 0.62
const blockD = 0.85

function initThree() {
  if (!threeContainer.value) return
  let lastCamAspect = 0

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0.4, 4.6, 12.2],
    initialTarget: [0, 1.9, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.18) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
      }
      updateScene(dt)
    }
  })

  const { scene } = threeCtx

  // 1. 水平基準床グリッドと台座
  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, hingeY - 0.02, 0)
  scene.add(grid)

  const basePlank = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 0.14, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x293548, roughness: 0.65, metalness: 0.25 })
  )
  basePlank.position.set(0.2, hingeY - 0.07, 0)
  scene.add(basePlank)

  // ヒンジ円柱
  const hingeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 2.65, 20),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.25 })
  )
  hingeMesh.rotation.x = Math.PI / 2
  hingeMesh.position.set(hingeX, hingeY, 0)
  scene.add(hingeMesh)

  // 2. 斜面ピボットグループ（左下端ヒンジ中心に回転）
  const rampPivot = new THREE.Group()
  rampPivot.position.set(hingeX, hingeY, 0)
  scene.add(rampPivot)

  const rampThickness = 0.22
  const rampGeo = new THREE.BoxGeometry(slopeLength, rampThickness, 2.3)
  rampGeo.translate(slopeLength / 2, -rampThickness / 2, 0)
  const rampMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    emissive: 0x1e293b,
    emissiveIntensity: 0.45,
    roughness: 0.4,
    metalness: 0.35
  })
  const rampMesh = new THREE.Mesh(rampGeo, rampMat)
  rampPivot.add(rampMesh)

  // 斜面のサイドレール縁と上面ベベル目盛り（3Dの視認性向上）
  const sideEdgeGeo = new THREE.BoxGeometry(slopeLength, 0.06, 0.07)
  sideEdgeGeo.translate(slopeLength / 2, 0.03, 0)
  const sideEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    metalness: 0.5
  })
  const edgeFront = new THREE.Mesh(sideEdgeGeo, sideEdgeMat)
  edgeFront.position.z = 1.12
  const edgeBack = new THREE.Mesh(sideEdgeGeo, sideEdgeMat)
  edgeBack.position.z = -1.12
  rampPivot.add(edgeFront, edgeBack)

  for (let d = 1; d <= 6; d++) {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.02, 2.15),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    )
    tick.position.set(d, 0.01, 0)
    rampPivot.add(tick)
  }

  // 3. 3D ブロック（斜面座標系内の子要素またはワールド配置）
  const blockMesh = new THREE.Mesh(
    new THREE.BoxGeometry(blockW, blockH, blockD),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
      metalness: 0.35,
      roughness: 0.3
    })
  )
  scene.add(blockMesh)

  // 角度 θ の円弧ライン & ラベル
  const arcGeo = new THREE.BufferGeometry()
  arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(32 * 3), 3))
  const arcLine = new THREE.Line(
    arcGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8 })
  )
  scene.add(arcLine)

  const labelTheta = createTextSprite('θ = 25°', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 34,
    scale: 0.48
  })
  scene.add(labelTheta)

  // 4. 力の3Dベクトル矢印 (mg, N, f, mg sinθ)
  const arrowMg = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.34 })
  const arrowN = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowF = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowDown = createVectorArrow3D({ color: 0xfb923c, shaftRadius: 0.048, headRadius: 0.14, headLength: 0.32, opacity: 0.9 })
  scene.add(arrowMg, arrowN, arrowF, arrowDown)

  const labelMg = createTextSprite('mg', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.48 })
  const labelN = createTextSprite('N', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.48 })
  const labelF = createTextSprite('f', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 32, scale: 0.52 })
  const labelDown = createTextSprite('mg sinθ', { color: '#fdba74', borderColor: '#fb923c', fontSize: 32, scale: 0.5 })
  scene.add(labelMg, labelN, labelF, labelDown)

  sceneObjects = {
    rampPivot,
    blockMesh,
    arcGeo,
    labelTheta,
    arrowMg,
    arrowN,
    arrowF,
    arrowDown,
    labelMg,
    labelN,
    labelF,
    labelDown
  }

  updateScene(0)
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
}

function updateScene(dt) {
  if (!sceneObjects) return
  const {
    rampPivot,
    blockMesh,
    arcGeo,
    labelTheta,
    arrowMg,
    arrowN,
    arrowF,
    arrowDown,
    labelMg,
    labelN,
    labelF,
    labelDown
  } = sceneObjects

  if (isTilting && dt > 0) {
    if (!isSliding.value && thetaDeg.value < 65) {
      thetaDeg.value = Math.min(65, Math.round((thetaDeg.value + dt * 8) * 10) / 10)
    } else {
      isTilting = false
    }
  }

  const rad = thetaRad.value
  rampPivot.rotation.z = rad

  const initialTopMargin = 1.25
  const maxSlideDist = slopeLength - initialTopMargin - 0.95

  if (isSliding.value && dt > 0) {
    if (blockS >= maxSlideDist) {
      pauseAtBottom += dt
      if (pauseAtBottom > 0.9) {
        blockS = 0
        blockVel = 0
        pauseAtBottom = 0
      }
    } else {
      blockVel += accel.value * dt * 0.65
      blockS += blockVel * dt
      if (blockS >= maxSlideDist) {
        blockS = maxSlideDist
        blockVel = 0
      }
    }
  } else if (!isSliding.value) {
    blockVel = 0
    pauseAtBottom = 0
  }

  // 斜面下端ヒンジからの距離 distAlongSlope
  const distAlongSlope = slopeLength - initialTopMargin - blockS
  const cosT = Math.cos(rad)
  const sinT = Math.sin(rad)

  // 斜面法線単位ベクトル（左上向き）と斜面平行上向き単位ベクトル（右上向き）
  const normVec = new THREE.Vector3(-sinT, cosT, 0)
  const paraUpVec = new THREE.Vector3(cosT, sinT, 0)

  // ブロック底面中心と重心ワールド座標
  const contactX = hingeX + distAlongSlope * cosT
  const contactY = hingeY + distAlongSlope * sinT
  const centerPos = new THREE.Vector3(
    contactX + normVec.x * (blockH / 2),
    contactY + normVec.y * (blockH / 2),
    0
  )

  blockMesh.position.copy(centerPos)
  blockMesh.rotation.z = rad

  const bMat = blockMesh.material
  if (isSliding.value) {
    bMat.color.setHex(0xf43f5e)
    bMat.emissive.setHex(0xbe123c)
  } else {
    bMat.color.setHex(0x3b82f6)
    bMat.emissive.setHex(0x1d4ed8)
  }

  // 角度円弧の更新
  const arcR = 1.45
  const arcArr = arcGeo.getAttribute('position').array
  for (let i = 0; i < 32; i++) {
    const a = (i / 31) * rad
    arcArr[i * 3] = hingeX + arcR * Math.cos(a)
    arcArr[i * 3 + 1] = hingeY + arcR * Math.sin(a)
    arcArr[i * 3 + 2] = 0.85
  }
  arcGeo.getAttribute('position').needsUpdate = true
  labelTheta.updateText(`θ = ${thetaDeg.value}°`, '#7dd3fc', '#38bdf8')
  labelTheta.position.set(hingeX + 1.55, hingeY + 0.35, 1.55)

  // 力のベクトルスケール（質量 m に応じて自然な長さ 0.8 .. 2.3 に調整）
  const forceScale = 2.0 / Math.max(12, m.value * g)

  // 1. 重力 mg (鉛直真下・上面視点で分離するため前面 z=+1.55)
  const mgVal = m.value * g
  const mgLen = Math.max(0.75, mgVal * forceScale)
  arrowMg.setVector(centerPos, new THREE.Vector3(0, -1, 0), mgLen)
  labelMg.updateText(`mg = ${mgVal.toFixed(1)} N`, '#fde68a', '#f59e0b')
  labelMg.position.set(centerPos.x + 0.45, centerPos.y - mgLen - 0.25, 1.55)

  // 2. 垂直抗力 N (法線方向・上部のHUDに隠れないよう右横・最奥 z=-1.35)
  const nVal = normalForce.value
  const nLen = Math.max(0.5, nVal * forceScale)
  arrowN.setVector(centerPos, normVec, nLen)
  labelN.updateText(`N = ${nVal.toFixed(1)} N`, '#7dd3fc', '#38bdf8')
  labelN.position.copy(centerPos).addScaledVector(normVec, nLen * 0.82)
  labelN.position.x -= 0.95
  labelN.position.z = -1.35

  // 3. 摩擦力 f (斜面上向き・上面視点分離のため z=-0.65)
  const fVal = currentFriction.value
  const fLen = fVal * forceScale
  if (fLen > 0.08) {
    arrowF.setVector(centerPos, paraUpVec, Math.max(0.45, fLen))
    labelF.visible = true
    const fName = isSliding.value ? '動摩擦力 fₖ' : '静止摩擦力 fₛ'
    const fCol = isSliding.value ? '#fda4af' : '#fde68a'
    const fBdr = isSliding.value ? '#f43f5e' : '#fbbf24'
    labelF.updateText(`${fName} = ${fVal.toFixed(1)} N`, fCol, fBdr)
    labelF.position.copy(centerPos).addScaledVector(paraUpVec, Math.max(0.45, fLen) + 0.55)
    labelF.position.y += 0.25
    labelF.position.z = -0.65
  } else {
    arrowF.visible = false
    labelF.visible = false
  }

  // 4. 重力の斜面下向き分力 mg sinθ (上面視点分離のため z=+0.85)
  const downVal = forceDown.value
  const downLen = downVal * forceScale
  if (downLen > 0.08) {
    const paraDownVec = paraUpVec.clone().negate()
    arrowDown.setVector(centerPos, paraDownVec, Math.max(0.45, downLen))
    labelDown.visible = true
    labelDown.updateText(`mg sinθ = ${downVal.toFixed(1)} N`, '#fdba74', '#fb923c')
    labelDown.position.copy(centerPos).addScaledVector(paraDownVec, Math.max(0.45, downLen) + 0.55)
    labelDown.position.y += 0.22
    labelDown.position.z = 0.85
  } else {
    arrowDown.visible = false
    labelDown.visible = false
  }
}

watch([thetaDeg, muS, muK, m], () => {
  if (muK.value > muS.value) {
    muK.value = muS.value
  }
  if (!isTilting) {
    blockS = 0
    blockVel = 0
    pauseAtBottom = 0
  }
  updateScene(0)
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
  background: linear-gradient(90deg, #fbbf24, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
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
  margin-bottom: 0.85rem;
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
.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 400px;
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
  gap: 9px;
  flex-wrap: wrap;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.72rem;
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
.dot-mg { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-n { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-f { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.dot-down { background: #fb923c; box-shadow: 0 0 6px #fb923c; }
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
  accent-color: #fbbf24;
  cursor: pointer;
}
.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d8;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.preset-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.preset-btn.active {
  background: rgba(251, 191, 36, 0.25);
  border-color: #fbbf24;
  color: #fbbf24;
}
.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
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
  background: linear-gradient(135deg, #fbbf24, #ea580c);
  color: #09090b;
  font-weight: 700;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
}
.stat-card.highlight {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.07);
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
    height: 330px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 7px;
    font-size: 0.68rem;
  }
}
</style>
