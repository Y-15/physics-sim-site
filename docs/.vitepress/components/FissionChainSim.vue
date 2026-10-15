<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)

// 物理パラメータ
const controlRodDepth = ref(50) // 制御棒の挿入率 [%] (0: 完全引抜・暴走 ~ 100: 完全挿入・スクラム)
const u235Enrichment = ref(60) // ウラン235の濃縮度・密度 [%] (20 ~ 100)
const isPlaying = ref(true)

let animationFrameId = null

const width = 500
const height = 360

// シミュレーション状態
const state = ref({
  nuclei: [], // ウラン原子核
  neutrons: [], // 飛んでいる中性子
  fragments: [], // 分裂片
  fissionCount: 0,
  totalEnergyMev: 0,
  time: 0
})

// 実効増倍率 k の推定
const effectiveK = computed(() => {
  // 制御棒が高いほど k が低下、濃縮度が高いほど k が上昇
  // controlRodDepth = 50, enrichment = 60 のとき k ≈ 1.00
  const baseK = (u235Enrichment.value / 60) * (1.6 - (controlRodDepth.value / 100) * 1.2)
  return Math.max(0.2, Math.min(2.5, baseK))
})

const criticalityStatus = computed(() => {
  const k = effectiveK.value
  if (k > 1.05) return { name: '臨界超過 (Supercritical)', color: '#f43f5e' }
  if (k < 0.95) return { name: '未臨界 (Subcritical)', color: '#38bdf8' }
  return { name: '臨界達成 (Critical k≈1.0)', color: '#10b981' }
})

// 初期配置の作成
function initSimulation() {
  const nuclei = []
  const rows = 7
  const cols = 9
  const xSpacing = width / (cols + 1)
  const ySpacing = (height - 40) / (rows + 1)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 濃縮度に応じた確率で U-235 を配置
      const isU235 = Math.random() * 100 < u235Enrichment.value
      nuclei.push({
        x: xSpacing * (c + 1) + (Math.random() - 0.5) * 12,
        y: ySpacing * (r + 1) + (Math.random() - 0.5) * 12 + 20,
        isU235,
        isFissioned: false,
        flash: 0
      })
    }
  }

  // 初期の中性子を2個発射
  const neutrons = [
    { x: 40, y: height / 2 - 20, vx: 3.0, vy: 0.8, life: 180 },
    { x: 40, y: height / 2 + 20, vx: 2.8, vy: -0.6, life: 180 }
  ]

  state.value = {
    nuclei,
    neutrons,
    fragments: [],
    fissionCount: 0,
    totalEnergyMev: 0,
    time: 0
  }
}

