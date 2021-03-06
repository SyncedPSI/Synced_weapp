import { request } from "utils/util";
import { notice, users } from "config/api";

Page({
  data: {
    noticeList: {},
    unreadNoticeCount: 0,
    hasMoreNotice: true,
    noHasNotice: false,
    readCount: 0,
    startX: 0,
    startY: 0,
    activeNav: 'readlater',
    user: null,
    noticePage: 1,
    isAuth: getApp().globalData.isAuth,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    isShowModal: false,
    pubInfo: '职务信息',
    isShowInfo: true
  },

  onLoad: function () {
    this.noticePage = 1;
    this.bannerPath = {
      article: '/pages/article/article',
      daily: '/pages/daily/show/show',
      trend: '/pages/trend/trend',
      document: '/pages/document/detail/detail',
    }

    const user = wx.getStorageSync('userInfo');
    user.nickName = user.nickName.slice(0, 8);
    const { isAuth, notifyCount } = getApp().globalData;
    this.setData({
      user,
      unreadNoticeCount: notifyCount,
    });

    if (isAuth) {
      this.getAuthInfo();
    }
  },

  getAuthInfo: function() {
    request({
      url: `${users}/certification`
    }).then(res => {
      const { pubinfo } = res.data;
      let isShowInfo = true;
      if (pubinfo === '') {
        isShowInfo = false
      }

      this.setData({
        pubInfo: pubinfo,
        isShowInfo
      })
    })
  },

  openModal: function () {
    this.setData({
      isShowModal: true,
    })
  },

  closeModal: function() {
    this.setData({
      isShowModal: false,
    })
  },

  onShow: function() {
    this.setData({
      isAuth: getApp().globalData.isAuth,
    });
    if (this.data.activeNav === 'notice') {
      this.setData({
        hasMoreNotice: true
      }, () => {
        this.noticePage = 1;
        this.fetchMoreNotice(true);
      });
    }
  },

  switchNav: function (event) {
    const nav = event.currentTarget.dataset.type;
    this.setData({
      activeNav: nav,
    }, () => {
      if (nav === 'notice' && this.data.hasMoreNotice) {
        this.fetchMoreNotice(true);
      }
    });
  },

  getReadCount: function(event) {
    const {notifications_count, count} = event.detail;
    this.setData({
      readCount: count
    });
    if (notifications_count !== undefined) {
      this.getNoticeCount(notifications_count);
    }
  },

  getNoticeCount: function (count) {
    this.setData({
      unreadNoticeCount: count
    });
    getApp().globalData.notifyCount = count;
  },

  fetchMoreNotice: function(isFirst = false) {
    const { activeNav, hasMoreNotice } = this.data;
    if (activeNav !== 'notice' || !hasMoreNotice) return;

    request({
      url: `${notice}?page=${this.noticePage}`
    }).then(res => {
      this.noticePage += 1;
      const { notifications, has_next_page } = res.data;
      let { noticeList } = this.data;

      if (isFirst) {
        const count = res.data.notifications_count;
        this.getNoticeCount(count);
        if (notifications.length === 0) {
          this.setData({
            noHasNotice: true
          });
        }
        noticeList = {};
      }

      notifications.forEach((item) => {
        const { created_at } = item;
        if (created_at === undefined) return;
        item.created_at = item.created_at.split(' ')[1];
        item.path = this.bannerPath[item.comment.commentable_type];

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
        hasMoreNotice: has_next_page
      });
    });
  }
})
