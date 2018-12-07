import { request, getDateDiff, showTipToast } from "utils/util";
import { readLater, readLaterList } from "config/api";

Page({
  data: {
    list: [],
    totalCount: 0,
    isEdit: false,
    maxRightBtnWidth: 80,
  },
  onLoad: function () {
    this.getList();
  },

  getList: function() {
    request(readLaterList)
      .then((res) => {
        const { read_laters, count } = res.data;
        read_laters.forEach(item => {
          item.content.updatedAt = getDateDiff(item.content.published_at);
        });
        this.setData({
          list: read_laters,
          totalCount: count
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
          totalCount: newList.length
        });
        showTipToast('删除成功');
      })
  }
})
