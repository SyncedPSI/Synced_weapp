import { request, getDateDiff } from "utils/util";
import { articleDetail, readLater } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    navigateTitle: '',
    id: "",
    title: "",
    isFromWeapp: false,
    isFetching: true,
    article: {
      related_nodes: [],
    },
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false
  },

  onLoad: function(options) {
    this.scrollTop = 0;
    this.getTitleHeight();

    const { id, title, from, read_later } = options;
    this.read_later = read_later;
    this.articleId = id;
    this.setData({
      id,
      title,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
    });

    request(`${articleDetail}${options.id}`)
      .then(res => {
        const article = res.data;
        article.publishedAt = getDateDiff(res.data.published_at);
        WxParse.wxParse("article_content", "html", res.data.content, this, 5);
        this.setData({
          article,
          isFetching: false
        }, () => {
          this.getContentHeight();
        });
      });
  },

  onHide: function() {
    this.sendProgess();
  },

  onUnload: function () {
    this.sendProgess();
  },

  getProgress: function() {
    const { screenHeight } = getApp().globalData.systemInfo;
    const offsetTop = this.scrollTop + screenHeight;

    let progress = 0;
    if (this.scrollTop === 0) {
      progress = 0;
    } else if (offsetTop > this.contentHeight) {
      progress = 100;
    } else {
      progress = parseInt(offsetTop * 100 / this.contentHeight);
    }

    return progress;
  },

  sendProgess: function() {
    if (this.scrollTop === 0 || !this.read_later) {
      return;
    }

    this.addRead();
  },

  getContentHeight: function() {
    this.timeout = setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-content').boundingClientRect((rect) => {
        this.contentHeight = rect.height;
        clearTimeout(this.timeout);
      }).exec();
     }, 300);
  },
  getTitleHeight: function() {
    this.timeout = setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-title').boundingClientRect((rect) => {
        this.titleHeight = (rect.height + 16);
        clearTimeout(this.timeout);
      }).exec();
    }, 300);
  },

  openComment: function () {
    this.switchComment(true);
  },

  closeComment: function () {
    this.switchComment(false);
  },

  switchComment: function (status) {
    this.setData({
      isShowComment: status
    });
  },

  addRead: function () {
    request(readLater, {
      content_id: this.articleId,
      content_type: "Article",
      progress: this.getProgress()
    }, 'POST')
  },

  scroll: function (event) {
    if (this.titleHeight === undefined) return;

    const { scrollTop } = event.detail;
    this.scrollTop = scrollTop;
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
      path: `/pages/article/article?id=${id}&title=${title}&from=weapp`
    };
  },
});
