# VVisual Art Demo

一个独立的实验性画廊 demo，参考 Visualbusiness 的极简图像索引、留白编号网格、滚动视差与从总览进入沉浸详情的体验。

## 页面

- `index.html`：60 格长滚动馆藏索引
- `#work-{ARTIC_ID}`：画作详情与本地模拟聊天

## 运行

从仓库根目录执行：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/experiments/vvisual-art-demo/
```

画作与元数据取自项目现有的 Art Institute of Chicago 馆藏目录和已验证快照。GSAP 与 ScrollTrigger 使用项目已安装依赖的本地副本，不依赖 CDN。
