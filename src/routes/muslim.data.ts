import {
  BOOKMARK_KEY,
  LASTREAD_KEY,
  SETTING_PREFS_KEY,
} from "#src/constants/key.ts";
import { DEFAULT_PREFS } from "#src/constants/prefs";
import type { AyatBookmark } from "#src/utils/bookmarks";
import { getCache, setCache } from "#src/utils/cache-client.ts";
import { ActionFunctionArgs } from "react-router";

type Prefs = typeof DEFAULT_PREFS;

type DataLoader = {
  opts: Prefs;
  bookmarks: AyatBookmark[] | [];
  lastRead: AyatBookmark | null;
  lastReadV1: AyatBookmark | null;
};

export async function Action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  await setCache(SETTING_PREFS_KEY, data);
  return data;
}

export async function Loader() {
  const [prefs, bookmarks, lastRead, lastReadV1] = await Promise.all([
    getCache(SETTING_PREFS_KEY),
    getCache(BOOKMARK_KEY),
    getCache(LASTREAD_KEY),
    getCache(LASTREAD_KEY + "V1"),
  ]);

  const opts = prefs || DEFAULT_PREFS;

  const data = {
    opts,
    bookmarks,
    lastRead,
    lastReadV1,
  } as DataLoader;

  return data;
}
