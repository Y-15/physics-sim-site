// 演習問題用 44種類の高品質SVGダイアグラム＆グラフジェネレーター
// 純粋なSVG 1.1、Unicode表記、背景保護バッジによる線と文字の完全分離

function getIllustration(kind) {
  switch (kind) {
    // -------------------------------------------------------------
    // 力学（Mechanics）
    // -------------------------------------------------------------
    case 'kinematics_vt':
      return {
        title: '等加速度直線運動の v-t グラフ',
        desc: '傾きが加速度 a、グラフ線と t 軸で囲まれた面積が移動距離 x（変位）を表します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-vt-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-vt-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#64748b"/></marker>
  </defs>
  <line x1="50" y1="135" x2="450" y2="135" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-vt-slate)"/>
  <line x1="70" y1="145" x2="70" y2="20" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-vt-slate)"/>
  <text x="60" y="25" fill="#94a3b8" font-size="10">v</text>
  <text x="445" y="148" fill="#94a3b8" font-size="10">t</text>
  <polygon points="70,105 270,45 270,135 70,135" fill="rgba(56,189,248,0.15)" stroke="none"/>
  <line x1="70" y1="105" x2="270" y2="45" stroke="#38bdf8" stroke-width="2.5"/>
  <line x1="270" y1="45" x2="270" y2="135" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="70" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <rect x="35" y="97" width="30" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="50" y="109" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">v₀</text>
  <rect x="35" y="37" width="30" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="50" y="49" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">v</text>
  <rect x="255" y="140" width="30" height="16" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="270" y="152" fill="#cbd5e1" font-size="10" text-anchor="middle">t</text>
  <rect x="135" y="95" width="85" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="177" y="108" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">面積 ＝ 変位 x</text>
  <rect x="150" y="45" width="85" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="192" y="58" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">傾き ＝ 加速度 a</text>
  <rect x="305" y="35" width="175" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">v ＝ v₀ ＋ at</text>
  <text x="392" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">x ＝ v₀t ＋ ½ at²</text>
  <text x="392" y="86" fill="#fbbf24" font-size="9" text-anchor="middle">v² − v₀² ＝ 2ax</text>
</svg>`
      };

    case 'kinematics_axis':
      return {
        title: '直線運動の位置・速度・加速度ベクトル',
        desc: '基準点 O と座標軸（正の向き）を定め、速度ベクトルと加速度ベクトルの符号を明確にします。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-ka-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-ka-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-ka-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/></marker>
  </defs>
  <line x1="30" y1="120" x2="470" y2="120" stroke="#475569" stroke-width="2"/>
  <line x1="30" y1="135" x2="470" y2="135" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr-ka-slate)"/>
  <rect x="220" y="140" width="60" height="16" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="250" y="152" fill="#cbd5e1" font-size="10" text-anchor="middle">x 正方向</text>
  <circle cx="90" cy="100" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <rect x="75" y="70" width="30" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="90" y="81" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">t = 0</text>
  <circle cx="210" cy="100" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <rect x="195" y="70" width="30" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="210" y="81" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">t₁</text>
  <circle cx="360" cy="100" r="14" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5"/>
  <rect x="345" y="70" width="30" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="360" y="81" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">t₂</text>
  <line x1="374" y1="95" x2="450" y2="95" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-ka-cyan)"/>
  <rect x="400" y="75" width="45" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="422" y="87" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">速度 v</text>
  <line x1="374" y1="108" x2="430" y2="108" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-ka-rose)"/>
  <rect x="385" y="115" width="55" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="412" y="127" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">加速度 a</text>
  <rect x="50" y="15" width="400" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="250" y="31" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">平均の速度: v ＝ Δx / Δt ,  平均の加速度: a ＝ Δv / Δt</text>
</svg>`
      };

    case 'free_fall':
      return {
        title: '鉛直投げ上げ・自由落下の運動と最高点',
        desc: '鉛直上向きを正とすると加速度は -g となり、最高点では鉛直速度が v = 0 となります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-ff-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-ff-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="40" y1="140" x2="460" y2="140" stroke="#475569" stroke-width="2"/>
  <line x1="120" y1="140" x2="120" y2="25" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3"/>
  <circle cx="120" cy="130" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <line x1="120" y1="120" x2="120" y2="70" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-ff-cyan)"/>
  <rect x="70" y="85" width="45" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="92" y="97" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">初速 v₀</text>
  <circle cx="120" cy="30" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
  <rect x="140" y="22" width="75" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="177" y="34" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">最高点 (v＝0)</text>
  <line x1="220" y1="40" x2="220" y2="85" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-ff-rose)"/>
  <rect x="230" y="55" width="80" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="270" y="67" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">重力加速度 g</text>
  <rect x="300" y="25" width="180" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="390" y="43" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">最高点到達時刻: t ＝ v₀/g</text>
  <text x="390" y="60" fill="#cbd5e1" font-size="10" text-anchor="middle">最高点の高さ: h ＝ v₀²/(2g)</text>
  <text x="390" y="75" fill="#fbbf24" font-size="9" text-anchor="middle">落下時刻: t ＝ 2v₀/g</text>
</svg>`
      };

    case 'projectile':
      return {
        title: '放物投射と速度ベクトルの成分分解',
        desc: '水平方向は等速直線運動（ax = 0）、鉛直方向は重力加速度 g による等加速度運動に分解します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pr-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-pr-emerald" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#34d399"/></marker>
    <marker id="arr-pr-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <line x1="20" y1="140" x2="480" y2="140" stroke="#475569" stroke-width="2"/>
  <path d="M 50,140 Q 240,10 430,140" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"/>
  <circle cx="50" cy="140" r="7" fill="#fbbf24"/>
  <circle cx="240" cy="75" r="8" fill="#fbbf24"/>
  <line x1="240" y1="75" x2="310" y2="75" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pr-cyan)"/>
  <rect x="255" y="55" width="55" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="282" y="67" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">v_x ＝ v₀cosθ</text>
  <line x1="240" y1="75" x2="240" y2="115" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-pr-rose)"/>
  <rect x="180" y="90" width="55" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="207" y="102" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">重力 mg</text>
  <line x1="50" y1="140" x2="105" y2="85" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-pr-emerald)"/>
  <rect x="80" y="70" width="55" height="16" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1"/>
  <text x="107" y="82" fill="#34d399" font-size="10" font-weight="700" text-anchor="middle">初速度 v₀</text>
  <rect x="340" y="25" width="135" height="42" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="407" y="42" fill="#94a3b8" font-size="9" text-anchor="middle">水平: x ＝ (v₀cosθ)t</text>
  <text x="407" y="58" fill="#f43f5e" font-size="9" text-anchor="middle">鉛直: y ＝ (v₀sinθ)t − ½gt²</text>
</svg>`
      };

    case 'force_incline':
      return {
        title: '斜面上の物体の力の分解と運動方程式',
        desc: '重力 mg を斜面平行成分（mg sinθ）と垂直成分（mg cosθ）に分解し、垂直抗力 N と摩擦力を立式します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-fi-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-fi-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-fi-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#fbbf24"/></marker>
  </defs>
  <polygon points="40,140 440,140 440,40" fill="rgba(30,41,59,0.5)" stroke="#64748b" stroke-width="2"/>
  <g transform="translate(240, 90) rotate(-14)">
    <rect x="-25" y="-20" width="50" height="30" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <line x1="0" y1="-5" x2="0" y2="-45" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-fi-cyan)"/>
    <rect x="-35" y="-60" width="70" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
    <text x="0" y="-49" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">垂直抗力 N</text>
    <line x1="0" y1="-5" x2="-45" y2="-5" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-fi-amber)"/>
    <rect x="-75" y="-12" width="40" height="15" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
    <text x="-55" y="-1" fill="#fbbf24" font-size="9" text-anchor="middle">摩擦力 f</text>
  </g>
  <line x1="240" y1="90" x2="240" y2="145" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-fi-rose)"/>
  <rect x="245" y="125" width="50" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="270" y="137" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">重力 mg</text>
  <rect x="60" y="30" width="130" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="125" y="46" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">垂直: N ＝ mg cosθ</text>
  <text x="125" y="60" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">斜面: ma ＝ mg sinθ − f</text>
