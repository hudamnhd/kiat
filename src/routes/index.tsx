import Footer from "#src/components/custom/footer";
import { Header } from "#src/components/custom/header";
import { LayoutMain } from "#src/components/custom/layout.tsx";
import { NavigationList } from "#src/components/custom/navigation-list.tsx";
import { Button } from "#src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "#src/components/ui/command";
import {
  muslimNavigationLink,
  NavigationLink,
  toolsNavigationLink,
} from "#src/constants/nav-link";
import { cn } from "#src/utils/misc";
import { BookOpenText, Info, Search, Wrench } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router";

export default function Index() {
  const data = [...muslimNavigationLink, ...toolsNavigationLink];
  const [last_used, set_last_used] = React.useState<typeof data | []>([]);

  React.useEffect(() => {
    const lastUsedRoutes = JSON.parse(
      localStorage.getItem("lastUsedRoutes") || "[]",
    ) as [];

    if (lastUsedRoutes.length > 0) {
      const filteredLinks = lastUsedRoutes
        .map((route) => data.find((link) => link.href === route))
        .filter(Boolean);

      set_last_used(filteredLinks);
    }
  }, []);

  const muslim_desc = muslimNavigationLink.map((d) => d.title).join(", ");
  const tools_desc = toolsNavigationLink.map((d) => d.title).join(", ");
  const mainMenu: NavigationLink[] = [
    ...muslimNavigationLink,
    ...toolsNavigationLink,
  ];

  return (
    <LayoutMain>
      <Header isIndex={true} redirectTo="/about" title="Kiat">
        <CommandMenu />
      </Header>
      <div className="h-full w-full gap-2">
        <main className="flex-1 px-5 mx-auto w-full space-y-4 sm:space-y-6">
          <h1 className="font-medium sm:pt-3">
            Assalamu'alaikum Wr.Wb, 🙏
          </h1>
          <p className="leading-snug">
            Alhamdulillah puji syukur ke hadirat Allah SWT. Sholawat serta salam
            semoga selalu tercurahkan kepada Nabi Muhammad SAW. Semoga aplikasi
            ini bisa bermanfaat terutama untuk <strong>saya sendiri</strong> dan
            {" "}
            <strong>orang lain</strong>.
          </p>
          <h2 className="font-bold sm:mt-8 mb-1">
            Applikasi
          </h2>
          {
            /*<ul className="list-disc pl-5 space-y-1">
            {data.map((item, itemIdx) => (
              <li
                key={itemIdx}
                className="pl-1"
              >
                <Link
                  title={item.description}
                  to={item.href}
                  className="flex items-center gap-2 font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sephia:text-blue-500 sephia:hover:text-blue-600"
                >
                  <item.icon className="w-4 h-4 text-foreground" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>*/
          }

          <NavigationList data={mainMenu} />
          <div className="h-6" />
        </main>
        <Footer />
      </div>

      {
        /*<div className="pb-7">
        {last_used.length > 0 && (
          <React.Fragment>
            <div className="px-3 mt-1 text-muted-foreground">
              Terakhir digunakan
            </div>
            <NavigationList data={last_used} />
          </React.Fragment>
        )}
      </div>*/
      }
    </LayoutMain>
  );
}

import { TimerReset } from "lucide-react";
import {
  Dialog,
  Modal,
  ModalContext,
  ModalOverlay,
} from "react-aria-components";

interface KeyboardModalTriggerProps {
  keyboardShortcut: string;
  children: React.ReactNode;
}

function KeyboardModalTrigger(props: KeyboardModalTriggerProps) {
  let [isOpen, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [props.keyboardShortcut]);

  return (
    <ModalContext.Provider value={{ isOpen, onOpenChange: setOpen }}>
      <Button
        variant="ghost"
        className={cn(
          "focus-visible:ring-0 sm:border outline-hidden relative w-full justify-start rounded-md font-normal text-muted-foreground shadow-none sm:pr-12 w-9 px-2 sm:w-36 sm:text-sm text-base",
        )}
        onPress={() => setOpen(true)}
        {...props}
      >
        <Search className="inline-flex sm:hidden text-primary" />
        <span className="hidden sm:inline-flex">Cari ...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.50rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-sm">⌘</span>K
        </kbd>
      </Button>
      {props.children}
    </ModalContext.Provider>
  );
}

const navigate_link = [
  ...muslimNavigationLink,
  ...toolsNavigationLink,
  {
    title: "Reset data",
    href: "/alat/clear-cache",
    description: "Reset data local",
    icon: TimerReset,
  },
  // {
  //   title: "Info",
  //   href: "/about",
  //   description: "Info website",
  //   icon: Info,
  // },
];

const CommandMenu = () => {
  const navigate = useNavigate();
  return (
    <KeyboardModalTrigger keyboardShortcut="/">
      <ModalOverlay
        isDismissable
        className={({ isEntering, isExiting }) =>
          cn(
            "fixed inset-0 z-50 bg-black/80",
            isEntering ? "animate-in fade-in duration-200 ease-out" : "",
            isExiting ? "animate-out fade-out duration-200 ease-in" : "",
          )}
      >
        <Modal
          className={({ isEntering, isExiting }) =>
            cn(
              "fixed sm:left-[50%] sm:top-[50%] z-50 w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] border-b sm:border-none bg-background sm:rounded-md inset-x-0 top-0 shadow-xl bg-background p-2 sm:p-0",
              isEntering ? "animate-in slide-in-from-top duration-200" : "",
              isExiting ? "animate-out slide-out-to-top duration-200" : "",
            )}
        >
          <Dialog
            aria-label="Command Menu"
            role="alertdialog"
            className="outline-hidden relative"
          >
            {({ close }) => (
              <>
                <div>
                  <Command className="rounded-lg border">
                    <CommandInput
                      placeholder="Cari menu..."
                      className="sm:text-sm text-base"
                    />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandSeparator />
                      <CommandGroup heading="Daftar menu">
                        {navigate_link.map((navItem, index) => (
                          <CommandItem
                            key={index}
                            value={navItem.title}
                            className="flex items-center gap-2.5 p-2.5"
                            onSelect={() => {
                              close();
                              navigate(navItem.href as string);
                            }}
                          >
                            <navItem.icon className="w-4 h-4" />
                            <span>{navItem.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </KeyboardModalTrigger>
  );
};
