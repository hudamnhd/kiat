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
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import ky from "ky";
import React from "react";
import {
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import type { SliderProps } from "react-aria-components";
import toast from "react-hot-toast";
import {
  Link,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Penggunaan
export type Ayah = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir?: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

type Surah = Record<string, Ayah>; // Object with dynamic string keys

export async function Loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  return await fetchSurahWithCache(Number(id));
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
import { save_bookmarks } from "#src/utils/bookmarks";
import type { AyatBookmark } from "#src/utils/bookmarks";
import {
  ArrowUpDown,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CornerUpRight,
  Dot,
  Ellipsis,
  Info,
  Star,
} from "lucide-react";

export type Ayat = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir?: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";
const LASTREADSURAH_KEY = "LASTREADSURAH";
const FAVORITESURAH_KEY = "FAVORITESURAH";

import { fontSizeOpt } from "#/src/constants/prefs";

import { Menu, MenuItem, MenuTrigger } from "react-aria-components";
import type { MenuItemProps } from "react-aria-components";

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

const saveLastReadSurah = async (data: any) => {
  const savedData = await get_cache(LASTREADSURAH_KEY) || {};

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = {
    ...savedData, // salin data lama
    ...data, // tambahkan atau perbarui data baru
  };
  await set_cache(LASTREADSURAH_KEY, updatedData);
};

function ButtonStar() {
  const surat = useLoaderData();
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const checkFavoriteSurah = async (data: any) => {
      const savedDataFavorite = await get_cache(FAVORITESURAH_KEY) || [];
      setIsFavorite(savedDataFavorite.includes(data));
    };

    checkFavoriteSurah(surat.index);
  }, []);

  return (
    <Button
      variant="ghost"
      title={isFavorite
        ? "Hapus dari daftar favorit"
        : "Tambahkan ke daftar favorit"}
      onPress={() => {
        saveFavoriteSurah(surat.index.toString());
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
  const surat = useLoaderData();

  React.useEffect(() => {
    const obj = {
      [surat.index]: {
        created_at: new Date().toISOString(),
      },
    };

    saveLastReadSurah(obj);
  }, []);

  return (
    <React.Fragment>
      <VirtualizedListSurah>
        <div className="ml-auto flex items-center justify-center gap-3 py-5 ">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
            )}
            title="Surat sebelumnya"
            to={parseInt(surat?.index as string) === 1
              ? "#"
              : `/muslim/quran/${parseInt(surat?.index as string) - 1}`}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className="text-accent-foreground text-sm">
            Surat <strong>{surat?.index}</strong> dari <strong>114</strong>
          </span>
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
            )}
            title="Surat selanjutnya"
            to={parseInt(surat?.index as string) === 114
              ? "#"
              : `/muslim/quran/${parseInt(surat?.index as string) + 1}`}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
      </VirtualizedListSurah>
    </React.Fragment>
  );
}

import { fetchSurahWithCache } from "#src/utils/misc.quran.ts";
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

