<template>
  <div class="lab" style="--ac:#38bdf8;--ac2:#a855f7">
    <div class="lab-head">
      <span class="lab-title">🌊 {{ modeInfo.title }}</span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="lab-badge" style="--ac:#10b981">Three.js 3D Interactive</span>
        <span class="lab-badge">{{ modeInfo.badge }}</span>
      </div>
    </div>

    <div class="lab-tabs">
      <button v-for="m in modes" :key="m.id" :class="['lab-chip', { on: mode === m.id }]" @click="switchMode(m.id)">
        {{ m.label }}
      </button>
    </div>

    <!-- 3D カメラ視点プリセットバー -->
    <div class="camera-preset-bar">
      <span class="preset-label">🎥 カメラ視点:</span>
      <div class="preset-group">
        <button class="lab-chip" :class="{ on: activeCam === '3d' }" @click="setCameraPreset('3d')">
          🎥 3D 俯瞰視点
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'side' }" @click="setCameraPreset('side')">
          📐 正面視点 (断面)
        </button>
        <button class="lab-chip" :class="{ on: activeCam === 'top' }" @click="setCameraPreset('top')">
          🔼 上面視点
        </button>
      </div>
    </div>

    <!-- 再生速度・アニメーションコントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="playing = !playing" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ playing ? '⏸ 一時停止' : '▶ 再生' }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 再生速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.25 }" @click="timeScale = 0.25">🐢 0.25x (超スロー)</button>
          <button :class="{ active: timeScale === 0.5 }" @click="timeScale = 0.5">🎯 0.5x (推奨・観察)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
          <button :class="{ active: timeScale === 1.5 }" @click="timeScale = 1.5">1.5x (速め)</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim(0.05)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.05s)
      </button>
      <button class="lab-btn" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏮ リセット
      </button>
    </div>

    <!-- Three.js 3D ビューポート -->
    <div class="three-viewport-wrap">
      <div ref="threeContainer" class="three-viewport"></div>

      <div class="three-hud-top">
        <div class="three-hud-legend">
          <template v-if="mode === 'standing'">
            <span class="legend-item"><i class="dot-c"></i>変位波形 <b>y(x)</b></span>
            <span class="legend-item"><i class="dot-v"></i>振幅包絡線</span>
            <span class="legend-item"><i class="dot-r"></i>節 <b>N</b>{{ bc !== 'fixed' ? ' (密/疎最大)' : '' }}</span>
            <span class="legend-item"><i class="dot-g"></i>腹 <b>A</b></span>
          </template>
          <template v-else-if="mode === 'superposition'">
            <span class="legend-item"><i class="dot-c"></i>波1 <b>y₁</b></span>
            <span class="legend-item"><i class="dot-r"></i>波2 <b>y₂</b></span>
            <span class="legend-item"><i class="dot-e"></i>合成波 <b>y₁ + y₂</b></span>
            <span class="legend-item"><i class="dot-g"></i>振幅包絡線</span>
          </template>
          <template v-else>
            <span class="legend-item"><i class="dot-r"></i>音源 <b>S</b> (前方: 密/λ′短)</span>
            <span class="legend-item"><i class="dot-v"></i>観測者 <b>O</b></span>
            <span class="legend-item"><i class="dot-c"></i>前方波面 (高音)</span>
            <span class="legend-item"><i class="dot-o"></i>後方波面 (低音/λ″長)</span>
          </template>
        </div>
      </div>

      <div class="three-hud-bottom">
        <div class="three-hud-hint">🖱️ ドラッグで3D回転 ・ ホイールで拡大縮小</div>
      </div>
    </div>

    <div class="mode-status-strip">
      <span class="three-ortho-badge" v-if="mode === 'standing'">
        ✓ {{ media.name }} 第{{ harmonic }}倍振動 (<i>f</i> = {{ fn.toFixed(0) }} Hz, <i>λ</i> = {{ lambdaN.toFixed(3) }} m)
      </span>
      <span class="three-ortho-badge" v-else-if="mode === 'superposition'">
        ✓ {{ superType }}（うなり: {{ Math.abs(f1 - f2).toFixed(1) }} 回/s）
      </span>
      <span class="three-ortho-badge" v-else>
        ✓ 受聴振動数 <i>f</i>′ = {{ fPrime.toFixed(1) }} Hz（音源 <i>f</i>₀ = {{ f0 }} Hz）
      </span>
    </div>

    <!-- 定常波 -->
    <template v-if="mode === 'standing'">
      <div class="lab-controls">
        <div class="lab-ctrl">
          <label>モード番号 n: <strong>{{ n }}</strong>（第{{ harmonic }}倍振動）</label>
          <input type="range" v-model.number="n" min="1" max="5" step="1" />
          <div class="lab-note" v-if="bc === 'closed'">閉管では奇数倍（1, 3, 5, …倍）の振動だけが生じます</div>
        </div>
        <div class="lab-ctrl">
          <label>境界条件（端が節か腹か）</label>
          <div class="lab-row">
            <button :class="['lab-chip', { on: bc === 'fixed' }]" @click="bc = 'fixed'">両端固定の弦</button>
            <button :class="['lab-chip', { on: bc === 'open' }]" @click="bc = 'open'">開管（両端開）</button>
            <button :class="['lab-chip', { on: bc === 'closed' }]" @click="bc = 'closed'">閉管（左開・右閉）</button>
          </div>
        </div>
      </div>
      <div class="lab-stats">
        <div class="lab-stat hl">
          <div class="k">固有振動数 f</div>
          <div class="v">{{ fn.toFixed(0) }} <small>Hz</small></div>
          <div class="f">
            <template v-if="bc === 'closed'">
              f = <span class="frac"><span class="num">(2n − 1)V</span><span class="den">4L</span></span>
            </template>
            <template v-else-if="bc === 'open'">
              f = <span class="frac"><span class="num">nV</span><span class="den">2L</span></span>
            </template>
            <template v-else>
              f = <span class="frac"><span class="num">nv</span><span class="den">2L</span></span>
            </template>
          </div>
        </div>
        <div class="lab-stat">
          <div class="k">波長 λ</div>
          <div class="v">{{ lambdaN.toFixed(3) }} <small>m</small></div>
          <div class="f">λ = <span class="frac"><span class="num">v</span><span class="den">f</span></span></div>
        </div>
        <div class="lab-stat">
          <div class="k">節の数 / 腹の数</div>
          <div class="v">{{ nodes.length }} / {{ antinodes.length }}</div>
          <div class="f">両端を含めて数えた個数</div>
        </div>
        <div class="lab-stat">
          <div class="k">設定値</div>
          <div class="v" style="font-size:0.95rem">L = {{ media.L }} m</div>
          <div class="f">{{ media.vLabel }}</div>
        </div>
      </div>
    </template>

    <!-- 重ね合わせ -->
    <template v-if="mode === 'superposition'">
      <div class="lab-controls">
        <div class="lab-ctrl">
          <label>波1の振動数 f₁: <strong>{{ f1.toFixed(1) }} Hz</strong></label>
          <input type="range" v-model.number="f1" min="0.5" max="3" step="0.1" />
        </div>
        <div class="lab-ctrl">
          <label>波2の振動数 f₂: <strong>{{ f2.toFixed(1) }} Hz</strong></label>
          <input type="range" v-model.number="f2" min="0.5" max="3" step="0.1" />
        </div>
        <div class="lab-ctrl">
          <label>波2の進む向き</label>
          <div class="lab-row">
            <button :class="['lab-chip', { on: dir2 === 1 }]" @click="dir2 = 1">波1と同じ向き →</button>
            <button :class="['lab-chip', { on: dir2 === -1 }]" @click="dir2 = -1">逆向き ←</button>
          </div>
        </div>
        <div class="lab-ctrl">
          <label>波2の初期位相のずれ φ: <strong>{{ phaseDeg }}°</strong></label>
          <input type="range" v-model.number="phaseDeg" min="0" max="360" step="10" />
        </div>
      </div>
      <div class="lab-stats">
        <div class="lab-stat hl">
          <div class="k">合成波の様子</div>
          <div class="v" style="font-size:0.95rem">{{ superType }}</div>
        </div>
        <div class="lab-stat">
          <div class="k">うなりの回数（1秒あたり）</div>
          <div class="v">{{ Math.abs(f1 - f2).toFixed(1) }} <small>回/s</small></div>
          <div class="f">|f₁ − f₂|（同じ向き・同じ場所で観測）</div>
        </div>
        <div class="lab-stat">
          <div class="k">波長 λ₁ / λ₂</div>
          <div class="v" style="font-size:1rem">{{ (vS / f1).toFixed(2) }} / {{ (vS / f2).toFixed(2) }}</div>
          <div class="f">同じ媒質なので速さ共通、λ = <span class="frac"><span class="num">v</span><span class="den">f</span></span></div>
        </div>
      </div>
    </template>

    <!-- ドップラー効果 -->
    <template v-if="mode === 'doppler'">
      <div class="lab-controls">
        <div class="lab-ctrl">
          <label>音源の速度 v<sub>s</sub>: <strong>{{ vs }} m/s</strong></label>
          <input type="range" v-model.number="vs" min="0" max="250" step="5" />
          <div class="lab-note">右向き（音源→観測者の向き）を正</div>
        </div>
        <div class="lab-ctrl">
          <label>観測者の速度 v<sub>o</sub>: <strong>{{ vo }} m/s</strong></label>
          <input type="range" v-model.number="vo" min="-100" max="100" step="5" />
          <div class="lab-note">正 = 音源から遠ざかる向き、負 = 音源へ近づく向き</div>
        </div>
        <div class="lab-ctrl">
          <label>音源の振動数 f₀: <strong>{{ f0 }} Hz</strong></label>
          <input type="range" v-model.number="f0" min="200" max="1000" step="50" />
        </div>
      </div>
      <div class="lab-stats">
        <div class="lab-stat hl">
          <div class="k">観測者が聞く振動数 f′</div>
          <div class="v">{{ fPrime.toFixed(1) }} <small>Hz</small></div>
          <div class="f">f′ = <span class="frac"><span class="num">V − v<sub>o</sub></span><span class="den">V − v<sub>s</sub></span></span> · f₀</div>
        </div>
        <div class="lab-stat">
          <div class="k">音源の前方の波長</div>
          <div class="v">{{ ((V - vs) / f0).toFixed(3) }} <small>m</small></div>
          <div class="f">λ′ = <span class="frac"><span class="num">V − v<sub>s</sub></span><span class="den">f₀</span></span></div>
        </div>
        <div class="lab-stat">
          <div class="k">音源の後方の波長</div>
          <div class="v">{{ ((V + vs) / f0).toFixed(3) }} <small>m</small></div>
          <div class="f">λ″ = <span class="frac"><span class="num">V + v<sub>s</sub></span><span class="den">f₀</span></span></div>
        </div>
        <div class="lab-stat">
          <div class="k">聞こえ方</div>
          <div class="v" :style="{ fontSize: '1rem', color: fPrime > f0 + 0.05 ? '#10b981' : fPrime < f0 - 0.05 ? '#f59e0b' : '#e4e4e7' }">
            {{ fPrime > f0 + 0.05 ? '高く聞こえる' : fPrime < f0 - 0.05 ? '低く聞こえる' : '変化なし' }}
          </div>
          <div class="f">音速 V = 340 m/s（無風）</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { createThreeScene, createVectorArrow3D, createTextSprite } from './threeUtils.js'

