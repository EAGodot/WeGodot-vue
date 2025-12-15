/* 先引入打包分析插件 */
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const cdn = {
  js: [
    //"https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vue/2.6.11/vue.min.js",
    //"https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vuex/3.6.2/vuex.min.js",
    //"https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/vue-router/3.2.0/vue-router.min.js",
    //"https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/axios/0.21.1/axios.min.js",   
    //"https://unpkg.zhimg.com/vue@2.6.14/dist/vue.min.js",
    //"https://unpkg.zhimg.com/axios@0.21.1/dist/axios.min.js"
    //"https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js",
    //"https://cdn.jsdelivr.net/npm/axios@0.21.1/dist/axios.min.js"

  ],
};
module.exports = {
  devServer: {

    disableHostCheck: true,   // 禁用主机检查 ,爲了適配ngrok反向代理服務
    allowedHosts: ['all'], 

    //https: false,  // 禁用 HTTPS

    // 关键修复：禁用热重载相关功能
    hot: false,               // 禁用热模块替换
    
    port: 81,
    proxy: {
      // 代理所有以 /api 开头的请求
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // 代理媒体文件
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // 代理静态文件
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // 代理管理员页面
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },



  configureWebpack: {
    plugins: [
      // 依赖大小分析工具
      new BundleAnalyzerPlugin(),
    ],
    //这就是在告诉Webpack：请不要将这个模块注入编译后的JS文件里，对于我源代码里出现的任何import/require这个模块的语句，请将它保留。
    externals: {
      //vue: "Vue",
      //"vue-router": "VueRouter",
      //vuex: "Vuex",
      //axios: "axios",
      echarts: "echarts", // 配置使用CDN
    },
  },


  lintOnSave: false,
  productionSourceMap: false, // 打包成 web页面 使用，一般建议 false，不然会生成很多map文件
  chainWebpack(config) {
    // 引入CDN
    // webpack需要排除的依赖名称和挂载在window上的对象属性名称
    config.set("externals", cdn.externals);
    config.plugin("html").tap((args) => {
      args[0].cdn = cdn;
      return args;
    });
  },
};
