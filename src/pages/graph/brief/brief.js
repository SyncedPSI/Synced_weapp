import { request } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    node: null,
    isFromWeapp: false,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isExpand: false,
    trends: [],
    noTrends: true,
    hasNextPage: true,
    isFetching: false,
    hiddenShared: true,
    actionSheetHidden: true,
    isDraw: false,
    canvasHeight: 0,
    sharedTrends: [],
  },
  onLoad: function(options) {
    const { id, type, from } = options;
    this.page = 1;
    request(`${ApiRootUrl}/${type}/${id}`)
      .then((res) => {
        const node = res.data;
        this.setData({
          id,
          type,
          navigateTitle: node.full_name,
          node: node,
          isFromWeapp: from === "weapp",
        })
      });
    this.fetchTrends(id, type, true);
  },
  fetchTrends: function(id, type, firstFetch = false) {
    if (this.data.isFetching) return;

    this.setData({
      isFetching: true,
    }, () => {
      request(`${ApiRootUrl}/${type}/${id}/flows`, {
        page: this.page
      }).then((res) => {
        const { flows, has_next_page } = res.data;

        if (firstFetch) {
          this.setData({
            sharedTrends: flows.slice(0, 2)
          });
        }
        this.setData({
          trends: flows,
          isFetching: false,
          hasNextPage: has_next_page,
          noTrends: false,
        }, () => {
          this.page += 1;
        });
      });
    })
  },
  fetchMore: function () {
    const { type, id } = this.data;
    this.fetchTrends(id, type);
  },
  copyclip: function (event) {
    wx.setClipboardData({
      data: event.target.dataset.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  },
  seeAll: function() {
    this.setData({
      isExpand: !this.data.isExpand,
    })
  },
  onShareAppMessage: function() {
    const { id, type }= this.data;
    return {
      title,
      path: `/pages/graph/brief/brief?id=${id}&type=${type}&from=weapp`,
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
    if (this.data.isDraw) {
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

    const {
      author
    } = this.data;
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
    setBg(this.ctx, this.width, this.height);

    const {
      author,
      totalCount
    } = this.data;
    wx.downloadFile({
      url: author.avatar_url + '?roundPic/radius/!50p',
      success: (res) => {
        if (res.statusCode === 200) {
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
  saveImage: function () {
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
