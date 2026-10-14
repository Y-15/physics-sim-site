import DefaultTheme from 'vitepress/theme'
import ProjectileSim from '../components/ProjectileSim.vue'
import PendulumSim from '../components/PendulumSim.vue'
import WavesSim from '../components/WavesSim.vue'
import SpringSim from '../components/SpringSim.vue'
import MomentumSim from '../components/MomentumSim.vue'
import CircularSim from '../components/CircularSim.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // グローバルコンポーネントとして登録
    app.component('ProjectileSim', ProjectileSim)
    app.component('PendulumSim', PendulumSim)
    app.component('WavesSim', WavesSim)
    app.component('SpringSim', SpringSim)
    app.component('MomentumSim', MomentumSim)
    app.component('CircularSim', CircularSim)
  }
}
