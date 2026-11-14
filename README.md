# 玻璃拟态界面原型 · 微信小程序改造方案

微信小程序的界面改造方案：玻璃拟态（Glassmorphism）视觉体系 + 由校徽主色驱动的动态主题引擎。

> 纯前端原型，不含后端依赖，可直接在浏览器里预览效果。

## 在线预览

**[https://yuchengh898-wq.github.io/glass-mockup/](https://yuchengh898-wq.github.io/glass-mockup/)**

| 页面 | 说明 | 直达链接 |
| --- | --- | --- |
| 首页 | 四个原型的导航入口 | [打开](https://yuchengh898-wq.github.io/glass-mockup/) |
| 主界面原型 | 玻璃卡片、磨砂层次、背景光晕 | [打开](https://yuchengh898-wq.github.io/glass-mockup/mockup.html) |
| 学校选择器 | 院校列表与当前选择状态 | [打开](https://yuchengh898-wq.github.io/glass-mockup/picker.html) |
| 动态主题引擎 | 按校徽提取主色生成整套配色 | [打开](https://yuchengh898-wq.github.io/glass-mockup/themes.html) |
| 层级叠加测试 | 多层模糊的性能与渲染验证 | [打开](https://yuchengh898-wq.github.io/glass-mockup/layering-test.html) |

## 目录结构

```
glass-mockup/
├── index.html               站点首页（导航）
├── mockup.html              主界面原型
├── picker.html              学校选择器原型
├── themes.html              动态主题引擎原型
├── layering-test.html       层级叠加测试
├── make_compare.py          对比图生成脚本
├── pages/                   小程序页面源码
│   ├── index/               主页面（js / json / wxml / wxss）
│   └── picker/              选校页面（js / json / wxml / wxss）
├── theme/                   主题引擎核心
│   ├── index.js
│   ├── palette.js           配色生成
│   └── schools.js           院校数据与主色
├── wxss/
│   └── app.wxss             全局样式
├── 改造说明.md               改造思路与实现细节
└── CodeBuddy-实施说明.md     落地实施步骤
```

## 核心思路

**1. 玻璃拟态基础层**

卡片使用 `backdrop-filter: blur()` + 半透明白色填充 + 内发光描边，形成磨砂玻璃质感。背景铺设多层径向渐变光晕，为模糊层提供可供折射的内容。

```css
background: rgba(255, 255, 255, .07);
backdrop-filter: blur(20px) saturate(160%);
border: 1px solid rgba(255, 255, 255, .14);
box-shadow: 0 10px 34px rgba(0, 0, 0, .34),
            inset 0 1px 0 rgba(255, 255, 255, .16);
```

**2. 校徽驱动主题**

`theme/palette.js` 从院校主色出发，用 HSL 空间推导出一整套配色（背景光晕、卡片描边、强调色、文字层级），保证任意主色下对比度都可用。

**3. 小程序适配**

`wxss/` 与 `pages/*/` 中的样式经过等价改写，适配小程序的样式限制（不支持部分 `backdrop-filter` 特性时降级为不透明底色 + 阴影）。

## 本地预览

不需要安装任何依赖，直接用浏览器打开 HTML 文件即可：

```bash
# 方式一：双击 index.html

# 方式二：起一个本地服务（推荐，避免 file:// 的跨域限制）
python -m http.server 8000
# 然后访问 http://localhost:8000/
```

小程序部分需要微信开发者工具导入整个目录查看。

## 技术栈

- 原生 HTML / CSS / JavaScript（无框架依赖）
- 微信小程序：WXML / WXSS / JS
- 样式特性：`backdrop-filter`、CSS 渐变、CSS 变量

## 浏览器兼容

| 浏览器 | 支持情况 |
| --- | --- |
| Chrome / Edge 76+ | 完整支持 |
| Safari 9+ | 需 `-webkit-backdrop-filter` 前缀 |
| Firefox 103+ | 完整支持 |
| 旧版浏览器 | 降级为不透明背景 |

## 文档

- [改造说明.md](改造说明.md) —— 设计决策与样式实现
- [CodeBuddy-实施说明.md](CodeBuddy-实施说明.md) —— 分步落地指引

## 许可

本项目仅用于界面方案演示与学习交流。

---

如果这个项目对你有帮助，欢迎 Star ⭐
