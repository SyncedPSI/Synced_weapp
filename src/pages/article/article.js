import { request, getDateDiff, showTipToast, showLoading, hideLoading, showErrorToast } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage } from 'utils/canvas';
import { articleDetail, readLater } from "config/api";
const WxParse = require("wxParse/wxParse.js");

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
    articleOwn: null,
    hiddenShared: true,
    commentStr: null,
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isLogin: false,
    userInfo: null,
    canvasHeight: 0,
    actionSheetHidden: true,
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
      isLogin: getApp().globalData.isLogin,
      isFromWeapp: from === "weapp",
      userInfo: wx.getStorageSync('userInfo')
    });

    request(`${articleDetail}${options.id}`)
      .then(res => {
        const article = res.data;
        const articleOwn = article.column || article.author;

        article.publishedAt = getDateDiff(res.data.published_at);
        WxParse.wxParse("article_content", "html", res.data.content, this, 5);
        this.setData({
          article,
          articleOwn,
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
    const { title, id } = this.data;
    return {
      title,
      path: `/pages/article/article?id=${id}&title=${title}&from=weapp`
    };
  },

  drawImgae: function() {
    showLoading('图片生成中');
    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 24;
    this.ctx = wx.createCanvasContext('js-canvas');
    this.ctx.setTextBaseline('top');
    const maxWidth = this.width - this.paddingLeft * 2;

    const titleInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: this.data.article.title,
      lineHeight: 30,
    });

    const heightInfo = {
      coverTop: 0,
      coverHeight: 190,
      titleTop: 190 + 20,
      qrcodeHeight: 90,
    };

    let descInfo = null;
    if (this.data.commentStr === null) {
      descInfo = getWrapTextHeight({
        maxWidth,
        ctx: this.ctx,
        text: this.data.article.description,
        lineHeight: 28,
        fontSize: 17
      });

      heightInfo.descTop = heightInfo.titleTop + titleInfo.height + 20;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 34;
    } else {
      // 头像 加 评论
      descInfo = getWrapTextHeight({
        ctx: this.ctx,
        text: this.data.commentStr,
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

    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 10;
    this.height = heightInfo.tipTop + 20 + 36;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, descInfo, heightInfo);
    });
  },

  drawFail: function (msg) {
    console.log('download cover fail', msg);
    hideLoading();
    showErrorToast('生成失败,请重试');
  },

  draw: function (titleInfo, descInfo, heightInfo) {
    const hrCenter = this.width / 2;
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);

    wx.downloadFile({
      url: `${this.data.article.cover_image_url}?imageView2/1/w/375/h/190`,
      success: (res) => {
        if (res.statusCode === 200) {
          // cover
          this.ctx.drawImage(res.tempFilePath, 0, 0, this.width, heightInfo.coverHeight);
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
          if (this.data.commentStr === null) {
            // title
            drawMultiLines({
              ctx: this.ctx,
              fontSize: 17,
              text: descInfo,
              x: this.paddingLeft,
              y: heightInfo.descTop,
              lineHeight: 28,
            });
            this.drawOther(heightInfo, hrCenter);
          } else {
            const markHeight = 20;
            const markWidth = 26;
            const avatarHalfHeight = 10;
            // left mark
            this.ctx.drawImage('/icons/article_mark_left.png', this.paddingLeft, heightInfo.leftMarkTop, markWidth, markHeight);
            this.ctx.drawImage('/icons/article_mark_right.png', this.width - this.paddingLeft * 2 - markHeight, heightInfo.rightMarkTop, markWidth, markHeight);
            drawOneLine({
              ctx: this.ctx,
              fontSize: 14,
              color: '#717171',
              text: this.data.userInfo.nickName,
              x: 33 + avatarHalfHeight * 2 + 5,
              y: heightInfo.userTop + 3,
            });

            drawMultiLines({
              ctx: this.ctx,
              fontSize: 17,
              text: descInfo,
              x: 33,
              y: heightInfo.descTop,
              lineHeight: 28,
            });
            wx.downloadFile({
              url: this.data.userInfo.avatarUrl,
              success: (res) => {
                if (res.statusCode === 200) {
                  // avatar
                  this.ctx.save();
                  this.ctx.arc(33 + avatarHalfHeight, heightInfo.userTop + avatarHalfHeight, avatarHalfHeight, 0, 2 * Math.PI);
                  this.ctx.clip();
                  this.ctx.drawImage(res.tempFilePath, 33, heightInfo.userTop, avatarHalfHeight * 2, avatarHalfHeight * 2);
                  this.ctx.restore();
                  this.drawOther(heightInfo, hrCenter);
                }
              }
            });
          }
        } else {
          this.drawFail(res);
        }
      },
      fail: (error) => {
        this.drawFail(error);
      }
    })
  },
  drawOther: function (heightInfo, hrCenter) {
    // qrocde + tip
    this.ctx.drawImage('/images/qrcode.png', (this.width - heightInfo.qrcodeHeight) / 2, heightInfo.qrcodeTop, heightInfo.qrcodeHeight, heightInfo.qrcodeHeight);
    drawOneLine({
      ctx: this.ctx,
      fontSize: 14,
      color: '#717171',
      text: '长按小程序码，阅读原文',
      x: hrCenter,
      y: heightInfo.tipTop,
      isCenter: true,
    });

    hideLoading();
    this.ctx.draw(false, () => {
      saveImage(this.width, this.height, () => {
        this.closeShared();
        this.openActionSheet();
      })
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
