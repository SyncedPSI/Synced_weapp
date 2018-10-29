import { request, getDateDiff, showTipToast, showLoading, hideLoading, showErrorToast } from "utils/util";
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
    this.width = getApp().globalData.systemInfo.screenWidth * 0.64;
    this.paddingLeft = 14;
    this.ctx = wx.createCanvasContext('js-canvas');
    this.ctx.setTextBaseline('top');

    const titleInfo = this.getWrapTextHeight({
      text: this.data.article.title,
      lineHeight: 20,
      fontSize: 14
    });

    const heightInfo = {
      coverTop: 0,
      titleTop: 114 + 14,
      qrcodeHeight: 64,
    };

    let descInfo = null;
    if (this.data.commentStr === null) {
      descInfo = this.getWrapTextHeight({
        text: this.data.article.description,
        lineHeight: 17,
        fontSize: 12,
        maxWidth: this.width - 20 * 2
      });

      heightInfo.descTop = heightInfo.titleTop + titleInfo.height + 20;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 34;
    } else {
      // 头像 加 评论
      descInfo = this.getWrapTextHeight({
        text: this.data.commentStr,
        lineHeight: 17,
        fontSize: 12,
        maxWidth: this.width - 20 * 2
      });

      const _contentTop = heightInfo.titleTop + titleInfo.height;
      heightInfo.leftMarkTop = _contentTop + 17;
      heightInfo.userTop = _contentTop + 27.9;
      heightInfo.descTop = _contentTop + 44;
      heightInfo.rightMarkTop = heightInfo.descTop + descInfo.height - 10;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 26;
    }

    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 12;
    this.height = heightInfo.tipTop + 17 + 16;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, descInfo, heightInfo);
    });
  },

  draw: function (titleInfo, descInfo, heightInfo) {
    const hrCenter = this.width / 2;

    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.setFillStyle('#fff');
    this.ctx.fillRect(0, 0, this.width, this.height);

    wx.downloadFile({
      url: this.data.article.cover_image_url,
      success: (res) => {
        if (res.statusCode === 200) {
          // cover
          this.ctx.drawImage(res.tempFilePath, 0, 0, this.width, 114);
          this.ctx.setFillStyle('rgba(40, 40, 40, 0.3)');
          this.ctx.fillRect(0, 0, this.width, 114);
          this.ctx.setFillStyle('#fff');
          this.ctx.drawImage('/images/logo_white.png', 14, 12, 45, 16);
          // title
          this.drawFont({
            fontSize: 14,
            color: '#282828',
            text: titleInfo,
            x: this.paddingLeft,
            y: heightInfo.titleTop,
            lineHeight: 20,
            isBold: true,
            isLastCenter: false
          });

          // content
          if (this.data.commentStr === null) {
            // title
            this.drawFont({
              fontSize: 12,
              color: '#282828',
              text: descInfo,
              x: this.paddingLeft,
              y: heightInfo.descTop,
              lineHeight: 17,
              isBold: false,
              isLastCenter: false
            });
            this.drawOther(heightInfo, hrCenter);
          } else {
            const markHeight = 20;
            const avatarHeight = 12;
            // left mark
            this.ctx.drawImage('/icons/article_mark_left.png', this.paddingLeft, heightInfo.leftMarkTop, markHeight, markHeight);
            this.ctx.drawImage('/icons/article_mark_right.png', this.width - this.paddingLeft * 2 - markHeight, heightInfo.rightMarkTop, markHeight, markHeight);
            this.drawFont({
              fontSize: 10,
              color: '#717171',
              text: this.data.userInfo.nickName,
              x: 20 + avatarHeight * 2 + 5,
              y: heightInfo.userTop,
              isWrap: false,
            });

            this.drawFont({
              fontSize: 12,
              color: '#282828',
              text: descInfo,
              x: 20,
              y: heightInfo.descTop,
              lineHeight: 17,
              isBold: false,
              isLastCenter: false
            });
            wx.downloadFile({
              url: this.data.userInfo.avatarUrl,
              success: (res) => {
                if (res.statusCode === 200) {
                  // cover
                  this.ctx.drawImage(res.tempFilePath, 20, heightInfo.userTop, avatarHeight, avatarHeight);
                }
                this.drawOther(heightInfo, hrCenter);
              }
            });
          }
        }
      }
    })
  },
  drawOther: function (heightInfo, hrCenter) {
    // qrocde + tip
    this.ctx.drawImage('/images/qrcode.png', (this.width - heightInfo.qrcodeHeight) / 2, heightInfo.qrcodeTop, heightInfo.qrcodeHeight, heightInfo.qrcodeHeight);
    this.drawFont({
      fontSize: 12,
      color: '#717171',
      text: '长按小程序码，阅读原文',
      x: hrCenter,
      y: heightInfo.tipTop,
      isWrap: false,
    });

    hideLoading();
    this.ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        canvasId: 'js-canvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
              showTipToast('图片已保存至相册');
            },
            fail: (error) => {
              if (error.errMsg.match('auth den')) {
                showErrorToast('无权访问相册');
                this.closeShared();
                this.openActionSheet();
              } else {
                showErrorToast('保存失败');
              }
            }
          });
        },
        fail: function (msg) {
          console.log(msg)
          showErrorToast('生成失败');
        }
      });
    });
  },

  drawFont: function ({ fontSize, color, text, x, y, isWrap = true, lineHeight = fontSize, isBold = false, isLastCenter = false}) {
    this.ctx.setFontSize(fontSize);
    this.ctx.setFillStyle(color);
    if (isWrap) {
      this.ctx.setTextAlign('left');
      const textLength = text.splitText.length;
      text.splitText.forEach((line, index) => {
        let start = x;
        if (isLastCenter && textLength === index + 1) {
          this.ctx.setTextAlign('center');
          start = this.width / 2;
        }

        if (isBold) {
          this.ctx.fillText(line, start, y - 0.5);
          this.ctx.fillText(line, start - 0.5, y);
        }
        this.ctx.fillText(line, start, y);
        y += lineHeight;
      });
    } else {
      this.ctx.setTextAlign('center');
      this.ctx.fillText(text, x, y);
    }
  },
  getWrapTextHeight: function ({text, lineHeight, fontSize, maxWidth = this.width - this.paddingLeft * 2}) {
    const splitArr = text.split(/\n\r/);
    this.ctx.setFontSize(fontSize);
    const splitText = [];
    let height = 0;
    for (let i = 0; i < splitArr.length; i++) {
      const arrText = splitArr[i].trim().split('');
      let line = '';
      for (let n = 0; n < arrText.length; n++) {
        const testLine = line + arrText[n];
        const metrics = this.ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          splitText.push(line);
          height += lineHeight;
          line = arrText[n];
        } else {
          line = testLine;
        }
      }
      splitText.push(line);
      height += lineHeight;
    }
    return {
      splitText,
      height,
    }
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
