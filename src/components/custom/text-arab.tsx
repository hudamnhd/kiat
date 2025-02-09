import { FONT_SIZE } from "#/src/constants/prefs";
import type { Loader } from "#src/routes/muslim.data";
import { cn } from "#src/utils/misc";
import { toArabicNumber } from "#src/utils/misc.quran.ts";
import { useRouteLoaderData } from "react-router";

const TextArab = (
  { text, ayah, className }: {
    text: string;
    ayah?: number;
    className?: string;
  },
) => {
  const loaderRoot = useRouteLoaderData<typeof Loader>("muslim");
  const opts = loaderRoot?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);
  const _lineHeight = prefsOption?.lineHeight;
  const _replacelineHeight = _lineHeight?.replace("rem", "");
  const _parselineHeight = Number(_replacelineHeight);
  const isKemenag = opts?.fontStyle === "font-kemenag";
  const lineHeight = isKemenag
    ? _lineHeight
    : (_parselineHeight - (_parselineHeight * 0.3)).toFixed(1) + "rem";

  return (
    <div
      dir="rtl"
      className={cn(
        "p-3",
        opts?.fontStyle,
        className,
      )}
      style={{
        fontWeight: opts?.fontWeight,
        fontSize: prefsOption?.fontSize || "1.5rem",
        lineHeight: lineHeight || "3.5rem",
      }}
    >
      {text}

      {ayah && <TextAyah ayah={ayah} />}
    </div>
  );
};

export const TextAyah = (
  { ayah }: {
    ayah: number;
    className?: string;
  },
) => {
  const loaderRoot = useRouteLoaderData<typeof Loader>("muslim");
  const opts = loaderRoot?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);
  const isIndopak = opts?.fontStyle === "font-indopak";
  const isKemenag = opts?.fontStyle === "font-kemenag";

  return !isIndopak && (
    <span
      style={{
        lineHeight: prefsOption?.lineHeight || "3.5rem",
      }}
      className={cn(
        "mx-1 text-right font-normal mr-1.5 text-3xl",
        opts?.fontStyle,
        "font-uthmani-hafs",
      )}
    >
      {toArabicNumber(ayah)}
    </span>
  );
};

export default TextArab;
