<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">✨</span>
        <h3>3D くさび形空気層の干渉シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        2枚のベベル加工された半透明ガラス板と薄い箔がつくる「くさび形空気層」。
        上ガラス下面反射（位相ズレなし・自由端）と下ガラス上面反射（位相 π 反転・固定端）の干渉により、接触端 <i>x</i>=0 が暗線となる等間隔の平行干渉縞と側面光路差拡大断面を3Dで観察できます。
      </p>
    </div>

    <!-- 3D カメラ視点プリセット -->
    <div class="camera-preset-bar">
      <div class="preset-group">
        <span class="preset-label">🎥 カメラ視点:</span>
        <button class="chip-btn" :class="{ active: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 正面/断面視点
        </button>
        <button class="chip-btn" :class="{ active: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面視点
        </button>
      </div>
      <div class="preset-group">
        <button class="chip-btn" :class="{ active: showCloseup }" @click="showCloseup = !showCloseup">
          {{ showCloseup ? '🔍 側面拡大断面: ON' : '🔍 側面拡大断面: OFF' }}
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="play-btn" @click="isPlaying = !isPlaying">
        {{ isPlaying ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">0.25x</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">0.5x</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x</button>
        </div>
      </div>
      <button class="step-btn" @click="stepSim(0.05)">⏭ コマ送り</button>
    </div>

    <!-- 凡例・ステータスバー (ビューポート外配置で3Dラベルと非重複) -->
    <div class="three-hud-top">
      <div class="three-hud-legend">
        <span class="legend-item">
          <i :style="{ background: activeWaveCss, boxShadow: '0 0 6px ' + activeWaveCss }"></i>
          上方平行光 ({{ wavelengthNm }}nm)
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          上板下面反射 (位相ズレなし)
        </span>
        <span class="legend-item">
          <i style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
          下板上面反射 (πズレ・固定端)
        </span>
      </div>
      <div class="three-ortho-badge">
        明線間隔 Δx = {{ fringeSpacingMm.toFixed(2) }} mm | 接触端 x=0: 暗線
      </div>
    </div>

    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>挟んだ箔の厚さ <i>D</i>: <strong>{{ thicknessUm }} µm</strong></span>
            <input type="range" v-model.number="thicknessUm" min="5" max="60" step="1" />
          </label>
          <div class="ctrl-note">箔が厚いほどくさび角 θ が急になり、干渉縞の間隔 Δx が狭まります</div>
        </div>

        <div class="control-group">
          <label>
            <span>ガラス板の長さ <i>L</i>: <strong>{{ lengthMm }} mm</strong></span>
            <input type="range" v-model.number="lengthMm" min="40" max="150" step="5" />
          </label>
          <div class="ctrl-note">長いほど傾斜が緩やかになり、明線間隔 Δx = Lλ / 2nD が広がります</div>
        </div>

        <div class="control-group">
          <label>
            <span>入射光の波長 λ: <strong :style="{ color: activeWaveCss }">{{ wavelengthNm }} nm</strong></span>
            <input type="range" v-model.number="wavelengthNm" min="380" max="780" step="5" />
          </label>
          <div class="spectral-bar"></div>
          <div class="quick-chips">
            <button class="mini-chip" :class="{ on: wavelengthNm === 450 }" @click="wavelengthNm = 450">450nm 青</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 532 }" @click="wavelengthNm = 532">532nm 緑</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 589 }" @click="wavelengthNm = 589">589nm Na-D</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 656 }" @click="wavelengthNm = 656">656nm 赤</button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>空気層の媒質（屈折率 <i>n</i>）:</span>
            <select v-model.number="refractiveIndex" class="custom-select">
              <option :value="1.0">空気 (n = 1.000)</option>
              <option :value="1.333">水 (n = 1.333)</option>
              <option :value="1.47">グリセリン (n = 1.470)</option>
            </select>
          </label>
          <div class="ctrl-note">液体を満たすと波長が λ/n に縮むため、縞間隔も 1/n 倍に詰まります</div>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">接触点（x=0）の干渉</span>
        <span class="value dark-val">暗線（黒）</span>
        <span class="subtext">下ガラス反射で位相が π 反転するため</span>
      </div>

      <div class="stat-card">
        <span class="label">明線間隔 Δ x</span>
        <span class="value highlight">{{ fringeSpacingMm.toFixed(3) }} <span class="unit">mm</span></span>
        <span class="subtext">Δ x = L λ / 2 n D</span>
      </div>

      <div class="stat-card">
        <span class="label">全縞数 (x = 0 〜 L)</span>
        <span class="value">{{ totalFringes }} <span class="unit">本</span></span>
        <span class="subtext">N = 2 n D / λ</span>
      </div>

      <div class="stat-card">
        <span class="label">くさびの傾斜角 θ</span>
        <span class="value">{{ wedgeAngleMrad.toFixed(2) }} <span class="unit">mrad</span></span>
        <span class="subtext">tanθ = D / L</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
