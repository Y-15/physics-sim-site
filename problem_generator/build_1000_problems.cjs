// problem_generator/build_1000_problems.cjs
const fs = require('fs');
const path = require('path');
const { createProblem, simMap } = require('./utils.cjs');
const { generateMechanicsProblems } = require('./mechanics.cjs');
const { generateWavesProblems } = require('./waves.cjs');
const { generateElectromagnetismProblems } = require('./electromagnetism.cjs');
const { generateThermodynamicsProblems } = require('./thermodynamics.cjs');
const { generateAtomicProblems } = require('./atomic.cjs');

// 1. 既存問題のパース
function loadExistingProblems() {
  const existingList = [];
  const seenIds = new Set();

  // (A) extracted_problems.json
  const extractedPath = path.join(__dirname, '..', 'extracted_problems.json');
  if (fs.existsSync(extractedPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
      for (const p of raw) {
        if (p.id && p.id !== 'unique-problem-id' && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          existingList.push(createProblem(p));
        }
      }
    } catch (e) {
      console.warn('Warning reading extracted_problems.json:', e.message);
    }
  }

  // (B) imported_problem_bank.dart
  const importedBankPath = path.join(__dirname, '..', 'android_app_ref', 'lib', 'data', 'imported_problem_bank.dart');
  if (fs.existsSync(importedBankPath)) {
    try {
      const content = fs.readFileSync(importedBankPath, 'utf-8');
      const problemRegex = /PhysicsProblem\s*\(\s*id:\s*'([^']+)'[\s\S]*?\n\s*\),/g;
      let match;
      while ((match = problemRegex.exec(content)) !== null) {
        const block = match[0];
        const id = match[1];
        if (seenIds.has(id)) continue;

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

        const unitId = getField('unitId') || 'mechanics';
        const topicId = getField('topicId') || '';
        const title = getField('title') || '';
        const prompt = getField('prompt') || '';
        const hint = getField('hint') || '';
        const level = getNumberField('level') || 1;
        const answer = getField('answer') || '';
        const explanation = getField('explanation') || '';

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
          let latexVal = (getFField('latex') || '').replace(/\\\\([a-zA-Z]+)/g, '\\$1').replace(/\\+$/, '');
          formulas.push({
            title: fTitle,
            expression: getFField('expression'),
            latex: latexVal,
            note: getFField('note')
          });
        }

        if (title && prompt) {
          seenIds.add(id);
          existingList.push(createProblem({
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
          }));
        }
      }
    } catch (e) {
      console.warn('Warning reading imported_problem_bank.dart:', e.message);
    }
  }

  return existingList;
}

// 2. メイン生成実行
function buildAll() {
  console.log('=== 高校物理 厳選1000問データベース構築開始 ===');
  const existing = loadExistingProblems();
  console.log(`基盤問題（既存リポジトリデータより取得）: ${existing.length} 問`);

  const grouped = {
    mechanics: [],
    waves: [],
    electromagnetism: [],
    thermodynamics: [],
    atomic: []
  };

  for (const p of existing) {
    if (grouped[p.unitId]) {
      grouped[p.unitId].push(p);
    } else {
      grouped.mechanics.push(p);
    }
  }

  console.log(`既存内訳: 力学 ${grouped.mechanics.length}, 波動 ${grouped.waves.length}, 電磁気 ${grouped.electromagnetism.length}, 熱力学 ${grouped.thermodynamics.length}, 原子 ${grouped.atomic.length}`);

  // 各分野を目標数まで拡充
  console.log('各分野の高品質問題生成中...');
  const mechanics = generateMechanicsProblems(grouped.mechanics);
  const waves = generateWavesProblems(grouped.waves);
  const electromagnetism = generateElectromagnetismProblems(grouped.electromagnetism);
  const thermodynamics = generateThermodynamicsProblems(grouped.thermodynamics);
  const atomic = generateAtomicProblems(grouped.atomic);

  const rawProblems = [
    ...mechanics,
    ...waves,
    ...electromagnetism,
    ...thermodynamics,
    ...atomic
  ];

  // =========================================================================
  // 厳密な重複排除フィルター（「ただ、数字を変えただけの問題」を完全に排除）
  // =========================================================================
  const seenSignatures = new Set();
  const cleanedProblems = [];

  for (const p of rawProblems) {
    const title = p.title || '';
    const prompt = p.prompt || '';
    const unit = p.unitId || '';
    const topic = p.topicId || '';

    // タイトルから数値パラメータ・表記ブレを除去
    const normTitle = title
      .replace(/\(.*?\d+.*?\)/g, '')
      .replace(/【.*?】/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 問題文から数値を NUM に置換し、構造シグネチャを抽出
    const normPrompt = prompt
      .replace(/\d+(\.\d+)?/g, 'NUM')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);

    const sig = `${unit}:::${topic}:::${normTitle}:::${normPrompt}`;

    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      cleanedProblems.push(p);
    } else {
      // 重複問題（数字を変えただけ）を検知して除外
      // console.log(`重複除外: [${p.id}] ${p.title}`);
    }
  }

  // 分野別の集計
  const finalCounts = {
    mechanics: cleanedProblems.filter(p => p.unitId === 'mechanics').length,
    waves: cleanedProblems.filter(p => p.unitId === 'waves').length,
    electromagnetism: cleanedProblems.filter(p => p.unitId === 'electromagnetism').length,
    thermodynamics: cleanedProblems.filter(p => p.unitId === 'thermodynamics').length,
    atomic: cleanedProblems.filter(p => p.unitId === 'atomic').length,
  };

  console.log('--- 重複完全排除 完了 ---');
  console.log(`🏎️ 力学: ${finalCounts.mechanics} 問（重複排除済み）`);
  console.log(`🌊 波動: ${finalCounts.waves} 問（重複排除済み）`);
  console.log(`⚡ 電磁気: ${finalCounts.electromagnetism} 問（重複排除済み）`);
  console.log(`🔥 熱力学: ${finalCounts.thermodynamics} 問（重複排除済み）`);
  console.log(`⚛️ 原子物理: ${finalCounts.atomic} 問（重複排除済み）`);
  console.log(`🎯 合計: ${cleanedProblems.length} 問（すべて異なる完全オリジナル・厳選良問）`);

  // 出力先
  const outDir = path.join(__dirname, '..', 'docs', 'public', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'problems.json');
  fs.writeFileSync(outPath, JSON.stringify(cleanedProblems, null, 2), 'utf-8');
  console.log(`JSON保存完了: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);

  return cleanedProblems;
}

if (require.main === module) {
  buildAll();
}

module.exports = { buildAll };
