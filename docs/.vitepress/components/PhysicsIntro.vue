<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const isClient = ref(false)
const isVisible = ref(false)
const isFadingOut = ref(false)
const isSoundEnabled = ref(false)

const canvasRef = ref(null)
let animationId = null
let audioCtx = null
let masterGain = null

// アニメーション進行管理（映画的シークエンス + 完成後1.8秒間の安定静止表示HOLD）
const simTime = ref(0)
const animDuration = 3.6 // 宇宙創生からタイトル・原子完全完成まで
const holdDuration = 1.8 // 再生後に完成画面をそのまま安定表示する静止余韻時間（1〜2秒間）
const totalMaxDuration = animDuration + holdDuration // 合計5.4秒でシネマティック着地
const currentPhase = ref(0)
const phaseCaption = ref('SINGULARITY // QUANTUM VACUUM FLUCTUATION')

// タイトル完成（3.4s〜）で「実験室へ入る」ボタンを表示し、完成静止モードへ
const isReadyToEnter = computed(() => simTime.value >= 3.4)
// 初期アニメーション進行度（0%〜100%）
const progressPercent = computed(() => Math.min(100, Math.floor((simTime.value / animDuration) * 100)))

// マウスインタラクション（重力レンズ効果）
const mouse = {
  x: -1000,
  y: -1000,
  isDown: false,
  active: false
}

// 物理公式（宇宙の深遠に刻まれた不変の真理・天球星座の神聖幾何学）
const formulas = [
  { text: 'm(d²r/dt²) = F', desc: '✦ ニュートン力学 // 万物運動の基本法則', x: 0.14, y: 0.28, size: 21, delay: 0.8 },
  { text: 'E = mc²', desc: '✦ 特殊相対性理論 // 質量とエネルギーの等価性', x: 0.86, y: 0.26, size: 23, delay: 1.0 },
  { text: '∇ × E = -∂B/∂t', desc: '✦ マクスウェル方程式 // 電磁誘導と光の統一', x: 0.14, y: 0.73, size: 20, delay: 1.2 },
  { text: 'iħ(∂ψ/∂t) = Ĥψ', desc: '✦ シュレーディンガー方程式 // 量子波動と確率の幾何学', x: 0.86, y: 0.73, size: 21, delay: 1.4 },
  { text: 'G_μν = (8πG/c⁴)T_μν', desc: '✦ 一般相対性理論 // 重力と時空の曲率幾何学', x: 0.50, y: 0.17, size: 21, delay: 1.7 },
  { text: 'E = hν = hc/λ', desc: '✦ プランクの量子仮説 // 光子エネルギーと普遍定数', x: 0.50, y: 0.90, size: 20, delay: 2.0 }
]

// 音響シンセサイザー (Web Audio API: 432Hzピタゴラス調律 & 528Hzソルフェジオ・クリスタルボウル和音)
function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.22, audioCtx.currentTime)
    masterGain.connect(audioCtx.destination)
  } catch (e) {
    console.warn('Web Audio not supported', e)
  }
}

function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
  isSoundEnabled.value = !isSoundEnabled.value
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isSoundEnabled.value ? 0.25 : 0, audioCtx.currentTime)
    if (isSoundEnabled.value) {
      playTone(432, 'sine', 1.8, 0.08)
    }
  }
}

// デュアル・オシレーター（わずかなデチューンによる天球のうなり・コーラス残響）
function playTone(freq, type = 'sine', duration = 0.5, gainVal = 0.1) {
  if (!isSoundEnabled.value || !audioCtx) return
  try {
    const osc1 = audioCtx.createOscillator()
    const osc2 = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc1.type = type
    osc1.frequency.setValueAtTime(freq, audioCtx.currentTime)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 1.0025, audioCtx.currentTime) // 微小な揺らぎ（コーラス・うなり）

    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.00005, audioCtx.currentTime + duration)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(masterGain)

    osc1.start()
    osc2.start()
    osc1.stop(audioCtx.currentTime + duration)
    osc2.stop(audioCtx.currentTime + duration)
  } catch (e) {}
}

function playBigBangSound() {
  if (!isSoundEnabled.value || !audioCtx) return
  try {
    // 深宇宙の重低音サブベース（オーム OM 周波数 108Hz -> 36Hz）
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(108, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(36, audioCtx.currentTime + 2.2)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0005, audioCtx.currentTime + 2.4)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(audioCtx.currentTime + 2.4)
  } catch (e) {}
}

function playChimeSound() {
  if (!isSoundEnabled.value || !audioCtx) return
  try {
    // 神秘のピタゴラス調律 432Hz & ソルフェジオ 528Hz クリスタルボウル共鳴倍音
    const freqs = [216.0, 432.0, 528.0, 648.0, 864.0, 1296.0]
    freqs.forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 3.8, 0.045), i * 160)
    })
  } catch (e) {}
}

// ==========================================
// 神秘の深宇宙星屑 & 流星 (Meteors)
// ==========================================
const NUM_PARTICLES = 520
const particles = []
const meteors = []
const shockwaves = []

class Meteor {
  constructor(w, h) {
    this.reset(w, h)
  }

  reset(w, h) {
    this.x = Math.random() * w * 1.2 - w * 0.1
    this.y = Math.random() * h * 0.45 - 60
    this.len = Math.random() * 140 + 80
    this.speed = Math.random() * 480 + 360
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35
    this.alpha = Math.random() * 0.75 + 0.25
    this.active = false
    this.timer = Math.random() * 2.2 + 0.4
  }

  update(dt, w, h) {
    if (!this.active) {
      this.timer -= dt
      if (this.timer <= 0) this.active = true
      return
    }
    this.x += Math.cos(this.angle) * this.speed * dt
    this.y += Math.sin(this.angle) * this.speed * dt
    this.alpha -= 0.65 * dt
    if (this.alpha <= 0 || this.x > w + 100 || this.y > h + 100) {
      this.reset(w, h)
    }
  }

  draw(ctx) {
    if (!this.active || this.alpha <= 0) return
    const tailX = this.x - Math.cos(this.angle) * this.len
    const tailY = this.y - Math.sin(this.angle) * this.len
    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y)
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
    grad.addColorStop(0.7, `rgba(186, 230, 253, ${this.alpha * 0.5})`)
    grad.addColorStop(1, `rgba(255, 255, 255, ${this.alpha})`)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(this.x, this.y)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.6
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.restore()
  }
}

class StarParticle {
  constructor(w, h) {
    this.reset(w, h, true)
  }