</svg>`
      };

    case 'spring':
      return {
        title: 'ばねの弾性力と単振動モデル',
        desc: '自然長からの変位 x に対して、常に平衡点へ引き戻す復元力 F = -kx が働きます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-sp-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-sp-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="50" y1="30" x2="50" y2="130" stroke="#94a3b8" stroke-width="3"/>
  <line x1="50" y1="120" x2="450" y2="120" stroke="#475569" stroke-width="2"/>
  <path d="M 50,80 L 80,80 L 95,65 L 115,95 L 135,65 L 155,95 L 175,65 L 195,95 L 215,65 L 235,95 L 250,80 L 270,80" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <rect x="270" y="60" width="45" height="40" rx="3" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="292" y="84" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">質量 m</text>
  <line x1="220" y1="45" x2="220" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <rect x="185" y="25" width="70" height="16" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="220" y="37" fill="#cbd5e1" font-size="9" text-anchor="middle">自然長位置</text>
  <line x1="220" y1="110" x2="270" y2="110" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-sp-cyan)"/>
  <rect x="235" y="125" width="40" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="255" y="136" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">変位 x</text>
  <line x1="270" y1="75" x2="210" y2="75" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-sp-rose)"/>
  <rect x="175" y="55" width="80" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="215" y="67" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">復元力 F ＝ -kx</text>
  <rect x="330" y="35" width="140" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="400" y="52" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">周期 T ＝ 2π√(m/k)</text>
  <text x="400" y="68" fill="#cbd5e1" font-size="9" text-anchor="middle">エネルギー E ＝ ½mv² ＋ ½kx²</text>
</svg>`
      };

    case 'pendulum':
      return {
        title: '単振り子の微小振動と周期の公式',
        desc: '微小角振れ θ ≪ 1 では、接線方向の復元力 -mg sinθ ≒ -mg(x/l) により単振動となります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pn-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-pn-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <line x1="140" y1="15" x2="260" y2="15" stroke="#94a3b8" stroke-width="3"/>
  <line x1="200" y1="15" x2="200" y2="135" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="200" y1="15" x2="245" y2="105" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="220" y="45" width="35" height="15" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="237" y="56" fill="#cbd5e1" font-size="9" text-anchor="middle">長さ l</text>
  <circle cx="245" cy="105" r="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <text x="245" y="109" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">m</text>
  <line x1="245" y1="105" x2="245" y2="145" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-pn-rose)"/>
  <rect x="250" y="130" width="45" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="272" y="141" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">重力 mg</text>
  <line x1="245" y1="105" x2="215" y2="55" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-pn-cyan)"/>
  <rect x="180" y="65" width="40" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="200" y="76" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">張力 S</text>
  <rect x="310" y="35" width="160" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="390" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">周期: T ＝ 2π√(l/g)</text>
  <text x="390" y="69" fill="#fbbf24" font-size="9" text-anchor="middle">※ 振幅が微小なときの等時性</text>
</svg>`
      };

    case 'pulley':
      return {
        title: '定滑車・動滑車と連結物体の運動方程式',
        desc: '同一の軽くて伸びない糸で結ばれた物体は、加速度の大きさが等しく張力 T が共通です。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-pu-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="180" y1="20" x2="320" y2="20" stroke="#94a3b8" stroke-width="3"/>
  <line x1="250" y1="20" x2="250" y2="45" stroke="#64748b" stroke-width="2"/>
  <circle cx="250" cy="55" r="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <line x1="234" y1="55" x2="234" y2="105" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="215" y="105" width="38" height="30" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="234" y="124" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">m₁</text>
  <line x1="266" y1="55" x2="266" y2="90" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="247" y="90" width="38" height="30" rx="3" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="266" y="109" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">m₂</text>
  <line x1="225" y1="95" x2="225" y2="70" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-pu-cyan)"/>
  <rect x="180" y="75" width="40" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="200" y="86" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">張力 T</text>
  <line x1="275" y1="80" x2="275" y2="55" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-pu-cyan)"/>
  <rect x="280" y="60" width="40" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="300" y="71" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">張力 T</text>
  <rect x="340" y="55" width="130" height="42" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="405" y="72" fill="#38bdf8" font-size="9" text-anchor="middle">m₁a ＝ T − m₁g</text>
  <text x="405" y="88" fill="#f43f5e" font-size="9" text-anchor="middle">m₂a ＝ m₂g − T</text>
</svg>`
      };

    case 'momentum':
      return {
        title: '台車の衝突と運動量保存則・反発係数',
        desc: '外力が働かない系では、衝突前後で全運動量が一定に保たれます（m₁v₁ + m₂v₂ = 一定）。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-mo-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-mo-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#fbbf24"/></marker>
  </defs>
  <line x1="30" y1="130" x2="470" y2="130" stroke="#475569" stroke-width="2"/>
  <rect x="100" y="90" width="60" height="32" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="130" y="110" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">台車A (m₁)</text>
  <line x1="165" y1="106" x2="220" y2="106" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-mo-cyan)"/>
  <rect x="175" y="85" width="45" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="197" y="97" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">速度 v₁</text>
  <rect x="290" y="90" width="60" height="32" rx="4" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="320" y="110" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">台車B (m₂)</text>
  <line x1="355" y1="106" x2="395" y2="106" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-mo-amber)"/>
  <rect x="360" y="85" width="45" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="382" y="97" fill="#fbbf24" font-size="9" text-anchor="middle">速度 v₂</text>
  <rect x="60" y="20" width="380" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="250" y="38" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">運動量保存: m₁v₁ ＋ m₂v₂ ＝ m₁v₁′ ＋ m₂v₂′</text>
  <text x="250" y="53" fill="#fbbf24" font-size="10" text-anchor="middle">反発係数: e ＝ − (v₁′ − v₂′) / (v₁ − v₂)</text>
