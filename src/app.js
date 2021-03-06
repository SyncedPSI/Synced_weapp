import { request, showTipToast } from "utils/util";
import { login, getAhoyTokens } from "config/api";
import 'utils/td_sdk/tdweapp.js';

App({
  globalData: {
    isIphoneX: false,
    isAndroid: true,
    isLogin: false,
    userInfo: null,
    isAuth: false,
    systemInfo: {},
    notifyCount: 0,
    certification_email: ''
  },

  onLaunch: function () {
    this.globalData.userInfo = wx.getStorageSync('userInfo');
    this.checkSession();
    this.checkSystemInfo();
    this.getCookies();
  },

  checkUpdate: function() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            }
          })
        })
      }
    })
  },

  getCookies: function() {
    request({
      url: getAhoyTokens,
      method : 'POST'
    }).then((res) => {
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
        const expiredTime = wx.getStorageSync('expiredTime');
        const timeDistance = expiredTime - parseInt(new Date().getTime() / 1000);
        if (timeDistance < 0) {
          this.setLoginFailed();
          return;
        }
        const authToken = wx.getStorageSync('authToken');
        if (authToken) {
          request({
            url: login,
            method: 'POST'
          }).then((res) => {
            const { user_info: {certification, certification_email}, notify_count } = res.data;
            this.globalData.notifyCount = notify_count;
            this.globalData.isAuth = certification;
            this.globalData.certification_email = certification_email;

            const remain_hours = timeDistance / 3600;
            if (remain_hours > 1.5) {
              this.globalData.isLogin = true;
            } else {
              this.globalData.isLogin = false;
            }
          }).catch(() => {
            this.setLoginFailed();
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
    if (userInfo === undefined) return;

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
              request({
                url: login,
                data: {
                  code: code,
                  encrypted_data: encryptedData,
                  iv: iv
                },
                method: "POST"
              }).then(res => {
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
    const { auth_token, expired_time, notify_count, user_info: {certification, certification_email}, } = loginData;
    wx.setStorage({
      key: 'authToken',
      data: auth_token
    });
    wx.setStorage({
      key: 'expiredTime',
      data: expired_time
    });

    this.globalData.isAuth = certification;
    this.globalData.certification_email = certification_email;
    this.globalData.notifyCount = notify_count;
    this.globalData.isLogin = true;
    showTipToast(msg);
  },
  setLoginFailed: function() {
    wx.removeStorageSync('authToken');
    wx.removeStorageSync('expiredTime');
    this.globalData.isLogin = false;
  },
});
