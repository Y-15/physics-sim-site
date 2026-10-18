<template>
  <div class="lab" style="--ac:#f97316;--ac2:#3b82f6">
    <div class="lab-head">
      <span class="lab-title">🔥 気体の状態変化・P-V図と熱力学第1法則 実験室</span>
      <span class="lab-badge">{{ stateName }}</span>
    </div>

    <!-- 変化モード切替タブ -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': procMode === 'isochoric' }" @click="setMode('isochoric')">
        🔒 定積変化 (ΔV=0)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': procMode === 'isobaric' }" @click="setMode('isobaric')">
        ⚖️ 定圧変化 (P一定)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': procMode === 'isothermal' }" @click="setMode('isothermal')">
        🌡️ 等温変化 (T一定)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': procMode === 'adiabatic' }" @click="setMode('adiabatic')">
        🛡️ 断熱変化 (Q=0)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': procMode === 'cycle' }" @click="setMode('cycle')">
        🔄 熱機関サイクル (A→B→C→D→A)
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <div class="lab-controls">
      <div v-if="procMode !== 'cycle'" class="lab-ctrl">
        <label>操作パラメーター (進行度): <strong>{{ progress.toFixed(0) }}%</strong></label>
        <input type="range" v-model.number="progress" min="0" max="100" step="1" />
        <div class="lab-note">{{ procHelpText }}</div>
      </div>
      <div v-else class="lab-ctrl">
        <label>サイクルのアニメーション速度</label>
        <div class="lab-row">
          <button class="lab-btn" @click="cycleRunning = !cycleRunning">{{ cycleRunning ? '⏸️ 一時停止' : '▶️ サイクル再生' }}</button>
          <button class="lab-chip" @click="cycleProgress = 0">初期状態 A にリセット</button>
        </div>
      </div>
      <div class="lab-ctrl">
        <label>気体の種類（単原子分子理想気体）</label>
        <div class="lab-row">
          <span style="font-size:12px;color:#94a3b8">モル数 <i>n</i> = 1.0 mol, 定積モル比熱 <i>C</i><sub><i>V</i></sub> = (3/2)<i>R</i>, 比熱比 <i>γ</i> = 5/3 (≈ 1.67)</span>
        </div>
      </div>
    </div>

    <div class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">熱力学第1法則</div>
        <div class="v" style="font-size:17px;color:#f97316"><i>Q</i> = Δ<i>U</i> + <i>W'</i></div>
        <div class="f">吸収熱 = 内部エネルギー増加 + 気体が外部にした仕事</div>
      </div>
      <div class="lab-stat">
        <div class="k">圧力 P</div>
        <div class="v" style="color:#ef4444">{{ currentP.toFixed(1) }} <small>kPa</small></div>
        <div class="f"><i>PV</i> = <i>nRT</i> より計算</div>
      </div>
      <div class="lab-stat">
        <div class="k">体積 V</div>
        <div class="v" style="color:#38bdf8">{{ currentV.toFixed(2) }} <small>×10⁻² m³</small></div>
        <div class="f">シリンダーのピストン位置</div>
      </div>
      <div class="lab-stat">
        <div class="k">絶対温度 T</div>
        <div class="v" style="color:#f59e0b">{{ currentT.toFixed(0) }} <small>K</small></div>
        <div class="f">内部エネルギー <i>U</i> = (3/2)<i>nRT</i></div>
      </div>
      <div class="lab-stat">
        <div class="k">気体がした仕事 W'</div>
        <div class="v" :style="{ color: currentW >= 0 ? '#10b981' : '#a855f7' }">
          {{ currentW.toFixed(0) }} <small>J</small>
        </div>
        <div class="f">P-V グラフ下の面積（膨張なら正、圧縮なら負）</div>
      </div>
      <div class="lab-stat">
        <div class="k">吸収した熱量 Q</div>
        <div class="v" :style="{ color: currentQ >= 0 ? '#f97316' : '#38bdf8' }">
          {{ currentQ.toFixed(0) }} <small>J</small>
        </div>
        <div class="f">Q = ΔU + W'</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const R = 8.314 // 気体定数 J/(mol·K)
const n = 1.0 // 1 mol
const gamma = 5 / 3 // 単原子分子

const procMode = ref('isobaric')
const progress = ref(50) // 0〜100
const cycleProgress = ref(0)
const cycleRunning = ref(true)

