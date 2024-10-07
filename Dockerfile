# Node.js 16 のイメージを使用
FROM node:16

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

# ポート 3000 を公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "run", "start"]