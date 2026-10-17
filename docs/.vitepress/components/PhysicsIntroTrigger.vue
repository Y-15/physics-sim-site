<script setup>
function triggerIntro() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('play-physics-intro'))
  }
}
</script>

<template>
  <button class="intro-trigger-btn" @click="triggerIntro" title="高校物理シミュレーションラボの公式オープニングシネマティックを再生">
    <span class="icon">🎬</span>
    <span class="label">オープニング映像を再生</span>
    <span class="badge">高精細クアンタムCG</span>
  </button>
</template>

<style scoped>
.intro-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #f8fafc;
  padding: 10px 22px;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35), 0 0 15px rgba(56, 189, 248, 0.25);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin: 10px 0;
  backdrop-filter: blur(8px);
}

.intro-trigger-btn:hover {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(56, 189, 248, 0.25) 100%);
  border-color: #38bdf8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 25px rgba(56, 189, 248, 0.5);
  color: #ffffff;
}

.icon {
  font-size: 1.15rem;
}

.label {
  letter-spacing: 0.03em;
}

.badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 2px 9px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .badge {
    display: none;
  }
}
</style>
