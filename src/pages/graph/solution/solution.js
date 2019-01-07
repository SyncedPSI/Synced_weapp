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
    const { id, from } = options;
    request({
      url: `${graph}/solutions/${id}/relations`
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

  onShareAppMessage: function() {
    const { id, node: { full_name } }= this.data;
    return {
      title: full_name,
      path: `/pages/graph/case/case?id=${id}&from=weapp`,
    };
  },
})
