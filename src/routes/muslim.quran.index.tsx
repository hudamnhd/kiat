import daftarSurat from "#/src/constants/list-surah.json";
import { Header } from "#src/components/custom/header";
import { Badge } from "#src/components/ui/badge";
import { buttonVariants } from "#src/components/ui/button";
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { cn } from "#src/utils/misc";
import { fetchAllSurahs } from "#src/utils/misc.quran.ts";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion, useScroll, useSpring } from "framer-motion";
import { hasMatch, score } from "fzy.js";
import lodash from "lodash";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Dot,
  History,
  MoveRight,
  Puzzle,
  Search as SearchIcon,
  Star,
} from "lucide-react";
import React, { JSX, useMemo, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

const LASTREADAYAHKEY = "LASTREADAYAHKEY";
const LASTREADSURAH_KEY = "LASTREADSURAH";
const FAVORITESURAH_KEY = "FAVORITESURAH";

async function getLastReadAyah() {
  const cachedData = await get_cache(LASTREADAYAHKEY) || [];
  if (cachedData.length > 0) {
    return cachedData.map((d: string) => {
      const surah_name = d.split(":")[0];
      const surah_index = d.split(":")[1];
      const ayah_index = d.split(":")[2];
      const page = d.split(":")[3];
      const title = `${surah_name} ${surah_index}:${ayah_index}`;
      let obj = {
        t: title, // title
        s: surah_index, // surah index
        a: ayah_index, // ayah index
        p: page, // page index
      };
      return obj;
    }).reverse();
  }
  return [];
}

export async function Loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  const data = {
    id,
    last_read_ayah_mark: await get_cache(LASTREAD_KEY),
    favorite_surah: await get_cache(FAVORITESURAH_KEY) || [],
    last_read_surah: await get_cache(LASTREADSURAH_KEY) || {},
    surat: daftarSurat,
    juz_amma: daftarSurat.filter((surat) => surat.index >= 78),
  };

  return data;
}

interface SearchProps<T> {
  data: T[];
  searchKey: (keyof T | string)[]; // String untuk nested key
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
    const combined = searchKey
      .map((key) => lodash.get(s, key as string, "")) // 🔥 Mendukung nested key
      .join(" ");
    return hasMatch(query, combined);
  });

  list = lodash.sortBy(list, (s) => {
    const combined = searchKey
      .map((key) => lodash.get(s, key as string, ""))
      .join(" ");
    return -score(query, combined);
  });

  list = query !== "" ? list.slice(0, 10) : list;

  return render(list);
}

import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "#src/components/ui/select";

