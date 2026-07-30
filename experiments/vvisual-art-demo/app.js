const artworks = [
  {
    id: "28560",
    title: "卧室",
    en: "THE BEDROOM",
    artist: "Vincent van Gogh",
    date: "1889",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Vincent_van_Gogh_-_The_Bedroom_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_The_Bedroom_-_Google_Art_Project.jpg",
    ratio: 843 / 658,
    description: "梵高将阿尔勒黄房子里的卧室压缩成倾斜的色面，让日常空间拥有几乎不稳定的情绪。",
  },
  {
    id: "27992",
    title: "大碗岛的星期日下午",
    en: "A SUNDAY ON LA GRANDE JATTE",
    artist: "Georges Seurat",
    date: "1884–86",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/960px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg",
    ratio: 843 / 561,
    description: "无数并置色点在观看距离中混合，公园里静止的人群因此同时显得日常、庄严又疏离。",
  },
  {
    id: "16568",
    title: "睡莲",
    en: "WATER LILIES",
    artist: "Claude Monet",
    date: "1906",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/960px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    ratio: 843 / 810,
    description: "画面抛开地平线，只留下池水表面、浮叶与反光，让空间在倒影和颜料之间摇摆。",
  },
  {
    id: "14572",
    title: "女帽店",
    en: "THE MILLINERY SHOP",
    artist: "Edgar Degas",
    date: "1879–86",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Edgar_Degas_-_The_Millinery_Shop_-_Google_Art_Project.jpg/960px-Edgar_Degas_-_The_Millinery_Shop_-_Google_Art_Project.jpg",
    ratio: 843 / 757,
    description: "被帽子切割的空间与偏离中心的人物，让现代商业生活像一个被偶然截取的瞬间。",
  },
  {
    id: "14620",
    title: "普尔维尔悬崖步道",
    en: "CLIFF WALK AT POURVILLE",
    artist: "Claude Monet",
    date: "1882",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Claude_Monet_-_Cliff_Walk_at_Pourville_-_Google_Art_Project.jpg/960px-Claude_Monet_-_Cliff_Walk_at_Pourville_-_Google_Art_Project.jpg",
    ratio: 843 / 676,
    description: "风把草坡、裙摆、海面和云层编织在同一个方向里，人物也成为天气的一部分。",
  },
  {
    id: "64818",
    title: "麦垛（夏末）",
    en: "STACKS OF WHEAT",
    artist: "Claude Monet",
    date: "1890–91",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Claude_Monet_-_Stacks_of_Wheat_%28End_of_Summer%29_-_1985.1103_-_Art_Institute_of_Chicago.jpg/960px-Claude_Monet_-_Stacks_of_Wheat_%28End_of_Summer%29_-_1985.1103_-_Art_Institute_of_Chicago.jpg",
    ratio: 843 / 500,
    description: "同一主题被置于不同光线中反复观看，麦垛成为颜色与时间变化的测量工具。",
  },
  {
    id: "81539",
    title: "塞纳河畔，贝讷库尔",
    en: "ON THE BANK OF THE SEINE",
    artist: "Claude Monet",
    date: "1868",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Claude_Monet_-_On_the_Bank_of_the_Seine%2C_Bennecourt_-_1922.427_-_Art_Institute_of_Chicago.jpg/960px-Claude_Monet_-_On_the_Bank_of_the_Seine%2C_Bennecourt_-_1922.427_-_Art_Institute_of_Chicago.jpg",
    ratio: 843 / 681,
    description: "前景人物背对观看者，河岸风景因此不是被展示的景色，而是一次共享的凝视。",
  },
  {
    id: "11723",
    title: "梳妆女子",
    en: "WOMAN AT HER TOILETTE",
    artist: "Berthe Morisot",
    date: "1875–80",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berthe_Morisot_-_Woman_at_Her_Toilette_-_1924.127_-_Art_Institute_of_Chicago.jpg/960px-Berthe_Morisot_-_Woman_at_Her_Toilette_-_1924.127_-_Art_Institute_of_Chicago.jpg",
    ratio: 843 / 631,
    description: "白、灰与淡紫的迅速笔触使人物、衣料和镜前空气融为一体，私密空间变成光的场域。",
  },
  {
    id: "27310",
    title: "圣家族与圣伊丽莎白、施洗者约翰",
    en: "THE HOLY FAMILY",
    artist: "Peter Paul Rubens",
    date: "c. 1615",
    medium: "板上油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Peter_Paul_Rubens_-_The_Holy_Family_with_Saints_Elizabeth_and_John_the_Baptist_-_1967.229_-_Art_Institute_of_Chicago.jpg/960px-Peter_Paul_Rubens_-_The_Holy_Family_with_Saints_Elizabeth_and_John_the_Baptist_-_1967.229_-_Art_Institute_of_Chicago.jpg",
    ratio: 843 / 1063,
    description: "人物通过手势、眼神与倾斜身体组成紧密的环，温暖肤色从深色背景中被推向前景。",
  },
  {
    id: "109819",
    title: "菱形构图：黄、黑、蓝、红与灰",
    en: "LOZENGE COMPOSITION",
    artist: "Piet Mondrian",
    date: "1921",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Piet_Mondrian_-_Lozenge_Composition_with_Yellow%2C_Black%2C_Blue%2C_Red%2C_and_Gray_-_1957.307_-_Art_Institute_of_Chicago.jpg/960px-Piet_Mondrian_-_Lozenge_Composition_with_Yellow%2C_Black%2C_Blue%2C_Red%2C_and_Gray_-_1957.307_-_Art_Institute_of_Chicago.jpg",
    ratio: 1,
    description: "旋转的方形画布截断垂直与水平线，使均衡结构获得一种仍在画框外继续延伸的张力。",
  },
  {
    id: "80607",
    title: "自画像",
    en: "SELF-PORTRAIT",
    artist: "Vincent van Gogh",
    date: "1887",
    medium: "艺术家纸板油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Vincent_van_Gogh_-_Self-Portrait_-_1954.326_-_Art_Institute_of_Chicago.jpg/960px-Vincent_van_Gogh_-_Self-Portrait_-_1954.326_-_Art_Institute_of_Chicago.jpg",
    ratio: 843 / 1069,
    description: "短促而相互交错的笔触把脸、衣服和背景连接起来，自我观看成为一场持续变化的绘画实验。",
  },
  {
    id: "16487",
    title: "从莱斯塔克眺望马赛湾",
    en: "THE BAY OF MARSEILLE",
    artist: "Paul Cézanne",
    date: "c. 1885",
    medium: "布面油画",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Paul_C%C3%A9zanne_-_The_Bay_of_Marseilles%2C_Seen_from_L%27Estaque_-_Google_Art_Project.jpg/960px-Paul_C%C3%A9zanne_-_The_Bay_of_Marseilles%2C_Seen_from_L%27Estaque_-_Google_Art_Project.jpg",
    ratio: 843 / 671,
    description: "海湾、山体与建筑被组织成坚实色块，远景不再后退，而像积木一样层层垒起。",
  },
];