let staticGroup = null
let pulseGroup = null
let resizeObs = null
let pulseSegments = []
let simTime = 0
let lastCamMob = false

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)
const showCloseup = ref(true)

const thicknessUm = ref(20) // µm
const lengthMm = ref(80) // mm
const wavelengthNm = ref(589) // ナトリウムD線 589nm
const refractiveIndex = ref(1.0) // 屈折率

// Δx = L * λ / (2 * n * D) [mm]
const fringeSpacingMm = computed(() => {
  const D = thicknessUm.value * 1e-6
  const L = lengthMm.value * 1e-3
  const lam = wavelengthNm.value * 1e-9
  const n = refractiveIndex.value
  return ((L * lam) / (2 * n * D)) * 1e3
})

const totalFringes = computed(() => {
  const D = thicknessUm.value * 1e-6
  const lam = wavelengthNm.value * 1e-9
  const n = refractiveIndex.value
  return Math.floor((2 * n * D) / lam)
})

const wedgeAngleMrad = computed(() => {
  const D = thicknessUm.value * 1e-6
  const L = lengthMm.value * 1e-3
  return (D / L) * 1e3
})

// 380–780 nm 正確なスペクトル RGB 変換
function wavelengthToRGB(wl) {
  const w = Math.max(380, Math.min(780, wl))
  let r = 0, g = 0, b = 0
  if (w >= 380 && w < 440) {
    r = -(w - 440) / (440 - 380)
    b = 1.0
  } else if (w >= 440 && w < 490) {
    g = (w - 440) / (490 - 440)
    b = 1.0
  } else if (w >= 490 && w < 510) {
    g = 1.0
    b = -(w - 510) / (510 - 490)
  } else if (w >= 510 && w < 580) {
    r = (w - 510) / (580 - 510)
    g = 1.0
  } else if (w >= 580 && w < 645) {
    r = 1.0
    g = -(w - 645) / (645 - 580)
  } else {
    r = 1.0
  }

  let factor = 1.0
  if (w < 420) factor = 0.55 + 0.45 * ((w - 380) / 40)
  else if (w > 700) factor = 0.52 + 0.48 * ((780 - w) / 80)

  const gamma = 0.82
  const r255 = r > 0 ? Math.min(255, Math.round(255 * Math.pow(r * factor, gamma))) : 0
  const g255 = g > 0 ? Math.min(255, Math.round(255 * Math.pow(g * factor, gamma))) : 0
  const b255 = b > 0 ? Math.min(255, Math.round(255 * Math.pow(b * factor, gamma))) : 0

  return {
    r: r255,
    g: g255,
    b: b255,
    hex: (r255 << 16) | (g255 << 8) | b255,
    css: `rgb(${r255}, ${g255}, ${b255})`
  }
}

const activeWaveCss = computed(() => wavelengthToRGB(wavelengthNm.value).css)

function resetDefaults() {
  thicknessUm.value = 20
  lengthMm.value = 80
  wavelengthNm.value = 589
  refractiveIndex.value = 1.0
  showCloseup.value = true
  setCameraPreset('3d')
}

function getMobileScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(1.74, Math.max(1.26, 1.46 / Math.max(0.7, aspect))) : 1.0
}

function sprScale(base) {
  return getMobileScale() > 1.02 ? +(base * 1.5).toFixed(3) : base
}

