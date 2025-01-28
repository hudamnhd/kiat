import { fontSizeOpt } from '#/src/constants/prefs';
import sholawat from '#/src/constants/sholawat.json';
import { Header } from '#src/components/custom/header';
import {
  AyatBookmark,
  type Bookmark,
  save_bookmarks,
} from '#src/utils/bookmarks';
import { get_cache, set_cache } from '#src/utils/cache-client.ts';
import { cn } from '#src/utils/misc';
import { Heart } from 'lucide-react';
import React from 'react';
import { useRouteLoaderData } from 'react-router';

const BOOKMARK_KEY = 'BOOKMARK';
type AddIndex<T> = T & { index: string };

type SholawatItem = (typeof sholawat)[number];
type SholawatItemWithIndex = AddIndex<SholawatItem>;

export function Component() {
  const loaderRoot = useRouteLoaderData('muslim');
  const opts = loaderRoot?.opts || {};

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await get_cache(BOOKMARK_KEY);
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }
    };

    load_bookmark_from_lf();
  }, []);

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === 'sholawat')
    .map((item) => {
      const params = new URLSearchParams(item.source.split('?')[1]);
      return {
        created_at: item.created_at,
        id: params.get('index'),
        source: item.source,
      };
    });

  const toggleBookmark = (ayat: SholawatItemWithIndex) => {
    const newBookmarks = save_bookmarks(
      'sholawat',
      {
        title: ayat.nama,
        arab: ayat.arab,
        latin: ayat.latin,
        translation: ayat.arti,
        source: `/muslim/sholawat?index=${ayat.index}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === ayat.index);

    if (is_saved) {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(newBookmarks);
    } else {
      setBookmarks(newBookmarks);
    }
  };

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks: AyatBookmark[]) => {
      await set_cache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);
  return (
    <div className='prose-base dark:prose-invert w-full max-w-xl mx-auto border-x'>
      <Header redirectTo='/muslim' title='Sholawat' />
      <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3'>
        Sholawat
      </div>

      {sholawat.map((d, index: number) => {
        const ayat = {
          ...d,
          index: index.toString(),
        };

        const _source = `/muslim/sholawat?index=${ayat.index}`;
        const isFavorite = bookmarks_ayah.some((fav) => fav.source === _source);
        return (
          <div key={index} className='group relative  border-t pb-4'>
            <div
              className={cn(
                'flex items-center justify-between gap-x-2 mb-2 border-b p-2.5 bg-linear-to-br from-muted/20 to-accent/20',
                isFavorite &&
                  'from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20',
              )}
            >
              <div className='text-primary font-medium text-lg sm:text-xl  line-clamp-1'>
                {ayat.nama}
              </div>

              <button
                onClick={() => toggleBookmark(ayat)}
                className={cn(
                  'order-0 sm:order-1 bg-linear-to-br from-muted to-accent size-9 [&_svg]:size-5 inline-flex gap-2 items-center justify-center rounded-lg',
                  isFavorite &&
                    'from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20',
                )}
              >
                <Heart
                  className={cn(
                    'text-muted-foreground',
                    isFavorite && 'text-rose-600 dark:text-rose-400',
                  )}
                />
              </button>
            </div>
            <div className='w-full text-right flex gap-x-2.5 items-start justify-end px-4'>
              <div
                className={cn(
                  'relative text-right text-primary font-lpmq',
                  opts?.font_type,
                )}
                style={{
                  fontWeight: opts.font_weight,
                  fontSize: font_size_opts?.fontSize || '1.5rem',
                  lineHeight: font_size_opts?.lineHeight || '3.5rem',
                }}
              >
                {ayat.arab}
              </div>
            </div>
            <div className='px-4'>
              {opts?.font_latin === 'on' && (
                <div
                  className='latin-text prose max-w-none border-b pb-2 mb-2 text-muted-foreground'
                  dangerouslySetInnerHTML={{
                    __html: ayat.latin,
                  }}
                />
              )}
              {opts?.font_translation === 'on' && (
                <div
                  className='translation-text mt-1 prose max-w-none text-accent-foreground'
                  dangerouslySetInnerHTML={{
                    __html: ayat.arti,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
