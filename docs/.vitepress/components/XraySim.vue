<template>
  <div class="lab" :style="{ '--ac': '#38bdf8', '--ac2': '#f43f5e' }">
    <div class="lab-head">
      <span class="lab-title">⚡ 3D X線の発生（クーリッジ管）＆ スペクトル解析シミュレーター</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ targetData.name }} (Z={{ targetData.Z }}) ｜ V={{ voltageKv }} kV</span>
      </div>
    </div>

    <p class="lab-desc">
      クーリッジ管内の熱電子加速と対陰極ターゲット（Mo / Cu / W）への衝突によるX線発生、および最短波長 λ<sub>0</sub> = <i>hc</i>/(<i>eV</i>)（デュアン＝ハント則）をもつ連続X線と金属固有の特性X線（<i>K</i><sub>α</sub>, <i>K</i><sub>β</sub>）を 3D 同期可視化します。
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
          <i style="background:#f59e0b;box-shadow:0 0 6px #f59e0b"></i>
          陰極フィラメント
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          加速電子ビーム &amp; 最短波長 λ₀
        </span>
        <span class="legend-item">
          <i style="background:#fb7185;box-shadow:0 0 6px #fb7185"></i>
          連続X線 (制動放射)
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          特性X線 Kα / Kβ
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: canExciteCharacteristic ? '#fbbf24' : '#38bdf8', color: '#f8fafc' }">
        最短波長 λ<sub>0</sub> = {{ lambda0_pm.toFixed(1) }} pm ｜
        {{ canExciteCharacteristic
          ? `✓ 特性X線励起中 (${targetKey}: Kα=${targetData.kAlphaPm}pm, Kβ=${targetData.kBetaPm}pm)`
          : `⚠ 電圧不足 (V < ${targetData.minExcitationKv} kV のため連続X線のみ)` }}
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>対陰極ターゲット金属: <strong>{{ targetData.name }} (Z = {{ targetData.Z }})</strong></label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: targetKey === 'Mo' }" @click="targetKey = 'Mo'">モリブデン (Mo)</button>
          <button class="lab-chip" :class="{ on: targetKey === 'Cu' }" @click="targetKey = 'Cu'">銅 (Cu)</button>
          <button class="lab-chip" :class="{ on: targetKey === 'W' }" @click="targetKey = 'W'">タングステン (W)</button>
        </div>
        <div class="lab-note">金属固有の Kα/Kβ 波長位置は電圧 V を変えても一切動きません</div>
      </div>

      <div class="lab-ctrl">
        <label>管電圧（加速電圧）<i>V</i>: <strong>{{ voltageKv.toFixed(0) }} kV</strong></label>
        <input type="range" v-model.number="voltageKv" min="20" max="80" step="2" />
        <div class="lab-note">電圧 V を上げると最短波長 λ₀ が短波長側へシフトします (λ₀ ∝ 1/V)</div>
      </div>

      <div class="lab-ctrl">
        <label>フィラメント電流（電子流量）: <strong>{{ tubeCurrentMa.toFixed(0) }} mA</strong></label>
        <input type="range" v-model.number="tubeCurrentMa" min="5" max="30" step="1" />
        <div class="lab-note">電流を増やすと熱電子が増え、全体のX線強度が増大します</div>
      </div>
    </div>

    <div class="lab-btns" style="margin-bottom: 0.9rem;">
      <button class="lab-btn" @click="resetDefaults">
        🔄 デフォルト設定に戻す (Mo / 45 kV / 15 mA)
      </button>
    </div>

    <!-- 物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">最短波長 λ<sub>0</sub></div>
        <div class="v" style="color:#38bdf8">{{ lambda0_pm.toFixed(1) }} <small>pm</small></div>
        <div class="f"><span class="frac"><span class="num">hc</span><span class="den">eV</span></span> (デュアン=ハント則)</div>
      </div>

      <div class="lab-stat">
        <div class="k">電子の最大運動エネルギー</div>
        <div class="v">{{ voltageKv.toFixed(0) }} <small>keV</small></div>
        <div class="f">E = eV (100% 光子化で λ₀)</div>
      </div>

      <div class="lab-stat">
        <div class="k">特性X線 K<sub>α</sub> 波長</div>
        <div class="v" style="color:#fbbf24">{{ targetData.kAlphaPm }} <small>pm</small></div>
        <div class="f">L殻 → K殻 遷移 (固有波長)</div>
      </div>

      <div class="lab-stat">
        <div class="k">特性X線 K<sub>β</sub> 波長</div>
        <div class="v" style="color:#34d399">{{ targetData.kBetaPm }} <small>pm</small></div>
        <div class="f">M殻 → K殻 遷移 (Kαより短波長)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const voltageKv = ref(45)
