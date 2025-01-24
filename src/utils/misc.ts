import { clsx, type ClassValue } from "clsx";
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
