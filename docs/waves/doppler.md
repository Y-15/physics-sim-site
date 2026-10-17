---
title: ドップラー効果の完全攻略（音源移動・観測者移動・斜め・反射板）
description: 高校物理の波動最頻出テーマ。音源移動による波長圧縮・観測者移動による相対速度・風・反射板・斜めドップラー・超音速衝撃波まで、公式の導出原理と解法パターンを完全網羅。
---

# ドップラー効果の完全攻略（音源移動・観測者移動・斜め・反射板）

<div class="lead">
救急車がサイレンを鳴らしながら目の前を猛スピードで通り過ぎるとき、「ピ〜ポ〜（高音）」から「ピ〜ポ〜（低音）」へと急激に音の高さが下がります。<br>
この現象が<strong>ドップラー効果（Doppler Effect）</strong>です。<br>
単なる公式の暗記（<i>f</i>' = (<i>V</i> - <i>v</i><sub><i>o</i></sub> / <i>V</i> - <i>v</i><sub><i>s</i></sub>) <i>f</i><sub>0</sub>）では、風が吹いたり、反射板があったり、斜めに動いたりした瞬間に符号ミスで全滅します。<br>
本ページでは、「なぜ波長が縮むのか」「なぜ相対速度で考えるのか」という物理の本質から、入試のあらゆる応用パターンまでを完全攻略します。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **救急車・新幹線の通過音**: 近づいてくるときは高く聞こえ、遠ざかると低く聞こえる。
* **スピード違反のスピード測定器（レーダー）**: マイクロ波を走る車に当て、跳ね返ってきた電波の周波数変化（光のドップラー効果）から瞬時に時速を算出する。
* **宇宙の膨張（赤方偏移）**: 遠方の銀河から届く光のスペクトルが長波長側（赤い側）にずれていることから、ハッブルは宇宙が膨張していることを発見した。

### 学習の到達目標
1. **音源移動時の波長短縮の導出**: 1周期 $T$ の間に音源が進む距離 $v_s T$ を引き算し、見かけの波長 $\lambda' = \frac{V - v_s}{f_0}$ を自力で導出できる。
2. **観測者移動時の相対速度の理解**: 観測者から見た音波の相対速さ $V' = V - v_o$ から、受聴周波数を瞬時に立式できる。
3. **反射板・風・斜め移動の3大入試トラップを突破**: 壁を「観測者 $\to$ 新たな音源」の2ステップで処理し、斜め方向は視線成分 $v_s \cos\theta$ を正しく射影できる。

---

## 🧪 インタラクティブ実験室

音源速度 $v_s$ や観測者速度 $v_o$ を動かして、音波の円形波面がどのように圧縮・伸長されるか観察してみましょう。

<DopplerSim />

---

## 2. ドップラー効果の導出原理（完全ステップ）

音速を $V\,[\text{m/s}]$、音源の固有振動数を $f_0\,[\text{Hz}]$、固有周期を $T_0 = \frac{1}{f_0}\,[\text{s}]$ とします。

### (1) 音源が速さ $v_s$ で前進する場合（★波長が変化する！）

音源が静止していれば、1波の長さ（固有波長）は $\lambda_0 = \frac{V}{f_0}$ です。  
しかし、音源が前進しながら音波を送り出すと、**1周期 $T_0$ の間に音源自身が前へ $v_s T_0$ だけ進む**ため、前方に送り出される波面の間隔がギュッと押し縮められます。

