import { request } from "utils/util";
import { ApiRootUrl } from 'config/api';

const defaultRecommend = ['机器之心', '应用案例', '猜你喜欢', '人工智能', '推荐文章'];

Component({
  data: {
    message: '',
    oldChat: [],
    chat: [],
    avatar: '',
    scrollTop: 0,
    keyboardHeight: null,
    recommend: defaultRecommend,
    enableSendMessage: false,
    isIphoneX: getApp().globalData.isIphoneX,
    statusBarHeight: getApp().globalData.systemInfo.statusBarHeight
  },
  ready: function() {
    const oldChat = wx.getStorageSync('chat');
    const avatar = wx.getStorageSync('userInfo').avatarUrl;
    this.setData({
      oldChat,
      avatar,
      chat: [{
        fromRobot: true,
        message: oldChat.length === 0 ? '欢迎你加入机器之心人工智能信息服务平台' : '欢迎回来',
        askBack: {
          items: [],
          path: '',
        },
        node: null,
      }]
    });

    this.timeout = false;
    this.enableChangeFilling = true;
    wx.createSelectorQuery().in(this).select('#js-scroll-view').boundingClientRect((rect) => {
      if (rect) {
        this.scrollViewHeight = rect.height;
        this.pageScrollToBottom();
      }
    }).exec()
  },
  detached: function() {
    clearTimeout(this.timeout);

    const { oldChat, chat} = this.data;
    if(oldChat.length === 0 && chat.length === 1) return;

    wx.setStorage({
      key: 'chat',
      data: [...oldChat, ...chat]
    });
  },
  methods: {
    fetchData: function (keyword) {
      request({
        url: 'https://www.jiqizhixin.com/api/v1/chatbot/dialog',
        data: {
          keyword,
        },
        method: 'POST'
      }).then(res => {
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
          const { Description, user_defined } = Items[0];
          chat.push({
            fromRobot: true,
            message: Description,
            askBack: {
              items: [],
              path,
            },
            node: null,
          });
          this.getNode(user_defined);
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
    getNode: function (msg) {
      const [_, id, nodeType] = msg.match(new RegExp('"id":"([^/?#]+)","type":"([^/?#]+)"}', 'i'));
      request({
        url: `${ApiRootUrl}/chatbot/cards/64d4c374-6061-46cc-8d29-d0a582934876`
      }).then(res => {
        const { chat } = this.data;
        const node = res.data.card_node;
        node.nodeType = nodeType;
        chat.push({
          fromRobot: true,
          message: null,
          askBack: {
            items: [],
            path: null,
          },
          node
        });

        this.setData({
          chat
        }, () => {
          this.pageScrollToBottom();
        });
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
