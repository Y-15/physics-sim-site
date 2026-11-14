<template>
  <div class="lab" :style="{ '--ac': '#fbbf24', '--ac2': '#34d399' }">
    <div class="lab-head">
      <span class="lab-title">💎 3D ブラッグ反射とX線結晶回折シミュレーター</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">θ = {{ glancingAngleDeg.toFixed(1) }}° ｜ d = {{ latticeSpacingNm.toFixed(3) }} nm</span>
      </div>
    </div>

    <p class="lab-desc">
      規則正しく並んだ 3D 結晶格子面（面間隔 <i>d</i>）に波長 λ のX線をすれすれ角 θ で入射したときの幾何学的光路差 2<i>d</i>sinθ（金色ハイライト）と、強め合いのブラッグ条件 2<i>d</i>sinθ = <i>n</i>λ、および回折ピーク曲線 <i>I</i>(θ) を 3D で体験できます。
    </p>

    <!-- カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button
        class="lab-btn primary"
        @click="isPlaying = !isPlaying"
        style="padding: 5px 14px; font-weight: 700; border-radius: 8px; font-size: 0.84rem;"
      >
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🐢 0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          第1層反射 X線①
        </span>
        <span class="legend-item">
          <i style="background:#fb923c;box-shadow:0 0 6px #fb923c"></i>
          第2層反射 X線②
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          光路差 2d sinθ
        </span>
        <span class="legend-item">
          <i style="background:#34d399;box-shadow:0 0 6px #34d399"></i>
          回折強度ピーク I(θ)
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 干渉ステータス帯 -->
    <div class="ortho-status-strip">
      <span
        class="three-ortho-badge"
        :style="{
          borderColor: isBraggPeak ? '#34d399' : '#94a3b8',
          color: isBraggPeak ? '#6ee7b7' : '#e2e8f0'
        }"
      >
        {{ isBraggPeak
          ? `✨ ブラッグ反射成立! (${braggOrder}次極大ピーク: 2d sinθ ≈ ${braggOrder}λ)`
          : `非干渉減衰 (2d sinθ / λ = ${ratio.toFixed(2)} — 整数からズレて打消し)` }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>入射角（すれすれ角）θ: <strong>{{ glancingAngleDeg.toFixed(1) }}°</strong></label>
        <input type="range" v-model.number="glancingAngleDeg" min="10" max="75" step="0.5" />
        <div class="lab-note">結晶格子面とのなす角 θ（光学の法線基準角 90°−θ とは異なる点に注意）</div>
      </div>

      <div class="lab-ctrl">
        <label>結晶格子面間隔 <i>d</i>: <strong>{{ latticeSpacingNm.toFixed(3) }} nm</strong></label>
        <input type="range" v-model.number="latticeSpacingNm" min="0.15" max="0.40" step="0.005" />
        <div class="lab-note">面間隔 d が広いほど同じ波長でも小さい角度 θ でブラッグ反射します</div>
      </div>

      <div class="lab-ctrl">
        <label>X線の波長 λ: <strong>{{ xRayWavelengthNm.toFixed(3) }} nm</strong></label>
        <input type="range" v-model.number="xRayWavelengthNm" min="0.05" max="0.25" step="0.005" />
        <div class="lab-note">既知波長 (例: Cu-Kα = 0.154 nm) で結晶間隔 d を測定できます</div>
      </div>

      <div class="lab-ctrl">
        <label>プリセット結晶 (標準 d に切替 &amp; ピーク調整)</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: Math.abs(latticeSpacingNm - 0.282) < 0.005 }" @click="setPreset('nacl')">
            NaCl (0.282nm)
          </button>
          <button class="lab-chip" :class="{ on: Math.abs(latticeSpacingNm - 0.314) < 0.005 }" @click="setPreset('si')">
            Si (0.314nm)
          </button>
          <button class="lab-chip" :class="{ on: Math.abs(latticeSpacingNm - 0.208) < 0.005 }" @click="setPreset('cu')">
            Cu (0.208nm)
          </button>
        </div>
      </div>
    </div>

    <div class="lab-btns" style="margin-bottom: 0.9rem;">
      <button class="lab-btn primary" @click="snapToBraggAngle">
        🎯 最寄りのブラッグ角に自動調整
      </button>
      <button class="lab-btn" @click="resetDefaults">
        🔄 デフォルト設定に戻す (NaCl / 15.9°)
      </button>
    </div>

    <!-- 物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">光路差 2<i>d</i> sinθ</div>
        <div class="v" style="color:#fbbf24">{{ pathDifferenceNm.toFixed(3) }} <small>nm</small></div>
        <div class="f">波長比 2d sinθ / λ = {{ ratio.toFixed(2) }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">反射X線強度 <i>I</i>(θ)</div>
        <div class="v" :style="{ color: isBraggPeak ? '#34d399' : '#cbd5e1' }">
          {{ (reflectionIntensity * 100).toFixed(0) }} <small>%</small>
        </div>
        <div class="f">{{ isBraggPeak ? '完全同位相で強め合い' : '位相差による干渉減衰' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">1次ブラッグ角 θ<sub>1</sub></div>
        <div class="v" style="color:#38bdf8">{{ theta1Deg > 0 ? theta1Deg.toFixed(1) + '°' : '存在せず' }}</div>
        <div class="f">sinθ₁ = λ / (2d)</div>
      </div>

      <div class="lab-stat">
        <div class="k">2次ブラッグ角 θ<sub>2</sub></div>
        <div class="v">{{ theta2Deg > 0 ? theta2Deg.toFixed(1) + '°' : '存在せず' }}</div>
        <div class="f">sinθ₂ = 2λ / (2d)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const glancingAngleDeg = ref(15.9)
const latticeSpacingNm = ref(0.282)
const xRayWavelengthNm = ref(0.154)

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

const thetaRad = computed(() => (glancingAngleDeg.value * Math.PI) / 180)
const pathDifferenceNm = computed(() => 2 * latticeSpacingNm.value * Math.sin(thetaRad.value))
const ratio = computed(() => pathDifferenceNm.value / xRayWavelengthNm.value)
const nearestN = computed(() => Math.round(ratio.value))
const phaseDiff = computed(() => Math.abs(ratio.value - nearestN.value))

const isBraggPeak = computed(() => nearestN.value >= 1 && phaseDiff.value < 0.04)
const braggOrder = computed(() => nearestN.value)

function intensityAtAngle(deg) {
  const rad = (deg * Math.PI) / 180
  const r = (2 * latticeSpacingNm.value * Math.sin(rad)) / xRayWavelengthNm.value
  const nNear = Math.max(1, Math.round(r))
  const dPhase = Math.abs(r - nNear) * 2 * Math.PI
  return Math.exp(-Math.pow(dPhase * 3.5, 2))
}

const reflectionIntensity = computed(() => {
  if (nearestN.value < 1) return Math.exp(-Math.pow((1 - ratio.value) * 2 * Math.PI * 3.5, 2))
  const dPhase = phaseDiff.value * 2 * Math.PI
  return Math.exp(-Math.pow(dPhase * 3.5, 2))
})

const theta1Deg = computed(() => {
  const s = xRayWavelengthNm.value / (2 * latticeSpacingNm.value)
  return s <= 1.0 ? (Math.asin(s) * 180) / Math.PI : -1
})

const theta2Deg = computed(() => {
  const s = (2 * xRayWavelengthNm.value) / (2 * latticeSpacingNm.value)
  return s <= 1.0 ? (Math.asin(s) * 180) / Math.PI : -1
})

function snapToBraggAngle() {
  const n = Math.max(1, nearestN.value)
  const sinTarget = (n * xRayWavelengthNm.value) / (2 * latticeSpacingNm.value)
  if (sinTarget <= 0.96) {
    glancingAngleDeg.value = Math.round(((Math.asin(sinTarget) * 180) / Math.PI) * 10) / 10
  } else if (theta1Deg.value > 0) {
    glancingAngleDeg.value = Math.round(theta1Deg.value * 10) / 10
  }
}

function setPreset(type) {
  if (type === 'nacl') latticeSpacingNm.value = 0.282
  else if (type === 'si') latticeSpacingNm.value = 0.314
  else if (type === 'cu') latticeSpacingNm.value = 0.208
  snapToBraggAngle()
}

function resetDefaults() {
  latticeSpacingNm.value = 0.282
  xRayWavelengthNm.value = 0.154
  glancingAngleDeg.value = 15.9
}

// 3D レイアウト定数
const CRYSTAL_CX = -2.25
const LAYER1_Y = 0.22
const PLOT_X0 = 1.35
const PLOT_W = 4.05
const PLOT_Y0 = -1.78
const PLOT_H = 1.90

const threeContainer = ref(null)
let threeCtx = null
let crystalGroup = null
let rightPanelGroup = null
let plotGroup = null
let phaseWaveGroup = null
let waveGroup = null
let lastCamAspect = 0
let simTime = 0

// 動的波動メッシュ
const rayWaveLines = []
const phaseWaveLines = []

function getMobileScale() {
  if (!threeCtx?.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.15, 1.56 / Math.max(0.62, aspect)) : 1.0
}

function isNarrowViewport() {
  return Boolean(threeCtx?.camera && threeCtx.camera.aspect < 1.35)
}

function getSpriteScale(base = 0.40) {
  if (!isNarrowViewport()) return base
  return base * Math.min(1.85, getMobileScale() * 1.04)
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([0.4 * s, 4.4 * s, 12.2 * s], [0.4, 0.05, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.4, 0.08, 36.5 * s], [0.4, 0.05, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.15, 38.5 * s, 0.08], [0.15, 0, 0], duration, 14)
  }
}

function clearGroup(group) {
  if (!group) return
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    child.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        } else {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      }
    })
  }
}

