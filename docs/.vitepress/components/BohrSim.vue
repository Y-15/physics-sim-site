<template>
  <div class="bohr-sim">
    <div class="sim-header">
      <div class="title-row">
        <h3>🔬 ボーアの水素原子模型・量子条件・スペクトル系列</h3>
        <span class="badge">Bohr Model &amp; Spectrum</span>
      </div>
      <p class="desc">
        電子のド・ブロイ波が軌道円周上で「定常波」をつくるボーアの量子条件 $2\pi r = n\lambda$ と、準位間遷移による光子の放出（ライマン・バルマー・パッシェン系列）をリアルタイムに体験できます。
      </p>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="controls-grid">
        <!-- 主量子数 n の選択 -->
        <div class="control-group">
          <label>現在の電子の軌道 (主量子数 $n$): <strong>n = {{ currentN }}</strong></label>
          <div class="n-buttons">
            <button
              v-for="n in 5"
              :key="n"
              :class="{ active: currentN === n }"
              @click="setOrbit(n)"
            >
              n = {{ n }}
            </button>
          </div>
        </div>

        <!-- 遷移先の指定 -->
        <div class="control-group">
          <label>遷移先を選択して光子を放出/吸収：</label>
          <div class="transition-buttons">
            <button
              v-for="target in availableTransitions"
              :key="target"
              @click="triggerTransition(target)"
              class="trans-btn"
            >
              {{ currentN > target ? '放出 (降下)' : '吸収 (励起)' }} ➔ n = {{ target }}
            </button>
          </div>
        </div>

        <!-- アニメーション表示切替 -->
        <div class="control-group">
          <label>定常波の振幅表示：</label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="showWave" />
            ド・ブロイ波（物質波）の波長・節の表示
          </label>
        </div>
      </div>
    </div>

    <!-- スペクトル系列タブ -->
    <div class="series-panel">
      <span class="series-title">代表的なスペクトル系列：</span>
      <div class="series-badges">
        <span class="badge-series lyman">ライマン系列 ($n \to 1$: 紫外線)</span>
        <span class="badge-series balmer">バルマー系列 ($n \to 2$: 可視光線)</span>
        <span class="badge-series paschen">パッシェン系列 ($n \to 3$: 赤外線)</span>
      </div>
    </div>

    <!-- ステータス値カード -->
    <div class="stats-panel">
      <div class="stat-card">
        <span class="label">軌道半径 $r_n = n^2 r_1$</span>
        <span class="val highlight">{{ fmt(rn, 3) }} nm</span>
      </div>
      <div class="stat-card">
        <span class="label">エネルギー準位 $E_n = -13.6/n^2$</span>
        <span class="val highlight-alt">{{ fmt(En, 2) }} eV</span>
      </div>
      <div class="stat-card">
        <span class="label">電子の速さ $v_n = v_1/n$</span>
        <span class="val">{{ fmt(vn * 1e-6, 2) }} $\times 10^6$ m/s</span>
      </div>
      <div class="stat-card">
        <span class="label">物質波波長 $\lambda_{\text{dB}} = h/mv$</span>
        <span class="val">{{ fmt(lambdaDB, 3) }} nm</span>
      </div>
      <div class="stat-card">
        <span class="label">円周 $2\pi r_n$ / $\lambda_{\text{dB}}$</span>
        <span class="val highlight">{{ currentN }} 波長分 (完全定常波)</span>
      </div>
      <div class="stat-card">
        <span class="label">直近の遷移波長 $\lambda$</span>
        <span class="val" :style="{ color: lastPhotonColor }">
          {{ lastPhotonWl ? fmt(lastPhotonWl, 1) + ' nm (' + lastPhotonType + ')' : '—' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, dot, text, line, arrow, useLoop, fmt } from './simUtils'

const canvasRef = ref(null)

// 物理定数
const r1 = 0.0529 // ボーア半径 nm (n=1)
const E1 = -13.606 // 基底エネルギー eV
const v1 = 2.188e6 // n=1 での速さ m/s
const c = 2.9979e8 // m/s
const hc_eV_nm = 1239.84 // hc in eV*nm

const currentN = ref(2)
const showWave = ref(true)

// 直近の光子遷移情報
const lastPhotonWl = ref(656.3) // Hα線 nm
const lastPhotonColor = ref('#f43f5e')
const lastPhotonType = ref('バルマー Hα 赤色光')

// 軌道半径
const rn = computed(() => currentN.value * currentN.value * r1)
// エネルギー
const En = computed(() => E1 / (currentN.value * currentN.value))
// 速さ
const vn = computed(() => v1 / currentN.value)
// ド・ブロイ波長
const lambdaDB = computed(() => (2 * Math.PI * rn.value) / currentN.value)

// 遷移可能な軌道一覧 (1〜5 のうち現在以外)
const availableTransitions = computed(() => {
  return [1, 2, 3, 4, 5].filter((n) => n !== currentN.value)
})

// 光子アニメーション用パーティクル
const flyingPhotons = []
let electronAngle = 0
let wavePhase = 0

// 軌道変更
function setOrbit(n) {
  triggerTransition(n)
}

// 遷移トリガー
function triggerTransition(targetN) {
  const nFrom = currentN.value
  const nTo = targetN
  if (nFrom === nTo) return

  // エネルギー差
  const E_from = E1 / (nFrom * nFrom)
  const E_to = E1 / (nTo * nTo)
  const deltaE = Math.abs(E_to - E_from)
  const wl = hc_eV_nm / deltaE // nm

  lastPhotonWl.value = wl

  // 光の種類・色判定
  let col = '#ffffff'
  let desc = ''
  if (Math.min(nFrom, nTo) === 1) {
    col = '#a855f7' // 紫外線 (ライマン)
    desc = 'ライマン系列 (紫外線)'
  } else if (Math.min(nFrom, nTo) === 2) {
    // バルマー系列 (可視光)
    if (Math.max(nFrom, nTo) === 3) { col = '#ef4444'; desc = 'バルマー Hα (赤色光)' }
    else if (Math.max(nFrom, nTo) === 4) { col = '#06b6d4'; desc = 'バルマー Hβ (青緑色光)' }
    else if (Math.max(nFrom, nTo) === 5) { col = '#3b82f6'; desc = 'バルマー Hγ (青紫色光)' }
    else { col = '#8b5cf6'; desc = 'バルマー (紫色光)' }
  } else if (Math.min(nFrom, nTo) === 3) {
    col = '#f97316' // 赤外線 (パッシェン)
    desc = 'パッシェン系列 (赤外線)'
  } else {
    col = '#ef4444'
    desc = '赤外線'
  }

  lastPhotonColor.value = col
  lastPhotonType.value = desc

  // 光子放出アニメーション生成
  const cx = 250, cy = 210
  const rPixel = 38 * nFrom
  const px = cx + rPixel * Math.cos(electronAngle)
  const py = cy + rPixel * Math.sin(electronAngle)

  flyingPhotons.push({
    x: px,
    y: py,
    vx: Math.cos(electronAngle) * 160 + (nFrom > nTo ? 80 : -80),
    vy: Math.sin(electronAngle) * 160,
    color: col,
    isEmission: nFrom > nTo,
    wl: wl,
    life: 1.8
  })

  currentN.value = targetN
}

// アニメーションループ
useLoop((dt) => {
  electronAngle += (vn.value / 1e6) * dt * 3.5
  wavePhase += dt * 8

  const canvas = canvasRef.value
  if (!canvas) return
  const w = 780
  const h = 420
  const ctx = setupCanvas(canvas, w, h)
  clearGrid(ctx, w, h, 30, '#09090b')

  updatePhotons(dt)
  drawAtom(ctx, w, h)
  drawEnergyLevels(ctx, w, h)
})

function updatePhotons(dt) {
  for (let i = flyingPhotons.length - 1; i >= 0; i--) {
    const p = flyingPhotons[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt
    if (p.life <= 0) {
      flyingPhotons.splice(i, 1)
    }
  }
}

// -------------------------------------------------------------------
// 描画: 水素原子模型 (左側: x: 30 ~ 470)
// -------------------------------------------------------------------
function drawAtom(ctx, w, h) {
  const cx = 240
  const cy = 210
  const baseScale = 36 // n=1 の半径ピクセル

  // 原子の同心円軌道 (n=1〜5)
  for (let n = 1; n <= 5; n++) {
    const rad = n * baseScale
    const isCurrent = n === currentN.value

    ctx.strokeStyle = isCurrent ? 'rgba(56, 189, 248, 0.5)' : 'rgba(113, 113, 122, 0.25)'
    ctx.lineWidth = isCurrent ? 2 : 1
    if (!isCurrent) ctx.setLineDash([3, 4])
    else ctx.setLineDash([])

    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 軌道ラベル
    text(ctx, `n=${n}`, cx + rad + 4, cy - 4, isCurrent ? '#38bdf8' : '#71717a', '10px sans-serif')
  }

  // 原子核 (陽子 +e)
  dot(ctx, cx, cy, 10, '#ef4444', '#ffffff')
  text(ctx, '+e', cx, cy + 3, '#ffffff', 'bold 9px sans-serif', 'center')
  text(ctx, '原子核 (陽子)', cx, cy + 22, '#ef4444', 'bold 11px sans-serif', 'center')

  // 現在の軌道上での物質波（ド・ブロイ波定常波）描画
  const n = currentN.value
  const rad = n * baseScale

  if (showWave.value) {
    ctx.save()
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    const waveAmp = 7 // 振幅
    const steps = 180
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2
      // 定常波: r(θ) = rad + A * sin(n*θ) * cos(phase)
      const r_theta = rad + waveAmp * Math.sin(n * theta) * Math.cos(wavePhase)
      const wx = cx + r_theta * Math.cos(theta)
      const wy = cy + r_theta * Math.sin(theta)
      if (i === 0) ctx.moveTo(wx, wy)
      else ctx.lineTo(wx, wy)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  // 電子位置
  const ex = cx + rad * Math.cos(electronAngle)
  const ey = cy + rad * Math.sin(electronAngle)

  // 電子 (グロー)
  const grad = ctx.createRadialGradient(ex, ey, 2, ex, ey, 14)
  grad.addColorStop(0, '#38bdf8')
  grad.addColorStop(1, 'rgba(56, 189, 248, 0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(ex, ey, 14, 0, Math.PI * 2)
  ctx.fill()

  dot(ctx, ex, ey, 6, '#38bdf8', '#ffffff')
  text(ctx, '-e', ex, ey + 2, '#000000', 'bold 8px sans-serif', 'center')

  // 速度ベクトル
  const ux = -Math.sin(electronAngle)
  const uy = Math.cos(electronAngle)
  const vLen = 28
  arrow(ctx, ex, ey, ex + ux * vLen, ey + uy * vLen, '#34d399', 2, `v_${n}`, { align: 'left', lx: 6 })

  // 飛んでいる光子
  for (const p of flyingPhotons) {
    dot(ctx, p.x, p.y, 5, p.color, '#ffffff')
    // 波動線（ギザギザ）
    ctx.strokeStyle = p.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
    ctx.stroke()
    text(ctx, `hν (${fmt(p.wl, 0)}nm)`, p.x + 12, p.y - 4, p.color, 'bold 10px sans-serif')
  }

  // 量子条件の注記
  text(ctx, `ボーアの量子条件: 2πr = nλ_dB (n = ${n})`, 30, 395, '#38bdf8', 'bold 12px monospace')
}

// -------------------------------------------------------------------
// 描画: エネルギー準位図 (右側: x: 500 ~ 750)
// -------------------------------------------------------------------
function drawEnergyLevels(ctx, w, h) {
  const lx0 = 510
  const lx1 = 740
  const y0 = 360 // E = -13.6 eV (n=1)
  const yInf = 80 // E = 0 eV (n=∞)
  const totalH = y0 - yInf

  text(ctx, '【水素原子のエネルギー準位】', lx0, 48, '#e4e4e7', 'bold 13px sans-serif')

  // E=0 線 (電離限界)
  line(ctx, lx0, yInf, lx1, yInf, '#f43f5e', 2)
  text(ctx, 'n = ∞ (E = 0 eV: 電離)', lx1 + 8, yInf + 4, '#f43f5e', '11px sans-serif')

  // 各準位の y 座標: En = E1 / n^2
  // E1 = -13.6 eV -> y0, 0 eV -> yInf
  const toY = (ev) => yInf + (ev / E1) * totalH

  for (let n = 1; n <= 5; n++) {
    const enVal = E1 / (n * n)
    const y = toY(enVal)
    const isCur = n === currentN.value

    // レベル線
    line(ctx, lx0, y, lx1, y, isCur ? '#38bdf8' : '#71717a', isCur ? 3 : 1.5)

    // ラベル
    text(ctx, `n = ${n}`, lx0 - 32, y + 4, isCur ? '#38bdf8' : '#a1a1aa', isCur ? 'bold 11px sans-serif' : '11px sans-serif')
    text(ctx, `${enVal.toFixed(2)} eV`, lx1 + 8, y + 4, isCur ? '#38bdf8' : '#a1a1aa', isCur ? 'bold 11px monospace' : '11px monospace')

    // 現在の準位に電子マーカー
    if (isCur) {
      dot(ctx, (lx0 + lx1) / 2, y, 7, '#38bdf8', '#ffffff')
      text(ctx, '● 現在の電子', (lx0 + lx1) / 2 + 14, y + 4, '#38bdf8', 'bold 11px sans-serif')
    }
  }

  // 遷移の矢印表示 (n=2 へのバルマー系列を例示)
  const y2 = toY(E1 / 4)
  const y3 = toY(E1 / 9)
  line(ctx, lx0 + 35, y3, lx0 + 35, y2, 'rgba(239, 68, 68, 0.4)', 2)
  text(ctx, 'Hα', lx0 + 40, (y2 + y3) / 2 + 3, '#ef4444', 'bold 10px sans-serif')
}
</script>

<style scoped>
.bohr-sim {
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 0.8rem;
  color: #d4d4d8;
}

.control-group strong {
  color: #38bdf8;
}

.n-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.n-buttons button {
  background: #18181b;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.n-buttons button:hover {
  background: #27272a;
  color: #fff;
}

.n-buttons button.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
  font-weight: 700;
}

.transition-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.trans-btn {
  background: #3f3f46;
  color: #f4f4f5;
  border: 1px solid #52525b;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.trans-btn:hover {
  background: #f59e0b;
  border-color: #fbbf24;
  color: #000;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.8rem !important;
  color: #38bdf8 !important;
}

.series-panel {
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

.series-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e4e4e7;
}

.series-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-series {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: sans-serif;
}

.badge-series.lyman {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid #a855f7;
  color: #c084fc;
}

.badge-series.balmer {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid #38bdf8;
  color: #38bdf8;
}

.badge-series.paschen {
  background: rgba(249, 115, 22, 0.2);
  border: 1px solid #f97316;
  color: #fb923c;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
</style>
