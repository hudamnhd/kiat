export const DEFAULT_PREFS = {
  fontStyle: "font-kemenag",
  fontWeight: "400",
  fontSize: "text-3xl",
  fontTranslationSize: "prose-base",
  showTranslation: "on",
  translationSource: "kemenag",
  showLatin: "on",
  showTafsir: "off",
  modeQuran: "page",
};

export const FONT_WEIGHT = [
  // { value: "100", label: "Thin" },
  // { value: "200", label: "Extralight" },
  // { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  // { value: "500", label: "Medium" },
  // { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  // { value: "800", label: "Extrabold" },
];

export const FONT_STYLE = [
  { value: "font-kemenag", label: "LPMQ Kemenag" },
  { value: "font-indopak", label: "Indopak" },
  { value: "font-uthmani-hafs", label: "Uthmani" },
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
    lineHeight: "4rem",
  },
  {
    label: "text-4xl",
    fontSize: "2.25rem",
    lineHeight: "5rem",
  },
  {
    label: "text-5xl",
    fontSize: "3rem",
    lineHeight: "6.5rem",
  },
  {
    label: "text-6xl",
    fontSize: "3.75rem",
    lineHeight: "7.5rem",
  },
];

export const FONT_TRANSLATION_SIZE = [
  {
    label: "prose-sm",
  },
  {
    label: "prose-base",
  },
  {
    label: "prose-lg",
  },
  {
    label: "prose-xl",
  },
  {
    label: "prose-2xl",
  },
];
