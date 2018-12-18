Component({
  properties: {
    isShowModal: {
      type: Boolean,
      value: false
    },
  },

  data: {

  },

  attached: function() {

  },

  methods: {
    closeModal: function () {
      this.triggerEvent('closemodal');
    },
  },
});
