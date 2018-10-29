Component({
  properties: {
    hidden: {
      type: Boolean,
      value: true
    },
  },
  attached: function () {
    console.log(this.data)
  },
  methods: {
    closeActionSheet: function () {
      console.log('lll')
      this.triggerEvent('closeevent');
    }
  }
});
