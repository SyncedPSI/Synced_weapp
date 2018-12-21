import { request } from "utils/util";
import { documents } from "config/api";

Page({
  data: {
    reportList: [],
    hasMore: true,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false,
    notifyCount: 0,
    activeCategory: 'all',
    category: [
      { id: 'all', name: '全部' },
      { id: 'zhizhou', name: '#智周' },
      { id: 'top500', name: '#500强' },
    ],
    categoryDesc: {
      all: '',
      zhizhou: '',
      top500: '',
    }
  },

  onLoad: function() {
    this.page = 1;

    this.getReportList();
  },
  onShow: function() {
    this.setData({
      isLogin: getApp().globalData.isLogin,
      notifyCount: getApp().globalData.notifyCount
    })
  },
  switchCategory: function (event) {
    this.setData({
      activeCategory: event.target.dataset.type,
      scrollTop: 0,
      reportList: [],
      hasMore: true
    }, () => {
      this.page = 1;
      this.getReportList();
    });
  },
  getReportList: function (isRefresh = false) {
    if (!this.data.hasMore) return;

    const { activeCategory } = this.data;
    const queryCategory = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
    return request({
      url: `${documents}?page=${this.page}${queryCategory}`
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