const threeContainer = ref(null)
let threeCtx = null
const activeCam = ref('3d')

const playing = ref(true)
const timeScale = ref(0.5)
let t = 0

const modes = [
  { id: 'standing', label: '🎸 定常波（弦・気柱）', title: '3D 定常波：弦と気柱の固有振動', badge: '節・腹・倍振動' },
  { id: 'superposition', label: '〰 波の重ね合わせ', title: '3D 波の重ね合わせの原理', badge: '定常波・うなり・干渉' },
  { id: 'doppler', label: '🔊 ドップラー効果', title: '3D 音のドップラー効果', badge: '波面の間隔と振動数' }
]
const mode = ref('standing')
const modeInfo = computed(() => modes.find((m) => m.id === mode.value))

/* ---------- 定常波 ---------- */
const n = ref(2)
const bc = ref('fixed') // fixed | open | closed
const media = computed(() =>
  bc.value === 'fixed'
    ? { L: 0.65, v: 260, vLabel: '弦を伝わる波の速さ v = 260 m/s', name: '両端固定の弦' }
    : { L: 0.5, v: 340, vLabel: '音速 V = 340 m/s（開口端補正は無視）', name: bc.value === 'open' ? '開管' : '閉管' }
)
const harmonic = computed(() => (bc.value === 'closed' ? 2 * n.value - 1 : n.value))
const fn = computed(() =>
  bc.value === 'closed' ? (harmonic.value * media.value.v) / (4 * media.value.L) : (n.value * media.value.v) / (2 * media.value.L)
)
const lambdaN = computed(() => media.value.v / fn.value)

