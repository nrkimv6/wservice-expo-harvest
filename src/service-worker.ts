/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `expo-harvest-${version}`;
const APP_SHELL = ['/', '/app', ...build, ...files, ...prerendered];
const DEV_ONLY_PATH_PREFIXES = ['/.svelte-kit/', '/@'];

function createOfflineResponse(status = 503) {
	return new Response('Offline', {
		status,
		statusText: 'Offline'
	});
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(APP_SHELL);
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const cacheKeys = await caches.keys();
			await Promise.all(
				cacheKeys
					.filter((key) => key !== CACHE_NAME)
					.map((key) => caches.delete(key))
			);
			await self.clients.claim();
		})()
	);
});

async function cacheFirst(request: Request) {
	const cached = await caches.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	const cache = await caches.open(CACHE_NAME);
	cache.put(request, response.clone());
	return response;
}

async function networkFirst(request: Request) {
	try {
		const response = await fetch(request);
		const cache = await caches.open(CACHE_NAME);
		cache.put(request, response.clone());
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;
		return (await caches.match('/')) || (await caches.match('/app')) || createOfflineResponse();
	}
}

async function staleWhileRevalidate(request: Request) {
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match(request);

	const networkPromise = fetch(request)
		.then((response) => {
			cache.put(request, response.clone());
			return response;
		})
		.catch(() => cached || createOfflineResponse(504));

	return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;
	if (DEV_ONLY_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return;

	if (request.mode === 'navigate') {
		event.respondWith(networkFirst(request));
		return;
	}

	if (APP_SHELL.includes(url.pathname)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	event.respondWith(staleWhileRevalidate(request));
});
