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
          this.draw();
        });
      });
  },
  draw: function() {
    wx.createSelectorQuery().select('#js-daily-image').boundingClientRect((rect) => {
      const { width, height } = rect;
      this.setData({
        canvasHeight: height + 20
      });
      this.width = width;
      this.height = height + 20;
      this.paddingLeft = 15;
      this.activeHight = 36;
      this.ctx = wx.createCanvasContext('js-canvas');
      const { title, content, created_at } = this.data.daily;

      // set ctx
      this.setSquare();
      // bg
      this.drawBg();
      // title
      this.drawFont(22, '#282828', title, this.paddingLeft, this.activeHight, true, 26);
      // hr
      this.ctx.setStrokeStyle('#282828');
      const hrCenter = this.width / 2;
      this.drawLine(hrCenter - 25, this.activeHight + 24, hrCenter + 25, this.activeHight + 24, 2);
      // time
      this.drawFont(14, '#9d9d9d', created_at, hrCenter, this.activeHight + 56, false);
      this.activeHight += 90;
      // content
      this.drawFont(16, '#414141', content, this.paddingLeft, this.activeHight, true, 30);
      // img
      // drawImage(dx, dy, dWidth, dHeight)
      this.ctx.drawImage('/images/qrcode.png', (this.width - 90) / 2, this.activeHight + 36, 90, 90);
      // word
      this.activeHight += 150;
      this.drawFont(14, '#9d9d9d', '长按小程序码，了解机器之心', hrCenter, this.activeHight, false);
      this.ctx.draw();
      hideLoading();
      this.setData({
        showLoading: false,
      });
    }).exec();
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
      this.wrapText(text, x, y, lineHeight);
    } else {
      this.ctx.setTextAlign('center');
      this.ctx.fillText(text, x, y);
    }
  },
  wrapText: function (text, x, y, lineHeight) {
    const maxWidth = this.width - this.paddingLeft * 2;

    const arrText = text.split('');
    const line = '';
    for (let n = 0; n < arrText.length; n++) {
      const testLine = line + arrText[n];
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, y);
        line = arrText[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, y);
    this.activeHight = y;
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
