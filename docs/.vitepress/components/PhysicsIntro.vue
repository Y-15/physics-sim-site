<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useData, withBase } from 'vitepress'

const { frontmatter } = useData()

// ビデオソースパス（VitePress の base 設定に対応）
const videoSrc = withBase('/physics_intro.mp4')

const isClient = ref(false)
const isVisible = ref(false)
const isFadingOut = ref(false)
const isMuted = ref(true)
const isAutoplayBlocked = ref(false)
const isPlaying = ref(false)

const mainVideoRef = ref(null)
const bgVideoRef = ref(null)
const canvasRef = ref(null)

const currentTime = ref(0)
const duration = ref(10.0)

// タイトルが完成するクライマックス（約8.0秒以降）または再生完了で「物理の世界へ入る」ボタンを表示
const isReadyToEnter = computed(() => currentTime.value >= 8.0 || (duration.value > 0 && currentTime.value >= duration.value - 0.2))

// タイムライン進捗率 (0% - 100%)
const progressPercent = computed(() => {
  if (!duration.value || duration.value <= 0) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

// 再生ステージに応じた映画的 HUD キャプション
const phaseCaption = computed(() => {
  const t = currentTime.value
  if (t < 2.2) {
    return 'PHASE 01 // QUANTUM VACUUM & WAVE PACKETS (量子真空の揺らぎ・波動束)'
  } else if (t < 4.5) {
    return 'PHASE 02 // NUCLEAR BURST & VECTOR FIELD DYNAMICS (励起・散乱ベクトル)'
  } else if (t < 7.0) {
    return 'PHASE 03 // SPECTRAL FIELD & WAVE INTERFERENCE (多次元スペクトル・光の分散)'
  } else if (t < 8.4) {
    return 'PHASE 04 // QUANTUM ORBITS & ATOMIC RESONANCE (ボーア軌道共鳴・原子収束)'
  } else {
    return 'PHASE 05 // SYSTEM ONLINE (高校物理シミュレーションラボ開室)'
  }
})

// マウス座標（背景パーティクル・グリッドの微小なパララックス連動）
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
let animFrameId = null
const particles = []

function initParticles(w, h) {
  particles.length = 0
  const count = 60
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.0 + 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2
    })
  }
}

function drawBackgroundEffects() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // マウスのイージング追随
  mouse.x += (mouse.targetX - mouse.x) * 0.05
  mouse.y += (mouse.targetY - mouse.y) * 0.05

  // 浮遊パーティクル
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.pulse += 0.02
    if (p.x < 0) p.x = w
    if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h
    if (p.y > h) p.y = 0

    const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
    ctx.beginPath()
    ctx.arc(p.x + mouse.x * 0.02, p.y + mouse.y * 0.02, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha})`
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 6
    ctx.fill()
  }

  // 近接パーティクル同士のサイバー結線
  ctx.lineWidth = 0.5
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 90) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 90) * 0.15})`
        ctx.shadowBlur = 0
        ctx.stroke()
      }
    }
  }

  animFrameId = requestAnimationFrame(drawBackgroundEffects)
}

function handleResize() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
  initParticles(window.innerWidth, window.innerHeight)
}

function onMouseMove(e) {
  mouse.targetX = e.clientX - window.innerWidth / 2
  mouse.targetY = e.clientY - window.innerHeight / 2
}

// ビデオ再生制御
async function startVideoPlayback() {
  const main = mainVideoRef.value
  const bg = bgVideoRef.value
  if (!main) return

  try {
    // まず音声ありでの再生を試みる
    main.muted = false
    await main.play()
    isMuted.value = false
    isAutoplayBlocked.value = false
    isPlaying.value = true
  } catch (err) {
    // ブラウザの自動再生ポリシーによってブロックされた場合はミュートで再生
    console.warn('Autoplay with audio blocked by browser policy. Falling back to muted playback:', err)
    try {
      main.muted = true
      isMuted.value = true
      isAutoplayBlocked.value = true
      await main.play()
      isPlaying.value = true
    } catch (e2) {
      console.error('Video autoplay failed:', e2)
    }
  }

  // アンビエント背景ビデオの同期再生
  if (bg) {
    bg.muted = true
    bg.play().catch(() => {})
  }
}

