<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🌈</span>
        <h3 class="sim-title">3D 薄膜干渉 &amp; ニュートンリング・シミュレーター</h3>
        <span class="three-badge">Three.js 3D Interactive</span>
      </div>
      <div class="sim-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'film' }"
          @click="switchMode('film')"
        >
          薄膜の干渉色 (2nd cos r)
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'newton' }"
          @click="switchMode('newton')"
        >
          ニュートンリング
        </button>
      </div>
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
      <div class="preset-group" v-if="mode === 'film'">
        <button class="chip-btn" :class="{ active: !isWhiteLight }" @click="isWhiteLight = false">
          🔬 単色光 (λ)
        </button>
        <button class="chip-btn" :class="{ active: isWhiteLight }" @click="isWhiteLight = true">
          🌈 白色光 (シャボン玉干渉色)
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
          <i :style="{ background: isWhiteLight && mode === 'film' ? '#f8fafc' : waveColor, boxShadow: '0 0 6px ' + waveColor }"></i>
          {{ mode === 'film' ? '入射・膜内光路 (2n₂d cos r)' : '入射・反射光' }}
        </span>
        <span class="legend-item">
          <i style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>
          πズレ / 固定端反射 (小→大)
        </span>
        <span class="legend-item">
          <i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>
          位相ズレなし / 自由端 (大→小)
        </span>
      </div>
      <div class="three-ortho-badge">
        {{ orthoBadgeText }}
      </div>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- リアルタイム情報パネル -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">{{ isWhiteLight && mode === 'film' ? '光源スペクトル' : '波長 λ' }}</div>
        <div class="stat-value" :style="{ color: isWhiteLight && mode === 'film' ? '#f8fafc' : waveColor }">
          {{ isWhiteLight && mode === 'film' ? '白色光' : wavelength }}
          <span class="stat-unit" v-if="!(isWhiteLight && mode === 'film')">nm</span>
        </div>
        <div class="stat-sub">{{ isWhiteLight && mode === 'film' ? '380–780 nm 連続合成' : '単色コヒーレント光' }}</div>
      </div>

      <div v-if="mode === 'film'" class="stat-card">
        <div class="stat-label">膜厚 d / 入射角 i</div>
        <div class="stat-value text-blue">{{ filmThickness }} <span class="unit-sm">nm</span> / {{ incidenceAngle }}°</div>
        <div class="stat-sub">屈折角 r = {{ refractAngleDeg.toFixed(1) }}°</div>
      </div>

      <div v-if="mode === 'film'" class="stat-card">
        <div class="stat-label">屈折率 n₁ / n₂ / n₃</div>
        <div class="stat-value text-yellow" style="font-size:0.98rem;">
          {{ n1.toFixed(2) }} / {{ filmIndex.toFixed(2) }} / {{ n3.toFixed(2) }}
        </div>
        <div class="stat-sub">{{ phaseFlipCount === 1 ? '位相反転 1回 (πズレ)' : phaseFlipCount === 2 ? '位相反転 2回 (同位相)' : '位相反転 0回 (同位相)' }}</div>
      </div>

      <div v-if="mode === 'film'" class="stat-card highlight">
        <div class="stat-label">光路差 Δ = 2n₂d cos r</div>
        <div class="stat-value text-cyan">{{ opticalPathDiff.toFixed(0) }} <span class="stat-unit">nm</span></div>
        <div class="stat-sub">{{ interferenceConditionFormula }}</div>
      </div>

      <div v-if="mode === 'newton'" class="stat-card">
        <div class="stat-label">レンズ曲率半径 R</div>
        <div class="stat-value text-blue">{{ lensRadius }} <span class="stat-unit">m</span></div>
        <div class="stat-sub">d ≈ r² / 2R</div>
      </div>

      <div v-if="mode === 'newton'" class="stat-card">
        <div class="stat-label">第1明環半径 r₁</div>
        <div class="stat-value text-cyan">{{ firstBrightRadiusMm.toFixed(2) }} <span class="stat-unit">mm</span></div>
        <div class="stat-sub">r = √((m + ½)Rλ)</div>
      </div>

      <div v-if="mode === 'newton'" class="stat-card highlight">
        <div class="stat-label">中心部 (r=0) の干渉</div>
        <div class="stat-value text-rose">暗環 (位相反転 π)</div>
        <div class="stat-sub">空気→ガラスで固定端反射</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label class="control-label">
            <span>単色光の波長 λ:</span>
            <span class="control-val" :style="{ color: waveColor }">{{ wavelength }} nm</span>
          </label>
          <input
            type="range"
            v-model.number="wavelength"
            min="380"
            max="780"
            step="5"
            class="sim-slider"
            @input="isWhiteLight = false"
          />
          <div class="spectral-bar"></div>
          <div class="quick-chips">
            <button class="mini-chip" :class="{ on: !isWhiteLight && wavelength === 450 }" @click="isWhiteLight = false; wavelength = 450">450nm 青</button>
            <button class="mini-chip" :class="{ on: !isWhiteLight && wavelength === 550 }" @click="isWhiteLight = false; wavelength = 550">550nm 緑</button>
            <button class="mini-chip" :class="{ on: !isWhiteLight && wavelength === 650 }" @click="isWhiteLight = false; wavelength = 650">650nm 赤</button>
          </div>
        </div>

        <div v-if="mode === 'film'" class="control-group">
          <label class="control-label">
            <span>膜の厚さ d:</span>
            <span class="control-val">{{ filmThickness }} nm</span>
          </label>
          <input type="range" v-model.number="filmThickness" min="50" max="800" step="10" class="sim-slider" />
          <div class="ctrl-note">λ/4 厚さ付近で固定端1回のとき強く反射、2回のとき無反射</div>
        </div>

        <div v-if="mode === 'film'" class="control-group">
          <label class="control-label">
            <span>膜の屈折率 n₂:</span>
            <span class="control-val">{{ filmIndex.toFixed(2) }}</span>
          </label>
          <input type="range" v-model.number="filmIndex" min="1.0" max="2.0" step="0.05" class="sim-slider" />
          <div class="ctrl-note">n₁・n₃ との大小関係で表面・裏面の位相反転が自動切替</div>
        </div>

        <div v-if="mode === 'newton'" class="control-group">
          <label class="control-label">
            <span>レンズ曲率半径 R:</span>
            <span class="control-val">{{ lensRadius }} m</span>
          </label>
          <input type="range" v-model.number="lensRadius" min="5" max="30" step="1" class="sim-slider" />
        </div>
      </div>

      <div v-if="mode === 'film'" class="control-row" style="margin-top: 8px;">
        <div class="control-group">
          <label class="control-label">
            <span>入射角 i:</span>
            <span class="control-val">{{ incidenceAngle }}°</span>
          </label>
          <input type="range" v-model.number="incidenceAngle" min="0" max="70" step="5" class="sim-slider" />
          <div class="quick-chips">
            <button class="mini-chip" :class="{ on: incidenceAngle === 0 }" @click="incidenceAngle = 0">垂直入射 i=0°</button>
            <button class="mini-chip" :class="{ on: incidenceAngle === 35 }" @click="incidenceAngle = 35">標準 i=35°</button>
            <button class="mini-chip" :class="{ on: incidenceAngle === 60 }" @click="incidenceAngle = 60">斜め i=60°</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">
            <span>上側媒質 n₁ / 下側媒質 n₃:</span>
            <span class="control-val">n₁={{ n1.toFixed(2) }}, n₃={{ n3.toFixed(2) }}</span>
          </label>
          <div class="select-pair">
            <select v-model.number="n1" class="mini-select">
              <option :value="1.0">上 n₁: 空気 (1.00)</option>
              <option :value="1.33">上 n₁: 水 (1.33)</option>
              <option :value="1.52">上 n₁: ガラス (1.52)</option>
            </select>
            <select v-model.number="n3" class="mini-select">
              <option :value="1.0">下 n₃: 空気 (1.00)</option>
              <option :value="1.33">下 n₃: 水 (1.33)</option>
              <option :value="1.52">下 n₃: ガラス (1.52)</option>
            </select>
          </div>
          <div class="quick-chips" style="margin-top:6px;">
            <button class="mini-chip" @click="applyFilmPreset('soap')">🫧 シャボン玉 (空/膜/空)</button>
            <button class="mini-chip" @click="applyFilmPreset('ar')">📷 無反射膜 (空/膜/硝)</button>
            <button class="mini-chip" @click="applyFilmPreset('oil')">🛢️ 水上油膜 (空/油/水)</button>
            <button class="mini-chip" @click="applyFilmPreset('airgap')">🔬 空気薄膜 (硝/空/硝)</button>
          </div>
        </div>
      </div>
    </div>

    <div class="sim-footer-note">
      💡 <strong>物理の急所</strong>:
      <template v-if="mode === 'film'">
        屈折率が<strong>小 → 大</strong>の境界面での反射（<span style="color:#fda4af">ローズ #f43f5e</span>）では位相が <strong>π（半波長分）反転（固定端反射）</strong>し、<strong>大 → 小</strong>（<span style="color:#7dd3fc">シアン #38bdf8</span>）では<strong>位相ズレなし（自由端反射）</strong>となります。表裏2つの反射で位相反転が「1回」か「0/2回」かを見極めるのが攻略の鍵です！
      </template>
      <template v-else>
        <strong>ニュートンリングの中心は常に「暗環（黒）」になります！</strong>
        レンズ下面（ガラス → 空気：自由端）では位相変化なし（0）ですが、平板ガラス上面（空気 → ガラス：固定端）では<strong>位相が π 反転</strong>するため、光路差ゼロの接触点で逆位相（弱め合い）となるからです。
      </template>
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

