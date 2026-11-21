import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json' with { type: 'json' };
import { toolkitDedupe, toolkitDir } from './toolkit.config.js';
import { toolkitAliases } from './toolkit.config.js';
import { SermasViteConfig, getCopyFiles } from './vite.config.toolkit.ts';

export default defineConfig({
	plugins: [
    // before sveltekit(): in dev its handler would answer these paths first
    viteStaticCopy({
      targets: getCopyFiles(),
    }),
    sveltekit({
      adapter: adapter(),
      alias: toolkitAliases,
      preprocess: vitePreprocess(),
    }),
  ],
  optimizeDeps: {
    exclude: [
      "@undecaf/zbar-wasm"
    ]
  },
  resolve: {
    dedupe: toolkitDedupe,
  },
  ssr: {
		noExternal: ['three']
	},
  define: {
    PKG_VERSION: `'${pkg.version}'`
  },
	server: {
    ...SermasViteConfig.server,
    // allow to serve files from ../*
    // eg. from sermas-toolkit
    fs: {
      allow: ['.', toolkitDir]
    },
    hmr: {
      overlay: false
    }
  }
});