</svg>`
      };

    case 'circular':
      return {
        title: '等速円運動の向心力と向心加速度',
        desc: '速度ベクトルは接線方向、向心加速度・向心力は常に円の中心を向きます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-cm-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-cm-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <circle cx="210" cy="85" r="55" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="210" cy="85" r="4" fill="#94a3b8"/>
  <text x="210" y="102" fill="#94a3b8" font-size="9" text-anchor="middle">中心 O</text>
  <circle cx="265" cy="85" r="8" fill="#fbbf24"/>
  <line x1="210" y1="85" x2="265" y2="85" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="228" y="72" width="25" height="14" rx="2" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="240" y="83" fill="#fbbf24" font-size="9" text-anchor="middle">r</text>
  <line x1="265" y1="85" x2="265" y2="25" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-cm-cyan)"/>
  <rect x="272" y="40" width="45" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="294" y="52" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">速度 v</text>
  <line x1="265" y1="85" x2="225" y2="85" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-cm-rose)"/>
  <rect x="230" y="93" width="75" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="267" y="105" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">向心力 F＝mv²/r</text>
  <rect x="330" y="45" width="145" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="402" y="62" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">加速度 a ＝ v²/r ＝ rω²</text>
  <text x="402" y="78" fill="#cbd5e1" font-size="9" text-anchor="middle">周期 T ＝ 2πr/v ＝ 2π/ω</text>
</svg>`
      };

    case 'gravitation':
      return {
        title: '万有引力の法則と人工衛星の円軌道',
        desc: '中心天体の質量 M からの万有引力 F = G(Mm/r²) が円運動の向心力として働きます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-gr-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-gr-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <circle cx="160" cy="80" r="32" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="160" y="85" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">地球 (M)</text>
  <circle cx="160" cy="80" r="75" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="235" cy="80" r="6" fill="#fbbf24"/>
  <line x1="235" y1="80" x2="235" y2="35" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-gr-cyan)"/>
  <rect x="240" y="45" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="262" y="56" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">速度 v</text>
  <line x1="235" y1="80" x2="195" y2="80" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-gr-rose)"/>
  <rect x="200" y="90" width="75" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="237" y="101" fill="#f43f5e" font-size="8" font-weight="700" text-anchor="middle">万有引力 GMm/r²</text>
  <rect x="300" y="35" width="180" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="390" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">軌道速度: v ＝ √(GM/r)</text>
  <text x="390" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">第1宇宙速度: v₁ ＝ √(gR)</text>
  <text x="390" y="86" fill="#fbbf24" font-size="9" text-anchor="middle">ケプラー第3則: T²/a³ ＝ 一定</text>
</svg>`
      };

    case 'energy':
      return {
        title: '力学的エネルギー保存則',
        desc: '保存力のみが仕事をする場合、運動エネルギー K と位置エネルギー U の和は常に一定です。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <path d="M 60,30 Q 180,140 440,80" fill="none" stroke="#475569" stroke-width="3"/>
  <circle cx="80" cy="40" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
  <rect x="40" y="60" width="80" height="30" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="80" y="73" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">位置E: mgh</text>
  <text x="80" y="85" fill="#94a3b8" font-size="8" text-anchor="middle">運動E: 0</text>
  <circle cx="220" cy="115" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <rect x="180" y="125" width="85" height="30" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="222" y="138" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">運動E: ½mv² (最大)</text>
  <text x="222" y="150" fill="#94a3b8" font-size="8" text-anchor="middle">位置E: 0 (基準)</text>
  <rect x="300" y="25" width="170" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="42" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">E ＝ ½mv² ＋ mgh ＝ 一定</text>
  <text x="385" y="58" fill="#cbd5e1" font-size="9" text-anchor="middle">外力の仕事: ΔE ＝ W_外力</text>
</svg>`
      };

    case 'toppling':
      return {
        title: '剛体のつり合いと転倒の条件',
        desc: '重心を通る重力作用線が物体の支持基底面（底面）を外れると、物体は転倒します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-tp-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-tp-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <line x1="40" y1="130" x2="320" y2="130" stroke="#64748b" stroke-width="2"/>
  <rect x="120" y="50" width="50" height="80" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="145" cy="90" r="4" fill="#fbbf24"/>
  <line x1="145" y1="90" x2="145" y2="145" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-tp-rose)"/>
  <rect x="155" y="115" width="45" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="177" y="126" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">重力 mg</text>
  <line x1="120" y1="60" x2="190" y2="60" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-tp-cyan)"/>
  <rect x="145" y="42" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="167" y="53" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">外力 F</text>
  <rect x="300" y="40" width="180" height="52" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="390" y="58" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">転倒条件: N の作用点が端点へ</text>
  <text x="390" y="75" fill="#fbbf24" font-size="9" text-anchor="middle">端点まわりのモーメント: Fh ＞ mg(a/2)</text>
