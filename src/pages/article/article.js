import { request, getDateDiff, showTipToast, showLoading, getWxcodeUrl } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, saveImage, drawQrcode, drawComment, downloadImage } from 'utils/canvas';
import { articleDetail, readLater } from "config/api";
const WxParse = require("wxParse/wxParse.js");

Page({
  data: {
    navigateTitle: '',
    id: "",
    isFromWeapp: false,
    isFetching: true,
    article: {
      related_nodes: [],
    },
    articleOwn: null,
    hasMetadata: false,
    hiddenShared: true,
    commentStr: null,
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false,
    userInfo: null,
    canvasHeight: 0,
    actionSheetHidden: true,
    isSharedComment: false,
    targetComment: null
  },

  onLoad: function(options) {
    this.needOpenShare = false;
    this.isReadFinish = false;
    this.scrollTop = 0;
    this.contentHeight = null;
    this.clientHeight = getApp().globalData.systemInfo.screenHeight + this.data.statusBarHeight;

    if (options.id) {
      const { id, from, read_later, progress } = options;
      this.isProgress = progress;
      this.articleId = id;

      this.setData({
        id,
        isFromReadLater: read_later || false,
        isLogin: getApp().globalData.isLogin,
        isFromWeapp: from === "weapp",
        userInfo: wx.getStorageSync('userInfo')
      });
    } else {
      const scene = decodeURIComponent(options.scene);
      this.articleId = scene;
      this.isProgress = false;
      this.setData({
        id: scene,
        isFromReadLater: false,
        isLogin: getApp().globalData.isLogin,
        isFromWeapp: true,
        userInfo: wx.getStorageSync('userInfo')
      });
    }

    request(`${articleDetail}${this.articleId}`)
      .then(res => {
        const article = res.data;
        const articleOwn = article.column || article.author;
        this.articleId = article.id;
        if (article.wxacode_url === null) {
          this.getWxcode(this.articleId);
        }
        article.publishedAt = getDateDiff(article.published_at);
        WxParse.wxParse("article_content", "html", article.content, this, 5);
        let hasMetadata = false;
        try {
          hasMetadata = Object.keys(article.metadata).length > 0
        } catch(err) {}
        this.setData({
          hasMetadata,
          article,
          articleOwn,
          isFetching: false
        }, () => {
          this.getTitleHeight();
          this.getContentHeight();
        });
      });
    this.initCanvas();
  },

  getWxcode: function (id) {
    getWxcodeUrl(id, 'pages/article/article', 'Article', (path) => {
      this.setData({
        'article.wxacode_url': path
      })
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
        if (rect) {
          this.contentHeight = rect.height;
        }
        clearTimeout(this.timeout);
      }).exec();
     }, 500);
  },
  getTitleHeight: function() {
    this.timeout = setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-title').boundingClientRect((rect) => {
        if (rect) {
          this.titleHeight = (rect.height + 16);
        }
      }).exec();
    }, 300);
  },

  openComment: function () {
    this.switchComment(true);
  },

  closeComment: function (event) {
    this.switchComment(false);
    if (event.detail && event.detail.commentStr) {
      this.setData({
        commentStr: event.detail.commentStr
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

  shareComment: function (event) {
    const { user, comment } = event.detail;
    this.setData({
      isSharedComment: true,
      targetComment: {
        user,
        content: comment,
      }
    });
    this.openShared();
    // this.readyDraw(comment, user);
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
      this.setNavigationBarTitle(this.data.article.title);
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

    getApp().login(userInfo, () => {
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
    const { title, id } = this.data.article;
    return {
      title,
      path: `/pages/article/article?id=${id}&from=weapp`
    };
  },

  initCanvas: function() {
    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 24;
    this.ctx = wx.createCanvasContext('js-canvas');
    this.ctx.setTextBaseline('top');
  },

  drawImage: function () {
    if (this.data.isSharedComment) {
      const { content, user } = this.data.targetComment;
      this.readyDraw(content, user);
      return;
    }

    const { commentStr, userInfo } = this.data;
    this.readyDraw(commentStr, userInfo);
  },

  readyDraw: function (commentStr, userInfo) {
    showLoading('图片生成中');
    const maxWidth = this.width - this.paddingLeft * 2;
    const { article } = this.data;

    const titleInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: article.title,
      lineHeight: 30,
    });

    const heightInfo = {
      coverTop: 0,
      coverHeight: 190,
      titleTop: 190 + 20,
      qrcodeHeight: 90,
    };

    let descInfo = null;
    if (commentStr === null) {
      descInfo = getWrapTextHeight({
        maxWidth,
        ctx: this.ctx,
        text: article.description,
        lineHeight: 28,
        fontSize: 17
      });

      heightInfo.descTop = heightInfo.titleTop + titleInfo.height + 20;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 34;
    } else {
      // 头像 加 评论
      descInfo = getWrapTextHeight({
        ctx: this.ctx,
        text: commentStr,
        lineHeight: 28,
        fontSize: 17,
        maxWidth: this.width - 33 * 2
      });

      const _contentTop = heightInfo.titleTop + titleInfo.height;
      heightInfo.leftMarkTop = _contentTop + 19;
      heightInfo.userTop = _contentTop + 33;
      heightInfo.descTop = _contentTop + 59;
      heightInfo.rightMarkTop = heightInfo.descTop + descInfo.height - 8;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 36;
    }

    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 9;
    this.height = heightInfo.tipTop + 20 + 36;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, descInfo, heightInfo, commentStr, userInfo);
    });
  },

  draw: function (titleInfo, descInfo, heightInfo, commentStr, userInfo) {
    const { article } = this.data;
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);

    downloadImage(`${article.cover_image_url}?imageView2/1/w/375/h/190`, (path) => {
      // cover
      this.ctx.drawImage(path, 0, 0, this.width, heightInfo.coverHeight);
      this.ctx.setFillStyle('rgba(40, 40, 40, 0.3)');
      this.ctx.fillRect(0, 0, this.width, heightInfo.coverHeight);
      this.ctx.setFillStyle('#fff');
      this.ctx.drawImage('/images/logo_white.png', 20, 14, 48, 18);
      // title
      drawMultiLines({
        ctx: this.ctx,
        text: titleInfo,
        x: this.paddingLeft,
        y: heightInfo.titleTop,
        lineHeight: 30,
        isBold: true,
      });

      // content
      if (commentStr === null) {
        // title
        drawMultiLines({
          ctx: this.ctx,
          fontSize: 17,
          text: descInfo,
          x: this.paddingLeft,
          y: heightInfo.descTop,
          lineHeight: 28,
        });
        this.drawOther(heightInfo);
      } else {
        drawComment({
          ctx: this.ctx,
          userInfo,
          heightInfo,
          comment: descInfo,
          leftMarkOffset: this.paddingLeft,
          rightMarkOffset: this.width - this.paddingLeft * 2,
          cb: () => {
            this.drawOther(heightInfo);
          }
        })
      }
    })
  },
  drawOther: function (heightInfo) {
    // qrocde + tip
    drawQrcode({
      ctx: this.ctx,
      imgUrl: this.data.article.wxacode_url,
      imgX: (this.width - heightInfo.qrcodeHeight) / 2,
      imgTop: heightInfo.qrcodeTop,
      hrCenter: this.width / 2,
      tipTop: heightInfo.tipTop,
      cb: () => {
        this.ctx.draw(false, () => {
          saveImage(this.width, this.height, () => {
            this.closeShared();
            this.openActionSheet();
          }, () => {
            this.closeShared();
            this.setData({
              isSharedComment: false,
            });
          })
        });
      }
    });
  },

  openActionSheet: function () {
    this.setData({
      actionSheetHidden: false
    });
  },
  closeActionSheet: function () {
    this.setData({
      actionSheetHidden: true
    });
  },
});
