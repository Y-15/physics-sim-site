import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

// 実際に掲載されている演習問題を自動カウントするヘルパー関数
function getProblemCounts() {
  const defaults = { total: 0, mechanics: 0, waves: 0, electromagnetism: 0, thermodynamics: 0, atomic: 0 }
  try {
    const jsonPath = path.resolve(__dirname, '../public/data/problems.json')
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      if (Array.isArray(data)) {
        return {
          total: data.length,
          mechanics: data.filter((p: any) => p.unitId === 'mechanics').length,
          waves: data.filter((p: any) => p.unitId === 'waves').length,
          electromagnetism: data.filter((p: any) => p.unitId === 'electromagnetism').length,
          thermodynamics: data.filter((p: any) => p.unitId === 'thermodynamics').length,
          atomic: data.filter((p: any) => p.unitId === 'atomic').length,
        }
      }
    }
  } catch (e) {
    console.warn('[config.mts] 問題数カウントの自動取得に失敗しました:', e)
  }
  return defaults
}

// 大学物理の演習問題数を自動カウントするヘルパー関数
function getUnivProblemCounts() {
  const defaults = { total: 0, mechanics: 0, electromagnetism: 0, thermodynamics: 0, quantum: 0 }
  try {
    const jsonPath = path.resolve(__dirname, '../public/data/university_problems.json')
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      if (Array.isArray(data)) {
        return {
          total: data.length,
          mechanics: data.filter((p: any) => p.unitId === 'mechanics').length,
          electromagnetism: data.filter((p: any) => p.unitId === 'electromagnetism').length,
          thermodynamics: data.filter((p: any) => p.unitId === 'thermodynamics').length,
          quantum: data.filter((p: any) => p.unitId === 'quantum').length,
        }
      }
    }
  } catch (e) {
    console.warn('[config.mts] 大学問題数カウントの自動取得に失敗しました:', e)
  }
  return defaults
}

const pCounts = getProblemCounts()
const univCounts = getUnivProblemCounts()

