import { Header } from '#src/components/custom/header';
import { buttonVariants } from '#src/components/ui/button';
import { Progress } from '#src/components/ui/progress-bar';
import { data as daftar_surat } from '#src/constants/daftar-surat.json';
import { cn } from '#src/utils/misc';
import { fetchAllSurahs } from '#src/utils/misc.quran.ts';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion, useScroll, useSpring } from 'framer-motion';
import { hasMatch, score } from 'fzy.js';
import lodash from 'lodash';
import { History, MoveRight, Search as SearchIcon } from 'lucide-react';
import { Dot } from 'lucide-react';
import React, { JSX, useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

type Progress = { [key: number]: { [key: number]: number } } | null;
const LASTREADSURAH_KEY = 'LASTREADSURAHPUZZLE';

export async function Loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  await fetchAllSurahs(); // Angka surah tunggal

  const localData = localStorage.getItem('quran-word-by-word');
  const progress: Progress = localData ? JSON.parse(localData) : null;
  const data = {
    id,
    progress,
    last_read_ayah: await get_cache(LASTREAD_KEY),
    last_read_surah: await get_cache(LASTREADSURAH_KEY) || {},
    surat: daftar_surat.reverse(),
  };

  return data;
}

interface SearchProps<T> {
  data: T[];
  searchKey: (keyof T)[]; // Mendukung array string
  query: string;
  render: (filteredData: T[]) => JSX.Element;
}

function SearchHandler<T extends Record<string, any>>({
  data,
  searchKey,
  query,
  render,
}: SearchProps<T>) {
  let list = [...data];

  list = list.filter((s) => {
    const combined = searchKey.map((key) => s[key]).join(' ');
    return hasMatch(query, combined);
  });

  list = lodash.sortBy(list, (s) => {
    const combined = searchKey.map((key) => s[key]).join(' ');
    return -score(query, combined);
  });

  list = query !== '' ? list.slice(0, 10) : list;

  return render(list);
}

import { useVirtualizer } from '@tanstack/react-virtual';