  reset(w, h, initial = false) {
    const angle = Math.random() * Math.PI * 2
    const dist = initial ? Math.random() * Math.max(w, h) * 0.7 : Math.random() * 80 + 10
    this.x = w / 2 + Math.cos(angle) * dist
    this.y = h / 2 + Math.sin(angle) * dist
    this.vx = (Math.random() - 0.5) * 35
    this.vy = (Math.random() - 0.5) * 35
    this.size = Math.random() * 2.2 + 0.8
    this.baseSize = this.size
    this.orbitRadius = Math.random() * 270 + 60
    this.orbitAngle = Math.random() * Math.PI * 2
    this.orbitSpeed = (Math.random() * 1.2 + 0.4) * (Math.random() < 0.5 ? 1 : -1)
    // 神秘的な星気色：天藍（シアン）、恒星ゴールド、星雲アメジスト、純白
    const colorRnd = Math.random()
    this.hue = colorRnd < 0.5 ? 195 + Math.random() * 25 : (colorRnd < 0.75 ? 42 + Math.random() * 18 : 275 + Math.random() * 30)
    this.isPureWhite = Math.random() < 0.2
    this.alpha = Math.random() * 0.7 + 0.3
    this.twinklePhase = Math.random() * Math.PI * 2
    this.twinkleSpeed = Math.random() * 3 + 1.5
    this.trail = []
  }

  update(dt, t, cx, cy, phase) {
    // 軌跡記録
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > (phase === 2 ? 10 : 5)) this.trail.shift()

    if (phase === 0) {
      // Phase 0: 特異点への強力な吸い込み（重力ポテンシャル井戸）
      const dx = cx - this.x
      const dy = cy - this.y
      const dist = Math.hypot(dx, dy) || 1
      const force = Math.min(2500, 45000 / (dist * dist + 100))
      // 接線方向の角運動量保存（旋回しながら吸い込まれる）
      const tangX = -dy / dist
      const tangY = dx / dist
      this.vx += (dx / dist * force + tangX * 180) * dt
      this.vy += (dy / dist * force + tangY * 180) * dt
      this.vx *= 0.94
      this.vy *= 0.94
      this.x += this.vx * dt
      this.y += this.vy * dt
    } else if (phase === 1) {
      // Phase 1: ビッグバン・インフレーション（外側への超高速拡散）
      const dx = this.x - cx
      const dy = this.y - cy
      const dist = Math.hypot(dx, dy) || 1
      const blowSpeed = 650 + Math.random() * 350
      this.vx = (dx / dist) * blowSpeed
      this.vy = (dy / dist) * blowSpeed
      this.x += this.vx * dt
      this.y += this.vy * dt
    } else if (phase === 2) {
      // Phase 2: ケプラー運動と秩序形成（楕円軌道での優雅な旋回）
      this.orbitAngle += this.orbitSpeed * dt * 1.4
      const targetX = cx + Math.cos(this.orbitAngle) * this.orbitRadius * 1.3
      const targetY = cy + Math.sin(this.orbitAngle) * (this.orbitRadius * 0.65)
      this.x += (targetX - this.x) * 0.12
      this.y += (targetY - this.y) * 0.12
    } else {
      // Phase 3 & 4: ラボワープ（外側へ広がりながら光条へと収束）
      const dx = this.x - cx
      const dy = this.y - cy
      const dist = Math.hypot(dx, dy) || 1
      this.x += (dx / dist) * (180 + t * 90) * dt
      this.y += (dy / dist) * (180 + t * 90) * dt
    }

    // マウス重力レンズ干渉
    if (mouse.active) {
      const mdx = mouse.x - this.x
      const mdy = mouse.y - this.y
      const mdist = Math.hypot(mdx, mdy)
      if (mdist < 180 && mdist > 5) {
        const mForce = (1 - mdist / 180) * 120
        this.x -= (mdx / mdist) * mForce * dt
        this.y -= (mdy / mdist) * mForce * dt
      }
    }
  }

  draw(ctx, phase, t) {
    const twinkle = 0.5 + 0.5 * Math.sin((t || 0) * this.twinkleSpeed + this.twinklePhase)
    const currentAlpha = this.alpha * (0.65 + 0.35 * twinkle)
    const currentSize = this.size * (0.85 + 0.25 * twinkle)

    // トレイル描画（光の糸）
    if (this.trail.length > 2) {
      ctx.beginPath()
      ctx.moveTo(this.trail[0].x, this.trail[0].y)
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y)
      }
      ctx.strokeStyle = this.isPureWhite
        ? `rgba(255, 255, 255, ${currentAlpha * 0.4})`
        : `hsla(${this.hue}, 95%, 70%, ${currentAlpha * 0.35})`
      ctx.lineWidth = currentSize * 0.7
      ctx.stroke()
    }

    // 粒子本体（発光ブルーム）
    ctx.beginPath()
    ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2)
    ctx.fillStyle = this.isPureWhite
      ? `rgba(255, 255, 255, ${currentAlpha})`
      : `hsla(${this.hue}, 100%, 80%, ${currentAlpha})`
    ctx.fill()
  }
}

// 惑星系のケプラー運動モデル
const planets = [
  { a: 140, b: 70, speed: 1.8, color: '#38bdf8', size: 5.5, name: 'Planet I (v ∝ 1/√r)' },
  { a: 220, b: 110, speed: 1.1, color: '#10b981', size: 7.0, name: 'Planet II (Kepler III)' },
  { a: 310, b: 155, speed: 0.65, color: '#f59e0b', size: 8.5, name: 'Planet III (Conservation)' }
]

// ==========================================
// レンダリング関数（神秘の深宇宙 & 宇宙の織物）
// ==========================================

// 神秘の深宇宙・星雲ガス & オーロラカーテン（Cosmic Nebula Clouds & Aurora Curtains）
function drawNebulaClouds(ctx, w, h, t, cx, cy) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'

  // 1. コズミック・ディープシアン星雲（ゆっくり漂う星間ガス）
  const neb1X = cx + Math.cos(t * 0.2) * (w * 0.2) - w * 0.1
  const neb1Y = cy + Math.sin(t * 0.16) * (h * 0.18) - h * 0.08
  const rad1 = Math.max(w, h) * 0.62
  const grad1 = ctx.createRadialGradient(neb1X, neb1Y, 15, neb1X, neb1Y, rad1)
  grad1.addColorStop(0, 'rgba(14, 165, 233, 0.22)') // シアン
  grad1.addColorStop(0.35, 'rgba(56, 189, 248, 0.09)')
  grad1.addColorStop(0.75, 'rgba(99, 102, 241, 0.035)')
  grad1.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad1
  ctx.fillRect(0, 0, w, h)

  // 2. ディープアメジスト・バイオレット星雲（神聖な紫紺の雲）
  const neb2X = cx - Math.cos(t * 0.18) * (w * 0.18) + w * 0.12
  const neb2Y = cy - Math.sin(t * 0.22) * (h * 0.14) + h * 0.10
  const rad2 = Math.max(w, h) * 0.58
  const grad2 = ctx.createRadialGradient(neb2X, neb2Y, 20, neb2X, neb2Y, rad2)
  grad2.addColorStop(0, 'rgba(168, 85, 247, 0.20)') // バイオレット
  grad2.addColorStop(0.4, 'rgba(217, 70, 239, 0.07)')
  grad2.addColorStop(0.8, 'rgba(236, 72, 153, 0.025)')
  grad2.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad2
  ctx.fillRect(0, 0, w, h)

  // 3. 宇宙創生のゴールド・アンバー核光（神聖な後光）
  const pulse = Math.sin(t * 1.3) * 0.025 + 0.15
  const rad3 = Math.min(w, h) * 0.48
  const grad3 = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad3)
  grad3.addColorStop(0, `rgba(251, 191, 36, ${pulse * 1.2})`)
  grad3.addColorStop(0.35, `rgba(245, 158, 11, ${pulse * 0.55})`)
  grad3.addColorStop(0.7, 'rgba(56, 189, 248, 0.03)')
  grad3.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad3
  ctx.fillRect(0, 0, w, h)

  // 4. オーロラカーテン光帯（Aurora Curtains）
  const auroraY1 = h * 0.26
  const auroraY2 = h * 0.74
  drawAuroraWave(ctx, w, auroraY1, t, 0.7, 'rgba(52, 211, 153, 0.06)', 'rgba(56, 189, 248, 0.07)')
  drawAuroraWave(ctx, w, auroraY2, t + 1.2, 0.5, 'rgba(168, 85, 247, 0.06)', 'rgba(236, 72, 153, 0.04)')

  ctx.restore()
}

