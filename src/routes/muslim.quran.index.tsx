import {
  FAVORITESURAH_KEY,
  LASTREAD_KEY,
  LASTREADSURAH_KEY,
  LASTVISITPAGE_KEY,
  PLANREAD_KEY,
} from "#/src/constants/key";
import { Header } from "#src/components/custom/header";
import NavigationSurah from "#src/components/custom/navigation-surah";
import { Button, buttonVariants } from "#src/components/ui/button";
import { Input } from "#src/components/ui/input";
import { Label } from "#src/components/ui/label";
import { JollyNumberFieldV2 } from "#src/components/ui/number-field";
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import { cn } from "#src/utils/misc";
import type { QuranReadingPlan } from "#src/utils/misc.quran.ts";
import {
  generateQuranReadingPlan,
  updateReadingProgress,
} from "#src/utils/misc.quran.ts";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Crosshair,
  Minus,
  MoveRight,
  Rocket,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, useFetcher, useLoaderData } from "react-router";

async function getLastReadAyah() {
  const cachedData = await getCache(LASTVISITPAGE_KEY) || [];
  if (cachedData.length > 0) {
    return cachedData.map((d: string) => {
      const surah_name = d.split("|")[0];
      const surah_index = d.split("|")[1];
      const ayah_index = d.split("|")[2];
      const page = d.split("|")[3];
      const juz = d.split("|")[4];
      // const title = `${surah_name} ${surah_index}:${ayah_index}`;
      const title = surah_name;
      let obj = {
        t: title, // title
        s: surah_index, // surah index
        a: ayah_index, // ayah index
        p: page, // page index
        j: juz, // page index
      };
      return obj;
    }).reverse();
  }
  return [];
}

export async function Loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  const data = {
    id,
    last_read_ayah_mark: await getCache(LASTREAD_KEY),
    plan_read: await getCache(PLANREAD_KEY) || [],
    favorite_surah: await getCache(FAVORITESURAH_KEY) || [],
    last_read_surah: await getCache(LASTREADSURAH_KEY) || {},
  };

  return data;
}
export async function Action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const _days = formData.get("days");
  const _start = formData.get("start");
  const _end = formData.get("end");
  const date = formData.get("date");
  const data = Object.fromEntries(formData);
  console.warn("DEBUGPRINT[21]: muslim.quran.index.tsx:92: data=", data);
  if (_days) {
    const days = Number(_days);
    const readingPlan = generateQuranReadingPlan(604, 114, days, "page"); // Target khatam dalam 30 hari, baca per halaman
    await saveTarget(readingPlan);
    return { success: true };
  } else if (_start) {
    const start = Number(_start);
    const end = _end ? Number(_end) : start;

    const rangeArray = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );

    const plan_read = (await getCache(PLANREAD_KEY)) || [];
    if (plan_read.length > 0) {
      const today = date ? date : format(new Date(), "yyyy-MM-dd");
      const progressToday = plan_read.find(
        (d: QuranReadingPlan) => d.date === today,
      );
      const validate = start >= progressToday.pages[0] &&
        start <= progressToday.pages[progressToday.pages.length - 1] &&
        end >= progressToday.pages[0] &&
        end <= progressToday.pages[progressToday.pages.length - 1];
      if (validate) {
        let target = updateReadingProgress(
          plan_read,
          progressToday.day,
          rangeArray,
        );
        await setCache(PLANREAD_KEY, target);
        toast.success("Sukses memperbarui data");
        return { success: true };
      } else {
        toast.error("Data tidak valid");
        return { success: false };
      }
    }
    // console.log(rangeArray);
    // let target = updateReadingProgress(plan_read, progressToday.day, [PAGE]);
    // await setCache(PLANREAD_KEY, target);
    return { success: false };
  }

  return { success: false };
}

import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "#src/components/ui/select";

