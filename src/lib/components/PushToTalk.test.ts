import { appSettingsStore } from "#lib/store.ts";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetToolkit } from "../../test/toolkit.ts";
import PushToTalk from "./PushToTalk.svelte";

vi.mock("#lib", async () => (await import("../../test/toolkit.ts")).libModule);

const settings = (s: Record<string, unknown>) => appSettingsStore.set(s as any);

describe("PushToTalk", () => {
  beforeEach(() => {
    resetToolkit();
    appSettingsStore.set(undefined as any);
  });

  it("shows only when push to talk and the microphone are both enabled", async () => {
    render(PushToTalk);
    expect(screen.queryByRole("button")).toBeNull();

    settings({ pushToTalkEnabled: true, enableMic: false });
    await tick();
    expect(screen.queryByRole("button")).toBeNull();

    settings({ pushToTalkEnabled: true, enableMic: true });
    await tick();
    expect(screen.getByRole("button").textContent).toContain("Push to talk");
  });

  it("calls onstart, then onstop, on successive presses", async () => {
    settings({ pushToTalkEnabled: true, enableMic: true });
    const onstart = vi.fn();
    const onstop = vi.fn();
    render(PushToTalk, { onstart, onstop });

    await fireEvent.mouseUp(screen.getByRole("button"));
    expect(onstart).toHaveBeenCalledOnce();
    expect(onstop).not.toHaveBeenCalled();
    expect(screen.getByRole("button").textContent).toContain("Listening...");
    expect(screen.getByRole("button").classList.contains("listening")).toBe(true);

    await fireEvent.mouseUp(screen.getByRole("button"));
    expect(onstop).toHaveBeenCalledOnce();
    expect(screen.getByRole("button").textContent).toContain("Push to talk");
  });
});
