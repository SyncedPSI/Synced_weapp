import { request, setNavigationBarTitle } from "../../utils/util";
import { expertShow } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
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
    this.setData({
      id: option.id
    });
    request(`${expertShow}${option.id}`)
      .then(res => {
        const expert = res.data;
        setNavigationBarTitle(expert.zh_name);
        WxParse.wxParse("expert_content", "html", res.data.desc, this, 5);
        this.setData({
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
