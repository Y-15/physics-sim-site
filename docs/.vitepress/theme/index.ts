import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import 'katex/dist/katex.min.css'
import './sim.css'
import './custom.css'

// components/ 以下の .vue をすべてグローバル登録（ファイル名 = コンポーネント名）
const modules = import.meta.glob('../components/*.vue', { eager: true })

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // グローバルコンポーネントとして登録
    for (const path in modules) {
      const name = path.split('/').pop()!.replace(/\.vue$/, '')
      app.component(name, (modules[path] as any).default)
    }
  }
}