export function Component() {
  const { last_read_surah, favorite_surah, surat, juz_amma } = useLoaderData<
    typeof Loader
  >();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const loadingIconRef = React.useRef<SVGSVGElement | null>(null);
  const searchIconRef = React.useRef<SVGSVGElement | null>(null);

  const handleSearch = useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);
        loadingIconRef.current?.classList.add("hidden");
        searchIconRef.current?.classList.remove("hidden");
      }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadingIconRef.current?.classList.remove("hidden");
    searchIconRef.current?.classList.add("hidden");
    setInput(e.target.value);
    handleSearch(e.target.value);
  };

  let [version, setVersion] = React.useState("all");
  const data_surat = version === "all" ? surat : juz_amma;
  const data_placeholder = version === "all"
    ? "Cari Surat.."
    : "Cari Surat Juz Amma..";

  const [selectedIds, setSelectedIds] = useState<string[]>(favorite_surah);

  const menu = (
    <TooltipTrigger defaultOpen={true} delay={300}>
      <Select
        aria-label="Select Type List"
        className="font-semibold min-w-[120px]"
        placeholder="Daftar Surat"
        selectedKey={version}
        onSelectionChange={(selected) => setVersion(selected as string)}
      >
        <SelectTrigger className="data-focused:outline-hidden data-focused:ring-none data-focused:ring-0 data-focus-visible:outline-hidden data-focus-visible:ring-none data-focus-visible:ring-0 border-none shadow-none p-0 [&_svg]:opacity-80 [&_svg]:size-[14px]">
          <SelectValue className="font-semibold" />
        </SelectTrigger>
        <SelectPopover>
          <SelectListBox>
            <SelectItem id="all" textValue="Al-Quran">
              Al-Quran
            </SelectItem>
            <SelectItem id="j30" textValue="Jus Amma">
              Jus Amma
            </SelectItem>
          </SelectListBox>
        </SelectPopover>
      </Select>
      <Tooltip placement="end">
        <p>Juz Amma / Semua Juz</p>
      </Tooltip>
    </TooltipTrigger>
  );

  return (
    <>
      <Header redirectTo="/muslim" title="Daftar Surat" menu={menu}>
        <Link
          className={cn(
            buttonVariants({ size: "icon", variant: "ghost" }),
            "prose-none [&_svg]:size-6 mr-0.5",
          )}
          to="/muslim/quran-v2/1"
          title="Al-Quran Per halaman"
        >
          V2
        </Link>
      </Header>

      {/*45px*/}
      <LastRead />

      <LastReadAyah />

      {
        /*<div className="surah-index px-3 border-b py-1.5">
        {Object.keys(last_read_surah).length > 0 && (
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Terakhir dibuka
          </div>
        )}

        <div className="flex max-w-xl overflow-x-auto gap-1.5 py-2">
          {Object.keys(last_read_surah).length > 0 &&
            surat
              .filter((navItem) =>
                Object.keys(last_read_surah).includes(navItem.index)
              ).sort((a, b) => a.created_at - b.created_at)
              .map((item) => {
                const to = `/muslim/quran/${item.number}`;

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
                    className="col-span-1 flex shadow-xs rounded-md hover:bg-accent"
                  >
                    <div className="flex-1 flex items-center justify-between border  rounded-md truncate">
                      <div className="flex-1 px-2.5 py-2 text-sm truncate">
                        <div className="font-semibold cursor-pointer">
                          <span className="font-semibold">
                            {item.number}. {item.name_id}
                          </span>
                          {" "}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-x-1 mt-1">
                          <span>{relativeTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>*/
      }

      {/*103px*/}
      {
        /*{selectedIds.length > 0 && (
        <div className="surah-index px-3 border-b py-1.5">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Surat Favorit
          </div>

          <div className="flex max-w-xl overflow-x-auto gap-1.5 py-2">
            {selectedIds.length > 0 &&
              surat
                .filter((navItem) => selectedIds.includes(navItem.number))
                .map((item) => {
                  const to = `/muslim/quran/${item.number}`;
                  return (
                    <Link
                      key={item.number}
                      to={to}
                      className="col-span-1 flex shadow-xs rounded-md hover:bg-accent"
                    >
                      <div className="flex-1 flex items-center justify-between border  rounded-md truncate">
                        <div className="flex-1 px-2.5 py-2 text-sm truncate">
                          <div className="font-semibold cursor-pointer">
                            <span className="font-semibold">
                              {item.number}. {item.name_id}
                            </span>
                            {" "}
                          </div>
                          <p className="text-muted-foreground line-clamp-1">
                            {item.translation_id}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      )}*/
      }

      <div className="surah-index relative pb-1">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-hidden focus-visible:bg-muted border-b w-full text-sm p-3 bg-background"
          placeholder={data_placeholder}
          type="search"
          value={input}
          onChange={handleInputChange}
        />
        <SearchIcon
          ref={searchIconRef}
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute inset-y-3 start-3 peer-focus:rotate-90 text-muted-foreground/80 peer-disabled:opacity-50 duration-300"
        />
        <svg
          id="loading-icon"
          ref={loadingIconRef}
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden m-1 animate-spin text-foreground pointer-events-none absolute inset-y-2 start-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <SearchHandler
        data={data_surat}
        searchKey={["name.id", "index"]}
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
              <div className="py-6 text-center text-sm h-[calc(100vh-290px)] border-b flex items-center justify-center">
                Surat tidak ditemukan.
              </div>
            );
          }
        }}
      />
      {/*46px*/}
      <div className="surah-index">
        <Link
          to="/muslim/quran-word-by-word"
          className="p-3 flex items-center justify-center gap-x-2 bg-muted/30 text-sm [&_svg]:size-4 font-medium"
        >
          <Puzzle /> Susun Ayat{" "}
          <Badge className="bg-lime-400 hover:bg-lime-500 text-black">
            Baru
          </Badge>
        </Link>
      </div>
      {/*<Example />*/}
    </>
  );
}

