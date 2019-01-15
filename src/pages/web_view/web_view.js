Page({
  data: {
    url: null,
  },
  onLoad: function(options) {
    const { url } = options;

    this.setData({
      url,
    })
  },
  onShareAppMessage: function() {
    const { url } = this.data;
    return {
      path: `/pages/web_view/web_view?url=${url}`
    };
  },
})
