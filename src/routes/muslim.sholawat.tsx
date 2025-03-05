import { FONT_SIZE } from "#/src/constants/prefs";
import sholawat from "#/src/constants/sholawat.json";
import { Header } from "#src/components/custom/header";
import TextArab from "#src/components/custom/text-arab.tsx";
import {
  AyatBookmark,
  type Bookmark,
  save_bookmarks,
} from "#src/utils/bookmarks";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { Heart } from "lucide-react";
import React from "react";
import { useRouteLoaderData } from "react-router";

const BOOKMARK_KEY = "BOOKMARK";
type AddIndex<T> = T & { index: string };

type SholawatItem = (typeof sholawat)[number];
type SholawatItemWithIndex = AddIndex<SholawatItem>;

export function Component() {
  const loaderRoot = useRouteLoaderData("muslim");
  const opts = loaderRoot?.opts || {};

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
    .filter((item) => item.type === "sholawat")
    .map((item) => {
      const params = new URLSearchParams(item.source.split("?")[1]);
      return {
        created_at: item.created_at,
        id: params.get("index"),
        source: item.source,
      };
    });

  const toggleBookmark = (ayat: SholawatItemWithIndex) => {
    const newBookmarks = save_bookmarks(
      "sholawat",
      {
        title: ayat.nama,
        arab: ayat.arab,
        latin: ayat.latin,
        translation: ayat.arti,
        source: `/muslim/sholawat?index=${ayat.index}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === ayat.index);

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
  return (
    <>
      <Header redirectTo="/" title="Sholawat" />
      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        Sholawat
      </div>

      {sholawat.map((d, index: number) => {
        const ayat = {
          ...d,
          index: index.toString(),
        };

        const _source = `/muslim/sholawat?index=${ayat.index}`;
        const isFavorite = bookmarks_ayah.some((fav) => fav.source === _source);
        return (
          <div key={index} className="group relative  border-t pb-4">
            <div
              className={cn(
                "flex items-center justify-between gap-x-2 mb-2 border-b p-2.5 bg-linear-to-br from-muted/20 to-accent/20",
                isFavorite &&
                  "from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20",
              )}
            >
              <div className="font-medium text-lg sm:text-xl">
                {ayat.nama}
              </div>

              <button
                onClick={() => toggleBookmark(ayat)}
                className={cn(
                  "flex-none order-0 sm:order-1 bg-linear-to-br from-muted to-accent size-9 [&_svg]:size-5 inline-flex gap-2 items-center justify-center rounded-lg",
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
            <TextArab
              className="px-4"
              text={ayat.arab}
            />
            <div className="px-4">
              {opts?.showLatin === "on" && (
                <div
                  className="latin-text prose max-w-none pb-2 mb-2 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: ayat.latin,
                  }}
                />
              )}
              {opts?.showTranslation === "on" && (
                <div
                  className="translation-text mt-1 prose max-w-none text-accent-foreground"
                  dangerouslySetInnerHTML={{
                    __html: ayat.arti,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
