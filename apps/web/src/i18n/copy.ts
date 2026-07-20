import type { Locale } from "./locales";

export const copy = {
  en: {
    navHome: "Home",
    navMuseum: "Museum",
    navCollection: "Collection",
    stage: "Formal foundation · Stage 4",
    homeTitle: "A gallery built around the act of looking.",
    homeLede:
      "Canvium brings open museum paintings into a calm, traceable space for close looking and conversation.",
    explore: "Enter the museum",
    foundation: "Foundation status",
    foundationBody:
      "Stable routes, runtime-validated domain models, and resilient loading and error states are now in place. Live ARTIC data arrives in Stage 5.",
    museumTitle: "The Art Institute of Chicago",
    museumLede:
      "The first Canvium collection is limited to eligible two-dimensional paintings with explicit image and rights evidence.",
    collectionTitle: "Collection",
    artworkTitle: "Artwork viewer",
    artistTitle: "Artist archive",
    placeholder: "This route is stable. Data migration follows in Stage 5.",
    notFound: "This gallery room does not exist.",
    error: "This part of the gallery could not be opened.",
    retry: "Try again",
  },
  zh: {
    navHome: "首页",
    navMuseum: "博物馆",
    navCollection: "馆藏",
    stage: "正式工程基础 · 阶段 4",
    homeTitle: "一座围绕观看本身建立的美术馆。",
    homeLede: "Canvium 将开放馆藏中的绘画带入一处安静、可追溯、适合细看与对话的空间。",
    explore: "进入博物馆",
    foundation: "工程基础状态",
    foundationBody:
      "稳定路由、运行时数据校验以及加载与错误边界已经建立；真实 ARTIC 数据将在阶段 5 接入。",
    museumTitle: "芝加哥艺术博物馆",
    museumLede: "Canvium 的首个馆藏仅收录具有明确图片与权利依据、符合规则的二维绘画。",
    collectionTitle: "馆藏",
    artworkTitle: "作品查看器",
    artistTitle: "艺术家档案",
    placeholder: "此路由已经稳定，真实数据迁移将在阶段 5 进行。",
    notFound: "这间展厅不存在。",
    error: "暂时无法打开这部分展厅。",
    retry: "重试",
  },
} as const satisfies Record<Locale, Record<string, string>>;
