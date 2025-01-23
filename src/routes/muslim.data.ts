import { get_cache, set_cache } from "#src/utils/cache-client.ts";
import { ActionFunctionArgs } from "react-router";
import type { AyatBookmark } from "#src/utils/bookmarks";

const SETTING_PREFS_KEY = "SETTING_PREFS_KEY";
const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

const default_value = {
	font_type: "font-lpmq-2",
	font_weight: "400",
	font_size: "text-2xl",
	font_translation: "on",
	font_latin: "on",
	font_tafsir: "on",
};

type Prefs = typeof default_value;

type DataLoader = {
	opts: Prefs;
	bookmarks: AyatBookmark[] | [];
	lastRead: AyatBookmark | null;
};

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const data = Object.fromEntries(formData);
	await set_cache(SETTING_PREFS_KEY, data);
	return data;
}

export async function loader() {
	const [prefs, bookmarks, lastRead] = await Promise.all([
		get_cache(SETTING_PREFS_KEY),
		get_cache(BOOKMARK_KEY),
		get_cache(LASTREAD_KEY),
	]);

	const opts = prefs || default_value;

	const data = {
		opts,
		bookmarks,
		lastRead,
	} as DataLoader;

	return data;
}
