import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { mediapipe } from 'vite-plugin-mediapipe';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json' assert { type: 'json' };
import { SermasViteConfig, getCopyFiles } from './vite.config.toolkit'

export default defineConfig({
	plugins: [
    sveltekit(),
    mediapipe(),
    viteStaticCopy({
      targets: [
        // add copy files
        ...getCopyFiles()
      ]
    })
  ],
  optimizeDeps: {
    exclude: [
      "@undecaf/zbar-wasm"
    ]
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
      allow: [
        '../'
      ]
    },
    hmr: {
      overlay: false
    }
  }
});
