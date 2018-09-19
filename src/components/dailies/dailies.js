Component({
  properties: {
    dailies: {
      type: Object,
      value: [],
      observer: function() {
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
