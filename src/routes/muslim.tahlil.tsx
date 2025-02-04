import { Header } from "#src/components/custom/header";
import { FONT_SIZE } from "#src/constants/prefs";
import { data } from "#src/constants/tahlil.json";
import { cn } from "#src/utils/misc";
import { useRouteLoaderData } from "react-router";

export function Component() {
  const loaderRoot = useRouteLoaderData("muslim");
  const opts = loaderRoot?.opts || {};
  const tahlil = data;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  return (
    <>
      <Header redirectTo="/muslim" title="Tahlil" />
      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        Tahlil
      </div>

      {tahlil.map((ayat, index) => {
        const arabicContent = ayat?.arabic;
        const translateContent = ayat?.translation;
        return (
          <div key={index} className="group relative p-4 border-t">
            <div>
              <div className="font-semibold text-lg leading-6">
                {ayat.title}
              </div>
            </div>
            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
              <div
                className={cn(
                  "relative text-right my-5 font-lpmq",
                  opts?.fontStyle,
                )}
                style={{
                  fontWeight: opts.fontWeight,
                  fontSize: prefsOption?.fontSize || "1.5rem",
                  lineHeight: prefsOption?.lineHeight || "3.5rem",
                }}
              >
                {arabicContent}
              </div>
            </div>
            {opts?.showTranslation === "on" && (
              <div className="translation-text pt-2 prose dark:prose-invert max-w-none whitespace-pre-wrap leading-6 border-t">
                {translateContent.replace(
                  /(.{150,}?[\.\!\?])\s+/g,
                  "$1\n\n",
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