const mode = ref('film') // 'film' | 'newton'
const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)
const isWhiteLight = ref(false)

const wavelength = ref(550) // nm
const filmThickness = ref(350) // nm
const filmIndex = ref(1.33) // n2
const incidenceAngle = ref(35) // deg
const n1 = ref(1.0) // 上側媒質
const n3 = ref(1.0) // 下側媒質
const lensRadius = ref(15) // m

// 正確な 380–780 nm スペクトル RGB 変換
function wlToRgbObj(wl) {
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

const waveColor = computed(() => wlToRgbObj(wavelength.value).css)

// スネルの法則 n1 sin(i) = n2 sin(r)
const incRad = computed(() => (incidenceAngle.value * Math.PI) / 180)
const sinRefract = computed(() => Math.min(0.96, (n1.value / Math.max(1.0, filmIndex.value)) * Math.sin(incRad.value)))
const refractRad = computed(() => Math.asin(sinRefract.value))
const refractAngleDeg = computed(() => (refractRad.value * 180) / Math.PI)

// 境界面での位相変化判定: 小→大 なら π反転 (固定端反射), 大→小 なら 0 (自由端反射)
function getPhaseInfo(nFrom, nTo) {
  if (Math.abs(nFrom - nTo) < 0.015) {
    return {
      flip: false,
      none: true,
      colorHex: 0x94a3b8,
      textCss: '#cbd5e1',
      borderCss: '#94a3b8',
      shortLabel: '境界反射なし (n一致)'
    }
  }
  if (nFrom < nTo) {
    return {
      flip: true,
      none: false,
      colorHex: 0xf43f5e,
      textCss: '#fda4af',
      borderCss: '#f43f5e',
      shortLabel: 'πズレ / 固定端反射'
    }
  }
  return {
    flip: false,
    none: false,
    colorHex: 0x38bdf8,
    textCss: '#7dd3fc',
    borderCss: '#38bdf8',
    shortLabel: '位相ズレなし / 自由端'
  }
}

const topPhaseInfo = computed(() => getPhaseInfo(n1.value, filmIndex.value))
const botPhaseInfo = computed(() => getPhaseInfo(filmIndex.value, n3.value))
const phaseFlipCount = computed(() => (topPhaseInfo.value.flip ? 1 : 0) + (botPhaseInfo.value.flip ? 1 : 0))

const opticalPathDiff = computed(() => 2 * filmIndex.value * filmThickness.value * Math.cos(refractRad.value))

const interferenceConditionFormula = computed(() =>
  phaseFlipCount.value === 1 ? '明: 2nd cos r = (m+½)λ' : '明: 2nd cos r = mλ'
)

const firstBrightRadiusMm = computed(() => Math.sqrt(0.5 * lensRadius.value * (wavelength.value * 1e-9)) * 1000)

const orthoBadgeText = computed(() => {
  if (mode.value === 'newton') {
    return 'ニュートンリング | 上面反射(自由端 0) + 平板反射(固定端 π) → 中心 r=0: 暗環'
  }
  const rel = phaseFlipCount.value === 1 ? '表面/裏面で位相差 π' : '表面/裏面で同位相 (0)'
  return `n₁=${n1.value.toFixed(2)} / n₂=${filmIndex.value.toFixed(2)} / n₃=${n3.value.toFixed(2)} | ${rel}`
})

// 白色光合成干渉色 RGB を計算
function computeWhiteLightInterferenceColor(deltaNm, flipOffsetRad) {
  let sumR = 0, sumG = 0, sumB = 0, norm = 0
  for (let nm = 390; nm <= 730; nm += 10) {
    const phi = (2 * Math.PI * deltaNm) / nm + flipOffsetRad
    const intensity = Math.pow(Math.cos(phi / 2), 2)
    const rgb = wlToRgbObj(nm)
    sumR += rgb.r * intensity
    sumG += rgb.g * intensity
    sumB += rgb.b * intensity
    norm += 255
  }
  // 相対明度を鮮やかにスケーリング
  const scale = 2.85 / Math.max(1, norm / 255)
  const r = Math.min(255, Math.round(sumR * scale))
  const g = Math.min(255, Math.round(sumG * scale))
  const b = Math.min(255, Math.round(sumB * scale))
  return {
    r,
    g,
    b,
    hex: (r << 16) | (g << 8) | b,
    css: `rgb(${r}, ${g}, ${b})`
  }
}

function applyFilmPreset(type) {
  if (type === 'soap') {
    n1.value = 1.0
    filmIndex.value = 1.33
    n3.value = 1.0
    filmThickness.value = 350
    incidenceAngle.value = 35
  } else if (type === 'ar') {
    n1.value = 1.0
    filmIndex.value = 1.25
    n3.value = 1.52
    filmThickness.value = 110
    incidenceAngle.value = 20
  } else if (type === 'oil') {
    n1.value = 1.0
    filmIndex.value = 1.48
    n3.value = 1.33
    filmThickness.value = 280
    incidenceAngle.value = 35
  } else if (type === 'airgap') {
    n1.value = 1.52
    filmIndex.value = 1.0
    n3.value = 1.52
    filmThickness.value = 275
    incidenceAngle.value = 25
  }
}

function switchMode(newMode) {
  mode.value = newMode
  setCameraPreset('3d')
  rebuildScene()
}

function getMobileScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 420
  const aspect = w / Math.max(1, h)
  return aspect < 1.35 ? Math.min(1.68, Math.max(1.22, 1.38 / Math.max(0.7, aspect))) : 1.0
}

