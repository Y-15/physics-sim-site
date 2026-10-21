# 熱力学・統計力学（熱力学ポテンシャル・マクスウェルの関係式と統計アンサンブル）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学1〜3年次 ／ 必須数学：多変数関数の偏微分・全微分・ルジャンドル変換・ガウス積分・確率統計
</div>

高校物理の熱分野では、単原子分子理想気体の状態方程式 $PV = nRT$ とエネルギー保存則 $\Delta U = Q + W$ を中心に学びました。
大学の**熱力学（Thermodynamics）**では、気体か固体かといった物質のミクロな構造に一切依存せず、「状態量の全微分」と「ルジャンドル変換」からエントロピー $S$ や自由エネルギー $F, G$ の普遍的な関係式（マクスウェルの関係式）を導く巨視的体系を学びます。さらに**統計力学（Statistical Mechanics）**では、アボガドロ数個（$N \sim 10^{23}$）の粒子が織りなすミクロな位相空間 $(\boldsymbol{q}_1, \dots, \boldsymbol{q}_N, \boldsymbol{p}_1, \dots, \boldsymbol{p}_N)$ の確率分布（分配関数 $Z$）から、熱力学関数をミクロな原理に基づいて演繹的に導出します。

> **表記ルール（ISO 80000-2 準拠）**：本講座では、粒子の位置ベクトル $\boldsymbol{r}_i$（一般化座標 $\boldsymbol{q}_i$）、運動量ベクトル $\boldsymbol{p}_i$、速度ベクトル $\boldsymbol{v}_i$、波数ベクトル $\boldsymbol{k}$ などのベクトル量をすべて**太字（ボールド体）**で表記し、偏微分においては固定する状態変数を添字 $\left(\dfrac{\partial Y}{\partial X}\right)_Z$ として明記します。

---

## 1. 熱力学の基本法則とエントロピー

### 1.1 状態量（完全微分）と経路依存量（不完全微分）

熱力学系（巨視的平衡状態）を指定する変数のうち、系の質量や粒子数 $N$ に比例する量を**示量変数（Extensive variables：$U, S, V, N$ など）**、系の大きさに依らない局所的な強さを表す量を**示強変数（Intensive variables：$T, P, \mu$ など）**と呼びます。

平衡状態だけで値がただ一つに定まる物理量（内部エネルギー $U$、エントロピー $S$、体積 $V$ など）を**状態量（State function）**と呼び、その微小変化 $dU, dS, dV$ は**完全微分（Exact differential）**となります。すなわち、任意の閉サイクル $\oint$ に沿った積分は常にゼロであり、2変数関数 $f(x, y)$ に対してはオイラーの可積分条件（偏微分の順序交換可能性）が成り立ちます。

$$
\oint dU = 0 \quad \Longleftrightarrow \quad df = M(x, y)\,dx + N(x, y)\,dy \text{ において } \left(\frac{\partial M}{\partial y}\right)_x = \left(\frac{\partial N}{\partial x}\right)_y
$$

これに対し、外界から系へ流入する**熱量 $d'Q$** や、外界が系になす**仕事 $d'W$** は、途中の過程（経路）に依存する**不完全微分（Inexact differential）**であり、状態量 $Q, W$ の微分ではないことを明示するためにプライム記号 $d'$（または $\delta$）を付して表記します（一般に $\oint d'Q \neq 0,\ \oint d'W \neq 0$）。

### 1.2 熱力学第0〜第3法則の体系

熱力学の全理論は、経験則を公理化した以下の4つの基本法則の上に構築されています。

| 法則 | 名称と数学的表現 | 導入される基本概念・物理的意味 |
| :--- | :--- | :--- |
| **第0法則** | 熱平衡の推移律（$A \sim B$ かつ $B \sim C \implies A \sim C$） | **温度 $T$** の存在：熱平衡にある系同士が共有する示強変数としての温度の定義。 |
| **第1法則** | $\displaystyle dU = d'Q + d'W \quad (\text{準静的過程では } d'W = -P\,dV + \mu\,dN)$ | **内部エネルギー $U$** の存在とエネルギー保存則：不完全微分の和 $d'Q + d'W$ が完全微分 $dU$ となる（第一種永久機関の否定）。 |
| **第2法則** | クラウジウスの不等式：$\displaystyle \oint \frac{d'Q}{T_{\text{ext}}} \le 0$、および $\displaystyle dS \ge \frac{d'Q}{T}$ | **絶対温度 $T$** と **エントロピー $S$** の存在：不可逆過程における変化の向きの規定（第二種永久機関の否定）。 |
| **第3法則** | ネルンスト・プランクの定理：$\displaystyle \lim_{T \to +0} S(T, V, N) = 0$ | 絶対零度（$T \to 0\,\text{K}$）におけるエントロピーの絶対基準の確定（結果として $T\to 0$ で熱容量 $C_V, C_P \to 0$、熱膨張率 $\alpha \to 0$）。 |

### 1.3 カルノーの定理とクラウジウスの不等式・エントロピー生成

高温熱源 $T_H$ から熱 $Q_H (>0)$ を吸収し、低温熱源 $T_L$ へ熱 $Q_L (>0)$ を放出して外部に仕事 $W = Q_H - Q_L$ をする熱機関の熱効率 $\eta = \dfrac{W}{Q_H}$ は、作業物質の種類によらず可逆サイクル（カルノーサイクル）で最大となり、次式を満たします（**カルノーの定理**）。

$$
\eta \equiv 1 - \frac{Q_L}{Q_H} \le 1 - \frac{T_L}{T_H} \quad \Longleftrightarrow \quad \frac{Q_H}{T_H} - \frac{Q_L}{T_L} \le 0
$$

任意のサイクルを無数の微小カルノーサイクルの集合に分解することで、一般のサイクルに対する**クラウジウスの不等式**が得られます（等号は準静的可逆サイクルのときのみ成立）。

$$
\oint \frac{d'Q}{T} \le 0 \qquad (\text{可逆サイクルでは } \oint \frac{d'Q_{\text{rev}}}{T} = 0)
$$

