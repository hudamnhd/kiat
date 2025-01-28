import { Header } from '#src/components/custom/header';
import { buttonVariants } from '#src/components/ui/button';
import { data } from '#src/constants/dzikr.ts';
import { fontSizeOpt } from '#src/constants/prefs';
import { cn } from '#src/utils/misc';
import { Moon, Plus, Sun } from 'lucide-react';
import React from 'react';
import { useRouteLoaderData } from 'react-router';

function getWaktuSekarang(): string {
  const currentHour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)

  if (currentHour >= 3 && currentHour < 15) {
    return 'pagi'; // Jam 3 pagi hingga jam 3 sore
  } else {
    return 'petang'; // Jam 3 sore hingga jam 3 pagi
  }
}

const time = getWaktuSekarang();

export function Component() {
  const { dzikr } = data;
  const loaderRoot = useRouteLoaderData('muslim');
  const opts = loaderRoot?.opts || {};

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  React.useEffect(() => {
    const buttons = document.querySelectorAll('.tasbih-counter-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const counterDisplay = event.target
          ?.closest('.tasbih-counter-container')
          .querySelector('.counter-display');
        const currentValue = parseInt(counterDisplay.textContent || '0', 10);
        counterDisplay.textContent = (currentValue + 1).toString(); // Increment counter
      });
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener('click', () => {});
      });
    };
  }, []);

  return (
    <div className='prose-base dark:prose-invert w-full max-w-xl mx-auto border-x'>
      <Header redirectTo='/muslim' title={`Dzikir ${time}`} />
      <div className='flex items-center gap-x-3 justify-center text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3'>
        <span>Dzikir {time}</span>
      </div>

      {time === 'pagi'
        ? (
          <div>
            {dzikr
              .filter((d) => d.time === '' || d.time === 'pagi')
              .map((ayat, index) => {
                const fontWeight = opts.font_weight;
                const fontSize = font_size_opts?.fontSize || '1.5rem';
                const lineHeight = font_size_opts?.lineHeight || '3.5rem';
                const content =
                  `<div style="font-weight:  ${fontWeight}; font-size: ${fontSize}; line-height:  ${lineHeight};" class="font-lpmq">`;
                const arabicContent = ayat?.arabic
                  .replace(/@/g, '\n')
                  .replace(/<p>/g, content);
                const translateContent = ayat?.translated_id
                  .replace(/@/g, '<br/><br/>')
                  .replace(/(\.)(\s|$)/g, '$1<br />');
                return (
                  <div
                    key={index}
                    className='group tasbih-counter-container relative p-4 sm:p-5 border-t'
                  >
                    <div>
                      <div className='space-y-0.5'>
                        <div className='font-medium leading-none'>
                          {ayat.title}
                        </div>
                        <div className='flex items-center gap-x-1 text-muted-foreground italic text-sm'>
                          {ayat?.note && (
                            <span className='italic'>{ayat.note}</span>
                          )}

                          {ayat.time !== '' && 'Setiap '}
                          {ayat.time === 'pagi'
                            ? (
                              <span className='flex items-center gap-x-1.5 text-sm'>
                                <span className='italic'>Pagi</span>
                                <Sun className='w-4 h-4 rotate-0 transition-all' />
                              </span>
                            )
                            : (
                              ayat.time === 'petang' && (
                                <span className='flex items-center gap-x-1.5 text-sm'>
                                  <span className='italic'>Petang</span>
                                  <Moon className='w-4 h-4 rotate-0 transition-all' />
                                </span>
                              )
                            )}
                        </div>
                      </div>
                    </div>
                    <div className='w-full text-right flex gap-x-2.5 items-start justify-end'>
                      <span
                        className={cn(
                          'relative text-right text-primary font-lpmq',
                        )}
                        style={{
                          fontWeight: opts.font_weight,
                          fontSize: font_size_opts?.fontSize || '1.5rem',
                          lineHeight: font_size_opts?.lineHeight || '3.5rem',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: arabicContent,
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-end gap-4 mt-2'>
                      <span className='counter-display text-2xl font-bold'>
                        0
                      </span>
                      <button
                        className={cn(
                          buttonVariants({ size: 'icon', variant: 'outline' }),
                          'tasbih-counter-btn',
                        )}
                      >
                        <Plus />
                      </button>
                    </div>
                    {opts?.font_translation === 'on' && (
                      <div className=''>
                        <div className='translation-text'>
                          <div
                            className='max-w-none prose dark:prose-invert text-primary'
                            dangerouslySetInnerHTML={{
                              __html: translateContent,
                            }}
                          />
                        </div>

                        <p className='max-w-none  prose dark:prose-invert pl-3 border-l-2'>
                          {ayat.faedah}
                        </p>
                        <div className='max-w-none prose-sm dark:prose-invert text-muted-foreground'>
                          {ayat.narrator}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )
        : (
          <div>
            {dzikr
              .filter((d) => d.time === '' || d.time === 'petang')
              .map((ayat, index) => {
                const fontWeight = opts.font_weight;
                const fontSize = font_size_opts?.fontSize || '1.5rem';
                const lineHeight = font_size_opts?.lineHeight || '3.5rem';
                const content =
                  `<div style="font-weight:  ${fontWeight}; font-size: ${fontSize}; line-height:  ${lineHeight};" class="${opts?.font_type}">`;
                const arabicContent = ayat?.arabic
                  .replace(/@/g, '\n')
                  .replace(/<p>/g, content);
                const translateContent = ayat?.translated_id
                  .replace(/@/g, '<br/><br/>')
                  .replace(/(\.)(\s|$)/g, '$1<br />');
                return (
                  <div
                    key={index}
                    className='group tasbih-counter-container relative p-4 sm:p-5 border-t'
                  >
                    <div>
                      <div className='space-y-0.5 mb-1'>
                        <div className='font-medium leading-none'>
                          {ayat.title}
                        </div>
                        <div className='flex items-center gap-x-1 text-muted-foreground'>
                          {ayat?.note && (
                            <span className=''>
                              {ayat.note.replace(/@/, '')}
                            </span>
                          )}

                          {ayat.time !== '' && 'Setiap '}
                          {ayat.time === 'pagi'
                            ? (
                              <span className='flex items-center gap-x-1.5 text-sm'>
                                <span className='italic'>Pagi</span>
                                <Sun className='w-4 h-4 rotate-0 transition-all' />
                              </span>
                            )
                            : (
                              ayat.time === 'petang' && (
                                <span className='flex items-center gap-x-1.5 text-sm'>
                                  <span className='italic'>Petang</span>
                                  <Moon className='w-4 h-4 rotate-0 transition-all' />
                                </span>
                              )
                            )}
                        </div>
                      </div>
                    </div>
                    <div className='w-full text-right flex gap-x-2.5 items-start justify-end'>
                      <span
                        className={cn(
                          'relative text-right text-primary font-lpmq',
                          opts?.font_type,
                        )}
                        style={{
                          fontWeight: opts.font_weight,
                          fontSize: font_size_opts?.fontSize || '1.5rem',
                          lineHeight: font_size_opts?.lineHeight || '3.5rem',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: arabicContent,
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-end gap-4 mt-2'>
                      <span className='counter-display text-2xl font-bold'>
                        0
                      </span>
                      <button
                        className={cn(
                          buttonVariants({ size: 'icon', variant: 'outline' }),
                          'tasbih-counter-btn',
                        )}
                      >
                        <Plus />
                      </button>
                    </div>
                    {opts?.font_translation === 'on' && (
                      <div className=''>
                        <div className='translation-text'>
                          <div
                            className='max-w-none prose dark:prose-invert text-primary'
                            dangerouslySetInnerHTML={{
                              __html: translateContent,
                            }}
                          />
                        </div>

                        <details
                          className={cn(
                            'group [&_summary::-webkit-details-marker]:hidden py-2',
                          )}
                        >
                          <summary className='flex cursor-pointer items-center gap-1.5 outline-hidden w-full justify-start'>
                            <div className='font-medium text-sm text-indigo-600 dark:text-indigo-400'>
                              Fadilah
                            </div>

                            <svg
                              className='size-4 shrink-0 transition duration-300 group-open:-rotate-180 text-indigo-600 dark:text-indigo-400 opacity-80'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          </summary>

                          <div className='font-normal group-open:animate-slide-top group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300 mt-2'>
                            <div className='text-justify max-w-none prose leading-6 dark:prose-invert whitespace-pre-wrap mb-2'>
                              {ayat.faedah.replace(/(\[.*?\])/g, '\n\n$1')}
                            </div>
                            {/*<TafsirText text={surat.tafsir.id.kemenag.text[key]} />*/}
                            <div className='text-muted-foreground text-sm whitespace-pre-wrap'>
                              {ayat.narrator.replace(/@/g, '\n')}
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
    </div>
  );
}
