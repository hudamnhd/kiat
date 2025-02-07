import {
  BOOKMARK_KEY,
  FAVORITESURAH_KEY,
  LASTREAD_KEY,
  LASTVISITPAGE_KEY,
  PLANREAD_KEY,
  SETTING_PREFS_KEY,
} from "#/src/constants/key";
import { FONT_SIZE } from "#/src/constants/prefs";
import { Header } from "#src/components/custom/header";
import {
  ScrollToFirstIndex,
  ScrollTopButton,
} from "#src/components/custom/scroll-to-top.tsx";
import { Button, buttonVariants } from "#src/components/ui/button";
import { Popover } from "#src/components/ui/popover";
import { type AyatBookmark, save_bookmarks } from "#src/utils/bookmarks";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import {
  getSurahByIndex,
  getSurahByPage,
  QuranReadingPlan,
  updateReadingProgress,
} from "#src/utils/misc.quran.ts";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dot,
  Minus,
  Star,
} from "lucide-react";
import React from "react";
import type { MenuItemProps } from "react-aria-components";
import { Menu, MenuItem, MenuTrigger } from "react-aria-components";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useRouteLoaderData } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";
import { CommandNavigation } from "./muslim.quran.navigation";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;

  const prefs = await getCache(SETTING_PREFS_KEY);

  let style = "indopak" as "indopak" | "kemenag" | "uthmani" | "imlaei";

  let mode = prefs?.modeQuran ? prefs?.modeQuran : "page";
  let translation = prefs?.showTranslation
    ? prefs?.showTranslation == "on"
      ? true
      : false
    : true;
  let tafsir = prefs?.showTafsir
    ? prefs?.showTafsir == "on"
      ? true
      : false
    : false;
  let translationSource = prefs?.translationSource
    ? prefs?.translationSource
    : "kemenag";

  switch (prefs?.fontStyle) {
    case "font-indopak":
      style = "indopak";
      break;
    case "font-kemenag":
      style = "kemenag";
      break;
    case "font-uthmani-v2-reguler":
      style = "imlaei";
      break;
    case "font-uthmani-v2-bold":
      style = "imlaei";
      break;
    case "font-uthmani-hafs":
      style = "uthmani";
      break;
    default:
      style = "kemenag";
      break;
  }

  const response = await getSurahByPage({
    page: Number(id),
    style: style,
    translation,
    showTafsir: tafsir,
    translationSource,
  });

  // await getSurahByIndex({
  //     index: Number(id),
  //     style: style,
  //     translation,
  //     showTafsir: tafsir,
  //     translationSource,
  // });
  const _recent_data = [
    `${response?.surah[0].name.id}|${
      response?.ayah[0].vk.replace(
        ":",
        "|",
      )
    }|${id}|${response?.juz}`,
  ];
  //
  if (mode === "page") {
    const PAGE = Number(id);
    const plan_read = (await getCache(PLANREAD_KEY)) || [];
    if (plan_read.length > 0) {
      const today = format(new Date(), "yyyy-MM-dd");
      const progressToday = plan_read.find(
        (d: QuranReadingPlan) => d.date === today,
      );
      let target = updateReadingProgress(plan_read, progressToday.day, [PAGE]);
      await setCache(PLANREAD_KEY, target);
    }
    saveLastVisitPage(_recent_data);
  }
  return { ...response, query: { surah, ayah } };
}

function ActionItem(props: MenuItemProps) {
  return (
    <MenuItem
      {...props}
      className="bg-background relative flex gap-1 select-none items-center rounded-sm px-2 py-1.5 outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-sm"
    />
  );
}

// Fungsi untuk mengonversi angka ke format Arab
const toArabicNumber = (number: number) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};

import { useVirtualizer } from "@tanstack/react-virtual";

const saveFavoriteSurah = async (data: any) => {
  const savedData = (await getCache(FAVORITESURAH_KEY)) || [];

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = !savedData.includes(data)
    ? [...savedData, data]
    : savedData.filter((currentId: string) => currentId !== data);
  await setCache(FAVORITESURAH_KEY, updatedData);
};

