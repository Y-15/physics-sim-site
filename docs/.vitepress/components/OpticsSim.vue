<template>
  <div class="lab" style="--ac:#10b981;--ac2:#38bdf8">
    <div class="lab-head">
      <span class="lab-title">🔍 光の屈折・全反射とレンズの結像 実験室</span>
      <span class="lab-badge">{{ mode === 'refract' ? 'スネルの法則と全反射' : '凸レンズ・凹レンズの写像' }}</span>
    </div>

    <!-- モード切替タブ -->
    <div style="display:flex;gap:6px;padding:8px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08)">
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'refract' }" @click="mode = 'refract'">
        🌊 スネルの法則と全反射 (屈折・臨界角)
      </button>
      <button class="lab-btn" :class="{ 'lab-btn-pri': mode === 'lens' }" @click="mode = 'lens'">
        👓 凸レンズ・凹レンズの結像 (写像公式)
      </button>
    </div>

    <div class="lab-canvas"><canvas ref="canvasRef"></canvas></div>

    <!-- 屈折モードの操作 -->
    <div v-if="mode === 'refract'" class="lab-controls">
      <div class="lab-ctrl">
        <label>入射角 θ₁: <strong>{{ incAngleDeg.toFixed(1) }}°</strong></label>
        <input type="range" v-model.number="incAngleDeg" min="0" max="85" step="1" />
      </div>

      <div class="lab-ctrl">
        <label>媒質1の屈折率 n₁ (入射側): <strong>{{ n1.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="n1" min="1.0" max="2.4" step="0.05" />
        <div class="lab-note">1.00: 空気, 1.33: 水, 1.50: ガラス, 2.42: ダイヤ</div>
      </div>

      <div class="lab-ctrl">
        <label>媒質2の屈折率 n₂ (透過側): <strong>{{ n2.toFixed(2) }}</strong></label>
        <input type="range" v-model.number="n2" min="1.0" max="2.4" step="0.05" />
      </div>

      <div class="lab-ctrl">
        <label>プリセット</label>
        <div class="lab-row">
          <button class="lab-chip" @click="n1 = 1.0; n2 = 1.5; incAngleDeg = 45">空気 → ガラス (屈折角小)</button>
          <button class="lab-chip" @click="n1 = 1.5; n2 = 1.0; incAngleDeg = 50">ガラス → 空気 (全反射！)</button>
          <button class="lab-chip" @click="n1 = 1.33; n2 = 1.0; incAngleDeg = 40">水 → 空気 (臨界角48.8°)</button>
        </div>
      </div>
    </div>

    <!-- レンズモードの操作 -->
    <div v-else class="lab-controls">
      <div class="lab-ctrl">
        <label>物体の位置 a (レンズからの距離): <strong>{{ objDistA.toFixed(1) }} cm</strong></label>
        <input type="range" v-model.number="objDistA" min="10" max="80" step="2" />
        <div class="lab-note">物体を画面上で直接ドラッグ可能。焦点 f の前後で像が激変！</div>
      </div>

      <div class="lab-ctrl">
        <label>焦点距離 f: <strong>{{ (isConvex ? focalF : -focalF).toFixed(0) }} cm</strong></label>
        <input type="range" v-model.number="focalF" min="15" max="45" step="5" />
      </div>

      <div class="lab-ctrl">
        <label>レンズの種類</label>
        <div class="lab-row">
          <button class="lab-chip" :class="{ on: isConvex }" @click="isConvex = true">凸レンズ (f &gt; 0: 集光)</button>
          <button class="lab-chip" :class="{ on: !isConvex }" @click="isConvex = false">凹レンズ (f &lt; 0: 発散)</button>
        </div>
      </div>

      <div class="lab-ctrl">
        <label>物体の高さ h: <strong>{{ objHeight.toFixed(1) }} cm</strong></label>
        <input type="range" v-model.number="objHeight" min="10" max="40" step="2" />
      </div>
    </div>

    <!-- 屈折モードのステータス -->
    <div v-if="mode === 'refract'" class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">屈折角 θ₂</div>
        <div class="v" :style="{ color: isTotalReflection ? '#ec4899' : '#10b981' }">
          {{ isTotalReflection ? '⚠️ 全反射！' : refrAngleDeg.toFixed(1) + '°' }}
        </div>
        <div class="f">n₁ sinθ₁ = n₂ sinθ₂</div>
      </div>

      <div class="lab-stat">
        <div class="k">臨界角 θ_c</div>
        <div class="v" style="color:#f59e0b">{{ criticalAngleText }}</div>
        <div class="f">sinθ_c = n₂ / n₁ (n₁ &gt; n₂ のときのみ存在)</div>
      </div>

      <div class="lab-stat">
        <div class="k">相対屈折率 ₁n₂</div>
        <div class="v" style="color:#38bdf8">{{ (n2 / n1).toFixed(3) }}</div>
        <div class="f">₁n₂ = n₂ / n₁ = v₁ / v₂ = λ₁ / λ₂</div>
      </div>

      <div class="lab-stat">
        <div class="k">波長の変化比 λ₂ / λ₁</div>
        <div class="v" style="color:#a855f7">{{ (n1 / n2).toFixed(3) }}</div>
        <div class="f">屈折率が大きい媒質ほど波長が縮む</div>
      </div>
    </div>

    <!-- レンズモードのステータス -->
    <div v-else class="lab-stats">
      <div class="lab-stat hl">
        <div class="k">像の種類と位置 b</div>
        <div class="v" :style="{ color: imageInfo.isReal ? '#10b981' : '#f59e0b' }">
          {{ imageInfo.text }}
        </div>
        <div class="f">1/a + 1/b = 1/f より計算</div>
      </div>

      <div class="lab-stat">
        <div class="k">像の倍率 m</div>
        <div class="v" style="color:#38bdf8">{{ Math.abs(imageInfo.m).toFixed(2) }} <small>倍</small></div>
        <div class="f">m = |b| / a</div>
      </div>

      <div class="lab-stat">
        <div class="k">像の向き</div>
        <div class="v" style="color:#ec4899">{{ imageInfo.isReal ? '倒立（上下逆さま）' : '正立（同じ向き）' }}</div>
        <div class="f">{{ imageInfo.isReal ? 'スクリーンに映る実像' : '肉眼で覗いて見える虚像（虫眼鏡）' }}</div>
      </div>

      <div class="lab-stat">
        <div class="k">焦点の条件</div>
        <div class="v" style="color:#a855f7">{{ objDistA === focalF ? 'a = f（平行光線・像なし）' : (objDistA > focalF ? 'a > f（実像）' : 'a < f（虚像）') }}</div>
        <div class="f">a = 2f のとき等倍（m = 1.0）</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setupCanvas, clearGrid, arrow, text, dot, line, useLoop } from './simUtils.js'

const mode = ref('refract')

// 屈折モードパラメータ
const incAngleDeg = ref(45)
const n1 = ref(1.0)
const n2 = ref(1.5)

const incRad = computed(() => (incAngleDeg.value * Math.PI) / 180)

// 全反射判定
const isTotalReflection = computed(() => {
  if (n1.value <= n2.value) return false
  const sinCrit = n2.value / n1.value
  return Math.sin(incRad.value) >= sinCrit
})

// 屈折角
const refrAngleDeg = computed(() => {
  if (isTotalReflection.value) return 90
  const sinR = (n1.value * Math.sin(incRad.value)) / n2.value
  const clamped = Math.max(-1, Math.min(1, sinR))
  return (Math.asin(clamped) * 180) / Math.PI
})

// 臨界角テキスト
const criticalAngleText = computed(() => {
  if (n1.value <= n2.value) return 'なし (全反射しない)'
  const sinCrit = n2.value / n1.value
  const deg = (Math.asin(sinCrit) * 180) / Math.PI
  return `${deg.toFixed(1)}°`
})

// レンズモードパラメータ
const objDistA = ref(40) // cm
const focalF = ref(20) // cm
const isConvex = ref(true) // true: 凸, false: 凹
const objHeight = ref(20) // cm

// 写像公式: 1/a + 1/b = 1/f => 1/b = 1/f - 1/a => b = a*f / (a - f)
const imageInfo = computed(() => {
  const f = isConvex.value ? focalF.value : -focalF.value
  const a = objDistA.value

  if (Math.abs(a - f) < 0.2) {
    return { b: 9999, m: 9999, isReal: false, text: '無限遠 (平行光線・像なし)' }
  }

  const b = (a * f) / (a - f)
  const m = -b / a // 正立なら m > 0, 倒立なら m < 0
  const isReal = b > 0

  const signText = isReal ? `b = +${b.toFixed(1)} cm (実像)` : `b = ${b.toFixed(1)} cm (虚像)`
  return { b, m, isReal, text: signText }
})

const canvasRef = ref(null)

useLoop(canvasRef, ({ ctx, width, height }) => {
  clearGrid(ctx, width, height, 40)

  if (mode.value === 'refract') {
    drawRefraction(ctx, width, height)
  } else {
    drawLens(ctx, width, height)
  }
})

function drawRefraction(ctx, w, h) {
  const cx = w * 0.5
  const cy = h * 0.5
  const rayLen = Math.min(w, h) * 0.42

  // 1. 上下媒質の塗り分け
  // 上：媒質1
  ctx.fillStyle = 'rgba(56, 189, 248, 0.05)'
  ctx.fillRect(0, 0, w, cy)
  text(ctx, `媒質 1 (n₁ = ${n1.value.toFixed(2)})`, 30, 30, { align: 'left', color: '#38bdf8', font: 'bold 12px sans-serif' })

  // 下：媒質2
  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'
  ctx.fillRect(0, cy, w, h - cy)
  text(ctx, `媒質 2 (n₂ = ${n2.value.toFixed(2)})`, 30, cy + 30, { align: 'left', color: '#10b981', font: 'bold 12px sans-serif' })

  // 境界面（水平）
  line(ctx, 20, cy, w - 20, cy, { color: '#cbd5e1', width: 2.5 })

  // 法線（破線・垂直）
  line(ctx, cx, 20, cx, h - 20, { color: 'rgba(255, 255, 255, 0.3)', width: 1.5, dash: [4, 4] })
  text(ctx, '法線', cx + 8, 30, { align: 'left', color: '#94a3b8', font: '10px sans-serif' })

  // 2. 入射光線（左上から原点へ）
  const rad1 = incRad.value
  const inX = cx - rayLen * Math.sin(rad1)
  const inY = cy - rayLen * Math.cos(rad1)

  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 3
  line(ctx, inX, inY, cx, cy, { color: '#f43f5e', width: 3 })
  arrow(ctx, (inX + cx) / 2, (inY + cy) / 2, ((inX + cx) / 2) + Math.sin(rad1) * 15, ((inY + cy) / 2) + Math.cos(rad1) * 15, { color: '#f43f5e', width: 3, head: 7 })

  // 入射角 θ1 の円弧
  ctx.strokeStyle = '#f43f5e'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, 35, -Math.PI / 2 - rad1, -Math.PI / 2)
  ctx.stroke()
  text(ctx, `θ₁ = ${incAngleDeg.value}°`, cx - 30, cy - 42, { color: '#f43f5e', font: 'bold 11px sans-serif' })

  // 3. 反射光線（右上へ）
  const refX = cx + rayLen * Math.sin(rad1)
  const refY = cy - rayLen * Math.cos(rad1)
  const refAlpha = isTotalReflection.value ? 1.0 : 0.4
  line(ctx, cx, cy, refX, refY, { color: `rgba(244, 63, 94, ${refAlpha})`, width: isTotalReflection.value ? 3 : 1.5 })
  arrow(ctx, cx, cy, (cx + refX) / 2, (cy + refY) / 2, { color: `rgba(244, 63, 94, ${refAlpha})`, width: 2, head: 6 })
  text(ctx, isTotalReflection.value ? '全反射光 (100%反射)' : '一部反射光', refX, refY - 10, { color: '#f43f5e', font: '11px sans-serif' })

  // 4. 屈折光線（右下へ、全反射時はなし）
  if (!isTotalReflection.value) {
    const rad2 = (refrAngleDeg.value * Math.PI) / 180
    const outX = cx + rayLen * Math.sin(rad2)
    const outY = cy + rayLen * Math.cos(rad2)

    line(ctx, cx, cy, outX, outY, { color: '#10b981', width: 3 })
    arrow(ctx, cx, cy, (cx + outX) / 2, (cy + outY) / 2, { color: '#10b981', width: 3, head: 7 })

    // 屈折角 θ2 の円弧
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, 35, Math.PI / 2 - rad2, Math.PI / 2)
    ctx.stroke()
    text(ctx, `θ₂ = ${refrAngleDeg.value.toFixed(1)}°`, cx + 25, cy + 45, { color: '#10b981', font: 'bold 11px sans-serif' })
    text(ctx, '屈折光', outX, outY + 16, { color: '#10b981', font: 'bold 11px sans-serif' })
  } else {
    // 全反射警告バナー
    ctx.fillStyle = 'rgba(236, 72, 153, 0.2)'
    ctx.strokeStyle = '#ec4899'
    ctx.lineWidth = 2
    ctx.fillRect(cx - 150, cy + 30, 300, 36)
    ctx.strokeRect(cx - 150, cy + 30, 300, 36)
    text(ctx, '⚡ 臨界角超過：光は媒質2に入らず全反射します', cx, cy + 52, { color: '#fbcfe8', font: 'bold 12px sans-serif' })
  }
}

