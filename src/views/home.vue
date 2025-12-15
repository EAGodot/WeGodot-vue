<template>
  <div>
    <!-- el过渡动画 -->
    <transition name="el-fade-in-linear">
      <!-- 导航栏 -->
      <div
        v-show="toolbar.visible"
        @mouseenter="hoverEnter = true"
        @mouseleave="hoverEnter = false"
        :class="[
          { enter: toolbar.enter },
          {
            hoverEnter: hoverEnter && !toolbar.enter,
          },
        ]"
        class="toolbar-content myBetween"
      >
        <!-- 网站名称 -->
        <div @click="$router.push({ path: '/' })" class="toolbar-title">
          <h2>
            {{ $store.state.webInfo.webName }}
          </h2>
        </div>

        <!-- 手机抽屉按钮 - 只在移动端显示 -->
        <div
          v-if="$common.mobile()"
          class="toolbar-mobile-menu"
          @click="toolbarDrawer = !toolbarDrawer"
          :class="{ enter: toolbar.enter }"
        >
          <i class="el-icon-s-operation"></i>
        </div>

        <!-- PC端导航 - 只在PC端显示 -->
        <template v-if="!$common.mobile()">
          <div class="center-toolbar">
            <ul class="scroll-menu">
              <!-- 切片 -->
              <li>
                <span slot="reference" class="el-dropdown-link">
                  <li
                    @click="
                      $router.push({ 
                        path: '/bloglist', 
                        query: { mode: 'all' } 
                      })
                    "
                  >
                    <img
                      style="vertical-align: -3px"
                      src="../assets/svg/blog.svg"
                    />
                    切片
                  </li>
                </span>
              </li>

              <!-- 我的 -->
              <li>
                <el-popover
                  :visible-arrow="false"
                  transition="el-zoom-in-center"
                  close-delay="300"
                  popper-class="mk-popper"
                  placement="bottom"
                  trigger="hover"
                >
                  <div class="mk-popover_item">
                    <!-- 相册 -->
                    <li @click="$router.push({ path: '/travel' })">
                      📸 <span>相册</span>
                    </li>

                    <!-- 點點 -->
                    <li @click="$router.push({ path: '/bloglist', query: { mode: 'personal' } })">
                      🐷 <span>點點</span>
                    </li>

                    <li
                      @click="
                        $router.push({ path: '/blogedit', query: { labelId: 25 } })
                      "
                    >                  
                    <img
                      style="vertical-align: -5px"
                      src="../assets/svg/pencil.svg"
                    />
                    編輯
                    </li>
                  </div>
                  <span slot="reference" class="el-dropdown-link">
                    <img
                      style="vertical-align: -3px"
                      src="../assets/svg/home.svg"
                    />
                    我的
                  </span>
                </el-popover>
              </li>

              <!-- 文章 -->
              <li>
                <el-popover
                  :visible-arrow="false"
                  transition="el-zoom-in-center"
                  close-delay="300"
                  popper-class="mk-popper"
                  placement="bottom"
                  trigger="hover"
                >
                  <span slot="reference" class="el-dropdown-link">
                    <img
                      style="vertical-align: -3px"
                      src="../assets/svg/document.svg"
                    />
                    文章
                  </span>
                  <div class="mk-popover_item">
                    <!-- 分类 -->
                    <li @click="$router.push({ path: '/sort' })">
                      <img
                        style="vertical-align: -3px"
                        src="../assets/svg/sort.svg"
                      />
                      分类
                    </li>
                    <!-- 标签 -->
                    <li
                      @click="
                        $router.push({ path: '/tags', query: { labelId: 25 } })
                      "
                    >
                      <img
                        style="vertical-align: -3px"
                        src="../assets/svg/tag.svg"
                      />
                      标签
                    </li>
                  </div>
                </el-popover>
              </li>

              <!-- 空间 -->
              <li>
                <el-popover
                  :visible-arrow="false"
                  transition="el-zoom-in-center"
                  close-delay="300"
                  popper-class="mk-popper"
                  placement="bottom"
                  trigger="hover"
                >
                  <div class="mk-popover_item">
                    <!-- 音乐 -->
                    <li @click="$router.push({ path: '/funny' })">
                      <img
                        style="vertical-align: -3px"
                        src="../assets/svg/music.svg"
                      />
                      幻音坊
                    </li>
                    <!-- 藏宝阁 -->
                    <li @click="$router.push({ path: '/tools' })">
                      <img
                        style="vertical-align: -3px"
                        src="../assets/svg/treasure.svg"
                      />
                      藏宝阁
                    </li>
                  </div>
                  <span slot="reference" class="el-dropdown-link">
                    <img
                      style="vertical-align: -3px"
                      src="../assets/svg/space.svg"
                    />
                    空间
                  </span>
                </el-popover>
              </li>

              <!-- 社交 -->
              <li>
                <el-popover
                  :visible-arrow="false"
                  transition="el-zoom-in-center"
                  close-delay="300"
                  popper-class="mk-popper"
                  placement="bottom"
                  trigger="hover"
                >
                  <div class="mk-popover_item">
                    <!-- 留言厅 -->
                    <li @click="$router.push({ path: '/message' })">
                      ✍🏻 <span>留言厅</span>
                    </li>
                    <!-- 友链 -->
                    <li @click="$router.push({ path: '/friend' })">
                      🎀 <span>友链</span>
                    </li>
                  </div>
                  <span slot="reference" class="el-dropdown-link">
                    <img
                      style="vertical-align: -3px"
                      src="../assets/svg/socialContact.svg"
                    />
                    社交
                  </span>
                </el-popover>
              </li>

              <li>
                <span slot="reference" class="el-dropdown-link">
                  <li @click="openPcGame">🎮 <span>小游戏</span></li>
                </span>
              </li>

              <!-- 加入我們 -->
              <li>
                <span slot="reference" class="el-dropdown-link">
                  <li
                    @click="                       
                      $router.push({ 
                        path: '/survey', 
                        query: { mode: 'question' } 
                      })
                    "
                  >
                  <img
                    style="vertical-align: -3px"
                    src="../assets/svg/blog.svg"
                  />
                  加入我們
                  </li>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <ul class="scroll-menu">
              <!-- 切换背景 -->
              <li
                title="切换背景-换一种背景，换一种感觉。"
                id="changeThemeRef"
                style="color: var(--fontColor); font-size: 20px"
                @click="openChangeBg"
              >
                <div class="my-menu"><i class="fa fa-image"></i></div>
              </li>

              <!-- 关闭樱花 -->
              <li
                @click="handleSakura()"
                style="color: var(--fontColor); font-size: 21px"
              >
                <div class="my-menu"><i class="fa fa-pagelines"></i></div>
              </li>




              <!-- 关灯 -->
              <li
                style="transform: scale(0.16); width: 70px; height: 36px; display: flex; align-items: center; justify-content: center; margin-top: -8px;"
                class="my-menu"
              >
                <switchBtn
                  id="changeColorRef"
                  @click.native="changeColor"
                ></switchBtn>
              </li>



              <!-- 个人中心 -->
              <li>
                <el-dropdown hide-timeout="300" placement="bottom">
                  <el-avatar
                    class="user-avatar"
                    :size="36"
                    style="margin-top: 4px"
                    :src="
                      $store.state.currentUser.avatar
                        ? $store.state.currentUser.avatar
                        : $store.state.webInfo.avatar
                    "
                  >
                  </el-avatar>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      @click.native="$router.push({ path: '/user' })"
                      v-if="!$common.isEmpty($store.state.currentUser)"
                      class="user"
                    >
                      <i class="fa fa-user-circle" aria-hidden="true"></i>
                      <span>个人</span>
                    </el-dropdown-item>

                    <el-dropdown-item
                      @click.native="logout()"
                      v-if="!$common.isEmpty($store.state.currentUser)"
                      class="logout"
                    >
                      <i class="fa fa-sign-out" aria-hidden="true"></i>
                      <span>退出</span>
                    </el-dropdown-item>

                    <el-dropdown-item
                      @click.native="$router.push({ path: '/user' })"
                      v-if="$common.isEmpty($store.state.currentUser)"
                      class="login"
                    >
                      <i class="fa fa-sign-in" aria-hidden="true"></i>
                      <span>登录</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
            </ul>
          </div>
        </template>

        <!-- 移动端简化导航 - 只在移动端显示 -->
        <template v-else>
          <div class="mobile-toolbar">
            <ul class="mobile-scroll-menu">
              <!-- 主要功能按钮 -->
              <li @click="$router.push({ path: '/bloglist', query: { mode: 'all' } })">
                <img style="vertical-align: -3px" src="../assets/svg/blog.svg" />
                <span class="mobile-menu-text">切片</span>
              </li>

              <li @click="$router.push({ path: '/bloglist', query: { mode: 'personal' } })">
                <img style="vertical-align: -3px" src="../assets/svg/home.svg" />
                <span class="mobile-menu-text">我的</span>
              </li>

              <li @click="$router.push({ path: '/sort' })">
                <img style="vertical-align: -3px" src="../assets/svg/document.svg" />
                <span class="mobile-menu-text">文章</span>
              </li>

              <li @click="$router.push({ path: '/funny' })">
                <img style="vertical-align: -3px" src="../assets/svg/space.svg" />
                <span class="mobile-menu-text">空间</span>
              </li>

              <li @click="openPcGame">
                <span style="font-size: 18px">🎮</span>
                <span class="mobile-menu-text">游戏</span>
              </li>

              <!-- 加入我們 -->
              <li @click="$router.push({ path: '/survey', query: { mode: 'question' } })">
                <img style="vertical-align: -3px" src="../assets/svg/blog.svg" />
                <span class="mobile-menu-text">加入我們</span>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </transition>

    <!--内容填充区域-->
    <div id="main-container">
      <router-view></router-view>
    </div>

    <!-- 猫 -->
    <div
      href="#"
      class="cd-top"
      v-if="!$common.mobile()"
      @click="toTop()"
    ></div>

    <!-- 右下角按钮 -->
    <div class="toolButton">
      <!-- 火箭 -->
      <div
        class="backTop"
        v-if="$common.mobile() && toolButton"
        @click="toTop()"
      >
        <img src="../assets/svg/rocket.svg" />
      </div>

      <!-- 右下角切换按钮 -->
      <el-popover
        transition="el-zoom-in-top"
        :visible-arrow="false"
        placement="left"
        :close-delay="500"
        trigger="hover"
      >
        <!-- 旋转齿轮 -->
        <div slot="reference">
          <div class="button">
            <i
              class="fa fa-cog setting-color"
              aria-hidden="true"
              style="font-size: large"
            ></i>
          </div>
        </div>

        <!--进度条-->
        <div slot="reference">
          <div class="button" v-show="topPercentage < 98 && !topPercentageType">
            {{ topPercentage }}%
          </div>
        </div>

        <!-- 关灯 -->
        <div class="my-setting">
          <el-tooltip placement="top" effect="light">
            <!-- 雪花片 -->
            <div slot="content">想看雪花吗？(◕ᴗ◕✿)</div>
            <div>
              <i
                class="fa fa-snowflake-o"
                :class="{ active: mouseAnimation }"
                aria-hidden="true"
                @click="changeMouseAnimation()"
              ></i>
            </div>
          </el-tooltip>
        </div>
      </el-popover>
    </div>

    <!-- 点击动画 -->
    <canvas
      v-if="mouseAnimation"
      id="mousedown"
      style="
        position: fixed;
        left: 0;
        top: 0;
        pointer-events: none;
        z-index: 1000;
      "
    >
    </canvas>

    <!-- 移动端抽屉 -->
    <el-drawer
      :visible.sync="toolbarDrawer"
      :show-close="false"
      size="300px"
      custom-class="toolbarDrawer"
      direction="ltr"
      :modal-append-to-body="true"
      :append-to-body="true"
    >
      <div class="backdrop-color">
        <!-- 用户信息区域 -->
        <div class="sidebar is-center">
          <div class="avatar-img">
            <img :src="$store.state.currentUser.avatar ? $store.state.currentUser.avatar : $store.state.webInfo.avatar" />
          </div>
          <div class="author-info_name">
            {{ $common.isEmpty($store.state.currentUser) ? '『游客』' : `『${$store.state.currentUser.username}』` }}
          </div>
          <div class="author-info__description">
            {{ $common.isEmpty($store.state.currentUser) ? '请先登录' : '欢迎回来' }}
          </div>
          
          <!-- 登录/用户操作按钮 -->
          <div class="user-action-buttons">
            <el-button 
              v-if="$common.isEmpty($store.state.currentUser)"
              @click="smallMenu({ path: '/user' })"
              type="primary" 
              class="login-btn"
            >
              <i class="fa fa-sign-in"></i> 登录/注册
            </el-button>
            <div v-else class="user-actions">
              <el-button 
                @click="smallMenu({ path: '/user' })"
                type="primary" 
                class="profile-btn"
              >
                <i class="fa fa-user-circle"></i> 个人中心
              </el-button>
              <el-button 
                @click="smallMenuLogout"
                type="danger" 
                class="logout-btn"
              >
                <i class="fa fa-sign-out"></i> 退出登录
              </el-button>
            </div>
          </div>
        </div>

        <!-- 网站数据 -->
        <div class="site-data is-center">
          <div class="blog-info-box">
            <span>文章</span>
            <span class="blog-info-num">{{ $store.getters.articleTotal }}</span>
          </div>
          <div class="blog-info-box">
            <span>标签</span>
            <span class="blog-info-num">{{ $store.getters.labelInfo.length }}</span>
          </div>
          <div class="blog-info-box">
            <span>分类</span>
            <span class="blog-info-num">{{ $store.state.sortInfo.length }}</span>
          </div>
        </div>
        <hr />
        
        <!-- 扩展菜单 -->
        <div>
          <div class="small-menu">
            <div class="menu_item">
              <!-- 我的相关功能 -->
              <span @click="smallMenu({ path: '/travel' })">
                <span>📸</span>
                <span>相册</span>
              </span>
              
              <span @click="smallMenu({ path: '/bloglist', query: { mode: 'personal' } })">
                <img src="../assets/svg/home.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>點點</span>
              </span>
              
              <span @click="smallMenu({ path: '/blogedit', query: { labelId: 25 } })">
                <img src="../assets/svg/pencil.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>編輯</span>
              </span>

              <!-- 文章相关 -->
              <span @click="smallMenu({ path: '/sort' })">
                <img src="../assets/svg/sort.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>分类</span>
              </span>
              
              <span @click="smallMenu({ path: '/tags', query: { labelId: 25 } })">
                <img src="../assets/svg/tag.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>标签</span>
              </span>

              <!-- 空间相关 -->
              <span @click="smallMenu({ path: '/funny' })">
                <img src="../assets/svg/music.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>幻音坊</span>
              </span>
              
              <span @click="smallMenu({ path: '/tools' })">
                <img src="../assets/svg/treasure.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>藏宝阁</span>
              </span>

              <!-- 社交相关 -->
              <span @click="smallMenu({ path: '/message' })">
                <span>✍🏻</span>
                <span>留言厅</span>
              </span>
              
              <span @click="smallMenu({ path: '/friend' })">
                <span>🎀</span>
                <span>友链</span>
              </span>

              <!-- 其他功能 -->
              <span @click="openPcGame">
                <span>🎮</span>
                <span>小游戏</span>
              </span>
              
              <span @click="smallMenu({ path: '/survey', query: { mode: 'question' } })">
                <img src="../assets/svg/blog.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>加入我們</span>
              </span>

              <!-- 设置功能 -->
              <span @click="openChangeBg">
                <i class="fa fa-image"></i>
                <span>切换背景</span>
              </span>

              <span @click="handleSakura">
                <i class="fa fa-pagelines"></i>
                <span>樱花效果</span>
              </span>

              <span @click="changeColor">
                <i class="fa fa-adjust"></i>
                <span>关灯模式</span>
              </span>

              <span @click="EDIT">
                <img src="../assets/svg/pencil.svg" style="width: 14px; height: 14px; vertical-align: -2px;" />
                <span>编辑模式</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 小游戏 -->
    <el-dialog
      title="随机小游戏"
      :visible.sync="disGame"
      :modal-append-to-body="false"
      width="auto"
      align="center"
    >
      <div style="text-align: center">
        <iframe :src="game" style="width: 100%; height: 900px"></iframe>
      </div>
    </el-dialog>

    <!-- 修改背景对话框 -->
    <el-dialog
      custom-class="changeBgBox"
      title="切换背景"
      :visible.sync="changeBgBox"
      :modal="true"
      :modal-append-to-body="true"
      :append-to-body="true"
      :close-on-click-modal="false"
      :top="dialogTop"
      width="60%"
      align="left"
    >
      <div style="text-align: center">
        <button
          @click="defaultBtn"
          class="default-btn"
        >
          <i class="fa fa-refresh"></i>恢复默认主题
        </button>
        <div class="customImg">
          <div class="customImg-item">设置自定义背景</div>
          <el-input
            v-model="httpInput"
            type="text"
            id="pic-link"
            size="70%"
            maxlength="1000"
            placeholder="请输入有效的图片链接，如 https://source.fomal.cc/img/home_bg.webp"
          ></el-input>
          <button class="httpButton" @click="httpInputBtn">🌈切换背景🌈</button>
        </div>
        <div class="customImg">
          <div class="customImg-item" style="margin-bottom: 15px">
            设置主题色
          </div>
          <div class="color-box_contain">
            <div
              @click="setColor(item.color)"
              class="color-box"
              :class="{ active: themeActive === item.color }"
              :style="{ borderColor: item.varColor }"
              v-for="(item, i) in colorList"
              :key="i"
            >
              <div
                class="gun"
                :style="{ backgroundColor: item.varColor }"
              ></div>
              <div class="center">
                <div class="top" :style="{ color: item.varColor }">
                  {{ item.name }}
                </div>
                <div class="bottom" :style="{ color: item.varColor }">
                  {{ item.color }} | {{ item.rgb }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-for="(items, index) in themeMap" :key="index">
          <h2 style="color: var(--fontColor); text-align: left">
            {{ items.title }}
          </h2>
          <div style="display: flex; align-items: center">
            <span class="iconRotate showIcon">
              <i
                style="
                  display: flex;
                  height: 16px;
                  width: 16px;
                  color: var(--red);
                "
                class="iconfont icon-fengche"
              ></i>
            </span>
            <el-collapse @change="handleChangeBg(items.handleVal, index)">
              <el-collapse-item :title="items.collapseTitle" name="1">
                <div class="bgBox">
                  <a
                    @click="changeBg(item)"
                    v-for="(item, i) in items.dataList"
                    :key="i"
                    href="javascript:;"
                    :class="items.class"
                    :style="
                      items.style === 'img'
                        ? { backgroundImage: `url(${item})` }
                        : items.style === 'gradient'
                        ? { background: `linear-gradient(${item})` }
                        : { background: `${item}` }
                    "
                  ></a>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import mousedown from "../utils/mousedown";
const switchBtn = () => import("./common/switchBtn");

export default {
  components: {
    switchBtn,
  },
  data() {
    return {
      disGame: false,
      pcGameList: [1, 2, 3, 4, 5, 6, 7, 8],
      game: "http://game.eean.cn/pc/game",
      toolButton: false,
      hoverEnter: false,
      mouseAnimation: false,
      isDark: false,
      scrollTop: 0,
      toolbarDrawer: false,
      mobile: false,
      changeBgBox: false,
      editFlag: false,
      sakuraFlag: false,
      topPercentageType: false,
      themeMap: this.$constant.themeMapConfig,
      httpInput: "",
      themeActive: "",
      dialogTop: '15vh',
      colorList: [
        {
          name: "兔子坦克形态",
          color: "#04597b",
          rgb: "rgb(4,89,123)",
          rgba: "var(--sDarkBlueRgb)",
          varColor: "var(--sDarkBlue)",
        },
        {
          name: "鳄鱼恶霸形态",
          color: "#b04fe6",
          rgb: "rgb(176,79,230)",
          rgba: "var(--sPurpleRgb)",
          varColor: "var(--sPurple)",
        },
        {
          name: "巨龙熔岩形态",
          color: "#ff7500",
          rgb: "rgb(255, 117, 0)",
          rgba: "var(--sOrangeRgb)",
          varColor: "var(--sOrange)",
        },
        {
          name: "向日癸形态",
          color: "#ffa500",
          rgb: "rgb(255,165,0)",
          rgba: "var(--sYellowRgb)",
          varColor: "var(--sYellow)",
        },
        {
          name: "自然精灵形态",
          color: "#6bdf8f",
          rgb: "rgb(107,223,143)",
          rgba: "var(--sGreenRgb)",
          varColor: "var(--sGreen)",
        },
        {
          name: "锦鲤粉形态",
          color: "#ec695c",
          rgb: "rgb(236,105,92)",
          rgba: "var(--sRedRgb)",
          varColor: "var(--sRed)",
        },
        {
          name: "中国红形态",
          color: "#d61010",
          rgb: "rgb(214, 16, 16)",
          rgba: "var(--sBigRedRgb)",
          varColor: "var(--sBigRed)",
        },
        {
          name: "至尊龙形态",
          color: "#425aef",
          rgb: "rgb(66, 90, 239)",
          rgba: "var(--sBlueRgb)",
          varColor: "var(--sBlue)",
        },
      ],
    };
  },

  mounted() {
    console.log('=== 背景状态调试 ===')
    console.log('当前背景:', this.$store.state.changeBg)
    console.log('localStorage背景:', localStorage.getItem('vuex'))
    console.log('页面URL:', window.location.href)

    //默认关闭樱花
    this.handleSakura();
    if (localStorage.getItem("theme") == null) {
      localStorage.setItem("theme", true);
    }
    if (this.mouseAnimation) {
      mousedown();
    }
    window.addEventListener("scroll", this.onScrollPage);
    // 关灯
    if (localStorage.getItem("theme") == "false") {
      this.isDark = false;
    } else {
      this.isDark = true;
    }
    this.changeBg();

    // 检查是否是初始状态
    this.checkInitialState();
    
    // 调整对话框位置
    this.adjustDialogPosition();
  },

  beforeDestroy() {
    window.removeEventListener("scroll", this.onScrollPage);
  },

  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (to.path == "/funny") {
          this.topPercentageType = true;
        } else {
          this.topPercentageType = false;
        }
      },
    },

    scrollTop(scrollTop, oldScrollTop) {
      //如果滑动距离超过屏幕高度三分之一视为进入页面，背景改为蓝色
      let enter = scrollTop > window.innerHeight / 2;
      const top = scrollTop - oldScrollTop < 0;
      let isShow = scrollTop - window.innerHeight > 30;
      this.toolButton = isShow;
      
      // 移动端也支持回到顶部按钮
      if (isShow && !this.$common.mobile()) {
        if (window.innerHeight > 950) {
          $(".cd-top").css("top", "0");
        } else {
          $(".cd-top").css("top", window.innerHeight - 950 + "px");
        }
      } else if (!isShow && !this.$common.mobile()) {
        $(".cd-top").css("top", "-900px");
      }
      
      //导航栏显示与颜色
      let toolbarStatus = {
        enter: enter,
        visible: top,
      };
      this.$store.commit("changeToolbarStatus", toolbarStatus);
    },
  },

  created() {
    let toolbarStatus = {
      enter: false,
      visible: true,
    };
    this.$store.commit("changeToolbarStatus", toolbarStatus);
    this.getWebInfo();
    this.getSortInfo();
    
    // 移动端检测
    this.mobile = this.$common.mobile() || document.body.clientWidth < 600;
    window.addEventListener("resize", () => {
      let docWidth = document.body.clientWidth;
      this.mobile = this.$common.mobile() || docWidth < 600;
      this.adjustDialogPosition();
    });
  },

  computed: {
    toolbar() {
      return this.$store.state.toolbar;
    },
    topPercentage() {
      return this.$store.state.top;
    },
  },

  methods: {
    adjustDialogPosition() {
      if (this.$common.mobile()) {
        // 移动端根据屏幕高度动态计算位置
        const screenHeight = window.innerHeight;
        if (screenHeight < 700) {
          this.dialogTop = '30vh'; // 小屏幕设备向下移动更多
        } else if (screenHeight < 800) {
          this.dialogTop = '25vh'; // 中等屏幕
        } else {
          this.dialogTop = '20vh'; // 大屏幕
        }
      } else {
        this.dialogTop = '15vh'; // PC端
      }
    },

    openChangeBg() {
      this.adjustDialogPosition();
      this.changeBgBox = true;
    },

    checkInitialState() {
      // 检查 Vuex 是否被重置
      const vuexState = localStorage.getItem('vuex')
      if (!vuexState) {
        console.log('Vuex 状态为空，使用默认值')
      } else {
        const parsed = JSON.parse(vuexState)
        console.log('持久化的背景:', parsed.changeBg)
      }
    },

    setColor(color) {
      this.themeActive = color;
      const root = document.querySelector(":root");
      root.style.setProperty("--themeColor", color);
      this.$common.getThemeRgb();
      document.documentElement.dataset.theme =
        localStorage.getItem("theme") === "false" ? "theme2-dark" : "theme2";
      localStorage.setItem("themeColor", color);
    },

    openRandomArticle() {
      const articleTotal = this.$store.state.articleTotal;
      const random = Math.floor(Math.random() * articleTotal) + 12;
      this.$router.push({ path: "/article", query: { id: random } });
    },

    async httpInputBtn() {
      if (this.httpInput.length === 0) {
        return this.$notify({
          title: "链接不对🤣",
          message: "请输入有效的图片链接！",
          type: "warning",
          offset: 50,
          position: "top-left",
        });
      }

      const status = await this.$common.isValidHttpUrl(this.httpInput);
      if (status) {
        this.changeBg(this.httpInput);
        this.$notify({
          title: "可以啦🍨",
          message: "切换自定义背景成功",
          type: "success",
          offset: 50,
          position: "top-left",
        });
        this.httpInput = "";
      } else {
        this.$notify({
          title: "链接不对🤣",
          message: "请输入有效的图片链接！",
          type: "warning",
          offset: 50,
          position: "top-left",
        });
      }
    },

    handleSakura() {
      if (this.sakuraFlag) {
        window.startSakura();
        this.sakuraFlag = false;
      } else {
        const dom = document.querySelector("#canvas_sakura");
        this.sakuraFlag = true;
        if (dom) {
          dom.remove();
        }
      }
    },

    smallMenu(data) {
      this.$router.push(data);
      this.toolbarDrawer = false;
    },

    smallMenuLogout() {
      this.logout();
      this.toolbarDrawer = false;
    },

    goIm() {
      if (this.$common.isEmpty(this.$store.state.currentUser)) {
        this.$notify({
          type: "error",
          title: "可恶🤬",
          message: "请先登录！",
          position: "top-left",
          offset: 50,
        });
      } else {
        let userToken = this.$common.encrypt(localStorage.getItem("userToken"));
        window.open(this.$constant.imBaseURL + "?userToken=" + userToken);
      }
    },

    logout() {
      this.$notify({
        title: "可以啦🍨",
        message: "退出登录成功！",
        type: "success",
        offset: 50,
        position: "top-left",
      });
      this.$store.commit("loadCurrentUser", {});
      localStorage.removeItem("userToken");
      this.$router.push({ path: "/" });
    },

    getWebInfo() {
      this.$http
        .get(this.$constant.baseURL + "/webInfo/getWebInfo")
        .then((res) => {
          console.log('=== 修正后的调试 ===');
          console.log('完整res:', res);
          console.log('res.result:', res.result);
          console.log('res.result[0]:', res.result?.[0]);
          console.log('res.result[0].data:', res.result?.[0]?.data);
          console.log('res.result[0].data[0]:', res.result?.[0]?.data?.[0]);
          
          if (res.result && !this.$common.isEmpty(res.result[0])) {
            const webInfo = res.result[0].data[0];
            console.log('找到网站信息:', webInfo);
            this.$store.commit("loadWebInfo", webInfo);
          } else {
            console.warn('网站信息数据为空或格式不正确');
          }
        })
        .catch((error) => {
          console.error('请求错误:', error);
          this.$notify({
            type: "error",
            title: "可恶???🤬",
            message: error.message,
            position: "top-left",
            offset: 50,
          });
        });
    },

    getSortInfo() {
      this.$http
        .get(this.$constant.baseURL + "/webInfo/getSortInfo/")
        .then((res) => {
          if (!this.$common.isEmpty(res.result[0])) {
            const sortInfo = res.result[0].data.filter((item) => {
              return item.id !== 11;
            });
            this.$store.commit("loadSortInfo", sortInfo);
          }
        })
        .catch((error) => {
          this.$notify({
            type: "error",
            title: "可恶🤬",
            message: error.message,
            position: "top-left",
            offset: 50,
          });
        });
    },

    changeColor() {
      this.isDark = !this.isDark;
      localStorage.setItem("theme", this.isDark);
      if (!this.isDark) {
        document.documentElement.dataset.theme = localStorage.getItem(
          "themeColor"
        )
          ? "theme2-dark"
          : "dark";
        if (document.documentElement.dataset.theme === "theme2-dark") {
          const root = document.querySelector(":root");
          root.style.setProperty("--themeColor", "var(--sYellow)");
          localStorage.setItem("themeColor", "#ffc848");
          this.$common.getThemeRgb();
        }
        this.$notify({
          title: "可以啦🍨",
          message: "是要关灯睡觉了吗~~~",
          type: "success",
          offset: 50,
          position: "top-left",
        });
      } else {
        document.documentElement.dataset.theme = localStorage.getItem(
          "themeColor"
        )
          ? "theme2"
          : "light";
        if (document.documentElement.dataset.theme !== "theme2-dark") {
          const root = document.querySelector(":root");
          root.style.setProperty("--themeColor", "var(--sBlue)");
          localStorage.setItem("themeColor", "#425aef");
          this.$common.getThemeRgb();
        }
      }
    },

    toTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    
    onScrollPage() {
      this.scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
    },

    changeMouseAnimation() {
      this.mouseAnimation = !this.mouseAnimation;
      if (this.mouseAnimation) {
        this.$nextTick(() => {
          mousedown();
        });
      }
    },

    openPcGame() {
      this.disGame = true;
      let index = Math.floor(Math.random() * this.pcGameList.length);
      if (index === 0 || index === 1) {
        index = 6;
      }
      this.game = "http://game.eean.cn/pc/game" + index++;
    },

    changeBg(item) {
      console.log('changebg: oooo');
      if (!item && !JSON.parse(localStorage.getItem("vuex")).changeBg) {
        console.log('changebg: aa');
        const dom = document.querySelector(".background-image-changeBg");
        const storeInfo = this.$store.state.changeBg;
        const string = storeInfo.split("#");
        if (string[0] === "") {
          dom.setAttribute(
            "style",
            `background-color: ${this.$store.state.changeBg}`
          );
        } else if (string.length === 1) {
          dom.setAttribute(
            "style",
            `background-image: ${this.$store.state.changeBg};background-size: cover;background-attachment: local;background-position: center;width: 100%;height: 100%;`
          );
        } else {
          dom.setAttribute(
            "style",
            `background-image: ${this.$store.state.changeBg}`
          );
        }
      } else if (item) {
        console.log('changebg: bb');
        const dom = document.querySelector(".background-image-changeBg");
        const string = item.split("#");
        if (string[0] === "") {
          this.$store.commit("changeBgBox", item);
          dom.setAttribute(
            "style",
            `background-color: ${this.$store.state.changeBg}`
          );
        } else if (string.length === 1) {
          const changeBgUrl = "url(" + item + ")";
          this.$store.commit("changeBgBox", changeBgUrl);
          dom.setAttribute(
            "style",
            `background-image: ${this.$store.state.changeBg};background-size: cover;background-attachment: local;background-position: center;width: 100%;height: 100%;`
          );
        } else {
          const changeBgUrl = "linear-gradient(" + item + ")";
          this.$store.commit("changeBgBox", changeBgUrl);
          dom.setAttribute(
            "style",
            `background-image: ${this.$store.state.changeBg}`
          );
        }
      }
    },

    defaultBtn() {
      document.documentElement.dataset.theme = "light";
      localStorage.removeItem("themeColor");
      const dom = document.querySelector(".background-image-changeBg");
      dom.setAttribute(
        "style",
        "background-image: url(https://www.qiniuyun.monkey-papa.icu/images/changeBg3);background-size: cover;background-attachment: local;background-position: center;width: 100%;height: 100%;"
      );
      this.$store.commit(
        "changeBgBox",
        "url(https://www.qiniuyun.monkey-papa.icu/images/changeBg3)"
      );
    },

    handleChangeBg(val, i) {
      if (val === "pc" && this.themeMap[i].dataList.length === 0) {
        this.getAllBg(i);
      }
      if (val === "mobile" && this.themeMap[i].dataList.length === 0) {
        const pagination = {
          current: 1,
          size: 999,
          total: 0,
          resourceType: "mobilePhoto",
        };
        this.$http
          .post(
            this.$constant.baseURL + "/resource/listResource/",
            pagination,
            true
          )
          .then((res) => {
            if (!this.$common.isEmpty(res.result[0])) {
              res.result[0].records.forEach((item) => {
                this.themeMap[i].dataList.push(item.path);
              });
            }
          })
          .catch((error) => {
            this.$notify({
              type: "error",
              title: "可恶🤬",
              message: error.message,
              position: "top-left",
              offset: 50,
            });
          });
      }
      if (val === "gradient") {
        this.themeMap[i].dataList = this.$constant.gradient;
      }
      if (val === "solid") {
        this.themeMap[i].dataList = this.$constant.SolidColor;
      }
    },

    getAllBg(i) {
      const pagination = {
        current: 1,
        size: 999,
        total: 0,
        resourceType: "webBackgroundImage",
      };
      this.$http
        .post(
          this.$constant.baseURL + "/webInfo/allWebBackgroundImage/",
          pagination,
          true
        )
        .then((res) => {
          if (!this.$common.isEmpty(res.result[0])) {
            res.result[0].records.forEach((item) => {
              this.themeMap[i].dataList.push(item.path);
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: "error",
            title: "可恶🤬",
            message: error.message,
            position: "top-left",
            offset: 50,
          });
        });
    },

    EDIT() {
      if (this.editFlag) {
        this.$notify({
          title: "可以啦🍨",
          message: "已关闭编辑！！",
          type: "success",
          offset: 50,
          position: "top-left",
        });
        document.body.contentEditable = "false";
        this.editFlag = false;
        return;
      }
      this.$notify({
        title: "可以啦🍨",
        message: "可以随意修改本站的文字喔~~~不要干坏事！！",
        type: "success",
        offset: 50,
        position: "top-left",
      });
      document.body.contentEditable = "true";
      this.editFlag = true;
    },
  },
};
</script>

