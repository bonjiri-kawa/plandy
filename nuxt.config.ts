import { Configuration } from '@nuxt/types';
// import colors from 'vuetify/es5/util/colors';


const nuxtConfig: Configuration = {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'plandy',
    htmlAttrs: {
      lang: 'ja',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' }
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/composition-api',
    '@/plugins/vue2-google-maps',
    // '@/plugins/vuetify'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/vuetify'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    //safariで開くとホットリロード(無限リロード)のバグがあるので解決
    // filenames: {
    //   app: ({ isDev }) => isDev ? '[name].[hash].js' : '[chunkhash].js',
    //   chunk: ({ isDev }) => isDev ? '[name].[hash].js' : '[chunkhash].js'
    // },
    loaders: {
      // SCSSを扱う.
      scss: {
        // デフォルト値だと動かないので、sass(Dart Sass)で上書き.
        implementation: require('sass'),
        // sassのオプションにfibersを設定.
        sassOptions: {
          // fibersプロパティではないので注意. (ややこしい)
          fiber: require('fibers'),
        },
      },
    },
  },
}
module.exports = nuxtConfig