function getCamParams(preset) {
  const s = getMobileScale()
  const isMob = s > 1.02
  if (preset === 'side') {
    return {
      pos: [0.1, 0.9 * s, 43.0 * s],
      target: [0.1, isMob ? 0.1 : 0.55, 0],
      fov: 14
    }
  }
  if (preset === 'top') {
    return {
      pos: [-0.05, 46.5 * s, 0.3],
      target: [-0.05, 0, 0.2],
      fov: 14
    }
  }
  return {
    pos: [5.7 * s, 5.5 * s, 12.6 * s],
    target: [isMob ? -0.15 : 0.1, isMob ? -0.25 : 0.35, 0],
    fov: 42
  }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

function stepSim(dt = 0.05) {
  isPlaying.value = false
  simTime += dt
  updatePulses(0)
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

// ベベル加工された精密光学ガラス板ジオメトリ
function createBeveledPlateGeometry(len, thick, depth, bevel = 0.035) {
  const hw = len / 2 - bevel
  const hh = thick / 2 - bevel
  const shape = new THREE.Shape()
  shape.moveTo(-hw, -hh)
  shape.lineTo(hw, -hh)
  shape.lineTo(hw, hh)
  shape.lineTo(-hw, hh)
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.2, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2
  })
  geo.center()
  return geo
}

// くさび上面に輝く高精細平行干渉縞テクスチャ（エイリアシング防止 & 高コントラスト）
function createWedgeFringeTexture() {
  const w = 2048
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const rgb = wavelengthToRGB(wavelengthNm.value)
  const physicalCycles = (2 * refractiveIndex.value * (thicknessUm.value * 1e-6)) / (wavelengthNm.value * 1e-9)
  // モアレ潰れを防ぎつつパラメータ増減で密度が単調変化する表示サイクル数
  const visualCycles = physicalCycles <= 40 ? physicalCycles : 40 + (physicalCycles - 40) * 0.085
  const clampedCycles = Math.min(62, visualCycles)
  const totalPhase = clampedCycles * Math.PI

  const imgData = ctx.createImageData(w, h)
  for (let px = 0; px < w; px++) {
    const normX = px / w
    const phase = normX * totalPhase
    // 接触点 x=0 は必ず暗線 (sin^2 = 0)
    const intensity = Math.pow(Math.abs(Math.sin(phase)), 1.35)
    const r = Math.round(rgb.r * intensity + 3 * (1 - intensity))
    const g = Math.round(rgb.g * intensity + 7 * (1 - intensity))
    const b = Math.round(rgb.b * intensity + 18 * (1 - intensity))

    for (let py = 0; py < h; py++) {
      const idx = (py * w + px) * 4
      imgData.data[idx] = r
      imgData.data[idx + 1] = g
      imgData.data[idx + 2] = b
      imgData.data[idx + 3] = 248
    }
  }
  ctx.putImageData(imgData, 0, 0)

  ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)'
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, w - 6, h - 6)

  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

