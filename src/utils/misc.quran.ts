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

const getQuranMetadata = async () => {
  const response = await toast.promise(
    ky.get(`/muslim/quran/data/metadata.json`).json<Ayah[]>(),
    {
      loading: `Loading data surah metadata...`,
      success: `Berhasil memuat data surah metadata`,
      error: `Gagal memuat data surah metadata`,
    },
  );

  return response;
};
const getListSurah = async () => {
  const response = await toast.promise(
    ky.get(`/muslim/quran/data/list-surah.json`).json<Ayah[]>(),
    {
      loading: `Loading data surah metadata...`,
      success: `Berhasil memuat data surah metadata`,
      error: `Gagal memuat data surah metadata`,
    },
  );

  return response;
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
  let mode = source === "tafsir-kemenag" ? "tafsir" : "terjemahan";
  const response = await toast.promise(
    ky.get(`/muslim/quran/data/id-${source}.json.gz`).json<Ayah[]>(),
    {
      loading: `Loading data ${mode} ${source}...`,
      success: `Berhasil memuat data ${mode} ${source}`,
      error: `Gagal memuat data ${mode} ${source}`,
    },
  );

  return response;
};

export async function getMeta() {
  const cachedDataKey = `data-meta`;
  const cachedData = await getCache(cachedDataKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedDataKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedDataKey} from API...`);
  const fetchedData = await getQuranMetadata();

  await setCache(cachedDataKey, fetchedData);
  return fetchedData;
}

export async function getSurah() {
  const cachedDataKey = `data-surah`;
  const cachedData = await getCache(cachedDataKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedDataKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedDataKey} from API...`);
  const fetchedData = await getListSurah();

  await setCache(cachedDataKey, fetchedData);
  return fetchedData;
}

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

export interface GetSurahByJuz {
  index: number;
  style: "indopak" | "kemenag" | "uthmani" | "imlaei" | "uthmani-simple";
  translation?: boolean;
  translationSource?: string;
  showTafsir?: boolean;
}

function checkSequence(arr) {
  for (let i = 1; i < arr.length; i++) {
    const prevE = arr[i - 1].e;
    const currentS = arr[i].s;

    if (currentS !== prevE + 1) {
      return {
        valid: false,
        errorIndex: i,
        message: `Urutan salah di index ${i}. Seharusnya s = ${prevE + 1}, tapi dapat ${currentS}`
      };
    }
  }

  return {
    valid: true,
    message: "Semua urutan sudah benar ✅"
  };
}

function fixArray(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    const current = arr[i];
    const next = arr[i + 1];

    const expectedE = next.s - 1;

    if (current.e !== expectedE) {
      current.e = expectedE;
    }
  }

  return arr;
}

export const getSurahByJuz = async ({
  juz,
  style,
  translation = false,
  translationSource = "kemenag",
  showTafsir = false,
}: {
  juz: number;
  style: any;
  translation?: boolean;
  translationSource?: string;
  showTafsir?: boolean;
}) => {
  let initial_index = juz;
  // 🔥 Cek apakah `page` berada dalam rentang 1-30
  if (juz < 1 || juz > 30) {
    initial_index = 1;
  }
  // 🔹 Fetch Quran & Translation secara paralel (ambil semua dalam satu juz)
  const [verses, trans, tafsir, listSurah, qmeta] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation(translationSource) : Promise.resolve([]),
    showTafsir ? getTranslation("tafsir-kemenag") : Promise.resolve([]),
    getSurah(),
    getMeta(),
  ]);

  const juzData = qmeta.juzPages[initial_index - 1];
  const { s: startPage, e: endPage } = juzData;

  // 🔹 Ambil semua halaman dalam rentang juz
  const pagesInJuzOriginal = qmeta.pageAyahs.filter(p => p.p >= startPage && p.p <= endPage);
  const pagesInJuz = fixArray(pagesInJuzOriginal);
  // const pagesInJuz = result.filter(p => p.p >= startPage && p.p <= endPage);

  // 🔹 Optimasi pencarian dengan Map()
  const transMap = new Map(trans.map(t => [t.i, t.t]));
  const tafsirMap = new Map(tafsir.map(t => [t.i, t.t]));
  const transDescMap = new Map(trans.map(t => [t.i, t.d]));

  // 🔹 Dapatkan daftar surah dalam halaman ini
  const surahData = listSurah.filter(d =>
    initial_index >= d.meta.juz.start && initial_index <= d.meta.juz.end
  );
  // 🔹 Buat object per halaman `{ 1: { ayah: [...], surah: [...], juz: 1 }, 2: { ... } }`
  const resultPerPage: Record<number, {
    ayah: {
      i: number;
      vk: string;
      ta: string;
      tt: string | null;
      td: string | null | undefined;
      ttf: string | null;
    }[];
    page: {
      p: number;
      s: number;
      e: number;
    };
    surah: {
      i: number;
      n: string;
      s: string;
      e: string;
    }[];
    bismillah: string | null;
  }> = {};

  // 🔥 Iterasi setiap halaman dalam juz menggunakan `for...of`
  for (const page of pagesInJuz) {
    const pageAyah = verses.filter(verse =>
      verse.i >= page.s && verse.i <= page.e
    );
    let showBismillah = false;

    const ayah = pageAyah.map((verse, index) => {
      if (index === 0) {
        const ayahIndex = verse.vk.split(":")[1];
        if (ayahIndex === "1") {
          showBismillah = true;
        } else {
          showBismillah = false;
        }
      }
      return {
        i: verse.i,
        vk: verse.vk,
        ta: verse.t,
        tt: transMap.get(verse.i) || null, // Ambil translation dari Map
        td: translationSource === "muntakhab"
          ? transDescMap.get(verse.i)
          : null, // Ambil translation dari Map
        ttf: tafsirMap.get(verse.i) || null, // Ambil tafsir dari Map
      };
    });

    // 🔹 Dapatkan daftar surah dalam halaman ini
    const _surahData = surahData.filter(d =>
      page.p >= d.meta.page.start && page.p <= d.meta.page.end
    );

    const firstAyah = ayah[0].vk.split(":")[1];
    const lastAyah = ayah[ayah.length - 1].vk.split(":")[1];
    // 🔹 Simpan dalam objek per halaman
    const _data = {
      ayah,
      page,
      surah: _surahData.map((d) => {
        return {
          i: d.index,
          n: d.name.id,
          s: firstAyah,
          e: lastAyah,
        };
      }),
      bismillah: showBismillah ? verses[0].t : null,
    };
    resultPerPage[page.p] = _data;
  }

  return {
    page: resultPerPage,
    surah: surahData,
    juz,
    translationSource: translation
      ? SOURCE_TRANSLATIONS.find(d => d.id === translationSource)
      : null,
    tafsirSource: showTafsir ? SOURCE_TRANSLATIONS[3] : null,
  };
};