// GitHub Pages用のベースパス設定（GitHub Actionsビルド時にリポジトリ名から自動判定）
const base = (process.env.BASE_PATH || (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/')) as `/${string}/` | '/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  title: '物理シミュレーションラボ | 高校物理・大学物理',
  description: '高校物理（共通テスト・大学受験）と大学物理（力学・電磁気・熱統計・量子力学）を完全分離して体系化。動くシミュレーションと厳密な演習問題集完備。',
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
    // KaTeX数式レンダリングスタイルシート
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' }],

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
    ['meta', { property: 'og:description', content: '高校物理・共通テスト・国公立大学受験対応。全79テーマの対話型シミュレーターとベクター図解、厳選例題で直感的に完全攻略できる無料学習サイト。' }],
    ['meta', { property: 'og:url', content: 'https://y-15.github.io/physics-sim-site/' }],
    ['meta', { property: 'og:image', content: 'https://y-15.github.io/physics-sim-site/og-image.svg' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: '高校物理シミュレーションラボ' }],
    ['meta', { name: 'twitter:description', content: '高校物理・共通テスト・大学受験対応。動くシミュレーションと厳選例題で直感理解！' }],
    ['meta', { name: 'twitter:image', content: 'https://y-15.github.io/physics-sim-site/og-image.svg' }],

    // Google AdSense アカウント所有権確認メタタグ＆自動広告スクリプト
    ['meta', { name: 'google-adsense-account', content: 'ca-pub-6690428870593129' }],
    [
      'script',
      {
        async: '',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6690428870593129',
        crossorigin: 'anonymous'
      }
    ],

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
      {
        text: '🏫 高校物理',
        items: [
          { text: '🏎️ 力学（全20テーマ）', link: '/mechanics/index' },
          { text: '🌊 波動（全12テーマ）', link: '/waves/index' },
          { text: '⚡ 電磁気（全14テーマ）', link: '/electromagnetism/index' },
          { text: '🔥 熱力学（全9テーマ）', link: '/thermodynamics/index' },
          { text: '⚛️ 原子物理（全12テーマ）', link: '/atomic/index' },
          { text: `📝 高校物理 演習問題集（全${pCounts.total}問）`, link: '/problems/index' }
        ]
      },
      {
        text: '🎓 大学物理',
        items: [
          { text: '🏛️ 大学物理ポータル＆マップ', link: '/university/index' },
          { text: '🏎️ 大学力学・解析力学', link: '/university/mechanics/index' },
          { text: '⚡ 大学電磁気学（マクスウェル）', link: '/university/electromagnetism/index' },
          { text: '🔥 熱力学・統計力学', link: '/university/thermodynamics/index' },
          { text: '⚛️ 大学量子力学', link: '/university/quantum/index' },
          { text: `📝 大学物理 演習問題集（全${univCounts.total}問・院試対応）`, link: '/university/problems/index' }
        ]
      },
      {
        text: '📝 演習問題',
        items: [
          { text: `🏫 高校物理 演習問題集（全${pCounts.total}問・5分野）`, link: '/problems/index' },
          { text: `🎓 大学物理 演習問題集（全${univCounts.total}問・院試対応）`, link: '/university/problems/index' }
        ]
      },
      { text: '🎲 3Dオセロ', link: '/games/othello' },
      { text: '受験・学習ガイド', link: '/about' },
      { text: '✉️ お問い合わせ', link: '/contact' }
    ],

    sidebar: {
      '/university/problems/': [
        {
          text: `🎓 大学物理 演習問題集（全${univCounts.total}問）`,
          collapsed: false,
          items: [
            { text: '📝 大学問題集トップ（検索・進捗管理）', link: '/university/problems/index' },
            { text: `🏎️ 力学・解析力学（全${univCounts.mechanics}問）`, link: '/university/problems/mechanics' },
            { text: `⚡ 電磁気学（全${univCounts.electromagnetism}問）`, link: '/university/problems/electromagnetism' },
            { text: `🔥 熱・統計力学（全${univCounts.thermodynamics}問）`, link: '/university/problems/thermodynamics' },
            { text: `⚛️ 量子力学（全${univCounts.quantum}問）`, link: '/university/problems/quantum' }
          ]
        },
        {
          text: '🏛️ 大学物理 講義編',
          collapsed: false,
          items: [
            { text: '🏛️ 大学物理ポータル', link: '/university/index' },
            { text: '🏎️ 大学力学・解析力学', link: '/university/mechanics/index' },
            { text: '⚡ 大学電磁気学', link: '/university/electromagnetism/index' },
            { text: '🔥 熱力学・統計力学', link: '/university/thermodynamics/index' },
            { text: '⚛️ 大学量子力学', link: '/university/quantum/index' }
          ]
        },
        {
          text: '🏫 高校物理コースへ移動',
          collapsed: true,
          items: [
            { text: `📝 高校物理 演習問題集（全${pCounts.total}問）`, link: '/problems/index' },
            { text: '🏎️ 高校物理 力学トップ', link: '/mechanics/index' }
          ]
        }
      ],
      '/university/': [
        {
          text: '🎓 大学物理カリキュラム体系',
          collapsed: false,
          items: [
            { text: '🏛️ 大学物理ポータル＆マップ', link: '/university/index' },
            { text: '🏎️ 大学力学・解析力学', link: '/university/mechanics/index' },
            { text: '⚡ 大学電磁気学（マクスウェル）', link: '/university/electromagnetism/index' },
            { text: '🔥 熱力学・統計力学', link: '/university/thermodynamics/index' },
            { text: '⚛️ 大学量子力学', link: '/university/quantum/index' }
          ]
        },
        {
          text: `📝 大学物理 演習問題集（全${univCounts.total}問）`,
          collapsed: false,
          items: [
            { text: '📝 大学問題集トップ（検索・進捗管理）', link: '/university/problems/index' },
            { text: `🏎️ 力学・解析力学演習`, link: '/university/problems/mechanics' },
            { text: `⚡ 電磁気学演習`, link: '/university/problems/electromagnetism' },
            { text: `🔥 熱・統計力学演習`, link: '/university/problems/thermodynamics' },
            { text: `⚛️ 量子力学演習`, link: '/university/problems/quantum' }
          ]
        },
        {
          text: '🏫 高校物理コースへ移動',
          collapsed: true,
          items: [
            { text: '🏎️ 高校物理 力学トップ', link: '/mechanics/index' },
            { text: '🌊 高校物理 波動トップ', link: '/waves/index' },
            { text: '⚡ 高校物理 電磁気トップ', link: '/electromagnetism/index' },
            { text: '🔥 高校物理 熱力学トップ', link: '/thermodynamics/index' },
            { text: '⚛️ 高校物理 原子物理トップ', link: '/atomic/index' },
            { text: `📝 高校物理 演習問題集（全${pCounts.total}問）`, link: '/problems/index' }
          ]
        }
      ],
      '/games/': [
        {
          text: '特別企画・思考力トレーニング',
          collapsed: false,
          items: [
            { text: '🎲 3次元オセロ（3D Reversi）', link: '/games/othello' },
            { text: '🏎️ 力学シミュレーション一覧', link: '/mechanics/index' },
            { text: '📝 演習問題集トップ', link: '/problems/index' }
          ]
        }
      ],
      '/problems/': [
        {
          text: `🏫 高校物理 演習問題集（全${pCounts.total}問）`,
          collapsed: false,
          items: [
            { text: `📝 高校問題集トップ（全${pCounts.total}問検索）`, link: '/problems/index' },
            { text: `🏎️ 力学 演習問題（全${pCounts.mechanics}問）`, link: '/problems/mechanics' },
            { text: `🌊 波動 演習問題（全${pCounts.waves}問）`, link: '/problems/waves' },
            { text: `⚡ 電磁気 演習問題（全${pCounts.electromagnetism}問）`, link: '/problems/electromagnetism' },
            { text: `🔥 熱力学 演習問題（全${pCounts.thermodynamics}問）`, link: '/problems/thermodynamics' },
            { text: `⚛️ 原子物理 演習問題（全${pCounts.atomic}問）`, link: '/problems/atomic' }
          ]
        },
        {
          text: `🎓 大学物理 演習問題（微積・院試）`,
          collapsed: false,
          items: [
            { text: `📝 大学物理 演習問題集トップ（全${univCounts.total}問）`, link: '/university/problems/index' },
            { text: '🏎️ 大学力学・解析力学 演習', link: '/university/problems/mechanics' },
            { text: '⚡ 大学電磁気学 演習', link: '/university/problems/electromagnetism' },
            { text: '🔥 熱・統計力学 演習', link: '/university/problems/thermodynamics' },
            { text: '⚛️ 大学量子力学 演習', link: '/university/problems/quantum' }
          ]
        }
      ],
      '/mechanics/': [
        {
          text: '📖 力学編トップ',
          link: '/mechanics/index'
        },
        {
          text: '🏎️ 運動の表し方・力と運動方程式',
          collapsed: false,
          items: [
            { text: '🏎️ 等加速度直線運動とv-tグラフ', link: '/mechanics/acceleration' },
            { text: '🚀 斜方投射（放物運動の公式）', link: '/mechanics/projectile' },
            { text: '📐 摩擦力と斜面上の運動（摩擦角）', link: '/mechanics/friction' },
            { text: '⚙️ 運動の法則・連結物体の運動方程式と滑車', link: '/mechanics/newton' },
            { text: '🪂 空気抵抗と終端速度', link: '/mechanics/terminal-velocity' }
          ]
        },
        {
          text: '⚡ 仕事・エネルギー・運動量保存則',
          collapsed: false,
          items: [
            { text: '⚡ 仕事・仕事率と力学的エネルギー保存則', link: '/mechanics/energy' },
            { text: '💥 運動量保存則と衝突（反発係数）', link: '/mechanics/momentum' },
            { text: '🎱 2次元平面衝突・斜め衝突と反発係数', link: '/mechanics/collision-2d' },
            { text: '⚖️ 2体問題・重心運動と相対運動', link: '/mechanics/two-body' }
          ]
        },
        {
          text: '🔄 円運動・単振動・万有引力',
          collapsed: false,
          items: [
            { text: '🔩 ばねの単振動（復元力とエネルギー）', link: '/mechanics/spring' },
            { text: '🕰️ 単振り子（等時性と周期公式）', link: '/mechanics/pendulum' },
            { text: '🔄 等速円運動・向心加速度・向心力', link: '/mechanics/circular' },
            { text: '🎢 鉛直面内の円運動と宙返り・軌道離脱', link: '/mechanics/vertical-loop' },
            { text: '🚀 慣性力・見かけの重力・遠心力', link: '/mechanics/inertia' },
            { text: '🪐 万有引力と人工衛星・ケプラー則', link: '/mechanics/gravitation' },
            { text: '🪐 惑星の楕円軌道・面積速度一定則とケプラー運動', link: '/mechanics/kepler-orbit' }
          ]
        },
        {
          text: '🧱 剛体のつり合い・流体・束縛運動',
          collapsed: false,
          items: [
            { text: '⚖️ 剛体のつり合いと力のモーメント', link: '/mechanics/moment' },
            { text: '🧱 剛体の転倒条件と滑り出し限界', link: '/mechanics/toppling' },
            { text: '🌊 浮力とアルキメデスの原理・水圧', link: '/mechanics/buoyancy' },
            { text: '🪢 束縛運動と滑車・動く台上の運動', link: '/mechanics/constraint-motion' }
          ]
        }
      ],
      '/waves/': [
        {
          text: '🌊 波動編トップ',
          link: '/waves/index'
        },
        {
          text: '🌊 波の基本・定常波・音波',
          collapsed: false,
          items: [
            { text: '🌊 波の式とグラフ（y-xグラフとy-tグラフ）', link: '/waves/wave-equation' },
            { text: '🔊 ドップラー効果の完全攻略', link: '/waves/doppler' },
            { text: '🔊 うなり（脈動）と音波の合成', link: '/waves/beats' },
            { text: '🎸 弦の振動と定常波・メルデの実験', link: '/waves/string-vibration' },
            { text: '📢 気柱の共鳴と開口端補正', link: '/waves/resonance' },
            { text: '🌊 2波源の波の干渉と双曲線縞', link: '/waves/interference-2d' }
          ]
        },
        {
          text: '🌈 光の干渉・屈折・幾何光学',
          collapsed: false,
          items: [
            { text: '🌈 光の干渉・ヤングの二重スリット実験', link: '/waves/young' },
            { text: '✨ くさび形空気層の干渉・等厚干渉縞', link: '/waves/wedge-film' },
            { text: '✨ 薄膜干渉とニュートンリング', link: '/waves/thin-film' },
            { text: '🌈 回折格子とスペクトル分析', link: '/waves/diffraction-grating' },
            { text: '🔍 光の屈折・全反射とレンズの結像公式', link: '/waves/optics' },
            { text: '🪞 凹面鏡・凸面鏡と球面反射', link: '/waves/spherical-mirror' }
          ]
        }
      ],
      '/electromagnetism/': [
        {
          text: '⚡ 電磁気学編トップ',
          link: '/electromagnetism/index'
        },
        {
          text: '⚡ 電場・電位・コンデンサー・直流回路',
          collapsed: false,
          items: [
            { text: '⚡ クーロンの法則・電場と電位', link: '/electromagnetism/field' },
            { text: '🔋 コンデンサー回路と静電エネルギー・誘電体', link: '/electromagnetism/capacitor' },
            { text: '💡 直流回路とキルヒホッフの法則・非オーム抵抗', link: '/electromagnetism/circuit' }
          ]
        },
        {
          text: '🧲 電流と磁場・電磁力・電磁誘導',
          collapsed: false,
          items: [
            { text: '🌀 磁場中の荷電粒子の運動・ローレンツ力', link: '/electromagnetism/lorentz' },
            { text: '🧲 電磁力と平行電流間に働く力（アンペール力）', link: '/electromagnetism/magnetic-force' },
            { text: '🧲 電流がつくる磁場とアンペールの法則', link: '/electromagnetism/magnetic-field' },
            { text: '🧲 電磁誘導の法則と導線棒の運動', link: '/electromagnetism/induction' },
            { text: '⚡ 自己誘導とコイルの過渡現象・RL回路', link: '/electromagnetism/self-induction' }
          ]
        },
        {
          text: '〰️ 交流回路・電磁振動・荷電粒子応用',
          collapsed: false,
          items: [
            { text: '〰️ 交流回路とRLC直列回路・共振', link: '/electromagnetism/ac-circuit' },
            { text: '⚡ LC振動回路と電磁振動', link: '/electromagnetism/lc-oscillation' },
            { text: '🧲 ホール効果とキャリア判定', link: '/electromagnetism/hall-effect' },
            { text: '🔬 トムソンの比電荷測定と速度セレクター', link: '/electromagnetism/thomson' },
            { text: '⚡ サイクロトロン（粒子加速器）とローレンツ力', link: '/electromagnetism/cyclotron' },
            { text: '🧲 ベータトロン（誘導加速器）と電磁誘導加速', link: '/electromagnetism/betatron' }
          ]
        }
      ],
      '/thermodynamics/': [
        {
          text: '🔥 熱力学編トップ',
          link: '/thermodynamics/index'
        },
        {
          text: '🔥 気体の状態変化・分子運動論・熱サイクル',
          collapsed: false,
          items: [
            { text: '🔥 気体の状態変化・P-V図と熱力学第1法則', link: '/thermodynamics/gas-law' },
            { text: '🔬 気体分子運動論と二乗平均速度', link: '/thermodynamics/kinetic-theory' },
            { text: '🔥 カルノーサイクルと熱機関の熱効率', link: '/thermodynamics/carnot' },
            { text: '🚗 オットーサイクルと4行程内燃機関の熱効率', link: '/thermodynamics/otto-cycle' },
            { text: '🔥 モル比熱とマイヤーの式・断熱変化', link: '/thermodynamics/heat-capacity' }
          ]
        },
        {
          text: '🧊 熱量・混合・気圧・浮力',
          collapsed: false,
          items: [
            { text: '🧊 熱量保存則・比熱・潜熱と相転移加熱曲線', link: '/thermodynamics/calorimetry' },
            { text: '🧪 気体の混合と可動ピストン', link: '/thermodynamics/gas-mixing' },
            { text: '🌡️ 水銀柱と大気圧・トリチェリの真空', link: '/thermodynamics/torricelli' },
            { text: '🎈 気球の浮力と熱気球の浮上条件', link: '/thermodynamics/hot-air-balloon' }
          ]
        }
      ],
      '/atomic/': [
        {
          text: '⚛️ 原子物理編トップ',
          link: '/atomic/index'
        },
        {
          text: '💡 光量子・電子・原子の構造',
          collapsed: false,
          items: [
            { text: '💡 光電効果とアインシュタインの光量子仮説', link: '/atomic/photoelectric' },
            { text: '🔬 ミリカンの油滴実験と電気素量測定', link: '/atomic/millikan' },
            { text: '⚛️ ラザフォード散乱実験と原子核の発見', link: '/atomic/rutherford' },
            { text: '🔬 ボーアの水素原子模型と量子条件', link: '/atomic/bohr' },
            { text: '💎 ブラッグ反射とX線結晶回折', link: '/atomic/bragg' },
            { text: '⚡ X線の発生とX線スペクトル', link: '/atomic/xray' },
            { text: '⚛️ 物質波（ド・ブロイ波）と電子線回折', link: '/atomic/matter-wave' },
            { text: '⚛️ コンプトン効果と光子の運動量', link: '/atomic/compton' }
          ]
        },
        {
          text: '☢️ 原子核・放射線・核反応',
          collapsed: false,
          items: [
            { text: '☢️ 放射性崩壊・半減期と放射線の性質', link: '/atomic/decay' },
            { text: '☢️ 放射平衡と壊変系列（過渡平衡・永続平衡）', link: '/atomic/equilibrium' },
            { text: '⚛️ 核反応・質量欠損と結合エネルギー', link: '/atomic/nuclear' },
            { text: '⚛️ 原子核分裂と連鎖反応（臨界条件）', link: '/atomic/chain-reaction' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    footer: {
      message: '完全無料の高校物理インタラクティブ学習サイト | <a href="/physics-sim-site/privacy">プライバシーポリシー</a> | <a href="/physics-sim-site/contact">お問い合わせ</a>',
      copyright: 'Copyright © 2026 Physics Lab'
    },

    search: {
      provider: 'local'
    }
  }
})
