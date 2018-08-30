import { request } from "utils/util";
import { dailyShow } from "config/api";

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
    showUrl: null,
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

    request(`${dailyShow}${option.id}`)
      .then(res => {
        const daily = res.data;
        const showUrl = daily.url && daily.url.match(new RegExp('^(http)?s?://([^/?#]+)(?:[/?#]|$)', 'i'));
        this.setData({
          navigateTitle: daily.title,
          daily,
          isFetching: false,
          showUrl: showUrl[showUrl.length - 1],
        });
      });
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
});
