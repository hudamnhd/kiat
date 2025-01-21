/** @type {import('tailwindcss').Config} */

import animatePlugin from "tailwindcss-animate";
import { type Config } from "tailwindcss";
import { extendedTheme } from "./src/utils/extended-theme";
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: extendedTheme,
	},
	plugins: [animatePlugin],
} satisfies Config;
