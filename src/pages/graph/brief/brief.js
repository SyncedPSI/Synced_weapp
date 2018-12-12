import { request, showLoading, hideLoading, showTipToast, getWxcodeUrl, getDateDiff } from "utils/util";
import { setBg, getWrapTextHeight, drawMultiLines, drawOneLine, saveImage, downloadImage } from 'utils/canvas';
import { graph } from "config/api";

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
    const { id, from } = options;
    let { type } = options;
    this.page = 1;
    request({
      url: `${graph}/${type}/${id}`,
      isHandleNotFound: true
    }).then((res) => {
      const node = res.data;
      if (node.wxacode_url === null) {
        this.getWxcode(id, type);
      }
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
  getWxcode: function (id, type) {
    let model = null;
    let path = null;
    if (type === 'technologies') {
      model = 'Graph::Technology';
      path = 'technology';
    } else if (type === 'experts') {
      model = 'Graph::Expert';
      path = 'expert';
    } else if (type === 'institutions') {
      model = 'Graph::Institution';
      path = 'institution';
    } else if (type === 'papers') {
      model = 'Graph::Paper';
      path = 'paper';
    } else if (type === 'publications') {
      model = 'Graph::Venue';
      path = 'venue';
    } else if (type === 'venues') {
      model = 'Graph::Venue';
      path = 'venue';
    } else if (type === 'resources') {
      model = 'Graph::Resource';
      path = 'resource';
    }

    getWxcodeUrl(id, `pages/${path}/${path}`, model, (path) => {
      this.setData({
        'node.wxacode_url': path
      })
    });
  },
  fetchTrends: function(id, type, firstFetch = false) {
    if (this.data.isFetching || !this.data.hasNextPage) return;

    this.setData({
      isFetching: true,
    }, () => {
      request({
        url: `${graph}/${type}/${id}/flows`,
        data: {
          page: this.page
        }
      }).then((res) => {
        const { flows, has_next_page } = res.data;
        const { trends } = this.data;
        flows.forEach(item => {
          item.pubdate = getDateDiff(item.pubdate);
        });

        if (firstFetch) {
          this.setData({
            sharedTrends: flows.slice(0, 2)
          });
        }

        this.setData({
          trends: [...trends, ...flows],
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
    const { id, type, node: { full_name } } = this.data;
    return {
      title: full_name,
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
      nameTop: 50,
      qrcodeHeight: 90,
    };

    const { node, sharedTrends } = this.data;
    const maxWidth = this.width - 100;
    const nameInfo = getWrapTextHeight({
      maxWidth,
      ctx: this.ctx,
      text: node.full_name,
      fontSize: 22,
      lineHeight: 33,
    });

    const enInfo = getWrapTextHeight({
      maxWidth,
      ctx: this.ctx,
      text: node.en_name || '',
      fontSize: 14,
      lineHeight: 20
    });

    const summary = (node.summary && node.summary.slice(0, 65) + '...') || '';
    const summaryInfo = getWrapTextHeight({
      maxWidth,
      ctx: this.ctx,
      text: summary,
      fontSize: 14,
      lineHeight: 22
    });

    heightInfo.enTop = heightInfo.nameTop + nameInfo.height;
    heightInfo.summaryTop = heightInfo.enTop + enInfo.height + 12;
    heightInfo.headerOffset = heightInfo.summaryTop + summaryInfo.height + 22;
    heightInfo.aboutTop = heightInfo.headerOffset + 45;

    let trendsInfo = null;
    if (sharedTrends.length > 0) {
      trendsInfo = sharedTrends.map((item) => {
        const titleInfo =  getWrapTextHeight({
          maxWidth,
          ctx: this.ctx,
          text: item.title,
          fontSize: 16,
          lineHeight: 24,
        });
        return {
          ...titleInfo,
          time: item.pubdate
        }
      });

      const [first, second] = trendsInfo;
      first.titleTop = heightInfo.aboutTop + 24 + 21;
      first.timeTop = first.titleTop + first.height + 12;

      if (second) {
        second.titleTop = first.timeTop + 20 + 20;
        second.timeTop = second.titleTop + second.height + 12;
      }

      heightInfo.qrcodeTop = trendsInfo[trendsInfo.length - 1].timeTop + 20 + 28;
    } else {
      heightInfo.qrcodeTop = heightInfo.aboutTop + 24 + 158;
    }
    this.height = heightInfo.qrcodeTop + heightInfo.qrcodeHeight + 55;
    this.setData({
      canvasHeight: this.height
    }, () => {
      this.draw(nameInfo, enInfo, summaryInfo, trendsInfo, heightInfo);
    });
  },

  draw: function (nameInfo, enInfo, summaryInfo, trendsInfo, heightInfo) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const containerWidth = this.width - 60;
    this.ctx.drawImage('/images/graph_share_bg.png', 0, 0, this.width, this.height);
    setBg(this.ctx, containerWidth, heightInfo.headerOffset - 30, '#fff', 30, 30);
    setBg(this.ctx, containerWidth, this.height - heightInfo.headerOffset - 50, '#fff', 30, heightInfo.headerOffset + 20);
    this.ctx.drawImage('/images/graph_hr.png', 74, heightInfo.headerOffset - 5, 8, 40);
    this.ctx.drawImage('/images/graph_hr.png', this.width - 74, heightInfo.headerOffset - 5, 8, 40);

    drawMultiLines({
      ctx: this.ctx,
      fontSize: 22,
      text: nameInfo,
      x: 50,
      y: heightInfo.nameTop,
      isBold: true,
      color: '#121212',
      lineHeight: 33,
    });

    drawMultiLines({
      ctx: this.ctx,
      fontSize: 14,
      text: enInfo,
      x: 50,
      y: heightInfo.enTop,
      color: '#a8a8a8',
      lineHeight: 20
    });

    drawMultiLines({
      ctx: this.ctx,
      fontSize: 14,
      text: summaryInfo,
      x: 50,
      y: heightInfo.summaryTop,
      color: '#414141',
      lineHeight: 22
    });

    drawOneLine({
      ctx: this.ctx,
      fontSize: 16,
      color: '#121212',
      text: '相关动态',
      x: 50,
      y: heightInfo.aboutTop,
      isBold: true,
    });

    const halfWidth = this.width / 2;
    if (this.data.sharedTrends.length > 0) {
      trendsInfo.forEach(item => {
        drawMultiLines({
          ctx: this.ctx,
          fontSize: 16,
          text: item,
          x: 50,
          y: item.titleTop,
          color: '#121212',
          lineHeight: 24,
        });

        drawOneLine({
          ctx: this.ctx,
          fontSize: 14,
          color: '#a8a8a8',
          text: item.time,
          x: 50,
          y: item.timeTop
        });
      })
    } else {
      const noneTop = heightInfo.aboutTop + 24 + 54;
      this.ctx.drawImage('/icons/none_trend.png', halfWidth - 47, noneTop, 28, 28);
      drawOneLine({
        ctx: this.ctx,
        fontSize: 14,
        color: '#121212',
        text: '暂无动态',
        x: halfWidth + 19,
        y: noneTop + 5,
        isCenter: true
      });
    }

    const { wxacode_url } = this.data.node;
    if (wxacode_url === null) {
      this.drawOther('/images/qrcode.png', heightInfo);
    } else {
      downloadImage(wxacode_url, (path) => {
        this.drawOther(path, heightInfo, halfWidth);
      });
    }
  },
  drawOther: function (path, heightInfo, halfWidth) {
    this.ctx.setTextAlign('left');
    this.ctx.drawImage(path, halfWidth - 95, heightInfo.qrcodeTop, 90, 90);
    drawOneLine({
      ctx: this.ctx,
      fontSize: 14,
      color: '#7d7d7d',
      text: '长按小程序码',
      x: halfWidth + 5,
      y: heightInfo.qrcodeTop + 30,
    });
    drawOneLine({
      ctx: this.ctx,
      fontSize: 14,
      color: '#7d7d7d',
      text: '了解更多知识',
      x: halfWidth + 5,
      y: heightInfo.qrcodeTop + 50,
    });

    this.ctx.draw(false, () => {
      this.saveImage();
    });
  },
  saveImage: function () {
    saveImage(this.width, this.height, () => {
      hideLoading();
      this.closeShared();
      this.openActionSheet();
    }, () => {
      this.setData({
        isDraw: true
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
})
