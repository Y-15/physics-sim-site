import { defineConfig } from 'vitepress'

// GitHub Pages用のベースパス設定（GitHub Actionsビルド時にリポジトリ名から自動判定）
const base = (process.env.BASE_PATH || (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/')) as `/${string}/` | '/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  title: '物理ラボ - 視覚でわかる物理学',
  description: '動くシミュレーションと美しい数式で直感的に学べる物理の解説サイト',
  lang: 'ja-JP',
  ignoreDeadLinks: true,

  // 数式（MathJax）を有効化 ($...$ や $$...$$ が自動で数式になります)
  markdown: {
    math: true
  },

  head: [
    // 将来 Google AdSense の広告コードを入れる場合はここに追加します
    // ['script', { async: '', src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX', crossorigin: 'anonymous' }]
  ],

  themeConfig: {
    nav: [
      { text: 'ホーム', link: '/' },
      { text: '力学', link: '/mechanics/projectile' },
      { text: '電磁気学', link: '/electromagnetism/index' },
      { text: 'このサイトについて', link: '/about' }
    ],

    sidebar: {
      '/mechanics/': [
        {
          text: '力学編',
          items: [
            { text: '斜方投射（放物運動）', link: '/mechanics/projectile' },
            { text: '単振り子（等時性と周期）', link: '/mechanics/pendulum' },
            { text: 'ばねの単振動（準備中）', link: '/mechanics/spring' }
          ]
        }
      ],
      '/electromagnetism/': [
        {
          text: '電磁気学編',
          items: [
            { text: 'クーロンの法則と電場（準備中）', link: '/electromagnetism/index' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    footer: {
      message: '完全無料の物理インタラクティブ学習サイト',
      copyright: 'Copyright © 2026 Physics Lab'
    },

    search: {
      provider: 'local'
    }
  }
})
