import TextArab from "#src/components/custom/text-arab.tsx";
import { Button, buttonVariants } from "#src/components/ui/button";
import { FONT_SIZE } from "#src/constants/prefs";
import { type Bookmark, save_bookmarks } from "#src/utils/bookmarks";
import { cn } from "#src/utils/misc";
import { Ellipsis, ExternalLink, Heart } from "lucide-react";
import React from "react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import type { MenuItemProps } from "react-aria-components";
import { Link, useNavigate, useRouteLoaderData } from "react-router";

// React Component Example
import { Header } from "#src/components/custom/header.tsx";
import { getCache, setCache } from "#src/utils/cache-client.ts";
const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

export function Component() {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = React.useState<number | null>(null);

  const loaderRoot = useRouteLoaderData("muslim");
  const navigate = useNavigate();
  const opts = loaderRoot?.opts || {};

  const prefsOption = FONT_SIZE.find((d) => d.label === opts?.fontSize);
  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await getCache(BOOKMARK_KEY);
      const storedLastRead = await getCache(LASTREAD_KEY);
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }
    };

    load_bookmark_from_lf();
  }, []);

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks) => {
      await setCache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);

  React.useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await setCache(LASTREAD_KEY, lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  const handleRead = (ayat) => {
    const isLastRead = lastRead?.id === ayat.id;
    if (isLastRead) {
      setLastRead(null);
    } else {
      setLastRead(ayat);
    }
  };

  const handleAddLink = () => {
    try {
      const newBookmarks = save_bookmarks(
        "link",
        { path: "https://example.com" },
        [...bookmarks],
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBookmark = (created_at: string) => {
    try {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== created_at,
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header redirectTo="/" title="Bookmarks" />
      <div
        className={cn(
          "text-center text-3xl font-bold leading-tight tracking-tighter capitalize py-2 border-b",
        )}
      >
        Bookmarks
      </div>
      <div className="divide-y">
        {bookmarks?.length > 0
          ? (
            bookmarks.map((d, index) => {
              if (
                d.type === "ayat" ||
                d.type === "doa" ||
                d.type === "sholawat"
              ) {
                return (
                  <div key={index} className="group relative p-3 last:border-b">
                    <div className="flex items-center justify-between gap-x-2">
                      <Link
                        to={d.source}
                        className={cn(
                          buttonVariants({ variant: "link" }),
                          "gap-2 p-0 -mt-2 text-lg",
                        )}
                      >
                        {d.title}
                      </Link>
                      <div className="absolute flex gap-x-1.5 justify-end w-full -translate-y-7 items-center right-3">
                        <MenuTrigger>
                          <Button
                            aria-label="Menu"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Ellipsis />
                          </Button>
                          <Popover
                            placement="start"
                            className=" bg-background p-1 w-50 overflow-auto rounded-md shadow-lg border entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left"
                          >
                            <Menu className="outline-none">
                              <ActionItem
                                id="new"
                                onAction={() =>
                                  handleDeleteBookmark(d.created_at)}
                              >
                                <Heart className="fill-rose-500 text-rose-500 mr-1.5 w-4 h-4" />
                                Delete bookmark
                              </ActionItem>
                              <ActionItem
                                id="goto"
                                onAction={() =>
                                  navigate(d.source)}
                              >
                                <ExternalLink className="mr-1.5 w-4 h-4" />
                                Go to ayat
                              </ActionItem>
                            </Menu>
                          </Popover>
                        </MenuTrigger>
                      </div>
                    </div>
                    <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                      <TextArab
                        text={d.arab}
                      />
                    </div>
                    <div className="">
                      {opts?.showLatin === "on" && d.latin && (
                        <div
                          className="latin-text prose prose dark:prose-invert max-w-none leading-6"
                          dangerouslySetInnerHTML={{
                            __html: d.latin,
                          }}
                        />
                      )}
                      {opts?.showTranslation === "on" && d.translation && (
                        <div
                          className="translation-text mt-3 prose prose dark:prose-invert max-w-none leading-6"
                          dangerouslySetInnerHTML={{
                            __html: d.translation,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              }
            })
          )
          : (
            <div className="text-center text-muted-foreground py-6">
              You don't have any bookmarks yet
            </div>
          )}
      </div>
    </>
  );
}

function ActionItem(props: MenuItemProps) {
  return (
    <MenuItem
      {...props}
      className="bg-background relative flex gap-1 select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-sm"
    />
  );
}
