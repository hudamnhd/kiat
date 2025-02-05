import { Header } from "#src/components/custom/header";
import { LayoutMain } from "#src/components/custom/layout.tsx";
import { Button } from "#src/components/ui/button";
import { Spinner } from "#src/components/ui/spinner";
import PERINTAH from "#src/constants/perintah.json";
import { pageAyahs } from "#src/constants/quran-metadata";
import { SOURCE_TRANSLATIONS } from "#src/constants/sources";
import { cn } from "#src/utils/misc";
import {
  getDataStyle,
  getTranslation,
  toArabicNumber,
} from "#src/utils/misc.quran.ts";
import FlexSearch from "flexsearch";
import lodash from "lodash";
import { Minus, MoveRight, Search as SearchIcon } from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useFetcher, useNavigate } from "react-router";

type Ayah = {
  i: number;
  ta: string;
  vk: string;
  tt: string;
};

export async function Loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const source = url.searchParams.get("source") || "kemenag";

  // 🔥 Ambil data ayat & terjemahan secara paralel
  const [verses, trans] = await Promise.all([
    getDataStyle("indopak"),
    getTranslation(source),
  ]);

  // 🔹 Gabungkan data ayat dengan terjemahan (cek panjang array untuk keamanan)
  const merged = verses.map((d, index) => ({
    i: d.i,
    ta: d.t,
    vk: d.vk,
    tt: trans[index]?.t || "", // Hindari error jika `trans[index]` undefined
  }));

  // 🔥 Buat indeks FlexSearch untuk `vk` & `tr`
  const index = new FlexSearch.Index({
    preset: "match",
    tokenize: "strict",
    cache: true,
    resolution: 9,
  });

  // 🔹 Tambahkan data ke indeks FlexSearch
  merged.forEach((verse) => {
    index.add(verse.i, `${verse.vk} ${verse.tt}`);
  });

  // 🔥 Cari berdasarkan query
  const resultIds = index.search(query, { limit: 10 });

  // 🔹 Konversi ID hasil pencarian menjadi objek ayat yang sesuai

  const results: Ayah[] = resultIds.reduce((acc, id) => {
    const found = merged.find((verse) => verse.i === id);
    if (found) (acc as Ayah[]).push(found);
    return acc;
  }, []);
  return { source, query, data: results };
}

import { ChevronDown } from "lucide-react";
import { useId } from "react";

export function Component() {
  return (
    <>
      <Header redirectTo="/muslim/quran" title="Pencarian" />
      <SearchBox />
      <ResultSearch />
    </>
  );
}

