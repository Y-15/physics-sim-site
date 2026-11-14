<template>
  <div class="lab" :style="{ '--ac': laserColorHex, '--ac2': '#38bdf8' }">
    <div class="lab-head">
      <span class="lab-title">🌈 3D 光の干渉・ヤングの二重スリット実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">波長 λ = {{ wavelengthNm }} nm（{{ laserColorName }}）</span>
      </div>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 正面視点
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

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-legend">
        <span class="legend-item">
          <i :style="{ background: laserColorHex, boxShadow: '0 0 6px ' + laserColorHex }"></i>
          干渉波 r₁, r₂ ({{ wavelengthNm }}nm)
        </span>
        <span class="legend-item">
          <i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>
          経路差 ΔL ≈ d sinθ
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          光強度曲線 I(x)
        </span>
        <span v-if="hasFilm" class="legend-item">
          <i style="background:#eab308;box-shadow:0 0 6px #eab308"></i>
          薄膜 (n=1.5)
        </span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 干渉条件ステータスバッジ -->
    <div class="ortho-status-strip">
      <span class="three-ortho-badge" :style="{ borderColor: laserColorHex, color: '#f8fafc' }">
        ✓ 明線間隔 Δx = {{ deltaX_mm.toFixed(2) }} mm ｜ {{ targetPointDesc }}
        <template v-if="inWater">｜ 水中 (n=1.33)</template>
        <template v-if="hasFilm">｜ 薄膜シフト (+{{ centerOffsetMm.toFixed(2) }} mm)</template>
      </span>
    </div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>光の波長 λ: <strong>{{ wavelengthNm }} nm</strong></label>
        <input type="range" v-model.number="wavelengthNm" min="380" max="780" step="5" />
        <div class="lab-row" style="margin-top:4px">
          <button class="lab-chip" :class="{ on: wavelengthNm === 650 }" @click="wavelengthNm = 650">赤 (650nm)</button>
          <button class="lab-chip" :class="{ on: wavelengthNm === 532 }" @click="wavelengthNm = 532">緑 (532nm)</button>
          <button class="lab-chip" :class="{ on: wavelengthNm === 450 }" @click="wavelengthNm = 450">青 (450nm)</button>
          <button class="lab-chip" :class="{ on: wavelengthNm === 405 }" @click="wavelengthNm = 405">紫 (405nm)</button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>スリット間隔 d: <strong>{{ slitD_um }} μm</strong> ({{ (slitD_um * 1e-3).toFixed(3) }} mm)</label>
        <input type="range" v-model.number="slitD_um" min="100" max="600" step="20" />
        <div class="lab-note">スリットが狭いほど、明線の間隔 Δx は広がる（逆比例）</div>
      </div>

      <div class="lab-ctrl">
        <label>スリット〜スクリーン間距離 L: <strong>{{ distL_m.toFixed(2) }} m</strong></label>
        <input type="range" v-model.number="distL_m" min="0.8" max="2.5" step="0.1" />
        <div class="lab-note">距離が遠いほど、干渉縞は拡大する（比例）</div>
      </div>

      <div class="lab-ctrl">
        <label>発展実験：媒質 &amp; 薄膜の挿入</label>
        <div class="lab-row">
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="inWater" /> 水中実験 (屈折率 n = 1.33)
          </label>
          <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="hasFilm" /> 上スリットに薄膜挿入 (厚さ 3μm, n=1.5)
          </label>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">明線間隔 Δx</div>
        <div class="v" :style="{ color: laserColorHex }">
          {{ deltaX_mm.toFixed(3) }} <small>mm</small>
        </div>
        <div class="f">Δx = <span class="frac"><span class="num">Lλ</span><span class="den">d</span></span>（波長が長いほど広がる！）</div>
      </div>

      <div class="lab-stat">
        <div class="k">中央明線 (m = 0) の位置 x₀</div>
        <div class="v" style="color:#e2e8f0">{{ centerOffsetMm.toFixed(3) }} <small>mm</small></div>
        <div class="f">{{ hasFilm ? '薄膜による光路差で上方にシフト！' : '中心 x = 0 に位置' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">第1明線 (m = ±1) の位置 x₁</div>
        <div class="v" style="color:#38bdf8">±{{ deltaX_mm.toFixed(3) }} <small>mm</small></div>
        <div class="f">経路差 Δl = λ = {{ effectiveLambdaNm.toFixed(0) }} nm</div>
      </div>

      <div class="lab-stat">
        <div class="k">媒質中の実効波長 λ'</div>
        <div class="v" style="color:#10b981">{{ effectiveLambdaNm.toFixed(0) }} <small>nm</small></div>
        <div class="f" v-if="inWater">水中では波長が <span class="frac"><span class="num">1</span><span class="den">n</span></span> に縮小し縞が詰まる</div>
        <div class="f" v-else>真空中 / 空気中 (n ≈ 1.0)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const wavelengthNm = ref(650) // nm (380 - 780)
const slitD_um = ref(250) // μm
const distL_m = ref(1.5) // m
const inWater = ref(false)
const hasFilm = ref(false)

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

// 屈折率
const mediumIndex = computed(() => (inWater.value ? 1.33 : 1.0))
const effectiveLambdaNm = computed(() => wavelengthNm.value / mediumIndex.value)

// 380–780 nm 連続スペクトル RGB 変換 (暗背景上の高視認性のため端域の最低輝度を確保)
function wavelengthToSpectralRGB(nm) {
  let r = 0
  let g = 0
  let b = 0
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380)
    g = 0
    b = 1
  } else if (nm >= 440 && nm < 490) {
    r = 0
    g = (nm - 440) / (490 - 440)
    b = 1
  } else if (nm >= 490 && nm < 510) {
    r = 0
    g = 1
    b = -(nm - 510) / (510 - 490)
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510)
    g = 1
    b = 0
  } else if (nm >= 580 && nm < 645) {
    r = 1
    g = -(nm - 645) / (645 - 580)
    b = 0
  } else if (nm >= 645 && nm <= 780) {
    r = 1
    g = 0
    b = 0
  }

  let factor = 1.0
  if (nm >= 380 && nm < 420) {
    factor = 0.55 + 0.45 * ((nm - 380) / (420 - 380))
  } else if (nm > 700 && nm <= 780) {
    factor = 0.55 + 0.45 * ((780 - nm) / (780 - 700))
  }

  const gamma = 0.8
  const R = r === 0 ? 0 : Math.round(255 * Math.pow(r * factor, gamma))
  const G = g === 0 ? 0 : Math.round(255 * Math.pow(g * factor, gamma))
  const B = b === 0 ? 0 : Math.round(255 * Math.pow(b * factor, gamma))

  const hexStr = '#' + [R, G, B].map(v => v.toString(16).padStart(2, '0')).join('')
  const colorInt = (R << 16) | (G << 8) | B
  return { r: R, g: G, b: B, hexStr, colorInt }
}

