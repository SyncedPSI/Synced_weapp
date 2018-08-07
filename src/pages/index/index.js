import { request, getDateDiff } from "utils/util";
import { timeline } from "config/api";

const app = getApp();

Page({
  data: {
    page: 1,
    scrollTop: 0,
    logoUrl: "/images/logo.svg",
    hoverImageUrl: "/icons/ic_chatbot_n.svg",
    searchIconUrl: "/icons/ic_search.svg",
    articles: []
  },

  onLoad: function(options) {
    this.fetchData();
  },

  scroll: function(e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    });
  },

  fetchData: function(e) {
    const { page } = this.data;

    request(`${timeline}?page=${page}`)
      .then(res => {
        const { articles } = this.data;
        const newArticles = res.data;
        newArticles.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });
        const newArticleList = articles.concat(newArticles);
        this.setData({
          articles: newArticleList,
          page: page + 1,
        });
      });
  }
});
