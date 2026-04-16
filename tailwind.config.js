/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				gold: {
					DEFAULT: 'hsl(45 90% 55%)',
					dim: 'hsl(45 60% 35%)',
					glow: 'hsl(45 100% 65%)'
				},
				navy: {
					deep: 'hsl(222 55% 5%)',
					surface: 'hsl(222 40% 12%)',
					elevated: 'hsl(222 35% 16%)'
				},
				mint: {
					DEFAULT: 'hsl(160 60% 45%)',
					dim: 'hsl(160 30% 30%)'
				},
				border: 'hsl(222 25% 20%)',
				foreground: 'hsl(45 20% 90%)',
				'muted-foreground': 'hsl(220 15% 55%)'
			},
			fontFamily: {
				heading: ['"Space Grotesk"', '"IBM Plex Sans KR"', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};
