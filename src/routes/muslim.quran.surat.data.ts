import {
  construct_key,
  get_cache,
  set_cache,
} from '#src/utils/cache-client.ts';
import ky from 'ky';
import type { LoaderFunctionArgs } from 'react-router';

export type Ayah = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

type Surah = Record<string, Ayah>; // Object with dynamic string keys

export default async function loader({ request, params }: LoaderFunctionArgs) {
  const CACHE_KEY = construct_key(request);
  const cached_data = await get_cache(CACHE_KEY);

  if (cached_data) return cached_data;

  // const api = ky.create({
  // 	prefixUrl:
  // 		"https://raw.githubusercontent.com/rioastamal/quran-json/refs/heads/master/surah",
  // });

  const api = ky.create({
    prefixUrl: 'quran/surah',
  });

  const { id } = params;
  const surah_number = id;

  if (!surah_number) {
    throw new Response('Not Found', { status: 404 });
  }

  const surah_data = await api.get(`${surah_number}.json`).json<Surah>();

  const parse = Object.values(surah_data);
  const ayah = parse[0];

  if (!ayah) {
    throw new Response('Not Found', { status: 404 });
  }

  const data = {
    ...ayah,
  };

  await set_cache(CACHE_KEY, data);
  return data;

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; utf-8',
    },
  });
}
