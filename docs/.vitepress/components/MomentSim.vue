<template>
  <div class="lab" style="--ac:#f59e0b;--ac2:#ef4444">
    <div class="lab-head">
      <span class="lab-title">⚖️ 3D 剛体のつり合いと力のモーメント 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ mode === 'lever' ? 'てこ・シーソーのつり合い' : '壁に立てかけた棒の滑り出し' }}</span>
      </div>
    </div>

    <!-- モード切替タブ -->
    <div style="display:flex;gap:8px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);flex-wrap:wrap">
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'lever' }" @click="switchMode('lever')">
        📐 てこ・シーソー（回転のつり合い）
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'ladder' }" @click="switchMode('ladder')">
        🧱 壁に立てかけた棒（滑り出し限界）
      </button>
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
          📐 正面視点 (モーメント平面)
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

    <!-- アニメーション・実験コントロールバー -->
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:8px 16px;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
        <button class="lab-btn lab-btn-pri" @click="togglePlay" style="padding:6px 16px;font-weight:700">
          {{ isPlaying ? '⏸ 一時停止' : (isFinished ? '🔄 最初から再実験' : '▶ 実験スタート') }}
        </button>
        <button v-if="mode === 'ladder'" class="lab-btn" :class="{ 'lab-btn-pri': climberAutoClimb }" @click="climberAutoClimb = !climberAutoClimb" style="font-size:0.85rem">
          🚶 人が登るモード: {{ climberAutoClimb ? 'ON' : 'OFF' }}
        </button>
        <button class="lab-btn" @click="resetSim" style="font-size:0.85rem">
          🔄 リセット
        </button>
      </div>

      <div style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:#94a3b8;flex-wrap:wrap">
        <span style="white-space:nowrap">⏱️ 速度:</span>
        <button class="lab-chip" :class="{ active: timeScale === 0.5, on: timeScale === 0.5 }" @click="timeScale = 0.5" style="white-space:nowrap">0.5x</button>
        <button class="lab-chip" :class="{ active: timeScale === 1.0, on: timeScale === 1.0 }" @click="timeScale = 1.0" style="white-space:nowrap">1.0x</button>
        <button class="lab-chip" :class="{ active: timeScale === 1.5, on: timeScale === 1.5 }" @click="timeScale = 1.5" style="white-space:nowrap">1.5x</button>
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend" v-if="mode === 'lever'">
        <span class="legend-item"><i class="dot-m1"></i>左の力 <b>m₁g</b> (↺ M₁)</span>
        <span class="legend-item"><i class="dot-m2"></i>右の力 <b>m₂g</b> (↻ M₂)</span>
        <span class="legend-item"><i class="dot-n"></i>支点抗力 <b>N</b></span>
      </div>
      <div class="three-hud-legend" v-else>
        <span class="legend-item"><i class="dot-m2"></i>壁の抗力 <b>N<sub>A</sub></b></span>
        <span class="legend-item"><i class="dot-n"></i>床の抗力 <b>N<sub>B</sub></b></span>
        <span class="legend-item"><i class="dot-m1"></i>静止摩擦力 <b>f</b> / 重力 <b>mg</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- てこモードのコントロール -->
    <div v-if="mode === 'lever'" class="lab-controls">
      <div class="lab-ctrl">
        <label>左のおもり m₁: <strong>{{ m1.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m1" min="1.0" max="10.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>左の腕の長さ d₁: <strong>{{ d1.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="d1" min="0.5" max="4.0" step="0.1" />
      </div>
      <div class="lab-ctrl">
        <label>右のおもり m₂: <strong>{{ m2.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m2" min="1.0" max="10.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>右の腕の長さ d₂: <strong>{{ d2.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="d2" min="0.5" max="4.0" step="0.1" />
      </div>
      <div class="lab-ctrl">
        <label>棒自体の質量 M: <strong>{{ barMass.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="barMass" min="0.0" max="6.0" step="0.5" />
        <div class="lab-note">支点が中央にあれば棒自体のモーメントは相殺されて0</div>
      </div>
      <div class="lab-ctrl">
        <label>ワンクリック・プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" @click="setLever(4, 2, 2, 4)">完全つり合い (4kg×2m = 2kg×4m)</button>
          <button class="lab-chip" @click="setLever(6, 1.5, 3, 3)">等モーメント (9 N·m)</button>
          <button class="lab-chip" @click="setLever(8, 2, 2, 2)">左が重い (傾く)</button>
        </div>
      </div>
    </div>

    <!-- はしごモードのコントロール -->
    <div v-else class="lab-controls">
      <div class="lab-ctrl">
        <label>棒と床のなす角 θ: <strong>{{ thetaDeg.toFixed(0) }}°</strong></label>
        <input type="range" v-model.number="thetaDeg" min="30" max="80" step="1" />
        <div class="lab-note">角度が小さくなる（寝かせる）ほど滑りやすくなる</div>
      </div>
      <div class="lab-ctrl">
        <label>床の最大静止摩擦係数 μ: <strong>{{ muS.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muS" min="0.15" max="0.70" step="0.05" />
      </div>
      <div class="lab-ctrl">
        <label>棒の質量 M: <strong>{{ ladderM.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="ladderM" min="5.0" max="20.0" step="1.0" />
      </div>
      <div class="lab-ctrl">
        <label>棒を登る人の位置 (足元からの比率): <strong>{{ (climberPos * 100).toFixed(0) }}%</strong></label>
        <input type="range" v-model.number="climberPos" min="0.0" max="1.0" step="0.05" />
        <div class="lab-note">上に登るほど壁を押す力が増え、床の摩擦限界に近づく</div>
      </div>
      <div class="lab-ctrl">
        <label>人の質量 m: <strong>{{ climberM.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="climberM" min="0.0" max="70.0" step="5.0" />
      </div>
    </div>

    <!-- ステータス表示 -->
    <div v-if="mode === 'lever'" class="lab-stats">
      <div class="lab-stat" :class="{ hl: isLeverBalanced }">
        <div class="k">つり合い状態</div>
        <div class="v" :style="{ color: isLeverBalanced ? '#10b981' : '#ef4444' }">
          {{ isLeverBalanced ? '完全につり合い！' : (tauNet > 0 ? '反時計回りに傾く' : '時計回りに傾く') }}
        </div>
        <div class="f">合力ΣF = 0 かつ 合モーメントΣM = 0</div>
      </div>
      <div class="lab-stat">
        <div class="k">反時計回りモーメント M₁</div>
        <div class="v" style="color:#f59e0b">{{ tauLeft.toFixed(1) }} <small>N·m</small></div>
        <div class="f">m₁g · d₁ = ({{ m1.toFixed(1) }}×9.8) × {{ d1.toFixed(1) }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">時計回りモーメント M₂</div>
        <div class="v" style="color:#38bdf8">{{ tauRight.toFixed(1) }} <small>N·m</small></div>
        <div class="f">m₂g · d₂ = ({{ m2.toFixed(1) }}×9.8) × {{ d2.toFixed(1) }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">支点が受ける垂直抗力 N</div>
        <div class="v" style="color:#a855f7">{{ totalUpForce.toFixed(1) }} <small>N</small></div>
        <div class="f">N = (m₁ + m₂ + M)g（上向き）</div>
      </div>
    </div>

    <div v-else class="lab-stats">
      <div class="lab-stat" :class="{ hl: isLadderSafe }">
        <div class="k">安全判定</div>
        <div class="v" :style="{ color: isLadderSafe ? '#10b981' : '#ef4444' }">
          {{ isLadderSafe ? '静止（すべらない）' : '⚠️ スリップ転倒！' }}
        </div>
        <div class="f">必要摩擦力 f ≦ 最大静止摩擦力 μN_B</div>
      </div>
      <div class="lab-stat">
        <div class="k">床の必要静止摩擦力 f</div>
        <div class="v" style="color:#f59e0b">{{ reqFriction.toFixed(1) }} <small>N</small></div>
        <div class="f">壁の抗力 N_A とつり合う</div>
      </div>
      <div class="lab-stat">
        <div class="k">床の最大静止摩擦力 μN_B</div>
        <div class="v" style="color:#10b981">{{ maxFriction.toFixed(1) }} <small>N</small></div>
        <div class="f">μ × (M + m)g = {{ muS.toFixed(2) }} × {{ (ladderM + climberM).toFixed(1) }}×9.8</div>
      </div>
      <div class="lab-stat">
        <div class="k">すべり出し限界角 θ_min</div>
        <div class="v" style="color:#38bdf8">{{ criticalTheta.toFixed(1) }} <small>°</small></div>
        <div class="f">これより角度が寝ると滑り落ちる</div>
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

const g = 9.8
const mode = ref('lever')
const activeCam = ref('3d')

// アニメーション制御
const isPlaying = ref(false)
const isFinished = ref(false)
const timeScale = ref(1.0)
const climberAutoClimb = ref(false)

// てこモードのパラメータ
const m1 = ref(4.0)
const d1 = ref(2.0)
const m2 = ref(2.0)
const d2 = ref(4.0)
const barMass = ref(1.0)
const angle = ref(0) // 現在の傾き角（rad: +で反時計回り、-で時計回り）
const angleVel = ref(0)

const tauLeft = computed(() => m1.value * g * d1.value)
const tauRight = computed(() => m2.value * g * d2.value)
const tauNet = computed(() => tauLeft.value - tauRight.value)
const isLeverBalanced = computed(() => Math.abs(tauNet.value) < 0.2)
const totalUpForce = computed(() => (m1.value + m2.value + barMass.value) * g)

function setLever(w1, len1, w2, len2) {
  m1.value = w1
  d1.value = len1
  m2.value = w2
  d2.value = len2
  angle.value = 0
  angleVel.value = 0
}

// はしごモードのパラメータ
const thetaDeg = ref(60)
const muS = ref(0.4)
const ladderM = ref(10.0)
const climberPos = ref(0.6)
const climberM = ref(50.0)

const dynamicTheta = ref((60 * Math.PI) / 180)
const dynamicOmega = ref(0)
const dynamicClimberPos = ref(0.6)
const isSlidingLadder = ref(false)

const ladderThetaRad = computed(() => (thetaDeg.value * Math.PI) / 180)
const normalFloorNB = computed(() => (ladderM.value + climberM.value) * g)
const reqFriction = computed(() => {
  const tan = Math.tan(ladderThetaRad.value)
  if (tan <= 0.01) return 9999
  const numerator = (ladderM.value * 0.5 + climberM.value * climberPos.value) * g
  return numerator / tan
})
const maxFriction = computed(() => muS.value * normalFloorNB.value)
const isLadderSafe = computed(() => reqFriction.value <= maxFriction.value)

const criticalTheta = computed(() => {
  const tanMin = (ladderM.value * 0.5 + climberM.value * climberPos.value) / (muS.value * (ladderM.value + climberM.value))
  return (Math.atan(tanMin) * 180) / Math.PI
})

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.2, 1.72 / Math.max(0.65, aspect)) : 1.0
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (mode.value === 'lever') {
    if (preset === '3d') {
      threeCtx.moveCameraTo([0, 3.8 * s, 11.4 * s], [0, 0.25, 0], duration, 42)
    } else if (preset === 'front') {
      threeCtx.moveCameraTo([0, 0.25, 38.0 * s], [0, 0.25, 0], duration, 14)
    } else if (preset === 'top') {
      threeCtx.moveCameraTo([0, 38.0 * s, 0.01], [0, 0, 0], duration, 14)
    }
  } else {
    if (preset === '3d') {
      threeCtx.moveCameraTo([1.8 * s, 3.8 * s, 10.8 * s], [0, 1.4, 0], duration, 42)
    } else if (preset === 'front') {
      threeCtx.moveCameraTo([0, 1.6, 38.0 * s], [0, 1.6, 0], duration, 14)
    } else if (preset === 'top') {
      threeCtx.moveCameraTo([0, 38.0 * s, 0.01], [0, 0, 0], duration, 14)
    }
  }
}

function switchMode(newMode) {
  mode.value = newMode
  resetSim()
  setCameraPreset('3d')
}

function togglePlay() {
  if (isFinished.value) {
    resetSim()
    isPlaying.value = true
    return
  }
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    if (mode.value === 'lever') {
      if (Math.abs(angleVel.value) < 0.05) {
        angleVel.value = isLeverBalanced.value ? -0.45 : (tauNet.value > 0 ? 0.5 : -0.5)
      }
    } else if (mode.value === 'ladder') {
      if (isLadderSafe.value && !climberAutoClimb.value) {
        climberAutoClimb.value = true
      }
    }
  }
}

function resetSim() {
  isPlaying.value = false
  isFinished.value = false
  isSlidingLadder.value = false
  dynamicTheta.value = (thetaDeg.value * Math.PI) / 180
  dynamicOmega.value = 0
  dynamicClimberPos.value = climberPos.value
  angle.value = 0
  angleVel.value = 0
}

watch([thetaDeg, climberPos, muS, ladderM, climberM], () => {
  if (!isPlaying.value) {
    dynamicTheta.value = (thetaDeg.value * Math.PI) / 180
    dynamicClimberPos.value = climberPos.value
    isSlidingLadder.value = false
    isFinished.value = false
  }
})

function initThree() {
  if (!threeContainer.value) return
  let lastCamAspect = 0

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    background: 0x080c16,
    initialCamPos: [0, 3.8, 10.6],
    initialTarget: [0, 0.2, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.18) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
      }
      updateFrame(dt)
    }
  })

  const { scene } = threeCtx

  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, -1.2, 0)
  scene.add(grid)

  // ======================================================
  // グループ A: てこ・シーソーモード (leverGroup)
  // ======================================================
  const leverGroup = new THREE.Group()
  scene.add(leverGroup)

  // 支点の3D三角柱台座 (頂点が y = 0)
  const fulcrumShape = new THREE.Shape()
  fulcrumShape.moveTo(0, 0)
  fulcrumShape.lineTo(-0.65, -1.2)
  fulcrumShape.lineTo(0.65, -1.2)
  fulcrumShape.closePath()
  const fulcrumGeo = new THREE.ExtrudeGeometry(fulcrumShape, {
    depth: 1.2,
    bevelEnabled: false
  })
  fulcrumGeo.translate(0, 0, -0.6)
  const fulcrumMesh = new THREE.Mesh(
    fulcrumGeo,
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x1e293b,
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.35
    })
  )
  leverGroup.add(fulcrumMesh)
  fulcrumMesh.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(fulcrumGeo),
    new THREE.LineBasicMaterial({ color: 0x94a3b8 })
  ))

  const pinMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.38, 20),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 })
  )
  pinMesh.rotation.x = Math.PI / 2
  leverGroup.add(pinMesh)

  const fulcrumLabel = createTextSprite('支点 O', {
    color: '#e2e8f0',
    borderColor: 'rgba(148,163,184,0.6)',
    fontSize: 30,
    scale: 0.44
  })
  fulcrumLabel.position.set(0, -1.42, 0.95)
  leverGroup.add(fulcrumLabel)

  // 3D トルク回転リング（反時計回り M1: アンバー / 時計回り M2: シアン）
  const createTorqueArc = (colorHex, isCCW) => {
    const grp = new THREE.Group()
    grp.position.set(0, 0, 0.72)
    const rArc = 0.95
    const startAngle = isCCW ? Math.PI * 0.72 : Math.PI * 0.28
    const sweep = Math.PI * 0.56
    const pts = []
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      const a = isCCW ? startAngle + sweep * t : startAngle - sweep * t
      pts.push(new THREE.Vector3(Math.cos(a) * rArc, Math.sin(a) * rArc, 0))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const arcMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 })
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.036, 10, false), arcMat))

    const endPt = pts[pts.length - 1]
    const prevPt = pts[pts.length - 2]
    const tangent = endPt.clone().sub(prevPt).normalize()
    const tipCone = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 14), arcMat)
    tipCone.position.copy(endPt)
    tipCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
    grp.add(tipCone)
    return { grp, arcMat }
  }
  const torqueLeftRing = createTorqueArc(0xf59e0b, true)
  const torqueRightRing = createTorqueArc(0x38bdf8, false)
  leverGroup.add(torqueLeftRing.grp, torqueRightRing.grp)

  // シーソー棒のピボット
  const beamPivot = new THREE.Group()
  leverGroup.add(beamPivot)

  const mScale = 1.05 // 1m = 1.05 ワールド単位
  const beamLen = 8.6 * mScale
  const beamGeo = new THREE.BoxGeometry(beamLen, 0.26, 0.9)
  const beamMesh = new THREE.Mesh(
    beamGeo,
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x1e293b,
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.3
    })
  )
  beamPivot.add(beamMesh)
  beamMesh.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(beamGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
  ))

  // 目盛り (-4m .. +4m)
  for (let m = -4; m <= 4; m++) {
    if (m === 0) continue
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.26, 0.92),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    )
    tick.position.set(m * mScale, 0, 0)
    beamPivot.add(tick)
  }

  // 左のおもり m1 & 右のおもり m2
  const weight1Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.25, roughness: 0.3 })
  )
  const weight2Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.25, roughness: 0.3 })
  )
  beamPivot.add(weight1Mesh, weight2Mesh)

  // 3D ベクトル矢印 (leverGroup直下、ワールド鉛直方向)
  const arrowM1 = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowM2 = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowFulcrumN = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.38 })
  leverGroup.add(arrowM1, arrowM2, arrowFulcrumN)

  const labelM1 = createTextSprite('m₁g', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.5 })
  const labelM2 = createTextSprite('m₂g', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.5 })
  const labelFulcrumN = createTextSprite('N', { color: '#d8b4fe', borderColor: '#a855f7', fontSize: 32, scale: 0.5 })
  const labelArm1 = createTextSprite('d₁ = 2.0m (↺ M₁)', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 28, scale: 0.42 })
  const labelArm2 = createTextSprite('d₂ = 4.0m (↻ M₂)', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 28, scale: 0.42 })
  leverGroup.add(labelM1, labelM2, labelFulcrumN, labelArm1, labelArm2)

  // ======================================================
  // グループ B: 壁に立てかけた棒モード (ladderGroup)
  // ======================================================
  const ladderGroup = new THREE.Group()
  scene.add(ladderGroup)

  const wallX = -2.6
  const floorY = -1.15
  const ladderLen = 4.8

  // なめらかな壁 (左側 x = wallX)
  const wallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 5.2, 2.6),
    new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15
    })
  )
  wallMesh.position.set(wallX - 0.12, floorY + 2.6, 0)
  ladderGroup.add(wallMesh)

  const wallLbl = createTextSprite('なめらかな壁 (摩擦なし)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 30,
    scale: 0.44
  })
  wallLbl.position.set(wallX - 0.95, floorY + 1.45, 0)
  ladderGroup.add(wallLbl)

  // あらい床 (y = floorY)
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 })
  )
  floorMesh.position.set(wallX + 3.9, floorY - 0.1, 0)
  ladderGroup.add(floorMesh)

  const floorLbl = createTextSprite('あらい床 (静止摩擦係数 μ)', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 30,
    scale: 0.46
  })
  floorLbl.position.set(wallX + 4.4, floorY - 0.5, 0.8)
  ladderGroup.add(floorLbl)

  // 3D はしごモデル（左右2本のサイドレール＋7段のステップ）
  const ladderObj = new THREE.Group()
  ladderGroup.add(ladderObj)

  const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.3 })
  const sideRailGeo = new THREE.CylinderGeometry(0.06, 0.06, ladderLen, 16)
  sideRailGeo.translate(0, ladderLen / 2, 0)
  const railFront = new THREE.Mesh(sideRailGeo, railMat)
  railFront.position.z = 0.42
  const railBack = new THREE.Mesh(sideRailGeo, railMat)
  railBack.position.z = -0.42
  ladderObj.add(railFront, railBack)

  for (let i = 1; i <= 7; i++) {
    const rung = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.84, 14),
      railMat
    )
    rung.rotation.x = Math.PI / 2
    rung.position.set(0, (i / 8) * ladderLen, 0)
    ladderObj.add(rung)
  }

  // 登る人を表す 3D 球体マーカー
  const climberMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.4 })
  )
  ladderGroup.add(climberMesh)

  // はしごの5つの力ベクトル (Mg, mg, N_A, N_B, f)
  const arrowLadMg = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.045, headRadius: 0.14, headLength: 0.32 })
  const arrowClimbMg = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowNA = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowNB = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  const arrowFric = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.36 })
  ladderGroup.add(arrowLadMg, arrowClimbMg, arrowNA, arrowNB, arrowFric)

  const lblLadMg = createTextSprite('Mg', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 30, scale: 0.44 })
  const lblClimbMg = createTextSprite('mg', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.48 })
  const lblNA = createTextSprite('N_A', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 32, scale: 0.48 })
  const lblNB = createTextSprite('N_B', { color: '#d8b4fe', borderColor: '#a855f7', fontSize: 32, scale: 0.48 })
  const lblFric = createTextSprite('f', { color: '#fde68a', borderColor: '#f59e0b', fontSize: 32, scale: 0.48 })
  ladderGroup.add(lblLadMg, lblClimbMg, lblNA, lblNB, lblFric)

  sceneObjects = {
    leverGroup,
    beamPivot,
    weight1Mesh,
    weight2Mesh,
    arrowM1,
    arrowM2,
    arrowFulcrumN,
    labelM1,
    labelM2,
    labelFulcrumN,
    labelArm1,
    labelArm2,
    torqueLeftRing,
    torqueRightRing,
    mScale,
    ladderGroup,
    ladderObj,
    railMat,
    climberMesh,
    wallX,
    floorY,
    ladderLen,
    arrowLadMg,
    arrowClimbMg,
    arrowNA,
    arrowNB,
    arrowFric,
    lblLadMg,
    lblClimbMg,
    lblNA,
    lblNB,
    lblFric
  }

  updateFrame(0)
  lastCamAspect = threeCtx.camera.aspect || 1.7
  setCameraPreset(activeCam.value, 0)
}

