import { Header } from "#src/components/custom/header";
import { ScrollTopButton } from "#src/components/custom/scroll-to-top.tsx";
import TextArab from "#src/components/custom/text-arab.tsx";
import { buttonVariants } from "#src/components/ui/button";
import { data } from "#src/constants/dzikr.ts";
import { FONT_SIZE } from "#src/constants/prefs";
import { cn } from "#src/utils/misc";
import { Minus, Moon, Plus, Sun } from "lucide-react";
import React from "react";
import { useRouteLoaderData } from "react-router";

function getWaktuSekarang(): string {
  const currentHour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)

  if (currentHour >= 3 && currentHour < 15) {
    return "pagi"; // Jam 3 pagi hingga jam 3 sore
  } else {
    return "petang"; // Jam 3 sore hingga jam 3 pagi
  }
}

const time = getWaktuSekarang();

function removeHtmlTagsExceptNewline(input: string): string {
  return input
    .replace(/<(?!\/?br\s*\/?)[^>]+>/g, "") // Hapus semua tag HTML kecuali <br>
    .replace(/@/g, "\n\n"); // Ganti '@' dengan newline
}

export function Component() {
  const { dzikr } = data;
  const loaderRoot = useRouteLoaderData("muslim");
  const opts = loaderRoot?.opts || {};

  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  React.useEffect(() => {
    const buttons = document.querySelectorAll(".tasbih-counter-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const counterDisplay = event.target
          ?.closest(".tasbih-counter-container")
          .querySelector(".counter-display");
        const currentValue = parseInt(counterDisplay.textContent || "0", 10);
        counterDisplay.textContent = (currentValue + 1).toString(); // Increment counter
      });
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", () => {});
      });
    };
  }, []);

  return (
    <>
      <Header redirectTo="/" title={`Dzikir ${time}`} />
      <div className="flex items-center gap-x-3 justify-center text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        <span>Dzikir {time}</span>
      </div>

      <div>
        {dzikr
          .filter((d) => d.time === "" || d.time === time)
          .map((ayat, index) => {
            const fontWeight = opts.fontWeight;
            const fontSize = prefsOption?.fontSize || "1.5rem";
            const lineHeight = prefsOption?.lineHeight || "3.5rem";
            const content =
              `<div style="font-weight:  ${fontWeight}; font-size: ${fontSize}; line-height:  ${lineHeight};" class="${opts?.fontStyle}">`;
            const arabicContent = removeHtmlTagsExceptNewline(ayat.arabic);

            const translateContent = ayat?.translated_id
              .replace(/@/g, "<br/><br/>")
              .replace(/(\.)(\s|$)/g, "$1<br />");
            return (
              <div
                key={index}
                className="group tasbih-counter-container relative p-4 sm:p-5 border-t"
              >
                <div>
                  <div className="space-y-0.5 mb-1">
                    <div className="font-medium leading-none">
                      {ayat.title}
                    </div>
                    <div className="flex items-center gap-x-1 text-muted-foreground">
                      {ayat?.note && (
                        <span className="">
                          {ayat.note.replace(/@/, "")}
                        </span>
                      )}

                      {ayat.time !== "" && "Setiap "}
                      {ayat.time === time &&
                        (
                          <span className="flex items-center gap-x-1.5 text-sm">
                            <span className="italic">{time}</span>
                            <Sun className="w-4 h-4 rotate-0 transition-all" />
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                <TextArab
                  text={arabicContent}
                  className="whitespace-pre-line"
                />

                <div className="flex items-center justify-end gap-4 mt-2">
                  <span className="counter-display text-2xl font-bold">
                    0
                  </span>
                  <button
                    className={cn(
                      buttonVariants({ size: "icon", variant: "outline" }),
                      "tasbih-counter-btn",
                    )}
                  >
                    <Plus />
                  </button>
                </div>
                {opts?.showTranslation === "on" && (
                  <div className="">
                    <div className="translation-text">
                      <div
                        className="max-w-none prose dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: translateContent,
                        }}
                      />
                    </div>

                    <div className="font-normal text-start bg-muted p-3 rounded-md mt-2">
                      {ayat.faedah && (
                        <React.Fragment>
                          <div className="flex items-center text-sm mb-1.5 font-medium opacity-80">
                            <Minus strokeWidth={2} />
                            Faedah
                          </div>
                          <div
                            className={cn(
                              "prose prose-sm dark:prose-invert max-w-none text-justify",
                              opts?.fontTranslationSize,
                            )}
                            dangerouslySetInnerHTML={{
                              __html: ayat.faedah.replace(
                                /(\[.*?\])/g,
                                "\n\n$1",
                              ),
                            }}
                          />
                        </React.Fragment>
                      )}
                      {ayat.narrator && (
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          {ayat.narrator.replace(/@/g, "\n")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <ScrollTopButton />
    </>
  );
}
