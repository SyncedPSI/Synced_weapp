import { request, getDateDiff, showTipToast } from "utils/util";
import { readLater, readLaterList } from "config/api";

Page({
  data: {
    readList: [],
    readCount: 0,
    isEdit: false,
    maxBtnWidth: 40,
    startX: 0,
    startY: 0,
    activeNav: 'readlater',
    user: null,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
  },
  onLoad: function () {
    this.getList();
    const user = wx.getStorageSync('userInfo');
    user.nickName = user.nickName.slice(0, 8);
    this.setData({
      user,
    });
  },

  switchNav: function (event) {
    this.setData({
      activeNav: event.target.dataset.type,
      scrollTop: 0,
    }, () => {

    });
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
        readList: read_laters,
        readCount: count
      });
    })
  },

  touchStart: function(event) {
    const { readList } = this.data;
    readList.forEach((item) => {
      item.isOpenBtn = false;
    });
    const { clientX, clientY } = event.changedTouches[0];
    this.setData({
      readList,
      startX: clientX,
      startY: clientY,
    });
  },

  touchMove: function(event) {
    const index = event.currentTarget.dataset.index;
    const { clientX } = event.changedTouches[0];
    const { startX, readList, maxBtnWidth } = this.data;
    if (clientX < startX) { // left slide
      readList[index].txtStyle = '';
      this.setData({
        readList,
      });
      return;
    }

    let distance = clientX - startX;
    if (maxBtnWidth < distance) {
      distance = maxBtnWidth;
    }

    readList[index].txtStyle = `left: ${distance}px`;
    this.setData({
      readList,
    });
  },

  touchEnd: function(event) {
    const index = event.currentTarget.dataset.index;
    const { clientX } = event.changedTouches[0];
    const { startX, readList, maxBtnWidth } = this.data;
    const distance = clientX - startX;
    readList[index].txtStyle = '';

    if (maxBtnWidth < distance) {
      readList[index].isOpenBtn = true;
    }

    this.setData({
      startX: 0,
      startY: 0,
      readList,
    });
  },

  deleteItem: function(event) {
    const { id, index } = event.currentTarget.dataset;

    request({
      url: `${readLater}/${id}`,
      method: 'DELETE'
    }).then(() => {
      const { readList } = this.data;
      const newList = [
        ...readList.slice(0, index),
        ...readList.slice(index + 1)
      ];
      this.setData({
        readList: newList,
        readCount: newList.length
      });
      showTipToast('删除成功');
    })
  }
})
