import { vi } from "vitest";

type Handler = (...args: any[]) => unknown;

/**
 * A stand-in for the `#lib` toolkit instance: components only see the few
 * methods below. `ui.emit()` fires what a component registered with
 * `ui.on()`, as the toolkit's UI would.
 */
const handlers = new Map<string, Handler[]>();

export const ui = {
  init: vi.fn(async () => {}),
  destroy: vi.fn(async () => {}),
  on: vi.fn((event: string, fn: Handler) => {
    handlers.set(event, [...(handlers.get(event) || []), fn]);
  }),
  off: vi.fn(),
  stopAvatarSpeech: vi.fn(),
  emit: (event: string, ...args: unknown[]) =>
    (handlers.get(event) || []).forEach((fn) => fn(...args)),
};

export const broker = { publish: vi.fn(), on: vi.fn(), off: vi.fn() };

export const toolkit = {
  getUI: () => ui,
  getBroker: () => broker,
  getAppId: () => "example-app",
  getSessionId: () => "ex-session",
  getAvatarConfig: vi.fn(async () => ({ name: "Example Agent" })),
  triggerInteraction: vi.fn(),
  sendChatMessage: vi.fn(),
};

export const resetToolkit = () => {
  handlers.clear();
  vi.clearAllMocks();
};

/** the module `#lib` resolves to, for `vi.mock("#lib", ...)` */
export const libModule = { toolkit, createToolkit: () => toolkit };
