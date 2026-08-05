import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  navigateWithCurtain: vi.fn(),
  prefetch: vi.fn(),
  signalRouteCurtainReady: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: navigation.prefetch }),
}));

vi.mock("@/src/components/demo-styles", () => ({
  DemoStyles: () => null,
}));

vi.mock("@/src/components/museum-globe", () => ({
  MuseumGlobe: () => <div id="globe" />,
}));

vi.mock("@/src/components/route-curtain", () => ({
  navigateWithCurtain: navigation.navigateWithCurtain,
  signalRouteCurtainReady: navigation.signalRouteCurtainReady,
}));

import { CollectionRouteReady } from "@/src/components/collection-route-ready";
import { DemoLanding } from "@/src/components/demo-landing";

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("trackpad navigation", () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    navigation.navigateWithCurtain.mockReset();
    navigation.prefetch.mockReset();
    navigation.signalRouteCurtainReady.mockReset();
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal("scrollTo", vi.fn());
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1_000 });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1_700,
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 700,
      height: 700,
      left: 0,
      right: 700,
      toJSON: () => ({}),
      top: 0,
      width: 700,
      x: 0,
      y: 0,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("ignores arrival momentum and requires a fresh downward gesture at the museum boundary", () => {
    render(<DemoLanding locale="zh" />);

    now = 80;
    const arrivalMomentum = new WheelEvent("wheel", {
      cancelable: true,
      deltaY: 1_000,
    });
    act(() => {
      window.dispatchEvent(arrivalMomentum);
    });
    expect(arrivalMomentum.defaultPrevented).toBe(false);
    expect(navigation.navigateWithCurtain).not.toHaveBeenCalled();

    now = 180;
    act(() => {
      window.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 400 }));
    });
    expect(navigation.navigateWithCurtain).not.toHaveBeenCalled();

    now = 560;
    const deliberateGestureStart = new WheelEvent("wheel", {
      cancelable: true,
      deltaY: 60,
    });
    act(() => {
      window.dispatchEvent(deliberateGestureStart);
    });
    expect(deliberateGestureStart.defaultPrevented).toBe(true);
    expect(navigation.navigateWithCurtain).not.toHaveBeenCalled();

    now = 610;
    act(() => {
      window.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 70 }));
    });
    expect(navigation.navigateWithCurtain).toHaveBeenCalledWith({
      href: "/zh/museums/art-institute-of-chicago/collection",
    });
  });

  it("keeps the explicit collection button as a direct route", () => {
    render(<DemoLanding locale="zh" />);

    fireEvent.click(screen.getByRole("button", { name: /探索馆藏/u }));
    expect(navigation.navigateWithCurtain).toHaveBeenCalledWith({
      href: "/zh/museums/art-institute-of-chicago/collection",
    });
  });

  it("requires a fresh upward gesture before returning from the collection top", () => {
    render(
      <div data-floating-collection-root="" data-route-exit-ready="true" data-view-mode="floating">
        <CollectionRouteReady locale="zh" />
      </div>,
    );

    now = 80;
    const arrivalMomentum = new WheelEvent("wheel", {
      cancelable: true,
      deltaY: -1_000,
    });
    act(() => {
      window.dispatchEvent(arrivalMomentum);
    });
    expect(arrivalMomentum.defaultPrevented).toBe(false);
    expect(navigation.navigateWithCurtain).not.toHaveBeenCalled();

    now = 500;
    act(() => {
      window.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: -60 }));
    });
    now = 550;
    act(() => {
      window.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: -70 }));
    });

    expect(navigation.navigateWithCurtain).toHaveBeenCalledWith({
      href: "/zh#museum",
      replace: true,
      scroll: false,
    });
    expect(navigation.signalRouteCurtainReady).toHaveBeenCalledOnce();
  });

  it("does not leave the collection while the grid owns the wheel gesture", () => {
    render(
      <div data-floating-collection-root="" data-route-exit-ready="false" data-view-mode="grid">
        <CollectionRouteReady locale="zh" />
      </div>,
    );

    now = 500;
    act(() => {
      window.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: -240 }));
    });

    expect(navigation.navigateWithCurtain).not.toHaveBeenCalled();
  });
});