const nodes = computed(() => {
  const k = n.value
  if (bc.value === 'fixed') return Array.from({ length: k + 1 }, (_, i) => i / k)
  if (bc.value === 'open') return Array.from({ length: k }, (_, i) => (i + 0.5) / k)
  const m = 2 * k - 1
  return Array.from({ length: k }, (_, i) => (2 * i + 1) / m)
})
const antinodes = computed(() => {
  const k = n.value
  if (bc.value === 'fixed') return Array.from({ length: k }, (_, i) => (i + 0.5) / k)
  if (bc.value === 'open') return Array.from({ length: k + 1 }, (_, i) => i / k)
  const m = 2 * k - 1
  return Array.from({ length: k }, (_, i) => (2 * i) / m)
})
function shape(fr) {
  if (bc.value === 'fixed') return Math.sin(n.value * Math.PI * fr)
  if (bc.value === 'open') return Math.cos(n.value * Math.PI * fr)
  return Math.cos(((2 * n.value - 1) * Math.PI * fr) / 2)
}
function shapeDeriv(fr) {
  if (bc.value === 'fixed') return Math.cos(n.value * Math.PI * fr)
  if (bc.value === 'open') return -Math.sin(n.value * Math.PI * fr)
  return -Math.sin(((2 * n.value - 1) * Math.PI * fr) / 2)
}

/* ---------- 重ね合わせ ---------- */
const f1 = ref(1.5)
const f2 = ref(1.5)
const dir2 = ref(-1)
const phaseDeg = ref(0)
const vS = 0.5
const superType = computed(() => {
  const d = Math.abs(f1.value - f2.value)
  if (d < 0.05) {
    if (dir2.value === -1) return '定常波（その場で振動する）'
    const p = ((phaseDeg.value % 360) + 360) % 360
    if (p === 0) return '同位相：強め合い（振幅2倍）'
    if (p === 180) return '逆位相：弱め合い（打ち消し）'
    return '同じ振動数の進行波（振幅は位相差で決まる）'
  }
  if (dir2.value === 1) return `うなり（1回の周期 ${(1 / d).toFixed(2)} s）`
  return '振動数の異なる波の合成'
})

/* ---------- ドップラー ---------- */
const V = 340
const vs = ref(80)
const vo = ref(0)
const f0 = ref(500)
const fPrime = computed(() => ((V - vo.value) / (V - vs.value)) * f0.value)

let srcX = -4.2
let obsX = 4.2
let fronts = []
let lastEmit = -1

function getMobScale() {
  if (!threeContainer.value) return 1.0
  const w = threeContainer.value.clientWidth || 720
  const h = threeContainer.value.clientHeight || 400
  const aspect = w / Math.max(1, h)
  return (w < 540 || aspect < 1.35) ? Math.min(1.85, Math.max(1.32, 1.45 / Math.max(0.68, aspect))) : 1.0
}

function getCamParams(preset) {
  const ms = getMobScale()
  if (preset === 'side') {
    return { pos: [0, 0.15, 48.0 * ms], target: [0, 0.1, 0], fov: 14 }
  }
  if (preset === 'top') {
    return { pos: [0, 48.0 * ms, 0.35], target: [0, 0, 0], fov: 14 }
  }
  return { pos: [0.5 * ms, 5.8 * ms, 13.8 * ms], target: [0, 0.05, 0], fov: 42 }
}

function setCameraPreset(preset, duration = 0.5) {
  activeCam.value = preset
  if (!threeCtx) return
  const { pos, target, fov } = getCamParams(preset)
  threeCtx.moveCameraTo(pos, target, duration, fov)
}

let resizeObs = null
let lastIsMob = false
const labelCache = {}

function updateLabelCached(sprite, key, text, color, borderColor) {
  const sig = `${text}|${color}|${borderColor}`
  if (labelCache[key] === sig) return
  labelCache[key] = sig
  sprite.updateText(text, color, borderColor)
}

// 動的更新可能な3Dチューブメッシュ生成（GCなし）
function createDynamicTube(segments, radialSegs, radius, material) {
  const vertCount = (segments + 1) * (radialSegs + 1)
  const positions = new Float32Array(vertCount * 3)
  const normals = new Float32Array(vertCount * 3)
  const indices = []

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j
      const b = (i + 1) * (radialSegs + 1) + j
      const c = (i + 1) * (radialSegs + 1) + j + 1
      const d = i * (radialSegs + 1) + j + 1
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setIndex(indices)

  const mesh = new THREE.Mesh(geo, material)
  mesh.frustumCulled = false

  function updateFromPoints(pts) {
    const nPts = pts.length
    for (let i = 0; i < nPts; i++) {
      const pPrev = pts[Math.max(0, i - 1)]
      const pNext = pts[Math.min(nPts - 1, i + 1)]
      let tx = pNext.x - pPrev.x
      let ty = pNext.y - pPrev.y
      let tz = pNext.z - pPrev.z
      const tLen = Math.hypot(tx, ty, tz) || 1
      tx /= tLen; ty /= tLen; tz /= tLen

      // XY平面波に対してねじれのないZ基準法線
      let rx = 0, ry = 0, rz = 1
      if (Math.abs(tz) > 0.92) {
        rx = 0; ry = 1; rz = 0
      }
      // N = normalize(T x R)
      let nx = ty * rz - tz * ry
      let ny = tz * rx - tx * rz
      let nz = tx * ry - ty * rx
      const nLen = Math.hypot(nx, ny, nz) || 1
      nx /= nLen; ny /= nLen; nz /= nLen

      // B = N x T
      const bx = ny * tz - nz * ty
      const by = nz * tx - nx * tz
      const bz = nx * ty - ny * tx

      const px = pts[i].x
      const py = pts[i].y
      const pz = pts[i].z

      for (let j = 0; j <= radialSegs; j++) {
        const theta = (j / radialSegs) * Math.PI * 2
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        const vx = c * nx + s * bx
        const vy = c * ny + s * by
        const vz = c * nz + s * bz
        const vIdx = (i * (radialSegs + 1) + j) * 3
        positions[vIdx] = px + radius * vx
        positions[vIdx + 1] = py + radius * vy
        positions[vIdx + 2] = pz + radius * vz
        normals[vIdx] = vx
        normals[vIdx + 1] = vy
        normals[vIdx + 2] = vz
      }
    }
    geo.getAttribute('position').needsUpdate = true
    geo.getAttribute('normal').needsUpdate = true
  }

  return { mesh, updateFromPoints }
}

