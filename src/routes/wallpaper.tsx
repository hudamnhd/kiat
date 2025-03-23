import React from "react";

export const Component = () => {
  return (
    <div className="bg-slate-950  mx-auto text-center flex flex-col items-center justify-center h-screen text-6xl leading-[70px] text-muted-foreground">
      <div>
        "Bagian tersulit adalah belajar untuk{" "}
        <strong className="text-foreground">tidak menggunakannya</strong>.
      </div>
      <div>
        Banyak pilihan{" "}
        <strong className="text-foreground">menawarkan kecepatan</strong>, tapi
        hanya sedikit{" "}
        <strong className="text-foreground">yang benar-benar esensial</strong>".
      </div>
      <div className="mt-4">
        <div className="text-base font-medium text-muted-foreground">
          Tool
          <strong className="text-foreground">{" "}just tool</strong>. Please
          <strong className="text-foreground">{" "}dont't do no more</strong>
        </div>
      </div>
    </div>
  );
};
