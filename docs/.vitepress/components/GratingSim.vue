<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🌈</span>
        <h3>3D 回折格子・スペクトル分析シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <p class="subtitle">
        数千本のスリットによる極めて鋭い干渉主極大（<i>d</i> sinθ = <i>m</i>λ）。単色光の精密波長測定（380–780 nm）から水素原子線スペクトル、白色光の連続分光虹まで3D光学空間でリアルタイム再現。
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
        <button class="chip-btn" :class="{ active: showPathDiff }" @click="showPathDiff = !showPathDiff">
          {{ showPathDiff ? '📏 光路差 d sinθ: ON' : '📏 光路差 d sinθ: OFF' }}
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

    <div class="three-hud-top">
      <div class="three-hud-legend">
        <span class="legend-item">
          <i :style="{ background: legendBeamCss, boxShadow: '0 0 6px ' + legendBeamCss }"></i>
          {{ sourceType === 'white' ? '連続分光ビーム' : '入射・回折光' }}
        </span>
        <span class="legend-item">
          <i style="background:#f59e0b;box-shadow:0 0 6px #f59e0b"></i>
          隣接スリット光路差 <b>d sinθ = mλ</b>
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          光強度曲線 <b>I(x)</b>
        </span>
      </div>
      <div class="three-ortho-badge">
        {{ orthoBadgeText }}
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
            <span>光源の種類:</span>
            <div class="btn-group">
              <button class="select-btn" :class="{ active: sourceType === 'laser' }" @click="sourceType = 'laser'">
                単色レーザー
              </button>
              <button class="select-btn" :class="{ active: sourceType === 'hydrogen' }" @click="sourceType = 'hydrogen'">
                水素原子線
              </button>
              <button class="select-btn" :class="{ active: sourceType === 'white' }" @click="sourceType = 'white'">
                白色光 (連続)
              </button>
            </div>
          </label>
          <div class="ctrl-note">
            {{ sourceType === 'white' ? '回折格子は波長が長い赤ほど大きく曲がり（外側）、紫が内側になります' : sourceType === 'hydrogen' ? 'バルマー系列 Hα(656), Hβ(486), Hγ(434), Hδ(410nm) を分離表示' : '単一波長 380–780 nm の鋭い主極大輝線と正確なスペクトル色を表示' }}
          </div>
        </div>

        <div class="control-group" v-if="sourceType === 'laser'">
          <label>
            <span>レーザー波長 λ: <strong :style="{ color: activeWaveCss }">{{ wavelengthNm }} nm</strong></span>
            <input type="range" v-model.number="wavelengthNm" min="380" max="780" step="5" />
          </label>
          <div class="spectral-bar"></div>
          <div class="quick-chips">
            <button class="mini-chip" :class="{ on: wavelengthNm === 405 }" @click="wavelengthNm = 405">405nm 紫</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 470 }" @click="wavelengthNm = 470">470nm 青</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 532 }" @click="wavelengthNm = 532">532nm 緑</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 589 }" @click="wavelengthNm = 589">589nm 黄</button>
            <button class="mini-chip" :class="{ on: wavelengthNm === 656 }" @click="wavelengthNm = 656">656nm 赤</button>
          </div>
        </div>

        <div class="control-group">
          <label>
            <span>スリット密度 <i>N</i>: <strong>{{ linesPerMm }} 本/mm</strong></span>
            <input type="range" v-model.number="linesPerMm" min="200" max="800" step="50" />
          </label>
          <div class="ctrl-note">格子定数 <i>d</i> = {{ gratingD_um.toFixed(2) }} μm（密度が高いほど大きく回折）</div>
        </div>

        <div class="control-group">
          <label>
            <span>スクリーン距離 <i>L</i>: <strong>{{ screenDistCm.toFixed(0) }} cm</strong></span>
            <input type="range" v-model.number="screenDistCm" min="50" max="150" step="5" />
          </label>
          <div class="ctrl-note">距離 <i>L</i> に比例して明線位置 <i>x</i><sub>m</sub> = <i>L</i> tanθ が拡大</div>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="resetDefaults">
          🔄 デフォルト設定に戻す
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">格子定数 <i>d</i></span>
        <span class="value">{{ gratingD_um.toFixed(2) }} <span class="unit">μm</span></span>
        <span class="subtext"><i>d</i> = 1 / {{ linesPerMm }} mm</span>
      </div>

      <div class="stat-card">
        <span class="label">1次回折角 θ<sub>1</sub> ({{ sourceType === 'laser' ? wavelengthNm + 'nm' : '550nm基準' }})</span>
        <span class="value" :style="{ color: sourceType === 'laser' ? activeWaveCss : '#38bdf8' }">
          {{ theta1Deg.toFixed(1) }} <span class="unit">°</span>
        </span>
        <span class="subtext"><i>d</i> sinθ = <i>m</i>λ</span>
      </div>

      <div class="stat-card">
        <span class="label">1次明線位置 <i>x</i><sub>1</sub></span>
        <span class="value highlight">{{ x1Cm.toFixed(1) }} <span class="unit">cm</span></span>
        <span class="subtext"><i>x</i><sub>1</sub> = <i>L</i> tanθ<sub>1</sub></span>
      </div>

      <div class="stat-card">
        <span class="label">可視光の最大次数 <i>m</i><sub>max</sub></span>
        <span class="value">{{ maxOrder }}</span>
        <span class="subtext">sinθ ≤ 1 より (700nm)</span>
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
let staticGroup = null
let pulseGroup = null
let resizeObs = null
let pulseSegments = []
let simTime = 0
let lastCamMob = false

