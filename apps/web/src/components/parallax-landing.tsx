"use client";

/* eslint-disable @next/next/no-img-element */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import styles from "@/src/components/parallax-landing.module.css";
import { navigateWithCurtain } from "@/src/components/route-curtain";
import type { Locale } from "@/src/i18n/locales";
import { createWheelBoundaryIntent } from "@/src/lib/wheel-boundary-intent";

gsap.registerPlugin(useGSAP);

type ParallaxLayer = {
  src: string;
  depth: "background" | "rear" | "middle" | "foreground" | "product";
  pointerX: number;
  pointerY: number;
  scrollY: number;
  scale: number;
};

const layers: ParallaxLayer[] = [
  {
    src: "/parallax/0-background.png",
    depth: "background",
    pointerX: 2,
    pointerY: 1.5,
    scrollY: 0,
    scale: 1.02,
  },
  {
    src: "/parallax/1.png",
    depth: "rear",
    pointerX: 5,
    pointerY: 3.5,
    scrollY: -4,
    scale: 1.028,
  },
  {
    src: "/parallax/2.png",
    depth: "rear",
    pointerX: 6,
    pointerY: 4,
    scrollY: -6,
    scale: 1.032,
  },
  {
    src: "/parallax/3.png",
    depth: "middle",
    pointerX: 11,
    pointerY: 7,
    scrollY: -12,
    scale: 1.043,
  },
  {
    src: "/parallax/4.png",
    depth: "middle",
    pointerX: 9,
    pointerY: 6,
    scrollY: -9,
    scale: 1.038,
  },
  {
    src: "/parallax/5.png",
    depth: "middle",
    pointerX: 8,
    pointerY: 5.5,
    scrollY: -8,
    scale: 1.036,
  },
  {
    src: "/parallax/6.png",
    depth: "middle",
    pointerX: 10,
    pointerY: 6.5,
    scrollY: -11,
    scale: 1.041,
  },
  {
    src: "/parallax/7.png",
    depth: "foreground",
    pointerX: 13,
    pointerY: 8.5,
    scrollY: -15,
    scale: 1.049,
  },
  {
    src: "/parallax/8-furniture.png",
    depth: "foreground",
    pointerX: 6,
    pointerY: 4,
    scrollY: -6,
    scale: 1.032,
  },
  {
    src: "/parallax/9-laptop.png",
    depth: "product",
    pointerX: 6,
    pointerY: 4,
    scrollY: -6,
    scale: 1.032,
  },
];

const particleCount = 18;
const collectionSlug = "art-institute-of-chicago";
const entryScrollEnd = 0.82;
const handoffStart = 0.86;
const videoTailScale = 1.1;

type StageStyle = React.CSSProperties & {
  "--hint-opacity": number;
};

type LayerStyle = React.CSSProperties & {
  "--layer-index": number;
};

type ParticleStyle = React.CSSProperties & {
  "--particle-delay": string;
  "--particle-duration": string;
  "--particle-left": string;
  "--particle-top": string;
};

