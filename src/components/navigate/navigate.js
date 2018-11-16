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
    hasShadow: {
      type: Boolean,
      value: false
    },
    hasHeaderHeight: {
      type: Boolean,
      value: false
    },
    isNoSearch: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '机器之心'
    },
    pageLogin: {
      type: Boolean,
      value: false,
    }
  },
  data: {
    paddingTop: app.globalData.systemInfo.statusBarHeight,
    isAndroid: app.globalData.isAndroid,
    isLogin: false,
    avatarUrl: app.globalData.userInfo && app.globalData.userInfo.avatarUrl,
  },
  ready: function () {
    this.setData({
      isLogin: app.globalData.isLogin,
    });
    console.log(app.globalData.userInfo)
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
      let pagePath = '/pages/search/search';
      if (event.currentTarget.dataset.type === user) {
        pagePath = '/pages/setting/read_later/read_later';
      }
      app.login(event.detail.userInfo, () => {
        this.setData({
          isLogin: true,
          avatarUrl: app.globalData.userInfo.avatarUrl
        }, () => {
          wx.navigateTo({
            url: pagePath
          });
        })
      });
    },
  }
})
