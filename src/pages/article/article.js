import { request, getDateDiff } from "utils/util";
import { articleShow } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    article: {},
    isShowPage: false,
    isShowComment: false
  },
  openComment: function() {
    this.switchComment(true);
  },
  closeComment: function() {
    this.switchComment(false);
  },
  switchComment: function(status) {
    this.setData({
      isShowComment: status
    });
  },
  onLoad: function(option) {
    const $this = this;
    wx.setNavigationBarTitle({
      title: option.title
    });
    this.setData({
      id: option.id
    });
    request(`${articleShow}${option.id}`)
      .then(res => {
        const article = res.data;
        article.published_at = getDateDiff(res.data.published_at);
        WxParse.wxParse("article_content", "html", res.data.content, $this, 5);
        $this.setData({
          article: article
        });
        this.setData({
          isShowPage: true
        });
      })
  },
  bindForsubmit: function(event) {
    console.log(event.detail.value.textarea)
  }
});
