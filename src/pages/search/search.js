import { request, getDateDiff } from "utils/util";
import { searchByKeyword } from "config/api";

const app = getApp();

Page({
  data: {
    searchIconUrl: "../../icons/ic_search.svg",
    articles: [],
    node: null,
    hasNextPage: true,
  },
  onLoad: function() {
    this.page = 1;
  },
  fetchData: function(keywords = '') {
    this.keywords = keywords;
    const { hasNextPage } = this.data;
    if (!hasNextPage || keywords === '') return;

    const page = this.page;
    request(`${searchByKeyword}${keywords}`, {
      page
    })
      .then(({ data }) => {
        const { articles , hasNextPage } = data;
        const card_node = data.card_node || null;
        this.setData({
          articles: articles,
          hasNextPage: hasNextPage,
          node: card_node,
        })
        this.page += 1;

        this.clearTimer();
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
    this.page = 1;
  },
});
