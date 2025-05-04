export const DEFAULT_PREFS = {
  fontStyle: "font-kemenag",
  fontWeight: "400",
  fontSize: "text-3xl",
  fontTranslationSize: "text-base",
  showTranslation: "on",
  translationSource: "kemenag",
  showLatin: "on",
  showTafsir: "off",
  modeQuran: "page",
};

export const FONT_WEIGHT = [
  { value: "400", label: "Normal" },
  { value: "700", label: "Bold" },
];

export const FONT_STYLE = [
  { value: "font-kemenag", label: "LPMQ Kemenag" },
  { value: "font-indopak", label: "Indopak" },
  { value: "font-uthmani-hafs", label: "Uthmani" },
  { value: "font-uthmani-hafs-simple", label: "Uthmani Simple" },
  { value: "font-uthmani-v2-reguler", label: "KFGQPC Hafs" },
  { value: "font-uthmani-v2-bold", label: "KFGQPC Hafs Bold" },
];

export const FONT_SIZE = [
  {
    label: "text-xl",
    fontSize: "1.25rem",
    lineHeight: "2.75rem",
  },
  {
    label: "text-2xl",
    fontSize: "1.5rem",
    lineHeight: "3.5rem",
  },
  {
    label: "text-3xl",
    fontSize: "1.875rem",
    lineHeight: "4.2rem",
  },
  {
    label: "text-4xl",
    fontSize: "2.25rem",
    lineHeight: "5.5rem",
  },
  {
    label: "text-5xl",
    fontSize: "3rem",
    lineHeight: "7rem",
  },
  {
    label: "text-6xl",
    fontSize: "3.75rem",
    lineHeight: "8rem",
  },
];

export const FONT_TRANSLATION_SIZE = [
  {
    label: "text-sm",
  },
  {
    label: "text-base",
  },
  {
    label: "text-lg",
  },
  {
    label: "text-xl",
  },
  {
    label: "text-2xl",
  },
];
