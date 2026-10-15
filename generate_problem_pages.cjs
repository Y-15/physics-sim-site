const fs = require('fs');
const path = require('path');

// 抽出済み問題データを読み込み
const problems = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted_problems.json'), 'utf-8'));

// プレースホルダー（テンプレート）を除外
const validProblems = problems.filter(p => p.id !== 'unique-problem-id');

// 分野メタデータとシミュレーターリンクのマッピング
const unitMeta = {
  mechanics: {
    name: '力学（Mechanics）',
    file: 'mechanics.md',
    desc: '等加速度運動、放物運動、運動方程式、力学的エネルギー保存、運動量、円運動など、物理の土台となる力学の厳選問題集。',
    sims: [
      { topic: 'momentum', title: '💥 運動量保存・衝突シミュレーター', link: '/mechanics/momentum' },
      { topic: 'circular', title: '🔄 等速円運動シミュレーター', link: '/mechanics/circular' },
      { topic: 'uniform-acceleration', title: '🏎️ 等加速度運動 v-t グラフ', link: '/mechanics/acceleration' },
      { topic: 'projectile', title: '🚀 斜方投射・放物運動シミュレーター', link: '/mechanics/projectile' },
      { topic: 'newton', title: '⚙️ 滑車・運動の法則シミュレーター', link: '/mechanics/newton' },
      { topic: 'energy', title: '⚡ 力学的エネルギー保存シミュレーター', link: '/mechanics/energy' },
      { topic: 'friction', title: '📐 摩擦力・摩擦角シミュレーター', link: '/mechanics/friction' },
      { topic: 'gravitation', title: '🪐 万有引力・ケプラー則シミュレーター', link: '/mechanics/gravitation' }
    ]
  },
  waves: {
    name: '波動（Waves）',
    file: 'waves.md',
    desc: '波の基本式、定常波、音波、ドップラー効果、ヤングの光干渉、幾何光学（屈折・レンズ）を網羅した厳選問題集。',
    sims: [
      { topic: 'interference', title: '🌈 ヤングの二重スリット干渉シミュレーター', link: '/waves/young' },
      { topic: 'wave-basics', title: '🌊 波の式と y-x / y-t グラフ', link: '/waves/wave-equation' },
      { topic: 'standing-wave', title: '🌊 定常波・重ね合わせシミュレーター', link: '/waves/index' },
      { topic: 'doppler', title: '🚑 ドップラー効果シミュレーター', link: '/waves/index' },
      { topic: 'refraction', title: '🔍 光の屈折・全反射・レンズ結像', link: '/waves/optics' },
      { topic: 'lens', title: '🔍 凸レンズ・凹レンズ写像公式', link: '/waves/optics' }
    ]
  },
  electromagnetism: {
    name: '電磁気（Electromagnetism）',
    file: 'electromagnetism.md',
    desc: '電場・電位、コンデンサー回路、直流回路網、磁場とローレンツ力、電磁誘導、交流回路の実効値を網羅した厳選問題集。',
    sims: [
      { topic: 'circuit', title: '💡 直流回路・キルヒホッフ・負荷線シミュレーター', link: '/electromagnetism/circuit' },
      { topic: 'field', title: '⚡ クーロン力・電場・電位・電気力線', link: '/electromagnetism/field' },
      { topic: 'potential', title: '⚡ 電場と電位シミュレーター', link: '/electromagnetism/field' },
      { topic: 'capacitor', title: '🔋 コンデンサー回路・静電エネルギー', link: '/electromagnetism/capacitor' },
      { topic: 'lorentz', title: '🌀 磁場中のローレンツ力・速度セレクター', link: '/electromagnetism/lorentz' },
      { topic: 'induction', title: '🧲 電磁誘導・導線棒レール回路', link: '/electromagnetism/induction' }
    ]
  },
  thermodynamics: {
    name: '熱力学（Thermodynamics）',
    file: 'thermodynamics.md',
    desc: '熱量・比熱、気体の状態方程式、気体分子運動論、P-V図サイクルと熱力学第1法則、熱効率を網羅した厳選問題集。',
    sims: [
      { topic: 'heat', title: '🔥 気体の状態変化・P-V図シミュレーター', link: '/thermodynamics/gas-law' },
      { topic: 'first-law', title: '🔥 P-V図サイクルと第1法則熱量収支', link: '/thermodynamics/gas-law' },
      { topic: 'gas-law', title: '🔥 理想気体の状態方程式・4大状態変化', link: '/thermodynamics/gas-law' },
      { topic: 'kinetic-theory', title: '🔬 気体分子運動論・二乗平均速度', link: '/thermodynamics/kinetic-theory' }
    ]
  },
  atomic: {
    name: '原子物理（Atomic Physics）',
    file: 'atomic.md',
    desc: '光電効果、ボーアの水素原子模型、ド・ブロイ波長、原子核構造、放射性崩壊と半減期、質量欠損を網羅した厳選問題集。',
    sims: [
      { topic: 'photoelectric', title: '💡 光電効果・光量子説シミュレーター', link: '/atomic/photoelectric' },
      { topic: 'bohr', title: '🔬 ボーアの水素原子模型・量子条件・スペクトル', link: '/atomic/bohr' },
      { topic: 'matter-wave', title: '🔬 物質波とボーア量子条件', link: '/atomic/bohr' }
    ]
  }
};

