import { Header } from "#src/components/custom/header";
import { Button } from "#src/components/ui/button";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#src/components/ui/popover";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "#src/components/ui/select";
import { cn } from "#src/utils/misc";
import {
  Activity,
  CircleHelp,
  Coffee,
  Pause,
  Play,
  TimerReset,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBeforeUnload } from "react-router";

function SelectExample() {
  return (
    <Select className="w-[200px]" placeholder="Select an animal">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectPopover>
        <SelectListBox>
          <SelectItem>Aardvark</SelectItem>
          <SelectItem>Cat</SelectItem>
          <SelectItem>Dog</SelectItem>
          <SelectItem>Kangaroo</SelectItem>
          <SelectItem>Panda</SelectItem>
          <SelectItem>Snake</SelectItem>
        </SelectListBox>
      </SelectPopover>
    </Select>
  );
}

function InfoPopover() {
  return (
    <div className="flex gap-4">
      <PopoverTrigger>
        <Button variant="ghost" size="icon">
          <CircleHelp />
        </Button>
        <Popover placement="bottom">
          <PopoverDialog className="max-w-[400px]  p-0">
            <p className="text-muted-foreground px-4 py-2.5 text-sm">
              Kata <strong>pomodoro</strong>{" "}
              berasal dari bahasa Italia yang berarti{" "}
              <strong>tomat</strong>. Metode Pomodoro Technique dinamai demikian
              karena Francesco Cirillo, pencipta metode ini, awalnya menggunakan
              timer dapur berbentuk tomat untuk mengatur waktu kerjanya.
              Pomodoro Technique Ini adalah teknik manajemen waktu yang membagi
              waktu kerja menjadi interval fokus (biasanya{" "}
              <strong>25 menit</strong>), yang disebut{" "}
              <strong>pomodoros</strong>, diikuti dengan istirahat singkat
              (biasanya <strong>5 menit</strong>
              ).
            </p>
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

const MODETIMER = {
  POMO: "Pomo",
  SHORTBREAK: "ShortBreak",
  MEDIUMBREAK: "MediumBreak",
  LONGBREAK: "LongBreak",
};

type MODE = typeof MODETIMER;

export function Component() {
  const [mode, setMode] = useState<MODE>(MODETIMER.POMO);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // Initial 25:00 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Timer Durations
  const durations = {
    [MODETIMER.POMO]: 25 * 60, // 25 minutes
    [MODETIMER.SHORTBREAK]: 5 * 60, // 5 minutes
    [MODETIMER.MEDIUMBREAK]: 10 * 60, // 10 minutes
    [MODETIMER.LONGBREAK]: 15 * 60, // 15 minutes
  };

  // Load state from Local Storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setMode(parsedState.mode || MODETIMER.POMO);
      setTimeLeft(parsedState.timeLeft || durations[MODETIMER.POMO]);
      setIsRunning(parsedState.isRunning || false);
    }
  }, []);

  // Save state to Local Storage on change
  useEffect(() => {
    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({ mode, timeLeft, isRunning }),
    );
  }, [mode, timeLeft, isRunning]);

  // Save state before unload
  useBeforeUnload(() => {
    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({ mode, timeLeft, isRunning }),
    );
  });

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }

    return () => clearInterval(timerRef.current!);
  }, [isRunning]);

  const handleModeChange = (newMode: MODE) => {
    // Cek apakah timer sedang berjalan
    if (isRunning) {
      const confirmChange = window.confirm(
        "Timer sedang berjalan. Apakah Anda yakin ingin mengganti mode? Timer akan diatur ulang.",
      );
      if (!confirmChange) return; // Jika pengguna membatalkan, tidak ada perubahan
    }

    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const progress = 1 - timeLeft / durations[mode];
  const strokeDashoffset = isRunning ? (1 - progress) * 2 * Math.PI * 45 : 0;

  return (
    <>
      <Header redirectTo="/" title="Pomodoro" />
      <div className="flex items-center justify-center gap-1 text-2xl text-center leading-8 font-extrabold tracking-tight sm:text-3xl pt-3">
        <span>Pomodoro</span>
        <InfoPopover />
      </div>
      {/* Modes */}
      <Select
        className="w-[200px] mx-auto my-4"
        placeholder="Pilih mode"
        selectedKey={mode}
        aria-label="Pilih mode"
        onSelectionChange={(selected) => handleModeChange(selected)}
      >
        <SelectTrigger>
          <SelectValue className="flex gap-2" />
        </SelectTrigger>
        <SelectPopover>
          <SelectListBox>
            {Object.values(MODETIMER).map((d) => {
              const ICON = d === "Pomo" ? Activity : Coffee;
              return (
                <SelectItem
                  key={d}
                  className="flex gap-2"
                  textValue={d}
                  id={d}
                >
                  <ICON
                    className="h-5 w-5 text-foreground  sm:group-hover:-rotate-45 sm:duration-300"
                    aria-hidden="true"
                  />
                  {d.replace("Break", " Break")}
                </SelectItem>
              );
            })}
          </SelectListBox>
        </SelectPopover>
      </Select>

      {/* Timer */}

      <div className="relative w-48 h-48 mb-6 mx-auto">
        <div className="absolute flex h-full w-full justify-center">
          <div className="flex flex-col justify-center items-center">
            {mode !== "Pomo"
              ? (
                <Button
                  onPress={() => setIsRunning(!isRunning)}
                  variant="ghost"
                  size="icon"
                  className={`h-16 w-16 [&_svg]:size-10 transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 mx-auto p-0 rounded-full`}
                  style={{ animationDelay: `0.1s` }}
                >
                  <Coffee
                    style={{ animationDelay: `0.3s` }}
                    className={cn(
                      isRunning &&
                        "animate-roll-reveal [animation-fill-mode:backwards]",
                    )}
                  />
                </Button>
              )
              : (
                <Button
                  onPress={() => setIsRunning(!isRunning)}
                  variant="ghost"
                  size="icon"
                  className={`h-16 w-16 [&_svg]:size-10 transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 mx-auto p-0 rounded-full`}
                  style={{ animationDelay: `0.1s` }}
                >
                  {isRunning
                    ? (
                      <Pause
                        style={{ animationDelay: `0.3s` }}
                        className={cn(
                          isRunning &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      />
                    )
                    : (
                      <Play
                        className={cn(
                          "animate-slide-top [animation-fill-mode:backwards]",
                        )}
                      />
                    )}
                </Button>
              )}
            <div
              style={{ animationDelay: `0.1s` }}
              className="text-3xl font-bold animate-roll-reveal [animation-fill-mode:backwards] todo-progress mx-auto flex justify-center transition-all duration-500 ease-in-out"
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <svg
          className="bg-primary/10 dark:bg-foreground/30 rounded-full"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-secondary"
            strokeWidth="6"
            fill="none"
          />
          <circle
            className={cn(
              mode === "Pomo"
                ? "stroke-primary"
                : "stroke-primary",
              " transition-all duration-500 ease-in-out",
            )}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="my-4 flex items-center justify-center gap-2 px-3">
        <Button onPress={() => setIsRunning(!isRunning)}>
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          variant="secondary"
          onPress={() => {
            setIsRunning(false);
            setTimeLeft(durations[mode]);
          }}
        >
          <TimerReset />
          Reset
        </Button>
      </div>

      {
        /*<div className="space-y-4 mt-3 px-3">
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-muted-foreground/10 px-4 py-2.5">
            <p className="font-medium text-sm">Apa itu Pomodoro ?</p>

            <svg
              className="size-4 shrink-0 transition duration-300 group-open:-rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>

          <p className="text-muted-foreground px-4 py-2.5 text-sm">
            Kata <strong>pomodoro</strong>{" "}
            berasal dari bahasa Italia yang berarti{" "}
            <strong>tomat</strong>. Metode Pomodoro Technique dinamai demikian
            karena Francesco Cirillo, pencipta metode ini, awalnya menggunakan
            timer dapur berbentuk tomat untuk mengatur waktu kerjanya. Pomodoro
            Technique Ini adalah teknik manajemen waktu yang membagi waktu kerja
            menjadi interval fokus (biasanya{" "}
            <strong>25 menit</strong>), yang disebut{" "}
            <strong>pomodoros</strong>, diikuti dengan istirahat singkat
            (biasanya <strong>5 menit</strong>
            ).
          </p>
        </details>
      </div>*/
      }
    </>
  );
}
