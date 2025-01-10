FROM node:18-slim as builder

WORKDIR /app

# パッケージ関連ファイルのコピーと依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 本番環境用の軽量イメージ
FROM node:18-slim as runner

WORKDIR /app

# ビルド成果物と必要なファイルのコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.js ./

# 本番用の依存関係のインストール
RUN npm install --only=production

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# ヘルスチェックの待機時間を延長
ENV CLOUD_RUN_HEALTH_CHECK_INITIAL_DELAY=30s

# ポートの公開
EXPOSE 8080

# 起動コマンド
CMD ["npm", "run", "preview"]