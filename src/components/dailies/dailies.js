import { showTipToast } from 'utils/util';

Component({
  properties: {
    list: {
      type: Array,
      value: [],
      observer: function() {
        this.resolveData();
      }
    },
  },
  data: {
    dailies: {},
    keys: [],
    activeId: null,
    activeTitle: null,
    actionSheetHidden: true,
  },
  attached: function () {
    this.resolveData();
  },
  detached: function () {

  },
  methods: {
    resolveData: function() {
      const { dailies } = this.data;
      this.properties.list.forEach((item) => {
        const { created_at } = item;
        if (created_at === undefined) return;

        const [_, date] = created_at.match(new RegExp('[0-9]{4}/([^\\s]+)', 'i'));
        if (dailies[date] === undefined) {
          dailies[date] = [];
        }
        dailies[date].push(item);
      });

      this.setData({
        dailies,
        keys: Object.keys(dailies)
      });
    },
    openActionSheet: function (event) {
      const { id, title } = event.currentTarget.dataset;
      this.setData({
        activeId: id,
        activeTitle: title,
        actionSheetHidden: !this.data.actionSheetHidden
      });
    },
    closeActionSheet: function() {
      this.setData({
        actionSheetHidden: true
      });
    },
    saveCard: function() {
      this.closeActionSheet();
      wx.navigateTo({
        url: `../daily/screenshot/screenshot?id=${this.data.activeId}`
      });
    },
    copyclip: function() {
      wx.setClipboardData({
        data: `https://www.jiqizhixin.com/dailies/${this.data.activeId}`,
        success: () => {
          showTipToast('内容已复制');
          this.closeActionSheet();
        }
      });
    },
  }
})
