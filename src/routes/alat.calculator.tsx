import { Header } from "#src/components/custom/header";
import { Button, buttonVariants } from "#src/components/ui/button";
import { Label } from "#src/components/ui/label";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#src/components/ui/popover";
import {
  ChevronDown,
  Delete,
  Equal,
  History,
  Minus,
  PenLine,
  Plus,
  X,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "#src/components/ui/dialog";
import { cn } from "#src/utils/misc";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#src/components/ui/collapsible";
import { Input } from "#src/components/ui/input";
import { number } from "zod";

// Tipe untuk riwayat kalkulator
interface HistoryItem {
  expression: string;
  result: string;
}

export const Component = () => {
  const [currentInput, setCurrentInput] = useState<string>(() => {
    // Ambil currentInput dari localStorage jika ada
    const savedCurrentInput = localStorage.getItem("calcCurrentInput");
    return savedCurrentInput ? JSON.parse(savedCurrentInput) : "";
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    // Ambil history dari localStorage jika ada
    const savedHistory = localStorage.getItem("calcHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Referensi ke elemen container yang berisi daftar ekspresi
  const expressionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Setelah currentInput berubah, gulir ke bawah
    if (expressionRef.current) {
      expressionRef.current.scrollTop = expressionRef.current.scrollHeight;
    }

    localStorage.setItem("calcCurrentInput", JSON.stringify(currentInput));
  }, [currentInput]); //

  const getLastOperator = (input: string): string | null => {
    // Cari operator terakhir di dalam input
    const operators = ["+", "-", "*", "/"];

    // Membalik input dan mencari operator pertama
    for (let i = input.length - 1; i >= 0; i--) {
      if (operators.includes(input[i])) {
        switch (input[i]) {
          case "*":
            return "×"; // Tanda perkalian
          case "/":
            return "÷"; // Tanda pembagian
          default:
            return input[i]; // Operator terakhir yang ditemukan
        }
      } else {
        return "";
      }
    }

    return ""; // Tidak ada operator yang ditemukan
  };

  const lastOperator = getLastOperator(currentInput);
  // Fungsi untuk menambahkan input ke kalkulator

  const handleButtonPress = (value: string) => {
    setCurrentInput((prev) => {
      // Jika input kosong dan value "0", "00", atau "000", hanya tambahkan satu "0"
      if (prev === "" && /^[0]+$/.test(value)) return "0";
      if (prev === "0" && /^[0]+$/.test(value)) return "0";

      // Jika input hanya "0", ganti dengan nilai baru
      if (prev === "0") return value;

      // Normal concatenation
      return prev + value;
    });
  };

  // Fungsi untuk menghapus input
  const handleClear = () => {
    setCurrentInput("");
  };

  // Fungsi untuk menghapus karakter terakhir
  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  // Fungsi untuk mengevaluasi hasil dan update total
  const handleEvaluate = () => {
    try {
      // Menghitung ekspresi dan menyimpan hasil
      const result = evaluateInputSequential(currentInput); // Gunakan dengan hati-hati, untuk demo saja
      const newHistory: HistoryItem = {
        expression: currentInput,
        result: result.toString(),
      };

      // Update history, simpan hingga 5 item terakhir
      const updatedHistory = [newHistory, ...history].slice(0, 10);

      // Simpan ke localStorage
      localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));

      setHistory(updatedHistory);
      toast.success("Sukses tersimpan dalam riwayat");
      // setCurrentInput(result.toString());
    } catch (error) {
      setCurrentInput("Error");
    }
  };

  // Menangani klik operator
  const handleOperatorClick = (operator: string) => {
    if (currentInput === "" && operator === "-") {
      // Jika input kosong, anggap ini adalah angka negatif
      setCurrentInput("-");
    } else if (
      currentInput !== "" &&
      !["+", "-", "*", "/"].includes(currentInput.slice(-1))
    ) {
      // Menambahkan operator jika belum ada operator di akhir
      setCurrentInput((prev) => prev + operator);
    }
  };

  function processInput(input: string) {
    // Menghapus operator yang tidak ada angka sebelumnya di akhir input
    input = input.replace(/[+\-*/]$/, "");

    return input;
  }

  function evaluateInputSequential(input: string) {
    // Langkah 1: Pisahkan angka dan operator
    const processedInput = processInput(input);

    // Perbaiki regex agar dapat menangkap angka desimal
    const tokens = processedInput.match(/(\d*\.?\d+|\+|\-|\*|\/)/g);
    if (!tokens) return 0;

    // Langkah 2: Mulai evaluasi secara berurutan
    let result = parseFloat(tokens[0]); // Ambil angka pertama sebagai nilai awal

    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i]; // Ambil operator
      const nextNumber = parseFloat(tokens[i + 1]); // Ambil angka berikutnya

      // Langkah 3: Lakukan operasi secara berurutan
      switch (operator) {
        case "+":
          result += nextNumber;
          break;
        case "-":
          result -= nextNumber;
          break;
        case "*":
          result *= nextNumber;
          break;
        case "/":
          result /= nextNumber;
          break;
        default:
          throw new Error(`Operator tidak dikenali: ${operator}`);
      }
    }

    return result;
  }

  const splitExpression = (input: string) => {
    // Pecah ekspresi berdasarkan angka dan operator (+, -, *, /)
    const regex = /(\d*\.?\d+|[+\-*/])/g; // Menggunakan regex untuk angka desimal dan operator
    const result = input.match(regex) || [];

    return result.map((operator) => {
      switch (operator) {
        case "*":
          return "×"; // Tanda perkalian
        case "/":
          return "÷"; // Tanda pembagian
        default:
          return operator; // Menjaga operator lainnya seperti + dan -
      }
    });
  };

  const findLastEvenIndex = (arr: string[]) => {
    // Menentukan indeks terakhir
    let lastIndex = arr.length - 1;

    // Jika indeks terakhir adalah ganjil, cari indeks genap sebelumnya
    if (lastIndex % 2 !== 0) {
      lastIndex -= 1; // Mengurangi 1 agar menjadi genap
    }

    return lastIndex;
  };
  const formatRupiah = (amount: number) => {
    if (!amount && amount !== 0) return "0"; // Cek jika amount invalid atau null
    // Gunakan toLocaleString untuk memformat angka
    return amount.toLocaleString("id-ID", {
      style: "decimal", // Menggunakan format desimal
      minimumFractionDigits: 0, // Tidak menampilkan desimal jika 0
      maximumFractionDigits: 2, // Maksimal 2 digit desimal
    });
  };

  const CN = {
    number:
      "font-medium text-3xl h-14 data-[hovered]:bg-foreground data-[hovered]:text-background data-[pressed]:bg-foreground data-[pressed]:text-background ",
    operator:
      "[&_svg]:size-9 h-14 bg-slate-600 dark:bg-slate-500 data-[hovered]:bg-foreground data-[hovered]:text-background data-[pressed]:bg-foreground data-[pressed]:text-background ",
    equal:
      "[&_svg]:size-9 h-14 bg-orange-500 dark:bg-orange-400 data-[hovered]:bg-orange-500/80 dark:data-[hovered]:bg-orange-400/80",
  };
  return (
    <div
      className={cn(
        "flex flex-col gap-2 justify-between bg-background w-full mx-auto ",
        "h-screen",
      )}
    >
      <div>
        <Header redirectTo="/" title="Kalkulator">
          <DialogTrigger>
            <Button title="Riwayat" variant="ghost" className="gap-1.5">
              <History className="w-4 h-4" /> Riwayat
            </Button>
            <DialogOverlay>
              <DialogContent className="sm:max-w-[425px]">
                {({ close }) => (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        Riwayat
                      </DialogTitle>
                      <DialogDescription>
                        Klik list untuk melihat rincian
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4 divide-y max-h-[70vh] overflow-y-auto">
                      {history.length > 0
                        ? (
                          history.map((d, index) => (
                            <div key={index} className="grid break-words py-2">
                              <Collapsible>
                                <div className="text-pretty text-xl font-medium text-start flex flex-wrap px-1">
                                  {splitExpression(
                                    processInput(d.expression),
                                  ).map((dt, index) => (
                                    <React.Fragment key={index}>
                                      <span>{dt}</span>
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <CollapsibleTrigger className="flex items-center gap-2">
                                    <ChevronDown className="w-4 h-4 group-data-expanded:rotate-180 duration-300 transition-all" />
                                    {" "}
                                    <span>Lihat</span>
                                  </CollapsibleTrigger>
                                  <div className="chev text-2xl text-right font-semibold">
                                    {d.result &&
                                      `${formatRupiah(parseFloat(d.result))}`}
                                  </div>
                                </div>
                                <CollapsibleContent>
                                  <div className="text-xl font-semibold max-h-[calc(100vh-360px)] overflow-y-auto my-3">
                                    {splitExpression(
                                      processInput(d.expression),
                                    ).map((item, index, arr) => {
                                      const lastIndex = findLastEvenIndex(arr);
                                      // Menampilkan angka
                                      if (index % 2 === 0) {
                                        return (
                                          <div
                                            key={index}
                                            className="text-right"
                                          >
                                            {index === 0
                                              ? (
                                                // Menampilkan angka pertama dengan warna biru
                                                <div className="flex items-center justify-between border-b border-dashed border-gray-400 px-2 bg-green-50 dark:bg-green-950">
                                                  <div className="gap-x-6 flex items-center text-[16px] w-4 text-start">
                                                    <span>
                                                      {index === 0 && "1."}
                                                    </span>
                                                  </div>
                                                  <span className="text-xl font-semibold">
                                                    {formatRupiah(
                                                      parseFloat(item),
                                                    )}
                                                  </span>
                                                </div>
                                              )
                                              : (
                                                <>
                                                  {/* Menampilkan operator setelah angka */}
                                                  <div
                                                    className={cn(
                                                      "flex items-center justify-between gap-2 items-center justify-between px-2 py-0.5 border-b border-dashed border-muted-foreground",
                                                      splitExpression(
                                                            processInput(
                                                              d.expression,
                                                            ),
                                                          )[index - 1] ===
                                                          "+" &&
                                                        "bg-green-50 dark:bg-green-950",
                                                      splitExpression(
                                                            processInput(
                                                              d.expression,
                                                            ),
                                                          )[index - 1] ===
                                                          "-" &&
                                                        "bg-red-50 dark:bg-red-950",
                                                      splitExpression(
                                                            processInput(
                                                              d.expression,
                                                            ),
                                                          )[index - 1] ===
                                                          "÷" &&
                                                        "bg-orange-50 dark:bg-orange-950",
                                                      splitExpression(
                                                            processInput(
                                                              d.expression,
                                                            ),
                                                          )[index - 1] ===
                                                          "×" &&
                                                        "bg-blue-50 dark:bg-blue-950",
                                                    )}
                                                  >
                                                    <div className="gap-x-3 flex items-center">
                                                      <span className="text-[16px] w-2.5 text-start flex items-center">
                                                        <span>
                                                          {index === 0
                                                            ? ""
                                                            : index / 2 + 1}
                                                        </span>
                                                        <span>.</span>
                                                      </span>
                                                      <span className="text-2xl px-2">
                                                        {splitExpression(
                                                          processInput(
                                                            d.expression,
                                                          ),
                                                        )[index - 1]}
                                                      </span>
                                                    </div>
                                                    <span className="text-xl font-semibold">
                                                      {formatRupiah(
                                                        parseFloat(item),
                                                      )}
                                                    </span>
                                                  </div>
                                                </>
                                              )}
                                          </div>
                                        );
                                      } else {
                                        return null;
                                      }
                                    })}

                                    <div className="bg-background flex items-center justify-between sticky bottom-0 z-10 border-t-2 border-primary px-2">
                                      <div className="py-1 text-xl font-semibold text-right">
                                        TOTAL{" "}
                                      </div>
                                      <div className="flex items-center gap-2 py-1">
                                        {d.result && (
                                          <span className="text-2xl font-semibold text-right">
                                            {formatRupiah(parseFloat(d.result))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          ))
                        )
                        : (
                          <div className="text-center text-sm pt-3">
                            Belum ada riwayat
                          </div>
                        )}
                    </div>
                    <DialogFooter className="grid gap-2">
                      <Button
                        onPress={close}
                        variant="outline"
                        className="sm:hidden "
                      >
                        <X /> Tutup
                      </Button>
                      {history.length > 0 && (
                        <Button
                          onPress={() => {
                            setHistory([]);
                            close();
                          }}
                          variant="destructive"
                        >
                          <X /> Hapus Riwayat
                        </Button>
                      )}
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </DialogOverlay>
          </DialogTrigger>
        </Header>
      </div>

      {
        /*<div>
        <p>“You're late!”</p>
        <del className="bg-red-300">
          <p>“I apologize for the delay.”</p>
        </del>
        <ins
          cite="../howtobeawizard.html"
          dateTime="2018-05"
          className="bg-lime-300"
        >
          <p>“A wizard is never late …”</p>
        </ins>
      </div>
      <dialog open className="h-screen">
        <p>Greetings, one and all!</p>
        <form method="dialog">
          <button>OK</button>
        </form>
      </dialog>*/
      }
      <div>
        <Collapsible defaultExpanded={true} className="m-0 p-0 group">
          <div
            ref={expressionRef}
            className={cn(
              "max-h-[calc(100vh-105px)] group-data-expanded:max-h-[calc(100vh-430px)] child space-y-1 text-2xl font-semibold  overflow-y-auto px-2.5 sm:px-3 w-full",
              // "max-h-[calc(100vh-183px)]",
            )}
          >
            {splitExpression(currentInput).map((item, index, arr) => {
              const lastIndex = findLastEvenIndex(arr);
              // Menampilkan angka
              if (index % 2 === 0) {
                return (
                  <div
                    key={index}
                    className="text-right w-full flex items-center justify-between gap-2"
                  >
                    <PopoverTrigger>
                      <Button variant="ghost" size="icon">
                        <PenLine />
                      </Button>
                      <Popover placement="end">
                        <PopoverDialog className="max-w-[250px]">
                          {({ close }) => {
                            const [newInput, setNewInput] = useState<string>(
                              item,
                            );
                            const handleNewInputChange = (
                              e: { target: { value: string } },
                            ) => {
                              setNewInput(
                                e.target.value.replace(/\D/g, ""),
                              );
                            };

                            const handleNewInputSave = () => {
                              const inputData = splitExpression(currentInput);
                              const findIndex = inputData.findIndex((
                                d,
                                i,
                              ) => i === index);
                              const _inputData = [...inputData];
                              _inputData[findIndex] = newInput.toString() ||
                                item;
                              const joidData = _inputData.join("");
                              setCurrentInput(joidData);
                              close();
                            };

                            return (
                              <div className="grid gap-2">
                                <div>
                                  <Label>
                                    Ubah {item} :
                                  </Label>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={newInput}
                                    onChange={handleNewInputChange}
                                  />
                                </div>
                                <div className="grid gap-2 grid-cols-2">
                                  <Button
                                    onPress={close}
                                    variant="outline"
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    onPress={handleNewInputSave}
                                  >
                                    Simpan
                                  </Button>
                                </div>
                              </div>
                            );
                          }}
                        </PopoverDialog>
                      </Popover>
                    </PopoverTrigger>
                    {index === 0
                      ? (
                        // Menampilkan angka pertama dengan warna biru
                        <div className="flex items-center justify-between border-b border-dashed border-gray-400 px-1 w-full">
                          <div className="gap-x-4 flex items-center text-[16px] w-3 text-start text-muted-foreground">
                            <span>{index === 0 && "1."}</span>
                          </div>
                          <span className="text-2xl font-semibold">
                            {formatRupiah(parseFloat(item))}
                          </span>
                        </div>
                      )
                      : (
                        <>
                          {/* Menampilkan operator setelah angka */}
                          <div
                            className={`${
                              index === lastIndex
                                ? ""
                                : " border-b border-dashed border-muted-foreground"
                            } w-full flex items-center justify-between gap-2  py-0.5 px-1`}
                          >
                            <div className="gap-x-3 flex items-center">
                              <span className="text-[16px] w-3 text-start text-muted-foreground">
                                {index === 0 ? "" : index / 2 + 1}.
                              </span>
                              <span className="text-2xl px-2">
                                {splitExpression(currentInput)[index - 1]}
                              </span>
                            </div>
                            <span
                              className={`${
                                index === lastIndex ? "relative" : ""
                              } text-2xl font-semibold `}
                            >
                              {index === lastIndex
                                ? (
                                  <span className="relative flex justify-end">
                                    <span className="absolute -right-1 text-2xl blink-cursor border-l-2 border-muted-foreground h-8">
                                    </span>
                                    <span className="text-2xl font-semibold">
                                      {formatRupiah(parseFloat(item))}
                                    </span>
                                  </span>
                                )
                                : (
                                  formatRupiah(parseFloat(item))
                                )}
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                );
              } else {
                return null;
              }
            })}

            <div className="bg-background sticky bottom-0  border-t-2 border-primary">
              <div className="bg-background flex items-center justify-between border-t-2 border-primary">
                <div className="py-2 text-xl font-bold text-right">
                  TOTAL{" "}
                </div>
                <div className="flex items-center gap-3 py-1">
                  {lastOperator !== ""
                    ? (
                      <div
                        className={cn(
                          buttonVariants({ size: "icon" }),
                          "h-8 w-8 text-2xl pb-0.5",
                        )}
                      >
                        {lastOperator}
                      </div>
                    )
                    : (
                      <div
                        className={cn(
                          "h-8 w-8 text-2xl pb-0.5",
                        )}
                      >
                      </div>
                    )}
                  <span className="text-2xl font-bold text-right">
                    {/*{formatRupiah(evaluateInput(currentInput))}*/}
                    {formatRupiah(evaluateInputSequential(currentInput))}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <CollapsibleTrigger className="bg-muted border-y text-muted-foreground font-medium [data-focused]:outline-hidden data-focus-visible:outline-hidden focus-visible:outline-hidden flex items-center gap-2 justify-center w-full py-1 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 8h.01" />
              <path d="M12 12h.01" />
              <path d="M14 8h.01" />
              <path d="M16 12h.01" />
              <path d="M18 8h.01" />
              <path d="M6 8h.01" />
              <path d="M7 16h10" />
              <path d="M8 12h.01" />
              <rect width="20" height="16" x="2" y="4" rx="2" />
            </svg>
            <span className="group-data-expanded:hidden inline-flex">
              Tampilkan tombol
            </span>
            <span className="group-data-expanded:inline-flex hidden">
              Sembunyikan tombol
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-0 m-0">
            <div className="grid grid-cols-4 gap-2 px-2.5 sm:px-3 pb-2.5 sm:pb-3">
              <Button
                size="lg"
                className={CN.operator}
                onPress={handleClear}
              >
                <div className="text-4xl font-medium">C</div>
              </Button>
              <Button
                size="lg"
                className={CN.operator}
                onPress={() => handleOperatorClick("*")}
              >
                <X strokeWidth={2} />
              </Button>
              <Button
                size="lg"
                className={CN.operator}
                onPress={() => handleOperatorClick("/")}
              >
                <div className="text-4xl font-medium pb-1">÷</div>
              </Button>
              <Button
                size="lg"
                variant="default"
                className={CN.operator}
                onPress={handleBackspace}
              >
                <Delete
                  strokeWidth={1.5}
                />
              </Button>

              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("7")}
              >
                7
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("8")}
              >
                8
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("9")}
              >
                9
              </Button>
              <Button
                className={CN.operator}
                size="lg"
                onPress={() => handleOperatorClick("-")}
              >
                <Minus strokeWidth={2} />
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("4")}
              >
                4
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("5")}
              >
                5
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("6")}
              >
                6
              </Button>
              <Button
                className={CN.operator}
                size="lg"
                onPress={() => handleOperatorClick("+")}
              >
                <Plus strokeWidth={2} />
              </Button>

              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("1")}
              >
                1
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("2")}
              >
                2
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("3")}
              >
                3
              </Button>
              <Button
                className={CN.equal}
                size="lg"
                onPress={handleEvaluate}
              >
                <Equal strokeWidth={2} />
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("0")}
              >
                0
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("00")}
              >
                00
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress("000")}
              >
                000
              </Button>
              <Button
                className={CN.number}
                size="lg"
                variant="secondary"
                onPress={() => handleButtonPress(".")}
              >
                .
              </Button>
            </div>
            {/*biome-ignore format: the code should not be formatted*/}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