function getGeometryLayout() {
  const layerGap = (latticeSpacingNm.value / 0.282) * 0.95
  const y1 = LAYER1_Y
  const y2 = LAYER1_Y - layerGap
  const y3 = LAYER1_Y - layerGap * 2
  const th = thetaRad.value
  const rayLen = 2.85
  const cosT = Math.cos(th)
  const sinT = Math.sin(th)

  const A = new THREE.Vector3(CRYSTAL_CX, y1, 0)
  const B = new THREE.Vector3(CRYSTAL_CX, y2, 0)

  const in1 = new THREE.Vector3(CRYSTAL_CX - rayLen * cosT, y1 + rayLen * sinT, 0)
  const out1 = new THREE.Vector3(CRYSTAL_CX + rayLen * cosT, y1 + rayLen * sinT, 0)

  const in2 = new THREE.Vector3(CRYSTAL_CX - rayLen * cosT, y2 + rayLen * sinT, 0)
  const out2 = new THREE.Vector3(CRYSTAL_CX + rayLen * cosT, y2 + rayLen * sinT, 0)

  // Aから光線2の入射/反射線へ下ろした垂線の足 P, Q
  // AP ベクトルは入射線2に直交: Bから入線方向 (-cosT, +sinT) に d*sinθ 戻った点 P
  const P = new THREE.Vector3(CRYSTAL_CX - layerGap * sinT * cosT, y2 + layerGap * sinT * sinT, 0)
  const Q = new THREE.Vector3(CRYSTAL_CX + layerGap * sinT * cosT, y2 + layerGap * sinT * sinT, 0)

  return { layerGap, y1, y2, y3, th, A, B, in1, out1, in2, out2, P, Q }
}

