import { request, showTipToast, showLoading, hideLoading } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, saveImage, drawQrcode, drawComment, drawOneLine } from 'utils/canvas';
import { dailyDetail } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    navigateTitle: '',
    isFromWeapp: false,
    isFetching: true,
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
    showUrl: null,
    hiddenShared: true,
    commentStr: null,
    userInfo: null,
    actionSheetHidden: true,
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

    request(`${dailyDetail}${option.id}`)
      .then(res => {
        const daily = res.data;
        const showUrl = daily.url && daily.url.match(new RegExp('^(http)?s?://([^/?#]+)(?:[/?#]|$)', 'i'));
        this.setData({
          navigateTitle: daily.title,
          daily,
          isFetching: false,
          showUrl: showUrl[showUrl.length - 1],
          userInfo: wx.getStorageSync('userInfo')
        });
      });
    this.initCanvas();
  },
  initCanvas: function () {
    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 24;
    this.ctx = wx.createCanvasContext('js-canvas');
    this.ctx.setTextBaseline('top');
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
      path: `/pages/dailies/detail/detail?id=${id}&from=weapp`,
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

  drawImgae: function() {
    if (this.data.commentStr === null) {
       wx.navigateTo({
         url: `/pages/dailies/share/share?id=${this.data.daily.id}`
       });
    } else {
      this.startDraw();
    }
  },

  startDraw: function () {
    showLoading('图片生成中');
    const maxWidth = this.width - this.paddingLeft * 2;

    const titleInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: this.data.daily.title,
      lineHeight: 30,
    });

    const heightInfo = {
      coverTop: 0,
      coverHeight: 190,
      titleTop: 190 - 35,
      qrcodeHeight: 90,
    };

    const descInfo = getWrapTextHeight({
      ctx: this.ctx,
      text: this.data.commentStr,
      lineHeight: 28,
      fontSize: 17,
      maxWidth: this.width - 33 * 2
    });

    // heightInfo.coverHeight = 190
    heightInfo.titleTop = 190 - 35 - titleInfo.height;
    heightInfo.timeTop = 190 - 12 - 19;
    heightInfo.leftMarkTop = 190 + 30;
    heightInfo.userTop = 190 + 43;
    heightInfo.descTop = 190 + 71;
    heightInfo.rightMarkTop = heightInfo.descTop + descInfo.height - 8;
    heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 36;

    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 9;
    this.height = heightInfo.tipTop + 20 + 46;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, descInfo, heightInfo);
    });
  },

  draw: function (titleInfo, descInfo, heightInfo) {
    const hrCenter = this.width / 2;
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);

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
      text: this.data.daily.created_at,
      x: 24,
      y: heightInfo.timeTop,
    });

    drawComment({
      ctx: this.ctx,
      userInfo: this.data.userInfo,
      heightInfo,
      comment: descInfo,
      leftMarkOffset: this.paddingLeft,
      rightMarkOffset: this.width - this.paddingLeft * 2,
      cb: () => {
        this.drawOther(heightInfo, hrCenter);
      }
    });
  },
  drawOther: function (heightInfo, hrCenter) {
    // qrocde + tip
    drawQrcode({
      ctx: this.ctx,
      imgX: (this.width - heightInfo.qrcodeHeight) / 2,
      imgTop: heightInfo.qrcodeTop,
      hrCenter,
      tipTop: heightInfo.tipTop
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
