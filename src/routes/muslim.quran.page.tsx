import { Header } from "#src/components/custom/header";
import { ScrollToFirstIndex } from "#src/components/custom/scroll-to-top.tsx";
import { Badge } from "#src/components/ui/badge";
import { Button, buttonVariants } from "#src/components/ui/button";
import { Label } from "#src/components/ui/label";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#src/components/ui/popover";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { getSurahByPage } from "#src/utils/misc.quran.ts";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import React from "react";
import type { SliderProps } from "react-aria-components";
import {
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import type { LoaderFunctionArgs } from "react-router";
import {
  Link,
  useLoaderData,
  useNavigation,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";

const preBismillah = {
  text: {
    ar:
      "\ufeff\u0628\u0650\u0633\u0652\u0645\u0650\u0020\u0627\u0644\u0644\u0651\u064e\u0647\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650",
    read: "Bismillāhir-raḥmānir-raḥīm(i). ",
  },
  translation: {
    id: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
  tafsir: {
    text: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
};
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const SETTING_PREFS_KEY = "SETTING_PREFS_KEY";

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;

  const prefs = await get_cache(SETTING_PREFS_KEY);
  let style = "indopak" as "indopak" | "kemenag" | "uthmani" | "imlaei";
  let translation = prefs?.font_translation == "on" ? true : false;

  switch (prefs?.font_type) {
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
    case "font-indopak":
      style = "indopak";
      break;
    default:
      style = "kemenag";
      break;
  }
  const response = await getSurahByPage({
    page: Number(id),
    style: style,
    translation,
  });

  return { ...response, query: { surah, ayah } };
}

interface MySliderProps<T> extends SliderProps<T> {
  label?: string;
  thumbLabels?: string[];
}

function MySlider<T extends number | number[]>({
  label,
  thumbLabels,
  ...props
}: MySliderProps<T>) {
  return (
    <Slider {...props}>
      {label && <Label>{label}</Label>}
      <SliderOutput className="text-sm text-right flex justify-center">
        {({ state }) =>
          state.values.map((_, i) => state.getThumbValueLabel(i)).join(" – ")}
      </SliderOutput>
      <SliderTrack className="relative w-full h-2 bg-primary/20 rounded mt-2 px-2">
        {({ state }) => {
          const thumb1Percent = state.getThumbPercent(0) * 100;
          const thumb2Percent = state.getThumbPercent(1) * 100;

          return (
            <>
              {/* Fill */}
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{
                  left: `${Math.min(thumb1Percent, thumb2Percent)}%`,
                  width: `${Math.abs(thumb2Percent - thumb1Percent)}%`,
                }}
              />
              {/* Thumbs */}
              {state.values.map((_, i) => (
                <SliderThumb
                  key={i}
                  index={i}
                  className="absolute w-3 h-3 bg-background ring-2 ring-primary rounded transform -translate-y-1/2 top-2.5"
                  aria-label={thumbLabels?.[i]}
                />
              ))}
            </>
          );
        }}
      </SliderTrack>
    </Slider>
  );
}

import { JollyNumberFieldV2 } from "#src/components/ui/number-field";
import { type AyatBookmark, save_bookmarks } from "#src/utils/bookmarks";
import {
  ArrowUpDown,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Dot,
  Ellipsis,
  Star,
} from "lucide-react";

const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";
const LASTREADSURAH_KEY = "LASTREADSURAH";
const LASTREADAYAHKEY = "LASTREADAYAHKEY";
const FAVORITESURAH_KEY = "FAVORITESURAH";

import { fontSizeOpt } from "#/src/constants/prefs";

import type { MenuItemProps } from "react-aria-components";
import { Menu, MenuItem, MenuTrigger } from "react-aria-components";

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
  const savedData = await get_cache(FAVORITESURAH_KEY) || [];

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = !savedData.includes(data)
    ? [...savedData, data]
    : savedData.filter((currentId: string) => currentId !== data);
  await set_cache(FAVORITESURAH_KEY, updatedData);
};

const saveLastReadSurat = async (data: any) => {
  const savedData = await get_cache(LASTREADSURAH_KEY) || {};

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = {
    ...savedData, // salin data lama
    ...data, // tambahkan atau perbarui data baru
  };
  await set_cache(LASTREADSURAH_KEY, updatedData);
};

const saveLastReadAyahByOfset = async (data: any) => {
  const savedData = await get_cache(LASTREADAYAHKEY) || [];

  const updatedData = Array.from(new Set([...savedData, ...data]));
  await set_cache(LASTREADAYAHKEY, updatedData);
};

function ButtonStar({ index }: { index: number }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const checkFavoriteSurah = async (index: number) => {
      const savedDataFavorite = await get_cache(FAVORITESURAH_KEY) || [];
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
            ? "text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400"
            : "",
        )}
      >
        <title>Surat Favorit</title>
      </Star>
    </Button>
  );
}

