import { request } from "utils/util";

App({
  globalData: {
    isIphoneX: false,
    isLogin: false,
    authToken: null,
    expiredTime: null
  },

  onLaunch: function () {
    this.checkSystemInfo();
    this.checkSession();
  },

  checkSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        if (res.model.match('iPhone X') !== null) {
          this.globalData.isIphoneX = true;        }
      }
    })
  },

  checkSession: function() {
    wx.checkSession({
      success: () => {
        this.globalData.authToken = wx.getStorageSync('authToken');
        this.globalData.expiredTime = wx.getStorageSync('expiredTime');
        const { authToken, expiredTime } = this.globalData;

        if (authToken) {
          request(
            `http://f8cb76dc.ngrok.io/api/v1/users/login`,
            {},
            "POST")
            .then(res => {
              const remain_hours = (expiredTime - parseInt(new Date().getTime() / 1000)) / 3600;
              if (remain_hours > 1.5) {
                console.log('已登录');
                this.globalData.isLogin = true;
              } else {
                console.log('未登录');
                this.globalData.isLogin = false;
              }
            }).catch(err => {
              console.log('isLogin请求401: 未登录');
              this.globalData.isLogin = false;
            })
        } else {
          this.globalData.isLogin = false;
          console.log('没有auth_token: 未登录');
        }
      },
      fail: () => {
        this.globalData.isLogin = false;
        console.log('session过期: 未登录');
      }
    });
  }
});
