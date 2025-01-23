import { buttonVariants } from "#src/components/ui/button";
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { Badge } from "#src/components/ui/badge";
import { motion, useSpring, useScroll } from "framer-motion";
import { cn } from "#src/utils/misc";
import Fuse, { FuseOptionKey } from "fuse.js";
import { Header } from "#src/components/custom/header";
import { Search as SearchIcon, Puzzle, MoveRight } from "lucide-react";
import { useLoaderData, Link } from "react-router";
import { Dot } from "lucide-react";
import { Spinner } from "#src/components/ui/spinner-circle";
import React, { JSX, useMemo, useState } from "react";
import lodash from "lodash";
import quranIndexLoader from "./muslim.quran.index.data";

interface SearchProps<T> {
	data: T[];
	searchKey: FuseOptionKey<T>[] | undefined;
	query: string;
	render: (
		filteredData: {
			item: T;
		}[],
	) => JSX.Element;
}

function SearchHandler<T>({ data, searchKey, query, render }: SearchProps<T>) {
	const options = {
		includeScore: false,
		keys: searchKey,
	};
	const fuse = new Fuse(data, options);
	const filteredData = useMemo(() => {
		if (!query)
			return data.map((d) => {
				return { item: { ...d } };
			});
		return fuse.search(query);
	}, [data, searchKey, query]);

	return render(filteredData);
}

import { useVirtualizer } from "@tanstack/react-virtual";

import {
	Select,
	SelectItem,
	SelectListBox,
	SelectPopover,
	SelectTrigger,
	SelectValue,
} from "#src/components/ui/select";

