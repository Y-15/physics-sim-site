<template>
  <div class="lab" style="--ac:#ec4899;--ac2:#38bdf8">
    <div class="lab-head">
      <span class="lab-title">🌀 3D 磁場中の荷電粒子の運動（ローレンツ力）実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ particleName }} (q = {{ chargeQ > 0 ? '+' : '' }}{{ chargeQ }}e)</span>
      </div>
    </div>

    <!-- モード切替タブ -->
    <div class="lorentz-mode-bar">
      <button
        class="lab-btn"
        :class="{ primary: simMode === 'circle' }"
        @click="switchMode('circle')"
      >
        🌀 3D らせん・等速円運動（一様磁場 B）
      </button>
      <button
        class="lab-btn"
        :class="{ primary: simMode === 'selector' }"
        @click="switchMode('selector')"
      >
        ⚡ 3D 速度セレクター（直交電磁場 E ⊥ B）
      </button>
    </div>

    <!-- 3D カメラ視点プリセット & 表示切替バー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 3Dカメラ視点:</span>
      <div class="preset-group">
        <button
          class="lab-chip"
          :class="{ on: activeCamPreset === '3d' }"
          @click="setCameraPreset('3d')"
        >
          🧊 3D 俯瞰視点
        </button>
        <button
          v-if="simMode === 'circle'"
          class="lab-chip"
          :class="{ on: activeCamPreset === 'front' }"
          @click="setCameraPreset('front')"
        >
          ⭕ 磁場正面（円運動投影）
        </button>
        <button
          v-if="simMode === 'circle'"
          class="lab-chip"
          :class="{ on: activeCamPreset === 'side' }"
          @click="setCameraPreset('side')"
        >
          〰️ 側面（正弦波・ピッチ投影）
        </button>
        <button
          v-if="simMode === 'selector'"
          class="lab-chip"
          :class="{ on: activeCamPreset === 'side' }"
          @click="setCameraPreset('side')"
        >
          📐 真横視点（力のつり合い確認）
        </button>
      </div>

      <div class="preset-toggles">
        <button
          v-if="simMode === 'circle'"
          class="lab-chip"
          :class="{ on: showProjections }"
          @click="showProjections = !showProjections"
        >
          {{ showProjections ? '📐 2平面への影投影: ON' : '📐 2平面への影投影: OFF' }}
        </button>
        <button
          class="lab-chip"
          :class="{ on: showVectors }"
          @click="showVectors = !showVectors"
        >
          {{ showVectors ? '🏹 3Dベクトル: ON' : '🏹 3Dベクトル: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar" style="margin-top: 0.6rem;">
      <button
        class="lab-btn primary"
        @click="isPlaying = !isPlaying"
        style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;"
      >
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button
        class="lab-btn"
        @click="stepSim(0.04)"
        style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;"
      >
        ⏭ コマ送り
      </button>
      <button
        class="lab-btn"
        @click="emitParticle"
        style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;"
      >
        🚀 先頭から再発射
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <!-- 3D 凡例オーバーレイ -->
      <div class="three-hud-legend">
        <span class="legend-item"><i class="dot-v"></i>速度 <b>v</b></span>
        <span class="legend-item"><i class="dot-b"></i>磁場 <b>B</b></span>
        <span class="legend-item"><i class="dot-f"></i>{{ simMode === 'circle' ? 'ローレンツ力 F' : '磁気力 F_B' }}</span>
        <span v-if="simMode === 'selector'" class="legend-item"><i class="dot-e"></i>静電気力 <b>F_E</b></span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- パラメータ操作パネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>
          磁束密度 <i>B</i>: <strong>{{ bFieldT.toFixed(2) }} T</strong>
          ({{ bFieldT >= 0 ? '＋x 向き' : '－x 向き' }})
        </label>
        <input type="range" v-model.number="bFieldT" min="-1.5" max="1.5" step="0.1" />
        <div class="lab-note">|<i>B</i>| が強いほどローレンツ力が増大し、回転半径 <i>r</i> が縮小</div>
      </div>

      <div class="lab-ctrl">
        <label>粒子の初速度 <i>v</i>: <strong>{{ speedV_kms.toFixed(0) }} km/s</strong></label>
        <input type="range" v-model.number="speedV_kms" min="30" max="240" step="10" />
        <div class="lab-note">速いほど半径 <i>r</i> は比例して拡大（周期 <i>T</i> は不変！）</div>
      </div>

      <div v-if="simMode === 'circle'" class="lab-ctrl">
        <label>
          磁場への入射角 <i>θ</i>: <strong>{{ pitchAngleDeg }}°</strong>
          ({{ pitchAngleDeg === 90 ? '垂直入射 → 円運動' : '斜め入射 → 3Dらせん運動' }})
        </label>
        <input type="range" v-model.number="pitchAngleDeg" min="20" max="90" step="5" />
        <div class="lab-row">
          <button
            class="lab-chip"
            :class="{ on: pitchAngleDeg === 90 }"
            @click="pitchAngleDeg = 90"
          >
            ⭕ θ = 90° (純粋な円運動)
          </button>
          <button
            class="lab-chip"
            :class="{ on: pitchAngleDeg === 60 }"
            @click="pitchAngleDeg = 60"
          >
            🌀 θ = 60° (3Dらせん運動)
          </button>
        </div>
      </div>

      <div v-if="simMode === 'selector'" class="lab-ctrl">
        <label>電場 <i>E</i>: <strong>{{ eField_kVm.toFixed(0) }} kV/m</strong> (下向き)</label>
        <input type="range" v-model.number="eField_kVm" min="0" max="180" step="10" />
        <div class="lab-row">
          <button class="lab-chip on" @click="matchStraightSpeed">
            ⚡ 直進条件 v = E/B ({{ straightSpeed.toFixed(0) }} km/s) に合わせる
          </button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>荷電粒子プリセット</label>
        <div class="lab-row">
          <button
            class="lab-chip"
            :class="{ on: particleType === 'electron' }"
            @click="setParticle('electron')"
          >
            電子 (e⁻: 負電荷)
          </button>
          <button
            class="lab-chip"
            :class="{ on: particleType === 'proton' }"
            @click="setParticle('proton')"
          >
            陽子 (p⁺: 正電荷)
          </button>
          <button
            class="lab-chip"
            :class="{ on: particleType === 'alpha' }"
            @click="setParticle('alpha')"
          >
            α粒子 (He²⁺)
          </button>
        </div>
      </div>
    </div>

    <!-- 4列統計モニター -->
    <div class="lab-stats lorentz-stats-grid">
      <div class="lab-stat hl">
        <div class="k">円運動の軌道半径 <i>r</i></div>
        <div class="v" style="color:#ec4899">{{ orbitRadius_mm.toFixed(2) }} <small>mm</small></div>
        <div class="f"><i>r</i> = <i>mv</i> sin<i>θ</i> / |<i>q</i>|<i>B</i></div>
      </div>

      <div class="lab-stat">
        <div class="k">回転周期 <i>T</i></div>
        <div class="v" style="color:#38bdf8">{{ orbitPeriod_ns.toFixed(2) }} <small>ns</small></div>
        <div class="f"><i>T</i> = 2π<i>m</i> / |<i>q</i>|<i>B</i>（<i>v</i>, <i>θ</i> に無関係）</div>
      </div>

      <div class="lab-stat">
        <div class="k">ローレンツ力 <i>F</i><sub>L</sub></div>
        <div class="v" style="color:#f59e0b">{{ lorentzForce_fN.toFixed(2) }} <small>fN</small></div>
        <div class="f"><i>F</i> = |<i>q</i>|<i>vB</i> sin<i>θ</i>（常に速度と直交）</div>
      </div>

      <div class="lab-stat" v-if="simMode === 'circle'">
        <div class="k">らせんピッチ <i>p</i>（1周期の進行距離）</div>
        <div class="v" style="color:#a78bfa">{{ helixPitch_mm.toFixed(2) }} <small>mm</small></div>
        <div class="f">
          {{ pitchAngleDeg === 90 ? 'θ = 90° のため同一平面内で円運動' : 'p = (v cosθ)・T' }}
        </div>
      </div>

      <div class="lab-stat" v-if="simMode === 'selector'">
        <div class="k">速度セレクター判定</div>
        <div class="v" :style="{ color: isStraight ? '#10b981' : '#f43f5e', fontSize: '1.02rem' }">
          {{ isStraight ? '直進通過！ (qE = qvB)' : (selectorNetUp > 0 ? '上向きへ偏向' : '下向きへ偏向') }}
        </div>
        <div class="f">直進速度 <i>v</i> = <i>E</i> / |<i>B</i>| = {{ straightSpeed.toFixed(0) }} km/s</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

// 物理定数
const eCharge = 1.60217663e-19 // C
const mElectron = 9.1093837e-31 // kg
const mProton = 1.6726219e-27 // kg

const simMode = ref('circle') // 'circle' | 'selector'
const bFieldT = ref(0.6) // T
const speedV_kms = ref(110) // km/s
const pitchAngleDeg = ref(60) // デフォルト60°で3Dらせん運動を即座に体感可能
const eField_kVm = ref(66) // kV/m (0.6 T * 110 km/s = 66 kV/m で初期直進)
const particleType = ref('proton') // 正電荷(p+)をデフォルトにしてフレミング左手の向きを直感化
const isPlaying = ref(true)
const timeScale = ref(0.5)
const showProjections = ref(true)
const showVectors = ref(true)
const activeCamPreset = ref('3d')

const threeContainer = ref(null)
let threeCtx = null

// 粒子の電荷 (単位 e) と表示スケール質量
const particleProps = computed(() => {
  switch (particleType.value) {
    case 'electron':
      return { q: -1, m: mElectron, name: '電子 (e⁻)', colorHex: 0x38bdf8, colorCss: '#38bdf8', massScale: 0.75 }
    case 'proton':
      return { q: 1, m: mProton * 0.05, name: '陽子 (p⁺)', colorHex: 0xf43f5e, colorCss: '#f43f5e', massScale: 1.0 }
    case 'alpha':
      return { q: 2, m: mProton * 0.2, name: 'α粒子 (He²⁺)', colorHex: 0xf59e0b, colorCss: '#f59e0b', massScale: 1.35 }
  }
})

const chargeQ = computed(() => particleProps.value.q)
const particleName = computed(() => particleProps.value.name)

const effectiveThetaRad = computed(() => {
  const deg = simMode.value === 'circle' ? pitchAngleDeg.value : 90
  return (deg * Math.PI) / 180
})

// 理論計算: r = m v sinθ / (|q|B)
const orbitRadius_mm = computed(() => {
  const b = Math.max(0.05, Math.abs(bFieldT.value))
  const v = speedV_kms.value * 1000
  const q = Math.abs(chargeQ.value) * eCharge
  const m = particleProps.value.m
  const r_m = (m * v * Math.sin(effectiveThetaRad.value)) / (q * b)
  return r_m * 1000
})

// T = 2πm / (|q|B) [ns]
const orbitPeriod_ns = computed(() => {
  const b = Math.max(0.05, Math.abs(bFieldT.value))
  const q = Math.abs(chargeQ.value) * eCharge
  const m = particleProps.value.m
  const t_s = (2 * Math.PI * m) / (q * b)
  return t_s * 1e9
})

// F = |q| v B sinθ [fN]
const lorentzForce_fN = computed(() => {
  const b = Math.abs(bFieldT.value)
  const v = speedV_kms.value * 1000
  const q = Math.abs(chargeQ.value) * eCharge
  return q * v * b * Math.sin(effectiveThetaRad.value) * 1e15
})

// らせんピッチ p = v cosθ * T [mm]
const helixPitch_mm = computed(() => {
  const v_mm_ns = speedV_kms.value * 1e-3 // 1 km/s = 10^6 mm/s = 10^-3 mm/ns
  return v_mm_ns * Math.cos(effectiveThetaRad.value) * orbitPeriod_ns.value
})

// 速度セレクター直進速度 v = E / |B| [km/s]
const straightSpeed = computed(() => {
  const b = Math.max(0.05, Math.abs(bFieldT.value))
  const e = eField_kVm.value
  return e / b
})

const isStraight = computed(() => Math.abs(speedV_kms.value - straightSpeed.value) < 6)

const selectorNetUp = computed(() => {
  // E は下向き(-y)、B は -z 向き (奥向き): v(+x) x B(-z) = +y (上向き)
  // 正電荷(q>0) のとき F_E は下向き(-), F_B は b>0 なら上向き(+)
  const qSign = Math.sign(chargeQ.value)
  const fE_y = -qSign * eField_kVm.value
  const fB_y = qSign * speedV_kms.value * bFieldT.value
  return fE_y + fB_y
})

function matchStraightSpeed() {
  const target = Math.round(straightSpeed.value / 10) * 10
  speedV_kms.value = Math.max(30, Math.min(240, target))
  emitParticle()
}

function setParticle(type) {
  particleType.value = type
  emitParticle()
}

function switchMode(mode) {
  simMode.value = mode
  if (mode === 'selector') {
    eField_kVm.value = Math.round(Math.abs(bFieldT.value) * speedV_kms.value)
  }
  setCameraPreset('3d')
  emitParticle()
}

function setCameraPreset(preset) {
  activeCamPreset.value = preset
  if (!threeCtx) return
  if (simMode.value === 'circle') {
    if (preset === '3d') {
      threeCtx.moveCameraTo([9.2, 6.0, 12.2], [0, -0.3, 0], 0.5, 42)
    } else if (preset === 'front') {
      // +x軸側から望遠(低FOV=13°)で正面視 -> パース歪みなしの真円投影
      threeCtx.moveCameraTo([48.0, 0.0, 0.01], [0, -0.15, 0], 0.5, 13.5)
    } else if (preset === 'side') {
      // +z軸側から望遠(低FOV=15.5°)で側面視 -> パース歪みなしの正弦波（ピッチ）投影
      threeCtx.moveCameraTo([-0.2, -0.2, 48.0], [-0.2, -0.2, 0], 0.5, 15.5)
    }
  } else {
    if (preset === '3d') {
      threeCtx.moveCameraTo([5.2, 4.6, 13.2], [0, 0, 0], 0.5, 42)
    } else if (preset === 'side') {
      threeCtx.moveCameraTo([0.0, 0.0, 46.0], [0, 0, 0], 0.5, 14.5)
    }
  }
}

// ==========================================================
// 3D シーンオブジェクトと物理シミュレーション状態
// ==========================================================
let simTime = 0
let manualStepDt = 0

function stepSim(dt = 0.04) {
  manualStepDt = dt
}

function emitParticle() {
  simTime = 0
  if (sceneObjects) {
    rebuildSceneGeometry()
    updateDynamicFrame(0)
  }
}

let sceneObjects = null

// 3D 描画上のらせん・円運動パラメータを計算
function getVisualHelixParams() {
  const bVal = bFieldT.value
  const bAbs = Math.max(0.08, Math.abs(bVal))
  const bSign = bVal >= 0 ? 1 : -1
  const qSign = Math.sign(chargeQ.value)
  const theta = effectiveThetaRad.value

  // 3D 空間で見やすい半径 [0.75 ~ 2.55] にスケーリング
  const rawR = (speedV_kms.value / 110) * (0.6 / bAbs) * Math.sin(theta) * particleProps.value.massScale
  const radius = Math.max(0.45, Math.min(2.6, rawR * 1.45))

  // 角速度 omega (B に比例、質量に反比例)
  const omegaMag = (2.8 * (bAbs / 0.6)) / particleProps.value.massScale
  // B が +x 向きのとき、v_perp 初速が +y なら q>0 で v x B = (+y) x (+x) = -z 向きに曲がる
  const rotSign = qSign * bSign

  // 磁場平行速度 vx (x 方向ドリフト)
  const vx = (speedV_kms.value / 110) * Math.cos(theta) * 2.25

  const startX = Math.cos(theta) < 0.05 ? 0 : -5.0
  return {
    radius,
    omegaMag,
    rotSign,
    vx,
    startX,
    bSign,
    bAbs,
    theta
  }
}

// 時刻 t における粒子の 3D 位置・速度・加速度ベクトルを算出
function evalParticleState(t) {
  if (simMode.value === 'circle') {
    const { radius, omegaMag, rotSign, vx, startX, bSign } = getVisualHelixParams()
    const phi = omegaMag * t
    // t=0 で (x=startX, y=0, z=radius) から初速度 vy > 0 でスタート
    const x = startX + vx * t
    const y = radius * Math.sin(phi)
    const z = rotSign * radius * Math.cos(phi)

    const vy = radius * omegaMag * Math.cos(phi)
    const vz = -rotSign * radius * omegaMag * Math.sin(phi)

    // 向心加速度 (常に yz 平面の中心軸 (x, 0, 0) に向かう)
    const ay = -radius * omegaMag * omegaMag * Math.sin(phi)
    const az = -rotSign * radius * omegaMag * omegaMag * Math.cos(phi)

    return {
      pos: new THREE.Vector3(x, y, z),
      vel: new THREE.Vector3(vx, vy, vz),
      bVec: new THREE.Vector3(bSign, 0, 0),
      forceL: new THREE.Vector3(0, ay, az),
      forceE: new THREE.Vector3(0, 0, 0)
    }
  } else {
    // 速度セレクターモード:
    // 粒子は x = -5.4 から +x 方向へ発射
    // 電場 E は -y (下向き)、磁場 B は -z (奥向き, bFieldT>0)
    const vx = (speedV_kms.value / 110) * 3.8
    const qSign = Math.sign(chargeQ.value)
    // E による加速度 (y方向)
    const aEy = -qSign * (eField_kVm.value / 66) * 1.6
    // B による初期ローレンツ加速度 (y方向): q (vx * Bz)
    const aBy = qSign * (speedV_kms.value / 110) * (bFieldT.value / 0.6) * 1.6
    const netAy = isStraight.value ? 0 : (aEy + aBy) * 0.42

    const x = -5.4 + vx * t
    // 極板領域 x in [-4.6, 4.2]
    const activeT = Math.max(0, t - 0.2)
    const y = Math.max(-2.35, Math.min(2.35, 0.5 * netAy * activeT * activeT))
    const vy = Math.abs(y) >= 2.34 ? 0 : netAy * activeT

    return {
      pos: new THREE.Vector3(x, y, 0),
      vel: new THREE.Vector3(vx, vy, 0),
      bVec: new THREE.Vector3(0, 0, bFieldT.value >= 0 ? -1 : 1),
      forceL: new THREE.Vector3(0, aBy, 0),
      forceE: new THREE.Vector3(0, aEy, 0)
    }
  }
}

function initThreeScene() {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [9.2, 6.0, 12.2],
    initialTarget: [0, 0, 0],
    onFrame: (dt) => {
      let step = isPlaying.value ? dt * timeScale.value : 0
      if (manualStepDt > 0) {
        step = manualStepDt
        manualStepDt = 0
      }
      if (step > 0) {
        simTime += step
        const maxT = getMaxDuration()
        if (simTime > maxT) {
          simTime = 0
        }
      }
      updateDynamicFrame(simTime)
    }
  })

  const { scene } = threeCtx
  const rootGroup = new THREE.Group()
  scene.add(rootGroup)

  // 静的環境グループ（磁場矢印、極板、投影壁面、ガイド軌道）
  const staticGroup = new THREE.Group()
  rootGroup.add(staticGroup)

  // 動的オブジェクト（荷電粒子球体、成長する3D軌跡、ベクトル矢印、射影点）
  const dynamicGroup = new THREE.Group()
  rootGroup.add(dynamicGroup)

  // 粒子本体（発光スフィア + 外周ハロー）
  const sphereGeo = new THREE.SphereGeometry(0.24, 28, 28)
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.65,
    roughness: 0.2
  })
  const particleMesh = new THREE.Mesh(sphereGeo, sphereMat)
  dynamicGroup.add(particleMesh)

  const haloGeo = new THREE.SphereGeometry(0.38, 20, 20)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.24
  })
  const haloMesh = new THREE.Mesh(haloGeo, haloMat)
  particleMesh.add(haloMesh)

  // 3D ベクトル矢印 (v, B, F_L, F_E)
  const arrowV = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  const arrowB = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.05, headRadius: 0.15, headLength: 0.36 })
  const arrowF = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.06, headRadius: 0.17, headLength: 0.4 })
  const arrowFE = createVectorArrow3D({ color: 0xf59e0b, shaftRadius: 0.055, headRadius: 0.16, headLength: 0.38 })
  dynamicGroup.add(arrowV, arrowB, arrowF, arrowFE)

  // ベクトル先端の 3D ラベルスプライト
  const labelV = createTextSprite('v (速度)', { color: '#6ee7b7', borderColor: '#10b981', scale: 0.58 })
  const labelB = createTextSprite('B (磁場)', { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.58 })
  const labelF = createTextSprite('F (ローレンツ力)', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.62 })
  const labelFE = createTextSprite('F_E (静電気力)', { color: '#fde68a', borderColor: '#f59e0b', scale: 0.58 })
  dynamicGroup.add(labelV, labelB, labelF, labelFE)

  // 2平面への影投影ドット & 投影補助破線
  const projDotGeo = new THREE.SphereGeometry(0.14, 16, 16)
  const projCircleDot = new THREE.Mesh(
    projDotGeo,
    new THREE.MeshBasicMaterial({ color: 0xec4899 })
  )
  const projWaveDot = new THREE.Mesh(
    projDotGeo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  dynamicGroup.add(projCircleDot, projWaveDot)

  const projLinesGeo = new THREE.BufferGeometry()
  projLinesGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3))
  const projLinesMat = new THREE.LineBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.45
  })
  const projLines = new THREE.LineSegments(projLinesGeo, projLinesMat)
  dynamicGroup.add(projLines)

  // アクティブ軌跡ライン (t=0 .. simTime)
  const maxTrailPts = 360
  const activeTrailGeo = new THREE.BufferGeometry()
  activeTrailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxTrailPts * 3), 3))
  const activeTrailMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 })
  const activeTrailLine = new THREE.Line(activeTrailGeo, activeTrailMat)
  dynamicGroup.add(activeTrailLine)

  sceneObjects = {
    staticGroup,
    dynamicGroup,
    particleMesh,
    sphereMat,
    haloMat,
    arrowV,
    arrowB,
    arrowF,
    arrowFE,
    labelV,
    labelB,
    labelF,
    labelFE,
    projCircleDot,
    projWaveDot,
    projLines,
    activeTrailGeo,
    activeTrailMat,
    activeTrailLine,
    maxTrailPts
  }

  rebuildSceneGeometry()
  updateDynamicFrame(0)
}