<div class="vector-graph-card">
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-dop-s" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
    </marker>
    <marker id="arr-dop-v" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
  </defs>
  <!-- 中心軸 -->
  <line x1="30" y1="120" x2="510" y2="120" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- 時刻 0 の音源位置 (x = 120) -->
  <circle cx="120" cy="120" r="5" fill="#64748b"/>
  <text x="120" y="105" fill="#94a3b8" font-size="11" text-anchor="middle">時刻 0 の音源</text>
  <!-- 1周期 T0 後の音波先端 (x = 440: 距離 V*T0) -->
  <circle cx="440" cy="120" r="4" fill="#38bdf8"/>
  <text x="440" y="105" fill="#38bdf8" font-size="11" text-anchor="middle">音波の先頭</text>
  <line x1="120" y1="140" x2="440" y2="140" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="120" y1="135" x2="120" y2="145" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="440" y1="135" x2="440" y2="145" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="200" y="146" width="160" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="280" y="160" fill="#38bdf8" font-size="11" text-anchor="middle">音波が進んだ全距離: V T₀</text>
  <!-- 1周期 T0 後の音源位置 (x = 220: 距離 vs*T0) -->
  <line x1="120" y1="70" x2="220" y2="70" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-dop-s)"/>
  <circle cx="220" cy="120" r="8" fill="#fbbf24"/>
  <rect x="150" y="42" width="140" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="220" y="56" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">音源の前進: v_s T₀</text>
  <!-- 圧縮された前方波長 λ' (x = 220 から 440) -->
  <line x1="220" y1="185" x2="440" y2="185" stroke="#f43f5e" stroke-width="2.5"/>
  <line x1="220" y1="178" x2="220" y2="192" stroke="#f43f5e" stroke-width="2"/>
  <line x1="440" y1="178" x2="440" y2="192" stroke="#f43f5e" stroke-width="2"/>
  <rect x="205" y="196" width="250" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="330" y="211" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">圧縮された前方波長 λ' ＝ (V − v_s) T₀</text>
</svg>
<div class="graph-caption">図: 音源が動くときの波長短縮の幾何的導出（音波先頭 <i>VT</i>₀ から音源の前進距離 <i>v_s T</i>₀ を引いた残り幅に1波が収まる）</div>
</div>

* **前方波長 $\lambda'$**:
  $$\lambda' = V T_0 - v_s T_0 = (V - v_s) T_0 = \frac{V - v_s}{f_0}$$
* **静止した観測者が前方で聴く周波数 $f'$**:
  空間を伝わる音速は媒質（空気）で決まり $V$ のまま不変なので、基本式 $V = f' \lambda'$ より：
  $$f' = \frac{V}{\lambda'} = \frac{V}{V - v_s} f_0$$

::: tip 音源後方の波長
音源の後方では、音源が遠ざかるため波長が伸びます：
$$\lambda'' = \frac{V + v_s}{f_0} \implies f'' = \frac{V}{V + v_s} f_0$$
分母が大きくなるため、音は低くなります。
:::

---

### (2) 観測者が速さ $v_o$ で動く場合（★波長は変わらない！相対速度が変わる！）

音源が静止しているとき、空間の波長は本来の $\lambda_0 = \frac{V}{f_0}$ のまま変化しません。  
しかし、観測者が音波から「逃げる向き（同方向）」に速さ $v_o$ で走ると、観測者から見た音波の**相対速度**は：

$$V' = V - v_o$$

と小さくなります。1秒間に観測者の耳に飛び込んでくる波の個数（受聴周波数 $f'$）は：

$$f' = \frac{V'}{\lambda_0} = \frac{V - v_o}{\frac{V}{f_0}} = \frac{V - v_o}{V} f_0$$

* 観測者が音源に向かって突進する場合（接近）：相対速度が $V + v_o$ となり、$f' = \frac{V + v_o}{V} f_0$（高音）。

---

### (3) 音源と観測者が両方動く総合公式

(1)と(2)を合体させます。空間の波長は音源が決めた $\lambda' = \frac{V - v_s}{f_0}$、観測者に対する相対音速は $V' = V - v_o$ なので：

