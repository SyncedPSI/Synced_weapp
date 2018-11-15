Component({
  options: {
    multipleSlots: true
  },
  properties: {
    hiddenShared: {
      type: Boolean,
      value: true
    },
    imgUrl: {
      type: String,
      value: null,
    }
  },
  methods: {
    closeShared: function() {
      this.triggerEvent('closeevent');
    },
    sharedPage: function () {
      this.triggerEvent('sharedevent');
    },
    drawImgae: function() {
      this.triggerEvent('drawevent');
    },
  }
});