export function Component() {
  const { last_read_surah, surat } = useLoaderData<
    typeof Loader
  >();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const loadingIconRef = React.useRef<SVGSVGElement | null>(null);
  const searchIconRef = React.useRef<SVGSVGElement | null>(null);

  const handleSearch = useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);
        loadingIconRef.current?.classList.add('hidden');
        searchIconRef.current?.classList.remove('hidden');
      }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadingIconRef.current?.classList.remove('hidden');
    searchIconRef.current?.classList.add('hidden');
    setInput(e.target.value);
    handleSearch(e.target.value);
  };

  const data_surat = surat;
  const data_placeholder = 'Cari Surat..';

  return (
    <>
      <Header redirectTo='/muslim' title='Daftar Surat'>
        <Link
          className={cn(
            buttonVariants({ size: 'icon', variant: 'ghost' }),
            'prose-none [&_svg]:size-6 mr-0.5',
          )}
          to='/muslim/quran-v2/1'
          title='Al-Quran Per halaman'
        >
          V2
        </Link>
      </Header>

      {/*45px*/}
      <LastRead />

      {/*103px*/}
      <div className='surah-index px-3 border-b py-1.5'>
        {Object.keys(last_read_surah).length > 0 && (
          <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
            Terakhir dibuka
          </div>
        )}

        <div className='flex max-w-xl overflow-x-auto gap-1.5 py-2'>
          {Object.keys(last_read_surah).length > 0 &&
            surat
              .filter((navItem) =>
                Object.keys(last_read_surah).includes(navItem.number)
              ).sort((a, b) => a.created_at - b.created_at)
              .map((item) => {
                const to = `/muslim/quran-word-by-word/${item.number}`;

                const is_last_read = last_read_surah[item.number];
                const relativeTime = is_last_read
                  ? formatDistanceToNow(new Date(is_last_read.created_at), {
                    addSuffix: true,
                    includeSeconds: true,
                    locale: localeId,
                  })
                  : null;
                return (
                  <Link
                    key={item.number}
                    to={to}
                    className='col-span-1 flex shadow-xs rounded-md hover:bg-accent'
                  >
                    <div className='flex-1 flex items-center justify-between border  rounded-md truncate'>
                      <div className='flex-1 px-2.5 py-2 text-sm truncate'>
                        <div className='font-semibold cursor-pointer'>
                          <span className='font-semibold'>
                            {item.number}. {item.name_id}
                          </span>
                          {' '}
                        </div>
                        <div className='flex items-center text-xs text-muted-foreground gap-x-1 mt-1'>
                          <span>{relativeTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>

      <div className='surah-index relative pb-1'>
        <input
          id='input-26'
          className='h-10 peer pe-9 ps-9 outline-hidden focus-visible:ring-2 focus-visible:ring-ring border-b w-full text-sm p-3 bg-background'
          placeholder={data_placeholder}
          type='search'
          value={input}
          onChange={handleInputChange}
        />
        <SearchIcon
          ref={searchIconRef}
          size={16}
          strokeWidth={2}
          className='pointer-events-none absolute inset-y-3 start-3 peer-focus:rotate-90 text-muted-foreground/80 peer-disabled:opacity-50 duration-300'
        />
        <svg
          id='loading-icon'
          ref={loadingIconRef}
          width='15'
          height='15'
          viewBox='0 0 15 15'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='hidden m-1 animate-spin text-foreground pointer-events-none absolute inset-y-2 start-2'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z'
            fill='currentColor'
          />
        </svg>
      </div>

      <SearchHandler
        data={data_surat}
        searchKey={['name_id', 'number']}
        query={query}
        render={(filteredData) => {
          if (filteredData.length > 0) {
            return (
              <VirtualizedListSurah
                items={filteredData}
                lastSurah={last_read_surah}
              />
            );
          } else {
            return (
              <div className='py-6 text-center text-sm h-[calc(100vh-290px)] border-b flex items-center justify-center'>
                Surat tidak ditemukan.
              </div>
            );
          }
        }}
      />
      {/*<Example />*/}
    </>
  );
}

function getTotalHeight() {
  // Seleksi semua elemen dengan class 'surah-index'
  const elements = document.querySelectorAll('.surah-index');

  // Jika tidak ada elemen ditemukan, kembalikan 0
  if (elements.length === 0) {
    return 0;
  }

  // Hitung total tinggi elemen-elemen
  let totalHeight = 0;
  for (const element of elements) {
    if (element instanceof HTMLDivElement) { // Memastikan elemen adalah HTMLDivElement
      totalHeight += element.offsetHeight;
    }
  }

  return totalHeight + 55;
}

const VirtualizedListSurah: React.FC<
  {
    items: any[];
    lastSurah: {
      [x: string]: {
        created_at: string;
      };
    };
  }
> = (
  { items, lastSurah },
) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { progress, last_read_ayah } = useLoaderData<
    typeof Loader
  >();
  // const calculate_height =
  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 62, // Perkiraan tinggi item (70px)
  });

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <React.Fragment>
      <motion.div
        className='z-60 bg-primary  max-w-xl mx-auto'
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />

      <div
        ref={parentRef}
        className='border-b'
        style={{
          height: `calc(100vh - ${getTotalHeight()}px)`,
          overflow: 'auto',
        }}
      >
        <div
          className='divide-y'
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            // const item = items[virtualRow.index].item;
            const item = items[virtualRow.index];
            const is_last_read = lastSurah[item.number];
            const isProgress = progress && progress[item.number];
            const totalProgress = isProgress
              ? Object.keys(progress[item.number]).length
              : 0;
            const progressValue = isProgress
              ? (1 / item.number_of_verses) *
                Object.keys(progress[item.number]).length * 100
              : 0;

            const relativeTime = is_last_read
              ? formatDistanceToNow(new Date(is_last_read.created_at), {
                addSuffix: true,
                includeSeconds: true,
                locale: localeId,
              })
              : null;

            const to = `/muslim/quran-word-by-word/${item.number}`;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className='first:border-t group'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className={cn(
                    'px-4 pt-2.5 pb-1.5 flex items-center hover:bg-accent',
                  )}
                >
                  <Link
                    to={to}
                    className='min-w-0 flex-1 flex items-center justify-between'
                  >
                    <div className='truncate -space-y-1.5'>
                      <div className='flex text-sm items-center'>
                        <p className='font-medium'>
                          {item.number}. {item.name_id}
                        </p>

                        <div className='ml-1 flex items-center text-sm text-muted-foreground gap-x-2'>
                          {item.revelation_id === 'Makkiyyah'
                            ? (
                              <svg
                                className='w-4 h-4'
                                viewBox='0 0 100 100'
                                fill='currentColor'
                                x='0px'
                                y='0px'
                              >
                                <path d='M4.53,81.42l45,15s0,0,0,0c.15,.05,.31,.08,.47,.08s.32-.03,.47-.08c0,0,0,0,0,0l45-15c.61-.2,1.03-.78,1.03-1.42V20c0-.14-.03-.28-.07-.42-.01-.04-.03-.08-.04-.12-.04-.09-.08-.18-.14-.27-.02-.04-.04-.07-.07-.11-.07-.1-.16-.18-.25-.26-.02-.01-.03-.03-.04-.04,0,0,0,0,0,0-.11-.08-.24-.14-.37-.19-.01,0-.02-.01-.03-.02L50.47,3.58c-.31-.1-.64-.1-.95,0L4.53,18.58s-.02,.01-.03,.02c-.13,.05-.25,.11-.37,.19,0,0,0,0,0,0-.02,.01-.03,.03-.04,.04-.1,.08-.18,.16-.25,.26-.03,.03-.05,.07-.07,.11-.06,.09-.1,.17-.14,.27-.02,.04-.03,.08-.04,.12-.04,.14-.07,.28-.07,.42v60c0,.65,.41,1.22,1.03,1.42Zm35.96,8.82l-11.49-3.84v-25.17l11.49,3.84v25.17Zm8.01-40.41v4.34L6.5,40.17v-4.34l42,14Zm45-9.66l-42,14v-4.34l42-14v4.34Zm-43.5-6.75L9.74,20,50,6.58l40.26,13.42-40.26,13.42Z'>
                                </path>
                                <title>{item.revelation_id}</title>
                              </svg>
                            )
                            : (
                              <svg
                                fill='currentColor'
                                className='w-4 h-4 scale-[120%] -translate-y-[2px]'
                                version='1.1'
                                viewBox='-5.0 -10.0 110.0 110.0'
                              >
                                <path d='m80.699 69.102c0-14.699-22.898-30.699-29.199-34.699v-5.6992-0.10156c3.6016-0.39844 6.5-2.8008 7.8008-6-1.1016 0.39844-2.3008 0.69922-3.6016 0.69922-5.3008 0-9.6992-4.3984-9.6992-9.6992 0-1.3008 0.19922-2.5 0.69922-3.6016-3.6016 1.3984-6.1016 4.8984-6.1016 9 0 4.6992 3.3984 8.6016 7.8984 9.5v0.19922 5.6992c-6.1992 4.1016-29.199 20.102-29.199 34.699 0 3.8008 0.69922 7.5 2 10.898h-8.6016l0.003907 10.004h74.602v-10.102h-8.6016c1.3008-3.2969 2-7 2-10.797z'>
                                </path>
                                <title>{item.revelation_id}</title>
                              </svg>
                            )}
                        </div>
                      </div>
                      <div className='mt-2 flex truncate'>
                        <span className='flex-shrink-0 text-muted-foreground text-sm'>
                          {item.translation_id}
                        </span>
                        <Dot className='mx-1 w-3 scale-150' />
                        <span className='flex-shrink-0 text-muted-foreground text-sm'>
                          {item.number_of_verses} ayat
                        </span>
                      </div>

                      {relativeTime && (
                        <div className='flex items-center text-sm text-muted-foreground gap-x-1 mt-1.5'>
                          <History className='w-4 h-4 fill-muted' />
                          <span>Dibuka {relativeTime}</span>
                        </div>
                      )}

                      {isProgress && progressValue > 0 && (
                        <div className='flex items-center gap-1 mt-2.5 mb-1'>
                          <Progress
                            value={progressValue}
                            barClassName='rounded'
                            fillClassName='bg-chart-2'
                            className={'w-full mt-0.5'}
                          />
                          <div className='text-xs font-medium'>
                            <span>{totalProgress}</span>
                            /
                            <span>{item.number_of_verses} ayat</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

import { get_cache } from '#src/utils/cache-client.ts';
const LASTREAD_KEY = 'LASTREAD';

const LastRead = () => {
  const { last_read_ayah } = useLoaderData<
    typeof Loader
  >();

  if (!last_read_ayah) return null;

  return (
    <div className='surah-index '>
      <Link
        to={last_read_ayah.source}
        className='p-3 border-b flex items-center gap-x-3 bg-muted'
      >
        <p className='text-sm'>Lanjutkan Membaca {last_read_ayah.title}</p>
        <MoveRight className={cn('h-4 w-4 bounce-left-right opacity-80')} />
      </Link>
    </div>
  );
};
