import '../models/physics_models.dart';
import 'custom_content.dart';

// Built-in problems live here. Duplicate the problem template in
// custom_content.dart when adding user-maintained content.
const List<PhysicsProblem> _kBuiltInPhysicsProblems = <PhysicsProblem>[
  PhysicsProblem(
    id: 'momentum-free',
    unitId: 'mechanics',
    topicId: 'momentum',
    title: '運動量保存の基本',
    prompt:
        '質量2.0 kgの台車Aが右向きに3.0 m/sで進み、静止していた質量1.0 kgの台車Bと衝突して一体になった。衝突後の速度を求めなさい。摩擦は無視する。',
    hint: '右向きを正にし、衝突前後で 2.0×3.0+1.0×0=(2.0+1.0)v と立式します。',
    level: 1,
    answer: '衝突後の速度は右向きに2.0 m/sです。',
    explanation:
        '台車AとBを1つの系とみると、衝突中の外力の力積は無視できます。右向きを正として、衝突前後の全運動量を等しくします。最後に、速度が正なので右向きだと確認します。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '運動量保存',
        expression: '2.0×3.0+1.0×0=(2.0+1.0)v',
        latex: r'2.0\times3.0+1.0\times0=(2.0+1.0)v',
        note: '衝突前後で全運動量を等しくします。',
      ),
      PhysicsFormula(
        title: '計算',
        expression: 'v=2.0 m/s',
        latex: r'v=2.0\ \mathrm{m/s}',
        note: '正の値なので右向きです。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'interference-free',
    unitId: 'waves',
    topicId: 'interference',
    title: 'ヤングの干渉',
    prompt:
        '間隔0.50 mmの2つのスリットへ波長600 nmの単色光を当て、2.0 m先のスクリーンに干渉縞を作った。明線の間隔を求めなさい。',
    hint: 'すべてmに直し、縞間隔 Δx=Lλ/d を使います。答えはmm程度になります。',
    level: 2,
    answer: '明線の間隔は2.4 mmです。',
    explanation:
        'スリット間隔d、スクリーンまでの距離L、波長λをすべてSI単位へ直します。ヤングの干渉では、隣り合う明線の間隔はLλ/dで求められます。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '単位の変換',
        expression: 'd=5.0×10⁻⁴ m, λ=6.0×10⁻⁷ m, L=2.0 m',
        latex:
            r'd=5.0\times10^{-4}\ \mathrm{m},\quad \lambda=6.0\times10^{-7}\ \mathrm{m},\quad L=2.0\ \mathrm{m}',
        note: '0.50 mm=5.0×10⁻⁴ m、600 nm=6.0×10⁻⁷ mです。',
      ),
      PhysicsFormula(
        title: '明線間隔',
        expression: 'Δx=Lλ/d=2.4×10⁻³ m=2.4 mm',
        latex:
            r'\Delta x=\frac{L\lambda}{d}=2.4\times10^{-3}\ \mathrm{m}=2.4\ \mathrm{mm}',
        note: '隣り合う明線の間隔です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'circuit-free',
    unitId: 'electromagnetism',
    topicId: 'circuit',
    title: '並列回路の電流',
    prompt: '6.0 Ωと3.0 Ωの抵抗を並列につなぎ、両端へ12 Vを加えた。各抵抗を流れる電流と回路全体の電流を求めなさい。',
    hint: '並列回路では各抵抗の電圧が12 Vです。I=V/Rで各枝を求め、分岐電流を足します。',
    level: 3,
    answer: '6.0 Ωには2.0 A、3.0 Ωには4.0 A、全体には6.0 Aが流れます。',
    explanation:
        '並列回路では各抵抗にかかる電圧が等しく12 Vです。オームの法則で枝電流を求め、キルヒホッフの電流則から全体の電流を足し合わせます。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '各枝の電流',
        expression: 'I₆=12/6.0=2.0 A, I₃=12/3.0=4.0 A',
        latex:
            r'I_{6}=\frac{12}{6.0}=2.0\ \mathrm{A},\quad I_{3}=\frac{12}{3.0}=4.0\ \mathrm{A}',
        note: '各抵抗の両端電圧は12 Vです。',
      ),
      PhysicsFormula(
        title: '全体の電流',
        expression: 'I=I₆+I₃=6.0 A',
        latex: r'I=I_{6}+I_{3}=6.0\ \mathrm{A}',
        note: '分岐する電流の和が全体の電流です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'heat-free',
    unitId: 'thermodynamics',
    topicId: 'heat',
    title: '水を温める熱量',
    prompt:
        '20 ℃の水0.20 kgを80 ℃まで温めるのに必要な熱量を求めなさい。水の比熱を4.2×10³ J/(kg·K)、容器の熱容量と熱損失は無視する。',
    hint: '温度差は60 Kです。Q=mcΔTへ質量、比熱、温度差を代入します。',
    level: 4,
    answer: '必要な熱量は5.04×10⁴ Jです。',
    explanation:
        '温度差は80-20=60 Kです。水だけを考えるので、熱量の公式Q=mcΔTへ質量0.20 kg、比熱4.2×10³ J/(kg·K)、温度差60 Kを代入します。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '温度差',
        expression: 'ΔT=80-20=60 K',
        latex: r'\Delta T=80-20=60\ \mathrm{K}',
        note: '温度差は摂氏でもケルビンでも数値が同じです。',
      ),
      PhysicsFormula(
        title: '熱量',
        expression: 'Q=mcΔT=0.20×4.2×10³×60=5.04×10⁴ J',
        latex:
            r'Q=mc\Delta T=0.20\times4.2\times10^3\times60=5.04\times10^4\ \mathrm{J}',
        note: '熱損失と容器の熱容量は無視しています。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'photoelectric-free',
    unitId: 'atomic',
    topicId: 'photoelectric',
    title: '光電子の最大運動エネルギー',
    prompt: '仕事関数2.2 eVの金属へ、光子エネルギー3.0 eVの光を当てた。光電子の最大運動エネルギーと阻止電圧を求めなさい。',
    hint: 'hf=W+K_maxとK_max=eV_sを順に使います。eV単位で扱うと、数値的にK_max[eV]=V_s[V]です。',
    level: 5,
    answer: '最大運動エネルギーは0.8 eV、阻止電圧は0.8 Vです。',
    explanation:
        '光子のエネルギーから仕事関数を引いた残りが、光電子の最大運動エネルギーです。eV単位で計算すると、最大運動エネルギーの数値が阻止電圧の数値になります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '光電方程式',
        expression: 'K_max=3.0-2.2=0.8 eV',
        latex: r'K_{\max}=3.0-2.2=0.8\ \mathrm{eV}',
        note: '光子エネルギーから仕事関数を引きます。',
      ),
      PhysicsFormula(
        title: '阻止電圧',
        expression: 'K_max=eV_s → V_s=0.8 V',
        latex: r'K_{\max}=eV_s\quad\Longrightarrow\quad V_s=0.8\ \mathrm{V}',
        note: '電子1個の電荷eを使います。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'momentum-premium-1',
    unitId: 'mechanics',
    topicId: 'momentum',
    title: '衝突とばねの複合問題',
    prompt:
        '水平面上で質量mの小球が速さv₀で進み、静止した質量2mの物体へ完全非弾性衝突した。衝突後、2物体は一体となってばね定数kのばねを縮める。最大圧縮量を求めなさい。摩擦はない。',
    hint: '衝突中は運動量保存、衝突後から最大圧縮までは力学的エネルギー保存です。衝突で運動エネルギーが保存しない点に注意します。',
    level: 6,
    answer: '最大圧縮量は x=v₀√(m/(3k)) です。',
    explanation:
        'まず衝突中だけを考えて運動量を保存します。完全非弾性衝突なので、衝突後の一体化した物体の速さを求めた後、その運動エネルギーがばねの弾性エネルギーへ変わるとして最大圧縮量を求めます。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '衝突直後の速度',
        expression: 'mv₀=(m+2m)V → V=v₀/3',
        latex: r'mv_0=(m+2m)V\quad\Longrightarrow\quad V=\frac{v_0}{3}',
        note: '衝突中は運動量保存を使います。',
      ),
      PhysicsFormula(
        title: 'ばねの最大圧縮',
        expression: '1/2(3m)V²=1/2kx² → x=v₀√(m/(3k))',
        latex:
            r'\frac{1}{2}(3m)V^2=\frac{1}{2}kx^2\quad\Longrightarrow\quad x=v_0\sqrt{\frac{m}{3k}}',
        note: '衝突後は力学的エネルギー保存です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'circular-premium-1',
    unitId: 'mechanics',
    topicId: 'circular-motion',
    title: '鉛直面内の円運動',
    prompt:
        '長さlの軽い糸につけた質量mの小球を鉛直面内で回す。円の最高点で糸がたるまないために必要な最小の速さと、そのとき最低点で必要な速さを求めなさい。',
    hint: '最高点で張力が0になる場合が限界です。その後、最高点と最低点の間で力学的エネルギー保存を使います。',
    level: 7,
    answer: '最高点の最小速度は√(gl)、最低点の速度は√(5gl)です。',
    explanation:
        '最高点で糸がたるまない限界では張力が0です。最高点では重力だけが向心力になる条件を使い、その後は最高点から最低点までの高さ2lの位置エネルギー変化を運動エネルギーへ変換します。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '最高点の限界条件',
        expression: 'mg=mv_top²/l → v_top=√(gl)',
        latex:
            r'mg=\frac{mv_{\mathrm{top}}^2}{l}\quad\Longrightarrow\quad v_{\mathrm{top}}=\sqrt{gl}',
        note: '最高点で張力T=0とします。',
      ),
      PhysicsFormula(
        title: '最低点の速度',
        expression: '1/2mv_bottom²=1/2mgl+2mgl → v_bottom=√(5gl)',
        latex:
            r'\frac{1}{2}mv_{\mathrm{bottom}}^2=\frac{1}{2}mgl+2mgl\quad\Longrightarrow\quad v_{\mathrm{bottom}}=\sqrt{5gl}',
        note: '最高点から最低点まで2lだけ下がります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'wave-premium-1',
    unitId: 'waves',
    topicId: 'sine-wave',
    title: '正弦波と位相差',
    prompt:
        '波 y=A sin(4πt-2πx+π/3) がSI単位で表されている。振幅を除く角振動数、振動数、波数、波長、波の速さ、+x方向に0.25 m離れた2点の位相差を求めなさい。',
    hint: 'y=A sin(ωt-kx+φ)と係数を比較し、f=ω/(2π)、λ=2π/k、v=ω/kを使います。',
    level: 8,
    answer:
        'ω=4π rad/s、f=2.0 Hz、k=2π rad/m、λ=1.0 m、波の速さは2.0 m/s、位相差の大きさはπ/2です。',
    explanation:
        '与えられた波の式を標準形y=A sin(ωt-kx+φ)と比較します。x方向に0.25 m離れた点の位相差はkΔxで求めます。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '係数の比較',
        expression: 'ω=4π, k=2π',
        latex: r'\omega=4\pi\ \mathrm{rad/s},\quad k=2\pi\ \mathrm{rad/m}',
        note: '波の式のtとxの係数を読み取ります。',
      ),
      PhysicsFormula(
        title: '振動数・波長・速さ',
        expression: 'f=ω/(2π)=2 Hz, λ=2π/k=1 m, v=fλ=2 m/s',
        latex:
            r'f=\frac{\omega}{2\pi}=2\ \mathrm{Hz},\quad \lambda=\frac{2\pi}{k}=1\ \mathrm{m},\quad v=f\lambda=2\ \mathrm{m/s}',
        note: '基本式v=fλを使います。',
      ),
      PhysicsFormula(
        title: '位相差',
        expression: '|Δφ|=kΔx=2π×0.25=π/2',
        latex: r'|\Delta\phi|=k\Delta x=2\pi\times0.25=\frac{\pi}{2}',
        note: '大きさを求めています。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'field-premium-1',
    unitId: 'electromagnetism',
    topicId: 'electric-field',
    title: '電場と電位の重ね合わせ',
    prompt: 'x軸上のx=-aに+Q、x=+aに-Qを固定した。原点の電位と電場を求め、電位が0でも電場が0とは限らない理由を説明しなさい。',
    hint: '電位はスカラーとして符号付きで加え、電場は各電荷が原点に作る向きを図示してベクトル合成します。',
    level: 6,
    answer: '原点の電位は0、電場は+ x方向に2kQ/a²です。',
    explanation:
        '原点は2つの電荷から同じ距離aにあります。電位はスカラーなので+Qと-Qの寄与が打ち消し合います。一方、電場はどちらの電荷によるものも+x方向を向くため、強さが加わります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '原点の電位',
        expression: 'V=kQ/a+k(-Q)/a=0',
        latex: r'V=\frac{kQ}{a}+\frac{k(-Q)}{a}=0',
        note: '電位はスカラー量です。',
      ),
      PhysicsFormula(
        title: '原点の電場',
        expression: 'E=kQ/a²+kQ/a²=2kQ/a² (+x方向)',
        latex:
            r'E=\frac{kQ}{a^2}+\frac{kQ}{a^2}=\frac{2kQ}{a^2}\quad(+x\ \text{方向})',
        note: '2つの電場が同じ向きなので加わります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'thermo-premium-1',
    unitId: 'thermodynamics',
    topicId: 'first-law',
    title: 'P-V図と熱力学第一法則',
    prompt:
        '単原子分子理想気体n molを、状態(P₀,V₀)から圧力2P₀まで定積加熱し、その後圧力2P₀のまま体積2V₀まで膨張させた。全過程で気体がした仕事、内部エネルギー変化、受け取った熱を求めなさい。',
    hint: '各状態の温度をPV=nRTで比較します。仕事はP-V図の面積、内部エネルギーはΔU=3nRΔT/2、最後にQ=ΔU+W_byです。',
    level: 8,
    answer: '気体がした仕事は2P₀V₀、内部エネルギー変化は(9/2)P₀V₀、受け取った熱は(13/2)P₀V₀です。',
    explanation:
        '初期状態をT₁とすると、定積加熱後は温度2T₁、膨張後は4T₁です。仕事は定圧膨張のP-V図の面積、内部エネルギー変化は単原子理想気体の公式から求め、熱力学第一法則Q=ΔU+Wで熱量を出します。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '仕事',
        expression: 'W=2P₀(2V₀-V₀)=2P₀V₀',
        latex: r'W=2P_0(2V_0-V_0)=2P_0V_0',
        note: '定積過程の仕事は0です。',
      ),
      PhysicsFormula(
        title: '内部エネルギー',
        expression: 'ΔU=3/2 nR(4T₁-T₁)=9/2 P₀V₀',
        latex: r'\Delta U=\frac{3}{2}nR(4T_1-T_1)=\frac{9}{2}P_0V_0',
        note: 'P₀V₀=nRT₁を使います。',
      ),
      PhysicsFormula(
        title: '受け取った熱',
        expression: 'Q=ΔU+W=(13/2)P₀V₀',
        latex: r'Q=\Delta U+W=\frac{13}{2}P_0V_0',
        note: '気体がした仕事を正とする符号の約束です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'atomic-premium-1',
    unitId: 'atomic',
    topicId: 'bohr-model',
    title: '水素原子の遷移と物質波',
    prompt:
        '水素原子の電子がn=3からn=2へ遷移するときに放出される光子のエネルギーと波長を求めなさい。また同じ運動量を持つ電子のド・ブロイ波長との比較方法を説明しなさい。',
    hint: 'E_n=-13.6/n² eVから準位差を求め、λ=hc/ΔEを使います。電子側はλ=h/pなので、比較には運動量pの情報が必要です。',
    level: 9,
    answer:
        '光子エネルギーは約1.89 eV、波長は約656 nmです。電子の波長はλ=h/pで、運動量pが分からないため数値比較はできません。',
    explanation:
        '水素原子のn=3とn=2のエネルギー準位を求め、その差が放出光子のエネルギーになります。波長はhc/ΔEで計算します。電子は同じエネルギーではなく「同じ運動量」と条件が指定されているので、比較式はド・ブロイの式を使います。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '準位差',
        expression: 'ΔE=|-13.6/2²-(-13.6/3²)|=1.89 eV',
        latex:
            r'\Delta E=\left|-\frac{13.6}{2^2}-\left(-\frac{13.6}{3^2}\right)\right|\simeq1.89\ \mathrm{eV}',
        note: '放出される光子のエネルギーです。',
      ),
      PhysicsFormula(
        title: '光の波長',
        expression: 'λ=hc/ΔE≈656 nm',
        latex: r'\lambda=\frac{hc}{\Delta E}\simeq656\ \mathrm{nm}',
        note: '水素のバルマー系列Hα線に対応します。',
      ),
      PhysicsFormula(
        title: '物質波との比較',
        expression: 'λ_e=h/p',
        latex: r'\lambda_{e}=\frac{h}{p}',
        note: '電子の運動量pの値が必要です。',
      ),
    ],
  ),
];

// Problems from the extension file are merged into the problem screen.
const List<PhysicsProblem> kPhysicsProblems = <PhysicsProblem>[
  ..._kBuiltInPhysicsProblems,
  ...kAdditionalPhysicsProblems,
];
