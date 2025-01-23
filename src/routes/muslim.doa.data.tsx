import ky from "ky";
import type { LoaderFunctionArgs } from "react-router";

const sumber = [
	"quran",
	"hadits",
	"pilihan",
	"harian",
	"ibadah",
	"haji",
	"lainnya",
];

export type ResponseData = {
	status: boolean;
	request: {
		path: string;
	};
	data: Datum[];
};

export type Datum = {
	arab: string;
	indo: string;
	judul: string;
	source: "quran";
};

export default async function loader({ params }: LoaderFunctionArgs) {
	const { source } = params;

	if (!source) {
		throw new Error("404: Source not found");
	}

	if (!sumber.includes(source)) {
		throw new Error("404: Source not found");
	}

	const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/doa/sumber" });
	const data = await api.get(source).json<ResponseData>();

	if (!data.status) {
		throw new Response("Not Found", { status: 404 });
	}

	return {
		label: data.request.path.replace(/\//g, " ").replace(/sumber/gi, ""), // Ganti '/' dengan spasi
		source: data.request.path.replace(/\//g, " ").trim().split(" ").pop(),
		data: data.data,
	};
}
