
// 简化的动态配置
const isNgrok = typeof window !== 'undefined' && window.location.hostname.includes('ngrok')||window.location.hostname.includes('cpolar')||window.location.hostname.includes('org');
const isDevelopment = process.env.NODE_ENV === 'development';
// 基础URL配置
const baseConfig = isNgrok ? {
  baseURL: `${window.location.origin}/api`,
  webURL: window.location.origin,
  qiniuUploadImages: `${window.location.origin}/api/resource/updateImage/`,
  qiniuUploadEntrance: `${window.location.origin}/`
} : isDevelopment ? {
  baseURL: "http://localhost:8000/api",
  webURL: "http://localhost:8000",
  qiniuUploadImages: "http://localhost:8000/api/resource/updateImage/",
  qiniuUploadEntrance: "http://localhost:8000/"
} : {
  baseURL: "http://www.monkey-papa.com/api",
  webURL: "http://www.monkey-papa.com",
  qiniuUploadImages: "http://www.monkey-papa.com/api/resource/updateImage/",
  qiniuUploadEntrance: "http://www.monkey-papa.com/"
};









export default {

  ...baseConfig,
  /*
  baseURL: "http://localhost:8000/api",
  webURL: "http://localhost:8000",
  // baseURL: "http://www.monkey-papa.com/api", // 线上地址加上/api
  // webURL: "http://www.monkey-papa.com",  // 线上地址
  //上传图片文件地址 elementUI:action
  //qiniuUploadImages: "http://www.monkey-papa.com/api/resource/updateImage/", // 你的后端线上地址加上/api/resource/updateImage/
  qiniuUploadImages: "http://localhost:8000/api/resource/updateImage/", // 你的后端线上地址加上/api/resource/updateImage/
  //表情地址,md图片地址
  //qiniuUploadEntrance: "http://www.monkey-papa.com/", // 你的七牛云存储空间的外链域名
  qiniuUploadEntrance: "http://localhost:8000/", // 你的七牛云存储空间的外链域名
  */






  //诗词语录
  hitokoto: "https://v1.hitokoto.cn",
  shehui: "https://api.oick.cn/yulu/api.php",
  jinrishici: "https://v1.jinrishici.com/all.json",
  //目录
  tocbot: "https://cdn.bootcdn.net/ajax/libs/tocbot/4.21.0/tocbot.min.js",







  //视频地址
  favoriteVideo: "https://www.qiniuyun.monkey-papa.icu/avatar/nahida.mp4",
  //按钮颜色
  before_color_1: "var(--blue13)",
  after_color_1: "linear-gradient(45deg, var(--red), var(--purple1))",
  //评论分页颜色 微言分页颜色
  commentPageColor: "var(--green6)",
  userId: 9, // 博客主人的用户id
  //emoji含义
  emojiList: [
    "衰",
    "鄙视",
    "再见",
    "捂嘴",
    "摸鱼",
    "奋斗",
    "白眼",
    "可怜",
    "皱眉",
    "鼓掌",
    "烦恼",
    "吐舌",
    "挖鼻",
    "委屈",
    "滑稽",
    "啊这",
    "生气",
    "害羞",
    "晕",
    "好色",
    "流泪",
    "吐血",
    "微笑",
    "酷",
    "坏笑",
    "吓",
    "大兵",
    "哭笑",
    "困",
    "呲牙",
  ],
  //纯色
  SolidColor: [
    "#f7f9fe",
    "#30303c",
    "#7a7374",
    "#eea6b7",
    "#918072",
    "#fbecde",
    "#a4aca7",
    "#a4cab6",
    "#83a78d",
    "#70887d",
    "#57c3c2",
    "#10aec2",
    "#93d5dc",
    "#3b818c",
    "#5cb3cc",
    "#93b5cf",
  ],
  //渐变
  gradient: [
    "55deg, #0095c2 21%, #64E1C8 100%",
    "90deg, #ffd7e4 0%, #c8f1ff 100%",
    "45deg, #e5737b, #c6999e, #96b9c2, #00d6e8",
    "25deg, #31354b, #38536c, #3b738e, #3995b2",
    "26deg, #0e6183, #387ea6, #599dcb, #7abdf1",
    "25deg, #0583bf, #159bc5, #16b4cb, #0aced0",
    "25deg, #3e47d1, #8b5fb8, #ba7b9d, #df9980",
    "25deg, #0e5c71, #15828f, #19a9ae, #1ad3ce",
  ],
  about: [
    {
      img: "https://www.qiniuyun.monkey-papa.icu/avatar/%E4%B8%8D%E8%89%AF%E4%BA%BA1.jpg",
      tit: "女帝",
      sub: "巾帼女帝，新生红衣??",
    },
    {
      img: "https://www.qiniuyun.monkey-papa.icu/avatar/%E4%B8%8D%E8%89%AF%E4%BA%BA2.jpg",
      tit: "新不良帅",
      sub: "弃天道，择霸道??",
    },
    {
      img: "https://www.qiniuyun.monkey-papa.icu/avatar/%E4%B8%8D%E8%89%AF%E4%BA%BA3.jpg",
      tit: "四大尸祖",
      sub: "搞笑女+搞笑男??",
    },
    {
      img: "https://www.qiniuyun.monkey-papa.icu/avatar/%E4%B8%8D%E8%89%AF%E4%BA%BA4.png",
      tit: "这俩货",
      sub: "导致我每集片头都不跳过??",
    },
    {
      img: "https://www.qiniuyun.monkey-papa.icu/avatar/%E4%B8%8D%E8%89%AF%E4%BA%BA6.jpg",
      tit: "奥姑",
      sub: "好腿，只能说被打的真惨??",
    },
    {
      img: "https://www.qiniuyun.monkey-papa.icu/avatar/%E4%B8%8D%E8%89%AF%E4%BA%BA7.jpg",
      tit: "随心",
      sub: "(*^▽^*)",
    },
  ],
  themeMapConfig: [
    {
      title: "1. 图片（电脑）",
      collapseTitle: "查看适配电脑端背景",
      handleVal: "pc",
      class: "box",
      dataList: [],
      style: "img",
    },
    {
      title: "2. 图片（移动端）",
      collapseTitle: "查看适配移动端背景",
      handleVal: "mobile",
      class: "box mobileBox",
      dataList: [],
      style: "img",
    },
    {
      title: "3. 渐变色",
      collapseTitle: "查看渐变色背景",
      handleVal: "gradient",
      class: "box",
      dataList: [],
      style: "gradient",
    },
    {
      title: "4. 纯色",
      collapseTitle: "查看纯色背景",
      handleVal: "solid",
      class: "box",
      dataList: [],
      style: "solid",
    },
  ],
  //随机 微言颜色 标签颜色
  tree_hole_color: (function () {
    function getRandomColor() {
      return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      })`;
    }
    const colors = [];
    for (let i = 0; i < 6; i++) {
      colors.push(getRandomColor());
    }
    return colors;
  })(),
};
