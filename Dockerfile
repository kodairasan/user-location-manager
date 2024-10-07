FROM node:18-alpine 

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存パッケージをインストール
RUN npm install

# プロジェクトのファイルをコピー
COPY . .

# プロダクションビルドを実行
RUN npm run build

# ポート 3000 と 8080 を公開
EXPOSE 3000 8080

# アプリケーションとWebSocketサーバーを起動
CMD ["sh", "-c", "npm run start & node websocket-server.js"]