function onTimeUpdate() {
  if (!mainVideoRef.value) return
  currentTime.value = mainVideoRef.value.currentTime
  if (mainVideoRef.value.duration) {
    duration.value = mainVideoRef.value.duration
  }

  // 背景ビデオとの時間ズレ補正（0.3秒以上のズレがあれば再同期）
  if (bgVideoRef.value) {
    const diff = Math.abs(bgVideoRef.value.currentTime - mainVideoRef.value.currentTime)
    if (diff > 0.3) {
      bgVideoRef.value.currentTime = mainVideoRef.value.currentTime
    }
  }
}

function onVideoLoadedMetadata() {
  if (mainVideoRef.value && mainVideoRef.value.duration) {
    duration.value = mainVideoRef.value.duration
  }
}

function onVideoEnded() {
  // 再生終了時は最後のフレームで一時停止（黒画面にならずロゴがそのまま残り続ける）
  if (mainVideoRef.value) {
    mainVideoRef.value.pause()
  }
  if (bgVideoRef.value) {
    bgVideoRef.value.pause()
  }
  isPlaying.value = false
}

// サウンド切り替え（トグル）
function toggleSound() {
  if (!mainVideoRef.value) return
  const nextMuted = !mainVideoRef.value.muted
  mainVideoRef.value.muted = nextMuted
  isMuted.value = nextMuted
  isAutoplayBlocked.value = false

  // 一時停止していた場合は再生も試みる
  if (mainVideoRef.value.paused) {
    mainVideoRef.value.play().catch(() => {})
  }
}

// 画面クリックでミュート解除＆進む
function onOverlayClick(e) {
  // もしミュート状態かつ自動再生ブロック中なら、クリックで即座にサウンドON
  if (isMuted.value && isAutoplayBlocked.value && mainVideoRef.value) {
    mainVideoRef.value.muted = false
    isMuted.value = false
    isAutoplayBlocked.value = false
  }

  // タイトル完成後は、画面のどこをクリックしても入室可能
  if (isReadyToEnter.value) {
    finishIntro()
  }
}

// イントロ終了（サイトへ進む）
function finishIntro() {
  if (isFadingOut.value) return
  isFadingOut.value = true

  // 同一セッション内での重複表示を防止
  try {
    sessionStorage.setItem('physics_sim_intro_seen_session', 'true')
  } catch (e) {}

  // スクロールバー復元
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  // 0.75秒かけてスムーズにフェードアウトしてから非表示化
  setTimeout(() => {
    if (mainVideoRef.value) mainVideoRef.value.pause()
    if (bgVideoRef.value) bgVideoRef.value.pause()
    isVisible.value = false
    isFadingOut.value = false
  }, 750)
}

// 次回から自動スキップ（永続化）
function neverPlayAgain() {
  try {
    localStorage.setItem('physics_sim_intro_skip', 'true')
  } catch (e) {}
  finishIntro()
}

// 最初からもう一度再生
function replayIntro() {
  isVisible.value = true
  isFadingOut.value = false
  currentTime.value = 0

  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  nextTick(() => {
    handleResize()
    if (mainVideoRef.value) {
      mainVideoRef.value.currentTime = 0
      mainVideoRef.value.muted = isMuted.value
      mainVideoRef.value.play().catch(() => {})
    }
    if (bgVideoRef.value) {
      bgVideoRef.value.currentTime = 0
      bgVideoRef.value.play().catch(() => {})
    }
  })
}

function onKeyDown(e) {
  if (!isVisible.value) return
  if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
    finishIntro()
  } else if (e.key === 'm' || e.key === 'M') {
    toggleSound()
  }
}

