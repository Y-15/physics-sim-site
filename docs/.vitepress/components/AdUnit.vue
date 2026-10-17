<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { inBrowser } from 'vitepress'

const props = withDefaults(
  defineProps<{
    client?: string
    slotId?: string
    format?: string
    responsive?: boolean
    minHeight?: number
    label?: string
  }>(),
  {
    client: 'ca-pub-XXXXXXXXXXXXXXXX',
    slotId: '',
    format: 'auto',
    responsive: true,
    minHeight: 140,
    label: 'スポンサーリンク'
  }
)

const isDev = import.meta.env.DEV
const adRef = ref<HTMLElement | null>(null)
const isLoaded = ref(false)

const initAd = () => {
  if (!inBrowser || isDev) return

  nextTick(() => {
    try {
      if (typeof window !== 'undefined') {
        const insElement = adRef.value?.querySelector('ins.adsbygoogle')
        // すでにAdSenseによって処理されているかチェック（二重push防止）
        if (insElement && !insElement.getAttribute('data-adsbygoogle-status')) {
          // @ts-ignore
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          isLoaded.value = true
        }
      }
    } catch (e) {
      console.warn('[AdSense] Ad push error:', e)
    }
  })
}

onMounted(() => {
  initAd()
})
</script>

<template>
  <div class="ad-unit-container no-ads" ref="adRef">
    <div class="ad-unit-label">{{ label }}</div>
    
    <!-- 開発環境用プレースホルダー -->
    <div v-if="isDev" class="ad-unit-dev-box" :style="{ minHeight: `${minHeight}px` }">
      <div class="ad-unit-dev-content">
        <span class="ad-unit-dev-badge">AdSense Preview</span>
        <p class="ad-unit-dev-text">
          広告表示エリア (Client: {{ client }} / Slot: {{ slotId || 'Responsive' }})
        </p>
        <span class="ad-unit-dev-hint">本番ビルド時に実際の広告が配信されます</span>
      </div>
    </div>

    <!-- 本番環境用 AdSense ユニット -->
    <div v-else class="ad-unit-prod-box" :style="{ minHeight: `${minHeight}px` }">
      <ins
        class="adsbygoogle"
        style="display: block;"
        :data-ad-client="client"
        :data-ad-slot="slotId || undefined"
        :data-ad-format="format"
        :data-full-width-responsive="responsive ? 'true' : 'false'"
      ></ins>
    </div>
  </div>
</template>

<style scoped>
.ad-unit-container {
  margin: 2.5rem 0 1.5rem;
  padding: 0;
  text-align: center;
  clear: both;
}

.ad-unit-label {
  font-size: 0.72rem;
  color: var(--vp-c-text-3, #94a3b8);
  margin-bottom: 0.35rem;
  letter-spacing: 0.05em;
  text-align: center;
}

.ad-unit-dev-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft, #f8fafc);
  border: 1px dashed var(--vp-c-divider, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
}

.dark .ad-unit-dev-box {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.ad-unit-dev-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.ad-unit-dev-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(56, 189, 248, 0.15);
  color: var(--vp-c-brand-1, #0284c7);
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.ad-unit-dev-text {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-2, #64748b);
}

.ad-unit-dev-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3, #94a3b8);
}

.ad-unit-prod-box {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}
</style>
