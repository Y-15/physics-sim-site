const fs = require('fs');
const path = require('path');

// app_data ディレクトリ内の physics_problems.dart と custom_content.dart を読み込む
const problemsFile = path.join(__dirname, 'app_data', 'physics_problems.dart');
const customFile = path.join(__dirname, 'app_data', 'custom_content.dart');

function parseProblems(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const problems = [];
  
  // PhysicsProblem(...) ブロックを正規表現で検出
  const problemRegex = /PhysicsProblem\s*\(\s*id:\s*'([^']+)'[\s\S]*?\n\s*\),/g;
  let match;
  
  while ((match = problemRegex.exec(content)) !== null) {
    const block = match[0];
    const id = match[1];
    
    const getField = (fieldName) => {
      const r = new RegExp(`${fieldName}:\\s*(?:'([^']*(?:\\\\'[^']*)*)'|"([^"]*(?:\\\\"[^"]*)*)")`, 's');
      const m = block.match(r);
      if (m) {
        return (m[1] !== undefined ? m[1] : m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"');
      }
      return null;
    };

    const getNumberField = (fieldName) => {
      const r = new RegExp(`${fieldName}:\\s*([0-9]+)`);
      const m = block.match(r);
      return m ? parseInt(m[1], 10) : null;
    };

    const unitId = getField('unitId') || 'general';
    const topicId = getField('topicId') || '';
    const title = getField('title') || '';
    const prompt = getField('prompt') || '';
    const hint = getField('hint') || '';
    const level = getNumberField('level') || 1;
    const answer = getField('answer') || '';
    const explanation = getField('explanation') || '';

    // solutionFormulas の抽出
    const formulas = [];
    const formulaRegex = /PhysicsFormula\s*\(\s*title:\s*'([^']+)'[\s\S]*?\n\s*\),/g;
    let fMatch;
    while ((fMatch = formulaRegex.exec(block)) !== null) {
      const fBlock = fMatch[0];
      const fTitle = fMatch[1];
      const getFField = (fName) => {
        const r = new RegExp(`${fName}:\\s*(?:r?'([^']*(?:\\\\'[^']*)*)'|"([^"]*(?:\\\\"[^"]*)*)")`, 's');
        const m = fBlock.match(r);
        return m ? (m[1] !== undefined ? m[1] : m[2]).replace(/\\'/g, "'") : '';
      };
      formulas.push({
        title: fTitle,
        expression: getFField('expression'),
        latex: getFField('latex'),
        note: getFField('note')
      });
    }

    if (title && prompt) {
      problems.push({
        id,
        unitId,
        topicId,
        title,
        prompt,
        hint,
        level,
        answer,
        explanation,
        solutionFormulas: formulas
      });
    }
  }

  return problems;
}

const p1 = parseProblems(problemsFile);
const p2 = parseProblems(customFile);
const allProblems = [...p1, ...p2];

// IDの重複除去
const uniqueProblems = [];
const seenIds = new Set();
for (const p of allProblems) {
  if (!seenIds.has(p.id)) {
    seenIds.add(p.id);
    uniqueProblems.push(p);
  }
}

console.log(`抽出成功: 全 ${uniqueProblems.length} 問の問題を取得しました！`);

// ユニット別に集計
const unitCounts = {};
for (const p of uniqueProblems) {
  unitCounts[p.unitId] = (unitCounts[p.unitId] || 0) + 1;
}
console.log('分野別内訳:', unitCounts);

// 出力先
fs.writeFileSync(path.join(__dirname, 'extracted_problems.json'), JSON.stringify(uniqueProblems, null, 2), 'utf-8');