function setMode(m) {
  procMode.value = m
  progress.value = 50
  cycleProgress.value = 0
}

const stateName = computed(() => {
  switch (procMode.value) {
    case 'isochoric': return '定積変化（加熱・冷却）'
    case 'isobaric': return '定圧変化（等圧膨張・圧縮）'
    case 'isothermal': return '等温変化（ボイルの法則）'
    case 'adiabatic': return '断熱変化（ポアソンの法則）'
    case 'cycle': return '熱機関サイクル（1周で正味の仕事）'
  }
})

const procHelpText = computed(() => {
  switch (procMode.value) {
    case 'isochoric': return '体積固定。熱を加えると温度と圧力が比例して上昇（W=0, Q=ΔU）'
    case 'isobaric': return 'ピストンが動いて圧力一定。加熱すると体積と温度が上昇（W=PΔV, Q=⁵⁄₂nRΔT）'
    case 'isothermal': return '温度一定。ゆっくりピストンを動かす（PV=一定, ΔU=0, Q=W）'
    case 'adiabatic': return '急激な移動で熱の出入りなし（Q=0, W=-ΔU。膨張すると温度低下！）'
    default: return ''
  }
})

// 基準状態 (P0, V0, T0)
// P0 = 100 kPa = 1e5 Pa, V0 = 2.49e-2 m³ (約24.9 L), T0 = 300 K
const P0 = 100.0 // kPa
const V0 = 2.49 // x 10^-2 m^3
const T0 = 300.0 // K

// 現在の P, V, T, ΔU, W', Q の計算
const thermoState = computed(() => {
  const t = progress.value / 100 // 0〜1

  if (procMode.value === 'isochoric') {
    // V 一定 = V0
    // T が 200K 〜 600K へ変化
    const curT = 200 + t * 400
    const curV = V0
    const curP = P0 * (curT / T0)
    const deltaU = 1.5 * n * R * (curT - 300)
    const w = 0
    const q = deltaU + w
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  if (procMode.value === 'isobaric') {
    // P 一定 = P0
    // V が 1.5 〜 3.5 へ変化
    const curV = 1.4 + t * 2.2
    const curP = P0
    const curT = T0 * (curV / V0)
    const deltaU = 1.5 * n * R * (curT - 300)
    // W = P * ΔV (kPa * 1e-2 m^3 = 10^3 * 10^-2 = 10 J)
    const w = P0 * 10 * (curV - V0)
    const q = deltaU + w
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  if (procMode.value === 'isothermal') {
    // T 一定 = T0 = 300K
    // V が 1.5 〜 4.0 へ変化
    const curV = 1.4 + t * 2.6
    const curT = T0
    const curP = P0 * (V0 / curV)
    const deltaU = 0
    // W = n R T ln(V / V0)
    const w = n * R * curT * Math.log(curV / V0)
    const q = w
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  if (procMode.value === 'adiabatic') {
    // Q = 0
    // P * V^gamma = const
    const curV = 1.4 + t * 2.6
    const curP = P0 * Math.pow(V0 / curV, gamma)
    const curT = (curP * 1000 * (curV * 0.01)) / (n * R)
    const deltaU = 1.5 * n * R * (curT - T0)
    const q = 0
    const w = -deltaU // Q = ΔU + W = 0 => W = -ΔU
    return { p: curP, v: curV, t: curT, deltaU, w, q }
  }

  // サイクルモード: 4状態
  // A(V1, P1) -> B(V2, P1) 定圧膨張 -> C(V2, P2) 定積冷却 -> D(V1, P2) 定圧圧縮 -> A(V1, P1) 定積加熱
  const V1 = 1.8, V2 = 3.6
  const P_low = 80, P_high = 180
  const cT = cycleProgress.value % 4
  let cp = 0, cv = 0

  if (cT < 1) { // A -> B (定圧膨張)
    const u = cT
    cv = V1 + (V2 - V1) * u
    cp = P_high
  } else if (cT < 2) { // B -> C (定積冷却)
    const u = cT - 1
    cv = V2
    cp = P_high + (P_low - P_high) * u
  } else if (cT < 3) { // C -> D (定圧圧縮)
    const u = cT - 2
    cv = V2 + (V1 - V2) * u
    cp = P_low
  } else { // D -> A (定積加熱)
    const u = cT - 3
    cv = V1
    cp = P_low + (P_high - P_low) * u
  }

  const curTemp = (cp * 1000 * (cv * 0.01)) / (n * R)
  // 正味の仕事 W_net = (P_high - P_low) * (V2 - V1) * 10
  const wNet = (P_high - P_low) * 10 * (V2 - V1)
  const qIn = 1.5 * n * R * ((P_high * 1000 * (V2 * 0.01)) / (n * R) - (P_low * 1000 * (V1 * 0.01)) / (n * R)) + P_high * 10 * (V2 - V1)

  return { p: cp, v: cv, t: curTemp, deltaU: 0, w: wNet, q: qIn }
})

const currentP = computed(() => thermoState.value.p)
const currentV = computed(() => thermoState.value.v)
const currentT = computed(() => thermoState.value.t)
const currentW = computed(() => thermoState.value.w)
const currentQ = computed(() => thermoState.value.q)

// 分子粒子のシミュレーション用
const particles = []
for (let i = 0; i < 40; i++) {
  particles.push({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  })
}

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height, dt }) => {
  clearGrid(ctx, width, height, 40)

  // サイクルモードのアニメーション進行
  if (procMode.value === 'cycle' && cycleRunning.value) {
    cycleProgress.value += dt * 0.5
  }

  const splitX = width * 0.46

  // 1. 左側：ピストン・シリンダーと分子運動
  drawCylinder(ctx, 0, 0, splitX, height, dt)

  // 2. 右側：P-Vグラフ
  drawPVGraph(ctx, splitX, 0, width - splitX, height)
})