function buildCrystalAndGeometry() {
  if (!crystalGroup) return
  clearGroup(crystalGroup)

  const narrow = isNarrowViewport()
  const { layerGap, y1, y2, y3, th, A, B, in1, out1, in2, out2, P, Q } = getGeometryLayout()

  // 1. 実験室床グリッド
  const grid = new THREE.GridHelper(17, 17, 0x1e293b, 0x0f172a)
  grid.position.set(0.4, -2.35, 0)
  crystalGroup.add(grid)

  // 2. 3D 結晶格子面 (3層 x 5x3 原子グリッド + 結晶ボンド)
  const planeW = 4.4
  const planeD = 2.1
  const layerYs = [y1, y2, y3]
  const layerColors = [0x38bdf8, 0xfb923c, 0x64748b]

  layerYs.forEach((ly, lIdx) => {
    const planeMat = new THREE.MeshBasicMaterial({
      color: layerColors[lIdx],
      transparent: true,
      opacity: lIdx < 2 ? 0.14 : 0.06,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeD), planeMat)
    plane.rotation.x = -Math.PI / 2
    plane.position.set(CRYSTAL_CX, ly, 0)
    crystalGroup.add(plane)
  })

  // 原子球 & 立方格子ボンド
  const atomGeo = new THREE.SphereGeometry(0.095, 14, 14)
  const bondMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.45 })
  const xs = [-1.6, -0.8, 0, 0.8, 1.6]
  const zs = [-0.75, 0, 0.75]

  for (const dx of xs) {
    for (const dz of zs) {
      // 垂直結合柱
      crystalGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(CRYSTAL_CX + dx, y1, dz),
            new THREE.Vector3(CRYSTAL_CX + dx, y3, dz)
          ]),
          bondMat
        )
      )
      layerYs.forEach((ly, lIdx) => {
        const isCenter = dx === 0 && dz === 0 && lIdx < 2
        const mat = new THREE.MeshStandardMaterial({
          color: layerColors[lIdx],
          emissive: layerColors[lIdx],
          emissiveIntensity: isCenter ? 0.9 : 0.4,
          metalness: 0.3,
          roughness: 0.25
        })
        const atom = new THREE.Mesh(atomGeo, mat)
        atom.scale.setScalar(isCenter ? 1.35 : 0.95)
        atom.position.set(CRYSTAL_CX + dx, ly, dz)
        crystalGroup.add(atom)
      })
    }
  }

  // 面間隔 d の寸法バー
  const dBarX = CRYSTAL_CX - 2.38
  crystalGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(dBarX, y1, 0),
        new THREE.Vector3(dBarX, y2, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x38bdf8 })
    )
  )
  const dLbl = createTextSprite(`d=${latticeSpacingNm.value.toFixed(3)}nm`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 25,
    scale: getSpriteScale(0.32)
  })
  dLbl.position.set(dBarX + 0.25, (y1 + y2) / 2 - 0.14, 0.78)
  crystalGroup.add(dLbl)

  // 3. 入射・反射ガイド線
  crystalGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([in1, A, out1]),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.38 })
    )
  )
  crystalGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([in2, B, out2]),
      new THREE.LineBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.38 })
    )
  )

  // 4. 幾何学的垂線 AP, AQ と光路差 2d sinθ (PB + BQ) 鮮やかなゴールド発光チューブ
  const perpMat = new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.8 })
  crystalGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([A, P]), perpMat))
  crystalGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([A, Q]), perpMat))

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.18
  })
  if (P.distanceTo(B) > 0.04) {
    crystalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(P, B), 6, 0.048, 8, false), goldMat))
    crystalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(B, Q), 6, 0.048, 8, false), goldMat))
  }

  const beadGeo = new THREE.SphereGeometry(0.075, 12, 12)
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xfde047 })
  ;[P, Q].forEach(pt => {
    const b = new THREE.Mesh(beadGeo, beadMat)
    b.position.copy(pt)
    crystalGroup.add(b)
  })

  // すれすれ角 θ の円弧
  const arcPts = []
  const arcR = 0.95
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - (i / 16) * th
    arcPts.push(new THREE.Vector3(CRYSTAL_CX + arcR * Math.cos(a), y1 - arcR * Math.sin(a) * -1, 0.04))
  }
  crystalGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0xfbbf24 })
    )
  )

  // ラベル群 (Z/X/Y でしっかり分離)
  const thetaLbl = createTextSprite(`θ=${glancingAngleDeg.value.toFixed(1)}°`, {
    color: '#fde68a',
    borderColor: '#fbbf24',
    fontSize: 25,
    scale: getSpriteScale(0.32)
  })
  thetaLbl.position.set(CRYSTAL_CX - 1.38, y1 + 0.36, 0.55)
  crystalGroup.add(thetaLbl)

  const diffLbl = createTextSprite(narrow ? '2d sinθ' : `光路差 2d sinθ = ${pathDifferenceNm.value.toFixed(3)} nm`, {
    color: '#fde68a',
    borderColor: '#fbbf24',
    fontSize: 26,
    scale: getSpriteScale(0.35)
  })
  diffLbl.position.set(CRYSTAL_CX + 0.15, y2 - 0.52, 0.85)
  crystalGroup.add(diffLbl)

  const xInLbl = createTextSprite('入射 X線', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 25, scale: getSpriteScale(0.32) })
  xInLbl.position.set(in1.x + 0.65, in1.y + 0.45, -0.45)
  const xOutLbl = createTextSprite(
    narrow ? (isBraggPeak.value ? '強め合い ✨' : '弱め合い') : (isBraggPeak.value ? '強め合い反射波 ✨' : '反射波 (弱め合い)'),
    {
      color: isBraggPeak.value ? '#6ee7b7' : '#cbd5e1',
      borderColor: isBraggPeak.value ? '#34d399' : '#64748b',
      fontSize: 25,
      scale: getSpriteScale(0.32)
    }
  )
  xOutLbl.position.set(CRYSTAL_CX + 1.15, out1.y + 0.42, 0.55)
  crystalGroup.add(xInLbl, xOutLbl)
}

