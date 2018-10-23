Component({
  properties: {
    title: {
      type: String,
      value: "none"
    },
    category: {
      type: String,
      value: "none"
    },
    publishedAt: {
      type: String,
      value: "none"
    },
    articleId: {
      type: String,
      value: ""
    },
    author: {
      type: Object,
      value: {
        avatar_url: '',
        nickname: ''
      }
    },
    query: {
      type: String,
      value: ""
    },
    className: {
      type: String,
      value: ''
    }
  }
});
