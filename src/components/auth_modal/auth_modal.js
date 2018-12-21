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
    }
  },
  data: {
    isShowInComment: true,
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
      }).then(() => {
        this.setData({
          isShowInComment: event.detail.value
        });
      })
    },
    closeModal: function () {
      this.triggerEvent('closemodal');
    }
  }
})
