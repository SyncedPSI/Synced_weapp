import { request, getDateDiff } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    scrollTop: 0,
    logoUrl: "/images/logo.svg",
    searchIconUrl: "/icons/ic_search.svg",
    list: [],
    activeType: 'timelines',
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },

  onLoad: function() {
    this.page = 1;
    this.getList();
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
        path: `/pages/daily/show/show?id=${id}&from=weapp`,
        imageUrl: '/images/shard_daily_in_index.png',
      };
    }

    return {
      title: '机器之心',
      path: '/pages/index/index?from=weapp'
    };
  },
});
