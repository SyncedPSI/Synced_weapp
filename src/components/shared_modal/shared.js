Component({
  properties: {
    hiddenShared: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    closeShared: function() {
      this.triggerEvent('closeevent');
    },
    sharedPage: function () {
      this.triggerEvent('sharedevent');
    },
    drawImage: function() {
      this.triggerEvent('drawevent');
    },
  }
});
