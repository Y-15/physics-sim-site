<template>
  <div class="circuit-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>⚡ 直流回路・キルヒホッフ・非オーム抵抗シミュレーター</h3>
        <span class="badge">DC Circuit &amp; Kirchhoff</span>
      </div>
      <p class="desc">
        キルヒホッフの法則による回路網解析、電球の非線形 $I$-$V$ 特性と負荷線のリアルタイム作図、ホイートストンブリッジの平衡条件を直感的に探究できます。
      </p>
    </div>

    <!-- モード選択タブ -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'kirchhoff' }" @click="mode = 'kirchhoff'">
        ① キルヒホッフの法則 (2電源回路)
      </button>
      <button :class="{ active: mode === 'nonOhmic' }" @click="mode = 'nonOhmic'">
        ② 非オーム抵抗と負荷線作図
      </button>
      <button :class="{ active: mode === 'bridge' }" @click="mode = 'bridge'">
        ③ ホイートストンブリッジ
      </button>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <!-- モード1: キルヒホッフ -->
      <div v-if="mode === 'kirchhoff'" class="controls-grid">
        <div class="control-group">
          <label>起電力 $E_1$: <strong>{{ E1 }} V</strong></label>
          <input type="range" v-model.number="E1" min="0" max="24" step="1" />
        </div>
        <div class="control-group">
          <label>起電力 $E_2$: <strong>{{ E2 }} V</strong></label>
          <input type="range" v-model.number="E2" min="0" max="24" step="1" />
        </div>
        <div class="control-group">
          <label>抵抗 $R_1$: <strong>{{ R1 }} $\Omega$</strong></label>
          <input type="range" v-model.number="R1" min="1" max="20" step="1" />
        </div>
        <div class="control-group">
          <label>抵抗 $R_2$: <strong>{{ R2 }} $\Omega$</strong></label>
          <input type="range" v-model.number="R2" min="1" max="20" step="1" />
        </div>
        <div class="control-group">
          <label>中央抵抗 $R_3$: <strong>{{ R3 }} $\Omega$</strong></label>
          <input type="range" v-model.number="R3" min="1" max="20" step="1" />
        </div>
      </div>

      <!-- モード2: 非オーム抵抗 -->
      <div v-if="mode === 'nonOhmic'" class="controls-grid">
        <div class="control-group">
          <label>電源起電力 $E$: <strong>{{ nonOhmicE }} V</strong></label>
          <input type="range" v-model.number="nonOhmicE" min="2" max="20" step="0.5" />
        </div>
        <div class="control-group">
          <label>直列抵抗 $R$: <strong>{{ nonOhmicR }} $\Omega$</strong></label>
          <input type="range" v-model.number="nonOhmicR" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>電球特性係数 $k$ ($I=k\sqrt{V}$): <strong>{{ nonOhmicK }}</strong></label>
          <input type="range" v-model.number="nonOhmicK" min="0.2" max="1.5" step="0.1" />
        </div>
      </div>

      <!-- モード3: ホイートストンブリッジ -->
      <div v-if="mode === 'bridge'" class="controls-grid">
        <div class="control-group">
          <label>電源電圧 $E$: <strong>{{ bridgeE }} V</strong></label>
          <input type="range" v-model.number="bridgeE" min="2" max="20" step="1" />
        </div>
        <div class="control-group">
          <label>抵抗 $R_1$: <strong>{{ bridgeR1 }} $\Omega$</strong></label>
          <input type="range" v-model.number="bridgeR1" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>可変抵抗 $R_2$: <strong>{{ bridgeR2 }} $\Omega$</strong></label>
          <input type="range" v-model.number="bridgeR2" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>抵抗 $R_3$: <strong>{{ bridgeR3 }} $\Omega$</strong></label>
          <input type="range" v-model.number="bridgeR3" min="2" max="30" step="1" />
        </div>
        <div class="control-group">
          <label>抵抗 $R_4$ (未知/調整): <strong>{{ bridgeR4 }} $\Omega$</strong></label>
          <input type="range" v-model.number="bridgeR4" min="2" max="30" step="1" />
        </div>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <template v-if="mode === 'kirchhoff'">
        <div class="stat-card">
          <span class="label">枝1の電流 $I_1$</span>
          <span class="val highlight">{{ fmt(kRes.I1, 3) }} A</span>
        </div>
        <div class="stat-card">
          <span class="label">枝2の電流 $I_2$</span>
          <span class="val">{{ fmt(kRes.I2, 3) }} A</span>
        </div>
        <div class="stat-card">
          <span class="label">中央電流 $I_3 = I_1+I_2$</span>
          <span class="val highlight-alt">{{ fmt(kRes.I3, 3) }} A</span>
        </div>
        <div class="stat-card">
          <span class="label">中央接続点電位 $V_P$</span>
          <span class="val">{{ fmt(kRes.VP, 2) }} V</span>
        </div>
      </template>

      <template v-if="mode === 'nonOhmic'">
        <div class="stat-card">
          <span class="label">動作点電圧 $V_L$ (電球)</span>
          <span class="val highlight">{{ fmt(noRes.V, 2) }} V</span>
        </div>
        <div class="stat-card">
          <span class="label">動作点電流 $I_L$</span>
          <span class="val highlight-alt">{{ fmt(noRes.I, 3) }} A</span>
        </div>
        <div class="stat-card">
          <span class="label">電球消費電力 $P = V_L I_L$</span>
          <span class="val">{{ fmt(noRes.P, 2) }} W</span>
        </div>
        <div class="stat-card">
          <span class="label">負荷線の傾き $-1/R$</span>
          <span class="val">-{{ fmt(1 / nonOhmicR, 3) }} $\Omega^{-1}$</span>
        </div>
      </template>

      <template v-if="mode === 'bridge'">
        <div class="stat-card">
          <span class="label">電位 $V_C$ (上中点)</span>
          <span class="val">{{ fmt(brRes.VC, 2) }} V</span>
        </div>
        <div class="stat-card">
          <span class="label">電位 $V_D$ (下中点)</span>
          <span class="val">{{ fmt(brRes.VD, 2) }} V</span>
        </div>
        <div class="stat-card">
          <span class="label">電位差 $\Delta V = V_C - V_D$</span>
          <span class="val highlight">{{ fmt(brRes.dVD, 3) }} V</span>
        </div>
        <div class="stat-card">
          <span class="label">平衡状態 ($R_1 R_4 = R_2 R_3$)</span>
          <span class="val" :class="{ 'is-balanced': brRes.balanced }">
            {{ brRes.balanced ? '✓ 平衡達成 (I_G = 0)' : '× 不平衡' }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, dot, text, line, arrow, useLoop, fmt } from './simUtils'

