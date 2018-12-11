import { province, city } from "utils/city";
// import { documents } from "config/api";

Page({
  data: {
    isIphoneX: getApp().globalData.isIphoneX,
    step: 2,
    allStatus: [
      {id: 1, title: '在职', image: '/images/auth_work.svg'},
      {id: 0, title: '在读', image: '/images/auth_school.svg'},
    ],
    status: 0,
    country: ['中国', '海外'],
    countryIndex: 0,
    city: [
      province,
      city['110000'],
    ],
    cityIndex: [0, 0],

  },
  onLoad: function (options) {
  },

  getStatus: function(event) {
    const { status } = event.currentTarget.dataset;
    this.setData({
      status: Number(status),
      step: 2,
    });
  },

  bindCountryChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    const index = Number(e.detail.value)
    this.setData({
      countryIndex: index
    })
  },

  bindCityChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      cityIndex: e.detail.value
    })
  },

  bindCityColumnChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    const data = {
      city: this.data.city,
      cityIndex: this.data.cityIndex
    }
    data.cityIndex[e.detail.column] = e.detail.value
    if (e.detail.column === 0) {
      const provinceIndex = data.cityIndex[0];
      const provinceId = data.city[0][provinceIndex].id;
      data.city[1] = city[provinceId];
      data.cityIndex[1] = 0;
    }
    // console.log(data.cityIndex)
    this.setData(data)
  },

  submitForm: function(event) {
    // 提交表单
    // 更新本地缓存和globalData,
    const { city, external, internal, company, post, work, school, profession, degree, yearOfGraduation, name, mobile, wechat, email } = event.detail.value;
  }
})
