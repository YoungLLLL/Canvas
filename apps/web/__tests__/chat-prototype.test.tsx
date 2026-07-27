import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ChatPrototype } from "@/src/components/chat-prototype";

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
});

describe("ChatPrototype composer", () => {
  it("collapses when the mouse leaves an empty expanded composer", () => {
    render(<ChatPrototype />);

    fireEvent.click(screen.getByRole("button", { name: "展开文字输入框" }));
    const input = screen.getByRole("textbox", { name: "向梵高提问" });
    const form = input.closest("form");

    expect(form).not.toBeNull();
    fireEvent.mouseLeave(form!);

    expect(screen.getByRole("button", { name: "展开文字输入框" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "向梵高提问" })).not.toBeInTheDocument();
  });

  it("stays expanded when the mouse leaves with text present", () => {
    render(<ChatPrototype />);

    fireEvent.click(screen.getByRole("button", { name: "展开文字输入框" }));
    const input = screen.getByRole("textbox", { name: "向梵高提问" });
    const form = input.closest("form");

    fireEvent.change(input, { target: { value: "保留这段文字" } });
    fireEvent.mouseLeave(form!);

    expect(screen.getByRole("textbox", { name: "向梵高提问" })).toHaveValue("保留这段文字");
    expect(screen.getByRole("button", { name: "发送消息" })).toBeInTheDocument();
  });
});
