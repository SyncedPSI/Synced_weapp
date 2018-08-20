Component({
  properties: {
    catalogList: {
      type: Array,
      value: []
    },
    scrollTop: {
      type: Number,
      value: 0
    },
  },
  data: {
    isShowCatalog: false,
    isIphoneX: getApp().globalData.isIphoneX,
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
      wx.createSelectorQuery().select(`#${target}`).boundingClientRect((rect) => {
        console.log(this.properties.scrollTop)
        wx.pageScrollTo({
          scrollTop: rect.top + this.properties.scrollTop
        });
        this.closeCatalog();
      }).exec()
    }
  }
})
