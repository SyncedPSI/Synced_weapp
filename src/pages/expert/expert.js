import { request } from "../../utils/util";
import { expertShow } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    navigateTitle: '',
    isFromWeapp: false,
    expert: {},
    scrollTop: 0,
    isRequestFinished: false,
    isShowCatelog: false,
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
    request(`${expertShow}${option.id}`)
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
  onPageScroll: function (event) {
    this.setData({
      scrollTop: event.scrollTop,
    });
  },
  onShareAppMessage: function() {
    const { expert: { zh_name }, id } = this.data;
    return {
      title: zh_name,
      path: `/pages/expert/expert?id=${id}&from=weapp`
    };
  },
});
