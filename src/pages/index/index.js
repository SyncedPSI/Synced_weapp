import { request, getDateDiff, showTipToast } from "utils/util";
import { timelines, dailies, morningDaily } from "config/api";

Page({
  data: {
    isNavFixed: false,
    logoUrl: "/images/logo.svg",
    searchIconUrl: "/icons/ic_search.svg",
    articleList: [],
    dailyList: [],
    activeType: 'dailies',
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    activeId: null,
    activeTitle: null,
    actionSheetHidden: true,
    morningDaily: null,
  },

  onLoad: function() {
    this.articlePage = 1;
    this.dailyPage = 1;
    this.fixNavTop = 176;
    this.getMorningDaily();
    this.getDailyList();
  },
  getMorningDaily: function() {
    request(morningDaily)
      .then(res => {
        if (res.data != null) {
          this.setData({
            morningDaily: res.data
          });
        }
      });
  },
  getArticleList: function (isRefresh = false) {
    return request(`${timelines}?page=${this.articlePage}`)
      .then(res => {
        this.articlePage += 1;
        const { articleList } = this.data;
        const newList = res.data;
        newList.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });

        if (isRefresh) {
          this.setData({
            articleList: newList,
          });
        } else {
          this.setData({
            articleList: [...articleList, ...newList],
          });
        }
      });
  },
  getDailyList: function (isRefresh = false) {
    return request(`${dailies}?page=${this.dailyPage}`)
      .then(res => {
        this.dailyPage += 1;
        const { dailyList } = this.data;
        const newList = res.data;

        if (isRefresh) {
          this.setData({
            dailyList: newList,
          });
        } else {
          this.setData({
            dailyList: [...dailyList, ...newList],
          });
        }
      });
  },
  fetchMoreData: function () {
    const { activeType } = this.data;
    if (activeType === 'timelines') {
      this.getArticleList();
    } else {
      this.getDailyList();
    }
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
  setActiveType: function(type) {
    if (this.data.articleList.length === 0 && type === 'timelines') {
      this.getArticleList();
    }

    this.setData({
      activeType: type
    });
  },
  switchType: function(event) {
    const { type } = event.target.dataset;
    if (type === this.data.activeType) return;

    this.setActiveType(type);
  },
  swiperActiveType: function (event) {
    const { currentItemId, source } = event.detail;

    if (source === 'touch') {
      this.setActiveType(currentItemId);
    }
  },
  openActionSheet: function (event) {
    const { id, title } = event.detail;
    this.setData({
      activeId: id,
      activeTitle: title,
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  closeActionSheet: function() {
    this.setData({
      actionSheetHidden: true
    });
  },
  saveCard: function() {
    this.closeActionSheet();
    wx.navigateTo({
      url: `../daily/screenshot/screenshot?id=${this.data.activeId}`
    });
  },
  copyclip: function() {
    wx.setClipboardData({
      data: `https://www.jiqizhixin.com/dailies/${this.data.activeId}`,
      success: () => {
        this.closeActionSheet();
        showTipToast('链接已复制');
      }
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
