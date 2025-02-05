import listSurah from "#/src/constants/list-surah.json";
import {
  INDEXAYAHBYSURAH,
  juzPages,
  pageAyahs,
  surahPages,
} from "#/src/constants/quran-metadata.ts";
import { SOURCE_TRANSLATIONS } from "#src/constants/sources";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import ky from "ky";
import toast from "react-hot-toast";

type Ayah = {
  i: number;
  vk: string;
  t: string;
  d?: string;
};

const getStyleTextArabic = async (style: string) => {
  const response = await toast.promise(
    ky.get(`/muslim/quran/data/${style}.json.gz`).json<Ayah[]>(),
    {
      loading: `Loading data surah ${style}...`,
      success: `Berhasil memuat data surah ${style}`,
      error: `Gagal memuat data surah ${style}`,
    },
  );

  return response;
};

const getSourceTranslation = async (source: string) => {
  const response = await toast.promise(
    ky.get(`/muslim/quran/data/id-${source}.json.gz`).json<Ayah[]>(),
    {
      loading: `Loading data terjemahan ${source}...`,
      success: `Berhasil memuat data terjemahan ${source}`,
      error: `Gagal memuat data terjemahan ${source}`,
    },
  );

  return response;
};

const getSourceTafsir = async (source: string) => {
  const response = await toast.promise(
    ky.get(`/muslim/quran/data/id-${source}.json.gz`).json<Ayah[]>(),
    {
      loading: "Loading data tafsir...",
      success: "Berhasil memuat data tafsir",
      error: "Gagal memuat data tafsir",
    },
  );

  return response;
};

export async function getDataStyle(style: string) {
  const cachedDataKey = `data-${style}`;
  const cachedData = await getCache(cachedDataKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedDataKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedDataKey} from API...`);
  const fetchedData = await getStyleTextArabic(style);

  // Simpan ke cache
  await setCache(cachedDataKey, fetchedData);
  return fetchedData;
}

export async function getTranslation(source: string) {
  const cachedKey = `data-translation-${source}`;
  const cachedData = await getCache(cachedKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedKey} from API...`);
  const fetchedData = await getSourceTranslation(source);

  // Simpan ke cache
  await setCache(cachedKey, fetchedData);
  return fetchedData;
}

export interface GetSurahByPage {
  page: number;
  style: "indopak" | "kemenag" | "uthmani" | "imlaei" | "uthmani-simple";
  translation?: boolean;
  translationSource?: string;
  showTafsir?: boolean;
}

/**
 * Get data Quran berdasarkan page
 * @param page halaman Quran (misal: 604)
 * @param style gaya tulisan "indopak" | "kemenag" | "uthmani" | "imlaei" | "uthmani_simple";
 * @param translation Jika `true`, return ditambahkan data translation
 * @returns Object Data array ayah beserta metadata quran
 */
export const getSurahByPage = async (
  {
    page,
    style,
    translation = false,
    translationSource = "kemenag",
    showTafsir = false,
  }: GetSurahByPage,
) => {
  let initial_page = page;
  // 🔥 Cek apakah `page` berada dalam rentang 1-64
  if (page < 1 || page > 604) {
    console.warn(
      `Invalid page number: ${page}. Must be between 1 and 604.`,
    );
    initial_page = 1;
  }
  const pageData = pageAyahs.find(p => p.p === initial_page);
  if (!pageData) throw new Error("Not Found");

  // 🔹 Fetch Quran & Translation secara parallel untuk mempercepat
  const [verses, trans, tafsir] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation(translationSource) : Promise.resolve([]),
    showTafsir ? getTranslation("tafsir-kemenag") : Promise.resolve([]),
  ]);

  const juzIndex = juzPages.findIndex(d =>
    initial_page >= d.s && initial_page <= d.e
  );

  const surahData = listSurah.filter(d =>
    initial_page >= d.meta.page.start && initial_page <= d.meta.page.end
  );
  // 🔹 Filter ayat hanya untuk halaman tertentu
  const verseData = verses.filter(verse =>
    verse.i >= pageData.s && verse.i <= pageData.e
  );

  // 🔹 Filter translation hanya jika tersedia
  const transMap = new Map(trans.map(t => [t.i, t.t])); // Optimasi pencarian dengan Map()
  const tafsirMap = new Map(tafsir.map(t => [t.i, t.t])); // Optimasi pencarian dengan Map()
  const transDescMap = new Map(trans.map(t => [t.i, t.d]));

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
    td: translationSource === "muntakhab" ? transDescMap.get(verse.i) : null, // Ambil translation dari Map
    ttf: tafsirMap.get(verse.i) || null, // Ambil tafsir dari Map
  }));
  console.warn("DEBUGPRINT[7]: misc.quran.ts:168: ayah=", ayah);

  const returnData = {
    ayah,
    page: pageData,
    surah: surahData,
    juz: juzIndex + 1,
    bismillah: verses[0].t,
    translationSource: translation
      ? SOURCE_TRANSLATIONS.find((d) => d.id === translationSource)
      : null,
    tafsirSource: showTafsir ? SOURCE_TRANSLATIONS[3] : null,
  };

  return returnData;
};

