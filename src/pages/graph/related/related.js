import { request } from "utils/util";
import { graph } from "config/api";

Page({
  data: {
    node: null,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isFromWeapp: false,
    activeCategory: null,
    category: [],
  },
  onLoad: function(options) {
    const { id, type, from } = options;
    request({
      url: `${graph}/${type}/${id}/relations`
    }).then((res) => {
      const node = res.data;
      const category = this.getCategory(node);
      this.setData({
        id,
        type,
        navigateTitle: node.full_name,
        node: node,
        category,
        activeCategory: category[0].en,
        isFromWeapp: from === "weapp",
      })
    })
  },

  getCategory: function(node) {
    const category = [];
    const translate = {
      institutions: '相关机构',
      technologies: '关联技术',
      experts: '相关人物',
    };

    ['institutions', 'technologies', 'experts'].forEach((item) => {
      if (node[item] && node[item].length > 0) {
        category.push({ en:item, zh: translate[item] });
      }
    })
    return category;
  },
  switchCategory: function(event) {
    this.setData({
      activeCategory: event.currentTarget.dataset.type,
    });
  },
  onShareAppMessage: function() {
    const { id, type, node: { full_name } }= this.data;
    return {
      title: full_name,
      path: `/pages/graph/graph?id=${id}&type=${type}&from=weapp`,
    };
  },
})
