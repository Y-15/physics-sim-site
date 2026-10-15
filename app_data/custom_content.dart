import '../models/physics_models.dart';

// This file is the single extension point for adding user-maintained content.
// Duplicate a complete PhysicsProblem block, then edit the ID and text.
// IDs must use ASCII letters, digits, underscores, or hyphens and remain unique.

// Add learning topics to these lists when a new topic is needed.
const List<PhysicsTopic> kAdditionalMechanicsTopics = <PhysicsTopic>[];
const List<PhysicsTopic> kAdditionalThermodynamicsTopics = <PhysicsTopic>[];
const List<PhysicsTopic> kAdditionalWavesTopics = <PhysicsTopic>[];
const List<PhysicsTopic> kAdditionalElectromagnetismTopics = <PhysicsTopic>[];
const List<PhysicsTopic> kAdditionalAtomicTopics = <PhysicsTopic>[];

// Add a new PhysicsUnit here only when creating an entirely new subject area.
const List<PhysicsUnit> kAdditionalPhysicsUnits = <PhysicsUnit>[];

// Problems are grouped by unit in this file. Duplicate the block that best
// matches the desired difficulty. Levels 3-4 use rewarded unlocks; levels 5-9
// require the premium purchase.
const List<PhysicsProblem> kAdditionalPhysicsProblems = <PhysicsProblem>[
  // ---------------------------------------------------------------------------
  // Mechanics
  // ---------------------------------------------------------------------------
  PhysicsProblem(
    id: 'mechanics-uniform-acceleration-basic-1',
    unitId: 'mechanics',
    topicId: 'uniform-acceleration',
    title: '等加速度運動の速度',
    prompt: '初速度2.0 m/s、加速度3.0 m/s^2で4.0 s運動する物体の速度を求めなさい。',
    hint: '速度の公式 v=v_0+at に、分かっている値を代入します。',
    level: 1,
    answer: '速度は14 m/sです。',
    explanation: '速度の公式に初速度、加速度、時間を代入すると、2.0+3.0×4.0=14となります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '速度の公式',
        expression: 'v=v_0+at=2.0+3.0×4.0=14 m/s',
        latex: r'v=v_0+at=2.0+3.0\times4.0=14\ \mathrm{m/s}',
        note: '加速度と時間の積が速度の変化量です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'mechanics-projectile-basic-1',
    unitId: 'mechanics',
    topicId: 'projectile-motion',
    title: '鉛直投げ上げの位置',
    prompt: '物体を初速度20 m/sで鉛直上向きに投げます。g=10 m/s^2として、1.0 s後の高さを求めなさい。',
    hint: '上向きを正にして y=v_0t-1/2gt^2 を使います。',
    level: 2,
    answer: '投げた位置から15 mの高さです。',
    explanation: '上向きを正にすると加速度は-gです。y=20×1.0-1/2×10×(1.0)^2=15 mとなります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '位置の公式',
        expression: 'y=v_0t-1/2gt^2=20×1.0-1/2×10×1.0^2=15 m',
        latex:
            r'y=v_0t-\frac{1}{2}gt^2=20\times1.0-\frac{1}{2}\times10\times(1.0)^2=15\ \mathrm{m}',
        note: '鉛直上向きを正にしたため、重力加速度の符号は負です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'mechanics-newton-law-basic-1',
    unitId: 'mechanics',
    topicId: 'newton-law',
    title: '運動方程式から加速度',
    prompt: '質量2.0 kgの物体を水平方向に6.0 Nの合力で押します。加速度を求めなさい。',
    hint: '運動方程式 F=ma を使い、aについて解きます。',
    level: 3,
    answer: '加速度は3.0 m/s^2です。',
    explanation: '物体には合力6.0 Nが働くので、6.0=2.0aです。したがってa=3.0 m/s^2となります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '運動方程式',
        expression: 'F=ma  →  a=F/m=6.0/2.0=3.0 m/s^2',
        latex:
            r'F=ma\quad\Longrightarrow\quad a=\frac{F}{m}=\frac{6.0}{2.0}=3.0\ \mathrm{m/s^2}',
        note: 'Fは物体に働く合力です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'mechanics-energy-basic-1',
    unitId: 'mechanics',
    topicId: 'energy',
    title: '重力による位置エネルギー',
    prompt: '質量2.0 kgの物体を基準面から5.0 mの高さに置きます。g=10 m/s^2として位置エネルギーを求めなさい。',
    hint: '重力による位置エネルギーはU=mghです。',
    level: 4,
    answer: '位置エネルギーは100 Jです。',
    explanation: '基準面を位置エネルギー0とすると、U=2.0×10×5.0=100 Jです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '位置エネルギー',
        expression: 'U=mgh=2.0×10×5.0=100 J',
        latex: r'U=mgh=2.0\times10\times5.0=100\ \mathrm{J}',
        note: '基準面の選び方で位置エネルギーの値は変わりますが、差は同じです。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'mechanics-friction-standard-1',
    unitId: 'mechanics',
    topicId: 'friction',
    title: '水平面上の動摩擦力',
    prompt: '質量5.0 kgの物体を水平に20 Nで引きます。動摩擦係数を0.20、g=10 m/s^2として加速度を求めなさい。',
    hint: '垂直抗力N=mg、動摩擦力f=μNです。引く力から摩擦力を引きます。',
    level: 5,
    answer: '加速度は2.0 m/s^2です。',
    explanation:
        'N=50 N、f=0.20×50=10 Nです。合力は20-10=10 Nなので、a=10/5.0=2.0 m/s^2です。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '摩擦力と合力',
        expression: 'N=mg=50 N,  f=μN=10 N,  F_net=20-10=10 N',
        latex:
            r'N=mg=50\ \mathrm{N},\quad f=\mu N=10\ \mathrm{N},\quad F_{\mathrm{net}}=20-10=10\ \mathrm{N}',
        note: '水平面上で鉛直方向に加速度がないため、N=mgです。',
      ),
      PhysicsFormula(
        title: '加速度',
        expression: 'a=F_net/m=10/5.0=2.0 m/s^2',
        latex:
            r'a=\frac{F_{\mathrm{net}}}{m}=\frac{10}{5.0}=2.0\ \mathrm{m/s^2}',
        note: '運動方向を正に取っています。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'mechanics-gravitation-standard-1',
    unitId: 'mechanics',
    topicId: 'gravitation',
    title: '高度による重力加速度',
    prompt: '地球の中心から2Rの距離にある場所での重力加速度を、地表のgを使って表しなさい。',
    hint: '重力加速度は中心からの距離rの2乗に反比例します。',
    level: 6,
    answer: '重力加速度はg/4です。',
    explanation: 'g(r)=GM/r^2より、r=Rのときのgと比べると、距離が2倍なので重力加速度は1/4になります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '重力加速度の比',
        expression: 'g(2R)/g(R)=(R/2R)^2=1/4',
        latex: r'\frac{g(2R)}{g(R)}=\left(\frac{R}{2R}\right)^2=\frac{1}{4}',
        note: '地球の自転や空気抵抗は考えません。',
      ),
    ],
  ),

  // ---------------------------------------------------------------------------
  // Waves
  // ---------------------------------------------------------------------------
  PhysicsProblem(
    id: 'waves-basics-basic-1',
    unitId: 'waves',
    topicId: 'wave-basics',
    title: '波の速さと波長',
    prompt: '振動数5.0 Hz、波長0.40 mの波の速さを求めなさい。',
    hint: '波の基本式v=fλを使います。',
    level: 1,
    answer: '波の速さは2.0 m/sです。',
    explanation: '1秒あたり5.0回振動し、1回の波長が0.40 mなので、5.0×0.40=2.0 m/sです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '波の基本式',
        expression: 'v=fλ=5.0×0.40=2.0 m/s',
        latex: r'v=f\lambda=5.0\times0.40=2.0\ \mathrm{m/s}',
        note: '振動数と波長の積が波の速さです。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'waves-sound-basic-1',
    unitId: 'waves',
    topicId: 'sound',
    title: '反射音から距離を求める',
    prompt: '音を出してから1.0 s後に山から反射音が聞こえました。音速を340 m/sとして山までの距離を求めなさい。',
    hint: '音は往復するので、距離はvtを2で割ります。',
    level: 2,
    answer: '山までの距離は170 mです。',
    explanation: '音が進んだ全距離は340×1.0=340 mです。片道の距離はその半分なので170 mです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '往復距離',
        expression: '2L=vt  →  L=340×1.0/2=170 m',
        latex:
            r'2L=vt\quad\Longrightarrow\quad L=\frac{340\times1.0}{2}=170\ \mathrm{m}',
        note: '発した場所から山までを片道の距離Lとしています。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'waves-standing-wave-basic-1',
    unitId: 'waves',
    topicId: 'standing-wave',
    title: '弦の定常波の振動数',
    prompt: '長さ0.60 mの両端固定の弦を、速さ120 m/sの波が伝わります。2倍振動の振動数を求めなさい。',
    hint: '両端固定の定常波ではf_n=nv/(2L)です。',
    level: 3,
    answer: '振動数は200 Hzです。',
    explanation: 'n=2を公式に代入すると、f_2=2×120/(2×0.60)=200 Hzです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '定常波の条件',
        expression: 'f_2=2v/(2L)=2×120/(2×0.60)=200 Hz',
        latex:
            r'f_2=\frac{2v}{2L}=\frac{2\times120}{2\times0.60}=200\ \mathrm{Hz}',
        note: '2倍振動では弦の長さに半波長が2個入ります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'waves-doppler-basic-1',
    unitId: 'waves',
    topicId: 'doppler',
    title: '音源が近づくときのドップラー効果',
    prompt: "音速340 m/sの空気中で、500 Hzの音源が20 m/sで観測者に近づきます。観測される振動数を求めなさい。",
    hint: "観測者が静止し音源が近づくとき、f'=vf/(v-v_s)です。",
    level: 4,
    answer: '振動数は約531 Hzです。',
    explanation: "音源が近づくため波長が短くなります。f'=340×500/(340-20)=531.25 Hzです。",
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'ドップラー効果',
        expression: "f'=vf/(v-v_s)=340×500/320=531.25 Hz",
        latex:
            r'f^\prime=\frac{vf}{v-v_s}=\frac{340\times500}{340-20}\simeq531\ \mathrm{Hz}',
        note: '音源が観測者へ近づく場合は分母がv-v_sです。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'waves-refraction-standard-1',
    unitId: 'waves',
    topicId: 'reflection-refraction',
    title: '屈折角を求める',
    prompt: '屈折率1.0の空気から屈折率1.5の物質へ、入射角sin i=0.60で光が進みます。屈折角を求めなさい。',
    hint: 'スネルの法則n_1 sin i=n_2 sin rを使います。',
    level: 5,
    answer: '屈折角は約23.6°です。',
    explanation: 'sin r=(1.0/1.5)×0.60=0.40なので、r=arcsin0.40≈23.6°です。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'スネルの法則',
        expression: '1.0×sin i=1.5×sin r  →  sin r=0.40',
        latex:
            r'n_1\sin i=n_2\sin r\quad\Longrightarrow\quad\sin r=\frac{1.0}{1.5}\times0.60=0.40',
        note: '角度は法線から測ります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'waves-lens-standard-1',
    unitId: 'waves',
    topicId: 'lens',
    title: '凸レンズの像の位置',
    prompt: '焦点距離0.20 mの凸レンズの前方0.30 mに物体を置きます。像の位置と倍率を求めなさい。',
    hint: 'レンズの公式1/f=1/u+1/vと倍率m=-v/uを使います。',
    level: 6,
    answer: '像はレンズの後方0.60 mにでき、倍率は-2.0です。',
    explanation: '1/v=1/0.20-1/0.30=1.667よりv=0.60 mです。倍率は-0.60/0.30=-2.0です。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'レンズの公式',
        expression: '1/v=1/0.20-1/0.30  →  v=0.60 m',
        latex:
            r'\frac{1}{v}=\frac{1}{0.20}-\frac{1}{0.30}\quad\Longrightarrow\quad v=0.60\ \mathrm{m}',
        note: '実像なので像はレンズの反対側にできます。',
      ),
      PhysicsFormula(
        title: '倍率',
        expression: 'm=-v/u=-0.60/0.30=-2.0',
        latex: r'm=-\frac{v}{u}=-\frac{0.60}{0.30}=-2.0',
        note: '負号は像が倒立であることを表します。',
      ),
    ],
  ),

  // ---------------------------------------------------------------------------
  // Electromagnetism
  // ---------------------------------------------------------------------------
  PhysicsProblem(
    id: 'em-potential-basic-1',
    unitId: 'electromagnetism',
    topicId: 'electric-potential',
    title: '電位による位置エネルギー',
    prompt: '電位12 Vの点に電気量3.0 Cの電荷を置きます。電気的位置エネルギーを求めなさい。',
    hint: '電気的位置エネルギーはU=qVです。',
    level: 1,
    answer: '電気的位置エネルギーは36 Jです。',
    explanation: 'U=qV=3.0×12=36 Jです。電荷と電位の符号にも注意します。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '電位と位置エネルギー',
        expression: 'U=qV=3.0×12=36 J',
        latex: r'U=qV=3.0\times12=36\ \mathrm{J}',
        note: '電位は単位電気量あたりの位置エネルギーです。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'em-capacitor-basic-1',
    unitId: 'electromagnetism',
    topicId: 'capacitor',
    title: 'コンデンサーの電気量とエネルギー',
    prompt: '容量4.0 μFのコンデンサーに12 Vを加えます。蓄えられる電気量とエネルギーを求めなさい。',
    hint: 'Q=CV、U=1/2CV^2を使います。',
    level: 2,
    answer: '電気量は48 μC、エネルギーは288 μJです。',
    explanation: 'Q=4.0×12=48 μC、U=1/2×4.0×12^2=288 μJです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '電気量',
        expression: 'Q=CV=4.0 μF×12 V=48 μC',
        latex: r'Q=CV=4.0\times10^{-6}\times12=48\times10^{-6}\ \mathrm{C}',
        note: 'μFとμCを使えば、値をそのまま計算できます。',
      ),
      PhysicsFormula(
        title: '静電エネルギー',
        expression: 'U=1/2CV^2=288 μJ',
        latex:
            r'U=\frac{1}{2}CV^2=\frac{1}{2}\times4.0\times10^{-6}\times12^2=288\ \mu\mathrm{J}',
        note: '電圧を2乗する点に注意します。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'em-magnetic-field-basic-1',
    unitId: 'electromagnetism',
    topicId: 'magnetic-field',
    title: '直線電流の磁場',
    prompt:
        '長い直線導線に2.0 Aの電流が流れています。導線から0.10 mの点の磁束密度を求めなさい。μ_0=4π×10^-7 T m/Aとします。',
    hint: '直線電流の磁場B=μ_0I/(2πr)を使います。',
    level: 4,
    answer: '磁束密度は4.0×10^-6 Tです。',
    explanation: 'B=(4π×10^-7×2.0)/(2π×0.10)=4.0×10^-6 Tです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '直線電流の磁場',
        expression: 'B=μ_0I/(2πr)=4.0×10^-6 T',
        latex:
            r'B=\frac{\mu_0I}{2\pi r}=\frac{4\pi\times10^{-7}\times2.0}{2\pi\times0.10}=4.0\times10^{-6}\ \mathrm{T}',
        note: '磁場の向きは右ねじの法則で決まります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'em-lorentz-force-standard-1',
    unitId: 'electromagnetism',
    topicId: 'lorentz-force',
    title: '磁場中の荷電粒子',
    prompt: '電気量2.0 μCの粒子が3.0×10^5 m/sで、磁束密度0.20 Tの磁場に垂直に入ります。磁気力の大きさを求めなさい。',
    hint: '速度と磁場が垂直なのでF=qvBです。',
    level: 5,
    answer: '磁気力は0.12 Nです。',
    explanation: 'F=qvB=2.0×10^-6×3.0×10^5×0.20=0.12 Nです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'ローレンツ力',
        expression: 'F=qvB=2.0×10^-6×3.0×10^5×0.20=0.12 N',
        latex:
            r'F=qvB=2.0\times10^{-6}\times3.0\times10^5\times0.20=0.12\ \mathrm{N}',
        note: '速度と磁場が垂直でない場合はsinθを掛けます。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'em-induction-standard-1',
    unitId: 'electromagnetism',
    topicId: 'induction',
    title: '電磁誘導の誘導起電力',
    prompt: '100回巻きコイルを通る磁束が0.020 Wbから0 Wbへ0.10 sで変化します。誘導起電力の大きさを求めなさい。',
    hint: 'ファラデーの法則E=N|ΔΦ/Δt|を使います。',
    level: 6,
    answer: '誘導起電力は20 Vです。',
    explanation: '磁束の変化量は0.020 Wbなので、E=100×0.020/0.10=20 Vです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'ファラデーの法則',
        expression: 'E=N|ΔΦ/Δt|=100×0.020/0.10=20 V',
        latex:
            r'E=N\left|\frac{\Delta\Phi}{\Delta t}\right|=100\times\frac{0.020}{0.10}=20\ \mathrm{V}',
        note: 'ここでは大きさだけを求めています。向きはレンツの法則で決まります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'em-ac-basic-1',
    unitId: 'electromagnetism',
    topicId: 'alternating-current',
    title: '交流回路の実効値',
    prompt: '抵抗50 Ωに実効値100 Vの交流電圧を加えます。実効電流と平均消費電力を求めなさい。',
    hint: 'オームの法則とP=V_rms^2/Rを使います。',
    level: 7,
    answer: '実効電流は2.0 A、平均消費電力は200 Wです。',
    explanation: 'I_rms=100/50=2.0 A、P=100^2/50=200 Wです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '実効電流',
        expression: 'I_rms=V_rms/R=100/50=2.0 A',
        latex:
            r'I_{\mathrm{rms}}=\frac{V_{\mathrm{rms}}}{R}=\frac{100}{50}=2.0\ \mathrm{A}',
        note: '抵抗だけの交流回路では、実効値でもオームの法則が使えます。',
      ),
      PhysicsFormula(
        title: '平均消費電力',
        expression: 'P=V_rms^2/R=100^2/50=200 W',
        latex:
            r'P=\frac{V_{\mathrm{rms}}^2}{R}=\frac{100^2}{50}=200\ \mathrm{W}',
        note: '抵抗は電気エネルギーを熱に変換します。',
      ),
    ],
  ),

  // ---------------------------------------------------------------------------
  // Thermodynamics
  // ---------------------------------------------------------------------------
  PhysicsProblem(
    id: 'thermo-gas-basic-1',
    unitId: 'thermodynamics',
    topicId: 'gas',
    title: '気体の圧力と体積',
    prompt:
        '温度一定の気体を、圧力1.0×10^5 Pa、体積2.0×10^-2 m^3から体積1.0×10^-2 m^3へ圧縮します。圧力を求めなさい。',
    hint: '温度一定ならボイルの法則P_1V_1=P_2V_2です。',
    level: 1,
    answer: '圧力は2.0×10^5 Paです。',
    explanation: 'P_2=P_1V_1/V_2=1.0×10^5×2.0×10^-2/(1.0×10^-2)=2.0×10^5 Paです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'ボイルの法則',
        expression: 'P_1V_1=P_2V_2  →  P_2=2.0×10^5 Pa',
        latex:
            r'P_1V_1=P_2V_2\quad\Longrightarrow\quad P_2=2.0\times10^5\ \mathrm{Pa}',
        note: '温度と物質量が一定の変化です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'thermo-kinetic-theory-basic-1',
    unitId: 'thermodynamics',
    topicId: 'kinetic-theory',
    title: '分子の平均運動エネルギー',
    prompt: '温度300 Kの理想気体分子1個の平均運動エネルギーを求めなさい。ボルツマン定数を1.38×10^-23 J/Kとします。',
    hint: '平均運動エネルギーは3/2 kTです。',
    level: 2,
    answer: '平均運動エネルギーは6.21×10^-21 Jです。',
    explanation: '3/2×1.38×10^-23×300=6.21×10^-21 Jです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '平均運動エネルギー',
        expression: 'K=3/2 kT=3/2×1.38×10^-23×300=6.21×10^-21 J',
        latex:
            r'K=\frac{3}{2}kT=\frac{3}{2}\times1.38\times10^{-23}\times300=6.21\times10^{-21}\ \mathrm{J}',
        note: '温度が高いほど分子の平均運動エネルギーは大きくなります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'thermo-first-law-basic-1',
    unitId: 'thermodynamics',
    topicId: 'first-law',
    title: '熱力学第一法則',
    prompt: '気体が500 Jの熱を受け取り、外部に200 Jの仕事をしました。気体の内部エネルギーの変化を求めなさい。',
    hint: '気体が外部へした仕事をWとすると、Q=ΔU+Wです。',
    level: 3,
    answer: '内部エネルギーは300 J増加します。',
    explanation: 'ΔU=Q-W=500-200=300 Jです。受け取った熱の一部が仕事に使われました。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '熱力学第一法則',
        expression: 'ΔU=Q-W=500-200=300 J',
        latex: r'\Delta U=Q-W=500-200=300\ \mathrm{J}',
        note: 'Wは気体が外部へした仕事として正に取っています。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'thermo-engine-basic-1',
    unitId: 'thermodynamics',
    topicId: 'heat-engine',
    title: '熱機関の効率',
    prompt: '熱機関が高温熱源から1000 Jを受け取り、低温熱源へ600 Jを捨てます。仕事と熱効率を求めなさい。',
    hint: '仕事W=Q_h-Q_c、熱効率e=W/Q_hです。',
    level: 4,
    answer: '仕事は400 J、熱効率は0.40です。',
    explanation: 'W=1000-600=400 J、e=400/1000=0.40です。百分率では40%です。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '仕事',
        expression: 'W=Q_h-Q_c=1000-600=400 J',
        latex: r'W=Q_h-Q_c=1000-600=400\ \mathrm{J}',
        note: '受け取った熱のうち、捨てなかった分が仕事になります。',
      ),
      PhysicsFormula(
        title: '熱効率',
        expression: 'e=W/Q_h=400/1000=0.40=40%',
        latex: r'e=\frac{W}{Q_h}=\frac{400}{1000}=0.40=40\%',
        note: '熱効率は1を超えません。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'thermo-gas-standard-1',
    unitId: 'thermodynamics',
    topicId: 'gas',
    title: '理想気体の状態方程式',
    prompt:
        '1.0 molの気体が300 K、体積0.0246 m^3にあります。気体定数R=8.31 J/(mol・K)として圧力を求めなさい。',
    hint: 'PV=nRTからP=nRT/Vを作ります。',
    level: 5,
    answer: '圧力は約1.01×10^5 Paです。',
    explanation: 'P=1.0×8.31×300/0.0246≈1.01×10^5 Paです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '理想気体の状態方程式',
        expression: 'P=nRT/V=1.0×8.31×300/0.0246≈1.01×10^5 Pa',
        latex:
            r'P=\frac{nRT}{V}=\frac{1.0\times8.31\times300}{0.0246}\simeq1.01\times10^5\ \mathrm{Pa}',
        note: '体積はm^3、温度はKで代入します。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'thermo-kinetic-standard-1',
    unitId: 'thermodynamics',
    topicId: 'kinetic-theory',
    title: '単原子分子気体の内部エネルギー',
    prompt:
        '単原子分子理想気体2.0 molを300 Kから450 Kへ変化させます。内部エネルギーの変化を求めなさい。R=8.31 J/(mol・K)とします。',
    hint: '単原子分子気体ではΔU=3/2 nRΔTです。',
    level: 6,
    answer: '内部エネルギーは3.74×10^3 J増加します。',
    explanation: 'ΔT=150 Kなので、ΔU=3/2×2.0×8.31×150=3.74×10^3 Jです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '内部エネルギーの変化',
        expression: 'ΔU=3/2 nRΔT=3/2×2.0×8.31×150=3.74×10^3 J',
        latex:
            r'\Delta U=\frac{3}{2}nR\Delta T=\frac{3}{2}\times2.0\times8.31\times150\simeq3.74\times10^3\ \mathrm{J}',
        note: '理想気体の内部エネルギーは温度だけで決まります。',
      ),
    ],
  ),

  // ---------------------------------------------------------------------------
  // Atomic physics
  // ---------------------------------------------------------------------------
  PhysicsProblem(
    id: 'atomic-nucleus-basic-1',
    unitId: 'atomic',
    topicId: 'nucleus',
    title: '原子核の陽子数と中性子数',
    prompt: 'ナトリウム23（原子番号11）の原子核に含まれる陽子数と中性子数を求めなさい。',
    hint: '原子番号は陽子数、質量数は陽子数と中性子数の合計です。',
    level: 1,
    answer: '陽子11個、中性子12個です。',
    explanation: '陽子数は原子番号11です。中性子数は23-11=12個です。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '原子核の構成',
        expression: 'N=A-Z=23-11=12',
        latex: r'N=A-Z=23-11=12',
        note: 'Aは質量数、Zは原子番号、中性子数をNとしています。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'atomic-radiation-basic-1',
    unitId: 'atomic',
    topicId: 'radiation',
    title: '半減期と放射性物質',
    prompt: '半減期が8日で、はじめに80 gあった放射性物質があります。24日後の質量を求めなさい。',
    hint: '24日間には半減期が3回含まれます。',
    level: 2,
    answer: '質量は10 gです。',
    explanation: '3回半減するので、80×(1/2)^3=10 gです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '放射性物質の減少',
        expression: 'm=80×(1/2)^(24/8)=10 g',
        latex: r'm=80\left(\frac{1}{2}\right)^{24/8}=10\ \mathrm{g}',
        note: '半減期は放射性物質の量が半分になる時間です。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'atomic-reaction-basic-1',
    unitId: 'atomic',
    topicId: 'nuclear-reaction',
    title: '質量欠損と結合エネルギー',
    prompt: '核反応で質量欠損が0.0010 u生じました。1 u=931.5 MeV/c^2として、発生するエネルギーを求めなさい。',
    hint: '質量欠損をuで表したとき、931.5 MeVを掛けます。',
    level: 3,
    answer: '発生するエネルギーは0.932 MeVです。',
    explanation: 'E=0.0010×931.5=0.9315 MeVなので、約0.932 MeVです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '質量とエネルギー',
        expression: 'E=Δm c^2=0.0010×931.5=0.9315 MeV',
        latex: r'E=\Delta mc^2=0.0010\times931.5=0.9315\ \mathrm{MeV}',
        note: 'uを使うと、エネルギーをMeVで直接求められます。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'atomic-matter-wave-basic-1',
    unitId: 'atomic',
    topicId: 'matter-wave',
    title: '電子のド・ブロイ波長',
    prompt:
        '運動量6.63×10^-24 kg m/sの電子の物質波の波長を求めなさい。プランク定数h=6.63×10^-34 J sとします。',
    hint: 'ド・ブロイの式λ=h/pを使います。',
    level: 4,
    answer: '波長は1.0×10^-10 mです。',
    explanation: 'λ=6.63×10^-34/(6.63×10^-24)=1.0×10^-10 mです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'ド・ブロイの式',
        expression: 'λ=h/p=6.63×10^-34/(6.63×10^-24)=1.0×10^-10 m',
        latex:
            r'\lambda=\frac{h}{p}=\frac{6.63\times10^{-34}}{6.63\times10^{-24}}=1.0\times10^{-10}\ \mathrm{m}',
        note: '運動量が大きいほど物質波の波長は短くなります。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'atomic-photoelectric-standard-1',
    unitId: 'atomic',
    topicId: 'photoelectric',
    title: '光電効果の最大運動エネルギー',
    prompt: '仕事関数2.0 eVの金属に、光子エネルギー3.5 eVの光を当てます。光電子の最大運動エネルギーと阻止電圧を求めなさい。',
    hint: 'アインシュタインの式K_max=hf-Wを使います。eV単位なら阻止電圧の数値と一致します。',
    level: 6,
    answer: '最大運動エネルギーは1.5 eV、阻止電圧は1.5 Vです。',
    explanation: 'K_max=3.5-2.0=1.5 eVです。K_max=eV_sよりV_s=1.5 Vです。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '光電効果の式',
        expression: 'K_max=hf-W=3.5-2.0=1.5 eV',
        latex: r'K_{\max}=hf-W=3.5-2.0=1.5\ \mathrm{eV}',
        note: '仕事関数は電子を金属から取り出すための最低エネルギーです。',
      ),
      PhysicsFormula(
        title: '阻止電圧',
        expression: 'K_max=eV_s  →  V_s=1.5 V',
        latex: r'K_{\max}=eV_s\quad\Longrightarrow\quad V_s=1.5\ \mathrm{V}',
        note: '電子ボルトで計算すると、阻止電圧の数値がそのまま得られます。',
      ),
    ],
  ),
  PhysicsProblem(
    id: 'atomic-bohr-standard-1',
    unitId: 'atomic',
    topicId: 'bohr-model',
    title: '水素原子のスペクトル',
    prompt: '水素原子の電子がn=2からn=1へ遷移するときに放出する光のエネルギーと波長を求めなさい。hc=1240 eV nmとします。',
    hint: 'E_n=-13.6/n^2 eV、λ=hc/ΔEを使います。',
    level: 7,
    answer: '光のエネルギーは10.2 eV、波長は約122 nmです。',
    explanation: 'エネルギー差は|−13.6−(−3.40)|=10.2 eVです。λ=1240/10.2≈122 nmとなります。',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: 'エネルギー準位',
        expression: 'ΔE=|-13.6-(-13.6/4)|=10.2 eV',
        latex:
            r'\Delta E=\left|-13.6-\left(-\frac{13.6}{2^2}\right)\right|=10.2\ \mathrm{eV}',
        note: '放出される光子のエネルギーは準位差の大きさです。',
      ),
      PhysicsFormula(
        title: '光の波長',
        expression: 'λ=hc/ΔE=1240/10.2≈122 nm',
        latex:
            r'\lambda=\frac{hc}{\Delta E}=\frac{1240}{10.2}\simeq122\ \mathrm{nm}',
        note: 'hcをeV nmで使うと、波長をnmで求められます。',
      ),
    ],
  ),

  /* ==================== PROBLEM TEMPLATE ====================
  PhysicsProblem(
    id: 'unique-problem-id',
    unitId: 'mechanics',
    topicId: 'uniform-acceleration',
    title: '問題タイトル',
    prompt: '問題文',
    hint: '公式を選ぶためのヒント。答えを直接書かない。',
    level: 1,
    answer: '最終的な答え',
    explanation: '代入、計算、単位の確認を含む解説',
    solutionFormulas: <PhysicsFormula>[
      PhysicsFormula(
        title: '使用した公式',
        expression: '画面に表示する短い式',
        latex: r'v=v_0+at',
        note: '式の意味や使う条件',
      ),
    ],
  ),
  ==================== PROBLEM TEMPLATE ==================== */
];

// Add columns here when creating a new physics column.
const List<PhysicsColumn> kAdditionalPhysicsColumns = <PhysicsColumn>[];
