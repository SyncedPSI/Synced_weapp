import { dailies } from "config/api";
import { request, showTipToast } from "utils/util";

Page({
  data: {
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    dailies: {},
    actionSheetHidden: true,
    activeId: null,
    activeTitle: null,
    keys: [],
  },
  onLoad: function () {
    this.dailyPage = 1;
    this.getDailyList();
  },

  fetchMore: function() {
    this.getDailyList();
  },

  getDailyList: function (isRefresh = false) {
    return request({
      url: `${dailies}?page=${this.dailyPage}`
    }).then(res => {
      this.dailyPage += 1;
      this.resolveDailyList(res.data, isRefresh);
    });
  },
  resolveDailyList: function(data, isRefresh = false) {
    let dailies = {};
    if (!isRefresh) {
      dailies = this.data.dailies;
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
          day: `${createDate.getMonth() + 1}月${createDate.getDate()}日`,
          list: [],
        };
      }
      dailies[key].list.push(item);
    });
    this.setData({
      dailies,
      keys: Object.keys(dailies)
    });
  },
  openActionSheet: function (event) {
    const { id, title } = event.currentTarget.dataset;
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
      url: `/pages/daily/screenshot/screenshot?id=${this.data.activeId}`
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
      path: '/pages/daily/list/list?from=weapp'
    };
  },
})