const saveLastVisitPage = async (data: any) => {
  const savedData = (await getCache(LASTVISITPAGE_KEY)) || [];

  const updatedData = Array.from(new Set([...savedData, ...data]));
  await setCache(LASTVISITPAGE_KEY, updatedData);
};

function ButtonStar({ index }: { index: number }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const checkFavoriteSurah = async (index: number) => {
      const savedDataFavorite = (await getCache(FAVORITESURAH_KEY)) || [];
      setIsFavorite(savedDataFavorite.includes(index));
    };

    checkFavoriteSurah(index);
  }, [index]);

  return (
    <Button
      variant="ghost"
      title={isFavorite
        ? "Hapus dari daftar favorit"
        : "Tambahkan ke daftar favorit"}
      onPress={() => {
        saveFavoriteSurah(index);
        setIsFavorite(!isFavorite);
      }}
      className="[&_svg]:size-4"
      size="icon"
    >
      <Star
        className={cn(
          isFavorite
            ? "text-orange-500 fill-orange-500 dark:text-orange-400 dark:fill-orange-400"
            : "",
        )}
      >
        <title>Surat Favorit</title>
      </Star>
    </Button>
  );
}

export function Component() {
  const { page, juz, surah } = useLoaderData<typeof Loader>();

  const title = `Hal ${page.p}`;
  const subtitle = `Juz' ${juz} - ` + surah[0].name.id;
  return (
    <React.Fragment>
      <VirtualizedListSurah>
        <Header
          virtualizer={false}
          redirectTo="/muslim/quran"
          title={title}
          subtitle={subtitle}
        >
          <CommandNavigation />
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "ghost" }),
              "prose-none [&_svg]:size-4",
            )}
            to={`/muslim/quran-v2/${page.p}`}
            title="Quran mirip mushaf"
          >
            <BookOpen />
          </Link>
          {/*<ButtonStar index={1} />*/}
        </Header>
        <div
          id="pagination-page"
          className="ml-auto flex items-center justify-center gap-3 pt-5"
        >
          <Link
            className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
            title="Surat sebelumnya"
            to={page?.p === 1 ? "#" : `/muslim/quran/${page?.p - 1}`}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className="text-accent-foreground text-sm">
            Halaman <strong>{page?.p}</strong> dari <strong>604</strong>
          </span>
          <Link
            className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
            title="Surat selanjutnya"
            to={page?.p === 604 ? "#" : `/muslim/quran/${page?.p + 1}`}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
      </VirtualizedListSurah>

      <ScrollTopButton />
    </React.Fragment>
  );
}

import TextArab from "#src/components/custom/text-arab.tsx";
import { motion, useScroll, useSpring } from "framer-motion";

const titleElement = document.getElementById("title-page");
const navbarElement = document.getElementById("navbar");
const saveLastRead = async (lastRead: any) => {
  await setCache(LASTREAD_KEY, lastRead);
};

const save_bookmark_to_lf = async (bookmarks: AyatBookmark[]) => {
  await setCache(BOOKMARK_KEY, bookmarks);
};