</svg>`
      };

    // -------------------------------------------------------------
    // 波動（Waves）
    // -------------------------------------------------------------
    case 'travelingWave':
      return {
        title: '正弦波の波形（y-xグラフ）と波の基本式',
        desc: '振幅 A、波長 λ、周期 T と波の速さ v = fλ の関係をグラフから読み取ります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-w-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="30" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="1.5"/>
  <line x1="50" y1="145" x2="50" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="42" y="30" fill="#94a3b8" font-size="10">y</text>
  <text x="465" y="98" fill="#94a3b8" font-size="10">x</text>
  <path d="M 50,85 Q 95,25 140,85 T 230,85 T 320,85 T 410,85" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <line x1="50" y1="45" x2="230" y2="45" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="50" y1="40" x2="50" y2="50" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="230" y1="40" x2="230" y2="50" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="120" y="35" width="45" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="142" y="47" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">波長 λ</text>
  <line x1="95" y1="85" x2="95" y2="55" stroke="#f43f5e" stroke-width="1.5"/>
  <rect x="100" y="65" width="40" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="120" y="76" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">振幅 A</text>
  <line x1="330" y1="35" x2="390" y2="35" stroke="#34d399" stroke-width="2" marker-end="url(#arr-w-cyan)"/>
  <rect x="340" y="18" width="55" height="15" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1"/>
  <text x="367" y="29" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">進行方向 v</text>
  <rect x="290" y="115" width="180" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="380" y="131" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">基本式: v ＝ fλ ＝ λ/T</text>
</svg>`
      };

    case 'standingWave':
      return {
        title: '定常波の腹と節の位置関係',
        desc: '逆向きに進む同一波の合成により、振幅が常に 0 の節と、振幅が 2A となる腹が生じます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="85" x2="460" y2="85" stroke="#475569" stroke-width="1.5"/>
  <path d="M 60,85 Q 110,35 160,85 Q 210,135 260,85 Q 310,35 360,85 Q 410,135 460,85" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M 60,85 Q 110,135 160,85 Q 210,35 260,85 Q 310,135 360,85 Q 410,35 460,85" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="60" cy="85" r="5" fill="#f43f5e"/>
  <circle cx="160" cy="85" r="5" fill="#f43f5e"/>
  <circle cx="260" cy="85" r="5" fill="#f43f5e"/>
  <circle cx="360" cy="85" r="5" fill="#f43f5e"/>
  <rect x="145" y="95" width="30" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="160" y="107" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">節</text>
  <rect x="95" y="15" width="30" height="16" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1"/>
  <text x="110" y="27" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">腹</text>
  <line x1="60" y1="125" x2="160" y2="125" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="90" y="130" width="45" height="15" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="112" y="141" fill="#fbbf24" font-size="9" text-anchor="middle">λ / 2</text>
  <rect x="290" y="20" width="180" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="380" y="36" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">節と節の間隔: λ / 2</text>
  <text x="380" y="50" fill="#cbd5e1" font-size="9" text-anchor="middle">腹と節の間隔: λ / 4</text>
</svg>`
      };

    case 'sound_resonance':
      return {
        title: '気柱の共鳴（閉管・開管の固有振動）',
        desc: '閉口端は定常波の「節」、開口端は定常波の「腹」となり、管長 L と波長 λ の条件が決まります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="50" width="180" height="60" fill="none" stroke="#64748b" stroke-width="2"/>
  <line x1="240" y1="50" x2="240" y2="110" stroke="#f43f5e" stroke-width="4"/>
  <text x="245" y="45" fill="#f43f5e" font-size="9">閉口端(節)</text>
  <path d="M 60,50 Q 150,80 240,80" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 60,110 Q 150,80 240,80" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <text x="45" y="45" fill="#38bdf8" font-size="9">開口端(腹)</text>
  <line x1="60" y1="125" x2="240" y2="125" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="130" y="130" width="45" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="152" y="142" fill="#fbbf24" font-size="9" text-anchor="middle">管長 L</text>
  <rect x="280" y="40" width="195" height="55" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="377" y="58" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">閉管の基本振動: L ＝ λ/4</text>
  <text x="377" y="74" fill="#cbd5e1" font-size="9" text-anchor="middle">m倍振動: L ＝ (2m−1)λ/4</text>
  <text x="377" y="88" fill="#fbbf24" font-size="9" text-anchor="middle">開口端補正 Δl: 実効長 ＝ L ＋ Δl</text>
</svg>`
      };

    case 'doppler':
      return {
        title: 'ドップラー効果と波面の圧縮・観測振動数',
        desc: '音源が前進すると前方の波面が圧縮され波長が短縮するため、観測者の受け取る振動数が高くなります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-dp-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="30" y1="130" x2="470" y2="130" stroke="#475569" stroke-width="1.5"/>
  <circle cx="160" cy="80" r="55" fill="none" stroke="#64748b" stroke-width="1.5"/>
  <circle cx="180" cy="80" r="40" fill="none" stroke="#64748b" stroke-width="1.5"/>
  <circle cx="200" cy="80" r="25" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="210" cy="80" r="6" fill="#f43f5e"/>
  <line x1="210" y1="80" x2="250" y2="80" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-dp-cyan)"/>
  <rect x="205" y="55" width="60" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="235" y="67" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">音源 (v_s)</text>
  <circle cx="360" cy="80" r="7" fill="#34d399"/>
  <rect x="330" y="55" width="60" height="16" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1"/>
  <text x="360" y="67" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">観測者 (v_o)</text>
  <rect x="290" y="105" width="180" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="380" y="121" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">f′ ＝ (V − v_o) / (V − v_s) × f</text>
  <text x="380" y="135" fill="#cbd5e1" font-size="9" text-anchor="middle">前方波長: λ′ ＝ (V − v_s) / f</text>
</svg>`
      };

    case 'optics':
      return {
        title: '凸レンズの写像公式と光線追跡',
        desc: '軸平行光線は焦点 F を通り、レンズ中心を通る光線は直進して実像を結びます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-op-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="30" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="1.5"/>
  <ellipse cx="250" cy="80" rx="8" ry="60" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="2"/>
  <line x1="100" y1="80" x2="100" y2="40" stroke="#fbbf24" stroke-width="3" marker-end="url(#arr-op-cyan)"/>
  <rect x="75" y="45" width="22" height="14" rx="2" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="86" y="55" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">物</text>
  <line x1="100" y1="40" x2="250" y2="40" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="250" y1="40" x2="400" y2="120" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="100" y1="40" x2="400" y2="120" stroke="#34d399" stroke-width="1.5"/>
  <line x1="400" y1="80" x2="400" y2="120" stroke="#f43f5e" stroke-width="2.5"/>
  <rect x="405" y="95" width="22" height="14" rx="2" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="416" y="105" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">像</text>
  <circle cx="325" cy="80" r="3" fill="#38bdf8"/>
  <text x="325" y="95" fill="#38bdf8" font-size="9" text-anchor="middle">焦点 F</text>
  <rect x="80" y="130" width="340" height="22" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="250" y="145" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">レンズ公式: 1/a ＋ 1/b ＝ 1/f ,  倍率 m ＝ b/a</text>
</svg>`
      };

    case 'optics_snell':
      return {
        title: '光の屈折とスネルの法則・全反射',
        desc: '境界面に入射した光は屈折率の違いによって曲がり、臨界角以上では全反射が起こります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-sn-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="40" y1="80" x2="460" y2="80" stroke="#64748b" stroke-width="2"/>
  <line x1="200" y1="20" x2="200" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="280" y="60" fill="#94a3b8" font-size="9">媒質1 (屈折率 n₁)</text>
  <text x="280" y="110" fill="#94a3b8" font-size="9">媒質2 (屈折率 n₂)</text>
  <line x1="120" y1="30" x2="200" y2="80" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-sn-cyan)"/>
  <line x1="200" y1="80" x2="250" y2="140" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-sn-cyan)"/>
  <rect x="140" y="45" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="162" y="56" fill="#38bdf8" font-size="9" text-anchor="middle">入射角 θ₁</text>
  <rect x="215" y="105" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="237" y="116" fill="#38bdf8" font-size="9" text-anchor="middle">屈折角 θ₂</text>
  <rect x="310" y="30" width="165" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="48" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">スネルの法則: n₁sinθ₁ ＝ n₂sinθ₂</text>
  <text x="392" y="64" fill="#fbbf24" font-size="9" text-anchor="middle">臨界角: sinθ_c ＝ n₂ / n₁</text>
