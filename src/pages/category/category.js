import { request, getDateDiff } from "utils/util";
import { articles, articleHotTopics } from "config/api";

Page({
  data: {
    articleList: [],
    hasNextPage: true,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight,
    scrollTop: 0,
    activeCategory: 'all',
    category: [
      { id: 'industry', name: '产业', type: 'category' },
      { id: 'practice', name: '工程', type: 'category' },
      { id: 'theory', name: '理论', type: 'category' },
      { id: 'basic', name: '入门', type: 'category' },
    ],
    isLogin: false,
    notifyCount: 0,
  },

  onLoad: function() {
    this.page = 1;
    this.activeType = 'category';

    this.getArticleList();
    this.getHotTopic();
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
      hasNextPage: true
    }, () => {
      this.page = 1;
      this.getArticleList();
    });
  },
  getHotTopic: function () {
    return request({
      url: articleHotTopics
    }).then(res => {
      const { category } = this.data;
      res.data.forEach(({key, value}) => {
        category.unshift({
          id: key,
          name: `${value}`,
          type: 'hotTopic'
        })
      })

      this.setData({
        category
      })
    })
  },

  getArticleList: function () {
    const { activeCategory } = this.data;
    const queryCategory = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
    const queryHotTopic = this.activeType === 'hotTopic' ? `&hot_topic=true` : '';
    return request({
      url: `${articles}?page=${this.page}${queryHotTopic}${queryCategory}`
    }).then(res => {
      this.page += 1;
      const { articleList } = this.data;
      const newList = res.data;
      newList.forEach(item => {
        item.published_at = getDateDiff(item.published_at);
      });

      this.setData({
        articleList: [...articleList, ...newList],
        hasNextPage: newList.length > 0
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
