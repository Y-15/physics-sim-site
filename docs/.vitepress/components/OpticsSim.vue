<template>
  <div class="lab" style="--ac:#10b981;--ac2:#38bdf8">
    <div class="lab-head">
      <span class="lab-title">🔍 3D 光の屈折・全反射とレンズの結像 実験室</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ mode === 'refract' ? 'スネルの法則と全反射' : '凸レンズ・凹レンズの写像' }}</span>
      </div>
    </div>

    <!-- モード切替タブ -->
    <div class="optics-mode-bar">
      <button class="lab-btn" :class="{ primary: mode === 'refract' }" @click="switchMode('refract')">
        🌊 スネルの法則と全反射 (屈折・臨界角)
      </button>
      <button class="lab-btn" :class="{ primary: mode === 'lens' }" @click="switchMode('lens')">
        👓 凸レンズ・凹レンズの結像 (写像公式)
      </button>
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

      <div v-if="mode === 'lens'" class="three-hud-legend">
        <span class="legend-item"><i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>平行光線</span>
        <span class="legend-item"><i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>中心光線</span>
        <span class="legend-item"><i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>焦点光線 / 実像</span>
        <span class="legend-item"><i style="background:#a78bfa;box-shadow:0 0 6px #a78bfa"></i>虚像 / 延長破線</span>
      </div>
      <div v-else class="three-hud-legend">
        <span class="legend-item"><i style="background:#fbbf24;box-shadow:0 0 6px #fbbf24"></i>入射光</span>
        <span class="legend-item"><i style="background:#f43f5e;box-shadow:0 0 6px #f43f5e"></i>反射光</span>
        <span class="legend-item"><i style="background:#10b981;box-shadow:0 0 6px #10b981"></i>屈折光</span>
        <span class="legend-item"><i style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i>境界面・法線</span>
      </div>

      <div class="three-hud-hint">
        🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小
      </div>
    </div>

    <!-- 光学ステータスバッジ (ビューポート外に配置し3Dラベルとの重なりを完全防止) -->
    <div class="ortho-status-strip">
      <span
        class="three-ortho-badge"
        :class="statusBadgeTone"
      >
        {{ statusBadgeText }}
      </span>
    </div>

    <!-- 屈折モードの操作 -->
    <div v-if="mode === 'refract'" class="lab-controls">
      <div class="lab-ctrl">
        <label>入射角 θ₁: <strong>{{ incAngleDeg.toFixed(1) }}°</strong></label>
        <input type="range" v-model.number="incAngleDeg" min="0" max="85" step="1" />
      </div>

      <div class="lab-ctrl">
        <label>媒質1の屈折率 n₁ (入射側): <strong>{{ n1.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="n1" min="1.0" max="2.4" step="0.05" />
        <div class="lab-note">1.00: 空気, 1.33: 水, 1.50: ガラス, 2.42: ダイヤ</div>
      </div>

      <div class="lab-ctrl">
        <label>媒質2の屈折率 n₂ (透過側): <strong>{{ n2.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="n2" min="1.0" max="2.4" step="0.05" />
      </div>

      <div class="lab-ctrl">
        <label>プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" @click="n1 = 1.0; n2 = 1.5; incAngleDeg = 45">空気 → ガラス (屈折角小)</button>
          <button class="lab-chip" @click="n1 = 1.5; n2 = 1.0; incAngleDeg = 50">ガラス → 空気 (全反射！)</button>
          <button class="lab-chip" @click="n1 = 1.33; n2 = 1.0; incAngleDeg = 40">水 → 空気 (臨界角48.8°)</button>
        </div>
      </div>
    </div>

    <!-- レンズモードの操作 -->
    <div v-else class="lab-controls">
      <div class="lab-ctrl">
        <label>物体の位置 a (レンズからの距離): <strong>{{ objDistA.toFixed(1) }} cm</strong></label>
        <input type="range" v-model.number="objDistA" min="10" max="80" step="2" />
        <div class="lab-note">焦点 f の前後で実像（倒立）と虚像（正立）が切り替わります</div>
      </div>

      <div class="lab-ctrl">
        <label>焦点距離 f: <strong>{{ (isConvex ? focalF : -focalF).toFixed(0) }} cm</strong></label>
        <input type="range" v-model.number="focalF" min="15" max="45" step="5" />
      </div>

      <div class="lab-ctrl">
        <label>レンズの種類</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: isConvex }" @click="isConvex = true">凸レンズ (f &gt; 0: 集光)</button>
          <button class="lab-chip" :class="{ on: !isConvex }" @click="isConvex = false">凹レンズ (f &lt; 0: 発散)</button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>物体の高さ h: <strong>{{ objHeight.toFixed(1) }} cm</strong></label>
        <input type="range" v-model.number="objHeight" min="10" max="40" step="2" />
      </div>
    </div>

    <!-- 屈折モードのステータス -->
    <div v-if="mode === 'refract'" class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">屈折角 θ₂</div>
        <div class="v" :style="{ color: isTotalReflection ? '#ec4899' : '#10b981' }">
          {{ isTotalReflection ? '⚠️ 全反射！' : refrAngleDeg.toFixed(1) + '°' }}
        </div>
        <div class="f">n₁ sinθ₁ = n₂ sinθ₂</div>
      </div>

      <div class="lab-stat">
        <div class="k">臨界角 θ_c</div>
        <div class="v" style="color:#f59e0b">{{ criticalAngleText }}</div>
        <div class="f">sinθ_c = <span class="frac"><span class="num">n₂</span><span class="den">n₁</span></span> (n₁ &gt; n₂ のときのみ存在)</div>
      </div>

      <div class="lab-stat">
        <div class="k">相対屈折率 ₁n₂</div>
        <div class="v" style="color:#38bdf8">{{ (n2 / n1).toFixed(3) }}</div>
        <div class="f">₁n₂ = <span class="frac"><span class="num">n₂</span><span class="den">n₁</span></span> = <span class="frac"><span class="num">v₁</span><span class="den">v₂</span></span> = <span class="frac"><span class="num">λ₁</span><span class="den">λ₂</span></span></div>
      </div>

      <div class="lab-stat">
        <div class="k">波長の変化比 λ₂ / λ₁</div>
        <div class="v" style="color:#a855f7">{{ (n1 / n2).toFixed(3) }}</div>
        <div class="f">屈折率が大きい媒質ほど波長が縮む</div>
      </div>
    </div>

    <!-- レンズモードのステータス -->
    <div v-else class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">像の種類と位置 b</div>
        <div class="v" :style="{ color: imageInfo.isReal ? '#10b981' : '#c084fc' }">
          {{ imageInfo.text }}
        </div>
        <div class="f"><span class="frac"><span class="num">1</span><span class="den">a</span></span> + <span class="frac"><span class="num">1</span><span class="den">b</span></span> = <span class="frac"><span class="num">1</span><span class="den">f</span></span> より計算</div>
      </div>

      <div class="lab-stat">
        <div class="k">像の倍率 m</div>
        <div class="v" style="color:#38bdf8">{{ imageInfo.b >= 9000 ? '∞' : Math.abs(imageInfo.m).toFixed(2) }} <small v-if="imageInfo.b < 9000">倍</small></div>
        <div class="f">m = <span class="frac"><span class="num">|b|</span><span class="den">a</span></span></div>
      </div>

      <div class="lab-stat">
        <div class="k">像の向き</div>
        <div class="v" style="color:#ec4899">{{ imageInfo.b >= 9000 ? '平行光線（像なし）' : (imageInfo.isReal ? '倒立（上下逆さま）' : '正立（同じ向き）') }}</div>
        <div class="f">{{ imageInfo.b >= 9000 ? '焦点から出た光は無限遠へ' : (imageInfo.isReal ? 'スクリーンに映る実像' : '肉眼で覗いて見える虚像（虫眼鏡）') }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">焦点の条件</div>
        <div class="v" style="color:#a855f7">{{ !isConvex ? 'f < 0（常に縮小虚像）' : (Math.abs(objDistA - focalF) < 0.2 ? 'a = f（平行光線・像なし）' : (objDistA > focalF ? 'a > f（実像）' : 'a < f（虚像）')) }}</div>
        <div class="f">a = 2f のとき等倍（m = 1.0）</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const mode = ref('lens')
const activeCam = ref('3d')
const isPlaying = ref(true)
const timeScale = ref(1.0)

// 屈折モードパラメータ
const incAngleDeg = ref(45)
const n1 = ref(1.0)
const n2 = ref(1.5)

const incRad = computed(() => (incAngleDeg.value * Math.PI) / 180)

// 全反射判定
const isTotalReflection = computed(() => {
  if (n1.value <= n2.value) return false
  const sinCrit = n2.value / n1.value
  return Math.sin(incRad.value) >= sinCrit
})

// 屈折角
const refrAngleDeg = computed(() => {
  if (isTotalReflection.value) return 90
  const sinR = (n1.value * Math.sin(incRad.value)) / n2.value
  const clamped = Math.max(-1, Math.min(1, sinR))
  return (Math.asin(clamped) * 180) / Math.PI
})

// 臨界角テキスト
const criticalAngleText = computed(() => {
  if (n1.value <= n2.value) return 'なし (全反射しない)'
  const sinCrit = n2.value / n1.value
  const deg = (Math.asin(sinCrit) * 180) / Math.PI
  return `${deg.toFixed(1)}°`
})

// レンズモードパラメータ
const objDistA = ref(40) // cm
const focalF = ref(20) // cm
const isConvex = ref(true) // true: 凸, false: 凹
const objHeight = ref(20) // cm

// 写像公式: 1/a + 1/b = 1/f => b = a*f / (a - f)
const imageInfo = computed(() => {
  const f = isConvex.value ? focalF.value : -focalF.value
  const a = objDistA.value

  if (Math.abs(a - f) < 0.2) {
    return { b: 9999, m: 9999, isReal: false, text: '無限遠 (平行光線・像なし)' }
  }

  const b = (a * f) / (a - f)
  const m = -b / a // 正立なら m > 0, 倒立なら m < 0
  const isReal = b > 0

  const signText = isReal ? `b = +${b.toFixed(1)} cm (実像)` : `b = ${b.toFixed(1)} cm (虚像)`
  return { b, m, isReal, text: signText }
})

const statusBadgeText = computed(() => {
  if (mode.value === 'refract') {
    if (isTotalReflection.value) {
      return `⚡ 全反射中 (θ₁ = ${incAngleDeg.value.toFixed(0)}° ≥ θ_c = ${criticalAngleText.value}) ｜ 境界面で100%反射`
    }
    if (n1.value > n2.value) {
      return `✓ 密→疎の屈折 (θ₂ = ${refrAngleDeg.value.toFixed(1)}° > θ₁) ｜ 臨界角 θ_c = ${criticalAngleText.value}`
    }
    return `✓ 疎→密の屈折 (θ₂ = ${refrAngleDeg.value.toFixed(1)}° < θ₁) ｜ 光速・波長が 1/n に縮小`
  }
  if (!isConvex.value) {
    return `✓ 凹レンズ (f = -${focalF.value} cm)：常に縮小・正立虚像 (紫半透明) ｜ 虚延長破線で結像`
  }
  if (Math.abs(objDistA.value - focalF.value) < 0.2) {
    return `⚠ a = f (${focalF.value} cm)：射出光線が平行となり像を結ばない（無限遠）`
  }
  if (objDistA.value > focalF.value) {
    const scaleStr = Math.abs(objDistA.value - 2 * focalF.value) < 0.2 ? '等倍' : (objDistA.value > 2 * focalF.value ? '縮小' : '拡大')
    return `✓ 凸レンズ (a > f)：スクリーンに映る${scaleStr}・倒立実像 (b = +${imageInfo.value.b.toFixed(1)} cm)`
  }
  return `✓ 凸レンズ (a < f・虫眼鏡)：拡大・正立虚像 (紫半透明・m = ${Math.abs(imageInfo.value.m).toFixed(2)}倍)`
})

const statusBadgeTone = computed(() => {
  if (mode.value === 'refract') {
    return isTotalReflection.value ? 'tone-warn' : 'tone-real'
  }
  if (isConvex.value && Math.abs(objDistA.value - focalF.value) < 0.2) return 'tone-warn'
  return imageInfo.value.isReal ? 'tone-real' : 'tone-virtual'
})

const threeContainer = ref(null)
let threeCtx = null
let staticGroup = null
let pulseGroup = null
let pulseSegments = []
let animPhase = 0
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

function switchMode(newMode) {
  mode.value = newMode
  setCameraPreset('3d', 0.4)
  rebuildScene()
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const s = getMobileScale()
  const targetY = mode.value === 'lens' ? -0.15 : 0.0
  if (preset === '3d') {
    threeCtx.moveCameraTo([5.2 * s, 4.4 * s, 13.8 * s], [0, targetY, 0], duration, 42)
  } else if (preset === 'side') {
    threeCtx.moveCameraTo([0, targetY + 0.15, 45.0 * s], [0, targetY, 0], duration, 14)
  } else if (preset === 'top') {
    threeCtx.moveCameraTo([0, 45.0 * s, 0.08], [0, 0, 0], duration, 14)
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

// 3D 光線（実光線: 発光チューブ + 方向円錐矢印 / 虚光線: 3D 破線シリンダー列）
function addRayTube(parent, p1, p2, colorHex, opts = {}) {
  const {
    radius = 0.044,
    opacity = 1.0,
    dashed = false,
    arrowAt = null, // 0..1 の位置に矢印円錐を配置
    arrowSize = 0.14
  } = opts
  const dist = p1.distanceTo(p2)
  if (dist < 0.04) return

  if (dashed) {
    // WebGL 1px 制限を避けるため、3D 小シリンダー破線を生成してくっきり表示
    const dashLen = 0.22
    const gapLen = 0.16
    const step = dashLen + gapLen
    const dir = p2.clone().sub(p1).normalize()
    const numDashes = Math.max(1, Math.floor((dist + gapLen * 0.5) / step))
    const dashGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, 1, 8)
    const dashMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.48,
      transparent: opacity < 0.99,
      opacity
    })
    const up = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir)
    for (let i = 0; i < numDashes; i++) {
      const startD = i * step
      const lenD = Math.min(dashLen, dist - startD)
      if (lenD < 0.05) break
      const m = new THREE.Mesh(dashGeo, dashMat)
      m.position.copy(p1).addScaledVector(dir, startD + lenD * 0.5)
      m.quaternion.copy(q)
      m.scale.set(1, lenD, 1)
      m.renderOrder = 2
      parent.add(m)
    }
    return
  }

  const curve = new THREE.LineCurve3(p1, p2)
  const geo = new THREE.TubeGeometry(curve, 12, radius, 10, false)
  const isTransparent = opacity < 0.99
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.58,
    roughness: 0.18,
    transparent: isTransparent,
    opacity
  })
  const tubeMesh = new THREE.Mesh(geo, mat)
  tubeMesh.renderOrder = 2
  parent.add(tubeMesh)

  if (arrowAt !== null && dist > 0.45) {
    const dir = p2.clone().sub(p1).normalize()
    const coneGeo = new THREE.ConeGeometry(arrowSize, arrowSize * 2.3, 12)
    const coneMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.75,
      roughness: 0.15
    })
    const cone = new THREE.Mesh(coneGeo, coneMat)
    cone.position.lerpVectors(p1, p2, arrowAt)
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    cone.renderOrder = 3
    parent.add(cone)
  }
}

