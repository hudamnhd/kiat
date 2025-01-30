import Imlaei from "#/src/constants/imlaei.json";
import Indopak from "#/src/constants/indopak.json";
import suraList from "#/src/constants/list-surah.json";
import { pageAyahs } from "#/src/constants/quran-metadata.ts";
import Uthmani from "#/src/constants/uthmani.json";
import { data as daftar_surat } from "#src/constants/daftar-surat.json";
import { totalmem } from "os";

const getVersesByPage = (pageNumber: number) => {
  // Cari data halaman berdasarkan pageNumber
  const pageData = pageAyahs.find(p => p.page === pageNumber);
  if (!pageData) return []; // Jika tidak ada, return array kosong

  // Filter berdasarkan rentang ID (firstAyah hingga lastAyah)
  return Indopak.verses.filter(verse =>
    verse.id >= pageData.firstAyah && verse.id <= pageData.lastAyah
  );
};

const daftarSuratMap = daftar_surat.reduce((acc, surah) => {
  const id = Number(surah.number);
  acc[id] = surah;
  return acc;
}, {} as Record<number, any>);

const mergedSurahList = suraList.map(surah => ({
  ...surah,
  // ...(daftarSuratMap[surah.index] || {}),
}));
const sampleMergedSurah = {
  "index": 1,
  "numberOfAyas": 7,
  "startAyahIndex": 0,
  "name": {
    "arabic": "الفاتحة",
    "english": "The Opener",
    "englishTranscription": "Al-Fatihah",
    "bosnian": "Pristup",
    "bosnianTranscription": "El-Fatiha",
  },
  "aboutSura": {
    "bosnian":
      "Obraćanje i usmjeravanje ka Allahu kroz obožavanje jedino Njega.",
  },
  "type": "Meccan",
  "orderInPublishing": 5,
  "numberOfWords": 29,
  "numberOfLetters": 142,
  "startJuz": 1,
  "endJuz": 1,
  "startPage": 1,
  "endPage": 1,
  "totalPages": 1,
  "audio_url":
    "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3",
  "name_en": "Al-Faatiha",
  "name_id": "Al-Fatihah",
  "name_long": "سُورَةُ ٱلْفَاتِحَةِ",
  "name_short": "الفاتحة",
  "number": "1",
  "number_of_verses": "7",
  "revelation": "مكة",
  "revelation_en": "Meccan",
  "revelation_id": "Makkiyyah",
  "sequence": "5",
  "tafsir":
    "Surat Al Faatihah (Pembukaan) yang diturunkan di Mekah dan terdiri dari 7 ayat adalah surat yang pertama-tama diturunkan dengan lengkap  diantara surat-surat yang ada dalam Al Quran dan termasuk golongan surat Makkiyyah. Surat ini disebut Al Faatihah (Pembukaan), karena dengan surat inilah dibuka dan dimulainya Al Quran. Dinamakan Ummul Quran (induk Al Quran) atau Ummul Kitaab (induk Al Kitaab) karena dia merupakan induk dari semua isi Al Quran, dan karena itu diwajibkan membacanya pada tiap-tiap sembahyang. Dinamakan pula As Sab'ul matsaany (tujuh yang berulang-ulang) karena ayatnya tujuh dan dibaca berulang-ulang dalam sholat.",
  "translation_en": "The Opening",
  "translation_id": "Pembukaan",
};

export function Component() {
  const surah1Verses = Indopak.verses.filter(verse =>
    verse.verse_key.startsWith("1:")
  );
  const newMapping = mergedSurahList.map((d) => {
    let obj = {
      ...d,
      name: {
        ...d.name,
        tr_id: daftarSuratMap[d.index].translation_id,
        tr_en: daftarSuratMap[d.index].translation_en,
      },
    };
    return obj;
  });
  console.warn(newMapping);

  return (
    <div className="w-full m-10">
      <DownloadComponent data={newMapping} />
      <pre className="text-sm">{JSON.stringify(newMapping, null, 2)}</pre>
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

const DownloadComponent = ({ data }) => {
  const downloadJson = () => {
    const jsonData = JSON.stringify(data, null, 2); // Format JSON dengan indentasi 2
    const blob = new Blob([jsonData], { type: "application/json" }); // Buat Blob
    const url = URL.createObjectURL(blob); // Buat URL dari Blob

    // Buat elemen <a> untuk trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "list-surah.json"; // Nama file yang akan didownload
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url); // Hapus URL dari memori setelah download
  };

  return <button onClick={downloadJson}>Download JSON</button>;
};
