Component({
  properties: {
    hidden: {
      type: Boolean,
      value: true
    },
  },
  methods: {
    closeActionSheet: function () {
      this.triggerEvent('closeevent');
    }
  }
});