function registerPulseSegment(p1, p2, colorHex, speed = 1.0) {
  if (p1.distanceTo(p2) < 0.1) return
  pulseSegments.push({ p1: p1.clone(), p2: p2.clone(), colorHex, speed })
}

function clipRayEndToBounds(origin, dir, maxDist = 14, minX = -7.0, maxX = 7.0, minY = -2.85, maxY = 2.95) {
  let tMax = maxDist
  if (Math.abs(dir.x) > 1e-6) {
    const tx = dir.x > 0 ? (maxX - origin.x) / dir.x : (minX - origin.x) / dir.x
    if (tx > 0) tMax = Math.min(tMax, tx)
  }
  if (Math.abs(dir.y) > 1e-6) {
    const ty = dir.y > 0 ? (maxY - origin.y) / dir.y : (minY - origin.y) / dir.y
    if (ty > 0) tMax = Math.min(tMax, ty)
  }
  return origin.clone().addScaledVector(dir, Math.max(0.05, tMax))
}

function buildLensScene() {
  const s = 0.082 // 水平スケール: 1 cm = 0.082 Three.js units (80cm = 6.56 units)
  const sh = 0.056 // 鉛直スケール: 最大 h=40cm でも 2.24 < lensRadius に収まり、虚像拡大も視認しやすい
  const floorY = -3.15
  const railTopY = floorY + 0.24
  const lensRadius = 2.40

  // 1. 3D 光学ベンチ床グリッド & 光沢金属光学レール
  const grid = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a)
  grid.position.set(0, floorY - 0.02, 0)
  staticGroup.add(grid)

  const railGeo = new THREE.BoxGeometry(14.8, 0.24, 0.96)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.78,
    roughness: 0.28
  })
  const railMesh = new THREE.Mesh(railGeo, railMat)
  railMesh.position.set(0, floorY + 0.12, 0)
  staticGroup.add(railMesh)

  // 光沢レールサイドトリムライン
  const trimGeo = new THREE.BoxGeometry(14.8, 0.04, 0.05)
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    metalness: 0.8
  })
  const trimF = new THREE.Mesh(trimGeo, trimMat)
  trimF.position.set(0, railTopY + 0.01, 0.47)
  const trimB = new THREE.Mesh(trimGeo, trimMat)
  trimB.position.set(0, railTopY + 0.01, -0.47)
  staticGroup.add(trimF, trimB)

  // レール上 cm 目盛り (10cm刻み)
  for (let cm = -70; cm <= 70; cm += 10) {
    const tx = cm * s
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(cm === 0 ? 0.06 : 0.025, 0.02, 0.82),
      new THREE.MeshBasicMaterial({ color: cm === 0 ? 0x38bdf8 : 0x475569 })
    )
    tick.position.set(tx, railTopY + 0.015, 0)
    staticGroup.add(tick)
  }

  // 光軸 (y = 0, z = 0)
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-7.3, 0, 0),
    new THREE.Vector3(7.3, 0, 0)
  ])
  staticGroup.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.72 })))

  // 2. 彫刻された 3D 半透明ガラスレンズ (x = 0) - 焦点距離に応じて曲率も変化！
  const curvePower = 45 / Math.max(15, focalF.value) // 1.0 (f=45) ~ 3.0 (f=15)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.22,
    roughness: 0.08,
    metalness: 0.14,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  const lathePts = []
  const steps = 24
  if (isConvex.value) {
    const centerHalf = 0.22 + 0.09 * curvePower
    const edgeHalf = 0.05
    for (let i = 0; i <= steps; i++) {
      const r = (i / steps) * lensRadius
      const t = 1 - Math.pow(r / lensRadius, 2)
      const halfW = edgeHalf + (centerHalf - edgeHalf) * t
      lathePts.push(new THREE.Vector2(r, halfW))
    }
    for (let i = steps; i >= 0; i--) {
      const r = (i / steps) * lensRadius
      const t = 1 - Math.pow(r / lensRadius, 2)
      const halfW = edgeHalf + (centerHalf - edgeHalf) * t
      lathePts.push(new THREE.Vector2(r, -halfW))
    }
  } else {
    const centerHalf = 0.08
    const edgeHalf = 0.24 + 0.10 * curvePower
    for (let i = 0; i <= steps; i++) {
      const r = (i / steps) * lensRadius
      const t = Math.pow(r / lensRadius, 2)
      const halfW = centerHalf + (edgeHalf - centerHalf) * t
      lathePts.push(new THREE.Vector2(r, halfW))
    }
    for (let i = steps; i >= 0; i--) {
      const r = (i / steps) * lensRadius
      const t = Math.pow(r / lensRadius, 2)
      const halfW = centerHalf + (edgeHalf - centerHalf) * t
      lathePts.push(new THREE.Vector2(r, -halfW))
    }
  }
  const lensGeo = new THREE.LatheGeometry(lathePts, 44)
  lensGeo.rotateZ(Math.PI / 2)
  staticGroup.add(new THREE.Mesh(lensGeo, glassMat))

  // レンズ外周金属リング + 支柱 + 台座
  const rimGeo = new THREE.TorusGeometry(lensRadius, 0.065, 16, 48)
  rimGeo.rotateY(Math.PI / 2)
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.42,
    metalness: 0.72,
    roughness: 0.2
  })
  staticGroup.add(new THREE.Mesh(rimGeo, rimMat))

  const pillarLen = Math.abs(railTopY) - lensRadius + 0.06
  const pillarMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, pillarLen, 16),
    railMat
  )
  pillarMesh.position.set(0, railTopY + pillarLen / 2, 0)
  staticGroup.add(pillarMesh)

  const lensStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 1.06),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.3 })
  )
  lensStand.position.set(0, railTopY + 0.08, 0)
  staticGroup.add(lensStand)

  const narrow = isNarrowViewport()
  const lensLabel = createTextSprite(
    narrow
      ? (isConvex.value ? `凸レンズ f=+${focalF.value}` : `凹レンズ f=-${focalF.value}`)
      : (isConvex.value ? `凸レンズ (f = +${focalF.value} cm)` : `凹レンズ (f = -${focalF.value} cm)`),
    { color: '#7dd3fc', borderColor: '#38bdf8', fontSize: 34, scale: getSpriteScale(0.54) }
  )
  lensLabel.position.set(0, lensRadius + (narrow ? 0.72 : 0.56), -1.45)
  staticGroup.add(lensLabel)

  // 3. 焦点 F, F', 2F, 2F' の3Dマーカー（z=+0.55 で真上視点でも非干渉）
  const fU = focalF.value * s
  const markerData = [
    { x: -fU, label: 'F', color: 0xf59e0b, textCol: '#fde68a', isPrimary: true },
    { x: fU, label: "F'", color: 0xf59e0b, textCol: '#fde68a', isPrimary: true },
    { x: -2 * fU, label: '2F', color: 0x94a3b8, textCol: '#cbd5e1', isPrimary: false },
    { x: 2 * fU, label: "2F'", color: 0x94a3b8, textCol: '#cbd5e1', isPrimary: false }
  ]

  markerData.forEach(mk => {
    if (Math.abs(mk.x) > 7.1) return
    const dotGeo = new THREE.SphereGeometry(mk.isPrimary ? 0.13 : 0.095, 16, 16)
    const dotMat = new THREE.MeshStandardMaterial({
      color: mk.color,
      emissive: mk.color,
      emissiveIntensity: 0.6
    })
    const dotMesh = new THREE.Mesh(dotGeo, dotMat)
    dotMesh.position.set(mk.x, 0, 0)
    staticGroup.add(dotMesh)

    // 光軸からレールへ降ろす微細ガイド線
    const dropMat = new THREE.LineBasicMaterial({ color: mk.color, transparent: true, opacity: 0.22 })
    staticGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(mk.x, 0, 0),
          new THREE.Vector3(mk.x, railTopY, 0)
        ]),
        dropMat
      )
    )

    const sp = createTextSprite(mk.label, {
      color: mk.textCol,
      borderColor: mk.isPrimary ? '#f59e0b' : 'rgba(148,163,184,0.45)',
      fontSize: 32,
      scale: getSpriteScale(mk.isPrimary ? 0.44 : 0.40)
    })
    sp.position.set(mk.x, narrow ? -0.58 : -0.46, 0.92)
    staticGroup.add(sp)
  })

  // 4. 3D 発光物体矢印 & ベンチ台座 (ローズ #f43f5e)
  const objX = -objDistA.value * s
  const objH = objHeight.value * sh
  const objArrow = createVectorArrow3D({
    color: 0xf43f5e,
    shaftRadius: 0.085,
    headRadius: 0.22,
    headLength: 0.42
  })
  objArrow.setVector(new THREE.Vector3(objX, 0, 0), new THREE.Vector3(0, 1, 0), objH)
  staticGroup.add(objArrow)

  // 物体台座と支柱
  const objStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.14, 0.98),
    new THREE.MeshStandardMaterial({ color: 0x9f1239, metalness: 0.5, roughness: 0.35 })
  )
  objStand.position.set(objX, railTopY + 0.07, 0)
  staticGroup.add(objStand)
  const objPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, Math.abs(railTopY), 10),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
  )
  objPost.position.set(objX, railTopY / 2, 0)
  staticGroup.add(objPost)

  // 5. 3本の代表3D光線と像計算
  const tipPos = new THREE.Vector3(objX, objH, 0)
  const b = imageInfo.value.b
  const m = imageInfo.value.m
  const isReal = imageInfo.value.isReal
  const isAtFocus = isConvex.value && Math.abs(objDistA.value - focalF.value) < 0.2
  const hasFiniteImage = !isAtFocus && Math.abs(b) < 2200

  const rawImgX = b * s
  const rawImgY = objH * m // 実像: m < 0 (倒立), 虚像: m > 0 (正立)
  const imgTip = new THREE.Vector3(rawImgX, rawImgY, 0)
  const imageFitsBench = hasFiniteImage && Math.abs(rawImgX) <= 6.95 && Math.abs(rawImgY) <= 3.65

  // 物体ラベル（凹レンズ/虚像で物体近くに虚像が来る場合は左＆奥に少し逃がして衝突回避）
  const virtualCloseToObj = hasFiniteImage && !isReal && Math.abs(rawImgX - objX) < 1.55
  const objLbl = createTextSprite(
    narrow ? `物体 a=${objDistA.value}` : `物体 (a=${objDistA.value}cm)`,
    {
      color: '#fda4af',
      borderColor: '#f43f5e',
      fontSize: 32,
      scale: getSpriteScale(0.50)
    }
  )
  objLbl.position.set(
    virtualCloseToObj && rawImgX > objX ? objX - 0.52 : objX,
    objH + (narrow ? 0.68 : 0.50),
    -0.92
  )
  staticGroup.add(objLbl)

  // 光線① (ゴールド #fbbf24): 光軸平行 -> レンズ屈折 -> F' (凸) / Fから発散 (凹)
  const lensHitParallel = new THREE.Vector3(0, Math.min(lensRadius * 0.94, objH), 0)
  addRayTube(staticGroup, tipPos, lensHitParallel, 0xfbbf24, { radius: 0.044, arrowAt: 0.52, arrowSize: 0.13 })
  registerPulseSegment(tipPos, lensHitParallel, 0xfbbf24, 1.0)

  if (isConvex.value) {
    const dir1 = new THREE.Vector3(fU, -lensHitParallel.y, 0).normalize()
    const end1 = clipRayEndToBounds(lensHitParallel, dir1, 14)
    addRayTube(staticGroup, lensHitParallel, end1, 0xfbbf24, { radius: 0.044, arrowAt: 0.55, arrowSize: 0.13 })
    registerPulseSegment(lensHitParallel, end1, 0xfbbf24, 1.0)

    if (!isReal && hasFiniteImage) {
      // 虚像への逆延長破線 (#a78bfa)
      const dirBack1 = dir1.clone().negate()
      const backEnd1 = clipRayEndToBounds(lensHitParallel, dirBack1, lensHitParallel.distanceTo(imgTip))
      addRayTube(staticGroup, lensHitParallel, backEnd1, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
    }
  } else {
    const focusFront = new THREE.Vector3(-fU, 0, 0)
    const dir1 = lensHitParallel.clone().sub(focusFront).normalize()
    const end1 = clipRayEndToBounds(lensHitParallel, dir1, 14)
    addRayTube(staticGroup, lensHitParallel, end1, 0xfbbf24, { radius: 0.044, arrowAt: 0.55, arrowSize: 0.13 })
    registerPulseSegment(lensHitParallel, end1, 0xfbbf24, 1.0)
    // 前方焦点への虚延長破線 (#a78bfa)
    addRayTube(staticGroup, lensHitParallel, focusFront, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
  }

  // 光線② (スカイシアン #38bdf8): レンズ中心 O(0,0,0) を直進
  const lensCenter = new THREE.Vector3(0, 0, 0)
  const dirCenter = lensCenter.clone().sub(tipPos).normalize()
  const endCenter = clipRayEndToBounds(lensCenter, dirCenter, 14)
  addRayTube(staticGroup, tipPos, lensCenter, 0x38bdf8, { radius: 0.044, arrowAt: 0.5, arrowSize: 0.13 })
  addRayTube(staticGroup, lensCenter, endCenter, 0x38bdf8, { radius: 0.044, arrowAt: 0.55, arrowSize: 0.13 })
  registerPulseSegment(tipPos, lensCenter, 0x38bdf8, 1.0)
  registerPulseSegment(lensCenter, endCenter, 0x38bdf8, 1.0)

  if (!isReal && hasFiniteImage && rawImgX < objX) {
    const backEnd2 = clipRayEndToBounds(tipPos, dirCenter.clone().negate(), tipPos.distanceTo(imgTip))
    addRayTube(staticGroup, tipPos, backEnd2, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
  }

  // 光線③ (エメラルド #10b981): 焦点 F を通る/目指す光線 -> レンズ後に光軸平行
  if (!isAtFocus && hasFiniteImage && Math.abs(rawImgY) <= lensRadius * 0.96) {
    const lensHitFocal = new THREE.Vector3(0, rawImgY, 0)
    addRayTube(staticGroup, tipPos, lensHitFocal, 0x10b981, { radius: 0.042, arrowAt: 0.52, arrowSize: 0.125 })
    registerPulseSegment(tipPos, lensHitFocal, 0x10b981, 1.0)

    const endParallel = new THREE.Vector3(6.95, rawImgY, 0)
    addRayTube(staticGroup, lensHitFocal, endParallel, 0x10b981, { radius: 0.042, arrowAt: 0.55, arrowSize: 0.125 })
    registerPulseSegment(lensHitFocal, endParallel, 0x10b981, 1.0)

    if (!isReal) {
      const backEnd3 = clipRayEndToBounds(lensHitFocal, new THREE.Vector3(-1, 0, 0), Math.abs(rawImgX))
      addRayTube(staticGroup, lensHitFocal, backEnd3, 0xa78bfa, { radius: 0.04, opacity: 0.85, dashed: true })
    }
  }

  // 6. 3D 像矢印とラベル (実像: 固体エメラルド #10b981 / 虚像: 半透明バイオレット #a855f7 + 虚像ラベル)
  if (isAtFocus) {
    const infLbl = createTextSprite(narrow ? '平行光線 (a=f)' : '平行光線（a = f：像なし）', {
      color: '#fde68a',
      borderColor: '#f59e0b',
      fontSize: 32,
      scale: getSpriteScale(0.50)
    })
    infLbl.position.set(4.2, -1.75, 0.35)
    staticGroup.add(infLbl)
  } else if (imageFitsBench) {
    const imgColor = isReal ? 0x10b981 : 0xa855f7
    const imgArrow = createVectorArrow3D({
      color: imgColor,
      shaftRadius: 0.08,
      headRadius: 0.21,
      headLength: 0.42,
      opacity: isReal ? 1.0 : 0.62
    })
    const imgDir = rawImgY >= 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0)
    imgArrow.setVector(new THREE.Vector3(rawImgX, 0, 0), imgDir, Math.abs(rawImgY))
    staticGroup.add(imgArrow)

    // 交点グロー球（虚像の収束点を明瞭にハイライト）
    const tipDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 14),
      new THREE.MeshBasicMaterial({ color: isReal ? 0x34d399 : 0xc084fc })
    )
    tipDot.position.copy(imgTip)
    staticGroup.add(tipDot)

    // 実像位置に半透明スクリーン板を表示（スクリーンに映る物理的意味を視覚化）
    if (isReal) {
      const scrH = Math.max(2.2, Math.abs(rawImgY) + 0.9)
      const scrGeo = new THREE.PlaneGeometry(scrH * 0.85, scrH)
      const scrMesh = new THREE.Mesh(
        scrGeo,
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.11,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      )
      scrMesh.rotation.y = Math.PI / 2
      scrMesh.position.set(rawImgX + 0.05, rawImgY / 2, 0)
      scrMesh.renderOrder = 1
      staticGroup.add(scrMesh)

      const scrEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(scrGeo),
        new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.55, depthWrite: false })
      )
      scrEdge.rotation.y = Math.PI / 2
      scrEdge.position.copy(scrMesh.position)
      scrEdge.renderOrder = 1
      staticGroup.add(scrEdge)
    }

    const imgLabel = createTextSprite(
      isReal ? `実像 (m=${Math.abs(m).toFixed(2)})` : `虚像 (m=${Math.abs(m).toFixed(2)})`,
      {
        color: isReal ? '#6ee7b7' : '#e9d5ff',
        borderColor: isReal ? '#10b981' : '#c084fc',
        fontSize: 32,
        scale: getSpriteScale(0.50)
      }
    )

    let lx = rawImgX
    let ly = rawImgY >= 0 ? rawImgY + (narrow ? 0.65 : 0.52) : rawImgY - (narrow ? 0.72 : 0.52)
    let lz = -0.92

    // 衝突回避: F / F' / 2F / 2F' や 物体ラベル・レンズタイトル との全視点重複防止
    if (rawImgY < 0) {
      const nearFocalMarker = [fU, 2 * fU].some(mx => Math.abs(lx - mx) < 1.35)
      const minNegY = narrow ? -1.72 : -1.22
      if (nearFocalMarker && ly > minNegY) {
        ly = minNegY
      }
      if (Math.abs(lx - objX) < 1.2 && ly > -1.0) {
        ly = narrow ? -1.72 : -1.35
      }
    } else {
      if (!isReal && isConvex.value && rawImgX < objX) {
        // 凸レンズ a < f: 拡大虚像ラベルを物体＆レンズタイトル (0, lensRadius+0.56) から十分離す
        if (Math.abs(lx) < 3.6 && ly > lensRadius - 0.35) {
          lx = Math.max(-5.6, rawImgX - 0.98)
          ly = Math.min(3.35, rawImgY + 0.36)
        }
        lz = -0.92
      } else if (virtualCloseToObj && Math.abs(ly - (objH + 0.50)) < 0.85) {
        if (rawImgX > objX) {
          // 凹レンズ: 物体と近接した縮小虚像ラベルを独立Z・下側レーンへ配置
          ly = narrow ? -1.42 : -1.18
          lx = Math.min(-0.65, rawImgX)
          lz = -1.65
        }
      } else if (!isReal && Math.abs(rawImgX - objX) < 1.8) {
        lz = -1.65
      }
    }
    imgLabel.position.set(lx, ly, lz)
    staticGroup.add(imgLabel)
  } else if (hasFiniteImage) {
    // 像がベンチ範囲外へ拡大した場合も、範囲外指示ラベルをベンチ内に配置
    const clampedX = Math.max(-5.2, Math.min(5.2, rawImgX))
    const edgeLbl = createTextSprite(
      isReal
        ? `→ 実像 (b=+${b.toFixed(0)}cm, m=${Math.abs(m).toFixed(1)}倍)`
        : `← 虚像 (b=${b.toFixed(0)}cm, m=${Math.abs(m).toFixed(1)}倍)`,
      {
        color: isReal ? '#6ee7b7' : '#e9d5ff',
        borderColor: isReal ? '#10b981' : '#c084fc',
        fontSize: 30,
        scale: getSpriteScale(0.48)
      }
    )
    edgeLbl.position.set(clampedX, isReal ? -2.2 : 2.35, 0.45)
    staticGroup.add(edgeLbl)
  }
}

