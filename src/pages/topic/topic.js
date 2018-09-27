import { request, getDateDiff } from "utils/util";
import { topicDetail } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    navigateTitle: '',
    id: "",
    title: "",
    isFromWeapp: false,
    isFetching: true,
    topic: {},
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
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

    request(`${topicDetail}${option.id}`)
      .then(res => {
        const topic = res.data;
        topic.publishedAt = getDateDiff(res.data.published_at);
        WxParse.wxParse("topic_content", "html", res.data.content, this, 5);
        this.setData({
          topic,
          isFetching: false
        }, () => {
          this.getTitleHeight();
        });
      });
  },

  getTitleHeight: function() {
    setTimeout(() => {
      wx.createSelectorQuery().select('#js-topic-title').boundingClientRect((rect) => {
        this.titleHeight = (rect.height + 16);
      }).exec();
    }, 300);
  },

  scroll: function (event) {
    if (this.titleHeight === undefined) return;

    const { scrollTop } = event.detail;
    if (scrollTop > this.titleHeight) {
      this.setNavigationBarTitle(this.data.title);
    } else {
      this.setNavigationBarTitle();
    }
  },

  setNavigationBarTitle: function(title = '') {
    this.setData({
      navigateTitle: title
    });
  },

  getUserInfo: function(event) {
    // event.detail.userInfo
    app.login(event.detail.userInfo, () => {
      this.setData({
        isLogin: true,
        isShowComment: true
      });
    });
  },

  onShareAppMessage: function() {
    const { title, id } = this.data;
    return {
      title,
      path: `/pages/topic/topic?id=${id}&title=${title}&from=weapp`
    };
  },
});