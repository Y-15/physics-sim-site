<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  defaultUnit: {
    type: String,
    default: 'all' // 'all' | 'mechanics' | 'waves' | 'electromagnetism' | 'thermodynamics' | 'atomic'
  }
})

// State
const allProblems = ref([])
const loading = ref(true)
const error = ref(null)

const selectedUnit = ref(props.defaultUnit)
const selectedLevel = ref('all') // 'all', 'basic' (1-3), 'standard' (4-6), 'advanced' (7-9)
const selectedCategory = ref('all')
const searchQuery = ref('')
const solvedFilter = ref('all') // 'all', 'solved', 'review', 'unsolved'

// Pagination
const currentPage = ref(1)
const pageSize = ref(15)

// User progress in localStorage
const userStatus = ref({}) // { [id]: 'solved' | 'review' }

// Expanded states for accordions
const expandedHints = ref({}) // { [id]: boolean }
const expandedSolutions = ref({}) // { [id]: boolean }

const unitDefinitions = [
  { id: 'all', name: '全分野', icon: '📚' },
  { id: 'mechanics', name: '力学', icon: '🏎️' },
  { id: 'waves', name: '波動', icon: '🌊' },
  { id: 'electromagnetism', name: '電磁気', icon: '⚡' },
  { id: 'thermodynamics', name: '熱力学', icon: '🔥' },
  { id: 'atomic', name: '原子物理', icon: '⚛️' }
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

// Load data
onMounted(async () => {
  try {
    // Load stored progress
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('physics_sim_problem_status')
        if (stored) {
          userStatus.value = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Could not load stored problem status', e)
      }
    }

    // Fetch JSON database
    const baseUrl = import.meta.env.BASE_URL || '/'
    const dataUrl = `${baseUrl.replace(/\/$/, '')}/data/problems.json`
    const res = await fetch(dataUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}: 問題データの読み込みに失敗しました`)
    const data = await res.json()
    allProblems.value = data
    loading.value = false
  } catch (err) {
    console.error(err)
    error.value = err.message
    loading.value = false
  }
})

function saveProgress() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('physics_sim_problem_status', JSON.stringify(userStatus.value))
    } catch (e) {
      console.warn('Could not save problem status', e)
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

// Categories list for selected unit
const availableCategories = computed(() => {
  const set = new Set()
  allProblems.value.forEach(p => {
    if (selectedUnit.value === 'all' || p.unitId === selectedUnit.value) {
      if (p.category) set.add(p.category)
    }
  })
  return Array.from(set).sort()
})

// Filtered list
const filteredProblems = computed(() => {
  return allProblems.value.filter(p => {
    // Unit filter
    if (selectedUnit.value !== 'all' && p.unitId !== selectedUnit.value) return false

    // Level filter
    if (selectedLevel.value === 'basic' && (p.level > 3)) return false
    if (selectedLevel.value === 'standard' && (p.level < 4 || p.level > 6)) return false
    if (selectedLevel.value === 'advanced' && (p.level < 7)) return false

    // Category filter
    if (selectedCategory.value !== 'all' && p.category !== selectedCategory.value) return false

    // User status filter
    const status = userStatus.value[p.id]
    if (solvedFilter.value === 'solved' && status !== 'solved') return false
    if (solvedFilter.value === 'review' && status !== 'review') return false
    if (solvedFilter.value === 'unsolved' && status) return false

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const inTitle = p.title?.toLowerCase().includes(q)
      const inPrompt = p.prompt?.toLowerCase().includes(q)
      const inCategory = p.category?.toLowerCase().includes(q)
      const inAnswer = p.answer?.toLowerCase().includes(q)
      if (!inTitle && !inPrompt && !inCategory && !inAnswer) return false
    }

    return true
  })
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredProblems.value.length / pageSize.value) || 1
})

const paginatedProblems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredProblems.value.slice(start, start + pageSize.value)
})

// Progress Stats
const progressStats = computed(() => {
  const total = allProblems.value.length
  let solved = 0
  let review = 0
  for (const id in userStatus.value) {
    if (userStatus.value[id] === 'solved') solved++
    else if (userStatus.value[id] === 'review') review++
  }
  return {
    total,
    solved,
    review,
    percent: total > 0 ? Math.round((solved / total) * 100) : 0
  }
})

// Accordion toggles
function toggleHint(id) {
  expandedHints.value[id] = !expandedHints.value[id]
}

function toggleSolution(id) {
  expandedSolutions.value[id] = !expandedSolutions.value[id]
}

function randomChallenge() {
  if (filteredProblems.value.length === 0) return
  const randIdx = Math.floor(Math.random() * filteredProblems.value.length)
  const target = filteredProblems.value[randIdx]
  
  // Find page index of target
  const idxInFiltered = randIdx
  currentPage.value = Math.floor(idxInFiltered / pageSize.value) + 1

  nextTick(() => {
    const el = document.getElementById(`prob-${target.id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('highlight-prob')
      setTimeout(() => el.classList.remove('highlight-prob'), 2000)
    }
  })
}

