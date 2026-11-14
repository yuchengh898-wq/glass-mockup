/**
 * theme/schools.js  ——  院校配置表
 *
 * ⚠️ brand 请替换成你们实际的校徽主色（从校徽图上吸色，或查学校视觉识别手册）。
 *    下面这些是按各校校徽常见主色填的近似值，仅作占位。
 *
 * emblem 放校徽图：小程序本地图片或 CDN 都行，建议 200×200 PNG 透明底。
 */

const SCHOOLS = [
  { key: 'thu',  name: '清华大学',     motto: '自强不息 · 厚德载物',   mark: '清', brand: '#7C3AED', emblem: '/assets/emblems/thu.png' },
  { key: 'pku',  name: '北京大学',     motto: '思想自由 · 兼容并包',   mark: '北', brand: '#A31621', emblem: '/assets/emblems/pku.png' },
  { key: 'zju',  name: '浙江大学',     motto: '求是创新',             mark: '浙', brand: '#0B5A9E', emblem: '/assets/emblems/zju.png' },
  { key: 'fdu',  name: '复旦大学',     motto: '博学而笃志 · 切问而近思', mark: '复', brand: '#0E4C92', emblem: '/assets/emblems/fdu.png' },
  { key: 'sjtu', name: '上海交通大学', motto: '饮水思源 · 爱国荣校',   mark: '交', brand: '#B31942', emblem: '/assets/emblems/sjtu.png' },
  { key: 'nju',  name: '南京大学',     motto: '诚朴雄伟 · 励学敦行',   mark: '南', brand: '#6F2C91', emblem: '/assets/emblems/nju.png' },
  { key: 'ustc', name: '中国科学技术大学', motto: '红专并进 · 理实交融', mark: '科', brand: '#0A5CA8', emblem: '/assets/emblems/ustc.png' },
  { key: 'whu',  name: '武汉大学',     motto: '自强 · 弘毅 · 求是 · 拓新', mark: '武', brand: '#14684B', emblem: '/assets/emblems/whu.png' },
];

const DEFAULT_SCHOOL_KEY = 'thu';

function findSchool(key) {
  for (let i = 0; i < SCHOOLS.length; i++) {
    if (SCHOOLS[i].key === key) return SCHOOLS[i];
  }
  return null;
}

function getDefaultSchool() {
  return findSchool(DEFAULT_SCHOOL_KEY) || SCHOOLS[0];
}

module.exports = { SCHOOLS, DEFAULT_SCHOOL_KEY, findSchool, getDefaultSchool };
