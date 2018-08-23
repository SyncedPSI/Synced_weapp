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
    actionSheetHidden: true,
  },
  attached: function () {
    this.activeDailyId = null;
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

        const [_, date] = created_at.match(new RegExp('[0-9]{4}/([^?#]+)', 'i'));
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
      this.activeDailyId = event.target.dataset.id;
      this.setData({
        actionSheetHidden: !this.data.actionSheetHidden
      });
    },
    closeActionSheet: function() {
      this.setData({
        actionSheetHidden: true
      });
    },
    saveCard: function(event) {
      wx.navigateTo({
        url: `../daily/screenshot/screenshot?id=${this.activeDailyId}`
      });
    },
    copyclip: function() {
      wx.setClipboardData({
        data: `https://www.jiqizhixin.com/dailies/${this.activeDailyId}`,
        success: function (res) {
          showTipToast('内容已复制');
        }
      });
    },
  }
})
