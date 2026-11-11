<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🌀</span>
        <h3>3D 重力場と一様磁場中の荷電粒子サイクロイド運動・床面反発シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        鉛直下向きの重力場 <i>g</i> と奥向き（-<i>z</i>）の一様磁場 <i>B</i> が直交する3D空間で放たれた正電荷 <i>q</i> のサイクロイド運動と、
        高さ <i>y</i> = -<i>R</i> の水平床面での反発（弾性・非弾性衝突）。
        ドリフト速度 <i>V</i><sub>0</sub> = <i>mg</i>/(<i>qB</i>) による慣性系 <i>S'</i> への座標変換、床面到達時の水平速度 <i>v</i><sub><i>x</i></sub> = <i>V</i><sub>0</sub>（不変）、および反発係数 <i>e</i> による跳ね返り高さの減衰を3D空間で検証できます。
      </p>
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
          📐 正面視点 (xy サイクロイド平面)
        </button>
        <button
          class="cam-chip"
          :class="{ active: activeCam === 'top' }"
          @click="setCameraPreset('top')"
        >
          🔼 上面視点 (磁場 B とドリフト方向)
        </button>
      </div>
    </div>

    <!-- ステータスバッジバー（ビューポート上部に配置し凡例との重複を回避） -->
    <div class="sim-overlay-badge">
      <span class="badge-stat">衝突回数: <strong>{{ bounceCount }}</strong> 回</span>
      <span class="badge-stat">床到達時 <i>v<sub>x</sub></i>: <strong>{{ impactVx.toFixed(2) }}</strong> m/s (理論値 <i>V</i><sub>0</sub> = {{ v0.toFixed(2) }})</span>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
        <span class="legend-item"><i class="dot-b"></i>磁場 <b>B (-z向き)</b></span>
        <span class="legend-item"><i class="dot-g"></i>重力 <b>mg (-y向き)</b></span>
        <span class="legend-item"><i class="dot-s"></i>ドリフト系 <b>S' 円軌道</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>反発係数 <i>e</i>: <strong>{{ eRestitution.toFixed(2) }}</strong> ({{ eRestitution === 1 ? '完全弾性衝突' : '非弾性衝突' }})</span>
            <input type="range" v-model.number="eRestitution" min="0.2" max="1.0" step="0.05" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>磁束密度 <i>B</i>: <strong>{{ magneticB.toFixed(1) }} T</strong></span>
            <input type="range" v-model.number="magneticB" min="1.0" max="5.0" step="0.5" />
          </label>
        </div>

        <div class="control-group ctrl-block">
          <span class="ctrl-title">床（<i>y</i> = -<i>R</i>）の配置:</span>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: floorEnabled }" @click="floorEnabled = !floorEnabled">
              {{ floorEnabled ? '床あり (y = -R で跳ね返る)' : '床なし (完全サイクロイド)' }}
            </button>
          </div>
        </div>

        <div class="control-group ctrl-block">
          <span class="ctrl-title">ドリフト慣性系 S' の円ガイド表示:</span>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: showDriftCircle }" @click="showDriftCircle = !showDriftCircle">
              {{ showDriftCircle ? '表示中 (等速円運動ガイド)' : '非表示' }}
            </button>
          </div>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="togglePlay">
          {{ isRunning ? '⏸ 一時停止' : '▶ 再生' }}
        </button>
        <button class="btn btn-secondary" @click="stepForward" :disabled="isRunning">
          ⏭ 1コマ進める
        </button>
        <button class="btn btn-secondary" @click="resetSim">
          🔄 リセット
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">ドリフト速度 <i>V</i><sub>0</sub> = <i>mg</i>/(<i>qB</i>)</span>
        <span class="value highlight">{{ v0.toFixed(2) }} <span class="unit">m/s</span></span>
        <span class="subtext">慣性系 S' の移動速度</span>
      </div>

      <div class="stat-card">
        <span class="label">特性半径 <i>R</i> = <i>m</i><sup>2</sup><i>g</i>/(<i>q</i><sup>2</sup><i>B</i><sup>2</sup>)</span>
        <span class="value">{{ rRadius.toFixed(2) }} <span class="unit">m</span></span>
        <span class="subtext">床面高さ y = -{{ rRadius.toFixed(2) }} m</span>
      </div>

      <div class="stat-card">
        <span class="label">サイクロトロン角振動数 <i>ω</i> = <i>qB</i>/<i>m</i></span>
        <span class="value">{{ omega.toFixed(2) }} <span class="unit">rad/s</span></span>
        <span class="subtext">周期 T = {{ (2 * Math.PI / omega).toFixed(2) }} s</span>
      </div>

      <div class="stat-card">
        <span class="label">理論滞空時間 Δ<i>T</i> = π/<i>ω</i></span>
        <span class="value highlight">{{ (Math.PI / omega).toFixed(2) }} <span class="unit">s</span></span>
        <span class="subtext">反発係数 e に依らず常に一定！</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let sceneObjects = null

