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
  methods: {
    track: function(event) {
      const { query } = event.currentTarget.dataset;
      getApp().td_app_sdk.event({
        id: `related_node_in_graph_with_tap`,
        label: `tap_query_is_${query}`,
      });
    },
  }
})
