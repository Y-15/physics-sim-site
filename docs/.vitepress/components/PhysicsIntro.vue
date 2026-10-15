<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const isClient = ref(false)
const isVisible = ref(true)
const isFadingOut = ref(false)
const isSoundEnabled = ref(false)
const autoSkipNextTime = ref(false)

const canvasRef = ref(null)
let animationId = null
let audioCtx = null
let masterGain = null

// アニメーション進行管理
const simTime = ref(0)
const maxDuration = 5.0 // 全体で5秒のシネマティック物理導入
const currentPhase = ref(0)
const phaseCaption = ref('QUANTUM SINGULARITY & SPACETIME WARP')

// マウスインタラクション
const mouse = {
  x: -1000,
  y: -1000,
  isDown: false,
  active: false
}

// 物理公式ホログラム一覧
const formulas = [
  { text: 'm(d²r/dt²) = F', x: 0.16, y: 0.28, size: 21, delay: 1.2 },
  { text: 'E = mc²', x: 0.84, y: 0.26, size: 24, delay: 1.4 },
  { text: '∇ × E = -∂B/∂t', x: 0.14, y: 0.72, size: 20, delay: 1.7 },
  { text: 'iħ(∂ψ/∂t) = Ĥψ', x: 0.84, y: 0.72, size: 21, delay: 2.0 },
  { text: 'F = G(Mm/r²)', x: 0.5, y: 0.13, size: 22, delay: 2.3 },
  { text: 'T = 2π√(m/k)', x: 0.5, y: 0.90, size: 20, delay: 2.6 }
]

// 音響シンセサイザー (Web Audio API)
function initAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime)
    masterGain.connect(audioCtx.destination)
  } catch (e) {
    console.warn('Web Audio API not supported', e)
  }
}

function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
  isSoundEnabled.value = !isSoundEnabled.value
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isSoundEnabled.value ? 0.2 : 0, audioCtx.currentTime)
    if (isSoundEnabled.value) {
      playTone(440, 'sine', 0.2, 0.05)
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
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(32, audioCtx.currentTime + 1.2)
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(audioCtx.currentTime + 1.4)
  } catch (e) {}
}

function playChimeSound() {
  if (!isSoundEnabled.value || !audioCtx) return
  const notes = [329.63, 415.30, 493.88, 622.25, 659.25]
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 'sine', 1.5, 0.08)
    }, idx * 90)
  })
}

// 粒子システム
const particles = []
const NUM_PARTICLES = 650
const shockwaves = []

class Particle {
  constructor(w, h) {
    this.reset(w, h, true)
  }

  reset(w, h, initial = false) {
    this.w = w
    this.h = h
    const cx = w / 2
    const cy = h / 2

    const angle = Math.random() * Math.PI * 2
    const r = initial ? Math.pow(Math.random(), 2.0) * 15 : Math.random() * 6
    this.x = cx + Math.cos(angle) * r
    this.y = cy + Math.sin(angle) * r

    // ビッグバン初速度
    const speed = 250 + Math.random() * 550
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed

    this.mass = 0.5 + Math.random() * 2.0
    this.charge = Math.random() > 0.5 ? 1 : -1
    this.radius = 1.3 + Math.random() * 2.2

    const colors = [
      '#38bdf8', // シアン (電場/量子)
      '#60a5fa', // スカイブルー
      '#c084fc', // バイオレット (相対論)
      '#fbbf24', // ゴールド (重力/エネルギー)
      '#34d399', // エメラルド (波動)
      '#ffffff'  // ホワイト
    ]
    this.color = colors[Math.floor(Math.random() * colors.length)]

    // 軌道パラメータ（ケプラー楕円運動）
    this.orbitRadius = 60 + Math.random() * (Math.min(w, h) * 0.42)
    this.orbitAngle = Math.random() * Math.PI * 2
    this.orbitSpeed = (1.5 + Math.random() * 2.2) * (Math.random() > 0.5 ? 1 : -1)
    this.orbitEccentricity = 0.65 + Math.random() * 0.5

    this.trail = []
    this.maxTrail = Math.floor(6 + Math.random() * 7)
  }

