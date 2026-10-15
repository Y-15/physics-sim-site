<template>
  <div class="inertia-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>🚀 慣性力・見かけの重力・遠心力シミュレーター</h3>
        <span class="badge">Inertial Forces &amp; Frames</span>
      </div>
      <p class="desc">
        「静止系（外からの観察）」と「非慣性系（乗っている人からの観察）」の視点を切り替え、見かけの力 <i>f</i> = -ma の本質やエレベーター内の無重量状態、回転円盤上の遠心力を視覚的に体感できます。
      </p>
    </div>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'cart' }" @click="mode = 'cart'">
        ① 加速する台車とつり革 (振り子)
      </button>
      <button :class="{ active: mode === 'elevator' }" @click="mode = 'elevator'">
        ② エレベーターと体重計 (見かけの重力・無重量)
      </button>
      <button :class="{ active: mode === 'centrifugal' }" @click="mode = 'centrifugal'">
        ③ 回転円盤と遠心力 (滑り出し)
      </button>
    </div>

    <!-- 視点切り替えトグル (台車・エレベーター共通) -->
    <div class="frame-toggle-row">
      <span class="frame-label">観察者の視点：</span>
      <div class="toggle-buttons">
        <button
          :class="{ active: observerFrame === 'inside' }"
          @click="observerFrame = 'inside'"
        >
          👤 内部の観測者（非慣性系：慣性力 -ma を受けてつり合う）
        </button>
        <button
          :class="{ active: observerFrame === 'outside' }"
          @click="observerFrame = 'outside'"
        >
          🌍 地上の観測者（慣性系：合力によって加速度 <i>a</i> で加速中）
        </button>
      </div>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <!-- モード1: 台車 -->
      <div v-if="mode === 'cart'" class="controls-grid">
        <div class="control-group">
          <label>台車の加速度 <i>a</i>: <strong>{{ fmt(cartA, 1) }} <i>m</i>/<i>s</i>²</strong></label>
          <input type="range" v-model.number="cartA" min="-9.8" max="9.8" step="0.2" />
        </div>
        <div class="control-group">
          <label>おもりの質量 <i>m</i>: <strong>{{ cartM }} kg</strong></label>
          <input type="range" v-model.number="cartM" min="0.5" max="5.0" step="0.5" />
        </div>
        <div class="control-group">
          <label>重力加速度 <i>g</i>: <strong>9.8 <i>m</i>/<i>s</i>²</strong></label>
          <span class="sub-info">傾き角 tanθ = <i>a</i>/<i>g</i></span>
        </div>
      </div>

      <!-- モード2: エレベーター -->
      <div v-if="mode === 'elevator'" class="controls-grid">
        <div class="control-group">
          <label>鉛直加速度 <i>a</i> (上向き正): <strong>{{ fmt(elevA, 1) }} <i>m</i>/<i>s</i>²</strong></label>
          <input type="range" v-model.number="elevA" min="-9.8" max="9.8" step="0.2" />
        </div>
        <div class="control-group">
          <label>人の質量 <i>m</i>: <strong>{{ elevM }} kg</strong></label>
          <input type="range" v-model.number="elevM" min="30" max="100" step="5" />
        </div>
        <div class="preset-buttons">
          <button @click="elevA = 4.9">上昇加速 (+4.9)</button>
          <button @click="elevA = 0">等速運動 (0)</button>
          <button @click="elevA = -4.9">減速/下降 (-4.9)</button>
          <button class="danger-btn" @click="elevA = -9.8">⚠️ 自由落下 (-9.8: 無重量)</button>
        </div>
      </div>

      <!-- モード3: 遠心力 -->
      <div v-if="mode === 'centrifugal'" class="controls-grid">
        <div class="control-group">
          <label>回転角速度 ω: <strong>{{ fmt(rotOmega, 2) }} rad/s</strong></label>
          <input type="range" v-model.number="rotOmega" min="0" max="5.0" step="0.1" />
        </div>
        <div class="control-group">
          <label>回転半径 <i>r</i>: <strong>{{ fmt(rotR, 2) }} m</strong></label>
          <input type="range" v-model.number="rotR" min="0.5" max="3.0" step="0.1" />
        </div>
        <div class="control-group">
          <label>静止摩擦係数 μ: <strong>{{ rotMu }}</strong></label>
          <input type="range" v-model.number="rotMu" min="0.1" max="0.8" step="0.05" />
        </div>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <template v-if="mode === 'cart'">
        <div class="stat-card">
          <span class="label">つり革の傾き角 θ</span>
          <span class="val highlight">{{ fmt(cartThetaDeg, 1) }}°</span>
        </div>
        <div class="stat-card">
          <span class="label">慣性力 <i>f</i> = <i>m</i>|<i>a</i>|</span>
          <span class="val highlight-alt">{{ fmt(cartInertiaForce, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">糸の張力 <i>T</i> = <i>m</i>√(<i>g</i>²+<i>a</i>²)</span>
          <span class="val">{{ fmt(cartTension, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">見かけの重力加速度 <i>g</i>'</span>
          <span class="val">{{ fmt(cartGprime, 2) }} <i>m</i>/<i>s</i>²</span>
        </div>
      </template>

      <template v-if="mode === 'elevator'">
        <div class="stat-card">
          <span class="label">体重計の指示値 (垂直抗力 $N$)</span>
          <span class="val" :class="{ 'zero-g': elevN <= 0.1 }">
            {{ fmt(elevN, 1) }} N ({{ fmt(elevApparentKg, 1) }} kg重)
          </span>
        </div>
        <div class="stat-card">
          <span class="label">見かけの重力加速度 $g' = g + a$</span>
          <span class="val highlight">{{ fmt(elevGprime, 2) }} $\text{m/s}^2$</span>
        </div>
        <div class="stat-card">
          <span class="label">慣性力 $f = -ma$</span>
          <span class="val highlight-alt">{{ fmt(-elevM * elevA, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">状態</span>
          <span class="val" :class="{ 'zero-g': elevN <= 0.1 }">
            {{ elevStateText }}
          </span>
        </div>
      </template>

      <template v-if="mode === 'centrifugal'">
        <div class="stat-card">
          <span class="label">遠心力 $F_{\text{cf}} = mr\omega^2$</span>
          <span class="val highlight">{{ fmt(rotFcf, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">最大静止摩擦力 $f_{\max} = \mu mg$</span>
          <span class="val">{{ fmt(rotFmax, 1) }} N</span>
        </div>
        <div class="stat-card">
          <span class="label">滑り出し判定</span>
          <span class="val" :class="rotSlipping ? 'slip-danger' : 'slip-ok'">
            {{ rotSlipping ? '⚠️ 外側へ滑り出し！' : '✓ 静止（つり合い）' }}
          </span>
        </div>
        <div class="stat-card">
          <span class="label">限界角速度 $\omega_0 = \sqrt{\mu g/r}$</span>
          <span class="val">{{ fmt(rotOmegaLimit, 2) }} rad/s</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, dot, text, line, arrow, useLoop, fmt } from './simUtils'

const canvasRef = ref(null)
const mode = ref('cart')
const observerFrame = ref('inside') // 'inside' (非慣性系) or 'outside' (慣性系)

const g = 9.8

// モード1: 台車
const cartA = ref(3.5)
const cartM = ref(2.0)
let cartX = 0

// モード2: エレベーター
const elevA = ref(2.5)
const elevM = ref(60)
let elevY = 0

// モード3: 遠心力
const rotOmega = ref(2.0)
const rotR = ref(1.5)
const rotMu = ref(0.4)
const rotM = ref(1.0)
let rotAngle = 0
let rotSlipDist = 0

// 計算: 台車
const cartTheta = computed(() => Math.atan(cartA.value / g))
const cartThetaDeg = computed(() => (cartTheta.value * 180) / Math.PI)
const cartInertiaForce = computed(() => cartM.value * Math.abs(cartA.value))
const cartTension = computed(() => cartM.value * Math.hypot(g, cartA.value))
const cartGprime = computed(() => Math.hypot(g, cartA.value))

// 計算: エレベーター
const elevGprime = computed(() => g + elevA.value)
const elevN = computed(() => Math.max(0, elevM.value * (g + elevA.value)))
const elevApparentKg = computed(() => elevN.value / g)
const elevStateText = computed(() => {
  if (elevN.value <= 0.01) return '無重量状態 (Free Fall)'
  if (elevA.value > 0.1) return '過重力 (体が重い)'
  if (elevA.value < -0.1) return '過小重力 (体が軽い)'
  return '通常重力 (等速/静止)'
})

// 計算: 遠心力
const rotFcf = computed(() => rotM.value * rotR.value * rotOmega.value * rotOmega.value)
const rotFmax = computed(() => rotMu.value * rotM.value * g)
const rotSlipping = computed(() => rotFcf.value > rotFmax.value)
const rotOmegaLimit = computed(() => Math.sqrt((rotMu.value * g) / rotR.value))

// アニメーションループ
useLoop((dt) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = 780
  const h = 420
  const ctx = setupCanvas(canvas, w, h)
  clearGrid(ctx, w, h, 30, '#09090b')

  if (mode.value === 'cart') {
    drawCartSim(ctx, w, h, dt)
  } else if (mode.value === 'elevator') {
    drawElevatorSim(ctx, w, h, dt)
  } else if (mode.value === 'centrifugal') {
    drawCentrifugalSim(ctx, w, h, dt)
  }
})

// -------------------------------------------------------------------
// 描画: 加速する台車とつり革
// -------------------------------------------------------------------
function drawCartSim(ctx, w, h, dt) {
  const theta = cartTheta.value
  const m = cartM.value
  const a = cartA.value
  const isInside = observerFrame.value === 'inside'

  // 台車を描画 (中央付近)
  const cartW = 420
  const cartH = 220
  const cx = 390
  const cy = 230

  // 床レール
  line(ctx, 40, cy + cartH / 2 + 25, 740, cy + cartH / 2 + 25, '#3f3f46', 3)

  // 台車本体
  ctx.fillStyle = 'rgba(39, 39, 42, 0.7)'
  ctx.strokeStyle = '#71717a'
  ctx.lineWidth = 2.5
  ctx.strokeRect(cx - cartW / 2, cy - cartH / 2, cartW, cartH)
  ctx.fillRect(cx - cartW / 2, cy - cartH / 2, cartW, cartH)

  // 車輪
  dot(ctx, cx - cartW / 3, cy + cartH / 2 + 12, 12, '#27272a', '#a1a1aa')
  dot(ctx, cx + cartW / 3, cy + cartH / 2 + 12, 12, '#27272a', '#a1a1aa')

  // 加速度矢印 (台車上部)
  if (Math.abs(a) > 0.05) {
    const aLen = a * 15
    arrow(ctx, cx, cy - cartH / 2 - 25, cx + aLen, cy - cartH / 2 - 25, '#38bdf8', 3, `台車の加速度 a = ${fmt(a, 1)} m/s²`, {
      align: a >= 0 ? 'left' : 'right',
      lx: a >= 0 ? 10 : -10
    })
  }

  // つり革の固定点
  const anchorX = cx
  const anchorY = cy - cartH / 2 + 25
  dot(ctx, anchorX, anchorY, 4, '#e4e4e7')

  // つり革の長さ
  const ropeLen = 120
  // 加速度 a が右向きなら、おもりは左に傾く (-a 方向)
  const bobX = anchorX - ropeLen * Math.sin(theta)
  const bobY = anchorY + ropeLen * Math.cos(theta)

  // 鉛直基準点線
  line(ctx, anchorX, anchorY, anchorX, anchorY + ropeLen + 15, 'rgba(113,113,122,0.4)', 1, [3, 3])

  // 角度 θ の弧
  ctx.beginPath()
  ctx.strokeStyle = '#a1a1aa'
  ctx.lineWidth = 1
  const arcR = 45
  const startAng = Math.PI / 2
  const endAng = Math.PI / 2 - theta
  ctx.arc(anchorX, anchorY, arcR, Math.min(startAng, endAng), Math.max(startAng, endAng))
  ctx.stroke()
  text(ctx, `θ=${fmt(cartThetaDeg.value, 1)}°`, anchorX - 25 * Math.sin(theta * 0.6), anchorY + arcR + 4, '#a1a1aa', '11px sans-serif', 'center')

  // ひも
  line(ctx, anchorX, anchorY, bobX, bobY, '#fbbf24', 2)

  // おもり
  dot(ctx, bobX, bobY, 14, '#f43f5e', '#ffffff')
  text(ctx, `m = ${m}kg`, bobX, bobY + 4, '#ffffff', 'bold 10px sans-serif', 'center')

  // 力のベクトル描画
  const scale = 5.0
  // 重力 mg (真下)
  const Fg = m * g
  arrow(ctx, bobX, bobY, bobX, bobY + Fg * scale, '#38bdf8', 2.5, `mg = ${fmt(Fg, 1)} N`, { align: 'left', lx: 6 })

  // 糸の張力 T (ひもに沿って固定点向き)
  const T = cartTension.value
  const tx = anchorX - bobX
  const ty = anchorY - bobY
  const tLen = Math.hypot(tx, ty)
  const ux = tx / tLen
  const uy = ty / tLen
  arrow(ctx, bobX, bobY, bobX + ux * T * scale, bobY + uy * T * scale, '#34d399', 2.5, `T = ${fmt(T, 1)} N`, { align: 'right', lx: -6 })

  if (isInside) {
    // 【非慣性系】：慣性力 -ma を描く
    const F_in = -m * a
    if (Math.abs(F_in) > 0.05) {
      arrow(ctx, bobX, bobY, bobX + F_in * scale, bobY, '#f59e0b', 3, `慣性力 -ma (${fmt(Math.abs(F_in), 1)}N)`, {
        align: F_in >= 0 ? 'left' : 'right',
        lx: F_in >= 0 ? 8 : -8
      })
    }
  } else {
    // 【慣性系】：合力 F_net = ma を描く
    const F_net = m * a
    if (Math.abs(F_net) > 0.05) {
      arrow(ctx, bobX, bobY, bobX + F_net * scale, bobY, '#a855f7', 2.5, `合力 ma (${fmt(Math.abs(F_net), 1)}N)`, {
        dash: [4, 4],
        align: F_net >= 0 ? 'left' : 'right',
        lx: F_net >= 0 ? 8 : -8
      })
    }
  }

  // 観測者アイコン
  if (isInside) {
    // 台車内の人
    text(ctx, '👤 車内の人（静止して見える）', cx - 140, cy + cartH / 2 - 25, '#fbbf24', 'bold 12px sans-serif')
    text(ctx, 'つり合い式: T + mg + (-ma) = 0', cx - 140, cy + cartH / 2 - 8, '#a1a1aa', '11px monospace')
  } else {
    // 地上の人
    text(ctx, '🌍 地上の人（外から見る）', 60, cy + cartH / 2 + 55, '#38bdf8', 'bold 12px sans-serif')
    text(ctx, '運動方程式: ma = T sinθ, mg = T cosθ', 60, cy + cartH / 2 + 72, '#a1a1aa', '11px monospace')
  }
}

// -------------------------------------------------------------------
// 描画: エレベーターと体重計
// -------------------------------------------------------------------
function drawElevatorSim(ctx, w, h, dt) {
  const a = elevA.value
  const m = elevM.value
  const N = elevN.value
  const isInside = observerFrame.value === 'inside'

  const ex = 390
  const ey = 210
  const ew = 240
  const eh = 280

  // 昇降路 (枠)
  line(ctx, ex - ew / 2 - 20, 20, ex - ew / 2 - 20, 400, '#27272a', 2)
  line(ctx, ex + ew / 2 + 20, 20, ex + ew / 2 + 20, 400, '#27272a', 2)

  // 吊りワイヤー
  line(ctx, ex, 20, ex, ey - eh / 2, '#71717a', 3)

  // かご
  ctx.fillStyle = 'rgba(39, 39, 42, 0.7)'
  ctx.strokeStyle = '#a1a1aa'
  ctx.lineWidth = 3
  ctx.fillRect(ex - ew / 2, ey - eh / 2, ew, eh)
  ctx.strokeRect(ex - ew / 2, ey - eh / 2, ew, eh)

  // 体重計 (床の上)
  const scaleY = ey + eh / 2 - 15
  ctx.fillStyle = '#0284c7'
  ctx.fillRect(ex - 50, scaleY - 12, 100, 12)
  text(ctx, '体重計', ex, scaleY - 2, '#ffffff', '10px sans-serif', 'center')

  // 人物 (体重計の上)
  // 無重量(N<=0.1)なら足が少し浮く
  const feetOffset = N <= 0.1 ? -16 : 0
  const personBaseY = scaleY - 12 + feetOffset
  drawPerson(ctx, ex, personBaseY)

  // 加速度表示 (かごの横)
  if (Math.abs(a) > 0.05) {
    arrow(ctx, ex + ew / 2 + 40, ey, ex + ew / 2 + 40, ey - a * 12, '#38bdf8', 3, `加速度 a = ${fmt(a, 1)} m/s²`, {
      align: 'left',
      lx: 10
    })
  }

  // 人にかかる力のベクトル
  const centerPersonY = personBaseY - 60
  const fScale = 0.25

  // 重力 mg (真下)
  const Fg = m * g
  arrow(ctx, ex, centerPersonY, ex, centerPersonY + Fg * fScale, '#38bdf8', 2.5, `重力 mg = ${fmt(Fg, 0)} N`, { align: 'left', lx: 8 })

  // 垂直抗力 N (足元から上向き)
  if (N > 0.1) {
    arrow(ctx, ex - 15, personBaseY, ex - 15, personBaseY - N * fScale, '#34d399', 3, `垂直抗力 N = ${fmt(N, 0)} N`, { align: 'right', lx: -8 })
  }

  if (isInside) {
    // 内部観測者: 慣性力 -ma
    const F_in = -m * a
    if (Math.abs(F_in) > 0.1) {
      arrow(ctx, ex + 15, centerPersonY, ex + 15, centerPersonY - F_in * fScale, '#f59e0b', 3, `慣性力 -ma (${fmt(F_in, 0)} N)`, {
        align: 'left',
        lx: 8
      })
    }
  }

  // 体重計メーター (左側に拡大表示)
  drawScaleMeter(ctx, 120, 210, N, m * g)
}

function drawPerson(ctx, x, baseY) {
  ctx.save()
  // 頭
  dot(ctx, x, baseY - 90, 10, '#fde047')
  // 胴体
  line(ctx, x, baseY - 80, x, baseY - 45, '#e4e4e7', 3)
  // 腕
  line(ctx, x, baseY - 70, x - 18, baseY - 50, '#e4e4e7', 2.5)
  line(ctx, x, baseY - 70, x + 18, baseY - 50, '#e4e4e7', 2.5)
  // 脚
  line(ctx, x, baseY - 45, x - 12, baseY, '#e4e4e7', 3)
  line(ctx, x, baseY - 45, x + 12, baseY, '#e4e4e7', 3)
  ctx.restore()
}

function drawScaleMeter(ctx, x, y, nVal, normalN) {
  ctx.save()
  ctx.fillStyle = '#18181b'
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 2
  ctx.fillRect(x - 70, y - 70, 140, 140)
  ctx.strokeRect(x - 70, y - 70, 140, 140)

  // 円盤
  dot(ctx, x, y, 50, '#27272a', '#71717a')
  text(ctx, '体重計の指示値', x, y - 56, '#a1a1aa', '10px sans-serif', 'center')

  // 針 (0N ~ 2*normalN)
  const ratio = Math.min(2, Math.max(0, nVal / normalN))
  const ang = -Math.PI * 0.75 + ratio * (Math.PI * 1.5)
  const hx = x + 38 * Math.cos(ang)
  const hy = y + 38 * Math.sin(ang)

  line(ctx, x, y, hx, hy, nVal <= 0.1 ? '#ef4444' : '#38bdf8', 2.5)
  dot(ctx, x, y, 4, '#e4e4e7')

  text(ctx, `${fmt(nVal / 9.8, 1)} kg`, x, y + 25, '#ffffff', 'bold 13px sans-serif', 'center')
  ctx.restore()
}

// -------------------------------------------------------------------
// 描画: 回転円盤と遠心力
// -------------------------------------------------------------------
function drawCentrifugalSim(ctx, w, h, dt) {
  const omega = rotOmega.value
  const r = rotR.value
  const mu = rotMu.value
  const m = rotM.value
  const isInside = observerFrame.value === 'inside'
  const isSlip = rotSlipping.value

  rotAngle += omega * dt

  const cx = 390
  const cy = 210
  const maxVisualR = 150
  const visualR = (r / 3.0) * maxVisualR

  // 円盤
  ctx.fillStyle = '#18181b'
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 2
  dot(ctx, cx, cy, maxVisualR + 25, '#18181b', '#3f3f46')

  // 円盤の回転模様 (十字)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotAngle)
  line(ctx, -maxVisualR - 20, 0, maxVisualR + 20, 0, 'rgba(113,113,122,0.3)', 1)
  line(ctx, 0, -maxVisualR - 20, 0, maxVisualR + 20, 'rgba(113,113,122,0.3)', 1)
  ctx.restore()

  // 回転軸
  dot(ctx, cx, cy, 6, '#71717a', '#ffffff')
  text(ctx, `ω = ${fmt(omega, 1)} rad/s`, cx, cy - maxVisualR - 35, '#38bdf8', 'bold 12px sans-serif', 'center')

  // 物体位置
  // 滑り出している場合は半径が外に逃げていくアニメーション
  if (isSlip) {
    rotSlipDist = Math.min(maxVisualR + 50, rotSlipDist + dt * 60)
  } else {
    rotSlipDist = 0
  }
  const currentVisualR = visualR + rotSlipDist
  const currentAngle = isInside ? 0 : rotAngle
  const bx = cx + currentVisualR * Math.cos(currentAngle)
  const by = cy + currentVisualR * Math.sin(currentAngle)

  // 半径線
  line(ctx, cx, cy, bx, by, '#71717a', 1, [3, 3])

  // 物体 (ブロック)
  dot(ctx, bx, by, 12, isSlip ? '#ef4444' : '#fbbf24', '#ffffff')
  text(ctx, `m`, bx, by + 4, '#000000', 'bold 10px sans-serif', 'center')

  // 力のベクトル (scale)
  const fScale = 1.8
  const ux = Math.cos(currentAngle)
  const uy = Math.sin(currentAngle)

  if (isInside) {
    // 【非慣性系】：外向きの遠心力 vs 内向きの静止摩擦力
    const Fcf = rotFcf.value
    arrow(ctx, bx, by, bx + ux * Fcf * fScale, by + uy * Fcf * fScale, '#f59e0b', 3, `遠心力 mrω² (${fmt(Fcf, 1)}N)`, {
      align: ux >= 0 ? 'left' : 'right',
      lx: ux >= 0 ? 8 : -8
    })

    const Fmax = rotFmax.value
    const fStatic = Math.min(Fcf, Fmax)
    arrow(ctx, bx, by, bx - ux * fStatic * fScale, by - uy * fStatic * fScale, '#34d399', 2.5, `摩擦力 f (${fmt(fStatic, 1)}N)`, {
      align: ux >= 0 ? 'right' : 'left',
      lx: ux >= 0 ? -8 : 8
    })
  } else {
    // 【慣性系】：内向きの向心力（摩擦力が向心力となる）
    const Fmax = rotFmax.value
    const Freq = rotFcf.value
    const fStatic = Math.min(Freq, Fmax)
    arrow(ctx, bx, by, bx - ux * fStatic * fScale, by - uy * fStatic * fScale, '#a855f7', 3, `向心力（静止摩擦力）`, {
      align: ux >= 0 ? 'right' : 'left',
      lx: ux >= 0 ? -8 : 8
    })
  }
}
</script>

<style scoped>
.inertia-sim {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 18px;
  margin: 1.5rem 0;
  color: #f4f4f5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.sim-header {
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fafafa;
}

.badge {
  background: #27272a;
  border: 1px solid #3f3f46;
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: monospace;
}

.desc {
  font-size: 0.85rem;
  color: #a1a1aa;
  margin: 6px 0 0 0;
  line-height: 1.5;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.mode-tabs button {
  background: #27272a;
  color: #d4d4d8;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-tabs button:hover {
  background: #3f3f46;
  color: #fff;
}

.mode-tabs button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.frame-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #202024;
  border: 1px solid #333338;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.frame-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e4e4e7;
}

.toggle-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-buttons button {
  background: #27272a;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-buttons button.active {
  background: #f59e0b;
  border-color: #fbbf24;
  color: #000000;
  font-weight: 700;
}

.canvas-wrap {
  width: 100%;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 780 / 420;
}

.controls-panel {
  background: #27272a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 0.8rem;
  color: #d4d4d8;
  display: flex;
  justify-content: space-between;
}

.control-group strong {
  color: #38bdf8;
}

.sub-info {
  font-size: 0.75rem;
  color: #71717a;
}

.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.preset-buttons {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.preset-buttons button {
  background: #3f3f46;
  color: #f4f4f5;
  border: 1px solid #52525b;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
}

.preset-buttons button.danger-btn {
  background: #991b1b;
  border-color: #ef4444;
  color: #fee2e2;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.stat-card {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #a1a1aa;
}

.stat-card .val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fafafa;
  font-family: monospace;
}

.stat-card .val.highlight {
  color: #38bdf8;
}

.stat-card .val.highlight-alt {
  color: #fbbf24;
}

.stat-card .val.zero-g {
  color: #ef4444;
}

.stat-card .val.slip-danger {
  color: #ef4444;
}

.stat-card .val.slip-ok {
  color: #4ade80;
}
</style>