function getMaxDuration() {
  if (simMode.value === 'circle') {
    const { vx, omegaMag } = getVisualHelixParams()
    if (vx < 0.08) {
      // 円運動時は2回転分
      return (4 * Math.PI) / omegaMag
    }
    return 10.0 / vx
  } else {
    const vx = (speedV_kms.value / 110) * 3.8
    return 10.8 / vx
  }
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
      else child.material.dispose()
    }
  }
}

// パラメータ変更時に静的ガイド・磁場格子・投影面を再構築
function rebuildSceneGeometry() {
  if (!sceneObjects) return
  const { staticGroup, sphereMat, haloMat, activeTrailMat, labelF } = sceneObjects
  clearGroup(staticGroup)

  const pColor = particleProps.value.colorHex
  sphereMat.color.setHex(pColor)
  sphereMat.emissive.setHex(pColor)
  haloMat.color.setHex(pColor)
  activeTrailMat.color.setHex(pColor)

  if (simMode.value === 'circle') {
    labelF.updateText('F (ローレンツ力)', '#fda4af', '#f43f5e')
    buildCircleHelixEnvironment(staticGroup)
  } else {
    labelF.updateText('F_B (磁気力)', '#fda4af', '#f43f5e')
    buildSelectorEnvironment(staticGroup)
  }
}

