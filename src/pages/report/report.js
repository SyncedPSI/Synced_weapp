import { request, showLoading, showTipToast, showErrorToast } from "utils/util";
import { reports } from "config/api";

Page({
  data: {
    report: null,
    isFromWeapp: false,
    isFetching: true,
    isShowComment: false,
    isIphoneX: getApp().globalData.isIphoneX,
    isLogin: false,
  },
  onLoad: function (options) {
    request(`${reports}/${options.id}`)
      .then((res) => {
        this.setData({
          report: res.data,
          isFetching: false,
          isLogin: getApp().globalData.isLogin,
        })
      })
  },
  download: function() {
    showLoading('获取中');
    wx.downloadFile({
      url: this.data.report.file_url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: () => {
              showTipToast('已保存');
            }
          });
        } else {
          showErrorToast('获取失败');
        }
      },
      fail: (error) => {
        console.log(error);
        showErrorToast('获取失败');
      }
    })
  }
})
