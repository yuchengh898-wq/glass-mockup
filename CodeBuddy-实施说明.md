# 微信小程序首页「极光玻璃 + 校徽色主题」实施说明

> 本文档自包含，看完就能动手，不需要额外图片或设计稿。

---

## 0. 你（AI）的执行方式

1. **先只读不改**：读取本项目 `pages/` 下现有页面、`app.wxss`、`app.json`，
   输出一份「改动清单」（改哪些文件、每个文件改什么），等我确认后再动手。
2. **按阶段实施**：本文档分三阶段，每阶段做完**停下来**，告诉我改了什么、让我预览。
   不要一口气改完所有文件。
3. **保留现有业务逻辑**：只改视觉层和新增主题模块。不要改接口调用、页面跳转路径、
   已有的数据字段名。页面里已有的真实字段（题数、连签天数等）继续用。
4. 如果我的项目结构和本文档假设不一致（比如首页不叫 `pages/index/index`），
   按我的实际结构适配，并在清单里说明。

---

## 1. 核心原则（比后面所有细节都重要）

> **配色是「算」出来的，不是「写」出来的。**

具体含义：

- `schools.js` 里每所学校**只存一个 hex 色值**（外加名字、校训、校徽图路径）。
- `palette.js` 里有一个**通用函数** `buildTheme(任意hex) → 整套 24 个 CSS 变量`。
- **CSS 文件里不允许出现任何一所学校的名字、也不允许出现任何硬编码的品牌色值。**
  （`#7C3AED` 这种字符串只允许在 `schools.js` 的数据里出现，或作为 `page{}` 兜底）

新增一所学校 = 在数组里加一行：

```js
{ key:'xxx', name:'某某大学', motto:'某某校训', mark:'某', brand:'#1A7A5E', emblem:'/assets/emblems/xxx.png' }
```

**不需要动一行 CSS，不需要重新配色，不需要我提供新色值。**

如果用户的校徽色是 `#1A7A5E`（深绿）、`#B8860B`（暗金）、`#333333`（近黑）……
你的函数都必须能自己算出一套好看的、同品质的主题。这一点后面第 7 节有完整算法。

---

## 2. 四条不可违反的视觉规则

违反任意一条，整体就会变成廉价感：

1. **背景必须是深色 + 6 团彩色光晕**。玻璃靠「透出背后的色彩」才有质感；
   纯色背景上做毛玻璃，只会得到一层脏灰。
2. **`saturate()` 不能省**。必须是 `blur(26px) saturate(185%)`。
   只写 `blur` 是灰玻璃，加了饱和才是苹果那种玻璃。
3. **文字不用纯白**。全部用 `rgba(255,255,255,0.96 / 0.72 / 0.45 / 0.30)` 四档。
4. **卡片必须有顶部内高光 + 1rpx 描边**，模拟光线从上方打在玻璃边缘。

---

## 3. 设计令牌（精确值）

写在 `app.wxss` 的 `page { }` 里作为**兜底默认值**（真实值由主题引擎运行时覆盖）。

```
--brand:       #7C3AED   主品牌色（校徽色）
--brand-lt:    #C4B5FD   亮版
--brand-soft:  #E9D5FF   最亮，用于标题渐变 / 标签文字
--brand-deep:  #4C1D95   最暗，用于校徽圆形渐变收尾

--bg-page:     #07020F   页面最底色
--ink:         rgba(255,255,255,0.96)
--ink-2:       rgba(255,255,255,0.72)
--ink-3:       rgba(255,255,255,0.45)
--ink-4:       rgba(255,255,255,0.30)

--r-sm:        20rpx
--r-md:        36rpx
--r-lg:        52rpx     ← 圆角只有这三档，不许出现别的值
```

玻璃统一参数：

```
--glass-fill: linear-gradient(145deg,
                rgba(255,255,255,0.15) 0%,
                rgba(255,255,255,0.065) 52%,
                rgba(255,255,255,0.035) 100%)
--glass-line: rgba(255,255,255,0.16)
--glass-blur: blur(26px) saturate(185%)
--shadow-lg:  0 36rpx 76rpx -36rpx rgba(4,2,12,0.9)
```

---

## 4. 页面结构与精确尺寸

单位全部用 **rpx**（750rpx = 屏宽）。从上到下：

