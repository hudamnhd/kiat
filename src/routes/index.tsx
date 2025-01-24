import { Button, buttonVariants } from '#src/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '#src/components/ui/command';

import { Header } from '#src/components/custom/header';
import { NavigationList } from '#src/components/custom/navigation-list.tsx';
import {
  muslimNavigationLink,
  NavigationLink,
  toolsNavigationLink,
} from '#src/constants/nav-link';
import { cn } from '#src/utils/misc';
import { BookOpenText, Copyright, Info, Search, Wrench } from 'lucide-react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

export default function Index() {
  const data = [...muslimNavigationLink, ...toolsNavigationLink];
  const [last_used, set_last_used] = React.useState<typeof data | []>([]);

  React.useEffect(() => {
    const lastUsedRoutes = JSON.parse(
      localStorage.getItem('lastUsedRoutes') || '[]',
    ) as [];

    if (lastUsedRoutes.length > 0) {
      const filteredLinks = lastUsedRoutes
        .map((route) => data.find((link) => link.href === route))
        .filter(Boolean);

      set_last_used(filteredLinks);
    }
  }, []);

  const mainMenu: NavigationLink[] = [
    {
      title: 'Muslim',
      href: '/muslim',
      description: 'Berisi Al-Quran, Sholawat dan doa sehari-hari',
      icon: BookOpenText,
    },
    {
      title: 'Tools',
      href: '/tools',
      description: 'Berisi calculator, todolist dan lain-lain',
      icon: Wrench,
    },
  ];

  const date = '__DATE__';
  return (
    <div className='flex flex-col justify-between border-x h-[calc(100vh)] max-w-xl mx-auto relative'>
      <div>
        <Header isIndex={true} redirectTo='/about' title='kiat'>
          <CommandMenu />
        </Header>
        <div className='text-center pt-3'>
          <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]'>
            Apps
          </div>
          <p className='text-muted-foreground mt-1'>
            Here's a list of apps ready to use!
          </p>
        </div>

        <NavigationList data={mainMenu} />

        <div className='pb-7'>
          {last_used.length > 0 && (
            <React.Fragment>
              <div className='px-3 mt-2 text-muted-foreground'>
                Terakhir digunakan
              </div>
              <NavigationList data={last_used} />
            </React.Fragment>
          )}
        </div>
      </div>
      <div className='flex items-center justify-between'>
        <div className='Home-built px-4 text-muted-foreground gap-1 text-xs [&_svg]:size-3 mb-1.5'>
          Built at : {date}
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: 'link' }),
            'text-muted-foreground gap-1 uppercase text-xs [&_svg]:size-3 mb-1.5',
          )}
          to='/about'
        >
          <Copyright /> 2025 Huda
        </Link>
      </div>
    </div>
  );
}

function NavbarMobile() {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <DialogTrigger type='modal'>
        <Button
          variant='ghost'
          className='focus-visible:ring-0 outline-hidden md:hidden -ml-2 mr-2 flex h-8 w-8 cursor-pointer items-center justify-center'
        >
          <Menu size={20} />
        </Button>
        <ModalOverlay
          isDismissable
          className={({ isEntering, isExiting }) =>
            cn(
              'fixed inset-0 z-50 bg-black/80',
              isEntering ? 'animate-in fade-in duration-300 ease-out' : '',
              isExiting ? 'animate-out fade-out duration-300 ease-in' : '',
            )}
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              cn(
                'fixed z-50 w-full bg-background sm:rounded-md inset-x-0 bottom-0 px-2 pb-4 outline-hidden',
                isEntering
                  ? 'animate-in slide-in-from-bottom duration-300'
                  : '',
                isExiting ? 'animate-out slide-out-to-bottom duration-300' : '',
              )}
          >
            <Dialog role='alertdialog' className='outline-hidden relative'>
              {({ close }) => (
                <>
                  <div className='w-fit mx-auto'>
                    <Button
                      onPress={close}
                      size='sm'
                      className='mt-4 mb-3 h-2 w-[100px] rounded-full bg-muted'
                    />
                  </div>
                  <nav className='flex flex-col items-start gap-0.5'>
                    {[...muslimNavigationLink, ...toolsNavigationLink].map(
                      (item) => (
                        <NavLink
                          onClick={() => {
                            navigate(item.href as string);
                            close();
                          }}
                          key={item.href}
                          to={item.href}
                          className={({ isActive }) =>
                            [
                              isActive ? 'font-semibold bg-muted' : '',
                              'font-medium transition-colors hover:text-primary w-full px-4 py-2 rounded-md flex items-center gap-x-2 text-sm',
                            ].join(' ')}
                        >
                          <item.icon size={16} className='flex-none' />
                          <span>{item.title}</span>
                        </NavLink>
                      ),
                    )}
                  </nav>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </React.Fragment>
  );
}

