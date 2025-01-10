# ベースイメージの選択
FROM node:18-slim as builder

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルのコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードのコピー
COPY . .

# プロダクションビルドの実行
RUN npm run build

# 実行環境の設定
FROM node:18-slim as runner

WORKDIR /app

# ビルド成果物のコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.js ./

# 本番環境の依存関係のみインストール
RUN npm install --production

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080

# ポートの公開
EXPOSE 8080

# アプリケーションの起動
CMD ["npm", "run", "preview"]