function buildRefractScene() {
  const rayLen = 4.4
  const floorY = -3.15
  const narrow = isNarrowViewport()

  const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a)
  grid.position.set(0, floorY, 0)
  staticGroup.add(grid)

  // 1. 媒質1 (上層 y > 0) と 媒質2 (下層 y < 0) の3D半透明光学ブロック + 輪郭線 (depthWrite: false で内部光線を絶対遮蔽しない)
  const blockGeo = new THREE.BoxGeometry(10.8, 2.95, 4.2)
  const mat1 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.08 + (n1.value - 1.0) * 0.11,
    depthWrite: false,
    roughness: 0.15
  })
  const mesh1 = new THREE.Mesh(blockGeo, mat1)
  mesh1.position.set(0, 1.49, 0)
  mesh1.renderOrder = 0
  staticGroup.add(mesh1)
  const edge1 = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, depthWrite: false })
  )
  edge1.position.copy(mesh1.position)
  edge1.renderOrder = 0
  staticGroup.add(edge1)

  const mat2 = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.12 + (n2.value - 1.0) * 0.13,
    depthWrite: false,
    roughness: 0.15
  })
  const mesh2 = new THREE.Mesh(blockGeo, mat2)
  mesh2.position.set(0, -1.49, 0)
  mesh2.renderOrder = 0
  staticGroup.add(mesh2)
  const edge2 = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockGeo),
    new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.28, depthWrite: false })
  )
  edge2.position.copy(mesh2.position)
  edge2.renderOrder = 0
  staticGroup.add(edge2)

  // 境界面 (y = 0) のグリッドプレート
  const borderGrid = new THREE.GridHelper(10.8, 12, 0x38bdf8, 0x334155)
  borderGrid.scale.z = 4.2 / 10.8
  borderGrid.renderOrder = 0
  staticGroup.add(borderGrid)

  // 法線 (x = 0, y ∈ [-3.0, 3.0])
  addRayTube(
    staticGroup,
    new THREE.Vector3(0, -3.0, 0),
    new THREE.Vector3(0, 3.0, 0),
    0x94a3b8,
    { radius: 0.025, opacity: 0.72, dashed: true }
  )

  const lblMed1 = createTextSprite(
    narrow ? `n₁=${n1.value.toFixed(2)}` : `媒質1 (n₁ = ${n1.value.toFixed(2)})`,
    {
      color: '#7dd3fc',
      borderColor: '#38bdf8',
      fontSize: 32,
      scale: getSpriteScale(0.50)
    }
  )
  lblMed1.position.set(-4.35, 2.65, -1.75)
  staticGroup.add(lblMed1)

  const lblMed2 = createTextSprite(
    narrow ? `n₂=${n2.value.toFixed(2)}` : `媒質2 (n₂ = ${n2.value.toFixed(2)})`,
    {
      color: '#6ee7b7',
      borderColor: '#10b981',
      fontSize: 32,
      scale: getSpriteScale(0.50)
    }
  )
  lblMed2.position.set(-4.15, -2.45, 1.65)
  staticGroup.add(lblMed2)

  // 臨界角ガイド線 (n1 > n2 のみ)
  if (n1.value > n2.value) {
    const critRad = Math.asin(n2.value / n1.value)
    const critStart = new THREE.Vector3(-3.4 * Math.sin(critRad), 3.4 * Math.cos(critRad), 0)
    addRayTube(staticGroup, critStart, new THREE.Vector3(0, 0, 0), 0xf472b6, {
      radius: 0.022,
      opacity: 0.55,
      dashed: true
    })
  }

  // 2. 入射光線 (左上 -> 原点)
  const rad1 = incRad.value
  const origin = new THREE.Vector3(0, 0, 0)
  const inStart = new THREE.Vector3(-rayLen * Math.sin(rad1), rayLen * Math.cos(rad1), 0)
  addRayTube(staticGroup, inStart, origin, 0xfbbf24, { radius: 0.056, opacity: 1.0, arrowAt: 0.55, arrowSize: 0.16 })
  registerPulseSegment(inStart, origin, 0xfbbf24, 1.2 / n1.value)

  // 入射角 θ1 の円弧
  if (rad1 > 0.04) {
    const arcPts1 = []
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * rad1
      arcPts1.push(new THREE.Vector3(-1.15 * Math.sin(a), 1.15 * Math.cos(a), 0.02))
    }
    const arcCurve1 = new THREE.CatmullRomCurve3(arcPts1)
    const arcMesh1 = new THREE.Mesh(
      new THREE.TubeGeometry(arcCurve1, 16, 0.024, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    )
    arcMesh1.renderOrder = 2
    staticGroup.add(arcMesh1)
  }

  const lblIn = createTextSprite(`入射光 θ₁=${incAngleDeg.value.toFixed(0)}°`, {
    color: '#fde68a',
    borderColor: '#fbbf24',
    fontSize: 30,
    scale: getSpriteScale(0.48)
  })
  lblIn.position.set(
    Math.min(-1.25, inStart.x * 0.42 - 0.72),
    Math.min(2.15, Math.max(0.75, inStart.y * 0.42)),
    -0.55
  )
  staticGroup.add(lblIn)

  // 3. 反射光線 (原点 -> 右上)
  const refEnd = new THREE.Vector3(rayLen * Math.sin(rad1), rayLen * Math.cos(rad1), 0)
  const refOpacity = isTotalReflection.value ? 1.0 : 0.62
  const refRadius = isTotalReflection.value ? 0.056 : 0.036
  addRayTube(staticGroup, origin, refEnd, 0xf43f5e, {
    radius: refRadius,
    opacity: refOpacity,
    arrowAt: 0.58,
    arrowSize: isTotalReflection.value ? 0.16 : 0.12
  })
  if (isTotalReflection.value) {
    registerPulseSegment(origin, refEnd, 0xf43f5e, 1.2 / n1.value)
  }

  const lblRef = createTextSprite(
    isTotalReflection.value ? '⚡ 全反射 (100%)' : '一部反射光',
    {
      color: '#fda4af',
      borderColor: '#f43f5e',
      fontSize: 30,
      scale: getSpriteScale(0.48)
    }
  )
  lblRef.position.set(
    Math.max(1.35, refEnd.x * 0.55 + 0.85),
    Math.min(2.55, Math.max(0.85, refEnd.y * 0.55 + 0.30)),
    0.35
  )
  staticGroup.add(lblRef)

  // 4. 屈折光線 (原点 -> 右下)
  if (!isTotalReflection.value) {
    const rad2 = (refrAngleDeg.value * Math.PI) / 180
    const outEnd = new THREE.Vector3(rayLen * Math.sin(rad2), -rayLen * Math.cos(rad2), 0)
    addRayTube(staticGroup, origin, outEnd, 0x10b981, { radius: 0.058, opacity: 1.0, arrowAt: 0.58, arrowSize: 0.16 })
    registerPulseSegment(origin, outEnd, 0x10b981, 1.2 / n2.value)

    if (rad2 > 0.04) {
      const arcPts2 = []
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * rad2
        arcPts2.push(new THREE.Vector3(1.15 * Math.sin(a), -1.15 * Math.cos(a), 0.02))
      }
      const arcCurve2 = new THREE.CatmullRomCurve3(arcPts2)
      const arcMesh2 = new THREE.Mesh(
        new THREE.TubeGeometry(arcCurve2, 16, 0.024, 8, false),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      )
      arcMesh2.renderOrder = 2
      staticGroup.add(arcMesh2)
    }

    const lblOut = createTextSprite(`屈折光 θ₂=${refrAngleDeg.value.toFixed(1)}°`, {
      color: '#6ee7b7',
      borderColor: '#10b981',
      fontSize: 30,
      scale: getSpriteScale(0.48)
    })
    lblOut.position.set(
      Math.max(1.45, outEnd.x * 0.55 + 0.90),
      Math.max(-2.55, Math.min(-0.85, outEnd.y * 0.55 - 0.30)),
      1.35
    )
    staticGroup.add(lblOut)
  } else {
    const warnLabel = createTextSprite('⚡ 臨界角超過：全反射中！', {
      color: '#fbcfe8',
      borderColor: '#ec4899',
      fontSize: 32,
      scale: getSpriteScale(0.54)
    })
    warnLabel.position.set(2.35, -1.45, 0.85)
    staticGroup.add(warnLabel)
  }
}