function drawLens(ctx, w, h) {
  const cx = w * 0.5
  const cy = h * 0.5
  const pxPerCm = 3.2

  // 1. 光軸（水平線）
  line(ctx, 30, cy, w - 30, cy, { color: '#64748b', width: 2 })
  text(ctx, '光軸', w - 40, cy + 18, { color: '#94a3b8', font: '10px sans-serif' })

  // 2. レンズ（中央縦軸）
  const lensH = 160
  if (isConvex.value) {
    // 凸レンズ形状（両膨らみ）
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, cy - lensH / 2)
    ctx.quadraticCurveTo(cx + 16, cy, cx, cy + lensH / 2)
    ctx.quadraticCurveTo(cx - 16, cy, cx, cy - lensH / 2)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
    ctx.fill()
    ctx.stroke()
    text(ctx, '凸レンズ', cx, cy - lensH / 2 - 12, { color: '#38bdf8', font: 'bold 11px sans-serif' })
  } else {
    // 凹レンズ形状（中央くぼみ）
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx - 10, cy - lensH / 2)
    ctx.lineTo(cx + 10, cy - lensH / 2)
    ctx.quadraticCurveTo(cx + 2, cy, cx + 10, cy + lensH / 2)
    ctx.lineTo(cx - 10, cy + lensH / 2)
    ctx.quadraticCurveTo(cx - 2, cy, cx - 10, cy - lensH / 2)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
    ctx.fill()
    ctx.stroke()
    text(ctx, '凹レンズ', cx, cy - lensH / 2 - 12, { color: '#38bdf8', font: 'bold 11px sans-serif' })
  }

  // 3. 焦点 F, F' のプロット
  const fPx = focalF.value * pxPerCm
  // 前方焦点 F (左)
  dot(ctx, cx - fPx, cy, 4, '#f59e0b')
  text(ctx, 'F', cx - fPx, cy + 16, { color: '#f59e0b', font: 'bold 11px sans-serif' })
  // 後方焦点 F' (右)
  dot(ctx, cx + fPx, cy, 4, '#f59e0b')
  text(ctx, "F'", cx + fPx, cy + 16, { color: '#f59e0b', font: 'bold 11px sans-serif' })

  // 2f の位置（等倍参照点）
  dot(ctx, cx - 2 * fPx, cy, 3, '#64748b')
  text(ctx, '2F', cx - 2 * fPx, cy + 16, { color: '#64748b', font: '10px sans-serif' })
  dot(ctx, cx + 2 * fPx, cy, 3, '#64748b')
  text(ctx, "2F'", cx + 2 * fPx, cy + 16, { color: '#64748b', font: '10px sans-serif' })

  // 4. 物体（左側の赤い矢印）
  const objX = cx - objDistA.value * pxPerCm
  const objH_px = objHeight.value * pxPerCm
  arrow(ctx, objX, cy, objX, cy - objH_px, { color: '#ef4444', width: 3.5, head: 8 })
  text(ctx, '物体', objX, cy - objH_px - 8, { color: '#ef4444', font: 'bold 11px sans-serif' })

  // 5. 光線作図 (3本の代表光線)
  const tipX = objX
  const tipY = cy - objH_px

  if (isConvex.value) {
    // 凸レンズの光線作図
    // 光線①: 光軸に平行な光線 -> レンズで屈折して後方焦点 F' を通る
    line(ctx, tipX, tipY, cx, tipY, { color: 'rgba(234, 179, 8, 0.75)', width: 1.8 })
    line(ctx, cx, tipY, cx + w, tipY + (tipY - cy) * -1.8, { color: 'rgba(234, 179, 8, 0.75)', width: 1.8 })

    // 光線②: レンズの中心 O を直進する光線
    line(ctx, tipX, tipY, cx, cy, { color: 'rgba(56, 189, 248, 0.75)', width: 1.8 })
    line(ctx, cx, cy, cx + (cx - tipX) * 1.5, cy + (cy - tipY) * 1.5, { color: 'rgba(56, 189, 248, 0.75)', width: 1.8 })

    // 像の描画
    const b = imageInfo.value.b
    if (Math.abs(b) < 150) {
      const imgX = cx + b * pxPerCm
      const imgH_px = objH_px * Math.abs(imageInfo.value.m)
      const isReal = imageInfo.value.isReal

      if (isReal) {
        // 実像（倒立・下向き矢印）
        arrow(ctx, imgX, cy, imgX, cy + imgH_px, { color: '#10b981', width: 3.5, head: 8 })
        text(ctx, `実像 (m=${Math.abs(imageInfo.value.m).toFixed(2)})`, imgX, cy + imgH_px + 16, { color: '#10b981', font: 'bold 11px sans-serif' })
      } else {
        // 虚像（正立・点線矢印）
        ctx.save()
        line(ctx, imgX, cy, imgX, cy - imgH_px, { color: '#f59e0b', width: 3.5, dash: [4, 4] })
        arrow(ctx, imgX, cy, imgX, cy - imgH_px, { color: '#f59e0b', width: 3.5, head: 8 })
        text(ctx, `虚像 (m=${Math.abs(imageInfo.value.m).toFixed(2)})`, imgX, cy - imgH_px - 8, { color: '#f59e0b', font: 'bold 11px sans-serif' })
        ctx.restore()
      }
    }
  } else {
    // 凹レンズの像（常に前方正立虚像）
    const b = imageInfo.value.b // 負
    const imgX = cx + b * pxPerCm
    const imgH_px = objH_px * Math.abs(imageInfo.value.m)

    // 虚像矢印
    line(ctx, imgX, cy, imgX, cy - imgH_px, { color: '#f59e0b', width: 3, dash: [4, 4] })
    arrow(ctx, imgX, cy, imgX, cy - imgH_px, { color: '#f59e0b', width: 3, head: 7 })
    text(ctx, `虚像 (縮小)`, imgX, cy - imgH_px - 8, { color: '#f59e0b', font: 'bold 11px sans-serif' })
  }
}
</script>
