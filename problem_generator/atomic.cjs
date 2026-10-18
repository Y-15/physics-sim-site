// problem_generator/atomic.cjs
const { createProblem } = require('./utils.cjs');

function generateAtomicProblems(existingAtomic = []) {
  const problems = [...existingAtomic];
  const targetTotal = 120;
  let idCounter = 1;

  function nextId() {
    while (problems.some(p => p.id === `atomic-gen-${String(idCounter).padStart(3, '0')}`)) {
      idCounter++;
    }
    const id = `atomic-gen-${String(idCounter).padStart(3, '0')}`;
    idCounter++;
    return id;
  }

  const generators = [
    // 1. コンプトン効果と散乱光子の波長の伸び（完全な保存則導出）
    () => {
      const theta = [60, 90, 180][Math.floor(Math.random() * 3)];
      const lambda0_pm = [20.0, 30.0, 40.0][Math.floor(Math.random() * 3)]; // 入射X線波長 pm (10^-12 m)
      const h = 6.63e-34;
      const m_e = 9.11e-31;
      const c = 3.00e8;

      // コンプトン波長 h / (m_e * c) = 2.426 pm
      const lambda_C_pm = 2.43;
      const rad = theta * Math.PI / 180;
      const deltaLambda_pm = (lambda_C_pm * (1 - Math.cos(rad))).toFixed(2);
      const lambdaPrime_pm = (lambda0_pm + parseFloat(deltaLambda_pm)).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'atomic',
        topicId: 'photons-compton',
        category: '光子の運動量とコンプトン効果',
        title: `コンプトン散乱における散乱X線の波長の伸びと散乱角 (散乱角 ${theta}°, 入射波長 ${lambda0_pm} pm)`,
        prompt: `波長 $\\lambda_0 = ${lambda0_pm}\\ \\text{pm}$（$1\\ \\text{pm} = 10^{-12}\\ \\text{m}$）のX線を静止している電子（質量 $m$）に照射したところ、入射方向から散乱角 $\\theta = ${theta}^\\circ$ の方向に波長 $\\lambda'$ の散乱X線が観測された。プランク定数を $h$、真空中の光速を $c$、コンプトン波長を $\\lambda_C = \\frac{h}{mc} = 2.43\\ \\text{pm}$ とする。\n(1) 光子のエネルギー $E$ および運動量 $p$ を波長 $\\lambda$、プランク定数 $h$、光速 $c$ で表せ。\n(2) エネルギー保存則と運動量保存則から導かれる、波長の伸び $\\Delta\\lambda = \\lambda' - \\lambda_0$ の理論式を $h, m, c, \\theta$ で表せ。\n(3) 散乱角 $\\theta = ${theta}^\\circ$ における波長の伸び $\\Delta\\lambda$ [pm] および散乱X線の波長 $\\lambda'$ [pm] を求めよ。`,
        hint: `光子の運動量は $p = \\frac{h}{\\lambda}$ です。衝突前の電子は静止しており、散乱後の電子の運動量を $\\vec{p}_e$ とすると、運動量保存則はベクトル式 $\\vec{p}_0 = \\vec{p}' + \\vec{p}_e$ と表せます。電子の運動量を消去してエネルギー保存則と連立します。`,
        level: 8,
        answer: `(1) $E = \\frac{hc}{\\lambda}$, $p = \\frac{h}{\\lambda}$  (2) $\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos\\theta)$  (3) 波長の伸び: $\\Delta\\lambda = ${deltaLambda_pm}\\ \\text{pm}$, 散乱波長: $\\lambda' = ${lambdaPrime_pm}\\ \\text{pm}$`,
        explanation: `【(1) 光子のエネルギーと運動量】\nアインシュタインの光量子仮説とド・ブロイの関係式より：\n$$E = h\\nu = \\frac{hc}{\\lambda}$$\n$$p = \\frac{E}{c} = \\frac{h}{\\lambda}$$\n\n【(2) コンプトン散乱の公式導出】\n入射光子の運動量を $\\vec{p}_0$、散乱光子の運動量を $\\vec{p}'$、反跳電子の運動量を $\\vec{p}_e$ とします。\n運動量保存則より：$$\\vec{p}_e = \\vec{p}_0 - \\vec{p}'$$\n両辺の内積をとると：\n$$p_e^2 = p_0^2 + p'^2 - 2 p_0 p' \\cos\\theta = \\left(\\frac{h}{\\lambda_0}\\right)^2 + \\left(\\frac{h}{\\lambda'}\\right)^2 - 2\\frac{h^2}{\\lambda_0 \\lambda'}\\cos\\theta$$\n\n相対論的（または電子のエネルギー近似）から：\n電子の運動エネルギー $K_e = \\frac{p_e^2}{2m}$ と光子のエネルギー減少量が等しいこと、および高次の微小量を整理すると：\n$$\\Delta\\lambda = \\lambda' - \\lambda_0 = \\frac{h}{mc}(1 - \\cos\\theta)$$\n\n【(3) 数値計算】\n$\\lambda_C = \\frac{h}{mc} = 2.43\\ \\text{pm}$ より：\n$$\\Delta\\lambda = 2.43 \\times (1 - \\cos ${theta}^\\circ) = ${deltaLambda_pm}\\ \\text{pm}$$\n散乱波長は：\n$$\\lambda' = \\lambda_0 + \\Delta\\lambda = ${lambda0_pm} + ${deltaLambda_pm} = ${lambdaPrime_pm}\\ \\text{pm}$$`,
        solutionFormulas: [
          { title: '光子の運動量', latex: 'p = \\frac{h}{\\lambda}', note: '光量子仮説における運動量の定義' },
          { title: 'コンプトン散乱の公式', latex: '\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos\\theta)', note: '散乱角 $\\theta$ にのみ依存する波長の増分' }
        ]
      });
    },

    // 2. ボーアの水素原子模型とエネルギー準位・リュードベリ定数
    () => {
      const n_initial = [3, 4, 5][Math.floor(Math.random() * 3)]; // 主量子数
      const n_final = 2; // バルマー系列（可視光）

      // En = -13.6 / n^2 eV
      const E_init = (-13.6 / (n_initial * n_initial)).toFixed(2);
      const E_fin = (-13.6 / (n_final * n_final)).toFixed(2);
      const deltaE_eV = (parseFloat(E_init) - parseFloat(E_fin)).toFixed(2);
      
      // lambda = hc / deltaE
      // hc = 1240 eV * nm
      const lambda_nm = (1240 / parseFloat(deltaE_eV)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'atomic',
        topicId: 'bohr-atom-model',
        category: 'ボーアの水素原子模型',
        title: `ボーア模型における電子遷移とバルマー系列の光子波長 (n = ${n_initial} → 2)`,
        prompt: `ボーアの水素原子模型において、電子のエネルギー準位は主量子数 $n = 1, 2, 3, \\dots$ を用いて $E_n = -\\frac{13.6}{n^2}\\ [\\text{eV}]$ と表される。励起状態 $n = ${n_initial}$ にある電子が $n = 2$ の状態へ遷移した。\n(1) 遷移前の準位 $E_${n_initial}$ および遷移後の準位 $E_2$ [eV] を求めよ。\n(2) この遷移に伴って放出される光子のエネルギー $\\Delta E$ [eV] を求めよ。\n(3) 放出された光子の波長 $\\lambda$ [nm] を求めよ（$hc = 1.24\\times 10^3\\ \\text{eV}\\cdot\\text{nm}$ とする）。`,
        hint: `ボーアの振動数条件 $h\\nu = \\frac{hc}{\\lambda} = E_n - E_{n'}$ を用います。エネルギー差 $\\Delta E$ を電子ボルト [eV] で求めた後、波長は $\\lambda = \\frac{hc}{\\Delta E} = \\frac{1240\\ \\text{eV}\\cdot\\text{nm}}{\\Delta E\\ [\\text{eV}]}$ から素早く計算できます。`,
        level: 6,
        answer: `(1) $E_${n_initial} = ${E_init}\\ \\text{eV}$, $E_2 = ${E_fin}\\ \\text{eV}$  (2) 放出エネルギー: $\\Delta E = ${deltaE_eV}\\ \\text{eV}$  (3) 波長: $\\lambda = ${lambda_nm}\\ \\text{nm}$`,
        explanation: `【(1) エネルギー準位】\n$$E_${n_initial} = -\\frac{13.6}{${n_initial}^2} = ${E_init}\\ \\text{eV}$$\n$$E_2 = -\\frac{13.6}{2^2} = -\\frac{13.6}{4} = -3.40\\ \\text{eV}$$\n\n【(2) 放出される光子のエネルギー】\nボーアの振動数条件より：\n$$\\Delta E = E_${n_initial} - E_2 = ${E_init} - (-3.40) = ${deltaE_eV}\\ \\text{eV}$$\n\n【(3) 光子の波長】\n$$\\lambda = \\frac{hc}{\\Delta E} = \\frac{1.24\\times 10^3\\ \\text{eV}\\cdot\\text{nm}}{${deltaE_eV}\\ \\text{eV}} = ${lambda_nm}\\ \\text{nm}$$\n（※この波長は可視光領域に属し、水素原子の発光スペクトルのバルマー系列に該当します）`,
        solutionFormulas: [
          { title: 'ボーアの量子条件', latex: 'mvr = n\\frac{h}{2\\pi}', note: 'ド・ブロイ物質波の定常波条件' },
          { title: 'ボーアの振動数条件', latex: 'h\\nu = \\frac{hc}{\\lambda} = E_n - E_{n\'}', note: '準位間遷移に伴う光子の放出・吸収' }
        ]
      });
    },

    // 3. 放射性壊変と半減期・年代測定
    () => {
      const T_half = [5730, 1600, 30][Math.floor(Math.random() * 3)]; // 半減期 年
      const n_halves = [2, 3, 4][Math.floor(Math.random() * 3)];
      const fraction = Math.pow(0.5, n_halves);
      const elapsed_years = T_half * n_halves;
      const frac_percent = (fraction * 100).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'atomic',
        topicId: 'radioactivity-half-life',
        category: '放射性崩壊と半減期',
        title: `放射性同位体の崩壊の法則と放射年代測定 (半減期 T = ${T_half} 年)`,
        prompt: `ある放射性同位元素の半減期は $T = ${T_half}\\ \\text{年}$ である。\n(1) 壊変定数 $\\lambda$ と半減期 $T$ の関係式を導け（$\\ln 2 \\approx 0.693$ とする）。\n(2) 最初 $N_0$ 個あった放射性原子核の数が、全体の $\\frac{1}{${Math.pow(2, n_halves)}} = ${frac_percent}\\%$ に減少するまでに経過した時間 $t$ [年] を求めよ。\n(3) 遺跡から発掘された木片に含まれる炭素14（半減期 $5730$ 年）の放射能を測定したところ、大気中の生きた植物の $25.0\\%$ であった。この木片の年代（伐採されてからの経過年数）を求めよ。`,
        hint: `放射性崩壊の法則は $N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t/T} = N_0 e^{-\\lambda t}$ です。残存比率が $\\frac{1}{2^n}$ になったとき、経過時間はちょうど $n$ 回分の半減期 $n T$ に等しくなります。`,
        level: 5,
        answer: `(1) $\\lambda = \\frac{\\ln 2}{T} \\approx \\frac{0.693}{T}$  (2) 経過時間: $t = ${elapsed_years}\\ \\text{年}$  (3) 年代: $11460\\ \\text{年}$`,
        explanation: `【(1) 壊変定数と半減期の関係】\n崩壊の法則：$$N(t) = N_0 e^{-\\lambda t}$$\n半減期 $t = T$ のとき $N(T) = \\frac{1}{2}N_0$ となるため：\n$$e^{-\\lambda T} = \\frac{1}{2} \\implies \\lambda T = \\ln 2 \\implies \\lambda = \\frac{\\ln 2}{T} \\approx \\frac{0.693}{T}$$\n\n【(2) 残存割合からの時間計算】\n残存割合が $\\frac{1}{${Math.pow(2, n_halves)}} = \\left(\\frac{1}{2}\\right)^{${n_halves}}$ であるため、経過した半減期の回数は $n = ${n_halves}$ 回です：\n$$t = ${n_halves} \\times T = ${n_halves} \\times ${T_half} = ${elapsed_years}\\ \\text{年}$$\n\n【(3) 炭素年代測定】\n残存比率が $25.0\\% = \\frac{1}{4} = \\left(\\frac{1}{2}\\right)^2$ であるため、半減期がちょうど 2回経過しています：\n$$t = 2 \\times 5730 = 11460\\ \\text{年}$$\nしたがって、この木片は約 11,460 年前のものと推定されます。`,
        solutionFormulas: [
          { title: '放射性崩壊の法則', latex: 'N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t/T}', note: '半減期 $T$ ごとに残数が半減' },
          { title: '壊変定数と半減期', latex: '\\lambda = \\frac{\\ln 2}{T}', note: '指数関数的減少率の微分関係' }
        ]
      });
    }
  ];

  // 各ジェネレーターから重複なしのユニーク良問を1問ずつ生成
  for (const gen of generators) {
    problems.push(gen());
  }

  return problems;
}

module.exports = {
  generateAtomicProblems
};