<style lang="scss">
.mk-popper {
  border-radius: 100px;
  padding: 6px 4px;
  background: var(--blue);
}
.popper__arrow {
  display: none !important;
}

.small-menu {
  .el-dropdown-link {
    display: flex;
    align-items: center;
    font-size: 14px;
    img {
      width: 14px;
      height: 14px;
    }
    span {
      color: var(--red);
      margin-left: 6px;
    }
  }
  .menu_item {
    flex-wrap: wrap;
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-top: 8px;
    .my-menu {
      font-size: 15px;
      line-height: 27px;
      img {
        width: 15px;
        height: 15px;
      }
    }
    > span {
      width: calc(50% - 6px);
      margin: 0;
      border: 1px solid var(--blue);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 8px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      color: #2c3e50 !important;
      
      &:hover {
        border: 1px solid var(--red);
        background: var(--red);
        color: var(--white) !important;
        transform: translateY(-2px);
      }
      
      img, span, i {
        margin: 0 2px;
      }
    }
  }
}

.mk-popover_item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  li {
    list-style: none;
    padding: 8px;
    font-size: 16px;
    color: var(--red);
    cursor: pointer;
    &:hover {
      background: var(--red);
      color: var(--white);
      padding: 8px;
      border-radius: 100px;
      animation: slide-top 0.5s ease-in-out both;
    }
  }
}
.customImg {
  font-size: 18px;
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  &-item {
    color: var(--blue6);
  }
  .color-box_contain {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    .color-box {
      font-size: 14px;
      width: 49%;
      padding: 9px 10px 9px 4px;
      display: flex;
      align-items: center;
      border: 2px dashed;
      border-radius: 0.5rem;
      margin-bottom: 10px;
      transition: all 0.3s ease;
      position: relative;
      cursor: pointer;
      &.active:before {
        position: absolute;
        right: 8px;
        bottom: 22px;
        font-size: 24px;
        content: "🌻";
        transform: scale(1);
      }
      &:hover {
        transform: scale(0.9);
      }
      .gun {
        width: 8px;
        height: 50px;
        border-radius: 0.375rem;
      }
      .center {
        padding-left: 10px;
        .top {
          font-weight: 400;
          line-height: 24px;
          text-align: left;
          margin-bottom: 4px;
        }
        .bottom {
          font-weight: 400;
          line-height: 24px;
        }
      }
    }
  }
}
.el-popper[x-placement^="bottom"] {
  margin-top: -6px;
}
.httpButton {
  margin: 10px auto 0;
  background: var(--blue5);
  display: block;
  width: 25%;
  padding: 15px 0;
  border-radius: 30px;
  color: var(--white2);
  border: none;
  font-size: 15px;
  cursor: pointer;
  &:hover {
    background-color: var(--orange4);
    transition: all 0.3s ease;
  }
}
.setting-color {
  color: var(--bigRed);
  animation: rotate 4s linear infinite;
}
.toolbar-content {
  padding: 0 40px;
  top: 0;
  width: 100%;
  height: 50px;
  color: var(--red);
  position: fixed;
  z-index: 99999;
  user-select: none;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &.enter {
    background: var(--background);
    color: var(--red);
    box-shadow: 0 1px 3px 0 var(--miniMask);
  }
  &.hoverEnter {
    background: var(--background);
    box-shadow: 0 1px 3px 0 var(--miniMask);
  }
}
.toolbar-title {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  height: 50px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--red);
    color: var(--red);
    border-radius: 8px;
    &:after {
      opacity: 1;
      transform: translateY(0) scale(0.3);
      transition-timing-function: ease-in;
    }
  }
  &:after {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABgUExURUxpcf///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////05o8T8AAAAfdFJOUwCqxd+3iU1VQL+Uz7IrG+mO5TN4EVrvRditZp8S9oBdLCSzAAABAUlEQVRYw+3WyRKCMAyA4bKjgLjv2vd/S5FBIF2T9OKBXMP/DTidsUI4J4/rXARMIbspAvsAYejZwtgzhVnPEkDPEJSeLGg9UTD0JMHYEwRLjxasPVJw9CjB2SMET+8VvL1HQPROAdU7BGRvFdC9RSD0RoHUGwRirwnkXhEYPRBY/Uxg9qPA7gchoO+FXMowQQaOiMP6WFx2IX1Sdr9i+R1622fTWWJ8PJwFWIAF+F+g2pbjHFI6kMH9gxpE6r9vRgT2KtAQgaN2gUhogH4DWS2AD4jgttWBGj6RKus7XK91QDlJJ3UPT/tTBzbukyrE+/pbntPGdJXd3NrhgVc1veEHPLUmePVAutQAAAAASUVORK5CYII=)
      no-repeat 50% 50%;
    opacity: 0;
    position: absolute;
    z-index: 1;
    width: 75px;
    height: 58px;
    content: "";
    transition: 0.3s;
    transition-timing-function: ease-in;
    transform: scale(0.4);
  }
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
  }
}
.toolbar-mobile-menu {
  font-size: 30px;
  margin-right: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    color: var(--orange2);
  }
}