</svg>`
      };

    case 'interference':
      return {
        title: 'ヤングの実験と光路差による干渉条件',
        desc: 'スリット間隔 d、スクリーン距離 L における経路差 Δl = dx/L より明線間隔 Δx = Lλ/d が導かれます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="60" y1="20" x2="60" y2="60" stroke="#64748b" stroke-width="3"/>
  <line x1="60" y1="75" x2="60" y2="95" stroke="#64748b" stroke-width="3"/>
  <line x1="60" y1="110" x2="60" y2="150" stroke="#64748b" stroke-width="3"/>
  <line x1="420" y1="20" x2="420" y2="150" stroke="#94a3b8" stroke-width="3"/>
  <text x="425" y="35" fill="#94a3b8" font-size="9">スクリーン</text>
  <line x1="60" y1="67" x2="420" y2="50" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="60" y1="102" x2="420" y2="50" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="420" cy="50" r="4" fill="#f43f5e"/>
  <rect x="425" y="42" width="45" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="447" y="53" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">点 P (明線)</text>
  <rect x="150" y="20" width="220" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="260" y="35" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">明線条件: dx / L ＝ mλ</text>
  <text x="260" y="49" fill="#fbbf24" font-size="9" text-anchor="middle">明線間隔: Δx ＝ Lλ / d</text>
</svg>`
      };

    case 'interference_thinfilm':
      return {
        title: '薄膜の干渉と反射時の位相変化',
        desc: '屈折率の大小関係（自由端反射・固定端反射）に伴う位相の反転（πのずれ）に注意して光路差を求めます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="60" width="220" height="45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="170" y="87" fill="#38bdf8" font-size="10" text-anchor="middle">薄膜 (屈折率 n, 厚さ d)</text>
  <line x1="100" y1="20" x2="140" y2="60" stroke="#fbbf24" stroke-width="2"/>
  <line x1="140" y1="60" x2="180" y2="20" stroke="#fbbf24" stroke-width="2"/>
  <line x1="140" y1="60" x2="160" y2="105" stroke="#34d399" stroke-width="2"/>
  <line x1="160" y1="105" x2="200" y2="20" stroke="#34d399" stroke-width="2"/>
  <rect x="310" y="35" width="165" height="52" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">光路差: 2nd cos r</text>
  <text x="392" y="70" fill="#fbbf24" font-size="9" text-anchor="middle">固定端反射で位相が π 変化</text>
</svg>`
      };

    // -------------------------------------------------------------
    // 電磁気（Electromagnetism）
    // -------------------------------------------------------------
    case 'circuit':
      return {
        title: '直流回路とオームの法則・キルヒホッフ則',
        desc: '各素子の両端電位差 V = RI と、回路の任意の閉路で起電力の和＝電圧降下の和が成り立ちます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-c-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="70" y="30" width="360" height="100" fill="none" stroke="#64748b" stroke-width="2"/>
  <line x1="60" y1="75" x2="80" y2="75" stroke="#f43f5e" stroke-width="3"/>
  <line x1="65" y1="85" x2="75" y2="85" stroke="#f43f5e" stroke-width="2"/>
  <rect x="25" y="72" width="30" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="40" y="84" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">起電力 E</text>
  <rect x="200" y="20" width="60" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="230" y="34" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">抵抗 R₁</text>
  <rect x="200" y="120" width="60" height="20" rx="3" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="230" y="134" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">抵抗 R₂</text>
  <line x1="120" y1="30" x2="160" y2="30" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-c-cyan)"/>
  <rect x="130" y="10" width="40" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="150" y="21" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">電流 I</text>
  <rect x="300" y="60" width="160" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="380" y="76" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">オーム則: V ＝ RI</text>
  <text x="380" y="90" fill="#cbd5e1" font-size="9" text-anchor="middle">キルヒホッフ第2則: E ＝ RI</text>
</svg>`
      };

    case 'capacitor':
      return {
        title: '平行板コンデンサーの電気量と静電エネルギー',
        desc: '極板間の電位差 V に対し Q = CV の電荷が蓄えられ、静電エネルギー U = ½CV² が蓄積されます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-cap-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="180" y1="30" x2="180" y2="130" stroke="#f43f5e" stroke-width="4"/>
  <line x1="260" y1="30" x2="260" y2="130" stroke="#38bdf8" stroke-width="4"/>
  <rect x="130" y="70" width="45" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="152" y="83" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">＋Q (正)</text>
  <rect x="268" y="70" width="45" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="290" y="83" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">−Q (負)</text>
  <line x1="184" y1="50" x2="256" y2="50" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-cap-cyan)"/>
  <line x1="184" y1="80" x2="256" y2="80" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-cap-cyan)"/>
  <line x1="184" y1="110" x2="256" y2="110" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-cap-cyan)"/>
  <rect x="200" y="85" width="45" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="222" y="97" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">電場 E</text>
  <rect x="330" y="50" width="140" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="400" y="68" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">Q ＝ CV ,  C ＝ ε S/d</text>
  <text x="400" y="85" fill="#f43f5e" font-size="9" text-anchor="middle">エネルギー U ＝ ½ CV²</text>
</svg>`
      };

    case 'electricField':
      return {
        title: '点電荷の周囲の電場と電位・電気力線',
        desc: '電場 E は単位正電荷が受けるクーロン力、電位 V は無限遠を基準とした単位正電荷の位置エネルギーです。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-ef-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="160" cy="80" r="16" fill="#f43f5e"/>
  <text x="160" y="85" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">＋Q</text>
  <circle cx="160" cy="80" r="45" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <circle cx="160" cy="80" r="75" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="178" y1="80" x2="250" y2="80" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-ef-rose)"/>
  <rect x="200" y="60" width="45" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="222" y="71" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">電場 E</text>
  <rect x="300" y="40" width="175" height="55" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="387" y="58" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">クーロン力: F ＝ k(q₁q₂/r²)</text>
  <text x="387" y="74" fill="#cbd5e1" font-size="9" text-anchor="middle">電位: V ＝ k(Q/r)</text>
  <text x="387" y="88" fill="#fbbf24" font-size="9" text-anchor="middle">一様電場: V ＝ Ed</text>
</svg>`
      };

    case 'magneticForce':
      return {
        title: '磁場中の荷電粒子の運動・ローレンツ力',
        desc: '磁場 B 中を速度 v で動く電荷 q には、速度と磁場に直交するローレンツ力 F = qvB が働きます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-mf-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-mf-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <g fill="#475569" font-size="14">
    <text x="80" y="50">⊗</text><text x="140" y="50">⊗</text><text x="200" y="50">⊗</text>
    <text x="80" y="100">⊗</text><text x="140" y="100">⊗</text><text x="200" y="100">⊗</text>
  </g>
  <rect x="100" y="15" width="105" height="18" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="152" y="28" fill="#94a3b8" font-size="9" text-anchor="middle">磁場 B (画面奥向き)</text>
  <circle cx="200" cy="85" r="9" fill="#f43f5e"/>
  <text x="200" y="89" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">＋</text>
  <line x1="200" y1="85" x2="260" y2="85" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-mf-cyan)"/>
  <rect x="220" y="65" width="45" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="242" y="77" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">速度 v</text>
  <line x1="200" y1="85" x2="200" y2="35" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-mf-rose)"/>
  <rect x="145" y="40" width="50" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="170" y="52" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">力 F＝qvB</text>
  <rect x="300" y="45" width="165" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="382" y="62" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">円軌道半径: r ＝ mv / (qB)</text>
  <text x="382" y="78" fill="#fbbf24" font-size="9" text-anchor="middle">周期: T ＝ 2πm / (qB)</text>
