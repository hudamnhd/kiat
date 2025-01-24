import { ThemeProvider } from '#src/components/custom/theme-provider.tsx';
import {
  muslimNavigationLink,
  toolsNavigationLink,
} from '#src/constants/nav-link';
import { cn } from '#src/utils/misc';
import { TimerReset } from 'lucide-react';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet, useLocation } from 'react-router';
import ReloadPrompt from '../pwa/reload-prompt';
import { GlobalPendingIndicator } from './global-pending-indicator';

export default function ThemeProviderWrapper() {
  return (
    <ThemeProvider>
      <Toaster />
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
      id='container-main'
      className='border-x min-h-[calc(100vh)] sm:max-w-xl mx-auto relative'
    >
      <Outlet />
    </div>
  );
}

const navigate_link = [
  ...muslimNavigationLink,
  ...toolsNavigationLink,
  {
    title: 'Reset data',
    href: '/resources/reset',
    description: 'Reset data local',
    icon: TimerReset,
  },
];

const TrackLastRoutes = () => {
  const location = useLocation(); // Mendapatkan informasi route saat ini.

  React.useEffect(() => {
    const currentPath = location.pathname;

    const containerMain = document.getElementById('container-main');

    if (
      currentPath === '/tools/calculator' &&
      containerMain instanceof HTMLDivElement
    ) {
      containerMain.classList.remove('border-x', 'sm:max-w-xl');
    } else {
      if (!containerMain?.classList.contains('border-x')) {
        containerMain?.classList.add('border-x');
      }

      if (!containerMain?.classList.contains('sm:max-w-xl')) {
        containerMain?.classList.add('sm:max-w-xl');
      }
    }
    // Cek apakah currentPath cocok dengan salah satu href di muslimLinks.
    const matchedLink = navigate_link.find((link) => link.href === currentPath);

    if (matchedLink) {
      // Ambil daftar route terakhir dari localStorage.
      const lastRoutes = JSON.parse(
        localStorage.getItem('lastUsedRoutes') || '[]',
      );

      // Jika route sudah ada, hapus agar tidak ada duplikasi.
      const updatedRoutes = lastRoutes.filter(
        (route: string) => route !== matchedLink.href,
      );

      // Tambahkan route saat ini ke awal array.
      updatedRoutes.unshift(matchedLink.href);

      // Simpan hanya hingga maksimal 3 route terakhir.
      const limitedRoutes = updatedRoutes.slice(0, 5);

      // Simpan ke localStorage.
      localStorage.setItem('lastUsedRoutes', JSON.stringify(limitedRoutes));
    }
  }, [location.pathname]);

  return null;
};
