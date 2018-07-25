import { request, getDateDiff } from "utils/util";
import { searchByKeyword } from "config/api";

const app = getApp();

Page({
  data: {
    searchIconUrl: "../../icons/ic_search.svg"
  },

  fetchData: function(keywords) {
    request(`${searchByKeyword}${keywords}`)
      .then(res => {
        // console.log(res);
        this.clearTimer();
      })
      .catch(() => {
        this.clearTimer();
      })
  },
  search: function(event) {
    this.clearTimer();
    this.fetchData(event.detail.value);

  },
  searchByKeyword: function(event) {
    const { value } = event.detail;

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.fetchData(value);
    }, 2000);
  },
  clearTimer: function() {
    clearTimeout(this.timer);
  }
});
