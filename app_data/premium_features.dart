import '../models/physics_models.dart';

// Keep these benefits synchronized with the Play Console description.
// Update docs/store_listing_ja.md whenever this list changes.
const List<PremiumFeature> kPremiumFeatures = <PremiumFeature>[
  PremiumFeature(
    title: 'レベル5～9の入試問題',
    description: '入試標準応用から大学入試最高難度までの問題と解答解説を利用できます。',
    icon: '◆',
  ),
  PremiumFeature(
    title: '段階的な解法と検算',
    description: '着眼点、立式、途中式、単位確認、よくある誤答まで順番に確認できます。',
    icon: 'Σ',
  ),
  PremiumFeature(
    title: '買い切りで継続利用',
    description: '自動更新はありません。同じGoogleアカウントなら購入を復元できます。',
    icon: '✓',
  ),
];
