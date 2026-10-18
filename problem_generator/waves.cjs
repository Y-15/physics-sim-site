// problem_generator/waves.cjs
const { createProblem } = require('./utils.cjs');

function generateWavesProblems(existingWaves = []) {
  const problems = [...existingWaves];
  const targetTotal = 180;
  let idCounter = 1;

  function nextId() {
    while (problems.some(p => p.id === `wave-gen-${String(idCounter).padStart(3, '0')}`)) {
      idCounter++;
    }
    const id = `wave-gen-${String(idCounter).padStart(3, '0')}`;
    idCounter++;
    return id;
  }

  const generators = [
    // 1. 斜め方向のドップラー効果（観測者と音源の幾何学的視線成分）
    () => {
      const vS = [17.0, 20.0, 34.0][Math.floor(Math.random() * 3)];
      const f0 = [400, 500, 680][Math.floor(Math.random() * 3)];
      const V_sound = 340;
      const d = [30, 40, 50][Math.floor(Math.random() * 3)]; // 観測者までの垂直距離

      // 音源が十分遠方から近づくときの振動数 (theta -> 0)
      const f_approach = (f0 * (V_sound / (V_sound - vS))).toFixed(1);
      // 十分遠方へ遠ざかるときの振動数 (theta -> 180)
      const f_recede = (f0 * (V_sound / (V_sound + vS))).toFixed(1);
      // 目の前（theta = 90 deg）を通過した「瞬間」に観測者に届く音の振動数
      // 音源が通過した瞬間に発せられた音は cos(90) = 0 => f = f0
      // ただし通過した瞬間に聞こえる音は、過去に cos(theta) > 0 で発せられた音！
      const theta_hit = 60;
      const cos60 = 0.5;
      const f_at60 = (f0 * (V_sound / (V_sound - vS * cos60))).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'doppler-effect',
        category: 'ドップラー効果',
        title: `斜め方向のドップラー効果と視線速度成分 (音源速度 vs = ${vS} m/s, f0 = ${f0} Hz)`,
        prompt: `一直線の線路上を、振動数 $f_0 = ${f0}\\ \\text{Hz}$ の汽笛を鳴らしながら電車が一定の速さ $v_S = ${vS}\\ \\text{m/s}$ で走っている。線路から垂直距離 $d = ${d}\\ \\text{m}$ 離れた地点 P に静止している観測者がいる。音速を $V = 340\\ \\text{m/s}$ とする。\n(1) 電車が十分遠方から接近してくるとき、地点 P の観測者が聞く音の振動数の極限値 $f_{\\text{app}}$ を求めよ。\n(2) 電車が十分遠方へ遠ざかるとき、地点 P の観測者が聞く音の振動数の極限値 $f_{\\text{rec}}$ を求めよ。\n(3) 電車と地点 P を結ぶ直線が線路となす角が $\\theta = 60^\\circ$ の瞬間に電車から発せられた音が地点 P に届いたとき、観測者が聞く振動数 $f_{60}$ を求めよ。`,
        hint: `斜め方向のドップラー効果では、音源の速度ベクトルの「音源と観測者を結ぶ視線方向の成分」$v_S \\cos\\theta$ を音源の速度として公式 $f' = \\frac{V}{V - v_S\\cos\\theta}f_0$ に適用します。`,
        level: 7,
        answer: `(1) 接近極限: $f_{\\text{app}} = ${f_approach}\\ \\text{Hz}$  (2) 遠ざかる極限: $f_{\\text{rec}} = ${f_recede}\\ \\text{Hz}$  (3) $\\theta = 60^\\circ$ での振動数: $f_{60} = ${f_at60}\\ \\text{Hz}$`,
        explanation: `【(1) 接近時の極限振動数】\n十分遠方にあるとき、視線と線路のなす角は $\\theta \\to 0^\\circ$（$\\cos\\theta \\to 1$）となります：\n$$f_{\\text{app}} = \\frac{V}{V - v_S}f_0 = \\frac{340}{340 - ${vS}} \\times ${f0} = ${f_approach}\\ \\text{Hz}$$\n\n【(2) 遠ざかるときの極限振動数】\n遠方へ去るときは $\\theta \\to 180^\\circ$（$\\cos\\theta \\to -1$）となります：\n$$f_{\\text{rec}} = \\frac{V}{V + v_S}f_0 = \\frac{340}{340 + ${vS}} \\times ${f0} = ${f_recede}\\ \\text{Hz}$$\n\n【(3) $\\theta = 60^\\circ$ のときに発せられた音】\n音源から観測者に向かう方向の音源の速度成分は $v_{\\parallel} = v_S \\cos 60^\\circ = ${vS} \\times 0.5 = ${(vS * 0.5).toFixed(1)}\\ \\text{m/s}$ です。\nドップラー効果の公式より：\n$$f_{60} = \\frac{V}{V - v_S \\cos 60^\\circ}f_0 = \\frac{340}{340 - ${(vS * 0.5).toFixed(1)}} \\times ${f0} = ${f_at60}\\ \\text{Hz}$$`,
        solutionFormulas: [
          { title: '斜めドップラー効果の一般式', latex: 'f\' = \\frac{V - v_O \\cos\\phi}{V - v_S \\cos\\theta}f_0', note: '視線方向の速度成分を適用する' }
        ]
      });
    },

    // 2. 反射板・壁に向かう音源と風の影響・うなり
    () => {
      const vS = [10.0, 15.0, 20.0][Math.floor(Math.random() * 3)];
      const w_wind = [5.0, 10.0][Math.floor(Math.random() * 2)]; // 追い風（壁に向かう向き正）
      const f0 = [440, 500][Math.floor(Math.random() * 2)];
      const V0 = 340;

      // 音源から壁へ進む音: 音速 V0 + w, 音源速度 vS
      // 壁が受ける振動数 f_wall = ( (V0+w) / ( (V0+w) - vS ) ) * f0
      const V_forward = V0 + w_wind;
      const f_wall = (f0 * (V_forward / (V_forward - vS))).toFixed(1);
      // 壁は静止しているので、反射音の振動数も f_wall のまま音源後方の観測者へ届く
      // 音源から後方へ向かう直接音: 風と逆向きなので音速 V0 - w, 音源は後退 (速度 -vS)
      const V_backward = V0 - w_wind;
      const f_direct = (f0 * (V_backward / (V_backward + vS))).toFixed(1);
      const beat = Math.abs(parseFloat(f_wall) - parseFloat(f_direct)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'doppler-effect',
        category: 'ドップラー効果とうなり',
        title: `風のある中での反射板つきドップラー効果とうなり (音源 vs = ${vS} m/s, 風速 w = ${w_wind} m/s)`,
        prompt: `静止した反射壁に向かって、振動数 $f_0 = ${f0}\\ \\text{Hz}$ の音源が速さ $v_S = ${vS}\\ \\text{m/s}$ で直進している。風が壁に向かって一定の速さ $w = ${w_wind}\\ \\text{m/s}$ で吹いている。無風時の音速を $V_0 = 340\\ \\text{m/s}$ とする。音源の後方の静止している観測者 O について考える。\n(1) 壁が単位時間あたりに受ける波の数（反射音の振動数）$f_{\\text{wall}}$ を求めよ。\n(2) 観測者 O が音源から直接受ける直接音の振動数 $f_{\\text{dir}}$ を求めよ。\n(3) 観測者 O が聞く毎秒あたりのうなりの回数 $N$ を求めよ。`,
        hint: `風速 $w$ があるとき、風下に向かう音波の速さは $V_0 + w$、風上に向かう音波の速さは $V_0 - w$ となります。壁は静止しているため、反射音の振動数は壁が受け取った振動数と等しくなります。毎秒のうなりの回数は $N = |f_{\\text{wall}} - f_{\\text{dir}}|$ です。`,
        level: 6,
        answer: `(1) 壁での反射音: $f_{\\text{wall}} = ${f_wall}\\ \\text{Hz}$  (2) 直接音: $f_{\\text{dir}} = ${f_direct}\\ \\text{Hz}$  (3) うなり回数: $N = ${beat}\\ \\text{回/s}$`,
        explanation: `【(1) 壁が受ける振動数】\n壁に向かって進む音波の見かけの速さは $V_1 = V_0 + w = 340 + ${w_wind} = ${V_forward}\\ \\text{m/s}$ です。\n音源はこの方向に速さ $v_S$ で進んでいるため：\n$$f_{\\text{wall}} = \\frac{V_1}{V_1 - v_S}f_0 = \\frac{${V_forward}}{${V_forward} - ${vS}} \\times ${f0} = ${f_wall}\\ \\text{Hz}$$\n壁は静止しているため、この振動数 $f_{\\text{wall}}$ のまま音波を反射します。\n\n【(2) 観測者 O が受ける直接音】\n音源から後方の観測者 O（風上）に向かう音波の見かけの速さは $V_2 = V_0 - w = 340 - ${w_wind} = ${V_backward}\\ \\text{m/s}$ です。\n音源は観測者から遠ざかる向きに速さ $v_S$ で動いているため：\n$$f_{\\text{dir}} = \\frac{V_2}{V_2 + v_S}f_0 = \\frac{${V_backward}}{${V_backward} + ${vS}} \\times ${f0} = ${f_direct}\\ \\text{Hz}$$\n\n【(3) 観測者が聞くうなり】\n観測者 O には直接音と壁からの反射音の2つの音が同時に届くため：\n$$N = |f_{\\text{wall}} - f_{\\text{dir}}| = |${f_wall} - ${f_direct}| = ${beat}\\ \\text{回/s}$$`,
        solutionFormulas: [
          { title: '風がある場合の音速', latex: 'V\' = V_0 \\pm w', note: '媒質の風速をガリレイ変換で加減' },
          { title: 'うなりの回数', latex: 'N = |f_1 - f_2|', note: '2つの近接周波数の干渉脈動' }
        ]
      });
    },

    // 3. 気柱の共鳴と開口端補正の精密測定（水面下降法）
    () => {
      const f_fork = [500, 600, 680][Math.floor(Math.random() * 3)];
      const temp_C = 15;
      const V_sound = 331.5 + 0.6 * temp_C; // 340.5 m/s
      const lambda = V_sound / f_fork;
      const deltaL_real = 0.015; // 開口端補正 1.5 cm

      // l1 + deltaL = lambda / 4 => l1 = lambda/4 - deltaL
      const l1_cm = (((lambda / 4) - deltaL_real) * 100).toFixed(1);
      // l2 + deltaL = 3*lambda / 4 => l2 = 3*lambda/4 - deltaL
      const l2_cm = (((3 * lambda / 4) - deltaL_real) * 100).toFixed(1);
      const l_diff_cm = (parseFloat(l2_cm) - parseFloat(l1_cm)).toFixed(1);
      const lambda_calc = (parseFloat(l_diff_cm) * 2 / 100).toFixed(3);
      const V_calc = (parseFloat(lambda_calc) * f_fork).toFixed(1);
      const deltaL_calc = (((parseFloat(l2_cm) - 3 * parseFloat(l1_cm)) / 2)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'air-columns',
        category: '気柱の共鳴と音波',
        title: `水面下降法による気柱の共鳴と開口端補正の精密算出 (おんさ f = ${f_fork} Hz)`,
        prompt: `内径が一様なガラス管に水を満たし、水面を徐々に下げながら管口で振動数 $f = ${f_fork}\\ \\text{Hz}$ のおんさを鳴らした。管口から水面までの距離が $l_1 = ${l1_cm}\\ \\text{cm}$ のとき第1共鳴（基本振動）が起こり、$l_2 = ${l2_cm}\\ \\text{cm}$ のとき第2共鳴（3倍振動）が観測された。\n(1) この音波の波長 $\\lambda$ [m] およびこのときの音速 $V$ [m/s] を求めよ。\n(2) 管口における開口端補正 $\\Delta l$ [cm] を求めよ。\n(3) さらに水面を下げたとき、次に第3共鳴（5倍振動）が起こる水面の深さ $l_3$ [cm] を求めよ。`,
        hint: `開口端補正 $\\Delta l$ があるため、第1共鳴は $l_1 + \\Delta l = \\frac{\\lambda}{4}$、第2共鳴は $l_2 + \\Delta l = \\frac{3}{4}\\lambda$ となります。2式の差をとると開口端補正が相殺され、$l_2 - l_1 = \\frac{\\lambda}{2}$ より波長が求まります。`,
        level: 5,
        answer: `(1) 波長: $\\lambda = ${lambda_calc}\\ \\text{m}$, 音速: $V = ${V_calc}\\ \\text{m/s}$  (2) 開口端補正: $\\Delta l = ${Math.abs(parseFloat(deltaL_calc))}\\ \\text{cm}$  (3) 第3共鳴位置: $l_3 = ${(parseFloat(l2_cm) + parseFloat(l_diff_cm)).toFixed(1)}\\ \\text{cm}$`,
        explanation: `【(1) 波長と音速の導出】\n開口端補正を $\\Delta l$ とすると：\n第1共鳴：$$l_1 + \\Delta l = \\frac{\\lambda}{4}$$\n第2共鳴：$$l_2 + \\Delta l = \\frac{3}{4}\\lambda$$\n\n両式の差をとると開口端補正 $\\Delta l$ が消去されます：\n$$l_2 - l_1 = \\frac{3}{4}\\lambda - \\frac{1}{4}\\lambda = \\frac{\\lambda}{2}$$\n$$\\lambda = 2(l_2 - l_1) = 2(${l2_cm} - ${l1_cm})\\times 10^{-2} = ${lambda_calc}\\ \\text{m}$$\n音速は：\n$$V = f \\lambda = ${f_fork} \\times ${lambda_calc} = ${V_calc}\\ \\text{m/s}$$\n\n【(2) 開口端補正の導出】\n第1共鳴の式より：\n$$\\Delta l = \\frac{\\lambda}{4} - l_1 = \\frac{${(parseFloat(lambda_calc)*100).toFixed(1)}}{4} - ${l1_cm} = ${Math.abs(parseFloat(deltaL_calc))}\\ \\text{cm}$$\n\n【(3) 第3共鳴位置】\n定常波の節と節の間隔は常に $\\frac{\\lambda}{2} = l_2 - l_1 = ${l_diff_cm}\\ \\text{cm}$ であるため：\n$$l_3 = l_2 + \\frac{\\lambda}{2} = ${l2_cm} + ${l_diff_cm} = ${(parseFloat(l2_cm) + parseFloat(l_diff_cm)).toFixed(1)}\\ \\text{cm}$$`,
        solutionFormulas: [
          { title: '気柱の節間隔', latex: 'l_{n+1} - l_n = \\frac{\\lambda}{2}', note: '開口端補正に依存しない純粋な波長決定法' },
          { title: '開口端補正の消去法', latex: '\\Delta l = \\frac{l_2 - 3l_1}{2}', note: '連立方程式からの直接導出' }
        ]
      });
    },

    // 4. くさび形空気層の干渉縞と厚さ測定
    () => {
      const L_cm = [10.0, 12.0, 15.0][Math.floor(Math.random() * 3)];
      const D_um = [15.0, 20.0, 30.0][Math.floor(Math.random() * 3)]; // 箔の厚さ um
      const lambda_nm = [589, 600, 633][Math.floor(Math.random() * 3)]; // 波長 nm

      const L = L_cm * 0.01;
      const D = D_um * 1e-6;
      const lambda = lambda_nm * 1e-9;

      // delta x = L * lambda / (2*D)
      const dx_mm = ((L * lambda / (2 * D)) * 1000).toFixed(2);
      const total_fringes = Math.floor((2 * D) / lambda);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'thin-film-wedge',
        category: '光の干渉と回折',
        title: `くさび形空気層による等厚干渉縞と薄箔の厚さ測定 (波長 ${lambda_nm} nm, 長さ ${L_cm} cm)`,
        prompt: `長さ $L = ${L_cm}\\ \\text{cm}$ の2枚の平坦なガラス板の一端を接触させ、他端に薄い金属箔を挟んでくさび形の空気層を作った。真上から波長 $\\lambda = ${lambda_nm}\\ \\text{nm}$ の単色光を垂直に照射したところ、ガラス板全体に等間隔の干渉縞が観測され、隣り合う明線の間隔は $\\Delta x = ${dx_mm}\\ \\text{mm}$ であった。\n(1) 接触部（くさびの先端）は明線となるか、暗線となるか。その物理的理由とともに答えよ。\n(2) 金属箔の厚さ $D$ [$\\mu\\text{m}$] を求めよ。\n(3) 2枚のガラス板の間に屈折率 $n = 1.33$ の水を満たしたとき、明線の間隔 $\\Delta x'$ [mm] は元の何倍になるか。`,
        hint: `上面ガラスの下面での反射（空気への反射：自由端反射・位相変化なし）と、下面ガラスの上面での反射（屈折率の高いガラスへの反射：固定端反射・位相変化 $\\pi$）の干渉です。光路差 $2d$ に対し、片方で位相が反転するため、暗線条件は $2d = m\\lambda$、明線条件は $2d = (m + \\frac{1}{2})\\lambda$ となります。`,
        level: 6,
        answer: `(1) 暗線（下面ガラス反射で位相が $\\pi$ 反転するため光路差ゼロで弱め合う）  (2) 箔の厚さ: $D = ${D_um}\\ \\mu\\text{m}$  (3) $\\frac{1}{n} = \\frac{1}{1.33} \\approx 0.75$ 倍（$\\Delta x' = ${(parseFloat(dx_mm)/1.33).toFixed(2)}\\ \\text{mm}$）`,
        explanation: `【(1) 接触部が暗線となる理由】\nくさびの先端（$d = 0$）では、空気層を往復する幾何学的経路差は $2d = 0$ です。\nしかし、下面ガラスの表面で反射する光は「空気（疎）からガラス（密）」への反射であるため、位相が $\\pi$ 反転（半波長 $\\frac{\\lambda}{2}$ のずれ）します。\n一方、上面ガラス下面での反射は位相変化がありません。\nしたがって接触部では2光線が逆位相で重なり合い、完全に打ち消し合って【暗線】となります。\n\n【(2) 金属箔の厚さの算出】\n接触端から距離 $x$ の位置の空気層の厚さを $d$ とすると、$d = \\frac{D}{L}x$ です。\n明線条件：$$2d = 2\\frac{D}{L}x = \\left(m + \\frac{1}{2}\\right)\\lambda$$\n隣り合う明線の間隔 $\\Delta x$ は：\n$$\\Delta x = \\frac{L\\lambda}{2D}$$\nこれを $D$ について解くと：\n$$D = \\frac{L\\lambda}{2\\Delta x} = \\frac{${L} \\times (${lambda_nm}\\times 10^{-9})}{2 \\times (${dx_mm}\\times 10^{-3})} = ${D_um}\\times 10^{-6}\\ \\text{m} = ${D_um}\\ \\mu\\text{m}$$\n\n【(3) 屈折率 $n$ の液体で満たした場合】\n水中の光の波長は $\\lambda' = \\frac{\\lambda}{n}$ に短縮されます。\nしたがって縞間隔は：\n$$\\Delta x' = \\frac{L\\lambda'}{2D} = \\frac{\\Delta x}{n} = \\frac{${dx_mm}}{1.33} = ${(parseFloat(dx_mm)/1.33).toFixed(2)}\\ \\text{mm}$$\nとなり、元の約 $0.75$ 倍に縮みます。`,
        solutionFormulas: [
          { title: 'くさび形薄膜の縞間隔', latex: '\\Delta x = \\frac{L\\lambda}{2D}', note: '等厚干渉縞の間隔公式' },
          { title: '薄膜反射の位相条件', latex: '2d = m\\lambda \\implies \\text{暗線}', note: '片面固定端反射による位相逆転考慮' }
        ]
      });
    },

    // 5. ニュートンリング（球面反射と曲率半径の測定）
    () => {
      const R_m = [2.0, 3.0, 4.0][Math.floor(Math.random() * 3)]; // 曲率半径 m
      const lambda_nm = [500, 589, 600][Math.floor(Math.random() * 3)];
      const m_ring = 4; // 第4暗環

      const lambda = lambda_nm * 1e-9;
      const rm_mm = (Math.sqrt(m_ring * R_m * lambda) * 1000).toFixed(2);
      const rm_plus1_mm = (Math.sqrt((m_ring + 1) * R_m * lambda) * 1000).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'thin-film-wedge',
        category: 'ニュートンリングと光の干渉',
        title: `平凸レンズによるニュートンリングの暗環半径と曲率半径の測定 (波長 ${lambda_nm} nm)`,
        prompt: `平面ガラスの上に曲率半径 $R = ${R_m}\\ \\text{m}$ の大きな平凸レンズの凸面を下にして載せ、上から波長 $\\lambda = ${lambda_nm}\\ \\text{nm}$ の単色光を垂直に当ててニュートンリングを観測した。\n(1) 中心から半径 $r$ の位置における空気層の厚さ $d$ を、$r \\ll R$ の近似を用いて $r$ と $R$ で表せ。\n(2) 中心から数えて第 $m$ 番目の暗環の半径 $r_m$ を表す式を導き、第 $m = ${m_ring}$ 暗環の半径 $r_${m_ring}$ [mm] を求めよ。\n(3) レンズと平面ガラスの隙間に屈折率 $n = 1.44$ の液体を満たしたとき、第 $m = ${m_ring}$ 暗環の半径 $r'_{${m_ring}}$ [mm] を求めよ。`,
        hint: `接触中心を原点とすると、球面の幾何学的関係 $(R - d)^2 + r^2 = R^2$ より $d \\approx \\frac{r^2}{2R}$ が導かれます。下面ガラスでの反射時に位相が $\\pi$ 反転するため、暗線の条件は光路差 $2d = m\\lambda$（$m = 0, 1, 2, \\dots$）となります。`,
        level: 6,
        answer: `(1) $d = \\frac{r^2}{2R}$  (2) $r_m = \\sqrt{m R \\lambda}$, $r_${m_ring} = ${rm_mm}\\ \\text{mm}$  (3) $r'_{${m_ring}} = \\frac{r_${m_ring}}{\\sqrt{n}} = ${(parseFloat(rm_mm)/Math.sqrt(1.44)).toFixed(2)}\\ \\text{mm}$`,
        explanation: `【(1) 空気層の厚さの幾何学的近似】\n平凸レンズの球面の方程式において、$d \\ll R$ であるため：\n$$r^2 + (R - d)^2 = R^2 \\implies r^2 + R^2 - 2Rd + d^2 = R^2$$\n$d^2$ を無視すると：\n$$r^2 - 2Rd = 0 \\implies d = \\frac{r^2}{2R}$$\n\n【(2) 暗環の半径】\n下面の平面ガラスでの反射で位相が $\\pi$ 変化するため、干渉による暗線の条件は：\n$$2d = m\\lambda \\quad (m = 0, 1, 2, \\dots)$$\n$d$ の式を代入すると：\n$$2\\left(\\frac{r^2}{2R}\\right) = m\\lambda \\implies r_m = \\sqrt{m R \\lambda}$$\n$m = ${m_ring}$ を代入すると：\n$$r_${m_ring} = \\sqrt{${m_ring} \\times ${R_m} \\times (${lambda_nm}\\times 10^{-9})} = ${rm_mm}\\times 10^{-3}\\ \\text{m} = ${rm_mm}\\ \\text{mm}$$\n\n【(3) 屈折率 $n$ の液体で満たした場合】\n液体中の波長は $\\lambda' = \\frac{\\lambda}{n}$ となるため、暗環半径は：\n$$r'_m = \\sqrt{m R \\frac{\\lambda}{n}} = \\frac{r_m}{\\sqrt{n}} = \\frac{${rm_mm}}{\\sqrt{1.44}} = \\frac{${rm_mm}}{1.2} = ${(parseFloat(rm_mm)/1.2).toFixed(2)}\\ \\text{mm}$$`,
        solutionFormulas: [
          { title: 'ニュートンリングの空気層厚さ', latex: 'd \\approx \\frac{r^2}{2R}', note: '円弧の2次近似' },
          { title: 'ニュートンリングの暗環半径', latex: 'r_m = \\sqrt{m R \\lambda}', note: '中心 $m=0$ は暗点' }
        ]
      });
    },

    // 6. 回折格子のスペクトル次数限界と近接波長分解
    () => {
      const N_lines = [500, 600, 800][Math.floor(Math.random() * 3)]; // 本/mm
      const lambda_nm = 589.0; // ナトリウムD線
      const d_um = (1000 / N_lines).toFixed(3); // 格子定数 um
      const d_m = (1e-3 / N_lines);
      const lambda_m = lambda_nm * 1e-9;

      const m_max = Math.floor(d_m / lambda_m);
      const theta1_deg = (Math.asin(1 * lambda_m / d_m) * 180 / Math.PI).toFixed(2);
      const theta2_deg = (Math.asin(2 * lambda_m / d_m) * 180 / Math.PI).toFixed(2);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'diffraction-grating',
        category: '回折格子とスペクトル分析',
        title: `回折格子による明線スペクトルの回折角と観測可能な最大次数 (${N_lines} 本/mm)`,
        prompt: `$1\\ \\text{mm}$ あたり $N = ${N_lines}\\ \\text{本}$ のスリットが刻まれた回折格子に、波長 $\\lambda = ${lambda_nm}\\ \\text{nm}$ の単色光を垂直に入射させた。\n(1) 回折格子のスリット間隔（格子定数）$d$ [$\\mu\\text{m}$] を求めよ。\n(2) 1次（$m = 1$）および 2次（$m = 2$）の明線が現れる回折角 $\\theta_1, \\theta_2$ を求めよ。\n(3) この回折格子を用いて観測できる明線の最大次数 $m_{\\max}$ を求めよ。`,
        hint: `格子定数は $d = \\frac{1\\ \\text{mm}}{N}$ です。明線の条件式 $d\\sin\\theta = m\\lambda$ において、回折角の取り得る最大範囲は $\\theta < 90^\\circ$（$\\sin\\theta \\le 1$）であることから $m \\le \\frac{d}{\\lambda}$ となります。`,
        level: 6,
        answer: `(1) 格子定数: $d = ${d_um}\\ \\mu\\text{m}$  (2) $\\theta_1 = ${theta1_deg}^\\circ$, $\\theta_2 = ${theta2_deg}^\\circ$  (3) 最大次数: $m_{\\max} = ${m_max}$`,
        explanation: `【(1) 格子定数の計算】\n$$d = \\frac{1.0\\times 10^{-3}\\ \\text{m}}{${N_lines}} = ${d_um}\\times 10^{-6}\\ \\text{m} = ${d_um}\\ \\mu\\text{m}$$\n\n【(2) 回折角の計算】\n回折格子の明線条件：\n$$d\\sin\\theta = m\\lambda \\implies \\sin\\theta_m = \\frac{m\\lambda}{d}$$\n$m = 1$ のとき：\n$$\\sin\\theta_1 = \\frac{1 \\times ${lambda_nm}\\times 10^{-9}}{${d_m.toExponential(3)}} = ${(1 * lambda_m / d_m).toFixed(4)} \\implies \\theta_1 = ${theta1_deg}^\\circ$$\n$m = 2$ のとき：\n$$\\sin\\theta_2 = \\frac{2 \\times ${lambda_nm}\\times 10^{-9}}{${d_m.toExponential(3)}} = ${(2 * lambda_m / d_m).toFixed(4)} \\implies \\theta_2 = ${theta2_deg}^\\circ$$\n\n【(3) 最大次数 $m_{\\max}$】\n回折光が存在できる物理的上限は $\\sin\\theta \\le 1$ であるため：\n$$m \\le \\frac{d}{\\lambda} = \\frac{${d_m.toExponential(3)}}{${lambda_nm}\\times 10^{-9}} = ${(d_m / lambda_m).toFixed(2)}$$\n$m$ は整数であるため、$m_{\\max} = ${m_max}$ となります。`,
        solutionFormulas: [
          { title: '回折格子の明線公式', latex: 'd\\sin\\theta = m\\lambda', note: '各スリットからの光路差が波長の整数倍' },
          { title: '観測可能次数の限界', latex: 'm_{\\max} = \\lfloor d/\\lambda \\rfloor', note: '$\\sin\\theta \\le 1$ による幾何学的制限' }
        ]
      });
    },

    // 7. ヤングの干渉実験と薄膜挿入による縞のシフト
    () => {
      const d_mm = [0.2, 0.4, 0.5][Math.floor(Math.random() * 3)]; // スリット間隔 mm
      const L_m = [1.0, 1.5, 2.0][Math.floor(Math.random() * 3)];   // スクリーン距離 m
      const lambda_nm = [500, 600][Math.floor(Math.random() * 2)];
      const n_film = 1.5; // ガラス薄膜
      const t_um = [2.0, 3.0, 4.0][Math.floor(Math.random() * 3)]; // 薄膜の厚さ um

      const d = d_mm * 1e-3;
      const L = L_m;
      const lambda = lambda_nm * 1e-9;
      const t = t_um * 1e-6;

      const dx_mm = ((L * lambda / d) * 1000).toFixed(2);
      // 光路差 Delta = (n - 1) * t
      // 中央明線の移動距離 X = L / d * (n - 1) * t
      const X_mm = (((L * (n_film - 1) * t) / d) * 1000).toFixed(2);
      const shift_fringe_count = (parseFloat(X_mm) / parseFloat(dx_mm)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'young-interference',
        category: '光の干渉とヤングの実験',
        title: `ヤングの実験における片スリットへの透明薄膜挿入と干渉縞の平行移動`,
        prompt: `スリット間隔 $d = ${d_mm}\\ \\text{mm}$ の複スリットから距離 $L = ${L_m}\\ \\text{m}$ 離れたスクリーンに波長 $\\lambda = ${lambda_nm}\\ \\text{nm}$ の単色光を照射し、ヤングの干渉縞を観測した。\n(1) スクリーン上での隣り合う明線の間隔 $\\Delta x$ [mm] を求めよ。\n(2) 上側のスリット $S_1$ の直後に屈折率 $n = ${n_film}$、厚さ $t = ${t_um}\\ \\mu\\text{m}$ の透明な薄膜を貼り付けた。薄膜を通過する光の光路長（光学距離）は空気中と比べてどれだけ長くなるか。\n(3) この薄膜を貼ったことにより、中央の明線（光路差ゼロの点）はスクリーン上で上向き・下向きのどちらに何 mm 移動するか。`,
        hint: `屈折率 $n$ の媒質中を距離 $t$ 進む光の光路長（光学距離）は $nt$ です。薄膜を通ることで生じる余分な光路長は $(n - 1)t$ となります。中央明線は両スリットからの全光路差が等しくなる位置に移動するため、薄膜を置いたスリットの側（上側）にシフトします。`,
        level: 7,
        answer: `(1) 縞間隔: $\\Delta x = ${dx_mm}\\ \\text{mm}$  (2) 光路差増加量: $(n-1)t = ${( (n_film - 1)*t_um ).toFixed(2)}\\ \\mu\\text{m}$  (3) 移動量: 上向きに $X = ${X_mm}\\ \\text{mm}$（縞 ${shift_fringe_count} 本分）`,
        explanation: `【(1) 通常の干渉縞間隔】\nヤングの干渉実験の縞間隔公式より：\n$$\\Delta x = \\frac{L\\lambda}{d} = \\frac{${L_m} \\times (${lambda_nm}\\times 10^{-9})}{${d_mm}\\times 10^{-3}} = ${dx_mm}\\times 10^{-3}\\ \\text{m} = ${dx_mm}\\ \\text{mm}$$\n\n【(2) 薄膜による光路長の増加】\n厚さ $t$ の薄膜を通過する光の光学距離は $nt$、薄膜がない場合の空気中での光学距離は $1\\times t = t$ です。\nしたがって光路長は：\n$$\\Delta L = nt - t = (n - 1)t = (${n_film} - 1)\\times ${t_um}\\times 10^{-6}\\ \\text{m} = ${( (n_film - 1)*t_um ).toFixed(2)}\\ \\mu\\text{m}$$\nだけ長くなります。\n\n【(3) 干渉縞の移動】\nスクリーン上の座標を $x$（上向き正）とすると、$S_1$ と $S_2$ からの幾何学的経路差は $\\frac{d}{L}x$ です。\n薄膜による光路長増加を加えた全光路差は：\n$$\\Delta = \\left(\\frac{d}{L}x - (n - 1)t\\right)$$\n中央明線（全光路差 $\\Delta = 0$）の位置 $X$ は：\n$$\\frac{d}{L}X = (n - 1)t \\implies X = \\frac{L}{d}(n - 1)t = \\frac{${L_m}}{${d_mm}\\times 10^{-3}} \\times ${( (n_film - 1)*t_um ).toFixed(2)}\\times 10^{-6} = ${X_mm}\\ \\text{mm}$$\n値が正であるため、【上向きに ${X_mm} mm】移動します。`,
        solutionFormulas: [
          { title: 'ヤングの縞間隔', latex: '\\Delta x = \\frac{L\\lambda}{d}', note: 'スリット間隔とスクリーン距離' },
          { title: '薄膜による光路差', latex: '\\Delta = (n - 1)t', note: '光学距離と幾何学的距離の差' },
          { title: '縞のシフト量', latex: 'X = \\frac{L}{d}(n - 1)t', note: '光路差補償による中心縞の移動' }
        ]
      });
    },

    // 8. 弦の固有振動と線密度・張力・波の速さ
    () => {
      const L = [0.6, 0.8, 1.0][Math.floor(Math.random() * 3)]; // 弦の長さ m
      const m_string_g = [1.2, 1.6, 2.0][Math.floor(Math.random() * 3)]; // 弦の質量 g
      const M_load_kg = [1.0, 2.0, 4.0][Math.floor(Math.random() * 3)];  // おもりの質量 kg
      const g = 9.8;

      const rho = (m_string_g * 1e-3) / L; // kg/m
      const T_tension = M_load_kg * g;     // N
      const v_wave = Math.sqrt(T_tension / rho).toFixed(1);
      const f1 = (parseFloat(v_wave) / (2 * L)).toFixed(1);
      const f2 = (2 * parseFloat(f1)).toFixed(1);
      const f3 = (3 * parseFloat(f1)).toFixed(1);

      return createProblem({
        id: nextId(),
        unitId: 'waves',
        topicId: 'string-vibrations',
        category: '弦の振動と定常波',
        title: `張力とおもりの質量による弦の固有振動数と倍振動 (長さ L = ${L} m)`,
        prompt: `長さ $L = ${L}\\ \\text{m}$、質量 $m = ${m_string_g}\\ \\text{g}$ の一様な弦の一端を固定し、滑車を通して他端に質量 $M = ${M_load_kg}\\ \\text{kg}$ のおもりを吊り下げて水平に張った。重力加速度を $g = 9.8\\ \\text{m/s}^2$ とする。\n(1) 弦の線密度 $\\rho$ [kg/m] および弦を伝わる横波の速さ $v$ [m/s] を求めよ。\n(2) 弦に生じる基本振動の振動数 $f_1$、および 2倍振動・3倍振動の振動数 $f_2, f_3$ を求めよ。\n(3) おもりの質量を 4倍（$4M$）にしたとき、基本振動の振動数は何倍になるか。`,
        hint: `弦を伝わる波の速さは $v = \\sqrt{\\frac{T}{\\rho}}$（$T$ は張力、$\\rho$ は線密度）で与えられます。両端固定の弦の定常波の波長は $\\lambda_n = \\frac{2L}{n}$（$n = 1, 2, 3, \\dots$）となり、固有振動数は $f_n = \\frac{v}{\\lambda_n} = \\frac{n}{2L}v$ となります。`,
        level: 5,
        answer: `(1) 線密度: $\\rho = ${rho.toExponential(2)}\\ \\text{kg/m}$, 速さ: $v = ${v_wave}\\ \\text{m/s}$  (2) 固有振動数: $f_1 = ${f1}\\ \\text{Hz}$, $f_2 = ${f2}\\ \\text{Hz}$, $f_3 = ${f3}\\ \\text{Hz}$  (3) 2倍（$v \\propto \\sqrt{T} \\propto \\sqrt{M}$ より）`,
        explanation: `【(1) 線密度と波の速さ】\n線密度：$$\\rho = \\frac{m}{L} = \\frac{${m_string_g}\\times 10^{-3}\\ \\text{kg}}{${L}\\ \\text{m}} = ${rho.toExponential(2)}\\ \\text{kg/m}$$\n弦の張力は吊るしたおもりの重力に等しいため：\n$$T = Mg = ${M_load_kg} \\times 9.8 = ${T_tension.toFixed(1)}\\ \\text{N}$$\n弦を伝わる横波の速さ：\n$$v = \\sqrt{\\frac{T}{\\rho}} = \\sqrt{\\frac{${T_tension.toFixed(1)}}{${rho.toExponential(2)}}} = ${v_wave}\\ \\text{m/s}$$\n\n【(2) 固有振動数】\n両端固定の弦では、長さ $L$ の中に半波長が $n$ 個入るため：\n$$L = n \\frac{\\lambda_n}{2} \\implies \\lambda_n = \\frac{2L}{n}$$\n固有振動数は：\n$$f_n = \\frac{v}{\\lambda_n} = \\frac{n}{2L}v$$\n基本振動（$n=1$）：$$f_1 = \\frac{${v_wave}}{2 \\times ${L}} = ${f1}\\ \\text{Hz}$$\n2倍振動（$n=2$）：$$f_2 = 2 f_1 = ${f2}\\ \\text{Hz}$$\n3倍振動（$n=3$）：$$f_3 = 3 f_1 = ${f3}\\ \\text{Hz}$$\n\n【(3) おもりの質量を 4倍にしたとき】\n$$f_1 = \\frac{1}{2L}\\sqrt{\\frac{Mg}{\\rho}} \\propto \\sqrt{M}$$\nしたがって $M \\to 4M$ とすると、基本振動数は $\\sqrt{4} = 2$ 倍になります。`,
        solutionFormulas: [
          { title: '弦を伝わる波の速さ', latex: 'v = \\sqrt{\\frac{S}{\\rho}}', note: '張力 $S$ と線密度 $\\rho$ の関係' },
          { title: '両端固定弦の固有振動数', latex: 'f_n = \\frac{n}{2L}\\sqrt{\\frac{S}{\\rho}}', note: '節が両端にある定常波条件' }
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
  generateWavesProblems
};
