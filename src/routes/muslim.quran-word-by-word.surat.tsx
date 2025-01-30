import { Header } from '#src/components/custom/header';
import { ScrollToFirstIndex } from '#src/components/custom/scroll-to-top.tsx';
import { Button, buttonVariants } from '#src/components/ui/button';
import { Label } from '#src/components/ui/label';
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from '#src/components/ui/popover';
import { get_cache, set_cache } from '#src/utils/cache-client.ts';
import { cn } from '#src/utils/misc';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import React from 'react';
import {
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import type { SliderProps } from 'react-aria-components';
import {
  Link,
  useLoaderData,
  useParams,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import type { Loader as muslimLoader } from './muslim.data';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Penggunaan
export interface Surat {
  index: number;
  name: string;
  trans: string;
  desc: string;
  ayah: {
    index: number;
    text: string;
    trans: string;
  }[];
  source: {
    text: string;
    trans: string;
    url: string;
  };
}

export async function Loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  return await fetchSurahWithCache(Number(id)) as Surat;
}

const shuffleArray = (array: TextType[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Tukar elemen
  }
  return shuffled;
};

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
      <SliderOutput className='text-sm text-right flex justify-center'>
        {({ state }) =>
          state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
      </SliderOutput>
      <SliderTrack className='relative w-full h-2 bg-primary/20 rounded mt-2 px-2'>
        {({ state }) => {
          const thumb1Percent = state.getThumbPercent(0) * 100;
          const thumb2Percent = state.getThumbPercent(1) * 100;

          return (
            <>
              {/* Fill */}
              <div
                className='absolute h-full bg-primary rounded-full'
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
                  className='absolute w-3 h-3 bg-background ring-2 ring-primary rounded transform -translate-y-1/2 top-2.5'
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

import { JollyNumberFieldV2 } from '#src/components/ui/number-field';
import type { AyatBookmark } from '#src/utils/bookmarks';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  X,
} from 'lucide-react';

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

const LASTREADSURAH_KEY = 'LASTREADSURAHPUZZLE';

import { fontSizeOpt } from '#/src/constants/prefs';

import { MenuItem } from 'react-aria-components';
import type { MenuItemProps } from 'react-aria-components';

// Fungsi untuk mengonversi angka ke format Arab
const toArabicNumber = (number: number) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number
    .toString()
    .split('')
    .map((digit) => arabicDigits[parseInt(digit)])
    .join('');
};

import { useVirtualizer } from '@tanstack/react-virtual';

const saveLastReadSurah = async (data: any) => {
  const savedData = await get_cache(LASTREADSURAH_KEY) || {};

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = {
    ...savedData, // salin data lama
    ...data, // tambahkan atau perbarui data baru
  };
  await set_cache(LASTREADSURAH_KEY, updatedData);
};

export function Component() {
  const surat = useLoaderData<typeof Loader>();

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
        <div className='ml-auto flex items-center justify-center gap-3 py-5 '>
          <Link
            className={cn(
              buttonVariants({ size: 'icon', variant: 'outline' }),
            )}
            title='Surat sebelumnya'
            to={surat?.index === 1
              ? '#'
              : `/muslim/quran-word-by-word/${surat?.index - 1}`}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className='text-accent-foreground text-sm'>
            Surat <strong>{surat?.index}</strong> dari <strong>114</strong>
          </span>
          <Link
            className={cn(
              buttonVariants({ size: 'icon', variant: 'outline' }),
            )}
            title='Surat selanjutnya'
            to={surat?.index === 114
              ? '#'
              : `/muslim/quran-word-by-word/${surat?.index + 1}`}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
      </VirtualizedListSurah>
    </React.Fragment>
  );
}

import { fetchSurahWithCache } from '#src/utils/misc.quran.ts';
import { motion } from 'framer-motion';

let initialLoad = {};
const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const [, rerender] = React.useState({});
  const surat = useLoaderData<typeof Loader>();
  const params = useParams();
  const datas = surat.ayah; // Mendapatkan list nomor ayat

  const [searchParams, setSearchParams] = useSearchParams();
  const [range_ayat, set_range_ayat] = React.useState({
    start: 0,
    end: datas.length + 1,
  });
  const [resultAnswer, setResultAnswer] = React.useState<
    { [key: number]: { [key: number]: number } } | null
  >(() => {
    const localData = localStorage.getItem('quran-word-by-word');
    return localData ? JSON.parse(localData) : null;
  });

  const ayat = searchParams.get('ayat');
  const items = datas.slice(range_ayat.start, range_ayat.end); // Mendapatkan list nomor ayat
  const parentRef = React.useRef<HTMLDivElement>(null);
  const toAyatRef = React.useRef<number>(1);
  const progressReff = React.useRef<number>(0);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  const parentLoader = useRouteLoaderData<typeof muslimLoader>('muslim');
  const opts = parentLoader?.opts;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1]; // Ambil item terakhir
  const lastItemBottom = lastItem ? lastItem.start + lastItem.size : 0; // Posisi akhir item terakhir

  const [lastRead, setLastRead] = React.useState<any | null>(
    parentLoader?.lastRead || null,
  );

  React.useEffect(() => {
    if (ayat !== null) {
      sleep(50).then(() => scrollToAyat(parseInt(ayat) - 1));
    }
  }, []);

  React.useEffect(() => {
    scrollToFirstAyat();
    rerender({});
  }, [params.id]);

  React.useEffect(() => {
    set_range_ayat({
      start: 0,
      end: datas.length + 1,
    });
  }, [datas.length]);

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

      localStorage.setItem('quran-word-by-word', JSON.stringify(updatedItems));

      return updatedItems;
    });
  };

  const scrollToAyat = (index: number) => {
    rowVirtualizer.scrollToIndex(index, {
      align: 'start',
    });
  };

  const scrollToFirstAyat = () => {
    rowVirtualizer.scrollToIndex(0, {
      align: 'center',
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
  const percent = 1 / maxValue;
  const title = `${surat.index}. ${surat.name}`;

  function financial(x) {
    return Number.parseFloat(x).toFixed(2);
  }
  return (
    <React.Fragment>
      <motion.div
        className='z-60 bg-chart-2 max-w-xl mx-auto transition-all duration-300'
        style={{
          transform: `scaleX(${progressReff.current.toFixed(2)})`,
          position: 'fixed',
          top: 55,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />
      <Header redirectTo='/muslim/quran-word-by-word' title={title}>
        <PopoverTrigger>
          <Button
            variant='ghost'
            size='icon'
            title='Pindah ke ayat'
          >
            <ArrowUpDown />
          </Button>
          <Popover isNonModal={false} placement='bottom'>
            <PopoverDialog className='max-w-[180px] space-y-2.5 bg-background rounded-md'>
              {({ close }) => (
                <React.Fragment>
                  <MySlider
                    onChangeEnd={(v) =>
                      set_range_ayat({
                        start: v[0] - 1,
                        end: v[1],
                      })}
                    label='Jumlah Ayat'
                    defaultValue={[range_ayat.start + 1, range_ayat.end + 1]}
                    minValue={1}
                    maxValue={maxValue}
                    thumbLabels={['start', 'end']}
                  />
                  <JollyNumberFieldV2
                    onChange={(value) => {
                      toAyatRef.current = value - 1;
                    }}
                    defaultValue={range_ayat.start + 1}
                    minValue={range_ayat.start + 1}
                    maxValue={range_ayat.end + 1}
                    className='w-full'
                    label='Ke ayat'
                  />
                  <Button
                    className='w-full'
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
        className='h-[calc(100vh-55px)]'
        style={{
          overflowAnchor: 'none',
          overflow: 'auto',
          position: 'relative',
          contain: 'strict',
        }}
      >
        <div
          className='divide-y'
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const key = item.index as number;

            const id = `${surat.index}:${key}`;

            const ayatText = item.index === 1
              ? item.text.replace(/^(([^ ]+ ){4})/u, '')
              : item.text;
            const words = ayatText.split(' ');
            const originalSentence = words.map((d: string, index: number) => {
              return {
                text: d,
                index,
              };
            });
            const shuffleSentence = shuffleArray(originalSentence);
            const isCorrect = resultAnswer &&
                resultAnswer?.[surat.index]?.[key]
              ? true
              : false;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start + 0}px)`, // Tambahkan offset untuk children
                }}
              >
                <PuzzleGame
                  originalSentence={originalSentence}
                  shuffleSentence={shuffleSentence}
                  ayat_number={item.index}
                  percent={percent}
                  surat={surat.index}
                  isCorrect={isCorrect}
                  progressReff={progressReff}
                  scrollToAyat={scrollToAyat}
                  handleTrue={handleTrue}
                />
              </div>
            );
          })}

          {children && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${
                  lastItemBottom + (children ? 0 : 0)
                }px)`, // Tambahkan offset untuk children
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
      event.dataTransfer.effectAllowed = 'move';
      const element = event.currentTarget.cloneNode(true) as HTMLDivElement;
      const dragImage = document.createElement('div');

      const isDarkMode = document.documentElement.classList.contains('dark');

      // Atur warna berdasarkan tema
      if (isDarkMode) {
        dragImage.style.backgroundColor = 'black';
        dragImage.style.border = '1px solid white';
        dragImage.style.color = 'white'; // Warna teks jika ada
      } else {
        dragImage.style.backgroundColor = 'white';
        dragImage.style.border = '1px solid black';
        dragImage.style.color = 'black'; // Warna teks jika ada
      }
      const client_width = event.currentTarget.clientWidth + 25 + 'px';
      dragImage.style.width = client_width;
      dragImage.style.padding = '10px'; // Hanya padding bawah
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
      event.dataTransfer.dropEffect = 'move';
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
      dir='rtl'
      className={cn(
        'relative transition-all duration-300 relative flex flex-col items-start gap-2 animate-slide-top [animation-fill-mode:backwards] group relative py-3 pr-4 pl-2',
        state.isCorrect && 'bg-green-400/10',
        state.isCorrect === false && 'bg-destructive/5',
      )}
    >
      {state.isCorrect && (
        <CircleCheckBig className='absolute z-[-1] left-0 top-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30' />
      )}
      {state.isCorrect === false && (
        <X className='absolute z-[-1] left-0 top-[50%] w-28 h-28 text-red-500 dark:text-red-400 opacity-30' />
      )}
      <details className='group [&_summary::-webkit-details-marker]:hidden mb-2'>
        <summary className='flex cursor-pointer items-center gap-1.5 outline-none'>
          <svg
            className='size-4 shrink-0 transition duration-300 group-open:-rotate-180 text-indigo-600 dark:text-indigo-400 opacity-80'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M19 9l-7 7-7-7'
            />
          </svg>

          <div className='group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400'>
            Hide Clue
          </div>
          <div className='animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400'>
            Show Clue
          </div>
        </summary>

        <div
          dir='rtl'
          className='group-open:animate-slide-left group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300  flex flex-wrap'
        >
          {originalSentence.map((w, index) => (
            <span className='font-indopak mx-1 w-fit' key={w.text + index}>
              {w.text}
            </span>
          ))}

          <span className='text-right text-3xl font-uthmani-v2-reguler mr-1.5'>
            ‎﴿{toArabicNumber(Number(ayat_number))}﴾‏
          </span>
        </div>
      </details>
      <div className='space-y-2'>
        <div dir='rtl' className='flex flex-wrap gap-2 items-center'>
          {/* Menampilkan potongan teks */}
          {state.slices.length > 0 &&
            state.slices.map((slice, index) => (
              <Button
                variant='secondary'
                className='font-indopak py-8 px-2'
                key={slice.index}
                onPress={() => handleClickSlice(slice)}
              >
                {slice.text}
              </Button>
            ))}

          {state.slices.length > 0 && (
            <span className='text-right text-3xl font-uthmani-v2-reguler mr-1.5'>
              ‎﴿{toArabicNumber(Number(ayat_number))}﴾‏
            </span>
          )}
        </div>
      </div>

      <div className='space-y-2 text-right border-t pt-2'>
        <div className='flex flex-wrap gap-2 justify-start items-center'>
          {state.userAnswer.length > 0 && (
            <React.Fragment>
              {state.userAnswer.map((slice, index) => (
                <div
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    'font-indopak py-8 px-2',
                    state.isCorrect && 'bg-transparent',
                  )}
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
                <span className='text-right text-3xl font-uthmani-v2-reguler mr-1.5'>
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
