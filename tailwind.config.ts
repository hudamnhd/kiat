/** @type {import('tailwindcss').Config} */

import animatePlugin from "tailwindcss-animate";
import { extendedTheme } from "./src/utils/extended-theme";
import { marketingPreset } from "./src/utils/tailwind-preset";

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
	presets: [marketingPreset],
	plugins: [animatePlugin, require("@tailwindcss/typography")],
};
