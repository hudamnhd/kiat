import { Button } from "#src/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "#src/components/ui/dialog";
import { Label } from "#src/components/ui/label";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "#src/components/ui/select";
import { Switch } from "#src/components/ui/switch";
import type { Loader } from "#src/routes/muslim.data";
import { cn } from "#src/utils/misc";
import { Save, Settings2, X } from "lucide-react";
import React from "react";
import { useFetcher, useRouteLoaderData } from "react-router";

import {
  FONT_SIZE,
  FONT_STYLE,
  FONT_TRANSLATION_SIZE,
  FONT_WEIGHT,
} from "#src/constants/prefs";
import { SOURCE_TRANSLATIONS } from "#src/constants/sources";

const preBismillah = {
  text: {
    "font-uthmani-hafs-simple": "بسم الله الرحمن الرحيم",
    "font-uthmani-hafs": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    "font-indopak": "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ ۟",
    "font-kemenag": "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
    "font-uthmani-v2-reguler": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "font-uthmani-v2-bold": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  },
  read: "Bismillāhir-raḥmānir-raḥīm(i). ",
  translation: {
    id: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
  tafsir: {
    text: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
};

type FontType = keyof typeof preBismillah.text;

export function SettingsDisplay() {
  const loaderRoot = useRouteLoaderData<typeof Loader>("muslim");

  const opts = loaderRoot?.opts;

  const fetcher = useFetcher();
  const [fontType, setFontType] = React.useState<FontType>(
    opts?.fontStyle as FontType,
  );
  const [fontWeight, setFontWeight] = React.useState<string>(
    opts?.fontWeight || "400",
  );
  const [fontSize, setFontSize] = React.useState<string>(
    opts?.fontSize || "text-2xl",
  );
  const [fontTransSize, setFontTransSize] = React.useState<string>(
    opts?.fontTranslationSize || "text-md",
  );
  const [translationSource, setSourceTranslation] = React.useState<string>(
    opts?.translationSource || "kemenag",
  );
  // const [modeQuran, setModeQuran] = React.useState<string>(
  //   opts?.modeQuran || "page",
  // );
  let showTranslation = opts?.showTranslation === "on" ? true : false; // Default ke "Normal"
  let showLatin = opts?.showLatin === "on" ? true : false; // Default ke "Normal"
  let showTafsir = opts?.showTafsir === "on" ? true : false; // Default ke "Normal"

  const prefsOption = FONT_SIZE.find((d) => d.label === fontSize);
  const sm = window.innerWidth >= 640;
  const translation_opts = SOURCE_TRANSLATIONS.find((d) =>
    d.id === translationSource
  );

  // {...(!sm
  //   ? { className: "sm:max-w-[425px] max-h-[95vh] overflow-y-auto" }
  //   : { className: "p-0" })}
  return (
    <React.Fragment>
      <DialogTrigger>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="bg-transparent"
          title="Pengaturan Tampilan"
        >
          <Settings2 size={20} />
        </Button>
        <DialogOverlay>
          <DialogContent
            className="p-0 h-fit sm:h-auto"
            {...(sm ? { side: "right" } : { side: "bottom" })}
          >
            {({ close }) => (
              <>
                <fetcher.Form method="post" action="/muslim">
                  <DialogHeader className="p-4">
                    <DialogTitle>Pengaturan Tampilan</DialogTitle>
                    <DialogDescription>
                      Kelola pengaturan tampilan Anda di sini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 h-[calc(100vh-250px)] overflow-y-auto px-4">
                    <div className="space-y-4 w-full">
                      <div>
                        <div dir="rtl" className="break-normal pr-2.5">
                          <div
                            className={cn(
                              "my-3 font-kemenag transition-all duration-300",
                              fontType,
                            )}
                            style={{
                              fontWeight: fontWeight,
                              fontSize: prefsOption?.fontSize || "1.5rem",
                              lineHeight: prefsOption?.lineHeight ||
                                "3.5rem",
                            }}
                          >
                            {preBismillah.text[fontType]}
                          </div>
                        </div>

                        {opts?.showTranslation === "on" && (
                          <div
                            className={cn(
                              "text-slate-700 dark:text-slate-300 px-2 text-justify max-w-none whitespace-pre-line mb-2",
                              fontTransSize,
                            )}
                          >
                            {preBismillah.translation.id} (1)
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <Select
                          className="w-full"
                          placeholder="Select an font"
                          name="fontStyle"
                          selectedKey={fontType}
                          onSelectionChange={(selected) =>
                            setFontType(selected as FontType)}
                        >
                          <Label>Jenis Huruf Arab</Label>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopover>
                            <SelectListBox>
                              {FONT_STYLE.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  id={option.value}
                                  textValue={option.value}
                                >
                                  <span style={{ fontWeight: option.value }}>
                                    {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectListBox>
                          </SelectPopover>
                        </Select>
                        <Select
                          className="w-full"
                          placeholder="Select an font"
                          name="fontWeight"
                          selectedKey={fontWeight}
                          onSelectionChange={(selected) =>
                            setFontWeight(selected as string)}
                        >
                          <Label>Ketebalan Huruf Arab</Label>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopover>
                            <SelectListBox>
                              {FONT_WEIGHT.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  id={option.value}
                                  textValue={option.value}
                                >
                                  <span style={{ fontWeight: option.value }}>
                                    {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectListBox>
                          </SelectPopover>
                        </Select>
                      </div>
                      <div className="grid gap-3">
                        <Select
                          className="w-full"
                          placeholder="Select an font"
                          name="fontSize"
                          selectedKey={fontSize}
                          onSelectionChange={(selected) =>
                            setFontSize(selected as string)}
                        >
                          <Label>Ukuran Huruf Arab</Label>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopover>
                            <SelectListBox>
                              {FONT_SIZE.map((option) => (
                                <SelectItem
                                  key={option.label}
                                  id={option.label}
                                  textValue={option.label}
                                >
                                  <span className="uppercase">
                                    {option.label.replace("text-", "")}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectListBox>
                          </SelectPopover>
                        </Select>

                        <Select
                          className="w-full"
                          placeholder="Select an font"
                          name="fontTranslationSize"
                          selectedKey={fontTransSize}
                          onSelectionChange={(selected) =>
                            setFontTransSize(selected as string)}
                        >
                          <Label>Ukuran Huruf Terjemahan</Label>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopover>
                            <SelectListBox>
                              {FONT_TRANSLATION_SIZE.map((option) => (
                                <SelectItem
                                  key={option.label}
                                  id={option.label}
                                  textValue={option.label}
                                >
                                  <span className="uppercase">
                                    {option.label.replace("prose-", "")}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectListBox>
                          </SelectPopover>
                        </Select>
                      </div>

                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="translationtext"
                            className="flex flex-col space-y-0.5"
                          >
                            <span>Terjemahan</span>
                            <span className="font-normal text-xs leading-snug text-muted-foreground truncate">
                              {showTranslation
                                ? "Ditampilkan"
                                : "Disembunyikan"}
                            </span>
                          </Label>
                          <Switch
                            name="showTranslation"
                            id="translationtext"
                            defaultSelected={showTranslation}
                          />
                        </div>

                        <div>
                          <Select
                            className="w-full"
                            placeholder="Pilih Terjemahan"
                            name="translationSource"
                            selectedKey={translationSource}
                            onSelectionChange={(selected) =>
                              setSourceTranslation(selected as string)}
                          >
                            <Label>Sumber Terjemahan</Label>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectPopover>
                              <SelectListBox>
                                {SOURCE_TRANSLATIONS.slice(0, 3).map((
                                  option,
                                ) => (
                                  <SelectItem
                                    key={option.id}
                                    id={option.id}
                                    textValue={option.id}
                                  >
                                    <span>
                                      {option.title}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectListBox>
                            </SelectPopover>
                          </Select>
                          <p className="text-xs mt-2 text-muted-foreground">
                            {translation_opts?.name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="latintext"
                            className="flex flex-col space-y-0.5"
                          >
                            <span>
                              Latin{" "}
                              <span className="font-normal text-xs leading-snug text-muted-foreground truncate">
                                (jika ada)
                              </span>
                            </span>
                            <span className="font-normal text-xs leading-snug text-muted-foreground truncate">
                              {showLatin
                                ? "Ditampilkan"
                                : "Disembunyikan"}
                            </span>
                          </Label>
                          <Switch
                            id="latintext"
                            name="showLatin"
                            defaultSelected={showLatin}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="tafsirtext"
                            className="flex flex-col space-y-0.5"
                          >
                            <span>
                              Tafsir{" "}
                              <span className="font-normal text-xs leading-snug text-muted-foreground truncate">
                                (Hanya ada di Alquran)
                              </span>
                            </span>
                            <span className="font-normal text-xs leading-snug text-muted-foreground truncate">
                              {SOURCE_TRANSLATIONS[3].title} {showTafsir
                                ? "Ditampilkan"
                                : "Disembunyikan"}
                            </span>
                          </Label>
                          <Switch
                            id="tafsirtext"
                            name="showTafsir"
                            defaultSelected={showTafsir}
                          />
                        </div>
                      </div>
                    </div>
                    {
                      /*<Select
                      className="w-full"
                      placeholder="Pilih mode"
                      name="modeQuran"
                      selectedKey={modeQuran}
                      onSelectionChange={(selected) =>
                        setModeQuran(selected as string)}
                    >
                      <Label>Mode Tampilan</Label>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopover>
                        <SelectListBox>
                          {["page", "surah"].map((option) => (
                            <SelectItem
                              key={option}
                              id={option}
                              textValue={option}
                            >
                              <span className="capitalize">
                                {option}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectListBox>
                      </SelectPopover>
                    </Select>*/
                    }
                  </div>
                  <DialogFooter className="flex flex-col py-2 px-4">
                    <Button
                      onPress={close}
                      variant="outline"
                      className="w-full"
                    >
                      <X /> Batal
                    </Button>
                    <Button
                      onPress={() => {
                        close();
                      }}
                      type="submit"
                      className="w-full"
                    >
                      <Save /> Save
                    </Button>
                  </DialogFooter>
                </fetcher.Form>
              </>
            )}
          </DialogContent>
        </DialogOverlay>
      </DialogTrigger>
    </React.Fragment>
  );
}
