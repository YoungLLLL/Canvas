import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ChatPrototype } from "@/src/components/chat-prototype";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ChatPrototype composer", () => {
  it("opens with an artwork-specific imagined response instead of a staged question", () => {
    render(
      <ChatPrototype
        opening={{
          chinese: "我三十六岁时又画了一遍这间卧室。",
          english: "I painted this room again when I was thirty-six.",
          responseType: "imagined_response",
        }}
      />,
    );

    expect(screen.getByText("我三十六岁时又画了一遍这间卧室。")).toBeInTheDocument();
    expect(screen.getByText("想象性回应")).toBeInTheDocument();
    expect(screen.queryByText("你是在哪一年画了这幅画")).not.toBeInTheDocument();
  });

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

  it("sends formal artwork questions to the server and labels imagined replies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          answer: "我会把它看作一种新的画具。",
          englishAnswer: "I would see it as a new kind of painting tool.",
          responseType: "imagined_response",
          citations: [
            {
              number: 1,
              title: "Van Gogh Letters",
              publisher: "Van Gogh Museum",
              url: "https://vangoghletters.org/",
              excerpt: "There is also a good chance of exchanging pictures with other artists.",
            },
          ],
          displaySegments: [
            {
              chinese: "我会把它看作一种新的画具。",
              english: "I would see it as a new kind of painting tool.",
              citationNumbers: [1],
            },
          ],
        }),
      ),
    );
    render(<ChatPrototype artworkId="artic:28560" />);

    fireEvent.click(screen.getByRole("button", { name: "展开文字输入框" }));
    fireEvent.change(screen.getByRole("textbox", { name: "向梵高提问" }), {
      target: { value: "你怎么看生成式 AI？" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送消息" }));

    expect(await screen.findByText("我会把它看作一种新的画具。")).toBeInTheDocument();
    expect(screen.getByText("I would see it as a new kind of painting tool.")).toBeInTheDocument();
    expect(screen.getAllByText("想象性回应")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "查看来源 1" })[0]);
    expect(screen.getByRole("dialog")).toHaveTextContent("Van Gogh Letters");
    expect(screen.getByRole("dialog")).toHaveTextContent("原文摘录");
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "There is also a good chance of exchanging pictures with other artists.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/ai/chat", expect.objectContaining({ method: "POST" }));
  });
});

describe("ChatPrototype artist profile", () => {
  it("uses the structured bilingual artist template for James Peale", () => {
    render(
      <ChatPrototype
        artwork={{
          artist: "James Peale (American, 1749–1831)",
          title: "Olivia Simes Morris",
          year: "1814",
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "James Peale 詹姆斯·皮尔 Life: 1749–1831, United States 美国",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Style:");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Subjects:");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Legacy:");
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent("Artwork:");
    expect(screen.getByRole("button", { name: "退出作品对话，返回画廊" })).toBeInTheDocument();
  });

  it("uses the structured bilingual artist template for Peter Paul Rubens", () => {
    render(
      <ChatPrototype
        artwork={{
          artist: "Peter Paul Rubens (Flemish, 1577–1640)",
          title: "Saint Francis",
          year: "c. 1615",
        }}
      />,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Peter Paul Rubens 彼得·保罗·鲁本斯");
    expect(heading).toHaveTextContent("Life: 1577–1640, Siegen, Germany 德国锡根");
    expect(heading).not.toHaveTextContent("in review");
    expect(screen.getByRole("button", { name: "退出作品对话，返回画廊" })).toHaveTextContent("←");
    expect(screen.getByRole("button", { name: "退出作品对话，返回画廊" })).not.toHaveTextContent(
      "返回画廊",
    );
  });

  it("uses museum-backed context instead of review placeholders for an unknown artist", () => {
    render(
      <ChatPrototype
        artwork={{
          artist: "Artist unknown (French, active 18th century)",
          title: "Woman in a Straw Hat",
          year: "c. 1790",
          sourceUrl: "https://www.artic.edu/artworks/44886/woman-in-a-straw-hat",
        }}
      />,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Artist unknown 法国佚名艺术家");
    expect(heading).toHaveTextContent("Life: Active 18th century, France 18世纪活跃于法国");
    expect(heading).toHaveTextContent("18th-Century French Portraiture 18世纪法国肖像画");
    expect(heading).not.toHaveTextContent("in review");
    expect(screen.getByText("资料来源：")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Art Institute of Chicago" })).toHaveAttribute(
      "href",
      "https://www.artic.edu/artworks/44886/woman-in-a-straw-hat",
    );
  });

  it("uses a sourced biography instead of generic museum filler for Édouard Manet", () => {
    render(
      <ChatPrototype
        artwork={{
          artist: "Édouard Manet (French, 1832–1883)",
          title: "Still Life",
          year: "1860",
          sourceUrl: "https://www.artic.edu/artworks/00000",
        }}
      />,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Édouard Manet 爱德华·马奈");
    expect(heading).toHaveTextContent("Realism 现实主义");
    expect(heading).toHaveTextContent("Modern Life 现代生活");
    expect(heading).toHaveTextContent(
      "A Pivotal Figure between Realism and Impressionism 连接现实主义与印象主义的关键人物",
    );
    expect(heading).not.toHaveTextContent("Museum Collection");
    expect(screen.getByRole("link", { name: "Wikipedia" })).toBeInTheDocument();
  });
});
