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
import { useNavigate } from "react-router";

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
    muslimNavigationLink[1],
    {
      title: "Muslim",
      href: "/muslim",
      description: "Berisi " + muslim_desc,
      icon: BookOpenText,
    },
    {
      title: "Alat",
      href: "/alat",
      description: "Berisi " + tools_desc,
      icon: Wrench,
    },
  ];

  const date = "__DATE__";
  return (
    <LayoutMain>
      <Header isIndex={true} redirectTo="/about" title="kiat">
        <CommandMenu />
      </Header>
      <div className="text-center pt-3 mb-1.5">
        <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          Kiat
        </div>
      </div>

      {
        /*<ul className='mt-5 px-2 gap-x-2 gap-y-4 grid grid-cols-4 sm:grid-cols-5  place-items-start'>
          {data.map((item, i) => (
            <li
              key={item.href}
              className={cn(
                'animate-roll-reveal [animation-fill-mode:backwards] w-fit mx-auto',
              )}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <a
                href={item.href}
                className='grid size-14 place-items-center rounded-2xl ring ring-primary/30 bg-gradient-to-tr from-primary/30 via-muted to-primary/30 transition hover:-rotate-6 hover:bg-accent mx-auto'
              >
                <item.icon size={30} className='' />
              </a>

              <div className='text-center text-sm sm:duration-300 mt-1'>
                {item.title}
              </div>
            </li>
          ))}
        </ul>*/
      }
      <NavigationList data={mainMenu} />

      <div className="pb-7">
        {last_used.length > 0 && (
          <React.Fragment>
            <div className="px-3 mt-1 text-muted-foreground">
              Terakhir digunakan
            </div>
            <NavigationList data={last_used} />
          </React.Fragment>
        )}
      </div>
      <Footer />
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
  {
    title: "Info",
    href: "/about",
    description: "Info website",
    icon: Info,
  },
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
