import {
  appConfigStore,
  appSettingsStore,
  avatarFailedStore,
  avatarLoadedStore,
  avatarModelStore,
  sessionIdStore,
} from "#lib/store.ts";
import { emitter } from "@sermas/toolkit/events";
import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetToolkit, ui } from "../../test/toolkit.ts";
import UIContent from "./UIContent.svelte";

vi.mock("#lib", async () => (await import("../../test/toolkit.ts")).libModule);
vi.mock("@sermas/toolkit", () => ({ UI_INTERACTION_TOPIC: "ui/interaction" }));
// 3D objects and the QR scanner need WebGL and the camera: not rendered here
vi.mock("./contents/Object.svelte", () => import("../../test/Empty.svelte"));
vi.mock("./contents/QrCodeScanner.svelte", () => import("../../test/Empty.svelte"));

const agentSays = (text: string) => ({
  actor: "agent",
  ts: new Date(),
  messages: [
    {
      contentType: "text",
      content: { text },
      messageId: "99999999999999999999999999", // after any clear-screen marker
      ts: new Date(),
    },
  ],
});

/** mounts the UI with an open session, as the toolkit would drive it */
const openSession = async (settings: Record<string, unknown>) => {
  appSettingsStore.set(settings as any);
  const view = render(UIContent);
  await vi.waitFor(() => expect(ui.init).toHaveBeenCalled());
  await tick();
  ui.emit("ui.session.changed", "started");
  await tick();
  return view;
};

describe("UIContent", () => {
  beforeEach(() => {
    resetToolkit();
    appSettingsStore.set(undefined as any);
    appConfigStore.set(undefined as any);
    sessionIdStore.set(undefined);
    avatarFailedStore.set(false);
    avatarLoadedStore.set(true);
  });

  it("shows the app's name and the start button before a session", async () => {
    appSettingsStore.set({ interactionStart: "touch" } as any);
    appConfigStore.set({ name: "Example kiosk", description: "Ask me" } as any);
    render(UIContent);
    await tick();

    expect(screen.getByText("Example kiosk")).toBeTruthy();
    expect(screen.getByText("Ask me")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Press here to start" })).toBeTruthy();
  });

  it("shows the avatar's subtitles when enabled and the avatar works", async () => {
    const { container } = await openSession({ subtitlesEnabled: true });

    emitter.emit("avatar.subtitle", { id: "s1", message: "Hello from the avatar" });
    await vi.waitFor(() =>
      expect(container.querySelector("#subtitle-s1")?.textContent).toContain(
        "Hello from the avatar",
      ),
    );

    // a clean hides the block
    emitter.emit("avatar.subtitle.clean", true);
    await tick();
    expect(container.querySelector("#subtitle-s1")).toBeNull();
  });

  it("falls back to the chat history when the avatar failed to load", async () => {
    avatarFailedStore.set(true);
    const { container } = await openSession({ subtitlesEnabled: true });

    emitter.emit("avatar.subtitle", { id: "s1", message: "not shown" });
    ui.emit("ui.dialogue.history", [agentSays("From the history")]);
    await vi.waitFor(() =>
      expect(container.querySelector("#chat-history")?.textContent).toContain(
        "From the history",
      ),
    );
    expect(container.querySelector("#subtitle-s1")).toBeNull();
    expect(container.querySelector(".ui-content-agent")).toBeNull();
  });

  it("shows the chat history when subtitles are disabled", async () => {
    const { container } = await openSession({ subtitlesEnabled: false });

    ui.emit("ui.dialogue.history", [agentSays("Plain history")]);
    await vi.waitFor(() =>
      expect(container.querySelector("#chat-history")?.textContent).toContain(
        "Plain history",
      ),
    );
  });
  describe("the visitor's dots", () => {
    const voiceDots = (c: HTMLElement) => c.querySelector("#chat-history .bounce1");
    const requestDots = (c: HTMLElement) => c.querySelector("#chat-history .double-bounce1");
    const withHistory = async () => {
      const view = await openSession({ subtitlesEnabled: false });
      ui.emit("ui.dialogue.history", [agentSays("Hello")]);
      await vi.waitFor(() => expect(view.container.querySelector("#chat-history")).toBeTruthy());
      return view;
    };

    it("background noise shows no dots; speech does, until it ends", async () => {
      const { container } = await withHistory();
      ui.emit("ui.user.speaking", { status: "noise" });
      await tick();
      expect(voiceDots(container)).toBeNull();

      ui.emit("ui.user.speaking", { status: "speaking" });
      await tick();
      expect(voiceDots(container)).toBeTruthy();
      // ended right away: deferred, not dropped
      ui.emit("ui.user.speaking", { status: "completed" });
      await vi.waitFor(() => expect(voiceDots(container)).toBeNull());
    });

    it("a dropped turn ends the processing dots", async () => {
      const { container } = await withHistory();
      ui.emit("ui.user.request-processing", { status: "started" });
      await tick();
      expect(requestDots(container)).toBeTruthy();
      ui.emit("dialogue.progress", { event: "stt", status: "error", error: "other-speaker" });
      await vi.waitFor(() => expect(requestDots(container)).toBeNull());
    });

    it("the agent's answer ends the processing dots", async () => {
      const { container } = await withHistory();
      ui.emit("ui.user.request-processing", { status: "started" });
      await tick();
      expect(requestDots(container)).toBeTruthy();
      ui.emit("ui.dialogue.history", [agentSays("Hello"), agentSays("An answer")]);
      await vi.waitFor(() => expect(requestDots(container)).toBeNull());
    });
  });
  it("shrugs after two voice turns in a row not heard, once until the visitor gets through", async () => {
    const playGesture = vi.fn(() => true);
    avatarModelStore.set({ getAnimation: () => ({ playGesture }) } as any);
    await openSession({ subtitlesEnabled: false });
    const miss = (error: string) =>
      ui.emit("dialogue.progress", { event: "stt", status: "error", error });

    miss("no-speech");
    // chatter the LLM skipped was heard: it does not count
    ui.emit("dialogue.progress", { event: "llm", status: "error", error: "skipped" });
    expect(playGesture).not.toHaveBeenCalled();
    miss("other-speaker");
    expect(playGesture).toHaveBeenCalledTimes(1);
    expect(playGesture).toHaveBeenCalledWith("donotknow");
    miss("no-speech");
    miss("no-speech");
    expect(playGesture).toHaveBeenCalledTimes(1);

    ui.emit("ui.dialogue.history", [{ ...agentSays("hi"), actor: "user" }]);
    await tick();
    miss("no-speech");
    miss("no-speech");
    expect(playGesture).toHaveBeenCalledTimes(2);
    avatarModelStore.set(undefined);
  });
});
