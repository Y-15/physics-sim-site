<template>
  <div class="vector-diagram-card">
    <svg viewBox="0 0 520 270" class="academic-svg" aria-label="アトウッドの器械の力の図解" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 矢印マーカー（赤：重力） -->
        <marker id="atwood-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
        <!-- 矢印マーカー（青/シアン：張力） -->
        <marker id="atwood-arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
        </marker>
        <!-- 矢印マーカー（アンバー：加速度） -->
        <marker id="atwood-arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
        </marker>
      </defs>

      <!-- 天井（固定梁） -->
      <line x1="180" y1="20" x2="340" y2="20" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      <g stroke="#94a3b8" stroke-width="1.5">
        <line x1="195" y1="20" x2="185" y2="10" />
        <line x1="220" y1="20" x2="210" y2="10" />
        <line x1="245" y1="20" x2="235" y2="10" />
        <line x1="270" y1="20" x2="260" y2="10" />
        <line x1="295" y1="20" x2="285" y2="10" />
        <line x1="320" y1="20" x2="310" y2="10" />
      </g>

      <!-- 滑車支持金具 -->
      <line x1="260" y1="20" x2="260" y2="52" stroke="#64748b" stroke-width="4" stroke-linecap="round" />

      <!-- 滑車外輪＆内輪 -->
      <circle cx="260" cy="65" r="26" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
      <circle cx="260" cy="65" r="18" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="3 3" />
      <circle cx="260" cy="65" r="4.5" fill="#38bdf8" />
      <text x="260" y="44" fill="#64748b" font-size="11" font-weight="bold" text-anchor="middle">定滑車</text>

      <!-- 糸（滑車に接して垂れ下がる） -->
      <path d="M 234 65 L 234 130" stroke="#94a3b8" stroke-width="2.5" />
      <path d="M 286 65 L 286 148" stroke="#94a3b8" stroke-width="2.5" />

      <!-- ================= 物体 A (大, M) ================= -->
      <g>
        <rect x="212" y="130" width="44" height="38" rx="5" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" stroke-width="2" />
        <text x="234" y="154" fill="#ef4444" font-size="13" font-weight="bold" text-anchor="middle">A (M)</text>
        
        <!-- 加速度 a 向き（下向き） -->
        <line x1="175" y1="135" x2="175" y2="175" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,3" marker-end="url(#atwood-arrow-amber)" />
        <text x="160" y="158" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="end">a (下降)</text>

        <!-- 張力 T（上向き） -->
        <line x1="222" y1="130" x2="222" y2="92" stroke="#0284c7" stroke-width="2.5" marker-end="url(#atwood-arrow-blue)" />
        <text x="210" y="106" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="end">T</text>

        <!-- 重力 Mg（下向き・張力より大きい） -->
        <line x1="234" y1="168" x2="234" y2="226" stroke="#ef4444" stroke-width="3" marker-end="url(#atwood-arrow-red)" />
        <text x="234" y="244" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">Mg (重力)</text>

        <!-- 運動方程式ヒント -->
        <text x="175" y="210" fill="#64748b" font-size="10" text-anchor="middle">Ma = Mg - T</text>
      </g>

      <!-- ================= 物体 B (小, m) ================= -->
      <g>
        <rect x="269" y="148" width="34" height="30" rx="4" fill="rgba(2, 132, 199, 0.12)" stroke="#0284c7" stroke-width="2" />
        <text x="286" y="168" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle">B (m)</text>

        <!-- 加速度 a 向き（上向き） -->
        <line x1="345" y1="172" x2="345" y2="132" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,3" marker-end="url(#atwood-arrow-amber)" />
        <text x="358" y="154" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="start">a (上昇)</text>

        <!-- 張力 T（上向き・重力より大きい） -->
        <line x1="298" y1="148" x2="298" y2="110" stroke="#0284c7" stroke-width="2.5" marker-end="url(#atwood-arrow-blue)" />
        <text x="310" y="126" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="start">T</text>

        <!-- 重力 mg（下向き・張力より小さい） -->
        <line x1="286" y1="178" x2="286" y2="214" stroke="#ef4444" stroke-width="2.5" marker-end="url(#atwood-arrow-red)" />
        <text x="286" y="232" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">mg</text>

        <!-- 運動方程式ヒント -->
        <text x="345" y="210" fill="#64748b" font-size="10" text-anchor="middle">ma = T - mg</text>
      </g>

      <!-- 凡例 (Legend) -->
      <g transform="translate(10, 248)">
        <line x1="5" y1="5" x2="25" y2="5" stroke="#ef4444" stroke-width="2.5" marker-end="url(#atwood-arrow-red)" />
        <text x="32" y="9" fill="#64748b" font-size="10">重力 (Mg, mg)</text>

        <line x1="125" y1="5" x2="145" y2="5" stroke="#0284c7" stroke-width="2.5" marker-end="url(#atwood-arrow-blue)" />
        <text x="152" y="9" fill="#64748b" font-size="10">糸の張力 (T: 左右等しい)</text>

        <line x1="285" y1="5" x2="305" y2="5" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#atwood-arrow-amber)" />
        <text x="312" y="9" fill="#64748b" font-size="10">加速度 (a: 大きさ等しい)</text>
      </g>
    </svg>
    <div class="diagram-caption">図: アトウッドの器械における各物体の力のつり合いと加速度の向き</div>
  </div>
</template>

<script setup>
// AtwoodDiagram: 鉛直アトウッドの器械の力の図解コンポーネント
</script>

<style scoped>
.vector-diagram-card {
  margin: 1.5rem auto;
  padding: 1.25rem 1rem;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  max-width: 600px;
}

.academic-svg {
  width: 100%;
  max-width: 520px;
  height: auto;
  display: block;
}

.diagram-caption {
  margin-top: 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
