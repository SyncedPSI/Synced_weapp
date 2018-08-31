Component({
  properties: {
    catalogList: {
      type: Array,
      value: []
    },
  },
  data: {
    isShowCatalog: false,
    isIphoneX: getApp().globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  ready: function () {

  },
  detached: function () {

  },
  methods: {
    openCatalog: function() {
      this.switchCatalog(true);
    },
    closeCatalog: function() {
      this.switchCatalog(false);
    },
    switchCatalog: function(status) {
      this.setData({
        isShowCatalog: status
      });
    },
    scrollToTarget: function(event) {
      const { target } = event.target.dataset;
      if (target) {
        this.closeCatalog();
        this.triggerEvent('scroll', { target });
      }
    }
  }
})
