import { describe, expect, it } from "vitest";
import { stickToBottom } from "./stick-to-bottom";

const panel = (scrollHeight: number, clientHeight = 100) => {
  const node = document.createElement("div");
  let height = scrollHeight;
  Object.defineProperty(node, "scrollHeight", { get: () => height });
  Object.defineProperty(node, "clientHeight", { get: () => clientHeight });
  document.body.appendChild(node);
  return { node, grow: (h: number) => (height = h) };
};

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("stickToBottom", () => {
  it("follows new content and late image loads", async () => {
    const { node, grow } = panel(300);
    stickToBottom(node);
    expect(node.scrollTop).toBe(300);

    grow(500);
    node.appendChild(document.createElement("p"));
    await tick();
    expect(node.scrollTop).toBe(500);

    // an image finished loading after the content was added
    const img = document.createElement("img");
    node.appendChild(img);
    await tick();
    grow(900);
    img.dispatchEvent(new Event("load"));
    expect(node.scrollTop).toBe(900);
  });

  it("stays put while the user reads older content", async () => {
    const { node, grow } = panel(300);
    stickToBottom(node);
    node.scrollTop = 0;
    node.dispatchEvent(new Event("scroll"));

    grow(600);
    node.appendChild(document.createElement("p"));
    await tick();
    expect(node.scrollTop).toBe(0);
  });
});
