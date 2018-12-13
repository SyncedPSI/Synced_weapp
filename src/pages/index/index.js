import { request } from "utils/util";
import { dynamics } from "config/api";

Page({
  data: {
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    banners: [],
    recommends: [],
    currentBannerIndex: 0,
    isLogin: false,
  },
  onLoad: function () {
    request({
      url: dynamics
    }).then(res => {
      const { banners, recommends } = res.data;
      banners.forEach(item => {
        if (item.tableize === 'trends') {
          item.path = 'trend/trend';
        } else {
          item.path = 'article/article';
        }
      })
      this.setData({
        banners,
        recommends
      });
    })
  },

  onShow: function () {
    this.setData({
      isLogin: getApp().globalData.isLogin
    })
  },

  bannerChange: function (event) {
    this.setData({
      currentBannerIndex: event.detail.current
    });
  },

  onShareAppMessage: function() {
    return {
      title: '机器之心',
      path: '/pages/index/index'
    };
  },
})
