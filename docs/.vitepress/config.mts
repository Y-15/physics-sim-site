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
    // ファビコン
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],

    // 基本SEOメタタグ
    ['meta', { name: 'keywords', content: '高校物理, 物理シミュレーション, 共通テスト 物理, 大学受験 物理, 力学, 電磁気, 波動, 熱力学, 原子物理, 物理公式, 導出, 過去問, 例題, 物理 わかりやすい' }],
    ['meta', { name: 'author', content: '高校物理シミュレーションラボ' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'theme-color', content: '#38bdf8' }],

    // OGP (Open Graph Protocol) メタタグ
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'ja_JP' }],
    ['meta', { property: 'og:site_name', content: '高校物理シミュレーションラボ' }],
    ['meta', { property: 'og:title', content: '高校物理シミュレーションラボ | 動くシミュレーションで完全理解' }],
    ['meta', { property: 'og:description', content: '高校物理・共通テスト・国公立大学受験対応。全67テーマの対話型シミュレーターとベクター図解、厳選例題で直感的に完全攻略できる無料学習サイト。' }],
    ['meta', { property: 'og:url', content: 'https://y-15.github.io/physics-sim-site/' }],
    ['meta', { property: 'og:image', content: 'https://y-15.github.io/physics-sim-site/og-image.svg' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: '高校物理シミュレーションラボ' }],
    ['meta', { name: 'twitter:description', content: '高校物理・共通テスト・大学受験対応。動くシミュレーションと厳選例題で直感理解！' }],
    ['meta', { name: 'twitter:image', content: 'https://y-15.github.io/physics-sim-site/og-image.svg' }],

    // 構造化データ (JSON-LD: Schema.org EducationalOrganization)
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: '高校物理シミュレーションラボ',
        alternateName: 'Physics Sim Lab',
        url: 'https://y-15.github.io/physics-sim-site/',
        logo: 'https://y-15.github.io/physics-sim-site/favicon.svg',
        description: '高校物理・共通テスト・大学受験対応。動くシミュレーションと数式で直感的に完全理解できる無料学習サイト',
        sameAs: ['https://github.com/Y-15/physics-sim-site']
      })
    ]
  ],

  themeConfig: {
    nav: [
      { text: 'ホーム', link: '/' },
      { text: '力学', link: '/mechanics/index' },
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
          text: '高校物理 演習問題集（全161問）',
          items: [
            { text: '📝 問題集トップ', link: '/problems/index' },
            { text: '🏎️ 力学 演習問題（全53問）', link: '/problems/mechanics' },
            { text: '🌊 波動 演習問題（全28問）', link: '/problems/waves' },
            { text: '⚡ 電磁気 演習問題（全38問）', link: '/problems/electromagnetism' },
            { text: '🔥 熱力学 演習問題（全21問）', link: '/problems/thermodynamics' },
            { text: '⚛️ 原子物理 演習問題（全21問）', link: '/problems/atomic' }
          ]
        }
      ],
      '/mechanics/': [
        {
          text: '力学（高校物理）',
          items: [
            { text: '📖 力学編トップ', link: '/mechanics/index' },
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
            { text: '⚖️ 剛体のつり合いと力のモーメント', link: '/mechanics/moment' },
            { text: '🧱 剛体の転倒条件と滑り出し限界', link: '/mechanics/toppling' },
            { text: '🌊 浮力とアルキメデスの原理・水圧', link: '/mechanics/buoyancy' },
            { text: '⚖️ 2体問題・重心運動と相対運動', link: '/mechanics/two-body' },
            { text: '🪂 空気抵抗と終端速度', link: '/mechanics/terminal-velocity' },
            { text: '🎢 鉛直面内の円運動と宙返り・軌道離脱', link: '/mechanics/vertical-loop' },
            { text: '🪢 束縛運動と滑車・動く台上の運動', link: '/mechanics/constraint-motion' }
          ]
        }
      ],
      '/waves/': [
        {
          text: '波動（高校物理）',
          items: [
            { text: '🌊 波の式とグラフ（y-xグラフとy-tグラフ）', link: '/waves/wave-equation' },
            { text: '✅ 定常波・重ね合わせ・ドップラー効果', link: '/waves/index' },
            { text: '🔊 ドップラー効果の完全攻略', link: '/waves/doppler' },
            { text: '🌈 光の干渉・ヤングの二重スリット実験', link: '/waves/young' },
            { text: '🔍 光の屈折・全反射とレンズの結像公式', link: '/waves/optics' },
            { text: '✨ 薄膜干渉とニュートンリング', link: '/waves/thin-film' },
            { text: '📢 気柱の共鳴と開口端補正', link: '/waves/resonance' },
            { text: '🌈 回折格子とスペクトル分析', link: '/waves/diffraction-grating' },
            { text: '🌊 2波源の波の干渉と双曲線縞', link: '/waves/interference-2d' },
            { text: '🪞 凹面鏡・凸面鏡と球面反射', link: '/waves/spherical-mirror' }
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
            { text: '🧲 電磁誘導の法則と導線棒の運動', link: '/electromagnetism/induction' },
            { text: '🧲 電流がつくる磁場とアンペールの法則', link: '/electromagnetism/magnetic-field' },
            { text: '〰️ 交流回路とRLC直列回路・共振', link: '/electromagnetism/ac-circuit' },
            { text: '⚡ LC振動回路と電磁振動', link: '/electromagnetism/lc-oscillation' },
            { text: '🧲 ホール効果とキャリア判定', link: '/electromagnetism/hall-effect' },
            { text: '⚡ サイクロトロン（粒子加速器）とローレンツ力', link: '/electromagnetism/cyclotron' },
            { text: '🧲 ベータトロン（誘導加速器）と電磁誘導加速', link: '/electromagnetism/betatron' }
          ]
        }
      ],
      '/thermodynamics/': [
        {
          text: '熱力学（高校物理）',
          items: [
            { text: '📖 熱力学編トップ', link: '/thermodynamics/index' },
            { text: '🔥 気体の状態変化・P-V図と熱力学第1法則', link: '/thermodynamics/gas-law' },
            { text: '🔬 気体分子運動論と二乗平均速度', link: '/thermodynamics/kinetic-theory' },
            { text: '🔥 カルノーサイクルと熱機関の熱効率', link: '/thermodynamics/carnot' },
            { text: '🔥 モル比熱とマイヤーの式・断熱変化', link: '/thermodynamics/heat-capacity' },
            { text: '🧪 気体の混合と可動ピストン', link: '/thermodynamics/gas-mixing' },
            { text: '🌡️ 水銀柱と大気圧・トリチェリの真空', link: '/thermodynamics/torricelli' },
            { text: '🎈 気球の浮力と熱気球の浮上条件', link: '/thermodynamics/hot-air-balloon' }
          ]
        }
      ],
      '/atomic/': [
        {
          text: '原子物理（高校物理）',
          items: [
            { text: '📖 原子物理編トップ', link: '/atomic/index' },
            { text: '💡 光電効果とアインシュタインの光量子仮説', link: '/atomic/photoelectric' },
            { text: '🔬 ボーアの水素原子模型と量子条件', link: '/atomic/bohr' },
            { text: '☢️ 放射性崩壊・半減期と放射線の性質', link: '/atomic/decay' },
            { text: '⚛️ コンプトン効果と光子の運動量', link: '/atomic/compton' },
            { text: '⚛️ 核反応・質量欠損と結合エネルギー', link: '/atomic/nuclear' },
            { text: '⚛️ 物質波（ド・ブロイ波）と電子線回折', link: '/atomic/matter-wave' },
            { text: '⚡ X線の発生とX線スペクトル', link: '/atomic/xray' },
            { text: '☢️ 放射平衡と壊変系列（過渡平衡・永続平衡）', link: '/atomic/equilibrium' },
            { text: '⚛️ 原子核分裂と連鎖反応（臨界条件）', link: '/atomic/chain-reaction' }
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
