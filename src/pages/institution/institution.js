Page({
  onLoad: function(option) {
    let id = null;
    let from = null;
    if (options.id) {
      id = options.id;
      from = options.from;
    } else {
      id = decodeURIComponent(options.scene);
      from = 'weapp';
    }

    wx.redirectTo({
      url: `/pages/graph/brief/brief?id=${id}&type=institutions&from=${from}`
    })
  }
})
