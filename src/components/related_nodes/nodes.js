Component({
  properties: {
    nodes: {
      type: Array,
      value: []
    },
    hasMore: {
      type: Boolean,
      value: false
    },
    query:{
      type: String,
      value: ''
    },
    isSmallPadding: {
      type: Boolean,
      value: false
    }
  },
})