const tubeCurrentMa = ref(15)
const targetKey = ref('Mo')

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

const targets = {
  Mo: { name: 'モリブデン (Mo)', Z: 42, kAlphaPm: 71.1, kBetaPm: 63.2, minExcitationKv: 20, color: 0x93c5fd },
  Cu: { name: '銅 (Cu)', Z: 29, kAlphaPm: 154.1, kBetaPm: 139.2, minExcitationKv: 9, color: 0xf59e0b },
  W: { name: 'タングステン (W)', Z: 74, kAlphaPm: 21.0, kBetaPm: 18.4, minExcitationKv: 69.5, color: 0xcbd5e1 }
}

const targetData = computed(() => targets[targetKey.value])
const lambda0_pm = computed(() => 1240 / voltageKv.value)
const canExciteCharacteristic = computed(() => voltageKv.value >= targetData.value.minExcitationKv)

function resetDefaults() {
  voltageKv.value = 45
  tubeCurrentMa.value = 15
  targetKey.value = 'Mo'
}

const threeContainer = ref(null)
let threeCtx = null
let tubeGroup = null
let spectrumGroup = null
let dynamicGroup = null
let lastCamAspect = 0

// 動的オブジェクト
const electrons = []
const xrayWaves = []
let hotspotMesh = null
let filamentMat = null
let xrayConeMat = null
let simTime = 0

// レイアウト定数
const TUBE_CX = -2.65
const CATHODE_X = -4.25
const ANODE_X = -1.45
const SPEC_X0 = 1.05
const SPEC_W = 4.35
const SPEC_Y0 = -1.65
const SPEC_H = 3.65

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
    threeCtx.moveCameraTo([0.35 * s, 4.3 * s, 12.6 * s], [0.35, 0.05, 0], duration, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0.35, 0.1, 36.5 * s], [0.35, 0.05, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0.35, 37.5 * s, 0.08], [0.35, 0, 0], duration, 14)
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