const spectral = computed(() => wavelengthToSpectralRGB(wavelengthNm.value))
const laserColorHex = computed(() => spectral.value.hexStr)
const laserColorInt = computed(() => spectral.value.colorInt)

const laserColorName = computed(() => {
  const w = wavelengthNm.value
  if (w >= 620) return '赤色光'
  if (w >= 590) return '橙色光'
  if (w >= 570) return '黄色光'
  if (w >= 495) return '緑色光'
  if (w >= 450) return '青色光'
  return '紫色光'
})

// 明線間隔 Δx = L * λ / d [mm]
const deltaX_mm = computed(() => {
  return (distL_m.value * effectiveLambdaNm.value) / slitD_um.value
})

// 薄膜（厚さ t = 3 μm, 屈折率 n = 1.5）による光路差のシフト [mm]
const centerOffsetMm = computed(() => {
  if (!hasFilm.value) return 0
  const optDiffNm = (1.5 - 1.0) * 3000 // 1500 nm
  return (distL_m.value * optDiffNm) / slitD_um.value
})

const threeContainer = ref(null)
let threeCtx = null
let staticGroup = null
let waveGroup = null
let waveObjects = null
let animTime = 0
let lastCamAspect = 0

function getMobileScale() {
  if (!threeCtx || !threeCtx.camera) return 1.0
  const aspect = threeCtx.camera.aspect || 1.7
  return aspect < 1.35 ? Math.min(2.15, 1.56 / Math.max(0.62, aspect)) : 1.0
}

function isNarrowViewport() {
  return Boolean(threeCtx?.camera && threeCtx.camera.aspect < 1.35)
}

