import { request, showTipToast } from "../../utils/util";
import { resourceDetail } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    resource: null,
    navigateTitle: '',
    isFromWeapp: false,
    statusBarHeight: app.globalData.systemInfo.statusBarHeight,
  },

  onLoad: function (option) {
    const { id, from } = option;
    this.setData({
      id: id,
      isFromWeapp: from === "weapp",
    });
    request(`${resourceDetail}${option.id}`)
      .then(res => {
        const resource = res.data;
        WxParse.wxParse("resource_content", "html", resource.desc, this, 5);
        this.setData({
          navigateTitle: resource.name,
          resource
        });
      })
  },
  onShareAppMessage: function() {
    const { resource: { name }, id } = this.data;
    return {
      title: name,
      path: `/pages/resource/resource?id=${id}&from=weapp`
    };
  },
  copyclip: function (event) {
    wx.setClipboardData({
      data: event.currentTarget.dataset.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  },
});
