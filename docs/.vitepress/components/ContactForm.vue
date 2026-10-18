<template>
  <div class="contact-form-wrapper">
    <!-- 送信完了画面 -->
    <div v-if="submitted" class="success-card">
      <div class="success-icon">✨</div>
      <h3 class="success-title">お問い合わせを送信しました</h3>
      <p class="success-desc">
        ご意見・ご報告ありがとうございます。<br>
        いただいた内容は開発・運営チームが確認し、シミュレーターの改善やコンテンツの正確性向上に役立てさせていただきます。
      </p>
      <div class="success-actions">
        <button class="btn btn-secondary" @click="resetForm">別のお問い合わせを送信する</button>
        <a href="./index" class="btn btn-primary">力学シミュレーターへ戻る</a>
      </div>
    </div>

    <!-- 入力フォーム本体 -->
    <form v-else class="contact-form" @submit.prevent="handleSubmit">
      <div class="form-intro">
        <p class="intro-text">
          シミュレーターの挙動の不具合、数式・導出の誤植、解説へのご質問、新規シミュレーターのリクエストなど、お気軽にお寄せください。
        </p>
      </div>

      <!-- お問い合わせ種別 -->
      <div class="form-group">
        <label class="form-label required">お問い合わせの種類</label>
        <div class="category-pills">
          <button
            type="button"
            v-for="cat in categories"
            :key="cat.id"
            class="pill-btn"
            :class="{ active: form.category === cat.id }"
            @click="form.category = cat.id"
          >
            <span class="pill-icon">{{ cat.icon }}</span>
            <span class="pill-text">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <div class="form-row">
        <!-- お名前 -->
        <div class="form-group col">
          <label class="form-label required" for="name">お名前 / ニックネーム</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="例: 物理好き高校生 / 物理太郎"
            required
            maxlength="50"
          />
        </div>

        <!-- メールアドレス -->
        <div class="form-group col">
          <label class="form-label" for="email">
            返信用メールアドレス <span class="label-sub">（返信をご希望の場合）</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="例: user@example.com"
            maxlength="100"
          />
        </div>
      </div>

      <!-- 対象の分野・ページ -->
      <div class="form-group">
        <label class="form-label" for="subjectField">対象の分野・テーマ</label>
        <select id="subjectField" v-model="form.field" class="form-select">
          <option value="none">指定なし（サイト全体・その他）</option>
          <option value="mechanics">🏎️ 力学（アトウッドの器械、斜方投射、衝突、単振動など）</option>
          <option value="waves">🌊 波動（波の式、ドップラー効果、干渉、回折格子など）</option>
          <option value="electromagnetism">⚡ 電磁気（電磁誘導、交流、サイクロトロン、コンデンサーなど）</option>
          <option value="thermodynamics">🔥 熱力学（気体分子運動論、カルノーサイクル、P-V図など）</option>
          <option value="atomic">⚛️ 原子物理（光電効果、ボーア模型、放射線、核分裂など）</option>
          <option value="problems">📝 厳選演習問題集（全1,000問）</option>
          <option value="othello">🎲 3次元オセロ</option>
        </select>
      </div>

      <!-- 件名・要約 -->
      <div class="form-group">
        <label class="form-label required" for="subject">件名 / 概要</label>
        <input
          id="subject"
          v-model="form.subject"
          type="text"
          class="form-input"
          placeholder="例: 鉛直アトウッドの器械シミュレータの糸の挙動について"
          required
          maxlength="120"
        />
      </div>

      <!-- お問い合わせ内容 -->
      <div class="form-group">
        <label class="form-label required" for="message">お問い合わせ内容</label>
        <textarea
          id="message"
          v-model="form.message"
          class="form-textarea"
          rows="6"
          placeholder="具体的な内容や、お気づきの点をご記入ください。&#10;（例: 〇〇シミュレータでパラメータを最大にした際に〜という挙動になります、等）"
          required
          maxlength="2000"
        ></textarea>
        <div class="char-count">{{ form.message.length }} / 2000 文字</div>
      </div>

      <!-- エラー表示エリア -->
      <div v-if="errorMessage" class="error-alert">
        <span class="error-icon">⚠️</span>
        <div class="error-content">
          <p class="error-msg">{{ errorMessage }}</p>
          <p class="error-sub">
            お手数をおかけしますが、下の「メールソフトで直接送信」ボタンから直接メールアプリを開いて送信いただくことも可能です。
          </p>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary submit-btn"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>✉️ 送信する</span>
        </button>

        <!-- メーラー起動リンク（フォールバック） -->
        <a
          :href="mailtoLink"
          class="btn btn-outline mailto-btn"
          title="お使いのメールアプリ（GmailやOutlook等）を開いて送信します"
        >
          📮 メールソフトで直接送信
        </a>
      </div>

      <!-- プライバシー保護注意書き -->
      <div class="form-footer-note">
        ※ 入力された個人情報は、お問い合わせへの回答およびサイト改善の目的にのみ使用し、第三者に提供することはありません。詳細は<a href="./privacy" target="_blank">プライバシーポリシー</a>をご確認ください。
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const categories = [
  { id: 'bug', icon: '🐛', label: '不具合・バグ報告' },
  { id: 'math', icon: '📐', label: '数式・解説の誤植' },
  { id: 'question', icon: '❓', label: '内容への質問' },
  { id: 'request', icon: '💡', label: 'シミュレータ要望' },
  { id: 'other', icon: '💬', label: 'その他・ご意見' }
]

