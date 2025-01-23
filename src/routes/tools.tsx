import { toolsNavigationLink } from "#src/constants/nav-link";
import { Header } from "#src/components/custom/header.tsx";
import { NavigationList } from "#src/components/custom/navigation-list.tsx";

export default function Tools() {
	const data = toolsNavigationLink;
	return (
		<>
			<Header redirectTo="/" title="Tools" />

			<div className="text-center pt-3">
				<div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
					Tools
				</div>
				<p className="text-muted-foreground mt-1">
					Here's a list of apps ready to use!
				</p>
			</div>

			<NavigationList data={data} />
		</>
	);
}