function buildCoolidgeTube() {
  if (!tubeGroup) return
  clearGroup(tubeGroup)

  const narrow = isNarrowViewport()
  const floorY = -2.35

  // 1. 実験室床グリッド
  const grid = new THREE.GridHelper(17, 17, 0x1e293b, 0x0f172a)
  grid.position.set(0.35, floorY, 0)
  tubeGroup.add(grid)

  // 2. ガラス真空管 (手前側を切り欠いた3/4開放カットアウェイ)
  const glassR = 1.25
  const tubeLen = 4.3
  const glassGeo = new THREE.CylinderGeometry(glassR, glassR, tubeLen, 36, 1, true, Math.PI * 0.25, Math.PI * 1.38)
  glassGeo.rotateZ(Math.PI / 2)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.20,
    roughness: 0.1,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const glassMesh = new THREE.Mesh(glassGeo, glassMat)
  glassMesh.position.set(TUBE_CX, 0.35, 0)
  glassMesh.renderOrder = 4
  tubeGroup.add(glassMesh)

  // 真空管金属フランジリング
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.28 })
  for (const rx of [TUBE_CX - tubeLen / 2, TUBE_CX + tubeLen / 2]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(glassR, 0.055, 12, 36), rimMat)
    rim.rotation.y = Math.PI / 2
    rim.position.set(rx, 0.35, 0)
    tubeGroup.add(rim)
  }

  // 3. 陰極フィラメント＆ウェネルト集束カップ (左側)
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.52, 0.55, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.28, side: THREE.DoubleSide })
  )
  cup.rotation.z = Math.PI / 2
  cup.position.set(CATHODE_X - 0.18, 0.35, 0)
  tubeGroup.add(cup)

  const helixPts = []
  for (let i = 0; i <= 40; i++) {
    const u = i / 40
    const ang = u * Math.PI * 6
    helixPts.push(new THREE.Vector3(CATHODE_X + 0.05, 0.35 + (u - 0.5) * 0.44, Math.sin(ang) * 0.16))
  }
  const glowFactor = 0.5 + (tubeCurrentMa.value / 30) * 0.9
  filamentMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf97316,
    emissiveIntensity: glowFactor,
    roughness: 0.2
  })
  const filamentMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), 40, 0.036, 8, false),
    filamentMat
  )
  tubeGroup.add(filamentMesh)

  // 4. 対陰極ターゲットブロック（45°斜めカット面）＋ 銅冷却フィン
  const anodeStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 1.45, 24),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.24 })
  )
  anodeStem.rotation.z = Math.PI / 2
  anodeStem.position.set(ANODE_X + 0.72, 0.35, 0)
  tubeGroup.add(anodeStem)

  // 45°傾斜ターゲットプレート (電子を当てて下向きにX線放射)
  const targetPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.98, 0.72),
    new THREE.MeshStandardMaterial({
      color: targetData.value.color,
      metalness: 0.85,
      roughness: 0.22
    })
  )
  targetPlate.rotation.z = Math.PI / 4
  targetPlate.position.set(ANODE_X, 0.35, 0)
  tubeGroup.add(targetPlate)

  // 衝突ホットスポット
  hotspotMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  )
  hotspotMesh.position.set(ANODE_X - 0.04, 0.35, 0)
  tubeGroup.add(hotspotMesh)

  // 外部冷却フィン (管右端の放熱フィン 5枚)
  const finMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.75, roughness: 0.32 })
  for (let f = 0; f < 5; f++) {
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 24), finMat)
    fin.rotation.z = Math.PI / 2
    fin.position.set(TUBE_CX + tubeLen / 2 + 0.14 + f * 0.15, 0.35, 0)
    tubeGroup.add(fin)
  }

  // 5. 放出X線コーン（下向き放射）
  const coneGeo = new THREE.ConeGeometry(0.95, 2.2, 28, 1, true)
  xrayConeMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.14 + (tubeCurrentMa.value / 30) * 0.16,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const xrayCone = new THREE.Mesh(coneGeo, xrayConeMat)
  xrayCone.position.set(ANODE_X - 0.05, 0.35 - 1.1, 0)
  tubeGroup.add(xrayCone)

  // ラベル群 (Z/Yで衝突分離)
  const tubeTitle = createTextSprite(narrow ? 'クーリッジX線管' : `クーリッジX線管 (V = ${voltageKv.value} kV)`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 28,
    scale: getSpriteScale(0.40)
  })
  tubeTitle.position.set(TUBE_CX, 2.48, -1.35)
  tubeGroup.add(tubeTitle)

  const cathLbl = createTextSprite('陰極 (-)', {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 26,
    scale: getSpriteScale(0.34)
  })
  cathLbl.position.set(CATHODE_X - 0.15, 1.75, 0.72)
  tubeGroup.add(cathLbl)

  const anodLbl = createTextSprite(`対陰極 ${targetKey.value} (+)`, {
    color: '#e2e8f0',
    borderColor: '#94a3b8',
    fontSize: 26,
    scale: getSpriteScale(0.34)
  })
  anodLbl.position.set(ANODE_X + 0.45, 1.55, 0.55)
  tubeGroup.add(anodLbl)

  const finLbl = createTextSprite('冷却フィン', {
    color: '#fdba74',
    borderColor: '#d97706',
    fontSize: 24,
    scale: getSpriteScale(0.30)
  })
  finLbl.position.set(TUBE_CX + tubeLen / 2 + 0.68, -0.95, -0.65)
  tubeGroup.add(finLbl)

  const xrayLbl = createTextSprite('X線放射コーン', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 26,
    scale: getSpriteScale(0.34)
  })
  xrayLbl.position.set(ANODE_X - 0.65, -2.06, 1.45)
  tubeGroup.add(xrayLbl)
}