const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const surat = useLoaderData();
  const header = {
    text: surat.name,
    trans: surat.desc,
    index: 0,
  };
  const datas = [header, ...surat.ayah]; // Mendapatkan list nomor ayat

  const [searchParams, setSearchParams] = useSearchParams();
  const [range_ayat, set_range_ayat] = React.useState({
    start: 0,
    end: datas.length + 1,
  });

  const ayat = searchParams.get("ayat");
  const items = datas.slice(range_ayat.start, range_ayat.end); // Mendapatkan list nomor ayat
  const parentRef = React.useRef<HTMLDivElement>(null);
  const toAyatRef = React.useRef<number>(1);

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
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await get_cache(BOOKMARK_KEY);
      const storedLastRead = await get_cache(LASTREAD_KEY);
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }

      if (ayat !== null) {
        scrollToAyat(parseInt(ayat) - 1);
      }
    };
    // load_bookmark_from_lf();

    if (ayat !== null) {
      sleep(50).then(() => scrollToAyat(parseInt(ayat) - 1));
    } else {
      sleep(50).then(() => scrollToFirstAyat());
    }
  }, [surat.index]);

  React.useEffect(() => {
    set_range_ayat({
      start: 0,
      end: datas.length + 1,
    });
  }, [datas.length]);

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
  // Fungsi untuk toggle favorit
  const toggleBookmark = (key: string) => {
    const data_bookmark = {
      id: `${surat.index}:${key}`,
      title: `${surat.name}:${key}`,
      arab: surat.ayah[Number(key) - 1].text,
      translation: surat.ayah[Number(key) - 1].trans,
      source: `/muslim/quran/${surat.index}?ayat=${key}`,
    };
    const newBookmarks = save_bookmarks("ayat", data_bookmark, [...bookmarks]);

    const is_saved = bookmarks_ayah.find((fav) =>
      fav.id === `${surat.index}:${key}`
    );

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
  const handleRead = (key: string) => {
    const data_bookmark = {
      id: `${surat.index}:${key}`,
      title: `${surat.name}:${key}`,
      arab: surat.ayah[Number(key) - 1],
      translation: surat.trans,
      source: `/muslim/quran/${surat.index}?ayat=${key}`,
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

  const maxValue = datas.length;
  const title = `${surat.index}. ${surat.name}`;
  return (
    <React.Fragment>
      <motion.div
        className="z-60 bg-primary max-w-xl mx-auto"
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

      <Header redirectTo="/muslim/quran" title={title}>
        <ButtonStar />

        <PopoverTrigger>
          <Button
            variant="ghost"
            size="icon"
            title="Pindah ke ayat"
          >
            <ArrowUpDown />
          </Button>
          <Popover isNonModal={false} placement="bottom">
            <PopoverDialog className="max-w-[180px] space-y-2.5 bg-background rounded-md">
              {({ close }) => (
                <React.Fragment>
                  <MySlider
                    onChangeEnd={(v) =>
                      set_range_ayat({
                        start: v[0] - 1,
                        end: v[1],
                      })}
                    label="Jumlah Ayat"
                    defaultValue={[range_ayat.start + 1, range_ayat.end + 1]}
                    minValue={1}
                    maxValue={maxValue}
                    thumbLabels={["start", "end"]}
                  />
                  <JollyNumberFieldV2
                    onChange={(value) => {
                      toAyatRef.current = value - 1;
                    }}
                    defaultValue={range_ayat.start + 1}
                    minValue={range_ayat.start + 1}
                    maxValue={range_ayat.end + 1}
                    className="w-full"
                    label="Ke ayat"
                  />
                  <Button
                    className="w-full"
                    onPress={() => {
                      close();
                      scrollToAyat(toAyatRef.current);
                    }}
                  >
                    Submit
                  </Button>
                </React.Fragment>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
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
            const key = item.index;
            const id = `${surat.index}:${key}`;
            const isFavorite = bookmarks_ayah.some((fav) => fav.id === id);
            const isLastRead = lastRead?.id === id;

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
                {key !== 0
                  ? (
                    <div
                      id={"quran" + surat.index + key}
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
                          title={`${surat.name} - ${key}`}
                        >
                          {/*{surat.name}:{key}*/}
                          {surat.index}:{key}
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
                              {surat.name} - Ayat {key}
                              {" "}
                            </div>
                            <Menu className="outline-hidden">
                              <ActionItem
                                id="new"
                                onAction={() => toggleBookmark(key)}
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
                                onAction={() => handleRead(key)}
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
                            onPress={() => toggleBookmark(key)}
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
                          {item.index === 1
                            ? item.text.replace(/^(([^ ]+ ){4})/u, "")
                            : item.text}

                          <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
                            ‎﴿{toArabicNumber(Number(item.index))}﴾‏
                          </span>
                          {
                            /*<span
                            className={cn(
                              'text-4xl inline-flex mx-1 font-uthmani font-normal',
                              opts?.font_type === 'font-indopak' && 'mr-4',
                            )}
                          >
                            {toArabicNumber(Number(item.index))}
                          </span>*/
                          }
                          {" "}
                        </div>
                      </div>

                      {opts?.font_translation === "on" && (
                        <div
                          className={cn(
                            "text-slate-800 dark:text-slate-200 px-2 text-justify max-w-none  whitespace-pre-wrap mb-2",
                            opts?.font_trans_size,
                          )}
                        >
                          {processText(item.trans)} ({item.index})
                        </div>
                      )}
                    </div>
                  )
                  : (
                    <React.Fragment>
                      <div className=" w-fit mx-auto text-primary pb-3 pt-2.5 text-center mb-3 hidden">
                        <div className="text-3xl font-bold hidden">
                          {surat.name}
                          <span className="font-normal ml-1">
                            ({surat.trans})
                          </span>
                        </div>

                        <div className="flex items-center text-sm font-medium justify-center my-0.5">
                        </div>
                      </div>
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
                            Tentang {surat.name}
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
                            <span>{surat.ayah.length} Ayat</span>
                            {" "}
                          </div>

                          <div
                            className={cn(
                              "text-slate-800 dark:text-slate-200 text-justify max-w-none  whitespace-pre-wrap mb-2",
                              opts?.font_trans_size,
                            )}
                          >
                            {processText(surat.desc)}
                          </div>
                          <div className="text-muted-foreground text-xs py-2">
                            Sumber:
                            <br />
                            <div className="flex flex-wrap items-center justify-between">
                              <span>{surat.source.trans}</span>
                              <span>{surat.source.url}</span>
                            </div>
                          </div>
                        </div>
                      </details>

                      {datas[1]?.bismillah && (
                        <div
                          dir="rtl"
                          className="break-normal pt-1 pb-2 w-full"
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
                            {datas[1]?.bismillah}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  )}
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
