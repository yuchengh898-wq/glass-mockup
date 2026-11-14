/**
 * theme/index.js  ——  主题的存取与应用
 *
 * 用法（每个页面 onLoad / onShow 里各调一次）：
 *     const theme = require('../../theme/index');
 *     theme.apply(this);                       // 用已保存的院校
 *     theme.apply(this, 'pku');                // 强制指定院校
 *
 * WXML 最外层：
 *     <view class="page" style="{{themeStyle}}">
 */

const { buildTheme } = require('./palette');
const { SCHOOLS, findSchool, getDefaultSchool } = require('./schools');

const STORAGE_KEY = 'theme_school_key';

/** 主题缓存：同一所学校不要重复算 */
const cache = {};

function getTheme(school) {
  if (!school) school = getCurrentSchool();
  if (!cache[school.key]) {
    cache[school.key] = buildTheme(school.brand);
  }
  return cache[school.key];
}

function getCurrentSchool() {
  let key = '';
  try {
    key = wx.getStorageSync(STORAGE_KEY) || '';
  } catch (e) {
    key = '';
  }
  return findSchool(key) || getDefaultSchool();
}

/**
 * 把主题写进页面的 data，WXML 通过 style="{{themeStyle}}" 生效
 * @param {Page} page    页面实例（this）
 * @param {string} [schoolKey] 不传则读本地保存的院校
 */
function apply(page, schoolKey) {
  const school = (schoolKey && findSchool(schoolKey)) || getCurrentSchool();
  const theme = getTheme(school);
  page.setData({
    school: school,
    themeStyle: theme.styleText,
    themeHue: theme.hue,
  });
  return theme;
}

/** 选择院校：存起来 + 立刻换肤 */
function setSchool(schoolKey) {
  const school = findSchool(schoolKey);
  if (!school) return null;
  try {
    wx.setStorageSync(STORAGE_KEY, school.key);
  } catch (e) {
    // 存储满了也别让页面挂掉
  }
  return school;
}

/**
 * 换校时如果想做个过渡，用这个拿中间色（可选，不接也行）
 * 单纯换肤不需要，setData 之后 CSS 变量会立即生效。
 */
function paletteOf(schoolKey) {
  const school = findSchool(schoolKey);
  if (!school) return null;
  return buildTheme(school.brand).cssVars;
}

module.exports = {
  SCHOOLS,
  apply,
  getTheme,
  getCurrentSchool,
  setSchool,
  paletteOf,
};
