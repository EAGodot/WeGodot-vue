<template>


  <!-- 
    //注釋
    1. @contextmenu - 事件监听
    contextmenu 是浏览器的原生事件，当用户右键点击时触发
    @ 是 Vue 中 v-on: 的简写
    2. .prevent - 事件修饰符
    阻止浏览器的默认右键菜单
    等价于在方法中调用 event.preventDefault()
    3. openMenu($event, item) - 方法调用
    $event: Vue提供的特殊变量，代表原生事件对象
    item: 自定义参数，通常是当前操作的数据项行

    恢復默認右鍵功能兩點
    1、 <div id="app" @contextmenu.prevent="openMenu($event, item)"> --》 <div id="app">
    2、屏蔽
      //禁止右键
      //document.oncontextmenu = new Function("event.returnValue=false");
  -->

  <div id="app">

    <!--
    //注釋
    <router-view/> 是 Vue Router 的路由出口组件，相当于一个"占位符"，用于显示当前路由对应的组件内容。
    正常用法：
    <router-link to="/about">关于</router-link>
    <router-link to="/contact">联系</router-link>
    
    //主要内容区域 - 必须要有 router-view
    <main class="main-content">
      <router-view/>
      这里会动态显示：
            /dashboard → Dashboard组件
            /users     → UserManagement组件  
            /settings  → Settings组件
      
    </main>
    -->


    <router-view />

    <!-- 页脚 
    如果当前路由路径 不在 这个数组中，就显示页脚,哪些页面需要隐藏页脚
    $route.path 用于获取当前路由的路
    -->

    <div
      class="sf-my__footer"
      v-if="
        ![
          '/user',
          '/love',
          '/backendMain',
          '/webEdit',
          '/userList',
          '/postList',
          '/sortList',
          '/commentList',
          '/treeHoleList',
          '/resourceList',
          '/resourcePathList',
          '/loveList',
          '/prohibitedWordsList',
          '/verifyLogin',
          '/postEdit',
        ].includes($route.path)
      "
    >
       <!-- 使用自定義组件 -->
      <myFooter></myFooter>
    </div>

     <!-- 使用自定義组件:这是一个基于APlayer的Vue音乐播放器组件 -->
    <aplayer></aplayer>


    <!--
      這是一個基於 Vuex 狀態控制的加載動畫組件
      通過 Vuex 全局狀態 isShowLoading 控制顯示/隱藏    
    -->

    <div v-if="$store.state.isShowLoading" class="loading">
      <div class="author-box">
        <!-- 可能用於裝飾或動畫 -->
        <span></span>
        <div class="author-img">
          <img src="/title.jpg" alt="" />
        </div>
      </div>
      <div class="image-dot"></div>
    </div>


    
    <!-- 右键菜单部分
      1、v-show="visible"
      控制菜单的显示/隐藏
      visible 是一个布尔值数据
      当 visible 为 true 时显示菜单
      2、:style="{ left: left + 'px', top: top + 'px' }"
      动态定位菜单位置
      left 和 top 是数字类型的数据
      根据鼠标点击位置设置菜单坐标
      3、class="contextmenu"
      应用CSS样式类
      定义菜单的外观样式    
     -->

    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >

      <!--
        右侧工具栏或快捷操作菜单的代码，
        通常位于网页的右侧，提供常用的快捷操作功能

        鼠標右鍵快捷鍵，行
      -->

      <div class="rightMenu-group">
        <div class="rightMenu-item">
          <i class="fa fa-arrow-left" @click="backAndForward('2')"></i>
        </div>
        <div class="rightMenu-item">
          <i class="fa fa-arrow-right" @click="backAndForward('1')"></i>
        </div>
        <div class="rightMenu-item">
          <i class="fa fa-repeat" @click="refresh"></i>
        </div>
        <div class="rightMenu-item">
          <i class="fa fa-music" @click="musicHandle"></i>
        </div>
      </div>

      
      <!--
        鼠標右鍵快捷鍵，列
      -->
      <div class="rightMenu-group rightMenu-line">
        <p @click="$router.push('/')" class="rightMenu-item">
          <i class="fa fa-home"></i>
          <span>博客首页</span>
        </p>
        <p @click="dayAndNight" class="rightMenu-item">
          <i class="fa fa-adjust"></i>
          <span>昼夜切换</span>
        </p>
        <p @click="onCopy" class="rightMenu-item">
          <i class="fa fa-code-fork"></i>
          <span>加入我们</span>
        </p>
        <p @click="changeTheme" class="rightMenu-item">
          <i class="fa fa-image"></i>
          <span>美化设置</span>
        </p>
        <p @click="$router.push('/tags?labelId=15')" class="rightMenu-item">
          <i class="fa fa-bookmark"></i>
          <span>标签</span>
        </p>
        <p @click="$router.push('/sort?sortId=1')" class="rightMenu-item">
          <i class="fa fa-folder-open"></i>
          <span>分类</span>
        </p>
      </div>
    </ul>

  </div>
