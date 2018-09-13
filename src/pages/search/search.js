import { request } from "utils/util";
import { searchByKeyword } from "config/api";

Page({
  data: {
    isFromWeapp: false,
    navigateTitle: '搜索',
    articles: [],
    node: null,
    hasNextPage: true,
    keywords: '',
    scrollTop: 0,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  onLoad: function (option) {
    const { keywords, from } = option;
    this.page = 1;
    if (keywords) {
      this.setData({
        keywords,
        isFromWeapp: from === "weapp",
      });
      this.fetchData(keywords);
    }
  },
  fetchData: function(keywords = '', isRefresh = false) {
    this.keywords = keywords;
    if (keywords === '') return;
    if (!isRefresh && !this.data.hasNextPage) return;

    request(`${searchByKeyword}${keywords}&page=${this.page}`)
      .then(({ data }) => {
        const { articles, hasNextPage } = data;
        const card_node = data.card_node || null;
        const oldArticles = isRefresh ? [] : this.data.articles;

        this.page += 1;
        this.setData({
          articles: [...oldArticles, ...articles],
          hasNextPage: hasNextPage,
          node: card_node,
        })
      })
      .catch(() => {
        this.clearTimer();
      })
  },

  fetchMoreData: function() {
    this.fetchData(this.keywords);
  },

  search: function(event) {
    this.clearTimer();
    this.setData({
      scrollTop: 0,
    }, () => {
      this.fetchData(event.detail.value, true);
    })
  },

  refresh: function() {
    this.clearTimer();
    this.setData({
      scrollTop: 0,
    }, () => {
      this.fetchData(this.keywords, true);
    });
  },
  searchByKeyword: function(event) {
    const { value } = event.detail;
    this.keywords = value;

    return value;
  },
  clearTimer: function() {
    clearTimeout(this.timer);
    this.page = 1;
  },
  onShareAppMessage: function() {
    return {
      title: `${this.keywords} - 机器之心`,
      path: `/pages/search/search?keywords=${this.keywords}&from=weapp`,
    };
  },
});
