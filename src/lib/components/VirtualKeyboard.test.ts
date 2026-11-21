import { appSettingsStore } from "#lib/store.ts";
import { fireEvent, render, screen } from "@testing-library/svelte";
import KioskBoard from "kioskboard";
import { tick } from "svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VirtualKeyboard from "./VirtualKeyboard.svelte";

vi.mock("kioskboard", () => ({ default: { run: vi.fn() } }));

describe("VirtualKeyboard", () => {
  beforeEach(() => vi.mocked(KioskBoard.run).mockClear());

  it("opens the keyboard and returns the text through ondone", async () => {
    appSettingsStore.set({ virtualKeyboardEnabled: true } as any);
    const ondone = vi.fn();
    render(VirtualKeyboard, {
      showKeyboard: true,
      inputValue: "hello",
      placeholder: "Type here",
      ondone,
    });
    await vi.waitFor(() => expect(KioskBoard.run).toHaveBeenCalledOnce());

    const input = screen.getByPlaceholderText("Type here") as HTMLInputElement;
    expect(input.value).toBe("hello");

    await fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(ondone).toHaveBeenCalledWith("hello");
  });

  it("stays closed when the virtual keyboard is disabled in the settings", async () => {
    appSettingsStore.set({ virtualKeyboardEnabled: false } as any);
    render(VirtualKeyboard, { showKeyboard: true, inputValue: "", placeholder: "Type here" });
    await tick();
    await tick();

    expect(screen.queryByPlaceholderText("Type here")).toBeNull();
    expect(KioskBoard.run).not.toHaveBeenCalled();
  });
});
