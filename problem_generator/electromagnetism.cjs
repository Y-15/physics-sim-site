// problem_generator/electromagnetism.cjs
const { createProblem } = require('./utils.cjs');

function generateElectromagnetismProblems(existingEM = []) {
  const problems = [...existingEM];
  const targetTotal = 250;
  let idCounter = 1;

  function nextId() {
    while (problems.some(p => p.id === `em-gen-${String(idCounter).padStart(3, '0')}`)) {
      idCounter++;
    }
    const id = `em-gen-${String(idCounter).padStart(3, '0')}`;
    idCounter++;
    return id;
  }
  if (!problems.some(p => p.id === 'em-cycloid-bounce')) {
    problems.push(createProblem({
      id: 'em-cycloid-bounce',
      unitId: 'electromagnetism',
      topicId: 'magnetic-force',
      category: 'ローレンツ力と直交重力場・サイクロイド運動',
      title: '【最難関大・発展演習】重力場と一様磁場中における荷電粒子のサイクロイド運動と床面衝突',
      prompt: '鉛直上向きに $y$ 軸、水平右向きに $x$ 軸をとる $xy$ 平面を考える。空間全体には、$xy$ 平面に垂直で手前から奥に向かう向き（$-z$ 向き）に、磁束密度の大きさ $B$ の一様な磁場がかかっている。重力加速度の大きさを $g$ とし、重力は $-y$ 向きにはたらく。質量 $m$、電気量 $q$（$q > 0$）の荷電粒子を時刻 $t = 0$ に原点 $\\mathrm{O}(0, 0)$ から静かに放した。空気抵抗は無視できる。\n(1) 粒子を初速度 $0$ で放す代わりに、$+x$ 向きにある速さ $V_0$ で打ち出したところ、$x$ 軸上を等速直線運動した。この速さ $V_0$ を求めよ。\n(2) 初速度 $0$ で放した場合について、速さ $V_0$ で $+x$ 向きに動く慣性系 $\\mathrm{S}\'$ から見た相対速度に着目することで、粒子が達する最低点の $y$ 座標 $y_{\\min}$、および最初に $y = 0$ に戻る時刻 $t_0$ と $x$ 座標 $x_0$ を求めよ。\n(3) $y = -R$（$R = \\frac{m^2 g}{q^2 B^2}$）の位置になめらかな絶縁体の水平な床を置く。原点から初速度 $0$ で放した粒子が最初に床に衝突する時刻 $t_1$、衝突点 $\\mathrm{P}_1$ の $x$ 座標 $x_1$、衝突直前の速度成分 $(v_{1x}, v_{1y})$ を求めよ。\n(4) 床との反発係数が $e = 1$ のとき、1回目の衝突から2回目の衝突までの水平移動距離 $\\Delta X$ と経過時間 $\\Delta T$、および達する最高点の $y$ 座標 $y_{\\max, 1}$ を求めよ。\n(5) 反発係数が $0 < e < 1$ のとき、粒子が何回衝突しても床面到達時の水平速度成分は常に $V_0$ に等しいことを示せ。また、$n$ 回目の衝突後の滞空時間 $\\Delta T_n$ と水平移動距離 $\\Delta X_n$ を求め、$n \\to \\infty$ で粒子がどのような運動に落ち着くか、床からの垂直抗力とともに答えよ。',
      hint: '速さ $V_0 = \\frac{mg}{qB}$ で $+x$ 向きに等速運動する慣性系 $\\mathrm{S}\'$ から見ると、重力 $mg$ がローレンツ力の定数項 $q V_0 B$ と相殺し、単純な角振動数 $\\omega = \\frac{qB}{m}$ の等速円運動に還元されます。飛行中は $m\\frac{\\Delta v_x}{\\Delta t} = -qB\\frac{\\Delta y}{\\Delta t}$ が成り立ちます。',
      level: 10,
      answer: '(1) $V_0 = \\frac{mg}{qB}$  (2) $y_{\\min} = -\\frac{2m^2g}{q^2B^2}$, $t_0 = \\frac{2\\pi m}{qB}$, $x_0 = \\frac{2\\pi m^2g}{q^2B^2}$  (3) $t_1 = \\frac{\\pi m}{2qB}$, $x_1 = (\\frac{\\pi}{2}-1)\\frac{m^2g}{q^2B^2}$, $v_{1x} = \\frac{mg}{qB}, v_{1y} = -\\frac{mg}{qB}$  (4) $\\Delta X = (\\pi-2)\\frac{m^2g}{q^2B^2}$, $\\Delta T = \\frac{\\pi m}{qB}$, $y_{\\max,1} = 0$  (5) $\\Delta T_n = \\frac{\\pi m}{qB}$（一定！）, $\\Delta X_n = (\\pi - 2e^n)\\frac{m^2g}{q^2B^2}$。$n \\to \\infty$ で床面上を速さ $V_0$ で等速直線運動、垂直抗力 $N = 0$',
      explanation: '【(1) 等速直線運動の条件】\n$+x$ 向きの運動により生じるローレンツ力はフレミング左手の法則より $+y$ 向きに $q V_0 B$。\n鉛直方向の力のつり合い $q V_0 B - mg = 0$ より：\n$$V_0 = \\frac{mg}{qB}$$\n\n【(2) ドリフト慣性系 S\' への座標変換】\n相対速度 $\\vec{u} = (v_x - V_0, v_y)$ を運動方程式に代入すると、重力項が消え、半径 $R = \\frac{mV_0}{qB} = \\frac{m^2g}{q^2B^2}$、角振動数 $\\omega = \\frac{qB}{m}$ の等速円運動となります。\n実験室系の軌道はサイクロイド曲線 $x(t) = R(\\omega t - \\sin\\omega t), y(t) = -R(1 - \\cos\\omega t)$ となり、\n最低点：$y_{\\min} = -2R = -\\frac{2m^2g}{q^2B^2}$\n周期点：$t_0 = \\frac{2\\pi}{\\omega} = \\frac{2\\pi m}{qB}, x_0 = V_0 t_0 = \\frac{2\\pi m^2g}{q^2B^2}$\n\n【(3) 床面 y = -R との最初の衝突】\n$y(t_1) = -R \\implies \\cos(\\omega t_1) = 0 \\implies \\omega t_1 = \\frac{\\pi}{2}$。\n$$t_1 = \\frac{\\pi}{2\\omega} = \\frac{\\pi m}{2qB}$$\n$$x_1 = R\\left(\\frac{\\pi}{2} - \\sin\\frac{\\pi}{2}\\right) = \\left(\\frac{\\pi}{2}-1\\right)\\frac{m^2g}{q^2B^2}$$\n系 $\\mathrm{S}\'$ では相対速度真下向き $(0, -V_0)$ なので、実験室系では $v_{1x} = V_0 = \\frac{mg}{qB}, v_{1y} = -V_0 = -\\frac{mg}{qB}$。\n\n【(4) 弾性衝突（e = 1）】\n跳ね返り直後の速度は $(V_0, +V_0)$、系 $\\mathrm{S}\'$ では真上に打ち出されて中心角 $\\pi$ の半円を描きます。\n最高点：$y_{\\max, 1} = -R + R = 0$\n滞空時間：$$\\Delta T = \\frac{\\pi}{\\omega} = \\frac{\\pi m}{qB}$$\n水平移動距離：$$\\Delta X = V_0 \\Delta T - 2R = \\pi R - 2R = (\\pi - 2)\\frac{m^2g}{q^2B^2}$$\n\n【(5) 非弾性衝突（0 < e < 1）と極限】\n$m\\Delta v_x = -qB\\Delta y$ より、なめらかな床では水平力積がゼロであるため $m v_x = -qB y$ が常に成立。床面 $y = -R$ では常に $v_x = \\frac{qB}{m}R = V_0$。\n$n$ 回目の衝突後の跳ね返り相対速度は $e^n V_0$、半円の半径は $R_n = e^n R$。\nサイクロトロン角振動数 $\\omega$ は速さに依存しないため、滞空時間は常に一定：\n$$\\Delta T_n = \\frac{\\pi}{\\omega} = \\frac{\\pi m}{qB}$$\n水平移動距離：$$\\Delta X_n = \\pi R - 2e^n R = (\\pi - 2e^n)\\frac{m^2g}{q^2B^2}$$\n$n \\to \\infty$ では跳ね返り高さ $e^n R \\to 0$ となり、床面上で速さ $V_0 = \\frac{mg}{qB}$ の等速直線運動に収束。上向きローレンツ力 $qV_0B = mg$ が重力とつり合うため、床からの垂直抗力は $N = 0$ となります。',
      solutionFormulas: [
        { title: 'ドリフト速度', latex: 'V_0 = \\frac{mg}{qB}', note: '直交重力・磁場中での水平等速運動条件' },
        { title: 'サイクロトロン角振動数', latex: '\\omega = \\frac{qB}{m}', note: '速さに依存しない一定回転周期' },
        { title: '不変水平速度関係', latex: 'm \\Delta v_x = -qB \\Delta y', note: '床面到達時の水平速度不変性' }
      ]
    }));
  }

  if (!problems.some(p => p.id === 'em-infinite-ladder-falling-rod')) {
    problems.push(createProblem({
      id: 'em-infinite-ladder-falling-rod',
      unitId: 'electromagnetism',
      topicId: 'induction',
      category: '無限はしご型回路網と導体棒の電磁誘導',
      title: '【最難関大・発展演習】自己相似な無限はしご型コンデンサー回路と磁場中を落下する導体棒',
      prompt: '鉛直面内に間隔 $L$ の2本の十分長い平行なめらか金属レールが固定され、紙面奥向きに磁束密度 $B$ の一様磁場がかかっている。レール上端 $\\mathrm{X}, \\mathrm{Y}$ 間には容量 $C$ のコンデンサーが無限個、直列素子 $\\mathrm{A}_n$ と並列素子 $\\mathrm{B}_n$（$n = 1, 2, \\dots$）のはしご状に接続されている。レール間には質量 $m$、長さ $L$、電気抵抗 $R$ の導体棒 $\\mathrm{PQ}$ が水平に架けられ、初速度 $0$ で重力落下する。\n(1) 回路の自己相似性に着目し、無限はしご回路全体の合成容量 $C_\\infty$ を求めよ。\n(2) 入力端子 $\\mathrm{X}$ に電位 $V_0$ を与えたとき、隣り合う節点の電位比 $k = \\frac{V_n}{V_{n-1}}$ および並列コンデンサーに蓄えられる全電気量の総和 $\\sum Q_{\\mathrm{B}_n}$ を求めよ。\n(3) 十分時間が経過した極限（$t \\to \\infty$）における導体棒の終端加速度 $a_\\infty$ と電流 $I_\\infty$ を求めよ。\n(4) 導体棒に電気抵抗 $R > 0$ がある場合の漸近速度のズレ $\\Delta v_\\infty = \\lim_{t \\to \\infty} \\{v(t) - a_\\infty t\\}$ を求め、抵抗 $R = 0$ の理想速度に比べて速くなる理由を定性的に説明せよ。',
      hint: '無限回路は自己相似性より $C_\\infty = \\frac{C(C + C_\\infty)}{2C + C_\\infty}$ を満たし、黄金比の逆数 $\\alpha = \\frac{\\sqrt{5}-1}{2}$ が現れます。$t \\to \\infty$ では電流が一定（$\\Delta I = 0$）となり、抵抗の電圧降下変化がゼロになります。また運動量と力積の関係より $mv(t) = mgt - BLQ(t)$ が厳密に成立します。',
      level: 10,
      answer: '(1) $C_\\infty = \\frac{\\sqrt{5}-1}{2}C$  (2) $k = \\frac{3-\\sqrt{5}}{2} = \\alpha^2$, $\\sum Q_{\\mathrm{B}_n} = C_\\infty V_0 = Q_{\\mathrm{in}}$  (3) $a_\\infty = \\frac{mg}{m + C_\\infty B^2 L^2}$, $I_\\infty = \\frac{C_\\infty B L mg}{m + C_\\infty B^2 L^2}$  (4) $\\Delta v_\\infty = \\frac{C_\\infty^2 B^2 L^2 R mg}{(m + C_\\infty B^2 L^2)^2} > 0$（初期電流の立ち上がり遅れによりブレーキ力が弱まり、初期加速で余分な速度を得るため速くなる）',
      explanation: '【(1) 自己相似性と合成容量】\n第1区間を取り除いた右側回路も同一の合成容量 $C_\\infty$ をもつため：\n$$C_\\infty = \\frac{C(C + C_\\infty)}{2C + C_\\infty} \\implies C_\\infty^2 + C C_\\infty - C^2 = 0$$\n$C_\\infty > 0$ より、黄金比 $\\phi = \\frac{1+\\sqrt{5}}{2}$ の逆数 $\\alpha$ を用いて：\n$$C_\\infty = \\frac{\\sqrt{5}-1}{2} C = \\alpha C$$\n\n【(2) 電位減衰と総電荷】\n直列分圧比より：\n$$k = \\frac{V_n}{V_{n-1}} = \\frac{C}{2C + C_\\infty} = \\frac{1}{2 + \\alpha} = \\alpha^2 = \\frac{3-\\sqrt{5}}{2}$$\n無限等比級数の和：\n$$\\sum_{n=1}^\\infty Q_{\\mathrm{B}_n} = C V_0 \\sum_{n=1}^\\infty k^n = C V_0 \\frac{k}{1-k} = C V_0 \\frac{\\alpha^2}{\\alpha} = \\alpha C V_0 = C_\\infty V_0 = Q_{\\mathrm{in}}$$\n\n【(3) 終端加速度と定常電流】\n運動方程式 $ma(t) = mg - I(t)BL$ およびキルヒホッフ則 $v(t)BL - RI(t) - Q(t)/C_\\infty = 0$。\n$t \\to \\infty$ では $\\Delta I = 0$ より $BL a_\\infty - I_\\infty/C_\\infty = 0 \\implies I_\\infty = C_\\infty BL a_\\infty$。\nこれを代入すると：\n$$a_\\infty = \\frac{mg}{m + C_\\infty B^2 L^2}$$\n$$I_\\infty = \\frac{C_\\infty B L mg}{m + C_\\infty B^2 L^2}$$\n\n【(4) 漸近速度差 Delta v_inf】\n運動量と力積の関係 $mv(t) = mgt - BLQ(t)$ より $Q(t) = \\frac{mgt - mv(t)}{BL}$。\nキルヒホッフ則 $Q(t) = C_\\infty BL v(t) - C_\\infty R I(t)$ と連立して $Q(t)$ を消去：\n$$v(t) = a_\\infty t + \\frac{C_\\infty R BL}{m + C_\\infty B^2 L^2} I(t)$$\n$t \\to \\infty$ で $I(t) \\to I_\\infty$ より：\n$$\\Delta v_\\infty = \\frac{C_\\infty R BL}{m + C_\\infty B^2 L^2} I_\\infty = \\frac{C_\\infty^2 B^2 L^2 R mg}{(m + C_\\infty B^2 L^2)^2} > 0$$\n抵抗 $R$ による充電遅れのため運動初期のブレーキ力が弱く、初期加速が $a_\\infty$ を上回ることで速度が上乗せされます。',
      solutionFormulas: [
        { title: '無限ラダー回路の合成容量', latex: 'C_\\infty = \\frac{\\sqrt{5}-1}{2} C', note: '自己相似二次方程式の正の解（黄金比逆数）' },
        { title: 'コンデンサー負荷時の終端加速度', latex: 'a_\\infty = \\frac{mg}{m + C_\\infty B^2 L^2}', note: '見かけの質量増加効果' },
        { title: '漸近速度シフト', latex: '\\Delta v_\\infty = \\frac{C_\\infty^2 B^2 L^2 R mg}{(m + C_\\infty B^2 L^2)^2}', note: '抵抗による初期充電遅れに起因する正の速度差' }
      ]
    }));
  }

  const generators = [
    // 1. 磁場中を動く導体棒の運動方程式と終端速度・エネルギー収支
    () => {
      const B = [0.5, 1.0, 2.0][Math.floor(Math.random() * 3)]; // T
      const L = [0.2, 0.5, 1.0][Math.floor(Math.random() * 3)]; // m
      const R = [2.0, 4.0, 5.0][Math.floor(Math.random() * 3)]; // Ohm
      const m = 0.1; // kg
      const F = [0.2, 0.4, 0.5, 1.0][Math.floor(Math.random() * 4)]; // N

      // vt = F * R / (B^2 * L^2)
      const vt = ((F * R) / (B * B * L * L)).toFixed(2);
      const I_t = (F / (B * L)).toFixed(2);
      const V_ind = (B * L * parseFloat(vt)).toFixed(2);
      const P_ext = (F * parseFloat(vt)).toFixed(2);
      const P_joule = (parseFloat(I_t) * parseFloat(I_t) * R).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'electromagnetism',
        topicId: 'moving-conductor',
        category: '電磁誘導と導体棒の運動',
        title: `磁場中の導体棒に働く電磁ブレーキと終端速度・ジュール熱 (B = ${B} T, レール幅 L = ${L} m)`,
        prompt: `鉛直上向きに一様な磁束密度 $B = ${B}\\ \\text{T}$ の磁場がかけられた水平面内に、間隔 $L = ${L}\\ \\text{m}$ の2本のなめらかな平行導線レールが固定されている。レールの左端は電気抵抗 $R = ${R}\\ \\Omega$ で接続されている。レール上に質量 $m = ${m}\\ \\text{kg}$ の導体棒を垂直に載せ、水平右向きに一定の外力 $F = ${F}\\ \\text{N}$ を加え続けて運動させた。棒とレールの電気抵抗および摩擦は無視できるものとする。\n(1) 導体棒の速さが $v$ のとき、棒に流れる誘導電流 $I$ の向き（上から見て時計回りか反時計回りか）と大きさ、および導体棒が受ける電磁力の大きさ $F_{\\text{mag}}$ を求めよ。\n(2) 導体棒が十分に加速されたときに達する終端速度 $v_t$ を求めよ。\n(3) 終端速度に達した定常状態において、外力が単位時間あたりにする仕事（仕事率 $P_{\\text{ext}}$）と、抵抗 $R$ で単位時間あたりに発生するジュール熱（消費電力 $P_J$）を比較せよ。`,
        hint: `導体棒が右に動くと回路を貫く上向き磁束が増加するため、レンツの法則により上向き磁束を妨げる下向き磁場を作る向きに誘導起電力 $V = vBL$ が生じます。運動方程式 $m\\frac{dv}{dt} = F - \\frac{B^2 L^2}{R}v$ を立て、加速度が $0$ となる速度を求めます。`,
        level: 7,
        answer: `(1) 時計回り, $I = \\frac{vBL}{R}$, $F_{\\text{mag}} = \\frac{B^2 L^2}{R}v$  (2) 終端速度: $v_t = ${vt}\\ \\text{m/s}$  (3) $P_{\\text{ext}} = P_J = ${P_ext}\\ \\text{W}$（完全一致）`,
        explanation: `【(1) 誘導起電力と電流・電磁力】\n導体棒が速度 $v$ で動くとき、ファラデーの電磁誘導則より生じる誘導起電力の大きさは：\n$$V = v B L$$\nレンツの法則より、回路を時計回りに電流が流れます。\nオームの法則より誘導電流の大きさは：\n$$I = \\frac{V}{R} = \\frac{v B L}{R}$$\nこの電流が磁場から受ける電磁力（アンペール力）はフレミング左手の法則より運動を妨げる向き（左向き）に作用し、その大きさは：\n$$F_{\\text{mag}} = I B L = \\left(\\frac{v B L}{R}\\right)BL = \\frac{B^2 L^2}{R}v$$\n\n【(2) 終端速度の導出】\n導体棒の運動方程式（右向き正）：\n$$m\\frac{dv}{dt} = F - F_{\\text{mag}} = F - \\frac{B^2 L^2}{R}v$$\n速度が増加すると抵抗力 $F_{\\text{mag}}$ が増大し、やがて外力 $F$ とつり合って加速度が $0$ になります：\n$$F - \\frac{B^2 L^2}{R}v_t = 0 \\implies v_t = \\frac{F R}{B^2 L^2} = \\frac{${F} \\times ${R}}{(${B})^2 \\times (${L})^2} = ${vt}\\ \\text{m/s}$$\n\n【(3) 仕事率とジュール熱の等価性】\n外力の仕事率：\n$$P_{\\text{ext}} = F v_t = ${F} \\times ${vt} = ${P_ext}\\ \\text{W}$$\n定常電流：$I_t = \\frac{v_t B L}{R} = \\frac{F}{BL} = ${I_t}\\ \\text{A}$\n抵抗での消費電力（ジュール熱の発生率）：\n$$P_J = R I_t^2 = R \\left(\\frac{F}{BL}\\right)^2 = \\frac{F^2 R}{B^2 L^2} = F \\left(\\frac{FR}{B^2 L^2}\\right) = F v_t = ${P_joule}\\ \\text{W}$$\nしたがって、$P_{\\text{ext}} = P_J$ となり、外力の加えた機械的仕事率がすべて電気エネルギーを経由してジュール熱として熱エネルギーに変換されていることが確かめられます。`,
        solutionFormulas: [
          { title: '導体棒の誘導起電力', latex: 'V = vBL', note: 'ファラデー則またはローレンツ力より' },
          { title: '磁場中の終端速度', latex: 'v_t = \\frac{FR}{B^2 L^2}', note: '外力と電磁制動力のつり合い' },
          { title: 'エネルギー保存則', latex: 'P_{\\text{外力}} = P_{\\text{ジュール熱}} = F v_t', note: '力学的仕事から熱エネルギーへの完全保存' }
        ]
      });
    },

    // 2. 導体棒にコンデンサーが接続された回路（見かけの質量と等速運動）
    () => {
      const B = 1.0;
      const L = [0.4, 0.5, 0.8][Math.floor(Math.random() * 3)];
      const C_mF = [50, 100, 200][Math.floor(Math.random() * 3)];
      const C = C_mF * 1e-3; // F
      const m = [0.1, 0.2][Math.floor(Math.random() * 2)]; // kg
      const v0 = [2.0, 3.0, 4.0][Math.floor(Math.random() * 3)]; // m/s

      // 見かけの質量 M_eff = m + C * B^2 * L^2
      const CBL2 = C * B * B * L * L;
      const M_eff = m + CBL2;

      return createProblem({
        id: nextId(),
        unitId: 'electromagnetism',
        topicId: 'moving-conductor',
        category: '電磁誘導とコンデンサー回路',
        title: `コンデンサーを接続したレール上の導体棒の運動と見かけの慣性 (C = ${C_mF} mF, L = ${L} m)`,
        prompt: `一様な鉛直上向きの磁束密度 $B = ${B.toFixed(1)}\\ \\text{T}$ の磁場中に、間隔 $L = ${L}\\ \\text{m}$ のなめらかな水平平行レールが固定されている。レールの端には電気容量 $C = ${C_mF}\\ \\text{mF}$ のコンデンサーが接続されている。レール上に質量 $m = ${m}\\ \\text{kg}$ の導体棒を載せ、時刻 $t = 0$ に右向きの初速度 $v_0 = ${v0}\\ \\text{m/s}$ を与えて放した。回路の抵抗や摩擦は無視できるものとする。\n(1) 導体棒の速度が $v$、加速度が $a = \\frac{dv}{dt}$ のとき、コンデンサーに蓄えられる電荷 $Q$ および回路を流れる電流 $I$ を $v, a, B, L, C$ で表せ。\n(2) 導体棒に働く電磁力 $F_{\\text{mag}}$ を加速度 $a$ を用いて表し、導体棒の運動方程式を立てよ。\n(3) この導体棒はその後どのような運動を行うか。初速度 $v_0$ との関係を答えよ。`,
        hint: `導体棒の速さが $v$ のとき起電力は $V = vBL$ であり、抵抗がないためコンデンサーの極板間電圧も直ちに $V$ と等しくなります。したがって電荷は $Q = CV = CBLv$ です。電流は電荷の時間変化率 $I = \\frac{dQ}{dt} = CBL \\frac{dv}{dt} = CBLa$ となります。`,
        level: 8,
        answer: `(1) $Q = CBLv$, $I = CBLa$  (2) 電磁力: $F_{\\text{mag}} = - C B^2 L^2 a$, 運動方程式: $(m + C B^2 L^2)a = 0$  (3) $a = 0$ となり、初速 $v_0 = ${v0}\\ \\text{m/s}$ のまま等速直線運動を続ける！`,
        explanation: `【(1) 電荷と電流の導出】\n回路の抵抗が無視できるため、棒に生じる誘導起電力 $V = vBL$ がそのままコンデンサーの極板間電圧となります：\n$$Q = C V = C B L v$$\n回路を流れる電流 $I$ は電荷の時間変化率です：\n$$I = \\frac{dQ}{dt} = C B L \\frac{dv}{dt} = C B L a$$\n\n【(2) 電磁力と運動方程式】\nこの電流 $I$ により導体棒が受ける電磁力は、レンツの法則より運動を妨げる向き（左向き）に働き：\n$$F_{\\text{mag}} = - I B L = - (C B L a) B L = - (C B^2 L^2) a$$\n導体棒の運動方程式は：\n$$m a = F_{\\text{mag}} = - (C B^2 L^2) a$$\n移行して整理すると：\n$$(m + C B^2 L^2) a = 0$$\n\n【(3) 運動の性質の解釈】\n$m + C B^2 L^2 > 0$ であるため、常に：\n$$a = 0$$\nとなります！\nしたがって、導体棒は減速することなく、【初速度 $v_0 = ${v0}\\ \\text{m/s}$ のまま等速直線運動を続けます】。\n（※電磁力は速度 $v$ ではなく加速度 $a$ に比例する慣性抵抗として働くため、$C B^2 L^2$ は「電磁気的な見かけの質量（付加質量）」と解釈されます）`,
        solutionFormulas: [
          { title: 'コンデンサーの充電電流', latex: 'I = \\frac{dQ}{dt} = CBL\\frac{dv}{dt} = CBLa', note: '速度変化に伴う充電電流' },
          { title: '電磁付加質量方程式', latex: '(m + CB^2L^2)a = 0', note: '抵抗ゼロのLCレール系では等速運動が持続' }
        ]
      });
    },

    // 3. LC振動回路のエネルギー保存と周期
    () => {
      const L_mH = [10, 20, 50][Math.floor(Math.random() * 3)];
      const C_uF = [2.0, 5.0, 10.0][Math.floor(Math.random() * 3)];
      const V0 = [10, 20, 30][Math.floor(Math.random() * 3)]; // 初期充電電圧 V

      const L_H = L_mH * 1e-3;
      const C_F = C_uF * 1e-6;

      const omega = (1 / Math.sqrt(L_H * C_F)).toFixed(0);
      const T_ms = ((2 * Math.PI / parseFloat(omega)) * 1000).toFixed(2);
      const Q0_uC = (C_uF * V0).toFixed(1);
      const I_max_A = (parseFloat(Q0_uC) * 1e-6 * parseFloat(omega)).toFixed(3);
      const U_tot_mJ = (0.5 * C_F * V0 * V0 * 1000).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'electromagnetism',
        topicId: 'lc-oscillation',
        category: 'LC振動回路と電磁振動',
        title: `LC並列共振回路における電気振動の周期と最大電流 (L = ${L_mH} mH, C = ${C_uF} μF)`,
        prompt: `インダクタンス $L = ${L_mH}\\ \\text{mH}$ のコイルと、電気容量 $C = ${C_uF}\\ \\mu\\text{F}$ のコンデンサーからなるLC回路がある。最初、スイッチを開いた状態でコンデンサーに電圧 $V_0 = ${V0}\\ \\text{V}$ で充電した。時刻 $t = 0$ にスイッチを閉じて電磁振動を開始させた。回路の抵抗は無視できるものとする。\n(1) コンデンサーに最初に蓄えられていた初期静電エネルギー $U_0$ [mJ] を求めよ。\n(2) このLC回路に生じる電気振動の固有角周波数 $\\omega$ [rad/s] および周期 $T$ [ms] を求めよ。\n(3) コイルを流れる電流の最大値 $I_{\\max}$ [A] を求めよ。`,
        hint: `抵抗がないLC回路では「静電エネルギー $\\frac{Q^2}{2C}$」と「磁気エネルギー $\\frac{1}{2}LI^2$」の和が常に保存されます。電荷が $0$ になった瞬間に電流が最大となり、初期静電エネルギーがすべて磁気エネルギーに転化します。`,
        level: 6,
        answer: `(1) 初期エネルギー: $U_0 = ${U_tot_mJ}\\ \\text{mJ}$  (2) 角周波数: $\\omega = ${omega}\\ \\text{rad/s}$, 周期: $T = ${T_ms}\\ \\text{ms}$  (3) 最大電流: $I_{\\max} = ${I_max_A}\\ \\text{A}$`,
        explanation: `【(1) 初期静電エネルギー】\n$$U_0 = \\frac{1}{2} C V_0^2 = \\frac{1}{2} \\times (${C_uF}\\times 10^{-6}) \\times (${V0})^2 = ${U_tot_mJ}\\times 10^{-3}\\ \\text{J} = ${U_tot_mJ}\\ \\text{mJ}$$\n\n【(2) 固有角周波数と周期】\nキルヒホッフの第2法則より：\n$$\\frac{Q}{C} + L\\frac{dI}{dt} = 0$$\n$I = \\frac{dQ}{dt}$ より：\n$$\\frac{d^2 Q}{dt^2} + \\frac{1}{LC} Q = 0$$\nこれはばね定数 $k = 1/C$、質量 $m = L$ の単振動の運動方程式と数学的に完全に同形です。\n固有角周波数は：\n$$\\omega = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{(${L_mH}\\times 10^{-3}) \\times (${C_uF}\\times 10^{-6})}} = ${omega}\\ \\text{rad/s}$$\n振動周期は：\n$$T = \\frac{2\\pi}{\\omega} = 2\\pi \\sqrt{LC} = ${T_ms}\\times 10^{-3}\\ \\text{s} = ${T_ms}\\ \\text{ms}$$\n\n【(3) 最大電流】\nエネルギー保存則より、コンデンサーの電荷が $0$ になったとき電流が最大値 $I_{\\max}$ となり、全エネルギーが磁気エネルギーとなります：\n$$\\frac{1}{2} L I_{\\max}^2 = U_0 = \\frac{1}{2} C V_0^2$$\n$$I_{\\max} = V_0 \\sqrt{\\frac{C}{L}} = ${V0} \\times \\sqrt{\\frac{${C_uF}\\times 10^{-6}}{${L_mH}\\times 10^{-3}}} = ${I_max_A}\\ \\text{A}$$`,
        solutionFormulas: [
          { title: 'LC回路の固有角周波数', latex: '\\omega = \\frac{1}{\\sqrt{LC}}', note: '電磁振動の固有周期公式' },
          { title: 'LC回路のエネルギー保存則', latex: '\\frac{1}{2}LI^2 + \\frac{Q^2}{2C} = \\text{const}', note: '磁気エネルギーと静電エネルギーの可逆変換' }
        ]
      });
    },

    // 4. 速度セレクターとトムソンの比電荷測定
    () => {
      const E_field = [2.0, 3.0, 5.0][Math.floor(Math.random() * 3)] * 1e4; // V/m
      const B_field = [0.1, 0.2][Math.floor(Math.random() * 2)]; // T
      const v_select = (E_field / B_field).toFixed(0); // m/s
      const r_cm = [5.0, 8.0, 10.0][Math.floor(Math.random() * 3)];
      const r_m = r_cm * 0.01;

      // 比電荷 e/m = v / (B * r) = E / (B^2 * r)
      const e_over_m = (parseFloat(v_select) / (B_field * r_m)).toExponential(2);

      return createProblem({
        id: nextId(),
        unitId: 'electromagnetism',
        topicId: 'thomson-experiment',
        category: '荷電粒子の運動と比電荷',
        title: `速度セレクターによる粒子の選別とトムソンの比電荷測定実験`,
        prompt: `電場 $E = ${(E_field/1000).toFixed(0)}\\times 10^3\\ \\text{V/m}$ と磁場 $B = ${B_field.toFixed(2)}\\ \\text{T}$ が互いに直交する空間（速度セレクター）に荷電粒子（電気量 $-e$、質量 $m$）を入射させたところ、粒子は軌道を曲げられることなく直進して通過した。その後、粒子は磁場 $B$ のみが存在する領域に入り、半径 $r = ${r_cm}\\ \\text{cm}$ の等速円運動を行った。\n(1) 速度セレクターを直進して通過する粒子の速さ $v$ を求めよ。\n(2) 磁場領域における粒子の向心力とローレンツ力の関係から、粒子の比電荷 $\\frac{e}{m}$ [C/kg] を求める式を $E, B, r$ で表せ。\n(3) この実験における粒子の比電荷 $\\frac{e}{m}$ の数値を求めよ。`,
        hint: `速度セレクター内では静電気力 $qE$ とローレンツ力 $qvB$ がつり合うため、速さ $v = \\frac{E}{B}$ の粒子だけが直進します。磁場領域ではローレンツ力が向心力となり $m\\frac{v^2}{r} = qvB$ が成立します。`,
        level: 6,
        answer: `(1) 選別速度: $v = ${(parseFloat(v_select)/1e5).toFixed(1)}\\times 10^5\\ \\text{m/s}$  (2) 比電荷: $\\frac{e}{m} = \\frac{E}{r B^2}$  (3) $\\frac{e}{m} = ${e_over_m}\\ \\text{C/kg}$`,
        explanation: `【(1) 速度セレクターの直進条件】\n電場による力 $F_E = eE$ と磁場によるローレンツ力 $F_B = evB$ の向きが反対であり、大きさが等しいとき粒子は直進します：\n$$eE = evB \\implies v = \\frac{E}{B} = \\frac{${E_field}}{${B_field}} = ${v_select}\\ \\text{m/s}$$\n\n【(2) 比電荷の導出】\n磁場のみの領域では、ローレンツ力が向心力となって円運動します：\n$$m\\frac{v^2}{r} = evB \\implies \\frac{e}{m} = \\frac{v}{r B}$$\n(1) の $v = \\frac{E}{B}$ を代入すると：\n$$\\frac{e}{m} = \\frac{E}{r B^2}$$\n\n【(3) 数値計算】\n$$\\frac{e}{m} = \\frac{${E_field}}{${r_m} \\times (${B_field})^2} = ${e_over_m}\\ \\text{C/kg}$$\n（※電子の標準比電荷は約 $1.76\\times 10^{11}\\ \\text{C/kg}$ です）`,
        solutionFormulas: [
          { title: '速度セレクターの直進条件', latex: 'v = \\frac{E}{B}', note: '静電気力とローレンツ力のつり合い' },
          { title: '比電荷の導出式', latex: '\\frac{e}{m} = \\frac{E}{rB^2}', note: 'トムソンの実験原理' }
        ]
      });
    },

    // 5. 交流RLC直列回路のインピーダンスと共振周波数・力率
    () => {
      const R = [30, 40, 50][Math.floor(Math.random() * 3)];
      const L_mH = [100, 200][Math.floor(Math.random() * 2)];
      const C_uF = [10.0, 20.0][Math.floor(Math.random() * 2)];
      const V_rms = 100; // 実行値 100 V

      const L = L_mH * 1e-3;
      const C = C_uF * 1e-6;

      const f0 = (1 / (2 * Math.PI * Math.sqrt(L * C))).toFixed(1);
      const omega0 = (2 * Math.PI * parseFloat(f0)).toFixed(0);

      // 共振時のインピーダンス Z0 = R
      const I_res = (V_rms / R).toFixed(2);
      const P_res = (V_rms * parseFloat(I_res)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'electromagnetism',
        topicId: 'ac-circuits',
        category: '交流回路とRLC共振',
        title: `RLC直列回路におけるインピーダンスと共振周波数・力率 (R = ${R} Ω, L = ${L_mH} mH, C = ${C_uF} μF)`,
        prompt: `抵抗 $R = ${R}\\ \\Omega$、自己インダクタンス $L = ${L_mH}\\ \\text{mH}$ のコイル、電気容量 $C = ${C_uF}\\ \\mu\\text{F}$ のコンデンサーを直列に接続し、実効値 $V = 100\\ \\text{V}$、周波数 $f$ を自由に変えられる交流電源をつないだ。\n(1) 電源の角周波数が $\\omega$ のときの回路全体のインピーダンス $Z$ を表す式を求めよ。\n(2) 回路が共振状態（電流の実効値が最大）になるときの共振周波数 $f_0$ [Hz] を求めよ。\n(3) 共振状態における電流の実効値 $I_0$ [A]、回路の力率 $\\cos\\phi$、および平均消費電力 $P$ [W] を求めよ。`,
        hint: `コイルのリアクタンスは $X_L = \\omega L$、コンデンサーのリアクタンスは $X_C = \\frac{1}{\\omega C}$ です。直列インピーダンスは $Z = \\sqrt{R^2 + (X_L - X_C)^2}$ と表され、$X_L = X_C$ のときに $Z = R$ となり最小（共振）となります。`,
        level: 6,
        answer: `(1) $Z = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}$  (2) 共振周波数: $f_0 = ${f0}\\ \\text{Hz}$  (3) 電流: $I_0 = ${I_res}\\ \\text{A}$, 力率: $\\cos\\phi = 1.0$, 消費電力: $P = ${P_res}\\ \\text{W}$`,
        explanation: `【(1) インピーダンスの導出】\n電流を基準として各素子の端子間電圧の位相関係を考えると：\n抵抗電圧 $V_R$ は同位相、コイル電圧 $V_L$ は位相が $\\pi/2$ 進み、コンデンサー電圧 $V_C$ は位相が $\\pi/2$ 遅れます。\n電源電圧の振幅ベクトル関係より：\n$$Z = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}$$\n\n【(2) 共振周波数の計算】\nインピーダンスが最小となる共振条件は：\n$$\\omega_0 L = \\frac{1}{\\omega_0 C} \\implies \\omega_0 = \\frac{1}{\\sqrt{LC}}$$\n$$f_0 = \\frac{\\omega_0}{2\\pi} = \\frac{1}{2\\pi \\sqrt{(${L_mH}\\times 10^{-3}) \\times (${C_uF}\\times 10^{-6})}} = ${f0}\\ \\text{Hz}$$\n\n【(3) 共振時の諸量】\n共振時はリアクタンスが相殺されるため $Z_0 = R = ${R}\\ \\Omega$ となります。\n電流の実効値：$$I_0 = \\frac{V}{Z_0} = \\frac{100}{${R}} = ${I_res}\\ \\text{A}$$\n力率：$$\\cos\\phi = \\frac{R}{Z_0} = \\frac{R}{R} = 1.0$$\n（電圧と電流が同位相）\n平均消費電力：$$P = V I_0 \\cos\\phi = 100 \\times ${I_res} \\times 1.0 = ${P_res}\\ \\text{W}$$`,
        solutionFormulas: [
          { title: 'RLC直列インピーダンス', latex: 'Z = \\sqrt{R^2 + (\\omega L - 1/\\omega C)^2}', note: '実効抵抗と合成リアクタンス' },
          { title: '共振周波数', latex: 'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}', note: '力率 1.0 となる最大電流周波数' }
        ]
      });
    }
  ];

  // 目標数 (250問) まで自動生成
  let genIndex = 0;
  while (problems.length < targetTotal) {
    const gen = generators[genIndex % generators.length];
    problems.push(gen());
    genIndex++;
  }

  return problems;
}

module.exports = {
  generateElectromagnetismProblems
};
