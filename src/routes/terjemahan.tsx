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

function formatList(text: string) {
  return text
    .replace(/\--(.*?)--/g, " ($1) ")
    .replace(/a+\.+\s+s+./g, "a.s.")
    .replace(/\[\[(.*?)\]\]/g, "$1")
    .replace(
      /([;:.])+\s+(\d|\w)+[.]\s+([A-Z|a-z])/g,
      "$1\n\n$2. $3",
    )
    .replace(/(.{200,}?[\.\!\?])\s+/g, "$1\n\n")
    .replace(/(\d+)\s*~\s*(.*?)\s*~\s+/g, "($1) $2.\n")
    .replace(/(\d+)\s*~\s*(.*?)\s*~/g, "($1) $2")
    .replace(/Pendahuluan:+\s+/g, "\nPendahuluan:\n");
}
export function Component() {
  const [test, settest] = React.useState(null);
  React.useEffect(() => {
    const getSurahByPage = async () => {
      const t = await getTranslation();
      const m = t.map((d) => {
        const vk = d.vk.split(":")[1];
        return {
          i: d.i,
          vk: d.vk,
          ...(vk == "1" ? { d: formatList(d.d) } : {}),
          t: d.t.replace(/\--(.*?)--/g, " ($1) "),
        };
      });
      settest(m);
    };

    getSurahByPage();
  }, []);

  return (
    <div className="w-full m-10 max-w-xl">
      <DownloadComponent name="translation_id" data={test} />
      {test && test.length}
      <pre className="text-sm">{JSON.stringify(test, null, 2)}</pre>
      {
        /*{test &&
        test.map((d) => (
          <div className="border-b prose prose-xl dark:prose-invert max-w-none  whitespace-pre-wrap mb-2">
            {d.vk}
            {d.d}
          </div>
        ))}*/
      }
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

// this history i'm learned regex
const fixTypography = (text: string): string => {
  return text
    // Tambahkan paragraf baru setelah titik, tanda tanya, atau tanda seru diikuti oleh teks baru
    .replace(/([.!?])\s*(\w)/g, (_, p1, p2) => `${p1}\n\n${p2.toUpperCase()}`)
    // Tambahkan break line untuk pola list (1., -, atau *)
    .replace(/(?:^|\n)(\d+\.\s|\-\s|\*\s)(.+)/g, (_, p1, p2) => `\n${p1}${p2}`)
    // Hapus spasi berlebihan
    .replace(/\s{2,}/g, " ")
    // Hapus newline berlebih (jika ada banyak \n berturut-turut)
    .replace(/\n{3,}/g, "\n\n")
    // Hilangkan spasi sebelum tanda baca
    .replace(/\s+([.,!?])/g, "$1")
    // Uppercase huruf pertama di paragraf
    .replace(/(^|\n)(\w)/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
};

const formatTranslationText = (text: string): string => {
  return text
    // Tambahkan paragraf baru setelah kata-kata transisi/topik baru
    .replace(
      /\b(kemudian|selanjutnya|sebagai khatimah|di sela-sela|disebut pula)\b/gi,
      "\n\n$1",
    )
    // Tambahkan newline setelah nama tokoh atau peristiwa penting
    .replace(
      /\b(Mûsâ a\.s\.|Banû Isrâ'îl|Ibrâhîm a\.s\.|Ismâ'îl a\.s\.|Yahudi|Nasrani|Ahl al-Qur'ân)\b/gi,
      "\n$1",
    )
    // Pisahkan daftar dengan newline (untuk kata seperti "seperti" dan "antara lain")
    .replace(/\b(seperti|antara lain)\b/gi, "\n$1")
    // Tambahkan newline jika kalimat terlalu panjang (>120 karakter)
    .replace(/(.{120,}?[\.\!\?])\s+/g, "$1\n\n")
    // Hapus spasi berlebihan sebelum tanda baca
    .replace(/\s+([.,!?])/g, "$1")
    // Trim spasi di awal dan akhir setiap paragraf
    .replace(/^\s+|\s+$/gm, "");
};

// "$1\n\n$2. $3-4$4-5$5",
// function formatList(text: string) {
//   return text
//     .replace(/a+\.+\s+s+./g, "a.s.")
//     .replace(/\[\[(.*?)\]\]/g, "$1")
//     .replace(
//       /([;:.])+\s+(\d|\w)+[.]\s+([A-Z|a-z])/g,
//       "$1\n\n$2. $3",
//     )
//     .replace(/(.{200,}?[\.\!\?])\s+/g, "$1\n\n");
//   // .replace(/\.+\s+(\d|\w)+[.]/g, ".\n$1.")
//   // .replace(/\:+\s+(\d|\w)+[.]/g, ":\n$1."); // Hapus bagian [[ ... ]]
//   // .replace(/([a-z]\.)\s+/gi, "-$1 ") // Tambahkan newline sebelum list huruf
//   // .replace(/(\d+)\.\s+/g, "\n$1. "); // Tambahkan newline sebelum list angka
//   // .replace(/([.!?])\s+(?=[A-Z])/g, "$1\n\n"); // Pisahkan paragraf berdasarkan titik diikuti huruf besar
// }

function fixDescription(text: string): string {
  // 🔹 1. Hapus hanya `[[` dan `]]`, tetapi pertahankan isinya
  return text.trim();
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\[\[(.*?)\]\]/g, "$1");

  // 🔹 2. Ganti "XXX ~ Kalimat ~" dengan "XXX. Kalimat."
  text = text.replace(/(\d+)\s*~\s*(.*?)\s*~/g, "$1. $2.");
  text = text.replace(/([;:])\s*/g, "$1\n\n");
  text = text.replace(/\--(.*?)--/g, " ($1) ");
  text = text.replace(
    /(.{120,}?[\.\!\?])(?!\s?[a-zA-Z]\.|a\.s\.)\s+/g,
    "$1\n\n",
  );
  text = text.replace(/([^\n])\s*([a-z]+:)/g, "\n$1$2");

  return text.trim();
}
