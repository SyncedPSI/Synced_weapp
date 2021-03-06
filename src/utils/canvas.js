import { showTipToast, showErrorToast, hideLoading } from './util';

const isPunctuation = (char) => {
  return (char === '，' || char === '。')
};

export const setBg = (ctx, width, height, startX = 0, startY = 0, color = '#fff') => {
  ctx.setFillStyle(color);
  ctx.fillRect(startX, startY, width, height);
};

export const getWrapTextHeight = ({ctx, maxWidth, text, lineHeight, fontSize = 22}) => {
  const splitArr = text.split(/\n\r/);
  ctx.setFontSize(fontSize);
  const splitText = [];
  let height = 0;
  const length = splitArr.length;

  for (let i = 0; i < length; i++) {
    const arrText = splitArr[i].trim().split('');
    let line = '';
    for (let n = 0; n < arrText.length; n++) {
      const currentChar = arrText[n];
      const testLine = line + currentChar;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && n > 0) {
        if (isPunctuation(currentChar)) {
          const lastIndex = line.length - 1;
          const last = line[lastIndex];
          splitText.push(line.slice(0, lastIndex));
          line = last + currentChar;
        } else {
          splitText.push(line);
          line = currentChar;
        }
        height += lineHeight;
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

export const drawMultiLines = ({ctx, fontSize = 22, color = '#121212', text, x, y, lineHeight = fontSize, isBold = false,  textAlign = 'left'}) => {
  ctx.setFontSize(fontSize);
  ctx.setFillStyle(color);
  ctx.setTextAlign(textAlign);
  text.splitText.forEach((line) => {
    if (isBold) {
      ctx.fillText(line, x, y - 0.5);
      ctx.fillText(line, x - 0.5, y);
    }
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
}

export const drawOneLine = ({ctx, fontSize, color, text, x, y, isCenter = false, isBold = false}) => {
  ctx.setFontSize(fontSize);
  ctx.setFillStyle(color);
  if (isCenter) {
    ctx.setTextAlign('center');
  }
  if (isBold) {
    ctx.fillText(text, x, y - 0.5);
    ctx.fillText(text, x - 0.5, y);
  }
  ctx.fillText(text, x, y);
}

export const drawQrcode = ({ctx, imgX, imgTop, hrCenter, tipTop, imgUrl = '/images/qrcode.png', cb}) => {
  const afterDrawImage = () => {
    drawOneLine({
      ctx,
      fontSize: 14,
      color: '#7d7d7d',
      text: '长按小程序码，阅读原文',
      x: hrCenter,
      y: tipTop,
      isCenter: true,
    });
    hideLoading();
    cb();
  };

  const useDefaultUrl = () => {
    ctx.drawImage('/images/qrcode.png', imgX, imgTop, 90, 90);
    afterDrawImage();
  }

  if (imgUrl === '/images/qrcode.png') {
    useDefaultUrl();
  } else {
    wx.downloadFile({
      url: imgUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          ctx.drawImage(res.tempFilePath, imgX, imgTop, 90, 90);
          afterDrawImage();
        } else {
          useDefaultUrl();
        }
      },
      fail: (error) => {
        console.log('get weacode url failed', error);
        useDefaultUrl();
      }
    })
  }
}

const noLoop = () => {};

export const saveImage = (width, height, authErrorCb, successCb = noLoop) => {
  wx.canvasToTempFilePath({
    x: 0,
    y: 0,
    width,
    height,
    canvasId: 'js-canvas',
    success: (res) => {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: function () {
          showTipToast('图片已保存');
          successCb();
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
      showErrorToast('再试一次');
    }
  });
};

export const drawFail = (msg) => {
  console.log('download cover fail', msg);
  hideLoading();
  showErrorToast('生成失败,请重试');
};

export const downloadImage = (url, successCb) => {
  wx.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode === 200) {
        successCb(res.tempFilePath);
      } else {
        drawFail(res);
      }
    },
    fail: (error) => {
      drawFail(error);
    }
  })
}

export const drawComment = ({ctx, userInfo, heightInfo, comment, leftMarkOffset, rightMarkOffset, cb}) => {
  const markHeight = 20;
  const markWidth = 26;
  const avatarHalfHeight = 15;
  // left mark
  ctx.drawImage('/icons/article_mark_left.png', leftMarkOffset, heightInfo.leftMarkTop, markWidth, markHeight);
  ctx.drawImage('/icons/article_mark_right.png', rightMarkOffset - markHeight, heightInfo.rightMarkTop, markWidth, markHeight);
  const { nickName, nickname, pubinfo } = userInfo;
  const avatarTop = heightInfo.leftMarkTop + 8;
  const name = nickName || nickname;
  let nameTop = avatarTop;
  const nameX = 33 + avatarHalfHeight * 2 + 5;
  ctx.setFontSize(14);
  const proX = nameX + ctx.measureText(name).width + 8;

  if (pubinfo) {
    ctx.drawImage('/icons/pro.png', proX, avatarTop + 2, 27, 14);
    drawOneLine({
      ctx: ctx,
      fontSize: 12,
      color: '#a8a8a8',
      text: pubinfo,
      x: nameX,
      y: nameTop + 20,
    });
    setBg(ctx, 34, 20, getApp().globalData.systemInfo.screenWidth - 34, nameTop + 20);
  } else {
    nameTop += 5;
  }

  drawOneLine({
    ctx: ctx,
    fontSize: 14,
    color: '#7d7d7d',
    text: name,
    x: nameX,
    y: nameTop,
    isBold: true,
  });

  drawMultiLines({
    ctx: ctx,
    fontSize: 17,
    text: comment,
    x: 33,
    y: heightInfo.descTop,
    lineHeight: 28,
  });
  downloadImage((userInfo.avatarUrl || userInfo.avatar_url), (path) => {
    ctx.save();
    ctx.setFillStyle('#fff');
    ctx.arc(33 + avatarHalfHeight, avatarTop + avatarHalfHeight, avatarHalfHeight, 0, 2 * Math.PI);
    ctx.fill();
    ctx.clip();
    ctx.drawImage(path, 33, avatarTop, avatarHalfHeight * 2, avatarHalfHeight * 2);
    ctx.restore();
    cb();
  })
};
