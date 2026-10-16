<template>
  <div class="lab" style="--ac:#6366f1;--ac2:#ec4899">
    <div class="lab-head">
      <span class="lab-title">⚙️ 運動の法則・連結物体と滑車（アトウッドの器械）実験室</span>
      <span class="lab-badge">{{ configMode === 'atwood' ? '鉛直アトウッド器械' : '斜面＋吊り下げ連結' }}</span>
    </div>

    <!-- モード切替タブ -->
    <div style="display:flex;gap:6px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': configMode === 'atwood' }" @click="configMode = 'atwood'; reset()">
        ⚖️ 鉛直アトウッドの器械 (2物体吊り下げ)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': configMode === 'incline' }" @click="configMode = 'incline'; reset()">
        📐 斜面上の物体 ＋ 吊り下げ物体
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label>物体 A の質量 M: <strong>{{ massA.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="massA" min="1.0" max="8.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label>物体 B の質量 m: <strong>{{ massB.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="massB" min="1.0" max="8.0" step="0.5" />
      </div>

      <div v-if="configMode === 'incline'" class="lab-ctrl">
        <label>斜面の傾斜角 θ: <strong>{{ inclineDeg }}°</strong></label>
        <input type="range" v-model.number="inclineDeg" min="0" max="60" step="5" />
      </div>

      <div v-if="configMode === 'incline'" class="lab-ctrl">
        <label>斜面の動摩擦係数 μₖ: <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.0" max="0.4" step="0.05" />
      </div>

      <div class="lab-ctrl">
        <label>シミュレーション操作</label>
        <div class="lab-row">
          <button class="lab-btn lab-btn-pri" @click="running = !running">{{ running ? '⏸️ 一時停止' : '▶️ 運動開始' }}</button>
          <button class="lab-btn" @click="reset">🔄 初期位置にリセット</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">生じる加速度 a</div>
        <div class="v" style="color:#6366f1">{{ curAcc.toFixed(2) }} <small>m/s²</small></div>
        <div class="f" v-if="configMode === 'atwood'">
          a = <span class="frac"><span class="num">M − m</span><span class="den">M + m</span></span> · g
        </div>
        <div class="f" v-else>
          a = <span class="frac"><span class="num">mg − Mg sinθ − f'</span><span class="den">M + m</span></span>
        </div>
      </div>

      <div class="lab-stat">
        <div class="k">糸の張力 T</div>
        <div class="v" style="color:#ec4899">{{ curTension.toFixed(1) }} <small>N</small></div>
        <div class="f" v-if="configMode === 'atwood'">
          T = <span class="frac"><span class="num">2Mm</span><span class="den">M + m</span></span> · g
        </div>
        <div class="f" v-else>
          T = m(g − a)
        </div>
      </div>

      <div class="lab-stat">
        <div class="k">現在の速さ v</div>
        <div class="v" style="color:#38bdf8">{{ curSpeed.toFixed(2) }} <small>m/s</small></div>
        <div class="f">v = at</div>
      </div>

      <div class="lab-stat">
        <div class="k">運動の向き</div>
        <div class="v" style="color:#10b981">{{ motionDirectionText }}</div>
        <div class="f">重力成分の大きい側へ加速</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const g = 9.8
const configMode = ref('atwood') // 'atwood' or 'incline'

const massA = ref(4.0) // kg
const massB = ref(2.0) // kg
const inclineDeg = ref(30) // deg
const muK = ref(0.1) // 動摩擦係数

const running = ref(false)
const posOffset = ref(0) // 移動変位 m
const curSpeed = ref(0)

function reset() {
  running.value = false
  posOffset.value = 0
  curSpeed.value = 0
}

// 物理計算
// 1. アトウッド器械:
// A (M) 鉛直下向き, B (m) 鉛直下向き
// M a = M g - T
// m a = T - m g
// a = (M - m) / (M + m) * g
// T = 2 M m / (M + m) * g
//
// 2. 斜面連結:
// 斜面上に A (M), 鉛直吊り下げに B (m)
// 斜面方向の重力成分: M g sinθ
// 摩擦力: f' = μk M g cosθ (進行方向と逆)
// 駆動外力: F_net = m g - M g sinθ - f'
const curAcc = computed(() => {
  const M = massA.value
  const m = massB.value

  if (configMode.value === 'atwood') {
    return ((M - m) / (M + m)) * g
  }

  // incline
  const rad = (inclineDeg.value * Math.PI) / 180
  const gravAlong = M * g * Math.sin(rad)
  const normN = M * g * Math.cos(rad)
  const fFric = muK.value * normN

  // B が下がる向き (m g > M g sinθ + fFric)
  const netDownB = m * g - gravAlong - fFric
  if (netDownB > 0) {
    return netDownB / (M + m)
  }

  // A が滑り降りる向き (M g sinθ > m g + fFric)
  const netDownA = gravAlong - m * g - fFric
  if (netDownA > 0) {
    return -netDownA / (M + m)
  }

  // 摩擦力で静止（つり合い）
  return 0
})

const curTension = computed(() => {
  const M = massA.value
  const m = massB.value
  const a = curAcc.value

  if (configMode.value === 'atwood') {
    return (2 * M * m * g) / (M + m)
  }

  // incline: B の方程式 m a = m g - T => T = m(g - a)
  return Math.max(0, m * (g - a))
})

const accFormulaText = computed(() => {
  if (configMode.value === 'atwood') {
    return 'a = (M - m)/(M + m) · g'
  }
  return 'a = (mg - Mg sinθ - f\') / (M + m)'
})

const motionDirectionText = computed(() => {
  if (configMode.value === 'atwood') {
    if (massA.value > massB.value) return 'Aが下降、Bが上昇'
    if (massA.value < massB.value) return 'Bが下降、Aが上昇'
    return '完全につり合い静止'
  }
  if (curAcc.value > 0.05) return 'Bが下降（Aが斜面を登る）'
  if (curAcc.value < -0.05) return 'Aが下降（Bが持ち上がる）'
  return '摩擦力により静止'
})

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  // 運動積分
  if (running.value) {
    const safeDt = Math.min(dt, 0.04)
    curSpeed.value += curAcc.value * safeDt
    posOffset.value += curSpeed.value * safeDt

    // 移動限界（地面や滑車への衝突）
    if (Math.abs(posOffset.value) > 1.8) {
      running.value = false
    }
  }

  if (configMode.value === 'atwood') {
    drawAtwood(ctx, width, height)
  } else {
    drawIncline(ctx, width, height)
  }
})

