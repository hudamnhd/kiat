import { buttonVariants } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { Info, RefreshCcw, X } from "lucide-react";
import React from "react";

import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const date = "__DATE__";
  return (
    <>
      {(offlineReady || needRefresh) && (
        <div className="fixed z-[200] bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 w-full sm:max-w-md duration-700 transition-[opacity,transform] translate-y-0 opacity-100">
          <div className="bg-background rounded-md m-3 border border-border shadow-lg">
            <div className="grid gap-2">
              <div className="border-b border-border h-12 flex items-center justify-between px-4">
                <h1 className="text-lg font-medium">Kiat Info</h1>
                <Info />
              </div>
              <div className="px-4 py-1">
                {offlineReady
                  ? (
                    <p className="text-sm font-normal text-start">
                      Kiat Applikasi bisa di gunakan secara{" "}
                      <strong>offline</strong> di semua menu.
                      <br />
                      <br />
                      <span className="text-xs">
                        Versi sekarang: {date}
                      </span>
                      <br />
                    </p>
                  )
                  : (
                    <p className="text-sm font-normal text-start">
                      Versi terbaru Kiat Applikasi tersedia, klik tombol Refresh
                      untuk memperbarui.
                      <br />
                      <br />
                      <div className="Home-built gap-1 text-xs [&_svg]:size-3 mb-1.5">
                        Versi sekarang: {date}
                      </div>
                    </p>
                  )}
              </div>
              <div className="flex gap-2 p-4 border-t border-border">
                {needRefresh && (
                  <button
                    className={cn(buttonVariants({ variant: "default" }))}
                    onClick={() => {
                      updateServiceWorker(true);
                    }}
                  >
                    <RefreshCcw /> Reload
                  </button>
                )}

                <button
                  className={cn(
                    buttonVariants({
                      variant: needRefresh ? "outline" : "default",
                    }),
                  )}
                  onClick={close}
                >
                  <X /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReloadPrompt;
