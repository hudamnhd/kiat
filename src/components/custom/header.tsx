import ThemeSwitch from "#src/components/custom/theme-switch";
import { buttonVariants } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { Virtualizer } from "@tanstack/react-virtual";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";

const SettingsDisplay = React.lazy(() =>
  import("#src/components/custom/settings-display").then((module) => ({
    default: module.SettingsDisplay,
  }))
);

type HeaderProps = {
  children?: React.ReactNode;
  menu?: React.ReactNode;
  redirectTo: string;
  title?: string;
  subtitle?: string;
  isIndex?: boolean;
};

export function Header(props: HeaderProps) {
  document.title = props.title
    ? props.title === "kiat"
      ? "Kiat"
      : props.title
    : "Kiat";

  const location = useLocation();
  const showDisplay = location?.pathname?.startsWith("/muslim");

  React.useEffect(() => {
    const navbarElement = document.getElementById("navbar");

    let prevScrollpos = window.scrollY;

    const handleWindowScroll = () => {
      let currentScrollPos = window.scrollY;
      if (navbarElement instanceof HTMLElement) {
        if (prevScrollpos > currentScrollPos) {
          navbarElement.style.top = "0"; // Tampilkan navbar
        } else {
          navbarElement.style.top = `-${navbarElement.offsetHeight}px`; // Sembunyikan navbar
        }
      }
      prevScrollpos = currentScrollPos;
    };

    window.addEventListener("scroll", handleWindowScroll);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  return (
    <header
      id="navbar"
      className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 border-b sticky top-0 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 z-10 duration-300"
    >
      <div className="flex items-center gap-x-1.5">
        <Link
          title={props.title === "kiat" ? "Tentang Kiat" : "Kembali"}
          {...(!props.isIndex
            ? {
              className: cn(
                buttonVariants({ size: "icon", variant: "ghost" }),
                "[&_svg]:size-5",
              ),
            }
            : {})}
          to={props.redirectTo}
        >
          {!props.isIndex
            ? <ArrowLeft />
            : <span className="pl-2 font-semibold">{props.title}</span>}
        </Link>

        {!props.isIndex && !props.menu && (
          <div className="grid">
            <span id="title-page" className="truncate font-semibold">
              {props.title}
            </span>
            {props.subtitle && (
              <span
                id="sub-title-page"
                className="truncate text-xs -mt-0.5 text-muted-foreground font-medium"
              >
                {props.subtitle}
              </span>
            )}
          </div>
        )}
        {props.menu && props.menu}
      </div>

      <div className="flex items-center gap-1">
        {props.children && props.children}
        {showDisplay && <SettingsDisplay />}
        <ThemeSwitch />
      </div>
    </header>
  );
}