// 右側「側面光路差 2nd 拡大断面」カード用 CanvasTexture
function createCloseupTexture() {
  const w = 640
  const h = 520
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const rgb = wavelengthToRGB(wavelengthNm.value)
  ctx.fillStyle = '#080d1a'
  ctx.fillRect(0, 0, w, h)

  // ヘッダー
  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)'
  ctx.fillRect(0, 0, w, 52)
  ctx.font = '700 23px "Outfit", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#7dd3fc'
  ctx.textAlign = 'center'
  ctx.fillText('拡大断面: くさび空気層の光路差 2nd', w / 2, 34)

  // 上側ガラス板 (n_g = 1.52)
  const topBotY = 175
  const botTopY = 335
  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)'
  ctx.fillRect(42, 74, w - 84, topBotY - 74)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2.5
  ctx.strokeRect(42, 74, w - 84, topBotY - 74)

  ctx.font = '700 18px "Outfit", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#bae6fd'
  ctx.textAlign = 'left'
  ctx.fillText('上ガラス板 (n_g = 1.52)', 58, 102)

  // 空気/液体くさび層
  const medName = refractiveIndex.value === 1.0 ? '空気層 (n = 1.00)' : refractiveIndex.value < 1.4 ? '水層 (n = 1.333)' : 'グリセリン (n = 1.47)'
  ctx.fillStyle = refractiveIndex.value > 1.0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.65)'
  ctx.fillRect(42, topBotY, w - 84, botTopY - topBotY)
  ctx.fillStyle = refractiveIndex.value > 1.0 ? '#6ee7b7' : '#cbd5e1'
  ctx.fillText(medName, 58, (topBotY + botTopY) / 2 + 6)

  // 下側ガラス板 (n_g = 1.52)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)'
  ctx.fillRect(42, botTopY, w - 84, 72)
  ctx.strokeStyle = '#38bdf8'
  ctx.strokeRect(42, botTopY, w - 84, 72)
  ctx.fillStyle = '#bae6fd'
  ctx.fillText('下ガラス板 (n_g = 1.52)', 58, botTopY + 42)

  // 光線経路 (x = 270 に垂直入射し、上板下面と下板上面で反射)
  const rxIn = 248
  const rxR1 = 272
  const rxR2 = 304

  // 入射光
  ctx.strokeStyle = rgb.css
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(rxIn, 60)
  ctx.lineTo(rxIn, topBotY)
  ctx.stroke()

  // Ray ① (上板下面反射: 大 → 小 = 自由端)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 4.5
  ctx.beginPath()
  ctx.moveTo(rxIn, topBotY)
  ctx.lineTo(rxR1, topBotY - 112)
  ctx.stroke()

  // 光路 2nd ハイライト (往復)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)'
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(rxR2 - 8, topBotY)
  ctx.lineTo(rxR2 - 8, botTopY)
  ctx.stroke()

  // Ray ② (くさび層往復 + 上向き反射)
  ctx.strokeStyle = rgb.css
  ctx.lineWidth = 4.5
  ctx.beginPath()
  ctx.moveTo(rxIn, topBotY)
  ctx.lineTo(rxR2 - 12, botTopY)
  ctx.stroke()
  ctx.strokeStyle = '#f43f5e'
  ctx.beginPath()
  ctx.moveTo(rxR2 - 12, botTopY)
  ctx.lineTo(rxR2 + 6, topBotY - 112)
  ctx.stroke()

  // 反射点リング & 明快バッジ
  // 1) 上板下面 (シアン #38bdf8)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(rxIn, topBotY, 11, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(rxIn, topBotY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(14, 116, 144, 0.35)'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.fillRect(326, topBotY - 56, 260, 40)
  ctx.strokeRect(326, topBotY - 56, 260, 40)
  ctx.fillStyle = '#7dd3fc'
  ctx.font = '700 16px "Outfit", "Noto Sans JP", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('① 自由端: 位相ズレなし (0)', 456, topBotY - 30)

  // 2) 下板上面 (ローズ #f43f5e)
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(rxR2 - 12, botTopY, 11, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(rxR2 - 12, botTopY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(159, 18, 57, 0.38)'
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 2
  ctx.fillRect(326, botTopY + 12, 260, 40)
  ctx.strokeRect(326, botTopY + 12, 260, 40)
  ctx.fillStyle = '#fda4af'
  ctx.fillText('② 固定端: 位相 π ズレ (λ/2)', 456, botTopY + 38)

  // 往復距離 d ラベル
  ctx.fillStyle = '#fde68a'
  ctx.font = '700 18px "Outfit", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('往復光路差 Δ = 2nd(x)', 335, (topBotY + botTopY) / 2 + 6)

  // 下部公式まとめ
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)'
  ctx.fillRect(42, 424, w - 84, 74)
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.strokeRect(42, 424, w - 84, 74)

  ctx.font = '700 18px "Outfit", "Noto Sans JP", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#4ade80'
  ctx.fillText('明線: 2nd = (m + ½)λ    |    暗線: 2nd = mλ', w / 2, 454)
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '600 16px "Outfit", "Noto Sans JP", sans-serif'
  ctx.fillText(`接触点 x=0 は d=0 でも π 反転により必ず暗線！`, w / 2, 482)

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, w - 4, h - 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

function addRayTube(parent, p1, p2, colorHex, radius = 0.038, opacity = 0.9, emissiveInt = 0.6) {
  if (p1.distanceTo(p2) < 0.01) return
  const curve = new THREE.LineCurve3(p1, p2)
  const geo = new THREE.TubeGeometry(curve, 10, radius, 8, false)
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: emissiveInt,
    roughness: 0.2,
    transparent: opacity < 1,
    opacity
  })
  parent.add(new THREE.Mesh(geo, mat))
}

function addPhaseRing(parent, pos, colorHex) {
  const ringGeo = new THREE.TorusGeometry(0.18, 0.036, 10, 24)
  ringGeo.rotateX(Math.PI / 2)
  const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: colorHex }))
  ringMesh.position.copy(pos)
  parent.add(ringMesh)

  const coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 14, 14),
    new THREE.MeshBasicMaterial({ color: colorHex })
  )
  coreMesh.position.copy(pos)
  parent.add(coreMesh)
}

