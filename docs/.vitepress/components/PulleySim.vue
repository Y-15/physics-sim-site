<template>
  <div class="lab" style="--ac:#6366f1;--ac2:#ec4899">
    <div class="lab-head">
      <span class="lab-title">⚙️ 運動の法則・連結物体と滑車（アトウッドの器械）実験室</span>
      <span class="lab-badge">{{ configMode === 'atwood' ? '鉛直アトウッド器械' : '斜面＋吊り下げ連結' }}</span>
    </div>

    <!-- モード切替タブ -->
    <div class="mode-tabs-bar">
      <button class="lab-btn" :class="{ 'lab-btn-pri': configMode === 'atwood' }" @click="configMode = 'atwood'; reset()">
        ⚖️ 鉛直アトウッドの器械 (2物体吊り下げ)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': configMode === 'incline' }" @click="configMode = 'incline'; reset()">
        📐 斜面上の物体 ＋ 吊り下げ物体
      </button>
    </div>

    <!-- 再生コントロールバー -->
    <div class="playback-bar">
      <button class="lab-btn primary" @click="toggleRun" style="padding: 6px 16px; font-weight: 700; border-radius: 8px; cursor: pointer;">
        {{ running ? '⏸️ 一時停止' : (Math.abs(posOffset) >= maxLimit ? '🔄 最初から再生' : '▶️ 運動開始') }}
      </button>
      <div class="speed-control-group">
        <span class="speed-label">⏱️ 速度:</span>
        <div class="speed-btn-group">
          <button :class="{ active: timeScale === 0.3 }" @click="timeScale = 0.3">🐢 0.3x (スロー)</button>
          <button :class="{ active: timeScale === 0.6 }" @click="timeScale = 0.6">🎯 0.6x (推奨)</button>
          <button :class="{ active: timeScale === 1.0 }" @click="timeScale = 1.0">1.0x (標準)</button>
        </div>
      </div>
      <button class="lab-btn" @click="stepSim(0.04)" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        ⏭ コマ送り (+0.04s)
      </button>
      <button class="lab-btn" @click="reset" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
        🔄 初期位置にリセット
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div class="lab-ctrl">
        <label><span>物体 A の質量 M:</span> <strong>{{ massA.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="massA" min="1.0" max="8.0" step="0.5" />
      </div>

      <div class="lab-ctrl">
        <label><span>物体 B の質量 m:</span> <strong>{{ massB.toFixed(1) }} kg</strong></label>
        <input type="range" v-model.number="massB" min="1.0" max="8.0" step="0.5" />
      </div>

      <div v-if="configMode === 'incline'" class="lab-ctrl">
        <label><span>斜面の傾斜角 θ:</span> <strong>{{ inclineDeg }}°</strong></label>
        <input type="range" v-model.number="inclineDeg" min="15" max="60" step="5" />
      </div>

      <div v-if="configMode === 'incline'" class="lab-ctrl">
        <label><span>斜面の動摩擦係数 μₖ:</span> <strong>{{ muK.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="muK" min="0.0" max="0.4" step="0.05" />
      </div>

      <div class="lab-ctrl">
        <label><span>クイックプリセット:</span></label>
        <div class="lab-row">
          <button class="lab-chip" v-if="configMode === 'atwood'" :class="{ on: massA === massB }" @click="massA = 3.0; massB = 3.0; reset()">つり合い (M = m)</button>
          <button class="lab-chip" v-if="configMode === 'atwood'" :class="{ on: massA > massB }" @click="massA = 5.0; massB = 2.0; reset()">Aが加速下降 (M > m)</button>
          <button class="lab-chip" v-if="configMode === 'atwood'" :class="{ on: massA < massB }" @click="massA = 2.0; massB = 5.0; reset()">Bが加速下降 (M < m)</button>
          <button class="lab-chip" v-if="configMode === 'incline'" @click="massA = 4.0; massB = 3.0; inclineDeg = 30; muK = 0.1; reset()">Bが引き下げ下降</button>
          <button class="lab-chip" v-if="configMode === 'incline'" @click="massA = 6.0; massB = 1.5; inclineDeg = 45; muK = 0.05; reset()">Aが斜面を滑降</button>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">生じる加速度 a</div>
        <div class="v" style="color:#6366f1">{{ Math.abs(curAcc).toFixed(2) }} <small>m/s²</small></div>
        <div class="f" v-if="configMode === 'atwood'">
          a = (M − m) / (M + m) · g
        </div>
        <div class="f" v-else>
          a = (mg − Mg sinθ − f') / (M + m)
        </div>
      </div>

      <div class="lab-stat">
        <div class="k">糸の張力 T</div>
        <div class="v" style="color:#ec4899">{{ curTension.toFixed(1) }} <small>N</small></div>
        <div class="f" v-if="configMode === 'atwood'">
          T = 2Mm / (M + m) · g
        </div>
        <div class="f" v-else>
          T = m(g − a)
        </div>
      </div>

      <div class="lab-stat">
        <div class="k">現在の速さ v</div>
        <div class="v" style="color:#38bdf8">{{ Math.abs(curSpeed).toFixed(2) }} <small>m/s</small></div>
        <div class="f">v = at</div>
      </div>

      <div class="lab-stat">
        <div class="k">運動の向き</div>
        <div class="v" style="color:#10b981">{{ motionDirectionText }}</div>
        <div class="f">糸の全長は常に一定保存！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const g = 9.8
const configMode = ref('atwood') // 'atwood' or 'incline'

const massA = ref(4.0) // kg
const massB = ref(2.0) // kg
const inclineDeg = ref(30) // deg
const muK = ref(0.1) // 動摩擦係数

const running = ref(false)
const timeScale = ref(0.6)
const posOffset = ref(0) // 移動変位 m (Bの下降向き正)
const curSpeed = ref(0) // m/s

function reset() {
  running.value = false
  posOffset.value = 0
  curSpeed.value = 0
}

watch([massA, massB, inclineDeg, muK], () => {
  reset()
})

// 物理計算
// 1. アトウッド器械:
// A (M) 鉛直下向き, B (m) 鉛直下向き
// M a = M g - T (A 下向き正)
// m a = T - m g (B 上向き正)
// a_A = (M - m)/(M + m) * g
// posOffset は A が下降する向きを正と定義する
const curAcc = computed(() => {
  const M = massA.value
  const m = massB.value

  if (configMode.value === 'atwood') {
    return ((M - m) / (M + m)) * g
  }

  // incline:
  // 斜面上の物体 A (M), 鉛直吊り下げ物体 B (m)
  // B が下降する向きを正 (a > 0) とすると:
  // B の運動方程式: m a = m g - T
  // A の運動方程式: M a = T - M g sinθ - f'
  // 合成: (M + m) a = m g - M g sinθ - f'
  const rad = (inclineDeg.value * Math.PI) / 180
  const gravAlong = M * g * Math.sin(rad)
  const normN = M * g * Math.cos(rad)
  const fFric = muK.value * normN

  // 1) B が下降（A が斜面を登る）
  const netDownB = m * g - gravAlong - fFric
  if (netDownB > 0) {
    return netDownB / (M + m)
  }

  // 2) A が滑降（B が吊り上げられる）
  const netDownA = gravAlong - m * g - fFric
  if (netDownA > 0) {
    return -netDownA / (M + m)
  }

  // 3) 摩擦により静止
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

const motionDirectionText = computed(() => {
  if (configMode.value === 'atwood') {
    if (massA.value > massB.value) return 'Aが下降、Bが上昇'
    if (massA.value < massB.value) return 'Bが下降、Aが上昇'
    return '完全につり合い静止'
  }
  if (curAcc.value > 0.05) return 'Bが下降（Aが斜面を登る）'
  if (curAcc.value < -0.05) return 'Aが滑降（Bが吊り上がる）'
  return '摩擦力により静止（つり合い）'
})

const canvasRef = ref(null)

const maxLimit = computed(() => configMode.value === 'atwood' ? 0.9 : 1.0)

function toggleRun() {
  if (!running.value && Math.abs(posOffset.value) >= maxLimit.value - 0.01) {
    posOffset.value = 0
    curSpeed.value = 0
  }
  running.value = !running.value
}

function stepSim(delta = 0.04) {
  updateMotion(delta)
}

function updateMotion(dt) {
  if (Math.abs(curAcc.value) < 0.01) return
  curSpeed.value += curAcc.value * dt
  posOffset.value += curSpeed.value * dt

  // 移動限界の判定（床面や滑車への衝突の手前で停止）
  const limit = maxLimit.value
  if (Math.abs(posOffset.value) >= limit) {
    posOffset.value = Math.sign(posOffset.value) * limit
    curSpeed.value = 0
    running.value = false
  }
}

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  // 運動積分
  if (running.value) {
    const safeDt = Math.min(dt, 0.04) * timeScale.value
    updateMotion(safeDt)
  }

  if (configMode.value === 'atwood') {
    drawAtwood(ctx, width, height)
  } else {
    drawIncline(ctx, width, height)
  }
})

function drawAtwood(ctx, w, h) {
  const cx = w * 0.5
  const topY = 54
  const pulleyR = 32
  const pxPerM = 50
  const floorY = h - 22

  // 床面
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - 180, floorY)
  ctx.lineTo(cx + 180, floorY)
  ctx.stroke()
  for (let x = cx - 170; x < cx + 180; x += 16) {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x - 8, floorY + 10); ctx.stroke()
  }

  // 天井ブラケットと滑車支柱
  line(ctx, cx - 60, 14, cx + 60, 14, { color: '#64748b', width: 4 })
  line(ctx, cx, 14, cx, topY, { color: '#94a3b8', width: 4 })

  // 定滑車
  dot(ctx, cx, topY, pulleyR, '#1e293b', '#38bdf8', 2.5)
  dot(ctx, cx, topY, 5, '#f59e0b', '#fff', 1.5)

  // 糸の左右位置
  const leftX = cx - pulleyR
  const rightX = cx + pulleyR
  const baseLen = 104 // 初期吊り下げ長 [px]

  // 物体サイズ
  const sizeA = Math.min(44, 26 + massA.value * 2.5)
  const sizeB = Math.min(44, 26 + massB.value * 2.5)

  // 変位 s (posOffset: Aが下降する向き正)
  // 軽くて伸びない糸の条件: L_A + L_B = 2 * baseLen (常に一定！)
  const s = posOffset.value * pxPerM
  const lenA = baseLen + s
  const lenB = baseLen - s
  const yA = topY + lenA
  const yB = topY + lenB

  // 糸の描画（滑車上部円弧 + 左右の吊り下げ直線）
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(cx, topY, pulleyR, Math.PI, 0)
  ctx.stroke()
  line(ctx, leftX, topY, leftX, yA, { color: '#cbd5e1', width: 2.5 })
  line(ctx, rightX, topY, rightX, yB, { color: '#cbd5e1', width: 2.5 })

  // 物体 A (左)
  ctx.fillStyle = '#6366f1'
  ctx.fillRect(leftX - sizeA / 2, yA, sizeA, sizeA)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(leftX - sizeA / 2, yA, sizeA, sizeA)
  text(ctx, `A: ${massA.value.toFixed(1)}kg`, leftX, yA + sizeA / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif', align: 'center' })

  // 力の矢印 (A): 重力 Mg (下), 張力 T (上)
  arrow(ctx, leftX, yA + sizeA, leftX, yA + sizeA + 38, { color: '#6366f1', width: 2.5, head: 6 })
  text(ctx, `Mg = ${(massA.value * g).toFixed(0)}N`, leftX - 10, yA + sizeA + 24, { align: 'right', color: '#818cf8', font: 'bold 10px sans-serif' })

  arrow(ctx, leftX, yA, leftX, yA - 34, { color: '#ec4899', width: 2.5, head: 6 })
  text(ctx, `T = ${curTension.value.toFixed(0)}N`, leftX - 10, yA - 16, { align: 'right', color: '#ec4899', font: 'bold 10px sans-serif' })

  // 物体 B (右)
  ctx.fillStyle = '#ec4899'
  ctx.fillRect(rightX - sizeB / 2, yB, sizeB, sizeB)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(rightX - sizeB / 2, yB, sizeB, sizeB)
  text(ctx, `B: ${massB.value.toFixed(1)}kg`, rightX, yB + sizeB / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif', align: 'center' })

  // 力の矢印 (B): 重力 mg (下), 張力 T (上)
  arrow(ctx, rightX, yB + sizeB, rightX, yB + sizeB + 38, { color: '#ec4899', width: 2.5, head: 6 })
  text(ctx, `mg = ${(massB.value * g).toFixed(0)}N`, rightX + 10, yB + sizeB + 24, { align: 'left', color: '#f472b6', font: 'bold 10px sans-serif' })

  arrow(ctx, rightX, yB, rightX, yB - 34, { color: '#ec4899', width: 2.5, head: 6 })
  text(ctx, `T = ${curTension.value.toFixed(0)}N`, rightX + 10, yB - 16, { align: 'left', color: '#ec4899', font: 'bold 10px sans-serif' })
}

function drawIncline(ctx, w, h) {
  const rad = (inclineDeg.value * Math.PI) / 180
  const floorY = h - 45
  const startX = w * 0.12
  const inclineLen = w * 0.52
  const pulleyR = 16
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

  // 地面
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(startX - 30, floorY)
  ctx.lineTo(w - 30, floorY)
  ctx.stroke()

  // 角度ラベル
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(startX, floorY, 36, 0, -rad, true)
  ctx.stroke()
  text(ctx, `θ = ${inclineDeg.value}°`, startX + 48, floorY - 12, { color: '#94a3b8', font: '11px sans-serif' })

  // 2. 頂点の滑車
  dot(ctx, pulleyX, pulleyY, pulleyR, '#1e293b', '#38bdf8', 2.5)
  dot(ctx, pulleyX, pulleyY, 4, '#f59e0b')

  // 物体サイズ
  const sizeA = Math.min(46, 26 + massA.value * 3)
  const sizeB = Math.min(46, 26 + massB.value * 3)

  // 3. 幾何・ひもの不伸長条件（L = L_A + L_B = 一定！）
  // posOffset: B が下降する向きを正とする
  const pxPerM = 65
  const s = posOffset.value * pxPerM

  // 初期状態:
  // 物体Aは斜面中央付近 (baseDistOnIncline)
  // 物体Bの吊り下げ長 (baseHangDist)
  const baseDistOnIncline = inclineLen * 0.48
  const baseHangDist = 85

  // ★物理的に正しいひもの拘束条件★
  // B が下降する（s > 0）とき、Bの吊り下げ長 hangDist は伸びる (baseHangDist + s)
  // 一方、A は滑車に向かって斜面を「登る」ため、底面からの距離 distA は増加し (baseDistOnIncline + s)、
  // 滑車からAまでのひもの長さ (inclineLen - distA) は縮む！
  // 逆に A が滑り降りる（s < 0）とき、distA は減少し、hangDist は縮んでBが引き上げられる！
  // これにより 斜面上のひも長 + 鉛直吊り下げひも長 = 一定 が厳密に保証される。
  const distA = baseDistOnIncline + s
  const hangDist = baseHangDist + s

  // 物体 A の座標（斜面上）
  const objAX = startX + distA * Math.cos(rad)
  const objAY = floorY - distA * Math.sin(rad)

  // 物体 B の座標（鉛直吊り下げ）
  const hangX = pulleyX + pulleyR
  const objBY = pulleyY + hangDist

  // 糸の描画
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2.5
  ctx.beginPath()

  // 斜面上物体 A の上端面中心 (滑車を向く面)
  const attachAX = objAX + (sizeA / 2) * Math.cos(rad) - (sizeA / 2) * Math.sin(rad)
  const attachAY = objAY - (sizeA / 2) * Math.sin(rad) - (sizeA / 2) * Math.cos(rad)

  // 滑車接線位置（斜面方向）
  const tangentX = pulleyX - pulleyR * Math.sin(rad)
  const tangentY = pulleyY - pulleyR * Math.cos(rad)

  ctx.moveTo(attachAX, attachAY)
  ctx.lineTo(tangentX, tangentY)

  // 滑車円弧巻き付き (tangentX, tangentY) から (hangX, pulleyY)
  const startAng = -Math.PI / 2 - rad
  ctx.arc(pulleyX, pulleyY, pulleyR, startAng, 0, false)

  // 鉛直吊り下げ糸
  ctx.lineTo(hangX, objBY)
  ctx.stroke()

  // 4. 物体 A の描画（斜面傾きに合わせて回転）
  ctx.save()
  ctx.translate(objAX, objAY)
  ctx.rotate(-rad)

  ctx.fillStyle = '#6366f1'
  ctx.fillRect(-sizeA / 2, -sizeA, sizeA, sizeA)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(-sizeA / 2, -sizeA, sizeA, sizeA)
  text(ctx, `A: ${massA.value.toFixed(1)}kg`, 0, -sizeA / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif', align: 'center' })

  // 物体 A の力ベクトル
  // 張力 T (斜面上向き)
  arrow(ctx, sizeA / 2, -sizeA / 2, sizeA / 2 + 35, -sizeA / 2, { color: '#ec4899', width: 2.2, head: 5 })
  text(ctx, `T=${curTension.value.toFixed(0)}N`, sizeA / 2 + 4, -sizeA / 2 - 8, { color: '#ec4899', font: 'bold 10px sans-serif' })

  // 重力成分 Mg sinθ (斜面下向き)
  const gravAlong = massA.value * g * Math.sin(rad)
  arrow(ctx, -sizeA / 2, -sizeA / 2, -sizeA / 2 - 30, -sizeA / 2, { color: '#818cf8', width: 2.2, head: 5 })
  text(ctx, `${gravAlong.toFixed(0)}N`, -sizeA / 2 - 28, -sizeA / 2 - 8, { color: '#818cf8', font: 'bold 9px sans-serif' })

  ctx.restore()

  // 5. 物体 B の描画（鉛直吊り下げ）
  ctx.fillStyle = '#ec4899'
  ctx.fillRect(hangX - sizeB / 2, objBY, sizeB, sizeB)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(hangX - sizeB / 2, objBY, sizeB, sizeB)
  text(ctx, `B: ${massB.value.toFixed(1)}kg`, hangX, objBY + sizeB / 2 + 4, { color: '#fff', font: 'bold 11px sans-serif', align: 'center' })

  // 物体 B の力ベクトル
  // 重力 mg (鉛直下向き)
  arrow(ctx, hangX, objBY + sizeB, hangX, objBY + sizeB + 34, { color: '#ec4899', width: 2.2, head: 6 })
  text(ctx, `mg = ${(massB.value * g).toFixed(0)}N`, hangX + 10, objBY + sizeB + 20, { align: 'left', color: '#f472b6', font: 'bold 10px sans-serif' })

  // 張力 T (鉛直上向き)
  arrow(ctx, hangX, objBY, hangX, objBY - 32, { color: '#ec4899', width: 2.2, head: 6 })
  text(ctx, `T = ${curTension.value.toFixed(0)}N`, hangX + 10, objBY - 16, { align: 'left', color: '#ec4899', font: 'bold 10px sans-serif' })
}
</script>

<style scoped>
.mode-tabs-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--vp-c-divider);
}

.playback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.speed-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.speed-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
}

.speed-btn-group {
  display: flex;
  gap: 4px;
}

.speed-btn-group button {
  padding: 3px 8px;
  font-size: 0.75rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;
}

.speed-btn-group button:hover {
  color: #ffffff;
}

.speed-btn-group button.active {
  background: #6366f1;
  color: #ffffff;
  border-color: #818cf8;
}

.lab-ctrl label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.lab-ctrl label strong {
  color: #818cf8;
}

.lab-chip {
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s;
}

.lab-chip:hover {
  border-color: #6366f1;
  color: #ffffff;
}

.lab-chip.on {
  background: rgba(99, 102, 241, 0.18);
  border-color: #6366f1;
  color: #818cf8;
}
</style>
