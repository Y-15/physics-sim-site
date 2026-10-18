<script setup>
import DefaultTheme from 'vitepress/theme'
import PhysicsIntro from '../components/PhysicsIntro.vue'
import AdUnit from '../components/AdUnit.vue'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()
</script>

<template>
  <Layout>
    <template #layout-top>
      <PhysicsIntro v-if="frontmatter.layout === 'home'" />
    </template>

    <!-- 記事末尾の広告（各解説・シミュレータ・演習問題の直下） -->
    <template #doc-after>
      <div v-if="!frontmatter.noAds && page.relativePath !== 'privacy.md'" class="doc-ad-slot">
        <AdUnit :min-height="160" label="スポンサーリンク" />
      </div>
    </template>

    <!-- PC表示時: 右側目次（TOC）下のサイドバー広告 -->
    <template #aside-ads-after>
      <div v-if="!frontmatter.noAds && page.relativePath !== 'privacy.md'" class="aside-ad-slot">
        <AdUnit :min-height="250" format="rectangle" label="スポンサーリンク" />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.doc-ad-slot {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--vp-c-divider);
}

.aside-ad-slot {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
