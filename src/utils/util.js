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
    return M + "-" + D + " " + H + ":" + m;
  } else if (d_days >= 30) {
    return Y + "-" + M + "-" + D + " " + H + ":" + m;
  }
};

export const request = (url, data = {}, method = "GET") => {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: {
        ...data,
      },
      method: method,
      header: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
};

export const showErrorToast = (msg) => {
  wx.showToast({
    title: msg,
    image: '/images/icon_error.png',
  })
};

export const checkValue = ({value, reg, isRequired = true, errMsg}) => {
  if ((value === null) || (isRequired && value.length === 0) || !reg.test(value)) {
    showErrorToast(errMsg);
    return false;
  } else {
    return true;
  }
};
