import { Header } from '#src/components/custom/header';
import { Button, buttonVariants } from '#src/components/ui/button';
import { data as daftar_surat } from '#src/constants/daftar-surat.json';
import { fontSizeOpt } from '#src/constants/prefs';
import { get_cache, set_cache } from '#src/utils/cache-client.ts';
import { cn } from '#src/utils/misc';
import { fetchAllSurahs } from '#src/utils/misc.quran.ts';
import ky from 'ky';
import { ChevronLeft, ChevronRight, Minus, MoveRight } from 'lucide-react';
import pako from 'pako';
import React from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { type Loader as RootLoader } from './muslim.data';

export type ResponseMyquran = {
  status: boolean;
  info: {
    min: number;
    max: number;
  };
  request: {
    path: string;
    page: string;
  };
  data: { [key: string]: null | string }[];
};

export type SurahDetail = {
  number: string; // Nomor surah
  name: string; // Nama surah
  [key: string]: unknown; // Properti lainnya (jika ada)
};

export type GroupedAyat = {
  [surah: string]: {
    surah: (typeof daftar_surat)[0] | undefined; // Detail surah atau undefined jika tidak ditemukan
    ayat: { [key: string]: null | string }[]; // Ayat-ayat dalam surah
  };
};

const loadQuranJson = async () => {
  try {
    const surah = await import(
      `../../public/muslim/quran/quran-tanzil.json`
    );
    const tafsir = await import(
      `../../public/muslim/quran/tafsir.json`
    );
    console.warn('DEBUGPRINT[1]: muslim.quran-v2.page.tsx:45: tafsir=', tafsir);
    // return { tafsir: null, surah: surah.default };
    return surah.default;
  } catch (error) {
    console.error('Error loading surah:', error);
    return null;
  }
};

export type QuranJson = {
  quran: {
    sura: {
      aya: ({
        _index: string;
        _text: string;
        _bismillah: string;
      } | {
        _index: string;
        _text: string;
        _bismillah?: undefined;
      })[];
      _index: string;
      _name: string;
    }[];
  };
} | null;

const fetchSurah = async (surahNumbers: string) => {
  // Pastikan surahNumbers selalu berupa array
  const numbers = Array.isArray(surahNumbers) ? surahNumbers : [surahNumbers];

  // Fetch semua surah secara paralel
  const fetchPromises = numbers.map(async (number) => {
    const response = await fetch(`/muslim/quran/surah_gzip/${number}.json.gz`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch surah ${number}: ${response.statusText}`,
      );
    }
    return response.json();
  });

  // Tunggu semua fetch selesai
  const results = await Promise.all(fetchPromises);

  // Jika hanya satu angka, kembalikan object; jika lebih dari satu, kembalikan array
  return surahNumbers.length === 1 ? results[0] : results;
};

const getSingleSurah = async () => {
  try {
    const surah = await fetchSurah(1); // Angka surah tunggal
    console.log(surah); // Output: Object
  } catch (error) {
    console.error('Error fetching surah:', error);
  }
};

const getMultipleSurahs = async () => {
  try {
    const surahs = await fetchSurah([1, 2, 3]); // Array angka surah
    console.log(surahs); // Output: Array of objects
  } catch (error) {
    console.error('Error fetching surahs:', error);
  }
};

export async function Loader({ params }: LoaderFunctionArgs) {
  const api = ky.create({ prefixUrl: 'https://api.myquran.com/v2/quran' });

  const { id } = params;

  const CACHE_KEY = `/muslim/quran-v2/${id}`;
  const cached_data = await get_cache(CACHE_KEY);

  if (cached_data) return cached_data;
  const ayat = await api.get(`ayat/page/${id}`).json<ResponseMyquran>();

  if (!ayat.status) {
    throw new Response('Not Found', { status: 404 });
  }

  // Fungsi untuk mengelompokkan ayat berdasarkan surah
  const group_surat: GroupedAyat = ayat.data.reduce(
    (result: GroupedAyat, item) => {
      const no_surah = item.surah as string; // Nomor surah
      const detail = daftar_surat.find((d) => d.number === no_surah); // Cari detail surah

      if (!result[no_surah]) {
        result[no_surah] = { surah: detail, ayat: [] };
      }

      result[no_surah].ayat.push(item);

      return result;
    },
    {} as GroupedAyat,
  );

  const data = {
    group_surat,
    id,
  };

  await set_cache(CACHE_KEY, data);
  return data;
}

export function Component() {
  const { group_surat, groupsurat, id } = useLoaderData<{
    group_surat: GroupedAyat;
    id: string;
  }>();
  const loaderRoot = useRouteLoaderData<typeof RootLoader>('root');
  const opts = loaderRoot?.opts;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  return (
    <div className='prose dark:prose-invert md:max-w-xl mx-auto border-x min-h-screen'>
      <Header redirectTo='/muslim/quran' title={`Hal ${id}`}></Header>

      <pre className='text-sm'>{JSON.stringify(groupsurat, null, 2)}</pre>
      {Object.values(group_surat).map((d) => {
        const first_ayah = d.ayat[0]?.ayah;
        const last_ayah = d.ayat[d.ayat.length - 1]?.ayah;
        return (
          <React.Fragment key={d?.surah?.number}>
            <div className='prose dark:prose-invert max-w-none'>
              <div className='text-3xl font-bold w-fit mx-auto pb-1'>
                {d?.surah?.name_id}
                <span className='ml-2 underline-offset-4 group-hover:underline font-lpmq'>
                  ( {d?.surah?.name_short} )
                </span>
                <div className='flex items-center text-base font-medium justify-center -mt-3'>
                  <span>Ayah {first_ayah}</span>
                  <Minus />
                  <span>{last_ayah}</span>
                </div>
              </div>

              <div
                className='rtl:text-justify leading-relaxed px-5 py-3 border-y'
                dir='rtl'
              >
                {d.ayat.map((dt) => (
                  <span
                    key={dt.id}
                    className='text-primary font-lpmq inline hover:bg-muted'
                    style={{
                      fontWeight: opts?.font_weight,
                      fontSize: font_size_opts?.fontSize || '1.5rem',
                      lineHeight: font_size_opts?.lineHeight || '3.5rem',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {dt.arab}
                    <span className='text-4xl inline-flex mx-1 font-uthmani'>
                      {toArabicNumber(Number(dt.ayah))}
                    </span>
                    {' '}
                  </span>
                ))}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Pagination Controls */}
      <div className='ml-auto flex items-center justify-center gap-3 py-3 text-sm border-b'>
        <Link
          className={cn(buttonVariants({ size: 'icon', variant: 'outline' }))}
          to={parseInt(id) === 1 ? '#' : `/muslim/quran-v2/${parseInt(id) - 1}`}
        >
          <span className='sr-only'>Go to previous page</span>
          <ChevronLeft />
        </Link>

        <span className='text-accent-foreground mt-2 sm:mt-0'>
          Halaman <strong>{id}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(buttonVariants({ size: 'icon', variant: 'outline' }))}
          to={parseInt(id) === 604
            ? '#'
            : `/muslim/quran-v2/${parseInt(id) + 1}`}
        >
          <span className='sr-only'>Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

const toArabicNumber = (number: number) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number
    .toString()
    .split('')
    .map((digit) => arabicDigits[parseInt(digit)])
    .join('');
};
