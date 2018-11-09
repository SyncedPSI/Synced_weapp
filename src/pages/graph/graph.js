import { request, getDateDiff, showTipToast, showLoading, hideLoading, showErrorToast } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    node: null,
  },
  onLoad: function(options) {
    const { id, type } = options;
    request(`${ApiRootUrl}/${type}/${id}`)
      .then((res) => {
        console.log(res)
        this.setData({
          id,
          type,
        })
      })
  }
})
