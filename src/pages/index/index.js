import { request } from "utils/util";
import { dynamics } from "config/api";

Page({
  data: {
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    banners: [],
    recommends: [],
    currentBannerIndex: 0,
  },
  onLoad: function () {
    request({
      url: dynamics
    }).then(res => {
      const { banners, recommends } = res.data;
      banners.forEach(item => {
        const detailCategory = ['paper', 'article', 'investment', 'report']
        if (item.tableize === 'trends') {
          if (detailCategory.indexOf(item.content.category) > -1) {
            item.path = 'trend/detail/detail';
          } else {
            item.path = 'trend/related/related';
          }
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
