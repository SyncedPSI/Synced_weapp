import { comments } from "config/api";
import { request } from 'utils/util';

Component({
  properties: {
    isShowComment: {
      type: Boolean,
      value: false
    },
    article_id: {
      type: String,
      value: ''
    }
  },

  data: {
    comments: [],
    comments_count: 0,
    content: '',
    isIphoneX: getApp().globalData.isIphoneX
  },

  attached: function() {
    console.log(this.properties.article_id);
    request(`${comments}?article_id=${this.properties.article_id}`)
      .then(res => {
        const { comments, comments_count } = res.data;
        this.setData({
          comments,
          comments_count
        });
      });
  },

  methods: {
    move: function() {
      return false;
    },
    closeComment: function() {
      this.triggerEvent('closecommentevent');
    },
    openComment: function() {
      this.triggerEvent('opencommentevent');
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
