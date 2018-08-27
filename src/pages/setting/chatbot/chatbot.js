// import { request, getDateDiff, showErrorToast } from "utils/util";
// import { articleShow, login } from "config/api";

// const app = getApp();

Page({
  data: {
    isFromWeapp: false,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  onLoad: function(option) {
    this.setData({
      isFromWeapp: option.from === "weapp",
    });
  },
  onShareAppMessage: function() {
    return {
      title: '机器之心小助手',
      path: '/pages/setting/chatbox/chatbox?from=weapp',
    };
  },
});