  update(dt, t, cx, cy, phase) {
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > this.maxTrail) {
      this.trail.shift()
    }

    if (phase === 0) {
      // Phase 0: 特異点振動（量子ゆらぎ）
      const dr = (Math.random() - 0.5) * 6
      this.x = cx + Math.cos(t * 18 + this.orbitAngle) * (6 + dr)
      this.y = cy + Math.sin(t * 18 + this.orbitAngle) * (6 + dr)
      return
    }

    if (phase === 1) {
      // Phase 1: インフレーション膨張
      this.x += this.vx * dt
      this.y += this.vy * dt
      this.vx *= Math.pow(0.92, dt * 60)
      this.vy *= Math.pow(0.92, dt * 60)
    } else if (phase === 2) {
      // Phase 2: 自己組織化（万有引力とケプラー楕円軌道）
      this.orbitAngle += this.orbitSpeed * dt * 0.95
      const targetX = cx + Math.cos(this.orbitAngle) * this.orbitRadius
      const targetY = cy + Math.sin(this.orbitAngle) * (this.orbitRadius * this.orbitEccentricity)

      const springK = 6.0
      this.vx += (targetX - this.x) * springK * dt
      this.vy += (targetY - this.y) * springK * dt
      this.vx *= Math.pow(0.88, dt * 60)
      this.vy *= Math.pow(0.88, dt * 60)

      this.x += this.vx * dt * 20
      this.y += this.vy * dt * 20
    } else if (phase === 3) {
      // Phase 3: ラボエンブレム・シンクロトロン光輪への収束
      const ringRadius = 150 + (this.charge > 0 ? 35 : -25)
      this.orbitAngle += (this.charge > 0 ? 2.8 : -2.8) * dt
      const targetX = cx + Math.cos(this.orbitAngle) * ringRadius
      const targetY = cy + Math.sin(this.orbitAngle) * (ringRadius * 0.42) - 40

      this.x += (targetX - this.x) * 5.0 * dt
      this.y += (targetY - this.y) * 5.0 * dt
    } else if (phase === 4) {
      // Phase 4: ハイパードライブ（手前へ光速ワープ）
      const dx = this.x - cx
      const dy = this.y - cy
      const dist = Math.hypot(dx, dy) || 1
      const warpSpeed = (dist * 4.0 + 450) * dt
      this.x += (dx / dist) * warpSpeed
      this.y += (dy / dist) * warpSpeed
      this.radius *= 1.025
    }

    // マウス重力インタラクション
    if (mouse.active) {
      const mdx = mouse.x - this.x
      const mdy = mouse.y - this.y
      const mdistSq = mdx * mdx + mdy * mdy + 400
      const mforce = 60000 / mdistSq
      if (mouse.isDown) {
        this.x -= (mdx / Math.sqrt(mdistSq)) * mforce * dt * 1.5
        this.y -= (mdy / Math.sqrt(mdistSq)) * mforce * dt * 1.5
      } else {
        this.x += (mdx / Math.sqrt(mdistSq)) * mforce * dt
        this.y += (mdy / Math.sqrt(mdistSq)) * mforce * dt
      }
    }
  }

  draw(ctx, phase) {
    if (this.trail.length < 2) return

    ctx.beginPath()
    ctx.moveTo(this.trail[0].x, this.trail[0].y)
    for (let i = 1; i < this.trail.length; i++) {
      ctx.lineTo(this.trail[i].x, this.trail[i].y)
    }
    ctx.strokeStyle = this.color
    ctx.globalAlpha = phase === 4 ? 0.85 : 0.45
    ctx.lineWidth = phase === 4 ? this.radius * 2.0 : this.radius * 0.9
    ctx.stroke()

    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.shadowColor = this.color
    ctx.shadowBlur = phase === 0 ? 14 : 9
    ctx.globalAlpha = 0.95
    ctx.fill()
    ctx.restore()
  }
}