function reset() {
  t = 0
  srcX = -4.2
  obsX = 4.2
  fronts = []
  lastEmit = -1
  rebuildModeScene()
  updateFrame(0)
}

function switchMode(m) {
  mode.value = m
  reset()
}

function stepSim(delta = 0.05) {
  t += delta
  if (mode.value === 'doppler') stepDoppler3D(delta)
  updateFrame(0)
}

function stepDoppler3D(dt) {
  const scaleV = 3.2 / V
  srcX += vs.value * scaleV * dt
  obsX += vo.value * scaleV * dt
  if (t - lastEmit >= 0.28 || lastEmit < 0) {
    fronts.push({ x: srcX, t })
    lastEmit = t
  }
  fronts = fronts.filter((f) => 3.2 * (t - f.t) < 11.2)
  if (srcX > 3.0 || obsX > 5.6 || obsX < srcX + 0.85) {
    t = 0
    srcX = -4.2
    obsX = 4.2
    fronts = []
    lastEmit = -1
  }
}

let sceneRoot = null
let modeState = null

function clearObject3D(group) {
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    if (child.children && child.children.length > 0) {
      clearObject3D(child)
    }
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
      } else {
        if (child.material.map) child.material.map.dispose()
        child.material.dispose()
      }
    }
  }
}

function initThree() {
  if (!threeContainer.value) return
  const initCam = getCamParams(activeCam.value)
  lastIsMob = getMobScale() > 1.01

  threeCtx = createThreeScene(threeContainer.value, {
    fov: initCam.fov,
    background: 0x080c16,
    initialCamPos: initCam.pos,
    initialTarget: initCam.target,
    onFrame: (dt) => {
      if (playing.value) {
        const simDt = dt * timeScale.value
        t += simDt
        if (mode.value === 'doppler') {
          stepDoppler3D(simDt)
        }
      }
      updateFrame()
    }
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => {
      const nowMob = getMobScale() > 1.01
      if (nowMob !== lastIsMob) {
        lastIsMob = nowMob
        setCameraPreset(activeCam.value, 0)
      }
    })
    resizeObs.observe(threeContainer.value)
  }

  const { scene } = threeCtx
  const grid = new THREE.GridHelper(18, 18, 0x334155, 0x1e293b)
  grid.position.y = -2.65
  scene.add(grid)

  const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: 0x0b1222, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  )
  floorPlane.rotation.x = -Math.PI / 2
  floorPlane.position.y = -2.66
  scene.add(floorPlane)

  sceneRoot = new THREE.Group()
  threeCtx.scene.add(sceneRoot)

  rebuildModeScene()
  updateFrame()
}

function rebuildModeScene() {
  if (!sceneRoot) return
  clearObject3D(sceneRoot)
  for (const k of Object.keys(labelCache)) delete labelCache[k]
  modeState = null

  if (mode.value === 'standing') {
    buildStandingScene()
  } else if (mode.value === 'superposition') {
    buildSuperpositionScene()
  } else {
    buildDopplerScene()
  }
}

function buildBracket3D(x1, x2, y, z, color, tickDir = 1) {
  const grp = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color })
  const len = Math.max(0.05, Math.abs(x2 - x1))
  const bar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.04), mat)
  bar.position.set((x1 + x2) / 2, y, z)
  grp.add(bar)

  const tickGeo = new THREE.BoxGeometry(0.04, 0.24, 0.04)
  const t1 = new THREE.Mesh(tickGeo, mat)
  t1.position.set(x1, y - tickDir * 0.1, z)
  const t2 = new THREE.Mesh(tickGeo, mat)
  t2.position.set(x2, y - tickDir * 0.1, z)
  grp.add(t1, t2)
  return grp
}