| 元素 | 尺寸 / 间距 |
|---|---|
| 页面根容器 | 左右留白 32rpx，底部 `calc(48rpx + env(safe-area-inset-bottom))` |
| **学校身份卡** | 高 124rpx，左右 margin 32rpx，圆角 36rpx，内边距 0 28rpx |
| └ 校徽圆 | 76rpx 直径，右间距 22rpx，内嵌 56rpx 校徽图 |
| └ 校名 | 30rpx / 字重 600 / 字距 2.4rpx |
| └ 校训 | 21rpx / 颜色 `--ink-3` / 字距 3.2rpx |
| └ 连签胶囊（右侧） | 高约 52rpx，圆角 22rpx，内边距 12rpx 20rpx，金色系 |
| **主卡「每日一题」** | 上间距 28rpx，高 324rpx，圆角 52rpx，内边距 34rpx 36rpx |
| └ 标签「今日挑战」 | 20rpx / 600 / 字距 2rpx，内边距 8rpx 18rpx，圆角 16rpx |
| └ 标题 | 52rpx / 700 / 字距 4rpx，**渐变文字**（上白 → 下 `--brand-soft`） |
| └ 副标题 | 23rpx / `--ink-3` / 字距 2.2rpx |
| └ 主按钮 | 高 76rpx，圆角 38rpx，左右内边距 40rpx，27rpx / 600 |
| **区块标题「全部学科」** | 上间距 38rpx，27rpx / 600 / 字距 2.8rpx，左右 36rpx |
| **学科网格** | 两列，列间距 20rpx，行间距 20rpx，左右留白 32rpx |
| └ 单卡 | **宽 333rpx × 高 172rpx**，圆角 36rpx，内边距 22rpx 24rpx |
| └ 图标底色块 | 56rpx 见方，圆角 18rpx |
| └ 学科名 | 26rpx / 600 / 字距 3.2rpx |
| └ 题目数 | 19rpx / `--ink-3` |

> 333rpx 的算法：`(750 - 32×2 - 20) / 2`。改动左右留白要同步重算，否则两列会换行错位。

---

## 5. 玻璃卡片：唯一实现

在 `app.wxss` 里定义**一个** `.glass` 类，全站复用，不要每页各写一套。

```css
.glass {
  position: relative;
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--glass-fill);
  border: 1rpx solid var(--glass-line);
  -webkit-backdrop-filter: var(--glass-blur);   /* iOS 必须有这个前缀 */
  backdrop-filter: var(--glass-blur);
  box-shadow:
    inset 0 1rpx 0 rgba(255,255,255,0.20),      /* 顶部内高光 */
    inset 0 -1rpx 0 rgba(255,255,255,0.05),
    var(--shadow-lg);
  transition: transform 0.18s cubic-bezier(0.2,0.8,0.2,1);
}

/* 不支持 backdrop-filter 的旧机型兜底：把底色调实，别糊成灰 */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: rgba(20,12,38,0.88); }
}

/* 按压反馈：只动 transform */
.is-tap { transform: scale(0.972); }
```

### 主卡额外加「渐变细描边」（其他卡片不要加）

```css
.glass--ring::before {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  border-radius: inherit;
  padding: 1rpx;
  pointer-events: none;
  background: linear-gradient(150deg,
    rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 32%,
    rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.06) 78%,
    rgba(255,255,255,0.38) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}
```

> 如果 `mask-composite` 在真机上不生效，**直接删掉 `.glass--ring`**，
> 改用 `border: 1rpx solid rgba(255,255,255,0.16)`，不要花时间调它。

---

## 6. 极光背景层

页面里加一个独立背景 `<view class="aurora-bg"></view>`，`position: fixed` 铺满，
`z-index: 0`，内容层 `z-index: 1`。

**用 6 团 `radial-gradient` 拼成一张 `background-image`，
绝对不要用 `filter: blur()` 画光晕**（filter 在低端安卓掉帧严重，渐变边缘本来就是软的）。

```css
.aurora-bg {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0;
  z-index: 0;
  background-color: var(--bg-page);
  background-image: var(--bg-wash), var(--aurora);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/* 颗粒噪点：成本几乎为零，但能把「廉价渐变感」洗掉 */
.aurora-bg::after {
  content: '';
  position: absolute; top: 0; right: 0; bottom: 0; left: 0;
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 280rpx 280rpx;
}
```

---

## 7. 主题引擎：任意校徽色 → 整套主题（本项目核心）

### 7.0 先明确一件事

**不要为清华写一套 CSS、为北大写一套 CSS。** 那是错的，而且不可扩展。

