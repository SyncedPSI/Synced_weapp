import { request, showTipToast, showErrorToast, showLoading, hideLoading } from "utils/util";
import { dailyShow } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    isFromWeapp: false,
    isFetching: true,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
    canvasHeight: 0,
    showLoading: true,
  },
  onLoad: function(option) {
    showLoading('图片生成中');
    const { id, from } = option;
    this.setData({
      id,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
    });

    request(`${dailyShow}${option.id}`)
      .then(res => {
        const daily = res.data;
        this.setData({
          daily,
          isFetching: false
        }, () => {
          this.getHight();
        });
      });
  },
  getHight: function() {
    wx.createSelectorQuery().select('#js-get-width').boundingClientRect((rect) => {
      const { width } = rect;
      this.width = width;
      this.paddingLeft = 15;

      this.ctx = wx.createCanvasContext('js-canvas');
      this.ctx.setTextBaseline('top');
      const { title, content } = this.data.daily;
      const titleInfo = this.getWrapTextHeight({
        text: title,
        lineHeight: 26,
        fontSize: 22
      });
      const contentInfo = this.getWrapTextHeight({
        text: content,
        lineHeight: 30,
        fontSize: 16
      });
      // padding title-height padding hr padding create_at padding
      // content-height padding img padding text padding
      const heightInfo = {
        titleTop: 30
      };

      heightInfo.hrTop = heightInfo.titleTop + titleInfo.height + 20;
      heightInfo.createAtTop = heightInfo.hrTop + 24;
      heightInfo.contentTop = heightInfo.createAtTop + 14 + 20;
      heightInfo.imgTop = heightInfo.contentTop + contentInfo.height + 36;
      heightInfo.tapTop = heightInfo.imgTop + 90 + 7;
      this.height = heightInfo.tapTop + 14 + 30;
      console.log(heightInfo)

      this.setData({
        canvasHeight: this.height
      }, () => {
        this.draw(titleInfo, contentInfo, heightInfo);
      });
    }).exec();
  },
  draw: function (titleInfo, contentInfo, heightInfo) {
      // set ctx
      this.setSquare();
      // bg
      this.drawBg();
      // title
      this.drawFont(22, '#282828', titleInfo, this.paddingLeft, heightInfo.titleTop, true, 26);
      // hr
      this.ctx.setStrokeStyle('#282828');
      const hrCenter = this.width / 2;
      this.drawLine(hrCenter - 25, heightInfo.hrTop, hrCenter + 25, heightInfo.hrTop, 2);
      // time
      this.drawFont(14, '#9d9d9d', this.data.daily.created_at, hrCenter, heightInfo.createAtTop, false);
      // content
      this.drawFont(16, '#414141', contentInfo, this.paddingLeft, heightInfo.contentTop, true, 30);
      // img
      // drawImage(dx, dy, dWidth, dHeight)
      this.ctx.drawImage('/images/qrcode.png', (this.width - 90) / 2, heightInfo.imgTop, 90, 90);
      // word
      this.drawFont(14, '#9d9d9d', '长按小程序码，了解机器之心', hrCenter, heightInfo.tapTop, false);
      this.ctx.draw();
      hideLoading();
      this.setData({
        showLoading: false,
      });
  },
  setSquare: function() {
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.setFillStyle('#fff');
    this.ctx.fill();
  },
  drawLine: function(fromX, fromY, toX, toY, lineWidth = 1) {
    this.ctx.beginPath();
    this.ctx.setLineWidth(lineWidth)
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  },
  drawBg: function() {
    this.ctx.setStrokeStyle('#f9f9f9');
    const step = 10;
    const countX = this.width / step;
    const countY = this.height / step;
    for (let i = 0; i < countX; i++) {
      this.drawLine(i * step, 0, i * step, this.height);
    }

    for (let i = 0; i < countY; i++) {
      this.drawLine(0, i * step, this.width, i * step);
    }
  },
  drawFont: function (fontSize, color, text, x, y, isWrap = true, lineHeight = fontSize) {
    this.ctx.setFontSize(fontSize);
    this.ctx.setFillStyle(color);
    if (isWrap) {
      this.ctx.setTextAlign('left');
      text.splitText.forEach((line) => {
        this.ctx.fillText(line, x, y);
        y += lineHeight;
      });
    } else {
      this.ctx.setTextAlign('center');
      this.ctx.fillText(text, x, y);
    }
  },
  getWrapTextHeight: function ({text, lineHeight, fontSize}) {
    this.ctx.setFontSize(fontSize);
    const maxWidth = this.width - this.paddingLeft * 2;
    const splitText = [];
    let height = 0;
    const arrText = text.split('');
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
    return {
      splitText,
      height,
    }
  },
  saveImage: function() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      canvasId: 'js-canvas',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            showTipToast('图片已保存至相册');
          },
          fail: function(error) {
            if (error.errMsg === 'saveImageToPhotosAlbum:fail:auth denied') {
              wx.openSetting({
                success: function(setting) {
                  console.log(setting);
                }
              });
            } else {
              showErrorToast('保存失败');
            }
          }
        });
      },
      fail: function(error) {
        showErrorToast('生成失败');
      }
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