// 出力ディレクトリ
const problemsDir = path.join(__dirname, 'docs', 'problems');
if (!fs.existsSync(problemsDir)) {
  fs.mkdirSync(problemsDir, { recursive: true });
}

// 分野ごとに問題をグループ化
const grouped = {
  mechanics: [],
  waves: [],
  electromagnetism: [],
  thermodynamics: [],
  atomic: []
};

for (const p of validProblems) {
  if (grouped[p.unitId]) {
    grouped[p.unitId].push(p);
  }
}

// 分野別に難易度レベル昇順でソート
for (const u of Object.keys(grouped)) {
  grouped[u].sort((a, b) => a.level - b.level);
}

// 各分野のマークダウンを生成
for (const [unitId, pList] of Object.entries(grouped)) {
  const meta = unitMeta[unitId];
  let md = `---
title: ${meta.name} 厳選演習問題集
description: 高校物理「${meta.name}」の実践問題・オリジナル解説。基礎から共通テスト・二次試験対策まで、立式プロセスと詳細な計算過程を完全掲載。
---

# 📚 ${meta.name} 厳選演習問題集

${meta.desc}

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順）

`;

  pList.forEach((p, idx) => {
    // 関連シミュレーターの探索
    let relatedSim = meta.sims.find(s => p.topicId.includes(s.topic)) || meta.sims[0];

    // レベル表記
    let levelBadge = '⭐ 基礎';
    if (p.level >= 3 && p.level <= 5) levelBadge = '⭐⭐ 標準・定期テスト';
    if (p.level >= 6 && p.level <= 7) levelBadge = '⭐⭐⭐ 共通テスト・入試標準';
    if (p.level >= 8) levelBadge = '⭐⭐⭐⭐ 入試発展・二次試験実戦';

    md += `### 第${idx + 1}問: ${p.title}\n\n`;
    md += `<div class="problem-card">\n\n`;
    md += `<div class="level-tag">${levelBadge} (Level ${p.level}/9)</div>\n\n`;
    md += `**【問題】**  \n${p.prompt}\n\n`;

    if (p.hint) {
      md += `<details class="hint-box">\n<summary>💡 考え方のヒントを見る</summary>\n\n${p.hint}\n\n</details>\n\n`;
    }

    md += `<details class="solution-box">\n<summary>✅ 解答と丁寧な解説・計算プロセス</summary>\n\n`;
    md += `**【正解】**  \n${p.answer}\n\n`;
    md += `**【詳しい解説】**  \n${p.explanation}\n\n`;

    if (p.solutionFormulas && p.solutionFormulas.length > 0) {
      md += `**【立式と計算ステップ】**\n\n`;
      p.solutionFormulas.forEach((f, fIdx) => {
        md += `**Step ${fIdx + 1}: ${f.title}**\n`;
        if (f.latex) {
          md += `$$\n${f.latex}\n$$\n`;
        } else if (f.expression) {
          md += `$$\n${f.expression}\n$$\n`;
        }
        if (f.note) {
          md += `*※ ${f.note}*\n\n`;
        }
      });
    }

    md += `</details>\n\n`;

    if (relatedSim) {
      md += `<div class="sim-link-box">\n👉 <strong>動かして納得！</strong> <a href="${relatedSim.link}.html">${relatedSim.title}</a> で現象を確認してみよう\n</div>\n\n`;
    }

    md += `</div>\n\n---\n\n`;
  });

  md += `<!--@include: ../parts/notice.md-->\n\n`;
  md += `<style scoped>
.problem-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
  margin: 1.2rem 0 2rem 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.level-tag {
  display: inline-block;
  background: #27272a;
  color: #38bdf8;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid #3f3f46;
  margin-bottom: 12px;
}
details {
  background: #202024;
  border: 1px solid #333338;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
}
summary {
  font-weight: 600;
  cursor: pointer;
  color: #e4e4e7;
  user-select: none;
}
summary:hover {
  color: #38bdf8;
}
.hint-box summary {
  color: #fbbf24;
}
.solution-box summary {
  color: #34d399;
}
.sim-link-box {
  background: rgba(56, 189, 248, 0.08);
  border: 1px dashed #0284c7;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  margin-top: 14px;
}
</style>
`;

  fs.writeFileSync(path.join(problemsDir, meta.file), md, 'utf-8');
  console.log(`生成完了: ${meta.file} (${pList.length}問)`);
}