function drawAuroraWave(ctx, w, baseY, t, speed, color1, color2) {
  ctx.beginPath()
  ctx.moveTo(0, baseY)
  for (let x = 0; x <= w; x += 15) {
    const wave = Math.sin(x * 0.0035 + t * speed) * 32 + Math.cos(x * 0.007 - t * speed * 0.6) * 18
    ctx.lineTo(x, baseY + wave)
  }
  ctx.lineTo(w, baseY + 70)
  ctx.lineTo(0, baseY + 70)
  ctx.closePath()
  const grad = ctx.createLinearGradient(0, baseY - 40, 0, baseY + 70)
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
  grad.addColorStop(0.4, color1)
  grad.addColorStop(0.7, color2)
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fill()
}

// 神秘の時空測地線グリッド & 天球儀リング（Celestial Astrolabe）
function drawSpacetimeGrid(ctx, w, h, t, cx, cy, phase) {
  ctx.save()

  // 1. 神聖天球儀リング（Armillary Astrolabe Rings: 古代ルネサンスの天球儀と黄道帯）
  const maxR = Math.max(w, h) * 0.58
  // 同心円天球環
  for (let r = 70; r < maxR; r += 85) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.055)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 10])
    ctx.stroke()
  }
  ctx.setLineDash([])

  // 3D傾斜の黄道天球環（Ecliptic Celestial Ring）
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(0.42 + t * 0.04)
  ctx.scale(1, 0.32)
  ctx.beginPath()
  ctx.arc(0, 0, 360, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // 黄道環の目盛り（Degrees of the Zodiac / Astrolabe Ticks）
  const ticks = 48
  for (let i = 0; i < ticks; i++) {
    const ang = (i * Math.PI * 2) / ticks
    const r1 = 352
    const r2 = (i % 4 === 0) ? 368 : 362
    ctx.beginPath()
    ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1)
    ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2)
    ctx.strokeStyle = (i % 4 === 0) ? 'rgba(251, 191, 36, 0.28)' : 'rgba(125, 211, 252, 0.12)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()

  // 2. 黄金螺旋（Golden Logarithmic Spiral: 宇宙の調和比）
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(t * 0.06)
  ctx.beginPath()
  const spiralSteps = 120
  const b = 0.14
  for (let i = 0; i < spiralSteps; i++) {
    const theta = i * 0.08
    const r = 8 * Math.exp(b * theta)
    if (r > maxR) break
    const sx = Math.cos(theta) * r
    const sy = Math.sin(theta) * r
    if (i === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  }
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.06)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 8])
  ctx.stroke()
  ctx.restore()

  // 3. 繊細な時空測地線メッシュ（曲面幾何学）
  const step = 55
  ctx.strokeStyle = phase === 0
    ? 'rgba(56, 189, 248, 0.08)'
    : phase === 1
    ? 'rgba(244, 63, 94, 0.06)'
    : 'rgba(125, 211, 252, 0.055)'
  ctx.lineWidth = 0.75

  for (let x = 0; x <= w; x += step) {
    ctx.beginPath()
    for (let y = 0; y <= h; y += 20) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      const warp = phase === 0
        ? Math.min(65, 7000 / (dist + 80))
        : phase === 2
        ? Math.min(25, 2500 / (dist + 90))
        : 0
      const px = x - (dx / (dist + 1)) * warp
      const py = y - (dy / (dist + 1)) * warp
      if (y === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  for (let y = 0; y <= h; y += step) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 20) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      const warp = phase === 0
        ? Math.min(65, 7000 / (dist + 80))
        : phase === 2
        ? Math.min(25, 2500 / (dist + 90))
        : 0
      const px = x - (dx / (dist + 1)) * warp
      const py = y - (dy / (dist + 1)) * warp
      if (x === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  ctx.restore()
}

// 1. ブラックホール特異点・相対論的降着円盤（Phase 0）
function drawSingularity(ctx, cx, cy, t) {
  ctx.save()

  // 1-1. 重力レンズ光条・光子球（Photon Sphere: 光が円軌道を周回する境界）
  const ringR = 64 + Math.sin(t * 9) * 2.5
  const grad = ctx.createRadialGradient(cx, cy, 28, cx, cy, ringR + 45)
  grad.addColorStop(0, '#000000')
  grad.addColorStop(0.32, 'rgba(56, 189, 248, 0.95)')
  grad.addColorStop(0.55, 'rgba(236, 72, 153, 0.65)')
  grad.addColorStop(0.85, 'rgba(251, 191, 36, 0.35)')
  grad.addColorStop(1, 'rgba(3, 7, 18, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, ringR + 50, 0, Math.PI * 2)
  ctx.fill()

  // 1-2. 相対論的降着円盤（ドップラー増光: 観測者に近づく左側が青白く、遠ざかる右側が赤く減光）
  const diskRot = t * 1.5
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(0.38)
  ctx.scale(1, 0.28)

  // 円盤外縁部
  const diskGrad = ctx.createLinearGradient(-190, 0, 190, 0)
  diskGrad.addColorStop(0, 'rgba(125, 211, 252, 0.95)') // 青方偏移・ドップラー増光
  diskGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.85)')
  diskGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.7)')
  diskGrad.addColorStop(1, 'rgba(244, 63, 94, 0.35)')  // 赤方偏移・減光

  ctx.beginPath()
  ctx.arc(0, 0, 165, 0, Math.PI * 2)
  ctx.strokeStyle = diskGrad
  ctx.lineWidth = 18
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 28
  ctx.stroke()

  // 円盤内縁超高温リング
  ctx.beginPath()
  ctx.arc(0, 0, 135, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.lineWidth = 5
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 16
  ctx.stroke()
  ctx.restore()

  // 1-3. 事象の地平面（Event Horizon: 完全な漆黒の特異点）
  ctx.beginPath()
  ctx.arc(cx, cy, 36, 0, Math.PI * 2)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.lineWidth = 1.5
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 10
  ctx.stroke()

  ctx.restore()
}

// 2. ビッグバン・エネルギー放射光芒（Phase 1: 1.0s〜2.0s）
function drawBigBangRays(ctx, w, h, t, cx, cy) {
  if (t < 0.9 || t > 2.2) return
  ctx.save()
  const elapsed = t - 0.9
  const alpha = Math.max(0, 1 - elapsed / 1.2)

  // 画面全体の一瞬のエネルギーパルス
  if (elapsed < 0.35) {
    const flashAlpha = (1 - elapsed / 0.35) * 0.22
    ctx.fillStyle = `rgba(56, 189, 248, ${flashAlpha})`
    ctx.fillRect(0, 0, w, h)
  }

  // 中心から全方位への高エネルギー放射光条（32本）
  const rayCount = 32
  const maxRayLen = Math.max(w, h) * 0.75 * Math.min(1, elapsed * 2.5)
  ctx.lineWidth = 2.0
  ctx.shadowBlur = 12

  for (let i = 0; i < rayCount; i++) {
    const angle = (i * Math.PI * 2) / rayCount + t * 0.4
    const rayLen = maxRayLen * (0.6 + ((i % 4) * 0.15))
    const ex = cx + Math.cos(angle) * rayLen
    const ey = cy + Math.sin(angle) * rayLen

    const grad = ctx.createLinearGradient(cx, cy, ex, ey)
    const rayColor = i % 2 === 0 ? '56, 189, 248' : '251, 191, 36'
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`)
    grad.addColorStop(0.3, `rgba(${rayColor}, ${alpha * 0.6})`)
    grad.addColorStop(1, `rgba(${rayColor}, 0)`)

    ctx.strokeStyle = grad
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(ex, ey)
    ctx.stroke()
  }

  ctx.restore()
}

// 3. 相対論的衝撃波リング
function drawShockwaves(ctx, dt) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i]
    sw.radius += sw.speed * dt
    sw.alpha -= 0.65 * dt
    if (sw.alpha <= 0) {
      shockwaves.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
    ctx.strokeStyle = sw.color
    ctx.globalAlpha = Math.max(0, sw.alpha)
    ctx.lineWidth = sw.width
    ctx.shadowColor = sw.color
    ctx.shadowBlur = 18
    ctx.stroke()
    ctx.restore()
  }
}

// 4. 3次元マクスウェル電磁波（Phase 1〜2: 直交する電場Eと磁場Bの進行波）
function drawMaxwellWaves(ctx, w, h, t) {
  ctx.save()
  const waveY = h * 0.48
  const waveLen = 240
  const k = (Math.PI * 2) / waveLen
  const omega = 7.0

  // 進行波の基底中心軸
  ctx.beginPath()
  ctx.moveTo(0, waveY)
  ctx.lineTo(w, waveY)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 6])
  ctx.stroke()
  ctx.setLineDash([])

  // 電場 E (鉛直振動: シアン)
  ctx.beginPath()
  for (let x = 0; x <= w; x += 6) {
    const y = waveY - Math.sin(k * x - omega * t) * 48
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
  ctx.lineWidth = 2.5
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  ctx.stroke()

  // 磁場 B (奥行き直交傾斜振動: マゼンタ/ローズ)
  ctx.beginPath()
  for (let x = 0; x <= w; x += 6) {
    const slant = Math.sin(k * x - omega * t) * 38
    const y = waveY + slant * 0.42
    const drawX = x + slant * 0.85
    if (x === 0) ctx.moveTo(drawX, y)
    else ctx.lineTo(drawX, y)
  }
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)'
  ctx.lineWidth = 2.2
  ctx.shadowColor = '#f43f5e'
  ctx.shadowBlur = 12
  ctx.stroke()

  // 各ピークでの直交ベクトル矢印描画（物理学的可視化）
  const step = 60
  for (let x = step / 2; x < w; x += step) {
    const eVal = Math.sin(k * x - omega * t)
    const ey = waveY - eVal * 48
    // Eベクトル (鉛直)
    ctx.beginPath()
    ctx.moveTo(x, waveY)
    ctx.lineTo(x, ey)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
    ctx.lineWidth = 1.2
    ctx.stroke()

    // Bベクトル (直交傾斜)
    const bx = x + eVal * 38 * 0.85
    const by = waveY + eVal * 38 * 0.42
    ctx.beginPath()
    ctx.moveTo(x, waveY)
    ctx.lineTo(bx, by)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)'
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  ctx.restore()
}

// 5. ケプラー楕円軌道（Phase 2: 面積速度一定と惑星運動）
function drawKeplerOrbits(ctx, cx, cy, t) {
  ctx.save()

  // 中心主星（太陽: コロナ発光）
  const sunR = 14 + Math.sin(t * 6) * 1.5
  const sunGrad = ctx.createRadialGradient(cx - 20, cy, 4, cx - 20, cy, sunR + 18)
  sunGrad.addColorStop(0, '#ffffff')
  sunGrad.addColorStop(0.35, '#fbbf24')
  sunGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.4)')
  sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)')

  ctx.fillStyle = sunGrad
  ctx.beginPath()
  ctx.arc(cx - 20, cy, sunR + 18, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx - 20, cy, sunR, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'
  ctx.shadowColor = '#f59e0b'
  ctx.shadowBlur = 24
  ctx.fill()

  // 惑星軌道と惑星
  planets.forEach((p, idx) => {
    // 楕円軌道線
    ctx.beginPath()
    ctx.ellipse(cx, cy, p.a, p.b, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // 惑星位置（ケプラー第2法則: 近日点で高速、遠日点で低速）
    const meanAnomaly = t * p.speed + idx * 2.1
    const px = cx + Math.cos(meanAnomaly) * p.a
    const py = cy + Math.sin(meanAnomaly) * p.b

    // 動径ベクトル（主星と惑星を結ぶ線）
    ctx.beginPath()
    ctx.moveTo(cx - 20, cy)
    ctx.lineTo(px, py)
    ctx.strokeStyle = `${p.color}50`
    ctx.lineWidth = 1.2
    ctx.stroke()

    // 惑星本体
    ctx.beginPath()
    ctx.arc(px, py, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 16
    ctx.fill()

    // 速度ベクトル
    const vx = -Math.sin(meanAnomaly) * 24
    const vy = Math.cos(meanAnomaly) * 15
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px + vx, py + vy)
    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 2
    ctx.shadowColor = '#34d399'
    ctx.shadowBlur = 8
    ctx.stroke()
  })

  ctx.restore()
}

// 6. 物理公式ホログラム（宇宙の深遠に浮かぶ星座と真理の碑文・神聖幾何学）
function drawFormulas(ctx, w, h, t) {
  ctx.save()

  // 6-0. 星座連結ライン（Constellation Filaments: 公式ノード同士を結ぶ星間光条）
  if (t >= 1.0) {
    const constAlpha = Math.min(0.35, (t - 1.0) * 0.4)
    ctx.save()
    ctx.strokeStyle = `rgba(251, 191, 36, ${constAlpha * 0.65})`
    ctx.lineWidth = 0.9
    ctx.setLineDash([4, 8])

    // 星座の結線ペア: [0, 4], [4, 1], [1, 3], [3, 5], [5, 2], [2, 0] (六芒星的な幾何学エンベロープ)
    const pairs = [[0, 4], [4, 1], [1, 3], [3, 5], [5, 2], [2, 0]]
    pairs.forEach(([i, j]) => {
      const fi = formulas[i], fj = formulas[j]
      if (t >= fi.delay && t >= fj.delay) {
        ctx.beginPath()
        ctx.moveTo(w * fi.x, h * fi.y)
        ctx.lineTo(w * fj.x, h * fj.y)
        ctx.stroke()
      }
    })
    ctx.restore()
  }

  // 6-1. 各公式の星座ノード描画
  formulas.forEach((item, idx) => {
    if (t < item.delay) return
    const elapsed = t - item.delay
    const alpha = Math.min(1, elapsed * 2.2)
    const scale = Math.min(1, 0.88 + elapsed * 0.16)
    const px = w * item.x
    const py = h * item.y

    ctx.save()
    ctx.translate(px, py)
    ctx.scale(scale, scale)

    // 星間クリスタル・柔らかなラジアルバックライト（四角い重厚な枠を廃し、神聖な光彩へ）
    const cardW = 224, cardH = 46
    const bgRad = ctx.createRadialGradient(0, 0, 10, 0, 0, 130)
    bgRad.addColorStop(0, `rgba(15, 23, 42, ${alpha * 0.75})`)
    bgRad.addColorStop(0.65, `rgba(3, 7, 18, ${alpha * 0.65})`)
    bgRad.addColorStop(1, 'rgba(2, 4, 10, 0)')
    ctx.fillStyle = bgRad
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 23)
    } else {
      ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH)
    }
    ctx.fill()

    // 繊細な金藍の星座フレーム（Constellation Aura Border）
    ctx.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.45})`
    ctx.lineWidth = 0.85
    ctx.stroke()

    // 瞬く星のノード（✧ ダイヤモンド・スター）
    const starPulse = 0.7 + 0.3 * Math.sin(t * 3.5 + idx * 1.8)
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * starPulse})`
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 12
    // 左端星
    ctx.beginPath()
    ctx.arc(-cardW / 2 + 10, 0, 2.5, 0, Math.PI * 2)
    ctx.fill()
    // 右端星
    ctx.beginPath()
    ctx.arc(cardW / 2 - 10, 0, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // 公式テキスト（純白の星明かりとシアンの微光）
    ctx.font = `700 ${item.size}px "Outfit", "Fira Code", monospace`
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.98})`
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 14
    ctx.textAlign = 'center'
    ctx.fillText(item.text, 0, -2)

    // 解説ラベル（黄金と天藍のサブテキスト）
    ctx.font = `600 9.5px "Outfit", sans-serif`
    ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.90})`
    ctx.shadowBlur = 0
    ctx.fillText(item.desc, 0, 16)

    ctx.restore()
  })
  ctx.restore()
}

// 7. ラボタイトル・ボーア水素原子模型（神秘の量子共鳴・神聖幾何学）
function drawLabTitle(ctx, cx, cy, t, phase, w) {
  if (t < 2.6) return
  ctx.save()

  const elapsed = t - 2.6
  const alpha = Math.min(1, elapsed * 2.2)

  // 7-0. 量子確率雲（シュレーディンガー・オーロラヘイロー）
  const cloudR = 135 + Math.sin(t * 2.5) * 10
  const cloudGrad = ctx.createRadialGradient(cx, cy - 45, 12, cx, cy - 45, cloudR)
  cloudGrad.addColorStop(0, `rgba(56, 189, 248, ${alpha * 0.26})`)
  cloudGrad.addColorStop(0.4, `rgba(168, 85, 247, ${alpha * 0.14})`)
  cloudGrad.addColorStop(0.75, `rgba(251, 191, 36, ${alpha * 0.05})`)
  cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = cloudGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 45, cloudR, 0, Math.PI * 2)
  ctx.fill()

  // 7-1. ボーアの水素原子模型（ド・ブロイ定在波物質波 + 周回量子電子）
  const ringR = 96
  const waveModes = [3, 4, 5] // n=3, 4, 5 の定在物質波 (2πr = nλ)
  const electronSpeeds = [2.8, -2.2, 1.7]

  for (let rot = 0; rot < 3; rot++) {
    ctx.save()
    ctx.translate(cx, cy - 45)
    ctx.rotate((rot * Math.PI) / 3 + t * 0.5)

    // ド・ブロイ定在波の軌道（量子条件を満たす物質波の美しい波打ち）
    ctx.beginPath()
    const steps = 100
    const waveN = waveModes[rot]
    for (let s = 0; s <= steps; s++) {
      const theta = (s * Math.PI * 2) / steps
      const wave = Math.sin(theta * waveN - t * 3.5) * 3.6
      const r = ringR + wave
      const ex = Math.cos(theta) * r
      const ey = Math.sin(theta) * (r * 0.38)
      if (s === 0) ctx.moveTo(ex, ey)
      else ctx.lineTo(ex, ey)
    }
    ctx.closePath()

    ctx.strokeStyle = rot === 1
      ? `rgba(192, 132, 252, ${alpha * 0.85})`
      : rot === 2
      ? `rgba(251, 191, 36, ${alpha * 0.8})`
      : `rgba(56, 189, 248, ${alpha * 0.85})`
    ctx.shadowColor = rot === 1 ? '#c084fc' : (rot === 2 ? '#fbbf24' : '#38bdf8')
    ctx.shadowBlur = 18
    ctx.lineWidth = 1.6
    ctx.stroke()

    // 高速周回する量子電子（クォンタムドット）
    const eAngle = t * electronSpeeds[rot]
    const eWave = Math.sin(eAngle * waveN - t * 3.5) * 3.6
    const eDist = ringR + eWave
    const elX = Math.cos(eAngle) * eDist
    const elY = Math.sin(eAngle) * (eDist * 0.38)

    // 電子の発光オーラ
    ctx.beginPath()
    ctx.arc(elX, elY, 4.2, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 16
    ctx.fill()

    ctx.restore()
  }

  // 7-2. 原子の中心核（神聖なる陽子・中性子コア & 12本の放射光芒）
  const corePulse = 17 + Math.sin(t * 6) * 2.5
  // 12本の神聖放射光条
  for (let ray = 0; ray < 12; ray++) {
    const rayAng = (ray * Math.PI * 2) / 12 + t * 0.3
    const rayLen = corePulse + 22 + Math.sin(t * 4 + ray) * 6
    ctx.beginPath()
    ctx.moveTo(cx, cy - 45)
    ctx.lineTo(cx + Math.cos(rayAng) * rayLen, cy - 45 + Math.sin(rayAng) * rayLen)
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  const coreGrad = ctx.createRadialGradient(cx, cy - 45, 3, cx, cy - 45, corePulse + 25)
  coreGrad.addColorStop(0, '#ffffff')
  coreGrad.addColorStop(0.35, 'rgba(125, 211, 252, 0.95)')
  coreGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.45)')
  coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)')

  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 45, corePulse + 25, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy - 45, corePulse, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 28
  ctx.fill()

  // 7-3. タイトル背景バックライト（星雲のベール）
  const bgGrad = ctx.createRadialGradient(cx, cy + 90, 20, cx, cy + 90, 360)
  bgGrad.addColorStop(0, `rgba(3, 7, 18, ${alpha * 0.94})`)
  bgGrad.addColorStop(0.6, `rgba(15, 23, 42, ${alpha * 0.75})`)
  bgGrad.addColorStop(1, 'rgba(3, 7, 18, 0)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(cx - 400, cy + 25, 800, 170)

  // 7-4. メインタイトル
  ctx.textAlign = 'center'
  const fontSize = Math.min(38, Math.max(26, w * 0.045))
  ctx.font = `900 ${fontSize}px "Outfit", "Inter", sans-serif`
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 28
  ctx.fillText('高校物理シミュレーションラボ', cx, cy + 85)

  // サブタイトル（星の叡智・天球の調和）
  ctx.font = `700 13px "Outfit", monospace`
  ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`
  ctx.shadowBlur = 10
  ctx.fillText('HARMONIA MUNDI // 天球の音楽と自然界の調和', cx, cy + 115)

  // キャッチコピー
  ctx.font = `500 14px sans-serif`
  ctx.fillStyle = `rgba(241, 245, 249, ${alpha * 0.95})`
  ctx.shadowBlur = 0
  ctx.fillText('すべての公式には、理由がある。動く世界で物理の深淵を解き明かす。', cx, cy + 142)

  // 水平アナモルフィック・オーロラフレア光芒
  ctx.save()
  const flareW = Math.min(w * 0.88, 780) * Math.min(1, elapsed * 1.6)
  const flareGrad = ctx.createLinearGradient(cx - flareW / 2, cy + 85, cx + flareW / 2, cy + 85)
  flareGrad.addColorStop(0, 'rgba(56, 189, 248, 0)')
  flareGrad.addColorStop(0.25, `rgba(168, 85, 247, ${alpha * 0.65})`)
  flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.9})`)
  flareGrad.addColorStop(0.75, `rgba(251, 191, 36, ${alpha * 0.65})`)
  flareGrad.addColorStop(1, 'rgba(168, 85, 247, 0)')
  ctx.fillStyle = flareGrad
  ctx.fillRect(cx - flareW / 2, cy + 83, flareW, 3)
  ctx.restore()

  ctx.restore()
}

// ==========================================
// アニメーションループ & 終了処理
// ==========================================
let startTime = null
let lastTimestamp = 0
let bigBangTriggered = false
let chimeTriggered = false
let fixedTimeParam = null

function animate(timestamp) {
  if (!canvasRef.value) return

  if (fixedTimeParam !== null) {
    simTime.value = fixedTimeParam
  } else {
    if (!startTime) startTime = timestamp
    if (!lastTimestamp) lastTimestamp = timestamp
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.033)
    lastTimestamp = timestamp
    simTime.value = (timestamp - startTime) / 1000
  }
  const t = simTime.value

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2

  // タイムラインとフェーズ自動更新（詩的・神秘的な宇宙の開示）
  if (t < 0.9) {
    currentPhase.value = 0
    phaseCaption.value = '⟡ 虚無の量子揺らぎと時間の創生 ── The Primordial Singularity'
  } else if (t < 1.9) {
    currentPhase.value = 1
    phaseCaption.value = '✧ 光あれ。時空の展開と電磁共鳴 ── Genesis of Light'
    if (!bigBangTriggered && fixedTimeParam === null) {
      bigBangTriggered = true
      playBigBangSound()
      shockwaves.push({ x: cx, y: cy, radius: 5, speed: 1200, alpha: 1.0, color: '#38bdf8', width: 4.5 })
      shockwaves.push({ x: cx, y: cy, radius: 2, speed: 850, alpha: 0.9, color: '#fbbf24', width: 3.5 })
      shockwaves.push({ x: cx, y: cy, radius: 1, speed: 500, alpha: 0.85, color: '#c084fc', width: 2.5 })
    }
  } else if (t < 2.9) {
    currentPhase.value = 2
    phaseCaption.value = '✦ 天球の音楽。万有引力とケプラーの調和 ── Musica Universalis'
  } else if (t < animDuration) {
    currentPhase.value = 3
    phaseCaption.value = '✦ 微小なる量子と大宇宙の調和 ── The Sacred Tapestry'
    if (!chimeTriggered && fixedTimeParam === null) {
      chimeTriggered = true
      playChimeSound()
    }
  } else if (t < totalMaxDuration) {
    // Phase 4: アニメーション再生後、完成画面をそのまま 1.8秒間（1〜2秒間）静止・安定表示するHOLD状態
    currentPhase.value = 4
    phaseCaption.value = '✦ 不変の真理。物理の世界へ ── The Cosmos Synchronized'
  } else {
    // 5.4秒経過（アニメーション3.6秒 + 静止HOLD 1.8秒）で自動的に優雅なロングフェードアウト
    finishIntro()
    return
  }

  try {
    // 画面クリア（加算合成＆微小残像トレイル: 深宇宙ディープブラック）
    ctx.save()
    ctx.fillStyle = currentPhase.value === 4 ? 'rgba(2, 4, 10, 0.30)' : 'rgba(2, 4, 10, 0.35)'
    ctx.fillRect(0, 0, w, h)
    ctx.restore()

    // 0. 深宇宙星雲ガス & オーロラカーテン（Nebula Clouds）
    drawNebulaClouds(ctx, w, h, t, cx, cy)

    // 0-1. 流星（Meteors）
    const stepDt = fixedTimeParam !== null ? 0.016 : Math.min(0.033, 1 / 60)
    for (let i = 0; i < meteors.length; i++) {
      meteors[i].update(stepDt, w, h)
      meteors[i].draw(ctx)
    }

    // 1. 神秘の天球儀グリッド & 黄金螺旋（Celestial Astrolabe）
    drawSpacetimeGrid(ctx, w, h, t, cx, cy, currentPhase.value)

    // 2. 特異点（Phase 0）
    if (currentPhase.value === 0) {
      drawSingularity(ctx, cx, cy, t)
    }

    // 3. ビッグバン放射光芒（Phase 1）
    if (currentPhase.value === 1) {
      drawBigBangRays(ctx, w, h, t, cx, cy)
    }

    // 4. マクスウェル電磁波（Phase 1〜2）
    if (currentPhase.value === 1 || currentPhase.value === 2) {
      drawMaxwellWaves(ctx, w, h, t)
    }

    // 5. ケプラー惑星軌道（Phase 2）
    if (currentPhase.value === 2) {
      drawKeplerOrbits(ctx, cx, cy, t)
    }

    // 6. 星屑粒子シミュレーション更新と描画（瞬きエフェクト付き）
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(stepDt, t, cx, cy, currentPhase.value)
      particles[i].draw(ctx, currentPhase.value, t)
    }
    ctx.restore()

    // 7. 相対論的ショックウェーブ
    drawShockwaves(ctx, stepDt)

    // 8. 星座・公式ホログラム（神聖幾何学ライン付き）
    if (currentPhase.value >= 1) {
      drawFormulas(ctx, w, h, t)
    }

    // 9. ラボエンブレム・タイトル（Phase 3〜4: 完成後は静止形態で安定表示）
    drawLabTitle(ctx, cx, cy, t, currentPhase.value, w)
  } catch (err) {
    phaseCaption.value = 'CANVAS ERROR: ' + err.message
    console.error('INTRO RENDER ERROR:', err)
  }

  animationId = requestAnimationFrame(animate)
}

// イントロ終了処理（1.0秒のシネマティック・ディゾルブ）
function finishIntro() {
  if (isFadingOut.value) return
  isFadingOut.value = true

  setTimeout(() => {
    isVisible.value = false
    if (animationId) cancelAnimationFrame(animationId)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }, 1000)
}

// 「次からは再生しない」ボタンを押したとき
function neverPlayAgain() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('physics_sim_intro_skip', 'true')
  }
  finishIntro()
}

function handleResize() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  mouse.active = true
}

function onMouseDown(e) {
  mouse.isDown = true
  shockwaves.push({
    x: e.clientX,
    y: e.clientY,
    radius: 4,
    speed: 650,
    alpha: 0.9,
    color: '#38bdf8',
    width: 2.5
  })
  playTone(587.33, 'sine', 0.25, 0.08)
}

function onOverlayClick(e) {
  onMouseDown(e)
  // タイトルが立ち上がった後は画面のどこをクリックしても自分のペースで入室可能
  if (isReadyToEnter.value) {
    finishIntro()
  }
}

function onMouseUp() {
  mouse.isDown = false
}

function onTouchMove(e) {
  if (e.touches && e.touches[0]) {
    mouse.x = e.touches[0].clientX
    mouse.y = e.touches[0].clientY
    mouse.active = true
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
    finishIntro()
  }
}

onMounted(async () => {
  isClient.value = true

  // URLパラメータ（テスト・検証用）
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const testT = urlParams?.get('intro_t') ? parseFloat(urlParams.get('intro_t')) : null

  // 永続スキップ（次からは再生しない）が設定されている場合は即時非表示（※テストURL時を除く）
  const permanentSkip = localStorage.getItem('physics_sim_intro_skip')
  if (permanentSkip === 'true' && testT === null) {
    isVisible.value = false
    return
  }

  // ホーム画面判定（frontmatter.layout === 'home' または / または /index.html）
  const isHome = testT !== null || frontmatter.value?.layout === 'home' ||
    (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === ''))

  if (!isHome) {
    isVisible.value = false
    return
  }

  isVisible.value = true
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  await nextTick()

  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', onKeyDown)

  handleResize()
  const w = window.innerWidth
  const h = window.innerHeight
  particles.length = 0
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new StarParticle(w, h))
  }
  meteors.length = 0
  for (let i = 0; i < 4; i++) {
    meteors.push(new Meteor(w, h))
  }

  if (testT !== null && !isNaN(testT)) {
    fixedTimeParam = testT
    let curT = 0
    const simDt = 0.016
    const cx = w / 2, cy = h / 2
    while (curT < testT) {
      let phase = 0
      if (curT < 0.8) phase = 0
      else if (curT < 1.8) phase = 1
      else if (curT < 2.8) phase = 2
      else if (curT < 3.5) phase = 3
      else phase = 4
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(simDt, curT, cx, cy, phase)
      }
      curT += simDt
    }
    if (testT >= 0.8 && testT <= 2.0) {
      const swRadius = (testT - 0.8) * 600
      shockwaves.push({ x: cx, y: cy, radius: swRadius, speed: 0, alpha: 0.85, color: '#38bdf8', width: 4 })
      shockwaves.push({ x: cx, y: cy, radius: swRadius * 0.7, speed: 0, alpha: 0.75, color: '#fbbf24', width: 3 })
    }
    animationId = requestAnimationFrame(animate)
    return
  }

  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', onKeyDown)
  }
  if (animationId) cancelAnimationFrame(animationId)
  if (audioCtx) {
    try {
      audioCtx.close()
    } catch (e) {}
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <ClientOnly>
    <div
      v-if="isVisible"
      class="physics-intro-overlay"
      :class="{ 'fade-out': isFadingOut, 'ready-state': isReadyToEnter }"
      @mousemove="onMouseMove"
      @mousedown="onOverlayClick"
      @mouseup="onMouseUp"
      @touchmove="onTouchMove"
      @touchstart="onOverlayClick"
    >
      <!-- 最上部 全画面タイムライン進行インジケーター (0% -> 100%) -->
      <div class="top-timeline-wrap">
        <div
          class="top-timeline-bar"
          :class="{ complete: isReadyToEnter }"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <canvas ref="canvasRef" class="physics-canvas"></canvas>

      <!-- HUD Top Bar -->
      <div class="hud-top-bar">
        <div class="hud-badge-group">
          <div class="hud-badge">
            <span class="pulsing-dot"></span>
            <span class="hud-title">✦ HARMONIA MUNDI</span>
          </div>
          <div class="hud-status-badge" :class="{ 'status-ready': isReadyToEnter }">
            <span class="pulsing-radar" :class="{ 'radar-ready': isReadyToEnter }"></span>
            <span class="status-seq-text">
              {{ isReadyToEnter ? '✦ 宇宙の調和が同期されました ── HARMONIA MUNDI' : `✧ 宇宙の創生と物理法則の開示 [${progressPercent}%]` }}
            </span>
          </div>
        </div>

        <div class="hud-caption">
          {{ phaseCaption }}
        </div>

        <div class="hud-controls">
          <button
            class="hud-btn sound-btn"
            @click.stop="toggleSound"
            :title="isSoundEnabled ? 'サウンド OFF' : '432Hz ピタゴラス調律 & 528Hz ソルフェジオ天球和音'"
          >
            {{ isSoundEnabled ? '♪ 432Hz HARMONY ON' : '♪ 432Hz 天球の調和音' }}
          </button>
          <button
            class="hud-btn never-btn"
            @click.stop="neverPlayAgain"
            title="次回以降はこのアニメーションを表示せず直接サイトを開きます"
          >
            ✕ 次回からスキップ
          </button>
          <button
            class="hud-btn skip-btn"
            @click.stop="finishIntro"
            title="今すぐサイトへ進む (ESC)"
          >
            ✦ 物理の世界へ入る [ESC]
          </button>
        </div>
      </div>

      <!-- 中央「物理の世界へ入る」アクション（神秘のクリスタル・ポータル） -->
      <transition name="enter-btn-fade">
        <div
          v-if="isReadyToEnter"
          class="center-action-area"
          @click.stop="finishIntro"
        >
          <button class="enter-lab-btn" @click.stop="finishIntro">
            <span class="enter-icon">✦</span>
            <span class="enter-text-group">
              <span class="enter-main-title">物理の世界へ入る</span>
              <span class="enter-sub-title">ENTER THE SACRED COSMOS // LAB</span>
            </span>
            <span class="enter-kbd-badge">↵ Enter</span>
          </button>
        </div>
      </transition>

      <!-- HUD Bottom Bar -->
      <div class="hud-bottom-bar">
        <div class="hud-hint">
          <span class="hint-sparkle">✦</span> クリックまたは「物理の世界へ入る」で進みます（数秒の余韻ののち自動で移行します）
        </div>
        <button class="bottom-never-btn" @click.stop="neverPlayAgain">
          次回から自動でスキップする
        </button>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.physics-intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999999;
  background-color: #02040a;
  overflow: hidden;
  user-select: none;
  cursor: crosshair;
  transition: opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1), transform 1.0s cubic-bezier(0.16, 1, 0.3, 1);
}

.physics-intro-overlay.fade-out {
  opacity: 0;
  transform: scale(1.03);
  pointer-events: none;
}

.physics-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* 最上部 全画面タイムライン進行インジケーター */
.top-timeline-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  z-index: 100;
}

.top-timeline-bar {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #fbbf24);
  box-shadow: 0 0 14px #38bdf8, 0 0 8px #c084fc;
  transition: width 0.08s linear;
}

.top-timeline-bar.complete {
  background: linear-gradient(90deg, #38bdf8, #c084fc, #fbbf24);
  box-shadow: 0 0 20px #38bdf8, 0 0 12px #c084fc, 0 0 6px #fbbf24;
}

.hud-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(2, 4, 10, 0.88) 0%, transparent 100%);
  z-index: 10;
}

.hud-badge-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hud-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(8, 14, 30, 0.70);
  border: 1px solid rgba(251, 191, 36, 0.35);
  padding: 5px 14px;
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.15);
}

.pulsing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fbbf24;
  box-shadow: 0 0 10px #fbbf24;
  animation: pulseDot 1.4s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

.hud-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  color: #fef08a;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.45);
}

.hud-status-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(8, 14, 30, 0.70);
  border: 1px solid rgba(125, 211, 252, 0.35);
  padding: 5px 14px;
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  transition: all 0.4s ease;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
}

.hud-status-badge.status-ready {
  background: rgba(168, 85, 247, 0.18);
  border-color: rgba(192, 132, 252, 0.55);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

.pulsing-radar {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulseDot 1.2s infinite ease-in-out;
}

.pulsing-radar.radar-ready {
  background: #c084fc;
  box-shadow: 0 0 12px #c084fc;
}

.status-seq-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: #bae6fd;
  font-weight: 600;
  transition: color 0.4s ease;
}

.hud-status-badge.status-ready .status-seq-text {
  color: #f3e8ff;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.6);
}

.hud-caption {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: #f8fafc;
  letter-spacing: 0.08em;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.8), 0 0 22px rgba(168, 85, 247, 0.5);
  background: rgba(8, 14, 30, 0.78);
  padding: 6px 22px;
  border-radius: 9999px;
  border: 1px solid rgba(125, 211, 252, 0.28);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
}

.hud-controls {
  display: flex;
  gap: 10px;
  pointer-events: auto;
}

.hud-btn {
  background: rgba(8, 14, 30, 0.82);
  border: 1px solid rgba(125, 211, 252, 0.32);
  color: #f1f5f9;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 6px 15px;
  border-radius: 9999px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
}

.hud-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #bae6fd;
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.4);
}

.sound-btn {
  border-color: rgba(251, 191, 36, 0.4);
  color: #fef08a;
}

.sound-btn:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  color: #ffffff;
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.5);
}

.never-btn {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.38);
  color: #fca5a5;
}

.never-btn:hover {
  background: rgba(244, 63, 94, 0.28);
  border-color: #f43f5e;
  color: #ffffff;
  box-shadow: 0 0 14px rgba(244, 63, 94, 0.4);
}

.skip-btn {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(125, 211, 252, 0.5);
  color: #ffffff;
}

.skip-btn:hover {
  background: rgba(56, 189, 248, 0.4);
  color: #ffffff;
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.6);
}

.hud-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to top, rgba(2, 4, 10, 0.88) 0%, transparent 100%);
  pointer-events: auto;
  z-index: 10;
}

.hud-hint {
  font-size: 0.82rem;
  color: #94a3b8;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-sparkle {
  color: #38bdf8;
  font-size: 0.95rem;
  text-shadow: 0 0 10px #38bdf8, 0 0 16px #c084fc;
  animation: pulseDot 2.0s infinite ease-in-out;
}

.bottom-never-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.18s;
}

.bottom-never-btn:hover {
  color: #f87171;
}

/* 中央「物理の世界へ入る」アクション（神秘のクリスタル・ポータル） */
.center-action-area {
  position: absolute;
  top: calc(50% + 172px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: auto;
}

.enter-lab-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 28px;
  background: rgba(8, 14, 30, 0.85);
  border: 1.5px solid rgba(125, 211, 252, 0.65);
  border-radius: 9999px;
  color: #ffffff;
  cursor: pointer;
  backdrop-filter: blur(14px);
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.4), 0 0 15px rgba(192, 132, 252, 0.25), 0 4px 20px rgba(0, 0, 0, 0.8);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: enterCosmicPulse 3.0s infinite ease-in-out;
}

@keyframes enterCosmicPulse {
  0%, 100% {
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.35), 0 0 12px rgba(192, 132, 252, 0.2), 0 4px 18px rgba(0, 0, 0, 0.8);
    border-color: rgba(125, 211, 252, 0.6);
  }
  50% {
    box-shadow: 0 0 45px rgba(56, 189, 248, 0.75), 0 0 22px rgba(192, 132, 252, 0.5), 0 0 12px rgba(251, 191, 36, 0.35), 0 4px 24px rgba(0, 0, 0, 0.9);
    border-color: #7dd3fc;
  }
}

.enter-lab-btn:hover {
  transform: translateY(-2px) scale(1.04);
  background: rgba(14, 23, 48, 0.92);
  border-color: #bae6fd;
  box-shadow: 0 0 50px rgba(56, 189, 248, 0.9), 0 0 28px #c084fc, 0 0 16px #fbbf24;
}

.enter-icon {
  font-size: 1.25rem;
  color: #bae6fd;
  text-shadow: 0 0 10px #38bdf8, 0 0 18px #c084fc;
}

.enter-text-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.enter-main-title {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
}

.enter-sub-title {
  font-family: 'Fira Code', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #38bdf8;
}

.enter-kbd-badge {
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 4px;
}

.enter-btn-fade-enter-active,
.enter-btn-fade-leave-active {
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.enter-btn-fade-enter-from,
.enter-btn-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 15px);
}

@media (max-width: 900px) {
  .hud-caption {
    display: none;
  }
}

@media (max-width: 640px) {
  .hud-badge-group {
    display: none;
  }
  .hud-hint {
    font-size: 0.74rem;
  }
  .center-action-area {
    top: calc(50% + 160px);
  }
  .enter-lab-btn {
    padding: 8px 18px;
    gap: 10px;
  }
  .enter-main-title {
    font-size: 0.95rem;
  }
  .enter-kbd-badge {
    display: none;
  }
}

@media (max-height: 600px) {
  .center-action-area {
    top: auto;
    bottom: 60px;
  }
}
</style>
