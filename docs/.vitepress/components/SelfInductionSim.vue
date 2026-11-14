<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#c084fc">
    <div class="lab-head">
      <span class="lab-title">⚡ 3D 自己誘導とコイルの過渡現象（RL回路・ネオン放電）</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge" :style="{ '--ac': isSwitchClosed ? '#38bdf8' : '#f43f5e' }">
          {{ isSwitchClosed ? '⚡ スイッチ ON (通電中)' : '🔌 スイッチ OFF (遮断中)' }}
        </span>
      </div>
    </div>

    <p class="lab-desc">
      コイルの自己誘導起電力 <i>V</i><sub>L</sub> = -<i>L</i> (d<i>I</i>/d<i>t</i>) による電流の慣性。スイッチ投入時の緩やかな電流立ち上がり（ランプ遅延点灯）、遮断時に生じる高圧逆起電力スパーク（ネオン放電）、およびコイルに蓄えられる磁気エネルギー <i>U</i> = 1/2 <i>L</i><i>I</i><sup>2</sup> を 3D 回路とオシロスコープで体感します。
    </p>

    <!-- カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 真上
        </button>
      </div>
    </div>

    <!-- 再生・速度コントロールバー -->
    <div class="playback-bar">
      <button
        class="lab-btn primary"
        @click="togglePlay"
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
      <button class="lab-btn" @click="resetCircuit" style="padding: 5px 12px; font-size: 0.82rem;">
        🔄 初期化 (t=0)
      </button>
      <button
        class="lab-btn lab-btn-pri"
        @click="toggleSwitch"
        :style="{ background: isSwitchClosed ? '#ef4444' : '#0284c7', borderColor: isSwitchClosed ? '#f87171' : '#38bdf8' }"
      >
        {{ isSwitchClosed ? '🔌 スイッチを切る (OFF)' : '⚡ スイッチを入れる (ON)' }}
      </button>
    </div>

    <!-- Three.js 3D ステージ -->
    <div class="three-stage three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          鉄芯チョークコイル L
        </span>
        <span class="legend-item">
          <i style="background:#f97316;box-shadow:0 0 6px #f97316"></i>
          ネオン放電ランプ
        </span>
        <span class="legend-item">
          <i style="background:#c084fc;box-shadow:0 0 6px #c084fc"></i>
          磁気エネルギー U_m ゲージ
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          電流 I(t) 粒子流
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: isSparking ? '#f43f5e' : '#38bdf8', color: '#f8fafc' }">
        過渡方程式: <i>L</i> (d<i>I</i>/d<i>t</i>) + <i>RI</i> = <i>E</i> ｜ 時定数 τ = <i>L</i>/<i>R</i> = {{ timeConstantSec.toFixed(2) }} 秒 ｜
        逆起電力 <i>V</i><sub>L</sub> = {{ backEmfV.toFixed(2) }} V
        <template v-if="isSparking"> ⚡ 高圧誘導放電スパーク発生中！</template>
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>自己インダクタンス <i>L</i>: <strong>{{ inductanceH.toFixed(1) }} H</strong></label>
        <input type="range" v-model.number="inductanceH" min="0.5" max="5.0" step="0.5" />
        <div class="lab-note">コイルのインダクタンスが大きいほど電流の変化が遅れ、時定数 τ が長くなります</div>
      </div>

      <div class="lab-ctrl">
        <label>回路の抵抗 <i>R</i>: <strong>{{ resistanceOhm }} Ω</strong></label>
        <input type="range" v-model.number="resistanceOhm" min="2" max="20" step="1" />
      </div>

      <div class="lab-ctrl">
        <label>直流電源の電圧 <i>E</i>: <strong>{{ voltageE }} V</strong></label>
        <input type="range" v-model.number="voltageE" min="5" max="24" step="1" />
        <div class="lab-note">定常電流 <i>I</i><sub>max</sub> = <i>E</i> / <i>R</i> = {{ (voltageE / resistanceOhm).toFixed(2) }} A</div>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">現在の電流 <i>I(t)</i></div>
        <div class="v" style="color:#c084fc">{{ currentI.toFixed(2) }} <small>A</small></div>
        <div class="f">定常電流: {{ maxCurrent.toFixed(2) }} A</div>
      </div>

      <div class="lab-stat">
        <div class="k">回路の時定数 τ</div>
        <div class="v" style="color:#38bdf8">{{ timeConstantSec.toFixed(2) }} <small>秒</small></div>
        <div class="f">τ = L / R（63.2% 到達時間）</div>
      </div>

      <div class="lab-stat">
        <div class="k">コイルの逆起電力 <i>V</i><sub>L</sub></div>
        <div class="v" :style="{ color: Math.abs(backEmfV) > 1.0 ? '#fbbf24' : '#94a3b8' }">
          {{ backEmfV.toFixed(2) }} <small>V</small>
        </div>
        <div class="f"><i>V</i><sub>L</sub> = -<i>L</i> (d<i>I</i>/d<i>t</i>)</div>
      </div>

      <div class="lab-stat">
        <div class="k">磁気エネルギー <i>U</i><sub>m</sub></div>
        <div class="v" style="color:#10b981">{{ magneticEnergyJ.toFixed(2) }} <small>J</small></div>
        <div class="f"><i>U</i> = 1/2 <i>L</i> <i>I</i><sup>2</sup></div>
      </div>

      <div class="lab-stat">
        <div class="k">ネオンランプ状態</div>
        <div class="v" :style="{ color: lampBrightness > 0.1 ? '#f97316' : '#64748b' }">
          {{ isSparking ? '💥 遮断放電フラッシュ！' : (lampBrightness > 0.05 ? '💡 点灯中 (' + Math.round(lampBrightness * 100) + '%)' : '⚪ 消灯') }}
        </div>
        <div class="f">{{ isSwitchClosed ? '電流上昇に伴い遅延点灯' : '高圧誘導起電力で瞬間発光' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">スイッチ接点電圧</div>
        <div class="v" style="color:#f43f5e">{{ switchVoltage.toFixed(1) }} <small>V</small></div>
        <div class="f">遮断時に逆起電力と電源電圧が直列重畳</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

// 物理パラメータ
const inductanceH = ref(2.0)
const resistanceOhm = ref(5)
const voltageE = ref(10)
const isSwitchClosed = ref(true)

const currentI = ref(0)
const backEmfV = ref(0)
const lampBrightness = ref(0)
const switchVoltage = ref(0)
const isSparking = ref(false)

const timeConstantSec = computed(() => inductanceH.value / resistanceOhm.value)
const maxCurrent = computed(() => voltageE.value / resistanceOhm.value)
const magneticEnergyJ = computed(() => 0.5 * inductanceH.value * (currentI.value ** 2))

// Three.js 関連参照
const threeContainer = ref(null)
let threeCtx = null
let sceneGroup = null

// 3D コンポーネント参照
let knifeBladeMesh = null
let chokeCoilMesh = null
let coreFluxMesh = null
let energyBarMesh = null
let energyBarLabel = null
let neonBulbMesh = null
let neonGlowLight = null
let sparkGroup = null
let backEmfArrow = null
let electronSystem = null

// オシロスコープ波形プレーン
let oscCanvas = null
let oscTexture = null
let oscCtx = null
const oscHistory = []

let sparkTimer = 0

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function toggleSwitch() {
  if (isSwitchClosed.value) {
    // スイッチを切る (OFF)
    // 遮断時の急激な電流変化 -> 巨大な高電圧スパーク
    isSwitchClosed.value = false
    const initialDropRate = currentI.value / 0.08 // 急速減衰
    backEmfV.value = inductanceH.value * initialDropRate
    switchVoltage.value = voltageE.value + backEmfV.value

    if (currentI.value > 0.2) {
      isSparking.value = true
      sparkTimer = 0.45
      lampBrightness.value = 1.0 // ネオンランプフラッシュ
    }
  } else {
    // スイッチを入れる (ON)
    isSwitchClosed.value = true
    isSparking.value = false
    switchVoltage.value = 0
  }
}

function resetCircuit() {
  currentI.value = 0
  backEmfV.value = isSwitchClosed.value ? -voltageE.value : 0
  lampBrightness.value = 0
  switchVoltage.value = 0
  isSparking.value = false
  oscHistory.length = 0
}

function setCameraPreset(preset, dur = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return

  const isNarrow = (threeCtx.camera?.aspect || 1.7) < 1.35
  const mult = isNarrow ? 1.35 : 1.0

  if (preset === '3d') {
    threeCtx.moveCameraTo([0, 9.5 * mult, 14.5 * mult], [0, 0, 0], dur, 42)
  } else if (preset === 'front') {
    threeCtx.moveCameraTo([0, 1.0, 32 * mult], [0, 0.2, 0], dur, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 39 * mult, 0.01], [0, 0, 0], dur, 14)
  }
}

// ----------------------------------------------------
// 3D シーン構築
// ----------------------------------------------------
function build3DScene() {
  if (!threeCtx) return
  if (sceneGroup) threeCtx.scene.remove(sceneGroup)

  sceneGroup = new THREE.Group()
  threeCtx.scene.add(sceneGroup)

  // 1. 基板テーブル
  const boardGeo = new THREE.BoxGeometry(14, 0.35, 9.5)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x0a101f,
    metalness: 0.2,
    roughness: 0.8
  })
  const board = new THREE.Mesh(boardGeo, boardMat)
  board.position.y = -0.18
  sceneGroup.add(board)

  const grid = new THREE.GridHelper(13, 13, 0x1e293b, 0x0f172a)
  grid.position.y = 0.01
  sceneGroup.add(grid)

  // 回路寸法設定
  // 矩形ループ: x = -4.5 to +4.5, z = -2.5 to +2.5
  const cLeft = -4.2
  const cRight = 4.2
  const cTop = -2.2
  const cBot = 2.2
  const wireR = 0.06

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.2
  })

  // 配線パイプ構築
  function addWire(p1, p2) {
    const v1 = new THREE.Vector3(...p1)
    const v2 = new THREE.Vector3(...p2)
    const len = v1.distanceTo(v2)
    const geo = new THREE.CylinderGeometry(wireR, wireR, len, 12)
    geo.translate(0, len / 2, 0)
    geo.rotateX(Math.PI / 2)
    const mesh = new THREE.Mesh(geo, wireMat)
    mesh.position.copy(v1)
    mesh.lookAt(v2)
    sceneGroup.add(mesh)
  }

  // 配線レイアウト
  // 下辺: バッテリー
  addWire([cLeft, 0.1, cBot], [-1.0, 0.1, cBot])
  addWire([1.0, 0.1, cBot], [cRight, 0.1, cBot])

  // 左辺: 上下配線
  addWire([cLeft, 0.1, cBot], [cLeft, 0.1, cTop])

  // 上辺: ナイフスイッチ & 抵抗
  addWire([cLeft, 0.1, cTop], [-2.5, 0.1, cTop])
  addWire([-1.0, 0.1, cTop], [0.5, 0.1, cTop])
  addWire([2.2, 0.1, cTop], [cRight, 0.1, cTop])

  // 右辺: チョークコイル & ネオンランプ
  addWire([cRight, 0.1, cTop], [cRight, 0.1, -1.0])
  addWire([cRight, 0.1, 1.0], [cRight, 0.1, cBot])

  // 2. 直流電源（DC バッテリー E）
  const battGroup = new THREE.Group()
  battGroup.position.set(0, 0.45, cBot)

  const battGeo = new THREE.BoxGeometry(1.6, 0.7, 0.9)
  const battMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.5 })
  battGroup.add(new THREE.Mesh(battGeo, battMat))

  // プラス端子 (赤)
  const posTermGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16)
  const posTermMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 })
  const posTerm = new THREE.Mesh(posTermGeo, posTermMat)
  posTerm.position.set(0.5, 0.45, 0)
  battGroup.add(posTerm)

  // マイナス端子 (青/黒)
  const negTermMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6 })
  const negTerm = new THREE.Mesh(posTermGeo, negTermMat)
  negTerm.position.set(-0.5, 0.45, 0)
  battGroup.add(negTerm)

  const battLabel = createTextSprite(`電源 E (${voltageE.value}V)`, { color: '#34d399', fontSize: 30, scale: 0.45 })
  battLabel.position.set(0, 1.0, 0)
  battGroup.add(battLabel)

  sceneGroup.add(battGroup)

  // 3. ナイフスイッチ (Knife Switch)
  const swGroup = new THREE.Group()
  swGroup.position.set(-1.75, 0.15, cTop)

  // 台座
  const swBaseGeo = new THREE.BoxGeometry(1.4, 0.18, 0.7)
  const swBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
  swGroup.add(new THREE.Mesh(swBaseGeo, swBaseMat))

  // 端子金具
  const hingeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.25, 12)
  hingeGeo.rotateZ(Math.PI / 2)
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
  const hingeMesh = new THREE.Mesh(hingeGeo, brassMat)
  hingeMesh.position.set(-0.5, 0.2, 0)
  swGroup.add(hingeMesh)

  const contactMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.25), brassMat)
  contactMesh.position.set(0.5, 0.2, 0)
  swGroup.add(contactMesh)

  // 動くレバー刃 (Knife Blade)
  const bladeGroup = new THREE.Group()
  bladeGroup.position.set(-0.5, 0.2, 0)

  const bladeGeo = new THREE.BoxGeometry(1.0, 0.12, 0.08)
  bladeGeo.translate(0.5, 0, 0)
  const bladeMesh = new THREE.Mesh(bladeGeo, brassMat)
  bladeGroup.add(bladeMesh)

  // 絶縁ハンドル
  const handleGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.4, 12)
  handleGeo.rotateZ(Math.PI / 2)
  handleGeo.translate(1.0, 0, 0)
  const handleMesh = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }))
  bladeGroup.add(handleMesh)

  swGroup.add(bladeGroup)
  knifeBladeMesh = bladeGroup

  const swLabel = createTextSprite('スイッチ S', { color: '#38bdf8', fontSize: 30, scale: 0.42 })
  swLabel.position.set(0, 1.0, 0)
  swGroup.add(swLabel)

  sceneGroup.add(swGroup)

  // スパーク放電エフェクトグループ
  sparkGroup = new THREE.Group()
  sparkGroup.position.set(-1.25, 0.35, cTop)
  sparkGroup.visible = false
  sceneGroup.add(sparkGroup)

  // スパーク光線
  for (let s = 0; s < 4; s++) {
    const spPts = [new THREE.Vector3(0, 0, 0)]
    for (let k = 1; k <= 4; k++) {
      spPts.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ))
    }
    const spGeo = new THREE.BufferGeometry().setFromPoints(spPts)
    const spMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    sparkGroup.add(new THREE.Line(spGeo, spMat))
  }
  const sparkFlash = new THREE.PointLight(0x60a5fa, 4, 3)
  sparkGroup.add(sparkFlash)

  // 4. 抵抗 R (Ceramic Resistor)
  const resGroup = new THREE.Group()
  resGroup.position.set(1.35, 0.35, cTop)

  const resBodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.4, 20)
  resBodyGeo.rotateZ(Math.PI / 2)
  const resBodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
  resGroup.add(new THREE.Mesh(resBodyGeo, resBodyMat))

  // カラーコード帯
  const bandGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 20)
  bandGeo.rotateZ(Math.PI / 2)
  const b1 = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
  b1.position.x = -0.35
  const b2 = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }))
  b2.position.x = 0
  const b3 = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }))
  b3.position.x = 0.35
  resGroup.add(b1, b2, b3)

  const rLabel = createTextSprite(`抵抗 R (${resistanceOhm.value}Ω)`, { color: '#fbbf24', fontSize: 30, scale: 0.45 })
  rLabel.position.set(0, 0.85, 0)
  resGroup.add(rLabel)

  sceneGroup.add(resGroup)

  // 5. 鉄芯チョークコイル (Iron-Core Choke Coil)
  const coilGroup = new THREE.Group()
  coilGroup.position.set(cRight, 0.5, 0)

  // 積層鉄芯 (Iron Core)
  const coreGeo = new THREE.CylinderGeometry(0.48, 0.48, 2.2, 24)
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.35 })
  const coreMesh = new THREE.Mesh(coreGeo, coreMat)
  coilGroup.add(coreMesh)

  // コイル巻線スパイラル
  const cTurns = 12
  const cPts = []
  for (let i = 0; i <= cTurns * 28; i++) {
    const t = i / (cTurns * 28)
    const y = (t - 0.5) * 1.9
    const ang = t * Math.PI * 2 * cTurns
    const x = Math.sin(ang) * 0.72
    const z = Math.cos(ang) * 0.72
    cPts.push(new THREE.Vector3(x, y, z))
  }
  const cCurve = new THREE.CatmullRomCurve3(cPts)
  const cGeo = new THREE.TubeGeometry(cCurve, 160, 0.08, 8, false)
  const cMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0x78350f,
    emissiveIntensity: 0.2
  })
  chokeCoilMesh = new THREE.Mesh(cGeo, cMat)
  coilGroup.add(chokeCoilMesh)

  // 鉄芯内部の磁束発光 (Core Magnetic Flux Glow)
  const fluxGeo = new THREE.CylinderGeometry(0.52, 0.52, 2.0, 16)
  const fluxMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
    wireframe: true
  })
  coreFluxMesh = new THREE.Mesh(fluxGeo, fluxMat)
  coilGroup.add(coreFluxMesh)

  const lLabel = createTextSprite(`チョークコイル L (${inductanceH.value}H)`, { color: '#fbbf24', fontSize: 32, scale: 0.48 })
  lLabel.position.set(0, 1.5, 0)
  coilGroup.add(lLabel)

  // 逆起電力ベクトル矢印
  backEmfArrow = createVectorArrow3D({ color: 0xef4444, shaftRadius: 0.08, headRadius: 0.2, headLength: 0.5 })
  coilGroup.add(backEmfArrow)

  sceneGroup.add(coilGroup)

  // 6. ネオン放電ランプ (Neon Lamp)
  const lampGroup = new THREE.Group()
  lampGroup.position.set(cRight + 1.6, 0.6, 0)

  // ガラス管
  const bulbGeo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16)
  const bulbMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.85
  })
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat)
  lampGroup.add(bulbMesh)

  // 内部放電電極
  const elecGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8)
  elecGeo.translate(0, -0.15, 0)
  const elecMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xf97316,
    emissiveIntensity: 0.2
  })
  neonBulbMesh = new THREE.Mesh(elecGeo, elecMat)
  lampGroup.add(neonBulbMesh)

  neonGlowLight = new THREE.PointLight(0xf97316, 0, 4)
  lampGroup.add(neonGlowLight)

  const lampLabel = createTextSprite('ネオン放電ランプ', { color: '#fdba74', fontSize: 28, scale: 0.4 })
  lampLabel.position.set(0, 1.1, 0)
  lampGroup.add(lampLabel)

  sceneGroup.add(lampGroup)

  // 7. 3D 磁気エネルギー柱ゲージ (U_m = 1/2 L I^2)
  const gaugeGroup = new THREE.Group()
  gaugeGroup.position.set(-cRight - 0.7, 0.0, 0)

  const gaugeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 0.2, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b }))
  gaugeGroup.add(gaugeBase)

  const barGeo = new THREE.CylinderGeometry(0.35, 0.35, 1, 24)
  barGeo.translate(0, 0.5, 0)
  const barMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.2
  })
  energyBarMesh = new THREE.Mesh(barGeo, barMat)
  gaugeGroup.add(energyBarMesh)

  energyBarLabel = createTextSprite('U_m: 0.00 J', { color: '#d8b4fe', fontSize: 32, scale: 0.45 })
  energyBarLabel.position.set(0, 1.6, 0)
  gaugeGroup.add(energyBarLabel)

  const gaugeTitle = createTextSprite('磁気エネルギー 1/2 LI²', { color: '#c084fc', fontSize: 26, scale: 0.38 })
  gaugeTitle.position.set(0, -0.3, 0)
  gaugeGroup.add(gaugeTitle)

  sceneGroup.add(gaugeGroup)

  // 8. 3D オシロスコープ波形ボード (I(t) グラフ)
  oscCanvas = document.createElement('canvas')
  oscCanvas.width = 512
  oscCanvas.height = 256
  oscCtx = oscCanvas.getContext('2d')

  oscTexture = new THREE.CanvasTexture(oscCanvas)
  oscTexture.minFilter = THREE.LinearFilter
  oscTexture.magFilter = THREE.LinearFilter

  const oscPlaneGeo = new THREE.PlaneGeometry(6.4, 3.2)
  const oscPlaneMat = new THREE.MeshBasicMaterial({
    map: oscTexture,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide
  })
  const oscPlane = new THREE.Mesh(oscPlaneGeo, oscPlaneMat)
  oscPlane.position.set(0, 2.2, -4.5)
  oscPlane.rotation.x = 0.16
  sceneGroup.add(oscPlane)

  // 9. 電流キャリア粒子流 (InstancedMesh)
  const numE = 24
  const eGeo = new THREE.SphereGeometry(0.08, 12, 12)
  const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  electronSystem = new THREE.InstancedMesh(eGeo, eMat, numE)
  sceneGroup.add(electronSystem)
}

