// pages/picker/picker.js
const theme = require('../../theme/index');
const { SCHOOLS } = require('../../theme/schools');
const { hexToRgb, rgbToHsl, hsl } = require('../../theme/palette');

Page({
  data: {
    school: {},
    themeStyle: '',
    keyword: '',
    total: SCHOOLS.length,
    list: [],
  },

  onLoad() {
    theme.apply(this);
    this.setData({ list: this.decorate(SCHOOLS) });
  },

  /** 给每所学校算出它自己校徽底色的样式（不跟随当前主题） */
  decorate(source) {
    return source.map(function (s) {
      const rgb = hexToRgb(s.brand);
      const h = rgbToHsl(rgb[0], rgb[1], rgb[2])[0];
      return Object.assign({}, s, {
        emblemStyle: 'background: radial-gradient(circle at 32% 26%, '
          + hsl(h, 92, 88) + ' 0%, ' + hsl(h, Math.max(45, 60), 56) + ' 46%, '
          + hsl(h, 62, 28) + ' 100%);'
          + 'box-shadow: inset 0 0 0 1rpx rgba(255,255,255,.22), 0 0 24rpx 2rpx ' + hsl(h, 84, 58, 0.4) + ';',
      });
    });
  },

  onSearch(e) {
    const kw = (e.detail.value || '').trim();
    const hit = kw
      ? SCHOOLS.filter(function (s) {
          return s.name.indexOf(kw) > -1 || s.motto.indexOf(kw) > -1;
        })
      : SCHOOLS;
    this.setData({ keyword: kw, list: this.decorate(hit) });
  },

  onChoose(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.school.key) {
      wx.navigateBack();
      return;
    }

    theme.setSchool(key);

    // 立刻换肤：让用户当场看到整个页面的颜色变了，再退回上一页
    theme.apply(this, key);

    wx.showToast({ title: '主题已切换', icon: 'none', duration: 900 });
    setTimeout(function () {
      wx.navigateBack();
    }, 420);
  },
});