const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)
const showPathDiff = ref(true)

const sourceType = ref('white') // 'laser', 'hydrogen', 'white'
const wavelengthNm = ref(532) // nm
const linesPerMm = ref(500) // 本/mm
const screenDistCm = ref(100) // cm

// 正確な 380–780 nm スペクトル RGB 変換（端波長でも暗く潰れない視認性補正付き）
function nmToRgbObj(nm) {
  const w = Math.max(380, Math.min(780, nm))
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

  // 380-420nm・700-780nm 端の視認性を保ちつつ自然なスペクトル減衰を付与
  let factor = 1.0
  if (w < 420) {
    factor = 0.55 + 0.45 * ((w - 380) / (420 - 380))
  } else if (w > 700) {
    factor = 0.52 + 0.48 * ((780 - w) / (780 - 700))
  }
  const gamma = 0.82
  const r255 = r > 0 ? Math.min(255, Math.round(255 * Math.pow(r * factor, gamma))) : 0
  const g255 = g > 0 ? Math.min(255, Math.round(255 * Math.pow(g * factor, gamma))) : 0
  const b255 = b > 0 ? Math.min(255, Math.round(255 * Math.pow(b * factor, gamma))) : 0

  return {
    r: r255,
    g: g255,
    b: b255,
    rNorm: r255 / 255,
    gNorm: g255 / 255,
    bNorm: b255 / 255,
    hex: (r255 << 16) | (g255 << 8) | b255,
    css: `rgb(${r255}, ${g255}, ${b255})`
  }
}

const activeWaveCss = computed(() => nmToRgbObj(wavelengthNm.value).css)
const legendBeamCss = computed(() =>
  sourceType.value === 'laser' ? activeWaveCss.value : sourceType.value === 'hydrogen' ? '#ec4899' : '#f8fafc'
)

// 格子定数 d [μm]
const gratingD_um = computed(() => 1000 / linesPerMm.value)
const gratingD_nm = computed(() => gratingD_um.value * 1000)

// 1次回折角 θ
const refWaveNm = computed(() => (sourceType.value === 'laser' ? wavelengthNm.value : 550))
const sinTheta1 = computed(() => refWaveNm.value / gratingD_nm.value)
const theta1Deg = computed(() => {
  if (sinTheta1.value >= 1) return 90
  return (Math.asin(sinTheta1.value) * 180) / Math.PI
})

const x1Cm = computed(() => {
  if (sinTheta1.value >= 1) return 0
  const rad = (theta1Deg.value * Math.PI) / 180
  return screenDistCm.value * Math.tan(rad)
})

const maxOrder = computed(() => Math.floor(gratingD_nm.value / 700))

const orthoBadgeText = computed(() => {
  if (sourceType.value === 'white') {
    return `白色光分光 | 紫(短λ)=内側 ↔ 赤(長λ)=外側`
  }
  if (sourceType.value === 'hydrogen') {
    return `水素原子線 (Balmer) | d = ${gratingD_um.value.toFixed(2)} μm`
  }
  return `単色光 λ=${wavelengthNm.value}nm | θ₁=${theta1Deg.value.toFixed(1)}° (d sinθ = mλ)`
})

function resetDefaults() {
  sourceType.value = 'white'
  wavelengthNm.value = 532
  linesPerMm.value = 500
  screenDistCm.value = 100
  showPathDiff.value = true
  setCameraPreset('3d')
}

function getMobileScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(1.72, Math.max(1.24, 1.44 / Math.max(0.7, aspect))) : 1.0
}

function sprScale(base) {
  return getMobileScale() > 1.02 ? +(base * 1.52).toFixed(3) : base
}

