import { request } from "utils/util";
import { dynamics } from "config/api";

Page({
  data: {
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    banners: [1, 2, 3, 4, 5],
    recommends: [1, 2, 3, 4, 5, 6, 7, 8],
    currentBannerIndex: 0,
  },
  onLoad: function () {
    request(dynamics)
      .then(res => {
        const { banners, recommends } = res.data;
        this.setData({
          banners,
          recommends
        });
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
