import { request } from "utils/util";
// import { readLaterCount } from "config/api";

Component({
  properties: {
    activeBar: {
      type: String,
      value: ''
    },
  },
  data: {
    user: null,
    readLastersCount: 0,
  },
  attached: function () {
    this.setData({
      user: wx.getStorageSync('userInfo')
    });
  },
  methods: {
  }
});
