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

// アニメーション進行管理（映画的シークエンス + 落ち着いた余韻・アンビエントモード）
const simTime = ref(0)
const initDuration = 3.6 // 宇宙創生からタイトル完成まで
const totalMaxDuration = 7.8 // ゆったり鑑賞できる十分な余韻時間（合計約7.8秒）
const currentPhase = ref(0)
const phaseCaption = ref('SINGULARITY // QUANTUM VACUUM FLUCTUATION')

// タイトルが立ち上がったら「実験室へ入る」ボタンを優美に表示
const isReadyToEnter = computed(() => simTime.value >= 3.4)
// 初期チャージ進行度（0%〜100%）
const progressPercent = computed(() => Math.min(100, Math.floor((simTime.value / initDuration) * 100)))

// マウスインタラクション（重力レンズ効果）
const mouse = {
  x: -1000,
  y: -1000,
  isDown: false,
  active: false
}

// 物理公式ホログラム（映画的サイバーUI: HUDと干渉しない最適マージン配置）
const formulas = [
  { text: 'm(d²r/dt²) = F', desc: 'NEWTONIAN DYNAMICS', x: 0.14, y: 0.28, size: 20, delay: 0.8 },
  { text: 'E = mc²', desc: 'MASS-ENERGY EQUIVALENCE', x: 0.86, y: 0.26, size: 22, delay: 1.0 },
  { text: '∇ × E = -∂B/∂t', desc: 'FARADAY-MAXWELL INDUCTION', x: 0.14, y: 0.73, size: 19, delay: 1.2 },
  { text: 'iħ(∂ψ/∂t) = Ĥψ', desc: 'SCHRÖDINGER WAVE EQUATION', x: 0.86, y: 0.73, size: 20, delay: 1.4 },
  { text: 'G_μν = (8πG/c⁴)T_μν', desc: 'EINSTEIN FIELD EQUATIONS', x: 0.50, y: 0.175, size: 20, delay: 1.7 },
  { text: 'E = hν = hc/λ', desc: 'PLANCK-EINSTEIN QUANTA', x: 0.50, y: 0.90, size: 19, delay: 2.0 }
]

// 音響シンセサイザー (Web Audio API: 重力波＆量子シンセ音)
function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime)
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
      playTone(440, 'sine', 0.2, 0.06)
    }
  }
}

function playTone(freq, type = 'sine', duration = 0.5, gainVal = 0.1) {
  if (!isSoundEnabled.value || !audioCtx) return
  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  } catch (e) {}
}

function playBigBangSound() {
  if (!isSoundEnabled.value || !audioCtx) return
  try {
    // 重低音サブベース + ノイズスイープ
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(160, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(28, audioCtx.currentTime + 1.2)
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(audioCtx.currentTime + 1.4)
  } catch (e) {}
}

function playChimeSound() {
  if (!isSoundEnabled.value || !audioCtx) return
  try {
    const freqs = [523.25, 659.25, 783.99, 1046.5] // C - E - G - C 和音
    freqs.forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 1.0, 0.08), i * 70)
    })
  } catch (e) {}
}

// ==========================================
// 映画級ビジュアルパーティクル & 宇宙物理
// ==========================================
const NUM_PARTICLES = 500
const particles = []
const shockwaves = []

class StarParticle {
  constructor(w, h) {
    this.reset(w, h, true)
  }