function buildIntensityPlot() {
  if (!plotGroup) return
  clearGroup(plotGroup)

  const narrow = isNarrowViewport()

  // 背景パネル (右半面: 下に I(θ) 曲線、上に位相重畳インジケーター)
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(PLOT_W + 0.65, 5.15, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75, metalness: 0.2 })
  )
  board.position.set(PLOT_X0 + PLOT_W / 2, 0.30, -0.14)
  plotGroup.add(board)

  // 下半分: I(θ) 軸
  plotGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(PLOT_X0, PLOT_Y0 + PLOT_H, 0),
        new THREE.Vector3(PLOT_X0, PLOT_Y0, 0),
        new THREE.Vector3(PLOT_X0 + PLOT_W, PLOT_Y0, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x64748b })
    )
  )

  const thetaMin = 10
  const thetaMax = 75
  const degToX = deg => PLOT_X0 + ((deg - thetaMin) / (thetaMax - thetaMin)) * PLOT_W

  const samples = 130
  const curvePts = []
  const ribPos = new Float32Array((samples + 1) * 2 * 3)
  const ribIdx = []

  for (let i = 0; i <= samples; i++) {
    const deg = thetaMin + (i / samples) * (thetaMax - thetaMin)
    const inten = intensityAtAngle(deg)
    const px = degToX(deg)
    const py = PLOT_Y0 + inten * (PLOT_H - 0.25)
    curvePts.push(new THREE.Vector3(px, py, 0.05))

    const vIdx = i * 2
    ribPos[vIdx * 3] = px
    ribPos[vIdx * 3 + 1] = PLOT_Y0
    ribPos[vIdx * 3 + 2] = 0.02
    ribPos[(vIdx + 1) * 3] = px
    ribPos[(vIdx + 1) * 3 + 1] = py
    ribPos[(vIdx + 1) * 3 + 2] = 0.02
    if (i < samples) {
      ribIdx.push(vIdx, vIdx + 1, vIdx + 2, vIdx + 1, vIdx + 3, vIdx + 2)
    }
  }

  const ribGeo = new THREE.BufferGeometry()
  ribGeo.setAttribute('position', new THREE.BufferAttribute(ribPos, 3))
  ribGeo.setIndex(ribIdx)
  plotGroup.add(
    new THREE.Mesh(
      ribGeo,
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
  )

  plotGroup.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 130, 0.036, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x10b981,
        emissiveIntensity: 0.72
      })
    )
  )

  // 現在角度カーソル球 + 垂線
  const curX = degToX(glancingAngleDeg.value)
  const curY = PLOT_Y0 + reflectionIntensity.value * (PLOT_H - 0.25)
  const cursor = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 14),
    new THREE.MeshBasicMaterial({ color: isBraggPeak.value ? 0xfbbf24 : 0x38bdf8 })
  )
  cursor.position.set(curX, curY, 0.09)
  plotGroup.add(cursor)

  plotGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(curX, PLOT_Y0, 0.04),
        new THREE.Vector3(curX, curY, 0.04)
      ]),
      new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.65 })
    )
  )

  // 1次・2次ブラッグピーク角度マーカー
  if (theta1Deg.value >= thetaMin && theta1Deg.value <= thetaMax) {
    const t1Lbl = createTextSprite(`1次 ${theta1Deg.value.toFixed(1)}°`, {
      color: '#6ee7b7',
      borderColor: '#34d399',
      fontSize: 22,
      scale: getSpriteScale(0.28)
    })
    const t1x = theta1Deg.value > 52 ? degToX(theta1Deg.value) - 0.38 : degToX(theta1Deg.value) + 0.38
    t1Lbl.position.set(t1x, PLOT_Y0 + PLOT_H - 0.36, 0.22)
    plotGroup.add(t1Lbl)
  }

  const plotTitle = createTextSprite(narrow ? 'I(θ) ピーク曲線' : 'ブラッグ回折強度曲線 I(θ)', {
    color: '#6ee7b7',
    borderColor: '#34d399',
    fontSize: 26,
    scale: getSpriteScale(0.35)
  })
  plotTitle.position.set(PLOT_X0 + PLOT_W / 2, PLOT_Y0 + PLOT_H + 0.30, 0.16)
  plotGroup.add(plotTitle)

  const thAxisLbl = createTextSprite('角度 θ [°] →', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.4)',
    fontSize: 23,
    scale: getSpriteScale(0.29)
  })
  thAxisLbl.position.set(PLOT_X0 + PLOT_W - 0.45, PLOT_Y0 - 0.28, 0.2)
  plotGroup.add(thAxisLbl)

  const phaseTitle = createTextSprite(
    narrow
      ? (isBraggPeak.value ? '位相同期 (合成MAX)' : '位相差あり (減衰)')
      : (isBraggPeak.value ? '位相同期：強め合い (合成振幅 MAX)' : '位相差あり：弱め合い (合成減衰)'),
    {
      color: isBraggPeak.value ? '#fde68a' : '#fda4af',
      borderColor: isBraggPeak.value ? '#fbbf24' : '#fb7185',
      fontSize: 24,
      scale: getSpriteScale(0.32)
    }
  )
  phaseTitle.position.set(PLOT_X0 + PLOT_W / 2, 2.42, 0.18)
  plotGroup.add(phaseTitle)
}

