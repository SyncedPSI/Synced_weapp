import { showTipToast } from 'utils/util';

Component({
  properties: {
    dailyList: {
      type: Array,
      value: []
    },
  },
  data: {
    dailies: {},
    keys: [],
    actionSheetHidden: true,
  },
  ready: function () {
    this.activeDailyId = null;
    const testDailies = {
      '今天': [{
        id: 1,
        title: '百度与盼达用车在重庆启动国内首次自动驾驶共享汽车试运营',
        content: '机器之心获悉，6台搭载了百度Apollo开放平台Valet Parking产品的自动驾驶共享汽车将在重庆投入为期约1个月的定向试运营。2018年底，百度和盼达用车将协同研发能够实现更多功能自动驾驶共享汽车，并将投放近百台规模的自动驾驶共享汽车车队，覆盖到更大范围的应用场景中。',
        created_at: '2017/9/8 12:11'
      }, {
        id: 2,
        title: '2百度与盼达用车在重庆启动国内首次自动驾驶共享汽车试运营',
        content: '机器之心获悉，6台搭载了百度Apollo开放平台Valet Parking产品的自动驾驶共享汽车将在重庆投入为期约1个月的定向试运营。2018年底，百度和盼达用车将协同研发能够实现更多功能自动驾驶共享汽车，并将投放近百台规模的自动驾驶共享汽车车队，覆盖到更大范围的应用场景中。',
        created_at: '2017/9/8 13:11'
      }],
      '8月19日': [{
        id: 3,
        title: '3百度与盼达用车在重庆启动国内首次自动驾驶共享汽车试运营',
        content: '机器之心获悉，6台搭载了百度Apollo开放平台Valet Parking产品的自动驾驶共享汽车将在重庆投入为期约1个月的定向试运营。2018年底，百度和盼达用车将协同研发能够实现更多功能自动驾驶共享汽车，并将投放近百台规模的自动驾驶共享汽车车队，覆盖到更大范围的应用场景中。',
        created_at: '2017/9/8 12:11'
      }, {
        id: 4,
        title: '4百度与盼达用车在重庆启动国内首次自动驾驶共享汽车试运营',
        content: '机器之心获悉，6台搭载了百度Apollo开放平台Valet Parking产品的自动驾驶共享汽车将在重庆投入为期约1个月的定向试运营。2018年底，百度和盼达用车将协同研发能够实现更多功能自动驾驶共享汽车，并将投放近百台规模的自动驾驶共享汽车车队，覆盖到更大范围的应用场景中。',
        created_at: '2017/9/8 13:11'
      }],
    };

    this.setData({
      dailies: testDailies,
      keys: Object.keys(testDailies)
    });
  },
  detached: function () {

  },
  methods: {
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
