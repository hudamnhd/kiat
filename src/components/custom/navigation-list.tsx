import { Link } from "react-router";
import { NavigationLink } from "#src/constants/nav-link";

export const NavigationList = ({ data }: { data: NavigationLink[] }) => {
	return (
		<div role="list" className="flex flex-col gap-2 p-2.5 sm:p-3">
			{data.map((item, itemIdx) => (
				<NavigationListItem key={itemIdx} i={itemIdx} item={item} />
			))}
		</div>
	);
};

export const NavigationListItem = ({
	item,
	i,
}: { i: number; item: NavigationLink }) => {
	return (
		<Link
			to={item.href}
			className="sm:animate-slide-top sm:[animation-fill-mode:backwards] flex shadow-sm rounded-md border group divide-x hover:shadow-primary"
			title={item.title}
			style={{ animationDelay: `${i * 0.07}s` }}
		>
			<div className="shrink-0 flex items-center justify-center w-14 text-sm font-medium rounded-l-md duration-300 bg-muted">
				<item.icon
					className="h-6 w-6 text-foreground  sm:group-hover:-rotate-45 sm:duration-300"
					aria-hidden="true"
				/>
			</div>
			<div className="flex-1 px-4 py-1.5 text-sm">
				<div className="font-semibold cursor-pointer sm:group-hover:text-base sm:duration-300">
					{item.title}
				</div>
				<p className="text-muted-foreground line-clamp-1 sm:group-hover:-mt-1 sm:duration-300">
					{item.description}
				</p>
			</div>
		</Link>
	);
};
