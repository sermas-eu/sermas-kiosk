import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Text from "./Text.svelte";

describe("Text content", () => {
  it("renders markdown, and follows a new text", async () => {
    const { container, rerender } = render(Text, {
      content: { text: "Hello **kiosk**" } as any,
    });
    await vi.waitFor(() =>
      expect(container.querySelector("strong")?.textContent).toBe("kiosk"),
    );

    await rerender({ content: { text: "_bye_" } as any });
    await vi.waitFor(() =>
      expect(container.querySelector("em")?.textContent).toBe("bye"),
    );
    expect(container.querySelector("strong")).toBeNull();
  });

  it("sanitizes html embedded in the markdown", async () => {
    const { container } = render(Text, {
      content: { text: 'hi <img src="x" onerror="alert(1)">' } as any,
    });
    await vi.waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    expect(container.querySelector("img")?.hasAttribute("onerror")).toBe(false);
  });
});