function getSpriteScale(baseScale = 0.48) {
  if (!isNarrowViewport()) return baseScale
  return baseScale * Math.min(1.9, getMobileScale() * 1.08)
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  if (preset === '3d') {
    threeCtx.moveCameraTo([-1.5 * s, 4.3 * s, 13.8 * s], [-0.2, 0, 0], duration, 42)
  } else if (preset === 'side') {
    threeCtx.moveCameraTo([-0.2, 0.1, 45.0 * s], [-0.2, 0, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([-0.2, 45.0 * s, 0.08], [-0.2, 0, 0], duration, 14)
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

// スクリーン上の干渉縞テクスチャを生成
function createFringeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#030712'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const { r: r255, g: g255, b: b255 } = spectral.value

  const unitsPerMm = 0.22
  const fringeSpacingU = Math.max(0.28, deltaX_mm.value * unitsPerMm)
  const shiftU = Math.min(1.6, centerOffsetMm.value * unitsPerMm)
  const screenHeightU = 5.2

  for (let py = 0; py < canvas.height; py++) {
    const yU = (0.5 - py / canvas.height) * screenHeightU
    const dy = yU - shiftU
    const phase = (Math.PI * dy) / fringeSpacingU
    const intensity = Math.pow(Math.cos(phase), 2)

    // 明るい明線の中心にわずかな白輝度ハイライトを加えてコントラスト強化
    const core = Math.pow(intensity, 4) * 0.35
    const cr = Math.min(255, Math.round(r255 + (255 - r255) * core))
    const cg = Math.min(255, Math.round(g255 + (255 - g255) * core))
    const cb = Math.min(255, Math.round(b255 + (255 - b255) * core))

    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.04 + intensity * 0.96})`
    ctx.fillRect(8, py, canvas.width - 16, 1)
  }

  // 中央ライン x=0 の微細目盛り
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(8, canvas.height / 2)
  ctx.lineTo(canvas.width - 8, canvas.height / 2)
  ctx.stroke()
  ctx.setLineDash([])

  // 枠線
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)'
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function getLayoutParams() {
  const slitX = -2.3
  const screenX = slitX + 2.5 + (distL_m.value - 0.8) * 1.9 // 0.8m -> 0.2, 2.5m -> 3.43
  const slitHalf = Math.min(1.15, Math.max(0.35, (slitD_um.value / 250) * 0.65))
  const unitsPerMm = 0.22
  const fringeSpacingU = Math.max(0.28, deltaX_mm.value * unitsPerMm)
  const shiftU = Math.min(1.6, centerOffsetMm.value * unitsPerMm)

  let targetOrder = 1
  let targetY = shiftU + fringeSpacingU
  if (targetY > 2.45) {
    if (shiftU > 0.25 && shiftU <= 2.45) {
      targetOrder = 0
      targetY = shiftU
    } else {
      targetOrder = 0
      targetY = 0
    }
  }
  return { slitX, screenX, slitHalf, fringeSpacingU, shiftU, targetY, targetOrder }
}

const targetPointDesc = computed(() => {
  const { targetOrder } = getLayoutParams()
  if (targetOrder === 1) {
    return `点P(m=+1明線): 経路差 ΔL = λ' = ${effectiveLambdaNm.value.toFixed(0)} nm`
  }
  return hasFilm.value
    ? '点P(m=0 中央明線): 薄膜の光路差により上方へ移動'
    : `点P(m=0 明線): 経路差 ΔL = 0 nm`
})

