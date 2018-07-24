import { request, getDateDiff } from "utils/util";
import { articleShow } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    article: {
      id: "92c7175c-4178-4131-9a35-71d40f443b36",
    },
    isShowComment: false
  },
  closeShowComment: function() {
    this.setData({
      isShowComment: false
    });
  },
  openComment: function() {
    this.setData({
      isShowComment: true
    });
  },
  onLoad: function(option) {
    const $this = this;
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
      })
  },
  bindForsubmit: function(event) {
    console.log(event.detail.value.textarea)
  }
});