function updatePhysics() {
  if (!isPlaying.value) return

  const s = state.value
  const rodRate = controlRodDepth.value / 100 // 制御棒による吸収確率

  // 中性子の更新
  for (let i = s.neutrons.length - 1; i >= 0; i--) {
    const n = s.neutrons[i]
    n.x += n.vx
    n.y += n.vy
    n.life--

    // 画面外または寿命
    if (n.x < 0 || n.x > width || n.y < 0 || n.y > height || n.life <= 0) {
      s.neutrons.splice(i, 1)
      continue
    }

    // 制御棒による吸収判定（上部から吊り下げられている制御棒）
    // 制御棒は垂直バーとして配置
    const rodAbsorbProb = rodRate * 0.08
    if (Math.random() < rodAbsorbProb) {
      s.neutrons.splice(i, 1)
      continue
    }

    // 原子核との衝突判定
    for (const nuc of s.nuclei) {
      if (!nuc.isFissioned && nuc.isU235) {
        const dist = Math.hypot(n.x - nuc.x, n.y - nuc.y)
        if (dist < 14) {
          // 核分裂発生！
          nuc.isFissioned = true
          nuc.flash = 1.0
          s.fissionCount++
          s.totalEnergyMev += 200 // 1回の核分裂あたり約200 MeV

          // 弾丸中性子は消滅
          s.neutrons.splice(i, 1)

          // 2〜3個の新しい中性子を四方に放出
          const numNewNeutrons = Math.random() < 0.5 ? 2 : 3
          for (let k = 0; k < numNewNeutrons; k++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 2.5 + Math.random() * 1.5
            s.neutrons.push({
              x: nuc.x,
              y: nuc.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 140
            })
          }

          // 分裂片 (Kr, Ba)
          s.fragments.push({
            x: nuc.x,
            y: nuc.y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 40
          })
          break
        }
      }
    }
  }

  // 分裂片の更新
  for (let i = s.fragments.length - 1; i >= 0; i--) {
    const f = s.fragments[i]
    f.x += f.vx
    f.y += f.vy
    f.life--
    if (f.life <= 0) {
      s.fragments.splice(i, 1)
    }
  }

  // 原子核のフラッシュ減衰
  for (const nuc of s.nuclei) {
    if (nuc.flash > 0) {
      nuc.flash -= 0.05
    }
  }

  // もし中性子が全滅したら、自動で1本補給（定常観察用）
  if (s.neutrons.length === 0 && Math.random() < 0.04) {
    const angle = (Math.random() - 0.5) * 0.8
    s.neutrons.push({
      x: 10,
      y: height * 0.3 + Math.random() * height * 0.4,
      vx: 3.0 * Math.cos(angle),
      vy: 3.0 * Math.sin(angle),
      life: 180
    })
  }

  // 中性子数が多すぎる場合の安全リミッター (ブラウザ負荷軽減)
  if (s.neutrons.length > 250) {
    s.neutrons.splice(0, s.neutrons.length - 200)
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  // 1. 制御棒の視覚化（上部から降りてくるホウ素・カドミウム棒）
  const rodHeight = (controlRodDepth.value / 100) * (height - 60)
  ctx.fillStyle = 'rgba(71, 85, 105, 0.45)'
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2
  for (let rx = 50; rx < width; rx += 55) {
    ctx.fillRect(rx - 4, 0, 8, rodHeight)
    ctx.strokeRect(rx - 4, 0, 8, rodHeight)
  }

  // 2. ウラン原子核の描画
  for (const nuc of state.value.nuclei) {
    if (nuc.isFissioned) {
      // 分裂後の残骸
      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.arc(nuc.x, nuc.y, 4, 0, Math.PI * 2)
      ctx.fill()

      if (nuc.flash > 0) {
        // 核分裂の瞬間フラッシュ
        const glow = ctx.createRadialGradient(nuc.x, nuc.y, 1, nuc.x, nuc.y, 25 * nuc.flash)
        glow.addColorStop(0, '#ffffff')
        glow.addColorStop(0.4, '#fbbf24')
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(nuc.x, nuc.y, 25 * nuc.flash, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      // 未分裂の原子核 (U-235: エメラルドグリーン, U-238: 暗い灰青)
      if (nuc.isU235) {
        ctx.fillStyle = '#10b981'
        ctx.beginPath()
        ctx.arc(nuc.x, nuc.y, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#34d399'
        ctx.lineWidth = 1.2
        ctx.stroke()
      } else {
        ctx.fillStyle = '#334155'
        ctx.beginPath()
        ctx.arc(nuc.x, nuc.y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // 3. 分裂片の描画
  ctx.fillStyle = '#fb923c'
  for (const f of state.value.fragments) {
    ctx.beginPath()
    ctx.arc(f.x, f.y, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 4. 中性子 (白く輝く小型球 + 軌跡)
  for (const n of state.value.neutrons) {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // 速度尾引線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(n.x, n.y)
    ctx.lineTo(n.x - n.vx * 3, n.y - n.vy * 3)
    ctx.stroke()
  }

  updatePhysics()
  animationFrameId = requestAnimationFrame(draw)
}

function fireManualNeutron() {
  state.value.neutrons.push({
    x: 20,
    y: height / 2 + (Math.random() - 0.5) * 80,
    vx: 3.5,
    vy: (Math.random() - 0.5) * 1.5,
    life: 200
  })
}

function handleScram() {
  controlRodDepth.value = 100 // 緊急挿入 (スクラム)
}

onMounted(() => {
  initSimulation()
  animationFrameId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-header">
      <div class="sim-title">
        <span class="icon">⚛️</span>
        <span>ウラン235核分裂連鎖反応シミュレーター</span>
      </div>
      <div class="badge" :style="{ borderColor: criticalityStatus.color, color: criticalityStatus.color }">
        {{ criticalityStatus.name }}
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="width" :height="height" class="sim-canvas"></canvas>

      <div class="stat-overlay">
        <div class="stat-row">
          <span class="lbl">中性子増倍率 <i>k</i>:</span>
          <span class="val highlight" :style="{ color: criticalityStatus.color }">
            {{ effectiveK.toFixed(2) }}
          </span>
        </div>
        <div class="stat-row">
          <span class="lbl">飛行中性子数:</span>
          <span class="val">{{ state.neutrons.length }} 個</span>
        </div>
        <div class="stat-row">
          <span class="lbl">累計核分裂数:</span>
          <span class="val">{{ state.fissionCount }} 回</span>
        </div>
        <div class="stat-row">
          <span class="lbl">放出熱エネルギー:</span>
          <span class="val" style="color: #fbbf24">
            {{ (state.totalEnergyMev / 1000).toFixed(1) }} GeV相当
          </span>
        </div>
      </div>

      <div class="legend-box">
        <div class="item"><span class="dot u235"></span> ²³⁵U 原子核</div>
        <div class="item"><span class="dot neutron"></span> 熱中性子 n</div>
        <div class="item"><span class="bar rod"></span> 制御棒 (中性子吸収)</div>
      </div>
    </div>

    <!-- コントロール群 -->
    <div class="controls-panel">
      <div class="control-row">
        <div class="control-group">
          <label>制御棒の挿入率: <span>{{ controlRodDepth }}%</span></label>
          <input type="range" v-model.number="controlRodDepth" min="0" max="100" step="5" />
        </div>
        <div class="control-group">
          <label>²³⁵U 濃縮度: <span>{{ u235Enrichment }}%</span></label>
          <input type="range" v-model.number="u235Enrichment" min="20" max="100" step="5" @input="initSimulation" />
        </div>
      </div>

      <div class="control-buttons">
        <button class="btn btn-neutron" @click="fireManualNeutron">中性子を発射 🎯</button>
        <button class="btn btn-scram" @click="handleScram">緊急停止 (SCRAM) 🚨</button>
        <button class="btn btn-secondary" @click="isPlaying = !isPlaying">
          {{ isPlaying ? '一時停止' : '再開' }}
        </button>
        <button class="btn btn-reset" @click="initSimulation">リセット</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  color: #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.1);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sim-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #38bdf8;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sim-canvas {
  width: 100%;
  max-width: 500px;
  height: auto;
  aspect-ratio: 500 / 360;
  display: block;
}

.stat-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.stat-row .lbl {
  color: #94a3b8;
}

.stat-row .val {
  font-family: monospace;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-row .val.highlight {
  font-size: 0.88rem;
}

.legend-box {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.8);
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  display: flex;
  gap: 0.8rem;
}

.legend-box .item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #cbd5e1;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.u235 { background: #10b981; }
.dot.neutron { background: #ffffff; box-shadow: 0 0 4px #ffffff; }
.bar.rod { width: 6px; height: 12px; background: #64748b; border-radius: 1px; }

.controls-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}

.control-group label span {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

input[type="range"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-neutron {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #38bdf8;
}
.btn-neutron:hover {
  background: #0369a1;
}

.btn-scram {
  background: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
  border: 1px solid #f43f5e;
  font-weight: bold;
}
.btn-scram:hover {
  background: #f43f5e;
  color: #ffffff;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.btn-reset:hover {
  color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