const activeCam = ref('3d')

// 物理パラメータ
const mass = 1.0 // kg
const charge = 1.0 // C
const gravity = 9.8 // m/s^2
const magneticB = ref(2.5) // T
const eRestitution = ref(0.8)
const floorEnabled = ref(true)
const showDriftCircle = ref(true)
const isRunning = ref(true)

// 理論値
const v0 = computed(() => (mass * gravity) / (charge * magneticB.value))
const omega = computed(() => (charge * magneticB.value) / mass)
const rRadius = computed(() => (mass * mass * gravity) / (charge * charge * magneticB.value * magneticB.value))

// シミュレーション状態
let simTime = 0
let posX = 0
let posY = 0
let velX = 0
let velY = 0
const bounceCount = ref(0)
const impactVx = ref(v0.value)
let trajectory = [{ x: 0, y: 0 }]

function getMobileScale() {
  if (!threeContainer.value) return 1.0
  const aspect = threeContainer.value.clientWidth / Math.max(1, threeContainer.value.clientHeight)
  return aspect < 1.25 ? Math.max(1.22, 1.55 / Math.max(0.65, aspect)) : 1.0
}

let lastAspect = 0

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  lastAspect = threeCtx.camera.aspect || 1.7
  const ms = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.4, 2.1 * ms, 13.8 * ms], [0.2, 0.5, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.2, 0.65, 45.0 * ms], [0.2, 0.65, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.2, 49.0 * ms, 0.01], [0.2, 0, 0], duration, 14)
  }
}

function resetSim() {
  simTime = 0
  posX = 0
  posY = 0
  velX = 0
  velY = 0
  bounceCount.value = 0
  impactVx.value = v0.value
  trajectory = [{ x: 0, y: 0 }]
  rebuildCycloidGuide()
  syncScene()
}

watch([magneticB, floorEnabled, eRestitution], () => {
  resetSim()
})

function togglePlay() {
  isRunning.value = !isRunning.value
}

// 3D空間スケーリング:
// R が変わっても3Dステージ [-5.0 .. +5.5] 内でサイクロイドが美しく3〜4バウンド見えるよう正規化スケールを計算
const worldScale = computed(() => {
  return 1.35 / Math.max(0.25, rRadius.value)
})
const startWorldX = -4.6
const startWorldY = 1.15

function updatePhysics(dt) {
  const subSteps = 8
  const sdt = dt / subSteps
  const B = magneticB.value
  const q_m = (charge * B) / mass
  const g = gravity
  const floorY = -rRadius.value

  for (let s = 0; s < subSteps; s++) {
    const ax = -q_m * velY
    const ay = q_m * velX - g

    velX += ax * sdt
    velY += ay * sdt
    posX += velX * sdt
    posY += velY * sdt
    simTime += sdt

    if (floorEnabled.value && posY <= floorY && velY < 0) {
      posY = floorY
      impactVx.value = velX
      velY = -eRestitution.value * velY
      bounceCount.value++
    }
  }

  if (
    trajectory.length === 0 ||
    Math.hypot(posX - trajectory[trajectory.length - 1].x, posY - trajectory[trajectory.length - 1].y) > 0.03 * rRadius.value
  ) {
    trajectory.push({ x: posX, y: posY })
    if (trajectory.length > 500) {
      trajectory.shift()
    }
  }

  // 右端まで到達したらループリセット
  const wx = startWorldX + posX * worldScale.value
  if (wx > 5.8) {
    resetSim()
  }
}

