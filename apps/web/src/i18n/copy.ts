import type { Locale } from "./locales";

export const copy = {
  en: {
    navHome: "Home",
    navMuseum: "Museum",
    navCollection: "Collection",
    stage: "Live ARTIC collection · Stage 5",
    homeTitle: "A gallery built around the act of looking.",
    homeLede:
      "Canvium brings open museum paintings into a calm, traceable space for close looking and conversation.",
    explore: "Enter the museum",
    foundation: "Collection status",
    foundationBody:
      "The Art Institute of Chicago collection now uses live, runtime-validated records with shareable search, filters, pagination, artwork details, and explicit rights boundaries.",
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
    stage: "ARTIC 实时馆藏 · 阶段 5",
    homeTitle: "一座围绕观看本身建立的美术馆。",
    homeLede: "Canvium 将开放馆藏中的绘画带入一处安静、可追溯、适合细看与对话的空间。",
    explore: "进入博物馆",
    foundation: "馆藏接入状态",
    foundationBody:
      "芝加哥艺术博物馆馆藏现已接入实时、经过运行时校验的数据，并提供可分享的搜索、筛选、分页、作品详情和明确的权利边界。",
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