function sprScale(base) {
  return getMobileScale() > 1.02 ? +(base * 1.48).toFixed(3) : base
}

function getCamParams(preset) {
  const s = getMobileScale()
  const isMob = s > 1.02
  if (preset === 'side') {
    return {
      pos: [0.1, 0.45, 34.5 * s],
      target: [0.1, isMob ? 0.0 : 0.35, 0],
      fov: 14
    }
  }
  if (preset === 'top') {
    return {
      pos: [0, 44.0 * s, 0.28],
      target: [0, 0, 0.12],
      fov: 14
    }
  }
  return {
    pos: [5.8 * s, 5.2 * s, 11.8 * s],
    target: [0, isMob ? -0.3 : 0.15, 0],
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

function addRayTube(parent, p1, p2, colorHex, radius = 0.045, opacity = 0.94, emissiveMult = 0.65) {
  if (p1.distanceTo(p2) < 0.01) return
  const curve = new THREE.LineCurve3(p1, p2)
  const geo = new THREE.TubeGeometry(curve, 10, radius, 10, false)
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: emissiveMult,
    roughness: 0.2,
    transparent: opacity < 1,
    opacity
  })
  parent.add(new THREE.Mesh(geo, mat))
}

function addDashedLine(parent, p1, p2, colorHex, opacity = 0.65) {
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

function addPhaseMarker(parent, pos, phaseInfo) {
  // 水平グローリング + 中央発光コア + 立体オーラ
  const ringGeo = new THREE.TorusGeometry(0.24, 0.042, 12, 28)
  ringGeo.rotateX(Math.PI / 2)
  const ringMat = new THREE.MeshBasicMaterial({ color: phaseInfo.colorHex })
  const ringMesh = new THREE.Mesh(ringGeo, ringMat)
  ringMesh.position.copy(pos)
  parent.add(ringMesh)

  const coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    new THREE.MeshBasicMaterial({ color: phaseInfo.colorHex })
  )
  coreMesh.position.copy(pos)
  parent.add(coreMesh)

  const haloMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshBasicMaterial({ color: phaseInfo.colorHex, transparent: true, opacity: 0.2 })
  )
  haloMesh.position.copy(pos)
  parent.add(haloMesh)
}

