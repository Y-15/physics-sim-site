---
title: 大学熱力学・統計力学（Thermodynamics & Statistical Mechanics）
description: 熱力学4大ポテンシャル（U, H, F, G）とルジャンドル変換、マクスウェル関係式から、ミクロな統計確率、カノニカル分配関数、状態方程式の導出まで完全網羅。
---

# 🔥 大学熱力学・統計力学（Thermodynamics & Statistical Mechanics）

<div class="lead">
高校物理の熱力学は「気体の状態方程式 $PV = nRT$」と「第1法則 $Q = \Delta U + W$」を計算することが主でした。<br>
大学の熱力学では、<strong>エントロピー $S$</strong> を中心に据えた<strong>ルジャンドル変換と熱力学関数（$U, H, F, G$）</strong>により、あらゆる物質の熱的応答を普遍的に記述します。<br>
さらに<strong>統計力学</strong>によって、分子運動論を超えた「微視的量子状態の確率分布（分配関数 $Z$）」から、マクロな温度・圧力・エントロピーを第一原理的に導出します。
</div>

---

## 1. 熱力学の基本原理と数学的構造

### ① 熱力学の4法則
1. **第0法則（熱平衡の推移律）**: 系Aと系Bが熱平衡にあり、系Bと系Cが熱平衡にあるなら、系Aと系Cも熱平衡にある（**温度 $T$ の定義**）。
2. **第1法則（エネルギー保存則）**: 系に与えられた微小熱量を $d'Q$、系が外部になす仕事を $d'W$ とすると、内部エネルギー $U$ の変化は完全微分となる：
   $$dU = d'Q - d'W = d'Q - P dV$$
