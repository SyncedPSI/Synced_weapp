import { request } from "utils/util";
import { reports } from "config/api";

Page({
  data: {
    isNavFixed: false,
    reportList: [],
    hasReport: true,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    scrollTop: 0,
  },

  onLoad: function() {
    this.page = 1;

    this.getReportList();
  },
  getReportList: function (isRefresh = false) {
    if (!this.data.hasReport) return;

    return request(`${reports}?page=${this.reportPage}`)
      .then(res => {
        this.reportPage += 1;
        const { reportList } = this.data;
        const newList = res.data;

        if (newList.length === 0) {
          this.setData({
            hasReport: false
          });
          return;
        }

        if (isRefresh) {
          this.setData({
            reportList: newList,
          });
        } else {
          this.setData({
            reportList: [...reportList, ...newList],
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
