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
  cleanUrls: false,
  lastUpdated: true,

  // 共通パーツ（注意書きなど）はページとして出力しない
  srcExclude: ['parts/**'],

  // 検索エンジン向けサイトマップ
  sitemap: {
    hostname: 'https://y-15.github.io/physics-sim-site/'
  },

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
      { text: '原子', link: '/atomic/index' },
      { text: '演習問題', link: '/problems/index' },
      { text: '受験・学習ガイド', link: '/about' }
    ],

    sidebar: {
      '/problems/': [
        {
          text: '厳選演習問題集（全41問）',
          items: [
            { text: '📝 問題集トップ', link: '/problems/index' },
            { text: '🏎️ 力学 演習問題（9問）', link: '/problems/mechanics' },
            { text: '🌊 波動 演習問題（8問）', link: '/problems/waves' },
            { text: '⚡ 電磁気 演習問題（8問）', link: '/problems/electromagnetism' },
            { text: '🔥 熱力学 演習問題（8問）', link: '/problems/thermodynamics' },
            { text: '⚛️ 原子物理 演習問題（8問）', link: '/problems/atomic' }
          ]
        }
      ],
      '/mechanics/': [
        {
          text: '力学（高校物理）',
          items: [
            { text: '🏎️ 等加速度直線運動とv-tグラフ', link: '/mechanics/acceleration' },
            { text: '🚀 斜方投射（放物運動の公式）', link: '/mechanics/projectile' },
            { text: '📐 摩擦力と斜面上の運動（摩擦角）', link: '/mechanics/friction' },
            { text: '⚙️ 運動の法則・連結物体の運動方程式と滑車', link: '/mechanics/newton' },
            { text: '⚡ 仕事・仕事率と力学的エネルギー保存則', link: '/mechanics/energy' },
            { text: '🔩 ばねの単振動（復元力とエネルギー）', link: '/mechanics/spring' },
            { text: '💥 運動量保存則と衝突（反発係数）', link: '/mechanics/momentum' },
            { text: '🕰️ 単振り子（等時性と周期公式）', link: '/mechanics/pendulum' },
            { text: '🔄 等速円運動・向心加速度・向心力', link: '/mechanics/circular' },
            { text: '🚀 慣性力・見かけの重力・遠心力', link: '/mechanics/inertia' },
            { text: '🪐 万有引力と人工衛星・ケプラー則', link: '/mechanics/gravitation' },
            { text: '⚖️ 剛体のつり合いと力のモーメント', link: '/mechanics/moment' }
          ]
        }
      ],
      '/waves/': [
        {
          text: '波動（高校物理）',
          items: [
            { text: '🌊 波の式とグラフ（y-xグラフとy-tグラフ）', link: '/waves/wave-equation' },
            { text: '✅ 定常波・重ね合わせ・ドップラー効果', link: '/waves/index' },
            { text: '🌈 光の干渉・ヤングの二重スリット実験', link: '/waves/young' },
            { text: '🔍 光の屈折・全反射とレンズの結像公式', link: '/waves/optics' }
          ]
        }
      ],
      '/electromagnetism/': [
        {
          text: '電磁気（高校物理）',
          items: [
            { text: '📖 電磁気学編トップ', link: '/electromagnetism/index' },
            { text: '⚡ クーロンの法則・電場と電位', link: '/electromagnetism/field' },
            { text: '🔋 コンデンサー回路と静電エネルギー・誘電体', link: '/electromagnetism/capacitor' },
            { text: '💡 直流回路とキルヒホッフの法則・非オーム抵抗', link: '/electromagnetism/circuit' },
            { text: '🌀 磁場中の荷電粒子の運動・ローレンツ力', link: '/electromagnetism/lorentz' },
            { text: '🧲 電磁誘導の法則と導線棒の運動', link: '/electromagnetism/induction' }
          ]
        }
      ],
      '/thermodynamics/': [
        {
          text: '熱力学（高校物理）',
          items: [
            { text: '📖 熱力学編トップ', link: '/thermodynamics/index' },
            { text: '🔥 気体の状態変化・P-V図と熱力学第1法則', link: '/thermodynamics/gas-law' },
            { text: '🔬 気体分子運動論と二乗平均速度', link: '/thermodynamics/kinetic-theory' }
          ]
        }
      ],
      '/atomic/': [
        {
          text: '原子物理（高校物理）',
          items: [
            { text: '📖 原子物理編トップ', link: '/atomic/index' },
            { text: '💡 光電効果とアインシュタインの光量子仮説', link: '/atomic/photoelectric' },
            { text: '🔬 ボーアの水素原子模型と量子条件', link: '/atomic/bohr' }
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
