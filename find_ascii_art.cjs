const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  });
  return results;
}

const mdFiles = walk(path.join(__dirname, 'docs'));
console.log(`対象 Markdown ファイル数: ${mdFiles.length}`);

const found = [];

mdFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  // ``` で始まり、言語指定なし、または擬似グラフのアスキーアート
  const codeBlocks = content.match(/```(?:[^\n]*)\n([\s\S]*?)```/g);
  if (codeBlocks) {
    codeBlocks.forEach(cb => {
      // グラフや図（| や + や - や ─ や > や ^ や 矢印 で構成された図）
      if (cb.includes('|') || cb.includes('──') || cb.includes('+---') || cb.includes('^') || cb.includes('▼') || cb.includes('┌') || cb.includes('└')) {
        // 通常のコードやテーブルや数式等を除外判定
        const lines = cb.split('\n');
        const hasGraphSymbols = lines.some(l => l.includes('──') || l.includes('+---') || l.includes('┌') || l.match(/\|\s*[\\\/\^]/) || l.includes('---->') || l.includes('~~~~>'));
        if (hasGraphSymbols) {
          found.push({
            file: path.relative(__dirname, f).replace(/\\/g, '/'),
            block: cb.slice(0, 300) + '...'
          });
        }
      }
    });
  }
});

console.log(`発見したアスキーアートグラフ数: ${found.length}`);
found.forEach(item => {
  console.log(`\n=== FILE: ${item.file} ===`);
  console.log(item.block);
});
