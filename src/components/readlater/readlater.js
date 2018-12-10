import { request, getDateDiff, showTipToast } from "utils/util";
import { readLater, readLaterList } from "config/api";

Component({
  properties: {
    readList: {
      type: Array,
      value: []
    },
  },
  attached: function () {
    this.getList();
  },
  data: {
    readList: [],
  },

  methods: {
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

      this.triggerEvent('delete', { id, index});
    }
  }
});
