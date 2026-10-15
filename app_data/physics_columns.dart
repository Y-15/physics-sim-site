import '../models/physics_models.dart';
import 'custom_content.dart';

// Built-in columns live here. Duplicate the column template in
// custom_content.dart when adding user-maintained content.
const List<PhysicsColumn> _kBuiltInPhysicsColumns = <PhysicsColumn>[
  PhysicsColumn(
    id: 'draw-first',
    category: '問題の解き方',
    title: '公式を探す前に、図を描く',
    lead: '物理の問題は、文章を図へ翻訳した時点で半分ほど整理できます。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '図に入れるもの',
        body:
            '物体、力の矢印、速度や加速度の向き、基準点、正方向を書きます。長い問題文をすべて写す必要はありません。式に登場する量がどこにあるか分かる図を目指します。',
      ),
      PhysicsColumnSection(
        title: '図が式を選んでくれる',
        body:
            '力をすべて描けば運動方程式、始めと終わりの状態を描けばエネルギー保存、衝突の前後を描けば運動量保存が候補になります。公式を暗記した順に試すより、状況から法則を選ぶ方が間違いが減ります。',
      ),
    ],
    takeaway: '最初の30秒で図・正方向・求める量を書き、式はそのあとに選ぶ。',
  ),
  PhysicsColumn(
    id: 'units',
    category: '基礎力',
    title: '単位は答えを検査する道具',
    lead: '数値が合っていても単位が違えば、その式は物理的に成立していません。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '次元をそろえる',
        body:
            '等式の左辺と右辺は同じ次元を持ちます。例えば v=v₀+at では、at の単位は (m/s²)×s=m/s となり速度と一致します。途中式で単位を追うと、掛け算と割り算の取り違えを発見できます。',
      ),
      PhysicsColumnSection(
        title: '接頭語に注意する',
        body:
            'cm、mm、kV、μFなどはSI単位へ直してから代入するのが安全です。1 cm=10⁻² m、1 μF=10⁻⁶ Fです。面積なら換算係数も2乗され、1 cm²=10⁻⁴ m²になります。',
      ),
    ],
    takeaway: '代入前にSI単位へ統一し、最後に答えの単位が求める量と一致するか確認する。',
  ),
  PhysicsColumn(
    id: 'graphs',
    category: '基礎力',
    title: 'グラフの傾きと面積を読む',
    lead: '物理のグラフでは、点の高さだけでなく傾きと面積に意味があります。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '傾きは変化の割合',
        body:
            'x-tグラフの傾きは速度、v-tグラフの傾きは加速度です。V-Iグラフの傾きは軸の取り方により抵抗またはコンダクタンスになります。縦軸÷横軸の単位を計算すると、傾きが何を表すか判断できます。',
      ),
      PhysicsColumnSection(
        title: '面積は積み重ね',
        body:
            'v-tグラフと時間軸で囲まれた符号付き面積は変位、F-tグラフの面積は力積です。曲線でも細い長方形の和と考えれば、面積が小さな変化の積み重ねであることが分かります。',
      ),
    ],
    takeaway: '傾きは「縦軸の変化÷横軸の変化」、面積は「縦軸×横軸」の単位で読む。',
  ),
  PhysicsColumn(
    id: 'conservation',
    category: '物理の見方',
    title: '保存則は「何を系に含めるか」で決まる',
    lead: 'エネルギーや運動量は、適切に選んだ系全体で追跡すると強力な道具になります。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '系の境界を決める',
        body:
            '衝突する2物体をまとめて系とすれば、2物体間の作用反作用は内力となり全運動量を変えません。一方、床からの摩擦や外部からの押す力は外力です。保存するかどうかは現象名ではなく、外部とのやり取りで判断します。',
      ),
      PhysicsColumnSection(
        title: '力学的エネルギーと全エネルギー',
        body:
            '摩擦があると力学的エネルギーは減りますが、失われたわけではなく熱や内部エネルギーへ移ります。「保存しない」と言うときは、何の合計を見ているのかを明確にしましょう。',
      ),
    ],
    takeaway: '対象を丸で囲み、境界を越えて入出力する力積・仕事・熱を確認する。',
  ),
  PhysicsColumn(
    id: 'vectors',
    category: '数学との接続',
    title: 'ベクトルは成分に分ければ怖くない',
    lead: '向きを持つ量は、座標軸ごとの普通の数へ分けて計算できます。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '軸は自由に選べる',
        body:
            '斜面上の運動では、斜面に平行な軸と垂直な軸を選ぶと垂直抗力や加速度を扱いやすくなります。座標軸は水平・鉛直でなければならないという決まりはありません。',
      ),
      PhysicsColumnSection(
        title: '最後に向きを戻す',
        body:
            '成分計算で負の答えが出たら失敗ではなく、最初に決めた正方向と逆向きという情報です。大きさだけを尋ねられたときは絶対値を示し、向きも文章で添えます。',
      ),
    ],
    takeaway: '計算前に正方向を矢印で書き、x方向とy方向の式を混ぜない。',
  ),
  PhysicsColumn(
    id: 'approximation',
    category: '物理の見方',
    title: '近似は「雑にすること」ではない',
    lead: '本質を残して小さな効果を無視することで、現象を理解しやすくします。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '条件を言葉にする',
        body:
            '単振り子の周期式は振れ角が十分小さいとき、理想気体の式は分子間力や分子自身の体積を無視できるときに有効です。公式と一緒に成立条件を覚えることが、近似を正しく使う第一歩です。',
      ),
      PhysicsColumnSection(
        title: '桁で見積もる',
        body:
            '空気抵抗や摩擦を無視できるかは、目的とする精度で変わります。主要な量のおよその大きさを比べ、小さい寄与が答えに何％ほど影響するかを考えると判断しやすくなります。',
      ),
    ],
    takeaway: '公式を使うときは「何を無視した式か」を一言説明できるようにする。',
  ),
  PhysicsColumn(
    id: 'experiments',
    category: '実験',
    title: '測定値には必ず幅がある',
    lead: '実験では真の値を直接知るのではなく、測定結果から妥当な範囲を推定します。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '偶然誤差と系統誤差',
        body:
            '繰り返すたびにばらつく誤差は平均で小さくできます。器具のゼロ点ずれや方法そのものによる偏りは、回数を増やしても消えません。校正や別の測定方法との比較が必要です。',
      ),
      PhysicsColumnSection(
        title: '有効数字',
        body:
            '測定器で区別できない桁まで答えを書くと、実際以上に精密だと主張することになります。計算途中では少し多めに桁を残し、最後に測定精度に合わせて丸めます。',
      ),
    ],
    takeaway: '平均値だけでなく、ばらつき・器具の最小目盛・偏りの可能性も記録する。',
  ),
  PhysicsColumn(
    id: 'study-cycle',
    category: '学習法',
    title: '物理が伸びる復習の順番',
    lead: '答えを読み直すより、考え方を自力で再現する練習が効果的です。',
    sections: <PhysicsColumnSection>[
      PhysicsColumnSection(
        title: '解答を閉じて再現する',
        body:
            '間違えた問題は、解説を読んだ直後ではなく少し時間を空けて、図と最初の式だけを自力で再現します。途中計算より「なぜその法則を選んだか」を言葉にすることが重要です。',
      ),
      PhysicsColumnSection(
        title: '間違いを分類する',
        body:
            '知識不足、状況の読み違い、符号・単位、計算ミスに分けて記録します。原因が違えば対策も違います。同じ分類が続くなら、その単元の基礎へ戻る合図です。',
      ),
    ],
    takeaway: '翌日・1週間後に、図と方針を何も見ずに再現できるか確認する。',
  ),
];

// Columns from the extension file are merged into the column screen.
const List<PhysicsColumn> kPhysicsColumns = <PhysicsColumn>[
  ..._kBuiltInPhysicsColumns,
  ...kAdditionalPhysicsColumns,
];
