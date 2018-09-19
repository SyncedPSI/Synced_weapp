Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleList: [],
    startX: 0,
    startY: 0,
    maxRightBtnWidth: 80,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  touchStart: function(event) {

    // 开始触摸时 重置所有的删除
    // 判断是否只有一个触摸点
    // 记录触摸的坐标
    const { articles } = this.data;
    articles.forEach((item) => {
      item.isOpenBtn = false;
    });
    const { clientX, clientY } = event.changedTouches[0];
    this.setData({
      articles,
      startX: clientX,
      startY: clientY,
    });
  },

  touchMove: function(event) {
    // const index = event.currentTarget.dataset.index,//当前索引
    // 得到start 的x y
    // 得到滑动变化的坐标
    // 滑动角度？？？ angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    // 判断 左滑还是右滑
    const index = event.currentTarget.dataset.index;
    const { clientX, clientY } = event.changedTouches[0];
    const { startX, startY, articles, maxRightBtnWidth } = this.data;
    if (clientX > startX) {
      articles[index].txtStyle = '';
      this.setData({
        articles,
      });
      return; //右滑
    }

    let distance = startX - clientX;
    if (maxRightBtnWidth < distance) {
      distance = maxRightBtnWidth;
    }
    articles[index].txtStyle = `right: ${distance}px`;
    this.setData({
      articles,
    });
  },

  touchEnd: function(event) {
    // 得到结束的触摸点位置
    // 滑动距离和删除按钮的长度相比 是显示 还是不显示
    const index = event.currentTarget.dataset.index;
    const { clientX, clientY } = event.changedTouches[0];
    const { startX, startY, articles, maxRightBtnWidth } = this.data;
    const distance = startX - clientX;
    articles[index].txtStyle = '';

    if (maxRightBtnWidth < distance) {
      articles[index].isOpenBtn = true;
    }

    this.setData({
      startX: 0,
      startY: 0,
      articles,
    });
  },

  deleteArticle: function(event) {
    const { index } = event.currentTarget.dataset;
    const { articles } = this.data;
    const newArticles = [
      ...articles.slice(0, index),
      ...articles.slice(index + 1)
    ];

    this.setData({
      articles: newArticles,
    });
  }
})
