Component({
  properties: {
    notice: {
      type: Object,
      value: {},
       observer: function () {
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
  methods: {
    resolveData: function() {
      const { notice } = this.data;

      this.setData({
        keys: Object.keys(notice)
      });
    },
  }
});
