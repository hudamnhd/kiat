import { Header } from "#src/components/custom/header";
import { muslimNavigationLink } from "#src/constants/nav-link";
import { NavigationList } from "#src/components/custom/navigation-list.tsx";

export default function Example() {
	const data = muslimNavigationLink;

	return (
		<>
			<Header redirectTo="/" title="Muslim" />

			<div className="text-center pt-3">
				<div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
					Muslim
				</div>
				<p className="text-muted-foreground mt-1">
					Here's a list of apps ready to use!
				</p>
			</div>

			<NavigationList data={data} />
		</>
	);
}