只写一个文件 `theme/palette.js`，导出 `buildTheme(brandHex)`，
输入任意一个 hex 字符串，输出 24 个 CSS 变量。所有学校的差异**只存在于数据**。

我后面会随便给你一个色值考你，你的引擎必须能直接算出来，不许问我要。

### 7.1 文件职责

| 文件 | 职责 |
|---|---|
| `theme/palette.js` | 纯计算。hex → HSL → 24 个变量字符串。无任何业务、无任何 UI |
| `theme/schools.js` | 纯数据。院校数组 `[{ key, name, motto, mark, brand, emblem }]` |
| `theme/index.js` | 存取与注入。`apply(page)` 把变量塞进页面 data，`setSchool(key)` 存本地 |

### 7.2 配色算法

```
输入：brandHex（任意 '#RRGGBB'）
步骤：
  1. hex → rgb → hsl，得到 (h, s, l)
  2. 过一道 normalizeBrand()，兜住极端色（见 7.5）
  3. 以 h 为锚点，按下面三张常数表派生全部变量
输出：{ cssVars: {...24 个}, styleText: '--a:...;--b:...', hue }
```

**三条派生规则：**

```
规则一：6 团极光的色相只能在 h ± 30° 内移动
规则二：层次感全部由「明度 + 透明度」提供，不要靠色相拉开
规则三：所有派生色相必须过 dirtyClamp()，
        因为 55°~105° 的黄绿色带在深色背景上必然发浑发脏
```

> 为什么是 ±30°：我实测过 ±82° 和 ±55°。
> ±82° 时紫校好看，但北大红（h≈355）+82° 会跑到 77°（黄绿），深底上的黄绿 = 橄榄绿 = 脏；
> ±55° 时红校的 +55° 仍是橙色，深底上橙色 = 棕色，一样脏。
> **±30° 是唯一能保证"任何色相进来都不翻车"的幅度**，层次感靠明度拉开。

**脏色钳制函数（必须实现对每一个派生色相调用）：**

```js
function dirtyClamp(h) {
  h = ((h % 360) + 360) % 360;
  if (h > 55 && h < 105) {                       // 黄绿 → 深底必脏
    return Math.abs(h - 55) <= Math.abs(h - 105) ? 55 : 105;
  }
  return h;
}
```

### 7.3 六团极光常数表

位置 / 尺寸 / 透明度**固定不变**，只有色相跟着走（色相 = `h + dh`，再过 `dirtyClamp`）。

| # | dh | 饱和度 | 明度 | 透明度 | 位置 x,y | 半径 rx,ry |
|---|---|---|---|---|---|---|
| 1 | 0 | 88 | 68 | 0.50 | 8%, -2% | 58%, 38% |
| 2 | +18 | 84 | 50 | 0.48 | 98%, 8% | 54%, 34% |
| 3 | -18 | 86 | 62 | 0.42 | 0%, 42% | 48%, 30% |
| 4 | +30 | 80 | 46 | 0.40 | 102%, 56% | 54%, 34% |
| 5 | -24 | 88 | 58 | 0.46 | 10%, 98% | 62%, 38% |
| 6 | +8 | 84 | 72 | 0.30 | 98%, 94% | 56%, 34% |

每团生成一个：

```
radial-gradient({rx}% {ry}% at {x} {y}, rgba(色,{a}) 0%, rgba(色,0) 68%)
```

6 个用英文逗号连接，赋给 `--aurora`。

### 7.4 24 个变量的完整定义

设 `h` = 规范化后的色相，`s` = 规范化后的饱和度：

```
--brand       = hsl(h, max(s,45), 56)
--brand-lt    = hsl(h, 88, 74)
--brand-soft  = hsl(h, 92, 88)
--brand-deep  = hsl(h, 62, 28)
--bg-page     = hsl(h, 40, 4)
--bg-wash     = radial-gradient(120% 62% at 46% -6%,
                  hsl(h,52,26) 0%, hsl(h,44,13) 34%,
                  hsl(h,38,7) 62%, hsl(h,34,4) 100%)
--aurora      = 7.3 的 6 团拼接
--glow        = radial-gradient(60% 60% at 50% 50%,
                  hsl(h,86,62,.78) 0%, hsl(h+20,84,62,.22) 55%,
                  hsl(h+20,84,62,0) 78%)
--hero-bg     = linear-gradient(140deg,
                  hsl(h,84,58,.20) 0%, rgba(255,255,255,.06) 46%,
                  hsl(h+18,82,60,.10) 100%)
--logo-glow   = hsl(h, 84, 58, 0.55)
--cta-glow    = hsl(h, 80, 72, 0.62)
--cta-fg      = hsl(h, 68, 16)
--ring        = hsl(h, 80, 70, 0.55)
--tag-bg      = hsl(h, 80, 72, 0.16)
--tag-line    = hsl(h, 80, 72, 0.30)
--row-sel     = hsl(h, 80, 60, 0.16)
--chip-1 … --chip-8 = hsl(dirtyClamp(h + off), 64, 58, 0.34)
                       off 依次 = -42, -30, -18, -6, 6, 18, 30, 42
```

