import {
  Activity,
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

const muslimNavigationLink: NavigationLink[] = [
  {
    title: "Al Qur'an",
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
  {
    title: "Do'a Sehari-hari",
    href: "/muslim/doa-sehari-hari",
    description: "Kumpulan do'a sehari-hari",
    icon: Activity,
  },
  {
    title: "Susun Ayat",
    href: "/muslim/quran-word-by-word",
    description: "Permainan susun kata quran",
    icon: Puzzle,
  },
  {
    title: "Penanda",
    href: "/muslim/bookmarks",
    description: "Daftar penanda ayat",
    icon: Star,
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
    title: "Tentang Aplikasi",
    href: "/about",
    description: "Tentang Kiat Aplikasi",
    icon: Info,
  },
];

export { muslimNavigationLink, toolsNavigationLink };