/* PC端导航样式 */
.center-toolbar {
  flex: 1;
  display: flex;
  justify-content: center;
}

.scroll-menu {
  color: var(--red1);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0;
  margin: 0;
  
  > li {
    list-style: none;
    margin-right: 24px;
    font-size: 17px;
    height: 50px;
    line-height: 50px;
    position: relative;
    text-decoration: none;
    background: var(--gradientAnimation);
    background-size: 0px 3px;
    transition: background-size 800ms;
    cursor: pointer;
    
    &:hover {
      color: var(--orange2);
      background-position-x: left;
      background-size: 100% 3px;
    }
    &:last-child {
      margin-right: 0;
    }
  }
}

/* 移动端导航样式 */
.mobile-toolbar {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-scroll-menu {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 0;
  margin: 0;
  
  > li {
    list-style: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px 8px;
    font-size: 12px;
    color: var(--red);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--orange2);
      transform: translateY(-2px);
    }
    
    img {
      width: 20px;
      height: 20px;
      margin-bottom: 2px;
    }
  }
}

.mobile-menu-text {
  font-size: 10px;
  white-space: nowrap;
  font-weight: 500;
}

/* 移动端抽屉用户操作按钮样式 */
.user-action-buttons {
  margin-top: 20px;
  padding: 0 20px;
  
  .el-button {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 20px;
    font-size: 14px;
    padding: 12px 0;
    cursor: pointer;
    
    i {
      margin-right: 8px;
    }
  }
  
  .user-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .login-btn {
    background: linear-gradient(45deg, var(--blue), var(--blue5));
    border: none;
  }
  
  .profile-btn {
    background: linear-gradient(45deg, var(--green), var(--green2));
    border: none;
  }
  
  .logout-btn {
    background: linear-gradient(45deg, var(--red), var(--bigRed));
    border: none;
     margin-left: -0px;
  }
}

