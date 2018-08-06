import { request, getDateDiff } from "utils/util";
import { articleShow } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    title: "",
    isFetching: true,
    article: {
      related_nodes: [],
    },
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX
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
    this.setNavigationBarTitle();
    this.getTitleHeight();

    const { id, title } = option;
    const $this = this;
    this.setData({
      id,
      title
    });

    request(`${articleShow}${option.id}`)
      .then(res => {
        const article = res.data;
        article.published_at = getDateDiff(res.data.published_at);
        WxParse.wxParse("article_content", "html", res.data.content, $this, 5);

        $this.setData({
          article,
          isFetching: false,
        });
      });
  },
  bindForsubmit: function(event) {
    console.log(event.detail.value.textarea)
  },
  setNavigationBarTitle: function(title = '') {
    wx.setNavigationBarTitle({
      title,
    });
  },
  getTitleHeight: function() {
    setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-title').boundingClientRect((rect) => {
        this.titleHeight = (rect.height + 16);
      }).exec();
    }, 300);
  },
  onPageScroll: function(event) {
    if (this.titleHeight === undefined) return;
    const { scrollTop } = event;
    if (scrollTop > this.titleHeight) {
      this.setNavigationBarTitle(this.data.title);
    } else {
      this.setNavigationBarTitle();
    }
  },
});
