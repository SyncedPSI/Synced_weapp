Component({
  properties: {
    isFromWeapp: {
      type: Boolean,
      value: false
    },
    isShow: {
      type: Boolean,
      value: true
    },
  },
  data: {
    paddingTop: getApp().globalData.systemInfo.statusBarHeight
  },
  ready: function () {

  },
  detached: function () {

  },
  methods: {
    goBack: function() {
      wx.navigateBack();
    },
    goHome: function() {
      wx.navigateTo({
        url: '/pages/index/index'
      });
    }
  }
})
