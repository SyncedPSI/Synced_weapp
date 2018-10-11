Component({
  properties: {
    dailies: {
      type: Object,
      value: {},
      observer: function() {
        this.resolveData();
      }
    },
    dayDaily: {
      type: Object,
      value: {},
    },
  },
  data: {
    keys: [],
    topicImage: "/images/daily_featured.svg"
  },
  attached: function () {
    this.resolveData();
  },
  detached: function () {

  },
  methods: {
    resolveData: function() {
      const { dailies } = this.data;

      this.setData({
        keys: Object.keys(dailies)
      });
    },
    openActionSheet: function (event) {
      this.triggerEvent('open', { ...event.currentTarget.dataset });
    }
  }
})
