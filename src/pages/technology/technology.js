import { request } from "../../utils/util";
import { technologyShow } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    navigateTitle: '',
    technology: {},
    isFromWeapp: false,
    scrollTop: 0,
    isRequestFinished: false,
    catalogList: [{
      key: 'js-introduction',
      value: '简介'
    }, {
      key: 'js-about-experts',
      value: '相关专家'
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
    request(`${technologyShow}${option.id}`)
      .then(res => {
        const technology = res.data;
        WxParse.wxParse("technology_content", "html", res.data.desc, this, 5);
        this.setData({
          technology: technology,
          navigateTitle: technology.zh_name,
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
    const { technology: { zh_name }, id } = this.data;
    return {
      title: zh_name,
      path: `/pages/technology/technology?id=${id}&from=weapp`
    };
  },
});