// ----------------------------------------------------
// 物理シミュレーションと 3D 更新ループ
// ----------------------------------------------------
let electronPhase = 0

function updateSimulation(dt) {
  if (!isPlaying.value) return

  const effectiveDt = dt * timeScale.value

  const L = inductanceH.value
  const R = resistanceOhm.value

  // 回路方程式
  if (isSwitchClosed.value) {
    const E = voltageE.value
    // L dI/dt + R I = E  =>  dI/dt = (E - R*I)/L
    const dIdt = (E - R * currentI.value) / L
    currentI.value += dIdt * effectiveDt
    if (currentI.value < 0) currentI.value = 0

    backEmfV.value = -L * dIdt
    switchVoltage.value = 0
    lampBrightness.value = currentI.value / maxCurrent.value

  } else {
    // スイッチ OFF: 回路遮断による急速電流減衰
    if (currentI.value > 0.001) {
      // 寄生抵抗/アーク抵抗による指数関数減衰 (時定数 ~0.08秒)
      const decayRate = 12.0
      const dIdt = -currentI.value * decayRate
      currentI.value += dIdt * effectiveDt
      if (currentI.value < 0.001) currentI.value = 0

      backEmfV.value = -L * dIdt // 正の巨大逆起電力
      switchVoltage.value = voltageE.value + Math.abs(backEmfV.value)
    } else {
      currentI.value = 0
      backEmfV.value = 0
      switchVoltage.value = voltageE.value
    }
  }

  // スパークタイマー更新
  if (isSparking.value) {
    sparkTimer -= effectiveDt
    if (sparkTimer <= 0) {
      isSparking.value = false
    }
  }
  if (sparkGroup) {
    sparkGroup.visible = isSparking.value
  }

  // スイッチレバーの回転アニメーション
  if (knifeBladeMesh) {
    const targetAngle = isSwitchClosed.value ? 0 : -0.75
    knifeBladeMesh.rotation.z += (targetAngle - knifeBladeMesh.rotation.z) * 0.25
  }

  // ネオンランプの発光
  if (neonBulbMesh && neonGlowLight) {
    const glow = isSparking.value ? 1.5 : Math.max(0.05, lampBrightness.value)
    neonBulbMesh.material.emissiveIntensity = glow * 1.8
    neonGlowLight.intensity = glow * 2.5
  }

  // 鉄芯磁束グロー
  if (coreFluxMesh) {
    const fRatio = maxCurrent.value > 0 ? currentI.value / maxCurrent.value : 0
    coreFluxMesh.material.opacity = 0.08 + fRatio * 0.45
  }

  // 磁気エネルギー柱ゲージ
  if (energyBarMesh && energyBarLabel) {
    const maxU = 0.5 * inductanceH.value * (maxCurrent.value ** 2)
    const curU = magneticEnergyJ.value
    const scaleY = maxU > 0 ? Math.max(0.05, Math.min(3.2, (curU / maxU) * 2.8)) : 0.05
    energyBarMesh.scale.set(1, scaleY, 1)
    energyBarLabel.position.y = scaleY + 0.35
    if (energyBarLabel.updateText) {
      energyBarLabel.updateText(`U_m: ${curU.toFixed(2)} J`, '#d8b4fe')
    }
  }

  // 逆起電力ベクトル矢印
  if (backEmfArrow) {
    const emfMag = Math.abs(backEmfV.value)
    if (emfMag > 0.3) {
      const dirY = backEmfV.value < 0 ? -1 : 1
      backEmfArrow.setVector(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, dirY, 0), Math.min(2.0, emfMag * 0.15))
    } else {
      backEmfArrow.visible = false
    }
  }

  // 電流粒子アニメーション
  if (electronSystem) {
    if (currentI.value > 0.02) {
      electronPhase += effectiveDt * (currentI.value / maxCurrent.value) * 3.0
      const cLeft = -4.2, cRight = 4.2, cTop = -2.2, cBot = 2.2
      const w = cRight - cLeft
      const h = cBot - cTop
      const perim = w * 2 + h * 2

      const dummy = new THREE.Object3D()
      for (let i = 0; i < 24; i++) {
        const prog = ((i / 24 + electronPhase * 0.1) % 1 + 1) % 1
        const s = prog * perim
        let px = cLeft, pz = cBot

        // 時計回り: 下辺を右へ -> 右辺を上へ -> 上辺を左へ -> 左辺を下へ
        if (s < w) {
          px = cLeft + s
          pz = cBot
        } else if (s < w + h) {
          px = cRight
          pz = cBot - (s - w)
        } else if (s < w * 2 + h) {
          px = cRight - (s - (w + h))
          pz = cTop
        } else {
          px = cLeft
          pz = cTop + (s - (w * 2 + h))
        }

        dummy.position.set(px, 0.18, pz)
        dummy.updateMatrix()
        electronSystem.setMatrixAt(i, dummy.matrix)
      }
      electronSystem.instanceMatrix.needsUpdate = true
      electronSystem.visible = true
    } else {
      electronSystem.visible = false
    }
  }

  // オシロスコープ更新
  updateOscilloscope()
}