function getCamParams(preset) {
  const s = getMobileScale()
  const isMob = s > 1.02
  if (preset === 'side') {
    // 正面/断面視点 (fov = 14 望遠): コリメータ越しのスクリーン全体 + I(x) + 拡大光路差を歪みなく視認
    return {
      pos: [-0.35, 4.8 * s, 45.0 * s],
      target: [-0.35, isMob ? -0.1 : 0.25, -0.5],
      fov: 14
    }
  }
  if (preset === 'top') {
    // 上面視点 (fov = 14 望遠): 手前(+Z)にコリメータ、奥(-Z)に回折格子・スペクトル・I(x) を正立配置
    return {
      pos: [-0.25, 53.5 * s, 1.05],
      target: [-0.25, 0, 0.65],
      fov: 14
    }
  }
  // 3D 俯瞰視点
  return {
    pos: [6.8 * s, 5.8 * s, 11.8 * s],
    target: [isMob ? -0.35 : 0, isMob ? -0.3 : 0.1, -0.2],
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

// スクリーン前面 (+Z) および天面 (+Y) 用スペクトル帯テクスチャ
function createSpectrumTexture(isTopStrip = false) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = isTopStrip ? 64 : 224
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#030712'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const cx = canvas.width / 2
  const maxDisplayCm = 60
  const pxPerCm = (canvas.width / 2) / maxDisplayCm
  const d_nm = gratingD_nm.value
  const L_cm = screenDistCm.value
  const padY = isTopStrip ? 6 : 22
  const bandH = canvas.height - padY * 2

  // 水平目盛ガイド（上面・前面共通）
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)'
  ctx.lineWidth = 1
  for (let cm = -50; cm <= 50; cm += 10) {
    const gx = cx + cm * pxPerCm
    ctx.beginPath()
    ctx.moveTo(gx, 4)
    ctx.lineTo(gx, canvas.height - 4)
    ctx.stroke()
  }

  // m = 0 中央明線
  const c0 = sourceType.value === 'laser' ? nmToRgbObj(wavelengthNm.value).css : '#f8fafc'
  ctx.fillStyle = c0
  ctx.shadowColor = c0
  ctx.shadowBlur = isTopStrip ? 10 : 20
  ctx.fillRect(cx - 5, padY - 4, 10, bandH + 8)
  ctx.shadowBlur = 0

  const drawSharpLine = (nm, orderM, alpha = 1.0) => {
    const sinTh = (orderM * nm) / d_nm
    if (sinTh >= 0.96) return
    const th = Math.asin(sinTh)
    const x_cm = L_cm * Math.tan(th)
    const dx = x_cm * pxPerCm
    const col = nmToRgbObj(nm).css

    for (const sign of [-1, 1]) {
      const px = cx + sign * dx
      if (px >= 8 && px <= canvas.width - 8) {
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = col
        ctx.shadowColor = col
        ctx.shadowBlur = isTopStrip ? 8 : 14
        const lineW = orderM === 1 ? 6 : 4
        ctx.fillRect(px - lineW / 2, padY, lineW, bandH)
        ctx.restore()
      }
    }
  }

  if (sourceType.value === 'laser') {
    for (let m = 1; m <= 3; m++) {
      drawSharpLine(wavelengthNm.value, m, m === 1 ? 1.0 : m === 2 ? 0.85 : 0.65)
    }
  } else if (sourceType.value === 'hydrogen') {
    ;[
      { nm: 656.3, a: 1.0 },
      { nm: 486.1, a: 0.95 },
      { nm: 434.0, a: 0.85 },
      { nm: 410.2, a: 0.78 }
    ].forEach(line => {
      drawSharpLine(line.nm, 1, line.a)
      drawSharpLine(line.nm, 2, line.a * 0.65)
    })
  } else {
    // 白色光: 連続スペクトル (380..760nm) を加法混色で滑らかに描画（2次・3次の重なりもリアルに再現）
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let m = 1; m <= 3; m++) {
      const orderGain = m === 1 ? 0.85 : m === 2 ? 0.55 : 0.3
      for (let nm = 385; nm <= 755; nm += 1.5) {
        const sinTh = (m * nm) / d_nm
        if (sinTh >= 0.96) continue
        const th = Math.asin(sinTh)
        const x_cm = L_cm * Math.tan(th)
        const dx = x_cm * pxPerCm
        const rgb = nmToRgbObj(nm)
        for (const sign of [-1, 1]) {
          const px = cx + sign * dx
          if (px >= 8 && px <= canvas.width - 8) {
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${orderGain})`
            ctx.fillRect(px - 2, padY + (m - 1) * (isTopStrip ? 1 : 3), 4, bandH - (m - 1) * (isTopStrip ? 2 : 6))
          }
        }
      }
    }
    ctx.restore()
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'
  ctx.lineWidth = isTopStrip ? 3 : 5
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

// 隣接スリット光路差 (d sinθ = mλ) 拡大解説パネル用 CanvasTexture
function createPathDiffInsetTexture() {
  const w = 560
  const h = 380
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#090e1c'
  ctx.fillRect(0, 0, w, h)

  // ヘッダー
  ctx.fillStyle = 'rgba(245, 158, 11, 0.14)'
  ctx.fillRect(0, 0, w, 46)
  ctx.font = '700 21px "Outfit", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#fde68a'
  ctx.textAlign = 'center'
  ctx.fillText('拡大原理: 隣接スリット光路差 d sinθ = mλ', w / 2, 31)

  const thetaRad = Math.min(0.68, Math.max(0.18, (theta1Deg.value * Math.PI) / 180))
  const slitX = 148
  const y1 = 132
  const pitch = 96
  const y2 = y1 + pitch

  // 入射平行光 (左からスリットへ)
  const beamCol = sourceType.value === 'laser' ? activeWaveCss.value : '#38bdf8'
  ctx.strokeStyle = beamCol
  ctx.lineWidth = 4
  ;[y1, y2].forEach(sy => {
    ctx.beginPath()
    ctx.moveTo(40, sy)
    ctx.lineTo(slitX - 10, sy)
    ctx.stroke()
    // 矢印ヘッド
    ctx.beginPath()
    ctx.moveTo(slitX - 10, sy)
    ctx.lineTo(slitX - 22, sy - 6)
    ctx.lineTo(slitX - 22, sy + 6)
    ctx.closePath()
    ctx.fillStyle = beamCol
    ctx.fill()
  })

  // 格子壁 & スリット穴
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(slitX, 74)
  ctx.lineTo(slitX, y1 - 14)
  ctx.moveTo(slitX, y1 + 14)
  ctx.lineTo(slitX, y2 - 14)
  ctx.moveTo(slitX, y2 + 14)
  ctx.lineTo(slitX, 315)
  ctx.stroke()

  // 格子定数 d 寸法線
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(slitX - 38, y1)
  ctx.lineTo(slitX - 38, y2)
  ctx.moveTo(slitX - 45, y1)
  ctx.lineTo(slitX - 31, y1)
  ctx.moveTo(slitX - 45, y2)
  ctx.lineTo(slitX - 31, y2)
  ctx.stroke()
  ctx.font = '700 18px "Outfit", sans-serif'
  ctx.fillStyle = '#7dd3fc'
  ctx.textAlign = 'right'
  ctx.fillText(`d=${gratingD_um.value.toFixed(1)}μm`, slitX - 46, (y1 + y2) / 2 + 6)

  // S1, S2 ラベル
  ctx.fillStyle = '#e2e8f0'
  ctx.textAlign = 'right'
  ctx.fillText('S₁', slitX - 10, y1 - 16)
  ctx.fillText('S₂', slitX - 10, y2 + 28)

  // 回折光線 (角度 thetaRad で右上へ)
  const rayLen = 320
  const dx = Math.cos(thetaRad) * rayLen
  const dy = -Math.sin(thetaRad) * rayLen
  const rayCol = sourceType.value === 'laser' ? activeWaveCss.value : '#34d399'
  ctx.strokeStyle = rayCol
  ctx.lineWidth = 4
  ;[y1, y2].forEach(sy => {
    ctx.beginPath()
    ctx.moveTo(slitX, sy)
    ctx.lineTo(slitX + dx, sy + dy)
    ctx.stroke()
  })

  // 基準水平線 (S1 から) & 角度θアーク
  ctx.setLineDash([5, 5])
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(slitX, y1)
  ctx.lineTo(slitX + 190, y1)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(slitX, y1, 66, -thetaRad, 0)
  ctx.stroke()
  ctx.font = '700 18px "Outfit", sans-serif'
  ctx.fillStyle = '#fde68a'
  ctx.textAlign = 'left'
  ctx.fillText(`θ₁=${theta1Deg.value.toFixed(1)}°`, slitX + 74, y1 - 10)

  // 等波面垂線 (S1 から S2 の光線へ下ろした垂線の足 H)
  const pathDiffPx = pitch * Math.sin(thetaRad)
  const hx = slitX + pathDiffPx * Math.cos(thetaRad)
  const hy = y2 - pathDiffPx * Math.sin(thetaRad)

  ctx.setLineDash([5, 4])
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(slitX, y1)
  ctx.lineTo(hx, hy)
  ctx.stroke()
  ctx.setLineDash([])

  // 経路差セグメント S2 -> H を鮮やかなローズ/アンバーで強調
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 7
  ctx.shadowColor = '#f43f5e'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(slitX, y2)
  ctx.lineTo(hx, hy)
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#f43f5e'
  ctx.beginPath()
  ctx.arc(hx, hy, 5, 0, Math.PI * 2)
  ctx.fill()

  // 光路差コールアウトテキスト
  ctx.fillStyle = '#fda4af'
  ctx.font = '700 20px "Outfit", "Noto Sans JP", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('経路差 Δ = d sinθ = mλ', hx + 14, hy + 28)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 16px "Outfit", "Noto Sans JP", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(
    sourceType.value === 'white'
      ? '長い波長(赤)ほど Δ = λ を満たす角 θ が大 → 外側へ！'
      : `λ = ${refWaveNm.value} nm が同位相で重なり鋭い明線を形成`,
    w / 2,
    h - 18
  )

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, w - 4, h - 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

function addBeamTube(parent, p1, p2, colorHex, radius = 0.042, opacity = 0.9) {
  const curve = new THREE.LineCurve3(p1, p2)
  const geo = new THREE.TubeGeometry(curve, 8, radius, 10, false)
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    transparent: opacity < 1,
    opacity
  })
  parent.add(new THREE.Mesh(geo, mat))
}

function addRainbowFanRibbon(parent, origin, screenZ, orderM, d_nm, L_cm, unitsPerCm, maxHalfW, opacity) {
  const steps = 42
  const positions = []
  const colors = []
  const indices = []

  const validPoints = []
  for (let i = 0; i <= steps; i++) {
    const nm = 390 + (i / steps) * (720 - 390)
    const sinTh = (orderM * nm) / d_nm
    if (sinTh >= 0.95) continue
    const th = Math.asin(sinTh)
    const xU = Math.min(maxHalfW, L_cm * Math.tan(th) * unitsPerCm)
    const rgb = nmToRgbObj(nm)
    validPoints.push({ xU, rgb })
  }
  if (validPoints.length < 2) return

  for (const sign of [-1, 1]) {
    const baseIdx = positions.length / 3
    // 頂点 0: 原点（回折格子中心）を中央色にして扇頂点を作成
    for (let i = 0; i < validPoints.length; i++) {
      const vp = validPoints[i]
      // 内側（原点近く）と外側（スクリーン）の2頂点を作り綺麗なグラデーション扇形を構成
      positions.push(origin.x, origin.y + 0.01, origin.z)
      colors.push(vp.rgb.rNorm, vp.rgb.gNorm, vp.rgb.bNorm)

      positions.push(sign * vp.xU, 0.01, screenZ + 0.08)
      colors.push(vp.rgb.rNorm, vp.rgb.gNorm, vp.rgb.bNorm)

      if (i > 0) {
        const a = baseIdx + (i - 1) * 2
        const b = a + 1
        const c = a + 2
        const d = a + 3
        indices.push(a, b, d)
        indices.push(a, d, c)
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  parent.add(new THREE.Mesh(geo, mat))
}

function rebuildScene() {
  if (!staticGroup || !pulseGroup) return
  clearGroup(staticGroup)
  clearGroup(pulseGroup)
  pulseSegments = []

  const floorY = -1.75
  const gratingZ = 1.55
  const emitterZ = 4.45
  const screenZ = -1.35 - ((screenDistCm.value - 50) / 100) * 2.35
  const screenWidthU = 11.6 // ±58 cm 相当
  const unitsPerCm = (screenWidthU / 2) / 60

  // 1. 光学テーブル床 + 光学ベンチレール
  const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b)
  grid.position.set(0, floorY, 0)
  staticGroup.add(grid)

  const railLen = emitterZ - screenZ + 1.6
  const railGeo = new THREE.BoxGeometry(0.45, 0.14, railLen)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.3 })
  const railMesh = new THREE.Mesh(railGeo, railMat)
  railMesh.position.set(0, floorY + 0.07, (emitterZ + screenZ) / 2)
  staticGroup.add(railMesh)

  // 2. 精密 3D 光源コリメータ (z = emitterZ)
  const inColor = sourceType.value === 'laser' ? nmToRgbObj(wavelengthNm.value).hex : 0xf8fafc
  const inCss = sourceType.value === 'laser' ? nmToRgbObj(wavelengthNm.value).css : '#f8fafc'

  const colBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 1.15, 24).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.28 })
  )
  colBody.position.set(0, 0, emitterZ)
  staticGroup.add(colBody)

  const colNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 0.25, 24).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 })
  )
  colNozzle.position.set(0, 0, emitterZ - 0.65)
  staticGroup.add(colNozzle)

  const apertureRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.035, 12, 24),
    new THREE.MeshBasicMaterial({ color: inColor })
  )
  apertureRing.position.set(0, 0, emitterZ - 0.78)
  staticGroup.add(apertureRing)

  const colPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, -floorY, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
  )
  colPost.position.set(0, floorY / 2, emitterZ)
  staticGroup.add(colPost)

  const colLbl = createTextSprite(
    sourceType.value === 'laser'
      ? `コリメータ (${wavelengthNm.value}nm)`
      : sourceType.value === 'hydrogen'
      ? '水素放電管光源'
      : '白色平行光源',
    { color: inCss, borderColor: inCss, fontSize: 28, scale: sprScale(0.44) }
  )
  colLbl.position.set(-1.65, -1.42, emitterZ - 0.48)
  staticGroup.add(colLbl)

  // 入射平行ビーム + 外周シース
  const pEmit = new THREE.Vector3(0, 0, emitterZ - 0.78)
  const pGrating = new THREE.Vector3(0, 0, gratingZ)
  addBeamTube(staticGroup, pEmit, pGrating, inColor, 0.068, 0.96)
  addBeamTube(staticGroup, pEmit, pGrating, inColor, 0.14, 0.18)
  pulseSegments.push({ p1: pEmit, p2: pGrating, colorHex: inColor, offset: 0 })

  // 3. 精密 3D 回折格子プレート & 光学マウント (z = gratingZ)
  const gratW = 3.2
  const gratH = 2.0
  const gratGeo = new THREE.BoxGeometry(gratW, gratH, 0.12)
  const gratMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    roughness: 0.12,
    metalness: 0.18,
    depthWrite: false
  })
  const gratMesh = new THREE.Mesh(gratGeo, gratMat)
  gratMesh.position.set(0, 0, gratingZ)
  staticGroup.add(gratMesh)

  // 金属フレーム縁
  const frameEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(gratGeo),
    new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 })
  )
  frameEdge.position.copy(gratMesh.position)
  staticGroup.add(frameEdge)

  const gratPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, -floorY - gratH / 2 + 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
  )
  gratPost.position.set(0, (floorY - gratH / 2) / 2, gratingZ)
  staticGroup.add(gratPost)

  // 多重スリット縦溝ライン（スリット密度 N に連動）
  const groovePts = []
  const numGrooves = Math.min(36, Math.max(12, Math.round(linesPerMm.value / 24)))
  for (let i = 0; i <= numGrooves; i++) {
    const gx = -gratW * 0.45 + (i / numGrooves) * (gratW * 0.9)
    groovePts.push(new THREE.Vector3(gx, -gratH * 0.45, gratingZ + 0.068))
    groovePts.push(new THREE.Vector3(gx, gratH * 0.45, gratingZ + 0.068))
    groovePts.push(new THREE.Vector3(gx, -gratH * 0.45, gratingZ - 0.068))
    groovePts.push(new THREE.Vector3(gx, gratH * 0.45, gratingZ - 0.068))
  }
  staticGroup.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(groovePts),
      new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.58 })
    )
  )

  // 格子上の照射発光スポット
  const spotMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    new THREE.MeshBasicMaterial({ color: inColor })
  )
  spotMesh.position.copy(pGrating)
  staticGroup.add(spotMesh)

  const gratLbl = createTextSprite(`回折格子 (${linesPerMm.value}本/mm, d=${gratingD_um.value.toFixed(2)}μm)`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 28,
    scale: sprScale(0.43)
  })
  gratLbl.position.set(3.25, -1.28, gratingZ + 0.32)
  staticGroup.add(gratLbl)

  // 4. 3D 観測スクリーン (前面 & 上面にスペクトル帯テクスチャを貼付)
  const specTexFront = createSpectrumTexture(false)
  const specTexTop = createSpectrumTexture(true)
  const scrGeo = new THREE.BoxGeometry(screenWidthU, 1.8, 0.2)
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
  const topMat = new THREE.MeshBasicMaterial({ map: specTexTop })
  const faceMat = new THREE.MeshBasicMaterial({ map: specTexFront })
  // Box faces: +x, -x, +y, -y, +z, -z
  const scrMesh = new THREE.Mesh(scrGeo, [sideMat, sideMat, topMat, sideMat, faceMat, faceMat])
  scrMesh.position.set(0, 0, screenZ)
  staticGroup.add(scrMesh)

  // スクリーン左右スタンド柱
  ;[-3.6, 3.6].forEach(sx => {
    const sPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, -floorY - 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
    )
    sPost.position.set(sx, (floorY - 0.9) / 2, screenZ)
    staticGroup.add(sPost)
  })

  // 5. 3D 回折次数ビーム (m = 0, ±1, ±2)
  const d_nm = gratingD_nm.value
  const L_cm = screenDistCm.value

  const pScreen0 = new THREE.Vector3(0, 0, screenZ)
  addBeamTube(staticGroup, pGrating, pScreen0, inColor, 0.056, 0.95)
  pulseSegments.push({ p1: pGrating, p2: pScreen0, colorHex: inColor, offset: 0.25 })

  const m0Lbl = createTextSprite('m = 0 (中央明線)', {
    color: '#f8fafc',
    borderColor: '#94a3b8',
    fontSize: 28,
    scale: sprScale(0.43)
  })
  m0Lbl.position.set(0, 2.65, screenZ)
  staticGroup.add(m0Lbl)

  const placedLabelPositions = []
  const canPlaceLabel = (x, z) => {
    for (const p of placedLabelPositions) {
      if (Math.abs(p.x - x) < 1.65 && Math.abs(p.z - z) < 0.75) return false
    }
    placedLabelPositions.push({ x, z })
    return true
  }
  placedLabelPositions.push({ x: 0, z: screenZ - 0.52 })

  const addDiffractedOrder = (nm, orderM, radius, opacity, showLabel = false, customLabel = '') => {
    const sinTh = (orderM * nm) / d_nm
    if (sinTh >= 0.96) return null
    const th = Math.asin(sinTh)
    const x_cm = L_cm * Math.tan(th)
    const xU = x_cm * unitsPerCm
    if (xU > screenWidthU / 2 - 0.18) return null

    const rgb = nmToRgbObj(nm)
    for (const sign of [-1, 1]) {
      const targetPt = new THREE.Vector3(sign * xU, 0, screenZ + 0.08)
      addBeamTube(staticGroup, pGrating, targetPt, rgb.hex, radius, opacity)
      if (orderM === 1 || sourceType.value === 'laser') {
        pulseSegments.push({
          p1: pGrating,
          p2: targetPt,
          colorHex: rgb.hex,
          offset: 0.35 + orderM * 0.14
        })
      }

      if (showLabel) {
        const lblZ = orderM === 1 ? screenZ + 0.42 : screenZ - 0.58
        const lblY = orderM === 1 ? 2.48 : -1.55
        if (canPlaceLabel(sign * xU, lblZ)) {
          const lbl = createTextSprite(customLabel || `m = ${sign > 0 ? '+' : '-'}${orderM}`, {
            color: rgb.css,
            borderColor: rgb.css,
            fontSize: 27,
            scale: sprScale(0.41)
          })
          lbl.position.set(sign * xU, lblY, lblZ)
          staticGroup.add(lbl)
        }
      }
    }
    return xU
  }

  if (sourceType.value === 'laser') {
    for (let m = 1; m <= 3; m++) {
      addDiffractedOrder(wavelengthNm.value, m, m === 1 ? 0.05 : 0.038, m === 1 ? 0.94 : 0.72, m <= 2)
    }
  } else if (sourceType.value === 'hydrogen') {
    const balmer = [
      { nm: 656.3, name: 'Hα 656nm' },
      { nm: 486.1, name: 'Hβ 486nm' },
      { nm: 434.0, name: 'Hγ 434nm' },
      { nm: 410.2, name: 'Hδ 410nm' }
    ]
    balmer.forEach((bLine, idx) => {
      addDiffractedOrder(bLine.nm, 1, 0.038, 0.9, idx < 2, `m=±1 ${bLine.name}`)
      addDiffractedOrder(bLine.nm, 2, 0.025, 0.52, false)
    })
  } else {
    // 白色光: 連続虹リボンファン + 代表波長ビーム
    addRainbowFanRibbon(staticGroup, pGrating, screenZ, 1, d_nm, L_cm, unitsPerCm, screenWidthU / 2 - 0.15, 0.56)
    addRainbowFanRibbon(staticGroup, pGrating, screenZ, 2, d_nm, L_cm, unitsPerCm, screenWidthU / 2 - 0.15, 0.34)
    const keyWaves = [415, 470, 535, 590, 655]
    keyWaves.forEach(nm => {
      addDiffractedOrder(nm, 1, 0.024, 0.82, nm === 535, 'm = ±1 (1次虹)')
      addDiffractedOrder(nm, 2, 0.018, 0.45, nm === 535, 'm = ±2 (2次虹)')
    })
  }

  // 6. 回折角 θ₁ アークガイド（m=0 軸と 1次回折ビームの間）
  const refSin1 = Math.min(0.95, refWaveNm.value / d_nm)
  const refTh1 = Math.asin(refSin1)
  const arcRadius = Math.min(2.1, (gratingZ - screenZ) * 0.52)
  const arcPts = []
  const arcSteps = 22
  for (let i = 0; i <= arcSteps; i++) {
    const a = (i / arcSteps) * refTh1
    arcPts.push(new THREE.Vector3(arcRadius * Math.sin(a), 0.04, gratingZ - arcRadius * Math.cos(a)))
  }
  staticGroup.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.95 })
    )
  )
  const thetaLbl = createTextSprite(`θ₁ = ${theta1Deg.value.toFixed(1)}°`, {
    color: '#fde68a',
    borderColor: '#f59e0b',
    fontSize: 28,
    scale: sprScale(0.42)
  })
  const midA = refTh1 * 0.55
  thetaLbl.position.set(
    (arcRadius + 0.65) * Math.sin(midA) + 0.5,
    0.3,
    gratingZ - (arcRadius + 0.55) * Math.cos(midA)
  )
  staticGroup.add(thetaLbl)

  // 7. 隣接スリット光路差 (d sinθ = mλ) 3D 拡大原理カード（左側斜めスタンド配置）
  if (showPathDiff.value) {
    const insetTex = createPathDiffInsetTexture()
    const cardW = 3.15
    const cardH = 2.12
    const cardGeo = new THREE.BoxGeometry(cardW, cardH, 0.08)
    const cardDark = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    const cardFace = new THREE.MeshBasicMaterial({ map: insetTex })
    const cardMesh = new THREE.Mesh(cardGeo, [cardDark, cardDark, cardDark, cardDark, cardFace, cardFace])
    // 左側手前に角度をつけて配置 -> 3D/正面/上面すべての視点で他要素と非重複で判読可能
    cardMesh.position.set(-5.05, -0.25, 2.85)
    cardMesh.rotation.x = -0.62
    cardMesh.rotation.y = 0.24
    staticGroup.add(cardMesh)

    // 回折格子中心から拡大カードへの破線リーダー
    const leaderGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.35, 0.05, gratingZ),
      new THREE.Vector3(-3.45, -0.15, 2.65)
    ])
    const leaderMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 0.18,
      gapSize: 0.12,
      transparent: true,
      opacity: 0.85
    })
    const leaderLine = new THREE.Line(leaderGeo, leaderMat)
    leaderLine.computeLineDistances()
    staticGroup.add(leaderLine)
  }

  // 8. スクリーン上部の 3D 光強度分布曲線 I(x)
  const iPts = []
  const samples = 200
  const baseCurveY = 1.02
  for (let i = 0; i <= samples; i++) {
    const xU = -screenWidthU / 2 + (i / samples) * screenWidthU
    const x_cm = xU / unitsPerCm
    let intensity = 0.98 * Math.exp(-Math.pow(x_cm / 1.1, 2))

    if (sourceType.value === 'laser') {
      for (let m = 1; m <= 3; m++) {
        const sinM = (m * wavelengthNm.value) / d_nm
        if (sinM < 0.96) {
          const peakX = L_cm * Math.tan(Math.asin(sinM))
          intensity += (0.88 / m) * Math.exp(-Math.pow((Math.abs(x_cm) - peakX) / 0.95, 2))
        }
      }
    } else if (sourceType.value === 'hydrogen') {
      ;[656.3, 486.1, 434.0, 410.2].forEach((w, idx) => {
        const sin1 = w / d_nm
        if (sin1 < 0.96) {
          const peakX = L_cm * Math.tan(Math.asin(sin1))
          intensity += (0.72 - idx * 0.08) * Math.exp(-Math.pow((Math.abs(x_cm) - peakX) / 0.8, 2))
        }
      })
    } else {
      for (let m = 1; m <= 2; m++) {
        const sinB = (m * 390) / d_nm
        const sinR = (m * 720) / d_nm
        if (sinR < 0.96) {
          const xB = L_cm * Math.tan(Math.asin(sinB))
          const xR = L_cm * Math.tan(Math.asin(sinR))
          const absX = Math.abs(x_cm)
          if (absX >= xB - 0.8 && absX <= xR + 0.8) {
            const fade =
              absX < xB
                ? Math.exp(-Math.pow((xB - absX) / 0.5, 2))
                : absX > xR
                ? Math.exp(-Math.pow((absX - xR) / 0.5, 2))
                : 1.0
            intensity += (0.62 / m) * fade
          }
        }
      }
    }
    iPts.push(new THREE.Vector3(xU, baseCurveY + Math.min(1.35, intensity * 1.12), screenZ))
  }

  const iCurve = new THREE.CatmullRomCurve3(iPts)
  const iGeo = new THREE.TubeGeometry(iCurve, 180, 0.04, 8, false)
  const iCol = sourceType.value === 'laser' ? inColor : 0x38bdf8
  const iMat = new THREE.MeshStandardMaterial({
    color: iCol,
    emissive: iCol,
    emissiveIntensity: 0.65
  })
  staticGroup.add(new THREE.Mesh(iGeo, iMat))

  const iLbl = createTextSprite('3D 光強度分布 I(x)', {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 28,
    scale: sprScale(0.43)
  })
  iLbl.position.set(4.55, baseCurveY + 2.08, screenZ - 0.58)
  staticGroup.add(iLbl)
  const iLeaderGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(4.15, baseCurveY + 0.05, screenZ),
    iLbl.position.clone()
  ])
  const iLeader = new THREE.Line(
    iLeaderGeo,
    new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.16, gapSize: 0.1, transparent: true, opacity: 0.72 })
  )
  iLeader.computeLineDistances()
  staticGroup.add(iLeader)

  // 光子パルス球の生成
  const sphereGeo = new THREE.SphereGeometry(0.085, 12, 12)
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

watch([sourceType, wavelengthNm, linesPerMm, screenDistCm, showPathDiff], () => {
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
  font-size: 0.73rem;
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
  border: 1px solid rgba(56, 189, 248, 0.42);
  color: #7dd3fc;
  font-size: 0.73rem;
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
  opacity: 0.9;
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
  background: rgba(56, 189, 248, 0.2);
  color: #7dd3fc;
  border-color: #38bdf8;
  font-weight: 700;
}

.btn-group {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.select-btn {
  flex: 1 1 auto;
  min-width: 78px;
  padding: 0.4rem 0.55rem;
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  font-weight: bold;
}

.control-group strong {
  color: #38bdf8;
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

.btn-primary {
  background: #334155;
  color: #e2e8f0;
}

.btn-primary:hover {
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
  font-size: 1.1rem;
  font-weight: bold;
  color: #f8fafc;
}

.stat-card .value.highlight {
  color: #f59e0b;
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
    font-size: 0.67rem;
    padding: 3px 8px;
  }
  .three-ortho-badge {
    white-space: normal;
  }
}
</style>