$$
\boxed{f' = \frac{V - v_o}{V - v_s} f_0}
$$

::: important 符号の絶対ルール（音源 $\to$ 観測者を「正」にとる！）
分母と分子のプラス・マイナスで迷ったら、**「音源から観測者に向かう向き（音波が飛ぶ向き）」を一方向の正（プラス）**と定めます。
* 音源が観測者に近づく $\to$ 向きは正なので $v_s > 0$（分母は $V - v_s$）
* 観測者が音源から遠ざかる $\to$ 向きは正なので $v_o > 0$（分子は $V - v_o$）
* 逆向きに動く場合は符号を負（マイナス）にします。
:::

---

## 3. 入試の3大頻出応用パターン

### パターン 1：風が吹いている場合
速さ $w$ の追い風が吹いている場合、**音波そのものが風に乗って流されるため、地面に対する音速が変化**します。
* 追い風（音波と同じ向き）: $V \to V + w$
* 向かい風（音波と逆向き）: $V \to V - w$

公式中のすべての音速 $V$ を置き換えるだけで解けます：
$$f' = \frac{(V + w) - v_o}{(V + w) - v_s} f_0$$

---

### パターン 2：反射板（壁）がある場合（2段階法）
動く音源から出た音が壁で跳ね返り、音源のドライバーや後方の観測者に聞こえる問題は、**必ず2段階に分解**して解きます。

1. **Step 1（壁が音を受聴する）**:
   壁を「静止した観測者（$v_{\text{wall}} = 0$）」とみなして、壁が受ける周波数 $f_{\text{wall}}$ を計算する。
   $$f_{\text{wall}} = \frac{V}{V - v_s} f_0$$
2. **Step 2（壁が音を再放射する）**:
   壁を「周波数 $f_{\text{wall}}$ の音を出す静止した音源」とみなして、観測者が受ける周波数を計算する。

---

### パターン 3：斜めドップラー（平面運動）
音源が直線上を移動し、直線から離れた地点にある観測者が音を聞く場合：

<div class="vector-graph-card">
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-diag" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="arr-vs-diag" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
    </marker>
  </defs>
  <!-- 軌道直線 (水平: y = 50) -->
  <line x1="40" y1="50" x2="500" y2="50" stroke="#64748b" stroke-width="2"/>
  <text x="505" y="54" fill="#94a3b8" font-size="12">音源の軌道</text>
  <!-- 音源 S (x = 180, y = 50) -->
  <circle cx="180" cy="50" r="7" fill="#fbbf24"/>
  <rect x="150" y="22" width="60" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="180" y="35" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">音源 S</text>
  <!-- 音源の水平速度 vs (長さ 80) -->
  <line x1="180" y1="50" x2="260" y2="50" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#arr-vs-diag)"/>
  <rect x="225" y="22" width="65" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="257" y="35" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">速度 v_s</text>
  <!-- 観測者 O (x = 340, y = 150) -->
  <circle cx="340" cy="150" r="7" fill="#22c55e"/>
  <rect x="355" y="140" width="75" height="20" rx="3" fill="#0f172a" stroke="#22c55e" stroke-width="1"/>
  <text x="392" y="154" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">観測者 O</text>
  <!-- 視線方向 (S と O を結ぶ線: 角度 θ) -->
  <line x1="180" y1="50" x2="340" y2="150" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4"/>
  <rect x="245" y="112" width="150" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="320" y="126" fill="#38bdf8" font-size="10" text-anchor="middle">視線方向 (音波の飛ぶ向き)</text>
  <!-- 視線成分 vs cos θ (投影ベクトル) -->
  <line x1="180" y1="50" x2="248" y2="92" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-diag)"/>
  <rect x="180" y="85" width="80" height="20" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="220" y="99" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">v_s cos θ</text>
  <!-- 角度 θ の弧 -->
  <path d="M 220,50 A 40,40 0 0,1 214,71" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="228" y="65" fill="#fbbf24" font-size="12" font-style="italic">θ</text>
