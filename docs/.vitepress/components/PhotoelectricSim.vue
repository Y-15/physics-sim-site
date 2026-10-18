<template>
  <div class="photoelectric-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>💡 光電効果・光量子仮説シミュレーター</h3>
        <span class="badge">Photoelectric Effect</span>
      </div>
      <p class="desc">
        光の波長 λ（振動数 ν）、光の強さ（光子数）、逆電圧 <i>V</i>、金属の仕事関数 <i>W</i> を変え、光量子仮説 <i>E</i> = <i>h</i>ν とアインシュタインの光電方程式 <i>e</i><i>V</i><sub>0</sub> = <i>h</i>ν - <i>W</i> をインタラクティブに検証できます。
      </p>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="controls-grid">
        <!-- 金属の種類 -->
        <div class="control-group">
          <label><span>金属の種類 (仕事関数 <i>W</i>):</span></label>
          <select v-model="selectedMetal" class="metal-select">
            <option v-for="(m, idx) in metals" :key="idx" :value="idx">
              {{ m.name }} (W = {{ m.W.toFixed(2) }} eV)
            </option>
          </select>
        </div>

        <!-- 波長 λ -->
        <div class="control-group">
          <label>
            <span>光の波長 λ:</span>
            <span>
              <strong>{{ wavelength }} nm</strong>
              <span class="color-chip" :style="{ backgroundColor: lightColor }"></span>
            </span>
          </label>
          <input type="range" v-model.number="wavelength" min="200" max="750" step="5" />
          <span class="sub-info">振動数 ν = {{ fmt(freq * 1e-14, 2) }}× 10<sup>14</sup> Hz</span>
        </div>

        <!-- 光の強さ -->
        <div class="control-group">
          <label><span>光の強さ (光子数/秒):</span> <strong>{{ intensity }} %</strong></label>
          <input type="range" v-model.number="intensity" min="10" max="100" step="5" />
        </div>

        <!-- 電圧 V -->
        <div class="control-group">
          <label><span>印加電圧 <i>V</i>:</span> <strong>{{ fmt(voltage, 2) }} V</strong></label>
          <input type="range" v-model.number="voltage" min="-4.0" max="4.0" step="0.05" />
          <span class="sub-info">負電圧: 減速・阻止方向 / 正電圧: 加速方向</span>
        </div>
      </div>
    </div>

    <!-- グラフ表示切替タブ -->
    <div class="graph-toggle-row">
      <span class="graph-label">右側グラフ表示：</span>
      <div class="toggle-buttons">
        <button :class="{ active: graphMode === 'IV' }" @click="graphMode = 'IV'">
          ① I-V 特性曲線（光電流 vs 電圧）
        </button>
        <button :class="{ active: graphMode === 'V0Nu' }" @click="graphMode = 'V0Nu'">
          ② 阻止電圧 <i>V</i><sub>0</sub> vs 振動数 ν グラフ（傾き <span class="frac"><span class="num"><i>h</i></span><span class="den"><i>e</i></span></span>）
        </button>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <div class="stat-card">
        <span class="label">光子のエネルギー <i>h</i>ν</span>
        <span class="val highlight">{{ fmt(photonEnergyEV, 2) }} eV</span>
      </div>
      <div class="stat-card">
        <span class="label">仕事関数 <i>W</i></span>
        <span class="val">{{ fmt(currentMetal.W, 2) }} eV</span>
      </div>
      <div class="stat-card">
        <span class="label">最大運動エネルギー <i>K</i><sub>max</sub></span>
        <span class="val" :class="{ 'zero-k': KmaxEV <= 0 }">
          {{ KmaxEV > 0 ? fmt(KmaxEV, 2) + ' eV' : '0 eV (電子放出なし)' }}
        </span>
      </div>
      <div class="stat-card">
        <span class="label">阻止電圧 <i>V</i><sub>0</sub></span>
        <span class="val highlight-alt">
          {{ KmaxEV > 0 ? fmt(V0, 2) + ' V' : '—' }}
        </span>
      </div>
      <div class="stat-card">
        <span class="label">限界波長 λ<sub>0</sub> = <span class="frac"><span class="num">hc</span><span class="den"><i>W</i></span></span></span>
        <span class="val">{{ fmt(lambda0, 0) }} nm</span>
      </div>
      <div class="stat-card">
        <span class="label">光電流 <i>I</i> (検出値)</span>
        <span class="val" :class="photocurrent > 0 ? 'current-flow' : 'current-zero'">
          {{ fmt(photocurrent, 1) }} μ<i>A</i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, dot, text, line, arrow, useLoop, fmt } from './simUtils'

