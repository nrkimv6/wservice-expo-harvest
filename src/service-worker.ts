/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `expo-harvest-${version}`;
const APP_SHELL = ['/', '/app', ...build, ...files, ...prerendered];

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
		return caches.match('/app') || caches.match('/');
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
		.catch(() => cached);

	return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

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
