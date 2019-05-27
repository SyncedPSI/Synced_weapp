import { request, getDateDiff, showLoading, hideLoading, showErrorToast, getWxcodeUrl } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, drawQrcode, drawComment, downloadImage } from 'utils/canvas';
import { documents } from "config/api";

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
    targetComment: null,
    isShowModal: false,
  },
  onLoad: function (options) {
    let id = null;
    let isFromWeapp = true;
    if (options.id) {
      id = options.id;
      isFromWeapp = options.from === "weapp";
    } else {
      id = decodeURIComponent(options.scene);
    }

    request({
      url: `${documents}/${id}`,
      isHandleNotFound: true
    }).then((res) => {
      const document = res.data;
      if (document.wxacode_url === null) {
        this.getWxcode(id);
      }

      this.setData({
        document,
        navigateTitle: document.title,
        isFromWeapp,
        isLogin: getApp().globalData.isLogin,
        isAuth: getApp().globalData.isAuth
      })
    });
    this.initCanvas();
  },
  onShow: function() {
    this.setData({
      isShowModal: false
    })
  },
  getWxcode: function (id) {
    getWxcodeUrl(id, 'pages/document/detail/detail', 'Document', (path) => {
      this.setData({
        'document.wxacode_url': path
      })
    });
  },
  getUserInfo: function (event) {
    const {currentTarget: { dataset }, detail: { userInfo }} = event;
    const isShowComment = dataset.type === 'comment';

    getApp().login(userInfo, () => {
      this.setData({
        isLogin: true,
        isShowComment
      });

      if (!isShowComment) {
        this.openAuthModal();
        this.downloadDocument();
      }
    });
  },

  downloadDocument: function() {
    showLoading('获取中');
    const url = this.data.document.file_url;
    if (!url) {
      showErrorToast('请重试');
    }
    // 判断用户身份
    // true 获取 false 填写表单
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              hideLoading();
              this.sendEmail();
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

  openAuthModal: function() {
    if (getApp().globalData.isAuth) {
      this.setData({
        isAuth: true
      });
    } else {
      this.openModal();
      return;
    }
  },
  sendEmail: function (){
    const { id } = this.data.document;
    request({
      url: `${documents}/${id}/send_email`,
      data: {},
      method: "GET"
    });
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
      path: `/pages/document/detail/detail?id=${id}&from=weapp`,
    };
  },

  fetchData: function() {
    if (!this.data.hasNextPage) return;

    const { type, id } = this.data;
    request({
      url: `${ApiRootUrl}/${type}s/${id}?page=${this.page}`
    }).then(({ data }) => {
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
    downloadImage(document.cover_image_url, (path) => {
      // cover
      this.ctx.setFillStyle('#f2f2f2');
      this.ctx.fillRect(0, 0, this.width, heightInfo.bannerHeight);
      this.ctx.drawImage(path, (this.width - 180) / 2, 30, 180, 256);
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

      this.drawOther(heightInfo);
    })
  },

  drawOther: function (heightInfo) {
    drawQrcode({
      ctx: this.ctx,
      imgX: (this.width - heightInfo.qrcodeHeight) / 2,
      imgTop: heightInfo.qrcodeTop,
      hrCenter: this.width / 2,
      tipTop: heightInfo.tipTop,
      imgUrl: this.data.document.wxacode_url,
      cb: () => {
        this.ctx.draw(false, () => {
          this.saveImage();
        });
      }
    });
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
    heightInfo.descTop = heightInfo.leftMarkTop + 51;
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
      downloadImage(document.cover_image_url, (path) => {
        this.ctx.drawImage(path, 20, 30, 96, 138);
        this.ctx.setStrokeStyle('#e7e7e7');
        this.ctx.strokeRect(20, 30, 96, 138);

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
            this.drawOther(heightInfo);
          }
        })
      })
    });
  },
  saveImage: function() {
    saveImage(this.width, this.height, () => {
      hideLoading();
      this.closeShared();
      this.openActionSheet();
    }, () => {
      this.closeShared();
      this.setData({
        isSharedComment: false
      });
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
  closeModal: function() {
    this.setData({
      isShowModal: false,
    })
  },
  openModal: function() {
    this.setData({
      isShowModal: true,
    })
  }
})
