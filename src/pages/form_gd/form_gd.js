Page({
  submit: function(event) {
    if(event.detail) {
       wx.showToast({
         title: event.detail.toString(),
         icon: 'none',
         duration: 2000
       })
    }
  },
})
