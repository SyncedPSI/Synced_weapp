import { getVerificationCode, bindMobile } from "config/api";
import { mobile_reg, vercode_reg } from 'config/all_reg';
import { showErrorToast, request, checkValue } from 'utils/util';

const app = getApp();

Page({
  data: {
    mobile: null,
    code: null,
    countDown: 0
  },
  bindMobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  bindCodeInput: function (e) {
    this.setData({
      code: e.detail.value
    });
  },
  getVerificationCode: function() {
    const { mobile } = this.data;
    const checkMobile = checkValue({
      value: mobile,
      reg: mobile_reg,
      errMsg: '请检查手机号',
    });

    if (checkMobile) {
      request(getVerificationCode, {
        mobile,
      }).then(res => {
        // 倒计时
      }).catch(err => {
        showErrorToast('出错啦');
      });
    } else {
      showErrorToast('手机号不正确');
    }

  },
  submitForm: function() {
    const { mobile, code } = this.data;
    const checkMobile = checkValue({
      value: mobile,
      reg: mobile_reg,
      errMsg: '手机号不正确',
    });

    const checkCode = checkValue({
      value: code,
      reg: vercode_reg,
      errMsg: '验证码不正确',
    });

    if (checkMobile || checkCode) {
      request(bindMobile, {
        mobile,
        code
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
