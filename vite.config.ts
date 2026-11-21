import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json' with { type: 'json' };
import {
  apiClientDir,
  nodeSdkDir,
  toolkitDedupe,
  toolkitDir,
} from './toolkit.config.js';
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
      preprocess: vitePreprocess(),
    }),
  ],
  css: {
    preprocessorOptions: {
      // Bulma's own deprecations (Sass if()) are not ours to fix
      scss: { quietDeps: true },
    },
  },
  optimizeDeps: {
    exclude: [
      "@undecaf/zbar-wasm"
    ]
  },
  resolve: {
    // exact matches; tsconfig.json mirrors them as `paths` for the type checker
    alias: Object.entries(toolkitAliases).map(([name, target]) => ({
      find: new RegExp(`^${name.replace(/[/.]/g, "\\$&")}$`),
      replacement: target,
    })),
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
      allow: ['.', toolkitDir, apiClientDir, nodeSdkDir]
    },
    hmr: {
      overlay: false
    }
  }
});
