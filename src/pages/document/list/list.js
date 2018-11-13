import { request } from "utils/util";
import { documents } from "config/api";

Page({
  data: {
    isNavFixed: false,
    reportList: [],
    hasMore: true,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    scrollTop: 0,
  },

  onLoad: function() {
    this.page = 1;

    this.getReportList();
  },
  getReportList: function (isRefresh = false) {
    if (!this.data.hasMore) return;

    return request(`${documents}?page=${this.page}`)
      .then(res => {
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
      title: '机器之心',
      path: '/pages/document/list/list?from=weapp'
    };
  },
});
