import listSurahWithJuz from "#/src/constants/list-surah.json";
import { LayoutMain } from "#src/components/custom/layout.tsx";
import { Button } from "#src/components/ui/button";
import { Spinner } from "#src/components/ui/spinner";
import {
  INDEXAYAHBYSURAH,
  juzPages,
  pageAyahs,
} from "#src/constants/quran-metadata";
import { cn } from "#src/utils/misc";
import { hasMatch } from "fzy.js";
import lodash from "lodash";
import { Search as SearchIcon } from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useFetcher, useNavigation } from "react-router";

const TAGS = Array.from({ length: 604 }).map(
  (_, i, a) => {
    return {
      i: a.length - i,
      p: a.length - i,
      t: `Page ${a.length - i}`,
      m: "page",
    };
  },
);

export async function Loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const juz = juzPages.map((d, i) => {
    return {
      i: i + 1,
      t: `Juz' ${i + 1}`,
      p: d.s,
      m: "juz",
    };
  });

  const surah = listSurahWithJuz.map((d) => {
    return {
      i: d.index,
      t: d.name.id,
      p: d.meta.page.start,
      v: d.meta.number_of_verses,
      m: "surah",
    };
  });
  // 🔥 Buat indeks FlexSearch untuk `vk` & `tr`
  let merged = [...surah, ...juz, ...TAGS];

  function searchQuran(query: string) {
    // Jika query adalah angka:angka (misal 114:3)
    const pattern = /^(\d+):(\d+)$/;
    const match = query.match(pattern);

    if (match) {
      const surahNum = Number(match[1]); // Ambil angka sebelum ":"
      const ayahNum = Number(match[2]); // Ambil angka setelah ":"

      const prevSurah = INDEXAYAHBYSURAH[surahNum - 1];

      const prevSurahIdx = ayahNum + Number(prevSurah) || 0; // Ambil angka sebelum ":"
      return surah.filter(
        (d) => d.i === surahNum && ayahNum <= Number(d.v), // Bandingkan dengan format "114:3"
      ).map((d) => {
        const page = pageAyahs.find((d) =>
          prevSurahIdx >= d.s && prevSurahIdx <= d.e
        );
        if (page) {
          return {
            ...d,
            t: `${d.t}, Ayat ${ayahNum}`,
            v: ayahNum.toString(),
            m: "ayat",
            p: page.p,
          };
        }
      }).slice(0, 5);
    }

    // Jika query adalah angka saja, cari berdasarkan indeks `i`
    if (!isNaN(Number(query))) {
      const numQuery = Number(query);
      return merged.filter(
        (item) => item.i === numQuery,
      ).slice(0, 5);
    }

    // Jika query adalah teks biasa, gunakan fuzzy search
    return [...merged].filter((s) => hasMatch(query, s.t)).slice(0, 5);
  }

  return { query, data: searchQuran(query) };
}

import { useId } from "react";

export function Component() {
  return (
    <LayoutMain>
      <CommandNavigation />
    </LayoutMain>
  );
}

