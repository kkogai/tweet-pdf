# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

tweet-pdf は PDF ファイルを Twitter 風のタイムラインで表示する Next.js アプリケーションです。PDF.js を使用してテキストを抽出し、各ページを個別のツイートとして表示します。

## 開発コマンド

- `npm run dev` - 開発サーバーを起動（Turbopack 使用）
- `npm run build` - プロダクションビルド（静的サイト生成）
- `npm run start` - ビルド済みファイルを serve でホスティング
- `npm run lint` - ESLint でコードチェック
- `npm test` - Jest でテスト実行
- `npm run test:watch` - Jest ウォッチモードでテスト実行

## アーキテクチャ

### ビルド設定

- **静的サイト生成**: `output: 'export'` で GitHub Pages 対応
- **ベースパス**: `/tweet-pdf` で GitHub Pages デプロイ設定
- **画像最適化無効**: 静的サイト生成に対応するため `unoptimized: true`

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx          # メインページ（ファイルアップロード・表示）
├── components/            # React コンポーネント
│   ├── FileUpload.tsx    # PDF ファイルアップロード UI
│   ├── TweetTimeline.tsx # Twitter 風タイムライン表示
│   └── __tests__/        # コンポーネントテスト
└── utils/                # ユーティリティ関数
    ├── pdfParser.ts      # PDF.js を使ったテキスト抽出
    ├── pdfValidator.ts   # PDF ファイル検証
    └── __tests__/        # ユーティリティテスト
```

### 主要な技術スタック

- **Next.js 15**: React フレームワーク（App Router 使用）
- **PDF.js**: PDF テキスト抽出ライブラリ
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング
- **Jest + React Testing Library**: テスト環境

### PDF 処理フロー

1. **ファイル検証**: `pdfValidator.ts` で MIME タイプとサイズチェック
2. **テキスト抽出**: `pdfParser.ts` で PDF.js を使用して各ページのテキストを抽出
3. **UI 表示**: `TweetTimeline.tsx` で各ページを Twitter 風のカードとして表示

### SSR 対応

- PDF.js は動的インポートで client-side のみで実行
- `'use client'` ディレクティブを適切に使用
- CDN から PDF.js worker を読み込み

### テスト戦略

- 各コンポーネントに対応するテストファイル
- ユーティリティ関数の単体テスト
- Jest と React Testing Library を使用したフロントエンドテスト

## 開発時の注意点

- PDF.js の worker は CDN から動的に読み込むため、インターネット接続が必要
- 大容量 PDF ファイルの処理時間を考慮した UX 設計
- 静的サイト生成のため、サーバーサイド機能は使用不可
- GitHub Pages デプロイ時は basePath `/tweet-pdf` が適用される
