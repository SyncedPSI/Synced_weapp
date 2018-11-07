import { request, getDateDiff } from "utils/util";
import { timelines, dailies, morningDaily } from "config/api";

Page({
  data: {
    isNavFixed: false,
    searchIconUrl: "/icons/ic_search.svg",
    articleList: [],
    activeType: 'dailies',
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    activeId: null,
    activeTitle: null,
    actionSheetHidden: true,
    morningDaily: null,
    dailies: {},
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
      .then(({data}) => {
        if (data != null) {
          this.setData({
            morningDaily: data,
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
        this.resolveDailyList(res.data, isRefresh);
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
  resolveDailyList: function(data, isRefresh = false) {
    let dailies = {};
    if (!isRefresh) {
      dailies = this.data.dailies;
      dayDaily = this.data.dayDaily;
    }

    const { dailies: list } = data;
    list.forEach((item) => {
      const { created_at } = item;
      if (created_at === undefined) return;

      // key format: 2018/9/21
      const [_, key] = created_at.match(new RegExp('^([^\\s]+)', 'i'));
      if (dailies[key] === undefined) {
        const createDate = new Date(created_at);
        dailies[key] = {
          day: createDate.getDate(),
          date: `${createDate.getFullYear()}年${createDate.getMonth() + 1}月`,
          list: [],
        };
      }
      dailies[key].list.push(item);
    });

    this.setData({
      dailies
    });
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
  onShareAppMessage: function() {
    return {
      title: '机器之心',
      path: '/pages/index/index?from=weapp'
    };
  },
});
