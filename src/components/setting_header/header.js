Component({
  properties: {
    activeBar: {
      type: String,
      value: ''
    },
  },
  data: {
    user: null,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  attached: function () {
    this.setData({
      user: wx.getStorageSync('userInfo')
    });
  },
});
