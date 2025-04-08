import Footer from "#src/components/custom/footer";
import { Header } from "#src/components/custom/header";
import { NavigationList } from "#src/components/custom/navigation-list.tsx";
import { quranNavigationLink } from "#src/constants/nav-link";

export function Component() {
  const data = quranNavigationLink;

  return (
    <>
      <Header redirectTo="/" title="Qur'an" />

      <div className="flex flex-col justify-between h-[calc(100vh-60px)]">
        <main className="flex-1 px-4 mx-auto w-full space-y-4 sm:space-y-6">
          <div className="text-center pt-3 mb-1">
            <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
              Qur'an
            </div>
            <p className="text-muted-foreground">Menu Aplikasi Qur'an</p>
          </div>
          <NavigationList data={data} />
        </main>
        <Footer />
      </div>
    </>
  );
}
