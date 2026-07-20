# Canvas

可对话的数字博物馆前端 Demo。第一期以文森特·梵高为主题，通过高清作品、画面热点与基于史料设计的数字化身，演示“观看—发现—提问—再观看”的核心体验。

## 运行（AI 对话）

复制环境变量示例并填入服务端 Gemini API Key：

```bash
cp .env.example .env
```

然后从 `Canvas` 目录启动：

```bash
npm start
```

浏览器访问 `http://localhost:4174`。API Key 只由 `server.mjs` 读取，不会发送到浏览器。`AQ.` 开头的 Gemini Authorization Key 可以直接填入 `GEMINI_API_KEY`。

若同时配置 Gemini 与 OpenAI，系统优先使用 Gemini；OpenAI 只作为备用。若都未配置，页面仍可运行，并使用本地备用开场。

## 当前范围

- 芝加哥艺术博物馆 3 件梵高精选作品
- The Met 12 件梵高开放馆藏作品
- Cleveland Museum of Art 12 件莫奈开放馆藏作品
- 三馆动态切换与馆方资料页
- 响应式数字展厅
- 图像缩放、拖动和全屏查看
- 每件作品 4 个可交互热点
- Gemini Interactions API 多轮人格对话
- AI 生成的作品背景式开场
- 史实、解读及身份边界提示

## 素材来源

作品图像及基础信息来自芝加哥艺术博物馆开放馆藏，对应页面标明为 CC0 Public Domain Designation：

- [The Bedroom](https://www.artic.edu/artworks/28560/the-bedroom)
- [Self-Portrait](https://www.artic.edu/artworks/80607/self-portrait)
- [The Poet's Garden](https://www.artic.edu/artworks/14586/the-poet-s-garden)

芝加哥精选作品在馆方 IIIF 受 Cloudflare 限制时回退到 Wikimedia Commons 高清副本；The Met 与 Cleveland 作品直接使用各馆开放图片服务。首次浏览及切换博物馆时需要联网。

## 提示词

通用框架见 `../../ai/prompt-framework.mjs`，产品审核稿见 `../../docs/product/Canvas-Artist-Prompt-Framework-v0.1.md`。
