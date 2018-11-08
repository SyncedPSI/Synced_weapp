import { request, getDateDiff } from "utils/util";
import { articles, reports } from "config/api";

Page({
  data: {
    isNavFixed: false,
    searchIconUrl: "/icons/ic_search.svg",
    articleList: [],
    reportList: [],
    hasReport: true,
    activeType: 'articles',
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    activeId: null,
    activeTitle: null,
    actionSheetHidden: true,
    scrollTop: 0,
    activeCategory: 'all',
    category: [
      { en: 'all', zh: '全部' },
      { en: 'industry', zh: '产业' },
      { en: 'practice', zh: '工程' },
      { en: 'theory', zh: '理论' },
      { en: 'basic', zh: '入门' },
    ]
  },

  onLoad: function() {
    this.articlePage = 1;
    this.reportPage = 1;
    this.fixNavTop = 176;

    this.getArticleList();
  },
  switchCategory: function(event) {
    this.setData({
      activeCategory: event.target.dataset.type,
      scrollTop: 0,
    });
    this.articlePage = 1;
    this.getArticleList(true);
  },
  getArticleList: function (isRefresh = false) {
    return request(`${articles}?page=${this.articlePage}&category=${this.data.activeCategory}`)
      .then(res => {
        this.articlePage += 1;
        const { articleList } = this.data;
        const newList = res.data;
        newList.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });

        if (isRefresh) {
          this.setData({
            articleList: newList,
          });
        } else {
          this.setData({
            articleList: [...articleList, ...newList],
          });
        }
      });
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
    const { activeType } = this.data;
    if (activeType === 'timelines') {
      this.getArticleList();
    } else {
      this.getReportList();
    }
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
  setActiveType: function(type) {
    if (this.data.reportList.length === 0 && type === 'reports') {
      this.getReportList();
    }

    this.setData({
      activeType: type
    });
  },
  switchType: function(event) {
    const { type } = event.target.dataset;
    if (type === this.data.activeType) return;

    this.setActiveType(type);
  },
  swiperActiveType: function (event) {
    const { currentItemId, source } = event.detail;

    if (source === 'touch') {
      this.setActiveType(currentItemId);
    }
  },
  onShareAppMessage: function() {
    return {
      title: '机器之心',
      path: '/pages/index/index?from=weapp'
    };
  },
});
