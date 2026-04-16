/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				orange: {
					DEFAULT: '#ff5e00',
					dim: '#cc4b00',
					glow: '#ff8b4d'
				},
				navy: {
					deep: '#050505',
					surface: '#0f0f0f',
					elevated: '#1a1a1a'
				},
				mint: {
					DEFAULT: '#34d399',
					dim: '#065f46'
				},
				border: 'rgba(255,255,255,0.1)',
				foreground: '#f6efe9',
				'muted-foreground': 'rgba(255,255,255,0.5)'
			},
			fontFamily: {
				heading: ['"Space Grotesk"', '"IBM Plex Sans KR"', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};
