import { linkCount } from "config/api";
import { mobile_or_email_reg, pwd_reg } from 'config/all_reg';
import { showErrorToast, request, checkValue } from 'utils/util';

const app = getApp();

Page({
  data: {
    loginName: null,
    password: null,
    countDown: 0
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
    const { loginName, password } = this.data;
    const checkLoginName = checkValue({
      value: loginName,
      reg: mobile_or_email_reg,
      errMsg: '账户名不正确',
    });

    const checkPassword = checkValue({
      value: password,
      reg: pwd_reg,
      errMsg: '密码输入不正确',
    });

    if (checkLoginName && checkPassword) {
      request(linkCount, {
        'login_name': loginName,
        password,
      }).then(res => {
        wx.navigateTo({
          url: "../../index/index"
        });
      }).catch((err) => {
        showErrorToast('出错啦');
      });
    }
  }
});
