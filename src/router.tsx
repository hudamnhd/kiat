import ThemeProvider, { Layout } from "#src/components/custom/layout";
import Loader from "#src/components/ui/loader";
import { createBrowserRouter } from "react-router";
import ErrorPage from "./routes/error-page";
import NotFoundError from "./routes/404.tsx";
import Index from "./routes/index";
import { getTheme } from "./components/custom/theme-provider.tsx";

export const router = createBrowserRouter([
	{
		id: "root",
		path: "/",
		element: <ThemeProvider />,
		errorElement: <ErrorPage />,
		loader: async ({ request }) => {
			const root = document.documentElement;
			const theme = getTheme();
			root.setAttribute("data-theme", theme);

			if (theme === "system") {
				const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";

				root.classList.add(systemTheme);
			} else {
				root.classList.add(theme);
			}

			return {
				requestInfo: {
					path: new URL(request.url).pathname,
					userPrefs: {
						theme: getTheme(),
					},
				},
			};
		},
		HydrateFallback: Loader,
		children: [
			{
				path: "/",
				element: <Index />,
			},
			{
				path: "/wallpaper",
				lazy: () => import("./routes/walpaper"),
			},
			{
				path: "/components",
				lazy: () => import("./routes/demo.components"),
			},
			{
				path: "/about",
				lazy: () => import("./routes/about"),
			},
			{
				path: "/muslim",
				id: "muslim",
				element: <Layout />,
				lazy: async () => await import("./routes/muslim.data"),
				shouldRevalidate: ({ formMethod, currentUrl, nextUrl }) => {
					const shouldRevalidate =
						formMethod === "POST" || currentUrl.pathname !== nextUrl.pathname;
					return shouldRevalidate;
				},
				children: [
					{
						index: true,
						lazy: () => import("./routes/muslim"),
					},
					{
						path: "/muslim/bookmarks",
						index: true,
						lazy: () => import("./routes/muslim.bookmarks"),
					},
					{
						path: "/muslim/doa",
						index: true,
						lazy: () => import("./routes/muslim.doa.index"),
					},
					{
						path: "/muslim/doa-sehari-hari",
						index: true,
						lazy: () => import("./routes/muslim.doa-sehari-hari"),
					},
					{
						path: "/muslim/doa/:source",
						lazy: () => import("./routes/muslim.doa.sumber"),
					},
					{
						path: "/muslim/sholawat",
						lazy: () => import("./routes/muslim.sholawat"),
					},
					{
						path: "/muslim/tahlil",
						lazy: () => import("./routes/muslim.tahlil"),
					},
					{
						path: "/muslim/dzikir",
						lazy: () => import("./routes/muslim.dzikir"),
					},
					{
						path: "/muslim/quran-v2/:id",
						HydrateFallback: Loader,
						lazy: async () => await import("./routes/muslim.quran-v2.page"),
					},
					{
						path: "/muslim/quran",
						children: [
							{
								path: "/muslim/quran/:id",
								HydrateFallback: Loader,
								lazy: async () => await import("./routes/muslim.quran.surat"),
							},
							{
								path: "/muslim/quran",
								index: true,
								HydrateFallback: Loader,
								lazy: () => import("./routes/muslim.quran.index"),
							},
						],
					},
					{
						path: "/muslim/quran-word-by-word",
						children: [
							{
								path: "/muslim/quran-word-by-word/:id",
								HydrateFallback: Loader,
								lazy: async () =>
									await import("./routes/muslim.quran-word-by-word.surat"),
							},
							{
								path: "/muslim/quran-word-by-word",
								index: true,
								lazy: () => import("./routes/muslim.quran-word-by-word.index"),
								HydrateFallback: Loader,
							},
						],
					},
				],
			},
			{
				path: "/tools",
				element: <Layout />,
				children: [
					{
						path: "/tools",
						index: true,
						lazy: () => import("./routes/tools"),
					},
					{
						path: "/tools/calculator",
						lazy: () => import("./routes/tools.calculator"),
					},
					{
						path: "/tools/habit",
						lazy: () => import("./routes/tools.habit"),
					},
					{
						path: "/tools/daily-tasks",
						lazy: () => import("./routes/tools.daily-tasks"),
					},
					{
						path: "/tools/pomodoro",
						lazy: () => import("./routes/tools.pomodoro"),
					},
				],
			},
		],
	},
	{
		path: "*",
		element: <NotFoundError />,
	},
]);