const form = reactive({
  category: 'bug',
  name: '',
  email: '',
  field: 'none',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

// 受信用エンドポイント（FormSubmit API: 静的サイト向け無料セキュアゲートウェイ）
// フォールバック付き
const ENDPOINT_EMAIL = 'kingphysics.kp@gmail.com'

// mailto リンク自動生成（クライアント側メーラー用）
const mailtoLink = computed(() => {
  const catLabel = categories.find(c => c.id === form.category)?.label || 'お問い合わせ'
  const subjectText = encodeURIComponent(`【高校物理ラボお問い合わせ】${form.subject || catLabel}`)
  const bodyText = encodeURIComponent(
    `【高校物理シミュレーションラボ お問い合わせ】\n\n` +
    `■ お名前: ${form.name || '未記入'}\n` +
    `■ 返信用メール: ${form.email || '未記入'}\n` +
    `■ 種類: ${catLabel}\n` +
    `■ 対象分野: ${form.field}\n` +
    `■ 件名: ${form.subject}\n\n` +
    `■ 内容:\n${form.message}\n`
  )
  return `mailto:${ENDPOINT_EMAIL}?subject=${subjectText}&body=${bodyText}`
})

const handleSubmit = async () => {
  if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
    errorMessage.value = '必須項目（お名前、件名、内容）をすべてご記入ください。'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      name: form.name,
      email: form.email || 'no-reply@anonymous.user',
      category: categories.find(c => c.id === form.category)?.label || form.category,
      field: form.field,
      _subject: `[高校物理ラボ] ${form.subject}`,
      message: form.message,
      _template: 'table',
      _captcha: 'false'
    }

    // 静的サイト向け安全送信API（formsubmit.co/ajax）
    const response = await fetch(`https://formsubmit.co/ajax/${ENDPOINT_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      submitted.value = true
    } else {
      // ネットワークやAPIキー制限等が発生した場合はわかりやすくフォールバックを案内
      throw new Error(`送信サーバーからの応答エラー (${response.status})`)
    }
  } catch (err) {
    console.error('Contact Form Submit Error:', err)
    errorMessage.value = '送信処理中に通信エラーが発生しました。「メールソフトで直接送信」をご利用いただくか、しばらく経ってから再度お試しください。'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.category = 'bug'
  form.name = ''
  form.email = ''
  form.field = 'none'
  form.subject = ''
  form.message = ''
  submitted.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.contact-form-wrapper {
  margin: 1.5rem 0 3rem;
  padding: 2rem;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}

.form-intro {
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.intro-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.25rem;
}

.form-row .col {
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .contact-form-wrapper {
    padding: 1.25rem;
  }
}

.form-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.label-sub {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

/* カテゴリ選択ピルボタン */
.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: rgba(56, 189, 248, 0.08);
}

.pill-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

/* フォームコントロール */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.65rem 0.9rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  text-align: right;
}

/* アラート */
.error-alert {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 1.25rem;
}

.error-msg {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #ef4444;
}

.error-sub {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

/* ボタン群 */
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
  margin-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.4rem;
  font-size: 0.92rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.btn-outline:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: rgba(56, 189, 248, 0.05);
}

.btn-secondary {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}

/* スピナー */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-footer-note {
  margin-top: 1.5rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
  text-align: center;
}

/* 送信完了カード */
.success-card {
  text-align: center;
  padding: 3rem 1.5rem;
}

.success-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.75rem;
}

.success-desc {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
