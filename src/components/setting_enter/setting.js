const app = getApp();

Component({
  properties: {
  },
  data: {
    isLogin: null
  },
  attached: function () {
    this.setData({
      isLogin: app.globalData.isLogin
    });
  },
  methods: {
    getUserInfo: function (event) {
      app.login(event.detail.userInfo, () => {
        this.setData({
          isLogin: true,
          isShowComment: true
        });
      });
    }
  }
});
