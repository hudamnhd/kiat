import React from "react";
import { ScrollToFirstIndex } from "#src/components/custom/scroll-to-top.tsx";
import { Badge } from "#src/components/ui/badge";
import { cn } from "#src/utils/misc";
import { useRouteLoaderData, Link } from "react-router";
import { BookOpen } from "lucide-react";
import { data as data_doa } from "#src/constants/doa-sehari-hari.ts";
import { Header } from "#src/components/custom/header";
import { fontSizeOpt } from "#src/constants/prefs";
import { useVirtualizer } from "@tanstack/react-virtual";

function App() {
	const loaderData = data_doa;
	const loaderRoot = useRouteLoaderData("root");
	const opts = loaderRoot?.opts || {};
	const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
	const parentRef = React.useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: loaderData.length, // Jumlah total item
		getScrollElement: () => parentRef.current, // Elemen tempat scrolling
		estimateSize: () => 35,
	});

	const scrollToFirstAyat = () => {
		rowVirtualizer.scrollToIndex(0, {
			align: "center",
		});
	};
	return (
		<div className="w-full max-w-xl mx-auto border-x">
			<Header redirectTo="/muslim" title="Do'a Sehari-hari" />
			<div
				ref={parentRef}
				style={{
					overflow: "auto",
				}}
				className="h-[calc(100vh-57px)] prose dark:prose-invert max-w-4xl mx-auto"
			>
				<div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
					Do'a Sehari-hari
				</div>
				<div className="w-fit mx-auto -mt-3">
					<Link
						className="text-sm"
						to="https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef"
						target="_blank"
					>
						Source data
					</Link>
				</div>

				<div
					className="space-y-0.5 py-2"
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const dt = loaderData[virtualRow.index];
						const index = virtualRow.index;
						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<div className="border-t" key={index}>
									<div className={cn("group relative py-4 px-4 sm:px-5")}>
										<div className="w-full text-right flex gap-x-2.5 items-center justify-between">
											<div className="flex items-center gap-x-3">
												<div className="bg-linear-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl">
													<BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
												</div>
												<div className="grid text-left gap-0.5">
													<span className="text-lg font-medium">
														{dt.judul}
													</span>
													<div className="flex flex-wrap gap-1">
														{dt.tag.map((tag) => (
															<Badge
																variant="outline"
																className="text-xs"
																key={tag}
															>
																#{tag}
															</Badge>
														))}
													</div>
												</div>
											</div>
										</div>
										<div className="w-full text-right flex gap-x-2.5 items-end justify-end">
											<div
												className={cn(
													"relative text-right text-primary my-5 font-lpmq",
												)}
												style={{
													fontWeight: opts.font_weight,
													fontSize: font_size_opts?.fontSize || "1.5rem",
													lineHeight: font_size_opts?.lineHeight || "3.5rem",
												}}
											>
												{dt.arab}
											</div>
										</div>

										{opts?.font_latin === "on" && (
											<div
												className="latin-text prose dark:prose-invert max-w-none leading-6"
												dangerouslySetInnerHTML={{
													__html: dt.latin,
												}}
											/>
										)}

										{opts?.font_translation === "on" && (
											<div
												className="translation-text mt-3 prose dark:prose-invert max-w-none leading-6 text-primary"
												dangerouslySetInnerHTML={{
													__html: dt.arti,
												}}
											/>
										)}

										{dt.footnote && (
											<div className="note-text mt-3">
												<div
													className="border-l-2 max-w-none prose dark:prose-invert  ml-1.5 px-2.5 text-sm"
													dangerouslySetInnerHTML={{
														__html: dt.footnote,
													}}
												/>
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<ScrollToFirstIndex
				handler={scrollToFirstAyat}
				container={parentRef}
				className="bottom-3"
			/>
		</div>
	);
}

export default function Route() {
	return <App />;
}