function rebuildScene() {
  if (!staticGroup) return
  clearGroup(staticGroup)

  const { slitX, screenX, slitHalf, fringeSpacingU, shiftU, targetY, targetOrder } = getLayoutParams()
  const floorY = -3.15
  const lColor = laserColorInt.value
  const narrow = isNarrowViewport()

  // 1. 3D 光学テーブル床 & 光軸
  const grid = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a)
  grid.position.set(0, floorY, 0)
  staticGroup.add(grid)

  const tableGeo = new THREE.BoxGeometry(14.8, 0.22, 3.8)
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.65,
    roughness: 0.35
  })
  const tableMesh = new THREE.Mesh(tableGeo, tableMat)
  tableMesh.position.set(-0.2, floorY + 0.11, 0)
  staticGroup.add(tableMesh)

  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-6.8, 0, 0),
    new THREE.Vector3(screenX + 0.2, 0, 0)
  ])
  staticGroup.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 })))

  // 水中実験時は半透明水槽を表示 (depthWrite: false で内部波面を遮蔽しない)
  if (inWater.value) {
    const tankW = screenX - slitX + 1.5
    const tankGeo = new THREE.BoxGeometry(tankW, 5.5, 3.6)
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      roughness: 0.15
    })
    const tankMesh = new THREE.Mesh(tankGeo, tankMat)
    tankMesh.position.set((slitX + screenX) / 2, 0, 0)
    tankMesh.renderOrder = 0
    staticGroup.add(tankMesh)

    const tankEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(tankGeo),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, depthWrite: false })
    )
    tankEdges.position.copy(tankMesh.position)
    tankEdges.renderOrder = 0
    staticGroup.add(tankEdges)

    const waterLbl = createTextSprite(
      narrow ? '水中 n=1.33' : '水中実験 (n = 1.33 → 波長 λ/n に短縮)',
      {
        color: '#7dd3fc',
        borderColor: '#38bdf8',
        fontSize: 30,
        scale: getSpriteScale(0.48)
      }
    )
    waterLbl.position.set((slitX + screenX) / 2 + 0.35, 3.25, 2.85)
    staticGroup.add(waterLbl)
  }

  // 2. コヒーレント単色レーザー光源 (x = -5.6) + 台座 + 発光射出口リング
  const laserX = -5.6
  const bodyGeo = new THREE.CylinderGeometry(0.42, 0.44, 1.5, 24)
  bodyGeo.rotateZ(Math.PI / 2)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.28
  })
  const laserBody = new THREE.Mesh(bodyGeo, bodyMat)
  laserBody.position.set(laserX, 0, 0)
  staticGroup.add(laserBody)

  const laserNozzle = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.055, 14, 28),
    new THREE.MeshBasicMaterial({ color: lColor })
  )
  laserNozzle.rotation.y = Math.PI / 2
  laserNozzle.position.set(laserX + 0.76, 0, 0)
  staticGroup.add(laserNozzle)

  const laserPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, Math.abs(floorY + 0.22), 14),
    bodyMat
  )
  laserPost.position.set(laserX, (floorY + 0.22) / 2, 0)
  staticGroup.add(laserPost)

  // レーザー入射ビーム束 (laserX + 0.76 -> slitX)
  const beamLen = slitX - (laserX + 0.76)
  const beamGeo = new THREE.CylinderGeometry(slitHalf + 0.28, slitHalf + 0.28, beamLen, 24)
  beamGeo.rotateZ(Math.PI / 2)
  const beamMat = new THREE.MeshBasicMaterial({
    color: lColor,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  })
  const beamMesh = new THREE.Mesh(beamGeo, beamMat)
  beamMesh.position.set(laserX + 0.76 + beamLen / 2, 0, 0)
  staticGroup.add(beamMesh)

  const laserLbl = createTextSprite(narrow ? `${wavelengthNm.value} nm` : `単色光 (${wavelengthNm.value} nm)`, {
    color: laserColorHex.value,
    borderColor: laserColorHex.value,
    fontSize: 32,
    scale: getSpriteScale(0.50)
  })
  laserLbl.position.set(laserX + 1.10, 1.48, -1.55)
  staticGroup.add(laserLbl)

  // 3. 3D 二重スリット遮光板 (x = slitX)
  const plateW = 0.18
  const plateZ = 2.8
  const gapH = 0.16
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.65,
    roughness: 0.38
  })

  const topH = Math.max(0.2, 2.6 - (slitHalf + gapH / 2))
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(plateW, topH, plateZ), plateMat)
  topPlate.position.set(slitX, slitHalf + gapH / 2 + topH / 2, 0)
  staticGroup.add(topPlate)

  const midH = Math.max(0.15, 2 * slitHalf - gapH)
  const midPlate = new THREE.Mesh(new THREE.BoxGeometry(plateW, midH, plateZ), plateMat)
  midPlate.position.set(slitX, 0, 0)
  staticGroup.add(midPlate)

  const botH = Math.max(0.2, 2.6 - (slitHalf + gapH / 2))
  const botPlate = new THREE.Mesh(new THREE.BoxGeometry(plateW, botH, plateZ), plateMat)
  botPlate.position.set(slitX, -(slitHalf + gapH / 2 + botH / 2), 0)
  staticGroup.add(botPlate)

  // スリット発光スリット S1, S2
  const slitGlowGeo = new THREE.BoxGeometry(0.2, 0.085, plateZ * 0.76)
  const slitGlowMat = new THREE.MeshBasicMaterial({ color: lColor })
  const s1Mesh = new THREE.Mesh(slitGlowGeo, slitGlowMat)
  s1Mesh.position.set(slitX, slitHalf, 0)
  const s2Mesh = new THREE.Mesh(slitGlowGeo, slitGlowMat)
  s2Mesh.position.set(slitX, -slitHalf, 0)
  staticGroup.add(s1Mesh, s2Mesh)

  // S1, S2 ラベル (zを前後分離して真上視点でも非重複化)
  const s1Lbl = createTextSprite('S₁', { color: '#f8fafc', borderColor: '#38bdf8', fontSize: 32, scale: getSpriteScale(0.42) })
  s1Lbl.position.set(slitX - 0.45, slitHalf + (narrow ? 0.36 : 0.28), 1.05)
  const s2Lbl = createTextSprite('S₂', { color: '#f8fafc', borderColor: '#38bdf8', fontSize: 32, scale: getSpriteScale(0.42) })
  s2Lbl.position.set(slitX - 0.45, -slitHalf - (narrow ? 0.36 : 0.28), -1.05)
  staticGroup.add(s1Lbl, s2Lbl)

  // スリット間隔 d の寸法バー
  const dBarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const dBar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2 * slitHalf, 8), dBarMat)
  dBar.position.set(slitX - 0.22, 0, 1.45)
  staticGroup.add(dBar)

  const dLbl = createTextSprite(
    narrow ? `d=${slitD_um.value}μm` : `スリット間隔 d = ${slitD_um.value} μm`,
    {
      color: '#7dd3fc',
      borderColor: '#38bdf8',
      fontSize: 30,
      scale: getSpriteScale(0.46)
    }
  )
  dLbl.position.set(slitX - 0.45, narrow ? -3.02 : -2.95, 2.15)
  staticGroup.add(dLbl)

  // 薄膜挿入 (S1 直後)
  if (hasFilm.value) {
    const filmGeo = new THREE.BoxGeometry(0.20, 0.44, plateZ * 0.78)
    const filmMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xeab308,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.78
    })
    const filmMesh = new THREE.Mesh(filmGeo, filmMat)
    filmMesh.position.set(slitX + 0.22, slitHalf, 0)
    staticGroup.add(filmMesh)

    const filmLbl = createTextSprite(narrow ? '薄膜 n=1.5' : '薄膜 (n=1.5)', {
      color: '#fde047',
      borderColor: '#eab308',
      fontSize: 30,
      scale: getSpriteScale(0.44)
    })
    filmLbl.position.set(slitX + 0.45, slitHalf + (narrow ? 0.85 : 0.68), 0.15)
    staticGroup.add(filmLbl)
  }

  // 4. 経路差 ΔL ≈ d sinθ の幾何ハイライト (S1からS2Pへの垂線の足 H とゴールド区間 S2→H)
  const s1Pos = new THREE.Vector3(slitX, slitHalf, 0)
  const s2Pos = new THREE.Vector3(slitX, -slitHalf, 0)
  const pTarget = new THREE.Vector3(screenX, targetY, 0)

  // r1, r2 の直線ガイド
  const guideRayMat = new THREE.LineBasicMaterial({ color: lColor, transparent: true, opacity: 0.35 })
  staticGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([s1Pos, pTarget]), guideRayMat))
  staticGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([s2Pos, pTarget]), guideRayMat))

  // 垂線の足 H = S2 + ((S1 - S2) · u2P) * u2P
  const u2P = pTarget.clone().sub(s2Pos).normalize()
  const projLen = s1Pos.clone().sub(s2Pos).dot(u2P)
  const hPos = s2Pos.clone().addScaledVector(u2P, Math.max(0.18, projLen))

  // 垂線 S1 -> H (白/シアン細線)
  const perpLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([s1Pos, hPos]),
    new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.85 })
  )
  staticGroup.add(perpLine)

  // 経路差 ΔL = S2 -> H を明るいゴールド/アンバー (#fbbf24) の太い発光チューブで強調
  const dlCurve = new THREE.LineCurve3(s2Pos, hPos)
  const dlTube = new THREE.Mesh(
    new THREE.TubeGeometry(dlCurve, 8, 0.068, 10, false),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.78,
      roughness: 0.15
    })
  )
  dlTube.renderOrder = 2
  staticGroup.add(dlTube)

  const beadGeo = new THREE.SphereGeometry(0.085, 12, 12)
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xfde047 })
  const bS2 = new THREE.Mesh(beadGeo, beadMat)
  bS2.position.copy(s2Pos)
  const bH = new THREE.Mesh(beadGeo, beadMat)
  bH.position.copy(hPos)
  staticGroup.add(bS2, bH)

  const dlMid = new THREE.Vector3().lerpVectors(s2Pos, hPos, 0.5)
  const dlLblPos = new THREE.Vector3(Math.min(screenX - 1.15, Math.max(-0.65, dlMid.x + 1.45)), -slitHalf - (narrow ? 1.05 : 0.95), -1.15)
  staticGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([dlMid, dlLblPos]),
      new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6 })
    )
  )
  const dlLbl = createTextSprite(
    narrow
      ? 'ΔL≈d sinθ'
      : (targetOrder === 1
          ? (hasFilm.value ? 'ΔL ≈ d sinθ (+光路差)' : '経路差 ΔL ≈ d sinθ = λ')
          : (hasFilm.value ? 'ΔL ≈ d sinθ (光路差補償)' : '経路差 ΔL ≈ d sinθ')),
    {
      color: '#fde68a',
      borderColor: '#fbbf24',
      fontSize: 30,
      scale: getSpriteScale(0.46)
    }
  )
  dlLbl.position.copy(dlLblPos)
  staticGroup.add(dlLbl)

  // 点 P のハイライト球 & ラベル (z=+0.45 で dlLbl(z=+1.65) / scrLbl(z=-2.05) と完全分離)
  const pDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  )
  pDot.position.copy(pTarget)
  staticGroup.add(pDot)

  const pLbl = createTextSprite(
    targetOrder === 1 ? (narrow ? 'P(m=+1)' : 'P (m=+1 明線)') : (narrow ? 'P(m=0)' : 'P (m=0 明線)'),
    {
      color: '#fde68a',
      borderColor: '#fbbf24',
      fontSize: 28,
      scale: getSpriteScale(0.42)
    }
  )
  pLbl.position.set(screenX - 0.65, Math.min(2.38, targetY + (narrow ? 0.56 : 0.44)), 0.45)
  staticGroup.add(pLbl)

  // 5. 3D 観測スクリーン (x = screenX) と干渉縞テクスチャ
  const fringeTex = createFringeTexture()
  const screenGeo = new THREE.BoxGeometry(0.18, 5.2, 3.0)
  const screenSideMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
  const screenFaceMat = new THREE.MeshBasicMaterial({ map: fringeTex })
  const screenMaterials = [
    screenFaceMat,
    screenFaceMat,
    screenSideMat,
    screenSideMat,
    screenFaceMat,
    screenSideMat
  ]
  const screenMesh = new THREE.Mesh(screenGeo, screenMaterials)
  screenMesh.position.set(screenX, 0, 0)
  staticGroup.add(screenMesh)

  const scrLbl = createTextSprite(
    narrow ? `スクリーン L=${distL_m.value.toFixed(1)}m` : `観測スクリーン (L = ${distL_m.value.toFixed(2)} m)`,
    {
      color: '#e2e8f0',
      borderColor: '#94a3b8',
      fontSize: 30,
      scale: getSpriteScale(0.48)
    }
  )
  scrLbl.position.set(screenX - 0.15, narrow ? 3.35 : 3.25, -2.35)
  staticGroup.add(scrLbl)

  // 6. 3D 光強度分布曲線 I(y) + 塗潰し発光リボン (スクリーン右側 x = screenX + 0.25 .. + 1.60)
  const curvePts = []
  const samples = 140
  const screenHeightU = 5.2
  const baseGraphX = screenX + 0.25
  const ribbonPositions = new Float32Array((samples + 1) * 2 * 3)
  const ribbonIndices = []

  for (let i = 0; i <= samples; i++) {
    const yU = -screenHeightU / 2 + (i / samples) * screenHeightU
    const phase = (Math.PI * (yU - shiftU)) / fringeSpacingU
    const intensity = Math.pow(Math.cos(phase), 2)
    const xPos = baseGraphX + intensity * 1.35
    curvePts.push(new THREE.Vector3(xPos, yU, 0))

    // 塗りつぶしリボン (z=0平面)
    const vIdx = i * 2
    ribbonPositions[vIdx * 3] = baseGraphX
    ribbonPositions[vIdx * 3 + 1] = yU
    ribbonPositions[vIdx * 3 + 2] = 0
    ribbonPositions[(vIdx + 1) * 3] = xPos
    ribbonPositions[(vIdx + 1) * 3 + 1] = yU
    ribbonPositions[(vIdx + 1) * 3 + 2] = 0

    if (i < samples) {
      const a = vIdx
      const b = vIdx + 1
      const c = vIdx + 2
      const d = vIdx + 3
      ribbonIndices.push(a, b, c, b, d, c)
    }
  }

  const ribbonGeo = new THREE.BufferGeometry()
  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3))
  ribbonGeo.setIndex(ribbonIndices)
  const ribbonMat = new THREE.MeshBasicMaterial({
    color: lColor,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  staticGroup.add(new THREE.Mesh(ribbonGeo, ribbonMat))

  const intensityCurve = new THREE.CatmullRomCurve3(curvePts)
  const iTubeGeo = new THREE.TubeGeometry(intensityCurve, 140, 0.044, 10, false)
  const iTubeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.55,
    roughness: 0.2
  })
  staticGroup.add(new THREE.Mesh(iTubeGeo, iTubeMat))

  const iLbl = createTextSprite(narrow ? 'I(x)' : '光強度曲線 I(x)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 30,
    scale: getSpriteScale(0.46)
  })
  iLbl.position.set(screenX + 1.35, narrow ? -3.02 : -2.92, 2.25)
  staticGroup.add(iLbl)

  // m = 0, ±1 の次数ラベル (狭小モバイルは m=0 のみ表示し、真上視点ではZをずらして重複防止)
  for (let m = -1; m <= 1; m++) {
    if (narrow && m !== 0) continue
    const yM = shiftU + m * fringeSpacingU
    if (Math.abs(yM) > 2.35) continue
    const mLbl = createTextSprite(m === 0 ? (narrow ? 'm=0' : 'm=0 (明)') : `m=${m > 0 ? '+' + m : m}`, {
      color: m === 0 ? '#fde68a' : '#cbd5e1',
      borderColor: m === 0 ? '#f59e0b' : 'rgba(148,163,184,0.45)',
      fontSize: 28,
      scale: getSpriteScale(0.40)
    })
    mLbl.position.set(screenX + 2.15, yM, m * -1.05)
    staticGroup.add(mLbl)
  }

  // 動的波メッシュの色を波長と同期
  if (waveObjects) {
    waveObjects.waveMats.forEach(mat => mat.color.setHex(lColor))
    waveObjects.arcMats.forEach(mat => mat.color.setHex(lColor))
    waveObjects.planeMat.color.setHex(lColor)
  }
}

