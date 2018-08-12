import { request } from "utils/util";
import { login } from "config/api";

App({
  globalData: {
    isIphoneX: false,
    isLogin: false,
    authToken: null,
    expiredTime: null,
    userInfo: null
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
            login,
            {},
            "POST")
            .then(res => {
              const remain_hours = (expiredTime - parseInt(new Date().getTime() / 1000)) / 3600;
              if (remain_hours > 1.5) {
                this.globalData.isLogin = true;
              } else {
                this.globalData.isLogin = false;
              }
            }).catch(err => {
              this.globalData.isLogin = false;
            })
        } else {
          this.globalData.isLogin = false;
        }
      },
      fail: () => {
        this.globalData.isLogin = false;
      }
    });
  }
});
