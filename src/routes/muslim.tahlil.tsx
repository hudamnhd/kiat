import { Header } from '#src/components/custom/header';
import { fontSizeOpt } from '#src/constants/prefs';
import { data } from '#src/constants/tahlil.json';
import { cn } from '#src/utils/misc';
import { useRouteLoaderData } from 'react-router';

export function Component() {
  const loaderRoot = useRouteLoaderData('muslim');
  const opts = loaderRoot?.opts || {};
  const tahlil = data;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  return (
    <div className='prose-base dark:prose-invert w-full max-w-xl mx-auto border-x'>
      <Header redirectTo='/muslim' title='Tahlil' />
      <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3'>
        Tahlil
      </div>

      {tahlil.map((ayat, index) => {
        const arabicContent = ayat?.arabic;
        const translateContent = ayat?.translation;
        return (
          <div key={index} className='group relative p-4 border-t'>
            <div>
              <div className='font-semibold text-lg leading-6'>
                {ayat.title}
              </div>
            </div>
            <div className='w-full text-right flex gap-x-2.5 items-start justify-end'>
              <div
                className={cn(
                  'relative text-right text-primary my-5 font-lpmq',
                  opts?.font_type,
                )}
                style={{
                  fontWeight: opts.font_weight,
                  fontSize: font_size_opts?.fontSize || '1.5rem',
                  lineHeight: font_size_opts?.lineHeight || '3.5rem',
                }}
              >
                {arabicContent}
              </div>
            </div>
            {opts?.font_translation === 'on' && (
              <div
                className='translation-text prose dark:prose-invert leading-6 max-w-none'
                dangerouslySetInnerHTML={{
                  __html: translateContent,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
