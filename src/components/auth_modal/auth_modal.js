import { certifications } from 'config/api';
import { request } from "utils/util";

Component({
  properties: {
    isShowModal: {
      type: Boolean,
      value: false
    },
    pubInfo: {
      type: String,
      value: ''
    },
    isShowInfo: {
      type: Boolean,
      value: true
    }
  },
  data: {
    userInfo: {},
  },
  attached: function () {
    this.setData({
      userInfo: getApp().globalData.userInfo
    });
  },
  methods: {
    switchChange: function (event) {
      const newStatus = event.detail.value;
      request({
        url: certifications,
        method: 'POST',
        data: {
          reveal: newStatus
        }
      }).then((res) => {
        this.setData({
          isShowInfo: event.detail.value,
          pubInfo: res.data.pubInfo
        });
      })
    },
    closeModal: function () {
      this.triggerEvent('closemodal');
    }
  }
})