// 時空メッシュ（重力井戸・アインシュタインの一般相対性理論）
function drawSpacetimeGrid(ctx, w, h, t, cx, cy, phase) {
  ctx.save()
  const step = 42
  ctx.lineWidth = 1

  // 水平線
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 14) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      let warp = 0
      if (phase === 0) {
        warp = Math.exp(-dist * 0.012) * (55 * (1 + Math.sin(t * 8) * 0.25))
      } else if (phase >= 1 && phase <= 3) {
        warp = Math.exp(-dist * 0.007) * (30 + Math.sin(t * 4 - dist * 0.03) * 6)
      }
      if (mouse.active) {
        const mdist = Math.hypot(x - mouse.x, y - mouse.y)
        warp += Math.exp(-mdist * 0.015) * (mouse.isDown ? -35 : 35)
      }

      const drawY = y + (dy / (dist || 1)) * warp * 0.7
      if (x === 0) ctx.moveTo(x, drawY)
      else ctx.lineTo(x, drawY)
    }
    const distYRatio = Math.abs(y - cy) / (h * 0.8)
    const alpha = Math.max(0.06, 0.22 - distYRatio * 0.16)
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`
    ctx.stroke()
  }

  // 垂直線
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath()
    for (let y = 0; y <= h; y += 14) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      let warp = 0
      if (phase === 0) {
        warp = Math.exp(-dist * 0.012) * (55 * (1 + Math.sin(t * 8) * 0.25))
      } else if (phase >= 1 && phase <= 3) {
        warp = Math.exp(-dist * 0.007) * (30 + Math.sin(t * 4 - dist * 0.03) * 6)
      }
      if (mouse.active) {
        const mdist = Math.hypot(x - mouse.x, y - mouse.y)
        warp += Math.exp(-mdist * 0.015) * (mouse.isDown ? -35 : 35)
      }

      const drawX = x + (dx / (dist || 1)) * warp * 0.7
      if (y === 0) ctx.moveTo(drawX, y)
      else ctx.lineTo(drawX, y)
    }
    const distXRatio = Math.abs(x - cx) / (w * 0.8)
    const alpha = Math.max(0.06, 0.22 - distXRatio * 0.16)
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`
    ctx.stroke()
  }
  ctx.restore()
}

// ショックウェーブ（衝撃波リング）
function drawShockwaves(ctx, dt) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i]
    sw.radius += sw.speed * dt
    sw.alpha *= Math.pow(0.94, dt * 60)

    if (sw.alpha < 0.01) {
      shockwaves.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
    ctx.strokeStyle = sw.color
    ctx.shadowColor = sw.color
    ctx.shadowBlur = 20
    ctx.lineWidth = sw.width
    ctx.globalAlpha = sw.alpha
    ctx.stroke()
    ctx.restore()
  }
}

// 物理公式ホログラムの描画
function drawFormulas(ctx, w, h, t) {
  ctx.save()
  formulas.forEach((item) => {
    let alpha = 0
    if (t >= item.delay) {
      alpha = Math.min(0.85, (t - item.delay) * 1.5)
    }
    if (alpha <= 0.01) return

    const px = item.x * w
    const py = item.y * h + Math.sin(t * 2.5 + item.delay * 3) * 7

    ctx.font = `600 ${item.size}px "Fira Code", monospace, serif`
    ctx.fillStyle = '#38bdf8'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 12
    ctx.globalAlpha = alpha * (0.8 + Math.sin(t * 4 + item.x * 10) * 0.2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.text, px, py)

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'
    ctx.lineWidth = 1.2
    const textW = ctx.measureText(item.text).width
    ctx.strokeRect(px - textW / 2 - 10, py - item.size / 2 - 5, textW + 20, item.size + 10)
  })
  ctx.restore()
}

