import { ThemeProvider } from "#src/components/custom/theme-provider.tsx";
import { Outlet } from "react-router";

export default function ThemeProviderWrapper() {
	return (
		<ThemeProvider>
			<Outlet />
		</ThemeProvider>
	);
}

export function Layout() {
	return (
		<div className="border-x min-h-[calc(100vh)] max-w-xl mx-auto">
			<Outlet />
		</div>
	);
}
