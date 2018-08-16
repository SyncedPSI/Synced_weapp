import { comments, ApiRootUrl } from "config/api";
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
    count: 0,
    content: '',
    placeholder: '请输入评论',
    keyboardHeight: null,
    isIphoneX: getApp().globalData.isIphoneX
  },

  attached: function() {
    this.replyCommentId = null;
    this.fetchData();
  },

  methods: {
    fetchData: function() {
      request(`${ApiRootUrl}/articles/${this.properties.article_id}/comments`)
        .then(res => {
          const { comments, count } = res.data;
          this.setData({
            comments,
            count
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
      const { id, name } = event.target.dataset;
      this.replyCommentId = id;
      this.setData({
        placeholder: `回复${name}`
      });
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
      const url = this.replyCommentId === null ? `${ApiRootUrl}/articles/${this.properties.article_id}/comments` : `${comments}/${this.replyCommentId}/reply`
      request(`${url}`, {
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
    },
    inputFocus: function (event) {
      console.log(event.detail.height)
      this.setData({
        keyboardHeight: event.detail.height
      });
    },
    inputBlur: function() {
      this.setData({
        keyboardHeight: null
      });
    },
  },
});
