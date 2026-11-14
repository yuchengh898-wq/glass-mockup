// pages/index/index.js
const theme = require('../../theme/index');

Page({
  data: {
    school: {},
    themeStyle: '',

    streak: 12,
    totalCount: '1,284',
    remainTimes: 1,

    subjects: [
      { key: 'math', name: '数学', count: '1,284', emoji: '📐', icon: '' },
      { key: 'phys', name: '物理', count: '968',   emoji: '⚛️', icon: '' },
      { key: 'chem', name: '化学', count: '742',   emoji: '🧪', icon: '' },
      { key: 'bio',  name: '生物', count: '655',   emoji: '🧬', icon: '' },
      { key: 'eng',  name: '英语', count: '1,506', emoji: '🅰️', icon: '' },
      { key: 'hist', name: '历史', count: '831',   emoji: '📜', icon: '' },
      { key: 'poli', name: '政治', count: '612',   emoji: '⚖️', icon: '' },
      { key: 'geo',  name: '地理', count: '588',   emoji: '🌍', icon: '' },
    ],
  },

  /**
   * 用 onShow 而不是 onLoad：从「选择院校」页返回时 onShow 会再次触发，
   * 主题自动刷新，不需要用 eventChannel 传值回来。
   */
  onShow() {
    theme.apply(this);
  },

  onPickSchool() {
    wx.navigateTo({ url: '/pages/picker/picker' });
  },

  onDaily() {
    wx.navigateTo({ url: '/pages/quiz/quiz?mode=daily' });
  },

  onSubject(e) {
    const { key } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/quiz/quiz?subject=${key}` });
  },
});