function addDashedLeader(parent, p1, p2, colorHex, opacity = 0.72) {
  const geo = new THREE.BufferGeometry().setFromPoints([p1, p2])
  const mat = new THREE.LineDashedMaterial({
    color: colorHex,
    dashSize: 0.14,
    gapSize: 0.1,
    transparent: true,
    opacity
  })
  const line = new THREE.Line(geo, mat)
  line.computeLineDistances()
  parent.add(line)
}

function registerPulse(p1, p2, colorHex, offset = 0) {
  pulseSegments.push({ p1: p1.clone(), p2: p2.clone(), colorHex, offset })
}

function rebuildScene() {
  if (!staticGroup || !pulseGroup) return
  clearGroup(staticGroup)
  clearGroup(pulseGroup)
  pulseSegments = []

  const rgb = wavelengthToRGB(wavelengthNm.value)
  // ガラス板の3D長さと位置（側面拡大断面と重ならない配置）
  const plateLenU = showCloseup.value
    ? 5.2 + ((lengthMm.value - 40) / 110) * 1.9
    : 6.8 + ((lengthMm.value - 40) / 110) * 3.0
  const plateDepthU = 3.5
  const plateThickU = 0.34
  const gapU = 0.35 + ((thicknessUm.value - 5) / 55) * 1.05

  const centerX = showCloseup.value ? -1.75 : 0
  const startX = centerX - plateLenU / 2
  const endX = centerX + plateLenU / 2
  const floorY = -1.55

  // 1. 光学テーブル床
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.set(0, floorY, 0)
  staticGroup.add(grid)

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.26,
    roughness: 0.1,
    metalness: 0.15,
    depthWrite: false
  })
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.7 })

  // 2. 下側ベベル加工ガラス板 (上面が y = 0)
  const botPlateGeo = createBeveledPlateGeometry(plateLenU, plateThickU, plateDepthU, 0.038)
  const botPlate = new THREE.Mesh(botPlateGeo, glassMat)
  botPlate.position.set(centerX, -plateThickU / 2, 0)
  staticGroup.add(botPlate)

  const botEdge = new THREE.LineSegments(new THREE.EdgesGeometry(botPlateGeo, 25), edgeMat)
  botEdge.position.copy(botPlate.position)
  staticGroup.add(botEdge)

  // 3. 右端に挟んだ箔スペーサー D
  const spacerW = 0.34
  const spacerGeo = new THREE.BoxGeometry(spacerW, gapU, plateDepthU * 0.94)
  const spacerMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
    metalness: 0.55,
    roughness: 0.28
  })
  const spacerMesh = new THREE.Mesh(spacerGeo, spacerMat)
  spacerMesh.position.set(endX - spacerW / 2, gapU / 2, 0)
  staticGroup.add(spacerMesh)

  const spacerLbl = createTextSprite(`箔 D = ${thicknessUm.value} µm`, {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 28,
    scale: sprScale(0.42)
  })
  spacerLbl.position.set(endX - 0.55, gapU + 0.88, -2.18)
  staticGroup.add(spacerLbl)

  // 4. 水・グリセリンの場合はくさび層を半透明媒質プリズムで充填
  if (refractiveIndex.value > 1.0) {
    const shape = new THREE.Shape()
    shape.moveTo(startX, 0)
    shape.lineTo(endX - spacerW, 0)
    shape.lineTo(endX - spacerW, gapU * ((plateLenU - spacerW) / plateLenU))
    shape.closePath()

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: plateDepthU * 0.9,
      bevelEnabled: false
    })
    extrudeGeo.translate(0, 0, -plateDepthU * 0.45)
    const medHex = refractiveIndex.value < 1.4 ? 0x06b6d4 : 0x10b981
    const medMat = new THREE.MeshStandardMaterial({
      color: medHex,
      transparent: true,
      opacity: 0.24,
      roughness: 0.15,
      depthWrite: false
    })
    staticGroup.add(new THREE.Mesh(extrudeGeo, medMat))
  }

  // 5. 上側ベベル加工傾斜ガラス板 + 上面の平行干渉縞オーバーレイ
  const tiltAngle = Math.atan2(gapU, plateLenU)
  const topPivot = new THREE.Group()
  topPivot.position.set(startX, 0, 0)
  topPivot.rotation.z = tiltAngle
  staticGroup.add(topPivot)

  const topPlateGeo = createBeveledPlateGeometry(plateLenU, plateThickU, plateDepthU, 0.038)
  const topPlate = new THREE.Mesh(topPlateGeo, glassMat)
  topPlate.position.set(plateLenU / 2, plateThickU / 2, 0)
  topPivot.add(topPlate)

  const topEdge = new THREE.LineSegments(new THREE.EdgesGeometry(topPlateGeo, 25), edgeMat)
  topEdge.position.copy(topPlate.position)
  topPivot.add(topEdge)

  // 上側ガラス板の上面に光る平行干渉縞パネルを配置
  const fringeTex = createWedgeFringeTexture()
  const fringePlaneGeo = new THREE.PlaneGeometry(plateLenU * 0.96, plateDepthU * 0.88)
  fringePlaneGeo.rotateX(-Math.PI / 2)
  const fringePlaneMat = new THREE.MeshBasicMaterial({
    map: fringeTex,
    transparent: true,
    side: THREE.DoubleSide
  })
  const fringePlane = new THREE.Mesh(fringePlaneGeo, fringePlaneMat)
  fringePlane.position.set(plateLenU / 2, plateThickU + 0.015, 0)
  topPivot.add(fringePlane)

  // 接触線 O (x = 0) のローズグローバー & 傾斜角 θ アーク
  const contactGeo = new THREE.CylinderGeometry(0.055, 0.055, plateDepthU * 1.02, 16)
  contactGeo.rotateX(Math.PI / 2)
  const contactBar = new THREE.Mesh(contactGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e }))
  contactBar.position.set(startX, 0, 0)
  staticGroup.add(contactBar)

  // 傾斜角 θ アーク (手前側面)
  const arcR = 1.35
  const arcPts = []
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * tiltAngle
    arcPts.push(new THREE.Vector3(startX + arcR * Math.cos(a), arcR * Math.sin(a), plateDepthU / 2 + 0.08))
  }
  staticGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0xfbbf24 })
    )
  )
  const thetaLbl = createTextSprite(`θ = ${wedgeAngleMrad.value.toFixed(2)} mrad`, {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 26,
    scale: sprScale(0.39)
  })
  thetaLbl.position.set(startX - 0.85, 1.58, -2.15)
  staticGroup.add(thetaLbl)
  addDashedLeader(staticGroup, new THREE.Vector3(startX + 0.85, Math.max(0.18, gapU * 0.22), plateDepthU / 2 + 0.08), thetaLbl.position, 0xf59e0b, 0.55)

  const contactLbl = createTextSprite('接触点 O (x=0: 暗線)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 26,
    scale: sprScale(0.41)
  })
  contactLbl.position.set(startX - 0.15, -0.82, 3.35)
  staticGroup.add(contactLbl)
  addDashedLeader(staticGroup, new THREE.Vector3(startX, 0, plateDepthU * 0.45), contactLbl.position, 0xf43f5e, 0.65)

  const glassLbl = createTextSprite(
    `くさび形ガラス板 (L=${lengthMm.value}mm, Δx=${fringeSpacingMm.value.toFixed(2)}mm)`,
    { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 26, scale: sprScale(0.42) }
  )
  glassLbl.position.set(centerX + 0.45, -1.28, 3.15)
  staticGroup.add(glassLbl)

  // 6. 上方単色平行光バー & 3本のサンプル光線（上板下面反射 + 下板上面反射を明確分離）
  const rayTopY = 2.45
  const lampBar = new THREE.Mesh(
    new THREE.BoxGeometry(plateLenU * 0.72, 0.12, 0.55),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: rgb.hex,
      emissiveIntensity: 0.45,
      metalness: 0.6
    })
  )
  lampBar.position.set(centerX + 0.15, rayTopY + 0.08, 0)
  staticGroup.add(lampBar)

  const fracs = [0.28, 0.56, 0.82]
  let mainGapMid = new THREE.Vector3(centerX, 0.25, 0)
  fracs.forEach((f, idx) => {
    const rx = startX + plateLenU * f
    const upperBotY = gapU * f
    const xIn = rx - 0.14
    const xR1 = rx - 0.04
    const xGap = rx + 0.08
    const xR2 = rx + 0.18

    if (idx === 1) {
      mainGapMid = new THREE.Vector3(xGap, upperBotY * 0.5, 0)
    }

    // 入射光 (上ガラスを貫通して下面へ)
    const pInStart = new THREE.Vector3(xIn, rayTopY, 0)
    const pTopBot = new THREE.Vector3(xIn, upperBotY, 0)
    addRayTube(staticGroup, pInStart, pTopBot, rgb.hex, 0.036, 0.9)
    registerPulse(pInStart, pTopBot, rgb.hex, idx * 0.22)

    // Ray ①: 上板下面で自由端反射（位相ズレなし: シアン #38bdf8）
    const pR1Start = new THREE.Vector3(xIn, upperBotY, 0)
    const pR1End = new THREE.Vector3(xR1, rayTopY, 0)
    addRayTube(staticGroup, pR1Start, pR1End, 0x38bdf8, 0.032, 0.88)
    registerPulse(pR1Start, pR1End, 0x38bdf8, idx * 0.22 + 0.35)

    // Ray ②: 空気/液体層を往復し下板上面で固定端反射（πズレ: ローズ #f43f5e）
    const pGapTop = new THREE.Vector3(xGap, upperBotY, 0)
    const pGapBot = new THREE.Vector3(xGap, 0, 0)
    const pR2End = new THREE.Vector3(xR2, rayTopY, 0)
    // くさび層内の往復光路ハイライト
    addRayTube(staticGroup, pGapTop, pGapBot, 0xfbbf24, 0.075, 0.28, 0.3)
    addRayTube(staticGroup, pTopBot, pGapBot, rgb.hex, 0.034, 0.92)
    addRayTube(staticGroup, pGapBot, pR2End, 0xf43f5e, 0.032, 0.88)
    registerPulse(pGapBot, pR2End, 0xf43f5e, idx * 0.22 + 0.55)

    // 両反射点の位相リング
    addPhaseRing(staticGroup, pR1Start, 0x38bdf8)
    addPhaseRing(staticGroup, pGapBot, 0xf43f5e)

    if (idx === 0) {
      const topRefLbl = createTextSprite('① 上板下面: 位相ズレなし', {
        color: '#7dd3fc',
        borderColor: '#38bdf8',
        fontSize: 25,
        scale: sprScale(0.37)
      })
      topRefLbl.position.set(startX + 0.15, 0.78, 2.35)
      staticGroup.add(topRefLbl)
      addDashedLeader(staticGroup, pR1Start, topRefLbl.position, 0x38bdf8, 0.72)
    }

    if (idx === 1) {
      const botRefLbl = createTextSprite('② 下板上面: πズレ (固定端)', {
        color: '#fda4af',
        borderColor: '#f43f5e',
        fontSize: 25,
        scale: sprScale(0.37)
      })
      botRefLbl.position.set(endX - 0.25, -0.42, 2.15)
      staticGroup.add(botRefLbl)
      addDashedLeader(staticGroup, pGapBot, botRefLbl.position, 0xf43f5e, 0.72)
    }
  })

  const rayLbl = createTextSprite(`単色平行光 (λ = ${wavelengthNm.value} nm)`, {
    color: rgb.css,
    borderColor: rgb.css,
    fontSize: 26,
    scale: sprScale(0.41)
  })
  rayLbl.position.set(centerX - 0.15, rayTopY + 0.52, -2.12)
  staticGroup.add(rayLbl)

  // 7. 右側: 側面光路差 2nd 拡大断面ステージ
  if (showCloseup.value) {
    const closeupTex = createCloseupTexture()
    const cardW = 3.25
    const cardH = 2.65
    const cardGeo = new THREE.BoxGeometry(cardW, cardH, 0.1)
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    const faceMat = new THREE.MeshBasicMaterial({ map: closeupTex })
    const cardMesh = new THREE.Mesh(cardGeo, [darkMat, darkMat, darkMat, darkMat, faceMat, faceMat])
    cardMesh.position.set(3.85, 0.85, 0.05)
    cardMesh.rotation.x = -0.56
    cardMesh.rotation.y = -0.18
    staticGroup.add(cardMesh)

    // 拡大断面とサンプル光路を結ぶ破線リーダー
    const leaderGeo = new THREE.BufferGeometry().setFromPoints([
      mainGapMid,
      new THREE.Vector3(2.15, 0.92, 0.05)
    ])
    const leaderMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.16,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.85
    })
    const leaderLine = new THREE.Line(leaderGeo, leaderMat)
    leaderLine.computeLineDistances()
    staticGroup.add(leaderLine)
  }

  // 光子パルス球の生成
  const sphereGeo = new THREE.SphereGeometry(0.078, 12, 12)
  pulseSegments.forEach(seg => {
    const mat = new THREE.MeshBasicMaterial({ color: seg.colorHex })
    seg.meshes = []
    for (let i = 0; i < 2; i++) {
      const m = new THREE.Mesh(sphereGeo, mat)
      pulseGroup.add(m)
      seg.meshes.push(m)
    }
  })
}

