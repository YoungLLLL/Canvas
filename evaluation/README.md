# Stage 5 验收报告

`npm run verify:stage5` 通过正式 Next.js `/api/catalog` 接口抽查 ARTIC 馆藏，不复制或绕过生产环境的权利准入与 Commons 映射规则。

快速检查默认抽查 2 页、最多 24 件作品，并自动启动临时正式应用：

```bash
npm run verify:stage5
```

接近 500 件的正式抽查使用 42 页。为降低 ARTIC、Wikidata 与 Wikimedia Commons 的匿名限流风险，保持低并发和页间延迟：

```bash
npm run verify:stage5 -- --pages 42 --concurrency 1 --page-delay-ms 500 --image-delay-ms 750
```

报告默认写入 `evaluation/runs/stage5-catalog-<timestamp>.json`，该目录中的运行结果不会进入 Git。报告包含：

- Commons 精确映射候选数、成功数与映射率；
- 从全部可展示记录中均匀选择少量图片进行低流量可达性探测；默认最多 5 张，避免对 Wikimedia CDN 进行批量下载，429 限流和超时会单列为“探测受限”，不会误报成失效图片；
- 作品、图片、元数据许可与来源字段完整性；
- 重复作品、分页失败和新鲜／陈旧数据状态；
- 每页请求、图片探测和缓存复查的耗时。

默认通过门槛为映射率不低于 95%、图片可达率与有效探测覆盖率均不低于 98%、权利与来源字段 100% 完整，并且没有分页失败或重复记录。可用 `--help` 查看全部参数。

如需验证已经运行或部署的正式应用：

```bash
npm run verify:stage5 -- --base-url https://example.com --pages 42
```

正式长跑前应在 `apps/web/.env.local` 中填写真实的 `ARTIC_USER_AGENT` 联系地址。
