import Footer from '#src/components/custom/footer';
import { Header } from '#src/components/custom/header.tsx';
import { NavigationList } from '#src/components/custom/navigation-list.tsx';
import { toolsNavigationLink } from '#src/constants/nav-link';

export function Component() {
  const data = toolsNavigationLink;
  return (
    <>
      <Header redirectTo='/' title='Alat' />

      <div className='text-center pt-3'>
        <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]'>
          Alat
        </div>
        <p className='text-muted-foreground mt-1'>
          Alat bantu sehari-hari
        </p>
      </div>

      <NavigationList data={data} />
      <Footer />
    </>
  );
}
