import ThemeProvider, { Layout } from "#src/components/custom/layout";
import Loader from "#src/components/ui/loader";
import { createBrowserRouter } from "react-router";
import { getTheme } from "./components/custom/theme-provider.tsx";
import NotFoundError from "./routes/404.tsx";
import ErrorPage from "./routes/error-page";
import Index from "./routes/index";
import { lazyWrapper } from "./utils/misc";

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
        lazy: () => import("./routes/wallpaper"),
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
        path: "/test",
        lazy: () => import("./routes/test"),
      },
      {
        path: "/terjemahan",
        lazy: lazyWrapper(() => import("./routes/terjemahan")),
      },
      {
        path: "/muslim",
        id: "muslim",
        element: <Layout />,
        lazy: lazyWrapper(() => import("./routes/muslim.data")),
        shouldRevalidate: ({ formMethod, currentUrl, nextUrl }) => {
          const shouldRevalidate = formMethod === "POST" ||
            currentUrl.pathname !== nextUrl.pathname;
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
            lazy: lazyWrapper(() => import("./routes/muslim.doa.sumber")),
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
            lazy: lazyWrapper(() => import("./routes/muslim.quran-v2.page")),
          },
          {
            path: "/muslim/quran-hafalan/:id",
            HydrateFallback: Loader,
            lazy: lazyWrapper(() => import("./routes/muslim.quran.hafalan")),
          },

          {
            path: "/muslim/quran-v1",
            children: [
              {
                path: "/muslim/quran-v1/:id",
                HydrateFallback: Loader,
                lazy: lazyWrapper(() =>
                  import("./routes/muslim.quran-v1.page")
                ),
              },
            ],
          },
          {
            path: "/muslim/quran",
            children: [
              {
                path: "/muslim/quran/:id",
                HydrateFallback: Loader,
                lazy: lazyWrapper(() => import("./routes/muslim.quran.page")),
              },
              {
                path: "/muslim/quran/search",
                HydrateFallback: Loader,
                lazy: lazyWrapper(() => import("./routes/muslim.quran.search")),
              },
              {
                path: "/muslim/quran/navigation",
                HydrateFallback: Loader,
                lazy: lazyWrapper(() =>
                  import("./routes/muslim.quran.navigation")
                ),
              },
              {
                path: "/muslim/quran",
                index: true,
                HydrateFallback: Loader,
                lazy: lazyWrapper(() => import("./routes/muslim.quran.index")),
              },
            ],
          },
          {
            path: "/muslim/quran-word-by-word",
            children: [
              {
                path: "/muslim/quran-word-by-word/:id",
                HydrateFallback: Loader,
                lazy: lazyWrapper(
                  () => import("./routes/muslim.quran-word-by-word.page"),
                ),
              },
              {
                path: "/muslim/quran-word-by-word",
                index: true,
                lazy: lazyWrapper(
                  () => import("./routes/muslim.quran-word-by-word.index"),
                ),
                HydrateFallback: Loader,
              },
            ],
          },
        ],
      },
      {
        path: "/alat",
        element: <Layout />,
        children: [
          {
            path: "/alat",
            index: true,
            lazy: () => import("./routes/alat"),
          },
          {
            path: "/alat/calculator",
            lazy: () => import("./routes/alat.calculator"),
          },
          {
            path: "/alat/pomodoro",
            lazy: () => import("./routes/alat.pomodoro"),
          },
          {
            path: "/alat/clear-cache",
            lazy: lazyWrapper(() => import("./routes/clear-cache")),
          },
        ],
      },
      {
        path: "/quran",
        element: <Layout />,
        children: [
          {
            path: "/quran",
            index: true,
            lazy: () => import("./routes/quran"),
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
