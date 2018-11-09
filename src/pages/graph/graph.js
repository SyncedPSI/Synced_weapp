import { request, getDateDiff, showTipToast, showLoading, hideLoading, showErrorToast } from "utils/util";
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
        console.log(res)
        this.setData({
          id,
          type,
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
