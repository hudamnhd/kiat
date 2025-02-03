import { Button } from "#src/components/ui/button";
import React from "react";
import { getTheme, setTheme as setSystemTheme } from "./theme-provider";

export default function ThemeSwitch() {
  const theme = getTheme();

  const [, rerender] = React.useState({});
  const setTheme = React.useCallback((theme: string) => {
    setSystemTheme(theme);
    rerender({});
  }, []);

  /* Update theme-color meta tag
	 * when theme is updated */

  const themeColor = theme === "dark" ? "#000000" : "#fff";
  const metaThemeColor = document.querySelector("meta[name='theme-color']");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", themeColor);
  }

  const nextMode = theme === "system"
    ? "light"
    : theme === "light"
    ? "sephia"
    : theme === "sephia"
    ? "dark"
    : "system";

  const modeLabel = {
    sephia: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 18"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 13a5 5 0 1 0-10 0M12 1v3M4.22 5.22l1.42 1.42M1 13h2M21 13h2M18.36 6.64l1.42-1.42M23 17H1"
        >
        </path>
      </svg>
    ),
    light: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-sun"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
    dark: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-moon"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
    system: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 4.25C2 4.11193 2.11193 4 2.25 4H12.75C12.8881 4 13 4.11193 13 4.25V11.5H2V4.25ZM2.25 3C1.55964 3 1 3.55964 1 4.25V12H0V12.5C0 12.7761 0.223858 13 0.5 13H14.5C14.7761 13 15 12.7761 15 12.5V12H14V4.25C14 3.55964 13.4404 3 12.75 3H2.25Z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <Button
      onPress={() => setTheme(nextMode as typeof theme)}
      title="Ubah Tema"
      variant="ghost"
      size="icon"
      className="bg-transparent"
    >
      {modeLabel[theme]}
    </Button>
  );
}
