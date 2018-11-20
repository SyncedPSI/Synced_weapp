Page({
  onLoad: function(option) {
    wx.redirectTo({
      url: `/pages/graph/brief/brief?id=${option.id}&type=resources`
    })
  }
})