// Reset page on filter changes
watch([selectedUnit, selectedLevel, selectedCategory, searchQuery, solvedFilter, pageSize], () => {
  currentPage.value = 1
})

function triggerMathJax() {
  // KaTeX renders synchronously in template, kept for backward compatibility
}

import katex from 'katex'

function renderLatexToHtml(latex, displayMode = false) {
  if (!latex) return ''
  const cleaned = latex.trim().replace(/\\\\([a-zA-Z]+)/g, '\\$1').replace(/\\+$/, '')
  try {
    return katex.renderToString(cleaned, {
      displayMode,
      throwOnError: false,
      strict: false
    })
  } catch (e) {
    return `<code>${escapeHtml(latex)}</code>`
  }
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatMathText(text) {
  if (!text) return ''
  let str = text

  // 1. Parse display math $$...$$
  str = str.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    return `<div class="katex-display-wrapper">${renderLatexToHtml(math, true)}</div>`
  })

  // 3. Parse inline math $...$
  str = str.replace(/\$([^\$\n\r]+?)\$/g, (_, math) => {
    return renderLatexToHtml(math, false)
  })

  // 4. Convert remaining line breaks to <br>
  str = str.replace(/\n/g, '<br>')
  return str
}
</script>

<template>
  <div class="problem-bank-app">
    <!-- Header Progress Bar -->
    <div class="progress-bar-banner">
      <div class="progress-meta">
        <span class="meta-title">🎯 厳選{{ allProblems.length }}問 演習進捗状況</span>
        <span class="meta-counts">
          正解: <strong>{{ progressStats.solved }}</strong> / {{ progressStats.total }} 問
          <span v-if="progressStats.review > 0" class="review-count">（要復習: {{ progressStats.review }}問）</span>
          <span class="percent-tag">{{ progressStats.percent }}% 達成</span>
        </span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressStats.percent + '%' }"></div>
      </div>
    </div>

    <!-- Domain Tabs -->
    <div class="unit-tabs-container">
      <button
        v-for="u in units"
        :key="u.id"
        class="unit-tab-btn"
        :class="{ active: selectedUnit === u.id }"
        @click="selectedUnit = u.id; selectedCategory = 'all'"
      >
        <span class="tab-icon">{{ u.icon }}</span>
        <span class="tab-name">{{ u.name }}</span>
        <span class="tab-badge">{{ u.count }}</span>
      </button>
    </div>

    <!-- Control Toolbar (Search, Filter, Actions) -->
    <div class="controls-toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="キーワード・公式・現象名で検索（例: ドップラー, 反発係数, コンデンサー）"
          aria-label="問題検索"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
      </div>

      <div class="filter-dropdowns">
        <!-- Difficulty Level -->
        <select v-model="selectedLevel" aria-label="難易度フィルター">
          <option value="all">全レベル (Level 1〜9)</option>
          <option value="basic">⭐ 基礎 (Level 1〜3)</option>
          <option value="standard">⭐⭐ 標準・共通テスト (Level 4〜6)</option>
          <option value="advanced">⭐⭐⭐ 難関大二次 (Level 7〜9)</option>
        </select>

        <!-- Category -->
        <select v-model="selectedCategory" aria-label="単元カテゴリー">
          <option value="all">全単元テーマ</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <!-- Status Filter -->
        <select v-model="solvedFilter" aria-label="学習状況フィルター">
          <option value="all">すべての問題</option>
          <option value="unsolved">未挑戦のみ</option>
          <option value="solved">✅ 正解済みのみ</option>
          <option value="review">⚠️ 要復習のみ</option>
        </select>

        <!-- Random Button -->
        <button class="random-btn" @click="randomChallenge" title="ランダムに1問選んで出題">
          🎲 ランダム出題
        </button>
      </div>
    </div>

    <!-- Active Filter Info -->
    <div class="filter-results-info">
      <span>該当問題: <strong>{{ filteredProblems.length }}</strong> 問</span>
      <span class="pagination-jump">
        表示件数:
        <select v-model="pageSize" class="page-size-select">
          <option :value="10">10問</option>
          <option :value="15">15問</option>
          <option :value="25">25問</option>
          <option :value="50">50問</option>
        </select>
      </span>
    </div>

    <!-- Loading / Error states -->
    <div v-if="loading" class="state-card loading">
      <div class="spinner"></div>
      <p>演習問題データベース（全1,000問）を読み込み中...</p>
    </div>

    <div v-else-if="error" class="state-card error">
      <p>⚠️ エラーが発生しました: {{ error }}</p>
    </div>

    <div v-else-if="filteredProblems.length === 0" class="state-card empty">
      <p>条件に一致する問題が見つかりませんでした。</p>
      <button class="reset-btn" @click="selectedLevel='all'; selectedCategory='all'; searchQuery=''; solvedFilter='all'">
        フィルターをリセット
      </button>
    </div>

    <!-- Problems List -->
    <div v-else class="problems-flow">
      <div
        v-for="(p, idx) in paginatedProblems"
        :key="p.id"
        :id="`prob-${p.id}`"
        class="problem-item-card"
        :class="{
          'is-solved': userStatus[p.id] === 'solved',
          'is-review': userStatus[p.id] === 'review'
        }"
      >
        <div class="prob-header">
          <div class="header-left">
            <span class="prob-num">No. {{ (currentPage - 1) * pageSize + idx + 1 }}</span>
            <span v-if="p.category" class="category-badge">{{ p.category }}</span>
            <span class="level-badge" :class="`lvl-${p.level <= 3 ? 'low' : p.level <= 6 ? 'mid' : 'high'}`">
              Level {{ p.level }} / 9
            </span>
          </div>

          <div class="header-actions">
            <button
              class="status-btn solved"
              :class="{ active: userStatus[p.id] === 'solved' }"
              @click="setStatus(p.id, 'solved')"
              title="解けた！"
            >
              ✓ 解けた
            </button>
            <button
              class="status-btn review"
              :class="{ active: userStatus[p.id] === 'review' }"
              @click="setStatus(p.id, 'review')"
              title="後で復習する"
            >
              ⚠️ 要復習
            </button>
          </div>
        </div>

        <h3 class="prob-title">{{ p.title }}</h3>

        <div class="prob-prompt" v-html="formatMathText(p.prompt)"></div>

        <!-- Controls: Hint & Solution Toggles -->
        <div class="prob-toggles">
          <button
            v-if="p.hint"
            class="toggle-btn hint-toggle"
            :class="{ open: expandedHints[p.id] }"
            @click="toggleHint(p.id)"
          >
            <span>💡 考え方のヒント</span>
            <span class="arrow">{{ expandedHints[p.id] ? '▲' : '▼' }}</span>
          </button>

          <button
            class="toggle-btn solution-toggle"
            :class="{ open: expandedSolutions[p.id] }"
            @click="toggleSolution(p.id)"
          >
            <span>✅ 解答と詳しい解説</span>
            <span class="arrow">{{ expandedSolutions[p.id] ? '▲' : '▼' }}</span>
          </button>
        </div>

        <!-- Hint Section -->
        <div v-if="expandedHints[p.id] && p.hint" class="accordion-content hint-content">
          <div class="content-label">💡 ヒント</div>
          <div class="hint-text" v-html="formatMathText(p.hint)"></div>
        </div>

        <!-- Solution Section -->
        <div v-if="expandedSolutions[p.id]" class="accordion-content solution-content">
          <div class="answer-box">
            <strong>【正解】</strong> <span v-html="formatMathText(p.answer)"></span>
          </div>

          <div class="explanation-box">
            <div class="content-label">【詳しい解説と立式プロセス】</div>
            <div class="explanation-text" v-html="formatMathText(p.explanation)"></div>
          </div>

          <!-- Formula Cards -->
          <div v-if="p.solutionFormulas && p.solutionFormulas.length" class="formulas-section">
            <div
              v-for="(f, fIdx) in p.solutionFormulas"
              :key="fIdx"
              class="formula-snippet-box"
            >
              <div class="formula-name">📐 <span v-html="formatMathText(f.title)"></span></div>
              <div class="formula-latex" v-html="renderLatexToHtml(f.latex || f.expression, true)"></div>
              <div v-if="f.note" class="formula-note" v-html="formatMathText(f.note)"></div>
            </div>
          </div>
        </div>

        <!-- Simulator Link -->
        <div v-if="p.simTopic" class="prob-sim-footer">
          <a :href="p.simTopic" target="_blank" class="sim-jump-btn">
            👉 <strong>動かして確認！</strong> {{ p.simTitle || '連動シミュレーター' }} を開く ↗
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Pagination -->
    <div v-if="totalPages > 1" class="pagination-footer">
      <button
        class="page-nav-btn"
        :disabled="currentPage === 1"
        @click="currentPage = Math.max(1, currentPage - 1)"
      >
        ◀ 前へ
      </button>

      <div class="page-numbers">
        <span class="page-info">ページ <strong>{{ currentPage }}</strong> / {{ totalPages }}</span>
      </div>

      <button
        class="page-nav-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
      >
        次へ ▶
      </button>
    </div>
  </div>
