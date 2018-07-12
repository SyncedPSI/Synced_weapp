import { request, getDateDiff } from "../../utils/util";
import { articleShow } from "../../config/api";
const WxParse = require("../../wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    article: {}
    // article: {
    //   id: "fff5977c-db34-4d59-8ce8-2aaf26fb911a",
    //   title: "用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验",
    //   author: {
    //     id: "05b74512-9c5c-4d1e-a2a7-c5404e94a0d6",
    //     avatar_url: "../../icons/ic_chatbot_h.svg",
    //     name: "微胖"
    //   },
    //   copyright: "翻译",
    //   published_at: "2天前",
    //   content:
    //     "用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验用神经网络向我比心: 有个当算法工程师的女朋友是这样一种体验",
    //   related_nodes: [
    //     {
    //       node_id: "fff5977c-db34-4d59-8ce8-2aaf26fb911a",
    //       node_type: "技术",
    //       zh_name: "激活函数",
    //       en_name: "Activation Function"
    //     },
    //     {
    //       node_id: "fff5977c-db34-4d59-8ce8-2aaf26fb911a",
    //       node_type: "技术",
    //       zh_name: "激活函数",
    //       en_name: "Activation Function"
    //     },
    //     {
    //       node_id: "fff5977c-db34-4d59-8ce8-2aaf26fb911a",
    //       node_type: "技术",
    //       zh_name: "激活函数",
    //       en_name: "Activation Function"
    //     }
    //   ]
    // }
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
});
