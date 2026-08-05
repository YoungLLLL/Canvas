import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  navigateWithCurtain,
  RouteCurtain,
  signalRouteCurtainReady,
} from "@/src/components/route-curtain";

const navigation = vi.hoisted(() => {
  const push = vi.fn();
  return {
    pathname: "/en",
    push,
    router: { push, replace: vi.fn() },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation.router,
}));

describe("route curtain completion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigation.pathname = "/en";
    navigation.push.mockClear();
    navigation.router.replace.mockClear();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("collection-transitioning");
  });

  it("finishes when a cached destination changes the pathname without remounting", async () => {
    const { container, rerender } = render(<RouteCurtain />);

    act(() => {
      navigateWithCurtain({ href: "/en/museums/art-institute-of-chicago/collection" });
    });
    expect(container.firstElementChild).toHaveClass("covering");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25);
    });
    expect(navigation.push).toHaveBeenCalledWith(
      "/en/museums/art-institute-of-chicago/collection",
      { scroll: true },
    );

    navigation.pathname = "/en/museums/art-institute-of-chicago/collection";
    rerender(<RouteCurtain />);

    act(() => signalRouteCurtainReady());

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(container.firstElementChild).not.toHaveClass("covering", "revealing");
    expect(document.documentElement).not.toHaveClass("collection-transitioning");
  });
});
