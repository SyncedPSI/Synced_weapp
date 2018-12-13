import { request } from "utils/util";
import { documents } from "config/api";

Page({
  data: {
    reportList: [],
    hasMore: true,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false,
  },

  onLoad: function() {
    this.page = 1;

    this.getReportList();
  },
  onShow: function() {
    this.setData({
      isLogin: getApp().globalData.isLogin
    })
  },
  getReportList: function (isRefresh = false) {
    if (!this.data.hasMore) return;

    return request({
      url: `${documents}?page=${this.page}`
    }).then(res => {
      this.page += 1;
      const { reportList } = this.data;
        const { documents, has_next_page } = res.data;

      if (isRefresh) {
        this.setData({
          reportList: documents,
          hasMore: true,
        });
      } else {
        this.setData({
          reportList: [...reportList, ...documents],
          hasMore: has_next_page
        });
      }
    });
  },
  fetchMoreData: function () {
    this.getReportList();
  },
  // onPullDownRefresh: function () {
  //   wx.showNavigationBarLoading();

  //   this.page = 1;
  //   this.getList(true)
  //     .catch(() => {})
  //     .then(() => {
  //       wx.hideNavigationBarLoading();
  //       wx.stopPullDownRefresh();
  //     });
  // },
  onShareAppMessage: function() {
    return {
      title: '报告 - 机器之心',
      path: '/pages/document/list/list'
    };
  },
});
