Page({
  onLoad: function(options) {
    let id = null;
    if (options.id) {
      id = options.id;
    } else {
      id= decodeURIComponent(options.scene);
    }

    wx.redirectTo({
      url: `/pages/author/author?id=${id}&type=column&from=weapp`
    })
  }
})