onMounted(async () => {
  isClient.value = true

  // URLパラメータ（強制表示・デバッグ検証）
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const forceIntro = urlParams?.has('intro')

  // 永続スキップ設定の確認
  const permanentSkip = typeof localStorage !== 'undefined' ? localStorage.getItem('physics_sim_intro_skip') : null
  if (permanentSkip === 'true' && !forceIntro) {
    isVisible.value = false
    return
  }

  // 同一セッション内で既に見たかどうかの確認（リロード連打時の利便性、ただしforceIntro時は無視）
  const seenSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('physics_sim_intro_seen_session') : null
  if (seenSession === 'true' && !forceIntro) {
    isVisible.value = false
    return
  }

  // ホーム画面判定（frontmatter.layout === 'home' または ルートURL）
  const isHome = forceIntro || frontmatter.value?.layout === 'home' ||
    (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === ''))

  if (!isHome) {
    isVisible.value = false
    return
  }

  // 表示開始
  isVisible.value = true
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  await nextTick()

  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('play-physics-intro', replayIntro)

  handleResize()
  drawBackgroundEffects()

  // ビデオ再生開始
  startVideoPlayback()
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('play-physics-intro', replayIntro)
  }
  if (animFrameId) cancelAnimationFrame(animFrameId)
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
      @click="onOverlayClick"
    >
      <!-- 最上部 全画面タイムライン進行インジケーター (0% -> 100%) -->
      <div class="top-timeline-wrap">
        <div
          class="top-timeline-bar"
          :class="{ complete: isReadyToEnter }"
          :style="{ width: progressPercent + '%' }"
        >
          <span class="timeline-laser-head"></span>
        </div>
      </div>

      <!-- 背景キャンバス（浮遊光子パーティクル & サイバーグリッド） -->
      <canvas ref="canvasRef" class="physics-bg-canvas"></canvas>

      <!-- 映画的アンビエント背景ビデオ（大気光ハロー・画面全体への色光拡散） -->
      <div class="ambient-video-wrap">
        <video
          ref="bgVideoRef"
          class="intro-bg-ambient"
          :src="videoSrc"
          muted
          playsinline
          preload="auto"
          aria-hidden="true"
        ></video>
      </div>

      <!-- メイン高精細シネマティックビデオステージ -->
      <div class="video-stage-container">
        <div class="video-frame-box">
          <video
            ref="mainVideoRef"
            class="intro-main-video"
            :src="videoSrc"
            playsinline
            preload="auto"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onVideoLoadedMetadata"
            @ended="onVideoEnded"
          ></video>

          <!-- ビデオ上部の微細サイバースキャンライン装飾 -->
          <div class="video-scanlines"></div>

          <!-- コーナーアクセントブラケット -->
          <div class="corner-bracket top-left"></div>
          <div class="corner-bracket top-right"></div>
          <div class="corner-bracket bottom-left"></div>
          <div class="corner-bracket bottom-right"></div>
        </div>
      </div>

      <!-- HUD Top Bar -->
      <div class="hud-top-bar" @click.stop>
        <div class="hud-badge-group">
          <div class="hud-badge">
            <span class="pulsing-beacon"></span>
            <span class="hud-title">✦ QUANTUM SIMULATION LAB</span>
          </div>
          <div class="hud-status-badge" :class="{ 'status-ready': isReadyToEnter }">
            <span class="pulsing-radar" :class="{ 'radar-ready': isReadyToEnter }"></span>
            <span class="status-seq-text">
              {{ isReadyToEnter ? '✦ 物理法則とロゴが同期されました ── LAB READY' : `✧ シネマティック初期化進行中 [${Math.floor(progressPercent)}%]` }}
            </span>
          </div>
        </div>

        <div class="hud-caption">
          {{ phaseCaption }}
        </div>

        <div class="hud-controls">
          <!-- ミュート解除案内（自動再生で音声ブロックされた際の目立つ誘導） -->
          <button
            v-if="isAutoplayBlocked && isMuted"
            class="hud-btn sound-alert-btn"
            @click.stop="toggleSound"
            title="クリックしてサウンドをONにします"
          >
            <span class="speaker-wave">🔊</span>
            <span class="sound-alert-text">サウンドをONにする</span>
          </button>

          <!-- 通常サウンドトグル -->
          <button
            v-else
            class="hud-btn sound-btn"
            :class="{ 'sound-active': !isMuted }"
            @click.stop="toggleSound"
            :title="isMuted ? 'サウンドをONにする (M)' : 'サウンドをミュートする (M)'"
          >
            {{ isMuted ? '🔇 ミュート中' : '🔊 SOUND ON' }}
          </button>

          <button
            class="hud-btn never-btn"
            @click.stop="neverPlayAgain"
            title="次回以降はこのアニメーションを自動表示せず直接サイトを開きます"
          >
            ✕ 次回からスキップ
          </button>

          <button
            class="hud-btn skip-btn"
            @click.stop="finishIntro"
            title="今すぐサイトへ進む (ESC / Enter)"
          >
            ✦ スキップ [ESC]
          </button>
        </div>
      </div>

      <!-- 中央「物理の世界へ入る」アクション（完成時に出現するクリスタル・ポータル） -->
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
              <span class="enter-sub-title">ENTER APPLIED PHYSICS LAB</span>
            </span>
            <span class="enter-kbd-badge">↵ Enter</span>
          </button>
        </div>
      </transition>

      <!-- HUD Bottom Bar -->
      <div class="hud-bottom-bar" @click.stop>
        <div class="hud-hint">
          <span class="hint-sparkle">✦</span> クリックまたは「Enter」キーでいつでも入室できます（再生完了後も安定して表示されます）
        </div>
        <div class="bottom-right-actions">
          <button class="bottom-replay-btn" @click.stop="replayIntro" title="最初からもう一度再生">
            ↺ 最初から再生
          </button>
          <button class="bottom-never-btn" @click.stop="neverPlayAgain">
            次回から自動でスキップする
          </button>
        </div>
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
  background-color: #060911;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
  transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.physics-intro-overlay.fade-out {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
}