function addWaveOscillationAlongRay(parent, pStart, pEnd, phaseOffsetRad, colorHex, amp = 0.085, waveCount = 3.5) {
  const dir = pEnd.clone().sub(pStart)
  const len = dir.length()
  if (len < 0.2) return
  const unit = dir.clone().normalize()
  // xy平面上の直交法線
  const perp = new THREE.Vector3(-unit.y, unit.x, 0)
  const pts = []
  const steps = 48
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const pt = pStart.clone().addScaledVector(unit, u * len)
    const fade = Math.sin(Math.PI * Math.min(1, u * 4)) * 0.9 + 0.1
    const val = amp * fade * Math.sin(u * waveCount * Math.PI * 2 + phaseOffsetRad)
    pt.addScaledVector(perp, val)
    pt.z += 0.06
    pts.push(pt)
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 })))
}

function registerPulse(p1, p2, colorHex, offset = 0) {
  pulseSegments.push({ p1: p1.clone(), p2: p2.clone(), colorHex, offset })
}

function mediumColorAndLabel(nVal, role) {
  if (nVal <= 1.05) {
    return { hex: 0x0f172a, opacity: 0.12, name: `空気 (n=${nVal.toFixed(2)})`, text: '#cbd5e1' }
  }
  if (nVal <= 1.38) {
    return { hex: 0x06b6d4, opacity: 0.22, name: `水/低屈折膜 (n=${nVal.toFixed(2)})`, text: '#67e8f9' }
  }
  return { hex: 0x38bdf8, opacity: 0.28, name: role === 'sub' ? `ガラス基板 (n=${nVal.toFixed(2)})` : `高屈折率媒質 (n=${nVal.toFixed(2)})`, text: '#93c5fd' }
}

