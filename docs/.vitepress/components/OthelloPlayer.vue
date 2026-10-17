<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const iframeUrl = withBase('/othello/index.html')
const isClient = ref(false)
const isLoading = ref(true)
const iframeRef = ref(null)
const wrapperRef = ref(null)
const isFullscreen = ref(false)

onMounted(() => {
  isClient.value = true
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function onIframeLoad() {
  isLoading.value = false
}

function reloadIframe() {
  isLoading.value = true
  if (iframeRef.value) {
    iframeRef.value.src = iframeUrl
  }
}

function toggleFullscreen() {
  if (!wrapperRef.value) return
  if (!document.fullscreenElement) {
    if (wrapperRef.value.requestFullscreen) {
      wrapperRef.value.requestFullscreen().catch(() => {})
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  }
}
</script>

<template>
  <div class="othello-container">
    <div class="othello-action-bar">
      <a :href="iframeUrl" target="_blank" rel="noopener noreferrer" class="fullscreen-play-btn">
        <span class="btn-icon">🚀</span>
        <span class="btn-text">全画面（別タブ）で大きくプレイする</span>
        <span class="btn-sub">※推奨：スマートフォン・タブレット・PC全画面対応</span>
      </a>
    </div>

    <div ref="wrapperRef" class="othello-frame-wrapper" :class="{ 'is-fullscreen': isFullscreen }">
      <div class="othello-frame-header">
        <div class="frame-dot red"></div>
        <div class="frame-dot yellow"></div>
        <div class="frame-dot green"></div>
        <span class="frame-title">3D Reversi Interactive Board (Three.js 3D Viewport & 2D Slices)</span>
        <div class="frame-actions">
          <button @click="reloadIframe" class="frame-btn" title="再読み込み">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            リセット
          </button>
          <button @click="toggleFullscreen" class="frame-btn frame-fs-btn" :title="isFullscreen ? '全画面解除' : 'この場で全画面化'">
            <svg v-if="!isFullscreen" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            <span>{{ isFullscreen ? '解除' : '全画面' }}</span>
          </button>
          <a :href="iframeUrl" target="_blank" rel="noopener noreferrer" class="frame-btn frame-external-link" title="新しいタブで開く">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            別タブ
          </a>
        </div>
      </div>

      <div class="iframe-container-relative">
        <div v-if="isLoading" class="othello-loading-overlay">
          <div class="loading-spinner"></div>
          <span class="loading-text">3次元オセロを起動中...</span>
        </div>
        <iframe
          v-if="isClient"
          ref="iframeRef"
          :src="iframeUrl"
          class="othello-iframe"
          allow="fullscreen; autoplay; clipboard-write"
          @load="onIframeLoad"
        ></iframe>
        <div v-else class="othello-placeholder">
          <span>3次元オセロを読み込み中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.othello-container {
  margin: 20px 0 36px;
}

.othello-action-bar {
  margin: 16px 0 20px;
  display: flex;
  justify-content: center;
}

.fullscreen-play-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%);
  color: #ffffff !important;
  font-weight: 700;
  font-size: 16px;
  border-radius: 16px;
  text-decoration: none !important;
  box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.4), 0 8px 10px -6px rgba(13, 148, 136, 0.3);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
}

.fullscreen-play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -5px rgba(13, 148, 136, 0.5), 0 10px 12px -5px rgba(13, 148, 136, 0.4);
  filter: brightness(1.08);
}

.btn-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.btn-text {
  letter-spacing: 0.02em;
}

.btn-sub {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.9;
  margin-top: 4px;
}

.othello-frame-wrapper {
  margin: 16px 0;
  border-radius: 16px;
  overflow: hidden;
  background-color: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.25);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}

.othello-frame-wrapper.is-fullscreen {
  border-radius: 0;
  border: none;
  width: 100vw;
  height: 100vh;
}

.othello-frame-wrapper.is-fullscreen .othello-iframe,
.othello-frame-wrapper.is-fullscreen .iframe-container-relative {
  height: calc(100vh - 42px) !important;
}

.othello-frame-header {
  height: 42px;
  background: #1e293b;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid #334155;
  gap: 8px;
  flex-shrink: 0;
}

.frame-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.frame-dot.red { background-color: #ef4444; }
.frame-dot.yellow { background-color: #f59e0b; }
.frame-dot.green { background-color: #10b981; }

.frame-title {
  margin-left: 6px;
  font-size: 11px;
  font-family: monospace;
  color: #94a3b8;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.frame-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.frame-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none !important;
}

.frame-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.frame-fs-btn {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
}

.frame-fs-btn:hover {
  background: rgba(56, 189, 248, 0.25);
  color: #7dd3fc;
}

.frame-external-link {
  color: #a78bfa !important;
  background: rgba(167, 139, 250, 0.12);
  border-color: rgba(167, 139, 250, 0.3);
}

.frame-external-link:hover {
  background: rgba(167, 139, 250, 0.24);
  color: #c4b5fd !important;
}

.iframe-container-relative {
  position: relative;
  width: 100%;
}

.othello-loading-overlay {
  position: absolute;
  inset: 0;
  background-color: #060b16;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 5;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}

.othello-iframe {
  width: 100%;
  height: 840px;
  border: none;
  display: block;
  background-color: #060b16;
}

.othello-placeholder {
  width: 100%;
  height: 840px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
}

@media (max-width: 768px) {
  .othello-iframe,
  .othello-placeholder {
    height: 720px;
  }
}
</style>
