import { Header } from "#src/components/custom/header";
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { Minus } from "lucide-react";
import { Button } from "react-aria-components";
import { Link, useNavigate } from "react-router";

const sources = {
  content: [
    {
      title: "Quran text",
      desc: "indopak, uthmani, imlaei",
      href: "https://api-docs.quran.com",
    },
    {
      title: "Quran text",
      desc: "kemenag",
      href: "https://github.com/rioastamal/quran-single-file",
    },
    {
      title: "Quran text",
      desc: "Indopak, Uthmani, Imlaei",
      href: "https://api-docs.quran.com",
    },
    {
      title: "Quran terjemahan",
      desc: "Muhammad Quraish Shihab et al",
      href: "https://tanzil.net/download",
    },
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
      desc: "Library",
      href: "https://react.dev",
    },
    {
      title: "React Router",
      desc: "Dependesi untuk mengatur routing dan juga fetching data",
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
      desc: "Dependesi alat pengembang",
      href: "https://vite.dev",
    },
    {
      title: "Vite PWA",
      desc: "Dependesi untuk mendukung fitur PWA",
      href: "https://vite-pwa-org.netlify.app",
    },
    {
      title: "Workbox",
      desc: "Dependesi untuk mendukung fitur PWA",
      href: "https://developer.chrome.com/docs/workbox",
    },
    {
      title: "React Virtual",
      desc: "Dependesi untuk virtualisasi element",
      href: "https://tanstack.com/virtual/latest",
    },
    {
      title: "Lucide React",
      desc: "Dependesi kumpulan icon svg",
      href: "https://lucide.dev",
    },
    {
      title: "Redux",
      desc: "Dependesi manajement state",
      href: "https://redux.js.org",
    },
    {
      title: "Motion",
      desc: "Dependesi animasi",
      href: "https://motion.dev",
    },
    {
      title: "Local forage",
      desc: "Dependesi penyimpanan local",
      href: "https://github.com/localForage/localForage",
    },
    {
      title: "Fzy.js",
      desc: "Dependesi fuzzy",
      href: "https://github.com/jhawthorn/fzy.js",
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

type Menu = typeof sources.content;

export function Component() {
  return (
    <div className="prose-base dark:prose-invert w-full max-w-xl mx-auto border-x">
      <Header redirectTo="/" title="Informasi" />

      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        Informasi
      </div>

      <dl className="divide-y border-t -mt-1">
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Developer
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">
            <Link to="https://www.linkedin.com/in/hudamnhd">Huda</Link>
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">Nama</dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">Kiat</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Deskripsi
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">
            Aplikasi sederhana untuk sehari-hari
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Sumber Konten
          </dt>
          <dd className="text-sm text-foreground">
            <List data={sources.content} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Huruf Arab
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            <List data={sources.font} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Stack dan Dependesi
          </dt>
          <dd className="text-sm text-foreground">
            <List data={sources.stack} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">Deploy</dt>
          <dd className="mt-1 text-sm pl-5">
            <List data={sources.deploy} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Components
          </dt>
          <dd className="mt-1 text-sm pl-5">
            <Link to="/components">Demo</Link>
          </dd>
        </div>
      </dl>
    </div>
  );
}

const List = ({ data }: { data: Menu }) => {
  const navigate = useNavigate();
  return (
    <div
      role="list"
      className="marker:text-muted-foreground list-disc list-inside"
    >
      {data.map((d, index: number) => (
        <div key={index} className="break-all line-clamp-1">
          <TooltipTrigger delay={300}>
            <Button
              onPress={() =>
                navigate(d.href)}
              className="prose prose-sm flex items-start justify-start text-start gap-x-1"
            >
              <Minus className="text-muted-foreground w-4 mr-1" />
              <span>
                <strong>{d.title}</strong>{" "}
                <span className="text-primary">{d.desc}</span>.
              </span>
            </Button>
            <Tooltip placement="bottom">
              <p>{d.href}</p>
            </Tooltip>
          </TooltipTrigger>
        </div>
      ))}
    </div>
  );
};
