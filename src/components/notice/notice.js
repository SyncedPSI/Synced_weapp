import { request } from "utils/util";
import { notice } from "config/api";

Component({
  properties: {
    notice: {
      type: Object,
      value: {},
       observer: function () {
         this.resolveData();
       }
    },
  },
  data: {
    keys: [],
  },
  attached: function () {
    this.resolveData();
  },
  methods: {
    resolveData: function() {
      const { notice } = this.data;

      this.setData({
        keys: Object.keys(notice)
      });
    },

    readNotice: function(event) {
      console.log(event)
      const { id } = event.currentTarget.dataset;
      if (!id) return;

      request({
        url: `${notice}/${id}/read`
      })
    }
  }
});
