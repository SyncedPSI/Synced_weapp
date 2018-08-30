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
    isIndex: {
      type: Boolean,
      value: false
    },
    isDaily: {
      type: Boolean,
      value: false
    },
    // hasShadow: {
    //   type: Boolean,
    //   value: true
    // },
    isNoSearch: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '机器之心'
    }
  },
  data: {
    paddingTop: getApp().globalData.systemInfo.statusBarHeight,
    isAndroid: getApp().globalData.isAndroid,
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
