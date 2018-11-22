import { request, getDateDiff, showLoading, hideLoading, showErrorToast } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, drawQrcode, drawFail, drawComment } from 'utils/canvas';
import { documents } from "config/api";
import { runInThisContext } from "vm";

Page({
  data: {
    document: null,
    isFromWeapp: false,
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX,
    isLogin: false,
    logo: "/images/logo.svg",
    hiddenShared: true,
    actionSheetHidden: true,
    isDraw: false,
    canvasHeight: 0,
    isSharedComment: false,
    targetComment: null
  },
  onLoad: function (options) {
    const { id, from } = options;
    request(`${documents}/${id}`)
      .then((res) => {
        this.setData({
          document: res.data,
          isFromWeapp: from === "weapp",
          isLogin: getApp().globalData.isLogin,
        })
      });
    this.initCanvas();
  },
  download: function() {
    showLoading('获取中');
    wx.downloadFile({
      url: this.data.document.file_url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              hideLoading();
            },
            fail: (error) => {
              console.log(error);
              showErrorToast('获取失败');
            }
          });
        } else {
          showErrorToast('获取失败');
        }
      },
      fail: (error) => {
        console.log(error);
        showErrorToast('获取失败');
      }
    })
  },
  openComment: function () {
    this.switchComment(true);
  },

  closeComment: function () {
    this.switchComment(false);
  },

  switchComment: function (status) {
    this.setData({
      isShowComment: status
    });
  },
  onShareAppMessage: function() {
    const { id, title }= this.data.document;
    return {
      title,
      path: `/pages/document/document?id=${id}&from=weapp`,
    };
  },

  fetchData: function() {
    if (!this.data.hasNextPage) return;

    const { type, id } = this.data;
    request(`${ApiRootUrl}/${type}s/${id}?page=${this.page}`)
      .then(({ data }) => {
        const oldArticles = this.data.articles;
        const { articles, has_next_page } = data;

        this.page += 1;
        articles.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });
        this.setData({
          articles: [...oldArticles, ...articles],
          hasNextPage: has_next_page,
        })
      });
  },
  onShareAppMessage: function() {
    const { type, id, author } = this.data;
    return {
      title: author.name,
      path: `/pages/author/author?is=${id}&type=${type}`,
    };
  },

  toggleShare: function (status) {
    this.setData({
      hiddenShared: status
    });
  },

  openShared: function() {
    this.toggleShare(false);
  },

  closeShared: function () {
    this.toggleShare(true);
  },

  sharedPage: function () {
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
    // this.readyDraw(comment, user);
  },

  initCanvas: function() {
    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 30;
    this.ctx = wx.createCanvasContext('js-canvas');
  },

  drawImage: function () {
    showLoading('图片生成中');
    // if (this.data.isDraw) {
    //   this.saveImage();
    //   return;
    // }

    if (this.data.isSharedComment) {
      const { content, user } = this.data.targetComment;
      this.drawComment(content, user);
      return;
    }

    this.ctx.setTextBaseline('top');
    const heightInfo = {
      bannerHeight: 252,
      titleTop: 272,
      qrcodeHeight: 90,
    };

    const titleInfo = getWrapTextHeight({
      maxWidth: this.width - 40,
      ctx: this.ctx,
      text: this.data.document.title,
      fontSize: 22,
      lineHeight: 33,
    });

    heightInfo.timeTop = heightInfo.titleTop + titleInfo.height + 10;
    heightInfo.qrcodeTop = heightInfo.timeTop + 20 + 41;
    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 9;
    this.height = heightInfo.tipTop + 20 + 30;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(titleInfo, heightInfo);
    });
  },

  draw: function (titleInfo, heightInfo) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);

    const { document } = this.data;
    wx.downloadFile({
      url: document.cover_image_url,
      success: (res) => {
        if (res.statusCode === 200) {
          // cover
          this.ctx.setFillStyle('#f2f2f2');
          this.ctx.fillRect(0, 0, this.width, heightInfo.bannerHeight);
          this.ctx.drawImage(res.tempFilePath, (this.width - 180) / 2, 30, 180, 256);
          this.ctx.drawImage('/images/logo.svg', 20, 12, 51, 19);

          // body
          this.ctx.setFillStyle('#fff');
          this.ctx.setShadow(0, -10, 10, 'rgba(18, 18, 18, 0.05)');
          this.ctx.fillRect(0, heightInfo.bannerHeight, this.width, this.height);
          this.ctx.setShadow(0, 0, 0, '#fff');

          // title
          drawMultiLines({
            ctx: this.ctx,
            fontSize: 22,
            text: titleInfo,
            x: this.width / 2,
            y: heightInfo.titleTop,
            isBold: true,
            lineHeight: 33,
            textAlign: 'center'
          });

          const hrCenter = this.width / 2;
          drawOneLine({
            ctx: this.ctx,
            fontSize: 14,
            color: '#a8a8a8',
            text: document.created_at,
            x: hrCenter,
            y: heightInfo.timeTop,
          });

          drawQrcode({
            ctx: this.ctx,
            imgX: (this.width - heightInfo.qrcodeHeight) / 2,
            imgTop: heightInfo.qrcodeTop,
            hrCenter,
            tipTop: heightInfo.tipTop
          });

          this.ctx.draw(false, () => {
            this.saveImage();
          });
        } else {
          drawFail(res);
        }
      },
      fail: (error) => {
        drawFail(error);
      }
    })
  },

  drawComment: function(comment, userInfo) {
    this.ctx.setTextBaseline('top');
    const heightInfo = {
      bannerHeight: 138,
      titleTop: 30,
      qrcodeHeight: 90,
    };

    const titleInfo = getWrapTextHeight({
      maxWidth: this.width - 40 - 96 - 16,
      ctx: this.ctx,
      text: this.data.document.title,
      fontSize: 22,
      lineHeight: 33,
    });

    heightInfo.timeTop = heightInfo.bannerHeight + 30 - 17;
    const descInfo = getWrapTextHeight({
      ctx: this.ctx,
      text: comment,
      lineHeight: 28,
      fontSize: 16,
      maxWidth: this.width - 37 * 2
    });

    heightInfo.leftMarkTop = 30 + heightInfo.bannerHeight + 30;
    heightInfo.userTop = heightInfo.leftMarkTop + 14;
    heightInfo.descTop = heightInfo.leftMarkTop + 41;
    heightInfo.rightMarkTop = heightInfo.descTop + descInfo.height - 8;
    heightInfo.qrcodeTop = heightInfo.rightMarkTop + 54;
    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 9;
    this.height = heightInfo.tipTop + 20 + 30;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.ctx.clearRect(0, 0, this.width, this.height);
      setBg(this.ctx, this.width, this.height);

      const { document } = this.data;
      wx.downloadFile({
        url: document.cover_image_url,
        success: (res) => {
          if (res.statusCode === 200) {
            this.ctx.drawImage(res.tempFilePath, 20, 30, 96, 138);

            drawMultiLines({
              ctx: this.ctx,
              fontSize: 22,
              text: titleInfo,
              x: 132,
              y: heightInfo.titleTop,
              isBold: true,
              lineHeight: 33,
            });

            drawOneLine({
              ctx: this.ctx,
              fontSize: 14,
              color: '#a8a8a8',
              text: document.created_at,
              x: 132,
              y: heightInfo.timeTop,
            });

            drawComment({
              ctx: this.ctx,
              userInfo,
              heightInfo,
              comment: descInfo,
              leftMarkOffset: 24,
              rightMarkOffset: this.width - 24 * 2,
              cb: () => {
                drawQrcode({
                  ctx: this.ctx,
                  imgX: (this.width - heightInfo.qrcodeHeight) / 2,
                  imgTop: heightInfo.qrcodeTop,
                  hrCenter: this.width / 2,
                  tipTop: heightInfo.tipTop
                });

                this.ctx.draw(false, () => {
                  this.saveImage();
                });
              }
            })

          } else {
            drawFail(res);
          }
        }
      })
    });
  },
  saveImage: function() {
    saveImage(this.width, this.height, () => {
      hideLoading();
      this.closeShared();
      this.openActionSheet();
    }, () => {
      this.setData({
        isSharedComment: false
      });
      this.closeShared();
    })
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
})