// ポータルページ docs/problems/index.md を生成
let portalMd = `---
title: 高校物理 厳選演習問題集（全41問・全5分野完全網羅）
description: 高校物理の全5分野（力学・波動・電磁気・熱力学・原子物理）の厳選演習問題41選。基礎確認から共通テスト・国公立二次試験対策まで、全問にヒント・解説・シミュレーター連動を完備。
---

# 📝 高校物理 厳選演習問題集（全41問）

高校物理の学習において、最も重要なのは「**公式を正しく理解し、自力で立式して答えを導く力**」です。

本問題集は「高校物理解説アプリ」の膨大な学習データから厳選された **全41問のオリジナル演習問題** を完全網羅しています。基礎レベルから共通テスト・国公立二次試験レベルまで、すべての問題に **丁寧な解法手順・計算過程・立式公式**、そして **動くシミュレーターへの直通リンク** が用意されています。

---

## 📚 分野別問題集へ進む

<div class="units-grid">

<div class="unit-card">
  <h3>🏎️ <a href="./mechanics.html">力学（Mechanics）</a></h3>
  <p class="unit-meta">全 9 問 ｜ Level 1 〜 Level 7</p>
  <p>等加速度運動、放物運動、運動方程式、力学的エネルギー保存則、動摩擦力、運動量保存則、衝突とばね、鉛直面内円運動など。</p>
  <a class="enter-btn" href="./mechanics.html">力学の問題を解く →</a>
</div>

<div class="unit-card">
  <h3>🌊 <a href="./waves.html">波動（Waves）</a></h3>
  <p class="unit-meta">全 8 問 ｜ Level 1 〜 Level 8</p>
  <p>波の速さと基本式、反射音と音速、弦の定常波、ドップラー効果、スネルの屈折の法則、凸レンズの結像、ヤングの二重スリット干渉、正弦波の式と位相差など。</p>
  <a class="enter-btn" href="./waves.html">波動の問題を解く →</a>
</div>

<div class="unit-card">
  <h3>⚡ <a href="./electromagnetism.html">電磁気（Electromagnetism）</a></h3>
  <p class="unit-meta">全 8 問 ｜ Level 1 〜 Level 7</p>
  <p>電位と位置エネルギー、コンデンサーの電気量と静電エネルギー、直線電流がつくる磁場、並列回路、電場と電位の重ね合わせ、ローレンツ力、電磁誘導、交流回路の実効値など。</p>
  <a class="enter-btn" href="./electromagnetism.html">電磁気の問題を解く →</a>
</div>

<div class="unit-card">
  <h3>🔥 <a href="./thermodynamics.html">熱力学（Thermodynamics）</a></h3>
  <p class="unit-meta">全 8 問 ｜ Level 1 〜 Level 8</p>
  <p>ボイルの法則、分子の平均運動エネルギー、熱力学第一法則、水を温める熱量、熱機関の熱効率、理想気体の状態方程式、単原子分子内部エネルギー、P-V図サイクルなど。</p>
  <a class="enter-btn" href="./thermodynamics.html">熱力学の問題を解く →</a>
</div>

<div class="unit-card">
  <h3>⚛️ <a href="./atomic.html">原子物理（Atomic Physics）</a></h3>
  <p class="unit-meta">全 8 問 ｜ Level 1 〜 Level 9</p>
  <p>原子核の構成（陽子数・中性子数）、半減期と指数関数減衰、質量欠損と結合エネルギー、電子のド・ブロイ波長、光電効果の阻止電圧、ボーアの水素模型と発光スペクトルなど。</p>
  <a class="enter-btn" href="./atomic.html">原子物理の問題を解く →</a>
</div>

</div>

---

## 🎯 効果的な学習ステップ

\`\`\`
【ステップ 1: 問題文を読んでノートに自力で立式】
  まずはヒントを見ずに、文字式や数値で方程式を立ててみましょう。
      │
      ▼
【ステップ 2: つまずいたら「💡 ヒント」を開く】
  どの物理法則（エネルギー保存、運動方程式、オームの法則など）を使うべきかの方針を確認。
      │
      ▼
【ステップ 3: 「✅ 解答と丁寧な解説」で照合】
  正解の数値だけでなく、立式プロセスの途中に誤りがないかをステップごとに確認。
      │
      ▼
【ステップ 4: 「動くシミュレーター」で直感理解】
  数式だけでは実感しにくい現象を、パラメータを変えながらリアルタイムに実験！
\`\`\`

<!--@include: ../parts/notice.md-->

<style scoped>
.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  margin: 1.5rem 0 2rem 0;
}
.unit-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, border-color 0.2s;
}
.unit-card:hover {
  transform: translateY(-3px);
  border-color: #38bdf8;
}
.unit-card h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
}
.unit-meta {
  font-size: 0.78rem;
  color: #38bdf8;
  font-weight: 600;
  margin: 0 0 10px 0;
}
.unit-card p {
  font-size: 0.85rem;
  color: #a1a1aa;
  line-height: 1.5;
  margin: 0 0 16px 0;
}
.enter-btn {
  display: inline-block;
  align-self: flex-start;
  background: #27272a;
  color: #f4f4f5;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.enter-btn:hover {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}
</style>
`;

fs.writeFileSync(path.join(problemsDir, 'index.md'), portalMd, 'utf-8');
console.log('生成完了: docs/problems/index.md (ポータル)');
