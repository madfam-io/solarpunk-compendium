/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Brand colors
				'solar-gold': {
					DEFAULT: '#F4A020',
					50: '#FEF5E7',
					100: '#FDEACC',
					200: '#FBD599',
					300: '#F8C066',
					400: '#F6AB33',
					500: '#F4A020',
					600: '#D4850A',
					700: '#9F6408',
					800: '#6A4305',
					900: '#352103'
				},
				'leaf-green': {
					DEFAULT: '#4CAF50',
					50: '#E8F5E9',
					100: '#C8E6C9',
					200: '#A5D6A7',
					300: '#81C784',
					400: '#66BB6A',
					500: '#4CAF50',
					600: '#43A047',
					700: '#388E3C',
					800: '#2E7D32',
					900: '#1B5E20'
				},
				'solarpunk-teal': {
					DEFAULT: '#01D4A9',
					50: '#E6FBF6',
					100: '#B3F4E5',
					200: '#80EDD4',
					300: '#4DE6C3',
					400: '#1ADFB2',
					500: '#01D4A9',
					600: '#00A885',
					700: '#007D63',
					800: '#005242',
					900: '#002721'
				},
				'earth-brown': {
					DEFAULT: '#8D6E63',
					500: '#8D6E63',
					600: '#6D4C41',
					700: '#5D4037'
				},
				'sky-blue': {
					DEFAULT: '#2196F3',
					500: '#2196F3',
					600: '#1976D2'
				}
			},
			fontFamily: {
				// UI fonts
				orbitron: ['Orbitron', 'sans-serif'],
				inter: ['Inter', 'sans-serif'],
				// Codex reading fonts
				literata: ['Literata', 'Georgia', 'serif'],
				fraunces: ['Fraunces', 'Georgia', 'serif']
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				}
			},
			backdropBlur: {
				xs: '2px'
			}
		}
	},
	plugins: []
};