function buildSpectrumBoard() {
  if (!spectrumGroup) return
  clearGroup(spectrumGroup)

  const narrow = isNarrowViewport()

  // 背景ボード (左側に余裕を持たせ ↑強度I ラベルがピークと干渉しないように配置)
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(SPEC_W + 1.15, SPEC_H + 1.05, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75, metalness: 0.2 })
  )
  board.position.set(SPEC_X0 + SPEC_W / 2 - 0.18, SPEC_Y0 + SPEC_H / 2 + 0.02, -0.14)
  spectrumGroup.add(board)

  // 座標軸 (X: 0..200 pm, Y: 強度 I)
  const axisMat = new THREE.LineBasicMaterial({ color: 0x64748b })
  spectrumGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(SPEC_X0, SPEC_Y0 + SPEC_H, 0),
        new THREE.Vector3(SPEC_X0, SPEC_Y0, 0),
        new THREE.Vector3(SPEC_X0 + SPEC_W, SPEC_Y0, 0)
      ]),
      axisMat
    )
  )

  const maxLam = 200
  const pmToX = lam => SPEC_X0 + (lam / maxLam) * SPEC_W
  const l0 = lambda0_pm.value
  const l0X = pmToX(l0)

  // 最短波長 λ0 垂直マーカーライン (シアン)
  const l0Line = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, SPEC_H, 8),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  l0Line.position.set(l0X, SPEC_Y0 + SPEC_H / 2, 0.04)
  spectrumGroup.add(l0Line)

  const l0Lbl = createTextSprite(`λ₀=${l0.toFixed(0)}pm`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 25,
    scale: getSpriteScale(0.32)
  })
  l0Lbl.position.set(Math.max(SPEC_X0 + 0.42, l0X), SPEC_Y0 - 0.48, 0.28)
  spectrumGroup.add(l0Lbl)

  // スペクトル曲線 I(λ) 3Dチューブ + 塗りつぶしリボン
  const intensityScale = (tubeCurrentMa.value / 15) * Math.pow(voltageKv.value / 50, 1.5)
  const ka = targetData.value.kAlphaPm
  const kb = targetData.value.kBetaPm
  const canExcite = canExciteCharacteristic.value

  const samples = 160
  const curvePts = []
  const ribPos = new Float32Array((samples + 1) * 2 * 3)
  const ribIdx = []

  let maxKaY = SPEC_Y0
  let maxKbY = SPEC_Y0

  for (let i = 0; i <= samples; i++) {
    const lam = (i / samples) * maxLam
    let val = 0
    if (lam >= l0) {
      const dL = lam - l0
      val = 0.56 * intensityScale * (dL / 34) * Math.exp(-dL / 44)
    }
    if (canExcite) {
      if (Math.abs(lam - ka) < 7) {
        val += 0.85 * intensityScale * Math.exp(-Math.pow((lam - ka) / 1.4, 2))
      }
      if (Math.abs(lam - kb) < 6) {
        val += 0.48 * intensityScale * Math.exp(-Math.pow((lam - kb) / 1.1, 2))
      }
    }

    const px = pmToX(lam)
    const py = SPEC_Y0 + Math.min(SPEC_H - 0.12, val * SPEC_H * 0.72)
    curvePts.push(new THREE.Vector3(px, py, 0.06))

    if (Math.abs(lam - ka) < 1.5 && py > maxKaY) maxKaY = py
    if (Math.abs(lam - kb) < 1.5 && py > maxKbY) maxKbY = py

    const vIdx = i * 2
    ribPos[vIdx * 3] = px
    ribPos[vIdx * 3 + 1] = SPEC_Y0
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
  spectrumGroup.add(
    new THREE.Mesh(
      ribGeo,
      new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
  )

  const specTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 160, 0.038, 8, false),
    new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0xef4444,
      emissiveIntensity: 0.75
    })
  )
  spectrumGroup.add(specTube)

  // 特性X線 Kα, Kβ ピークハイライト柱 & ラベル
  if (canExcite) {
    const kaX = pmToX(ka)
    const kbX = pmToX(kb)

    const kaBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, Math.max(0.1, maxKaY - SPEC_Y0), 10),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    )
    kaBar.position.set(kaX, (SPEC_Y0 + maxKaY) / 2, 0.08)
    spectrumGroup.add(kaBar)

    const kbBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, Math.max(0.1, maxKbY - SPEC_Y0), 10),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    )
    kbBar.position.set(kbX, (SPEC_Y0 + maxKbY) / 2, 0.08)
    spectrumGroup.add(kbBar)

    const closePeaks = ka - kb < 10
    const saturatedTop = closePeaks && maxKbY >= maxKaY - 0.25
    const kaLbl = createTextSprite('Kα', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 24, scale: getSpriteScale(0.29) })
    kaLbl.position.set(
      kaX + (saturatedTop ? 0.46 : 0.28),
      saturatedTop
        ? Math.min(SPEC_Y0 + SPEC_H - 0.42, maxKaY - 0.15)
        : Math.min(SPEC_Y0 + SPEC_H - 0.14, maxKaY + 0.22),
      0.24
    )
    const kbLbl = createTextSprite('Kβ', { color: '#6ee7b7', borderColor: '#34d399', fontSize: 24, scale: getSpriteScale(0.29) })
    kbLbl.position.set(
      kbX + (saturatedTop ? 0.22 : -0.28),
      saturatedTop
        ? Math.min(SPEC_Y0 + SPEC_H + 0.04, maxKbY + 0.36)
        : Math.min(SPEC_Y0 + SPEC_H - 0.10, maxKbY + 0.26),
      -0.18
    )
    spectrumGroup.add(kaLbl, kbLbl)
  }

  // グラフタイトル & 軸ラベル
  const specTitle = createTextSprite(narrow ? 'X線スペクトル I(λ)' : 'X線強度スペクトル I(λ)', {
    color: '#f8fafc',
    borderColor: '#fb7185',
    fontSize: 28,
    scale: getSpriteScale(0.38)
  })
  specTitle.position.set(SPEC_X0 + SPEC_W / 2 + 0.1, SPEC_Y0 + SPEC_H + 0.42, 0.18)
  spectrumGroup.add(specTitle)

  const iAxisLbl = createTextSprite('↑ 強度 I', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.4)',
    fontSize: 23,
    scale: getSpriteScale(0.28)
  })
  iAxisLbl.position.set(SPEC_X0 - 0.32, SPEC_Y0 + SPEC_H - 0.22, 0.22)
  const lamAxisLbl = createTextSprite(narrow ? 'λ [pm] →' : '波長 λ [pm] →', {
    color: '#cbd5e1',
    borderColor: 'rgba(148,163,184,0.4)',
    fontSize: 23,
    scale: getSpriteScale(0.28)
  })
  lamAxisLbl.position.set(SPEC_X0 + SPEC_W - 0.35, SPEC_Y0 - 0.48, -0.22)
  spectrumGroup.add(iAxisLbl, lamAxisLbl)
}