function updatePulses(dt) {
  if (isPlaying.value && dt > 0) {
    simTime += dt * timeScale.value
  }
  pulseSegments.forEach(seg => {
    if (!seg.meshes) return
    for (let i = 0; i < seg.meshes.length; i++) {
      const t = ((simTime * 0.72 + seg.offset + i * 0.5) % 1 + 1) % 1
      seg.meshes[i].position.lerpVectors(seg.p1, seg.p2, t)
    }
  })
}

watch([thicknessUm, lengthMm, wavelengthNm, refractiveIndex, showCloseup], () => {
  rebuildScene()
})

onMounted(() => {
  if (!threeContainer.value) return
  const initCam = getCamParams('3d')
  lastCamMob = getMobileScale() > 1.02

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    maxDistance: 150,
    onFrame: dt => {
      updatePulses(dt)
    }
  })
  staticGroup = new THREE.Group()
  pulseGroup = new THREE.Group()
  threeCtx.scene.add(staticGroup)
  threeCtx.scene.add(pulseGroup)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobileScale() > 1.02
      if (nowMob !== lastCamMob) {
        lastCamMob = nowMob
        setCameraPreset(activeCam.value, 0)
        rebuildScene()
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  rebuildScene()
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
  padding: 1.15rem;
  color: #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  margin: 1.5rem 0;
  border: 1px solid #1e293b;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.sim-header .title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
}