const canvasRef = ref(null)
const mode = ref('kirchhoff')

// モード1: キルヒホッフ
const E1 = ref(12)
const E2 = ref(6)
const R1 = ref(4)
const R2 = ref(6)
const R3 = ref(3)

// モード2: 非オーム抵抗
const nonOhmicE = ref(10)
const nonOhmicR = ref(10)
const nonOhmicK = ref(0.6)

// モード3: ホイートストンブリッジ
const bridgeE = ref(10)
const bridgeR1 = ref(10)
const bridgeR2 = ref(15)
const bridgeR3 = ref(8)
const bridgeR4 = ref(12)

// 電荷アニメーション用時間
let animPhase = 0

// 計算: キルヒホッフ
// ノードPの電位 VP:
// (E1 - VP)/R1 + (E2 - VP)/R2 = VP/R3
// VP (1/R1 + 1/R2 + 1/R3) = E1/R1 + E2/R2
const kRes = computed(() => {
  const G1 = 1 / R1.value
  const G2 = 1 / R2.value
  const G3 = 1 / R3.value
  const VP = (E1.value * G1 + E2.value * G2) / (G1 + G2 + G3)
  const I1 = (E1.value - VP) * G1
  const I2 = (E2.value - VP) * G2
  const I3 = VP * G3
  return { VP, I1, I2, I3 }
})

// 計算: 非オーム抵抗
// I = k * sqrt(V)
// V = E - R * I  =>  V + R * k * sqrt(V) - E = 0
// Let u = sqrt(V) >= 0 => u^2 + R*k*u - E = 0
// u = ( -R*k + sqrt((R*k)^2 + 4*E) ) / 2
const noRes = computed(() => {
  const E = nonOhmicE.value
  const R = nonOhmicR.value
  const k = nonOhmicK.value
  const b = R * k
  const disc = b * b + 4 * E
  const u = (-b + Math.sqrt(disc)) / 2
  const V = u * u
  const I = k * u
  const P = V * I
  return { V, I, P }
})