function initDynamicParticles() {
  if (!dynamicGroup) return
  clearGroup(dynamicGroup)
  electrons.length = 0
  xrayWaves.length = 0

  const eGeo = new THREE.SphereGeometry(0.068, 12, 12)
  const eMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.95
  })
  for (let i = 0; i < 14; i++) {
    const mesh = new THREE.Mesh(eGeo, eMat)
    dynamicGroup.add(mesh)
    electrons.push({
      mesh,
      phase: i / 14,
      yJit: (Math.sin(i * 2.1) * 0.14),
      zJit: (Math.cos(i * 1.7) * 0.14)
    })
  }

  // 下向きに放射される X線波束 (3本の正弦波ライン)
  for (let r = 0; r < 3; r++) {
    const segs = 28
    const pos = new Float32Array((segs + 1) * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.LineBasicMaterial({
      color: r === 1 ? 0xfbbf24 : 0xf43f5e,
      transparent: true,
      opacity: 0.92
    })
    const line = new THREE.Line(geo, mat)
    dynamicGroup.add(line)
    xrayWaves.push({ line, geo, pos, segs, angleOff: (r - 1) * 0.26 })
  }
}

function updateDynamic(dt) {
  if (isPlaying.value && dt > 0) {
    simTime += Math.min(0.05, dt) * timeScale.value
  }

  const speed = 0.75 + Math.sqrt(voltageKv.value / 45) * 0.85
  const activeCount = Math.max(4, Math.round((tubeCurrentMa.value / 30) * electrons.length))
  const span = (ANODE_X - 0.12) - (CATHODE_X + 0.12)

  electrons.forEach((e, idx) => {
    if (idx >= activeCount) {
      e.mesh.visible = false
      return
    }
    e.mesh.visible = true
    const t = (e.phase + simTime * speed) % 1
    // 加速感: t^1.45 で陰極→陽極へ加速
    const accelT = Math.pow(t, 1.45)
    e.mesh.position.set(
      CATHODE_X + 0.12 + accelT * span,
      0.35 + e.yJit * (1 - accelT * 0.65),
      e.zJit * (1 - accelT * 0.65)
    )
  })

  if (hotspotMesh) {
    const s = 0.92 + 0.22 * Math.sin(simTime * 14)
    hotspotMesh.scale.set(s, s, s)
  }

  // 下向き X線波束アニメーション
  xrayWaves.forEach(w => {
    const startX = ANODE_X - 0.05
    const startY = 0.30
    const len = 2.05
    const dx = Math.sin(w.angleOff)
    const dy = -Math.cos(w.angleOff)
    const nx = dy
    const ny = -dx
    const kWave = 14 + (voltageKv.value / 80) * 10
    for (let i = 0; i <= w.segs; i++) {
      const u = i / w.segs
      const dist = u * len
      const amp = 0.075 * Math.sin(u * Math.PI) * Math.sin(dist * kWave - simTime * 12)
      w.pos[i * 3] = startX + dx * dist + nx * amp
      w.pos[i * 3 + 1] = startY + dy * dist + ny * amp
      w.pos[i * 3 + 2] = 0
    }
    w.geo.getAttribute('position').needsUpdate = true
  })
}

watch([voltageKv, tubeCurrentMa, targetKey], () => {
  buildCoolidgeTube()
  buildSpectrumBoard()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0.35, 4.3, 12.6],
    initialTarget: [0.35, 0.05, 0],
    maxDistance: 130,
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        buildCoolidgeTube()
        buildSpectrumBoard()
      }
      updateDynamic(dt)
    }
  })

  tubeGroup = new THREE.Group()
  spectrumGroup = new THREE.Group()
  spectrumGroup.rotation.x = -0.55
  spectrumGroup.position.y = 0.12
  dynamicGroup = new THREE.Group()
  threeCtx.scene.add(tubeGroup)
  threeCtx.scene.add(spectrumGroup)
  threeCtx.scene.add(dynamicGroup)

  lastCamAspect = threeCtx.camera.aspect || 1.7
  buildCoolidgeTube()
  buildSpectrumBoard()
  initDynamicParticles()
  updateDynamic(0)
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
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 10px;
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
  border: 1px solid rgba(56, 189, 248, 0.45);
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
