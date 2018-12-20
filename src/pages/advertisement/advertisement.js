import { request } from "utils/util";
import { advertisement } from "config/api";

Page({
  onLoad: function (options) {
    let id = null;
    if (options.id) {
      id = options.id;
    } else {
      id = decodeURIComponent(options.scene);
    }

    request(`${advertisement}/id`)
      .then((res) => {
        const { url } = res.data;
          wx.redirectTo({
            url: `/pages/web_view/web_view?url=${url}`
          })
      })
    }
})

