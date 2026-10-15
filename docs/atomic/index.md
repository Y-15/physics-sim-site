---
title: 原子物理分野インデックス
description: 光量子仮説、ボーアの水素原子模型、物質波、放射線と原子核反応など、現代物理学の基礎となる高校原子物理の重要テーマを完全網羅。
---

# ⚛️ 原子物理（Atomic & Quantum Physics）

19世紀末、ニュートン力学とマクスウェル電磁気学によって物理学は完成したかに見えました。しかし、黒体放射のスペクトル、光電効果、水素原子の発光スペクトルなど、ミクロの世界の現象を古典論で説明しようとすると、ことごとく矛盾に突き当たりました。

その矛盾を打破したのが、マックス・プランクの「エネルギー量子仮説」とアルベルト・アインシュタインの「光量子仮説」です。波と考えられていた光が粒子のように振る舞い、粒子と考えられていた電子が波のように振る舞う「波と粒子の二重性」の発見から、現代の半導体・レーザー・量子コンピュータを支える量子力学の扉が開かれました。

本ポータルでは、高校物理の指導要領に基づき、入試最頻出のテーマを直感的なシミュレーターとともに深く学べます。

---

## 📚 テーマ一覧

<div class="features-grid">

<div class="feature-card">
  <h3>💡 <a href="./photoelectric.html">光電効果と光量子仮説</a></h3>
  <p>
    光を当てると金属から電子が飛び出す現象。古典波動論の破綻と、アインシュタインの光量子仮説 <i>E</i> = <i>h</i>ν、光電方程式 eV<sub>0</sub> = <i>h</i>ν - <i>W</i> をインタラクティブ実験で検証。
  </p>
  <span class="tag">シミュレーター完備</span>
</div>

<div class="feature-card">
  <h3>🎯 <a href="../about.html">コンプトン効果と光子の運動量</a></h3>
  <p>
    X線を炭素に当てると散乱波の波長が伸びる現象。光子を運動量 <i>p</i> = \dfrac{<i>h</i>}{λ} を持つ粒子とみなし、相対論的エネルギー・運動量保存則から波長変化 Δ λ を導出。
  </p>
  <span class="tag">近日公開</span>
</div>

<div class="feature-card">
  <h3>🔬 <a href="./bohr.html">ボーアの水素原子模型と量子条件</a></h3>
  <p>
    なぜ電子は原子核に墜落しないのか？角運動量の量子化 mvr = <i>n</i>\dfrac{<i>h</i>}{2π} とド・ブロイ波の定常波条件、エネルギー準位 <i>E</i><sub><i>n</i></sub> = -\dfrac{13.6}{<i>n</i>²} eV と発光スペクトル系列の完全導出。
  </p>
  <span class="tag">シミュレーター完備</span>
</div>

<div class="feature-card">
  <h3>☢️ <a href="../about.html">放射性崩壊と核分裂・質量欠損</a></h3>
  <p>
    α 崩壊、β 崩壊、γ 崩壊と半減期の指数関数減衰 <i>N</i> = <i>N</i><sub>0</sub> (1/2)<sup><i>t</i>/<i>T</i></sup>。アインシュタインの質量エネルギー等価性 <i>E</i> = Δ <i>m</i> \cdot <i>c</i>² と結合エネルギー。
  </p>
  <span class="tag">近日公開</span>
</div>

</div>

---

## 🎓 原子物理の学習ロードマップ

```
[古典物理学の破綻]
  ├─ 黒体放射 (プランクの量子仮説 E = n h ν)
  └─ 光電効果 (アインシュタインの光量子仮説 E = h ν)
        │
        ▼
[光の粒子性]
  ├─ 光電方程式 (h ν = W + K_max = W + e V_0)
  └─ コンプトン散乱 (光子の運動量 p = h / λ)
        │
        ▼
[波と粒子の二重性]
  └─ ド・ブロイの物質波 (λ = h / p)
        │
        ▼
[原子構造の解明]
  ├─ ラザフォード散乱 (原子核の発見)
  ├─ ボーアの量子条件 (2πr = n λ)
  └─ 水素原子のエネルギー準位 (E_n = -13.6 / n² eV)
        │
        ▼
[原子核と放射線]
  ├─ 放射壊変と半減期
  └─ 質量欠損 (E = Δm c²)
```

---

## ⚠️ 学習上の注意点

原子物理は大学入試（特に国公立二次試験や共通テスト）で出題比率が急上昇しています。しかし公式の丸暗記に頼ると、少し設定をひねられただけで手が出なくなります。

「**プランク定数 $h$ がエネルギーと振動数を結ぶ架け橋であること**」や「**エネルギー保存則と運動量保存則がミクロの世界でもそのまま成立すること**」を常に意識して学習を進めてください。

<!--@include: ../parts/notice.md-->

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 1.5rem 0;
}
.feature-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 10px;
  padding: 16px;
  transition: transform 0.2s, border-color 0.2s;
}
.feature-card:hover {
  transform: translateY(-2px);
  border-color: #38bdf8;
}
.feature-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.05rem;
}
.feature-card p {
  font-size: 0.85rem;
  color: #a1a1aa;
  margin: 0 0 12px 0;
  line-height: 1.5;
}
.tag {
  background: #27272a;
  color: #38bdf8;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid #3f3f46;
}
</style>
