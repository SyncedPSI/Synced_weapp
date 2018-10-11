import { request, showTipToast, showErrorToast, showLoading, hideLoading } from "utils/util";
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
    const { id, from } = option;
    this.setData({
      id,
      isLogin: app.globalData.isLogin,
      isFromWeapp: from === "weapp",
    });

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
        titleTop: 30,
        imageHeight: 90,
      };

      heightInfo.hrTop = heightInfo.titleTop + titleInfo.height + 20;
      heightInfo.createAtTop = heightInfo.hrTop + 22;
      heightInfo.contentTop = heightInfo.createAtTop + 14 + 20;
      heightInfo.imgTop = heightInfo.contentTop + contentInfo.height + 36;
      heightInfo.tapTop = heightInfo.imgTop + heightInfo.imageHeight + 7;
      this.height = heightInfo.tapTop + 14 + 30;

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
      this.drawFont({
        fontSize: 22,
        color: '#282828',
        text: titleInfo,
        x: this.paddingLeft,
        y: heightInfo.titleTop,
        lineHeight: 26,
        isBold: true,
        isLastCenter: true
      });
      // hr
      this.ctx.setStrokeStyle('#282828');
      const hrCenter = this.width / 2;
      this.drawLine(hrCenter - 25, heightInfo.hrTop, hrCenter + 25, heightInfo.hrTop, 2);
      // time
      this.drawFont({
        fontSize: 14,
        color: '#9d9d9d',
        text: this.data.daily.created_at,
        x: hrCenter,
        y: heightInfo.createAtTop,
        isWrap: false,
      });
      // content
      this.drawFont({
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
      this.drawFont({
        fontSize: 14,
        color: '#9d9d9d',
        text: '长按小程序码，了解机器之心',
        x: hrCenter,
        y: heightInfo.tapTop,
        isWrap: false,
      });
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
  getWrapTextHeight: function ({text, lineHeight, fontSize}) {
    const splitArr = text.split(/\n\r/);
    this.ctx.setFontSize(fontSize);
    const maxWidth = this.width - this.paddingLeft * 2;
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
  saveImage: function() {
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
              this.openActionSheet();
            } else {
              showErrorToast('保存失败');
            }
          }
        });
      },
      fail: function() {
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
