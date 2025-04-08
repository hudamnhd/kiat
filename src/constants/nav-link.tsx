import {
  Activity,
  Search,
  Book,
  Bookmark,
  BookOpen,
  Calculator,
  Circle,
  Heart,
  Info,
  type LucideProps,
  Puzzle,
  Star,
  Sun,
  Timer,
} from "lucide-react";
import React from "react";

export type NavigationLink = {
  title: string;
  href: string;
  description: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

const quranNavigationLink: NavigationLink[] = [
  {
    title: "Daftar Surat",
    href: "/muslim/quran",
    description: "Al Qur'an dilengkapi terjemahan dan tafsir",
    icon: Book,
  },
  {
    title: "Al Qur'an Per Juz",
    href: "/muslim/quran-v1/1",
    description: "Al Qur'an untuk focus baca",
    icon: Book,
  },
  {
    title: "Cari kata dari terjemahan",
    href: "/muslim/quran/search",
    description: "Pencarian kata dari terjemahan berbagai sumber",
    icon: Search,
  },
  {
    title: "Susun Ayat",
    href: "/muslim/quran-word-by-word",
    description: "Permainan susun kata quran",
    icon: Puzzle,
  },
];

const muslimNavigationLink: NavigationLink[] = [
  {
    title: "Al Qur'an",
    href: "/quran",
    description: "Al Qur'an menu",
    icon: Book,
  },
  {
    title: "Sholawat",
    href: "/muslim/sholawat",
    description: "Kumpulan sholawat",
    icon: Heart,
  },
  {
    title: "Dzikir",
    href: "/muslim/dzikir",
    description: "Dzikir pagi dan petang",
    icon: BookOpen,
  },
  {
    title: "Tahlil",
    href: "/muslim/tahlil",
    description: "Tahlil dan doa",
    icon: Circle,
  },
  {
    title: "Kumpulan Do'a",
    href: "/muslim/doa",
    description: "Kumpulan do'a berbagai sumber",
    icon: Sun,
  },
];

const toolsNavigationLink: NavigationLink[] = [
  {
    title: "Kalkulator",
    href: "/alat/calculator",
    description: "Kalkulator penjumlahan sederhana",
    icon: Calculator,
  },
  {
    title: "Pomodoro",
    href: "/alat/pomodoro",
    description: "Timer",
    icon: Timer,
  },
  {
    title: "Penanda",
    href: "/muslim/bookmarks",
    description: "Daftar penanda ayat",
    icon: Star,
  },
  {
    title: "Tentang Aplikasi",
    href: "/about",
    description: "Tentang Kiat Aplikasi",
    icon: Info,
  },
];

export { quranNavigationLink, muslimNavigationLink, toolsNavigationLink };
