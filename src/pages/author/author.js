import { request, getDateDiff, showLoading, hideLoading } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, downloadImage } from 'utils/canvas';
import { ApiRootUrl } from "config/api";

Page({
  data: {
    logo: "/images/logo.svg",
    isFromWeapp: false,
    navigateTitle: '机器之心',
    author: null,
    articles: [],
    hasNextPage: true,
    hiddenShared: true,
    actionSheetHidden: true,
    canvasHeight: 0,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  onLoad: function (option) {
    const { id, type, from } = option;

    this.page = 2;
    this.isDraw = false;
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
    if (!hasNextPage) return;

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
  sharedPage: function () {
    this.closeShared();
    this.onShareAppMessage();
  },
  drawImage: function () {
    showLoading('图片生成中');
    if (this.isDraw) {
      this.saveImage();
      return;
    }

    this.width = getApp().globalData.systemInfo.screenWidth;
    this.paddingLeft = 30;
    this.ctx = wx.createCanvasContext('js-canvas');
    this.ctx.setTextBaseline('top');

    const heightInfo = {
      avatarHeight: 300,
      avatarTop: 0,
      nameTop: 106,
      qrcodeHeight: 54,
    };

    const { author } = this.data;
    const nameInfo = getWrapTextHeight({
      maxWidth: this.width * 0.64,
      ctx: this.ctx,
      text: author.name,
      fontSize: 24,
      lineHeight: 36,
    });

    const descInfo = getWrapTextHeight({
      maxWidth: this.width * 0.58,
      ctx: this.ctx,
      text: author.description || '',
      lineHeight: 28,
      fontSize: 17
    });

    descInfo.height = Math.max(descInfo.height, 196);
    heightInfo.countTop = heightInfo.nameTop + nameInfo.height + 8;
    heightInfo.descTop = heightInfo.countTop + 20 + 24;
    this.height = heightInfo.descTop + descInfo.height + 108;
    heightInfo.qrcodeTop = this.height - 89 - 54;
    heightInfo.tipTop = this.height - 84;

    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(nameInfo, descInfo, heightInfo);
    });
  },

  draw: function (nameInfo, descInfo, heightInfo) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    setBg(this.ctx, this.width, this.height);

    const { author, totalCount } = this.data;
    downloadImage(`${author.avatar_url}?roundPic/radius/!50p`, (path) => {
      // cover
      this.ctx.drawImage(res.tempFilePath, -90, -90, heightInfo.avatarHeight, heightInfo.avatarHeight);
      this.ctx.drawImage('/images/logo.svg', this.width - 20 - 64, 15, 64, 24);

      // name bg
      // const bgHeight = nameInfo.height + 24;
      // this.ctx.setFillStyle('rgba(255, 255, 255, 0.8)');
      // this.ctx.fillRect(133, 94, this.width * 0.64, bgHeight);
      // this.ctx.beginPath()
      // this.ctx.arc(133, 94 + bgHeight / 2, bgHeight / 2, 0.5 * Math.PI, 1.5 * Math.PI);
      // this.ctx.fill();

      // name
      drawMultiLines({
        ctx: this.ctx,
        fontSize: 24,
        text: nameInfo,
        x: this.width - 35,
        y: heightInfo.nameTop,
        isBold: true,
        textAlign: 'right',
      });

      drawOneLine({
        ctx: this.ctx,
        fontSize: 14,
        color: '#a8a8a8',
        text: `共 ${totalCount} 篇文章`,
        x: this.width - 35,
        y: heightInfo.countTop,
        isBold: true
      });

      drawMultiLines({
        ctx: this.ctx,
        fontSize: 16,
        text: descInfo,
        x: this.width * 0.42 - 20,
        y: heightInfo.descTop,
        lineHeight: 28,
      });

      this.ctx.drawImage('/images/qrcode.png', 42, heightInfo.qrcodeTop, 54, 54);
      drawOneLine({
        ctx: this.ctx,
        fontSize: 14,
        color: '#7d7d7d',
        text: '长按小程序码',
        x: 30,
        y: heightInfo.tipTop,
      });
      drawOneLine({
        ctx: this.ctx,
        fontSize: 14,
        color: '#7d7d7d',
        text: '了解更多文章',
        x: 30,
        y: heightInfo.tipTop + 16,
      });

      this.ctx.beginPath()
      this.ctx.arc(this.width, this.height, 64, Math.PI, 2 * Math.PI);
      this.ctx.setFillStyle('#282828');
      this.ctx.fill();

      this.ctx.draw(false, () => {
        this.saveImage();
      });
    })
  },
  saveImage: function() {
    saveImage(this.width, this.height, () => {
      hideLoading();
      this.closeShared();
      this.openActionSheet();
    }, () => {
      this.isDraw = true;
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
