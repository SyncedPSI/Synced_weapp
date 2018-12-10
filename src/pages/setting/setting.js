import { request } from "utils/util";
import { notice } from "config/api";

Page({
  data: {
    noticeList: {
      1: {
        date: '今天',
        list: [1, 2]
      },
      2: {
        date: '12月10日',
        list: [1, 2]
      }
    },
    unreadNoticeCount: 0,
    hasNotice: true,
    readCount: 0,
    startX: 0,
    startY: 0,
    activeNav: 'readlater',
    user: null,
    noticePage: 1,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
  },

  onLoad: function () {
    this.noticePage = 1;
    const user = wx.getStorageSync('userInfo');
    user.nickName = user.nickName.slice(0, 8);
    this.setData({
      user,
      unreadNoticeCount: getApp().globalData.notifyCount,
    });
  },

  switchNav: function (event) {
    const nav = event.currentTarget.dataset.type;
    this.setData({
      activeNav: nav,
    }, () => {
      if (nav === 'notice' && this.data.hasNotice) {
        this.fetchMoreNotice();
      }
    });
  },

  getReadCount: function(event) {
    this.setData({
      readCount: event.detail.count
    });
  },
  fetchMoreNotice: function() {
    if (this.data.activeNav !== 'notice') return;

    request({
      url: `${notice}?page=${this.noticePage}`
    }).then(res => {
      this.noticePage += 1;
      const { noticeList } = this.data;

      const { list } = res.data;
      list.forEach((item) => {
        const { created_at } = item;
        if (created_at === undefined) return;

        // key format: 2018/9/21
        const [_, key] = created_at.match(new RegExp('^([^\\s]+)', 'i'));
        if (noticeList[key] === undefined) {
          const createDate = new Date(created_at);
          noticeList[key] = {
            day: createDate.getDate(),
            date: `${createDate.getFullYear()}年${createDate.getMonth() + 1}月`,
            list: [],
          };
        }
        noticeList[key].list.push(item);
      });

      this.setData({
        noticeList,
      });
    });
  }
})
