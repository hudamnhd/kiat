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

  return (
    <div
      dir="rtl"
      className={cn(
        "p-3 font-kemenag break-normal",
        opts?.fontStyle,
        className,
      )}
      style={{
        fontWeight: opts?.fontWeight,
        fontSize: prefsOption?.fontSize || "1.5rem",
        lineHeight: prefsOption?.lineHeight ||
          "3.5rem",
      }}
    >
      {text}

      {ayah && (
        <span className="text-right text-3xl font-uthmani-v2-reguler mr-1.5">
          ‎﴿{toArabicNumber(ayah)}﴾‏
        </span>
      )}
    </div>
  );
};

export default TextArab;
