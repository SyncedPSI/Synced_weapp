import { request, showTipToast } from "utils/util";
import { subscribe } from "config/api";

Component({
  data: {
    aiTypes: [],
    subscribeTypes: []
  },
  attached: function () {
    this.getList();
  },
  methods: {
    getList: function () {
      request({
        url: subscribe
      }).then(res => {
        const { ai_types, subscribe_types } = res.data;
        this.setData({
          aiTypes: ai_types,
          subscribeTypes: subscribe_types
        })
      })
    },
    switchChange: function(event) {
      const { category } = event.currentTarget.dataset;
      request({
        url: `${subscribe}/switch`,
        data: {
          category,
          status: event.detail.value
        },
        method: 'POST'
      }).then(() => {
        showTipToast('修改成功');
      })
    },
    switchAiType: function(event) {
      const { index } = event.currentTarget.dataset;
      const { aiTypes } = this.data;
      const { category, is_subscribe } = aiTypes[index];
      request({
        url: `${subscribe}/switch`,
        data: {
          category,
          status: !is_subscribe
        },
        method: 'POST'
      }).then(() => {
        showTipToast('修改成功');
        aiTypes[index].is_subscribe = !is_subscribe;
        this.setData({
          aiTypes
        })
      })
    }
  }
});
