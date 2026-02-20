import {
  SETTING_PREFS_KEY,
} from "#/src/constants/key";
import { Header } from "#src/components/custom/header";
import { ScrollTopButton } from "#src/components/custom/scroll-to-top.tsx";
import { Button, buttonVariants } from "#src/components/ui/button";
import { getCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import {
  GetSurahByPage,
  getSurahByPage,
} from "#src/utils/misc.quran.ts";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import type { Loader as muslimLoader } from "./muslim.data";
import { CommandNavigation } from "./muslim.quran.navigation";
type SurahStyle = GetSurahByPage["style"];

export async function Loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ayah = url.searchParams.get("ayah");
  const surah = url.searchParams.get("surah");
  const { id } = params;

  let vk = null;
  if (ayah && surah) {
    vk = surah + ":" + ayah;
  }

  const prefs = await getCache(SETTING_PREFS_KEY);

  let style = "kemenag" as SurahStyle;

  let translation = prefs?.showTranslation
    ? prefs?.showTranslation == "on"
      ? true
      : false
    : true;
  let tafsir = prefs?.showTafsir
    ? prefs?.showTafsir == "on"
      ? true
      : false
    : false;
  let translationSource = prefs?.translationSource
    ? prefs?.translationSource
    : "kemenag";

  const response = await getSurahByPage({
    page: Number(id),
    style: style,
    translation,
    showTafsir: tafsir,
    translationSource,
  });

  return { ...response, vk, query: { surah, ayah } };
}

const AyahViewer: React.FC = () => {
  const { ayah } = useLoaderData<typeof Loader>();
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [ayah]);

  const nextAyat = () => {
    if (currentIndex < ayah.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevAyat = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentAyah = ayah[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-138px)]">
      <div
        title={currentAyah.ta}
        dir="rtl"
        className={cn(
          "font-kemenag text-3xl inline-flex items-center rounded-md mx-1 px-1 focus-visible:outline-hidden mb-10 whitespace-nowrap",
        )}
      >
        {smartSlice(currentAyah.ta, 15)}
        <span className="inline-flex font-mono mr-1.5 font-bold">
          {Number(currentAyah.vk.split(":")[1])}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 mb-10">
        <Button
          size="lg"
          onPress={prevAyat}
          isDisabled={currentIndex === 0}
        >
          <ChevronLeft />
          Prev
        </Button>

        <Button
          onPress={nextAyat}
          size="lg"
          isDisabled={currentIndex === ayah.length - 1}
        >
          Next
          <ChevronRight />
        </Button>
      </div>

      <details
        className={cn(
          "group [&_summary::-webkit-details-marker]:hidden px-4 py-2 w-full",
        )}
      >
        <summary className="flex cursor-pointer items-center gap-1.5 outline-hidden w-full justify-center">
          <div className="font-medium text-sm text-muted-foreground">
            Show full ayah
          </div>

          <svg
            className="size-4 shrink-0 transition duration-300 group-open:-rotate-180 opacity-80"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>

        <div className="font-normal text-start group-open:animate-slide-top group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300">
          <h3 className="font-medium mt-4">QS. An-Naba: {currentAyah.vk}</h3>
          <TextArab
            text={currentAyah.ta}
            ayah={Number(currentAyah.vk.split(":")[1])}
          />
          <p>{currentAyah.tt}</p>
        </div>
      </details>
    </div>
  );
};

export function Component() {
  const { page, juz, surah } = useLoaderData<typeof Loader>();

  const title = `Hal ${page.p}`;
  const subtitle = `Juz' ${juz} - ` + surah[0].name.id;
  return (
    <React.Fragment>
      <Header
        redirectTo="/muslim/quran"
        title={title}
        subtitle={subtitle}
      >
        <CommandNavigation />
      </Header>
      <AyahViewer />
      <div
        id="pagination-page"
        className="ml-auto flex items-center justify-center gap-3 pt-5"
      >
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          title="Surat sebelumnya"
          to={page?.p === 1 ? "#" : `/muslim/quran-v3/${page?.p - 1}`}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Link>

        <span className="text-accent-foreground text-sm">
          Halaman <strong>{page?.p}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          title="Surat selanjutnya"
          to={page?.p === 604 ? "#" : `/muslim/quran-v3/${page?.p + 1}`}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
      <ScrollTopButton />
    </React.Fragment>
  );
}

import TextArab from "#src/components/custom/text-arab.tsx";

function smartSlice(text: string, length: number, last?: boolean) {
  if (text.length <= length) return text;

  let firstPart = text.slice(0, length);
  let lastPart = last ? text.slice(-length) : "";

  firstPart = firstPart.replace(/\s+\S*$/, "");

  lastPart = lastPart.replace(/^\S*\s+/, "");

  // return `${firstPart}..${lastPart}`;
  return `${firstPart}..`;
}