function stepForward() {
  updatePhysics(0.025)
  syncScene()
}

function initThree() {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0.4, 2.1, 13.8],
    initialTarget: [0.2, 0.5, 0],
    onFrame: (dt) => {
      if (threeCtx && threeCtx.camera && Math.abs(threeCtx.camera.aspect - lastAspect) > 0.08) {
        setCameraPreset(activeCam.value, 0)
      }
      if (isRunning.value) {
        updatePhysics(dt)
      }
      syncScene()
    }
  })

  const { scene } = threeCtx

  // 1. 背景の磁場 B (-z 奥向き) ベクトル格子 & 重力 g (-y 下向き) 矢印
  const fieldGroup = new THREE.Group()
  scene.add(fieldGroup)

  for (let x = -4.2; x <= 4.8; x += 3.0) {
    for (let y = -1.4; y <= 1.2; y += 1.3) {
      const bArr = createVectorArrow3D({
        color: 0x38bdf8,
        shaftRadius: 0.02,
        headRadius: 0.075,
        headLength: 0.22,
        opacity: 0.28
      })
      bArr.setVector(new THREE.Vector3(x, y, 1.3), new THREE.Vector3(0, 0, -1), 2.6)
      fieldGroup.add(bArr)
    }
  }

  const bFieldLabel = createTextSprite('一様磁場 B (-z 奥向き ⊗)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 34,
    scale: 0.64
  })
  bFieldLabel.position.set(2.95, 2.8, -1.65)
  fieldGroup.add(bFieldLabel)

  const gArrow = createVectorArrow3D({
    color: 0xf59e0b,
    shaftRadius: 0.045,
    headRadius: 0.14,
    headLength: 0.3
  })
  gArrow.setVector(new THREE.Vector3(-5.25, 2.35, -0.6), new THREE.Vector3(0, -1, 0), 1.3)
  fieldGroup.add(gArrow)

  const gLabel = createTextSprite('重力場 g (鉛直下向き)', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 34,
    scale: 0.64
  })
  gLabel.position.set(-2.95, 2.8, -1.65)
  fieldGroup.add(gLabel)

  // 原点 O(0,0) ドット & x軸ライン
  const origDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  origDot.position.set(startWorldX, startWorldY, 0)
  scene.add(origDot)

  const origLabel = createTextSprite('O (0, 0)', {
    color: '#e2e8f0',
    borderColor: 'rgba(148,163,184,0.4)',
    fontSize: 32,
    scale: 0.56
  })
  origLabel.position.set(startWorldX - 0.52, startWorldY - 0.36, 0.65)
  scene.add(origLabel)

  const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(startWorldX - 0.4, startWorldY, 0),
    new THREE.Vector3(5.8, startWorldY, 0)
  ])
  const xAxisLine = new THREE.Line(
    xAxisGeo,
    new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.55 })
  )
  scene.add(xAxisLine)

  // 2. 床面 y = -R の3Dスラブ (startWorldY - 1.35 = -0.20)
  const floorWorldY = startWorldY - 1.35
  const floorGroup = new THREE.Group()
  scene.add(floorGroup)

  const floorSlab = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.14, 2.8),
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.25,
      roughness: 0.4,
      metalness: 0.35,
      transparent: true,
      opacity: 0.85
    })
  )
  floorSlab.position.set(0.6, floorWorldY - 0.25, 0)
  floorGroup.add(floorSlab)

  const floorLabel = createTextSprite('水平床面 y = -R', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 34,
    scale: 0.64
  })
  floorLabel.position.set(3.2, floorWorldY - 0.95, 1.55)
  floorGroup.add(floorLabel)

  // 底面グリッド
  const baseGrid = new THREE.GridHelper(14, 14, 0x1e293b, 0x0f172a)
  baseGrid.position.set(0.6, floorWorldY - 1.35, 0)
  scene.add(baseGrid)

  // 3. ドリフト慣性系 S' の円ガイドリング (半径 1.35)
  const driftGroup = new THREE.Group()
  scene.add(driftGroup)

  const ringPts = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2
    ringPts.push(new THREE.Vector3(1.35 * Math.cos(a), 1.35 * Math.sin(a), 0))
  }
  const driftRingGeo = new THREE.BufferGeometry().setFromPoints(ringPts)
  const driftRing = new THREE.Line(
    driftRingGeo,
    new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.82 })
  )
  driftGroup.add(driftRing)

  const driftCenterDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xa855f7 })
  )
  driftGroup.add(driftCenterDot)

  const driftLabel = createTextSprite("慣性系 S' 中心 (V₀t)", {
    color: '#d8b4fe',
    borderColor: '#a855f7',
    fontSize: 32,
    scale: 0.60
  })
  driftLabel.position.set(0, 1.93, -0.55)
  driftGroup.add(driftLabel)

  // 4. 予告ガイドサイクロイド曲線 (破線) + 荷電粒子メッシュ + 軌跡ライン + 速度ベクトル矢印
  const maxGuide = 360
  const guideGeo = new THREE.BufferGeometry()
  guideGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxGuide * 3), 3))
  const guideLine = new THREE.Line(
    guideGeo,
    new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.22,
      gapSize: 0.14,
      transparent: true,
      opacity: 0.42
    })
  )
  scene.add(guideLine)

  const particleMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 28, 28),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.72,
      roughness: 0.15
    })
  )
  scene.add(particleMesh)

  const haloMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 })
  )
  particleMesh.add(haloMesh)

  const maxTrail = 520
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxTrail * 3), 3))
  const trailLine = new THREE.Line(
    trailGeo,
    new THREE.LineBasicMaterial({ color: 0x22d3ee })
  )
  scene.add(trailLine)

  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  scene.add(arrowV)

  const labelV = createTextSprite('v', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    fontSize: 36,
    scale: 0.64
  })
  scene.add(labelV)

  sceneObjects = {
    floorGroup,
    floorLabel,
    driftGroup,
    guideGeo,
    guideLine,
    maxGuide,
    particleMesh,
    trailGeo,
    arrowV,
    labelV
  }

  rebuildCycloidGuide()
  syncScene()
  setCameraPreset(activeCam.value, 0)
}

