import { readFileSync } from 'fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	ssr: {
		external: ['@capacitor/core', '@capacitor/app', '@capacitor/splash-screen']
	}
});
