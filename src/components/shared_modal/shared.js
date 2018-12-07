Component({
  properties: {
    hiddenShared: {
      type: Boolean,
      value: true
    },
  },
  data: {
    isIphoneX: getApp().globalData.isIphoneX,
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