// 中央ラボエンブレムとタイトルの描画（Phase 3）
function drawLabEmblem(ctx, cx, cy, t, phase, w) {
  if (phase < 3) return

  ctx.save()
  const appear = Math.min(1, (t - 3.4) * 2.5)
  ctx.globalAlpha = appear

  // 1. ボーアの電子軌道リング（3重交差楕円）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 18
  ctx.lineWidth = 2.5

  const ringR = 95
  for (let rot = 0; rot < 3; rot++) {
    ctx.save()
    ctx.translate(cx, cy - 40)
    ctx.rotate((rot * Math.PI) / 3 + t * 0.9)
    ctx.beginPath()
    ctx.ellipse(0, 0, ringR, ringR * 0.38, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // 2. 原子の中心核
  ctx.beginPath()
  ctx.arc(cx, cy - 40, 18 + Math.sin(t * 8) * 2.5, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 28
  ctx.fill()

  // 3. タイトルテキスト背景バックライト（粒子の光彩に対する可読性担保）
  const bgGrad = ctx.createRadialGradient(cx, cy + 120, 20, cx, cy + 120, 260)
  bgGrad.addColorStop(0, 'rgba(3, 7, 18, 0.82)')
  bgGrad.addColorStop(1, 'rgba(3, 7, 18, 0)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(cx - 320, cy + 50, 640, 160)

  ctx.shadowBlur = 16
  ctx.shadowColor = 'rgba(56, 189, 248, 0.9)'
  ctx.textAlign = 'center'

  const fontSize = Math.min(36, Math.max(24, w * 0.042))
  ctx.font = `800 ${fontSize}px "Outfit", "Inter", sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.fillText('高校物理シミュレーションラボ', cx, cy + 90)

  ctx.font = `600 14px "Fira Code", monospace`
  ctx.fillStyle = '#38bdf8'
  ctx.shadowBlur = 10
  ctx.fillText('INTERACTIVE PHYSICS SIMULATION LABORATORY', cx, cy + 122)

  ctx.font = `500 14px sans-serif`
  ctx.fillStyle = '#cbd5e1'
  ctx.shadowBlur = 0
  ctx.fillText('すべての公式には、理由がある。動く世界で物理を解き明かす。', cx, cy + 150)

  // プログレスバー
  const barW = Math.min(380, w * 0.75)
  const barH = 5
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.fillRect(cx - barW / 2, cy + 178, barW, barH)

  const progress = Math.min(1, (t - 3.4) / 0.9)
  ctx.fillStyle = '#38bdf8'
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  ctx.fillRect(cx - barW / 2, cy + 178, barW * progress, barH)

  ctx.font = `700 11px monospace`
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(progress >= 1 ? 'PHYSICS ENGINE SYNCHRONIZED [100%]' : `INITIALIZING VIRTUAL LAB [${Math.floor(progress * 100)}%]`, cx, cy + 200)

  ctx.restore()
}

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

  if (t < 0.9) {
    currentPhase.value = 0
    phaseCaption.value = 'T = 0.000s | QUANTUM SINGULARITY & FLUCTUATION'
  } else if (t < 2.2) {
    currentPhase.value = 1
    phaseCaption.value = 'T = 10⁻³²s | COSMIC INFLATION & FIELD EMERGENCE'
    if (!bigBangTriggered && fixedTimeParam === null) {
      bigBangTriggered = true
      playBigBangSound()
      shockwaves.push({ x: cx, y: cy, radius: 5, speed: 1100, alpha: 1.0, color: '#38bdf8', width: 4 })
      shockwaves.push({ x: cx, y: cy, radius: 2, speed: 750, alpha: 0.9, color: '#fbbf24', width: 3 })
      shockwaves.push({ x: cx, y: cy, radius: 1, speed: 450, alpha: 0.8, color: '#a855f7', width: 2 })
    }
  } else if (t < 3.5) {
    currentPhase.value = 2
    phaseCaption.value = 'T = 3.8×10⁵ yr | SELF-ORGANIZATION & GRAVITATIONAL ORBITS'
  } else if (t < 4.5) {
    currentPhase.value = 3
    phaseCaption.value = 'REAL-TIME PHYSICS ENGINE | SIMULATION READY'
    if (!chimeTriggered && fixedTimeParam === null) {
      chimeTriggered = true
      playChimeSound()
    }
  } else if (t < maxDuration) {
    currentPhase.value = 4
    phaseCaption.value = 'WARP TO LABORATORY | ENTERING MATRIX'
  } else {
    finishIntro()
    return
  }

  // 画面クリア（加算合成＆微小残像トレイル）
  ctx.save()
  ctx.fillStyle = currentPhase.value === 4 ? 'rgba(3, 7, 18, 0.25)' : 'rgba(3, 7, 18, 0.38)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // 1. 時空グリッド
  drawSpacetimeGrid(ctx, w, h, t, cx, cy, currentPhase.value)

  // 2. 粒子シミュレーション更新と描画
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const stepDt = fixedTimeParam !== null ? 0.016 : Math.min(0.033, 1 / 60)
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(stepDt, t, cx, cy, currentPhase.value)
    particles[i].draw(ctx, currentPhase.value)
  }
  ctx.restore()

  // 3. ショックウェーブ
  drawShockwaves(ctx, stepDt)

  // 4. 公式ホログラム（Phase 1以降）
  if (currentPhase.value >= 1) {
    drawFormulas(ctx, w, h, t)
  }

  // 5. ラボエンブレム・タイトル（Phase 3）
  drawLabEmblem(ctx, cx, cy, t, currentPhase.value, w)

  if (fixedTimeParam === null) {
    animationId = requestAnimationFrame(animate)
  }
}

function finishIntro() {
  if (isFadingOut.value) return
  isFadingOut.value = true

  if (autoSkipNextTime.value && typeof window !== 'undefined') {
    localStorage.setItem('physics_sim_intro_skip', 'true')
  }

  setTimeout(() => {
    isVisible.value = false
    if (animationId) cancelAnimationFrame(animationId)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }, 450)
}

function handleResize() {
  if (!canvasRef.value) return
  const dpr = window.devicePixelRatio || 1
  canvasRef.value.width = window.innerWidth * dpr
  canvasRef.value.height = window.innerHeight * dpr
  const ctx = canvasRef.value.getContext('2d')
  ctx.scale(dpr, dpr)
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
    speed: 600,
    alpha: 0.9,
    color: '#38bdf8',
    width: 2.5
  })
  playTone(587.33, 'sine', 0.3, 0.08)
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
  if (e.key === 'Escape' || e.key === ' ') {
    finishIntro()
  }
}

function playIntroManually() {
  simTime.value = 0
  startTime = null
  lastTimestamp = 0
  fixedTimeParam = null
  bigBangTriggered = false
  chimeTriggered = false
  isFadingOut.value = false
  isVisible.value = true

  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  handleResize()
  const w = window.innerWidth
  const h = window.innerHeight
  particles.length = 0
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle(w, h))
  }
  shockwaves.length = 0

  if (animationId) cancelAnimationFrame(animationId)
  animationId = requestAnimationFrame(animate)
}

onMounted(async () => {
  isClient.value = true
  await nextTick()

  const hasSeenIntro = sessionStorage.getItem('physics_sim_intro_seen')
  const permanentSkip = localStorage.getItem('physics_sim_intro_skip')

  window.addEventListener('play-physics-intro', playIntroManually)
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', onKeyDown)

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const testT = urlParams?.get('intro_t') ? parseFloat(urlParams.get('intro_t')) : null

  if (testT !== null && !isNaN(testT)) {
    fixedTimeParam = testT
    isVisible.value = true
    document.body.style.overflow = 'hidden'
    handleResize()
    const w = window.innerWidth
    const h = window.innerHeight
    const cx = w / 2
    const cy = h / 2
    particles.length = 0
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle(w, h))
    }
    const simDt = 0.016
    let curT = 0
    while (curT < testT) {
      let phase = 0
      if (curT < 0.9) phase = 0
      else if (curT < 2.2) phase = 1
      else if (curT < 3.5) phase = 2
      else if (curT < 4.5) phase = 3
      else phase = 4
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(simDt, curT, cx, cy, phase)
      }
      curT += simDt
    }
    if (testT >= 1.0 && testT <= 2.2) {
      const swRadius = (testT - 0.9) * 450
      shockwaves.push({ x: cx, y: cy, radius: swRadius, speed: 0, alpha: 0.85, color: '#38bdf8', width: 3.5 })
      shockwaves.push({ x: cx, y: cy, radius: swRadius * 0.7, speed: 0, alpha: 0.7, color: '#fbbf24', width: 2.5 })
    }
    animate(performance.now())
    return
  }

  if (permanentSkip === 'true' || hasSeenIntro === 'true') {
    isVisible.value = false
    return
  }

  sessionStorage.setItem('physics_sim_intro_seen', 'true')
  isVisible.value = true
  document.body.style.overflow = 'hidden'

  handleResize()
  const w = window.innerWidth
  const h = window.innerHeight
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle(w, h))
  }
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('play-physics-intro', playIntroManually)
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
      :class="{ 'fade-out': isFadingOut }"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @touchmove="onTouchMove"
      @touchstart="onMouseDown"
    >
      <canvas ref="canvasRef" class="physics-canvas"></canvas>

      <div class="hud-top-bar">
        <div class="hud-badge">
          <span class="pulsing-dot"></span>
          <span class="hud-title">PHYSICS ENGINE v2.6 // REAL-TIME CALCULATION</span>
        </div>
        <div class="hud-caption">
          {{ phaseCaption }}
        </div>
        <div class="hud-controls">
          <button
            class="hud-btn sound-btn"
            @click.stop="toggleSound"
            :title="isSoundEnabled ? 'サウンド OFF' : 'サウンド ON (物理シンセ音)'"
          >
            {{ isSoundEnabled ? '🔊 SOUND ON' : '🔈 SOUND OFF' }}
          </button>
          <button
            class="hud-btn skip-btn"
            @click.stop="finishIntro"
            title="スキップ (ESC)"
          >
            ⏩ スキップ [ESC]
          </button>
        </div>
      </div>

      <div class="hud-bottom-bar">
        <div class="hud-hint">
          💡 画面内をマウス移動で重力レンズ、クリックで量子衝撃波が発生します
        </div>
        <label class="skip-next-label">
          <input type="checkbox" v-model="autoSkipNextTime" />
          次回から自動スキップ
        </label>
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
  z-index: 999999;
  background-color: #030712;
  overflow: hidden;
  user-select: none;
  cursor: crosshair;
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s ease-out;
}

.physics-intro-overlay.fade-out {
  opacity: 0;
  transform: scale(1.04);
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
  background: linear-gradient(to bottom, rgba(3, 7, 18, 0.85) 0%, transparent 100%);
  z-index: 10;
}

.hud-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
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
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #38bdf8;
  font-weight: 700;
}

.hud-caption {
  font-family: 'Fira Code', monospace;
  font-size: 0.82rem;
  color: #e2e8f0;
  letter-spacing: 0.05em;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  background: rgba(15, 23, 42, 0.6);
  padding: 4px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hud-controls {
  display: flex;
  gap: 12px;
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
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.skip-btn {
  background: rgba(56, 189, 248, 0.25);
  border-color: #38bdf8;
  color: #ffffff;
}

.skip-btn:hover {
  background: #38bdf8;
  color: #030712;
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
  background: linear-gradient(to top, rgba(3, 7, 18, 0.85) 0%, transparent 100%);
  pointer-events: auto;
  z-index: 10;
}

.hud-hint {
  font-size: 0.82rem;
  color: #94a3b8;
  letter-spacing: 0.03em;
}

.skip-next-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #cbd5e1;
  cursor: pointer;
}

.skip-next-label input[type="checkbox"] {
  accent-color: #38bdf8;
  cursor: pointer;
}

@media (max-width: 768px) {
  .hud-caption {
    display: none;
  }
  .hud-hint {
    display: none;
  }
}
</style>
