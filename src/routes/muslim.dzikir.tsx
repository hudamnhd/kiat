import { Header } from "#src/components/custom/header";
import { ScrollTopButton } from "#src/components/custom/scroll-to-top.tsx";
import TextArab from "#src/components/custom/text-arab.tsx";
import { buttonVariants } from "#src/components/ui/button";
import { data } from "#src/constants/dzikr.ts";
import { FONT_SIZE } from "#src/constants/prefs";
import {
  AyatBookmark,
  type Bookmark,
  save_bookmarks,
} from "#src/utils/bookmarks";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { Heart, Minus, Moon, Plus, Sun } from "lucide-react";
import React from "react";
import { useRouteLoaderData } from "react-router";

const BOOKMARK_KEY = "BOOKMARK";
type AddIndex<T> = T & { index: string };

type SholawatItem = (typeof data.dzikr)[number];
type SholawatItemWithIndex = AddIndex<SholawatItem>;

function getWaktuSekarang(): string {
  const currentHour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)

  if (currentHour >= 3 && currentHour < 15) {
    return "pagi"; // Jam 3 pagi hingga jam 3 sore
  } else {
    return "petang"; // Jam 3 sore hingga jam 3 pagi
  }
}

const time = getWaktuSekarang();

function removeHtmlTagsExceptNewline(input: string): string {
  return input
    .replace(/<(?!\/?br\s*\/?)[^>]+>/g, "") // Hapus semua tag HTML kecuali <br>
    .replace(/@/g, "\n\n"); // Ganti '@' dengan newline
}

export function Component() {
  const { dzikr } = data;
  const loaderRoot = useRouteLoaderData("muslim");
  const opts = loaderRoot?.opts || {};

  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  React.useEffect(() => {
    const buttons = document.querySelectorAll(".tasbih-counter-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const counterDisplay = event.target
          ?.closest(".tasbih-counter-container")
          .querySelector(".counter-display");
        const currentValue = parseInt(counterDisplay.textContent || "0", 10);
        counterDisplay.textContent = (currentValue + 1).toString(); // Increment counter
      });
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", () => {});
      });
    };
  }, []);

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
    .filter((item) => item.type === "dzikir")
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
      "dzikir",
      {
        title: ayat.title,
        arab: ayat.arabic,
        latin: ayat.arabic_latin,
        translation: ayat.translated_id,
        source: `/muslim/dzikir?index=${ayat.index}`,
      },
      [...bookmarks],
    );
    console.warn(
      "DEBUGPRINT[13]: muslim.dzikir.tsx:93: newBookmarks=",
      newBookmarks,
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
      <Header redirectTo="/" title={`Dzikir ${time}`} />
      <div className="flex items-center gap-x-3 justify-center text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        <span>Dzikir {time}</span>
      </div>

      <div>
        {dzikr
          .filter((d) => d.time === "" || d.time === time)
          .map((d, index) => {
            const ayat = {
              ...d,
              index: index.toString(),
            };
            const fontWeight = opts.fontWeight;
            const fontSize = prefsOption?.fontSize || "1.5rem";
            const lineHeight = prefsOption?.lineHeight || "3.5rem";
            const content =
              `<div style="font-weight:  ${fontWeight}; font-size: ${fontSize}; line-height:  ${lineHeight};" class="${opts?.fontStyle}">`;
            const arabicContent = removeHtmlTagsExceptNewline(ayat.arabic);

            const translateContent = ayat?.translated_id
              .replace(/@/g, "<br/><br/>")
              .replace(/(\.)(\s|$)/g, "$1<br />");

            const _source = `/muslim/dzikir?index=${ayat.index}`;
            const isFavorite = bookmarks_ayah.some((fav) =>
              fav.source === _source
            );
            return (
              <div
                key={index}
                className="group tasbih-counter-container relative pb-4 border-t"
              >
                <div
                  className={cn(
                    "flex items-center justify-between gap-x-2 mb-2 border-b p-2.5 bg-linear-to-br from-muted/20 to-accent/20",
                    isFavorite &&
                      "from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20",
                  )}
                >
                  <div>
                    <div className="font-medium text-lg sm:text-xl leading-snug">
                      {ayat.title}
                    </div>
                    <div className="flex items-center gap-x-1 text-muted-foreground text-xs font-semibold">
                      {ayat?.note && (
                        <span className="">
                          {ayat.note.replace(/@/, "")}
                        </span>
                      )}

                      {ayat.time !== "" && "Setiap "}
                      {ayat.time === time &&
                        (
                          <span className="flex items-center gap-x-1.5">
                            <span className="">{time}</span>
                            <Sun className="w-4 h-4 rotate-0 transition-all" />
                          </span>
                        )}
                    </div>
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

                <div className="px-4">
                  <TextArab
                    text={arabicContent}
                    className="whitespace-pre-line"
                  />

                  <div className="flex items-center justify-end gap-4 my-2">
                    <span className="counter-display text-2xl font-bold">
                      0
                    </span>
                    <button
                      className={cn(
                        buttonVariants({ size: "icon", variant: "outline" }),
                        "tasbih-counter-btn",
                      )}
                    >
                      <Plus />
                    </button>
                  </div>
                  {opts?.showTranslation === "on" && (
                    <div className="">
                      <div className="translation-text">
                        <div
                          className="max-w-none prose dark:prose-invert"
                          dangerouslySetInnerHTML={{
                            __html: translateContent,
                          }}
                        />
                      </div>

                      <div className="font-normal text-start bg-muted p-3 rounded-md mt-2">
                        {ayat.faedah && (
                          <React.Fragment>
                            <div className="flex items-center text-sm mb-1.5 font-medium opacity-80">
                              <Minus strokeWidth={2} />
                              Faedah
                            </div>
                            <div
                              className={cn(
                                "prose prose-sm dark:prose-invert max-w-none text-justify",
                                opts?.fontTranslationSize,
                              )}
                              dangerouslySetInnerHTML={{
                                __html: ayat.faedah.replace(
                                  /(\[.*?\])/g,
                                  "\n\n$1",
                                ),
                              }}
                            />
                          </React.Fragment>
                        )}
                        {ayat.narrator && (
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            {ayat.narrator.replace(/@/g, "\n")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <ScrollTopButton />
    </>
  );
}
