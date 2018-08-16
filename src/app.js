import { request } from "utils/util";
import { login } from "config/api";

App({
  globalData: {
    isIphoneX: false,
    isAndroid: true,
    isLogin: false,
    authToken: null,
    expiredTime: null,
    userInfo: null
  },

  onLaunch: function () {
    this.checkSession();
    this.checkSystemInfo();
  },

  checkSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        if (res.model.match('iPhone X') !== null) {
          this.globalData.isIphoneX = true;
        }
        if (res.platform === 'ios') {
          this.globalData.isAndroid = false;
        }
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
          request(login, {}, "POST")
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
  },
  login: function(userInfo, cb) {
    wx.showToast({
      title: '正在登录',
      icon: 'loading',
      duration: 2000
    });
    var encryptedData = '';
    var iv = '';

    wx.setStorage({
      key: 'userInfo',
      data: userInfo
    });
    this.globalData.userInfo = wx.getStorageSync('userInfo');

    wx.login({
      success: (res) => {
        const code = res.code;
        if (code) {
          wx.getUserInfo({
            success: (e) => {
              encryptedData = e.encryptedData;
              iv = e.iv;
              request(
                  login, {
                    code: code,
                    encrypted_data: encryptedData,
                    iv: iv
                  },
                  "POST")
                .then(res => {
                  const authToken = res.data.auth_token;
                  const expiredTime = res.data.expired_time;
                  wx.setStorage({
                    key: 'authToken',
                    data: authToken
                  });
                  wx.setStorage({
                    key: 'expiredTime',
                    data: expiredTime
                  });
                  cb();
                  this.globalData.isLogin = true;
                })
                .catch(err => {
                  if (err.statusCode == 401) {
                    const unionid = err.data.unionid
                    wx.navigateTo({
                      url: `../account/link/link?unionid=${unionid}`
                    })
                  } else {
                    showErrorToast('登录失败')
                  }
                })
            }
          });
        } else {
          showErrorToast('点击重试')
        }
      }
    });
  }
});
