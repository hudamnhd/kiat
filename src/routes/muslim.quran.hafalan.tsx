import { SETTING_PREFS_KEY } from "#/src/constants/key";
import { FONT_SIZE } from "#/src/constants/prefs";
import { Header } from "#src/components/custom/header";
import { ScrollToFirstIndex } from "#src/components/custom/scroll-to-top.tsx";
import TextArab from "#src/components/custom/text-arab.tsx";
import { buttonVariants } from "#src/components/ui/button";
import { getCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { getSurahByJuz, toArabicNumber } from "#src/utils/misc.quran.ts";
import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button as ButtonRAC } from "react-aria-components";
import type { LoaderFunctionArgs } from "react-router";
import {
  Link,
  useLoaderData,
  useNavigate,
  useRouteLoaderData,
} from "react-router";

import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#src/components/ui/popover";
import type { Loader as muslimLoader } from "./muslim.data";

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;

  const prefs = await getCache(SETTING_PREFS_KEY);

  let style = "indopak" as "indopak" | "kemenag" | "uthmani" | "imlaei";

  let translation = prefs?.showTranslation
    ? prefs?.showTranslation == "on" ? true : false
    : true;
  let tafsir = prefs?.showTafsir
    ? prefs?.showTafsir == "on" ? true : false
    : false;
  let translationSource = prefs?.translationSource
    ? prefs?.translationSource
    : "kemenag";

  switch (prefs?.fontStyle) {
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
  const response = await getSurahByJuz({
    juz: Number(id),
    style: style,
    translation,
    showTafsir: tafsir,
    translationSource,
  });
  return { ...response, query: { surah, ayah } };
}

import { useVirtualizer } from "@tanstack/react-virtual";
export function Component() {
  const { juz } = useLoaderData<typeof Loader>();

  return (
    <React.Fragment>
      <VirtualizedAyahByJuz>
        <div className="ml-auto flex items-center justify-center gap-3 py-5 border-t">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
            )}
            title="Juz' sebelumnya"
            to={juz === 1
              ? "#"
              : `/muslim/quran-hafalan/${juz - 1}`}
          >
            <span className="sr-only">Go to previous juz'</span>
            <ChevronLeft />
          </Link>

          <span className="text-accent-foreground text-sm">
            Juz <strong>{juz}</strong> dari <strong>30</strong>
          </span>
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
            )}
            title="Juz' selanjutnya"
            to={juz === 30
              ? "#"
              : `/muslim/quran-hafalan/${juz + 1}`}
          >
            <span className="sr-only">Go to next juz'</span>
            <ChevronRight />
          </Link>
        </div>
      </VirtualizedAyahByJuz>
    </React.Fragment>
  );
}

const JUZ = Array.from({ length: 30 }).map(
  (_, i, a) => {
    return {
      i: a.length - i,
      t: `Juz ${a.length - i}`,
    };
  },
).reverse();

