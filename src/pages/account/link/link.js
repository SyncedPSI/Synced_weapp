import { bindAccount, register } from "config/api";
import { mobile_or_email_reg, pwd_reg } from 'config/all_reg';
import { showErrorToast, request, checkValue } from 'utils/util';

const app = getApp();

Page({
  data: {
    loginName: null,
    password: null,
    unionid: null
  },

  onLoad: function(option) {
    this.setData({
      unionid: option.unionid
    });
  },

  bindLoginNameInput: function (e) {
    this.setData({
      loginName: e.detail.value
    });
  },

  bindPasswordInput: function (e) {
    this.setData({
      password: e.detail.value
    });
  },

  submitForm: function() {
    const { loginName, password, unionid } = this.data;
    const checkLoginName = checkValue({
      value: loginName,
      reg: mobile_or_email_reg,
      errMsg: '用户名格式不正确',
    });

    const checkPassword = checkValue({
      value: password,
      reg: pwd_reg,
      errMsg: '密码输入不正确',
    });

    if (checkLoginName && checkPassword) {
      request(
      bindAccount,
      {
        'login_name': loginName,
        password,
        unionid
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
        wx.navigateTo({
          url: "../../index/index"
        });
      }).catch(err => {
        showErrorToast('账号或密码错误');
      });
    }
  },

  register: function() {
    const { unionid } = this.data;
    request(
    register,
    {
      'user_info': app.globalData.userInfo,
      unionid
    },
    "POST")
    .then(res => {
      const authToken = res.data.auth_token;
      wx.setStorage({
        key: 'authToken',
        data: authToken
      });
      wx.setStorage({
        key: 'expiredTime',
        data: expiredTime
      });
      wx.navigateTo({
          url: "../../index/index"
        });
    })
  }
});
