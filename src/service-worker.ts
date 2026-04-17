/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `expo-harvest-${version}`;
const PRECACHE_ASSETS = [...build, ...files];

function isCacheableAsset(pathname: string) {
	return (
		PRECACHE_ASSETS.includes(pathname) ||
		pathname.startsWith('/_app/immutable/') ||
		pathname.startsWith('/images/')
	);
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(PRECACHE_ASSETS);
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
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	cache.put(request, response.clone());
	return response;
}

async function networkFirst(request: Request) {
	try {
		return await fetch(request);
	} catch {
		const cached = await caches.match(request);
		return cached ?? Response.error();
	}
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

	if (isCacheableAsset(url.pathname)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	event.respondWith(fetch(request));
});