`hsl(h, s, l, a)` 返回 `'rgba(r, g, b, a)'` 字符串，a 省略时默认 1。
`hsl` 里的 h 允许传超出 0~360 的值（如 `h+55`），函数内部自行取模归一。

### 7.5 输入规范化：极端校徽色兜底 ⚠️

**这一步不能省。** 真实校徽会出各种意外色：

```js
function normalizeBrand(h, s, l) {
  // ① 近灰/近黑白的校徽（s 极低）→ 色相是噪声，退到默认主题色
  if (s < 12) {
    return { h: 262, s: 70, fallback: true };   // 262 = 紫罗兰，中性不出错
  }
  // ② 饱和度太低 → 强行拉起来，否则整套会灰扑扑没有品牌感
  //    饱和度太高（荧光色）→ 压一点，避免刺眼
  s = Math.min(100, Math.max(38, s));
  // ③ 明度不影响派生（派生的 L 都是写死的），所以只做记录，不参与计算
  return { h, s, fallback: false };
}
```

> 说明：本算法里**只有色相 h 和饱和度 s 参与派生**，明度 l 不参与
> （所有变量的 L 都是常数）。所以近黑、近白、暗金这类校徽色都不会"算不出来"，
> 唯一需要兜底的是**低饱和度的灰黑色**——那种情况下色相本身没有意义。

如果 `fallback === true`，可以在院校数据里给一个 `accent` 字段手动指定，
配置表里不填就走默认 262。

### 7.6 院校配置（只是数据，先放这些占位）

| key | name | motto | mark | brand |
|---|---|---|---|---|
| thu | 清华大学 | 自强不息 · 厚德载物 | 清 | #7C3AED |
| pku | 北京大学 | 思想自由 · 兼容并包 | 北 | #A31621 |
| zju | 浙江大学 | 求是创新 | 浙 | #0B5A9E |
| fdu | 复旦大学 | 博学而笃志 · 切问而近思 | 复 | #0E4C92 |
| sjtu | 上海交通大学 | 饮水思源 · 爱国荣校 | 交 | #B31942 |
| nju | 南京大学 | 诚朴雄伟 · 励学敦行 | 南 | #6F2C91 |
| ustc | 中国科学技术大学 | 红专并进 · 理实交融 | 科 | #0A5CA8 |
| whu | 武汉大学 | 自强 · 弘毅 · 求是 · 拓新 | 武 | #14684B |

**这些色值我会自己换成真实取色，你不用管准确性。**
重要的是：加第 9 所、第 50 所，都只是往数组里加一行，你的代码要能直接吃下去。

状态用 `wx.setStorageSync('theme_school_key', key)` 保存。

### 7.7 泛化自测（做完必须自己跑一遍，把结果贴给我）

新建 `theme/selftest.js`，在开发者工具 Console 里调一次：

```js
const { buildTheme } = require('./palette');

const TESTS = [
  '#7C3AED', // 紫
  '#A31621', // 暗红
  '#0B5A9E', // 深蓝
  '#F5C518', // 亮黄（校徽金）
  '#B8860B', // 暗金
  '#1A7A5E', // 深绿
  '#111111', // 近黑（单色校徽 → 应触发 fallback）
  '#FAFAFA', // 近白（应触发 fallback）
  '#00FF00', // 荧光绿（极端饱和）
  '#8B4513', // 棕
  '#C71585', // 玫红
  '#4A90D9', // 天蓝
];

let bad = [];
TESTS.forEach(hex => {
  const t = buildTheme(hex);
  const vars = t.cssVars;
  // 检查所有派生色相里有没有漏掉钳制的脏色
  const all = [vars['--aurora'], vars['--glow'], vars['--hero-bg'],
               vars['--bg-wash'], vars['--brand']].join(' ');
  console.log(hex, 'hue=' + t.hue, 'brand=' + vars['--brand'],
              'fallback=' + (t.hue === 262 && hex !== '#7C3AED'));
  if (!vars['--brand'] || !vars['--aurora'] || !vars['--chip-8']) bad.push(hex);
});

console.log(bad.length ? '❌ 缺少变量: ' + bad : '✅ 12 组色值全部产出完整主题');
```

