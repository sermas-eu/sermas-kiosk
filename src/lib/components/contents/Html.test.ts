import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Html from "./Html.svelte";

const renderHtml = (html: string | undefined) =>
  render(Html, { content: { html } as any }).container.querySelector(".html")!;

describe("Html content", () => {
  it("renders the markup it is given", () => {
    const el = renderHtml("<p>Hello <b>kiosk</b></p>");
    expect(el.querySelector("b")?.textContent).toBe("kiosk");
  });

  it("sanitizes untrusted markup (scripts, event handlers, javascript: urls)", () => {
    const el = renderHtml(
      `<img src="x" onerror="alert(1)"><script>alert(2)</script>` +
        `<a href="javascript:alert(3)">link</a><p>safe</p>`,
    );
    expect(el.querySelector("script")).toBeNull();
    expect(el.querySelector("img")?.hasAttribute("onerror")).toBe(false);
    expect(el.querySelector("a")?.getAttribute("href")).toBeNull();
    expect(el.querySelector("p")?.textContent).toBe("safe");
  });

  it("renders nothing for missing html", () => {
    expect(renderHtml(undefined).innerHTML.trim()).toBe("");
  });
});
