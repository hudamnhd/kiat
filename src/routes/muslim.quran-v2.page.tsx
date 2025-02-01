import { Header } from "#src/components/custom/header";
import { ScrollToFirstIndex } from "#src/components/custom/scroll-to-top.tsx";
import { Badge } from "#src/components/ui/badge";
import { Button, buttonVariants } from "#src/components/ui/button";
import { Label } from "#src/components/ui/label";
import { Popover } from "#src/components/ui/popover";
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
import toast from "react-hot-toast";
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SETTING_PREFS_KEY = "SETTING_PREFS_KEY";

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;
  const prefs = await get_cache(SETTING_PREFS_KEY);
  let style = "indopak" as "indopak" | "kemenag" | "uthmani" | "imlaei";

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
    default:
      style = "kemenag";
      break;
  }
  const response = await getSurahByPage({
    page: Number(id),
    style: style,
    translation: false,
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
              : `/muslim/quran-v2/${parseInt(page?.p as string) - 1}`}
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
              : `/muslim/quran-v2/${parseInt(page?.p as string) + 1}`}
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // 🔥 Update Surah Index Saat Scroll

  const title = `Hal ${page.p} - ${currentSurah.current.name}`;

  return (
    <React.Fragment>
      <TrackAyah currentSurah={currentSurah} />
      {
        /*<motion.div
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
      />*/
      }

      <Header redirectTo="/muslim/quran" title={title}>
        <ButtonStar index={currentSurah.current.index} />
      </Header>

      <div
        className="rtl:text-justify leading-relaxed px-5 py-3 border-y"
        dir="rtl"
      >
        {items.map((dt, index) => (
          <span
            key={dt.vk}
            className={cn(
              "text-primary font-lpmq inline hover:bg-muted antialiased",
              opts?.font_type,
            )}
            style={{
              fontWeight: opts?.font_weight,
              fontSize: font_size_opts?.fontSize || "1.5rem",
              lineHeight: font_size_opts?.lineHeight || "3.5rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {dt.ta}
            <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
              ‎﴿{toArabicNumber(Number(dt.vk.split(":")[1]))}﴾‏
            </span>
            {" "}
          </span>
        ))}
      </div>
      {children}
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