const canvasRef = ref(null)
const graphMode = ref('IV')

// 物理定数
const c = 2.9979e8 // 光速 m/s
const h = 6.626e-34 // プランク定数 J s
const e = 1.602e-19 // 素電荷 C
// 1 eV = 1.602e-19 J
// hc in eV*nm:
const hc_eV_nm = 1239.84

// 金属の種類リスト
const metals = [
  { name: 'セシウム (Cs)', W: 2.14 },
  { name: 'カリウム (K)', W: 2.30 },
  { name: 'ナトリウム (Na)', W: 2.75 },
  { name: '亜鉛 (Zn)', W: 4.31 },
  { name: '白金 (Pt)', W: 5.65 }
]
const selectedMetal = ref(0)
const currentMetal = computed(() => metals[selectedMetal.value])

// コントロール
const wavelength = ref(380) // nm
const intensity = ref(60) // %
const voltage = ref(0.0) // V

// 物理量計算
const freq = computed(() => (c / (wavelength.value * 1e-9)))
const photonEnergyEV = computed(() => hc_eV_nm / wavelength.value)
const KmaxEV = computed(() => Math.max(0, photonEnergyEV.value - currentMetal.value.W))
const V0 = computed(() => KmaxEV.value) // 阻止電圧 V0 = Kmax / e
const lambda0 = computed(() => hc_eV_nm / currentMetal.value.W)

// 光電流計算 (実験曲線の近似モデル)
const photocurrent = computed(() => {
  if (KmaxEV.value <= 0) return 0
  const V = voltage.value
  const v_stop = -V0.value
  if (V <= v_stop) return 0
  const Isat = intensity.value * 1.5
  // V > 0 では飽和、V0 ~ 0 間は二次関数的に立ち上がり
  if (V >= 1.0) return Isat
  const t = (V - v_stop) / (1.0 - v_stop)
  return Isat * Math.min(1, Math.max(0, Math.pow(t, 1.5)))
})

// 波長から光の色を算出 (可視光 RGB 近似)
const lightColor = computed(() => {
  const wl = wavelength.value
  let r = 0, g = 0, b = 0
  if (wl >= 200 && wl < 380) {
    // 紫外線 (淡い紫/シアン)
    r = 160; g = 32; b = 240
  } else if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380); g = 0; b = 1
    r = Math.round(r * 255); b = 255
  } else if (wl >= 440 && wl < 490) {
    r = 0; g = (wl - 440) / (490 - 440); b = 1
    g = Math.round(g * 255); b = 255
  } else if (wl >= 490 && wl < 510) {
    r = 0; g = 255; b = -(wl - 510) / (510 - 490)
    b = Math.round(b * 255)
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510); g = 255; b = 0
    r = Math.round(r * 255); g = 255
  } else if (wl >= 580 && wl < 645) {
    r = 255; g = -(wl - 645) / (645 - 580); b = 0
    r = 255; g = Math.round(g * 255)
  } else if (wl >= 645 && wl <= 750) {
    r = 255; g = 0; b = 0
  }
  return `rgb(${r}, ${g}, ${b})`
})

// 粒子アニメーション用
const photons = []
const electrons = []
let lastSpawn = 0

// アニメーションループ
useLoop((dt) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = 780
  const h = 420
  const ctx = setupCanvas(canvas, w, h)
  clearGrid(ctx, w, h, 30, '#09090b')

  updateParticles(dt)
  drawPhototube(ctx, w, h)
  if (graphMode.value === 'IV') {
    drawIVGraph(ctx, w, h)
  } else {
    drawV0NuGraph(ctx, w, h)
  }
})

