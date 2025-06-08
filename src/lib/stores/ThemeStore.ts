import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
	if (!browser) {
		return 'light'; // Default for SSR or non-browser environments
	}
	const storedTheme = localStorage.getItem('theme') as Theme | null;
	if (storedTheme) {
		return storedTheme;
	}
	// Optional: Check system preference
	// if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	//   return 'dark';
	// }
	return 'light'; // Default theme
};

const createThemeStore = () => {
	const initialTheme = getInitialTheme();
	const { subscribe, set, update } = writable<Theme>(initialTheme);

	if (browser) {
		document.documentElement.dataset.theme = initialTheme;
	}

	return {
		subscribe,
		set: (newTheme: Theme) => {
			if (browser) {
				document.documentElement.dataset.theme = newTheme;
				localStorage.setItem('theme', newTheme);
			}
			set(newTheme);
		},
		toggle: () => {
			update((currentTheme) => {
				const newTheme = currentTheme === 'light' ? 'dark' : 'light';
				if (browser) {
					document.documentElement.dataset.theme = newTheme;
					localStorage.setItem('theme', newTheme);
				}
				return newTheme;
			});
		}
	};
};

export const theme = createThemeStore();
