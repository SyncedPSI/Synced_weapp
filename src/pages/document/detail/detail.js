import { request, getDateDiff, showLoading, hideLoading, showErrorToast } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, drawQrcode, drawFail } from 'utils/canvas';
import { documents } from "config/api";

Page({
  data: {
    document: null,
    isFromWeapp: false,
    isFetching: true,
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX,
    isLogin: false,
    logo: "/images/logo.svg",
    hiddenShared: true,
    actionSheetHidden: true,
    isDraw: false,
  },
  onLoad: function (options) {
    const { id, from } = options;
    request(`${documents}/${id}`)
      .then((res) => {
        this.setData({
          document: res.data,
          isFetching: false,
          isFromWeapp: from === "weapp",
          isLogin: getApp().globalData.isLogin,
        })
      })
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

  sharedPage: function () {
    this.toggleShare(false)
  },

  closeShared: function () {
    this.toggleShare(true);
  },
  sharedArticle: function () {
    this.closeShared();
    this.onShareAppMessage();
  },
  drawImgae: function () {
    showLoading('图片生成中');
    if (this.data.isDraw) {
      this.saveImage();
      return;
    }

    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 30;
    this.ctx = wx.createCanvasContext('js-canvas');
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

          // name
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

          hideLoading();
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
  saveImage: function() {
    saveImage(this.width, this.height, () => {
      hideLoading();
      this.closeShared();
      this.openActionSheet();
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
