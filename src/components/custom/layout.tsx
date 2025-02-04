import { ThemeProvider } from "#src/components/custom/theme-provider.tsx";
import {
  muslimNavigationLink,
  toolsNavigationLink,
} from "#src/constants/nav-link";
import { lightDarkVar } from "#src/utils/misc";
import { TimerReset } from "lucide-react";
import React, { ReactNode } from "react";
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
    <LayoutMain>
      <Outlet />
    </LayoutMain>
  );
}

export function LayoutMain({ children }: { children: ReactNode }) {
  return (
    <div className="border-x min-h-[calc(100vh)] max-w-2xl mx-auto relative">
      {children}
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

    const matchedLink = navigate_link.find((link) => link.href === currentPath);

    if (matchedLink) {
      const lastRoutes = JSON.parse(
        localStorage.getItem("lastUsedRoutes") || "[]",
      );

      const updatedRoutes = lastRoutes.filter(
        (route: string) => route !== matchedLink.href,
      );

      updatedRoutes.unshift(matchedLink.href);

      const limitedRoutes = updatedRoutes.slice(0, 12);

      localStorage.setItem("lastUsedRoutes", JSON.stringify(limitedRoutes));
    }
  }, [location.pathname]);

  return null;
};