function initWaveLines() {
  if (!waveGroup || !phaseWaveGroup) return
  clearGroup(waveGroup)
  clearGroup(phaseWaveGroup)
  rayWaveLines.length = 0
  phaseWaveLines.length = 0

  const segs = 64
  // 4本の結晶ビーム波: in1, out1 (シアン), in2, out2 (オレンジ)
  const colors = [0x38bdf8, 0x38bdf8, 0xfb923c, 0xfb923c]
  for (let i = 0; i < 4; i++) {
    const pos = new Float32Array((segs + 1) * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: colors[i] }))
    waveGroup.add(line)
    rayWaveLines.push({ line, geo, pos, segs })
  }

  // 右上パネルの位相比較波 (①第1層波, ②第2層波, ③合成波)
  const pCols = [0x38bdf8, 0xfb923c, 0x34d399]
  for (let i = 0; i < 3; i++) {
    const pos = new Float32Array((segs + 1) * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: pCols[i] }))
    phaseWaveGroup.add(line)
    phaseWaveLines.push({ line, geo, pos, segs })
  }
}

function fillWaveSegment(obj, pStart, pEnd, kWave, phaseOff, amp) {
  const dir = new THREE.Vector3().subVectors(pEnd, pStart)
  const len = dir.length()
  if (len < 0.05) return
  dir.normalize()
  const norm = new THREE.Vector3(-dir.y, dir.x, 0)
  for (let i = 0; i <= obj.segs; i++) {
    const dist = (i / obj.segs) * len
    const w = Math.sin(kWave * dist + phaseOff) * amp
    obj.pos[i * 3] = pStart.x + dir.x * dist + norm.x * w
    obj.pos[i * 3 + 1] = pStart.y + dir.y * dist + norm.y * w
    obj.pos[i * 3 + 2] = 0.04
  }
  obj.geo.getAttribute('position').needsUpdate = true
}

