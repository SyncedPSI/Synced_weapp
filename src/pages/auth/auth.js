import { province, city } from "utils/city";
import { showErrorToast, request } from "utils/util";

Page({
  data: {
    isIphoneX: getApp().globalData.isIphoneX,
    step: 1,
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
    formData: null,

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
  goStep3: function (event) {
    console.log(event.detail.value)
    const { city, external, internal, company, post, work, school, profession, degree, yearOfGraduation } = event.detail.value;
    let address = '';
    if (city === 0) {
      address = this.data.city[1][external[1]].id
    } else {
      address = `海外${internal}`;
    }

    if (this.data.status === 1) { // 在职
      if (company === '') {
        showErrorToast('请输入公司', 1000);
        return;
      }

      if (post === '') {
        showErrorToast('请输入职位', 1000);
        return;
      }

      if (work === '') {
        showErrorToast('请输入工作年限', 1000);
        return;
      }
    }

    if (school === '') {
      showErrorToast('请输入院校', 1000);
      return;
    }

    if (profession === '') {
      showErrorToast('请输入专业', 1000);
      return;
    }

    if (degree === '') {
      showErrorToast('请输入学位', 1000);
      return;
    }

    if (yearOfGraduation === '') {
      showErrorToast('请输入毕业年份', 1000);
      return;
    }

    this.setData({
      step: 3,
      formData: {
        ...event.detail.value,
        address
      }
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
    const { name, mobile, wechat, email } = event.detail.value;
    if (name === '') {
      showErrorToast('请输入姓名', 1000);
      return;
    }

    if (mobile === '') {
      showErrorToast('请输入手机号', 1000);
      return;
    }

    if (!(/^1[34578]\d{9}$/.test(mobile))) {
      showErrorToast('手机号格式不正确', 1000);
      return;
    }

    if (wechat === '') {
      showErrorToast('请输入微信ID', 1000);
      return;
    }

    if (email === '') {
      showErrorToast('请输入邮箱', 1000);
      return;
    }

    if (!(/^[^@]+@([^@\.]+\.)+[^@\.]+$/.test(email))) {
      showErrorToast('邮箱格式不正确', 1000);
      return;
    }

    // 提交表单
    // 更新本地缓存和globalData,
  }
})