  reset(w, h, initial = false) {
    const angle = Math.random() * Math.PI * 2
    const dist = initial ? Math.random() * Math.max(w, h) * 0.7 : Math.random() * 80 + 10
    this.x = w / 2 + Math.cos(angle) * dist
    this.y = h / 2 + Math.sin(angle) * dist
    this.vx = (Math.random() - 0.5) * 40
    this.vy = (Math.random() - 0.5) * 40
    this.size = Math.random() * 2.2 + 0.8
    this.baseSize = this.size
    this.orbitRadius = Math.random() * 260 + 60
    this.orbitAngle = Math.random() * Math.PI * 2
    this.orbitSpeed = (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? 1 : -1)
    this.hue = Math.random() < 0.6 ? 200 + Math.random() * 30 : (Math.random() < 0.7 ? 40 + Math.random() * 20 : 280 + Math.random() * 40)
    this.alpha = Math.random() * 0.7 + 0.3
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

  draw(ctx, phase) {
    // トレイル描画
    if (this.trail.length > 2) {
      ctx.beginPath()
      ctx.moveTo(this.trail[0].x, this.trail[0].y)
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y)
      }
      ctx.strokeStyle = `hsla(${this.hue}, 95%, 65%, ${this.alpha * 0.35})`
      ctx.lineWidth = this.size * 0.8
      ctx.stroke()
    }