.el-dropdown {
  font-size: unset;
  color: unset;
  &-menu {
    align-items: center;
    border-radius: 13px;
    padding: 6px;
    border: 0;
    background: var(--blue);
    &__item {
      font-size: unset;
      line-height: 26px;
      padding: 10px;
      color: var(--red);
      cursor: pointer;
      
      &:hover {
        border-radius: 8px;
        animation: slide-top 0.5s ease-in-out both;
        background-color: var(--red);
        color: var(--white);
      }
    }
    &.active {
      display: flex;
    }
  }
}
.toolButton {
  position: fixed;
  right: 3vh;
  bottom: 3vh;
  animation: slide-bottom 0.5s ease-in-out both;
  z-index: 100;
  font-size: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.my-setting {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  font-size: 20px;
  i {
    padding: 5px;
    color: var(--white);
    cursor: pointer;
    
    &:hover {
      color: var(--bigRed2);
    }
  }
  .active {
    color: var(--orange3);
  }
}
.user:hover {
  color: var(--white);
}
.login:hover {
  color: var(--white);
}
.logout:hover {
  color: var(--white);
}
.cd-top {
  background: var(--toTop) no-repeat center;
  position: fixed;
  right: 5vh;
  top: -900px;
  z-index: 99;
  width: 70px;
  height: 900px;
  background-size: contain;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
}
.backTop {
  transition: all 0.3s ease-in;
  position: relative;
  top: 0;
  left: -4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--blue3);
  border-radius: 10px;
  
  &:hover {
    top: -10px;
    background: var(--orange4);
  }
  
  img {
    width: 24px;
    height: 24px;
  }
}

