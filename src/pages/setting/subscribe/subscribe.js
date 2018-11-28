import { request, showTipToast } from "utils/util";
import { subscribe } from "config/api";

Page({
  data: {
    aiTypes: [],
    subscribeTypes: []
  },
  onLoad: function () {
    this.getList();
  },

  getList: function () {
    request(subscribe)
      .then(res => {
        const { ai_types, subscribe_types } = res.data;
        this.setData({
          aiTypes: ai_types,
          subscribeTypes: subscribe_types
        })
      })
  },
  switchChange: function(event) {
    const { category } = event.currentTarget.dataset;
    request(`${subscribe}/switch`, {
      category,
      status: event.detail.value
    }, 'POST').then(() => {
      showTipToast('修改成功');
    })
  },
  switchAiType: function(event) {
    const { index } = event.currentTarget.dataset;
    const { aiTypes } = this.data;
    const { category, is_subscribe } = aiTypes[index];
    request(`${subscribe}/switch`, {
      category,
      status: !is_subscribe
    }, 'POST').then(() => {
      showTipToast('修改成功');
      aiTypes[index].is_subscribe = !is_subscribe;
      this.setData({
        aiTypes
      })
    })
  }
});
