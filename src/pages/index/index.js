import { request, getDateDiff } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    scrollTop: 0,
    logoUrl: "/images/logo.svg",
    hoverImageUrl: "/icons/ic_chatbot_n.svg",
    searchIconUrl: "/icons/ic_search.svg",
    list: [],
    activeType: 'timelines',
  },

  onLoad: function(options) {
    this.page = 1;
    this.getList();
  },
  scroll: function(e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    });
  },
  getList: function (isRefresh = false) {
    const { activeType } = this.data;
    return request(`${ApiRootUrl}/${activeType}?page=${this.page}`)
      .then(res => {
        this.page += 1;
        const { list } = this.data;
        const newList = res.data;

        if (activeType === 'timelines') {
          newList.forEach(item => {
            item.published_at = getDateDiff(item.published_at);
          });
        }

        if (isRefresh) {
          this.setData({
            list: newList,
          });
        } else {
          this.setData({
            list: [...list, ...newList],
          });
        }
      });
  },
  onPageScroll: function (event) {
    this.setData({
      scrollTop: event.scrollTop,
    });
  },
  onReachBottom: function () {
    this.getList();
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();

    this.page = 1;
    this.getList(true)
      .catch(() => {})
      .then(() => {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
  },
  switchType: function(event) {
    const { type } = event.target.dataset;
    this.setData({
      activeType: type
    }, () => {
      this.page = 1;
      this.getList(true);
    });
  },
  onShareAppMessage: function(event) {
    const { from } = event;
    if (from === 'button') {
      const { id, title } = event.target.dataset;
      return {
        title,
        path: `/page/daily/show/show?id=${id}`
      };
    }

    return {
      title: '机器之心',
      path: '/page/index/index'
    };
  },
});
