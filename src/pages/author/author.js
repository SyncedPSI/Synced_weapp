import { request, getDateDiff, showLoading, hideLoading, showErrorToast } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, drawQrcode } from 'utils/canvas';
import { ApiRootUrl } from "config/api";

Page({
  data: {
    logo: "/images/logo.svg",
    isFromWeapp: false,
    navigateTitle: '机器之心',
    author: null,
    articles: [],
    node: null,
    hasNextPage: true,
    keywords: '',
    scrollTop: 0,
    hiddenShared: true,
    actionSheetHidden: true,
    isDraw: false,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  onLoad: function (option) {
    const { id, type, from } = option;

    this.page = 2;
    request(`${ApiRootUrl}/${type}s/${id}`)
      .then(({ data }) => {
        const { articles, has_next_page, total_count, ...other } = data;
        articles.forEach(item => {
          item.published_at = getDateDiff(item.published_at);
        });

        this.setData({
          isFromWeapp: from === "weapp",
          author: other,
          navigateTitle: other.name,
          articles,
          id,
          type,
          totalCount: total_count,
          hasNextPage: has_next_page,
        })
      });
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

  openShared: function () {
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
    const maxWidth = this.width - this.paddingLeft * 2;

    const heightInfo = {
      coverTop: 0,
      coverHeight: 190,
      nameTop: 190 + 3,
      avatarHeight: 100,
      avatarTop: 140,
      descTop: 255,
      qrcodeHeight: 90,
    };

    const descInfo = getWrapTextHeight({
      maxWidth,
      ctx: this.ctx,
      text: this.data.author.description,
      lineHeight: 28,
      fontSize: 17
    });

    heightInfo.qrcodeTop = heightInfo.descTop + descInfo.height + 41;
    heightInfo.tipTop = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 10;
    this.height = heightInfo.tipTop + 20 + 30;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(descInfo, heightInfo);
    });
  },

  drawFail: function (msg) {
    console.log('download cover fail', msg);
    hideLoading();
    showErrorToast('生成失败,请重试');
  },

  draw: function (descInfo, heightInfo) {
    const hrCenter = this.width / 2;
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);

    wx.downloadFile({
      url: `${this.data.author.cover_image_url}?imageView2/1/w/375/h/190`,
      success: (res) => {
        if (res.statusCode === 200) {
          // cover
          this.ctx.drawImage(res.tempFilePath, 0, 0, this.width, heightInfo.coverHeight);
          this.ctx.setFillStyle('rgba(40, 40, 40, 0.3)');
          this.ctx.fillRect(0, 0, this.width, heightInfo.coverHeight);
          this.ctx.setFillStyle('#fff');
          this.ctx.drawImage('/images/logo_white.png', 20, 14, 48, 18);

          // title
         drawOneLine({
           ctx: this.ctx,
           fontSize: 22,
           color: '#282828',
           text: this.data.author.name,
           x: 132,
           y: heightInfo.nameTop,
           isBold: true
         });

          drawMultiLines({
            ctx: this.ctx,
            fontSize: 16,
            text: descInfo,
            x: this.paddingLeft,
            y: heightInfo.descTop,
            lineHeight: 28,
          });
          // qrocde + tip
          drawQrcode({
            ctx: this.ctx,
            imgX: (this.width - heightInfo.qrcodeHeight) / 2,
            imgTop: heightInfo.qrcodeTop,
            hrCenter,
            tipTop: heightInfo.tipTop
          });

          wx.downloadFile({
            url: this.data.author.avatar_url,
            success: (res) => {
              if (res.statusCode === 200) {
                if (this.data.type === 'user') {
                  const half = heightInfo.avatarHeight / 2;
                  this.ctx.save();
                  this.ctx.arc(20 + half, heightInfo.avatarTop + half, half, 0, 2 * Math.PI);
                  this.ctx.clip();
                  this.ctx.drawImage(res.tempFilePath, 20, heightInfo.avatarTop, heightInfo.avatarHeight, heightInfo.avatarHeight);
                  this.ctx.restore();
                } else {
                  this.ctx.drawImage(res.tempFilePath, 20, heightInfo.avatarTop, heightInfo.avatarHeight, heightInfo.avatarHeight);
                }

                this.ctx.draw(false, () => {
                  this.setData({
                    isDraw: true,
                  })
                  this.saveImage();
                });
              } else {
                this.drawFail(res);
              }
            },
            fail: function(error) {
              this.drawFail(error);
            }
          });

        } else {
          this.drawFail(res);
        }
      },
      fail: (error) => {
        this.drawFail(error);
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
});
