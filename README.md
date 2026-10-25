# Durable Fantasy

灰の降る寒い町で暮らす、ブラウザの MMO RPG。

## 動かす

[公式手順](https://viteplus.dev/guide/global-cli)で Vite+ のグローバル CLI を導入し、シェルを開き直してから、次を実行する。Node とパッケージ管理の指定は `package.json` にある。

```sh
vp install --frozen-lockfile
vp run dev
```
型検査は `vp run typecheck`、テストは `vp run test`、lint は `vp run lint` で実行する。依存の管理は npm のロックファイルを維持し、操作の入口を vp に統一する。

Windows で `better-sqlite3` のソースビルドに失敗する場合は、Void が同梱する SQLite バイナリを使い、次の手順で必要な実行ファイルだけを準備する。`--ignore-scripts` はインストール時の全スクリプトを止めるため、後続の二つの処理も実行する。

```sh
vp install --frozen-lockfile --ignore-scripts
vp exec node node_modules/esbuild/install.js
vp exec node node_modules/workerd/install.js
```

`vp run dev` は Portless 経由で起動し、`portless.json` の名前でアクセスする。既存の共有プロキシがある環境では、その `PORTLESS_STATE_DIR`、`PORTLESS_PORT`、`PORTLESS_HTTPS` を同じシェルに設定する。既存プロキシの方式は変えず、他のアプリの経路を維持する。HTTP のプロキシなら URL は `http://durable-fantasy.localhost/` になる。Vite の待受ポートは Portless が割り当てる。