**判定标准：**

- 12 个色值全部输出 `--brand / --aurora / --chip-1~8` 等 24 个变量，不缺项
- 输出里**不应出现** `NaN`、`undefined`、`rgba(0,0,0,0)` 以外的空值
- 两个近黑/近白色值应触发 fallback（hue 变成 262），而不是算出一堆灰色
- 人工看一下 `--aurora` 的 6 个色相，**不应有任何一个落在 56°~104°**

跑完把 Console 输出贴给我。

### 7.8 可选增强：从校徽图片自动取主色

如果用户上传或选择的校徽图需要自动配色（不依赖配置表里的 hex），加一个工具函数
`extractBrandColor(imagePath)`。算法：

```
1. wx.getImageInfo 拿到图片，画到离屏 canvas 上，缩到 32×32（够用且快）
2. getImageData 遍历 1024 个像素
3. 逐像素 hex → HSL，按以下规则过滤：
   - l < 12 或 l > 88        → 跳过（黑底 / 白底）
   - s < 18                  → 跳过（灰色）
   - h 在 40~55 且 s>50 且 l>55 → 跳过（校徽上的金色描边，会抢主色）
4. 剩下的像素按色相分 12 个桶（每桶 30°），统计像素数
5. 取像素最多的那个桶，用桶内像素色相的**中位数**作为主色相，
   饱和度/明度取桶内像素的平均值
6. 若有效像素 < 总像素的 8%，判定为单色校徽 → 返回 null，走配置表的 brand 或 fallback
7. 返回 '#RRGGBB'
```

这个函数是**可选**的，放在 `theme/extract.js`，不要影响主流程。
优先级：配置表 `brand` > 图片取色 > fallback。

---

## 8. 选择院校页

新建 `pages/picker/picker`，从首页点击「学校身份卡」进入。

结构从上到下：

| 元素 | 规格 |
|---|---|
| 搜索框 | 高 80rpx，圆角 40rpx，玻璃，左侧放大镜（用 CSS 画圆 + 斜线，不要引图标库） |
| 小标题「当前院校」 | 21rpx，字距 3.2rpx，颜色 `--ink-3`，左右 36rpx |
| 当前院校卡 | 高 160rpx，圆角 36rpx，**外描边 `0 0 0 1rpx var(--ring)`** |
| └ 校徽 | 100rpx 圆，该校品牌色渐变，右侧实心勾选圆 44rpx |
| 小标题「热门院校 · 共 N 所」 | 同上 |
| **院校列表** | **整块只用 1 个 `.glass` 面板**，不要一行一个卡片 |
| └ 单行 | 高 124rpx，左内边距 32rpx，校徽 72rpx，右侧箭头 |
| └ 分割线 | `1rpx` 渐变线，从左 `rgba(255,255,255,.10)` 淡出到透明 |
| └ 选中行 | 背景 `linear-gradient(90deg, var(--row-sel), transparent 72%)` |

**关键要求：**

1. 列表每行的校徽底色，用**那一所学校自己的**品牌色，**不跟随当前主题**。
   用户在这里就是要预览别的校长什么样。
   （所以每一行都要单独调一次 `buildTheme(item.brand)` 或只取它的 `--brand` 值）
2. 点击某一行：先 `setSchool(key)` 存本地 → 立即 `theme.apply(this, key)` 原地换肤
   → `wx.showToast` → 延时 420ms 后 `wx.navigateBack()`。
   让用户当场看到整套颜色变了，比直接跳回去反馈强得多。
3. 点的是当前已选中的学校 → 直接 `navigateBack()`。
4. 搜索框按名字和校训过滤，不区分大小写。

---

## 9. 硬性禁止项（逐条自查）

