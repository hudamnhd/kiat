import { Header } from '#src/components/custom/header';
import { Badge } from '#src/components/ui/badge';
import { Button, buttonVariants } from '#src/components/ui/button';
import { Spinner } from '#src/components/ui/spinner-circle';
import { Tooltip, TooltipTrigger } from '#src/components/ui/tooltip';
import { data as daftar_surat } from '#src/constants/daftar-surat.json';
import { cn } from '#src/utils/misc';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion, useScroll, useSpring } from 'framer-motion';
import { hasMatch, score } from 'fzy.js';
import lodash from 'lodash';
import {
  Hexagon,
  History,
  MoveRight,
  Puzzle,
  Search as SearchIcon,
  Star,
} from 'lucide-react';
import { Dot } from 'lucide-react';
import React, { JSX, useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import quranIndexLoader from './muslim.quran.index.data';

const LASTREADSURAH_KEY = 'LASTREADSURAH';
const FAVORITESURAH_KEY = 'FAVORITESURAH';

export async function Loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  const data = {
    id,
    favorite_surah: await get_cache(FAVORITESURAH_KEY) || [],
    last_read_surah: await get_cache(LASTREADSURAH_KEY) || {},
    surat: daftar_surat,
    juz_amma: daftar_surat.filter((surat) => parseInt(surat.number) >= 78),
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

import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from '#src/components/ui/select';

export function Component() {
  const { last_read_surah, favorite_surah, surat, juz_amma } = useLoaderData<
    typeof quranIndexLoader
  >();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  const handleSearch = useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);
        document.getElementById('loading-indicator')?.classList.add('hidden');
      }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    handleSearch(e.target.value);
    document.getElementById('loading-indicator')?.classList.remove('hidden');
  };

  let [version, setVersion] = React.useState('all');
  const data_surat = version === 'all' ? surat : juz_amma;
  const data_placeholder = version === 'all'
    ? 'Cari Surat..'
    : 'Cari Surat Juz Amma..';

  const [selectedIds, setSelectedIds] = useState<string[]>(favorite_surah);

  const menu = (
    <TooltipTrigger defaultOpen={true} delay={300}>
      <Select
        aria-label='Select Type List'
        className='text-lg font-semibold min-w-[120px]'
        placeholder='Daftar Surat'
        selectedKey={version}
        onSelectionChange={(selected) => setVersion(selected as string)}
      >
        <SelectTrigger className='data-focused:outline-hidden data-focused:ring-none data-focused:ring-0 data-focus-visible:outline-hidden data-focus-visible:ring-none data-focus-visible:ring-0 border-none shadow-none p-0 [&_svg]:opacity-80 [&_svg]:size-[14px]'>
          <SelectValue className='text-lg font-semibold' />
        </SelectTrigger>
        <SelectPopover>
          <SelectListBox>
            <SelectItem id='all' textValue='Al-Quran'>
              Al-Quran
            </SelectItem>
            <SelectItem id='j30' textValue='Jus Amma'>
              Jus Amma
            </SelectItem>
          </SelectListBox>
        </SelectPopover>
      </Select>
      <Tooltip placement='bottom'>
        <p>Juz Amma / Semua Juz</p>
      </Tooltip>
    </TooltipTrigger>
  );

  return (
    <>
      <Header redirectTo='/muslim' title='Daftar Surat' menu={menu}>
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
      <LastRead />

      <div className='px-1.5 mt-1.5 border-b pb-1.5'>
        <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
          Surat Favorit
        </div>

        <div className='flex max-w-xl overflow-x-auto gap-1.5 mt-1 pb-2'>
          {selectedIds.length > 0
            ? surat
              .filter((navItem) => selectedIds.includes(navItem.number))
              .map((item) => {
                const to = `/muslim/quran/${item.number}`;
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
                        <p className='text-muted-foreground line-clamp-1'>
                          {item.translation_id}

                          <span className='sm:inline-flex hidden ml-1 text-xs'>
                            <span className='mr-l'>
                              {' '}
                              {item.number_of_verses} ayat
                            </span>
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            : (
              <div className='flex items-center justify-center text-center text-sm'>
                Yuk Tambahkan daftar surat favorit
              </div>
            )}
        </div>
      </div>
      <div className='relative mb-1'>
        <input
          id='input-26'
          className='h-10 peer pe-9 ps-9 outline-hidden focus-visible:ring-2 focus-visible:ring-ring border-b w-full text-sm p-3 bg-background'
          placeholder={data_placeholder}
          type='search'
          value={input}
          onChange={handleInputChange}
        />
        <SearchIcon
          size={16}
          strokeWidth={2}
          className='pointer-events-none absolute inset-y-3 start-3 peer-focus:rotate-90 text-muted-foreground/80 peer-disabled:opacity-50 duration-300'
        />
        <div
          id='loading-indicator'
          className='hidden absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-colors'
        >
          <Spinner className='size-5' />
        </div>
      </div>

      <SearchHandler
        data={data_surat}
        searchKey={['name_id', 'number']}
        query={query}
        render={(filteredData) => {
          if (filteredData.length > 0) {
            return (
              <VirtualizedListSurah
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
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
      <Link
        to='/muslim/quran-word-by-word'
        className='p-3 flex items-center justify-center gap-x-2 bg-muted/30 text-sm [&_svg]:size-4 font-medium'
      >
        <Puzzle /> Susun Ayat{' '}
        <Badge className='bg-lime-400 hover:bg-lime-500 text-black'>New</Badge>
      </Link>
      {/*<Example />*/}
    </>
  );
}

const VirtualizedListSurah: React.FC<
  {
    items: any[];
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    lastSurah: {
      [x: string]: {
        created_at: string;
      };
    };
  }
> = (
  { items, selectedIds, setSelectedIds, lastSurah },
) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Fungsi untuk menambahkan ID ke dalam array
  const addId = (id: string) => {
    setSelectedIds((prevIds) => {
      // Pastikan ID belum ada dalam array sebelum menambahkannya
      if (!prevIds.includes(id)) {
        return [...prevIds, id];
      }
      return prevIds;
    });
  };

  // Fungsi untuk menghapus ID dari array
  const removeId = (id: string) => {
    setSelectedIds((prevIds) =>
      prevIds.filter((currentId) => currentId !== id)
    );
  };
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
        className='h-[calc(100vh-290px)] border-b'
        style={{
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
            const is_favorite = selectedIds.includes(item.number);
            const is_last_read = lastSurah[item.number];

            const relativeTime = is_last_read
              ? formatDistanceToNow(new Date(is_last_read.created_at), {
                addSuffix: true,
                includeSeconds: true,
                locale: localeId,
              })
              : null;

            const to = `/muslim/quran/${item.number}`;
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
                    'px-4 py-3 flex items-center hover:bg-accent',
                  )}
                >
                  <Link
                    to={to}
                    className='min-w-0 flex-1 flex items-center justify-between'
                  >
                    <div className='flex-none truncate -space-y-1.5'>
                      <div className='flex text-sm items-center'>
                        <p className='font-medium'>
                          {item.number}. {item.name_id}
                        </p>
                        <p className='ml-1 flex-shrink-0 text-muted-foreground'>
                          ({item.translation_id})
                        </p>
                        {is_favorite && (
                          <Star className='w-4 h-4 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400 ml-1'>
                            <title>Surat Favorit</title>
                          </Star>
                        )}
                      </div>
                      <div className='mt-2 flex'>
                        <div className='flex items-center text-sm text-muted-foreground gap-x-2'>
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
                          <span>{item.revelation_id}</span>
                        </div>
                        <Dot className='mx-1 w-3 scale-150' />
                        <div className='flex items-center text-sm text-muted-foreground gap-x-2'>
                          <Hexagon className='w-4 h-4 fill-muted' />
                          <span>{item.number_of_verses} ayat</span>
                        </div>
                      </div>

                      {relativeTime && (
                        <div className='flex items-center text-sm text-muted-foreground gap-x-1 mt-2.5'>
                          <History className='w-4 h-4 fill-muted' />
                          <span>Dibuka {relativeTime}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className='flex-shrink-0 flex gap-2 items-center'>
                    {
                      /*<Button
                      onPress={() =>
                        is_favorite
                          ? removeId(item.number)
                          : addId(item.number)}
                      size='icon'
                      variant='link'
                      title={is_favorite
                        ? 'Hapus dari daftar favorit'
                        : 'Tambahkan ke daftar favorit'}
                      className={cn(
                        'mr-1 [&_svg]:size-5 text-base',
                      )}
                    >
                      <Star
                        className={cn(
                          '',
                          is_favorite &&
                            'text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400',
                        )}
                      />
                    </Button>*/
                    }
                    <div className='font-lpmq-2 text-xl sm:text-2xl text-primary text-right'>
                      {item.name_short}
                    </div>
                  </div>
                </div>
                {
                  /*<div
                  className={cn(
                    'relative flex cursor-pointer select-none items-start px-3 py-2 outline-hidden hover:bg-accent hover:text-accent-foreground text-sm',
                    is_favorite &&
                      'hover:bg-yellow-50 dark:hover:bg-yellow-950',
                  )}
                >
                  <Button
                    onPress={() =>
                      is_favorite ? removeId(item.number) : addId(item.number)}
                    size='icon'
                    variant={is_favorite ? 'default' : 'outline'}
                    title={is_favorite
                      ? 'Hapus dari daftar favorit'
                      : 'Tambahkan ke daftar favorit'}
                    className={cn(
                      'mr-1 [&_svg]:size-5 text-base',
                      is_favorite &&
                        'group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 ',
                    )}
                  >
                    <Star
                      className={cn(
                        'group-hover:animate-slide-top group-hover:[animation-fill-mode:backwards] group-hover:inline hidden transition-all duration-100',
                        is_favorite &&
                          'text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400',
                      )}
                    />
                    <span className='group-hover:animate-slide-top group-hover:[animation-fill-mode:backwards] group-hover:hidden inline transition-all duration-100'>
                      {item.number}
                    </span>
                  </Button>
                  <Link
                    to={to}
                    className='w-full flex items-center justify-between'
                  >
                    <div className='w-full'>
                      <div className='flex items-center gap-1'>
                        <span className='font-semibold ml-1'>
                          {item.name_id}
                        </span>{' '}
                        <span className='opacity-80'>
                          ({item.translation_id})
                        </span>

                        {is_favorite && (
                          <Star className='w-4 h-4 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400'>
                            <title>Surat Favorit</title>
                          </Star>
                        )}
                      </div>
                      <div className='ml-1 flex flex-col text-muted-foreground gap-1 sm:text-sm text-xs -space-y-1'>
                        <span>{item.number_of_verses} ayat</span>
                      </div>
                    </div>
                    <div className='sm:block hidden ml-auto font-lpmq-2 text-xl text-primary text-right my-auto flex-none'>
                      {item.name_short}
                    </div>

                    {item.revelation_id === 'Makkiyyah'
                      ? (
                        <svg
                          className='w-4 h-4'
                          viewBox='0 0 100 100'
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
                          className='w-4 h-4 scale-[120%]'
                          version='1.1'
                          viewBox='-5.0 -10.0 110.0 110.0'
                        >
                          <path d='m80.699 69.102c0-14.699-22.898-30.699-29.199-34.699v-5.6992-0.10156c3.6016-0.39844 6.5-2.8008 7.8008-6-1.1016 0.39844-2.3008 0.69922-3.6016 0.69922-5.3008 0-9.6992-4.3984-9.6992-9.6992 0-1.3008 0.19922-2.5 0.69922-3.6016-3.6016 1.3984-6.1016 4.8984-6.1016 9 0 4.6992 3.3984 8.6016 7.8984 9.5v0.19922 5.6992c-6.1992 4.1016-29.199 20.102-29.199 34.699 0 3.8008 0.69922 7.5 2 10.898h-8.6016l0.003907 10.004h74.602v-10.102h-8.6016c1.3008-3.2969 2-7 2-10.797z'>
                          </path>
                          <title>{item.revelation_id}</title>
                        </svg>
                      )}
                    <span>{item.revelation_id}</span>
                  </Link>
                </div>*/
                }
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
  const [lastRead, setLastRead] = React.useState<
    {
      source: string;
      title: string;
    } | null
  >(null);

  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedLastRead = await get_cache(LASTREAD_KEY);
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
    };

    load_bookmark_from_lf();
  }, []);

  if (!lastRead) {
    return (
      <div className='p-3 border-b flex items-center gap-x-3 bg-background w-full'>
        <p className='text-sm text-center mx-auto'>Baca quran, Yuk!</p>
      </div>
    );
  }

  return (
    <Link
      to={lastRead.source}
      className='p-3 border-b flex items-center gap-x-3 bg-muted'
    >
      <p className='text-sm'>Lanjutkan Membaca {lastRead.title}</p>
      <MoveRight className={cn('h-4 w-4 bounce-left-right opacity-80')} />
    </Link>
  );
};

import { Calendar, ChevronRight } from 'lucide-react';

const positions = [
  {
    id: 1,
    title: 'Back End Developer',
    department: 'Engineering',
    closeDate: '2020-01-07',
    closeDateFull: 'January 7, 2020',
    applicants: [
      {
        name: 'Dries Vincent',
        email: 'driesvincent@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Lindsay Walton',
        email: 'lindsaywalton@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Courtney Henry',
        email: 'courtneyhenry@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Tom Cook',
        email: 'tomcook@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    ],
  },
  {
    id: 2,
    title: 'Front End Developer',
    department: 'Engineering',
    closeDate: '2020-01-07',
    closeDateFull: 'January 7, 2020',
    applicants: [
      {
        name: 'Whitney Francis',
        email: 'whitneyfrancis@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Leonard Krasner',
        email: 'leonardkrasner@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Floyd Miles',
        email: 'floydmiles@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    ],
  },
  {
    id: 3,
    title: 'User Interface Designer',
    department: 'Design',
    closeDate: '2020-01-14',
    closeDateFull: 'January 14, 2020',
    applicants: [
      {
        name: 'Emily Selman',
        email: 'emilyselman@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Kristin Watson',
        email: 'kristinwatson@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Emma Dorsey',
        email: 'emmadorsey@example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    ],
  },
];

function Example() {
  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-md'>
      <ul role='list' className='divide-y divide-gray-200'>
        {positions.map((position) => (
          <li key={position.id}>
            <a href='#' className='block hover:bg-gray-50'>
              <div className='px-4 py-4 flex items-center sm:px-6'>
                <div className='min-w-0 flex-1 sm:flex sm:items-center sm:justify-between'>
                  <div className='truncate'>
                    <div className='flex text-sm'>
                      <p className='font-medium text-indigo-600 truncate'>
                        {position.title}
                      </p>
                      <p className='ml-1 flex-shrink-0 font-normal text-gray-500'>
                        in {position.department}
                      </p>
                    </div>
                    <div className='mt-2 flex'>
                      <div className='flex items-center text-sm text-gray-500'>
                        <Calendar
                          className='flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400'
                          aria-hidden='true'
                        />
                        <p>
                          Closing on{' '}
                          <time dateTime={position.closeDate}>
                            {position.closeDateFull}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 flex-shrink-0 sm:mt-0 sm:ml-5'>
                    <div className='flex overflow-hidden -space-x-1'>
                      {position.applicants.map((applicant) => (
                        <img
                          key={applicant.email}
                          className='inline-block h-6 w-6 rounded-full ring-2 ring-white'
                          src={applicant.imageUrl}
                          alt={applicant.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className='ml-5 flex-shrink-0'>
                  <ChevronRight
                    className='h-5 w-5 text-gray-400'
                    aria-hidden='true'
                  />
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
