# y

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


# 濱田メモ デプロイ方法
レンタルサーバーにデプロイする
```bash
# クライアントサイドレンダリングならこっち
$ npm run generate
```
生成されたdistをレンタルサーバーのplandyディレクトリに配置して完了

注意点：濱田のレンタルサーバーの場合はサブディレクトリにデプロイしているのでファイルの読み込みを早退パスで指定する必要がある。
nuxt.config.tsファイルに早退パスの設定を記載した。
base: {href: 'router.base'},
と
router: { base: '/plandy/' },
がそれにあたる。
