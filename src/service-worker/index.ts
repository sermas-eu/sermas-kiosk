/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, version } from '$service-worker';

const loggerEnabled = false

const logger = {
	log: (msg: string) => loggerEnabled && console.log(`[ServiceWorker] ${msg}`),
	debug: (msg: string) => loggerEnabled && console.debug(`[ServiceWorker] ${msg}`),
	warn: (msg: string) => loggerEnabled && console.warn(`[ServiceWorker] ${msg}`),
	error: (msg: string) => loggerEnabled && console.error(`[ServiceWorker] ${msg}`),
}

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
];

// https://kit.svelte.dev/docs/service-workers#type-safety
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
        // console.warn('SW install', ASSETS)
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		let useCache = ASSETS.includes(url.pathname)

		if (url.pathname.startsWith('/api')) {
			useCache = false
		}

		// match by extension
		const cacheExtensions = [ '.glb', '.wasm', '.onnx', '.tflite', '.min.js', '.json?import' ]
		if (cacheExtensions.filter(ext => url.pathname.endsWith(ext) || url.search.endsWith(ext)).length) {
			useCache = true
		}

		if (useCache) {
			const response = await cache.match(url.pathname + url.search);
			if (response) {
				logger.debug(`CACHED ${url.pathname}${url.search}`)
				return response;
			}
		}

		logger.debug(`FETCH ${url.pathname}${url.search}`)
		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});