/**
 * theme/palette.js  ——  校徽色 → 整套玻璃主题 配色引擎
 *
 * 设计原则（这几条比代码本身重要）：
 *   1. 以校徽主色的色相 h 为锚点，**所有派生色相只在 h ± 30° 内移动**
 *   2. 层次感全部交给「明度 + 透明度」，不要交给色相
 *   3. 黄绿色带 (55°~105°) 在深色背景上必然发浑，一律钳制出去
 *
 * 这样无论用户选哪所学校的校徽色，出来的都是同一个"品质"，不会翻车。
 */

/* ---------------- 颜色工具 ---------------- */

function hexToRgb(hex) {
  let s = String(hex).replace('#', '').trim();
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h, s * 100, l * 100];
}

/** h:0-360, s/l:0-100, a:0-1  →  'rgba(r,g,b,a)' */
function hsl(h, s, l, a) {
  a = a === undefined ? 1 : a;
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return 'rgba(' + Math.round((r + m) * 255) + ','
    + Math.round((g + m) * 255) + ','
    + Math.round((b + m) * 255) + ',' + a + ')';
}

/** 黄绿色带在深底上必然发脏，钳制到最近的安全边界 */
function dirtyClamp(h) {
  h = ((h % 360) + 360) % 360;
  if (h > 55 && h < 105) {
    return Math.abs(h - 55) <= Math.abs(h - 105) ? 55 : 105;
  }
  return h;
}

/**
 * 输入规范化：兜住极端校徽色
 * 近灰/近黑白的校徽，色相是噪声，算出来一片灰 → 回退中性默认色相
 * 饱和度过低 → 强行拉起来，否则整套没有品牌感；过高 → 压一点避免刺眼
 */
function normalizeBrand(s) {
  if (s < 12) return { s: 70, fallback: true };
  return { s: Math.min(100, Math.max(38, s)), fallback: false };
}

/* ---------------- 极光光斑配置 ----------------
   位置/大小/透明度固定，只有色相跟着校徽走。
   色相偏移限制在 ±30°，再远就会失忆成"脏色"。 */
const AURORA_SPEC = [
  { dh: 0,   s: 88, l: 68, a: 0.50, x: '8%',   y: '-2%', rx: 58, ry: 38 },
  { dh: 18,  s: 84, l: 50, a: 0.48, x: '98%',  y: '8%',  rx: 54, ry: 34 },
  { dh: -18, s: 86, l: 62, a: 0.42, x: '0%',   y: '42%', rx: 48, ry: 30 },
  { dh: 30,  s: 80, l: 46, a: 0.40, x: '102%', y: '56%', rx: 54, ry: 34 },
  { dh: -24, s: 88, l: 58, a: 0.46, x: '10%',  y: '98%', rx: 62, ry: 38 },
  { dh: 8,   s: 84, l: 72, a: 0.30, x: '98%',  y: '94%', rx: 56, ry: 34 },
];

/* 8 个学科的图标底色：以校徽色为基准的类似色，±42°
   别再拉宽了 —— 红色学校的 +55° 会直接跑到黄色，chip 会脏 */ 
const CHIP_OFFSETS = [-42, -30, -18, -6, 6, 18, 30, 42];

/**
 * 生成一个主题的全部 CSS 变量
 * @param {string} brandHex 校徽主色，如 '#7C3AED'
 * @returns {Object} { brand, cssVars, styleText }
 */
function buildTheme(brandHex) {
  const rgb = hexToRgb(brandHex);
  const hslBrand = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const norm = normalizeBrand(hslBrand[1]);

  /* 灰黑校徽没有有效色相，回退到 262（紫罗兰），保证不出灰板 */
  const h = norm.fallback ? 262 : hslBrand[0];
  const s = norm.s;

  /* 极光：6 团径向渐变拼成一张背景图 */
  const aurora = AURORA_SPEC.map(function (b) {
    const hh = dirtyClamp(h + b.dh);
    return 'radial-gradient(' + b.rx + '% ' + b.ry + '% at ' + b.x + ' ' + b.y + ', '
      + hsl(hh, b.s, b.l, b.a) + ' 0%, '
      + hsl(hh, b.s, b.l, 0) + ' 68%)';
  }).join(',');

  const vars = {
    /* 品牌色阶 */
    '--brand':      hsl(h, Math.max(s, 45), 56),
    '--brand-lt':   hsl(h, 88, 74),
    '--brand-soft': hsl(h, 92, 88),
    '--brand-deep': hsl(h, 62, 28),

    /* 底色 */
    '--bg-page': hsl(h, 40, 4),
    '--bg-wash': 'radial-gradient(120% 62% at 46% -6%, '
      + hsl(h, 52, 26) + ' 0%, ' + hsl(h, 44, 13) + ' 34%, '
      + hsl(h, 38, 7) + ' 62%, ' + hsl(h, 34, 4) + ' 100%)',

    /* 极光 */
    '--aurora': aurora,

    /* 光效 */
    '--glow': 'radial-gradient(60% 60% at 50% 50%, '
      + hsl(h, 86, 62, 0.78) + ' 0%, ' + hsl(h + 20, 84, 62, 0.22) + ' 55%, '
      + hsl(h + 20, 84, 62, 0) + ' 78%)',
    '--logo-glow': hsl(h, 84, 58, 0.55),
    '--cta-glow':  hsl(h, 80, 72, 0.62),
    '--cta-fg':    hsl(h, 68, 16),
    '--ring':      hsl(h, 80, 70, 0.55),

    /* 主卡底色 */
    '--hero-bg': 'linear-gradient(140deg, '
      + hsl(h, 84, 58, 0.20) + ' 0%, rgba(255,255,255,0.06) 46%, '
      + hsl(h + 18, 82, 60, 0.10) + ' 100%)',

    /* 标签 */
    '--tag-bg':   hsl(h, 80, 72, 0.16),
    '--tag-line': hsl(h, 80, 72, 0.30),

    /* 列表选中态 */
    '--row-sel': hsl(h, 80, 60, 0.16),
  };

  /* 学科图标底色 */
  CHIP_OFFSETS.forEach(function (off, i) {
    vars['--chip-' + (i + 1)] = hsl(dirtyClamp(h + off), 64, 58, 0.34);
  });

  /* 拼成可以直接塞进 style 的字符串 */
  const styleText = Object.keys(vars)
    .map(function (k) { return k + ':' + vars[k]; })
    .join(';');

  return {
    brand: brandHex,
    hue: Math.round(h),
    fallback: norm.fallback,
    cssVars: vars,
    styleText: styleText,
  };
}

module.exports = {
  buildTheme: buildTheme,
  hexToRgb: hexToRgb,
  rgbToHsl: rgbToHsl,
  hsl: hsl,
  dirtyClamp: dirtyClamp,
  normalizeBrand: normalizeBrand,
};