可逆過程での周回積分がゼロであることから、状態 $A$ から状態 $B$ へ至る可逆経路に沿った積分によって状態量 **エントロピー $S$** が一意に定義されます。

$$
dS \equiv \frac{d'Q_{\text{rev}}}{T} \quad \Longrightarrow \quad S(B) - S(A) = \int_A^B \frac{d'Q_{\text{rev}}}{T} \ge \int_A^B \frac{d'Q}{T}
$$

特に、外界と熱のやり取りをしない**断熱系（$d'Q = 0$）および孤立系**においては、常に **エントロピー増大則** が成り立ちます。

$$
\Delta S_{\text{adiabatic}} \ge 0 \qquad (\text{等号は可逆過程のみ成立、不可逆過程では正のエントロピー生成 } d_i S > 0 \text{ が生じる})
$$

<div class="sim-embed">
  <div class="sim-embed-header">▼ カルノーサイクルの P-V 線図・T-S 線図と熱効率をインタラクティブに確認する</div>
  <CarnotCycle />
</div>

---

## 2. 熱力学ポテンシャルとルジャンドル変換

### 2.1 熱力学の基本関係式と自然な独立変数

準静的過程において、第1法則 $dU = d'Q_{\text{rev}} + d'W_{\text{rev}}$ に $d'Q_{\text{rev}} = T\,dS$ と $d'W_{\text{rev}} = -P\,dV + \mu\,dN$（$\mu$ は粒子1個あたりの化学ポテンシャル）を代入すると、熱力学のすべての情報を凝縮した**熱力学の基本関係式（Fundamental thermodynamic relation）**が得られます。

$$
dU = T\,dS - P\,dV + \mu\,dN
$$

この式は、内部エネルギーを **$U = U(S, V, N)$** の関数として表したとき、偏微分によってすべての示強変数 $(T, P, \mu)$ が直ちに得られることを示しています。

$$
T = \left(\frac{\partial U}{\partial S}\right)_{V,N}, \qquad P = -\left(\frac{\partial U}{\partial V}\right)_{S,N}, \qquad \mu = \left(\frac{\partial U}{\partial N}\right)_{S,V}
$$

このように、完全な熱力学情報を保持する独立変数の組 $(S, V, N)$ を、内部エネルギー $U$ の**自然な変数（Natural variables）**と呼びます。

### 2.2 ルジャンドル変換と5つの熱力学ポテンシャル

実験室ではエントロピー $S$ や体積 $V$ を一定に制御するよりも、温度 $T$（恒温槽）や圧力 $P$（大気圧下）、化学ポテンシャル $\mu$（粒子浴）を制御する方がはるかに容易です。
そこで、関数 $U(S, V, N)$ の情報を一切失うことなく、独立変数を共役な示強変数（$S \to T$, $V \to P$, $N \to \mu$）へと切り替える数学的操作が**ルジャンドル変換（Legendre transformation）**です。たとえば $S$ を $T = \partial U/\partial S$ に変換するには、積 $TS$ を引いた新しい関数 $F \equiv U - TS$ を定義します。すると $dF = dU - T\,dS - S\,dT = -S\,dT - P\,dV + \mu\,dN$ となり、独立変数が $(T, V, N)$ へ切り替わります。

| 熱力学ポテンシャル | 定義式（ルジャンドル変換） | 自然な変数 | 全微分（基本関係式） | 偏微分による状態量の導出 |
| :--- | :--- | :---: | :--- | :--- |
| **内部エネルギー $U$** | $U$ | $(S, V, N)$ | $dU = T\,dS - P\,dV + \mu\,dN$ | $\displaystyle T = \left(\frac{\partial U}{\partial S}\right)_{V,N},\ P = -\left(\frac{\partial U}{\partial V}\right)_{S,N},\ \mu = \left(\frac{\partial U}{\partial N}\right)_{S,V}$ |
| **エンタルピー $H$** | $H \equiv U + PV$ | $(S, P, N)$ | $dH = T\,dS + V\,dP + \mu\,dN$ | $\displaystyle T = \left(\frac{\partial H}{\partial S}\right)_{P,N},\ V = \left(\frac{\partial H}{\partial P}\right)_{S,N},\ \mu = \left(\frac{\partial H}{\partial N}\right)_{S,P}$ |
| **ヘルムホルツ自由エネルギー $F$** | $F \equiv U - TS$ | $(T, V, N)$ | $dF = -S\,dT - P\,dV + \mu\,dN$ | $\displaystyle S = -\left(\frac{\partial F}{\partial T}\right)_{V,N},\ P = -\left(\frac{\partial F}{\partial V}\right)_{T,N},\ \mu = \left(\frac{\partial F}{\partial N}\right)_{T,V}$ |
| **ギブス自由エネルギー $G$** | $G \equiv U - TS + PV = H - TS$ | $(T, P, N)$ | $dG = -S\,dT + V\,dP + \mu\,dN$ | $\displaystyle S = -\left(\frac{\partial G}{\partial T}\right)_{P,N},\ V = \left(\frac{\partial G}{\partial P}\right)_{T,N},\ \mu = \left(\frac{\partial G}{\partial N}\right)_{T,P}$ |
| **グランドポテンシャル $\Omega$ ($J$)** | $\Omega \equiv F - \mu N = U - TS - \mu N$ | $(T, V, \mu)$ | $d\Omega = -S\,dT - P\,dV - N\,d\mu$ | $\displaystyle S = -\left(\frac{\partial \Omega}{\partial T}\right)_{V,\mu},\ P = -\left(\frac{\partial \Omega}{\partial V}\right)_{T,\mu},\ N = -\left(\frac{\partial \Omega}{\partial \mu}\right)_{T,V}$ |

### 2.3 オイラーの関係式とギブス・デュエムの関係式

内部エネルギー $U(S, V, N)$ はすべての自然な変数が示量変数であり、系のサイズを $\lambda$ 倍にするとエネルギーも $\lambda$ 倍になる**1次の同次関数**です：

$$
U(\lambda S, \lambda V, \lambda N) = \lambda U(S, V, N)
$$

両辺を $\lambda$ で微分して $\lambda = 1$ を代入すると、微分のない状態量間の恒等式である**オイラーの関係式（Euler relation）**が得られます。

$$
U = TS - PV + \mu N \quad \Longrightarrow \quad G = U - TS + PV = \mu N, \qquad \Omega = U - TS - \mu N = -PV
$$

さらに、オイラーの関係式の全微分 $dU = T\,dS + S\,dT - P\,dV - V\,dP + \mu\,dN + N\,d\mu$ から基本関係式 $dU = T\,dS - P\,dV + \mu\,dN$ を差し引くと、示強変数 $(T, P, \mu)$ の変化が互いに独立ではないことを示す**ギブス・デュエムの関係式（Gibbs-Duhem equation）**が導かれます。

$$
S\,dT - V\,dP + N\,d\mu = 0 \quad \Longleftrightarrow \quad d\mu = -s\,dT + v\,dP \quad \left(s \equiv \frac{S}{N},\ v \equiv \frac{V}{N}\right)
$$

### 2.4 自由エネルギーの物理的意味と極値原理（平衡条件）

クラウジウスの不等式 $d'Q \le T\,dS$ を第1法則 $dU = d'Q + d'W$ に代入すると、$dU - T\,dS \le d'W$ となります。
- **等温過程（$dT = 0$）における最大仕事原理**：
  $$
  -d'W \le -d(U - TS) = -dF \quad \Longleftrightarrow \quad W_{\text{by system}} \le -\Delta F
  $$
  すなわち、等温過程で系が外部に取り出せる最大の仕事はヘルムホルツ自由エネルギーの減少量 $-\Delta F$ に等しくなります（「自由に仕事として取り出せるエネルギー」の語源）。
- **等温・定積条件（$dT = 0, dV = 0, dN = 0$）での平衡条件**：外部仕事 $d'W = 0$ より **$\Delta F \le 0$**（$F$ が最小となる状態で熱平衡に達する）。
- **等温・定圧条件（$dT = 0, dP = 0, dN = 0$）での平衡条件**：非膨張仕事がゼロのとき $d'W = -P\,dV$ より **$\Delta G \le 0$**（$G$ が最小となる状態で熱平衡に達する）。

---

## 3. マクスウェルの関係式・応答関数と相転移

### 3.1 マクスウェルの4つの関係式

粒子数 $N$ を一定（$dN = 0$）とした4つの熱力学ポテンシャル $U(S,V), H(S,P), F(T,V), G(T,P)$ はすべて状態量（完全微分）であるため、2階偏微分の順序交換可能性 $\dfrac{\partial^2 \Phi}{\partial X \partial Y} = \dfrac{\partial^2 \Phi}{\partial Y \partial X}$ を適用することで、直接測定が困難なエントロピー $S$ の偏微分を測定可能な $(P, V, T)$ の偏微分へと変換する**マクスウェルの関係式（Maxwell relations）**が導かれます。

| 母関数と全微分 | 2階偏微分の交換条件 | マクスウェルの関係式 |
| :--- | :--- | :--- |
| $dU = T\,dS - P\,dV$ | $\displaystyle \frac{\partial}{\partial V}\left(\frac{\partial U}{\partial S}\right)_V = \frac{\partial}{\partial S}\left(\frac{\partial U}{\partial V}\right)_S$ | $\displaystyle \left(\frac{\partial T}{\partial V}\right)_S = -\left(\frac{\partial P}{\partial S}\right)_V$ |
| $dH = T\,dS + V\,dP$ | $\displaystyle \frac{\partial}{\partial P}\left(\frac{\partial H}{\partial S}\right)_P = \frac{\partial}{\partial S}\left(\frac{\partial H}{\partial P}\right)_S$ | $\displaystyle \left(\frac{\partial T}{\partial P}\right)_S = \left(\frac{\partial V}{\partial S}\right)_P$ |
| $dF = -S\,dT - P\,dV$ | $\displaystyle \frac{\partial}{\partial V}\left(\frac{\partial F}{\partial T}\right)_V = \frac{\partial}{\partial T}\left(\frac{\partial F}{\partial V}\right)_T$ | $\displaystyle \left(\frac{\partial S}{\partial V}\right)_T = \left(\frac{\partial P}{\partial T}\right)_V$ |
| $dG = -S\,dT + V\,dP$ | $\displaystyle \frac{\partial}{\partial P}\left(\frac{\partial G}{\partial T}\right)_P = \frac{\partial}{\partial T}\left(\frac{\partial G}{\partial P}\right)_P$ | $\displaystyle -\left(\frac{\partial S}{\partial P}\right)_T = \left(\frac{\partial V}{\partial T}\right)_P$ |

### 3.2 エネルギー方程式とファン・デル・ワールス気体への応用

$dU = T\,dS - P\,dV$ を一定温度 $T$ のもとで $V$ で偏微分し、3番目のマクスウェルの関係式 $\left(\dfrac{\partial S}{\partial V}\right)_T = \left(\dfrac{\partial P}{\partial T}\right)_V$ を代入すると、状態方程式 $P = P(T, V)$ だけから内部エネルギーの体積依存性を決定できる普遍的な**熱力学的状態方程式（エネルギー方程式）**が得られます。

$$
\left(\frac{\partial U}{\partial V}\right)_T = T\left(\frac{\partial S}{\partial V}\right)_T - P = T\left(\frac{\partial P}{\partial T}\right)_V - P
$$

1. **理想気体（$PV = nRT$）の場合**：
   $\left(\dfrac{\partial P}{\partial T}\right)_V = \dfrac{nR}{V} = \dfrac{P}{T}$ より、$\left(\dfrac{\partial U}{\partial V}\right)_T = T\left(\dfrac{P}{T}\right) - P = 0$。したがって**理想気体の内部エネルギー $U(T)$ は体積 $V$ に依らず温度 $T$ のみの関数である**（ジュールの法則）ことが熱力学第2法則から厳密に証明されます。
2. **ファン・デル・ワールス（van der Waals）気体の場合**：
   分子間引力（定数 $a$）と分子の排除体積（定数 $b$）を取り入れた状態方程式 $\left(P + \dfrac{an^2}{V^2}\right)(V - nb) = nRT$ すなわち $P = \dfrac{nRT}{V - nb} - \dfrac{an^2}{V^2}$ をエネルギー方程式に代入すると、
   $$
   \left(\frac{\partial U}{\partial V}\right)_T = T\left(\frac{nR}{V - nb}\right) - \left(\frac{nRT}{V - nb} - \frac{an^2}{V^2}\right) = \frac{an^2}{V^2} \quad \Longrightarrow \quad U(T, V) = \int C_V(T)\,dT - \frac{an^2}{V}
   $$
   となり、分子間引力によるポテンシャルエネルギー項 $-\dfrac{an^2}{V}$ が自動的に導出されます。

### 3.3 応答関数と $C_P - C_V$ の一般公式・ジュール・トムソン効果

物質の巨視的な熱的・力学的応答を特徴づける代表的な**応答関数（Response functions）**は以下の通りです（熱力学的安定性条件＝凸性より、すべて正の値をとります）。

- **定積熱容量 $C_V$ と定圧熱容量 $C_P$**：
  $$
  C_V \equiv \left(\frac{d'Q}{dT}\right)_V = T\left(\frac{\partial S}{\partial T}\right)_V = \left(\frac{\partial U}{\partial T}\right)_V, \qquad C_P \equiv \left(\frac{d'Q}{dT}\right)_P = T\left(\frac{\partial S}{\partial T}\right)_P = \left(\frac{\partial H}{\partial T}\right)_P
  $$
- **定圧熱膨張率 $\alpha$ と等温圧縮率 $\kappa_T$**：
  $$
  \alpha \equiv \frac{1}{V}\left(\frac{\partial V}{\partial T}\right)_P, \qquad \kappa_T \equiv -\frac{1}{V}\left(\frac{\partial V}{\partial P}\right)_T
  $$

エントロピー $S(T, V)$ の全微分 $dS = \left(\dfrac{\partial S}{\partial T}\right)_V dT + \left(\dfrac{\partial S}{\partial V}\right)_T dV$ を一定圧力 $P$ のもとで $T$ で偏微分し、マクスウェルの関係式 $\left(\dfrac{\partial S}{\partial V}\right)_T = \left(\dfrac{\partial P}{\partial T}\right)_V$ および偏微分の巡回関係式 $\left(\dfrac{\partial P}{\partial T}\right)_V = -\left(\dfrac{\partial V}{\partial T}\right)_P \Big/ \left(\dfrac{\partial V}{\partial P}\right)_T = \dfrac{\alpha}{\kappa_T}$ を用いると、任意の物質に対して成り立つ **$C_P - C_V$ の一般公式（マイヤーの関係式の一般化）** が得られます。

$$
C_P - C_V = T\left(\frac{\partial P}{\partial T}\right)_V \left(\frac{\partial V}{\partial T}\right)_P = \frac{TV\alpha^2}{\kappa_T} \ge 0
$$

（理想気体では $\alpha = 1/T,\ \kappa_T = 1/P$ より $C_P - C_V = \dfrac{TV(1/T)^2}{1/P} = \dfrac{PV}{T} = nR$ が直ちに再現されます）。

また、多孔質栓を通して気体を断熱的に膨張させる**ジュール・トムソン膨張（等エンタルピー過程 $dH = 0$）**における温度変化率は、**ジュール・トムソン係数 $\mu_{\text{JT}}$** によって記述されます。

$$
\mu_{\text{JT}} \equiv \left(\frac{\partial T}{\partial P}\right)_H = -\frac{1}{C_P}\left(\frac{\partial H}{\partial P}\right)_T = \frac{1}{C_P}\left[ T\left(\frac{\partial V}{\partial T}\right)_P - V \right] = \frac{V}{C_P}(\alpha T - 1)
$$

### 3.4 相平衡とクラペイロン・クラウジウスの式

1成分系の2つの相（例：第I相＝液相、第II相＝気相）が温度 $T$・圧力 $P$ のもとで共存して熱平衡にあるとき、等温・定圧下でのギブス自由エネルギー最小条件 $\delta G = (\mu_{\text{I}} - \mu_{\text{II}})\,\delta N_{\text{I}} = 0$ より、両相の化学ポテンシャルは等しくなります：$\mu_{\text{I}}(T, P) = \mu_{\text{II}}(T, P)$。
共存曲線 $P = P(T)$ に沿って温度を $T \to T+dT$、圧力を $P \to P+dP$ だけ変化させたとき、ギブス・デュエムの式 $d\mu = -s\,dT + v\,dP$ より $-s_{\text{I}}\,dT + v_{\text{I}}\,dP = -s_{\text{II}}\,dT + v_{\text{II}}\,dP$ が成り立ち、1次相転移の潜熱 $L = T\Delta S = T(S_{\text{II}} - S_{\text{I}})$ と体積変化 $\Delta V = V_{\text{II}} - V_{\text{I}}$ を結ぶ**クラペイロン・クラウジウスの式（Clapeyron-Clausius equation）**が導かれます。

$$
\frac{dP}{dT} = \frac{\Delta S}{\Delta V} = \frac{L}{T\,\Delta V}
$$

---

## 4. 統計力学の基礎と3つの統計アンサンブル

統計力学では、ミクロなハミルトニアン $\hat{H}$（または古典位相空間上の $H(\boldsymbol{q}, \boldsymbol{p})$）の固有状態 $i$（エネルギー固有値 $E_i$）の確率分布 $P_i$ を求め、それと巨視的な熱力学ポテンシャルを対応させます。系が外界と何をやり取りするかに応じて、以下の**3つの統計アンサンブル（統計集団）**を使い分けます（熱力学的極限 $N \to \infty, V \to \infty, N/V = \text{const.}$ では3つのアンサンブルは完全に同値な熱力学を与えます）。

| アンサンブル名 | 物理的状況（固定する変数） | ミクロ状態 $i$ の出現確率 $P_i$ | 状態和・分配関数 | 対応する熱力学ポテンシャル（橋渡し公式） |
| :--- | :--- | :--- | :--- | :--- |
| **ミクロカノニカル**<br>(Microcanonical) | **孤立系**<br>$(E, V, N)$ 一定 | 等重率の原理：<br>$\displaystyle P_i = \frac{1}{W(E, V, N)}$ | ミクロ状態数：<br>$\displaystyle W(E, V, N) = \sum_{E \le E_i \le E+\delta E} 1$ | **エントロピー $S$**（ボルツマンの原理）：<br>$\displaystyle S(E, V, N) = k_B \ln W(E, V, N)$ |
| **カノニカル**<br>(Canonical) | **熱浴と接触した閉じた系**<br>$(T, V, N)$ 一定 | ボルツマン分布：<br>$\displaystyle P_i = \frac{e^{-\beta E_i}}{Z(T, V, N)}$ | **分配関数 $Z$**：<br>$\displaystyle Z(T, V, N) = \sum_i e^{-\beta E_i}$ | **ヘルムホルツ自由エネルギー $F$**：<br>$\displaystyle F(T, V, N) = -k_B T \ln Z(T, V, N)$ |
| **グランドカノニカル**<br>(Grand Canonical) | **熱浴・粒子浴と接触した開いた系**<br>$(T, V, \mu)$ 一定 | ギブス分布：<br>$\displaystyle P_{N,i} = \frac{e^{-\beta(E_{N,i} - \mu N)}}{\Xi(T, V, \mu)}$ | **大分配関数 $\Xi$**：<br>$\displaystyle \Xi(T, V, \mu) = \sum_{N=0}^\infty \sum_i e^{-\beta(E_{N,i} - \mu N)}$ | **グランドポテンシャル $\Omega$**：<br>$\displaystyle \Omega(T, V, \mu) = -k_B T \ln \Xi(T, V, \mu) = -PV$ |

（※ ここで $\beta \equiv \dfrac{1}{k_B T}$ は逆温度、$k_B = 1.380649 \times 10^{-23}\,\text{J/K}$ はボルツマン定数です。）

### 4.1 カノニカル分配関数 $Z$ からの熱力学量とエネルギー揺らぎの導出

カノニカル分布において、分配関数 $Z(\beta, V, N) = \sum_i e^{-\beta E_i(V,N)}$ が一つ求まれば、内部エネルギー $U = \langle E \rangle$、エントロピー $S$、圧力 $P$、および定積熱容量 $C_V$ はすべて $Z$ の微分操作だけで機械的に算出できます。

1. **内部エネルギー（平均エネルギー）$U$**：
   $$
   U = \langle E \rangle = \sum_i E_i \frac{e^{-\beta E_i}}{Z} = -\frac{1}{Z}\frac{\partial Z}{\partial \beta} = -\left(\frac{\partial \ln Z}{\partial \beta}\right)_{V,N} = k_B T^2 \left(\frac{\partial \ln Z}{\partial T}\right)_{V,N}
   $$
2. **ヘルムホルツ自由エネルギー $F$ とエントロピー $S$・圧力 $P$**：
   $$
   F = -k_B T \ln Z, \qquad S = -\left(\frac{\partial F}{\partial T}\right)_{V,N} = k_B \ln Z + \frac{U}{T}, \qquad P = -\left(\frac{\partial F}{\partial V}\right)_{T,N} = k_B T \left(\frac{\partial \ln Z}{\partial V}\right)_{T,N}
   $$
3. **エネルギーの分散（揺らぎ）と定積熱容量 $C_V$ の関係（揺動散逸関係）**：
   $U = -\dfrac{\partial \ln Z}{\partial \beta}$ をさらに $\beta$ で偏微分すると、エネルギーの分散 $\langle (\Delta E)^2 \rangle \equiv \langle (E - \langle E\rangle)^2 \rangle = \langle E^2 \rangle - \langle E \rangle^2$ が得られます。
   $$
   \langle (\Delta E)^2 \rangle = \frac{\partial^2 \ln Z}{\partial \beta^2} = -\frac{\partial U}{\partial \beta} = k_B T^2 \left(\frac{\partial U}{\partial T}\right)_{V,N} = k_B T^2 C_V \ge 0
   $$
   これにより、熱容量 $C_V$ は常に非負（$C_V \ge 0$）であり、相対的なエネルギー揺らぎは $\dfrac{\sqrt{\langle (\Delta E)^2 \rangle}}{\langle E \rangle} \propto \dfrac{1}{\sqrt{N}}$ となって、マクロな系（$N \sim 10^{23}$）では揺らぎが $10^{-11}$ オーダーに収束し、熱力学的決定論が回復することが証明されます。

### 4.2 グランドカノニカル大分配関数 $\Xi$ と粒子数揺らぎ

グランドカノニカル分布では、大分配関数 $\Xi(T, V, \mu) = \sum_{N=0}^\infty z^N Z_N(T, V)$（ここで $z \equiv e^{\beta\mu}$ は**フガシティー / 逃散能**）とグランドポテンシャル $\Omega = -k_B T \ln \Xi = -PV$ から、平均粒子数 $\langle N \rangle$ と粒子数の分散 $\langle (\Delta N)^2 \rangle$ が次のように得られます。

$$
\langle N \rangle = -\left(\frac{\partial \Omega}{\partial \mu}\right)_{T,V} = \frac{1}{\beta}\left(\frac{\partial \ln \Xi}{\partial \mu}\right)_{T,V}, \qquad \langle (\Delta N)^2 \rangle = \frac{1}{\beta^2}\frac{\partial^2 \ln \Xi}{\partial \mu^2} = k_B T \left(\frac{\partial \langle N \rangle}{\partial \mu}\right)_{T,V} = \frac{k_B T \langle N \rangle^2}{V} \kappa_T
$$

---

## 5. 古典統計力学と比熱のモデル（位相空間・等分配則・固体比熱）

### 5.1 古典位相空間積分と理想気体のザックール・テトロード方程式

3次元空間内の $N$ 個の同種単原子分子からなる古典理想気体では、ハミルトニアンは運動量ベクトル $\boldsymbol{p}_i = (p_{ix}, p_{iy}, p_{iz})$ のみに依存し、$H(\boldsymbol{q}, \boldsymbol{p}) = \sum_{i=1}^N \dfrac{\boldsymbol{p}_i^2}{2m}$ で与えられます。
古典統計力学における $N$ 粒子カノニカル分配関数 $Z_N$ は、1自由度あたりの位相空間体積素片をプランク定数 $h = 2\pi\hbar$ で割り、同種粒子の不可弁別性因子 $\dfrac{1}{N!}$（**ギブスのパラドックス**を解消するための補正因子）を乗じて計算します。

$$
Z_N(T, V) = \frac{1}{N!\,h^{3N}} \int_V d^3r_1 \cdots \int_V d^3r_N \int_{-\infty}^{\infty} d^3p_1 \cdots \int_{-\infty}^{\infty} d^3p_N \exp\left(-\beta \sum_{i=1}^N \frac{\boldsymbol{p}_i^2}{2m}\right)
$$

位置積分は $\left(\iiint_V d^3r\right)^N = V^N$、運動量積分はガウス積分公式 $\int_{-\infty}^\infty e^{-\frac{\beta p_x^2}{2m}}\,dp_x = \sqrt{\dfrac{2\pi m}{\beta}} = \sqrt{2\pi m k_B T}$ の $3N$ 乗となるため、**熱的ド・ブロイ波長 $\Lambda \equiv \dfrac{h}{\sqrt{2\pi m k_B T}}$** を用いると、分配関数は極めて簡潔に求まります。

$$
Z_N(T, V) = \frac{1}{N!}\left[ \frac{V}{h^3}(2\pi m k_B T)^{3/2} \right]^N = \frac{1}{N!}\left(\frac{V}{\Lambda^3}\right)^N
$$

スターリングの近似公式 $\ln N! \approx N\ln N - N$ を用いて自由エネルギー $F = -k_B T \ln Z_N$ を求めると、理想気体のすべての熱力学量が第一原理から完全に導出されます。

$$
F(T, V, N) = -N k_B T \left[ \ln\left(\frac{V}{N\Lambda^3}\right) + 1 \right]
$$

- **状態方程式**：$P = -\left(\dfrac{\partial F}{\partial V}\right)_{T,N} = \dfrac{N k_B T}{V} \iff PV = N k_B T$
- **内部エネルギーと熱容量**：$U = -\dfrac{\partial \ln Z_N}{\partial \beta} = \dfrac{3}{2}N k_B T, \quad C_V = \dfrac{3}{2}N k_B$
- **ザックール・テトロードの式（Sackur-Tetrode equation：理想気体のエントロピー）**：
  $$
  S(T, V, N) = -\left(\frac{\partial F}{\partial T}\right)_{V,N} = N k_B \left\{ \ln\left[ \frac{V}{N}\left(\frac{2\pi m k_B T}{h^2}\right)^{3/2} \right] + \frac{5}{2} \right\}
  $$
  $1/N!$ 因子のおかげで、体積 $V$ と粒子数 $N$ をともに2倍にしたとき $V/N$ は不変であり、エントロピー $S$ が正しく示量性（$S(T, 2V, 2N) = 2S(T, V, N)$）を満たすことが確認できます。

<div class="sim-embed">
  <div class="sim-embed-header">▼ マクスウェル・ボルツマン速度分布関数の温度依存性シミュレーション</div>
  <MaxwellBoltzmann />
</div>

### 5.2 エネルギー等分配の法則（Equipartition Theorem）

古典系のハミルトニアン $H(\boldsymbol{q}, \boldsymbol{p})$ の中に、ある正準変数 $x_k$（位置成分または運動量成分）の2次形式の項 $\varepsilon_k = c_k x_k^2$（$c_k > 0$）が独立に含まれているとき、その1自由度あたりの熱平均エネルギーは常に $\dfrac{1}{2}k_B T$ となります。

$$
\left\langle c_k x_k^2 \right\rangle = \frac{\int_{-\infty}^\infty c_k x_k^2 e^{-\beta c_k x_k^2}\,dx_k}{\int_{-\infty}^\infty e^{-\beta c_k x_k^2}\,dx_k} = -\frac{\partial}{\partial \beta}\ln\left(\sqrt{\frac{\pi}{\beta c_k}}\right) = \frac{1}{2\beta} = \frac{1}{2}k_B T
$$

- **2原子分子気体（剛体回転子）**：並進3自由度 + 回転2自由度 $= 5$ 自由度 $\implies U = \dfrac{5}{2}N k_B T,\ C_V = \dfrac{5}{2}N k_B$。
- **古典結晶格子（デュロン・プティの法則）**：$N$ 個の原子が3次元調和振動子（運動エネルギー $3$ 自由度 + 弾性ポテンシャルエネルギー $3$ 自由度 $= 6$ 自由度）として振動 $\implies U = 3N k_B T,\ C_V = 3N k_B = 3nR$。

### 5.3 2準位系（ショットキー比熱）と固体の量子比熱（アインシュタイン・デバイモデル）

古典的なエネルギー等分配則は、低温（$k_B T \ll \Delta E$）において熱力学第3法則（$T \to 0$ で $C_V \to 0$）と矛盾します。これはエネルギー準位の離散性（量子効果）を取り入れることで完全に解決されます。

1. **2準位系とショットキー比熱（Schottky anomaly）**
   エネルギー $0$ の基底状態とエネルギー $\varepsilon$ の励起状態を持つ独立な $N$ 個の局在スピン・不純物系では、1粒子分配関数は $z_1 = 1 + e^{-\beta\varepsilon}$ であり、内部エネルギー $U$ と熱容量 $C_V$ は次式となります。
   $$
   U = N\frac{\varepsilon e^{-\beta\varepsilon}}{1 + e^{-\beta\varepsilon}} = \frac{N\varepsilon}{e^{\beta\varepsilon} + 1}, \qquad C_V = N k_B \left(\frac{\varepsilon}{k_B T}\right)^2 \frac{e^{\beta\varepsilon}}{(e^{\beta\varepsilon} + 1)^2} = \frac{N k_B (\beta\varepsilon/2)^2}{\cosh^2(\beta\varepsilon/2)}
   $$
   $C_V$ は低温（$T\to 0$）でも高温（$T\to\infty$）でも $0$ に漸近し、$k_B T \approx 0.42\,\varepsilon$ 付近で鋭いピーク（ショットキー異常）を示します。
2. **アインシュタインモデルとデバイモデル（固体の格子比熱）**
   - **アインシュタインモデル**：固体中の $3N$ 個の調和振動子がすべて同じ角振動数 $\omega_E$（アインシュタイン温度 $\Theta_E \equiv \hbar\omega_E/k_B$）で振動すると仮定すると、
     $$
     U = 3N\left(\frac{1}{2}\hbar\omega_E + \frac{\hbar\omega_E}{e^{\hbar\omega_E/k_B T} - 1}\right), \qquad C_V = 3N k_B \left(\frac{\Theta_E}{T}\right)^2 \frac{e^{\Theta_E/T}}{(e^{\Theta_E/T} - 1)^2}
     $$
   - **デバイモデル**：結晶格子の弾性波（音響フォノン、状態密度 $D(\omega) \propto \omega^2$）をデバイ振動数 $\omega_D$（デバイ温度 $\Theta_D \equiv \hbar\omega_D/k_B$）まで積分すると、高温（$T \gg \Theta_D$）ではデュロン・プティ則 $C_V \to 3N k_B$ を再現し、極低温（$T \ll \Theta_D$）では実験と完全に一致する **デバイの $T^3$ 則** が導かれます。
     $$
     C_V(T) \simeq \frac{12\pi^4}{5} N k_B \left(\frac{T}{\Theta_D}\right)^3 \qquad (T \ll \Theta_D)
     $$

---

## 6. 量子統計力学（フェルミ・ディラック統計とボース・アインシュタイン統計）

量子力学において、同種粒子は原理的に区別できず（不可弁別性）、粒子のスピン角運動量に応じて1粒子状態 $r$（エネルギー $\varepsilon_r$）を占める粒子数（占有数 $n_r$）に根本的な制約が課されます。

- **フェルミ粒子（Fermions：電子・陽子・中性子など半整数スピン粒子）**：パウリの排他律により、1つの量子状態には最大1個しか入れない（**$n_r \in \{0, 1\}$**）。
- **ボース粒子（Bosons：光子・フォノン・${}^4\text{He}$ 原子など整数スピン粒子）**：1つの量子状態に何個でも入ることができる（**$n_r \in \{0, 1, 2, \dots\}$**）。

### 6.1 フェルミ分布関数とボース分布関数の導出

グランドカノニカル分布において、全エネルギー $E = \sum_r n_r \varepsilon_r$、全粒子数 $N = \sum_r n_r$ を大分配関数 $\Xi = \sum_{\{n_r\}} \exp\left[-\beta\sum_r n_r(\varepsilon_r - \mu)\right] = \prod_r \left(\sum_{n_r} e^{-\beta(\varepsilon_r - \mu)n_r}\right)$ に代入すると、1粒子状態 $r$ ごとに独立な和へと因数分解されます。

1. **フェルミ・ディラック（Fermi-Dirac）統計（$n_r = 0, 1$）**：
   $$
   \Xi_{\text{FD}} = \prod_r \left(1 + e^{-\beta(\varepsilon_r - \mu)}\right) \implies \Omega_{\text{FD}} = -k_B T \sum_r \ln\left(1 + e^{-\beta(\varepsilon_r - \mu)}\right)
   $$
   1粒子状態 $r$ の平均占有数 $f_{\text{FD}}(\varepsilon_r) \equiv \langle n_r \rangle = -\dfrac{1}{\beta}\dfrac{\partial \ln \Xi_{\text{FD}}}{\partial \varepsilon_r}$ は次式となります（**フェルミ分布関数**）。
   $$
   f_{\text{FD}}(\varepsilon) = \frac{1}{e^{\beta(\varepsilon - \mu)} + 1}
   $$
2. **ボース・アインシュタイン（Bose-Einstein）統計（$n_r = 0, 1, 2, \dots$、収束条件 $\mu < \varepsilon_0$）**：
   無限等比級数の和 $\sum_{n_r=0}^\infty \left(e^{-\beta(\varepsilon_r - \mu)}\right)^{n_r} = \dfrac{1}{1 - e^{-\beta(\varepsilon_r - \mu)}}$ より、
   $$
   \Xi_{\text{BE}} = \prod_r \frac{1}{1 - e^{-\beta(\varepsilon_r - \mu)}} \implies \Omega_{\text{BE}} = k_B T \sum_r \ln\left(1 - e^{-\beta(\varepsilon_r - \mu)}\right)
   $$
   平均占有数 $f_{\text{BE}}(\varepsilon_r) \equiv \langle n_r \rangle$ は次式となります（**ボース分布関数**）。
   $$
   f_{\text{BE}}(\varepsilon) = \frac{1}{e^{\beta(\varepsilon - \mu)} - 1}
   $$

高温・低密度極限（$e^{\beta(\varepsilon - \mu)} \gg 1$）では、$\pm 1$ が無視できて両者とも古典的な**マクスウェル・ボルツマン分布 $f_{\text{MB}}(\varepsilon) = e^{-\beta(\varepsilon - \mu)}$** に一致します。

### 6.2 縮退フェルミ気体（金属中の自由電子とフェルミエネルギー）

絶対零度（$T \to 0,\ \beta \to \infty$）におけるフェルミ分布関数は、化学ポテンシャル $\mu(0) \equiv \varepsilon_F$（**フェルミエネルギー**）を境とする階段関数 $f_{\text{FD}}(\varepsilon) = \Theta(\varepsilon_F - \varepsilon)$ となります。
体積 $V$ 中のスピン $1/2$（縮退度 $g_s = 2$）の自由フェルミ気体（$\varepsilon_{\boldsymbol{k}} = \dfrac{\hbar^2 \boldsymbol{k}^2}{2m}$）では、波数空間における状態密度の積分より、フェルミ波数 $k_F$、フェルミエネルギー $\varepsilon_F$、基底状態エネルギー $E_0$、および低温（$k_B T \ll \varepsilon_F$）での電子比熱 $C_V$ が次のように求まります。

$$
k_F = \left(3\pi^2 \frac{N}{V}\right)^{1/3}, \qquad \varepsilon_F = \frac{\hbar^2}{2m}\left(3\pi^2 \frac{N}{V}\right)^{2/3}, \qquad E_0 = \frac{3}{5}N\varepsilon_F, \qquad C_{\text{el}} \simeq \frac{\pi^2}{2}N k_B \left(\frac{k_B T}{\varepsilon_F}\right) \propto T
$$

フェルミ面近傍の幅 $\sim k_B T$ の電子しか熱励起できないため、金属の電子比熱は温度 $T$ に比例して極めて小さくなります（ゾンマーフェルト展開）。

### 6.3 ボース・アインシュタイン凝縮（BEC）とプランクの黒体輻射公式

- **ボース・アインシュタイン凝縮（Bose-Einstein Condensation）**：粒子数が保存する3次元自由ボース気体では、温度を臨界温度 $T_c = \dfrac{2\pi\hbar^2}{m k_B}\left(\dfrac{N}{\zeta(3/2)V}\right)^{2/3}$（$\zeta(3/2) \approx 2.612$）以下に下げると、励起状態（$\varepsilon > 0$）が収容できる最大粒子数を超えた分の巨視的個数の粒子 $N_0 = N\left[1 - \left(\dfrac{T}{T_c}\right)^{3/2}\right]$ が単一の最低エネルギー基底状態（$\boldsymbol{k} = \boldsymbol{0}$）へ雪崩を打って落ち込み、巨視的量子状態を形成します。
- **光子気体とプランクの黒体輻射公式**：空洞内の電磁波（光子：ボース粒子、粒子数非保存のため化学ポテンシャル $\mu = 0$、偏光自由度 $2$、エネルギー $\varepsilon_{\boldsymbol{k}} = \hbar\omega = \hbar c|\boldsymbol{k}|$）に対してボース分布を適用すると、単位体積・単位角振動数あたりの分光エネルギー密度 $u(\omega, T)$ と全エネルギー密度 $u(T)$（**シュテファン・ボルツマンの法則**）が導出されます。
  $$
  u(\omega, T) = \frac{\hbar \omega^3}{\pi^2 c^3} \frac{1}{e^{\hbar\omega / k_B T} - 1}, \qquad u(T) = \int_0^\infty u(\omega, T)\,d\omega = \frac{\pi^2 k_B^4}{15 \hbar^3 c^3} T^4
  $$

---

## 7. 理解度チェック＆演習問題に挑む

熱力学ポテンシャルとマクスウェルの関係式、ファン・デル・ワールス気体、カノニカル分配関数、2準位ショットキー比熱、量子統計の計算問題で実力を試しましょう。

<div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">
  <a href="/university/problems/thermodynamics" style="display:inline-block; background:#1d4ed8; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700;">
    📝 熱・統計力学の演習問題一覧へ進む →
  </a>
  <a href="/university/quantum/index" style="display:inline-block; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700;">
    次の単元：量子力学へ →
  </a>
</div>
