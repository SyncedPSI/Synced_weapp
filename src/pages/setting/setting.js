// import { request, getDateDiff, showTipToast } from "utils/util";
// import { readLater, readLaterList } from "config/api";

Page({
  data: {
    noticeList: [1, 2],
    readCount: 0,
    startX: 0,
    startY: 0,
    activeNav: 'readlater',
    user: null,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
  },

  onLoad: function () {
    const user = wx.getStorageSync('userInfo');
    user.nickName = user.nickName.slice(0, 8);
    this.setData({
      user,
    });
  },

  switchNav: function (event) {
    this.setData({
      activeNav: event.currentTarget.dataset.type,
    }, () => {

    });
  },
})