| 禁止 | 原因 |
|---|---|
| ❌ 为某所学校单独写 CSS / 单独配色 | 配色必须由 `buildTheme()` 算，否则加学校就要改样式 |
| ❌ 在 WXSS 里写死任何品牌色 | 换校后会残留旧色，全部走 `var(--x)` |
| ❌ 给玻璃卡的**祖先元素**加 `filter` / `opacity < 1` / `transform` / `mask` | 会创建新的 backdrop root，`backdrop-filter` 采样不到背景，玻璃直接变灰板。这是最常见的失效原因 |
| ❌ 用 `filter: blur()` 画背景光晕 | 低端安卓掉帧，改用 radial-gradient |
| ❌ 在 `.is-tap` 里加 `opacity` | 部分 iOS 机型会让 `backdrop-filter` 闪烁，只动 transform |
| ❌ 院校列表做成「一行一个 `.glass`」 | 同屏超过 10 个 backdrop-filter 会掉帧，视觉上也散 |
| ❌ 圆角出现 20/36/52rpx 以外的值 | 圆角不统一最显廉价 |
| ❌ 用纯白 `#fff` 做文字色 | 用四档透明度 |

> 同屏玻璃元素控制在 10 个以内。首页是「1 身份卡 + 1 主卡 + 8 学科卡 = 10」，
> 刚好到上限，**不要再往首页加玻璃模块**。

---

## 10. 分三阶段交付

### 阶段一：地基（做完停下来给我看）

1. `app.wxss` 写入设计令牌、`.aurora-bg`、`.glass`、`.glass--ring`、`.is-tap`
2. 首页最外层加 `<view class="aurora-bg"></view>`
3. 首页所有白底卡片改成 `class="glass"`
4. 文字颜色换成四档透明度

**本阶段先写死紫色**，不接主题引擎。做完视觉应该已经提升 70%。

### 阶段二：主题引擎（做完停下来给我看）

1. 新建 `theme/palette.js`、`theme/schools.js`、`theme/index.js`
2. 首页接入：根节点 `style="{{themeStyle}}"`，`onShow` 里 `theme.apply(this)`
3. 首页 WXSS 里所有硬编码色值替换成 `var(--x)`
4. 学校身份卡改成从 `school` 对象渲染
5. **跑 7.7 的自测，把 Console 输出贴给我**

**验收**：临时把默认院校改成北大 → 整页变酒红；改成浙大 → 变深蓝；改回清华 → 紫罗兰。

### 阶段三：选择院校页（做完停下来给我看）

1. 新建 `pages/picker/*`，注册进 `app.json`
2. 首页学校卡加 `bindtap` 跳转
3. 按第 8 节规格实现搜索、列表、点击换肤

> 第 7.8 节的图片取色是可选增强，等我确认了再做，不要提前做。

---

## 11. 最终验收清单

逐条确认后再告诉我「完成」：

- [ ] 首页背景是深色 + 6 团彩色光晕，不是纯色
- [ ] 玻璃卡片能透出背后的光晕颜色，不是灰板
- [ ] 8 个学科 + 身份卡 + 主卡在一屏内放得下，无需滚动
- [ ] 切换院校后，光晕 / 主卡 / 按钮 / 标签 / 学科图标底色**全部**跟着变，无紫色残留
- [ ] **用一个我随口给的随机 hex 也能算出完整主题**（不许回退到紫色）
- [ ] 近黑、近白、荧光绿这类极端色值不会崩，也不会发灰发脏
- [ ] 北大红主题下没有发黄 / 发绿 / 发脏的色块
- [ ] 不支持 backdrop-filter 的机型上，卡片不会透明到看不清
- [ ] 页面滚动无明显掉帧
- [ ] 从选择院校页返回首页，主题立刻生效

---

## 12. 遇到问题时的排查表

| 现象 | 原因 | 处理 |
|---|---|---|
| 玻璃卡是灰的，不透背景 | 祖先元素有 filter/opacity/transform | 把玻璃卡移出该容器，或去掉祖先的这四个属性 |
| 卡片完全透明，什么都看不见 | 不支持 `backdrop-filter` 且没写兜底 | 加 `@supports not (...)` 兜底块 |
| 换校后有紫色残留 | WXSS 里还有硬编码色值 | 全局搜 `#` 十六进制逐个替换 |
| 两列卡片换行错位 | 卡片宽度不是 `(750-左右留白×2-间距)/2` | 按公式重算 |
| 真机上 blur 无效、开发者工具正常 | iOS 缺 `-webkit-` 前缀 | 两个都写 |
| 某些校徽色出现土黄色块 | 派生色相落进 55°~105° | 检查 `dirtyClamp()` 是否对**所有**派生色相都调用了 |
| 灰黑色校徽算出来的主题一片灰 | 没做 7.5 的低饱和兜底 | 加 `s < 12 → fallback` |
| 页面滚动卡顿 | backdrop-filter 数量过多 | 减少同屏玻璃元素，或把列表合成一个面板 |