    // 粒子本体（発光ブルーム）
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${this.alpha})`
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
// レンダリング関数
// ==========================================
function drawSpacetimeGrid(ctx, w, h, t, cx, cy, phase) {
  ctx.save()
  const step = 45
  const gridW = w
  const gridH = h

  ctx.strokeStyle = phase === 0
    ? 'rgba(56, 189, 248, 0.16)'
    : phase === 1
    ? 'rgba(244, 63, 94, 0.14)'
    : 'rgba(56, 189, 248, 0.14)'
  ctx.lineWidth = 1

  // 水平・垂直の測地線グリッドに、特異点の重力井戸ポテンシャル歪曲を適用
  for (let x = 0; x <= gridW; x += step) {
    ctx.beginPath()
    for (let y = 0; y <= gridH; y += 15) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      // 重力ポテンシャル井戸沈み込み
      const warp = phase === 0
        ? Math.min(70, 8000 / (dist + 80))
        : phase === 2
        ? Math.min(35, 3500 / (dist + 90))
        : 0
      const px = x - (dx / (dist + 1)) * warp
      const py = y - (dy / (dist + 1)) * warp
      if (y === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  for (let y = 0; y <= gridH; y += step) {
    ctx.beginPath()
    for (let x = 0; x <= gridW; x += 15) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      const warp = phase === 0
        ? Math.min(70, 8000 / (dist + 80))
        : phase === 2
        ? Math.min(35, 3500 / (dist + 90))
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

// ブラックホール特異点・降着円盤（Phase 0）
function drawSingularity(ctx, cx, cy, t) {
  ctx.save()

  // 1. 光子球（Photon Sphere: 光のリング）
  const ringR = 60 + Math.sin(t * 8) * 3
  const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, ringR + 30)
  grad.addColorStop(0, 'rgba(0, 0, 0, 1)')
  grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.9)')
  grad.addColorStop(0.6, 'rgba(236, 72, 153, 0.6)')
  grad.addColorStop(1, 'rgba(3, 7, 18, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, ringR + 35, 0, Math.PI * 2)
  ctx.fill()

  // 2. 降着円盤（高速回転する極薄の高温プラズマガス）
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(0.35)
  ctx.scale(1, 0.3)
  ctx.beginPath()
  ctx.arc(0, 0, 150, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'
  ctx.lineWidth = 14
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 24
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, 130, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)'
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.restore()

  // 3. 事象の地平面（Event Horizon: 完全な漆黒の特異点球）
  ctx.beginPath()
  ctx.arc(cx, cy, 38, 0, Math.PI * 2)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.restore()
}

// 相対論的衝撃波リング
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

// 3次元マクスウェル電磁波（Phase 1〜2）
function drawMaxwellWaves(ctx, w, h, t) {
  ctx.save()
  const waveY = h * 0.5
  const waveLen = 220
  const k = (Math.PI * 2) / waveLen
  const omega = 7.5

  ctx.lineWidth = 2.5
  // 電場 E (鉛直振動: 青)
  ctx.beginPath()
  for (let x = 0; x < w; x += 6) {
    const y = waveY - Math.sin(k * x - omega * t) * 45
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 10
  ctx.stroke()

  // 磁場 B (奥行き傾斜振動: ピンク/オレンジ)
  ctx.beginPath()
  for (let x = 0; x < w; x += 6) {
    const slant = Math.sin(k * x - omega * t) * 35
    const y = waveY + slant * 0.4
    const drawX = x + slant * 0.8
    if (x === 0) ctx.moveTo(drawX, y)
    else ctx.lineTo(drawX, y)
  }
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)'
  ctx.shadowColor = '#f43f5e'
  ctx.shadowBlur = 10
  ctx.stroke()

  ctx.restore()
}

// ケプラー楕円軌道（Phase 2: 惑星運動と面積速度一定）
function drawKeplerOrbits(ctx, cx, cy, t) {
  ctx.save()

  // 中心主星（太陽）
  ctx.beginPath()
  ctx.arc(cx - 20, cy, 14, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'
  ctx.shadowColor = '#f59e0b'
  ctx.shadowBlur = 24
  ctx.fill()

  // 惑星軌道と惑星
  planets.forEach((p, idx) => {
    // 楕円軌道線
    ctx.beginPath()
    ctx.ellipse(cx, cy, p.a, p.b, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
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
    ctx.strokeStyle = `${p.color}40`
    ctx.lineWidth = 1
    ctx.stroke()

    // 惑星本体
    ctx.beginPath()
    ctx.arc(px, py, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 14
    ctx.fill()

    // 速度ベクトル
    const vx = -Math.sin(meanAnomaly) * 22
    const vy = Math.cos(meanAnomaly) * 14
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px + vx, py + vy)
    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  ctx.restore()
}

// 物理公式ホログラムカード
function drawFormulas(ctx, w, h, t) {
  ctx.save()
  formulas.forEach((item) => {
    if (t < item.delay) return
    const elapsed = t - item.delay
    const alpha = Math.min(1, elapsed * 2.2)
    const scale = Math.min(1, 0.8 + elapsed * 0.25)
    const px = w * item.x
    const py = h * item.y

    ctx.save()
    ctx.translate(px, py)
    ctx.scale(scale, scale)

    // ホログラムカード枠
    const cardW = 210, cardH = 50
    ctx.fillStyle = `rgba(15, 23, 42, ${Math.min(0.9, alpha * 0.88)})`
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`
    ctx.lineWidth = 1.2
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 8)
    } else {
      ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH)
    }
    ctx.fill()
    ctx.stroke()

    // コーナー照準マーカー
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.9})`
    ctx.lineWidth = 1.8
    const mLen = 6
    // 左上
    ctx.beginPath(); ctx.moveTo(-cardW / 2, -cardH / 2 + mLen); ctx.lineTo(-cardW / 2, -cardH / 2); ctx.lineTo(-cardW / 2 + mLen, -cardH / 2); ctx.stroke()
    // 右上
    ctx.beginPath(); ctx.moveTo(cardW / 2 - mLen, -cardH / 2); ctx.lineTo(cardW / 2, -cardH / 2); ctx.lineTo(cardW / 2, -cardH / 2 + mLen); ctx.stroke()

    // 公式テキスト
    ctx.font = `700 ${item.size}px "Outfit", "Fira Code", monospace`
    ctx.fillStyle = `rgba(241, 245, 249, ${alpha})`
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 10
    ctx.textAlign = 'center'
    ctx.fillText(item.text, 0, -2)

    // 解説ラベル
    ctx.font = `600 9px monospace`
    ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.9})`
    ctx.shadowBlur = 0
    ctx.fillText(item.desc, 0, 16)

    ctx.restore()
  })
  ctx.restore()
}

