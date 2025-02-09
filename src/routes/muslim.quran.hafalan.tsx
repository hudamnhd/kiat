import listSurahWithJuz from "#/src/constants/daftar-surah-with-juz.json";
import { SETTING_PREFS_KEY } from "#/src/constants/key";
import { FONT_SIZE } from "#/src/constants/prefs";
import { Header } from "#src/components/custom/header";
import TextArab from "#src/components/custom/text-arab.tsx";
import { Button, buttonVariants } from "#src/components/ui/button";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#src/components/ui/popover";
import { getCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import { getSurahByPage } from "#src/utils/misc.quran.ts";
import {
  BetweenHorizontalStart,
  ChevronLeft,
  ChevronRight,
  Minus,
  NotepadText,
} from "lucide-react";
import React from "react";
import { Button as ButtonRAC } from "react-aria-components";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useRouteLoaderData } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";
import { CommandNavigation } from "./muslim.quran.navigation";

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;

  const prefs = await getCache(SETTING_PREFS_KEY);

  let style = "indopak" as "indopak" | "kemenag" | "uthmani" | "imlaei";

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

  const response = await getSurahByPage({
    page: Number(id),
    style: style,
  });

  return {
    ...response,
    dataSurah: Object.values(listSurahWithJuz).flat(),
    query: { surah, ayah },
  };
}

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
  return <VirtualizedListSurah />;
}

const VirtualizedListSurah = () => {
  const {
    bismillah,
    surah,
    ayah: items,
    page,
    juz,
  } = useLoaderData<typeof Loader>();
  const surat = surah[0];

  const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
  const opts = parentLoader?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  const title = `Hal ${page.p}`;
  const subtitle = `Juz' ${juz} - ` + surat.name.id;
  const style = {
    fontWeight: opts?.fontWeight,
    fontSize: prefsOption?.fontSize || "1.5rem",
    lineHeight: prefsOption?.lineHeight || "3.5rem",
    whiteSpace: "pre-line",
  };

  const [gridMode, setGridMode] = React.useState(false);
  const isGridMode = gridMode ? "grid place-items-start" : "";
  const handleGridMode = () => {
    setGridMode(!gridMode);
  };
  return (
    <React.Fragment>
      <Header
        redirectTo="/muslim/quran"
        title={title}
        subtitle={subtitle}
      >
        <CommandNavigation />
        <Button
          title="Ubah mode inline atau block"
          size="icon"
          variant="ghost"
          onPress={handleGridMode}
        >
          {isGridMode
            ? <NotepadText />
            : <BetweenHorizontalStart />}
        </Button>
      </Header>
      <div
        className={cn(
          "border-b px-5 pt-2 pb-4 text-center",
          isGridMode,
        )}
        dir="rtl"
      >
        {items.map((dt) => {
          const surah_index = dt.vk.split(":")[0];
          const ayah_index = dt.vk.split(":")[1];
          const id = dt.vk;
          const key = Number(ayah_index);
          const should_hidden = surah_index === "1" && ayah_index === "1";

          const _surah = surah.find((d: { index: number }) =>
            d.index === Number(surah_index)
          );

          const surah_name = _surah?.name.id || surah[0].name.id;
          return (
            <React.Fragment key={id}>
              {key === 1 && (
                <React.Fragment>
                  {surah_index !== "9" && (
                    <TextArab
                      text={opts?.fontStyle === "font-indopak"
                        ? bismillah.slice(0, 40)
                        : bismillah}
                      className="text-center w-full bg-muted/30 border rounded-md p-1 m-1"
                    />
                  )}
                  <div
                    dir="ltr"
                    className="flex items-center gap-1 text-end text-muted-foreground text-xs font-medium"
                  >
                    <Minus />
                    {surah_index}.
                    {surah_name}
                  </div>
                </React.Fragment>
              )}

              <PopoverTrigger>
                {!should_hidden &&
                  (
                    <React.Fragment
                      key={dt.vk}
                    >
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
                          ‎﴿{toArabicNumber(Number(dt.vk.split(":")[1]))}﴾‏
                        </span>
                      </ButtonRAC>

                      <Popover
                        placement="top"
                        className="w-fit inset-x-0 mx-2 sm:mx-auto max-w-2xl"
                      >
                        <PopoverDialog className="bg-muted/50 text-foreground ring-1 ring-border p-0 shadow-md">
                          <TextArab
                            text={dt.ta}
                            ayah={Number(dt.vk.split(":")[1])}
                          />
                        </PopoverDialog>
                      </Popover>
                    </React.Fragment>
                  )}
              </PopoverTrigger>
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
            : `/muslim/quran-hafalan/${page?.p - 1}`}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Link>

        <span className="text-accent-foreground text-sm">
          Hal <strong>{page?.p}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(
            buttonVariants({ size: "icon", variant: "outline" }),
          )}
          title="Surat selanjutnya"
          to={page?.p === 604
            ? "#"
            : `/muslim/quran-hafalan/${page?.p + 1}`}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
    </React.Fragment>
  );
};

function smartSlice(text: string, length: number, last?: boolean) {
  if (text.length <= length * 2) return text;

  let firstPart = text.slice(0, length);
  let lastPart = last ? text.slice(-length) : "";

  firstPart = firstPart.replace(/\s+\S*$/, "");

  lastPart = lastPart.replace(/^\S*\s+/, "");

  return `${firstPart}...${lastPart}`;
}