function buildCircleHelixEnvironment(staticGroup) {
  const { radius, bSign } = getVisualHelixParams()
  const bAbs = Math.abs(bFieldT.value)

  // 1. 中心の磁場軸 (x軸: -6.0 .. +6.0)
  if (bAbs >= 0.05) {
    const axisArrow = createVectorArrow3D({
      color: 0x38bdf8,
      shaftRadius: 0.035,
      headRadius: 0.14,
      headLength: 0.4,
      opacity: 0.75
    })
    axisArrow.setVector(
      new THREE.Vector3(bSign > 0 ? -5.8 : 5.8, 0, 0),
      new THREE.Vector3(bSign, 0, 0),
      11.6
    )
    staticGroup.add(axisArrow)

    const bAxisLabel = createTextSprite(
      `一様磁場 B = ${bFieldT.value.toFixed(2)} T (${bSign > 0 ? '+x' : '-x'}向き)`,
      { color: '#38bdf8', borderColor: 'rgba(56,189,248,0.45)', scale: 0.62 }
    )
    bAxisLabel.position.set(bSign * 4.4, 2.95, 0)
    staticGroup.add(bAxisLabel)

    // 周囲の補助 3D 磁力線ベクトル (4隅)
    const offsets = [
      [2.2, 2.2],
      [2.2, -2.2],
      [-2.2, 2.2],
      [-2.2, -2.2]
    ]
    offsets.forEach(([oy, oz]) => {
      const subArrow = createVectorArrow3D({
        color: 0x38bdf8,
        shaftRadius: 0.02,
        headRadius: 0.09,
        headLength: 0.28,
        opacity: 0.28
      })
      subArrow.setVector(
        new THREE.Vector3(bSign > 0 ? -5.4 : 5.4, oy, oz),
        new THREE.Vector3(bSign, 0, 0),
        10.8
      )
      staticGroup.add(subArrow)
    })
  }

  // 2. 全軌道の理論 3D ガイド曲線（半透明チューブ/ライン）
  const maxT = getMaxDuration()
  const samples = 240
  const curvePts = []
  const circleProjPts = []
  const waveProjPts = []
  const wallX = -6.0
  const floorY = -3.3

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * maxT
    const st = evalParticleState(t)
    curvePts.push(st.pos)
    circleProjPts.push(new THREE.Vector3(wallX, st.pos.y, st.pos.z))
    waveProjPts.push(new THREE.Vector3(st.pos.x, floorY, st.pos.z))
  }

  const guideCurve = new THREE.CatmullRomCurve3(curvePts)
  const tubeGeo = new THREE.TubeGeometry(guideCurve, 180, 0.045, 10, false)
  const tubeMat = new THREE.MeshStandardMaterial({
    color: particleProps.value.colorHex,
    emissive: particleProps.value.colorHex,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.34
  })
  staticGroup.add(new THREE.Mesh(tubeGeo, tubeMat))

  // 3. 2平面への投影スクリーン（正面壁 x = -6.0: 円運動投影、床面 y = -3.3: 正弦波投影）
  if (showProjections.value) {
    // (A) 左端の yz 投影パネル (円運動)
    const wallPlaneGeo = new THREE.PlaneGeometry(6.4, 6.4)
    const wallPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    })
    const wallPlane = new THREE.Mesh(wallPlaneGeo, wallPlaneMat)
    wallPlane.rotation.y = Math.PI / 2
    wallPlane.position.set(wallX - 0.02, 0, 0)
    staticGroup.add(wallPlane)

    // 投影パネル上の円軌道ライン
    const cProjGeo = new THREE.BufferGeometry().setFromPoints(circleProjPts)
    const cProjMat = new THREE.LineBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.75
    })
    staticGroup.add(new THREE.Line(cProjGeo, cProjMat))

    const wallLabel = createTextSprite(`yz投影: 半径 r = ${orbitRadius_mm.value.toFixed(2)} mm の円運動`, {
      color: '#f472b6',
      borderColor: 'rgba(236,72,153,0.4)',
      scale: 0.52
    })
    wallLabel.position.set(wallX + 1.15, 2.85, 0)
    staticGroup.add(wallLabel)

    // (B) 底面の xz 投影パネル (正弦波・ピッチ)
    const floorGrid = new THREE.GridHelper(12, 12, 0x334155, 0x1e293b)
    floorGrid.position.set(0, floorY - 0.02, 0)
    staticGroup.add(floorGrid)

    const wProjGeo = new THREE.BufferGeometry().setFromPoints(waveProjPts)
    const wProjMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    })
    staticGroup.add(new THREE.Line(wProjGeo, wProjMat))

    const floorLabel = createTextSprite(
      pitchAngleDeg.value === 90
        ? 'xz底面投影: θ=90° (磁場方向の進行 0)'
        : `xz底面投影: ピッチ p = ${helixPitch_mm.value.toFixed(2)} mm の正弦波`,
      {
        color: '#7dd3fc',
        borderColor: 'rgba(56,189,248,0.4)',
        scale: 0.52
      }
    )
    floorLabel.position.set(0, floorY + 0.28, 3.3)
    staticGroup.add(floorLabel)
  }

  // 半径 r を示す補助ガイド（円柱ワイヤーフレーム）
  const cylGeo = new THREE.CylinderGeometry(radius, radius, 10.0, 32, 1, true)
  cylGeo.rotateZ(Math.PI / 2)
  const cylMat = new THREE.MeshBasicMaterial({
    color: 0x475569,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  })
  staticGroup.add(new THREE.Mesh(cylGeo, cylMat))
}