3. **第2法則（エントロピー増大則）**: 孤立系において自発的変化が生じるとき、エントロピー $S$ は常に増大または一定に保たれる（$\Delta S \ge 0$）。可逆過程では $dS = \frac{d'Q_{\text{rev}}}{T}$。
4. **第3法則（ネルンスト・プランクの定理）**: 絶対零度 $T \to 0\,\text{K}$ において、すべての純粋な結晶のエントロピーはゼロに収束する（$S \to 0$）。

### ② 熱力学基本関係式
可逆過程において第1法則と第2法則を連立させると、熱力学の最重要微分形式が得られます：

$$dU = T dS - P dV$$

これにより、内部エネルギー $U$ の自然な独立変数は **$(S, V)$** であることがわかります。

---

## 2. ルジャンドル変換と4大熱力学ポテンシャル

実験室ではエントロピー $S$ や体積 $V$ を直接制御するよりも、温度 $T$ や圧力 $P$ を一定に保つ方が容易です。
数学の **ルジャンドル変換（Legendre Transformation）** を用いて独立変数を変換します：

<table class="standard-table">
  <thead>
    <tr>
      <th>熱力学関数</th>
      <th>定義式</th>
      <th>全微分形式</th>
      <th>自然な変数</th>
      <th>平衡条件（極小原理）</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>内部エネルギー $U$</strong></td>
      <td>基本量</td>
      <td>$$dU = TdS - PdV$$</td>
      <td>$(S, V)$</td>
      <td>$(S, V)$ 一定で $U$ 最小</td>
    </tr>
    <tr>
      <td><strong>エンタルピー $H$</strong></td>
      <td>$$H = U + PV$$</td>
      <td>$$dH = TdS + VdP$$</td>
      <td>$(S, P)$</td>
      <td>$(S, P)$ 一定で $H$ 最小</td>
    </tr>
    <tr>
      <td><strong>ヘルムホルツ自由エネルギー $F$</strong></td>
      <td>$$F = U - TS$$</td>
      <td>$$dF = -SdT - PdV$$</td>
      <td>$(T, V)$</td>
      <td>$(T, V)$ 一定で $F$ 最小</td>
    </tr>
    <tr>
      <td><strong>ギブズ自由エネルギー $G$</strong></td>
      <td>$$G = H - TS$$</td>
      <td>$$dG = -SdT + VdP$$</td>
      <td>$(T, P)$</td>
      <td>$(T, P)$ 一定で $G$ 最小（相平衡・化学反応）</td>
    </tr>
  </tbody>
</table>

---

## 3. 4大マクスウェルの関係式

関数の2階偏微分の順序交換可能性（シュワルツの定理 $\frac{\partial^2 \Phi}{\partial x \partial y} = \frac{\partial^2 \Phi}{\partial y \partial x}$）から、直接測定困難なエントロピーの偏微分を、測定容易な $P, V, T$ の偏微分に変換する公式が導かれます：

$$\left(\frac{\partial T}{\partial V}\right)_S = -\left(\frac{\partial P}{\partial S}\right)_V \quad (U\text{ より})$$

$$\left(\frac{\partial T}{\partial P}\right)_S = \left(\frac{\partial V}{\partial S}\right)_P \quad (H\text{ より})$$

$$\left(\frac{\partial S}{\partial V}\right)_T = \left(\frac{\partial P}{\partial T}\right)_V \quad (F\text{ より})$$

$$\left(\frac{\partial S}{\partial P}\right)_T = -\left(\frac{\partial V}{\partial T}\right)_P \quad (G\text{ より})$$

### 熱力学的状態方程式
この第3式を用いることで、高校物理で天下り的に与えられていた内部エネルギーの体積依存性が即座に計算されます：

$$\left(\frac{\partial U}{\partial V}\right)_T = T\left(\frac{\partial P}{\partial T}\right)_V - P$$

理想気体 $P = \frac{nRT}{V}$ では右辺がゼロとなり、「理想気体の内部エネルギーは体積に依存せず温度のみの関数である（ジュールの法則）」ことが証明されます。

---

## 4. 統計力学（Statistical Mechanics）の基礎

熱力学が現象論（マクロな観測量）であるのに対し、統計力学は構成粒子（原子・分子）の量子力学的状態の確率的集計から熱力学を演繹します。

### ① ボルツマンの原理
孤立系がエネルギー $E \sim E + \Delta E$ にとりうる微視的状態の総数を $W(E, V, N)$ とするとき、エントロピー $S$ は状態数の対数に比例します：

$$S = k_B \ln W$$

（ここで $k_B = 1.381 \times 10^{-23} \,\text{J/K}$ はボルツマン定数）。

### ② カノニカル分布（正準集団）
温度 $T$ の巨大な熱浴と熱平衡にある系が、微視的エネルギー状態 $E_i$ をとる確率 $P_i$ は **ボルツマン因子** に比例します：

$$P_i = \frac{e^{-\beta E_i}}{Z}, \quad \beta \equiv \frac{1}{k_B T}$$

ここで規格化定数 $Z$ が統計力学の最重要概念である **カノニカル分配関数（Partition Function）** です：

$$Z(\beta, V, N) = \sum_i e^{-\beta E_i}$$

### ③ 分配関数から熱力学関数への架け橋
分配関数 $Z$ を計算することができれば、すべてのマクロ熱力学量が微分操作だけで得られます：

$$F(T, V, N) = -k_B T \ln Z \quad (\text{ヘルムホルツ自由エネルギー})$$

$$U = \langle E \rangle = -\frac{\partial}{\partial \beta}\ln Z = k_B T^2 \frac{\partial}{\partial T}\ln Z$$

$$P = -\left(\frac{\partial F}{\partial V}\right)_T = k_B T \frac{\partial}{\partial V}\ln Z$$

$$S = -\left(\frac{\partial F}{\partial T}\right)_V = k_B \ln Z + \frac{U}{T}$$

---

## 5. 古典単原子分子理想気体の完全導出

質量 $m$ の無相関な $N$ 個の粒子について、位相空間上の分配関数をガウス積分で計算すると：

$$Z_N = \frac{1}{N! h^{3N}} \int d^{3N}q \int d^{3N}p \exp\left(-\beta \sum_{i=1}^N \frac{\vec{p}_i^2}{2m}\right) = \frac{1}{N!}\left( \frac{V}{\Lambda^3} \right)^N$$

ここで熱的ド・ブロイ波長 $\Lambda = \frac{h}{\sqrt{2\pi m k_B T}}$。
スターリングの公式 $\ln N! \approx N\ln N - N$ を用いて自由エネルギーを求めると：

$$F = -N k_B T \left[ \ln\left( \frac{V}{N\Lambda^3} \right) + 1 \right]$$

これを体積 $V$ で微分すると：

$$P = -\left(\frac{\partial F}{\partial V}\right)_T = \frac{N k_B T}{V} \implies PV = N k_B T = n R T$$

これを逆温度 $\beta$ で微分すると：

$$U = -\frac{\partial}{\partial \beta}\ln Z_N = \frac{3}{2}N k_B T = \frac{3}{2}n R T$$

高校物理の教科書に書かれていた気体の状態方程式と単原子分子の内部エネルギーが、統計力学の第一原理から一分の隙もなく数学的に導き出されます。

---

## 📝 大学熱・統計力学 演習問題で実力を鍛える

マクスウェル関係式、分配関数の計算、ショットキー比熱など、大学院入試頻出の本格的演習問題に挑戦しましょう：

<div class="problem-jump-card">
  <h3>🔥 大学熱力学・統計力学 厳選演習問題集</h3>
  <p>ルジャンドル変換と4大マクスウェル関係式の完全証明、多重ガウス積分による古典理想気体のカノニカル分配関数計算など、計算ステップを明快に解説した演習問題集です。</p>
  <a class="jump-btn" href="/university/problems/thermodynamics">👉 熱・統計力学 演習問題を解く →</a>
</div>

<style scoped>
.problem-jump-card {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.12));
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 2rem 0;
}
.problem-jump-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #ef4444;
}
.problem-jump-card p {
  margin: 0 0 14px 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.jump-btn {
  display: inline-block;
  padding: 8px 18px;
  background: #ef4444;
  color: #fff !important;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 6px;
  text-decoration: none;
}
.jump-btn:hover {
  opacity: 0.9;
}
.standard-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.88rem;
}
.standard-table th, .standard-table td {
  border: 1px solid var(--vp-c-border);
  padding: 12px 14px;
  text-align: left;
}
.standard-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 700;
}
</style>
