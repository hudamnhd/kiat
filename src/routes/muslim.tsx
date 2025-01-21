// import { DisplaySetting } from "#src/routes/resources+/prefs";
import { cn } from "#src/utils/misc";
import { Header } from "#src/components/custom/header";
import { buttonVariants } from "#src/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { muslimLinks } from "#src/constants/nav-link";
import { useNavigate, Link } from "react-router";

export default function Example() {
	const data = muslimLinks;
	const navigate = useNavigate();

	return (
		<div className="border-x min-h-[calc(100vh)] max-w-xl mx-auto pb-2">
			<Header redirectTo="/" title="Muslim" />
			<div className="text-center pt-3">
				<div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] bg-primary/50">
					Muslim
				</div>
				<p className="text-muted-foreground mt-1">
					Here's a list of apps ready to use!
				</p>
			</div>

			<ul role="list" className="grid grid-cols-1 gap-2 p-2.5 sm:p-3">
				{data.map((action, actionIdx) => (
					<li
						onClick={() => navigate(action.href)}
						key={actionIdx}
						className="col-span-1 flex shadow-sm rounded-md hover:bg-accent cursor-pointer"
					>
						<div className="flex-shrink-0 flex items-center justify-center w-16 text-sm font-medium rounded-l-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
							<action.icon className="h-5 w-5" aria-hidden="true" />
						</div>
						<div className="flex-1 flex items-center justify-between border-t border-r border-b  rounded-r-md truncate">
							<div className="flex-1 px-4 py-2 text-sm truncate">
								<div className="font-semibold hover:text-muted-foreground cursor-pointer">
									{action.title}
								</div>
								<p className="text-muted-foreground line-clamp-1">
									{action.description}
								</p>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
