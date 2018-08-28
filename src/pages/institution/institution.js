import { request } from "../../utils/util";
import { institutionShow } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    navigateTitle: '',
    isFromWeapp: false,
    institution: {},
    scrollTop: 0,
    isRequestFinished: false,
    catalogList: [{
      key: 'js-introduction',
      value: '简介'
    }, {
      key: 'js-about-experts',
      value: '相关专家'
    }]
  },

  onLoad: function (option) {
    const { id, from } = option;
    this.setData({
      id: id,
      isFromWeapp: from === "weapp",
    });
    request(`${institutionShow}${option.id}`)
      .then(res => {
        const institution = res.data;
        WxParse.wxParse("institution_content", "html", res.data.desc, this, 5);
        this.setData({
          navigateTitle: institution.zh_name,
          institution: institution,
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
    const { institution: { zh_name }, id } = this.data;
    return {
      title: zh_name,
      path: `/pages/institution/institution?id=${id}&from=weapp`
    };
  },
});