function drawCylinder(ctx, ox, oy, w, h, dt) {
  const cx = ox + w * 0.5
  const cy = oy + h * 0.5
  const cylW = w * 0.75
  const cylH = h * 0.48
  const cylLeft = cx - cylW / 2
  const cylTop = cy - cylH / 2

  // ピストンの位置（体積 V に連動）
  // V の範囲 1.2 〜 4.0 をピストン横幅の 25% 〜 95% にマッピング
  const vNorm = Math.min(1.0, Math.max(0.1, (currentV.value - 1.2) / 3.0))
  const pistonX = cylLeft + cylW * (0.2 + vNorm * 0.72)

  // シリンダー外枠
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(cylLeft + cylW, cylTop)
  ctx.lineTo(cylLeft, cylTop)
  ctx.lineTo(cylLeft, cylTop + cylH)
  ctx.lineTo(cylLeft + cylW, cylTop + cylH)
  ctx.stroke()

  // シリンダー内部の気体領域（温度に応じた着色）
  // T: 200K (水色) 〜 600K (赤橙色)
  const tNorm = Math.min(1, Math.max(0, (currentT.value - 200) / 450))
  ctx.fillStyle = `rgba(${Math.round(56 + tNorm * 190)}, ${Math.round(189 - tNorm * 100)}, ${Math.round(248 - tNorm * 190)}, 0.15)`
  ctx.fillRect(cylLeft, cylTop, pistonX - cylLeft, cylH)

  // 気体分子の更新 & 描画
  const speedScale = Math.sqrt(currentT.value / 300) * 1.5
  ctx.fillStyle = '#f8fafc'
  particles.forEach(p => {
    p.x += p.vx * speedScale * dt * 0.8
    p.y += p.vy * speedScale * dt * 0.8

    // 壁との反射
    if (p.x < 0) { p.x = 0; p.vx *= -1 }
    if (p.x > 1) { p.x = 1; p.vx *= -1 }
    if (p.y < 0) { p.y = 0; p.vy *= -1 }
    if (p.y > 1) { p.y = 1; p.vy *= -1 }

    const px = cylLeft + p.x * (pistonX - cylLeft - 10) + 5
    const py = cylTop + p.y * (cylH - 10) + 5
    dot(ctx, px, py, 3, '#38bdf8', '#fff', 1)
  })

  // ピストン本体
  ctx.fillStyle = '#cbd5e1'
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.fillRect(pistonX, cylTop + 3, 16, cylH - 6)
  ctx.strokeRect(pistonX, cylTop + 3, 16, cylH - 6)

  // ピストンのロッド（棒）
  ctx.fillStyle = '#94a3b8'
  ctx.fillRect(pistonX + 16, cy - 8, cylW * 0.35, 16)
  ctx.strokeRect(pistonX + 16, cy - 8, cylW * 0.35, 16)

  // 下部の加熱ヒーターまたは断熱表示
  if (procMode.value === 'adiabatic') {
    // 断熱モード：周囲に断熱材ジャケット表示
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 4
    ctx.strokeRect(cylLeft - 6, cylTop - 6, cylW + 12, cylH + 12)
    text(ctx, '🛡️ 断熱容器 (Q = 0, 熱の出入り遮断)', cx, cylTop + cylH + 28, { color: '#94a3b8', font: 'bold 12px sans-serif' })
  } else {
    if (currentQ.value > 15) {
      drawFlame(ctx, cx - 40, cylTop + cylH + 10)
      text(ctx, `🔥 加熱中 (熱量 Q = +${currentQ.value.toFixed(0)} J 流入)`, cx, cylTop + cylH + 45, { color: '#f97316', font: 'bold 12px sans-serif' })
    } else if (currentQ.value < -15) {
      text(ctx, `❄️ 冷却中 (熱量 Q = ${currentQ.value.toFixed(0)} J 放出)`, cx, cylTop + cylH + 25, { color: '#38bdf8', font: 'bold 12px sans-serif' })
    } else {
      text(ctx, '⚖️ 熱平衡状態 (Q ≈ 0)', cx, cylTop + cylH + 25, { color: '#a1a1aa', font: '12px sans-serif' })
    }
  }

  // シリンダー上部ラベル
  text(ctx, `シリンダー内圧 P = ${currentP.value.toFixed(1)} kPa`, cx, cylTop - 18, { color: '#ef4444', font: 'bold 12px sans-serif' })
}

