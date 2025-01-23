import { ThemeProvider } from "#src/components/custom/theme-provider.tsx";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";
import { GlobalPendingIndicator } from "./global-pending-indicator";
import ReloadPrompt from "../pwa/reload-prompt";

export default function ThemeProviderWrapper() {
	return (
		<ThemeProvider>
			<Toaster />
			<Outlet />
			<GlobalPendingIndicator />
			<ReloadPrompt />
		</ThemeProvider>
	);
}

export function Layout() {
	return (
		<div className="border-x min-h-[calc(100vh)] sm:max-w-xl mx-auto">
			<Outlet />
		</div>
	);
}
