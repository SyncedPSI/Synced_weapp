import { comments } from "config/api";
import { request, showErrorToast } from 'utils/util';

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
    this.replyCommentId = null;
    this.fetchData();
  },

  methods: {
    fetchData: function() {
      request(`${comments}?article_id=${this.properties.article_id}`)
        .then(res => {
          const { comments, comments_count } = res.data;
          this.setData({
            comments,
            comments_count
          });
        });
    },
    closeComment: function() {
      this.triggerEvent('closecommentevent');
    },
    showAllReplies: function(event) {
      const { id, index } = event.target.dataset;
      request(`${comments}/${id}`)
        .then(res => {
          const { comments } = this.data;
          const oldComment = comments[index];

          this.setData({
            comments: [
              ...comments.slice(0, index),
              {
                ...oldComment,
                count: 0,
                replies: res.data.replies
              },
              ...comments.slice(index + 1)
            ]
          })
        });
    },
    replyComment: function(event) {
      this.replyCommentId = event.target.dataset.id;
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
      const url = this.replyCommentId === null ? `?article_id=${this.properties.article_id}` : `/${this.replyCommentId}/reply`
      request(`${comments}${url}`, {
        content
      }, 'POST')
        .then((res) => {
          this.fetchData();
        })
        .catch(() => {
          showErrorToast('操作失败，请重试！');
        })
        .then(() => {
          this.setData({
            content: ''
          });
          this.replyCommentId = null;
          this.triggerEvent('closecommentevent');
        })
    }
  }
});
