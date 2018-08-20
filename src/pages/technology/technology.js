import {
  request
} from "../../utils/util";
import {
  technologyShow
} from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    technology: {},
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
    this.setData({
      id: option.id
    });
    wx.setNavigationBarTitle({
      title: option.title
    });
    request(`${technologyShow}${option.id}`)
      .then(res => {
        const technology = res.data;
        WxParse.wxParse("technology_content", "html", res.data.desc, this, 5);
        this.setData({
          technology: technology,
          isRequestFinished: true
        });
      })
  }
});
