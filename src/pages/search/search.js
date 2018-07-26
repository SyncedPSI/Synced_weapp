import { request, getDateDiff } from "utils/util";
import { searchByKeyword } from "config/api";

const app = getApp();

Page({
  data: {
    searchIconUrl: "../../icons/ic_search.svg",
    page: 1,
    articles: [],
    node: null,
    hasNextPage: true,
    isFetching: false,
  },
  fetchData: function(keywords = '') {
    this.keywords = keywords;
    this.switchFetching(true);
    const { page } = this.data;
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
          page: page + 1,
          isFetching: false,
        })

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
  },
  switchFetching: function(status) {
    this.setData({
      isFetching: status
    });
  }
});
