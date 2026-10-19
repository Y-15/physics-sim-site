<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  defaultUnit: {
    type: String,
    default: 'all' // 'all' | 'mechanics' | 'electromagnetism' | 'thermodynamics' | 'quantum'
  }
})

// State
const allProblems = ref([])
const loading = ref(true)
const error = ref(null)

const selectedUnit = ref(props.defaultUnit)
const selectedLevel = ref('all') // 'all', '学部教養', '学部専門', '院試基礎'
const searchQuery = ref('')
const solvedFilter = ref('all') // 'all', 'solved', 'review', 'unsolved'

// User progress in localStorage
const userStatus = ref({}) // { [id]: 'solved' | 'review' }

// Expanded states
const expandedHints = ref({})
const expandedSolutions = ref({})

const unitDefinitions = [
  { id: 'all', name: '全分野', icon: '🏛️' },
  { id: 'mechanics', name: '力学・解析力学', icon: '🏎️' },
  { id: 'electromagnetism', name: '電磁気学', icon: '⚡' },
  { id: 'thermodynamics', name: '熱・統計力学', icon: '🔥' },
  { id: 'quantum', name: '量子力学', icon: '⚛️' }
]

const units = computed(() => {
  return unitDefinitions.map(u => {
    let count = 0
    if (u.id === 'all') {
      count = allProblems.value.length
    } else {
      count = allProblems.value.filter(p => p.unitId === u.id).length
    }
    return { ...u, count }
  })
})