export interface GetSurahByIndex {
  index: number;
  style: "indopak" | "kemenag" | "uthmani" | "imlaei" | "uthmani-simple";
  translation?: boolean;
  translationSource?: string;
  showTafsir?: boolean;
}

/**
 * Get data Quran berdasarkan index surat
 * @param index surat Quran (misal: 1 - 114)
 * @param style gaya tulisan "indopak" | "kemenag" | "uthmani" | "imlaei" | "uthmani_simple";
 * @param translation Jika `true`, return ditambahkan data translation
 * @returns Object Data array ayah beserta metadata quran
 */
export const getSurahByIndex = async (
  {
    index,
    style,
    translation = false,
    translationSource = "kemenag",
    showTafsir = false,
  }: GetSurahByIndex,
) => {
  let initial_page = index;
  // 🔥 Cek apakah `index` berada dalam rentang 1-64
  if (index < 1 || index > 604) {
    console.warn(
      `Invalid index number: ${index}. Must be between 1 and 114.`,
    );
    initial_page = 1;
  }
  // const pageData = pageAyahs.find(p => p.p === initial_page);
  // if (!pageData) throw new Error("Not Found");

  // const startPage = pageAyahs.find(p => p.p === startIndex.s);
  // const endPage = pageAyahs.find(p => p.p === startIndex.e);
  // // 🔹 Fetch Quran & Translation secara parallel untuk mempercepat
  const [verses, trans, tafsir] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation(translationSource) : Promise.resolve([]),
    showTafsir ? getTranslation("tafsir-kemenag") : Promise.resolve([]),
  ]);
  //
  const surahData = listSurah.find(d => d.index == index);
  console.warn("DEBUGPRINT[10]: misc.quran.ts:227: surahData=", surahData);

  const pageData = pageAyahs.find(p => p.p === surahData?.meta.page.start);
  const juzIndex = surahData?.meta.juz.start;
  //
  // 🔹 Filter ayat hanya untuk halaman tertentu
  const verseData = verses.filter(verse =>
    verse.i >= INDEXAYAHBYSURAH[index - 1] &&
    verse.i <= (INDEXAYAHBYSURAH[index] - 1)
  );

  // 🔹 Filter translation hanya jika tersedia
  const transMap = new Map(trans.map(t => [t.i, t.t])); // Optimasi pencarian dengan Map()
  const tafsirMap = new Map(tafsir.map(t => [t.i, t.t])); // Optimasi pencarian dengan Map()
  const transDescMap = new Map(trans.map(t => [t.i, t.d]));

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
    td: translationSource === "muntakhab" ? transDescMap.get(verse.i) : null, // Ambil translation dari Map
    ttf: tafsirMap.get(verse.i) || null, // Ambil tafsir dari Map
  }));

  const returnData = {
    ayah,
    page: pageData,
    surah: surahData ? [surahData] : [],
    juz: juzIndex,
    bismillah: verses[0].t,
    translationSource: translation
      ? SOURCE_TRANSLATIONS.find((d) => d.id === translationSource)
      : null,
    tafsirSource: showTafsir ? SOURCE_TRANSLATIONS[3] : null,
  };

  return returnData;
};

