<p align="center">
  <img src="asset/logo_cool.png" alt="AgentBrother Logo" width="400" height="400">
</p>

**[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md)**

# AgentBrother

クロスプラットフォーム エージェント管理フレームワーク - OpenClaw、ZeroClawなどのエージェントフレームワークを統一管理し、ユーザーがAIデジタル従業員などのエージェントを視覚的に作成できるようにします。

## プロジェクトの目的

AgentBrotherの主な目的は、OpenClawやZeroClawなどのAIエージェントフレームワークを管理・使用するための統一的でクロスプラットフォームのインターフェースを提供することです。AgentBrotherを使用すると、ユーザーは以下のことができます：

- 複数のエージェントフレームワークを一元管理し、ツール間の切り替えを不要にする
- 視覚的にAIデジタル従業員を作成・設定・使用する
- 異なるプラットフォーム（Mac、Windows、Web、モバイル）で一貫したユーザー体験を得る
- エージェントの作成と管理プロセスを簡素化し、使用のハードルを下げる

## 機能特性

### コア機能
- **マルチフレームワーク対応**: OpenClaw、ZeroClawなどの主流エージェントフレームワークを統合
- **クロスプラットフォーム互換**: Mac、Windows、Web、モバイルデバイスをサポート
- **視覚的インターフェース**: 直感的なインターフェースでAIデジタル従業員を簡単に作成・設定
- **統一管理**: すべてのエージェントを一元管理（状態監視・設定含む）
- **フローティング入力**: グローバルホットキーでフローティング入力ウィンドウを表示し、エージェントと素早く対話
- **ファイルドラッグ＆ドロップ**: txt、doc、docx、pdfファイルをドラッグ＆ドロップでアップロード、自動的に内容を解析して会話に統合
- **自動起動**: アプリ起動後にOpenClaw Gatewayを自動検出・起動

### 技術的特性
- **Electronデスクトップアプリ**: ネイティブデスクトップ体験を提供
- **Webインターフェース**: ブラウザ経由でのアクセスをサポート
- **TypeScript**: 型安全なコードベース
- **モジュール設計**: 新しいエージェントフレームワークの拡張・統合が容易
- **リアルタイム通信**: エージェントとのリアルタイム対話をサポート
- **ローカルファイル解析**: ローカルでファイル内容を解析し、トークン消費を節約

## クイックスタート

### 環境要件

- Node.js >= 20.0.0
- npm >= 10.0.0

### 依存関係のインストール

```bash
npm install
```

### 開発モードで実行

#### デスクトップアプリ

```bash
npm run dev
```

#### Webアプリ

```bash
npm run start:web
```

### アプリケーションのビルド

```bash
# TypeScriptのコンパイル
npm run build

# デスクトップアプリのパッケージ化
npm run dist
```

## プロジェクト構造

```
agentbrother/
├── docs/                   # ドキュメント
├── electron/               # Electronメインプロセスコード
│   ├── main.js            # メインプロセスエントリ
│   ├── preload.js         # プリロードスクリプト
│   └── renderer/          # レンダラプロセスコード
│       ├── index.html     # メインインターフェース
│       ├── styles.css     # スタイルファイル
│       ├── main.js        # レンダラメインロジック
│       ├── framework.js   # フレームワーク管理モジュール
│       ├── agents.js      # エージェント管理モジュール
│       ├── floatInput.js  # フローティング入力モジュール
│       └── settings.js    # 設定モジュール
├── src/                    # コアコード
│   ├── core/              # コア機能
│   │   ├── bridges/       # フレームワークブリッジ（OpenClaw、ZeroClaw）
│   │   └── types.ts       # 型定義
│   ├── web/               # Webサーバー
│   └── index.ts           # メインエントリ
├── ui/                     # ユーザーインターフェース
│   └── float-input/       # フローティング入力コンポーネント
├── dist/                   # TypeScriptコンパイル出力
├── package.json           # プロジェクト設定
├── tsconfig.json          # TypeScript設定
└── README.md              # プロジェクトドキュメント
```

## 使用ガイド

### AIデジタル従業員の作成

1. AgentBrotherアプリを開く
2. 左サイドバーで「エージェント」をクリック
3. エージェントフレームワーク（OpenClawまたはZeroClaw）を選択
4. 「新しいエージェントを作成」ボタンをクリック
5. エージェント名を入力、アイコンを選択、モデルパラメータを設定
6. 「保存」ボタンをクリックして作成完了

### エージェントとの対話

1. 左サイドバーで「フローティング入力」をクリック
2. 対話するエージェントを選択
3. 入力ボックスにメッセージを入力、またはファイルを入力エリアにドラッグ＆ドロップ
4. 送信ボタンをクリックまたはEnterキーを押す
5. エージェントの応答を待つ

### フローティング入力の使用

1. グローバルホットキーを押す（デフォルト `Cmd+Shift+A`）
2. フローティングウィンドウでメッセージを入力
3. Enterキーを押してメッセージを送信
4. エージェントの応答を表示

