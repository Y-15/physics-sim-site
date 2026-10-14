import { defineConfig } from 'vitepress'

// GitHub Pages用のベースパス設定（GitHub Actionsビルド時にリポジトリ名から自動判定）
const base = (process.env.BASE_PATH || (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/')) as `/${string}/` | '/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  title: '高校物理シミュレーションラボ',
  description: '高校物理・共通テスト・大学受験対応。動くシミュレーションと数式で直感的に完全理解できる無料学習サイト',
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
      { text: '波動', link: '/waves/index' },
      { text: '電磁気', link: '/electromagnetism/index' },
      { text: '熱力学', link: '/thermodynamics/index' },
      { text: '受験・学習ガイド', link: '/about' }
    ],

    sidebar: {
      '/mechanics/': [
        {
          text: '力学（高校物理）',
          items: [
            { text: '🚀 斜方投射（放物運動の公式）', link: '/mechanics/projectile' },
            { text: '🕰️ 単振り子（等時性と周期公式）', link: '/mechanics/pendulum' },
            { text: '🔩 ばねの単振動（復元力とエネルギー）', link: '/mechanics/spring' },
            { text: '💥 運動量保存則と衝突（反発係数）', link: '/mechanics/momentum' },
            { text: '🔄 等速円運動・向心加速度・向心力', link: '/mechanics/circular' },
            { text: '万有引力とケプラーの法則（準備中）', link: '/mechanics/gravitation' }
          ]
        }
      ],
      '/waves/': [
        {
          text: '波動（高校物理）',
          items: [
            { text: '✅ 定常波・重ね合わせ・ドップラー効果', link: '/waves/index' },
            { text: '光の干渉・ヤングの実験（準備中）', link: '/waves/young' }
          ]
        }
      ],
      '/electromagnetism/': [
        {
          text: '電磁気（高校物理）',
          items: [
            { text: 'クーロンの法則と電場（準備中）', link: '/electromagnetism/index' },
            { text: 'コンデンサー回路（準備中）', link: '/electromagnetism/capacitor' },
            { text: '電磁誘導とファラデーの法則（準備中）', link: '/electromagnetism/induction' }
          ]
        }
      ],
      '/thermodynamics/': [
        {
          text: '熱力学（高校物理）',
          items: [
            { text: '気体の状態方程式とP-V図（準備中）', link: '/thermodynamics/index' }
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