// 計算: ブリッジ
const brRes = computed(() => {
  const E = bridgeE.value
  const r1 = bridgeR1.value
  const r2 = bridgeR2.value
  const r3 = bridgeR3.value
  const r4 = bridgeR4.value
  // 電源の負極を0Vとする
  // 左上C点の電位 (R1とR2の分圧): VC = E * (r2 / (r1 + r2))
  const VC = E * (r2 / (r1 + r2))
  // 左下D点の電位 (R3とR4の分圧): VD = E * (r4 / (r3 + r4))
  const VD = E * (r4 / (r3 + r4))
  const dVD = VC - VD
  const ratio1 = r1 * r4
  const ratio2 = r2 * r3
  const balanced = Math.abs(ratio1 - ratio2) < 0.001
  return { VC, VD, dVD, balanced }
})

// ループ処理
useLoop((dt) => {
  animPhase += dt * 3
  const canvas = canvasRef.value
  if (!canvas) return
  const w = 780
  const h = 420
  const ctx = setupCanvas(canvas, w, h)
  clearGrid(ctx, w, h, 30, '#09090b')

  if (mode.value === 'kirchhoff') {
    drawKirchhoff(ctx, w, h)
  } else if (mode.value === 'nonOhmic') {
    drawNonOhmic(ctx, w, h)
  } else if (mode.value === 'bridge') {
    drawBridge(ctx, w, h)
  }
})

// -------------------------------------------------------------------
// 描画: キルヒホッフ (2電源回路)
// -------------------------------------------------------------------
function drawKirchhoff(ctx, w, h) {
  const { VP, I1, I2, I3 } = kRes.value

  // 回路座標
  const xLeft = 140
  const xMid = 390
  const xRight = 640
  const yTop = 90
  const yBottom = 330

  // 外枠・配線を描画
  ctx.strokeStyle = '#52525b'
  ctx.lineWidth = 3
  ctx.beginPath()
  // 左ループ
  ctx.moveTo(xLeft, yBottom)
  ctx.lineTo(xLeft, yTop)
  ctx.lineTo(xMid, yTop)
  ctx.lineTo(xMid, yBottom)
  ctx.lineTo(xLeft, yBottom)
  // 右ループ
  ctx.moveTo(xMid, yTop)
  ctx.lineTo(xRight, yTop)
  ctx.lineTo(xRight, yBottom)
  ctx.lineTo(xMid, yBottom)
  ctx.stroke()

  // 素子シンボルを描画
  // 左枝: 電源 E1 (左縦線の中央)
  drawBattery(ctx, xLeft, 210, E1.value, 'E₁')
  // 左上枝: 抵抗 R1
  drawResistor(ctx, (xLeft + xMid) / 2, yTop, R1.value, 'R₁', true)

  // 右枝: 電源 E2 (右縦線の中央)
  drawBattery(ctx, xRight, 210, E2.value, 'E₂')
  // 右上枝: 抵抗 R2
  drawResistor(ctx, (xMid + xRight) / 2, yTop, R2.value, 'R₂', true)

  // 中央枝: 抵抗 R3 (中央縦線の中央)
  drawResistor(ctx, xMid, 210, R3.value, 'R₃', false)

  // 接地点 (下部レールを 0V 接地とする)
  drawGround(ctx, xMid, yBottom)

  // ノード P (中央上の分岐点)
  dot(ctx, xMid, yTop, 6, '#38bdf8', '#0284c7')
  text(ctx, `接続点 P (V_P = ${fmt(VP, 2)} V)`, xMid, yTop - 18, '#38bdf8', 'bold 13px sans-serif', 'center')

  // 電流の矢印とアニメーション粒子
  // 枝1 (左上 -> P)
  drawCurrentBranch(ctx, [
    { x: xLeft, y: yBottom },
    { x: xLeft, y: yTop },
    { x: xMid, y: yTop }
  ], I1, 'I₁', '#fbbf24')

  // 枝2 (右上 -> P)
  drawCurrentBranch(ctx, [
    { x: xRight, y: yBottom },
    { x: xRight, y: yTop },
    { x: xMid, y: yTop }
  ], I2, 'I₂', '#a78bfa')

  // 枝3 (P -> 下部レール)
  drawCurrentBranch(ctx, [
    { x: xMid, y: yTop },
    { x: xMid, y: yBottom }
  ], I3, 'I₃', '#34d399')

  // 注記パネル (キルヒホッフ第1法則と第2法則の式)
  ctx.fillStyle = 'rgba(24, 24, 27, 0.85)'
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 1
  ctx.fillRect(20, 20, 240, 52)
  ctx.strokeRect(20, 20, 240, 52)
  text(ctx, '【第1法則 (接合点 P)】', 30, 38, '#e4e4e7', 'bold 11px sans-serif')
  text(ctx, `I₁ + I₂ = I₃  (${fmt(I1, 2)} + ${fmt(I2, 2)} = ${fmt(I3, 2)} A)`, 30, 58, '#38bdf8', '11px monospace')

  ctx.fillRect(520, 20, 240, 52)
  ctx.strokeRect(520, 20, 240, 52)
  text(ctx, '【電位関係】', 530, 38, '#e4e4e7', 'bold 11px sans-serif')
  text(ctx, `接地 0V 基準: V_P = ${fmt(VP, 2)} V`, 530, 58, '#34d399', '11px monospace')
}

