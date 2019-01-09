import { request, getDateDiff } from "utils/util";
import { articles, articleHotTopics } from "config/api";

Page({
  data: {
    articleList: [],
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    scrollTop: 0,
    activeCategory: 'all',
    category: [
      { en: 'all', zh: '全部', type: 'category' },
      { en: 'industry', zh: '#产业', type: 'category' },
      { en: 'practice', zh: '#工程', type: 'category' },
      { en: 'theory', zh: '#理论', type: 'category' },
      { en: 'basic', zh: '#入门', type: 'category' },
    ],
    isLogin: false,
    notifyCount: 0,
  },

  onLoad: function() {
    this.page = 1;
    this.activeType = 'category';

    this.getArticleList();
    // this.getHotTopic();
  },

  onShow: function () {
    this.setData({
      isLogin: getApp().globalData.isLogin,
      notifyCount: getApp().globalData.notifyCount
    })
  },

  switchCategory: function(event) {
    const { name, type } = event.target.dataset;
    this.activeType = type;
    this.setData({
      activeCategory: name,
      scrollTop: 0,
      articleList: [],
    }, () => {
      this.page = 1;
      this.getArticleList();
    });
  },
  getHotTopic: function () {
    return request({
      url: articleHotTopics
    }).then(res => {
      console.log(res)
      this.setData({
        category: [...category, res.data]
      })
    })
  },

  getArticleList: function () {
    const { activeCategory } = this.data;
    const queryCategory = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
    return request({
      url: `${articles}?page=${this.page}&type=${this.activeType}${queryCategory}`
    }).then(res => {
      this.page += 1;
      const { articleList } = this.data;
      const newList = res.data;
      newList.forEach(item => {
        item.published_at = getDateDiff(item.published_at);
      });

      this.setData({
        articleList: [...articleList, ...newList],
      });
    });
  },
  fetchMoreData: function () {
    this.getArticleList();
  },
  // onPullDownRefresh: function () {
  //   wx.showNavigationBarLoading();

  //   this.page = 1;
  //   this.getList(true)
  //     .catch(() => {})
  //     .then(() => {
  //       wx.hideNavigationBarLoading();
  //       wx.stopPullDownRefresh();
  //     });
  // },
  onShareAppMessage: function() {
    return {
      title: '文章 - 机器之心',
      path: '/pages/category/category'
    };
  },
});
