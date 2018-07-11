//import { flow } from 'lodash';

// const delay = (t = 0) => new Promise((resolve) => setTimeout(resolve, t));

// // 获取应用实例
// const app = getApp(); //  eslint-disable-line no-undef

// Page({
// 	data: {
// 		motto: 'Hello World',
// 		userInfo: {},
// 	},
// 	// 事件处理函数
// 	bindViewTap() {
// 		wx.navigateTo({
// 			url: '../logs/logs',
// 		});
// 	},
// 	async onLoad() {
// 		await delay();

// 		const log = flow(() => {
// 			console.log('is wechat mini program: ', __WECHAT__);
// 			console.log('is alipay mini program: ', __ALIPAY__);
// 			console.log('DEV: ', __DEV__);
// 		});

// 		log();

// 		// 调用应用实例的方法获取全局数据
// 		app.getUserInfo((userInfo) => {
// 			// 更新数据
// 			this.setData({ userInfo });
// 		});
// 	},
// });

import { getDateDiff } from '../../utils/util';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 24,
    scrollTop: 0,
    logoUrl: '../../images/logo.svg',
    hoverImageUrl: '../../icons/ic_chatbot_n.svg',
    searchIconUrl: '../../icons/ic_search.svg',
    articles: []
  },

  bindToSearch: function (e) {
    wx.navigateTo({
      url: '../search/search'
    });
  },

  bindToArticleShow: function (e) {
    wx.navigateTo({
      url: `../article/article?id=${e.target.id}`
    });
  },

  scroll: function (e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    });
  },

  loadMore: function (e) {
    const $this = this;
    console.log('Load More');
    const page = this.data.page;
    console.log(`page: ${page}`);
    this.setData({
      page: page + 1
    });
    wx.request({
      url: `https://www.jiqizhixin.com/api/v1/timelines?page=${page}`,
      header: { 'Contetn-Type': 'application/json' },
      method: 'GET',
      success: function (res) {
        const articles = $this.data.articles;
        const newArticles = res.data;
        newArticles.forEach((item) => {
          item.published_at = getDateDiff(item.published_at);
        });
        const newArticleList = articles.concat(newArticles);
        $this.setData({
          articles: newArticleList
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const $this = this;
    wx.request({
      url: `https://www.jiqizhixin.com/api/v1/timelines?page=${this.data.page}`,
      header: { 'Contetn-Type': 'application/json' },
      method: 'GET',
      success: function (res) {
        const articles = res.data;
        articles.forEach((item) => {
          item.published_at = getDateDiff(item.published_at);
        });
        $this.setData({
          articles: articles
        });
      }
    });
    const published_at = 'article[published_at]'

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    setTimeout(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 1500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('Already on bottom');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
