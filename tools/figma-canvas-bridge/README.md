# Canvas Design Bridge

本地 Figma 开发插件。它通过普通 Figma Plugin API 将 Canvas Demo 转为可编辑的设计图层，并将修改后的页面导出为 JSON；不调用 Figma Make、First Draft 或其他 Figma AI 功能。

## 安装

1. 安装并打开 Figma Desktop。
2. 新建一个 Figma Design Draft 文件。
3. 打开 `Plugins → Development → Import plugin from manifest…`。
4. 选择本目录中的 `manifest.json`。
5. 在 `Plugins → Development` 中运行 **Canvas Design Bridge**。

## 生成页面

在插件中勾选需要的页面，点击“生成可编辑页面”。插件目前生成四个 `1440 × 960` Frame：

- `Canvas / 01 Home / Desktop`
- `Canvas / 02 Museum / Desktop`
- `Canvas / 03 Gallery / Desktop`
- `Canvas / 04 Artwork / Desktop`

每个主要图层都保存了对应的 CSS 选择器和用途元数据。作品图片优先从项目当前使用的 Wikimedia Commons 公共图片地址加载；如果 Figma 无法访问图片，插件会保留相同尺寸的占位图层。

## 导出修改

1. 在 Figma 画布中选中一个或多个顶层 `Canvas / …` Frame。
2. 再次运行插件。
3. 点击“导出选中页面 JSON”。
4. 将下载的 `canvas-design-export-YYYY-MM-DD.json` 放入项目或交给 Codex。

导出的 JSON 包含：

- 完整图层树和相对父图层的坐标、尺寸；
- 字体、字号、文字、颜色、描边、圆角和透明度；
- 原项目 CSS 选择器映射；
- 每个图层相对插件生成初始状态的 `changed` 字段。

## 当前边界

- Figma 文件表达静态视觉布局，不模拟地球 3D、轮播、缩放和 AI 对话逻辑。
- 首版以桌面设计基准为主；完成桌面布局后，再根据最终结构生成移动端 Frame 更稳妥。
- 如果更换了本机没有的字体，导出后需要在网页端确认回退字体和换行。
