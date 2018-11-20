import { request } from "utils/util";
import { ApiRootUrl } from "config/api";

Page({
  data: {
    node: null,
    isFromWeapp: false,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isExpand: false,
    trends: [],
    hasNextPage: true,
  },
  onLoad: function(options) {
    const { id, type, from } = options;
    this.page = 1;
    request(`${ApiRootUrl}/${type}/${id}`)
      .then((res) => {
        const node = res.data;
        this.setData({
          id,
          type,
          navigateTitle: node.full_name,
          node: node,
          isFromWeapp: from === "weapp",
        })
      });
    this.fetchTrends(id, type);
  },
  fetchTrends: function(id, type) {
    // request(`${ApiRootUrl}/${type}/${id}`)
    //   .then((res) => {
    //     console.log(res.data)

    //   })
  },
  fetchMore: function () {
    const { type, id } = this.data;
    this.fetchTrends(id, type);
  },
  copyclip: function (event) {
    wx.setClipboardData({
      data: event.target.dataset.url,
      success: () => {
        showTipToast('链接已复制');
      }
    });
  },
  seeAll: function() {
    this.setData({
      isExpand: !this.data.isExpand,
    })
  },
  onShareAppMessage: function() {
    const { id, type }= this.data;
    return {
      title,
      path: `/pages/graph/brief/brief?id=${id}&type=${type}&from=weapp`,
    };
  },
})
