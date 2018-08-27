Component({
  properties: {
    isFromWeapp: {
      type: Boolean,
      value: false
    },
    notShow: {
      type: Boolean,
      value: false
    },
  },
  data: {
    paddingTop: getApp().globalData.systemInfo.statusBarHeight
  },
  ready: function () {
    console.log(this.data)
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