export function Component() {
  const loaderData = useLoaderData<typeof Loader>();
  const target = loaderData.plan_read as QuranReadingPlan[];
  return (
    <React.Fragment>
      <Header redirectTo="/quran" title="Al Qur'an">
        <Link
          className={cn(
            buttonVariants({ size: "icon", variant: "ghost" }),
            "[&_svg]:size-4",
          )}
          to={`/muslim/quran-hafalan/1`}
          title="Qur'an Hafalan"
        >
          <BookOpenCheck />
        </Link>
      </Header>
      <React.Fragment>
        <Tabs
          defaultSelectedKey={target.length > 0 ? "target" : "surah"}
          className="w-full"
        >
          <TabList
            aria-label="Quran"
            className="surah-index grid grid-cols-3 border-b border-border text-sm"
          >
            <MyTab id="surah">Surah</MyTab>
            <MyTab id="lastopen">Riwayat</MyTab>
            <MyTab id="target">Target</MyTab>
          </TabList>
          <MyTabPanel id="surah">
            <LastRead />
            <NavigationSurah />
          </MyTabPanel>
          <MyTabPanel id="lastopen">
            <LastReadAyah />
          </MyTabPanel>
          <MyTabPanel id="target">
            <GoalsView />
            <Goals />
          </MyTabPanel>
        </Tabs>
      </React.Fragment>
    </React.Fragment>
  );
}

const VirtualizedListRecent: React.FC<
  {
    items: any[];
  }
