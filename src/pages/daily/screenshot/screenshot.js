import { request, showLoading, hideLoading } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage } from 'utils/canvas';
import { dailyDetail } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    navigateTitle: '',
    isFromWeapp: false,
    isFetching: true,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
    canvasHeight: 0,
    showLoading: true,
    actionSheetHidden: true,
  },
  onLoad: function(option) {
    showLoading('图片生成中');
    this.ctx = wx.createCanvasContext('js-canvas');
    this.ctx.setTextBaseline('top');

    request(`${dailyDetail}${option.id}`)
      .then(res => {
        const daily = res.data;
        this.setData({
          navigateTitle: daily.title,
          daily,
          isFetching: false
        }, () => {
          this.getHight();
        });
      });
    const { id, from } = option;
    this.setData({
      id,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
    });
  },
  getHight: function() {
    this.width = getApp().globalData.systemInfo.screenWidth - 40;
    this.paddingLeft = 20;
    const maxWidth = this.width - this.paddingLeft * 2;
    const { title, content } = this.data.daily;
    const titleInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: title,
      lineHeight: 30,
    });
    const contentInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: content,
      lineHeight: 30,
      fontSize: 16
    });

    const heightInfo = {
      bannerHeight: 185,
      imageHeight: 90,
    };
    heightInfo.createAtTop = heightInfo.bannerHeight - 15 - 14;
    heightInfo.titleTop = heightInfo.createAtTop - titleInfo.height + 4;
    heightInfo.contentTop = heightInfo.bannerHeight + 20;
    heightInfo.imgTop = heightInfo.contentTop + contentInfo.height + 22;
    heightInfo.tipTop = heightInfo.imgTop + heightInfo.imageHeight + 7;
    this.height = heightInfo.tipTop + 14 + 30;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, contentInfo, heightInfo);
    });
  },
  draw: function (titleInfo, contentInfo, heightInfo) {
      // set ctx
      setBg(this.ctx, this.width, this.height);
      this.ctx.drawImage('/images/daily_banner.png', 0, 0, this.width, heightInfo.bannerHeight);
      // title
      drawMultiLines({
        ctx: this.ctx,
        color: '#fff',
        text: titleInfo,
        x: this.paddingLeft,
        y: heightInfo.titleTop,
        lineHeight: 26,
        isBold: true,
      });
      // time
      drawOneLine({
        ctx: this.ctx,
        fontSize: 14,
        color: '#f2f2f2',
        text: this.data.daily.created_at,
        x: this.paddingLeft,
        y: heightInfo.createAtTop,
      });
      // content
      drawMultiLines({
        ctx: this.ctx,
        fontSize: 16,
        color: '#414141',
        text: contentInfo,
        x: this.paddingLeft,
        y: heightInfo.contentTop,
        lineHeight: 30,
      });
      // img
      // drawImage(dx, dy, dWidth, dHeight)
      this.ctx.drawImage('/images/qrcode.png', (this.width - heightInfo.imageHeight) / 2, heightInfo.imgTop, heightInfo.imageHeight, heightInfo.imageHeight);
      // word
      drawOneLine({
        ctx: this.ctx,
        fontSize: 14,
        color: '#717171',
        text: '长按小程序码，了解机器之心',
        x: this.width / 2,
        y: heightInfo.tipTop,
        isCenter: true,
      });
      this.ctx.draw();
      hideLoading();
      this.setData({
        showLoading: false,
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
  saveImage: function() {
    saveImage(this.width, this.height, () => {
      this.openActionSheet();
    });
  },
  onShareAppMessage: function() {
    const { id, daily: { title } }= this.data;
    return {
      title,
      path: `/pages/daily/screenshot/screenshot?id=${id}&from=weapp`,
    };
  },
});
