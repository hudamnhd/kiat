import {
  Activity,
  Book,
  Bookmark,
  BookOpen,
  Calculator,
  Circle,
  Heart,
  List,
  type LucideProps,
  Puzzle,
  Repeat,
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
    title: "Bookmarks",
    href: "/muslim/bookmarks",
    description: "List Bookmark ayah, doa and anymore.",
    icon: Star,
  },
  {
    title: "Al Qur'an",
    href: "/muslim/quran",
    description: "Temukan ketenangan melalui ayat-ayat Al Qur'an.",
    icon: Book,
  },
  {
    title: "Sholawat",
    href: "/muslim/sholawat",
    description: "Dekatkan diri dengan Rasulullah melalui sholawat.",
    icon: Heart,
  },
  {
    title: "Dzikir",
    href: "/muslim/dzikir",
    description: "Hiasi hari dengan dzikir dan ingat Allah selalu.",
    icon: BookOpen,
  },
  {
    title: "Tahlil",
    href: "/muslim/tahlil",
    description: "Doakan yang tercinta dengan tahlil penuh makna.",
    icon: Circle,
  },
  {
    title: "Kumpulan Do'a",
    href: "/muslim/doa",
    description: "Awali hari dengan doa untuk keberkahan hidup.",
    icon: Sun,
  },
  {
    title: "Do'a Sehari-hari",
    href: "/muslim/doa-sehari-hari",
    description: "Awali hari dengan doa untuk keberkahan hidup.",
    icon: Activity,
  },
  {
    title: "Game Al Qur'an",
    href: "/muslim/quran-word-by-word",
    description: "Game susun kata setiap ayat quran",
    icon: Puzzle,
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
    title: "Daily tasks",
    href: "/alat/daily-tasks",
    description: "Todo list dengan timer",
    icon: List,
  },
  {
    title: "Pomodoro",
    href: "/alat/pomodoro",
    description: "Timer",
    icon: Timer,
  },
  {
    title: "Habit",
    href: "/alat/habit",
    description: "Pelacak Kebiasaan",
    icon: Repeat,
  },
];

export { muslimNavigationLink, toolsNavigationLink };