.sim-header .icon {
  font-size: 1.45rem;
}

.sim-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #38bdf8;
}

.three-badge {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
}

.subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 0.85rem 0;
  line-height: 1.45;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(56, 189, 248, 0.24);
  border-radius: 10px;
}

.preset-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #38bdf8;
}

.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.chip-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.28);
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.chip-btn.active {
  background: rgba(56, 189, 248, 0.22);
  color: #38bdf8;
  border-color: #38bdf8;
  font-weight: 700;
}

.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 0 0.7rem 0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.play-btn {
  padding: 5px 14px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #0284c7, #38bdf8);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.step-btn {
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid #475569;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.speed-control-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 10px;
  border-radius: 9999px;
}

.speed-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #38bdf8;
  white-space: nowrap;
}

.speed-btn-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.speed-btn-group button {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.speed-btn-group button.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.three-viewport-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #080c16;
}

.three-viewport {
  width: 100%;
  height: 100%;
}

.three-hud-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.three-hud-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.72rem;
  color: #e2e8f0;
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

.three-ortho-badge {
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(251, 191, 36, 0.45);
  color: #fde68a;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
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
  z-index: 5;
}

.custom-select {
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.86rem;
  width: 100%;
  margin-top: 2px;
}

.control-panel {
  margin-top: 1rem;
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.85rem;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.control-group strong {
  color: #38bdf8;
}

.ctrl-note {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 0.35rem;
  line-height: 1.35;
}

.spectral-bar {
  height: 6px;
  border-radius: 999px;
  margin-top: 4px;
  background: linear-gradient(
    90deg,
    #8b5cf6 0%,
    #3b82f6 18%,
    #06b6d4 32%,
    #22c55e 45%,
    #eab308 60%,
    #f97316 74%,
    #ef4444 90%,
    #991b1b 100%
  );
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.mini-chip {
  padding: 2px 7px;
  font-size: 0.71rem;
  border-radius: 6px;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  cursor: pointer;
}

.mini-chip.on {
  background: rgba(56, 189, 248, 0.22);
  color: #7dd3fc;
  border-color: #38bdf8;
  font-weight: 700;
}

input[type='range'] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.button-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.9rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}

.stats-monitor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
}

.stat-card {
  background: #1e293b;
  padding: 0.72rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-left: 3px solid #38bdf8;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.stat-card .value {
  font-size: 1.08rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #fbbf24;
}

.stat-card .unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-card .subtext {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

.dark-val {
  color: #cbd5e1 !important;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 0.85rem;
  }
  .three-viewport-wrap {
    height: 350px;
  }
  .speed-control-group {
    border-radius: 10px;
    width: 100%;
    padding: 6px 10px;
  }
  .three-hud-legend,
  .three-ortho-badge,
  .three-hud-hint {
    font-size: 0.66rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    white-space: normal;
  }
}
</style>
