import { creatWxcode } from "config/api";

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}

export const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
}

export const getDateTimeStamp = dateStr => {
  return Date.parse(dateStr.replace(/-/gi, "/"));
};

export const getDateDiff = dateStr => {
  var publishTime = getDateTimeStamp(dateStr) / 1000,
    d_seconds,
    d_minutes,
    d_hours,
    d_days,
    timeNow = parseInt(new Date().getTime() / 1000),
    d,
    date = new Date(publishTime * 1000),
    Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate(),
    H = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds();
  //小于10的在前面补0
  if (M < 10) {
    M = "0" + M;
  }
  if (D < 10) {
    D = "0" + D;
  }
  if (H < 10) {
    H = "0" + H;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (s < 10) {
    s = "0" + s;
  }

  d = timeNow - publishTime;
  d_days = parseInt(d / 86400);
  d_hours = parseInt(d / 3600);
  d_minutes = parseInt(d / 60);
  d_seconds = parseInt(d);

  if (d_days > 0 && d_days < 20) {
    return d_days + "天前";
  } else if (d_days <= 0 && d_hours > 0) {
    return d_hours + "小时前";
  } else if (d_hours <= 0 && d_minutes > 0) {
    return d_minutes + "分钟前";
  } else if (d_seconds < 60) {
    if (d_seconds <= 0) {
      return "刚刚";
    } else {
      return d_seconds + "秒前";
    }
  } else if (d_days >= 20 && d_days < 30) {
    return M + "月" + D + "日";
  } else if (d_days >= 30) {
    return Y + "年" + M + "月";
  }
};

const getHeader = () => {
  const header = {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Cookie': wx.getStorageSync('Cookie'),
  };

  try {
    const token = wx.getStorageSync('authToken');
    if (token) {
      header['Authorization'] = `bearer ${token}`;
    }
    return header;
  } catch (e) {
    return header;
  }
};

export const showErrorToast = (msg, duration = 2000) => {
  wx.showToast({
    title: msg,
    image: '/images/icon_error.png',
    duration,
  })
};

export const showTipToast = (msg, icon = 'success', duration = 2000) => {
  wx.showToast({
    title: msg,
    icon: icon,
    duration
  })
};

export const showLoading = (msg) => {
  wx.showLoading({
    title: msg,
  })
};

export const hideLoading = () => {
  wx.hideLoading();
};

export const checkValue = ({value, reg, isRequired = true, errMsg}) => {
  if ((value === null) || (isRequired && value.length === 0) || !reg.test(value)) {
    showErrorToast(errMsg);
    return false;
  } else {
    return true;
  }
};

export const request = ({ url, data = {}, method = "GET", isHandleNotFound = false }) => {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: {
        ...data,
      },
      method: method,
      header: getHeader(),
      success: (res) => {
        if (res.statusCode == 200) {
          resolve(res);
        } else if (isHandleNotFound && res.statusCode == 404) {
          wx.showModal({
            title: '提示',
            content: '资源找不到了，是否返回主页',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/index/index'
                });
              }
            }
          })
        } else if (res.statusCode == 400) {
          wx.showToast({
            title: res.data.errors || res.data,
            icon: 'none',
            duration: 2000
          })
        } else if (res.statusCode == 500) {
          showErrorToast('服务器错误');
          reject(res);
        } else {
          reject(res);
        }
      },
      fail: () => {
        showTipToast('服务器未响应', 'loading');
      }
    })
  });
};

export const getWxcodeUrl = (id, page, model, cb) => {
  request({
    url: creatWxcode,
    data: {
      id,
      page,
      model,
    },
    method: 'POST'
  }).then((res) => {
    cb(res.data.file_path);
  }).catch(() => {
    cb(null);
  })
};