function rebuildCycloidGuide() {
  if (!sceneObjects) return
  const { guideGeo, guideLine, maxGuide } = sceneObjects
  const arr = guideGeo.getAttribute('position').array
  const B = magneticB.value
  const q_m = (charge * B) / mass
  const sc = worldScale.value
  const floorY = -rRadius.value
  let gx = 0
  let gy = 0
  let gvx = 0
  let gvy = 0
  let count = 0
  const dtStep = 0.015
  const sub = 6
  const sdt = dtStep / sub

  arr[0] = startWorldX
  arr[1] = startWorldY
  arr[2] = -0.02
  count = 1

  for (let i = 1; i < maxGuide; i++) {
    for (let s = 0; s < sub; s++) {
      const ax = -q_m * gvy
      const ay = q_m * gvx - gravity
      gvx += ax * sdt
      gvy += ay * sdt
      gx += gvx * sdt
      gy += gvy * sdt
      if (floorEnabled.value && gy <= floorY && gvy < 0) {
        gy = floorY
        gvy = -eRestitution.value * gvy
      }
    }
    const wx = startWorldX + gx * sc
    const wy = startWorldY + gy * sc
    if (wx > 5.8) break
    arr[count * 3] = wx
    arr[count * 3 + 1] = wy
    arr[count * 3 + 2] = -0.02
    count++
  }

  guideGeo.setDrawRange(0, count)
  guideGeo.getAttribute('position').needsUpdate = true
  guideLine.computeLineDistances()
}

let lastFloorLabelText = ''
let lastLabelVText = ''

