const app = getApp();

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
    paddingTop: app.globalData.systemInfo.statusBarHeight,
    isAndroid: app.globalData.isAndroid,
    isLogin: false
  },
  ready: function () {
    this.setData({
      isLogin: app.globalData.isLogin,
    });
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
    },
    getUserInfo: function (event) {
      app.login(event.detail.userInfo, () => {
        wx.navigateTo({
          url: '/pages/search/search'
        });
      });
    },
  }
})
