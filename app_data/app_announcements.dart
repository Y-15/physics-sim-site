class AppAnnouncement {
  const AppAnnouncement({
    required this.id,
    required this.dateLabel,
    required this.category,
    required this.title,
    required this.summary,
    required this.body,
    this.isImportant = false,
  });

  final String id;
  final String dateLabel;
  final String category;
  final String title;
  final String summary;
  final String body;
  final bool isImportant;
}

// Keep IDs ASCII so announcements can later be synchronized with a server.
const List<AppAnnouncement> kAppAnnouncements = <AppAnnouncement>[
  AppAnnouncement(
    id: 'premium-level-update-20260801',
    dateLabel: '2026.08.01',
    category: '機能変更',
    title: '問題レベルとプレミアム範囲を更新しました',
    summary: '問題を9段階で表示し、レベル3・4を広告視聴、レベル5以上をプレミアム対象にしました。',
    body: 'レベル1～2は無料で利用できます。レベル3は広告1本、レベル4は広告2本で、選択した1問の問題文・ヒント・解答・解説を24時間利用できます。レベル5～9はプレミアムパックで利用できます。',
    isImportant: true,
  ),
  AppAnnouncement(
    id: 'content-expansion-20260801',
    dateLabel: '2026.08.01',
    category: '教材更新',
    title: '高校物理115トピックを収録しました',
    summary: '力学、波動、電磁気、熱力学、原子の学習範囲を拡充しました。',
    body: '各トピックは文章による解説と数式による確認を組み合わせています。プロフィールでは単元別・トピック別の進捗を確認できます。',
  ),
  AppAnnouncement(
    id: 'release-1-0-0',
    dateLabel: '2026.08.01',
    category: 'アップデート',
    title: 'バージョン1.0.0のお知らせ',
    summary: '学習、復習、問題、公式一覧、コラム、学習ツールを利用できます。',
    body: '今後のアップデート内容や重要なお知らせは、この画面で確認できます。不具合や教材の誤りは報告画面からお知らせください。',
  ),
];
