// problem_generator/mechanics.cjs
const { createProblem } = require('./utils.cjs');

function generateMechanicsProblems(existingMechanics = []) {
  const problems = [...existingMechanics];
  const targetTotal = 320;
  let idCounter = 1;

  function nextId() {
    while (problems.some(p => p.id === `mech-gen-${String(idCounter).padStart(3, '0')}`)) {
      idCounter++;
    }
    const id = `mech-gen-${String(idCounter).padStart(3, '0')}`;
    idCounter++;
    return id;
  }
  if (!problems.some(p => p.id === 'mech-galperin-pi-billiards')) {
    problems.push(createProblem({
      id: 'mech-galperin-pi-billiards',
      unitId: 'mechanics',
      topicId: 'momentum',
      category: '2体衝突と運動量・エネルギー保存則の幾何学的解法',
      title: '【最難関大・発展演習】2つの物体の完全弾性衝突と円周率πの出現（ガルペリンのビリヤード）',
      prompt: 'なめらかな水平面上の原点 $x = 0$ に垂直で堅固な壁が固定されている。壁の右側に質量 $m$ の小物体 $\\mathrm{A}$ と質量 $M$（$M \\ge m$）の小物体 $\\mathrm{B}$ を順に置き、最初 $\\mathrm{A}$ を静止させ、$\\mathrm{B}$ に左向きの初速度 $-v_0$（$v_0 > 0$）を与えた。衝突はすべて完全弾性衝突（$e = 1$）とし、総衝突回数を $N$ とする。\n(1) $M = m$ のとき、および $M = 3m$ のときの総衝突回数 $N$ をそれぞれ求めよ。\n(2) 相空間の変数 $X = \\sqrt{M}V, Y = \\sqrt{m}v$ および角度 $\\tan\\theta = \\sqrt{\\frac{m}{M}}$ を定義する。力学的エネルギー保存則より点 $\\mathrm{P}(X, Y)$ が半径 $R = \\sqrt{M}v_0$ の円周上にあることを示し、壁との衝突および $\\mathrm{A}$-$\\mathrm{B}$ 間の衝突によって点 $\\mathrm{P}$ が円周上を角度 $2\\theta$ ずつ切り取っていく理由を円周角の定理から説明せよ。\n(3) 衝突の終了条件 $0 \\le v \\le V$ を相空間の扇形領域として表し、総衝突回数 $N$ が $N = \\lfloor \\frac{\\pi}{\\theta} \\rfloor$（$\\frac{\\pi}{\\theta}$ が整数のときは $\\frac{\\pi}{\\theta}-1$）となることを示せ。\n(4) 質量比を $M = 100^k m$（$k = 0, 1, 2, 3$）としたときの総衝突回数 $N$ を求め、なぜ衝突回数に円周率 $\\pi = 3.14159...$ の数字が現れるのかその物理的本質を説明せよ。',
      hint: 'スケール変換 $X = \\sqrt{M}V, Y = \\sqrt{m}v$ により、運動エネルギー保存則が真円 $X^2 + Y^2 = R^2$ になります。壁衝突は $X$ 軸対称な移動、ブロック間衝突は傾き $-\\frac{1}{\\tan\\theta}$ の弦となり、2本の弦のなす円周角 $\\theta$ から中心角 $2\\theta$ が導かれます。半周 $\\pi$ を刻み幅 $\\theta \\approx 10^{-k}$ で測る割り算です。',
      level: 10,
      answer: '(1) $M=m \\implies N=3$, $M=3m \\implies N=5$  (2) $X^2+Y^2 = Mv_0^2 = R^2$。壁衝突の弦（鉛直）とA-B衝突の弦（傾き $-1/\\tan\\theta$）のなす円周角が $\\theta$ となり、円周角の定理より中心角は $2\\theta$  (3) 終了領域: $0 \\le Y \\le X\\tan\\theta$（中心角 $\\theta$ の扇形）。$N = \\lfloor \\frac{\\pi}{\\theta} \\rfloor$（整数時は $-1$）  (4) $k=0 \\implies N=3$, $k=1 \\implies N=31$, $k=2 \\implies N=314$, $k=3 \\implies N=3141$。エネルギー保存則が作る半周 $\\pi$ の円を、運動量保存則が作るステップ幅 $\\theta \\approx 10^{-k}$ の物差しで測る割り算 $\\frac{\\pi}{10^{-k}} = \\pi \\times 10^k$ に帰着するため。',
      explanation: '【(1) 具体的な質量比での追跡】\n完全弾性衝突の公式 $v\' = \\frac{(m-M)v + 2MV}{m+M}, V\' = \\frac{2mv + (M-m)V}{m+M}$。\n$M = m$ のとき：\n1回目(A-B): $(v_1, V_1) = (-v_0, 0)$\n2回目(壁): $(v_2, V_2) = (+v_0, 0)$\n3回目(A-B): $(v_3, V_3) = (0, +v_0)$ $\\implies$ 終了（$N = 3$）。\n$M = 3m$ のとき：\n順に $(-\\frac{3}{2}v_0, -\\frac{1}{2}v_0) \\to (+\\frac{3}{2}v_0, -\\frac{1}{2}v_0) \\to (-\\frac{3}{2}v_0, +\\frac{1}{2}v_0) \\to (+\\frac{3}{2}v_0, +\\frac{1}{2}v_0) \\to (0, +v_0)$ $\\implies$ 終了（$N = 5$）。\n\n【(2) 相空間への座標変換と円周角】\n力学的エネルギー保存則：\n$$\\frac{1}{2}M V^2 + \\frac{1}{2}m v^2 = \\frac{1}{2}M v_0^2 \\iff X^2 + Y^2 = M v_0^2 = R^2$$\n運動量保存則 $MV + mv = MV\' + mv\' \\iff \\sqrt{M}X + \\sqrt{m}Y = \\text{一定}$。\n弦の傾きは $-\\sqrt{\\frac{M}{m}} = -\\frac{1}{\\tan\\theta}$。\n壁衝突の弦（鉛直、傾き $\\infty$）とのなす角（円周角）は常に $\\theta$。\n円周角の定理より、円周から切り取られる弧の中心角は常に $2\\theta$ となります。\n\n【(3) 終了条件と総衝突回数】\n$0 \\le v \\le V \\iff 0 \\le \\frac{Y}{\\sqrt{m}} \\le \\frac{X}{\\sqrt{M}} \\iff 0 \\le Y \\le X\\tan\\theta$。\nこれは第1象限の開き角 $\\theta$ の扇形領域です。\n鏡像法により円周を展開すると、1衝突ごとに角度 $\\theta$ ずつ進むため、半周（中心角 $\\pi$）を角度 $\\theta$ で割った回数：\n$$N = \\left\\lfloor \\frac{\\pi}{\\theta} \\right\\rfloor \\quad (\\text{整数のときは } \\frac{\\pi}{\\theta}-1)$$\n\n【(4) 円周率の出現】\n$M = 100^k m \\implies \\tan\\theta = 10^{-k} \\implies \\theta \\approx 10^{-k}$。\n$$N = \\left\\lfloor \\frac{\\pi}{10^{-k}} \\right\\rfloor = \\lfloor \\pi \\times 10^k \\rfloor$$\n$k=0: N = 3$\n$k=1: N = 31$\n$k=2: N = 314$\n$k=3: N = 3141$\n$k=4: N = 31415$\nエネルギー保存則が作る「半周 $\\pi$ の円」を、運動量保存則が作る「ステップ幅 $\\theta \\approx 10^{-k}$ の物差し」で何回測れるかという割り算 $\\frac{\\pi}{10^{-k}} = \\pi \\times 10^k$ に対応するため、円周率の各桁の数字がそのまま衝突回数として出現します。',
      solutionFormulas: [
        { title: '相空間エネルギー保存円', latex: 'X^2 + Y^2 = M v_0^2', note: 'X = \\sqrt{M}V, Y = \\sqrt{m}v の直交円' },
        { title: '衝突回数一般式', latex: 'N = \\left\\lfloor \\frac{\\pi}{\\theta} \\right\\rfloor', note: '\\tan\\theta = \\sqrt{m/M} による半周の幾何学的分割' },
        { title: 'ガルペリンのπ出現', latex: 'N = \\lfloor \\pi \\times 10^k \\rfloor', note: '質量比 M/m = 100^k のときの円周率桁数一致' }
      ]
    }));
  }

  // 厳選・難関大／共通テスト標準〜発展レベルの入試典型良問ジェネレーター群
  const generators = [
    // 1. 動く台車と小球の滑走・水平面での一体化（運動量保存と力学的エネルギー保存）
    () => {
      const M = [2.0, 3.0, 4.0, 5.0][Math.floor(Math.random() * 4)];
      const m = [1.0, 1.5, 2.0][Math.floor(Math.random() * 3)];
      const R = [0.4, 0.8, 1.2][Math.floor(Math.random() * 3)];
      const g = 9.8;
      
      const v_rel = Math.sqrt((2 * (M + m) * g * R) / M).toFixed(2);
      const V_cart = (-Math.sqrt((2 * m * m * g * R) / (M * (M + m)))).toFixed(2);
      const v_ball = Math.sqrt((2 * M * g * R) / (M + m)).toFixed(2);
      const Q_heat = (m * g * R).toFixed(1);
      const mu = 0.2;
      const d_slide = (R / mu).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'two-body-problem',
        category: '運動量保存則と重心系・2体問題',
        title: `動く台車上の曲面滑走と水平面での摩擦停止 (台車 M = ${M} kg, 小球 m = ${m} kg)`,
        prompt: `なめらかな水平床上に質量 $M = ${M}\\ \\text{kg}$ の台車が静止している。台車の上面は半径 $R = ${R}\\ \\text{m}$ のなめらかな四分円弧面 AB と、それに続く動摩擦係数 $\\mu = ${mu}$ の粗い水平面 BC からなる。四分円の頂点 A から質量 $m = ${m}\\ \\text{kg}$ の小球を静かに離した。重力加速度の大きさを $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 小球が最下点 B を通過する瞬間の、床に対する台車の速度 $V_B$ および小球の速度 $v_B$ を求めよ（右向きを正とする）。\n(2) 小球は面 BC 上を滑走したのち、台車に対して静止した。この間に摩擦によって発生した熱量 $Q$ と、小球が台車上を滑った距離 $d$ を求めよ。`,
        hint: `水平方向には外力が働かないため、小球と台車を合わせた系において水平方向の全運動量が常に保存されます。四分円面はなめらかなので力学的エネルギーも保存されます。(2) では台車と小球が一体となった後の床に対する速度を求め、エネルギー収支を立てます。`,
        level: 7,
        answer: `(1) 台車速度: $V_B = ${V_cart}\\ \\text{m/s}$, 小球速度: $v_B = +${v_ball}\\ \\text{m/s}$  (2) 摩擦熱: $Q = ${Q_heat}\\ \\text{J}$, 相対滑走距離: $d = ${d_slide}\\ \\text{m}$`,
        explanation: `【物理的着眼点】\n台車と小球の間には垂直抗力（内力）のみが水平方向に作用するため、外力が働かない水平方向の運動量が保存されます。\n\n【(1) 最下点通過時の立式】\n水平方向の運動量保存則より：\n$$m v_B + M V_B = 0 \\implies v_B = -\\frac{M}{m} V_B$$\n曲面での力学的エネルギー保存則より：\n$$mgR = \\frac{1}{2}m v_B^2 + \\frac{1}{2}M V_B^2$$\n$v_B$ を消去して整理すると：\n$$mgR = \\frac{1}{2}M\\left(1 + \\frac{M}{m}\\right) V_B^2 = \\frac{M(M+m)}{2m} V_B^2$$\n台車は左向き（負の向き）に反作用を受けるので：\n$$V_B = -\\sqrt{\\frac{2m^2 gR}{M(M+m)}} = ${V_cart}\\ \\text{m/s}$$\n$$v_B = \\sqrt{\\frac{2MgR}{M+m}} = +${v_ball}\\ \\text{m/s}$$\n\n【(2) 一体化と摩擦熱】\n一体となった後の速度を $V'$ とすると、運動量保存則より $(M+m)V' = 0 \\implies V' = 0$ となり、両者は床に対して完全に静止します。\nエネルギー収支より、初期の位置エネルギーがすべて摩擦熱 $Q$ に転化します：\n$$Q = mgR = ${m} \\times 9.8 \\times ${R} = ${Q_heat}\\ \\text{J}$$\n動摩擦力 $\\mu mg$ が相対距離 $d$ だけ仕事をしたので：\n$$W = \\mu mg d = Q \\implies d = \\frac{R}{\\mu} = \\frac{${R}}{${mu}} = ${d_slide}\\ \\text{m}$$`,
        solutionFormulas: [
          { title: '水平方向の運動量保存則', latex: 'm v_x + M V_x = 0', note: '水平外力ゼロの系で成立' },
          { title: '力学的エネルギー保存則', latex: 'mgR = \\frac{1}{2}mv_B^2 + \\frac{1}{2}MV_B^2', note: '非保存力が仕事をしない区間で成立' },
          { title: '摩擦熱と相対仕事', latex: 'Q = \\mu mg d_{\\text{相対}}', note: '動摩擦力の大きさと相対滑走距離の積' }
        ]
      });
    },

    // 2. 鉛直面内の円運動と軌道面からの離脱角
    () => {
      const R = [1.0, 1.5, 2.0, 2.5][Math.floor(Math.random() * 4)];
      const g = 9.8;
      const cosTheta = (2 / 3).toFixed(3);
      const v_leave = Math.sqrt((2 / 3) * g * R).toFixed(2);
      const h_leave = ((2 / 3) * R).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'vertical-circle',
        category: '円運動と万有引力',
        title: `なめらかな半球面の頂点からの滑落と離脱条件 (球半径 R = ${R} m)`,
        prompt: `半径 $R = ${R}\\ \\text{m}$ のなめらかな半球が水平床上に固定されている。その最頂点に質量 $m$ の小球を置き、初速度をほぼ $0$ として静かに滑らせた。重力加速度の大きさを $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 頂点から測った中心角が $\\theta$ の位置における小球の速さ $v(\\theta)$ および面から受ける垂直抗力 $N(\\theta)$ を求めよ。\n(2) 小球が球面から離れる瞬間の中心角 $\\theta$ に対する $\\cos\\theta$ の値、およびそのときの小球の高さ $h$（床からの高さ）と速さ $v$ を求めよ。`,
        hint: `頂点と角度 $\\theta$ の位置の間で力学的エネルギー保存則を立てます。円運動の法線（中心）方向の運動方程式 $m\\frac{v^2}{R} = mg\\cos\\theta - N$ を立て、面から離れる条件 $N = 0$ を課します。`,
        level: 7,
        answer: `(1) $v = \\sqrt{2gR(1-\\cos\\theta)}$, $N = mg(3\\cos\\theta - 2)$  (2) $\\cos\\theta = \\frac{2}{3} \\approx ${cosTheta}$, 高さ $h = ${h_leave}\\ \\text{m}$, 速さ $v = ${v_leave}\\ \\text{m/s}$`,
        explanation: `【(1) 速さと垂直抗力の導出】\n頂点を基準とした高さの低下量は $R(1 - \\cos\\theta)$ であるため、力学的エネルギー保存則より：\n$$mgR(1 - \\cos\\theta) = \\frac{1}{2}m v^2 \\implies v = \\sqrt{2gR(1 - \\cos\\theta)}$$\n\n中心向きを正とする円運動の法線方向の運動方程式：\n$$m\\frac{v^2}{R} = mg\\cos\\theta - N$$\n$v^2$ を代入すると：\n$$N = mg\\cos\\theta - m\\frac{2gR(1 - \\cos\\theta)}{R} = mg(3\\cos\\theta - 2)$$\n\n【(2) 離脱条件】\n小球が面から離れる瞬間は垂直抗力が $0$ となるため：\n$$N = mg(3\\cos\\theta - 2) = 0 \\implies \\cos\\theta = \\frac{2}{3}$$\n\nこのときの床からの高さ $h$ は：\n$$h = R\\cos\\theta = \\frac{2}{3}R = ${h_leave}\\ \\text{m}$$\n速さは：\n$$v = \\sqrt{2gR\\left(1 - \\frac{2}{3}\\right)} = \\sqrt{\\frac{2}{3}gR} = ${v_leave}\\ \\text{m/s}$$`,
        solutionFormulas: [
          { title: '円運動の運動方程式（法線方向）', latex: 'm\\frac{v^2}{R} = \\Sigma F_{\\text{中心}}', note: '中心向き合力 = 向心力' },
          { title: '離脱条件', latex: 'N = 0', note: '拘束面から受ける垂直抗力がゼロになる瞬間' }
        ]
      });
    },

    // 3. 2物体とばねの連成単振動（重心系と換算質量）
    () => {
      const m1 = [1.0, 2.0][Math.floor(Math.random() * 2)];
      const m2 = [2.0, 3.0][Math.floor(Math.random() * 2)];
      const k = [100, 200, 300][Math.floor(Math.random() * 3)];
      const v0 = [2.0, 3.0, 4.0][Math.floor(Math.random() * 3)];

      const vG = ((m1 * v0) / (m1 + m2)).toFixed(2);
      const mu = (m1 * m2) / (m1 + m2);
      const xMax = (v0 * Math.sqrt(mu / k)).toFixed(3);
      const period = (2 * Math.PI * Math.sqrt(mu / k)).toFixed(3);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'two-body-problem',
        category: '単振動と2体問題',
        title: `ばねで連結された2物体の運動と最大縮み (m1 = ${m1} kg, m2 = ${m2} kg, k = ${k} N/m)`,
        prompt: `なめらかな水平面上に質量 $m_1 = ${m1}\\ \\text{kg}$ の物体Aと、$m_2 = ${m2}\\ \\text{kg}$ の物体Bがばね定数 $k = ${k}\\ \\text{N/m}$ の軽いばねで結ばれて静止している。時刻 $t = 0$ に物体Aに右向きの初速度 $v_0 = ${v0}\\ \\text{m/s}$ を与えた。\n(1) 系全体の重心の速度 $v_G$ を求めよ。\n(2) ばねが最も縮んだときの縮み量 $x_{\\max}$ を求めよ。\n(3) 重心から見た各物体の単振動の周期 $T$ を求めよ。`,
        hint: `水平方向には外力が働かないため、重心は等速直線運動を続けます。ばねが最大に縮んだ瞬間、2物体の床に対する速度はともに重心速度 $v_G$ に一致します。換算質量 $\\mu = \\frac{m_1 m_2}{m_1 + m_2}$ を用いると相対運動を明快に解析できます。`,
        level: 8,
        answer: `(1) 重心速度: $v_G = ${vG}\\ \\text{m/s}$  (2) 最大縮み: $x_{\\max} = ${xMax}\\ \\text{m}$  (3) 周期: $T = ${period}\\ \\text{s}$`,
        explanation: `【(1) 重心速度】\n系に水平外力が作用しないため、全運動量は常に保存されます：\n$$(m_1 + m_2)v_G = m_1 v_0 \\implies v_G = \\frac{m_1 v_0}{m_1 + m_2} = \\frac{${m1} \\times ${v0}}{${m1}+${m2}} = ${vG}\\ \\text{m/s}$$\n\n【(2) ばねの最大縮み】\nばねが最大に縮んだ瞬間、2物体の相対速度は $0$ となり、両者とも速度 $v_G$ で動いています。\n力学的エネルギー保存則より：\n$$\\frac{1}{2}m_1 v_0^2 = \\frac{1}{2}(m_1 + m_2)v_G^2 + \\frac{1}{2}k x_{\\max}^2$$\n重心運動のエネルギーを引いた内部エネルギー（相対運動のエネルギー）は換算質量 $\\mu = \\frac{m_1 m_2}{m_1 + m_2}$ を用いて：\n$$\\frac{1}{2}\\mu v_0^2 = \\frac{1}{2}k x_{\\max}^2 \\implies x_{\\max} = v_0\\sqrt{\\frac{\\mu}{k}} = ${v0}\\sqrt{\\frac{${mu.toFixed(2)}}{${k}}} = ${xMax}\\ \\text{m}$$\n\n【(3) 振動周期】\n相対変位 $x = x_A - x_B$ に対する運動方程式は $\\mu \\frac{d^2 x}{dt^2} = -kx$ と表せるため、角振動数は $\\omega = \\sqrt{\\frac{k}{\\mu}}$ となります。\n$$T = \\frac{2\\pi}{\\omega} = 2\\pi \\sqrt{\\frac{\\mu}{k}} = ${period}\\ \\text{s}$$`,
        solutionFormulas: [
          { title: '換算質量', latex: '\\mu = \\frac{m_1 m_2}{m_1 + m_2}', note: '2体問題の相対運動を1体問題に帰着' },
          { title: '相対運動の単振動周期', latex: 'T = 2\\pi\\sqrt{\\frac{\\mu}{k}}', note: '重心から見た振動の周期' }
        ]
      });
    },

    // 4. 板上の物体の運動と一体化（2段重ね、摩擦熱）
    () => {
      const M = [3.0, 4.0, 5.0][Math.floor(Math.random() * 3)];
      const m = [1.0, 2.0][Math.floor(Math.random() * 2)];
      const mu_s = 0.4;
      const mu_k = 0.25;
      const g = 9.8;

      const F_crit = (mu_s * (M + m) * g).toFixed(1);
      const F_pull = (parseFloat(F_crit) * 1.5).toFixed(1);
      const a_m = (mu_k * g).toFixed(2);
      const a_M = ((parseFloat(F_pull) - mu_k * m * g) / M).toFixed(2);
      const a_rel = (parseFloat(a_M) - parseFloat(a_m)).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'friction',
        category: '摩擦力と連結物体',
        title: `2段重ね物体の滑り出し限界と相対加速度 (板 M = ${M} kg, 小物体 m = ${m} kg)`,
        prompt: `なめらかな水平床上に質量 $M = ${M}\\ \\text{kg}$ の長い板Bを置き、その上に質量 $m = ${m}\\ \\text{kg}$ の小物体Aを載せる。AとBの間の静止摩擦係数を $\\mu_s = ${mu_s}$、動摩擦係数を $\\mu_k = ${mu_k}$、重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。板Bを水平右向きに力 $F$ で引っ張る。\n(1) AがBの上を滑ることなく、一体となって加速するための力 $F$ の最大値 $F_{\\text{crit}}$ を求めよ。\n(2) 引っ張る力を $F = ${F_pull}\\ \\text{N}$ としたとき、床から見たAの加速度 $a_A$、板Bの加速度 $a_B$、およびBに対するAの相対加速度 $a_{\\text{rel}}$ を求めよ。`,
        hint: `(1) Aを加速させている力はAとBの間の静止摩擦力です。Aの最大加速度は $\\mu_s g$ となり、これに全体の質量を乗じます。(2) 滑りが生じているとき、AとBの間には大きさ $\\mu_k mg$ の動摩擦力が作用します。`,
        level: 6,
        answer: `(1) 最大外力: $F_{\\text{crit}} = ${F_crit}\\ \\text{N}$  (2) Aの加速度: $a_A = ${a_m}\\ \\text{m/s}^2$, 板Bの加速度: $a_B = ${a_M}\\ \\text{m/s}^2$, 相対加速度: $a_{\\text{rel}} = -${a_rel}\\ \\text{m/s}^2$（板に対して後方へ）`,
        explanation: `【(1) 一体となって加速する限界力】\n小物体Aが受ける水平力は静止摩擦力 $f$ のみです。\nAの運動方程式：$m a = f \\le \\mu_s mg \\implies a \\le \\mu_s g = ${mu_s} \\times 9.8 = ${(mu_s * 9.8).toFixed(2)}\\ \\text{m/s}^2$\n系全体の運動方程式より：\n$$F = (M + m)a \\le (M + m)\\mu_s g = (${M} + ${m}) \\times ${mu_s} \\times 9.8 = ${F_crit}\\ \\text{N}$$\n\n【(2) $F = ${F_pull}\\ \\text{N}$ のときの運動】\n$F > F_{\\text{crit}}$ であるためAはBの上を滑ります。AとBの間には動摩擦力 $f_k = \\mu_k mg = ${mu_k} \\times ${m} \\times 9.8 = ${(mu_k * m * g).toFixed(2)}\\ \\text{N}$ が働きます。\n\nAの運動方程式（右向き正）：\n$$m a_A = f_k = \\mu_k mg \\implies a_A = \\mu_k g = ${a_m}\\ \\text{m/s}^2$$\n\n板Bの運動方程式（右向き正）：\n$$M a_B = F - f_k = ${F_pull} - ${(mu_k * m * g).toFixed(2)} \\implies a_B = \\frac{${(parseFloat(F_pull) - mu_k * m * g).toFixed(2)}}{${M}} = ${a_M}\\ \\text{m/s}^2$$\n\nBから見たAの相対加速度：\n$$a_{\\text{rel}} = a_A - a_B = ${a_m} - ${a_M} = -${a_rel}\\ \\text{m/s}^2$$（左向き）`,
        solutionFormulas: [
          { title: '最大静止摩擦力', latex: 'f_{\\max} = \\mu_s N = \\mu_s mg', note: '滑り出さない限界条件' },
          { title: '動摩擦力の作用', latex: 'f_k = \\mu_k N', note: '相対滑り運動中に働く一定の抵抗力' }
        ]
      });
    },

    // 5. 粗い斜面上の直方体の滑り出しと転倒限界（剛体のつり合い）
    () => {
      const w = [0.2, 0.3, 0.4][Math.floor(Math.random() * 3)];
      const h = [0.5, 0.6, 0.8][Math.floor(Math.random() * 3)];
      const mu = [0.4, 0.5, 0.6][Math.floor(Math.random() * 3)];

      const tanSlip = mu.toFixed(2);
      const tanTopple = (w / h).toFixed(2);
      const willToppleFirst = parseFloat(tanTopple) < parseFloat(tanSlip);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'toppling',
        category: '剛体のつり合いと力のモーメント',
        title: `粗い斜面上の直方体における滑り出しと転倒限界の比較 (幅 ${w} m, 高さ ${h} m)`,
        prompt: `水平面となす角 $\\theta$ を自由に変えられる粗い斜面上に、幅 $w = ${w}\\ \\text{m}$、高さ $h = ${h}\\ \\text{m}$ の一様な直方体（質量 $m$）を置いた。直方体と斜面との間の静止摩擦係数を $\\mu = ${mu}$ とする。斜面の傾角 $\\theta$ を $0$ から徐々に大きくしていく。\n(1) 直方体が斜面を滑り出す限界の傾角 $\\theta_1$ に対する $\\tan\\theta_1$ を求めよ。\n(2) 直方体が斜面上で倒れる（転倒する）限界の傾角 $\\theta_2$ に対する $\\tan\\theta_2$ を求めよ。\n(3) この直方体は、傾角を大きくしたとき「先に滑り出す」か「先に転倒する」か理由とともに判定せよ。`,
        hint: `滑り出しの限界は斜面平行方向の力のつり合い $mg\\sin\\theta = \\mu mg\\cos\\theta$ より求まります。転倒の限界は、直方体の底面の最下端の角を中心とする力のモーメントのつり合いにおいて、垂直抗力の作用点がその角に達する臨界条件から求まります。`,
        level: 6,
        answer: `(1) $\\tan\\theta_1 = ${tanSlip}$  (2) $\\tan\\theta_2 = \\frac{w}{h} = ${tanTopple}$  (3) ${willToppleFirst ? '先に転倒する' : '先に滑り出す'}（$\\tan\\theta_2 ${willToppleFirst ? '<' : '>'} \\tan\\theta_1$ より）`,
        explanation: `【(1) 滑り出しの限界角】\n直方体が滑らないための条件は、静止摩擦力 $F = mg\\sin\\theta$ が最大静止摩擦力 $\\mu N = \\mu mg\\cos\\theta$ 以下であることです：\n$$mg\\sin\\theta \\le \\mu mg\\cos\\theta \\implies \\tan\\theta_1 = \\mu = ${tanSlip}$$\n\n【(2) 転倒の限界角】\n直方体が倒れるとき、底面最下端の点 P を回転軸として倒れます。重力の作用線が点 P を越えると転倒します。\n点 P まわりの重力のモーメントのつり合い（時計回りと反時計回り）：\n$$(mg\\sin\\theta)\\times \\frac{h}{2} = (mg\\cos\\theta)\\times \\frac{w}{2} \\implies \\tan\\theta_2 = \\frac{w}{h} = \\frac{${w}}{${h}} = ${tanTopple}$$\n\n【(3) 判定】\n$\\tan\\theta_1 = ${tanSlip}$ と $\\tan\\theta_2 = ${tanTopple}$ を比較すると：\n${willToppleFirst ? `$\\tan\\theta_2 (${tanTopple}) < \\tan\\theta_1 (${tanSlip})$ であるため、傾角を増すと滑り出す前に転倒条件に達し、【先に転倒する】。` : `$\\tan\\theta_1 (${tanSlip}) < \\tan\\theta_2 (${tanTopple})$ であるため、傾角を増すと転倒する前に最大摩擦力を越え、【先に滑り出す】。`}`,
        solutionFormulas: [
          { title: '滑り出し条件', latex: '\\tan\\theta_1 = \\mu', note: '摩擦角に等しい' },
          { title: '転倒限界条件', latex: '\\tan\\theta_2 = \\frac{w}{h}', note: '重力の作用線が支持基底面の端を通る臨界点' }
        ]
      });
    },

    // 6. 斜面への斜方投射と垂直衝突条件
    () => {
      const theta = 30; // 斜面傾角
      const g = 9.8;
      const v0 = [14.0, 19.6, 24.5][Math.floor(Math.random() * 3)];
      const radTheta = theta * Math.PI / 180;
      
      // 垂直着地条件: tan(theta)*tan(alpha) = 1/2 => tan(alpha) = 1 / (2*tan(30)) = sqrt(3)/2 approx 0.866 => alpha ~ 40.9 deg
      const tanAlpha = (1 / (2 * Math.tan(radTheta))).toFixed(3);
      const alphaDeg = (Math.atan(parseFloat(tanAlpha)) * 180 / Math.PI).toFixed(1);
      const T_flight = ((2 * v0 * Math.sin(parseFloat(alphaDeg) * Math.PI / 180)) / (g * Math.cos(radTheta))).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'projectile-motion',
        category: '斜方投射と平面運動',
        title: `傾斜角 ${theta}° の斜面に対する斜方投射と斜面への垂直衝突条件`,
        prompt: `傾斜角 $\\theta = ${theta}^\\circ$ のなめらかな斜面の最下端 O から、斜面に対して上方に角度 $\\alpha$、初速度 $v_0 = ${v0}\\ \\text{m/s}$ で小球を打ち上げた。重力加速度の大きさを $g = 9.8\\ \\text{m/s}^2$ とする。小球が斜面上の点 P に落下したとき、斜面に垂直に衝突した。\n(1) 打ち上げから点 P に着地するまでの飛行時間 $T$ を $v_0, \\alpha, \\theta, g$ を用いて表せ。\n(2) 小球が斜面に垂直に衝突するための打ち上げ角 $\\alpha$ が満たす関係式 $\\tan\\alpha$ を $\\theta$ を用いて表し、その値を求めよ。\n(3) 飛行時間 $T$ の数値を求めよ。`,
        hint: `斜面に平行な方向を $x$ 軸（登る向き正）、斜面に垂直な方向を $y$ 軸（斜面から離れる向き正）に取ります。重力加速度を成分分解すると $g_x = -g\\sin\\theta$、$g_y = -g\\cos\\theta$ となります。「斜面に垂直に衝突する」とは、着地瞬間に $x$ 方向の速度成分が $0$（$v_x = 0$）になることを意味します。`,
        level: 7,
        answer: `(1) $T = \\frac{2v_0 \\sin\\alpha}{g\\cos\\theta}$  (2) $\\tan\\alpha = \\frac{1}{2\\tan\\theta} = ${tanAlpha}$ ($\\alpha \\approx ${alphaDeg}^\\circ$)  (3) $T = ${T_flight}\\ \\text{s}$`,
        explanation: `【(1) 飛行時間 $T$ の導出】\n斜面に沿った方向を $x$ 軸、斜面に垂直な上向きを $y$ 軸とします。\n初速度ベクトル：$v_{0x} = v_0\\cos\\alpha$, $v_{0y} = v_0\\sin\\alpha$\n加速度ベクトル：$a_x = -g\\sin\\theta$, $a_y = -g\\cos\\theta$\n\n$y$ 方向の運動は等加速度運動であり、斜面に着地する時刻 $T$ では $y = 0$ となります：\n$$y(T) = v_{0y} T + \\frac{1}{2}a_y T^2 = (v_0\\sin\\alpha)T - \\frac{1}{2}(g\\cos\\theta)T^2 = 0$$\n$T > 0$ より：\n$$T = \\frac{2v_0\\sin\\alpha}{g\\cos\\theta}$$\n\n【(2) 垂直衝突の条件】\n斜面に垂直に衝突するとき、斜面平行方向の速度が $0$ になります：\n$$v_x(T) = v_{0x} + a_x T = v_0\\cos\\alpha - (g\\sin\\theta)T = 0$$\n(1) の $T$ を代入すると：\n$$v_0\\cos\\alpha - g\\sin\\theta \\cdot \\frac{2v_0\\sin\\alpha}{g\\cos\\theta} = 0$$\n$$v_0\\cos\\alpha = 2 v_0 \\sin\\alpha \\tan\\theta \\implies 2\\tan\\alpha\\tan\\theta = 1$$\n$$\\tan\\alpha = \\frac{1}{2\\tan\\theta} = \\frac{1}{2\\tan ${theta}^\\circ} = \\frac{\\sqrt{3}}{2} \\approx ${tanAlpha}$$\n\n【(3) 飛行時間の計算】\n$\\alpha \\approx ${alphaDeg}^\\circ$ より、$\\sin\\alpha = \\frac{\\tan\\alpha}{\\sqrt{1+\\tan^2\\alpha}} = \\frac{\\sqrt{3}/2}{\\sqrt{1+3/4}} = \\sqrt{\\frac{3}{7}} \\approx 0.655$\n$$T = \\frac{2 \\times ${v0} \\times 0.655}{9.8 \\times \\cos 30^\\circ} = ${T_flight}\\ \\text{s}$$`,
        solutionFormulas: [
          { title: '斜面座標系における滞空時間', latex: 'T = \\frac{2v_0\\sin\\alpha}{g\\cos\\theta}', note: '斜面垂直方向の等加速度運動より' },
          { title: '斜面への垂直衝突条件', latex: '\\tan\\alpha\\tan\\theta = \\frac{1}{2}', note: '着地時に斜面平行方向速度がゼロ' }
        ]
      });
    },

    // 7. 動滑車と連結物体の束縛運動
    () => {
      const mA = [2.0, 3.0, 4.0][Math.floor(Math.random() * 3)];
      const mB = [1.0, 2.0, 3.0][Math.floor(Math.random() * 3)];
      const g = 9.8;

      // Aが定滑車から吊り下がり、Bが動滑車に吊り下がる系
      // 糸の長さ: yA + 2*yB = const => aA = 2*aB
      // mA*g - T = mA*aA
      // 2T - mB*g = mB*aB = mB*(aA/2) => 4T - 2mB*g = mB*aA
      // 4*(mA*g - mA*aA) - 2mB*g = mB*aA => (4mA + mB)*aA = (4mA - 2mB)*g
      const num = 4 * mA - 2 * mB;
      const den = 4 * mA + mB;
      const aA = ((num / den) * g).toFixed(2);
      const aB = (parseFloat(aA) / 2).toFixed(2);
      const T = (mA * (g - parseFloat(aA))).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'constraint-motion',
        category: '運動の法則と束縛条件',
        title: `動滑車を用いた連結物体の運動方程式 (mA = ${mA} kg, mB = ${mB} kg)`,
        prompt: `天井に固定された定滑車と、自由に動く動滑車がある。質量 $m_A = ${mA}\\ \\text{kg}$ の物体Aが糸の一端に結ばれ、糸は定滑車を経て動滑車をくぐり、他端が天井に固定されている。動滑車には質量 $m_B = ${mB}\\ \\text{kg}$ の物体Bが吊り下げられている。滑車と糸の質量および摩擦は無視できるものとし、重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 物体Aの加速度 $a_A$（下向き正）と物体Bの加速度 $a_B$（上向き正）の間に成り立つ関係式（束縛条件）を求めよ。\n(2) 糸の張力 $T$ および加速度 $a_A, a_B$ を求めよ。`,
        hint: `糸全体の長さが一定であることから、Aの変位 $\\Delta y_A$ とBの変位 $\\Delta y_B$ の幾何学的関係を立式します。Aが $2h$ 下がると動滑車（B）は $h$ 上がるため $a_A = 2a_B$ となります。それぞれの物体について運動方程式を立てて連立します。`,
        level: 6,
        answer: `(1) $a_A = 2a_B$  (2) $a_A = ${aA}\\ \\text{m/s}^2$, $a_B = ${aB}\\ \\text{m/s}^2$, 張力 $T = ${T}\\ \\text{N}$`,
        explanation: `【(1) 束縛条件の導出】\n天井を基準としたAの鉛直座標を $y_A$、動滑車（B）の座標を $y_B$ とすると、糸の全長 $L$ は：\n$$y_A + 2y_B = L \\implies \\frac{d^2 y_A}{dt^2} + 2\\frac{d^2 y_B}{dt^2} = 0$$\nしたがって、Aの下向き加速度を $a_A$、Bの上向き加速度を $a_B$ とすると：\n$$a_A = 2a_B$$\n\n【(2) 運動方程式と連立】\nAの運動方程式（下向き正）：\n$$m_A a_A = m_A g - T$$\n\nBの運動方程式（上向き正）：動滑車には上向きに2本の糸の張力 $2T$ が作用するため：\n$$m_B a_B = 2T - m_B g \\implies m_B\\left(\\frac{a_A}{2}\\right) = 2T - m_B g$$\n両辺を2倍すると：\n$$m_B a_A = 4T - 2m_B g$$\n\nAの式より $T = m_A(g - a_A)$ を代入すると：\n$$m_B a_A = 4m_A(g - a_A) - 2m_B g$$\n$$(4m_A + m_B)a_A = (4m_A - 2m_B)g$$\n$$a_A = \\frac{4(${mA}) - 2(${mB})}{4(${mA}) + ${mB}} g = \\frac{${num}}{${den}} \\times 9.8 = ${aA}\\ \\text{m/s}^2$$\n$$a_B = \\frac{a_A}{2} = ${aB}\\ \\text{m/s}^2$$\n$$T = m_A (g - a_A) = ${mA} \\times (9.8 - ${aA}) = ${T}\\ \\text{N}$$`,
        solutionFormulas: [
          { title: '動滑車の変位・加速度拘束式', latex: 'a_A = 2a_B', note: '糸の全長一定の幾何学的束縛条件' },
          { title: '動滑車の合力関係', latex: 'F_{\\text{合}} = 2T - m_B g', note: '左右2本の糸による張力寄与' }
        ]
      });
    },

    // 8. 万有引力・楕円軌道とケプラー則（ホーマン遷移・近日点速度）
    () => {
      const G = 6.67e-11;
      const M_earth = 5.97e24; // 地球質量
      const R_earth = 6.4e6;   // 地球半径 6400 km
      const h1_km = 600;       // 近日点高度 600 km
      const h2_km = 3600;      // 遠日点高度 3600 km
      
      const r1 = R_earth + h1_km * 1000; // 7.0e6 m
      const r2 = R_earth + h2_km * 1000; // 10.0e6 m
      const GM = 3.98e14; // G * M

      // v1 * r1 = v2 * r2 => v2 = v1 * (r1 / r2)
      // 0.5 * v1^2 - GM / r1 = 0.5 * (v1 * r1/r2)^2 - GM / r2
      // 0.5 * v1^2 * (1 - (r1/r2)^2) = GM * (1/r1 - 1/r2) = GM * (r2 - r1) / (r1 * r2)
      // 0.5 * v1^2 * (r2^2 - r1^2) / r2^2 = GM * (r2 - r1) / (r1 * r2)
      // v1^2 = 2 * GM * r2 / (r1 * (r1 + r2))
      const v1 = Math.sqrt((2 * GM * r2) / (r1 * (r1 + r2)));
      const v2 = (v1 * r1) / r2;
      const v1_kms = (v1 / 1000).toFixed(2);
      const v2_kms = (v2 / 1000).toFixed(2);
      const a_orbit = (r1 + r2) / 2;
      const T_sec = (2 * Math.PI * Math.sqrt(Math.pow(a_orbit, 3) / GM)).toFixed(0);
      const T_min = (parseFloat(T_sec) / 60).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'gravitation-kepler',
        category: '万有引力とケプラーの法則',
        title: `人工衛星の楕円軌道における近日点・遠日点速度と軌道周期`,
        prompt: `地球（質量 $M = 5.97\\times 10^{24}\\ \\text{kg}$、半径 $R = 6.40\\times 10^6\\ \\text{m}$）の周りを楕円軌道で周回する質量 $m$ の探査機がある。近地点（地球に最も近い点）の地表からの高度は $h_1 = ${h1_km}\\ \\text{km}$、遠地点（最も遠い点）の高度は $h_2 = ${h2_km}\\ \\text{km}$ である。万有引力定数を $G = 6.67\\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$（$GM = 3.98\\times 10^{14}\\ \\text{m}^3/\\text{s}^2$）とする。\n(1) 近地点距離 $r_1$ および遠地点距離 $r_2$（地球中心からの距離）を求めよ。\n(2) 近地点における速さ $v_1$ および遠地点における速さ $v_2$ を求めよ。\n(3) この楕円軌道の周期 $T$ [分] を求めよ。`,
        hint: `中心力（万有引力）のみが働くため、探査機の「面積速度一定の法則（角運動量保存則）」$r_1 v_1 = r_2 v_2$ および「力学的エネルギー保存則」が成立します。周期はケプラーの第3法則 $T = 2\\pi \\sqrt{\\frac{a^3}{GM}}$（$a = \\frac{r_1+r_2}{2}$ は軌道長半径）から求まります。`,
        level: 8,
        answer: `(1) $r_1 = ${(r1/1e6).toFixed(2)}\\times 10^6\\ \\text{m}$, $r_2 = ${(r2/1e6).toFixed(2)}\\times 10^6\\ \\text{m}$  (2) 近地点速さ: $v_1 = ${v1_kms}\\ \\text{km/s}$, 遠地点速さ: $v_2 = ${v2_kms}\\ \\text{km/s}$  (3) 周期: $T = ${T_min}\\ \\text{分}$`,
        explanation: `【(1) 地球中心からの距離】\n近地点距離：$r_1 = R + h_1 = 6.40\\times 10^6 + ${h1_km}\\times 10^3 = ${(r1/1e6).toFixed(2)}\\times 10^6\\ \\text{m}$\n遠地点距離：$r_2 = R + h_2 = 6.40\\times 10^6 + ${h2_km}\\times 10^3 = ${(r2/1e6).toFixed(2)}\\times 10^6\\ \\text{m}$\n\n【(2) 近地点・遠地点の速さ】\n面積速度一定則（角運動量保存則）：\n$$r_1 v_1 = r_2 v_2 \\implies v_2 = \\frac{r_1}{r_2} v_1$$\n\n万有引力による力学的エネルギー保存則：\n$$\\frac{1}{2}m v_1^2 - \\frac{GMm}{r_1} = \\frac{1}{2}m v_2^2 - \\frac{GMm}{r_2}$$\n$v_2$ を代入して整理すると：\n$$\\frac{1}{2} v_1^2 \\left(1 - \\frac{r_1^2}{r_2^2}\\right) = GM \\left(\\frac{1}{r_1} - \\frac{1}{r_2}\\right) = \\frac{GM(r_2 - r_1)}{r_1 r_2}$$\n$$v_1 = \\sqrt{\\frac{2GM r_2}{r_1(r_1 + r_2)}} = \\sqrt{\\frac{2 \\times 3.98\\times 10^{14} \\times ${(r2/1e6).toFixed(1)}\\times 10^6}{${(r1/1e6).toFixed(1)}\\times 10^6 \\times (${(r1/1e6).toFixed(1)} + ${(r2/1e6).toFixed(1)})\\times 10^6}} = ${v1_kms}\\times 10^3\\ \\text{m/s}$$\n$$v_2 = \\frac{r_1}{r_2} v_1 = \\frac{${(r1/1e6).toFixed(1)}}{${(r2/1e6).toFixed(1)}} \\times ${v1_kms} = ${v2_kms}\\ \\text{km/s}$$\n\n【(3) 軌道周期】\n長半径 $a = \\frac{r_1 + r_2}{2} = \\frac{${(r1/1e6).toFixed(1)} + ${(r2/1e6).toFixed(1)}}{2}\\times 10^6 = ${(a_orbit/1e6).toFixed(2)}\\times 10^6\\ \\text{m}$\nケプラーの第3法則より：\n$$T = 2\\pi \\sqrt{\\frac{a^3}{GM}} = 2\\pi \\sqrt{\\frac{(${(a_orbit/1e6).toFixed(2)}\\times 10^6)^3}{3.98\\times 10^{14}}} = ${T_sec}\\ \\text{s} \\approx ${T_min}\\ \\text{分}$$`,
        solutionFormulas: [
          { title: '面積速度一定の法則（ケプラー第2法則）', latex: 'r_1 v_1 = r_2 v_2', note: '中心力場における角運動量保存' },
          { title: '楕円軌道のエネルギー保存', latex: '\\frac{1}{2}mv^2 - \\frac{GMm}{r} = -\\frac{GMm}{2a}', note: '全エネルギーは長半径 $a$ だけで決定される' },
          { title: 'ケプラーの第3法則', latex: 'T = 2\\pi\\sqrt{\\frac{a^3}{GM}}', note: '軌道周期と長半径の関係' }
        ]
      });
    },

    // 9. 浮力による円筒浮子の鉛直単振動
    () => {
      const M = [2.0, 3.0, 4.0][Math.floor(Math.random() * 3)];
      const S_cm2 = [50, 100, 200][Math.floor(Math.random() * 3)];
      const S = S_cm2 * 1e-4; // m^2
      const rho = 1.0e3; // 1000 kg/m^3
      const g = 9.8;

      const h0 = (M / (rho * S)).toFixed(3);
      const k_eff = (rho * S * g).toFixed(1);
      const omega = Math.sqrt(parseFloat(k_eff) / M).toFixed(2);
      const T = ((2 * Math.PI) / parseFloat(omega)).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'buoyancy-fluids',
        category: '浮力と単振動',
        title: `水に浮かぶ円筒形浮子のつり合い深さと微小鉛直単振動 (M = ${M} kg, 底面積 ${S_cm2} cm²)`,
        prompt: `密度 $\\rho = 1.0\\times 10^3\\ \\text{kg/m}^3$ の水槽に、底面積 $S = ${S_cm2}\\ \\text{cm}^2$、質量 $M = ${M}\\ \\text{kg}$ の円筒形浮子を中心軸を鉛直にして浮かべた。重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 静止しているときの、水面下にある円筒の深さ $h_0$ を求めよ。\n(2) つり合いの位置から浮子を鉛直下方にわずかに押し下げて静かに離した。つり合い位置からの変位を $x$（鉛直下向き正）とするとき、浮子に作用する合力（復元力）$F$ を $x$ の関数として表せ。\n(3) この単振動の周期 $T$ を求めよ。`,
        hint: `つり合いのときは浮力 $\\rho S h_0 g$ と重力 $Mg$ が等しくなります。つり合いの位置から $x$ だけ押し下げると、排除体積が $Sx$ だけ増加するため、増加した浮力 $-\\rho S g x$ が復元力となります。`,
        level: 6,
        answer: `(1) つり合い深さ: $h_0 = ${h0}\\ \\text{m}$  (2) 復元力: $F = -${k_eff} x\\ \\text{N}$  (3) 周期: $T = ${T}\\ \\text{s}$`,
        explanation: `【(1) つり合い深さの導出】\n浮子の重力とアルキメデスの原理による浮力がつり合います：\n$$Mg = \\rho S h_0 g \\implies h_0 = \\frac{M}{\\rho S} = \\frac{${M}}{1000 \\times ${S}} = ${h0}\\ \\text{m}$$\n\n【(2) 運動方程式と復元力】\nつり合いの位置から下向きに変位 $x$ の位置にあるとき、水面下の深さは $h_0 + x$ となります。\n下向きを正とすると、浮子に働く合力 $F$ は：\n$$F = Mg - \\rho S (h_0 + x)g = Mg - \\rho S h_0 g - \\rho S g x$$\nつり合い条件 $Mg = \\rho S h_0 g$ より：\n$$F = -\\rho S g x = - (1000 \\times ${S} \\times 9.8) x = - ${k_eff} x\\ \\text{N}$$\n\n【(3) 単振動の周期】\n運動方程式 $M \\frac{d^2 x}{dt^2} = - (\\rho S g) x$ より、ばね定数 $k = \\rho S g = ${k_eff}\\ \\text{N/m}$ のばね振り子と完全に等価です。\n角振動数：$$\\omega = \\sqrt{\\frac{\\rho S g}{M}} = \\sqrt{\\frac{${k_eff}}{${M}}} = ${omega}\\ \\text{rad/s}$$\n周期：$$T = \\frac{2\\pi}{\\omega} = 2\\pi \\sqrt{\\frac{M}{\\rho S g}} = ${T}\\ \\text{s}$$`,
        solutionFormulas: [
          { title: '浮力による復元力', latex: 'F = -\\rho S g x', note: '増分体積による追加浮力が復元力となる' },
          { title: '浮力単振動の周期', latex: 'T = 2\\pi\\sqrt{\\frac{M}{\\rho S g}}', note: '実効ばね定数は $\\rho S g$' }
        ]
      });
    },

    // 10. モンキーハンティング（2次元投射の交点と落下の一致）
    () => {
      const L = [20.0, 30.0, 40.0][Math.floor(Math.random() * 3)];
      const H = [15.0, 20.0, 25.0][Math.floor(Math.random() * 3)];
      const v0 = [25.0, 30.0, 35.0][Math.floor(Math.random() * 3)];
      const g = 9.8;

      const tanTheta = (H / L).toFixed(3);
      const thetaDeg = (Math.atan(H / L) * 180 / Math.PI).toFixed(1);
      const cosTheta = (L / Math.sqrt(L * L + H * H)).toFixed(3);
      const tHit = (L / (v0 * parseFloat(cosTheta))).toFixed(2);
      const yHit = (H - 0.5 * g * parseFloat(tHit) * parseFloat(tHit)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'projectile-motion',
        category: '斜方投射とモンキーハンティング',
        title: `モンキーハンティングの理論と命中条件 (水平距離 L = ${L} m, 高さ H = ${H} m)`,
        prompt: `水平な地面上の原点 O から水平距離 $L = ${L}\\ \\text{m}$、高さ $H = ${H}\\ \\text{m}$ の木の上にサルがいる。時刻 $t = 0$ に銃から初速度 $v_0 = ${v0}\\ \\text{m/s}$ で弾丸を発射すると同時に、サルは木から手を離して自由落下を開始した。重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 弾丸が空中でサルに命中するためには、銃口をどの方向に向けるべきか。仰角 $\\theta$ に対する $\\tan\\theta$ を求めよ。\n(2) 発射から弾丸がサルに命中するまでの時間 $t_1$ を求めよ。\n(3) 命中する瞬間のサルの地上からの高さ $y_1$ を求めよ（ただし $y_1 > 0$ とする）。`,
        hint: `重力がないと仮定した場合、弾丸は等速直線運動をしてサルの初期位置 $(L, H)$ を通過します。弾丸とサルの両方に同じ大きさの下向き重力加速度 $g$ が働くため、サルから見た弾丸の相対運動は「等速直線運動」となります。したがって銃口を常にサルの初期位置に向ければ必ず命中します。`,
        level: 5,
        answer: `(1) $\\tan\\theta = \\frac{H}{L} = ${tanTheta}$ ($\\theta \\approx ${thetaDeg}^\\circ$)  (2) 命中時間: $t_1 = ${tHit}\\ \\text{s}$  (3) 命中高度: $y_1 = ${yHit}\\ \\text{m}$`,
        explanation: `【(1) 銃口の方向】\n弾丸の座標：\n$$x_b(t) = (v_0\\cos\\theta)t, \\quad y_b(t) = (v_0\\sin\\theta)t - \\frac{1}{2}gt^2$$\nサルの座標：\n$$x_m(t) = L, \\quad y_m(t) = H - \\frac{1}{2}gt^2$$\n\n弾丸がサルに到達する時刻 $t_1$ では $x_b(t_1) = L$ より $t_1 = \\frac{L}{v_0\\cos\\theta}$ となります。\nこのとき $y_b(t_1) = y_m(t_1)$ となる条件は：\n$$(v_0\\sin\\theta)t_1 - \\frac{1}{2}gt_1^2 = H - \\frac{1}{2}gt_1^2 \\implies (v_0\\sin\\theta)t_1 = H$$\n$t_1$ を代入すると：\n$$(v_0\\sin\\theta)\\frac{L}{v_0\\cos\\theta} = L\\tan\\theta = H \\implies \\tan\\theta = \\frac{H}{L} = \\frac{${H}}{${L}} = ${tanTheta}$$\nしたがって、サルが落下する前の初期位置に銃口を向ければよいことが分かります。\n\n【(2) 命中時間】\n$\\cos\\theta = \\frac{L}{\\sqrt{L^2 + H^2}} = ${cosTheta}$ であるため：\n$$t_1 = \\frac{L}{v_0\\cos\\theta} = \\frac{${L}}{${v0} \\times ${cosTheta}} = ${tHit}\\ \\text{s}$$\n\n【(3) 命中時の高さ】\n$$y_1 = H - \\frac{1}{2}gt_1^2 = ${H} - \\frac{1}{2} \\times 9.8 \\times (${tHit})^2 = ${yHit}\\ \\text{m}$$`,
        solutionFormulas: [
          { title: 'モンキーハンティングの命中条件', latex: '\\tan\\theta = \\frac{H}{L}', note: 'サルの初期位置を狙う' },
          { title: '重力下での相対運動', latex: '\\vec{a}_{\\text{rel}} = \\vec{g} - \\vec{g} = 0', note: 'サルから見た弾丸は等速直線運動' }
        ]
      });
    },

    // 11. 2次元斜め弾性衝突と直交散乱（ビリヤード球の衝突）
    () => {
      const m = 0.5;
      const v0 = [3.0, 4.0, 5.0][Math.floor(Math.random() * 3)];
      const theta1 = [30, 45, 60][Math.floor(Math.random() * 3)];
      const theta2 = 90 - theta1; // 弾性衝突で直交する
      const rad1 = theta1 * Math.PI / 180;
      const rad2 = theta2 * Math.PI / 180;
      const v1 = (v0 * Math.cos(rad1)).toFixed(2);
      const v2 = (v0 * Math.sin(rad1)).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'restitution-collision',
        category: '運動量保存則と平面衝突',
        title: `等質量2球の斜め弾性衝突と散乱角の直交性 (初速 ${v0} m/s, 散乱角 ${theta1}°)`,
        prompt: `なめらかな水平面上で、速さ $v_0 = ${v0}\\ \\text{m/s}$ で進む質量 $m$ の小球Aが、静止している同じ質量 $m$ の小球Bと斜めに弾性衝突（$e = 1$）した。衝突後、小球Aは初速度の方向から角度 $\\theta_1 = ${theta1}^\\circ$ だけそれて進んだ。\n(1) 衝突後の小球Aの速度ベクトルを $\\vec{v}_A$、小球Bの速度ベクトルを $\\vec{v}_B$ とするとき、$\\vec{v}_A$ と $\\vec{v}_B$ がなす角が $90^\\circ$（直交）になることを証明せよ。\n(2) 衝突後の小球Aの速さ $v_1$ および小球Bの速さ $v_2$ を求めよ。`,
        hint: `運動量保存則のベクトル式 $\\vec{p}_0 = \\vec{p}_A + \\vec{p}_B$ と、弾性衝突における運動エネルギー保存則 $\\frac{1}{2}m v_0^2 = \\frac{1}{2}m v_A^2 + \\frac{1}{2}m v_B^2$ を連立します。両辺を内積で展開すると $\\vec{v}_A \\cdot \\vec{v}_B = 0$ が導かれます。`,
        level: 6,
        answer: `(1) $\\vec{v}_A \\cdot \\vec{v}_B = 0$ より直交  (2) $v_1 = ${v1}\\ \\text{m/s}$, $v_2 = ${v2}\\ \\text{m/s}$`,
        explanation: `【(1) 散乱角が直交することの証明】\n衝突前後の運動量保存則（$m$ で割る）：\n$$\\vec{v}_0 = \\vec{v}_A + \\vec{v}_B$$\n両辺の内積をとると：\n$$|\\vec{v}_0|^2 = |\\vec{v}_A + \\vec{v}_B|^2 = v_A^2 + v_B^2 + 2(\\vec{v}_A \\cdot \\vec{v}_B)$$\n\n一方、完全弾性衝突（$e = 1$）であるため力学的エネルギーが保存されます：\n$$\\frac{1}{2}m v_0^2 = \\frac{1}{2}m v_A^2 + \\frac{1}{2}m v_B^2 \\implies v_0^2 = v_A^2 + v_B^2$$\n2式を比較すると：\n$$2(\\vec{v}_A \\cdot \\vec{v}_B) = 0 \\implies \\vec{v}_A \\cdot \\vec{v}_B = 0$$\nしたがって、衝突後の2球の進行方向は必ず直交（なす角 $90^\\circ$）します！\n\n【(2) 速さの計算】\n直交するため、速度ベクトルは直角三角形をなします：\n$$v_1 = v_0 \\cos\\theta_1 = ${v0} \\times \\cos ${theta1}^\\circ = ${v1}\\ \\text{m/s}$$\n$$v_2 = v_0 \\sin\\theta_1 = ${v0} \\times \\sin ${theta1}^\\circ = ${v2}\\ \\text{m/s}$$`,
        solutionFormulas: [
          { title: '平面衝突の運動量保存ベクトル式', latex: 'm\\vec{v}_0 = m\\vec{v}_A + m\\vec{v}_B', note: 'ベクトル加算三角形の成立' },
          { title: '等質量弾性散乱の直交性', latex: '\\vec{v}_A \\cdot \\vec{v}_B = 0', note: '等質量の弾性衝突では必ず直角に散乱する' }
        ]
      });
    },

    // 12. 壁に立てかけた棒のつり合いとすべり出し限界角
    () => {
      const mu = [0.25, 0.35, 0.50, 0.577][Math.floor(Math.random() * 4)];
      const tanTheta = (1 / (2 * mu)).toFixed(3);
      const thetaDeg = (Math.atan(1 / (2 * mu)) * 180 / Math.PI).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'rigid-body',
        category: '剛体のつり合いと力のモーメント',
        title: `壁に立てかけた棒のつり合いと滑り出し限界角 (床の摩擦係数 μ = ${mu})`,
        prompt: `なめらかな鉛直壁と、静止摩擦係数 $\\mu = ${mu}$ の粗い水平床がある。長さ $L$、質量 $M$ の一様な棒を、水平面と角度 $\\theta$ をなすように立てかけた。重力加速度の大きさを $g$ とする。\n(1) 棒が静止しているとき、壁から受ける垂直抗力 $N_W$ および床から受ける垂直抗力 $N_F$ と静止摩擦力 $F_f$ を $M, g, \\theta$ で表せ。\n(2) 棒が滑り出さずに静止していられる最小の傾角 $\\theta_{\\min}$ に対する $\\tan\\theta_{\\min}$ を求めよ。`,
        hint: `棒に働く力は、重力 $Mg$（棒の中点）、壁からの垂直抗力 $N_W$（水平右向き）、床からの垂直抗力 $N_F$（鉛直上向き）、床からの静止摩擦力 $F_f$（水平左向き）の4つです。水平・鉛直の力のつり合いと、床との接点まわりの力のモーメントのつり合いを立てます。`,
        level: 6,
        answer: `(1) $N_F = Mg$, $N_W = F_f = \\frac{Mg}{2\\tan\\theta}$  (2) $\\tan\\theta_{\\min} = \\frac{1}{2\\mu} = ${tanTheta}$ ($\\theta_{\\min} \\approx ${thetaDeg}^\\circ$)`,
        explanation: `【(1) つり合いの立式】\n鉛直方向のつり合い：$$N_F = Mg$$\n水平方向のつり合い：$$F_f = N_W$$\n\n床との接点 P まわりの力のモーメントのつり合い：\n壁からの抗力 $N_W$ の腕の長さは $L\\sin\\theta$、重力 $Mg$ の腕の長さは $\\frac{L}{2}\\cos\\theta$ です：\n$$N_W \\times L\\sin\\theta = Mg \\times \\frac{L}{2}\\cos\\theta$$\n$$N_W = \\frac{Mg\\cos\\theta}{2\\sin\\theta} = \\frac{Mg}{2\\tan\\theta}$$\n水平つり合いより摩擦力も：$$F_f = N_W = \\frac{Mg}{2\\tan\\theta}$$\n\n【(2) 滑り出し限界】\n床の静止摩擦力が最大静止摩擦力 $\\mu N_F$ 以下でなければならないため：\n$$F_f \\le \\mu N_F \\implies \\frac{Mg}{2\\tan\\theta} \\le \\mu Mg$$\n$$\\tan\\theta \\ge \\frac{1}{2\\mu} = \\frac{1}{2 \\times ${mu}} = ${tanTheta}$$\nしたがって最小の傾角は $\\tan\\theta_{\\min} = \\frac{1}{2\\mu} = ${tanTheta}$（$\\theta_{\\min} \\approx ${thetaDeg}^\\circ$）となります。`,
        solutionFormulas: [
          { title: '剛体のつり合い条件', latex: '\\Sigma \\vec{F} = 0, \\quad \\Sigma \\vec{M} = 0', note: '並進のつり合いと回転のつり合い' },
          { title: '立てかけ棒の限界角', latex: '\\tan\\theta_{\\min} = \\frac{1}{2\\mu}', note: '重心が中点にある一様な棒の臨界条件' }
        ]
      });
    },

    // 13. 加速する電車内の振り子と見かけの重力（慣性力）
    () => {
      const a = [2.45, 3.0, 4.9, 5.66][Math.floor(Math.random() * 4)];
      const g = 9.8;
      const L = [0.5, 0.8, 1.0][Math.floor(Math.random() * 3)];

      const gEff = Math.sqrt(g * g + a * a).toFixed(2);
      const tanTheta = (a / g).toFixed(3);
      const thetaDeg = (Math.atan(a / g) * 180 / Math.PI).toFixed(1);
      const T_eff = (2 * Math.PI * Math.sqrt(L / parseFloat(gEff))).toFixed(3);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'inertial-forces',
        category: '慣性力と見かけの重力',
        title: `水平加速する電車内の振り子の傾きと微小振動の周期 (加速度 a = ${a} m/s²)`,
        prompt: `水平直線上を一定の加速度 $a = ${a}\\ \\text{m/s}^2$ で前進する電車の天井から、長さ $L = ${L}\\ \\text{m}$ の軽い糸で質量 $m$ の小球を吊り下げた。重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 電車内で小球が静止しているとき、糸が鉛直方向となす角 $\\theta$ に対する $\\tan\\theta$ を求めよ。\n(2) この静止状態における見かけの重力加速度の大きさ $g'$ および糸の張力 $T_0$ を求めよ。\n(3) このつり合い位置を中心として小球を微小振動させたときの周期 $T$ を求めよ。`,
        hint: `電車内の観測者から見ると、小球には進行方向と逆向きに大きさ $ma$ の慣性力が働きます。重力 $mg$ と慣性力 $ma$ のベクトル合成が見かけの重力 $m\\vec{g}'$ となります。振り子の周期公式 $T = 2\\pi\\sqrt{L/g}$ の $g$ を見かけの重力加速度 $g'$ に置き換えます。`,
        level: 5,
        answer: `(1) $\\tan\\theta = \\frac{a}{g} = ${tanTheta}$ ($\\theta \\approx ${thetaDeg}^\\circ$)  (2) $g' = ${gEff}\\ \\text{m/s}^2$, 張力 $T_0 = m g'$  (3) 周期: $T = ${T_eff}\\ \\text{s}$`,
        explanation: `【(1) つり合いの傾き】\n電車内の座標系では、小球に重力 $mg$（鉛直下向き）と慣性力 $ma$（後方水平向き）が作用します。\n糸が鉛直線となす角を $\\theta$ とすると：\n$$T_0 \\sin\\theta = ma, \\quad T_0 \\cos\\theta = mg$$\n辺々を割ると：\n$$\\tan\\theta = \\frac{ma}{mg} = \\frac{a}{g} = \\frac{${a}}{9.8} = ${tanTheta} \\implies \\theta \\approx ${thetaDeg}^\\circ$$\n\n【(2) 見かけの重力加速度】\n見かけの重力ベクトル $\\vec{g}' = \\vec{g} - \\vec{a}$ の大きさは：\n$$g' = \\sqrt{g^2 + a^2} = \\sqrt{9.8^2 + ${a}^2} = ${gEff}\\ \\text{m/s}^2$$\nつり合い時の張力は $T_0 = mg' = ${gEff} m\\ \\text{N}$\n\n【(3) 振動周期】\n見かけの重力方向がつり合いの中心となるため、周期公式の $g$ を $g'$ に置き換えることができます：\n$$T = 2\\pi \\sqrt{\\frac{L}{g'}} = 2\\pi \\sqrt{\\frac{${L}}{${gEff}}} = ${T_eff}\\ \\text{s}$$`,
        solutionFormulas: [
          { title: '慣性力', latex: '\\vec{f}_{\\text{慣性}} = -m\\vec{a}', note: '加速度系における仮想的な外力' },
          { title: '見かけの重力加速度', latex: 'g\' = \\sqrt{g^2 + a^2}', note: '重力と慣性力の合力加速度' },
          { title: '加速度系での振り子周期', latex: 'T = 2\\pi\\sqrt{\\frac{L}{g\'}}', note: '見かけの重力場での等時性' }
        ]
      });
    },

    // 14. ばね振り子の斜面運動と力学的エネルギー保存
    () => {
      const theta = 30;
      const m = [1.0, 2.0, 3.0][Math.floor(Math.random() * 3)];
      const k = [50, 100, 200][Math.floor(Math.random() * 3)];
      const A = [0.1, 0.15, 0.2][Math.floor(Math.random() * 3)];
      const g = 9.8;

      const x0 = ((m * g * Math.sin(theta * Math.PI / 180)) / k).toFixed(3);
      const omega = Math.sqrt(k / m).toFixed(2);
      const vmax = (A * parseFloat(omega)).toFixed(2);
      const E_tot = (0.5 * k * A * A).toFixed(3);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'spring-oscillation',
        category: '単振動と力学的エネルギー',
        title: `傾斜角 ${theta}° の斜面上のばね振り子におけるつり合いと最大速度 (m = ${m} kg, k = ${k} N/m)`,
        prompt: `傾斜角 $\\theta = ${theta}^\\circ$ のなめらかな斜面上にばね定数 $k = ${k}\\ \\text{N/m}$ の軽いばねの一端を固定し、他端に質量 $m = ${m}\\ \\text{kg}$ の小物体を取り付けた。重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 小物体が静止しているときのばねの自然長からの伸び $x_0$（振動中心）を求めよ。\n(2) 小物体をつり合いの位置から斜面に沿って振幅 $A = ${A}\\ \\text{m}$ だけ引き下げて静かに離した。小物体が振動中心を通過するときの最大速度 $v_{\\max}$ を求めよ。\n(3) この単振動の力学的エネルギー（つり合い位置基準の振動エネルギー）$E$ を求めよ。`,
        hint: `斜面方向の重力成分 $mg\\sin\\theta$ とばねの復元力 $kx_0$ がつり合います。つり合いの位置からの変位を $X$ と置くと、重力による位置エネルギーを含めた全ポテンシャルエネルギーは $\\frac{1}{2}kX^2$ のみで表せます。`,
        level: 4,
        answer: `(1) つり合いの伸び: $x_0 = ${x0}\\ \\text{m}$  (2) 最大速度: $v_{\\max} = ${vmax}\\ \\text{m/s}$  (3) 振動エネルギー: $E = ${E_tot}\\ \\text{J}$`,
        explanation: `【(1) つり合いの位置】\n斜面に沿った方向の力のつり合い：\n$$kx_0 = mg\\sin\\theta \\implies x_0 = \\frac{mg\\sin ${theta}^\\circ}{k} = \\frac{${m} \\times 9.8 \\times 0.5}{${k}} = ${x0}\\ \\text{m}$$\n\n【(2) 最大速度】\nつり合いの位置（$X = 0$）を原点とする単振動の角振動数は：\n$$\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{${k}}{${m}}} = ${omega}\\ \\text{rad/s}$$\n振動中心を通過するとき速度が最大となり：\n$$v_{\\max} = A\\omega = ${A} \\times ${omega} = ${vmax}\\ \\text{m/s}$$\n\n【(3) 振動エネルギー】\nつり合いの位置を中心とする単振動では、重力位置エネルギーとばねの弾性エネルギーの和は $\\frac{1}{2}k X^2$ とまとめられます：\n$$E = \\frac{1}{2}k A^2 = \\frac{1}{2} \\times ${k} \\times (${A})^2 = ${E_tot}\\ \\text{J}$$`,
        solutionFormulas: [
          { title: '斜面上のつり合い位置', latex: 'x_0 = \\frac{mg\\sin\\theta}{k}', note: '単振動の振動中心' },
          { title: '単振動の力学的エネルギー', latex: 'E = \\frac{1}{2}kA^2 = \\frac{1}{2}mv_{\\max}^2', note: 'つり合い位置を基準としたエネルギー保存' }
        ]
      });
    },

    // 15. 空気抵抗と終端速度（粘性抵抗の微分方程式的解釈）
    () => {
      const m = [0.1, 0.2, 0.5][Math.floor(Math.random() * 3)];
      const k_drag = [0.2, 0.5, 1.0][Math.floor(Math.random() * 3)];
      const g = 9.8;

      const vt = ((m * g) / k_drag).toFixed(2);
      const tau = (m / k_drag).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'mechanics',
        topicId: 'terminal-velocity',
        category: '運動方程式と終端速度',
        title: `粘性抵抗を受ける物体の落下と終端速度 (質量 m = ${m} kg, 抵抗係数 k = ${k_drag} kg/s)`,
        prompt: `質量 $m = ${m}\\ \\text{kg}$ の雨滴が静止状態から鉛直下方に落下する。雨滴には速さ $v$ に比例する空気抵抗力 $f = -kv$（$k = ${k_drag}\\ \\text{kg/s}$）が作用する。重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 落下中の雨滴の速さが $v$ のときの運動方程式を立てよ。\n(2) 雨滴が十分に長い時間落下したときに達する一定の終端速度 $v_t$ を求めよ。\n(3) この系の時定数（速度が終端速度の約 63% に達するまでの時間）$\\tau = \\frac{m}{k}$ を求めよ。`,
        hint: `重力 $mg$（下向き）と空気抵抗 $kv$（上向き）が等しくなると加速度が $0$ になり、等速運動に移行します。`,
        level: 4,
        answer: `(1) $m\\frac{dv}{dt} = mg - kv$  (2) 終端速度: $v_t = ${vt}\\ \\text{m/s}$  (3) 時定数: $\\tau = ${tau}\\ \\text{s}$`,
        explanation: `【(1) 運動方程式】\n鉛直下向きを正とすると：\n$$m\\frac{dv}{dt} = mg - kv$$\n\n【(2) 終端速度】\n十分時間が経過すると加速度 $\\frac{dv}{dt} = 0$ となり、速度は一定値 $v_t$ に収束します：\n$$mg - k v_t = 0 \\implies v_t = \\frac{mg}{k} = \\frac{${m} \\times 9.8}{${k_drag}} = ${vt}\\ \\text{m/s}$$\n\n【(3) 時定数】\n微分方程式を解くと速度の時間変化は $v(t) = v_t (1 - e^{-t/\\tau})$ と表され、時定数 $\\tau$ は：\n$$\\tau = \\frac{m}{k} = \\frac{${m}}{${k_drag}} = ${tau}\\ \\text{s}$$`,
        solutionFormulas: [
          { title: '空気抵抗を考慮した運動方程式', latex: 'm\\frac{dv}{dt} = mg - kv', note: '速度比例抵抗モデル' },
          { title: '終端速度の定義', latex: 'v_t = \\frac{mg}{k}', note: '重力と抵抗力のつり合い速度' }
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
  generateMechanicsProblems
};
