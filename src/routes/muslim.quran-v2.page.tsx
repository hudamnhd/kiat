import { FONT_SIZE } from "#/src/constants/prefs";
import { Header } from "#src/components/custom/header";
import TextArab from "#src/components/custom/text-arab";
import { buttonVariants } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Link, useLoaderData, useRouteLoaderData } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";
import { CommandNavigation } from "./muslim.quran.navigation";
import { Loader } from "./muslim.quran.page";
export { Loader } from "./muslim.quran.page";

const handleScrollUp = () => {
  window?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
};
export function Component() {
  const { juz, surah, ayah: items, page, bismillah } = useLoaderData<
    typeof Loader
  >();
  const surat = surah[0];

  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  const title = `Hal ${page.p} - Juz' ${juz}`;
  const subtitle = surat.name.id;

  React.useEffect(() => {
    handleScrollUp();
  }, [page.p]);

  const _lineHeight = prefsOption?.lineHeight;
  const _replacelineHeight = _lineHeight?.replace("rem", "");
  const _parselineHeight = Number(_replacelineHeight);
  const isKemenag = opts?.fontStyle === "font-kemenag";
  const lineHeight = isKemenag
    ? _lineHeight
    : (_parselineHeight - (_parselineHeight * 0.3)).toFixed(1) + "rem";

  return (
    <React.Fragment>
      <Header redirectTo="/muslim/quran" title={title} subtitle={subtitle}>
        <CommandNavigation />
      </Header>

      <div
        className={cn(
          "border-b px-4 pt-1 pb-4 text-center",
          opts?.fontStyle === "font-kemenag" && "px-6",
        )}
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
                          lineHeight: lineHeight || "3.5rem",
                        }}
                      >
                        {opts?.fontStyle === "font-indopak"
                          ? bismillah.slice(0, 40)
                          : bismillah}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}
              {!should_hidden &&
                (
                  <TextArab
                    text={dt.ta}
                    className="whiteSpace-pre-line p-0 px-2 inline h-fit"
                    ayah={Number(ayah_index)}
                  />
                )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="ml-auto flex items-center justify-center gap-3 py-3">
        <Link
          className={cn(
            buttonVariants({ size: "icon", variant: "outline" }),
          )}
          title="Surat sebelumnya"
          to={page?.p === 1
            ? "#"
            : `/muslim/quran-v2/${page?.p - 1}`}
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
          to={page?.p === 604
            ? "#"
            : `/muslim/quran-v2/${page?.p + 1}`}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
    </React.Fragment>
  );
}
