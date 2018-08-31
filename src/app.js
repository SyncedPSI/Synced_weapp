import { request, showTipToast } from "utils/util";
import { login, getAhoyTokens } from "config/api";

App({
  globalData: {
    isIphoneX: false,
    isAndroid: true,
    isLogin: false,
    authToken: null,
    expiredTime: null,
    userInfo: null,
    systemInfo: {},
  },

  onLaunch: function () {
    this.checkSession();
    this.checkSystemInfo();
    // this.getCookies();
  },

  getCookies: function() {
    request(getAhoyTokens, {}, 'POST')
      .then((res) => {
        const { ahoy_visit, ahoy_visitor } = res.data;
        wx.setStorage({
          key: 'Cookie',
          data: `ahoy_visitor=${ahoy_visitor}; ahoy_visit=${ahoy_visit};`
        });
      });
  },
  checkSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        const { model, platform, screenWidth, screenHeight, windowHeight, windowWidth, statusBarHeight } = res;
        if (model.match('iPhone X') !== null) {
          this.globalData.isIphoneX = true;
        }
        if (platform === 'ios') {
          this.globalData.isAndroid = false;
        }
        this.globalData.systemInfo = {
          screenWidth,
          screenHeight,
          windowHeight,
          windowWidth,
          statusBarHeight
        };
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
            .then(() => {
              const remain_hours = (expiredTime - parseInt(new Date().getTime() / 1000)) / 3600;
              if (remain_hours > 1.5) {
                this.globalData.isLogin = true;
              } else {
                this.globalData.isLogin = false;
              }
            }).catch(() => {
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
    showTipToast('正在登录', 'loading');
    var encryptedData = '';
    var iv = '';

    wx.setStorage({
      key: 'userInfo',
      data: userInfo
    });
    this.globalData.userInfo = userInfo;

    wx.login({
      success: (res) => {
        const code = res.code;
        if (code) {
          wx.getUserInfo({
            success: (e) => {
              encryptedData = e.encryptedData;
              iv = e.iv;
              request(login, {
                code: code,
                encrypted_data: encryptedData,
                iv: iv
              }, "POST")
                .then(res => {
                  this.setLoginSuccess(res.data, '登录成功');
                  cb();
                })
                .catch(err => {
                  if (err.statusCode == 401) {
                    const unionid = err.data.unionid;
                    wx.navigateTo({
                      url: `/pages/account/link/link?unionid=${unionid}`
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
  },
  setLoginSuccess: function (loginData, msg) {
    const { auth_token, expired_time } = loginData;
    wx.setStorage({
      key: 'authToken',
      data: auth_token
    });
    wx.setStorage({
      key: 'expiredTime',
      data: expired_time
    });
    this.globalData.isLogin = true;
    showTipToast(msg);
  }
});