function buildStandingScene() {
  const span = 10.0 // x from -5 to +5
  const isPipe = bc.value !== 'fixed'
  const amp = 1.42

  // Lab optical bench base
  const benchGeo = new THREE.BoxGeometry(span + 1.4, 0.18, 2.2)
  const benchMesh = new THREE.Mesh(
    benchGeo,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.35 })
  )
  benchMesh.position.set(0, -2.02, 0)
  sceneRoot.add(benchMesh)
  const benchEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(benchGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
  )
  benchEdges.position.copy(benchMesh.position)
  sceneRoot.add(benchEdges)

  // Center equilibrium axis line
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-span / 2, 0, 0),
    new THREE.Vector3(span / 2, 0, 0)
  ])
  const axisLine = new THREE.Line(
    axisGeo,
    new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.16, gapSize: 0.12 })
  )
  axisLine.computeLineDistances()
  sceneRoot.add(axisLine)

  // Supports or 3D acoustic pipe
  if (isPipe) {
    const pipeGeo = new THREE.CylinderGeometry(1.48, 1.48, span, 36, 1, true)
    pipeGeo.rotateZ(Math.PI / 2)
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.16,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    sceneRoot.add(new THREE.Mesh(pipeGeo, pipeMat))

    const rimGeo = new THREE.TorusGeometry(1.48, 0.055, 14, 48)
    rimGeo.rotateY(Math.PI / 2)
    const openRimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.5
    })
    const leftRim = new THREE.Mesh(rimGeo, openRimMat)
    leftRim.position.x = -span / 2
    sceneRoot.add(leftRim)

    if (bc.value === 'closed') {
      const capGeo = new THREE.CylinderGeometry(1.52, 1.52, 0.22, 36)
      capGeo.rotateZ(Math.PI / 2)
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        metalness: 0.55,
        roughness: 0.25
      })
      const cap = new THREE.Mesh(capGeo, capMat)
      cap.position.x = span / 2 + 0.08
      sceneRoot.add(cap)
    } else {
      const rightRim = new THREE.Mesh(rimGeo, openRimMat)
      rightRim.position.x = span / 2
      sceneRoot.add(rightRim)
    }
  } else {
    const postGeo = new THREE.BoxGeometry(0.34, 3.6, 1.1)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.55, roughness: 0.3 })
    const leftPost = new THREE.Mesh(postGeo, postMat)
    leftPost.position.set(-span / 2 - 0.17, -0.22, 0)
    const rightPost = new THREE.Mesh(postGeo, postMat)
    rightPost.position.set(span / 2 + 0.17, -0.22, 0)
    sceneRoot.add(leftPost, rightPost)

    const postEdgeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.45 })
    const lEdge = new THREE.LineSegments(new THREE.EdgesGeometry(postGeo), postEdgeMat)
    lEdge.position.copy(leftPost.position)
    const rEdge = new THREE.LineSegments(new THREE.EdgesGeometry(postGeo), postEdgeMat)
    rEdge.position.copy(rightPost.position)
    sceneRoot.add(lEdge, rEdge)
  }

  // Translucent standing-wave envelope ribbon + glowing 3D envelope tubes (±A)
  const envSamples = 140
  const envUpPts = []
  const envDownPts = []
  const envSheetPositions = new Float32Array(envSamples * 18)
  for (let i = 0; i <= envSamples; i++) {
    const fr = i / envSamples
    const x = -span / 2 + span * fr
    const y = amp * Math.abs(shape(fr))
    envUpPts.push(new THREE.Vector3(x, y, 0))
    envDownPts.push(new THREE.Vector3(x, -y, 0))

    if (i < envSamples) {
      const frN = (i + 1) / envSamples
      const xN = -span / 2 + span * frN
      const yN = amp * Math.abs(shape(frN))
      const b = i * 18
      envSheetPositions[b] = x; envSheetPositions[b + 1] = y; envSheetPositions[b + 2] = 0
      envSheetPositions[b + 3] = xN; envSheetPositions[b + 4] = yN; envSheetPositions[b + 5] = 0
      envSheetPositions[b + 6] = x; envSheetPositions[b + 7] = -y; envSheetPositions[b + 8] = 0

      envSheetPositions[b + 9] = xN; envSheetPositions[b + 10] = yN; envSheetPositions[b + 11] = 0
      envSheetPositions[b + 12] = xN; envSheetPositions[b + 13] = -yN; envSheetPositions[b + 14] = 0
      envSheetPositions[b + 15] = x; envSheetPositions[b + 16] = -y; envSheetPositions[b + 17] = 0
    }
  }
  const envSheetGeo = new THREE.BufferGeometry()
  envSheetGeo.setAttribute('position', new THREE.BufferAttribute(envSheetPositions, 3))
  const envSheetMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  sceneRoot.add(new THREE.Mesh(envSheetGeo, envSheetMat))

  const envTubeMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.65
  })
  const envUpTube = createDynamicTube(envSamples, 6, 0.022, envTubeMat)
  envUpTube.updateFromPoints(envUpPts)
  const envDownTube = createDynamicTube(envSamples, 6, 0.022, envTubeMat)
  envDownTube.updateFromPoints(envDownPts)
  sceneRoot.add(envUpTube.mesh, envDownTube.mesh)

  // Glowing 3D Displacement Wave Tube
  const waveSamples = 140
  const waveTubeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.15
  })
  const waveTube = createDynamicTube(waveSamples, 10, 0.062, waveTubeMat)
  sceneRoot.add(waveTube.mesh)

  const wavePts = Array.from({ length: waveSamples + 1 }, () => new THREE.Vector3())

  // Medium particles:
  // - If pipe: longitudinal air molecules inside pipe oscillating along X, colored by density (compression=rose, rarefaction=blue)
  // - If string: glowing beads along string oscillating vertically
  const airParticles = []
  const stringBeads = []
  if (isPipe) {
    const numCols = 34
    const rows = [
      { y: -0.78, z: -0.58 },
      { y: 0.78, z: -0.58 },
      { y: -0.78, z: 0.58 },
      { y: 0.78, z: 0.58 }
    ]
    const airGeo = new THREE.SphereGeometry(0.085, 12, 12)
    for (let i = 0; i < numCols; i++) {
      const fr = (i + 0.5) / numCols
      const baseX = -span / 2 + span * fr
      for (const row of rows) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.3,
          roughness: 0.3
        })
        const m = new THREE.Mesh(airGeo, mat)
        m.position.set(baseX, row.y, row.z)
        m.userData = { fr, baseX, baseY: row.y, baseZ: row.z }
        sceneRoot.add(m)
        airParticles.push(m)
      }
    }
  } else {
    const numBeads = 37
    const beadGeo = new THREE.SphereGeometry(0.095, 14, 14)
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      roughness: 0.2
    })
    for (let i = 0; i < numBeads; i++) {
      const fr = i / (numBeads - 1)
      const m = new THREE.Mesh(beadGeo, beadMat)
      m.userData = { fr, baseX: -span / 2 + span * fr }
      sceneRoot.add(m)
      stringBeads.push(m)
    }
  }

  // Node markers (crimson ring + sphere) and Antinode markers (gold sphere)
  const nodeFrs = nodes.value
  const minNodeGap = nodeFrs.length > 1 ? span * Math.abs(nodeFrs[1] - nodeFrs[0]) : span
  nodeFrs.forEach((fr, idx) => {
    const nx = -span / 2 + span * fr
    const nDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.7 })
    )
    nDot.position.set(nx, 0, 0)
    sceneRoot.add(nDot)

    const nRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.032, 10, 24),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.55 })
    )
    nRing.rotation.y = Math.PI / 2
    nRing.position.set(nx, 0, 0)
    sceneRoot.add(nRing)

    // ラベル間引きで n=4..5 でも重なりゼロ
    const showNodeLbl = minNodeGap >= 3.0 || idx === 0 || idx === nodeFrs.length - 1
    if (showNodeLbl) {
      const lblText = isPipe ? '節 (密/疎最大)' : '節 (N)'
      const lbl = createTextSprite(idx === 0 || minNodeGap >= 3.0 ? '節 (N)' : lblText, {
        color: '#fda4af',
        borderColor: '#f43f5e',
        scale: 0.42
      })
      lbl.position.set(nx, -1.68, 0.85)
      sceneRoot.add(lbl)
    }
  })

  const antinodeSpheres = []
  const antinodeFrs = antinodes.value
  const minAntiGap = antinodeFrs.length > 1 ? span * Math.abs(antinodeFrs[1] - antinodeFrs[0]) : span
  antinodeFrs.forEach((fr, idx) => {
    const ax = -span / 2 + span * fr
    const aDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.75 })
    )
    aDot.userData = { fr, ax }
    sceneRoot.add(aDot)
    antinodeSpheres.push(aDot)

    // Faint vertical oscillation track at each antinode
    const vTrackGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, -amp, 0),
      new THREE.Vector3(ax, amp, 0)
    ])
    const vTrack = new THREE.Line(
      vTrackGeo,
      new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.45 })
    )
    vTrack.computeLineDistances()
    sceneRoot.add(vTrack)

    const showAntiLbl = minAntiGap >= 3.0 || idx === 0 || (antinodeFrs.length >= 2 && idx === antinodeFrs.length - 1 && span >= 7)
    if (showAntiLbl) {
      const lbl = createTextSprite('腹 (A)', { color: '#fef08a', borderColor: '#facc15', scale: 0.42 })
      lbl.position.set(ax, 1.85, 0.35)
      sceneRoot.add(lbl)
    }
  })

  // Wavelength λ (or half/quarter wavelength) bracket cleanly above
  let brFr1 = 0
  let brFr2 = 1
  let brText = `λ = ${lambdaN.value.toFixed(2)} m`
  if (bc.value === 'closed') {
    const m = 2 * n.value - 1
    if (m >= 4) {
      brFr1 = 0
      brFr2 = 4 / m
      brText = `λ = ${lambdaN.value.toFixed(2)} m`
    } else if (m === 3) {
      brFr1 = 0
      brFr2 = 2 / 3
      brText = `λ/2 = ${(lambdaN.value / 2).toFixed(2)} m`
    } else {
      brFr1 = 0
      brFr2 = 1
      brText = `L = λ/4 (λ = ${lambdaN.value.toFixed(2)} m)`
    }
  } else {
    if (n.value >= 2) {
      brFr1 = 0
      brFr2 = 2 / n.value
      brText = `λ = ${lambdaN.value.toFixed(2)} m`
    } else {
      brFr1 = 0
      brFr2 = 1
      brText = `L = λ/2 (λ = ${lambdaN.value.toFixed(2)} m)`
    }
  }
  const bx1 = -span / 2 + span * brFr1
  const bx2 = -span / 2 + span * brFr2
  sceneRoot.add(buildBracket3D(bx1, bx2, 2.38, 0, 0x38bdf8, 1))
  const lamLbl = createTextSprite(brText, { color: '#7dd3fc', borderColor: '#38bdf8', scale: 0.42 })
  lamLbl.position.set((bx1 + bx2) / 2, 2.7, 0)
  sceneRoot.add(lamLbl)

  modeState = {
    type: 'standing',
    span,
    amp,
    isPipe,
    waveTube,
    wavePts,
    waveSamples,
    airParticles,
    stringBeads,
    antinodeSpheres
  }
}

