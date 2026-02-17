import { Header } from "#src/components/custom/header";
import { ScrollTopButton } from "#src/components/custom/scroll-to-top.tsx";
import TextArab from "#src/components/custom/text-arab.tsx";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import ky from "ky";
import { Heart } from "lucide-react";
import { useLoaderData, useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";

const BOOKMARK_KEY = "BOOKMARK";

const sumber = [
  "quran",
  "hadits",
  "pilihan",
  "harian",
  "ibadah",
  "haji",
  "lainnya",
];

export type ResponseData = {
  status: boolean;
  request: {
    path: string;
  };
  data: Datum[];
};

export type Datum = {
  arab: string;
  indo: string;
  judul: string;
  source: "quran";
};

export async function Loader({ params }: LoaderFunctionArgs) {
  const { source } = params;

  if (!source) {
    throw new Error("404: Source not found");
  }

  if (!sumber.includes(source)) {
    throw new Error("404: Source not found");
  }

  const CACHE_KEY = `/muslim/doa/${source}`;
  const cached_data = await getCache(CACHE_KEY);

  if (cached_data) return cached_data;

  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/doa/sumber" });
  const res = await api.get(source).json<ResponseData>();

  if (!res.status) {
    throw new Response("Not Found", { status: 404 });
  }

  const data = {
    label: res.request.path.replace(/\//g, " ").replace(/sumber/gi, ""), // Ganti '/' dengan spasi
    source: res.request.path.replace(/\//g, " ").trim().split(" ").pop(),
    data: res.data,
  };

  await setCache(CACHE_KEY, data);
  return data;
}

export function Component() {
  const loaderData = useLoaderData<typeof Loader>();

  return (
    <React.Fragment>
      <DoaView>
        <div className="text-center p-2 border-b">
          <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize">
            Do'a {loaderData.source}
          </div>
          <p className="text-muted-foreground -mt-1">
            Kumpulan do'a {loaderData.source === "pilihan" ? "" : "dari"}{" "}
            {loaderData.source}
          </p>
        </div>
      </DoaView>
    </React.Fragment>
  );
}

import {
  AyatBookmark,
  type Bookmark,
  save_bookmarks,
} from "#src/utils/bookmarks";

import { FONT_SIZE } from "#/src/constants/prefs";
import { motion, useScroll, useSpring } from "framer-motion";
import React from "react";

const DoaView = ({ children }: { children: React.ReactNode }) => {
  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const loaderData = useLoaderData<typeof Loader>();
  const opts = parentLoader?.opts;

  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);
  const { data: items } = useLoaderData<typeof Loader>();

  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await getCache(BOOKMARK_KEY);
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }
    };

    load_bookmark_from_lf();
  }, []);

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === "doa")
    .map((item) => {
      const params = new URLSearchParams(item.source.split("?")[1]);
      return {
        created_at: item.created_at,
        id: params.get("index"),
        source: item.source,
      }; // Ambil nilai "ayat"
    });

  const toggleBookmark = (doa) => {
    const newBookmarks = save_bookmarks(
      "doa",
      {
        title: doa.judul,
        arab: doa.arab,
        translation: doa.indo,
        source: `/muslim/doa?index=${doa.index}&source=${doa.source}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === doa.index);

    if (is_saved) {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(newBookmarks);
    } else {
      setBookmarks(newBookmarks);
    }
  };

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks: AyatBookmark[]) => {
      await setCache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);

  const { scrollYProgress } = useScroll({});

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <React.Fragment>
      <motion.div
        className="z-20 bg-primary max-w-3xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />
      <div
        style={{
          position: "relative",
        }}
      >
        <Header
          redirectTo="/muslim/doa"
          title={`Do'a ${loaderData.source}`}
        />
        {children}
        {items.map((d, index) => {
          const doa = {
            ...d,
            index: index.toString(),
          };

          const _source = `/muslim/doa?index=${doa.index}&source=${doa.source}`;

          const isFavorite = bookmarks_ayah.some(
            (fav) => fav.source === _source,
          );
          return (
            <div key={index} className="w-full border-b pb-5">
              <div className="group relative w-full">
                <div
                  className={cn(
                    "flex items-center justify-between gap-x-2 mb-2 border-b py-2.5 px-4 bg-linear-to-br from-muted/20 to-accent/20",
                    isFavorite &&
                      "from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20",
                  )}
                >
                  <div className="font-medium text-lg line-clamp-1">
                    {doa.judul}
                  </div>

                  <button
                    onClick={() => toggleBookmark(doa)}
                    className={cn(
                      "flex-none  bg-linear-to-br from-muted to-accent size-9 [&_svg]:size-5 inline-flex gap-2 items-center justify-center rounded-lg",
                      isFavorite &&
                        "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
                    )}
                  >
                    <Heart
                      className={cn(
                        "text-muted-foreground",
                        isFavorite && "text-rose-600 dark:text-rose-400",
                      )}
                    />
                  </button>
                </div>

                <div className="p-2">
                  <TextArab text={doa.doa} />
                  <div
                    className="translation-text prose dark:prose-invert max-w-none px-2"
                    dangerouslySetInnerHTML={{
                      __html: doa.artinya,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ScrollTopButton />
    </React.Fragment>
  );
};
