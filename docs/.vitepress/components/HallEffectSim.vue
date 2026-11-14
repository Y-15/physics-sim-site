<template>
  <div class="sim-container" :style="{ '--ac': carrierType === 'electron' ? '#38bdf8' : '#fb7185' }">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧲</span>
        <h3 class="sim-title">3D ホール効果・キャリア判定シミュレーター</h3>
        <span class="badge" :class="carrierType === 'electron' ? 'badge-cyan' : 'badge-rose'">
          {{ carrierType === 'electron' ? '自由電子 e⁻ (n型 / 金属)' : '正孔・ホール h⁺ (p型半導体)' }}
        </span>
      </div>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: carrierType === 'electron' }"
          @click="setCarrier('electron')"
        >
          電子キャリア (-e, n型/金属)
        </button>
        <button
          class="tab-btn"
          :class="{ active: carrierType === 'hole' }"
          @click="setCarrier('hole')"
        >
          正孔キャリア (+e, p型半導体)
        </button>
      </div>
    </div>

    <p class="desc">
      磁場 <i>B</i> 中の導体・半導体ブロックに電流 <i>I</i> を流したときに、荷電キャリアが受けるローレンツ力 <i>F</i><sub><i>B</i></sub> = <i>q</i>(<i>v</i> × <i>B</i>) と
      上下端面に生じる電荷集積・ホール電圧 <i>V</i><sub><i>H</i></sub> の極性反転を 3D でリアルタイム検証します。
    </p>

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
      <button class="btn btn-secondary" @click="toggleCarrier">
        🔄 キャリア反転 ({{ carrierType === 'electron' ? 'e⁻ → h⁺' : 'h⁺ → e⁻' }})
      </button>
      <button class="btn btn-secondary" @click="resetCamera">🔄 視点リセット</button>
    </div>

    <!-- 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <span class="legend-item">
            <i class="dot" :style="{ background: carrierType === 'electron' ? '#38bdf8' : '#fb7185', boxShadow: '0 0 6px ' + (carrierType === 'electron' ? '#38bdf8' : '#fb7185') }"></i>
            {{ carrierType === 'electron' ? '電子 (-e) ドリフト' : '正孔 (+e) ドリフト' }}
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
            電流 <i>I</i> (右向き +X)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
            磁場 <i>B</i> (奥向き -Z)
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#10b981;box-shadow:0 0 6px #10b981"></i>
            ローレンツ力 <i>F</i><sub><i>B</i></sub>
          </span>
          <span class="legend-item">
            <i class="dot" style="background:#ec4899;box-shadow:0 0 6px #ec4899"></i>
            ホール電場 <i>E</i><sub><i>H</i></sub>
          </span>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D視点回転 ・ ホイールでズーム</div>
      </div>
    </div>

    <!-- 状態ステータス帯 -->
    <div class="mode-status-strip">
      <span class="three-status-badge" :class="carrierType">
        {{ carrierType === 'electron'
            ? '⚡ 電子キャリア: ローレンツ力により電子 (-e) が上面へ偏り蓄積 → 上面が負極(-)・下面が正極(+)となり、ホール電圧 V_H < 0 となる'
            : '⚡ 正孔キャリア: ローレンツ力により正孔 (+e) が上面へ偏り蓄積 → 上面が正極(+)・下面が負極(-)となり、ホール電圧 V_H > 0 となる' }}
      </span>
    </div>

    <!-- リアルタイム情報モニター -->
    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-label">ホール電圧 <i>V</i><sub><i>H</i></sub> (上面 − 下面)</div>
        <div class="stat-value" :class="signedVh >= 0 ? 'text-rose' : 'text-cyan'">
          {{ signedVh > 0 ? '+' : '' }}{{ signedVh.toFixed(2) }} <span class="stat-unit">mV</span>
        </div>
        <div class="stat-formula">
          <i>V</i><sub><i>H</i></sub> = <span class="frac"><span class="num"><i>I B</i></span><span class="den"><i>n q t</i></span></span>
          ({{ carrierType === 'electron' ? '負の電圧' : '正の電圧' }})
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">上面の帯電極性</div>
        <div class="stat-value" :class="carrierType === 'electron' ? 'text-cyan' : 'text-rose'">
          {{ carrierType === 'electron' ? '− 極 (電子集積)' : '+ 極 (正孔集積)' }}
        </div>
        <div class="stat-formula">ローレンツ力 <i>q</i>(<i>v</i> × <i>B</i>) による偏向</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">ホール電場 <i>E</i><sub><i>H</i></sub></div>
        <div class="stat-value text-yellow">{{ (Math.abs(signedVh) / 20).toFixed(2) }} <span class="stat-unit">V/m</span></div>
        <div class="stat-formula"><i>E</i><sub><i>H</i></sub> = <i>v</i><sub><i>d</i></sub> <i>B</i> (静電力とつり合い)</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">ドリフト速度 <i>v</i><sub><i>d</i></sub></div>
        <div class="stat-value text-blue">{{ driftSpeedDisplay.toFixed(1) }} <span class="stat-unit">mm/s</span></div>
        <div class="stat-formula">{{ carrierType === 'electron' ? '← 左向きドリフト (-X)' : '→ 右向きドリフト (+X)' }}</div>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="controls-panel">
      <div class="controls-grid">
        <div class="control-group">
          <label class="control-label">
            <span>キャリアの種類:</span>
            <span class="control-val" :class="carrierType === 'electron' ? 'text-cyan' : 'text-rose'">
              {{ carrierType === 'electron' ? '電子 (-e)' : '正孔 (+e)' }}
            </span>
          </label>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: carrierType === 'electron' }" @click="setCarrier('electron')">
              電子 (-e, n型/金属)
            </button>
            <button class="select-btn" :class="{ active: carrierType === 'hole' }" @click="setCarrier('hole')">
              正孔 (+e, p型半導体)
            </button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>電流 <i>I</i>:</span>
            <span class="control-val text-yellow">{{ currentA.toFixed(1) }} A (右向き)</span>
          </label>
          <input type="range" v-model.number="currentA" min="0.5" max="5.0" step="0.5" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>磁束密度 <i>B</i>:</span>
            <span class="control-val text-cyan">{{ magneticTesla.toFixed(1) }} T (手前→奥)</span>
          </label>
          <input type="range" v-model.number="magneticTesla" min="0.2" max="2.0" step="0.2" class="sim-slider" />
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>キャリア密度 <i>n</i>:</span>
            <span class="control-val">{{ carrierDensity }}</span>
          </label>
          <div class="btn-group">
            <button class="select-btn" :class="{ active: isHighDensity }" @click="isHighDensity = !isHighDensity">
              {{ isHighDensity ? '金属並 (高密度: 小VH)' : '半導体並 (低密度: 大VH)' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 解説コールアウト -->
    <div class="sim-footer-note">
      💡 <strong>なぜキャリアの符号が判定できるのか？</strong>:
      <ul>
        <li><strong>電流が右向き</strong> のとき、<strong>電子（負）は左へ進み</strong>、<strong>正孔（正）は右へ進みます</strong>。</li>
        <li>奥向き磁場 <i>B</i> を加えると、電荷の符号と速度ベクトルの向きの双方が反転するため、<strong>ローレンツ力 <i>q</i>(<i>v</i> × <i>B</i>) の働く向きはどちらのキャリアでも「上向き」</strong> になります。</li>
        <li>その結果、上面にはキャリアそのものが集まるため、<strong>電子なら上面がマイナス電位（<i>V</i><sub><i>H</i></sub> &lt; 0）</strong>、<strong>正孔なら上面がプラス電位（<i>V</i><sub><i>H</i></sub> &gt; 0）</strong> となり、電圧の正負を測るだけでキャリアを100%特定できます。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const carrierType = ref('electron') // 'electron' | 'hole'
const currentA = ref(2.5) // A
const magneticTesla = ref(1.0) // T
const isHighDensity = ref(false)
const isPlaying = ref(true)
const timeScale = ref(1.0)
const activeCam = ref('3d')

const carrierDensity = computed(() => isHighDensity.value ? '高 (10²⁸ m⁻³)' : '低 (10²³ m⁻³)')
const driftSpeedDisplay = computed(() => {
  const base = isHighDensity.value ? 0.8 : 3.6
  return base * (currentA.value / 2.5)
})

const signedVh = computed(() => {
  const densityMult = isHighDensity.value ? 0.35 : 1.6
  const magnitude = currentA.value * magneticTesla.value * densityMult * 1.2
  return carrierType.value === 'electron' ? -magnitude : magnitude
})

function setCarrier(type) {
  carrierType.value = type
  rebuildSlabScene()
}

function toggleCarrier() {
  carrierType.value = carrierType.value === 'electron' ? 'hole' : 'electron'
  rebuildSlabScene()
}

const threeContainer = ref(null)
let threeCtx = null
let scene = null
let slabGroup = null
let carrierParticles = []
let topChargeMeshes = []
let bottomChargeMeshes = []
let fbArrow = null
let feArrow = null
let vArrow = null
let voltmeterLabel = null

// ==========================================================
// カメラ制御 & プリセット
// ==========================================================
function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return w < 540 || aspect < 1.35 ? Math.min(1.85, Math.max(1.15, 1.52 / Math.max(0.65, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'front') {
    return { pos: [0, 0, 32 * ms], target: [0, 0, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 32 * ms, 0.01], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [7.8 * ms, 6.2 * ms, 9.8 * ms], target: [0, 0, 0], fov: 38 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const params = getCamParams(preset)
  threeCtx.moveCameraTo(params.pos, params.target, duration, params.fov)
}

function resetCamera() {
  setCameraPreset('3d')
}

// ==========================================================
// 3D ホール素子シーン構築
// ==========================================================
const SLAB_W = 6.4 // X 長さ (電流方向)
const SLAB_H = 2.8 // Y 幅 (ホール電圧方向)
const SLAB_D = 2.0 // Z 厚さ (磁場方向)

function rebuildSlabScene() {
  if (!scene) return

  if (slabGroup) scene.remove(slabGroup)
  slabGroup = new THREE.Group()
  scene.add(slabGroup)

  carrierParticles.length = 0
  topChargeMeshes.length = 0
  bottomChargeMeshes.length = 0

  // 1. 基板 & グリッド
  const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b)
  grid.position.y = -2.2
  slabGroup.add(grid)

  // 2. ホール素子半導体ブロック (透明直方体)
  const isElec = carrierType.value === 'electron'
  const slabGeo = new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_D)
  const slabMat = new THREE.MeshStandardMaterial({
    color: isElec ? 0x0f172a : 0x1c1917,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.72
  })
  const slabMesh = new THREE.Mesh(slabGeo, slabMat)
  slabGroup.add(slabMesh)

  // エッジワイヤーフレーム (輪郭強調)
  const edgesGeo = new THREE.EdgesGeometry(slabGeo)
  const edgeMat = new THREE.LineBasicMaterial({
    color: isElec ? 0x38bdf8 : 0xfb7185,
    transparent: true,
    opacity: 0.8
  })
  const edgesMesh = new THREE.LineSegments(edgesGeo, edgeMat)
  slabGroup.add(edgesMesh)

  // 3. 電極端子 (左右端: 電流給電電極)
  const elecGeo = new THREE.BoxGeometry(0.18, SLAB_H, SLAB_D)
  const elecMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 })
  const leftElec = new THREE.Mesh(elecGeo, elecMat)
  leftElec.position.set(-SLAB_W / 2 - 0.09, 0, 0)
  slabGroup.add(leftElec)

  const rightElec = new THREE.Mesh(elecGeo, elecMat)
  rightElec.position.set(SLAB_W / 2 + 0.09, 0, 0)
  slabGroup.add(rightElec)

  // 電流給電リード線
  const leadPts1 = [new THREE.Vector3(-SLAB_W / 2 - 0.2, 0, 0), new THREE.Vector3(-SLAB_W / 2 - 1.2, 0, 0)]
  const lead1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(leadPts1), new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 }))
  slabGroup.add(lead1)

  const leadPts2 = [new THREE.Vector3(SLAB_W / 2 + 0.2, 0, 0), new THREE.Vector3(SLAB_W / 2 + 1.2, 0, 0)]
  const lead2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(leadPts2), new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 }))
  slabGroup.add(lead2)

  // 電流矢印ラベル
  const curSprite = createTextSprite('電流 I (+X 右向き)', { color: '#fbbf24', borderColor: '#f59e0b', fontSize: 28, scale: 0.38 })
  curSprite.position.set(0, -SLAB_H / 2 - 0.5, SLAB_D / 2 + 0.3)
  slabGroup.add(curSprite)

  // 4. ホール電圧検出用 電極端子 (上面・下面)
  const probeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16)
  const probeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 })

  const topProbe = new THREE.Mesh(probeGeo, probeMat)
  topProbe.position.set(0, SLAB_H / 2 + 0.06, 0)
  slabGroup.add(topProbe)

  const bottomProbe = new THREE.Mesh(probeGeo, probeMat)
  bottomProbe.position.set(0, -SLAB_H / 2 - 0.06, 0)
  slabGroup.add(bottomProbe)

  // 電圧計 (デジタルボルトメーター)
  const vMeterBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.4 })
  )
  vMeterBox.position.set(0, SLAB_H / 2 + 1.6, 0)
  slabGroup.add(vMeterBox)

  // 電圧計リード線 (上電極 & 下電極から電圧計へ)
  const vLeadPtsTop = [new THREE.Vector3(0, SLAB_H / 2 + 0.12, 0), new THREE.Vector3(0, SLAB_H / 2 + 1.2, 0)]
  slabGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vLeadPtsTop), new THREE.LineBasicMaterial({ color: 0xec4899 })))

  const vLeadPtsBot = [
    new THREE.Vector3(0, -SLAB_H / 2 - 0.12, 0),
    new THREE.Vector3(-1.8, -SLAB_H / 2 - 0.3, 0),
    new THREE.Vector3(-1.8, SLAB_H / 2 + 1.6, 0),
    new THREE.Vector3(-0.8, SLAB_H / 2 + 1.6, 0)
  ]
  slabGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vLeadPtsBot), new THREE.LineBasicMaterial({ color: 0x38bdf8 })))

  // 電圧計デジタルラベル
  const vText = `${signedVh.value > 0 ? '+' : ''}${signedVh.value.toFixed(2)} mV`
  voltmeterLabel = createTextSprite(`VH: ${vText}`, {
    color: isElec ? '#38bdf8' : '#fb7185',
    borderColor: isElec ? '#38bdf8' : '#fb7185',
    fontSize: 28,
    scale: 0.38
  })
  voltmeterLabel.position.set(0, SLAB_H / 2 + 2.3, 0)
  slabGroup.add(voltmeterLabel)

  // 5. 一様磁場 B (手前→奥: -Z方向) の矢印群
  const bArrowGroup = new THREE.Group()
  const bStepX = 1.6
  const bStepY = 1.0
  for (let x = -SLAB_W * 0.35; x <= SLAB_W * 0.35; x += bStepX) {
    for (let y = -SLAB_H * 0.3; y <= SLAB_H * 0.3; y += bStepY) {
      const bArr = createVectorArrow3D({ color: 0x38bdf8, shaftRadius: 0.04, headRadius: 0.12, headLength: 0.32, opacity: 0.55 })
      bArr.setVector(new THREE.Vector3(x, y, SLAB_D * 0.7), new THREE.Vector3(0, 0, -1), SLAB_D * 1.4)
      bArrowGroup.add(bArr)
    }
  }
  slabGroup.add(bArrowGroup)

  const bSprite = createTextSprite('磁場 B (-Z 奥向き ⊗)', { color: '#38bdf8', borderColor: '#0284c7', fontSize: 26, scale: 0.35 })
  bSprite.position.set(0, SLAB_H / 2 + 0.35, -SLAB_D / 2 - 0.3)
  slabGroup.add(bSprite)

  // 6. 表面蓄積電荷ビーズ (上面・下面)
  const chargeGeo = new THREE.SphereGeometry(0.1, 10, 10)
  const topChargeMat = new THREE.MeshStandardMaterial({
    color: isElec ? 0x38bdf8 : 0xfb7185,
    emissive: isElec ? 0x38bdf8 : 0xfb7185,
    emissiveIntensity: 0.6
  })
  const botChargeMat = new THREE.MeshStandardMaterial({
    color: isElec ? 0xfb7185 : 0x38bdf8,
    emissive: isElec ? 0xfb7185 : 0x38bdf8,
    emissiveIntensity: 0.6
  })

  for (let i = 0; i < 9; i++) {
    const x = (i / 8) * (SLAB_W - 0.8) - (SLAB_W - 0.8) / 2
    // 上面
    const cTop = new THREE.Mesh(chargeGeo, topChargeMat)
    cTop.position.set(x, SLAB_H / 2 - 0.06, 0)
    slabGroup.add(cTop)
    topChargeMeshes.push(cTop)

    // 下面
    const cBot = new THREE.Mesh(chargeGeo, botChargeMat)
    cBot.position.set(x, -SLAB_H / 2 + 0.06, 0)
    slabGroup.add(cBot)
    bottomChargeMeshes.push(cBot)
  }

  // 上面極性ラベル
  const topSignSprite = createTextSprite(isElec ? '帯電 (−) マイナス極' : '帯電 (+) プラス極', {
    color: isElec ? '#38bdf8' : '#fb7185',
    borderColor: isElec ? '#38bdf8' : '#fb7185',
    fontSize: 26,
    scale: 0.34
  })
  topSignSprite.position.set(0, SLAB_H / 2 + 0.45, 0)
  slabGroup.add(topSignSprite)

  // 7. ドリフト電荷キャリア粒子 (直方体内部を移動)
  const pCount = 28
  const pGeo = new THREE.SphereGeometry(0.11, 12, 12)
  const pMat = new THREE.MeshStandardMaterial({
    color: isElec ? 0x38bdf8 : 0xfb7185,
    emissive: isElec ? 0x38bdf8 : 0xfb7185,
    emissiveIntensity: 0.85
  })

  for (let k = 0; k < pCount; k++) {
    const p = new THREE.Mesh(pGeo, pMat)
    p.userData = {
      x: (Math.random() - 0.5) * (SLAB_W - 0.6),
      y: (Math.random() - 0.5) * (SLAB_H - 0.6),
      z: (Math.random() - 0.5) * (SLAB_D - 0.6),
      vx: isElec ? -1 : 1 // 電子は左へ、正孔は右へ
    }
    p.position.set(p.userData.x, p.userData.y, p.userData.z)
    slabGroup.add(p)
    carrierParticles.push(p)
  }

  // 8. 代表キャリア上の 3D 力ベクトル (Fb, Fe, v)
  fbArrow = createVectorArrow3D({ color: 0x10b981, shaftRadius: 0.06, headRadius: 0.18, headLength: 0.45 })
  feArrow = createVectorArrow3D({ color: 0xec4899, shaftRadius: 0.06, headRadius: 0.18, headLength: 0.45 })
  vArrow = createVectorArrow3D({ color: 0xfbbf24, shaftRadius: 0.06, headRadius: 0.18, headLength: 0.45 })
  slabGroup.add(fbArrow)
  slabGroup.add(feArrow)
  slabGroup.add(vArrow)

  updateRepresentativeCarrierVectors()
}

