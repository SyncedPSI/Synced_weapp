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

        const [_, key] = created_at.match(new RegExp('^([^\\s]+)', 'i'));
        if (dailies[key] === undefined) {
          const createDate = new Date(created_at);
          dailies[key] = {
            day: createDate.getDate(),
            date: `${createDate.getFullYear()}年${createDate.getMonth() + 1}月`,
            list: [],
          };
        }
        dailies[key].list.push(item);
      });

      this.setData({
        dailies,
        keys: Object.keys(dailies)
      });
    },
    openActionSheet: function (event) {
      this.triggerEvent('open', { ...event.currentTarget.dataset });
    }
  }
})