function syncScene() {
  if (!sceneObjects) return
  const {
    floorGroup,
    floorLabel,
    driftGroup,
    particleMesh,
    trailGeo,
    arrowV,
    labelV
  } = sceneObjects

  const sc = worldScale.value
  const wx = startWorldX + posX * sc
  const wy = startWorldY + posY * sc

  particleMesh.position.set(wx, wy, 0)

  // 床面表示切替
  floorGroup.visible = floorEnabled.value
  if (floorEnabled.value) {
    const fText = `水平床面 y = -R = -${rRadius.value.toFixed(2)} m`
    if (fText !== lastFloorLabelText) {
      lastFloorLabelText = fText
      floorLabel.updateText(fText, '#fde68a', '#f59e0b')
    }
  }

  // ドリフト慣性系 S' の円ガイド
  driftGroup.visible = showDriftCircle.value
  if (showDriftCircle.value) {
    const dcx = startWorldX + v0.value * simTime * sc
    const dcy = startWorldY - rRadius.value * sc
    driftGroup.position.set(dcx, dcy, -0.05)
  }

  // 軌跡の更新
  const count = trajectory.length
  const arr = trailGeo.getAttribute('position').array
  for (let i = 0; i < count; i++) {
    arr[i * 3] = startWorldX + trajectory[i].x * sc
    arr[i * 3 + 1] = startWorldY + trajectory[i].y * sc
    arr[i * 3 + 2] = 0
  }
  trailGeo.setDrawRange(0, count)
  trailGeo.getAttribute('position').needsUpdate = true

  // 速度ベクトル矢印
  const vMag = Math.hypot(velX, velY)
  if (vMag > 0.08) {
    const vVec = new THREE.Vector3(velX, velY, 0)
    const vLen = Math.min(2.1, Math.max(0.4, (vMag / Math.max(1, v0.value)) * 1.05))
    const pOrigin = new THREE.Vector3(wx, wy, 0)
    arrowV.setVector(pOrigin, vVec, vLen)
    labelV.visible = true
    const vText = `v = ${vMag.toFixed(1)} m/s`
    if (vText !== lastLabelVText) {
      lastLabelVText = vText
      labelV.updateText(vText, '#6ee7b7', '#10b981')
    }
    labelV.position.copy(pOrigin).addScaledVector(vVec.clone().normalize(), vLen + 0.38)
    labelV.position.z += 0.25
  } else {
    arrowV.visible = false
    labelV.visible = false
  }
}

watch(showDriftCircle, () => {
  syncScene()
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
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 24px 0;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.sim-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #f8fafc;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.three-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}
.subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 12px;
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
.cam-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
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
  height: 410px;
  border-radius: 10px;
  overflow: hidden;
  background: #080c16;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.three-viewport {
  width: 100%;
  height: 100%;
}
.sim-overlay-badge {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-bottom: 10px;
}
.badge-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.76rem;
  color: #e2e8f0;
  pointer-events: none;
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 300px;
  }
  .sim-overlay-badge {
    font-size: 0.76rem;
    gap: 6px;
  }
  .three-hud-legend {
    font-size: 0.7rem;
    gap: 8px;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.66rem;
    padding: 3px 8px;
  }
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
.dot-b { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-g { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-s { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
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
.control-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 14px;
  margin-top: 14px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}
.control-group label {
  display: flex;
  flex-direction: column;
  align-items: stretch !important;
  gap: 6px;
  font-size: 0.84rem;
  color: #e2e8f0;
}
.control-group label span {
  width: 100%;
  margin-left: 0 !important;
}
.ctrl-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ctrl-title {
  font-size: 0.84rem;
  color: #e2e8f0;
}
.control-group input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.select-btn {
  padding: 4px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  cursor: pointer;
}
.select-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.btn {
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}
.btn-primary {
  background: #0284c7;
  color: #ffffff;
}
.btn-secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}
.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
}
.stat-card .label {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-bottom: 4px;
}
.stat-card .value {
  font-size: 1.15rem;
  font-weight: bold;
  color: #f8fafc;
}
.stat-card .value.highlight {
  color: #38bdf8;
}
.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}
.stat-card .subtext {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: 2px;
}
</style>
