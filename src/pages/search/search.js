const app = getApp();

Page({
  data: {
    searchIconUrl: '../../icons/ic_search.svg'
  },

  search: function (e) {
    const keywords = e.detail.value;
    wx.request({
      url: `https://www.jiqizhixin.com/api/v1/search?type=articles&keywords=${keywords}`,
      header: { 'Contetn-Type': 'application/json' },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
      }
    });
  }
})
