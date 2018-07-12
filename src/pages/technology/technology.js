import {
  request,
  getDateDiff
} from "../../utils/util";
import {
  articleShow
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
    // request(`${articleShow}${option.id}`)
    //   .then(res => {
    //     const article = res.data;
    //     article.published_at = getDateDiff(res.data.published_at);
    //     WxParse.wxParse("article_content", "html", res.data.content, $this, 5);
    //     $this.setData({
    //       article: article
    //     });
    //   })
  },

  bindToNodeShow: function (e) {
    wx.navigateTo({
      url: `../node/node?id=${e.target.id}`
    });
  }
});