function updateFrame(dt) {
  if (!sceneObjects) return
  const {
    leverGroup,
    beamPivot,
    weight1Mesh,
    weight2Mesh,
    arrowM1,
    arrowM2,
    arrowFulcrumN,
    labelM1,
    labelM2,
    labelFulcrumN,
    labelArm1,
    labelArm2,
    torqueLeftRing,
    torqueRightRing,
    mScale,
    ladderGroup,
    ladderObj,
    railMat,
    climberMesh,
    wallX,
    floorY,
    ladderLen,
    arrowLadMg,
    arrowClimbMg,
    arrowNA,
    arrowNB,
    arrowFric,
    lblLadMg,
    lblClimbMg,
    lblNA,
    lblNB,
    lblFric
  } = sceneObjects

  const scaledDt = Math.min(dt, 0.05) * timeScale.value

  if (mode.value === 'lever') {
    leverGroup.visible = true
    ladderGroup.visible = false

    const maxTilt = 0.22
    let targetAngle = 0
    if (Math.abs(tauNet.value) > 0.5) {
      targetAngle = tauNet.value > 0 ? maxTilt : -maxTilt
    }

    const speed = isPlaying.value ? 1.0 : 0.6
    const kA = 15.0 * speed
    const cA = 6.0 * speed
    const acc = kA * (targetAngle - angle.value) - cA * angleVel.value
    angleVel.value += acc * scaledDt
    angle.value += angleVel.value * scaledDt

    beamPivot.rotation.z = angle.value

    const s1 = 0.42 + m1.value * 0.045
    const s2 = 0.42 + m2.value * 0.045
    weight1Mesh.scale.set(s1 / 0.7, s1 / 0.7, s1 / 0.7)
    weight2Mesh.scale.set(s2 / 0.7, s2 / 0.7, s2 / 0.7)

    const x1Local = -d1.value * mScale
    const x2Local = d2.value * mScale
    const y1Local = 0.12 + s1 / 2
    const y2Local = 0.12 + s2 / 2

    weight1Mesh.position.set(x1Local, y1Local, 0)
    weight2Mesh.position.set(x2Local, y2Local, 0)

    const cosA = Math.cos(angle.value)
    const sinA = Math.sin(angle.value)

    const wPos1 = new THREE.Vector3(
      x1Local * cosA - y1Local * sinA,
      x1Local * sinA + y1Local * cosA,
      0
    )
    const wPos2 = new THREE.Vector3(
      x2Local * cosA - y2Local * sinA,
      x2Local * sinA + y2Local * cosA,
      0
    )

    const len1 = Math.min(2.2, 0.65 + m1.value * 0.14)
    const len2 = Math.min(2.2, 0.65 + m2.value * 0.14)

    arrowM1.setVector(wPos1, new THREE.Vector3(0, -1, 0), len1)
    labelM1.updateText(`m₁g = ${(m1.value * g).toFixed(0)} N`, '#fde68a', '#f59e0b')
    labelM1.position.set(Math.min(-1.05, wPos1.x - 0.35), wPos1.y - len1 - 0.32, 0.45)

    arrowM2.setVector(wPos2, new THREE.Vector3(0, -1, 0), len2)
    labelM2.updateText(`m₂g = ${(m2.value * g).toFixed(0)} N`, '#7dd3fc', '#38bdf8')
    labelM2.position.set(Math.max(1.05, wPos2.x + 0.35), wPos2.y - len2 - 0.32, 0.45)

    const nLen = Math.min(2.4, 0.85 + (m1.value + m2.value + barMass.value) * 0.07)
    arrowFulcrumN.setVector(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), nLen)
    labelFulcrumN.updateText(`N = ${totalUpForce.value.toFixed(0)} N`, '#d8b4fe', '#a855f7')
    labelFulcrumN.position.set(0, nLen + 0.42, 0)

    const sLeft = Math.min(1.18, Math.max(0.75, tauLeft.value / 85))
    const sRight = Math.min(1.18, Math.max(0.75, tauRight.value / 85))
    torqueLeftRing.grp.scale.setScalar(sLeft)
    torqueLeftRing.arcMat.opacity = tauLeft.value >= tauRight.value ? 0.95 : 0.48
    torqueRightRing.grp.scale.setScalar(sRight)
    torqueRightRing.arcMat.opacity = tauRight.value >= tauLeft.value ? 0.95 : 0.48

    labelArm1.updateText(`d₁=${d1.value.toFixed(1)}m (↺ M₁=${tauLeft.value.toFixed(0)})`, '#fde68a', '#f59e0b')
    labelArm1.position.set(Math.min(-2.45, x1Local * 0.9), 1.25, -0.55)

    labelArm2.updateText(`d₂=${d2.value.toFixed(1)}m (↻ M₂=${tauRight.value.toFixed(0)})`, '#7dd3fc', '#38bdf8')
    labelArm2.position.set(Math.max(2.45, x2Local * 0.9), 1.25, -0.55)
  } else {
    leverGroup.visible = false
    ladderGroup.visible = true

    if (isPlaying.value && scaledDt > 0) {
      if (climberAutoClimb.value && !isSlidingLadder.value && !isFinished.value) {
        dynamicClimberPos.value += scaledDt * 0.12
        if (dynamicClimberPos.value >= 1.0) {
          dynamicClimberPos.value = 1.0
        }
        climberPos.value = Number(dynamicClimberPos.value.toFixed(2))
      }

      const curRad = dynamicTheta.value
      const curTan = Math.tan(curRad)
      const curNumerator = (ladderM.value * 0.5 + climberM.value * dynamicClimberPos.value) * g
      const curReqF = curTan > 0.02 ? curNumerator / curTan : 9999
      const curMaxF = muS.value * (ladderM.value + climberM.value) * g

      if (curReqF > curMaxF && !isSlidingLadder.value && curRad > 0.04) {
        isSlidingLadder.value = true
      }

      if (isSlidingLadder.value) {
        const muK = muS.value * 0.75
        const alpha = -(6.0 + 12.0 * Math.cos(curRad)) * Math.max(0.3, 1.0 - muK * 0.6)
        dynamicOmega.value += alpha * scaledDt
        dynamicTheta.value += dynamicOmega.value * scaledDt

        if (dynamicTheta.value <= 0.03) {
          dynamicTheta.value = 0.02
          dynamicOmega.value = 0
          isSlidingLadder.value = false
          isPlaying.value = false
          isFinished.value = true
        }
      }
    }

    const rad = Math.max(0.02, dynamicTheta.value)
    const isSafeNow = !isSlidingLadder.value && !isFinished.value && isLadderSafe.value
    railMat.color.setHex(isSafeNow ? 0xe2e8f0 : 0xf43f5e)

    // はしごの下端 (botX, floorY) と上端 (wallX, topY)
    const botX = wallX + ladderLen * Math.cos(rad)
    const botY = floorY
    const topX = wallX
    const topY = floorY + ladderLen * Math.sin(rad)

    // ladderObj は (0,0,0) から +y 方向に長さ ladderLen で作られているので、
    // 下端 (botX, botY, 0) に置き、Z軸回りに (Math.PI/2 - rad) 回転させると上端が (wallX, topY, 0) に一致！
    ladderObj.position.set(botX, botY, 0)
    ladderObj.rotation.z = Math.PI / 2 - rad

    // はしごの重心 (中点)
    const midPos = new THREE.Vector3((botX + topX) / 2, (botY + topY) / 2, 0)
    arrowLadMg.setVector(midPos, new THREE.Vector3(0, -1, 0), 1.15)
    lblLadMg.updateText(`Mg = ${(ladderM.value * g).toFixed(0)} N`, '#6ee7b7', '#10b981')
    lblLadMg.position.set(midPos.x - 0.85, midPos.y - 1.45, 0.45)

    // 登る人の位置
    if (climberM.value > 0 && rad > 0.05) {
      climberMesh.visible = true
      const pRatio = dynamicClimberPos.value
      const cPos = new THREE.Vector3(
        botX + (topX - botX) * pRatio,
        botY + (topY - botY) * pRatio,
        0
      )
      climberMesh.position.copy(cPos)
      const cLen = Math.min(1.8, 0.7 + climberM.value * 0.015)
      arrowClimbMg.setVector(cPos, new THREE.Vector3(0, -1, 0), cLen)
      lblClimbMg.visible = true
      lblClimbMg.updateText(`mg = ${(climberM.value * g).toFixed(0)} N`, '#fde68a', '#f59e0b')
      lblClimbMg.position.set(cPos.x + 0.85, cPos.y - cLen - 0.35, -0.45)
    } else {
      climberMesh.visible = false
      arrowClimbMg.visible = false
      lblClimbMg.visible = false
    }

    if (rad > 0.05) {
      // 壁の垂直抗力 N_A (右向き)
      const naLen = Math.min(1.9, Math.max(0.55, reqFriction.value * 0.0055))
      const topPos = new THREE.Vector3(topX, topY, 0)
      arrowNA.setVector(topPos, new THREE.Vector3(1, 0, 0), naLen)
      lblNA.visible = true
      lblNA.updateText(`N_A = ${reqFriction.value.toFixed(0)} N`, '#7dd3fc', '#38bdf8')
      lblNA.position.set(topX + naLen + 0.55, topY + 0.25, 0)

      // 床の垂直抗力 N_B (上向き)
      const nbLen = Math.min(2.0, Math.max(0.75, normalFloorNB.value * 0.0028))
      const botPos = new THREE.Vector3(botX, botY, 0)
      arrowNB.setVector(botPos, new THREE.Vector3(0, 1, 0), nbLen)
      lblNB.visible = true
      lblNB.updateText(`N_B = ${normalFloorNB.value.toFixed(0)} N`, '#d8b4fe', '#a855f7')
      lblNB.position.set(botX + 0.65, botY + nbLen + 0.25, 0)

      // 床の静止摩擦力 f (左向き)
      const fLen = Math.min(1.9, Math.max(0.55, reqFriction.value * 0.0055))
      arrowFric.setVector(botPos, new THREE.Vector3(-1, 0, 0), fLen)
      lblFric.visible = true
      lblFric.updateText(`f = ${reqFriction.value.toFixed(0)} N`, isSafeNow ? '#fde68a' : '#fda4af', isSafeNow ? '#f59e0b' : '#ef4444')
      lblFric.position.set(botX - fLen - 0.45, botY - 0.38, 0.4)
    } else {
      arrowNA.visible = false
      arrowNB.visible = false
      arrowFric.visible = false
      lblNA.visible = false
      lblNB.visible = false
      lblFric.visible = false
    }
  }
}

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
  padding: 8px 16px;
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
  height: 410px;
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
.dot-m1 { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-m2 { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-n { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
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
.three-hud-legend {
  max-width: calc(100% - 24px);
}
@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 325px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.7rem;
  }
}
</style>
