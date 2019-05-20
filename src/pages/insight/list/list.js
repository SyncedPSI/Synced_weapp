import { request } from "utils/util";
import { insight } from "config/api";

Page({
  data: {
    insightList: [],
    hasMore: true,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false,
    notifyCount: 0,
    activeCategory: 'documents',
    category: [
      { id: 'documents', name: '报告' },
      { id: 'articles', name: '文章' }
    ],
    categoryDesc: {
      document: '',
      article: ''
    }
  },

  onLoad: function() {
    this.page = 1;

    this.getInsightList();
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
      insightList: [],
      hasMore: true
    }, () => {
      this.page = 1;
      this.getInsightList();
    });
  },
  getInsightList: function (isRefresh = false) {
    if (!this.data.hasMore) return;

    const { activeCategory } = this.data;
    return request({
      url: `${insight}/${activeCategory}?page=${this.page}`
    }).then(res => {
      this.page += 1;
      const { insightList } = this.data;
      const { nodes, has_next_page } = res.data;
      if (isRefresh) {
        this.setData({
          insightList: nodes,
          hasMore: true,
        });
      } else {
        this.setData({
          insightList: [...insightList, ...nodes],
          hasMore: has_next_page
        });
      }
    });
  },
  fetchMoreData: function () {
    this.getInsightList();
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
      path: '/pages/insight/list/list'
    };
  },
});
