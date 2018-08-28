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
    isLogin: false
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
        this.setData({
          navigateTitle: daily.title,
          daily,
          isFetching: false
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
