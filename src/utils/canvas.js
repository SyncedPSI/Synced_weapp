import { showTipToast, showErrorToast } from './util';

export const setBg = (ctx, width, height, color = '#fff') => {
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, width, height);
};

export const getWrapTextHeight = ({ctx, maxWidth, text, lineHeight, fontSize = 22}) => {
  const splitArr = text.split(/\n\r/);
  ctx.setFontSize(fontSize);
  const splitText = [];
  let height = 0;
  for (let i = 0; i < splitArr.length; i++) {
    const arrText = splitArr[i].trim().split('');
    let line = '';
    for (let n = 0; n < arrText.length; n++) {
      const testLine = line + arrText[n];
      const testWidth = ctx.measureText(testLine).width;
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
};

export const drawMultiLines = ({ctx, fontSize = 22, color = '#282828', text, x, y, lineHeight = fontSize, isBold = false}) => {
  ctx.setFontSize(fontSize);
  ctx.setFillStyle(color);
  ctx.setTextAlign('left');
  text.splitText.forEach((line) => {
    if (isBold) {
      ctx.fillText(line, x, y - 0.5);
      ctx.fillText(line, x - 0.5, y);
    }
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
}

export const drawOneLine = ({ctx, fontSize, color, text, x, y, isCenter = false}) => {
  ctx.setFontSize(fontSize);
  ctx.setFillStyle(color);
  if (isCenter) {
    ctx.setTextAlign('center');
  }
  ctx.fillText(text, x, y);
}

export const saveImage = (width, height, authErrorCb) => {
  wx.canvasToTempFilePath({
    x: 0,
    y: 0,
    width: width,
    height: height,
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
            authErrorCb();
          } else {
            showErrorToast('保存失败');
          }
        }
      });
    },
    fail: function () {
      showErrorToast('生成失败');
    }
  });
};
