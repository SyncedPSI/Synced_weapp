import { request, getDateDiff, showTipToast } from "utils/util";
import { readLater, readLaterList } from "config/api";

Page({
  data: {
    list: [],
    totalCount: 0,
    isEdit: false,
    maxBtnWidth: 40,
    startX: 0,
    startY: 0,
  },
  onLoad: function () {
    this.getList();
  },

  getList: function() {
    request({
      url: readLaterList
    }).then((res) => {
      const { read_laters, count } = res.data;
      read_laters.forEach(item => {
        item.content.published_at = getDateDiff(item.content.published_at);
      });
      this.setData({
        list: read_laters,
        totalCount: count
      });
    })
  },

  touchStart: function(event) {
    const { list } = this.data;
    list.forEach((item) => {
      item.isOpenBtn = false;
    });
    const { clientX, clientY } = event.changedTouches[0];
    this.setData({
      list,
      startX: clientX,
      startY: clientY,
    });
  },

  touchMove: function(event) {
    const index = event.currentTarget.dataset.index;
    const { clientX } = event.changedTouches[0];
    const { startX, list, maxBtnWidth } = this.data;
    if (clientX < startX) { // left slide
      list[index].txtStyle = '';
      this.setData({
        list,
      });
      return;
    }

    let distance = clientX - startX;
    if (maxBtnWidth < distance) {
      distance = maxBtnWidth;
    }

    list[index].txtStyle = `left: ${distance}px`;
    this.setData({
      list,
    });
  },

  touchEnd: function(event) {
    const index = event.currentTarget.dataset.index;
    const { clientX } = event.changedTouches[0];
    const { startX, list, maxBtnWidth } = this.data;
    const distance = clientX - startX;
    list[index].txtStyle = '';

    if (maxBtnWidth < distance) {
      list[index].isOpenBtn = true;
    }

    this.setData({
      startX: 0,
      startY: 0,
      list,
    });
  },

  deleteItem: function(event) {
    const { id, index } = event.currentTarget.dataset;

    request({
      url: `${readLater}/${id}`,
      method: 'DELETE'
    }).then(() => {
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
