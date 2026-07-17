# Canvas

可对话的数字博物馆前端 Demo。第一期以文森特·梵高为主题，通过高清作品、画面热点与基于史料设计的数字化身，演示“观看—发现—提问—再观看”的核心体验。

## 运行

这是一个无构建依赖的静态项目。直接打开 `index.html` 即可；推荐使用本地静态服务器：

```powershell
npx.cmd serve .
```

或使用任意编辑器的 Live Server 功能。

## 当前范围

- 3 件梵高开放馆藏作品
- 响应式数字展厅
- 图像缩放、拖动和全屏查看
- 每件作品 4 个可交互热点
- 预设问题与本地规则式对话
- 史实、解读及身份边界提示

## 素材来源

作品图像及基础信息来自芝加哥艺术博物馆开放馆藏，对应页面标明为 CC0 Public Domain Designation：

- [The Bedroom](https://www.artic.edu/artworks/28560/the-bedroom)
- [Self-Portrait](https://www.artic.edu/artworks/80607/self-portrait)
- [The Poet's Garden](https://www.artic.edu/artworks/14586/the-poet-s-garden)

Demo 通过 Wikimedia Commons 的 `Special:FilePath` 加载图像，因此首次浏览需要联网。

## 下一步

接入经过整理的书信与馆藏知识库、真实大模型服务、逐句引用，以及 IIIF 深度缩放查看器。
