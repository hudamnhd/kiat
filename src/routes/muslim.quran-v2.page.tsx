import { FONT_SIZE } from "#/src/constants/prefs";
import { Header } from "#src/components/custom/header";
import { buttonVariants } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Link, useLoaderData, useRouteLoaderData } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";

import { Loader } from "./muslim.quran.page";
export { Loader } from "./muslim.quran.page";

// Fungsi untuk mengonversi angka ke format Arab
const toArabicNumber = (number: number) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};

export function Component() {
  const { juz, surah, ayah: items, page, bismillah } = useLoaderData<
    typeof Loader
  >();
  const surat = surah[0];

  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  const title = `Hal ${page.p}`;

  return (
    <React.Fragment>
      <Header redirectTo="/muslim/quran" title={title} />

      <div className="flex items-center justify-between px-3 bg-muted text-muted-foreground font-semibold text-sm py-1 border-b">
        <span className="w-1/3">{surat.name.id}</span>
        <div className="w-1/3 text-center flex items-center justify-center gap-x-3">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "secondary" }),
              "[&_svg]:size-5",
            )}
            title="Surat sebelumnya"
            to={page?.p === 1
              ? "#"
              : `/muslim/quran-v2/${page?.p - 1}`}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className="text-foreground text-sm">
            {page?.p}
          </span>
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "secondary" }),
              "[&_svg]:size-5",
            )}
            title="Surat selanjutnya"
            to={page?.p === 604
              ? "#"
              : `/muslim/quran-v2/${page?.p + 1}`}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
        <span className="w-1/3 text-right">Juz' {juz}</span>
      </div>
      <div
        className="rtl:text-justify border-b px-6 pt-1 pb-4"
        dir="rtl"
      >
        {items.map((dt) => {
          const surah_index = dt.vk.split(":")[0];
          const ayah_index = dt.vk.split(":")[1];
          const id = dt.vk;
          const key = Number(ayah_index);
          const should_hidden = surah_index === "1" && ayah_index === "1";
          return (
            <React.Fragment key={id}>
              {key === 1 && (
                <React.Fragment>
                  {surah_index !== "9" && (
                    <div
                      dir="rtl"
                      className="break-normal w-full bg-muted/50 border rounded-md my-1"
                    >
                      <div
                        className={cn(
                          "font-bismillah text-center",
                          opts?.fontStyle,
                        )}
                        style={{
                          fontWeight: opts?.fontWeight,
                          fontSize: prefsOption?.fontSize || "1.5rem",
                          lineHeight: prefsOption?.lineHeight ||
                            "3.5rem",
                        }}
                      >
                        {bismillah}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}
              {!should_hidden &&
                (
                  <div
                    key={dt.vk}
                    style={{
                      fontWeight: opts?.fontWeight,
                      fontSize: prefsOption?.fontSize || "1.5rem",
                      lineHeight: prefsOption?.lineHeight || "3.5rem",
                      whiteSpace: "pre-wrap",
                    }}
                    className={cn(
                      "inline-flex inline hover:bg-muted antialiased",
                      opts?.fontStyle,
                    )}
                  >
                    {dt.ta}
                    <div className="inline-flex text-right text-3xl font-uthmani-v2-reguler mr-1.5">
                      ‎﴿{toArabicNumber(Number(dt.vk.split(":")[1]))}﴾‏
                    </div>
                    {" "}
                  </div>
                )}
            </React.Fragment>
          );
        })}
      </div>
    </React.Fragment>
  );
}
