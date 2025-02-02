import listSurahWithJuz from "#/src/constants/daftar-surah-with-juz.json";
import { Header } from "#src/components/custom/header";
import { Badge } from "#src/components/ui/badge";
import { Button, buttonVariants } from "#src/components/ui/button";
import { Label } from "#src/components/ui/label";
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { generateQuranReadingPlan } from "#src/utils/misc.quran.ts";
import type { QuranReadingPlan } from "#src/utils/misc.quran.ts";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion, useScroll, useSpring } from "framer-motion";
import { hasMatch } from "fzy.js";
import lodash from "lodash";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Crosshair,
  Minus,
  MoveRight,
  Puzzle,
  Rocket,
  Search as SearchIcon,
} from "lucide-react";
import React, { JSX, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, useFetcher, useLoaderData } from "react-router";

import {
  FAVORITESURAH_KEY,
  LASTREAD_KEY,
  LASTREADSURAH_KEY,
  LASTVISITPAGE_KEY,
  PLANREAD_KEY,
} from "#/src/constants/key";

async function getLastReadAyah() {
  const cachedData = await get_cache(LASTVISITPAGE_KEY) || [];
  if (cachedData.length > 0) {
    return cachedData.map((d: string) => {
      const surah_name = d.split("|")[0];
      const surah_index = d.split("|")[1];
      const ayah_index = d.split("|")[2];
      const page = d.split("|")[3];
      const juz = d.split("|")[4];
      // const title = `${surah_name} ${surah_index}:${ayah_index}`;
      const title = surah_name;
      let obj = {
        t: title, // title
        s: surah_index, // surah index
        a: ayah_index, // ayah index
        p: page, // page index
        j: juz, // page index
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
    plan_read: await get_cache(PLANREAD_KEY) || [],
    favorite_surah: await get_cache(FAVORITESURAH_KEY) || [],
    last_read_surah: await get_cache(LASTREADSURAH_KEY) || {},
    surat: Object.values(listSurahWithJuz).flat(),
    juz_amma: Object.values(listSurahWithJuz[30]).flat(),
  };

  return data;
}
export async function Action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const _days = formData.get("days");
  // const data = Object.fromEntries(formData);
  if (_days) {
    const days = Number(_days);
    const readingPlan = generateQuranReadingPlan(604, 114, days, "page"); // Target khatam dalam 30 hari, baca per halaman
    await saveTarget(readingPlan);
    return { success: true };
  }

  return { success: false };
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

  // list = lodash.sortBy(list, (s) => {
  //   const combined = searchKey
  //     .map((key) => lodash.get(s, key as string, ""))
  //     .join(" ");
  //   return -score(query, combined);
  // });

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
  return (
    <React.Fragment>
      <Header redirectTo="/muslim" title="Al Qur'an" />
      <React.Fragment>
        <Tabs className="w-full">
          <TabList
            aria-label="Quran"
            className="surah-index grid grid-cols-3 border-b border-border text-sm"
          >
            <MyTab id="surah">Surah</MyTab>
            <MyTab id="lastopen">Riwayat</MyTab>
            <MyTab id="target">Target</MyTab>
          </TabList>
          <MyTabPanel id="surah">
            <SurahView />
          </MyTabPanel>
          <MyTabPanel id="lastopen">
            <LastReadAyah />
          </MyTabPanel>
          <MyTabPanel id="target">
            <GoalsView />
            <Goals />
          </MyTabPanel>
        </Tabs>
      </React.Fragment>
    </React.Fragment>
  );
}

function SurahView() {
  const { favorite_surah, surat, juz_amma } = useLoaderData<
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

  const data_surat = surat;
  const data_placeholder = "Cari Surat..";

  //
  // const groupedJuz = groupJuzData(surat);

  // List of candidate strings
  // Often generated by something like require("glob")("**/*")
  // let list_data = [
  //   "app/models/user.rb",
  //   "app/models/order.rb",
  //   "app/models/customer.rb",
  // ];

  // Usually this is input from the user

  // fzy.js includes `hasMatch` which can be used for filtering
  // list_data = list_data.filter((s) => hasMatch(query, s));

  // Sort by fzy's scoring, descending (higher scores are better matches)
  // list_data = lodash.sortBy(list_data, (s) => -score(query, s));

  // Select only the first 10 results
  // list_data.slice(0, 10);

  // <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
  //   {list_data.map((s, index) => {
  //     let padded = "";
  //     const p = positions(query, s);
  //
  //     for (let i = 0; i < query.length; i++) {
  //       padded = padded.padEnd(p[i], " ") + query[i];
  //     }
  //
  //     return (
  //       <div key={index} style={{ marginBottom: "16px" }}>
  //         <div>{s}</div>
  //         <div classList="text-foreground">{padded}</div>
  //       </div>
  //     );
  //   })}
  // </div>
  // Print out our results with matched positions

  // Output:
  //
  // app/models/user.rb
  // a   m      user
  //
  // app/models/customer.rb
  // a   m       us   er

  return (
    <>
      <LastRead />

      <div className="surah-index relative pb-1">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-hidden focus-visible:bg-muted/30 border-b w-full text-sm p-3 bg-background"
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
        searchKey={["s.i", "s.n"]}
        query={query}
        render={(filteredData) => {
          if (filteredData.length > 0) {
            return (
              <VirtualizedListSurahJuz
                items={filteredData}
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
          className="p-3 flex items-center justify-center gap-x-2 bg-muted/50 text-sm [&_svg]:size-4 font-medium"
        >
          <Puzzle /> Susun Ayat{" "}
          <Badge>
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

const VirtualizedListSurahJuz: React.FC<
  {
    items: any[];
  }
> = (
  { items },
) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
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
        className="z-60 bg-primary  max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
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
            const item = items[virtualRow.index];
            const s = item?.s;
            const j = item?.j;
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
                {j && (
                  <Link
                    to={`/muslim/quran/${j.p}`}
                    className={cn(
                      "text-sm font-semibold py-3 px-4 flex items-center justify-between gap-x-3 text-primary/70 bg-gradient-to-r from-muted via-muted/80 to-muted/50 hover:bg-muted hover:text-primary",
                      s && "border-b",
                    )}
                  >
                    <span>
                      {j.n}
                    </span>
                    <span className="font-normal text-primary">
                      {j.p}
                    </span>
                  </Link>
                )}
                {s && (
                  <Link
                    to={`/muslim/quran/${s.p}?surah=${s.i}&ayah=1`}
                    className="py-1.5 pr-4 pl-3 flex-1 flex items-center justify-between bg-gradient-to-r from-background  to-muted/30 hover:bg-muted hover:bg-muted group"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="text-2xl font-medium text-center min-w-10 h-10 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                        {s.i}
                      </div>
                      <div className="truncate -space-y-2">
                        <div className="flex text-sm items-center">
                          <p className="font-medium">
                            Surah {s.n}
                          </p>
                        </div>
                        <div className="mt-2 flex truncate">
                          <span className="flex-shrink-0 text-muted-foreground text-sm">
                            {s.r}
                          </span>
                          <Minus className="mx-1 w-2 scale-150" />
                          <span className="flex-shrink-0 text-muted-foreground text-sm">
                            {s.v} ayat
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-sm">
                      {s.p}
                    </span>
                  </Link>
                )}

                {/*<pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>*/}
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

const VirtualizedListRecent: React.FC<
  {
    items: any[];
  }
> = (
  { items },
) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 62, // Perkiraan tinggi item (70px)
  });

  return (
    <React.Fragment>
      <div
        ref={parentRef}
        style={{
          height: `calc(100vh - 120px)`,
          overflow: "auto",
        }}
      >
        <div
          className="divide-y border-b"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const d = items[virtualRow.index];

            const to = `/muslim/quran/${d.p}?surah=${d.s}&ayah=${d.a}`;
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
                <Link
                  to={to}
                  className="py-1.5 pl-3 pr-4 flex-1 flex items-center justify-between  hover:bg-muted group"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="text-2xl font-medium text-center min-w-10 h-10 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                      {d.s}
                    </div>
                    <div className="truncate -space-y-2">
                      <div className="flex text-sm items-center">
                        <p className="font-medium">
                          Surah {d.t}
                        </p>
                      </div>
                      <div className="mt-2 flex truncate">
                        <span className="flex-shrink-0 text-muted-foreground text-sm">
                          Juz' {d.j}
                        </span>
                        <Minus className="mx-1 w-2 scale-150" />
                        <span className="flex-shrink-0 text-muted-foreground text-sm">
                          Hal {d.p}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm">
                    {d.p}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

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
      {lastReadAyah.length > 0
        ? (
          <div className="surah-index border-b py-1.5">
            <VirtualizedListRecent items={lastReadAyah} />
          </div>
        )
        : (
          <div className="py-6 text-center text-sm h-[calc(100vh-110px)] border-b flex items-center justify-center">
            Belum ada riwayat dibaca.
          </div>
        )}
    </>
  );
};

import type { TabPanelProps, TabProps } from "react-aria-components";
import {
  Button as ButtonRAC,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";

function MyTab(props: TabProps) {
  return (
    <Tab
      {...props}
      className={({ isSelected }) => `
        w-full py-2 font-medium text-center cursor-default outline-none transition-colors
        ${
        isSelected
          ? "border-b-2  border-primary  bg-background"
          : "text-muted-foreground hover:text-accent-foreground pressed:text-accent-foreground"
      }
      `}
    />
  );
}

function MyTabPanel(props: TabPanelProps) {
  return (
    <TabPanel
      {...props}
      className="outline-none"
    />
  );
}

function Article({ title, summary }: { title: string; summary: string }) {
  return (
    <Link
      to="#"
      className="p-2 rounded-lg hover:bg-gray-100 pressed:bg-gray-100 text-[inherit] no-underline outline-none focus-visible:ring-2 ring-emerald-500"
    >
      <h3 className="text-base mt-0 mb-0.5 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
        {title}
      </h3>
      <p className="text-sm m-0 overflow-hidden text-ellipsis line-clamp-2">
        {summary}
      </p>
    </Link>
  );
}

function Goals() {
  const [rentang, setRentang] = React.useState<string>(
    "",
  );
  const [target, setTarget] = React.useState<string>(
    "",
  );
  const [result, setResult] = React.useState<QuranReadingPlan[] | []>(
    [],
  );
  const target_opts = rentang === "harian"
    ? [
      5,
      10,
      15,
      20,
      25,
    ]
    : rentang === "mingguan"
    ? [
      1,
      2,
      3,
    ]
    : rentang === "bulanan"
    ? [1, 2, 3, 4, 5, 10]
    : rentang === "halaman"
    ? [1, 2, 4, 6, 12]
    : rentang === "juz"
    ? [0.5, 1, 2, 3, 4, 5]
    : [];

  React.useEffect(() => {
    if (target !== "" && rentang !== "") {
      if (["harian", "mingguan", "bulanan"].includes(rentang)) {
        const days = getTotalDays(
          rentang as "harian" | "mingguan" | "bulanan",
          Number(target),
        );
        const readingPlan = generateQuranReadingPlan(604, 114, days, "page"); // Target khatam dalam 30 hari, baca per halaman
        setResult(readingPlan);
      } else {
        const days = rentang === "juz"
          ? 30 / Number(target)
          : rentang === "halaman"
          ? 604 / Number(target)
          : 0;
        const readingPlan = generateQuranReadingPlan(604, 114, days, "page"); // Target khatam dalam 30 hari, baca per halaman
        setResult(readingPlan);
      }
    }
  }, [target]);

  return (
    <div className="max-w-2xl mx-auto text-start p-4">
      <h2 className="text-2xl sm:text-3xl font-extrabold">
        <span className="block">Bikin target baca Quran</span>
      </h2>
      <p className="mt-2 leading-6 text-muted-foreground">
        Yuk bikin target baca 10 menit sehari, menyelesaikan satu Juz dalam
        sebulan, atau menyelesaikan seluruh Al-Qur'an dalam setahun? Sangat
        mudah untuk membuat target dan melacak progress Anda.
      </p>

      <div className="grid gap-2 py-4">
        <div className="space-y-4 w-full">
          <div className="grid gap-4 py-4">
            <Select
              className="w-full"
              placeholder="Pilih rentang"
              name="rentang"
              selectedKey={rentang}
              onSelectionChange={(selected) => setRentang(selected as string)}
            >
              <Label>Rentang</Label>
              <SelectTrigger>
                <SelectValue className="capitalize" />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  {["halaman", "juz", "harian", "mingguan", "bulanan"].map((
                    option,
                  ) => (
                    <SelectItem
                      key={option}
                      id={option}
                      textValue={option}
                      className="capitalize"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectListBox>
              </SelectPopover>
            </Select>
            <Select
              className="w-full"
              placeholder="Pilih target"
              name="target"
              isDisabled={rentang === ""}
              selectedKey={target}
              onSelectionChange={(selected) => setTarget(selected as string)}
            >
              <Label>Target</Label>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  {target_opts.map((option) => (
                    <SelectItem
                      key={option}
                      id={option}
                      textValue={option.toString()}
                      className="capitalize"
                    >
                      {option === 0.5 ? "Setengah" : option}{" "}
                      {["harian", "mingguan", "bulanan"].includes(rentang)
                        ? rentang.replace("an", "")
                        : `${rentang} / hari`}
                    </SelectItem>
                  ))}
                </SelectListBox>
              </SelectPopover>
            </Select>
          </div>
        </div>
      </div>

      {result.length > 0 && <CalendarMonth plan={result} />}
    </div>
  );
}

function GoalsView() {
  const loaderData = useLoaderData<typeof Loader>();
  const target = loaderData.plan_read as QuranReadingPlan[];

  if (target.length === 0) return null;

  const targetLength = target.length;
  const totalTargetSessions = target.length;
  const total_sessions = target.filter((d) => d.completed).length;
  const today = format(new Date(), "yyyy-MM-dd");
  const progressToday = target.find((d) => d.date === today);

  const totalPagesProgress = target?.reduce(
    (sum, todo) => sum + (todo?.progress?.length ?? 0),
    0,
  );
  const pages_length = progressToday?.pages?.length || 0;
  const progress_length = progressToday?.progress?.length || 0;
  const next_read = pages_length > 0
    ? progressToday?.pages?.[progress_length]
    : 0;
  return (
    <div className="space-y-2 mt-3">
      <div className="max-w-2xl mx-auto text-start px-2 divide-y">
        <div className="mb-2">
          <div className="font-bold  px-2">
            {target[0]?.pages?.length} Halaman / Hari
          </div>
          <dl className="sm:divide-y sm:divide-border border rounded-md my-2">
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 px-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Progress
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 font-medium">
                {totalPagesProgress} /{" "}
                <span className="font-medium">
                  {progressToday?.pages?.length} Halaman
                </span>
              </dd>
            </div>
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 px-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Mulai
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {format(target[0].date, "PPPP", {
                  locale: localeId,
                })}
              </dd>
            </div>
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 px-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Khatam
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {format(target[target.length - 1].date, "PPPP", {
                  locale: localeId,
                })}
              </dd>
            </div>
          </dl>

          <Link
            className={cn(
              buttonVariants(),
              "mb-2",
            )}
            to={`/muslim/quran/${next_read ?? 0}`}
            title={`Lanjut Baca Hal ${next_read ?? 0}`}
          >
            Lanjut Baca Hal {next_read ?? 0}
            <ArrowRight />
          </Link>
          <Label>
            Progress Harian
          </Label>
          <div
            style={{ animationDelay: `0.1s` }}
            className="animate-slide-top [animation-fill-mode:backwards] mb-3 rounded-md transition-all duration-500 ease-in-out text-sm"
          >
            <div className="relative h-8 w-full rounded-md bg-muted">
              <div
                className={cn(
                  "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md backdrop-blur-md bg-primary/10 px-2 transition-all duration-500 ease-in-out",
                  totalTargetSessions >= targetLength && "rounded-md",
                )}
                style={{
                  width: `${100}%`,
                }}
              >
                {progressToday?.pages?.length} Hal
                <Crosshair className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-chart-2 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
                  (progressToday?.progress?.length ?? 0) >=
                      (progressToday?.pages?.length ?? 0) &&
                    "rounded-md",
                )}
                style={{
                  width: `${
                    ((progressToday?.progress?.length ?? 0) /
                      (progressToday?.pages?.length ?? 0)) * 100
                  }%`,
                }}
              >
                <div
                  className="flex shrink-0 items-center gap-1 font-medium"
                  style={{ opacity: 1 }}
                >
                  {(progressToday?.progress?.length ?? 0) >=
                      (progressToday?.pages?.length ?? 0)
                    ? <CircleCheckBig className="ml-2 h-5 w-5" />
                    : <Circle className="h-5 w-5" />}
                  {progressToday?.progress?.length} Hal
                  <ArrowRight
                    className={cn(
                      "h-5 w-5 ",
                      true && "ml-2 bounce-left-right",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <CalendarMonthProggres plan={target} />

          <Label className="mt-3">
            Progress Khatam
          </Label>
          <div
            style={{ animationDelay: `0.1s` }}
            className="animate-slide-top [animation-fill-mode:backwards] mb-3 rounded-md transition-all duration-500 ease-in-out text-sm"
          >
            <div className="relative h-8 w-full rounded-md bg-muted">
              <div className="flex h-8 items-center justify-end gap-1 px-2">
                {target.length} Hari
                <Rocket className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md backdrop-blur-md bg-primary/20 px-2 transition-all duration-500 ease-in-out",
                  totalTargetSessions >= targetLength && "rounded-md",
                )}
                style={{
                  width: `${
                    (totalTargetSessions / totalTargetSessions) * 100
                  }%`,
                }}
              >
                {totalTargetSessions} hari
                <Rocket className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-chart-5 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
                  totalTargetSessions >= 16 && "rounded-md",
                )}
                style={{
                  width: `${(total_sessions / totalTargetSessions) * 100}%`,
                }}
              >
                <div
                  className="flex shrink-0 items-center gap-1 font-medium"
                  style={{ opacity: 1 }}
                >
                  {totalTargetSessions >= 16
                    ? <CircleCheckBig className="ml-2 h-5 w-5" />
                    : <Circle className="h-5 w-5" />}
                  hari ke-{total_sessions}
                  <ArrowRight
                    className={cn(
                      "h-5 w-5 ",
                      true && "ml-2 bounce-left-right",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr />
        </div>
      </div>
    </div>
  );
}

const saveTarget = async (data: any) => {
  const response = await toast.promise(
    (async () => {
      // 🔥 Ambil cache sebelumnya
      // const savedData = await get_cache(PLANREAD_KEY) || [];

      // 🔥 Update data tanpa duplikasi
      const updatedData = data;
      // const updatedData = Array.from(new Set([...savedData, ...data]));

      // 🔥 Simpan data yang diperbarui
      await set_cache(PLANREAD_KEY, updatedData);

      return updatedData; // Mengembalikan hasil
    })(),
    {
      loading: "Menyimpan target bacaan...",
      success: "Target bacaan berhasil disimpan!",
      error: "Gagal menyimpan target bacaan",
    },
  );

  return response;
};

const CalendarMonthProggres = ({ plan }: { plan: QuranReadingPlan[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir bulan di waktu lokal
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Mengambil semua hari dalam bulan ini
    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });

    // Menghitung hari pertama bulan ini
    const firstDayOfMonth = getDay(startOfCurrentMonth);

    // Menyesuaikan hari pertama kalender, agar selalu dimulai dari Senin
    // Jika firstDayOfMonth adalah 0 (Minggu), kita anggap sebagai 7 (Sabtu),
    // dan kita sesuaikan paddingnya.
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Menambahkan padding untuk hari-hari sebelum tanggal 1 bulan
    const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

    setDaysInMonth(paddedDays);
  };

  // Update kalender saat currentMonth berubah
  React.useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  // Menangani navigasi bulan berikutnya dan sebelumnya
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  // [@media(min-width:900px)]

  return (
    <div className="">
      <div className="flex items-center justify-center gap-3 px-3 pb-3 py-1.5">
        <Button
          onPress={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", {
            locale: localeId,
          })}
        </h2>
        <Button
          onPress={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 border rounded-md mx-auto min-w-[280px] max-w-fit w-full grid grid-cols-7 gap-y-2">
        {/* Header hari (Senin, Selasa, Rabu, dll.) */}
        {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => (
          <div
            key={index}
            className="border-b text-center font-medium text-sm pb-2 text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((day, index) => {
          const dataKey = day ? format(day, "yyyy-MM-dd") : null;
          const readingPlan = day
            ? plan.find((d) => d.date === dataKey)
            : null;
          const readingPlanIndex = day
            ? plan.findIndex((d) => d.date === dataKey)
            : null;
          const shouldRead = readingPlan?.pages
            ? readingPlan?.pages?.length
            : 0;

          const hasRead = readingPlan?.progress
            ? readingPlan?.progress?.length
            : 0;
          const rangeRead = readingPlan?.pages
            ? `${readingPlan.pages[0]}-${readingPlan.pages[shouldRead - 1]}`
            : 0;
          return (
            <React.Fragment
              key={index}
            >
              <div
                key={index}
              >
                {shouldRead > 0
                  ? (
                    <TooltipTrigger delay={100}>
                      <ButtonRAC
                        className={cn(
                          "py-2 flex flex-col items-center cursor-pointer text-sm w-full",
                          shouldRead > 0 &&
                            "bg-muted font-medium",
                          isToday(day) &&
                            "font-medium bg-primary text-primary-foreground rounded-lg",
                          readingPlanIndex === plan.length - 1 &&
                            "font-medium bg-primary text-primary-foreground rounded-lg",
                        )}
                      >
                        {day ? format(day, "d") : ""}
                      </ButtonRAC>

                      {hasRead > 0 && (
                        <div
                          style={{ animationDelay: `0.1s` }}
                          className="animate-slide-top [animation-fill-mode:backwards] rounded-md transition-all duration-500 ease-in-out pt-1"
                        >
                          <div className="relative h-4 w-full rounded-md bg-muted">
                            <div
                              className={cn(
                                "absolute top-0 flex h-4 items-center justify-end gap-1 overflow-hidden rounded-l-md bg-muted px-2 transition-all duration-500 ease-in-out",
                                hasRead >= shouldRead && "rounded",
                              )}
                              style={{
                                width: `100%`,
                              }}
                            >
                            </div>
                            {hasRead > 0 && (
                              <div
                                className={cn(
                                  "z-10 absolute top-0 flex h-4 items-center justify-end gap-1 overflow-hidden bg-chart-2 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
                                  hasRead >= shouldRead && "rounded",
                                )}
                                style={{
                                  width: `${(hasRead / shouldRead) * 100}%`,
                                }}
                              >
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Tooltip placement="bottom" className="mt-2">
                        <p>Hal {rangeRead}</p>
                        <p>{hasRead} Hal yang sudah dibaca</p>
                      </Tooltip>
                    </TooltipTrigger>
                  )
                  : (
                    <div
                      className={cn(
                        "text-center py-2",
                        !readingPlan && "text-muted-foreground",
                      )}
                    >
                      {day ? format(day, "d") : ""}
                    </div>
                  )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const CalendarMonth = ({ plan }: { plan: QuranReadingPlan[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const fetcher = useFetcher();
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir bulan di waktu lokal
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Mengambil semua hari dalam bulan ini
    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });

    // Menghitung hari pertama bulan ini
    const firstDayOfMonth = getDay(startOfCurrentMonth);

    // Menyesuaikan hari pertama kalender, agar selalu dimulai dari Senin
    // Jika firstDayOfMonth adalah 0 (Minggu), kita anggap sebagai 7 (Sabtu),
    // dan kita sesuaikan paddingnya.
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Menambahkan padding untuk hari-hari sebelum tanggal 1 bulan
    const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

    setDaysInMonth(paddedDays);
  };

  // Update kalender saat currentMonth berubah
  React.useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  // Menangani navigasi bulan berikutnya dan sebelumnya
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  // [@media(min-width:900px)]
  return (
    <div className="">
      <div className="flex items-center justify-center gap-3 px-3 pb-3 py-1.5">
        <Button
          onPress={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          onPress={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 border rounded-md mx-auto min-w-[280px] max-w-fit w-full grid grid-cols-7 gap-y-2">
        {/* Header hari (Senin, Selasa, Rabu, dll.) */}
        {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => (
          <div
            key={index}
            className="border-b text-center font-medium text-sm pb-2 text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((day, index) => {
          const dataKey = day ? format(day, "yyyy-MM-dd") : null;
          const readingPlan = day
            ? plan.find((d: QuranReadingPlan) => d.date === dataKey)
            : null;
          const readingPlanIndex = day
            ? plan.findIndex((d) => d.date === dataKey)
            : null;
          const shouldRead = readingPlan?.pages
            ? readingPlan?.pages?.length
            : 0;

          const rangeRead = readingPlan?.pages
            ? `${readingPlan.pages[0]}-${readingPlan.pages[shouldRead - 1]}`
            : 0;
          return (
            <div
              key={index}
              className={cn(
                "py-2 flex flex-col items-center cursor-pointer text-sm",
                shouldRead > 0 &&
                  "bg-muted font-medium",
                isToday(day) &&
                  "font-medium bg-primary text-primary-foreground rounded-lg",
                readingPlanIndex === plan.length - 1 &&
                  "font-medium bg-primary text-primary-foreground rounded-lg",
              )}
            >
              {shouldRead > 0
                ? (
                  <TooltipTrigger delay={100}>
                    <ButtonRAC className="w-full h-full">
                      {day ? format(day, "d") : ""}
                    </ButtonRAC>
                    <Tooltip placement="bottom" className="mt-2">
                      <p>Hal {rangeRead}</p>
                    </Tooltip>
                  </TooltipTrigger>
                )
                : (
                  <div
                    className={cn(
                      "text-center",
                      !readingPlan && "text-muted-foreground",
                    )}
                  >
                    {day ? format(day, "d") : ""}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      <dl className="sm:divide-y sm:divide-border border-t mt-4">
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Bacaan
          </dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            {plan[0]?.pages?.length} Halaman / Hari
          </dd>
        </div>
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">Mulai</dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            {format(plan[0].date, "PPPP", {
              locale: localeId,
            })}
          </dd>
        </div>
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Khatam
          </dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            {format(plan[plan.length - 1].date, "PPPP", {
              locale: localeId,
            })}
          </dd>
        </div>
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Catatan
          </dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            Khatam {(365 / plan.length).toFixed(0)} kali dalam setahun
          </dd>
        </div>
      </dl>
      <div className="mt-4 px-2">
        <fetcher.Form action="/muslim/quran?index" method="post">
          <Button
            name="days"
            value={plan.length.toString()}
            type="submit"
          >
            Simpan Target
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
};

/**
 * Menghitung total hari berdasarkan rentang waktu yang dipilih
 * @param rentang Jenis rentang waktu: "harian", "mingguan", atau "bulanan"
 * @param jumlah Jumlah unit yang dipilih (misal: 5 hari, 3 minggu, 2 bulan)
 * @returns Total hari yang harus dicapai
 */
function getTotalDays(
  rentang: "harian" | "mingguan" | "bulanan",
  jumlah: number,
): number {
  if (rentang === "harian") {
    return jumlah; // Langsung jumlah hari
  }
  if (rentang === "mingguan") {
    return jumlah * 7; // Setiap minggu = 7 hari
  }
  if (rentang === "bulanan") {
    return jumlah === 12 ? 365 : jumlah * 30; // 12 bulan = 365 hari, lainnya 30 hari per bulan
  }
  return 0; // Jika rentang tidak valid, return 0
}

// // 🔥 Contoh Penggunaan
// console.log(getTotalDays("harian", 5));  // Output: 5
// console.log(getTotalDays("mingguan", 2)); // Output: 14
// console.log(getTotalDays("bulanan", 3));  // Output: 90
// console.log(getTotalDays("bulanan", 12)); // Output: 365
