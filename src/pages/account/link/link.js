import { bindAccount, register } from "config/api";
import { mobile_or_email_reg, pwd_reg } from 'config/all_reg';
import { showErrorToast, request, checkValue, showTipToast } from 'utils/util';

const app = getApp();

Page({
  data: {
    loginName: null,
    password: null,
    unionid: null
  },

  onLoad: function(option) {
    this.timeout = null;
    this.setData({
      unionid: option.unionid
    });
  },

  onUnload: function () {
    clearTimeout(this.timeout);
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
      request( bindAccount, {
        'login_name': loginName,
        password,
        unionid
      }, "POST")
      .then(res => {
        app.setLoginSuccess({
          ...res.data,
          msg: '关联成功'
        });
       this.redirectPage();
      }).catch(() => {
        showErrorToast('账号或密码错误');
      });
    }
  },

  register: function() {
    const { unionid } = this.data;
    request( register, {
      'user_info': app.globalData.userInfo,
      unionid
    }, "POST")
      .then(res => {
        if (res.data.errors) {
          showErrorToast('注册失败，请重试');
          return;
        }
        app.setLoginSuccess({
          ...res.data,
          msg: '注册成功'
        });
        this.redirectPage();
      })
  },
  redirectPage: function() {
    this.timeout = setTimeout(() => {
      wx.navigateTo({
        url: "../../index/index"
      });
    }, 500);
  },
});
