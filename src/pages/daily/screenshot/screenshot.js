import { request, showLoading } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, drawQrcode } from 'utils/canvas';
import { dailyDetail } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    navigateTitle: '',
    isFromWeapp: false,
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
    this.paddingLeft = 25;
    const maxWidth = this.width - this.paddingLeft * 2;
    const { title, content } = this.data.daily;
    const titleInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: title,
      lineHeight: 33,
    });
    const contentInfo = getWrapTextHeight({
      ctx: this.ctx,
      maxWidth,
      text: content,
      lineHeight: 28,
      fontSize: 16
    });

    const heightInfo = {
      bannerHeight: 185,
      imageHeight: 90,
    };
    heightInfo.createAtTop = heightInfo.bannerHeight - 19 - 12;
    heightInfo.titleTop = heightInfo.createAtTop - titleInfo.height + 4;
    heightInfo.contentTop = heightInfo.bannerHeight + 25;
    heightInfo.imgTop = heightInfo.contentTop + contentInfo.height + 26;
    heightInfo.tipTop = heightInfo.imgTop + heightInfo.imageHeight + 7;
    this.height = heightInfo.tipTop + 14 + 25;

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
      this.ctx.drawImage('/images/logo_white.png', 20, 14, 48, 18);
      // title
      drawMultiLines({
        ctx: this.ctx,
        color: '#fff',
        text: titleInfo,
        x: this.paddingLeft,
        y: heightInfo.titleTop,
        lineHeight: 33,
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
        text: contentInfo,
        x: this.paddingLeft,
        y: heightInfo.contentTop,
        lineHeight: 28,
      });
      // img
      drawQrcode({
        ctx: this.ctx,
        imgX: (this.width - heightInfo.imageHeight) / 2,
        imgTop: heightInfo.imgTop,
        hrCenter: this.width / 2,
        tipTop: heightInfo.tipTop
      });
      this.ctx.draw();
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
