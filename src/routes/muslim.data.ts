import { get_cache, set_cache } from "#src/utils/cache-client.ts";

const SETTING_PREFS_KEY = "SETTING_PREFS_KEY";

const default_value = {
	font_type: "font-lpmq-2",
	font_weight: "400",
	font_size: "text-2xl",
	font_translation: "on",
	font_latin: "on",
	font_tafsir: "on",
};

export default async function loader() {
	const prefs = await get_cache(SETTING_PREFS_KEY);
	const data = { opts: prefs ? prefs : default_value };

	return data;
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			"Content-Type": "application/json; utf-8",
		},
	});
}