const imageSlots = new Set([0, 2, 3, 7, 9, 10, 12, 13, 14, 15, 16, 17, 23, 25, 26, 27, 29, 32, 33, 34, 35, 40, 43, 47, 50, 54, 58]);
const shapePattern = ["portrait", "wide", "portrait", "small", "wide", "portrait", "portrait", "wide"];
const grid = document.querySelector("#worksGrid");
const loader = document.querySelector("#loader");
const detailPage = document.querySelector("#detailPage");
const detailImage = document.querySelector("#detailImage");
const detailArt = document.querySelector("#detailArt");
const messages = document.querySelector("#messages");
const status = document.querySelector("#status");
const cursor = document.querySelector("#cursor");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentArtwork = 0;
let returnScroll = 0;
let isZoomed = false;
let dragging = false;
let dragOrigin = { x: 0, y: 0 };
let imageOffset = { x: 0, y: 0 };

function buildGrid() {
  let artworkCursor = 0;
  for (let slotIndex = 0; slotIndex < 60; slotIndex += 1) {
    const slot = document.createElement("article");
    slot.className = "slot";
    const number = document.createElement("span");
    number.className = "slot__number";
    number.textContent = String(slotIndex).padStart(2, "0");
    slot.appendChild(number);

    if (imageSlots.has(slotIndex)) {
      const artworkIndex = artworkCursor % artworks.length;
      const art = artworks[artworkIndex];
      const work = document.createElement("button");
      const shape = art.ratio < .9 ? "portrait" : shapePattern[artworkCursor % shapePattern.length];
      work.className = "work";
      work.type = "button";
      work.dataset.art = String(artworkIndex);
      work.dataset.shape = shape;
      work.style.setProperty("--art-ratio", String(art.ratio));
      work.setAttribute("aria-label", `查看作品《${art.title}》`);
      work.innerHTML = `
        <span class="work__frame">
          <img class="work__image" src="${art.url}" alt="${art.artist}《${art.title}》" loading="${slotIndex < 10 ? "eager" : "lazy"}" decoding="async" />
          <span class="work__meta"><b>${art.title}</b><i>${art.artist} · ${art.date}</i><em>↗</em></span>
        </span>
      `;
      work.addEventListener("click", () => openDetail(artworkIndex, work));
      work.addEventListener("mouseenter", showCursor);
      work.addEventListener("mouseleave", hideCursor);
      slot.classList.add("has-art");
      slot.appendChild(work);
      artworkCursor += 1;
    }
    grid.appendChild(slot);
  }
}