</svg>
<div class="graph-caption">図: 斜めドップラー効果の分解（音源速度 <i>v_s</i> を「音波が観測者へ向かう視線方向」に正射影した成分 <i>v_s</i> cos <i>θ</i> を用いる）</div>
</div>

ドップラー効果を引き起こすのは、**「音源と観測者を結ぶ直線（視線方向）に沿った速度成分」だけ**です！
したがって、視線と進行方向のなす角を $\theta$ とすると：

$$f' = \frac{V}{V - v_s \cos\theta} f_0$$

* 音源が無限遠から近づくとき（$\theta \to 0$）：$\cos\theta \to 1$ なので $f' \to \frac{V}{V - v_s} f_0$
* 観測者の真横を通過する瞬間（$\theta = 90^\circ$）：$\cos 90^\circ = 0$ なので **$f' = f_0$（固有振動数と完全一致！）**
* 遠ざかっていくとき（$\theta > 90^\circ$）：$\cos\theta < 0$ となり低音へ遷移。

---

## 4. 例題での使い方（完全オリジナル）

### 【例題 1】壁に向かって走る自動車と「うなり」

::: info 📖 【問題設定】
振動数 f₀ = 680 Hz のクラクションを鳴らしながら、自動車が速さ v_s = 20 m/s で
平らなコンクリート壁に向かって一直線に直進している。音速を V = 340 m/s とする。

(1) 壁が受ける音の振動数 f_w [Hz] を求めよ。
(2) 壁で反射され、自動車のドライバー自身が聞く反射音の振動数 f_d [Hz] を求めよ。
(3) ドライバーには、直接音と反射音が干渉して「うなり」が聞こえる。
    1秒あたりのうなりの回数 N [回/s] を求めよ。
:::

#### 【解法ステップ】

**Step 1: (1) 壁が受ける振動数を求める**  
壁は静止している（$v_o = 0$）ので、前進する音源のドップラー効果より：
$$f_w = \frac{V}{V - v_s} f_0 = \frac{340}{340 - 20} \times 680 = \frac{340}{320} \times 680 = 1.0625 \times 680 = 722.5\,\text{Hz}$$

**Step 2: (2) ドライバー自身が受聴する振動数を求める**  
壁が周波数 $f_w = 722.5\,\text{Hz}$ の音を発する静止音源となり、ドライバー（観測者）が速さ $v_s = 20\,\text{m/s}$ で壁（音源）に向かって突進するため：
$$f_d = \frac{V + v_s}{V} f_w = \frac{340 + 20}{340} \times 722.5 = \frac{360}{340} \times \left( \frac{340}{320} \times 680 \right) = \frac{360}{320} \times 680 = 765\,\text{Hz}$$

**Step 3: (3) 1秒あたりのうなりの回数 $N$ を求める**  
ドライバーは「自車のクラクションの直接音 $f_0 = 680\,\text{Hz}$」と「壁からの反射音 $f_d = 765\,\text{Hz}$」を同時に聞くため、うなり公式 $N = |f_1 - f_2|$ より：
$$N = |f_d - f_0| = 765 - 680 = 85\,\text{回/s}$$

**答**: (1) $722.5\,\text{Hz}$、(2) $765\,\text{Hz}$、(3) $85\,\text{回/s}$

---

## 5. 要点まとめ

::: tip 📌 ドップラー効果のマスター公式
* **基本総合公式**:
  $$f' = \frac{V - v_o}{V - v_s} f_0$$
  （※音源 $\to$ 観測者の向きを正にとる）

* **波長の変化（音源が動くときのみ発生！）**:
  $$\lambda' = \frac{V - v_s}{f_0}$$

* **風があるとき**:
  音速 $V$ を地面に対する音速 $V \pm w$ に全置換する。

* **斜めドップラー**:
  視線方向成分 $v_s \cos\theta$ を用いて $f' = \frac{V}{V - v_s \cos\theta} f_0$。
:::

<!--@include: ../parts/notice.md-->
