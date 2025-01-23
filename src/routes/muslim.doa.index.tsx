import { Header } from "#src/components/custom/header";
import React from "react";
import {
	BookOpen,
	Scroll,
	CheckCircle,
	Activity,
	Circle,
	Heart,
	MapPin,
} from "lucide-react";

const sumber = [
	"quran",
	"hadits",
	"pilihan",
	"harian",
	"ibadah",
	"haji",
	"lainnya",
];

const sumberIcons = {
	quran: BookOpen,
	hadits: Scroll,
	pilihan: CheckCircle,
	harian: Activity,
	ibadah: Heart,
	haji: MapPin,
	lainnya: Circle,
};

import { NavigationList } from "#src/components/custom/navigation-list.tsx";

const data = sumber.map((d: string) => {
	const icon = d as keyof typeof sumberIcons;
	let _d = {
		title: `Do'a ${d}`,
		href: `/muslim/doa/${d}`,
		description: `Kumpulan Do'a ${d}`,
		icon: sumberIcons[icon] || Circle,
	};
	return _d;
});

export default function Route() {
	return (
		<React.Fragment>
			<Header redirectTo="/muslim" title="Kumpulan Do'a" />

			<div className="text-center pt-3">
				<div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
					Do'a
				</div>
				<p className="text-muted-foreground mt-1">Kumpulan do'a</p>
			</div>

			<NavigationList data={data} />
		</React.Fragment>
	);
}