function drawAtwood(ctx, w, h) {
  const cx = w * 0.5
  const topY = 70
  const pulleyR = 40
  const pxPerM = 70

  // 1. 天井と滑車固定具
  line(ctx, cx - 60, 20, cx + 60, 20, { color: '#64748b', width: 4 })
  line(ctx, cx, 20, cx, topY, { color: '#94a3b8', width: 4 })

  // 2. 定滑車の円
  dot(ctx, cx, topY, pulleyR, '#334155', '#94a3b8', 3)
  dot(ctx, cx, topY, 6, '#f59e0b', '#fff', 1.5)

  // 3. 糸の左右の位置
  const leftX = cx - pulleyR
  const rightX = cx + pulleyR
  const baseLen = 140
  const yA = topY + baseLen + posOffset.value * pxPerM
  const yB = topY + baseLen - posOffset.value * pxPerM

  // 糸の描画
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  // 滑車の上半円
  ctx.arc(cx, topY, pulleyR, Math.PI, 0)
  ctx.stroke()
  // 左の吊り下げ糸 (A)
  line(ctx, leftX, topY, leftX, yA, { color: '#cbd5e1', width: 2.5 })
  // 右の吊り下げ糸 (B)
  line(ctx, rightX, topY, rightX, yB, { color: '#cbd5e1', width: 2.5 })

  // 4. 物体 A (左)
  const sizeA = Math.min(55, 30 + massA.value * 3.5)
  ctx.fillStyle = '#6366f1'
  ctx.fillRect(leftX - sizeA / 2, yA, sizeA, sizeA)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(leftX - sizeA / 2, yA, sizeA, sizeA)
  text(ctx, `A: ${massA.value}kg`, leftX, yA + sizeA / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif' })

  // 力の矢印 (A): 重力 Mg (下), 張力 T (上)
  arrow(ctx, leftX, yA + sizeA, leftX, yA + sizeA + 45, { color: '#6366f1', width: 2.5, head: 7 })
  text(ctx, `Mg = ${(massA.value * g).toFixed(0)}N`, leftX - 10, yA + sizeA + 30, { align: 'right', color: '#6366f1', font: '11px sans-serif' })

  arrow(ctx, leftX, yA, leftX, yA - 40, { color: '#ec4899', width: 2.5, head: 7 })
  text(ctx, `T = ${curTension.value.toFixed(0)}N`, leftX - 10, yA - 20, { align: 'right', color: '#ec4899', font: 'bold 11px sans-serif' })

  // 5. 物体 B (右)
  const sizeB = Math.min(55, 30 + massB.value * 3.5)
  ctx.fillStyle = '#ec4899'
  ctx.fillRect(rightX - sizeB / 2, yB, sizeB, sizeB)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(rightX - sizeB / 2, yB, sizeB, sizeB)
  text(ctx, `B: ${massB.value}kg`, rightX, yB + sizeB / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif' })

  // 力の矢印 (B): 重力 mg (下), 張力 T (上)
  arrow(ctx, rightX, yB + sizeB, rightX, yB + sizeB + 35, { color: '#ec4899', width: 2.5, head: 7 })
  text(ctx, `mg = ${(massB.value * g).toFixed(0)}N`, rightX + 10, yB + sizeB + 25, { align: 'left', color: '#ec4899', font: '11px sans-serif' })

  arrow(ctx, rightX, yB, rightX, yB - 40, { color: '#ec4899', width: 2.5, head: 7 })
  text(ctx, `T = ${curTension.value.toFixed(0)}N`, rightX + 10, yB - 20, { align: 'left', color: '#ec4899', font: 'bold 11px sans-serif' })
}

function drawIncline(ctx, w, h) {
  const rad = (inclineDeg.value * Math.PI) / 180
  const floorY = h * 0.78
  const startX = w * 0.15
  const inclineLen = w * 0.52
  const pulleyX = startX + inclineLen * Math.cos(rad)
  const pulleyY = floorY - inclineLen * Math.sin(rad)

  // 1. 斜面台
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.moveTo(startX, floorY)
  ctx.lineTo(pulleyX, pulleyY)
  ctx.lineTo(pulleyX, floorY)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.stroke()

  // 角度ラベル
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(startX, floorY, 40, 0, -rad, true)
  ctx.stroke()
  text(ctx, `θ = ${inclineDeg.value}°`, startX + 55, floorY - 10, { color: '#94a3b8', font: '11px sans-serif' })

  // 2. 頂点の滑車
  const pulleyR = 18
  dot(ctx, pulleyX, pulleyY, pulleyR, '#334155', '#94a3b8', 2.5)
  dot(ctx, pulleyX, pulleyY, 4, '#f59e0b')

  // 3. 物体 A の位置（斜面上）
  const pxPerM = 65
  const baseDistOnIncline = inclineLen * 0.55
  const distA = baseDistOnIncline - posOffset.value * pxPerM
  const objAX = startX + distA * Math.cos(rad)
  const objAY = floorY - distA * Math.sin(rad)

  // 糸の描画
  // 斜面上の糸
  line(ctx, objAX, objAY, pulleyX, pulleyY, { color: '#cbd5e1', width: 2.5 })

  // 吊り下げ糸 (B)
  const hangDist = 90 + posOffset.value * pxPerM
  const hangX = pulleyX + pulleyR
  const objBY = pulleyY + hangDist
  line(ctx, pulleyX, pulleyY - pulleyR, hangX, pulleyY, { color: '#cbd5e1', width: 2.5 })
  line(ctx, hangX, pulleyY, hangX, objBY, { color: '#cbd5e1', width: 2.5 })

  // 4. 物体 A の描画（斜面傾きに合わせて回転）
  ctx.save()
  ctx.translate(objAX, objAY)
  ctx.rotate(-rad)

  const sizeA = Math.min(50, 26 + massA.value * 3.5)
  ctx.fillStyle = '#6366f1'
  ctx.fillRect(-sizeA / 2, -sizeA, sizeA, sizeA)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(-sizeA / 2, -sizeA, sizeA, sizeA)
  text(ctx, `A: ${massA.value}kg`, 0, -sizeA / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif' })

  ctx.restore()

  // 5. 物体 B の描画（鉛直吊り下げ）
  const sizeB = Math.min(50, 26 + massB.value * 3.5)
  ctx.fillStyle = '#ec4899'
  ctx.fillRect(hangX - sizeB / 2, objBY, sizeB, sizeB)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(hangX - sizeB / 2, objBY, sizeB, sizeB)
  text(ctx, `B: ${massB.value}kg`, hangX, objBY + sizeB / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif' })

  // 力の矢印 (B)
  arrow(ctx, hangX, objBY + sizeB, hangX, objBY + sizeB + 30, { color: '#ec4899', width: 2, head: 6 })
  text(ctx, `mg = ${(massB.value * g).toFixed(0)}N`, hangX + 8, objBY + sizeB + 20, { align: 'left', color: '#ec4899', font: '10px sans-serif' })
}
</script>
