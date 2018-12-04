import { request } from "utils/util";
import { documents } from "config/api";

Page({
  data: {
    document: null,
    isIphoneX: getApp().globalData.isIphoneX,
    isLogin: false,
  },
  onLoad: function (options) {
    let id = null;
    let isFromWeapp = true;
    if (options.id) {
      id = options.id;
      isFromWeapp = options.from === "weapp";
    } else {
      id = decodeURIComponent(options.scene);
    }

    request(`${documents}/${id}`)
      .then((res) => {
        const document = res.data;
        if (document.wxacode_url === null) {
          this.getWxcode(id);
        }

        this.setData({
          document,
          navigateTitle: document.title,
          isFromWeapp,
          isLogin: getApp().globalData.isLogin,
        })
      });

    // 提交表单
    // 更新本地缓存和globalData
  }
})
