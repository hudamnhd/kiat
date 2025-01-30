import Imlaei from "#/src/constants/imlaei.json";
import Indopak from "#/src/constants/indopak.json";
import { pageAyahs } from "#/src/constants/quran-metadata.ts";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import ky from "ky";

const getVersesByPage = (pageNumber: number) => {
  const pageData = pageAyahs.find(p => p.p === pageNumber);
  if (!pageData) return [];

  return Indopak.verses.filter(verse =>
    verse.id >= pageData.s && verse.id <= pageData.e
  );
};

type Ayah = {
  i: number;
  vk: string;
  t: string;
};

// 🔹 Object lookup untuk menggantikan switch-case
const styleUrls: Record<string, string> = {
  indopak: "/muslim/quran/gz/indopak_style.json.gz",
  kemenag: "/muslim/quran/gz/kemenag_style.json.gz",
  uthmani: "/muslim/quran/gz/uthmani_style.json.gz",
  imlaei: "/muslim/quran/gz/imlaei_style.json.gz",
};

async function getDataStyle(style: string) {
  const cachedDataKey = `data-${style}`;
  const cachedData = await get_cache(cachedDataKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedDataKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedDataKey} from API...`);
  const fetchedData = await ky.get(`/muslim/quran/gz/${style}_style.json.gz`)
    .json<Ayah[]>();

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
export function Component() {
  const [test, settest] = React.useState(null);
  React.useEffect(() => {
    const getSurahByPage = async (
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

      // 🔹 Filter ayat hanya untuk halaman tertentu
      const verseData = verses.filter(verse =>
        verse.i >= pageData.s && verse.i <= pageData.e
      );

      // 🔹 Filter translation hanya jika tersedia
      const transMap = new Map(trans.map(t => [t.i, t.t])); // Optimasi pencarian dengan Map()

      // 🔥 Merge ayat dengan translation (jika translation tersedia)
      // i : index
      // vk : verse key
      // ta : text arab
      // tt : text translation

      const final = verseData.map(verse => ({
        i: verse.i,
        vk: verse.vk,
        ta: verse.t,
        tt: transMap.get(verse.i) || null, // Ambil translation dari Map
      }));
      return final;
    };
    getSurahByPage({ page: 604, style: "indopak", translation: true });
  }, []);

  return (
    <div className="w-full m-10">
      <pre className="text-sm font">{JSON.stringify(test, null, 2)}</pre>
      {/*<DownloadComponent name="Imlaei" data={newMapping} />*/}
      {
        /*<div className="grid grid-cols-2 gap-10">
        <div className="font-indopak text-7xl">
          {Indopak.verses[0].text_indopak}
        </div>
        <div className="font-uthmani-hafs text-7xl">
          {Uthmani.verses[0].text_uthmani}
        </div>
        <div className="font-uthmani-hafs text-7xl">
          {Imlaei.verses[0].text_imlaei}
        </div>
      </div>*/
      }
      {/*<pre className="font-lpmq text-xl p-10">{JSON.stringify(getVersesByPage(1), null, 2)}</pre>*/}
    </div>
  );
}
import React from "react";

const Walpaper = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="text-8xl font-medium bg-black text-white px-2 rounded-lg">
        K
      </div>
    </div>
  );
};

const DownloadComponent = ({ data, name }) => {
  const downloadJson = () => {
    const jsonData = JSON.stringify(data, null, 2); // Format JSON dengan indentasi 2
    const blob = new Blob([jsonData], { type: "application/json" }); // Buat Blob
    const url = URL.createObjectURL(blob); // Buat URL dari Blob

    // Buat elemen <a> untuk trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`; // Nama file yang akan didownload
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // URL.revokeObjectURL(url); // Hapus URL dari memori setelah download
  };

  return <button onClick={downloadJson}>Download {name} JSON</button>;
};
