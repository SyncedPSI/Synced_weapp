import { request, getDateDiff, showErrorToast } from "utils/util";
import { articleShow, login } from "config/api";
const WxParse = require("wxParse/wxParse.js");

const app = getApp();

Page({
  data: {
    id: "",
    title: "",
    isFetching: true,
    article: {
      related_nodes: [],
    },
    isShowComment: false,
    isIphoneX: app.globalData.isIphoneX,
    isLogin: false
  },

  openComment: function() {
    this.switchComment(true);
  },

  closeComment: function() {
    this.switchComment(false);
  },

  switchComment: function(status) {
    this.setData({
      isShowComment: status
    });
  },

  onLoad: function(option) {
    this.setNavigationBarTitle();
    this.getTitleHeight();

    const { id, title } = option;
    this.setData({
      id,
      title,
      isLogin: app.globalData.isLogin
    });

    request(`${articleShow}${option.id}`)
      .then(res => {
        const article = res.data;
        article.published_at = getDateDiff(res.data.published_at);
        WxParse.wxParse("article_content", "html", res.data.content, this, 5);
        this.setData({
          article,
          isFetching: false
        });
      });
  },

  setNavigationBarTitle: function(title = '') {
    wx.setNavigationBarTitle({
      title,
    });
  },

  getTitleHeight: function() {
    setTimeout(() => {
      wx.createSelectorQuery().select('#js-article-title').boundingClientRect((rect) => {
        this.titleHeight = (rect.height + 16);
      }).exec();
    }, 300);
  },

  onPageScroll: function(event) {
    if (this.titleHeight === undefined) return;
    const { scrollTop } = event;
    if (scrollTop > this.titleHeight) {
      this.setNavigationBarTitle(this.data.title);
    } else {
      this.setNavigationBarTitle();
    }
  },

  getUserInfo: function(event) {
    wx.showToast({
      title: '正在登录',
      icon: 'loading',
      duration: 2000
    });
    var encryptedData = '';
    var iv = '';

    wx.setStorage({
      key: 'userInfo',
      data: event.detail.userInfo
    });
    app.globalData.userInfo = wx.getStorageSync('userInfo');

    wx.login({
      success: (res) => {
        const code = res.code;
        if (code) {
          wx.getUserInfo({
            success: (e) => {
              encryptedData = e.encryptedData;
              iv = e.iv;
              request(
                `http://f8cb76dc.ngrok.io/api/v1/users/login`,
                {
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
                  this.setData({
                    isLogin: true,
                    isShowComment: true
                  });
                  app.globalData.isLogin = true;
                })
                .catch(err => {
                  if (err.statusCode == 401) {
                    console.log('401');
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
