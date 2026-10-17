<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="title-row">
        <span class="icon">🧊</span>
        <h3>熱量保存則・比熱・潜熱（相転移加熱曲線）シミュレーター</h3>
      </div>
      <p class="subtitle">
        物質の3態（固体・液体・気体）と熱量保存則 <i>Q</i><sub>得</sub> = <i>Q</i><sub>失</sub>。
        比熱による温度上昇 Q = mcΔ T と、状態変化に伴う潜熱（融解熱 334,J/g・蒸発熱2260,J/g）による温度一定プラトー、および氷と温水を混合した熱平衡の行方を完全シミュレーションします。
      </p>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="720" height="320"></canvas>
      <div class="state-badge" :class="stateClass">
        <span>熱平衡状態: <strong>{{ equilibriumResult.desc }}</strong></span>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="control-grid">
        <div class="control-group">
          <label>
            <span>投入する氷の質量 <i>m</i><sub>ice</sub>: <strong>{{ iceMassG }} g</strong></span>
            <input type="range" v-model.number="iceMassG" min="10" max="150" step="5" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>氷の初期温度 <i>T</i><sub>ice</sub>: <strong>{{ iceTempC }} ℃</strong></span>
            <input type="range" v-model.number="iceTempC" min="-40" max="0" step="2" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>容器内の温水の質量 <i>m</i><sub>w</sub>: <strong>{{ waterMassG }} g</strong></span>
            <input type="range" v-model.number="waterMassG" min="50" max="300" step="10" />
          </label>
        </div>

        <div class="control-group">
          <label>
            <span>温水の初期温度 <i>T</i><sub>w</sub>: <strong>{{ waterTempC }} ℃</strong></span>
            <input type="range" v-model.number="waterTempC" min="20" max="95" step="5" />
          </label>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-secondary" @click="setPreset('allMelt')">
          ☀️ すべて融解する条件 (氷30g / 温水150g, 60℃)
        </button>
        <button class="btn btn-secondary" @click="setPreset('coexist')">
          ❄️ 氷水共存 (0℃留まり) 条件 (氷100g / 温水80g, 40℃)
        </button>
      </div>
    </div>

    <!-- 物理量モニター -->
    <div class="stats-monitor">
      <div class="stat-card">
        <span class="label">最終平衡温度 <i>T</i><sub>f</sub></span>
        <span class="value highlight">{{ equilibriumResult.tempC.toFixed(1) }} <span class="unit">℃</span></span>
        <span class="subtext">熱量保存則 <i>Q</i><sub>得</sub> = <i>Q</i><sub>失</sub></span>
      </div>

      <div class="stat-card">
        <span class="label">残存する氷の質量</span>
        <span class="value">{{ equilibriumResult.remainingIceG.toFixed(1) }} <span class="unit">g</span></span>
        <span class="subtext">融解した氷: {{ (iceMassG - equilibriumResult.remainingIceG).toFixed(1) }} g</span>
      </div>

      <div class="stat-card">
        <span class="label">氷の全融解に必要な熱量 <i>Q</i><sub>1</sub></span>
        <span class="value">{{ (qRequiredToMelt / 1e3).toFixed(1) }} <span class="unit">kJ</span></span>
        <span class="subtext"><i>m</i><sub>ice</sub> <i>c</i><sub>ice</sub> |<i>T</i><sub>ice</sub>| + <i>m</i><sub>ice</sub> <i>L</i><sub>f</sub></span>
      </div>

      <div class="stat-card">
        <span class="label">温水が0℃までに放出可能な熱量 <i>Q</i><sub>2</sub></span>
        <span class="value">{{ (qAvailableFromWater / 1e3).toFixed(1) }} <span class="unit">kJ</span></span>
        <span class="subtext"><i>m</i><sub>w</sub> <i>c</i><sub>w</sub> <i>T</i><sub>w</sub></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const iceMassG = ref(50)
const iceTempC = ref(-15)
const waterMassG = ref(150)
const waterTempC = ref(50)

// 物理定数
const c_ice = 2.10   // J/(g·K)
const L_f = 334      // J/g (氷の融解熱)
const c_water = 4.18 // J/(g·K)

// 氷を 0℃ に加熱し、すべて融解するのに必要な熱量
const qHeatIceTo0 = computed(() => iceMassG.value * c_ice * Math.abs(iceTempC.value))
const qMeltAllIce = computed(() => iceMassG.value * L_f)
const qRequiredToMelt = computed(() => qHeatIceTo0.value + qMeltAllIce.value)

// 温水が 0℃ まで冷えるときに放出できる熱量
const qAvailableFromWater = computed(() => waterMassG.value * c_water * waterTempC.value)