function buildSelectorEnvironment(staticGroup) {
  // 上極板 (+極: y = +2.5) と下極板 (-極: y = -2.5)
  const plateGeo = new THREE.BoxGeometry(8.8, 0.18, 3.8)
  const topPlateMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.8
  })
  const topPlate = new THREE.Mesh(plateGeo, topPlateMat)
  topPlate.position.set(-0.2, 2.5, 0)
  staticGroup.add(topPlate)

  const botPlateMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.8
  })
  const botPlate = new THREE.Mesh(plateGeo, botPlateMat)
  botPlate.position.set(-0.2, -2.5, 0)
  staticGroup.add(botPlate)

  const topLabel = createTextSprite('＋極板（高電位） 下向き電場 E', {
    color: '#fca5a5',
    borderColor: '#ef4444',
    scale: 0.52
  })
  topLabel.position.set(-1.3, 3.15, 0)
  staticGroup.add(topLabel)

  const botLabel = createTextSprite('－極板（低電位）', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    scale: 0.5
  })
  botLabel.position.set(-0.2, -3.1, 0)
  staticGroup.add(botLabel)

  // 電場 E の下向き3D矢印列 + 磁場 B の奥向き3D矢印列
  for (let x = -3.4; x <= 3.0; x += 2.1) {
    if (eField_kVm.value > 0) {
      const eArr = createVectorArrow3D({
        color: 0xef4444,
        shaftRadius: 0.025,
        headRadius: 0.09,
        headLength: 0.26,
        opacity: 0.35
      })
      eArr.setVector(new THREE.Vector3(x, 2.2, -1.2), new THREE.Vector3(0, -1, 0), 4.4)
      staticGroup.add(eArr)
    }

    if (Math.abs(bFieldT.value) >= 0.05) {
      const bDir = bFieldT.value >= 0 ? -1 : 1
      const bArr = createVectorArrow3D({
        color: 0x38bdf8,
        shaftRadius: 0.025,
        headRadius: 0.09,
        headLength: 0.26,
        opacity: 0.35
      })
      bArr.setVector(new THREE.Vector3(x, 0, -bDir * 1.8), new THREE.Vector3(0, 0, bDir), 3.6)
      staticGroup.add(bArr)
    }
  }

  // 右端のスリット壁 (x = 4.5)
  const wallGeo = new THREE.BoxGeometry(0.22, 1.9, 3.8)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 })
  const upperWall = new THREE.Mesh(wallGeo, wallMat)
  upperWall.position.set(4.5, 1.55, 0)
  const lowerWall = new THREE.Mesh(wallGeo, wallMat)
  lowerWall.position.set(4.5, -1.55, 0)
  staticGroup.add(upperWall, lowerWall)

  const slitLabel = createTextSprite('スリット S (v = E/B のみ通過)', {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.5
  })
  slitLabel.position.set(3.0, 2.95, 0)
  staticGroup.add(slitLabel)

  // 全軌道の理論 3D ガイド曲線
  const maxT = getMaxDuration()
  const samples = 120
  const curvePts = []
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * maxT
    const st = evalParticleState(t)
    if (st.pos.x >= 4.45 && Math.abs(st.pos.y) > 0.55) break
    curvePts.push(st.pos)
  }
  if (curvePts.length > 2) {
    const guideCurve = new THREE.CatmullRomCurve3(curvePts)
    const tubeGeo = new THREE.TubeGeometry(guideCurve, 80, 0.045, 10, false)
    const tubeMat = new THREE.MeshStandardMaterial({
      color: isStraight.value ? 0x10b981 : particleProps.value.colorHex,
      transparent: true,
      opacity: 0.38
    })
    staticGroup.add(new THREE.Mesh(tubeGeo, tubeMat))
  }
}

