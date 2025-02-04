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
  virtualizer?: boolean;
  children?: React.ReactNode;
  menu?: React.ReactNode;
  redirectTo: string;
  title?: string;
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

  const prevScrollPos = React.useRef<number>(0);

  React.useEffect(() => {
    const navbarElement = document.getElementById("navbar");

    // 🔥 Jika menggunakan React Virtual Tanstack
    if (props.virtualizer) {
      // const handleVirtualScroll = () => {
      //   const currentScrollPos = props.virtualizer?.scrollOffset || 0;
      //   if (navbarElement instanceof HTMLElement) {
      //     if (prevScrollPos.current > currentScrollPos) {
      //       navbarElement.style.top = "0"; // Tampilkan navbar
      //     } else {
      //       navbarElement.style.top = `-${navbarElement.offsetHeight}px`; // Sembunyikan navbar
      //     }
      //   }
      //   prevScrollPos.current = currentScrollPos || 0;
      // };
      //
      // // 🔥 Gunakan React Effect untuk mendeteksi perubahan scrollOffset
      // handleVirtualScroll();
    } else {
      // 🔥 Jika tidak menggunakan Virtualizer, pakai window scroll event
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
    }
  }, [props.virtualizer]);

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
          <span id="title-page" className="truncate font-semibold">
            {props.title}
          </span>
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
