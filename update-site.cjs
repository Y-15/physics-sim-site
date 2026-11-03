const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, options = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: __dirname, ...options });
}

function getOutput(cmd) {
  return execSync(cmd, { encoding: 'utf8', cwd: __dirname }).trim();
}

try {
  console.log('========================================');
  console.log('  物理シミュレーションラボ サイト更新ツール');
  console.log('========================================');

  // 1. Sync problem diagrams if script exists
  const syncScript = path.join(__dirname, 'insert_diagrams_to_problems.cjs');
  if (fs.existsSync(syncScript)) {
    console.log('\n[1/4] 演習問題の図解データを同期しています...');
    run('node insert_diagrams_to_problems.cjs');
  }

  // 2. Build check
  console.log('\n[2/4] サイトのビルドチェック (npm run docs:build) を実行しています...');
  run('npm run docs:build');

  // 3. Git add & commit
  console.log('\n[3/4] 変更ファイルを確認・コミットしています...');
  run('git add -A');
  const status = getOutput('git status --porcelain');

  if (!status) {
    console.log('変更されたファイルはありません。リモートとの同期を確認します...');
  } else {
    const customMsg = process.argv.slice(2).join(' ').trim();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const commitMsg = customMsg || `chore: サイト更新 (${timestamp})`;

    console.log(`コミットを作成中: ${commitMsg}`);
    run(`git commit -m ${JSON.stringify(commitMsg)}`);
  }

  // 4. Push to GitHub
  console.log('\n[4/4] GitHub (origin/main) へプッシュしています...');
  run('git push origin main');

  console.log('\n========================================');
  console.log('  完了！GitHub Actions による公開処理が開始されました。');
  console.log('  1〜2分ほどで公開サイトに反映されます。');
  console.log('========================================');
} catch (err) {
  console.error('\n[エラー] サイト更新中にエラーが発生しました:', err.message);
  process.exit(1);
}

