Component({
  properties: {
    isFromWeapp: {
      type: Boolean,
      value: false
    },
    isShow: {
      type: Boolean,
      value: false
    },
  },
  data: {
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
