const katex = require('katex');
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'docs', 'public', 'data', 'problems.json');
const problems = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function renderLatex(latex, displayMode) {
  return katex.renderToString(latex.trim(), { displayMode, throwOnError: true, strict: false });
}

function formatMath(text) {
  if (!text) return '';
  let str = text;
  str = str.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => renderLatex(math, true));
  str = str.replace(/\$([^\$\n\r]+?)\$/g, (_, math) => renderLatex(math, false));
  return str;
}

let parseErrors = 0;
let rawDollarCount = 0;

problems.forEach((p, i) => {
  ['prompt', 'hint', 'answer', 'explanation'].forEach(f => {
    const raw = p[f] || '';
    try {
      const out = formatMath(raw);
      const remainingDollars = (out.match(/(?<!\\)\$/g) || []).length;
      if (remainingDollars > 0) {
        console.log(`Problem ${i + 1} (${p.id}) ${f} has remaining dollars: ${remainingDollars}`);
        rawDollarCount++;
      }
    } catch (e) {
      console.log(`Problem ${i + 1} (${p.id}) ${f} KaTeX error: ${e.message}`);
      parseErrors++;
    }
  });

  if (Array.isArray(p.solutionFormulas)) {
    p.solutionFormulas.forEach((sf, sfIdx) => {
      if (sf.latex) {
        try {
          renderLatex(sf.latex, true);
        } catch (e) {
          console.log(`Problem ${i + 1} formula ${sfIdx} KaTeX error: ${e.message}`);
          parseErrors++;
        }
      }
    });
  }
});

console.log('=== 全1000問 KaTeXレンダリング検証結果 ===');
console.log(`検証問題数: ${problems.length} 問`);
console.log(`KaTeX パースエラー数: ${parseErrors}`);
console.log(`残存した生ドル記号 ($) 数: ${rawDollarCount}`);