// groupJuzData

// function groupJuzData(data) {
//   const juzMap: { [key: string]: Surah[] } = {};
//
//   // Inisialisasi semua juz dari 1 sampai 30 sebagai array kosong
//   for (let i = 1; i <= 30; i++) {
//     juzMap[i] = [];
//   }
//
//   // Mengelompokkan surah berdasarkan start-end juz menggunakan for...of
//
//   let fisrtIndex = 0;
//   let JuzIndex = 0;
//   for (const d of data) {
//     for (let i = d.meta.juz.start; i <= d.meta.juz.end; i++) {
//       const shouldShow = d.index !== fisrtIndex;
//       const shouldShowJuz = i !== JuzIndex;
//       const surah = shouldShow
//         ? {
//           s: { // s = surah
//             i: d.index, // index
//             n: d.name.id, // nama surah
//             t: d.name.tr_id, // nama terjemahan surah
//             v: d.meta.number_of_verses, // jumlah ayat
//             p: d.meta.page.start, // halaman awal surah
//             r: d.revelation.id, // revelation
//           },
//         }
//         : {};
//       const juz = shouldShowJuz
//         ? {
//           j: { // j = juz
//             i, // index
//             s: d.index, // surah index
//             n: `Juz' ${i}`, // nama juz
//             p: juzPages[i - 1].s, // halaman awal juz
//           },
//         }
//         : {};
//       juzMap[i].push({ ...surah, ...juz });
//       fisrtIndex = d.index;
//       JuzIndex = i;
//     }
//   }
//
//   return juzMap;
// }

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

import { addDays, format } from "date-fns";

export interface QuranReadingPlan {
  day: number;
  date: string; // Format tanggal
  pages?: number[]; // Jika membaca berdasarkan halaman
  surahs?: number[]; // Jika membaca berdasarkan surah
  completed: boolean;
  progress?: number[]; // Halaman atau surah yang sudah dibaca di hari tersebut
}

/**
 * Generate target baca Quran berdasarkan jumlah hari & metode baca (per halaman atau per surah)
 * @param totalPages Total halaman Quran (misal: 604)
 * @param totalSurahs Total jumlah surah dalam Quran (114)
 * @param days Jumlah hari untuk khatam
 * @param method Metode baca: "page" untuk per halaman, "surah" untuk per surah
 * @param startToday Jika `true`, target mulai hari ini; jika `false`, mulai besok
 * @returns Array jadwal baca per hari
 */
export function generateQuranReadingPlan(
  totalPages: number = 604,
  totalSurahs: number = 114,
  days: number,
  method: "page" | "surah",
  startToday: boolean = true,
): QuranReadingPlan[] {
  const plan: QuranReadingPlan[] = [];
  const startDate = startToday ? new Date() : addDays(new Date(), 1); // Mulai hari ini atau besok

  if (method === "page") {
    const pagesPerDay = Math.ceil(totalPages / days);
    let currentPage = 1;

    for (let day = 1; day <= days; day++) {
      let pages: number[] = [];
      for (let i = 0; i < pagesPerDay; i++) {
        if (currentPage > totalPages) break;
        pages.push(currentPage);
        currentPage++;
      }
      plan.push({
        day,
        date: format(addDays(startDate, day - 1), "yyyy-MM-dd"),
        pages,
        completed: false,
        progress: [],
      });
    }
  } else if (method === "surah") {
    const surahsPerDay = Math.ceil(totalSurahs / days);
    let currentSurah = 1;

    for (let day = 1; day <= days; day++) {
      let surahs: number[] = [];
      for (let i = 0; i < surahsPerDay; i++) {
        if (currentSurah > totalSurahs) break;
        surahs.push(currentSurah);
        currentSurah++;
      }
      plan.push({
        day,
        date: format(addDays(startDate, day - 1), "yyyy-MM-dd"),
        surahs,
        completed: false,
        progress: [],
      });
    }
  }

  return plan;
}

// Fungsi untuk mengonversi angka ke format Arab
export const toArabicNumber = (number: number) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};