function buildSuperpositionScene() {
  const span = 10.4
  const zPositions = [-2.3, 0, 2.3]
  const yCenters = [1.85, 0.2, -1.55]
  const colors = [0x38bdf8, 0xf43f5e, 0x10b981]
  const hexCss = ['#7dd3fc', '#fda4af', '#6ee7b7']
  const bdrCss = ['#38bdf8', '#f43f5e', '#10b981']
  const names = [
    'y₁ (波1: 右進行 →)',
    `y₂ (波2: ${dir2.value > 0 ? '右進行 →' : '左進行 ←'})`,
    'y = y₁ + y₂ (合成波)'
  ]

  const samples = 140
  const sphereCount = 29
  const sphereGeo = new THREE.SphereGeometry(0.085, 14, 14)

  const waveTubes = []
  const wavePtsArr = []
  const sphereChains = []

  for (let r = 0; r < 3; r++) {
    const z = zPositions[r]
    const yC = yCenters[r]

    // Sleek lane track platform & center baseline
    const railGeo = new THREE.BoxGeometry(span, 0.035, 0.52)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      transparent: true,
      opacity: 0.85
    })
    const rail = new THREE.Mesh(railGeo, railMat)
    rail.position.set(0, yC, z)
    sceneRoot.add(rail)

    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-span / 2, yC, z),
      new THREE.Vector3(span / 2, yC, z)
    ])
    sceneRoot.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x475569 })))

    const tMat = new THREE.MeshStandardMaterial({
      color: colors[r],
      emissive: colors[r],
      emissiveIntensity: r === 2 ? 0.65 : 0.45,
      roughness: 0.22
    })
    const tube = createDynamicTube(samples, 8, r === 2 ? 0.058 : 0.044, tMat)
    sceneRoot.add(tube.mesh)
    waveTubes.push({ tube, z, yC })
    wavePtsArr.push(Array.from({ length: samples + 1 }, () => new THREE.Vector3()))

    const chain = []
    const sMat = new THREE.MeshStandardMaterial({
      color: colors[r],
      emissive: colors[r],
      emissiveIntensity: 0.5,
      roughness: 0.22
    })
    for (let i = 0; i < sphereCount; i++) {
      const m = new THREE.Mesh(sphereGeo, sMat)
      const xf = i / (sphereCount - 1)
      m.position.set(-span / 2 + span * xf, yC, z)
      m.userData = { xf, yC }
      sceneRoot.add(m)
      chain.push(m)
    }
    sphereChains.push(chain)

    const lbl = createTextSprite(names[r], { color: hexCss[r], borderColor: bdrCss[r], scale: 0.44 })
    lbl.position.set(-3.4, yC + (r === 2 ? 1.18 : 0.82), z)
    sceneRoot.add(lbl)

    if (r < 2) {
      const dirVal = r === 0 ? 1 : dir2.value
      const dirArrow = createVectorArrow3D({ color: colors[r], shaftRadius: 0.04, headRadius: 0.12, headLength: 0.3 })
      dirArrow.setVector(
        new THREE.Vector3(dirVal > 0 ? 3.2 : 4.5, yC + 0.78, z),
        new THREE.Vector3(dirVal, 0, 0),
        1.25
      )
      sceneRoot.add(dirArrow)
    }
  }

  // Beat / standing envelope tubes around resultant wave (lane 2)
  const envTubeMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.7
  })
  const supEnvUp = createDynamicTube(samples, 6, 0.02, envTubeMat)
  const supEnvDn = createDynamicTube(samples, 6, 0.02, envTubeMat)
  sceneRoot.add(supEnvUp.mesh, supEnvDn.mesh)
  const envUpPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())
  const envDnPts = Array.from({ length: samples + 1 }, () => new THREE.Vector3())

  // Superposition vertical guide connector at x = 0
  const connGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, yCenters[0], zPositions[0]),
    new THREE.Vector3(0, yCenters[1], zPositions[1]),
    new THREE.Vector3(0, yCenters[2], zPositions[2])
  ])
  const connLine = new THREE.Line(
    connGeo,
    new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.65 })
  )
  connLine.computeLineDistances()
  sceneRoot.add(connLine)

  modeState = {
    type: 'superposition',
    span,
    samples,
    waveTubes,
    wavePtsArr,
    sphereChains,
    supEnvUp,
    supEnvDn,
    envUpPts,
    envDnPts,
    zPositions,
    yCenters,
    connGeo
  }
}

