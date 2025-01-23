import ThemeProvider, { Layout } from "#src/components/custom/layout";
import Loader from "#src/components/ui/loader";
import { createBrowserRouter } from "react-router";
import ErrorPage from "./routes/error-page";
import NotFoundError from "./routes/404.tsx";
import Index from "./routes/index";
import Muslim from "./routes/muslim";
import Tools from "./routes/tools";
import About from "./routes/about";
import Pomodoro from "./routes/tools.pomodoro.tsx";
import DailyTasks from "./routes/tools.daily-tasks.tsx";
import Calculator from "./routes/tools.calculator.tsx";
import Habit from "./routes/tools.habit.tsx";
import Sholawat from "./routes/muslim.sholawat";
import Dzikir from "./routes/muslim.dzikir";
import Tahlil from "./routes/muslim.tahlil";
import DoaIndex from "./routes/muslim.doa.index";
import Bookmarks from "./routes/muslim.bookmarks";
import DoaSehariHari from "./routes/muslim.doa-sehari-hari";
import DoaSumber from "./routes/muslim.doa.sumber";
import QuranIndex from "./routes/muslim.quran.index";
import QuranWBWIndex from "./routes/muslim.quran-word-by-word.index";
import QuranWBWSurat from "./routes/muslim.quran-word-by-word.surat";
import quranWbwSuratLoader from "./routes/muslim.quran-word-by-word.data";
import QuranSurat from "./routes/muslim.quran.surat";
import muslimLoader from "./routes/muslim.data";
import quranIndexLoader from "./routes/muslim.quran.index.data.ts";
import doaSumberLoader from "./routes/muslim.doa.data";
import quranSuratLoader from "./routes/muslim.quran.surat.data.ts";
import Wallpaper from "./routes/walpaper";

export const router = createBrowserRouter([
	{
		id: "root",
		path: "/",
		element: <ThemeProvider />,
		errorElement: <ErrorPage />,
		HydrateFallback: Loader,
		children: [
			{
				path: "/",
				element: <Index />,
			},
			{
				path: "/wallpaper",
				element: <Wallpaper />,
			},
			{
				path: "/about",
				element: <About />,
			},
			{
				path: "/muslim",
				id: "muslim",
				element: <Layout />,
				loader: muslimLoader,
				children: [
					{
						path: "/muslim",
						index: true,
						element: <Muslim />,
					},
					{
						path: "/muslim/bookmarks",
						index: true,
						element: <Bookmarks />,
					},
					{
						path: "/muslim/doa",
						index: true,
						element: <DoaIndex />,
					},
					{
						path: "/muslim/doa-sehari-hari",
						index: true,
						element: <DoaSehariHari />,
					},
					{
						path: "/muslim/doa/:source",
						loader: doaSumberLoader,
						element: <DoaSumber />,
					},
					{
						path: "/muslim/sholawat",
						element: <Sholawat />,
					},
					{
						path: "/muslim/tahlil",
						element: <Tahlil />,
					},
					{
						path: "/muslim/dzikir",
						element: <Dzikir />,
					},
					{
						path: "/muslim/quran",
						children: [
							{
								path: "/muslim/quran/:id",
								loader: quranSuratLoader,
								HydrateFallback: Loader,
								element: <QuranSurat />,
							},
							{
								path: "/muslim/quran",
								index: true,
								loader: quranIndexLoader,
								HydrateFallback: Loader,
								element: <QuranIndex />,
							},
						],
					},
					{
						path: "/muslim/quran-word-by-word",
						children: [
							{
								path: "/muslim/quran-word-by-word/:id",
								loader: quranWbwSuratLoader,
								HydrateFallback: Loader,
								element: <QuranWBWSurat />,
							},
							{
								path: "/muslim/quran-word-by-word",
								index: true,
								loader: quranIndexLoader,
								HydrateFallback: Loader,
								element: <QuranWBWIndex />,
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
						element: <Tools />,
					},
					{
						path: "/tools/calculator",
						element: <Calculator />,
					},
					{
						path: "/tools/habit",
						element: <Habit />,
					},
					{
						path: "/tools/daily-tasks",
						element: <DailyTasks />,
					},
					{
						path: "/tools/pomodoro",
						element: <Pomodoro />,
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
