let titleTime, OriginTitile = document.title;
document.addEventListener("visibilitychange", (function () {
  document.hidden ? (document.title = "WG", clearTimeout(titleTime)) : (document.title = "♪(^∇^*)欢迎肥来！🥰", titleTime = setTimeout((function () {
    document.title = OriginTitile
  }), 2e3))
}));