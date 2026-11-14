<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">⚛️</span>
        <h3 class="sim-title">3D 物質波（ド・ブロイ波）量子干渉シミュレーター</h3>
        <span class="badge badge-emerald">Three.js 3D Engine</span>
      </div>
      <div class="sim-badges">
        <span class="badge badge-cyan">λ = <i>h</i> / <i>p</i> = <i>h</i> / √(2<i>m</i><sub>e</sub><i>eV</i>)</span>
      </div>
    </div>

    <p class="subtitle">
      粒子の波動性（ド・ブロイ波長 λ = <i>h</i> / <i>p</i>）を2つの3D実験で切り替え体験できます：
      (a) ボーアの円軌道定常波（2π<i>r</i> = <i>n</i>λ の強め合い vs 位相不一致による打ち消し）、
      (b) 電子1個ずつの衝突点が蓄積して3D干渉縞を形成する二重スリット電子線回折。
    </p>

    <!-- 可視化モード切替 -->
    <div class="mode-switch-bar">
      <button class="mode-tab" :class="{ active: vizMode === 'bohr' }" @click="vizMode = 'bohr'">
        🌀 (a) ボーア・ド・ブロイ円軌道定常波 (2π<i>r</i> = <i>n</i>λ)
      </button>
      <button class="mode-tab" :class="{ active: vizMode === 'slit' }" @click="vizMode = 'slit'">
        🌊 (b) 二重スリット電子線回折 (粒子ヒット蓄積)
      </button>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 3Dカメラ視点:</span>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D俯瞰
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'front' }" @click="setCameraPreset('front')">
          📐 正面断面
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="btn btn-primary" @click="isPlaying = !isPlaying">
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
      <button class="btn btn-secondary" @click="stepFrame">⏭ コマ送り</button>
      <button class="btn btn-secondary" @click="resetDefaults">⏮ リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend" v-if="vizMode === 'bohr'">
          <span class="legend-item">
            <i class="dot" style="background:#34d399;box-shadow:0 0 6px #34d399"></i>
            定常波成立 (2π<i>r</i> = <i>n</i>λ)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
            位相不一致 (打ち消し)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            電子波束
          </span>
        </div>
        <div class="three-hud-legend" v-else>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            電子衝突ドット ({{ hitCount }}個)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#a855f7;box-shadow:0 0 6px #a855f7"></i>
            ド・ブロイ波面 &amp; 理論曲線 <i>I</i>(<i>y</i>)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#34d399;box-shadow:0 0 6px #34d399"></i>
            3D 蓄積強度ヒストグラム
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span v-if="vizMode === 'bohr'" class="three-status-badge" :class="isBohrConstructive ? 'matched' : 'mismatch'">
        {{
          isBohrConstructive
            ? `✨ 定常波成立! 2πr / λ = ${orbitRatio.toFixed(2)} ≈ n = ${nearestOrbitN} (安定軌道)`
            : `❌ 位相不一致: 2πr / λ = ${orbitRatio.toFixed(2)} (整数でないため波が打ち消し合う)`
        }}
      </span>
      <span v-else class="three-status-badge matched">
        🌊 二重スリット電子線回折: 累積 {{ hitCount }} 個の電子ヒットが干渉縞 (λ = {{ lambda_nm.toFixed(3) }} nm) を形成中
      </span>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>電子加速電圧 <i>V</i>:</span>
            <strong>{{ voltage }} V</strong>
          </label>
          <input type="range" v-model.number="voltage" min="30" max="400" step="5" />
          <span class="sub-info">波長 λ = 1.226 / √V = {{ lambda_nm.toFixed(3) }} nm</span>
        </div>

        <div class="control-group" v-if="vizMode === 'bohr'">
          <label>
            <span>電子軌道の半径 <i>r</i>:</span>
            <strong>{{ orbitRadiusNm.toFixed(4) }} nm</strong>
          </label>
          <input type="range" v-model.number="orbitRadiusNm" min="0.035" max="0.160" step="0.001" />
          <div class="quick-chips">
            <button v-for="n in [2, 3, 4, 5, 6]" :key="n" class="mini-chip" :class="{ active: isBohrConstructive && nearestOrbitN === n }" @click="setOrbitQuantumN(n)">
              <i>n</i>={{ n }}
            </button>
          </div>
        </div>

        <div class="control-group" v-else>
          <label>
            <span>スリット間隔 <i>d</i>:</span>
            <strong>{{ d_nm.toFixed(2) }} nm</strong>
          </label>
          <input type="range" v-model.number="d_nm" min="0.10" max="0.35" step="0.01" />
          <span class="sub-info">スリットが狭いほど干渉縞の間隔 Δ<i>y</i> は拡大</span>
        </div>

        <div class="control-group" v-if="vizMode === 'slit'">
          <label>
            <span>検出スクリーン制御:</span>
          </label>
          <div class="quick-chips">
            <button class="mini-chip accent" @click="burstElectrons(60)">⚡ 電子を60個まとめて照射</button>
            <button class="mini-chip" @click="clearSlitHits">🗑️ ヒット履歴をクリア</button>
          </div>
        </div>
      </div>

      <div class="button-row" v-if="vizMode === 'bohr'">
        <button class="btn btn-primary" @click="snapToQuantumN">
          🎯 最寄りの量子条件 (2π<i>r</i> = <i>n</i>λ) にスナップ
        </button>
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量リアルタイム表示モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">電子の運動エネルギー <i>E</i><sub>k</sub></span>
        <span class="value">{{ voltage }} <span class="unit">eV</span></span>
        <span class="subtext"><i>E</i><sub>k</sub> = <i>eV</i></span>
      </div>

      <div class="stat-card">
        <span class="label">ド・ブロイ波長 λ</span>
        <span class="value highlight">{{ lambda_nm.toFixed(3) }} <span class="unit">nm</span></span>
        <span class="subtext"><span class="frac"><span class="num"><i>h</i></span><span class="den">√(2<i>m</i><sub>e</sub><i>eV</i>)</span></span></span>
      </div>

      <div class="stat-card" v-if="vizMode === 'bohr'">
        <span class="label">周長と波長の比 2π<i>r</i> / λ</span>
        <span class="value" :class="isBohrConstructive ? 'highlight' : 'mismatch-val'">{{ orbitRatio.toFixed(2) }}</span>
        <span class="subtext">{{ isBohrConstructive ? `整数 n = ${nearestOrbitN} に一致` : `非整数 (Δ = ${orbitMismatch.toFixed(2)})` }}</span>
      </div>

      <div class="stat-card" v-else>
        <span class="label">スリット間隔 / 波長比 <i>d</i> / λ</span>
        <span class="value">{{ (d_nm / lambda_nm).toFixed(2) }}</span>
        <span class="subtext">縞間隔 Δ<i>y</i> ∝ λ / <i>d</i></span>
      </div>

      <div class="stat-card">
        <span class="label">{{ vizMode === 'bohr' ? '量子化条件 2πr = nλ' : '累積検出電子数' }}</span>
        <span class="value">{{ vizMode === 'bohr' ? `n ≈ ${nearestOrbitN}` : hitCount }} <span class="unit">{{ vizMode === 'bohr' ? '' : '個' }}</span></span>
        <span class="subtext">{{ vizMode === 'bohr' ? 'ボーアの量子条件の波動解釈' : '1個ずつ波の確率分布に従って着弾' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null

const vizMode = ref('bohr') // 'bohr' | 'slit'
const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')

const voltage = ref(100) // V (30..400)
const d_nm = ref(0.21) // nm (0.10..0.35)
const orbitRadiusNm = ref(0.0781) // nm -> at 100V (λ=0.12264nm), 2πr/λ ≈ 4.00

// λ = h / sqrt(2 m e V) = 1.22639 / sqrt(V) [nm]
const lambda_nm = computed(() => 1.22639 / Math.sqrt(voltage.value))

// Bohr standing wave metrics
const orbitRatio = computed(() => (2 * Math.PI * orbitRadiusNm.value) / lambda_nm.value)
const nearestOrbitN = computed(() => Math.max(1, Math.round(orbitRatio.value)))
const orbitMismatch = computed(() => Math.abs(orbitRatio.value - nearestOrbitN.value))
const isBohrConstructive = computed(() => orbitRatio.value >= 0.8 && orbitMismatch.value < 0.06)

function setOrbitQuantumN(n) {
  const r = (n * lambda_nm.value) / (2 * Math.PI)
  orbitRadiusNm.value = Math.min(0.16, Math.max(0.035, Number(r.toFixed(4))))
}

function snapToQuantumN() {
  setOrbitQuantumN(nearestOrbitN.value)
}

function resetDefaults() {
  voltage.value = 100
  d_nm.value = 0.21
  orbitRadiusNm.value = 0.0781
  if (vizMode.value === 'slit') {
    clearSlitHits()
    burstElectrons(35)
  }
}

// ==========================================================
// 二重スリット電子ヒット管理
// ==========================================================
const MAX_HITS = 750
const NUM_BINS = 29
const hitCount = ref(0)
const binCounts = new Array(NUM_BINS).fill(0)
const hitPositions = [] // { y, z }

function getSlitIntensity(yNorm) {
  // yNorm in [-1, 1] across screen height
  // 干渉縞周期は λ / d に比例
  const fringeScale = (d_nm.value / lambda_nm.value) * 2.15
  const phase = Math.PI * fringeScale * yNorm
  const cosTerm = Math.cos(phase)
  // 単スリット回折包絡線 sinc^2
  const beta = phase * 0.24
  const sincTerm = Math.abs(beta) < 1e-4 ? 1 : Math.sin(beta) / beta
  return cosTerm * cosTerm * sincTerm * sincTerm
}

function sampleSlitHitY() {
  for (let tries = 0; tries < 40; tries++) {
    const yNorm = (Math.random() * 2 - 1) * 0.96
    const prob = getSlitIntensity(yNorm)
    if (Math.random() <= prob) {
      return yNorm * 2.05
    }
  }
  return 0
}

function recordSlitHit(yVal, zVal) {
  if (hitPositions.length >= MAX_HITS) {
    const old = hitPositions.shift()
    const oldBin = Math.max(0, Math.min(NUM_BINS - 1, Math.floor(((old.y + 2.1) / 4.2) * NUM_BINS)))
    binCounts[oldBin] = Math.max(0, binCounts[oldBin] - 1)
  } else {
    hitCount.value++
  }
  hitPositions.push({ y: yVal, z: zVal })
  const binIdx = Math.max(0, Math.min(NUM_BINS - 1, Math.floor(((yVal + 2.1) / 4.2) * NUM_BINS)))
  binCounts[binIdx]++
}

function clearSlitHits() {
  hitPositions.length = 0
  binCounts.fill(0)
  hitCount.value = 0
  syncSlitScreenMeshes()
}

function burstElectrons(count = 50) {
  for (let i = 0; i < count; i++) {
    const yHit = sampleSlitHitY()
    const zHit = (Math.random() - 0.5) * 1.95
    recordSlitHit(yHit, zHit)
  }
  syncSlitScreenMeshes()
}

// ==========================================================
// カメラ & レスポンシブ
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return w < 540 || aspect < 1.35 ? Math.min(1.76, Math.max(1.18, 1.50 / Math.max(0.66, aspect))) : 1.0
}

function isMobileView() {
  return getMobScale() > 1.02
}

function getCamParams(preset) {
  const ms = getMobScale()
  const cx = 0.0
  if (preset === 'front') {
    return { pos: [cx, 0.05, 44.5 * ms], target: [cx, 0.05, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [cx, 48.0 * ms, 0.45], target: [cx, 0.0, -0.35], fov: 14 }
  }
  return { pos: [cx + 0.25 * ms, 3.9 * ms, 13.4 * ms], target: [cx, 0.05, -0.1], fov: 40 }
}

function setCameraPreset(preset, duration = 0.55) {
  activeCam.value = preset
  if (sceneObjs?.bohrBoard) {
    sceneObjs.bohrBoard.rotation.x = preset === 'top' ? -1.28 : -0.56
  }
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function stepFrame() {
  isPlaying.value = false
  updateSim(0.05)
}

// ==========================================================
// Three.js シーン構築
// ==========================================================
let sceneObjs = null
let resizeObs = null
let lastIsMob = false
let simTime = 0
let slitSpawnTimer = 0
const labelCache = {}

function setLabelText(sprite, key, textStr, color, borderColor, baseScale = 0.38) {
  const mult = isMobileView() ? 1.66 : 1.0
  const sig = `${textStr}|${color}|${borderColor}|${mult}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(textStr, color, borderColor)
  const h = baseScale * mult
  const asp = sprite.scale.x / Math.max(0.001, sprite.scale.y)
  sprite.scale.set(h * asp, h, 1)
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastIsMob = isMobileView()

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 130,
    onFrame: (dt) => {
      updateSim(dt)
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = isMobileView()
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx

  const floorGrid = new THREE.GridHelper(18, 18, 0x334155, 0x162032)
  floorGrid.position.set(0, -2.32, 0)
  scene.add(floorGrid)

  // ======================================================
  // MODE A: ボーア・ド・ブロイ円軌道定常波グループ
  // ======================================================
  const bohrGroup = new THREE.Group()
  scene.add(bohrGroup)

  const atomCenter = new THREE.Vector3(-1.35, 0.05, 0)
  const atomStage = new THREE.Group()
  atomStage.position.copy(atomCenter)
  bohrGroup.add(atomStage)

  // 原子核クラスター
  const nucGroup = new THREE.Group()
  const pMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.45, roughness: 0.3 })
  const nMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
  ;[
    [0, 0, 0, true],
    [0.08, 0.06, 0.05, false],
    [-0.08, -0.05, 0.06, true],
    [0.05, -0.08, -0.06, false],
    [-0.06, 0.07, -0.05, true]
  ].forEach(([x, y, z, isP]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 14), isP ? pMat : nMat)
    s.position.set(x, y, z)
    nucGroup.add(s)
  })
  atomStage.add(nucGroup)

  // 基準円軌道リング
  const refOrbitGeo = new THREE.BufferGeometry()
  const refSegs = 96
  refOrbitGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((refSegs + 1) * 3), 3))
  const refOrbitLine = new THREE.Line(
    refOrbitGeo,
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.55 })
  )
  atomStage.add(refOrbitLine)

  // 3D 定常波メイン曲線 (0..2π) & 2周目ミスマッチ重ね描き (2π..4π)
  const waveSteps = 220
  const wave1Geo = new THREE.BufferGeometry()
  wave1Geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((waveSteps + 1) * 3), 3))
  const wave1Mat = new THREE.LineBasicMaterial({ color: 0x34d399 })
  const wave1Line = new THREE.Line(wave1Geo, wave1Mat)

  // 厚みのある発光バンド (0..2π) 用リボンの頂点
  const ribbon1Geo = new THREE.BufferGeometry()
  const ribbon1Pos = new Float32Array((waveSteps + 1) * 2 * 3)
  const ribbonIdx = []
  for (let i = 0; i < waveSteps; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3
    ribbonIdx.push(a, b, c, b, d, c)
  }
  ribbon1Geo.setAttribute('position', new THREE.BufferAttribute(ribbon1Pos, 3))
  ribbon1Geo.setIndex(ribbonIdx)
  const ribbon1Mat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const ribbon1Mesh = new THREE.Mesh(ribbon1Geo, ribbon1Mat)

  const wave2Geo = new THREE.BufferGeometry()
  wave2Geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((waveSteps + 1) * 3), 3))
  const wave2Mat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85 })
  const wave2Line = new THREE.Line(wave2Geo, wave2Mat)

  atomStage.add(ribbon1Mesh, wave1Line, wave2Line)

  // 位相不一致マーカー球 (θ=0/2π 接続点)
  const mismatchBead = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  )
  mismatchBead.visible = false
  atomStage.add(mismatchBead)

  // 軌道電子波束ビーズ
  const bohrElec = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.95 })
  )
  atomStage.add(bohrElec)

  // 右側: 量子化条件 n = 2πr/λ ゲージパネル (x = +2.85, 上面視点でも読めるよう後傾)
  const bohrBoard = new THREE.Group()
  bohrBoard.position.set(2.85, 0.05, 0)
  bohrBoard.rotation.x = -0.56
  bohrGroup.add(bohrBoard)

  const bBack = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 4.25),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
  )
  bBack.position.z = -0.06
  const bFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.2, -2.12, -0.04),
      new THREE.Vector3(2.2, -2.12, -0.04),
      new THREE.Vector3(2.2, 2.12, -0.04),
      new THREE.Vector3(-2.2, 2.12, -0.04)
    ]),
    new THREE.LineBasicMaterial({ color: 0x334155 })
  )
  bohrBoard.add(bBack, bFrame)

  // n = 1..6 量子準位バー
  const qBars = []
  for (let n = 1; n <= 6; n++) {
    const by = -1.25 + (n - 1) * 0.48
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2.75, 0.22, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x1e293b, emissiveIntensity: 0.2 })
    )
    bar.position.set(0.20, by, 0.06)
    bohrBoard.add(bar)
    qBars.push(bar)

    const nLbl = createTextSprite(`n=${n}`, { color: '#cbd5e1', borderColor: 'rgba(148,163,184,0.4)', fontSize: 26, scale: 0.29 })
    nLbl.position.set(-1.68, by, 0.12)
    bohrBoard.add(nLbl)
  }

  // 現在値インジケータマーカー
  const qPointer = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0x34d399 })
  )
  bohrBoard.add(qPointer)

  const lblBohrTitle = createTextSprite('ボーアの量子条件 2πr = nλ', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 28, scale: 0.35 })
  lblBohrTitle.position.set(0, 1.82, 0.12)
  const lblBohrStatus = createTextSprite('2πr/λ = 4.00', { color: '#fde68a', borderColor: '#fbbf24', fontSize: 28, scale: 0.34 })
  lblBohrStatus.position.set(0.12, -1.80, 0.12)
  bohrBoard.add(lblBohrTitle, lblBohrStatus)

  const lblNucleus = createTextSprite('原子核', { color: '#fda4af', borderColor: '#f43f5e', fontSize: 26, scale: 0.32 })
  lblNucleus.position.set(-0.35, -0.45, -0.65)
  const lblOrbit = createTextSprite('定常波 (n=4)', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 28, scale: 0.36 })
  lblOrbit.position.set(-0.35, 2.38, 0.65)
  atomStage.add(lblNucleus, lblOrbit)

  // ======================================================
  // MODE B: 二重スリット電子線回折グループ
  // ======================================================
  const slitGroup = new THREE.Group()
  slitGroup.visible = false
  scene.add(slitGroup)

  const gunX = -4.25
  const slitX = -1.65
  const screenX = 1.65

  // 電子銃 (x = gunX)
  const gunBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 1.1, 24).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.28 })
  )
  gunBody.position.set(gunX, 0, 0)
  const gunNozzle = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.045, 12, 24).rotateY(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  gunNozzle.position.set(gunX + 0.56, 0, 0)
  slitGroup.add(gunBody, gunNozzle)

  // 二重スリット遮蔽板 (x = slitX)
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.38 })
  const topSlitPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 2.2), plateMat)
  const midSlitPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 2.2), plateMat)
  const botSlitPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 2.2), plateMat)
  const slitGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const slit1Glow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 1.8), slitGlowMat)
  const slit2Glow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 1.8), slitGlowMat)
  slitGroup.add(topSlitPlate, midSlitPlate, botSlitPlate, slit1Glow, slit2Glow)

  // ド・ブロイ波面半円アーク (2スリット × 5本)
  const waveArcs = []
  const arcSteps = 26
  for (let i = 0; i < 5; i++) {
    const pair = []
    const mat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.38 })
    for (let s = 0; s < 2; s++) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((arcSteps + 1) * 3), 3))
      const line = new THREE.Line(geo, mat)
      slitGroup.add(line)
      pair.push(line)
    }
    waveArcs.push({ pair, mat })
  }

  // 飛翔中の個別シアン電子プール (12個)
  const flyingElectrons = []
  const flyGeo = new THREE.SphereGeometry(0.075, 12, 12)
  const flyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.95 })
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(flyGeo, flyMat)
    m.visible = false
    slitGroup.add(m)
    flyingElectrons.push({
      active: false,
      prog: 0,
      slitY: 0.4,
      hitY: 0,
      hitZ: 0,
      mesh: m
    })
  }

  // 3D 検出スクリーン (x = screenX)
  const detScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 4.3, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x07131e, roughness: 0.7 })
  )
  detScreen.position.set(screenX, 0, 0)
  const detEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.15, 4.32, 2.32)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
  )
  detEdges.position.copy(detScreen.position)
  slitGroup.add(detScreen, detEdges)

  // スクリーン上の蓄積電子ヒット点群 (InstancedMesh 最大 MAX_HITS)
  const hitDotGeo = new THREE.SphereGeometry(0.042, 8, 8)
  const hitDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const hitInstances = new THREE.InstancedMesh(hitDotGeo, hitDotMat, MAX_HITS)
  hitInstances.count = 0
  slitGroup.add(hitInstances)

  // スクリーン右側: 3D 蓄積干渉強度ヒストグラムバー (NUM_BINS本) + 理論包絡線
  const histBars = []
  const barMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 0.5
  })
  const binH = 4.2 / NUM_BINS
  for (let i = 0; i < NUM_BINS; i++) {
    const barGeo = new THREE.BoxGeometry(1, binH * 0.82, 0.22)
    barGeo.translate(0.5, 0, 0)
    const bar = new THREE.Mesh(barGeo, barMat)
    const by = -2.1 + (i + 0.5) * binH
    bar.position.set(screenX + 0.22, by, 0)
    bar.scale.set(0.02, 1, 1)
    slitGroup.add(bar)
    histBars.push(bar)
  }

  const theoryCurveGeo = new THREE.BufferGeometry()
  const theorySamples = 100
  theoryCurveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((theorySamples + 1) * 3), 3))
  const theoryCurve = new THREE.Line(theoryCurveGeo, new THREE.LineBasicMaterial({ color: 0xc084fc }))
  slitGroup.add(theoryCurve)

  // Mode B ラベル (X/Z分離)
  const lblGun = createTextSprite('電子銃', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 28, scale: 0.35 })
  lblGun.position.set(gunX, 0.95, -0.55)
  const lblSlit = createTextSprite('二重スリット', { color: '#e2e8f0', borderColor: '#94a3b8', fontSize: 28, scale: 0.35 })
  lblSlit.position.set(slitX, 2.38, 0.65)
  const lblDet = createTextSprite('電子検出スクリーン', { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 28, scale: 0.35 })
  lblDet.position.set(screenX, 2.42, -0.65)
  const lblProfile = createTextSprite('3D 干渉強度分布 I(y)', { color: '#6ee7b7', borderColor: '#10b981', fontSize: 28, scale: 0.35 })
  lblProfile.position.set(screenX + 1.35, -2.42, 0.75)

  slitGroup.add(lblGun, lblSlit, lblDet, lblProfile)

  sceneObjs = {
    bohrGroup,
    bohrBoard,
    refOrbitGeo,
    refSegs,
    waveSteps,
    wave1Geo,
    wave1Mat,
    ribbon1Geo,
    ribbon1Mat,
    wave2Geo,
    wave2Line,
    mismatchBead,
    bohrElec,
    qBars,
    qPointer,
    lblBohrTitle,
    lblBohrStatus,
    lblNucleus,
    lblOrbit,
    slitGroup,
    gunX,
    slitX,
    screenX,
    topSlitPlate,
    midSlitPlate,
    botSlitPlate,
    slit1Glow,
    slit2Glow,
    waveArcs,
    arcSteps,
    flyingElectrons,
    hitInstances,
    histBars,
    theoryCurveGeo,
    theorySamples,
    lblGun,
    lblSlit,
    lblDet,
    lblProfile
  }

  // Mode B 初期ヒットを少し入れておくと切り替えた瞬間から見栄えが良い
  burstElectrons(35)
  updateSlitLayout()
  updateSim(0)
}

const dummyMat4 = new THREE.Matrix4()
function syncSlitScreenMeshes() {
  if (!sceneObjs) return
  const { hitInstances, histBars, screenX } = sceneObjs

  const nHits = Math.min(MAX_HITS, hitPositions.length)
  hitInstances.count = nHits
  for (let i = 0; i < nHits; i++) {
    const hp = hitPositions[i]
    dummyMat4.makeTranslation(screenX - 0.08, hp.y, hp.z)
    hitInstances.setMatrixAt(i, dummyMat4)
  }
  hitInstances.instanceMatrix.needsUpdate = true

  const maxBin = Math.max(1, ...binCounts)
  for (let i = 0; i < NUM_BINS; i++) {
    const barW = Math.max(0.02, (binCounts[i] / maxBin) * 1.95)
    histBars[i].scale.set(barW, 1, 1)
  }
}

function updateSlitLayout() {
  if (!sceneObjs) return
  const {
    slitX,
    screenX,
    topSlitPlate,
    midSlitPlate,
    botSlitPlate,
    slit1Glow,
    slit2Glow,
    theoryCurveGeo,
    theorySamples
  } = sceneObjs

  const slitHalf = 0.25 + ((d_nm.value - 0.10) / 0.25) * 0.65
  const gap = 0.14
  const topH = Math.max(0.25, 2.15 - (slitHalf + gap / 2))
  const midH = Math.max(0.12, 2 * slitHalf - gap)

  topSlitPlate.scale.set(1, topH / 1.4, 1)
  topSlitPlate.position.set(slitX, slitHalf + gap / 2 + topH / 2, 0)
  midSlitPlate.scale.set(1, midH / 0.6, 1)
  midSlitPlate.position.set(slitX, 0, 0)
  botSlitPlate.scale.set(1, topH / 1.4, 1)
  botSlitPlate.position.set(slitX, -(slitHalf + gap / 2 + topH / 2), 0)

  slit1Glow.position.set(slitX, slitHalf, 0)
  slit2Glow.position.set(slitX, -slitHalf, 0)

  // 理論干渉曲線 I(y) 更新
  const posAttr = theoryCurveGeo.getAttribute('position')
  const arr = posAttr.array
  for (let i = 0; i <= theorySamples; i++) {
    const yNorm = -1 + (i / theorySamples) * 2
    const yWorld = yNorm * 2.1
    const inten = getSlitIntensity(yNorm)
    arr[i * 3] = screenX + 0.22 + inten * 1.95
    arr[i * 3 + 1] = yWorld
    arr[i * 3 + 2] = 0.18
  }
  posAttr.needsUpdate = true
}

function updateSim(dt) {
  if (!sceneObjs) return
  const mob = isMobileView()
  const effDt = isPlaying.value ? dt * timeScale.value : 0
  if (effDt > 0) simTime += effDt

  const {
    bohrGroup,
    slitGroup
  } = sceneObjs

  bohrGroup.visible = vizMode.value === 'bohr'
  slitGroup.visible = vizMode.value === 'slit'

  if (vizMode.value === 'bohr') {
    const {
      refOrbitGeo,
      refSegs,
      waveSteps,
      wave1Geo,
      wave1Mat,
      ribbon1Geo,
      ribbon1Mat,
      wave2Geo,
      wave2Line,
      mismatchBead,
      bohrElec,
      qBars,
      qPointer,
      lblBohrTitle,
      lblBohrStatus,
      lblNucleus,
      lblOrbit
    } = sceneObjs

    const R3d = 1.05 + ((orbitRadiusNm.value - 0.035) / 0.125) * 1.15
    const nRatio = orbitRatio.value
    const constructive = isBohrConstructive.value

    // 基準円軌道更新
    const refArr = refOrbitGeo.getAttribute('position').array
    for (let i = 0; i <= refSegs; i++) {
      const ang = (i / refSegs) * Math.PI * 2
      refArr[i * 3] = Math.cos(ang) * R3d
      refArr[i * 3 + 1] = Math.sin(ang) * R3d
      refArr[i * 3 + 2] = 0
    }
    refOrbitGeo.getAttribute('position').needsUpdate = true

    // 定常波計算: 成立時は緑/シアン、不一致時は赤+2周目アンバーで位相差を強調
    const colHex = constructive ? 0x34d399 : 0xf43f5e
    wave1Mat.color.setHex(colHex)
    ribbon1Mat.color.setHex(colHex)
    const osc = Math.cos(simTime * 4.2)
    const ampR = 0.22 * osc
    const ampZ = 0.14 * osc

    const w1Arr = wave1Geo.getAttribute('position').array
    const ribArr = ribbon1Geo.getAttribute('position').array
    for (let i = 0; i <= waveSteps; i++) {
      const ang = (i / waveSteps) * Math.PI * 2
      const waveVal = Math.sin(nRatio * ang)
      const rr = R3d + ampR * waveVal
      const px = Math.cos(ang) * rr
      const py = Math.sin(ang) * rr
      const pz = ampZ * waveVal
      w1Arr[i * 3] = px
      w1Arr[i * 3 + 1] = py
      w1Arr[i * 3 + 2] = pz

      const vi = i * 2
      ribArr[vi * 3] = Math.cos(ang) * R3d
      ribArr[vi * 3 + 1] = Math.sin(ang) * R3d
      ribArr[vi * 3 + 2] = 0
      ribArr[(vi + 1) * 3] = px
      ribArr[(vi + 1) * 3 + 1] = py
      ribArr[(vi + 1) * 3 + 2] = pz
    }
    wave1Geo.getAttribute('position').needsUpdate = true
    ribbon1Geo.getAttribute('position').needsUpdate = true

    if (!constructive) {
      wave2Line.visible = true
      const w2Arr = wave2Geo.getAttribute('position').array
      for (let i = 0; i <= waveSteps; i++) {
        const ang = Math.PI * 2 + (i / waveSteps) * Math.PI * 2
        const waveVal = Math.sin(nRatio * ang)
        const rr = R3d + ampR * waveVal
        w2Arr[i * 3] = Math.cos(ang) * rr
        w2Arr[i * 3 + 1] = Math.sin(ang) * rr
        w2Arr[i * 3 + 2] = ampZ * waveVal
      }
      wave2Geo.getAttribute('position').needsUpdate = true

      // θ=0 と θ=2π の不一致ギャップ点に赤マーカー
      const mismatchVal = Math.sin(nRatio * Math.PI * 2)
      const rEnd = R3d + ampR * mismatchVal
      mismatchBead.visible = true
      mismatchBead.position.set(rEnd, 0, ampZ * mismatchVal)
    } else {
      wave2Line.visible = false
      mismatchBead.visible = false
    }

    // 軌道上を周回する電子
    const eAng = simTime * 1.85
    const eWave = Math.sin(nRatio * eAng)
    const eR = R3d + ampR * eWave
    bohrElec.position.set(Math.cos(eAng) * eR, Math.sin(eAng) * eR, ampZ * eWave)

    // 右側量子化ゲージ更新
    const clampRatio = Math.min(6.4, Math.max(0.6, nRatio))
    qPointer.position.set(-1.32, -1.25 + (clampRatio - 1) * 0.48, 0.14)
    qPointer.material.color.setHex(constructive ? 0x34d399 : 0xf43f5e)

    qBars.forEach((bar, idx) => {
      const nVal = idx + 1
      const isMatch = constructive && nearestOrbitN.value === nVal
      bar.material.color.setHex(isMatch ? 0x34d399 : 0x334155)
      bar.material.emissive.setHex(isMatch ? 0x10b981 : 0x1e293b)
      bar.material.emissiveIntensity = isMatch ? 0.75 : 0.2
    })

    setLabelText(lblBohrTitle, 'bTitle', mob ? '2πr = nλ' : 'ボーアの量子条件 2πr = nλ', '#6ee7b7', '#10b981', 0.35)
    setLabelText(
      lblBohrStatus,
      'bStat',
      constructive ? `2πr/λ = ${nRatio.toFixed(2)} (n=${nearestOrbitN.value})` : `2πr/λ = ${nRatio.toFixed(2)} (不一致)`,
      constructive ? '#6ee7b7' : '#fda4af',
      constructive ? '#10b981' : '#f43f5e',
      0.33
    )
    setLabelText(lblNucleus, 'nuc', '原子核', '#fda4af', '#f43f5e', 0.30)
    setLabelText(
      lblOrbit,
      'orb',
      constructive ? `定常波 (n=${nearestOrbitN.value})` : `非定常波 (${nRatio.toFixed(2)}λ)`,
      constructive ? '#6ee7b7' : '#fda4af',
      constructive ? '#10b981' : '#f43f5e',
      0.34
    )
    lblOrbit.position.set(-0.25, R3d + 0.42, 0.65)
  } else {
    // MODE B: 二重スリット電子線回折
    const {
      gunX,
      slitX,
      screenX,
      waveArcs,
      arcSteps,
      flyingElectrons,
      lblGun,
      lblSlit,
      lblDet,
      lblProfile
    } = sceneObjs

    const slitHalf = 0.25 + ((d_nm.value - 0.10) / 0.25) * 0.65
    const maxR = screenX - slitX
    const spacingR = maxR / waveArcs.length
    const arcSpeed = 0.55 * (0.1226 / lambda_nm.value)

    waveArcs.forEach(({ pair, mat }, i) => {
      const r = i * spacingR + ((simTime * Math.min(1.4, Math.max(0.35, arcSpeed))) % spacingR)
      const vis = r >= 0.15 && r <= maxR
      mat.opacity = vis ? Math.max(0.08, (1 - r / maxR) * 0.42) : 0
      const slitYs = [slitHalf, -slitHalf]
      pair.forEach((line, sIdx) => {
        line.visible = vis
        if (!vis) return
        const sy = slitYs[sIdx]
        const arr = line.geometry.getAttribute('position').array
        let count = 0
        for (let k = 0; k <= arcSteps; k++) {
          const ang = -Math.PI * 0.36 + (k / arcSteps) * (Math.PI * 0.72)
          const px = slitX + r * Math.cos(ang)
          const py = sy + r * Math.sin(ang)
          if (px <= screenX - 0.08 && Math.abs(py) <= 2.15) {
            arr[count * 3] = px
            arr[count * 3 + 1] = py
            arr[count * 3 + 2] = 0
            count++
          }
        }
        line.geometry.setDrawRange(0, Math.max(0, count))
        line.geometry.getAttribute('position').needsUpdate = true
      })
    })

    // 飛翔電子のスポーン & 更新
    if (effDt > 0) {
      slitSpawnTimer += effDt
      if (slitSpawnTimer >= 0.16) {
        slitSpawnTimer = 0
        const slot = flyingElectrons.find((e) => !e.active)
        if (slot) {
          slot.active = true
          slot.prog = 0
          slot.slitY = Math.random() < 0.5 ? slitHalf : -slitHalf
          slot.hitY = sampleSlitHitY()
          slot.hitZ = (Math.random() - 0.5) * 1.95
          slot.mesh.visible = true
        }
      }

      const speedFactor = 0.65 + (voltage.value / 400) * 0.55
      let hitAdded = false
      flyingElectrons.forEach((el) => {
        if (!el.active) return
        el.prog += effDt * speedFactor
        if (el.prog >= 1.0) {
          el.active = false
          el.mesh.visible = false
          recordSlitHit(el.hitY, el.hitZ)
          hitAdded = true
          return
        }
        if (el.prog < 0.42) {
          const u = el.prog / 0.42
          const px = gunX + 0.56 + u * (slitX - (gunX + 0.56))
          const py = u * el.slitY
          el.mesh.position.set(px, py, 0)
        } else {
          const u = (el.prog - 0.42) / 0.58
          const px = slitX + u * (screenX - 0.08 - slitX)
          const py = el.slitY + u * (el.hitY - el.slitY)
          const pz = u * el.hitZ
          el.mesh.position.set(px, py, pz)
        }
      })
      if (hitAdded) syncSlitScreenMeshes()
    }

    setLabelText(lblGun, 'mGun', mob ? '電子銃' : `電子銃 (${voltage.value}V)`, '#7dd3fc', '#38bdf8', 0.34)
    setLabelText(lblSlit, 'mSlit', mob ? '二重スリット' : `二重スリット (d=${d_nm.value.toFixed(2)}nm)`, '#e2e8f0', '#94a3b8', 0.34)
    setLabelText(lblDet, 'mDet', mob ? '検出器' : '蛍光検出スクリーン', '#7dd3fc', '#38bdf8', 0.34)
    setLabelText(lblProfile, 'mProf', mob ? '強度 I(y)' : '3D 蓄積強度分布 I(y)', '#6ee7b7', '#10b981', 0.34)
  }
}

watch([voltage, d_nm], () => {
  if (vizMode.value === 'slit') {
    updateSlitLayout()
  }
  updateSim(0)
})

watch([orbitRadiusNm, vizMode], () => {
  if (vizMode.value === 'slit') {
    updateSlitLayout()
    syncSlitScreenMeshes()
  }
  updateSim(0)
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
  background: #0f172a;
  border-radius: 12px;
  padding: 18px;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  margin: 20px 0;
  border: 1px solid #334155;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sim-title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #f8fafc;
}

.sim-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.mode-switch-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.mode-tab {
  flex: 1 1 220px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.mode-tab.active {
  background: rgba(16, 185, 129, 0.18);
  border-color: #34d399;
  color: #6ee7b7;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
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

.chip-btn {
  padding: 5px 11px;
  font-size: 0.76rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #f8fafc;
}

.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid #334155;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px;
  border-radius: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.speed-label {
  font-size: 0.78rem;
  color: #38bdf8;
  font-weight: 600;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
}

.speed-btn-group button {
  padding: 4px 8px;
  font-size: 0.74rem;
  border-radius: 8px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  cursor: pointer;
  white-space: nowrap;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: 700;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 10px;
  background: #080c16;
  border: 1px solid #334155;
  overflow: hidden;
}

.three-viewport {
  width: 100%;
  height: 100%;
}

.three-hud-top {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
  z-index: 5;
}

.three-hud-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.73rem;
  line-height: 1.35;
  color: #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.legend-item .dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.three-hud-bottom {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  z-index: 5;
}

.three-hud-hint {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.72rem;
  color: #cbd5e1;
}

.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.three-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  max-width: 100%;
  box-sizing: border-box;
}

.three-status-badge.matched {
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.three-status-badge.mismatch {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.45);
  color: #fda4af;
}

.control-panel {
  margin-top: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  color: #cbd5e1;
}

.control-group strong {
  color: #38bdf8;
  font-family: monospace;
}

.sub-info {
  font-size: 0.74rem;
  color: #94a3b8;
}

input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.mini-chip {
  padding: 4px 10px;
  font-size: 0.74rem;
  font-weight: 600;
  border-radius: 6px;
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid #475569;
  cursor: pointer;
}

.mini-chip.active {
  background: rgba(16, 185, 129, 0.22);
  border-color: #34d399;
  color: #6ee7b7;
}

.mini-chip.accent {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #7dd3fc;
}

.button-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: #334155;
  color: #f8fafc;
}

.btn-primary {
  background: #059669;
  border-color: #34d399;
  color: white;
  font-weight: 700;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card .label {
  font-size: 0.73rem;
  color: #94a3b8;
  margin-bottom: 3px;
}

.stat-card .value {
  font-size: 1.06rem;
  font-weight: bold;
  color: #f8fafc;
  font-family: monospace;
}

.stat-card .value.highlight {
  color: #34d399;
}

.stat-card .value.mismatch-val {
  color: #f43f5e;
}

.stat-card .unit {
  font-size: 0.78rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  padding: 0 0.15em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.1em;
  font-size: 0.85em;
}

.frac .den {
  padding-top: 0.1em;
  font-size: 0.85em;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .three-viewport-wrap {
    height: 330px;
  }
  .speed-control-group {
    width: 100%;
    border-radius: 10px;
    padding: 5px 8px;
  }
  .three-hud-legend {
    gap: 6px;
    font-size: 0.66rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.65rem;
    padding: 3px 8px;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
  .three-status-badge {
    width: 100%;
    text-align: center;
    font-size: 0.72rem;
  }
}
</style>