</svg>`
      };

    case 'induction':
      return {
        title: '電磁誘導の法則と導線棒の誘導起電力',
        desc: '磁場 B 中を速さ v で横切る長さ L の導線棒には、起電力 V = vBL が生じます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-ind-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <line x1="60" y1="50" x2="350" y2="50" stroke="#64748b" stroke-width="3"/>
  <line x1="60" y1="120" x2="350" y2="120" stroke="#64748b" stroke-width="3"/>
  <rect x="50" y="70" width="20" height="30" rx="2" fill="#1e293b" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="60" y="89" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">R</text>
  <line x1="60" y1="50" x2="60" y2="70" stroke="#64748b" stroke-width="3"/>
  <line x1="60" y1="100" x2="60" y2="120" stroke="#64748b" stroke-width="3"/>
  <line x1="220" y1="40" x2="220" y2="130" stroke="#38bdf8" stroke-width="5"/>
  <text x="235" y="60" fill="#38bdf8" font-size="9" font-weight="700">棒 L</text>
  <line x1="220" y1="85" x2="275" y2="85" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-ind-cyan)"/>
  <rect x="235" y="93" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="257" y="104" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">速度 v</text>
  <rect x="340" y="55" width="135" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="407" y="72" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">誘導起電力: V ＝ vBL</text>
  <text x="407" y="86" fill="#f43f5e" font-size="9" text-anchor="middle">誘導電流: I ＝ V/R</text>
</svg>`
      };

    case 'alternatingCurrent':
      return {
        title: '交流回路の正弦波電圧と実効値',
        desc: '交流電圧 V(t) = V₀ sin(ωt) において、電力を生み出す実効値は Ve = V₀ / √2 となります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="1.5"/>
  <line x1="60" y1="140" x2="60" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <path d="M 60,85 Q 115,25 170,85 T 280,85 T 390,85" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <line x1="60" y1="42" x2="170" y2="42" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,3"/>
  <rect x="20" y="34" width="35" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="37" y="46" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">V₀</text>
  <line x1="60" y1="55" x2="280" y2="55" stroke="#f43f5e" stroke-width="1.5"/>
  <rect x="180" y="47" width="55" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="207" y="58" fill="#f43f5e" font-size="8" font-weight="700" text-anchor="middle">実効値 V_e</text>
  <rect x="300" y="30" width="165" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="382" y="48" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">実効値: V_e ＝ V₀ / √2</text>
  <text x="382" y="64" fill="#cbd5e1" font-size="9" text-anchor="middle">平均消費電力: P ＝ V_e I_e</text>
</svg>`
      };

    // -------------------------------------------------------------
    // 熱力学（Thermodynamics）
    // -------------------------------------------------------------
    case 'pvDiagram':
      return {
        title: '気体の状態変化とP-V図のサイクル仕事',
        desc: 'P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>`
      };

    case 'gasParticles':
      return {
        title: '気体分子運動論と圧力・平均運動エネルギー',
        desc: '立方体容器の壁への分子衝突から、気体分子の平均運動エネルギーが絶対温度 T に比例します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-g-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="80" y="30" width="180" height="100" fill="rgba(30,41,59,0.4)" stroke="#64748b" stroke-width="2"/>
  <circle cx="120" cy="65" r="5" fill="#38bdf8"/>
  <line x1="120" y1="65" x2="150" y2="50" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arr-g-cyan)"/>
  <circle cx="170" cy="100" r="5" fill="#38bdf8"/>
  <line x1="170" y1="100" x2="200" y2="115" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arr-g-cyan)"/>
  <circle cx="210" cy="60" r="5" fill="#f43f5e"/>
  <line x1="210" y1="60" x2="255" y2="60" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-g-cyan)"/>
  <rect x="290" y="45" width="180" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="380" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">平均運動E: ½ m(v²) ＝ 3/2 kT</text>
  <text x="380" y="82" fill="#fbbf24" font-size="9" text-anchor="middle">二乗平均速度: v_rms ＝ √(3RT/M)</text>
</svg>`
      };

    case 'heatEngine':
      return {
        title: '熱機関のエネルギーの流れと熱効率',
        desc: '高温熱源から受け取った熱 Q₁ の一部を仕事 W に変え、残りの熱 Q₂ を低温熱源へ放出します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-he-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-he-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="80" y="15" width="120" height="24" rx="4" fill="#f43f5e"/>
  <text x="140" y="31" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">高温熱源 (T_H)</text>
  <circle cx="140" cy="80" r="22" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="140" y="84" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">機関</text>
  <rect x="80" y="125" width="120" height="24" rx="4" fill="#0284c7"/>
  <text x="140" y="141" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">低温熱源 (T_L)</text>
  <line x1="140" y1="39" x2="140" y2="58" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-he-rose)"/>
  <text x="155" y="52" fill="#f43f5e" font-size="9" font-weight="700">Q₁</text>
  <line x1="140" y1="102" x2="140" y2="125" stroke="#0284c7" stroke-width="3" marker-end="url(#arr-he-cyan)"/>
  <text x="155" y="118" fill="#38bdf8" font-size="9" font-weight="700">Q₂</text>
  <line x1="162" y1="80" x2="225" y2="80" stroke="#fbbf24" stroke-width="3" marker-end="url(#arr-he-cyan)"/>
  <rect x="230" y="70" width="70" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="265" y="84" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">仕事 W ＝ Q₁−Q₂</text>
  <rect x="315" y="50" width="160" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="395" y="68" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱効率: e ＝ W / Q₁</text>
  <text x="395" y="84" fill="#cbd5e1" font-size="9" text-anchor="middle">e ＝ (Q₁ − Q₂) / Q₁</text>
</svg>`
      };

    // -------------------------------------------------------------
    // 原子物理（Atomic Physics）
    // -------------------------------------------------------------
    case 'photoelectric':
      return {
        title: '光電効果とアインシュタインの光電方程式',
        desc: '入射光子のエネルギー hν が金属の仕事関数 W を超えると、余剰が光電子の最大運動エネルギーになります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="180" y="50" width="130" height="80" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
  <text x="245" y="70" fill="#94a3b8" font-size="10" text-anchor="middle">金属内部</text>
  <text x="245" y="115" fill="#fbbf24" font-size="9" text-anchor="middle">仕事関数 W</text>
  <path d="M 60,60 Q 80,45 100,60 T 140,60 L 175,75" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <rect x="65" y="25" width="85" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="107" y="38" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">光子 E ＝ hν</text>
  <circle cx="180" cy="75" r="5" fill="#f43f5e"/>
  <line x1="180" y1="75" x2="120" y2="120" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-pe-rose)"/>
  <rect x="65" y="125" width="105" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="117" y="138" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">光電子 K_max</text>
  <rect x="325" y="45" width="160" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="405" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">hν ＝ W ＋ K_max</text>
  <text x="405" y="82" fill="#fbbf24" font-size="9" text-anchor="middle">阻止電圧: eV₀ ＝ K_max</text>
