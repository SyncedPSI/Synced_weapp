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
    const user = wx.getStorageSync('userInfo');
    user.nickName = user.nickName.slice(0, 8);
    this.setData({
      user,
    });
  },
  methods: {
  }
});