function initWaveObjects() {
  if (!waveGroup) return
  const lColor = laserColorInt.value
  const waveSteps = 76

  // 2本のリボンメッシュ (r1, r2 干渉波の滑らかな3Dリボン)
  const ribbons = []
  const waveMats = []
  const ribbonIndices = []
  for (let i = 0; i < waveSteps; i++) {
    const a = i * 2
    const b = i * 2 + 1
    const c = (i + 1) * 2
    const d = (i + 1) * 2 + 1
    ribbonIndices.push(a, b, c, b, d, c)
  }

  for (let w = 0; w < 2; w++) {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((waveSteps + 1) * 2 * 3), 3))
    geo.setIndex(ribbonIndices)
    const mat = new THREE.MeshBasicMaterial({
      color: lColor,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geo, mat)
    waveGroup.add(mesh)
    ribbons.push(mesh)
    waveMats.push(mat)
  }

  // 半円波面リング (2スリット x 6本 = 12 Lineオブジェクトを再利用)
  const numArcs = 6
  const arcSteps = 28
  const arcs = []
  const arcMats = []
  for (let i = 0; i < numArcs; i++) {
    const mat = new THREE.LineBasicMaterial({ color: lColor, transparent: true, opacity: 0.3 })
    arcMats.push(mat)
    const pair = []
    for (let sIdx = 0; sIdx < 2; sIdx++) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((arcSteps + 1) * 3), 3))
      const line = new THREE.Line(geo, mat)
      waveGroup.add(line)
      pair.push(line)
    }
    arcs.push(pair)
  }

  // レーザー入射平面波バー (4本)
  const planeMat = new THREE.MeshBasicMaterial({ color: lColor, transparent: true, opacity: 0.55 })
  const planeBars = []
  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1, 0.2), planeMat)
    waveGroup.add(bar)
    planeBars.push(bar)
  }

  waveObjects = {
    waveSteps,
    ribbons,
    waveMats,
    numArcs,
    arcSteps,
    arcs,
    arcMats,
    planeBars,
    planeMat
  }
}

