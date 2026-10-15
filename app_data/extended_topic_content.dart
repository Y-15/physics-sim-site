import '../models/physics_models.dart';

// Expands non-mechanics topics into eight-section lessons.
// To duplicate an item, copy its ID through the closing _twoStage(...) call,
// then edit both explanations and formulas. Text appears before each formula.
final Map<String, List<PhysicsLessonSection>> kExtendedTopicSections =
    <String, List<PhysicsLessonSection>>{
  // ---------------------------------------------------------------------------
  // Waves
  // ---------------------------------------------------------------------------
  'wave-basics': _twoStage(
    title7: '7. 重ね合わせの原理',
    body7:
        '2つ以上の波が同じ場所へ来たとき、その瞬間の変位は各波の変位の代数和になります。波どうしが重なった後は、それぞれ元の形で進み続けます。この原理から干渉や定常波を説明できます。',
    formulaTitle7: '変位の重ね合わせ',
    expression7: 'y=y₁+y₂+…',
    latex7: r'y=y_1+y_2+\cdots',
    note7: '変位には正負があるため、符号付きで加えます。',
    title8: '8. 波が運ぶエネルギー',
    body8:
        '波は媒質を遠くまで運ばずにエネルギーを伝えます。単位面積・単位時間あたりに通過するエネルギーを強度と呼びます。点源から一様に広がる波では、同じエネルギーが大きな球面へ分散するため強度は距離の2乗に反比例します。',
    formulaTitle8: '点源から広がる波の強度',
    expression8: 'I=P/(4πr²)',
    latex8: r'I=\frac{P}{4\pi r^2}',
    note8: 'Pは波源の出力、rは波源からの距離です。',
  ),
  'sine-wave': _twoStage(
    title7: '7. 位相から同じ振動状態を探す',
    body7:
        '正弦波では、位相が2πの整数倍だけ違う点は同じ振動状態です。同じ時刻なら位置差を波長で、同じ位置なら時間差を周期で割ると、何周期ずれているかを判断できます。',
    formulaTitle7: '位置差・時間差による位相差',
    expression7: 'Δφ=2πΔx/λ=2πΔt/T',
    latex7:
        r'\Delta\varphi=2\pi\frac{\Delta x}{\lambda}=2\pi\frac{\Delta t}{T}',
    note7: '比較する条件に応じて位置差か時間差の項を使います。',
    title8: '8. 波の式から速さを読む',
    body8:
        '波の式でtの係数が角振動数ω、xの係数が波数kです。振動数や波長を別々に求めなくても、位相が一定の点の移動から波の速さをω/kで求められます。',
    formulaTitle8: '角振動数と波数による波の速さ',
    expression8: 'v=ω/k=fλ',
    latex8: r'v=\frac{\omega}{k}=f\lambda',
    note8: 'ω=2πf、k=2π/λを代入すると同じ式になります。',
  ),
  'sound': _twoStage(
    title7: '7. 気温と音速',
    body7:
        '空気中の音速は気温が高いほど大きくなります。高校物理では0 ℃で約331.5 m/s、気温が1 ℃上がるごとに約0.60 m/s増える近似を使います。音源の振動数は変わらず、音速の変化に応じて波長が変わります。',
    formulaTitle7: '空気中の音速',
    expression7: 'V≈331.5+0.60t [m/s]',
    latex7: r'V\simeq331.5+0.60t\ \mathrm{m/s}',
    note7: 'tは摂氏温度です。',
    title8: '8. うなり',
    body8:
        '振動数がわずかに異なる2つの音を重ねると、強め合いと弱め合いが周期的に繰り返され、音の大きさが変化して聞こえます。1秒あたりに音が大きくなる回数は2音の振動数差に等しくなります。',
    formulaTitle8: 'うなりの振動数',
    expression8: 'fうなり=|f₁-f₂|',
    latex8: r'f_{\mathrm{beat}}=|f_1-f_2|',
    note8: '近い振動数の比較や楽器の調律に利用されます。',
  ),
  'interference': _twoStage(
    title7: '7. 回折格子',
    body7:
        '多数の細いすき間を等間隔に並べた回折格子では、隣り合うすき間から来る光の経路差が波長の整数倍となる方向に明るい線ができます。すき間が多いほど明線は細く鮮明になります。',
    formulaTitle7: '回折格子の明線条件',
    expression7: 'd sinθ=mλ',
    latex7: r'd\sin\theta=m\lambda\quad(m=0,1,2,\ldots)',
    note7: 'dは格子間隔、θは中央方向からの角度です。',
    title8: '8. 薄膜干渉の経路差',
    body8:
        '薄い膜の上面と下面で反射した光は、膜内を往復した分だけ光路がずれます。さらに屈折率の小さい側から大きい側で反射すると位相がπ変化します。明暗を判定するときは、光路差と反射時の位相変化を両方確認します。',
    formulaTitle8: '薄膜内の光路差',
    expression8: 'Δ=2nd cos r',
    latex8: r'\Delta=2nd\cos r',
    note8: 'nは膜の屈折率、dは厚さ、rは膜内の屈折角です。',
  ),
  'standing-wave': _twoStage(
    title7: '7. 弦の固有振動',
    body7:
        '両端を固定した弦では両端が節となり、弦の長さに半波長の整数個が入る振動だけが続きます。張力が大きいほど波は速く伝わり、線密度が大きい弦ほど遅く伝わります。',
    formulaTitle7: '弦の固有振動数',
    expression7: 'fₙ=n/(2L)√(S/μ)',
    latex7: r'f_n=\frac{n}{2L}\sqrt{\frac{S}{\mu}}',
    note7: 'Sは張力、μは弦の単位長さあたりの質量です。',
    title8: '8. 気柱の共鳴',
    body8:
        '開口端は空気変位の腹、閉口端は節になります。両端開管では半波長の整数倍、片側閉管では4分の1波長の奇数倍が管長に入ります。実際の開口端の腹は管の少し外側にできるため、精密には開口端補正を加えます。',
    formulaTitle8: '気柱の共鳴振動数',
    expression8: '両端開: fₙ=nv/(2L), 片側閉: fₙ=(2n-1)v/(4L)',
    latex8: r'f_n=\frac{nv}{2L},\quad f_n=\frac{(2n-1)v}{4L}',
    note8: '片側閉管では基本振動の奇数倍だけが現れます。',
  ),
  'doppler': _twoStage(
    title7: '7. 観測者だけが動く場合',
    body7:
        '音源が静止して観測者が動くと、空気中の波長は変化しません。観測者が1秒間に出会う波面の数が変わるため、音源へ近づけば高く、遠ざかれば低く聞こえます。',
    formulaTitle7: '動く観測者が聞く振動数',
    expression7: "f'=(V±vₒ)f/V",
    latex7: r"f'=\frac{V\pm v_o}{V}f",
    note7: '近づくときは+、遠ざかるときは-です。',
    title8: '8. 音源だけが動く場合',
    body8:
        '音源が動くと、前方では波面の間隔が狭まり、後方では広がります。つまり空気中の波長そのものが変化します。式を暗記する前に、接近時に観測振動数が元より大きくなるかを確認すると符号を選びやすくなります。',
    formulaTitle8: '動く音源による振動数',
    expression8: "f'=Vf/(V∓vₛ)",
    latex8: r"f'=\frac{V}{V\mp v_s}f",
    note8: '音源が近づくときは分母がV-vₛになります。',
  ),
  'reflection-refraction': _twoStage(
    title7: '7. 屈折率と光の速さ',
    body7:
        '屈折率は真空中の光速と媒質中の光速の比です。光が境界を越えても振動数は光源で決まるため変わりません。速さが小さくなる媒質では、v=fλより波長も短くなります。',
    formulaTitle7: '絶対屈折率',
    expression7: 'n=c/v, λ=λ₀/n',
    latex7: r'n=\frac{c}{v},\quad \lambda=\frac{\lambda_0}{n}',
    note7: 'λ₀は真空中の波長です。',
    title8: '8. 全反射と臨界角',
    body8:
        '屈折率の大きい媒質から小さい媒質へ光が進むとき、入射角を大きくすると屈折角が90°になります。この入射角が臨界角で、さらに大きい入射角では光はすべて反射します。光ファイバーは全反射を繰り返して光を導きます。',
    formulaTitle8: '臨界角',
    expression8: 'sinθc=n₂/n₁ (n₁>n₂)',
    latex8: r'\sin\theta_c=\frac{n_2}{n_1}\quad(n_1>n_2)',
    note8: '光は屈折率n₁側からn₂側へ進みます。',
  ),
  'lens': _twoStage(
    title7: '7. レンズの度数と組合せ',
    body7:
        'レンズの光を曲げる強さを度数で表し、焦点距離の逆数で定義します。薄いレンズを密着させると度数を加えられます。凸レンズは正、凹レンズは負の焦点距離として扱います。',
    formulaTitle7: 'レンズの度数',
    expression7: 'D=1/f, D合成=D₁+D₂',
    latex7: r'D=\frac{1}{f},\quad D_{\mathrm{total}}=D_1+D_2',
    note7: 'fをmで表すと度数の単位はDです。',
    title8: '8. 望遠鏡の角倍率',
    body8:
        '天体望遠鏡では対物レンズが遠方物体の実像を作り、接眼レンズがその像を拡大して見せます。焦点を一致させた調節では、角倍率の大きさは対物レンズと接眼レンズの焦点距離の比です。',
    formulaTitle8: '天体望遠鏡の角倍率',
    expression8: '|M|=f対物/f接眼',
    latex8: r'|M|=\frac{f_{\mathrm{objective}}}{f_{\mathrm{eyepiece}}}',
    note8: '通常は倒立像となるため符号を付ける場合は負です。',
  ),

  // ---------------------------------------------------------------------------
  // Electromagnetism
  // ---------------------------------------------------------------------------
  'electric-field': _twoStage(
    title7: '7. 一様電場中の荷電粒子',
    body7:
        '平行板間のような一様電場では、電荷qが受ける電気力は位置によらず一定です。重力を無視すれば一定加速度運動となり、初速度が電場と垂直なら投射運動と同じ放物線を描きます。',
    formulaTitle7: '電気力と加速度',
    expression7: 'F=qE, a=qE/m',
    latex7: r'\vec{F}=q\vec{E},\quad \vec{a}=\frac{q\vec{E}}{m}',
    note7: '負電荷では力と加速度が電場と逆向きです。',
    title8: '8. 複数電荷が作る電場',
    body8:
        '複数の点電荷があるときは、調べる点に各電荷が単独で作る電場を描き、ベクトルとして合成します。電場の大きさだけを足すのではなく、同一直線上なら符号、平面上なら成分に分けて扱います。',
    formulaTitle8: '電場の重ね合わせ',
    expression8: 'E=ΣEᵢ, Eᵢ=kqᵢ/rᵢ²',
    latex8: r'\vec{E}=\sum_i\vec{E}_i,\quad E_i=k\frac{|q_i|}{r_i^2}',
    note8: '向きは正電荷から外向き、負電荷へ内向きです。',
  ),
  'electric-potential': _twoStage(
    title7: '7. 電位差と電場の仕事',
    body7:
        '電位差は単位電荷あたりの位置エネルギー差です。正電荷が高電位から低電位へ移ると、電場が正の仕事をして電気的位置エネルギーが減少します。電子では電荷が負なので関係が逆になります。',
    formulaTitle7: '電位差と仕事',
    expression7: 'ΔU=qΔV, W電場=-qΔV',
    latex7: r'\Delta U=q\Delta V,\quad W_{\mathrm{field}}=-q\Delta V',
    note7: '仕事と位置エネルギー変化の符号は逆です。',
    title8: '8. 複数点電荷による電位',
    body8:
        '電位は向きを持たないスカラー量なので、各点電荷が作る電位を符号付きで足します。電場が0でも電位が0とは限らず、電位が0でも電場が0とは限りません。両者は別々に計算します。',
    formulaTitle8: '電位の重ね合わせ',
    expression8: 'V=Σkqᵢ/rᵢ',
    latex8: r'V=\sum_i k\frac{q_i}{r_i}',
    note8: '負電荷の寄与は負の電位として加えます。',
  ),
  'circuit': _twoStage(
    title7: '7. 電池の内部抵抗',
    body7:
        '実際の電池には内部抵抗rがあり、電流が流れると内部で電圧が失われます。起電力Eは電池が1 Cあたりに与えるエネルギー、端子電圧Vは外部回路から測定できる電圧です。',
    formulaTitle7: '端子電圧',
    expression7: 'V=E-rI, I=E/(R+r)',
    latex7: r'V=\mathcal{E}-rI,\quad I=\frac{\mathcal{E}}{R+r}',
    note7: '放電中は端子電圧が起電力より小さくなります。',
    title8: '8. ホイートストンブリッジ',
    body8:
        '4つの抵抗で橋形回路を作り、中央の検流計に電流が流れないよう調節すると、向かい合う抵抗の比から未知抵抗を求められます。中央に電流がないとき、中央の2点は等電位です。',
    formulaTitle8: 'ブリッジの平衡条件',
    expression8: 'R₁/R₂=R₃/R₄',
    latex8: r'\frac{R_1}{R_2}=\frac{R_3}{R_4}',
    note8: '検流計の電流が0のときだけ使えます。',
  ),
  'capacitor': _twoStage(
    title7: '7. コンデンサーの接続',
    body7:
        '並列接続では各コンデンサーの電圧が等しく、蓄えられる電気量が加わります。直列接続では各コンデンサーに蓄えられる電気量の大きさが等しく、全電圧が各電圧の和になります。',
    formulaTitle7: '合成容量',
    expression7: '並列: C=C₁+C₂, 直列: 1/C=1/C₁+1/C₂',
    latex7:
        r'C_{\parallel}=C_1+C_2,\quad \frac{1}{C_{\mathrm{series}}}=\frac{1}{C_1}+\frac{1}{C_2}',
    note7: '抵抗の直列・並列とは式が逆になります。',
    title8: '8. 蓄えられるエネルギー',
    body8:
        '充電では、すでにある電荷に逆らってさらに電荷を移すため、電源のした仕事がコンデンサーの電気エネルギーとして蓄えられます。電圧一定か電気量一定かで、誘電体を入れたときの変化が異なります。',
    formulaTitle8: '静電エネルギー',
    expression8: 'U=1/2 QV=Q²/(2C)=1/2 CV²',
    latex8: r'U=\frac{1}{2}QV=\frac{Q^2}{2C}=\frac{1}{2}CV^2',
    note8: '問題で一定に保たれる量を確認して式を選びます。',
  ),
  'magnetic-field': _twoStage(
    title7: '7. 電流が作る磁場',
    body7:
        '直線電流の周囲には同心円状の磁場ができ、向きは右ねじの法則で決めます。円形コイルでは中心付近の磁場が同じ向きに重なり、巻数を増やすと磁場も強くなります。',
    formulaTitle7: '代表的な電流の磁場',
    expression7: '直線: B=μ₀I/(2πr), 円形コイル中心: B=μ₀NI/(2R)',
    latex7: r'B=\frac{\mu_0I}{2\pi r},\quad B=\frac{\mu_0NI}{2R}',
    note7: '2つ目は半径R、巻数Nの円形コイル中心です。',
    title8: '8. 電流が磁場から受ける力',
    body8:
        '磁場中の導線では、導線内を動く多数の電荷が磁力を受け、その合計が導線全体への力として現れます。力は電流と磁場の両方に垂直で、向きはフレミング左手の法則で判断できます。',
    formulaTitle8: '電流が受ける力',
    expression8: 'F=BIl sinθ',
    latex8: r'F=BIl\sin\theta',
    note8: 'lは磁場中にある導線の長さです。',
  ),
  'lorentz-force': _twoStage(
    title7: '7. 速度選別器',
    body7:
        '電場と磁場を互いに垂直にし、荷電粒子へ働く電気力と磁気力を逆向きにすると、特定の速さの粒子だけが直進します。電荷の大きさや質量によらず速さを選べます。',
    formulaTitle7: '直進する速さ',
    expression7: 'qE=qvB → v=E/B',
    latex7: r'qE=qvB\quad\Rightarrow\quad v=\frac{E}{B}',
    note7: '速度が電場・磁場の両方に垂直な配置です。',
    title8: '8. らせん運動',
    body8:
        '速度が磁場に斜めの場合、磁場に垂直な成分は円運動を作り、平行な成分は等速運動を続けます。2つを合成すると磁力線に沿うらせん運動になります。',
    formulaTitle8: 'らせんの半径とピッチ',
    expression8: 'r=mv⊥/(|q|B), p=v∥·2πm/(|q|B)',
    latex8: r'r=\frac{mv_\perp}{|q|B},\quad p=v_\parallel\frac{2\pi m}{|q|B}',
    note8: 'pは1周する間に磁場方向へ進む距離です。',
  ),
  'induction': _twoStage(
    title7: '7. 導体棒の運動による起電力',
    body7:
        '磁場中を導体棒が動くと、棒内の電荷がローレンツ力を受けて両端へ分かれ、電位差が生じます。棒・レール・抵抗で閉回路を作ると誘導電流が流れ、運動を妨げる向きの磁力が働きます。',
    formulaTitle7: '運動起電力',
    expression7: 'V=Blv',
    latex7: r'V=Blv',
    note7: 'B、棒l、速度vが互いに垂直な場合です。',
    title8: '8. 自己誘導とコイルのエネルギー',
    body8:
        'コイル自身の電流が変化すると、その変化を妨げる向きの誘導起電力が同じコイルに生じます。電流を増やすために電源がした仕事は、コイルの磁場のエネルギーとして蓄えられます。',
    formulaTitle8: '自己誘導と磁気エネルギー',
    expression8: 'V=-LΔI/Δt, U=1/2 LI²',
    latex8: r'V=-L\frac{\Delta I}{\Delta t},\quad U=\frac{1}{2}LI^2',
    note8: 'Lは自己インダクタンスです。',
  ),
  'alternating-current': _twoStage(
    title7: '7. 実効値',
    body7:
        '交流の電圧と電流は時間とともに正負が変わります。直流と同じ発熱を生じる値を実効値と呼び、家庭用100 Vも実効値です。正弦波交流では最大値を√2で割ります。',
    formulaTitle7: '正弦波交流の実効値',
    expression7: 'Veff=V₀/√2, Ieff=I₀/√2',
    latex7:
        r'V_{\mathrm{eff}}=\frac{V_0}{\sqrt{2}},\quad I_{\mathrm{eff}}=\frac{I_0}{\sqrt{2}}',
    note7: '平均電力はP=Veff Ieff cosφで表せます。',
    title8: '8. RLC直列回路と共振',
    body8:
        'コイルは高い振動数の交流を通しにくく、コンデンサーは低い振動数の交流を通しにくい性質があります。RLC直列回路で両者のリアクタンスが等しくなると共振し、インピーダンスが最小、電流が最大になります。',
    formulaTitle8: 'インピーダンスと共振',
    expression8: 'Z=√(R²+(ωL-1/(ωC))²), ω₀=1/√(LC)',
    latex8:
        r'Z=\sqrt{R^2+\left(\omega L-\frac{1}{\omega C}\right)^2},\quad \omega_0=\frac{1}{\sqrt{LC}}',
    note8: '共振時はコイルとコンデンサーの効果が打ち消し合います。',
  ),
  'electromagnetic-wave': _twoStage(
    title7: '7. 電場と磁場の関係',
    body7:
        '電磁波では、変化する電場と磁場が互いを作りながら空間を伝わります。電場、磁場、進行方向は互いに垂直です。真空中では電場振幅と磁場振幅の比が光速になります。',
    formulaTitle7: '電場と磁場の振幅',
    expression7: 'E₀/B₀=c',
    latex7: r'\frac{E_0}{B_0}=c',
    note7: '真空中を進む平面電磁波の関係です。',
    title8: '8. 電磁波の速さと波長',
    body8:
        '電波、赤外線、可視光、紫外線、X線、γ線はすべて電磁波で、真空中では同じ速さで進みます。違いは主に振動数と波長であり、振動数が大きいほど光子1個のエネルギーも大きくなります。',
    formulaTitle8: '電磁波の基本関係',
    expression8: 'c=fλ=1/√(ε₀μ₀)',
    latex8: r'c=f\lambda=\frac{1}{\sqrt{\varepsilon_0\mu_0}}',
    note8: '媒質中では速さと波長が変わります。',
  ),

  // ---------------------------------------------------------------------------
  // Thermodynamics
  // ---------------------------------------------------------------------------
  'heat': _twoStage(
    title7: '7. 状態変化の潜熱',
    body7:
        '融解や沸騰の途中では、加えた熱が分子間の結び付き方を変えるために使われ、温度は一定に保たれます。単位質量の物質を状態変化させる熱量を比潜熱と呼びます。',
    formulaTitle7: '潜熱',
    expression7: 'Q=mL',
    latex7: r'Q=mL',
    note7: 'Lは融解熱または蒸発熱で、単位はJ/kgです。',
    title8: '8. 熱平衡と熱量保存',
    body8:
        '断熱された容器内で温度の異なる物体を接触させると、高温物体が失った熱量と低温物体が得た熱量が等しくなり、最終的に同じ温度になります。容器の熱容量も必要なら含めます。',
    formulaTitle8: '熱量保存',
    expression8: 'ΣQ=0',
    latex8: r'\sum Q=0',
    note8: '受け取る熱を正、放出する熱を負として加えます。',
  ),
  'gas': _twoStage(
    title7: '7. 気体の状態変化',
    body7:
        '同じ量の理想気体ではPV/Tが一定です。温度は必ず絶対温度を使います。温度一定ならボイルの法則、圧力一定ならシャルルの法則、体積一定なら圧力の法則として読み取れます。',
    formulaTitle7: '結合気体の法則',
    expression7: 'P₁V₁/T₁=P₂V₂/T₂',
    latex7: r'\frac{P_1V_1}{T_1}=\frac{P_2V_2}{T_2}',
    note7: '物質量が変化しない場合に使います。',
    title8: '8. 混合気体と分圧',
    body8:
        '反応しない複数の理想気体を同じ容器に入れると、各気体は単独で容器全体を占めるように圧力を及ぼします。全圧は各気体の分圧の和です。分圧は各気体の物質量に比例します。',
    formulaTitle8: 'ドルトンの分圧の法則',
    expression8: 'P=P₁+P₂+…, Pᵢ=nᵢRT/V',
    latex8: r'P=\sum_iP_i,\quad P_i=\frac{n_iRT}{V}',
    note8: 'すべての気体で温度と容器体積は共通です。',
  ),
  'first-law': _twoStage(
    title7: '7. 定積・定圧・等温・断熱過程',
    body7:
        '定積過程では体積変化がなく仕事は0です。等温過程では理想気体の内部エネルギー変化が0、断熱過程では熱の出入りが0です。どの項が0になるかを先に判断すると第一法則を簡単にできます。',
    formulaTitle7: '代表的な過程の第一法則',
    expression7: '定積: Q=ΔU, 等温: Q=W, 断熱: ΔU=-W',
    latex7: r'Q=\Delta U,\quad Q=W,\quad \Delta U=-W',
    note7: 'Wは気体が外部へした仕事を正としています。',
    title8: '8. 単原子理想気体の内部エネルギー',
    body8:
        '理想気体の内部エネルギーは温度だけで決まり、単原子分子では分子の並進運動エネルギーの総和です。圧力や体積が変化しても、温度が同じなら内部エネルギーは同じです。',
    formulaTitle8: '内部エネルギー変化',
    expression8: 'U=3/2 nRT, ΔU=3/2 nRΔT',
    latex8: r'U=\frac{3}{2}nRT,\quad \Delta U=\frac{3}{2}nR\Delta T',
    note8: '単原子分子理想気体に限る式です。',
  ),
  'kinetic-theory': _twoStage(
    title7: '7. 圧力の分子論的な意味',
    body7:
        '気体分子が壁へ衝突すると運動量が変化し、壁は反作用として力を受けます。多数の分子による単位面積あたりの平均力が圧力です。分子が速いほど、また数密度が大きいほど圧力は大きくなります。',
    formulaTitle7: '分子運動と圧力',
    expression7: 'P=1/3 ρ⟨v²⟩',
    latex7: r'P=\frac{1}{3}\rho\langle v^2\rangle',
    note7: 'ρは気体の質量密度です。',
    title8: '8. 温度と分子の速さ',
    body8:
        '絶対温度は分子1個あたりの平均並進運動エネルギーに比例します。同じ温度なら平均運動エネルギーは気体の種類によらず等しいため、軽い分子ほど平均的に速く運動します。',
    formulaTitle8: '平均並進運動エネルギー',
    expression8: '1/2 m⟨v²⟩=3/2 kT',
    latex8: r'\frac{1}{2}m\langle v^2\rangle=\frac{3}{2}kT',
    note8: 'kはボルツマン定数です。',
  ),
  'heat-engine': _twoStage(
    title7: '7. 熱機関のエネルギー収支',
    body7:
        '熱機関は高温熱源から熱QHを受け取り、その一部を仕事Wへ変え、残りQLを低温熱源へ放出します。1周期後に作業物質の状態は元へ戻るので、内部エネルギーの変化は0です。',
    formulaTitle7: '1周期のエネルギー収支',
    expression7: 'QH=W+QL, η=W/QH=1-QL/QH',
    latex7: r'Q_H=W+Q_L,\quad \eta=\frac{W}{Q_H}=1-\frac{Q_L}{Q_H}',
    note7: '熱効率ηが1になる実在の熱機関はありません。',
    title8: '8. カルノー効率',
    body8:
        '同じ高温熱源と低温熱源の間で働く熱機関には、原理的な効率の上限があります。可逆的に働く理想的なカルノー機関がこの上限を与え、温度は絶対温度で表します。',
    formulaTitle8: 'カルノー機関の効率',
    expression8: 'ηC=1-TL/TH',
    latex8: r'\eta_C=1-\frac{T_L}{T_H}',
    note8: 'THとTLはそれぞれ高温・低温熱源の絶対温度です。',
  ),

  // ---------------------------------------------------------------------------
  // Atomic physics
  // ---------------------------------------------------------------------------
  'photoelectric': _twoStage(
    title7: '7. 限界振動数と限界波長',
    body7:
        '光子1個のエネルギーが仕事関数に届かなければ、光を強くしても光電子は放出されません。放出が始まる最小振動数を限界振動数、対応する最大波長を限界波長と呼びます。',
    formulaTitle7: '光電子放出の限界',
    expression7: 'hf₀=W, λ₀=hc/W',
    latex7: r'hf_0=W,\quad \lambda_0=\frac{hc}{W}',
    note7: 'f>f₀、またはλ<λ₀で光電子が放出されます。',
    title8: '8. 光の強さと振動数の役割',
    body8:
        '限界振動数を超えた光では、光を強くすると単位時間あたりの光子数が増え、光電流が大きくなります。一方、振動数を高くすると光子1個のエネルギーが増え、最大運動エネルギーと阻止電圧が大きくなります。',
    formulaTitle8: '最大運動エネルギーと阻止電圧',
    expression8: 'Kmax=hf-W=eVs',
    latex8: r'K_{\max}=hf-W=eV_s',
    note8: '強さではなく振動数がKmaxを決めます。',
  ),
  'bohr-model': _twoStage(
    title7: '7. 水素原子の軌道半径',
    body7:
        'ボーア模型では電子の角運動量が特定の値だけを取ると仮定します。その結果、水素原子の電子は連続な半径ではなく、主量子数nで決まる軌道だけを取ります。nが大きいほど軌道半径は大きくなります。',
    formulaTitle7: 'ボーア半径と第n軌道',
    expression7: 'rₙ=n²a₀',
    latex7: r'r_n=n^2a_0',
    note7: 'a₀≈5.29×10⁻¹¹ mです。',
    title8: '8. スペクトル系列',
    body8:
        '電子が高い準位から低い準位へ移ると準位差に等しい光子を放出します。終状態n=1はライマン系列、n=2はバルマー系列、n=3はパッシェン系列です。',
    formulaTitle8: 'リュードベリの式',
    expression8: '1/λ=R(1/nf²-1/ni²)',
    latex8: r'\frac{1}{\lambda}=R\left(\frac{1}{n_f^2}-\frac{1}{n_i^2}\right)',
    note8: '放出ではni>nfです。',
  ),
  'nucleus': _twoStage(
    title7: '7. 原子核の大きさと密度',
    body7:
        '原子核の半径は質量数Aの3乗根に比例します。体積は半径の3乗なのでAに比例し、質量もほぼAに比例します。そのため、核種が違っても原子核の密度はおよそ一定です。',
    formulaTitle7: '原子核半径',
    expression7: 'R=r₀A^(1/3)',
    latex7: r'R=r_0A^{1/3}',
    note7: 'r₀≈1.2×10⁻¹⁵ mです。',
    title8: '8. 1核子あたりの結合エネルギー',
    body8:
        '結合エネルギーを核子数Aで割ると、核子1個が平均してどれだけ強く結び付いているかを比較できます。この値が大きい核ほど一般に安定で、核分裂や核融合のエネルギーを理解する手掛かりになります。',
    formulaTitle8: '核の安定性の目安',
    expression8: '結合エネルギー/核子=Δmc²/A',
    latex8: r'\frac{E_B}{A}=\frac{\Delta mc^2}{A}',
    note8: '異なる質量数の原子核を比較するときに使います。',
  ),
  'radiation': _twoStage(
    title7: '7. 放射能と半減期',
    body7:
        '放射性核は一定の割合で確率的に崩壊します。半減期が1回経過するたびに未崩壊核数と放射能は半分になりますが、同じ個数ずつ減るわけではありません。',
    formulaTitle7: '半減期による減衰',
    expression7: 'N=N₀(1/2)^(t/T), A=λN',
    latex7: r'N=N_0\left(\frac{1}{2}\right)^{t/T},\quad A=\lambda N',
    note7: 'Tは半減期、Aは1秒あたりの崩壊数です。',
    title8: '8. 吸収線量と線量当量',
    body8:
        '物質1 kgが放射線から吸収したエネルギーを吸収線量と呼びます。人体への影響は放射線の種類でも異なるため、吸収線量へ放射線加重係数を掛けた線量当量も使います。Bq、Gy、Svは表す量が異なります。',
    formulaTitle8: '吸収線量と線量当量',
    expression8: 'D=E/m [Gy], H=wR D [Sv]',
    latex8: r'D=\frac{E}{m},\quad H=w_RD',
    note8: 'GyはJ/kg、Svは人体影響を考慮した単位です。',
  ),
  'nuclear-reaction': _twoStage(
    title7: '7. 核反応式の保存則',
    body7:
        '核反応式では、反応前後で質量数Aの合計と原子番号Zの合計を一致させます。これは核子数と電荷の保存を表します。未知粒子はAとZの差から特定できます。',
    formulaTitle7: '核子数と電荷の保存',
    expression7: 'ΣA前=ΣA後, ΣZ前=ΣZ後',
    latex7:
        r'\sum A_{\mathrm{before}}=\sum A_{\mathrm{after}},\quad \sum Z_{\mathrm{before}}=\sum Z_{\mathrm{after}}',
    note7: 'エネルギーと運動量も保存します。',
    title8: '8. Q値と反応エネルギー',
    body8:
        '反応前の総質量が反応後より大きいとき、減少した静止質量が生成粒子の運動エネルギーなどへ変わります。Q値が正ならエネルギー放出反応、負なら外部から最低限のエネルギーが必要です。',
    formulaTitle8: '核反応のQ値',
    expression8: 'Q=(m前-m後)c²',
    latex8: r'Q=(m_{\mathrm{before}}-m_{\mathrm{after}})c^2',
    note8: '質量の単位を統一してから差を取ります。',
  ),
  'matter-wave': _twoStage(
    title7: '7. 電圧で加速した電子の物質波',
    body7:
        '静止していた電子を電位差Vで加速すると、電気的位置エネルギーeVが運動エネルギーになります。そこから運動量を求めてド・ブロイの式へ代入すると、加速電圧が高いほど波長が短くなることが分かります。',
    formulaTitle7: '加速電子のド・ブロイ波長',
    expression7: 'λ=h/√(2meV)',
    latex7: r'\lambda=\frac{h}{\sqrt{2meV}}',
    note7: '光速に比べて十分遅い電子に使う式です。',
    title8: '8. 電子線の回折',
    body8:
        '電子線を結晶へ当てると、結晶面で散乱した電子波が干渉して特定方向に強い回折線が現れます。粒子として検出される電子が波の干渉条件を満たすことは、物質波の実験的証拠です。',
    formulaTitle8: 'ブラッグの回折条件',
    expression8: '2d sinθ=nλ',
    latex8: r'2d\sin\theta=n\lambda',
    note8: 'dは結晶面間隔、nは正の整数です。',
  ),
};

List<PhysicsLessonSection> _twoStage({
  required String title7,
  required String body7,
  required String formulaTitle7,
  required String expression7,
  required String latex7,
  required String note7,
  required String title8,
  required String body8,
  required String formulaTitle8,
  required String expression8,
  required String latex8,
  required String note8,
}) {
  return <PhysicsLessonSection>[
    PhysicsLessonSection(
      title: title7,
      body: body7,
      formulas: <PhysicsFormula>[
        PhysicsFormula(
          title: formulaTitle7,
          expression: expression7,
          latex: latex7,
          note: note7,
        ),
      ],
    ),
    PhysicsLessonSection(
      title: title8,
      body: body8,
      formulas: <PhysicsFormula>[
        PhysicsFormula(
          title: formulaTitle8,
          expression: expression8,
          latex: latex8,
          note: note8,
        ),
      ],
    ),
  ];
}