function buildDopplerScene() {
  // Ground optical/acoustic track
  const trackGeo = new THREE.BoxGeometry(11.6, 0.14, 2.0)
  const track = new THREE.Mesh(
    trackGeo,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.45, roughness: 0.35 })
  )
  track.position.set(0, -0.52, 0)
  sceneRoot.add(track)
  const trackEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(trackGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
  )
  trackEdge.position.copy(track.position)
  sceneRoot.add(trackEdge)

  // Source S (glowing siren sphere + pulsing core)
  const srcMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.65, roughness: 0.2 })
  )
  // Observer O (receiver pod)
  const obsMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.65, roughness: 0.2 })
  )
  sceneRoot.add(srcMesh, obsMesh)

  const srcLbl = createTextSprite('音源 S', { color: '#fda4af', borderColor: '#f43f5e', scale: 0.46 })
  const obsLbl = createTextSprite('観測者 O', { color: '#e9d5ff', borderColor: '#a855f7', scale: 0.46 })
  const fPrimeLbl = createTextSprite(`受聴振動数 f' = ${fPrime.value.toFixed(1)} Hz`, {
    color: '#6ee7b7',
    borderColor: '#10b981',
    scale: 0.5
  })
  fPrimeLbl.position.set(0, 2.35, 0)
  sceneRoot.add(srcLbl, obsLbl, fPrimeLbl)

  const srcArrow = createVectorArrow3D({ color: 0xf43f5e, shaftRadius: 0.05, headRadius: 0.14, headLength: 0.34 })
  const obsArrow = createVectorArrow3D({ color: 0xa855f7, shaftRadius: 0.05, headRadius: 0.14, headLength: 0.34 })
  sceneRoot.add(srcArrow, obsArrow)

  // Pre-allocated wavefront ring pool (horizontal XZ + vertical XY dual ring so visible in both Top and Front views!)
  const poolSize = 42
  const ringPool = []
  const ringGeoXZ = new THREE.TorusGeometry(1.0, 0.018, 8, 56)
  ringGeoXZ.rotateX(Math.PI / 2)
  const arcGeoRight = new THREE.TorusGeometry(1.0, 0.016, 8, 32, Math.PI)
  arcGeoRight.rotateZ(-Math.PI / 2) // right hemisphere (+x)
  const arcGeoLeft = new THREE.TorusGeometry(1.0, 0.016, 8, 32, Math.PI)
  arcGeoLeft.rotateZ(Math.PI / 2) // left hemisphere (-x)

  for (let i = 0; i < poolSize; i++) {
    const grp = new THREE.Group()
    const matXZ = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 })
    const matR = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
    const matL = new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.55 })

    const rXZ = new THREE.Mesh(ringGeoXZ, matXZ)
    const rRight = new THREE.Mesh(arcGeoRight, matR)
    const rLeft = new THREE.Mesh(arcGeoLeft, matL)
    grp.add(rXZ, rRight, rLeft)
    grp.visible = false
    sceneRoot.add(grp)
    ringPool.push({ grp, matXZ, matR, matL })
  }

  modeState = {
    type: 'doppler',
    srcMesh,
    obsMesh,
    srcLbl,
    obsLbl,
    fPrimeLbl,
    srcArrow,
    obsArrow,
    ringPool
  }
}

const tmpColor = new THREE.Color()

