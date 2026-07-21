"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type MuseumNode = {
  id: string;
  name: string;
  officialName: string;
  lat: number;
  lng: number;
  status: "today" | "open" | "soon";
};

type GlobeControls = {
  autoRotate: boolean;
  enablePan: boolean;
  enableZoom: boolean;
  minPolarAngle: number;
  maxPolarAngle: number;
};

type GlobeInstance = {
  width: (value: number) => GlobeInstance;
  height: (value: number) => GlobeInstance;
  backgroundColor: (value: string) => GlobeInstance;
  globeImageUrl: (value: string) => GlobeInstance;
  bumpImageUrl: (value: string) => GlobeInstance;
  showAtmosphere: (value: boolean) => GlobeInstance;
  atmosphereColor: (value: string) => GlobeInstance;
  atmosphereAltitude: (value: number) => GlobeInstance;
  htmlElementsData: (value: MuseumNode[]) => GlobeInstance;
  htmlLat: (value: string) => GlobeInstance;
  htmlLng: (value: string) => GlobeInstance;
  htmlAltitude: (value: number) => GlobeInstance;
  htmlElement: (factory: (node: MuseumNode) => HTMLElement) => GlobeInstance;
  pointOfView: (value: { lat: number; lng: number; altitude: number }, duration?: number) => void;
  controls: () => GlobeControls;
  renderer: () => { setPixelRatio: (value: number) => void };
  _destructor?: () => void;
};

const museums: MuseumNode[] = [
  {
    id: "artic",
    name: "芝加哥艺术博物馆",
    officialName: "Art Institute of Chicago",
    lat: 41.8796,
    lng: -87.6237,
    status: "today",
  },
  {
    id: "met",
    name: "大都会艺术博物馆",
    officialName: "The Metropolitan Museum of Art",
    lat: 40.7794,
    lng: -73.9632,
    status: "open",
  },
  {
    id: "cleveland",
    name: "克利夫兰艺术博物馆",
    officialName: "Cleveland Museum of Art",
    lat: 41.5089,
    lng: -81.6116,
    status: "open",
  },
  {
    id: "moma",
    name: "纽约现代艺术博物馆",
    officialName: "The Museum of Modern Art",
    lat: 40.7614,
    lng: -73.9776,
    status: "soon",
  },
  {
    id: "getty",
    name: "盖蒂中心",
    officialName: "Getty Center",
    lat: 34.078,
    lng: -118.474,
    status: "soon",
  },
  {
    id: "sfmoma",
    name: "旧金山现代艺术博物馆",
    officialName: "SFMOMA",
    lat: 37.7857,
    lng: -122.4011,
    status: "soon",
  },
  {
    id: "louvre",
    name: "卢浮宫博物馆",
    officialName: "Musée du Louvre",
    lat: 48.8606,
    lng: 2.3376,
    status: "soon",
  },
  {
    id: "orsay",
    name: "奥赛博物馆",
    officialName: "Musée d’Orsay",
    lat: 48.86,
    lng: 2.3266,
    status: "soon",
  },
  {
    id: "national-gallery",
    name: "英国国家美术馆",
    officialName: "The National Gallery",
    lat: 51.5089,
    lng: -0.1283,
    status: "soon",
  },
  {
    id: "prado",
    name: "普拉多国家博物馆",
    officialName: "Museo Nacional del Prado",
    lat: 40.4138,
    lng: -3.6921,
    status: "soon",
  },
  {
    id: "uffizi",
    name: "乌菲齐美术馆",
    officialName: "Gallerie degli Uffizi",
    lat: 43.7678,
    lng: 11.2553,
    status: "soon",
  },
  {
    id: "rijksmuseum",
    name: "荷兰国立博物馆",
    officialName: "Rijksmuseum",
    lat: 52.36,
    lng: 4.8852,
    status: "soon",
  },
  {
    id: "palace",
    name: "故宫博物院",
    officialName: "The Palace Museum",
    lat: 39.9163,
    lng: 116.3972,
    status: "soon",
  },
  {
    id: "shanghai",
    name: "上海博物馆",
    officialName: "Shanghai Museum",
    lat: 31.2303,
    lng: 121.4706,
    status: "soon",
  },
  {
    id: "mplus",
    name: "M+ 博物馆",
    officialName: "M+",
    lat: 22.3001,
    lng: 114.1597,
    status: "soon",
  },
  {
    id: "tokyo-national",
    name: "东京国立博物馆",
    officialName: "Tokyo National Museum",
    lat: 35.7188,
    lng: 139.7765,
    status: "soon",
  },
  {
    id: "national-korea",
    name: "韩国国立中央博物馆",
    officialName: "National Museum of Korea",
    lat: 37.5239,
    lng: 126.9802,
    status: "soon",
  },
  {
    id: "national-singapore",
    name: "新加坡国家美术馆",
    officialName: "National Gallery Singapore",
    lat: 1.2903,
    lng: 103.8516,
    status: "soon",
  },
];

