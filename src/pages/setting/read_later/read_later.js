import { request, getDateDiff } from "utils/util";
import { readLater } from "config/api";

Page({
  data: {
    list: [],
    startX: 0,
    startY: 0,
    maxRightBtnWidth: 80,
  },
  onLoad: function () {
    this.getList();
  },

  getList: function() {
    request(readLater)
      .then((res) => {
        const list = res.data;
        list.forEach(item => {
          item.updatedAt = getDateDiff(item.updated_at);
        });

        this.setData({
          list
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
    const { startX, list, maxRightBtnWidth } = this.data;
    if (clientX > startX) {
      list[index].txtStyle = '';
      this.setData({
        list,
      });
      return; // right slide
    }

    let distance = startX - clientX;
    if (maxRightBtnWidth < distance) {
      distance = maxRightBtnWidth;
    }
    list[index].txtStyle = `right: ${distance}px`;
    this.setData({
      list,
    });
  },

  touchEnd: function(event) {
    const index = event.currentTarget.dataset.index;
    const { clientX } = event.changedTouches[0];
    const { startX, list, maxRightBtnWidth } = this.data;
    const distance = startX - clientX;
    list[index].txtStyle = '';

    if (maxRightBtnWidth < distance) {
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
      })
  }
})
