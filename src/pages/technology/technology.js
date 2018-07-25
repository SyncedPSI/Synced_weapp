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
    this.setData({
      id: option.id
    });

    request(`${technologyShow}${option.id}`)
      .then(res => {
        const technology = res.data;
        WxParse.wxParse("technology_content", "html", res.data.desc, this, 5);
        this.setData({
          technology: technology
        });
      })
  }
});
