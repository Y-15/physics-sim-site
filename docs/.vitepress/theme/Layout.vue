<script setup>
import DefaultTheme from 'vitepress/theme'
import PhysicsIntro from '../components/PhysicsIntro.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-top>
      <PhysicsIntro />
    </template>
  </Layout>
</template>
