import { request } from "utils/util";
import { readLaterCount } from "config/api";

Component({
  properties: {
    activeBar: {
      type: String,
      value: ''
    },
  },
  data: {
    user: null,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    readLastersCount: 0,
  },
  attached: function () {
    this.setData({
      user: wx.getStorageSync('userInfo')
    });
    this.getReadLaterCount();
  },
  methods: {
    getReadLaterCount: function() {
      request(readLaterCount)
        .then((res) => {
          this.setData({
            readLastersCount: res.data.count
          });
        })
    }
  }
});
