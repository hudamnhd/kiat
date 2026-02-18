import { FONT_SIZE } from "#/src/constants/prefs";
import { Header } from "#src/components/custom/header";
import { Button, buttonVariants } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { getSurahByPage } from "#src/utils/misc.quran.ts";
import { ChevronLeft, ChevronRight, CircleCheckBig, X } from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useRouteLoaderData } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  const response = await getSurahByPage({
    page: Number(id),
    style: "kemenag",
  });

  return { ...response, query: { surah, ayah } };
}

export function Component() {
  const { page } = useLoaderData();

  return (
    <React.Fragment>
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

function mergeWordsByLength(words: string[], maxLength: number) {
  let tempSentence = "";
  let result: { text: string; index: number }[] = [];
  let indexCounter = 0;

  for (const word of words) {
    if ((tempSentence + " " + word).trim().length > maxLength) {
      // Jika panjang melebihi batas, simpan sentence sebelumnya sebagai objek
      result.push({ text: tempSentence.trim(), index: indexCounter++ });
      tempSentence = word; // Reset dengan kata baru
    } else {
      tempSentence += (tempSentence ? " " : "") + word; // Tambahkan kata ke dalam sentence
    }
  }

  // Tambahkan sentence terakhir jika masih ada
  if (tempSentence) {
    result.push({ text: tempSentence.trim(), index: indexCounter++ });
  }

  return result;
}

let initialLoad = {};
const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const { surah, ayah: items, page, query } = useLoaderData<typeof Loader>();
  const surat = surah[0];

  const ayahRefs = React.useRef<Map<number, HTMLDivElement | null>>(new Map());

  React.useEffect(() => {
    if (query.surah && query.ayah) {
      const q = `${query.surah}:${query.ayah}`;
      const getIndex = items.findIndex((d: { vk: string }) => d.vk === q);
      sleep(50).then(() => scrollToAyat(getIndex));
    } else {
      sleep(50).then(() => scrollToFirstAyat());
    }
  }, [page.p]);

  const scrollToAyat = (index: number) => {
    const element = ayahRefs.current.get(index);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToFirstAyat = () => {
    scrollToAyat(0);
  };

  // 🔥 Update Surah Index Saat Scroll
  const title = `Hal ${page.p} - ${surat.name.id}`;

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
      <Header redirectTo="/muslim/quran-word-by-word" title={title} />
      <div
        className="divide-y"
        style={{
          width: "100%",
          position: "relative",
        }}
      >
        {items.map((item, index) => {
          const surah_index = item.vk.split(":")[0];
          const ayah_index = item.vk.split(":")[1];
          // const words = item.ta;
          const words = item.ta.split(" ");

          const maxLength = 30; // Batas panjang maksimal
          const originalSentence = mergeWordsByLength(
            words.filter((d) => d.trim() !== ""), // Hilangkan string kosong
            maxLength,
          );

          const shuffleSentence = shuffleArray(originalSentence);
          const isCorrect = resultAnswer && resultAnswer[Number(surah_index)] &&
            resultAnswer[Number(surah_index)][Number(ayah_index)];
          const isCorrectTrue = typeof isCorrect === "number";

          return (
            <div ref={(el) => ayahRefs.current.set(index, el)} key={item.vk}>
              <PuzzleGame
                originalSentence={originalSentence}
                shuffleSentence={shuffleSentence}
                ayat_number={Number(ayah_index)}
                percent={10}
                surat={Number(surah_index)}
                isCorrect={isCorrectTrue}
                progressReff={progressReff}
                scrollToAyat={scrollToAyat}
                handleTrue={handleTrue}
              />
            </div>
          );
        })}

        {children}
      </div>
    </React.Fragment>
  );
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
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);
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
        state.isCorrect && "bg-muted/50",
      )}
    >
      {state.isCorrect && (
        <CircleCheckBig className="absolute z-[-1] left-2 top-2 w-8 h-8 text-foreground" />
      )}
      {state.isCorrect === false && (
        <X className="absolute z-[-1] left-2 top-2 w-8 h-8 text-foreground" />
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
                "font-kemenag text-center h-fit mx-1 border py-1 px-2 rounded-md mb-1",
              )}
              style={{
                fontWeight: opts?.fontWeight,
                fontSize: prefsOption?.fontSize || "1.5rem",
                lineHeight: prefsOption?.lineHeight ||
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
        </div>
      </details>
      <div className="space-y-2">
        <div dir="rtl" className="flex flex-wrap gap-2 items-center">
          {/* Menampilkan potongan teks */}
          {state.slices.length > 0 &&
            state.slices.map((slice) => (
              <Button
                variant="secondary"
                className={cn(
                  "font-kemenag text-center h-fit",
                )}
                style={{
                  fontWeight: opts?.fontWeight,
                  fontSize: prefsOption?.fontSize || "1.5rem",
                  lineHeight: prefsOption?.lineHeight ||
                    "3.5rem",
                }}
                key={slice.index}
                onPress={() => handleClickSlice(slice)}
              >
                {slice.text}
              </Button>
            ))}
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
                    "font-kemenag text-center h-fit",
                    state.isCorrect && "bg-transparent",
                  )}
                  style={{
                    fontWeight: opts?.fontWeight,
                    fontSize: prefsOption?.fontSize || "1.5rem",
                    lineHeight: prefsOption?.lineHeight ||
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
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
