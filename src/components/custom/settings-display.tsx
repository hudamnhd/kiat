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
  fontOptions,
  fontSizeOpt,
  fontTransSizeOpt,
  fontTypeOptions,
} from "#src/constants/prefs";

const preBismillah = {
  text: {
    ar:
      "\ufeff\u0628\u0650\u0633\u0652\u0645\u0650\u0020\u0627\u0644\u0644\u0651\u064e\u0647\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650",
    read: "Bismillāhir-raḥmānir-raḥīm(i). ",
  },
  translation: {
    id: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
  tafsir: {
    text: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },
};

export function SettingsDisplay() {
  const loaderRoot = useRouteLoaderData<typeof Loader>("muslim");

  const opts = loaderRoot?.opts;

  const fetcher = useFetcher();
  // Mengelola state untuk font weight
  const [fontType, setFontType] = React.useState<string>(
    opts?.font_type || "font-kemenag",
  ); // Default ke "Normal"
  const [fontWeight, setFontWeight] = React.useState<string>(
    opts?.font_weight || "400",
  ); // Default ke "Normal"
  const [fontSize, setFontSize] = React.useState<string>(
    opts?.font_size || "text-2xl",
  ); // Default ke "Normal"
  const [fontTransSize, setFontTransSize] = React.useState<string>(
    opts?.font_trans_size || "text-md",
  ); // Default ke "Normal"
  let showTranslation = opts?.font_translation === "on" ? true : false; // Default ke "Normal"
  let showLatin = opts?.font_latin === "on" ? true : false; // Default ke "Normal"

  const font_size_opts = fontSizeOpt.find((d) => d.label === fontSize);
  const sm = window.innerWidth >= 640;
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
            {...(sm ? { side: "right" } : {})}
            {...(!sm
              ? { className: "sm:max-w-[425px] max-h-[95vh] overflow-y-auto" }
              : {})}
          >
            {({ close }) => (
              <>
                <fetcher.Form method="post" action="/muslim">
                  <DialogHeader>
                    <DialogTitle>Pengaturan Tampilan</DialogTitle>
                    <DialogDescription>
                      Kelola pengaturan tampilan Anda di sini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <div className="space-y-4 w-full">
                      <div>
                        <div dir="rtl" className="break-normal pr-2.5">
                          <div
                            className={cn(
                              "text-primary my-3 font-kemenag transition-all duration-300",
                              fontType,
                            )}
                            style={{
                              fontWeight: fontWeight,
                              fontSize: font_size_opts?.fontSize || "1.5rem",
                              lineHeight: font_size_opts?.lineHeight ||
                                "3.5rem",
                            }}
                          >
                            {preBismillah.text.ar}
                          </div>
                        </div>

                        {opts?.font_translation === "on" && (
                          <div
                            className={cn(
                              "text-slate-700 dark:text-slate-300 px-2 text-justify max-w-none  whitespace-pre-wrap mb-2",
                              fontTransSize,
                            )}
                          >
                            {preBismillah.translation.id} (1)
                          </div>
                        )}
                      </div>
                      <Select
                        className="w-full"
                        placeholder="Select an font"
                        name="font_type"
                        selectedKey={fontType}
                        onSelectionChange={(selected) =>
                          setFontType(selected as string)}
                      >
                        <Label>Jenis Huruf</Label>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectPopover>
                          <SelectListBox>
                            {fontTypeOptions.map((option) => (
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
                      <div className="grid grid-cols-2 gap-x-4">
                        <Select
                          className="w-full"
                          placeholder="Select an font"
                          name="font_weight"
                          selectedKey={fontWeight}
                          onSelectionChange={(selected) =>
                            setFontWeight(selected as string)}
                        >
                          <Label>Ketebalan Huruf</Label>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopover>
                            <SelectListBox>
                              {fontOptions.map((option) => (
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
                          name="font_size"
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
                              {fontSizeOpt.map((option) => (
                                <SelectItem
                                  key={option.label}
                                  id={option.label}
                                  textValue={option.label}
                                >
                                  <span className="capitalize">
                                    {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectListBox>
                          </SelectPopover>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4">
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
                            name="font_translation"
                            id="translationtext"
                            defaultSelected={showTranslation}
                          />
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
                            name="font_latin"
                            defaultSelected={showLatin}
                          />
                        </div>
                      </div>

                      <Select
                        className="w-full"
                        placeholder="Select an font"
                        name="font_trans_size"
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
                            {fontTransSizeOpt.map((option) => (
                              <SelectItem
                                key={option.label}
                                id={option.label}
                                textValue={option.label}
                              >
                                <span className="">
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectListBox>
                        </SelectPopover>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex flex-col -mt-1">
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
