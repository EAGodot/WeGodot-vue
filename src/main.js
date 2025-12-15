import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import http from "./utils/request";
import common from "./utils/common";
import constant from "./utils/constant";
import mavonEditor from "mavon-editor";



import axios from "axios"

import vue from "vue"
//axios.defaults.timeout=60000;

//進度條配置
//配置页面加载进度条
//showSpinner: false - 隐藏旋转动画
//minimum: 0 - 最小进度值


//设置动画效果和速度
NProgress.configure({ showSpinner: false });
NProgress.configure({ minimum: 0 });
NProgress.configure({ ease: "linear", speed: 100 });
import "./utils/title";

//引入css，加載靜態資源
import "./assets/css/index.css";
import "./assets/css/tocbot.css";
import "./assets/css/color.css";
import "./assets/css/markdown-highlight.css";
import "mavon-editor/dist/css/index.css";
import "./assets/css/icon.css";
//图标引入
import "./assets/css/font-awesome.min.css";
//图片跳动
import "./assets/css/animation.css";
//树洞
import { vueBaberrage } from "vue-baberrage";
//樱花
import "./utils/sakura.js";
//权限
import directive from "./directive"; // directive
Vue.use(directive);
Vue.use(ElementUI);
Vue.use(vueBaberrage);
Vue.use(mavonEditor);
Vue.prototype.$http = http;
Vue.prototype.$common = common;
Vue.prototype.$constant = constant;
Vue.config.productionTip = false;
// 修改 el-dialog 默认点击遮照不关闭
ElementUI.Dialog.props.closeOnClickModal.default = false;
new Vue({
  router, //路由配置
  store, //狀態管理
  render: (h) => h(App),//渲染函数
}).$mount("#app");//挂在到DOM