export function MuseumGlobe({ compact = false }: { compact?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance>(null);
  const keyboardLongitudeRef = useRef(-72);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    const GlobeFactory = (
      window as unknown as { Globe?: () => (element: HTMLElement) => GlobeInstance }
    ).Globe;
    if (!host || !scriptReady || typeof GlobeFactory !== "function") return;

    host.replaceChildren();
    let globe: GlobeInstance | undefined;
    try {
      const size = Math.max(host.clientWidth, 360);
      globe = GlobeFactory()(host)
        .width(size)
        .height(size)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("/vendor/globe/earth-dark.jpg")
        .bumpImageUrl("/vendor/globe/earth-topology.png")
        .showAtmosphere(true)
        .atmosphereColor("#a7aaa7")
        .atmosphereAltitude(0.08)
        .htmlElementsData(museums)
        .htmlLat("lat")
        .htmlLng("lng")
        .htmlAltitude(0.012)
        .htmlElement((node) => {
          const marker = document.createElement("button");
          marker.type = "button";
          marker.className = `globe-marker ${node.status}${node.id === "artic" ? " selected" : ""}`;
          marker.title = node.name;
          marker.innerHTML = `<span class="globe-marker-callout"><span class="globe-marker-dot" aria-hidden="true"></span><span class="globe-marker-label">${node.name}<small>${node.officialName}</small></span></span>`;
          marker.addEventListener("pointerdown", (event) => event.stopPropagation());
          marker.addEventListener("click", (event) => {
            event.stopPropagation();
            host
              .querySelectorAll(".globe-marker")
              .forEach((item) => item.classList.remove("selected"));
            marker.classList.add("selected");
            globe?.pointOfView({ lat: node.lat, lng: node.lng, altitude: 1.72 }, 760);
          });
          return marker;
        });
      globe.pointOfView({ lat: 30, lng: -72, altitude: compact ? 1.58 : 1.72 }, 0);
      const sharedGlobeScale = root?.closest(".shared-globe")
        ? window.innerWidth < 720
          ? 1
          : Math.max(window.innerWidth * 2, 2200) / 900
        : 1;
      globe
        .renderer()
        .setPixelRatio(Math.min(3.25, Math.max(window.devicePixelRatio || 1, sharedGlobeScale)));
      globeRef.current = globe;
      const controls = globe.controls();
      controls.autoRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.minPolarAngle = 0.35;
      controls.maxPolarAngle = Math.PI - 0.35;
      root?.classList.add("is-webgl-ready");

      const observer = new ResizeObserver(([entry]) => {
        const next = Math.max(Math.round(entry.contentRect.width), 360);
        globe?.width(next).height(next);
      });
      observer.observe(host);
      return () => {
        observer.disconnect();
        globe?._destructor?.();
        globeRef.current = null;
        host.replaceChildren();
        root?.classList.remove("is-webgl-ready");
      };
    } catch {
      root?.classList.remove("is-webgl-ready");
    }
  }, [compact, scriptReady]);

  return (
    <div
      aria-label="可拖动的真实地球，定位芝加哥艺术博物馆"
      className={compact ? "museum-globe museum-globe-compact" : "museum-globe"}
      onKeyDown={(event) => {
        if (compact || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        keyboardLongitudeRef.current += event.key === "ArrowLeft" ? -12 : 12;
        globeRef.current?.pointOfView(
          { lat: 30, lng: keyboardLongitudeRef.current, altitude: 1.72 },
          260,
        );
      }}
      ref={rootRef}
      role="img"
      tabIndex={compact ? -1 : 0}
    >
      <Script
        onError={() => rootRef.current?.classList.remove("is-webgl-ready")}
        onReady={() => setScriptReady(true)}
        src="/vendor/globe/globe.gl.min.js"
        strategy="afterInteractive"
      />
      <div className="globe-surface" aria-hidden="true">
        <div className="globe-grid" />
        <span className="globe-land land-north-america" />
        <span className="globe-land land-south-america" />
        <span className="globe-land land-europe" />
        <span className="globe-land land-africa" />
        <span className="globe-land land-asia" />
      </div>
      <div className="webgl-globe" ref={hostRef} />
    </div>
  );
}