function updateFrame() {
  if (!modeState) return

  if (modeState.type === 'standing') {
    const { span, amp, isPipe, waveTube, wavePts, waveSamples, airParticles, stringBeads, antinodeSpheres } = modeState
    const ph = Math.cos(2 * Math.PI * 0.45 * harmonic.value * t)

    for (let i = 0; i <= waveSamples; i++) {
      const fr = i / waveSamples
      wavePts[i].set(-span / 2 + span * fr, amp * shape(fr) * ph, 0)
    }
    waveTube.updateFromPoints(wavePts)

    if (isPipe) {
      for (const p of airParticles) {
        const { fr, baseX, baseY, baseZ } = p.userData
        const disp = shape(fr) * ph
        p.position.set(baseX + disp * 0.36, baseY, baseZ)

        // Compression proxy = -d(disp)/dx
        const comp = -shapeDeriv(fr) * ph
        if (comp > 0.12) {
          tmpColor.setHex(0xf43f5e) // 密 (圧縮)
          p.material.color.lerp(tmpColor, 0.8)
          p.material.emissive.setHex(0xe11d48)
          p.material.emissiveIntensity = 0.25 + 0.65 * Math.min(1, comp)
        } else if (comp < -0.12) {
          tmpColor.setHex(0x38bdf8) // 疎 (希薄)
          p.material.color.lerp(tmpColor, 0.8)
          p.material.emissive.setHex(0x0284c7)
          p.material.emissiveIntensity = 0.2 + 0.5 * Math.min(1, -comp)
        } else {
          p.material.color.setHex(0x94a3b8)
          p.material.emissive.setHex(0x475569)
          p.material.emissiveIntensity = 0.2
        }
      }
    } else {
      for (const b of stringBeads) {
        const fr = b.userData.fr
        b.position.set(b.userData.baseX, amp * shape(fr) * ph, 0)
      }
    }

    for (const a of antinodeSpheres) {
      a.position.set(a.userData.ax, amp * shape(a.userData.fr) * ph, 0)
    }
  } else if (modeState.type === 'superposition') {
    const {
      span,
      samples,
      waveTubes,
      wavePtsArr,
      sphereChains,
      supEnvUp,
      supEnvDn,
      envUpPts,
      envDnPts,
      zPositions,
      yCenters,
      connGeo
    } = modeState

    const phi = (phaseDeg.value * Math.PI) / 180
    const amp = 0.58

    for (let r = 0; r < 3; r++) {
      const { tube, z, yC } = waveTubes[r]
      const pts = wavePtsArr[r]
      for (let i = 0; i <= samples; i++) {
        const xf = i / samples
        const y1 = Math.sin(2 * Math.PI * f1.value * (t - xf / vS))
        const y2 = Math.sin(2 * Math.PI * f2.value * (t - (dir2.value * xf) / vS) + phi)
        const val = r === 0 ? y1 : r === 1 ? y2 : y1 + y2
        pts[i].set(-span / 2 + span * xf, yC + val * amp, z)
      }
      tube.updateFromPoints(pts)

      const chain = sphereChains[r]
      for (const m of chain) {
        const xf = m.userData.xf
        const y1 = Math.sin(2 * Math.PI * f1.value * (t - xf / vS))
        const y2 = Math.sin(2 * Math.PI * f2.value * (t - (dir2.value * xf) / vS) + phi)
        const val = r === 0 ? y1 : r === 1 ? y2 : y1 + y2
        m.position.y = yC + val * amp
      }
    }

    // Envelope for resultant wave (both standing wave spatial envelope and beat temporal envelope)
    const isStanding = dir2.value === -1 && Math.abs(f1.value - f2.value) < 0.05
    const showEnv = isStanding || dir2.value === 1
    supEnvUp.mesh.visible = showEnv
    supEnvDn.mesh.visible = showEnv
    if (showEnv) {
      const yC2 = yCenters[2]
      const z2 = zPositions[2]
      for (let i = 0; i <= samples; i++) {
        const xf = i / samples
        const x = -span / 2 + span * xf
        let envVal = 2 * amp
        if (isStanding) {
          envVal = 2 * amp * Math.abs(Math.cos(Math.PI * ((f1.value + f2.value) * (xf / vS)) - phi / 2))
        } else {
          const halfDiff = (f1.value - f2.value) / 2
          envVal = 2 * amp * Math.abs(Math.cos(2 * Math.PI * halfDiff * (t - xf / vS) - phi / 2))
        }
        envUpPts[i].set(x, yC2 + envVal, z2)
        envDnPts[i].set(x, yC2 - envVal, z2)
      }
      supEnvUp.updateFromPoints(envUpPts)
      supEnvDn.updateFromPoints(envDnPts)
    }

    // Update vertical superposition probe connector at x = 0 (xf = 0.5)
    const y1Mid = Math.sin(2 * Math.PI * f1.value * (t - 0.5 / vS))
    const y2Mid = Math.sin(2 * Math.PI * f2.value * (t - (dir2.value * 0.5) / vS) + phi)
    const cArr = connGeo.getAttribute('position').array
    cArr[0] = 0; cArr[1] = yCenters[0] + y1Mid * amp; cArr[2] = zPositions[0]
    cArr[3] = 0; cArr[4] = yCenters[1] + y2Mid * amp; cArr[5] = zPositions[1]
    cArr[6] = 0; cArr[7] = yCenters[2] + (y1Mid + y2Mid) * amp; cArr[8] = zPositions[2]
    connGeo.getAttribute('position').needsUpdate = true
  } else if (modeState.type === 'doppler') {
    const { srcMesh, obsMesh, srcLbl, obsLbl, fPrimeLbl, srcArrow, obsArrow, ringPool } = modeState
    srcMesh.position.set(srcX, 0, 0)
    obsMesh.position.set(obsX, 0, 0)

    // 音源ラベルを下側、観測者ラベルを上側に逃がして接近時も非衝突
    srcLbl.position.set(srcX, -1.05, 0.55)
    obsLbl.position.set(obsX, 1.12, 0.55)
    updateLabelCached(fPrimeLbl, 'fPrime', `受聴振動数 f' = ${fPrime.value.toFixed(1)} Hz`, '#6ee7b7', '#10b981')

    if (vs.value > 0) {
      srcArrow.setVector(new THREE.Vector3(srcX, 0.48, 0), new THREE.Vector3(1, 0, 0), Math.max(0.55, vs.value / 115))
    } else {
      srcArrow.visible = false
    }

    if (Math.abs(vo.value) > 0) {
      obsArrow.setVector(
        new THREE.Vector3(obsX, 0.48, 0),
        new THREE.Vector3(Math.sign(vo.value), 0, 0),
        Math.max(0.55, Math.abs(vo.value) / 65)
      )
    } else {
      obsArrow.visible = false
    }

    for (let i = 0; i < ringPool.length; i++) {
      const slot = ringPool[i]
      if (i < fronts.length) {
        const f = fronts[i]
        const r = Math.max(0.08, 3.2 * (t - f.t))
        const opacity = Math.max(0.1, 0.85 - r / 11.5)
        slot.grp.visible = true
        slot.grp.position.set(f.x, 0, 0)
        slot.grp.scale.setScalar(r)
        slot.matXZ.opacity = opacity
        slot.matR.opacity = opacity * 0.9
        slot.matL.opacity = vs.value > 10 ? opacity * 0.75 : opacity * 0.9
        slot.matL.color.setHex(vs.value > 10 ? 0xfb923c : 0x38bdf8)
      } else {
        slot.grp.visible = false
      }
    }
  }
}

watch([n, bc, dir2], () => {
  rebuildModeScene()
  updateFrame()
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
.lab {
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}
.camera-preset-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  margin-bottom: 0.6rem;
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
.playback-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 10px !important;
  padding: 5px 10px !important;
}
.speed-btn-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap !important;
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
  height: 410px;
  background: #080c16;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow: hidden;
  margin: 0.75rem 0;
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
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 5;
}
.three-hud-legend {
  max-width: calc(100% - 24px);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(9, 13, 22, 0.85);
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
.dot-c { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
.dot-v { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
.dot-r { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.dot-g { background: #facc15; box-shadow: 0 0 6px #facc15; }
.dot-e { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-o { background: #fb923c; box-shadow: 0 0 6px #fb923c; }
.three-hud-bottom {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  pointer-events: none;
  z-index: 5;
}
.three-hud-hint {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.73rem;
  color: #cbd5e1;
  pointer-events: none;
}
.mode-status-strip {
  display: flex;
  justify-content: flex-end;
  margin: -0.25rem 0 0.85rem 0;
}
.three-ortho-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
  font-size: 0.76rem;
  font-weight: 700;
  max-width: 100%;
  box-sizing: border-box;
}
@media (max-width: 640px) {
  .three-viewport-wrap {
    height: 330px;
  }
  .three-hud-legend,
  .three-ortho-badge,
  .three-hud-hint {
    font-size: 0.68rem;
    padding: 3px 8px;
  }
  .speed-control-group {
    border-radius: 10px !important;
    flex-wrap: wrap !important;
    width: 100%;
  }
  .speed-btn-group {
    flex-wrap: wrap !important;
  }
  .mode-status-strip {
    justify-content: flex-start;
  }
}
</style>
