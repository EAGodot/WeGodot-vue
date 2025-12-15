import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    toolbar: {
      visible: false,
      enter: true,
    },
    sortInfo: [],
    currentUser: {},
    currentAdmin: {},
    webInfo: {
      webName: "",
      webTitle: [],
      notices: [],
      footer: "",
      backgroundImage: "",
      avatar: "",
      randomCover: [],
    },

    //"url(https://www.qiniuyun.monkey-papa.icu/images/changeBg3)"
    changeBg: "url(https://www.qiniuyun.monkey-papa.icu/images/changeBg3)",
    //changeBg: "url(https://img1.baidu.com/it/u=1670412618,1969318421&fm=253&app=138&f=JPEG?w=1287&h=800)",
    //changeBg: "linear-gradient(25deg, #3e47d1, #8b5fb8, #ba7b9d, #df9980)",
    isShowLoading: false,
    top: 0,
    pageView: {},
    newArticles: [],
    articleTotal: 0,
    userList: [],
  },
  getters: {
    // 访客禁用按钮权限
    permissions: (state) => {
      return state.currentAdmin.userType === 3 ? [] : ["user:visit:read"];
    },
    articleTotal: (state) => {
      if (state.sortInfo !== null && state.sortInfo.length !== 0) {
        if (state.sortInfo.length === 1) {
          return state.sortInfo[0].countOfSort;
        } else {
          return state.sortInfo.reduce((prev, curr) => {
            if (typeof prev === "number") {
              return prev + curr.countOfSort;
            } else {
              return prev.countOfSort + curr.countOfSort;
            }
          });
        }
      } else {
        return 0;
      }
    },
    navigationBar: (state) => {
      if (state.sortInfo !== null && state.sortInfo.length !== 0) {
        return state.sortInfo.filter((f) => f.sortType === 0);
      } else {
        return [];
      }
    },
    labelInfo: (state) => {
      let labels = [];
      for (let index = 0; index < state.sortInfo.length; index++) {
        labels = labels.concat(state.sortInfo[index].labels);
      }
      return labels;
    },
  },
  mutations: {
    userList(state, userList) {
      state.userList = userList;
    },
    articleTotal(state, articleTotal) {
      state.articleTotal = articleTotal;
    },
    newArticles(state, newArticles) {
      state.newArticles = newArticles;
    },
    pageView(state, pageView) {
      state.pageView = pageView;
    },
    changeToolbarStatus(state, toolbarState) {
      state.toolbar = toolbarState;
    },
    loadSortInfo(state, sortInfo) {
      if (sortInfo !== null && sortInfo.length !== 0) {
        state.sortInfo = sortInfo.sort((s1, s2) => s1.priority - s2.priority);
      }
    },
    loadCurrentUser(state, user) {
      state.currentUser = user;
    },
    loadCurrentAdmin(state, user) {
      state.currentAdmin = user;
    },

    //deepseek修改
    loadWebInfo(state, webInfo) {
      console.log('=== loadWebInfo 调试 ===');
      console.log('原始 webInfo:', webInfo);
      console.log('notices 值:', webInfo.notices, '类型:', typeof webInfo.notices);
      console.log('randomCover 值:', webInfo.randomCover, '类型:', typeof webInfo.randomCover);
      console.log('webTitle 值:', webInfo.webTitle, '类型:', typeof webInfo.webTitle);
      
      try {
        const processedInfo = { ...webInfo };
        
        // 逐个处理字段，便于调试
        if (processedInfo.webTitle) {
          processedInfo.webTitle = processedInfo.webTitle.split("");
          console.log('webTitle 处理成功');
        }
        
        if (processedInfo.notices && typeof processedInfo.notices === 'string') {
          processedInfo.notices = JSON.parse(processedInfo.notices);
          console.log('notices 解析成功');
        }
        
        if (processedInfo.randomCover && typeof processedInfo.randomCover === 'string') {
          processedInfo.randomCover = JSON.parse(processedInfo.randomCover);
          console.log('randomCover 解析成功');
        }
        
        state.webInfo = processedInfo;
        console.log('最终 webInfo:', state.webInfo);
        
      } catch (error) {
        console.error('处理失败:', error);
      }
    },
    changeBgBox(state, changeBg) {
      state.changeBg = changeBg;
    },
    SET_SHOWLOADING(state, data) {
      state.isShowLoading = data;
    },
    topPercentage(state, top) {
      state.top = top;
    },
  },


  plugins: [
    createPersistedState({
      storage: window.localStorage,
    }),
  ],




/*
  plugins: [
    createPersistedState({
      storage: window.localStorage,
      // 添加过滤，只在特定条件下持久化
      filter: (mutation) => {
        // 不持久化 changeBgBox 的变化
        return mutation.type !== 'changeBgBox'
      },
      // 或者指定只持久化某些状态
      reducer: (state) => {
        return {
          // 只持久化这些状态，不包含 changeBg
          toolbar: state.toolbar,
          currentUser: state.currentUser,
          webInfo: state.webInfo,
          // 注意：这里不包含 changeBg
        }
      }
    }),
  ],
*/


});
