const app = getApp();

Component({
  properties: {
    hasComment: {
      type: Boolean,
      value: false
    },
    pageLogin: {
      type: Boolean,
      value: false,
    }
  },
  data: {
    isIphoneX: getApp().globalData.isIphoneX,
    isHidden: true,
    isLogin: null
  },
  attached: function () {
    const isLogin = app.globalData.isLogin;
    if (!isLogin) {
      setTimeout(() => {
        this.setData({
          isLogin: app.globalData.isLogin,
          isHidden: false
        });
      }, 2000);
    } else {
      this.setData({
        isLogin,
        isHidden: false
      });
    }
  },
  methods: {
    getUserInfo: function (event) {
      app.login(event.detail.userInfo, () => {
        this.setData({
          isLogin: true
        });
        this.triggerEvent('successloginevent');
      });
    }
  }
});
