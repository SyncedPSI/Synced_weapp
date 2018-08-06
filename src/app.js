import { camelCase } from 'lodash';

App({
  onLaunch() {
    console.log(camelCase('OnLaunch'));
    this.checkSystemInfo();
    // 调用API从本地缓存中获取数据
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
  },
  getUserInfo(cb) {
    if (this.globalData.userInfo) {
      typeof cb === 'function' && cb(this.globalData.userInfo);
    } else {
      // 调用登录接口
      wx.login({
        success: () => {
          wx.getUserInfo({
            success: (res) => {
              console.log(res.userInfo);
              this.globalData.userInfo = res.userInfo;
              typeof cb === 'function' && cb(this.globalData.userInfo);
            }
          });
        }
      });
    }
  },
  checkSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        if (res.model.match('iPhone X') !== null) {
          this.globalData.isIphoneX = true;
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    isIphoneX: false,
  }
});