function buildFilmScene() {
  const wlObj = wlToRgbObj(wavelength.value)
  const thickU = 0.72 + ((filmThickness.value - 50) / 750) * 1.48
  const topY = 0.55
  const botY = topY - thickU

  const delta = opticalPathDiff.value
  const flipOffset = phaseFlipCount.value === 1 ? Math.PI : 0
  const phaseDiff = (2 * Math.PI * delta) / wavelength.value + flipOffset
  const monoIntensity = Math.pow(Math.cos(phaseDiff / 2), 2)

  const whiteColorObj = computeWhiteLightInterferenceColor(delta, flipOffset)
  const activeColorHex = isWhiteLight.value ? whiteColorObj.hex : wlObj.hex
  const activeColorCss = isWhiteLight.value ? whiteColorObj.css : wlObj.css
  const beamColorHex = isWhiteLight.value ? 0xf8fafc : wlObj.hex
  const beamColorCss = isWhiteLight.value ? '#f8fafc' : wlObj.css

  const slabW = 6.2
  const slabZ = 3.8
  const slabX = -1.3

  // 1a. 上側媒質 (n1 > 1 の場合はガラス/水の半透明ブロックを表示)
  const med1 = mediumColorAndLabel(n1.value, 'top')
  if (n1.value > 1.05) {
    const topMedGeo = new THREE.BoxGeometry(slabW, 1.5, slabZ)
    const topMedMat = new THREE.MeshStandardMaterial({
      color: med1.hex,
      transparent: true,
      opacity: med1.opacity,
      roughness: 0.15,
      depthWrite: false
    })
    const topMedMesh = new THREE.Mesh(topMedGeo, topMedMat)
    topMedMesh.position.set(slabX, topY + 0.76, 0)
    staticGroup.add(topMedMesh)
  }

  // 1b. 3D 半透明光学薄膜スラブ (n2, 厚さ d)
  const filmGeo = new THREE.BoxGeometry(slabW, thickU, slabZ)
  const filmTintHex = isWhiteLight.value ? whiteColorObj.hex : filmIndex.value <= 1.05 ? 0x1e293b : 0x38bdf8
  const filmMat = new THREE.MeshStandardMaterial({
    color: filmTintHex,
    emissive: activeColorHex,
    emissiveIntensity: isWhiteLight.value ? 0.36 : 0.12 + monoIntensity * 0.25,
    transparent: true,
    opacity: filmIndex.value <= 1.05 ? 0.18 : 0.36,
    roughness: 0.12,
    metalness: 0.12,
    depthWrite: false
  })
  const filmMesh = new THREE.Mesh(filmGeo, filmMat)
  filmMesh.position.set(slabX, (topY + botY) / 2, 0)
  staticGroup.add(filmMesh)

  const edgeLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(filmGeo),
    new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.72 })
  )
  edgeLines.position.copy(filmMesh.position)
  staticGroup.add(edgeLines)

  // 1c. 下側媒質基板 (n3)
  const med3 = mediumColorAndLabel(n3.value, 'sub')
  const subH = 0.95
  const subGeo = new THREE.BoxGeometry(slabW, subH, slabZ)
  const subMat = new THREE.MeshStandardMaterial({
    color: n3.value <= 1.05 ? 0x0f172a : med3.hex,
    transparent: true,
    opacity: n3.value <= 1.05 ? 0.35 : 0.48,
    roughness: 0.25,
    depthWrite: false
  })
  const subMesh = new THREE.Mesh(subGeo, subMat)
  subMesh.position.set(slabX, botY - subH / 2 - 0.02, 0)
  staticGroup.add(subMesh)

  const subEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(subGeo),
    new THREE.LineBasicMaterial({
      color: n3.value <= 1.05 ? 0x475569 : 0x38bdf8,
      transparent: true,
      opacity: 0.45
    })
  )
  subEdge.position.copy(subMesh.position)
  staticGroup.add(subEdge)

  // 媒質 & 膜厚ラベル（左外側の空間に X/Y/Z を分散し、3D/断面/上面/モバイルすべてで非衝突）
  const m1Lbl = createTextSprite(`媒質1: ${med1.name}`, {
    color: med1.text,
    borderColor: 'rgba(148,163,184,0.45)',
    fontSize: 26,
    scale: sprScale(0.38)
  })
  m1Lbl.position.set(slabX - 3.35, topY + 0.9, -1.05)
  staticGroup.add(m1Lbl)

  const filmLbl = createTextSprite(`薄膜 n₂=${filmIndex.value.toFixed(2)}, d=${filmThickness.value}nm`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 26,
    scale: sprScale(0.39)
  })
  filmLbl.position.set(slabX - 2.95, (topY + botY) / 2, 2.25)
  staticGroup.add(filmLbl)

  const m3Lbl = createTextSprite(`媒質3: ${med3.name}`, {
    color: med3.text,
    borderColor: 'rgba(56,189,248,0.4)',
    fontSize: 26,
    scale: sprScale(0.38)
  })
  m3Lbl.position.set(slabX - 0.55, botY - 1.28, 2.25)
  staticGroup.add(m3Lbl)

  // 2. スネルの法則に基づく正確な 3D 光線経路計算
  // 垂直入射 (i < 4°) のときも Ray ① / ② の重なりを防ぐため最小表示角を確保
  const effIncRad = Math.max((5 * Math.PI) / 180, incRad.value)
  const effRefRad = Math.asin(Math.min(0.9, (n1.value / Math.max(0.85, filmIndex.value)) * Math.sin(effIncRad)))

  const dxFilmHalf = thickU * Math.tan(effRefRad)
  const rayRiseH = 2.05
  const dxAir = rayRiseH * Math.tan(effIncRad)

  const hit1X = slabX - dxFilmHalf * 0.65 - 0.45
  const pHit1 = new THREE.Vector3(hit1X, topY, 0)
  const pIn = new THREE.Vector3(hit1X - dxAir, topY + rayRiseH, 0)
  const pRef1 = new THREE.Vector3(hit1X + dxAir, topY + rayRiseH, 0)
  const pHit2 = new THREE.Vector3(hit1X + dxFilmHalf, botY, 0)
  const pOut1 = new THREE.Vector3(hit1X + dxFilmHalf * 2, topY, 0)
  const pRef2 = new THREE.Vector3(pOut1.x + dxAir, topY + rayRiseH, 0)

  // 点 A, 点 C の法線破線
  addDashedLine(staticGroup, new THREE.Vector3(pHit1.x, topY + 1.3, 0), new THREE.Vector3(pHit1.x, botY - 0.3, 0), 0x64748b, 0.55)
  addDashedLine(staticGroup, new THREE.Vector3(pOut1.x, topY + 1.3, 0), new THREE.Vector3(pOut1.x, topY - 0.4, 0), 0x64748b, 0.45)

  // 入射光
  addRayTube(staticGroup, pIn, pHit1, beamColorHex, 0.056, 0.96)
  registerPulse(pIn, pHit1, beamColorHex, 0)

  // Ray ① (表面反射: 点 A -> pRef1)
  const ray1Col = topPhaseInfo.value.flip ? 0xf43f5e : 0x38bdf8
  addRayTube(staticGroup, pHit1, pRef1, ray1Col, 0.048, 0.95)
  registerPulse(pHit1, pRef1, ray1Col, 0.45)

  // 膜内光路強調シース + 光線 (A -> B -> C)
  addRayTube(staticGroup, pHit1, pHit2, beamColorHex, 0.048, 0.96)
  addRayTube(staticGroup, pHit2, pOut1, beamColorHex, 0.048, 0.96)
  // ハイライト光路シース (膜内光路 2nd cos r を視覚強調)
  addRayTube(staticGroup, pHit1, pHit2, 0xfbbf24, 0.105, 0.24, 0.35)
  addRayTube(staticGroup, pHit2, pOut1, 0xfbbf24, 0.105, 0.24, 0.35)
  registerPulse(pHit1, pHit2, beamColorHex, 0.22)
  registerPulse(pHit2, pOut1, beamColorHex, 0.42)

  // Ray ② (裏面反射後に出射する平行光: C -> pRef2)
  const ray2Col = botPhaseInfo.value.flip ? 0xf43f5e : 0x38bdf8
  addRayTube(staticGroup, pOut1, pRef2, ray2Col, 0.048, 0.95)
  registerPulse(pOut1, pRef2, ray2Col, 0.65)

  // 単色光モード時は平行反射光 ①・② 上に位相差 Δφ を示す正弦波カーブを重ね描き
  if (!isWhiteLight.value) {
    addWaveOscillationAlongRay(staticGroup, pHit1, pRef1, topPhaseInfo.value.flip ? Math.PI : 0, ray1Col, 0.075, 3.0)
    addWaveOscillationAlongRay(
      staticGroup,
      pOut1,
      pRef2,
      (2 * Math.PI * delta) / wavelength.value + (botPhaseInfo.value.flip ? Math.PI : 0),
      ray2Col,
      0.075,
      3.0
    )
  }

  // 等波面垂線 A -> D (点 A から Ray ② へ)
  const uRef = pRef2.clone().sub(pOut1).normalize()
  const projAD = pHit1.clone().sub(pOut1).dot(uRef)
  if (projAD > 0.05) {
    const pD = pOut1.clone().addScaledVector(uRef, projAD)
    addDashedLine(staticGroup, pHit1, pD, 0xfbbf24, 0.8)
  }

  // 両境界面の位相反転グローリング & バッジ
  addPhaseMarker(staticGroup, pHit1, topPhaseInfo.value)
  addPhaseMarker(staticGroup, pHit2, botPhaseInfo.value)

  // 境界面① バッジ + リーダー
  const badge1Pos = new THREE.Vector3(pHit1.x - 1.25, topY + 0.32, 1.55)
  addDashedLine(staticGroup, pHit1, badge1Pos, topPhaseInfo.value.colorHex, 0.7)
  const badge1Lbl = createTextSprite(`① 表面: ${topPhaseInfo.value.shortLabel}`, {
    color: topPhaseInfo.value.textCss,
    borderColor: topPhaseInfo.value.borderCss,
    fontSize: 26,
    scale: sprScale(0.38)
  })
  badge1Lbl.position.copy(badge1Pos)
  staticGroup.add(badge1Lbl)

  // 境界面② バッジ + リーダー
  const badge2Pos = new THREE.Vector3(pHit2.x + 1.85, botY - 0.35, -2.45)
  addDashedLine(staticGroup, pHit2, badge2Pos, botPhaseInfo.value.colorHex, 0.7)
  const badge2Lbl = createTextSprite(`② 裏面: ${botPhaseInfo.value.shortLabel}`, {
    color: botPhaseInfo.value.textCss,
    borderColor: botPhaseInfo.value.borderCss,
    fontSize: 26,
    scale: sprScale(0.38)
  })
  badge2Lbl.position.copy(badge2Pos)
  staticGroup.add(badge2Lbl)

  // 光線ラベル（小入射角でも重ならないよう X / Y / Z をすべて分散）
  const inRayLbl = createTextSprite(isWhiteLight.value ? '白色入射光' : `入射光 (${wavelength.value}nm)`, {
    color: beamColorCss,
    borderColor: beamColorCss,
    fontSize: 26,
    scale: sprScale(0.38)
  })
  inRayLbl.position.set(pIn.x - 0.25, pIn.y + 0.62, 0.35)
  staticGroup.add(inRayLbl)

  const r1Lbl = createTextSprite('Ray ① (表面反射)', {
    color: topPhaseInfo.value.textCss,
    borderColor: topPhaseInfo.value.borderCss,
    fontSize: 26,
    scale: sprScale(0.38)
  })
  r1Lbl.position.set(pRef1.x - 0.05, pRef1.y + 0.58, 0.25)
  staticGroup.add(r1Lbl)

  const r2Lbl = createTextSprite(`Ray ② (光路差 ${delta.toFixed(0)}nm)`, {
    color: botPhaseInfo.value.textCss,
    borderColor: botPhaseInfo.value.borderCss,
    fontSize: 26,
    scale: sprScale(0.38)
  })
  r2Lbl.position.set(pRef2.x + 1.05, pRef2.y + 0.2, 1.05)
  staticGroup.add(r2Lbl)

  // 3. 右側: 単一 3D 干渉色・明暗プレビュー球 (全カメラ視点で真円・二重像なし)
  const panelX = 3.85

  // 単色光時は明暗 (monoIntensity) を物理的に反映し、0% で本当に暗く消光させる
  const brightness = isWhiteLight.value ? 1.0 : 0.06 + 0.94 * monoIntensity
  const basePreviewCol = new THREE.Color(isWhiteLight.value ? whiteColorObj.hex : wlObj.hex)
  const dimmedCol = basePreviewCol.clone().multiplyScalar(brightness)
  const previewMeshMat = new THREE.MeshStandardMaterial({
    color: dimmedCol,
    emissive: basePreviewCol,
    emissiveIntensity: isWhiteLight.value ? 0.92 : monoIntensity * 1.12,
    roughness: 0.2
  })

  const previewSphere = new THREE.Mesh(new THREE.SphereGeometry(0.92, 36, 36), previewMeshMat)
  previewSphere.position.set(panelX, 0.35, 0)
  staticGroup.add(previewSphere)

  // 暗い消光状態 (0%) でも輪郭が明快な赤道シアン枠リング
  const orbRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.82 })
  const orbEqRing = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.04, 12, 48).rotateX(Math.PI / 2), orbRingMat)
  orbEqRing.position.set(panelX, 0.35, 0)
  staticGroup.add(orbEqRing)

  const orbVertRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.04, 0.032, 10, 48),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  )
  orbVertRing.position.set(panelX, 0.35, 0)
  staticGroup.add(orbVertRing)

  let previewTxt = ''
  let previewCol = activeColorCss
  if (isWhiteLight.value) {
    previewTxt = `白色光 合成干渉色`
    previewCol = '#f8fafc'
  } else {
    previewTxt =
      monoIntensity > 0.65
        ? `強め合い・明 (${(monoIntensity * 100).toFixed(0)}%)`
        : monoIntensity < 0.35
        ? `弱め合い・暗 (${(monoIntensity * 100).toFixed(0)}%)`
        : `中間干渉 (${(monoIntensity * 100).toFixed(0)}%)`
    previewCol = monoIntensity > 0.65 ? '#4ade80' : monoIntensity < 0.35 ? '#fda4af' : '#fde047'
  }

  const panelLbl = createTextSprite(previewTxt, {
    color: previewCol,
    borderColor: previewCol,
    fontSize: 28,
    scale: sprScale(0.45)
  })
  panelLbl.position.set(panelX, -1.28, 1.95)
  staticGroup.add(panelLbl)
}

function createNewtonRingTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, size, size)

  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.46
  const R_val = lensRadius.value
  const wl_val = wavelength.value * 1e-9
  const wlObj = wlToRgbObj(wavelength.value)

  for (let r = 1; r < maxR; r += 1.5) {
    const r_real = (r / maxR) * 0.0032
    const d = (r_real * r_real) / (2 * R_val)
    const phase = (2 * Math.PI * (2 * d)) / wl_val + Math.PI
    const intensity = Math.pow(Math.cos(phase / 2), 2)

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${wlObj.r}, ${wlObj.g}, ${wlObj.b}, ${intensity * 0.96})`
    ctx.lineWidth = 2.4
    ctx.stroke()
  }

  // 中心暗斑マーク
  ctx.fillStyle = '#020617'
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

function buildNewtonScene() {
  const wlObj = wlToRgbObj(wavelength.value)
  const diskRadius = 3.55

  // 1. 下部平板ガラス (y = -0.35 .. 0)
  const plateGeo = new THREE.BoxGeometry(8.2, 0.35, 8.2)
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    roughness: 0.14,
    metalness: 0.12,
    depthWrite: false
  })
  const plateMesh = new THREE.Mesh(plateGeo, plateMat)
  plateMesh.position.set(0, -0.18, 0)
  staticGroup.add(plateMesh)
  const plateEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(plateGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
  )
  plateEdge.position.copy(plateMesh.position)
  staticGroup.add(plateEdge)

  // 2. 接触面上のニュートンリング干渉縞ディスク
  const ringTex = createNewtonRingTexture()
  const ringGeo = new THREE.CircleGeometry(diskRadius, 64)
  ringGeo.rotateX(-Math.PI / 2)
  const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide }))
  ringMesh.position.set(0, 0.012, 0)
  staticGroup.add(ringMesh)

  // 3. 3D 平凸レンズ
  const maxGap = 0.26 + (30 / lensRadius.value) * 0.26
  const topY = maxGap + 0.58
  const lathePts = []
  const steps = 28
  for (let i = 0; i <= steps; i++) {
    const r = (i / steps) * diskRadius
    const yBot = maxGap * Math.pow(r / diskRadius, 2)
    lathePts.push(new THREE.Vector2(r, yBot))
  }
  lathePts.push(new THREE.Vector2(diskRadius, topY))
  lathePts.push(new THREE.Vector2(0, topY))

  const lensGeo = new THREE.LatheGeometry(lathePts, 48)
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.25,
    roughness: 0.1,
    metalness: 0.15,
    depthWrite: false
  })
  staticGroup.add(new THREE.Mesh(lensGeo, lensMat))

  const rimGeo = new THREE.TorusGeometry(diskRadius, 0.045, 14, 48)
  rimGeo.rotateX(Math.PI / 2)
  const rimMesh = new THREE.Mesh(rimGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))
  rimMesh.position.set(0, topY, 0)
  staticGroup.add(rimMesh)

  // 4. 垂直入射光線と両境界面位相リング（左・右サンプル）
  const sampleX = [-2.2, 2.2]
  sampleX.forEach((sx, idx) => {
    const gapY = maxGap * Math.pow(Math.abs(sx) / diskRadius, 2)
    const pTop = new THREE.Vector3(sx, 2.8, 0)
    const pLensBot = new THREE.Vector3(sx, gapY, 0)
    const pPlateTop = new THREE.Vector3(sx, 0, 0)

    addRayTube(staticGroup, pTop, pPlateTop, wlObj.hex, 0.036, 0.8)
    addRayTube(staticGroup, new THREE.Vector3(sx + 0.12, gapY, 0), new THREE.Vector3(sx + 0.12, 2.8, 0), 0x38bdf8, 0.03, 0.72)
    addRayTube(staticGroup, new THREE.Vector3(sx + 0.24, 0, 0), new THREE.Vector3(sx + 0.24, 2.8, 0), 0xf43f5e, 0.03, 0.72)
    registerPulse(pTop, pPlateTop, wlObj.hex, idx * 0.25)
    registerPulse(pPlateTop, pTop, 0xf43f5e, idx * 0.25 + 0.5)

    if (idx === 1) {
      addPhaseMarker(staticGroup, pLensBot, { colorHex: 0x38bdf8 })
      addPhaseMarker(staticGroup, pPlateTop, { colorHex: 0xf43f5e })

      const lBotLbl = createTextSprite('① レンズ下面: 位相ズレなし (自由端)', {
        color: '#7dd3fc',
        borderColor: '#38bdf8',
        fontSize: 26,
        scale: sprScale(0.41)
      })
      lBotLbl.position.set(4.15, 1.55, -1.35)
      staticGroup.add(lBotLbl)
      addDashedLine(staticGroup, pLensBot, lBotLbl.position, 0x38bdf8, 0.72)

      const pTopLbl = createTextSprite('② 平板上面: πズレ / 固定端反射', {
        color: '#fda4af',
        borderColor: '#f43f5e',
        fontSize: 26,
        scale: sprScale(0.41)
      })
      pTopLbl.position.set(3.35, -0.72, 1.75)
      staticGroup.add(pTopLbl)
      addDashedLine(staticGroup, pPlateTop, pTopLbl.position, 0xf43f5e, 0.72)
    }
  })

  // 中心接触暗点マーカー
  addPhaseMarker(staticGroup, new THREE.Vector3(0, 0.02, 0), { colorHex: 0xf43f5e })

  const centerLbl = createTextSprite('中心 r=0: 暗環 (d=0, 位相反転π)', {
    color: '#fda4af',
    borderColor: '#f43f5e',
    fontSize: 28,
    scale: sprScale(0.46)
  })
  centerLbl.position.set(-2.2, -0.75, 2.3)
  staticGroup.add(centerLbl)

  const lensLbl = createTextSprite(`平凸レンズ (曲率半径 R = ${lensRadius.value} m)`, {
    color: '#7dd3fc',
    borderColor: '#38bdf8',
    fontSize: 28,
    scale: sprScale(0.46)
  })
  lensLbl.position.set(0.0, topY + 0.95, -3.95)
  staticGroup.add(lensLbl)
  addDashedLine(staticGroup, new THREE.Vector3(0.0, topY, -2.5), lensLbl.position, 0x38bdf8, 0.68)
}

function rebuildScene() {
  if (!staticGroup || !pulseGroup) return
  clearGroup(staticGroup)
  clearGroup(pulseGroup)
  pulseSegments = []

  if (mode.value === 'film') {
    buildFilmScene()
  } else {
    buildNewtonScene()
  }

  const sphereGeo = new THREE.SphereGeometry(0.085, 12, 12)
  pulseSegments.forEach(seg => {
    const mat = new THREE.MeshBasicMaterial({ color: seg.colorHex })
    seg.meshes = []
    for (let i = 0; i < 3; i++) {
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
      const t = ((simTime * 0.72 + seg.offset + i / seg.meshes.length) % 1 + 1) % 1
      seg.meshes[i].position.lerpVectors(seg.p1, seg.p2, t)
    }
  })
}

watch([mode, wavelength, filmThickness, filmIndex, incidenceAngle, n1, n3, lensRadius, isWhiteLight], () => {
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
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px;
  margin: 20px 0;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.icon {
  font-size: 1.4rem;
}

.sim-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
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

.sim-tabs {
  display: flex;
  gap: 6px;
  background: #1e293b;
  padding: 4px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 5px 12px;
  font-size: 0.84rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #0284c7;
  color: #fff;
}

.camera-preset-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
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
  margin: 0 0 10px 0;
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
  background: #080c16;
  border: 1px solid #334155;
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
  border: 1px solid rgba(56, 189, 248, 0.42);
  color: #7dd3fc;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #334155;
  text-align: center;
}

.stat-card.highlight {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
}

.stat-label {
  font-size: 0.74rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.08rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-unit,
.unit-sm {
  font-size: 0.78rem;
  font-weight: normal;
  color: #94a3b8;
}

.stat-sub {
  font-size: 0.67rem;
  color: #94a3b8;
  margin-top: 3px;
}

.text-blue { color: #38bdf8; }
.text-cyan { color: #22d3ee; }
.text-yellow { color: #fbbf24; }
.text-rose { color: #f43f5e; }

.controls-panel {
  margin-top: 14px;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 14px;
  border-radius: 8px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}

.control-val {
  font-family: monospace;
  color: #38bdf8;
}

.sim-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.ctrl-note {
  font-size: 0.72rem;
  color: #94a3b8;
  line-height: 1.35;
}

.spectral-bar {
  height: 6px;
  border-radius: 999px;
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
  gap: 5px;
}

.mini-chip {
  padding: 3px 8px;
  font-size: 0.72rem;
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

.select-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.mini-select {
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #f8fafc;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
}

.sim-footer-note {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.55;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #38bdf8;
}

@media (max-width: 640px) {
  .sim-container {
    padding: 12px;
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
