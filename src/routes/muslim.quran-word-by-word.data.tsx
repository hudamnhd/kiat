import ky from "ky";
import { data as daftar_surat } from "#src/constants/daftar-surat.json";

type Word = {
	b: string; // bounding box width
	h: string; // bounding box height
	c: string; // Arabic text
	d: string; // Transliteration
	e: string; // English translation
};

type Ayat = {
	w: Word[]; // Array of words
	a: {
		g: string; // Global translation
	};
};

type Surah = Record<string, Ayat>; // Object with dynamic string keys

import { LoaderFunctionArgs } from "react-router";

export default async function loader({ params }: LoaderFunctionArgs) {
	const api = ky.create({
		prefixUrl:
			"https://raw.githubusercontent.com/qazasaz/quranwbw/refs/heads/master/surahs/data",
	});

	const { id } = params;

	const detail = daftar_surat?.find((d) => d.number === id);
	const surat = await api.get(`${id}.json`).json<Surah>();

	const ayats = Object.values(surat) as Ayat[];

	if (!surat) {
		throw new Response("Not Found", { status: 404 });
	}

	return { ayats, surat: detail };
}
