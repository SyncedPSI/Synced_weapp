import { comments, ApiV1 } from "config/api";
import { request, showErrorToast, showTipToast } from 'utils/util';

Component({
  properties: {
    isShowComment: {
      type: Boolean,
      value: false
    },
    baseUrl: {
      type: String,
      value: ''
    },
    hasShared: {
      type: Boolean,
      value: false
    },
    isSmallPadding: {
      type: Boolean,
      value: false,
    }
  },

  data: {
    comments: [],
    count: 0,
    placeholder: '请输入评论',
    keyboardHeight: null,
    isIphoneX: getApp().globalData.isIphoneX,
    isAndroid: getApp().globalData.isAndroid,
  },

  attached: function() {
    this.replyCommentId = null;
    this.fetchData();
  },

  methods: {
    fetchData: function() {
      request({
        url: `${ApiV1}${this.properties.baseUrl}/comments`
      }).then(res => {
        const { comments, count } = res.data;
        this.setData({
          comments,
          count
        });
      });
    },
    closeComment: function() {
      this.triggerEvent('closecomment');
    },
    showAllReplies: function(event) {
      const { id, index } = event.target.dataset;
      request({
        url: `${comments}/${id}`
      }).then(res => {
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
      this.triggerEvent('opencomment');
    },
    submitComment: function (event) {
      const { value: { content }, formId } = event.detail;
      if (content === '') return;

      const isCreateComment = this.replyCommentId === null;
      const url = isCreateComment ? `${ApiV1}${this.properties.baseUrl}/comments` : `${comments}/${this.replyCommentId}/reply`;
      request({
        url,
        data: {
          content,
          form_id: formId
        },
        method: 'POST'
      }).then(() => {
        if (isCreateComment) {
          showTipToast('评论成功');
        } else {
          showTipToast('回复成功');
        }

        this.fetchData();
      })
      .catch(() => {
        showErrorToast('操作失败，请重试！');
      })
      .then(() => {
        this.replyCommentId = null;
        this.triggerEvent('closecomment', {commentStr: content});
      })
    },
    inputFocus: function (event) {
      this.setData({
        keyboardHeight: event.detail.height
      });
    },
    inputBlur: function() {
      this.setData({
        keyboardHeight: null
      });
    },
    shareComment: function(event) {
      this.triggerEvent('sharecomment', event.currentTarget.dataset);
    }
  },
});
