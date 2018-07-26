import {
  request
} from "../../utils/util";
import {
  institutionShow
} from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    institution: {}
  },

  onLoad: function (option) {
    this.setData({
      id: option.id
    });
    console.log(this.data.id);

    request(`${institutionShow}${option.id}`)
      .then(res => {
        const institution = res.data;
        WxParse.wxParse("institution_content", "html", res.data.desc, this, 5);
        this.setData({
          institution: institution
        });
      })
  }
});