</template>

<style scoped>
.problem-bank-app {
  margin: 1.5rem 0 3rem;
  font-family: inherit;
}

/* Progress banner */
.progress-bar-banner {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.meta-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.meta-counts {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.meta-counts strong {
  color: #10b981;
  font-size: 16px;
}

.review-count {
  color: #f59e0b;
  margin: 0 4px;
}

.percent-tag {
  background: #10b981;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 11px;
  margin-left: 8px;
}

.progress-track {
  height: 8px;
  background: var(--vp-c-bg-mute);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
}

/* Domain Tabs */
.unit-tabs-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 18px;
  scrollbar-width: thin;
}

.unit-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.unit-tab-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.unit-tab-btn.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tab-badge {
  background: rgba(0, 0, 0, 0.12);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.unit-tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* Toolbar Controls */
.controls-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  pointer-events: none;
  opacity: 0.6;
}

.search-box input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  font-size: 14px;
  cursor: pointer;
}

.filter-dropdowns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-dropdowns select {
  flex: 1 1 180px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.random-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.random-btn:hover {
  background: #f59e0b;
  color: #fff;
}

/* Filter Results Info */
.filter-results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 16px;
  padding: 0 4px;
}

.page-size-select {
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
}

/* Problem Cards */
.problems-flow {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.problem-item-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  position: relative;
}