// ラボタイトル・ロゴ（Phase 3 & 4）
function drawLabTitle(ctx, cx, cy, t, phase, w) {
  if (t < 2.7) return
  ctx.save()

  const elapsed = t - 2.7
  const alpha = Math.min(1, elapsed * 2.5)

  // 1. ボーアの水素原子模型（3重交差楕円軌道）
  const ringR = 90
  ctx.lineWidth = 2
  for (let rot = 0; rot < 3; rot++) {
    ctx.save()
    ctx.translate(cx, cy - 45)
    ctx.rotate((rot * Math.PI) / 3 + t * 1.2)
    ctx.beginPath()
    ctx.ellipse(0, 0, ringR, ringR * 0.38, 0, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 16
    ctx.stroke()
    ctx.restore()
  }

  // 2. 原子の中心核
  ctx.beginPath()
  ctx.arc(cx, cy - 45, 16 + Math.sin(t * 8) * 2, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 25
  ctx.fill()

  // 3. タイトル背景バックライト
  const bgGrad = ctx.createRadialGradient(cx, cy + 90, 20, cx, cy + 90, 300)
  bgGrad.addColorStop(0, `rgba(3, 7, 18, ${alpha * 0.9})`)
  bgGrad.addColorStop(1, 'rgba(3, 7, 18, 0)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(cx - 360, cy + 30, 720, 160)

  // 4. メインタイトル
  ctx.textAlign = 'center'
  const fontSize = Math.min(38, Math.max(26, w * 0.045))
  ctx.font = `900 ${fontSize}px "Outfit", "Inter", sans-serif`
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 22
  ctx.fillText('高校物理シミュレーションラボ', cx, cy + 85)

  // サブタイトル
  ctx.font = `700 13px "Fira Code", monospace`
  ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`
  ctx.shadowBlur = 8
  ctx.fillText('INTERACTIVE PHYSICS SIMULATION LABORATORY', cx, cy + 115)

  // キャッチコピー
  ctx.font = `500 14px sans-serif`
  ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.95})`
  ctx.shadowBlur = 0
  ctx.fillText('すべての公式には、理由がある。動く世界で物理を解き明かす。', cx, cy + 142)

  // 水平アナモルフィック・レンズフレア光芒
  ctx.save()
  const flareW = Math.min(w * 0.85, 750) * Math.min(1, elapsed * 1.5)
  const flareGrad = ctx.createLinearGradient(cx - flareW / 2, cy + 85, cx + flareW / 2, cy + 85)
  flareGrad.addColorStop(0, 'rgba(56, 189, 248, 0)')
  flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.75})`)
  flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)')
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

  // タイムラインとフェーズ自動更新
  if (t < 0.8) {
    currentPhase.value = 0
    phaseCaption.value = 'T = 0.000s | SINGULARITY // QUANTUM VACUUM FLUCTUATION'
  } else if (t < 1.8) {
    currentPhase.value = 1
    phaseCaption.value = 'T = 10⁻³²s | BIG BANG // RELATIVISTIC INFLATION & EM FIELDS'
    if (!bigBangTriggered && fixedTimeParam === null) {
      bigBangTriggered = true
      playBigBangSound()
      shockwaves.push({ x: cx, y: cy, radius: 5, speed: 1200, alpha: 1.0, color: '#38bdf8', width: 4.5 })
      shockwaves.push({ x: cx, y: cy, radius: 2, speed: 850, alpha: 0.9, color: '#fbbf24', width: 3.5 })
      shockwaves.push({ x: cx, y: cy, radius: 1, speed: 500, alpha: 0.85, color: '#f43f5e', width: 2.5 })
    }
  } else if (t < 2.8) {
    currentPhase.value = 2
    phaseCaption.value = 'T = 3.8×10⁵ yr | ORDER EMERGENCE // KEPLERIAN GRAVITATIONAL BALLET'
  } else if (t < initDuration) {
    currentPhase.value = 3
    phaseCaption.value = 'T = 13.8 Gyr | ATOMIC EMERGENCE // LABORATORY HARMONY'
    if (!chimeTriggered && fixedTimeParam === null) {
      chimeTriggered = true
      playChimeSound()
    }
  } else if (t < totalMaxDuration) {
    currentPhase.value = 4
    phaseCaption.value = 'SYSTEM READY // ALL LAWS SYNCHRONIZED [CLICK TO ENTER]'
  } else {
    // 7.8秒経過（十分な余韻時間）で自動的に優雅なロングフェードアウト
    finishIntro()
    return
  }

  try {
    // 画面クリア（加算合成＆微小残像トレイル）
    ctx.save()
    ctx.fillStyle = currentPhase.value === 4 ? 'rgba(3, 7, 18, 0.30)' : 'rgba(3, 7, 18, 0.36)'
    ctx.fillRect(0, 0, w, h)
    ctx.restore()

    // 1. 時空測地線グリッド
    drawSpacetimeGrid(ctx, w, h, t, cx, cy, currentPhase.value)

    // 2. 特異点（Phase 0）
    if (currentPhase.value === 0) {
      drawSingularity(ctx, cx, cy, t)
    }

    // 3. マクスウェル電磁波（Phase 1〜2）
    if (currentPhase.value === 1 || currentPhase.value === 2) {
      drawMaxwellWaves(ctx, w, h, t)
    }

    // 4. ケプラー惑星軌道（Phase 2）
    if (currentPhase.value === 2) {
      drawKeplerOrbits(ctx, cx, cy, t)
    }

    // 5. 粒子シミュレーション更新と描画
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const stepDt = fixedTimeParam !== null ? 0.016 : Math.min(0.033, 1 / 60)
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(stepDt, t, cx, cy, currentPhase.value)
      particles[i].draw(ctx, currentPhase.value)
    }
    ctx.restore()

    // 6. 相対論的ショックウェーブ
    drawShockwaves(ctx, stepDt)

    // 7. 公式ホログラム
    if (currentPhase.value >= 1) {
      drawFormulas(ctx, w, h, t)
    }

    // 8. ラボエンブレム・タイトル（Phase 3〜4）
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
            <span class="hud-title">PHYSICS ENGINE v3.0</span>
          </div>
          <div class="hud-status-badge" :class="{ 'status-ready': isReadyToEnter }">
            <span class="pulsing-radar" :class="{ 'radar-ready': isReadyToEnter }"></span>
            <span class="status-seq-text">
              {{ isReadyToEnter ? '✨ SYSTEM READY // ALL MODULES SYNCHRONIZED' : `⚡ INITIALIZING CORE [${progressPercent}%]` }}
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
            :title="isSoundEnabled ? 'サウンド OFF' : 'サウンド ON (重力シンセ音)'"
          >
            {{ isSoundEnabled ? '🔊 SOUND ON' : '🔈 SOUND OFF' }}
          </button>
          <button
            class="hud-btn never-btn"
            @click.stop="neverPlayAgain"
            title="次回以降はこのアニメーションを表示せず直接サイトを開きます"
          >
            ✕ 次からは再生しない
          </button>
          <button
            class="hud-btn skip-btn"
            @click.stop="finishIntro"
            title="今すぐサイトへ進む (ESC)"
          >
            ⏩ スキップしてサイトへ [ESC]
          </button>
        </div>
      </div>

      <!-- 中央「実験室へ入る」アクション（タイトル完成後にフワッと優美に現れる） -->
      <transition name="enter-btn-fade">
        <div
          v-if="isReadyToEnter"
          class="center-action-area"
          @click.stop="finishIntro"
        >
          <button class="enter-lab-btn" @click.stop="finishIntro">
            <span class="enter-icon">🚀</span>
            <span class="enter-text-group">
              <span class="enter-main-title">実験室へ入る</span>
              <span class="enter-sub-title">ENTER LABORATORY</span>
            </span>
            <span class="enter-kbd-badge">↵ Enter</span>
          </button>
        </div>
      </transition>

      <!-- HUD Bottom Bar -->
      <div class="hud-bottom-bar">
        <div class="hud-hint">
          <span class="hint-sparkle">✦</span> 「実験室へ入る」ボタンまたは画面クリックでサイトへ進みます（放置でも自然に移行します）
        </div>
        <button class="bottom-never-btn" @click.stop="neverPlayAgain">
          次からは再生しない
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
  background-color: #030712;
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
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  z-index: 100;
}

.top-timeline-bar {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #ec4899);
  box-shadow: 0 0 12px #38bdf8, 0 0 4px #ec4899;
  transition: width 0.08s linear;
}

.top-timeline-bar.complete {
  background: linear-gradient(90deg, #10b981, #38bdf8, #818cf8);
  box-shadow: 0 0 16px #10b981, 0 0 8px #38bdf8;
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
  background: linear-gradient(to bottom, rgba(3, 7, 18, 0.88) 0%, transparent 100%);
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
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.32);
  padding: 4px 12px;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
}

.pulsing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
  animation: pulseDot 1.2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

.hud-title {
  font-family: 'Fira Code', monospace;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: #38bdf8;
  font-weight: 700;
}

.hud-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 4px 12px;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  transition: all 0.4s ease;
}

.hud-status-badge.status-ready {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.45);
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
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.status-seq-text {
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  color: #7dd3fc;
  font-weight: 700;
  transition: color 0.4s ease;
}

.hud-status-badge.status-ready .status-seq-text {
  color: #6ee7b7;
}

.hud-caption {
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #e2e8f0;
  letter-spacing: 0.05em;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  background: rgba(15, 23, 42, 0.65);
  padding: 4px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hud-controls {
  display: flex;
  gap: 10px;
  pointer-events: auto;
}

.hud-btn {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #f1f5f9;
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.hud-btn:hover {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
  color: #38bdf8;
  transform: translateY(-1px);
}

.never-btn {
  background: rgba(244, 63, 94, 0.16);
  border-color: rgba(244, 63, 94, 0.45);
  color: #fca5a5;
}

.never-btn:hover {
  background: rgba(244, 63, 94, 0.35);
  border-color: #f43f5e;
  color: #ffffff;
  box-shadow: 0 0 14px rgba(244, 63, 94, 0.4);
}

.skip-btn {
  background: rgba(56, 189, 248, 0.28);
  border-color: #38bdf8;
  color: #ffffff;
}

.skip-btn:hover {
  background: #38bdf8;
  color: #030712;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.5);
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
  background: linear-gradient(to top, rgba(3, 7, 18, 0.88) 0%, transparent 100%);
  pointer-events: auto;
  z-index: 10;
}

.hud-hint {
  font-size: 0.82rem;
  color: #94a3b8;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-sparkle {
  color: #38bdf8;
  font-size: 0.95rem;
  text-shadow: 0 0 8px #38bdf8;
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

/* 中央「実験室へ入る」アクション */
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
  padding: 10px 26px;
  background: rgba(15, 23, 42, 0.90);
  border: 1.5px solid rgba(56, 189, 248, 0.7);
  border-radius: 9999px;
  color: #ffffff;
  cursor: pointer;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.45), 0 4px 18px rgba(0, 0, 0, 0.6);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  animation: enterPulse 2.8s infinite ease-in-out;
}

@keyframes enterPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), 0 4px 18px rgba(0, 0, 0, 0.6);
    border-color: rgba(56, 189, 248, 0.65);
  }
  50% {
    box-shadow: 0 0 38px rgba(56, 189, 248, 0.8), 0 0 18px rgba(129, 140, 248, 0.5), 0 4px 22px rgba(0, 0, 0, 0.7);
    border-color: #38bdf8;
  }
}

.enter-lab-btn:hover {
  transform: translateY(-2px) scale(1.03);
  background: rgba(56, 189, 248, 0.25);
  border-color: #38bdf8;
  box-shadow: 0 0 44px rgba(56, 189, 248, 0.9), 0 0 22px #818cf8;
}

.enter-icon {
  font-size: 1.35rem;
  filter: drop-shadow(0 0 6px #38bdf8);
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
