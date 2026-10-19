---
title: 大学物理 演習問題集（学部専門・大学院入試・完全解答）
description: 大学物理の全分野（力学・解析力学、電磁気学、熱力学・統計力学、量子力学）を網羅した専門演習問題集。常微分方程式、多重積分、ベクトル解析、演算子法を用いた完全導出と詳細解説。
---

# 📝 大学物理 演習問題集（学部試験・院試対策）

高校物理の演習問題集（全197問）とは**完全に独立した、大学物理専用の演習問題アーカイブ**です。

理工系学部の定期試験対策から、東京大学・京都大学・東京工業大学（東京科学大）・東北大学など難関大学院の入試（院試）対策まで、**「微積分・微分方程式・多重積分・ベクトル解析・演算子法」** を駆使して自力で導出・計算する真の物理的思考力を養います。

> [!NOTE]
> 🏫 **高校物理の演習問題をお探しの方へ**  
> 共通テストや高校範囲・大学入試二次試験の演習問題は、[高校物理 演習問題集（全197問）](/problems/index) をご利用ください。高校物理と大学物理は学習目的および数学的基盤が異なるため、完全に分離して提供しています。

---

## 🎯 大学物理 インタラクティブ問題バンク（検索・学習進捗管理）

下記のインタラクティブ問題バンクでは、キーワード検索、分野別・難易度別フィルター、解答済み・要復習チェック機能をご利用いただけます。

<ClientOnly>
  <UniversityProblemViewer defaultUnit="all" />
</ClientOnly>

---

## 📚 分野別 大学物理 演習問題集

分野ごとの特化ページでじっくり問題演習を行うこともできます：

<div class="univ-problems-grid">

<div class="univ-prob-card">
  <h3>🏎️ <a href="/university/problems/mechanics">力学・解析力学 演習問題</a></h3>
  <p class="meta">減衰振動、強制振動、中心力場と軌道方程式、慣性モーメント多重積分、オイラー＝ラグランジュ方程式、ハミルトン形式</p>
  <a class="card-btn" href="/university/problems/mechanics">力学の問題を解く →</a>
</div>

<div class="univ-prob-card">
  <h3>⚡ <a href="/university/problems/electromagnetism">電磁気学 演習問題</a></h3>
  <p class="meta">ガウスの法則微分形、球対称・円柱対称電場、ポアソン・ラプラス方程式、ビオ・サバール積分、電磁波の波動方程式導出、ポインティングベクトル</p>
  <a class="card-btn" href="/university/problems/electromagnetism">電磁気の問題を解く →</a>
</div>

<div class="univ-prob-card">
  <h3>🔥 <a href="/university/problems/thermodynamics">熱力学・統計力学 演習問題</a></h3>
  <p class="meta">ルジャンドル変換、4大マクスウェル関係式、実在気体の内部エネルギー、カノニカル分配関数の多重積分、理想気体の状態方程式導出、ショットキー比熱</p>
  <a class="card-btn" href="/university/problems/thermodynamics">熱・統計力学の問題を解く →</a>
</div>

<div class="univ-prob-card">
  <h3>⚛️ <a href="/university/problems/quantum">量子力学 演習問題</a></h3>
  <p class="meta">シュレーディンガー方程式、1次元無限井戸の固有値と規格化、不確定性関係の厳密証明、昇降演算子法による調和振動子、ポテンシャル障壁とトンネル効果</p>
  <a class="card-btn" href="/university/problems/quantum">量子力学の問題を解く →</a>
</div>

</div>

---

## 🚀 今後の問題追加ロードマップ

当サイトの大学物理演習問題バンクは、今後さらに以下の発展的テーマ・院試典型題を拡充していきます：

1. **力学・解析力学**:
   - 二重振り子・連成振動子の固有振動モード解析と永年方程式
   - リジッドボディ（コマ）のオイラー角と歳差運動方程式
   - 正準変換とポアソン括弧式、ハミルトン＝ヤコビ方程式
2. **電磁気学**:
   - 導体表面の境界値問題と鏡像法（平面・球面導体）
   - 遅延ポテンシャル（リエナール＝ヴィーヒェルト・ポテンシャル）と制動放射
   - 導波管内の電磁波モード（TEモード・TMモード）と遮断周波数
3. **熱・統計力学**:
   - グランドカノニカル分布と化学ポテンシャル、大分配関数 $\Xi$
   - フェルミ＝ディラック統計とゾンマーフェルト展開（電子比熱）
   - ボース＝アインシュタイン凝縮（BEC）とプランクの放射公式導出
   - 1次元イジング模型と転送行列法
4. **量子力学**:
   - 中心力場と水素原子のシュレーディンガー方程式（球面調和関数・動径波動関数）
   - スピン角運動量とパウリ行列、クレブシュ＝ゴルダン係数
   - 時間を含まない微擾論（摂動論）とゼーマン効果・シュタルク効果
   - 変分法とヘリウム原子基底エネルギーの近似計算

<style scoped>
.univ-problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0 2rem;
}

.univ-prob-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
}

.univ-prob-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.15rem;
}

.univ-prob-card .meta {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 16px 0;
  flex: 1;
}

.card-btn {
  display: inline-block;
  padding: 8px 14px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
}

.card-btn:hover {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
</style>