const SearchBox = () => {
  const fetcher = useFetcher({ key: "search-translation" });

  const id = useId();
  const [input, setInput] = React.useState("");
  const sourceValueRef = React.useRef<HTMLSelectElement | null>(null);
  const loadingIconRef = React.useRef<SVGSVGElement | null>(null);
  const searchIconRef = React.useRef<SVGSVGElement | null>(null);

  const handleSearch = React.useMemo(
    () =>
      lodash.debounce((value: string) => {
        loadingIconRef.current?.classList.add("hidden");
        searchIconRef.current?.classList.remove("hidden");
        const source = sourceValueRef.current?.value || "kemenag";

        fetcher.submit(
          { query: value, source },
          { method: "get", action: "/terjemahan" },
        );
      }, 500),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadingIconRef.current?.classList.remove("hidden");
    searchIconRef.current?.classList.add("hidden");
    setInput(e.target.value);
    handleSearch(e.target.value);
  };

  const handleInputChangeValue = (value: string) => {
    loadingIconRef.current?.classList.remove("hidden");
    searchIconRef.current?.classList.add("hidden");
    setInput(value);
    handleSearch(value);
  };

  const handleSelectChange = () => {
    handleSearch(input);
  };

  return (
    <React.Fragment>
      <div className="space-y-2">
        <div className="flex sm:flex-row flex-col border-b divide-x divide-y sm:divide-y-0">
          <div className="relative flex-1">
            <input
              id={id}
              className="h-10 peer pe-9 ps-9 outline-hidden focus-visible:bg-muted/30 w-full text-sm p-3 bg-background focus-visible:z-10"
              placeholder="Cari"
              type="search"
              value={input}
              autoFocus={true}
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

          <div className="relative h-10 sm:h-auto">
            <select
              className="bg-muted w-full h-10 peer inline-flex h-full appearance-none items-center  bg-background pe-8 ps-3 text-sm text-muted-foreground transition-shadow hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Source"
              name="source"
              ref={sourceValueRef}
              onChange={handleSelectChange}
            >
              {SOURCE_TRANSLATIONS.map((
                option,
              ) => (
                <option
                  key={option.id}
                  id={option.id}
                  value={option.id}
                >
                  {option.title.toLocaleUpperCase()}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 end-0 z-10 flex h-full w-9 items-center justify-center text-muted-foreground/80 peer-disabled:opacity-50">
              <ChevronDown
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                role="img"
              />
            </span>
          </div>
        </div>
      </div>
      {input.length === 0 && (
        <SuggestionSearh handler={handleInputChangeValue} />
      )}
    </React.Fragment>
  );
};

const SuggestionSearh = (
  { handler }: { handler: (value: string) => void },
) => {
  return (
    <div>
      <div className="font-medium text-muted-foreground px-3 pt-2">
        Perintah allah di dalam al-Quran
      </div>

      <div className="flex font-medium items-center text-xs text-muted-foreground px-3 mt-0.5 gap-1">
        <Minus strokeWidth={1} />
        Sumber
        <a
          href="https://smamsa.sch.id/2019/07/04/100-perintah-allah-pada-manusia-yang-tercatat-di-dalam-quran/"
          className="line-clamp-1"
        >
          https://smamsa.sch.id/2019/07/04/100-perintah-allah-pada-manusia-yang-tercatat-di-dalam-quran/
        </a>
      </div>
      <div className="text-start p-3 border-y">
        {PERINTAH.map((d, index) => (
          <div
            key={index}
            onClick={() => handler(d.vk)}
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground duration-300 cursor-pointer"
          >
            <div className="flex-none w-[50px]">{d.vk}</div>
            <Minus />
            <div className="line-clamp-1">{d.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultSearch = () => {
  const fetcher = useFetcher<typeof Loader>({ key: "search-translation" });
  const navigate = useNavigate();
  const perintahKey = PERINTAH.find((d) => d.vk === fetcher.data?.query);
  return (
    <div className="divide-y">
      {fetcher.state !== "idle"
        ? (
          <div className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2  rounded-xl">
            <div className="flex justify-center">
              <Spinner size="lg" className="bg-primary" />
            </div>
          </div>
        )
        : (fetcher.data?.data?.length ?? 0) > 0
        ? (
          <div className="my-1 pb-1">
            <div className="flex items-center justify-center px-3 bg-muted text-slate-600 dark:text-slate-400  text-sm py-1 border-b">
              {fetcher.data?.data?.length} Hasil pencarian{" "}
              <strong className="ml-1">{fetcher.data?.query}</strong>
            </div>

            <div className="capitalize flex font-medium items-center text-xs text-muted-foreground px-2 mt-0.5">
              <Minus strokeWidth={1} />
              terjemahan {fetcher.data?.source}
            </div>
            {perintahKey && (
              <div className="capitalize flex font-medium items-center text-xs px-2 mt-1 gap-2">
                <MoveRight strokeWidth={1} />
                {perintahKey.t}
              </div>
            )}
          </div>
        )
        : fetcher.data?.query
        ? (
          <div className="py-6 text-center text-sm h-full border-b flex flex-col items-center justify-center text-muted-foreground">
            <p>
              Pencarian{" "}
              <strong>
                {fetcher.data?.query}
              </strong>{" "}
              tidak ditemukan
            </p>
            <p>
              di dalam terjemahan{" "}
              <strong>
                {fetcher.data?.source}
              </strong>.
            </p>
          </div>
        )
        : null}
      {(fetcher.data?.data?.length ?? 0) > 0 &&
        fetcher.data?.data?.map((item, index) => (
          <div key={index} className="p-3 last:border-b">
            <Button
              variant="secondary"
              aria-label="Menu"
              size="sm"
              title={`Buka di quran`}
              // onPress={()=>navigate(`/muslim/quran`)}
              onPress={() => {
                const page = pageAyahs.find((d) =>
                  item.i >= d.s && item.i <= d.e
                );
                if (page) {
                  const surahIndex = item.vk.split(":")[0]; // Ambil nomor Surah
                  const ayahIndex = item.vk.split(":")[1]; // Ambil nomor Surah

                  navigate(
                    `/muslim/quran/${page.p}?surah=${surahIndex}&ayah=${ayahIndex}`,
                  );
                }
                console.warn("DEBUGPRINT[11]: terjemahan.tsx:360: page=", page);
              }}
              className="h-8 gap-1 tracking-wide font-bold"
            >
              {item.vk}
              <MoveRight />
            </Button>
            <div dir="rtl" className="break-normal pr-2.5">
              <div
                className={cn(
                  "my-3 ",
                  "font-indopak text-3xl leading-12",
                )}
              >
                {item.ta}
                <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
                  ‎﴿{toArabicNumber(Number(item.vk.split(":")[1]))}﴾‏
                </span>
              </div>
            </div>

            <div
              className={cn(
                "text-slate-800 dark:text-slate-200 px-2 text-justify max-w-none  whitespace-pre-line mb-2",
              )}
            >
              {item.tt.replace(
                /(.{150,}?[\.\!\?])\s+/g,
                "$1\n\n",
              )} ({item.vk.split(":")[1]})
            </div>
          </div>
        ))}
    </div>
  );
};