import { ModalContext } from 'react-aria-components';

interface KeyboardModalTriggerProps {
  keyboardShortcut: string;
  children: React.ReactNode;
}

function KeyboardModalTrigger(props: KeyboardModalTriggerProps) {
  let [isOpen, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
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

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [props.keyboardShortcut]);

  return (
    <ModalContext.Provider value={{ isOpen, onOpenChange: setOpen }}>
      <Button
        variant='ghost'
        className={cn(
          'focus-visible:ring-0 sm:border outline-hidden relative w-full justify-start rounded-md font-normal text-muted-foreground shadow-none sm:pr-12 w-9 px-2 sm:w-36 sm:text-sm text-base',
        )}
        onPress={() => setOpen(true)}
        {...props}
      >
        <Search className='inline-flex sm:hidden text-primary' />
        <span className='hidden sm:inline-flex'>Cari ...</span>
        <kbd className='pointer-events-none absolute right-[0.3rem] top-[0.50rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-sm'>⌘</span>K
        </kbd>
      </Button>
      {props.children}
    </ModalContext.Provider>
  );
}
import { Menu, TimerReset } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from 'react-aria-components';

const navigate_link = [
  ...muslimNavigationLink,
  ...toolsNavigationLink,
  {
    title: 'Reset data',
    href: '/resources/reset',
    description: 'Reset data local',
    icon: TimerReset,
  },
  {
    title: 'Info',
    href: '/about',
    description: 'Info website',
    icon: Info,
  },
];

const CommandMenu = () => {
  const navigate = useNavigate();
  return (
    <KeyboardModalTrigger keyboardShortcut='/'>
      <ModalOverlay
        isDismissable
        className={({ isEntering, isExiting }) =>
          cn(
            'fixed inset-0 z-50 bg-black/80',
            isEntering ? 'animate-in fade-in duration-200 ease-out' : '',
            isExiting ? 'animate-out fade-out duration-200 ease-in' : '',
          )}
      >
        <Modal
          className={({ isEntering, isExiting }) =>
            cn(
              'fixed sm:left-[50%] sm:top-[50%] z-50 w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] border-b sm:border-none bg-background sm:rounded-md inset-x-0 top-0 shadow-xl bg-background p-2 sm:p-0',
              isEntering ? 'animate-in slide-in-from-top duration-200' : '',
              isExiting ? 'animate-out slide-out-to-top duration-200' : '',
            )}
        >
          <Dialog
            aria-label='Command Menu'
            role='alertdialog'
            className='outline-hidden relative'
          >
            {({ close }) => (
              <>
                <div>
                  <Command className='rounded-lg border'>
                    <CommandInput
                      placeholder='Cari menu...'
                      className='sm:text-sm text-base'
                    />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandSeparator />
                      <CommandGroup heading='Daftar menu'>
                        {navigate_link.map((navItem, index) => (
                          <CommandItem
                            key={index}
                            value={navItem.title}
                            className='flex items-center gap-2.5 p-2.5'
                            onSelect={() => {
                              close();
                              navigate(navItem.href as string);
                            }}
                          >
                            <navItem.icon className='w-4 h-4' />
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
