import { request, showTipToast } from "utils/util";
import { dailyDetail } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    navigateTitle: '',
    isFromWeapp: false,
    isFetching: true,
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
    category: 'week'
  },

  openComment: function() {
    this.switchComment(true);
  },

  closeComment: function() {
    this.switchComment(false);
  },

  switchComment: function(status) {
    this.setData({
      isShowComment: status
    });
  },

  onLoad: function(option) {
    const { id, from } = option;
    this.setData({
      id,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
    });

    // request(`${dailyDetail}${option.id}`)
    //   .then(res => {
        this.setData({
          navigateTitle: '标题',
          list: [
            { name: '今日要闻', items: [1,2,3]},
            { name: '产品与应用', items: [1,2,3]},
            { name: '产品与应用', items: [1,2,3]},
          ],
          isFetching: false,
        });
    //   });
  },

  getUserInfo: function(event) {
    app.login(event.detail.userInfo, () => {
      this.setData({
        isLogin: true,
        isShowComment: true
      });
    });
  },
  onShareAppMessage: function() {
    const { id, daily: { title } }= this.data;
    return {
      title,
      path: `/pages/daily/show/show?id=${id}&from=weapp`,
    };
  },
  copySource: function() {
    wx.setClipboardData({
      data: this.data.daily.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  }
});