</template>





<script>
const myFooter = () => import("./views/common/footer.vue");
const aplayer = () => import("./views/common/aplayer.vue");



//Vue 组件的配置对象
export default {
  name: "App",
  components: {
    aplayer,
    myFooter,
  },

  data() {
    return {
      coorY: 0,
      rightClickItem: "",
      visible: false, // 是否展示右键菜单,如果是ture就會直接顯示在頁面上
      top: 0,
      left: 0,
      copyContent: "z-poemon",
    };
  },

  created() {
    window.CSS.registerProperty({
      name: "--p1",
      syntax: "<percentage>",
      inherits: false,
      initialValue: "0%",
    });


    // 黑夜
    if (localStorage.getItem("theme") == "false") {
      document.documentElement.dataset.theme = localStorage.getItem(
        "themeColor"
      )
        ? "theme2-dark"
        : "dark";
      if (document.documentElement.dataset.theme === "theme2-dark") {
        const root = document.querySelector(":root");
        root.style.setProperty(
          "--themeColor",
          localStorage.getItem("themeColor")
        );
        this.$common.getThemeRgb();
      }
    } else {
      if (localStorage.getItem("themeColor")) {
        const root = document.querySelector(":root");
        root.style.setProperty(
          "--themeColor",
          localStorage.getItem("themeColor")
        );
        this.$common.getThemeRgb();
        document.documentElement.dataset.theme = "theme2";
      } else {
        document.documentElement.dataset.theme = "light";
      }
    }
  },


  //mounted() {} 是 Vue 组件生命周期中一个非常重要的钩子函数，它在组件被挂载到 DOM 后调用
  mounted() {
    window.addEventListener("scroll", this.handleScroll); // 监听滚动条事件
    window.addEventListener("beforeunload", this.handleBeforeUnload);
    let styleTitle1 = `
font-size: 20px;
font-weight: 600;
color: rgb(244,167,89);
`;
    let styleTitle2 = `
font-size:12px;
color: #425AEF;
`;
    let styleContent = `
color: rgb(30,152,255);
`;
    let title1 =
      "ZJHの主页 被我发现了吧，既然你已经破解了，转发、拿东西记得标明出处喔~~";
    let title2 = `
    く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
██████╗ ██╗   ██╗║██████╗ 
██╔══██╗╚██╗ ██╔╝║██╔═══╗
██████╔╝ ╚████╔╝ ║██████║
██╔══██╗  ╚██╔╝  ║██╔═══╗
██████╔╝   ██║   ║██████║
╚═════╝    ╚═╝   ╚══════╝(wx:z-poemon)OVO
`;
    let content = `
誰もが信じ崇めてる
まさに最強で無敵のアイドル
弱点なんて見当たらない
一番星を宿している
弱いとこなんて見せちゃダメダメ
知りたくないとこは見せずに
唯一無二じゃなくちゃイヤイヤ
それこそ本物のアイ
  ⌜IDOL⌟
`;
    console.log(
      `%c${title1} %c${title2}
%c${content}`,
      styleTitle1,
      styleTitle2,
      styleContent
    );


    //this.$nextTick(() => {
      //禁止右键
      //document.oncontextmenu = new Function("event.returnValue=false");
    //});
  },




  beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    window.removeEventListener("scroll", this.handleScroll);
  },



  watch: {
    "$store.state.isShowLoading": {
      handler(value) {
        if (value) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      },
    },

    // 监听 visible，来触发关闭右键菜单，调用关闭菜单的方法
    visible(value) {
      if (value) {
        document.body.addEventListener("click", this.closeMenu);
      } else {
        document.body.removeEventListener("click", this.closeMenu);
      }
    },
  },



  
  methods: {
    // 打开右键菜单
    openMenu(e, item) {
      this.visible = true;
      this.top = e.pageY;
      this.left = e.pageX;
      this.rightClickItem = item;
    },
    // 关闭右键菜单
    closeMenu() {
      this.visible = false;
    },
    // 音乐跳转
    musicHandle() {
      window.open("https://www.zjh2002.icu/#/discover/recommend");
    },
    // 路由跳转
    backAndForward(val) {
      if (val === "1") {
        window.history.forward();
      } else {
        window.history.back();
      }
    },
    // 刷新
    refresh() {
      location.reload();
    },
    // 昼夜切换
    dayAndNight() {
      document.getElementById("changeColorRef").click();
      document.getElementById("switchBtnRef").checked =
        !document.getElementById("switchBtnRef").checked;
    },
    // 加入我们
    onCopy() {
      let input = document.createElement("input"); // 直接构建input
      input.value = this.copyContent; // 设置内容
      document.body.appendChild(input); // 添加临时实例
      input.select(); // 选择实例内容
      document.execCommand("Copy"); // 执行复制
      document.body.removeChild(input); // 删除临时实例
      this.$notify({
        title: "可以啦🍨",
        message: "本博主的微信已经到你的剪贴板啦，快加入我们吧~~🎉",
        type: "success",
        offset: 50,
        position: "top-left",
      });
    },
    // 美化设置
    changeTheme() {
      document.getElementById("changeThemeRef").click();
    },
    handleScroll() {
      // 屏幕剩余的高度
      let surplus =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      // 当前滑动高度
      let scrollY = document.documentElement.scrollTop;
      if (scrollY < 0) {
        scrollY = 0;
      }
      if (scrollY > 0) {
        this.visible = false;
      }
      // 当前位置百分比小数
      this.coorY = scrollY / surplus;
      this.$store.commit("topPercentage", Math.floor(this.coorY * 100));
      // 设置导航栏，这里使用NProgress.set() 动态更改进度条
      NProgress.set(this.coorY);
    },
    handleBeforeUnload() {
      this.$store.commit("topPercentage", 1);
    },
  },
};
</script>