const FzyTest = () => {
  const fetcher = useFetcher<typeof Loader>({ key: "search-translation" });

  const [input, setInput] = React.useState("");
  const sourceValueRef = React.useRef<HTMLSelectElement | null>(null);
  const loadingIconRef = React.useRef<SVGSVGElement | null>(null);
  const searchIconRef = React.useRef<SVGSVGElement | null>(null);

  const handleSearch = React.useMemo(
    () =>
      lodash.debounce((value: string) => {
        const loadingSpinnerSearch = document.getElementById(
          "loading-spinner-search",
        );
        if (loadingSpinnerSearch instanceof HTMLDivElement) {
          loadingSpinnerSearch.style.display = "none";
        }
        if (loadingIconRef.current && searchIconRef.current) {
          loadingIconRef.current.style.display = "none";
          searchIconRef.current.style.display = "block";
        }

        const source = sourceValueRef.current?.value || "kemenag";

        fetcher.submit(
          { query: value, source },
          { method: "get", action: "/muslim/quran/navigation" },
        );
      }, 500),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const loadingSpinnerSearch = document.getElementById(
      "loading-spinner-search",
    );
    if (loadingSpinnerSearch instanceof HTMLDivElement) {
      loadingSpinnerSearch.style.display = "flex";
    }

    if (loadingIconRef.current && searchIconRef.current) {
      loadingIconRef.current.style.display = "block";
      searchIconRef.current.style.display = "none";
    }
    setInput(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <React.Fragment>
      <div className="relative">
        {/* Heroicon name: solid/search */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          ref={searchIconRef}
          id="search-icon"
          className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <svg
          id="loading-icon"
          ref={loadingIconRef}
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden pointer-events-none animate-spin absolute top-3.5 left-4 h-5 w-5 text-muted-foreground"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z"
            fill="currentColor"
          />
        </svg>
        <input
          className="h-12 w-full bg-transparent pl-11 pr-4 text-sm placeholder-muted-foreground focus:ring-0 outline-none border-b"
          role="combobox"
          aria-expanded="false"
          aria-controls="options"
          placeholder="Apa yang ingin kamu baca ?"
          type="search"
          value={input}
          autoFocus={true}
          onChange={handleInputChange}
        />
      </div>
    </React.Fragment>
  );
};

const SUGGESTION = [
  {
    "i": 30,
    "t": "Juz' 30",
    "p": 582,
    "m": "juz",
  },
  {
    "i": 2,
    "t": "Ayat kursi",
    "p": 42,
    "v": "255",
    "m": "ayat",
  },
  {
    "i": 67,
    "t": "Al-Mulk",
    "p": 562,
    "v": "30",
    "m": "surah",
  },
  {
    "i": 56,
    "t": "Al-Waqi'ah",
    "p": 534,
    "v": "96",
    "m": "surah",
  },
  {
    "i": 87,
    "t": "Al-A'la",
    "p": 591,
    "v": "19",
    "m": "surah",
  },
  {
    "i": 18,
    "t": "Al-Kahf",
    "p": 293,
    "v": "110",
    "m": "surah",
  },
];

type Item = {
  i: number;
  t: string;
  p: number;
  m: string;
  v?: string;
};

const ResultSearch = () => {
  const fetcher = useFetcher({ key: "search-translation" });
  return (
    <div className="h-[200px] scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-2 relative">
      <div
        id="loading-spinner-search"
        className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2  rounded-xl"
        style={{ display: "none" }}
      >
        <div className="flex justify-center">
          <Spinner size="lg" className="bg-primary" />
        </div>
      </div>

      {fetcher.data?.data?.length > 0
        ? (
          <div>
            <h2 className="text-xs font-semibold mb-1 px-2">
              Pencarian "{fetcher.data?.query}"
            </h2>
            <ul className="text-sm text-foreground">
              {fetcher.data?.data?.length > 0 &&
                fetcher.data?.data?.map((item: Item, index: number) => {
                  return <ListItem key={index} {...item} />;
                })}
            </ul>
          </div>
        )
        : fetcher.data?.query
        ? (
          <React.Fragment>
            <div className="py-14 px-6 text-center text-sm sm:px-14">
              <svg
                className="mx-auto h-6 w-6 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-2 font-semibold text-gray-900">
                Tidak ada hasil
              </p>
              <p className="mt-2 text-gray-500">
                Coba ketik nomor surah 1-114, nomor juz 1-30, halaman 1-604 atau
                nomor surah dan ayat misal 2:285.
              </p>
            </div>
          </React.Fragment>
        )
        : (
          <div>
            <h2 className="text-xs font-semibold mb-1 px-2">Disarankan</h2>
            <ul className="text-sm text-foreground">
              {SUGGESTION.map((item: Item, index: number) => {
                return <ListItem key={index} {...item} />;
              })}
            </ul>
          </div>
        )}
    </div>
  );
};

function ListItem(props: Item) {
  const fullPath = window.location.pathname;
  const basePath = fullPath.split("/").slice(0, -1).join("/") + "/";

  const item = props;
  const mode = item.m;
  const isAyah = mode === "ayat";
  const isSurah = mode === "surah";
  const to = isAyah
    ? `${basePath}${item.p}?surah=${item.i}&ayah=${item.v}`
    : isSurah
    ? `${basePath}${item.p}?surah=${item.i}&ayah=1`
    : `${basePath}${item.p}`;
  return (
    <Link
      key={to}
      to={to}
      className="group"
    >
      <li
        className="group-hover:bg-accent opacity-70  group-hover:opacity-100 font-medium group flex cursor-default select-none items-center px-2 sm:px-3 py-2 rounded-md"
        id="option-1"
        role="option"
        tabIndex={-1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:opacity-100 opacity-70"
        >
          <path d="M18 8L22 12L18 16" />
          <path d="M2 12H22" />
        </svg>
        <span className="ml-3 flex-auto truncate">
          {item.t}
        </span>
      </li>
    </Link>
  );
}

import {
  Dialog,
  Modal,
  ModalContext,
  ModalOverlay,
} from "react-aria-components";

interface KeyboardModalTriggerProps {
  keyboardShortcut: string;
  children: React.ReactNode;
}

function KeyboardModalTrigger(props: KeyboardModalTriggerProps) {
  let [isOpen, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [props.keyboardShortcut]);

  return (
    <ModalContext.Provider value={{ isOpen, onOpenChange: setOpen }}>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "data-[focus-visible]:ring-0 sm:border relative w-full justify-start rounded-md font-normal text-muted-foreground shadow-none sm:pr-12 w-8 h-8 px-2 sm:w-36 sm:text-sm text-base",
        )}
        onPress={() => setOpen(true)}
        {...props}
      >
        <SearchIcon className="inline-flex sm:hidden text-foreground" />
        <span className="hidden sm:inline-flex">Cari...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.40rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-sm">⌘</span>K
        </kbd>
      </Button>
      {props.children}
    </ModalContext.Provider>
  );
}

export function CommandNavigation() {
  return (
    <KeyboardModalTrigger keyboardShortcut="/">
      <ModalOverlay
        isDismissable
        className={cn(
          "fixed inset-0 z-50 bg-black/80",
          "data-exiting:duration-300 data-exiting:animate-out data-exiting:fade-out-0",
          "data-entering:animate-in data-entering:fade-in-0",
        )}
      >
        <Modal
          className={cn(
            "fixed sm:left-[50%] sm:top-[50%] z-50 w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] border-b sm:border-none bg-background sm:rounded-md inset-x-0 top-0 shadow-xl bg-background",
            "data-exiting:duration-300 data-exiting:animate-out data-exiting:fade-out-0",
            "data-entering:animate-in data-entering:fade-in-0",
          )}
        >
          <Dialog
            aria-label="Command Menu"
            role="alertdialog"
            className="outline-hidden relative"
          >
            {({ close }) => (
              <>
                <div className="flex flex-col justify-between mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden sm:rounded-lg bg-background transition-all">
                  <FzyTest />

                  <ResultSearch />
                  <div className="flex flex-row flex-wrap sm:items-center bg-primary/10 py-2.5 px-2 sm:px-3 text-xs sticky bottom-0 border-t">
                    <span className="">Ketik{" "}</span>
                    <span className="block">
                      <span className="font-bold mx-1">
                        2:255
                      </span>
                      <span className="">untuk menujuk ayat,</span>
                      {" "}
                    </span>
                    <span className="">
                      <span className="font-bold mx-1">
                        1 - 604
                      </span>
                      menuju surah, juz atau halaman.
                    </span>
                  </div>
                </div>
                <CloseModal close={close} />
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </KeyboardModalTrigger>
  );
}

function CloseModal({ close }: { close: () => void }) {
  const navigation = useNavigation();
  const isNavigation = navigation.state !== "idle";
  React.useEffect(() => {
    if (isNavigation) {
      close();
    }
  }, [isNavigation]);

  return null;
}
