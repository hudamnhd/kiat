import React from "react";

type Theme = "dark" | "light" | "system";

const storageKey = "vite-ui-theme";
const defaultTheme = "system";

type ThemeProviderProps = {
	children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
	document.documentElement.setAttribute("data-theme", getTheme());

	return <React.Fragment>{children}</React.Fragment>;
}

export function getTheme() {
	return validateTheme(localStorage.getItem(storageKey) || defaultTheme);
}

/**
 * This function will toggle the theme between light and dark and store the
 * value in localStorage.
 */
export function toggleTheme() {
	let currentTheme = validateTheme(localStorage.getItem(storageKey));
	if (currentTheme === "system") {
		currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	const newTheme = currentTheme === "light" ? "dark" : "light";
	localStorage.setItem(storageKey, newTheme);
	document.documentElement.setAttribute("data-theme", newTheme);
}
export function setTheme(theme: Theme | string) {
	let themeToSet: Theme | null = validateTheme(theme);
	if (themeToSet === "system") {
		themeToSet = null;
	}
	if (themeToSet) {
		localStorage.setItem(storageKey, themeToSet);
		document.documentElement.setAttribute("data-theme", themeToSet);
	} else {
		localStorage.removeItem(storageKey);
		document.documentElement.removeAttribute("data-theme");
	}
}

function validateTheme(theme: string | null): Theme {
	return theme === "light" || theme === "dark" || theme === "system"
		? theme
		: "system";
}
