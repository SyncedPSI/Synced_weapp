import { request } from "utils/util";
import { reports } from "config/api";

Page({
  data: {
    report: null,
    isFromWeapp: false,
    isFetching: true,
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX,
    isLogin: false,
  },
  onLoad: function (options) {
    request(`${reports}/${options.id}`)
      .then((res) => {
        this.setData({
          report: res.data,
          isFetching: false,
        })
      })
  }
})