/* 修复抽屉和对话框的层级问题 */
.toolbarDrawer {
  z-index: 2000 !important;
  
  .el-drawer__container {
    z-index: 2000 !important;
  }
}

.changeBgBox {
  z-index: 3000 !important;
  
  /* 确保对话框背景遮罩在最上层 */
  .v-modal {
    z-index: 2999 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
  }
  
  /* 对话框内容样式 */
  .el-dialog {
    z-index: 3000 !important;
    position: relative;
    background: var(--favoriteBg);
    border-radius: 14px;
    overflow: hidden;
    
    &__header {
      background: var(--blue9) !important;
      border-radius: 14px 14px 0 0;
      padding: 15px 20px;
      
      .el-dialog__title {
        color: var(--white) !important;
        font-weight: bold;
      }
      
      .el-dialog__headerbtn {
        top: 15px;
        
        .el-dialog__close {
          color: var(--white) !important;
          font-size: 20px;
        }
      }
    }
    
    &__body {
      background: var(--favoriteBg);
      border-radius: 0 0 14px 14px;
      max-height: 70vh;
      overflow-y: auto;
      padding: 20px;
      
      /* 自定义滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: var(--gray5);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--blue);
        border-radius: 3px;
      }
    }
  }
}

/* 确保抽屉打开时，对话框能够正确显示 */
.el-drawer__wrapper {
  z-index: 2000;
}

.is-center {
  text-align: center;
}
.sidebar {
  background-image: var(--toolbar);
  background-position: top;
  background-size: 120%;
  background-repeat: no-repeat;
  padding: 20px 0;
}
.avatar-img {
  overflow: hidden;
  margin: 0 auto;
  width: 110px;
  height: 110px;
  border-radius: 25px;
  box-shadow: 2.2px 2.2px 2.2px var(--toolbarBackground);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.author-info_name {
  margin-top: 10px;
  color: #2c3e50 !important;
  font-weight: 800;
  font-size: 25.2px;
}

.author-info__description {
  color: #666 !important;
  margin-top: 20px;
  font-size: 18px;
  padding-bottom: 8px;
}

.site-data {
  margin-top: 20px;
  color: #2c3e50 !important;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.blog-info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  
  span {
    color: #2c3e50 !important;
  }
}
.blog-info-num {
  margin-top: 12px;
  font-weight: bold;
  font-size: 18px;
  color: var(--blue) !important;
}
hr {
  position: relative;
  margin: 20px auto 10px;
  border: 2px dashed var(--blue);
  overflow: visible;
  
  &:before {
    position: absolute;
    top: -21px;
    left: 5%;
    color: var(--red);
    content: "\e673";
    font-size: 40px;
    line-height: 1;
    transition: all 1s ease-in-out;
    font-family: iconfont;
  }
  &:hover:before {
    left: calc(95% - 20px);
  }
}

/* 背景选择区域样式优化 */
.bgBox {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  
  .box {
    width: calc(33.333% - 10px);
    margin: 0;
    height: 100px;
    border-radius: 8px;
    border: 2px solid transparent;
    background-size: cover;
    background-position: center;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
      border-color: var(--blue);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  .mobileBox {
    height: 120px;
  }
}
.button {
  opacity: 0.6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-size: 15px;
  z-index: 20;
  position: relative;
  background-color: var(--blue3);
  color: var(--bigRed);
  text-align: center;
  line-height: 35px;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}
::v-deep #pic-link {
  margin: 15px auto 0;
  width: 80%;
  border-radius: 30px;
  border: 1px solid var(--blue6);
  padding: 5px 10px 5px 10px;
  line-height: 2;
  outline: 1px solid var(--blue6);
  
  &:hover {
    outline-color: var(--blue5);
    border-color: var(--blue5);
  }
  &:focus {
    outline-color: var(--blue5);
    border-color: var(--blue5);
  }
}
::v-deep .el-drawer__header {
  padding: 0;
  margin: 0;
}

/* 颜色选择区域样式优化 */
.color-box_contain {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  .color-box {
    width: calc(50% - 10px);
    padding: 12px;
    display: flex;
    align-items: center;
    border: 2px solid;
    border-radius: 8px;
    margin: 0;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &.active {
      border-color: var(--red) !important;
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      &:before {
        position: absolute;
        right: 8px;
        bottom: 22px;
        font-size: 20px;
        content: "🌻";
        transform: scale(1);
      }
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
    
    .gun {
      width: 12px;
      height: 40px;
      border-radius: 6px;
      margin-right: 12px;
    }
    
    .center {
      flex: 1;
      
      .top {
        font-weight: 500;
        line-height: 20px;
        margin-bottom: 4px;
      }
      
      .bottom {
        font-size: 12px;
        opacity: 0.8;
        line-height: 16px;
      }
    }
  }
}

/* 自定义图片输入区域样式 */
.customImg {
  margin-top: 20px;
  padding: 15px;
  background: var(--gray5);
  border-radius: 8px;
  
  &-item {
    color: var(--fontColor);
    font-weight: 500;
    margin-bottom: 10px;
    font-size: 16px;
  }
}

/* 恢复默认按钮样式 */
.default-btn {
  background: linear-gradient(45deg, var(--orange), var(--orange4));
  display: block;
  width: 100%;
  padding: 15px 0;
  border-radius: 8px;
  color: var(--white);
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  
  &:hover {
    background: linear-gradient(45deg, var(--orange4), var(--orange));
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 117, 0, 0.3);
  }
  
  i {
    margin-right: 8px;
  }
}

/* 折叠面板样式优化 */
.el-collapse {
  border: none;
  
  &-item {
    margin-bottom: 10px;
    
    &__header {
      background: var(--gray5);
      padding: 16px;
      border-radius: 8px;
      color: var(--fontColor);
      font-size: 16px;
      font-weight: 500;
      border: none;
      
      &:hover {
        background: var(--gray6);
      }
    }
    
    &__wrap {
      background: transparent;
      border: none;
    }
    
    &__content {
      padding: 15px 0;
    }
  }
}

/* 动画关键帧 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes slide-top {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-5px);
  }
}

@keyframes slide-bottom {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(5px);
  }
}

/* 移动端响应式样式 - 主要修改在这里 */
@media screen and (max-width: 768px) {
  .toolbar-content {
    padding: 0 15px;
    height: 50px;
  }
  
  .toolbar-title {
    h2 {
      font-size: 16px;
      white-space: nowrap;
    }
  }
  
  .toolbar-mobile-menu {
    font-size: 24px;
    margin-right: 10px;
    width: 36px;
    height: 36px;
  }
  
  .mobile-toolbar {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .mobile-scroll-menu {
    > li {
      padding: 4px 6px;
      font-size: 11px;
      
      img {
        width: 18px;
        height: 18px;
        margin-bottom: 1px;
      }
    }
  }
  
  .mobile-menu-text {
    font-size: 9px;
  }
  
  .user-action-buttons {
    padding: 0 15px;
    
    .el-button {
      font-size: 13px;
      padding: 10px 0;
    }
  }
  
  .small-menu .menu_item > span {
    font-size: 12px;
    padding: 6px 8px;
  }
  
  /* 隐藏PC端导航 */
  .center-toolbar {
    display: none;
  }
  
  /* 移动端对话框优化 - 主要修改在这里 */
  .changeBgBox {
    width: 90% !important;
    max-width: 90% !important;
    margin: 0 auto !important;
    
    .el-dialog {
      width: 100% !important;
      margin-top: 20vh !important;
      transform: translateY(30px) !important; /* 确保移动端向下平移30px */
      
      &__body {
        max-height: 80vh;
        padding: 15px 10px;
      }
    }
  }
  
  /* 移动端右下角按钮优化 */
  .toolButton {
    right: 15px;
    bottom: 15px;

    //自己修復，使右下脚的toolbutton層級顯示最頂層
    z-index: 9999;
    .button {
      width: 44px;
      height: 44px;
      font-size: 16px;
    }
  }
  
  .backTop {
    width: 44px;
    height: 44px;
    
    img {
      width: 24px;
      height: 24px;
    }
  }
  
  /* 移动端背景选择优化 */
  .bgBox .box {
    width: calc(50% - 10px);
    height: 80px;
  }
  
  .bgBox .mobileBox {
    height: 150px;
  }
  
  .color-box_contain .color-box {
    width: 100%;
  }
  
  .httpButton {
    width: 50%;
  }
}

@media screen and (max-width: 400px) {
  .toolButton {
    right: 10px;
    bottom: 10px;
  }
  
  .toolbar-content {
    padding: 0 10px;
  }
  
  .mobile-scroll-menu > li {
    padding: 3px 4px;
    font-size: 10px;
    
    img {
      width: 16px;
      height: 16px;
    }
  }
  
  .mobile-menu-text {
    font-size: 8px;
  }
  
  .small-menu .menu_item > span {
    width: 100%;
  }
  
  .changeBgBox .el-dialog {
    margin-top: 25vh !important;
    transform: translateY(30px) !important; /* 确保小屏幕也向下平移 */
  }
}

@media screen and (max-width: 510px) {
  .bgBox .box {
    height: 73px;
    width: 135px;
  }
  .bgBox .mobileBox {
    height: 240px;
    width: 135px;
  }
  .iconRotate.showIcon {
    display: none;
  }
}

@media screen and (max-width: 950px) {
  .center-toolbar {
    display: none;
  }
}

/* 平板设备优化 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .toolbar-content {
    padding: 0 20px;
  }
  
  .scroll-menu > li {
    margin-right: 16px;
    font-size: 15px;
  }
  
  .mobile-toolbar {
    display: none;
  }
  
  .center-toolbar {
    display: flex;
  }
}

/* 大屏设备优化 */
@media screen and (min-width: 1025px) {
  .mobile-toolbar {
    display: none;
  }
  
  .center-toolbar {
    display: flex;
  }
}

/* 超小屏幕手机优化 */
@media screen and (max-width: 320px) {
  .toolbar-title h2 {
    font-size: 14px;
  }
  
  .mobile-scroll-menu > li {
    padding: 2px 3px;
    
    img {
      width: 14px;
      height: 14px;
    }
  }
  
  .mobile-menu-text {
    font-size: 7px;
  }
  
  .changeBgBox .el-dialog {
    margin-top: 30vh !important;
    transform: translateY(30px) !important; /* 确保超小屏幕也向下平移 */
  }
}

/* 紧急修复：强制移动端对话框位置 - 修正这里 */
@media screen and (max-width: 768px) {
  .changeBgBox {
    .el-dialog {
      position: fixed !important;
      top: 80px !important;
      margin: 0 auto !important;
      width: 90% !important;
      left: 5% !important;
      right: 5% !important;
      transform: translateY(30px) !important; /* 移除 transform: none 改为 translateY */
      max-height: calc(100vh - 100px) !important;
      overflow-y: auto;
    }
    
    .v-modal {
      background-color: rgba(0, 0, 0, 0.5) !important;
    }
  }
  
  /* 阻止点击穿透 */
  .el-dialog__wrapper {
    z-index: 3000 !important;
  }
  
  .toolbar-content {
    z-index: 99999 !important;
  }
}

/* 超小屏幕调整 */
@media screen and (max-width: 375px) {
  .changeBgBox .el-dialog {
    top: 70px !important;
    max-height: calc(100vh - 90px) !important;
    transform: translateY(30px) !important; /* 确保向下平移 */
  }
}

@media screen and (max-width: 320px) {
  .changeBgBox .el-dialog {
    top: 60px !important;
    max-height: calc(100vh - 80px) !important;
    transform: translateY(30px) !important; /* 确保向下平移 */
  }
}

/* 新增：确保移动端对话框在所有情况下都向下平移30px */
@media screen and (max-width: 768px) {
  .changeBgBox .el-dialog__wrapper .el-dialog {
    transform: translateY(30px) !important;
  }
}
</style>