function boot() {
  if (!window.gsap || reduceMotion) {
    loader.style.display = "none";
    document.querySelectorAll(".work").forEach((work) => { work.style.opacity = "1"; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const counter = { value: 0 };
  gsap.timeline({ defaults: { ease: "power3.inOut" } })
    .to(counter, {
      value: 100,
      duration: .85,
      onUpdate: () => {
        loader.querySelector(".loader__count").textContent = String(Math.round(counter.value)).padStart(2, "0");
      },
    }, 0)
    .to(".loader__track span", { width: "100%", duration: .85 }, 0)
    .to(".loader__mark", { yPercent: -130, duration: .65 }, .95)
    .to(loader, { yPercent: -100, duration: .75 }, .97)
    .set(loader, { display: "none" });

  gsap.set(".work", { autoAlpha: 0, y: 28 });
  ScrollTrigger.batch(".work", {
    batchMax: 5,
    interval: .06,
    start: "top 94%",
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      autoAlpha: 1,
      y: 0,
      duration: .85,
      stagger: .06,
      ease: "power3.out",
      overwrite: true,
    }),
  });

  document.querySelectorAll(".work").forEach((work) => {
    const frame = work.querySelector(".work__frame");
    gsap.fromTo(frame, { yPercent: -4 }, {
      yPercent: 4,
      ease: "none",
      scrollTrigger: { trigger: work, start: "top bottom", end: "bottom top", scrub: .65 },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

function populateDetail(index) {
  const art = artworks[index];
  currentArtwork = index;
  detailImage.src = art.url;
  detailImage.alt = `${art.artist}《${art.title}》`;
  document.querySelector("#detailNumber").textContent = art.id;
  document.querySelector("#detailTitle").textContent = art.title;
  document.querySelector("#detailTitleEn").textContent = art.en;
  document.querySelector("#detailMedium").textContent = `${art.artist} · ${art.date} · ${art.medium}`;
  document.querySelector("#detailDescription").textContent = art.description;
  messages.innerHTML = `<article class="message assistant"><small>CANVIUM / 作品导览</small><p>先不要急着辨认主题。观察画面里最强的明暗或色彩关系，再告诉我你的视线停在了哪里。</p></article>`;
  resetZoom();
}

function openDetail(index, source) {
  if (detailPage.getAttribute("aria-hidden") === "false") return;
  hideCursor();
  returnScroll = window.scrollY;
  populateDetail(index);
  detailPage.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-open");
  history.pushState({ artwork: index }, "", `#work-${artworks[index].id}`);
  status.textContent = `已打开作品：${artworks[index].title}`;

  if (!window.gsap || reduceMotion) {
    detailPage.style.opacity = "1";
    return;
  }

  const sourceImage = source.querySelector(".work__image");
  const rect = sourceImage.getBoundingClientRect();
  const clone = sourceImage.cloneNode();
  Object.assign(clone.style, {
    position: "fixed",
    zIndex: 130,
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    objectFit: "contain",
    transform: "none",
    pointerEvents: "none",
    margin: 0,
  });
  document.body.appendChild(clone);
  const target = detailArt.getBoundingClientRect();
  gsap.set(detailPage, { autoAlpha: 1 });
  gsap.set([".chat-panel", ".detail-close", detailImage], { autoAlpha: 0 });
  gsap.timeline({ defaults: { ease: "power4.inOut" } })
    .to(clone, { left: target.left, top: target.top, width: target.width, height: target.height, duration: .95 })
    .set(detailImage, { autoAlpha: 1 })
    .set(clone, { display: "none" })
    .to(".chat-panel", { autoAlpha: 1, duration: .5, ease: "power2.out" }, "-=.2")
    .from(".art-heading > *", { y: 18, autoAlpha: 0, stagger: .05, duration: .55, ease: "power3.out" }, "-=.4")
    .to(".detail-close", { autoAlpha: 1, duration: .3 }, "-=.3")
    .add(() => clone.remove());
}

function closeDetail({ fromHistory = false } = {}) {
  if (detailPage.getAttribute("aria-hidden") === "true") return;
  if (!fromHistory) history.pushState({}, "", "#index");
  status.textContent = "已返回画廊";
  resetZoom();

  const done = () => {
    detailPage.setAttribute("aria-hidden", "true");
    detailPage.style.opacity = "";
    document.body.classList.remove("detail-open");
    window.scrollTo(0, returnScroll);
  };
  if (!window.gsap || reduceMotion) return done();
  gsap.timeline({ onComplete: done })
    .to([".chat-panel", ".detail-close"], { autoAlpha: 0, y: 12, duration: .25, ease: "power2.in" })
    .to(detailPage, { autoAlpha: 0, duration: .48, ease: "power3.inOut" }, "-=.02");
}

function appendMessage(role, text, extraClass = "") {
  const article = document.createElement("article");
  article.className = `message ${role} ${extraClass}`.trim();
  article.innerHTML = `<small>${role === "user" ? "YOU / 观看者" : "CANVIUM / 作品导览"}</small><p>${text}</p>`;
  messages.appendChild(article);
  messages.scrollTo({ top: messages.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  return article;
}

function answerFor(question) {
  const art = artworks[currentArtwork];
  if (/细节|detail/i.test(question)) {
    return `看画面边缘最薄的笔触，再回到中心。《${art.title}》的空间感往往不是由轮廓，而是由颜色相遇时的速度建立起来的。`;
  }
  if (/开始|start/i.test(question)) {
    return `可以从对比最弱的区域开始，停留几秒后再寻找最亮或最密集的位置。这样会更接近${art.artist}安排观看节奏的方式。`;
  }
  return `把你的问题放回《${art.title}》里，可以先记住一个事实：${art.description} 你最先注意到的颜色或形状是什么？`;
}

function sendQuestion(text) {
  const value = text.trim();
  if (!value) return;
  appendMessage("user", value);
  const thinking = appendMessage("assistant", "正在沿着画面的线索思考", "thinking");
  document.querySelector("#chatInput").value = "";
  setTimeout(() => {
    thinking.remove();
    appendMessage("assistant", answerFor(value));
  }, reduceMotion ? 0 : 650);
}

function resetZoom() {
  isZoomed = false;
  dragging = false;
  imageOffset = { x: 0, y: 0 };
  detailArt.classList.remove("is-zoomed");
  document.querySelector("#zoomToggle").textContent = "ZOOM +";
  document.querySelector("#zoomReadout").textContent = "100%";
  if (window.gsap) gsap.set(detailImage, { scale: 1, x: 0, y: 0 });
}

function toggleZoom() {
  isZoomed = !isZoomed;
  detailArt.classList.toggle("is-zoomed", isZoomed);
  document.querySelector("#zoomToggle").textContent = isZoomed ? "RESET" : "ZOOM +";
  document.querySelector("#zoomReadout").textContent = isZoomed ? "180%" : "100%";
  imageOffset = { x: 0, y: 0 };
  if (window.gsap) gsap.to(detailImage, { scale: isZoomed ? 1.8 : 1, x: 0, y: 0, duration: .65, ease: "power3.inOut" });
}

function showCursor() {
  if (window.gsap) gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: .3 });
}

function hideCursor() {
  if (window.gsap) gsap.to(cursor, { autoAlpha: 0, scale: .3, duration: .22 });
}

document.querySelector("#detailClose").addEventListener("click", () => closeDetail());
document.querySelector("#zoomToggle").addEventListener("click", toggleZoom);
detailArt.addEventListener("dblclick", toggleZoom);
detailArt.addEventListener("pointerdown", (event) => {
  if (!isZoomed) return;
  dragging = true;
  dragOrigin = { x: event.clientX - imageOffset.x, y: event.clientY - imageOffset.y };
  detailArt.setPointerCapture(event.pointerId);
});
detailArt.addEventListener("pointermove", (event) => {
  if (!dragging || !isZoomed) return;
  imageOffset.x = Math.max(-220, Math.min(220, event.clientX - dragOrigin.x));
  imageOffset.y = Math.max(-180, Math.min(180, event.clientY - dragOrigin.y));
  if (window.gsap) gsap.to(detailImage, { x: imageOffset.x, y: imageOffset.y, duration: .22, overwrite: "auto" });
});
detailArt.addEventListener("pointerup", () => { dragging = false; });

document.querySelector("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  sendQuestion(document.querySelector("#chatInput").value);
});
document.querySelectorAll(".prompt-chips button").forEach((chip) => chip.addEventListener("click", () => sendQuestion(chip.textContent)));
document.querySelectorAll("[data-open-chat]").forEach((button) => button.addEventListener("click", () => {
  const visible = [...document.querySelectorAll(".work")].find((work) => {
    const rect = work.getBoundingClientRect();
    return rect.top < innerHeight * .75 && rect.bottom > innerHeight * .25;
  }) || document.querySelector(".work");
  openDetail(Number(visible.dataset.art), visible);
}));
document.querySelector("[data-scroll-top]").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

window.addEventListener("mousemove", (event) => {
  if (window.gsap) gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: .28, ease: "power3.out", overwrite: "auto" });
});
window.addEventListener("popstate", () => {
  if (!location.hash.startsWith("#work-")) closeDetail({ fromHistory: true });
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDetail();
});

buildGrid();
boot();

if (location.hash.startsWith("#work-")) {
  const id = location.hash.replace("#work-", "");
  const index = Math.max(0, artworks.findIndex((art) => art.id === id));
  requestAnimationFrame(() => {
    populateDetail(index);
    detailPage.setAttribute("aria-hidden", "false");
    detailPage.style.opacity = "1";
    document.body.classList.add("detail-open");
  });
}
