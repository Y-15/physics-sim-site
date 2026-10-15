const fs = require('fs');
const path = require('path');
const { getIllustrationForProblem } = require('./problem_illustrations.cjs');

const units = [
  { id: 'mechanics', file: 'docs/problems/mechanics.md', name: '力学（Mechanics）' },
  { id: 'waves', file: 'docs/problems/waves.md', name: '波動（Waves）' },
  { id: 'electromagnetism', file: 'docs/problems/electromagnetism.md', name: '電磁気（Electromagnetism）' },
  { id: 'thermodynamics', file: 'docs/problems/thermodynamics.md', name: '熱力学（Thermodynamics）' },
  { id: 'atomic', file: 'docs/problems/atomic.md', name: '原子物理（Atomic Physics）' }
];

let totalModified = 0;

units.forEach(unit => {
  const filePath = path.join(__dirname, unit.file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // ダミー問題（第13問: 問題タイトル）を本物の良問（等加速度運動の移動距離）に置換
  if (unit.id === 'mechanics') {
    const dummyRegex = /### 第13問: 問題タイトル[\s\S]*?(?=### 第14問:)/;
    if (dummyRegex.test(content)) {
      const realProblem13 = `### 第13問: 等加速度直線運動の変位と移動距離

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
初速度 4.0 m/s で直線上を運動していた物体が、一定の加速度 2.0 m/s² で加速しながら 5.0 s 間進んだ。この 5.0 s 間に物体が進んだ距離（変位）を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

初速度 v₀、加速度 a、時間 t から変位 x を求める等加速度直線運動の公式 x = v₀t + ½at² を用います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
45 m

**【詳しい解説】**  
等加速度直線運動の変位の式に各数値を代入します。
x = v₀t + ½at²
x = (4.0 × 5.0) + ½ × 2.0 × (5.0)²
x = 20 + 25 = 45 m

間違えやすいポイント: ½ at² の t² を計算し忘れないように注意しましょう。

**【立式と計算ステップ】**

**Step 1: 変位の使用公式**
$$
x = v_0 t + \\frac{1}{2} a t^2
$$
*※ 初速度による進み（v₀t）と加速度による進み（½at²）の和です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/acceleration.html">等加速度直線運動とv-tグラフ</a> で現象を確認してみよう
</div>

</div>

---

`;
      content = content.replace(dummyRegex, realProblem13);
      console.log('mechanics: ダミー問題13を本物の良問に置換しました。');
    }
  }

  // 既存の <div class="vector-graph-card">...</div> があれば一旦除去（クリーンな再挿入のため）
  content = content.replace(/<div class="vector-graph-card">[\s\S]*?<\/div>\s*<\/div>\n\n/g, '');

  // 各問題カードを正規表現で検出して図解を挿入
  // パターン:
  // (### 第(\d+)問:\s*([^\n]+)[\s\S]*?<div class="problem-card">[\s\S]*?\*\*【問題】\*\*\s*\n([\s\S]*?)\n\n)(<details)/g
  const problemRegex = /(### 第(\d+)問:\s*([^\n]+)[\s\S]*?<div class="problem-card">[\s\S]*?\*\*【問題】\*\*\s*\n)([\s\S]*?)(?=\n\n\s*<details)/g;

  let count = 0;
  content = content.replace(problemRegex, (match, prefix, qNum, title, prompt) => {
    count++;
    const illustration = getIllustrationForProblem(unit.id, {
      title: title.trim(),
      prompt: prompt.trim()
    });

    if (!illustration) {
      return match;
    }

    const graphBlock = `\n\n<div class="vector-graph-card">\n  <div class="graph-title">📐 ${illustration.title}</div>\n  ${illustration.svg}\n  <div class="graph-caption">${illustration.desc}</div>\n</div>`;

    return prefix + prompt.trim() + graphBlock;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`${unit.name}: ${count}問すべてに画像・グラフ（ベクターSVG図解）を挿入完了！`);
  totalModified += count;
});

console.log(`\n🎉 全${totalModified}問の演習問題への画像・グラフ挿入が完了しました！`);
