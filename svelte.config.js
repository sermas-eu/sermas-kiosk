import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { toolkitAliases } from './svelte.config.toolkit.js'

const useAliases = process.env.NODE_ENV === 'development' && process.env.BUILD_FROM_TS === "1"

if (useAliases) {
  console.warn("**** using ts code via aliases ***")
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    paths: {
      // base: process.env.NODE_ENV == 'development' ? "" : "/kiosk",
    },
    alias: {
      ...(useAliases ? toolkitAliases : {}),
      // ...toolkitAliases,
    },
  },
};

export default config;
