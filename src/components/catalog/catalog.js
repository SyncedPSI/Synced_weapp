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
  },
  ready: function () {
    console.log(this.properties.catalogList)
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
      wx.createSelectorQuery().select(`#${target}`).boundingClientRect((rect) => {
        wx.pageScrollTo({
          scrollTop: rect.top
        });
        this.closeCatalog();
      }).exec()
    }
  }
})
