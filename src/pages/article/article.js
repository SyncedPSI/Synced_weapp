import { request, getDateDiff, showTipToast } from "utils/util";
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
    logoUrl: '/images/logo.svg',
    article: {
      related_nodes: [],
    },
    hiddenShared: true,
    commentStr: '李飞飞重返斯坦福后的大动作：开启「以人为中心的AI计划」',
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false,
    userInfo: null
  },

  onLoad: function(options) {
    this.needOpenShare = false;
    this.isReadFinish = false;
    this.scrollTop = 0;
    this.contentHeight = null;
    this.clientHeight = getApp().globalData.systemInfo.screenHeight + this.data.statusBarHeight;
    this.getTitleHeight();

    const { id, title, from, read_later, progress } = options;
    this.isProgress = progress;
    this.articleId = id;
    this.setData({
      id,
      title,
      isFromReadLater: read_later,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
      userInfo: wx.getStorageSync('userInfo')
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
    this.sendProgress();
  },

  onUnload: function () {
    this.sendProgress();
  },

  getProgress: function() {
    if (this.contentHeight === null) return 0;
    const offsetTop = this.scrollTop + this.clientHeight;

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

  sendProgress: function() {
    if (this.isReadFinish || this.scrollTop === 0 || !this.isProgress) {
      return;
    }

    this.addRead(false);
  },

  getContentHeight: function() {
    this.timeout = setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-content').boundingClientRect((rect) => {
        const { height, top } = rect;
        this.contentHeight = height - top;
        clearTimeout(this.timeout);
      }).exec();
     }, 300);
  },
  getTitleHeight: function() {
    this.timeout = setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-title').boundingClientRect((rect) => {
        this.titleHeight = (rect.height + 16);
      }).exec();
    }, 300);
  },

  openComment: function () {
    this.switchComment(true);
  },

  closeComment: function (event) {
    this.switchComment(false);

    const { commentStr } = event.detail;
    if (commentStr) {
      this.setData({
        commentStr
      });
    }

    if (this.needOpenShare) {
      this.needOpenShare = false;
      this.openShared();
    }
  },

  switchComment: function (status) {
    this.setData({
      isShowComment: status
    });
  },

  addRead: function (isShowTip = true) {
    request(readLater, {
      read_later: {
        content_id: this.articleId,
        content_type: "Article",
        progress: this.getProgress()
      }
    }, 'POST').then(() => {
      if (isShowTip) {
        showTipToast('添加成功');
        this.setData({
          'article.is_read_later': true
        })
      }
    })
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
    if (this.isProgress && !this.isReadFinish && this.getProgress() === 100) {
      this.sendProgress();
      this.isReadFinish =  true;
      showTipToast('已读完', 500);
    }
  },

  toggleShare: function (status) {
    this.setData({
      hiddenShared: status
    });
  },

  openShared: function() {
    this.toggleShare(false)
  },

  closeShared: function() {
    this.toggleShare(true);
  },

  openCommentInShared: function() {
    this.closeShared();
    this.openComment();
    this.needOpenShare = true;
  },

  setNavigationBarTitle: function(title = '') {
    this.setData({
      navigateTitle: title
    });
  },

  getUserInfo: function(event) {
    const { detail: { userInfo }, target: { dataset } } = event;

    app.login(userInfo, () => {
      const newData = {
        isLogin: true,
        userInfo,
      };
      const { type } = dataset;
      if (type === 'comment') {
        newData.isShowComment = true;
      } else if (type === 'read') {
        this.addRead(false);
      } else if (type === 'share') {
        this.openCommentInShared();
      }
      this.setData(newData);
    });
  },
  successLogin: function() {
    this.setData({
      isLogin: true
    })
  },

  sharedArticle: function() {
    this.closeShared();
    this.onShareAppMessage();
  },

  onShareAppMessage: function() {
    const { title, id } = this.data;
    return {
      title,
      path: `/pages/article/article?id=${id}&title=${title}&from=weapp`
    };
  },
});