/* 最上部 全画面タイムライン進行インジケーター */
.top-timeline-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  z-index: 100;
}

.top-timeline-bar {
  height: 100%;
  position: relative;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #38bdf8);
  box-shadow: 0 0 14px #38bdf8, 0 0 8px #c084fc;
  transition: width 0.08s linear;
}

.top-timeline-bar.complete {
  background: linear-gradient(90deg, #38bdf8, #c084fc, #fbbf24);
  box-shadow: 0 0 20px #38bdf8, 0 0 12px #c084fc, 0 0 8px #fbbf24;
}

.timeline-laser-head {
  position: absolute;
  right: 0;
  top: -3px;
  width: 8px;
  height: 9px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 12px #38bdf8, 0 0 20px #ffffff;
}

/* 背景キャンバス */
.physics-bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* アンビエント大気光背景ビデオ */
.ambient-video-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.intro-bg-ambient {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(52px) saturate(1.6) brightness(0.72);
  transform: scale(1.18);
  opacity: 0.45;
}

/* メインビデオステージ */
.video-stage-container {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  box-sizing: border-box;
}

.video-frame-box {
  position: relative;
  max-width: 1280px;
  max-height: calc(100vh - 120px);
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.85), 0 0 60px rgba(56, 189, 248, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.35);
  background: #090d16;
}

.intro-main-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* スキャンラインテクスチャ */
.video-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.12),
    rgba(0, 0, 0, 0.12) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  opacity: 0.6;
}

/* コーナーブラケット */
.corner-bracket {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #38bdf8;
  border-style: solid;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
}

.corner-bracket.top-left {
  top: 8px;
  left: 8px;
  border-width: 2px 0 0 2px;
}

.corner-bracket.top-right {
  top: 8px;
  right: 8px;
  border-width: 2px 2px 0 0;
}

.corner-bracket.bottom-left {
  bottom: 8px;
  left: 8px;
  border-width: 0 0 2px 2px;
}

.corner-bracket.bottom-right {
  bottom: 8px;
  right: 8px;
  border-width: 0 2px 2px 0;
}

/* HUD Top Bar */
.hud-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(6, 9, 17, 0.92) 0%, rgba(6, 9, 17, 0.4) 70%, transparent 100%);
  z-index: 20;
}

.hud-badge-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hud-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(12, 19, 35, 0.82);
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 6px 14px;
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
}

.pulsing-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
  animation: pulseBeacon 1.4s infinite ease-in-out;
}

@keyframes pulseBeacon {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.25); }
}

.hud-title {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  color: #bae6fd;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

.hud-status-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(12, 19, 35, 0.82);
  border: 1px solid rgba(125, 211, 252, 0.35);
  padding: 6px 14px;
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  transition: all 0.4s ease;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
}

.hud-status-badge.status-ready {
  background: rgba(168, 85, 247, 0.22);
  border-color: rgba(192, 132, 252, 0.65);
  box-shadow: 0 0 22px rgba(168, 85, 247, 0.35);
}

.pulsing-radar {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulseBeacon 1.2s infinite ease-in-out;
}

.pulsing-radar.radar-ready {
  background: #c084fc;
  box-shadow: 0 0 12px #c084fc;
}

