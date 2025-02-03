import Imlaei from "#/src/constants/imlaei.json";
import { pageAyahs } from "#/src/constants/quran-metadata.ts";
import UTHMANISIMPLE from "#/src/constants/uthmani_simple.json";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import { hasMatch, positions, score } from "fzy.js";
import ky from "ky";
import lodash from "lodash";
import { Search as SearchIcon, Star } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";

const getVersesByPage = (pageNumber: number) => {
  const pageData = pageAyahs.find(p => p.p === pageNumber);
  if (!pageData) return [];

  return UTHMANISIMPLE.verses.filter(verse =>
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
  indopak: "/muslim/quran/data/indopak_style.json.gz",
  kemenag: "/muslim/quran/data/kemenag_style.json.gz",
  uthmani: "/muslim/quran/data/uthmani_style.json.gz",
  imlaei: "/muslim/quran/data/imlaei_style.json.gz",
};

async function getDataStyle(style: string) {
  const cachedDataKey = `data-${style}`;
  const cachedData = await get_cache(cachedDataKey) as Ayah[] | null;

  if (cachedData) {
    console.log(`✅ Cache hit: ${cachedDataKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss: Fetching ${cachedDataKey} from API...`);
  const fetchedData = await ky.get(`/muslim/quran/data/${style}_style.json.gz`)
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
  const fetchedData = await ky.get("/muslim/quran/data/translation_id.json.gz")
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

export async function Loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const list_data = await getTranslation();
  const filter_data = list_data.filter((s) => hasMatch(query, s.t));
  // const sort_data = lodash.sortBy(filter_data, (s) => -score(query, s.t));

  const sliceData = filter_data.slice(0, 10);
  return sliceData;
}

export function Component() {
  const [test, settest] = React.useState(null);
  // React.useEffect(() => {
  //   const getSurahByPage = async () => {
  //     const t = await getTranslation();
  //     const m = t.map((d) => {
  //       const vk = d.vk.split(":")[1];
  //       return {
  //         i: d.i,
  //         vk: d.vk,
  //         ...(vk == "1" ? { d: formatList(d.d) } : {}),
  //         t: d.t.replace(/\--(.*?)--/g, " ($1) "),
  //       };
  //     });
  //     settest(m);
  //   };
  //
  //   getSurahByPage();
  // }, []);

  return (
    <div className="w-full m-10 max-w-xl">
      {/*<FzyTest />*/}
      {
        /*<DownloadComponent name="translation_id" data={test} />
      {test && test.length}
      <pre className="text-sm">{JSON.stringify(test, null, 2)}</pre>*/
      }
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
          {UTHMANISIMPLE.verses[0].text_indopak}
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

const FzyTest = () => {
  const fetcher = useFetcher();

  const [input, setInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const loadingIconRef = React.useRef<SVGSVGElement | null>(null);
  const searchIconRef = React.useRef<SVGSVGElement | null>(null);

  const handleSearch = React.useMemo(
    () =>
      lodash.debounce((value: string) => {
        // setQuery(value);
        loadingIconRef.current?.classList.add("hidden");
        searchIconRef.current?.classList.remove("hidden");

        fetcher.submit(
          { query: value },
          { method: "get", action: "/terjemahan" },
        );
      }, 500),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadingIconRef.current?.classList.remove("hidden");
    searchIconRef.current?.classList.add("hidden");
    setInput(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div>
      <div className="surah-index relative pb-1">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-hidden focus-visible:bg-muted/30 border-b w-full text-sm p-3 bg-background"
          placeholder="Cari"
          type="search"
          value={input}
          onChange={handleInputChange}
        />
        <SearchIcon
          ref={searchIconRef}
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute inset-y-3 start-3 peer-focus:rotate-90 text-muted-foreground/80 peer-disabled:opacity-50 duration-300"
        />
        <svg
          id="loading-icon"
          ref={loadingIconRef}
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden m-1 animate-spin text-foreground pointer-events-none absolute inset-y-2 start-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <pre className="text-sm">{JSON.stringify(fetcher.data, null, 2)}</pre>
    </div>
  );
};

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
