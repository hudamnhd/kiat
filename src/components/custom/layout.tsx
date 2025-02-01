import { ThemeProvider } from "#src/components/custom/theme-provider.tsx";
import {
  muslimNavigationLink,
  toolsNavigationLink,
} from "#src/constants/nav-link";
import { lightDarkVar } from "#src/utils/misc";
import { TimerReset } from "lucide-react";
import React from "react";
import { Toaster } from "react-hot-toast";
import { Outlet, useLocation } from "react-router";
import ReloadPrompt from "../pwa/reload-prompt";
import { GlobalPendingIndicator } from "./global-pending-indicator";

export default function ThemeProviderWrapper() {
  return (
    <ThemeProvider>
      <Toaster
        toastOptions={{
          // Define default options
          style: {
            background: lightDarkVar("background"),
            color: lightDarkVar("foreground"),
          },
          duration: 5000,
          removeDelay: 1000,

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: lightDarkVar("chart-2"),
              secondary: lightDarkVar("background"),
            },
          },
        }}
      />
      <Outlet />
      <GlobalPendingIndicator />
      <ReloadPrompt />
      <TrackLastRoutes />
    </ThemeProvider>
  );
}

export function Layout() {
  return (
    <div
      id="container-main"
      className="bg-gradient-to-b from-background via-background to-muted/50 border-x min-h-[calc(100vh)] max-w-xl mx-auto relative"
    >
      <Outlet />
    </div>
  );
}

const navigate_link = [
  ...muslimNavigationLink,
  ...toolsNavigationLink,
  {
    title: "Reset data",
    href: "/resources/reset",
    description: "Reset data local",
    icon: TimerReset,
  },
];

const TrackLastRoutes = () => {
  const location = useLocation(); // Mendapatkan informasi route saat ini.

  React.useEffect(() => {
    const currentPath = location.pathname;

    const containerMain = document.getElementById("container-main");

    if (
      currentPath === "/alat/calculator" &&
      containerMain instanceof HTMLDivElement
    ) {
      containerMain.classList.remove("border-x", "sm:max-w-xl");
    } else {
      if (!containerMain?.classList.contains("border-x")) {
        containerMain?.classList.add("border-x");
      }

      if (!containerMain?.classList.contains("sm:max-w-xl")) {
        containerMain?.classList.add("sm:max-w-xl");
      }
    }
    // Cek apakah currentPath cocok dengan salah satu href di muslimLinks.
    const matchedLink = navigate_link.find((link) => link.href === currentPath);

    if (matchedLink) {
      // Ambil daftar route terakhir dari localStorage.
      const lastRoutes = JSON.parse(
        localStorage.getItem("lastUsedRoutes") || "[]",
      );

      // Jika route sudah ada, hapus agar tidak ada duplikasi.
      const updatedRoutes = lastRoutes.filter(
        (route: string) => route !== matchedLink.href,
      );

      // Tambahkan route saat ini ke awal array.
      updatedRoutes.unshift(matchedLink.href);

      // Simpan hanya hingga maksimal 3 route terakhir.
      const limitedRoutes = updatedRoutes.slice(0, 12);

      // Simpan ke localStorage.
      localStorage.setItem("lastUsedRoutes", JSON.stringify(limitedRoutes));
    }
  }, [location.pathname]);

  return null;
};