<style lang="scss">
#nprogress {
  .bar {
    background: linear-gradient(to right, var(--green1), var(--red)) no-repeat !important;
    height: 5px !important;
  }
  .peg {
    box-shadow: 0 0 10px var(--transparent), 0 0 5px var(--transparent) !important;
  }
}
</style>
<style lang="scss" scoped>
.contextmenu {
  margin: 0;
  background: var(--white);
  z-index: 3000;
  position: absolute;
  width: 9rem;
  height: fit-content;
  border-radius: 12px;
  border: 1px solid var(--favoriteBg);
  font-size: 12px;
  font-weight: 700;
  color: var(--black5);
  transition: 0.3s ease;
  padding: 0 0.25rem;
}
.rightMenu-group {
  padding: 0.35rem 0.3rem;
  display: flex;
  justify-content: space-between;
  &:not(:nth-last-child(1)) {
    border-bottom: 1px dashed var(--miniMask);
  }
  .rightMenu-item {
    border-radius: 8px;
    transition: 0.3s ease;
    i {
      font-size: 15px;
      display: inline-block;
      text-align: center;
      line-height: 1.5rem;
      font-weight: 900;
      width: 1.5rem;
      padding: 0 0.25rem;
    }
    &:hover {
      background-color: var(--blue25);
      color: var(--white);
      box-shadow: 0 8px 12px -3px var(--miniMask);
    }
  }
}
.rightMenu-line {
  display: block;
  .rightMenu-item {
    margin: 0.25rem 0;
    padding: 0.25rem 0;
    display: flex;
    font-size: 15px;
    i {
      margin: 0 0.25rem;
    }
    span {
      line-height: 1.5rem;
      font-weight: 500;
    }
  }
}
a.rightMenu-item {
  color: var(--black5);
  text-decoration: none;
}
.loading {
  width: 100%;
  height: 100%;
  background: linear-gradient(55deg, var(--blue1) 20%, var(--green6) 100%);
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}
.author-box {
  position: relative;
  width: 159px;
  height: 159px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  &::before {
    content: "";
    position: absolute;
    width: 500px;
    height: 500px;
    background-image: conic-gradient(
      transparent,
      transparent,
      transparent,
      var(--purple1)
    );
    animation: animate 2s linear infinite;
    animation-delay: -1s;
  }
  &::after {
    content: "";
    position: absolute;
    width: 500px;
    height: 500px;
    background-image: conic-gradient(
      transparent,
      transparent,
      transparent,
      var(--blue2)
    );
    animation: animate 2s linear infinite;
  }
  span {
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: var(--favoriteBg);
    z-index: 1;
  }
  .author-img {
    margin: auto;
    border-radius: 50%;
    overflow: hidden;
    width: 150px;
    height: 150px;
    z-index: 10;
    background: var(--maxMaxWhiteMask);
    img {
      border-radius: 11px;
      margin-right: 4px;
      display: block;
      margin: 0 auto 20px;
      max-width: 100%;
      animation: breath 700ms ease-in-out infinite;
    }
  }
}
.image-dot {
  width: 25px;
  height: 25px;
  background: var(--green1);
  position: absolute;
  border-radius: 50%;
  border: 4px solid var(--favoriteBg);
  z-index: 20;
  transform: translate(51px, 54px);
}
@keyframes animate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes breath {
  from {
    opacity: 0.7;
  }
  25% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
  75% {
    opacity: 0.9;
  }
  to {
    opacity: 0.7;
  }
}
</style>
