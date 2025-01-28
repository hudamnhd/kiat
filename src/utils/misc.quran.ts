import { get_cache, set_cache } from '#src/utils/cache-client.ts';

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
