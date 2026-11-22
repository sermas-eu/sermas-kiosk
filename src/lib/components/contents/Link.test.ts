import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Link from "./Link.svelte";

vi.mock("@sermas/toolkit", () => ({}));

describe("Link", () => {
  it("shows the label, the full address and a QR code, with no link that navigates the kiosk", async () => {
    const { container } = render(Link, {
      content: { url: "https://www.example.org/docs/", label: "The guide" },
    });
    expect(screen.getByText("The guide")).toBeTruthy();
    expect(screen.getByText("www.example.org/docs")).toBeTruthy();
    await vi.waitFor(() => expect(container.querySelector(".link-qr svg")).toBeTruthy());
    expect(screen.getByText(/scan to open/i)).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
  });
});