// -------------------------------------------------------------------
// 描画: 非オーム抵抗 (電球) と負荷線作図
// -------------------------------------------------------------------
function drawNonOhmic(ctx, w, h) {
  const { V, I, P } = noRes.value
  const E = nonOhmicE.value
  const R = nonOhmicR.value

  // 左側: 回路図 (x: 20 ~ 320)
  const cx1 = 70, cx2 = 250, cy1 = 100, cy2 = 300
  ctx.strokeStyle = '#52525b'
  ctx.lineWidth = 3
  ctx.strokeRect(cx1, cy1, cx2 - cx1, cy2 - cy1)

  // 電源 E (左)
  drawBattery(ctx, cx1, 200, E, 'E')
  // 抵抗 R (上)
  drawResistor(ctx, (cx1 + cx2) / 2, cy1, R, 'R', true)
  // 電球 (右)
  drawBulb(ctx, cx2, 200, V, I, P)

  // 電流アニメーション (時計回り)
  drawCurrentBranch(ctx, [
    { x: cx1, y: cy2 },
    { x: cx1, y: cy1 },
    { x: cx2, y: cy1 },
    { x: cx2, y: cy2 },
    { x: cx1, y: cy2 }
  ], I, 'I', '#fbbf24')

  // 右側: I-V グラフと負荷線 (x: 350 ~ 750, y: 50 ~ 370)
  const gx0 = 400, gy0 = 350
  const gw = 330, gh = 280

  // グラフ座標軸
  const maxV = 22
  const maxI = 3.0
  const toX = (v) => gx0 + (v / maxV) * gw
  const toY = (cur) => gy0 - (cur / maxI) * gh

  // 軸
  arrow(ctx, gx0, gy0, gx0 + gw + 20, gy0, '#71717a', 2, 'V [V]', { align: 'left', lx: 8 })
  arrow(ctx, gx0, gy0, gx0, gy0 - gh - 20, '#71717a', 2, 'I [A]', { align: 'center', ly: -12 })

  // 目盛り
  for (let v = 5; v <= 20; v += 5) {
    const x = toX(v)
    line(ctx, x, gy0, x, gy0 - gh, 'rgba(63,63,70,0.25)', 1, [3, 3])
    text(ctx, `${v}`, x, gy0 + 16, '#a1a1aa', '11px sans-serif', 'center')
  }
  for (let c = 0.5; c <= 2.5; c += 0.5) {
    const y = toY(c)
    line(ctx, gx0, y, gx0 + gw, y, 'rgba(63,63,70,0.25)', 1, [3, 3])
    text(ctx, `${c.toFixed(1)}`, gx0 - 10, y + 4, '#a1a1aa', '11px sans-serif', 'right')
  }

  // 1. 電球の非オーム特性曲線: I = k * sqrt(V)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let px = 0; px <= gw; px += 2) {
    const vVal = (px / gw) * maxV
    const iVal = nonOhmicK.value * Math.sqrt(vVal)
    const x = toX(vVal)
    const y = toY(iVal)
    if (px === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  text(ctx, '電球特性 I = f(V)', toX(15), toY(nonOhmicK.value * Math.sqrt(15)) - 12, '#38bdf8', 'bold 12px sans-serif')

  // 2. 負荷線: I = (E - V) / R
  const vIntercept = E
  const iIntercept = E / R
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(toX(0), toY(iIntercept))
  ctx.lineTo(toX(vIntercept), toY(0))
  ctx.stroke()

  // 負荷線の式表示
  text(ctx, `負荷線: I = (E - V)/R`, toX(vIntercept * 0.4), toY((E - vIntercept * 0.4) / R) + 20, '#f43f5e', 'bold 12px sans-serif')
  // 切片マーク
  dot(ctx, toX(vIntercept), toY(0), 4, '#f43f5e')
  text(ctx, `(E, 0)`, toX(vIntercept), toY(0) + 16, '#f43f5e', '11px sans-serif', 'center')
  dot(ctx, toX(0), toY(iIntercept), 4, '#f43f5e')
  text(ctx, `E/R`, toX(0) - 10, toY(iIntercept), '#f43f5e', '11px sans-serif', 'right')

  // 3. 動作点 (交点)
  const oX = toX(V)
  const oY = toY(I)
  // 点線で軸に投影
  line(ctx, oX, gy0, oX, oY, '#fbbf24', 1.5, [4, 4])
  line(ctx, gx0, oY, oX, oY, '#fbbf24', 1.5, [4, 4])
  dot(ctx, oX, oY, 7, '#fbbf24', '#ffffff')
  text(ctx, `動作点 (${fmt(V, 2)}V, ${fmt(I, 2)}A)`, oX + 10, oY - 12, '#fbbf24', 'bold 13px sans-serif')
}

// -------------------------------------------------------------------
// 描画: ホイートストンブリッジ
// -------------------------------------------------------------------
function drawBridge(ctx, w, h) {
  const { VC, VD, dVD, balanced } = brRes.value
  const E = bridgeE.value
  const r1 = bridgeR1.value
  const r2 = bridgeR2.value
  const r3 = bridgeR3.value
  const r4 = bridgeR4.value

  // ひし形ブリッジ座標
  const xA = 220, yA = 210 // 左 (電源正極から)
  const xB = 560, yB = 210 // 右 (電源負極へ)
  const xC = 390, yC = 100 // 上 (中点 C)
  const xD = 390, yD = 320 // 下 (中点 D)

  // 電源レール (外側)
  const yPower = 380
  ctx.strokeStyle = '#52525b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(xA, yA)
  ctx.lineTo(xA - 80, yA)
  ctx.lineTo(xA - 80, yPower)
  ctx.lineTo(xB + 80, yPower)
  ctx.lineTo(xB + 80, yB)
  ctx.lineTo(xB, yB)
  ctx.stroke()

  // ブリッジの4辺
  ctx.beginPath()
  ctx.moveTo(xA, yA); ctx.lineTo(xC, yC); ctx.lineTo(xB, yB)
  ctx.moveTo(xA, yA); ctx.lineTo(xD, yD); ctx.lineTo(xB, yB)
  ctx.stroke()

  // 中央の検流計 G (C-D間)
  ctx.beginPath()
  ctx.moveTo(xC, yC); ctx.lineTo(xD, yD)
  ctx.stroke()

  // 電源 E (下部中央)
  drawBattery(ctx, 390, yPower, E, 'E', true)

  // 4つの抵抗
  drawResistorDiagonal(ctx, (xA + xC) / 2, (yA + yC) / 2, r1, 'R₁', -0.55)
  drawResistorDiagonal(ctx, (xC + xB) / 2, (yC + yB) / 2, r2, 'R₂', 0.55)
  drawResistorDiagonal(ctx, (xA + xD) / 2, (yA + yD) / 2, r3, 'R₃', 0.55)
  drawResistorDiagonal(ctx, (xD + xB) / 2, (yD + yB) / 2, r4, 'R₄', -0.55)

  // 検流計 G
  drawGalvanometer(ctx, 390, 210, dVD)

  // 接地点 (B側を0Vとする)
  drawGround(ctx, xB + 80, yPower)

  // 端子ラベル
  dot(ctx, xA, yA, 5, '#e4e4e7')
  text(ctx, `A (${fmt(E, 1)}V)`, xA - 12, yA - 10, '#e4e4e7', 'bold 12px sans-serif', 'right')
  dot(ctx, xB, yB, 5, '#e4e4e7')
  text(ctx, `B (0V)`, xB + 12, yB - 10, '#e4e4e7', 'bold 12px sans-serif', 'left')

  dot(ctx, xC, yC, 6, '#38bdf8')
  text(ctx, `C (V_C = ${fmt(VC, 2)} V)`, xC, yC - 16, '#38bdf8', 'bold 13px sans-serif', 'center')

  dot(ctx, xD, yD, 6, '#f43f5e')
  text(ctx, `D (V_D = ${fmt(VD, 2)} V)`, xD, yD + 26, '#f43f5e', 'bold 13px sans-serif', 'center')

  // 平衡条件ステータスバナー
  ctx.fillStyle = balanced ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.15)'
  ctx.strokeStyle = balanced ? '#22c55e' : '#ef4444'
  ctx.lineWidth = 1.5
  ctx.fillRect(20, 20, 320, 60)
  ctx.strokeRect(20, 20, 320, 60)

  text(ctx, balanced ? '✓ 平衡条件成立！' : '× 不平衡状態', 35, 42, balanced ? '#4ade80' : '#f87171', 'bold 13px sans-serif')
  text(ctx, `R₁R₄ = ${fmt(r1 * r4, 1)}  /  R₂R₃ = ${fmt(r2 * r3, 1)}`, 35, 64, '#e4e4e7', '12px monospace')
}

