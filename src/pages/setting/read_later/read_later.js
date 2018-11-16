import { request, getDateDiff, showTipToast } from "utils/util";
import { readLater, readLaterCount } from "config/api";

Page({
  data: {
    list: [],
    isEdit: false,
    maxRightBtnWidth: 80,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
  },
  onLoad: function () {
    this.getList();
    this.getReadLaterCount();
  },

  getList: function() {
    request(readLater)
      .then((res) => {
        const list = res.data;
        list.forEach(item => {
          item.content.updatedAt = getDateDiff(item.content.published_at);
        });
        this.setData({
          list
        });
      })
  },

  getReadLaterCount: function () {
    request(readLaterCount)
      .then((res) => {
        this.setData({
          readLastersCount: res.data.count
        });
      })
  },

  switchEdit: function() {
    this.setData({
      isEdit: !this.data.isEdit
    });
  },

  deleteItem: function(event) {
    console.log('klkk')
    const { id, index } = event.currentTarget.dataset;

    request(`${readLater}/${id}`, {}, 'DELETE')
      .then(() => {
        const { list } = this.data;
        const newList = [
          ...list.slice(0, index),
          ...list.slice(index + 1)
        ];
        this.setData({
          list: newList,
        });
        showTipToast('删除成功');
      })
  }
})
