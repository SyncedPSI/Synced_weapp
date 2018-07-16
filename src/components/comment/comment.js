import { ApiRootUrl } from "config/api";
import { request } from 'utils/util';

Component({
  properties: {
    isShowComment: {
      type: Boolean,
      value: false
    },
    path: {
      type: String,
      value: ''
    }
  },
  data: {
    comment: [],
    content: ''
  },
  attached: function() {
    console.log(this.properties.path)
    // 获得评论列表
    // request(`${ApiRootUrl}${this.properties.path}`)

  },
  methods: {
    closeComment: function() {
      this.triggerEvent('closecommentevent');
    },
    bindContentInput: function (e) {
      this.setData({
        content: e.detail.value
      });
    },
    submitComment: function () {
      const { content } = this.data;

      if (content === '') return;
      console.log('发请求');
      this.triggerEvent('closecommentevent');
    }
  }
});