function drawFlame(ctx, x, y) {
  ctx.save()
  for (let i = 0; i < 4; i++) {
    const fx = x + i * 22
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(fx, y + 15)
    ctx.quadraticCurveTo(fx - 8, y + 5, fx, y)
    ctx.quadraticCurveTo(fx + 8, y + 5, fx, y + 15)
    ctx.fill()
  }
  ctx.restore()
}

function drawPVGraph(ctx, ox, oy, w, h) {
  const pad = 48
  const gx = ox + pad
  const gy = oy + pad
  const gw = w - pad * 1.5
  const gh = h - pad * 2

  // 軸の描画
  line(ctx, gx, gy + gh, gx + gw, gy + gh, { color: '#94a3b8', width: 2 }) // V軸
  line(ctx, gx, gy + gh, gx, gy, { color: '#94a3b8', width: 2 }) // P軸

  text(ctx, '体積 V [×10⁻² m³] →', gx + gw - 20, gy + gh + 28, { align: 'right', color: '#38bdf8', font: 'bold 12px sans-serif' })
  text(ctx, '↑ 圧力 P [kPa]', gx - 8, gy - 12, { align: 'left', color: '#ef4444', font: 'bold 12px sans-serif' })

  // 目盛りとスケール
  // V: 1.0 〜 4.5
  // P: 0 〜 250
  const vMin = 1.0, vMax = 4.5
  const pMin = 0, pMax = 250

  function toScreen(v, p) {
    const sx = gx + ((v - vMin) / (vMax - vMin)) * gw
    const sy = gy + gh - ((p - pMin) / (pMax - pMin)) * gh
    return { sx, sy }
  }

  // 等温曲線（参考点線 300K, 500K）
  ctx.save()
  ;[250, 450].forEach(temp => {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    for (let v = 1.2; v <= 4.2; v += 0.2) {
      const p = ((n * R * temp) / (v * 0.01)) / 1000
      const pt = toScreen(v, p)
      if (v === 1.2) ctx.moveTo(pt.sx, pt.sy)
      else ctx.lineTo(pt.sx, pt.sy)
    }
    ctx.stroke()
  })
  ctx.restore()

  // サイクルモードの場合の閉ループ描画
  if (procMode.value === 'cycle') {
    const pts = [
      toScreen(1.8, 180), // A
      toScreen(3.6, 180), // B
      toScreen(3.6, 80),  // C
      toScreen(1.8, 80)   // D
    ]
    // 囲まれた面積（塗りつぶし：正味の仕事）
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'
    ctx.beginPath()
    ctx.moveTo(pts[0].sx, pts[0].sy)
    ctx.lineTo(pts[1].sx, pts[1].sy)
    ctx.lineTo(pts[2].sx, pts[2].sy)
    ctx.lineTo(pts[3].sx, pts[3].sy)
    ctx.closePath()
    ctx.fill()

    // 外枠
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2.5
    ctx.stroke()

    text(ctx, '正味の仕事 W_net', (pts[0].sx + pts[1].sx) / 2, (pts[0].sy + pts[2].sy) / 2, { color: '#10b981', font: 'bold 11px sans-serif' })
    text(ctx, 'A', pts[0].sx - 10, pts[0].sy - 6, { color: '#fff', font: 'bold 11px sans-serif' })
    text(ctx, 'B', pts[1].sx + 10, pts[1].sy - 6, { color: '#fff', font: 'bold 11px sans-serif' })
    text(ctx, 'C', pts[2].sx + 10, pts[2].sy + 14, { color: '#fff', font: 'bold 11px sans-serif' })
    text(ctx, 'D', pts[3].sx - 10, pts[3].sy + 14, { color: '#fff', font: 'bold 11px sans-serif' })
  } else {
    // 単一変化モード：初期状態から現在点までの軌跡と仕事（下面積）の塗りつぶし
    const vStart = V0
    const vEnd = currentV.value
    const steps = 40
    const areaPts = []

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps
      const vCur = vStart + (vEnd - vStart) * frac
      let pCur = P0
      if (procMode.value === 'isochoric') {
        pCur = P0 * ((200 + (progress.value / 100) * 400 * frac) / T0)
      } else if (procMode.value === 'isobaric') {
        pCur = P0
      } else if (procMode.value === 'isothermal') {
        pCur = P0 * (V0 / vCur)
      } else if (procMode.value === 'adiabatic') {
        pCur = P0 * Math.pow(V0 / vCur, gamma)
      }
      areaPts.push(toScreen(vCur, pCur))
    }

    // 仕事の面積塗りつぶし (V1 -> V2 -> V軸)
    if (procMode.value !== 'isochoric' && Math.abs(currentW.value) > 2) {
      ctx.save()
      ctx.fillStyle = currentW.value >= 0 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(168, 85, 247, 0.18)'
      ctx.beginPath()
      ctx.moveTo(areaPts[0].sx, gy + gh)
      for (let p of areaPts) {
        ctx.lineTo(p.sx, p.sy)
      }
      ctx.lineTo(areaPts[areaPts.length - 1].sx, gy + gh)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      const midPt = areaPts[Math.floor(steps / 2)]
      text(ctx, `仕事 W' = ${currentW.value.toFixed(0)} J`, midPt.sx, gy + gh - 16, {
        color: currentW.value >= 0 ? '#10b981' : '#c084fc',
        font: 'bold 11px sans-serif'
      })
    }

    // 軌跡ライン
    ctx.save()
    ctx.strokeStyle = '#f97316'
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let i = 0; i < areaPts.length; i++) {
      if (i === 0) ctx.moveTo(areaPts[i].sx, areaPts[i].sy)
      else ctx.lineTo(areaPts[i].sx, areaPts[i].sy)
    }
    ctx.stroke()
    ctx.restore()

    // 始点プロット
    const startPt = areaPts[0]
    dot(ctx, startPt.sx, startPt.sy, 4, '#94a3b8', '#fff', 1.5)
    text(ctx, '始点', startPt.sx - 14, startPt.sy - 8, { color: '#94a3b8', font: '10px sans-serif' })
  }

  // 現在の状態点 (V, P) のプロット
  const curPt = toScreen(currentV.value, currentP.value)

  // 軸への破線
  line(ctx, curPt.sx, curPt.sy, curPt.sx, gy + gh, { color: 'rgba(56,189,248,0.5)', width: 1.5, dash: [3, 3] })
  line(ctx, curPt.sx, curPt.sy, gx, curPt.sy, { color: 'rgba(239,68,68,0.5)', width: 1.5, dash: [3, 3] })

  // 状態点の円
  dot(ctx, curPt.sx, curPt.sy, 7, '#f97316', '#fff', 2)
  text(ctx, `(${currentV.value.toFixed(2)}, ${currentP.value.toFixed(0)})`, curPt.sx + 12, curPt.sy - 8, { align: 'left', color: '#f97316', font: 'bold 12px sans-serif' })
}
</script>
