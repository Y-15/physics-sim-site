// problem_generator/thermodynamics.cjs
const { createProblem } = require('./utils.cjs');

function generateThermodynamicsProblems(existingThermo = []) {
  const problems = [...existingThermo];
  const targetTotal = 130;
  let idCounter = 1;

  function nextId() {
    while (problems.some(p => p.id === `thermo-gen-${String(idCounter).padStart(3, '0')}`)) {
      idCounter++;
    }
    const id = `thermo-gen-${String(idCounter).padStart(3, '0')}`;
    idCounter++;
    return id;
  }

  const generators = [
    // 1. 単原子分子理想気体の熱サイクルと熱効率
    () => {
      const P0 = [1.0, 2.0][Math.floor(Math.random() * 2)] * 1e5; // Pa
      const V0 = [1.0, 2.0][Math.floor(Math.random() * 2)] * 1e-2; // m^3
      const R = 8.31;
      
      // A(P0, V0) -> B(2P0, V0) 定積加熱
      // B(2P0, V0) -> C(2P0, 3V0) 定圧膨張
      // C(2P0, 3V0) -> D(P0, 3V0) 定積冷却
      // D(P0, 3V0) -> A(P0, V0) 定圧圧縮
      const W_net = (P0 * 2 * V0); // 長方形面積 = (2P0 - P0) * (3V0 - V0) = P0 * 2V0
      // Q_AB = n * Cv * (TB - TA) = 3/2 * (2P0*V0 - P0*V0) = 3/2 * P0*V0
      const Q_AB = 1.5 * P0 * V0;
      // Q_BC = n * Cp * (TC - TB) = 5/2 * (6P0*V0 - 2P0*V0) = 5/2 * 4P0*V0 = 10 * P0*V0
      const Q_BC = 10 * P0 * V0;
      const Q_in = Q_AB + Q_BC; // 11.5 * P0*V0
      const efficiency = (W_net / Q_in).toFixed(3);
      const eff_percent = (parseFloat(efficiency) * 100).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'thermodynamics',
        topicId: 'thermodynamic-cycles',
        category: '熱力学第一法則と熱サイクル',
        title: `P-V図における矩形熱サイクルと熱効率の完全導出 (P0 = ${(P0/1e5).toFixed(1)}×10⁵ Pa, V0 = ${(V0*1000).toFixed(0)} L)`,
        prompt: `単原子分子理想気体 $n$ モルをシリンダーに入れ、状態 A $(P_0, V_0)$ から以下の順序で準静的に変化させて元の状態 A に戻した。\n・過程 A $\\to$ B：定積加熱により圧力を $P_0$ から $2P_0$ にした。\n・過程 B $\\to$ C：定圧膨張により体積を $V_0$ から $3V_0$ にした。\n・過程 C $\\to$ D：定積冷却により圧力を $2P_0$ から $P_0$ にした。\n・過程 D $\\to$ A：定圧圧縮により体積を $3V_0$ から $V_0$ に戻した。\nただし $P_0 = ${(P0/1e5).toFixed(1)}\\times 10^5\\ \\text{Pa}$、$V_0 = ${(V0*1000).toFixed(0)}\\times 10^{-3}\\ \\text{m}^3$ とする。\n(1) 過程 A $\\to$ B および B $\\to$ C で気体が吸収した熱量 $Q_{AB}, Q_{BC}$ を $P_0, V_0$ を用いて表せ。\n(2) このサイクルを1周する間に気体が外部になした正味の仕事 $W_{\\text{net}}$ を求めよ。\n(3) この熱機関の熱効率 $e = \\frac{W_{\\text{net}}}{Q_{\\text{吸熱}}}$ を求めよ。`,
        hint: `単原子分子理想気体の定積モル比熱は $C_V = \\frac{3}{2}R$、定圧モル比熱は $C_P = \\frac{5}{2}R$ です。吸熱が起こるのは温度が上昇する過程 A $\\to$ B と B $\\to$ C のみです。1サイクルの正味の仕事 $W_{\\text{net}}$ は P-V 図の閉曲線（長方形）が囲む面積に等しくなります。`,
        level: 7,
        answer: `(1) $Q_{AB} = \\frac{3}{2}P_0 V_0$, $Q_{BC} = 10 P_0 V_0$  (2) $W_{\\text{net}} = 2 P_0 V_0 = ${W_net.toFixed(0)}\\ \\text{J}$  (3) 熱効率: $e = \\frac{4}{23} \\approx ${efficiency}$ (${eff_percent}%)`,
        explanation: `【(1) 各行程における吸熱量】\n状態方程式 $PV = nRT$ より：\n・過程 A $\\to$ B（定積変化）：仕事 $W = 0$\n$$Q_{AB} = \\Delta U = n C_V (T_B - T_A) = \\frac{3}{2}(2P_0 V_0 - P_0 V_0) = \\frac{3}{2}P_0 V_0$$\n\n・過程 B $\\to$ C（定圧変化）：\n$$Q_{BC} = n C_P (T_C - T_B) = \\frac{5}{2}(2P_0 \\times 3V_0 - 2P_0 \\times V_0) = \\frac{5}{2}(4P_0 V_0) = 10 P_0 V_0$$\n気体が吸収した総熱量は：\n$$Q_{\\text{in}} = Q_{AB} + Q_{BC} = \\frac{3}{2}P_0 V_0 + 10 P_0 V_0 = \\frac{23}{2}P_0 V_0$$\n\n【(2) 1サイクルの正味の仕事】\nP-V 図の長方形の面積より：\n$$W_{\\text{net}} = (2P_0 - P_0)(3V_0 - V_0) = P_0 \\times 2V_0 = 2 P_0 V_0$$\n数値を代入すると：\n$$W_{\\text{net}} = 2 \\times (${P0}) \\times (${V0}) = ${W_net.toFixed(0)}\\ \\text{J}$$\n\n【(3) 熱効率の算出】\n$$e = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = \\frac{2 P_0 V_0}{\\frac{23}{2}P_0 V_0} = \\frac{4}{23} \\approx ${efficiency}$$\nしたがって熱効率は約 ${eff_percent}% となります。`,
        solutionFormulas: [
          { title: '熱力学第一法則', latex: '\\Delta U = Q - W', note: '吸熱量と内部エネルギー変化・仕事の保存則' },
          { title: '熱機関の熱効率', latex: 'e = \\frac{W_{\\text{net}}}{Q_{\\text{in}}}', note: '正味の仕事と吸収熱量の比' }
        ]
      });
    },

    // 2. ポアソンの法則と断熱変化における仕事と温度変化
    () => {
      const V1_L = [10.0, 20.0][Math.floor(Math.random() * 2)];
      const ratio = 8; // 圧縮比 V1 / V2 = 8
      const V2_L = (V1_L / ratio).toFixed(2);
      const T1_K = 300; // 27 ℃
      const gamma = 5 / 3; // 単原子分子理想気体比熱比
      
      // T2 = T1 * (V1 / V2)^(gamma - 1) = 300 * (8)^(2/3) = 300 * 4 = 1200 K
      const T2_K = (T1_K * Math.pow(ratio, gamma - 1)).toFixed(0);
      const n_mol = 1.0;
      const R = 8.31;
      const W_on = (n_mol * (1.5 * R) * (parseFloat(T2_K) - T1_K)).toFixed(0);

      return createProblem({
        id: nextId(),
        unitId: 'thermodynamics',
        topicId: 'four-gas-processes',
        category: '断熱変化とポアソンの法則',
        title: `単原子分子理想気体の準静的断熱圧縮における温度上昇と外力の仕事`,
        prompt: `断熱シリンダー内に $n = 1.0\\ \\text{mol}$ の単原子分子理想気体が温度 $T_1 = 300\\ \\text{K}$、体積 $V_1 = ${V1_L}\\ \\text{L}$ で入っている。ピストンをゆっくり押し込んで体積を $V_2 = \\frac{1}{${ratio}}V_1 = ${V2_L}\\ \\text{L}$ まで準静的断熱圧縮した。気体定数を $R = 8.31\\ \\text{J/(mol}\\cdot\\text{K)}$、単原子分子の比熱比を $\\gamma = \\frac{5}{3}$ とする。\n(1) 圧縮後の気体の絶対温度 $T_2$ [K] を求めよ。\n(2) 圧縮後の気体の圧力 $P_2$ は圧縮前の圧力 $P_1$ の何倍になるか。\n(3) この圧縮の間に外力が気体になした仕事 $W_{\\text{on}}$ [J] を求めよ。`,
        hint: `準静的断熱変化ではポアソンの法則 $P V^\\gamma = \\text{const}$ および $T V^{\\gamma - 1} = \\text{const}$ が成立します。断熱変化では $Q = 0$ であるため、熱力学第一法則より $\\Delta U = W_{\\text{on}} = n C_V (T_2 - T_1)$ となります。`,
        level: 7,
        answer: `(1) 圧縮後温度: $T_2 = ${T2_K}\\ \\text{K}$  (2) 圧力比: $\\frac{P_2}{P_1} = 32$ 倍  (3) 外力の仕事: $W_{\\text{on}} = ${W_on}\\ \\text{J}$`,
        explanation: `【(1) 圧縮後温度の算出】\nポアソンの温度・体積関係式より：\n$$T_1 V_1^{\\gamma - 1} = T_2 V_2^{\\gamma - 1}$$\n$$\\gamma - 1 = \\frac{5}{3} - 1 = \\frac{2}{3}$$\n$$T_2 = T_1 \\left(\\frac{V_1}{V_2}\\right)^{\\frac{2}{3}} = 300 \\times (${ratio})^{\\frac{2}{3}} = 300 \\times (2^3)^{\\frac{2}{3}} = 300 \\times 4 = ${T2_K}\\ \\text{K}$$\n\n【(2) 圧力比の算出】\nポアソンの法則 $P_1 V_1^\\gamma = P_2 V_2^\\gamma$ より：\n$$\\frac{P_2}{P_1} = \\left(\\frac{V_1}{V_2}\\right)^\\gamma = (${ratio})^{\\frac{5}{3}} = (2^3)^{\\frac{5}{3}} = 2^5 = 32\\ \\text{倍}$$\n\n【(3) 外力がした仕事】\n断熱変化では外部との熱の出入りがないため $Q = 0$ です。\n熱力学第一法則 $\\Delta U = Q + W_{\\text{on}}$ より：\n$$W_{\\text{on}} = \\Delta U = n C_V (T_2 - T_1) = 1.0 \\times \\left(\\frac{3}{2} \\times 8.31\\right) \\times (${T2_K} - 300) = ${W_on}\\ \\text{J}$$`,
        solutionFormulas: [
          { title: 'ポアソンの法則', latex: 'PV^\\gamma = \\text{const}, \\quad TV^{\\gamma-1} = \\text{const}', note: '可逆断熱変化での状態関係式' },
          { title: '断熱変化の仕事', latex: 'W_{\\text{on}} = \\Delta U = n C_V \\Delta T', note: '熱の出入りゼロでの第一法則' }
        ]
      });
    },

    // 3. 気体分子運動論と二乗平均速度・平均分子運動エネルギー
    () => {
      const M_mol = 28.0e-3; // 窒素分子 N2 (28 g/mol)
      const T_degC = [27, 127][Math.floor(Math.random() * 2)];
      const T_K = T_degC + 273; // 300 K または 400 K
      const R = 8.31;
      const kB = 1.38e-23;

      const v_rms = Math.sqrt((3 * R * T_K) / M_mol).toFixed(1);
      const E_trans = (1.5 * kB * T_K).toExponential(2);

      return createProblem({
        id: nextId(),
        unitId: 'thermodynamics',
        topicId: 'kinetic-theory-gases',
        category: '気体分子運動論',
        title: `気体分子運動論に基づく二乗平均速度と分子1個の平均運動エネルギー (${T_degC}°C 窒素)`,
        prompt: `温度 $t = ${T_degC}^\\circ\\text{C}$（絶対温度 $T = ${T_K}\\ \\text{K}$）の窒素気体（モル質量 $M = 2.80\\times 10^{-2}\\ \\text{kg/mol}$）がある。気体定数を $R = 8.31\\ \\text{J/(mol}\\cdot\\text{K)}$、ボルツマン定数を $k_B = 1.38\\times 10^{-23}\\ \\text{J/K}$ とする。\n(1) 窒素分子1個の平均並進運動エネルギー $\\overline{\\epsilon}$ [J] を求めよ。\n(2) 窒素分子の二乗平均速度 $v_{\\text{rms}} = \\sqrt{\\overline{v^2}}$ [m/s] を求めよ。\n(3) 気体の絶対温度を 4倍にしたとき、分子の二乗平均速度は何倍になるか。`,
        hint: `分子1個の平均並進運動エネルギーは気体の種類によらず絶対温度のみに比例し、$\\overline{\\epsilon} = \\frac{1}{2}m\\overline{v^2} = \\frac{3}{2}k_B T$ となります。両辺にアボガドロ数を掛けると $\\frac{1}{2}M\\overline{v^2} = \\frac{3}{2}RT$ となり、$v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$ が導かれます。`,
        level: 5,
        answer: `(1) 平均運動エネルギー: $\\overline{\\epsilon} = ${E_trans}\\ \\text{J}$  (2) 二乗平均速度: $v_{\\text{rms}} = ${v_rms}\\ \\text{m/s}$  (3) 2倍（$v_{\\text{rms}} \\propto \\sqrt{T}$ より）`,
        explanation: `【(1) 分子1個の平均並進運動エネルギー】\n気体分子運動論の微視的導出より：\n$$\\overline{\\epsilon} = \\frac{3}{2}k_B T = \\frac{3}{2} \\times (1.38\\times 10^{-23}) \\times ${T_K} = ${E_trans}\\ \\text{J}$$\n\n【(2) 二乗平均速度の算出】\n分子1個の質量を $m$、モル質量を $M = N_A m$ とすると：\n$$\\frac{1}{2}m\\overline{v^2} = \\frac{3}{2}k_B T \\implies \\frac{1}{2}M\\overline{v^2} = \\frac{3}{2}RT$$\n$$v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}} = \\sqrt{\\frac{3 \\times 8.31 \\times ${T_K}}{2.80\\times 10^{-2}}} = ${v_rms}\\ \\text{m/s}$$\n（※音速 $V \\approx 340\\ \\text{m/s}$ よりもやや速いマッハ1.5程度のオーダーになります）\n\n【(3) 温度変化の影響】\n$$v_{\\text{rms}} \\propto \\sqrt{T}$$\n絶対温度が 4倍になると、二乗平均速度は $\\sqrt{4} = 2$ 倍になります。`,
        solutionFormulas: [
          { title: '分子1個の平均並進運動エネルギー', latex: '\\overline{\\epsilon} = \\frac{3}{2}k_B T', note: '絶対温度の微視的定義' },
          { title: '二乗平均速度の公式', latex: 'v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}', note: '気体分子の統計的代表速度' }
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
  generateThermodynamicsProblems
};