const VirtualizedAyahByJuz = ({ children }: { children: React.ReactNode }) => {
  const { page, juz } = useLoaderData<typeof Loader>();

  const startPage = Object.keys(page)[0];
  const endPage = Object.keys(page)[Object.keys(page).length - 1];
  const parentRef = React.useRef<HTMLDivElement>(null);

  const items = Object.values(page);
  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 500, // Perkiraan tinggi item (70px)
  });

  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  const _lineHeight = prefsOption?.lineHeight;
  const _replacelineHeight = _lineHeight?.replace("rem", "");
  const _parselineHeight = Number(_replacelineHeight);
  const isKemenag = opts?.fontStyle === "font-kemenag";
  const lineHeight = isKemenag
    ? _lineHeight
    : (_parselineHeight - (_parselineHeight * 0.3)).toFixed(1) + "rem";

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

  const scrollToAyat = React.useCallback((index: number) => {
    rowVirtualizer.scrollToIndex(index, {
      align: "start",
    });
  }, [juz]);

  const scrollToFirstAyat = React.useCallback(() => {
    rowVirtualizer.scrollToIndex(0, {
      align: "start",
    });
  }, []);

  const style = {
    fontWeight: opts?.fontWeight,
    fontSize: prefsOption?.fontSize || "1.5rem",
    lineHeight: prefsOption?.lineHeight || "3.5rem",
    whiteSpace: "pre-line",
  };
  return (
    <React.Fragment>
      <motion.div
        className="z-20 bg-primary max-w-3xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          originX: 0,
        }}
      />

      <div
        ref={parentRef}
        id="container-page"
        className="h-screen"
        style={{
          overflowAnchor: "none",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const d = items[virtualRow.index];
            const index = virtualRow.index;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start + 0}px)`, // Tambahkan offset untuk children
                }}
              >
                <React.Fragment
                  key={index}
                >
                  {index === 0 && (
                    <React.Fragment>
                      <MemoHeader
                        scrollToAyat={scrollToAyat}
                        juz={juz}
                        startPage={startPage}
                        endPage={endPage}
                      />
                    </React.Fragment>
                  )}
                  <div
                    dir="ltr"
                    className={cn(
                      "bg-muted/50 grid grid-cols-5 p-2.5 text-xs sm:text-sm w-full text-muted-foreground font-medium",
                      index === 0 ? "border-b" : "border-y ",
                    )}
                  >
                    <div className="text-start col-span-2">{d.surah[0]}</div>
                    <div className="font-semibold text-center">
                      <span>Hal</span> {d.page.p}
                    </div>
                    <div className="text-right col-span-2">Juz' {juz}</div>
                  </div>
                  <div
                    className={cn(
                      "px-4 text-center sm:text-justify pb-2 pt-3",
                      opts?.fontStyle === "font-kemenag" && "px-4 sm:px-6",
                    )}
                    dir="rtl"
                  >
                    {d.ayah.map((dt) => {
                      const surah_index = dt.vk.split(":")[0];
                      const ayah_index = dt.vk.split(":")[1];
                      const id = dt.vk;
                      const key = Number(ayah_index);
                      const should_hidden = surah_index === "1" &&
                        ayah_index === "1";
                      return (
                        <React.Fragment key={id}>
                          {d.bismillah && key === 1 && (
                            <React.Fragment>
                              {surah_index !== "9" && (
                                <div
                                  dir="rtl"
                                  className="break-normal w-full bg-muted/50 border rounded-md mb-2"
                                >
                                  <div
                                    className={cn(
                                      "font-bismillah text-center",
                                      opts?.fontStyle,
                                    )}
                                    style={{
                                      fontWeight: opts?.fontWeight,
                                      fontSize: prefsOption?.fontSize ||
                                        "1.5rem",
                                      lineHeight: lineHeight || "3.5rem",
                                    }}
                                  >
                                    {opts?.fontStyle === "font-indopak"
                                      ? d.bismillah.slice(0, 40)
                                      : d.bismillah}
                                  </div>
                                </div>
                              )}
                            </React.Fragment>
                          )}
                          {!should_hidden &&
                            (
                              <React.Fragment
                                key={dt.vk}
                              >
                                <PopoverTrigger>
                                  <ButtonRAC
                                    style={style}
                                    className={cn(
                                      "inline-flex inline hover:bg-muted antialiased rounded-md mx-1 px-1 focus-visible:outline-hidden my-1 ring-1 ring-border",
                                      opts?.fontStyle,
                                    )}
                                  >
                                    {smartSlice(dt.ta, 10)}

                                    <span
                                      className="inline-flex text-right font-uthmani-v2-reguler mr-1.5"
                                      style={style}
                                    >
                                      ‎﴿{toArabicNumber(
                                        Number(dt.vk.split(":")[1]),
                                      )}﴾‏
                                    </span>
                                  </ButtonRAC>

                                  <Popover
                                    placement="top"
                                    className="w-fit inset-x-0 mx-2 sm:mx-auto max-w-3xl"
                                  >
                                    <PopoverDialog className="bg-muted/50 text-foreground ring-1 ring-border p-0 shadow-md">
                                      <TextArab
                                        text={dt.ta}
                                        ayah={Number(dt.vk.split(":")[1])}
                                      />
                                    </PopoverDialog>
                                  </Popover>
                                </PopoverTrigger>
                              </React.Fragment>
                            )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </React.Fragment>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${
                lastItemBottom + (children ? 55 : 0)
              }px)`, // Tambahkan offset untuk children
              paddingBottom: "0px",
            }}
          >
            {children}
          </div>
        </div>
      </div>
      <ScrollToFirstIndex handler={scrollToFirstAyat} container={parentRef} />
    </React.Fragment>
  );
};

const MemoHeader = React.memo(
  ({
    juz,
    startPage,
    endPage,
    scrollToAyat,
  }: {
    scrollToAyat: (index: number) => void;
    juz: number;
    startPage: string;
    endPage: string;
  }) => {
    const navigate = useNavigate();
    const fullPath = window.location.pathname;
    const basePath = fullPath.split("/").slice(0, -1).join("/") + "/";

    const handleSelectChange = (e: { target: { value: string } }) => {
      const redirectTo = basePath + e.target.value;
      navigate(redirectTo);
    };
    const handleSelectPageChange = (e: { target: { value: string } }) => {
      const index = Number(e.target.value);
      scrollToAyat(index);
    };
    return (
      <Header
        redirectTo="/muslim/quran"
        title={`Juz' ${juz}`}
        subtitle={`Hal ${startPage}-${endPage}`}
      >
        <React.Fragment>
          <div className="grid ">
            <select
              name="page"
              defaultValue={Number(startPage) - 1}
              onChange={handleSelectPageChange}
              aria-label="Select Juz"
              id="juz-select"
              className="col-start-1 row-start-1 appearance-none text-sm py-2 px-3 w-16 sm:w-20"
            >
              {[...Array(Number(endPage) - Number(startPage) + 1)].map((
                _,
                i,
              ) => (
                <option key={i} value={i}>
                  Hal {Number(startPage) + i}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none relative right-1 z-10 col-start-1 row-start-1 h-4 w-4 self-center justify-self-end forced-colors:hidden"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              >
              </path>
            </svg>
          </div>
          <div className="grid ">
            <select
              name="juz"
              value={juz}
              onChange={handleSelectChange}
              aria-label="Select Juz"
              id="juz-select"
              className="col-start-1 row-start-1 appearance-none text-sm py-2 px-3 w-16 sm:w-20"
            >
              {JUZ.map((d) => <option key={d.i} value={d.i}>{d.t}</option>)}
            </select>
            <svg
              className="pointer-events-none relative right-1 z-10 col-start-1 row-start-1 h-4 w-4 self-center justify-self-end forced-colors:hidden"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              >
              </path>
            </svg>
          </div>
        </React.Fragment>
      </Header>
    );
  },
  (prevProps, nextProps) => prevProps.juz === nextProps.juz,
);

function smartSlice(text: string, length: number, last?: boolean) {
  if (text.length <= length * 2) return text;

  let firstPart = text.slice(0, length);
  let lastPart = last ? text.slice(-length) : "";

  firstPart = firstPart.replace(/\s+\S*$/, "");

  lastPart = lastPart.replace(/^\S*\s+/, "");

  return `${firstPart}...${lastPart}`;
}
