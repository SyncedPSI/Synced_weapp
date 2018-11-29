import { request } from "utils/util";
import { graph } from "config/api";

Page({
  data: {
    node: null,
    isFromWeapp: false,
    isExpand: false
  },
  onLoad: function(options) {
    const { id, type, from } = options;
    request(`${graph}/${type}/${id}/relations`)
      .then((res) => {
        const node = res.data;
        this.setData({
          id,
          type,
          navigateTitle: node.full_name,
          node: node,
          isFromWeapp: from === "weapp",
        })
      })
  },
  onShareAppMessage: function() {
    const { id, type }= this.data;
    return {
      title,
      path: `/pages/graph/graph?id=${id}&type=${type}&from=weapp`,
    };
  },
})
