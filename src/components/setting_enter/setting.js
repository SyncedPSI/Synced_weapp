Component({
  properties: {
  },
  data: {
    isLogin: null
  },
  attached: function () {
    this.setData({
      isLogin: getApp().globalData.isLogin
    });
  },
});
