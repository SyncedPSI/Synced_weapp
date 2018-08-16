import { request, getDateDiff } from "utils/util";
import { timeline } from "config/api";

Page({
  data: {
    scrollTop: 0,
    logoUrl: "/images/logo.svg",
    hoverImageUrl: "/icons/ic_chatbot_n.svg",
    searchIconUrl: "/icons/ic_search.svg",
    articles: []
  },

  onLoad: function(options) {
    this.page = 1;
    this.getData();
  },

  scroll: function(e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    });
  },
  getData: function (isRefresh = false) {
    return request(`${timeline}?page=${this.page}`)
      .then(res => {
        this.page += 1;
        const { articles } = this.data;
        const newArticles = res.data;
        newArticles.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });

        if (isRefresh) {
          console.log('iiii')
          this.setData({
            articles: newArticleList,
            isHideLoding: true,
          });
        } else {
          this.setData({
            articles: [...articles, ...newArticles],
          });
        }
      })
  },
  onPageScroll: function (event) {
    this.setData({
      scrollTop: event.scrollTop,
    });
  },
  onReachBottom: function () {
    this.getData();
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();

    this.page = 1;
    this.getData(true)
      .catch(() => {})
      .then(() => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      });
  }
});
