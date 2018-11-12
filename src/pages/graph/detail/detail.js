import { request } from "utils/util";
import { ApiRootUrl } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    navigateTitle: '',
    isFromWeapp: false,
    node: {},
    scrollToView: '',
    isRequestFinished: false,
    isShowCatelog: false,
    statusBarHeight: app.globalData.systemInfo.statusBarHeight,
    catalogList: null,
  },

  onLoad: function (option) {
    const { id, type, from } = option;
    this.setData({
      id: id,
      isFromWeapp: from === "weapp",
    });
    request(`${ApiRootUrl}/${type}/${id}`)
      .then(res => {
        const node = res.data;
        const catalogList = this.getCatalog(node);
        WxParse.wxParse("node_content", "html", res.data.desc, this, 5);
        this.setData({
          catalogList,
          navigateTitle: node.full_name,
          node: node,
          isRequestFinished: true
        });
      })
  },
  getCatalog: function(node) {
    const catalog = [{
      key: 'js-introduction',
      value: '简介'
    }];

    if (node.institutions && node.institutions.length > 0) {
      catalog.push({
        key: 'js-about-institutions',
        value: '相关机构'
      });
    }

    if (node.experts && node.experts.length > 0) {
      catalog.push({
        key: 'js-about-experts',
        value: '相关人物'
      });
    }

    if (node.resources && node.resources.length > 0) {
      catalog.push({
        key: 'js-about-resources',
        value: '相关资源'
      });
    }

    return catalog;
  },
  setScrollTarget: function (event) {
    const { target } = event.detail;
    this.setData({
      scrollToView: target
    });
  },
  onShareAppMessage: function() {
    const { node: { full_name }, id, type } = this.data;
    return {
      title: full_name,
      path: `/pages/graph/detail/detail?type=${type}&id=${id}&from=weapp`
    };
  },
  copyclip: function (event) {
    wx.setClipboardData({
      data: event.target.dataset.url,
      success: () => {
        this.closeActionSheet();
        showTipToast('链接已复制');
      }
    });
  },
});