</svg>`
      };

    case 'atomicModel':
      return {
        title: 'ボーアの水素原子模型とエネルギー準位',
        desc: '電子は量子条件を満たす軌道のみを回り、軌道間の遷移に伴って光子 hν = E₂ - E₁ を放出します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-bo-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <circle cx="180" cy="80" r="10" fill="#f43f5e"/>
  <text x="180" y="84" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">＋e</text>
  <circle cx="180" cy="80" r="35" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="180" cy="80" r="60" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="215" cy="80" r="5" fill="#38bdf8"/>
  <circle cx="240" cy="80" r="5" fill="#fbbf24"/>
  <line x1="240" y1="80" x2="218" y2="80" stroke="#f43f5e" stroke-width="2"/>
  <path d="M 230,80 Q 245,60 260,80 T 290,80" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-bo-cyan)"/>
  <rect x="250" y="55" width="85" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="292" y="67" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">放出光子 hν</text>
  <rect x="340" y="45" width="145" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="412" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">振動数条件: hν ＝ E₂ − E₁</text>
  <text x="412" y="79" fill="#fbbf24" font-size="9" text-anchor="middle">量子条件: 2πr ＝ nλ</text>
</svg>`
      };

    case 'matterWave':
      return {
        title: '物質波（ド・ブロイ波）と電子線回折',
        desc: '運動量 p = mv を持つ粒子は波長 λ = h/p の波として振る舞い、回折・干渉現象を示します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-mw-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <circle cx="80" cy="80" r="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <text x="80" y="84" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">m</text>
  <line x1="95" y1="80" x2="145" y2="80" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-mw-cyan)"/>
  <text x="120" y="70" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">速さ v</text>
  <path d="M 160,80 Q 180,50 200,80 T 240,80 T 280,80" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
  <rect x="200" y="35" width="60" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="230" y="47" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">波長 λ</text>
  <rect x="300" y="40" width="180" height="52" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="390" y="58" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">ド・ブロイ波長: λ ＝ h / p</text>
  <text x="390" y="74" fill="#cbd5e1" font-size="9" text-anchor="middle">λ ＝ h / (mv) ＝ h / √(2mE)</text>
</svg>`
      };

    case 'nuclear':
      return {
        title: '原子核の崩壊・半減期と質量エネルギー',
        desc: '放射性原子核の個数は指数関数的に減少し、質量欠損 Δm により E = Δm c² の莫大な核エネルギーが解放されます。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-nu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="100" y="84" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">親核 (N₀)</text>
  <line x1="125" y1="80" x2="185" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-nu-rose)"/>
  <circle cx="215" cy="65" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="215" y="69" fill="#38bdf8" font-size="8" text-anchor="middle">娘核</text>
  <circle cx="240" cy="105" r="8" fill="#fbbf24"/>
  <text x="240" y="108" fill="#0f172a" font-size="8" font-weight="700" text-anchor="middle">α/β</text>
  <rect x="290" y="45" width="190" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">半減期: N ＝ N₀ (½)^(t/T)</text>
  <text x="385" y="82" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">質量欠損: E ＝ Δm c²</text>
</svg>`
      };

    case 'uniformMotion':
      return {
        title: '等速直線運動と変位・速さの関係',
        desc: '一定の速さ v で直線上を進む運動では、移動距離 x は時間 t に正比例します（x = vt）。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-um-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-um-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#64748b"/></marker>
  </defs>
  <line x1="50" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-um-slate)"/>
  <line x1="70" y1="140" x2="70" y2="25" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-um-slate)"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">x</text>
  <text x="445" y="142" fill="#94a3b8" font-size="10">t</text>
  <line x1="70" y1="130" x2="260" y2="40" stroke="#38bdf8" stroke-width="2.5"/>
  <circle cx="165" cy="85" r="4" fill="#fbbf24"/>
  <rect x="135" y="55" width="85" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="177" y="68" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">傾き ＝ 速さ v</text>
  <line x1="165" y1="85" x2="165" y2="130" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="70" y1="85" x2="165" y2="85" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <rect x="290" y="35" width="185" height="52" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="382" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">距離: x ＝ vt</text>
  <text x="382" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">速さ: v ＝ x / t (一定)</text>
</svg>`
      };

    case 'coulombLaw':
      return {
        title: 'クーロンの法則と点電荷間の静電気力',
        desc: '同種の電荷は退け合い（斥力）、異種の電荷は引き合います（引力）。力は距離の2乗に反比例します。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-cl-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
    <marker id="arr-cl-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="16" fill="#f43f5e"/>
  <text x="100" y="85" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">＋q₁</text>
  <line x1="100" y1="80" x2="50" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-cl-rose)"/>
  <rect x="45" y="55" width="45" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="67" y="66" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">力 F</text>
  <circle cx="230" cy="80" r="16" fill="#f43f5e"/>
  <text x="230" y="85" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">＋q₂</text>
  <line x1="230" y1="80" x2="280" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-cl-rose)"/>
  <rect x="245" y="55" width="45" height="15" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="267" y="66" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">力 F</text>
  <line x1="100" y1="120" x2="230" y2="120" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="145" y="125" width="40" height="15" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="165" y="136" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">距離 r</text>
  <rect x="300" y="40" width="180" height="52" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="390" y="58" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">クーロン力: F ＝ k |q₁q₂| / r²</text>
  <text x="390" y="74" fill="#fbbf24" font-size="9" text-anchor="middle">同種電荷: 斥力 ／ 異種電荷: 引力</text>
</svg>`
      };

    case 'heatCapacity':
      return {
        title: '比熱・熱容量と熱量保存の法則',
        desc: '物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>`
      };

    case 'photonEnergy':
      return {
        title: '光量子仮説と光子のエネルギー・運動量',
        desc: '振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>`
      };

    case 'atomicNucleus':
      return {
        title: '原子の構成と原子核（陽子・中性子・電子）',
        desc: '原子番号 Z（陽子の数＝中性原子の電子の数）と質量数 A（陽子＋中性子の総数）から構成が決まります。',
        svg: `<svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="80" r="50" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="185" cy="45" r="5" fill="#38bdf8"/>
  <rect x="195" y="35" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="217" y="46" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">電子 (e⁻)</text>
  <circle cx="150" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="150" y="77" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">原子核</text>
  <text x="150" y="90" fill="#fbbf24" font-size="8" text-anchor="middle">陽子＋中性子</text>
  <rect x="270" y="35" width="205" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">質量数 A ＝ 陽子数 Z ＋ 中性子数 N</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">中性原子: 電子数 ＝ 陽子数 Z</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">同位体: Z が同じで A が異なる原子</text>
</svg>`
      };

    default:
      return null;
  }
}

