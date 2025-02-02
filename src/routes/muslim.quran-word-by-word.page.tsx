import { Header } from "#src/components/custom/header";
import { ScrollToFirstIndex } from "#src/components/custom/scroll-to-top.tsx";
import { Badge, badgeVariants } from "#src/components/ui/badge";
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
import { Button as ButtonRAC } from "react-aria-components";
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

const shuffleArray = (array: TextType[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Tukar elemen
  }
  return shuffled;
};

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;
  const prefs = await get_cache(SETTING_PREFS_KEY);
  let translation = prefs?.font_translation
    ? prefs?.font_translation == "on" ? true : false
    : true;

  const response = await getSurahByPage({
    page: Number(id),
    style: "uthmani_simple",
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
  Circle,
  CircleCheckBig,
  Dot,
  Ellipsis,
  EllipsisVertical,
  Star,
  X,
} from "lucide-react";

import {
  BOOKMARK_KEY,
  FAVORITESURAH_KEY,
  LASTREAD_KEY,
  LASTREADSURAH_KEY,
  LASTVISITPAGE_KEY,
} from "#/src/constants/key";
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
  const savedData = await get_cache(LASTVISITPAGE_KEY) || [];

  const updatedData = Array.from(new Set([...savedData, ...data]));
  await set_cache(LASTVISITPAGE_KEY, updatedData);
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
              : `/muslim/quran-word-by-word/${parseInt(page?.p as string) - 1}`}
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
              : `/muslim/quran-word-by-word/${parseInt(page?.p as string) + 1}`}
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

let initialLoad = {};
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
      align: "start",
    });
  };

  // 🔥 Update Surah Index Saat Scroll
  const title = `Hal ${page.p} - ${currentSurah.current.name}`;

  const progressReff = React.useRef<number>(0);

  const [resultAnswer, setResultAnswer] = React.useState<
    { [key: number]: { [key: number]: number } } | null
  >(() => {
    const localData = localStorage.getItem("quran-word-by-word");
    return localData ? JSON.parse(localData) : null;
  });

  const handleTrue = (index: number) => {
    setResultAnswer((prevState) => {
      const updatedItems = {
        ...prevState,
        [surat.index]: {
          ...(prevState && prevState[surat.index] &&
            { ...prevState[surat.index] }),
          [index]: 1,
        },
      };

      localStorage.setItem("quran-word-by-word", JSON.stringify(updatedItems));

      return updatedItems;
    });
  };
  return (
    <React.Fragment>
      <motion.div
        className="z-20 bg-primary max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 52,
          left: 0,
          right: 0,
          height: 3,
          originX: 0,
        }}
      />

      <Header redirectTo="/muslim/quran" title={title} />
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
          {items.map((item) => {
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

            const words = item.ta.split(" ");
            const originalSentence = words.map((d: string, index: number) => {
              return {
                text: d,
                index,
              };
            });
            const shuffleSentence = shuffleArray(originalSentence);

            return (
              <PuzzleGame
                key={item.vk}
                originalSentence={originalSentence}
                shuffleSentence={shuffleSentence}
                ayat_number={ayah_index}
                percent={10}
                surat={surah_index}
                isCorrect={false}
                progressReff={progressReff}
                scrollToAyat={scrollToAyat}
                handleTrue={handleTrue}
              />
            );
          })}

          {children}
        </div>
      </div>
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

type TextType = {
  text: string;
  index: number;
};

interface PuzzleProps {
  originalSentence: TextType[];
  shuffleSentence: TextType[];
  ayat_number: number;
  percent: number;
  surat: number;
  isCorrect: boolean;
  progressReff: React.MutableRefObject<number>;
  scrollToAyat: (index: number) => void;
  handleTrue: (index: number) => void;
}

