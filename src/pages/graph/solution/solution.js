import { request, showTipToast } from "utils/util";
import { graph } from "config/api";

Page({
  data: {
    node: null,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isFromWeapp: false,
  },
  onLoad: function(options) {
    const { id, from } = options;
    request({
      url: `${graph}/solutions/${id}`
    }).then((res) => {
      const node = res.data;
      this.setData({
        id,
        navigateTitle: node.full_name,
        node: node,
        isFromWeapp: from === "weapp",
      })
    })
  },

  onShareAppMessage: function() {
    const { id, node: { full_name } } = this.data;
    return {
      title: full_name,
      path: `/pages/graph/case/case?id=${id}&from=weapp`,
    };
  },

  copyclip: function (event) {
    wx.setClipboardData({
      data: event.target.dataset.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  },
})
