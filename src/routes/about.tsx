import { Header } from '#src/components/custom/header';
import { Link } from 'react-router';

export function Component() {
  return (
    <div className='prose-base dark:prose-invert w-full max-w-xl mx-auto border-x'>
      <Header redirectTo='/' title='About' />

      <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3'>
        About
      </div>

      <dl className='divide-y border-t -mt-1'>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>
            Developer
          </dt>
          <dd className='mt-1 pl-5 text-sm text-foreground'>
            <Link to='https://www.linkedin.com/in/hudamnhd/'>Huda</Link>
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>Nama</dt>
          <dd className='mt-1 pl-5 text-sm text-foreground'>Kiat</dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>
            Deskripsi
          </dt>
          <dd className='mt-1 pl-5 text-sm text-foreground'>
            Aplikasi sederhana untuk sehari-hari
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>
            Sumber API
          </dt>
          <dd className='text-sm text-foreground'>
            <ul className='marker:text-muted-foreground pl-5 list-disc list-inside'>
              <li className='break-all line-clam-1'>
                <Link to='https://tanzil.net/download'>
                  Al Quran per surah
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://api.myquran.com/v2/quran'>
                  Al Quran per halaman
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://api.myquran.com/v2/doa'>
                  Kumpulan doa berbagai sumber
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef'>
                  Doa Sehari-hari
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://github.com/wahyall/islamic-bit/blob/main/sholawat/sholawat.json'>
                  Sholawat
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://github.com/wahyall/islamic-bit/blob/main/sholawat/dzikir.json'>
                  Dzikir
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://islamic-api-zhirrr.vercel.app/api/tahlil'>
                  Tahlil
                </Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>
            Huruf Arab
          </dt>
          <dd className='mt-1 text-sm text-foreground'>
            <ul className='marker:text-muted-foreground pl-5 list-disc list-inside'>
              <li className='break-all line-clam-1'>
                <Link to='https://lajnah.kemenag.go.id/unduhan.html'>
                  Kemenag (LPMQ)
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://github.com/marwan/quranwbw/tree/main/static/fonts/indopak'>
                  Indopak
                </Link>
              </li>
              <li className='break-all line-clam-1'>
                <Link to='https://github.com/marwan/quranwbw/tree/main/static/fonts/hafs'>
                  Uthmani
                </Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>Stack</dt>
          <dd className='text-sm text-foreground'>
            <ul className='marker:text-muted-foreground pl-5 list-disc list-inside'>
              <li>
                <Link to='https://react.dev/'>React</Link>
              </li>
              <li>
                <Link to='https://remix.run'>React Router</Link>
              </li>
              <li>
                <Link to='https://vite.dev/'>Vite</Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>
            Dependencies
          </dt>

          <dd className='text-sm text-foreground'>
            <ul className='marker:text-muted-foreground pl-5 list-disc list-inside'>
              <li>
                <Link to='https://tailwindcss.com/'>Tailwind CSS</Link>
              </li>
              <li>
                <Link to='https://www.radix-ui.com/primitives'>Radix UI</Link>
              </li>
              <li>
                <Link to='https://ui.shadcn.com/'>Shadcn UI</Link>
              </li>
              <li>
                <Link to='https://react-spectrum.adobe.com/react-aria/index.html'>
                  React Aria Components
                </Link>
              </li>
              <li>
                <Link to='https://tanstack.com/virtual/latest'>
                  Tanstack Virtual
                </Link>
              </li>
              <li>
                <Link to='https://github.com/sindresorhus/ky'>Ky</Link>
              </li>
              <li>
                <Link to='https://lucide.dev/'>Lucide React</Link>
              </li>
              <li>
                <Link to='https://redux.js.org/'>Redux.js</Link>
              </li>
              <li>
                <Link to='https://motion.dev/'>Motion</Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>Deploy</dt>
          <dd className='mt-1 text-sm pl-5'>
            <Link to='https://netlify.com/'>Netlify</Link>
          </dd>
        </div>
        <div className='px-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>
            Components
          </dt>
          <dd className='mt-1 text-sm pl-5'>
            <Link to='/components'>Demo</Link>
          </dd>
        </div>
      </dl>
    </div>
  );
}
