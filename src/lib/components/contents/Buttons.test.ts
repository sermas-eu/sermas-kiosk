import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { broker, resetToolkit, ui } from "../../../test/toolkit.ts";
import Buttons from "./Buttons.svelte";

vi.mock("#lib", async () => (await import("../../../test/toolkit.ts")).libModule);
// the toolkit's entry point pulls in the avatar and detection stacks
vi.mock("@sermas/toolkit", () => ({ UI_INTERACTION_TOPIC: "ui/interaction" }));

describe("Buttons content", () => {
  beforeEach(resetToolkit);

  it("renders the label and one button per entry", () => {
    render(Buttons, {
      content: {
        label: "Pick one",
        list: [
          { value: "a", label: "Alpha" },
          { value: "b", classes: ["is-secondary"] },
        ],
      } as any,
    });
    expect(screen.getByText("Pick one")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Alpha" }).className).toContain(
      "is-primary",
    );
    // no label: the value is shown, with the classes it asks for
    expect(screen.getByRole("button", { name: "b" }).className).toContain(
      "is-secondary",
    );
  });

  it("publishes the clicked button as a UI interaction and stops the avatar", async () => {
    const button = { value: "b", label: "Beta" };
    render(Buttons, {
      content: { list: [{ value: "a", label: "Alpha" }, button] } as any,
      metadata: { context: "menu" },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Beta" }));

    expect(ui.stopAvatarSpeech).toHaveBeenCalledOnce();
    expect(broker.publish).toHaveBeenCalledOnce();
    expect(broker.publish).toHaveBeenCalledWith("ui/interaction/avatar", {
      appId: "example-app",
      moduleId: "avatar",
      sessionId: "ex-session",
      interaction: {
        context: { context: "menu", button },
        element: "button",
        value: "b",
      },
    });
  });

  it("hides the block after a click: the API drops its tools after the first one", async () => {
    render(Buttons, {
      usedKey: "req-1:1",
      content: {
        label: "Menu",
        list: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
      } as any,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Alpha" }));

    expect(broker.publish).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Beta" })).toBeNull();
    expect(screen.queryByText("Menu")).toBeNull();
  });

  it("stays hidden when rendered again from a cloned history entry", async () => {
    const content = { list: [{ value: "a", label: "Alpha" }] } as any;
    const first = render(Buttons, { content, usedKey: "req-2:1" });
    await fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    first.unmount();

    render(Buttons, { content: structuredClone(content), usedKey: "req-2:1" });
    expect(screen.queryByRole("button", { name: "Alpha" })).toBeNull();
  });
});
