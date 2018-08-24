import { request, getDateDiff, setNavigationBarTitle } from "utils/util";
import { articleShow } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    title: "",
    isFetching: true,
    article: {
      related_nodes: [],
    },
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
    setNavigationBarTitle();
    this.getTitleHeight();

    const { id, title } = option;
    this.setData({
      id,
      title,
      isLogin: app.globalData.isLogin
    });

    request(`${articleShow}${option.id}`)
      .then(res => {
        const article = res.data;
        article.published_at = getDateDiff(res.data.published_at);
        WxParse.wxParse("article_content", "html", res.data.content, this, 5);
        this.setData({
          article,
          isFetching: false
        });
      });
  },

  getTitleHeight: function() {
    setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-title').boundingClientRect((rect) => {
        this.titleHeight = (rect.height + 16);
      }).exec();
    }, 300);
  },

  onPageScroll: function(event) {
    if (this.titleHeight === undefined) return;
    const { scrollTop } = event;
    if (scrollTop > this.titleHeight) {
      setNavigationBarTitle(this.data.title);
    } else {
      setNavigationBarTitle();
    }
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
      path: `/pages/article/article?id=${id}&from=weapp`
    };
  },
});
