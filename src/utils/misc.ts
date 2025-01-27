import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const lazyWrapper = (importFunction: () => Promise<any>) => {
  return async () => {
    const module = await importFunction();
    return {
      // fix hmr
      action: module.Action || undefined,
      loader: module.Loader || undefined,
      Component: module.Component || undefined,
    };
  };
};

export function lightDarkVar(baseName: string) {
  return `var(--theme-light, hsl(var(--${baseName}))) var(--theme-dark, hsl(var(--${baseName}-dark)))`;
}
