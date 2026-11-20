import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json' with { type: 'json' };
import { toolkitDedupe, toolkitDir } from './svelte.config.toolkit.js';
import { SermasViteConfig, getCopyFiles } from './vite.config.toolkit.ts';

export default defineConfig({
	plugins: [
    // before sveltekit(): in dev its handler would answer these paths first
    viteStaticCopy({
      targets: getCopyFiles(),
    }),
    sveltekit(),
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