function updateWaves(dt) {
  if (isPlaying.value && dt > 0) {
    simTime += Math.min(0.05, dt) * timeScale.value
  }

  const { A, B, in1, out1, in2, out2 } = getGeometryLayout()
  const lambdaVis = Math.max(0.28, (xRayWavelengthNm.value / 0.154) * 0.56)
  const kWave = (2 * Math.PI) / lambdaVis
  const phaseShift = ratio.value * 2 * Math.PI
  const ampIn = 0.11
  const ampOut = 0.045 + 0.095 * reflectionIntensity.value
  const omega = -simTime * 7.5

  if (rayWaveLines.length === 4) {
    // Ray 1 in & out
    const len1 = in1.distanceTo(A)
    fillWaveSegment(rayWaveLines[0], in1, A, kWave, omega, ampIn)
    fillWaveSegment(rayWaveLines[1], A, out1, kWave, omega + kWave * len1, ampOut)
    // Ray 2 in & out (光路差 phaseShift により出射位相がズレる)
    fillWaveSegment(rayWaveLines[2], in2, B, kWave, omega, ampIn)
    fillWaveSegment(rayWaveLines[3], B, out2, kWave, omega + kWave * len1 - phaseShift, ampOut)
  }

  // 右上パネルの位相同期・合成インジケーター (y ≈ 1.5, x: PLOT_X0+0.25 .. PLOT_X0+PLOT_W-0.25)
  if (phaseWaveLines.length === 3) {
    const xStart = PLOT_X0 + 0.25
    const span = PLOT_W - 0.5
    const yBase12 = 1.80
    const yBaseSum = 1.18
    const segs = phaseWaveLines[0].segs

    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const px = xStart + u * span
      const arg = u * Math.PI * 6 - simTime * 6.5
      const y1 = Math.sin(arg) * 0.18
      const y2 = Math.sin(arg - phaseShift) * 0.18
      const ySum = (y1 + y2) * 0.65

      phaseWaveLines[0].pos[i * 3] = px
      phaseWaveLines[0].pos[i * 3 + 1] = yBase12 + y1
      phaseWaveLines[0].pos[i * 3 + 2] = 0.06

      phaseWaveLines[1].pos[i * 3] = px
      phaseWaveLines[1].pos[i * 3 + 1] = yBase12 + y2
      phaseWaveLines[1].pos[i * 3 + 2] = 0.08

      phaseWaveLines[2].pos[i * 3] = px
      phaseWaveLines[2].pos[i * 3 + 1] = yBaseSum + ySum
      phaseWaveLines[2].pos[i * 3 + 2] = 0.08
    }
    phaseWaveLines.forEach(pw => {
      pw.geo.getAttribute('position').needsUpdate = true
    })
  }
}