function getTotalHeight() {
  // Seleksi semua elemen dengan class 'surah-index'
  const elements = document.querySelectorAll(".surah-index");

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
  const { last_read_surah, favorite_surah, last_read_ayah_mark } =
    useLoaderData<
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
        className="z-60 bg-chart-2  max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: getTotalHeight() - 50,
          left: 0,
          right: 0,
          height: 2.5,
          originX: 0,
        }}
      />
      <div
        ref={parentRef}
        className="border-b"
        style={{
          height: `calc(100vh - ${getTotalHeight()}px)`,
          overflow: "auto",
        }}
      >
        <div
          className="divide-y"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
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

            const to =
              `/muslim/quran/${item.meta.page.start}?surah=${item.index}&ayah=1`;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="first:border-t group"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className={cn(
                    "px-4 pt-2.5 pb-1.5 flex items-center hover:bg-accent",
                  )}
                >
                  <Link
                    to={to}
                    className="min-w-0 flex-1 flex items-center justify-between"
                  >
                    <div className="truncate -space-y-1.5">
                      <div className="flex text-sm items-center">
                        <p className="font-medium">
                          {item.index}. {item.name.id}
                        </p>

                        <div className="ml-1 flex items-center text-sm text-muted-foreground gap-x-2">
                          {item.revelation.id === "Makkiyyah"
                            ? (
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 100 100"
                                fill="currentColor"
                                x="0px"
                                y="0px"
                              >
                                <path d="M4.53,81.42l45,15s0,0,0,0c.15,.05,.31,.08,.47,.08s.32-.03,.47-.08c0,0,0,0,0,0l45-15c.61-.2,1.03-.78,1.03-1.42V20c0-.14-.03-.28-.07-.42-.01-.04-.03-.08-.04-.12-.04-.09-.08-.18-.14-.27-.02-.04-.04-.07-.07-.11-.07-.1-.16-.18-.25-.26-.02-.01-.03-.03-.04-.04,0,0,0,0,0,0-.11-.08-.24-.14-.37-.19-.01,0-.02-.01-.03-.02L50.47,3.58c-.31-.1-.64-.1-.95,0L4.53,18.58s-.02,.01-.03,.02c-.13,.05-.25,.11-.37,.19,0,0,0,0,0,0-.02,.01-.03,.03-.04,.04-.1,.08-.18,.16-.25,.26-.03,.03-.05,.07-.07,.11-.06,.09-.1,.17-.14,.27-.02,.04-.03,.08-.04,.12-.04,.14-.07,.28-.07,.42v60c0,.65,.41,1.22,1.03,1.42Zm35.96,8.82l-11.49-3.84v-25.17l11.49,3.84v25.17Zm8.01-40.41v4.34L6.5,40.17v-4.34l42,14Zm45-9.66l-42,14v-4.34l42-14v4.34Zm-43.5-6.75L9.74,20,50,6.58l40.26,13.42-40.26,13.42Z">
                                </path>
                                <title>{item.revelation_id}</title>
                              </svg>
                            )
                            : (
                              <svg
                                fill="currentColor"
                                className="w-4 h-4 scale-[120%] -translate-y-[2px]"
                                version="1.1"
                                viewBox="-5.0 -10.0 110.0 110.0"
                              >
                                <path d="m80.699 69.102c0-14.699-22.898-30.699-29.199-34.699v-5.6992-0.10156c3.6016-0.39844 6.5-2.8008 7.8008-6-1.1016 0.39844-2.3008 0.69922-3.6016 0.69922-5.3008 0-9.6992-4.3984-9.6992-9.6992 0-1.3008 0.19922-2.5 0.69922-3.6016-3.6016 1.3984-6.1016 4.8984-6.1016 9 0 4.6992 3.3984 8.6016 7.8984 9.5v0.19922 5.6992c-6.1992 4.1016-29.199 20.102-29.199 34.699 0 3.8008 0.69922 7.5 2 10.898h-8.6016l0.003907 10.004h74.602v-10.102h-8.6016c1.3008-3.2969 2-7 2-10.797z">
                                </path>
                                <title>{item.revelation.id}</title>
                              </svg>
                            )}
                        </div>
                        {is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400 ml-1">
                            <title>Surat Favorit</title>
                          </Star>
                        )}
                      </div>
                      <div className="mt-2 flex truncate">
                        <span className="flex-shrink-0 text-muted-foreground text-sm">
                          {item.name.tr_id}
                        </span>
                        <Dot className="mx-1 w-3 scale-150" />
                        <span className="flex-shrink-0 text-muted-foreground text-sm">
                          {item.meta.number_of_verses} ayat
                        </span>
                      </div>

                      {relativeTime && (
                        <div className="flex items-center text-sm text-muted-foreground gap-x-1 mt-1.5">
                          <History className="w-4 h-4 fill-muted" />
                          <span>Dibuka {relativeTime}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-shrink-0 flex gap-2 items-center">
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
                    <div className="font-indopak text-xl sm:text-2xl text-primary text-right">
                      {item.name.ar}
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
                    <div className='sm:block hidden ml-auto font-kemenag text-xl text-primary text-right my-auto flex-none'>
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

import { get_cache } from "#src/utils/cache-client.ts";
const LASTREAD_KEY = "LASTREAD";

const LastRead = () => {
  const { last_read_ayah_mark } = useLoaderData<
    typeof Loader
  >();

  if (!last_read_ayah_mark) return null;

  return (
    <div className="surah-index ">
      <Link
        to={last_read_ayah_mark.source}
        className="p-3 border-b flex items-center gap-x-3 bg-muted"
      >
        <p className="text-sm">Lanjutkan Membaca {last_read_ayah_mark.title}</p>
        <MoveRight className={cn("h-4 w-4 bounce-left-right opacity-80")} />
      </Link>
    </div>
  );
};

const LastReadAyah = () => {
  const [lastReadAyah, setLastReadAyah] = useState([]);

  async function loadLastRead() {
    const data = await getLastReadAyah();
    setLastReadAyah(data);
  }

  React.useEffect(() => {
    loadLastRead();
  }, []);

  return (
    <>
      {lastReadAyah.length > 0 && (
        <div className="surah-index px-3 border-b py-1.5">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Terakhir dibaca
          </div>

          <div className="flex flex-wrap max-w-xl overflow-y-auto max-h-[70px] gap-3 py-2 px-1">
            {lastReadAyah.map(
              (
                d: { t: string; p: string; s: string; a: string },
                index: number,
              ) => {
                const to = `/muslim/quran/${d.p}?surah=${d.s}&ayah=${d.a}`;

                return (
                  <Link
                    key={index}
                    to={to}
                    className={cn(
                      "flex-none text-primary underline underline-offset-2 hover:text-muted-foreground text-sm font-semibold",
                    )}
                  >
                    {d.t}
                  </Link>
                );
              },
            )}
          </div>
        </div>
      )}
    </>
  );
};

import { Calendar, ChevronRight } from "lucide-react";

const positions = [
  {
    id: 1,
    title: "Back End Developer",
    department: "Engineering",
    closeDate: "2020-01-07",
    closeDateFull: "January 7, 2020",
    applicants: [
      {
        name: "Dries Vincent",
        email: "driesvincent@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Lindsay Walton",
        email: "lindsaywalton@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Courtney Henry",
        email: "courtneyhenry@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Tom Cook",
        email: "tomcook@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Front End Developer",
    department: "Engineering",
    closeDate: "2020-01-07",
    closeDateFull: "January 7, 2020",
    applicants: [
      {
        name: "Whitney Francis",
        email: "whitneyfrancis@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Leonard Krasner",
        email: "leonardkrasner@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Floyd Miles",
        email: "floydmiles@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 3,
    title: "User Interface Designer",
    department: "Design",
    closeDate: "2020-01-14",
    closeDateFull: "January 14, 2020",
    applicants: [
      {
        name: "Emily Selman",
        email: "emilyselman@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Kristin Watson",
        email: "kristinwatson@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        name: "Emma Dorsey",
        email: "emmadorsey@example.com",
        imageUrl:
          "https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
];

function Example() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {positions.map((position) => (
          <li key={position.id}>
            <a href="#" className="block hover:bg-gray-50">
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">
                        {position.title}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        in {position.department}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        <p>
                          Closing on{" "}
                          <time dateTime={position.closeDate}>
                            {position.closeDateFull}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex overflow-hidden -space-x-1">
                      {position.applicants.map((applicant) => (
                        <img
                          key={applicant.email}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                          src={applicant.imageUrl}
                          alt={applicant.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <ChevronRight
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
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
