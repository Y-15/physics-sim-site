import DefaultTheme from 'vitepress/theme'
import ProjectileSim from '../components/ProjectileSim.vue'
import PendulumSim from '../components/PendulumSim.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // グローバルコンポーネントとして登録
    app.component('ProjectileSim', ProjectileSim)
    app.component('PendulumSim', PendulumSim)
  }
}