// ----------------------------------------------------------
// 代表キャリアのベクトル更新 (中央付近の粒子)
// ----------------------------------------------------------
function updateRepresentativeCarrierVectors() {
  if (!fbArrow || !feArrow || !vArrow) return

  const isElec = carrierType.value === 'electron'
  const repPos = new THREE.Vector3(0, 0, 0.4)

  // 速度ベクトル v: 電子は -X (左), 正孔は +X (右)
  vArrow.setVector(repPos, new THREE.Vector3(isElec ? -1 : 1, 0, 0), 1.2)

  // ローレンツ力 Fb = q(v x B):
  // どちらのキャリアでも Fb は上向き (+Y)!
  fbArrow.setVector(repPos, new THREE.Vector3(0, 1, 0), 1.3)

  // 静電力 Fe = q E_H:
  // 上向きのローレンツ力と釣り合うため、キャリアに働く電気力は下向き (-Y)!
  feArrow.setVector(repPos, new THREE.Vector3(0, -1, 0), 1.3)
}

// ==========================================================
// 毎フレーム アニメーション処理 (onFrame)
// ==========================================================
function onFrame(dt) {
  if (!isPlaying.value) return

  const effectiveDt = dt * timeScale.value
  const isElec = carrierType.value === 'electron'
  const speed = driftSpeedDisplay.value * 0.45

  // 粒子ドリフト & 上面偏向運動
  carrierParticles.forEach(p => {
    // X方向ドリフト
    p.position.x += p.userData.vx * speed * effectiveDt
    // 上面へのローレンツ力偏向 (Y方向への微小加速)
    p.position.y += 0.25 * effectiveDt

    // 境界条件 (端から出たら反対側からリスポーン)
    const halfW = (SLAB_W - 0.4) / 2
    const halfH = (SLAB_H - 0.3) / 2

    if (isElec) {
      if (p.position.x < -halfW) {
        p.position.x = halfW
        p.position.y = (Math.random() - 0.5) * (SLAB_H - 0.6)
      }
    } else {
      if (p.position.x > halfW) {
        p.position.x = -halfW
        p.position.y = (Math.random() - 0.5) * (SLAB_H - 0.6)
      }
    }

    // 上下端面でのバウンド/制限
    if (p.position.y > halfH) {
      p.position.y = halfH
    } else if (p.position.y < -halfH) {
      p.position.y = -halfH
    }
  })

  // 電圧計ラベルの数値更新
  if (voltmeterLabel) {
    const vText = `${signedVh.value > 0 ? '+' : ''}${signedVh.value.toFixed(2)} mV`
    const isE = carrierType.value === 'electron'
    voltmeterLabel.updateText(`VH: ${vText}`, isE ? '#38bdf8' : '#fb7185', isE ? '#38bdf8' : '#fb7185')
  }
}

