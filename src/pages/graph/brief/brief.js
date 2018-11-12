import { request } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    node: null,
    isFromWeapp: false,
  },
  onLoad: function(options) {
    const { id, type, from } = options;
    request(`${ApiRootUrl}/${type}/${id}`)
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
