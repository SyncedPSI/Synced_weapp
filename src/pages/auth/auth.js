import { province, city } from "utils/city";
import { certifications } from 'config/api';
import { showErrorToast, request } from "utils/util";

const getGraduationYear = () => {
  const currentYear = Number(new Date().getFullYear()) + 5;
  const arr = [];

  for (let i = 0; i < 50; i++) {
    arr.push(`${currentYear - i}年`);
  }

  arr.push(`${currentYear - 49}年之前`);

  return arr;
}


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
    workExperience: ['一年内', '1-3年', '3-5年', '5年以上'],
    workExperienceIndex: 0,
    graduationYear: getGraduationYear(),
    graduationYearIndex: 5,
    formData: null,
    isShowModal: false,
    isShowInComment: true
  },
  onLoad: function (options) {
  },

  switchChange: function(event) {
    const newStatus = event.detail.value;
    request({
      url: certifications,
      method: 'POST',
      data: {
        reveal: newStatus
      }
    }).then(() => {
      this.setData({
        isShowInComment: event.detail.value
      });
    })
  },

  closeModal: function() {
    this.setData({
      isShowModal: false,
    })
  },

  openModal: function() {
    this.setData({
      isShowModal: true,
    })
  },

  getStatus: function(event) {
    const { status } = event.currentTarget.dataset;
    this.setData({
      status: Number(status),
      step: 2,
    });
  },
  goStep3: function (event) {
    const { city, external, internal, company, position, school, major, degree, graduation_year, work_experience  } = event.detail.value;
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

      if (position === '') {
        showErrorToast('请输入职位', 1000);
        return;
      }
    }

    if (school === '') {
      showErrorToast('请输入院校', 1000);
      return;
    }

    if (major === '') {
      showErrorToast('请输入专业', 1000);
      return;
    }

    if (degree === '') {
      showErrorToast('请输入学位', 1000);
      return;
    }

    const { workExperience, graduationYear } = this.data;
    this.setData({
      step: 3,
      formData: {
        ...event.detail.value,
        city: address,
        graduation_year: graduationYear[graduation_year],
        work_experience: workExperience[work_experience],
      }
    });
  },

  bindCountryChange: function (event) {
    const index = Number(event.detail.value);
    this.setData({
      countryIndex: index
    })
  },

  bindWorkChange: function (event) {
    const index = Number(event.detail.value);
    this.setData({
      workExperienceIndex: index
    })
  },

  bindGraduationChange: function(event) {
    const index = Number(event.detail.value);
    this.setData({
      graduationYearIndex: index
    })
  },

  bindCityChange: function(event) {
    const index = Number(event.detail.value);
    this.setData({
      cityIndex: index
    })
  },

  bindCityColumnChange(e) {
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
    this.setData(data)
  },

  submitForm: function(event) {
    const { full_name, mobile, wechat, email } = event.detail.value;
    if (full_name === '') {
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

    const { formData, status } = this.data;
    request({
      url: certifications,
      method: 'POST',
      data: {
        ...formData,
        ...event.detail.value,
        category: status === 0 ? 'studying' : 'working'
      }
    }).then(() => {
      this.openModal();
    })
  }
})