// -------------------------------------------------------------------
// 回路パーツ描画ヘルパー
// -------------------------------------------------------------------
function drawBattery(ctx, x, y, val, label, horizontal = false) {
  ctx.save()
  ctx.fillStyle = '#09090b'
  if (horizontal) {
    ctx.fillRect(x - 22, y - 18, 44, 36)
    // 陽極 (長い線)
    line(ctx, x - 8, y - 16, x - 8, y + 16, '#f43f5e', 3)
    // 陰極 (短い太い線)
    line(ctx, x + 8, y - 8, x + 8, y + 8, '#38bdf8', 4)
    text(ctx, `+`, x - 18, y - 6, '#f43f5e', 'bold 14px sans-serif')
    text(ctx, `-`, x + 16, y - 6, '#38bdf8', 'bold 16px sans-serif')
    text(ctx, `${label} = ${val}V`, x, y - 24, '#e4e4e7', 'bold 12px sans-serif', 'center')
  } else {
    ctx.fillRect(x - 18, y - 22, 36, 44)
    // 陽極 (上、長い線)
    line(ctx, x - 16, y - 8, x + 16, y - 8, '#f43f5e', 3)
    // 陰極 (下、短い太い線)
    line(ctx, x - 8, y + 8, x + 8, y + 8, '#38bdf8', 4)
    text(ctx, `+`, x + 22, y - 4, '#f43f5e', 'bold 14px sans-serif')
    text(ctx, `-`, x + 22, y + 14, '#38bdf8', 'bold 16px sans-serif')
    text(ctx, `${label} = ${val}V`, x - 26, y, '#e4e4e7', 'bold 12px sans-serif', 'right', 'middle')
  }
  ctx.restore()
}

