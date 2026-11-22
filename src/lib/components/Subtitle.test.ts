import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Subtitle from "./Subtitle.svelte";

describe("Subtitle", () => {
  it("renders an agent message as markdown in the agent box", async () => {
    const { container } = render(Subtitle, {
      actor: "agent",
      message: "Welcome to **SERMAS**",
      id: "m1",
    });
    const box = container.querySelector(".message-m1")!;
    await vi.waitFor(() =>
      expect(box.querySelector("strong")?.textContent).toBe("SERMAS"),
    );
    expect(box.classList.contains("agent")).toBe(true);
    expect(container.querySelector("#box")?.classList.contains("agent-box")).toBe(true);
  });

  it("renders a user message in the user box", async () => {
    const { container } = render(Subtitle, { actor: "user", message: "hi", id: "" });
    await vi.waitFor(() =>
      expect(container.querySelector(".message-none")?.textContent?.trim()).toBe("hi"),
    );
    expect(container.querySelector(".message-none")?.classList.contains("user")).toBe(true);
    expect(container.querySelector("#box")?.classList.contains("user-box")).toBe(true);
  });
});
