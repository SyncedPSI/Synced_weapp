import { request } from "../../utils/util";
import { expertDetail } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    navigateTitle: '',
    isFromWeapp: false,
    expert: {},
    scrollToView: '',
    isRequestFinished: false,
    isShowCatelog: false,
    statusBarHeight: app.globalData.systemInfo.statusBarHeight,
    catalogList: [{
      key: 'js-introduction',
      value: '简介'
    }, {
      key: 'js-about-institutions',
      value: '相关机构'
    }]
  },

  onLoad: function (option) {
    const { id, from } = option;
    this.setData({
      id: id,
      isFromWeapp: from === "weapp",
    });
    request(`${expertDetail}${option.id}`)
      .then(res => {
        const expert = res.data;
        WxParse.wxParse("expert_content", "html", res.data.desc, this, 5);
        this.setData({
          navigateTitle: expert.zh_name,
          expert: expert,
          isRequestFinished: true
        });
      })
  },
  setScrollTarget: function (event) {
    const { target } = event.detail;
    this.setData({
      scrollToView: target
    });
  },
  onShareAppMessage: function() {
    const { expert: { zh_name }, id } = this.data;
    return {
      title: zh_name,
      path: `/pages/expert/expert?id=${id}&from=weapp`
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
