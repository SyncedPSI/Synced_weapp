import { request, showTipToast } from "utils/util";
import { trendDetail } from "config/api";
const WxParse = require("wxParse/wxParse.js");
const app = getApp();

Page({
  data: {
    id: null,
    navigateTitle: '',
    trend: null,
    cards: [],
    isFromWeapp: false,
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
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

    request({
      url: `${trendDetail}${option.id}`,
      isHandleNotFound: true
    }).then(res => {
      const { content, desc, trend_cards, ...otherProps } = res.data;
      WxParse.wxParse("trendDesc", "html", desc, this, 5);
      WxParse.wxParse("trendContent", "html", content, this, 5);

      const category = otherProps.category;
      const detailCategory = ['paper', 'investment', 'report'];
      if (category === 'article') {
        otherProps.image = 'trend_task';
        otherProps.type = 'article';
      } else if (category === 'daily') {
        otherProps.image = 'trend_daily';
         otherProps.type = 'daily';
      } else if (detailCategory.indexOf(category) > -1) {
        otherProps.image = 'trend_paper';
        otherProps.type = 'daily';
      } else {
        otherProps.image = 'trend_reference';
        otherProps.type = 'article';
      }

      this.setData({
        navigateTitle: otherProps.title,
        trend: otherProps,
        cards: trend_cards,
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
    const { id, trend: { title } } = this.data;
    return {
      title,
      path: `/pages/trend/trend?id=${id}&from=weapp`,
    };
  },
  copySource: function(event) {
    wx.setClipboardData({
      data: event.currentTarget.dataset.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  }
});