.status-seq-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.74rem;
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
  background: rgba(8, 14, 30, 0.82);
  padding: 6px 20px;
  border-radius: 9999px;
  border: 1px solid rgba(125, 211, 252, 0.35);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
}

.hud-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.hud-btn {
  background: rgba(12, 19, 35, 0.85);
  border: 1px solid rgba(125, 211, 252, 0.35);
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

/* サウンドアラート誘導ボタン（目立つ点滅） */
.sound-alert-btn {
  background: rgba(245, 158, 11, 0.25);
  border: 1.5px solid #fbbf24;
  color: #fef08a;
  animation: pulseSoundAlert 1.6s infinite ease-in-out;
  display: flex;
  align-items: center;
  gap: 6px;
}

@keyframes pulseSoundAlert {
  0%, 100% {
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 25px rgba(251, 191, 36, 0.85);
    transform: scale(1.04);
  }
}

.sound-btn.sound-active {
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.4);
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
  background: rgba(56, 189, 248, 0.25);
  border-color: rgba(125, 211, 252, 0.6);
  color: #ffffff;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.35);
}

.skip-btn:hover {
  background: rgba(56, 189, 248, 0.45);
  border-color: #bae6fd;
  box-shadow: 0 0 22px rgba(56, 189, 248, 0.7);
}

/* 中央「物理の世界へ入る」アクション（完成時に出現するクリスタル・ポータル） */
.center-action-area {
  position: absolute;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: auto;
}

.enter-lab-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 32px;
  background: rgba(8, 14, 30, 0.88);
  border: 1.5px solid rgba(125, 211, 252, 0.75);
  border-radius: 9999px;
  color: #ffffff;
  cursor: pointer;
  backdrop-filter: blur(14px);
  box-shadow: 0 0 35px rgba(56, 189, 248, 0.45), 0 0 20px rgba(192, 132, 252, 0.3), 0 6px 24px rgba(0, 0, 0, 0.85);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: enterCosmicPulse 3.0s infinite ease-in-out;
}

@keyframes enterCosmicPulse {
  0%, 100% {
    box-shadow: 0 0 30px rgba(56, 189, 248, 0.4), 0 0 15px rgba(192, 132, 252, 0.25), 0 4px 18px rgba(0, 0, 0, 0.8);
    border-color: rgba(125, 211, 252, 0.7);
  }
  50% {
    box-shadow: 0 0 55px rgba(56, 189, 248, 0.85), 0 0 30px rgba(192, 132, 252, 0.55), 0 0 16px rgba(251, 191, 36, 0.4), 0 6px 28px rgba(0, 0, 0, 0.95);
    border-color: #7dd3fc;
    transform: translateY(-2px);
  }
}

.enter-lab-btn:hover {
  transform: translateY(-4px) scale(1.05);
  background: rgba(14, 23, 48, 0.95);
  border-color: #bae6fd;
  box-shadow: 0 0 60px rgba(56, 189, 248, 0.95), 0 0 32px #c084fc, 0 0 20px #fbbf24;
}

.enter-icon {
  font-size: 1.35rem;
  color: #bae6fd;
  text-shadow: 0 0 10px #38bdf8, 0 0 20px #c084fc;
}

.enter-text-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.enter-main-title {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #ffffff;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.9);
}

.enter-sub-title {
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #38bdf8;
}

.enter-kbd-badge {
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 4px 10px;
  border-radius: 6px;
  margin-left: 6px;
}

.enter-btn-fade-enter-active,
.enter-btn-fade-leave-active {
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.enter-btn-fade-enter-from,
.enter-btn-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* HUD Bottom Bar */
.hud-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to top, rgba(6, 9, 17, 0.92) 0%, rgba(6, 9, 17, 0.4) 70%, transparent 100%);
  z-index: 20;
}

.hud-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
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
  animation: pulseBeacon 2.0s infinite ease-in-out;
}

.bottom-right-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bottom-replay-btn {
  background: transparent;
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.bottom-replay-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #bae6fd;
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

/* レスポンシブ対応 */
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
    font-size: 0.72rem;
  }
  .center-action-area {
    bottom: 60px;
  }
  .enter-lab-btn {
    padding: 9px 20px;
    gap: 10px;
  }
  .enter-main-title {
    font-size: 0.98rem;
  }
  .enter-kbd-badge {
    display: none;
  }
  .video-stage-container {
    padding: 40px 10px;
  }
}
</style>
