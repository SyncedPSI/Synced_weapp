import { request } from "utils/util";
import { notice } from "config/api";

Page({
  data: {
    noticeList: {},
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
        this.fetchMoreNotice(true);
      }
    });
  },

  getReadCount: function(event) {
    this.setData({
      readCount: event.detail.count
    });
  },

  getUnreadCount: function (count) {
    this.setData({
      unreadNoticeCount: count
    });
    getApp().globalData.notifyCount = count
  },

  fetchMoreNotice: function(isFirst = false) {
    const { activeNav, hasNotice } = this.data;
    if (activeNav !== 'notice' || !hasNotice) return;

    request({
      url: `${notice}?page=${this.noticePage}`
    }).then(res => {
      this.noticePage += 1;
      const { noticeList } = this.data;
      if (isFirst) {
        const count = res.data.notifications_count;
        this.getUnreadCount(count);
      }

      const { notifications, has_next_page } = res.data;
      notifications.forEach((item) => {
        const { created_at } = item;
        if (created_at === undefined) return;
        item.created_at = item.created_at.split(' ')[1];
        if (item.comment.commentable_type === 'article') {
          item.path = '/pages/article/article';
        } else if (item.comment.commentable_type === 'daily') {
          item.path = '/pages/daily/show/show';
        } else if (item.comment.commentable_type === 'trend') {
          item.path = '/pages/trend/trend';
        } else if (item.comment.commentable_type === 'document') {
          item.path = '/pages/document/detail/detail';
        }

        // key format: 2018/9/21
        const [_, key] = created_at.match(new RegExp('^([^\\s]+)', 'i'));
        if (noticeList[key] === undefined) {
          const createDate = new Date(created_at);
          noticeList[key] = {
            date: `${createDate.getMonth() + 1}月${createDate.getDate()}日`,
            list: [],
          };
        }
        noticeList[key].list.push(item);
      });

      this.setData({
        noticeList,
        hasNotice: has_next_page
      });
    });
  }
})