function drawResistor(ctx, x, y, val, label, horizontal = true) {
  ctx.save()
  ctx.fillStyle = '#09090b'
  if (horizontal) {
    ctx.fillRect(x - 25, y - 12, 50, 24)
    ctx.strokeStyle = '#a1a1aa'
    ctx.lineWidth = 2
    ctx.strokeRect(x - 22, y - 9, 44, 18)
    text(ctx, `${label} (${val}Ω)`, x, y - 16, '#e4e4e7', 'bold 12px sans-serif', 'center')
  } else {
    ctx.fillRect(x - 12, y - 25, 24, 50)
    ctx.strokeStyle = '#a1a1aa'
    ctx.lineWidth = 2
    ctx.strokeRect(x - 9, y - 22, 18, 44)
    text(ctx, `${label} (${val}Ω)`, x + 18, y, '#e4e4e7', 'bold 12px sans-serif', 'left', 'middle')
  }
  ctx.restore()
}

function drawResistorDiagonal(ctx, x, y, val, label, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = '#09090b'
  ctx.fillRect(-22, -10, 44, 20)
  ctx.strokeStyle = '#a1a1aa'
  ctx.lineWidth = 2
  ctx.strokeRect(-20, -8, 40, 16)
  ctx.rotate(-angle)
  text(ctx, `${label}: ${val}Ω`, 0, -16, '#e4e4e7', 'bold 11px sans-serif', 'center')
  ctx.restore()
}

