import { request, getDateDiff } from "utils/util";
import { articles } from "config/api";

Page({
  data: {
    // searchIconUrl: "/icons/ic_search.svg",
    articleList: [],
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
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
      articleList: [],
    }, () => {
      this.articlePage = 1;
      this.getArticleList();
    });
  },
  getArticleList: function () {
    const { activeCategory } = this.data;
    const queryCategory = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
    return request(`${articles}?page=${this.articlePage}${queryCategory}`)
      .then(res => {
        this.articlePage += 1;
        const { articleList } = this.data;
        const newList = res.data;
        newList.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });

        this.setData({
          articleList: [...articleList, ...newList],
        });
      });
  },
  fetchMoreData: function () {
    this.getArticleList();
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
      path: '/pages/index/index?from=weapp'
    };
  },
});
