<template>
  <section class="references-box" aria-labelledby="references-heading">
    <div class="ref-header">
      <span class="ref-icon" aria-hidden="true">📚</span>
      <h2 id="references-heading" class="ref-title">参考文献・準拠資料</h2>
    </div>
    <p class="ref-lead">
      本ページの解説・公式導出・インタラクティブシミュレーションおよび演習問題は、以下の公的指導要領および標準的な高等学校理科（物理）の教育課程に準拠して独自に執筆・開発したものです。
    </p>
    <ul class="ref-list">
      <li>
        文部科学省『高等学校学習指導要領（平成30年告示）解説 理科編・理数編』（実教出版、2019年）
      </li>
      <li>
        文部科学省検定済教科書 高等学校理科『物理基礎』『物理』（数研出版、啓林館、東京書籍、第一学習社 ほか各社）
      </li>
      <li>
        独立行政法人 大学入試センター『大学入学共通テスト 出題教科・科目の出題方法等』物理分野出題方針
      </li>
      <li>
        国立教育政策研究所 教育課程研究センター『「指導と評価の一体化」のための学習評価に関する参考資料 高等学校 理科』
      </li>
    </ul>
    <p class="ref-note">
      ※ 本サイトの文章・数式・図解・演習問題はすべてオリジナル構成であり、特定の出版物・入試問題の原文を直接引用・転載したものではありません。記号の表記や正の向きの約束事は、学校で使用している教科書・問題集に合わせて適宜読み替えてご活用ください。
    </p>
  </section>
</template>

<style>
.references-box {
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.4rem;
  background: var(--academic-card-bg, var(--vp-c-bg-soft, #f8fafc));
  border: 1px solid var(--academic-card-border, var(--vp-c-divider, #cbd5e1));
  border-left: 4px solid var(--academic-accent, var(--vp-c-brand-1, #0284c7));
  border-radius: 10px;
}

.references-box .ref-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.references-box .ref-icon {
  font-size: 1.15rem;
  line-height: 1;
  flex-shrink: 0;
}

.VPDoc .references-box h2.ref-title,
.references-box .ref-title {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  font-size: 1.05rem !important;
  line-height: 1.4 !important;
  font-weight: 700 !important;
  display: block !important;
  color: var(--vp-c-text-1);
}

.references-box .ref-lead {
  margin: 0 0 0.75rem 0;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.references-box .ref-list {
  margin: 0 0 0.85rem 0;
  padding-left: 1.35rem;
  font-size: 0.86rem;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.references-box .ref-list li {
  margin-bottom: 0.3rem;
}

.references-box .ref-note {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--vp-c-text-3, var(--academic-text-mute));
}
</style>