// 熱平衡計算
const equilibriumResult = computed(() => {
  const qNeedToWarmIce = qHeatIceTo0.value
  const qAvail = qAvailableFromWater.value

  if (qAvail < qNeedToWarmIce) {
    // ケース1: 温水が0℃で全て凍っても氷を0℃まで温められない（極低温の氷）
    // 温水が全部凍結し、全体が氷となって 0℃ 未満になる
    const qWaterFreeze = waterMassG.value * L_f
    const qTotalAvail = qAvail + qWaterFreeze
    const totalIce = iceMassG.value + waterMassG.value
    const finalT = -Math.max(0.1, (qNeedToWarmIce - qTotalAvail) / (totalIce * c_ice))
    return {
      tempC: finalT,
      remainingIceG: totalIce,
      desc: `全凍結・氷相 (${finalT.toFixed(1)}℃)`
    }
  } else if (qAvail < qRequiredToMelt.value) {
    // ケース2: 氷は0℃に達するが、一部しか融解せず氷と水が共存する（0℃平衡）
    const qLeftForMelting = qAvail - qNeedToWarmIce
    const meltedG = qLeftForMelting / L_f
    const remainingIce = iceMassG.value - meltedG
    return {
      tempC: 0.0,
      remainingIceG: remainingIce,
      desc: `氷水共存 (0.0℃ 平衡, 氷${remainingIce.toFixed(1)}g 残留)`
    }
  } else {
    // ケース3: 氷はすべて融解し、全体が水となって 0℃ より高い温度になる
    const qSurplus = qAvail - qRequiredToMelt.value
    const totalWaterG = iceMassG.value + waterMassG.value
    const finalT = qSurplus / (totalWaterG * c_water)
    return {
      tempC: finalT,
      remainingIceG: 0,
      desc: `全融解・水相 (${finalT.toFixed(1)}℃)`
    }
  }
})

const stateClass = computed(() => {
  const res = equilibriumResult.value
  if (res.tempC > 0) return 'water'
  if (res.remainingIceG > 0 && res.remainingIceG < iceMassG.value) return 'coexist'
  return 'ice'
})

function setPreset(type) {
  if (type === 'allMelt') {
    iceMassG.value = 30
    iceTempC.value = -10
    waterMassG.value = 150
    waterTempC.value = 60
  } else if (type === 'coexist') {
    iceMassG.value = 100
    iceTempC.value = -20
    waterMassG.value = 80
    waterTempC.value = 40
  }
}