watch([currentA, magneticTesla, isHighDensity], () => {
  if (voltmeterLabel) {
    const vText = `${signedVh.value > 0 ? '+' : ''}${signedVh.value.toFixed(2)} mV`
    const isE = carrierType.value === 'electron'
    voltmeterLabel.updateText(`VH: ${vText}`, isE ? '#38bdf8' : '#fb7185', isE ? '#38bdf8' : '#fb7185')
  }
  updateRepresentativeCarrierVectors()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 38,
    initialCamPos: [7.8, 6.2, 9.8],
    initialTarget: [0, 0, 0],
    background: 0x080c16,
    onFrame
  })
  scene = threeCtx.scene

  rebuildSlabScene()
  setCameraPreset('3d', 0)
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
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon {
  font-size: 1.3rem;
}

.sim-title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #f8fafc;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}

.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.badge-rose {
  background: rgba(251, 113, 133, 0.15);
  color: #fb7185;
  border: 1px solid rgba(251, 113, 133, 0.35);
}

.sim-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: #38bdf8;
  color: #f8fafc;
}

.tab-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.preset-group {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.chip-btn {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #94a3b8;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  border-color: #38bdf8;
  color: #e2e8f0;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.speed-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.speed-btn-group {
  display: flex;
  gap: 0.25rem;
}

.speed-btn-group button {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.speed-btn-group button.active {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  border-color: #38bdf8;
}

.btn {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #38bdf8;
  color: #090d16;
}

.btn-primary:hover {
  background: #7dd3fc;
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-secondary:hover {
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.2);
  margin-bottom: 0.75rem;
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
  pointer-events: none;
}

.three-hud-legend {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(6px);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  width: fit-content;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #cbd5e1;
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  right: 10px;
  pointer-events: none;
}

.three-hud-hint {
  background: rgba(9, 13, 22, 0.8);
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  color: #94a3b8;
}

.mode-status-strip {
  margin-bottom: 0.85rem;
}

.three-status-badge {
  display: block;
  padding: 0.5rem 0.85rem;
  border-radius: 4px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.three-status-badge.electron {
  background: rgba(56, 189, 248, 0.15);
  border-left: 3px solid #38bdf8;
  color: #7dd3fc;
}

.three-status-badge.hole {
  background: rgba(251, 113, 133, 0.15);
  border-left: 3px solid #fb7185;
  color: #fca5a5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.stat-card.highlight {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.05);
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-blue {
  color: #60a5fa;
}

.text-yellow {
  color: #fbbf24;
}

.text-cyan {
  color: #38bdf8;
}

.text-rose {
  color: #fb7185;
}

.stat-unit {
  font-size: 0.85rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-formula {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  font-size: 0.9em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.frac .den {
  padding-top: 1px;
}

.controls-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #cbd5e1;
  margin-bottom: 0.35rem;
}

.control-val {
  font-weight: 700;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.btn-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.select-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  padding: 0.3rem 0.65rem;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

.select-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.sim-footer-note {
  background: rgba(15, 23, 42, 0.5);
  border-left: 3px solid #38bdf8;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.sim-footer-note ul {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}

.sim-footer-note li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 340px;
  }
}
</style>
