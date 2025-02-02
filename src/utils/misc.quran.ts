import {
  BOOKMARK_KEY,
  FAVORITESURAH_KEY,
  LASTREAD_KEY,
  LASTREADSURAH_KEY,
  LASTVISITPAGE_KEY,
} from "#/src/constants/key";
import listSurah from "#/src/constants/list-surah.json";
import { juzPages, pageAyahs } from "#/src/constants/quran-metadata.ts";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import ky from "ky";
import toast from "react-hot-toast";

export const fetchSurahWithCache = async (number: number) => {
  const CACHE_KEY = `surah_${number}`;
  const cachedData = await get_cache(CACHE_KEY);
  if (cachedData) {
    // console.log(`Surah ${number} loaded from cache`);
    return cachedData; // Kembalikan data dari cache jika ada
  }

  console.log(`Fetching Surah ${number} from server`);

  const response = await fetch(`/muslim/quran/surah_gzip/${number}.json.gz`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch surah ${number}: ${response.statusText}`,
    );
  }
  const data = await response.json();

  await set_cache(CACHE_KEY, data);
  return data;
};

export const fetchAllSurahs = async () => {
  const surahNumbers = Array.from({ length: 114 }, (_, i) => i + 1); // Generate array [1, 2, ..., 114]

  const results = await Promise.all(surahNumbers.map(fetchSurahWithCache));

  return results;
};

type Ayah = {
  i: number;
  vk: string;
  t: string;
  d?: string;
};

const getStyleTextArabic = async (style: string) => {
  const response = await toast.promise(
    ky.get(`/muslim/quran/gz/${style}_style.json.gz`).json<Ayah[]>(),
    {
      loading: "Loading data surah...",
      success: "Berhasil memuat data surah",
      error: "Gagal memuat data surah",
    },
  );

  return response;
};

async function getDataStyle(style: string) {
  const cachedDataKey = `data-${style}`;
  const cachedData = await get_cache(cachedDataKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedDataKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedDataKey} from API...`);
  const fetchedData = await getStyleTextArabic(style);
  // const fetchedData = await ky.get(`/muslim/quran/gz/${style}_style.json.gz`)
  //   .json<Ayah[]>();

  // Simpan ke cache
  await set_cache(cachedDataKey, fetchedData);
  return fetchedData;
}

async function getTranslation() {
  const cachedKey = "data-translation";
  const cachedData = await get_cache(cachedKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedKey} from API...`);
  const fetchedData = await ky.get("/muslim/quran/gz/translation_id.json.gz")
    .json<Ayah[]>();

  // Simpan ke cache
  await set_cache(cachedKey, fetchedData);
  return fetchedData;
}

const getSurahIndex = (verses: { vk: string }[]) => {
  return [...new Set(verses.map(verse => parseInt(verse.vk.split(":")[0])))];
};

export const getSurahByPage = async (
  { page, style, translation }: {
    page: number;
    style: "indopak" | "kemenag" | "uthmani" | "imlaei";
    translation?: boolean;
  },
) => {
  // 🔥 Cek apakah `page` berada dalam rentang 1-64
  if (page < 1 || page > 604) {
    console.warn(
      `Invalid page number: ${page}. Must be between 1 and 604.`,
    );
    return [];
  }
  const pageData = pageAyahs.find(p => p.p === page);
  if (!pageData) return [];

  // 🔹 Fetch Quran & Translation secara parallel untuk mempercepat
  const [verses, trans] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation() : Promise.resolve([]),
  ]);

  const juzIndex = juzPages.findIndex(d => page >= d.s && page <= d.e);

  const surahData = listSurah.filter(d =>
    page >= d.meta.page.start && page <= d.meta.page.end
  );
  // 🔹 Filter ayat hanya untuk halaman tertentu
  const verseData = verses.filter(verse =>
    verse.i >= pageData.s && verse.i <= pageData.e
  );

  // 🔹 Filter translation hanya jika tersedia
  const transMap = new Map(trans.map(t => [t.i, t.t])); // Optimasi pencarian dengan Map()
  const transDescMap = new Map(trans.map(t => [t.i, t.d])); // Optimasi pencarian dengan Map()

  // 🔥 Merge ayat dengan translation (jika translation tersedia)
  // i : index
  // vk : verse key
  // ta : text arab
  // tt : text translation

  const ayah = verseData.map(verse => ({
    i: verse.i,
    vk: verse.vk,
    ta: verse.t,
    tt: transMap.get(verse.i) || null, // Ambil translation dari Map
    td: transDescMap.get(verse.i) || null, // Ambil translation dari Map
  }));

  // const surah = getSurahIndex(ayah);

  return {
    ayah,
    page: pageData,
    surah: surahData,
    juz: juzIndex + 1,
    bismillah: verses[0].t,
  };
};

// groupJuzData

function groupJuzData(data) {
  const juzMap: { [key: string]: Surah[] } = {};

  // Inisialisasi semua juz dari 1 sampai 30 sebagai array kosong
  for (let i = 1; i <= 30; i++) {
    juzMap[i] = [];
  }

  // Mengelompokkan surah berdasarkan start-end juz menggunakan for...of

  let fisrtIndex = 0;
  let JuzIndex = 0;
  for (const d of data) {
    for (let i = d.meta.juz.start; i <= d.meta.juz.end; i++) {
      const shouldShow = d.index !== fisrtIndex;
      const shouldShowJuz = i !== JuzIndex;
      const surah = shouldShow
        ? {
          s: { // s = surah
            i: d.index, // index
            n: d.name.id, // nama surah
            t: d.name.tr_id, // nama terjemahan surah
            v: d.meta.number_of_verses, // jumlah ayat
            p: d.meta.page.start, // halaman awal surah
            r: d.revelation.id, // revelation
          },
        }
        : {};
      const juz = shouldShowJuz
        ? {
          j: { // j = juz
            i, // index
            s: d.index, // surah index
            n: `Juz' ${i}`, // nama juz
            p: juzPages[i - 1].s, // halaman awal juz
          },
        }
        : {};
      juzMap[i].push({ ...surah, ...juz });
      fisrtIndex = d.index;
      JuzIndex = i;
    }
  }

  return juzMap;
}

/**
 * Update progress membaca Quran
 * @param plan Rencana baca Quran
 * @param day Hari keberapa yang sedang dibaca
 * @param readItems Daftar halaman/surah yang telah dibaca
 * @returns Rencana baca yang diperbarui
 */
export function updateReadingProgress(
  plan: QuranReadingPlan[],
  day: number,
  readItems: number[],
): QuranReadingPlan[] {
  return plan.map((entry) => {
    if (entry.day === day) {
      const totalItems = entry.pages || entry.surahs || [];
      const updatedProgress = Array.from(
        new Set([...entry.progress!, ...readItems]),
      ); // Tambahkan item baru yang sudah dibaca

      return {
        ...entry,
        progress: updatedProgress,
        completed: updatedProgress.length >= totalItems.length, // Tandai selesai jika semua item sudah dibaca
      };
    }
    return entry;
  });
}
