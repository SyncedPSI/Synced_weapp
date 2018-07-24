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
    technology: {}
  },

  onLoad: function (option) {
    const $this = this;
    this.setData({
      id: option.id
    });
    console.log(option.id);
    request(`${technologyShow}${option.id}`)
      .then(res => {
        const technology = res.data;
        console.log(technology);
        WxParse.wxParse("technology_content", "html", res.data.desc, $this, 5);
        $this.setData({
          technology: technology
        });
      })
  },

  bindToNodeShow: function (e) {
    wx.navigateTo({
      url: `../node/node?id=${e.target.id}`
    });
  }
});