function drawBulb(ctx, x, y, v, cur, p) {
  ctx.save()
  ctx.fillStyle = '#09090b'
  ctx.fillRect(x - 25, y - 25, 50, 50)

  // 明るさに応じたグロー
  const glow = Math.min(1, p / 15)
  if (glow > 0.05) {
    const grad = ctx.createRadialGradient(x, y, 4, x, y, 35)
    grad.addColorStop(0, `rgba(251, 191, 36, ${0.8 * glow})`)
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, 35, 0, Math.PI * 2)
    ctx.fill()
  }

  // 電球の丸枠
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, 16, 0, Math.PI * 2)
  ctx.stroke()

  // フィラメント (バツ印)
  ctx.beginPath()
  ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9)
  ctx.moveTo(x - 9, y + 9); ctx.lineTo(x + 9, y - 9)
  ctx.stroke()

  text(ctx, `電球 L`, x + 24, y - 6, '#fbbf24', 'bold 12px sans-serif')
  text(ctx, `${fmt(p, 1)} W`, x + 24, y + 12, '#a1a1aa', '11px sans-serif')
  ctx.restore()
}

function drawGalvanometer(ctx, x, y, dV) {
  ctx.save()
  ctx.fillStyle = '#09090b'
  ctx.fillRect(x - 24, y - 24, 48, 48)

  // 円枠
  ctx.strokeStyle = '#a1a1aa'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, 22, 0, Math.PI * 2)
  ctx.stroke()

  // G 文字
  text(ctx, 'G', x, y - 6, '#71717a', 'bold 14px sans-serif', 'center')

  // 針 (dVに応じて傾く)
  const maxDeflect = Math.PI / 4
  const angle = Math.max(-maxDeflect, Math.min(maxDeflect, dV * 0.4))
  const nx = x + 16 * Math.sin(angle)
  const ny = y - 16 * Math.cos(angle)
  ctx.strokeStyle = Math.abs(dV) < 0.01 ? '#22c55e' : '#f43f5e'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x, y + 6)
  ctx.lineTo(nx, ny)
  ctx.stroke()
  dot(ctx, x, y + 6, 3, '#e4e4e7')

  text(ctx, `ΔV = ${fmt(dV, 2)}V`, x + 30, y, '#e4e4e7', 'bold 11px sans-serif', 'left', 'middle')
  ctx.restore()
}

function drawGround(ctx, x, y) {
  ctx.save()
  line(ctx, x, y, x, y + 12, '#52525b', 2)
  line(ctx, x - 12, y + 12, x + 12, y + 12, '#52525b', 3)
  line(ctx, x - 7, y + 17, x + 7, y + 17, '#52525b', 2)
  line(ctx, x - 3, y + 21, x + 3, y + 21, '#52525b', 1.5)
  text(ctx, '0V (基準)', x, y + 34, '#71717a', '10px sans-serif', 'center')
  ctx.restore()
}

// 枝に沿って電流粒子をアニメーション
function drawCurrentBranch(ctx, pts, cur, label, col) {
  if (Math.abs(cur) < 0.001) return
  const isRev = cur < 0
  const speed = Math.abs(cur) * 25
  const path = isRev ? [...pts].reverse() : pts

  // 総距離計算
  let totalLen = 0
  const segLens = []
  for (let i = 0; i < path.length - 1; i++) {
    const d = Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y)
    segLens.push(d)
    totalLen += d
  }
  if (totalLen <= 0) return

  // 粒子描画
  const particleSpacing = 40
  const numParticles = Math.floor(totalLen / particleSpacing)
  for (let p = 0; p < numParticles; p++) {
    const dist = (p * particleSpacing + animPhase * speed) % totalLen
    // 距離 dist に対応する座標を算出
    let acc = 0
    for (let i = 0; i < segLens.length; i++) {
      if (acc + segLens[i] >= dist) {
        const t = (dist - acc) / segLens[i]
        const px = path[i].x + (path[i + 1].x - path[i].x) * t
        const py = path[i].y + (path[i + 1].y - path[i].y) * t
        dot(ctx, px, py, 3, col)
        break
      }
      acc += segLens[i]
    }
  }
}
</script>

<style scoped>
.circuit-sim {
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
  margin-bottom: 14px;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
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
  font-size: 1.1rem;
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

.stat-card .val.is-balanced {
  color: #4ade80;
}
</style>