watch([glancingAngleDeg, latticeSpacingNm, xRayWavelengthNm], () => {
  buildCrystalAndGeometry()
  buildIntensityPlot()
  updateWaves(0)
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0.4, 4.4, 12.2],
    initialTarget: [0.4, 0.05, 0],
    maxDistance: 130,
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        buildCrystalAndGeometry()
        buildIntensityPlot()
      }
      updateWaves(dt)
    }
  })

  crystalGroup = new THREE.Group()
  rightPanelGroup = new THREE.Group()
  rightPanelGroup.rotation.x = -0.55
  rightPanelGroup.position.y = 0.08
  plotGroup = new THREE.Group()
  phaseWaveGroup = new THREE.Group()
  rightPanelGroup.add(plotGroup)
  rightPanelGroup.add(phaseWaveGroup)
  waveGroup = new THREE.Group()
  threeCtx.scene.add(crystalGroup)
  threeCtx.scene.add(rightPanelGroup)
  threeCtx.scene.add(waveGroup)

  lastCamAspect = threeCtx.camera.aspect || 1.7
  buildCrystalAndGeometry()
  buildIntensityPlot()
  initWaveLines()
  updateWaves(0)
  setCameraPreset(activeCam.value, 0)
})

onUnmounted(() => {
  if (threeCtx) {
    threeCtx.dispose()
    threeCtx = null
  }
})
</script>

<style scoped>
.lab-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 10px;
}

.preset-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fde68a;
}

.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 0 0.65rem 0;
  padding: 8px 12px;
  border-radius: 10px;
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 4px 10px;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
}

.speed-label,
.speed-btn-group button {
  white-space: nowrap;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 430px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  margin-bottom: 0.65rem;
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

.three-hud-hint {
  position: absolute;
  bottom: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
  pointer-events: none;
}

.ortho-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.2rem 0 0.8rem 0;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(52, 211, 153, 0.45);
  font-size: 0.75rem;
  font-weight: 600;
  max-width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 345px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 7px;
    font-size: 0.67rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.67rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    font-size: 0.7rem;
    padding: 4px 9px;
  }
}

@media (max-width: 640px) {
  .lab {
    padding: 0.85rem;
  }
  .speed-control-group {
    border-radius: 10px;
    padding: 5px 9px;
    width: 100%;
  }
  .ortho-status-strip {
    justify-content: flex-start;
  }
}
</style>