function rebuildScene() {
  if (!staticGroup || !pulseGroup) return
  clearGroup(staticGroup)
  clearGroup(pulseGroup)
  pulseSegments = []

  if (mode.value === 'lens') {
    buildLensScene()
  } else {
    buildRefractScene()
  }

  // 各光線セグメントに3個ずつ光子パルス球を生成
  const sphereGeo = new THREE.SphereGeometry(0.088, 12, 12)
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
  if (isPlaying.value) {
    animPhase += dt * 0.65 * timeScale.value
  }
  pulseSegments.forEach(seg => {
    if (!seg.meshes) return
    for (let i = 0; i < seg.meshes.length; i++) {
      const t = ((animPhase * seg.speed + i / seg.meshes.length) % 1 + 1) % 1
      seg.meshes[i].position.lerpVectors(seg.p1, seg.p2, t)
    }
  })
}

watch([mode, incAngleDeg, n1, n2, objDistA, focalF, isConvex, objHeight], () => {
  rebuildScene()
})

onMounted(() => {
  if (!threeContainer.value) return
  threeCtx = createThreeScene(threeContainer.value, {
    fov: 42,
    initialCamPos: [5.2, 4.4, 13.8],
    initialTarget: [0, -0.15, 0],
    onFrame: (dt) => {
      const curAspect = threeCtx?.camera?.aspect || 1.7
      if (Math.abs(curAspect - lastCamAspect) > 0.16) {
        lastCamAspect = curAspect
        setCameraPreset(activeCam.value, 0)
        rebuildScene()
      }
      updatePulses(dt)
    }
  })
  staticGroup = new THREE.Group()
  pulseGroup = new THREE.Group()
  threeCtx.scene.add(staticGroup)
  threeCtx.scene.add(pulseGroup)
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
.optics-mode-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  margin-bottom: 0.55rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

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
  height: 430px;
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
  font-size: 0.75rem;
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
  margin: -0.25rem 0 0.85rem 0;
}

.three-ortho-badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  max-width: 100%;
}

.three-ortho-badge.tone-real {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}

.three-ortho-badge.tone-virtual {
  background: rgba(168, 85, 247, 0.18);
  border: 1px solid rgba(192, 132, 252, 0.5);
  color: #e9d5ff;
}

.three-ortho-badge.tone-warn {
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fde68a;
}

@media (max-width: 768px) {
  .three-viewport-wrap {
    height: 345px;
  }
  .three-hud-legend {
    right: 10px;
    gap: 8px;
    font-size: 0.69rem;
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