const PuzzleGame: React.FC<PuzzleProps> = ({
  originalSentence,
  handleTrue,
  isCorrect,
  shuffleSentence,
  ayat_number,
  percent,
  progressReff,
  scrollToAyat,
  surat,
}) => {
  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  const [state, setState] = React.useState<
    { slices: TextType[]; userAnswer: TextType[]; isCorrect: boolean | null }
  >(
    {
      slices: shuffleSentence,
      userAnswer: [],
      isCorrect: isCorrect ? true : null,
    },
  );

  const handleClickSlice = (slice: TextType) => {
    if (state.userAnswer.includes(slice)) {
      setState((prevState) => ({
        ...prevState,
        userAnswer: prevState.userAnswer.filter((item) => item !== slice),
        slices: [...prevState.slices, slice],
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        userAnswer: [...prevState.userAnswer, slice],
        slices: prevState.slices.filter((item) => item !== slice),
      }));
    }
  };

  const checkAnswer = () => {
    const correctAnswer = originalSentence;
    setState((prevState) => ({
      ...prevState,
      isCorrect:
        JSON.stringify(prevState.userAnswer) === JSON.stringify(correctAnswer),
    }));
  };

  React.useEffect(() => {
    if (
      state.slices.length === 0 &&
      state.userAnswer.length === originalSentence.length
    ) {
      checkAnswer();
    }
  }, [state.userAnswer]);

  React.useEffect(() => {
    if (state.isCorrect && !initialLoad[ayat_number]) {
      progressReff.current = progressReff.current + percent;
      scrollToAyat(ayat_number);
      handleTrue(ayat_number);
      initialLoad = {
        ...initialLoad,
        [ayat_number]: 1,
      };
    }
  }, [state.isCorrect]);

  React.useEffect(() => {
    setState(
      {
        slices: shuffleSentence,
        userAnswer: [],
        isCorrect: isCorrect ? true : null,
      },
    );
  }, [surat]);

  // Gunakan useRef untuk menyimpan draggedIndex
  const draggedIndexRef = React.useRef<number | null>(null);

  // Fungsi untuk menangani drag start
  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, index: number) => {
      draggedIndexRef.current = index; // Simpan index ke dalam ref
      // event.target.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      const element = event.currentTarget.cloneNode(true) as HTMLDivElement;
      const dragImage = document.createElement("div");

      const isDarkMode = document.documentElement.classList.contains("dark");

      // Atur warna berdasarkan tema
      if (isDarkMode) {
        dragImage.style.backgroundColor = "black";
        dragImage.style.border = "1px solid white";
        dragImage.style.color = "white"; // Warna teks jika ada
      } else {
        dragImage.style.backgroundColor = "white";
        dragImage.style.border = "1px solid black";
        dragImage.style.color = "black"; // Warna teks jika ada
      }
      const client_width = event.currentTarget.clientWidth + 25 + "px";
      dragImage.style.width = client_width;
      dragImage.style.padding = "10px"; // Hanya padding bawah
      dragImage.appendChild(element);
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 25, 25);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    [],
  );

  // Fungsi untuk menangani drag over
  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Mengizinkan drop
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
  };

  // Fungsi untuk menangani drop
  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      event.preventDefault();

      const draggedIndex = draggedIndexRef.current;
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      // Gunakan callback untuk memastikan state terbaru digunakan

      setState((prevItems) => {
        const updatedItems = [...prevItems.userAnswer];
        const [movedItem] = updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(dropIndex, 0, movedItem);

        return { ...prevItems, userAnswer: updatedItems };
      });

      draggedIndexRef.current = null; // Reset drag index setelah selesai
    },
    [],
  );

  return (
    <div
      dir="rtl"
      className={cn(
        "relative transition-all duration-300 relative flex flex-col items-start gap-2 animate-slide-top [animation-fill-mode:backwards] group relative py-3 pr-4 pl-2",
        state.isCorrect && "bg-green-400/10",
        state.isCorrect === false && "bg-destructive/5",
      )}
    >
      {state.isCorrect && (
        <CircleCheckBig className="absolute z-[-1] left-2 top-2 w-8 h-8 text-green-500 dark:text-green-400" />
      )}
      {state.isCorrect === true && (
        <X className="absolute z-[-1] left-2 top-2 w-8 h-8 text-red-500 dark:text-red-400" />
      )}
      <details className="group [&_summary::-webkit-details-marker]:hidden mb-2">
        <summary className="flex cursor-pointer items-center gap-1.5 outline-none">
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

          <div className="group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
            Hide Clue
          </div>
          <div className="animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
            Show Clue
          </div>
        </summary>

        <div
          dir="rtl"
          className="group-open:animate-slide-left group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300  flex flex-wrap mt-1"
        >
          {originalSentence.slice(0, state.userAnswer.length + 1).map((
            w,
            index,
          ) => (
            <span
              className={cn(
                "text-center h-fit mx-1 border py-1 px-2 rounded-md mb-1",
                opts?.font_type,
              )}
              style={{
                fontWeight: opts?.font_weight,
                fontSize: font_size_opts?.fontSize || "1.5rem",
                lineHeight: font_size_opts?.lineHeight ||
                  "3.5rem",
              }}
              key={w.text + index}
            >
              <span className="text-base font-sans block -mb-3 text-muted-foreground font-semibold bg-muted rounded-md px-2 text-sm">
                {w.index + 1}
              </span>
              {w.text}
            </span>
          ))}

          <span
            style={{
              fontWeight: opts?.font_weight,
              fontSize: font_size_opts?.fontSize || "1.5rem",
              lineHeight: font_size_opts?.lineHeight ||
                "3.5rem",
            }}
            className="text-right font-uthmani-v2-reguler mr-1.5"
          >
            ‎﴿{toArabicNumber(Number(ayat_number))}﴾‏
          </span>
        </div>
      </details>
      <div className="space-y-2">
        <div dir="rtl" className="flex flex-wrap gap-2 items-center">
          {/* Menampilkan potongan teks */}
          {state.slices.length > 0 &&
            state.slices.map((slice, index) => (
              <Button
                variant="secondary"
                className={cn(
                  "text-center h-fit",
                  opts?.font_type,
                )}
                style={{
                  fontWeight: opts?.font_weight,
                  fontSize: font_size_opts?.fontSize || "1.5rem",
                  lineHeight: font_size_opts?.lineHeight ||
                    "3.5rem",
                }}
                key={slice.index}
                onPress={() => handleClickSlice(slice)}
              >
                {slice.text}
              </Button>
            ))}

          {state.slices.length > 0 && (
            <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
              ‎﴿{toArabicNumber(Number(ayat_number))}﴾‏
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-right border-t pt-2">
        <div className="flex flex-wrap gap-2 justify-start items-center">
          {state.userAnswer.length > 0 && (
            <React.Fragment>
              {state.userAnswer.map((slice, index) => (
                <div
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "text-center h-fit",
                    opts?.font_type,
                    state.isCorrect && "bg-transparent",
                  )}
                  style={{
                    fontWeight: opts?.font_weight,
                    fontSize: font_size_opts?.fontSize || "1.5rem",
                    lineHeight: font_size_opts?.lineHeight ||
                      "3.5rem",
                  }}
                  draggable
                  key={slice.index}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragEnd={() => handleDragEnd()}
                  onDragOver={handleDragOver}
                  onClick={() => handleClickSlice(slice)}
                  onDrop={(event) => handleDrop(event, index)}
                >
                  {slice.text}
                </div>
              ))}

              {state.slices.length === 0 && (
                <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
                  ‎﴿{toArabicNumber(Number(ayat_number))}﴾‏
                </span>
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
