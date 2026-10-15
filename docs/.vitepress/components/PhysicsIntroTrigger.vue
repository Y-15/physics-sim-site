<script setup>
function triggerIntro() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('play-physics-intro'))
  }
}
</script>

<template>
  <button class="intro-trigger-btn" @click="triggerIntro">
    <span class="icon">🎬</span>
    <span class="label">物理導入アニメーションを再生</span>
    <span class="badge">リアルタイム重力・光子シミュレーション</span>
  </button>
</template>

<style scoped>
.intro-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #f8fafc;
  padding: 10px 20px;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 15px rgba(56, 189, 248, 0.2);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin: 10px 0;
}

.intro-trigger-btn:hover {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(56, 189, 248, 0.25) 100%);
  border-color: #38bdf8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 25px rgba(56, 189, 248, 0.4);
}

.icon {
  font-size: 1.15rem;
}

.label {
  letter-spacing: 0.02em;
}

.badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

@media (max-width: 640px) {
  .badge {
    display: none;
  }
}
</style>
