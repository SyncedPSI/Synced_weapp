import { request } from "utils/util";
import { dynamics } from "config/api";

Page({
  data: {
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    banners: [],
    recommends: [],
    currentBannerIndex: 0,
    isLogin: false,
    notifyCount: 0,
  },
  onLoad: function () {
    request({
      url: dynamics
    }).then(res => {
      const { banners, recommends } = res.data;
      banners.forEach(item => {
        if (item.tableize === 'trends') {
          item.path = 'trend/trend';
        } else if (item.tableize === 'articles') {
          item.path = 'article/article';
        } else {
          item.path = `web_view/web_view?url=${item.content.url}`;
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
      isLogin: getApp().globalData.isLogin,
      notifyCount: getApp().globalData.notifyCount
    })
  },

  bannerChange: function (event) {
    this.setData({
      currentBannerIndex: event.detail.current
    });
  },

  track: function(event) {
    const { index, type } = event.currentTarget.dataset;
    getApp().td_app_sdk.event({
      id: `${type}_tap`,
      label: 'tap in index',
      params: {
        index,
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: '机器之心',
      path: '/pages/index/index'
    };
  },
})
