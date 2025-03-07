export const SOURCE_TRANSLATIONS = [
  {
    id: "muntakhab",
    title: "Tafsir Muntakhab",
    name: "Muhammad Quraish Shihab et al",
    href: "https://tanzil.net/download",
  },
  {
    id: "jalalayn",
    title: "Tafsir Jalalayn",
    name: "Jalal ad-Din al-Mahalli and Jalal ad-Din as-Suyuti",
    href: "https://tanzil.net/download",
  },
  {
    id: "kemenag",
    title: "Terjemahan Kemenag",
    name: "Kementrian Agama Republik Indonesia",
    href: "https://github.com/rioastamal/quran-single-file",
  },
  {
    id: "tafsir-kemenag",
    title: "Tafsir Kemenag",
    name: "Kementrian Agama Republik Indonesia",
    href: "https://github.com/rioastamal/quran-single-file",
  },
];

const map_translation = SOURCE_TRANSLATIONS.map((d) => {
  return {
    title: d.title,
    desc: d.name,
    href: d.href,
  };
});

export const sources = {
  content: [
    {
      title: "Quran text",
      desc: "uthmani, imlaei",
      href: "https://api-docs.quran.com",
    },
    {
      title: "Quran text",
      desc: "kemenag",
      href: "https://github.com/rioastamal/quran-single-file",
    },
    {
      title: "Quran text",
      desc: "Indopak",
      href: "https://github.com/marwan/indopak-quran-text",
    },
    ...map_translation,
    {
      title: "Quran metadata",
      desc: "daftar surat, halaman, jus, dll",
      href: "https://www.jsdelivr.com/package/npm/@kmaslesa/quran-metadata",
    },
    {
      title: "Doa berbagai sumber",
      desc: "Rest API dari myquran.com",
      href: "https://api.myquran.com/v2/doa",
    },
    {
      title: "Sholawat",
      desc: "dari repositori Islamic Bit",
      href:
        "https://github.com/wahyall/islamic-bit/blob/main/sholawat/sholawat.json",
    },
    {
      title: "Sholawat",
      desc: "dari Buku Pesantren Al-Khirot",
      href: "https://alkhoirot.com/buku-islam/",
    },
    {
      title: "Dzikir",
      desc: "dari repositori Islamic Bit",
      href:
        "https://github.com/wahyall/islamic-bit/blob/main/sholawat/sholawat.json",
    },
    {
      title: "Tahlil",
      desc: "dari Islamic Api Zhirrr",
      href: "https://islamic-api-zhirrr.vercel.app/api/tahlil",
    },
  ],
  font: [
    {
      title: "LPMQ Isep Misbah",
      desc: "dari web Kemenag RI",
      href: "https://api-docs.quran.com",
    },
    {
      title: "Indopak",
      desc: "dari repositori Quran WBW",
      href: "https://github.com/qazasaz/quranwbw/tree/master/assets/fonts",
    },
    {
      title: "Uthmani",
      desc: "dari Repositori Quran WBW",
      href: "https://github.com/qazasaz/quranwbw/tree/master/assets/fonts",
    },
    {
      title: "KFGQPC Hafs Uthmanic",
      desc: "dari web Qurancomplex",
      href: "https://fonts.qurancomplex.gov.sa",
    },
  ],
  stack: [
    {
      title: "React.js",
      desc: "Library UI",
      href: "https://react.dev",
    },
    {
      title: "React Router",
      desc: "Library untuk mengatur routing dan juga fetching data",
      href: "https://developer.chrome.com/docs/workbox",
    },
    {
      title: "Tailwind",
      desc: "Framework CSS",
      href: "https://tailwindcss.com",
    },
    {
      title: "React Aria Components",
      desc: "Library komponent",
      href: "https://react-spectrum.adobe.com/react-aria/index.html",
    },
    {
      title: "Vite",
      desc: "Library alat pengembang",
      href: "https://vite.dev",
    },
    {
      title: "Vite PWA",
      desc: "Library untuk mendukung fitur PWA",
      href: "https://vite-pwa-org.netlify.app",
    },
    {
      title: "Workbox",
      desc: "Library untuk mendukung fitur PWA",
      href: "https://developer.chrome.com/docs/workbox",
    },
    {
      title: "React Virtual",
      desc: "Library untuk virtualisasi element",
      href: "https://tanstack.com/virtual/latest",
    },
    {
      title: "Lucide React",
      desc: "Library kumpulan icon svg",
      href: "https://lucide.dev",
    },
    {
      title: "Redux",
      desc: "Library manajement state",
      href: "https://redux.js.org",
    },
    {
      title: "Motion",
      desc: "Library animasi",
      href: "https://motion.dev",
    },
    {
      title: "Local forage",
      desc: "Library penyimpanan local",
      href: "https://github.com/localForage/localForage",
    },
    {
      title: "Fzy.js",
      desc: "Library fuzzy",
      href: "https://github.com/jhawthorn/fzy.js",
    },
    {
      title: "Flex Search",
      desc: "Library pencarian text panjang",
      href: "https://github.com/nextapps-de/flexsearch",
    },
    {
      title: "Jolly UI",
      desc: "Referensi komponent React Aria",
      href: "https://www.jollyui.dev",
    },
    {
      title: "Shadcn UI",
      desc: "Referensi tema dan komponent",
      href: "https://ui.shadcn.com",
    },
    {
      title: "Ky",
      desc: "Alternatif Fetch",
      href: "https://github.com/sindresorhus/ky",
    },
  ],
  deploy: [
    {
      title: "Netlify",
      desc: "Platform hosting gratis",
      href: "https://netlify.com",
    },
  ],
};