let animId = null
let waterWobble = 0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#090d16')
  bg.addColorStop(1, '#111827')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  waterWobble += 0.04

  // 画面分割:
  // 左側: 熱量計ビーカー内部の氷と水の描画 (w: 300)
  // 右側: 加熱曲線グラフ T(Q) (w: 380)

  // ---------- 左側: 熱量計ビーカー ----------
  const bX = 60
  const bY = 60
  const bW = 200
  const bH = 200

  // ビーカーガラス
  ctx.save()
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(bX, bY)
  ctx.lineTo(bX, bY + bH)
  ctx.lineTo(bX + bW, bY + bH)
  ctx.lineTo(bX + bW, bY)
  ctx.stroke()

  // 液面（水）の描画
  const res = equilibriumResult.value
  const totalLiquidG = (iceMassG.value - res.remainingIceG) + waterMassG.value
  const waterHeight = Math.min(bH - 20, (totalLiquidG / 350) * (bH - 30))
  const surfaceY = bY + bH - waterHeight

  if (totalLiquidG > 0) {
    const waterGrad = ctx.createLinearGradient(0, surfaceY, 0, bY + bH)
    // 温度に応じた水の色変化（青〜水色〜オレンジ）
    const tempRatio = Math.min(1, Math.max(0, res.tempC / 80))
    const rCol = Math.round(56 + tempRatio * 180)
    const gCol = Math.round(189 - tempRatio * 60)
    const bCol = Math.round(248 - tempRatio * 150)

    waterGrad.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, 0.5)`)
    waterGrad.addColorStop(1, `rgba(${rCol}, ${gCol}, ${bCol}, 0.8)`)

    ctx.fillStyle = waterGrad
    ctx.beginPath()
    ctx.moveTo(bX + 2, surfaceY)
    // 微小な波
    for (let px = bX + 2; px <= bX + bW - 2; px += 10) {
      const wy = surfaceY + Math.sin(waterWobble + px * 0.05) * 1.5
      ctx.lineTo(px, wy)
    }
    ctx.lineTo(bX + bW - 2, bY + bH - 2)
    ctx.lineTo(bX + 2, bY + bH - 2)
    ctx.closePath()
    ctx.fill()
  }

  // 浮遊する氷（残存量に応じたブロック数・サイズ）
  if (res.remainingIceG > 0.5) {
    const iceScale = Math.min(1.2, Math.max(0.3, res.remainingIceG / 80))
    const numCubes = res.remainingIceG > 40 ? 3 : (res.remainingIceG > 15 ? 2 : 1)

    ctx.fillStyle = 'rgba(224, 242, 254, 0.85)'
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 1.5

    for (let k = 0; k < numCubes; k++) {
      const cubeW = 32 * iceScale
      const cubeH = 26 * iceScale
      const cx = bX + 45 + k * 50
      const cy = surfaceY - cubeH * 0.35 + Math.sin(waterWobble + k) * 2

      ctx.beginPath()
      ctx.roundRect(cx, cy, cubeW, cubeH, 4)
      ctx.fill()
      ctx.stroke()

      // 氷の結晶テクスチャ
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.moveTo(cx + 4, cy + 4); ctx.lineTo(cx + cubeW - 4, cy + cubeH - 4)
      ctx.stroke()
    }

    ctx.fillStyle = '#e0f2fe'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`氷残留: ${res.remainingIceG.toFixed(1)}g`, bX + bW / 2, surfaceY - 24)
  }

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('断熱熱量計ビーカー', bX + bW / 2, bY + bH + 24)
  ctx.restore()

  // ---------- 右側: 加熱曲線グラフ T(Q) ----------
  const gX = 350
  const gY = 50
  const gW = 330
  const gH = 220

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(gX, gY, gW, gH)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(gX, gY, gW, gH)

  // 0℃ の基準線
  const zeroY = gY + gH * 0.68
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(gX, zeroY); ctx.lineTo(gX + gW, zeroY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#38bdf8'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('0 ℃ (融点)', gX + 6, zeroY - 4)

  // 100℃ の基準線
  const hundredY = gY + gH * 0.18
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(gX, hundredY); ctx.lineTo(gX + gW, hundredY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#f87171'
  ctx.fillText('100 ℃ (沸点)', gX + 6, hundredY - 4)

  // 加熱曲線（氷→融解→水→沸騰→水蒸気）のモデル曲線
  ctx.save()
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2.5
  ctx.beginPath()

  const q0X = gX + 25
  const q0Y = gY + gH - 20 // -20℃

  const q1X = gX + 65
  const q1Y = zeroY        // 0℃ 氷

  const q2X = gX + 160
  const q2Y = zeroY        // 0℃ 水（融解潜熱プラトー）

  const q3X = gX + 245
  const q3Y = hundredY     // 100℃ 水

  const q4X = gX + 315
  const q4Y = hundredY     // 100℃ 蒸気（蒸発潜熱プラトー）

  ctx.moveTo(q0X, q0Y)
  ctx.lineTo(q1X, q1Y)
  ctx.lineTo(q2X, q2Y)
  ctx.lineTo(q3X, q3Y)
  ctx.lineTo(q4X, q4Y)
  ctx.stroke()
  ctx.restore()

  // プラトー注記
  ctx.fillStyle = '#fbbf24'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('融解熱 Lf', (q1X + q2X) / 2, zeroY + 14)
  ctx.fillText('蒸発熱 Lv', (q3X + q4X) / 2, hundredY + 14)

  // 現在の平衡温度ポイントのプロット
  let curPlotX = q2X
  let curPlotY = zeroY
  if (res.tempC <= 0) {
    if (res.remainingIceG >= iceMassG.value) {
      curPlotX = q0X
      curPlotY = q0Y
    } else {
      // 0℃ プラトーの途中
      const meltFraction = (iceMassG.value - res.remainingIceG) / iceMassG.value
      curPlotX = q1X + (q2X - q1X) * meltFraction
      curPlotY = zeroY
    }
  } else {
    // 0℃〜100℃ の間
    const tRatio = Math.min(1, res.tempC / 100)
    curPlotX = q2X + (q3X - q2X) * tRatio
    curPlotY = zeroY - (zeroY - hundredY) * tRatio
  }

  ctx.fillStyle = '#ec4899'
  ctx.shadowColor = '#ec4899'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(curPlotX, curPlotY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#f472b6'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`現在の平衡点 (${res.tempC.toFixed(1)}℃)`, curPlotX, curPlotY - 12)

  // 軸ラベル
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('加熱曲線 T-Q グラフ', gX + 10, gY + 16)
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('加えられた熱量 Q →', gX + gW - 95, gY + gH - 6)

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.state-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.state-badge.water {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid #38bdf8;
  color: #38bdf8;
}

.state-badge.coexist {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid #fbbf24;
  color: #fbbf24;
}

.state-badge.ice {
  background: rgba(148, 163, 184, 0.2);
  border: 1px solid #94a3b8;
  color: #cbd5e1;
}
</style>
