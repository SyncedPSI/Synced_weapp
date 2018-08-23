import { request, showTipToast, showErrorToast } from "utils/util";
import { dailyShow } from "config/api";

const app = getApp();

Page({
  data: {
    id: null,
    isFetching: true,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false,
    canvasHeight: 0
  },
  onLoad: function(option) {
    const { id } = option;
    this.setData({
      id,
      isLogin: app.globalData.isLogin
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
    this.paddingLeft = 15;
    this.paddingTop = 40;
    wx.createSelectorQuery().select('#js-daily-image').boundingClientRect((rect) => {
      const { width, height } = rect;
      this.setData({
        canvasHeight: height
      });
      this.width = width;
      this.height = height;
      this.activeHight = 0;
      this.ctx = wx.createCanvasContext('js-canvas');
      const { title, content, created_at } = this.data.daily;

      // set ctx
      this.setSquare();
      // bg
      this.drawBg();
      // title
      this.drawFont(22, '#282828', title, this.paddingLeft, this.paddingTop, true, 26);
      // hr
      this.ctx.setStrokeStyle('#282828');
      const hrCenter = this.width / 2;
      this.drawLine(hrCenter - 25, this.activeHight + 20, hrCenter + 25, this.activeHight + 20, 4);
      // time
      this.drawFont(14, '#9d9d9d', created_at, this.width / 2, this.activeHight + 44, false);
      this.activeHight += 78;
      // content
      this.drawFont(16, '#414141', content, this.paddingLeft, this.activeHight, true, 30);
      // img
      // drawImage(dx, dy, dWidth, dHeight)
      this.ctx.drawImage('/icon_png/qrcode.png', (this.width - 108) / 2, this.activeHight + 25, 108, 108);
      // word
      this.activeHight += 133;
      this.drawFont(14, '#9d9d9d', '长按小程序码，了解机器之心', this.width / 2, this.activeHight + 20, false);

      this.ctx.draw();
    }).exec();
  },
  setSquare: function() {
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.setFillStyle('#fff');
    this.ctx.fill();
  },
  drawStroke: function (color, fromX, fromY, toX, toY) {
    this.ctx.setStrokeStyle(color);
    this.ctx.strokeRect(fromX, fromY, toX, toY);
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
    // 需要再描一次边
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

    var arrText = text.split('');
    var line = '';
    for (var n = 0; n < arrText.length; n++) {
      var testLine = line + arrText[n];
      var metrics = this.ctx.measureText(testLine);
      var testWidth = metrics.width;
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
    showTipToast('图片生成中', 'loading', 50000);
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
            console.log(error);
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
        console.log(res.tempFilePath)
      },
      fail: function(error) {
        console.log(error);
        showErrorToast('生成失败');
      }
    });
  }
});