/**
 * Get data Quran berdasarkan juz
 * @param index (nomor juz) Quran (misal: 1-30)
 * @param style gaya tulisan "indopak" | "kemenag" | "uthmani" | "imlaei" | "uthmani_simple";
 * @param translation Jika `true`, return ditambahkan data translation
 * @returns Object Data array ayah beserta metadata quran
 */
export const getSurahByJuzOld = async (
  {
    index,
    style,
    translation = false,
    translationSource = "kemenag",
    showTafsir = false,
  }: GetSurahByJuz,
) => {
  let initial_index = index;
  // 🔥 Cek apakah `page` berada dalam rentang 1-30
  if (index < 1 || index > 30) {
    initial_index = 1;
  }
  const juzIndex = juzPages[initial_index - 1];

  const pages = pageAyahs.filter(p => p.p >= juzIndex.s && p.p <= juzIndex.e);
  const startPage = pageAyahs.find(p => p.p === juzIndex.s);
  const endPage = pageAyahs.find(p => p.p === juzIndex.e);
  if (!startPage || !endPage) throw new Error("Not Found");

  // 🔹 Fetch Quran & Translation secara parallel untuk mempercepat
  const [verses, trans, tafsir] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation(translationSource) : Promise.resolve([]),
    showTafsir ? getTranslation("tafsir-kemenag") : Promise.resolve([]),
  ]);

  const surahData = listSurah.filter(d =>
    initial_index >= d.meta.juz.start && initial_index <= d.meta.juz.end
  );
  // 🔹 Filter ayat hanya untuk halaman tertentu
  const verseData = verses.filter(verse =>
    verse.i >= startPage.s && verse.i <= endPage.e
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
    page: pages,
    surah: surahData,
    juz: initial_index,
    bismillah: verses[0].t,
    translationSource: translation
      ? SOURCE_TRANSLATIONS.find((d) => d.id === translationSource)
      : null,
    tafsirSource: showTafsir ? SOURCE_TRANSLATIONS[3] : null,
  };

  return returnData;
};

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
  const qmeta = await getMeta();
  const pageData = qmeta?.pageAyahs.find(p => p.p === initial_page);
  const nextPageData = qmeta?.pageAyahs.find(p => p.p === initial_page + 1);

  if (pageData && nextPageData && nextPageData.s - pageData.e === 2) {
    pageData.e = pageData.e + 1;
  }
  if (!pageData) throw new Error("Not Found");

  // 🔹 Fetch Quran & Translation secara parallel untuk mempercepat
  const [verses, trans, tafsir, listSurah] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation(translationSource) : Promise.resolve([]),
    showTafsir ? getTranslation("tafsir-kemenag") : Promise.resolve([]),
    getSurah(),
  ]);

  const juzIndex = qmeta.juzPages.findIndex(d =>
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
  if (index < 1 || index > 114) {
    console.warn(
      `Invalid index number: ${index}. Must be between 1 and 114.`,
    );
    initial_page = 1;
  }
  // 🔹 Fetch Quran & Translation secara parallel untuk mempercepat
  const [verses, trans, tafsir,listSurah] = await Promise.all([
    getDataStyle(style),
    translation ? getTranslation(translationSource) : Promise.resolve([]),
    showTafsir ? getTranslation("tafsir-kemenag") : Promise.resolve([]),
    getSurah(),
  ]);
  //
  const surahData = listSurah.find(d => d.index == index);

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
      const updatedProgress = (() => {
        if (!entry.progress || entry.progress.length === 0) return readItems;

        const lastItem = Math.max(...entry.progress); // Ambil item terakhir
        const sortedReadItems = readItems.sort((a, b) => a - b); // Urutkan jika perlu

        const filteredItems = sortedReadItems.filter((item, index) => {
          if (index === 0) return item === lastItem + 1; // Hanya terima jika langsung setelah lastItem
          return item === sortedReadItems[index - 1] + 1; // Harus urut setelah item sebelumnya
        });

        // return [...entry.progress, ...filteredItems];
        const t = new Set([...entry.progress, ...filteredItems]);

        return Array.from(t);
      })();

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

const fontMapping = {
  "font-indopak": "indopak",
  "font-kemenag": "kemenag",
  "font-uthmani-v2-reguler": "imlaei",
  "font-uthmani-v2-bold": "imlaei",
  "font-uthmani-hafs": "uthmani",
  "font-uthmani-hafs-simple": "uthmani-simple",
};
export function getFontStyle(fontStyle: keyof typeof fontMapping) {
  return fontMapping[fontStyle] || "kemenag";
}
