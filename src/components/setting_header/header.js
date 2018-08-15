Component({
  properties: {
    activeBar: {
      type: String,
      value: ''
    },
  },
  data: {
    user: null
  },
  attached: function () {
    this.setData({
      user: wx.getStorageSync('userInfo')
    });
  },
});
