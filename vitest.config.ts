import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// component tests: the app's Vite config (SvelteKit plugin, toolkit aliases)
// with a browser-like DOM; the `browser` condition loads Svelte's client runtime
export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: { conditions: ["browser"] },
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.ts"],
      setupFiles: ["src/test/setup.ts"],
      restoreMocks: true,
    },
  }),
);