// 問題のタイトル・問題文・トピックから最適な illustration kind を判定する高度なマッチャー
function getIllustrationForProblem(unitId, problem) {
  const text = (problem.title + ' ' + problem.prompt + ' ' + (problem.topicId || '')).toLowerCase();

  if (unitId === 'mechanics') {
    if (text.includes('平均の速さ') || text.includes('等速直線') || text.includes('速さ') && !text.includes('加速度')) {
      return getIllustration('uniformMotion');
    }
    if (text.includes('v-t') || text.includes('等加速度') || text.includes('初速度') || text.includes('加速度') || text.includes('停止')) {
      return getIllustration('kinematics_vt');
    }
    if (text.includes('投射') || text.includes('放物') || text.includes('水平投射') || text.includes('斜方投射')) {
      return getIllustration('projectile');
    }
    if (text.includes('自由落下') || text.includes('鉛直') || text.includes('投げ上げ') || text.includes('落下')) {
      return getIllustration('free_fall');
    }
    if (text.includes('ばね') || text.includes('弾性') || text.includes('フック')) {
      return getIllustration('spring');
    }
    if (text.includes('振り子')) {
      return getIllustration('pendulum');
    }
    if (text.includes('滑車') || text.includes('糸で結ばれ') || text.includes('アトウッド')) {
      return getIllustration('pulley');
    }
    if (text.includes('衝突') || text.includes('運動量') || text.includes('反発係数') || text.includes('はね返り')) {
      return getIllustration('momentum');
    }
    if (text.includes('円運動') || text.includes('向心力') || text.includes('周期') && text.includes('円')) {
      return getIllustration('circular');
    }
    if (text.includes('万有引力') || text.includes('惑星') || text.includes('ケプラー') || text.includes('宇宙速度') || text.includes('軌道')) {
      return getIllustration('gravitation');
    }
    if (text.includes('転倒') || text.includes('モーメント') || text.includes('剛体') || text.includes('つり合い')) {
      return getIllustration('toppling');
    }
    if (text.includes('力学的エネルギー') || text.includes('エネルギー保存') || text.includes('仕事')) {
      return getIllustration('energy');
    }
    if (text.includes('斜面') || text.includes('摩擦') || text.includes('運動方程式') || text.includes('力')) {
      return getIllustration('force_incline');
    }
    return getIllustration('kinematics_axis');
  }

  if (unitId === 'waves') {
    if (text.includes('ヤング') || text.includes('スリット') || text.includes('干渉') && text.includes('明線')) {
      return getIllustration('interference');
    }
    if (text.includes('薄膜') || text.includes('反射') && text.includes('位相')) {
      return getIllustration('interference_thinfilm');
    }
    if (text.includes('定常波') || text.includes('定在波') || text.includes('節') || text.includes('腹')) {
      return getIllustration('standingWave');
    }
    if (text.includes('気柱') || text.includes('閉管') || text.includes('開管') || text.includes('共鳴') || text.includes('おんさ')) {
      return getIllustration('sound_resonance');
    }
    if (text.includes('ドップラー') || text.includes('救急車') || text.includes('音源')) {
      return getIllustration('doppler');
    }
    if (text.includes('レンズ') || text.includes('実像') || text.includes('虚像') || text.includes('焦点')) {
      return getIllustration('optics');
    }
    if (text.includes('屈折') || text.includes('スネル') || text.includes('全反射') || text.includes('臨界角')) {
      return getIllustration('optics_snell');
    }
    return getIllustration('travelingWave');
  }

  if (unitId === 'electromagnetism') {
    if (text.includes('クーロン') || text.includes('クーロン力')) {
      return getIllustration('coulombLaw');
    }
    if (text.includes('コンデンサー') || text.includes('極板') || text.includes('静電エネルギー') || text.includes('電気容量')) {
      return getIllustration('capacitor');
    }
    if (text.includes('電場') || text.includes('電位') || text.includes('電気力線')) {
      return getIllustration('electricField');
    }
    if (text.includes('ローレンツ') || text.includes('磁場') && text.includes('荷電粒子') || text.includes('サイクロトロン')) {
      return getIllustration('magneticForce');
    }
    if (text.includes('誘導') || text.includes('導線棒') || text.includes('レンツ') || text.includes('ファラデー')) {
      return getIllustration('induction');
    }
    if (text.includes('交流') || text.includes('実効値') || text.includes('インピーダンス')) {
      return getIllustration('alternatingCurrent');
    }
    return getIllustration('circuit');
  }

  if (unitId === 'thermodynamics') {
    if (text.includes('比熱') || text.includes('熱容量') || text.includes('熱量') && !text.includes('熱機関')) {
      return getIllustration('heatCapacity');
    }
    if (text.includes('p-v') || text.includes('サイクル') || text.includes('状態変化') || text.includes('等温') || text.includes('断熱') || text.includes('気体の圧力')) {
      return getIllustration('pvDiagram');
    }
    if (text.includes('分子運動') || text.includes('二乗平均') || text.includes('平均運動エネルギー') || text.includes('ボルツマン')) {
      return getIllustration('gasParticles');
    }
    if (text.includes('熱機関') || text.includes('熱効率') || text.includes('カルノー') || text.includes('高温熱源')) {
      return getIllustration('heatEngine');
    }
    return getIllustration('pvDiagram');
  }

  if (unitId === 'atomic') {
    if (text.includes('光子') || text.includes('光子のエネルギー') || text.includes('プランク定数')) {
      return getIllustration('photonEnergy');
    }
    if (text.includes('構成') || text.includes('陽子') || text.includes('中性子') || text.includes('質量数') || text.includes('原子番号')) {
      return getIllustration('atomicNucleus');
    }
    if (text.includes('光電') || text.includes('仕事関数') || text.includes('阻止電圧') || text.includes('アインシュタイン')) {
      return getIllustration('photoelectric');
    }
    if (text.includes('ボーア') || text.includes('水素原子') || text.includes('軌道') || text.includes('エネルギー準位') || text.includes('リュードベリ')) {
      return getIllustration('atomicModel');
    }
    if (text.includes('物質波') || text.includes('ド・ブロイ') || text.includes('電子線')) {
      return getIllustration('matterWave');
    }
    if (text.includes('半減期') || text.includes('放射') || text.includes('崩壊') || text.includes('質量欠損') || text.includes('結合エネルギー')) {
      return getIllustration('nuclear');
    }
    return getIllustration('photoelectric');
  }

  return getIllustration('kinematics_axis');
}

module.exports = {
  getIllustration,
  getIllustrationForProblem
};