const handleScrollUp = () => {
  window?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
};
const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const [children1, children2] = React.Children.toArray(children);
  const {
    bismillah,
    surah,
    ayah: items,
    page,
    query,
    translationSource,
    tafsirSource,
  } = useLoaderData<typeof Loader>();
  const surat = surah[0];

  const parentRef = React.useRef<HTMLDivElement>(null);
  const ayahRefs = React.useRef<Map<number, HTMLDivElement | null>>(new Map());
  const currentSurah = React.useRef<{
    name: string;
    index: number;
    ayah: number;
    page: number;
  }>({
    name: surat.name.id,
    index: surat.index,
    ayah: 1,
    page: page.p,
  });

  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  const { scrollYProgress } = useScroll({});

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [lastRead, setLastRead] = React.useState<any | null>(
    parentLoader?.lastRead || null,
  );
  const [bookmarks, setBookmarks] = React.useState<AyatBookmark[]>(
    parentLoader?.bookmarks || [],
  );

  React.useEffect(() => {
    if (query.surah && query.ayah) {
      const q = `${query.surah}:${query.ayah}`;
      const getIndex = items.findIndex((d: { vk: string }) => d.vk === q);
      sleep(50).then(() => scrollToAyat(getIndex));
    } else {
      handleScrollUp();
    }
  }, [page.p]);

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === "ayat") // Hanya ambil item dengan type "ayat"
    .map((item) => {
      return {
        created_at: item.created_at,
        id: item.id,
      }; // Ambil nilai "ayat"
    });

  type BookmarkAyah = {
    source: string;
    translation?: string;
    id: string;
    title: string;
    arab: string;
  };
  // Fungsi untuk toggle favorit

  const toggleBookmark = React.useCallback((data: BookmarkAyah) => {
    const newBookmarks = save_bookmarks("ayat", data, [...bookmarks]);

    const is_saved = bookmarks_ayah.find((fav) => fav.id === data.id);

    if (is_saved) {
      const _newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(_newBookmarks);

      save_bookmark_to_lf(_newBookmarks);
    } else {
      setBookmarks(newBookmarks);
      save_bookmark_to_lf(newBookmarks);
    }
  }, []);

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = React.useCallback((data: BookmarkAyah) => {
    const data_bookmark = {
      ...data,
      created_at: new Date().toISOString(),
    };
    const isLastRead = lastRead?.id === id;
    if (isLastRead) {
      setLastRead(null);
      saveLastRead(null);
    } else {
      setLastRead(data_bookmark);
      saveLastRead(data_bookmark);
    }
  }, []);

  const scrollToAyat = (index: number) => {
    const element = ayahRefs.current.get(index);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const relativeTime = lastRead
    ? formatDistanceToNow(new Date(lastRead.created_at), {
      addSuffix: true,
      includeSeconds: true,
      locale: id,
    })
    : null;

  const title = `Hal ${page.p} - ${currentSurah.current.name}`;
  // 🔥 Update Surah Index Saat Scroll
  // React.useEffect(() => {
  //   const updateSurah = () => {
  //     const parentHeight = parentRef.current?.clientHeight;
  //
  //     const centerOffset = (rowVirtualizer.scrollOffset ?? 0) +
  //       (parentHeight ?? 0) / 2;
  //
  //     // 🔥 Cari item yang berada di tengah viewport
  //     const centerItem = rowVirtualizer.getVirtualItems().find(
  //       (item) =>
  //         item.start <= centerOffset && item.start + item.size > centerOffset,
  //     );
  //
  //     if (centerItem) {
  //       const item = items[centerItem.index];
  //       const surahIndex = item.vk.split(":")[0]; // Ambil nomor Surah
  //       const ayahIndex = item.vk.split(":")[1]; // Ambil nomor Surah
  //
  //       const _surah = surah.find((d: { index: number }) =>
  //         d.index === Number(surahIndex)
  //       );
  //       if (_surah) {
  //         // setCurrentSurah(_surah.name.id);
  //         currentSurah.current = {
  //           name: _surah.name.id,
  //           index: _surah.index,
  //           ayah: ayahIndex,
  //           page: page.p,
  //         };
  //       } else {
  //         currentSurah.current = {
  //           name: surat.name.id,
  //           index: surat.index,
  //           ayah: 1,
  //           page: page.p,
  //         };
  //       }
  //     }
  //   };
  //
  //   updateSurah();
  //   if (titleElement instanceof HTMLSpanElement) {
  //     titleElement.innerText = title;
  //   }
  //
  //   const handleVirtualScroll = () => {
  //     const currentScrollPos = rowVirtualizer?.scrollOffset || 0;
  //     if (navbarElement instanceof HTMLElement) {
  //       if (prevScrollPos.current > currentScrollPos) {
  //         navbarElement.style.top = "0"; // Tampilkan navbar
  //       } else {
  //         navbarElement.style.top = `-${navbarElement.offsetHeight}px`; // Sembunyikan navbar
  //       }
  //     }
  //     prevScrollPos.current = currentScrollPos || 0;
  //   };
  //
  //   // 🔥 Gunakan React Effect untuk mendeteksi perubahan scrollOffset
  //   handleVirtualScroll();
  // }, [rowVirtualizer.scrollOffset]);

  return (
    <React.Fragment>
      <motion.div
        className="z-20 bg-primary  sm:max-w-2xl mx-auto"
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

      <div className="divide-y" ref={parentRef} id="container-page">
        {children1}
        {items.map((item, index) => {
          const surah_index = item.vk.split(":")[0];
          const ayah_index = item.vk.split(":")[1];
          const id = item.vk;
          const key = Number(ayah_index);

          const _surah = surah.find(
            (d: { index: number }) => d.index === Number(surah_index),
          );
          const surah_name = _surah?.name.id || surah[0].name.id;
          const isFavorite = bookmarks_ayah.some((fav) => fav.id === id);
          const isLastRead = lastRead?.id === id;
          const bookmark_data = {
            id,
            title: surah_name + ":" + ayah_index,
            arab: item.ta,
            ...(item?.tt ? { translation: item.tt } : {}),
            source:
              `/muslim/quran/${page.p}?surah=${surah_index}&ayah=${ayah_index}`,
          };

          return (
            <div ref={(el) => ayahRefs.current.set(index, el)} key={item.vk}>
              {key === 1 && opts?.showTranslation === "on" && (
                <React.Fragment>
                  <details
                    className={cn(
                      "group [&_summary::-webkit-details-marker]:hidden px-4 py-2 border-b",
                    )}
                  >
                    <summary className="flex cursor-pointer items-center gap-1.5 outline-hidden w-full justify-start">
                      <div className="font-medium text-sm text-muted-foreground">
                        Tentang Surat {surah_name}
                      </div>

                      <svg
                        className="size-4 shrink-0 transition duration-300 group-open:-rotate-180 opacity-80"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>

                    <div className="font-normal text-start group-open:animate-slide-top group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300">
                      <div className="flex text-center items-center justify-center max-w-none my-1.5 font-semibold whitespace-pre-line text-accent-foreground border-b">
                        <span className="">Surat ke- {surat.index}</span>
                      </div>

                      <div
                        className={cn(
                          "prose prose-zinc dark:prose-invert max-w-none whitespace-pre-line mb-2 text-justify",
                          opts?.fontTranslationSize,
                        )}
                      >
                        {item?.td
                          ? item.td
                          : _surah?.tafsir?.id
                          ? _surah?.tafsir?.id.replace(
                            /(.{150,}?[\.\!\?])\s+/g,
                            "$1\n\n",
                          )
                          : "Tidak ada deskripsi surat ini"}
                      </div>
                      <div className="text-muted-foreground text-xs py-2 hidden">
                        Sumber:
                        <br />
                        <div className="flex flex-wrap items-center justify-between">
                          <span>Muhammad Quraish Shihab et al</span>
                          <span>https://tanzil.net/download</span>
                        </div>
                      </div>
                    </div>
                  </details>

                  {surat.index !== 1 && (
                    <div
                      dir="rtl"
                      className="break-normal w-full border-b bg-muted/50 py-0.5"
                    >
                      <div
                        className={cn(
                          "font-bismillah text-center",
                          opts?.fontStyle,
                        )}
                        style={{
                          fontWeight: opts?.fontWeight,
                          fontSize: prefsOption?.fontSize || "1.5rem",
                          lineHeight: prefsOption?.lineHeight || "3.5rem",
                        }}
                      >
                        {bismillah}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}
              <div
                id={"quran" + surah_index + ayah_index}
                key={key}
                className={cn(
                  "group relative p-2",
                  isFavorite &&
                    "bg-gradient-to-r from-background via-background to-muted/50",
                )}
              >
                <div
                  className={cn(
                    " flex justify-start gap-1.5 w-full items-center",
                  )}
                >
                  <MenuTrigger>
                    <Button
                      variant="secondary"
                      aria-label="Menu"
                      size="sm"
                      title={`Menu ayat ${key}`}
                      className="h-8 gap-1 tracking-wide font-bold"
                    >
                      {item.vk}
                    </Button>
                    <Popover
                      placement="bottom"
                      className=" bg-background p-1 w-44 overflow-auto rounded-md shadow-lg entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left"
                    >
                      <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
                        {surah_name} - Ayat {ayah_index}
                      </div>
                      <Menu className="outline-hidden">
                        <ActionItem
                          id="new"
                          onAction={() =>
                            toggleBookmark(bookmark_data)}
                        >
                          <Star
                            className={cn(
                              "mr-1 size-3",
                              isFavorite &&
                                "fill-orange-500 text-orange-500 dark:text-orange-400 dark:fill-orange-400",
                            )}
                          />
                          Bookmark
                        </ActionItem>
                        <ActionItem
                          id="open"
                          onAction={() =>
                            handleRead(bookmark_data)}
                        >
                          <Bookmark
                            className={cn(
                              "mr-1 w-4 h-4",
                              isLastRead && "fill-blue-500 text-blue-500",
                            )}
                          />
                          Terakhir Baca
                        </ActionItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                  {isFavorite && (
                    <Button
                      onPress={() => toggleBookmark(bookmark_data)}
                      aria-label="Menu"
                      variant="secondary"
                      size="icon"
                      className={cn("h-8 w-8")}
                      title="Hapus bookmark"
                    >
                      <Star
                        className={cn(
                          "fill-slate-600 text-slate-600 dark:fill-slate-400 dark:text-slate-400",
                        )}
                      />
                    </Button>
                  )}
                  {isLastRead
                    ? (
                      <div
                        className={cn(
                          buttonVariants({ variant: "secondary" }),
                          "h-8 px-2 text-xs gap-1",
                        )}
                      >
                        <Bookmark
                          className={cn(
                            "fill-slate-600 text-slate-600 dark:fill-slate-400 dark:text-slate-400",
                          )}
                        />
                        <span className="truncate max-w-[150px]">
                          {relativeTime}
                        </span>
                      </div>
                    )
                    : <div />}
                </div>

                <TextArab text={item.ta} ayah={Number(item.vk.split(":")[1])} />

                {item?.tt && opts?.showTranslation === "on" && (
                  <React.Fragment>
                    <div
                      title={"Sumber: " + translationSource?.name}
                      className={cn(
                        "prose dark:prose-invert px-2 text-justify max-w-none  whitespace-pre-line",
                        opts?.fontTranslationSize,
                      )}
                    >
                      {item.tt} ({item.vk.split(":")[1]})
                    </div>
                    {
                      /*<div className="hidden sm:flex items-center text-xs text-muted-foreground px-2 mt-0.5">
                      <Minus strokeWidth={1} />
                      {translationSource?.name}
                    </div>*/
                    }
                  </React.Fragment>
                )}

                {item?.ttf && opts?.showTafsir === "on" && (
                  <React.Fragment>
                    <details
                      className={cn(
                        "group [&_summary::-webkit-details-marker]:hidden  open:bg-muted/50 open:ring-1 ring-border rounded-md mt-2",
                      )}
                    >
                      <summary className="flex gap-3 cursor-pointer items-center outline-hidden w-full justify-start group-open:bg-muted group-open:mb-2 px-2 py-1.5 rounded-t-md group-open:border-b group-open:px-3">
                        <div className="font-medium text-sm prose dark:prose-invert">
                          Tafsir ayat {item.vk.split(":")[1]}
                        </div>
                        <svg
                          className="size-4 shrink-0 transition duration-300 group-open:-rotate-180 opacity-80"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>

                      <div className="font-normal text-start group-open:animate-slide-top group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300 px-3">
                        <div className="hidden sm:flex items-center text-xs text-muted-foreground mt-0.5">
                          <Minus strokeWidth={1} />
                          {tafsirSource?.title}
                        </div>
                        <div
                          className={cn(
                            "prose dark:prose-invert max-w-none whitespace-pre-line my-2 text-justify",
                            opts?.fontTranslationSize,
                          )}
                        >
                          {item?.ttf
                            ? item.ttf
                            : "Tidak ada deskripsi surat ini"}
                        </div>
                        <div className="text-muted-foreground text-xs py-2">
                          Sumber:
                          <br />
                          <div className="flex flex-wrap items-center justify-between">
                            <span>{tafsirSource?.name}</span>
                            <span>{tafsirSource?.href}</span>
                          </div>
                        </div>
                      </div>
                    </details>
                  </React.Fragment>
                )}
              </div>
            </div>
          );
        })}

        {children2}
      </div>
      {/*<ScrollToFirstIndex handler={scrollToFirstAyat} container={parentRef} />*/}
    </React.Fragment>
  );
};