### ファイルドラッグ＆ドロップ機能

チャットエリアに以下のファイル形式をドラッグ＆ドロップできます：
- **.txt** - プレーンテキストファイル、内容を直接読み取り
- **.doc/.docx** - Wordドキュメント、mammoth.jsでテキストを抽出
- **.pdf** - PDFファイル、pdf-parseでテキストを抽出

ファイルサイズ制限：100KB

### 設定管理

1. 左サイドバーで「設定」をクリック
2. OpenClawとZeroClawフレームワークの状態を表示
3. 「Gatewayを起動」をクリックしてOpenClaw Gatewayを手動起動
4. アプリ起動時に自動検出・起動（インストール済みの場合）

## サポートされているプラットフォーム

- **Mac**: Electronアプリ経由（主要サポートプラットフォーム）
- **Windows**: Electronアプリ経由
- **Web**: ブラウザ経由のアクセス
- **モバイルデバイス**: Webインターフェース経由

## 設定

### フレームワーク設定

AgentBrotherはシステムにインストールされたOpenClawとZeroClawフレームワークを自動検出します：

- **OpenClaw**: パス `~/Documents/trae_projects/openclaw_test/openclaw.sh` を検出
- **ZeroClaw**: パス `~/Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw` を検出

### フローティング入力設定

設定でフローティング入力を設定できます：
- 有効/無効ステータス
- グローバルホットキー（デフォルト `Cmd+Shift+A`）
- 位置（左上、右上、左下、右下、中央）
- 透明度
- 常に最前面に表示

### 環境変数

- `ARK_API_KEY` - 火山エンジンAPIキー
- `OPENCLAW_CONFIG_PATH` - OpenClaw設定ファイルパス（オプション）

## 拡張

### 新しいエージェントフレームワークの追加

新しいエージェントフレームワークを追加するには、以下が必要です：

1. `src/core/bridges/` ディレクトリに新しいブリッジクラスを作成、`FrameworkBridge`を継承
2. すべての抽象メソッドを実装（detect、connect、disconnect、getAgents、sendMessageなど）
3. `src/index.ts` で新しいブリッジクラスを登録
4. `electron/renderer/agents.js` でフレームワーク固有の設定UIを追加

### サポートされているエージェントタイプ

AgentBrotherは複数のエージェントタイプをサポート：
- **chat** - チャット型エージェント
- **code** - コード型エージェント
- **image** - 画像型エージェント
- **video** - 動画型エージェント
- **audio** - 音声型エージェント
- **custom** - カスタム型エージェント

## 開発ガイド

### 技術スタック

- **フロントエンド**: HTML5、CSS3、JavaScript (ES6+)
- **デスクトップ**: Electron 33+
- **バックエンド**: Node.js、Express
- **型**: TypeScript 5+
- **ビルド**: electron-builder

### ファイル解析依存関係

- **mammoth** (^1.11.0) - .docxファイルを解析
- **pdf-parse** (^2.4.5) - .pdfファイルを解析

### 開発の注意点

1. **TypeScriptコンパイル**: `src/` ディレクトリのファイルを変更後、`npm run build` でコンパイル
2. **Electronメインプロセス**: `electron/main.js` を変更後、アプリを再起動
3. **レンダラプロセス**: `electron/renderer/` のファイルを変更後、ページを更新
4. **ファイル解析**: ファイル解析機能はNode.js環境に依存、Electronでのみ利用可能

## よくある質問

### Q: 起動時に「Electron APIが準備できていません」と表示される
A: これは正常な初期化シーケンスの問題です。アプリは1秒後に自動的に再試行します。継続して表示される場合は、Electronが正しく読み込まれているか確認してください。

### Q: OpenClaw Gatewayが自動起動できない
A: 以下を確認してください：
1. OpenClawがデフォルトパスにインストールされているか
2. `openclaw.sh` スクリプトに実行権限があるか
3. ポート18789が使用中でないか

### Q: ファイルドラッグ＆ドロップ機能が利用できない
A: ファイルドラッグ＆ドロップ機能はElectronデスクトップアプリでのみ利用可能で、Webバージョンではサポートされていません。

### Q: コンパイル時に型エラーが発生する
A: Node.js 20以上のバージョンを使用していること、`npm install` ですべての依存関係をインストールしていることを確認してください。

## 貢献

コードの貢献、問題の報告、改善の提案を歓迎します！

### 問題の報告

以下を記述してください：
- 問題の現象
- 再現手順
- 期待される動作
- 実際の動作
- 環境情報（OS、Node.jsバージョンなど）

### プルリクエストの送信

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MIT License

## 更新履歴

### v1.0.0
- 初期リリース
- OpenClawとZeroClawフレームワークのサポート
- フローティング入力機能の実装
- ファイルドラッグ＆ドロップ解析のサポート（txt、doc、docx、pdf）
- OpenClaw Gatewayの自動起動
- クロスプラットフォームサポート（Mac、Windows、Web）
