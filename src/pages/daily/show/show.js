import { request, showTipToast, showLoading } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, saveImage, drawQrcode, drawComment, drawOneLine } from 'utils/canvas';
import { dailyDetail } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    navigateTitle: '',
    isFromWeapp: false,
    daily: null,
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
    showUrl: null,
    hiddenShared: true,
    commentStr: null,
    userInfo: null,
    canvasHeight: 0,
    actionSheetHidden: true,
    isSharedComment: false,
    targetComment: null
  },

  onLoad: function(option) {
    const { id, from } = option;
    this.setData({
      id,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
    });

    request(`${dailyDetail}${id}`)
      .then(res => {
        const daily = res.data;
        const showUrl = daily.url && daily.url.match(new RegExp('^(http)?s?://([^/?#]+)(?:[/?#]|$)', 'i'));
        this.setData({
          navigateTitle: daily.title,
          daily,
          showUrl: showUrl[showUrl.length - 1],
          userInfo: wx.getStorageSync('userInfo')
        });
      });
    this.initCanvas();
  },

  openComment: function() {
    this.switchComment(true);
  },

  closeComment: function(event) {
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

  switchComment: function(status) {
    this.setData({
      isShowComment: status
    });
  },

  initCanvas: function () {
    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 24;
    this.ctx = wx.createCanvasContext('js-canvas');
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
  copySource: function() {
    wx.setClipboardData({
      data: this.data.daily.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  },

  toggleShare: function (status) {
    this.setData({
      hiddenShared: status
    });
  },

  openShared: function () {
    this.toggleShare(false)
  },

  closeShared: function () {
    this.toggleShare(true);
  },

  openCommentInShared: function () {
    this.closeShared();
    this.openComment();
    this.needOpenShare = true;
  },

  sharedDaily: function () {
    this.closeShared();
    this.onShareAppMessage();
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
    const { daily } = this.data;

    const titleInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: daily.title,
      lineHeight: 30,
    });

    const heightInfo = {
      coverTop: 0,
      coverHeight: 190,
      timeTop: 190 - 12 - 19,
      qrcodeHeight: 90,
    };
    heightInfo.titleTop = 190 - 35 - titleInfo.height;

    let descInfo = null;
    if (commentStr === null) {
      descInfo = getWrapTextHeight({
        ctx: this.ctx,
        text: daily.content,
        lineHeight: 28,
        fontSize: 16,
        maxWidth: this.width - 30 * 2
      });

      heightInfo.descTop = 190 + 25;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 26;
    } else {
      descInfo = getWrapTextHeight({
        ctx: this.ctx,
        text: commentStr,
        lineHeight: 28,
        fontSize: 17,
        maxWidth: this.width - 33 * 2
      });

      // heightInfo.coverHeight = 190
      heightInfo.leftMarkTop = 190 + 30;
      heightInfo.userTop = 190 + 43;
      heightInfo.descTop = 190 + 71;
      heightInfo.rightMarkTop = heightInfo.descTop + descInfo.height - 8;
      heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 36;
    }

    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 9;
    this.height = heightInfo.tipTop + 20 + 46;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, descInfo, heightInfo, commentStr, userInfo);
    });
  },

  draw: function (titleInfo, descInfo, heightInfo, commentStr, userInfo) {
    const { daily } = this.data;
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);
    this.ctx.setTextBaseline('top');

    // cover
    this.ctx.drawImage('/images/daily_banner.png', 0, 0, this.width, heightInfo.coverHeight);
    this.ctx.drawImage('/images/logo_white.png', 20, 14, 48, 18);

    // title
    drawMultiLines({
      ctx: this.ctx,
      text: titleInfo,
      x: 24,
      y: heightInfo.titleTop,
      lineHeight: 30,
      isBold: true,
      color: '#ffffff',
    });

    drawOneLine({
      ctx: this.ctx,
      fontSize: 13,
      color: '#f2f2f2',
      text: daily.created_at,
      x: 24,
      y: heightInfo.timeTop,
    });

    if (commentStr === null) {
      drawMultiLines({
        ctx: this.ctx,
        text: descInfo,
        fontSize: 16,
        x: 30,
        y: heightInfo.descTop,
        lineHeight: 28,
        color: '#121212',
      });
      this.drawOther(heightInfo);
    } else {
      drawComment({
        ctx: this.ctx,
        userInfo: userInfo,
        heightInfo,
        comment: descInfo,
        leftMarkOffset: this.paddingLeft,
        rightMarkOffset: this.width - this.paddingLeft * 2,
        cb: () => {
          this.drawOther(heightInfo);
        }
      });
    }
  },
  drawOther: function (heightInfo) {
    // qrocde + tip
    drawQrcode({
      ctx: this.ctx,
      imgX: (this.width - heightInfo.qrcodeHeight) / 2,
      imgTop: heightInfo.qrcodeTop,
      hrCenter: this.width / 2,
      tipTop: heightInfo.tipTop
    });

    this.ctx.draw(false, () => {
      saveImage(this.width, this.height, () => {
        this.closeShared();
        this.openActionSheet();
      }, () => {
        this.setData({
          isSharedComment: false,
        });
        this.closeShared();
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
