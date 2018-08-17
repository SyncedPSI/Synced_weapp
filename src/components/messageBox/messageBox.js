import { request } from "utils/util";
const defaultRecommend = ['机器之心', '应用案例', '猜你喜欢', '人工智能', '推荐文章'];

Component({
  data: {
    message: '',
    chat: [{
      fromRobot: true,
      message: '欢迎你加入机器之心人工智能信息服务平台',
      askBack: {
        items: [],
        path: '',
      },
      node: null,
    }],
    avatar: wx.getStorageSync('userInfo').avatarUrl,
    scrollTop: 0,
    keyboardHeight: null,
    recommend: defaultRecommend,
    enableSendMessage: false,
    isIphoneX: getApp().globalData.isIphoneX,
  },
  ready: function() {
    this.timeout = false;
    this.enableChangeFilling = true;
    wx.createSelectorQuery().in(this).select('#js-scroll-view').boundingClientRect((rect) => {
      this.scrollViewHeight = rect.height;
    }).exec()
  },
  detached: function() {
    clearTimeout(this.timeout);
  },
  methods: {
    fetchData: function (keyword) {
      request('https://www.jiqizhixin.com/api/v1/chatbot/dialog', {
        keyword,
      }, 'POST').then(res => {
        console.log(res.data);
        const { reply, askBack, recommend } = res.data.result.dialog;
        const { chat } = this.data;
        if (reply === undefined) return;

        const { CardType, Title, Items, path } = reply;

        if (CardType === 1) {
          chat.push({
            fromRobot: true,
            message: Title,
            askBack: {
              items: [],
              path,
            },
            node: null,
          });
        } else if (CardType === 2) {
          // 得到node
          chat.push({
            fromRobot: true,
            message: Items[0].user_defined,
            askBack: {
              items: [],
              path,
            },
            node: null,
          });
        }

        // if (askBack && askBack.items.length > 0) {
        // }

        let realRecommend = defaultRecommend;
        if (recommend.items.length > 0) {
          realRecommend = recommend.items.map(item => item.question);
        }

        this.timeout = setTimeout(() => {
          this.setData({
            chat,
            recommend: realRecommend,
          }, () => {
            this.pageScrollToBottom();
          });
        }, 1500);
      })
    },
    sendKeywords: function(keywords, isResetInput = false) {
      const { chat } = this.data;
      chat.push({
        fromRobot: false,
        message: keywords,
      });

      const newObject = {
        chat
      };
      if (isResetInput) {
        newObject.message = '';
        newObject.enableSendMessage = false;
      }

      this.setData(newObject, () => {
        this.pageScrollToBottom();
        this.fetchData(keywords);
      });
    },
    sendMessage: function () {
      if (!this.data.enableSendMessage) return;
      this.sendKeywords(this.data.message, true);
    },
    handleInput: function (event) {
      const newMessage = event.detail.value;
      this.setData({
        message: newMessage,
        enableSendMessage: this.checkIfEnableSendMessage(newMessage)
      });
    },
    checkIfEnableSendMessage: function (newMessage) {
      return !!(newMessage.length > 0);
    },
    sendRecommendWord: function (event) {
      const keyword = event.target.dataset.value;
      this.sendKeywords(keyword);
    },
    pageScrollToBottom: function() {
      this.getContentHeight((rect) => {
        const { height } = rect;
        this.setData({
          scrollTop: height - this.scrollViewHeight
        });
      });
    },
    inputFocus: function (event) {
      const { height } = event.detail;
      const newHeight = this.data.isIphoneX ? height - 34 : height;
      this.setData({
        keyboardHeight: newHeight
      })
      this.pageScrollToBottom();
    },
    inputBlur: function() {
      this.setData({
        keyboardHeight: null
      });
    },
    getContentHeight: function(cb) {
      wx.createSelectorQuery().in(this).select('#js-content').boundingClientRect(cb).exec()
    }
  },
});


// example:
// {
//    id: 4,
//    fromRobot: true,
//    messageType: 2,
//    message: {
//      logo_url: '',
//      title: '思必驰',
//      type: '机构',
//      path: '',
//      desc: '思必驰对话工场提供语音识别，语音合成，语义理解，智能对话，声纹识别服务，开放平台。',
//    },
//  }, {
//    id: 5,
//    fromRobot: true,
//    messageType: 3,
//    message: {
//      morePath: '',
//      data: [{
//        id: 11,
//        title: '计算语言顶会ACL 2018最佳论文公布！这些大学与研究员榜上有名',
//        desc: '今日，ACL 2018 公布了 5 篇最佳论文，包括三篇最佳长论文和 2 篇',
//        path: '',
//      }]
//    },
//  }
