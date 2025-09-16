import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  return `var(--theme-light, hsl(var(--${baseName}))) var(--theme-dark, hsl(var(--${baseName}-dark))) var(--theme-sephia, hsl(var(--${baseName}-sephia)))`;
}


// https://dev.to/receter/usepersistentstate-3fn8
export function usePersistentState<Type>(
  key: string,
  initialState: Type | (() => Type),
): [Type, React.Dispatch<React.SetStateAction<Type>>] {
  const prefixedKey = "use-persistent-state-" + key;
  // read key from local storage if not found use default value
  const [value, setValue] = React.useState<Type>(() => {
    const storedValue = localStorage.getItem(prefixedKey);
    if (storedValue === null) {
      if (typeof initialState === "function") {
        return (initialState as () => Type)();
      } else {
        return initialState;
      }
    } else {
      return JSON.parse(storedValue);
    }
  });
  // update local storage when value changes
  React.useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [value, prefixedKey]);
  return [value, setValue];
}