.problem-item-card.is-solved {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.02);
}

.problem-item-card.is-review {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.02);
}

.problem-item-card.highlight-prob {
  outline: 3px solid #3b82f6;
  animation: pulse 1s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.prob-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.prob-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.category-badge {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.level-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.level-badge.lvl-low {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.level-badge.lvl-mid {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.level-badge.lvl-high {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.status-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.status-btn.solved.active {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}

.status-btn.review.active {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}

.prob-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.prob-prompt {
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
}

.prob-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.toggle-btn.hint-toggle:hover,
.toggle-btn.hint-toggle.open {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  color: #d97706;
}

.toggle-btn.solution-toggle:hover,
.toggle-btn.solution-toggle.open {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #059669;
}

.arrow {
  font-size: 10px;
  opacity: 0.7;
}

.accordion-content {
  margin-top: 14px;
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.7;
}

.hint-content {
  background: rgba(245, 158, 11, 0.05);
  border-left: 4px solid #f59e0b;
  color: var(--vp-c-text-1);
}

.solution-content {
  background: rgba(16, 185, 129, 0.05);
  border-left: 4px solid #10b981;
  color: var(--vp-c-text-1);
}

.content-label {
  font-weight: 700;
  margin-bottom: 8px;
}

.answer-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 15px;
}

.answer-box strong {
  color: #10b981;
}

.formulas-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.formula-snippet-box {
  background: var(--vp-c-bg-mute);
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.formula-name {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
}

.formula-latex {
  font-size: 15px;
  overflow-x: auto;
  padding: 4px 0;
}

.formula-note {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 4px;
}

.katex-display-wrapper {
  margin: 10px 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 6px 0;
  text-align: center;
}

:deep(.katex) {
  font-size: 1.05em;
  text-rendering: auto;
}

:deep(.katex-display) {
  margin: 0.5em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.prob-sim-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--vp-c-divider);
}

.sim-jump-btn {
  display: inline-block;
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.sim-jump-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Pagination Footer */
.pagination-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}

.page-nav-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-nav-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-mute);
}

.page-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

/* State cards */
.state-card {
  text-align: center;
  padding: 40px 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reset-btn {
  margin-top: 12px;
  padding: 6px 14px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
</style>