function updateOscilloscope() {
  if (!oscCtx || !oscTexture) return

  oscHistory.push({
    i: currentI.value,
    vl: backEmfV.value
  })
  if (oscHistory.length > 220) oscHistory.shift()

  const ctx = oscCtx
  const w = oscCanvas.width
  const h = oscCanvas.height

  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, w, h)

  // 方眼グリッド
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= w; x += 40) {
    ctx.moveTo(x, 0); ctx.lineTo(x, h)
  }
  for (let y = 0; y <= h; y += 40) {
    ctx.moveTo(0, y); ctx.lineTo(w, y)
  }
  ctx.stroke()

  // ゼロ基準線
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, h * 0.72)
  ctx.lineTo(w, h * 0.72)
  ctx.stroke()

  // 定常電流漸近線
  const maxI = maxCurrent.value
  const iScale = 120 / (maxI * 1.3 || 1)
  const iMaxY = h * 0.72 - maxI * iScale

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(0, iMaxY)
  ctx.lineTo(w, iMaxY)
  ctx.stroke()
  ctx.setLineDash([])

  // タイトルと凡例
  ctx.font = 'bold 15px sans-serif'
  ctx.fillStyle = '#c084fc'
  ctx.fillText('電流 I(t) [A] (紫)', 16, 26)
  ctx.fillStyle = '#fbbf24'
  ctx.fillText(`I_max = ${maxI.toFixed(1)} A`, 190, 26)
  ctx.fillStyle = '#ef4444'
  ctx.fillText('逆起電力 V_L(t) [V] (赤)', 330, 26)

  if (oscHistory.length < 2) {
    oscTexture.needsUpdate = true
    return
  }

  // 1. 電流 I(t) 曲線 (紫)
  ctx.beginPath()
  ctx.strokeStyle = '#c084fc'
  ctx.lineWidth = 2.5
  const step = w / 220
  for (let idx = 0; idx < oscHistory.length; idx++) {
    const x = idx * step
    const y = h * 0.72 - oscHistory[idx].i * iScale
    if (idx === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 2. 逆起電力 V_L(t) 曲線 (赤)
  ctx.beginPath()
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  for (let idx = 0; idx < oscHistory.length; idx++) {
    const x = idx * step
    const y = h * 0.72 + (oscHistory[idx].vl / Math.max(1, voltageE.value)) * 45
    if (idx === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  oscTexture.needsUpdate = true
}

// ----------------------------------------------------
// ライフサイクル管理
// ----------------------------------------------------
onMounted(() => {
  if (!threeContainer.value) return

  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [0, 8.5, 12.8],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame: (dt) => {
      updateSimulation(dt)
    }
  })

  build3DScene()
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
.lab {
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

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
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(0, 0, 0, 0.25);
}

.speed-label {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.speed-btn-group button {
  padding: 2px 8px;
  font-size: 0.74rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  cursor: pointer;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 440px;
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
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 350px;
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
