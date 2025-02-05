import { Header } from "#src/components/custom/header";
import { ScrollTopButton } from "#src/components/custom/scroll-to-top.tsx";
import { Badge } from "#src/components/ui/badge";
import { data as data_doa } from "#src/constants/doa-sehari-hari.ts";
import { FONT_SIZE } from "#src/constants/prefs";
import { cn } from "#src/utils/misc";
import { BookOpen } from "lucide-react";
import React from "react";
import { Link, useRouteLoaderData } from "react-router";

export function Component() {
  const loaderData = data_doa;
  const loaderRoot = useRouteLoaderData("muslim");
  const opts = loaderRoot?.opts;
  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);

  return (
    <>
      <div
        className="space-y-0.5"
        style={{
          position: "relative",
        }}
      >
        <Header
          redirectTo="/muslim"
          title="Do'a Sehari-hari"
        />
        <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
          Do'a Sehari-hari
        </div>
        <div className="w-fit mx-auto -mt-3">
          <Link
            className="text-sm"
            to="https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef"
            target="_blank"
          >
            Source data
          </Link>
        </div>
        {loaderData.map((dt, index) => {
          return (
            <div className="border-t" key={index}>
              <div className={cn("group relative py-4 px-4 sm:px-5")}>
                <div className="w-full text-right flex gap-x-2.5 items-center justify-between">
                  <div className="flex items-center gap-x-3">
                    <div className="bg-linear-to-br from-primary/30  via-muted/10 to-primary/30 p-3 rounded-xl">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="grid text-left gap-0.5">
                      <span className="text-lg font-medium">
                        {dt.judul}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dt.tag.map((tag) => (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            key={tag}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full text-right flex gap-x-2.5 items-end justify-end">
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
                    {dt.arab}
                  </div>
                </div>

                {opts?.showLatin === "on" && (
                  <div
                    className="latin-text prose dark:prose-invert max-w-none whitespace-pre-line leading-6 pb-1 text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: dt.latin,
                    }}
                  />
                )}

                {opts?.showTranslation === "on" && (
                  <div className="translation-text pt-2 prose dark:prose-invert max-w-none whitespace-pre-line leading-6 border-t">
                    {dt.arti.replace(
                      /(.{150,}?[\.\!\?])\s+/g,
                      "$1\n\n",
                    )}
                  </div>
                )}

                {dt.footnote && (
                  <div className="note-text mt-3">
                    <div
                      className="max-w-none prose dark:prose-invert text-xs"
                      dangerouslySetInnerHTML={{
                        __html: dt.footnote,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollTopButton />
    </>
  );
}