export function Component() {
	const { surat, juz_amma } = useLoaderData<typeof quranIndexLoader>();
	const [input, setInput] = useState("");
	const [query, setQuery] = useState("");

	const handleSearch = useMemo(
		() =>
			lodash.debounce((value: string) => {
				setQuery(value);
				document.getElementById("loading-indicator")?.classList.add("hidden");
			}, 300),
		[],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
		handleSearch(e.target.value);
		document.getElementById("loading-indicator")?.classList.remove("hidden");
	};

	let [version, setVersion] = React.useState("all");
	const data_surat = version === "all" ? surat : juz_amma;
	const data_placeholder =
		version === "all" ? "Cari Surat.." : "Cari Surat Juz Amma..";

	const selectedIds = ["87", "67", "36", "75", "18", "48", "55"]; // Daftar ID yang ingin ditampilkan

	const menu = (
		<TooltipTrigger defaultOpen={true} delay={300}>
			<Select
				aria-label="Select Type List"
				className="text-lg font-semibold min-w-[120px]"
				placeholder="Daftar Surat"
				selectedKey={version}
				onSelectionChange={(selected) => setVersion(selected as string)}
			>
				<SelectTrigger className="data-focused:outline-hidden data-focused:ring-none data-focused:ring-0 data-focus-visible:outline-hidden data-focus-visible:ring-none data-focus-visible:ring-0 border-none shadow-none p-0 [&_svg]:opacity-80 [&_svg]:size-[14px]">
					<SelectValue className="text-lg font-semibold" />
				</SelectTrigger>
				<SelectPopover>
					<SelectListBox>
						<SelectItem id="all" textValue="Al-Quran">
							Al-Quran
						</SelectItem>
						<SelectItem id="j30" textValue="Jus Amma">
							Jus Amma
						</SelectItem>
					</SelectListBox>
				</SelectPopover>
			</Select>
			<Tooltip placement="bottom">
				<p>Juz Amma / Semua Juz</p>
			</Tooltip>
		</TooltipTrigger>
	);
	return (
		<>
			<Header redirectTo="/muslim" title="Daftar Surat" menu={menu}>
				<Link
					className={cn(
						buttonVariants({ size: "icon", variant: "outline" }),
						"prose-none [&_svg]:size-6 mr-0.5",
					)}
					to="/muslim/quran-v2/1"
					title="Al-Quran Per halaman"
				>
					V2
				</Link>
			</Header>
			<LastRead />

			<div className="px-1.5 mt-1.5 border-b pb-1.5">
				<div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
					Surat Favorit
				</div>

				<div className="flex max-w-xl overflow-x-auto gap-1.5 mt-1 pb-2">
					{surat
						.filter((navItem) => selectedIds.includes(navItem.number))
						.map((item) => {
							const to = `/muslim/quran/${item.number}`;
							return (
								<Link
									key={item.number}
									to={to}
									className="col-span-1 flex shadow-xs rounded-md hover:bg-accent"
								>
									<div className="flex-1 flex items-center justify-between border  rounded-md truncate">
										<div className="flex-1 px-2.5 py-2 text-sm truncate">
											<div className="font-semibold cursor-pointer">
												<span className="font-semibold">
													{item.number}. {item.name_id}
												</span>{" "}
											</div>
											<p className="text-muted-foreground line-clamp-1">
												{item.translation_id}

												<span className="sm:inline-flex hidden ml-1 text-xs">
													<span className="mr-l">
														{" "}
														{item.number_of_verses} ayat
													</span>
												</span>
											</p>
										</div>
									</div>
								</Link>
							);
						})}
				</div>
			</div>
			<div className="relative mb-1">
				<input
					id="input-26"
					className="h-10 peer pe-9 ps-9 outline-hidden focus-visible:ring-2 focus-visible:ring-ring border-b w-full text-sm p-3 bg-background"
					placeholder={data_placeholder}
					type="search"
					value={input}
					onChange={handleInputChange}
				/>
				<SearchIcon
					size={16}
					strokeWidth={2}
					className="pointer-events-none absolute inset-y-3 start-3 peer-focus:rotate-90 text-muted-foreground/80 peer-disabled:opacity-50 duration-300"
				/>
				<div
					id="loading-indicator"
					className="hidden absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-colors"
				>
					<Spinner className="size-5" />
				</div>
			</div>

			<SearchHandler
				data={data_surat}
				searchKey={["name_id", "number", "translation_id"]}
				query={query}
				render={(filteredData) => {
					if (filteredData.length > 0) {
						return <VirtualizedListSurah items={filteredData} />;
					} else {
						return (
							<div className="py-6 text-center text-sm h-[calc(100vh-290px)] border-b flex items-center justify-center">
								Surat tidak ditemukan.
							</div>
						);
					}
				}}
			/>
			<Link
				to="/muslim/quran-word-by-word"
				className="p-3 flex items-center justify-center gap-x-2 bg-muted/30 text-sm [&_svg]:size-4 font-medium"
			>
				<Puzzle /> Susun Ayat{" "}
				<Badge className="bg-lime-400 hover:bg-lime-500 text-black">New</Badge>
			</Link>
		</>
	);
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({ items }) => {
	const parentRef = React.useRef<HTMLDivElement>(null);

	// Gunakan useVirtualizer
	const rowVirtualizer = useVirtualizer({
		count: items.length, // Jumlah total item
		getScrollElement: () => parentRef.current, // Elemen tempat scrolling
		estimateSize: () => 56, // Perkiraan tinggi item (70px)
	});

	const { scrollYProgress } = useScroll({
		container: parentRef,
	});

	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	return (
		<React.Fragment>
			<motion.div
				className="z-60 bg-linear-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400 max-w-xl mx-auto"
				style={{
					scaleX,
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: 5,
					originX: 0,
				}}
			/>
			<div
				ref={parentRef}
				className="h-[calc(100vh-290px)] border-b"
				style={{
					overflow: "auto",
				}}
			>
				<div
					className="divide-y"
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const item = items[virtualRow.index].item;

						const to = `/muslim/quran/${item.number}`;
						return (
							<div
								key={virtualRow.key}
								ref={rowVirtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<Link
									to={to}
									className={cn(
										"relative flex cursor-pointer select-none items-start px-3 py-2 outline-hidden hover:bg-accent hover:text-accent-foreground text-sm",
									)}
								>
									{item.number}.
									<div>
										<span className="font-semibold ml-1">{item.name_id}</span>{" "}
										<span className="opacity-80">({item.translation_id})</span>
										<div className="ml-1 flex items-center text-muted-foreground gap-1 sm:text-sm text-xs">
											<span>{item.revelation_id}</span>
											<div className="w-2 relative">
												<Dot className="absolute -left-2 -top-3" />
											</div>
											<span>{item.number_of_verses} ayat</span>
										</div>
									</div>
									<div className="sm:block hidden ml-auto font-lpmq-2 text-xl text-primary text-right my-auto">
										{item.name_short}
									</div>
								</Link>
							</div>
						);
					})}
				</div>
			</div>
		</React.Fragment>
	);
};

import { get_cache } from "#src/utils/cache-client.ts";
const LASTREAD_KEY = "LASTREAD";

const LastRead = () => {
	const [lastRead, setLastRead] = React.useState<{
		source: string;
		title: string;
	} | null>(null);

	React.useEffect(() => {
		const load_bookmark_from_lf = async () => {
			const storedLastRead = await get_cache(LASTREAD_KEY);
			if (storedLastRead !== null) {
				setLastRead(storedLastRead);
			}
		};

		load_bookmark_from_lf();
	}, []);

	if (!lastRead)
		return (
			<div className="p-3 border-b flex items-center gap-x-3 bg-background w-full">
				<p className="text-sm text-center mx-auto">Baca quran, Yuk!</p>
			</div>
		);

	return (
		<Link
			to={lastRead.source}
			className="p-3 border-b flex items-center gap-x-3 bg-muted"
		>
			<p className="text-sm">Lanjutkan Membaca {lastRead.title} </p>
			<MoveRight className={cn("h-4 w-4 bounce-left-right opacity-80")} />
		</Link>
	);
};