// 粒子シミュレーション更新
function updateParticles(dt) {
  lastSpawn += dt
  const spawnInterval = 0.25 / (intensity.value / 50)
  const tubeCathodeX = 120
  const tubeAnodeX = 280
  const tubeMidY = 160

  // 光子生成
  if (lastSpawn > spawnInterval) {
    lastSpawn = 0
    // 光源から陰極へ向かう光子
    photons.push({
      x: 30,
      y: 70 + Math.random() * 40,
      vx: 240,
      vy: 110 + Math.random() * 40
    })
  }

  // 光子更新
  for (let i = photons.length - 1; i >= 0; i--) {
    const p = photons[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    // 陰極板 (x ~ 120, y: 110 ~ 210) に衝突
    if (p.x >= tubeCathodeX && p.y >= 100 && p.y <= 220) {
      // 電子放出判定: hν > W
      if (KmaxEV.value > 0) {
        // 電子の初速度 (Kmax に応じた速度)
        const vMax = Math.sqrt(KmaxEV.value) * 140
        const angle = (Math.random() - 0.5) * 0.8
        electrons.push({
          x: tubeCathodeX + 4,
          y: p.y,
          vx: vMax * (0.6 + 0.4 * Math.random()) * Math.cos(angle),
          vy: vMax * Math.sin(angle)
        })
      }
      photons.splice(i, 1)
    } else if (p.x > 300 || p.y > 300) {
      photons.splice(i, 1)
    }
  }

  // 電子更新 (電場による加速度 ax = (e * V / d) / m)
  const d = 0.16 // 極板間隔
  const ax = voltage.value * 220 // 電圧に応じた加速度
  for (let i = electrons.length - 1; i >= 0; i--) {
    const e_p = electrons[i]
    e_p.vx += ax * dt
    e_p.x += e_p.vx * dt
    e_p.y += e_p.vy * dt

    // 陽極に到達
    if (e_p.x >= tubeAnodeX) {
      electrons.splice(i, 1)
    }
    // 陰極に押し戻された（逆電圧で Uターン）
    else if (e_p.x < tubeCathodeX && e_p.vx < 0) {
      electrons.splice(i, 1)
    }
    // 管の外へはみ出し
    else if (e_p.y < 80 || e_p.y > 240) {
      electrons.splice(i, 1)
    }
  }
}

// -------------------------------------------------------------------
// 描画: 光電管と回路
// -------------------------------------------------------------------
function drawPhototube(ctx, w, h) {
  const cx = 200
  const cy = 160
  const rx = 100
  const ry = 70

  // ガラス管 (楕円)
  ctx.save()
  ctx.fillStyle = 'rgba(39, 39, 42, 0.4)'
  ctx.strokeStyle = 'rgba(161, 161, 170, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  text(ctx, '真空光電管', cx, cy - ry - 8, '#71717a', '11px sans-serif', 'center')

  // 陰極板 (左: C) - 金属板
  const catX = 120
  ctx.fillStyle = '#a1a1aa'
  ctx.fillRect(catX - 6, cy - 45, 8, 90)
  text(ctx, '陰極 K (金属)', catX - 10, cy + 62, '#a1a1aa', 'bold 11px sans-serif', 'right')

  // 陽極板 (右: A) - コレクター
  const anoX = 280
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(anoX - 2, cy - 45, 6, 90)
  text(ctx, '陽極 A', anoX + 10, cy + 62, '#f59e0b', 'bold 11px sans-serif', 'left')

  // 光源 (左上)
  ctx.fillStyle = lightColor.value
  ctx.beginPath()
  ctx.arc(30, 80, 16, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, '単色光源', 30, 52, '#e4e4e7', 'bold 11px sans-serif', 'center')
  text(ctx, `${wavelength.value} nm`, 30, 112, lightColor.value, 'bold 11px sans-serif', 'center')

  // 光線ビーム (半透明)
  const grad = ctx.createLinearGradient(30, 80, catX, cy)
  grad.addColorStop(0, lightColor.value)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(30, 80)
  ctx.lineTo(catX, cy)
  ctx.stroke()

  // 光子描画
  for (const p of photons) {
    dot(ctx, p.x, p.y, 4, lightColor.value, '#ffffff')
  }

  // 電子描画 (青白い発光)
  for (const ep of electrons) {
    dot(ctx, ep.x, ep.y, 3, '#38bdf8', '#ffffff')
  }

  // 外部回路 (光電管の下部配線)
  const yWire = 340
  ctx.strokeStyle = '#52525b'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  // 陰極から下へ
  ctx.moveTo(catX - 2, cy + 45)
  ctx.lineTo(catX - 2, yWire)
  ctx.lineTo(cx - 30, yWire)
  // 電源・可変抵抗
  ctx.moveTo(cx + 30, yWire)
  ctx.lineTo(anoX + 1, yWire)
  ctx.lineTo(anoX + 1, cy + 45)
  ctx.stroke()

  // 直流可変電源 (下部中央)
  drawVariablePower(ctx, cx, yWire, voltage.value)

  // 電流計 (左縦線)
  drawAmmeter(ctx, catX - 2, 260, photocurrent.value)

  ctx.restore()
}

function drawVariablePower(ctx, x, y, val) {
  ctx.save()
  ctx.fillStyle = '#09090b'
  ctx.fillRect(x - 30, y - 20, 60, 40)
  // 長い線 (正極)
  line(ctx, x - 10, y - 14, x - 10, y + 14, '#f43f5e', 2.5)
  // 短い線 (負極)
  line(ctx, x + 10, y - 8, x + 10, y + 8, '#38bdf8', 3.5)
  // 斜め矢印 (可変)
  arrow(ctx, x - 22, y + 18, x + 22, y - 18, '#fbbf24', 1.5)
  text(ctx, `V = ${fmt(val, 2)} V`, x, y + 32, '#e4e4e7', 'bold 11px sans-serif', 'center')
  ctx.restore()
}

function drawAmmeter(ctx, x, y, val) {
  ctx.save()
  ctx.fillStyle = '#09090b'
  ctx.fillRect(x - 18, y - 18, 36, 36)
  dot(ctx, x, y, 16, '#18181b', '#38bdf8')
  text(ctx, 'μA', x, y - 2, '#38bdf8', 'bold 10px sans-serif', 'center')
  text(ctx, `${fmt(val, 1)}`, x, y + 10, '#ffffff', 'bold 9px sans-serif', 'center')
  ctx.restore()
}

// -------------------------------------------------------------------
// グラフ描画: ① I-V 特性曲線
// -------------------------------------------------------------------
function drawIVGraph(ctx, w, h) {
  const gx0 = 430, gy0 = 340
  const gw = 310, gh = 250

  const minV = -4.0, maxV = 4.0
  const toX = (v) => gx0 + ((v - minV) / (maxV - minV)) * gw
  const toY = (i) => gy0 - (i / 160) * gh

  const xZero = toX(0)

  // 軸
  arrow(ctx, gx0, gy0, gx0 + gw + 15, gy0, '#71717a', 2, 'V [V]', { align: 'left', lx: 8 })
  arrow(ctx, xZero, gy0, xZero, gy0 - gh - 15, '#71717a', 2, 'I [μA]', { align: 'center', ly: -10 })

  // 目盛り
  for (let v = -4; v <= 4; v += 2) {
    const x = toX(v)
    line(ctx, x, gy0, x, gy0 - gh, 'rgba(63,63,70,0.25)', 1, [2, 2])
    text(ctx, `${v}`, x, gy0 + 16, '#a1a1aa', '11px sans-serif', 'center')
  }

  // 阻止電圧 -V0
  const vStop = -V0.value
  const Isat = intensity.value * 1.5

  // 曲線描画
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let px = 0; px <= gw; px += 2) {
    const vVal = minV + (px / gw) * (maxV - minV)
    let iVal = 0
    if (KmaxEV.value > 0 && vVal > vStop) {
      if (vVal >= 1.0) iVal = Isat
      else {
        const t = (vVal - vStop) / (1.0 - vStop)
        iVal = Isat * Math.min(1, Math.max(0, Math.pow(t, 1.5)))
      }
    }
    const x = toX(vVal)
    const y = toY(iVal)
    if (px === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 阻止電圧マーカー
  if (KmaxEV.value > 0 && vStop >= minV) {
    const xStop = toX(vStop)
    dot(ctx, xStop, gy0, 5, '#f43f5e')
    text(ctx, `-V₀ (${fmt(vStop, 2)}V)`, xStop, gy0 - 10, '#f43f5e', 'bold 11px sans-serif', 'center')
  }

  // 飽和電流線
  if (KmaxEV.value > 0) {
    const ySat = toY(Isat)
    line(ctx, toX(1.0), ySat, gx0 + gw, ySat, 'rgba(251,191,36,0.6)', 1.5, [4, 4])
    text(ctx, `飽和電流 Is = ${fmt(Isat, 0)}μA`, gx0 + gw, ySat - 8, '#fbbf24', '11px sans-serif', 'right')
  }

  // 現在の動作点
  const curX = toX(voltage.value)
  const curY = toY(photocurrent.value)
  line(ctx, curX, gy0, curX, curY, '#fbbf24', 1.5, [3, 3])
  line(ctx, xZero, curY, curX, curY, '#fbbf24', 1.5, [3, 3])
  dot(ctx, curX, curY, 6, '#fbbf24', '#ffffff')
  text(ctx, `動作点 (${fmt(voltage.value, 1)}V, ${fmt(photocurrent.value, 1)}μA)`, curX + 8, curY - 10, '#fbbf24', 'bold 11px sans-serif')
}

// -------------------------------------------------------------------
// グラフ描画: ② 阻止電圧 V0 vs 振動数 ν グラフ (アインシュタインの直線)
// -------------------------------------------------------------------
function drawV0NuGraph(ctx, w, h) {
  const gx0 = 430, gy0 = 340
  const gw = 310, gh = 250

  const minNu = 3.0, maxNu = 16.0 // 10^14 Hz
  const minV0 = 0, maxV0 = 5.0 // V
  const toX = (nu) => gx0 + ((nu - minNu) / (maxNu - minNu)) * gw
  const toY = (v) => gy0 - (v / maxV0) * gh

  // 軸
  arrow(ctx, gx0, gy0, gx0 + gw + 15, gy0, '#71717a', 2, 'ν [×10¹⁴ Hz]', { align: 'left', lx: 8 })
  arrow(ctx, gx0, gy0, gx0, gy0 - gh - 15, '#71717a', 2, 'V₀ [V]', { align: 'center', ly: -10 })

  // 目盛り
  for (let n = 4; n <= 16; n += 2) {
    const x = toX(n)
    line(ctx, x, gy0, x, gy0 - gh, 'rgba(63,63,70,0.25)', 1, [2, 2])
    text(ctx, `${n}`, x, gy0 + 16, '#a1a1aa', '11px sans-serif', 'center')
  }
  for (let v = 1; v <= 5; v += 1) {
    const y = toY(v)
    line(ctx, gx0, y, gx0 + gw, y, 'rgba(63,63,70,0.25)', 1, [2, 2])
    text(ctx, `${v}`, gx0 - 10, y + 4, '#a1a1aa', '11px sans-serif', 'right')
  }

  // アインシュタインの直線: eV0 = hν - W => V0 = (h/e)ν - W/e
  // h/e = 4.13567e-15 eV*s => (h/e) * 10^14 Hz = 0.4136 V
  const slope = 0.4136 // V per 10^14 Hz
  const nu0 = (currentMetal.value.W / slope) // 限界振動数 (×10^14 Hz)

  // 直線
  ctx.strokeStyle = '#34d399'
  ctx.lineWidth = 3
  ctx.beginPath()
  const startX = toX(Math.max(minNu, nu0))
  const startY = toY(0)
  const endX = toX(maxNu)
  const endY = toY((maxNu - nu0) * slope)
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // 限界振動数 ν0
  if (nu0 >= minNu && nu0 <= maxNu) {
    dot(ctx, toX(nu0), gy0, 5, '#f43f5e')
    text(ctx, `ν₀=${fmt(nu0, 2)}`, toX(nu0), gy0 + 28, '#f43f5e', 'bold 10px sans-serif', 'center')
  }

  // 傾き注記
  text(ctx, '傾き = h/e (プランク定数/素電荷)', toX(nu0 + 3), toY(2.2), '#34d399', 'bold 11px sans-serif')
  text(ctx, `y切片 = -W/e = -${currentMetal.value.W.toFixed(2)} V`, toX(nu0 + 3), toY(1.8), '#a1a1aa', '11px sans-serif')

  // 現在の測定点
  const currentNu = (freq.value * 1e-14)
  if (currentNu >= minNu && currentNu <= maxNu) {
    const ptX = toX(currentNu)
    const ptY = toY(V0.value)
    line(ctx, ptX, gy0, ptX, ptY, '#fbbf24', 1.5, [3, 3])
    line(ctx, gx0, ptY, ptX, ptY, '#fbbf24', 1.5, [3, 3])
    dot(ctx, ptX, ptY, 6, '#fbbf24', '#ffffff')
    text(ctx, `現在値 (${fmt(currentNu, 2)}, ${fmt(V0.value, 2)}V)`, ptX + 8, ptY - 8, '#fbbf24', 'bold 11px sans-serif')
  }
}
</script>

<style scoped>
.photoelectric-sim {
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

.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  padding: 0 0.15em;
  line-height: 1;
}

.frac .num {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.1em;
  font-size: 0.85em;
}

.frac .den {
  padding-top: 0.1em;
  font-size: 0.85em;
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
  margin-bottom: 12px;
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
  align-items: center;
  justify-content: space-between;
}

.control-group strong {
  color: #38bdf8;
}

.sub-info {
  font-size: 0.75rem;
  color: #71717a;
}

.color-chip {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #fff;
  margin-left: 6px;
}

.metal-select {
  background: #18181b;
  color: #f4f4f5;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.control-group input[type='range'] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.graph-toggle-row {
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

.graph-label {
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
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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
  font-size: 0.72rem;
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

.stat-card .val.zero-k {
  color: #ef4444;
}

.stat-card .val.current-flow {
  color: #4ade80;
}

.stat-card .val.current-zero {
  color: #71717a;
}
</style>
