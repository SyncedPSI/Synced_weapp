import { request, getDateDiff } from "utils/util";
import { searchByKeyword } from "config/api";

const app = getApp();

Page({
  data: {
    searchIconUrl: "../../icons/ic_search.svg",
    articles: [],
    node: null,
    hasNextPage: true,
    page: 1
  },

  fetchData: function(keywords = '') {
    this.keywords = keywords;
    const { hasNextPage } = this.data;
    if (!hasNextPage || keywords === '') return;

    const page = this.page;
    request(`${searchByKeyword}${keywords}&page=${this.data.page}`
    )
      .then(({ data }) => {
        const { articles , hasNextPage } = data;
        const card_node = data.card_node || null;
        this.setData({
          articles: this.data.articles.concat(articles),
          hasNextPage: hasNextPage,
          node: card_node,
          page: this.data.page + 1
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
    this.fetchData(event.detail.value);
  },

  searchByKeyword: function(event) {
    const { value } = event.detail;

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.fetchData(value);
    }, 2000);

    return value;
  },

  clearTimer: function() {
    clearTimeout(this.timer);
    this.data.page = 1;
    this.data.articles = []
  }
});
