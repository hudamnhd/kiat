import type { LoaderFunctionArgs } from "react-router";
import { data as daftar_surat } from "#src/constants/daftar-surat.json";

export default async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params;

	const data = {
		id,
		surat: daftar_surat,
		juz_amma: daftar_surat.filter((surat) => parseInt(surat.number) >= 78),
	};

	return data;
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			"Content-Type": "application/json; utf-8",
		},
	});
}
