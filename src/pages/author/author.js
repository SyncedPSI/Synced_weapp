import { request, showErrorToast } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    isFromWeapp: false,
    navigateTitle: '机器之心',
    author: null,
    articles: [],
    node: null,
    hasNextPage: true,
    keywords: '',
    scrollTop: 0,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  onLoad: function (option) {
    const { id, type, from } = option;

    this.page = 2;
    request(`${ApiRootUrl}/${type}s/${id}`)
      .then(({ data }) => {
        const { articles, has_next_page, total_count, ...other } = data;
        this.setData({
          isFromWeapp: from === "weapp",
          author: other,
          navigateTitle: other.name,
          articles,
          id,
          type,
          totalCount: total_count,
          hasNextPage: has_next_page,
        })
      });
  },
  fetchData: function() {
    if (!this.data.hasNextPage) return;

    const { type, id } = this.data;
    request(`${ApiRootUrl}/${type}s/${id}?page=${this.page}`)
      .then(({ data }) => {
        const oldArticles = this.data.articles;
        const { articles, has_next_page } = data;

        this.page += 1;
        this.setData({
          articles: [...oldArticles, ...articles],
          hasNextPage: has_next_page,
        })
      });
  },
  onShareAppMessage: function() {
    const { type, id, author } = this.data;
    return {
      title: author.name,
      path: `/pages/author/author?is=${id}&type=${type}`,
    };
  },
});