export function Component() {
  const { page } = useLoaderData();

  return (
    <React.Fragment>
      {/*<pre className="text-sm">{JSON.stringify(useLoaderData(), null, 2)}</pre>*/}

      <VirtualizedListSurah>
        <div className="ml-auto flex items-center justify-center gap-3 py-5 ">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
            )}
            title="Surat sebelumnya"
            to={parseInt(page?.p as string) === 1
              ? "#"
              : `/muslim/quran/${parseInt(page?.p as string) - 1}`}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className="text-accent-foreground text-sm">
            Halaman <strong>{page?.p}</strong> dari <strong>604</strong>
          </span>
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
            )}
            title="Surat selanjutnya"
            to={parseInt(page?.p as string) === 604
              ? "#"
              : `/muslim/quran/${parseInt(page?.p as string) + 1}`}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
      </VirtualizedListSurah>
    </React.Fragment>
  );
}

import { motion, useScroll, useSpring } from "framer-motion";

const fixTypography = (text: string): string => {
  return text
    // Tambahkan paragraf baru setelah titik, tanda tanya, atau tanda seru diikuti oleh teks baru
    .replace(/([.!?])\s*(\w)/g, (_, p1, p2) => `${p1}\n\n${p2.toUpperCase()}`)
    // Tambahkan break line untuk pola list (1., -, atau *)
    .replace(/(?:^|\n)(\d+\.\s|\-\s|\*\s)(.+)/g, (_, p1, p2) => `\n${p1}${p2}`)
    // Hapus spasi berlebihan
    .replace(/\s{2,}/g, " ")
    // Hapus newline berlebih (jika ada banyak \n berturut-turut)
    .replace(/\n{3,}/g, "\n\n")
    // Hilangkan spasi sebelum tanda baca
    .replace(/\s+([.,!?])/g, "$1")
    // Uppercase huruf pertama di paragraf
    .replace(/(^|\n)(\w)/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
};

const formatTranslationText = (text: string): string => {
  return text
    // Tambahkan paragraf baru setelah kata-kata transisi/topik baru
    .replace(
      /\b(kemudian|selanjutnya|sebagai khatimah|di sela-sela|disebut pula)\b/gi,
      "\n\n$1",
    )
    // Tambahkan newline setelah nama tokoh atau peristiwa penting
    .replace(
      /\b(Mûsâ a\.s\.|Banû Isrâ'îl|Ibrâhîm a\.s\.|Ismâ'îl a\.s\.|Yahudi|Nasrani|Ahl al-Qur'ân)\b/gi,
      "\n$1",
    )
    // Pisahkan daftar dengan newline (untuk kata seperti "seperti" dan "antara lain")
    .replace(/\b(seperti|antara lain)\b/gi, "\n$1")
    // Tambahkan newline jika kalimat terlalu panjang (>120 karakter)
    .replace(/(.{120,}?[\.\!\?])\s+/g, "$1\n\n")
    // Hapus spasi berlebihan sebelum tanda baca
    .replace(/\s+([.,!?])/g, "$1")
    // Trim spasi di awal dan akhir setiap paragraf
    .replace(/^\s+|\s+$/gm, "");
};

const processText = (desc) => {
  return desc
    // Ganti pola '--', ': a.', '; a.', atau '\d ~ ... ~'
    .replace(/--|\d ~ .*? ~|[:;] (\w|\d)\./g, (match, group1) => {
      if (match.startsWith(":") || match.startsWith(";")) {
        return group1 ? `\n ${group1}.` : match; // Cek apakah group1 ada
      } else if (/--/.test(match)) {
        return " "; // Ganti '--' dengan newline
      } else {
        return " "; // Hapus pola '\d ~ ... ~'
      }
    })
    .replace(
      /(?<!\b\w{1,10}\s)(?<!\b\w\.)\s(.{120,}?[\.\!\?])(?!\s?[a-zA-Z]\.|a\.s\.)\s+/g,
      " \$1\n\n",
    ).replace(/([a-z])\.([A-Z])/g, "$1. $2");
  // Tambahkan spasi setelah tanda baca jika hilang
};

function fixDescription(text: string): string {
  // 🔹 1. Hapus hanya `[[` dan `]]`, tetapi pertahankan isinya
  text = text.replace(/\[\[(.*?)\]\]/g, "$1");

  // 🔹 2. Ganti "XXX ~ Kalimat ~" dengan "XXX. Kalimat."
  text = text.replace(/(\d+)\s*~\s*(.*?)\s*~/g, "$1. $2.");

  // 🔹 3. Ganti pola ":" dengan new line
  text = text.replace(/(\S+)\s*:/g, "\n\n$1:\n");

  // 🔹 4. Trim whitespace ekstra
  return text.trim();
}
const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const { surah, ayah: items, page, query } = useLoaderData();
  const surat = surah[0];

  const parentRef = React.useRef<HTMLDivElement>(null);
  const currentSurah = React.useRef<
    { name: string; index: number; ayah: number; page: number }
  >({
    name: surat.name.id,
    index: surat.index,
    ayah: 1,
    page: page.p,
  });

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1]; // Ambil item terakhir
  const lastItemBottom = lastItem ? lastItem.start + lastItem.size : 0; // Posisi akhir item terakhir

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

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
      sleep(50).then(() => scrollToFirstAyat());
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

  const save_bookmark_to_lf = async (bookmarks: AyatBookmark[]) => {
    await set_cache(BOOKMARK_KEY, bookmarks);
  };

  type BookmarkAyah = {
    source: string;
    translation?: string;
    id: string;
    title: string;
    arab: string;
  };
  // Fungsi untuk toggle favorit
  const toggleBookmark = (data: BookmarkAyah) => {
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
  };

  const saveLastRead = async (lastRead: any) => {
    await set_cache(LASTREAD_KEY, lastRead);
  };
  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (data: BookmarkAyah) => {
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
  };

  const scrollToAyat = (index: number) => {
    rowVirtualizer.scrollToIndex(index, {
      align: "start",
    });
  };

  const scrollToFirstAyat = () => {
    rowVirtualizer.scrollToIndex(0, {
      align: "center",
    });
  };

  const relativeTime = lastRead
    ? formatDistanceToNow(new Date(lastRead.created_at), {
      addSuffix: true,
      includeSeconds: true,
      locale: id,
    })
    : null;

  // 🔥 Update Surah Index Saat Scroll
  React.useEffect(() => {
    const updateSurah = () => {
      const parentHeight = parentRef.current?.clientHeight;

      const centerOffset = rowVirtualizer.scrollOffset + parentHeight / 2;

      // 🔥 Cari item yang berada di tengah viewport
      const centerItem = rowVirtualizer.getVirtualItems().find(
        (item) =>
          item.start <= centerOffset && item.start + item.size > centerOffset,
      );

      if (centerItem) {
        const item = items[centerItem.index];
        const surahIndex = item.vk.split(":")[0]; // Ambil nomor Surah
        const ayahIndex = item.vk.split(":")[1]; // Ambil nomor Surah

        const _surah = surah.find((d: { index: number }) =>
          d.index === Number(surahIndex)
        );
        if (_surah) {
          // setCurrentSurah(_surah.name.id);
          currentSurah.current = {
            name: _surah.name.id,
            index: _surah.index,
            ayah: ayahIndex,
            page: page.p,
          };
        } else {
          currentSurah.current = {
            name: surat.name.id,
            index: surat.index,
            ayah: 1,
            page: page.p,
          };
        }
      }

      {
        /*const firstVisibleItem = rowVirtualizer.getVirtualItems().find(
        (item) => item.start >= rowVirtualizer.scrollOffset,
      );

      if (firstVisibleItem) {
        const item = items[firstVisibleItem.index];
        const surahIndex = item.vk.split(":")[0]; // Ambil nomor Surah
        const _surah = surah.find((d: { index: number }) =>
          d.index === Number(surahIndex)
        );
        if (_surah) {
          // setCurrentSurah(_surah.name.id);
          currentSurah.current = {
            name: _surah.name.id,
            index: _surah.index,
          };
        } else {
          currentSurah.current = {
            name: surat.name.id,
            index: surat.index,
          };
        }
      }*/
      }
    };

    updateSurah();
  }, [rowVirtualizer.scrollOffset]);
  const title = `Hal ${page.p} - ${currentSurah.current.name}`;

  return (
    <React.Fragment>
      <TrackAyah currentSurah={currentSurah} />
      <motion.div
        className="z-60 bg-chart-2 max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 52,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />

      <Header redirectTo="/muslim/quran" title={title}>
        <ButtonStar index={currentSurah.current.index} />
      </Header>
      <div
        ref={parentRef}
        className="h-[calc(100vh-55px)]"
        style={{
          overflowAnchor: "none",
          overflow: "auto",
          position: "relative",
          contain: "strict",
        }}
      >
        <div
          className="divide-y"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const surah_index = item.vk.split(":")[0];
            const ayah_index = item.vk.split(":")[1];
            const id = item.vk;
            const key = Number(ayah_index);

            const _surah = surah.find((d: { index: number }) =>
              d.index === Number(surah_index)
            );
            const surah_name = _surah.name.id || surah[0].name.id;
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
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start + 0}px)`, // Tambahkan offset untuk children
                }}
              >
                {key === 1 && (
                  <React.Fragment>
                    <details
                      className={cn(
                        "group [&_summary::-webkit-details-marker]:hidden px-4 py-2",
                        surat?.index !== 1 && surat.index !== 9
                          ? "border-b"
                          : "",
                      )}
                    >
                      <summary className="flex cursor-pointer items-center gap-1.5 outline-hidden w-full justify-start">
                        <div className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                          Tentang {surah_name}
                        </div>

                        <svg
                          className="size-4 shrink-0 transition duration-300 group-open:-rotate-180 text-indigo-600 dark:text-indigo-400 opacity-80"
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
                        <div className="flex text-center items-center justify-center max-w-none my-1.5 font-semibold whitespace-pre-wrap text-accent-foreground border-b">
                          <span className="">
                            Surat ke- {surat.index}
                          </span>
                          <Dot />
                          <span>{_surah?.meta?.number_of_verses} Ayat</span>
                        </div>

                        <div
                          className={cn(
                            "text-slate-800 dark:text-slate-200 text-justify max-w-none  whitespace-pre-wrap mb-2",
                            opts?.font_trans_size,
                          )}
                        >
                          {item?.td
                            ? fixDescription(item.td)
                            : "Tidak ada deskripsi surat ini"}
                        </div>
                        <div className="text-muted-foreground text-xs py-2">
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
                            "text-primary font-bismillah text-center",
                            opts?.font_type,
                          )}
                          style={{
                            fontWeight: opts?.font_weight,
                            fontSize: font_size_opts?.fontSize || "1.5rem",
                            lineHeight: font_size_opts?.lineHeight ||
                              "3.5rem",
                          }}
                        >
                          {preBismillah.text.ar}
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
                  )}
                >
                  <div
                    className={cn(
                      " flex justify-start gap-1.5 w-full items-center",
                    )}
                  >
                    <Badge
                      className="rounded-md w-auto h-8 px-2"
                      variant="outline"
                      title={`${surah_name} - ${ayah_index}`}
                    >
                      {item.vk}
                    </Badge>

                    <MenuTrigger>
                      <Button
                        aria-label="Menu"
                        variant="outline"
                        size="icon"
                        className={cn("h-8 w-8")}
                        title={`Menu ayat ${key}`}
                      >
                        <Ellipsis />
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
                            onAction={() => toggleBookmark(bookmark_data)}
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
                            onAction={() => handleRead(bookmark_data)}
                          >
                            <Bookmark
                              className={cn(
                                "mr-1 w-4 h-4",
                                isLastRead &&
                                  "fill-blue-500 text-blue-500",
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
                        variant="outline"
                        size="icon"
                        className={cn("h-8 w-8")}
                        title="Hapus bookmark"
                      >
                        <Star
                          className={cn(
                            "fill-orange-500 text-orange-500 dark:text-orange-400 dark:fill-orange-400",
                          )}
                        />
                      </Button>
                    )}
                    {isLastRead
                      ? (
                        <div
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-8 px-2 text-xs gap-1",
                          )}
                        >
                          <Bookmark
                            className={cn(
                              "fill-blue-500 text-blue-500 dark:text-blue-400 dark:fill-blue-400",
                            )}
                          />
                          <span className="truncate max-w-[135px]">
                            {relativeTime}
                          </span>
                        </div>
                      )
                      : <div />}
                  </div>

                  <div dir="rtl" className="break-normal pr-2.5">
                    <div
                      className={cn(
                        "text-primary my-3 font-lpmq antialiased",
                        opts?.font_type,
                      )}
                      style={{
                        fontWeight: opts?.font_weight,
                        fontSize: font_size_opts?.fontSize || "1.5rem",
                        lineHeight: font_size_opts?.lineHeight || "3.5rem",
                      }}
                    >
                      {item.ta}

                      <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
                        ‎﴿{toArabicNumber(Number(item.vk.split(":")[1]))}﴾‏
                      </span>
                    </div>
                  </div>

                  {opts?.font_translation === "on" && (
                    <div
                      className={cn(
                        "text-slate-800 dark:text-slate-200 px-2 text-justify max-w-none  whitespace-pre-wrap mb-2",
                        opts?.font_trans_size,
                      )}
                    >
                      {processText(item.tt)} ({item.vk.split(":")[1]})
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {children && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${
                  lastItemBottom + (children ? 0 : 0)
                }px)`, // Tambahkan offset untuk children
                paddingBottom: "0px",
              }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
      <ScrollToFirstIndex handler={scrollToFirstAyat} container={parentRef} />
    </React.Fragment>
  );
};

const TrackAyah = ({ currentSurah }: {
  currentSurah: React.MutableRefObject<
    { name: string; index: number; ayah: number; page: number }
  >;
}) => {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  React.useEffect(() => {
    if (isLoading) {
      const s = currentSurah.current;

      const data = [`${s.name}:${s.index}:${s.ayah}:${s.page}`];

      saveLastReadAyahByOfset(data);
    }
  }, [isLoading]);

  return null;
};
