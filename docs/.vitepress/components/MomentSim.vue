<template>
  <div class="lab" style="--ac:#f59e0b;--ac2:#ef4444">
    <div class="lab-head">
      <span class="lab-title">⚖️ 剛体のつり合いと力のモーメント 実験室</span>
      <span class="lab-badge">{{ mode === 'lever' ? 'てこ・シーソーのつり合い' : '壁に立てかけた棒の滑り出し' }}</span>
    </div>

    <!-- モード切替タブ -->
    <div style="display:flex;gap:8px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'lever' }" @click="mode = 'lever'">
        📐 てこ・シーソー（回転のつり合い）
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'ladder' }" @click="mode = 'ladder'">
        🧱 壁に立てかけた棒（滑り出し限界）
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <!-- てこモードのコントロール -->
    <div v-if="mode === 'lever'" class="lab-controls">
      <div class="lab-ctrl">
        <label>左のおもり m₁: <strong>{{ m1.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m1" min="1.0" max="10.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>左の腕の長さ d₁: <strong>{{ d1.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="d1" min="0.5" max="4.0" step="0.1" />
      </div>
      <div class="lab-ctrl">
        <label>右のおもり m₂: <strong>{{ m2.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="m2" min="1.0" max="10.0" step="0.5" />
      </div>
      <div class="lab-ctrl">
        <label>右の腕の長さ d₂: <strong>{{ d2.toFixed(1) }} m</strong></label>
        <input type="range" v-model.number="d2" min="0.5" max="4.0" step="0.1" />
      </div>
      <div class="lab-ctrl">
        <label>棒自体の質量 M: <strong>{{ barMass.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="barMass" min="0.0" max="6.0" step="0.5" />
        <div class="lab-note">支点が中央にあれば棒自体のモーメントは相殺されて0</div>
      </div>
      <div class="lab-ctrl">
        <label>ワンクリック・プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" @click="setLever(4, 2, 2, 4)">完全つり合い (4kg×2m = 2kg×4m)</button>
          <button class="lab-chip" @click="setLever(6, 1.5, 3, 3)">等モーメント (9 N·m)</button>
          <button class="lab-chip" @click="setLever(8, 2, 2, 2)">左が重い (傾く)</button>
        </div>
      </div>
    </div>

    <!-- はしごモードのコントロール -->
    <div v-else class="lab-controls">
      <div class="lab-ctrl">
        <label>棒と床のなす角 θ: <strong>{{ thetaDeg.toFixed(0) }}°</strong></label>
        <input type="range" v-model.number="thetaDeg" min="30" max="80" step="1" />
        <div class="lab-note">角度が小さくなる（寝かせる）ほど滑りやすくなる</div>
      </div>
      <div class="lab-ctrl">
        <label>床の最大静止摩擦係数 μ: <strong>{{ muS.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muS" min="0.15" max="0.70" step="0.05" />
      </div>
      <div class="lab-ctrl">
        <label>棒の質量 M: <strong>{{ ladderM.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="ladderM" min="5.0" max="20.0" step="1.0" />
      </div>
      <div class="lab-ctrl">
        <label>棒を登る人の位置 (足元からの比率): <strong>{{ (climberPos * 100).toFixed(0) }}%</strong></label>
        <input type="range" v-model.number="climberPos" min="0.0" max="1.0" step="0.05" />
        <div class="lab-note">上に登るほど壁を押す力が増え、床の摩擦限界に近づく</div>
      </div>
      <div class="lab-ctrl">
        <label>人の質量 m: <strong>{{ climberM.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="climberM" min="0.0" max="70.0" step="5.0" />
      </div>
    </div>

    <!-- ステータス表示 -->
    <div v-if="mode === 'lever'" class="lab-stats">
      <div class="lab-stat" :class="{ hl: isLeverBalanced }">
        <div class="k">つり合い状態</div>
        <div class="v" :style="{ color: isLeverBalanced ? '#10b981' : '#ef4444' }">
          {{ isLeverBalanced ? '完全につり合い！' : (tauNet > 0 ? '反時計回りに傾く' : '時計回りに傾く') }}
        </div>
        <div class="f">合力ΣF = 0 かつ 合モーメントΣM = 0</div>
      </div>
      <div class="lab-stat">
        <div class="k">反時計回りモーメント M₁</div>
        <div class="v" style="color:#f59e0b">{{ tauLeft.toFixed(1) }} <small>N·m</small></div>
        <div class="f">m₁g · d₁ = ({{ m1.toFixed(1) }}×9.8) × {{ d1.toFixed(1) }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">時計回りモーメント M₂</div>
        <div class="v" style="color:#38bdf8">{{ tauRight.toFixed(1) }} <small>N·m</small></div>
        <div class="f">m₂g · d₂ = ({{ m2.toFixed(1) }}×9.8) × {{ d2.toFixed(1) }}</div>
      </div>
      <div class="lab-stat">
        <div class="k">支点が受ける垂直抗力 N</div>
        <div class="v" style="color:#a855f7">{{ totalUpForce.toFixed(1) }} <small>N</small></div>
        <div class="f">N = (m₁ + m₂ + M)g（上向き）</div>
      </div>
    </div>

    <div v-else class="lab-stats">
      <div class="lab-stat" :class="{ hl: isLadderSafe }">
        <div class="k">安全判定</div>
        <div class="v" :style="{ color: isLadderSafe ? '#10b981' : '#ef4444' }">
          {{ isLadderSafe ? '静止（すべらない）' : '⚠️ スリップ転倒！' }}
        </div>
        <div class="f">必要摩擦力 f ≦ 最大静止摩擦力 μN_B</div>
      </div>
      <div class="lab-stat">
        <div class="k">床の必要静止摩擦力 f</div>
        <div class="v" style="color:#f59e0b">{{ reqFriction.toFixed(1) }} <small>N</small></div>
        <div class="f">壁の抗力 N_A とつり合う</div>
      </div>
      <div class="lab-stat">
        <div class="k">床の最大静止摩擦力 μN_B</div>
        <div class="v" style="color:#10b981">{{ maxFriction.toFixed(1) }} <small>N</small></div>
        <div class="f">μ × (M + m)g = {{ muS.toFixed(2) }} × {{ (ladderM + climberM).toFixed(1) }}×9.8</div>
      </div>
      <div class="lab-stat">
        <div class="k">すべり出し限界角 θ_min</div>
        <div class="v" style="color:#38bdf8">{{ criticalTheta.toFixed(1) }} <small>°</small></div>
        <div class="f">これより角度が寝ると滑り落ちる</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const g = 9.8
const mode = ref('lever')

// てこモードのパラメータ
const m1 = ref(4.0)
const d1 = ref(2.0)
const m2 = ref(2.0)
const d2 = ref(4.0)
const barMass = ref(1.0)
const angle = ref(0) // 現在の傾き角（rad）
const angleVel = ref(0)

const tauLeft = computed(() => m1.value * g * d1.value)
const tauRight = computed(() => m2.value * g * d2.value)
const tauNet = computed(() => tauLeft.value - tauRight.value) // >0で反時計
const isLeverBalanced = computed(() => Math.abs(tauNet.value) < 0.2)
const totalUpForce = computed(() => (m1.value + m2.value + barMass.value) * g)

function setLever(w1, len1, w2, len2) {
  m1.value = w1
  d1.value = len1
  m2.value = w2
  d2.value = len2
  angle.value = 0
  angleVel.value = 0
}

// はしごモードのパラメータ
const thetaDeg = ref(60)
const muS = ref(0.4)
const ladderM = ref(10.0)
const climberPos = ref(0.6) // 0〜1
const climberM = ref(50.0)

// はしごの力学計算（長さ L = 1 として比率計算）
// 点B（床との接地点）まわりのモーメントのつり合い：
// 時計回り：壁の抗力 N_A × L sinθ
// 反時計回り：棒の重力 Mg × (L/2) cosθ + 人の重力 mg × (x L) cosθ
// N_A · sinθ = [M/2 + m·x] g · cosθ
// N_A = [ (M/2 + m·x) g ] / tanθ
// 水平方向のつり合い：f = N_A
// 鉛直方向のつり合い：N_B = (M + m) g
// 最大静止摩擦力：f_max = μ · N_B = μ · (M + m) g
const ladderThetaRad = computed(() => (thetaDeg.value * Math.PI) / 180)
const normalFloorNB = computed(() => (ladderM.value + climberM.value) * g)
const reqFriction = computed(() => {
  const tan = Math.tan(ladderThetaRad.value)
  if (tan <= 0.01) return 9999
  const numerator = (ladderM.value * 0.5 + climberM.value * climberPos.value) * g
  return numerator / tan
})
const maxFriction = computed(() => muS.value * normalFloorNB.value)
const isLadderSafe = computed(() => reqFriction.value <= maxFriction.value)

// 限界角：tanθ_min = (M/2 + m*x) / [ μ * (M + m) ]
const criticalTheta = computed(() => {
  const tanMin = (ladderM.value * 0.5 + climberM.value * climberPos.value) / (muS.value * (ladderM.value + climberM.value))
  return (Math.atan(tanMin) * 180) / Math.PI
})

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  if (mode.value === 'lever') {
    drawLever(ctx, width, height, dt)
  } else {
    drawLadder(ctx, width, height, dt)
  }
})

// てこの描画 & 微小振動シミュレーション
function drawLever(ctx, w, h, dt) {
  const cx = w / 2
  const cy = h * 0.58
  const maxTilt = 0.22 // 最大傾斜角（地面で止まる）

  // 目標傾斜角
  let targetAngle = 0
  if (Math.abs(tauNet.value) > 0.5) {
    targetAngle = tauNet.value > 0 ? -maxTilt : maxTilt
  }

  // 簡易スプリングダンパーで滑らかに傾ける
  const kA = 15.0
  const cA = 6.0
  const acc = kA * (targetAngle - angle.value) - cA * angleVel.value
  angleVel.value += acc * Math.min(dt, 0.05)
  angle.value += angleVel.value * Math.min(dt, 0.05)

  ctx.save()

  // 1. 支点の三角形台
  ctx.fillStyle = '#64748b'
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx - 30, cy + 50)
  ctx.lineTo(cx + 30, cy + 50)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  ctx.stroke()

  // 支点の回転ピン
  dot(ctx, cx, cy, 6, '#f59e0b', '#fff', 2)
  text(ctx, '支点 O', cx, cy + 65, { color: '#94a3b8', font: '11px sans-serif' })

  // 支点の垂直抗力矢印 N
  arrow(ctx, cx, cy, cx, cy - 65, { color: '#a855f7', width: 3, head: 9 })
  text(ctx, `N = ${totalUpForce.value.toFixed(0)} N`, cx + 8, cy - 50, { align: 'left', color: '#a855f7', font: 'bold 12px sans-serif' })

  // 2. シーソーの棒（回転）
  ctx.translate(cx, cy)
  ctx.rotate(angle.value)

  const pxPerM = 55
  const barHalfLen = 4.2 * pxPerM

  // 棒の本体
  ctx.fillStyle = '#334155'
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.fillRect(-barHalfLen, -8, barHalfLen * 2, 16)
  ctx.strokeRect(-barHalfLen, -8, barHalfLen * 2, 16)

  // 目盛り線
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  for (let m = -4; m <= 4; m++) {
    if (m === 0) continue
    const x = m * pxPerM
    ctx.beginPath()
    ctx.moveTo(x, -8)
    ctx.lineTo(x, 8)
    ctx.stroke()
  }

  // 左のおもり位置 x1 = -d1 * pxPerM
  const x1 = -d1.value * pxPerM
  const size1 = Math.min(45, 20 + m1.value * 2.5)
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x1 - size1 / 2, -8 - size1, size1, size1)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(x1 - size1 / 2, -8 - size1, size1, size1)
  text(ctx, `${m1.value}kg`, x1, -8 - size1 / 2, { color: '#000', font: 'bold 11px sans-serif' })

  // 右のおもり位置 x2 = d2 * pxPerM
  const x2 = d2.value * pxPerM
  const size2 = Math.min(45, 20 + m2.value * 2.5)
  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(x2 - size2 / 2, -8 - size2, size2, size2)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(x2 - size2 / 2, -8 - size2, size2, size2)
  text(ctx, `${m2.value}kg`, x2, -8 - size2 / 2, { color: '#000', font: 'bold 11px sans-serif' })

  // 力の矢印（重力 W1, W2）
  // 棒の傾きを考慮して鉛直下向きにするため、逆回転して描画
  ctx.restore()

  // 逆回転後のワールド座標でおもりの中心位置を計算
  const cosA = Math.cos(angle.value)
  const sinA = Math.sin(angle.value)
  const wX1 = cx + x1 * cosA - (-8) * sinA
  const wY1 = cy + x1 * sinA + (-8) * cosA
  const wX2 = cx + x2 * cosA - (-8) * sinA
  const wY2 = cy + x2 * sinA + (-8) * cosA

  // 左の重力矢印
  const arrLen1 = Math.min(70, 20 + m1.value * 5)
  arrow(ctx, wX1, wY1, wX1, wY1 + arrLen1, { color: '#f59e0b', width: 2.5, head: 8 })
  text(ctx, `m₁g = ${(m1.value * g).toFixed(0)} N`, wX1 - 10, wY1 + arrLen1 + 14, { align: 'right', color: '#f59e0b', font: 'bold 11px sans-serif' })

  // 右の重力矢印
  const arrLen2 = Math.min(70, 20 + m2.value * 5)
  arrow(ctx, wX2, wY2, wX2, wY2 + arrLen2, { color: '#38bdf8', width: 2.5, head: 8 })
  text(ctx, `m₂g = ${(m2.value * g).toFixed(0)} N`, wX2 + 10, wY2 + arrLen2 + 14, { align: 'left', color: '#38bdf8', font: 'bold 11px sans-serif' })

  // 腕の長さの寸法線
  line(ctx, cx, cy - 35, cx - d1.value * pxPerM, cy - 35, { color: 'rgba(245,158,11,0.6)', width: 1.5, dash: [4, 4] })
  text(ctx, `d₁ = ${d1.value.toFixed(1)} m`, cx - (d1.value * pxPerM) / 2, cy - 42, { color: '#f59e0b', font: '11px sans-serif' })

  line(ctx, cx, cy - 35, cx + d2.value * pxPerM, cy - 35, { color: 'rgba(56,189,248,0.6)', width: 1.5, dash: [4, 4] })
  text(ctx, `d₂ = ${d2.value.toFixed(1)} m`, cx + (d2.value * pxPerM) / 2, cy - 42, { color: '#38bdf8', font: '11px sans-serif' })

  // モーメントバランスバー（上部中央）
  drawBalanceMeter(ctx, cx, 40, tauLeft.value, tauRight.value)
}

// モーメント比較メーター
function drawBalanceMeter(ctx, cx, cy, lVal, rVal) {
  const barW = 260
  const barH = 16
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(cx - barW / 2, cy - barH / 2, barW, barH)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.strokeRect(cx - barW / 2, cy - barH / 2, barW, barH)

  const total = lVal + rVal
  const ratio = total > 0 ? lVal / total : 0.5
  const splitX = cx - barW / 2 + barW * ratio

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(cx - barW / 2, cy - barH / 2, barW * ratio, barH)
  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(splitX, cy - barH / 2, barW * (1 - ratio), barH)

  // 中央インジケータ
  line(ctx, cx, cy - 14, cx, cy + 14, { color: '#fff', width: 2 })
  text(ctx, '↺ 反時計 M₁', cx - barW / 2 - 10, cy + 4, { align: 'right', color: '#f59e0b', font: 'bold 11px sans-serif' })
  text(ctx, '時計 M₂ ↻', cx + barW / 2 + 10, cy + 4, { align: 'left', color: '#38bdf8', font: 'bold 11px sans-serif' })
}

// はしごの描画
function drawLadder(ctx, w, h, dt) {
  const wallX = w * 0.28
  const floorY = h * 0.78
  const ladderLen = Math.min(w * 0.5, h * 0.6)

  // 1. 壁と床の描画
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, wallX, floorY) // 壁の左側
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, floorY, w, h - floorY) // 床

  // 壁面（なめらか・水色ライン）
  line(ctx, wallX, 40, wallX, floorY, { color: '#38bdf8', width: 4 })
  text(ctx, 'なめらかな壁 (摩擦なし)', wallX - 10, 60, { align: 'right', color: '#38bdf8', font: '11px sans-serif' })

  // 床面（あらい・黄色点線模様）
  line(ctx, wallX, floorY, w - 40, floorY, { color: '#f59e0b', width: 4 })
  text(ctx, `あらい床 (静止摩擦係数 μ = ${muS.value.toFixed(2)})`, w - 50, floorY + 22, { align: 'right', color: '#f59e0b', font: '11px sans-serif' })

  // 2. はしごの位置計算
  const rad = ladderThetaRad.value
  const topX = wallX
  const topY = floorY - ladderLen * Math.sin(rad)
  const botX = wallX + ladderLen * Math.cos(rad)
  const botY = floorY

  // はしごの棒
  ctx.strokeStyle = isLadderSafe.value ? '#e2e8f0' : '#ef4444'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  line(ctx, botX, botY, topX, topY, { color: isLadderSafe.value ? '#cbd5e1' : '#ef4444', width: 8 })

  // はしごの横桟（ステップ）
  const steps = 7
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const sx = botX + (topX - botX) * t
    const sy = botY + (topY - botY) * t
    dot(ctx, sx, sy, 3, '#64748b')
  }

  // 棒の重心（中央）
  const midX = (botX + topX) / 2
  const midY = (botY + topY) / 2
  dot(ctx, midX, midY, 5, '#10b981', '#fff', 1.5)
  // 棒の重力矢印 Mg
  arrow(ctx, midX, midY, midX, midY + 45, { color: '#10b981', width: 2, head: 7 })
  text(ctx, `Mg = ${(ladderM.value * g).toFixed(0)} N`, midX + 8, midY + 35, { align: 'left', color: '#10b981', font: '11px sans-serif' })

  // 登る人の位置
  if (climberM.value > 0) {
    const px = botX + (topX - botX) * climberPos.value
    const py = botY + (topY - botY) * climberPos.value
    dot(ctx, px, py, 9, '#f59e0b', '#fff', 2)
    // 人の重力矢印 mg
    const pArrLen = Math.min(65, 20 + climberM.value * 0.6)
    arrow(ctx, px, py, px, py + pArrLen, { color: '#f59e0b', width: 2.5, head: 7 })
    text(ctx, `mg = ${(climberM.value * g).toFixed(0)} N`, px + 10, py + pArrLen, { align: 'left', color: '#f59e0b', font: 'bold 11px sans-serif' })
    text(ctx, '人', px - 12, py - 6, { align: 'right', color: '#f59e0b', font: '11px sans-serif' })
  }

  // 壁からの垂直抗力 N_A（点A：top）
  arrow(ctx, topX, topY, topX + 50, topY, { color: '#38bdf8', width: 2.5, head: 7 })
  text(ctx, `N_A = ${reqFriction.value.toFixed(1)} N`, topX + 55, topY - 6, { align: 'left', color: '#38bdf8', font: 'bold 11px sans-serif' })

  // 床からの垂直抗力 N_B（点B：bot）
  arrow(ctx, botX, botY, botX, botY - 60, { color: '#a855f7', width: 2.5, head: 7 })
  text(ctx, `N_B = ${normalFloorNB.value.toFixed(1)} N`, botX + 8, botY - 45, { align: 'left', color: '#a855f7', font: 'bold 11px sans-serif' })

  // 床からの静止摩擦力 f（左向き：壁へ向かう向き）
  const fArrLen = Math.min(60, reqFriction.value * 0.3)
  arrow(ctx, botX, botY, botX - fArrLen, botY, { color: isLadderSafe.value ? '#f59e0b' : '#ef4444', width: 2.5, head: 7 })
  text(ctx, `f = ${reqFriction.value.toFixed(1)} N`, botX - fArrLen - 8, botY + 16, { align: 'right', color: isLadderSafe.value ? '#f59e0b' : '#ef4444', font: 'bold 11px sans-serif' })

  // 角度 θ の円弧表示
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(botX, botY, 40, Math.PI, Math.PI - rad, true)
  ctx.stroke()
  text(ctx, `θ = ${thetaDeg.value}°`, botX - 52, botY - 12, { align: 'center', color: '#e2e8f0', font: 'bold 11px sans-serif' })

  // 警告バナー（スリップ時）
  if (!isLadderSafe.value) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.fillRect(w * 0.35, 20, w * 0.45, 40)
    ctx.strokeRect(w * 0.35, 20, w * 0.45, 40)
    text(ctx, '⚠️ 摩擦限界超過：はしごが足元から滑り落ちます！', w * 0.575, 45, { color: '#fca5a5', font: 'bold 13px sans-serif' })
  }
}
</script>