export function ParallaxLanding({ locale }: { locale: Locale }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const entryVideo = useRef<HTMLVideoElement>(null);
  const showEntryFallback = useRef<() => void>(() => undefined);
  const enterCollection = useRef<() => void>(() => undefined);
  const transitioning = useRef(false);
  const collectionHref = `/${locale}/museums/${collectionSlug}/collection`;
  const zh = locale === "zh";

  useEffect(() => {
    router.prefetch(collectionHref);
  }, [collectionHref, router]);

  useGSAP(
    (_, contextSafe) => {
      const rootNode = root.current;
      const stageNode = stage.current;
      const videoNode = entryVideo.current;
      if (!rootNode || !stageNode || !videoNode) return;

      document.body.classList.add("parallax-home-active");
      const layerNodes = gsap.utils.toArray<HTMLElement>("[data-parallax-index]");
      const sceneNode = stageNode.querySelector<HTMLElement>(`.${styles.scene}`);
      const brandNode = stageNode.querySelector<HTMLElement>(`.${styles.brand}`);
      const brandLockupNode = stageNode.querySelector<HTMLElement>(`.${styles.brandLockup}`);
      const glowNode = stageNode.querySelector<HTMLElement>(`.${styles.computerGlow}`);
      const promptNode = stageNode.querySelector<HTMLElement>(`.${styles.entryPrompt}`);
      const computerEntryNode = stageNode.querySelector<HTMLButtonElement>(
        `.${styles.computerEntry}`,
      );
      if (!sceneNode || !brandNode || !brandLockupNode || !computerEntryNode) return;

      let pointerX = 0;
      let pointerY = 0;
      let scrollProgress = 0;
      let sceneReadyAt = Number.POSITIVE_INFINITY;
      let videoDuration = videoNode.duration || 5.088;
      let sceneEntered = false;
      let glowPulse: gsap.core.Tween | null = null;
      const entryPlayhead = { progress: 0 };
      const handoffEase = gsap.parseEase("power2.inOut");
      const revealEase = gsap.parseEase("power1.inOut");
      let targetEntryProgress = -1;
      let queuedVideoTime: number | null = null;
      let videoSeekFrame = 0;
      const subjectScaleBoost = 1.035;
      const subjectOffsetY = () => 50 + Math.min(50, window.innerHeight * 0.044);

      const xSetters = layerNodes.map((node) =>
        gsap.quickTo(node, "x", { duration: 0.72, ease: "power3.out" }),
      );
      const ySetters = layerNodes.map((node) =>
        gsap.quickTo(node, "y", { duration: 0.72, ease: "power3.out" }),
      );
      const brandX = gsap.quickTo(brandNode, "x", { duration: 0.9, ease: "power3.out" });
      const brandY = gsap.quickTo(brandNode, "y", { duration: 0.9, ease: "power3.out" });

      gsap.set(layerNodes, {
        scale: (_, node) => {
          const layerIndex = Number((node as HTMLElement).dataset.parallaxIndex);
          const layerScale = layers[layerIndex]?.scale ?? 1;
          return layerIndex === 0 ? layerScale : layerScale * subjectScaleBoost;
        },
        transformOrigin: "50% 50%",
      });
      gsap.set(glowNode, { xPercent: -50, yPercent: -4 });

      const brandReveal = gsap.timeline({ paused: true });
      brandReveal.fromTo(
        brandLockupNode,
        { autoAlpha: 0, y: 190 },
        { autoAlpha: 1, y: 0, duration: 1.8, ease: "power2.inOut" },
        0.65,
      );

      const setEntryAvailable = (available: boolean) => {
        computerEntryNode.disabled = !available;
        computerEntryNode.tabIndex = available ? 0 : -1;
        stageNode.dataset.entered = String(available);
      };

      const setGlowPulseActive = (active: boolean) => {
        if (!glowPulse) return;
        if (active) {
          if (!glowPulse.isActive()) glowPulse.play();
          return;
        }
        glowPulse.pause(0);
      };

      const flushVideoSeek = () => {
        videoSeekFrame = 0;
        if (
          queuedVideoTime === null ||
          videoNode.seeking ||
          videoNode.readyState < HTMLMediaElement.HAVE_METADATA
        )
          return;

        const targetTime = queuedVideoTime;
        queuedVideoTime = null;
        if (Math.abs(videoNode.currentTime - targetTime) > 1 / 30) {
          videoNode.currentTime = targetTime;
        }
      };

      const queueVideoSeek = (targetTime: number) => {
        queuedVideoTime = targetTime;
        if (!videoSeekFrame) videoSeekFrame = window.requestAnimationFrame(flushVideoSeek);
      };

      const onVideoSeeked = () => {
        if (queuedVideoTime !== null && !videoSeekFrame) {
          videoSeekFrame = window.requestAnimationFrame(flushVideoSeek);
        }
      };

      const renderEntry = (progress: number) => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const videoFailed = stageNode.dataset.videoFailed === "true";

        if (reduceMotion || videoFailed) {
          queuedVideoTime = null;
          if (videoSeekFrame) {
            window.cancelAnimationFrame(videoSeekFrame);
            videoSeekFrame = 0;
          }
          gsap.set(videoNode, { autoAlpha: 0 });
          gsap.set(sceneNode, { autoAlpha: 1, scale: 1 });
          gsap.set(glowNode, { opacity: 0.72, scale: 1 });
          if (!sceneEntered) {
            sceneReadyAt = performance.now() + 500;
            if (reduceMotion) brandReveal.progress(1);
            else brandReveal.restart();
          }
          sceneEntered = true;
          setEntryAvailable(true);
          setGlowPulseActive(!reduceMotion);
          return;
        }

        if (videoNode.readyState >= HTMLMediaElement.HAVE_METADATA) {
          const targetTime = progress * Math.max(0, videoDuration - 0.05);
          queueVideoSeek(targetTime);
        }

        const handoff = gsap.utils.clamp(0, 1, (progress - handoffStart) / (1 - handoffStart));
        const easedHandoff = handoffEase(handoff);
        const sceneReveal = gsap.utils.clamp(0, 1, (handoff - 0.72) / 0.28);
        const easedReveal = revealEase(sceneReveal);
        const entered = progress > 0.997;

        gsap.set(videoNode, {
          autoAlpha: 1 - easedReveal,
          scale: 1 + easedHandoff * (videoTailScale - 1),
        });
        gsap.set(sceneNode, {
          autoAlpha: easedReveal,
          scale: videoTailScale - easedReveal * (videoTailScale - 1),
        });
        gsap.set(glowNode, {
          opacity: entered ? 0.64 : 0,
          scale: entered ? 1 : 0.86,
        });

        if (entered !== sceneEntered) {
          sceneEntered = entered;
          sceneReadyAt = entered ? performance.now() + 700 : Number.POSITIVE_INFINITY;
          if (entered) brandReveal.restart();
          else brandReveal.pause(0);
          setEntryAvailable(entered);
          setGlowPulseActive(entered);
        }
      };

      const entryProgressTo = gsap.quickTo(entryPlayhead, "progress", {
        duration: 0.24,
        ease: "power1.out",
        onUpdate: () => renderEntry(entryPlayhead.progress),
      });

      const showFallback = () => {
        stageNode.dataset.videoFailed = "true";
        renderEntry(1);
      };
      showEntryFallback.current = showFallback;

      const renderParallax = () => {
        layerNodes.forEach((node, index) => {
          const layerIndex = Number(node.dataset.parallaxIndex);
          const layer = layers[layerIndex];
          if (!layer) return;
          xSetters[index]?.(-pointerX * layer.pointerX);
          ySetters[index]?.(
            (layerIndex === 0 ? 0 : subjectOffsetY()) -
              pointerY * layer.pointerY +
              scrollProgress * layer.scrollY,
          );
        });
        brandX(-pointerX * 3.5);
        brandY(-pointerY * 2.5 + scrollProgress * -2);
      };

      const runTransition = () => {
        if (transitioning.current || stageNode.dataset.entered !== "true") return;
        transitioning.current = true;
        stageNode.dataset.transitioning = "true";
        stageNode.setAttribute("aria-busy", "true");

        navigateWithCurtain({ href: collectionHref });
      };
      const beginTransition = contextSafe?.(runTransition) ?? runTransition;
      enterCollection.current = beginTransition;
      computerEntryNode.addEventListener("click", beginTransition);

      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 721px) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (mediaContext) => {
          const { desktop, reduceMotion } = mediaContext.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set([glowNode, promptNode, ...layerNodes], { autoAlpha: 1 });
            renderEntry(1);
            return;
          }

          gsap.set(sceneNode, { autoAlpha: 0, scale: videoTailScale });
          gsap.set(glowNode, { opacity: 0, scale: 0.86 });
          setEntryAvailable(false);

          if (!desktop) return;
          glowPulse = gsap.to(glowNode, {
            opacity: 0.78,
            scale: 1.025,
            duration: 3.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          });

          return () => {
            glowPulse = null;
          };
        },
        rootNode,
      );

      const updateScroll = () => {
        if (transitioning.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          scrollProgress = 0;
        } else {
          const distance = Math.max(1, rootNode.offsetHeight - window.innerHeight);
          scrollProgress = gsap.utils.clamp(0, 1, (window.scrollY - rootNode.offsetTop) / distance);
        }
        const entryProgress = gsap.utils.clamp(0, 1, scrollProgress / entryScrollEnd);
        const sceneProgress = gsap.utils.clamp(
          0,
          1,
          (scrollProgress - entryScrollEnd) / (1 - entryScrollEnd),
        );
        if (Math.abs(entryProgress - targetEntryProgress) > 0.0001) {
          targetEntryProgress = entryProgress;
          entryProgressTo(entryProgress);
        }
        stageNode.style.setProperty(
          "--hint-opacity",
          String(Math.max(0, 1 - scrollProgress * 2.4)),
        );
        stageNode.dataset.settled = sceneEntered && sceneProgress > 0.5 ? "true" : "false";
        scrollProgress = sceneProgress;
        renderParallax();
      };

      const updatePointer = (event: PointerEvent) => {
        if (
          !sceneEntered ||
          !window.matchMedia("(pointer: fine)").matches ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
        renderParallax();
      };

      const resetPointer = () => {
        pointerX = 0;
        pointerY = 0;
        renderParallax();
      };

      const onWheel = createWheelBoundaryIntent({
        atBoundary: () =>
          sceneEntered &&
          performance.now() >= sceneReadyAt &&
          scrollProgress > 0.985 &&
          window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3,
        direction: "down",
        onIntent: beginTransition,
      });

      const onVideoMetadata = () => {
        videoDuration = videoNode.duration || videoDuration;
        stageNode.dataset.videoReady = "true";
        renderEntry(entryPlayhead.progress);
      };

      const onVideoError = () => {
        showFallback();
      };

      updateScroll();
      videoNode.addEventListener("loadedmetadata", onVideoMetadata);
      videoNode.addEventListener("error", onVideoError);
      videoNode.addEventListener("seeked", onVideoSeeked);
      if (videoNode.error || stageNode.dataset.videoFailed === "true") showFallback();
      window.addEventListener("scroll", updateScroll, { passive: true });
      window.addEventListener("resize", updateScroll);
      window.addEventListener("pointermove", updatePointer, { passive: true });
      window.addEventListener("wheel", onWheel, { passive: false, capture: true });
      document.documentElement.addEventListener("mouseleave", resetPointer);

      return () => {
        media.revert();
        entryProgressTo.tween.kill();
        document.body.classList.remove("parallax-home-active");
        videoNode.removeEventListener("loadedmetadata", onVideoMetadata);
        videoNode.removeEventListener("error", onVideoError);
        videoNode.removeEventListener("seeked", onVideoSeeked);
        if (videoSeekFrame) window.cancelAnimationFrame(videoSeekFrame);
        window.removeEventListener("scroll", updateScroll);
        window.removeEventListener("resize", updateScroll);
        window.removeEventListener("pointermove", updatePointer);
        window.removeEventListener("wheel", onWheel, { capture: true });
        document.documentElement.removeEventListener("mouseleave", resetPointer);
        computerEntryNode.removeEventListener("click", beginTransition);
        showEntryFallback.current = () => undefined;
        enterCollection.current = () => undefined;
      };
    },
    { scope: root, dependencies: [collectionHref], revertOnUpdate: true },
  );

  const setComputerActive = (active: boolean) => {
    if (stage.current) stage.current.dataset.computerActive = String(active);
  };

  return (
    <main className={`${styles.root} parallax-home-root`} ref={root}>
      <h1 className="sr-only">Canvium Gallery</h1>
      <div
        aria-label={
          zh
            ? "镜头穿过美术馆中的画框，进入八位艺术家围坐在 Canvium 电脑旁的场景。"
            : "The camera passes through a museum frame into a scene of eight artists gathered around a Canvium computer."
        }
        className={styles.stage}
        ref={stage}
        role="region"
        style={{ "--hint-opacity": 1 } as StageStyle}
      >
        <video
          aria-hidden="true"
          className={styles.entryVideo}
          muted
          onError={() => {
            if (stage.current) stage.current.dataset.videoFailed = "true";
            showEntryFallback.current();
          }}
          playsInline
          poster="/entrance/enter-painting-poster.png"
          preload="auto"
          ref={entryVideo}
          src="/entrance/enter-painting-scrub.mp4"
        />

        <div aria-hidden="true" className={styles.scene}>
          {layers.slice(0, 8).map((layer, index) => (
            <img
              alt=""
              className={`${styles.layer} ${styles[`depth${layer.depth}`]}`}
              data-parallax-index={index}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              key={layer.src}
              loading="eager"
              src={layer.src}
              style={
                {
                  "--layer-index": index === 0 ? 0 : index === 3 || index === 7 ? 14 : index + 4,
                } as LayerStyle
              }
            />
          ))}

          <div className={styles.brand}>
            <div className={styles.brandLockup}>
              <div className={styles.brandType}>
                <span>CANVIUM</span>
                <em>Gallery</em>
              </div>
            </div>
          </div>

          <img
            alt=""
            className={`${styles.layer} ${styles.chairLeft}`}
            data-parallax-index="8"
            decoding="async"
            loading="eager"
            src="/parallax/8-furniture.png"
          />
          <img
            alt=""
            className={`${styles.layer} ${styles.chairRight}`}
            data-parallax-index="8"
            decoding="async"
            loading="eager"
            src="/parallax/8-furniture.png"
          />
          <img
            alt=""
            className={`${styles.layer} ${styles.tableSurface}`}
            data-parallax-index="8"
            decoding="async"
            loading="eager"
            src="/parallax/8-furniture.png"
          />

          <div className={styles.contactShadows} data-parallax-index="8">
            <span className={styles.shadowLeftArm} />
            <span className={styles.shadowCenterHands} />
            <span className={styles.shadowRightArm} />
            <span className={styles.shadowLaptopSoft} />
            <span className={styles.shadowLaptopContact} />
          </div>

          <img
            alt=""
            className={`${styles.layer} ${styles.tableFront}`}
            data-parallax-index="8"
            decoding="async"
            loading="eager"
            src="/parallax/8-furniture.png"
          />
          <img
            alt=""
            className={`${styles.layer} ${styles.laptop}`}
            data-parallax-index="9"
            decoding="async"
            loading="eager"
            src="/parallax/9-laptop.png"
          />

          <div className={styles.lightField} data-parallax-index="8">
            <span className={styles.tableReflection} />
            <span className={styles.computerGlow} />
          </div>

          <div className={styles.particles}>
            {Array.from({ length: particleCount }, (_, index) => (
              <i
                key={index}
                style={
                  {
                    "--particle-delay": `${-(index * 0.73)}s`,
                    "--particle-duration": `${5.8 + (index % 5) * 0.8}s`,
                    "--particle-left": `${42 + ((index * 17) % 19)}%`,
                    "--particle-top": `${43 + ((index * 23) % 25)}%`,
                  } as ParticleStyle
                }
              />
            ))}
          </div>
          <span className={styles.texture} />
        </div>

        <button
          aria-label={zh ? "进入 Canvium 数字馆藏" : "Enter the Canvium digital collection"}
          className={styles.computerEntry}
          disabled
          onBlur={() => setComputerActive(false)}
          onClick={() => enterCollection.current()}
          onFocus={() => setComputerActive(true)}
          onPointerEnter={() => setComputerActive(true)}
          onPointerLeave={() => setComputerActive(false)}
          type="button"
        >
          <span className={styles.entryPrompt}>
            <b>{zh ? "进入馆藏" : "Enter collection"}</b>
            <i aria-hidden="true">↗</i>
          </span>
        </button>

        <p aria-hidden="true" className={styles.hint}>
          <span>{zh ? "移动鼠标 · 向下探索" : "Move to explore · Scroll to enter"}</span>
          <i />
        </p>
      </div>
    </main>
  );
}
