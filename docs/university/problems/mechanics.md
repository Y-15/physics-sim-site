# 力学・解析力学 演習問題（全6問）

<div class="level-badge">
  対象：大学1〜2年次・大学院入試対策 ／ 範囲：ニュートン力学（微分方程式）・中心力場・回転座標系・剛体・ラグランジュ＆ハミルトン解析力学
</div>

ニュートンの運動方程式 $m\ddot{\boldsymbol{r}} = \boldsymbol{F}(\boldsymbol{r}, \dot{\boldsymbol{r}}, t)$ を微分方程式として解く手法から、極座標基底ベクトル $\boldsymbol{e}_r, \boldsymbol{e}_\theta$ によるケプラー問題の完全導出、回転座標系におけるコリオリ力 $-2m\boldsymbol{\omega}\times\boldsymbol{v}'$、そしてオイラー・ラグランジュ方程式とハミルトン正準方程式・ポアソン括弧までを網羅した全6問です。

## 解答のポイントと必須公式チェック

- **2次元極座標 $(r, \theta)$ の速度・加速度ベクトル**：
  $$\boldsymbol{v} = \dot{r}\boldsymbol{e}_r + r\dot{\theta}\boldsymbol{e}_\theta, \qquad \boldsymbol{a} = (\ddot{r} - r\dot{\theta}^2)\boldsymbol{e}_r + \frac{1}{r}\frac{d}{dt}(r^2\dot{\theta})\boldsymbol{e}_\theta$$
- **回転座標系（角速度 $\boldsymbol{\omega}$）の運動方程式**：
  $$m\ddot{\boldsymbol{r}}' = \boldsymbol{F} - 2m\boldsymbol{\omega}\times\dot{\boldsymbol{r}}' - m\boldsymbol{\omega}\times(\boldsymbol{\omega}\times\boldsymbol{r}') - m\dot{\boldsymbol{\omega}}\times\boldsymbol{r}'$$
- **オイラー・ラグランジュ方程式とハミルトン正準方程式**：
  $$\frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_i}\right) - \frac{\partial L}{\partial q_i} = 0, \qquad \dot{q}_i = \frac{\partial H}{\partial p_i}, \qquad \dot{p}_i = -\frac{\partial H}{\partial q_i}$$

---

<ClientOnly>
  <UniversityProblemViewer category="mechanics" />
</ClientOnly>

<div class="univ-nav-group">
  <a href="/university/mechanics/index" class="univ-btn-secondary">
    ← 力学・解析力学の講義ページに戻る
  </a>
  <a href="/university/problems/electromagnetism" class="univ-btn-primary">
    次の演習：電磁気学（全6問）へ →
  </a>
</div>