> = (
  { items },
) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 62, // Perkiraan tinggi item (70px)
  });

  return (
    <React.Fragment>
      <div
        ref={parentRef}
        style={{
          height: `calc(100vh - 120px)`,
          overflow: "auto",
        }}
      >
        <div
          className="divide-y border-b"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const d = items[virtualRow.index];

            const to = `/muslim/quran/${d.p}?surah=${d.s}&ayah=${d.a}`;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="first:border-t group"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Link
                  to={to}
                  className="py-1.5 pl-3 pr-4 flex-1 flex items-center justify-between  hover:bg-muted group"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="text-2xl font-medium text-center min-w-10 h-10 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                      {d.s}
                    </div>
                    <div className="truncate -space-y-2">
                      <div className="flex text-sm items-center">
                        <p className="font-medium">
                          Surah {d.t}
                        </p>
                      </div>
                      <div className="mt-2 flex truncate">
                        <span className="flex-shrink-0 text-muted-foreground text-sm">
                          Juz' {d.j}
                        </span>
                        <Minus className="mx-1 w-2 scale-150" />
                        <span className="flex-shrink-0 text-muted-foreground text-sm">
                          Hal {d.p}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm">
                    {d.p}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

const LastRead = () => {
  const { last_read_ayah_mark } = useLoaderData<
    typeof Loader
  >();

  if (!last_read_ayah_mark) return null;

  return (
    <div className="surah-index">
      <Link
        to={last_read_ayah_mark.source}
        className="p-3 border-b flex items-center gap-x-3 bg-gradient-to-r from-background via-muted/50 to-muted"
      >
        <p className="text-sm">
          Lanjutkan Membaca <strong>{last_read_ayah_mark.title}</strong>
        </p>
        <MoveRight className={cn("h-4 w-4 bounce-left-right opacity-80")} />
      </Link>
    </div>
  );
};

const LastReadAyah = () => {
  const [lastReadAyah, setLastReadAyah] = useState([]);

  async function loadLastRead() {
    const data = await getLastReadAyah();
    setLastReadAyah(data);
  }

  React.useEffect(() => {
    loadLastRead();
  }, []);

  return (
    <>
      {lastReadAyah.length > 0
        ? (
          <div className="surah-index border-b py-1.5">
            <VirtualizedListRecent items={lastReadAyah} />
          </div>
        )
        : (
          <div className="py-6 text-center text-sm h-[calc(100vh-110px)] border-b flex items-center justify-center">
            Belum ada riwayat dibaca.
          </div>
        )}
    </>
  );
};

import type { TabPanelProps, TabProps } from "react-aria-components";
import {
  Button as ButtonRAC,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";

function MyTab(props: TabProps) {
  return (
    <Tab
      {...props}
      className={({ isSelected }) => `
        w-full py-2 font-medium text-center cursor-default outline-none transition-colors
        ${
        isSelected
          ? "border-b-2  border-primary  bg-background"
          : "text-muted-foreground hover:text-accent-foreground pressed:text-accent-foreground"
      }
      `}
    />
  );
}

function MyTabPanel(props: TabPanelProps) {
  return (
    <TabPanel
      {...props}
      className="outline-none"
    />
  );
}

function Goals() {
  const fetcher = useFetcher({ key: "create-plan" });
  const [rentang, setRentang] = React.useState<string>(
    "",
  );
  const [target, setTarget] = React.useState<string>(
    "",
  );
  const [result, setResult] = React.useState<QuranReadingPlan[] | []>(
    [],
  );
  const target_opts = rentang === "harian"
    ? [
      5,
      10,
      15,
      20,
      25,
    ]
    : rentang === "mingguan"
    ? [
      1,
      2,
      3,
    ]
    : rentang === "bulanan"
    ? [1, 2, 3, 4, 5, 10]
    : rentang === "halaman"
    ? [1, 2, 4, 6, 12]
    : rentang === "juz"
    ? [0.5, 1, 2, 3, 4, 5]
    : [];

  React.useEffect(() => {
    if (target !== "" && rentang !== "") {
      if (["harian", "mingguan", "bulanan"].includes(rentang)) {
        const days = getTotalDays(
          rentang as "harian" | "mingguan" | "bulanan",
          Number(target),
        );
        const readingPlan = generateQuranReadingPlan(604, 114, days, "page"); // Target khatam dalam 30 hari, baca per halaman
        setResult(readingPlan);
      } else {
        const days = rentang === "juz"
          ? 30 / Number(target)
          : rentang === "halaman"
          ? 604 / Number(target)
          : 0;
        const readingPlan = generateQuranReadingPlan(604, 114, days, "page"); // Target khatam dalam 30 hari, baca per halaman
        setResult(readingPlan);
      }
    }
  }, [target]);

  React.useEffect(() => {
    if (fetcher.data?.success) {
      setRentang("");
      setTarget("");
      setResult([]);
    }
  }, [fetcher.data]);

  return (
    <div className="max-w-3xl mx-auto text-start p-4">
      <h2 className="text-2xl sm:text-3xl font-extrabold">
        <span className="block">Bikin target baca Quran</span>
      </h2>
      <p className="mt-2 leading-6 text-muted-foreground">
        Yuk bikin target baca 10 menit sehari, menyelesaikan satu Juz dalam
        sebulan, atau menyelesaikan seluruh Al-Qur'an dalam setahun? Sangat
        mudah untuk membuat target dan melacak progress Anda.
      </p>

      <div className="grid gap-2 py-4">
        <div className="space-y-4 w-full">
          <div className="grid gap-4 py-4">
            <Select
              className="w-full"
              placeholder="Pilih rentang"
              name="rentang"
              selectedKey={rentang}
              onSelectionChange={(selected) => setRentang(selected as string)}
            >
              <Label>Rentang</Label>
              <SelectTrigger>
                <SelectValue className="capitalize" />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  {["halaman", "juz", "harian", "mingguan", "bulanan"].map((
                    option,
                  ) => (
                    <SelectItem
                      key={option}
                      id={option}
                      textValue={option}
                      className="capitalize"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectListBox>
              </SelectPopover>
            </Select>
            <Select
              className="w-full"
              placeholder="Pilih target"
              name="target"
              isDisabled={rentang === ""}
              selectedKey={target}
              onSelectionChange={(selected) => setTarget(selected as string)}
            >
              <Label>Target</Label>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  {target_opts.map((option) => (
                    <SelectItem
                      key={option}
                      id={option}
                      textValue={option.toString()}
                      className="capitalize"
                    >
                      {option === 0.5 ? "Setengah" : option}{" "}
                      {["harian", "mingguan", "bulanan"].includes(rentang)
                        ? rentang.replace("an", "")
                        : `${rentang} / hari`}
                    </SelectItem>
                  ))}
                </SelectListBox>
              </SelectPopover>
            </Select>
          </div>
        </div>
      </div>

      {result.length > 0 && <CalendarMonth plan={result} />}
    </div>
  );
}

function GoalsView() {
  const loaderData = useLoaderData<typeof Loader>();
  const target = loaderData.plan_read as QuranReadingPlan[];

  if (target.length === 0) return null;

  const targetLength = target.length;
  const totalTargetSessions = target.length;
  const total_sessions = target.filter((d) => d.completed).length;
  const today = format(new Date(), "yyyy-MM-dd");
  const progressToday = target.find((d) => d.date === today);

  const totalPagesProgress = target?.reduce(
    (sum, todo) => sum + (todo?.progress?.length ?? 0),
    0,
  );
  const totalPagesTarget = target?.reduce(
    (sum, todo) => sum + (todo?.pages?.length ?? 0),
    0,
  );
  const pages_length = progressToday?.pages?.length || 0;
  const progress_length = progressToday?.progress?.length || 0;
  const next_read = pages_length > 0
    ? progressToday?.pages?.[progress_length]
    : 0;
  const last_read = pages_length > 0
    ? progressToday?.pages?.[pages_length - 1]
    : 0;
  return (
    <div className="space-y-2 mt-3">
      <div className="max-w-3xl mx-auto text-start px-2 divide-y">
        <div className="mb-2">
          <div className="font-bold  px-2">
            Target
          </div>
          <dl className="sm:divide-y sm:divide-border border rounded-md my-2">
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 px-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Progress
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 font-medium">
                {totalPagesProgress} /{" "}
                <span className="font-medium">
                  {totalPagesTarget} Halaman
                </span>
              </dd>
            </div>
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 px-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Mulai
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {format(target[0].date, "PPPP", {
                  locale: localeId,
                })}
              </dd>
            </div>
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 px-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Khatam
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {format(target[target.length - 1].date, "PPPP", {
                  locale: localeId,
                })}
              </dd>
            </div>
          </dl>

          {!progressToday?.completed
            ? (
              <Link
                className={cn(
                  buttonVariants(),
                  "mb-2",
                )}
                to={`/muslim/quran/${next_read ?? 0}`}
                title={`Lanjut Baca Hal ${next_read ?? 0}`}
              >
                Lanjut Baca Hal {next_read ?? 0}
                <ArrowRight />
              </Link>
            )
            : (
              <div className="my-3">
                Alhamdulilah target hari ini sudah selesai.
                <br /> Biar <strong>istiqomah{" "}</strong>
                lanjut besok baca quran lagi.
              </div>
            )}
          <Label>
            Progress Harian{" "}
            <span className="text-muted-foreground font-semibold">
              ( {progressToday?.progress?.length} Hal )
            </span>
          </Label>
          <div
            style={{ animationDelay: `0.1s` }}
            className="animate-slide-top [animation-fill-mode:backwards] mb-3 rounded-md transition-all duration-500 ease-in-out text-sm"
          >
            <div className="relative h-8 w-full rounded-md bg-muted">
              <div
                className={cn(
                  "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md backdrop-blur-md bg-primary/10 px-2 transition-all duration-500 ease-in-out",
                  totalTargetSessions >= targetLength && "rounded-md",
                )}
                style={{
                  width: `${100}%`,
                }}
              >
                {progressToday?.pages?.length} Hal
                <Crosshair className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-chart-2 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
                  (progressToday?.progress?.length ?? 0) >=
                      (progressToday?.pages?.length ?? 0) &&
                    "rounded-md",
                )}
                style={{
                  width: `${
                    ((progressToday?.progress?.length ?? 0) /
                      (progressToday?.pages?.length ?? 0)) * 100
                  }%`,
                }}
              >
                <div
                  className="flex shrink-0 items-center gap-1 font-medium"
                  style={{ opacity: 1 }}
                >
                  {(progressToday?.progress?.length ?? 0) >=
                      (progressToday?.pages?.length ?? 0)
                    ? <CircleCheckBig className="ml-2 h-5 w-5" />
                    : <Circle className="h-5 w-5" />}
                  {progressToday.completed
                    ? `Selesai ${progressToday?.progress?.length} hal`
                    : `${progressToday?.progress?.length} Hal`}

                  {!progressToday.completed &&
                    (
                      <ArrowRight
                        className={cn(
                          "h-5 w-5 ",
                          true && "ml-2 bounce-left-right",
                        )}
                      />
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mt-1">
            <CalendarMonthProggres plan={target} />
            <UpdateProggres />
          </div>
          <Label className="mt-3">
            Progress Khatam
          </Label>
          <div
            style={{ animationDelay: `0.1s` }}
            className="animate-slide-top [animation-fill-mode:backwards] mb-3 rounded-md transition-all duration-500 ease-in-out text-sm"
          >
            <div className="relative h-8 w-full rounded-md bg-muted">
              <div className="flex h-8 items-center justify-end gap-1 px-2">
                {target.length} Hari
                <Rocket className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md backdrop-blur-md bg-primary/20 px-2 transition-all duration-500 ease-in-out",
                  totalTargetSessions >= targetLength && "rounded-md",
                )}
                style={{
                  width: `${
                    (totalTargetSessions / totalTargetSessions) * 100
                  }%`,
                }}
              >
                {totalTargetSessions} hari
                <Rocket className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-chart-5 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
                  totalTargetSessions >= 16 && "rounded-md",
                )}
                style={{
                  width: `${(total_sessions / totalTargetSessions) * 100}%`,
                }}
              >
                <div
                  className="flex shrink-0 items-center gap-1 font-medium"
                  style={{ opacity: 1 }}
                >
                  {totalTargetSessions >= 16
                    ? <CircleCheckBig className="ml-2 h-5 w-5" />
                    : <Circle className="h-5 w-5" />}
                  hari ke-{total_sessions}
                  <ArrowRight
                    className={cn(
                      "h-5 w-5 ",
                      true && "ml-2 bounce-left-right",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr />
        </div>
      </div>
    </div>
  );
}

const UpdateProggres = () => {
  const loaderData = useLoaderData<typeof Loader>();
  const target = loaderData.plan_read as QuranReadingPlan[];
  const fetcher = useFetcher({ key: "create-plan" });
  const today = format(new Date(), "yyyy-MM-dd");
  const _progressToday = target.find((d) => d.date === today);
  const progressToday = target.find((d) => d.date === today);
  const _uncompleted = target.filter((d) => d.completed === false);
  const uncompleted = _uncompleted.length > 0 ? _uncompleted[0] : progressToday;
  const [date, setDate] = useState(
    _uncompleted.length > 0 ? uncompleted.date : today,
  );

  const pages_length = uncompleted?.pages?.length || 0;
  const progress_length = uncompleted?.progress?.length || 0;
  const next_read = progress_length > 0
    ? uncompleted?.pages?.[progress_length]
    : uncompleted?.pages?.[0];
  const last_read = progress_length > 0
    ? uncompleted?.pages?.[pages_length - 1]
    : uncompleted?.pages?.[pages_length - 1];
  const [valuePage, setValuePage] = useState({
    start: next_read,
    end: next_read,
  });
  useEffect(() => {
    setValuePage(
      {
        ...valuePage,
        start: next_read,
        end: next_read,
      },
    );
  }, [date]);

  return (
    <fetcher.Form
      action="/muslim/quran?index"
      method="post"
      className="mx-auto max-w-xs"
    >
      <Label className="mt-3">
        Perbarui progress manual
      </Label>
      <div className="grid grid-cols-2 gap-2 max-w-xs mt-1">
        <JollyNumberFieldV2
          value={valuePage.start}
          onChange={(v) =>
            setValuePage({
              ...valuePage,
              start: v,
            })}
          minValue={next_read}
          name="start"
        />
        <JollyNumberFieldV2
          value={valuePage.end}
          onChange={(v) =>
            setValuePage({
              ...valuePage,
              end: v,
            })}
          minValue={next_read}
          maxValue={last_read}
          name="end"
        />
        <Input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="col-span-2"
        />
      </div>
      <ul className="list-disc pl-5 space-y-1">
        <li className="text-xs mt-2 text-muted-foreground">
          Masukan halaman mulai dan akhir ( jika hanya 1 halaman masukan halaman
          mulai )
        </li>
        <li className="text-xs mb-2 mt-1 text-muted-foreground">
          Jika memperbarui untuk hari ini kosongkan kolom tangal
        </li>
      </ul>
      <Button type="submit">
        Simpan
      </Button>
    </fetcher.Form>
  );
};

const saveTarget = async (data: any) => {
  const response = await toast.promise(
    (async () => {
      // 🔥 Ambil cache sebelumnya
      // const savedData = await getCache(PLANREAD_KEY) || [];

      // 🔥 Update data tanpa duplikasi
      const updatedData = data;
      // const updatedData = Array.from(new Set([...savedData, ...data]));

      // 🔥 Simpan data yang diperbarui
      await setCache(PLANREAD_KEY, updatedData);

      return updatedData; // Mengembalikan hasil
    })(),
    {
      loading: "Menyimpan target bacaan...",
      success: "Target bacaan berhasil disimpan!",
      error: "Gagal menyimpan target bacaan",
    },
  );

  return response;
};

const CalendarMonthProggres = ({ plan }: { plan: QuranReadingPlan[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir bulan di waktu lokal
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Mengambil semua hari dalam bulan ini
    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });

    // Menghitung hari pertama bulan ini
    const firstDayOfMonth = getDay(startOfCurrentMonth);

    // Menyesuaikan hari pertama kalender, agar selalu dimulai dari Senin
    // Jika firstDayOfMonth adalah 0 (Minggu), kita anggap sebagai 7 (Sabtu),
    // dan kita sesuaikan paddingnya.
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Menambahkan padding untuk hari-hari sebelum tanggal 1 bulan
    const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

    setDaysInMonth(paddedDays);
  };

  // Update kalender saat currentMonth berubah
  React.useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  // Menangani navigasi bulan berikutnya dan sebelumnya
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  // [@media(min-width:900px)]

  return (
    <div className="">
      <div className="flex items-center justify-center gap-3 px-3 pb-3 py-1.5">
        <Button
          onPress={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", {
            locale: localeId,
          })}
        </h2>
        <Button
          onPress={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 border rounded-md mx-auto min-w-[280px] max-w-fit w-full grid grid-cols-7 gap-y-2">
        {/* Header hari (Senin, Selasa, Rabu, dll.) */}
        {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => (
          <div
            key={index}
            className="border-b text-center font-medium text-sm pb-2 text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((day, index) => {
          const dataKey = day ? format(day, "yyyy-MM-dd") : null;
          const readingPlan = day
            ? plan.find((d) => d.date === dataKey)
            : null;
          const readingPlanIndex = day
            ? plan.findIndex((d) => d.date === dataKey)
            : null;
          const shouldRead = readingPlan?.pages
            ? readingPlan?.pages?.length
            : 0;

          const hasRead = readingPlan?.progress
            ? readingPlan?.progress?.length
            : 0;
          const rangeRead = readingPlan?.pages
            ? `${readingPlan.pages[0]}-${readingPlan.pages[shouldRead - 1]}`
            : 0;
          return (
            <React.Fragment
              key={index}
            >
              <div
                key={index}
              >
                {shouldRead > 0
                  ? (
                    <TooltipTrigger delay={100}>
                      <ButtonRAC
                        className={cn(
                          "py-2 flex flex-col items-center cursor-pointer text-sm w-full",
                          shouldRead > 0 &&
                            "bg-muted font-medium",
                          isToday(day) &&
                            "font-medium bg-primary text-primary-foreground rounded-lg",
                          readingPlanIndex === plan.length - 1 &&
                            "font-medium bg-primary text-primary-foreground rounded-lg",
                        )}
                      >
                        {day ? format(day, "d") : ""}
                      </ButtonRAC>

                      {hasRead > 0 && (
                        <div
                          style={{ animationDelay: `0.1s` }}
                          className="animate-slide-top [animation-fill-mode:backwards] rounded-md transition-all duration-500 ease-in-out pt-1"
                        >
                          <div className="relative h-4 w-full rounded-md bg-muted">
                            <div
                              className={cn(
                                "absolute top-0 flex h-4 items-center justify-end gap-1 overflow-hidden rounded-l-md bg-muted px-2 transition-all duration-500 ease-in-out",
                                hasRead >= shouldRead && "rounded",
                              )}
                              style={{
                                width: `100%`,
                              }}
                            >
                            </div>
                            {hasRead > 0 && (
                              <div
                                className={cn(
                                  "z-10 absolute top-0 flex h-4 items-center justify-end gap-1 overflow-hidden bg-chart-2 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
                                  hasRead >= shouldRead && "rounded",
                                )}
                                style={{
                                  width: `${(hasRead / shouldRead) * 100}%`,
                                }}
                              >
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Tooltip placement="bottom" className="mt-2">
                        <p>Hal {rangeRead}</p>
                        <p>{hasRead} Hal yang sudah dibaca</p>
                      </Tooltip>
                    </TooltipTrigger>
                  )
                  : (
                    <div
                      className={cn(
                        "text-center py-2",
                        !readingPlan && "text-muted-foreground",
                      )}
                    >
                      {day ? format(day, "d") : ""}
                    </div>
                  )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const CalendarMonth = ({ plan }: { plan: QuranReadingPlan[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const fetcher = useFetcher({ key: "create-plan" });
  const [daysInMonth, setDaysInMonth] = useState<any[]>([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir bulan di waktu lokal
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Mengambil semua hari dalam bulan ini
    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });

    // Menghitung hari pertama bulan ini
    const firstDayOfMonth = getDay(startOfCurrentMonth);

    // Menyesuaikan hari pertama kalender, agar selalu dimulai dari Senin
    // Jika firstDayOfMonth adalah 0 (Minggu), kita anggap sebagai 7 (Sabtu),
    // dan kita sesuaikan paddingnya.
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Menambahkan padding untuk hari-hari sebelum tanggal 1 bulan
    const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

    setDaysInMonth(paddedDays);
  };

  // Update kalender saat currentMonth berubah
  React.useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  // Menangani navigasi bulan berikutnya dan sebelumnya
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  // [@media(min-width:900px)]
  return (
    <div className="">
      <div className="flex items-center justify-center gap-3 px-3 pb-3 py-1.5">
        <Button
          onPress={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          onPress={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 border rounded-md mx-auto min-w-[280px] max-w-fit w-full grid grid-cols-7 gap-y-2">
        {/* Header hari (Senin, Selasa, Rabu, dll.) */}
        {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => (
          <div
            key={index}
            className="border-b text-center font-medium text-sm pb-2 text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((day, index) => {
          const dataKey = day ? format(day, "yyyy-MM-dd") : null;
          const readingPlan = day
            ? plan.find((d: QuranReadingPlan) => d.date === dataKey)
            : null;
          const readingPlanIndex = day
            ? plan.findIndex((d) => d.date === dataKey)
            : null;
          const shouldRead = readingPlan?.pages
            ? readingPlan?.pages?.length
            : 0;

          const rangeRead = readingPlan?.pages
            ? `${readingPlan.pages[0]}-${readingPlan.pages[shouldRead - 1]}`
            : 0;
          return (
            <div
              key={index}
              className={cn(
                "py-2 flex flex-col items-center cursor-pointer text-sm",
                shouldRead > 0 &&
                  "bg-muted font-medium",
                isToday(day) &&
                  "font-medium bg-primary text-primary-foreground rounded-lg",
                readingPlanIndex === plan.length - 1 &&
                  "font-medium bg-primary text-primary-foreground rounded-lg",
              )}
            >
              {shouldRead > 0
                ? (
                  <TooltipTrigger delay={100}>
                    <ButtonRAC className="w-full h-full">
                      {day ? format(day, "d") : ""}
                    </ButtonRAC>
                    <Tooltip placement="bottom" className="mt-2">
                      <p>Hal {rangeRead}</p>
                    </Tooltip>
                  </TooltipTrigger>
                )
                : (
                  <div
                    className={cn(
                      "text-center",
                      !readingPlan && "text-muted-foreground",
                    )}
                  >
                    {day ? format(day, "d") : ""}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      <dl className="sm:divide-y sm:divide-border border-t mt-4">
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Bacaan
          </dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            {plan[0]?.pages?.length} Halaman / Hari
          </dd>
        </div>
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">Mulai</dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            {format(plan[0].date, "PPPP", {
              locale: localeId,
            })}
          </dd>
        </div>
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Khatam
          </dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            {format(plan[plan.length - 1].date, "PPPP", {
              locale: localeId,
            })}
          </dd>
        </div>
        <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">
            Catatan
          </dt>
          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
            Khatam {(365 / plan.length).toFixed(0)} kali dalam setahun
          </dd>
        </div>
      </dl>
      <div className="mt-4 px-2">
        <fetcher.Form action="/muslim/quran?index" method="post">
          <Button
            name="days"
            value={plan.length.toString()}
            type="submit"
          >
            Simpan Target
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
};

/**
 * Menghitung total hari berdasarkan rentang waktu yang dipilih
 * @param rentang Jenis rentang waktu: "harian", "mingguan", atau "bulanan"
 * @param jumlah Jumlah unit yang dipilih (misal: 5 hari, 3 minggu, 2 bulan)
 * @returns Total hari yang harus dicapai
 */
function getTotalDays(
  rentang: "harian" | "mingguan" | "bulanan",
  jumlah: number,
): number {
  if (rentang === "harian") {
    return jumlah; // Langsung jumlah hari
  }
  if (rentang === "mingguan") {
    return jumlah * 7; // Setiap minggu = 7 hari
  }
  if (rentang === "bulanan") {
    return jumlah === 12 ? 365 : jumlah * 30; // 12 bulan = 365 hari, lainnya 30 hari per bulan
  }
  return 0; // Jika rentang tidak valid, return 0
}