onMounted(async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('physics_sim_univ_problem_status')
        if (stored) {
          userStatus.value = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Could not load stored univ problem status', e)
      }
    }

    const baseUrl = import.meta.env.BASE_URL || '/'
    const dataUrl = `${baseUrl.replace(/\/$/, '')}/data/university_problems.json`
    const res = await fetch(dataUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}: 大学物理問題データの読み込みに失敗しました`)
    const data = await res.json()
    allProblems.value = data
    loading.value = false
    triggerMathJax()
  } catch (err) {
    console.error(err)
    error.value = err.message
    loading.value = false
  }
})

function saveProgress() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('physics_sim_univ_problem_status', JSON.stringify(userStatus.value))
    } catch (e) {
      console.warn('Could not save univ problem status', e)
    }
  }
}

function setStatus(id, status) {
  if (userStatus.value[id] === status) {
    delete userStatus.value[id]
  } else {
    userStatus.value[id] = status
  }
  userStatus.value = { ...userStatus.value }
  saveProgress()
}

function toggleHint(id) {
  expandedHints.value[id] = !expandedHints.value[id]
  triggerMathJax()
}

function toggleSolution(id) {
  expandedSolutions.value[id] = !expandedSolutions.value[id]
  triggerMathJax()
}

function triggerMathJax() {
  nextTick(() => {
    if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise()
    }
  })
}

const filteredProblems = computed(() => {
  return allProblems.value.filter(p => {
    // Unit
    if (selectedUnit.value !== 'all' && p.unitId !== selectedUnit.value) {
      return false
    }

    // Level
    if (selectedLevel.value !== 'all' && p.level !== selectedLevel.value) {
      return false
    }

    // Status
    const st = userStatus.value[p.id]
    if (solvedFilter.value === 'solved' && st !== 'solved') return false
    if (solvedFilter.value === 'review' && st !== 'review') return false
    if (solvedFilter.value === 'unsolved' && st) return false

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const inTitle = (p.title || '').toLowerCase().includes(q)
      const inPrompt = (p.prompt || '').toLowerCase().includes(q)
      const inCategory = (p.category || '').toLowerCase().includes(q)
      const inMath = Array.isArray(p.mathTools) && p.mathTools.some(t => t.toLowerCase().includes(q))
      if (!inTitle && !inPrompt && !inCategory && !inMath) return false
    }

    return true
  })
})

// Progress counts
const totalCount = computed(() => allProblems.value.length)
const solvedCount = computed(() => Object.values(userStatus.value).filter(v => v === 'solved').length)
const reviewCount = computed(() => Object.values(userStatus.value).filter(v => v === 'review').length)

// Format Markdown text to simple HTML with KaTeX math spans preserved
function formatText(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return html
}
</script>

<template>
  <div class="univ-problem-viewer">
    <!-- Header Banner -->
    <div class="univ-badge-banner">
      <div class="banner-icon">🎓</div>
      <div class="banner-text">
        <h3>大学物理 専門演習問題アーカイブ</h3>
        <p>理工系学部（1〜3年次）・大学院入試（院試）対応。微分方程式・多重積分・ベクトル解析・エルミート演算子による厳密な完全導出と解法体系。</p>
      </div>
    </div>

    <!-- Progress summary -->
    <div class="univ-progress-bar-card">
      <div class="progress-stats">
        <span>📚 登録問題数: <strong>{{ totalCount }}問</strong></span>
        <span>✅ 解答済み: <strong class="text-success">{{ solvedCount }}問</strong></span>
        <span>⭐ 要復習: <strong class="text-warning">{{ reviewCount }}問</strong></span>
        <span>📊 達成率: <strong>{{ totalCount ? Math.round((solvedCount / totalCount) * 100) : 0 }}%</strong></span>
      </div>
    </div>

    <!-- Control Filters -->
    <div class="univ-controls-card">
      <!-- Unit Selection Tabs -->
      <div class="unit-tabs">
        <button
          v-for="u in units"
          :key="u.id"
          class="unit-tab-btn"
          :class="{ active: selectedUnit === u.id }"
          @click="selectedUnit = u.id"
        >
          <span class="unit-icon">{{ u.icon }}</span>
          <span class="unit-name">{{ u.name }}</span>
          <span class="unit-count-badge">{{ u.count }}</span>
        </button>
      </div>

      <!-- Filters row -->
      <div class="filter-row">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 キーワード検索 (例: 減衰振動, マクスウェル, 分配関数, 井戸型...)"
            class="search-input"
          />
        </div>

        <div class="select-group">
          <select v-model="selectedLevel" class="custom-select">
            <option value="all">全難易度レベル</option>
            <option value="学部教養">学部教養（1年次）</option>
            <option value="学部専門">学部専門（2年次）</option>
            <option value="院試基礎">院試基礎・専門（3年次）</option>
          </select>

          <select v-model="solvedFilter" class="custom-select">
            <option value="all">すべての学習状態</option>
            <option value="solved">✅ 解答済みのみ</option>
            <option value="review">⭐ 要復習のみ</option>
            <option value="unsolved">⬜ 未完了のみ</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>大学物理 演習問題データベースを読み込み中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
    </div>

    <div v-else-if="filteredProblems.length === 0" class="empty-state">
      <p>🔍 条件に一致する問題が見つかりませんでした。検索条件を変更してください。</p>
    </div>

    <!-- Problem List -->
    <div v-else class="problem-list">
      <div
        v-for="(p, index) in filteredProblems"
        :key="p.id"
        class="problem-card"
        :class="{
          'status-solved': userStatus[p.id] === 'solved',
          'status-review': userStatus[p.id] === 'review'
        }"
      >
        <!-- Card Header -->
        <div class="problem-card-header">
          <div class="header-tags">
            <span class="badge-category">{{ p.category }}</span>
            <span class="badge-level" :class="'level-' + p.level">{{ p.levelLabel || p.level }}</span>
            <span class="problem-id">ID: {{ p.id }}</span>
          </div>

          <div class="user-actions">
            <button
              class="status-btn"
              :class="{ active: userStatus[p.id] === 'solved' }"
              title="解いた問題として記録"
              @click="setStatus(p.id, 'solved')"
            >
              ✅ 解いた
            </button>
            <button
              class="status-btn"
              :class="{ active: userStatus[p.id] === 'review' }"
              title="後で見直す要復習問題として記録"
              @click="setStatus(p.id, 'review')"
            >
              ⭐ 要復習
            </button>
          </div>
        </div>

        <!-- Problem Title -->
        <h3 class="problem-title">
          <span class="num">Q{{ index + 1 }}.</span> {{ p.title }}
        </h3>

        <!-- Mathematical Tools Needed -->
        <div v-if="p.mathTools && p.mathTools.length" class="math-tools-row">
          <span class="math-tools-label">🛠️ 必要数学ツール:</span>
          <span v-for="t in p.mathTools" :key="t" class="math-tag">{{ t }}</span>
        </div>

        <!-- Prompt Text -->
        <div class="problem-prompt">
          <div v-html="formatText(p.prompt)"></div>
        </div>

        <!-- Accordions -->
        <div class="accordion-group">
          <!-- Hint Accordion -->
          <div class="accordion-item">
            <button class="accordion-toggle hint-btn" @click="toggleHint(p.id)">
              <span>💡 考え方のヒント・数学的指針</span>
              <span class="arrow">{{ expandedHints[p.id] ? '▲' : '▼' }}</span>
            </button>
            <div v-if="expandedHints[p.id]" class="accordion-body hint-body">
              <div v-html="formatText(p.hint)"></div>
            </div>
          </div>

          <!-- Answer & Solution Accordion -->
          <div class="accordion-item">
            <button class="accordion-toggle solution-btn" @click="toggleSolution(p.id)">
              <span>📖 完全解答・詳細導出プロセス</span>
              <span class="arrow">{{ expandedSolutions[p.id] ? '▲ 閉じる' : '▼ 解説を見る' }}</span>
            </button>
            <div v-if="expandedSolutions[p.id]" class="accordion-body solution-body">
              <div class="answer-box">
                <h4>🎯 結論・要約解答</h4>
                <div v-html="formatText(p.answer)"></div>
              </div>
              <div class="full-explanation">
                <div v-html="formatText(p.explanation)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Future Extension Notice -->
    <div class="future-expansion-banner">
      <h4>🚀 大学物理 演習問題は継続的に拡充中！</h4>
      <p>
        本アーカイブでは、大学物理の各科目（解析力学、電磁気学・マクスウェル方程式、熱力学・統計力学、量子力学、特殊相対論）の厳選問題を順次追加しています。
        学部定期試験の過去問演習から、旧帝大・東工大等の大学院理学・工学研究科の院試対策まで幅広くご活用いただけます。
      </p>
    </div>
  </div>
</template>

<style scoped>
.univ-problem-viewer {
  margin: 1.5rem 0 3rem;
  font-family: inherit;
}

.univ-badge-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(129, 140, 248, 0.16));
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 12px;
  padding: 18px 22px;
  margin-bottom: 1.25rem;
}

.banner-icon {
  font-size: 2.4rem;
  line-height: 1;
}

.banner-text h3 {
  margin: 0 0 6px 0;
  font-size: 1.2rem;
  color: var(--vp-c-brand-1, #38bdf8);
  font-weight: 700;
}

.banner-text p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.univ-progress-bar-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  padding: 12px 18px;
  margin-bottom: 1.25rem;
}

.progress-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 0.92rem;
}

.text-success {
  color: #10b981;
}

.text-warning {
  color: #f59e0b;
}

.univ-controls-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 1.5rem;
}

.unit-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.unit-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.unit-tab-btn:hover {
  border-color: var(--vp-c-brand-1);
}

.unit-tab-btn.active {
  background: var(--vp-c-brand-1, #38bdf8);
  color: #fff;
  border-color: var(--vp-c-brand-1, #38bdf8);
  font-weight: 600;
}

.unit-count-badge {
  background: rgba(0, 0, 0, 0.15);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.78rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.search-box {
  flex: 1 1 280px;
}

.search-input {
  width: 100%;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.select-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.custom-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
}

.problem-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.problem-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 20px 22px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.problem-card:hover {
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.problem-card.status-solved {
  border-left: 5px solid #10b981;
}

.problem-card.status-review {
  border-left: 5px solid #f59e0b;
}

.problem-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-category {
  background: rgba(56, 189, 248, 0.15);
  color: var(--vp-c-brand-1, #38bdf8);
  font-weight: 600;
  font-size: 0.78rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge-level {
  font-size: 0.78rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.problem-id {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

.user-actions {
  display: flex;
  gap: 6px;
}

.status-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn:hover {
  background: var(--vp-c-bg-mute);
}

.status-btn.active {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}

.status-btn:last-child.active {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}

.problem-title {
  margin: 0 0 10px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.problem-title .num {
  color: var(--vp-c-brand-1, #38bdf8);
  margin-right: 4px;
}

.math-tools-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.math-tools-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.math-tag {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  font-size: 0.75rem;
  padding: 2px 7px;
  border-radius: 4px;
  color: var(--vp-c-text-1);
}

.problem-prompt {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 16px;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 14px;
}

.accordion-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accordion-item {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.accordion-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: background 0.2s ease;
}

.accordion-toggle:hover {
  background: var(--vp-c-bg-soft);
}

.hint-btn {
  color: #d97706;
}

.solution-btn {
  color: var(--vp-c-brand-1, #38bdf8);
}

.accordion-body {
  padding: 16px;
  border-top: 1px solid var(--vp-c-border);
  font-size: 0.92rem;
  line-height: 1.75;
}

.hint-body {
  background: rgba(245, 158, 11, 0.05);
}

.answer-box {
  background: rgba(16, 185, 129, 0.08);
  border-left: 4px solid #10b981;
  padding: 12px 14px;
  border-radius: 4px;
  margin-bottom: 14px;
}

.answer-box h4 {
  margin: 0 0 6px 0;
  font-size: 0.95rem;
  color: #10b981;
}

.full-explanation {
  background: var(--vp-c-bg);
  padding-top: 8px;
}

.future-expansion-banner {
  margin-top: 2.5rem;
  padding: 18px 22px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-brand-1, #38bdf8);
}

.future-expansion-banner h4 {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  color: var(--vp-c-brand-1, #38bdf8);
}

.future-expansion-banner p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(56, 189, 248, 0.2);
  border-top-color: var(--vp-c-brand-1, #38bdf8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