function updateDynamicWaves(dt) {
  if (!waveObjects) return
  if (isPlaying.value) {
    animTime += dt * 4.2 * timeScale.value
  }

  const { slitX, screenX, slitHalf, targetY } = getLayoutParams()
  const { waveSteps, ribbons, numArcs, arcSteps, arcs, arcMats, planeBars } = waveObjects

  // 1. S1, S2 -> P(screenX, targetY) への干渉波リボン (メモリ確保ゼロで頂点更新)
  const pTarget = new THREE.Vector3(screenX, targetY, 0)
  const s1Pos = new THREE.Vector3(slitX, slitHalf, 0)
  const s2Pos = new THREE.Vector3(slitX, -slitHalf, 0)
  const waveLenU = 0.54 * (effectiveLambdaNm.value / 550)
  const halfZ = 0.045

  const paths = [
    { start: s1Pos, phaseShift: hasFilm.value ? Math.PI : 0 },
    { start: s2Pos, phaseShift: 0 }
  ]

  paths.forEach((p, idx) => {
    const dir = pTarget.clone().sub(p.start)
    const len = dir.length()
    const unitDir = dir.normalize()
    const normal = new THREE.Vector3(-unitDir.y, unitDir.x, 0)
    const posAttr = ribbons[idx].geometry.getAttribute('position')
    const arr = posAttr.array

    for (let i = 0; i <= waveSteps; i++) {
      const dist = (i / waveSteps) * len
      const bx = p.start.x + unitDir.x * dist
      const by = p.start.y + unitDir.y * dist
      const amp = 0.11 * Math.sin((2 * Math.PI * dist) / waveLenU - animTime * 2.2 + p.phaseShift)
      const px = bx + normal.x * amp
      const py = by + normal.y * amp

      const vIdx = i * 2
      arr[vIdx * 3] = px
      arr[vIdx * 3 + 1] = py
      arr[vIdx * 3 + 2] = -halfZ
      arr[(vIdx + 1) * 3] = px
      arr[(vIdx + 1) * 3 + 1] = py
      arr[(vIdx + 1) * 3 + 2] = halfZ
    }
    posAttr.needsUpdate = true
  })

  // 2. スリット S1, S2 から広がる半円波面リング
  const maxR = screenX - slitX
  const spacingR = maxR / numArcs
  const slitYs = [slitHalf, -slitHalf]

  for (let i = 0; i < numArcs; i++) {
    const r = i * spacingR + ((animTime * 0.45) % spacingR)
    const visible = r >= 0.22 && r <= maxR
    arcMats[i].opacity = visible ? Math.max(0.06, (1 - r / maxR) * 0.36) : 0

    for (let sIdx = 0; sIdx < 2; sIdx++) {
      const line = arcs[i][sIdx]
      line.visible = visible
      if (!visible) continue
      const sy = slitYs[sIdx]
      const posAttr = line.geometry.getAttribute('position')
      const arr = posAttr.array
      let validCount = 0
      for (let k = 0; k <= arcSteps; k++) {
        const ang = -Math.PI * 0.34 + (k / arcSteps) * (Math.PI * 0.68)
        const px = slitX + r * Math.cos(ang)
        const py = sy + r * Math.sin(ang)
        if (px <= screenX && Math.abs(py) <= 2.55) {
          arr[validCount * 3] = px
          arr[validCount * 3 + 1] = py
          arr[validCount * 3 + 2] = 0
          validCount++
        }
      }
      line.geometry.setDrawRange(0, Math.max(0, validCount))
      posAttr.needsUpdate = true
    }
  }

  // 3. 入射平行平面波バー (レーザー -> スリット)
  const beamStart = -4.84
  const beamSpan = slitX - beamStart
  const barH = (slitHalf + 0.24) * 2
  for (let i = 0; i < planeBars.length; i++) {
    const frac = ((i / planeBars.length) + animTime * 0.14) % 1
    planeBars[i].position.set(beamStart + frac * beamSpan, 0, 0)
    planeBars[i].scale.set(1, barH, 1)
  }
}

watch([wavelengthNm, slitD_um, distL_m, inWater, hasFilm], () => {
  rebuildScene()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [-1.5, 4.3, 13.8],
    initialTarget: [-0.2, 0, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        rebuildScene()
      }
      updateDynamicWaves(dt)
    }
  })
  staticGroup = new THREE.Group()
  waveGroup = new THREE.Group()
  threeCtx.scene.add(staticGroup)
  threeCtx.scene.add(waveGroup)
  initWaveObjects()
  rebuildScene()
  lastCamAspect = threeCtx.camera.aspect || 1.7
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
.camera-preset-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.2);
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
  height: 420px;
  background: #080c16;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
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
  font-size: 0.73rem;
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
  font-weight: 700;
  max-width: 100%;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 345px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.68rem;
    padding: 4px 8px;
  }
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    font-size: 0.70rem;
    padding: 4px 9px;
  }
}

@media (max-width: 640px) {
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