function updateDynamicFrame(t) {
  if (!sceneObjects) return
  const {
    particleMesh,
    arrowV,
    arrowB,
    arrowF,
    arrowFE,
    labelV,
    labelB,
    labelF,
    labelFE,
    projCircleDot,
    projWaveDot,
    projLines,
    activeTrailGeo,
    maxTrailPts
  } = sceneObjects

  const state = evalParticleState(t)
  // スリット壁衝突判定（速度セレクター）
  if (simMode.value === 'selector' && state.pos.x >= 4.45 && Math.abs(state.pos.y) > 0.55) {
    simTime = 0
    return
  }

  particleMesh.position.copy(state.pos)

  // 成長するアクティブ軌跡の更新
  const posAttr = activeTrailGeo.getAttribute('position')
  const arr = posAttr.array
  const count = Math.max(2, Math.floor((t / Math.max(0.1, getMaxDuration())) * (maxTrailPts - 1)))
  for (let i = 0; i < count; i++) {
    const sampleT = (i / (count - 1)) * t
    const st = evalParticleState(sampleT)
    arr[i * 3] = st.pos.x
    arr[i * 3 + 1] = st.pos.y
    arr[i * 3 + 2] = st.pos.z
  }
  activeTrailGeo.setDrawRange(0, count)
  posAttr.needsUpdate = true

  // 3D ベクトル矢印とラベルの更新
  if (showVectors.value) {
    const vDir = state.vel.clone().normalize()
    const vLen = 1.65
    arrowV.setVector(state.pos, vDir, vLen)
    labelV.visible = true
    labelV.position.copy(state.pos).addScaledVector(vDir, vLen + 0.44)
    if (simMode.value === 'circle') {
      labelV.position.y += 0.22
    } else {
      labelV.position.x += 0.35
    }

    if (Math.abs(bFieldT.value) >= 0.05) {
      const bDir = state.bVec.clone().normalize()
      const bLen = 1.4
      arrowB.setVector(state.pos, bDir, bLen)
      labelB.visible = true
      labelB.position.copy(state.pos).addScaledVector(bDir, bLen + 0.42)
      if (simMode.value === 'circle') {
        if (activeCamPreset.value === 'front') {
          labelB.position.y += 0.55
          labelB.position.z -= 0.75
        } else {
          labelB.position.y -= 0.28
        }
      } else {
        labelB.position.x -= 0.35
      }
    } else {
      arrowB.visible = false
      labelB.visible = false
    }

    if (state.forceL.lengthSq() > 1e-4 && Math.abs(bFieldT.value) >= 0.05) {
      const fDir = state.forceL.clone().normalize()
      const fLen = simMode.value === 'circle' ? 1.55 : Math.min(2.1, Math.max(0.6, state.forceL.length() * 0.9))
      arrowF.setVector(state.pos, fDir, fLen)
      labelF.visible = true
      labelF.position.copy(state.pos).addScaledVector(fDir, fLen + 0.42)
    } else {
      arrowF.visible = false
      labelF.visible = false
    }

    if (simMode.value === 'selector' && state.forceE.lengthSq() > 1e-4) {
      const feDir = state.forceE.clone().normalize()
      const feLen = Math.min(2.1, Math.max(0.6, state.forceE.length() * 0.9))
      arrowFE.setVector(state.pos, feDir, feLen)
      labelFE.visible = true
      labelFE.position.copy(state.pos).addScaledVector(feDir, feLen + 0.42)
    } else {
      arrowFE.visible = false
      labelFE.visible = false
    }
  } else {
    arrowV.visible = false
    arrowB.visible = false
    arrowF.visible = false
    arrowFE.visible = false
    labelV.visible = false
    labelB.visible = false
    labelF.visible = false
    labelFE.visible = false
  }

  // 2平面への影投影ドットと補助線の更新
  if (simMode.value === 'circle' && showProjections.value) {
    const wallX = -6.0
    const floorY = -3.3
    projCircleDot.visible = true
    projWaveDot.visible = true
    projLines.visible = true

    projCircleDot.position.set(wallX, state.pos.y, state.pos.z)
    projWaveDot.position.set(state.pos.x, floorY, state.pos.z)

    const lp = projLines.geometry.getAttribute('position').array
    // 粒子 -> 左壁 (円運動投影)
    lp[0] = state.pos.x
    lp[1] = state.pos.y
    lp[2] = state.pos.z
    lp[3] = wallX
    lp[4] = state.pos.y
    lp[5] = state.pos.z
    // 粒子 -> 床面 (正弦波投影)
    lp[6] = state.pos.x
    lp[7] = state.pos.y
    lp[8] = state.pos.z
    lp[9] = state.pos.x
    lp[10] = floorY
    lp[11] = state.pos.z
    projLines.geometry.getAttribute('position').needsUpdate = true
  } else {
    projCircleDot.visible = false
    projWaveDot.visible = false
    projLines.visible = false
  }
}

watch(
  [bFieldT, speedV_kms, pitchAngleDeg, eField_kVm, particleType, showProjections, simMode],
  () => {
    rebuildSceneGeometry()
    updateDynamicFrame(simTime)
  }
)

watch(showVectors, () => {
  updateDynamicFrame(simTime)
})

onMounted(() => {
  initThreeScene()
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.lorentz-mode-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.7rem;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
}

.preset-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
}

.preset-group,
.preset-toggles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 440px;
  background: #080c16;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow: hidden;
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
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.82);
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

.dot-v {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}
.dot-b {
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}
.dot-f {
  background: #f43f5e;
  box-shadow: 0 0 6px #f43f5e;
}
.dot-e {
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
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

.lorentz-stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 350px;
  }
  .lorentz-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
