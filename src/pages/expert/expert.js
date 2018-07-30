import {
  request
} from "../../utils/util";
import {
  expertShow
} from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    expert: {},
    isRequestFinished: false
  },

  onLoad: function (option) {
    this.setData({
      id: option.id
    });
    wx.setNavigationBarTitle({
      title: option.title
    });
    request(`${expertShow}${option.id}`)
      .then(res => {
        const expert = res.data;
        WxParse.wxParse("expert_content", "html", res.data.desc, this, 5);
        this.setData({
          expert: expert,
          isRequestFinished: true
        });
      })
  }
});
