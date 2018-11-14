// import { request } from "utils/util";

Page({
  data: {
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    slide: [1, 2, 3, 4, 5],
    hotList: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  onLoad: function () {
    // this.dailyPage = 1;
    // this.getDailyList();
  },

  onShareAppMessage: function() {
    return {
      title: '机器之心',
      path: '/pages/trend/trend'
    };
  },
})
