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
    notifyCount: {
      type: Number,
      value: 0
    },
    pageLogin: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal && this.data.avatarUrl === '') {
          this.setData({
            avatarUrl: app.globalData.userInfo.avatarUrl
          });
        }
      }
    }
  },
  data: {
    paddingTop: app.globalData.systemInfo.statusBarHeight,
    isAndroid: app.globalData.isAndroid,
    isLogin: false,
    avatarUrl: app.globalData.userInfo && app.globalData.userInfo.avatarUrl,
  },
  attached: function () {
    const { isLogin } = app.globalData;
    this.setData({
      isLogin,
    });
  },
  methods: {
    goBack: function() {
      wx.navigateBack();
    },
    goHome: function() {
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
    getUserInfo: function (event) {
      let pagePath = '/pages/search/search';
      if (event.currentTarget.dataset.type === 'user') {
        pagePath = '/pages/setting/setting';
      }
      app.login(event.detail.userInfo, () => {
        this.setData({
          isLogin: true
        }, () => {
          wx.navigateTo({
            url: pagePath
          });
        })
      });
    },
  }
})
